// 第九埠頭のルームサーバー。
// ルーム番号（4桁）ごとに Durable Object を1つ持ち、そこへ全員が WebSocket でつなぐ。
// ルームの中身（モード・マップ・枠・ホスト・試合中かどうか）はここが決め、全員に配る。
// 試合中の位置や射撃は "S" で始まる文字列で届き、中身は見ずに送り主の番号を付けて他の全員へ流す。
// /home はホーム画面（タイトル画面）のチャットとルーム一覧。Durable Object を1つだけ使い、ホーム画面を開いている全員がつなぐ。
// 各ルームは、中身が変わったとき（と1分ごと）に、自分の概要をこの Durable Object へ知らせる。
import { DurableObject } from 'cloudflare:workers';

const MAX = 8;                     // ひとつのルームに入れる人数
const SLOTS = [8, 8, 6, 8, 8];     // モードごとの枠の数：1v1v…, 2v2v…, 3v3, 4v4, 協力
const SIZE = [1, 2, 3, 4, 8];      // 1チームの人数
const MAPS = 5;
const GRACE = 20000;               // 回線が切れた人の枠を取っておく時間
const STALE = 75000;               // これだけ ping が来なければ回線は死んでいる（裏に回したタブのタイマーは1分に1回まで落ちるので、それより長く）
const TICK = 15000;                // 人がいるあいだの見回りの間隔
const BEAT = 600000;               // ルームがホームの一覧へ「まだある」と知らせる間隔（変化がなくても）。1回＝1リクエストなので長めに
const GONE = 1500000;              // これだけ知らせがないルームは一覧から外す（消えたことを知らせられなかったルーム用）
const HOME_TICK = 60000;           // ホームの見回りの間隔（1回＝1リクエスト）

const clean = (v, n) => Array.from(String(v || '').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g, '').trim()).slice(0, n).join('');

// 枠を埋める順番。2人組はチームごとに、ほかはチームをまたいで交互に（人数がそろうように）
function order(mode) {
  const n = SLOTS[mode], size = SIZE[mode], teams = n / size, out = [];
  if (size <= 2 || teams === 1) for (let s = 0; s < n; s++) out.push(s);
  else for (let j = 0; j < size; j++) for (let t = 0; t < teams; t++) out.push(t * size + j);
  return out;
}
function place(r, list) { const ord = order(r.mode); list.forEach((m, i) => { m.slot = i < ord.length ? ord[i] : -1; }); }

export default {
  async fetch(req, env) {
    const url = new URL(req.url), m = url.pathname.match(/^\/room\/(\d{4})$/);
    if (url.pathname === '/home') {
      if (req.headers.get('Upgrade') !== 'websocket') return new Response('websocket only', { status: 426 });
      return env.HOME.get(env.HOME.idFromName('home')).fetch(req);
    }
    if (!m) return new Response(url.pathname === '/' ? 'pier9 rooms: ok' : 'not found', { status: url.pathname === '/' ? 200 : 404 });
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('websocket only', { status: 426 });
    return env.ROOMS.get(env.ROOMS.idFromName(m[1])).fetch(req);
  }
};

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.room = null; this.info = new Map();
    // 生存確認の ping は Durable Object を起こさずに返す（料金も時間もかからない）
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
    ctx.blockConcurrencyWhile(async () => { this.room = (await ctx.storage.get('room')) || null; });
  }
  who(ws) { let i = this.info.get(ws); if (!i) { i = ws.deserializeAttachment() || {}; this.info.set(ws, i); } return i; }
  members() { return this.room ? Object.values(this.room.members) : []; }

  async fetch(req) {
    const url = new URL(req.url), q = url.searchParams, pair = new WebSocketPair(), client = pair[0], ws = pair[1];
    const id = String(q.get('id') || ''), op = q.get('op'), name = clean(q.get('name'), 10), code = url.pathname.slice(-4);
    const refuse = e => { ws.accept(); ws.send(JSON.stringify({ t: 'err', e })); ws.close(4001, e); return new Response(null, { status: 101, webSocket: client }); };
    if (!/^[A-Za-z0-9]{8,40}$/.test(id) || !name || (op !== 'create' && op !== 'join')) return refuse('bad');
    let r = this.room;
    if (op === 'create') {
      if (r && this.members().length) return refuse('taken');
      r = this.room = { code, mode: 0, map: Math.abs(parseInt(q.get('map'), 10) | 0) % MAPS, phase: 'lobby', g: 0, host: 0, seq: 0, members: {}, last: null, lim: 0 };
    } else if (!r || !this.members().length) return refuse('nf');
    let m = r.members[id];
    if (!m) {
      if (this.members().length >= MAX) return refuse('full');
      m = r.members[id] = { n: ++r.seq, name, slot: -1, off: 0, ig: 0, k: 0 };
      if (!r.host) r.host = m.n;
    } else { m.name = name; m.off = 0; } // 同じ人が入り直した（再読み込みや回線の切れ目）：枠はそのまま
    m.k++; // この接続の番号。同じ人の古い接続は閉じる（同じ人が二重に見えないように）
    for (const o of this.ctx.getWebSockets()) if (this.who(o).id === id) { this.info.delete(o); try { o.close(4002, 'replaced'); } catch (_) {} }
    this.ctx.acceptWebSocket(ws);
    const att = { id, n: m.n, k: m.k, t: Date.now() }; ws.serializeAttachment(att); this.info.set(ws, att);
    await this.commit();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, msg) {
    if (typeof msg !== 'string' || msg.length > 8192) return;
    const i = this.who(ws), r = this.room, m = r && r.members[i.id]; if (!m || m.k !== i.k) return;
    if (msg.charCodeAt(0) === 83) { // "S"：試合の状態。試合中の人にだけ、送り主の番号を付けてそのまま流す
      if (!m.ig) return;
      const out = 'S' + i.n + ' ' + msg.slice(1);
      for (const o of this.ctx.getWebSockets()) {
        if (o === ws) continue; const oi = this.who(o), om = r.members[oi.id];
        if (om && om.ig && om.k === oi.k) { try { o.send(out); } catch (_) {} }
      }
      return;
    }
    let d; try { d = JSON.parse(msg); } catch (_) { return; } if (!d || typeof d !== 'object') return;
    const host = m.n === r.host, lobby = r.phase === 'lobby', ms = this.members();
    switch (d.t) {
      case 'slot': { // 空いている枠に入る（-1 で枠から出る）。試合に出ているあいだは動けない
        const s = d.s | 0; if ((!lobby && m.ig) || s < -1 || s >= SLOTS[r.mode] || s === m.slot) return;
        if (s >= 0 && ms.some(o => o !== m && o.slot === s)) return;
        m.slot = s; break;
      }
      case 'mode': { // ホストだけ。枠に入っていた人は新しい枠へ順に詰め直す
        const v = d.v | 0; if (!host || !lobby || v < 0 || v >= SLOTS.length || v === r.mode) return;
        r.mode = v; place(r, ms.filter(o => o.slot >= 0).sort((a, b) => a.slot - b.slot)); break;
      }
      case 'map': { const v = d.v | 0; if (!host || !lobby || v < 0 || v >= MAPS || v === r.map) return; r.map = v; break; }
      case 'lim': { const v = d.v | 0; if (!host || !lobby || v < 0 || v > 999 || v === (r.lim || 0)) return; r.lim = v; break; } // 対戦の勝利条件：このキル数で決着（0 はエンドレス）
      case 'rand': { // ホストだけ。つながっている全員を混ぜて、枠に振り分ける
        if (!host || !lobby) return;
        const list = ms.filter(o => !o.off);
        for (let k = list.length - 1; k > 0; k--) { const j = Math.random() * (k + 1) | 0; [list[k], list[j]] = [list[j], list[k]]; }
        for (const o of ms) o.slot = -1; place(r, list); break;
      }
      case 'start': { // ホストだけ。枠に入っている人がそのまま試合に出る
        if (!host || !lobby || !ms.some(o => o.slot >= 0 && !o.off)) return;
        r.phase = 'play'; r.g++; r.last = null; for (const o of ms) o.ig = o.slot >= 0 && !o.off ? 1 : 0; break;
      }
      case 'end': case 'wipe': { // end：ホストが試合を終える。wipe：協力で全滅した／対戦で勝利条件に届いた（試合に出ている人なら誰でも）
        if (lobby || (d.t === 'end' ? !host : !m.ig)) return;
        const res = JSON.stringify(d.res === undefined ? null : d.res);
        r.phase = 'lobby'; r.last = res.length < 1500 ? JSON.parse(res) : null; break;
      }
      case 'ig': { const v = d.v ? 1 : 0; if ((v && (lobby || m.slot < 0)) || m.ig === v) return; m.ig = v; break; }
      case 'bye': { delete r.members[i.id]; this.info.delete(ws); try { ws.close(1000, 'bye'); } catch (_) {} break; }
      default: return;
    }
    await this.commit();
  }

  async webSocketClose(ws) { try { ws.close(1000); } catch (_) {} await this.drop(ws); }
  async webSocketError(ws) { await this.drop(ws); }
  async drop(ws) { // 回線が切れた：しばらく枠を取っておき、戻ってこなければ見回りで外す
    const i = this.who(ws), r = this.room, m = r && r.members[i.id]; this.info.delete(ws);
    if (!m || m.k !== i.k || m.off) return;
    m.off = Date.now(); await this.commit();
  }

  async alarm() {
    const r = this.room; if (!r) return;
    const now = Date.now(), live = new Set(); let changed = false;
    for (const ws of this.ctx.getWebSockets()) {
      const i = this.who(ws), m = r.members[i.id]; if (!m || m.k !== i.k) continue;
      const ts = this.ctx.getWebSocketAutoResponseTimestamp(ws), last = Math.max(ts ? ts.getTime() : 0, i.t || 0);
      if (now - last > STALE) { this.info.delete(ws); try { ws.close(4003, 'stale'); } catch (_) {} continue; }
      live.add(i.id);
    }
    for (const [id, m] of Object.entries(r.members)) {
      if (!m.off && !live.has(id)) { m.off = now; changed = true; }
      if (m.off && now - m.off > GRACE) { delete r.members[id]; changed = true; }
    }
    await this.commit(changed, true);
  }

  async commit(changed = true, rearm = false) {
    const r = this.room; if (r) this.code = r.code;
    if (r) { // ホストと試合中かどうかは、残っている人に合わせる
      const ms = this.members();
      if (!ms.length) this.room = null;
      else {
        if (!ms.some(m => m.n === r.host)) { const on = ms.filter(m => !m.off); r.host = (on.length ? on : ms).reduce((a, b) => (a.n < b.n ? a : b)).n; }
        if (r.phase === 'play' && !ms.some(m => m.ig)) r.phase = 'lobby';
        if (r.phase === 'lobby') for (const m of ms) m.ig = 0;
      }
    }
    if (!this.room) { await this.ctx.storage.deleteAll(); await this.report(); return; } // 誰もいない：番号を空ける
    if (changed) { await this.ctx.storage.put('room', this.room); this.send(); }
    await this.report();
    if (rearm || !(await this.ctx.storage.getAlarm())) await this.ctx.storage.setAlarm(Date.now() + TICK);
  }

  async report() { // ホームのルーム一覧へ、このルームの概要を知らせる（変わったときと、1分ごと）
    const r = this.room, code = this.code; if (!code) return;
    let info = null;
    if (r) { const h = r.members && Object.values(r.members).find(m => m.n === r.host); info = { mode: r.mode, map: r.map, phase: r.phase, n: this.members().length, host: h ? h.name : '', lim: r.lim || 0 }; }
    const sig = JSON.stringify(info), now = Date.now();
    if (sig === this.sent && now - (this.sentAt || 0) < BEAT) return;
    this.sent = sig; this.sentAt = now;
    try { await this.env.HOME.get(this.env.HOME.idFromName('home')).room(code, info); } catch (_) { this.sent = null; }
  }

  send() {
    const r = this.room, ps = this.members().map(m => [m.n, m.name, m.slot, m.off ? 0 : 1, m.ig]);
    const out = { t: 'room', code: r.code, mode: r.mode, map: r.map, phase: r.phase, g: r.g, host: r.host, last: r.last, lim: r.lim || 0, ps, you: 0 };
    for (const ws of this.ctx.getWebSockets()) {
      const i = this.who(ws), m = r.members[i.id]; if (!m || m.k !== i.k) continue;
      out.you = i.n; try { ws.send(JSON.stringify(out)); } catch (_) {}
    }
  }
}

// ホーム画面のチャット。つないでいる人数と、最近の発言（30件・24時間まで）を配る。
const LOG = 30, KEEP = 86400000, SAY = 60, GAP = 1000;
export class Home extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }
  live(but) { return this.ctx.getWebSockets().filter(o => o !== but); }
  async log() { const now = Date.now(); return ((await this.ctx.storage.get('log')) || []).filter(e => now - e.at < KEEP); }
  cast(out, but) { const t = JSON.stringify(out); for (const o of this.live(but)) { try { o.send(t); } catch (_) {} } }
  count(gone) { const n = this.live(gone).length; this.cast({ t: 'n', n }, gone); } // gone：閉じた回線（数えず、送らない）

  async fetch() {
    const pair = new WebSocketPair(), client = pair[0], ws = pair[1];
    this.ctx.acceptWebSocket(ws); ws.serializeAttachment({ t: Date.now(), at: 0 });
    ws.send(JSON.stringify({ t: 'hi', log: await this.log(), n: this.live().length, rooms: (await this.rooms()).list }));
    this.cast({ t: 'n', n: this.live().length }, ws); // ほかの人へ、増えた人数を
    if (!(await this.ctx.storage.getAlarm())) await this.ctx.storage.setAlarm(Date.now() + HOME_TICK);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, msg) {
    if (typeof msg !== 'string' || msg.length > 1024) return;
    let d; try { d = JSON.parse(msg); } catch (_) { return; }
    if (!d || d.t !== 'say') return;
    const a = ws.deserializeAttachment() || {}, now = Date.now();
    if (now - (a.at || 0) < GAP) return; // 1秒に1通まで
    const name = clean(d.name, 10), s = clean(d.s, SAY); if (!name || !s) return;
    a.at = now; ws.serializeAttachment(a);
    const e = { name, s, at: now }, log = (await this.log()).concat(e).slice(-LOG);
    await this.ctx.storage.put('log', log);
    this.cast({ t: 'say', e }, ws);
    try { ws.send(JSON.stringify({ t: 'say', e, me: 1 })); } catch (_) {}
  }

  // ルーム一覧。rooms：ルーム番号 → 概要と最後に知らせが来た時刻。知らせの途絶えたものは外す
  async rooms() {
    const all = (await this.ctx.storage.get('rooms')) || {}, now = Date.now(); let pruned = false;
    for (const c of Object.keys(all)) if (now - all[c].at > GONE) { delete all[c]; pruned = true; }
    const list = Object.entries(all).map(([code, v]) => ({ code, mode: v.mode, map: v.map, phase: v.phase, n: v.n, max: MAX, host: v.host, lim: v.lim })).sort((a, b) => a.code.localeCompare(b.code));
    return { all, list, pruned };
  }
  async room(code, info) { // ルームから呼ばれる（RPC）
    if (!/^\d{4}$/.test(String(code))) return;
    const { all } = await this.rooms(), before = JSON.stringify(all[code] ? { ...all[code], at: 0 } : null);
    if (info) all[code] = { mode: info.mode | 0, map: info.map | 0, phase: info.phase === 'play' ? 'play' : 'lobby', n: info.n | 0, host: clean(info.host, 10), lim: info.lim | 0, at: Date.now() };
    else delete all[code];
    await this.ctx.storage.put('rooms', all);
    if (JSON.stringify(all[code] ? { ...all[code], at: 0 } : null) !== before) this.cast({ t: 'rooms', rooms: (await this.rooms()).list }); // 「まだある」だけの知らせは配らない
  }

  async webSocketClose(ws) { try { ws.close(1000); } catch (_) {} this.count(ws); }
  async webSocketError(ws) { this.count(ws); }

  async alarm() { // 応答のない回線を閉じる（人数に数えないように）。誰もいなければ見回りをやめる
    const now = Date.now(); let gone = false;
    for (const ws of this.ctx.getWebSockets()) {
      const ts = this.ctx.getWebSocketAutoResponseTimestamp(ws), a = ws.deserializeAttachment() || {};
      if (now - Math.max(ts ? ts.getTime() : 0, a.t || 0) > STALE) { try { ws.close(4003, 'stale'); } catch (_) {} gone = true; }
    }
    if (gone) this.count();
    const { all, list, pruned } = await this.rooms();
    if (pruned) { await this.ctx.storage.put('rooms', all); this.cast({ t: 'rooms', rooms: list }); }
    if (this.ctx.getWebSockets().length) await this.ctx.storage.setAlarm(now + HOME_TICK);
  }
}

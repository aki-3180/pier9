// Each frame of a match: taking in the other pages, idling out, co-op drone flying, wins and wipes.
'use strict';
const QUIET = 2500; // a page silent this long (ms) is drawn as gone (a hidden tab still sends about once a second)
function netSync(dt, away) { // away: paused here, or the tab is hidden. The match goes on; in versus we can still be shot where we stand
  const now = performance.now(), myTeam = teamOf(mySlot()); let hitter = null; liveRemotes.length = 0;
  if (coop) coopElect(now);
  for (const [n, b] of inbox) {
    const p = member(n);
    if (!p || p[2] < 0 || !p[4]) { inbox.delete(n); dropRemote(n); continue; } // out of the match (the room keeps a dropped player's place for a minute)
    let r = remotes.get(n);
    if (!r && b.q.length) { const s0 = b.q[0]; r = mkRemote(n); remotes.set(n, r); r.f = num(s0.f); r.d = num(s0.d); }
    if (!r) continue;
    if (r.slot !== p[2]) { r.slot = p[2]; r.team = teamOf(p[2]); r.col = slotCol(p[2]); r.mat.color.set(r.col); r.lamp.material.color.set(r.col); }
    r.name = cleanName(p[1]) || COLORS[Math.max(0, p[2]) % COLORS.length][0]; r.mate = coop || (teamPlay() && r.team === myTeam);
    for (const s of b.q) { // every message since the last frame, oldest first: running totals are compared, one-off events are taken once each
      if (Array.isArray(s.m)) for (const line of s.m.slice(0, 3)) { const t = cleanText(line, 40); if (t) { chatRow(r.name, r.col, t); tone('sine', 880, 1100, 0.06, 0.06); } }
      const f = num(s.f); if (f !== r.f) { r.f = f; if (s.a === 1 && r.alive) vsRemoteShot(r); }
      const d = num(s.d);
      if (d > r.d) { // this player went down: in versus, credit it if it was ours (and give back 50), and tell everyone who did it
        if (pvp) {
          const by = num(s.lk), me = by === R.you, kr = me ? null : remotes.get(by);
          if (me) { net.k++; if (net.dead <= 0 && !net.pick) P.hp = Math.min(100, P.hp + 50); announce(`${r.name}を撃破`, '体力 +50'); sfx.boom(); fx(r.x, r.y, r.z, 4, COL.sodium, 0.35); }
          killLog(me ? myName : kr ? kr.name : '？', me ? myCol() : kr ? kr.col : COL.steel, r.name, r.col);
        } else killLog('ドローン', COL.alarm, r.name, r.col);
      }
      r.d = d;
      if (pvp && !r.mate) { // damage this player says it has dealt us
        const dealt = s.dm && typeof s.dm === 'object' ? num(s.dm[R.you]) : 0, was = net.seen[n];
        if (was !== undefined && dealt > was && net.dead <= 0 && !net.pick) { const dmg = Math.min(dealt - was, 110); P.hp -= dmg; hitter = r; net.taken[n] = (net.taken[n] || 0) + dmg; }
        net.seen[n] = dealt;
      }
      if (coop) coopTake(r, s);
      r.last = s;
    }
    b.q.length = 0;
    const s = r.last; if (!s) continue;
    r.tx = clamp(num(s.x), -LX, LX); r.tz = clamp(num(s.z), -LZ, LZ); r.tyaw = num(s.yaw); r.tpy = clamp(num(s.y), 0, 12); r.pitch = clamp(num(s.pt), -1.2, 1.2); r.k = num(s.k) | 0; r.hp = num(s.hp); r.alive = s.a === 1; r.away = s.af === 1; r.w = s.w === undefined ? -1 : clamp(num(s.w) | 0, 0, WEAPONS.length - 1);
    ghostly(r, !p[3] || now - b.at > QUIET);
    const k = r.fresh ? 1 : Math.min(1, dt * 12); r.fresh = false;
    r.x += (r.tx - r.x) * k; r.z += (r.tz - r.z) * k; r.py += (r.tpy - r.py) * k; r.y = r.py + 1.25; const da = r.tyaw - r.yaw; r.yaw += Math.atan2(Math.sin(da), Math.cos(da)) * k;
    r.g.visible = r.alive; r.g.position.set(r.x, r.py, r.z); r.g.rotation.y = r.yaw;
    if (r.alive && !r.ghost) liveRemotes.push(r); // (the ones that can be shot, aimed at by drones and spawned away from)
  }
  for (const n of [...remotes.keys()]) if (!inbox.has(n)) dropRemote(n);
  if (hitter) {
    hurtFrom(hitter.x, hitter.z);
    if (P.hp <= 0) { P.hp = 0; net.dead = 3; net.d++; net.lk = hitter.n; setAim(false); pickI = wi; killLog(hitter.name, hitter.col, myName, myCol()); pickShow(`${hitter.name}に撃たれた`, '3秒で復帰。武器を替えるなら今選ぶ' + (touchMode ? '' : '（1〜5 キー）'), false, recap(hitter)); sfx.boom(); net.sendT = 0; }
  } else if (pvp && net.dead > 0 && !away) { net.dead -= dt; if (net.dead <= 0) { vsRespawn(); net.sendT = 0; } } // down while away: back once we return
  if (net.cd > 0) { const was = Math.ceil(net.cd); net.cd -= dt; const n = Math.ceil(net.cd); if (n !== was) countdown(n); }
  if (idleCheck(now)) return; // left the match for idling
  if (coop) coopWipe(); else versusWin();
  if ((net.sendT -= dt) <= 0) { net.sendT = away && !net.auth ? 0.5 : 0.1; netSend(away); } // a page away from the game sends less, unless it flies the drones
}
// How we went down (versus): the gun and range it came from, the health the shooter had left, and who did how much this life
function recap(r) {
  const w = r.w >= 0 ? WEAPONS[r.w].name : '', far = Math.round(Math.hypot(r.x - P.x, r.z - P.z));
  const by = Object.entries(net.taken).map(([n, v]) => { const o = remotes.get(+n); return [o ? o.name : '？', Math.round(v)]; }).sort((a, b) => b[1] - a[1]);
  return `${w ? w + '・' : ''}${far}m から。相手の残り体力 ${Math.max(0, Math.ceil(r.hp))}\n受けたダメージ：` + by.map(([a, v]) => `${a} ${v}`).join('、');
}
// The countdown at the start of a match: 3, 2, 1, then go
function countdown(n) {
  if (n > 0) { announce(String(n), '試合開始まで'); tone('square', 520, 520, 0.08, 0.06); return; }
  if (coop) announce('協力', '仲間とドローンを迎え撃て'); else announce(`${MODES[R.mode].name} 開始`, '相手を見つけて撃て');
  sfx.wave();
}
/* Idling: no input for three minutes (paused, a hidden tab, or just standing there) takes us out of the match, back to the room,
   so nobody stands about in a match for good. A warning comes 30 s before. Being down in co-op (waiting for the wave to fall) is not idling. */
const IDLE_OUT = 180, IDLE_WARN = 30;
let inputAt = performance.now(), idleNote = '';
const touched = () => { if (state === 'play') inputAt = performance.now(); };
for (const ev of ['keydown', 'pointerdown', 'pointermove', 'mousemove', 'touchstart', 'touchmove', 'wheel']) addEventListener(ev, touched, { passive: true, capture: true });
function idleCheck(now) {
  if (net.ending || (coop && net.dead > 0)) { inputAt = now; return false; }
  const left = IDLE_OUT - (now - inputAt) / 1000;
  if (left <= 0) {
    idleNote = '3分間操作がなかったので、試合から外れました。枠はそのままです。「試合に参加する」で戻れます。';
    matchExit(false); show('lobby'); return true;
  }
  if (left > IDLE_WARN) net.idleWarn = false;
  else if (!net.idleWarn) {
    net.idleWarn = true; const t = `操作がないと、あと${IDLE_WARN}秒で試合から外れます`;
    if (state === 'play') { announce('操作がありません', t); tone('square', 660, 440, 0.15, 0.08); } else if (state === 'pause') $('lead').textContent = t + '。' + $('lead').textContent;
  }
  return false;
}
/* Co-op: the drones are flown by one page, the lowest-numbered one that is caught up and was heard from in the last 1.5 s
   (a page in a hidden tab stops sending, so the next one takes over). Every page flies the bolts and checks only the ones reaching its own player;
   hits, rams and health packs taken are reported to the flying page, which owns the drones' health, the waves and the score. */
function coopElect(now) {
  if (!net.ready && (net.snap || time - net.t0 > 1.5)) net.ready = true; // caught up: heard from the flying page, or nobody has been flying for 1.5 s
  let a = net.ready && !asleep() ? R.you : 0;
  for (const [n, b] of inbox) { const r = remotes.get(n); if (r && r.last && !r.last.nr && now - b.at < 1500 && (!a || n < a)) a = n; }
  const was = net.auth; net.authN = a; net.auth = a === R.you;
  if (net.auth && !was) { // carry on from the last word of the page that flew them
    for (const e of enemies) if (e.tx !== undefined) { e.x = e.tx; e.y = e.ty; e.z = e.tz; }
    spawnT = Math.max(spawnT, 1);
  } else if (!net.auth && was) for (const e of enemies) { e.tx = e.x; e.ty = e.y; e.tz = e.z; }
  if (net.auth && wave === 0 && !(net.cd > 0)) startWave(1); // not started yet: the page flying the drones starts it once the countdown is over
}
function coopTake(r, s) { // the co-op part of one message from another page
  if (Array.isArray(s.bl) && !net.auth) for (const v of s.bl.slice(0, 80)) if (Array.isArray(v) && v.length >= 9)
    launchBolt(clamp(num(v[0]), -150, 150), clamp(num(v[1]), -2, 40), clamp(num(v[2]), -150, 150), clamp(num(v[3]), -120, 120), clamp(num(v[4]), -120, 120), clamp(num(v[5]), -120, 120), clamp(num(v[6]), 0, 40), num(v[7]), num(v[8]), clamp(num(v[9]) || 1, 1, 3));
  if (Array.isArray(s.kx)) for (const v of s.kx.slice(0, 48)) {
    if (!Array.isArray(v)) continue; if (num(v[1]) === R.you) net.k++;
    const e = enemies.find(o => o.id === num(v[0])); if (e && !net.auth) killEnemy(e);
  }
  if (r.n === net.authN && !net.auth) {
    if (Array.isArray(s.ev)) for (const v of s.ev.slice(0, 8)) { if (!Array.isArray(v)) continue; const n = num(v[1]) | 0; if (v[0] === 'w') { waveAnnounce(n, v.slice(2, 4).map(i => TYPEK[num(i) | 0]).filter(t => t && TYPES[t].boss)); net.spent.clear(); } else if (v[0] === 'c') waveClear(n); else if (v[0] === 'x') blast(clamp(num(v[1]), -150, 150), clamp(num(v[2]), -2, 40), clamp(num(v[3]), -150, 150)); }
    if (s.w !== undefined) { applySnap(s); net.snap = true; }
  }
  if (net.auth) {
    if (Array.isArray(s.h)) for (const v of s.h.slice(0, 48)) { if (!Array.isArray(v)) continue; const e = enemies.find(o => o.id === num(v[0])); if (e) hurtDrone(e, clamp(num(v[1]), 0, 2000), r.n); }
    if (Array.isArray(s.rh)) for (const id of s.rh.slice(0, 20)) { const e = enemies.find(o => o.id === num(id)); if (e && e.type === 'ram') killEnemy(e); }
    if (Array.isArray(s.pc)) for (const id of s.pc.slice(0, 20)) { const p = pickups.find(o => o.id === num(id)); if (p) removePickup(p); }
  }
}
function applySnap(s) { // the flying page's word on the drones, the packs, the wave and the score
  wave = clamp(num(s.w) | 0, 0, 999); score = Math.max(0, num(s.sc) | 0); breakT = clamp(num(s.bk), 0, 5);
  queue = typeof s.q === 'string' ? Array.from(s.q.slice(0, 80), c => TYPEK[+c]).filter(Boolean) : []; // one digit per drone: its index in TYPEK
  if (Array.isArray(s.e)) {
    const seen = new Set();
    for (const v of s.e.slice(0, 48)) {
      if (!Array.isArray(v)) continue; const id = num(v[0]), type = TYPEK[num(v[1]) | 0]; if (!type) continue; seen.add(id);
      const x = clamp(num(v[2]), -150, 150), y = clamp(num(v[3]), -2, 40), z = clamp(num(v[4]), -150, 150), hp = num(v[5]), mx = Math.max(1, num(v[6]));
      const e = enemies.find(o => o.id === id);
      const ch = num(v[7]) | 0, tgn = num(v[8]) | 0;
      if (e) { e.tx = x; e.ty = y; e.tz = z; e.hp = hp; e.max = mx; e.ch = ch; e.tgn = tgn; } else if (!net.spent.has(id)) { spawnEnemy(type, null, [id, x, y, z, hp, mx]); const n = enemies[enemies.length - 1]; n.ch = ch; n.tgn = tgn; }
    }
    for (let i = enemies.length - 1; i >= 0; i--) if (!seen.has(enemies[i].id)) killEnemy(enemies[i]); // gone there: shot down, or it rammed someone
  }
  if (Array.isArray(s.pk)) {
    const seen = new Set();
    for (const v of s.pk.slice(0, 30)) { if (!Array.isArray(v)) continue; const id = num(v[0]); seen.add(id); if (!net.claimed.has(id) && !pickups.some(p => p.id === id)) dropPickup(clamp(num(v[1]), -150, 150), clamp(num(v[2]), -150, 150), id, num(v[3])); }
    for (let i = pickups.length - 1; i >= 0; i--) if (!seen.has(pickups[i].id)) removePickup(pickups[i]);
  }
}
const winText = r => (r.tp ? `${teamName(num(r.t) | 0)}の勝ち` : `${cleanName(r.n) || '？'}の勝ち`) + `（${num(r.k) | 0}キル）`;
function versusWin() { // the kill count is reached (by one player, or by a team's total): any page that sees it calls it; the server takes the first
  if (!(R.lim > 0) || net.won === R.g || net.ending) return;
  const all = standings(); let res = null;
  if (teamPlay()) { const t = boardRows(all, 99, true).find(r => r.ps && r.k >= R.lim); if (t) res = { v: 'win', tp: 1, t: t.team, k: t.k }; }
  else { const p = all.find(r => r.k >= R.lim); if (p) res = { v: 'win', tp: 0, n: p.n, k: p.k }; }
  if (res) { net.won = R.g; roomOp({ t: 'wipe', res }); }
}
function coopWipe() { // everyone in the match is down: the flying page calls it
  if (!net.auth || wave < 1 || net.wiped === R.g || !(net.dead > 0)) return;
  for (const r of remotes.values()) if (!r.ghost && (!r.last || !r.last.dd)) return; // (a player who has dropped out does not hold the match up)
  net.wiped = R.g; roomOp({ t: 'wipe', res: { co: 1, w: wave, sc: score } });
}

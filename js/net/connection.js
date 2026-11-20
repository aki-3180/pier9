// The line to the room server: who we are, the saved seat, the socket, entering and leaving a match.
'use strict';
/* the line to the room server */
/* Who we are to the room server. The id is kept in localStorage, so a reload, a tab closed and opened again, or a browser that forgets
   sessionStorage all come back as the same player, into the same place. A second tab of this browser open at the same time is another player:
   the id belongs to whichever tab holds the lock on it, and any other tab makes one of its own (kept in sessionStorage). */
const ID_OK = v => typeof v === 'string' && /^[A-Za-z0-9]{8,40}$/.test(v);
const newPid = () => Array.from({ length: 20 }, () => 'abcdefghijkmnpqrstuvwxyz23456789'[Math.random() * 32 | 0]).join('');
function tabId() { let v = ''; try { v = sessionStorage.getItem('pier9.cid') || ''; } catch (_) {} if (!ID_OK(v)) { v = newPid(); try { sessionStorage.setItem('pier9.cid', v); } catch (_) {} } return v; }
let clientId = '';
const idReady = new Promise(done => {
  const give = v => { if (!clientId) { clientId = v; done(v); } };
  let shared = store.get('pid', ''); if (!ID_OK(shared)) { shared = newPid(); store.set('pid', shared); }
  if (store.get('pid', '') !== shared) { give(tabId()); return; } // nowhere to keep it: one per tab
  if (!navigator.locks) { give(shared); return; }
  const hold = () => { if (clientId) return; give(shared); return new Promise(() => {}); }; // kept until the tab closes or reloads
  navigator.locks.request('pier9.pid', { ifAvailable: true }, lock => {
    if (lock) return hold();
    const stop = new AbortController(); // held: a tab that is closing or reloading lets go in a moment; one that stays open keeps it
    setTimeout(() => { if (clientId) return; stop.abort(); give(tabId()); }, 1500);
    navigator.locks.request('pier9.pid', { signal: stop.signal }, hold).catch(() => {});
  }).catch(() => give(shared));
});
/* The seat: where we were (room, match, standing, health, tallies), saved every second while in a room. Opening the page again within a minute
   (the time the room keeps a dropped player's place) goes straight back to it. */
const SEAT_KEEP = 60000;
const seatKey = () => 'seat.' + clientId;
function seatSave() {
  if (!R.code || !clientId) return;
  const s = { code: R.code, at: Date.now() };
  if (online) Object.assign(s, { g: R.g, k: net.k, d: net.d, f: net.f, x: +P.x.toFixed(2), y: +P.y.toFixed(2), z: +P.z.toFixed(2), yaw: +P.yaw.toFixed(3),
    hp: Math.ceil(P.hp), w: wi, dn: net.dead > 0 || net.pick ? 1 : 0 });
  store.set(seatKey(), s);
}
const seatDrop = () => { try { localStorage.removeItem('pier9.' + seatKey()); } catch (_) {} };
setInterval(seatSave, 1000); addEventListener('pagehide', seatSave);
try { for (let i = localStorage.length - 1; i >= 0; i--) { const k = localStorage.key(i); if (k && k.startsWith('pier9.seat.') && !(Date.now() - (store.get(k.slice(6), null) || {}).at < 3600000)) localStorage.removeItem(k); } } catch (_) {} // old seats
let sock = null, seenG = -1, lastStand = null; // seenG: the match number when last told, so a new one can pull us in
function connect(code, op) {
  return idReady.then(() => new Promise((resolve, reject) => {
    let ws, done = false;
    try { ws = new WebSocket(`${SERVER}/room/${code}?op=${op}&id=${clientId}&name=${encodeURIComponent(myName)}&map=${cfg.map}`); } catch (_) { reject('net'); return; }
    const t = setTimeout(() => { if (!done) { done = true; try { ws.close(); } catch (_) {} reject('net'); } }, 9000);
    ws.onmessage = ev => {
      const d = ev.data; if (typeof d !== 'string') return;
      if (d.charCodeAt(0) === 83) { if (sock && sock.ws === ws) onState(d); return; } // "S": another player's state
      if (d === 'pong') { if (sock && sock.ws === ws) gotPong(); return; }
      let m; try { m = JSON.parse(d); } catch (_) { return; }
      if (!m || typeof m !== 'object') return;
      if (m.t === 'err') { if (!done) { done = true; clearTimeout(t); reject(String(m.e)); } return; }
      if (m.t === 'room') { if (!done) { done = true; clearTimeout(t); sock = { ws, code }; resolve(); } if (sock && sock.ws === ws) onRoom(m); }
    };
    ws.onclose = ev => {
      clearTimeout(t); if (!done) { done = true; reject('net'); return; }
      if (!sock || sock.ws !== ws) return;
      if (ev.code === 4002) { sock = null; leaveRoom('同じ人がほかのタブでこのルームに入ったので、こちらは抜けました。', true); } // our id came in on another line: that one is us now
      else lost();
    };
  }));
}
function sockSend(text, bulk) { // bulk: game state, dropped rather than queued when the line is backed up
  const ws = sock && sock.ws; if (!ws || ws.readyState !== 1 || (bulk && ws.bufferedAmount > 32768)) return false;
  try { ws.send(text); return true; } catch (_) { return false; }
}
const roomOp = o => sockSend(JSON.stringify(o));
setInterval(() => sockSend('ping'), 15000); // answered by the server without waking the room; a line silent for 75 s is dropped there
/* In a match: the round trip to the room server (a ping every 3 s, answered without waking the room, so it costs next to nothing
   beside the ten state messages a second), and in versus the time left of the hour. Both shown small under the radar. */
const pingEl = $('ping'), clockEl = $('clock'); let pingAt = 0, rtt = 0, clockSay = 0;
function gotPong() {
  if (!pingAt) return; const ms = performance.now() - pingAt; pingAt = 0;
  rtt = rtt ? rtt * 0.6 + ms * 0.4 : ms; const v = Math.round(rtt); // smoothed, so one slow answer does not jump
  pingEl.textContent = v + 'ms'; pingEl.className = v < 80 ? 'ok' : v < 160 ? 'mid' : 'bad';
}
setInterval(() => {
  if (!online || !sock) { pingAt = 0; rtt = 0; pingEl.textContent = ''; return; }
  if (pingAt && performance.now() - pingAt > 6000) { pingAt = 0; pingEl.textContent = '応答なし'; pingEl.className = 'bad'; }
  if (!pingAt && sockSend('ping')) pingAt = performance.now();
}, 3000);
setInterval(() => {
  const left = online && pvp && R.endAt ? Math.max(0, (R.endAt - performance.now()) / 1000) : -1;
  if (left < 0) { clockEl.textContent = ''; clockSay = 0; return; }
  const m = Math.floor(left / 60), sec = Math.floor(left % 60);
  clockEl.textContent = left >= 600 ? `残り${Math.ceil(left / 60)}分` : `残り${m}:${String(sec).padStart(2, '0')}`; clockEl.classList.toggle('low', left < 300);
  for (const at of [600, 300, 60]) if (left <= at && left > at - 5 && clockSay !== at) { clockSay = at; if (state === 'play') announce(`残り${at / 60}分`, '1時間で試合終了'); } // a word at 10, 5 and 1 minutes left
}, 500);
function onState(data) {
  const sp = data.indexOf(' '), n = +data.slice(1, sp); if (!online || !(n > 0) || n === R.you) return;
  let s; try { s = JSON.parse(data.slice(sp + 1)); } catch (_) { return; }
  if (!s || typeof s !== 'object' || s.g !== R.g) return;
  let b = inbox.get(n); if (!b) inbox.set(n, b = { q: [], at: 0 });
  b.at = performance.now(); b.q.push(s); if (b.q.length > 60) b.q.splice(0, b.q.length - 60);
}
function lost() { // the line dropped: the server keeps our place for 20 s, so try to get back in
  const code = sock.code; sock = null; let tries = 0;
  if (online) announce('接続が切れました', 'つなぎ直しています'); lbNote.textContent = '接続が切れました。つなぎ直しています…';
  const again = () => {
    if (sock || R.code !== code) return;
    connect(code, 'join').then(() => { if (online) announce('つなぎ直しました'); }, e => {
      if (R.code !== code) return;
      if (e === 'net' && ++tries < 14) setTimeout(again, 1000 * Math.min(5, tries)); // for about a minute: as long as the room keeps our place
      else leaveRoom(e === 'nf' ? 'ルームがなくなりました。' : e === 'full' ? 'ルームが満員になっていて、入り直せませんでした。' : 'ルームとの接続が切れました。');
    });
  };
  setTimeout(again, 400);
}
function leaveRoom(msg, keepSeat) { // keepSeat: another tab took our place, so the seat is that tab's now
  matchExit(false);
  const s = sock; sock = null; R.code = ''; lastStand = null; if (!keepSeat) seatDrop();
  if (s) { try { s.ws.send(JSON.stringify({ t: 'bye' })); } catch (_) {} try { s.ws.close(1000); } catch (_) {} }
  try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
  loadMap(cfg.map); show('menu'); vsNote.textContent = msg || homeNote();
}
function onRoom(m) {
  R.code = String(m.code || R.code); R.you = num(m.you) | 0; R.host = num(m.host) | 0; R.mode = clamp(num(m.mode) | 0, 0, MODES.length - 1); R.map = clamp(num(m.map) | 0, 0, MAPS.length - 1);
  R.phase = m.phase === 'play' ? 'play' : 'lobby'; R.g = num(m.g) | 0; R.ps = Array.isArray(m.ps) ? m.ps.filter(p => Array.isArray(p) && p.length >= 5) : []; R.last = m.last && typeof m.last === 'object' ? m.last : null;
  R.lim = m.lim === undefined ? null : clamp(num(m.lim) | 0, 0, 999);
  R.endAt = R.phase === 'play' && num(m.left) > 0 ? performance.now() + num(m.left) : 0; // a versus match ends an hour after it began (sent as the time left, so clocks need not agree)
  if (online && !net.ending && (R.phase !== 'play' || R.g !== net.g || mySlot() < 0)) { // the match is over (or our place went)
    if (R.phase !== 'play' && R.last && (R.last.v === 'win' || R.last.v === 'time')) { // someone reached the kill count, or the hour is up: say so for a moment, then everyone goes back to the room
      net.ending = true; announce(R.last.v === 'time' ? '時間切れ' : winText(R.last), R.last.v === 'time' ? '1時間たったので試合終了　ルームに戻ります' : '試合終了　ルームに戻ります'); sfx.wave();
      setTimeout(() => { net.ending = false; if (online) { matchExit(true); show('lobby'); } }, 2600);
    } else { matchExit(R.phase !== 'play' || R.g !== net.g); show('lobby'); }
  }
  if (!online && state === 'lobby' && R.phase === 'play' && seenG >= 0 && R.g !== seenG && mySlot() >= 0) matchEnter(null, true); // the host started one
  seenG = R.g;
  if (state === 'lobby') { if (mapI !== R.map) loadMap(R.map); lobbyPaint(); }
  if (online && state === 'pause') $('endBtn').hidden = R.you !== R.host;
}
function matchEnter(back, fresh) { // back: the seat saved before a reload, to carry on where we stood. fresh: the host has just started it (a countdown first)
  if (online || mySlot() < 0 || R.phase !== 'play') return;
  if (back && back.g !== R.g) back = null;
  audioInit(); const M = MODES[R.mode];
  online = true; coop = !!M.coop; pvp = !coop;
  loadMap(R.map); clearField(); inbox.clear(); for (const n of [...remotes.keys()]) dropRemote(n); liveRemotes.length = 0;
  if (net.g !== R.g) { net.g = R.g; net.k = net.d = net.f = 0; net.dm = {}; } // back into the same match: the tallies carry on
  if (back) { net.k = num(back.k) | 0; net.d = num(back.d) | 0; net.f = num(back.f) | 0; } // (also after a reload)
  inputAt = performance.now(); idleNote = '';
  Object.assign(net, { cd: fresh ? 3 : 0, taken: {}, idleWarn: false, ending: false, seen: {}, lk: 0, dead: 0, sendT: 0, m: [], auth: false, authN: 0, ready: false, t0: time, snap: false, ev: [], kx: [], bl: [], hq: {}, rh: [], pc: [] }); net.claimed.clear(); net.spent.clear();
  killLogEl.textContent = ''; setAim(false); hudEl.bossRow.hidden = true; vsBoardEl._sig = '';
  roomOp({ t: 'ig', v: 1 });
  show('play'); keepAwake();
  const stand = back && !back.dn && num(back.hp) > 0; // alive when the page went away: back to the same spot, with the same health and gun
  if (pvp && !stand) { net.pick = true; pickShow('武器を選ぶ', 'この一丁で戦う。倒されたら選び直せる'); }
  else if (pvp) { net.pick = false; pickI = clamp(num(back.w) | 0, 0, WEAPONS.length - 1); vsRespawn(); }
  else { net.pick = false; wave = 0; score = 0; queue = []; breakT = 0; spawnT = 1; coopSpawn(); if (!back && !fresh) announce('協力', '仲間とドローンを迎え撃て'); else if (back && !stand) { net.dead = Infinity; /* down when the page went away: still down */ pickShow('倒された', '仲間が今の波を制圧すると復帰する', true); } }
  if (stand) {
    P.x = clamp(num(back.x), -LX, LX); P.z = clamp(num(back.z), -LZ, LZ); P.y = clamp(num(back.y), 0, 12); P.ey = P.y + EYEH; P.vy = P.vx = P.vz = 0; P.onIce = false; P.yaw = num(back.yaw); P.pitch = 0;
    P.hp = clamp(num(back.hp), 1, 100); if (coop) setWeapon(clamp(num(back.w) | 0, 0, WEAPONS.length - 1), true);
  }
  if (fresh) countdown(3);
}
function matchExit(ended) { // ended: the match is over for everyone (otherwise only this page goes back to the room)
  if (!online) return;
  if (ended) lastStand = { all: standings(), tp: teamPlay(), coop, wave, score };
  else roomOp({ t: 'ig', v: 0 });
  online = pvp = coop = false; net.pick = false; net.dead = 0; net.auth = false;
  for (const n of [...remotes.keys()]) dropRemote(n); inbox.clear(); liveRemotes.length = 0; clearField();
  killLogEl.textContent = ''; chatClose(); pickEl.hidden = true;
  if (document.pointerLockElement) document.exitPointerLock(); firing = mouseFire = false; setAim(false);
}

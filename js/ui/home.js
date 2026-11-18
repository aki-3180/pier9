// The title screen's room list and home chat; an invite link.
'use strict';
/* the home chat: everyone who has the title screen open right now, through one shared line on the room server (/home).
   Connected only while the title screen is showing and the tab is in view, so the count is the people looking at it. */
const hc = { ws: null, want: false, tries: 0, timer: 0, ok: false };
const hcEl = $('homeChat'), hcLog = $('hcLog'), hcText = $('hcText'), hcNote = $('hcNote'), hcCount = $('hcCount');
const hcTime = at => { const d = new Date(at); return isFinite(d) ? `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}` : ''; };
function hcRow(e, me) {
  if (!e || typeof e !== 'object') return;
  const name = cleanName(e.name), text = cleanText(e.s, 60); if (!name || !text) return;
  const row = document.createElement('div'), b = document.createElement('b'), t = document.createElement('time'), x = document.createElement('span');
  if (me) row.className = 'me'; b.textContent = name; t.textContent = hcTime(num(e.at)); x.textContent = text; row.append(t, b, x);
  const end = hcLog.scrollHeight - hcLog.scrollTop - hcLog.clientHeight < 24; // only follow the newest line when already at the bottom
  const none = hcLog.querySelector('.none'); if (none) none.remove();
  hcLog.append(row); while (hcLog.children.length > 60) hcLog.firstChild.remove();
  if (end || me) hcLog.scrollTop = hcLog.scrollHeight;
}
function hcOpen() {
  clearTimeout(hc.timer); if (hc.ws || !hc.want) return;
  let ws; try { ws = new WebSocket(`${SERVER}/home`); } catch (_) { hcRetry(); return; }
  hc.ws = ws;
  ws.onopen = () => { hc.tries = 0; };
  ws.onmessage = ev => {
    if (hc.ws !== ws || typeof ev.data !== 'string') return;
    let m; try { m = JSON.parse(ev.data); } catch (_) { return; } if (!m || typeof m !== 'object') return; // ("pong" lands here)
    if (m.t === 'hi') { hc.ok = true; hcLog.textContent = ''; (Array.isArray(m.log) ? m.log : []).forEach(e => hcRow(e, false));
      if (!hcLog.children.length) { const p = document.createElement('div'); p.className = 'none'; p.textContent = 'まだ発言はありません。'; hcLog.append(p); }
      hcLog.scrollTop = hcLog.scrollHeight; hcNote.textContent = ''; $('hcSend').disabled = false; hrEl.hidden = !Array.isArray(m.rooms); hrPaint(m.rooms); }
    if (m.t === 'rooms') { hrEl.hidden = false; hrPaint(m.rooms); }
    if (m.t === 'hi' || m.t === 'n') hcCount.textContent = `ホーム画面に ${Math.max(1, num(m.n) | 0)}人`;
    if (m.t === 'say') hcRow(m.e, !!m.me);
  };
  ws.onclose = () => { if (hc.ws !== ws) return; hc.ws = null; hc.ok = false; $('hcSend').disabled = true; hcCount.textContent = ''; hrEl.hidden = true; hcRetry(); };
}
function hcRetry() {
  if (!hc.want) return;
  hcNote.textContent = hc.tries < 2 ? '会話に接続しています…' : '会話に接続できません。通信状況を確かめてください（ルームサーバーが古い場合は、更新すると使えます）。';
  hc.timer = setTimeout(hcOpen, Math.min(30000, 1000 * 2 ** hc.tries++));
}
function homeChat() { // called whenever the screen changes or the tab is shown or hidden
  const on = !!SERVER && state === 'menu'; hcEl.hidden = !on; if (!on) hrEl.hidden = true;
  hc.want = on && !document.hidden;
  if (hc.want) { if (!hc.ws) { hc.tries = 0; hcOpen(); } return; }
  clearTimeout(hc.timer); const ws = hc.ws; hc.ws = null; hc.ok = false; $('hcSend').disabled = true;
  if (ws) { try { ws.close(1000); } catch (_) {} }
}
const hrEl = $('homeRooms'), hrList = $('hrList'), hrCount = $('hrCount');
function hrPaint(list) { // one row per room: number, mode and map, host, people, waiting or playing
  const rooms = (Array.isArray(list) ? list : []).filter(r => r && /^\d{4}$/.test(String(r.code))).slice(0, 50);
  hrList.textContent = ''; hrCount.textContent = rooms.length ? `${rooms.length}部屋` : '';
  if (!rooms.length) { const p = document.createElement('p'); p.className = 'none'; p.textContent = 'いまはルームがありません。「ルームを作る」で作れます。'; hrList.append(p); return; }
  for (const r of rooms) {
    const n = clamp(num(r.n) | 0, 0, 99), max = clamp(num(r.max) | 0, 1, 99) || 8, M = MODES[clamp(num(r.mode) | 0, 0, MODES.length - 1)], mp = MAPS[clamp(num(r.map) | 0, 0, MAPS.length - 1)];
    const lim = !M.coop && num(r.lim) > 0 ? `・${num(r.lim) | 0}キル先取` : '', host = cleanName(r.host), play = r.phase === 'play', full = n >= max;
    const b = document.createElement('button'), c = document.createElement('span'), t = document.createElement('span'), u = document.createElement('span'), k = document.createElement('span'), st = document.createElement('small');
    c.className = 'code'; c.textContent = r.code; t.textContent = `${M.name}・${mp.name}${lim}`; u.className = 'sub'; u.textContent = host ? `ホスト ${host}` : '';
    k.className = 'cnt'; k.textContent = `${n}/${max}`; st.textContent = full ? '満員' : play ? '試合中' : '待機中'; if (play || full) st.className = 'play'; k.append(st);
    b.append(c, t, k, u); b.disabled = full; b.title = full ? '満員です' : `ルーム ${r.code} に入る`;
    b.addEventListener('click', () => joinRoom(String(r.code)));
    hrList.append(b);
  }
}
let hcAt = 0;
$('hcBar').addEventListener('submit', e => {
  e.preventDefault(); const t = cleanText(hcText.value, 60); if (!t || !hc.ok) return;
  myName = cleanName(nameInput.value); nameInput.value = myName;
  if (!myName) { nameInput.classList.add('need'); hcNote.textContent = '会話には名前が必要です。「名前」欄に入れてから送ってください。'; nameInput.focus(); return; }
  store.set('name', myName);
  if (performance.now() - hcAt < 1000) return; // one line a second (the server holds to the same)
  try { hc.ws.send(JSON.stringify({ t: 'say', name: myName, s: t })); } catch (_) { return; }
  hcAt = performance.now(); hcText.value = ''; hcNote.textContent = '';
});
setInterval(() => { if (hc.ws && hc.ws.readyState === 1) { try { hc.ws.send('ping'); } catch (_) {} } }, 15000);
document.addEventListener('visibilitychange', homeChat);
homeChat();
{ const c = (location.hash.match(/^#(\d{4})$/) || [])[1]; // an invite link: the number is filled in, one tap to go
  if (c && SERVER) { joinCode.value = c; joinRow.hidden = false; vsNote.textContent = `招待されたルーム ${c} に入るには、名前を入れて「入る」を押してください。`; } }

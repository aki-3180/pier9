// The kill feed and the chat in play.
'use strict';
const killLogEl = $('killLog'), vsBoardEl = $('vsBoard'), vitalsEl = $('vitals');
function killLog(kn, kc, vn, vc) {
  const row = document.createElement('div'), a = document.createElement('span'), m = document.createElement('i'), b = document.createElement('span');
  a.textContent = kn; a.style.color = kc; m.textContent = '▸'; b.textContent = vn; b.style.color = vc; row.append(a, m, b);
  killLogEl.append(row); while (killLogEl.children.length > 4) killLogEl.firstChild.remove();
  setTimeout(() => row.remove(), 6000);
}
function chatRow(name, col, text) {
  const row = document.createElement('div'), a = document.createElement('span'), b = document.createElement('span');
  row.className = 'say'; a.textContent = name + '：'; a.style.color = col; b.textContent = text; row.append(a, b);
  killLogEl.append(row); while (killLogEl.children.length > 5) killLogEl.firstChild.remove();
  setTimeout(() => row.remove(), 9000);
}
const chatBar = $('chatBar'), chatText = $('chatText'); let chatAt = 0;
function chatOpen() { if (!online || state !== 'play') return; for (const k in keys) keys[k] = false; firing = mouseFire = false; chatBar.hidden = false; chatText.value = ''; chatText.focus(); }
function chatClose() { if (chatBar.hidden) return; chatBar.hidden = true; chatText.blur(); }
chatBar.addEventListener('submit', e => {
  e.preventDefault(); const t = cleanText(chatText.value, 40);
  if (t) { if (performance.now() - chatAt < 1000) return; // one line a second
    chatAt = performance.now(); net.m.push(t); if (net.m.length > 3) net.m.shift(); net.sendT = 0; chatRow(myName, myCol(), t); }
  chatClose();
});
chatText.addEventListener('keydown', e => { if (e.code === 'Escape') chatClose(); });
chatText.addEventListener('blur', () => setTimeout(chatClose, 0));
$('chatSend').addEventListener('pointerdown', e => e.preventDefault()); // keep the field focused so the tap submits instead of closing it
$('chatBtn').addEventListener('click', () => { if (chatBar.hidden) chatOpen(); else chatClose(); });

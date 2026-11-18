// This page's side of a match, the weapon pick in versus, the other players, names.
'use strict';
/* net: this page's side of the match.
   k/d: kills and deaths. lk: who got us last. f: shots fired. dm: damage dealt to each rival so far (each victim takes the difference). seen: what each rival had dealt us.
   dead: seconds until we are back (Infinity in co-op: until the wave is down). pick: waiting for the first weapon. m: chat lines to send.
   Co-op — auth: this page flies the drones (authN: whichever page does). ready: has caught up with the match, so may be chosen to fly them.
   ev/kx/bl: wave events, kills and drone shots to pass on. hq: hits on drones to report. rh: rams that hit us. pc: health packs taken.
   claimed/spent: packs and rams already used up here, so a late report does not bring them back.
   cd: seconds left of the countdown at the start of a match (nobody moves or shoots). taken: damage each rival has done us this life (for the recap when we go down). */
const net = { cd: 0, taken: {}, idleWarn: false, won: -1, ending: false, g: -1, k: 0, d: 0, lk: 0, f: 0, dm: {}, seen: {}, dead: 0, pick: false, sendT: 0, m: [],
  auth: false, authN: 0, ready: false, t0: 0, snap: false, ev: [], kx: [], bl: [], hq: {}, rh: [], pc: [], claimed: new Set(), spent: new Set(), wiped: -1 };
// One weapon per life in versus: chosen before the first spawn, and again while waiting to come back.
const pickEl = $('pick'); let pickI = 1;
const pickBtns = WEAPONS.map((w, i) => {
  const b = document.createElement('button'), n = document.createElement('b'), t = document.createElement('span');
  b.className = 'ghost'; n.textContent = `${i + 1} ${w.name}`; t.textContent = w.tip; b.append(n, t);
  b.addEventListener('click', () => pickWeapon(i)); $('pickList').append(b); return b;
});
function pickShow(title, note, bare, recap) { $('pickTitle').textContent = title; $('pickNote').textContent = note; $('pickRecap').textContent = recap || ''; $('pickRecap').hidden = !recap; $('pickList').hidden = !!bare; pickBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(!net.pick && k === pickI))); pickEl.hidden = false; }
function pickWeapon(i) {
  if (!pvp || state !== 'play' || !(net.pick || net.dead > 0)) return;
  pickI = i; tone('square', 320, 520, 0.05, 0.06);
  if (net.pick) { net.pick = false; vsRespawn(); net.sendT = 0; if (!(net.cd > 0)) { announce(`${MODES[R.mode].name} 開始`, remotes.size ? '相手を見つけて撃て' : '相手が来るのを待っています'); sfx.wave(); } } // (during the countdown it announces the start)
  else pickBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
}
const remotes = new Map(), inbox = new Map(); // by player number: the figures drawn, and what each page has sent since the last frame
// Names are typed by players and shown on other people's screens: strip control and direction-override characters, cap the length, and only ever insert as text.
const cleanText = (v, n) => Array.from(String(typeof v === 'string' ? v : '').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g, '').trim()).slice(0, n).join('');
const cleanName = v => cleanText(v, 10);
const nameInput = $('playerName'), vsNote = $('vsNote'), lbNote = $('lbNote'); let myName = cleanName(store.get('name', '')); nameInput.value = myName;
nameInput.addEventListener('input', () => nameInput.classList.remove('need'));
function needName() { // a room cannot be made or joined without a name
  myName = cleanName(nameInput.value); nameInput.value = myName;
  if (!myName) { nameInput.classList.add('need'); vsNote.textContent = 'ルームには名前が必要です。名前を入れてから、もう一度押してください。'; nameInput.focus(); return false; }
  store.set('name', myName); return true;
}

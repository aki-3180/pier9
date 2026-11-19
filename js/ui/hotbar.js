// The five weapon slots (solo and co-op): one button each, one tap to take that weapon. Each is placed and sized on its own in the layout editor. Which weapon sits in which slot is set on the title screen.
'use strict';
// hot[s] = the weapon (index into WEAPONS) in slot s. Kept only if it is still one of each weapon.
let hot = store.get('hot', null);
if (!Array.isArray(hot) || hot.length !== WEAPONS.length || WEAPONS.some((_, i) => !hot.includes(i))) hot = WEAPONS.map((_, i) => i);
const hotSlots = WEAPONS.map((_, s) => $('hot' + s)), hotAmmo = hotSlots.map(() => -1);
hotSlots.forEach((b, s) => b.addEventListener('pointerdown', e => { if (state !== 'play' || pvp) return; e.preventDefault(); setWeapon(hot[s]); })); // in the layout editor layout.js drags it instead
function paintHot() {
  hotSlots.forEach((b, s) => { const w = WEAPONS[hot[s]]; b.querySelector('b').textContent = w.name; b.setAttribute('aria-label', `${s + 1}番の枠 ${w.name}`); b.classList.toggle('on', hot[s] === wi); hotAmmo[s] = -1; });
}
function paintHotAmmo() { // a thin bar under each name: what is left in that weapon's magazine
  hotSlots.forEach((b, s) => { const w = hot[s], a = w === wi ? (reloadT > 0 ? 0 : ammo) : mags[w], f = Math.round(a / WEAPONS[w].mag * 100);
    if (f !== hotAmmo[s]) { hotAmmo[s] = f; b.style.setProperty('--a', f / 100); b.classList.toggle('low', f <= 25); } });
}
const cycleWeapon = d => setWeapon(hot[(hot.indexOf(wi) + d + hot.length) % hot.length]); // Q and the wheel step through the slots in their order
// on the title screen: tap one slot, then another, and the two swap
const hotSeg = $('hotSeg'); let hotPick = -1;
function paintHotSeg() {
  hotSeg.innerHTML = '';
  hot.forEach((w, s) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.s = s; b.innerHTML = `<small>${s + 1}</small>`; b.append(WEAPONS[w].name);
    b.setAttribute('aria-pressed', String(s === hotPick)); hotSeg.append(b); });
  $('hotNote').textContent = hotPick < 0 ? '入れ替えたい枠を2つ続けて押す' : `${hotPick + 1}番の ${WEAPONS[hot[hotPick]].name} と入れ替える枠を押す`;
}
hotSeg.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const s = +b.dataset.s;
  if (hotPick < 0) hotPick = s;
  else { if (s !== hotPick) { [hot[s], hot[hotPick]] = [hot[hotPick], hot[s]]; store.set('hot', hot); paintHot(); } hotPick = -1; }
  paintHotSeg();
});
$('hotReset').addEventListener('click', () => { hot = WEAPONS.map((_, i) => i); hotPick = -1; store.set('hot', hot); paintHot(); paintHotSeg(); });
paintHot(); paintHotSeg();

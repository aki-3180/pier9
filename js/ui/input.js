// Input: touch (stick, look, buttons), then mouse and keyboard.
'use strict';
const overlay = $('overlay'), lobbyEl = $('lobby');
let touchMode = matchMedia('(pointer: coarse)').matches;
const setTouch = () => { if (!touchMode) { touchMode = true; } document.body.classList.add('touch'); };
if (touchMode) setTouch();
const layer = $('touch'), stick = $('stick'), knob = stick.firstElementChild, fireBtn = $('fireBtn');
const joy = { id: null, bx: 0, by: 0, x: 0, y: 0, R: 48 }, look = { id: null, x: 0, y: 0 }, fb = { id: null, x: 0, y: 0 };
let firing = false, mouseFire = false, jumpHeld = false, jumpQ = 0; const keys = {};
const turn = (dx, dy) => { const s = SENS[cfg.sens] / (1 + (W.zoom - 1) * ads); P.yaw -= dx * s; P.pitch = Math.max(-1.2, Math.min(1.2, P.pitch - dy * s)); };
layer.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' || state !== 'play') return;
  setTouch(); e.preventDefault();
  // a stick the player has placed is grabbed on or near itself; an unplaced one floats anywhere on the left
  const sr = stick.getBoundingClientRect(), onStick = Array.isArray(lay.stick) ? Math.hypot(e.clientX - sr.left - sr.width / 2, e.clientY - sr.top - sr.height / 2) < sr.width * 0.75 : e.clientX < innerWidth * 0.45;
  if (joy.id === null && onStick) {
    joy.id = e.pointerId; joy.bx = e.clientX; joy.by = e.clientY; joy.x = joy.y = 0; joy.R = sr.width * 0.43;
    stick.classList.remove('idle'); stick.classList.add('placed'); stick.style.left = e.clientX + 'px'; stick.style.top = e.clientY + 'px'; knob.style.transform = '';
  } else if (look.id === null) { look.id = e.pointerId; look.x = e.clientX; look.y = e.clientY; }
  try { layer.setPointerCapture(e.pointerId); } catch (_) {}
});
layer.addEventListener('pointermove', e => {
  if (e.pointerId === joy.id) {
    let dx = e.clientX - joy.bx, dy = e.clientY - joy.by; const L = Math.hypot(dx, dy), R = joy.R;
    if (L > R) { dx *= R / L; dy *= R / L; }
    knob.style.transform = `translate(${dx}px,${dy}px)`; joy.x = dx / R; joy.y = dy / R;
  } else if (e.pointerId === look.id) { turn(e.clientX - look.x, e.clientY - look.y); look.x = e.clientX; look.y = e.clientY; }
});
const endTouch = e => {
  if (e.pointerId === joy.id) { joy.id = null; joy.x = joy.y = 0; stick.classList.add('idle'); knob.style.transform = ''; applyLayout(); }
  if (e.pointerId === look.id) look.id = null;
};
layer.addEventListener('pointerup', endTouch); layer.addEventListener('pointercancel', endTouch);
fireBtn.addEventListener('pointerdown', e => { e.preventDefault(); if (state !== 'play') return; fb.id = e.pointerId; fb.x = e.clientX; fb.y = e.clientY; firing = true; fireBtn.classList.add('down'); try { fireBtn.setPointerCapture(e.pointerId); } catch (_) {} });
fireBtn.addEventListener('pointermove', e => { if (e.pointerId !== fb.id) return; if (cfg.fdrag) turn(e.clientX - fb.x, e.clientY - fb.y); fb.x = e.clientX; fb.y = e.clientY; });
const endFire = e => { if (e.pointerId !== fb.id) return; fb.id = null; firing = false; fireBtn.classList.remove('down'); };
fireBtn.addEventListener('pointerup', endFire); fireBtn.addEventListener('pointercancel', endFire);
$('reloadBtn').addEventListener('pointerdown', e => { e.preventDefault(); if (state === 'play') startReload(); });
const jumpBtn = $('jumpBtn');
jumpBtn.addEventListener('pointerdown', e => { e.preventDefault(); if (state !== 'play') return; jumpHeld = true; jumpQ = 0.25; jumpBtn.classList.add('down'); try { jumpBtn.setPointerCapture(e.pointerId); } catch (_) {} });
const endJump = () => { jumpHeld = false; jumpBtn.classList.remove('down'); };
jumpBtn.addEventListener('pointerup', endJump); jumpBtn.addEventListener('pointercancel', endJump);
const aimBtn = $('aimBtn'), swapBtn = $('swapBtn');
function setAim(v) { aiming = v; aimBtn.classList.toggle('down', v); }
aimBtn.addEventListener('pointerdown', e => { e.preventDefault(); if (state === 'play') setAim(!aiming); }); // tap to raise, tap again to lower
swapBtn.addEventListener('pointerdown', e => { e.preventDefault(); if (state === 'play' && !pvp) setWeapon(wi + 1); });
setWeapon(wi, true);
// mouse + keyboard
let locked = false;
layer.addEventListener('mousedown', e => { if (state !== 'play' || touchMode && e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return; if (e.button === 2) setAim(true); else mouseFire = true;
  if (!locked && layer.requestPointerLock) { try { const p = layer.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (_) {} } });
addEventListener('mouseup', e => { if (e.button === 2) setAim(false); else mouseFire = false; });
addEventListener('wheel', e => { if (state === 'play' && !pvp && swapT <= 0 && e.deltaY) setWeapon(wi + (e.deltaY > 0 ? 1 : -1)); }, { passive: true });
addEventListener('mousemove', e => { if (state === 'play' && (locked || mouseFire)) turn(e.movementX || 0, e.movementY || 0); });
document.addEventListener('pointerlockchange', () => { const was = locked; locked = document.pointerLockElement === layer; if (was && !locked && state === 'play') pause(); });
addEventListener('keydown', e => { if (e.target && e.target.tagName === 'INPUT') return; // typing a name or a message is not game input
  keys[e.code] = true; if (state === 'play') { if (online && (e.code === 'Enter' || e.code === 'KeyT')) { e.preventDefault(); chatOpen(); return; } if (e.code === 'KeyR') startReload(); if (e.code === 'KeyQ' && !pvp) setWeapon(wi + 1); if (/^Digit[1-5]$/.test(e.code)) (pvp ? pickWeapon : setWeapon)(+e.code[5] - 1); if (e.code === 'Escape' || e.code === 'KeyP') pause(); if (e.code === 'Space') e.preventDefault(); } });
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouseFire = false; });
for (const ev of ['contextmenu', 'gesturestart', 'dblclick']) document.addEventListener(ev, e => e.preventDefault());

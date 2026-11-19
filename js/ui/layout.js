// Laying out the touch buttons: drag to move, resize, flip, reset.
'use strict';
const BTN = { fire: fireBtn, reload: $('reloadBtn'), jump: jumpBtn, aim: aimBtn, bar: hotbar, stick }, BNAME = { fire: '射撃', reload: '装填', jump: '跳ぶ', aim: '狙う', bar: '武器の枠', stick: '移動スティック' };
let lay = store.get('lay', {}), sz = store.get('sz', {}), sel = 'fire', editFrom = 'menu';
if (!lay || typeof lay !== 'object') lay = {};
if (!sz || typeof sz !== 'object') sz = {};
const sizeRange = $('sizeRange');
const scaleOf = k => { const v = +sz[k]; return v >= 0.6 && v <= 2 ? v : [0.82, 1, 1.22][cfg.bsize] || 1; }; // the old one-size-for-all setting is the fallback
const fit = (el, p) => { const hx = el.offsetWidth / 2 / innerWidth, hy = el.offsetHeight / 2 / innerHeight; // any spot, as long as the whole control stays on screen
  return [Math.max(hx, Math.min(1 - hx, p[0])), Math.max(hy, Math.min(1 - hy, p[1]))]; };
function applyLayout() {
  for (const k in BTN) {
    const el = BTN[k]; el.style.setProperty('--bs', scaleOf(k)); el.classList.toggle('sel', k === sel);
    if (k === 'stick' && joy.id !== null) continue; // in use: it sits under the thumb until released
    const p = Array.isArray(lay[k]) ? fit(el, lay[k]) : null; el.classList.toggle('placed', !!p); el.style.left = p ? p[0] * 100 + '%' : ''; el.style.top = p ? p[1] * 100 + '%' : '';
  }
  sizeRange.value = scaleOf(sel); $('sizeLbl').textContent = `${BNAME[sel]}の大きさ ${Math.round(scaleOf(sel) * 100)}%`;
}
function placeBar() { // keep the panel off the controls: centre if free, else top, else bottom
  const bar = $('editBar'), h = bar.offsetHeight, w = bar.offsetWidth, x0 = (innerWidth - w) / 2;
  for (const cy of [innerHeight / 2, h / 2 + 8, innerHeight - h / 2 - 8, innerHeight / 2]) {
    bar.style.top = cy + 'px'; let clear = true;
    for (const k in BTN) { const r = BTN[k].getBoundingClientRect(); if (r.right > x0 && r.left < x0 + w && r.bottom > cy - h / 2 && r.top < cy + h / 2) clear = false; }
    if (clear) break;
  }
}
const centre = el => { const r = el.getBoundingClientRect(); return [(r.left + r.width / 2) / innerWidth, (r.top + r.height / 2) / innerHeight]; };
for (const k in BTN) {
  const el = BTN[k]; let id = null;
  el.addEventListener('pointerdown', e => { if (state !== 'edit') return; e.preventDefault(); id = e.pointerId; sel = k; applyLayout(); try { el.setPointerCapture(id); } catch (_) {} });
  el.addEventListener('pointermove', e => { if (state !== 'edit' || e.pointerId !== id) return; lay[k] = fit(el, [e.clientX / innerWidth, e.clientY / innerHeight]); applyLayout(); });
  const up = e => { if (e.pointerId !== id) return; id = null; store.set('lay', lay); placeBar(); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
}
sizeRange.addEventListener('input', () => { sz[sel] = +sizeRange.value; store.set('sz', sz); applyLayout(); });
sizeRange.addEventListener('change', placeBar); // once the slider is let go, not while it is under the finger
applyLayout(); addEventListener('resize', applyLayout);
// layouts saved before the stick could be placed: it used to follow the side opposite the fire button, so keep it there
if (Array.isArray(lay.fire) && lay.fire[0] < 0.5 && !Array.isArray(lay.stick) && stick.offsetWidth) { const p = centre(stick); lay.stick = [1 - p[0], p[1]]; store.set('lay', lay); applyLayout(); }
$('layBtn').addEventListener('click', () => { editFrom = state; state = 'edit'; overlay.hidden = true; document.body.classList.add('editing'); applyLayout(); placeBar(); });
$('layFlip').addEventListener('click', () => { const next = {}; for (const k in BTN) { const p = centre(BTN[k]); next[k] = [1 - p[0], p[1]]; } lay = next; store.set('lay', lay); applyLayout(); placeBar(); });
$('layReset').addEventListener('click', () => { lay = {}; sz = {}; cfg.bsize = 1; store.set('lay', lay); store.set('sz', sz); store.set('bsize', 1); applyLayout(); placeBar(); });
$('layDone').addEventListener('click', () => show(editFrom));

// Settings and records kept in localStorage, and the segmented buttons that set them.
'use strict';
const store = {
  get(k, d) { try { const v = localStorage.getItem('pier9.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('pier9.' + k, JSON.stringify(v)); } catch (e) {} }
};
const cfg = { sens: store.get('sens', 1), auto: store.get('auto', 1), snd: store.get('snd', 1), fdrag: store.get('fdrag', 1), bsize: store.get('bsize', 1), map: store.get('map', 1), dmgo: store.get('dmgo', 75) };
if (![0, 25, 50, 75, 100].includes(cfg.dmgo)) cfg.dmgo = 75; // dmgo: how opaque the damage numbers are, in percent (0 = off)
let best = 0;
const SENS = [0.0028, 0.0044, 0.0066, 0.0095, 0.0135];
function bindSeg(id, key, after) {
  const seg = $(id);
  const paint = () => seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === cfg[key])));
  seg.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cfg[key] = +b.dataset.v; store.set(key, cfg[key]); paint(); if (after) after(); });
  paint(); return paint;
}
bindSeg('sensSeg', 'sens'); bindSeg('autoSeg', 'auto'); bindSeg('sndSeg', 'snd'); bindSeg('fdragSeg', 'fdrag'); bindSeg('dmgSeg', 'dmgo');

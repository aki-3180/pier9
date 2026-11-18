// The drones and bosses: their stats, models, spawning, being hit and going down; health packs.
'use strict';
const TYPES = {
  scout: { hp: 36, r: 0.6, speed: 4.2, range: 11, alt: 3.2, eye: 0xff4d3d, score: 100, scale: 1, name: '偵察機' },
  ram:   { hp: 24, r: 0.55, speed: 7.4, range: 0, alt: 3.0, eye: 0xffd23d, score: 150, scale: 0.85, name: '突撃機' },
  heavy: { hp: 150, r: 1.0, speed: 2.4, range: 14, alt: 4.4, eye: 0xff2d8a, score: 400, scale: 1.7, name: '重装機' },
  // the bosses all fly above the walls (5.4 m), so they are in sight from anywhere outdoors. hint: what to do, shown when one comes
  boss:   { hp: 2400, r: 2.0, speed: 2.0, range: 15, alt: 7.5, eye: 0xff4d3d, score: 5000, scale: 3.4, name: '統括機', boss: 1, body: 0x4a2226, hint: '突撃機を放つ　撃ち落とせ' },
  spread: { hp: 2000, r: 1.9, speed: 2.6, range: 14, alt: 6.6, eye: 0x6ad8ff, score: 4500, scale: 3.0, name: '扇撃機', boss: 1, body: 0x22384a, hint: '弾を扇に撒く　物陰に入れ' },
  charge: { hp: 1700, r: 1.7, speed: 3.2, range: 12, alt: 5.8, eye: 0xffa030, score: 4500, scale: 2.8, name: '衝角機', boss: 1, body: 0x5a3012, hint: '光ったら突っ込んでくる　横へ逃げろ' },
  sniper: { hp: 1400, r: 1.6, speed: 2.2, range: 26, alt: 8.6, eye: 0x7dffb0, score: 4500, scale: 2.6, name: '照準機', boss: 1, body: 0x1d3a2a, hint: '赤い線が出たら狙われている　隠れろ' }
};
const BOSSES = ['spread', 'charge', 'sniper', 'boss']; // the order they come in
const G = {
  body: new THREE.SphereGeometry(0.5, 14, 10), eye: new THREE.SphereGeometry(0.16, 10, 8),
  ring: new THREE.TorusGeometry(0.72, 0.045, 6, 20), rotor: new THREE.CylinderGeometry(0.3, 0.3, 0.02, 12), arm: new THREE.BoxGeometry(1.5, 0.05, 0.08)
};
const rotorMat = new THREE.MeshBasicMaterial({ color: 0x9fb0c8, transparent: true, opacity: 0.28, depthWrite: false });
const enemies = [], TYPEK = ['scout', 'ram', 'heavy', 'boss', 'spread', 'charge', 'sniper'];
const BOSS_FROM = 20, BOSS_EVERY = 5; // alone: a boss on wave 20, then on every fifth wave. In co-op: one every wave
const bossGeo = { spike: new THREE.ConeGeometry(0.22, 0.7, 10), barrel: new THREE.CylinderGeometry(0.05, 0.07, 1.1, 8), big: new THREE.SphereGeometry(0.24, 12, 10) };
let eidSeq = 0; // drone ids: in co-op each page numbers its own from its player number up, so a page that takes over never reuses one
const newId = () => (online ? R.you * 1e6 : 0) + (++eidSeq);
function spawnEnemy(type, from, rep) { // from: a boss letting this one go from its own belly. rep: a drone another page flies, as [id, x, y, z, hp, max]
  const T = TYPES[type], g = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: T.body || (type === 'ram' ? 0x5a3a22 : type === 'heavy' ? 0x3a2f48 : 0x394454), emissive: 0x000000 });
  const eyeMat = () => new THREE.MeshBasicMaterial({ color: T.eye, fog: false });
  mk(G.body, bodyMat, 0, 0, 0, g).scale.set(1, 0.62, 1);
  if (type !== 'sniper') mk(G.eye, eyeMat(), 0, 0, 0.42, g);
  const eg = glow(T.eye, 1.3); eg.position.set(0, 0, 0.5); g.add(eg);
  mk(G.ring, darkMat, 0, 0, 0, g).rotation.x = Math.PI / 2;
  mk(G.arm, darkMat, 0, 0.12, 0, g);
  const rotors = [mk(G.rotor, rotorMat, -0.75, 0.17, 0, g), mk(G.rotor, rotorMat, 0.75, 0.17, 0, g)];
  if (T.boss) { // every boss: four rotors and a second ring standing upright; then what marks each one out
    mk(G.arm, darkMat, 0, 0.12, 0, g).rotation.y = Math.PI / 2; rotors.push(mk(G.rotor, rotorMat, 0, 0.17, -0.75, g), mk(G.rotor, rotorMat, 0, 0.17, 0.75, g));
    mk(G.ring, darkMat, 0, 0, 0, g).scale.setScalar(0.8);
    if (type === 'boss') for (const sx of [-0.24, 0.24]) mk(G.eye, new THREE.MeshBasicMaterial({ color: 0xffd23d, fog: false }), sx, -0.06, 0.38, g).scale.setScalar(0.5); // an eye to either side of the main one
    if (type === 'spread') for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; mk(G.eye, eyeMat(), Math.cos(a) * 0.3, Math.sin(a) * 0.17, 0.36, g).scale.setScalar(0.42); } // a ring of small eyes: the muzzles of the fan
    if (type === 'charge') { const s = mk(bossGeo.spike, darkMat, 0, -0.02, 0.68, g); s.rotation.x = Math.PI / 2; for (const sx of [-0.2, 0.2]) mk(G.eye, eyeMat(), sx, 0.07, 0.36, g).scale.setScalar(0.55); } // a ram on its nose
    if (type === 'sniper') { mk(bossGeo.big, eyeMat(), 0, 0.02, 0.36, g); const b = mk(bossGeo.barrel, darkMat, 0, -0.2, 0.55, g); b.rotation.x = Math.PI / 2; } // one big eye over a long barrel
  }
  g.scale.setScalar(T.scale);
  const side = MAP.sides[Math.random() * MAP.sides.length | 0], a = Math.random() * 2 - 1;
  const e = { id: rep ? rep[0] : newId(), type, T, g, bodyMat, rotors, eg, hp: T.boss ? T.hp * bossScale() * (coop && type === 'charge' ? 1.2 : 1) : T.hp * (1 + wave * 0.02), r: T.r, st: 6,
    x: from ? from.x + Math.random() * 2 - 1 : side < 2 ? a * MAP.dx : side === 2 ? -MAP.dx : MAP.dx, z: from ? from.z + Math.random() * 2 - 1 : side === 0 ? -MAP.dz : side === 1 ? MAP.dz : a * MAP.dz, y: from ? from.y - 1.5 : MAP.fly || (T.boss ? 26 : 11),
    vx: 0, vz: 0, orbit: Math.random() < 0.5 ? 1 : -1, ph: Math.random() * 6, cd: 2.5 + Math.random() * 2, burst: 0, bt: 0, flash: 0, tg: null, tgT: 0, ch: 0, chT: 0, half: false, tgn: 0,
    speed: T.speed * (1 + Math.min(wave, 20) * 0.0125) };
  e.max = e.hp;
  if (rep) { e.x = e.tx = rep[1]; e.y = e.ty = rep[2]; e.z = e.tz = rep[3]; e.hp = rep[4]; e.max = rep[5]; }
  g.position.set(e.x, e.y, e.z); scene.add(g); enemies.push(e);
  if (T.boss && !from) bossArrive(e);
}
function killEnemy(e, silent) {
  scene.remove(e.g); e.bodyMat.dispose(); e.g.children.forEach(c => { if (c.material && c.material !== darkMat && c.material !== rotorMat) c.material.dispose(); });
  if (e.laser) { scene.remove(e.laser); e.laser.material.dispose(); }
  enemies.splice(enemies.indexOf(e), 1);
  if (silent) return;
  if (e.T.boss) { bossDown(e); return; }
  fx(e.x, e.y, e.z, 5 * e.T.scale, COL.sodium, 0.35); fx(e.x, e.y, e.z, 2.4 * e.T.scale, '#ffffff', 0.18); sfx.boom();
}
/* boss staging, kept light: a siren and a red pulse round the screen as one comes down from the sky; at half health it speeds up;
   going down, a few explosions one after another, a white flash and a short shake. */
const booms = []; let shakeT = 0;
function bossScale() { // alone the boss grows from wave 20 on; in co-op one comes every wave, so it starts small and grows with the wave and the players
  return coop ? (0.18 + 0.045 * wave) * (1 + 0.6 * (crowd() - 1)) : Math.max(1, wave / BOSS_FROM);
}
function pulse(id) { const el = $(id); el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); }
function bossArrive(e) {
  announce(`${e.T.name} 接近`, e.T.hint); pulse('alert');
  if (ac && cfg.snd) for (let i = 0; i < 3; i++) setTimeout(() => tone('sawtooth', 520, 880, 0.32, 0.05), i * 420);
}
function bossDown(e) {
  announce(`${e.T.name} 撃破`, `+${e.T.score}`); pulse('bflash'); sfx.boom(); setTimeout(() => sfx.boom(), 260);
  for (let i = 0; i < 6; i++) booms.push({ t: i * 0.11, x: e.x + (Math.random() - 0.5) * 4, y: e.y + (Math.random() - 0.5) * 2.5, z: e.z + (Math.random() - 0.5) * 4, s: e.T.scale * (1.6 + Math.random() * 1.6) });
  fx(e.x, e.y, e.z, 9 * e.T.scale, '#ffffff', 0.3);
  if (!reduceMotion && Math.hypot(e.x - P.x, e.z - P.z) < 60) shakeT = 0.45;
}
const pickGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5), pickMat = new THREE.MeshBasicMaterial({ color: 0x27a394, fog: false });
const pickups = [];
function dropPickup(x, z, id, life) { const m = mk(pickGeo, pickMat, x, 0.7, z); const g = glow(0x27a394, 2.2); m.add(g); pickups.push({ id: id || newId(), m, x, z, life: life || 60 }); }
function removePickup(p) { scene.remove(p.m); pickups.splice(pickups.indexOf(p), 1); }
// A hit on a drone, on the page that flies it. by: the player who fired (their number in co-op, 0 alone).
function hurtDrone(e, amt, by) {
  e.flash = 0.09; if ((e.hp -= amt) > 0) return;
  const who = by && by !== R.you ? remotes.get(by) : null, low = who ? who.hp < 45 : P.hp < 45;
  score += e.T.score;
  if (e.T.boss || Math.random() < (low ? 0.38 : 0.14) + (wave - 1) * 0.005) dropPickup(e.x, e.z);
  if (coop) { net.kx.push([e.id, by]); if (by === R.you) net.k++; }
  killEnemy(e);
}

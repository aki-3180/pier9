// Pools reused every frame: tracers, flashes, and the drones' bolts.
'use strict';
const tracers = [];
for (let i = 0; i < 14; i++) { const m = mk(new THREE.BoxGeometry(0.03, 0.03, 1), new THREE.MeshBasicMaterial({ color: 0xffd08a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), 0, 0, 0); m.visible = false; tracers.push({ m, life: 0 }); }
let tracerI = 0;
const fxPool = [];
for (let i = 0; i < 16; i++) { const s = glow(0xffffff, 1); s.visible = false; scene.add(s); fxPool.push({ s, life: 0, max: 1, size: 1 }); }
let fxI = 0;
function fx(x, y, z, size, color, life) { const f = fxPool[fxI = (fxI + 1) % fxPool.length]; f.s.position.set(x, y, z); f.s.material.color.set(color); f.s.material.opacity = 1; f.size = size; f.life = f.max = life; f.s.visible = true; }
const boltGeo = new THREE.SphereGeometry(0.16, 8, 6), boltMat = new THREE.MeshBasicMaterial({ color: 0xff6a4d, fog: false });
const bolts = [];
for (let i = 0; i < 160; i++) { const m = mk(boltGeo, boltMat, 0, -10, 0); m.visible = false; const g = glow(0xff4d3d, 1.1); m.add(g); bolts.push({ m, on: false, vx: 0, vy: 0, vz: 0, dmg: 0, life: 0 }); }

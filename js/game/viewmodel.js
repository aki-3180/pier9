// The gun in hand, drawn over the scene: its models, the reflex sight and the red dot.
'use strict';
gunScene.add(new THREE.HemisphereLight(0xb8c6e6, 0x40301c, 1.1));
const gl = new THREE.DirectionalLight(0xffc880, 0.8); gl.position.set(-1, 2, 1); gunScene.add(gl);
const gun = new THREE.Group(); gun.scale.setScalar(0.8); gunScene.add(gun);
// Reflex sight on every weapon without a scope: a rail and a mount carrying a frame around a glass window SW wide and SH tall, its sill SY above the middle of the body and SZ behind it.
// The middle of the window is the point the eye comes to when aiming, and the dot is drawn where the line of sight crosses the glass.
const SW = 0.048, SH = 0.04, SY = 0.068, SZ = 0.13;
const RS = { base: new THREE.BoxGeometry(0.034, 0.018, 0.06), rail: new THREE.BoxGeometry(0.026, 0.006, 0.2), post: new THREE.BoxGeometry(0.005, SH, 0.02), bar: new THREE.BoxGeometry(SW + 0.01, 0.005, 0.02), knob: new THREE.CylinderGeometry(0.007, 0.007, 0.008, 8), lens: new THREE.PlaneGeometry(SW, SH) };
const sightMat = new THREE.MeshLambertMaterial({ color: 0x222a35 });
const lensMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, map: canvasTex(64, 64, g => {
  g.fillStyle = 'rgba(120,205,195,.1)'; g.fillRect(0, 0, 64, 64);
  const s = g.createLinearGradient(0, 64, 64, 0); s.addColorStop(0.3, 'rgba(255,255,255,0)'); s.addColorStop(0.46, 'rgba(255,255,255,.1)'); s.addColorStop(0.6, 'rgba(255,255,255,0)'); g.fillStyle = s; g.fillRect(0, 0, 64, 64);
}) });
const guns = WEAPONS.map(w => {
  const [len, br, bt, mh, mw, st] = w.model, g = new THREE.Group(), f = 0.21 - len;
  const body = new THREE.MeshLambertMaterial({ color: 0x2b323d }), acc = new THREE.MeshLambertMaterial({ color: 0xffb347 }), blk = new THREE.MeshLambertMaterial({ color: 0x12161d });
  mk(new THREE.BoxGeometry(0.06, 0.09, len), body, 0, 0, 0.21 - len / 2, g);
  mk(new THREE.BoxGeometry(0.062, 0.02, len * 0.48), acc, 0, 0.02, 0.15 - len / 2, g);
  mk(new THREE.CylinderGeometry(bt, bt, br, 8), blk, 0, 0.012, f - br / 2 + 0.02, g).rotation.x = Math.PI / 2;
  if (mh) mk(new THREE.BoxGeometry(mw, mh, 0.06), blk, 0, -0.03 - mh / 2, 0.02, g).rotation.x = 0.2;
  mk(new THREE.BoxGeometry(0.045, 0.12, 0.07), blk, 0, -0.09, 0.15, g).rotation.x = -0.3;
  if (st) mk(new THREE.BoxGeometry(0.05, 0.08, st), body, 0, -0.015, 0.21 + st / 2, g);
  // eye: height and depth of the point on the gun that the eye lines up with when aiming, and how far in front of the eye it then sits
  if (w.scope) { mk(new THREE.CylinderGeometry(0.024, 0.024, 0.22, 10), blk, 0, 0.085, 0.02, g).rotation.x = Math.PI / 2; mk(new THREE.BoxGeometry(0.016, 0.03, 0.14), blk, 0, 0.055, 0.02, g); g.userData.eye = [0.085, 0.13, 0.07]; }
  else {
    mk(RS.rail, blk, 0, 0.048, 0.01, g); mk(RS.base, blk, 0, SY - 0.014, SZ - 0.012, g);
    for (const s of [-1, 1]) { mk(RS.post, sightMat, s * (SW + 0.005) / 2, SY + SH / 2, SZ, g); mk(RS.bar, sightMat, 0, SY + SH / 2 + s * (SH + 0.005) / 2, SZ, g); }
    mk(RS.knob, acc, 0.021, SY - 0.014, SZ - 0.025, g).rotation.z = Math.PI / 2;
    g.userData.lens = mk(RS.lens, lensMat, 0, SY + SH / 2, SZ, g); g.userData.eye = [SY + SH / 2, SZ, 0.187];
  }
  if (w.n > 1) mk(new THREE.BoxGeometry(0.05, 0.04, 0.16), acc, 0, -0.03, f - 0.12, g); // pump grip
  g.userData.fz = f - br - 0.01; g.visible = false; gun.add(g); return g;
});
const flash = glow(0xffc46b, 0.3); flash.position.set(0, 0.012, -0.52); flash.visible = false; gun.add(flash);
// The dot: flat on the glass, always on the line of sight, so it sits on the point of aim however the gun sways.
// (Nothing is drawn round it on a lock: a ring there hid the target more than it helped.)
const reticle = (size, draw) => { const m = mk(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: canvasTex(size, size, draw), transparent: true, depthWrite: false }), 0, 0, 0, gunScene); m.renderOrder = 2; m.visible = false; return m; };
const dot = reticle(64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,236,224,1)'); r.addColorStop(0.16, 'rgba(255,70,48,1)'); r.addColorStop(0.28, 'rgba(255,45,30,.9)'); r.addColorStop(0.42, 'rgba(255,40,24,.28)'); r.addColorStop(1, 'rgba(255,40,24,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
const m4 = new THREE.Matrix4();

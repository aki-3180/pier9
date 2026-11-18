// Map 0: コンテナ場 (the container yard).
'use strict';
// map 0: the container yard
function buildYard(m) {
  seed = 9;
  const g = new THREE.Group(), bx = [], HALF = 30;
  const groundTex = canvasTex(1024, 1024, (g, w) => {
    g.fillStyle = '#1b202b'; g.fillRect(0, 0, w, w);
    for (let i = 0; i < 9000; i++) { const v = 20 + rnd() * 40 | 0; g.fillStyle = `rgba(${v + 10},${v + 14},${v + 22},.5)`; g.fillRect(rnd() * w, rnd() * w, 2, 2); }
    g.strokeStyle = 'rgba(255,179,71,.5)'; g.lineWidth = 5;
    for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(i * 128, 40); g.lineTo(i * 128, w - 40); g.stroke(); }
    g.strokeStyle = 'rgba(238,242,234,.35)'; g.lineWidth = 3;
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(40, i * 256); g.lineTo(w - 40, i * 256); g.stroke(); }
    g.fillStyle = '#1b202b'; g.beginPath(); g.arc(512, 512, 150, 0, 7); g.fill();
    g.strokeStyle = 'rgba(238,242,234,.3)'; g.lineWidth = 6; g.beginPath(); g.arc(512, 512, 132, 0, 7); g.stroke();
    g.fillStyle = 'rgba(238,242,234,.32)'; g.font = '700 200px "Chakra Petch",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('9', 512, 524);
    g.strokeStyle = 'rgba(255,179,71,.8)'; g.lineWidth = 14; g.setLineDash([36, 28]); g.strokeRect(20, 20, w - 40, w - 40);
  });
  groundTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  mk(new THREE.PlaneGeometry(HALF * 2 + 8, HALF * 2 + 8), new THREE.MeshLambertMaterial({ map: groundTex }), 0, 0, 0, g).rotation.x = -Math.PI / 2;
  mk(new THREE.PlaneGeometry(600, 600), new THREE.MeshLambertMaterial({ color: 0x10141c }), 0, -0.05, 0, g).rotation.x = -Math.PI / 2;
  const LAYOUT = [ // x, z, axis (0 = long side along x), stack, hull
    [-12, -8, 0, 2, 0], [-12, -5.5, 0, 1, 1], [-5, -14, 1, 1, 2], [-2.5, -14, 1, 2, 3], [8, -10, 0, 1, 0], [8, -7.5, 0, 2, 4], [15, -17, 1, 1, 1],
    [-18, 6, 1, 2, 2], [-15.5, 6, 1, 1, 0], [-8, 12, 0, 1, 3], [-8, 14.5, 0, 2, 1], [4, 10, 1, 1, 4], [12, 8, 0, 2, 2], [12, 10.5, 0, 1, 0], [19, 1, 1, 1, 3],
    [-22, -18, 0, 1, 4], [-23, 17, 0, 2, 0], [22, 19, 0, 1, 1], [24, -7, 1, 2, 2], [0, 22, 0, 1, 3], [1, -24, 0, 2, 1], [-25, -3, 1, 1, 3], [10, 23, 1, 1, 0], [-10, -24, 1, 1, 4]
  ];
  const inst = []; // visual instances: [x,y,z,axis,hull]
  for (const [x, z, ax, st, hc] of LAYOUT) {
    bx.push({ x, z, hx: ax ? CW / 2 : CL / 2, hz: ax ? CL / 2 : CW / 2, y0: 0, h: CH * st });
    for (let s = 0; s < st; s++) inst.push([x, CH * (s + 0.5), z, ax, (hc + s * 2) % 5]);
  }
  for (let side = 0; side < 4; side++) for (let i = -5; i <= 5; i++) { // perimeter stacks
    const a = i * 6.25, d = HALF + 3.6, st = 2 + (rnd() * 2.4 | 0);
    const x = side === 0 ? a : side === 1 ? a : side === 2 ? -d : d, z = side === 0 ? -d : side === 1 ? d : a;
    bx.push({ x, z, hx: side < 2 ? CL / 2 : CW / 2, hz: side < 2 ? CW / 2 : CL / 2, y0: 0, h: CH * st });
    for (let s = 0; s < st; s++) inst.push([x, CH * (s + 0.5), z, side < 2 ? 0 : 1, rnd() * 5 | 0]);
  }
  const contMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(CL, CH, CW), new THREE.MeshLambertMaterial({ map: corr }), inst.length);
  { const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), p = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), col = new THREE.Color();
    inst.forEach(([x, y, z, ax, hc], i) => { q.setFromAxisAngle(up, ax ? Math.PI / 2 : 0); mt.compose(p.set(x, y, z), q, one); contMesh.setMatrixAt(i, mt); contMesh.setColorAt(i, col.setHex(HULLS[hc])); }); }
  contMesh.frustumCulled = false; g.add(contMesh); // instances sit far from the mesh's own origin, so its bounds say nothing
  // crates: one jump high. On the ground they are the step up to a single container;
  // on a single's roof they are the step up to the double stacked beside it.
  const CRATES = [ // x, z, base height
    [-10.5, -3.58, 0], [-13.5, -5.5, CH], [-6.92, -13, 0], [-5, -15.5, CH], [9, -11.92, 0], [6.5, -10, CH],
    [-7, 10.08, 0], [-9.5, 12, CH], [13, 12.42, 0], [10.5, 10.5, CH], [-13.58, 7, 0], [-15.5, 4.5, CH],
    [16.92, -16, 0], [5.92, 9, 0], [17.08, 2, 0], [-21, -16.08, 0], [21, 17.08, 0], [1, 20.08, 0], [-23.08, -2, 0], [8.08, 22, 0], [-8.08, -23, 0]
  ];
  const crateMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 1.3, 1.4), new THREE.MeshLambertMaterial({ map: crateTex }), CRATES.length);
  { const mt = new THREE.Matrix4(); CRATES.forEach(([x, z, y0], i) => { bx.push({ x, z, hx: 0.7, hz: 0.7, y0, h: y0 + 1.3 }); mt.makeTranslation(x, y0 + 0.65, z); crateMesh.setMatrixAt(i, mt); }); }
  crateMesh.frustumCulled = false; g.add(crateMesh);
  for (const [x, z] of [[-27, -27], [27, -27], [-27, 27], [27, 27]]) { // lamps
    mk(new THREE.BoxGeometry(0.3, 11, 0.3), darkMat, x, 5.5, z, g);
    const l = new THREE.PointLight(0xffb347, 1.5, 52, 1.6); l.position.set(x * 0.92, 10.6, z * 0.92); g.add(l);
    const s = glow(0xffb347, 7); s.position.copy(l.position); g.add(s);
  }
  cranes(g, [[-34, -62], [30, -62]]);
  m.g = g; m.boxes = m.hard = bx; m.lx = m.lz = HALF + 3.6 - CW / 2 - 0.5; // the player walks right up to the perimeter stacks
  m.dx = m.dz = HALF + 1;
}

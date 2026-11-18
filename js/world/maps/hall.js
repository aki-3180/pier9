// Map 4: 上屋 (the transit shed, indoors).
'use strict';
// map 4: an old transit shed on the pier, indoors. One long hall under a pitched roof, the afternoon sun coming in through the high windows on the west wall.
// Point-symmetric like the market. In the middle a scaffold tower, up two flights of stairs; around it wrecked cars left at angles, containers, a pallet rack,
// and two site offices with no roof. The roof is only drawn: the drones come in through the high windows and fly under it (MAPS[4].fly).
function buildHall(m) {
  seed = 101;
  const K = kit(), g = K.g, PI = Math.PI, HX = 17, HZ = 27, EAVE = 10.5, RIDGE = 13.2, OH = 2.8; // OH: the offices' walls
  const WALL = 0x8d969e, PLINTH = 0x9a9890, ROOF = 0x48505a, STEEL = 0x556070, DARK = 0x1c222b, BLK = 0x0d1015, YEL = 0xe0a81e, ORANGE = 0xd0742a,
    RACK = 0x2c5c9c, PLY = 0xc9a26a, PLY2 = 0xb08a58, CARD = 0xb08d5e, WHITE = 0xe2e6e2, SUN = 0xffe2b0;
  const SDX = 0.95, SDZ = 0.18; // the sun's way down: so far east and south for every metre it falls
  const WIN = [-24, -18, -12, -6, 0, 6, 12, 18, 24], WY0 = 6.6, WY1 = 9.4, WW = 2.6; // the high windows, between the columns: centres along z, sill, head, width
  const gt = canvasTex(1024, 1024, (c, w) => {
    c.fillStyle = '#5d5b57'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 12000; i++) { const v = 60 + rnd() * 60 | 0; c.fillStyle = `rgba(${v},${v - 2},${v - 6},.35)`; c.fillRect(rnd() * w, rnd() * w, 2, 2); }
    const sx = w / (HX * 2), sz = w / (HZ * 2); c.setTransform(sx, 0, 0, sz, HX * sx, HZ * sz);
    const R = (x0, x1, z0, z1, f) => { c.fillStyle = f; c.fillRect(x0, z0, x1 - x0, z1 - z0); };
    for (let x = -HX + 5.67; x < HX - 1; x += 5.67) R(x - 0.03, x + 0.03, -HZ, HZ, 'rgba(20,20,22,.35)'); // saw cuts in the slab
    for (let z = -HZ + 6; z < HZ - 1; z += 6) R(-HX, HX, z - 0.03, z + 0.03, 'rgba(20,20,22,.35)');
    for (const s of [1, -1]) {
      const Q = (x0, x1, z0, z1, f) => s > 0 ? R(x0, x1, z0, z1, f) : R(-x1, -x0, -z1, -z0, f);
      Q(4.25, 5.05, -HZ, HZ, 'rgba(18,20,24,.75)'); // an old rail trench the length of the hall, one each side of the tower
      for (const x of [4.42, 4.82]) Q(x, x + 0.07, -HZ, HZ, 'rgba(150,150,150,.6)');
      Q(-HX + 2.6, -HX + 2.75, -HZ, 0, 'rgba(224,168,30,.55)'); // the walkway line beside the rack
      for (let x = 2; x < 11; x += 0.9) Q(x, x + 0.45, -HZ + 0.3, -HZ + 0.9, 'rgba(224,168,30,.55)'); // hatching in front of the shutter
      Q(-3.3, 3.3, -HZ + 1.6, -HZ + 1.7, 'rgba(238,242,234,.4)');
    }
    for (let i = 0; i < 16; i++) { const x = -HX + 2 + rnd() * (HX * 2 - 4), z = -HZ + 2 + rnd() * (HZ * 2 - 4), r = 0.5 + rnd() * 1.4, gr = c.createRadialGradient(x, z, 0, x, z, r); gr.addColorStop(0, 'rgba(12,10,8,.45)'); gr.addColorStop(1, 'rgba(12,10,8,0)'); R(x - r, x + r, z - r, z + r, gr); } // oil
    c.globalCompositeOperation = 'lighter'; // the sun on the floor, under each high window
    for (const zc of WIN) {
      const z0 = zc - WW / 2, z1 = zc + WW / 2, P = [[-HX + SDX * WY0, z0 + SDZ * WY0], [-HX + SDX * WY0, z1 + SDZ * WY0], [-HX + SDX * WY1, z1 + SDZ * WY1], [-HX + SDX * WY1, z0 + SDZ * WY1]];
      c.fillStyle = 'rgba(255,214,150,.42)'; c.beginPath(); P.forEach(([x, z], i) => i ? c.lineTo(x, z) : c.moveTo(x, z)); c.fill();
    }
  });
  gt.anisotropy = renderer.capabilities.getMaxAnisotropy();
  mk(new THREE.PlaneGeometry(HX * 2, HZ * 2), new THREE.MeshLambertMaterial({ map: gt }), 0, 0, 0, g).rotation.x = -PI / 2;
  mk(new THREE.PlaneGeometry(600, 600), new THREE.MeshLambertMaterial({ color: 0x555b63 }), 0, -0.05, 0, g).rotation.x = -PI / 2;

  // the shell: sheet-metal walls on a concrete plinth, steel columns along the long walls, the high windows. The gables and the roof are only drawn
  for (const s of [-1, 1]) {
    K.box('conc', s > 0 ? HX : -HX - 0.4, s > 0 ? HX + 0.4 : -HX, 0, 1.2, -HZ - 0.4, HZ + 0.4, PLINTH); K.box('corr', s > 0 ? HX : -HX - 0.4, s > 0 ? HX + 0.4 : -HX, 1.2, EAVE, -HZ - 0.4, HZ + 0.4, WALL);
    K.box('conc', -HX, HX, 0, 1.2, s > 0 ? HZ : -HZ - 0.4, s > 0 ? HZ + 0.4 : -HZ, PLINTH); K.box('corr', -HX, HX, 1.2, EAVE, s > 0 ? HZ : -HZ - 0.4, s > 0 ? HZ + 0.4 : -HZ, WALL);
    for (let z = -HZ + 6; z < HZ - 1; z += 6) K.box('flat', s > 0 ? HX - 0.35 : -HX, s > 0 ? HX : -HX + 0.35, 0, EAVE, z - 0.2, z + 0.2, STEEL); // columns
    for (const zc of WIN) { const x = s * (HX - 0.02); K.box('lit', x - 0.02, x + 0.02, WY0, WY1, zc - WW / 2, zc + WW / 2, s < 0 ? 0xfff1d6 : 0xd7e2ea, 0); // sunlit glass in the west wall, sky in the east
      for (let k = 1; k < 4; k++) { const zz = zc - WW / 2 + k * WW / 4; K.box('flat', x - 0.04, x + 0.04, WY0, WY1, zz - 0.04, zz + 0.04, DARK, 0); } K.box('flat', x - 0.04, x + 0.04, (WY0 + WY1) / 2 - 0.04, (WY0 + WY1) / 2 + 0.04, zc - WW / 2, zc + WW / 2, DARK, 0); }
  }
  const roofMat = new THREE.MeshLambertMaterial({ map: corr, color: ROOF, side: THREE.DoubleSide }), slope = Math.atan2(RIDGE - EAVE, HX), run = Math.hypot(HX, RIDGE - EAVE) + 0.6;
  const skyGeo = new THREE.BoxGeometry(3, 0.04, 3.2), skyMat = new THREE.MeshBasicMaterial({ color: 0xc9d6e0 });
  for (const s of [-1, 1]) {
    const r = mk(new THREE.BoxGeometry(run, 0.18, HZ * 2 + 1), roofMat, s * HX / 2, (EAVE + RIDGE) / 2 + 0.1, 0, g); r.rotation.z = -s * slope;
    for (let z = -21; z <= 21; z += 10.5) mk(skyGeo, skyMat, s * HX * 0.42, EAVE + (RIDGE - EAVE) * 0.58, z, g).rotation.z = -s * slope; // skylights
    const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.Float32BufferAttribute([-HX - 0.4, EAVE, 0, HX + 0.4, EAVE, 0, 0, RIDGE + 0.3, 0], 3)); tri.computeVertexNormals(); // the gable end
    mk(tri, new THREE.MeshLambertMaterial({ color: WALL, side: THREE.DoubleSide }), 0, 0, s * (HZ + 0.2), g);
  }
  const trussMat = new THREE.MeshLambertMaterial({ color: 0x39424e }), TG = [new THREE.BoxGeometry(HX * 2, 0.3, 0.22), new THREE.BoxGeometry(0.2, RIDGE - EAVE, 0.2), new THREE.BoxGeometry(run - 0.6, 0.3, 0.22)];
  for (let z = -HZ + 6; z < HZ - 1; z += 6) { // roof trusses on the columns: a tie, two rafters, a king post, and posts between
    mk(TG[0], trussMat, 0, EAVE - 0.15, z, g); mk(TG[1], trussMat, 0, (EAVE + RIDGE) / 2, z, g);
    for (const s of [-1, 1]) { mk(TG[2], trussMat, s * HX / 2, (EAVE + RIDGE) / 2 - 0.15, z, g).rotation.z = -s * slope;
      for (const f of [0.33, 0.66]) K.box('flat', s * HX * (1 - f) - 0.06, s * HX * (1 - f) + 0.06, EAVE, EAVE + (RIDGE - EAVE) * f, z - 0.06, z + 0.06, 0x39424e, 0); }
  }
  for (const [x, z] of [[-8, -15], [8, -3], [-8, 9], [8, 21], [8, -15], [-8, -3], [8, 9], [-8, 21]]) { // hanging lamps
    K.box('flat', x - 0.02, x + 0.02, 8.4, EAVE - 0.3, z - 0.02, z + 0.02, BLK, 0); K.box('flat', x - 0.45, x + 0.45, 8.15, 8.4, z - 0.45, z + 0.45, DARK, 0); K.box('lit', x - 0.35, x + 0.35, 8.13, 8.16, z - 0.35, z + 0.35, 0xfff0d0, 0);
  }
  for (const [x, z] of [[-8, -15], [8, 15], [8, -3], [-8, 3]]) { const l = new THREE.PointLight(0xffe0b0, 0.55, 26, 1.6); l.position.set(x, 7.8, z); g.add(l); }

  // shafts of sun from the west windows down to the floor: a faint glow, drawn only
  const shaftMat = new THREE.MeshBasicMaterial({ color: SUN, transparent: true, opacity: 0.075, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  for (const zc of WIN) {
    const z0 = zc - WW / 2, z1 = zc + WW / 2, x = -HX + 0.05, v = [];
    for (const [y, zz] of [[WY0, z0], [WY0, z1], [WY1, z1], [WY1, z0]]) v.push([x, y, zz]);
    for (const [y, zz] of [[WY0, z0], [WY0, z1], [WY1, z1], [WY1, z0]]) v.push([x + SDX * y, 0.02, zz + SDZ * y]);
    const F = [[0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], pos = [];
    for (const [a, b, c, d] of F) for (const i of [a, b, c, a, c, d]) pos.push(...v[i]);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); mk(geo, shaftMat, 0, 0, 0, g);
  }

  // a wrecked car turned to any angle. Drawn as a turned group; it stops feet and shots as three upright boxes along its length (the corners stick out a little)
  const carMat = {}, car = (x, z, ry, color) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c);
    const body = carMat[color] || (carMat[color] = new THREE.MeshLambertMaterial({ color }));
    mk(new THREE.BoxGeometry(4.2, 0.62, 1.78), body, 0, 0.58, 0, c); mk(new THREE.BoxGeometry(3.8, 0.2, 1.5), new THREE.MeshLambertMaterial({ color: 0x15181d }), 0, 0.2, 0, c); mk(new THREE.BoxGeometry(2.1, 0.55, 1.6), body, -0.25, 1.2, 0, c);
    mk(new THREE.BoxGeometry(2.0, 0.42, 1.64), new THREE.MeshLambertMaterial({ color: 0x1a2028 }), -0.25, 1.2, 0, c); // the glass, gone dark
    mk(new THREE.BoxGeometry(0.1, 0.26, 1.5), new THREE.MeshLambertMaterial({ color: 0x8a5a3c }), 2.1, 0.62, 0, c); // rust on the nose
    for (const u of [-1.35, 1.35]) for (const w of [-0.8, 0.8]) { const t = mk(new THREE.CylinderGeometry(0.33, 0.33, 0.24, 12), new THREE.MeshLambertMaterial({ color: 0x15181d }), u, 0.33, w, c); t.rotation.x = PI / 2; }
    const C = Math.abs(Math.cos(ry)), S = Math.abs(Math.sin(ry));
    for (const u of [-1.4, 0, 1.4]) { const cx = x + u * Math.cos(ry), cz = z - u * Math.sin(ry), hx = C * 0.7 + S * 0.82, hz = S * 0.7 + C * 0.82; K.col(cx - hx, cx + hx, 0, u ? 0.93 : 1.47, cz - hz, cz + hz); }
  };

  // the scaffold tower in the middle: a deck at 3.9 m with rails you can shoot through, two flights of stairs (one each side), timber stacked under it
  const D = 2.5, TOP = 3.9;
  K.box('flat', -D, D, TOP - 0.15, TOP, -D, D, 0x6a6f74);
  for (const x of [-D, D - 0.2]) for (const z of [-D, D - 0.2]) K.box('flat', x, x + 0.2, 0, TOP - 0.15, z, z + 0.2, YEL);
  for (const s of [-1, 1]) for (const k of [0.25, 0.65]) { K.box('flat', -D, D, TOP * k, TOP * k + 0.1, s * D - 0.05, s * D + 0.05, YEL, 0); K.box('flat', s * D - 0.05, s * D + 0.05, TOP * k, TOP * k + 0.1, -D, D, YEL, 0); }
  const railGeo = new THREE.BoxGeometry(0.06, 0.08, Math.hypot(TOP, 5.4)), railMat = new THREE.MeshLambertMaterial({ color: YEL });
  K.box('wood', -1.4, 1.4, 0, 1.0, -1.0, 1.0, 0xd8b98a); K.box('wood', -1.1, 1.2, 1.0, 1.25, -0.8, 0.7, 0xc8a878, 0);
  { const l = new THREE.PointLight(0xfff0d0, 0.6, 14, 1.6); l.position.set(0, TOP - 0.5, 0); g.add(l); }

  for (const s of [1, -1]) { // s = 1 is written out below as the north half; s = -1 turns it half a circle into the south half
    const B = (mat, x0, x1, y0, y1, z0, z1, c, solid) => s > 0 ? K.box(mat, x0, x1, y0, y1, z0, z1, c, solid) : K.box(mat, -x1, -x0, y0, y1, -z1, -z0, c, solid);
    const C = (mat, x, y, z, r, len, axis, c) => K.cyl(mat, s * x, y, s * z, r, len, axis, c);
    const col = (x0, x1, y0, y1, z0, z1) => s > 0 ? K.col(x0, x1, y0, y1, z0, z1) : K.col(-x1, -x0, y0, y1, -z1, -z0);
    const sg = (text, x, y, z, w, h, ry, bg, fg) => sign(g, text, s * x, y, s * z, w, h, ry + (s < 0 ? PI : 0), bg, fg);
    const crate = (x, z, y0) => B('wood', x - 0.7, x + 0.7, y0 || 0, (y0 || 0) + 1.3, z - 0.7, z + 0.7);
    const pallets = (x0, x1, z0, z1, n, load) => { for (let i = 0; i < n; i++) B('flat', x0, x1, i * 0.16, i * 0.16 + 0.12, z0, z1, i % 2 ? PLY2 : PLY, 0); col(x0, x1, 0, n * 0.16, z0, z1); if (load) B('flat', x0 + 0.08, x1 - 0.08, n * 0.16, n * 0.16 + load, z0 + 0.08, z1 - 0.08, CARD); };
    const drums = (x, z, c1, c2) => { [[0, 0, c1], [0.66, 0.1, c2], [0.3, 0.62, c1]].forEach(([dx, dz, c]) => { C('flat', x + dx, 0.45, z + dz, 0.3, 0.9, 0, c); C('flat', x + dx, 0.905, z + dz, 0.26, 0.02, 0, BLK); }); col(x - 0.3, x + 0.96, 0, 0.9, z - 0.3, z + 0.92); };
    const jersey = (x0, x1, z) => { B('conc', x0, x1, 0, 0.9, z - 0.3, z + 0.3, 0xc4c4ba); B('flat', x0 + 0.2, x1 - 0.2, 0.55, 0.7, z - 0.31, z + 0.31, YEL, 0); };

    // the tower's stair on this side: 15 steps of 0.26 m up to the deck, walked up without jumping (a step must sit lower than feet + 0.3, or it counts as a wall); a hand rail on the open side
    for (let i = 1; i <= 15; i++) B('flat', -2.3, -1.1, 0, 0.26 * i, -D - 0.36 * (16 - i), -D - 0.36 * (15 - i), i % 2 ? STEEL : 0x6a7686);
    for (let i = 0; i <= 3; i++) { const z = -D - 0.18 - i * 1.74, y = TOP * (1 - (i * 1.74 + 0.18) / 5.4); B('flat', -1.1, -1.04, 0, y + 0.9, z - 0.04, z + 0.04, YEL, 0); }
    { const rl = mk(railGeo, railMat, s * -1.07, TOP / 2 + 0.9, s * (-D - 2.7), g); rl.rotation.x = s * Math.atan2(TOP, 5.4); }
    // rails round the deck, open over the stair: a toe board that stops shots, the rails above it stop only feet
    B('flat', -D, -2.3, TOP, TOP + 0.15, -D, -D + 0.05); B('flat', -1.1, D, TOP, TOP + 0.15, -D, -D + 0.05); B('fence', -D, -2.3, TOP + 0.15, TOP + 1.05, -D, -D + 0.05, 0xffffff, 2); B('fence', -1.1, D, TOP + 0.15, TOP + 1.05, -D, -D + 0.05, 0xffffff, 2);
    B('flat', -D, -2.3, TOP + 1.0, TOP + 1.08, -D, -D + 0.05, YEL, 0); B('flat', -1.1, D, TOP + 1.0, TOP + 1.08, -D, -D + 0.05, YEL, 0);
    B('flat', D - 0.05, D, TOP, TOP + 0.15, -D, D); B('fence', D - 0.05, D, TOP + 0.15, TOP + 1.05, -D, D, 0xffffff, 2); B('flat', D - 0.05, D, TOP + 1.0, TOP + 1.08, -D, D, YEL, 0);

    // the pallet rack along the west walkway: blue frames, orange beams, three bays. Loaded at the bottom in the first bay, empty in the second (shots go through), low in the third
    const RX0 = -14.6, RX1 = -13.4, RZ = [-24, -21.3, -18.6, -15.9];
    for (const z of RZ) for (const x of [RX0, RX1 - 0.1]) B('flat', x, x + 0.1, 0, 4.6, z - 0.05, z + 0.05, RACK);
    for (let b = 0; b < 3; b++) { const z0 = RZ[b], z1 = RZ[b + 1];
      for (const y of [1.5, 3.0, 4.5]) { B('flat', RX0, RX1, y - 0.06, y, z0 + 0.05, z1 - 0.05, 0x7a6a50); for (const x of [RX0, RX1 - 0.06]) B('flat', x, x + 0.06, y - 0.16, y, z0 + 0.05, z1 - 0.05, ORANGE, 0); }
      if (b === 0) { B('wood', RX0 + 0.05, RX1 - 0.05, 0, 1.3, z0 + 0.1, z1 - 0.1); B('flat', RX0 + 0.1, RX1 - 0.1, 1.5, 2.6, z0 + 0.2, z1 - 1.0, CARD); }
      if (b === 1) B('flat', RX0 + 0.1, RX1 - 0.1, 3.0, 4.1, z0 + 0.3, z1 - 0.3, CARD);
      if (b === 2) { pallets(RX0 + 0.05, RX1 - 0.05, z0 + 0.15, z1 - 0.15, 3, 0.4); B('wood', RX0 + 0.1, RX1 - 0.1, 1.5, 2.8, z0 + 0.4, z1 - 0.4); }
      B('flat', RX0 + 0.1, RX1 - 0.1, 4.5, 5.2, z0 + 0.2, z1 - 0.2, CARD, 0); }

    // a blue container lying north to south west of the tower, a crate at its south end to climb it; a rust-red one across the north lane
    B('corr', -10.2, -10.2 + CW, 0, CH, -15.6, -15.6 + CL, HULLS[3]); crate(-9.0, -8.75);
    B('corr', 4, 4 + CL, 0, CH, -20.1, -20.1 + CW, 0xb5562a); crate(3.2, -19.2);

    // the site office against the east wall: two rooms and no roof. Doors toward the tower and to the south, windows (a sill too high to climb through) toward the middle
    const OX = 9.6, OZ0 = -13.4, OZ1 = -3.2, W = (x0, x1, y0, y1, z0, z1) => B('flat', x0, x1, y0, y1, z0, z1, PLY);
    W(OX, OX + 0.15, 0, OH, OZ0, -11.8); W(OX, OX + 0.15, 2.2, OH, -11.8, -10.4); W(OX, OX + 0.15, 0, OH, -10.4, -10.0); W(OX, OX + 0.15, 0, 1.1, -10.0, -8.8); W(OX, OX + 0.15, 2.1, OH, -10.0, -8.8);
    W(OX, OX + 0.15, 0, OH, -8.8, -6.9); W(OX, OX + 0.15, 0, 1.1, -6.9, -5.1); W(OX, OX + 0.15, 2.1, OH, -6.9, -5.1); W(OX, OX + 0.15, 0, OH, -5.1, OZ1);
    W(OX, HX, 0, OH, OZ0, OZ0 + 0.15); // north wall
    W(OX, 11.4, 0, OH, OZ1 - 0.15, OZ1); W(11.4, 12.8, 2.2, OH, OZ1 - 0.15, OZ1); W(12.8, HX, 0, OH, OZ1 - 0.15, OZ1); // south wall, with a door
    W(OX + 0.15, 12.4, 0, OH, -8.3, -8.15); W(12.4, 13.8, 2.2, OH, -8.3, -8.15); W(13.8, HX, 0, OH, -8.3, -8.15); // the partition, with a door
    for (const x of [OX, OX + 0.15]) for (const z of [-10.0, -8.8, -6.9, -5.1]) B('flat', x - 0.02, x + 0.02, 1.1, 2.1, z - 0.04, z + 0.04, PLY2, 0);
    B('flat', OX - 0.02, OX + 0.17, 0, 0.12, OZ0, OZ1, PLY2, 0); B('flat', OX - 0.03, OX + 0.18, OH - 0.1, OH, OZ0, OZ1, PLY2, 0);
    B('flat', 12.2, 14.4, 0, 0.78, -12.2, -11.3, 0x6b5440); B('flat', 15.8, HX - 0.35, 0, 1.9, -13.25, -10.4, 0x7f8a93); // a desk, cabinets
    B('flat', 13.2, 15.2, 0, 0.75, -6.6, -5.0, 0x6b5440); for (let i = 0; i < 4; i++) B('flat', HX - 0.85, HX - 0.35, 0, 1.85, -7.9 + i * 0.55, -7.4 + i * 0.55, i % 2 ? 0x56748a : 0x4e6a7f); // a table, lockers
    sg('事務所', OX - 0.02, 2.5, -11.1, 1.3, 0.38, -PI / 2, '#e9e2c8', '#1b2a3a');

    // the wrecked cars, left where they were dumped
    car(5.6, -8.4, s > 0 ? 0.55 : 0.55 + PI, 0x3f7a5a); car(-4.6, -18.4, s > 0 ? -0.32 : -0.32 + PI, 0xc9b98a);

    // low cover: a barrier on the east lane near the middle, pallets and drums at the base, a timber pile on the west lane
    jersey(7.6, 10.6, -0.6);
    // block walls in front of the base, taller than anyone and too tall to climb from the drums (3 m): from the rack to the west trench, from the east trench to the drums
    const blockWall = (x0, x1, z) => { B('conc', x0, x1, 0, 3, z - 0.15, z + 0.15, 0xb8b4aa); B('flat', x0, x1, 3, 3.08, z - 0.18, z + 0.18, STEEL, 0); for (let x = x0 + 0.8; x < x1 - 0.4; x += 1.6) B('flat', x, x + 0.8, 0.9, 1.05, z - 0.16, z + 0.16, YEL, 0); };
    blockWall(-13.4, -4.8, -22.1); blockWall(5.0, 12.3, -22.6);
    pallets(-2.2, -0.8, -22.6, -21.4, 5, 0.5); pallets(-0.6, 0.8, -22.6, -21.4, 3); drums(12.6, -22.4, 0x2c5c9c, 0xa5352f); drums(-11.8, -2.6, 0xa5352f, 0x2c5c9c);
    for (let i = 0; i < 5; i++) B('wood', -12.2 + i * 0.03, -9.8 - i * 0.03, i * 0.2, i * 0.2 + 0.2, -5.6, -4.4, i % 2 ? 0xd8b98a : 0xc8a878, 0); col(-12.2, -9.8, 0, 1.0, -5.6, -4.4);
    for (const [x, z] of [[7.4, -13.4], [7.9, -12.9], [7.4, -12.4]]) C('flat', x, 0.12, z, 0.38, 0.24, 0, 0x15181d); C('flat', 7.4, 0.36, -12.9, 0.38, 0.24, 0, 0x15181d); // old tyres, drawn only

    // the north end: a shutter (shut), a door, the name of the shed
    B('corr', 2, 11, 0, 5.6, -HZ + 0.02, -HZ + 0.08, 0x9aa3a8, 0); B('flat', 1.7, 2, 0, 5.9, -HZ, -HZ + 0.25, YEL, 0); B('flat', 11, 11.3, 0, 5.9, -HZ, -HZ + 0.25, YEL, 0); B('flat', 1.7, 11.3, 5.6, 6.2, -HZ, -HZ + 0.3, DARK, 0);
    B('flat', -8.4, -7.2, 0, 2.2, -HZ + 0.02, -HZ + 0.06, 0x3a5a70, 0); B('lit', -8.1, -7.5, 2.35, 2.5, -HZ + 0.02, -HZ + 0.07, 0x7dffb0, 0);
    sg(s > 0 ? '九番上屋' : '火気厳禁', 6.5, 7.2, -HZ + 0.1, 4.6, 1.0, 0, s > 0 ? '#e9e2c8' : '#b8322a', s > 0 ? '#1b2a3a' : '#fff3d6');
  }
  K.done();
  m.g = g; m.boxes = K.bx; m.hard = K.bx.filter(b => !b.soft); m.lx = HX - 0.5; m.lz = HZ - 0.5; m.dx = HX - 1.6; m.dz = HZ - 1.6;
}

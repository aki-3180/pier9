// Map 5: 突堤 (the jetty at dusk).
'use strict';
// map 5: the jetty at dusk, made for the SR in versus. 48 × 120 m, mirrored north to south (each team's half is the other's seen in a mirror).
// Three ways from base to base: the quay along the water (west), open from end to end but for bollards; the field in the middle, containers and pipes
// to hop between; the shed (east), roofed, crates inside, where no line is long. Each base has a watch house with a long window slit upstairs that looks down the field.
function buildJetty(m) {
  seed = 113;
  const K = kit(), g = K.g, PI = Math.PI, HX = 24, HZ = 60;
  const CONC = 0xb9b5aa, DARK = 0x1c222b, BLK = 0x0d1015, STEEL = 0x556070, YEL = 0xe0a81e, RUST = 0x8a5a3c, WALL = 0x8d969e, ROOF = 0x48505a, WHITE = 0xe2e6e2, BLUE = 0x2c5c9c, RED = 0xa5352f;
  const gt = canvasTex(1024, 2048, (c, w, h) => {
    c.fillStyle = '#5e5d5a'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 26000; i++) { const v = 60 + rnd() * 60 | 0; c.fillStyle = `rgba(${v},${v - 2},${v - 6},.35)`; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
    const sx = w / (HX * 2), sz = h / (HZ * 2); c.setTransform(sx, 0, 0, sz, HX * sx, HZ * sz);
    const R = (x0, x1, z0, z1, f) => { c.fillStyle = f; c.fillRect(x0, z0, x1 - x0, z1 - z0); };
    for (let z = -HZ + 6; z < HZ; z += 6) R(-HX, 9, z - 0.04, z + 0.04, 'rgba(20,20,22,.3)'); // joints in the apron
    for (const z of [-46, 10]) R(9, HX, z, z + 36, 'rgba(30,30,34,.35)'); // under the sheds
    R(-HX, -HX + 0.5, -HZ, HZ, 'rgba(224,168,30,.6)'); // the quay edge
    for (const x of [-19.5, -18.5, -1.5, -0.5]) R(x - 0.05, x + 0.05, -HZ, HZ, 'rgba(150,150,150,.7)'); // the crane rails
    for (const s of [-1, 1]) {
      for (let x = -13; x < 8; x += 3.2) { c.strokeStyle = 'rgba(238,242,234,.35)'; c.lineWidth = 0.1; c.strokeRect(x, s > 0 ? 12 : -18, 2.6, 6); } // container lots
      R(-17, 9, s * 46 - 0.06, s * 46 + 0.06, 'rgba(238,242,234,.4)');
    }
    for (let i = 0; i < 22; i++) { const x = -HX + 2 + rnd() * 30, z = -HZ + 3 + rnd() * (HZ * 2 - 6), r = 0.6 + rnd() * 1.8, gr = c.createRadialGradient(x, z, 0, x, z, r); gr.addColorStop(0, 'rgba(12,10,8,.4)'); gr.addColorStop(1, 'rgba(12,10,8,0)'); R(x - r, x + r, z - r, z + r, gr); }
  });
  gt.anisotropy = renderer.capabilities.getMaxAnisotropy();
  mk(new THREE.PlaneGeometry(HX * 2, HZ * 2), new THREE.MeshLambertMaterial({ map: gt }), 0, 0, 0, g).rotation.x = -PI / 2;
  mk(new THREE.PlaneGeometry(300, HZ * 2 + 1.2), new THREE.MeshLambertMaterial({ color: 0x4a4a4c }), HX + 150, -0.02, 0, g).rotation.x = -PI / 2; // the land going on east
  mk(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ color: 0x2a4658 }), 0, -1.0, 0, g).rotation.x = -PI / 2; // the sea
  K.box('conc', -HX - 0.3, -HX, -1.0, 0, -HZ - 0.6, HZ + 0.6, 0x8d8a82, 0); K.box('conc', -HX, HX + 300, -1.0, 0, -HZ - 0.6, -HZ, 0x8d8a82, 0); K.box('conc', -HX, HX + 300, -1.0, 0, HZ, HZ + 0.6, 0x8d8a82, 0);
  K.box('flat', -HX - 0.05, -HX + 0.25, 0, 0.18, -HZ, HZ, YEL, 0); // the kerb along the edge
  cranes(g, [[70, -45, PI / 2], [70, 25, PI / 2], [-150, 90]], new THREE.MeshBasicMaterial({ color: 0x2e2a36, fog: false }));

  // the gantry crane across the middle: legs to hide behind, a low sill between them; everything above is out of reach
  for (const x of [-19, -1]) { for (const z of [-5, 5]) K.box('flat', x - 0.7, x + 0.7, 0, 14, z - 0.7, z + 0.7, 0xc4952e); K.box('flat', x - 0.5, x + 0.5, 0, 1.0, -4.3, 4.3, 0xa77a22); }
  K.box('flat', -19.7, -0.3, 14, 15.6, -5.7, -4.3, 0xc4952e, 0); K.box('flat', -19.7, -0.3, 14, 15.6, 4.3, 5.7, 0xc4952e, 0);
  K.box('flat', -48, 10, 15.6, 17, -1.2, 1.2, 0xc4952e, 0); K.box('flat', -14, -6, 17, 20, -3, 3, 0x9a7a2a, 0); K.box('lit', -14.05, -13.95, 18, 19, -1, 1, 0xffe0a0, 0);
  for (const x of [-30, -40]) K.cyl('flat', x, 13, 0, 0.05, 5.2, 0, DARK);
  // concrete pipes on the centre line, east of the crane
  for (const z of [-0.66, 0.66]) K.cyl('conc', 6.5, 0.66, z, 0.66, 6, 1, 0xa8a49a); K.cyl('conc', 6.5, 1.85, 0, 0.62, 6, 1, 0xb0aca2); K.col(3.5, 9.5, 0, 1.32, -1.32, 1.32); K.col(3.5, 9.5, 1.32, 2.47, -0.62, 0.62);
  // a trailer parked across the centre line in the shed gap: shots go under it
  K.box('corr', 14.6, 17, 1.2, 3.8, -6, 6, 0x9aa3a8); K.box('flat', 14.8, 16.8, 0.8, 1.2, -6, 6, DARK, 0); for (const z of [-4.5, -3.3, 3.3]) { K.cyl('flat', 15.8, 0.5, z, 0.5, 2.3, 1, BLK); for (const x of [14.9, 16.7]) K.col(x - 0.18, x + 0.18, 0, 1.0, z - 0.5, z + 0.5); }
  for (const z of [-5.5, 5.5]) K.box('flat', 15.6, 16, 0, 0.8, z - 0.15, z + 0.15, DARK);

  for (const s of [1, -1]) { // s = 1 is written out below as the north half; s = -1 is its mirror image, the south half
    const B = (mat, x0, x1, y0, y1, z0, z1, c, solid) => s > 0 ? K.box(mat, x0, x1, y0, y1, z0, z1, c, solid) : K.box(mat, x0, x1, y0, y1, -z1, -z0, c, solid);
    const C = (mat, x, y, z, r, len, axis, c) => K.cyl(mat, x, y, s * z, r, len, axis, c);
    const col = (x0, x1, y0, y1, z0, z1) => s > 0 ? K.col(x0, x1, y0, y1, z0, z1) : K.col(x0, x1, y0, y1, -z1, -z0);
    const sg = (text, x, y, z, w, h, ry, bg, fg) => sign(g, text, x, y, s * z, w, h, s > 0 ? ry : PI - ry, bg, fg);
    const light = (x, y, z, color, power, reach, size) => { const l = new THREE.PointLight(color, power, reach, 1.6); l.position.set(x, y, s * z); g.add(l); if (size) { const sp = glow(color, size); sp.position.copy(l.position); g.add(sp); } };
    const crate = (x, z, y0) => B('wood', x - 0.7, x + 0.7, y0 || 0, (y0 || 0) + 1.3, z - 0.7, z + 0.7);
    const jersey = (x0, x1, z) => { B('conc', x0, x1, 0, 0.9, z - 0.3, z + 0.3, 0xc4c4ba); B('flat', x0 + 0.2, x1 - 0.2, 0.55, 0.7, z - 0.31, z + 0.31, YEL, 0); };
    const tetra = (x, z) => { for (let i = 0; i < 7; i++) { const a = i / 7 * PI * 2, r = i ? 1.0 : 0, cx = x + Math.cos(a) * r, cz = z + Math.sin(a) * r; C('conc', cx, 0.45 + (i % 2) * 0.5, cz, 0.32, 1.6, i % 3, 0xb3afa5); } col(x - 1.5, x + 1.5, 0, 1.6, z - 1.5, z + 1.5); };

    // the seawall behind the base, and blocks beyond it
    B('conc', -HX, HX, 0, 1.2, -HZ - 0.6, -HZ, CONC); for (let x = -20; x <= 20; x += 5) C('conc', x + (x % 2), 0.6, -HZ - 2, 0.5, 2, (x / 5 + 4) % 3, 0xa8a49a);

    // the watch house: two floors. Downstairs a door south and a door east; a stair along the back wall; upstairs a long slit south, short slits west and east.
    // The slits sit 1 m above the upper floor and are 0.75 m high: you see out with your head and shoulders, and cannot climb through
    const X0 = -8, X1 = 2, Z0 = -56, Z1 = -50, FL = 3.38, RF = 6.4, SL = FL + 1.0, HD = FL + 1.75, W = (x0, x1, y0, y1, z0, z1) => B('conc', x0, x1, y0, y1, z0, z1, CONC);
    W(X0, X1, 0, RF, Z0, Z0 + 0.3); // back
    W(X0, X0 + 0.3, 0, SL, Z0 + 0.3, Z1); W(X0, X0 + 0.3, SL, HD, Z0 + 0.3, -54); W(X0, X0 + 0.3, SL, HD, -51, Z1); W(X0, X0 + 0.3, HD, RF, Z0 + 0.3, Z1); // west, a slit upstairs
    W(X1 - 0.3, X1, 0, SL, Z0 + 0.3, -53.7); W(X1 - 0.3, X1, 2.2, SL, -53.7, -52.3); W(X1 - 0.3, X1, 0, SL, -52.3, Z1); W(X1 - 0.3, X1, SL, HD, Z0 + 0.3, -54); W(X1 - 0.3, X1, SL, HD, -51, Z1 - 0.3); W(X1 - 0.3, X1, HD, RF, Z0 + 0.3, Z1); // east: a door, a slit
    W(X0 + 0.3, -6.8, 0, SL, Z1 - 0.3, Z1); W(-6.8, -5.4, 2.2, SL, Z1 - 0.3, Z1); W(-5.4, X1 - 0.3, 0, SL, Z1 - 0.3, Z1); W(X0 + 0.3, -7.4, SL, HD, Z1 - 0.3, Z1); W(1.4, X1 - 0.3, SL, HD, Z1 - 0.3, Z1); W(X0 + 0.3, X1 - 0.3, HD, RF, Z1 - 0.3, Z1); // south: a door, the long slit
    for (let i = 1; i <= 13; i++) B('flat', X1 - 0.3 - 0.36 * (14 - i), X1 - 0.3 - 0.36 * (13 - i), 0, 0.26 * i, Z0 + 0.3, -54.3, i % 2 ? STEEL : 0x6a7686); // 13 steps of 0.26 m, up toward the east wall
    B('conc', X0 + 0.3, X1 - 0.3, FL - 0.2, FL, -54.3, Z1 - 0.3, 0x9a9890); B('conc', X0 + 0.3, X1 - 0.3 - 0.36 * 13, FL - 0.2, FL, Z0 + 0.3, -54.3, 0x9a9890); // the upper floor, open over the stair
    B('flat', X0 - 0.2, X1 + 0.2, RF, RF + 0.25, Z0 - 0.2, Z1 + 0.2, ROOF);
    B('flat', X0 + 0.5, X0 + 1.6, FL, FL + 0.75, -53.5, -51.5, 0x6b5440); B('flat', -1.2, 0.8, FL, FL + 0.75, -51.4, -50.6, 0x6b5440); // tables upstairs, below the slits
    B('flat', X0 + 0.4, X0 + 1.2, 0, 1.9, -55.6, -54.2, 0x7f8a93); B('wood', -4, -2.6, 0, 1.3, -51.9, -50.5);
    B('lit', -3.4, -2.6, RF - 0.05, RF, -53, -52.6, 0xfff0d0, 0); light(-3, RF - 0.6, -52.8, 0xffe2b0, 0.6, 12);
    B('lit', -3.4, -2.6, FL - 0.25, FL - 0.2, -52.4, -52, 0xfff0d0, 0);
    sg('見張所', -3, HD + 0.6, Z1 + 0.02, 2.4, 0.6, 0, '#e9e2c8', '#1b2a3a');
    B('flat', X1, X1 + 0.4, RF - 0.6, RF - 0.3, -52.5, -51.9, DARK, 0); light(X1 + 0.6, RF - 0.7, -52.2, 0xdfe8ff, 0.9, 30, 3.5); // floodlight over the east door

    // the base: a box truck (shots pass under it), sandbags, a lamp on the quay
    B('corr', 6, 8.4, 0.9, 3.3, -56.5, -51.5, WHITE); B('flat', 6.1, 8.3, 0.45, 2.5, -51.5, -49.6, BLUE); B('flat', 6.7, 7.7, 0.45, 0.9, -56.5, -51.5, DARK, 0);
    for (const z of [-55.5, -52.2]) { C('flat', 7.2, 0.45, z, 0.45, 2.36, 1, BLK); for (const x of [6.2, 8.2]) col(x - 0.18, x + 0.18, 0, 0.9, z - 0.45, z + 0.45); }
    for (let i = 0; i < 3; i++) B('flat', -17 + i * 0.05, -13 - i * 0.05, i * 0.3, i * 0.3 + 0.3, -48.6, -47.8, i % 2 ? 0x8f8463 : 0x9d9270);
    B('flat', -23.4, -23.1, 0, 9, -47, -46.7, DARK); B('flat', -23.4, -21.8, 8.85, 9, -46.95, -46.75, DARK, 0); light(-21.9, 8.7, -46.85, 0xffb347, 1.2, 40, 6);

    // the quay: bollards, a stack of fish boxes, a heap of wave blocks, boats tied up below the edge
    for (const z of [-44, -34, -24, -14]) { C('flat', -23.2, 0.35, z, 0.28, 0.7, 0, 0x30353d); col(-23.5, -22.9, 0, 0.7, z - 0.3, z + 0.3); }
    for (let i = 0; i < 4; i++) B('flat', -22.4, -20.6, i * 0.32, i * 0.32 + 0.32, -40.4, -39, i % 2 ? 0xd6dcdc : 0xe8ecec, 0); col(-22.4, -20.6, 0, 1.28, -40.4, -39);
    tetra(-20.5, -29);
    { const bz = s > 0 ? -33 : -18; B('flat', -31, -27.4, -1.2, 0.6, bz - 6, bz + 6, s > 0 ? 0xe8e4da : 0x2f5f8f, 0); B('flat', -30.6, -27.8, 0.6, 2.4, bz - 3.5, bz - 0.5, WHITE, 0); B('flat', -29.4, -29, 2.4, 6, bz - 2, bz - 1.6, DARK, 0); }

    // the field: a single container to climb (a forward perch, open on every side), a double one too tall to climb, another near the base, barriers
    B('corr', -13, -13 + CL, 0, CH, -38, -38 + CW, HULLS[0]); crate(-10, -38.75);
    B('corr', -3, -3 + CW, 0, CH * 2, -30, -30 + CL, HULLS[1]); B('flat', -3.05, -0.51, CH - 0.04, CH + 0.04, -30.05, -23.85, DARK, 0);
    B('corr', 2.6, 2.6 + CL, 0, CH, -44, -44 + CW, HULLS[2]);
    jersey(-15, -12, -19); jersey(3.2, 6.2, -21); jersey(-9, -6, -12.5); jersey(-14.5, -11.5, -7);
    for (let i = 0; i < 4; i++) B('flat', 5.4, 7.4, i * 0.3, i * 0.3 + 0.28, -13.6, -12.4, i % 2 ? 0x9d7a4a : 0xa98656, 0); col(5.4, 7.4, 0, 1.2, -13.6, -12.4); // pallets

    // the shed: roofed, open at both ends, two doors onto the field. Inside, crates set so that no line runs far
    const SX0 = 9, SZ0 = -46, SZ1 = -10, SH = 5;
    B('corr', SX0, SX0 + 0.3, 0, SH, SZ0, -36.2, WALL); B('corr', SX0, SX0 + 0.3, 3, SH, -36.2, -33.8, WALL); B('corr', SX0, SX0 + 0.3, 0, SH, -33.8, -22.2, WALL); B('corr', SX0, SX0 + 0.3, 3, SH, -22.2, -19.8, WALL); B('corr', SX0, SX0 + 0.3, 0, SH, -19.8, SZ1, WALL);
    B('corr', HX - 0.3, HX, 0, SH, -HZ, HZ * 0 - 10, WALL); B('corr', HX - 0.3, HX, 0, 3.2, -10, 0, 0x7a838b);
    B('corr', SX0 - 0.2, HX + 0.2, SH, SH + 0.25, SZ0 - 0.4, SZ1 + 0.4, ROOF); B('flat', SX0 - 0.2, HX + 0.2, SH - 0.5, SH, SZ0 - 0.4, SZ0 - 0.2, DARK, 0); B('flat', SX0 - 0.2, HX + 0.2, SH - 0.5, SH, SZ1 + 0.2, SZ1 + 0.4, DARK, 0);
    for (let z = SZ0 + 6; z < SZ1; z += 6) B('flat', 16.3, 16.7, 0, SH, z - 0.2, z + 0.2, STEEL);
    crate(11, -43); crate(11, -43, 1.3); crate(12.4, -43); crate(20.5, -38); crate(21.9, -38); crate(21.9, -38, 1.3); crate(13.2, -30.5); crate(13.2, -29.1); crate(13.2, -29.1, 1.3);
    crate(19.6, -25); crate(21, -25); crate(21, -26.4); crate(11.6, -16); crate(13, -16); crate(13, -16, 1.3); crate(20.8, -13.2); crate(20.8, -13.2, 1.3);
    B('flat', 17.6, 19.4, 0, 1.0, -33.5, -32.3, YEL); B('flat', 17.8, 19.2, 1.0, 2.3, -33.4, -32.6, DARK, 0); col(17.8, 19.2, 1.0, 2.3, -33.4, -32.6); // a forklift, more or less
    for (const z of [-40, -28, -16]) { B('lit', 16, 17, SH - 0.08, SH - 0.02, z - 0.3, z + 0.3, 0xfff0d0, 0); }
    light(16.5, SH - 0.6, -34, 0xffd9a0, 0.6, 18); light(16.5, SH - 0.6, -19, 0xffd9a0, 0.6, 18);
    sg('九番突堤', SX0 - 0.02, 4, -40, 4.2, 0.9, -PI / 2, '#e9e2c8', '#1b2a3a');
  }
  K.done();
  m.g = g; m.boxes = K.bx; m.hard = K.bx.filter(b => !b.soft); m.lx = HX - 0.5; m.lz = HZ - 0.5; m.dx = HX - 1; m.dz = HZ - 1;
}

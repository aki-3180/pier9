// Map 1: 倉庫街 (the warehouse district).
'use strict';
// map 1: the warehouse district. Three lanes run north to south: the warehouse (west), the road with the office in the middle, the quay (east).
function buildDepot(m) {
  seed = 31;
  const K = kit(), g = K.g, B = K.box, C = K.cyl, col = K.col, PI = Math.PI;
  const CONC = 0xa9adb3, SIDE = 0x7fa6ba, ROOF = 0x3f4a56, CREAM = 0xd9d0b8, STEEL = 0x556070, STEEL2 = 0x6a7686, YEL = 0xe0a81e, RUST = 0xa8553a, DARK = 0x1c222b, BLK = 0x0d1015,
    WARM = 0xffd58a, TAN = 0xa8946a, WHITE = 0xe2e6e2, GREEN = 0x2f6b4a, BLUE = 0x2c5c9c, RED = 0xa5352f, CRANE = 0xc98a1c, PALE = 0xc9c4b4;
  const pools = [[-9.4, -33.3, 11, '255,179,71'], [12.8, -10.2, 11, '255,179,71'], [-9.4, 32.3, 11, '255,179,71'], [12.8, 11, 11, '255,179,71'],
    [-7.9, 23.6, 9, '205,220,255'], [20, -1, 9, '215,228,255'], [-21, 27.4, 3.5, '220,235,255'], [12.6, 37, 3.5, '220,235,255'], [25.6, -30, 7, '255,179,71'], [1.7, -5.5, 4, '255,214,150']];

  // ground: drawn in metres, north at the top
  const GW = 58.6, GD = 86, GX = -1.7; // the slab runs from the west wall to the quay edge
  const gt = canvasTex(1024, 1024, (c, w) => {
    c.fillStyle = '#1b202b'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 9000; i++) { const v = 20 + rnd() * 40 | 0; c.fillStyle = `rgba(${v + 10},${v + 14},${v + 22},.5)`; c.fillRect(rnd() * w, rnd() * w, 2, 2); }
    const sx = w / GW, sz = w / GD; c.setTransform(sx, 0, 0, sz, (GW / 2 - GX) * sx, GD / 2 * sz);
    const R = (x0, x1, z0, z1, f) => { c.fillStyle = f; c.fillRect(x0, z0, x1 - x0, z1 - z0); };
    const text = (t, x, z, size, turn, f) => { c.save(); c.translate(x, z); c.rotate(turn); c.scale(size / 100, size / 100 * 1.5); c.fillStyle = f; c.font = `100px ${JP}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, 0, 0); c.restore(); };
    R(10.6, 27.6, -43, 43, 'rgba(70,78,92,.38)'); // quay apron
    for (let z = -36; z <= 36; z += 6) R(10.6, 27.6, z, z + 0.1, 'rgba(10,12,18,.6)');
    R(-27, -11, -14.4, 14.4, 'rgba(78,84,96,.5)'); // warehouse floor
    for (const x of [-22.2, -15.8]) R(x, x + 0.14, -14, 14, 'rgba(255,179,71,.55)');
    R(7.3, 10.7, -43, 43, '#14171d'); // ballast, sleepers, rails
    for (let z = -39; z < 39; z += 0.65) R(7.9, 10.1, z, z + 0.24, '#31281f');
    R(8.22, 8.34, -39, 39, '#8792a0'); R(9.66, 9.78, -39, 39, '#8792a0');
    const WH = 'rgba(238,242,234,.4)';
    R(-10.5, -10.38, -39, 39, WH); R(6.78, 6.9, -39, 39, WH);
    for (let z = -38; z < 38; z += 4) if (Math.abs(z + 1) > 8) R(-1.87, -1.73, z, z + 2, WH);
    for (let x = -9.8; x < 6.4; x += 1.2) R(x, x + 0.6, -13.6, -10.8, 'rgba(238,242,234,.33)');
    R(-10.2, -2.2, 25.2, 25.65, WH); text('止まれ', -6.2, 29.6, 2.3, 0, WH); text('徐行', -6.2, -33.4, 2.3, PI, WH);
    for (const x of [0, 2.6, 5.2]) R(x, x + 0.1, 29, 35.5, WH);
    c.strokeStyle = 'rgba(238,242,234,.3)'; c.lineWidth = 0.22; c.beginPath(); c.arc(-18.6, -31.5, 2.6, 0, 7); c.stroke(); text('3', -18.6, -31.4, 3.2, 0, 'rgba(238,242,234,.32)');
    for (let z = -39; z < 39; z += 1.2) R(26.1, 27, z, z + 0.6, 'rgba(255,179,71,.5)');
    for (let i = 0; i < 16; i++) { const x = -26 + rnd() * 52, z = -38 + rnd() * 76, r = 0.5 + rnd() * 1.4, gr = c.createRadialGradient(x, z, 0, x, z, r); gr.addColorStop(0, 'rgba(4,6,10,.55)'); gr.addColorStop(1, 'rgba(4,6,10,0)'); R(x - r, x + r, z - r, z + r, gr); }
    c.globalCompositeOperation = 'lighter'; // lamp light, painted on: the slab itself is too coarse to catch it
    for (const [x, z, r, rgb] of pools) { const gr = c.createRadialGradient(x, z, 0, x, z, r); gr.addColorStop(0, `rgba(${rgb},.3)`); gr.addColorStop(0.5, `rgba(${rgb},.1)`); gr.addColorStop(1, `rgba(${rgb},0)`); R(x - r, x + r, z - r, z + r, gr); }
  });
  gt.anisotropy = renderer.capabilities.getMaxAnisotropy();
  redraws.push(() => { gt.needsUpdate = true; }); // (the text keeps its fallback face; only signs are redrawn)
  mk(new THREE.PlaneGeometry(GW, GD), new THREE.MeshLambertMaterial({ map: gt }), GX, 0, 0, g).rotation.x = -PI / 2;
  mk(new THREE.PlaneGeometry(400, 500), new THREE.MeshLambertMaterial({ color: 0x10141c }), 27.6 - 200, -0.05, 0, g).rotation.x = -PI / 2;
  mk(new THREE.PlaneGeometry(400, 500), new THREE.MeshLambertMaterial({ color: 0x15263c }), 27.6 + 200, -1.3, 0, g).rotation.x = -PI / 2; // the sea

  // small parts
  const lamp = (x, z, ax) => { B('flat', x - 0.15, x + 0.15, 0, 9, z - 0.15, z + 0.15, DARK); B('flat', Math.min(x, x + ax * 1.6), Math.max(x, x + ax * 1.6), 8.85, 9, z - 0.08, z + 0.08, DARK, 0);
    const l = new THREE.PointLight(0xffb347, 1.4, 46, 1.6); l.position.set(x + ax * 1.6, 8.7, z); g.add(l); const s = glow(0xffb347, 6); s.position.copy(l.position); g.add(s); };
  const light = (x, y, z, color, power, reach, size) => { const l = new THREE.PointLight(color, power, reach, 1.6); l.position.set(x, y, z); g.add(l); if (size) { const s = glow(color, size); s.position.set(x, y, z); g.add(s); } };
  const jersey = (x0, x1, z) => { B('conc', x0, x1, 0, 0.9, z - 0.3, z + 0.3, 0xc4c4ba); B('flat', x0 + 0.2, x1 - 0.2, 0.55, 0.7, z - 0.31, z + 0.31, YEL, 0); };
  const barrels = (x, z, c1, c2) => { [[0, 0, c1], [0.66, 0.1, c2], [0.3, 0.62, c1]].forEach(([dx, dz, c]) => { C('flat', x + dx, 0.45, z + dz, 0.3, 0.9, 0, c); C('flat', x + dx, 0.905, z + dz, 0.26, 0.02, 0, BLK); }); col(x - 0.3, x + 0.96, 0, 0.9, z - 0.3, z + 0.92); };
  const fence = (x, z0, z1) => { for (let z = z0; z < z1 - 0.01; z += 3) { B('fence', x - 0.03, x + 0.03, 0, 2.4, z, z + 3, 0xffffff, 2); C('flat', x, 1.25, z, 0.05, 2.5, 0, STEEL2); } C('flat', x, 1.25, z1, 0.05, 2.5, 0, STEEL2); B('flat', x - 0.04, x + 0.04, 2.38, 2.44, z0, z1, STEEL2, 0); };
  const car = (x, z, c) => { // 1.8 wide, 4.4 long, nose to the north
    B('flat', x, x + 1.8, 0.3, 0.95, z, z + 4.4, c, 0); B('flat', x + 0.12, x + 1.68, 0.95, 1.48, z + 1.2, z + 3.5, 0x141a22, 0); B('flat', x + 0.1, x + 1.7, 1.48, 1.54, z + 1.25, z + 3.45, c, 0);
    for (const wz of [z + 0.85, z + 3.5]) C('flat', x + 0.9, 0.33, wz, 0.33, 1.84, 1, BLK);
    B('lit', x + 0.15, x + 0.5, 0.62, 0.78, z - 0.02, z, 0xfff3c4, 0); B('lit', x + 1.3, x + 1.65, 0.62, 0.78, z - 0.02, z, 0xfff3c4, 0); B('lit', x + 0.15, x + 0.45, 0.66, 0.8, z + 4.4, z + 4.42, 0xd0281e, 0); B('lit', x + 1.35, x + 1.65, 0.66, 0.8, z + 4.4, z + 4.42, 0xd0281e, 0);
    col(x, x + 1.8, 0, 0.95, z, z + 4.4); col(x + 0.12, x + 1.68, 0.95, 1.54, z + 1.2, z + 3.5); };
  const forklift = (x, z) => { B('flat', x, x + 1.2, 0.2, 1.3, z + 0.5, z + 2.4, YEL); B('flat', x + 0.15, x + 1.05, 0, 2.3, z + 0.3, z + 0.5, DARK); B('flat', x + 0.2, x + 1, 0.12, 0.2, z - 0.6, z + 0.3, DARK, 0);
    B('flat', x, x + 1.2, 2.02, 2.1, z + 0.6, z + 2, DARK, 0); for (const px of [x + 0.04, x + 1.1]) for (const pz of [z + 0.62, z + 1.92]) B('flat', px, px + 0.06, 1.3, 2.02, pz, pz + 0.06, DARK, 0);
    for (const wz of [z + 0.85, z + 2.05]) C('flat', x + 0.6, 0.3, wz, 0.3, 1.26, 1, BLK); };
  const bogie = z => { C('flat', 9, 0.46, z + 0.55, 0.46, 1.8, 1, BLK); C('flat', 9, 0.46, z + 1.85, 0.46, 1.8, 1, BLK); B('flat', 7.75, 10.25, 0.35, 0.85, z + 0.1, z + 2.3, DARK, 0); col(7.75, 10.25, 0, 1, z, z + 2.4); };
  const round = (x, z, r, h) => { for (const [a, b] of [[0.92, 0.38], [0.38, 0.92], [0.7, 0.7]]) col(x - r * a, x + r * a, 0, h, z - r * b, z + r * b); };
  const vendTex = top => { const t = canvasTex(64, 128, c => { c.fillStyle = '#e9eef2'; c.fillRect(0, 0, 64, 128); c.fillStyle = top; c.fillRect(0, 0, 64, 14);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { c.fillStyle = ['#d9382e', '#2c6fd1', '#e0a81e', '#2f9a5a', '#f6f6f6', '#7a3fb0'][(r * 2 + k) % 6]; c.fillRect(5 + k * 9.5, 22 + r * 22, 6, 14); }
    c.fillStyle = '#1a2028'; c.fillRect(0, 92, 64, 36); c.fillStyle = '#39424d'; c.fillRect(8, 100, 48, 8); }); return new THREE.MeshBasicMaterial({ map: t }); };
  const vendGeo = new THREE.PlaneGeometry(0.84, 1.75);

  // perimeter: walls on three sides, the quay edge and open water to the east
  B('conc', -27.6, -27, 0, 4.5, -39.6, 39.6, CONC); B('conc', -27.6, 27.6, 0, 4.5, -39.6, -39, CONC); B('conc', -27.6, 27.6, 0, 4.5, 39, 39.6, CONC);
  for (const s of [-1, 1]) { const z = s * 38.96; B('corr', -5, 5, 0, 3.9, z - 0.06, z + 0.06, 0x66727f, 0); for (const x of [-5.4, 5]) B('flat', x, x + 0.4, 0, 4.9, z - 0.2, z + 0.2, YEL, 0); }
  B('conc', 27, 27.6, -1.4, 0.45, -43, 43, CONC, 0); col(27, 27.6, 0, 0.45, -39.6, 39.6);
  for (let z = -36; z <= 36; z += 9) { C('flat', 27.3, 0.72, z, 0.2, 0.55, 0, DARK); C('flat', 27.3, 1.02, z, 0.3, 0.08, 0, DARK); }

  // west lane: the warehouse. Shutters north and south, two doors and a window band toward the road, a mezzanine along the back wall
  const wall = (x0, x1, y0, y1, z0, z1) => B('corr', x0, x1, y0, y1, z0, z1, SIDE);
  wall(-27, -26.6, 0, 5.4, -14.4, 14.4);
  for (const s of [-1, 1]) { const z0 = s < 0 ? -14.4 : 14, z1 = z0 + 0.4, out = s < 0 ? z0 : z1;
    wall(-27, -22, 0, 5.4, z0, z1); wall(-16, -11, 0, 5.4, z0, z1); wall(-22, -16, 4.4, 5.4, z0, z1);
    B('corr', -22, -16, 4.4, 5, Math.min(out, out + s * 0.25), Math.max(out, out + s * 0.25), 0xaab3bc, 0);
    for (const x of [-22.16, -16]) B('flat', x, x + 0.16, 0, 4.4, z0 - 0.04, z1 + 0.04, YEL, 0);
    sign(g, '第三倉庫', -13.5, 3.5, out + s * 0.03, 3.6, 1, s < 0 ? PI : 0, '#c9c4b4', '#1b2a3a'); }
  const ex0 = -11.4, ex1 = -11;
  wall(ex0, ex1, 0, 5.4, -14.4, -9.2); wall(ex0, ex1, 2.4, 5.4, -9.2, -7); wall(ex0, ex1, 0, 5.4, -7, -3);
  wall(ex0, ex1, 0, 1.2, -3, -0.4); wall(ex0, ex1, 2.4, 5.4, -3, -0.4); wall(ex0, ex1, 0, 5.4, -0.4, 0.4); wall(ex0, ex1, 0, 1.2, 0.4, 3); wall(ex0, ex1, 2.4, 5.4, 0.4, 3);
  wall(ex0, ex1, 0, 5.4, 3, 7); wall(ex0, ex1, 2.4, 5.4, 7, 9.2); wall(ex0, ex1, 0, 5.4, 9.2, 14.4);
  B('corr', -27.3, -10.7, 5.4, 5.7, -14.7, 14.7, ROOF); B('corr', -19.8, -18.2, 5.7, 6, -14.7, 14.7, ROOF, 0);
  B('wood', -22.5, -19.5, 0, 1.3, -6, -3); B('wood', -22.5, -19.5, 1.3, 2.6, -6, -3, 0xd9c9a8); B('wood', -19.5, -18.1, 0, 1.3, -5.2, -3.8);
  B('wood', -18.5, -15.5, 0, 1.3, 3, 6); B('wood', -18.5, -17, 1.3, 2.6, 3, 6, 0xd9c9a8);
  B('flat', -26.6, -23.6, 2.75, 3, -6, 6, STEEL); for (const z of [-5.8, 0, 5.8]) C('flat', -23.75, 1.375, z, 0.08, 2.75, 0, STEEL2);
  B('flat', -23.7, -23.6, 3, 3.9, -6, -2, YEL); B('flat', -23.7, -23.6, 3, 3.9, 2, 6, YEL);
  B('wood', -26.6, -25.7, 0, 2.2, -5, -1, 0xbfae8a); B('wood', -26.6, -25.7, 0, 2.2, 1, 5, 0xbfae8a);
  for (let i = 1; i <= 12; i++) B('flat', -26.6, -25.2, 0, 0.25 * i, 12 - 0.5 * i, 12.5 - 0.5 * i, i % 2 ? STEEL : STEEL2); // stairs: quarter-metre steps, walked up without jumping
  B('wood', -12.8, -11.4, 0, 3, 10, 13.6, 0xbfae8a); forklift(-14.6, -2);
  barrels(-13.2, -13.3, BLUE, RED);
  for (const z of [-9, 0, 9]) { const s = glow(0xffe2b0, 2.4); s.position.set(-19, 5.05, z); g.add(s); B('lit', -19.3, -18.7, 5.2, 5.4, z - 0.15, z + 0.15, 0xfff0d0, 0); }
  light(-19, 4.8, 0, 0xffd9a0, 1.1, 34);

  // north-west yard: box truck, pallets, fence toward the road
  B('corr', -25.5, -23.1, 0.9, 3.4, -27, -22.2, WHITE); B('flat', -24.8, -23.8, 0.45, 0.9, -27, -20.2, DARK); B('flat', -25.4, -23.2, 0.45, 2.5, -22, -20.1, BLUE);
  B('flat', -25.25, -23.35, 1.5, 2.25, -20.1, -20.06, 0x141a22, 0); for (const x of [-25.2, -23.75]) B('lit', x, x + 0.35, 0.75, 0.95, -20.1, -20.07, 0xfff3c4, 0);
  for (const z of [-21.2, -26]) { C('flat', -24.3, 0.45, z, 0.45, 2.36, 1, BLK); for (const x of [-25.3, -23.3]) col(x - 0.18, x + 0.18, 0, 0.9, z - 0.45, z + 0.45); }
  B('wood', -14.5, -12.5, 0, 1.3, -18.2, -16.2); B('wood', -14.5, -13.1, 0, 2.6, -19.6, -18.2, 0xd9c9a8);
  B('flat', -26.9, -25.2, 0, 1.4, -17.6, -15, GREEN); B('flat', -26.95, -25.15, 1.4, 1.5, -17.65, -14.95, 0x24523a, 0);
  barrels(-14, -38, RED, BLUE); fence(-11, -33, -21); lamp(-11, -33.3, 1);

  // south-west yard: forklift, pallets, a site hut with vending machines
  forklift(-21.3, 18.6); B('wood', -21.2, -20.2, 0.2, 1, 17.4, 18.6, 0xd9c9a8);
  B('wood', -15.5, -13.5, 0, 0.9, 17, 19, 0xcbb88e); barrels(-13.2, 20, BLUE, BLUE);
  B('conc', -26.6, -22.6, 0, 2.7, 26, 31, PALE); B('flat', -26.8, -22.4, 2.7, 2.85, 25.8, 31.2, ROOF, 0);
  B('lit', -22.6, -22.56, 1.1, 1.9, 29.3, 30.6, WARM, 0); B('flat', -24.7, -23.8, 0, 2, 25.96, 26, STEEL, 0); B('flat', -26.3, -25.5, 0, 0.8, 25.3, 26, 0xbfc4c8);
  B('flat', -22.6, -21.9, 0, 1.83, 26.3, 27.3, WHITE); B('flat', -22.6, -21.9, 0, 1.83, 27.4, 28.4, 0xc23b3b);
  mk(vendGeo, vendTex('#2c6fd1'), -21.89, 0.94, 26.8, g).rotation.y = PI / 2; mk(vendGeo, vendTex('#d9382e'), -21.89, 0.94, 27.9, g).rotation.y = PI / 2;
  { const s = glow(0xdfeaff, 2.6); s.position.set(-21.6, 1.2, 27.35); g.add(s); }
  fence(-11, 20, 32); lamp(-11, 32.3, 1);

  // middle lane, north: gate booth, barriers, a parked trailer across the road (the gap under it is open to shots)
  B('conc', 3.6, 5.8, 0, 2.6, -37.6, -35.4, PALE); B('flat', 3.4, 6, 2.6, 2.75, -37.8, -35.2, ROOF, 0); B('lit', 3.56, 3.6, 1.1, 1.9, -37.2, -35.8, WARM, 0); B('lit', 4, 5.4, 1.1, 1.9, -35.4, -35.36, WARM, 0);
  jersey(-8, -5, -30); jersey(-1.5, 1.5, -30); jersey(-5, -2, -26.7);
  B('corr', -8, 1.6, 1.1, 3.9, -23.3, -20.7, BLUE); B('flat', -8, 1.6, 0.85, 1.1, -22.6, -21.4, DARK, 0);
  for (const x of [-6.9, -5.7]) C('flat', x, 0.5, -22, 0.5, 2.6, 2, BLK); col(-7.4, -5.2, 0, 1, -23.3, -22.8); col(-7.4, -5.2, 0, 1, -21.2, -20.7);
  B('flat', -0.5, -0.3, 0, 1.1, -23, -22.8, DARK); B('flat', -0.5, -0.3, 0, 1.1, -21.2, -21, DARK);
  B('flat', 1.9, 4.4, 0.5, 3, -23.2, -20.8, RED); B('flat', 4.4, 4.44, 1.7, 2.6, -23, -21, 0x141a22, 0); for (const z of [-23.05, -21.3]) B('lit', 4.4, 4.43, 0.8, 1, z, z + 0.35, 0xfff3c4, 0);
  for (const x of [2.3, 3.7]) { C('flat', x, 0.5, -22, 0.5, 2.5, 2, BLK); col(x - 0.5, x + 0.5, 0, 1, -23.25, -22.8); col(x - 0.5, x + 0.5, 0, 1, -21.2, -20.75); }
  C('wood', -9.4, 0.8, -15.6, 0.8, 1, 1, 0xcbb88e); col(-9.9, -8.9, 0, 1.6, -16.4, -14.8);
  B('flat', -10.8, -9.4, 0, 1.4, 10, 13, GREEN); B('flat', -10.85, -9.35, 1.4, 1.5, 9.95, 13.05, 0x24523a, 0);
  car(-9.7, 16.2, 0xc7ccd1); barrels(5.6, -9.9, RED, BLUE); B('flat', 6.2, 7.1, 0, 1.7, 8, 9.2, 0x9aa3ad);

  // the office in the middle: a room with a door at each end and windows on three sides; outside stairs lead to the roof
  const ow = (x0, x1, y0, y1, z0, z1) => B('conc', x0, x1, y0, y1, z0, z1, CREAM);
  ow(-6, -5.4, 0, 3, -4, -3.7); ow(-5.4, -3.4, 2.3, 3, -4, -3.7); ow(-3.4, -2.2, 0, 3, -4, -3.7); ow(-2.2, -0.2, 0, 1.1, -4, -3.7); ow(-2.2, -0.2, 2.3, 3, -4, -3.7); ow(-0.2, 1, 0, 3, -4, -3.7);
  ow(-6, -4.8, 0, 3, 3.7, 4); ow(-4.8, -2.8, 0, 1.1, 3.7, 4); ow(-4.8, -2.8, 2.3, 3, 3.7, 4); ow(-2.8, -1.6, 0, 3, 3.7, 4); ow(-1.6, 0.4, 2.3, 3, 3.7, 4); ow(0.4, 1, 0, 3, 3.7, 4);
  ow(-6, -5.7, 0, 3, -3.7, -1.5); ow(-6, -5.7, 0, 1.1, -1.5, 1.5); ow(-6, -5.7, 2.3, 3, -1.5, 1.5); ow(-6, -5.7, 0, 3, 1.5, 3.7); ow(0.7, 1, 0, 3, -3.7, 3.7);
  B('conc', -6, 1, 3, 3.25, -4, 4, 0x9a9da2);
  ow(-6, 1, 3.25, 4.15, -4, -3.8); ow(-6, 1, 3.25, 4.15, 3.8, 4); ow(-6, -5.8, 3.25, 4.15, -3.8, 3.8); ow(0.8, 1, 3.25, 4.15, -3.8, 2);
  for (let i = 1; i <= 13; i++) B('conc', 1, 2.4, 0, 0.25 * i, -4.5 + 0.5 * i, -4 + 0.5 * i, i % 2 ? 0x8d9299 : 0xa9adb3);
  B('conc', 1, 2.4, 0, 3.25, 2.5, 4, 0x8d9299);
  B('flat', -4.2, -2.8, 3.25, 4.2, -1.2, 0.2, 0xbfc4c8); C('flat', -5, 5.5, 3, 0.05, 4.5, 0, DARK);
  { const b = glow(0xff4d3d, 1.6); b.position.set(-5, 7.8, 3); g.add(b); beacons.push(b); }
  sign(g, '管理棟', -2.5, 3.7, -4.02, 2.6, 0.7, PI, '#e9e2c8', '#1b2a3a'); sign(g, '管理棟', -2.5, 3.7, 4.02, 2.6, 0.7, 0, '#e9e2c8', '#1b2a3a');
  B('flat', -2.6, -0.4, 0, 0.8, -0.9, -0.2, 0x6b5236); B('flat', 0.1, 0.7, 0, 1.9, -3.4, -1.6, 0x5f7387);
  B('lit', -3, -2, 2.92, 3, -0.2, 0.2, 0xfff0d0, 0); light(-2.5, 2.6, 0.6, 0xffe6c0, 0.9, 12, 1.2);
  { const s = glow(0xffd696, 1.8); s.position.set(1.7, 2.6, -4.6); g.add(s); }

  // middle lane, south: concrete pipes, sandbags, a light tower, parked cars
  for (const [y, z] of [[0.75, 19.2], [0.75, 20.8], [2.02, 20]]) { C('conc', -2, y, z, 0.75, 4, 1, 0xc4c7cb); C('flat', -2, y, z, 0.6, 4.02, 1, BLK); }
  col(-4, 0, 0, 1.5, 18.45, 21.55); col(-4, 0, 1.5, 2.77, 19.25, 20.75);
  for (let r = 0; r < 3; r++) { const y = r * 0.333, c = r % 2 ? 0x9a875f : TAN; B('flat', 2.5 + r % 2 * 0.1, 5.5, y, y + 0.333, 23, 23.7, c, 0); B('flat', 5.5, 6.2, y, y + 0.333, 21.4 + r % 2 * 0.1, 23.7, c, 0); }
  col(2.5, 5.5, 0, 1, 23, 23.7); col(5.5, 6.2, 0, 1, 21.4, 23.7);
  B('flat', -8.6, -7.2, 0, 1.2, 23, 24.2, YEL); C('flat', -7.9, 3.2, 23.6, 0.06, 4, 0, DARK); B('lit', -8.3, -7.5, 5.1, 5.4, 23.5, 23.7, 0xffffff, 0); light(-7.9, 5.2, 23.4, 0xdfe8ff, 1.2, 40, 5);
  jersey(-1, 2, 26.4); car(3.4, 30, 0x9c2f2f);

  // the rail spur between road and quay: a boxcar, a flat car low enough to jump onto, a tank wagon; cross in the gaps
  B('corr', 7.6, 10.4, 1, 4.2, -26, -14, RUST); B('flat', 7.5, 10.5, 4.2, 4.32, -26.1, -13.9, 0x4a2a20, 0); for (const x of [7.54, 10.4]) B('corr', x, x + 0.06, 1.2, 3.9, -21.6, -18.4, 0x8a4630, 0);
  bogie(-25.3); bogie(-17.1);
  B('flat', 7.6, 10.4, 0.9, 1.25, -6.5, 5.5, 0x6a5540); bogie(-5.8); bogie(2.5);
  B('wood', 8, 10, 1.25, 2.55, -5.2, -3.2); B('flat', 7.9, 10.1, 1.25, 2.35, 1.2, 4.6, 0x4d5a3c);
  C('flat', 9, 2.5, 20, 1.4, 11, 2, 0x2a3038); C('flat', 9, 2.5, 20, 1.42, 0.7, 2, WHITE); C('flat', 9, 3.95, 20, 0.5, 0.4, 0, 0x2a3038); B('flat', 7.8, 10.2, 0.9, 1.15, 14, 26, DARK, 0);
  col(7.7, 10.3, 0.9, 3.9, 14.5, 25.5); bogie(14.6); bogie(23);
  B('flat', 8, 10, 0, 1.2, -38.6, -38, 0xd94c3a); B('flat', 8, 10, 0, 1.2, 38, 38.6, 0xd94c3a);
  lamp(11.2, -10.2, 1); lamp(11.2, 11, 1);

  // east lane, north: fuel tanks under a pipe bridge, stacked containers
  for (const z of [-33.5, -26.5]) { C('flat', 22.5, 3.25, z, 2.6, 6.5, 0, WHITE); C('flat', 22.5, 5.6, z, 2.63, 0.5, 0, BLUE); C('flat', 22.5, 6.55, z, 2.3, 0.1, 0, 0xb9beba); round(22.5, z, 2.6, 6.5); }
  sign(g, '火気厳禁', 19.86, 2.2, -26.5, 2.4, 0.7, -PI / 2, '#d8d5c8', '#c8281e');
  for (const x of [11.6, 18.4]) B('flat', x, x + 0.3, 0, 4.6, -30.15, -29.85, STEEL2); B('flat', 11.4, 20.2, 4.6, 4.8, -30.3, -29.7, STEEL2, 0);
  C('flat', 15.8, 4.95, -30.14, 0.14, 8.8, 1, 0xc9a227); C('flat', 15.8, 4.95, -29.84, 0.14, 8.8, 1, 0x9aa3ad);
  { const s = glow(0xffb347, 4); s.position.set(25.6, 5.2, -30); g.add(s); }
  const cont = (x, z, y0, c) => B('corr', x - CL / 2, x + CL / 2, y0, y0 + CH, z - CW / 2, z + CW / 2, c);
  cont(17.5, -18.5, 0, HULLS[1]); cont(17.5, -18.5, CH, HULLS[2]); cont(17.5, -16.06, 0, HULLS[0]);
  B('wood', 18, 19.4, 0, 1.3, -14.84, -13.44); B('wood', 14.6, 16, CH, CH + 1.3, -16.76, -15.36);

  // east lane, middle: a squid boat hauled out on blocks. Crate, then stack, then over the gap in the rail onto the deck
  for (const z of [-5, -0.5, 4]) B('wood', 20.4, 21.6, 0, 0.9, z, z + 1, 0x8a7a60);
  for (const [x0, x1, z0, z1] of [[19, 23, -3.5, 7], [19.5, 22.5, -5.5, -3.5], [20.3, 21.7, -7, -5.5]]) { B('flat', x0, x1, 0.9, 1.5, z0, z1, RED); B('flat', x0, x1, 1.5, 2.85, z0, z1, 0x2d5f8a); }
  const bw = (x0, x1, z0, z1) => B('flat', x0, x1, 2.85, 3.4, z0, z1, WHITE);
  bw(22.85, 23, -3.5, 7); bw(19, 22.85, 6.85, 7); bw(19, 19.15, -3.5, 1); bw(19, 19.15, 3.5, 6.85);
  B('flat', 20.6, 22.85, 2.85, 5, 3, 6.85, WHITE); B('flat', 20.4, 23, 5, 5.12, 2.8, 7, 0x2d5f8a, 0); B('lit', 20.56, 20.6, 3.8, 4.5, 3.5, 6.3, WARM, 0); B('lit', 20.9, 22.5, 3.8, 4.5, 2.96, 3, WARM, 0);
  C('flat', 21, 4.6, -4.6, 0.07, 3.5, 0, WHITE); C('flat', 21, 4.6, 2.4, 0.07, 3.5, 0, WHITE); B('flat', 20.98, 21.02, 6.2, 6.24, -4.6, 2.4, DARK, 0);
  for (let z = -4; z <= 2.1; z += 1.2) { B('lit', 20.88, 21.12, 5.82, 6.1, z - 0.12, z + 0.12, 0xffffff, 0); const s = glow(0xeef4ff, 1.7); s.position.set(21, 5.95, z); g.add(s); } // squid lamps
  light(20.6, 5.6, -1, 0xe6efff, 1, 30);
  sign(g, '第九丸', 18.98, 2.15, 5.2, 2, 0.5, -PI / 2, '#d8dcd6', '#16202c');
  B('wood', 17.6, 19, 0, 1.3, 0.7, 2.1); B('wood', 17.6, 19, 0, 2.6, 2.1, 3.5, 0xd9c9a8);
  B('flat', 12, 14.5, 0, 0.7, -4, -1.5, GREEN); B('flat', 15, 17, 0, 1, 9.5, 10.9, BLUE);
  { const sg = new THREE.SphereGeometry(0.32, 10, 8), sm = new THREE.MeshLambertMaterial({ color: 0xe0662a }); for (const [x, z] of [[12.6, -3.4], [13.5, -2.2], [14, -3.3]]) mk(sg, sm, x, 0.92, z, g); }

  // east lane, south: the legs of a gantry crane, a pump house, wave blocks piled in the corner
  for (const x of [12.2, 25.6]) for (const z of [17, 25]) { B('flat', x - 0.7, x + 0.7, 0, 15, z - 0.7, z + 0.7, CRANE); B('flat', x - 0.72, x + 0.72, 0, 1.2, z - 0.72, z + 0.72, DARK, 0); }
  for (const z of [17, 25]) B('flat', 11.5, 26.3, 15, 16.6, z - 0.7, z + 0.7, CRANE);
  B('flat', 16, 22, 16.6, 19.5, 16.3, 25.7, CRANE); B('flat', 4, 50, 19.5, 21, 19.8, 22.2, CRANE, 0); B('flat', 30, 32.4, 16.2, 19.5, 19.6, 22.4, 0x8a8f96, 0);
  for (const [x, y] of [[4.5, 21.6], [49.5, 21.6], [19, 20.2]]) { const b = glow(0xff4d3d, 3); b.position.set(x, y, 21); g.add(b); beacons.push(b); }
  B('conc', 19, 23, 0, 3, 19.5, 23, PALE); B('flat', 18.8, 23.2, 3, 3.15, 19.3, 23.2, ROOF, 0); B('lit', 18.96, 19, 1.2, 2, 20.4, 21.8, WARM, 0); B('flat', 20.4, 21.4, 0, 2.1, 19.46, 19.5, STEEL, 0);
  barrels(14.2, 20.6, BLUE, RED);
  { const tg = new THREE.CylinderGeometry(0.24, 0.36, 1.25, 8), up = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3(), th = 1.9106;
    const tetra = (x, y, z, rot) => { for (let k = 0; k < 4; k++) { if (k === 0) d.set(0, 1, 0); else { const ph = rot + k * 2.0944; d.set(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)); }
      const leg = mk(tg, MATS.conc, x + d.x * 0.6, y + d.y * 0.6, z + d.z * 0.6, g); leg.quaternion.setFromUnitVectors(up, d); } };
    [[23.6, 0.75, 37.4, 0.3], [25.5, 0.75, 36.6, 1.2], [25.6, 0.75, 34.2, 2.2], [24.4, 1.7, 37.6, 0.9], [25.8, 0.75, 38.2, 0]].forEach(t => tetra(t[0], t[1], t[2], t[3])); }
  col(22.7, 26.6, 0, 2.1, 35.6, 38.6); col(24.5, 26.6, 0, 1.5, 33.2, 35.6);
  B('flat', 11.6, 12.5, 0, 1.83, 38.1, 38.9, 0x2c6fd1); B('flat', 12.7, 13.6, 0, 1.83, 38.1, 38.9, WHITE); B('wood', 14.6, 16.4, 0, 0.45, 38.2, 38.8, 0x8a6a45);
  mk(vendGeo, vendTex('#e0a81e'), 12.05, 0.94, 38.09, g).rotation.y = PI; mk(vendGeo, vendTex('#2c6fd1'), 13.15, 0.94, 38.09, g).rotation.y = PI;
  { const s = glow(0xdfeaff, 2.6); s.position.set(12.6, 1.2, 37.8); g.add(s); }

  // far off: a freighter at anchor, harbour lights, the town
  B('far', 70, 86, -1.3, 8, -58, 34, 0x070b14, 0); B('far', 72, 84, 8, 20, 14, 30, 0x070b14, 0); B('far', 77, 79, 20, 27, 20, 23, 0x070b14, 0); B('far', 77.4, 78.6, 8, 22, -44, -43, 0x070b14, 0);
  for (let r = 0; r < 3; r++) for (let z = 15.5; z < 29.5; z += 1.9) if ((r * 7 + z * 3 | 0) % 4) B('far', 71.9, 72, 10.5 + r * 3, 11.5 + r * 3, z, z + 1, 0xffcf7a, 0);
  for (const [x, y, z, c, sz] of [[78, 28.5, 21.5, 0xff4d3d, 4], [78, 23.5, -43.5, 0xffffff, 3], [60, 9, 70, 0x3dff8a, 5], [48, 9, -84, 0xff4d3d, 5]]) { const b = glow(c, sz); b.position.set(x, y, z); g.add(b); beacons.push(b); }
  B('far', 59, 61, -1.3, 8, 69, 71, 0x070b14, 0); B('far', 47, 49, -1.3, 8, -85, -83, 0x070b14, 0);
  const town = canvasTex(512, 96, (c, w, h) => { for (let x = 0; x < w;) { const bw = 14 + rnd() * 34, bh = 18 + rnd() * 62; c.fillStyle = '#070b14'; c.fillRect(x, h - bh, bw, bh);
    for (let wy = h - bh + 4; wy < h - 4; wy += 6) for (let wx = x + 3; wx < x + bw - 3; wx += 5) if (rnd() < 0.2) { c.fillStyle = rnd() < 0.8 ? '#e9b76a' : '#bcd4ff'; c.fillRect(wx, wy, 2, 3); } x += bw + rnd() * 6; } });
  const townMat = new THREE.MeshBasicMaterial({ map: town, transparent: true, fog: false, depthWrite: false });
  mk(new THREE.PlaneGeometry(300, 56), townMat, -120, 26, 0, g).rotation.y = PI / 2; mk(new THREE.PlaneGeometry(300, 56), townMat, 0, 26, 140, g).rotation.y = PI;
  cranes(g, [[-34, -74], [26, -74]]);

  K.done();
  m.g = g; m.boxes = K.bx; m.hard = K.bx.filter(b => !b.soft); m.lx = 26.5; m.lz = 38.5; m.dx = 26; m.dz = 38;
}

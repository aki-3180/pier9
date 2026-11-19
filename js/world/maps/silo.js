// Map 6: サイロ (the grain pier in the morning).
'use strict';
// map 6: a grain pier in the morning, 72 × 100 m: as long as the jetty and half again as wide, and mirrored north to south like it.
// West to east: a bulk carrier lying against the quay, its deck 4 m up, boarded by a gangway at each end; the quay; the open field;
// the silos, standing on legs over a hall of columns; a rail line behind them.
// Across the middle, 6.24 m up, the conveyor gallery runs from the ship loader on the quay to the silos. Its floor and stairs are steel grating,
// which stops feet but not bullets (soft): whoever is up there sees the whole field, and can be shot from all of it.
// Only the transfer house halfway along has a solid floor and walls. On the ground, the hopper on legs and the silo slab are roofs the gallery cannot shoot through.
function buildSilo(m) {
  seed = 131;
  const K = kit(), g = K.g, PI = Math.PI, HX = 36, HZ = 50;
  const QX = -23.6, DK = 4, FL = 6.24, RISE = 0.26, RUN = 0.34, NS = 24; // quay edge; ship's deck; gallery floor, reached by 24 steps of 0.26 m
  const CONC = 0xc4c0b6, DARK = 0x1c222b, BLK = 0x0d1015, STEEL = 0x556070, YEL = 0xe0a81e, WHITE = 0xe2e6e2, WALL = 0x8d969e, ROOF = 0x48505a,
    GRATE = 0xa9b2ba, HULL = 0x22303e, DECK = 0x7a4a3a, HATCH = 0x3d6e5a, BAG = 0xe9e6dc, BIN = 0xd6d2c8;
  const gt = canvasTex(1024, 2048, (c, w, h) => {
    c.fillStyle = '#8a877f'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 30000; i++) { const v = 100 + rnd() * 70 | 0; c.fillStyle = `rgba(${v},${v - 3},${v - 8},.3)`; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
    const sx = w / (HX - QX), sz = h / (HZ * 2); c.setTransform(sx, 0, 0, sz, -QX * sx, HZ * sz);
    const R = (x0, x1, z0, z1, f) => { c.fillStyle = f; c.fillRect(x0, z0, x1 - x0, z1 - z0); };
    const spill = (x, z, r, a) => { const gr = c.createRadialGradient(x, z, 0, x, z, r); gr.addColorStop(0, `rgba(214,178,96,${a})`); gr.addColorStop(1, 'rgba(214,178,96,0)'); R(x - r, x + r, z - r, z + r, gr); };
    for (let z = -HZ + 6; z < HZ; z += 6) R(QX, 10, z - 0.04, z + 0.04, 'rgba(40,38,36,.3)'); // joints in the apron
    for (let x = QX + 6; x < 10; x += 6) R(x - 0.04, x + 0.04, -HZ, HZ, 'rgba(40,38,36,.22)');
    R(QX, QX + 0.5, -HZ, HZ, 'rgba(224,168,30,.7)'); // the quay edge
    for (const x of [-21.6, -15.6]) R(x - 0.06, x + 0.06, -HZ, HZ, 'rgba(160,160,160,.75)'); // the ship loader's rails
    for (let z = -HZ; z < HZ; z += 3) R(-12.07, -11.93, z, z + 1.6, 'rgba(238,242,234,.5)'); // the walkway line between quay and field
    R(10, 28, -18.5, 18.5, 'rgba(24,22,22,.45)'); // in the shade under the silos
    R(12, 26, -34, -24, 'rgba(28,28,30,.4)'); R(12, 26, 24, 34, 'rgba(28,28,30,.4)'); // the receiving sheds
    R(31, 34, -HZ, HZ, '#4f463e'); for (let z = -HZ; z < HZ; z += 0.7) R(31.3, 33.7, z, z + 0.24, '#3a3029'); for (const x of [31.9, 33.1]) R(x - 0.05, x + 0.05, -HZ, HZ, '#a4a4a4'); // the rail line
    for (const s of [-1, 1]) { spill(-1.5, s * 14.5, 4, 0.55); spill(18, s * 29, 3.5, 0.4); spill(-30, 0, 3, 0.3); spill(-5, s * 2, 3, 0.3); spill(16.7, s * 9, 2.5, 0.35); }
    for (let i = 0; i < 24; i++) { const x = QX + 1 + rnd() * 55, z = -HZ + 2 + rnd() * (HZ * 2 - 4), r = 0.6 + rnd() * 1.8, gr = c.createRadialGradient(x, z, 0, x, z, r); gr.addColorStop(0, 'rgba(20,16,12,.35)'); gr.addColorStop(1, 'rgba(20,16,12,0)'); R(x - r, x + r, z - r, z + r, gr); }
  });
  gt.anisotropy = renderer.capabilities.getMaxAnisotropy();
  mk(new THREE.PlaneGeometry(HX - QX, HZ * 2), new THREE.MeshLambertMaterial({ map: gt }), (HX + QX) / 2, 0, 0, g).rotation.x = -PI / 2;
  mk(new THREE.PlaneGeometry(300, 300), new THREE.MeshLambertMaterial({ color: 0x6a6862 }), HX + 150, -0.02, 0, g).rotation.x = -PI / 2; // the land going on east
  for (const s of [-1, 1]) mk(new THREE.PlaneGeometry(HX - QX + 1, 120), new THREE.MeshLambertMaterial({ color: 0x6a6862 }), (HX + QX) / 2, -0.02, s * (HZ + 60), g).rotation.x = -PI / 2; // and north and south
  mk(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ color: 0x4a6a7c }), 0, -1.0, 0, g).rotation.x = -PI / 2; // the sea
  K.box('conc', -300, QX, -1.0, 0, -HZ - 120, -HZ - 9, 0x8d8a82, 0); K.box('conc', -300, QX, -1.0, 0, HZ + 9, HZ + 120, 0x8d8a82, 0); // far quays, past the bow and the stern
  cranes(g, [[-150, -40], [-150, 50], [60, -110, PI / 2], [70, 100, PI / 2]], new THREE.MeshBasicMaterial({ color: 0x77808e, fog: false }));
  sign(g, '九番サイロ', 11.97, 25.8, 0, 9, 2, -PI / 2, '#e9e2c8', '#1b2a3a');
  const rlGeo = new THREE.BoxGeometry(0.06, 0.08, 1), strGeo = new THREE.BoxGeometry(0.1, 0.3, 1), rlMat = new THREE.MeshLambertMaterial({ color: YEL }), strMat = new THREE.MeshLambertMaterial({ color: STEEL });
  const coneMat = new THREE.MeshLambertMaterial({ color: 0x9a968c }), coneGeo = new THREE.ConeGeometry(2.4, 0.8, 16);

  for (const s of [1, -1]) { // s = 1 is written out below as the north half; s = -1 is its mirror image, the south half. Things on the middle line are written as their north half
    const B = (mat, x0, x1, y0, y1, z0, z1, c, solid) => s > 0 ? K.box(mat, x0, x1, y0, y1, z0, z1, c, solid) : K.box(mat, x0, x1, y0, y1, -z1, -z0, c, solid);
    const C = (mat, x, y, z, r, len, axis, c) => K.cyl(mat, x, y, s * z, r, len, axis, c);
    const col = (x0, x1, y0, y1, z0, z1, soft) => s > 0 ? K.col(x0, x1, y0, y1, z0, z1, soft) : K.col(x0, x1, y0, y1, -z1, -z0, soft);
    const sg = (text, x, y, z, w, h, ry, bg, fg) => sign(g, text, x, y, s * z, w, h, s > 0 ? ry : PI - ry, bg, fg);
    const light = (x, y, z, color, power, reach, size) => { const l = new THREE.PointLight(color, power, reach, 1.6); l.position.set(x, y, s * z); g.add(l); if (size) { const sp = glow(color, size); sp.position.copy(l.position); g.add(sp); } };
    const crate = (x, z, y0) => B('wood', x - 0.7, x + 0.7, y0 || 0, (y0 || 0) + 1.3, z - 0.7, z + 0.7);
    const jersey = (x0, x1, z) => { B('conc', x0, x1, 0, 0.9, z - 0.3, z + 0.3, 0xc4c4ba); B('flat', x0 + 0.2, x1 - 0.2, 0.55, 0.7, z - 0.31, z + 0.31, YEL, 0); };
    const bag = (x, z, n) => { for (let i = 0; i < n; i++) { B('flat', x - 0.55, x + 0.55, i * 1.1, i * 1.1 + 1.05, z - 0.55, z + 0.55, i % 2 ? 0xdedbd0 : BAG); B('flat', x - 0.35, x + 0.35, i * 1.1 + 1.05, i * 1.1 + 1.12, z - 0.04, z + 0.04, 0xbcae84, 0); } }; // a one-tonne bag of grain
    const rail = (x0, x1, y, z0, z1) => { // a hand rail: drawn as bars and posts; stops feet, not bullets
      B('flat', x0, x1, y + 1.0, y + 1.06, z0, z1, YEL, 0); B('flat', x0, x1, y + 0.5, y + 0.55, z0, z1, YEL, 0); col(x0, x1, y, y + 1.06, z0, z1, true);
      const L = Math.max(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 1.6)); for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t; B('flat', x - 0.03, x + 0.03, y, y + 1.06, z - 0.03, z + 0.03, YEL, 0); }
    };
    const slope = (geo, mat, x, y, z, len, rise, up) => { const r = mk(geo, mat, x, y, s * z, g); r.scale.z = Math.hypot(len, rise); r.rotation.x = -s * up * Math.atan2(rise, len); }; // up: 1 rises toward +z (north half)
    // a flight of grating steps, lowest at zLow, rising toward +z (in the north half): every tread a thin soft box, so you can walk under the high end and shoot through it
    const stair = (x0, x1, zLow, n, rise, run) => {
      for (let i = 1; i <= n; i++) B('grate', x0, x1, i * rise - 0.06, i * rise, zLow + (i - 1) * run, zLow + i * run, GRATE, 2);
      const len = n * run, top = n * rise, zc = zLow + len / 2;
      for (const x of [x0 - 0.05, x1 + 0.05]) { slope(strGeo, strMat, x, top / 2 - 0.1, zc, len, top, 1); slope(rlGeo, rlMat, x, top / 2 + 0.9, zc, len, top, 1); }
    };

    // ---- the ship: a bulk carrier against the quay. Deck 4 m up; bow and stern raised 2.2 m more and run off the map's ends
    B('flat', -HX, QX, -1.0, DK, -HZ, 0, HULL); B('flat', -HX - 0.03, QX + 0.03, -1.0, -0.45, -HZ, 0, 0x8a2f2a, 0); B('flat', -HX - 0.03, QX + 0.03, DK - 0.35, DK - 0.2, -HZ, 0, WHITE, 0);
    B('flat', -35.98, QX - 0.02, DK, DK + 0.02, -41, 0, DECK, 0);
    B('flat', -HX, QX, DK, DK + 3, -HZ, -41, 0xc9c4b6); B('flat', -HX, QX, DK + 3, DK + 3.06, -HZ, -41, DECK, 0); // the forecastle: 3 m, out of reach even from on top of the bulwark
    for (const [x0, x1, z0, z1] of [[-35.4, -24.2, -54, -50], [-33.4, -26.2, -57, -54], [-31.4, -28.2, -59, -57]]) { B('flat', x0, x1, -1, DK + 3, z0, z1, HULL, 0); B('flat', x0, x1, DK + 3, DK + 3.06, z0, z1, DECK, 0); } // the bow, past the map's end
    C('flat', -30, DK + 8, -46, 0.22, 10, 0, WHITE); B('flat', -32, -28, DK + 10.3, DK + 10.45, -46.1, -45.9, WHITE, 0);
    B('flat', -24.1, QX, DK, DK + 1.0, -41, -31.6, HULL); B('flat', -24.1, QX, DK, DK + 1.0, -30.2, 0, HULL); B('flat', -24.15, QX + 0.05, DK + 1.0, DK + 1.08, -41, -31.6, WHITE, 0); B('flat', -24.15, QX + 0.05, DK + 1.0, DK + 1.08, -30.2, 0, WHITE, 0); // bulwarks: waist high, steel
    B('flat', -HX, -35.6, DK, DK + 1.0, -41, 0, HULL); B('flat', -HX - 0.05, -35.55, DK + 1.0, DK + 1.08, -41, 0, WHITE, 0);
    for (const [z0, z1] of [[-13.2, -3.6], [-31, -21.4]]) { B('flat', -33.4, -26.4, DK, DK + 3, z0, z1, HATCH); B('flat', -33.45, -26.35, DK, DK + 1.2, z0 - 0.05, z1 + 0.05, 0x2f5848, 0); for (let z = z0 + 1.2; z < z1 - 0.5; z += 2.4) B('flat', -33.45, -26.35, DK + 1.2, DK + 3.05, z - 0.06, z + 0.06, 0x2f5848, 0); } // hatch coamings and covers, 3 m: out of reach
    B('flat', -30.8, -29, DK, DK + 4.5, -17.9, -16.1, WHITE); B('flat', -31.2, -28.6, DK + 4.5, DK + 6.3, -18.4, -15.6, 0xd8d2c0); B('lit', -28.62, -28.6, DK + 5.3, DK + 6, -18, -16, 0x9fc0d8, 0); // a deck crane
    { const j = mk(new THREE.BoxGeometry(0.5, 0.5, 17), new THREE.MeshLambertMaterial({ color: 0xd8d2c0 }), -29.9, DK + 12.5, s * -24.5, g); j.rotation.x = s * 0.9; }
    sg('九栄丸', QX + 0.02, DK - 1.4, -44, 4.2, 1.1, PI / 2, '#22303e', '#e9e6dc');
    for (const z of [-36, -26, -16, -6]) C('flat', QX + 0.15, -0.2, z, 0.45, 2.2, 1, BLK); // fenders
    // the gangway: 16 steps of 0.25 m up from the quay, then a landing across the gap in the bulwark
    stair(QX, -22.3, -37, 16, 0.25, RUN); B('grate', -24.1, -22.3, DK - 0.06, DK, -31.6, -30.2, GRATE, 2); rail(-22.33, -22.27, DK, -31.6, -30.2); rail(QX, -22.3, DK, -30.23, -30.17);

    // ---- the quay: bollards, bags of grain, a lamp
    for (const z of [-44, -26, -18, -10]) { C('flat', -23.0, 0.35, z, 0.28, 0.7, 0, 0x30353d); col(-23.3, -22.7, 0, 0.7, z - 0.3, z + 0.3); }
    bag(-18.4, -24, 2); bag(-17.3, -24, 2); bag(-17.3, -25.1, 1); bag(-15, -36.5, 1); bag(-13.9, -36.5, 1);
    jersey(-21.5, -18.5, -12.5);
    B('flat', -20.9, -20.6, 0, 10, -44.15, -43.85, DARK); B('flat', -20.9, -19.4, 9.85, 10, -44.1, -43.9, DARK, 0); light(-19.5, 9.7, -44, 0xfff1d8, 0.5, 30, 4);

    // ---- the conveyor gallery along the middle line, written as its north half. Grating floor, a belt down the middle, rails along the edges
    col(-19.6, 8.6, FL - 0.06, FL, -1.7, 0, true);
    for (let x = -19.6; x < 8.59; x += 1.41) if (x + 1.41 <= -6.6 || x >= -1.4) B('grate', x, x + 1.41, FL - 0.05, FL, -1.7, 0, GRATE, 0); // (the house has its own floor)
    B('flat', -19.6, 8.6, FL - 0.4, FL - 0.06, -1.82, -1.62, STEEL, 0); for (let x = -19.6; x <= 8.6; x += 2.82) B('flat', x - 0.06, x + 0.06, FL - 0.32, FL - 0.06, -1.7, 0, STEEL, 0);
    B('flat', -17, 6.4, FL, FL + 0.3, -0.45, 0, DARK); B('flat', -16.8, 6.2, FL + 0.3, FL + 0.36, -0.28, 0, 0xd2b06a, 0); // the belt: low enough to step over
    for (const [x0, x1] of [[-19.6, -19.2], [-18.0, -11.4], [-9.4, -6.6], [-1.4, 1.4], [3.4, 6.8], [8.0, 8.6]]) rail(x0, x1, FL, -1.73, -1.67); // gaps: the stairs, two places to drop off
    rail(-19.63, -19.57, FL, -1.7, 0); rail(8.57, 8.63, FL, -1.7, 0);
    for (const x of [-12.5, 2.5]) { B('flat', x - 0.22, x + 0.22, 0, FL - 0.4, -2.22, -1.78, STEEL); B('flat', x - 0.15, x + 0.15, FL - 0.7, FL - 0.4, -2.2, 0, STEEL, 0); } // trestles
    // the ship loader at the west end: legs on the quay rails, a machine house over the end of the gallery, the boom out over the ship
    for (const x of [-21.6, -15.6]) { B('flat', x - 0.3, x + 0.3, 0, FL + 2.8, -3.7, -3.1, YEL); B('flat', x - 0.2, x + 0.2, FL - 0.5, FL - 0.1, -3.7, 0, YEL, 0); B('flat', x - 0.5, x + 0.5, 0, 0.6, -4.2, -2.6, DARK); }
    B('corr', -22.2, -15.2, FL + 2.8, FL + 5.4, -3.8, 0, 0xd8cfae); B('flat', -35, -22.2, FL + 3.2, FL + 4.2, -0.8, 0, YEL); B('flat', -31, -30, DK + 2.6, FL + 3.2, -0.45, 0, DARK);
    // stairs up: one from each side at each end, landing on that side's walkway
    stair(-19.2, -18.0, -1.7 - NS * RUN, NS, RISE, RUN); stair(6.8, 8.0, -1.7 - NS * RUN, NS, RISE, RUN);
    for (const x of [5.0, 8.4]) B('flat', x - 0.22, x + 0.22, 0, FL - 0.06, -2.22, -1.78, STEEL);
    B('corr', 8.9, 9.9, 0, 27.5, -0.7, 0, 0xb9b3a4); // the elevator leg up the face of the silos
    // the transfer house halfway: a solid floor and walls on the gallery, a doorway at each end of each walkway, a long slit north (and south) over the field
    { const X0 = -6.6, X1 = -1.4, Z0 = -2.6, H = FL + 2.7, W = (x0, x1, y0, y1, z0, z1) => B('conc', x0, x1, y0, y1, z0, z1, 0xd9d4c8);
      B('conc', X0, X1, FL - 0.3, FL, Z0, 0, 0x9a9890);
      W(X0, X1, FL, FL + 1.0, Z0, Z0 + 0.25); W(X0, X1, FL + 1.75, H, Z0, Z0 + 0.25); W(X0, -5.8, FL + 1.0, FL + 1.75, Z0, Z0 + 0.25); W(-2.2, X1, FL + 1.0, FL + 1.75, Z0, Z0 + 0.25);
      for (const [x0, x1] of [[X0, X0 + 0.25], [X1 - 0.25, X1]]) { W(x0, x1, FL, H, Z0 + 0.25, -1.7); W(x0, x1, FL + 2.1, H, -1.7, -0.45); W(x0, x1, FL + 0.5, H, -0.45, 0); }
      B('flat', X0 - 0.2, X1 + 0.2, H, H + 0.45, Z0 - 0.2, 0, ROOF); // thick enough that a jump from the rail does not reach its top
      for (const x of [X0 + 0.3, X1 - 0.3]) B('conc', x - 0.25, x + 0.25, 0, FL - 0.3, Z0 + 0.05, Z0 + 0.55, 0xb9b5aa);
      B('lit', -4.4, -3.6, H - 0.05, H, -1.2, -0.9, 0xfff0d0, 0); sg('乗継所', -4, FL + 2.2, Z0 - 0.02, 2.6, 0.55, PI, '#e9e2c8', '#1b2a3a');
      if (s > 0) light(-4, H - 0.5, 0, 0xffe2b0, 0.5, 10); }
    sg('頭上注意', -12.5, 2.4, -2.24, 1.2, 0.5, PI, '#e0a81e', '#14171d');

    // ---- the field: the hopper on legs (walk and shoot under it; a roof against the gallery), a tipper truck, the weighbridge, barriers, bags
    B('flat', -4, 1, 2.6, 5.0, -17, -12, 0xb0aa9c); B('flat', -3.2, 0.2, 2.2, 2.6, -16.2, -12.8, 0x8f897c, 0); B('flat', -4.05, 1.05, 4.6, 4.7, -17.05, -11.95, YEL, 0);
    for (const x of [-3.8, 0.8]) for (const z of [-16.8, -12.2]) B('flat', x - 0.2, x + 0.2, 0, 2.6, z - 0.2, z + 0.2, STEEL);
    B('corr', -11.2, -8.8, 1.0, 3.0, -31, -22, 0x9a8a5a); B('flat', -10.8, -9.2, 0.7, 1.0, -31, -21.8, DARK, 0); B('flat', -11.1, -8.9, 0.5, 3.0, -21.8, -19.6, 0x2c5c9c); B('lit', -10.9, -9.1, 2.0, 2.7, -19.62, -19.6, 0x9fc0d8, 0); // tipper: shots go under the trailer
    for (const z of [-30, -28.8, -23.4]) { C('flat', -10, 0.5, z, 0.5, 2.3, 1, BLK); for (const x of [-11, -9]) col(x - 0.18, x + 0.18, 0, 1.0, z - 0.5, z + 0.5); }
    C('flat', -10, 0.5, -20.4, 0.5, 2.3, 1, BLK);
    B('flat', -0.2, 3.0, 0, 0.18, -37, -23, 0x6d6d68); for (const z of [-37, -23]) B('flat', -0.2, 3.0, 0.18, 0.2, z - 0.1, z + 0.1, YEL, 0); // the weighbridge
    B('conc', 5, 7.6, 0, 2.7, -31.4, -28.8, 0xd8d4c8); B('flat', 4.8, 7.8, 2.7, 2.9, -31.6, -28.6, ROOF); B('lit', 4.98, 5, 1.2, 2.1, -30.9, -29.3, 0x9fc0d8, 0); sg('計量所', 4.97, 2.4, -30.1, 1.6, 0.4, -PI / 2, '#e9e2c8', '#1b2a3a');
    jersey(-1.5, 1.5, -20.5); jersey(-12, -9, -42); jersey(2, 5, -6.5); jersey(13, 16, -20.8);
    bag(-7, -7.6, 1); bag(-5.9, -7.6, 1); bag(4.2, -11, 2); bag(5.3, -11, 1); bag(19, -41, 2); bag(20.1, -41, 2);
    for (let i = 0; i < 4; i++) B('flat', -2.2, -0.2, i * 0.3, i * 0.3 + 0.28, -27.2, -26, i % 2 ? 0x9d7a4a : 0xa98656, 0); col(-2.2, -0.2, 0, 1.2, -27.2, -26); // pallets
    // a container to climb from a crate, short of the base
    B('corr', -9.6, -9.6 + CL, 0, CH, -38, -38 + CW, HULLS[3]); crate(-2.75, -36.8);

    // ---- the base: a site office, a lamp, containers stacked two high behind (past the map's end)
    B('corr', -8, -2, 0, 2.7, -48.6, -46.2, 0xd9d4c4); B('flat', -8.2, -1.8, 2.7, 2.9, -48.8, -46, ROOF); B('lit', -7, -5.4, 1.2, 2.0, -46.18, -46.16, 0x9fc0d8, 0); B('flat', -4.4, -3.4, 0, 2.1, -46.18, -46.16, 0x4b5560, 0);
    for (let x = QX + 0.2, i = 0; x < HX + 6; x += CL + 0.08, i++) { B('corr', x, x + CL, 0, CH, -HZ - 0.06 - CW, -HZ - 0.06, HULLS[i % 5]); B('corr', x, x + CL, CH, CH * 2, -HZ - 0.06 - CW, -HZ - 0.06, HULLS[(i + 2) % 5]); }
    B('flat', 13.9, 14.2, 0, 9, -46.15, -45.85, DARK); B('flat', 13.9, 15.4, 8.85, 9, -46.1, -45.9, DARK, 0); light(15.3, 8.7, -46, 0xfff1d8, 0.5, 30, 4);

    // ---- the receiving shed: roofed, open at both ends, a door each side. A tipper inside, shots go under its body
    { const Z0 = -34, Z1 = -24, X0 = 12, X1 = 26, H = 4.2, Wl = (z0, z1) => { B('corr', X0, 18.2, 0, H, z0, z1, WALL); B('corr', 18.2, 19.8, 2.2, H, z0, z1, WALL); B('corr', 19.8, X1, 0, H, z0, z1, WALL); };
      Wl(Z0, Z0 + 0.25); Wl(Z1 - 0.25, Z1); for (const x of [X0, X1 - 0.2]) B('corr', x, x + 0.2, H - 0.8, H, Z0 + 0.25, Z1 - 0.25, WALL); // a band over each open end B('corr', X0 - 0.4, X1 + 0.4, H, H + 0.25, Z0 - 0.4, Z1 + 0.4, ROOF);
      B('corr', 14, 21.5, 1.0, 3.0, -30.2, -27.8, 0x9a8a5a); B('flat', 14, 21.5, 0.7, 1.0, -29.6, -28.4, DARK, 0); B('flat', 21.5, 23.6, 0.5, 3.0, -30.1, -27.9, 0xa5352f);
      for (const x of [15, 16.2, 20.6]) { C('flat', x, 0.5, -29, 0.5, 2.3, 2, BLK); for (const z of [-30, -28]) col(x - 0.5, x + 0.5, 0, 1.0, z - 0.18, z + 0.18); }
      C('flat', 22.8, 0.5, -29, 0.5, 2.3, 2, BLK);
      B('lit', 18.6, 19.4, H - 0.06, H, -29.3, -28.7, 0xfff0d0, 0); light(19, H - 0.5, -29, 0xffd9a0, 0.5, 16);
      sg('荷受', X0 - 0.02, H - 0.4, -29, 2.4, 0.7, -PI / 2, '#e9e2c8', '#1b2a3a'); }

    // ---- the silos: eight bins on a slab 3 m up, on a grid of columns you walk between. A low belt runs under them
    B('conc', 10, 28, 3.0, 3.6, -18, 0, 0xa9a59b);
    for (const x of [14.5, 23.5]) for (const z of [-13.5, -4.5]) {
      const r = 4.4; C('conc', x, 13.8, z, r, 20.4, 0, BIN); C('flat', x, 24.15, z, r * 0.98, 0.3, 0, 0xb9b5aa);
      const cn = mk(coneGeo, coneMat, x, 2.6, s * z, g); cn.rotation.x = PI;
    }
    col(10.1, 27.9, 3.6, 24, -17.9, 0); // the bins as one block: no ledge on the slab's rim to stand on
    B('corr', 12, 26, 24, 27.5, -6, 0, 0xc9c4b6);
    for (const x of [10.4, 14.5, 19, 23.5, 27.6]) { for (const z of [-17.6, -13.5, -9, -4.5]) B('conc', x - 0.4, x + 0.4, 0, 3.0, z - 0.4, z + 0.4, 0xb9b5aa); B('conc', x - 0.4, x + 0.4, 0, 3.0, -0.4, 0, 0xb9b5aa); }
    B('flat', 16.35, 17.15, 0, 0.9, -16, -2.5, DARK); B('flat', 16.45, 17.05, 0.9, 0.96, -15.8, -2.7, 0xd2b06a, 0);
    light(19, 2.6, -9, 0xffcf90, 0.7, 16, 1.5);

    // ---- the rail line behind the silos: covered hopper wagons, shots go under them. The fence at the map's edge
    for (const [z0, z1] of [[-24, -14], [-12.2, -2.8]]) {
      B('corr', 31.2, 33.8, 1.1, 3.9, z0, z1, 0x7a5a48); B('flat', 31.5, 33.5, 0.7, 1.1, z0 + 0.4, z1 - 0.4, DARK, 0);
      for (const z of [z0 + 1.4, z1 - 1.4]) { C('flat', 32.5, 0.45, z, 0.45, 2.3, 1, BLK); for (const x of [31.5, 33.5]) col(x - 0.18, x + 0.18, 0, 0.9, z - 0.45, z + 0.45); }
    }
    for (let z = -HZ; z < 0; z += 3) { B('fence', 35.97, 36.03, 0, 2.4, z, z + 3, 0xffffff, 0); C('flat', 36, 1.25, z, 0.05, 2.5, 0, STEEL); }
  }
  K.done();
  m.g = g; m.boxes = K.bx; m.hard = K.bx.filter(b => !b.soft); m.lx = HX - 0.5; m.lz = HZ - 0.5; m.dx = HX - 1; m.dz = HZ - 1;
}

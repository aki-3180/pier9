// Map 3: 横丁 (the drinking alley).
'use strict';
// map 3: the drinking alley behind the pier, laid out for the shotgun. No sight line is long: the streets are cut by screens that leave a gap to walk round,
// the lanes meet at a wall instead of crossing, and a corner or a doorway is never far. Point-symmetric like the market.
// Every block is a plain rectangle with a way round it, so a drone pressing on a wall always slides to a corner. The screens are 3 m: too high to see over or to climb
// (nothing that can be stood on is above counter height), and just low enough for the heavy drones to pass above; the smaller ones go through the gaps.
function buildAlley(m) {
  seed = 83;
  const K = kit(), g = K.g, PI = Math.PI, H = 5.6, PX = 16.8, PZ = 16.3;
  const ROOF = 0x3f4a56, DARK = 0x1c222b, BLK = 0x0d1015, WOOD = 0x3a2a20, WOOD2 = 0x6b4a32, RUST = 0x8a5a3c, TEAL = 0x4f7a78, BLUEG = 0x5f7f96, GREENG = 0x5d7a62, CREAM = 0xd9d0b8, PLASTER = 0xbfb8a6,
    RED = 0xe2392b, CLOTH = 0xb8322a, NAVY = 0x1f2f55, WARM = 0xffd9a0, UNLIT = 0x2a3448, PINK = 0xff6fae, YEL = 0xe0a81e, STRAW = 0xd8c48a, WHITE = 0xe2e6e2;
  const GW = PX * 2 + 1.6, GD = PZ * 2 + 1.6;
  const pools = [], pool = (x, z, r, rgb) => pools.push([x, z, r, rgb], [-x, -z, r, rgb]); // lamp light, painted on the ground
  pool(1.5, -5, 3.4, '255,150,90'); pool(5.5, 1.5, 3.4, '255,150,90'); pool(-6.6, -13.4, 3, '255,200,140'); pool(-3.3, -5.4, 3, '255,200,140');
  pool(5, -12.6, 4.2, '255,179,71'); pool(-13, -4.5, 4.2, '255,179,71'); pool(1.4, -13.4, 2.8, '255,111,174'); pool(-10, -15.2, 2.6, '160,215,255'); pool(7.4, -15.2, 2.6, '160,215,255');
  pool(5.8, -9.2, 2.6, '255,170,110'); pool(-9.4, -4.8, 2.6, '255,170,110'); pool(-15, -14.6, 5, '255,179,71'); pool(6, -5, 2.4, '255,200,140'); pool(-10, -5.6, 2.4, '255,200,140');
  const gt = canvasTex(1024, 1024, (c, w) => {
    c.fillStyle = '#191d25'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 9000; i++) { const v = 20 + rnd() * 40 | 0; c.fillStyle = `rgba(${v + 10},${v + 14},${v + 22},.5)`; c.fillRect(rnd() * w, rnd() * w, 2, 2); }
    const sx = w / GW, sz = w / GD; c.setTransform(sx, 0, 0, sz, GW / 2 * sx, GD / 2 * sz);
    const R = (x0, x1, z0, z1, f) => { c.fillStyle = f; c.fillRect(x0, z0, x1 - x0, z1 - z0); };
    for (const s of [1, -1]) {
      const Q = (x0, x1, z0, z1, f) => s > 0 ? R(x0, x1, z0, z1, f) : R(-x1, -x0, -z1, -z0, f);
      const pave = (x0, x1, z0, z1, f, d) => { Q(x0, x1, z0, z1, f); for (let x = x0 + d; x < x1 - 0.05; x += d) Q(x, x + 0.04, z0, z1, 'rgba(8,10,14,.45)'); for (let z = z0 + d; z < z1 - 0.05; z += d) Q(x0, x1, z, z + 0.04, 'rgba(8,10,14,.45)'); };
      const STONE = 'rgba(128,118,104,.3)';
      pave(-7, 7, -6.5, -3.5, STONE, 0.6); pave(4, 7, -3.5, 3.5, STONE, 0.6); pave(3, 7, -12.3, -6.5, STONE, 0.6); pave(-12.8, -7, -6.5, -2.5, STONE, 0.6); // the inner lanes
      pave(-2.2, -0.2, -12.3, -6.5, 'rgba(96,100,108,.3)', 0.4); pave(7, 12.8, -2.5, -0.5, 'rgba(96,100,108,.3)', 0.4); // the two narrow ones
      Q(-8, -2.5, -12, -6.8, 'rgba(120,84,52,.6)'); for (let x = -7.6; x < -2.6; x += 0.4) Q(x, x + 0.03, -12, -6.8, 'rgba(20,12,6,.5)'); // the standing bar's boards
      Q(-3.7, 3.7, -3.2, 0, 'rgba(120,84,52,.6)'); for (let x = -3.3; x < 3.6; x += 0.4) Q(x, x + 0.03, -3.2, 0, 'rgba(20,12,6,.5)');
      Q(-PX, PX, -PZ, -PZ + 0.3, 'rgba(6,8,12,.6)'); Q(-PX, -PX + 0.3, -PZ, 0, 'rgba(6,8,12,.6)'); Q(PX - 0.3, PX, -PZ, 0, 'rgba(6,8,12,.6)'); // gutter under the outer walls
      for (let x = -15; x < 15.5; x += 5) Q(x, x + 0.7, -PZ + 0.02, -PZ + 0.28, 'rgba(120,128,140,.5)');
      for (const [x, z] of [[-14.4, -9.2], [10.8, -14.2], [5.5, 1.6], [-0.6, -5]]) { c.fillStyle = 'rgba(8,10,14,.55)'; c.beginPath(); c.arc(s * x, s * z, 0.36, 0, 7); c.fill(); c.strokeStyle = 'rgba(140,146,156,.4)'; c.lineWidth = 0.05; c.stroke(); } // manholes
    }
    for (let i = 0; i < 16; i++) { const x = -16 + rnd() * 32, z = -15.5 + rnd() * 31, r = 0.5 + rnd() * 1.2, gr = c.createRadialGradient(x, z, 0, x, z, r); gr.addColorStop(0, 'rgba(4,6,10,.55)'); gr.addColorStop(1, 'rgba(4,6,10,0)'); R(x - r, x + r, z - r, z + r, gr); } // puddles
    c.globalCompositeOperation = 'lighter';
    for (const [x, z, r, rgb] of pools) { const gr = c.createRadialGradient(x, z, 0, x, z, r); gr.addColorStop(0, `rgba(${rgb},.32)`); gr.addColorStop(0.5, `rgba(${rgb},.11)`); gr.addColorStop(1, `rgba(${rgb},0)`); R(x - r, x + r, z - r, z + r, gr); }
  });
  gt.anisotropy = renderer.capabilities.getMaxAnisotropy();
  mk(new THREE.PlaneGeometry(GW, GD), new THREE.MeshLambertMaterial({ map: gt }), 0, 0, 0, g).rotation.x = -PI / 2;
  mk(new THREE.PlaneGeometry(600, 600), new THREE.MeshLambertMaterial({ color: 0x10141c }), 0, -0.05, 0, g).rotation.x = -PI / 2;

  // the izakaya in the middle, the parts that are their own mirror image: ceiling, roof, the kitchen with the counter round it.
  // Each of its four doors opens on a blank wall across the lane, not on a lane's mouth, and the kitchen stands in every line from one door to the one opposite.
  K.box('conc', -3.7, 3.7, 3, 3.2, -3.2, 3.2, 0x8a8f96); K.box('corr', -4.25, 4.25, H, H + 0.2, -3.75, 3.75, ROOF, 0); K.col(-4, 4, H, H + 0.2, -3.5, 3.5);
  K.box('flat', -0.9, 0.9, 0, 3, -0.9, 0.9, 0x54402e); K.box('flat', -1.8, 1.8, 0, 1.05, -1.6, 1.6, WOOD2); K.box('flat', -1.86, 1.86, 1.05, 1.09, -1.66, 1.66, 0x9a7a52, 0);

  for (const s of [1, -1]) { // s = 1 is written out below as the north half (and the whole east side of the middle); s = -1 turns it half a circle
    const B = (mat, x0, x1, y0, y1, z0, z1, c, solid) => s > 0 ? K.box(mat, x0, x1, y0, y1, z0, z1, c, solid) : K.box(mat, -x1, -x0, y0, y1, -z1, -z0, c, solid);
    const C = (mat, x, y, z, r, len, axis, c) => K.cyl(mat, s * x, y, s * z, r, len, axis, c);
    const col = (x0, x1, y0, y1, z0, z1) => s > 0 ? K.col(x0, x1, y0, y1, z0, z1) : K.col(-x1, -x0, y0, y1, -z1, -z0);
    const pick = (a, b) => s > 0 ? a : b;
    const glowAt = (x, y, z, color, size) => { const sp = glow(color, size); sp.position.set(s * x, y, s * z); g.add(sp); };
    const light = (x, y, z, color, power, reach) => { const l = new THREE.PointLight(color, power, reach, 1.6); l.position.set(s * x, y, s * z); g.add(l); };
    const sg = (text, x, y, z, w, h, ry, bg, fg, vert) => sign(g, text, s * x, y, s * z, w, h, ry + (s < 0 ? PI : 0), bg, fg, vert);
    // things hung on a wall. ax 0: the wall runs along x and looks along z; ax 1: runs along z, looks along x. p is the wall's face, n the way it looks, a0..a1 the stretch along it
    const pan = (ax, p, n, a0, a1, y0, y1, t, mat, c) => { const q0 = Math.min(p, p + n * t), q1 = Math.max(p, p + n * t); if (ax) B(mat, q0, q1, y0, y1, a0, a1, c, 0); else B(mat, a0, a1, y0, y1, q0, q1, c, 0); };
    const label = (ax, p, n, a, y, w, h, text, bg, fg, vert) => ax ? sg(text, p + n * 0.13, y, a, w, h, n * PI / 2, bg, fg, vert) : sg(text, a, y, p + n * 0.13, w, h, n > 0 ? 0 : PI, bg, fg, vert);
    const door = (ax, p, n, a0, a1, tint, cloth) => { pan(ax, p, n, a0, a1, 0, 2.1, 0.04, 'shoji', tint); pan(ax, p, n, a0 - 0.1, a1 + 0.1, 2.1, 2.3, 0.1, 'flat', WOOD); if (cloth !== undefined) pan(ax, p, n, a0, a1, 1.5, 2.1, 0.14, 'flat', cloth); }; // a shut sliding door, lit from inside
    const way = (ax, p, n, a0, a1, cloth) => { pan(ax, p, n, a0 - 0.12, a1 + 0.12, 2.4, 2.58, 0.1, 'flat', WOOD); pan(ax, p, n, a0, a1, 2, 2.4, 0.06, 'flat', cloth); }; // an open doorway: the short curtain hangs above head height
    const win = (ax, p, n, a0, a1, y0, y1, tint) => { pan(ax, p, n, a0, a1, y0, y1, 0.04, 'shoji', tint); pan(ax, p, n, a0 - 0.08, a1 + 0.08, y0 - 0.1, y0, 0.1, 'flat', WOOD); };
    const shutter = (ax, p, n, a0, a1) => pan(ax, p, n, a0, a1, 0, 2.3, 0.05, 'corr', 0x8b929b);
    const board = (ax, p, n, a0, a1, text, bg, fg) => { pan(ax, p, n, a0, a1, 2.62, 3.3, 0.1, 'flat', DARK); label(ax, p, n, (a0 + a1) / 2, 2.96, a1 - a0 - 0.12, 0.56, text, bg, fg); };
    const hang = (ax, p, n, a, y, text, bg, fg) => { pan(ax, p, n, a - 0.07, a + 0.07, y - 0.85, y + 0.85, 0.62, 'flat', DARK); const q = p + n * 0.36; // a sign standing out from the wall, read from both ways along the street
      if (ax) { sg(text, q, y, a + 0.08, 0.5, 1.6, 0, bg, fg, true); sg(text, q, y, a - 0.08, 0.5, 1.6, PI, bg, fg, true); } else { sg(text, a + 0.08, y, q, 0.5, 1.6, PI / 2, bg, fg, true); sg(text, a - 0.08, y, q, 0.5, 1.6, -PI / 2, bg, fg, true); } };
    const lantern = (x, y, z, big, c) => { const r = big ? 0.27 : 0.16, l = big ? 0.72 : 0.4; C('lit', x, y, z, r, l, 0, c || RED); C('flat', x, y + l / 2 + 0.025, z, r * 0.6, 0.05, 0, BLK); C('flat', x, y - l / 2 - 0.025, z, r * 0.6, 0.05, 0, BLK); if (big) glowAt(x, y, z, 0xff5a3a, 1.9); };
    const unit = (ax, p, n, a, y) => { pan(ax, p, n, a, a + 0.8, y, y + 0.6, 0.32, 'flat', 0xbfc4c8); pan(ax, p, n, a + 0.12, a + 0.56, y + 0.08, y + 0.52, 0.33, 'flat', 0x39424d); }; // an air conditioner's outdoor unit, up on the wall
    const upper = (ax, p, n, a0, a1, lit) => { let i = 0; for (let a = a0 + 0.5; a + 1.2 <= a1 - 0.4; a += 1.9, i++) win(ax, p, n, a, a + 1.2, 3.55, 4.6, lit >> i & 1 ? WARM : UNLIT); };
    const crates = (x0, x1, z0, z1, c1, c2) => { for (let i = 0; i < 3; i++) B('flat', x0 + (i % 2) * 0.03, x1 - (i % 2) * 0.03, i * 0.3, i * 0.3 + 0.3, z0, z1, i % 2 ? c2 : c1, 0); col(x0, x1, 0, 0.9, z0, z1); }; // beer crates, three high
    const planter = (x0, x1, z0, z1) => { B('conc', x0, x1, 0, 0.5, z0, z1, 0x9a9da2); B('flat', x0 + 0.08, x1 - 0.08, 0.5, 0.95, z0 + 0.08, z1 - 0.08, 0x2f6b4a, 0); };

    // screens across the streets
    const stall = (x0, x1, z0, z1, c) => { // a food cart under a tin roof
      B('flat', x0, x1, 0, 1, z0, z1, WOOD2, 0); B('flat', x0 + 0.2, x1 - 0.2, 1, 2.2, z0 + 0.2, z1 - 0.2, 0x241812, 0); B('flat', x0 - 0.02, x1 + 0.02, 2.15, 2.75, z0 - 0.02, z1 + 0.02, c, 0);
      B('corr', x0 - 0.15, x1 + 0.15, 2.75, 3, z0 - 0.15, z1 + 0.15, 0x6a3a2a, 0); B('lit', x0 + 0.24, x1 - 0.24, 2.05, 2.14, z0 + 0.24, z1 - 0.24, 0xffc890, 0);
      for (const px of [x0, x1 - 0.1]) for (const pz of [z0, z1 - 0.1]) B('flat', px, px + 0.1, 1, 2.15, pz, pz + 0.1, WOOD, 0);
      col(x0, x1, 0, 3, z0, z1); };
    const hoard = (x0, x1, z0, z1, text) => { // a plank wall pasted with bills; it stands across the street, so its two long faces look along it
      B('flat', x0, x1, 0, 3, z0, z1, 0x4a3a2c); B('flat', x0 - 0.04, x1 + 0.04, 3, 3.08, z0 - 0.04, z1 + 0.04, DARK, 0);
      const ax = x1 - x0 < z1 - z0 ? 1 : 0, a0 = ax ? z0 : x0, BILL = [0xd9c9a8, CLOTH, 0x2c5c9c, YEL, 0xc9c4b4];
      for (const [p, n] of ax ? [[x0, -1], [x1, 1]] : [[z0, -1], [z1, 1]]) { for (let i = 0; i < 2; i++) pan(ax, p, n, a0 + 0.2 + i * 1.1, a0 + 0.75 + i * 1.1, 0.7 + (i ^ (n > 0)) * 0.5, 1.5 + (i ^ (n > 0)) * 0.5, 0.02, 'flat', BILL[rnd() * 5 | 0]);
        label(ax, p, n, a0 + 0.95, 2.25, 0.42, 1.3, text, '#e9e2c8', '#b8322a', true); } };
    const vend = (x0, x1, z0, z1, ax, n) => { // two vending machines in a shelter, fronts on the face (ax, n)
      B('flat', x0, x1, 0, 3, z0, z1, 0x39424d); const p = ax ? (n > 0 ? x1 : x0) : (n > 0 ? z1 : z0), a0 = ax ? z0 : x0;
      for (const [o, top] of [[0.12, 0xd9382e], [1.04, 0x2c6fd1]]) { pan(ax, p, n, a0 + o, a0 + o + 0.84, 0.1, 1.85, 0.05, 'lit', 0xdfe8f0); pan(ax, p, n, a0 + o, a0 + o + 0.84, 1.62, 1.85, 0.06, 'lit', top);
        for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) pan(ax, p, n, a0 + o + 0.1 + k * 0.17, a0 + o + 0.22 + k * 0.17, 1.05 + r * 0.28, 1.27 + r * 0.28, 0.07, 'lit', [0xd9382e, 0x2c6fd1, YEL, 0x2f9a5a][(r + k) % 4]);
        pan(ax, p, n, a0 + o + 0.08, a0 + o + 0.76, 0.22, 0.7, 0.06, 'flat', 0x1a2028); }
      pan(ax, p, n, a0 + 0.1, a0 + 1.9, 2.25, 2.8, 0.05, 'lit', 0xfff3c4); };
    const casks = (x0, x1, z0, z1) => { // sake casks in straw, three high, lying along the shorter side
      const ax = x1 - x0 < z1 - z0 ? 1 : 2, len = ax === 1 ? x1 - x0 : z1 - z0, a0 = ax === 1 ? z0 : x0, w = ((ax === 1 ? z1 - z0 : x1 - x0)) / 2;
      for (let i = 0; i < 2; i++) for (let r = 0; r < 3; r++) { const a = a0 + w * (i + 0.5), y = 0.5 + r, cx = ax === 1 ? (x0 + x1) / 2 : a, cz = ax === 1 ? a : (z0 + z1) / 2;
        C('flat', cx, y, cz, 0.5, len, ax, STRAW); C('flat', cx, y, cz, 0.505, len * 0.3, ax, (i + r) % 2 ? CLOTH : 0x2c5c9c); C('flat', cx, y, cz, 0.4, len + 0.02, ax, 0xf2ede0); }
      col(x0, x1, 0, 3, z0, z1); };

    // the backs of the buildings that stand around the alley: one wall per stretch, each its own height and skin
    const SKIN = [RUST, TEAL, BLUEG, GREENG, CREAM, PLASTER, 0x7d6f63, 0x8f959c];
    const backs = (ax, p, n, a0, a1) => {
      for (let a = a0; a < a1 - 0.01;) {
        let w = 3.4 + rnd() * 3; if (a + w > a1 - 2.4) w = a1 - a;
        const h = 5.4 + rnd() * 2.2, mat = rnd() < 0.55 ? 'corr' : 'conc', c = SKIN[rnd() * SKIN.length | 0], q0 = Math.min(p, p - n * 0.8), q1 = Math.max(p, p - n * 0.8), k = rnd(), lit = rnd() * 8 | 0;
        if (ax) B(mat, q0, q1, 0, h, a, a + w, c); else B(mat, a, a + w, 0, h, q0, q1, c);
        if (k < 0.4) shutter(ax, p, n, a + 0.5, a + w - 0.5); else if (k < 0.75) door(ax, p, n, a + 0.6, a + 2, k < 0.6 ? WARM : UNLIT, [CLOTH, NAVY, 0x2f6b4a][lit % 3]); else unit(ax, p, n, a + 0.6, 2.5);
        upper(ax, p, n, a, a + w, lit); a += w;
      }
    };
    backs(0, -PZ, 1, -PX - 0.8, PX + 0.8); backs(1, PX, -1, -PZ, 0); backs(1, -PX, 1, -PZ, 0);

    // the izakaya: north wall with its door, east wall with its door (the other two are their mirror images)
    const WD = 0x4a3526;
    B('flat', -4, 0.7, 0, 3, -3.5, -3.2, WD); B('flat', 0.7, 2.3, 2.4, 3, -3.5, -3.2, WD); B('flat', 2.3, 4, 0, 3, -3.5, -3.2, WD); B('conc', -4, 4, 3, H, -3.5, -3.2, 0xcfc6ae);
    B('flat', 3.7, 4, 0, 3, -3.2, 0.7, WD); B('flat', 3.7, 4, 2.4, 3, 0.7, 2.3, WD); B('flat', 3.7, 4, 0, 3, 2.3, 3.2, WD); B('conc', 3.7, 4, 3, H, -3.2, 3.2, 0xcfc6ae);
    B('flat', 0.45, 0.65, 0, 3, -4.5, -3.5, WD); B('flat', 2.35, 2.55, 0, 3, -4.5, -3.5, WD); B('corr', 0.35, 2.65, 3, 3.12, -4.62, -3.5, 0x6a3a2a, 0); // a porch: the door is seen only from in front
    B('flat', 4, 5, 0, 3, 0.45, 0.65, WD); B('flat', 4, 5, 0, 3, 2.35, 2.55, WD); B('corr', 4, 5.12, 3, 3.12, 0.35, 2.65, 0x6a3a2a, 0);
    way(0, -3.5, -1, 0.7, 2.3, NAVY); board(0, -3.5, -1, 0, 3, pick('居酒屋 九番', '酒処 九番'), '#1f2f55', '#fff3d6'); lantern(0.55, 2.36, -4.82, true); lantern(2.45, 2.36, -4.82, true);
    win(0, -3.5, -1, -3.4, -0.9, 0.95, 2.1, WARM); upper(0, -3.5, -1, -4, 4, 13);
    way(1, 4, 1, 0.7, 2.3, NAVY); board(1, 4, 1, 0, 3, pick('やきとり', 'もつ焼'), '#b8322a', '#fff3d6'); lantern(5.32, 2.36, 0.55, true); lantern(5.32, 2.36, 2.45, true);
    win(1, 4, 1, -2.9, -0.5, 0.95, 2.1, WARM); upper(1, 4, 1, -3.5, 3.5, 6);
    for (const y of [1.5, 2.05, 2.6]) { pan(0, -0.9, -1, -0.8, 0.8, y, y + 0.04, 0.2, 'flat', 0x9a7a52); pan(1, 0.9, 1, -0.8, 0.8, y, y + 0.04, 0.2, 'flat', 0x9a7a52); // the kitchen's shelves of bottles
      for (let i = 0; i < 6; i++) { const a = -0.72 + i * 0.26, c = [0x7fd08a, 0xffc46b, 0xbfe3ff, 0xd9382e][(i + (y * 10 | 0)) % 4]; pan(0, -0.9, -1, a, a + 0.1, y + 0.04, y + 0.34, 0.14, 'lit', c); pan(1, 0.9, 1, a, a + 0.1, y + 0.04, y + 0.34, 0.14, 'lit', c); } }
    for (const x of [-1.3, -0.45]) { C('flat', x, 0.3, -2.1, 0.17, 0.6, 0, DARK); C('flat', x, 0.62, -2.1, 0.2, 0.05, 0, CLOTH); } // stools, walked through
    for (const z of [-1, 0]) { C('flat', 2.3, 0.3, z, 0.17, 0.6, 0, DARK); C('flat', 2.3, 0.62, z, 0.2, 0.05, 0, CLOTH); }
    pan(0, -3.2, 1, -3.7, 0.7, 0.9, 3, 0.02, 'conc', CREAM); pan(0, -3.2, 1, 2.3, 3.7, 0.9, 3, 0.02, 'conc', CREAM); pan(1, 3.7, -1, -3.2, 0.7, 0.9, 3, 0.02, 'conc', CREAM); pan(1, 3.7, -1, 2.3, 3.2, 0.9, 3, 0.02, 'conc', CREAM); // plaster above the wainscot
    for (let i = 0; i < 7; i++) { pan(0, -3.2, 1, -3.3 + i * 0.42, -3.05 + i * 0.42, 2, 2.6, 0.03, 'flat', i % 3 ? 0xf2ede0 : 0xf0d98a); pan(1, 3.7, -1, -2.9 + i * 0.42, -2.65 + i * 0.42, 2, 2.6, 0.03, 'flat', i % 3 ? 0xf2ede0 : 0xf0d98a); } // the bill of fare, a slip per dish
    B('lit', -0.4, 0.4, 2.92, 3, -2.5, -2.3, 0xfff0d0, 0); light(0, 2.6, -2.4, 0xffd9a0, 0.9, 9);
    pan(0, -3.5, -1, -1.7, 1.7, H + 0.2, H + 1.5, 0.2, 'flat', DARK); sg(pick('九番', '横丁'), 0, H + 0.85, -3.72, 3.2, 1.2, PI, '#b8322a', '#fff3d6'); // on the roof, seen down the lanes

    // north row, west end: a grill bar (solid) and, beside it, a standing bar to walk through: one door on the street, one on the inner lane
    B('corr', -12.8, -8, 0, H, -12.3, -6.5, RUST); B('corr', -13, -7.8, H, H + 0.2, -12.5, -6.3, ROOF, 0);
    const ST = pick(CREAM, 0xc9c4b4);
    B('conc', -8, -7.4, 0, H, -12.3, -12, ST); B('conc', -7.4, -5.8, 2.4, H, -12.3, -12, ST); B('conc', -5.8, -2.2, 0, H, -12.3, -12, ST);
    B('conc', -8, -4, 0, H, -6.8, -6.5, ST); B('conc', -4, -2.5, 2.4, H, -6.8, -6.5, ST); B('conc', -2.5, -2.2, 0, H, -6.8, -6.5, ST); // the back door looks at the izakaya's wall, not down the lane beside it
    B('conc', -2.5, -2.2, 0, H, -12, -6.8, ST); B('conc', -8, -2.5, 3, 3.2, -12, -6.8, 0x8a8f96);
    B('corr', -8.2, -2, H + 0.3, H + 0.5, -12.5, -6.3, 0x4a3f3a, 0); B('conc', -8, -2.2, H, H + 0.3, -12.3, -6.5, ST, 0); col(-8, -2.2, H, H + 0.5, -12.3, -6.5);
    B('flat', -3.3, -2.5, 0, 1.05, -12, -8.3, WOOD2); B('flat', -3.36, -2.5, 1.05, 1.09, -12, -8.24, 0x9a7a52, 0); // counter
    for (const y of [1.6, 2.15]) { pan(1, -2.5, -1, -11.2, -8.5, y, y + 0.04, 0.2, 'flat', 0x9a7a52); for (let i = 0; i < 9; i++) pan(1, -2.5, -1, -11.1 + i * 0.3, -11 + i * 0.3, y + 0.04, y + 0.34, 0.14, 'lit', [0x7fd08a, 0xffc46b, 0xbfe3ff][(i + (y * 10 | 0)) % 3]); }
    B('flat', -8, -7.3, 0, 2, -10.4, -9.4, WHITE); B('flat', -7.3, -7.27, 0.15, 1.9, -10.3, -9.5, 0xbfe3ff, 0); // a glass-fronted fridge
    C('flat', -6.6, 0.5, -8.1, 0.06, 1, 0, DARK); C('flat', -6.6, 1.03, -8.1, 0.42, 0.05, 0, WOOD2); col(-6.9, -6.3, 0, 1.05, -8.4, -7.8); // a standing table
    B('lit', -5.6, -4.8, 2.92, 3, -9.5, -9.3, 0xfff0d0, 0); light(-5.2, 2.6, -9.4, 0xffd9a0, 0.9, 9);
    way(0, -12.3, -1, -7.4, -5.8, CLOTH); board(0, -12.3, -1, -8, -5.2, pick('立ち飲み', '角打ち'), '#e9e2c8', '#1b2a3a'); lantern(-7.8, 2.2, -12.65, true);
    way(0, -6.5, 1, -4, -2.5, CLOTH); board(0, -6.5, 1, -4.6, -2.3, pick('立ち飲み', '角打ち'), '#e9e2c8', '#1b2a3a'); lantern(-4.4, 2.3, -6.15, true);
    upper(0, -12.3, -1, -8, -2.2, 5); upper(0, -6.5, 1, -8, -2.2, 2); unit(1, -2.2, 1, -10.5, 2.6); win(1, -2.2, 1, -8.6, -7.4, 3.55, 4.6, WARM);
    door(0, -12.3, -1, -11.9, -10.5, WARM, CLOTH); board(0, -12.3, -1, -12.5, -9.9, pick('焼とん', '串かつ'), '#b8322a', '#fff3d6'); lantern(-9.6, 2.25, -12.6); upper(0, -12.3, -1, -12.8, -8, 1);
    shutter(1, -12.8, -1, -12, -10.2); unit(1, -12.8, -1, -8.6, 2.6); upper(1, -12.8, -1, -12.3, -6.5, 4); hang(1, -12.8, -1, -7.2, 3.9, pick('酒', '氷'), '#e9e2c8', '#1b2a3a');
    door(0, -6.5, 1, -10.3, -8.9, WARM, NAVY); board(0, -6.5, 1, -10.6, -8.4, pick('おでん', 'そば'), '#1f2f55', '#fff3d6'); lantern(-8.5, 2.25, -6.2); upper(0, -6.5, 1, -12.8, -8, 2);

    // north row, the narrow house between the two lanes: a snack bar under a pink sign
    B('conc', -0.2, 3, 0, 6.1, -12.3, -6.5, PLASTER); B('corr', -0.4, 3.2, 6.1, 6.3, -12.5, -6.3, ROOF, 0);
    pan(0, -12.3, -1, 0.3, 1.4, 0, 2.1, 0.05, 'flat', 0x5a2a4a); pan(0, -12.3, -1, 0.65, 1.05, 1.2, 1.7, 0.07, 'lit', PINK); board(0, -12.3, -1, -0.1, 2.3, pick('スナック 汐', 'スナック 灯'), '#3a1a34', '#ff9fc8');
    hang(0, -12.3, -1, 1.9, 4.2, 'スナック', '#ff6fae', '#3a1a34'); glowAt(1.9, 4.2, -12.75, PINK, 2.4); upper(0, -12.3, -1, -0.2, 3, 0);
    shutter(0, -6.5, 1, 1.9, 2.9); unit(0, -6.5, 1, 0, 2.5); crates(-0.1, 0.9, -6.5, -5.95, YEL, CLOTH); upper(0, -6.5, 1, -0.2, 3, 1); unit(1, 3, 1, -7.6, 2.6); upper(1, 3, 1, -10.4, -6.5, 1);

    // east side: a noodle shop and a mahjong parlour in one long block, and a tackle shop by itself
    B('corr', 7, 12.8, 0, H, -12.3, -7.4, GREENG); B('corr', 6.8, 13, H, H + 0.2, -12.5, -7.4, ROOF, 0); B('conc', 7, 12.8, 0, 6.2, -7.4, -2.5, CREAM); B('corr', 6.8, 13, 6.2, 6.4, -7.4, -2.3, ROOF, 0);
    door(1, 7, -1, -11.2, -9.8, WARM, CLOTH); board(1, 7, -1, -11.6, -9, pick('ラーメン', '中華そば'), '#b8322a', '#fff3d6'); lantern(6.65, 2.25, -9.2); upper(1, 7, -1, -12.3, -8.6, 3);
    door(1, 7, -1, -5.6, -4.2, UNLIT); board(1, 7, -1, -6.2, -3.6, pick('麻雀 九蓮', '囲碁 将棋'), '#2f6b4a', '#fff3d6'); win(1, 7, -1, -6.6, -3.2, 3.55, 4.6, WARM); unit(1, 7, -1, -3.5, 2.5);
    shutter(0, -12.3, -1, 8, 10.4); upper(0, -12.3, -1, 7, 12.8, 2); hang(0, -12.3, -1, 12.2, 3.9, pick('ラーメン', '中華'), '#b8322a', '#fff3d6');
    shutter(1, 12.8, 1, -12, -10.2); door(1, 12.8, 1, -7.4, -6.2, UNLIT, 0x2f6b4a); unit(1, 12.8, 1, -3.8, 2.6); upper(1, 12.8, 1, -12.3, -2.5, 9); unit(0, -2.5, 1, 9, 2.6); upper(0, -2.5, 1, 7, 12.8, 2);
    B('corr', 7, 12.8, 0, 5.1, -0.5, 2.5, BLUEG); B('corr', 6.8, 13, 5.1, 5.3, -0.7, 2.7, ROOF, 0);
    shutter(1, 7, -1, 0.7, 2.2); board(1, 7, -1, -0.3, 2.3, pick('釣具 えさ', '氷 製氷'), '#e9e2c8', '#1b2a3a'); crates(6.45, 7, -0.45, 0.4, 0x2c5c9c, YEL); upper(1, 7, -1, -0.5, 2.5, 1);
    door(1, 12.8, 1, 0.3, 1.7, UNLIT, NAVY); upper(1, 12.8, 1, -0.5, 2.5, 0); unit(0, -0.5, -1, 10.5, 2.6); upper(0, 2.5, 1, 7, 12.8, 1);
    C('flat', 10.4, 6.5, -9.8, 0.75, 1.5, 0, 0x8b929b); C('flat', 10.4, 7.3, -9.8, 0.8, 0.1, 0, DARK); for (const [dx, dz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) B('flat', 10.35 + dx, 10.45 + dx, H, H + 0.3, -9.85 + dz, -9.75 + dz, DARK, 0); // a water tank on the roof

    // gates over the mouths of the two wide lanes
    B('flat', 3, 7, 3.5, 4.3, -12.5, -12.3, WOOD, 0); sg(pick('九番横丁', 'みなと小路'), 5, 3.9, -12.52, 3.5, 0.62, PI, '#e9e2c8', '#1b2a3a'); sg(pick('九番横丁', 'みなと小路'), 5, 3.9, -12.28, 3.5, 0.62, 0, '#e9e2c8', '#1b2a3a');
    lantern(3.4, 3.2, -12.4); lantern(6.6, 3.2, -12.4); glowAt(5, 3.3, -12.4, 0xffb070, 3);
    B('flat', -13, -12.8, 3.5, 4.3, -6.5, -2.5, WOOD, 0); sg(pick('のんべ小路', '波止場通り'), -13.02, 3.9, -4.5, 3.5, 0.62, -PI / 2, '#e9e2c8', '#1b2a3a'); sg(pick('のんべ小路', '波止場通り'), -12.78, 3.9, -4.5, 3.5, 0.62, PI / 2, '#e9e2c8', '#1b2a3a');
    lantern(-12.9, 3.2, -6.1); lantern(-12.9, 3.2, -2.9); glowAt(-12.9, 3.3, -4.5, 0xffb070, 3);

    // the screens, always in pairs set close: one from each side of the street, overlapping by 0.4 m in the middle, so the way through is a dog-leg and the straight view along the street is cut.
    // Outer street: two pairs on the north side, one each on the east and west (their mirror images make the rest). The two wide lanes: one pair each
    vend(-8.8, -7.2, -PZ, -PZ + 2.2, 1, -1); glowAt(-9, 1.4, -15.2, 0xbfe3ff, 2.2); stall(-5.4, -3.8, -14.5, -12.3, CLOTH); lantern(-5.55, 2.3, -14.65);
    hoard(2.5, 3, -14.5, -12.3, '火の用心'); vend(4.8, 6.4, -PZ, -PZ + 2.2, 1, 1); glowAt(6.6, 1.4, -15.2, 0xbfe3ff, 2.2);
    hoard(12.8, 15, -8.3, -7.8, pick('空室あり', '貸店舗')); stall(PX - 2.2, PX, -6, -4.4, NAVY); lantern(PX - 2.35, 2.3, -6.15);
    stall(-15, -12.8, -9.6, -8, CLOTH); lantern(-15.15, 2.3, -9.75); hoard(-PX, -PX + 2.2, -6.2, -5.7, '火の用心');
    // in the lanes the inner screen stands at the lane's mouth and leaves its gap on the izakaya's side, so what is seen through it ends at the izakaya's wall or porch
    stall(3, 5.2, -10.3, -9.3, CLOTH); lantern(5.35, 2.3, -9.15, true); sg(pick('おでん', 'たこ焼'), 4.1, 2.45, -10.33, 1.6, 0.5, PI, '#b8322a', '#fff3d6'); sg(pick('おでん', 'たこ焼'), 4.1, 2.45, -9.27, 1.6, 0.5, 0, '#b8322a', '#fff3d6');
    casks(4.8, 7, -7.5, -6.5);
    stall(-10.8, -9.8, -4.7, -2.5, NAVY); lantern(-9.65, 2.3, -4.85, true); sg(pick('やきそば', '甘酒'), -10.83, 2.45, -3.6, 1.6, 0.5, -PI / 2, '#1f2f55', '#fff3d6'); sg(pick('やきそば', '甘酒'), -9.77, 2.45, -3.6, 1.6, 0.5, PI / 2, '#1f2f55', '#fff3d6');
    casks(-8, -7, -6.5, -4.3);

    // low things to stand behind, in the inner lanes only: a jump from the top of one beside a screen would show what is behind the screen, so the outer street has none
    B('flat', -3.3, -1.5, 0, 0.45, -3.92, -3.5, WOOD2); planter(4, 4.5, -2.6, -1);

    // paper lanterns strung over the inner lanes, and a lamp at each corner of the outer street
    B('flat', -6.8, 6.8, 4.12, 4.15, -5.02, -4.98, BLK, 0); for (let x = -6; x <= 6.01; x += 1.5) lantern(x, 3.86, -5, false, x * 2 % 2 ? 0xfff0d0 : RED);
    B('flat', 5.48, 5.52, 4.12, 4.15, -6.3, 6.3, BLK, 0); for (let z = -5.25; z <= 5.26; z += 1.5) lantern(5.5, 3.86, z, false, z * 2 % 2 ? RED : 0xfff0d0);
    glowAt(0, 3.86, -5, 0xff7a4a, 4.5); glowAt(5.5, 3.86, 0, 0xff7a4a, 4.5); light(5.5, 3.6, -5, 0xffb070, 0.9, 16);
    B('flat', -PX, -PX + 0.2, 0, 6, -PZ, -PZ + 0.2, DARK, 0); B('flat', -PX, -PX + 1.5, 5.85, 6, -PZ + 0.06, -PZ + 0.2, DARK, 0); light(-PX + 1.6, 5.6, -PZ + 1.4, 0xffb347, 1.2, 26); glowAt(-PX + 1.5, 5.8, -PZ + 0.2, 0xffb347, 5);
    B('flat', PX - 0.2, PX, 0, 6, -PZ, -PZ + 0.2, DARK, 0); B('flat', PX - 1.5, PX, 5.85, 6, -PZ + 0.06, -PZ + 0.2, DARK, 0); glowAt(PX - 1.5, 5.8, -PZ + 0.2, 0xffb347, 5);
  }
  cranes(g, [[-34, -62], [30, -62]]);
  K.done();
  m.g = g; m.boxes = K.bx; m.hard = K.bx.filter(b => !b.soft); m.lx = PX - 0.5; m.lz = PZ - 0.5; m.dx = PX - 1; m.dz = PZ - 1;
}

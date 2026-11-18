// Map 2: 魚市場 (the fish market).
'use strict';
// map 2: the fish market. Small and point-symmetric: whatever stands at (x, z) also stands at (-x, -z), so north and south start even.
// Each half has a two-storey building on its right hand, an open yard on its left, and the auction stand in the middle.
function buildMarket(m) {
  seed = 57;
  const K = kit(), g = K.g, PI = Math.PI;
  const CONC = 0xa9adb3, ROOF = 0x3f4a56, STEEL = 0x556070, STEEL2 = 0x6a7686, YEL = 0xe0a81e, DARK = 0x1c222b, BLK = 0x0d1015, WHITE = 0xe2e6e2, FOAM = 0xe8ecec, BLUE = 0x2c5c9c, RED = 0xa5352f, TUB = 0x2c6fd1, GREEN = 0x2f6b4a;
  const GW = 41.2, GD = 49.2;
  const pools = []; /* daylight: no painted lamp pools */ const _unused = [[7.9, -15.5, 10, '255,179,71'], [-7.9, 15.5, 10, '255,179,71'], [-9.6, -9, 8, '215,228,255'], [9.6, 9, 8, '215,228,255'], [0, 0, 6, '255,214,150']];
  const gt = canvasTex(1024, 1024, (c, w) => {
    c.fillStyle = '#3d434c'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 9000; i++) { const v = 20 + rnd() * 40 | 0; c.fillStyle = `rgba(${v + 10},${v + 14},${v + 22},.5)`; c.fillRect(rnd() * w, rnd() * w, 2, 2); }
    const sx = w / GW, sz = w / GD; c.setTransform(sx, 0, 0, sz, GW / 2 * sx, GD / 2 * sz);
    const R = (x0, x1, z0, z1, f) => { c.fillStyle = f; c.fillRect(x0, z0, x1 - x0, z1 - z0); };
    const WH = 'rgba(238,242,234,.38)';
    R(-10.5, 10.5, -16, 16, 'rgba(70,78,92,.3)'); // the auction floor
    for (let z = -16; z <= 16; z += 4) R(-10.5, 10.5, z, z + 0.08, 'rgba(10,12,18,.6)');
    for (const x of [-0.25, 0.15]) R(x, x + 0.1, -16, 16, 'rgba(10,12,18,.7)'); // drain
    for (const s of [-1, 1]) { R(s * 10.5 - 0.06, s * 10.5 + 0.06, -16, 16, WH); R(-10.5, 10.5, s * 16 - 0.06, s * 16 + 0.06, WH); }
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const x = s * (-8.6 + i * 3); c.strokeStyle = WH; c.lineWidth = 0.08; c.strokeRect(x - 1.1, s * 17.2 - (s > 0 ? 0 : 2.2), 2.2, 2.2); } // numbered lots in front of each base
    for (let x = -19.6; x < 19.6; x += 1.2) for (const z of [-23.9, 23.4]) R(x, x + 0.6, z, z + 0.5, 'rgba(255,179,71,.4)');
    for (let i = 0; i < 14; i++) { const x = -19 + rnd() * 38, z = -23 + rnd() * 46, r = 0.6 + rnd() * 1.6, gr = c.createRadialGradient(x, z, 0, x, z, r); gr.addColorStop(0, 'rgba(4,6,10,.6)'); gr.addColorStop(1, 'rgba(4,6,10,0)'); R(x - r, x + r, z - r, z + r, gr); } // puddles
    c.globalCompositeOperation = 'lighter';
    for (const [x, z, r, rgb] of pools) { const gr = c.createRadialGradient(x, z, 0, x, z, r); gr.addColorStop(0, `rgba(${rgb},.3)`); gr.addColorStop(0.5, `rgba(${rgb},.1)`); gr.addColorStop(1, `rgba(${rgb},0)`); R(x - r, x + r, z - r, z + r, gr); }
  });
  gt.anisotropy = renderer.capabilities.getMaxAnisotropy();
  mk(new THREE.PlaneGeometry(GW, GD), new THREE.MeshLambertMaterial({ map: gt }), 0, 0, 0, g).rotation.x = -PI / 2;
  mk(new THREE.PlaneGeometry(600, 600), new THREE.MeshLambertMaterial({ color: 0x555b63 }), 0, -0.05, 0, g).rotation.x = -PI / 2;
  K.box('conc', -20.6, -20, 0, 4.5, -24.6, 24.6, CONC); K.box('conc', 20, 20.6, 0, 4.5, -24.6, 24.6, CONC); K.box('conc', -20, 20, 0, 4.5, -24.6, -24, CONC); K.box('conc', -20, 20, 0, 4.5, 24, 24.6, CONC);

  // the auction stand in the middle: three steps up from north and south, crates on top, a canopy that hides it from the upstairs windows
  K.box('conc', -3.5, 3.5, 0, 0.75, -2.5, 2.5, 0x9a9da2); K.box('wood', -1, 1, 0.75, 2.05, -0.7, 0.7); K.box('corr', -4, 4, 3.9, 4.1, -3, 3, ROOF);
  for (const px of [-3.3, 3.3]) for (const pz of [-2.3, 2.3]) K.box('flat', px - 0.15, px + 0.15, 0.75, 3.9, pz - 0.15, pz + 0.15, STEEL);
  K.box('lit', -0.5, 0.5, 3.82, 3.9, -0.2, 0.2, 0xfff0d0, 0);
  { const l = new THREE.PointLight(0xffe6c0, 1, 16, 1.6); l.position.set(0, 3.5, 0); g.add(l); const s = glow(0xffd696, 1.6); s.position.set(0, 3.7, 0); g.add(s); }

  for (const s of [1, -1]) { // s = 1 is written out below as the north half; s = -1 turns it half a circle into the south half
    const B = (mat, x0, x1, y0, y1, z0, z1, c, solid) => s > 0 ? K.box(mat, x0, x1, y0, y1, z0, z1, c, solid) : K.box(mat, -x1, -x0, y0, y1, -z1, -z0, c, solid);
    const C = (mat, x, y, z, r, len, axis, c) => K.cyl(mat, s * x, y, s * z, r, len, axis, c);
    const col = (x0, x1, y0, y1, z0, z1) => s > 0 ? K.col(x0, x1, y0, y1, z0, z1) : K.col(-x1, -x0, y0, y1, -z1, -z0);
    const light = (x, y, z, color, power, reach, size) => { const l = new THREE.PointLight(color, power, reach, 1.6); l.position.set(s * x, y, s * z); g.add(l); if (size) { const sp = glow(color, size); sp.position.copy(l.position); g.add(sp); } };
    const sg = (text, x, y, z, w, h, ry, bg, fg) => sign(g, text, s * x, y, s * z, w, h, ry + (s < 0 ? PI : 0), bg, fg);
    const toro = (x0, x1, z0, z1, n) => { for (let i = 0; i < n; i++) B('flat', x0 + (i % 2) * 0.04, x1 - (i % 2) * 0.04, i * 0.32, i * 0.32 + 0.32, z0, z1, i % 2 ? 0xd6dcdc : FOAM, 0); col(x0, x1, 0, n * 0.32, z0, z1); }; // stacked foam fish boxes
    const tub = (x0, x1, z0, z1) => { B('flat', x0, x1, 0, 0.9, z0, z1, TUB); B('flat', x0 + 0.12, x1 - 0.12, 0.9, 0.91, z0 + 0.12, z1 - 0.12, 0x0c1a2c, 0); };
    const jersey = (x0, x1, z) => { B('conc', x0, x1, 0, 0.9, z - 0.3, z + 0.3, 0xc4c4ba); B('flat', x0 + 0.2, x1 - 0.2, 0.55, 0.7, z - 0.31, z + 0.31, YEL, 0); };
    const drums = (x, z, c1, c2) => { [[0, 0, c1], [0.66, 0.1, c2], [0.3, 0.62, c1]].forEach(([dx, dz, c]) => { C('flat', x + dx, 0.45, z + dz, 0.3, 0.9, 0, c); C('flat', x + dx, 0.905, z + dz, 0.26, 0.02, 0, BLK); }); col(x - 0.3, x + 0.96, 0, 0.9, z - 0.3, z + 0.92); };
    const WALL = s > 0 ? 0x7fa6ba : 0xd9d0b8, wmat = s > 0 ? 'corr' : 'conc'; // the ice house is sheet metal, the co-op office plastered
    const W = (x0, x1, y0, y1, z0, z1) => B(wmat, x0, x1, y0, y1, z0, z1, WALL);

    // the building: doors north, south and toward the stand; stairs along the back wall; upstairs a window over the stand and an open hoist door to drop from
    W(-20, -19.7, 0, 6, -14, -4);
    W(-19.7, -15.5, 0, 3, -14, -13.7); W(-15.5, -13.5, 2.4, 3, -14, -13.7); W(-13.5, -10.5, 0, 3, -14, -13.7); W(-19.7, -10.5, 3, 6, -14, -13.7);
    W(-19.7, -14.5, 0, 3, -4.3, -4); W(-14.5, -12.5, 2.4, 3, -4.3, -4); W(-12.5, -10.5, 0, 3, -4.3, -4); W(-19.7, -14.5, 3, 6, -4.3, -4); W(-14.5, -12.5, 5.2, 6, -4.3, -4); W(-12.5, -10.5, 3, 6, -4.3, -4);
    W(-10.8, -10.5, 0, 3, -13.7, -10); W(-10.8, -10.5, 2.4, 3, -10, -8.4); W(-10.8, -10.5, 0, 3, -8.4, -4.3);
    W(-10.8, -10.5, 3, 6, -13.7, -11.5); W(-10.8, -10.5, 3, 4.1, -11.5, -6.5); W(-10.8, -10.5, 5.2, 6, -11.5, -6.5); W(-10.8, -10.5, 3, 6, -6.5, -4.3);
    B('conc', -18.2, -10.8, 2.75, 3, -13.7, -4.3, 0x9a9da2); B('conc', -19.7, -18.2, 2.75, 3, -13.7, -11.5, 0x9a9da2);
    for (let i = 1; i <= 12; i++) B('flat', -19.7, -18.2, 0, 0.25 * i, -5.5 - 0.5 * i, -5 - 0.5 * i, i % 2 ? STEEL : STEEL2); // quarter-metre steps, walked up without jumping
    B('flat', -18.2, -18.1, 3, 3.9, -11, -4.3, YEL);
    B('corr', -20.3, -10.2, 6, 6.25, -14.3, -3.7, ROOF); B('flat', -13.6, -13.4, 5.5, 5.7, -4, -2.6, DARK, 0); B('flat', -13.56, -13.44, 4.9, 5.5, -2.9, -2.78, DARK, 0);
    B('flat', -17, -15, 0, 1.1, -9.6, -8.1, 0x9fb8c8); B('wood', -12.4, -11.1, 3, 4.3, -5.9, -4.6);
    B('lit', -15.3, -14.7, 5.9, 6, -9.2, -8.8, 0xfff0d0, 0); light(-15, 4.6, -9, 0xffe2b0, 0.9, 15);
    sg(s > 0 ? '製氷棟' : '漁協', -10.48, 5.6, -9, 3, 0.7, PI / 2, s > 0 ? '#c9c4b4' : '#e9e2c8', '#1b2a3a');
    B('flat', -10.5, -10.1, 6.25, 6.6, -9.3, -8.7, DARK, 0); light(-9.9, 6.3, -9, 0xdfe8ff, 1.1, 30, 4); // floodlight over the door

    // a container across the side lane on the centre line, with a crate to climb it
    B('corr', -18.6, -12.5, 0, CH, -1.22, 1.22, HULLS[s > 0 ? 3 : 1]); B('wood', -12.5, -11.1, 0, 1.3, -0.7, 0.7);

    // toward the stand: barrier, a market cart, boxes of fish, live tanks
    jersey(-1.5, 1.5, -13);
    B('conc', -2, 2, 0, 0.25, -3.3, -2.9, 0x8d9299); B('conc', -2, 2, 0, 0.5, -2.9, -2.5, 0xa9adb3); // steps up to the stand
    B('flat', -7, -5.8, 0.25, 0.75, -9.6, -7, YEL, 0); C('flat', -6.4, 0.95, -7.5, 0.5, 0.9, 0, 0x8a8f96); C('flat', -6.4, 1.5, -7.5, 0.3, 0.05, 0, DARK);
    for (const z of [-9.1, -7.5]) C('flat', -6.4, 0.25, z, 0.25, 1.3, 1, BLK); col(-7, -5.8, 0, 0.75, -9.6, -7); col(-6.9, -5.9, 0.75, 1.4, -8, -7);
    toro(4.5, 6.5, -9, -7.6, 4); toro(6.5, 7.6, -9, -7.6, 6); toro(-9.4, -7.6, -18.4, -17, 5);
    tub(-3.2, -1.2, -7.6, -6.3); tub(11.2, 13.2, -5.6, -4.3);

    // the open yard opposite the building: net racks you can shoot through, a container with a crate, drums, a heap of nets
    for (const z of [-13, -10]) { B('fence', 9.47, 9.53, 0, 2.4, z, z + 3, 0xffffff, 2); C('flat', 9.5, 1.25, z, 0.05, 2.5, 0, STEEL2); } C('flat', 9.5, 1.25, -7, 0.05, 2.5, 0, STEEL2); B('flat', 9.46, 9.54, 2.38, 2.44, -13, -7, STEEL2, 0);
    B('corr', 14, 14 + CW, 0, CH, -12.5, -12.5 + CL, HULLS[s > 0 ? 0 : 2]); B('wood', 12.6, 14, 0, 1.3, -8, -6.6);
    drums(17.6, -5.4, BLUE, RED); drums(-18.9, -16.6, RED, BLUE);
    B('flat', 9.5, 12.5, 0, 0.7, -21.2, -19.2, GREEN); B('flat', 10.2, 11.8, 0.7, 1.05, -20.8, -19.6, 0x24523a, 0);

    // the base: a chilled-goods truck (shots pass under it), a lamp
    B('corr', 3, 5.4, 0.9, 3.3, -22.6, -18, WHITE); B('flat', 3.7, 4.7, 0.45, 0.9, -22.6, -16.2, DARK); B('flat', 3.1, 5.3, 0.45, 2.5, -18, -16.1, BLUE);
    B('flat', 3.25, 5.15, 1.5, 2.25, -16.1, -16.06, 0x141a22, 0); for (const x of [3.3, 4.75]) B('lit', x, x + 0.35, 0.75, 0.95, -16.1, -16.07, 0xfff3c4, 0);
    for (const z of [-21.6, -17]) { C('flat', 4.2, 0.45, z, 0.45, 2.36, 1, BLK); for (const x of [3.2, 5.2]) col(x - 0.18, x + 0.18, 0, 0.9, z - 0.45, z + 0.45); }
    B('flat', 9.35, 9.65, 0, 9, -15.65, -15.35, DARK); B('flat', 7.9, 9.5, 8.85, 9, -15.58, -15.42, DARK, 0); light(7.9, 8.7, -15.5, 0xffb347, 1.4, 40, 6);
    for (let i = 0; i < 5; i++) { const x = -3.4 + i * 1.7, y = 5.3 - Math.sin(i / 4 * PI) * 0.5, z = -3 - (i % 2) * 0.01; B('lit', x - 0.1, x + 0.1, y - 0.24, y, z - 0.1, z + 0.1, 0xffffff, 0); const sp = glow(0xeef4ff, 1.4); sp.position.set(s * x, y - 0.12, s * z); g.add(sp); } // work lamps strung along the canopy
    sg('競り場', 0, 4.5, -3.04, 2.6, 0.7, PI, '#e9e2c8', '#1b2a3a');
  }
  cranes(g, [[-34, -62], [30, -62]], new THREE.MeshBasicMaterial({ color: 0x8fa3b6, fog: false }));
  g.traverse(o => { if (o.isSprite || o.isLight) o.visible = false; }); // it is day: no lamp glows, no lamp light
  K.done();
  m.g = g; m.boxes = K.bx; m.hard = K.bx.filter(b => !b.soft); m.lx = 19.5; m.lz = 23.5; m.dx = 19; m.dz = 23;
}

// Map 7: 聖夜 (the harbour's Christmas market, on a snowy night).
'use strict';
// map 7: made for versus. 84 × 84 m, point-symmetric (what stands in the north half stands, turned half round, in the south half).
// Across the middle the inner harbour is frozen over, 30 m wide from quay to quay: on the ice the feet do not grip (MAP.ice; see playerStep),
// so a crossing is quick to start, slow to turn and slow to stop. In the middle of the ice an island with the great tree, presents heaped round it,
// reached dry-shod by one boardwalk from each side. Frozen-in boats and ice-fishing tents are the only cover out on the ice.
// Each side's town: a small chapel at the back (the spawn points are behind it and the market), a market of stalls whose roofs you can run along
// (up from a counter), a tunnel of light arches, snow huts (kamakura) you can only shoot in and out of by the door, a carousel, a sleigh.
// Snow falls all the while (MAP.tick).
function buildSnow(m) {
  seed = 251;
  const K = kit(), g = K.g, PI = Math.PI, HX = 42, HZ = 42, IZ = 15; // IZ: the ice runs between the quays at z = ±15
  const SNOW = 0xeef2f8, STONE = 0x8a8f98, WOOD = 0x6b4a32, DWOOD = 0x4a3222, RED = 0xb3262e, GREEN = 0x1f6a3e, GOLD = 0xe8b443, WHITE = 0xf2f2ee, DARK = 0x1c222b, BLK = 0x0d1015;
  const gt = canvasTex(2048, 2048, (c, w, h) => {
    c.fillStyle = '#d7dde8'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 40000; i++) { const v = 200 + rnd() * 55 | 0; c.fillStyle = `rgba(${v - 8},${v - 4},${v},.35)`; c.fillRect(rnd() * w, rnd() * h, 3, 3); }
    const sx = w / (HX * 2), sz = h / (HZ * 2); c.setTransform(sx, 0, 0, sz, HX * sx, HZ * sz);
    const R = (x0, x1, z0, z1, f) => { c.fillStyle = f; c.fillRect(x0, z0, x1 - x0, z1 - z0); };
    for (const s of [1, -1]) { // trodden paths, grey where the snow is packed down
      const P = (x0, x1, z0, z1) => s > 0 ? R(x0, x1, z0, z1, 'rgba(120,130,150,.22)') : R(-x1, -x0, -z1, -z0, 'rgba(120,130,150,.22)');
      P(7, 32, -25.6, -20.4); P(-36, -9, -23, -20); P(-2, 2, -28, -15); P(-6, 30, -17, -15.3); P(-14, 14, -42, -40.5);
      for (let i = 0; i < 26; i++) { const x = s * (-38 + rnd() * 76), z = s * -(16 + rnd() * 25); c.fillStyle = 'rgba(110,120,140,.25)'; c.beginPath(); c.ellipse(x, z, 0.12, 0.2, rnd() * 3, 0, 7); c.fill(); }
    }
  });
  gt.anisotropy = renderer.capabilities.getMaxAnisotropy();
  mk(new THREE.PlaneGeometry(HX * 2, HZ * 2), new THREE.MeshLambertMaterial({ map: gt }), 0, 0, 0, g).rotation.x = -PI / 2;
  for (const s of [-1, 1]) mk(new THREE.PlaneGeometry(400, 160), new THREE.MeshLambertMaterial({ color: 0xc9d0dc }), 0, -0.02, s * (HZ + 80), g).rotation.x = -PI / 2;
  for (const s of [-1, 1]) mk(new THREE.PlaneGeometry(400, HZ - IZ), new THREE.MeshLambertMaterial({ color: 0xc9d0dc }), 0, -0.03, s * (HZ + IZ) / 2, g).rotation.x = -PI / 2; // and along the shore past the map's sides
// the snowy town beyond
  // the ice: dark where it is clear, dusted with snow, cracked; it catches the lights
  const it = canvasTex(1024, 256, (c, w, h) => {
    c.fillStyle = '#3e5a72'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { const x = rnd() * w, y = rnd() * h, r = 10 + rnd() * 60, gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(220,232,245,.35)'); gr.addColorStop(1, 'rgba(220,232,245,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, r * 2, r * 2); }
    c.strokeStyle = 'rgba(230,240,250,.5)'; c.lineWidth = 1.2;
    for (let i = 0; i < 40; i++) { let x = rnd() * w, y = rnd() * h; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (rnd() - 0.5) * 60; y += (rnd() - 0.5) * 30; c.lineTo(x, y); } c.stroke(); }
  });
  it.wrapS = THREE.RepeatWrapping; it.repeat.set(3, 1);
  mk(new THREE.PlaneGeometry(400, IZ * 2), new THREE.MeshPhongMaterial({ map: it, shininess: 90, specular: 0x7f93ad }), 0, 0.01, 0, g).rotation.x = -PI / 2;
  // the snow, falling round wherever the camera is
  const NF = 1800, fp = new Float32Array(NF * 3), fall = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xffffff, size: 0.14, map: glowTex, transparent: true, depthWrite: false, opacity: 0.9 }));
  for (let i = 0; i < NF; i++) { fp[i * 3] = (rnd() - 0.5) * 60; fp[i * 3 + 1] = rnd() * 22; fp[i * 3 + 2] = (rnd() - 0.5) * 60; }
  fall.geometry.setAttribute('position', new THREE.BufferAttribute(fp, 3)); fall.frustumCulled = false; g.add(fall);
  const spin = []; // things that turn: [object, axis, speed]
  const { lam, bas, part, merge, done } = parts(g); // the many small drawn pieces, merged (common.js)


  // ---- in the middle: the island and the great tree. Under the lowest boughs there is room for shots, not for a body
  K.col(-7.5, 7.5, 0, 0.3, -3.1, 3.1); K.col(-3.1, 3.1, 0, 0.3, -7.5, 7.5); K.col(-5.3, 5.3, 0, 0.3, -5.3, 5.3);
  part(new THREE.CylinderGeometry(7.65, 7.75, 0.3, 8), lam(SNOW), 0, 0.15, 0).rotation.y = PI / 8; part(new THREE.CylinderGeometry(7.8, 7.9, 0.12, 8), lam(STONE), 0, 0.06, 0).rotation.y = PI / 8;
  K.cyl('flat', 0, 1.0, 0, 0.6, 1.4, 0, DWOOD); K.col(-0.5, 0.5, 0.3, 1.4, -0.5, 0.5);
  const tiers = [[5.0, 5.0, 1.3], [3.9, 4.4, 4.3], [2.8, 3.8, 7.3], [1.6, 3.2, 10.1]]; // radius, height, bottom
  for (const [r, h, y] of tiers) { part(new THREE.ConeGeometry(r, h, 18), lam(0x1f4e36), 0, y + h / 2, 0); part(new THREE.ConeGeometry(r * 0.55, h * 0.3, 18), lam(0xdfe6ee), 0, y + h * 0.86, 0); }
  K.col(-3.75, 3.75, 1.3, 6.3, -3.75, 3.75); K.col(-2.9, 2.9, 6.3, 8.5, -2.9, 2.9); K.col(-2.0, 2.0, 8.5, 10.6, -2.0, 2.0); K.col(-1.1, 1.1, 10.6, 12.6, -1.1, 1.1); // the boughs, one block per tier: no ledge to stand on
  { const st = mk(new THREE.OctahedronGeometry(0.6), new THREE.MeshBasicMaterial({ color: 0xffe08a }), 0, 13.9, 0, g); spin.push([st, 'y', 0.8]); const gl = glow(0xffd36b, 5); gl.position.set(0, 13.9, 0); g.add(gl); }
  const orn = [RED, GOLD, 0x3a7bd5, 0xd8dde4, 0xd04aa0];
  for (const [r, h, y] of tiers) for (let i = 0; i < r * 9; i++) { const t = 0.08 + rnd() * 0.75, a = rnd() * PI * 2, rr = r * (1 - t) + 0.05, x = Math.cos(a) * rr, z = Math.sin(a) * rr, yy = y + h * t, sz = 0.16 + rnd() * 0.12; K.box('lit', x - sz, x + sz, yy - sz, yy + sz, z - sz, z + sz, orn[i % 5], 0); }
  for (let i = 0; i < 260; i++) { const t = i / 260, yy = 1.5 + t * 11.8, a = t * PI * 2 * 7, tr = tiers.find(([r, h, y]) => yy >= y && yy <= y + h) || tiers[3], rr = tr[0] * (1 - (yy - tr[2]) / tr[1]) + 0.04; K.box('lit', Math.cos(a) * rr - 0.06, Math.cos(a) * rr + 0.06, yy - 0.06, yy + 0.06, Math.sin(a) * rr - 0.06, Math.sin(a) * rr + 0.06, 0xfff3c4, 0); } // a garland of lights wound round
  { const l = new THREE.PointLight(0xffd9a0, 1.2, 26, 1.6); l.position.set(0, 6, 0); g.add(l); }

  for (const s of [1, -1]) { // s = 1 is written out below as the north half; s = -1 is the same turned half round (x and z both change sign)
    const B = (mat, x0, x1, y0, y1, z0, z1, c, solid) => s > 0 ? K.box(mat, x0, x1, y0, y1, z0, z1, c, solid) : K.box(mat, -x1, -x0, y0, y1, -z1, -z0, c, solid);
    const C = (mat, x, y, z, r, len, axis, c) => K.cyl(mat, s * x, y, s * z, r, len, axis, c);
    const col = (x0, x1, y0, y1, z0, z1) => s > 0 ? K.col(x0, x1, y0, y1, z0, z1) : K.col(-x1, -x0, y0, y1, -z1, -z0);
    const M = (geo, mat, x, y, z, ry) => { const o = part(geo, mat, s * x, y, s * z); o.rotation.y = (ry || 0) + (s > 0 ? 0 : PI); return o; };
    const sg = (text, x, y, z, w, h, ry, bg, fg) => sign(g, text, s * x, y, s * z, w, h, ry + (s > 0 ? 0 : PI), bg, fg);
    const light = (x, y, z, color, power, reach) => { const l = new THREE.PointLight(color, power, reach, 1.6); l.position.set(s * x, y, s * z); g.add(l); };
    const glowAt = (x, y, z, color, size) => { const sp = glow(color, size); sp.position.set(s * x, y, s * z); g.add(sp); };
    const bank = (x0, x1, z0, z1, h) => { B('flat', x0, x1, 0, h - 0.25, z0, z1, SNOW); const o = M(new THREE.CylinderGeometry(1, 1, 1, 10), lam(SNOW), (x0 + x1) / 2, h - 0.25, (z0 + z1) / 2); if (x1 - x0 > z1 - z0) { o.scale.set((z1 - z0) / 2, x1 - x0, 0.25); o.rotation.z = PI / 2; } else { o.scale.set((x1 - x0) / 2, z1 - z0, 0.25); o.rotation.x = PI / 2; } }; // a snowbank, rounded on top
    const roof = (x0, x1, z0, z1, yb, rise, alongX, c) => { // a gable roof, drawn: two slabs and their snow
      const half = alongX ? (z1 - z0) / 2 : (x1 - x0) / 2, len = Math.hypot(half, rise) + 0.3, a = Math.atan2(rise, half), L = alongX ? x1 - x0 + 0.4 : z1 - z0 + 0.4;
      for (const k of [-1, 1]) for (const [t, cc, dy] of [[0.18, c, 0], [0.1, SNOW, 0.14]]) {
        const o = alongX ? M(new THREE.BoxGeometry(L, t, len), lam(cc), (x0 + x1) / 2, yb + rise / 2 + dy, (z0 + z1) / 2 + k * half / 2) : M(new THREE.BoxGeometry(len, t, L), lam(cc), (x0 + x1) / 2 + k * half / 2, yb + rise / 2 + dy, (z0 + z1) / 2);
        if (alongX) o.rotation.x = k * a; else o.rotation.z = -k * a;
      }
    };

    // ---- the quay along the ice: a granite kerb (a step), bollards, street lamps
    B('conc', -HX, HX, 0, 0.25, -IZ - 0.3, -IZ, STONE); B('flat', -HX, HX, 0.25, 0.3, -IZ - 0.3, -IZ - 0.05, SNOW, 0);
    for (const x of [-38, -18, 10, 24, 38]) { C('flat', x, 0.4, -IZ - 0.8, 0.26, 0.8, 0, 0x30353d); col(x - 0.28, x + 0.28, 0, 0.8, -IZ - 1.08, -IZ - 0.52); }
    for (const x of [-30, -8, 16, 34]) { C('flat', x, 2.1, -IZ - 1.4, 0.07, 4.2, 0, DARK); col(x - 0.1, x + 0.1, 0, 4.2, -IZ - 1.5, -IZ - 1.3); B('lit', x - 0.22, x + 0.22, 4.1, 4.6, -IZ - 1.62, -IZ - 1.18, 0xffe2a8, 0); glowAt(x, 4.35, -IZ - 1.4, 0xffd08a, 2.4); }
    bank(-24, -19, -16.8, -15.8, 1.0); bank(25, 31, -17.6, -16.6, 1.1); // (kept 2.8 m off the arches' posts, so no one jumps from a bank onto a post)
    // the boardwalk out to the island: the way across with a grip under the feet
    B('flat', -5, -2.5, 0, 0.3, -IZ - 0.3, -5.3, 0x7a5a3e); for (let z = -IZ; z < -5.3; z += 0.6) B('flat', -5, -2.5, 0.3, 0.31, z, z + 0.05, 0x5a3e2a, 0);
    for (let z = -14.4; z < -6; z += 2.8) for (const x of [-5.05, -2.45]) { B('flat', x - 0.06, x + 0.06, 0.3, 1.25, z - 0.06, z + 0.06, DWOOD); B('lit', x - 0.08, x + 0.08, 1.25, 1.4, z - 0.08, z + 0.08, z % 5.6 < 2.8 ? 0xff5050 : 0x60ff90, 0); }

    // ---- out on the ice: a boat frozen in, ice-fishing tents, a drift
    B('flat', -32, -21, 0, 1.4, -7.4, -4.4, 0xb8342e); B('flat', -32.05, -20.95, 1.0, 1.15, -7.45, -4.35, WHITE, 0); B('flat', -31.8, -21.2, 1.4, 1.46, -7.2, -4.6, SNOW, 0);
    B('flat', -25.5, -22.5, 1.4, 3.4, -7.1, -4.7, 0xe6e2d6); B('flat', -25.7, -22.3, 3.4, 3.62, -7.3, -4.5, SNOW); B('lit', -25.52, -25.5, 2.2, 2.9, -6.6, -5.2, 0xffd890, 0);
    C('flat', -29, 4.3, -5.9, 0.1, 5.8, 0, WHITE); for (let i = 0; i < 9; i++) { const t = i / 8; B('lit', -29 + t * 6.4 - 0.07, -29 + t * 6.4 + 0.07, 7.1 - t * 3.6 - 0.07, 7.1 - t * 3.6 + 0.07, -5.97, -5.83, orn[i % 3], 0); } // a string of lights off the mast
    const tentGeo = new THREE.ConeGeometry(1.25, 2.1, 4);
    for (const [x, z, c] of [[-12, -9.5, 0xd8742a], [-38, -10, 0x2f6fb2], [14, -11, 0x3f8a4a], [33, -6.5, 0xd8742a]]) { col(x - 0.85, x + 0.85, 0, 1.9, z - 0.85, z + 0.85); M(tentGeo, lam(c), x, 1.05, z, PI / 4); glowAt(x, 0.5, z + 0.9, 0xffc070, 1.2); }
    bank(12, 22, -3.6, -2.6, 1.0);

    // ---- presents heaped on the island (written as the north quarter): climb from small to large
    const gift = (x, z, y0, w, h, c, rc) => { B('flat', x - w / 2, x + w / 2, y0, y0 + h, z - w / 2, z + w / 2, c); B('flat', x - w / 2 - 0.01, x + w / 2 + 0.01, y0, y0 + h + 0.01, z - 0.07, z + 0.07, rc, 0); B('flat', x - 0.07, x + 0.07, y0, y0 + h + 0.01, z - w / 2 - 0.01, z + w / 2 + 0.01, rc, 0); };
    gift(-5.6, -2.8, 0.3, 1.4, 1.4, RED, GOLD); gift(-5.6, -2.8, 1.7, 0.8, 0.8, 0x2f6fb2, WHITE); gift(-5.9, -1.4, 0.3, 1.0, 1.0, GREEN, RED);
    gift(2.3, -5.9, 0.3, 1.2, 1.2, 0xe8e2d0, RED); gift(1.2, -6.0, 0.3, 0.9, 0.7, GOLD, GREEN);

    // ---- the chapel at the back: a door to the front (toward the ice) and two at the back corners; pews; windows to shoot through
    { const X0 = -5, X1 = 5, Z0 = -41, Z1 = -28, H = 5.2, W = (x0, x1, y0, y1, z0, z1) => B('conc', x0, x1, y0, y1, z0, z1, 0xe8e0d0);
      W(X0, -1.1, 0, H, Z1 - 0.4, Z1); W(1.1, X1, 0, H, Z1 - 0.4, Z1); W(-1.1, 1.1, 2.7, H, Z1 - 0.4, Z1); // the front
      W(X0, X1, 0, H, Z0, Z0 + 0.4); // the back
      for (const [x0, x1] of [[X0, X0 + 0.4], [X1 - 0.4, X1]]) { // the sides: a door near the back, three tall narrow windows
        W(x0, x1, 0, H, Z0 + 0.4, -39.8); W(x0, x1, 2.4, H, -39.8, -38.4); let z = -38.4;
        for (const wz of [-36, -33, -30.4]) { W(x0, x1, 0, H, z, wz - 0.25); W(x0, x1, 0, 1.4, wz - 0.25, wz + 0.25); W(x0, x1, 3.0, H, wz - 0.25, wz + 0.25); B('lit', x0 - 0.01, x1 + 0.01, 3.2, 4.6, wz - 0.3, wz + 0.3, [0xd0405a, 0x3a7bd5, 0xe8b443][(wz + 37) % 3 | 0], 0); z = wz + 0.25; }
        W(x0, x1, 0, H, z, Z1 - 0.4); }
      B('flat', X0 - 0.3, X1 + 0.3, H, H + 0.3, Z0 - 0.3, Z1 + 0.3, 0x3a4250); roof(X0 - 0.3, X1 + 0.3, Z0 - 0.3, Z1 + 0.3, H + 0.3, 3, false, 0x3a4250);
      const gab = new THREE.Shape(); gab.moveTo(-5, 0); gab.lineTo(5, 0); gab.lineTo(0, 3.1); gab.lineTo(-5, 0);
      for (const z of [Z1 + 0.01, Z0 - 0.01]) M(new THREE.ShapeGeometry(gab), lam(0xe8e0d0), 0, H + 0.3, z);
      B('lit', -0.8, 0.8, 5.9, 7.1, Z1 + 0.02, Z1 + 0.04, 0xe8a64a, 0); // a round window over the door, lit
      B('conc', -1.4, 1.4, H + 0.3, 10, Z1 - 1.6, Z1 + 0.2, 0xe8e0d0); M(new THREE.ConeGeometry(2.1, 4.5, 4), lam(0x3a4250), 0, 12.25, Z1 - 0.7, PI / 4); B('lit', -0.5, 0.5, 8, 9.2, Z1 + 0.21, Z1 + 0.23, 0xffe0a0, 0); // the bell tower, out of reach
      for (let z = -38; z <= -31; z += 1.4) for (const [x0, x1] of [[-4.3, -0.9], [0.9, 4.3]]) { B('flat', x0, x1, 0, 0.5, z - 0.25, z + 0.25, WOOD); B('flat', x0, x1, 0.5, 0.95, z - 0.3, z - 0.22, WOOD, 0); }
      B('flat', -1.5, 1.5, 0, 1.0, -40.4, -39.6, 0xd8d0c0); for (const x of [-1.1, -0.5, 0.5, 1.1]) B('lit', x - 0.04, x + 0.04, 1.0, 1.3, -40.04, -39.96, 0xffe6a8, 0);
      B('flat', -0.6, 0.6, 0, 0.02, -39.4, Z1 - 0.4, 0x8a1e26, 0); // the carpet up the aisle
      light(0, 4.2, -35, 0xffd9a0, 0.8, 14);
      M(new THREE.TorusGeometry(0.55, 0.12, 8, 20), lam(GREEN), 0, 3.4, Z1 + 0.15); B('flat', -0.12, 0.12, 2.9, 3.1, Z1 + 0.1, Z1 + 0.2, RED, 0); } // a wreath on the door

    // ---- the plaza in front: Santa's sleigh and reindeer (shots pass under their bellies)
    B('flat', 2, 5.2, 0, 1.3, -23.4, -21.4, RED); B('flat', 1.9, 5.3, 1.3, 1.4, -23.5, -21.3, GOLD, 0); B('flat', 4.6, 5.2, 1.3, 2.2, -23.4, -21.4, RED, 0); for (const z of [-23.5, -21.3]) B('flat', 1.6, 5.8, 0, 0.12, z - 0.06, z + 0.06, GOLD, 0);
    { const sack = M(new THREE.SphereGeometry(0.75, 12, 8), lam(0x8a6a46), 3.0, 1.85, -22.4); sack.scale.y = 0.8; }
    for (const z of [-23.1, -21.7]) { const x = 7.6; B('flat', x - 0.9, x + 0.9, 0.95, 1.7, z - 0.3, z + 0.3, 0x8a5a36); B('flat', x + 0.7, x + 1.25, 1.5, 2.15, z - 0.2, z + 0.2, 0x8a5a36, 0); B('lit', x + 1.25, x + 1.32, 1.82, 1.9, z - 0.04, z + 0.04, z < -22 ? 0xff3030 : 0x2a1a10, 0);
      for (const lx of [x - 0.7, x + 0.6]) for (const lz of [z - 0.2, z + 0.2]) B('flat', lx - 0.05, lx + 0.05, 0, 0.95, lz - 0.05, lz + 0.05, 0x5a3a22, 0);
      for (const dz of [-0.15, 0.15]) B('flat', x + 0.85, x + 0.9, 2.15, 2.7, z + dz - 0.03, z + dz + 0.03, 0x6a4a2a, 0); }

    // ---- the market: two rows of stalls with an aisle between, their counters facing it. Vault a counter to get in; from a counter, up onto the roofs
    B('flat', 7, 7.3, 0, 3.6, -26.6, -26.3, DWOOD); B('flat', 7, 7.3, 0, 3.6, -19.7, -19.4, DWOOD); B('flat', 7, 7.3, 3.6, 4.4, -26.6, -19.4, 0x8a1e26); sg('クリスマス市', 6.98, 4.0, -23, 5.6, 0.7, -PI / 2, '#8a1e26', '#f6e7c0');
    const names = ['ホットワイン', 'おでん', 'たい焼き', '甘酒', 'ケーキ', 'オーナメント', 'やきいも', 'ホットワイン', 'おでん', 'ケーキ'], tops = [RED, GREEN, 0x2f5f8f, RED, GREEN];
    for (let row = 0; row < 2; row++) for (let i = 0; i < 5; i++) {
      const x0 = 9 + i * 4.4, x1 = x0 + 3.4, back = row ? -17.8 : -28.2, front = row ? -20.2 : -25.8, d = row ? -1 : 1, zb0 = Math.min(back, front), zb1 = Math.max(back, front), c = tops[(i + row * 2) % 5];
      const bw0 = d > 0 ? back : back - 0.12, cz0 = d > 0 ? front - 0.5 : front; // the back wall's and the counter's north faces
      B('flat', x0, x1 - 1.3, 0, 2.6, bw0, bw0 + 0.12, WOOD); B('flat', x1 - 1.3, x1 - 0.2, 2.0, 2.6, bw0, bw0 + 0.12, WOOD); B('flat', x1 - 0.2, x1, 0, 2.6, bw0, bw0 + 0.12, WOOD); // the back, with a door for the stall-keeper
      for (const x of [x0, x1 - 0.12]) B('flat', x, x + 0.12, 0, 2.6, zb0, zb1, WOOD);
      B('flat', x0 + 0.12, x1 - 0.12, 0, 1.0, cz0, cz0 + 0.5, DWOOD); // the counter: from inside, shoot over it into the aisle
      B('flat', x0 - 0.2, x1 + 0.2, 2.6, 2.75, zb0 - 0.2 - (d < 0 ? 0.6 : 0), zb1 + 0.2 + (d > 0 ? 0.6 : 0), c); // the roof you can stand on, over the counter too
      roof(x0 - 0.2, x1 + 0.2, zb0 - 0.2 - (d < 0 ? 0.6 : 0), zb1 + 0.2 + (d > 0 ? 0.6 : 0), 2.6, 0.3, true, c);
      for (let k = 0; k < 5; k++) { const gx = x0 + 0.5 + k * 0.6, gz = front - 0.25 * d; B('lit', gx - 0.18, gx + 0.18, 1.0, 1.22 + (k % 2) * 0.1, gz - 0.15, gz + 0.15, orn[(k + i) % 5], 0); }
      for (let k = 0; k <= 8; k++) { const gx = x0 - 0.1 + k * 0.45; B('lit', gx - 0.05, gx + 0.05, 2.5, 2.6, front + 0.55 * d - 0.05, front + 0.55 * d + 0.05, k % 2 ? 0xfff0b0 : 0xff6a50, 0); }
      sg(names[row * 5 + i], (x0 + x1) / 2, 2.25, front + 0.02 * d, 2.6, 0.45, row ? PI : 0, '#f6efe0', '#3a1a10');
    }
    B('wood', 30.4, 31.8, 0, 1.3, -27.7, -26.3); B('wood', 7.4, 8.8, 0, 1.3, -19.2, -17.8); // a crate at one end of each row: the way up onto the roofs
    light(19.5, 3.6, -23, 0xffcf90, 0.8, 18);

    // ---- the carousel: the horses turn (and are not in the way of shots or feet); the floor is a step, the middle post and the roof are solid
    { const cx = 35.5, cz = -35.5; col(cx - 4.4, cx + 4.4, 0, 0.3, cz - 1.8, cz + 1.8); col(cx - 1.8, cx + 1.8, 0, 0.3, cz - 4.4, cz + 4.4); col(cx - 3.1, cx + 3.1, 0, 0.3, cz - 3.1, cz + 3.1);
      col(cx - 0.7, cx + 0.7, 0.3, 4.0, cz - 0.7, cz + 0.7); col(cx - 3.3, cx + 3.3, 4.0, 4.3, cz - 3.3, cz + 3.3);
      M(new THREE.CylinderGeometry(4.5, 4.6, 0.3, 24), lam(0xd8c8a8), cx, 0.15, cz); M(new THREE.CylinderGeometry(0.7, 0.7, 3.7, 12), lam(GOLD), cx, 2.15, cz);
      M(new THREE.ConeGeometry(4.9, 1.8, 24), lam(RED), cx, 4.9, cz); M(new THREE.CylinderGeometry(4.9, 4.9, 0.35, 24), lam(GOLD), cx, 4.0, cz);
      const rot = new THREE.Group(); rot.position.set(s * cx, 0, s * cz); g.add(rot); spin.push([rot, 'y', 0.5 * s]);
      const pole = new THREE.CylinderGeometry(0.04, 0.04, 3.7, 6), horse = new THREE.BoxGeometry(0.35, 0.6, 1.3), head = new THREE.BoxGeometry(0.3, 0.6, 0.35), bulb = new THREE.BoxGeometry(0.14, 0.14, 0.14), on = { lam: [], bas: [] };
      for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2, x = Math.cos(a) * 3.2, z = Math.sin(a) * 3.2, hy = 1.3 + (i % 2) * 0.4, hm = lam([WHITE, 0x8a5a36, 0xd8b04a, 0x2a2a30][i % 4]);
        part(pole, lam(GOLD), x, 2.15, z, on); part(horse, hm, x, hy, z, on).rotation.y = -a; part(head, hm, x + Math.cos(a + PI / 2) * 0.6, hy + 0.35, z + Math.sin(a + PI / 2) * 0.6, on).rotation.y = -a; }
      for (let i = 0; i < 24; i++) { const a = i / 24 * PI * 2; part(bulb, bas(i % 2 ? 0xfff0b0 : 0xff6a50), Math.cos(a) * 4.95, 3.85, Math.sin(a) * 4.95, on); }
      merge(on.lam, new THREE.MeshLambertMaterial({ vertexColors: true }), rot); merge(on.bas, new THREE.MeshBasicMaterial({ vertexColors: true }), rot); }

    // ---- the tunnel of light: arches every 2.6 m, thin posts you can walk out between
    { const arch = new THREE.TorusGeometry(1.9, 0.07, 6, 20, PI), mats = [0xffe08a, 0xff6a6a, 0x7affa0, 0x9ad0ff].map(bas);
      for (let i = 0; i <= 10; i++) { const x = -36 + i * 2.6; for (const z of [-23.4, -19.6]) B('flat', x - 0.07, x + 0.07, 0, 2.4, z - 0.07, z + 0.07, GOLD); M(arch, mats[i % 4], x, 2.4, -21.5, PI / 2); }
      for (let i = 0; i < 3; i++) glowAt(-33 + i * 10, 3.8, -21.5, 0xffe0a0, 3); }

    // ---- snow huts: thick walls and a roof of snow, a door 1.1 m wide; inside, room for one or two and a candle
    const kama = (x, z, dx, dz) => {
      const O = 1.7, T = 0.35, D = 0.55, walls = [[-O, O, -O, -O + T, 0, -1], [-O, O, O - T, O, 0, 1], [-O, -O + T, -O + T, O - T, -1, 0], [O - T, O, -O + T, O - T, 1, 0]];
      for (const [a0, a1, b0, b1, wx, wz] of walls) {
        if (wx === dx && wz === dz) { if (wx) { col(x + a0, x + a1, 0, 1.95, z + b0, z - D); col(x + a0, x + a1, 0, 1.95, z + D, z + b1); } else { col(x + a0, x - D, 0, 1.95, z + b0, z + b1); col(x + D, x + a1, 0, 1.95, z + b0, z + b1); } }
        else col(x + a0, x + a1, 0, 1.95, z + b0, z + b1);
      }
      col(x - O, x + O, 1.95, 2.4, z - O, z + O);
      const gap = 0.52, ph = Math.atan2(dz, -dx), dome = M(new THREE.SphereGeometry(2.25, 20, 8, ph + gap / 2, PI * 2 - gap, 0, PI / 2), lam(SNOW), x, 0, z); dome.scale.y = 1.07;
      B('lit', x - 0.06, x + 0.06, 0.4, 0.62, z - 0.06, z + 0.06, 0xffd890, 0); B('flat', x - 0.3, x + 0.3, 0, 0.4, z - 0.3, z + 0.3, 0x6a4a32, 0); glowAt(x, 0.7, z, 0xffb060, 2.2); glowAt(x + dx * 2.0, 0.9, z + dz * 2.0, 0xffb060, 1.6);
    };
    kama(-34, -31, 0, 1); kama(-25, -35.5, 1, 0); kama(-15.5, -29.5, 0, 1);
    const snowman = (x, z) => { col(x - 0.6, x + 0.6, 0, 1.9, z - 0.6, z + 0.6); for (const [r, y] of [[0.65, 0.6], [0.48, 1.4], [0.34, 1.98]]) M(new THREE.SphereGeometry(r, 14, 10), lam(SNOW), x, y, z);
      M(new THREE.CylinderGeometry(0.24, 0.24, 0.35, 12), lam(BLK), x, 2.42, z); M(new THREE.TorusGeometry(0.4, 0.09, 6, 16), lam(RED), x, 1.72, z).rotation.x = PI / 2; const n = M(new THREE.ConeGeometry(0.06, 0.3, 6), lam(0xe8782a), x, 2.0, z + 0.4); n.rotation.x = PI / 2; };
    snowman(-39, -27); snowman(-9.5, -33.5); snowman(37, -21);

    // ---- the back of the town: spawn ground, banks of snow to stand behind, the houses past the map's end
    // snow walls, 2.2 m: too high to see a head over, or to climb even from the carousel's floor. One in front of each spawn point, so no line from the ice or the far side reaches it
    const wall = (x0, x1, z0, z1) => { B('flat', x0, x1, 0, 2.2, z0, z1, 0xe4eaf2); B('flat', x0 - 0.05, x1 + 0.05, 2.2, 2.32, z0 - 0.05, z1 + 0.05, SNOW, 0); for (let x = x0 + 0.6; x < x1; x += 1.3) B('flat', x, x + 0.04, 0.2, 2.1, z1 + 0.005, z1 + 0.02, 0xc8d2e0, 0); };
    wall(-38, -31, -38.2, -37.2); wall(-16, -8, -37.6, -36.6); wall(8, 16, -37.6, -36.6); wall(21, 29.5, -37.6, -36.6);
    for (let x = -50, i = 0; x < 50; i++) { const w = 6 + (i * 37 % 4), h = 5 + (i * 53 % 5), z0 = -HZ - 0.4 - 7, z1 = -HZ - 0.4, c = [0x8a6a5a, 0x6a7a8a, 0x9a8a6a, 0x7a5a5a, 0x5a6a5a][i % 5];
      B('conc', x, x + w - 0.2, 0, h, z0, z1, c); roof(x - 0.1, x + w - 0.1, z0, z1 + 0.4, h, 2.2, true, 0x3a4250);
      for (let wx = x + 1; wx < x + w - 1.5; wx += 1.8) for (let wy = 1.5; wy < h - 1; wy += 2.2) B('lit', wx, wx + 0.9, wy, wy + 1.1, z1 + 0.01, z1 + 0.03, (wx * 7 + wy * 3 | 0) % 3 ? 0xffd080 : 0x30384a, 0);
      x += w; }
    for (const z of [-IZ + 0.5, -4, 4, IZ - 0.5]) B('flat', HX + 0.4, HX + 1.6, 0, 1.2, z - 0.5, z + 0.5, 0xc8d6e4); // ice heaved up where the harbour meets the sea
    bank(HX + 0.3, HX + 2, -HZ, -IZ - 0.3, 1.6); bank(-HX - 2, -HX - 0.3, -HZ, -IZ - 0.3, 1.6);
  }
  // far off: a big wheel turning over the town, a lighthouse out on the frozen sea
  { const wheel = new THREE.Group(); wheel.position.set(48, 26, -72); g.add(wheel); spin.push([wheel, 'z', 0.06]);
    const on = { lam: [], bas: [] }, WM = 0x4a5670; part(new THREE.TorusGeometry(18, 0.35, 6, 48), bas(WM), 0, 0, 0, on);
    for (let i = 0; i < 16; i++) { const a = i / 16 * PI * 2; part(new THREE.BoxGeometry(0.2, 18, 0.2), bas(WM), Math.cos(a) * 9, Math.sin(a) * 9, 0, on).rotation.z = a - PI / 2;
      part(new THREE.BoxGeometry(0.5, 0.5, 0.5), bas([0xff6a6a, 0xffe08a, 0x7affa0, 0x9ad0ff][i % 4]), Math.cos(a) * 18, Math.sin(a) * 18, 0, on); }
    merge(on.bas, new THREE.MeshBasicMaterial({ vertexColors: true }), wheel);
    for (const x of [-6, 6]) part(new THREE.BoxGeometry(0.8, 28, 0.8), bas(WM), 48 + x * 0.5, 13, -72).rotation.z = x > 0 ? 0.22 : -0.22;
    mk(new THREE.CylinderGeometry(1.2, 1.8, 14, 12), new THREE.MeshLambertMaterial({ color: 0xe8e4dc }), -120, 7, 10, g); const lh = glow(0xfff0c0, 9); lh.position.set(-120, 14.5, 10); g.add(lh); beacons.push(lh); }
  done();
  K.done();
  m.g = g; m.boxes = K.bx; m.hard = K.bx.filter(b => !b.soft); m.lx = HX - 0.5; m.lz = HZ - 0.5; m.dx = HX - 1; m.dz = HZ - 1;
  m.ice = (x, z) => Math.abs(z) < IZ; // the frozen harbour: underfoot at ground level (the island and the boardwalks stand 0.3 m up)
  m.tick = (dt, t) => {
    for (const [o, ax, v] of spin) o.rotation[ax] += v * dt;
    const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z, wrap = (v, c, h) => v - c > h ? v - 2 * h : v - c < -h ? v + 2 * h : v;
    for (let i = 0; i < NF; i++) { const k = i * 3; fp[k + 1] -= dt * (0.9 + (i % 7) * 0.08); fp[k] += Math.sin(t * 0.7 + i) * dt * 0.25;
      if (fp[k + 1] < 0) fp[k + 1] += 22; fp[k] = wrap(fp[k], cx, 30); fp[k + 2] = wrap(fp[k + 2], cz, 30); if (fp[k + 1] > cy + 16) fp[k + 1] -= 22; }
    fall.geometry.attributes.position.needsUpdate = true;
  };
}

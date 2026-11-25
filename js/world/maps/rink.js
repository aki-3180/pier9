// Map 8: スケート場 (the skating rinks by the harbour, on a clear winter's day).
'use strict';
// map 8: made for versus. 124 × 60 m, long east to west and mirrored east to west: one team starts in the west, the other in the east.
// Three houses of three floors you can go all through: one at each end (each team's own), and one in the middle to fight over.
// Each house: doors on the ground floor, windows on every floor (you shoot through them, you cannot climb through), a stair that turns back
// on itself up to the top floor, furniture to hide behind. The roofs are out of reach. The middle house has a stair in each half, one for each side.
// Between the houses, a rink each side: ice inside the boards (MAP.ice: the feet slide), gates in the boards, a resurfacer and goals on the ice.
// Round them: stands you can walk up (north), the skate-hire hut and benches (south), snowy pines.
function buildRink(m) {
  seed = 307;
  const K = kit(), g = K.g, PI = Math.PI, HX = 62, HZ = 30;
  const { lam, bas, part, done } = parts(g);
  const SNOW = 0xf1f4f8, WOOD = 0x6b4a32, DWOOD = 0x4a3222, RED = 0xb3262e, GREEN = 0x245a3a, GOLD = 0xe8b443, WHITE = 0xf2f2ee, DARK = 0x1c222b, BLK = 0x0d1015, ROOF = 0x3a4250, BLUE = 0x2c5c9c;
  const F = [0, 3.3, 6.6], TOP = 9.9, NST = 13, RISE = 3.3 / NST, RUN = 0.34, FL = NST * RUN; // three floors 3.3 m apart; a flight of 13 steps, 4.42 m long
  const RX0 = 14, RX1 = 40, RZ = 12, CH = 3; // a rink: |x| from 14 to 40, |z| under 12, corners cut 3 m
  const gt = canvasTex(2048, 1024, (c, w, h) => {
    c.fillStyle = '#c4ccd6'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 40000; i++) { const v = 180 + rnd() * 50 | 0; c.fillStyle = `rgba(${v - 6},${v - 3},${v},.35)`; c.fillRect(rnd() * w, rnd() * h, 3, 3); }
    const sx = w / (HX * 2), sz = h / (HZ * 2); c.setTransform(sx, 0, 0, sz, HX * sx, HZ * sz);
    const R = (x0, x1, z0, z1, f) => { c.fillStyle = f; c.fillRect(x0, z0, x1 - x0, z1 - z0); };
    for (const s of [1, -1]) { const P = (x0, x1, z0, z1) => R(s > 0 ? x0 : -x1, s > 0 ? x1 : -x0, z0, z1, 'rgba(150,140,130,.35)'); // swept and gritted paths
      P(-62, -7, -1.6, 1.6); P(-44, -9, -13.6, -12.4); P(-44, -9, 12.4, 13.6); P(-46, -44, -14, 14); P(-11, -9, -14, 14); P(-58, -50, -12, -10); P(-58, -50, 10, 12); }
  });
  gt.anisotropy = renderer.capabilities.getMaxAnisotropy();
  mk(new THREE.PlaneGeometry(HX * 2, HZ * 2), new THREE.MeshLambertMaterial({ map: gt }), 0, 0, 0, g).rotation.x = -PI / 2;
  mk(new THREE.PlaneGeometry(500, 200), new THREE.MeshLambertMaterial({ color: 0xd9e0e8 }), 0, -0.02, HZ + 100, g).rotation.x = -PI / 2; // the town side, south
  mk(new THREE.PlaneGeometry(500, 6), new THREE.MeshLambertMaterial({ color: 0xd9e0e8 }), 0, -0.02, -HZ - 3, g).rotation.x = -PI / 2;
  for (const s of [1, -1]) mk(new THREE.PlaneGeometry(200, HZ * 2 + 12), new THREE.MeshLambertMaterial({ color: 0xd9e0e8 }), s * (HX + 100), -0.02, 0, g).rotation.x = -PI / 2;
  mk(new THREE.PlaneGeometry(800, 400), new THREE.MeshLambertMaterial({ color: 0x3f6a88 }), 0, -1.2, -HZ - 206, g).rotation.x = -PI / 2; // the harbour, north
  K.box('conc', -250, 250, -1.2, 0, -HZ - 6.6, -HZ - 6, 0x9a978f, 0);
  cranes(g, [[-60, -110], [30, -120], [90, -100, PI / 2]], new THREE.MeshBasicMaterial({ color: 0x8a96a6, fog: false }));
  // the ice of a rink, painted for hockey, scored by skates
  const iceTex = canvasTex(1024, 1024, (c, w, h) => {
    c.fillStyle = '#a9cbe4'; c.fillRect(0, 0, w, h); c.setTransform(w / 26, 0, 0, h / 24, w / 2, h / 2); c.lineWidth = 0.08;
    c.fillStyle = 'rgba(200,40,50,.8)'; c.fillRect(-0.15, -12, 0.3, 24); c.fillStyle = 'rgba(40,90,180,.75)'; for (const x of [-4.5, 4.5]) c.fillRect(x - 0.15, -12, 0.3, 24);
    c.strokeStyle = 'rgba(40,90,180,.75)'; c.beginPath(); c.arc(0, 0, 3, 0, 7); c.stroke(); c.strokeStyle = 'rgba(200,40,50,.7)'; for (const x of [-8.5, 8.5]) for (const z of [-5, 5]) { c.beginPath(); c.arc(x, z, 2.2, 0, 7); c.stroke(); }
    for (const x of [-11.2, 11.2]) { c.fillStyle = 'rgba(200,40,50,.7)'; c.fillRect(x - 0.05, -9, 0.1, 18); }
    c.strokeStyle = 'rgba(120,150,170,.35)'; c.lineWidth = 0.03; for (let i = 0; i < 160; i++) { const x = (rnd() - 0.5) * 24, z = (rnd() - 0.5) * 22, r = 1 + rnd() * 6, a = rnd() * 7; c.beginPath(); c.arc(x, z, r, a, a + 0.5 + rnd()); c.stroke(); }
  });
  iceTex.repeat.set(1 / 26, 1 / 24); iceTex.offset.set(0.5, 0.5);
  const rinkShape = new THREE.Shape(), hx = (RX1 - RX0) / 2;
  [[-hx + CH, -RZ], [hx - CH, -RZ], [hx, -RZ + CH], [hx, RZ - CH], [hx - CH, RZ], [-hx + CH, RZ], [-hx, RZ - CH], [-hx, -RZ + CH]].forEach(([x, z], i) => i ? rinkShape.lineTo(x, z) : rinkShape.moveTo(x, z));
  const iceMat = new THREE.MeshPhongMaterial({ map: iceTex, shininess: 80, specular: 0x9fb4c8 });
  for (const s of [1, -1]) { const ic = mk(new THREE.ShapeGeometry(rinkShape), iceMat, s * (RX0 + RX1) / 2, 0.01, 0, g); ic.rotation.x = -PI / 2; } // (the shape is drawn in x and y, then laid flat facing up)

  for (const s of [1, -1]) { // s = 1 is written out below as the west half; s = -1 is its mirror image, the east half
    const B = (mat, x0, x1, y0, y1, z0, z1, c, solid) => s > 0 ? K.box(mat, x0, x1, y0, y1, z0, z1, c, solid) : K.box(mat, -x1, -x0, y0, y1, z0, z1, c, solid);
    const C = (mat, x, y, z, r, len, axis, c) => K.cyl(mat, s * x, y, z, r, len, axis, c);
    const col = (x0, x1, y0, y1, z0, z1, soft) => s > 0 ? K.col(x0, x1, y0, y1, z0, z1, soft) : K.col(-x1, -x0, y0, y1, z0, z1, soft);
    const M = (geo, mat, x, y, z, ry) => { const o = part(geo, mat, x, y, z, null, s < 0); o.rotation.y = ry || 0; return o; };
    const sg = (text, x, y, z, w, h, ry, bg, fg) => sign(g, text, s * x, y, z, w, h, s > 0 ? ry : -ry, bg, fg);
    // a wall with openings: along x (alongX) or z from a0 to a1, t0..t1 thick, y0..y1 high; holes [a, b, lo, hi] are doors and windows, framed in white
    const wall = (alongX, t0, t1, a0, a1, y0, y1, holes, c) => {
      const put = (p0, p1, q0, q1, cc, solid, dt) => { if (p1 - p0 < 0.001 || q1 - q0 < 0.001) return; if (alongX) B('flat', p0, p1, q0, q1, t0 - (dt || 0), t1 + (dt || 0), cc, solid); else B('flat', t0 - (dt || 0), t1 + (dt || 0), q0, q1, p0, p1, cc, solid); };
      let cur = a0;
      for (const [a, b, lo, hi] of holes.slice().sort((u, v) => u[0] - v[0])) { put(cur, a, y0, y1, c); put(a, b, y0, lo, c); put(a, b, hi, y1, c); put(a - 0.08, a, lo, hi, WHITE, 0, 0.04); put(b, b + 0.08, lo, hi, WHITE, 0, 0.04); put(a - 0.08, b + 0.08, hi, hi + 0.08, WHITE, 0, 0.04); if (lo > y0 + 0.1) put(a - 0.12, b + 0.12, lo - 0.08, lo, WHITE, 0, 0.1); cur = b; }
      put(cur, a1, y0, y1, c);
    };
    const slab = (x0, x1, z0, z1, top, hole, c) => { // a floor, with a hole for the stair: [x0, x1, z0, z1]
      const S = (a, b, p, q) => { if (b - a > 0.001 && q - p > 0.001) B('flat', a, b, top - 0.2, top, p, q, c); };
      if (!hole) return S(x0, x1, z0, z1); const [hx0, hx1, hz0, hz1] = hole;
      S(x0, x1, z0, hz0); S(x0, x1, hz1, z1); S(x0, hx0, hz0, hz1); S(hx1, x1, hz0, hz1);
    };
    // a flight of 13 steps up 3.3 m, from base, rising along +x/-x (ax 'x') or +z/-z, in the lane x0..x1, z0..z1 (4.42 m long the way it rises)
    const flight = (ax, dir, x0, x1, z0, z1, base) => { for (let i = 1; i <= NST; i++) { const c = i % 2 ? 0x8a7a6a : 0x9a8a7a, h = base + i * RISE;
      if (ax === 'x') { const a = dir > 0 ? x0 + (i - 1) * RUN : x1 - i * RUN; B('flat', a, a + RUN, base, h, z0, z1, c); } else { const a = dir > 0 ? z0 + (i - 1) * RUN : z1 - i * RUN; B('flat', x0, x1, base, h, a, a + RUN, c); } } };
    const roof = (x0, x1, z0, z1, yb, rise, alongX, c) => { // a gable roof, drawn: two slabs and their snow
      const half = alongX ? (z1 - z0) / 2 : (x1 - x0) / 2, len = Math.hypot(half, rise) + 0.3, a = Math.atan2(rise, half), L = alongX ? x1 - x0 + 0.4 : z1 - z0 + 0.4;
      for (const k of [-1, 1]) for (const [t, cc, dy] of [[0.2, c, 0], [0.1, SNOW, 0.15]]) {
        const o = alongX ? M(new THREE.BoxGeometry(L, t, len), lam(cc), (x0 + x1) / 2, yb + rise / 2 + dy, (z0 + z1) / 2 + k * half / 2) : M(new THREE.BoxGeometry(len, t, L), lam(cc), (x0 + x1) / 2 + k * half / 2, yb + rise / 2 + dy, (z0 + z1) / 2);
        if (alongX) o.rotation.x = k * a; else o.rotation.z = -k * a;
      }
      const tri = new THREE.Shape(); if (alongX) { tri.moveTo(z0 - (z0 + z1) / 2, 0); tri.lineTo(z1 - (z0 + z1) / 2, 0); tri.lineTo(0, rise); } else { tri.moveTo(x0 - (x0 + x1) / 2, 0); tri.lineTo(x1 - (x0 + x1) / 2, 0); tri.lineTo(0, rise); }
      if (alongX) for (const x of [x0 + 0.3, x1 - 0.3]) M(new THREE.ShapeGeometry(tri), lam(c === ROOF ? 0xd8d0c0 : c), x, yb, (z0 + z1) / 2, PI / 2);
      else for (const z of [z0 + 0.3, z1 - 0.3]) M(new THREE.ShapeGeometry(tri), lam(0xd8d0c0), (x0 + x1) / 2, yb, z);
    };
    const pine = (x, z, h) => { col(x - 0.3, x + 0.3, 0, 1.0, z - 0.3, z + 0.3); col(x - 1.1, x + 1.1, 0.9, h * 0.75, z - 1.1, z + 1.1); M(new THREE.CylinderGeometry(0.22, 0.3, 1.2, 8), lam(DWOOD), x, 0.6, z);
      for (const [r, y0, y1] of [[1.9, 0.9, h * 0.55], [1.4, h * 0.4, h * 0.8], [0.9, h * 0.68, h]]) { M(new THREE.ConeGeometry(r, y1 - y0, 10), lam(GREEN), x, (y0 + y1) / 2, z); M(new THREE.ConeGeometry(r * 0.6, (y1 - y0) * 0.3, 10), lam(SNOW), x, y1 - (y1 - y0) * 0.12, z); } };
    const rail = (x0, x1, z0, z1, y) => { // a hand rail: drawn as bars and posts; stops feet, not bullets
      B('flat', x0, x1, y + 1.0, y + 1.06, z0, z1, GOLD, 0); B('flat', x0, x1, y + 0.5, y + 0.55, z0, z1, GOLD, 0); col(x0, x1, y, y + 1.06, z0, z1, true);
      const L = Math.max(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 1.5)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; B('flat', x - 0.03, x + 0.03, y, y + 1.06, z - 0.03, z + 0.03, GOLD, 0); } };
    // a flat roof to walk on (top at TOP + 0.2), the stair coming up through a hole in it; a parapet waist high along the edges given (n, s, w, e)
    const rooftop = (x0, x1, z0, z1, hole, edges) => { slab(x0, x1, z0, z1, TOP + 0.2, hole, 0xdfe4ea); const y = TOP + 0.2, P = (a, b, c, d) => B('flat', a, b, y, y + 1.0, c, d, 0xb8c0ca);
      if (edges.includes('n')) P(x0, x1, z0, z0 + 0.3); if (edges.includes('s')) P(x0, x1, z1 - 0.3, z1); if (edges.includes('w')) P(x0, x0 + 0.3, z0 + 0.3, z1 - 0.3); if (edges.includes('e')) P(x1 - 0.3, x1, z0 + 0.3, z1 - 0.3); };
    const snowWall = (x0, x1, z0, z1) => { B('flat', x0, x1, 0, 3.0, z0, z1, 0xe4eaf2); B('flat', x0 - 0.05, x1 + 0.05, 3.0, 3.12, z0 - 0.05, z1 + 0.05, SNOW, 0); }; // 3 m: high enough that even from the middle house's top floor no line drops over it onto the spawn points
    const lamp = (x, z) => { C('flat', x, 2.4, z, 0.07, 4.8, 0, DARK); B('lit', x - 0.2, x + 0.2, 4.7, 5.1, z - 0.2, z + 0.2, 0xfff2d0, 0); };

    // ---- the end house (west): 10 × 12 m, front to the east. Ground floor: a door front, back and south; a kitchen. First floor: a bedroom. Top: a study.
    // The stair runs along the north wall: 13 steps east up to the first floor, then 13 back west up to the top, each through a hole in the floor above
    { const X0 = -59, X1 = -49, Z0 = -6, Z1 = 6, T = 0.3, ix0 = X0 + T, ix1 = X1 - T, iz0 = Z0 + T, iz1 = Z1 - T, Ca = 0xa8403a, Ci = 0xe6dccb, sx = -57.5, ex = sx + FL;
      for (let k = 0; k < 3; k++) { const y = F[k], y1 = k < 2 ? F[k + 1] : TOP, w = (a, b) => [a, b, y + 1.0, y + 2.0];
        wall(false, X1 - T, X1, Z0, Z1, y, y1, k ? [w(-4.6, -3.2), w(-0.7, 0.7), w(3.2, 4.6)] : [[-0.6, 0.6, 0, 2.2], w(-4.6, -3.2), w(3.2, 4.6)], Ca); // front
        wall(false, X0, X0 + T, Z0, Z1, y, y1, k ? [w(-0.7, 0.7), w(3, 4.4)] : [[-0.6, 0.6, 0, 2.2]], Ca); // back: no window low down, or one would line up with the front windows and the middle house's, and see into the spawn points behind
        wall(true, Z0, Z0 + T, X0 + T, X1 - T, y, y1, k ? [w(-57, -55.6), w(-52.4, -51)] : [w(-52.4, -51)], Ca); // north (the stair inside)
        wall(true, Z1 - T, Z1, X0 + T, X1 - T, y, y1, k ? [w(-57.6, -56.2), w(-54.9, -53.5), w(-52, -50.6)] : [[-55, -53.8, 0, 2.2], w(-57.6, -56.2), w(-52, -50.6)], Ca); } // south
      flight('x', 1, sx, ex, iz0, iz0 + 1.2, 0); flight('x', -1, sx, ex, iz0 + 1.2, iz0 + 2.4, F[1]); flight('x', 1, sx, ex, iz0, iz0 + 1.2, F[2]); // the third flight, over the first, comes out on the roof
      slab(ix0, ix1, iz0, iz1, F[1], [sx, ex, iz0, iz0 + 1.2], Ci); slab(ix0, ix1, iz0, iz1, F[2], [sx, ex, iz0 + 1.2, iz0 + 2.4], Ci);
      rooftop(X0 - 0.3, X1 + 0.3, Z0 - 0.3, Z1 + 0.3, [sx, ex, iz0, iz0 + 1.2], 'nswe'); rail(sx, ex, iz0 + 1.17, iz0 + 1.23, TOP + 0.2); rail(sx - 0.03, sx + 0.03, iz0, iz0 + 1.2, TOP + 0.2);
      B('flat', -55, -54, TOP + 0.2, 13.2, 1.5, 2.5, 0x8a5a4a); // the chimney: cover on the roof, too tall to climb even from the parapet
      for (let k = 0; k < 3; k++) wall(false, -54.5, -54.3, iz0 + 2.4, iz1, F[k], F[k] + 3.1, [[1.4, 2.6, F[k], F[k] + 2.2]], 0xe6dccb); // a partition on each floor (the stair end stays open): its doorway is off the line of the front and back doors
      B('flat', -57.6, -55.2, 0, 0.95, 5.1, iz1, 0xd8d4cc); B('flat', ix0, -58, 0, 1.9, 4.6, iz1, 0xe8e8e8); B('flat', -52.6, -51, 0, 0.75, 1.8, 3.4, WOOD); // counter, fridge, table
      B('flat', -52.6, -50.4, F[1], F[1] + 0.55, 3, iz1, 0xc8c0e0); B('flat', -52.6, -50.4, F[1], F[1] + 1.1, iz1 - 0.15, iz1, WOOD); B('flat', ix0, ix0 + 0.6, F[1], F[1] + 2.1, 0.8, 2.8, WOOD); // bed, wardrobe
      B('flat', ix0, ix0 + 0.4, F[2], F[2] + 2.2, 0.5, 3, WOOD); B('flat', -53.5, -51.5, F[2], F[2] + 0.8, 2.8, 3.6, 0x4a6a8a); B('flat', -51.2, -49.9, F[2], F[2] + 0.78, -2.2, -0.6, WOOD); // shelves, sofa, desk
      sg('ロッジ', X1 + 0.02, 2.75, 0, 1.8, 0.5, PI / 2, '#f2efe6', '#3a1a10'); }

    // ---- the middle house, written as its west half: 14 × 12 m. A stair along this half's west wall (north part), so each side has its own way up.
    // Doors: one in this half's west wall, one north, one south. On the first floor a row of lockers down the middle splits the halves
    { const X0 = -7, Z0 = -6, Z1 = 6, T = 0.3, ix0 = X0 + T, iz0 = Z0 + T, iz1 = Z1 - T, Ca = 0x2f6a8a, Ci = 0xe6dccb, sz = -5.2, ez = sz + FL;
      for (let k = 0; k < 3; k++) { const y = F[k], y1 = k < 2 ? F[k + 1] : TOP, w = (a, b) => [a, b, y + 1.0, y + 2.0];
        wall(false, X0, X0 + T, Z0 + T, Z1 - T, y, y1, k ? [w(-4.4, -3), w(1, 2.4), w(3.8, 5.2)] : [[1.6, 2.8, 0, 2.2], w(3.8, 5.2)], Ca); // west
        wall(true, Z0, Z0 + T, X0, 0, y, y1, k === 1 ? [w(-6, -4.6), [-3.6, -2.4, y, y + 2.2], w(-0.7, 0)] : k ? [w(-6, -4.6), w(-3.6, -2.2), w(-0.7, 0)] : [[-3.6, -2.4, 0, 2.2], w(-1.2, 0)], Ca); // north (its window runs on into the east half's; on the first floor a door out to the balcony)
        wall(true, Z1 - T, Z1, X0, 0, y, y1, k ? [w(-6, -4.6), w(-3.6, -2.2), w(-0.7, 0)] : [[-3.6, -2.4, 0, 2.2], w(-6, -4.6), w(-1.2, 0)], Ca); } // south
      flight('z', 1, ix0, ix0 + 1.2, sz, ez, 0); flight('z', -1, ix0 + 1.2, ix0 + 2.4, sz, ez, F[1]); flight('z', 1, ix0, ix0 + 1.2, sz, ez, F[2]); // and up to the roof
      slab(ix0, 0, iz0, iz1, F[1], [ix0, ix0 + 1.2, sz, ez], Ci); slab(ix0, 0, iz0, iz1, F[2], [ix0 + 1.2, ix0 + 2.4, sz, ez], Ci);
      rooftop(X0 - 0.3, 0, Z0 - 0.3, Z1 + 0.3, [ix0, ix0 + 1.2, sz, ez], 'nsw'); rail(ix0 + 1.17, ix0 + 1.23, sz, ez, TOP + 0.2); rail(ix0, ix0 + 1.2, sz - 0.03, sz + 0.03, TOP + 0.2);
      flight('z', -1, -8.4, -7.2, -1.0 - FL, -1.0, 0); // the outside stair, up the west face from the south
      B('flat', -8.4, -7, F[1] - 0.2, F[1], Z0 - 1.6, -1.0 - FL, 0x7a8a9a); B('flat', X0, 0, F[1] - 0.2, F[1], Z0 - 1.6, Z0, 0x7a8a9a); // its landing, and the balcony along the north face (on into the east half's)
      rail(-8.4, 0, Z0 - 1.63, Z0 - 1.57, F[1]); rail(-8.43, -8.37, Z0 - 1.6, -1.0 - FL, F[1]);
      B('flat', -2.2, 0, 0, 1.05, 4.6, 5.2, 0xd8d4cc); for (const [x, z] of [[-3, 1.5], [-1.2, -2.6]]) { B('flat', x - 0.5, x + 0.5, 0, 0.75, z - 0.5, z + 0.5, WOOD); } // the café counter, tables
      B('flat', -0.3, 0, F[1], F[1] + 2.0, -2, 2, 0x7a8a9a); // lockers down the middle
      B('flat', -3, -1, F[2], F[2] + 0.8, 2.5, 3.3, 0x8a4a4a); B('flat', -6.4, -5.2, F[2], F[2] + 0.8, 1.5, 4, 0x8a4a4a); // sofas
      if (s > 0) { sg('センターハウス', 0, 2.9, Z1 + 0.02, 3.2, 0.55, 0, '#f2efe6', '#1b2a3a'); sg('センターハウス', 0, 2.9, Z0 - 0.02, 3.2, 0.55, PI, '#f2efe6', '#1b2a3a'); B('flat', -1.2, 1.2, TOP + 0.2, TOP + 2.4, -1.2, 1.2, WHITE); M(new THREE.ConeGeometry(1.6, 1.4, 4), lam(ROOF), 0, TOP + 3.1, 0, PI / 4); } } // a little cupola in the middle of the roof: cover between the halves, too far from the parapets to climb

    // ---- the rink: boards 1.1 m high you can see over, gates in them; ice inside
    { const x0 = -RX1, x1 = -RX0, b = 0.2, H = 1.1, BC = 0xf4f4f0;
      const board = (ax0, ax1, az0, az1) => { B('flat', ax0, ax1, 0, H, az0, az1, BC); B('flat', ax0 - 0.02, ax1 + 0.02, H - 0.08, H, az0 - 0.02, az1 + 0.02, GOLD, 0); B('flat', ax0 - 0.01, ax1 + 0.01, 0.15, 0.3, az0 - 0.01, az1 + 0.01, BLUE, 0); };
      for (const z of [-RZ, RZ]) { const z0 = z < 0 ? z - b : z, z1 = z0 + b; board(x0 + CH, -33.5, z0, z1); board(-32, -22, z0, z1); board(-20.5, x1 - CH, z0, z1); } // the long sides: two gates each
      for (const x of [x0, x1]) { const a = x < -20 ? x - b : x, a1 = a + b; board(a, a1, -RZ + CH, -0.8); board(a, a1, 0.8, RZ - CH); } // the ends: a gate in the middle
      for (const [cx, cz, dx, dz] of [[x0, -RZ, 1, 1], [x1, -RZ, -1, 1], [x0, RZ, 1, -1], [x1, RZ, -1, -1]]) { // the cut corners: drawn as one slanting board, stopped by three short blocks
        for (let t = 0.5; t < CH; t += 1) col(cx + dx * t - 0.55, cx + dx * t + 0.55, 0, H, cz + dz * (CH - t) - 0.55, cz + dz * (CH - t) + 0.55);
        const o = M(new THREE.BoxGeometry(CH * Math.SQRT2 + 0.2, H, b), lam(BC), cx + dx * CH / 2, H / 2, cz + dz * CH / 2); o.rotation.y = Math.atan2(dz, dx); // along the cut, from one long side to the end
      }
      // on the ice: the resurfacer (cover), two goals (the nets stop feet, not shots)
      B('flat', -31.5, -27.9, 0, 1.6, 4.4, 6.2, 0x2f6fb2); B('flat', -28.6, -27.6, 1.6, 2.4, 4.6, 6.0, 0x2f6fb2); B('lit', -27.62, -27.6, 1.8, 2.2, 4.8, 5.8, 0xa8d0f0, 0); for (const z of [4.4, 6.2]) C('flat', -30.6, 0.35, z, 0.35, 0.25, 2, BLK);
      for (const [gx, d] of [[x0 + 2.6, -1], [x1 - 2.6, 1]]) { const back = gx + d * 1.0; col(Math.min(gx, back), Math.max(gx, back), 0, 1.2, -0.9, 0.9, true); B('fence', Math.min(gx, back), Math.max(gx, back), 0, 1.2, -0.92, 0.92, 0xffffff, 0);
        for (const z of [-0.9, 0.9]) B('flat', gx - 0.05, gx + 0.05, 0, 1.2, z - 0.05, z + 0.05, RED, 0); B('flat', gx - 0.05, gx + 0.05, 1.15, 1.25, -0.9, 0.9, RED, 0); }
      sg('スケートリンク', -27, 1.75, -RZ - 0.25, 4.4, 0.6, PI, '#2c5c9c', '#f6f2e6'); B('flat', -29.4, -24.6, 1.4, 2.1, -RZ - 0.24, -RZ - 0.2, 0x2c5c9c); B('flat', -29.3, -29.2, 0, 1.4, -RZ - 0.25, -RZ - 0.2, DARK); B('flat', -24.8, -24.7, 0, 1.4, -RZ - 0.25, -RZ - 0.2, DARK); }

    // ---- north of the rink: stands you walk up (risers of 0.28 m), a board behind them; a food truck (shots pass under it); pines; lamps
    for (let i = 0; i < 5; i++) B('flat', -36, -18, 0, 0.28 * (i + 1), -13.6 - 0.8 * (i + 1), -13.6 - 0.8 * i, i % 2 ? 0x8a9aaa : 0x9aaaba);
    B('flat', -36, -18, 0, 3.3, -17.7, -17.6, 0x5a6a7a); for (const x of [-36, -18]) B('flat', x - (x < -20 ? 0.1 : 0), x + (x < -20 ? 0 : 0.1), 0, 3.3, -17.7, -13.6, 0x5a6a7a); // the back and ends: out of reach from the top row
    B('corr', -12.5, -6.5, 1.0, 3.3, -21.6, -19.2, 0xe8e2d6); B('flat', -12.3, -6.7, 0.6, 1.0, -21.4, -19.4, DARK, 0); B('flat', -6.5, -5.0, 0.5, 2.8, -21.4, -19.4, 0xb3262e); B('lit', -11, -8, 1.6, 2.6, -19.18, -19.16, 0xffe2b0, 0);
    for (const x of [-11.5, -7.6]) { C('flat', x, 0.45, -20.4, 0.45, 2.3, 2, BLK); for (const z of [-21.3, -19.5]) col(x - 0.45, x + 0.45, 0, 0.9, z - 0.18, z + 0.18); }
    sg('ホットココア', -9.5, 3.0, -19.17, 2.6, 0.5, 0, '#f6efe0', '#5a2a10');
    pine(-46, -21, 6.5); pine(-31, -24.5, 7); pine(-21, -26, 6); pine(-17, -21, 5.5); pine(-40, -28, 6);
    for (const [x, z] of [[-44, -14], [-24, -18.5], [-9, -18], [-48, 14], [-12, 14], [-24, 17.5]]) lamp(x, z);
    B('flat', -HX, HX * 0 - 0.001, 0, 1.0, -HZ - 0.4, -HZ - 0.3, 0x5a6a7a, 0); for (let x = -HX; x < 0; x += 2) B('flat', x - 0.04, x + 0.04, 0, 1.05, -HZ - 0.4, -HZ - 0.3, 0x5a6a7a, 0); // the railing over the harbour

    // ---- south of the rink: the skate-hire hut (a hatch to shoot through, a door in its east end), benches, a snowman, pines
    { const X0 = -36, X1 = -29, Z0 = 16.5, Z1 = 21, h = 2.8; B('flat', X0, X1, 0, h, Z1 - 0.2, Z1, 0x8a5a3a); B('flat', X0, X0 + 0.2, 0, h, Z0, Z1, 0x8a5a3a);
      B('flat', X1 - 0.2, X1, 0, h, Z0, 17.6, 0x8a5a3a); B('flat', X1 - 0.2, X1, 2.2, h, 17.6, 18.8, 0x8a5a3a); B('flat', X1 - 0.2, X1, 0, h, 18.8, Z1, 0x8a5a3a);
      B('flat', X0, X1, 0, 1.0, Z0, Z0 + 0.2, 0x8a5a3a); B('flat', X0, X1, 2.2, h, Z0, Z0 + 0.2, 0x8a5a3a); B('flat', X0 + 0.2, X1 - 0.2, 0.9, 1.05, Z0 - 0.2, Z0 + 0.6, 0xd8c8a8); // the hatch, over the counter
      B('flat', X0 - 0.3, X1 + 0.3, h, h + 0.2, Z0 - 0.6, Z1 + 0.3, ROOF); roof(X0 - 0.3, X1 + 0.3, Z0 - 0.6, Z1 + 0.3, h + 0.2, 1.0, true, RED);
      for (let i = 0; i < 6; i++) B('flat', X0 + 0.5 + i * 1.0, X0 + 1.1 + i * 1.0, 1.05, 1.25, Z0 + 0.1, Z0 + 0.45, [RED, BLUE, WHITE][i % 3], 0); // skates on the counter
      sg('貸靴', (X0 + X1) / 2, 2.55, Z0 - 0.02, 2.0, 0.45, PI, '#f6efe0', '#3a1a10'); }
    for (const x of [-38, -26, -20]) { B('flat', x - 1.2, x + 1.2, 0, 0.45, 14.1, 14.6, WOOD); B('flat', x - 1.2, x + 1.2, 0.45, 0.9, 14.55, 14.65, WOOD, 0); }
    { const x = -21.5, z = 25; col(x - 0.6, x + 0.6, 0, 1.9, z - 0.6, z + 0.6); for (const [r, y] of [[0.65, 0.6], [0.48, 1.4], [0.34, 1.98]]) M(new THREE.SphereGeometry(r, 14, 10), lam(SNOW), x, y, z); M(new THREE.CylinderGeometry(0.24, 0.24, 0.35, 12), lam(BLK), x, 2.42, z); }
    pine(-45, 21, 6.5); pine(-26, 26.5, 7); pine(-53, 24, 6.5); pine(-38, 27, 6); pine(-1.6, 28.4, 5.5);
    B('flat', -HX, 0, 0, 1.2, HZ + 0.3, HZ + 0.9, 0x6a5a4a, 0); // a low fence along the south edge, past the map

    // ---- the changing rooms, north of the middle house: a single storey you walk through end to end; windows north and south; a bench down the middle.
    // Its roof (3.2 m) is a running jump from the middle house's balcony (3.3 m), and back
    { const X0 = -13, X1 = -5, Z0 = -14, Z1 = -9.5, T = 0.25, H = 3.0, Cc = 0xc8b48a, w = (a, b) => [a, b, 1.0, 2.0];
      wall(true, Z0, Z0 + T, X0, X1, 0, H, [w(-11.2, -9.8), w(-8.2, -6.8)], Cc); wall(true, Z1 - T, Z1, X0, X1, 0, H, [w(-11.2, -9.8), w(-8.2, -6.8)], Cc);
      wall(false, X0, X0 + T, Z0 + T, Z1 - T, 0, H, [[-12.4, -11.2, 0, 2.2]], Cc); wall(false, X1 - T, X1, Z0 + T, Z1 - T, 0, H, [[-12.4, -11.2, 0, 2.2]], Cc);
      B('flat', X0 - 0.2, X1 + 0.2, H, H + 0.2, Z0 - 0.2, Z1 + 0.2, ROOF); B('flat', X0 - 0.2, X1 + 0.2, H + 0.2, H + 0.3, Z0 - 0.2, Z1 + 0.2, SNOW, 0);
      B('flat', -11.4, -6.6, 0, 0.45, -11.0, -10.6, WOOD); for (const [a, b] of [[-12.7, -11.4], [-9.6, -8.4], [-6.6, -5.3]]) B('flat', a, b, 0, 1.9, Z1 - 0.7, Z1 - T, 0x7a8a9a); // bench; lockers, between the windows
      sg('更衣室', -9, 2.5, Z1 + 0.02, 1.8, 0.45, 0, '#f2efe6', '#1b2a3a'); }
    // ---- the sledding hill, south of the middle house: terraces of snow 0.28 m high that you walk up, from every side, to a top 2.52 m up
    for (let k = 0; k < 9; k++) B('flat', -17 + k * 0.5, -3 - k * 0.5, 0, 0.28 * (k + 1), 16 + k * 0.5, 28 - k * 0.5, k % 2 ? 0xe9eef4 : 0xf2f5f9);
    B('flat', -12.6, -11.4, 2.52, 4.5, 23, 23.6, RED); B('flat', -12.8, -11.2, 4.5, 4.8, 22.8, 23.8, ROOF, 0); sg('そり山', -12, 4.1, 22.98, 1.6, 0.4, PI, '#f6efe0', '#3a1a10'); // the start post: a little cover on top
    { const sl = M(new THREE.BoxGeometry(1.2, 0.15, Math.hypot(4, 2.52)), lam(0x2f6fb2), -8.2, 1.4, 26); sl.rotation.x = Math.atan2(2.52, 4); } // the slide down the south side, drawn
    // ---- between the rink and the middle house: a snow sculpture in the line of the rink's gate, and walls of ice blocks
    B('flat', -13.2, -11.2, 0, 3.6, -1.2, 1.2, 0xeef2f6); M(new THREE.SphereGeometry(1.1, 12, 8), lam(SNOW), -12.2, 4.0, 0); M(new THREE.SphereGeometry(0.4, 8, 6), lam(SNOW), -12.2, 5.0, 0.7); // a snow bear, 3.6 m: cover, out of a jump's reach from the outside stair
    for (const [z0, z1] of [[-9, -5.5], [5.5, 9]]) { B('flat', -12.6, -11.4, 0, 1.4, z0, z1, 0xbfe0f0); for (let z = z0 + 0.7; z < z1; z += 0.7) B('flat', -12.62, -11.38, 0, 1.4, z - 0.02, z, 0xa8d0e8, 0); }
    // ---- on the ice: two heaps of shaved snow, scraped off by the resurfacer
    for (const [x, z] of [[-22, -6], [-34, -4.5]]) { B('flat', x - 1, x + 1, 0, 1.0, z - 1, z + 1, 0xf4f8fb); M(new THREE.SphereGeometry(1.2, 12, 8, 0, PI * 2, 0, PI / 2), lam(0xf4f8fb), x, 0.9, z).scale.y = 0.4; }
    // ---- the way in at the base: two ticket booths and the gate between them
    for (const [z0, z1] of [[-4, -2.4], [2.4, 4]]) { B('flat', -45, -43.4, 0, 2.6, z0, z1, 0x2c5c9c); B('flat', -45.2, -43.2, 2.6, 2.8, z0 - 0.2, z1 + 0.2, ROOF); B('lit', -43.42, -43.4, 1.2, 1.9, z0 + 0.3, z1 - 0.3, 0xa8d0f0, 0); }
    B('flat', -44.4, -44, 2.8, 3.6, -4, 4, 0x2c5c9c); sg('入場口', -43.98, 3.2, 0, 2.4, 0.5, PI / 2, '#2c5c9c', '#f6f2e6');
    // ---- north-west: cars parked in the snow (shots pass under them); south-west: a garden of clipped hedges, chest high
    const car = (x0, x1, z0, z1, c) => { const al = x1 - x0 > z1 - z0; B('flat', x0, x1, 0.35, 1.05, z0, z1, c); if (al) B('flat', x0 + 1, x1 - 1.2, 1.05, 1.55, z0 + 0.1, z1 - 0.1, c); else B('flat', x0 + 0.1, x1 - 0.1, 1.05, 1.55, z0 + 1, z1 - 1.2, c);
      B('flat', x0 + 0.1, x1 - 0.1, 1.55, 1.62, z0 + 0.1, z1 - 0.1, SNOW, 0); for (const [wx, wz] of al ? [[x0 + 0.7, z0], [x1 - 0.7, z0], [x0 + 0.7, z1], [x1 - 0.7, z1]] : [[x0, z0 + 0.7], [x1, z0 + 0.7], [x0, z1 - 0.7], [x1, z1 - 0.7]]) col(wx - 0.3, wx + 0.3, 0, 0.35, wz - 0.3, wz + 0.3); };
    car(-58, -53.8, -20, -18.2, 0xa5352f); car(-58, -53.8, -23.6, -21.8, 0x8b929b); car(-50, -48.2, -27, -22.8, 0x2c5c9c);
    const hedge = (x0, x1, z0, z1) => { B('flat', x0, x1, 0, 1.4, z0, z1, 0x2f5a3a); B('flat', x0 - 0.03, x1 + 0.03, 1.4, 1.5, z0 - 0.03, z1 + 0.03, SNOW, 0); };
    hedge(-58, -50, 15.5, 16.3); hedge(-47, -41, 15.5, 16.3); hedge(-50.4, -49.6, 16.3, 22); hedge(-60, -55.5, 24, 24.8); hedge(-46, -40, 25, 25.8); hedge(-42.4, -41.6, 18.5, 25);

    // ---- the base, behind and beside the end house: snow walls to stand behind, a bench, a lamp
    snowWall(-53, -46.5, -12.4, -11.4); snowWall(-53, -46.5, 11.4, 12.4); snowWall(-49.2, -46.5, -11.4, -6); snowWall(-49.2, -46.5, 6, 11.4); // closed against the house's corners: the way out of these pockets is round the back
    lamp(-61, -8); lamp(-61, 8);
  }
  done();
  K.done();
  m.g = g; m.boxes = K.bx; m.hard = K.bx.filter(b => !b.soft); m.lx = HX - 0.5; m.lz = HZ - 0.5; m.dx = HX - 1; m.dz = HZ - 1;
  m.ice = (x, z) => { const ax = Math.abs(x), ex = Math.min(ax - RX0, RX1 - ax), ez = RZ - Math.abs(z); return ex > 0 && ez > 0 && ex + ez > CH; }; // inside the boards
}

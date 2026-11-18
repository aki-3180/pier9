// Rays and boxes: line of sight, hits on a player's body, pushing out of walls.
'use strict';
function rayBox(ox, oy, oz, dx, dy, dz, b, maxT) {
  let t0 = 0, t1 = maxT;
  const ax = [[ox, dx, b.x - b.hx, b.x + b.hx], [oy, dy, b.y0, b.h], [oz, dz, b.z - b.hz, b.z + b.hz]];
  for (const [o, d, mn, mx] of ax) {
    if (Math.abs(d) < 1e-8) { if (o < mn || o > mx) return -1; continue; }
    let a = (mn - o) / d, c = (mx - o) / d; if (a > c) { const s = a; a = c; c = s; }
    if (a > t0) t0 = a; if (c < t1) t1 = c; if (t0 > t1) return -1;
  }
  return t0;
}
// A rival is hit only where the drawn figure is: legs and vest as boxes turned with the body, head as a sphere.
const BODY = [{ x: 0, z: 0, hx: 0.22, hz: 0.13, y0: 0, h: 0.78 }, { x: 0, z: 0, hx: 0.28, hz: 0.16, y0: 0.77, h: 1.47 }], HEAD_Y = 1.66, HEAD_R = 0.2;
let headHit = false; // set by rayBody: was the nearest hit the head?
function rayBody(r, ox, oy, oz, dx, dy, dz, maxT) { // distance along the ray to the figure, or -1
  headHit = false;
  const s = Math.sin(r.yaw), c = Math.cos(r.yaw), wx = ox - r.x, wz = oz - r.z;
  const lx = wx * c - wz * s, ly = oy - r.py, lz = wx * s + wz * c, ex = dx * c - dz * s, ez = dx * s + dz * c; // into the figure's own frame
  let best = -1;
  for (const b of BODY) { const t = rayBox(lx, ly, lz, ex, dy, ez, b, maxT); if (t >= 0 && (best < 0 || t < best)) best = t; }
  const hy = HEAD_Y - ly, tca = -lx * ex + hy * dy - lz * ez, d2 = lx * lx + hy * hy + lz * lz - tca * tca;
  if (tca >= 0 && d2 <= HEAD_R * HEAD_R) { const t = Math.max(0, tca - Math.sqrt(HEAD_R * HEAD_R - d2)); if (t <= maxT && (best < 0 || t < best)) { best = t; headHit = true; } }
  return best;
}
function blocked(ox, oy, oz, tx, ty, tz) { // is the segment cut by something solid?
  let dx = tx - ox, dy = ty - oy, dz = tz - oz; const L = Math.hypot(dx, dy, dz) || 1; dx /= L; dy /= L; dz /= L;
  for (const b of hard) if (rayBox(ox, oy, oz, dx, dy, dz, b, L) >= 0) return true;
  return false;
}
function pushOut(o, r, feet, head) { // circle vs box footprints, returns true on contact
  let hit = false;
  for (const b of boxes) {
    if (feet >= b.h || head <= b.y0) continue;
    const cx = Math.max(b.x - b.hx, Math.min(o.x, b.x + b.hx)), cz = Math.max(b.z - b.hz, Math.min(o.z, b.z + b.hz));
    let dx = o.x - cx, dz = o.z - cz; const d2 = dx * dx + dz * dz;
    if (d2 >= r * r) continue;
    hit = true;
    if (d2 > 1e-8) { const d = Math.sqrt(d2); o.x = cx + dx / d * r; o.z = cz + dz / d * r; }
    else { const px = b.hx - Math.abs(o.x - b.x), pz = b.hz - Math.abs(o.z - b.z);
      if (px < pz) o.x = b.x + Math.sign(o.x - b.x || 1) * (b.hx + r); else o.z = b.z + Math.sign(o.z - b.z || 1) * (b.hz + r); }
  }
  return hit;
}

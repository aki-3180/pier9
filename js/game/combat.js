// Taking damage, reloading, aiming and firing; the drones' bolts.
'use strict';
function damage(d, sx, sz) {
  if (state !== 'play' || (online && (net.dead > 0 || net.pick))) return;
  P.hp -= d; hurtFrom(sx, sz);
  if (P.hp <= 0) { P.hp = 0; if (coop) coopDown(); else gameOver(); }
}
function hurtFrom(sx, sz) {
  hurtA = Math.min(1, hurtA + 0.6); sfx.hurt();
  const dx = sx - P.x, dz = sz - P.z, s = Math.sin(P.yaw), c = Math.cos(P.yaw);
  dirAng = Math.atan2(dx * c - dz * s, -dx * s - dz * c); dirA = 1;
}
function startReload() { if (reloadT > 0 || ammo === W.mag) return; reloadT = W.rl; sfx.reload(); }

const v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
function aimDir(out) { const cp = Math.cos(P.pitch); return out.set(-Math.sin(P.yaw) * cp, Math.sin(P.pitch), -Math.cos(P.yaw) * cp); }
function findTarget(cone) { // enemy nearest the crosshair inside the cone (radians), with a clear line
  aimDir(v1); let bestE = null, bestA = 9;
  for (const e of enemies) {
    const dx = e.x - P.x, dy = e.y - P.ey, dz = e.z - P.z, L = Math.hypot(dx, dy, dz);
    if (L > 60 || L < 0.01) continue;
    const ang = Math.acos(Math.min(1, (dx * v1.x + dy * v1.y + dz * v1.z) / L)) - Math.atan(e.r / L);
    if (ang < cone && ang < bestA && !blocked(P.x, P.ey, P.z, e.x, e.y, e.z)) { bestA = ang; bestE = e; }
  }
  return bestE;
}
function spreadNow() { return W.sp * (1 - ads * (1 - W.as)); }
function fire() {
  if (reloadT > 0 || fireCd > 0 || swapT > 0) return;
  if (ammo <= 0) { startReload(); return; }
  ammo--; fireCd = W.cd; recoil = W.kick; sfx.shot(W.snd); if (online) net.f++;
  flash.visible = true; flash.material.rotation = Math.random() * 6; setTimeout(() => { flash.visible = false; }, 45);
  const zoom = 1 + (W.zoom - 1) * ads, t = pvp ? null : findTarget((touchMode ? 0.045 : 0.012) / zoom); // versus: no snap, only the weapon's own spread
  let yaw = P.yaw, pitch = P.pitch;
  if (t) { const dx = t.x - P.x, dz = t.z - P.z; yaw = Math.atan2(-dx, -dz); pitch = Math.atan2(t.y - P.ey, Math.hypot(dx, dz)); }
  const spread = spreadNow(), sy = Math.sin(P.yaw), cy = Math.cos(P.yaw), side = 0.18 * (1 - ads), [r0, r1, fm] = W.fo;
  let marked = false; const dealt = new Map(); // what each target took from this shot, for the number shown: [damage, x, y, z, head]
  for (let i = 0; i < W.n; i++) {
    const sr = Math.sqrt(Math.random()) * spread / 2, sa = Math.random() * 6.2832, b = pitch + Math.sin(sa) * sr, a = yaw + Math.cos(sa) * sr / Math.max(0.2, Math.cos(pitch)), cp = Math.cos(b), d = v1.set(-Math.sin(a) * cp, Math.sin(b), -Math.cos(a) * cp);
    let tHit = W.range || 80, hitE = null, head = false; // how far a shot reaches: 80 m, the SR further
    if (d.y < -1e-4) tHit = Math.min(tHit, -P.ey / d.y);
    for (const bx of hard) { const tb = rayBox(P.x, P.ey, P.z, d.x, d.y, d.z, bx, tHit); if (tb >= 0) tHit = tb; }
    if (pvp) for (const r of liveRemotes) { if (r.mate) continue; const te = rayBody(r, P.x, P.ey, P.z, d.x, d.y, d.z, tHit); if (te >= 0 && te < tHit) { tHit = te; hitE = r; head = headHit; } } // a teammate is shot through
    else for (const e of enemies) {
      const ox = e.x - P.x, oy = e.y - P.ey, oz = e.z - P.z, tca = ox * d.x + oy * d.y + oz * d.z; if (tca < 0) continue;
      const d2 = ox * ox + oy * oy + oz * oz - tca * tca, r = e.r * 1.1; if (d2 > r * r) continue;
      const te = tca - Math.sqrt(r * r - d2); if (te < tHit) { tHit = te; hitE = e; }
    }
    const hx = P.x + d.x * tHit, hy = P.ey + d.y * tHit, hz = P.z + d.z * tHit;
    // tracer from the muzzle
    const mx = P.x + cy * side + d.x * 0.7, my = P.ey - 0.16 + 0.11 * ads + d.y * 0.7, mz = P.z - sy * side + d.z * 0.7;
    const tr = tracers[tracerI = (tracerI + 1) % tracers.length], len = Math.hypot(hx - mx, hy - my, hz - mz);
    tr.m.position.set((mx + hx) / 2, (my + hy) / 2, (mz + hz) / 2); tr.m.lookAt(hx, hy, hz); tr.m.scale.z = len; tr.m.visible = true; tr.life = 0.06;
    if (hitE) {
      marked = true; fx(hx, hy, hz, 0.9, '#ffe2b0', 0.1);
      const fall = tHit <= r0 ? 1 : tHit >= r1 ? fm : 1 - (1 - fm) * (tHit - r0) / (r1 - r0), amt = pvp ? W.pd * fall * (head ? 1.4 : 1) : W.dmg * fall;
      const sum = dealt.get(hitE); if (sum) { sum[0] += amt; sum[1] = hx; sum[2] = hy; sum[3] = hz; sum[4] = sum[4] || head; } else dealt.set(hitE, [amt, hx, hy, hz, head]);
      if (pvp) net.dm[hitE.n] = Math.round(((net.dm[hitE.n] || 0) + amt) * 10) / 10; // the victim's page applies it
      else if (coop && !net.auth) { net.hq[hitE.id] = (net.hq[hitE.id] || 0) + amt; hitE.flash = 0.09; } // the page that flies the drones applies it
      else hurtDrone(hitE, amt, online ? R.you : 0);
    } else if (tHit < (W.range || 80)) fx(hx, hy, hz, 0.7, COL.sodium, 0.09);
  }
  for (const [t, [amt, x, y, z, head]] of dealt) dmgNum(t, amt, x, y, z, head);
  if (marked) { sfx.hit(); hudEl.hit.classList.remove('on'); void hudEl.hit.offsetWidth; hudEl.hit.classList.add('on'); }
  if (ammo === 0) startReload();
}
function launchBolt(x, y, z, vx, vy, vz, dmg, sx, sz, size) { // size: how much bigger than an ordinary bolt, to the eye and to the hit
  const b = bolts.find(b => !b.on); if (!b) return;
  b.on = true; b.life = 6; b.dmg = dmg; b.vx = vx; b.vy = vy; b.vz = vz; b.sx = sx; b.sz = sz; b.size = size || 1; b.m.scale.setScalar(b.size); b.m.position.set(x, y, z); b.m.visible = true; sfx.bolt();
}
function shootAt(e, tx, ty, tz, dmg, sp, size) { // a bolt from drone e toward a point
  const dx = tx - e.x, dy = ty - e.y, dz = tz - e.z, L = Math.hypot(dx, dy, dz) || 1;
  const x = e.x + dx / L * e.r, z = e.z + dz / L * e.r, vx = dx / L * sp, vy = dy / L * sp, vz = dz / L * sp;
  launchBolt(x, e.y, z, vx, vy, vz, dmg, e.x, e.z, size);
  if (coop) net.bl.push([x, e.y, z, vx, vy, vz].map(v => Math.round(v * 100) / 100).concat(dmg, Math.round(e.x), Math.round(e.z), size || 1)); // every page flies the bolt; each checks it against its own player
}
function shootBolt(e, dmg, t) { shootAt(e, t.x + (Math.random() - 0.5) * 1.4, t.ey - 0.35, t.z + (Math.random() - 0.5) * 1.4, dmg, 11); } // t: the player it is aimed at
function fan(e, t, n, width, off, dmg) { // the spreader: n bolts side by side across width radians, aimed at t; off shifts them half a gap
  const dx = t.x - e.x, dz = t.z - e.z, L = Math.hypot(dx, dz) || 1, a0 = Math.atan2(dx, dz);
  for (let k = 0; k < n; k++) { const a = a0 + ((k + off) / (n - 1) - 0.5) * width; shootAt(e, e.x + Math.sin(a) * L, t.ey - 0.35, e.z + Math.cos(a) * L, dmg, 10); }
}
function blast(x, y, z) { // the charger's explosion at the end of its run (co-op): on every page, and it hurts whoever stands in it there
  const R = TYPES.charge.r + 1; fx(x, y, z, 7, COL.sodium, 0.35); fx(x, y, z, 3.5, '#ffffff', 0.2); sfx.boom();
  if (state === 'play' && Math.hypot(P.x - x, P.ey - 0.6 - y, P.z - z) < R) damage(35, x, z);
}

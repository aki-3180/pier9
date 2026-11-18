// What the drones go for, and how the bosses behave.
'use strict';
// Who the drones go for: our own player, and in co-op the others in play. Each drone looks again once a second.
const IDLE = { x: 0, y: 0, ey: EYEH, z: 0, idle: true }, meT = { me: true, x: 0, y: 0, ey: 0, z: 0 };
function targets(up) {
  const out = [];
  if (up) { meT.x = P.x; meT.y = P.y; meT.ey = P.ey; meT.z = P.z; meT.n = online ? R.you : 0; out.push(meT); }
  if (coop) for (const r of liveRemotes) { if (r.away) continue; const t = r.tgt; t.x = r.x; t.y = r.py; t.ey = r.py + EYEH; t.z = r.z; t.n = r.n; out.push(t); } // (a player who is away is left alone)
  return out;
}
// where player n is, as this page sees it (a drone's target, sent along with it so every page draws it facing the right way)
const tpos = { x: 0, ey: 0, z: 0 };
function tgtPos(n) {
  const r = n > 0 && n !== R.you ? remotes.get(n) : null;
  if (r) { tpos.x = r.x; tpos.ey = r.py + EYEH; tpos.z = r.z; } else if (n === -1 || (n > 0 && n !== R.you)) { tpos.x = 0; tpos.ey = EYEH; tpos.z = 0; } else { tpos.x = P.x; tpos.ey = P.ey; tpos.z = P.z; }
  return tpos;
}
/* The three newer bosses. ch is the boss's state, sent to every page: 1 = winding up (its eye swells; the sniper's red line shows), 2 = the charger's run.
   spread: fans of bolts in quick succession (more of them in co-op, and more again at half health).
   charge: stops, glows, then runs straight at where its target stood; a hit takes 25. It ends the run on a wall, the ground or after 1.3 s; in co-op it then explodes (35, 1 m beyond its body).
   sniper: keeps its distance, shows a red line on its target for a second, then fires one fast bolt (22; in co-op 25, far faster and bigger); two at half health. */
let bumpCD = 0, trailT = 0;
const laserMat = new THREE.MeshBasicMaterial({ color: 0xff3b2e, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
const laserGeo = new THREE.BoxGeometry(0.035, 0.035, 1);
function bossLook(e, up, dt) { // on every page: the wind-up glow, the red line, the trail of a run, the rage at half health, a run reaching us
  e.eg.scale.setScalar(e.ch === 1 ? 2.6 + Math.sin(time * 40) * 0.5 : e.ch === 2 ? 2.2 : 1.3);
  if (!e.half && e.hp < e.max / 2) { e.half = true; announce(`${e.T.name} 出力上昇`, '攻撃が激しくなる'); fx(e.x, e.y, e.z, 6 * e.T.scale, e.T.eye, 0.4); tone('sawtooth', 300, 140, 0.4, 0.07); }
  if (e.type === 'sniper') {
    const on = e.ch === 1;
    if (on && !e.laser) { e.laser = new THREE.Mesh(laserGeo, laserMat.clone()); scene.add(e.laser); }
    if (e.laser) {
      e.laser.visible = on;
      if (on) { const p = tgtPos(e.tgn), L = Math.hypot(p.x - e.x, p.ey - 0.25 - e.y, p.z - e.z); e.laser.position.set((e.x + p.x) / 2, (e.y + p.ey - 0.25) / 2, (e.z + p.z) / 2); e.laser.lookAt(p.x, p.ey - 0.25, p.z); e.laser.scale.z = L; e.laser.material.opacity = 0.35 + 0.3 * Math.sin(time * 30); }
    }
  }
  if (e.type === 'charge' && e.ch === 2) {
    if ((trailT -= dt) <= 0) { trailT = 0.04; fx(e.x, e.y, e.z, 2.2 * e.T.scale * 0.5, e.T.eye, 0.25); }
    if (up && bumpCD <= 0 && Math.hypot(P.x - e.x, P.ey - 0.6 - e.y, P.z - e.z) < e.r + 0.9) { bumpCD = 1.2; damage(25, e.x, e.z); }
  }
}
function bossAct(e, dt, t, d, ty) { // on the page that flies it: the attacks
  const seen = () => !blocked(e.x, e.y, e.z, t.x, t.ey - 0.3, t.z);
  if (e.type === 'spread') {
    // co-op: 7 bolts of 10.5, twice; at half health 12 bolts, three times. Alone: 7 of 7 once; at half 9, twice. Each fan after the first fills the gaps of the one before
    const n = coop ? (e.half ? 12 : 7) : (e.half ? 9 : 7), dmg = coop ? 10.5 : 7;
    if (e.burst > 0 && (e.bt -= dt) <= 0) { e.burst--; e.bt = 0.32; fan(e, t, n, 1.0, e.burst % 2 ? 0.5 : 0, dmg); }
    if ((e.cd -= dt) <= 0 && e.y < ty + 2) { if (d < e.T.range + 12 && seen()) { fan(e, t, n, 1.0, 0, dmg); e.burst = (coop ? (e.half ? 3 : 2) : (e.half ? 2 : 1)) - 1; e.bt = 0.32; e.cd = e.half ? 2.6 : 3.2; } else e.cd = 0.4; }
  } else if (e.type === 'charge') {
    if (e.ch === 0 && (e.cd -= dt) <= 0) { if (d < 32 && seen()) { e.ch = 1; e.chT = e.half ? 0.6 : 0.9; } else e.cd = 0.4; }
    else if (e.ch === 1 && (e.chT -= dt) <= 0) { // go: straight at where the target stands now
      const dx = t.x - e.x, dy = t.ey - 0.5 - e.y, dz = t.z - e.z, L = Math.hypot(dx, dy, dz) || 1, sp = 21;
      e.dvx = dx / L * sp; e.dvy = dy / L * sp; e.dvz = dz / L * sp; e.ch = 2; e.chT = Math.min(1.3, (coop ? L : L + 4) / sp); // in co-op it stops on the spot and explodes there tone('sawtooth', 160, 420, 0.3, 0.07);
    }
  } else if (e.type === 'sniper') {
    if (e.ch === 0 && (e.cd -= dt) <= 0) { if (d < 48 && seen()) { e.ch = 1; e.chT = 1.1; e.shots = e.half ? 2 : 1; } else e.cd = 0.4; }
    else if (e.ch === 1 && (e.chT -= dt) <= 0) {
      if (coop) shootAt(e, t.x, t.ey - 0.25, t.z, 25, 100, 1.5); else shootAt(e, t.x, t.ey - 0.25, t.z, 22, 34); // co-op: too fast to dodge once fired, half as big again; hide while the line shows
      if (--e.shots > 0) e.chT = 0.35; else { e.ch = 0; e.cd = e.half ? 2.8 : 3.8; }
    }
  }
}
function nearest(tgs, e) { let best = null, bd = 1e9; for (const t of tgs) { const d = Math.hypot(t.x - e.x, t.z - e.z); if (d < bd) { bd = d; best = t; } } return best; }

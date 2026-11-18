// One step of the game: the drones, bolts, pickups, waves, and the player's movement.
'use strict';
// live: the player is in play. Otherwise (paused, or laying out buttons) a match carries on around this page without it.
function update(dt, live) {
  time += dt;
  const up = live && !(online && (net.dead > 0 || net.pick || net.ending || net.cd > 0)); // standing and in play
  if (up) playerStep(dt);
  else { ads = Math.max(0, ads - dt * W.ar); if (lockOn) { lockOn = false; hudEl.cross.classList.remove('lock'); } } // the gun comes down while waiting to spawn
  if (online) { netSync(dt, !live); if (!online) return; } // (the match can end while syncing)
  if (pvp) return;
  const sim = !coop || net.auth, np = crowd(); // sim: this page flies the drones
  // spawning and waves
  if (sim) {
    if (queue.length) { spawnT -= dt; if (spawnT <= 0 && enemies.length < Math.min(Math.min(4 + (wave / 3 | 0), 10) + 2 * (np - 1), 16)) { spawnEnemy(queue.shift()); spawnT = Math.max(0.6, 1.5 - wave * 0.045) / Math.sqrt(np); } }
    else if (!enemies.length && wave > 0) {
      if (breakT <= 0) { breakT = 3.4; score += wave * 100; waveClear(wave); if (coop) net.ev.push(['c', wave]); }
      else { breakT -= dt; if (breakT <= 0) startWave(wave + 1); }
    }
  }
  // drones
  const tgs = sim ? targets(up) : null; bumpCD -= dt;
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    for (const r of e.rotors) r.rotation.y = time * 40;
    if (e.flash > 0) { e.flash -= dt; e.bodyMat.emissive.setHex(e.flash > 0 ? 0xffb347 : 0x000000); }
    if (e.T.boss) { bossLook(e, up, dt); if (state === 'over') return; }
    if (!sim) { // another page flies it: ease toward where that page last put it. A ram (or a charging boss) that reaches us is ours to report
      const k = Math.min(1, dt * (e.ch === 2 ? 18 : 10)); e.x += (e.tx - e.x) * k; e.y += (e.ty - e.y) * k; e.z += (e.tz - e.z) * k;
      const lp = tgtPos(e.tgn); e.g.position.set(e.x, e.y, e.z); e.g.lookAt(lp.x, lp.ey, lp.z);
      if (e.type === 'ram' && up && Math.hypot(P.x - e.x, e.y - P.ey + 0.3, P.z - e.z) < 1.35) { net.rh.push(e.id); net.spent.add(e.id); const ex = e.x, ez = e.z; killEnemy(e); damage(15, ex, ez); }
      continue;
    }
    if ((e.tgT -= dt) <= 0 || !tgs.includes(e.tg)) { e.tgT = e.ch ? 9 : 1; e.tg = nearest(tgs, e); } // a boss winding up keeps its target
    const t = e.tg || IDLE, dx = t.x - e.x, dz = t.z - e.z, d = Math.hypot(dx, dz) || 1, nx = dx / d, nz = dz / d;
    e.tgn = t.n === undefined ? -1 : t.n;
    let ax, az, ty;
    if (e.type === 'ram') { ax = nx + -nz * e.orbit * 0.25; az = nz + nx * e.orbit * 0.25; ty = d < 9 ? t.y + 1.45 : e.T.alt + t.y * 0.5; }
    else { const a = d > e.T.range + 2 ? 1 : d < e.T.range - 4 ? -0.8 : 0; ax = nx * a - nz * e.orbit * 0.7; az = nz * a + nx * e.orbit * 0.7; ty = e.T.alt + t.y * 0.5 + Math.sin(time * 1.7 + e.ph) * 0.35; } // a little higher when the player has climbed
    if (MAP.fly && ty > MAP.fly) ty = MAP.fly; // indoors: stay under the roof
    if (e.ch === 2 && e.type === 'charge') { // the charge: straight at where the target stood, until it hits something or runs out
      e.x += e.dvx * dt; e.y += e.dvy * dt; e.z += e.dvz * dt; e.chT -= dt;
      if (pushOut(e, e.r + 0.2, e.y - e.r, e.y + e.r) || e.y < 1.2 || e.chT <= 0 || Math.abs(e.x) > MAP.dx || Math.abs(e.z) > MAP.dz) { e.ch = 0; e.cd = e.half ? 2.4 : 3.8; e.vx = e.vz = 0; e.x = clamp(e.x, -MAP.dx, MAP.dx); e.z = clamp(e.z, -MAP.dz, MAP.dz); e.y = Math.max(e.y, 1.2);
        if (coop) { const r2 = v => Math.round(v * 100) / 100; blast(e.x, e.y, e.z); net.ev.push(['x', r2(e.x), r2(e.y), r2(e.z)]); if (state === 'over') return; } }
    } else {
      const k = Math.min(1, dt * 3), slow = e.ch === 1 ? 0.15 : 1; e.vx += (ax * e.speed * slow - e.vx) * k; e.vz += (az * e.speed * slow - e.vz) * k;
      e.x += e.vx * dt; e.z += e.vz * dt; e.y += (ty - e.y) * Math.min(1, dt * 1.6);
      if (pushOut(e, e.r + 0.2, e.y - e.r, e.y + e.r) && Math.random() < dt * 2) e.orbit *= -1;
      if (Math.abs(e.x) > MAP.dx || Math.abs(e.z) > MAP.dz) { e.x = clamp(e.x, -MAP.dx, MAP.dx); e.z = clamp(e.z, -MAP.dz, MAP.dz); e.orbit *= -1; }
    }
    for (const o of enemies) { if (o === e) continue; const sx = e.x - o.x, sz = e.z - o.z, sd = Math.hypot(sx, sz), m = e.r + o.r + 0.3; if (sd < m && sd > 0.001) { e.x += sx / sd * (m - sd) * 0.5; e.z += sz / sd * (m - sd) * 0.5; } }
    e.g.position.set(e.x, e.y, e.z); e.g.lookAt(t.x, t.ey, t.z);
    if (e.type === 'ram') { // only our own player is checked here; the others' pages report the rams that reach them
      if (up && Math.hypot(P.x - e.x, e.y - P.ey + 0.3, P.z - e.z) < 1.35) { const ex = e.x, ez = e.z; killEnemy(e); damage(15, ex, ez); if (state === 'over') return; }
      continue;
    }
    if (e.type === 'boss' && (e.st -= dt) <= 0) { e.st = 8; if (enemies.length < (coop ? 10 : 8) + 2 * (np - 1)) { spawnEnemy('ram', e); spawnEnemy('ram', e); if (coop) { spawnEnemy('scout', e); spawnEnemy('scout', e); } } } // lets two rams go every 8 s (in co-op two scouts as well), unless the air is already full
    if (t.idle) { e.ch = 0; continue; } // nobody to shoot at
    if (e.T.boss && e.type !== 'boss') { bossAct(e, dt, t, d, ty); if (state === 'over') return; continue; }
    if (e.burst > 0) { e.bt -= dt; if (e.bt <= 0) { shootBolt(e, e.T.boss && coop ? 12 : 8, t); e.burst--; e.bt = e.T.boss ? 0.14 : 0.2; } }
    e.cd -= dt;
    if (e.cd <= 0 && e.y < ty + 2) {
      if (d < e.T.range + 10 && !blocked(e.x, e.y, e.z, t.x, t.ey - 0.3, t.z)) { if (e.T.boss) { e.burst = 5; e.bt = 0; e.cd = e.half ? 2.6 : 3.6; } else if (e.type === 'heavy') { e.burst = 3; e.bt = 0; e.cd = 3.2; } else { shootBolt(e, 6, t); e.cd = Math.max(1.6, 3.1 - wave * 0.045) + Math.random() * 1.2; } }
      else e.cd = 0.35;
    }
  }
  // bolts: every page flies all of them, and each checks only its own player. Moved in short steps, so a fast one cannot pass through
  for (const b of bolts) {
    if (!b.on) continue;
    const p = b.m.position, n = Math.max(1, Math.ceil(Math.hypot(b.vx, b.vy, b.vz) * dt / 0.4)), h = dt / n; let dead = false;
    b.life -= dt; if (b.life <= 0) dead = true;
    for (let s = 0; s < n && !dead; s++) {
      p.x += b.vx * h; p.y += b.vy * h; p.z += b.vz * h;
      if (p.y < 0.05) { dead = true; break; }
      for (const bx of hard) if (p.y > bx.y0 && p.y < bx.h && Math.abs(p.x - bx.x) < bx.hx && Math.abs(p.z - bx.z) < bx.hz) { dead = true; break; }
      if (!dead && up && p.y > P.y - 0.16 * (b.size - 1) && p.y < P.y + 1.95 + 0.16 * (b.size - 1) && Math.hypot(p.x - P.x, p.z - P.z) < 0.5 + 0.16 * (b.size - 1)) { dead = true; damage(b.dmg, b.sx, b.sz); if (state === 'over') return; }
    }
    if (dead) { b.on = false; b.m.visible = false; fx(p.x, p.y, p.z, 1.2, COL.alarm, 0.12); }
  }
  // pickups: in co-op, one taken here is reported to the page that flies the drones
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i]; p.life -= dt; p.m.rotation.y += dt * 2; p.m.position.y = 0.7 + Math.sin(time * 3 + i) * 0.12;
    const got = up && Math.hypot(p.x - P.x, p.z - P.z) < 1.3;
    if (got) { P.hp = Math.min(100, P.hp + 25); sfx.pick(); announce('体力 +25'); if (coop) { net.claimed.add(p.id); if (!sim) net.pc.push(p.id); } }
    if (got || (sim && p.life <= 0)) removePickup(p);
  }
}
function playerStep(dt) {
  let mx = joy.x, my = joy.y; if (Math.hypot(mx, my) < 0.12) mx = my = 0;
  if (keys.KeyW || keys.ArrowUp) my -= 1; if (keys.KeyS || keys.ArrowDown) my += 1; if (keys.KeyA || keys.ArrowLeft) mx -= 1; if (keys.KeyD || keys.ArrowRight) mx += 1;
  const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
  const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw), sp = 5.4 * W.mv * (1 - 0.3 * ads);
  P.x += (mx * cy + my * sy) * sp * dt; P.z += (-mx * sy + my * cy) * sp * dt;
  pushOut(P, 0.5, P.y + 0.3, P.y + 1.8);
  P.x = clamp(P.x, -LX, LX); P.z = clamp(P.z, -LZ, LZ);
  // jumping and standing on things
  jumpQ -= dt;
  if ((jumpHeld || jumpQ > 0 || keys.Space) && P.ground) { P.vy = JUMP; P.ground = false; jumpQ = 0; tone('sine', 220, 330, 0.08, 0.05); }
  const wasY = P.y; P.vy -= GRAV * dt; P.y += P.vy * dt;
  if (P.vy > 0) for (const b of boxes) // a ceiling, a lintel, the underside of a deck: the head stops there
    if (b.y0 >= wasY + 1.79 && b.y0 < P.y + 1.8 && Math.abs(P.x - b.x) < b.hx + 0.45 && Math.abs(P.z - b.z) < b.hz + 0.45) { P.y = b.y0 - 1.81; P.vy = 0; }
  const fl = floorAt(P.x, P.z, Math.max(wasY, P.y)); // measured from where the feet were, so a long frame cannot drop through a roof
  if (P.y <= fl) { if (P.vy < -9) noise(0.08, 500, 120, 0.12); if (P.ground && fl > wasY) stepLag = Math.min(0.5, stepLag + fl - wasY); P.y = fl; P.vy = 0; P.ground = true; } else P.ground = false;
  stepLag *= Math.exp(-dt * 14); P.ey = P.y + EYEH - stepLag; // the eye follows a stair step smoothly instead of snapping up it
  if (P.ground) bob += Math.min(1, ml) * dt * 9;
  // weapon
  fireCd -= dt; swapT -= dt; recoil = Math.max(0, recoil - dt * 9);
  if (reloadT > 0) { reloadT -= dt; if (reloadT <= 0) ammo = W.mag; }
  ads = clamp(ads + (aiming && reloadT <= 0 && swapT <= 0 ? 1 : -1) * dt * W.ar, 0, 1);
  lockOn = !pvp && !!findTarget(0.022 / (1 + (W.zoom - 1) * ads)); // versus: no lock-on cue and no auto fire
  hudEl.cross.classList.toggle('lock', lockOn);
  if (firing || mouseFire || (cfg.auto && lockOn)) fire();
}

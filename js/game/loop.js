// The frame loop: effects, camera, gun, drawing, HUD.
'use strict';
let last = performance.now(), hudT = 0, frameAt = last;
// A hidden tab gets no animation frames, but its timers still run (about once a second). Keep the match going from here meanwhile,
// so the player stays where they stood: still sending, still in the standings, and in versus still able to be shot.
const asleep = () => document.hidden || performance.now() - frameAt > 500;
let napAt = 0;
setInterval(() => {
  if (!online || performance.now() - frameAt < 500) { napAt = 0; return; } // (frames still coming: the loop does it)
  const now = performance.now(), dt = napAt ? Math.min(2, (now - napAt) / 1000) : 0; napAt = now; time += dt;
  netSync(dt, true);
}, 250);
function frame(now) {
  requestAnimationFrame(frame); frameAt = now;
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (state === 'play') update(dt, true); else if (online) update(dt, false); // a match does not stop for one paused page
  // effects tick in every state so they settle while paused frames render
  for (const t of tracers) if (t.life > 0) { t.life -= dt; if (t.life <= 0) t.m.visible = false; }
  for (const f of fxPool) if (f.life > 0) { f.life -= dt; const q = Math.max(0, f.life / f.max); f.s.material.opacity = q; f.s.scale.setScalar(f.size * (1.3 - q * 0.6)); if (f.life <= 0) f.s.visible = false; }
  beacons.forEach((b, i) => { b.material.opacity = (now / 1000 + i * 0.6) % 1.6 < 0.5 ? 1 : 0.12; });
  hurtA = Math.max(0, hurtA - dt * 1.4); dirA = Math.max(0, dirA - dt * 1.1);
  for (let i = booms.length - 1; i >= 0; i--) { const b = booms[i]; if ((b.t -= dt) > 0) continue; fx(b.x, b.y, b.z, b.s, i % 2 ? COL.sodium : '#ffd9a0', 0.32); booms.splice(i, 1); } // a boss's chain of explosions
  shakeT = Math.max(0, shakeT - dt); const sk = shakeT * shakeT * 0.5;

  const title = state === 'menu' || state === 'lobby'; // the title and the room screen fly over the map
  const zoom = title ? 1 : 1 + (W.zoom - 1) * ads, fov = 2 * Math.atan(Math.tan(baseFov * Math.PI / 360) / zoom) * 180 / Math.PI;
  if (Math.abs(fov - camera.fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
  const cd = Math.max(6, Math.round(Math.tan(spreadNow() / 2) / Math.tan(fov * Math.PI / 360) * innerHeight / 2) * 2) + (W.n > 1 ? 4 : 0); // the reticle spans the spread cone on screen
  if (cd + wi / 8 !== crossD) { crossD = cd + wi / 8; hudEl.cross.style.setProperty('--d', cd + 'px'); hudEl.cross.classList.toggle('ring', W.n > 1); }
  const scoped = !!W.scope && ads > 0.9 && !title && state !== 'edit';
  if (scoped !== wasScoped) { wasScoped = scoped; document.body.classList.toggle('scoped', scoped); }
  let co = 0.5;
  if (title) { const a = now / 14000, [cr, cy, cx, cz, cp] = MAP.cam; camera.position.set(Math.sin(a) * cr + cx, cy, Math.cos(a) * cr + cz); camera.rotation.set(cp, a + 0.9, 0); gun.visible = false; }
  else {
    const bobY = reduceMotion ? 0 : Math.sin(bob) * 0.035;
    camera.position.set(P.x + (Math.random() - 0.5) * sk, P.ey + bobY + (Math.random() - 0.5) * sk, P.z + (Math.random() - 0.5) * sk); camera.rotation.set(P.pitch + recoil * 0.012, P.yaw, 0);
    gun.visible = !scoped; const rl = reloadT > 0 ? Math.sin(Math.min(1, (W.rl - reloadT) / W.rl) * Math.PI) : 0, sw = Math.max(0, swapT / 0.3);
    // Aiming brings the sight up to the eye: the gun moves from the hip until the middle of the sight sits on the line of sight, ed in front of the camera.
    // sway: how much of the walking bob reaches the gun. A little stays when aiming, so the housing drifts around the dot.
    const ud = guns[wi].userData, [ey, ez, ed] = ud.eye, e = ads * ads * (3 - 2 * ads), hip = 1 - e, sway = hip + 0.15 * e;
    gun.position.set(gun.userData.x * hip + (reduceMotion ? 0 : Math.cos(bob * 0.5) * 0.006) * sway, -0.21 * hip - ey * 0.8 * e - rl * 0.16 - sw * 0.2 + bobY * 0.25 * sway, -0.72 * hip - (ed * gun.userData.far + ez * 0.8) * e + recoil * 0.045 * (1 - 0.5 * e));
    gun.rotation.set(recoil * 0.07 * (1 - 0.75 * e) - rl * 0.7 - sw * 0.5, 0.03 * hip, 0);
    flash.scale.setScalar(0.3 - 0.12 * e);
    let da = 0;
    if (ud.lens && gun.visible) { // where the line of sight crosses the glass, in the window's own frame; the camera looks down -z from the origin
      gun.updateMatrixWorld(); m4.copy(ud.lens.matrixWorld).invert(); v2.set(0, 0, 0).applyMatrix4(m4); v1.set(0, 0, -1).applyMatrix4(m4).sub(v2);
      const t = -v2.z / v1.z, r = clamp(innerHeight * 0.0045, 2.2, 4) * t * 2 * Math.tan(gunCam.fov * Math.PI / 360) / innerHeight; // r: the dot's core, a fixed size on screen
      da = t > 0 ? clamp(Math.min(SW / 2 - Math.abs(v2.x + v1.x * t), SH / 2 - Math.abs(v2.y + v1.y * t)) / 0.004, 0, 1) : 0; // fades out at the edge of the window
      dot.position.z = -t; dot.scale.setScalar(r * 7.7); dot.material.opacity = da;
    }
    dot.visible = da > 0;
    co = ud.lens ? Math.round(hip * 10) / 20 : 0.5; // the reticle hands over to the dot
  }
  if (co !== crossO) { crossO = co; hudEl.cross.style.opacity = co; }
  renderer.clear(); renderer.render(scene, camera);
  if (gun.visible) { renderer.clearDepth(); renderer.render(gunScene, gunCam); }
  drawDmgNums(dt); drawMates(dt);

  if (state === 'play' && (hudT -= dt) <= 0) {
    hudT = 0.05; const hp = Math.ceil(P.hp);
    hudEl.hpNum.textContent = hp; hudEl.hpFill.style.width = hp + '%'; hudEl.hpFill.style.background = hp < 35 ? COL.alarm : COL.hull;
    hudEl.wave.textContent = wave; hudEl.left.textContent = enemies.length + queue.length; hudEl.score.textContent = score;
    const bs = pvp ? [] : enemies.filter(e => e.T.boss).slice(0, 2); hudEl.bossRow.hidden = !bs.length; // up to two bars
    bs.forEach((b, i) => { const f = i ? hudEl.bossFill2 : hudEl.bossFill, n = i ? hudEl.bossName2 : hudEl.bossName; f.style.width = Math.max(0, b.hp / b.max * 100) + '%'; if (n.textContent !== b.T.name) n.textContent = b.T.name; });
    hudEl.bossName2.hidden = hudEl.bossBar2.hidden = bs.length < 2;
    hudEl.ammo.textContent = reloadT > 0 ? '装填中' : ammo; hudEl.ammo.classList.toggle('low', reloadT <= 0 && ammo <= W.mag / 4);
    hudEl.hurt.style.opacity = Math.min(0.85, hurtA + (hp < 30 ? 0.25 : 0));
    if (online && vsBoard(vsBoardEl, innerHeight < 500 ? 4 : 8)) killLogEl.style.top = vitalsEl.offsetTop + vitalsEl.offsetHeight + 6 + 'px'; // the kill feed sits right under the standings
    hudEl.dmg.style.opacity = dirA; hudEl.dmg.style.transform = `rotate(${dirAng}rad)`;
    drawRadar();
  }
}

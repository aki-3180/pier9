// The player and the weapon in hand; the flags for which mode is being played.
'use strict';
const EYEH = 1.65, GRAV = 22, JUMP = 8.2;
const P = { x: 0, z: 4, y: 0, vy: 0, vx: 0, vz: 0, onIce: false, ey: EYEH, ground: true, yaw: 0, pitch: 0, hp: 100 }; // vx, vz: only kept while sliding on ice (MAP.ice)
function floorAt(x, z, feet) { // highest surface under the player that is no more than a step above the feet
  let f = 0;
  for (const b of boxes) if (b.h > f && b.h <= feet + 0.35 && Math.abs(x - b.x) <= b.hx + 0.25 && Math.abs(z - b.z) <= b.hz + 0.25) f = b.h;
  return f;
}
// online: in a room's match. pvp: a versus mode (no aim help, rivals instead of drones). coop: the drone waves, played together
let pvp = false, coop = false, online = false, stepLag = 0; const liveRemotes = [];
let state = 'menu', wave = 0, score = 0, wi = 1, W = WEAPONS[1], ammo = W.mag, reloadT = 0, fireCd = 0, swapT = 0, recoil = 0, bob = 0, aiming = false, ads = 0, lockOn = false;
const mags = WEAPONS.map(w => w.mag), cds = WEAPONS.map(() => 0); // each weapon keeps its own magazine and its own cooldown
function setWeapon(i, quiet) {
  i = (i + WEAPONS.length) % WEAPONS.length; if (i === wi && !quiet) return;
  mags[wi] = ammo; cds[wi] = time + fireCd; wi = i; W = WEAPONS[i]; ammo = mags[i]; fireCd = Math.max(0, cds[i] - time); reloadT = 0; ads = 0;
  guns.forEach((g, k) => { g.visible = k === i; }); flash.position.z = guns[i].userData.fz; $('wName').textContent = W.name; paintHot();
  if (!quiet) { swapT = 0.3; tone('square', 320, 520, 0.05, 0.06); }
}
function refill() { WEAPONS.forEach((w, i) => { mags[i] = w.mag; cds[i] = 0; }); ammo = W.mag; reloadT = fireCd = swapT = 0; setAim(false); }
let queue = [], spawnT = 0, breakT = 0, time = 0, hurtA = 0, dirA = 0, dirAng = 0;

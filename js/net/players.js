// The other players' figures, what this page sends, spawning, shots from others.
'use strict';
const RG = { vest: new THREE.BoxGeometry(0.56, 0.7, 0.32), legs: new THREE.BoxGeometry(0.44, 0.78, 0.26), head: new THREE.SphereGeometry(0.2, 10, 8), gun: new THREE.BoxGeometry(0.08, 0.1, 0.6) };
function mkRemote(n) {
  const g = new THREE.Group(), mat = new THREE.MeshLambertMaterial({ color: 0xffffff }), dmat = darkMat.clone(); // own materials, so a player who has dropped out can be drawn see-through
  mk(RG.vest, mat, 0, 1.12, 0, g); mk(RG.legs, dmat, 0, 0.39, 0, g); mk(RG.head, mat, 0, 1.66, 0, g); mk(RG.gun, dmat, 0.22, 1.2, -0.4, g);
  const lamp = glow(0xffffff, 0.9); lamp.position.set(0, 1.95, 0); g.add(lamp);
  g.visible = false; scene.add(g);
  return { n, g, mat, dmat, lamp, ghost: false, away: false, x: 0, z: 0, yaw: 0, tx: 0, tz: 0, tyaw: 0, pitch: 0, py: 0, tpy: 0, y: 1.25, r: 0.6, alive: false, name: '', col: COL.steel, slot: -2, team: -1, mate: false,
    f: 0, d: 0, k: 0, hp: 100, lastShot: -9, fresh: true, last: null, tgt: { me: false, x: 0, y: 0, ey: 0, z: 0 } };
}
function dropRemote(n) { const r = remotes.get(n); if (!r) return; scene.remove(r.g); r.mat.dispose(); r.dmat.dispose(); r.lamp.material.dispose(); remotes.delete(n); }
// A player whose page has gone quiet (tab closed, reloading, line down, phone asleep) stays where they stood, drawn see-through, until they come back
// or the room lets their place go (a minute). Nobody is there to take a hit, so shots pass through them.
function ghostly(r, on) {
  if (r.ghost === on) return; r.ghost = on;
  for (const m of [r.mat, r.dmat, r.lamp.material]) { m.transparent = on || m === r.lamp.material; m.opacity = on ? 0.28 : m === r.lamp.material ? 0.9 : 1; m.depthWrite = !on; m.needsUpdate = true; }
}
function netSend(away) { // away: paused, or the tab is hidden. The player stays where they stand (and in versus can still be shot)
  const s = { g: R.g, x: +P.x.toFixed(2), z: +P.z.toFixed(2), y: +P.y.toFixed(2), yaw: +P.yaw.toFixed(3), pt: +P.pitch.toFixed(3),
    a: net.dead > 0 || net.pick ? 0 : 1, d: net.d, lk: net.lk, k: net.k, f: net.f, hp: Math.max(0, Math.ceil(P.hp)) };
  if (away) s.af = 1;
  if (pvp) { s.dm = net.dm; s.w = wi; }
  if (net.m.length) { s.m = net.m; net.m = []; }
  if (coop) {
    if (!net.ready || asleep()) s.nr = 1; // a hidden tab gets about one tick a second: too few to fly the drones
    if (net.dead > 0) s.dd = 1;
    if (net.auth) { // everything another page needs to show the drones, and to fly them on if this page drops out
      const r2 = v => Math.round(v * 100) / 100;
      s.w = wave; s.q = queue.map(t => TYPEK.indexOf(t)).join(''); s.sc = score; s.bk = r2(Math.max(0, breakT));
      s.e = enemies.map(e => [e.id, TYPEK.indexOf(e.type), r2(e.x), r2(e.y), r2(e.z), Math.ceil(e.hp), Math.ceil(e.max), e.ch, e.tgn]); // ch: a boss winding up or charging. tgn: whom it is after
      s.pk = pickups.map(p => [p.id, r2(p.x), r2(p.z), Math.ceil(p.life)]);
    }
    for (const k of ['ev', 'kx', 'bl', 'rh', 'pc']) if (net[k].length) { s[k] = net[k]; net[k] = []; }
    const h = Object.keys(net.hq); if (h.length) { s.h = h.map(id => [+id, Math.round(net.hq[id] * 10) / 10]); net.hq = {}; }
  }
  sockSend('S' + JSON.stringify(s), true);
}
function vsRespawn() { // in a two-team mode each team has its own half of the spawn points; then the one furthest from any rival
  const S = MAP.spawns, M = MODES[R.mode], t = teamOf(mySlot()), pool = M.teams === 2 && M.size > 1 ? S.filter((_, i) => i % 2 === t % 2) : S;
  const foes = liveRemotes.filter(r => !r.mate); let best = pool[Math.random() * pool.length | 0], bestD = -1;
  if (foes.length) for (const s of pool) { let m = 1e9; for (const r of foes) m = Math.min(m, Math.hypot(r.x - s[0], r.z - s[1])); if (m > bestD) { bestD = m; best = s; } }
  net.taken = {}; P.x = best[0]; P.z = best[1]; P.yaw = Math.atan2(P.x, P.z); P.y = 0; P.vy = 0; P.ey = EYEH; P.pitch = 0; P.hp = 100; setWeapon(pickI, true); refill(); net.dead = 0; hurtA = 0; pickEl.hidden = true;
}
function coopSpawn() { // side by side at the map's start, a step apart by slot
  const s = Math.max(0, mySlot()), [sx, sz] = MAP.start;
  P.x = sx + ((s % 4) - 1.5) * 1.3; P.z = sz + (s >= 4 ? 1.5 : 0); P.y = 0; P.vy = 0; P.ey = EYEH; P.yaw = 0; P.pitch = 0; P.hp = 100;
  pushOut(P, 0.5, 0.3, 1.8); P.x = clamp(P.x, -LX, LX); P.z = clamp(P.z, -LZ, LZ); refill(); net.dead = 0; hurtA = 0; pickEl.hidden = true;
}
function coopDown() { // down in co-op: wait for the others to finish the wave
  net.dead = Infinity; net.d++; setAim(false); killLog('ドローン', COL.alarm, myName, myCol());
  pickShow('倒された', remotes.size ? '仲間が今の波を制圧すると復帰する' : 'ほかに誰もいない', true); sfx.boom(); net.sendT = 0;
}
function vsRemoteShot(r) {
  r.lastShot = time;
  const cp = Math.cos(r.pitch), dx = -Math.sin(r.yaw) * cp, dy = Math.sin(r.pitch), dz = -Math.cos(r.yaw) * cp, oy = r.py + 1.5;
  let t = 160; if (dy < -1e-4) t = Math.min(t, -oy / dy); // drawn as far as the longest reach (the SR's)
  for (const b of hard) { const tb = rayBox(r.x, oy, r.z, dx, dy, dz, b, t); if (tb >= 0) t = tb; }
  const mx = r.x + dx * 0.8, my = oy + dy * 0.8, mz = r.z + dz * 0.8, hx = r.x + dx * t, hy = oy + dy * t, hz = r.z + dz * t;
  const tr = tracers[tracerI = (tracerI + 1) % tracers.length];
  tr.m.position.set((mx + hx) / 2, (my + hy) / 2, (mz + hz) / 2); tr.m.lookAt(hx, hy, hz); tr.m.scale.z = Math.max(0.1, t - 0.8); tr.m.visible = true; tr.life = 0.06;
  fx(mx, my, mz, 0.8, '#ffc46b', 0.06);
  if (Math.hypot(r.x - P.x, r.z - P.z) < 45) noise(0.07, 3000, 500, 0.07);
}

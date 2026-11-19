// Drone waves: which come, when a wave is cleared, starting over.
'use strict';
const isBossWave = n => coop || (n >= BOSS_FROM && n % BOSS_EVERY === 0);
// which boss: in co-op the four take turns from wave 1; alone the overseer comes first on wave 20, then the others every fifth wave
const bossFor = n => coop ? BOSSES[(n - 1) % 4] : ['boss', 'spread', 'charge', 'sniper'][((n - BOSS_FROM) / BOSS_EVERY | 0) % 4];
const crowd = () => coop ? 1 + remotes.size : 1; // players facing the drones
const TWIN_FROM = 13; // co-op: from this wave on, two different bosses picked at random each wave
function waveAnnounce(n, bs) { // bs: the bosses of this wave (the flying page picks them and passes them on)
  announce(`第${n}波`, bs && bs.length ? bs.map(b => TYPES[b].name).join('と') + 'が接近中' : n === 2 ? '突撃機に注意　近づく前に撃て' : n === 4 ? '重装機が接近中' : 'ドローン接近'); sfx.wave();
}
function startWave(n) {
  wave = n; queue = [];
  // a boss wave alone: the boss and a few escorts. In co-op: the boss and six tenths of an ordinary wave (two bosses and two thirds of that from wave 13); every extra player brings half a wave more
  const boss = isBossWave(n), np = crowd(), plain = Math.min(Math.round(Math.min(4 + n, 24) * (1 + 0.5 * (np - 1))), 48), twin = coop && n >= TWIN_FROM;
  const count = !boss ? plain : coop ? Math.max(2, Math.round(plain * 0.6 * (twin ? 2 / 3 : 1))) : 6 + 2 * (np - 1);
  const bs = !boss ? [] : twin ? BOSSES.slice().sort(() => Math.random() - 0.5).slice(0, 2) : [bossFor(n)];
  queue.push(...bs);
  for (let i = 0; i < count; i++) queue.push((!boss || coop) && n >= 4 && i % 6 === 5 ? 'heavy' : n >= 2 && Math.random() < Math.min(0.133 + n * 0.0083, 0.3) ? 'ram' : 'scout');
  spawnT = 1.2; waveAnnounce(n, bs); if (coop) net.ev.push(['w', n, ...bs.map(b => TYPEK.indexOf(b))]);
}
function waveClear(n) { // the wave is down: everyone standing gets 20 back, and in co-op the fallen come back
  if (coop && net.dead > 0) { coopSpawn(); announce(`第${n}波 制圧`, '復帰した'); sfx.pick(); net.sendT = 0; }
  else { P.hp = Math.min(100, P.hp + 20); announce(`第${n}波 制圧`, `ボーナス +${n * 100}　体力 +20`); }
}
function clearField() {
  while (enemies.length) killEnemy(enemies[0], true);
  bolts.forEach(b => { b.on = false; b.m.visible = false; });
  pickups.forEach(p => scene.remove(p.m)); pickups.length = 0; queue = [];
}
function resetGame() {
  clearField();
  P.x = MAP.start[0]; P.z = MAP.start[1]; P.y = 0; P.vy = P.vx = P.vz = 0; P.onIce = false; P.ey = EYEH; P.yaw = 0; P.pitch = 0; P.hp = 100; score = 0; refill(); breakT = 0; hurtA = 0; dirA = 0;
  startWave(Math.max(1, Math.min(99, +new URLSearchParams(location.search).get('wave') | 0))); // ?wave=20 starts there, for trying a later wave
}

// The HUD: announcements and the damage numbers.
'use strict';
const hudEl = { hpNum: $('hpNum'), hpFill: $('hpFill'), wave: $('waveNum'), left: $('leftNum'), score: $('score'), ammo: $('ammo'), cross: $('cross'), hit: $('hit'), hurt: $('hurt'), dmg: $('dmgDir'), ann: $('announce'), bossRow: $('bossRow'), bossFill: $('bossFill'), bossName: $('bossName'), bossName2: $('bossName2'), bossBar2: $('bossBar2'), bossFill2: $('bossFill2') };
function announce(big, small) { const a = hudEl.ann; a.innerHTML = ''; a.append(big); if (small) { const s = document.createElement('small'); s.textContent = small; a.append(s); } a.classList.remove('show'); void a.offsetWidth; a.classList.add('show'); }
/* damage numbers: one per target, at the last point hit, rising and fading. Hits on the same target within half a second add up,
   so a burst reads as one growing number (and a shotgun's pellets as one). Gold when the head was in it. */
const DN_LIFE = 0.9, dnums = [], v3 = new THREE.Vector3();
for (let i = 0; i < 10; i++) { const el = document.createElement('div'); el.className = 'dnum'; el.style.display = 'none'; $('hud').append(el); dnums.push({ el, key: null, v: 0, life: 0, x: 0, y: 0, z: 0, hd: false }); }
function dmgNum(key, v, x, y, z, head) {
  if (!cfg.dmgo || !(v > 0)) return;
  let d = dnums.find(d => d.key === key && d.life > DN_LIFE - 0.5);
  if (d) d.v += v; else { d = dnums.reduce((a, b) => (b.life < a.life ? b : a)); d.key = key; d.v = v; d.hd = false; }
  d.life = DN_LIFE; d.x = x; d.y = y; d.z = z; d.hd = d.hd || head;
  d.el.textContent = Math.max(1, Math.round(d.v)); d.el.classList.toggle('hd', d.hd);
}
function drawDmgNums(dt) {
  for (const d of dnums) {
    if (d.life <= 0) continue;
    d.life -= dt; v3.set(d.x, d.y, d.z).project(camera);
    if (d.life <= 0 || v3.z > 1 || !cfg.dmgo) { d.life = 0; d.key = null; d.el.style.display = 'none'; continue; }
    const age = DN_LIFE - d.life, px = (v3.x + 1) / 2 * innerWidth, py = (1 - v3.y) / 2 * innerHeight - 16 - age * 44, s = age < 0.1 ? 1.3 - age * 3 : 1;
    d.el.style.display = ''; d.el.style.opacity = cfg.dmgo / 100 * Math.min(1, d.life / 0.3);
    d.el.style.transform = `translate(${px.toFixed(1)}px,${py.toFixed(1)}px) translate(-50%,-50%) scale(${s.toFixed(2)})`;
  }
}

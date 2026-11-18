// The five weapons: damage, spread, magazine, sound and the shape of the model.
'use strict';
// dmg: per pellet against drones, pd: against rivals. fo: full damage out to r0, falling to the share m at r1.
// sp: hip spread in radians, the full width of the cone the shots fall in evenly, which the reticle draws (the same against drones and rivals), as: the share of it left when aiming. ar: how fast the aim comes up. model: body, barrel, barrel radius, magazine height and width, stock.
const WEAPONS = [
  { name: 'SMG', tip: '連射最速・近距離', mag: 36, cd: 0.065, dmg: 8, pd: 9, n: 1, sp: 0.1, as: 0.33, fo: [12, 30, 0.5], rl: 1.1, zoom: 1.25, ar: 12, mv: 1.08, kick: 0.7, snd: [0.06, 6500, 1200, 0.16, 280], model: [0.34, 0.12, 0.014, 0.18, 0.036, 0] },
  { name: 'AR', tip: '標準・中距離', mag: 30, cd: 0.105, dmg: 12, pd: 14, n: 1, sp: 0.05, as: 0.17, fo: [30, 70, 0.75], rl: 1.4, zoom: 1.5, ar: 9, mv: 1, kick: 1, snd: [0.09, 5200, 700, 0.22, 190], model: [0.42, 0.3, 0.014, 0.14, 0.04, 0.14] },
  { name: 'SR', tip: '一発が重い・狙って撃つ', range: 160, mag: 5, cd: 1.2, dmg: 130, pd: 72, n: 1, sp: 0.2, as: 0, fo: [999, 1000, 1], rl: 2.2, zoom: 4, ar: 4.5, mv: 0.95, kick: 3, scope: true, snd: [0.28, 3800, 200, 0.4, 120], model: [0.46, 0.5, 0.013, 0.08, 0.04, 0.2] },
  { name: 'LMG', tip: '80発・足が遅い', mag: 80, cd: 0.095, dmg: 12, pd: 13, n: 1, sp: 0.11, as: 0.26, fo: [30, 70, 0.7], rl: 3.4, zoom: 1.4, ar: 5, mv: 0.82, kick: 1.2, snd: [0.1, 4200, 500, 0.24, 150], model: [0.5, 0.34, 0.017, 0.1, 0.1, 0.16] },
  { name: 'SG', tip: '散弾・至近距離', mag: 6, cd: 0.8, dmg: 9, pd: 13, n: 8, sp: 0.17, as: 0.56, fo: [7, 20, 0.25], rl: 2, zoom: 1.2, ar: 9, mv: 1, kick: 2.4, snd: [0.22, 2600, 180, 0.42, 110], model: [0.4, 0.4, 0.021, 0, 0, 0.16] }
];

// Rooms: the server address, the modes, team colours, and the room as the server last described it.
'use strict';
/* Rooms.
   A room server (server/ in this repository, run on Cloudflare) keeps who is in each 4-digit room, the host, the mode, the map and the slots.
   In a match each page sends its own state about ten times a second, and the server hands it to the others as it is.
   Hits are judged by the shooter; a page applies the damage it is told it took. In co-op one page flies the drones for everyone. */
const NETCONF = window.PIER9_NET || {};
const SERVER = String(NETCONF.server || '').trim().replace(/^http/i, 'ws').replace(/\/+$/, '');
const MODES = [
  { name: '1v1v…', teams: 8, size: 1, note: '個人戦。自分以外は全員が敵。8人まで。' },
  { name: '2v2v…', teams: 4, size: 2, note: '2人1組のチーム戦。4チーム（8人）まで。味方の弾は当たらない。' },
  { name: '3v3', teams: 2, size: 3, note: '3人ずつ2チームのチーム戦。味方の弾は当たらない。' },
  { name: '4v4', teams: 2, size: 4, note: '4人ずつ2チームのチーム戦。味方の弾は当たらない。' },
  { name: '協力', teams: 1, size: 8, coop: true, note: '全員でドローンの波を迎え撃つ。倒れた人は、その波を制圧すると復帰。全員倒れたら終わり。8人まで。' }
];
const COLORS = [['橙', '#ff8a3d'], ['青緑', '#27d3b8'], ['桃', '#ff5fa2'], ['黄', '#ffe14d'], ['青', '#4d9bff'], ['白', '#f2f5f0'], ['紫', '#b98cff'], ['緑', '#8fdc4a']];
// the room as the server last described it. ps: one [number, name, slot, connected, in the match] per member
const R = { code: '', you: 0, host: 0, mode: 0, map: 0, phase: 'lobby', g: 0, ps: [], last: null, lim: 0, endAt: 0 }; // endAt: when a versus match runs out of time (performance.now(); 0: no limit known) // lim: kills that win a versus match (0: endless; null: the server predates it)
const teamPlay = () => { const M = MODES[R.mode]; return !M.coop && M.size > 1; };
const teamOf = slot => slot < 0 ? -1 : Math.floor(slot / MODES[R.mode].size);
const slotCol = slot => slot < 0 ? COL.steel : COLORS[(teamPlay() ? teamOf(slot) : slot) % COLORS.length][1]; // a team shares its colour; otherwise each slot has its own
const teamName = t => 'チーム' + ('ABCD'[t] || '');
const member = n => R.ps.find(p => p[0] === n) || null;
const mySlot = () => { const p = member(R.you); return p ? p[2] : -1; };
const myCol = () => slotCol(mySlot());
const num = v => typeof v === 'number' && isFinite(v) ? v : 0, clamp = (v, a, b) => Math.max(a, Math.min(b, v));

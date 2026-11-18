// The standings table.
'use strict';
// Standings: most kills first, then fewest deaths. Equal kills share a rank. In a team mode the teams come first, each with its players under it.
function standings() {
  const all = [{ n: myName, c: myCol(), k: net.k, d: net.d, me: 1, t: teamOf(mySlot()) }];
  for (const r of remotes.values()) all.push({ n: r.name, c: r.col, k: r.k, d: r.d, me: 0, t: r.team });
  all.sort((a, b) => b.k - a.k || a.d - b.d || b.me - a.me); for (const r of all) r.rk = 1 + all.filter(o => o.k > r.k).length;
  return all;
}
function boardRows(all, limit, tp) { // limit: rows on the small board in play. When there are more players than rows, the last row is always our own
  if (!tp) { let rows = all; if (all.length > limit) { rows = all.slice(0, limit); if (!rows.some(r => r.me)) rows[limit - 1] = all.find(r => r.me); } return rows; }
  const T = new Map(); for (const r of all) { let t = T.get(r.t); if (!t) T.set(r.t, t = { team: r.t, k: 0, d: 0, ps: [] }); t.k += r.k; t.d += r.d; t.ps.push(r); }
  const ts = [...T.values()].sort((a, b) => b.k - a.k || a.d - b.d); for (const t of ts) t.rk = 1 + ts.filter(o => o.k > t.k).length;
  const rows = []; for (const t of ts) { rows.push(t); for (const p of t.ps) if (limit > 8 || p.me) rows.push(p); } // the small board: each team's total and our own line
  return rows;
}
function drawBoard(el, all, rows, co) {
  const sig = all.length + '|' + (co ? 1 : 0) + '|' + rows.map(r => r.ps ? ['T', r.team, r.rk, r.k, r.d].join(',') : [r.rk, r.n, r.c, r.k, r.d, r.me].join(',')).join('|'); if (el._sig === sig) return false; el._sig = sig;
  const cell = (tr, tag, cls, text) => { const c = document.createElement(tag); c.className = cls; c.textContent = text; tr.append(c); return c; };
  const small = el === vsBoardEl, head = document.createElement('tr'), cols = document.createElement('colgroup');
  for (const c of ['rk', 'nm', 'k', 'd']) { const x = document.createElement('col'); x.className = c; cols.append(x); } // fixed widths, so the small board does not jump as names change
  const goal = !co && R.lim > 0 ? `・${R.lim}キル先取` : ''; cell(head, 'th', '', small ? `${all.length}人${goal}` : `順位（${all.length}人）${goal}`).colSpan = 2; cell(head, 'th', '', co ? '撃墜' : '撃破'); cell(head, 'th', '', co ? '倒れた' : '被撃破');
  el.textContent = ''; el.append(cols, head);
  for (const r of rows) {
    const tr = document.createElement('tr'), dot = document.createElement('i');
    if (r.ps) { tr.className = 'tm'; cell(tr, 'td', 'rk', r.rk); const nm = cell(tr, 'td', 'nm', ''), b = document.createElement('b'); b.textContent = teamName(r.team); dot.style.background = COLORS[Math.max(0, r.team) % COLORS.length][1]; nm.append(dot, b); cell(tr, 'td', 'k', r.k); cell(tr, 'td', 'd', r.d); }
    else { if (r.me) tr.className = 'me'; cell(tr, 'td', 'rk', rows.some(o => o.ps) ? '' : r.rk); const nm = cell(tr, 'td', 'nm', r.n); dot.style.background = r.c; nm.prepend(dot); cell(tr, 'td', 'k', r.k); cell(tr, 'td', 'd', r.d); }
    el.append(tr);
  }
  return true;
}
function vsBoard(el, limit) { const all = standings(); return drawBoard(el, all, boardRows(all, limit, teamPlay()), coop); }

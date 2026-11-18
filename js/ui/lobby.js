// The room screen, and making or joining a room from the title screen.
'use strict';
/* the room screen */
function segPaint(seg, v, ro) { seg.classList.toggle('ro', ro); seg.querySelectorAll('button').forEach(b => { b.setAttribute('aria-pressed', String(+b.dataset.v === v)); b.disabled = ro; }); }
function lobbyPaint() {
  if (state !== 'lobby') return;
  const M = MODES[R.mode], host = R.you === R.host, play = R.phase === 'play', mine = mySlot(), hostP = member(R.host);
  $('lbCode').textContent = R.code || '----';
  segPaint($('lbMode'), R.mode, !host || play); segPaint($('lbMap'), R.map, !host || play);
  $('lbModeNote').textContent = M.note;
  // the win condition (versus only): endless, or a kill count the host types in
  const old = R.lim === null, lim = R.lim || 0, limEl = $('lbLim');
  $('lbWinRow').hidden = !!M.coop; segPaint($('lbWin'), lim > 0 ? 1 : 0, !host || play || old);
  limEl.hidden = !(lim > 0); limEl.disabled = !host || play; if (document.activeElement !== limEl) limEl.value = lim || '';
  $('lbWinNote').hidden = !!M.coop;
  $('lbWinNote').textContent = old ? (host ? 'ルームサーバーが古いため、勝利条件は選べません（エンドレスのみ）。README の手順で server をデプロイし直すと使えます。' : '')
    : lim > 0 ? (teamPlay() ? `チームの合計が ${lim} キルに届いたチームの勝ち。` : `${lim} キルに届いた人の勝ち。`) + '決着したら全員ルームに戻ります。1時間で決着しなければ、そこで終わります。'
    : 'キル上限なし。ホストが「試合を終える」を押すか、始まってから1時間で終わります。';
  const by = new Map(); for (const p of R.ps) if (p[2] >= 0) by.set(p[2], p);
  const box = $('lbTeams'); box.textContent = '';
  const groups = M.size === 1 || M.coop ? [{ label: M.coop ? '協力' : '個人戦', from: 0, n: M.teams * M.size, col: '' }]
    : Array.from({ length: M.teams }, (_, t) => ({ label: teamName(t), from: t * M.size, n: M.size, col: COLORS[t][1] }));
  for (const gp of groups) {
    const div = document.createElement('div'), h = document.createElement('h3'), cnt = document.createElement('span');
    div.className = 'team'; if (gp.col) div.style.setProperty('--tc', gp.col);
    let used = 0; for (let s = gp.from; s < gp.from + gp.n; s++) if (by.has(s)) used++;
    h.textContent = gp.label; cnt.textContent = used >= gp.n ? `${used}/${gp.n} 満員` : `${used}/${gp.n}`; h.append(cnt); div.append(h);
    for (let s = gp.from; s < gp.from + gp.n; s++) {
      const p = by.get(s), b = document.createElement('button'), dot = document.createElement('i'), nm = document.createElement('span');
      b.type = 'button'; b.className = 'slot'; nm.className = 'nm'; b.style.setProperty('--sc', slotCol(s)); b.append(dot, nm);
      const tag = t => { const x = document.createElement('small'); x.textContent = t; b.append(x); };
      if (p) {
        const me = p[0] === R.you; b.classList.add('taken'); if (me) b.classList.add('me'); if (!p[3]) b.classList.add('off'); nm.textContent = p[1];
        if (p[0] === R.host) tag('ホスト'); if (me) tag('あなた'); if (!p[3]) tag('再接続待ち'); else if (play && p[4]) tag('試合中');
        b.disabled = !me; if (me) { b.title = '押すと枠から出る'; b.addEventListener('click', () => roomOp({ t: 'slot', s: -1 })); }
      } else { nm.textContent = '空き'; b.title = 'この枠に入る'; b.addEventListener('click', () => roomOp({ t: 'slot', s })); }
      div.append(b);
    }
    box.append(div);
  }
  const wait = R.ps.filter(p => p[2] < 0), w = $('lbWait'); w.textContent = '';
  if (wait.length) { w.append('枠に入っていない人：'); wait.forEach((p, i) => { const b = document.createElement('b'); b.textContent = p[1]; if (i) w.append('、'); w.append(b); }); }
  else w.append(R.ps.length > 1 ? `全員（${R.ps.length}人）が枠に入っています。` : 'まだあなただけです。招待リンクかルーム番号を送ってください。');
  const ready = R.ps.some(p => p[2] >= 0 && p[3]);
  $('lbHostRow').hidden = !host || play; $('lbStart').disabled = !ready;
  $('lbJoin').hidden = !(play && mine >= 0); $('lbEnd').hidden = !(play && host);
  lbNote.textContent = (idleNote && play && mine >= 0 ? idleNote + ' ' : '') + (play ? (mine >= 0 ? '試合中です。「試合に参加する」で途中から入れます。' : '試合中です。空いている枠に入ると、途中から参加できます。')
    : host ? (ready ? 'あなたがホストです。モード・マップ・勝利条件を選んで「開始」。枠に入っている人が試合に出ます。「ランダム」で全員をランダムに振り分けます。' : 'あなたがホストです。だれかが枠に入ると開始できます。')
    : `モード・マップ・勝利条件・ランダム・開始は、ホストの ${hostP ? hostP[1] : '？'} さんが決めます。空いている枠を押すと入れます。`);
  // the last match
  const lb = $('lbLastBox'), co = R.last && R.last.co, L = lastStand; let text = '';
  if (co) text = `${co === 1 ? '全滅' : '終了'}　第${num(R.last.w) | 0}波まで　得点 ${num(R.last.sc) | 0}`;
  else if (R.last && R.last.v === 'win') text = winText(R.last);
  else if (L && L.coop) text = `終了　第${L.wave}波まで　得点 ${L.score}`;
  else if (L && L.all.length) {
    if (L.tp) { const rows = boardRows(L.all, 99, true).filter(r => r.ps), top = rows.filter(r => r.rk === 1); text = top.length > 1 ? '引き分け' : `${teamName(top[0].team)}の勝ち`; }
    else text = '1位：' + L.all.filter(r => r.rk === 1).map(r => r.n).join('・');
  }
  if (R.last && R.last.v === 'time') text = '時間切れ（1時間）' + (text ? '　' + text : '');
  lb.hidden = !text; $('lbLastText').textContent = text; $('lbLast').hidden = !L;
  if (L) { $('lbLast')._sig = ''; drawBoard($('lbLast'), L.all, boardRows(L.all, 99, L.tp), L.coop); }
}
$('lbMode').addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) roomOp({ t: 'mode', v: +b.dataset.v }); });
$('lbMap').addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) roomOp({ t: 'map', v: +b.dataset.v }); });
let limPick = 30; // the count the box offers when the host turns kill counting on
$('lbWin').addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) roomOp({ t: 'lim', v: +b.dataset.v ? limPick : 0 }); });
const limSend = () => { const el = $('lbLim'), v = clamp(Math.round(+el.value) || 0, 1, 999); el.value = v; limPick = v; if (v !== R.lim) roomOp({ t: 'lim', v }); };
$('lbLim').addEventListener('change', limSend);
$('lbLim').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); limSend(); $('lbLim').blur(); } });
$('lbRand').addEventListener('click', () => roomOp({ t: 'rand' }));
$('lbStart').addEventListener('click', () => { audioInit(); roomOp({ t: 'start' }); });
$('lbJoin').addEventListener('click', () => matchEnter());
const endMatch = () => roomOp({ t: 'end', res: coop ? { co: 2, w: wave, sc: score } : null });
$('lbEnd').addEventListener('click', endMatch); $('endBtn').addEventListener('click', endMatch);
$('lbLeave').addEventListener('click', () => leaveRoom());
$('lbCopy').addEventListener('click', () => {
  const url = location.origin + location.pathname + '#' + R.code;
  (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => { lbNote.textContent = '招待リンクをコピーしました。開くとルーム番号が入った状態になります。'; }, () => { lbNote.textContent = '招待リンク： ' + url; });
});
$('quitBtn').addEventListener('click', () => { if (online) { matchExit(false); show('lobby'); } else { clearField(); show('menu'); } });

/* the title screen: make a room, or join one by its number */
const mkBtn = $('mkRoom'), joinBtn = $('joinRoom'), joinRow = $('joinRow'), joinCode = $('joinCode');
const homeNote = () => SERVER ? '「ルームを作る」と4桁の番号が出ます。ほかの人はその番号を「ルームに参加」で入れると、同じルームに入れます。'
  : 'ルームは未設定です。config.js の server にルームサーバーの URL を入れると使えます（README の「ルームサーバーの用意」）。';
const ERR = { nf: c => `ルーム ${c} は見つかりません。番号を確かめてください。`, full: c => `ルーム ${c} は満員です（8人まで）。`, bad: () => '名前を確かめてください。',
  taken: () => '空いている番号が見つかりませんでした。もう一度押してください。', net: () => 'ルームサーバーに接続できませんでした。通信状況を確かめてください。' };
let busy = false;
const busyOn = v => { busy = v; mkBtn.disabled = joinBtn.disabled = $('joinGo').disabled = v || !SERVER; };
function enterLobby() { lastStand = null; try { history.replaceState(null, '', '#' + R.code); } catch (_) {} vsNote.textContent = homeNote(); show('lobby'); loadMap(R.map); lobbyPaint(); }
mkBtn.addEventListener('click', async () => {
  audioInit(); if (busy || !SERVER || !needName()) return;
  busyOn(true); vsNote.textContent = 'ルームを作っています…'; let err = 'taken';
  for (let i = 0; i < 6 && err === 'taken'; i++) { seenG = -1; try { await connect(String(1000 + (Math.random() * 9000 | 0)), 'create'); err = ''; } catch (e) { err = e; } } // a number already in use: try another
  busyOn(false); if (err) { vsNote.textContent = (ERR[err] || ERR.net)(''); return; }
  enterLobby();
});
joinBtn.addEventListener('click', () => { joinRow.hidden = !joinRow.hidden; if (!joinRow.hidden) joinCode.focus(); });
joinCode.addEventListener('input', () => { joinCode.value = joinCode.value.replace(/\D/g, '').slice(0, 4); });
joinRow.addEventListener('submit', e => {
  e.preventDefault(); const code = joinCode.value.replace(/\D/g, ''); if (code.length !== 4) { vsNote.textContent = '4桁のルーム番号を入れてください。'; joinCode.focus(); return; }
  joinRoom(code);
});
async function joinRoom(code, back) { // by number, or from the room list. back: the seat saved before the page was closed or reloaded
  if (!back) audioInit(); if (busy || !SERVER || !needName()) return;
  busyOn(true); vsNote.textContent = back ? `ルーム ${code} に戻っています…` : `ルーム ${code} に接続しています…`; seenG = -1;
  try { await connect(code, 'join'); } catch (err) { busyOn(false); if (back) seatDrop(); vsNote.textContent = back ? (err === 'nf' ? `ルーム ${code} はもうありません。` : `ルーム ${code} に戻れませんでした。`) : (ERR[err] || ERR.net)(code); return; }
  busyOn(false); enterLobby();
  const me = member(R.you);
  if (back && me && me[4] && R.phase === 'play' && back.g === R.g) { // still in that match: straight back to where we stood, paused until a tap (sound and the mouse need one)
    matchEnter(back); pause(); $('lead').textContent = '再読み込みする前の場所に戻りました。「再開する」で続きから。' + $('lead').textContent;
  }
}
busyOn(false); vsNote.textContent = homeNote();

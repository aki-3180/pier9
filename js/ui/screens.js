// Switching screens: title, pause, game over, the room screen.
'use strict';
let wakeLock = null;
function titleText() { $('eyebrow').textContent = (MAP.day ? '日勤警備 ／ ' : '夜勤警備 ／ ') + MAP.tag; $('lead').textContent = MAP.lead; }
function show(mode) {
  state = mode; const B = document.body, menu = mode === 'menu';
  B.classList.remove('editing'); B.classList.toggle('playing', mode === 'play'); B.classList.toggle('vs', pvp); B.classList.toggle('online', online);
  overlay.hidden = mode === 'play' || mode === 'lobby'; lobbyEl.hidden = mode !== 'lobby';
  $('nameRow').hidden = $('mapRow').hidden = $('roomBtns').hidden = $('vsNote').hidden = !menu; if (!menu) $('joinRow').hidden = true;
  $('quitBtn').hidden = menu || mode === 'play' || mode === 'lobby'; $('quitBtn').textContent = online ? 'ルームに戻る' : 'タイトルへ戻る';
  $('endBtn').hidden = !(mode === 'pause' && online && R.you === R.host); $('vsTable').hidden = !(mode === 'pause' && online);
  if (menu) { titleText(); $('heading').innerHTML = '第九<span>埠頭</span>'; $('lead').hidden = false; $('stats').hidden = true; $('go').textContent = '勤務開始'; }
  if (mode === 'pause') {
    $('eyebrow').textContent = online ? `ルーム ${R.code} ／ ${MODES[R.mode].name} ／ ` + (coop ? `第${wave}波 ／ 得点 ${score}` : `撃破 ${net.k} ／ 被撃破 ${net.d}` + (R.lim > 0 ? ` ／ ${R.lim}キル先取` : '') + (R.endAt ? ` ／ 残り${Math.max(1, Math.ceil((R.endAt - performance.now()) / 60000))}分` : '')) : `第${wave}波 ／ 得点 ${score}`;
    $('heading').textContent = online ? '離席中' : '一時停止';
    $('lead').hidden = !online; if (online) { $('lead').textContent = pvp ? '離席中もその場に残ります。相手からは見えていて、撃たれると倒されます。' : '離席中もその場に残り、ドローンは動き続けます。離席中は狙われず、撃たれません。'; vsBoard($('vsTable'), 99); }
    $('stats').hidden = true; $('go').textContent = '再開する';
  }
  if (mode === 'over') { $('eyebrow').textContent = score >= best && score > 0 ? '自己最高を更新' : (MAP.day ? '日勤警備 ／ ' : '夜勤警備 ／ ') + MAP.tag; $('heading').textContent = '勤務終了'; $('lead').hidden = true; $('stats').hidden = false;
    $('stScore').textContent = score; $('stWave').textContent = `第${wave}波`; $('stBest').textContent = best; $('go').textContent = 'もう一度'; }
  if (mode === 'lobby') lobbyPaint();
  homeChat();
}
function pause() { if (state !== 'play') return; chatClose(); if (document.pointerLockElement) document.exitPointerLock(); firing = mouseFire = false; show('pause'); if (online) net.sendT = 0; }
function gameOver() { // one record per map
  if (score > best) { best = score; store.set('best' + (mapI || ''), best); } if (document.pointerLockElement) document.exitPointerLock(); firing = mouseFire = false; sfx.boom(); show('over'); }
const keepAwake = () => { if (navigator.wakeLock && !wakeLock) navigator.wakeLock.request('screen').then(w => { wakeLock = w; w.addEventListener('release', () => { wakeLock = null; }); }).catch(() => {}); };
$('go').addEventListener('click', () => {
  audioInit();
  if (state !== 'pause') { online = pvp = coop = false; resetGame(); }
  show('play'); keepAwake(); inputAt = performance.now();
});
$('pauseBtn').addEventListener('click', pause);
loadMap(cfg.map); titleText();
const paintMap = bindSeg('mapSeg', 'map', () => { loadMap(cfg.map); titleText(); }); // the title screen flies over whichever map is chosen
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

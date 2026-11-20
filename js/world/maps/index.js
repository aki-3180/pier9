// The list of maps (names, spawns, title camera) and switching between them.
'use strict';
const MAPS = [
  { name: 'コンテナ場', tag: '9番バース', lead: '深夜のコンテナヤードで、警備ドローンが暴走した。波状に押し寄せる機体をすべて停止させ、朝まで持ち場を守れ。', build: buildYard,
    sides: [0, 1, 2, 3], start: [0, 4], cam: [9, 3.2, 0, 2, -0.02], spawns: [[-26, -26], [26, 26], [-26, 26], [26, -26], [8, -27], [-12, 27], [-27, 8], [27, 0]] },
  { name: '倉庫街', tag: '倉庫街', lead: '埠頭の裏手、倉庫と引き込み線と船揚げ場が並ぶ一角でも、警備ドローンが暴走した。倉庫、管理棟、岸壁の三本の道を使い分けて、朝まで持ち場を守れ。', build: buildDepot,
    sides: [0, 1, 3], start: [-3, 33], cam: [13, 7.5, -2, 0, -0.3], spawns: [[-22, -35], [17, 35], [-22, 35], [15.5, -36], [-3, -36], [1, 36], [25, 11], [-24, -11]] }, // drones come over the walls and in from the sea, not through the warehouse roof
  { name: '魚市場', tag: '魚市場', day: true, lead: '昼の魚市場にも、暴走したドローンが入り込んだ。狭い競り場の真ん中を取るか、二階の窓から見下ろすか。逃げ場は少ない。', build: buildMarket,
    sides: [0, 1, 2, 3], start: [0, 20], cam: [12, 9, 0, 0, -0.42], spawns: [[-8, -21], [8, 21], [8, -21], [-8, 21], [-17, -18], [17, 18], [0, -22], [0, 22]] },
  { name: '横丁', tag: '九番横丁', lead: '埠頭の裏の飲み屋横丁にも、暴走したドローンが入り込んだ。見通しは利かない。角を曲がれば、もう目の前だ。', build: buildAlley,
    sides: [0, 1, 2, 3], start: [1.2, 14.4], cam: [9, 9.5, 0, 0, -0.62], spawns: [[-14.9, -14.4], [14.9, 14.4], [14.9, -14.4], [-14.9, 14.4], [-1.2, -14.4], [1.2, 14.4], [14.8, 0], [-14.8, 0]] },
  { name: '上屋', tag: '九番上屋', day: true, env: 'hall', fly: 8.6, lead: '埠頭の古い上屋（荷さばきの倉庫）にも、暴走したドローンが高窓から入り込んだ。真ん中の足場に上がるか、車の陰で待つか。屋根の下では逃げ場がない。', build: buildHall,
    sides: [0, 1, 2, 3], start: [0, 24.5], cam: [8, 7.5, 0, 0, -0.4], spawns: [[-6, -24.5], [6, 24.5], [8, -24.5], [-8, 24.5], [-15.6, -12], [15.6, 12], [0, -25.5], [0, 25.5]] }, // fly: the drones come in at the high windows and stay under the roof
  { name: '突堤', tag: '九番突堤', env: 'dusk', lead: '夕暮れの長い突堤。岸壁は端から端まで見通せる。見張所の窓から撃ち抜くか、上屋の陰を抜けて詰めるか。', build: buildJetty,
    sides: [0, 1, 2, 3], start: [-14, 55], cam: [18, 9, -6, 0, -0.25], spawns: [[-14, -55], [-14, 55], [12, -55], [12, 55], [-21, -52], [-21, 52], [-3, -58.2], [-3, 58.2]] },
  { name: 'サイロ', tag: '九番サイロ', day: true, env: 'morning', lead: '朝の穀物ふ頭。広く、遠くまで見通せる。網目の高架通路から見下ろすか、サイロの脚のあいだを抜けるか。網の上に立てば、下からも丸見えだ。', build: buildSilo,
    sides: [0, 1, 2, 3], start: [-4, 43], cam: [24, 12, -4, 4, -0.22], spawns: [[-17, -44], [-17, 44], [5, -45], [5, 45], [22, -44], [22, 44], [-6.5, -40.2], [-6.5, 40.2]] },
  { name: '聖夜', tag: '九番埠頭 聖夜市', env: 'snow', lead: 'クリスマスの夜、凍った港の両岸に市が立った。氷の上は足が止まらない。島のツリーを回り込むか、屋台の屋根を伝うか、かまくらの入口で待つか。', build: buildSnow,
    sides: [0, 1, 2, 3], start: [-12, 40], cam: [26, 13, 0, 0, -0.3], spawns: [[-34.5, -40.5], [34.5, 40.5], [-12, -40], [12, 40], [12, -40], [-12, 40], [26, -40], [-26, 40]] }
];
function loadMap(i) {
  i = MAPS[i] ? i : 0; const m = MAPS[i];
  if (!m.g) { m.build(m); scene.add(m.g); }
  if (MAP) MAP.g.visible = false;
  MAP = m; mapI = i; m.g.visible = true; setEnv(ENV[m.env || (m.day ? 'day' : 'night')]); boxes = m.boxes; hard = m.hard; LX = m.lx; LZ = m.lz; best = store.get('best' + (i || ''), 0);
}
if (document.fonts && document.fonts.load) Promise.all(['Dela Gothic One', 'Zen Kaku Gothic New'].map(f => document.fonts.load(`700 32px "${f}"`, '第三倉庫管理棟火気厳禁九丸製氷漁協競り場居酒屋番処やきともつ焼横丁立ち飲み角打ん串かおでそばスナック汐灯ラーメン中華麻雀蓮囲碁将棋釣具えさな小路のべ波止通用心空室あ貸店舗たこ甘上事務所見張突堤サイロ栄乗継計量荷受頭注意聖夜クリスマス市ホットワインおでんたい焼き甘酒ケーキオーナメントやきいも'))).then(() => redraws.forEach(f => f()), () => {});

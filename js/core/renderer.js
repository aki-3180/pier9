// The WebGL renderer. If three.js did not load or WebGL is missing, show why and stop the page here.
'use strict';
// halt: nothing after this can work, so stop the page loading (the scripts after this one are not run) and end this one.
const halt = () => { window.stop(); throw new Error('pier9: cannot start'); };
if (!window.THREE) { fatal('3D ライブラリを読み込めませんでした。通信状況を確認して、ページを開き直してください。'); halt(); }
const canvas = $('view');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
catch (e) { fatal('この端末では WebGL を使えないため、ゲームを表示できません。'); halt(); }

// The 3D scene: cameras, lights, sky, and the small helpers the maps build with.
'use strict';
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.autoClear = false;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x141a28, 18, 92);
const camera = new THREE.PerspectiveCamera(72, 1, 0.08, 400);
camera.rotation.order = 'YXZ';
const gunScene = new THREE.Scene();
const gunCam = new THREE.PerspectiveCamera(58, 1, 0.01, 10);

const hemi = new THREE.HemisphereLight(0x7f95c4, 0x2a2018, 0.85); scene.add(hemi);
const moon = new THREE.DirectionalLight(0x9db4e8, 0.35); moon.position.set(-30, 50, 20); scene.add(moon);

function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return new THREE.CanvasTexture(c); }
let seed = 9;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// sky dome: sodium haze at the horizon fading to navy
const skyTex = stops => canvasTex(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const SKY_NIGHT = skyTex([[0, '#04070e'], [0.34, '#0b1220'], [0.46, '#1c2233'], [0.5, '#4a3324'], [0.52, '#141a28'], [1, '#141a28']]);
const SKY_DUSK = skyTex([[0, '#1d2747'], [0.3, '#4a4a6e'], [0.44, '#c27a5e'], [0.5, '#f2a65a'], [0.52, '#5a4a48'], [1, '#5a4a48']]);
const SKY_MORNING = skyTex([[0, '#4f7fbf'], [0.3, '#86ade0'], [0.44, '#dfe2e2'], [0.5, '#f4dfba'], [0.52, '#c7cdd0'], [1, '#c7cdd0']]);
const SKY_SNOW = skyTex([[0, '#070b18'], [0.3, '#121a30'], [0.45, '#2b3550'], [0.5, '#4a4f66'], [0.52, '#2c3448'], [1, '#2c3448']]);
const SKY_DAY = skyTex([[0, '#3f7fcf'], [0.3, '#6fa6e0'], [0.46, '#cfe3f3'], [0.5, '#e6eef2'], [0.52, '#b9cfe0'], [1, '#b9cfe0']]);
const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 12), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, depthWrite: false, map: SKY_NIGHT }));
scene.add(sky);

// Fitting the view to the window, the radar, the teammate markers.
'use strict';
let baseFov = 72, wasScoped = false, crossD = 0, crossO = 0.5;
function resize() {
  const w = innerWidth, h = innerHeight, a = w / h;
  renderer.setSize(w, h, false); camera.aspect = gunCam.aspect = a; camera.fov = baseFov = a < 1 ? 88 : 72; camera.updateProjectionMatrix(); gunCam.updateProjectionMatrix();
  gun.userData.x = Math.min(0.22, 0.2 * a); gun.userData.far = Math.max(1, 0.76 / a); // on a tall screen the raised gun is held further out, so the sight does not fill the width
}
addEventListener('resize', resize); resize();

const rc = $('radar').getContext('2d');
function drawRadar() {
  const S = 168, c = S / 2, R = c - 6, k = R / 36, s = Math.sin(P.yaw), co = Math.cos(P.yaw);
  rc.clearRect(0, 0, S, S);
  rc.strokeStyle = 'rgba(238,242,234,.22)'; rc.lineWidth = 2; rc.beginPath(); rc.arc(c, c, R / 2, 0, 7); rc.stroke();
  rc.fillStyle = COL.signal; rc.beginPath(); rc.moveTo(c, c - 9); rc.lineTo(c - 6, c + 6); rc.lineTo(c + 6, c + 6); rc.fill();
  const dot = (wx, wz, col, r) => { const dx = wx - P.x, dz = wz - P.z; let px = (dx * co - dz * s) * k, py = (-dx * s - dz * co) * k; const L = Math.hypot(px, py);
    if (L > R) { px *= R / L; py *= R / L; } rc.fillStyle = col; rc.beginPath(); rc.arc(c + px, c - py, r, 0, 7); rc.fill(); };
  for (const p of pickups) dot(p.x, p.z, COL.hull, 5);
  for (const e of enemies) dot(e.x, e.z, e.type === 'ram' ? '#ffd23d' : COL.alarm, e.T.boss ? 12 : e.type === 'heavy' ? 8 : 5);
  if (online) for (const r of liveRemotes) if (r.mate || time - r.lastShot < 2.5) dot(r.x, r.z, r.col, r.mate ? 5 : 6); // teammates always; rivals only after firing
}

/* teammate markers (team modes and co-op): a dot over each teammate's head, seen through walls. A wall in the way turns it into a faint ring;
   a teammate off screen or behind is held at the nearest screen edge, so the dot still points the way. */
const mateEls = [], mv = new THREE.Vector3(), MARGIN = 22; let mateT = 0;
for (let i = 0; i < 7; i++) { const el = document.createElement('div'), d = document.createElement('i'), t = document.createElement('span'); el.className = 'mate'; el.style.display = 'none'; el.append(d, t); $('hud').append(el); mateEls.push({ el, t, on: false, key: '' }); }
function drawMates(dt) {
  const list = online && state === 'play' ? [...remotes.values()].filter(r => r.mate && r.alive) : [], recheck = (mateT -= dt) <= 0; // (one who has dropped out too, marked so)
  if (recheck) mateT = 0.15; // walls and distance a few times a second; the position every frame
  const W2 = innerWidth / 2, H2 = innerHeight / 2;
  mateEls.forEach((m, i) => {
    const r = list[i];
    if (!r) { if (m.on) { m.on = false; m.el.style.display = 'none'; } return; }
    if (recheck || r.occ === undefined) { r.occ = blocked(P.x, P.ey, P.z, r.x, r.py + 1.5, r.z); r.dist = Math.round(Math.hypot(r.x - P.x, r.z - P.z)); }
    mv.set(r.x, r.py + 2.15, r.z).applyMatrix4(camera.matrixWorldInverse);
    let x, y;
    if (mv.z < -0.2) { mv.applyMatrix4(camera.projectionMatrix); x = W2 + mv.x * W2; y = H2 - mv.y * H2; }
    else { x = W2 + mv.x * 1e4; y = H2 + (Math.abs(mv.x) < 0.01 ? 1e4 : -mv.y * 1e4); } // behind: out past the edge on its side (straight behind: the bottom)
    let dx = x - W2, dy = y - H2; const sx = (W2 - MARGIN) / Math.max(1e-6, Math.abs(dx)), sy = (H2 - MARGIN) / Math.max(1e-6, Math.abs(dy)), k = Math.min(sx, sy), edge = k < 1;
    if (edge) { x = W2 + dx * k; y = H2 + dy * k; }
    const tag = r.ghost ? ' 切断中' : r.away ? ' 離席' : '', key = r.col + '|' + r.name + '|' + r.dist + tag;
    if (!m.on) { m.on = true; m.el.style.display = ''; }
    if (m.key !== key) { m.key = key; m.el.style.setProperty('--mc', r.col); m.t.textContent = `${r.name} ${r.dist}m${tag}`; }
    m.el.classList.toggle('occ', !!r.occ); m.el.classList.toggle('edge', edge);
    m.el.style.opacity = r.ghost ? 0.4 : edge ? 0.65 : r.occ ? 0.5 : 0.92;
    m.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-5px)`;
  });
}

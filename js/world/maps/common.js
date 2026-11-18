// Shared by every map: time of day, the live map's collision boxes, textures, materials and the building kit.
'use strict';
/* Maps.
   Each map builds its own group and its own collision boxes the first time it is chosen; switching only swaps which one is live.
   A box is {x,z,hx,hz,y0,h}: h is the top, y0 the underside (things can be walked under). soft: stops feet, not bullets (fences). */
const ENV = { // sky, fog and lights per time of day
  night: { sky: SKY_NIGHT, fog: [0x141a28, 18, 92], hemi: [0x7f95c4, 0x2a2018, 0.85], sun: [0x9db4e8, 0.35, -30, 50, 20] },
  day: { sky: SKY_DAY, fog: [0xc3d7e8, 30, 140], hemi: [0xe4efff, 0x8c8272, 1.1], sun: [0xfff0d0, 1.0, 35, 60, -25] },
  dusk: { sky: SKY_DUSK, fog: [0xb08a74, 80, 280], hemi: [0xe6dcd4, 0x3a3c4a, 0.85], sun: [0xffb878, 0.9, -60, 22, 10] }, // low sun over the sea, far sight for the SR
  hall: { sky: SKY_DAY, fog: [0x6f6a62, 30, 120], hemi: [0xc9d2dc, 0x4a4238, 0.9], sun: [0xffdcaa, 0.75, -40, 40, -8] } // indoors by day: the sun low through the west windows
};
function setEnv(e) { sky.material.map = e.sky; scene.fog.color.setHex(e.fog[0]); scene.fog.near = e.fog[1]; scene.fog.far = e.fog[2]; hemi.color.setHex(e.hemi[0]); hemi.groundColor.setHex(e.hemi[1]); hemi.intensity = e.hemi[2]; moon.color.setHex(e.sun[0]); moon.intensity = e.sun[1]; moon.position.set(e.sun[2], e.sun[3], e.sun[4]); }
let boxes = [], hard = [], MAP = null, mapI = 0, LX = 0, LZ = 0;
const CL = 6.1, CH = 2.6, CW = 2.44;
const HULLS = [0x239487, 0xa5452f, 0xc4952e, 0x2c5c9c, 0x8b929b];
const corr = canvasTex(256, 64, (g, w, h) => {
  for (let x = 0; x < w; x++) { const v = 150 + Math.sin(x / w * Math.PI * 2 * 16) * 60 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, 0, 1, h); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3);
});
const crateTex = canvasTex(64, 64, g => {
  g.fillStyle = '#a07a45'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(40,24,8,.45)'; for (let i = 0; i < 64; i += 16) g.fillRect(i, 0, 2, 64);
  g.strokeStyle = '#5c4020'; g.lineWidth = 6; g.strokeRect(3, 3, 58, 58); g.beginPath(); g.moveTo(4, 4); g.lineTo(60, 60); g.stroke();
});
const glowTex = canvasTex(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
const glow = (color, size) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true })); s.scale.set(size, size, 1); return s; };
const darkMat = new THREE.MeshLambertMaterial({ color: 0x232a36 });
const mk = (geo, mat, x, y, z, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); (parent || scene).add(m); return m; };
const silMat0 = new THREE.MeshBasicMaterial({ color: 0x070b14, fog: false });
const beacons = [];
function cranes(g, list, mat) { // far gantry cranes, drawn as silhouettes
  const silMat = mat || silMat0;
  for (const [cx, cz, ry] of list) {
    const cr = new THREE.Group(); cr.position.set(cx, 0, cz); cr.rotation.y = ry || 0; g.add(cr);
    for (const lx of [-9, 9]) for (const lz of [-5, 5]) mk(new THREE.BoxGeometry(1.6, 34, 1.6), silMat, lx, 17, lz, cr);
    mk(new THREE.BoxGeometry(22, 3, 12), silMat, 0, 34, 0, cr);
    mk(new THREE.BoxGeometry(3, 2.4, 60), silMat, 0, 37, 12, cr);
    mk(new THREE.BoxGeometry(1.2, 16, 1.2), silMat, 0, 44, -2, cr);
    const b = glow(0xff4d3d, 5); b.position.set(0, 53, -2); cr.add(b); beacons.push(b);
  }
}
/* building kit for maps made of many different things: every part is an axis-aligned block or a cylinder,
   given by its extents, drawn instanced per material, and (unless told otherwise) also a collision box. */
const unitBox = new THREE.BoxGeometry(1, 1, 1), unitCyl = new THREE.CylinderGeometry(1, 1, 1, 14);
const concTex = canvasTex(128, 128, (g, w) => {
  g.fillStyle = '#b6b6b6'; g.fillRect(0, 0, w, w); let s = 77; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 2600; i++) { const v = 110 + r() * 120 | 0; g.fillStyle = `rgba(${v},${v},${v},.35)`; g.fillRect(r() * w, r() * w, 3, 3); }
  for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(50,50,50,.13)'; g.fillRect(r() * w, 0, 2 + r() * 5, w); }
});
const fenceTex = canvasTex(64, 64, g => {
  g.strokeStyle = '#b4bfcc'; g.lineWidth = 2.5; g.beginPath();
  for (let i = -64; i < 128; i += 16) { g.moveTo(i, 0); g.lineTo(i + 64, 64); g.moveTo(i + 64, 0); g.lineTo(i, 64); }
  g.stroke();
});
fenceTex.wrapS = fenceTex.wrapT = THREE.RepeatWrapping; fenceTex.repeat.set(5, 4);
const shojiTex = canvasTex(64, 64, g => { // paper behind a wooden lattice; the instance colour is the light inside
  g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#20150e'; for (let i = 0; i <= 64; i += 16) { g.fillRect(i - 1.5, 0, 3, 64); g.fillRect(0, i - 1.5, 64, 3); }
});
const MATS = {
  conc: new THREE.MeshLambertMaterial({ map: concTex }), corr: new THREE.MeshLambertMaterial({ map: corr }), flat: new THREE.MeshLambertMaterial(),
  wood: new THREE.MeshLambertMaterial({ map: crateTex }), lit: new THREE.MeshBasicMaterial(), far: new THREE.MeshBasicMaterial({ fog: false }),
  fence: new THREE.MeshLambertMaterial({ map: fenceTex, alphaTest: 0.4, side: THREE.DoubleSide }), shoji: new THREE.MeshBasicMaterial({ map: shojiTex })
};
function kit() {
  const g = new THREE.Group(), bx = [], L = {};
  const put = (key, geo, v) => (L[key] || (L[key] = { geo, a: [] })).a.push(v);
  const K = { g, bx,
    col(x0, x1, y0, y1, z0, z1, soft) { bx.push({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, hx: (x1 - x0) / 2, hz: (z1 - z0) / 2, y0, h: y1, soft: !!soft }); },
    box(mat, x0, x1, y0, y1, z0, z1, color, solid) { // solid: 0 = only drawn, 2 = soft
      put(mat, unitBox, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, 0, color === undefined ? 0xffffff : color]);
      if (solid !== 0) K.col(x0, x1, y0, y1, z0, z1, solid === 2);
    },
    cyl(mat, x, y, z, r, len, axis, color) { put(mat + '|c', unitCyl, [x, y, z, r, len, r, axis, color]); }, // axis: 0 upright, 1 along x, 2 along z. Drawn only
    done() {
      const mt = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), c = new THREE.Color(), X = new THREE.Vector3(1, 0, 0), Z = new THREE.Vector3(0, 0, 1);
      for (const key in L) {
        const { geo, a } = L[key], im = new THREE.InstancedMesh(geo, MATS[key.split('|')[0]], a.length);
        a.forEach((v, i) => { q.setFromAxisAngle(v[6] === 1 ? Z : X, v[6] ? Math.PI / 2 : 0); mt.compose(p.set(v[0], v[1], v[2]), q, s.set(v[3], v[4], v[5])); im.setMatrixAt(i, mt); im.setColorAt(i, c.set(v[7])); });
        im.frustumCulled = false; g.add(im);
      }
    }
  };
  return K;
}
const redraws = []; // painted text, drawn again once the web fonts are in
const JP = '"Dela Gothic One","Zen Kaku Gothic New","Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif';
function sign(g, text, x, y, z, w, h, ry, bg, fg, vert) { // vert: one character to a line, read downward
  const chars = Array.from(text), tw = vert ? 64 : 256;
  const draw = (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle';
    if (vert) { c.font = `${Math.min(W * 0.8, H / chars.length * 0.84) | 0}px ${JP}`; chars.forEach((ch, i) => c.fillText(ch, W / 2, H * (i + 0.54) / chars.length, W * 0.9)); }
    else { c.font = `${H * 0.64 | 0}px ${JP}`; c.fillText(text, W / 2, H * 0.54, W * 0.9); } };
  const tex = canvasTex(tw, Math.max(32, Math.round(tw * h / w)), draw); tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter;
  mk(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }), x, y, z, g).rotation.y = ry;
  redraws.push(() => { draw(tex.image.getContext('2d'), tex.image.width, tex.image.height); tex.needsUpdate = true; });
}

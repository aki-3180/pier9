// Sound effects, made with Web Audio (no sound files).
'use strict';
let ac = null, noiseBuf = null;
function audioInit() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.6, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  } catch (e) { ac = null; }
}
function noise(dur, f0, f1, vol) {
  if (!ac || !cfg.snd) return;
  const t = ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(ac.destination); s.start(t); s.stop(t + dur);
}
function tone(type, f0, f1, dur, vol) {
  if (!ac || !cfg.snd) return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur);
}
const sfx = {
  shot(s) { noise(s[0], s[1], s[2], s[3]); tone('square', s[4], s[4] / 3, Math.min(s[0], 0.14), s[3] * 0.55); },
  hit() { tone('triangle', 1500, 900, 0.05, 0.12); },
  boom() { noise(0.45, 1800, 80, 0.4); tone('sine', 120, 35, 0.4, 0.3); },
  hurt() { tone('sawtooth', 220, 70, 0.22, 0.2); },
  reload() { tone('square', 500, 300, 0.04, 0.08); setTimeout(() => tone('square', 800, 600, 0.05, 0.08), 260); },
  bolt() { tone('sawtooth', 900, 240, 0.16, 0.05); },
  wave() { tone('square', 440, 440, 0.12, 0.08); setTimeout(() => tone('square', 660, 660, 0.2, 0.08), 150); },
  pick() { tone('sine', 660, 1320, 0.18, 0.14); }
};

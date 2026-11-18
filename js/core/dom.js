// Page helpers: element lookup, the fatal message, colours from the CSS, reduced motion.
'use strict';
const $ = id => document.getElementById(id);
const fatal = msg => { const d = document.createElement('div'); d.id = 'fatal'; d.textContent = msg; document.body.appendChild(d); };
const css = getComputedStyle(document.documentElement);
const C = n => css.getPropertyValue(n).trim();
const COL = { night: C('--night'), sodium: C('--sodium'), signal: C('--signal'), hull: C('--hull'), alarm: C('--alarm'), steel: C('--steel') };
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

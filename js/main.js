// Start: everything is defined by now. Go back into a room left by a reload, and start drawing.
'use strict';
// Opened again soon after closing or reloading while in a room: go back in, as the same player, to the same place
if (SERVER && myName) idReady.then(() => {
  const s = store.get(seatKey(), null);
  if (s && /^\d{4}$/.test(s.code) && Date.now() - num(s.at) < SEAT_KEEP && state === 'menu' && !R.code) joinRoom(s.code, s); else if (s) seatDrop();
});
requestAnimationFrame(frame);
// Every script has run: the title screen takes taps from here on (until now a tap could reach a file not loaded yet; css/menu.css).
document.body.classList.add('ready');

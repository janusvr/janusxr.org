// Landing room behaviors. Kept intentionally light in the greybox phase.
room.onLoad = function() {
  var coin = room.objects['monument-coin'];
  if (coin) {
    var t = 0;
    room.update = function(dt) {
      t += dt / 1000;   // dt is milliseconds
      // gentle bob so the monument reads as alive even before theming
      coin.pos.y = 7.2 + Math.sin(t * 0.8) * 0.15;
    };
  }

  // typewriter displays: completions typed and erased character by character,
  // pulled from the live document's list — the same source the 2d typer and
  // no-js readers get
  var items = [];
  try {
    var lis = document.querySelectorAll('#janusxr-is-list li');
    for (var i = 0; i < lis.length; i++) items.push(lis[i].textContent);
  } catch (e) {}

  function typewriter(id, prefix) {
    var obj = room.objects[id];
    if (!obj || !items.length) return;
    var idx = Math.floor(Math.random() * items.length), pos = 0, dir = 1, hold = 0;
    setInterval(function() {
      var word = items[idx];
      if (dir > 0) {
        if (pos < word.length) pos++;
        else if (++hold > 55) { dir = -1; hold = 0; }   // linger ~2.5s when complete
      } else {
        pos -= 2;
        if (pos <= 0) { pos = 0; dir = 1; idx = (idx + 1) % items.length; }
      }
      obj.text = prefix + word.slice(0, Math.max(0, pos)) + '_';
    }, 45);
  }

  typewriter('learn-is-display', '');
  typewriter('obelisk-text', 'JanusXR is ');
};

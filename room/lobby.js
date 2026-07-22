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

  // the obelisk cycles completions pulled from the live document's list —
  // the same source the 2d typer and no-js readers get
  var obelisk = room.objects['obelisk-text'];
  if (obelisk && typeof document != 'undefined') {
    var items = [];
    try {
      var lis = document.querySelectorAll('#janusxr-is-list li');
      for (var i = 0; i < lis.length; i++) items.push(lis[i].textContent);
    } catch (e) {}
    if (items.length) {
      var idx = Math.floor(Math.random() * items.length);
      setInterval(function() {
        idx = (idx + 1) % items.length;
        obelisk.text = 'JanusXR is ' + items[idx];
      }, 3000);
    }
  }
};

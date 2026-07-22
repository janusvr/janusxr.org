// Landing room behaviors. Kept intentionally light in the greybox phase.
room.onLoad = function() {
  var coin = room.objects['monument-coin'];
  if (coin) {
    var t = 0;
    room.update = function(dt) {
      t += dt / 1000;   // dt is milliseconds
      // gentle bob so the monument reads as alive even before theming
      coin.pos.y = 6.2 + Math.sin(t * 0.8) * 0.15;
    };
  }
};

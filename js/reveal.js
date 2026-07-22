/* janusxr.org — Phase 2: the reveal.
   Loads the JanusWeb engine after first paint, hydrates the landing room behind
   the document, snaps the camera between mezzanine viewpoints as you scroll,
   and hands over full control on Enter. The page works fully without this file,
   and bails silently at every step if the engine can't run. */

(function () {
  'use strict';

  var ENGINE_URL = 'https://web.janusxr.org/1.7.4/janusweb.js';
  var ROOM_URL = new URL('room/lobby.html', document.baseURI).href;
  var TWEEN_MS = 900;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;

  /* Fallback viewpoint table — overridden by vp-* markers in the room when present.
     Coordinates match room/lobby.html. */
  var VIEWPOINTS = {
    /* section viewpoints orbit low around the fountain, each looking out
       through its wing's portal doorway */
    hero:     { pos: [0, 0, 26],        look: [0, 1.7, 0] },   /* == Room spawn pos/fwd */
    whatis:   { pos: [-2.35, 2, 3.24],  look: [-11.17, 3, 15.37] },
    explore:  { pos: [-3.80, 2, -1.24], look: [-18.07, 3, -5.87] },
    get:      { pos: [0, 2, -4],        look: [0, 3, -19] },
    build:    { pos: [3.80, 2, -1.24],  look: [18.07, 3, -5.87] },
    timeline: { pos: [2.35, 2, 3.24],   look: [11.17, 3, 15.37] },
    overview: { pos: [0, 13, 21],       look: [0, 0.9, 0] }   /* footer: high south, gazing at the fountain base */
  };
  var SECTION_VP = [
    ['hero', 'hero'], ['whatis', 'whatis'], ['explore', 'explore'],
    ['get', 'get'], ['build', 'build'], ['timeline', 'timeline'],
    ['footer', 'overview']
  ];

  var state = {
    ready: false,       // engine + room loaded
    roaming: false,     // free-roam (Enter) mode
    vp: null,           // current viewpoint name
    tween: null,
    savedScroll: 0
  };

  function webglAvailable() {
    try {
      var c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
  }

  if (!webglAvailable() || saveData) return;  // Tier 1: stay a 2D page

  /* ---- engine loading (never on the critical path) ---------------------- */

  function whenIdle(fn) {
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle);
    function idle() {
      if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 4000 });
      else setTimeout(fn, 1500);
    }
  }

  whenIdle(function () {
    var script = document.createElement('script');
    script.src = ENGINE_URL;
    script.onload = boot;
    script.onerror = function () { /* engine unreachable: stay 2D */ };
    document.head.appendChild(script);
  });

  function boot() {
    if (!window.elation || !elation.janusweb) return;
    var viewport = document.getElementById('room-viewport');
    if (!viewport) return;
    try {
      elation.janusweb.init({
        url: ROOM_URL,
        container: viewport,
        fullsize: true,
        homepage: document.location.href,
        showui: false,
        showchat: false,
        crosshair: false
      }).then(onEngineStart, function () { /* init failed: stay 2D */ });
    } catch (e) { /* stay 2D */ }
  }

  function onEngineStart(client) {
    whenRoomLoaded(client, function () {
      readRoomViewpoints();
      try { window.player.disable(); } catch (e) {}
      document.documentElement.classList.add('room-live');
      snapTo(currentSectionVP(), true);
      watchScroll();
      wireEnter(client);
      state.ready = true;
    });
  }

  function whenRoomLoaded(client, cb, tries) {
    tries = tries || 0;
    var room = client.janusweb && client.janusweb.currentroom;
    if (room) {
      var done = false;
      var fire = function () { if (!done) { done = true; cb(); } };
      elation.events.add(room, 'room_load_complete', fire);
      setTimeout(fire, 20000);  // belt and braces: reveal even if the event was missed
    } else if (tries < 100) {
      setTimeout(function () { whenRoomLoaded(client, cb, tries + 1); }, 250);
    }
  }

  /* Prefer viewpoint positions authored in the room (vp-* markers) over the
     JS fallback table — the room is the source of truth (SPACE.md contract). */
  function readRoomViewpoints() {
    try {
      var objects = window.room && window.room.objects;
      if (!objects) return;
      for (var name in VIEWPOINTS) {
        var marker = objects['vp-' + name];
        if (marker && marker.pos) {
          VIEWPOINTS[name].pos = [marker.pos.x, marker.pos.y, marker.pos.z];
        }
      }
    } catch (e) {}
  }

  /* ---- document mode: scroll → camera ----------------------------------- */

  function currentSectionVP() {
    /* at the very bottom, the last section wins even if it's too short to
       ever cross the midline */
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      return SECTION_VP[SECTION_VP.length - 1][1];
    }
    var mid = window.innerHeight / 2;
    var pick = SECTION_VP[0][1];
    for (var i = 0; i < SECTION_VP.length; i++) {
      var el = document.getElementById(SECTION_VP[i][0]);
      if (!el) continue;
      var r = el.getBoundingClientRect();
      if (r.top <= mid) pick = SECTION_VP[i][1];
    }
    return pick;
  }

  function watchScroll() {
    var pending = false;
    window.addEventListener('scroll', function () {
      if (pending || state.roaming) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        if (state.roaming) return;
        var vp = currentSectionVP();
        if (vp !== state.vp) snapTo(vp, reducedMotion);
      });
    }, { passive: true });
  }

  function setCamera(pos, look) {
    try {
      var p = window.player;
      var pp = p.pos || p.position;
      if (pp && pp.set) pp.set(pos[0], pos[1], pos[2]);
      else if (pp) { pp.x = pos[0]; pp.y = pos[1]; pp.z = pos[2]; }
      p.lookAt(window.V(look[0], look[1], look[2]));
    } catch (e) {}
  }

  function snapTo(name, instant) {
    var target = VIEWPOINTS[name];
    if (!target) return;
    if (state.tween) { cancelAnimationFrame(state.tween.raf); state.tween = null; }

    var from = state.vp ? VIEWPOINTS[state.vp] : null;
    state.vp = name;

    if (instant || !from) {
      setCamera(target.pos, target.look);
      return;
    }

    var start = performance.now();
    var tween = state.tween = { raf: 0 };
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function step(now) {
      if (state.tween !== tween) return;
      var t = Math.min((now - start) / TWEEN_MS, 1);
      var k = ease(t);
      var pos = [0, 0, 0], look = [0, 0, 0];
      for (var i = 0; i < 3; i++) {
        pos[i] = from.pos[i] + (target.pos[i] - from.pos[i]) * k;
        look[i] = from.look[i] + (target.look[i] - from.look[i]) * k;
      }
      setCamera(pos, look);
      if (t < 1) tween.raf = requestAnimationFrame(step);
      else state.tween = null;
    }
    tween.raf = requestAnimationFrame(step);
  }

  /* ---- Enter: hand over the controls ------------------------------------ */

  function wireEnter(client) {
    var enters = document.querySelectorAll('.btn-enter');
    for (var i = 0; i < enters.length; i++) {
      enters[i].addEventListener('click', function (ev) {
        if (!state.ready) return;   // engine not up: link falls through to web client
        ev.preventDefault();
        enterWorld();
      });
    }
    /* exit chip created here rather than in the HTML so Tier 0 never sees it */
    var exit = document.createElement('button');
    exit.type = 'button';
    exit.id = 'roam-exit';
    exit.className = 'roam-exit';
    exit.textContent = '◂ back to the page';
    document.body.appendChild(exit);
    exit.addEventListener('click', exitWorld);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && state.roaming && !document.pointerLockElement) {
        exitWorld();
      }
    });
  }

  function enterWorld() {
    if (state.roaming) return;
    state.roaming = true;
    state.savedScroll = window.scrollY;
    if (state.tween) { cancelAnimationFrame(state.tween.raf); state.tween = null; }
    document.documentElement.classList.add('room-roam');
    try {
      window.player.enable();
      window.janus.showchat = true;
    } catch (e) {}
  }

  function exitWorld() {
    if (!state.roaming) return;
    state.roaming = false;
    document.documentElement.classList.remove('room-roam');
    try {
      window.janus.showchat = false;
      window.player.disable();
    } catch (e) {}
    window.scrollTo(0, state.savedScroll);
    state.vp = null;
    snapTo(currentSectionVP(), true);
  }
})();

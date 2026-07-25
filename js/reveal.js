/* janusxr.org — Phase 2: the reveal.
   Loads the JanusWeb engine after first paint, hydrates the landing room behind
   the document, snaps the camera between mezzanine viewpoints as you scroll,
   and hands over full control on Enter. The page works fully without this file,
   and bails silently at every step if the engine can't run. */

(function () {
  'use strict';

  var TWEEN_MS = 900;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;

  /* Fallback viewpoint table — overridden by same-named markers in the room
     when present (position and orientation both come from the objects). */
  var VIEWPOINTS = {
    /* section viewpoints orbit low around the fountain, each looking out
       through its wing's portal doorway */
    /* world coordinates; content lives in movable groups at +20z */
    hero:     { pos: [0, 0, 35],        look: [0, 1.7, 20] },   /* == Room spawn pos/fwd */
    learn:    { pos: [-3.94, 2, 19.31], look: [-18.71, 3, 16.7] },
    explore:  { pos: [0, 1.2, 4.5],     look: [0, -4, -32] },   /* the overlook */
    build:    { pos: [3.94, 2, 19.31],  look: [18.71, 3, 16.7] },
    footer:   { pos: [0, 13, 41],       look: [0, 0.9, 20] }   /* high south, gazing at the fountain base */
  };
  var SECTION_VP = [
    ['hero', 'hero'], ['learn', 'learn'], ['explore', 'explore'],
    ['build', 'build'], ['footer', 'footer']
  ];

  var state = {
    ready: false,       // engine + room loaded
    roaming: false,     // free-roam (Enter) mode
    vp: null,           // current viewpoint name
    tween: null,
    savedScroll: 0,
    navlock: false,     // anchor navigation in flight: scroll events ignored
    navTimer: 0,
    navMax: 0,
    userScrolled: false, // the user has scrolled deliberately since page load
    pendingEnter: false  // Enter clicked before the room finished loading
  };

  ['wheel', 'touchstart', 'keydown'].forEach(function (evname) {
    window.addEventListener(evname, function mark() {
      state.userScrolled = true;
      window.removeEventListener(evname, mark);
    }, { passive: true });
  });

  function webglAvailable() {
    try {
      var c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
  }

  if (!webglAvailable() || saveData) return;  // Tier 1: stay a 2D page

  /* ---- engine loading ---------------------------------------------------
     janusweb.js is a plain async script tag in the page head — it downloads
     and initializes in parallel with the page and is ready much sooner than
     waiting for load. We just wait for it to appear, then init. */

  var booted = false;

  function whenEngineReady(fn) {
    function fire() {
      if (booted) return;
      if (window.elation && elation.janusweb) { booted = true; fn(); }
    }
    fire();
    if (booted) return;
    var tag = document.querySelector('script[src*="janusweb"]');
    if (tag) tag.addEventListener('load', fire);
    var tries = 0;
    var iv = setInterval(function () {
      fire();
      if (booted || ++tries > 600) clearInterval(iv);
    }, 100);
  }

  whenEngineReady(boot);

  function boot() {
    if (!window.elation || !elation.janusweb) return;
    /* the room markup lives inside this element, in an HTML comment — the
       page is its own room ("rendering this page's virtual twin") */
    var viewer = document.querySelector('janus-viewer');
    if (!viewer) return;
    /* TEMP shim until engine > 1.7.4: the janus-viewer parse path doesn't
       strip the HTML comment wrapping the room markup, so the room parses
       empty. Fixed upstream in janusweb scripts/room.js parseSource; remove
       this when the site pins a release containing that fix. */
    if (window.JanusFireboxParser) {
      var origParse = JanusFireboxParser.prototype.parse;
      JanusFireboxParser.prototype.parse = function (source) {
        arguments[0] = String(source).replace(/<!--|-->/g, '');
        return origParse.apply(this, arguments);
      };
    }
    try {
      var init = elation.janusweb.init.bind(elation.janusweb);
      /* defuse the viewer's click-anywhere-to-start fallback; we drive init */
      elation.janusweb.init = function () {};
      init({
        url: document.location.href,
        container: viewer,
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
      styleMounts();
      try { window.player.disable(); } catch (e) {}
      document.documentElement.classList.add('room-live');
      reanchorHash();
      snapTo(currentSectionVP(), true);
      watchScroll();
      watchNavClicks();
      wireEnter(client);
      state.ready = true;
      if (state.pendingEnter) {
        state.pendingEnter = false;
        enterWorld();
      }
    });
  }

  /* room-live grows the sections (the 2D column spreads out to pace the 3D
     walk), moving every anchor target after the browser already did its hash
     scroll. Re-assert the hash so a /#section link still lands on its
     section — unless the user has taken over scrolling in the meantime. */
  function reanchorHash() {
    if (state.userScrolled) return;
    var id = document.location.hash.slice(1);
    var el = id && document.getElementById(id);
    if (!el) return;
    state.suppressScroll = true;
    el.scrollIntoView({ behavior: 'instant', block: 'start' });
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

  /* The room's markers are the source of truth: named exactly like the
     document anchors, their pos is the camera position and their fwd is the
     gaze direction for that section's snap. */
  function readRoomViewpoints() {
    try {
      var objects = window.room && window.room.objects;
      if (!objects) return;
      for (var name in VIEWPOINTS) {
        var marker = objects[name];
        if (marker && marker.pos) {
          var p = marker.pos;
          VIEWPOINTS[name].pos = [p.x, p.y, p.z];
          var f = marker.fwd;
          if (f && (f.x || f.y || f.z)) {
            VIEWPOINTS[name].look = [p.x + f.x * 10, p.y + f.y * 10, p.z + f.z * 10];
          }
        }
      }
    } catch (e) {}
  }

  /* TEMP shim until engine > 1.7.4: the paragraph css attribute only accepts
     inline CSS text there, not a stylesheet URL (URL support added upstream in
     janusparagraph.js getStylesheet). Fetch the site stylesheet and assign its
     text to the mounts so snapshots render in PHOSPHOR today. */
  function styleMounts() {
    try {
      fetch('css/phosphor.css')
        .then(function (r) { return r.text(); })
        .then(function (text) {
          var objects = window.room && window.room.objects;
          if (!objects) return;
          for (var id in objects) {
            if (id.indexOf('mount-') === 0) objects[id].css = text;
          }
        })
        .catch(function () {});
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
      if (state.suppressScroll) { state.suppressScroll = false; return; }
      if (state.navlock) {
        /* anchor navigation in flight: the camera is already lerping to its
           final destination — treat scroll only as a settle signal */
        clearTimeout(state.navTimer);
        state.navTimer = setTimeout(endNav, 200);
        return;
      }
      if (pending || state.roaming) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        if (state.roaming || state.navlock) return;
        var vp = currentSectionVP();
        if (vp !== state.vp) snapTo(vp, reducedMotion);
      });
    }, { passive: true });
  }

  /* ---- anchor navigation: one lerp, straight to the destination ---------- */

  function sectionForHash(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    var node = el;
    while (node && node !== document.body) {
      for (var i = 0; i < SECTION_VP.length; i++) {
        if (SECTION_VP[i][0] === node.id) return SECTION_VP[i][1];
      }
      node = node.parentElement;
    }
    return null;
  }

  function watchNavClicks() {
    document.addEventListener('click', function (ev) {
      if (state.roaming || !state.ready) return;
      var a = ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var vp = sectionForHash(a.getAttribute('href').slice(1));
      if (!vp) return;
      /* native smooth scroll proceeds; the camera goes direct, now */
      state.navlock = true;
      clearTimeout(state.navTimer);
      clearTimeout(state.navMax);
      state.navTimer = setTimeout(endNav, 400);       // in case no scroll occurs
      state.navMax = setTimeout(endNav, 2500);        // hard stop
      snapTo(vp, reducedMotion);
    }, true);
  }

  function endNav() {
    clearTimeout(state.navTimer);
    clearTimeout(state.navMax);
    if (!state.navlock) return;
    state.navlock = false;
    /* re-sync in case the user grabbed the scrollbar mid-navigation */
    var vp = currentSectionVP();
    if (vp !== state.vp) snapTo(vp, reducedMotion);
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

    var from = state.vp ? VIEWPOINTS[state.vp] : state.freePose;
    state.freePose = null;
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

  /* Wired at script start, before the engine even boots: once we've committed
     to running the world in this page, Enter must never bounce to the hosted
     client. A click that lands before the room is ready queues the entry. */
  function wireEnterEarly() {
    var enters = document.querySelectorAll('.btn-enter');
    for (var i = 0; i < enters.length; i++) {
      enters[i].addEventListener('click', function (ev) {
        ev.preventDefault();
        if (state.ready) {
          enterWorld();
        } else {
          state.pendingEnter = true;
        }
      });
    }
  }
  wireEnterEarly();

  function wireEnter(client) {
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
    /* engage pointer lock right off the Enter click (a valid user gesture)
       instead of waiting for a second click on the canvas */
    try {
      var inst = elation.engine.instances;
      inst[Object.keys(inst)[0]].systems.controls.requestPointerLock();
    } catch (e) {}
  }

  function exitWorld() {
    if (!state.roaming) return;
    state.roaming = false;
    document.documentElement.classList.remove('room-roam');
    /* preserve the walked-to position: the camera stays where the avatar
       stands, registered as a temporary off-rail pose that the next scroll
       tweens away from — no teleport on exit */
    try {
      var p = window.player;
      var pp = p.pos || p.position;
      var dir = p.dir || p.view_dir || null;
      var look = dir ? [pp.x + dir.x * 10, pp.y + 1.6 + dir.y * 10, pp.z + dir.z * 10]
                     : [0, 2, 20];
      state.freePose = { pos: [pp.x, pp.y, pp.z], look: look };
    } catch (e) { state.freePose = null; }
    try {
      window.janus.showchat = false;
      window.player.disable();
    } catch (e) {}
    /* hiding the document collapsed its height and zeroed the scroll;
       restore where the reader left off — and swallow the scroll event that
       restore fires, so the camera holds the walked-to pose until the reader
       actually scrolls */
    state.suppressScroll = true;
    window.scrollTo({ top: state.savedScroll, left: 0, behavior: 'instant' });
    state.vp = null;
  }
})();

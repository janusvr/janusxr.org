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

  // media shelf: clicking a case shows its card on the detail panel;
  // clicking the panel opens the current pick's read/watch link
  var currentMedia = null;
  var detail = room.objects['mount-media-detail'];
  fetch('data/history/media.json').then(function(r) { return r.json(); }).then(function(data) {
    data.items.forEach(function(item) {
      var obj = room.objects['media-' + item.id];
      if (!obj) return;
      obj.addEventListener('click', function() {
        currentMedia = item;
        if (detail) {
          detail.text = '<h4>' + item.title + ' (' + item.year + ')</h4>' +
                        '<p><em>' + item.creator + ' - ' + item.kind + '</em></p>' +
                        '<p>' + item.blurb + '</p>' +
                        '<p class="media-open">click this panel to read/watch</p>';
        }
      });
    });
  }).catch(function() {});
  if (detail) {
    detail.addEventListener('click', function() {
      if (currentMedia) window.open(currentMedia.media_url, '_blank');
    });
  }

  // editor bay: the big green button opens the editor and walks you through it
  var editBtn = room.objects['edit-button'];
  var tutPanel = room.objects['mount-edit-tutorial'];
  var tut = { active: false, chapter: 'editor', done: { editor: false, markup: false },
              step: 0, stepAt: 0, timer: null, base: null, flags: {}, advancing: false, editorOpen: false };

  function tutCtl() { return (typeof getEditorController == 'function') ? getEditorController() : null; }
  function tutUiBtn() { return document.querySelector('janus-ui-editor-button'); }
  function tutMode(c) { return (c && c.objectinfo) ? c.objectinfo.mode : ''; }
  function tutSnap(v) { return v ? { x: +v.x || 0, y: +v.y || 0, z: +v.z || 0 } : null; }
  function tutDelta(v, b) {
    if (!v || !b) return 0;
    return Math.max(Math.abs(v.x - b.x), Math.abs(v.y - b.y), Math.abs(v.z - b.z));
  }
  function tutSnapCol(v) { return (v && v.r !== undefined) ? { x: v.r, y: v.g, z: v.b } : null; }
  // provenance: drag steps must come from the gizmo, wheel steps from the wheel
  var tutInput = { wheelAt: 0, gizmoAt: 0, manipBound: false };
  function tutRecent(t) { return t && (Date.now() - t) < 2500; }
  room.addEventListener('wheel', function() { tutInput.wheelAt = Date.now(); });
  function tutBindManip(c) {
    if (tutInput.manipBound || !c || !c.getManipulator) return;
    try {
      var m = c.getManipulator();
      if (m) {
        elation.events.add(m, 'objectChange', function() { tutInput.gizmoAt = Date.now(); });
        tutInput.manipBound = true;
      }
    } catch (e) {}
  }

  var tutEditorSteps = [
    { t: 'pick something up',
      h: '<b>RIGHT-CLICK</b> the pink cube — or any of its friends — to select it for editing.',
      enter: function() {},
      check: function(c) { var o = c.roomedit.object; return !!(o && o.js_id && o.js_id.indexOf('play-') === 0); } },
    { t: 'move it',
      h: 'Drag the <b>arrows</b> to move it around.',
      enter: function(c) { var o = c.roomedit.object; tut.base = o ? tutSnap(o.pos) : null; },
      check: function(c) { var o = c.roomedit.object; return !!(o && tut.base && tutRecent(tutInput.gizmoAt) && tutDelta(tutSnap(o.pos), tut.base) > 0.25); } },
    { t: 'nudge with the wheel',
      h: '<b>SCROLL</b> moves it in precise steps — up and down by default. Hold <b>ALT</b> to scroll along X, <b>SHIFT</b> for Z. Keys <b>1</b>–<b>4</b> set the step size, from whole meters down to millimeters.',
      enter: function(c) { var o = c.roomedit.object; tut.base = o ? tutSnap(o.pos) : null; },
      check: function(c) {
        var o = c.roomedit.object;
        return !!(o && tutMode(c) == 'pos' && tut.base && tutRecent(tutInput.wheelAt) && tutDelta(tutSnap(o.pos), tut.base) > 0.04); } },
    { t: 'rotate it',
      h: 'Press <b>TAB</b> to switch to rotation, then drag a ring.',
      enter: function() { tut.base = null; },
      check: function(c) {
        var o = c.roomedit.object;
        if (!o || tutMode(c) != 'rotation') return false;
        if (!tut.base) { tut.base = tutSnap(o.rotation); return false; }
        return tutRecent(tutInput.gizmoAt) && tutDelta(tutSnap(o.rotation), tut.base) > 8; } },
    { t: 'spin with the wheel',
      h: '<b>SCROLL</b> spins it in snap steps — yaw by default. Hold <b>CTRL</b> to pitch, <b>SHIFT</b> to roll.',
      enter: function() { tut.base = null; },
      check: function(c) {
        var o = c.roomedit.object;
        if (!o || tutMode(c) != 'rotation') return false;
        if (!tut.base) { tut.base = tutSnap(o.rotation); return false; }
        return tutRecent(tutInput.wheelAt) && tutDelta(tutSnap(o.rotation), tut.base) > 12; } },
    { t: 'scale it',
      h: '<b>TAB</b> again: now the handles scale it. Stretch something.',
      enter: function() { tut.base = null; },
      check: function(c) {
        var o = c.roomedit.object;
        if (!o || tutMode(c) != 'scale') return false;
        if (!tut.base) { tut.base = tutSnap(o.scale); return false; }
        return tutRecent(tutInput.gizmoAt) && tutDelta(tutSnap(o.scale), tut.base) > 0.12; } },
    { t: 'size with the wheel',
      h: '<b>SCROLL</b> resizes in steps — height by default. <b>ALT</b> scales X, <b>SHIFT</b> scales Z.',
      enter: function() { tut.base = null; },
      check: function(c) {
        var o = c.roomedit.object;
        if (!o || tutMode(c) != 'scale') return false;
        if (!tut.base) { tut.base = tutSnap(o.scale); return false; }
        return tutRecent(tutInput.wheelAt) && tutDelta(tutSnap(o.scale), tut.base) > 0.03; } },
    { t: 'paint it',
      h: 'Keep pressing <b>TAB</b> until you reach <b>col</b> — a color wheel appears in the air. Drag the ring for hue, the square for shade.',
      enter: function() { tut.base = null; },
      check: function(c) {
        var o = c.roomedit.object;
        if (!o || tutMode(c) != 'col') return false;
        if (!tut.base) { tut.base = tutSnapCol(o.col); return false; }
        return tutDelta(tutSnapCol(o.col), tut.base) > 0.06; } },
    { t: 'set it down',
      h: '<b>LEFT-CLICK</b> anywhere to confirm your changes and let go.',
      enter: function() { tut.flags.edited = false; },
      check: function(c) { return tut.flags.edited || !c.roomedit.object; } },
    { t: 'place through your eyes',
      h: 'Hold <b>CTRL</b> and <b>RIGHT-CLICK</b> an object: it rides your crosshair as you look around. <b>LEFT-CLICK</b> to drop it.',
      enter: function() { tut.flags.sawRaycast = false; },
      check: function(c) {
        if (c.roomedit.raycast && c.roomedit.object) tut.flags.sawRaycast = true;
        return tut.flags.sawRaycast && !c.roomedit.object; } },
    { t: 'copy and paste',
      h: 'While editing something, press <b>CTRL+C</b>. Set it down, then <b>CTRL+V</b> — a clone rides your crosshair. Drop it somewhere.',
      enter: function(c) { tut.flags.buffer0 = c.roomedit.pastebuffer; tut.flags.copied = false; tut.flags.pasting = false; },
      check: function(c) {
        var buf = c.roomedit.pastebuffer;
        if (buf && buf !== tut.flags.buffer0) tut.flags.copied = true;
        if (tut.flags.copied && c.roomedit.raycast && c.roomedit.object && c.roomedit.object !== buf) tut.flags.pasting = true;
        return tut.flags.pasting && !c.roomedit.object; } }
  ];

  var tutMarkupSteps = [
    { t: 'the living source',
      h: 'The big panel here is this room&#39;s actual markup, updating live. <b>RIGHT-CLICK</b> one of the shapes beside it to select it for editing.',
      enter: function() {},
      check: function(c) { var o = c.roomedit.object; return !!(o && o.js_id && o.js_id.indexOf('play-') === 0); } },
    { t: 'watch pos rewrite itself',
      h: 'Drag the <b>arrows</b> and keep an eye on the panel &mdash; the object&#39;s <b>pos</b> attribute rewrites as you move it.',
      enter: function(c) { var o = c.roomedit.object; tut.base = o ? tutSnap(o.pos) : null; },
      check: function(c) { var o = c.roomedit.object; return !!(o && tut.base && tutRecent(tutInput.gizmoAt) && tutDelta(tutSnap(o.pos), tut.base) > 0.25); } },
    { t: 'watch col follow',
      h: 'Press <b>TAB</b> until the mode reaches <b>col</b>, repaint with the wheel &mdash; and see the <b>col</b> attribute follow.',
      enter: function() { tut.base = null; },
      check: function(c) {
        var o = c.roomedit.object;
        if (!o || tutMode(c) != 'col') return false;
        if (!tut.base) { tut.base = tutSnapCol(o.col); return false; }
        return tutDelta(tutSnapCol(o.col), tut.base) > 0.06; } },
    { t: 'worlds are documents',
      h: 'Everything in every Janus world is this: readable, editable markup. <b>View Source</b> works on worlds.',
      enter: function() {},
      check: function() { return (Date.now() - tut.stepAt) > 6000; } }
  ];

  var tutChapters = {
    editor: { title: 'editor tour', steps: tutEditorSteps },
    markup: { title: 'markup tour', steps: tutMarkupSteps }
  };
  function tutCurSteps() { return tutChapters[tut.chapter].steps; }

  var tutIdleHTML = '<h4>the editor bay</h4>' +
    '<p>Everything on this floor is editable — and so is the rest of the 3D web.</p>' +
    '<p class="media-open">press the green button below for a guided tour</p>';
  var tutPausedHTML = '<h4>editor closed</h4>' +
    '<p>The tour is paused. Press <b>F1</b> or the green button to reopen the editor and pick up where you left off.</p>';
  function tutDoneHTML() {
    var other = (tut.chapter == 'editor') ? 'markup' : 'editor';
    if (!tut.done[other]) {
      if (other == 'markup') {
        return '<h4>chapter 1 complete ✓</h4>' +
          '<p>Next door in the <b>markup hall</b>, a big panel shows this room&#39;s living source &mdash; ' +
          'chapter 2 teaches you to read it. Press the green button beside it.</p>';
      }
      return '<h4>chapter 2 complete ✓</h4>' +
        '<p>Now learn the hands: the <b>editor bay</b> next door walks you through moving, painting, ' +
        'and copying, by gizmo and by wheel. Press its green button.</p>';
    }
    return '<h4>you know the editor and the source ✓</h4>' +
      '<p><b>F1</b> toggles the editor anywhere. <b>DELETE</b> removes what you are editing. ' +
      'Every Janus world is readable, editable markup &mdash; go build.</p>' +
      '<p class="media-open"><a href="/docs/editor/">the full editor guide</a></p>';
  }

  function tutFade(from, to, ms, done) {
    if (!tutPanel) { if (done) done(); return; }
    var t0 = Date.now();
    var iv = setInterval(function() {
      var t = Math.min(1, (Date.now() - t0) / ms);
      tutPanel.opacity = from + (to - from) * t;
      if (t >= 1) { clearInterval(iv); if (done) done(); }
    }, 25);
  }
  function tutSetPanel(html) {
    if (tutPanel) tutPanel.text = '<div class="tut-card">' + html + '</div>';
  }
  function tutShow(done) {
    var html, steps = tutCurSteps();
    if (tut.step >= steps.length) {
      html = tutDoneHTML();
    } else {
      var s = steps[tut.step];
      html = '<h4>' + tutChapters[tut.chapter].title + ' · ' + (tut.step + 1) + '/' + steps.length + ' · ' + s.t + '</h4>' +
        '<p>' + s.h + '</p>';
    }
    tutSetPanel(html);
  }
  function tutEnter() {
    var c = tutCtl();
    tut.stepAt = Date.now();
    var steps = tutCurSteps();
    if (tut.step < steps.length && c) steps[tut.step].enter(c);
    tutShow(false);
  }
  function tutAdvance() {
    if (tut.advancing) return;
    tut.advancing = true;
    if (tutCheck) tutCheck.visible = true;
    tutShow(true);
    setTimeout(function() {
      tut.advancing = false;
      if (!tut.active) { if (tutCheck) tutCheck.visible = false; return; }
      tut.step++;
      if (tut.step >= tutCurSteps().length) {
        // graduation: card alone (check goes away with the step beat), held
        // in view, then fade out, park on the pedestal, fade back in
        tut.done[tut.chapter] = true;
        if (tutCheck) tutCheck.visible = false;
        tutShow(false);
        tut.active = false;
        if (tut.timer) { clearInterval(tut.timer); tut.timer = null; }
        setTimeout(function() {
          if (tut.active) return;   // a new tour started in the meantime
          tutFade(1, 0, 250, function() {
            if (tut.active) { tutPanel.opacity = 1; return; }
            tutFloatOff();
            tutSetPanel(tutIdleHTML);
            tutFade(0, 1, 250);
          });
        }, 8000);
        return;
      }
      if (tutCheck) tutCheck.visible = false;
      tutEnter();
    }, 900);
  }
  function tutTick() {
    if (!tut.active || tut.advancing) return;
    var c = tutCtl();
    if (!c) return;
    tutBindUiBtn();
    tutBindManip(c);
    if (!tut.editorOpen) { tutSetPanel(tutPausedHTML); return; }
    var s = tutCurSteps()[tut.step];
    if (s && s.check(c)) tutAdvance();
  }
  function tutStart(chapter) {
    tut.active = true;
    tut.chapter = chapter || 'editor';
    tut.step = 0;
    tut.flags = {};
    if (tut.timer) clearInterval(tut.timer);
    tut.timer = setInterval(tutTick, 200);
    tutFloatOn();
    tutEnter();
  }
  function tutStop(toIdle) {
    tut.active = false;
    if (tut.timer) { clearInterval(tut.timer); tut.timer = null; }
    tutFloatOff();
    if (toIdle) tutSetPanel(tutIdleHTML);
  }

  // While the tour runs the panel floats in-world (VR-friendly), lazy-follow
  // style: it holds still while you aim, and only glides to a fresh anchor at
  // the lower-left of your view once you've turned or moved away enough. Its
  // collider is removed in flight so scene picks pass straight through; the
  // small SKIP chip carries its own tiny collider instead.
  var tutSkipChip = room.objects['tut-skip'];
  var tutCheck = room.objects['tut-check'];
  if (tutCheck) tutCheck.text = '<p class="tut-glyph">\u2713</p>';
  var tutHome = null;
  var tutFloat = { on: false };
  function tutWorldToParent(vec) {
    try {
      var p = tutPanel._target.objects['3d'].parent;
      return p.worldToLocal(vec.clone());
    } catch (e) { return vec; }
  }
  function tutFloatOn() {
    if (!tutPanel || tutFloat.on) return;
    if (!tutHome) {
      tutHome = { pos: tutSnap(tutPanel.pos), scale: tutSnap(tutPanel.scale),
                  xdir: tutSnap(tutPanel.xdir), ydir: tutSnap(tutPanel.ydir), zdir: tutSnap(tutPanel.zdir) };
    }
    tutFloat.on = true;
    tutPanel.scale = V(0.36, 0.078, 1);
    tutPanel.depth_test = false;
    tutPanel.renderorder = 100;
    if (tutSkipChip) {
      tutSkipChip.scale = V(0.12, 0.12, 1);
      tutSkipChip.visible = true;
      tutSkipChip.depth_test = false;
      tutSkipChip.renderorder = 101;
    }
  }
  function tutFloatOff() {
    if (!tutPanel || !tutFloat.on) return;
    tutFloat.on = false;
    if (tutHome) {
      tutPanel.pos = V(tutHome.pos.x, tutHome.pos.y, tutHome.pos.z);
      tutPanel.xdir = V(tutHome.xdir.x, tutHome.xdir.y, tutHome.xdir.z);
      tutPanel.ydir = V(tutHome.ydir.x, tutHome.ydir.y, tutHome.ydir.z);
      tutPanel.zdir = V(tutHome.zdir.x, tutHome.zdir.y, tutHome.zdir.z);
      tutPanel.scale = V(tutHome.scale.x, tutHome.scale.y, tutHome.scale.z);
    }
    tutPanel.depth_test = true;
    tutPanel.renderorder = 0;
    if (tutSkipChip) {
      tutSkipChip.visible = false;
      tutSkipChip.depth_test = true;
      tutSkipChip.renderorder = 0;
    }
    if (tutCheck) tutCheck.visible = false;
  }
  function tutFollow() {
    if (!tutFloat.on || !tutPanel || typeof player == 'undefined') return;
    // static placement in player body space (per James): body yaws but never
    // pitches, so offsets through player.localToWorld keep the sign at a
    // steady height beside your view. Facing is horizontal-only: upright
    // always, no off-axis roll.
    var world = player.localToWorld(V(0, 1.1, -0.6));
    var ppos = player.pos;
    // set the full basis ourselves: pitching fwd and letting the engine
    // derive the rest rolls as the yaw changes. xdir is forced horizontal
    // (cross of world-up and fwd), so roll is impossible by construction;
    // the +y in zdir is the lectern tilt.
    var zdir = new THREE.Vector3(ppos.x - world.x, 0, ppos.z - world.z).normalize();
    zdir.y = 0.3;
    zdir.normalize();
    var up = new THREE.Vector3(0, 1, 0);
    var xdir = new THREE.Vector3().crossVectors(up, zdir).normalize();
    var ydir = new THREE.Vector3().crossVectors(zdir, xdir).normalize();
    var local = tutWorldToParent(new THREE.Vector3(world.x, world.y, world.z));
    tutPanel.pos = V(local.x, local.y, local.z);
    tutPanel.xdir = V(xdir.x, xdir.y, xdir.z);
    tutPanel.ydir = V(ydir.x, ydir.y, ydir.z);
    tutPanel.zdir = V(zdir.x, zdir.y, zdir.z);
    if (tutSkipChip) {
      var chipworld = player.localToWorld(V(0.245, 1.1, -0.6));
      var chiplocal = tutWorldToParent(new THREE.Vector3(chipworld.x, chipworld.y, chipworld.z));
      tutSkipChip.pos = V(chiplocal.x, chiplocal.y, chiplocal.z);
      tutSkipChip.xdir = V(xdir.x, xdir.y, xdir.z);
      tutSkipChip.ydir = V(ydir.x, ydir.y, ydir.z);
      tutSkipChip.zdir = V(zdir.x, zdir.y, zdir.z);
    }
    if (tutCheck) {
      var checkworld = player.localToWorld(V(-0.38, 1.145, -0.6));
      var checklocal = tutWorldToParent(new THREE.Vector3(checkworld.x, checkworld.y, checkworld.z));
      tutCheck.pos = V(checklocal.x, checklocal.y, checklocal.z);
      tutCheck.xdir = V(xdir.x, xdir.y, xdir.z);
      tutCheck.ydir = V(ydir.x, ydir.y, ydir.z);
      tutCheck.zdir = V(zdir.x, zdir.y, zdir.z);
    }
  }
  elation.events.add(janus.engine, 'engine_frame', tutFollow);
  if (tutSkipChip) {
    tutSkipChip.addEventListener('click', function() {
      if (tut.active && !tut.advancing && tut.editorOpen) tutAdvance();
    });
  }
  function tutBindUiBtn() {
    var b = tutUiBtn();
    if (!b || b._tutBound) return;
    b._tutBound = true;
    b.addEventListener('activate', function() { tut.editorOpen = true; if (tut.active) tutShow(false); });
    b.addEventListener('deactivate', function() { tut.editorOpen = false; });
  }

  room.addEventListener('edit', function() { tut.flags.edited = true; });
  tutSetPanel(tutIdleHTML);
  // both bays carry a start button; each starts its own chapter, pressing
  // the same button mid-chapter shuts the tour down, pressing the OTHER
  // bay's button switches chapters (editor UI stays open)
  function tutWireButton(btn, chapter) {
    if (!btn) return;
    btn.addEventListener('click', function() {
      var b = tutUiBtn();
      tutBindUiBtn();
      if (tut.active && tut.chapter == chapter) {
        tutStop(true);
        if (b && b.deactivate) { b.deactivate(); tut.editorOpen = false; }
      } else {
        if (tut.active) tutStop(false);
        if (b && b.activate) { b.activate(); tut.editorOpen = true; }
        tutStart(chapter);
      }
      btn.col = '#eafff0';
      setTimeout(function() { btn.col = '#43ff6e'; }, 150);
    });
  }
  tutWireButton(editBtn, 'editor');
  tutWireButton(room.objects['mk-button'], 'markup');

  // markup hall: the room's live source as a world-anchored panel. The
  // xrmenu-popup renders the editor app's source view (read-only, jmldark,
  // xml-highlighted); scene_changed reconciliation keeps it current for
  // free. Created once the editor app's elements are defined - the webui
  // loads lazily on first Enter.
  (function() {
    var anchor = room.objects['markup-panel-anchor'];
    if (!anchor) return;
    var tries = 0;
    var iv = setInterval(function() {
      var ready = window.elation && elation.elements.janus && elation.elements.janus.ui &&
                  elation.elements.janus.ui.editor && elation.elements.janus.ui.editor.source;
      if (ready) {
        clearInterval(iv);
        // pickable so the panel receives mouse/controller raycast events
        // (wheel scroll, click-to-select, typing); collidable false so it
        // never blocks movement. focusable: clicking engages the panel -
        // outline, pointer released, player parked, keyboard captured -
        // until a click lands anywhere that isn't the panel. Not readonly:
        // edits made here flow through room.updateSource and reshape the
        // world live - the whole point of the markup hall.
        anchor.createObject('xrmenu-popup', {
          content: 'janus-ui-editor-source',
          contentattrs: { theme: 'jmldark', embedded: 1 },
          width: 1120,
          height: 700,
          pickable: true,
          collidable: false,
          focusable: true,
          outlinecol: '#43ff6e',
        });
      } else if (++tries > 240) {
        clearInterval(iv);
      }
    }, 500);
  })();
};

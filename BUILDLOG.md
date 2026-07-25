# janusxr.org build log

A running record of how this site came to be — the process, the decisions, and the design
inspiration behind them. Kept so that others can understand how we got here and build on it.
Newest entries at the bottom.

---

## 2026-07-20 — Kickoff and spec

The project started from a simple observation ([PLAN.md](PLAN.md)): janusxr.org was still
the 2019 company-era page, centered entirely on the retired native client, with no sign the
project was alive. The goal: a new canonical site that embraces JanusXR as an open,
web-first project — and that *demonstrates* the engine's defining trick by being built with
it. The page loads as a normal 2D website; interacting with it reveals you're inside a
Janus room, with the site's sections arranged as exhibits in a shared multiplayer space.

Key decisions made in the first planning session, now formalized in [SPEC.md](SPEC.md):

- **HTML-first.** The document is real semantic HTML, fully readable in lynx, with the 3D
  layer consuming and decorating the DOM. SEO, accessibility, and graceful degradation are
  hard requirements, not afterthoughts — the informational content must never live only in
  the 3D layer.
- **Camera snaps, not scrolljacking.** Scrolling moves the camera between fixed per-section
  viewpoints rather than continuously driving it. Native scroll semantics keep working.
- **An obvious Enter affordance** releases the user from the scroll rail into free
  navigation of the same space. Sections become exhibits you can walk up to.
- **Multiplayer always on.** Every Janus room has multiplayer by default, and the landing
  room is no exception — even first-time visitors scrolling the "normal website" see other
  avatars in the space. There's no stronger proof the project is alive.
- **No stored visitor modes.** First-timers and veterans see the same page, differentiated
  by visual hierarchy, not saved state. Components may accumulate client-side state
  (history, bookmarks) through use.
- **Positioning:** exactly between a web framework (React, Angular) and a game engine
  (Unity, Roblox) — spanning in-world UGC editing, static markup-only worlds, and fully
  scripted custom entities.
- **Docs are a separate project**, but the site reserves their URL namespace and links each
  build ramp into it.
- **Phased build:** the complete 2D semantic site ships first (already an improvement over
  the status quo), the 3D reveal second, depth features third.

## 2026-07-21 — Content archaeology and voice

Surveyed the existing sites and the
[JanusXR Messaging](https://github.com/jbaicoianu/janusweb/wiki/JanusXR-Messaging) wiki
page. The messaging page turned out to be a voice document: an open-ended "JanusXR is
______" list — *"a labor of love," "sometimes a bit janky," "still alive," "the metaverse,"
"not the metaverse."* That register — enthusiastic, self-aware, never corporate — became
the site's specified voice, and the fill-in-the-blank list itself became a design element:
a terminal-style line that types out rotating completions (degrading, for no-JS readers, to
the full list as plain text — they get *more*, not less).

Also inventoried which 2019-era copy survives (the portals framing, "as simple as hosting a
text file") and which doesn't. Domain strategy settled: janusxr.org is the front door;
web.janusxr.org stays as the versioned engine-build host; the client points home to
janusxr.org.

## 2026-07-21 — Designing the space

With the spec stable, attention turned to the 3D space itself. The guiding question: how do
you turn what used to be a 2D menu into a place, where **your choice is implied by your use
of the space**?

Inspirations gathered:

- **The Quake start area.** You spawn in a room with ambience and three hallways; walking
  down one *is* selecting your difficulty. No UI, just geography. Notably, much of what
  makes that room memorable is its *sound* — ambience is a first-class part of each theme,
  not a garnish.
- **The "three doors" web pattern.** A classic effective layout: hero/brand up top, and
  above the fold, three guided directions — "ProductX for users / for developers / for
  business." This matters because it shows 2D web design is *already* hub-and-spoke: the
  fold is a plaza, the three doors are wings. The 2D and 3D readings of our site aren't in
  tension; they're the same pattern at different dimensionalities.
- **Disneyland's navigation design.** The entry sequence decompresses you into a central
  plaza; themed lands radiate outward; and each land advertises itself with a "weenie" —
  Walt Disney's term for a visual magnet on the horizon (the castle, Space Mountain) that
  pulls you toward a destination while the choice still feels entirely yours. Traffic flow
  is authored; freedom is felt. That's precisely the balance a guided-but-free museum
  space needs.

The resulting layout concept — **hub-and-spoke with an orbital scroll**:

- Spawn is a central atrium (the hero). Major sections are wings radiating off it.
- In document mode, scrolling doesn't walk a path — the camera *orbits the atrium*, coming
  to rest facing into each wing in document order. Hitting Enter drops you onto the floor
  at the center, where the wings become the Quake hallways.
- **Every wing gets a weenie**: a landmark visible from the atrium that advertises what's
  down it.
- The **Build wing** is the literal Quake homage: three short halls for the three
  authorship ramps (editor / markup / scripting), each dressed to foreshadow its content,
  each ending in a portal.
- The **Timeline wing** is a corridor where distance = years (2010 Elation Engine → 2014
  FireBox → 2015 JanusVR, Inc. → 2016 JanusWeb → 2019 JanusXR.org), with era exhibits that
  can portal into era-representative content — archaeology, not plaques.
- The **Explore wing** gets the daylight: portals to featured worlds like departure gates,
  the most tempting sightline from spawn.

And the structural idea that makes the whole thing tractable: **the space is styleable**.
The layout is authored as a semantically-named greybox (wings, halls, exhibit mounts,
portal frames, light anchors), and a *theme* is a bundle that binds to those names —
materials, assets, skybox, props, soundscape. Structure and presentation separate, exactly
like HTML and CSS, one layer up. The messaging page had already blessed this:
*"JanusXR is… whiteboxable."* Candidate themes so far: **PHOSPHOR** (green vector
wireframe, CRT lineage — essentially styled greybox, the natural launch theme), **GRID**
(Tron neon), **GALLERY** (stark modern museum), **OVERGROWTH** (forest ruins). A live
in-world theme switcher is the stretch goal — and itself a demo of scripting and custom
entities.

Also decided today: keep this build log.

## 2026-07-21 — Lobby archaeology

Before designing the new plaza, we went back through the old ones. JanusVR's lobbies were
the site's spiritual predecessors — the place users actually congregated — and we reviewed
screenshots spanning every generation (early greybox platforms in the clouds, the 2014
FireBox courtyard, the beta.vrsites atrium, the JanusVR "newlobby," and the mature
night-time lobby whose full JML source survives in `old/www.janusvr.com/home2/`).

A consistent design language runs through all of them:

- **A monument at the center.** Every generation centers on a landmark: the FireBox era
  had a pillar crowned with gyroscopic rings and a user-counter plinth; later lobbies had
  a central column rising from an octagonal fountain pool, its rim doubling as seating.
  The plaza fountain planned for the new site isn't a new idea — it's an inheritance.
- **A perimeter of doors.** The mature lobby's JML defines 24 numbered portal doors
  ringing the space, plus oversized "big doors" for major destinations (reddit, wiki,
  VRSites). Open congregating floor in the middle, destinations around the edge —
  hub-and-spoke at room scale, decades before we drew our floor plan.
- **The world teaches the world.** Instruction was diegetic: a giant gamepad diagram on
  the wall of the earliest greybox lobby, "Information Booth — stand near and click this
  screen for help," "Did you know…" tip strips, edit-mode reference panels wrapped around
  the central pillar. No overlay tutorials; the room itself is the manual.
- **The room shows its own pulse.** A flag-counter of "Janus VR users" by country and
  live server stats were mounted in-world as architectural features — proof of life,
  displayed like a civic monument.
- **Alive even when empty.** Water (a custom water shader plus `water.wav` ambience),
  palms in planters, banners overhead, sky openings, warm pooled lighting over wooden
  boardwalk floors — and animated walking-figure mannequins driven by a blendshape script.
  The lobby read as social and inhabited even with nobody in it.
- **Mezzanines and overlooks.** Ramps up to a viewing ring above the plaza floor for
  people-watching and orientation.

Consequences for the new space: the central **logo + fountain monument** is confirmed as
the plaza's castle (an homage with direct lineage — possibly reusing the original water
shader); diegetic signage and "did you know" strips return as the museum's wayfinding
voice; live project stats belong on the monument base; ambience (water audio, planting,
banner motion) is required equipment for a space that must feel inviting without other
visitors present. And one structural unification: the old lobbies' **mezzanine** gives the
document-mode camera a diegetic home — the scroll orbit's viewpoints can sit on a physical
overlook ring, so free-roaming visitors can climb to the exact vantage points that
scrolling readers see. The 2D and 3D audiences literally share the same architecture.

Also: the earliest lobby screenshot is a plain grey tiled platform floating in clouds,
dressed with nothing but signs — the project's first space was a greybox with wayfinding.
PHOSPHOR-as-styled-greybox has prior art in the project's own history.

## 2026-07-21 — SPACE.md: the space design formalized

Ideation converged and was formalized in [SPACE.md](SPACE.md): the plaza-and-five-wings
floor plan with the entry threshold → mezzanine orbit → floor sequence, per-wing weenies,
the greybox anchor contract, and four named themes (PHOSPHOR launching). Notable decisions
sharpened during review:

- **The monument is a coin.** The two-faced Janus head mark, extruded like a 3D coin,
  rotating above the fountain. The original vector art survives in the old site's widget
  and press assets.
- **Open source is a headline, not a footer.** An early draft parked the GitHub repos on
  a colophon plaque; that was exactly backwards. The community being able to build the
  project *is the product's primary selling point*, so the Build wing gained a
  culminating **open-source hall**: a living workshop with a live GitHub project board
  (commits, issues, planning — with a build-time snapshot as the no-JS fallback) and
  ways-in placards for contribution at every level, from bug reports to engine code.
- **The Timeline became a subway station.** Rather than a corridor of Janus history, the
  wing descends into an art gallery in a decommissioned subway station: Janus's own
  history (2010–present) occupies the central platform as museum dioramas, a tube to the
  left runs into the deep past of virtual spaces (MUDs, Habitat, VRML, ActiveWorlds, SGI,
  Netscape…), and a tube to the right runs into the future. The past tube's curatorial
  through-line is the recurring **battle between corporate dominance and open standards**,
  spatialized; the future tube is a clean, well-lit whitebox-to-wireframe construction
  site — the future isn't built yet, and the exhibit invites you to help build it.
  The point of the architecture: Janus sits in the *middle* of this history, not at its
  end.
- **No fake people.** Ambient life comes from the environment — water, light, banners,
  sound — and from real visitors. An idea to resurrect the old lobby's animated
  mannequins as "docents" was cut: the space must feel inviting when empty without
  pretending it isn't.

## 2026-07-21 — Phase 1: the document

Built the complete 2D site — per the phasing plan, this ships on its own and is already
a better janusxr.org than the status quo. What exists now:

- **`index.html`** — the full semantic document: hero, What-is (with the complete
  "JanusXR is ______" list in plain HTML), Explore, Get (including the legacy vault),
  Build (four ramps, deployment modes, and the open-source hall with all five core
  repos), the three-part subway Timeline (past tube with corporate/open era tags ·
  Janus station 2010–present · future tube), and footer. Section and sub-element ids
  follow SPACE.md's mount contract (`#whatis-spectrum`, `#build-opensource`,
  `#timeline-past`…), so the 3D layer binds to this exact document in Phase 2.
- **`css/phosphor.css`** — the PHOSPHOR theme's 2D face: design tokens as CSS custom
  properties (the same tokens the 3D theme will consume), green-on-near-black, mono
  headings, faint scanlines, a pure-CSS perspective grid under the hero, and the
  original two-faced Janus mark — recovered from the old site's widget assets as
  clean stroke-only SVG — spinning as a coin above the wordmark, prefiguring the
  plaza monument. `prefers-reduced-motion` disables all animation.
- **`js/site.js`** — progressive enhancement only, ~120 lines: the typing animation
  for the "JanusXR is ______" line (no-JS readers get the full list instead — more,
  not less), and a GitHub commits feed for the open-source hall's "what's happening
  right now" board, with the static fallback already in the DOM. The page is fully
  functional with this file deleted.

Verified against the spec's Tier 0 hard requirement by rendering the entire page in
lynx — all content, navigation, and links read cleanly with no CSS or JS at all — and
visually via headless-Chrome screenshots of every section.

Not yet done (known, deliberate): `/docs/*` routes point at the reserved namespace and
will 404 until redirects to existing material are configured; featured-worlds gates are
honest placeholders; the community chat link awaits confirmation of the right channel;
native-client archive links point at the janusvr GitHub org pending a curated archive
page.

## 2026-07-21 — Phase 2: the reveal

The page is now a room. Work began with a deep survey of the JanusWeb engine source
(local checkout) to ground the integration in real APIs rather than guesses. Findings
that shaped the build:

- The engine's embedding story is exactly our architecture: include `janusweb.js`
  (pinned: `https://web.janusxr.org/1.7.4/janusweb.js`, ~4.8 MB, loaded after first
  paint), call `elation.janusweb.init({url, container, …})`, get back a scriptable
  client. The engine's own build ships `<janus-viewer src="./index.html">` — "project
  this document in 3D" — so the page-as-room pattern has first-party rails.
- What exists: `player.disable()/enable()` (the document-mode/free-roam toggle),
  `player.lookAtLERP` (orientation tweening), `<paragraph selector>` (HTML-to-texture
  snapshots of live page DOM), `<websurface>` (live iframes on CSS3D planes),
  `room_load_complete` and friends. What doesn't: scroll-driven cameras and viewpoint
  systems exist only as prototype custom components (`pagescroll`, `scrollpath`), and
  nothing auto-maps arbitrary page DOM onto surfaces. That host-page glue is what
  Phase 2 built.
- The engine auto-resolves unknown JML tags against the **custom component registry**
  (currently the prototype components.json on baicoianu.com) — so the room uses
  `<Water>` for the fountain today, and `triggerzone`, `layout`, `labelset` et al. are
  available for the exhibits. The FIVARS 2026 world was surveyed as the state of the
  art for modern Janus worlds: room-in-an-HTML-comment inside `<janus-viewer>`,
  `uiconfig` for restyled engine UI, `assetsound` ambience, glb navmeshes, and
  scripted onboarding (fast-travel directory, floor paths) — all patterns earmarked
  for the theming/depth phases.

What shipped:

- **`room/lobby.html`** — the greybox landing room, every SPACE.md anchor present
  under its contract name: plaza, entry corridor, monument (pedestal + rotating coin +
  `<Water>` fountain), octagonal mezzanine ring with two ramps, five wings at their
  bearings with wayfinding labels, `<Paragraph selector>` mounts snapshotting the live
  document's sections onto wing walls, Vesta/JanusWeb portals in the Explore wing, and
  invisible `vp-*` viewpoint markers.
- **`js/reveal.js`** — the hydration and choreography layer: engine loads idle-time
  after first paint (skipped entirely on no-WebGL or data-saver — the page stays 2D);
  on `room_load_complete` the player is disabled, the `room-live` state fades the CSS
  hero backdrop out in favor of the real room, and scrolling snaps the camera between
  mezzanine viewpoints with an eased tween (instant under `prefers-reduced-motion`).
  Viewpoint positions are read from the room's `vp-*` markers — the room is the source
  of truth, the JS table is the fallback. Enter hands over the controls
  (`player.enable()`, chat on, document hidden, exit chip appears); Escape or the chip
  returns to the document exactly where you left it. Every engine touchpoint is
  wrapped so failure at any step leaves a working 2D page.
- Verified end-to-end in headless Chrome with software GL: the engine boots, the room
  hydrates behind the document, and the hero framing shows the corridor → plaza →
  monument sightline. Tier 0 re-verified in lynx — the new machinery adds nothing to
  the no-JS reading.

Deferred with intent: the scroll choreography should eventually become a finished
`scrollsnap`/viewpoints custom component contributed back to janus-custom-components
(the current host-page implementation is the prototype); `scrollpath` is the natural
upgrade for curving the orbit around the plaza; onboarding triggerzones, ambience, and
the PHOSPHOR uiconfig belong to the theming phase.

## 2026-07-21 — From cubes to architecture

The greybox graduated from a pile of JML cubes to real geometry:
`tools/build-lobby-glb.py` procedurally generates `room/models/lobby.glb` (~215 KB,
12k tris) — circular plaza floor with an emissive phosphor ring inlay, arched mouths
on every wing and the entry corridor, a true annulus mezzanine with rail and glowing
handrail cap, sloped ramps, and the octagonal fountain basin with a glowing lip —
plus `room/models/coin.glb`: the actual Janus mark from the site's SVG, stroked,
extruded, and set in a circular rim. The generator is parametric and checked in, so
the layout stays regenerable; the room file now owns only what isn't architecture
(spawn, water, text, portals, mounts, viewpoint markers).

Debugging notes for posterity:

- The `<Water>` component defaults to a 1000×1000 ocean — the first render flooded
  the entire plaza. `sizex`/`sizey` scope it to the basin.
- The `<Paragraph>` translator runs its CSS selector against the *fetched room
  document*, not the live host page — mounts in a separate room file need
  `url="../index.html"` to snapshot the site's sections.
- Headless verification of a live multiplayer engine is its own adventure: Chrome's
  virtual-time budget never expires while the presence websocket keeps timers alive
  (and software-GL frames make virtual time crawl), so the screenshot harness moved
  to puppeteer with real wall-clock waits. Worth it: the smoke test showed
  `[MultiplayerManager] connected` — the always-on presence requirement works, from
  a headless browser in a CI-shaped environment, with zero configuration.

Verified via puppeteer captures: hero framing with the coin spinning over the plaza,
scroll-snap to the Build bay with the document translucent over the world, and the
full Enter handoff — free-roam at spawn, collision holding, exit chip live.

## 2026-07-21 — Postmortem: the physics collapse

Playtesting the glTF room found the scene "collapsing" — the immediate suspicion was
an object explosion. Measurement said otherwise: 1 engine instance, 23 room objects,
200 scene nodes, all stable… at **0.2 frames per second**. Not too many objects — one
catastphrophically expensive frame.

A CPU profile named the culprit instantly: **93.5% of all time in `_collectPairs`**,
the physics broadphase. The mechanism: the octree inserts each body into every leaf
its AABB overlaps, and subdivides any leaf over capacity. The glTF room's mesh
collider is a set of large, flat, mutually-overlapping shapes — a 34m plaza disc, a
26m mezzanine ring, five wing slabs — which no amount of subdivision can separate.
The tree subdivides to max depth across the entire overlap volume, and pair
collection then walks an enormous tree doing string-keyed dedup per leaf. Triangle
count was irrelevant: a 592-tri collision mesh was barely better (0.4fps) than the
12k-tri visual mesh (0.2fps).

The fix: **primitive proxy collision**. The glTF stays visual-only; ~20 invisible
`collision_id="cube"` boxes (the original cube-greybox layout, which the octree
separates cleanly since floors and mezzanine live in distinct y-slabs) carry all the
physics. Result: 9.2fps under software rendering — identical to running with no
collision at all. Physics is free again; free-roam verified standing on the proxies.

Lessons recorded: mesh colliders are currently a trap for architecture-scale
geometry in JanusWeb — use primitive proxies for buildings until the broadphase
handles large static AABBs (engine issue to be filed upstream; the profile and
reproduction live in this repo's history). And measure before theorizing: the
"too many objects" hypothesis was reasonable, popular, and wrong.

## 2026-07-21 — Iterating the space in playtest loop

A rapid sequence of design iterations driven by walking the actual room, each one
committed separately. The arc of it:

- **Dressing** (corridor ribs, glowing edge strips, radial paths, colonnade,
  pergolas, benches, PHOSPHOR skybox) — then a **character pass** when "dressed"
  still read as uninspired: the plaza floor became a circuit board (PCB traces,
  radar rings), the monument gained a 36m light beacon with ascending halo rings,
  and the wing mouths became circular portal doorways — the coin's echo at every
  threshold.
- **The occlusion wars.** The corridor arches swallowed the monument; taller
  crescendo arches didn't satisfy; the answer was **broken arches** — columns with
  arc stubs that spring inward and stop, tops deliberately missing, because virtual
  architecture owes gravity nothing. This became the space's signature motif.
- **The mezzanine died.** First cut open to 320° to clear the coin sightline, then
  removed entirely — it occluded more than it offered. The scroll viewpoints moved
  to a low orbit (~4m radius) around the fountain, each looking out through its
  wing's portal ring. Its ghost returned as the **halo ring**: a thin, purely
  decorative band floating unsupported over the plaza, broken across the south so
  Main Street stays sacred — the mezzanine's silhouette without its bulk.
- **The seamless threshold.** Spawn and the document-mode hero camera unified at
  the corridor threshold, at floor level: the page's opening framing and the view
  you inhabit on Enter are the same view. Pressing Enter moves nothing but agency.
- Sundry tuning: coin lowered to 7.2m with the beacon split to skip its band
  (fountain → laser → coin → laser → rings), a `polar()` bearing flip caught and
  fixed (which had put the mezzanine cut and the benches on the wrong sides), and
  a dt-in-milliseconds bug in the coin bob — the same units mistake the original
  home2 lobby script guarded against with a divide-by-1000. Traditions run deep.

## 2026-07-22 — One document: the room moves inside the page

The room markup moved from `room/lobby.html` into `index.html` itself — inside the
`<janus-viewer>` element, wrapped in an HTML comment so the 2d page never renders
it. The page is now literally its own room: one URL, one document, two readings.
This also fixes the `<Paragraph selector>` mounts properly — they resolve against
the same document the reader is looking at, instead of a separately-fetched room
file (the `url="../index.html"` workaround is gone).

Two things learned on the way:

- **HTML comments don't nest.** The room markup's own section comments had to be
  stripped when it moved inside the outer comment wrapper — an inner `-->` would
  have terminated the whole thing and dumped raw JML into the visible page.

## 2026-07-22 — The wings become exhibits

With the page-as-room structure settled, the wings filled in against the SPACE.md
plan. The section placards decomposed into 17 per-element mounts — each card,
callout, and widget from the document now hangs as its own styled picture at eye
level between the pilasters (after a round of "too big, too high, and embedded in
the wall"). Build outgrew the standard wing and became 12×26m: entry gallery,
three genuine hallways with their ramp cards as door signage — the editor hall
strewn with blocks, the markup hall lined with source-glow, the scripting hall
running a spinning machine core — and an open-source chamber at the back with the
server racks and the community placard on the end wall. The What-is obelisk got
its voice: a room script cycles "JanusXR is ______" completions pulled live from
the document's own list — the same source the 2d typer and no-JS readers see.
The Mirror got its caption ("you're already running it"), the era plinths their
years, Vesta its grand gate, and every wing the corridor's skirting glow.

Along the way the paragraph pipeline grew up: the `css` attribute accepts a
stylesheet URL (fetched, cached, inlined), CSS text is XML-escaped before hitting
the SVG rasterizer (a single `&` in a comment had been silently killing every
styled render — the missing `onerror` that hid this is also fixed), and the
snapshot honors per-mount texture dimensions instead of a hardcoded 1024². All
engine-side, pending release; the site carries marked shims until then.

## 2026-07-23 — The outdoor pivot: three lands, a valley, and the edge of reality

The biggest restructure since the space was first drawn, in two moves that landed
together.

**Consolidation.** Five wings became three: Get's content folded into Learn (what
it is → how to have it, one land), and Travel folded into Explore as **History**.
The nav is four verbs now — Learn · Explore · Build · Ascend — and the document
merged to match, ids and mounts renamed `history-*`.

**The pivot.** A correction mid-planning reshaped everything: this space is
**outdoors by default**. The park metaphor — Disneyland's esplanades and lands —
governs; interior metaphors like Grand Central were explicitly set aside (its
*function*, optimized through-flow with clear paths to destinations, survives;
its architecture doesn't). The plaza became a semi-enclosed **shrine on a
hilltop**, its north rim opening to an **overlook** at the head of an 18m grand
stair descending five meters into a **valley esplanade**: a glowing promenade
with the **history station** on its west side (an open-fronted pavilion — era
plinths, tunnel mouths, the train analogy leaning in), showcase plinths and
gates to the east, and project gates near the far end — Vesta's grand gate among
them.

And the borders: the world now ends the way reality ends in *The Thirteenth
Floor* — a reference reaching back to Elation Engine's beginnings. Solid ground
dissolves into scattered patches, a bright seam of light rings the edge, and
beyond it there is only green wireframe over blackness, rising into wireframe
hills at the horizon. The simulation admits what it is at its edges — which, for
a project whose launch theme is styled greybox, is not a confession but a thesis.
The promenade runs straight at that horizon; the gates beside it are the actual
ways past the edge. `vp-explore` moved to the overlook, so the Explore section's
document-mode framing is now the valley vista entire.

A follow-up correction closed the loop: the first version's rectangular wings
jutted out east and west, and from down in the valley they loomed like the walls
of the Forbidden Palace — precisely the wrong feeling for an open park. The
wings became **curved cloister halls**: annular corridors hugging the plaza,
entered at the same doorways, walked as a curve back toward Main Street, ending
against the corridor's walls. The exhibits rehung along the arcs (outer wall
facing in, inner wall facing out, the typewriter on Learn's far cap, Build's
three-door bays curved into the sweep), and from the esplanade the shrine now
reads as a single compact crown on its hill.

The scene also got its skeleton: content now lives in **movable groups** —
`lobby-group` (shrine, halls, corridor, stair) and `esplanade-group` (valley
content), each a parent object the whole assembly can be repositioned by, with
the ground and Thirteenth Floor border staying put as the world frame (three
GLB exports now instead of one). First use of the new freedom: everything
shifted +20z, recentering the build inside the border circle — the valley had
been running out past the solid ground into the dissolution band. Collision
verified intact under the group transforms.
- **The engine's `<janus-viewer>` parse path didn't survive the comment.** The
  fireboxroom regex tradition tolerated comment-wrapped markup by accident of
  extraction order (the regex plucks the block *out of* the comment); the newer
  janus-viewer path extracts the whole element — comment markers included — and
  DOMParser then treats the markup as a comment node: empty room, default sky,
  the ocean again. Fixed upstream in janusweb's `room.js` (strip comment markers
  in the janus-viewer branch, pending release); until the site pins a release
  containing it, `reveal.js` carries a small parser shim, clearly marked TEMP.

## 2026-07-24 — Stamped for review

Wording and style tweaks (content column now left-aligned, giving the world more
room to show through), and a blueprint **title block** in the bottom-right corner:
project name, STATUS: work in progress, STAGE: 1 — whiteboxing, SCALE: 1:1, hidden
on mobile, persistent even in free-roam. The site is about to go somewhere others
can walk it and give feedback, and a whitebox should say it is one — the stamp is
the honest label on the drawing.

## 2026-07-24 — Deep links that actually land

Loading `/#explore` looked right for a moment, then the page smooth-scrolled
back to the top. Two culprits, stacked:

- **The engine's mobile URL-bar hack.** A `window.scrollTo(0, 1)` on load —
  the ancient iOS trick for hiding the address bar — fired unconditionally,
  stomping the browser's anchor scroll, and the page's `scroll-behavior:
  smooth` turned that into a visible glide to the top. Fixed upstream in
  janusweb's `client.js`: the nudge now only fires when there's no hash and
  the page is unscrolled — the one situation it was ever meant for.
- **`room-live` moves the anchors.** When the room comes alive the section
  margins expand (the 2D column spreads out to pace the 3D walk), roughly
  doubling the document height *after* the browser already did its hash
  scroll — so even without the engine's stomp, the link's target section had
  drifted well below where you were left standing. `reveal.js` now re-asserts
  the hash the moment `room-live` lands (instant, suppress-scroll — the same
  machinery exit-restore uses), skipped if you've already scrolled somewhere
  yourself.

Verified with a scrollY-over-time probe: `/#explore` now settles with the
Explore section under the header, scrollspy agreeing, and the camera on the
explore viewpoint; a plain load still starts at hero, untouched.

## 2026-07-24 — Learn wall geometry, unlit panels, station orientation

Three fixes from a walkthrough:

- **Learn's posters vs. the pilasters.** Every outer-wall poster in the Learn
  hall straddled a pilaster — the mounts had been placed by mirroring Build's
  bearings, but the two halls' pilaster rhythms start from different origins,
  so what cleared in Build collided in Learn (and the legacy panel clipped the
  balcony-exit doorway). All five outer-wall mounts re-bearinged to the clear
  gap centers between pilasters (204°–268°, one per bay).
- **The typewriter greets you now.** "JanusXR is …" moved from the far cap —
  where you'd only find it after walking the whole hall — to the outer wall at
  284°, dead ahead in the widest clear span when you step through the entrance.
- **Paragraphs go unlit.** All `<Paragraph>` mounts now carry
  `lighting="false"` (MeshBasicMaterial): the panels are self-illuminated
  signage, and reading them shouldn't depend on where the lighting pass has
  gotten to. Verified via material probe.
- **History station straightened out.** The "this station" panel had been
  floating at the platform's center line, its top poking through the canopy —
  now properly hung on the rear wall, sized to fit under the roof. Past and
  future swapped sides (past now south/dim ring, future north/bright ring —
  the generator comment had always *said* past-south, but the code did the
  opposite), and the era plinth labels flipped with them so 2010 sits nearest
  the past tunnel and the timeline reads oldest-to-newest as you walk through.

## 2026-07-24 — Station labels legible

The PAST/FUTURE wall labels used `◂`/`▸` triangles the 3D text font doesn't
cover (rendered as fallback boxes), and after the side-swap they sat *behind*
their posters — placed between wall face and poster plane. Swapped to ASCII
`<`/`>`, moved both labels proud of the poster planes and up into the clear
band between poster top and canopy. Added the missing third sign: PRESENT,
over the rear-wall station panel, poster dropped and resized to make room —
the three walls now read < PAST · PRESENT · FUTURE > around the platform.
Verified by bounding-box probe (poster spans y −4.75..−1.35: clear of canopy
and platform) and captures of all three walls.

## 2026-07-24 — Hall poster pass: hug the walls, greet the door

Walkthrough feedback, both halls:

- **Learn's inner-wall posters** hung 0.7m off the wall (r18.3 against a wall
  face at r17.6) — reading as floating panels, not signage. All four pulled in
  to r17.75, matching the outer wall's 0.2m standoff.
- **The Mirror and vault rings removed.** The two leftover circles at Learn's
  far end — the Mirror ring (outer wall, 193°) and the vault ring/door (inner
  wall, 202°), absorbed from the old Get wing — never earned their keep in the
  merged hall. Gone, along with the mirror's caption text.
- **Build's deploy poster overlapped the entryway** — centered at 92° with the
  entrance gap ending at 91.5°. Re-bearinged to 100°, and both Build inner-wall
  posters pulled in to r17.75 like Learn's.
- **Build's outer-wall posters dropped** from y3.1 to y2.0 — they were hung
  above eye level.
- **The open-source placard greets you now.** Same treatment as Learn's
  typewriter: moved from the far cap to the outer wall at 80°, dead ahead
  through the entrance, resized to 4:3 inside its structural frame — which
  traveled with it in the generator. Build's first impression is the project's
  first message: built in the open.

## 2026-07-25 — Let there be moonlight

Lighting pass on the esplanade, and a first for the whole scene: a
**shadow-casting directional light** (`light-sun`, pale phosphor-white from
high southwest). The engine's directional lights keep their ortho shadow
camera centered on the player (±light_range box), so one 2048px shadow map
serves the whole walkable world at decent texel density instead of trying to
cover 140m in one static box. The halo ring now throws a soft arc across the
plaza floor, and the station canopy actually shades its platform.

The esplanade's local lights got a general lift — station, promenade pair,
and gates brightened; new fills over the showcase plinths and the stair base,
so the valley reads as a lit destination from the overlook instead of a void
with signs in it.

## 2026-07-25 — Shadow acne treatment

The first shadow pass speckled — classic acne from a big ortho shadow volume
self-shadowing at shallow angles. Two-part fix:

- **Engine:** `januslight.js` now exposes `light_shadow_normalbias` (three.js
  `shadow.normalBias` — offsets the depth comparison along the surface normal,
  the modern cure for acne on lit slopes; pending release with the other
  engine changes).
- **Room:** the sun gets `light_shadow_normalbias="0.2"` with a small negative
  depth bias to hold contacts tight, and the three architecture objects
  (world, lobby, esplanade) set `shadow_side="front"` so backfaces render
  into the shadow map — closed extruded solids self-shadow much more cleanly
  from the inside surface than the lit one.

## 2026-07-25 — Normals, welded and split

With real directional light in the scene, the geometry's dirty secret showed:
patchy light/dark facets on the halo band, gradient fans across flat faces,
diagonal shading seams on walls. Not unwelded vertices — the opposite.
trimesh's `extrude_polygon` welds cap and wall vertices, so the GLB export
wrote *smooth* vertex normals averaged across 90° edges: every corner vertex
leaned its normal between floor and wall, and big flat faces interpolated
gradients between corners. (The coin had the same defect, masked by its
unlit material.)

Fix in one choke point: `place()` now runs every part through
`trimesh.graph.smooth_shade(angle=35°)` before export — edges sharper than
35° get split vertices (flat faces shade flat), gentler runs like the halo
band's 64 segments keep shared normals (curves stay smooth). Model files
grew ~60% from the duplicated vertices; shading artifacts gone across the
board. GLBs bumped to ?v=3.

## 2026-07-25 — The hill turns right-side out

The plaza's conical skirt — the hill the shrine stands on — had inverted
normals: `trimesh.creation.revolve` winds its surface from the profile
direction, and the profile ran top-down (plaza edge to ground), producing
faces that pointed into the earth. From the valley the hillside rendered
inside-out. Profile reversed to run bottom-up; the only revolve in the
generator, so nothing else affected. The hill now shades as a proper lit
slope from the valley floor. GLBs at ?v=4.

## 2026-07-25 — The hill meets the floor and yields to the stairs

The skirt's radii were never coordinated with its neighbors: its top rim
started at r19 — two meters outside the r17 plaza slab, a floating shelf gap —
and its base ran to r26, burying the upper stair treads inside the hillside.
Reprofiled to r17→24, with the top vertex tucked just under the slab edge so
the seam can't show. The hill now falls away slightly faster than the stair
descends, so a solid ramp slab went in under the treads to close the
underside — the staircase reads as cut into the hill's north face, treads
emerging cleanly, hill flanks framing it. GLBs at ?v=5.

## 2026-07-25 — Closing the underworld

Two ground-truth fixes in the valley:

- **The void under the plaza is sealed.** The halls' radial end walls and the
  corridor's side walls stopped at floor level, leaving the underside of the
  whole shrine ring open to view from the valley — an unsightly structural
  void. All of them now carry foundations down to the ground (both radial
  ends of each wing, corridor sides, and a sill across the corridor's south
  end). The balcony still floats — it overlooks the void on purpose; now it's
  the only thing that does.
- **The pavilion floor shimmer.** The station pad hovered 5mm above the
  ground plane, the promenade centerline likewise, and a dozen pieces (canopy
  posts, tunnel rings, gates, showcase plinths) sat *exactly* at ground
  level — coplanar faces that z-fight at distance with double-sided GLB
  materials. New rule applied across the valley: pieces interpenetrate,
  never kiss. The pad is thicker with its bottom buried and a proper 25cm
  platform lip on top; everything else sinks 5cm into the ground. GLBs ?v=7.

## 2026-07-25 — Pavilion foundation, properly inside

The station still shimmered after the sink pass, and the diagnosis (James's)
was exact: the platform pad's footprint matched the walls' OUTER extents, so
the pad's side faces were coplanar with the wall faces along the entire base
— and the threshold strip ran its ends into the same planes. The pad now
spans the walls' interior, tucked 0.1 into each wall body so the surfaces
interpenetrate rather than align, keeping a small lip past the open east
edge; the strip shortened to stop shy of the walls and sits buried 2cm into
the pad. The walls stand on the ground now, sunk 5cm in and grown taller to
keep meeting the canopy. Rule refined: footprints of nested elements should
never share a boundary plane. GLBs ?v=8.

## 2026-07-25 — The sun stops following you around

James caught the beacon's shadow sliding across the Build wall as he walked —
directional-light shadows changing angle with player movement, which no sun
should do. Engine bug in `januslight.js`: the player-tracking shadow volume
computed each frame's light direction as `configured pos − target pos`, but
the target had been moved to the *player's position* the frame before — so
the effective bearing was `2·pos − player`, swinging as you moved. Rewritten:
the configured pos is now a pure fixed bearing; only the shadow volume's
center follows the player (and lights with an explicit `light_target` are
left alone entirely). Verified by probing the light vector at three player
positions — identical bearing at all three. Pending release with the other
engine changes.

Also: the promenade's glowing centerline stopped 1.2m short of the stair
base after the tenth tread was removed — extended to tuck under the bottom
tread. GLBs ?v=9.

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

## 2026-07-25 — Why the coin wouldn't spin

The coin's `angular="0 .2 0"` did nothing, and neither did
`rotate_deg_per_sec`. Two stacked engine bugs, found by live-probing the
property system (the JML parse, string→vector coercion, and spawn plumbing
all checked out one by one):

- **The sleep system ate slow spins.** The physics sleep threshold treats
  motion below `|v|² + |ω|² = 0.3` as "settling" — and *zeroes the body's
  velocities* when it dozes off. Any spin slower than ~63°/s froze half a
  second after load. But damping defaults to off: undamped constant motion
  never decays, so it's intentional animation, not a body coming to rest.
  `rigidbody.js` now refuses to sleep a body whose motion is undamped.
- **`updateRotationSpeed` clobbered `angular`.** It runs unconditionally
  after dynamics creation, and since `rotate_axis` has a non-empty default,
  an object with no `rotate_deg_per_sec` wrote axis × 0 into the body —
  which shares its angular-velocity vector with the `angular` property.
  Setting `angular` was thus erased microseconds later. It now writes only
  when a rotation speed is actually in play (with a latch so setting the
  speed back to 0 still stops a spinner).

Verified: the coin turns 0.6 rad in 3.0s at ω=0.2 — numerically exact. Both
fixes pending release with the other engine changes.

Also: the under-stair ramp was exactly as wide as the treads, z-fighting at
their ends — narrowed 0.3m so the treads overhang it. GLBs ?v=10.

## 2026-07-25 — Enter always means *this* world

Clicking Enter before the room finished loading bounced to the hosted web
client — the button's no-JS fallback href, falling through because the click
handler was only wired after room load (and even then deliberately deferred
to the href when not ready). That fallback made sense when this page was a
2D brochure; now that the page *is* the world, it's wrong. Enter buttons are
wired at script start: once we've committed to running the engine, clicks
always stay here — an early click queues the entry and drops you in the
moment the room is ready. The href remains for Tier 0 and no-WebGL browsers,
where the hosted client genuinely is the only way in.

And the coin steps into the light: `lighting` back on, emissive dialed from
full phosphor down to a soft glow, roughness 0.2 with a bit of metalness —
it now reads as a spinning minted object rather than a flat neon cutout.
GLBs ?v=11.

## 2026-07-26 — The system map and the media shelf

Issue #1 called for the history exhibit's centerpiece: metaverse history as
a transit system map. We now have it, built from existing documentation as
the issue insists — a CC BY-SA timeline chart
chart (CC BY-SA 4.0), transcribed as a **node graph**
(`data/history/graph.json`): seven ordered lines (Web3D, Worlds, Games,
Format, Graphics, Hardware, Company), ~90 stations with fame/influence
carried over from the source, decade zones, and sparse maker/lineage ties.
The graph is the durable artifact — contributors add stations to JSON, the
poster regenerates.

The generator (`tools/history-map/`, dependency-free ES modules that run in
Node today and could run in the page tomorrow) lays it out **hybrid Beck**:
freeform octilinear routing with rounded bends, but stations confined to
their decade's zone band. Interchanges (Unreal, Unity) pull lines together
at double-ring stations; label sides alternate along each line with angled
labels for the dense clusters; per-node hints are the hand-tuning escape
hatch, as with any real transit map. The Web3D line runs phosphor green —
VRML viewers through Elation/FireBox/JanusVR/JanusWeb/JanusXR to a "You are
here" station — and continues, dashed, past the light seam into a
wireframed "the future" zone. `build.mjs` writes the SVG and rasterizes a
4096px PNG through the same headless Chrome the capture rig uses.

In the page: a figure in #history with the attribution. In the world: a
freestanding **system map board** by the station's platform edge, angled at
arrivals from the stairs. And fiction got a better home than a map line —
the **media shelf** on the station's rear wall: eight cases (True Names,
TRON, Neuromancer, the Habitat postmortem, Snow Crash, Designing Virtual
Worlds, SAO, Ready Player One) that were nearly unclickable until we
learned the janus way: `pickable` doesn't give an object a pick collider —
`collision_id` does; the CPU picker raycasts the colliders scene, and
without one the ray sailed through to the sky sphere 9.6km out. Click a
case, its card fills the detail panel; click the panel, the read/watch link
opens. The same eight live in #history as "The reading list" for Tier 0.

Verified end-to-end with a scripted walkthrough: enter, walk to the shelf,
real click on a case (panel re-renders), real click on the panel (new tab
to OpenLibrary). Not yet committed — awaiting review.

## 2026-07-28 — The map learns what it's about: epoch hubs

v1 of the system map was honest but inert — seven parallel lines that never
met, a swimlane chart in transit-map clothes. James named the missing idea:
history clusters. Waves of projects crest around moments when an enabling
technology makes a new generation possible, and the map should braid at
those moments. v2 restructures around **epoch hubs** — six grand capsule
interchanges on a central spine (TIMESHARING '62, THE PC & DIAL-UP '80, THE
CONSUMER INTERNET '95, BROADBAND & WEB 2.0 '04, THE VR SPRING '13, THE AI
MOMENT '23), metro-style vertical names inside tall capsules. Every line of
a generation converges into its hub and fans back out; between hubs, lines
relax to home tracks. The knots-and-calm rhythm is the historical claim.

The flat Company Line became the **Enablers Line** — IBM, Apple, Sun, SGI,
Netscape, 3dfx, NVIDIA, Google, Oculus, Meta, OpenAI — the leaps that made
each wave possible, threading every hub. World-specific companies retired
to dashed maker-ties. Text+games merged into one Games Line (MUD1 to UEFN).
Fiction left the map for the media shelf. And people now appear as **named
transfer corridors** — dotted arcs: Carmack carries the idea from Doom to
the Rift, Rosedale from Second Life to High Fidelity, Pesce & Parisi from
Labyrinth to VRML, Morningstar & Farmer from Habitat onward.

Decades demoted to a thin ruler at the bottom; clusters may spill their
decade (it's a ruler, not a wall — stations spill, epochs anchor). Layout
learned hub capsule slots (lines stack through an interchange without
crossing inside it) and to never let one line's relaxation drag a shared
hub. Editorial calls worth recording: Labyrinth precedes the '95 hub as its
seed; glTF rides out of the VR Spring with the Format line; FireBox is born
of the VR Spring on the map exactly as it was in life. Still uncommitted.

## 2026-07-28 — Reach: careers as routes

Three refinements from review. Decade labels dropped their "s" — a ruler
says "1990", not "1990s". The You-are-here arrival straightened: the Web3D
line now exits THE AI MOMENT dead level and runs off the right edge through
the future boundary — no climb, just onward.

And the map learned to show **reach** — entities that touched many
technologies across eras. Companies got reach ties (IBM feeds both the
timesharing and PC hubs; SGI ties to IRIS GL and Open Inventor; Apple's
dashed line crosses the entire map from 1977 to Vision Pro). For people,
the transit grammar scales better than arcs: **a career as a route**. John
Carmack is now a dotted personal service line calling at Doom, Quake, Rift
DK1, glTF, Quest 2, Meta, and Horizon Worlds — one thread of a person
carrying the idea through four epochs. Service lines ride through stations
without owning them (no interchange rings, no layout influence), so the
network's structure stays product-shaped while the people move through it.

## 2026-07-28 — Freight topology: sidings, feeders, and through-trunks

The contiguous-line model forced siblings into fake lineages (WorldsAway →
Worlds Chat → The Palace reads as descent; they were parallel bets). James
called the fix: **branching freight structure**. Lines are now sets of
branch paths — a trunk plus feeders and sidings — declared in the data as
`branches: [{path, dy}]`. Dead projects end in terminus stub bars off a
hub's ladder; surviving lineages run through; feeders merge in (Doom's
action lineage and LambdaMOO's text lineage both flow into the '95 hub;
the MMO branch rejoins at Broadband). Convergence is now drawn, not
implied: the VRML browser fan collapses back to one thread — Cosmo through
Vivaty to Elation — that carries into the VR Spring and becomes Janus.
Editorial corrections along the way: Active Worlds and Cybertown split
into separate sidings (different companies — Cybertown was blaxxun's);
VRM branches off glTF rather than following it; the Epic trunk runs
Quake → Unreal → Fortnite → UEFN as one continuous route.

Layout learned per-branch offsets, per-path spacing, and terminus
detection (a station touched by exactly one segment gets the freight-yard
bar, angled across its approach). Siding labels sit to the right of their
stubs like platform signs. The map finally looks like what the history
was: many parallel attempts, a few survivors, everything meeting at the
same handful of stations.

## 2026-07-28 — Branches begin things too

James: branches aren't just dead ends — they're beginnings. The cycle the
map should show is cambrian explosion → convergence → one or two clear
winners per category. So origins became free-standing feeder branches that
merge IN: Spacewar! is now an origin terminus feeding the TIMESHARING hub;
Maze War and the Adventure→MUD1 text lineage converge into THE PC &
DIAL-UP as independent births; Doom's and LambdaMOO's lineages already
arrived at '95 separately. And winners now ride OUT: glTF and USD both
emerge from the VR Spring's format explosion and merge into THE AI
MOMENT — two winners where there were once a dozen formats. The terminus
bar reads both ways: an ending at the right edge of a fan, a beginning at
the left edge of a feeder.

## 2026-07-28 — Flows, not funerals

James: the terminus bars declared technologies dead, and that was never the
point — the point is the brackets, and the sometimes-non-obvious tracks
that got us to today. So: buffer stops removed (sidings now simply end at
their last station), and **threads** promoted to the map's main device for
flow. Threads are dotted service routes — a person or company riding
through stations across lines and epochs:

- **Microsoft** — PC hub → Consumer Internet → DirectX → Broadband →
  Minecraft → AltspaceVR → OpenAI. Ownership and partnership drawn as
  continuity; the DirectX and AltspaceVR "stubs" now visibly flow onward.
- **John Carmack** (existing) — Doom → Quake → Rift → glTF → Quest → Meta
  → Horizon Worlds.
- **Philip Rosedale** — Second Life → High Fidelity (arc promoted to
  thread).
- **Tim Sweeney** — Unreal → Fortnite → UEFN.

Plus a missing enabler: **NeXT** joins the Enablers line (1988 — NeXTSTEP
hosted both the first web browser and Doom's development, tie drawn to
Doom), with a Steve Jobs person-arc linking Apple ↔ NeXT. Legend
reorganized into two rows: lines above, threads and glyph key below.
Everything remains uncommitted for review.

## 2026-07-28 — v3: the knowledge graph

The history project became its own project (data/history/SPEC.md). The
poster's flat graph.json split into three layers: a **knowledge graph**
(entities/<track>.json + relations.json — typed, dated, every relation
cited), a **curation layer** (map/poster.json — lines, branches, hints,
and now per-station year and label overrides, because IBM was founded in
1911 but stations at its System/360 moment, and "Universal Scene
Description" is a fine name but a terrible label), and the renderers.
Migration was verified bit-identical before anything new landed.

Then six research agents fanned out in parallel — worlds, games, graphics,
formats+web3d, hardware, companies+people — each returning structured,
source-cited JSON. After reconciliation (rename maps, dedupe, track
routing): **303 entities, 483 relations**, from Sensorama and Sketchpad to
Resonite and Vision Pro, including the stories the poster could never
hold: the Fahrenheit treaty, the VRML 2.0 spec war (Moving Worlds vs
ActiveVRML), the id-alumni and SGI diasporas, Rosedale's full loop back to
Linden as CTO, Worlds Inc's patent-troll afterlife, and our own lineage
cited to the primary sources.

The drill-down arrived as **line diagrams** — one dense strip map per
track (tools/history-map/diagram.js): every entity drawn as a lifespan
bar, lineage chains sharing rails (Habitat → Club Caribe → Fujitsu
Habitat → WorldsAway rides one line; Wolfenstein → Doom → Quake → GoldSrc
→ Half-Life → Counter-Strike another), competitors interval-packed onto
parallel rails, built-on dependencies as dashed drops, ongoing bars
running off the right edge. The 2D page gained "Ride a line" — six
collapsible diagrams under the system map. Still to come: mounting the
strip maps in the 3D station (pending diagram review), poster enrichment
from the new graph (WoW, Valve, three.js all earned candidacies), and the
click-card drill-down. Nothing committed.

## 2026-07-28 — The research reaches the poster

James caught the gap: the knowledge graph was feeding the diagrams but the
poster's curation hadn't moved. Enrichment pass, chosen for what it does
to the branching story: Wolfenstein 3D feeds Doom; the Valve lineage forks
off Quake (Half-Life → Counter-Strike → Steam) and merges back at
Broadband; the MMO branch runs straight through the hub to World of
Warcraft; three.js rides WebGL into the VR Spring (the rail Janus actually
arrived on); CUDA branches out of Broadband and merges into the AI Moment;
the hardware line now calls at the Consumer Internet (Virtual Boy, the
90s bust's cautionary siding) and fans the 2016 headset war (Vive,
PlayStation VR, HoloLens) out of the VR Spring; OpenSimulator forks off
Second Life; Rec Room joins the social-VR fan; WorldView joins the
browser ladder; and Tony Parisi became the fifth thread — Labyrinth →
WorldView → Vivaty → glTF → Unity, three decades of one person carrying
the 3D web across lines. Poster assets at ?v=8.

## 2026-07-28 — The critic's gauntlet

James set the bar: iterate until a critical agent obsessed with accuracy,
attributability, and aesthetic beauty passes the map. Four adversarial
review rounds, each a fresh set of eyes with a ruler and a grudge.

Round 1 (FAIL) caught real sins: the Carmack thread claimed glTF and
Horizon Worlds with no backing relations — drawn as fact, sourced as
nothing. Cut to what the graph proves (Doom → Quake → Rift DK1 → Quest 2
→ Meta, with the E3 2012 demo relation added and sourced). The
Morningstar & Farmer arc overclaimed; it's Randy Farmer's alone now. And
the curation layer got a conscience: every thread stop and person arc now
build-fails unless a relation backs it (directly, or via a role at an org
that touches the stop). The loophole where poster.json could draw
unsourced history is closed.

Round 2 (FAIL) broke the hand-hinting habit. A dozen label collisions
fixed by hand had spawned a dozen new ones, so the renderer grew an
automatic label placer: candidate positions scored against other labels,
sampled line geometry, hub capsules, thread and arc labels, canvas
bounds — with association costs so a label may not drift from its dot or
let a foreign line run between them. Epoch hubs also became true anchors:
the min-spacing pass now compresses predecessors instead of shoving hubs
off their year (the VR Spring had slid to 2015; it sits at 2013 and Rift
DK1 precedes Vive, as history demands).

Round 3 (FAIL, narrowly) measured the axis with a ruler: WoW three years
late, SGI predating its own products, Adventure west of Maze War. Fixes:
stations exiting a hub hug it; SGI precedes Sun (Nov '81 vs Feb '82);
the games bay was structurally decompressed (tracks respaced, branch rows
spread, fame fonts shaved) because no placer can fix a bay that has more
label than space. Vivaty's Microsoft exit got a primary source — Parisi's
own resume.

Round 4: PASS. "Would I hang it? Yes." The last three blemishes —
Maze War masquerading as Adventure's label, EVE's vertical through
Steam's ring, Neos VR adrift — died in the same pass that gave every
label a background-colored halo knockout, so the rare label that must
touch a line (Rift CV1, in a provably full fan bay) stays legible.
Data warts closed: FireBox (2013) now predates JanusVR (2014), VRML97
sits at 1997, High Fidelity the platform and High Fidelity, Inc. are
distinct entities with roles pointing at the company. Poster at ?v=9,
line diagrams at ?v=2. Known future work, per the critic's log: the
1980s enablers run still drifts late (NeXT reads ~1990); editorial year
pins (IBM at System/360, Google at IPO) have no on-poster convention
mark; decade labels center on bands while ticks mark boundaries.
Nothing committed.

## 2026-07-28 — Every line gets its arrow

Two James calls: "The AI Moment" is now "THE RISE OF AI", and the
subtitle's promise — every line is still running — is finally drawn
rather than implied. The You-are-here continuation was generalized:
every line now exits its rightmost stop and runs dashed into the future
band, parallel to the axis, arrowhead at the edge. Worlds, formats, and
the enablers leave straight out of the AI hub's slots as a tight bundle;
games continues from UEFN, hardware from Vision Pro, graphics from its
CUDA call at the hub; the green line still carries the You-are-here
station on its way out. The label placer samples the new runs so nothing
drifts onto them. Map at ?v=10.

## 2026-07-28 — Beginnings come in from the left

James named the dissonance: origin stubs exiting rightward read as
endings to an English-reading eye. The fix honors chronology while
flipping the grammar — stub branches whose stations belong to their
moment (station year ≤ hub year + 1) are now feeders that come in from
the left and merge into the hub; only genuinely later offshoots still
spring out to the right. Hubs finally read as true interchanges:
the '95 browser ladder and the '95 worlds ladder both converge into the
Consumer Internet; DirectX, Virtual Boy, Roblox, COLLADA, and High
Fidelity feed their moments. Three were exempted to protect famous
orderings — SM64 stays right of the hub (it must not draw beside Doom),
Gear VR and Cardboard stay right (mobile VR followed DK1). Layout
learned two tricks: a feeder terminating at a hub can never push the
hub off its year, and hub approaches route diagonal-first so a fan's
shared vertical rides the hub column instead of braiding at each
station's x. Map at ?v=11.

## 2026-07-28 — Stations serve neighborhoods

James found the deeper break in the metaphor: there's no 7-11 stop and
a supermarket stop — businesses cluster, and each neighborhood gets one
station. Drawing every project as its own stop both starved the map of
context (110 of 303 entities drawn) and lied structurally: a line
through five contemporaneous chat worlds asserts a succession that never
happened. v4 answer: **districts** — one squared stop serving a whole
scene, with the members as a small-type roster under the name,
unordered, which is the honest shape of a rivalry. Ten districts so
far: the VRML browsers, the chat worlds, the web worlds (There, IMVU,
Habbo, Club Penguin, Gaia, Blue Mars, PS Home — seven names that never
fit before), social VR, MUDs & MOOs, the early MMOs (Meridian 59
through EVE), the VR lab era, the headset war, mobile VR, and the
immersive web. Landmarks (fame 3) and anything a thread, tie, or arc
touches keep individual stations — Grand Central is still Grand
Central. Validation gained district rules: ids can't shadow entities,
members must exist and relate to a co-member, and nobody can be both a
station and a roster line. A dozen sourced sibling relations (the
browser war, the post-EQ MMO field, VPL's glove in NASA's lab) entered
the graph to satisfy the co-member rule — the district idiom is already
making the knowledge graph denser. Legend grew a third row. Map at
?v=12; SPEC.md formalizes the district concept.

## 2026-07-28 — Neighborhoods become clouds

Two James notes: the "The" prefixes went ("VRML browsers", "Chat
worlds", "Headset war" — tighter everywhere), and districts stopped
pretending to be stations. No more squared glyph with a list beside it:
a neighborhood is now an amorphous cloud — a wobbled organic region
tinted with its line's color, the member names living inside it, the
line dipping into the blob and emerging toward its hub. The wobble is
deterministic (seeded from the district id) so builds stay
reproducible. Clouds paint beneath the lines like park shading on a
metro map; names paint above everything with their halos. The label
placer reserves the cloud's footprint so neighbors keep out. Mobile VR
moved to the calm side of the hardware trunk after a three-way brawl
with Rift DK1's label in the 60px between the graphics trunk and the
ruler. Legend's district glyph is now a tiny cloud. Map at ?v=13.

## 2026-07-28 — Regions, not blobs

James course-corrected the clouds: neighborhoods should speak the map's
own design language, keep a stop glyph, and be true regions — able to
hold several stations, the way the Janus lineage all lives in the
immersive web. Districts now render as rounded convex hulls (metro
fare-zone shading: hull of everything enclosed, offset outward, corners
rounded) instead of wobbled amoebas, the district stop glyph is back on
the line (ring with a line-colored core, serving the roster), and
districts gained `contains` — individually-drawn stations the region
encloses. Immersive web wraps Elation Engine, FireBox, JanusVR,
JanusWeb, and JanusXR; Social VR wraps AltspaceVR, High Fidelity,
VRChat, and Neos VR; the VRML browsers region claims Labyrinth,
WorldView, and Cosmo Player; MUD1, Ultima Online, WorldsAway, CAVE,
Rift CV1, and Second Life each anchor their scenes. "The" dropped from
every district label. Map at ?v=14.

## 2026-07-29 — The editor bay gets a big green button

First contents for the build wing: the editor hall now teaches by
letting you touch. A dark plinth carries a glowing green button —
"PRESS TO EDIT" — that toggles the real JanusWeb editor right where you
stand (the same toggle F1 drives, one state machine, no desync), and
beside it sits a playground: pink cube, blue sphere, orange cylinder,
purple torus, a floating EDIT ME, and a fountain of green ember
particles. Everything in the playground is markup-declared, so it shows
up in the editor's scene tree and View Source — the station practices
the view-source ethic it preaches.

Three discoveries shaped the build. The site boots the engine with
showui:false so the 2D page stays chrome-free — which silently meant no
webui, no editor, no F1; the fix is lazy UI (client.createUI() on first
Enter, hidden again on exit — createUI is public and idempotent, and
uiconfig resolves at engine start regardless). The editor's locked flag
walks the ancestor chain, so the playground had to live in its own
editor-bay group outside lobby-group; the rest of the station is now
locked="true" and refuses selection. And particles need no texture at
all: without image_id the shader draws plain colored square points —
additive green pixels, which on a phosphor terminal is not a fallback
but the correct aesthetic.

lobby.js at ?v=10. The editor card on the 2D page now points at the
button. Nothing committed.

Post-script, with egg on face: the first cut of the bay markup included
an HTML comment header — inside the page-level comment that wraps the
whole FireBoxRoom block. The inner `-->` terminated the wrapper early
and spilled half the room source into the live DOM as unstyled
elements, which ate every click and scroll on the page. James spotted
it in the source in about a minute. Rule now on file: no HTML comments
inside the room markup, ever.

## 2026-07-29 — Tab stays in the editor

Engine fix pair: Tab and Shift+Tab cycle manipulation modes while
editing an object, but the browser's default Tab was simultaneously
walking focus out of the world — mode would change AND the page would
scroll to some focused button. The controls system already had the
right mechanism (capturekeys preventDefaults the raw event; someone had
even left 'keyboard_tab' commented out in the defaults, wisely — global
capture would break page tab-navigation for keyboard users). The fix
scopes it: the editor now enables keyboard_tab capture exactly while
the roomedit context is active and releases it after, at all four
activate/deactivate sites. Along the way, disableKeyboardCapture had an
inverted guard (idx == -1 then splice) that made it pop the *last*
capture key whenever asked to remove one that wasn't there — fixed.
Engine rebuilt; changes uncommitted with the rest of the engine work.

## 2026-07-29 — Properties get 3D hands

The editor grew the extension point James remembered planning: floating
in-world UIs per property type. Tab already cycled through every typed
property of a selected object — the type metadata was sitting right
there in the thing definitions — but only pos/rotation/scale had any
3D presence, and the transform gizmo would linger, stale, while you
tabbed through col or lighting. Now setMode is type-aware: transform
properties drive TransformControls as always; any other property looks
up its TYPE in a registry of 3D property UIs, parks the gizmo, and
floats the matching editor next to the object.

First registrant: a color picker — hue ring around a
saturation/value square with a live swatch, canvas-textured planes on
the editor's overlay layer, billboarded to the player, TransformControls
idioms throughout (own raycaster, the transforming flag so a drag isn't
mistaken for an edit-confirm click, drags tracked against the rig's
plane so sliding off the ring doesn't drop the handle). Changes flow
through the same path as the 2D inspector — set, sync, refresh — so the
r/g/b fields follow the wheel and the wheel follows typed hex, and it
binds to whatever color property the mode landed on, col or emissive or
rand_col alike. Engine media assets only; no rebuild, hardlinks
preserved, nothing committed.

## 2026-07-29 — The bay becomes a teacher

"PRESS TO EDIT" now means it: the green button opens the editor and
starts an eight-step walk-through on a panel floating over the
pedestal — pick something up, move it, Tab to rotate, Tab to scale,
Tab to the color wheel, set it down, ctrl+right-click to ride an
object on your crosshair, copy and paste. The whole tutorial is
site-side observation, zero engine hooks: the editor already tells
anyone who watches — roomedit.object while a session runs, a bubbling
'edit' event on every confirm, objectinfo.mode as Tab cycles,
roomedit.raycast during crosshair placement, roomedit.pastebuffer on
ctrl+c. lobby.js polls five times a second, snapshots a baseline when
each step begins, and advances on the delta. Leniency by design: any
playground object counts, and clicking the panel skips a step. Closing
the editor mid-tour pauses it; the button restarts it; finishing
leaves a card that says the truth — everything you just learned works
in every Janus world. lobby.js at ?v=11.

## 2026-07-29 — The tour dialog learns to float

Two James notes on the tutorial. First, readability: the Paragraph
textures were rendering black-on-dark — the engine wraps panel content
in .paragraphcontainer and nothing styled it, so phosphor.css now owns
that scope (ink text, green headings and bolds, dim italics for the
click-hint line). The media shelf's detail card inherits the fix for
free. Second, ergonomics: a wall-mounted instruction card is easy to
walk away from mid-lesson, so while the tour runs the panel unhooks
from its pedestal mount and floats at the bottom of your view,
following the camera with a 0.18 lerp lag so it trails comfortably
instead of being bolted to your eyeballs, always tilted to face you.
Idle, it parks back on its home pose above the pedestal — the bay
still advertises the tour to passers-by. Skip-by-clicking still works
in flight; the collider rides along. lobby.js at ?v=12; paragraph css
refs at ?v=2.

## 2026-07-29 — The dialog floats properly this time

First floating attempt was bad two ways: misaligned (hand-derived
group offset instead of real parent-space math) and it fought the
lesson — a bottom-center panel with a collider sits exactly between
you and the floor objects the tour asks you to click, and eats the
picks. A DOM overlay was floated as the fix and rightly rejected:
this has to work in VR, so it stays in-world. The rework: lazy-follow
(the panel holds still in the world while you aim; it only glides to
a fresh lower-left anchor once you've turned or moved ~a meter — the
wrist-menu pattern, kinder in VR than continuous tracking), the
anchor moved out of the floor-object corridor, position converted
through the panel parent's actual worldToLocal, and the panel's
collider removed in flight so every scene pick passes through.
Skipping moved to a small SKIP chip that rides the dialog's lower
edge with its own tiny collider. Parked, everything restores — 
collider back, home pose, chip hidden. lobby.js at ?v=13.

## 2026-07-29 — Signs stay upright

James called out the tracking math: deriving the panel's facing from
the full 3D camera-to-panel vector fed pitch into fwd, and the engine's
basis derivation turned that into off-axis roll — a tilted, drifting
sign. The correct idiom, per James: anchor in PLAYER BODY space.
player.localToWorld() places the dialog at a fixed offset beside your
view each frame — the body yaws but never pitches, so height stays
steady — and the facing vector is flattened to the horizontal before
normalizing, so the sign is upright by construction, in VR and on
desktop alike. The lazy-glide state machine went away entirely; a
static body-relative placement is simpler and predictable. lobby.js
at ?v=14.

## 2026-07-29 — Glass, scale, and a real checkmark

Polish round on the floating tour dialog, all James's eye: the card's
backdrop is now tinted glass (back_alpha 0.55 over a deep green — the
Paragraph element had rgba support all along), it shrank to 60% and
dropped a touch lower, and the completion tick stopped being a
character in the title. It's geometry now — two green emissive bars
forming a full-height checkmark that appears to the left of the whole
card during the step-complete beat, drawn always-on-top like the rest
of the overlay. helvetiker may or may not own U+2713; boxes always
render. One splice bug caught in review: the skip chip's transform
update had landed inside the checkmark's guard, which would have
frozen the chip in space for anyone whose room lacked the check
object. lobby.js at ?v=19.

## 2026-07-29 — Wheel lessons, and the sign becomes the banner

The PRESS TO EDIT text is gone: the tutorial banner itself now hangs
low over the button as the bay's sign — one surface instead of two,
and its idle copy already says press the green button. And the tour
grew from eight steps to eleven: after each of the move/rotate/scale
drags comes a wheel lesson, because the scroll wheel is the editor's
precision tool. The bindings were read from the engine before being
taught, and they're quirky enough to matter: for vectors (position,
scale) plain scroll works the Y axis with ALT for X and SHIFT for Z;
for rotation plain scroll is yaw with CTRL for pitch and SHIFT for
roll — the modifier-to-axis map genuinely differs between the two, and
the tour now says so truthfully. lobby.js at ?v=22.

## 2026-07-29 — Gray clones and a proper graduation

Two fixes. The mystery of the gray paste: janusbase's clone() lists
'color' in its skipprops, so the property loop continue'd past it —
which made the loop's own "special handling for color" below
unreachable, dead code guarding an assignment that never ran. Every
cloned object silently dropped its color and came out default gray.
The carry-over now happens after the loop, where skipprops can't eat
it. Engine rebuilt.

And the tour now ends like it means it: completing the final step
keeps the big green checkmark up beside the "you know the editor now"
card for eight seconds — a proper graduation moment instead of the
card instantly teleporting back to the pedestal behind you — before
everything parks and the bay returns to its idle invitation. Starting
a new tour during the linger cancels the pending reset cleanly.
lobby.js at ?v=27.

## 2026-07-29 — The panel double-exposure

James's screenshot showed the editor's right panel printing "Scene"
over "Inventory" and tree rows over the search box. Not a z-order
mystery: editor.css gave the inventory `flex: 0` — flex-basis zero, a
zero-height box — while inventory.css demanded height:100%. Basis
wins in a flex column, the box collapsed, and its contents overflowed
straight over the scene tree stacked correctly beneath it. Inventory
now gets a real share (flex 1 1 30%, min-height 0, overflow hidden)
and drops the height:100% claim. Also from the same screenshot: the
clone-color engine fix is confirmed live — the pasted sphere came out
pink, not gray. Checkmark nudged twice by eye to (-0.38, 1.145);
lobby.js at ?v=31.

## 2026-07-29 — The paste lag flurry

James profiled it: pasting triggered seconds of repeated timer-fired
tasks, each reading offsetParent and forcing layout dozens of times.
The chain: ui-panel installs a subtree MutationObserver that calls
refresh() — and for non-deferred elements, base refresh() renders
SYNCHRONOUSLY. Paste enters raycast-follow, the property inspector
rewrites its inputs every frame, several mutation batches per frame
hit every panel on screen, and each one ran updateLayout(), whose
very first line reads offsetParent — a forced layout — even for
corner-anchored panels that then just write style constants. Answer
to the question asked: yes the observer needed coalescing (one rAF
per frame per panel now, same pattern the element render loop already
uses), but the debounce alone wasn't the whole cure — updateLayout now
checks isConnected (free) instead of offsetParent, and only panels
that truly measure themselves (middle/center) ever touch layout state.
Engine rebuilt.

## 2026-07-29 — Clones join the scene tree

Pasted objects weren't appearing in the scene editor. Not a regression
— a sibling of the gray-clone bug that was never fixed: persist is an
engine-level flag stored under properties.persist rather than as a
flat accessor, so clone()'s property loop read this['persist'] as
undefined and every clone was born persist:false — exactly what the
scene tree's addNode filters out (and what world saves would skip).
The drop and inventory-spawn paths had dodged this years ago by
passing persist:true explicitly; clone() now carries it at the source,
so cut/paste and any future cloner inherit the fix. Engine rebuilt.

## 2026-07-29 — The tree's locked door, and a courtesy scroll

Third time was the charm on pasted objects missing from the scene
tree, and the real villain was upstream of both prior fixes: the
room-script proxy never exposed `persist` at all. addNode reads
data.persist off the proxy from getObjectById — undefined for every
object ever — so the gate silently rejected every live thing_add.
Markup objects only appeared because the initial tree build treats
undefined visibility as visible. The clone had likely been persisting
correctly the whole time; the tree just refused everyone at the door.
persist is now a proxied property (which also lets room scripts read
it), the addNode gate falls back to the thing itself for robustness,
and — per James — selecting any object in the world now smooth-scrolls
the scene tree to its row (block: nearest, so no jump when it's
already visible). Engine rebuilt.

## 2026-07-29 — The group that swallowed thing_add, and six severed links

James called the shape of it exactly: the playground primitives live
inside the editor-bay group, and thing_add only fires on the DIRECT
parent — so objects created under a child group announced themselves
to the group, and the room (where the scene tree listens) never heard.
Inventory spawns worked because their parent is the room itself.
room.createObject now re-announces on the room for any object created
under a non-room parent, so group children, pastes, and remote spawns
all reach the tree.

And the reason "the fixes aren't showing up": six engine script files
had silently severed their hardlinks to the copies the build actually
consumes — room.js among them, meaning today's room.js work was
building from a stale twin. All six pairs showed scripts/ newer;
relinked with ln -f and rebuilt. The webui chain also gained cache
busting (uiconfig ?v=2 through default.json through editor.json
scripts) so editor.js updates actually reach the browser, and
revealNode reads item-or-value off tree rows to match the treeview's
actual property naming. Engine rebuilt for real this time.

## 2026-07-29 — Phantom twins at the tree root

James nailed the last scene-tree mystery himself: room.objects is a
flat js_id registry — nested objects are registered there too — and
the tree root was ingesting it wholesale. Every object inside a group
grew a phantom twin at root level, the js_id-keyed row map pointed at
whichever twin was built last, and selection sync faithfully scrolled
to the wrong one. refreshList now filters the root to objects whose
parent is the room itself (or unregistered), leaving nested objects to
appear only where they belong: under their parents. Selection sync
highlights and scrolls the true row. webui chain at v4.

## 2026-07-29 — Delete deletes now

Deleting an edited object left it selected in the tree and the
property pane — because locally, nothing was deleted at all.
editObjectDelete pushed the object onto room.deletions, which turns
out to be the outbound multiplayer sync ledger (drained by
getDeletions into <type id js_id/> strings), not a removal queue; the
actual removeObject call sat commented out beside it. Delete now
removes through the parent (removeChild, with janusbase's own
remove-fallbacks), which cascades properly: janusbase announces
thing_remove at the room level for group children (the mirror of the
thing_add fix), onThingRemove feeds the sync ledger, the scene tree
drops the row — including its descendants, after fixing treeview
removeItem's key cleanup, which read the usually-undefined t.value
and left stale _itemsByKey entries pointing at dead rows — and a new
objectinfo.clear() empties the property pane instead of showing a
ghost. webui chain at v6, engine rebuilt.

## 2026-07-30 — The 2D page stops competing with the pavilion

James redrew the boundary: the document's explore section kept only
the system map — the six line diagrams and the reading list are gone
from the 2D page, replaced by a pointer that sends readers down the
grand stair to the history pavilion, which is the point of having
built it. The diagram SVGs stay in assets for the pavilion (or a
dedicated page) later; the station's mounted exhibits (past tube,
platform, future tube) kept their DOM sources. The stale graph.json
link in the map caption now points at data/history/. And the build
section's editor card shed its step-by-step tutorial synopsis — it
says what matters (simple in-world building tools, taught hands-on at
the green button) in three lines instead of eight.

## 2026-07-30 — Attribution, withdrawn by request

The author of the chart our history map grew from has asked not to be
cited, a request CC BY-SA section 3(a)(3) obliges us to honor. The
name is removed from the rendered posters, the page caption, and both
specs; the derivative's own CC BY-SA 4.0 licensing is unchanged, as is
the share-alike obligation it carries.

## 2026-07-30 — The source becomes a place

The markup hall now shows the room's living source in-world: the
editor app's real CodeMirror view — xml-highlighted, jmldark-themed —
rendered onto a three-meter panel through xrmenu-popup's foreignObject
pipeline, reconciling on every scene change. Getting CodeMirror
through that pipeline took two engine fixes it was always going to
need: HTML serialization emits &nbsp; (undefined in XML — one
non-breaking space killed the whole render, and CodeMirror lines are
full of them), and the data URI was raw concatenation (any # or %
truncated it). Entities are now numeric, the payload is encoded once,
and the stylesheet blob is XML-escaped at collection instead of
pre-encoded. xrmenu-popup grew contentattrs (its content tag can now
receive attributes) and pickable/collidable pass-through so a phase-1
display panel neither eats picks nor blocks walking; the source view
grew readonly/theme/embedded plumbing (readOnly nocursor, hint addons
skipped, fills its container).

And per James, the tour became two chapters enterable from either
end: the editor bay teaches the hands, the markup hall — with its own
green button and mini playground — teaches the source by readout
(drag a cube, watch pos rewrite; repaint, watch col follow). Each
chapter's graduation points at the other until both are done, then
the grand card: every Janus world is readable, editable markup.
Phase 2 (touching the panel itself) waits on keyboard and wheel
proxying. lobby.js at ?v=32, webui chain at v8.

## 2026-07-30 — Two bugs from the markup hall, one of them mine twice over

James's first in-world session with the source panel surfaced two
bugs. First: xrmenu blindly prepended the CORS proxy to every
stylesheet URL, which breaks the moment you test from localhost — the
proxy can't reach your dev server. The assets system already knows
when to bypass (blob:, data:, already-proxied, same-origin), so that
logic is now a shared helper, elation.engine.assets.getProxiedURL(),
and xrmenu's shadow stylesheets, the pipeline's stylesheet collector,
and the image inliner all route through it — the last of which also
retires a hardcoded p.janusvr.com proxy hack that predates the
configurable corsproxy.

Second: "Error generating image from HTML," panel black. The console
dump James pasted showed the data URI in the OLD unencoded shape —
which turned out to be the honest truth: the entity/encoding fix the
previous entry describes had never actually landed. The patch script
asserted on a later edit AFTER doing the updateCanvas replacement
in memory, died, and never wrote the file; the "verification" grep
then matched an unrelated encodeURIComponent(data in the bundle.
Lesson relearned: verify the source, not a string that happens to
appear in a megabyte of bundle. The fix is now really in (grep shows
it at elements.js:692 and :705), the bundle is rebuilt, and a
headless CDP harness proves the whole chain end-to-end: enter the
world, wait for the staging container, pierce its shadow root, sample
the canvas — 162 CodeMirror lines, jmldark applied, 97% of pixels
lit, zero pipeline errors. The panel screenshot shows the room's
FireBoxRoom source, syntax-lit, line-numbered. janusweb.js now loads
with ?v=2 so bundle rebuilds can't hide behind the browser cache.

## 2026-07-30 — The cache-buster breaks the workers

The ?v=2 added one entry ago immediately claimed a victim: every
worker died at birth with "HTMLElement is not defined." The engine's
worker threads bootstrap by importScripts-ing a suffixed sibling of
the main bundle (janusweb.js → janusweb.assetworker.js, a DOM-free
build) — but the suffix swap matched against a regex anchored on
.js$, which "janusweb.js?v=2" no longer satisfies. The swap silently
no-oped and the workers imported the full DOM bundle, which defines
custom elements at load and promptly dereferenced HTMLElement in a
context that has none. worker.js now splits the query string off
before the suffix match and reattaches it after, so cache-busting
the main script propagates to the worker builds instead of breaking
them. Verified headless with CDP attached to the worker targets this
time — the earlier harness only listened to the page, which is
exactly how this one slipped through — four workers up clean, world
geometry loading through them, source panel still lit.

## 2026-07-30 — The panel learns to listen

Phase 2 of the source panel: scroll and select, through the engine's
own event plumbing so a VR controller ray drives it the same way a
mouse does. The picking system already delivered wheel deltas,
buttons, and modifiers to the plane's object events — xrmenu just
dropped them on the floor, building synthetic events with coordinates
only. Now it carries everything through, marks the events composed
(so they cross the staging container's shadow boundary to the
document-level drag handlers CodeMirror installs mid-selection), and
— because untrusted events never trigger native scrolling — walks up
from the target and scrolls the nearest scrollable element itself,
deltas normalized to pixels.

Scrolling exposed two pipeline gaps in sequence. First, scroll state
is invisible to both the serializer and the mutation observer: the
foreignObject snapshot always rendered from the top, and small
scrolls didn't even trigger a re-render. The pipeline now listens for
scroll in the capture phase, folds a scroll signature into its
dirty-check, and at serialize time shifts each scrolled element's
children into place with the observer paused. Second, the obvious way
to shift them — transform: translate — silently reordered painting:
a transform mints a stacking context, which flattened CodeMirror's
z-indexes and hid every line number behind its own gutter. Relative
position offsets do the same job without touching paint order.

Along the way: the shipped event-clone whitelist gained 'buttons'
(drag detection dies without it — CodeMirror ends a selection the
moment a move event reports no held buttons), the view now tracks
held-button state so the picker can stamp it onto the mousemove
events it synthesizes per-frame, and the embedded editor CSS chain
finally constrains the tab panes — before that, CodeMirror quietly
grew to full content height inside the clipped container and nothing
was ever scrollable, which the overflow clip disguised as a working
panel. Read-only mode switched from 'nocursor' to true: the buffer
still can't be edited, but clicks place a visible cursor and drags
select, kept visible by CSS since the engine reclaims keyboard focus
after every click. The panel plane is now pickable (still not
collidable). Verified headless end to end: scrolled canvas renders
mid-file with line numbers, click sets the cursor, drag selects 202
characters of skybox markup. Keyboard input remains phase 3.
lobby.js at ?v=33, webui chain at v9.

## 2026-07-30 — Debounce becomes throttle

James clocked the scroll lag for what it was: the canvas refresh was
a trailing debounce - a 50ms timer that reset on every change, so a
continuous stream (exactly what scrolling is) starved it until the
stream went quiet, then rendered once. Now it's a throttle: render
immediately when idle, and at a capped ~10fps cadence while changes
keep coming, with updateCanvas's dirty-check still skipping no-op
frames. Profiling along the way showed the full SVG round trip is
only ~30-50ms even under software rendering - the pipeline was never
too slow to stream, it just wasn't being asked to. Also dropped the
requestAnimationFrame wrap (and the old requestIdleCallback): the
canvas feeds a texture whose upload already syncs with the render
loop via asset_update, so waiting for a 3D frame before rasterizing
just stacked the two costs - under a heavy scene that alone added
most of a second of latency.

## 2026-07-30 — The panel stops flinching

Three fixes from James's second hands-on pass. Mouse-out blanked the
panel or forgot its scroll: handleMouseOut was removing the staging
container from the DOM entirely, which destroys layout - every
scroll position zeroes, and a re-render caught while detached
serializes an unlaid-out tree into a blank texture. The container
now stays attached for life and parks with pointer-events: none
(a stronger no-interference guarantee than the old z-index -1000,
which could still swallow events over bare regions of the page).

The mysterious 20-30px dead strip at the top - content drawn lower
than the hit-testing thought it was - bisected to the serialization
wrapper: the page stylesheets' body rules apply to the snapshot
document's own body element, but compute to zero on the live staging
container, so the rendered content sat 54px below its interactive
twin. The wrapper body now zeroes its margin and padding inline;
content renders at row 0, exactly where elementFromPoint looks.

And the refresh cap dropped from 100ms to 16ms: profiling showed the
throttle self-limits safely - all renders funnel through a single
Image whose src reassignment aborts any in-flight load, so a slow
round trip just lowers the effective rate instead of stacking work.
Headless: alignment row 0, scroll position survives a park/return
cycle, drag still selects, and the panel streams frames continuously
during a 1.2s scroll even under software rendering.

## 2026-07-30 — The panel takes the keyboard

60fps was too much for the SVG round trip - renders queued behind it
and the pausing came back - so the refresh cap settled at 30fps.
And the panel got focus management, James's design: click the editor
in-world and the real hidden textarea in the staging DOM silently
takes focus, so keyboard events flow to CodeMirror - arrows walk the
source, PgUp/PgDn scroll it, ctrl-C copies. CodeMirror focuses its
own input on mousedown; xrmenu just notices (a task later - webkit
CodeMirror defers its ensureFocus) and defends the focus from the
engine view, which reclaims it after every click. While the panel
holds focus the player is disabled - the controls system listens on
window, so focus alone wouldn't stop WASD from strafing the typist -
using the same player.disable()/enable() idiom the chat input has
always used. A trusted mousedown anywhere while the pointer is off
the plane hands everything back: blur, player re-enabled. Verified
headless through the real plane-event path this time (the popup
instance fished out of the scene graph): focus lands in the
textarea, ArrowDown moves the cursor line 12 → 13, outside click
releases. That test also caught its own lesson: skipping
handleMouseOver left the container at pointer-events none and
nothing hit - the mouseover/out lifecycle is a real part of the
event contract, not decoration.

## 2026-07-30 — Sync was never on a branch; it was shallow

James reported no sync in either direction and suspected last month's
editor work was orphaned on a branch. Verified: editor-improvements
is fully merged, every fix is in the served build. The real story:
the whole sync layer only knew about DIRECT children of the room -
getObjectSummaries didn't recurse, the reconciler only matched
elements whose parent was <Room>, and updateSource iterated only
top-level parsed objects while the parser nests grouped elements
under _children. Every object in both tutorial bays lives inside a
group, so every test James could possibly run hit the blind spot.

Making it recursive exposed four buried serializer bugs in
summarizeXML, each found by measuring the buffer the reconciler
produced: attribute values weren't XML-escaped (a Paragraph's
runtime css property - an entire stylesheet - truncated its own
attribute at the first quote and poisoned the document); colors
serialized as float triples, rewriting every authored #rrggbb;
attributes over 1000 chars turned one-line elements into thousands
of lines; and booleans that construct false against an undeclared
default sprayed attr="false" everywhere. The reconciler also grew
semantic attribute comparison (numeric tolerance, hex-vs-triple
colors) so formatting differences stop reading as edits, guards
against volunteering runtime-managed attributes (persist,
collision_trigger, redundant orientation aliases) into markup the
author never wrote, a rule that unmatched source elements are only
deleted when no live object bears their js_id, and a hold-off so a
hand edit sitting in the apply debounce can't be reverted by a
scene refresh racing it. First-sync churn went 11,825 lines → 29,
all of them true statements about live state (animated transforms,
script-assigned attributes).

Auto-hints turned out to need no exile: show-hint accepts a
container, so the embedded panel now hosts its autocomplete popup
inside the staging shadow tree - rendered in the texture like
everything else - resolved lazily since the element isn't in its
final tree when options are built. Verified headless: drag a grouped
object, its line rewrites; recolor it in the source, the object
changes; do both in sequence, neither stomps the other. webui chain
at v11.

## 2026-07-30 — The room that turned around

James: "after I interact with the editor, my WASD controls are
backwards. what did you do, claude." What I did was make source
editing work, which armed a dormant bug: updateSource has always
re-applied every <Room> attribute to the live room, and our room
authors fwd="0 0 -1" - a load-time spawn directive saying which way
you face when you arrive. Reapplied mid-session it means "orient the
room thing to face -Z," which rotates the entire world 180° around
the player. The plaza is symmetric enough that the flip is invisible;
the only tell is that forward is now backward. Headless repro made it
unambiguous: one source edit took the room's quaternion from identity
to (0,1,0,0). updateSource now skips the spawn/transform directives
(pos, fwd, up, orientation, dirs) when applying <Room> edits - fog,
ambient, skybox and friends still apply live. One reload clears any
already-flipped session.

## 2026-07-30 — Correction: it worked in June, and the room left its envelope

James pushed back on "the sync layer was always shallow," and the
git record proves him right. June 7-12 (848358f, 9ba8fd9, bf7dd46,
2f28bd4) built the reconcile system, and its own commit message
declares the scope: "per-object serialization of the persistent
top-level objects." In June the site's room WAS flat - every object
a direct child - so the system worked completely, as remembered.
What changed was the room, not the code: July 22 (7692a39) put
fwd="0 0 -1" on the <Room> tag, arming the room-flip in
updateSource's ancient room-attr loop, and July 23 (5ae5bfe)
grouped the whole room into movable wrappers, silently moving
nearly every object outside the sync system's designed scope. The
editor/markup bays (July 26-28) nested everything else. No
regression fired; the data walked out of the design envelope, and
the panel work happened to be where someone finally looked.

Today's changes extend the June machinery in place rather than
replace it - same summaries/reconcile/apply pipeline, now recursive
and semantically compared. Reviewing for collateral turned up one
real find: the new oversized-attribute gate in summarizeXML would
also have dropped long single-token values (data-URI srcs) from
room exports; it now only skips values that contain whitespace,
which stylesheet blobs always do and data URIs never do.

## 2026-07-30 — The browser learns to draw our panels

Chrome's HTML-in-Canvas API (origin trial, 148-150) does natively what
the SVG-foreignObject pipeline has been simulating: rasterize live DOM
into a canvas, with real hit testing on top. The elements base now has
two backends behind one feature detection. On the element backend the
staging container becomes a layoutsubtree canvas whose direct child is
the element itself; the browser lays it out, suppresses its display,
fires a per-frame paint event when its rendering changes, and
drawElementImage rasterizes it - serialization, entity fixups,
stylesheet inlining, image data-URI rewriting, scroll compensation,
and the refresh throttle are all bypassed. Rendering is visibly better:
real font rasterization, page styles applying directly. The SVG path
remains, permanent, for every browser without the API.

The empirical potholes, since the docs don't mention them: paint
records only exist for canvases that actually render, so the staging
canvas hides behind the page via z-index - opacity:0 makes every
capture come out blank and visibility:hidden kills the records
entirely; a 2D context can only draw its own canvas's children; and
drawElementImage outside a paint-event window throws. Hence the
two-canvas split: a staging canvas whose bitmap is cleared after every
copy (so raising it for hit testing shows nothing) feeding a plain
texture canvas the engine uploads as before.

Tier 2, native desktop input: while the 3D pointer is on a panel (not
VR, not pointer-locked), xrmenu projects the plane's quad through the
camera each frame and parks the live element's hit target there with a
CSS matrix3d - transforms on layoutsubtree children move the hit
target without touching the rendered texture. The browser then
delivers real events: native wheel with momentum, keyboard, IME,
context menus, and focus that doesn't need defending. One deep
gotcha: widgets that do their own coordinate math (CodeMirror
subtracts bounding rects from clientX/Y as if space were flat)
mis-map positions under perspective - a known CM limitation with
transformed ancestors. The fix is a capture-phase shim that swallows
trusted pointer events and re-dispatches them at inverse-homography
coordinates with the transform momentarily cleared, so widget math
sees untransformed space. Verified end to end with trusted CDP input:
click lands on the right character, drag selects 292 chars, wheel
scrolls CodeMirror natively, End key travels the line, focus parks
the player. Paragraph unification and same-origin websurface textures
are scoped in the plan for later tiers. Dev needs
chrome://flags/#canvas-draw-element; production will need an
origin-trial token; every other browser silently keeps the SVG path.

## 2026-07-31 — Two kinds of panel

James split xrmenu's interaction model in two, and the seam is
exactly right. A plain panel (the default) is a pickable button
surface: proxied mouse events, live rerendering, never the keyboard.
A focusable panel works the way websurfaces always have: clicking it
ENGAGES - a colored outline plane lights up behind it, pointer lock
is released, the player parks, and keyboard focus lands in the
hidden DOM element - and it stays engaged until a click lands
anywhere that isn't the panel, which hands everything back: blur,
player re-enabled, pointer lockable again, outline off. The
hover-based implicit focus dance this replaces was never quite
trustworthy; an explicit mode with a visible engaged state is
something you can feel. The markup hall's editor is focusable=true
with a phosphor-green outline; the VOIP picker and future button
panels stay plain. Verified headless: click → outline/park/capture,
arrows walk the buffer while engaged, click-away restores the world.

## 2026-07-31 — Field report from the markup hall, three fixes

James's first locked-pointer walkthrough of the focusable panel found
three interacting bugs. The accidental five-line scroll-and-select on
first click: engagement fired on mousedown, releasing pointer lock
mid-gesture - the real cursor materialized at screen center with the
button still held, and the native shim read that as a drag, yanking
the selection (and CodeMirror's auto-scroll) toward center. Engage
now waits for the click, after the gesture is over. The mouse
re-locking and WASD still driving the player: the same click that
engaged also ran the engine's lock-on-click, which re-locked and
un-parked - engagement now disables the controls system's pointer-
lock acquisition entirely (which also releases the held lock) and
restores it on disengage, so clicking back into the scene re-locks
exactly once, on purpose. And the free-cursor misalignment James
called out - unlocked mouse events landing relative to the top-left
of the screen - was the raised staging surface itself: an invisible
1120x700 hit target parked at 0,0 swallowing real input over that
region of the page. The staging surface is now pointer-events none
at all times; synthetic hit-testing flips it on only for the
synchronous elementFromPoint lookup, and in native mode it's the
projected, transformed element that opts back in - so real events
either hit the panel where it visually is, or pass through to the
3D scene, never a phantom at the origin.

## 2026-07-31 — The projection was the poison

James's second report (same first-click selection, typed text landing
away from the cursor, the cursor sometimes rendering as a giant line)
converged on one root cause: keeping the perspective matrix3d applied
while CodeMirror is live corrupts its coordinate caches - CM measures
its own geometry on every keystroke, and under the projection those
measurements come back in screen space. The native-pointer transform
is now off by default (kept behind an experimental nativepointer
attribute); synthetic picking through the engine's raycast delivers
correct coordinates for locked AND free cursors alike, real keyboard
focus still gives native typing and IME, and the only casualties are
wheel momentum and context menus.

The first-click scroll-and-select finally gave up its real mechanism,
which had nothing to do with engagement timing: CodeMirror's hidden
textarea focuses without preventScroll, and when focus arrives before
the textarea has been repositioned to the new cursor, the browser's
scroll-into-view yanks the scroller several lines; meanwhile
pointer-locked mouselook with the button still held sweeps the center
pick across the panel, which the drag machinery faithfully turns into
a selection across the jump. Two fixes: the vendored CodeMirror now
focuses its textarea with preventScroll (it manages cursor visibility
itself), and synthetic mousemoves strip their buttons while the
pointer is locked - an invisible cursor never drags deliberately.
Verified: scrollTop holds steady through a click at scroll 300,
typed characters land exactly at the cursor, cursor renders at
normal height, engage/disengage cycle intact.

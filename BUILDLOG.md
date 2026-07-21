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

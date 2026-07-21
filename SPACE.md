# janusxr.org — Space Design

Status: **draft for review** · Companion to [SPEC.md](SPEC.md) (site requirements) — this
document specifies the 3D space itself. Process and inspiration are chronicled in
[BUILDLOG.md](BUILDLOG.md).

## 1. Design principles

1. **Choice is implied by use of the space.** What was a 2D menu becomes geography:
   standing before a set of hallways *is* the menu; walking down one *is* the click.
   (Lineage: the Quake start area; the hero-plus-three-doors web pattern; Disneyland's
   plaza-and-lands.)
2. **Every wing has a weenie.** Each destination advertises itself with a visual magnet
   on its horizon, visible from the plaza — traffic flow is authored, freedom is felt.
3. **The world teaches the world.** Instruction is diegetic — signs, placards,
   information booths, "Did you know…" strips — never overlay tutorials. (House style
   inherited from every JanusVR lobby generation.)
4. **Alive even when empty.** Water, planting, banner motion, ambient audio, warm
   pooled light. The space must read as inviting and social without requiring the
   presence of others — and without faking it: no mannequins, no simulated people.
   Life comes from the environment and from real visitors only.
5. **The community is the point.** JanusXR being an open, community-run project is its
   primary selling point — participation is a headline exhibit, never fine print. The
   space should actively invite involvement at every level, from hanging out to
   worldbuilding to core engine work.
6. **2D and 3D share one architecture.** Scroll viewpoints are physical places (the
   mezzanine); exhibit placards are DOM content; the document and the world are two
   readings of the same structure.
7. **Structure and presentation are separate.** The layout is a semantically-named
   greybox; themes bind to the names. The greybox is shippable (*"JanusXR is…
   whiteboxable"*).

## 2. Spatial overview

A central **plaza** (the hero) with five **wings** radiating from it, entered via a
south **entry corridor**. A **mezzanine ring** overlooks the plaza floor and hosts the
document-mode camera viewpoints.

```
                        EXPLORE
                      (departure
                        gates)
                          N
        WHAT-IS                       GET
       (obelisk)    ~~~~~~~~~~~    (mirror)
            SW      ( mezzanine )      NE
              \    (    ring    )    /
                \  (   PLAZA    )  /
                   (  monument  )
                   ( + fountain )
                /  (            )  \
              /     ~~~~~~~~~~~      \
            W                          E/SE
      (open floor,        BUILD (three halls +
       social space)         open-source hall)
              |                TIMELINE (subway
              |                 station gallery)
        ENTRY CORRIDOR
        ("main street")
              |
              S  ← hero camera threshold
```

Wing bearings (entry at south, 180°): What-is SW (225°) → Explore N (0°) → Get NE (45°)
→ Build E (90°) → Timeline SE (135°). Document order sweeps the orbit **monotonically
clockwise** — a three-quarter turn — with Explore sitting axially opposite the entry, so
the hero framing looks past the monument silhouette into Explore's daylight (the most
tempting sightline in the space). The first and last wings (What-is, Timeline) flank the
entry corridor as bookends.

## 3. The entry sequence

Threshold → orbit → floor. Specified explicitly; this is the reveal.

1. **Threshold (hero).** The document-mode camera starts at the top of the entry
   corridor, elevated at the plaza's edge — Main Street framing the castle. In view:
   the monument (logo coin + fountain), the plaza floor, Explore's daylight beyond,
   wings partially disclosed at the periphery. At first paint this is a static hero
   image; when the engine hydrates, the same framing comes alive (water moving,
   banners, avatars present).
2. **Orbit (document mode).** Each scroll section snaps the camera to a viewpoint on
   the mezzanine ring, facing into its wing (see §6). The plaza is progressively
   disclosed as the orbit sweeps; native scroll semantics keep working throughout.
3. **Floor (Enter).** The Enter affordance descends the camera from wherever it is on
   the ring to the spawn point on the plaza floor near the fountain, facing Explore.
   Presence, full navigation, the wings now walkable. Exiting free-roam returns the
   camera to the nearest mezzanine viewpoint and restores scroll position.

In WebXR, snaps are comfort-safe blinks, not animated swoops. With
`prefers-reduced-motion`, all transitions are cuts.

## 4. The plaza

The social heart and orientation anchor. Open floor, generous sightlines to every wing
mouth, no content obstacles in the center — the plaza's exhibit is the space itself.

- **The monument (the castle).** Center of the plaza: the **Janus logo coin** — the
  two-faced head mark extruded into a thick 3D coin, slowly rotating above a
  **fountain** whose basin rim doubles as seating. Vector source: the press-kit-era
  logo art surviving at `old/www.janusvr.com/widget/JanusWidget/images/janus.svg`
  (outline) and `old/demos.janusvr.com/dizzket/Proposals/splash/images/logonotext.svg`
  (filled); material/recolor is theme-bound. Direct lineage from every lobby generation
  (the FireBox pillar, the newlobby pool, the home2 octagonal fountain — reusing the
  original home2 water shader is the intended homage). On the monument base: **live
  project stats** displayed architecturally — the flag-counter tradition — current
  visitors, worlds online, latest release.
- **Spawn** is beside the fountain, facing Explore, offset from the entry axis so
  arrivals don't stack on one point.
- **Information booth** near spawn (house pattern: *"stand near and click this screen
  for help"*): controls, chat, how to follow a portal. The gamepad-diagram gag from the
  earliest greybox lobby is welcome here.
- **Mezzanine ring** above the plaza perimeter, reached by two ramps (near What-is and
  near Build). Hosts the document-mode viewpoints as physical overlook bays —
  free-roamers can stand exactly where scrolling readers hover. Also keeps the scroll
  cameras out of floor traffic (satisfies SPEC §4.2 crowding requirement).
- **Ambient life:** fountain audio, palms/planters, hanging banners with slow motion,
  sky openings overhead, warm pooled lighting. Environmental life only — real visitors
  provide the rest.

## 5. The wings

Each wing: a mouth on the plaza, a weenie visible from the plaza, exhibits inside, and
its content sourced from the corresponding DOM section (§7).

### 5.1 What-is (SW)

- **Weenie:** the **"JanusXR is ______" obelisk** — a terminal-green text column at
  architectural scale, typing rotating completions from the messaging list, cursor
  blinking. Readable from the plaza.
- **Exhibits:** the positioning spectrum as three physical dioramas in a row — a
  Roblox-style UGC scene mid-edit, a markup-only world beside its floating source text,
  a scripted application (live data viz) — the React↔Unity spectrum walked left to
  right. Decentralization placard: a constellation map of independently-hosted worlds
  linked by portals.

### 5.2 Explore (N, axial)

- **Weenie:** daylight itself — the only wing open to sky/horizon, visible from the
  entry threshold past the monument. Portal glow at the mouth.
- **Exhibits:** **departure gates** — the numbered-doors tradition reborn: a colonnade
  of active portals to featured worlds, each with destination placard (name, author,
  URL — portals are just URLs; the placard says so). Vesta gets the grand gate.
  Curation TBD (SPEC open question); gates degrade gracefully to fewer entries.

### 5.3 Get (NE)

- **Weenie:** **the Mirror** — a large live surface showing the visitor's own view back
  to them, captioned *"you're already running it."* The punchline of the whole section,
  visible from the plaza.
- **Exhibits:** web client (you're in it — link out is a portal home), self-hosting the
  client and server. A side alcove — dressed as a small **museum vault** — holds the
  legacy native client: archived historical builds, alternative clients, era
  screenshots. Honest signage: unmaintained, preserved.

### 5.4 Build (E)

The largest wing, and the one carrying the project's primary message: **this is an open
community project, and you are invited to build it** — worlds, docs, themes, tools, and
the engine itself.

- **Weenie:** above the wing mouth, a large object suspended **mid-construction,
  cycling between greybox and fully-themed** — foreshadowing the editor, the theme
  system, and the invitation to build.
- **The three ramps** — the Quake homage: three short halls side by side, each dressed
  to foreshadow its authorship tier, each ending in a portal to its docs area:
  - **Editor hall:** manipulable blocks scattered about; a sandbox pedestal you can
    actually edit (stretch: live, multiplayer).
  - **Markup hall:** walls of glowing JML source; a placard pairing 10 lines of JML
    with the room they produce, side by side. *"As simple as hosting a text file."*
  - **Scripting hall:** machinery running — a live scripted contraption with its
    event-driven source displayed beside it.
- **Infrastructure gallery** at the halls' far end: server racks humming, placards on
  presence/networking/hosting your own corner of the metaverse.
- **The open-source hall** — the wing's culminating space, styled as a **living
  workshop**, not an archive: the project under active construction.
  - **Live project board:** in-world displays of recent GitHub activity — latest
    commits, open issues, project planning status — pulled from the GitHub API at
    runtime, with a build-time snapshot baked into the HTML as the Tier 0 / offline
    fallback. The room shows not just that the project is alive, but *what it's doing
    right now*.
  - **Ways-in placards for every level:** hang out and report what's broken · build
    worlds · write docs · make themes (§8 — the theme format is a contribution
    on-ramp) · client and server code. Each placard links directly to the relevant
    repo, issue tracker, or guide.
  - Repository portals for the core repos, prominently framed — these are front-door
    exhibits, not footer links.
- Deployment-modes placard near the mouth: embedded in an existing site, full-page
  app, translators transforming 2D websites and APIs into 3D worlds, and many more.

### 5.5 Timeline (SE)

Not a corridor of Janus history — a statement that Janus sits **in the middle of a much
longer story**, with the future still unbuilt.

- **Weenie:** a glowing **subway station entrance** at the wing mouth — illuminated
  station sign, stairs descending. From the plaza it reads as transit: this wing goes
  *somewhere else in time*.
- **The station:** descending the stairs lands you in an art gallery built inside a
  **decommissioned subway station**. The platform hall is the **History of Janus
  (2010–present)**, positioned at the center (or reasonably so) of the station:
  a spatially-organized set of dioramas, screenshots, 3D artifacts, and plaques —
  museum-display language. Initial build-out covers the highlights: 2010 Elation
  Engine · 2014 FireBox · 2015 JanusVR, Inc. · 2016 JanusWeb · 2019 JanusXR.org. Where
  possible, era exhibits include **portals into era-representative content** (an
  original FireBox room; the preserved home2 lobby). Candidate artifact: the restored
  FireBox gyroscopic ring sculpture from the 2014 lobby, displayed as the museum piece
  it is.
- **The tube to the left — the past.** A tunnel receding toward everything that came
  before Janus: the evolution of virtual spaces — MUDs, Habitat, VRML, ActiveWorlds,
  SGI, Netscape, and onward. The curatorial through-line is **the recurring battle
  between corporate dominance and open standards** — the cycle swings back and forth
  through the decades, and the tunnel spatializes that oscillation (one possibility:
  exhibits alternate between the tunnel's two walls, corporate era facing open era,
  the track running between them). Filled in as an ongoing task; the initial build-out
  is a few illuminated exhibits, with the format explicitly extensible. Educational in
  intent: Janus stands on the shoulders of giants, and the exhibit says whose — and
  which side of the cycle they were on.
- **The tube to the right — the future.** A **well-lit, clean, whitebox-to-wireframe
  construction site** — not dark or abandoned, but actively being built: crisp work
  lighting, tidy scaffolds, surfaces resolving from whitebox to wireframe as the
  tunnel recedes. Exhibits near the mouth: shorter-term expected advancements in tech,
  ambitions for Janus and other open metaverse initiatives, and speculative ideas from
  science fiction. The message is spatial as much as written: *the future is under
  construction, and you're invited to solidify some part of it yourself* — an
  invitation placard points back to the Build wing.

### 5.6 Footer

Document-only navigation (community channels, license, contact — repositories live
prominently in the Build wing, not here). Its minimal in-world counterpart: a small
plaque near the entry corridor noting the site is built with JanusXR itself, with a
view-source invitation.

## 6. Document-mode choreography

| # | Section | Viewpoint | Framing |
|---|---------|-----------|---------|
| 1 | Hero | `vp-hero` — entry threshold, elevated | Monument centered, Explore daylight beyond |
| 2 | What is | `vp-whatis` — mezzanine SW bay | Obelisk + spectrum dioramas |
| 3 | Explore | `vp-explore` — mezzanine N bay | Departure gates, sky |
| 4 | Get | `vp-get` — mezzanine NE bay | The Mirror, vault alcove edge |
| 5 | Build | `vp-build` — mezzanine E bay | Three halls, open-source hall glowing beyond |
| 6 | Timeline | `vp-timeline` — mezzanine SE bay | Station entrance, sign glowing |
| 7 | Footer | `vp-overview` — rises above the plaza | Whole space at once — the map moment |

The final pull-up is the bookend: after walking the content, the reader sees the whole
museum from above — and the Enter affordance one last time.

## 7. Greybox & anchor contract

The layout ships as a semantically-named greybox; themes and DOM content bind to names.

**Naming scheme** (kebab-case, stable, documented):

- Volumes: `plaza`, `entry-corridor`, `mezz-ring`, `wing-whatis`, `wing-explore`,
  `wing-get`, `wing-build`, `wing-timeline`, `hall-build-editor`, `hall-build-markup`,
  `hall-build-scripting`, `gallery-build-infra`, `hall-build-opensource`,
  `alcove-get-legacy`, `station-timeline`, `tube-timeline-past`, `tube-timeline-future`
- Landmarks: `monument`, `fountain`, `weenie-whatis`, `weenie-get-mirror`,
  `weenie-build`, `weenie-timeline-station`, `booth-info`, `plaque-colophon`
- Viewpoints: `vp-hero`, `vp-whatis`, `vp-explore`, `vp-get`, `vp-build`,
  `vp-timeline`, `vp-overview`, `spawn-main`
- Content mounts: `mount-<dom-id>` — every mount corresponds 1:1 to a DOM element id in
  the HTML document (`mount-whatis-spectrum` ⇄ `#whatis-spectrum`). **The DOM id is the
  contract**; the engine maps that element's content onto the mount (CSS3D or
  HTML-to-texture per SPEC §4.1).
- Portals: `portal-<destination-slug>` (`portal-vesta`, `portal-docs-jml`,
  `portal-era-firebox`, `portal-repo-janusweb`, `gate-explore-01…n`)
- Theme bind points: `light-<name>`, `amb-<name>` (audio emitters), `prop-<name>`
  (dressing anchors with no structural role)

**Greybox deliverables:** nav-walkable layout volumes, all anchors placed, viewpoint
cameras framed, portal frames sized, lighting anchors positioned — no materials, no
props, no audio. It must be fully playable in this state.

## 8. Themes

A theme is a bundle binding anchor names → materials, assets, skybox, props, lighting
values, and a **soundscape** (ambience is first-class; the Quake start room is memorable
because of its sound). Structure never changes between themes.

| Theme | One-liner | Palette | Soundscape | Status |
|---|---|---|---|---|
| **PHOSPHOR** | Styled greybox: green vector wireframe on near-black, CRT lineage (Battlezone/Elite) | phosphor green / white / dark grey | CRT hum, soft key-clicks, sonar-like pings | **Launch theme** — brand-native, cheapest to produce |
| **GALLERY** | Stark modern museum: white concrete, light wells, quiet authority | white / grey / green wayfinding accents | room tone, distant footsteps, fountain | Second — maximal contrast proves the theme system |
| **GRID** | Tron cyberpunk: black architecture, neon edge-light, reflective floor | black / neon green / cyan | synthwave bed, electric hum | Later / community |
| **OVERGROWTH** | Forest ruins: stone reclaimed by nature, portals humming among trees | moss / stone / bioluminescent green | birdsong, wind, water | Later / community |

The theme format is documented and public — contributed themes are explicitly invited
(*"in need of some help"*), and the Build wing's ways-in placards name theme-making as a
contribution path. **Stretch goal:** the **style console**, an in-world exhibit (likely
in the Build wing) that live-switches the active theme for everyone present — a working
demo of scripting, custom entities, and the structure/presentation split.

PHOSPHOR doubles as the fallback aesthetic: since it is styled greybox, an unthemed or
partially-loaded space still reads as intentional. The future tube (§5.5) leans on this
deliberately — whitebox-to-wireframe is a look the space wears with intent.

## 9. Multiplayer notes

- Presence connects on load (SPEC §4.2); silent single-user degradation required.
- Scroll cameras live on the mezzanine — floor traffic never blocks reading.
- Spawn offset from the entry axis; arrivals face Explore, not each other.
- Moderation posture: still deferred (SPEC open question) — revisit before Phase 2.

## 10. Open questions

- **Mezzanine access:** two ramps proposed (What-is side, Build side) — confirm count
  and placement during greybox playtest.
- **Wing depths:** exhibit counts above are targets; final depth per wing to be tuned
  in greybox so the orbit reads well at every stop.
- **Past-tube curation:** ongoing task — which milestones of the corporate-vs-open
  cycle make the initial cut, and sourcing imagery/artifacts for them.
- **GitHub data plumbing:** API polling cadence, rate limits, and how much of the
  project board renders at Tier 0 from the build-time snapshot.

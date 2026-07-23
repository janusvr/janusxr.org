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
6. **2D and 3D share one architecture.** Scroll viewpoints are positions inside the
   real space (a low orbit around the fountain); exhibit placards are DOM content;
   the document and the world are two readings of the same structure.
7. **Structure and presentation are separate.** The layout is a semantically-named
   greybox; themes bind to the names. The greybox is shippable (*"JanusXR is…
   whiteboxable"*).

## 2. Spatial overview

**Outdoors by default.** The park metaphor governs: open air, esplanades, lands,
weenies — never interior architecture (themes may enclose things later; that's
theirs to do). The world is a landscape: a **shrine on a hilltop** (the plaza),
two wings flanking it, and to the north an **overlook** at the head of a grand
stair descending into a **valley esplanade** — the Explore land. At the edges of
everything, reality runs out the way it does in *The Thirteenth Floor*: solid
ground dissolves into scattered patches, a bright seam of light marks the border,
and beyond it only green wireframe over blackness, rising into wireframe hills at
the horizon. An Elation-era aesthetic, home at last.

```
        ~ ~ ~ wireframe horizon ~ ~ ~
      · · light seam · · dissolution · ·
                 VALLEY (y -5)
   [HISTORY]     esplanade      [showcase]
   (station)    | promenade |    (gates)
    past/future |           | project gates
                GRAND STAIR
                 (overlook)
        LEARN ---- SHRINE ---- BUILD
       (W wing)  (hilltop     (E wing)
                  plaza,
                monument+ring)
                     |
               ENTRY CORRIDOR
               ("main street")
                     |
                     S  ← hero camera == spawn
```

Wings: Learn (entrance 280°) and Build (entrance 80°) are **curved cloister
halls** — annular corridors (r≈17.2–27.2, flush against the plaza rim) that hug the plaza. You enter at the
doorway, turn (left for Learn, right for Build), and walk the curve back toward
the south, where each hall terminates against Main Street's walls. Nothing juts
into the valley's sightlines — from the esplanade, the shrine reads as one
compact hilltop crown, not palace walls. (Learn absorbed the former Get wing's
exhibits; the former Travel wing became the valley's history station; the former
Explore wing became the valley itself.) Document order: Learn → Explore (the
overlook vista) → Build, with the footer's aerial overview closing.

## 3. The entry sequence

Threshold → orbit → floor. Specified explicitly; this is the reveal.

1. **Threshold (hero).** The document-mode camera starts at the top of the entry
   corridor, elevated at the plaza's edge — Main Street framing the castle. In view:
   the monument (logo coin + fountain), the plaza floor, Get's Mirror beyond,
   wings partially disclosed at the periphery. At first paint this is a static hero
   image; when the engine hydrates, the same framing comes alive (water moving,
   banners, avatars present).
2. **Orbit (document mode).** Each scroll section snaps the camera to a viewpoint on
   a low circle around the fountain, looking out through that wing's portal doorway
   (see §6). The plaza is progressively disclosed as the orbit sweeps; native scroll
   semantics keep working throughout.
3. **Floor (Enter).** The Enter affordance hands over control in place — spawn and the
   hero viewpoint are the same spot at the corridor threshold, so nothing moves but
   agency.
   Presence, full navigation, the wings now walkable. Exiting free-roam returns the
   camera to the nearest orbit viewpoint and restores scroll position.

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
- **Scroll orbit.** The document-mode viewpoints circle low around the fountain
  (~4m radius, ~3.6m up), each looking out through its wing's portal doorway — close
  to the monument, clear of floor traffic, with nothing occluding the wings. (An
  earlier walkable mezzanine played this role; it occluded too much and was cut,
  survived by the **halo ring** — a smaller, purely decorative band floating
  unsupported over the plaza at ~7.5m radius, broken across the south so the
  Main Street sightline stays clear.)
- **Ambient life:** fountain audio, palms/planters, hanging banners with slow motion,
  sky openings overhead, warm pooled lighting. Environmental life only — real visitors
  provide the rest.

## 5. The lands

### 5.1 Learn (curved hall, entrance at 280°)

- **Weenie:** the "JanusXR is ______" obelisk beside the mouth, typing live from
  the document's list.
- **Exhibits:** concept cards (rooms & portals, objects & assets, presence) over
  their diorama plinths; components, extensibility, and decentralization panels
  opposite; the typewriter feature wall at the far end; and the absorbed Get
  exhibits — web-client and self-host panels, the **Mirror** ring ("you're
  already running it"), and the **vault** door with the legacy placard.

### 5.2 Explore (the valley, N)

- **Weenie:** the vista itself — the overlook at the top of the grand stair, the
  promenade running to the edge of the simulation.
- **The esplanade** serves Grand Central's *function* (through-flow, clear paths
  to destinations) with park architecture: open sky, a glowing promenade axis,
  destinations along it.
- **History station** (west): an open-fronted pavilion — platform edge, era
  plinths with year labels, the floating station sign, past/future tunnel mouths
  in its side walls with their panels. The train analogy lives here.
- **Showcase** (east): plinths and gate frames for featured/new content.
- **Project gates** near the far end: Vesta (grand gate), JanusWeb, spares for
  other projects Janus and otherwise — the actual ways past the edge.
- **The border:** the promenade's terminal vista is the Thirteenth Floor edge —
  dissolution, light seam, wireframe, black.

### 5.3 Build (curved hall, entrance at 80°)

Unchanged in structure: three dressed hallways under card signage (blocks /
source-glow / machine), the deploy panel at the mouth, racks and the open-source
placard in the rear chamber.

### 5.4 Footer

Document-only navigation; the in-world colophon plaque near the entry corridor.

## 6. Document-mode choreography

| # | Section | Viewpoint | Framing |
|---|---------|-----------|---------|
| 1 | Hero | `vp-hero` — entry threshold, elevated | Monument centered, Explore daylight beyond |
| 2 | What is | `vp-learn` — fountain orbit, SW | Obelisk + spectrum dioramas |
| 3 | Explore | `vp-explore` — fountain orbit, N | Departure gates, sky |
| 4 | Get | `vp-get` — fountain orbit, NE | The Mirror, vault alcove edge |
| 5 | Build | `vp-build` — fountain orbit, E | Three halls, open-source hall glowing beyond |
| 6 | Timeline | `vp-travel` — fountain orbit, SE | Station entrance, sign glowing |
| 7 | Footer | `vp-overview` — rises above the plaza | Whole space at once — the map moment |

The final pull-up is the bookend: after walking the content, the reader sees the whole
museum from above — and the Enter affordance one last time.

## 7. Greybox & anchor contract

The layout ships as a semantically-named greybox; themes and DOM content bind to names.

**Naming scheme** (kebab-case, stable, documented):

- Volumes: `plaza`, `entry-corridor`, `wing-learn`, `wing-explore`,
  `wing-get`, `wing-build`, `wing-travel`, `hall-build-editor`, `hall-build-markup`,
  `hall-build-scripting`, `gallery-build-infra`, `hall-build-opensource`,
  `alcove-get-legacy`, `station-travel`, `tube-travel-past`, `tube-travel-future`
- Landmarks: `monument`, `fountain`, `weenie-learn`, `weenie-get-mirror`,
  `weenie-build`, `weenie-travel-station`, `booth-info`, `plaque-colophon`
- Viewpoints: `vp-hero`, `vp-learn`, `vp-explore`, `vp-get`, `vp-build`,
  `vp-travel`, `vp-overview`, `spawn-main`
- Content mounts: `mount-<dom-id>` — every mount corresponds 1:1 to a DOM element id in
  the HTML document (`mount-learn-spectrum` ⇄ `#learn-spectrum`). **The DOM id is the
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
- Scroll cameras orbit above the fountain — floor traffic never blocks reading.
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

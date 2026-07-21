# janusxr.org — Site Specification

Status: **draft for review** · Supersedes the 2019-era janusxr.org static page and the bare
client shell at web.janusxr.org.

The design process behind this spec is chronicled in [BUILDLOG.md](BUILDLOG.md), kept in
parallel with the build so others can follow the reasoning and build on it.

## 1. Overview

A new canonical landing page for JanusXR that repositions it as a living, open project whose
primary client is the web client. The site is itself the demo: it loads as a normal 2D
website, and interacting with it gradually reveals that the page is a Janus room — the text
and images are mapped onto objects in a 3D museum-like space, with full multiplayer presence.
For first-time visitors it is a gentle guided introduction; for returning users it is their
entry point into the metaverse — the landing space.

### Goals

1. Communicate that JanusXR is alive, open, and web-first.
2. Demonstrate the engine's core differentiator — 2D↔3D web integration — by *being* it.
3. Serve both audiences: newcomers who need orientation, and veterans who want to hop in.
4. Route builders to the right entry ramp for their skill level (editor → markup → scripting).
5. Remain a fully functional, indexable, accessible 2D website in every browser, including lynx.

### Non-goals (this project)

- The expanded documentation site (separate project; this spec defines only its IA linkage).
- New engine features beyond what the 2D↔3D integration of this page requires.
- Native client development (legacy; archived builds are linked, not maintained).

## 2. Positioning

JanusXR sits **exactly between a web framework (React, Angular) and a game engine (Unity,
Roblox)**. The engine covers a full spectrum of authorship:

1. **Roblox-style UGC worlds** built with the in-world editor — no code at all.
2. **Static markup-only worlds** written in JML — declarative, view-source-able, hostable
   anywhere, like the early web.
3. **Full custom entities** with advanced event-driven scriptability — rich client
   applications: data visualizations, simulations, games, industrial control systems,
   fancy websites.

"Stand around in a website" is a core primitive, not the ceiling. Decentralization is a core
message: anyone can host worlds, portals interconnect them, no central authority required.

### 2.1 Voice

The project's voice is defined by the [JanusXR Messaging](https://github.com/jbaicoianu/janusweb/wiki/JanusXR-Messaging)
wiki page — an open-ended "**JanusXR is ______**" list that is playful, self-aware, and
honest: *"a labor of love," "sometimes a bit janky," "still alive," "the metaverse," "not
the metaverse," "born from the ashes of JanusVR, Inc.," "in need of some help."* Site copy
follows that register: enthusiastic but never corporate, honest about rough edges, inviting
contribution rather than projecting polish the project doesn't have. The fill-in-the-blank
list itself is a design asset — see §6.

### 2.2 Copy carried forward from the 2019 site

Worth keeping (updated as needed) rather than rewriting from scratch:

- The portals framing: *"re-imagines webpages as collaborative 3D webspaces interconnected
  by portals."*
- The JML pitch: *"as simple as hosting a text file, and a familiar experience for any web
  developer."*
- Feature messages: hang out in the 3D web · completely decentralized · build with friends
  (real-time collaborative editor) · embeds in existing websites or runs full-page ·
  translators transform existing 2D websites and APIs into 3D worlds (e.g., the YouTube
  translator → watch videos with friends).
- Prior tagline *"The Immersive Internet"* is retired in favor of *"the world within the
  web"* (provisional).

## 3. Audiences & journeys

| Visitor | Entry behavior | Success outcome |
|---|---|---|
| First-timer | Scrolls what appears to be a normal site; the reveal lands; guided tour explains what they're seeing | Hits **Enter**, walks around, follows a portal or a "build" ramp |
| Builder | Arrives via search/docs/GitHub | Finds the build ramp matching their skill tier and working links to repos + docs |
| Veteran | Uses the page as their landing space | Straight through **Enter** into free-roam; portals, history, bookmarks at hand |
| Crawler / lynx / no-JS | Reads plain semantic HTML | Full informational content indexed and readable |

There is **no stored "returning visitor" mode** — both paths (guided scroll and Enter) are
always visible, differentiated by visual hierarchy alone. Individual components may
accumulate per-user state as the site is used (visit history, bookmarks), stored client-side.

## 4. Core experience

### 4.1 Document mode (initial state)

- Page loads and first-paints as a standard 2D website: hero, sections, footer. No 3D engine
  on the critical path.
- The JanusWeb engine hydrates asynchronously behind the hero. Once ready, the hero is
  revealed to be a live viewport into the landing room.
- Scrolling between sections **snaps the camera between fixed viewpoints** in the room — one
  viewpoint per section, arranged as exhibits in a museum space with physical adjacency
  matching document order. No continuous scroll-driven camera paths; scrolljacking is kept
  to a minimum. Native scroll semantics (keyboard, anchors, find-in-page) keep working.
- 2D content is composited per-element by whichever technique suits the effect:
  - **CSS3D**: live HTML positioned in the scene (built into the engine) — used for
    interactive/selectable content.
  - **HTML-to-texture**: HTML snippets rendered to images and used as props — used for
    decorative/in-world signage.

### 4.2 Multiplayer presence — always on

Every Janus room has full multiplayer support by default, and the landing room is no
exception: presence connects on load, so even a first-time visitor scrolling the "normal
website" sees other avatars wandering the museum. This is deliberate — it is the strongest
possible proof the project is alive. Spec implications:

- The page must remain fully functional if the presence server is unreachable (degrade to
  single-user silently).
- Spawn/viewpoint placement should keep scrolling visitors from being crowded or blocked by
  avatars (e.g., scroll viewpoints slightly elevated or offset from the walkable floor).
- Moderation posture for the landing room needs an owner decision (see Open Questions).

### 4.3 Enter affordance & free-roam

- A **persistent, obvious "Enter" affordance** is available at all times (hero and fixed
  chrome). Activating it releases the camera from the scroll rail into standard Janus
  navigation (WASD/mouse, touch, gamepad, WebXR).
- In free-roam, the section content persists as objects in the world — walking up to an
  exhibit is equivalent to scrolling to its section. Portals to other worlds are physically
  present in the space.
- A clear affordance returns the user to document mode (and restores scroll position to the
  nearest section).

### 4.4 Input environments

- **Desktop**: scroll + snap in document mode; WASD/mouse in free-roam.
- **Touch**: natural scrolling in document mode; engine touch controls in free-roam.
- **WebXR**: entered via the Enter affordance where supported; document content readable
  in-world as exhibits.
- **`prefers-reduced-motion`**: camera snaps become cuts (no animated transitions); ambient
  camera/world motion minimized.

## 5. Progressive enhancement tiers

| Tier | Environment | Experience |
|---|---|---|
| 0 | No JS (lynx, crawlers, readers) | Complete semantic HTML document; all informational content, nav, and links |
| 1 | JS, no WebGL | 2D site with enhanced interactions; static hero imagery; Enter hidden or linking to requirements note |
| 2 | WebGL | Full experience: live room hero, camera-snap scroll, presence, free-roam |
| 3 | WebXR | Tier 2 plus immersive entry |

**Hard requirement:** 100% of informational content lives in the HTML document and is
readable at Tier 0. The 3D layer decorates the DOM; it never owns content.

## 6. Information architecture

Document order = museum adjacency. Each section is a semantic HTML section and a physical
exhibit with a camera viewpoint.

1. **Hero / branding** — logo, tagline (*"the world within the web"* — provisional, may be
   refined), live room viewport, Enter affordance.
2. **What is JanusXR?** — positioning spectrum (§2), use cases, decentralization message.
   Features a **"JanusXR is ______"** element: a terminal-style line with a blinking cursor
   that types out rotating completions drawn from the messaging list (§2.1) — voice, theme
   (green CRT), and positioning in one device. In the HTML document this degrades to the
   full list as plain text (Tier 0 readers get *more*, not less).
3. **Explore** — immediately accessible "hop in" content: portals to featured worlds,
   Vesta community link. (Serves the veteran journey; physically near spawn.)
4. **How can I get JanusXR?**
   - Web client — primary; the punchline is *"you're already running it."*
   - Self-hosting the client and running your own server.
   - GitHub repositories (client, server, tooling).
   - **Legacy & alternative clients** — archived native client builds (unmaintained,
     historical), community/alternative clients.
5. **How can I build for JanusXR?** — three ramps matching the authorship spectrum:
   - **In-world editor** — build collaboratively without leaving the browser.
   - **Room markup (JML)** — declarative worlds from plain markup.
   - **Scripting** — custom entities, event-driven logic, full applications.
   - **Infrastructure** — servers, presence/networking, hosting your own corner of the
     metaverse.
   - **Deploy it however you like** — embedded within an existing website, as a full-page
     game or other app, via translators that transform existing 2D websites and APIs into
     3D worlds, and many more.
   - Each ramp links into the corresponding docs area (§7).
6. **Timeline** — the project's history as a walkable exhibit hall. Initial milestones
   (basics for now; expand later):
   - **2010** — Elation Engine development begins
   - **2014** — FireBox
   - **2015** — JanusVR, Inc.
   - **2016** — JanusWeb
   - **2019** — transition to JanusXR.org
   This is where "is this project alive?" is answered honestly.
7. **Footer** — repos, community channels, docs, license, contact.

## 7. Documentation linkage

Docs are a **separate project** with a content-first, searchable, fast treatment (skinned to
match the site's aesthetic). This site reserves the following stable URL namespace and links
into it from each build ramp:

- `/docs/` — docs root and search
- `/docs/editor/` — in-world editor guide
- `/docs/jml/` — room markup reference
- `/docs/scripting/` — scripting API
- `/docs/infrastructure/` — servers, hosting, networking
- `/docs/tutorials/` — guided walkthroughs

Until the new docs ship, these routes may redirect to the best existing material rather than
404.

## 8. Visual design

- **Palette**: 80s cyberpunk — phosphor green on dark grey with white accents, evocative of
  a monochrome green CRT. (Exact values to be defined in a small design-token file during
  design phase; both the 2D CSS and the in-world materials consume the same tokens.)
- **Typography**: monospace/terminal-flavored display faces for headings and chrome; a
  highly readable face for body copy — legibility is not sacrificed to theme.
- **Motifs**: scanlines, terminal prompts, wireframes, portal glow — applied with restraint;
  content clarity wins over effect.
- The museum space's architecture is part of the brand: exhibits read as a coherent
  built environment, not floating slides.

## 9. Technical architecture

- **HTML-first**: the document is authored as semantic HTML. The engine consumes/decorates
  the DOM to construct the room's content surfaces (CSS3D or HTML-to-texture per element).
- **Hybrid room format**: the room's architecture (geometry, viewpoints, lighting, portals)
  is authored as JML in this repo; the content surfaces are derived from the HTML document
  at runtime. The DOM owns the content, the JML owns the space.
- **Critical path**: first paint is pure HTML/CSS. Engine and assets load async; the reveal
  is an enhancement event, not a loading gate. Define a performance budget in design phase
  (target: 2D content interactive well under 1s on broadband; engine hydration is
  best-effort background work).
- **State**: no server-side user state. Client-side (localStorage) state for history and
  bookmarks components as they're used. No accounts required for anything on this site.
- **URLs**: each section has a stable anchor; free-roam position does not pollute the URL.
- **This repo** is the canonical source for the landing page and its room, replacing the
  current janusxr.org static page. The JanusWeb engine is consumed as a dependency, not
  vendored — loaded from the versioned builds hosted at web.janusxr.org.

## 10. Deployment

- **Static build** (HTML/CSS/JS/assets), deployed to the existing infrastructure.
- **Domain strategy**:
  - **janusxr.org** — the main entry point; serves this site.
  - **janusvr.com** and **janusxr.com** — redirect to janusxr.org.
  - **web.janusxr.org** — stays as is: hosts all versioned JanusWeb builds. The client
    points to janusxr.org as its homepage.
- Existing services (Vesta, presence servers) remain where they are; the site consumes them
  as external services and tolerates their absence (§4.2).

## 11. Phasing

1. **Phase 1 — structure**: full semantic HTML site with all content, styled to theme,
   static hero. Shippable on its own; already better than the current site.
2. **Phase 2 — the reveal**: landing room, engine hydration, camera-snap scroll, Enter →
   free-roam, presence.
3. **Phase 3 — depth**: history/bookmark components, featured-world portal curation,
   timeline exhibit polish.
4. **Separate track — docs project** (own spec).

## 12. Open questions

- **Featured worlds**: initial curation for the Explore exhibit's portals (TBD; not a
  blocker — the exhibit ships with Vesta and a placeholder set if needed).
- **Moderation posture** for the always-on landing room — deliberately deferred; revisit
  before Phase 2 launch since the room is the project's front door.
- **Tagline refinement**: *"the world within the web"* stands for now; revisit during
  design phase.

### Resolved (2026-07-21)

- Domains: janusxr.org is the main entry; janusvr.com / janusxr.com redirect there;
  web.janusxr.org remains the versioned-builds host (§10).
- Timeline milestones: 2010 Elation Engine → 2014 FireBox → 2015 JanusVR, Inc. →
  2016 JanusWeb → 2019 JanusXR.org (§6).
- Room source format: hybrid — JML architecture + DOM-derived content (§9).

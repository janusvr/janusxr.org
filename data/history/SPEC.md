# The Virtual Worlds History Project

A knowledge graph of how virtual worlds happened — the projects, companies,
people, formats, and machines, and the tracks they took to get us to today —
rendered as transit maps for [janusxr.org](https://janusxr.org)'s history
station. Tracked as its own project, distinct from the site spec (SPEC.md at
the repo root); the site consumes this project's outputs.

Lineage: [janusxr.org issue #1](https://github.com/janusvr/janusxr.org/issues/1)
(the history exhibit as a transit system), building on an earlier CC BY-SA
timeline chart whose author has asked not to be credited by name (a request
CC BY-SA 3(a)(3) obliges us to honor). All data and derived posters in this
project are **CC BY-SA 4.0**.

## Architecture: three layers

The rule that shapes everything: **the model is allowed to know far more
than any picture shows.** Visualizations render curated views — general
trends and big players — and drill-downs go deeper without the model
changing shape.

1. **Knowledge graph** (`entities/`, `relations.json`) — everything we can
   source. Ultra-detailed, citation-required, community-contributable.
2. **Curation** (`map/`) — view definitions: which entities appear on which
   visualization, line/branch structure, layout hints, editorial calls.
3. **Renderers** (`tools/history-map/`) — the network poster (overview),
   per-track line diagrams (drill-down), and whatever comes next. Pure
   functions from data → SVG; Node and browser compatible.

## Tracks

| track | scope |
|---|---|
| `worlds` | social/shared virtual worlds, Habitat → today |
| `games` | multiplayer & world-building games, MUDs → UGC platforms, engines |
| `graphics` | the compute substrate: workstations, GPUs, APIs, AI compute |
| `formats` | 3D formats & standards bodies |
| `web3d` | 3D-web browsers/clients: VRML viewers → Janus lineage |
| `hardware` | VR/AR hardware |
| `meta` | companies, people, and epochs spanning tracks |

## Entity schema (`entities/<track>.json`)

```json
{ "track": "worlds",
  "entities": [{
    "id": "secondlife", "label": "Second Life", "kind": "product",
    "track": "worlds",
    "dates": { "start": 2003, "end": null,
               "milestones": [{ "year": 2006, "what": "BusinessWeek cover" }] },
    "fame": 3, "influence": true,
    "blurb": "User-created everything; the 2000s metaverse.",
    "links": { "wikipedia": "https://en.wikipedia.org/wiki/Second_Life" },
    "sources": [] }] }
```

`kind`: product · game · format · api · hardware · company · person ·
epoch · landmark. Dates are years; `end: null` = ongoing. `fame` 1–3
(3 = household name) and `influence` are curation values used for label
sizing. Epoch entities carry a `sub` tagline.

## Relation schema (`relations.json`)

```json
{ "from": "id-software", "to": "doom", "type": "created",
  "start": 1993, "note": "", "sources": ["https://en.wikipedia.org/wiki/Doom_(1993_video_game)"] }
```

Types: `succeeded` (from = the successor) · `forked-from` · `built-on`
(from = the dependent) · `created` · `acquired` · `merged-into` ·
`spun-off-from` · `partnered` · `competed-with` (use start/end for the
rivalry period) · `influenced` · `licensed` · `standardized` · `role`
(person → org, with `"role": "founder|ceo|cto|…"` and years — careers are
chains of role relations).

**Every relation carries at least one source URL.** Wikipedia is fine;
primary sources better. Unsourceable claims stay out of the graph.

## Curation layer (`map/poster.json`)

Zones (decades, editorially weighted), lines with **branch paths**
(`{path, dy}` — trunk first; sidings/feeders as offsets), per-station
layout hints (dx/dy/labelSide/labelAngle/labelDx/labelDy), epoch hub
membership (epochs appear inside line paths), **threads** (a person's or
company's dotted route — derived from role/created/acquired/partnered
relations when an `entity` is named, or hand-overridden with `stations`),
curated dashed **ties**, and person **arcs**. The poster deliberately shows
a fraction of the graph; that is a feature.

**Districts** (`districts` in poster.json): one stop serving a whole
scene. Real transit stations serve neighborhoods — businesses cluster
around a stop rather than each getting one — and drawing every project as
its own station both starves the map of context and asserts sequences
that never existed (a line through five contemporaneous chat worlds reads
as a succession; they were rivals). A district is
`{id, label, year, members[], contains[], blurb}`: line paths reference
the district id like a station; members render as a small-type roster
under the district name and are otherwise unordered, which is the honest
shape of a scene. `contains` lists individually-drawn stations that live
inside the region — the renderer draws the district as a rounded-hull
region (metro fare-zone shading, in the map's own design language)
enclosing the district's stop, its roster, and every contained station;
a region can therefore hold several stops, the way a real neighborhood
holds several businesses around its stations. Who stays individual: landmarks (fame 3) and anything a thread,
tie, arc, or line-chain needs to touch. Validation enforces: district ids
must not collide with entity ids, members must exist, every member must
share at least one relation with a co-member (a roster of strangers is a
curation bug), and a member may not simultaneously appear as an
individual station.

Line diagrams (`map/diagrams/`, forthcoming) are per-track views that go
dense: full lineage, competitor rails, built-on drops, acquisition merges.

## Curation philosophy

- Accuracy in spirit; editorial liberty in layout. Zones are a ruler, not
  a wall; clusters bunch around their epoch.
- The map never declares a technology dead — branches show beginnings and
  brackets, threads show flow (people and companies carrying ideas across
  lines). Cambrian explosions converge into a few winners per era; both
  halves of that cycle should be drawn.
- Big players earn poster stations; scenes earn districts with member
  rosters; everyone else lives in the graph and surfaces in diagrams and
  (later) drill-down cards.

## Contributing

Add entities/relations to the JSON with sources; run
`node tools/history-map/build.mjs --check` to validate, without `--check`
to regenerate the poster and diagrams. Corrections welcome — especially
dates, fates, and missing links between tracks.

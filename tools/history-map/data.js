/* Assemble the three-layer history data (knowledge graph + curation) into
   the raw graph shape the poster pipeline consumes. Pure functions — the
   caller loads files (Node fs or browser fetch) and passes parsed JSON.

   Layers:
     entitySets: [{track, entities: [...]}, ...]   (data/history/entities/*.json)
     relations:  {relations: [...]}                (data/history/relations.json)
     poster:     {meta, zones, lines, stations, threads, ties, arcs}
                                                   (data/history/map/poster.json)  */

const KINDS = ['product', 'game', 'format', 'api', 'hardware', 'company', 'person', 'epoch', 'landmark'];
const REL_TYPES = ['succeeded', 'forked-from', 'built-on', 'created', 'acquired', 'merged-into',
                   'spun-off-from', 'partnered', 'competed-with', 'influenced', 'licensed',
                   'standardized', 'role'];
const THREAD_REL_TYPES = ['role', 'created', 'acquired', 'partnered'];

export function validateData(entitySets, relationsFile, poster) {
  const errors = [], warnings = [];
  const entities = new Map();

  for (const set of entitySets) {
    for (const e of set.entities || []) {
      if (entities.has(e.id)) errors.push(`duplicate entity id: ${e.id} (in ${set.track})`);
      entities.set(e.id, e);
      if (!KINDS.includes(e.kind)) errors.push(`entity ${e.id}: unknown kind ${e.kind}`);
      if (!e.dates || typeof e.dates.start !== 'number') errors.push(`entity ${e.id}: missing dates.start`);
      else if (e.dates.end != null && e.dates.end < e.dates.start) {
        errors.push(`entity ${e.id}: end ${e.dates.end} before start ${e.dates.start}`);
      }
      // epochs and landmarks are editorial constructs; everything else cites
      if (!['epoch', 'landmark'].includes(e.kind) &&
          !(e.links && e.links.wikipedia) && !(e.sources && e.sources.length)) {
        warnings.push(`entity ${e.id}: no wikipedia link or sources`);
      }
    }
  }

  for (const r of relationsFile.relations || []) {
    const tag = `relation ${r.from} -${r.type}-> ${r.to}`;
    if (!entities.has(r.from)) errors.push(`${tag}: unknown 'from'`);
    if (!entities.has(r.to)) errors.push(`${tag}: unknown 'to'`);
    if (!REL_TYPES.includes(r.type)) errors.push(`${tag}: unknown type`);
    if (!r.sources || !r.sources.length) errors.push(`${tag}: missing sources (every relation must cite)`);
    if (r.type === 'role' && !r.role) errors.push(`${tag}: role relation missing 'role' field`);
  }

  // districts: one stop serving a scene — a cluster of contemporaries.
  // Curation-layer only; members must be real entities that relate to
  // each other (a roster of strangers is a curation bug).
  const districts = new Map();
  for (const d of poster.districts || []) {
    if (entities.has(d.id)) errors.push(`district ${d.id}: id collides with an entity`);
    if (districts.has(d.id)) errors.push(`duplicate district id: ${d.id}`);
    districts.set(d.id, d);
    if (typeof d.year !== 'number') errors.push(`district ${d.id}: missing year`);
    if (!d.members || d.members.length < 2) errors.push(`district ${d.id}: needs at least 2 members`);
    for (const m of d.members || []) {
      if (!entities.has(m)) { errors.push(`district ${d.id}: unknown member ${m}`); continue; }
      const rels = relationsFile.relations || [];
      const related = rels.some(r =>
        (r.from === m && d.members.includes(r.to)) || (r.to === m && d.members.includes(r.from)));
      if (!related) warnings.push(`district ${d.id}: member ${m} has no relation to any co-member`);
    }
    // contains: individually-drawn stations that live inside the region
    for (const c of d.contains || []) {
      if (!entities.has(c)) errors.push(`district ${d.id}: unknown contained station ${c}`);
      if ((d.members || []).includes(c)) errors.push(`district ${d.id}: ${c} is both a member and contained`);
    }
  }

  const ref = (id, where) => {
    if (!entities.has(id) && !districts.has(id)) errors.push(`${where}: unknown entity ${id}`);
  };
  const memberOf = new Map();
  for (const d of districts.values()) for (const m of d.members) memberOf.set(m, d.id);
  for (const line of poster.lines || []) {
    for (const b of line.branches || [{ path: line.stations }]) {
      for (const sid of (b.path || b)) {
        ref(sid, `poster line ${line.id}`);
        if (memberOf.has(sid)) {
          warnings.push(`station ${sid} is drawn individually AND belongs to district ${memberOf.get(sid)}`);
        }
      }
    }
  }
  const rels = relationsFile.relations || [];
  const touches = (a, b) => rels.some(r =>
    (r.from === a && r.to === b) || (r.from === b && r.to === a));
  for (const t of poster.threads || []) {
    if (t.entity) ref(t.entity, `thread ${t.id}`);
    for (const sid of t.stations || []) ref(sid, `thread ${t.id}`);
    if (!t.entity && !(t.stations && t.stations.length)) {
      errors.push(`thread ${t.id}: needs an entity to derive from or an explicit stations list`);
    }
    // every drawn stop is a claim: it must trace to the graph, either as a
    // direct relation with the thread's entity or through an org the entity
    // held a role at (role at C + C related to the stop)
    if (t.entity && t.stations) {
      const orgs = rels.filter(r => r.type === 'role' && r.from === t.entity).map(r => r.to);
      for (const sid of t.stations) {
        const e = entities.get(sid);
        if (!e || e.kind === 'epoch' || sid === t.entity) continue;
        if (!touches(t.entity, sid) && !orgs.some(o => touches(o, sid))) {
          errors.push(`thread ${t.id}: stop ${sid} has no backing relation for ${t.entity} (direct or via a role org)`);
        }
      }
    }
  }
  for (const tie of poster.ties || []) { ref(tie.from, 'poster tie'); ref(tie.to, 'poster tie'); }
  // person arcs are claims too: the named person must connect to both
  // endpoints in the graph (directly, or through an org they held a role at)
  for (const arc of poster.arcs || []) {
    ref(arc.from, 'poster arc'); ref(arc.to, 'poster arc');
    if (!arc.via || !arc.via.length) {
      errors.push(`arc ${arc.label}: needs 'via' person id(s) to back the drawn link`);
      continue;
    }
    for (const person of arc.via) {
      ref(person, `arc ${arc.label}`);
      const orgs = rels.filter(r => r.type === 'role' && r.from === person).map(r => r.to);
      for (const end of [arc.from, arc.to]) {
        if (!touches(person, end) && !orgs.some(o => touches(o, end))) {
          errors.push(`arc ${arc.label}: no backing relation from ${person} to ${end} (direct or via a role org)`);
        }
      }
    }
  }
  for (const sid of Object.keys(poster.stations || {})) ref(sid, 'poster station hint');

  return { errors, warnings, entities, districts };
}

function zoneFor(year, zones) {
  return zones.find(z => year >= z.start && year < z.end) ||
         (year >= zones[zones.length - 1].start ? zones[zones.length - 1] : zones[0]);
}

/* Derive a thread's station list from the knowledge graph: every relation
   of a career-ish type touching the thread's entity, projected onto
   stations that exist on the poster, ordered by relation start year. */
export function deriveThreadStations(entity, relations, onPoster) {
  const stops = [];
  for (const r of relations) {
    if (!THREAD_REL_TYPES.includes(r.type)) continue;
    let other = null;
    if (r.from === entity) other = r.to;
    else if (r.to === entity) other = r.from;
    if (!other || !onPoster.has(other)) continue;
    stops.push({ id: other, year: r.start != null ? r.start : 9999 });
  }
  stops.sort((a, b) => a.year - b.year);
  const seen = new Set();
  return stops.filter(s => !seen.has(s.id) && seen.add(s.id)).map(s => s.id);
}

export function assembleGraph(entitySets, relationsFile, poster) {
  const { errors, warnings, entities, districts } = validateData(entitySets, relationsFile, poster);
  if (errors.length) throw new Error('history data validation failed:\n  ' + errors.join('\n  '));

  const relations = relationsFile.relations || [];

  // stations on the poster = every entity referenced by a line path
  const onPoster = new Set();
  for (const line of poster.lines || []) {
    for (const b of line.branches || [{ path: line.stations }]) {
      for (const sid of (b.path || b)) onPoster.add(sid);
    }
  }

  const nodes = [];
  for (const id of onPoster) {
    const hint = (poster.stations || {})[id];
    if (districts.has(id)) {
      // a district stop: one station serving a scene; members ride as a roster
      const d = districts.get(id);
      const stationYear = (hint && hint.year) || d.year;
      nodes.push({
        id: d.id, label: (hint && hint.label) || d.label, kind: 'district',
        year: stationYear,
        zone: zoneFor(stationYear, poster.zones).id,
        fame: d.fame || 2, influence: false,
        roster: d.members.map(m => {
          const e = entities.get(m);
          return { label: e.label, influence: !!e.influence };
        }),
        contains: d.contains || [],
        note: d.blurb || '',
        ...(hint ? { hint } : {}),
      });
      continue;
    }
    const e = entities.get(id);
    // a station hint may pin the year the entity matters on this map
    // (e.g. IBM founded 1911 but stationed at its System/360 moment)
    const stationYear = (hint && hint.year) || e.dates.start;
    nodes.push({
      id: e.id, label: (hint && hint.label) || e.label, kind: e.kind,
      year: stationYear,
      zone: zoneFor(stationYear, poster.zones).id,
      fame: e.fame || 1, influence: !!e.influence,
      sub: e.sub, note: e.blurb || '',
      url: (e.links && e.links.wikipedia) || '',
      ...(hint ? { hint } : {}),
    });
  }

  // threads: derive from the graph unless hand-overridden
  const lines = (poster.lines || []).map(l => ({ ...l }));
  for (const t of poster.threads || []) {
    const stations = (t.stations && t.stations.length)
      ? t.stations
      : deriveThreadStations(t.entity, relations, onPoster);
    if (stations.length < 2) {
      warnings.push(`thread ${t.id}: fewer than 2 resolvable stations; skipped`);
      continue;
    }
    lines.push({ id: t.id, name: t.name, color: t.color, width: t.width || 2,
                 service: t.service || 'person', labelDx: t.labelDx, labelDy: t.labelDy,
                 stations });
  }

  // edges for the renderer: curated ties + person arcs
  const edges = [];
  for (const tie of poster.ties || []) {
    edges.push({ from: tie.from, to: tie.to, type: tie.type || 'made' });
  }
  for (const arc of poster.arcs || []) {
    edges.push({ from: arc.from, to: arc.to, type: 'person', label: arc.label,
                 bulge: arc.bulge, labelDx: arc.labelDx, labelDy: arc.labelDy });
  }

  return { raw: { meta: poster.meta, zones: poster.zones, lines, nodes, edges },
           warnings, entities, relations };
}

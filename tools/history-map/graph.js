/* Load + validate the history node graph. Usable from Node and the browser
   (pass the parsed JSON in; no filesystem access here). */

export function prepareGraph(raw) {
  const errors = [];
  const g = {
    meta: raw.meta || {},
    zones: raw.zones || [],
    lines: raw.lines || [],
    nodes: raw.nodes || [],
    edges: raw.edges || [],
  };

  const nodeById = new Map();
  for (const n of g.nodes) {
    if (nodeById.has(n.id)) errors.push(`duplicate node id: ${n.id}`);
    nodeById.set(n.id, n);
  }
  const zoneById = new Map();
  g.zones.forEach((z, i) => { z.index = i; zoneById.set(z.id, z); });

  for (const n of g.nodes) {
    const z = zoneById.get(n.zone);
    if (!z) { errors.push(`node ${n.id}: unknown zone ${n.zone}`); continue; }
    if (n.year < z.start || n.year >= z.end) {
      errors.push(`node ${n.id}: year ${n.year} outside zone ${n.zone} [${z.start}..${z.end})`);
    }
  }

  // lines are sets of branch paths (trunk first); a plain `stations` array
  // is shorthand for a single-path line
  for (const line of g.lines) {
    line.paths = (line.branches || [{ path: line.stations, dy: 0 }])
      .map(b => Array.isArray(b) ? { path: b, dy: 0 } : { path: b.path, dy: b.dy || 0 });
    for (const p of line.paths) {
      for (const sid of p.path) {
        if (!nodeById.has(sid)) errors.push(`line ${line.id}: unknown station ${sid}`);
      }
    }
  }
  for (const e of g.edges) {
    if (!nodeById.has(e.from)) errors.push(`edge: unknown node ${e.from}`);
    if (!nodeById.has(e.to)) errors.push(`edge: unknown node ${e.to}`);
  }

  if (errors.length) {
    throw new Error('graph validation failed:\n  ' + errors.join('\n  '));
  }

  // annotate nodes with their line memberships, in lines[] order; service
  // lines (a person's path) ride through stations without owning them —
  // they don't create interchanges or affect placement
  for (const n of g.nodes) n.lines = [];
  for (const line of g.lines) {
    if (line.service) continue;
    for (const p of line.paths) {
      for (const sid of p.path) {
        const n = nodeById.get(sid);
        if (!n.lines.includes(line.id)) n.lines.push(line.id);
      }
    }
  }

  g.nodeById = nodeById;
  g.zoneById = zoneById;
  g.lineById = new Map(g.lines.map(l => [l.id, l]));
  return g;
}

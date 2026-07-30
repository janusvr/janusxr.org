/* Hybrid Beck layout, v3: branching freight topology. Lines are sets of
   branch paths — a trunk plus feeders and sidings — that merge at epoch
   hubs on a central spine. Dead projects end in terminus stubs; surviving
   lineages run through. Zones scaffold x (year → position, editorially
   weighted) but draw only as a ruler. */

const GRID = 8;
const snap = v => Math.round(v / GRID) * GRID;

export const CANVAS = { w: 2200, h: 1300 };
const MARGIN = { left: 40, right: 40, top: 150, bottom: 150 };
const MIN_DX = 62;          // minimum horizontal run between stations on a path
const ZONE_SPILL = 130;     // clusters may overflow their decade — it's a ruler, not a wall
const SLOT_GAP = 16;        // vertical spacing of line slots inside a hub capsule

export function layoutGraph(g) {
  const usable = CANVAS.w - MARGIN.left - MARGIN.right;
  const wsum = g.zones.reduce((a, z) => a + (z.weight || 1), 0);

  // zone bands (x scaffolding only)
  let x = MARGIN.left;
  for (const z of g.zones) {
    z.x0 = x;
    z.x1 = x + usable * (z.weight || 1) / wsum;
    x = z.x1;
  }

  // line tracks: data-driven fractions of the content band
  const top = MARGIN.top + 95;
  const bottom = CANVAS.h - MARGIN.bottom - 30;
  const n = g.lines.length;
  g.lines.forEach((line, i) => {
    const t = line.track != null ? line.track : (n === 1 ? 0.5 : i / (n - 1));
    line.trackY = snap(top + (bottom - top) * t);
  });
  const spineY = snap((top + bottom) / 2);
  g.spineY = spineY;

  // branch offset: the first path that carries a node decides its dy
  // (trunk listed first, so branch points stay on the trunk)
  for (const line of g.lines) {
    if (line.service) continue;
    for (const p of line.paths) {
      for (const sid of p.path) {
        const nd = g.nodeById.get(sid);
        if (nd.kind === 'epoch') continue;
        if (nd.branchDy == null && nd.lines[0] === line.id) nd.branchDy = p.dy;
      }
    }
  }

  // station positions
  for (const node of g.nodes) {
    const z = g.zoneById.get(node.zone);
    const pad = 26;
    const t = (node.year - z.start) / (z.end - z.start);
    let nx = z.x0 + pad + t * (z.x1 - z.x0 - 2 * pad);
    let ny;
    if (node.kind === 'epoch') {
      ny = spineY;
    } else if (node.lines.length >= 2) {
      const ys = node.lines.map(id => g.lineById.get(id).trackY);
      ny = ys.reduce((a, b) => a + b, 0) / ys.length;
    } else if (node.lines.length === 1) {
      ny = g.lineById.get(node.lines[0]).trackY + (node.branchDy || 0);
    } else {
      ny = spineY;
    }
    if (node.hint) {
      if (node.hint.x != null) nx = node.hint.x;
      if (node.hint.y != null) ny = node.hint.y;
      if (node.hint.dx) nx += node.hint.dx;
      if (node.hint.dy) ny += node.hint.dy;
    }
    node.x = snap(nx);
    node.y = snap(ny);
  }

  // hub capsule slots: lines through an epoch stack by home track order so
  // routes never cross inside the capsule
  for (const node of g.nodes) {
    if (node.kind !== 'epoch') continue;
    const through = node.lines.slice().sort((a, b) => g.lineById.get(a).trackY - g.lineById.get(b).trackY);
    node.slotYs = {};
    through.forEach((lid, i) => {
      node.slotYs[lid] = snap(node.y + (i - (through.length - 1) / 2) * SLOT_GAP);
    });
  }

  // per-path min spacing with zone clamps; backward pass relaxes pile-ups
  // (service lines ride existing stations and impose no spacing of their own)
  for (let pass = 0; pass < 2; pass++) {
    for (const line of g.lines) {
      if (line.service) continue;
      for (const p of line.paths) {
        const nds = p.path.map(sid => g.nodeById.get(sid));
        let prevX = -Infinity, prevEpoch = false;
        for (let i = 0; i < nds.length; i++) {
          const nd = nds[i];
          // epochs are anchors: they hold their true-year x and crowded
          // predecessors compress against them (backward pass below)
          // rather than shoving the hub — the axis must not lie; stations
          // leaving a hub also hug it, so post-hub years stay honest.
          // A feeder terminating AT a hub never pushes it at all.
          if (nd.kind === 'epoch' && i === nds.length - 1) { prevX = nd.x; prevEpoch = true; continue; }
          const clearance = nd.kind === 'epoch' ? 34 : prevEpoch ? 44 : MIN_DX;
          if (nd.x < prevX + clearance) nd.x = snap(prevX + clearance);
          prevEpoch = nd.kind === 'epoch';
          const z = g.zoneById.get(nd.zone);
          const limit = nd.kind === 'epoch' ? z.x1 - 18 : z.x1 + ZONE_SPILL;
          if (nd.x > limit) nd.x = snap(limit);
          prevX = nd.x;
        }
        for (let i = nds.length - 2; i >= 0; i--) {
          if (nds[i].kind === 'epoch') continue;
          // feeders converging on a hub fan out: the deeper the branch row,
          // the earlier the station peels off — a fan, not a stacked ladder
          const fan = nds[i + 1].kind === 'epoch' && i + 1 === nds.length - 1
            ? Math.round(Math.abs(nds[i].branchDy || 0) * 0.6) : 0;
          if (nds[i].x > nds[i + 1].x - MIN_DX - fan) {
            const z = g.zoneById.get(nds[i].zone);
            nds[i].x = snap(Math.max(z.x0 + 18, nds[i + 1].x - MIN_DX - fan));
          }
        }
      }
    }
  }

  // label alternation index: position within the node's first path
  for (const line of g.lines) {
    if (line.service) continue;
    for (const p of line.paths) {
      p.path.forEach((sid, i) => {
        const nd = g.nodeById.get(sid);
        if (nd.labelIdx == null) nd.labelIdx = i;
      });
    }
  }

  // stations that exit a hub dead straight: adopt the slot y their line
  // uses through the preceding epoch
  for (const line of g.lines) {
    if (line.service) continue;
    for (const p of line.paths) {
      for (let i = 1; i < p.path.length; i++) {
        const nd = g.nodeById.get(p.path[i]);
        const prev = g.nodeById.get(p.path[i - 1]);
        if (nd.hint && nd.hint.alignWithPrevSlot && prev.kind === 'epoch' && prev.slotYs) {
          nd.y = prev.slotYs[line.id] != null ? prev.slotYs[line.id] : nd.y;
        }
      }
    }
  }

  // the point a line actually passes through for a given node
  const linePoint = (node, lineId) => {
    if (node.kind === 'epoch' && node.slotYs && node.slotYs[lineId] != null) {
      return [node.x, node.slotYs[lineId]];
    }
    return [node.x, node.y];
  };
  g.linePoint = linePoint;

  const routePath = (stationIds, lineId) => {
    const pts = stationIds.map(sid => linePoint(g.nodeById.get(sid), lineId));
    const kinds = stationIds.map(sid => g.nodeById.get(sid).kind);
    const path = [];
    for (let i = 0; i < pts.length; i++) {
      const [bx, by] = pts[i];
      if (i === 0) { path.push([bx, by]); continue; }
      const [ax, ay] = pts[i - 1];
      const dx = bx - ax, dy = by - ay, adx = Math.abs(dx), ady = Math.abs(dy);
      if (ady === 0) {
        path.push([bx, by]);
      } else if (adx >= ady) {
        path.push([bx - Math.sign(dx || 1) * ady, ay], [bx, by]);
      } else if (kinds[i] === 'epoch') {
        // approaching a hub: diagonal first, so the shared vertical rides
        // the hub column and feeders read as a converging fan
        path.push([bx, ay + Math.sign(dy) * adx], [bx, by]);
      } else {
        path.push([ax, by - Math.sign(dy) * adx], [bx, by]);
      }
      path.push([bx, by]);
    }
    return path.filter((p, i) => i === 0 || p[0] !== path[i - 1][0] || p[1] !== path[i - 1][1]);
  };

  // routes: one octilinear polyline per branch path
  for (const line of g.lines) {
    line.routes = line.service
      ? [routePath(line.stations, line.id)]
      : line.paths.map(p => routePath(p.path, line.id));
  }

  return g;
}

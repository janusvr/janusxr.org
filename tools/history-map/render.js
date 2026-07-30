/* Render the laid-out graph as an SVG transit poster. PHOSPHOR dark theme.
   Pure string building — runs in Node and the browser alike. */

import { CANVAS } from './layout.js';
import { BG, INK, DIM, FONT, esc, roundedPath, FAME_R, FAME_FS, HALO } from './svg.js';

function stationGlyph(node, g) {
  const primary = g.lineById.get(node.lines[0]);
  const r = FAME_R[node.fame || 1];
  if (node.id === 'you-are-here') {
    return `<circle cx="${node.x}" cy="${node.y}" r="${r + 8}" fill="none" stroke="${primary.color}" stroke-width="2" opacity="0.55"/>` +
           `<circle cx="${node.x}" cy="${node.y}" r="${r + 3}" fill="${BG}" stroke="${INK}" stroke-width="3.5"/>` +
           `<circle cx="${node.x}" cy="${node.y}" r="${r - 3}" fill="${primary.color}"/>`;
  }
  if (node.kind === 'district') {
    // the region's own stop: serves everyone on the roster
    return `<circle cx="${node.x}" cy="${node.y}" r="${r + 3}" fill="${BG}" stroke="${INK}" stroke-width="3.5"/>` +
           `<circle cx="${node.x}" cy="${node.y}" r="${r - 3}" fill="${primary.color}"/>`;
  }
  if (node.lines.length >= 2) {
    return `<circle cx="${node.x}" cy="${node.y}" r="${r + 3}" fill="${BG}" stroke="${INK}" stroke-width="3.5"/>`;
  }
  return `<circle cx="${node.x}" cy="${node.y}" r="${r}" fill="${BG}" stroke="${primary.color}" stroke-width="3.5"/>`;
}

const CW = 0.62; // monospace advance width as a fraction of font size

const ROSTER_FS = 11, ROSTER_LH = 13.5;

/* geometry for one candidate label placement; a district's roster rides
   under its name, so the block is measured and placed as one box */
function labelPlacement(node, side, dx, dy) {
  const r = FAME_R[node.fame || 1] + (node.kind === 'district' ? 5 : 0);
  const fs = FAME_FS[node.fame || 1];
  const roster = node.roster || [];
  const rosterW = roster.length ? Math.max(...roster.map(m => m.label.length)) * ROSTER_FS * CW : 0;
  const rosterH = roster.length * ROSTER_LH;
  const wpx = Math.max(node.label.length * fs * CW, rosterW);
  let x = node.x, y, anchor = 'middle';
  if (side === 'above') y = node.y - r - 10 - rosterH;
  else if (side === 'below') y = node.y + r + 10 + fs * 0.72;
  else if (side === 'right') { x = node.x + r + 9; y = node.y + fs * 0.34 - rosterH / 2; anchor = 'start'; }
  else { x = node.x - r - 9; y = node.y + fs * 0.34 - rosterH / 2; anchor = 'end'; }
  x += dx; y += dy;
  const x0 = anchor === 'middle' ? x - wpx / 2 : anchor === 'start' ? x : x - wpx;
  const pad = roster.length ? 12 : 3; // districts reserve room for their cloud
  return { x, y, anchor,
           box: { x0: x0 - pad, y0: y - fs * 0.8 - pad, x1: x0 + wpx + pad, y1: y + fs * 0.25 + rosterH + pad } };
}

const hit = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/* Neighborhood regions in the map's own design language: the convex hull
   of everything the region encloses, offset outward, corners rounded —
   the metro fare-zone look, not an amoeba. */
function convexHull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const pt of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pt) <= 0) lower.pop();
    lower.push(pt);
  }
  for (const pt of p.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pt) <= 0) upper.pop();
    upper.push(pt);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function offsetHull(hull, pad) {
  const n = hull.length;
  const cx = hull.reduce((a, p) => a + p[0], 0) / n, cy = hull.reduce((a, p) => a + p[1], 0) / n;
  const edges = hull.map((p, i) => {
    const q = hull[(i + 1) % n];
    const dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1;
    let nx = dy / len, ny = -dx / len;
    const mx = (p[0] + q[0]) / 2 - cx, my = (p[1] + q[1]) / 2 - cy;
    if (nx * mx + ny * my < 0) { nx = -nx; ny = -ny; }
    return { px: p[0] + nx * pad, py: p[1] + ny * pad, dx, dy };
  });
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = edges[(i - 1 + n) % n], b = edges[i];
    const det = a.dx * b.dy - a.dy * b.dx;
    if (Math.abs(det) < 1e-6) { out.push([b.px, b.py]); continue; }
    const t = ((b.px - a.px) * b.dy - (b.py - a.py) * b.dx) / det;
    out.push([a.px + a.dx * t, a.py + a.dy * t]);
  }
  return out;
}

function closedRoundedPath(pts, r) {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const l1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
    const l2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
    const r1 = Math.min(r, l1 / 2), r2 = Math.min(r, l2 / 2);
    const ax = p1[0] - (p1[0] - p0[0]) / l1 * r1, ay = p1[1] - (p1[1] - p0[1]) / l1 * r1;
    const bx = p1[0] + (p2[0] - p1[0]) / l2 * r2, by = p1[1] + (p2[1] - p1[1]) / l2 * r2;
    d += `${i ? ' L' : 'M'} ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
  }
  return d + ' Z';
}

function regionPath(boxes, pad = 16) {
  const pts = [];
  for (const b of boxes) pts.push([b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]);
  const hull = convexHull(pts);
  if (hull.length < 3) return '';
  return closedRoundedPath(offsetHull(hull, pad), 24);
}

/* Collision-aware label placement. Hints state a preference; a hinted spot
   is abandoned only when it would sit on another label or a line. Big names
   (fame) place first so the famous stations keep the good real estate. */
function placeLabels(g, fixedRects, hardRects, samples) {
  const CELL = 48;
  const grid = new Map();
  for (const p of samples) {
    const k = `${Math.floor(p.x / CELL)},${Math.floor(p.y / CELL)}`;
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(p);
  }
  const near = (box, fn) => {
    for (let cx = Math.floor(box.x0 / CELL); cx <= Math.floor(box.x1 / CELL); cx++) {
      for (let cy = Math.floor(box.y0 / CELL); cy <= Math.floor(box.y1 / CELL); cy++) {
        for (const p of grid.get(`${cx},${cy}`) || []) fn(p);
      }
    }
  };
  const samplesIn = (box, ox, oy) => {
    let n = 0;
    near(box, p => {
      if (p.x <= box.x0 || p.x >= box.x1 || p.y <= box.y0 || p.y >= box.y1) return;
      if (ox != null && Math.hypot(p.x - ox, p.y - oy) < 24) return; // lines converge at the label's own dot
      n++;
    });
    return n;
  };
  // a label must visually belong to its dot: nothing may run between them
  const corridorBlocked = (node, box) => {
    const bx = Math.max(box.x0, Math.min(node.x, box.x1));
    const by = Math.max(box.y0, Math.min(node.y, box.y1));
    const dx = bx - node.x, dy = by - node.y;
    const len = Math.hypot(dx, dy);
    if (len < 18) return 0;
    let blocked = 0;
    const region = { x0: Math.min(node.x, bx) - 6, y0: Math.min(node.y, by) - 6,
                     x1: Math.max(node.x, bx) + 6, y1: Math.max(node.y, by) + 6 };
    near(region, p => {
      const t = ((p.x - node.x) * dx + (p.y - node.y) * dy) / (len * len);
      if (t < 0 || t > 1) return;
      if (Math.hypot(node.x + t * dx - p.x, node.y + t * dy - p.y) > 5) return;
      if (Math.hypot(p.x - node.x, p.y - node.y) < 16) return; // its own lines converge at the dot
      blocked++;
    });
    return blocked;
  };

  const placed = [];
  const nodes = g.nodes.filter(n => n.lines.length && n.kind !== 'epoch' && !(n.hint && n.hint.labelAngle))
    .sort((a, b) => (b.fame || 1) - (a.fame || 1) || a.x - b.x);
  for (const node of nodes) {
    const hint = node.hint || {};
    const prefSide = hint.labelSide || ((node.labelIdx || 0) % 2 === 0 ? 'above' : 'below');
    const cands = [];
    cands.push({ side: prefSide, dx: hint.labelDx || 0, dy: hint.labelDy || 0, bonus: -80 });
    const sides = [prefSide, prefSide === 'above' ? 'below' : 'above', 'right', 'left']
      .filter((s, i, arr) => arr.indexOf(s) === i);
    for (const side of sides) {
      const outs = side === 'above' ? [0, -8, -16] : side === 'below' ? [0, 8, 16] : [0, -8, 8];
      for (const dyo of outs) for (const dxo of [0, -14, 14, -28, 28, -44, 44]) {
        cands.push({ side, dx: dxo, dy: dyo, bonus: 0 });
      }
    }
    let best = null;
    cands.forEach((c, i) => {
      const p = labelPlacement(node, c.side, c.dx, c.dy);
      // distance from dot to the box's nearest point: association decays fast
      const nx = Math.max(p.box.x0, Math.min(node.x, p.box.x1));
      const ny = Math.max(p.box.y0, Math.min(node.y, p.box.y1));
      const gap = Math.hypot(nx - node.x, ny - node.y);
      let cost = c.bonus + i * 0.5 + samplesIn(p.box, node.x, node.y) * 26
               + Math.max(0, gap - 24) * 4
               + corridorBlocked(node, p.box) * 250;
      for (const r of placed) if (hit(p.box, r)) cost += 2500;
      for (const r of fixedRects) if (hit(p.box, r)) cost += 1800;
      for (const r of hardRects) if (hit(p.box, r)) cost += 6000;
      if (p.box.x0 < 26 || p.box.x1 > CANVAS.w - 26 || p.box.y0 < 108 || p.box.y1 > CANVAS.h - 138) cost += 5000;
      if (!best || cost < best.cost) best = { ...p, cost };
    });
    node._pl = best;
    placed.push(best.box);
  }
}

function stationLabel(node) {
  const angle = (node.hint && node.hint.labelAngle) || 0;
  const r = FAME_R[node.fame || 1];
  const fs = FAME_FS[node.fame || 1];
  const weight = node.influence ? '700' : '400';
  if (angle) {
    const x = node.x + 3, y = node.y - r - 7;
    return `<text ${HALO} x="${x}" y="${y}" text-anchor="start" font-size="${fs}" font-weight="${weight}" fill="${INK}" transform="rotate(${angle} ${x} ${y})">${esc(node.label)}</text>`;
  }
  const p = node._pl || labelPlacement(node, 'above', 0, 0);
  const out = [`<text ${HALO} x="${p.x}" y="${p.y}" text-anchor="${p.anchor}" font-size="${fs}" font-weight="${weight}" fill="${INK}">${esc(node.label)}</text>`];
  // district roster: the scene's members, small type under the name
  for (let i = 0; i < (node.roster || []).length; i++) {
    const m = node.roster[i];
    out.push(`<text ${HALO} x="${p.x}" y="${p.y + 13 + i * ROSTER_LH}" text-anchor="${p.anchor}" font-size="${ROSTER_FS}"` +
             `${m.influence ? ' font-weight="700"' : ''} fill="#9fbfa8">${esc(m.label)}</text>`);
  }
  return out.join('\n');
}

function hubGlyph(node) {
  const ys = Object.values(node.slotYs || { 0: node.y });
  // capsule tall enough for the slots AND the rotated name inside it
  const nameLen = node.label.length * 11.5 + 40;
  const slotSpan = Math.max(...ys) - Math.min(...ys) + 28;
  const hh = Math.max(slotSpan, nameLen) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const y0 = cy - hh, y1 = cy + hh;
  const out = [];
  out.push(`<rect x="${node.x - 20}" y="${y0}" width="40" height="${y1 - y0}" rx="20" fill="${BG}" stroke="${INK}" stroke-width="3.5"/>`);
  // metro-style: the station name runs vertically inside the capsule,
  // with the year as a small badge above the top cap
  out.push(`<text x="${node.x}" y="${cy}" text-anchor="middle" font-size="17" font-weight="700" fill="${INK}" letter-spacing="2" transform="rotate(-90 ${node.x} ${cy})" dominant-baseline="central">${esc(node.label)}</text>`);
  out.push(`<text ${HALO} x="${node.x}" y="${y0 - 10}" text-anchor="middle" font-size="13" fill="${DIM}">${node.year}</text>`);
  return out.join('\n');
}

function personArc(a, b, label, bulgeDown, ldx, ldy) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  // bulge perpendicular to the chord, upward unless told otherwise
  let px = -dy / len, py = dx / len;
  if (bulgeDown ? py < 0 : py > 0) { px = -px; py = -py; }
  const bulge = Math.min(90, len * 0.22);
  const cx = mx + px * bulge, cy = my + py * bulge;
  const lx = mx + px * bulge * 0.62 + (ldx || 0), lyv = my + py * bulge * 0.62 - 5 + (ldy || 0);
  return `<path d="M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}" fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="2 6" opacity="0.75"/>` +
         `<text ${HALO} x="${lx}" y="${lyv}" text-anchor="middle" font-size="12" font-style="italic" fill="#8fbf9e">${esc(label)}</text>`;
}

export function renderSVG(g) {
  const { w, h } = CANVAS;
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${FONT}">`);
  out.push(`<rect width="${w}" height="${h}" fill="${BG}"/>`);

  // future zone: dashed boundary + faint wireframe hatch (no other bands)
  const future = g.zones.find(z => z.id === 'future');
  if (future) {
    out.push(`<line x1="${future.x0}" y1="110" x2="${future.x0}" y2="${h - 130}" stroke="${DIM}" stroke-width="1.5" stroke-dasharray="8 7"/>`);
    for (let gy = 140; gy < h - 140; gy += 46) {
      out.push(`<line x1="${future.x0 + 6}" y1="${gy}" x2="${future.x1}" y2="${gy}" stroke="#153822" stroke-width="1"/>`);
    }
    out.push(`<text x="${(future.x0 + future.x1) / 2}" y="138" text-anchor="middle" font-size="18" fill="${DIM}" letter-spacing="4">${esc(future.label.toUpperCase())}</text>`);
  }

  // decade ruler along the bottom
  const ry = h - 128;
  const first = g.zones[0], last = g.zones[g.zones.length - 1];
  out.push(`<line x1="${first.x0}" y1="${ry}" x2="${last.x1}" y2="${ry}" stroke="#1f3527" stroke-width="2"/>`);
  for (const z of g.zones) {
    out.push(`<line x1="${z.x0}" y1="${ry - 7}" x2="${z.x0}" y2="${ry + 7}" stroke="#2a4633" stroke-width="2"/>`);
    out.push(`<text x="${(z.x0 + z.x1) / 2}" y="${ry + 24}" text-anchor="middle" font-size="13" fill="#3f6b4e" letter-spacing="2">${esc(z.label.toUpperCase())}</text>`);
  }
  out.push(`<line x1="${last.x1}" y1="${ry - 7}" x2="${last.x1}" y2="${ry + 7}" stroke="#2a4633" stroke-width="2"/>`);

  // maker/lineage ties (under everything else)
  for (const e of g.edges) {
    if (e.type === 'person') continue;
    const a = g.nodeById.get(e.from), b = g.nodeById.get(e.to);
    out.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#3b5c48" stroke-width="1.6" stroke-dasharray="4 7" opacity="0.85"/>`);
  }
  const underLines = out.length; // neighborhood clouds splice in here, beneath the lines

  // line routes (each line is a set of branch paths)
  for (const line of g.lines) {
    if (line.service) continue;
    const dash = line.style === 'thin' ? ' stroke-dasharray="12 8"' : '';
    for (const r of line.routes) {
      out.push(`<path d="${roundedPath(r)}" fill="none" stroke="${line.color}" stroke-width="${line.width}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`);
    }
  }

  // threads: a person's or company's path through the network, dotted
  for (const line of g.lines) {
    if (!line.service) continue;
    for (const r of line.routes) {
      out.push(`<path d="${roundedPath(r)}" fill="none" stroke="${line.color}" stroke-width="${line.width}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 7" opacity="0.9"/>`);
    }
    // name the thread at its first non-epoch stop (epochs sit mid-capsule)
    const anchorId = line.stations.find(sid => g.nodeById.get(sid).kind !== 'epoch') || line.stations[0];
    const a = g.nodeById.get(anchorId);
    const lx = a.x - 12 + (line.labelDx || 0), ly = a.y - 10 + (line.labelDy || 0);
    out.push(`<text ${HALO} x="${lx}" y="${ly}" text-anchor="end" font-size="13" font-style="italic" fill="${line.color}">${esc(line.name)}</text>`);
  }

  // person transfer arcs, over the lines
  for (const e of g.edges) {
    if (e.type !== 'person') continue;
    out.push(personArc(g.nodeById.get(e.from), g.nodeById.get(e.to), e.label || '', e.bulge === 'down', e.labelDx, e.labelDy));
  }

  // every line is still running: each one continues past its rightmost
  // stop into the future, parallel to the You-are-here run
  const ex = CANVAS.w - 46;
  const continuations = [];
  for (const line of g.lines) {
    if (line.service) continue;
    let tip = null;
    for (const r of line.routes) {
      for (const p of [r[0], r[r.length - 1]]) if (!tip || p[0] > tip[0]) tip = p;
    }
    if (tip) continuations.push({ line, x: tip[0], y: tip[1] });
  }
  for (const c of continuations) {
    out.push(`<line x1="${c.x}" y1="${c.y}" x2="${ex}" y2="${c.y}" stroke="${c.line.color}" stroke-width="${c.line.width}" stroke-linecap="round" stroke-dasharray="2 14"/>`);
    out.push(`<path d="M ${ex} ${c.y - 8} L ${ex + 13} ${c.y} L ${ex} ${c.y + 8} Z" fill="${c.line.color}"/>`);
  }
  const yah = g.nodeById.get('you-are-here');

  // ---- label placement: gather everything a label must not sit on ----
  const samples = [];
  const sampleSeg = (x1, y1, x2, y2) => {
    const d = Math.hypot(x2 - x1, y2 - y1), steps = Math.max(1, Math.ceil(d / 9));
    for (let s = 0; s <= steps; s++) samples.push({ x: x1 + (x2 - x1) * s / steps, y: y1 + (y2 - y1) * s / steps });
  };
  for (const line of g.lines) {
    for (const r of line.routes) {
      for (let i = 0; i + 1 < r.length; i++) sampleSeg(r[i][0], r[i][1], r[i + 1][0], r[i + 1][1]);
    }
  }
  for (const e of g.edges) {
    if (e.type === 'person') continue;
    const a = g.nodeById.get(e.from), b = g.nodeById.get(e.to);
    sampleSeg(a.x, a.y, b.x, b.y);
  }
  for (const c of continuations) sampleSeg(c.x, c.y, CANVAS.w - 32, c.y);
  if (future) sampleSeg(future.x0, 110, future.x0, h - 130);
  for (const e of g.edges) {
    if (e.type !== 'person') continue;
    const a = g.nodeById.get(e.from), b = g.nodeById.get(e.to);
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    let px = -dy / len, py = dx / len;
    if (e.bulge === 'down' ? py < 0 : py > 0) { px = -px; py = -py; }
    const bulge = Math.min(90, len * 0.22);
    const cx = (a.x + b.x) / 2 + px * bulge, cyv = (a.y + b.y) / 2 + py * bulge;
    let qx = a.x, qy = a.y;
    for (let t = 0.05; t <= 1.001; t += 0.05) {
      const u = 1 - t;
      const nx2 = u * u * a.x + 2 * u * t * cx + t * t * b.x;
      const ny2 = u * u * a.y + 2 * u * t * cyv + t * t * b.y;
      sampleSeg(qx, qy, nx2, ny2); qx = nx2; qy = ny2;
    }
  }

  const fixedRects = [], hardRects = [];
  fixedRects.push({ x0: 40, y0: 24, x1: 60 + (g.meta.title || '').length * 40 * CW, y1: 102 }); // title block
  if (future) fixedRects.push({ x0: (future.x0 + future.x1) / 2 - 90, y0: 118, x1: (future.x0 + future.x1) / 2 + 90, y1: 144 });
  for (const node of g.nodes) {
    if (!node.lines.length) continue;
    if (node.kind === 'epoch') {
      const ys = Object.values(node.slotYs || { 0: node.y });
      const nameLen = node.label.length * 11.5 + 40;
      const hh = Math.max(Math.max(...ys) - Math.min(...ys) + 28, nameLen) / 2;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      hardRects.push({ x0: node.x - 24, y0: cy - hh - 26, x1: node.x + 24, y1: cy + hh + 4 });
    } else {
      const r = FAME_R[node.fame || 1] + 4;
      fixedRects.push({ x0: node.x - r, y0: node.y - r, x1: node.x + r, y1: node.y + r });
    }
  }
  for (const line of g.lines) {
    if (!line.service) continue;
    const anchorId = line.stations.find(sid => g.nodeById.get(sid).kind !== 'epoch') || line.stations[0];
    const a = g.nodeById.get(anchorId);
    const lx = a.x - 12 + (line.labelDx || 0), ly = a.y - 10 + (line.labelDy || 0);
    fixedRects.push({ x0: lx - line.name.length * 13 * CW - 3, y0: ly - 13, x1: lx + 3, y1: ly + 4 });
  }
  for (const e of g.edges) {
    if (e.type !== 'person') continue;
    const a = g.nodeById.get(e.from), b = g.nodeById.get(e.to);
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    let px = -dy / len, py = dx / len;
    if (e.bulge === 'down' ? py < 0 : py > 0) { px = -px; py = -py; }
    const bulge = Math.min(90, len * 0.22);
    const lx = (a.x + b.x) / 2 + px * bulge * 0.62 + (e.labelDx || 0);
    const lyv = (a.y + b.y) / 2 + py * bulge * 0.62 - 5 + (e.labelDy || 0);
    const halfw = (e.label || '').length * 12 * CW / 2;
    fixedRects.push({ x0: lx - halfw - 3, y0: lyv - 12, x1: lx + halfw + 3, y1: lyv + 4 });
  }
  placeLabels(g, fixedRects, hardRects, samples);

  // neighborhood regions: rounded hulls around the district stop, its
  // roster block, and every station the region contains — painted beneath
  // the lines like fare-zone shading; names render later, above everything
  const regions = [];
  for (const node of g.nodes) {
    if (node.kind !== 'district' || !node._pl) continue;
    const col = g.lineById.get(node.lines[0]).color;
    const boxes = [node._pl.box, { x0: node.x - 16, y0: node.y - 16, x1: node.x + 16, y1: node.y + 16 }];
    for (const cid of node.contains || []) {
      const c = g.nodeById.get(cid);
      if (!c) continue;
      boxes.push({ x0: c.x - 14, y0: c.y - 14, x1: c.x + 14, y1: c.y + 14 });
      if (c._pl) boxes.push(c._pl.box);
    }
    const d = regionPath(boxes);
    if (d) regions.push(`<path d="${d}" fill="${col}" fill-opacity="0.07" stroke="${col}" stroke-opacity="0.4" stroke-width="1.5"/>`);
  }
  out.splice(underLines, 0, ...regions);

  // stations + labels (epochs render as capsule hubs)
  for (const node of g.nodes) {
    if (!node.lines.length) continue;
    if (node.kind === 'epoch') {
      out.push(hubGlyph(node));
    } else {
      out.push(stationGlyph(node, g));
      out.push(stationLabel(node));
    }
  }

  // title
  out.push(`<text x="52" y="64" font-size="40" font-weight="700" fill="${INK}">${esc(g.meta.title || 'The timeline of virtual worlds')}</text>`);
  out.push(`<text x="52" y="94" font-size="17" fill="${DIM}">many lines, one network · every line is still running · janusxr.org</text>`);

  // legend: lines on the first row; glyph key second; threads third
  let lx = 52, ly = h - 98;
  for (const line of g.lines) {
    if (line.service) continue;
    const dash = line.style === 'thin' ? ' stroke-dasharray="12 8"' : '';
    out.push(`<line x1="${lx}" y1="${ly - 5}" x2="${lx + 34}" y2="${ly - 5}" stroke="${line.color}" stroke-width="${line.width}" stroke-linecap="round"${dash}/>`);
    out.push(`<text x="${lx + 42}" y="${ly}" font-size="14" fill="${INK}">${esc(line.name)}</text>`);
    lx += 46 + line.name.length * 8.6 + 30;
  }
  out.push(`<text x="${lx + 12}" y="${ly}" font-size="14" fill="${INK}">label size = fame · <tspan font-weight="700">bold = influence</tspan></text>`);
  const ly2 = ly + 30;
  out.push(`<rect x="52" y="${ly2 - 20}" width="20" height="30" rx="10" fill="${BG}" stroke="${INK}" stroke-width="2.5"/>`);
  out.push(`<text x="82" y="${ly2}" font-size="14" fill="${INK}">epoch — everyone changes trains here</text>`);
  out.push(`<circle cx="418" cy="${ly2 - 5}" r="6" fill="${BG}" stroke="${INK}" stroke-width="3"/>`);
  out.push(`<text x="434" y="${ly2}" font-size="14" fill="${INK}">interchange</text>`);
  out.push(`<path d="${regionPath([{ x0: 554, y0: ly2 - 12, x1: 580, y1: ly2 }], 4)}" fill="${INK}" fill-opacity="0.12" stroke="${INK}" stroke-opacity="0.6" stroke-width="1.3"/>`);
  out.push(`<circle cx="560" cy="${ly2 - 6}" r="3.5" fill="${BG}" stroke="${INK}" stroke-width="2"/>`);
  out.push(`<text x="596" y="${ly2}" font-size="14" fill="${INK}">district — one stop, a whole scene</text>`);
  const ly3 = ly2 + 30;
  out.push(`<path d="M 52 ${ly3} Q 74 ${ly3 - 20} 96 ${ly3}" fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="2 6" opacity="0.75"/>`);
  out.push(`<text x="104" y="${ly3}" font-size="14" fill="${INK}">person link</text>`);
  let tx = 220;
  for (const line of g.lines) {
    if (!line.service) continue;
    out.push(`<line x1="${tx}" y1="${ly3 - 5}" x2="${tx + 30}" y2="${ly3 - 5}" stroke="${line.color}" stroke-width="2" stroke-dasharray="2 7"/>`);
    out.push(`<text x="${tx + 38}" y="${ly3}" font-size="14" font-style="italic" fill="${INK}">${esc(line.name)}</text>`);
    tx += 40 + line.name.length * 8.2 + 18;
  }

  // attribution
  out.push(`<text x="${w - 52}" y="${h - 66}" text-anchor="end" font-size="13" fill="${DIM}">${esc(g.meta.attribution || '')}</text>`);
  out.push(`<text x="${w - 52}" y="${h - 46}" text-anchor="end" font-size="13" fill="${DIM}">${esc(g.meta.credit || '')}</text>`);

  out.push('</svg>');
  return out.join('\n');
}

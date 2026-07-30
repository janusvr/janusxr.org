/* Per-track line diagrams: the drill-down view. One dense strip map per
   track — every entity drawn as a lifespan bar on a rail, lineage chains
   (succeeded/forked-from) sharing a rail with dashed gap connectors,
   competitors packed onto parallel rails by era, built-on dependencies as
   dashed drops. Reads up close; the network poster stays the overview. */

import { BG, INK, DIM, FONT, esc } from './svg.js';

const NOW = 2026;
const W = 2400;
const MARGIN = { left: 60, right: 90, top: 150, bottom: 110 };
const RAIL_GAP = 58;
const DIAGRAM_KINDS = ['product', 'game', 'format', 'api', 'hardware'];
const FS = { 1: 12, 2: 14, 3: 17 };

const TRACK_COLORS = {
  web3d: '#43ff6e', worlds: '#ff6ea8', games: '#ffb347',
  formats: '#5ac8fa', graphics: '#b98aff', hardware: '#ff5c5c',
};

class UF {
  constructor() { this.p = new Map(); }
  find(x) { if (!this.p.has(x)) this.p.set(x, x); let r = x; while (this.p.get(r) !== r) r = this.p.get(r); this.p.set(x, r); return r; }
  union(a, b) { this.p.set(this.find(a), this.find(b)); }
}

export function renderDiagram(track, entities, relations, curation = {}) {
  const color = TRACK_COLORS[track] || INK;
  const exclude = new Set(curation.exclude || []);
  const ents = [...entities.values()].filter(e =>
    e.track === track && DIAGRAM_KINDS.includes(e.kind) && !exclude.has(e.id));
  const byId = new Map(ents.map(e => [e.id, e]));

  // lineage chains: succeeded / forked-from unions within the track
  const uf = new UF();
  const chainRels = relations.filter(r =>
    ['succeeded', 'forked-from'].includes(r.type) && byId.has(r.from) && byId.has(r.to));
  for (const r of chainRels) uf.union(r.from, r.to);
  const chains = new Map();
  for (const e of ents) {
    const root = uf.find(e.id);
    if (!chains.has(root)) chains.set(root, []);
    chains.get(root).push(e);
  }
  const chainList = [...chains.values()].map(members => {
    members.sort((a, b) => a.dates.start - b.dates.start);
    const start = members[0].dates.start;
    const end = Math.max(...members.map(m => m.dates.end == null ? NOW : m.dates.end));
    const weight = members.length * 10 + Math.max(...members.map(m => m.fame || 1));
    return { members, start, end, weight };
  });

  // rails: interval-pack chains; heaviest chain gets the center rail
  chainList.sort((a, b) => a.start - b.start);
  const rows = [];
  for (const ch of chainList) {
    let placed = false;
    if (!(curation.rails && ch.members.some(m => curation.rails[m.id] != null))) {
      for (const row of rows) {
        if (row.end + 3 <= ch.start) { row.chains.push(ch); row.end = Math.max(row.end, ch.end); placed = true; break; }
      }
    }
    if (!placed) rows.push({ chains: [ch], end: ch.end });
  }
  for (const row of rows) row.weight = Math.max(...row.chains.map(c => c.weight));
  const order = rows.slice().sort((a, b) => b.weight - a.weight);
  const offsets = [0];
  for (let i = 1; i < order.length; i++) offsets.push(Math.ceil(i / 2) * (i % 2 ? -1 : 1));
  order.forEach((row, i) => { row.offset = offsets[i]; });

  // x scale
  const minYear = Math.min(...ents.map(e => e.dates.start), 1990) - 2;
  const x = year => MARGIN.left + (year - minYear) / (NOW + 1 - minYear) * (W - MARGIN.left - MARGIN.right);

  const railSpan = Math.max(1, ...rows.map(r => Math.abs(r.offset)));
  const H = MARGIN.top + MARGIN.bottom + (railSpan * 2 + 1) * RAIL_GAP + 60;
  const cy = MARGIN.top + 30 + railSpan * RAIL_GAP;
  const railY = off => cy + off * RAIL_GAP;

  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">`);
  out.push(`<rect width="${W}" height="${H}" fill="${BG}"/>`);

  // decade ruler
  const ry = H - 64;
  out.push(`<line x1="${MARGIN.left}" y1="${ry}" x2="${W - MARGIN.right + 40}" y2="${ry}" stroke="#1f3527" stroke-width="2"/>`);
  for (let d = Math.ceil(minYear / 10) * 10; d <= NOW; d += 10) {
    out.push(`<line x1="${x(d)}" y1="${ry - 6}" x2="${x(d)}" y2="${ry + 6}" stroke="#2a4633" stroke-width="2"/>`);
    out.push(`<text x="${x(d)}" y="${ry + 24}" text-anchor="middle" font-size="12" fill="#3f6b4e" letter-spacing="2">${d}</text>`);
    out.push(`<line x1="${x(d)}" y1="${MARGIN.top - 10}" x2="${x(d)}" y2="${ry - 12}" stroke="#121a14" stroke-width="1"/>`);
  }

  // built-on drops (under the bars)
  for (const r of relations) {
    if (r.type !== 'built-on' || !byId.has(r.from) || !byId.has(r.to)) continue;
    const a = byId.get(r.from), b = byId.get(r.to);
    if (a._y == null || b._y == null) continue; // filled below on second pass
  }

  // chain bars — first pass records y for each entity
  for (const row of rows) {
    for (const ch of row.chains) {
      for (const m of ch.members) m._y = railY(row.offset);
    }
  }

  for (const r of relations) {
    if (r.type !== 'built-on' || !byId.has(r.from) || !byId.has(r.to)) continue;
    const a = byId.get(r.from), b = byId.get(r.to);
    const bx = x(a.dates.start);
    out.push(`<line x1="${bx}" y1="${a._y}" x2="${bx}" y2="${b._y}" stroke="#3b5c48" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.8"/>`);
  }

  // bars + gap connectors + fork connectors
  for (const row of rows) {
    const y = railY(row.offset);
    const heavy = row.offset === 0;
    for (const ch of row.chains) {
      for (let i = 0; i < ch.members.length; i++) {
        const m = ch.members[i];
        const x0 = x(m.dates.start);
        const ongoing = m.dates.end == null;
        const x1 = x(ongoing ? NOW : m.dates.end);
        out.push(`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${color}" stroke-width="${heavy ? 6 : 4}" stroke-linecap="round"${heavy ? '' : ' opacity="0.85"'}/>`);
        if (ongoing) {
          out.push(`<path d="M ${x1 + 6} ${y - 6} L ${x1 + 16} ${y} L ${x1 + 6} ${y + 6}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`);
        }
        // succession gap to the next member on the same rail
        if (i + 1 < ch.members.length) {
          const n = ch.members[i + 1];
          const gx0 = x(m.dates.end == null ? NOW : m.dates.end), gx1 = x(n.dates.start);
          if (gx1 > gx0 + 2) {
            out.push(`<line x1="${gx0}" y1="${y}" x2="${gx1}" y2="${y}" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 7" opacity="0.6"/>`);
          }
        }
        out.push(`<circle cx="${x0}" cy="${y}" r="${(m.fame || 1) >= 3 ? 8 : 6}" fill="${BG}" stroke="${color}" stroke-width="3"/>`);
        // label
        const fs = FS[m.fame || 1];
        const above = row.offset <= 0 ? (i % 2 === 0) : (i % 2 !== 0);
        const ly = above ? y - 14 : y + 14 + fs * 0.72;
        out.push(`<text x="${x0}" y="${ly}" text-anchor="start" font-size="${fs}" font-weight="${m.influence ? 700 : 400}" fill="${INK}">${esc(m.label)}</text>`);
      }
    }
  }

  // fork connectors across rails
  for (const r of chainRels) {
    if (r.type !== 'forked-from') continue;
    const child = byId.get(r.from), parent = byId.get(r.to);
    if (child._y === parent._y) continue;
    const fx = x(child.dates.start);
    out.push(`<path d="M ${fx} ${parent._y} L ${fx} ${child._y}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="6 5" opacity="0.7"/>`);
  }

  // title
  const trackName = track.toUpperCase();
  out.push(`<rect x="60" y="42" width="14" height="34" rx="4" fill="${color}"/>`);
  out.push(`<text x="90" y="68" font-size="30" font-weight="700" fill="${INK}">${trackName} LINE</text>`);
  out.push(`<text x="90" y="94" font-size="14" fill="${DIM}">line diagram · bar length is a lifespan · dashes are successions · drops are foundations</text>`);
  out.push(`<text x="${W - 60}" y="${H - 24}" text-anchor="end" font-size="12" fill="${DIM}">janusxr.org — the virtual worlds history project · CC BY-SA 4.0</text>`);

  out.push('</svg>');
  return out.join('\n');
}

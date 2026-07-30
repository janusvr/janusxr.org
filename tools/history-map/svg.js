/* Shared SVG helpers for the history renderers (poster + line diagrams).
   PHOSPHOR dark theme constants live here so every view matches the site. */

export const BG = '#0c0f0c';
export const INK = '#e8f5ea';
export const DIM = '#2a9e4f';
export const FONT = 'DejaVu Sans Mono, Menlo, monospace';

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* text halo: labels knock out whatever runs beneath them, transit-poster
   style — a fat background-colored stroke painted under the glyphs */
export const HALO = `paint-order="stroke" stroke="${BG}" stroke-width="5" stroke-linejoin="round"`;

/* polyline -> rounded-corner SVG path */
export function roundedPath(pts, r = 15) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const l1 = Math.hypot(x1 - x0, y1 - y0), l2 = Math.hypot(x2 - x1, y2 - y1);
    const r1 = Math.min(r, l1 / 2), r2 = Math.min(r, l2 / 2);
    const ax = x1 - (x1 - x0) / l1 * r1, ay = y1 - (y1 - y0) / l1 * r1;
    const bx = x1 + (x2 - x1) / l2 * r2, by = y1 + (y2 - y1) / l2 * r2;
    d += ` L ${ax} ${ay} Q ${x1} ${y1} ${bx} ${by}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return d;
}

export const FAME_R = { 1: 6, 2: 7, 3: 9 };
export const FAME_FS = { 1: 12.5, 2: 15, 3: 19 };

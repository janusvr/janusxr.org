#!/usr/bin/env node
/* Build the history subway map from the three-layer data model
   (data/history/entities/* + relations.json + map/poster.json) into
   assets/history-map.svg and a rasterized PNG via headless Chrome.
   Usage: node tools/history-map/build.mjs [--no-png] [--check] */

import { readFileSync, writeFileSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

import { assembleGraph } from './data.js';
import { prepareGraph } from './graph.js';
import { layoutGraph, CANVAS } from './layout.js';
import { renderSVG } from './render.js';
import { renderDiagram } from './diagram.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATA = join(ROOT, 'data', 'history');

const entitySets = readdirSync(join(DATA, 'entities')).filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(readFileSync(join(DATA, 'entities', f), 'utf8')));
const relations = JSON.parse(readFileSync(join(DATA, 'relations.json'), 'utf8'));
const poster = JSON.parse(readFileSync(join(DATA, 'map', 'poster.json'), 'utf8'));

const { raw, warnings, entities } = assembleGraph(entitySets, relations, poster);
for (const w of warnings) console.warn('warn:', w);
if (process.argv.includes('--check')) {
  console.log(`check ok: ${entitySets.reduce((a, s) => a + s.entities.length, 0)} entities, ` +
              `${relations.relations.length} relations, ${raw.nodes.length} poster stations`);
  process.exit(0);
}

// per-track line diagrams
const DIAGRAM_TRACKS = ['web3d', 'worlds', 'games', 'graphics', 'formats', 'hardware'];
for (const track of DIAGRAM_TRACKS) {
  let curation = {};
  try { curation = JSON.parse(readFileSync(join(DATA, 'map', 'diagrams', `${track}.json`), 'utf8')); } catch {}
  const dsvg = renderDiagram(track, entities, relations.relations, curation);
  const dpath = join(ROOT, 'assets', `history-line-${track}.svg`);
  writeFileSync(dpath, dsvg);
  console.log(`wrote ${dpath} (${(dsvg.length / 1024).toFixed(1)} KB)`);
}

const g = layoutGraph(prepareGraph(raw));
const svg = renderSVG(g);

const svgPath = join(ROOT, 'assets', 'history-map.svg');
writeFileSync(svgPath, svg);
console.log(`wrote ${svgPath} (${(svg.length / 1024).toFixed(1)} KB)`);

if (!process.argv.includes('--no-png')) {
  const rasterize = (srcSvg, outPng, wIn, hIn, targetW) => {
    const pw = targetW, ph = Math.round(hIn * targetW / wIn);
    const tmp = mkdtempSync(join(tmpdir(), 'histmap-'));
    try {
      const html = join(tmp, 'shot.html');
      writeFileSync(html, `<!doctype html><style>*{margin:0}</style><img src="${pathToFileURL(srcSvg)}" width="${pw}" height="${ph}">`);
      execFileSync('google-chrome', [
        '--headless=new', '--disable-gpu', '--hide-scrollbars',
        `--window-size=${pw},${ph}`, '--force-device-scale-factor=1',
        `--screenshot=${outPng}`, pathToFileURL(html).href,
      ], { stdio: 'pipe' });
      console.log(`wrote ${outPng} (${pw}x${ph})`);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  };
  rasterize(svgPath, join(ROOT, 'assets', 'history-map.png'), CANVAS.w, CANVAS.h, 4096);
  for (const track of DIAGRAM_TRACKS) {
    const p = join(ROOT, 'assets', `history-line-${track}.svg`);
    const svgText = readFileSync(p, 'utf8');
    const w = +svgText.match(/width="(\d+)"/)[1], hgt = +svgText.match(/height="(\d+)"/)[1];
    rasterize(p, join(ROOT, 'assets', `history-line-${track}.png`), w, hgt, 4096);
  }
}

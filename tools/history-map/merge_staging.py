#!/usr/bin/env python3
"""Merge researched track data (data/history/staging/*.json) into the
knowledge graph (data/history/entities/*.json + relations.json).

Policy:
- id rename map reconciles agents' independent naming
- one entity per id; researched copies win on dates/blurb/links/sources,
  fame keeps the max, influence ORs; multi-track people/companies move to
  the meta track; a small routing list keeps the web3d lineage together
- relations concat + rename + dedupe on (from,to,type); relations that
  reference unknown ids after merge are dropped and reported
Idempotent: safe to rerun as more staging files arrive."""

import json, glob, os, sys
from collections import OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, 'data', 'history')

RENAME = {
    'sun-microsystems': 'sun',
    'community-place': 'communityplace',
    'threejs': 'three-js',
    'meridian-59': 'meridian59',
    'evans-and-sutherland': 'evans-sutherland',
}

# these ids belong to the web3d track regardless of which agent found them
WEB3D_IDS = {
    'labyrinth', 'webspace', 'worldview', 'live3d', 'cosmo', 'communityplace',
    'blaxxun-contact', 'cortona', 'freewrl', 'x3dom', 'vivaty',
    'unity-web-player', 'sketchfab', 'firebox', 'janusvr', 'janusweb',
    'janusxr', 'elation', 'you-are-here', 'hubs',
}

def load(path):
    with open(path) as f:
        return json.load(f)

def rid(i):
    return RENAME.get(i, i)

def merge_entity(base, new):
    out = dict(base)
    for k in ('label', 'blurb', 'sub'):
        if new.get(k) and len(str(new.get(k, ''))) > len(str(out.get(k, ''))):
            out[k] = new[k]
    # researched dates win when richer (an end year or milestones)
    nd, bd = new.get('dates') or {}, out.get('dates') or {}
    if nd:
        richer = (nd.get('end') is not None and bd.get('end') is None) or \
                 (len(nd.get('milestones') or []) > len(bd.get('milestones') or []))
        out['dates'] = nd if richer or not bd else bd
        if bd and nd.get('start') and bd.get('start') and nd['start'] != bd['start']:
            # trust the researched start unless curation pinned it
            out['dates'] = dict(out['dates']); out['dates']['start'] = nd['start']
    out['fame'] = max(out.get('fame', 1), new.get('fame', 1))
    out['influence'] = bool(out.get('influence')) or bool(new.get('influence'))
    links = dict(new.get('links') or {}); links.update({k: v for k, v in (out.get('links') or {}).items() if v})
    if links: out['links'] = links
    src = list(OrderedDict.fromkeys((out.get('sources') or []) + (new.get('sources') or [])))
    out['sources'] = src
    if new.get('kind') and out.get('kind') in (None, 'product') and new['kind'] != 'product':
        out['kind'] = new['kind']
    return out

def main():
    entities = {}          # id -> entity
    tracks_seen = {}       # id -> set of tracks it appeared in
    relations = []

    # existing graph first (curated ids are the base)
    for path in sorted(glob.glob(os.path.join(DATA, 'entities', '*.json'))):
        for e in load(path)['entities']:
            e = dict(e); e['id'] = rid(e['id'])
            entities[e['id']] = e
            tracks_seen.setdefault(e['id'], set()).add(e['track'])
    rels_path = os.path.join(DATA, 'relations.json')
    if os.path.exists(rels_path):
        relations += load(rels_path)['relations']

    # staged research
    for path in sorted(glob.glob(os.path.join(DATA, 'staging', '*.json'))):
        d = load(path)
        for e in d.get('entities', []):
            e = dict(e); e['id'] = rid(e['id'])
            if e['id'] in entities:
                entities[e['id']] = merge_entity(entities[e['id']], e)
            else:
                entities[e['id']] = e
            tracks_seen.setdefault(e['id'], set()).add(e.get('track', 'meta'))
        relations += d.get('relations', [])

    # track routing
    for i, e in entities.items():
        if i in WEB3D_IDS:
            e['track'] = 'web3d'
        elif i.startswith('epoch-'):
            e['track'] = 'meta'
        elif len(tracks_seen.get(i, set())) > 1 and e.get('kind') in ('person', 'company'):
            e['track'] = 'meta'
        else:
            e['track'] = sorted(tracks_seen.get(i, {e.get('track', 'meta')}))[0] \
                if e.get('track') not in tracks_seen.get(i, set()) else e['track']

    # relations: rename, default role, drop placeholder-only dupes, dedupe
    seen = {}
    clean, dropped = [], []
    PLACEHOLDER = 'https://en.wikipedia.org/wiki/Virtual_world'
    for r in relations:
        r = dict(r); r['from'] = rid(r['from']); r['to'] = rid(r['to'])
        if r['from'] not in entities or r['to'] not in entities:
            dropped.append(f"{r['from']} -{r['type']}-> {r['to']} (unknown id)")
            continue
        if r.get('type') == 'role' and not r.get('role'):
            r['role'] = 'member'
        key = (r['from'], r['to'], r['type'], r.get('role', ''))
        if key in seen:
            prev = seen[key]
            # prefer the copy with real sources / more fields
            if PLACEHOLDER in (prev.get('sources') or []) and PLACEHOLDER not in (r.get('sources') or []):
                clean[clean.index(prev)] = r; seen[key] = r
            continue
        seen[key] = r
        clean.append(r)

    # write back per track
    by_track = {}
    for e in entities.values():
        by_track.setdefault(e['track'], []).append(e)
    for track, ents in sorted(by_track.items()):
        ents.sort(key=lambda e: (e['dates']['start'], e['id']))
        out = os.path.join(DATA, 'entities', f'{track}.json')
        json.dump({'track': track, 'entities': ents}, open(out, 'w'), indent=1, ensure_ascii=False)
        print(f'{track}: {len(ents)} entities')
    json.dump({'relations': clean}, open(rels_path, 'w'), indent=1, ensure_ascii=False)
    print(f'relations: {len(clean)} kept, {len(dropped)} dropped')
    for d in dropped[:15]:
        print('  dropped:', d)

if __name__ == '__main__':
    main()

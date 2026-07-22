#!/usr/bin/env python3
"""Generate room/models/lobby.glb and room/models/coin.glb from the SPACE.md layout.

The lobby architecture is procedural so the greybox stays regenerable — tweak the
parameters below and re-run. The coin is the Janus mark (assets/janus-mark.svg)
stroked and extruded inside a circular rim.

Deps: trimesh, shapely, svgpathtools, manifold3d, numpy
  python3 -m venv .venv && .venv/bin/pip install trimesh shapely svgpathtools manifold3d numpy
  .venv/bin/python tools/build-lobby-glb.py
"""

import math
import os

import numpy as np
import trimesh
from shapely.geometry import LineString, Point, Polygon, box
from shapely.ops import unary_union
from svgpathtools import svg2paths

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'room', 'models')
SVG = os.path.join(ROOT, 'assets', 'janus-mark.svg')

# ---- palette (PHOSPHOR greybox) --------------------------------------------
def mat(name, rgb, emissive=None, rough=0.9, metal=0.0):
    m = trimesh.visual.material.PBRMaterial(
        name=name,
        baseColorFactor=[rgb[0], rgb[1], rgb[2], 1.0],
        roughnessFactor=rough,
        metallicFactor=metal,
    )
    if emissive:
        m.emissiveFactor = emissive
    return m

M_FLOOR = mat('floor', [0.10, 0.12, 0.10])
M_WALL = mat('wall', [0.085, 0.10, 0.085])
M_STRUCT = mat('structure', [0.22, 0.26, 0.22])
M_TRIM = mat('trim-phosphor', [0.05, 0.2, 0.09], emissive=[0.26, 1.0, 0.43], rough=0.5)
M_TRIM_DIM = mat('trim-phosphor-dim', [0.04, 0.12, 0.06], emissive=[0.05, 0.22, 0.09], rough=0.6)
M_COIN = mat('coin-phosphor', [0.07, 0.3, 0.12], emissive=[0.26, 1.0, 0.43], rough=0.4)

# ---- layout parameters (must match room/lobby.html anchors) ----------------
PLAZA_R = 17.0
FLOOR_T = 0.5          # slab thickness; walking surface at y=0
WALL_H = 5.0
CORRIDOR_W = 7.0
CORRIDOR_Z = (14.0, 31.0)
WING_W = 8.0
WING_LEN = 18.0
WING_R = 23.0          # wing floor centre radius (spans r=14..32)
MEZZ_R = (10.0, 13.0)
MEZZ_Y = 4.0
MEZZ_T = 0.3
RAIL_H = 1.0
RAMP_W = 3.0
BASIN_R = 3.6
PED_R = 0.9
COIN_Y = 7.2

# bearings: deg from north, clockwise; north = -z, east = +x
WINGS = {'whatis': 225, 'explore': 0, 'get': 45, 'build': 90, 'timeline': 135}

def bearing_dir(deg):
    r = math.radians(deg)
    return np.array([math.sin(r), 0.0, -math.cos(r)])

def rot_y(deg):
    return trimesh.transformations.rotation_matrix(math.radians(deg), [0, 1, 0])

def place(mesh, material, translate=(0, 0, 0), transform=None):
    mesh = mesh.copy()
    if transform is not None:
        mesh.apply_transform(transform)
    mesh.apply_translation(translate)
    mesh.visual = trimesh.visual.TextureVisuals(material=material)
    return mesh

def extrude(polygon, height):
    if polygon.geom_type == 'MultiPolygon':
        return trimesh.util.concatenate([
            trimesh.creation.extrude_polygon(g, height=height, engine='earcut')
            for g in polygon.geoms])
    return trimesh.creation.extrude_polygon(polygon, height=height, engine='earcut')

def ngon(radius, n=8, rot=math.pi / 8):
    pts = [(radius * math.cos(2 * math.pi * i / n + rot),
            radius * math.sin(2 * math.pi * i / n + rot)) for i in range(n)]
    return Polygon(pts)

def xz(poly_mesh):
    """Extruded shapely polygons are built in XY with +Z up; lay them into XZ, +Y up."""
    m = poly_mesh.copy()
    m.apply_transform(trimesh.transformations.rotation_matrix(-math.pi / 2, [1, 0, 0]))
    return m

parts = []

# ---- plaza floor: disc etched like a circuit board -------------------------
import random as _rnd
_rnd.seed(4444)

disc = Point(0, 0).buffer(PLAZA_R, resolution=48)
ring = Point(0, 0).buffer(4.9, resolution=48).difference(Point(0, 0).buffer(4.6, resolution=48))
plaza = disc.difference(ring)
parts.append(place(xz(extrude(plaza, FLOOR_T)), M_FLOOR, (0, -FLOOR_T, 0)))
parts.append(place(xz(extrude(ring, FLOOR_T + 0.02)), M_TRIM, (0, -FLOOR_T, 0)))

# faint concentric radar rings echoing the monument ring
for rr in (8.2, 11.6, 15.2):
    radar = Point(0, 0).buffer(rr + 0.08, resolution=48).difference(
        Point(0, 0).buffer(rr - 0.08, resolution=48))
    parts.append(place(xz(extrude(radar, 0.02)), M_TRIM_DIM))

# PCB traces: radial runs with tangential jogs, ending in pads
def polar(r, deg):
    # world bearing → shapely XY (shapely +y becomes world -z through xz(),
    # so bearing 0 = north needs +y here)
    a = math.radians(deg)
    return (r * math.sin(a), r * math.cos(a))

traces = []
for k in range(26):
    th = _rnd.uniform(0, 360)
    r1 = 5.2
    r2 = _rnd.uniform(6.5, 11.5)
    th2 = th + _rnd.choice([-1, 1]) * _rnd.uniform(8, 24)
    r3 = _rnd.uniform(12.5, 16.4)
    pts = [polar(r1, th), polar(r2, th)]
    steps = 6
    for s in range(1, steps + 1):
        pts.append(polar(r2, th + (th2 - th) * s / steps))
    pts.append(polar(r3, th2))
    traces.append(LineString(pts).buffer(0.06, resolution=4))
    traces.append(Point(polar(r3, th2)).buffer(0.18, resolution=8))
parts.append(place(xz(extrude(unary_union(traces), 0.02)), M_TRIM_DIM))

# ---- entry corridor (south = +z; shapely +y maps to world -z through xz()) --
z0, z1 = CORRIDOR_Z
cor_floor = box(-CORRIDOR_W / 2, -z1, CORRIDOR_W / 2, -(z0 - 2))
parts.append(place(xz(extrude(cor_floor, FLOOR_T)), M_FLOOR, (0, -FLOOR_T, 0)))
for sx in (-1, 1):
    wall = box(sx * CORRIDOR_W / 2 - 0.2, -z1, sx * CORRIDOR_W / 2 + 0.2, -z0)
    parts.append(place(xz(extrude(wall, WALL_H)), M_WALL))

def arch_frame(width, height, opening_w, straight_h):
    """Wall slab with an arched doorway cut out, built in XY (x across, y up)."""
    frame = box(-width / 2, 0, width / 2, height)
    r = opening_w / 2
    opening = box(-r, -0.1, r, straight_h).union(
        Point(0, straight_h).buffer(r, resolution=32))
    return frame.difference(opening)

def face_center(mesh_2d_extruded, thickness):
    """Extruded frames are XY+Z; stand them up facing -z (north)."""
    m = mesh_2d_extruded.copy()
    m.apply_translation([0, 0, -thickness / 2])
    return m

def broken_arch(width, opening_w, straight_h, band=0.5, gap_frac=0.55):
    """Columns with arc stubs that spring inward and stop — tops deliberately
    missing. Virtual architecture doesn't need the keystone; the gap says so."""
    r = opening_w / 2
    cols = box(r, 0, width / 2, straight_h).union(box(-width / 2, 0, -r, straight_h))
    ring = Point(0, straight_h).buffer(r + band, resolution=32).difference(
        Point(0, straight_h).buffer(r, resolution=32))
    upper = ring.intersection(box(-width / 2, straight_h, width / 2, straight_h + r + band + 1))
    gap = opening_w * gap_frac
    return cols.union(upper).difference(
        box(-gap / 2, straight_h + 0.05, gap / 2, straight_h + r + band + 2))

# corridor mouth (facing the plaza, at z0) — broken like the ribs; the gateway
# pylons frame the monument without ever closing over it
arch = face_center(extrude(broken_arch(CORRIDOR_W + 2, 6.6, 3.8, band=0.6, gap_frac=0.6), 0.45), 0.45)
parts.append(place(arch, M_STRUCT, (0, 0, z0)))

# ---- wings -----------------------------------------------------------------
for name, deg in WINGS.items():
    d = bearing_dir(deg)
    c = d * WING_R
    R = rot_y(-deg)  # rotate +z-length geometry onto the bearing

    floor = box(-WING_W / 2, -WING_LEN / 2, WING_W / 2, WING_LEN / 2)
    f = xz(extrude(floor, FLOOR_T))
    parts.append(place(f, M_FLOOR, (c[0], -FLOOR_T, c[2]), R))

    for sx in (-1, 1):
        wall = box(sx * WING_W / 2 - 0.2, -WING_LEN / 2, sx * WING_W / 2 + 0.2, WING_LEN / 2)
        parts.append(place(xz(extrude(wall, WALL_H)), M_WALL, (c[0], 0, c[2]), R))

    if name != 'explore':  # explore stays open to the sky/horizon
        end = box(-WING_W / 2 - 0.2, WING_LEN / 2 - 0.4, WING_W / 2 + 0.2, WING_LEN / 2)
        parts.append(place(xz(extrude(end, WALL_H)), M_WALL, (c[0], 0, c[2]), R))

    # circular portal doorway where the wing meets the plaza (r = 14) —
    # the coin's echo: every threshold out of the plaza is a portal ring
    HOLE_R, HOLE_CY = 3.3, 2.7
    pw = box(-(WING_W + 1.2) / 2, 0, (WING_W + 1.2) / 2, 6.4).difference(
        Point(0, HOLE_CY).buffer(HOLE_R, resolution=36))
    mouth = face_center(extrude(pw, 0.45), 0.45)
    mp = d * 14.0
    parts.append(place(mouth, M_STRUCT, (mp[0], 0, mp[2]), rot_y(180 - deg)))
    liner = Point(0, HOLE_CY).buffer(HOLE_R + 0.14, resolution=36).difference(
        Point(0, HOLE_CY).buffer(HOLE_R, resolution=36)).intersection(
        box(-(WING_W + 1.2) / 2, 0.02, (WING_W + 1.2) / 2, 6.38))
    parts.append(place(face_center(extrude(liner, 0.2), 0.2), M_TRIM, (mp[0], 0, mp[2]), rot_y(180 - deg)))

    # pergola rib beams over the wing interior
    for ly in (-6.5, -3.5, -0.5, 2.5, 5.5, 8.0):
        beam = box(-WING_W / 2 - 0.2, ly - 0.14, WING_W / 2 + 0.2, ly + 0.14)
        parts.append(place(xz(extrude(beam, 0.35)), M_STRUCT, (c[0], WALL_H - 0.35, c[2]), R))

# (The mezzanine was cut entirely — it framed the coin nicely but occluded the
# scene too much. The scroll viewpoints now orbit low around the fountain
# instead; see the vp-* markers in room/lobby.html.)

# ---- monument: octagonal basin + pedestal ----------------------------------
basin_wall = ngon(BASIN_R).difference(ngon(BASIN_R - 0.35))
parts.append(place(xz(extrude(basin_wall, 0.9)), M_STRUCT))
parts.append(place(xz(extrude(ngon(BASIN_R - 0.3), 0.25)), M_FLOOR))  # basin floor
lip = ngon(BASIN_R + 0.08).difference(ngon(BASIN_R - 0.08))
parts.append(place(xz(extrude(lip, 0.05)), M_TRIM, (0, 0.9, 0)))

# two-tier tapered pedestal
parts.append(place(xz(extrude(ngon(1.35, rot=0), 0.8)), M_STRUCT))
parts.append(place(xz(extrude(ngon(PED_R * 0.85, rot=0), 3.4)), M_STRUCT, (0, 0.8, 0)))

# beacon: a laser rising from the pedestal, interrupted by the coin, then
# continuing to the sky with halo rings — the shaft skips the band the coin
# inhabits (coin centre 7.2, rim r 2.3, bob ±0.15)
parts.append(place(xz(extrude(ngon(0.06, n=8), 0.55)), M_TRIM, (0, 4.2, 0)))   # fountain → coin
parts.append(place(xz(extrude(ngon(0.06, n=8), 30.5)), M_TRIM, (0, 9.7, 0)))   # coin → sky
for hy, hr in ((11.6, 1.5), (13.4, 1.1), (15.4, 0.75)):
    halo = ngon(hr + 0.09, n=16, rot=0).difference(ngon(hr, n=16, rot=0))
    parts.append(place(xz(extrude(halo, 0.08)), M_TRIM, (0, hy, 0)))

# curved benches in the two path-less gaps (W and NW) — the social floor
def wedge(deg_center, deg_span, r0, r1):
    pts = [(0, 0)]
    for s in range(13):
        a = deg_center - deg_span / 2 + deg_span * s / 12
        pts.append(polar(r1 + 1, a))
    w = Polygon(pts)
    ann = Point(0, 0).buffer(r1, resolution=48).difference(Point(0, 0).buffer(r0, resolution=48))
    return ann.intersection(w)

for bc in (270, 315):
    parts.append(place(xz(extrude(wedge(bc, 26, 7.1, 7.75), 0.45)), M_STRUCT))
    parts.append(place(xz(extrude(wedge(bc, 26, 7.7, 7.78), 0.47)), M_TRIM_DIM))

# ---- info booth ------------------------------------------------------------
booth = trimesh.creation.box(extents=[1.4, 2.2, 0.35])
parts.append(place(booth, M_STRUCT, (4.5, 1.1, 4.5), rot_y(-45)))

# ============================================================================
# DRESSING PASS — everything below is atmosphere, not layout.
# ============================================================================

# ---- entry corridor: broken-arch ribs + glowing edge strips ----------------
RIB_ZS = (16.0, 19.5, 23.0, 27.0, 30.5)
for z in RIB_ZS:
    f = 1.0 - (z - RIB_ZS[0]) / (RIB_ZS[-1] - RIB_ZS[0])   # 1 nearest the plaza
    ow = 6.0 + 0.6 * f
    sh = 2.4 + 1.4 * f
    rib = face_center(extrude(broken_arch(7.4 + 0.8 * f, ow, sh, gap_frac=0.6), 0.25), 0.25)
    parts.append(place(rib, M_STRUCT, (0, 0, z)))
for sx in (-1, 1):
    strip = box(sx * 3.1 - 0.15, -(z1 - 0.5), sx * 3.1 + 0.15, -z0)
    parts.append(place(xz(extrude(strip, 0.03)), M_TRIM))

# ---- plaza: radial glowing paths to every destination ----------------------
for deg in list(WINGS.values()) + [180]:
    strip = box(-0.15, 5.0, 0.15, 13.8)
    parts.append(place(xz(extrude(strip, 0.03)), M_TRIM, (0, 0, 0), rot_y(-deg)))

# ---- plaza colonnade + mezzanine support columns ---------------------------
MID_BEARINGS = [22.5 + k * 45 for k in range(8)]
for b in MID_BEARINGS:
    d = bearing_dir(b)
    # freestanding pillar with cap marking the plaza boundary
    p2 = d * 15.6
    parts.append(place(xz(extrude(ngon(0.38, n=8), 5.6)), M_STRUCT, (p2[0], 0, p2[2])))
    parts.append(place(xz(extrude(ngon(0.55, n=8), 0.18)), M_TRIM, (p2[0], 5.6, p2[2])))
    # banner fin hanging inward from the pillar top (house style: banners aloft)
    l = np.array([d[2], 0.0, -d[0]])
    fin = trimesh.creation.box(extents=[0.08, 2.6, 0.9])
    yaw = math.degrees(math.atan2(d[0], -d[2]))
    fp = d * 14.9
    parts.append(place(fin, M_WALL, (fp[0], 4.1, fp[2]), rot_y(-yaw)))
    edge = trimesh.creation.box(extents=[0.1, 2.6, 0.08])
    ep = d * 14.42
    parts.append(place(edge, M_TRIM_DIM, (ep[0], 4.1, ep[2]), rot_y(-yaw)))


# ---- wing dressing ---------------------------------------------------------
def wing_place(mesh, material, local_x, y, local_r, deg):
    """Place a mesh at wing-local coordinates (lateral, height, radial-from-center)."""
    d = bearing_dir(deg)
    l = np.array([d[2], 0.0, -d[0]])
    p = d * local_r + l * local_x
    parts.append(place(mesh, material, (p[0], y, p[2]), rot_y(180 - deg)))

for name, deg in WINGS.items():
    d = bearing_dir(deg)
    c = d * WING_R
    R = rot_y(-deg)

    # pilasters along both side walls
    for ly in (-6.0, -1.5, 3.0):   # wing-local radial offsets from centre
        for sx in (-1, 1):
            pil = box(sx * (WING_W / 2 - 0.35) - 0.18, ly - 0.25, sx * (WING_W / 2 - 0.35) + 0.18, ly + 0.25)
            parts.append(place(xz(extrude(pil, 4.6)), M_STRUCT, (c[0], 0, c[2]), R))

    if name == 'explore':
        # departure gate frames around the portals
        gate = face_center(extrude(arch_frame(3.2, 3.6, 2.3, 2.0), 0.3), 0.3)
        for lx in (-2.5, 2.5):
            wing_place(gate, M_TRIM, lx, 0, 31.55, deg)
    elif name == 'timeline':
        # twin tunnel mouths on the end wall: future glows, the past is dim
        ring = extrude(Point(0, 0).buffer(1.6, resolution=24).difference(
            Point(0, 0).buffer(1.35, resolution=24)), 0.4)
        ring = face_center(ring, 0.4)
        inset = face_center(extrude(Point(0, 0).buffer(1.35, resolution=24), 0.1), 0.1)
        wing_place(ring, M_STRUCT, -2.2, 2.2, 31.3, deg)   # past (local left)
        wing_place(inset, M_WALL, -2.2, 2.2, 31.35, deg)
        wing_place(ring, M_TRIM, 2.2, 2.2, 31.3, deg)      # future (local right)
        wing_place(inset, M_WALL, 2.2, 2.2, 31.35, deg)
    else:
        # framed placard wall where the Paragraph mount sits
        pframe = face_center(extrude(
            box(-4.5, 0.4, 4.5, 7.0).difference(box(-4.15, 0.75, 4.15, 6.65)), 0.3), 0.3)
        wing_place(pframe, M_STRUCT, 0, 0, 31.5, deg)

    if name == 'build':
        # three hallway dividers — the Quake three-door select, made physical
        for lx in (-1.33, 1.33):
            div = box(lx - 0.15, 1.0, lx + 0.15, WING_LEN / 2 - 0.6)
            parts.append(place(xz(extrude(div, 4.0)), M_STRUCT, (c[0], 0, c[2]), R))

lobby = trimesh.Scene()
for i, p in enumerate(parts):
    lobby.add_geometry(p, node_name=f'lobby-{i:03d}')

os.makedirs(OUT_DIR, exist_ok=True)
lobby_path = os.path.join(OUT_DIR, 'lobby.glb')
lobby.export(lobby_path)

# ---- collision mesh: same layout, coarse shapes, few tris ------------------
# Mesh colliders are tested per-frame by physics; the visual mesh's 12k tris
# stalled the engine to sub-1fps. This stays in the low hundreds.
M_COL = mat('collision', [1.0, 0.0, 1.0])
cparts = []

cparts.append(place(xz(extrude(ngon(PLAZA_R, n=12), FLOOR_T)), M_COL, (0, -FLOOR_T, 0)))
cparts.append(place(xz(extrude(box(-CORRIDOR_W / 2, -z1, CORRIDOR_W / 2, -(z0 - 2)), FLOOR_T)), M_COL, (0, -FLOOR_T, 0)))
for sx in (-1, 1):
    cparts.append(place(xz(extrude(box(sx * CORRIDOR_W / 2 - 0.2, -z1, sx * CORRIDOR_W / 2 + 0.2, -z0), WALL_H)), M_COL))

for name, deg in WINGS.items():
    d = bearing_dir(deg)
    c = d * WING_R
    R = rot_y(-deg)
    cparts.append(place(xz(extrude(box(-WING_W / 2, -WING_LEN / 2, WING_W / 2, WING_LEN / 2), FLOOR_T)), M_COL, (c[0], -FLOOR_T, c[2]), R))
    for sx in (-1, 1):
        cparts.append(place(xz(extrude(box(sx * WING_W / 2 - 0.2, -WING_LEN / 2, sx * WING_W / 2 + 0.2, WING_LEN / 2), WALL_H)), M_COL, (c[0], 0, c[2]), R))
    if name != 'explore':
        cparts.append(place(xz(extrude(box(-WING_W / 2, WING_LEN / 2 - 0.4, WING_W / 2, WING_LEN / 2), WALL_H)), M_COL, (c[0], 0, c[2]), R))

for bc in (270, 315):   # bench proxies
    bx, bz = polar(7.45, bc)
    cparts.append(place(trimesh.creation.box(extents=[3.6, 0.45, 0.7]), M_COL,
                        (bx, 0.225, bz), rot_y(-(bc + 90))))

cparts.append(place(xz(extrude(ngon(BASIN_R), 0.9)), M_COL))          # basin: solid drum
cparts.append(place(xz(extrude(ngon(PED_R, rot=0), 4.2)), M_COL))     # pedestal
cparts.append(place(trimesh.creation.box(extents=[1.4, 2.2, 0.35]), M_COL, (4.5, 1.1, 4.5), rot_y(-45)))

collision = trimesh.Scene()
for i, p in enumerate(cparts):
    collision.add_geometry(p, node_name=f'col-{i:03d}')
collision_path = os.path.join(OUT_DIR, 'lobby-collision.glb')
collision.export(collision_path)

# ---- the coin: Janus mark stroked + extruded inside a rim ------------------
paths, _ = svg2paths(SVG)
strokes = []
for path in paths:
    pts = [path.point(t) for t in np.linspace(0, 1, 160)]
    coords = [(p.real, p.imag) for p in pts]
    if len(coords) >= 2:
        strokes.append(LineString(coords).buffer(8.0, resolution=8))
mark = unary_union(strokes)

# svg space: 256x256, y down. center, flip y, scale into the rim
CENTER = 256 / 2.0
RIM_R = 2.3
MARK_R = 1.75
scale = (MARK_R * 2) / 235.0   # mark occupies ~235 svg units
from shapely.affinity import translate as sh_translate, scale as sh_scale
mark_geo = unary_union(strokes)
mark_geo = sh_translate(mark_geo, xoff=-CENTER, yoff=-CENTER)
mark_geo = sh_scale(mark_geo, xfact=scale, yfact=-scale, origin=(0, 0))

coin_parts = []
rim = Point(0, 0).buffer(RIM_R, resolution=64).difference(
    Point(0, 0).buffer(RIM_R - 0.22, resolution=64))
coin_parts.append(place(extrude(rim, 0.5), M_COIN, (0, 0, -0.25)))
coin_parts.append(place(extrude(mark_geo, 0.44), M_COIN, (0, 0, -0.22)))

coin = trimesh.Scene()
for i, p in enumerate(coin_parts):
    coin.add_geometry(p, node_name=f'coin-{i:02d}')
coin_path = os.path.join(OUT_DIR, 'coin.glb')
coin.export(coin_path)

for path in (lobby_path, coin_path, collision_path):
    scene = trimesh.load(path)
    tris = sum(len(g.faces) for g in scene.geometry.values())
    print(f'{os.path.relpath(path, ROOT)}: {len(scene.geometry)} meshes, {tris} tris, '
          f'{os.path.getsize(path) / 1024:.0f} KB')

# ---- PHOSPHOR skybox -------------------------------------------------------
from PIL import Image, ImageDraw
import random
random.seed(4444)

SKY_DIR = os.path.join(ROOT, 'room', 'skybox')
os.makedirs(SKY_DIR, exist_ok=True)
S = 512

def stars(draw, count, ymax):
    for _ in range(count):
        x, y = random.randint(0, S - 1), random.randint(0, int(ymax))
        b = random.randint(30, 110)
        draw.point((x, y), fill=(int(b * 0.55), b, int(b * 0.65)))

side = Image.new('RGB', (S, S))
d = ImageDraw.Draw(side)
for y in range(S):
    t = y / S
    # near-black zenith fading to a dark phosphor glow at the horizon
    r = int(5 + t * t * 8)
    g = int(7 + t * t * 30)
    b2 = int(5 + t * t * 14)
    d.line([(0, y), (S, y)], fill=(r, g, b2))
stars(d, 90, S * 0.55)
for face in ('front', 'back', 'left', 'right'):
    side.save(os.path.join(SKY_DIR, f'{face}.png'))

up = Image.new('RGB', (S, S), (5, 7, 5))
stars(ImageDraw.Draw(up), 160, S - 1)
up.save(os.path.join(SKY_DIR, 'up.png'))

Image.new('RGB', (S, S), (10, 13, 10)).save(os.path.join(SKY_DIR, 'down.png'))
print('room/skybox: 6 faces generated')

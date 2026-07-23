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
CORRIDOR_Z = (14.0, 27.4)
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
WINGS = {'learn': 280, 'build': 80}
# per-wing (width, length) overrides; build carries the most content
WING_DIMS = {'build': (12.0, 26.0), 'learn': (12.0, 26.0)}

def wing_dims(name):
    w, ln = WING_DIMS.get(name, (WING_W, WING_LEN))
    return w, ln, 14.0 + ln / 2   # width, length, floor-centre radius

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
arch = face_center(extrude(broken_arch(CORRIDOR_W + 2, 6.4, 3.8, band=0.6, gap_frac=0.6), 0.45), 0.45)
parts.append(place(arch, M_STRUCT, (0, 0, z0)))

# ---- curved halls: learn wraps west, build wraps east ----------------------
# The wings hug the plaza as annular cloisters instead of radial slabs — you
# enter at the same doorways, turn, and walk a curve back toward Main Street,
# where each hall terminates against the corridor walls. Nothing looms over
# the valley.
HALL_R = (17.2, 27.2)
HALLS = {
    # entrance bearing, far cap (at the corridor), near cap, inner-wall gap
    'learn': dict(deg=280, cap_far=188, cap_near=296, gap=(268.5, 291.5), exit=(189.0, 194.0)),
    'build': dict(deg=80,  cap_far=172, cap_near=64,  gap=(68.5, 91.5), exit=(166.0, 171.0)),
}

def wpolar(r, deg):
    a = math.radians(deg)
    return (r * math.sin(a), -r * math.cos(a))

def sectorp(a0, a1, radius=45.0):
    n = max(12, int(abs(a1 - a0) / 3))
    pts = [(0.0, 0.0)] + [polar(radius, a0 + (a1 - a0) * i / n) for i in range(n + 1)]
    return Polygon(pts)

def annsec(r0, r1, a0, a1):
    ann = Point(0, 0).buffer(r1, resolution=96).difference(Point(0, 0).buffer(r0, resolution=96))
    return ann.intersection(sectorp(min(a0, a1), max(a0, a1)))

def face_yaw(v):
    return math.degrees(math.atan2(-v[0], -v[2]))

CORR_SLAB = box(-3.7, -28.0, 3.7, -12.0)   # corridor interior; halls end flush at its walls

for name, spec in HALLS.items():
    deg = spec['deg']
    a0, a1 = sorted((spec['cap_far'], spec['cap_near']))
    g0, g1 = spec['gap']
    d = bearing_dir(deg)

    def hclip(poly):
        return poly.difference(CORR_SLAB)

    # floor + foundation under the outer edge
    parts.append(place(xz(extrude(hclip(annsec(HALL_R[0], HALL_R[1], a0, a1)), 0.5)), M_FLOOR, (0, -0.5, 0)))
    parts.append(place(xz(extrude(hclip(annsec(26.7, HALL_R[1], a0, a1)), 4.7)), M_WALL, (0, -5.2, 0)))

    # inner wall (split around the entrance gap), outer wall; the far end is
    # capped by the corridor wall itself — halls are clipped flush against it
    parts.append(place(xz(extrude(hclip(annsec(17.2, 17.6, a0, g0)), WALL_H)), M_WALL))
    parts.append(place(xz(extrude(hclip(annsec(17.2, 17.6, g1, a1)), WALL_H)), M_WALL))
    e0, e1 = spec['exit']
    parts.append(place(xz(extrude(hclip(annsec(26.8, 27.2, a0, e0)), WALL_H)), M_WALL))
    parts.append(place(xz(extrude(hclip(annsec(26.8, 27.2, e1, a1)), WALL_H)), M_WALL))
    cn = spec['cap_near']
    cap_span = (a1 - 0.9, a1) if cn == a1 else (a0, a0 + 0.9)
    parts.append(place(xz(extrude(hclip(annsec(17.2, 27.2, cap_span[0], cap_span[1])), WALL_H)), M_WALL))

    # skirting glow along both walls; radial pergola beams overhead
    parts.append(place(xz(extrude(hclip(annsec(17.65, 17.77, a0 + 1, a1 - 1)), 0.04)), M_TRIM_DIM))
    parts.append(place(xz(extrude(hclip(annsec(26.63, 26.75, a0 + 1, a1 - 1)), 0.04)), M_TRIM_DIM))
    a = a0 + 4.0
    while a < a1 - 2.0:
        parts.append(place(xz(extrude(hclip(annsec(17.0, 27.4, a - 0.45, a + 0.45)), 0.35)), M_STRUCT, (0, WALL_H - 0.35, 0)))
        a += 10.0
    # radial pilasters on the outer wall
    a = a0 + 8.0
    while a < a1 - 4.0:
        parts.append(place(xz(extrude(annsec(26.25, 26.8, a - 0.75, a + 0.75), 4.6)), M_STRUCT))
        a += 16.0

    # entrance vestibule: portal mouth at the plaza edge, short passage inward
    mp = d * 16.7
    HOLE_R, HOLE_CY = 3.3, 2.7
    pw = box(-4.6, 0, 4.6, 6.4).difference(Point(0, HOLE_CY).buffer(HOLE_R, resolution=36))
    parts.append(place(face_center(extrude(pw, 0.45), 0.45), M_STRUCT, (mp[0], 0, mp[2]), rot_y(180 - deg)))
    liner = Point(0, HOLE_CY).buffer(HOLE_R + 0.08, resolution=36).difference(
        Point(0, HOLE_CY).buffer(HOLE_R - 0.04, resolution=36)).intersection(box(-4.6, 0.02, 4.6, 6.38))
    parts.append(place(face_center(extrude(liner, 0.5), 0.5), M_TRIM, (mp[0], 0, mp[2]), rot_y(180 - deg)))
    vfloor = box(-3.6, 15.8, 3.6, 17.5)
    parts.append(place(xz(extrude(vfloor, 0.5)), M_FLOOR, (0, -0.5, 0), rot_y(-deg)))

    if name == 'learn':
        # concept plinths along the inner curve
        for b in (258, 242, 226):
            px, pz = wpolar(19.7, b)
            parts.append(place(trimesh.creation.box(extents=[1.1, 1.0, 1.1]), M_STRUCT, (px, 0.5, pz), rot_y(-b)))
            parts.append(place(trimesh.creation.box(extents=[1.22, 0.06, 1.22]), M_TRIM_DIM, (px, 1.03, pz), rot_y(-b)))
        # the Mirror on the outer wall near the far end; the vault opposite
        mring = face_center(extrude(Point(0, 3.2).buffer(3.0, resolution=36).difference(
            Point(0, 3.2).buffer(2.8, resolution=36)), 0.2), 0.2)
        md = bearing_dir(193)
        mx, mz = wpolar(26.6, 193)
        parts.append(place(mring, M_TRIM_DIM, (mx, 0, mz), rot_y(face_yaw(-md))))
        vring = face_center(extrude(Point(0, 1.6).buffer(1.2, resolution=24).difference(
            Point(0, 1.6).buffer(1.0, resolution=24)), 0.25), 0.25)
        vdoor = face_center(extrude(Point(0, 1.6).buffer(1.0, resolution=24), 0.1), 0.1)
        vd = bearing_dir(202)
        vx, vz = wpolar(17.8, 202)
        parts.append(place(vring, M_TRIM_DIM, (vx, 0, vz), rot_y(face_yaw(vd))))
        parts.append(place(vdoor, M_WALL, (vx + vd[0] * -0.05, 0, vz + vd[2] * -0.05), rot_y(face_yaw(vd))))
        # obelisk beside the mouth, facing the plaza
        obx, obz = wpolar(16.6, 260)
        parts.append(place(trimesh.creation.box(extents=[0.9, 7.5, 0.9]), M_STRUCT, (obx, 3.75, obz), rot_y(180 - 260)))
        obd = bearing_dir(260)
        parts.append(place(trimesh.creation.box(extents=[0.14, 6.8, 0.08]), M_TRIM,
                           (obx - obd[0] * 0.5, 3.6, obz - obd[2] * 0.5), rot_y(180 - 260)))
    else:
        # build: three bays along the outer wall — the three-door select, curved
        for b in (104, 120):
            parts.append(place(xz(extrude(annsec(21.7, 26.8, b - 0.6, b + 0.6), 4.0)), M_STRUCT))
        # editor bay: scattered blocks
        for b, rr, bs in ((95, 24.7, 0.55), (99, 23.2, 0.4), (93, 23.7, 0.7)):
            px, pz = wpolar(rr, b)
            parts.append(place(trimesh.creation.box(extents=[bs, bs, bs]), M_STRUCT, (px, bs / 2, pz), rot_y(-b * 2)))
        # markup bay: source-glow strips on the bay dividers
        for b in (105.5, 118.5):
            px, pz = wpolar(24.2, b)
            parts.append(place(trimesh.creation.box(extents=[0.04, 1.6, 1.2]), M_TRIM_DIM, (px, 2.0, pz), rot_y(-b)))
        # scripting bay: the machine plinth (its spinning core lives in the JML)
        px, pz = wpolar(23.7, 114)
        parts.append(place(xz(extrude(ngon(0.5, n=8), 1.1)), M_STRUCT, (px, 0, pz)))
        # server racks near the far end
        for b in (152, 160):
            for rr in (19.2, 25.2):
                px, pz = wpolar(rr, b)
                parts.append(place(trimesh.creation.box(extents=[0.9, 2.1, 0.7]), M_WALL, (px, 1.05, pz), rot_y(-b)))
                parts.append(place(trimesh.creation.box(extents=[0.9, 0.05, 0.7]), M_TRIM_DIM, (px, 2.15, pz), rot_y(-b)))
        # open-source placard frame on the far cap
        pframe = face_center(extrude(
            box(-3.2, 0.4, 3.2, 5.0).difference(box(-2.9, 0.7, 2.9, 4.7)), 0.3), 0.3)
        fx, fz = wpolar(22.2, 170.6)
        parts.append(place(pframe, M_STRUCT, (fx, 0, fz), rot_y(face_yaw(np.array([0.986, 0, -0.165])))))

# ---- the halo ring ---------------------------------------------------------
# Decorative successor to the old mezzanine: a thin band floating over the
# plaza with no supports (virtual architecture owes gravity nothing), broken
# across the south so it never crosses the Main Street sightline. Not walkable.
RING_R = (7.2, 7.9)
RING_Y = 5.2
RING_GAP = (160.0, 200.0)

def sector_poly(deg0, deg1, radius=24.0):
    pts = [(0.0, 0.0)]
    for s in range(13):
        pts.append(polar(radius, deg0 + (deg1 - deg0) * s / 12))
    return Polygon(pts)

RING_CUT = sector_poly(RING_GAP[0], RING_GAP[1])

halo_band = Point(0, 0).buffer(RING_R[1], resolution=64).difference(
    Point(0, 0).buffer(RING_R[0], resolution=64)).difference(RING_CUT)
parts.append(place(xz(extrude(halo_band, 0.2)), M_STRUCT, (0, RING_Y, 0)))
halo_glow = Point(0, 0).buffer(7.62, resolution=64).difference(
    Point(0, 0).buffer(7.48, resolution=64)).difference(RING_CUT)
parts.append(place(xz(extrude(halo_glow, 0.04)), M_TRIM_DIM, (0, RING_Y + 0.2, 0)))
# glowing pads at the break
for enddeg in RING_GAP:
    px, pz = wpolar((RING_R[0] + RING_R[1]) / 2, enddeg + (1.2 if enddeg == RING_GAP[0] else -1.2))
    parts.append(place(xz(extrude(ngon(0.28, n=8), 0.24)), M_TRIM, (px, RING_Y - 0.02, pz)))

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

for bc in (135, 225):
    parts.append(place(xz(extrude(wedge(bc, 26, 7.1, 7.75), 0.45)), M_STRUCT))
    parts.append(place(xz(extrude(wedge(bc, 26, 7.7, 7.78), 0.47)), M_TRIM_DIM))

# ---- info booth ------------------------------------------------------------
booth = trimesh.creation.box(extents=[1.4, 2.2, 0.35])
parts.append(place(booth, M_STRUCT, (4.5, 1.1, 4.5), rot_y(-45)))

# ============================================================================
# DRESSING PASS — everything below is atmosphere, not layout.
# ============================================================================

# ---- entry corridor: broken-arch ribs + glowing edge strips ----------------
RIB_ZS = (16.0, 19.5, 23.0, 26.5)
for z in RIB_ZS:
    f = 1.0 - (z - RIB_ZS[0]) / (RIB_ZS[-1] - RIB_ZS[0])   # 1 nearest the plaza
    # rib columns stay just inside the corridor walls (inner face ±3.3) so no
    # surface is coplanar with them
    ow = 5.3 + 0.4 * f
    sh = 2.4 + 1.4 * f
    rib = face_center(extrude(broken_arch(6.5, ow, sh, band=0.42, gap_frac=0.6), 0.25), 0.25)
    parts.append(place(rib, M_STRUCT, (0, 0, z)))
for sx in (-1, 1):
    strip = box(sx * 3.1 - 0.15, -(z1 - 0.5), sx * 3.1 + 0.15, -z0)
    parts.append(place(xz(extrude(strip, 0.03)), M_TRIM))

# ---- plaza: radial glowing paths to every destination ----------------------
for deg in list(WINGS.values()) + [180]:
    strip = box(-0.15, 5.0, 0.15, 13.8)
    parts.append(place(xz(extrude(strip, 0.03)), M_TRIM, (0, 0, 0), rot_y(-deg)))

# ---- plaza colonnade + mezzanine support columns ---------------------------
MID_BEARINGS = [112.5, 135.0, 157.5, 202.5, 225.0, 247.5]
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

# ============================================================================
# THE OUTDOORS — ground, the hill, the grand stair, the valley esplanade,
# and the Thirteenth Floor border where reality runs out.
# ============================================================================

GROUND_Y = -5.0

# Content routes into three exports: the world frame (ground + border, stays at
# origin), the lobby (shrine/halls/corridor/stair, movable as a group), and the
# esplanade (valley content, movable as a group).
lobby_parts = parts
espl_parts = []
world_parts = []

parts = world_parts
# ---- ground plane (valley floor and surrounding land) ----------------------
ground = Point(0, 0).buffer(55, resolution=64)
parts.append(place(xz(extrude(ground, 0.5)), M_FLOOR, (0, GROUND_Y - 0.5, 0)))

parts = lobby_parts
# ---- the hill: conical skirt under the plaza, foundations under the rest ---
skirt = trimesh.creation.revolve(np.array([[19.0, 0.0], [26.0, GROUND_Y]]), sections=64)
skirt.apply_transform(trimesh.transformations.rotation_matrix(-math.pi / 2, [1, 0, 0]))
parts.append(place(skirt, M_WALL))
parts.append(place(trimesh.creation.box(extents=[8.0, 4.5, 15.0]), M_WALL, (0, -2.75, 20.5)))

# ---- the grand stair: plaza rim down to the valley, north -------------------
STAIR_W = 18.0
for i in range(10):
    ytop = -0.5 * (i + 1)
    zc = -(17.0 + 0.6 + 1.2 * i)
    parts.append(place(trimesh.creation.box(extents=[STAIR_W, 0.5, 1.2]), M_STRUCT,
                       (0, ytop - 0.25, zc)))
    # glowing nose strip on each tread
    parts.append(place(trimesh.creation.box(extents=[STAIR_W, 0.05, 0.1]), M_TRIM_DIM,
                       (0, ytop + 0.02, zc - 0.55)))
# balustrade posts at the overlook
for sx in (-1, 1):
    parts.append(place(xz(extrude(ngon(0.25, n=8), 1.1)), M_STRUCT, (sx * 9.4, 0, -16.6)))
    parts.append(place(xz(extrude(ngon(0.35, n=8), 0.1)), M_TRIM, (sx * 9.4, 1.1, -16.6)))


# ---- the balcony: wraps Main Street's south end, overlooking the void -------
# Continues the curve of the halls' back walls; each hall exits onto it near
# its far cap, and it feeds the corridor's south mouth — walk a whole wing and
# you come out a short stroll from spawn.
CORR_FOOT = box(-3.9, -27.2, 3.9, -13.0)   # corridor footprint (shapely y = -z)
bal_floor = annsec(27.4, 31.9, 160, 200).difference(CORR_FOOT)
parts.append(place(xz(extrude(bal_floor, 0.5)), M_FLOOR, (0, -0.5, 0)))
# outer balustrade + glowing cap
bal_rail = annsec(31.55, 31.9, 160, 200).difference(CORR_FOOT)
parts.append(place(xz(extrude(bal_rail, 1.0)), M_STRUCT))
bal_cap = annsec(31.5, 31.95, 160, 200).difference(CORR_FOOT)
parts.append(place(xz(extrude(bal_cap, 0.06)), M_TRIM, (0, 1.0, 0)))
# end returns and inner skirting glow
for ea in ((160, 161.2), (198.8, 200)):
    parts.append(place(xz(extrude(annsec(27.4, 31.9, ea[0], ea[1]), 1.0)), M_STRUCT))
parts.append(place(xz(extrude(annsec(27.5, 27.62, 161, 199).difference(CORR_FOOT), 0.04)), M_TRIM_DIM))
# foundation down to the hillside/ground
bal_found = annsec(31.4, 31.9, 160, 200).difference(CORR_FOOT)
parts.append(place(xz(extrude(bal_found, 4.7)), M_WALL, (0, -5.2, 0)))

parts = espl_parts
# ---- the esplanade: promenade axis through the valley ----------------------
parts.append(place(trimesh.creation.box(extents=[1.6, 0.05, 44]), M_TRIM,
                   (0, GROUND_Y + 0.03, -51)))

# ---- history station (west of the promenade) --------------------------------
SX, SZ = -16.0, -46.0   # station centre
# platform pad + glowing edge facing the promenade
parts.append(place(trimesh.creation.box(extents=[15, 0.15, 11]), M_STRUCT, (SX - 0.5, GROUND_Y + 0.08, SZ)))
parts.append(place(trimesh.creation.box(extents=[0.12, 0.06, 11]), M_TRIM_DIM, (SX + 6.9, GROUND_Y + 0.18, SZ)))
# walls: rear (west), north, south; open east toward the promenade
parts.append(place(trimesh.creation.box(extents=[0.4, 4.5, 11]), M_WALL, (SX - 7.3, GROUND_Y + 2.25, SZ)))
parts.append(place(trimesh.creation.box(extents=[15, 4.5, 0.4]), M_WALL, (SX - 0.5, GROUND_Y + 2.25, SZ - 5.3)))
parts.append(place(trimesh.creation.box(extents=[15, 4.5, 0.4]), M_WALL, (SX - 0.5, GROUND_Y + 2.25, SZ + 5.3)))
# canopy + posts at the open edge
parts.append(place(trimesh.creation.box(extents=[16, 0.25, 12]), M_STRUCT, (SX - 0.5, GROUND_Y + 4.6, SZ)))
for pz in (SZ - 4.6, SZ + 4.6):
    parts.append(place(xz(extrude(ngon(0.22, n=8), 4.5)), M_STRUCT, (SX + 6.6, GROUND_Y, pz)))
# era plinths along the platform
for pz in (SZ - 3.0, SZ, SZ + 3.0):
    parts.append(place(trimesh.creation.box(extents=[1.0, 0.8, 1.0]), M_STRUCT, (SX, GROUND_Y + 0.4, pz)))
    parts.append(place(trimesh.creation.box(extents=[1.12, 0.06, 1.12]), M_TRIM_DIM, (SX, GROUND_Y + 0.83, pz)))
# tunnel mouths: past on the south wall (dim), future on the north wall (bright)
tring = face_center(extrude(Point(0, GROUND_Y + 2.2 - GROUND_Y).buffer(1.3, resolution=24).difference(
    Point(0, GROUND_Y + 2.2 - GROUND_Y).buffer(1.1, resolution=24)), 0.3), 0.3)
tinset = face_center(extrude(Point(0, GROUND_Y + 2.2 - GROUND_Y).buffer(1.1, resolution=24), 0.1), 0.1)
for wz, mat_ring in ((SZ - 5.3, M_TRIM_DIM), (SZ + 5.3, M_TRIM)):
    yaw = 0 if wz > SZ else 180
    parts.append(place(tring, mat_ring, (SX, GROUND_Y, wz), rot_y(yaw)))
    parts.append(place(tinset, M_WALL, (SX, GROUND_Y, wz), rot_y(yaw)))

# ---- showcase area (east of the promenade) ---------------------------------
for pz in (-49.0, -46.0, -43.0):
    parts.append(place(trimesh.creation.box(extents=[1.0, 0.8, 1.0]), M_STRUCT, (16.0, GROUND_Y + 0.4, pz)))
    parts.append(place(trimesh.creation.box(extents=[1.12, 0.06, 1.12]), M_TRIM_DIM, (16.0, GROUND_Y + 0.83, pz)))
showgate = face_center(extrude(arch_frame(3.2, 3.6, 2.3, 2.0), 0.3), 0.3)
for gz in (-44.0, -48.0):
    parts.append(place(showgate, M_STRUCT, (10.5, GROUND_Y, gz), rot_y(90)))

# ---- project gates flanking the promenade near the far end -----------------
grand = face_center(extrude(arch_frame(4.2, 4.6, 3.1, 2.5), 0.35), 0.35)
gate = face_center(extrude(arch_frame(3.2, 3.6, 2.3, 2.0), 0.3), 0.3)
parts.append(place(grand, M_TRIM, (-6.8, GROUND_Y, -62.0), rot_y(-90)))
parts.append(place(gate, M_TRIM, (6.8, GROUND_Y, -62.0), rot_y(90)))
parts.append(place(gate, M_STRUCT, (-6.8, GROUND_Y, -68.0), rot_y(-90)))
parts.append(place(gate, M_STRUCT, (6.8, GROUND_Y, -68.0), rot_y(90)))

parts = world_parts
# ---- the Thirteenth Floor border -------------------------------------------
# Solid world dissolves to green wireframe over blackness; a bright seam marks
# where reality ends. (Reference: the movie poster; an Elation-era aesthetic.)
_rnd.seed(1313)
# dissolution band: scattered floor patches over the void
for i in range(70):
    th = _rnd.uniform(0, 360)
    rr = _rnd.uniform(56, 69)
    px, pz = wpolar(rr, th)
    size = _rnd.uniform(1.5, 4.5)
    parts.append(place(trimesh.creation.box(extents=[size, 0.3, size * _rnd.uniform(0.5, 1.0)]), M_FLOOR,
                       (px, GROUND_Y - 0.15, pz), rot_y(_rnd.uniform(0, 360))))
# dim grid emerging beneath the dissolution
for th in range(0, 360, 15):
    strip = box(-0.07, 55, 0.07, 70)
    parts.append(place(xz(extrude(strip, 0.05)), M_TRIM_DIM, (0, GROUND_Y - 0.05, 0), rot_y(-th)))
# the light seam at the edge of reality
seam = Point(0, 0).buffer(70.3, resolution=96).difference(Point(0, 0).buffer(69.7, resolution=96))
parts.append(place(xz(extrude(seam, 0.08)), M_TRIM, (0, GROUND_Y, 0)))
# pure wireframe beyond: radials and concentric rings over nothing
for th in range(0, 360, 8):
    strip = box(-0.06, 70.5, 0.06, 90)
    parts.append(place(xz(extrude(strip, 0.06)), M_TRIM, (0, GROUND_Y, 0), rot_y(-th)))
for rr in (75.0, 81.0, 87.0):
    ring = Point(0, 0).buffer(rr + 0.06, resolution=80).difference(Point(0, 0).buffer(rr - 0.06, resolution=80))
    parts.append(place(xz(extrude(ring, 0.06)), M_TRIM, (0, GROUND_Y, 0)))
# wireframe hills at the horizon: an undulating rim
for k in range(72):
    b = k * 5.0
    hx, hz = wpolar(90.5, b)
    hy = GROUND_Y + max(0.0, math.sin(math.radians(b * 3.0))) * 2.6
    seg = trimesh.creation.box(extents=[0.12, 0.1, 8.0])
    parts.append(place(seg, M_TRIM, (hx, hy, hz), rot_y(-(b + 90))))

parts = lobby_parts
os.makedirs(OUT_DIR, exist_ok=True)
export_paths = []
for scene_name, plist in (('lobby', lobby_parts), ('esplanade', espl_parts), ('world', world_parts)):
    sc = trimesh.Scene()
    for i, p in enumerate(plist):
        sc.add_geometry(p, node_name=f'{scene_name}-{i:03d}')
    pth = os.path.join(OUT_DIR, f'{scene_name}.glb')
    sc.export(pth)
    export_paths.append(pth)
lobby_path = export_paths[0]

# ---- collision mesh: same layout, coarse shapes, few tris ------------------
# Mesh colliders are tested per-frame by physics; the visual mesh's 12k tris
# stalled the engine to sub-1fps. This stays in the low hundreds.
M_COL = mat('collision', [1.0, 0.0, 1.0])
cparts = []

cparts.append(place(xz(extrude(ngon(PLAZA_R, n=12), FLOOR_T)), M_COL, (0, -FLOOR_T, 0)))
cparts.append(place(xz(extrude(box(-CORRIDOR_W / 2, -z1, CORRIDOR_W / 2, -(z0 - 2)), FLOOR_T)), M_COL, (0, -FLOOR_T, 0)))
for sx in (-1, 1):
    cparts.append(place(xz(extrude(box(sx * CORRIDOR_W / 2 - 0.2, -z1, sx * CORRIDOR_W / 2 + 0.2, -z0), WALL_H)), M_COL))


for bc in (135, 225):   # bench proxies
    bx, bz = wpolar(7.45, bc)
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

for path in export_paths + [coin_path, collision_path]:
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

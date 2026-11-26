# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Utilitats compartides PBR, geometria mecànica, animació i render per a Blender 5.3 CLI.
Genera parelles d'albedo sRGB + mapes normals tangents empaquetats dins el .glb i per a Cycles.
"""

import json
import math
import os

import bmesh
import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Euler, Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_DIR = os.path.join(ROOT, "assets", "blender", "out")
MODELS_DIR = os.path.join(ROOT, "assets", "models")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgb_srgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) / 255.0 for i in (0, 2, 4))


def hex_rgba(h, alpha=1.0):
    r, g, b = (srgb_to_linear(v) for v in hex_rgb_srgb(h))
    return (r, g, b, alpha)


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def _hash2(x, y):
    n = math.sin(x * 127.1 + y * 311.7) * 43758.5453123
    return n - math.floor(n)


def _vnoise_tile(u, v, px, py, seed=0.0):
    """Soroll de valor 2D suau i perfectament enrajolable (periode px × py)."""
    fu = (u * px) % px
    fv = (v * py) % py
    i0 = int(fu) % px
    j0 = int(fv) % py
    i1 = (i0 + 1) % px
    j1 = (j0 + 1) % py
    sx = fu - int(fu)
    sy = fv - int(fv)
    sx = sx * sx * (3.0 - 2.0 * sx)
    sy = sy * sy * (3.0 - 2.0 * sy)
    h00 = _hash2(i0 + seed, j0 + seed * 1.7)
    h10 = _hash2(i1 + seed, j0 + seed * 1.7)
    h01 = _hash2(i0 + seed, j1 + seed * 1.7)
    h11 = _hash2(i1 + seed, j1 + seed * 1.7)
    a = h00 + (h10 - h00) * sx
    b = h01 + (h11 - h01) * sx
    return a + (b - a) * sy


def _fbm_tile(u, v, px, py, octaves=3, seed=0.0):
    val = 0.0
    amp = 0.5
    norm = 0.0
    for k in range(octaves):
        mul = 1 << k
        val += amp * _vnoise_tile(u, v, px * mul, py * mul, seed + k * 19.3)
        norm += amp
        amp *= 0.5
    return val / norm


def _sample_height_and_color(kind, u, v, px, py):
    """Retorna (r, g, b, height) sense franges ni quadrícules artificials."""
    if kind in ("wood", "wood_dark"):
        warp = _fbm_tile(u, v, 3, 6, octaves=2, seed=1.3)
        fiber = _fbm_tile(u + 0.08 * warp, v, 4, 34, octaves=3, seed=4.7)
        ring = 0.5 + 0.5 * math.sin((u * 3.0 + warp * 1.8) * math.pi * 2.0)
        pore = (_vnoise_tile(u, v, 12, 96, seed=9.1) - 0.5) * 0.05
        tone = 0.65 * fiber + 0.35 * ring
        if kind == "wood":
            r = 0.39 + 0.16 * tone + pore
            g = 0.23 + 0.105 * tone + pore * 0.7
            b = 0.11 + 0.050 * tone + pore * 0.4
        else:
            r = 0.22 + 0.11 * tone + pore * 0.8
            g = 0.13 + 0.065 * tone + pore * 0.6
            b = 0.065 + 0.032 * tone + pore * 0.35
        return r, g, b, 0.45 + 0.35 * fiber + 0.12 * ring + pore

    if kind == "wood_floor":
        planks = 6.0
        p_idx = math.floor(u * planks)
        fu = (u * planks) % 1.0
        v_shift = (v + 0.37 * _hash2(p_idx, 3.0)) % 1.0
        fv = (v_shift * 2.0) % 1.0
        seam = min(fu, 1.0 - fu) < 0.012 or min(fv, 1.0 - fv) < 0.008
        p_var = (_hash2(p_idx, math.floor(v_shift * 2.0) + 5.0) - 0.5) * 0.065
        grain = _fbm_tile(u * 2.0, v_shift, 6, 36, octaves=3, seed=2.4 + p_idx)
        tone = 0.35 + 0.12 * grain + p_var
        sk = 0.68 if seam else 1.0
        return (tone * 1.14) * sk, (tone * 0.80) * sk, (tone * 0.48) * sk, (0.30 if seam else 0.52 + 0.28 * grain)

    if kind == "castiron":
        n1 = _fbm_tile(u, v, 24, 24, octaves=3, seed=7.2)
        n2 = _vnoise_tile(u, v, 72, 72, seed=11.4)
        patina = max(0.0, _fbm_tile(u, v, 8, 8, octaves=2, seed=3.1) - 0.62) * 0.28
        val = 0.15 + 0.08 * n1 + 0.04 * n2
        return val + patina * 0.38, val * 1.02 + patina * 0.16, val * 1.07, 0.42 + 0.38 * n1 + 0.16 * n2

    if kind == "brass":
        brush = 0.022 * (_vnoise_tile(u, v, 6, 72, seed=5.5) - 0.5)
        patina = max(0.0, _fbm_tile(u, v, 7, 7, octaves=2, seed=6.8) - 0.65) * 0.14
        r = 0.80 + brush - patina * 0.45
        g = 0.61 + brush * 0.7 - patina * 0.35
        b = 0.23 + brush * 0.3 + patina * 0.10
        return r, g, b, 0.54 + brush * 2.5

    if kind == "leather":
        n1 = _fbm_tile(u, v, 20, 20, octaves=3, seed=12.1)
        crease = (_vnoise_tile(u, v, 8, 32, seed=4.2) - 0.5) * 0.07
        r = 0.32 + 0.10 * n1 + crease
        g = 0.19 + 0.06 * n1 + crease * 0.6
        b = 0.10 + 0.035 * n1 + crease * 0.4
        return r, g, b, 0.46 + 0.36 * n1 + crease * 1.4

    if kind == "cotton_cloth":
        # Fibra de cotó cardat orgànica i tova, zero quadrícula
        wisp = _fbm_tile(u, v, 6, 36, octaves=3, seed=14.3)
        fluff = _fbm_tile(u, v, 18, 18, octaves=2, seed=8.9)
        tone = 0.55 * wisp + 0.45 * fluff
        r = 0.86 + 0.09 * tone
        g = 0.82 + 0.09 * tone
        b = 0.72 + 0.08 * tone
        return r, g, b, 0.40 + 0.44 * wisp + 0.16 * fluff

    if kind == "woven_cloth":
        # Teixit fi de cotó/lli per als telers sense quadres gegants
        micro_u = math.sin(u * math.pi * 2.0 * 48.0)
        micro_v = math.sin(v * math.pi * 2.0 * 48.0)
        weave = 0.5 + 0.5 * (micro_u * micro_v)
        slub = _fbm_tile(u, v, 10, 22, octaves=2, seed=15.7)
        tone = 0.84 + 0.045 * slub + 0.025 * weave
        return tone, tone * 0.955, tone * 0.845, 0.42 + 0.24 * weave + 0.22 * slub

    if kind == "twisted_yarn":
        # Ratlles helicoïdals suaus per visualitzar la torsió en girar sobre el seu eix
        helix = 0.5 + 0.5 * math.sin((u * 3.0 + v * 6.0) * math.pi * 2.0)
        fiber = _fbm_tile(u + v * 0.5, v, 12, 32, octaves=2, seed=21.2)
        val = 0.76 + 0.16 * helix + 0.06 * fiber
        return val, val * 0.91, val * 0.70, 0.35 + 0.50 * helix + 0.15 * fiber

    if kind == "workshop_plaster":
        mottle = _fbm_tile(u, v, 6, 6, octaves=3, seed=18.4)
        grit = (_vnoise_tile(u, v, 40, 40, seed=2.9) - 0.5) * 0.03
        r = 0.81 + 0.08 * mottle + grit
        g = 0.76 + 0.075 * mottle + grit
        b = 0.65 + 0.065 * mottle + grit
        return r, g, b, 0.48 + 0.28 * mottle + grit * 2.0

    if kind == "brick":
        rows, cols = 8.0, 4.0
        row = math.floor(v * rows)
        u_off = (u * cols + (0.5 if int(row) % 2 else 0.0)) % cols
        col = math.floor(u_off)
        fu = u_off - col
        fv = v * rows - row
        mortar = min(fu, 1.0 - fu) < 0.042 or min(fv, 1.0 - fv) < 0.062
        n1 = _fbm_tile(u, v, 20, 20, octaves=2, seed=31.0)
        bvar = (_hash2(col + row * 11.0, row * 17.0) - 0.5) * 0.14
        if mortar:
            val = 0.60 + (n1 - 0.5) * 0.08
            return val, val * 0.96, val * 0.88, 0.26 + n1 * 0.12
        r = 0.57 + bvar + (n1 - 0.5) * 0.08
        g = 0.25 + bvar * 0.5 + (n1 - 0.5) * 0.05
        b = 0.17 + bvar * 0.3 + (n1 - 0.5) * 0.04
        return r, g, b, 0.64 + n1 * 0.24

    if kind == "copper":
        brush = 0.025 * (_vnoise_tile(u, v, 6, 64, seed=6.3) - 0.5)
        hammer = 0.030 * _fbm_tile(u, v, 14, 14, octaves=2, seed=9.4)
        patina = max(0.0, _fbm_tile(u, v, 8, 8, octaves=2, seed=13.2) - 0.66) * 0.18
        r = 0.76 + brush + hammer * 0.5 - patina * 0.65
        g = 0.41 + brush * 0.6 + hammer * 0.3 + patina * 0.22
        b = 0.22 + brush * 0.4 + patina * 0.30
        return r, g, b, 0.52 + hammer * 2.4 + brush

    if kind == "painted_iron":
        n1 = _fbm_tile(u, v, 18, 18, octaves=2, seed=10.5)
        wear = max(0.0, _fbm_tile(u, v, 8, 8, octaves=2, seed=1.9) - 0.72) * 0.4
        r = 0.16 + 0.05 * n1 + wear * 0.18
        g = 0.26 + 0.06 * n1 + wear * 0.12
        b = 0.28 + 0.06 * n1 + wear * 0.08
        return r, g, b, 0.50 + 0.18 * n1

    if kind == "soil":
        n1 = _fbm_tile(u, v, 24, 24, octaves=3, seed=22.4)
        furrow = 0.5 + 0.5 * math.sin(v * math.pi * 2.0 * 5.0)
        r = 0.29 + 0.09 * furrow + (n1 - 0.5) * 0.08
        g = 0.20 + 0.06 * furrow + (n1 - 0.5) * 0.06
        b = 0.12 + 0.04 * furrow + (n1 - 0.5) * 0.04
        return r, g, b, 0.28 + 0.46 * furrow + 0.24 * n1

    if kind == "slate":
        n1 = _fbm_tile(u, v, 18, 18, octaves=3, seed=25.1)
        seam = 1.0 if (v * 5.0) % 1.0 > 0.032 else 0.74
        v0 = (0.27 + 0.08 * n1) * seam
        return v0 * 0.94, v0 * 0.98, v0 * 1.08, (0.54 + 0.26 * n1) * seam

    if kind == "flagstone":
        rows, cols = 3.0, 2.0
        row = math.floor(v * rows)
        u_off = (u * cols + (0.5 if int(row) % 2 else 0.0)) % cols
        col = math.floor(u_off)
        fu = u_off - col
        fv = v * rows - row
        is_seam = min(fu, 1.0 - fu) < 0.018 or min(fv, 1.0 - fv) < 0.024
        n1 = _fbm_tile(u, v, 14, 14, octaves=3, seed=27.3)
        block_var = (_hash2(col + row * 7.0, row * 13.0) - 0.5) * 0.07
        val = (n1 - 0.5) * 0.10 + block_var
        sk = 0.72 if is_seam else 1.0
        ht = (0.24 if is_seam else 0.62) + n1 * 0.24
        return (0.52 + val) * sk, (0.50 + val) * sk, (0.46 + val) * sk, ht

    # stone (pedra natural treballada, juntes discretes)
    rows, cols = 3.0, 3.0
    row = math.floor(v * rows)
    u_off = (u * cols + (0.5 if int(row) % 2 else 0.0)) % cols
    col = math.floor(u_off)
    fu = u_off - col
    fv = v * rows - row
    is_seam = min(fu, 1.0 - fu) < 0.020 or min(fv, 1.0 - fv) < 0.025
    n1 = _fbm_tile(u, v, 16, 16, octaves=3, seed=19.8)
    block_var = (_hash2(col + row * 7.0, row * 13.0) - 0.5) * 0.07
    val = (n1 - 0.5) * 0.09 + block_var
    seam_k = 0.80 if is_seam else 1.0
    ht = (0.28 if is_seam else 0.64) + n1 * 0.22
    return (0.66 + val) * seam_k, (0.61 + val) * seam_k, (0.52 + val) * seam_k, ht


def build_pbr_pair(name, kind, width=512, height=512, bump_scale=2.4):
    """Genera parella (albedo_sRGB, tangent_normal) empaquetada a >=512px per a Cycles i glTF."""
    width = max(int(width), 512)
    height = max(int(height), 512)
    alb = bpy.data.images.new(f"{name}_Alb", width=width, height=height, alpha=False)
    nrm = bpy.data.images.new(f"{name}_Nrm", width=width, height=height, alpha=False)
    nrm.colorspace_settings.name = "Non-Color"

    alb_buf = [0.0] * (width * height * 4)
    hts = [0.0] * (width * height)

    inv_w = 1.0 / width
    inv_h = 1.0 / height
    sample_fn = _sample_height_and_color
    for py in range(height):
        v = py * inv_h
        row_off = py * width
        for px in range(width):
            u = px * inv_w
            r, g, b, h = sample_fn(kind, u, v, px, py)
            pidx = row_off + px
            idx = pidx * 4
            alb_buf[idx] = 0.0 if r < 0.0 else 1.0 if r > 1.0 else r
            alb_buf[idx + 1] = 0.0 if g < 0.0 else 1.0 if g > 1.0 else g
            alb_buf[idx + 2] = 0.0 if b < 0.0 else 1.0 if b > 1.0 else b
            alb_buf[idx + 3] = 1.0
            hts[pidx] = h

    nrm_buf = [0.0] * (width * height * 4)
    sqrt = math.sqrt
    for py in range(height):
        row0 = ((py - 1) % height) * width
        row_c = py * width
        row1 = ((py + 1) % height) * width
        for px in range(width):
            px0 = (px - 1) % width
            px1 = (px + 1) % width
            dx = (hts[row_c + px1] - hts[row_c + px0]) * bump_scale
            dy = (hts[row1 + px] - hts[row0 + px]) * bump_scale
            nx, ny = -dx, -dy
            inv = 1.0 / sqrt(nx * nx + ny * ny + 1.0)
            idx = (row_c + px) * 4
            nrm_buf[idx] = 0.5 + 0.5 * (nx * inv)
            nrm_buf[idx + 1] = 0.5 + 0.5 * (ny * inv)
            nrm_buf[idx + 2] = 0.5 + 0.5 * inv
            nrm_buf[idx + 3] = 1.0

    alb.pixels.foreach_set(alb_buf)
    alb.pack()
    nrm.pixels.foreach_set(nrm_buf)
    nrm.pack()
    return alb, nrm


def make_mat(
    name,
    color_hex,
    metallic=0.0,
    roughness=0.5,
    alpha=1.0,
    emission_hex=None,
    emission_strength=0.0,
    pbr_pair=None,
    tex_scale=(1.0, 1.0),
    normal_strength=0.80,
):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = hex_rgba(color_hex, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        mat.blend_method = "BLEND" if hasattr(mat, "blend_method") else "HASHED"
    if emission_hex:
        bsdf.inputs["Emission Color"].default_value = hex_rgba(emission_hex, 1.0)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    if pbr_pair is not None:
        alb_img, nrm_img = pbr_pair
        tc = nt.nodes.new("ShaderNodeTexCoord")
        mapping = nt.nodes.new("ShaderNodeMapping")
        mapping.inputs["Scale"].default_value = (tex_scale[0], tex_scale[1], 1.0)
        nt.links.new(tc.outputs["UV"], mapping.inputs["Vector"])

        tex_alb = nt.nodes.new("ShaderNodeTexImage")
        tex_alb.image = alb_img
        nt.links.new(mapping.outputs["Vector"], tex_alb.inputs["Vector"])
        nt.links.new(tex_alb.outputs["Color"], bsdf.inputs["Base Color"])

        if normal_strength > 0:
            tex_nrm = nt.nodes.new("ShaderNodeTexImage")
            tex_nrm.image = nrm_img
            nrm_node = nt.nodes.new("ShaderNodeNormalMap")
            nrm_node.space = "TANGENT"
            nrm_node.inputs["Strength"].default_value = normal_strength
            nt.links.new(mapping.outputs["Vector"], tex_nrm.inputs["Vector"])
            nt.links.new(tex_nrm.outputs["Color"], nrm_node.inputs["Color"])
            nt.links.new(nrm_node.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


def link_obj(obj, collection=None):
    col = collection or bpy.context.scene.collection
    col.objects.link(obj)
    return obj


def add_empty(name, loc=(0, 0, 0), parent=None):
    emp = bpy.data.objects.new(name, None)
    emp.location = loc
    link_obj(emp)
    if parent:
        emp.parent = parent
    return emp


def set_smooth(obj):
    if obj.type == "MESH" and obj.data:
        for p in obj.data.polygons:
            p.use_smooth = True


def set_flat(obj):
    if obj.type == "MESH" and obj.data:
        for p in obj.data.polygons:
            p.use_smooth = False


def apply_box_uv(obj, uv_scale=0.65):
    mesh = obj.data
    if not mesh.uv_layers:
        mesh.uv_layers.new(name="UVMap")
    uv_layer = mesh.uv_layers.active.data
    sx, sy, sz = obj.scale
    for poly in mesh.polygons:
        n = poly.normal
        nx, ny, nz = abs(n.x), abs(n.y), abs(n.z)
        for li in poly.loop_indices:
            v = mesh.vertices[mesh.loops[li].vertex_index].co
            wx, wy, wz = v.x * sx, v.y * sy, v.z * sz
            if nz >= nx and nz >= ny:
                u, vv = wx, wy
            elif nx >= ny and nx >= nz:
                u, vv = wy, wz
            else:
                u, vv = wx, wz
            uv_layer[li].uv = (u * uv_scale, vv * uv_scale)


def apply_cyl_uv(obj, uv_scale=0.65, u_turns=1.0):
    """UV cilíndric sense costures planes ni distorsions (u=angle, v=z)."""
    mesh = obj.data
    if not mesh.uv_layers:
        mesh.uv_layers.new(name="UVMap")
    uv_layer = mesh.uv_layers.active.data
    sx, sy, sz = obj.scale
    inv_tau = 1.0 / (2.0 * math.pi)
    for poly in mesh.polygons:
        n = poly.normal
        is_cap = abs(n.z) > 0.85
        for li in poly.loop_indices:
            v = mesh.vertices[mesh.loops[li].vertex_index].co
            wx, wy, wz = v.x * sx, v.y * sy, v.z * sz
            if is_cap:
                uv_layer[li].uv = (wx * uv_scale + 0.5, wy * uv_scale + 0.5)
            else:
                ang = math.atan2(wy, wx) * inv_tau + 0.5
                uv_layer[li].uv = (ang * u_turns, (wz + 0.5) * uv_scale)


def add_bevel(obj, width=0.008, segments=2):
    mod = obj.modifiers.new(name="Bevel", type="BEVEL")
    mod.width = width
    mod.segments = segments


def make_box(name, size, loc, mat, rot=(0, 0, 0), parent=None, bevel=0.006, uv_scale=0.65):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(scale=True)
    apply_box_uv(obj, uv_scale=uv_scale)
    obj.data.materials.append(mat)
    if bevel > 0:
        add_bevel(obj, width=bevel)
    if parent:
        obj.parent = parent
    return obj


def make_cyl(name, radius, depth, loc, mat, rot=(0, 0, 0), verts=28, parent=None, bevel=0.003, uv_scale=0.65):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    apply_cyl_uv(obj, uv_scale=uv_scale)
    obj.data.materials.append(mat)
    set_smooth(obj)
    if bevel > 0:
        add_bevel(obj, width=bevel, segments=2)
    if parent:
        obj.parent = parent
    return obj


def make_cone(name, radius1, radius2, depth, loc, mat, rot=(0, 0, 0), verts=24, parent=None, bevel=0.002):
    bpy.ops.mesh.primitive_cone_add(
        vertices=verts, radius1=radius1, radius2=radius2, depth=depth, location=loc, rotation=rot
    )
    obj = bpy.context.active_object
    obj.name = name
    apply_cyl_uv(obj, uv_scale=0.85)
    obj.data.materials.append(mat)
    set_smooth(obj)
    if bevel > 0:
        add_bevel(obj, width=bevel, segments=2)
    if parent:
        obj.parent = parent
    return obj


def make_sphere(name, radius, loc, mat, segs=20, rings=12, parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, radius=radius, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    apply_box_uv(obj, uv_scale=0.65)
    obj.data.materials.append(mat)
    set_smooth(obj)
    if parent:
        obj.parent = parent
    return obj


def make_rod_between(name, p0, p1, radius, mat, verts=12, parent=None):
    """Crea un cilindre alineat exactament entre p0 i p1."""
    va, vb = Vector(p0), Vector(p1)
    d = vb - va
    length = max(1e-4, d.length)
    rot = d.normalized().to_track_quat("Z", "Y").to_euler()
    return make_cyl(name, radius, length, (va + vb) * 0.5, mat, rot=rot, verts=verts, parent=parent, bevel=0.0)


def make_spoked_wheel(name, radius, width, spokes, loc, mat_rim, mat_hub=None, axis="Y", parent=None):
    """Roda de raigs amb llanda, boixa i raigs orientables (eix X, Y o Z)."""
    root = add_empty(name, loc, parent=parent)
    rot_axis = (math.pi / 2, 0.0, 0.0) if axis == "Y" else (0.0, math.pi / 2, 0.0) if axis == "X" else (0.0, 0.0, 0.0)
    # Llanda buida feta amb torus o anell extruït
    n_seg = 40
    r_out = radius
    r_in = radius - width * 0.9
    half_w = width * 0.5
    mesh = bpy.data.meshes.new(name + "_RimMesh")
    rim_obj = bpy.data.objects.new(name + "_Rim", mesh)
    link_obj(rim_obj)
    rim_obj.parent = root
    rim_obj.data.materials.append(mat_rim)

    bm = bmesh.new()
    v_top_out, v_top_in, v_bot_out, v_bot_in = [], [], [], []
    for i in range(n_seg):
        a = 2.0 * math.pi * i / n_seg
        ca, sa = math.cos(a), math.sin(a)
        v_top_out.append(bm.verts.new((r_out * ca, r_out * sa, half_w)))
        v_top_in.append(bm.verts.new((r_in * ca, r_in * sa, half_w)))
        v_bot_out.append(bm.verts.new((r_out * ca, r_out * sa, -half_w)))
        v_bot_in.append(bm.verts.new((r_in * ca, r_in * sa, -half_w)))
    for i in range(n_seg):
        j = (i + 1) % n_seg
        bm.faces.new((v_top_out[i], v_top_out[j], v_top_in[j], v_top_in[i]))
        bm.faces.new((v_bot_in[i], v_bot_in[j], v_bot_out[j], v_bot_out[i]))
        bm.faces.new((v_top_out[j], v_top_out[i], v_bot_out[i], v_bot_out[j]))
        bm.faces.new((v_top_in[i], v_top_in[j], v_bot_in[j], v_bot_in[i]))
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    rim_obj.rotation_euler = rot_axis
    apply_box_uv(rim_obj, uv_scale=0.8)
    set_smooth(rim_obj)

    hub_mat = mat_hub or mat_rim
    make_cyl(f"{name}_Boixa", radius * 0.19, width * 1.45, (0, 0, 0), hub_mat, rot=rot_axis, verts=20, parent=root)

    spoke_len = r_in - radius * 0.14
    for s in range(spokes):
        a = 2.0 * math.pi * s / spokes
        # Raig en el pla local del disc abans de rotar a axis
        r_mid = radius * 0.14 + spoke_len * 0.5
        if axis == "Y":
            p_loc = (r_mid * math.cos(a), 0.0, r_mid * math.sin(a))
            s_rot = (0.0, math.pi / 2 - a, 0.0)
        elif axis == "X":
            p_loc = (0.0, r_mid * math.cos(a), r_mid * math.sin(a))
            s_rot = (a - math.pi / 2, 0.0, 0.0)
        else:
            p_loc = (r_mid * math.cos(a), r_mid * math.sin(a), 0.0)
            s_rot = (math.pi / 2, 0.0, a - math.pi / 2)
        make_cyl(
            f"{name}_Raig_{s}",
            max(0.008, radius * 0.042),
            spoke_len,
            p_loc,
            mat_rim,
            rot=s_rot,
            verts=10,
            parent=root,
            bevel=0.0,
        )
    return root


def make_gear(name, radius, thickness, teeth, loc, mat, mat_hub=None, axis="X", parent=None):
    """Engranatge dentat extruït autèntic en 3D."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    obj.location = loc
    obj.rotation_euler = (
        (0.0, math.pi / 2, 0.0) if axis == "X" else (math.pi / 2, 0.0, 0.0) if axis == "Y" else (0.0, 0.0, 0.0)
    )
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent

    bm = bmesh.new()
    addendum = max(0.007, radius * 0.11)
    r_root = radius - addendum * 0.65
    r_tip = radius + addendum * 0.65
    hz = thickness * 0.5
    pts = []
    n_step = teeth * 4
    for i in range(n_step):
        a = 2.0 * math.pi * i / n_step
        phase = i % 4
        r = r_root if phase in (0, 3) else r_tip
        pts.append((r * math.cos(a), r * math.sin(a)))

    top_v = [bm.verts.new((x, y, hz)) for x, y in pts]
    bot_v = [bm.verts.new((x, y, -hz)) for x, y in pts]
    bm.faces.new(top_v)
    bm.faces.new(list(reversed(bot_v)))
    for i in range(n_step):
        j = (i + 1) % n_step
        bm.faces.new((top_v[i], top_v[j], bot_v[j], bot_v[i]))
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=0.9)
    if mat_hub:
        make_cyl(f"{name}_Nucli", radius * 0.34, thickness * 1.35, (0, 0, 0), mat_hub, verts=16, parent=obj, bevel=0.002)
    return obj


def make_cam(name, r_base, r_lift, thickness, loc, mat, axis="X", rot_phase=0.0, parent=None):
    """Lleva excèntrica en forma de pera per a moviment alternatiu."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    obj.location = loc
    obj.rotation_euler = (
        (0.0, math.pi / 2, rot_phase)
        if axis == "X"
        else (math.pi / 2, rot_phase, 0.0)
        if axis == "Y"
        else (0.0, 0.0, rot_phase)
    )
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent

    bm = bmesh.new()
    n_seg = 36
    hz = thickness * 0.5
    top_v, bot_v = [], []
    for i in range(n_seg):
        a = 2.0 * math.pi * i / n_seg
        lobe = max(0.0, math.cos(a)) ** 2
        r = r_base + r_lift * lobe
        x, y = r * math.cos(a), r * math.sin(a)
        top_v.append(bm.verts.new((x, y, hz)))
        bot_v.append(bm.verts.new((x, y, -hz)))
    bm.faces.new(top_v)
    bm.faces.new(list(reversed(bot_v)))
    for i in range(n_seg):
        j = (i + 1) % n_seg
        bm.faces.new((top_v[i], top_v[j], bot_v[j], bot_v[i]))
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=0.9)
    set_smooth(obj)
    return obj


def make_shuttle(name, loc, mat_wood, mat_tip, mat_yarn, scale=1.0, parent=None):
    """Barqueta llançadora històrica amb puntes metàl·liques i canilla de trama vermella."""
    root = add_empty(name, loc, parent=parent)
    body = make_box(f"{name}_Cos", (0.24 * scale, 0.056 * scale, 0.044 * scale), (0, 0, 0), mat_wood, parent=root, bevel=0.008)
    _ = body
    make_cone(
        f"{name}_PuntaEsq",
        0.025 * scale,
        0.003 * scale,
        0.075 * scale,
        (-0.145 * scale, 0, 0),
        mat_tip,
        rot=(0, -math.pi / 2, 0),
        parent=root,
        bevel=0.0,
    )
    make_cone(
        f"{name}_PuntaDreta",
        0.025 * scale,
        0.003 * scale,
        0.075 * scale,
        (0.145 * scale, 0, 0),
        mat_tip,
        rot=(0, math.pi / 2, 0),
        parent=root,
        bevel=0.0,
    )
    # Canilla interior de fil de trama vermell
    make_cyl(
        f"{name}_Canilla",
        0.017 * scale,
        0.13 * scale,
        (0.0, 0.0, 0.012 * scale),
        mat_yarn,
        rot=(0.0, math.pi / 2, 0.0),
        verts=16,
        parent=root,
        bevel=0.004,
    )
    return root


def make_cutaway_cyl(
    name,
    r_in,
    r_out,
    height,
    loc,
    mat,
    start_ang=math.pi * 0.35,
    end_ang=math.pi * 2.15,
    segs=36,
    rot=(0, 0, 0),
    parent=None,
    capped=True,
):
    """Cilindre gruixut seccionat angularment per mostrar l'interior (calderes, cilindres, forns)."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    obj.location = loc
    obj.rotation_euler = rot
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent

    bm = bmesh.new()
    hz = height * 0.5
    ang_span = end_ang - start_ang
    n = max(6, segs)
    bot_in, bot_out, top_in, top_out = [], [], [], []
    for i in range(n + 1):
        a = start_ang + ang_span * (i / n)
        ca, sa = math.cos(a), math.sin(a)
        bot_in.append(bm.verts.new((r_in * ca, r_in * sa, -hz)))
        bot_out.append(bm.verts.new((r_out * ca, r_out * sa, -hz)))
        top_in.append(bm.verts.new((r_in * ca, r_in * sa, hz)))
        top_out.append(bm.verts.new((r_out * ca, r_out * sa, hz)))

    for i in range(n):
        j = i + 1
        bm.faces.new((bot_out[i], bot_out[j], top_out[j], top_out[i]))
        bm.faces.new((top_in[i], top_in[j], bot_in[j], bot_in[i]))
        bm.faces.new((top_out[i], top_out[j], top_in[j], top_in[i]))
        bm.faces.new((bot_in[i], bot_in[j], bot_out[j], bot_out[i]))

    if capped and abs(ang_span - 2.0 * math.pi) > 1e-3:
        bm.faces.new((bot_in[0], bot_out[0], top_out[0], top_in[0]))
        bm.faces.new((top_in[-1], top_out[-1], bot_out[-1], bot_in[-1]))

    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=0.65)
    set_smooth(obj)
    return obj


def make_curve_tube(name, points, radius, mat, bevel_res=6, closed=False, parent=None):
    """Tub continu al llarg d'una llista de punts 3D."""
    curve_data = bpy.data.curves.new(name=name + "_Curve", type="CURVE")
    curve_data.dimensions = "3D"
    curve_data.bevel_depth = radius
    curve_data.bevel_resolution = bevel_res
    spline = curve_data.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for i, pt in enumerate(points):
        spline.points[i].co = (pt[0], pt[1], pt[2], 1.0)
    spline.use_cyclic_u = closed
    obj = bpy.data.objects.new(name, curve_data)
    link_obj(obj)
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    return obj


def make_torus(name, major_r, minor_r, loc, mat, rot=(0, 0, 0), major_segs=32, minor_segs=14, parent=None):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_r,
        minor_radius=minor_r,
        major_segments=major_segs,
        minor_segments=minor_segs,
        location=loc,
        rotation=rot,
    )
    obj = bpy.context.active_object
    obj.name = name
    apply_box_uv(obj, uv_scale=0.8)
    obj.data.materials.append(mat)
    set_smooth(obj)
    if parent:
        obj.parent = parent
    return obj


def make_coal_pile(name, center, rx, ry, height, mat, count=48, seed=7, parent=None):
    """Munt de carbó mineral facetat i irregular en una sola malla (sense boles llises)."""
    import random

    rng = random.Random(seed)
    bm = bmesh.new()
    # Base en forma de muntanya baixa
    rings, segs = 4, 14
    cx, cy, cz = center
    verts_ring = []
    center_top = bm.verts.new((cx, cy, cz + height * 0.72))
    for r_i in range(1, rings + 1):
        frac = r_i / rings
        ring_v = []
        for s_i in range(segs):
            a = 2.0 * math.pi * s_i / segs
            jit = 0.86 + 0.24 * rng.random()
            vx = cx + rx * frac * jit * math.cos(a)
            vy = cy + ry * frac * jit * math.sin(a)
            vz = cz + height * 0.68 * (1.0 - frac ** 1.35) * (0.85 + 0.30 * rng.random())
            ring_v.append(bm.verts.new((vx, vy, vz)))
        verts_ring.append(ring_v)
    for s_i in range(segs):
        bm.faces.new((center_top, verts_ring[0][s_i], verts_ring[0][(s_i + 1) % segs]))
    for r_i in range(rings - 1):
        for s_i in range(segs):
            s_j = (s_i + 1) % segs
            bm.faces.new((verts_ring[r_i][s_i], verts_ring[r_i + 1][s_i], verts_ring[r_i + 1][s_j], verts_ring[r_i][s_j]))

    # Trossos angulars de carbó encavalcats
    lump_r = max(0.022, min(rx, ry) * 0.19)
    for idx in range(count):
        rad_f = (rng.random() ** 0.65) * 0.88
        ang = rng.uniform(0.0, 2.0 * math.pi)
        lx = cx + rx * rad_f * math.cos(ang)
        ly = cy + ry * rad_f * math.sin(ang)
        lz = cz + height * 0.66 * (1.0 - rad_f ** 1.3) + lump_r * 0.25
        sc = (rng.uniform(0.65, 1.35), rng.uniform(0.60, 1.28), rng.uniform(0.45, 0.95))
        ret = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=lump_r)
        verts_l = ret["verts"]
        rot_m = Euler((rng.uniform(0, 3.14), rng.uniform(0, 3.14), rng.uniform(0, 3.14))).to_matrix().to_4x4()
        for v in verts_l:
            v.co.x *= sc[0] * rng.uniform(0.82, 1.18)
            v.co.y *= sc[1] * rng.uniform(0.82, 1.18)
            v.co.z *= sc[2] * rng.uniform(0.82, 1.18)
            v.co = rot_m @ v.co
            v.co += Vector((lx, ly, lz))

    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=1.2)
    set_flat(obj)
    return obj


def make_grain_pile(name, center, rx, ry, height, mat, count=110, seed=13, parent=None):
    """Munt de gra de blat o ordi amb llavors el·lipsoïdals visibles damunt d'un llit ondulat."""
    import random

    rng = random.Random(seed)
    bm = bmesh.new()
    cx, cy, cz = center
    segs = 18
    top_v = bm.verts.new((cx, cy, cz + height))
    mid_ring = []
    bot_ring = []
    for i in range(segs):
        a = 2.0 * math.pi * i / segs
        w = 0.94 + 0.10 * math.sin(3 * a)
        mid_ring.append(bm.verts.new((cx + rx * 0.56 * w * math.cos(a), cy + ry * 0.56 * w * math.sin(a), cz + height * 0.62)))
        bot_ring.append(bm.verts.new((cx + rx * 0.98 * w * math.cos(a), cy + ry * 0.98 * w * math.sin(a), cz)))
    for i in range(segs):
        j = (i + 1) % segs
        bm.faces.new((top_v, mid_ring[i], mid_ring[j]))
        bm.faces.new((mid_ring[i], bot_ring[i], bot_ring[j], mid_ring[j]))

    grain_r = max(0.008, min(rx, ry) * 0.045)
    for _ in range(count):
        rf = (rng.random() ** 0.55) * 0.92
        a = rng.uniform(0.0, 2.0 * math.pi)
        gx = cx + rx * rf * math.cos(a)
        gy = cy + ry * rf * math.sin(a)
        gz = cz + height * max(0.04, 1.0 - rf * 0.95)
        ret = bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=5, radius=grain_r)
        rot_m = Euler((rng.uniform(-0.4, 0.4), rng.uniform(-0.4, 0.4), rng.uniform(0, 3.14))).to_matrix().to_4x4()
        for v in ret["verts"]:
            v.co.x *= 1.85
            v.co.y *= 0.72
            v.co.z *= 0.62
            v.co = (rot_m @ v.co) + Vector((gx, gy, gz))

    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=2.2)
    set_smooth(obj)
    return obj


def make_smoke_plume(name, base_loc, height, drift_x, drift_y, r_base, mat, wisps=16, seed=19, parent=None, flare=0.0):
    """Plomall orgànic de fum o flama turbulent (flocs allargats en espiral, mai boles gegants)."""
    import random

    rng = random.Random(seed)
    bm = bmesh.new()
    bx, by, bz = base_loc
    for i in range(wisps):
        t = i / max(1, wisps - 1)
        curve_t = t ** 1.15
        wx = bx + drift_x * curve_t + math.sin(t * 7.2 + seed) * r_base * (0.28 + 0.55 * t)
        wy = by + drift_y * curve_t + math.cos(t * 6.4 + seed) * r_base * (0.22 + 0.45 * t)
        wz = bz + height * t
        if flare > 0.0:
            rad = r_base * (1.0 - 0.55 * t) * rng.uniform(0.75, 1.25)
        else:
            rad = r_base * (0.58 + 1.15 * (t ** 0.75)) * rng.uniform(0.72, 1.18)
        ret = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=rad)
        rot_m = Euler((rng.uniform(0, 3.14), rng.uniform(0, 3.14), rng.uniform(0, 3.14))).to_matrix().to_4x4()
        sx, sy, sz = rng.uniform(0.68, 1.35), rng.uniform(0.65, 1.25), rng.uniform(0.85, 1.65)
        for v in ret["verts"]:
            n = 1.0 + 0.22 * math.sin(v.co.x * 9.0 + i) * math.cos(v.co.y * 9.0 - i)
            v.co.x *= sx * n
            v.co.y *= sy * n
            v.co.z *= sz * n
            v.co = (rot_m @ v.co) + Vector((wx, wy, wz))

    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=0.6)
    set_smooth(obj)
    return obj


def make_rivet_ring(name, center, radius, count, rivet_r=0.008, axis="Z", mat=None, parent=None):
    """Anell o filera de reblons en una sola malla lleugera per a calderes i convertidors."""
    bm = bmesh.new()
    cx, cy, cz = center
    for i in range(count):
        a = 2.0 * math.pi * i / count
        ca, sa = math.cos(a), math.sin(a)
        if axis == "Z":
            pos = Vector((cx + radius * ca, cy + radius * sa, cz))
            norm = Vector((ca, sa, 0.0))
        elif axis == "X":
            pos = Vector((cx, cy + radius * ca, cz + radius * sa))
            norm = Vector((0.0, ca, sa))
        else:
            pos = Vector((cx + radius * ca, cy, cz + radius * sa))
            norm = Vector((ca, 0.0, sa))
        ret = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=rivet_r)
        rot_m = norm.to_track_quat("Z", "X").to_matrix().to_4x4()
        for v in ret["verts"]:
            v.co.z *= 0.62
            v.co = (rot_m @ v.co) + pos

    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    if mat:
        obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    set_smooth(obj)
    return obj


def make_helical_blade(
    name,
    r_hub,
    r_tip,
    pitch_in_deg,
    pitch_out_deg,
    arc_deg,
    thickness,
    mat,
    segs_r=8,
    segs_u=10,
    loc=(0, 0, 0),
    rot=(0, 0, 0),
    parent=None,
):
    """Pala d'hèlix marina helicoïdal real amb torsió radial variable i perfil hidrodinàmic."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    obj.location = loc
    obj.rotation_euler = rot
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent

    bm = bmesh.new()
    top_grid, bot_grid = [], []
    arc_rad = math.radians(arc_deg)
    for ir in range(segs_r + 1):
        fr = ir / segs_r
        r = r_hub + (r_tip - r_hub) * fr
        pitch = math.radians(pitch_in_deg + (pitch_out_deg - pitch_in_deg) * fr)
        chord_ang = arc_rad * (0.48 + 0.52 * math.sin(math.pi * (0.18 + 0.72 * fr)))
        half_t = thickness * (1.0 - 0.58 * fr)
        row_t, row_b = [], []
        for iu in range(segs_u + 1):
            fu = (iu / segs_u) - 0.5
            theta = fu * chord_ang
            profile = math.cos(fu * math.pi * 0.92)
            ax = r * math.tan(theta) * math.cos(pitch)
            x_loc = ax * 0.35
            y_loc = r * math.sin(theta)
            z_loc = r * math.cos(theta)
            # Desplaçament helicoïdal al llarg de l'eix X (eix del vaixell)
            helix_x = r * theta * math.sin(pitch)
            x_center = helix_x
            dt = half_t * max(0.18, profile)
            row_t.append(bm.verts.new((x_center + dt, y_loc, z_loc)))
            row_b.append(bm.verts.new((x_center - dt, y_loc, z_loc)))
        top_grid.append(row_t)
        bot_grid.append(row_b)

    for ir in range(segs_r):
        for iu in range(segs_u):
            bm.faces.new((top_grid[ir][iu], top_grid[ir + 1][iu], top_grid[ir + 1][iu + 1], top_grid[ir][iu + 1]))
            bm.faces.new((bot_grid[ir][iu], bot_grid[ir][iu + 1], bot_grid[ir + 1][iu + 1], bot_grid[ir + 1][iu]))
    for ir in range(segs_r):
        bm.faces.new((top_grid[ir][0], bot_grid[ir][0], bot_grid[ir + 1][0], top_grid[ir + 1][0]))
        bm.faces.new((top_grid[ir][-1], top_grid[ir + 1][-1], bot_grid[ir + 1][-1], bot_grid[ir][-1]))
    for iu in range(segs_u):
        bm.faces.new((top_grid[-1][iu], bot_grid[-1][iu], bot_grid[-1][iu + 1], top_grid[-1][iu + 1]))
        bm.faces.new((top_grid[0][iu], top_grid[0][iu + 1], bot_grid[0][iu + 1], bot_grid[0][iu]))

    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=1.2)
    set_smooth(obj)
    return obj


def make_furrow_bed(
    name,
    center,
    size_x,
    size_y,
    base_z,
    mat_soil,
    furrows=6,
    amp=0.048,
    unploughed_x=None,
    nx=56,
    ny=42,
    seed=23,
    parent=None,
):
    """Llit de terra llaurada en relleu real amb solcs ondulats i gleves irregulars."""
    cx, cy = center
    bm = bmesh.new()
    grid = []
    bot_grid = []
    for ix in range(nx + 1):
        fx = ix / nx
        x = cx + (fx - 0.5) * size_x
        row_t, row_b = [], []
        for iy in range(ny + 1):
            fy = iy / ny
            y = cy + (fy - 0.5) * size_y
            ridge = abs(math.sin(fy * furrows * math.pi)) ** 1.35 * amp
            ripple = 0.010 * math.sin(x * 11.0 + y * 5.0 + seed) * math.cos(x * 6.5 - y * 8.0)
            if unploughed_x is not None and x > unploughed_x:
                blend = max(0.0, min(1.0, (x - unploughed_x) / 0.14))
                ridge *= 1.0 - blend * 0.78
                ripple *= 0.45
            z = base_z + ridge + ripple
            row_t.append(bm.verts.new((x, y, z)))
            row_b.append(bm.verts.new((x, y, base_z - 0.06)))
        grid.append(row_t)
        bot_grid.append(row_b)

    for ix in range(nx):
        for iy in range(ny):
            bm.faces.new((grid[ix][iy], grid[ix + 1][iy], grid[ix + 1][iy + 1], grid[ix][iy + 1]))
            bm.faces.new((bot_grid[ix][iy], bot_grid[ix][iy + 1], bot_grid[ix + 1][iy + 1], bot_grid[ix + 1][iy]))
    for ix in range(nx):
        bm.faces.new((grid[ix][0], bot_grid[ix][0], bot_grid[ix + 1][0], grid[ix + 1][0]))
        bm.faces.new((grid[ix][-1], grid[ix + 1][-1], bot_grid[ix + 1][-1], bot_grid[ix][-1]))
    for iy in range(ny):
        bm.faces.new((grid[0][iy], grid[0][iy + 1], bot_grid[0][iy + 1], bot_grid[0][iy]))
        bm.faces.new((grid[-1][iy], bot_grid[-1][iy], bot_grid[-1][iy + 1], grid[-1][iy + 1]))

    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    obj.data.materials.append(mat_soil)
    if parent:
        obj.parent = parent
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=0.55)
    set_smooth(obj)
    return obj


def make_twisted_strand(name, mat, radius=0.0035, verts=10, parent=None):
    """Bri articulat orientable + giratori (per mostrar estirament, aprimament i torsió real)."""
    aim_emp = add_empty(name, (0.0, 0.0, 0.0), parent=parent)
    aim_emp.rotation_mode = "QUATERNION"
    spin_emp = add_empty(f"{name}_Spin", (0.0, 0.0, 0.0), parent=aim_emp)
    mesh_obj = make_cyl(
        f"{name}_Mesh",
        radius,
        1.0,
        (0.0, 0.0, 0.5),
        mat,
        verts=verts,
        parent=spin_emp,
        bevel=0.0,
        uv_scale=1.8,
    )
    _ = mesh_obj
    return (aim_emp, spin_emp)


def aim_and_twist_strand(strand_pair, p0, p1, radius_scale=1.0, twist_angle=0.0):
    """Orienta el fil entre p0 i p1, n'ajusta el gruix (radius_scale) i el fa girar per mostrar torsió."""
    aim_emp, spin_emp = strand_pair
    va, vb = Vector(p0), Vector(p1)
    d = vb - va
    dist = max(1e-4, d.length)
    aim_emp.location = p0
    aim_emp.rotation_mode = "QUATERNION"
    aim_emp.rotation_quaternion = d.to_track_quat("Z", "Y")
    spin_emp.rotation_euler = (0.0, 0.0, twist_angle)
    spin_emp.scale = (radius_scale, radius_scale, dist)


def make_worker(name, loc, facing_yaw=0.0, scale=1.0, role="spinner", parent=None):
    """Figura humana històrica proporcionada (s. XVIII–XIX) amb articulacions animables per glTF/Cycles."""
    root = add_empty(name, loc, parent=parent)
    root.rotation_euler = (0.0, 0.0, facing_yaw)
    root.scale = (scale, scale, scale)

    m_skin = make_mat(f"{name}_Pell", "#dfb692", roughness=0.76)
    m_shirt = make_mat(f"{name}_Camisa", "#ebe3cf", roughness=0.86)
    m_vest = make_mat(f"{name}_Armilla", "#6e422b" if role != "weaver" else "#3e5245", roughness=0.82)
    m_pants = make_mat(f"{name}_Calces", "#3a434e" if role != "piecer" else "#4b3e33", roughness=0.84)
    m_apron = make_mat(f"{name}_Davantal", "#cbb998", roughness=0.88)
    m_shoe = make_mat(f"{name}_Sabata", "#2b1d14", roughness=0.68)
    m_hair = make_mat(f"{name}_Cabell", "#4b3423", roughness=0.82)
    m_cap = make_mat(f"{name}_Gorra", "#2f2925" if role != "piecer" else "#ede4d0", roughness=0.84)

    # Cames separades lleugerament per estabilitat realista (peus a Z = 0)
    pelvis = add_empty(f"{name}_Pelvis", (0.0, 0.0, 0.88), parent=root)
    make_box(f"{name}_Malucs", (0.29, 0.17, 0.14), (0.0, 0.0, 0.02), m_pants, parent=pelvis, bevel=0.03)
    make_box(f"{name}_DavantalInf", (0.26, 0.04, 0.34), (0.0, 0.095, -0.11), m_apron, parent=pelvis, bevel=0.012)

    legs = {}
    for side, sx in (("l", -0.095), ("r", 0.095)):
        hip = add_empty(f"{name}_Hip_{side}", (sx, 0.0, -0.03), parent=pelvis)
        make_cyl(f"{name}_Cuixa_{side}", 0.068, 0.41, (0.0, 0.0, -0.205), m_pants, verts=14, parent=hip, bevel=0.008)
        knee = add_empty(f"{name}_Knee_{side}", (0.0, 0.0, -0.41), parent=hip)
        make_cyl(f"{name}_Cama_{side}", 0.052, 0.38, (0.0, 0.0, -0.19), m_pants, verts=14, parent=knee, bevel=0.006)
        make_box(f"{name}_Sabata_{side}", (0.095, 0.21, 0.068), (0.0, 0.045, -0.405), m_shoe, parent=knee, bevel=0.018)
        legs[side] = (hip, knee)

    torso = add_empty(f"{name}_Torso", (0.0, 0.0, 0.08), parent=pelvis)
    make_cyl(f"{name}_Pitrera", 0.145, 0.44, (0.0, 0.0, 0.22), m_vest, verts=16, parent=torso, bevel=0.015)
    make_box(f"{name}_PitreraPla", (0.29, 0.17, 0.42), (0.0, 0.0, 0.22), m_vest, parent=torso, bevel=0.035)
    make_box(f"{name}_DavantalSup", (0.22, 0.035, 0.30), (0.0, 0.088, 0.16), m_apron, parent=torso, bevel=0.010)

    neck = add_empty(f"{name}_Neck", (0.0, 0.0, 0.43), parent=torso)
    make_cyl(f"{name}_Coll", 0.048, 0.085, (0.0, 0.0, 0.04), m_skin, verts=12, parent=neck, bevel=0.005)
    head = add_empty(f"{name}_Head", (0.0, 0.0, 0.078), parent=neck)
    make_sphere(f"{name}_Cap", 0.098, (0.0, 0.0, 0.045), m_skin, segs=18, rings=12, parent=head)
    make_sphere(f"{name}_Nas", 0.018, (0.0, 0.096, 0.035), m_skin, segs=10, rings=8, parent=head)
    make_sphere(f"{name}_CabellPost", 0.095, (0.0, -0.022, 0.056), m_hair, segs=14, rings=10, parent=head)
    make_cyl(f"{name}_GorraCopa", 0.104, 0.065, (0.0, -0.005, 0.108), m_cap, verts=16, parent=head, bevel=0.012)
    make_box(f"{name}_Visera", (0.14, 0.08, 0.016), (0.0, 0.075, 0.086), m_cap, rot=(0.22, 0.0, 0.0), parent=head, bevel=0.005)

    arms = {}
    for side, sx in (("l", -0.165), ("r", 0.165)):
        sh = add_empty(f"{name}_Sh_{side}", (sx, 0.0, 0.39), parent=torso)
        make_sphere(f"{name}_Espatlla_{side}", 0.056, (0.0, 0.0, 0.0), m_shirt, segs=12, rings=8, parent=sh)
        make_cyl(f"{name}_Brac_{side}", 0.048, 0.27, (0.0, 0.0, -0.135), m_shirt, verts=12, parent=sh, bevel=0.006)
        elb = add_empty(f"{name}_Elb_{side}", (0.0, 0.0, -0.27), parent=sh)
        make_cyl(f"{name}_AvBrac_{side}", 0.039, 0.24, (0.0, 0.0, -0.12), m_shirt, verts=12, parent=elb, bevel=0.005)
        make_sphere(f"{name}_Ma_{side}", 0.036, (0.0, 0.0, -0.255), m_skin, segs=12, rings=8, parent=elb)
        arms[side] = (sh, elb)

    return {
        "root": root,
        "pelvis": pelvis,
        "torso": torso,
        "head": head,
        "l_sh": arms["l"][0],
        "l_elb": arms["l"][1],
        "r_sh": arms["r"][0],
        "r_elb": arms["r"][1],
        "l_hip": legs["l"][0],
        "l_knee": legs["l"][1],
        "r_hip": legs["r"][0],
        "r_knee": legs["r"][1],
    }


def set_worker_pose(
    rig,
    torso_rot=(0.0, 0.0, 0.0),
    head_rot=(0.0, 0.0, 0.0),
    l_sh=(0.0, 0.0, 0.0),
    l_elb=(0.0, 0.0, 0.0),
    r_sh=(0.0, 0.0, 0.0),
    r_elb=(0.0, 0.0, 0.0),
    l_hip=(0.0, 0.0, 0.0),
    l_knee=(0.0, 0.0, 0.0),
    r_hip=(0.0, 0.0, 0.0),
    r_knee=(0.0, 0.0, 0.0),
):
    rig["torso"].rotation_euler = torso_rot
    rig["head"].rotation_euler = head_rot
    rig["l_sh"].rotation_euler = l_sh
    rig["l_elb"].rotation_euler = l_elb
    rig["r_sh"].rotation_euler = r_sh
    rig["r_elb"].rotation_euler = r_elb
    rig["l_hip"].rotation_euler = l_hip
    rig["l_knee"].rotation_euler = l_knee
    rig["r_hip"].rotation_euler = r_hip
    rig["r_knee"].rotation_euler = r_knee


def make_workshop_floor(kind="cottage_wood", size=(3.4, 2.6, 0.12), center=(0.0, 0.0), with_room_backdrop=False):
    """Sol propi de cada màquina (postes de roure o lloses de fàbrica) + fons de taller per a Cycles."""
    sx, sy, sz = size
    cx, cy = center
    grp = add_empty("EntornTaller")

    if kind == "cottage_wood":
        p_fl = build_pbr_pair("FlPostes", "wood_floor", 512, 512, bump_scale=2.2)
        p_tr = build_pbr_pair("FlVora", "wood_dark", 512, 512, bump_scale=2.0)
        m_fl = make_mat("TerraPostes", "#8f6239", roughness=0.72, pbr_pair=p_fl, tex_scale=(1.4, 1.4), normal_strength=0.75)
        m_tr = make_mat("VoraFusta", "#4f3018", roughness=0.78, pbr_pair=p_tr, normal_strength=0.75)
        make_box("SocolTaller", (sx, sy, sz), (cx, cy, sz * 0.5), m_fl, parent=grp, bevel=0.012, uv_scale=0.55)
        # Vores de roure perimetrals rebaixades per rematar el taulat
        make_box("VoraNord", (sx + 0.06, 0.06, sz * 0.92), (cx, cy + sy * 0.5 + 0.015, sz * 0.46), m_tr, parent=grp, bevel=0.008)
        make_box("VoraSud", (sx + 0.06, 0.06, sz * 0.92), (cx, cy - sy * 0.5 - 0.015, sz * 0.46), m_tr, parent=grp, bevel=0.008)
    else:
        p_fg = build_pbr_pair("FlLloses", "flagstone", 512, 512, bump_scale=2.4)
        p_ir = build_pbr_pair("FlFerro", "castiron", 512, 512, bump_scale=1.8)
        m_fg = make_mat("TerraLloses", "#8c867a", roughness=0.88, pbr_pair=p_fg, tex_scale=(1.2, 1.2), normal_strength=0.85)
        m_ir = make_mat("VoraFerro", "#2c3137", metallic=0.82, roughness=0.48, pbr_pair=p_ir, normal_strength=0.60)
        make_box("SocolTaller", (sx, sy, sz), (cx, cy, sz * 0.5), m_fg, parent=grp, bevel=0.014, uv_scale=0.55)
        make_box("CanalVora", (sx + 0.04, 0.05, sz * 0.85), (cx, cy - sy * 0.5 - 0.01, sz * 0.425), m_ir, parent=grp, bevel=0.006)

    if with_room_backdrop:
        # Escenografia de taller NOMÉS per a renders Cycles (esborrada abans d'exportar el .glb)
        p_pl = build_pbr_pair("BgCal", "workshop_plaster", 512, 512, bump_scale=1.6)
        p_wd = build_pbr_pair("BgFusta", "wood_dark", 512, 512, bump_scale=1.8)
        m_pl = make_mat("ParetTaller", "#d9cdb6", roughness=0.92, pbr_pair=p_pl, tex_scale=(1.6, 1.6), normal_strength=0.55)
        m_wd = make_mat("SocolParet", "#4c2f1a", roughness=0.72, pbr_pair=p_wd, normal_strength=0.70)
        m_win = make_mat("FinestraDia", "#fff5de", roughness=0.25, emission_hex="#fff5dc", emission_strength=2.6)

        back_y = cy + sy * 0.5 + 1.05
        ro_objs = []
        ro_objs.append(make_box("BgTerraExtes", (12.0, 9.0, 0.04), (cx, cy + 0.8, 0.02), m_wd if kind == "cottage_wood" else m_pl, bevel=0.0, uv_scale=0.35))
        ro_objs.append(make_box("BgParetPost", (11.0, 0.14, 5.0), (cx, back_y, 2.4), m_pl, bevel=0.0, uv_scale=0.35))
        ro_objs.append(make_box("BgSocolFusta", (11.0, 0.18, 0.88), (cx, back_y - 0.02, 0.44), m_wd, bevel=0.0, uv_scale=0.45))
        ro_objs.append(make_box("BgCornisa", (11.0, 0.22, 0.06), (cx, back_y - 0.04, 0.90), m_wd, bevel=0.004))
        # Finestral de taller amb llum natural i muntants a l'esquerra
        wx, wy, wz = cx - 1.55, back_y - 0.07, 1.85
        ro_objs.append(make_box("BgFinestraVidre", (1.06, 0.03, 1.36), (wx, wy, wz), m_win, bevel=0.0))
        ro_objs.append(make_box("BgFinestraMarcL", (0.09, 0.07, 1.50), (wx - 0.57, wy - 0.01, wz), m_wd, bevel=0.004))
        ro_objs.append(make_box("BgFinestraMarcR", (0.09, 0.07, 1.50), (wx + 0.57, wy - 0.01, wz), m_wd, bevel=0.004))
        ro_objs.append(make_box("BgFinestraMarcT", (1.24, 0.07, 0.09), (wx, wy - 0.01, wz + 0.71), m_wd, bevel=0.004))
        ro_objs.append(make_box("BgFinestraMarcB", (1.26, 0.10, 0.09), (wx, wy - 0.02, wz - 0.71), m_wd, bevel=0.004))
        ro_objs.append(make_box("BgFinestraMuntV", (0.035, 0.05, 1.36), (wx, wy - 0.01, wz), m_wd, bevel=0.002))
        ro_objs.append(make_box("BgFinestraMuntH", (1.06, 0.05, 0.035), (wx, wy - 0.01, wz + 0.06), m_wd, bevel=0.002))
        for ro in ro_objs:
            ro["render_only"] = True
        bpy.context.scene["render_room"] = 1

    return grp


def add_shadow_floor(z=0.0, size=14.0):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0.0, 0.0, z))
    pl = bpy.context.active_object
    pl.name = "SombraTerra"
    pl.is_shadow_catcher = True
    return pl


def setup_lighting(cam_loc, target, lens=44.0, mood="workshop"):
    world = bpy.data.worlds.new("TallerFons")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if mood == "forge":
        bg.inputs["Color"].default_value = hex_rgba("#efe4d1", 1.0)
        bg.inputs["Strength"].default_value = 0.72
    else:
        bg.inputs["Color"].default_value = hex_rgba("#f4ecda", 1.0)
        bg.inputs["Strength"].default_value = 0.78

    def add_light(name, ltype, loc, rot, energy, size=6.0, color="#fffaf0"):
        ld = bpy.data.lights.new(name=name, type=ltype)
        ld.energy = energy
        ld.color = hex_rgba(color)[:3]
        if ltype == "AREA":
            ld.size = size
        lo = bpy.data.objects.new(name, ld)
        lo.location = loc
        lo.rotation_euler = rot
        link_obj(lo)
        return lo

    # Llum de taller: finestra càlida lateral + llum difusa de nord + rebot càlid del sòl
    add_light("FinestraPrincipal", "AREA", (3.6, -3.4, 4.1), (0.94, 0.20, 0.68), 320.0, size=3.4, color="#fff2d8")
    add_light("ClaraboyaOmplert", "AREA", (-3.0, -4.6, 3.8), (1.06, -0.15, -0.52), 185.0, size=5.2, color="#e3edfa")
    add_light("ContraTaller", "AREA", (-1.8, 3.8, 3.2), (-1.12, 0.0, 2.65), 115.0, size=4.0, color="#ffe8c4")

    cam_data = bpy.data.cameras.new("Camara34")
    cam_data.lens = lens
    cam_obj = bpy.data.objects.new("Camara34", cam_data)
    cam_obj.location = Vector(cam_loc)
    cam_obj.rotation_euler = (Vector(target) - Vector(cam_loc)).to_track_quat("-Z", "Y").to_euler()
    link_obj(cam_obj)
    bpy.context.scene.camera = cam_obj
    return cam_obj


def set_linear_fcurves(objs):
    for obj in objs:
        act = obj.animation_data.action if obj.animation_data else None
        if not act:
            continue
        fcurves = getattr(act, "fcurves", None)
        if fcurves is None and hasattr(act, "layers"):
            fcurves = [
                fc
                for lay in act.layers
                for st in lay.strips
                for cb in getattr(st, "channelbags", [])
                for fc in cb.fcurves
            ]
        for fcu in fcurves or []:
            for kp in fcu.keyframe_points:
                kp.interpolation = "LINEAR"


def render_image(out_path, res_x=1200, res_y=760, samples=32, file_format="PNG"):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 6
    scene.render.film_transparent = not bool(scene.get("render_room"))
    scene.render.resolution_x = res_x
    scene.render.resolution_y = res_y
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = file_format
    scene.render.image_settings.color_mode = "RGBA"
    if file_format == "WEBP":
        scene.render.image_settings.quality = 88
    scene.view_settings.view_transform = "AgX"
    scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)


def render_closeup(out_path, cam_loc, target, lens=60.0, samples=28):
    cam = bpy.context.scene.camera
    cam.location = Vector(cam_loc)
    cam.rotation_euler = (Vector(target) - Vector(cam_loc)).to_track_quat("-Z", "Y").to_euler()
    cam.data.lens = lens
    render_image(out_path, res_x=960, res_y=600, samples=samples, file_format="PNG")


def project_anchors(anchors):
    scene = bpy.context.scene
    cam = scene.camera
    res = {}
    for k, pt in anchors.items():
        co = world_to_camera_view(scene, cam, Vector(pt))
        res[k] = [round(co.x * 100, 1), round((1.0 - co.y) * 100, 1)]
    return res


def anchors_to_gltf_3d(anchors):
    """Converteix (x, y, z) Z-up de Blender a (x, z, -y) Y-up de glTF / <model-viewer>."""
    return {k: [round(pt[0], 3), round(pt[2], 3), round(-pt[1], 3)] for k, pt in anchors.items()}


def export_glb_and_meta(prefix, glb_name, anchors, extra_meta=None):
    for obj in list(bpy.data.objects):
        if obj.name == "SombraTerra" or getattr(obj, "is_shadow_catcher", False) or obj.get("render_only"):
            bpy.data.objects.remove(obj, do_unlink=True)
    glb_path = os.path.join(MODELS_DIR, glb_name)
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format="GLB",
        export_animations=True,
        export_animation_mode="SCENE",
        export_anim_scene_split_object=False,
        export_yup=True,
    )
    meta = {
        "hotspots_3d": anchors_to_gltf_3d(anchors),
        "glb_bytes": os.path.getsize(glb_path),
    }
    if extra_meta:
        meta.update(extra_meta)
    meta_path = os.path.join(OUT_DIR, f"{prefix}_meta.json")
    with open(meta_path, "w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2)
    print(f"{prefix.upper()}_3D_OK", json.dumps(meta))

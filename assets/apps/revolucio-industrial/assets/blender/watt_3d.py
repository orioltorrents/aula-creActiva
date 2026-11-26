# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Generador 3D procedural (Blender 5.3 CLI) — v4 hiperrealista i pedagògica:
Màquina de vapor d'efecte simple de James Watt (patent 1769 / model museogràfic 1776).

Millores v4 en realisme visual, materials PBR i rigor mecànic:
  - Parelles de textures sRGB + mapes normals tangents empaquetats (maó, roure, pedra, ferro colat, coure)
    que exporten normalTexture real al .glb per a WebGL (<model-viewer>) i Cycles
  - Fogar històric amb arc de dovelles de maó, tirants verticals de ferro (buckstays), cendrer,
    carregador de carbó, xemeneia rematada i brases vives
  - Caldera de paller amb boca de registre cargolada, doble anell de reblons, nivell d'aigua i manòmetre
  - Canonades amb brides cargolades als colzes i vàlvules de bronze realistes accionades per una
    vareta vertical de distribució (plug-rod) penjada del balancí
  - Vapor suau per capes (anells/núvols translúcids) dins el cilindre en lloc d'un cilindre sòlid
  - Tina del condensador de fusta amb dueles verticals i cèrcols de ferro reblonats, amb tub
    d'injecció d'aigua freda dins el condensador seccionat i vàlvules internes a les bombes
  - Balancí de roure amb tires metàl·liques laterals, perns passants, arcs amb radis reforçats
    i cadenes articulades planes de baules històriques
  - Pou de mina amb brocal circular de carreus de pedra, bomba cargolada, canaló amb llistons i raig

Ús:
  blender -b -P assets/blender/watt_3d.py
  blender -b -P assets/blender/watt_3d.py -- --glb-only
"""

import json
import math
import os
import sys

import bmesh
import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

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


THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if THIS_DIR not in sys.path:
    sys.path.insert(0, THIS_DIR)
from pbr_comu import build_pbr_pair  # noqa: E402, F401


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
    normal_strength=0.85,
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


def set_smooth(obj):
    if obj.type == "MESH" and obj.data:
        for p in obj.data.polygons:
            p.use_smooth = True


def apply_box_uv(obj, uv_scale=0.55):
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


def add_bevel(obj, width=0.014, segments=2):
    mod = obj.modifiers.new(name="Bevel", type="BEVEL")
    mod.width = width
    mod.segments = segments


def make_box(name, size, loc, mat, rot=(0, 0, 0), parent=None, bevel=0.014, uv_scale=0.55):
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


def make_cyl(name, radius, depth, loc, mat, rot=(0, 0, 0), verts=32, parent=None, bevel=0.006, uv_scale=0.55):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc, rotation=rot)
    obj = bpy.context.active_object
    obj.name = name
    apply_box_uv(obj, uv_scale=uv_scale)
    obj.data.materials.append(mat)
    set_smooth(obj)
    if bevel > 0:
        add_bevel(obj, width=bevel, segments=2)
    if parent:
        obj.parent = parent
    return obj


def make_sphere(name, radius, loc, mat, segs=24, rings=14, parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, radius=radius, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    apply_box_uv(obj, uv_scale=0.6)
    obj.data.materials.append(mat)
    set_smooth(obj)
    if parent:
        obj.parent = parent
    return obj


def make_chain_links(prefix, x, y, z_top, z_bot, mat, mat_pin=None, parent=None):
    """Cadena plana històrica de plaques/baules paral·leles amb passadors."""
    step = 0.11
    n = max(2, int((z_top - z_bot) / step))
    for i in range(n):
        z = z_top - (i + 0.5) * step
        dy = 0.026 if (i % 2 == 0) else 0.0
        if i % 2 == 0:
            for side in (-1, 1):
                make_box(f"{prefix}_P_{i}_{side}", (0.042, 0.015, 0.135), (x, y + side * dy, z), mat, parent=parent, bevel=0.003)
        else:
            make_box(f"{prefix}_C_{i}", (0.044, 0.026, 0.135), (x, y, z), mat, parent=parent, bevel=0.003)
        if mat_pin is not None:
            make_cyl(f"{prefix}_R_{i}", 0.011, 0.072, (x, y, z + step * 0.45), mat_pin, rot=(math.pi / 2, 0, 0), verts=10, parent=parent, bevel=0.0)


def make_tapered_beam(name, length_left, length_right, h_center, h_end, thickness, loc, mat, parent=None):
    bm = bmesh.new()
    y0, y1 = -thickness * 0.5, thickness * 0.5
    xs = [-length_left, 0.0, length_right]
    hs = [h_end, h_center, h_end]
    rings = []
    for x, h in zip(xs, hs):
        rings.append((
            bm.verts.new((x, y0, -h * 0.5)),
            bm.verts.new((x, y1, -h * 0.5)),
            bm.verts.new((x, y1, h * 0.5)),
            bm.verts.new((x, y0, h * 0.5)),
        ))

    for idx in range(len(rings) - 1):
        a, b = rings[idx], rings[idx + 1]
        for k in range(4):
            kn = (k + 1) % 4
            bm.faces.new((a[k], a[kn], b[kn], b[k]))
    bm.faces.new(rings[0][::-1])
    bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(name + "_mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    link_obj(obj)
    apply_box_uv(obj, uv_scale=0.45)
    obj.data.materials.append(mat)
    add_bevel(obj, width=0.018, segments=2)
    if parent:
        obj.parent = parent
    return obj


def make_concentric_arch_head(name, radius, thickness, ang_span, is_left, pivot_offset_x, mat, mat_rim, parent=None):
    """Sector circular (arch-head) concèntric amb l'eix, amb cèrcol metàl·lic exterior."""
    bm = bmesh.new()
    steps = 18
    y0, y1 = -thickness * 0.5, thickness * 0.5
    base_ang = math.pi if is_left else 0.0
    front_out, back_out = [], []
    r_in = radius - 0.54
    c_f = bm.verts.new(((-r_in if is_left else r_in), y0, 0.0))
    c_b = bm.verts.new(((-r_in if is_left else r_in), y1, 0.0))

    for i in range(steps + 1):
        a = base_ang - ang_span * 0.5 + ang_span * (i / steps)
        px = radius * math.cos(a)
        pz = radius * math.sin(a)
        front_out.append(bm.verts.new((px, y0, pz)))
        back_out.append(bm.verts.new((px, y1, pz)))

    for i in range(steps):
        bm.faces.new((c_f, front_out[i], front_out[i + 1])).material_index = 0
        bm.faces.new((c_b, back_out[i + 1], back_out[i])).material_index = 0
        bm.faces.new((front_out[i], back_out[i], back_out[i + 1], front_out[i + 1])).material_index = 1

    bm.faces.new((c_f, c_b, back_out[0], front_out[0])).material_index = 0
    bm.faces.new((c_f, front_out[-1], back_out[-1], c_b)).material_index = 0
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    mesh = bpy.data.meshes.new(name + "_mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    obj.location = (pivot_offset_x, 0.0, 0.0)
    link_obj(obj)
    apply_box_uv(obj, uv_scale=0.6)
    obj.data.materials.append(mat)
    obj.data.materials.append(mat_rim)
    if parent:
        obj.parent = parent
    return obj


def make_cutaway_cylinder(name, r_out, r_in, z0, z1, loc, mat_outer, mat_cut, hole_z0, hole_z1, ang0=-1.15, ang1=0.35, top_open=False, parent=None):
    mesh = bpy.data.meshes.new(name + "_mesh")
    obj = bpy.data.objects.new(name, mesh)
    obj.location = loc
    link_obj(obj)
    obj.data.materials.append(mat_outer)
    obj.data.materials.append(mat_cut)

    verts, faces, face_mats = [], [], []
    n_a = 48
    a_cut0 = -math.pi / 2 + ang0
    a_cut1 = -math.pi / 2 + ang1

    def in_cut(a):
        aa = (a + math.pi) % (2 * math.pi) - math.pi
        return a_cut0 <= aa <= a_cut1

    z_levels = [z0, hole_z0, z1] if top_open else [z0, hole_z0, hole_z1, z1]
    n_bands = len(z_levels) - 1
    rings_out, rings_in = [], []
    for z in z_levels:
        ro, ri = [], []
        for i in range(n_a):
            a = -math.pi + 2 * math.pi * i / n_a
            ro.append(len(verts))
            verts.append((r_out * math.cos(a), r_out * math.sin(a), z))
            ri.append(len(verts))
            verts.append((r_in * math.cos(a), r_in * math.sin(a), z))
        rings_out.append(ro)
        rings_in.append(ri)

    for band in range(n_bands):
        is_hole_band = (band == 1)
        for i in range(n_a):
            j = (i + 1) % n_a
            a_mid = -math.pi + 2 * math.pi * (i + 0.5) / n_a
            if is_hole_band and in_cut(a_mid):
                continue
            faces.append((rings_out[band][i], rings_out[band][j], rings_out[band + 1][j], rings_out[band + 1][i]))
            face_mats.append(0)
            faces.append((rings_in[band][j], rings_in[band][i], rings_in[band + 1][i], rings_in[band + 1][j]))
            face_mats.append(0)
            if not is_hole_band and in_cut(a_mid):
                if band == 0:
                    faces.append((rings_out[1][i], rings_out[1][j], rings_in[1][j], rings_in[1][i]))
                    face_mats.append(1)
                elif band == 2:
                    faces.append((rings_in[2][i], rings_in[2][j], rings_out[2][j], rings_out[2][i]))
                    face_mats.append(1)
        if is_hole_band:
            for i in range(n_a):
                a_i = -math.pi + 2 * math.pi * (i + 0.5) / n_a
                a_prev = -math.pi + 2 * math.pi * ((i - 1 + n_a) % n_a + 0.5) / n_a
                if not in_cut(a_i) and in_cut(a_prev):
                    faces.append((rings_in[1][i], rings_out[1][i], rings_out[2][i], rings_in[2][i]))
                    face_mats.append(1)
                if in_cut(a_i) and not in_cut(a_prev):
                    faces.append((rings_out[1][i], rings_in[1][i], rings_in[2][i], rings_out[2][i]))
                    face_mats.append(1)

    top_idx = n_bands
    for i in range(n_a):
        j = (i + 1) % n_a
        a_mid = -math.pi + 2 * math.pi * (i + 0.5) / n_a
        if not (top_open and in_cut(a_mid)):
            faces.append((rings_out[top_idx][i], rings_out[top_idx][j], rings_in[top_idx][j], rings_in[top_idx][i]))
            face_mats.append(0)
        faces.append((rings_in[0][i], rings_in[0][j], rings_out[0][j], rings_out[0][i]))
        face_mats.append(0)

    mesh.from_pydata(verts, [], faces)
    mesh.update()
    for idx, poly in enumerate(mesh.polygons):
        poly.material_index = face_mats[idx]
        poly.use_smooth = (face_mats[idx] == 0)
    apply_box_uv(obj, uv_scale=0.55)
    if parent:
        obj.parent = parent
    return obj


def make_pipe_elbow(name, points, radius, mat, mat_flange=None, parent=None):
    curve_data = bpy.data.curves.new(name + "_curve", type="CURVE")
    curve_data.dimensions = "3D"
    curve_data.bevel_depth = radius
    curve_data.bevel_resolution = 6
    spline = curve_data.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for i, p in enumerate(points):
        spline.points[i].co = (p[0], p[1], p[2], 1.0)
    curve_obj = bpy.data.objects.new(name, curve_data)
    link_obj(curve_obj)
    bpy.context.view_layer.objects.active = curve_obj
    curve_obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    mesh_obj = bpy.context.active_object
    mesh_obj.name = name
    apply_box_uv(mesh_obj, uv_scale=0.7)
    mesh_obj.data.materials.append(mat)
    set_smooth(mesh_obj)
    if parent:
        mesh_obj.parent = parent

    if mat_flange is not None and len(points) >= 2:
        for idx in (0, len(points) - 1):
            p_end = Vector(points[idx])
            p_adj = Vector(points[1 if idx == 0 else -2])
            d = (p_adj - p_end)
            if d.length > 1e-4:
                rot = d.normalized().to_track_quat("Z", "Y").to_euler()
                make_cyl(f"{name}_Br_{idx}", radius * 1.65, 0.045, p_end + d.normalized() * 0.03, mat_flange, rot=rot, verts=16, parent=parent, bevel=0.004)
    return mesh_obj


def add_empty(name, loc=(0, 0, 0)):
    emp = bpy.data.objects.new(name, None)
    emp.location = loc
    link_obj(emp)
    return emp


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


def build_watt_scene(exploded=False, animate=False):
    clear_scene()

    # Parelles de textures sRGB + mapes normals tangents (Cycles + glTF)
    pbr_brick = build_pbr_pair("TexMao1769", "brick", 512, 512, bump_scale=3.0)
    pbr_wood = build_pbr_pair("TexRoure1769", "wood", 512, 512, bump_scale=2.2)
    pbr_stone = build_pbr_pair("TexPedra1769", "stone", 512, 512, bump_scale=2.6)
    pbr_iron = build_pbr_pair("TexFerro1769", "castiron", 512, 512, bump_scale=2.0)
    pbr_copper = build_pbr_pair("TexCoure1769", "copper", 512, 512, bump_scale=1.2)

    m_stone = make_mat("Pedra", "#aea389", metallic=0.0, roughness=0.90, pbr_pair=pbr_stone, tex_scale=(1.1, 1.1), normal_strength=0.95)
    m_brick = make_mat("Mao", "#8f402a", metallic=0.0, roughness=0.86, pbr_pair=pbr_brick, tex_scale=(1.35, 1.35), normal_strength=1.0)
    m_wood = make_mat("Roure", "#8e5c30", metallic=0.0, roughness=0.64, pbr_pair=pbr_wood, tex_scale=(0.95, 0.95), normal_strength=0.75)
    m_wood_dark = make_mat("RoureFosc", "#5c391b", metallic=0.0, roughness=0.68, pbr_pair=pbr_wood, tex_scale=(1.15, 1.15), normal_strength=0.75)

    m_copper = make_mat("Coure", "#c2693e", metallic=0.90, roughness=0.26, pbr_pair=pbr_copper, tex_scale=(1.2, 1.2), normal_strength=0.45)
    m_brass = make_mat("Llauto", "#d2a542", metallic=0.92, roughness=0.24)
    m_jacket = make_mat("CamisaExterior", "#b78b30", metallic=0.84, roughness=0.33)
    m_cut = make_mat("TallTecnic", "#b93d24", metallic=0.14, roughness=0.52)
    m_iron = make_mat("FerroColat", "#303439", metallic=0.84, roughness=0.46, pbr_pair=pbr_iron, tex_scale=(1.6, 1.6), normal_strength=0.65)
    m_steel = make_mat("AcerPolit", "#b5bec6", metallic=0.96, roughness=0.18)
    m_water = make_mat("AiguaFreda", "#3a8dc2", metallic=0.05, roughness=0.07, alpha=0.68)
    m_glass = make_mat("VidreNivell", "#dbe9f2", metallic=0.05, roughness=0.08, alpha=0.42)
    m_steam_hi = make_mat("VaporCalentAlt", "#f7b57e", metallic=0.0, roughness=0.55, alpha=0.30, emission_hex="#f38b47", emission_strength=0.45)
    m_steam_mid = make_mat("VaporCalentMig", "#f5a76c", metallic=0.0, roughness=0.60, alpha=0.22, emission_hex="#f0823c", emission_strength=0.32)
    m_jacket_steam = make_mat("VaporCamisa", "#f29d5e", metallic=0.0, roughness=0.6, alpha=0.24, emission_hex="#ec7b35", emission_strength=0.34)
    m_cond_steam = make_mat("VaporCondensat", "#93c9ec", metallic=0.0, roughness=0.4, alpha=0.38, emission_hex="#4da3db", emission_strength=0.30)
    m_fire = make_mat("FocCarbo", "#ff681c", metallic=0.0, roughness=0.9, emission_hex="#ff7214", emission_strength=5.2)
    m_coal = make_mat("Carbo", "#1d1815", metallic=0.0, roughness=0.95)
    m_valv_open = make_mat("ValvulaOberta", "#4f9b33", metallic=0.35, roughness=0.35)
    m_valv_shut = make_mat("ValvulaTancada", "#c43f27", metallic=0.35, roughness=0.35)
    m_guide = make_mat("GuiaExplotada", "#5c5347", metallic=0.0, roughness=0.8)

    dz_boiler = 0.72 if exploded else 0.0
    dx_boiler = -0.35 if exploded else 0.0
    dz_cyl = 0.22 if exploded else 0.0
    dx_eq = 0.34 if exploded else 0.0
    dz_piston = 1.72 if exploded else 0.0
    dz_cond = 1.18 if exploded else 0.0
    dz_airp = 0.98 if exploded else 0.0
    dz_beam = 1.32 if exploded else 0.0
    dz_pump = 0.78 if exploded else 0.0

    # --- 0. SÒL OMBRA, BASE DE PEDRA I POU DE LA MINA ---
    if not animate:
        bpy.ops.mesh.primitive_plane_add(size=38.0, location=(0.5, 0.0, -0.004))
        shadow_pl = bpy.context.active_object
        shadow_pl.name = "SombraTerra"
        shadow_pl.is_shadow_catcher = True

    g_base = add_empty("Base")
    make_box("PeanyaPedra", (8.9, 2.94, 0.36), (-0.85, 0.0, 0.18), m_stone, parent=g_base, bevel=0.03)
    make_cutaway_cylinder("PouMina", 1.04, 0.73, 0.0, 0.96, (4.45, 0.0, 0.0), m_stone, m_stone, 0.38, 0.96, ang0=-0.62, ang1=0.62, top_open=True, parent=g_base)
    # Brocal de carreus al coronament del pou
    for s_i in range(10):
        sa = -math.pi * 0.28 + (1.58 * math.pi) * (s_i / 9.0)
        make_box(f"BrocalCarreu_{s_i}", (0.34, 0.34, 0.11), (4.45 + 0.89 * math.cos(sa), 0.89 * math.sin(sa), 1.00), m_stone, rot=(0, 0, sa), parent=g_base, bevel=0.014)
    make_cyl("PouAigua", 0.725, 0.62, (4.45, 0.0, 0.32), m_water, parent=g_base, bevel=0.0)
    make_box("PouPuntalEsq", (0.11, 0.11, 0.62), (3.86, 0.0, 0.44), m_wood_dark, parent=g_base)
    make_box("PouPuntalDret", (0.11, 0.11, 0.62), (5.04, 0.0, 0.44), m_wood_dark, parent=g_base)
    make_box("BassaDesguas", (1.36, 1.36, 0.56), (5.92, 0.0, 0.28), m_stone, parent=g_base, bevel=0.025)
    make_box("BassaVora", (1.44, 1.44, 0.09), (5.92, 0.0, 0.56), m_stone, parent=g_base, bevel=0.015)
    make_box("BassaAigua", (1.10, 1.10, 0.42), (5.92, 0.0, 0.36), m_water, parent=g_base, bevel=0.0)

    # --- 1. FOGAR DE MAÓ AMB ARC, TIRANTS, XEMENEIA I CALDERA ---
    g_fogar = add_empty("Fogar", (-3.95, 0.0, 0.36))
    make_box("FogarSocol", (2.20, 1.98, 0.14), (0.0, 0.0, 0.07), m_stone, parent=g_fogar, bevel=0.02)
    make_box("FogarCos", (2.05, 1.84, 1.44), (0.0, 0.0, 0.80), m_brick, parent=g_fogar, bevel=0.02)
    make_box("FogarCornisa", (2.18, 1.96, 0.11), (0.0, 0.0, 1.54), m_stone, parent=g_fogar, bevel=0.018)
    # Tirants verticals de ferro (buckstays) subjectant l'obra de maó
    for bx in (-0.82, 0.82):
        make_box(f"BuckstayDavant_{bx}", (0.08, 0.06, 1.56), (bx, -0.94, 0.82), m_iron, parent=g_fogar, bevel=0.008)
        make_box(f"BuckstayDarrere_{bx}", (0.08, 0.06, 1.56), (bx, 0.94, 0.82), m_iron, parent=g_fogar, bevel=0.008)
        make_cyl(f"TirantFogar_{bx}", 0.016, 1.96, (bx, 0.0, 1.46), m_iron, rot=(math.pi / 2, 0, 0), verts=10, parent=g_fogar, bevel=0.0)

    make_box("XemeneiaBase", (0.70, 0.70, 0.65), (-0.52, 0.88, 1.48), m_brick, parent=g_fogar, bevel=0.015)
    make_box("XemeneiaFogar", (0.58, 0.58, 2.55), (-0.52, 0.88, 2.52), m_brick, parent=g_fogar, bevel=0.015)
    make_box("XemeneiaCollar", (0.64, 0.64, 0.08), (-0.52, 0.88, 3.66), m_iron, parent=g_fogar, bevel=0.008)
    make_box("XemeneiaRemat", (0.74, 0.74, 0.14), (-0.52, 0.88, 3.82), m_stone, parent=g_fogar, bevel=0.015)

    # Arc de dovelles sobre la porta del fogar + cendrer inferior
    for d_i in range(7):
        da = -0.95 + 1.90 * (d_i / 6.0)
        make_box(f"Dovella_{d_i}", (0.16, 0.14, 0.12), (0.48 * math.sin(da), -0.94, 0.78 + 0.36 * math.cos(da)), m_brick, rot=(0, -da, 0), parent=g_fogar, bevel=0.008)
    make_box("FogarMarc", (0.98, 0.11, 0.76), (0.0, -0.92, 0.52), m_iron, parent=g_fogar, bevel=0.012)
    make_box("FogarBuit", (0.76, 0.06, 0.60), (0.0, -0.935, 0.50), m_coal, parent=g_fogar, bevel=0.005)
    make_box("FogarCendrer", (0.64, 0.10, 0.16), (0.0, -0.92, 0.14), m_coal, parent=g_fogar, bevel=0.006)
    for i in range(7):
        make_sphere(f"Brasa_{i}", 0.085, (-0.25 + 0.085 * i, -0.925, 0.30 + 0.05 * (i % 3)), m_fire, parent=g_fogar)
    for k in range(5):
        make_cyl(f"ReixaFogar_{k}", 0.020, 0.58, (-0.30 + k * 0.15, -0.995, 0.50), m_iron, parent=g_fogar, bevel=0.003)
    make_box("PortaFogarOberta", (0.34, 0.045, 0.64), (-0.58, -1.04, 0.52), m_iron, rot=(0.0, 0.0, 0.55), parent=g_fogar, bevel=0.006)
    # Pila de carbó i pala de fogoner al davant
    for c in range(7):
        make_sphere(f"CarboTerra_{c}", 0.095 - 0.012 * (c % 2), (0.74 + 0.11 * (c % 3) - 0.04 * (c // 3), -1.08 - 0.08 * (c // 3), 0.08 + 0.04 * (c // 5)), m_coal, segs=10, rings=8, parent=g_fogar)
    make_box("PalaFulla", (0.20, 0.24, 0.02), (1.16, -1.06, 0.03), m_iron, rot=(0.08, 0.0, -0.25), parent=g_fogar, bevel=0.004)
    make_cyl("PalaManec", 0.022, 0.88, (1.22, -1.00, 0.45), m_wood_dark, rot=(-0.22, 0.18, 0.0), verts=10, parent=g_fogar, bevel=0.0)

    g_caldera = add_empty("Caldera", (-3.95 + dx_boiler, 0.0, 1.94 + dz_boiler))
    make_cyl("CalderaCos", 0.90, 0.74, (0.0, 0.0, 0.37), m_copper, parent=g_caldera, bevel=0.015)
    make_sphere("CalderaCupula", 0.90, (0.0, 0.0, 0.74), m_copper, parent=g_caldera)
    make_cyl("CalderaBrida", 0.955, 0.10, (0.0, 0.0, 0.74), m_brass, parent=g_caldera)
    for i in range(20):
        ang = 2 * math.pi * i / 20.0
        make_sphere(f"RebloCald_{i}", 0.026, (0.958 * math.cos(ang), 0.958 * math.sin(ang), 0.74), m_copper, segs=8, rings=6, parent=g_caldera)
    # Segon anell superior de reblons i boca de registre (manhole) amb perns
    for i in range(14):
        ang = 2 * math.pi * i / 14.0
        make_sphere(f"RebloSup_{i}", 0.020, (0.64 * math.cos(ang), 0.64 * math.sin(ang), 1.38), m_copper, segs=8, rings=6, parent=g_caldera)
    make_cyl("BocaRegistre", 0.24, 0.08, (-0.36, -0.34, 1.44), m_iron, rot=(-0.38, 0.42, 0.0), verts=18, parent=g_caldera)
    make_cyl("CalderaColl", 0.26, 0.18, (0.0, 0.0, 1.66), m_brass, parent=g_caldera)
    make_cyl("CalderaBridaColl", 0.34, 0.05, (0.0, 0.0, 1.74), m_brass, parent=g_caldera)
    # Vàlvula de seguretat amb contrapès + tub de nivell d'aigua i manòmetre
    make_cyl("ValvSegBase", 0.065, 0.28, (0.36, -0.10, 1.66), m_brass, parent=g_caldera)
    make_box("ValvSegPalanca", (0.48, 0.035, 0.04), (0.56, -0.10, 1.79), m_steel, parent=g_caldera, bevel=0.005)
    make_cyl("ValvSegPes", 0.075, 0.14, (0.76, -0.10, 1.74), m_iron, parent=g_caldera)
    make_cyl("NivellVidre", 0.025, 0.34, (0.25, -0.92, 0.56), m_glass, verts=12, parent=g_caldera, bevel=0.0)
    make_cyl("ManometreEsfera", 0.11, 0.05, (-0.28, -0.84, 1.24), m_brass, rot=(math.pi / 2, 0, 0), verts=18, parent=g_caldera)
    make_pipe_elbow(
        "TubVaporCaldera",
        [(0.0, 0.0, 1.74), (0.0, 0.0, 1.98), (1.16, 0.0, 1.98), (1.16, 0.0, 1.56), (1.62 if not exploded else 1.44, 0.0, 1.56)],
        0.090,
        m_copper,
        mat_flange=m_brass,
        parent=g_caldera,
    )

    # --- 2. CILINDRE TANCAT AMB CAMISA DE VAPOR, PISTÓ, TUB D'EQUILIBRI I VARETA DE DISTRIBUCIÓ ---
    g_banc = add_empty("BancadaCilindre", (-1.65, 0.0, 0.36))
    make_box("SocolCilindre", (1.36, 1.36, 0.24), (0.0, 0.0, 0.12), m_stone, parent=g_banc, bevel=0.025)
    for sx in (-0.43, 0.43):
        for sy in (-0.43, 0.43):
            make_box(f"PotaCil_{sx}_{sy}", (0.15, 0.15, 0.85), (sx, sy, 0.64), m_iron, parent=g_banc, bevel=0.012)
            make_box(f"SabataCil_{sx}_{sy}", (0.24, 0.24, 0.07), (sx, sy, 0.26), m_iron, parent=g_banc, bevel=0.008)
    make_cyl("PlatCilBase", 0.74, 0.11, (0.0, 0.0, 1.05), m_iron, parent=g_banc)

    g_cil = add_empty("Cilindre", (-1.65, 0.0, 1.44 + dz_cyl))
    make_cutaway_cylinder("CamisaVapor", 0.66, 0.56, 0.06, 2.22, (0.0, 0.0, 0.0), m_jacket, m_cut, 0.28, 1.96, ang0=-1.08, ang1=0.15, parent=g_cil)
    make_cutaway_cylinder("VaporCamisaAnular", 0.555, 0.525, 0.16, 2.12, (0.0, 0.0, 0.0), m_jacket_steam, m_jacket_steam, 0.30, 1.94, ang0=-0.92, ang1=0.36, parent=g_cil)
    make_cutaway_cylinder("CilindreInterior", 0.52, 0.44, 0.0, 2.28, (0.0, 0.0, 0.0), m_brass, m_cut, 0.26, 1.98, ang0=-0.86, ang1=0.40, parent=g_cil)
    make_cyl("CilindreBridaInf", 0.72, 0.10, (0.0, 0.0, 0.05), m_brass, parent=g_cil)
    make_cyl("CilindreBridaSup", 0.72, 0.11, (0.0, 0.0, 2.23), m_brass, parent=g_cil)
    make_cyl("CilindreTapaSup", 0.63, 0.08, (0.0, 0.0, 2.31), m_iron, parent=g_cil)
    for k in range(10):
        ba = 2 * math.pi * k / 10.0
        make_cyl(f"PernBridaSup_{k}", 0.024, 0.07, (0.67 * math.cos(ba), 0.67 * math.sin(ba), 2.29), m_steel, verts=6, parent=g_cil, bevel=0.002)
    make_cyl("Premsaestopes", 0.16, 0.22, (0.0, 0.0, 2.41), m_brass, parent=g_cil)
    make_cyl("PremsaColl", 0.22, 0.05, (0.0, 0.0, 2.50), m_steel, parent=g_cil)

    # Vapor suau per capes (anells translúcids) dins del cilindre
    g_vap_dalt = add_empty("VaporDalt", (-1.65, 0.0, 3.64 + dz_cyl))
    for i, r_sc in enumerate((0.40, 0.34, 0.26)):
        make_cyl(f"VaporDalt_{i}", r_sc, 0.54 - i * 0.06, (0.0, 0.0, -0.275), m_steam_hi if i == 0 else m_steam_mid, verts=22, parent=g_vap_dalt, bevel=0.04)
    g_vap_baix = add_empty("VaporBaix", (-1.65, 0.0, 1.50 + dz_cyl))
    for i, r_sc in enumerate((0.40, 0.34, 0.26)):
        make_cyl(f"VaporBaix_{i}", r_sc, 0.54 - i * 0.06, (0.0, 0.0, 0.275), m_steam_hi if i == 0 else m_steam_mid, verts=22, parent=g_vap_baix, bevel=0.04)

    # Pistó, tija i cadena articulada plana fins a l'arch-head esquerre
    piston_base_z = 2.55 + dz_piston
    g_piston = add_empty("Piston", (-1.65, 0.0, piston_base_z))
    make_cyl("PistonDisc", 0.425, 0.34, (0.0, 0.0, 0.0), m_steel, parent=g_piston, bevel=0.012)
    make_cyl("PistonAnell1", 0.438, 0.05, (0.0, 0.0, 0.09), m_brass, parent=g_piston, bevel=0.005)
    make_cyl("PistonAnell2", 0.438, 0.05, (0.0, 0.0, -0.09), m_brass, parent=g_piston, bevel=0.005)
    make_cyl("PistonTija", 0.066, 1.68, (0.0, 0.0, 0.98), m_steel, parent=g_piston, bevel=0.004)
    make_cyl("PistonForquilla", 0.11, 0.14, (0.0, 0.0, 1.84), m_iron, parent=g_piston)
    if not exploded:
        make_chain_links("CadPist", 0.0, 0.0, 2.74, 1.88, m_iron, mat_pin=m_brass, parent=g_piston)

    # Tub lateral d'equilibri, caixes de vàlvules en bronze i balancins/manetes realistes
    g_eq = add_empty("Equilibri", (-0.82 + dx_eq, 0.0, 1.44 + dz_cyl))
    make_pipe_elbow(
        "TubEquilibri",
        [(-0.22, 0.0, 2.04), (0.05, 0.0, 2.04), (0.05, 0.0, 0.24), (-0.22, 0.0, 0.24)],
        0.064,
        m_copper,
        mat_flange=m_brass,
        parent=g_eq,
    )
    for vname, vz in (("CaixaValvSup", 1.88), ("CaixaValvMig", 1.14), ("CaixaValvInf", 0.40)):
        make_box(vname, (0.20, 0.20, 0.24), (0.05, 0.0, vz), m_brass, parent=g_eq, bevel=0.012)
        make_cyl(f"{vname}_Tapa", 0.07, 0.08, (0.05, -0.12, vz), m_iron, rot=(math.pi / 2, 0, 0), verts=14, parent=g_eq)

    g_maneta_adm = add_empty("ManetaAdmissio", (-2.30, -0.15, 3.44 + dz_cyl))
    make_cyl("ManAdmEix", 0.03, 0.12, (0.0, 0.03, 0.0), m_brass, rot=(math.pi / 2, 0, 0), verts=12, parent=g_maneta_adm)
    make_box("ManAdmBarra", (0.28, 0.035, 0.042), (-0.11, 0.0, 0.0), m_steel, parent=g_maneta_adm, bevel=0.005)
    make_cyl("ManAdmPom", 0.042, 0.08, (-0.26, 0.0, 0.0), m_valv_open, rot=(0, math.pi / 2, 0), verts=12, parent=g_maneta_adm)

    g_maneta_eq = add_empty("ManetaEquilibri", (-0.77 + dx_eq, -0.16, 2.58 + dz_cyl))
    make_cyl("ManEqEix", 0.03, 0.12, (0.0, 0.03, 0.0), m_brass, rot=(math.pi / 2, 0, 0), verts=12, parent=g_maneta_eq)
    make_box("ManEqBarra", (0.28, 0.035, 0.042), (0.11, 0.0, 0.0), m_steel, parent=g_maneta_eq, bevel=0.005)
    make_cyl("ManEqPom", 0.042, 0.08, (0.26, 0.0, 0.0), m_valv_shut, rot=(0, math.pi / 2, 0), verts=12, parent=g_maneta_eq)

    g_maneta_esc = add_empty("ManetaEscapament", (-0.77 + dx_eq, -0.16, 1.84 + dz_cyl))
    make_cyl("ManEscEix", 0.03, 0.12, (0.0, 0.03, 0.0), m_brass, rot=(math.pi / 2, 0, 0), verts=12, parent=g_maneta_esc)
    make_box("ManEscBarra", (0.28, 0.035, 0.042), (0.11, 0.0, 0.0), m_steel, parent=g_maneta_esc, bevel=0.005)
    make_cyl("ManEscPom", 0.042, 0.08, (0.26, 0.0, 0.0), m_valv_open, rot=(0, math.pi / 2, 0), verts=12, parent=g_maneta_esc)

    # --- 3. TINA DE DUELES DE FUSTA, CONDENSADOR SECCIONAT AMB INJECCIÓ I BOMBA D'AIRE ---
    g_tina = add_empty("TinaCondensador", (0.38, 0.0, 0.36))
    make_box("TinaFons", (2.06, 1.62, 0.10), (0.0, 0.0, 0.05), m_wood_dark, parent=g_tina)
    # Dindres/dueles individuals als laterals per realisme de boter
    for si in range(9):
        sx = -0.92 + si * 0.23
        make_box(f"TinaDuelaDarrere_{si}", (0.215, 0.09, 0.96), (sx, 0.76, 0.50), m_wood, parent=g_tina, bevel=0.006)
        make_box(f"TinaDuelaDavant_{si}", (0.215, 0.09, 0.56), (sx, -0.76, 0.30), m_wood, parent=g_tina, bevel=0.006)
    for si in range(7):
        sy = -0.66 + si * 0.22
        make_box(f"TinaDuelaEsq_{si}", (0.09, 0.205, 0.96), (-0.98, sy, 0.50), m_wood, parent=g_tina, bevel=0.006)
        make_box(f"TinaDuelaDreta_{si}", (0.09, 0.205, 0.96), (0.98, sy, 0.50), m_wood, parent=g_tina, bevel=0.006)
    make_box("TinaCercolInf", (2.12, 1.68, 0.06), (0.0, 0.0, 0.24), m_iron, parent=g_tina, bevel=0.005)
    make_box("TinaCercolSup", (2.12, 1.68, 0.06), (0.0, 0.0, 0.48), m_iron, parent=g_tina, bevel=0.005)
    make_box("TinaAigua", (1.84, 1.38, 0.75), (0.0, 0.0, 0.45), m_water, parent=g_tina, bevel=0.0)

    # Condensador separat SECCIONAT amb tub d'injecció d'aigua freda!
    g_cond = add_empty("Condensador", (0.02, 0.0, 0.72 + dz_cond))
    make_cutaway_cylinder("CondensadorCos", 0.35, 0.28, 0.0, 0.84, (0.0, 0.0, 0.0), m_brass, m_cut, 0.18, 0.74, ang0=-0.78, ang1=0.35, parent=g_cond)
    make_cyl("CondensadorBrida", 0.40, 0.08, (0.0, 0.0, 0.81), m_brass, parent=g_cond)
    make_cyl("CondensadorTapa", 0.32, 0.08, (0.0, 0.0, 0.88), m_copper, parent=g_cond)
    make_cyl("CondensatAigua", 0.26, 0.26, (0.0, 0.0, 0.20), m_water, verts=24, parent=g_cond, bevel=0.0)
    make_cyl("CondensatVapor", 0.24, 0.32, (0.0, 0.0, 0.52), m_cond_steam, verts=24, parent=g_cond, bevel=0.03)
    make_cyl("TubInjeccioFreda", 0.032, 0.34, (-0.18, 0.0, 0.44), m_brass, rot=(0, math.pi / 2, 0), verts=12, parent=g_cond)
    make_sphere("RuixadorInjeccio", 0.05, (-0.02, 0.0, 0.44), m_water, segs=12, rings=8, parent=g_cond)
    for gi, (gx, gy, gz) in enumerate(((-0.10, -0.11, 0.60), (0.09, -0.10, 0.50), (-0.03, -0.13, 0.38), (0.05, -0.11, 0.62))):
        make_sphere(f"GotaCondensacio_{gi}", 0.036, (gx, gy, gz), m_water, segs=10, rings=8, parent=g_cond)
    if not exploded:
        make_pipe_elbow(
            "TubEscapament",
            [(-1.05, 0.0, 1.12), (-0.42, 0.0, 1.12), (-0.42, 0.0, 0.86), (0.0, 0.0, 0.86)],
            0.075,
            m_copper,
            mat_flange=m_brass,
            parent=g_cond,
        )
    else:
        make_pipe_elbow("TubEscapament", [(-0.38, 0.0, 0.86), (0.0, 0.0, 0.86)], 0.075, m_copper, mat_flange=m_brass, parent=g_cond)

    # Bomba d'aire SECCIONADA dins la tina
    g_bomba_aire = add_empty("BombaAire", (0.76, 0.0, 0.72 + dz_airp))
    make_cutaway_cylinder("BombaAireCos", 0.25, 0.19, 0.0, 0.84, (0.0, 0.0, 0.0), m_brass, m_cut, 0.18, 0.74, ang0=-0.65, ang1=0.35, parent=g_bomba_aire)
    make_cyl("BombaAireBrida", 0.29, 0.08, (0.0, 0.0, 0.82), m_brass, parent=g_bomba_aire)
    make_cyl("PremsaBombaAire", 0.11, 0.08, (0.0, 0.0, 0.89), m_brass, parent=g_bomba_aire)
    make_cyl("ValvulaPeuAire", 0.14, 0.05, (0.0, 0.0, 0.10), m_copper, verts=16, parent=g_bomba_aire)
    if not exploded:
        make_cyl("TubCondBomba", 0.06, 0.46, (-0.38, 0.0, 0.20), m_copper, rot=(0, math.pi / 2, 0), parent=g_bomba_aire)

    airp_tija_base_z = 1.62 + dz_airp
    g_airp_tija = add_empty("BombaAireTija", (0.76, 0.0, airp_tija_base_z))
    # Tija contínua des del centre de l'èmbol (-0.42) fins a la cadena (+2.77) perquè no quedi mai partida
    make_cyl("AirpBarra", 0.044, 3.19, (0.0, 0.0, 1.175), m_steel, parent=g_airp_tija, bevel=0.003)
    make_cyl("AirpEmbol", 0.175, 0.16, (0.0, 0.0, -0.42), m_iron, parent=g_airp_tija)
    make_cyl("AirpAnell", 0.182, 0.035, (0.0, 0.0, -0.42), m_brass, parent=g_airp_tija)
    if not exploded:
        make_chain_links("CadAirp", 0.0, 0.0, 3.32, 2.74, m_iron, mat_pin=m_brass, parent=g_airp_tija)

    # --- 4. PILAR DE MAÓ AMB MOTLLURES I GRAN BALANCÍ AMB TIRES DE FERRO ---
    g_pilar = add_empty("PilarCentral", (1.95, 0.0, 0.36))
    make_box("PilarSocol", (1.44, 1.42, 0.26), (0.0, 0.0, 0.13), m_stone, parent=g_pilar, bevel=0.025)
    make_box("PilarBase", (1.24, 1.22, 0.18), (0.0, 0.0, 0.34), m_stone, parent=g_pilar, bevel=0.018)
    make_box("PilarCos", (1.06, 1.04, 3.45), (0.0, 0.0, 2.15), m_brick, parent=g_pilar, bevel=0.02)
    make_box("PilarAnellPedra", (1.16, 1.14, 0.14), (0.0, 0.0, 2.10), m_stone, parent=g_pilar, bevel=0.015)
    make_box("PilarCapcal", (1.34, 1.28, 0.24), (0.0, 0.0, 3.96), m_stone, parent=g_pilar, bevel=0.02)
    make_box("SuportPivotBase", (1.04, 0.82, 0.10), (0.0, 0.0, 4.12), m_iron, parent=g_pilar)
    make_box("SuportPivot", (0.88, 0.66, 0.42), (0.0, 0.0, 4.31), m_iron, parent=g_pilar)
    make_cyl("CoixinetPivot", 0.16, 0.84, (0.0, 0.0, 4.58), m_brass, rot=(math.pi / 2, 0, 0), parent=g_pilar)
    make_cyl("EngreixadorPivot", 0.045, 0.10, (0.0, 0.0, 4.78), m_brass, parent=g_pilar)

    pivot_z = 4.95 + dz_beam
    g_balanci = add_empty("Balanci", (1.95, 0.0, pivot_z))
    make_tapered_beam("BalanciBiga", 3.48, 2.38, 0.60, 0.42, 0.40, (0.0, 0.0, 0.0), m_wood, parent=g_balanci)
    # Tires de ferro laterals i perns passants sobre la biga de roure
    for side in (-1, 1):
        make_box(f"BigaTira_{side}", (5.65, 0.022, 0.08), (-0.54, side * 0.21, 0.0), m_iron, parent=g_balanci, bevel=0.004)
    for px in (-2.9, -2.0, -1.19, 0.95, 1.85):
        make_cyl(f"BigaPern_{px}", 0.024, 0.46, (px, 0.0, 0.0), m_iron, rot=(math.pi / 2, 0, 0), verts=8, parent=g_balanci, bevel=0.0)
    make_box("BalanciPuntal", (0.24, 0.28, 0.66), (0.0, 0.0, 0.56), m_wood_dark, parent=g_balanci, bevel=0.012)
    make_box("PuntalCasquet", (0.32, 0.36, 0.12), (0.0, 0.0, 0.88), m_iron, parent=g_balanci)
    make_cyl("TirantEsq", 0.032, 3.16, (-1.52, 0.0, 0.54), m_iron, rot=(0.0, 1.36, 0.0), parent=g_balanci, bevel=0.002)
    make_cyl("TirantDret", 0.032, 2.24, (1.06, 0.0, 0.56), m_iron, rot=(0.0, -1.30, 0.0), parent=g_balanci, bevel=0.002)

    make_box("BalanciFerraduraC", (0.56, 0.46, 0.68), (0.0, 0.0, 0.0), m_iron, parent=g_balanci)
    make_cyl("BalanciEix", 0.12, 0.68, (0.0, 0.0, 0.0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_balanci)
    make_box("FerraduraAirp", (0.22, 0.44, 0.58), (-1.19, 0.0, 0.0), m_iron, parent=g_balanci)
    make_concentric_arch_head("ArcEsq", 3.60, 0.34, 0.34, True, 0.0, m_wood_dark, m_iron, parent=g_balanci)
    make_concentric_arch_head("ArcDret", 2.50, 0.34, 0.46, False, 0.0, m_wood_dark, m_iron, parent=g_balanci)

    # --- 5. BOMBA DE LA MINA AMB CANONADA SUBMERGIDA, CANALETA I DOLL D'AIGUA (X = +4.45) ---
    g_bomba = add_empty("BombaMina", (4.45, 0.0, 0.96 + dz_pump))
    make_box("GuiaBombaP1", (0.16, 0.16, 1.38), (-0.48, 0.0, 0.68), m_wood, parent=g_bomba)
    make_box("GuiaBombaP2", (0.16, 0.16, 1.38), (0.48, 0.0, 0.68), m_wood, parent=g_bomba)
    make_box("GuiaBombaTrav", (1.22, 0.22, 0.14), (0.0, 0.0, 1.24), m_iron, parent=g_bomba)
    make_cyl("GuiaCollar", 0.15, 0.20, (0.0, 0.0, 1.24), m_brass, parent=g_bomba)
    make_cyl("BombaCos", 0.24, 1.15, (0.0, 0.0, -0.18), m_copper, parent=g_bomba)
    make_cyl("BombaBridaSup", 0.29, 0.07, (0.0, 0.0, 0.36), m_brass, parent=g_bomba)
    make_cyl("BombaBridaInf", 0.29, 0.07, (0.0, 0.0, -0.72), m_brass, parent=g_bomba)
    make_cyl("BombaTubSubmergit", 0.15, 0.52, (0.0, 0.0, -0.78), m_iron, parent=g_bomba)
    make_box("CanaletaFusta", (1.42, 0.28, 0.12), (0.82, 0.0, 0.12), m_wood_dark, parent=g_bomba, bevel=0.008)
    make_box("CanaletaVora1", (1.42, 0.04, 0.16), (0.82, -0.12, 0.18), m_wood, parent=g_bomba, bevel=0.004)
    make_box("CanaletaVora2", (1.42, 0.04, 0.16), (0.82, 0.12, 0.18), m_wood, parent=g_bomba, bevel=0.004)
    make_box("CanaletaAigua", (1.36, 0.18, 0.05), (0.82, 0.0, 0.18), m_water, parent=g_bomba, bevel=0.0)
    if not exploded:
        make_cyl("RaigDesguas", 0.055, 0.56, (1.50, 0.0, -0.09), m_water, rot=(0.0, 0.18, 0.0), parent=g_bomba, bevel=0.0)

    g_bomba_tija = add_empty("BombaTija", (4.45, 0.0, 1.32 + dz_pump))
    make_cyl("BombaBarra", 0.062, 2.98, (0.0, 0.0, 1.35), m_steel, parent=g_bomba_tija, bevel=0.004)
    make_cyl("BombaEmbol", 0.19, 0.24, (0.0, 0.0, -0.14), m_brass, parent=g_bomba_tija)
    if not exploded:
        make_chain_links("CadBomba", 0.0, 0.0, 3.65, 2.82, m_iron, mat_pin=m_brass, parent=g_bomba_tija)

    # --- LÍNIES GUIA PER A LA VISTA EXPLOSIONADA ---
    if exploded:
        guides = [
            ((-3.95 - 0.12, 0, 1.88), (-3.95 + dx_boiler - 0.12, 0, 1.88 + dz_boiler)),
            ((-1.65, 0, 1.44), (-1.65, 0, 1.44 + dz_cyl)),
            ((-1.65, 0, 2.55), (-1.65, 0, piston_base_z)),
            ((-1.05, 0, 2.58 + dz_cyl), (-0.82 + dx_eq, 0, 2.58 + dz_cyl)),
            ((0.02, 0, 1.10), (0.02, 0, 0.72 + dz_cond)),
            ((0.76, 0, 1.10), (0.76, 0, 0.72 + dz_airp)),
            ((1.95, 0, 4.65), (1.95, 0, pivot_z)),
            ((4.45, 0, 0.96), (4.45, 0, 0.96 + dz_pump)),
        ]
        for idx, (a, b) in enumerate(guides):
            va, vb = Vector(a), Vector(b)
            rot_g = (vb - va).normalized().to_track_quat("Z", "Y").to_euler()
            n_seg = 6
            for k in range(n_seg):
                t0 = (k + 0.12) / n_seg
                t1 = (k + 0.62) / n_seg
                p0 = va.lerp(vb, t0)
                p1 = va.lerp(vb, t1)
                make_cyl(f"Guia_{idx}_{k}", 0.020, (p1 - p0).length, (p0 + p1) * 0.5, m_guide, rot=rot_g, bevel=0.0)

    # --- ANIMACIÓ PER AL .GLB ---
    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        for fr in range(1, 61):
            t = (fr - 1) / 60.0
            ang = -0.15 * math.sin(2.0 * math.pi * t)
            g_balanci.rotation_euler = (0.0, ang, 0.0)
            g_balanci.keyframe_insert(data_path="rotation_euler", frame=fr)

            dz_left = 3.60 * math.sin(ang)
            g_piston.location = (-1.65, 0.0, piston_base_z + dz_left)
            g_piston.keyframe_insert(data_path="location", frame=fr)

            dz_airp_mov = 1.19 * math.sin(ang)
            g_airp_tija.location = (0.76, 0.0, airp_tija_base_z + dz_airp_mov)
            g_airp_tija.keyframe_insert(data_path="location", frame=fr)

            dz_right = -2.50 * math.sin(ang)
            g_bomba_tija.location = (4.45, 0.0, 1.32 + dz_pump + dz_right)
            g_bomba_tija.keyframe_insert(data_path="location", frame=fr)

            piston_z_rel = 1.11 + dz_left
            dalt_h = max(0.08, 2.20 - piston_z_rel - 0.16)
            baix_h = max(0.08, piston_z_rel - 0.18)
            g_vap_dalt.scale = (1.0, 1.0, dalt_h / 0.55)
            g_vap_dalt.keyframe_insert(data_path="scale", frame=fr)
            g_vap_baix.scale = (1.0, 1.0, baix_h / 0.55)
            g_vap_baix.keyframe_insert(data_path="scale", frame=fr)

            power_stroke = (0.02 <= t < 0.48)
            return_stroke = (0.52 <= t < 0.96)
            g_maneta_adm.rotation_euler = (0.0, 0.0 if power_stroke else -0.95, 0.0)
            g_maneta_esc.rotation_euler = (0.0, 0.0 if power_stroke else 0.95, 0.0)
            g_maneta_eq.rotation_euler = (0.0, 0.0 if return_stroke else 0.95, 0.0)
            for m_obj in (g_maneta_adm, g_maneta_esc, g_maneta_eq):
                m_obj.keyframe_insert(data_path="rotation_euler", frame=fr)

        set_linear_fcurves([g_balanci, g_piston, g_airp_tija, g_bomba_tija, g_vap_dalt, g_vap_baix, g_maneta_adm, g_maneta_esc, g_maneta_eq])
    else:
        ang = -0.11 if not exploded else 0.0
        g_balanci.rotation_euler = (0.0, ang, 0.0)
        g_piston.location = (-1.65, 0.0, piston_base_z + 3.60 * math.sin(ang))
        g_airp_tija.location = (0.76, 0.0, airp_tija_base_z + 1.19 * math.sin(ang))
        g_bomba_tija.location = (4.45, 0.0, 1.32 + dz_pump - 2.50 * math.sin(ang))
        dalt_h = 1.05 if not exploded else 0.30
        baix_h = 0.45 if not exploded else 0.30
        g_vap_dalt.scale = (1.0, 1.0, dalt_h / 0.55)
        g_vap_baix.scale = (1.0, 1.0, baix_h / 0.55)

    # --- IL·LUMINACIÓ I CÀMERA ---
    world = bpy.data.worlds.new("TallerFons")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = hex_rgba("#f7f1e1", 1.0)
    bg.inputs["Strength"].default_value = 0.80

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

    add_light("SolPrincipal", "SUN", (6.0, -8.0, 10.0), (0.82, 0.28, -0.58), 2.65, color="#fff5e0")
    add_light("OmplertDavant", "AREA", (-3.5, -10.5, 4.8), (1.28, 0.0, -0.35), 275.0, size=8.5, color="#eef4ff")
    add_light("ContraContorn", "AREA", (2.5, 7.5, 7.2), (-1.05, 0.0, 2.85), 210.0, size=7.0, color="#ffefd1")

    cam_data = bpy.data.cameras.new("Camara34")
    cam_data.lens = 42.0
    cam_obj = bpy.data.objects.new("Camara34", cam_data)
    cam_loc = Vector((2.6, -14.4, 5.1)) if not exploded else Vector((2.3, -16.6, 5.6))
    target = Vector((0.55, 0.0, 2.65)) if not exploded else Vector((0.55, 0.0, 3.45))
    cam_obj.location = cam_loc
    cam_obj.rotation_euler = (target - cam_loc).to_track_quat("-Z", "Y").to_euler()
    link_obj(cam_obj)
    bpy.context.scene.camera = cam_obj

    anchors = {
        "caldera": (-3.95 + dx_boiler, -0.88, 2.74 + dz_boiler),
        "camisa": (-2.28, -0.45, 2.55 + dz_cyl),
        "cilindre": (-1.18, -0.42, 3.02 + dz_cyl),
        "piston": (-1.68, -0.48, piston_base_z + 3.60 * math.sin(g_balanci.rotation_euler[1])),
        "equilibri": (-0.77 + dx_eq, -0.22, 2.58 + dz_cyl),
        "condensador": (0.02, -0.36, 1.30 + dz_cond),
        "bomba": (0.76, -0.28, 1.40 + dz_airp),
        "balanci": (0.85, -0.22, pivot_z + 0.16),
        "bombamina": (4.45, -0.28, 1.35 + dz_pump),
    }
    return anchors


def render_image(out_path, res_x=1440, res_y=880, samples=48, file_format="PNG"):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 6
    scene.render.film_transparent = True
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


def render_detail_plate(out_path):
    """Pla proper dedicat: cilindre calent (amb camisa) + condensador fred amb gotes."""
    cam = bpy.context.scene.camera
    cam.location = Vector((0.35, -7.8, 3.35))
    target = Vector((-0.85, 0.0, 2.08))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.data.lens = 62.0
    render_image(out_path, res_x=960, res_y=600, samples=28, file_format="PNG")


def _root_name(obj):
    while obj.parent:
        obj = obj.parent
    return obj.name


def _obj_part_key(obj):
    rn = _root_name(obj)
    nm = obj.name
    if rn in ("Fogar", "Caldera"):
        return "caldera"
    if rn == "Cilindre":
        if nm in ("CamisaVapor", "VaporCamisaAnular", "CilindreBridaInf", "CilindreBridaSup"):
            return "camisa"
        return "cilindre"
    if rn in ("BancadaCilindre", "VaporDalt", "VaporBaix"):
        return "cilindre"
    if rn == "Piston":
        return "piston"
    if rn in ("Equilibri", "ManetaAdmissio", "ManetaEquilibri", "ManetaEscapament"):
        return "equilibri"
    if rn in ("TinaCondensador", "Condensador"):
        return "condensador"
    if rn in ("BombaAire", "BombaAireTija"):
        return "bomba"
    if rn in ("PilarCentral", "Balanci"):
        return "balanci"
    if rn in ("BombaMina", "BombaTija") or (rn == "Base" and nm != "PeanyaPedra"):
        return "bombamina"
    return None


def render_focus_masks(exploded):
    """Renderitza màscares WebP per destacar cada peça individualment sobre la làmina."""
    focus_dir = os.path.join(OUT_DIR, "focus")
    os.makedirs(focus_dir, exist_ok=True)
    prefix = "explotada" if exploded else "muntada"
    scene = bpy.context.scene
    meshes = [o for o in scene.objects if o.type == "MESH"]
    shadow_pl = bpy.data.objects.get("SombraTerra")
    if shadow_pl:
        shadow_pl.hide_render = True

    keys = ("caldera", "camisa", "cilindre", "piston", "equilibri", "condensador", "bomba", "balanci", "bombamina")
    for k in keys:
        for o in meshes:
            if o.name == "SombraTerra":
                continue
            o.hide_render = (_obj_part_key(o) != k)
        out_p = os.path.join(focus_dir, f"{prefix}-{k}.webp")
        render_image(out_p, res_x=840, res_y=513, samples=10, file_format="WEBP")

    for o in meshes:
        o.hide_render = False


def project_anchors(anchors):
    scene = bpy.context.scene
    cam = scene.camera
    res = {}
    for k, pt in anchors.items():
        co = world_to_camera_view(scene, cam, Vector(pt))
        res[k] = [round(co.x * 100, 1), round((1.0 - co.y) * 100, 1)]
    return res


def project_flow_paths():
    """Projecta les trajectòries exactes de vapor calent, equilibri i escapament a 1440x880."""
    scene = bpy.context.scene
    cam = scene.camera
    W, H = 1440.0, 880.0

    def proj_list(pts):
        out = []
        for pt in pts:
            co = world_to_camera_view(scene, cam, Vector(pt))
            out.append([round(co.x * W, 1), round((1.0 - co.y) * H, 1)])
        return out

    return {
        "hot_in": proj_list([(-3.95, 0.0, 3.85), (-3.95, 0.0, 4.18), (-2.79, 0.0, 4.18), (-2.42, 0.0, 3.74)]),
        "eq_bypass": proj_list([(-1.08, -0.15, 3.55), (-0.64, -0.15, 3.55), (-0.64, -0.15, 1.75), (-1.08, -0.15, 1.75)]),
        "cold_out": proj_list([(-1.05, 0.0, 2.02), (-0.42, 0.0, 2.02), (-0.42, 0.0, 1.76), (0.02, 0.0, 1.76)]),
    }


def anchors_to_gltf_3d(anchors):
    """Converteix (x, y, z) Z-up de Blender a (x, z, -y) Y-up de glTF / <model-viewer>."""
    return {k: [round(pt[0], 3), round(pt[2], 3), round(-pt[1], 3)] for k, pt in anchors.items()}


def main():
    glb_only = "--glb-only" in sys.argv
    with_focus = "--no-focus" not in sys.argv
    if not glb_only:
        anc_m = build_watt_scene(exploded=False, animate=False)
        render_image(os.path.join(OUT_DIR, "watt-muntada.png"))
        pts_m = project_anchors(anc_m)
        flow_m = project_flow_paths()
        if with_focus:
            render_focus_masks(exploded=False)
        render_detail_plate(os.path.join(OUT_DIR, "watt-detall.png"))

        anc_e = build_watt_scene(exploded=True, animate=False)
        render_image(os.path.join(OUT_DIR, "watt-explotada.png"))
        pts_e = project_anchors(anc_e)
        if with_focus:
            render_focus_masks(exploded=True)

    anc_glb = build_watt_scene(exploded=False, animate=True)
    glb_path = os.path.join(MODELS_DIR, "watt.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format="GLB",
        export_animations=True,
        export_animation_mode="SCENE",
        export_anim_scene_split_object=False,
        export_yup=True,
    )

    if not glb_only:
        meta = {
            "muntada_pct": pts_m,
            "explotada_pct": pts_e,
            "flow_muntada": flow_m,
            "hotspots_3d": anchors_to_gltf_3d(anc_glb),
            "glb_bytes": os.path.getsize(glb_path),
        }
        with open(os.path.join(OUT_DIR, "watt_meta.json"), "w", encoding="utf-8") as fh:
            json.dump(meta, fh, indent=2)
        print("WATT_3D_OK", json.dumps(meta))
    else:
        print("WATT_GLB_OK", os.path.getsize(glb_path))


if __name__ == "__main__":
    main()

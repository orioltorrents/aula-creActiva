# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Comparativa i mecanisme d'hèlix marina vs. roda de pales
(inspirada en la prova HMS Rattler vs HMS Alecto, 1845):
popes corbades de roure seccionades, caixa d'engranatges multiplicadors,
arbre portahèlix, caixa d'estopa i hèlix de bronze de 4 pales helicoïdals reals
enfrontada a la roda de pales amb cable catenari sobre aigua ondulada translúcida.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bmesh
import bpy

from pbr_comu import (
    add_empty,
    add_shadow_floor,
    apply_box_uv,
    build_pbr_pair,
    clear_scene,
    export_glb_and_meta,
    link_obj,
    make_box,
    make_curve_tube,
    make_cyl,
    make_gear,
    make_helical_blade,
    make_mat,
    make_rivet_ring,
    make_rod_between,
    make_sphere,
    make_torus,
    project_anchors,
    render_closeup,
    render_image,
    set_linear_fcurves,
    set_smooth,
    setup_lighting,
)


def make_wavy_water_top(name, size_x, size_y, z_level, mat):
    """Làmina d'aigua translúcida amb ondulació subtil per mostrar el reflex marí."""
    bm = bmesh.new()
    nx, ny = 42, 18
    grid = []
    for ix in range(nx + 1):
        x = (ix / nx - 0.5) * size_x
        row = []
        for iy in range(ny + 1):
            y = (iy / ny - 0.5) * size_y
            z = z_level + 0.022 * math.sin(x * 3.2 + y * 1.4) + 0.012 * math.cos(x * 6.5 - y * 3.8)
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for ix in range(nx):
        for iy in range(ny):
            bm.faces.new((grid[ix][iy], grid[ix + 1][iy], grid[ix + 1][iy + 1], grid[ix][iy + 1]))
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    obj.data.materials.append(mat)
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=0.5)
    set_smooth(obj)
    return obj


def make_curved_stern_cutaway(pfx, x_stern, direction, m_hull, m_deck, m_copper_sheath, m_iron):
    """
    Construeix una popa corbada seccionada pel davant (-Y obert) amb quadernes, obra viva coure,
    aleta de codast i mirall de popa per al vaixell (-1=Rattler a x<0, +1=Alecto a x>0).
    """
    # Seccions transversals al llarg de X cap a fora des del codast (u=0 a popa -> u=1 cap al cos central)
    bm = bmesh.new()
    nu = 14
    y_back = 0.72
    ribs_x = []
    out_grids = []
    in_grids = []
    length = 2.35
    for iu in range(nu + 1):
        u = iu / nu
        x = x_stern - direction * (u * length)
        half_w = 0.14 + 0.58 * (u ** 0.58)
        z_keel = 0.30 + 0.08 * (1.0 - u)
        z_sheer = 1.62 - 0.06 * math.sin(u * math.pi * 0.7)
        if iu % 3 == 1:
            ribs_x.append((x, half_w, z_keel, z_sheer))
        # Perfil de parets posteriors (+Y sencer) + fons corbat fins a y = -0.18
        prof = [
            (-0.18, z_keel + 0.04),
            (0.0, z_keel),
            (half_w * 0.58, z_keel + 0.10),
            (half_w * 0.94, 0.76),
            (half_w, 1.24),
            (half_w * 0.96, z_sheer),
        ]
        row_o, row_i = [], []
        for py, pz in prof:
            row_o.append(bm.verts.new((x, py, pz)))
            row_i.append(bm.verts.new((x, max(-0.16, py - 0.08), pz + 0.07)))
        out_grids.append(row_o)
        in_grids.append(row_i)

    np = len(out_grids[0])
    for iu in range(nu):
        for ip in range(np - 1):
            v1, v2, v3, v4 = out_grids[iu][ip], out_grids[iu + 1][ip], out_grids[iu + 1][ip + 1], out_grids[iu][ip + 1]
            if direction < 0:
                bm.faces.new((v1, v2, v3, v4))
            else:
                bm.faces.new((v4, v3, v2, v1))
            i1, i2, i3, i4 = in_grids[iu][ip], in_grids[iu + 1][ip], in_grids[iu + 1][ip + 1], in_grids[iu][ip + 1]
            if direction < 0:
                bm.faces.new((i4, i3, i2, i1))
            else:
                bm.faces.new((i1, i2, i3, i4))
        # Tapa del tall frontal inferior i borda superior
        bm.faces.new((out_grids[iu][0], out_grids[iu + 1][0], in_grids[iu + 1][0], in_grids[iu][0]))
        bm.faces.new((in_grids[iu][-1], in_grids[iu + 1][-1], out_grids[iu + 1][-1], out_grids[iu][-1]))

    # Tancament del mamparo d'extrem (u=1) i mirall de popa (u=0)
    for idx in (0, nu):
        for ip in range(np - 1):
            if (idx == 0 and direction < 0) or (idx == nu and direction > 0):
                bm.faces.new((out_grids[idx][ip], out_grids[idx][ip + 1], in_grids[idx][ip + 1], in_grids[idx][ip]))
            else:
                bm.faces.new((in_grids[idx][ip], in_grids[idx][ip + 1], out_grids[idx][ip + 1], out_grids[idx][ip]))

    mesh = bpy.data.meshes.new(f"{pfx}_Buc_Mesh")
    obj = bpy.data.objects.new(f"{pfx}_Buc", mesh)
    link_obj(obj)
    obj.data.materials.append(m_hull)
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=0.6)
    set_smooth(obj)

    # Quadernes internes, coberta inclinada i amurada
    for qi, (qx, qw, qzk, qzs) in enumerate(ribs_x):
        make_box(f"{pfx}_Quad_{qi}", (0.075, qw * 0.92, 0.08), (qx, qw * 0.42, qzk + 0.08), m_deck, bevel=0.005)
        make_box(f"{pfx}_QuadV_{qi}", (0.075, 0.08, qzs - qzk - 0.15), (qx, qw * 0.86, (qzs + qzk) * 0.5), m_deck, bevel=0.005)
    make_box(f"{pfx}_Coberta", (length * 0.98, 0.68, 0.09), (x_stern - direction * (length * 0.50), 0.34, 1.59), m_deck, bevel=0.01)
    make_box(f"{pfx}_Amurada", (length * 0.96, 0.08, 0.22), (x_stern - direction * (length * 0.50), 0.66, 1.72), m_hull, bevel=0.008)
    make_box(f"{pfx}_Codast", (0.14, 0.16, 1.24), (x_stern, 0.0, 0.98), m_hull, bevel=0.01)
    # Folre de coure a l'obra viva inferior
    make_box(f"{pfx}_QuillaCoure", (length * 0.95, 0.20, 0.12), (x_stern - direction * (length * 0.50), 0.02, 0.29), m_copper_sheath, bevel=0.01)


def make_propeller(name, radius, loc, mat_bronze, parent=None):
    """Hèlix naval Smith de bronze amb 4 pales helicoïdals torçades reals."""
    root = add_empty(name, loc, parent=parent)
    make_cyl(f"{name}_Boixa", radius * 0.23, radius * 0.48, (0, 0, 0), mat_bronze, rot=(0, math.pi / 2, 0), parent=root, bevel=0.006)
    make_sphere(f"{name}_Ogiva", radius * 0.21, (-radius * 0.24, 0, 0), mat_bronze, parent=root)
    for i in range(4):
        ang = i * (math.pi * 0.5)
        make_helical_blade(
            f"{name}_Pala_{i}",
            r_hub=radius * 0.18,
            r_tip=radius,
            pitch_in_deg=42.0,
            pitch_out_deg=24.0,
            arc_deg=52.0,
            thickness=0.022,
            mat=mat_bronze,
            segs_r=8,
            segs_u=10,
            loc=(0.0, 0.0, 0.0),
            rot=(ang, 0.0, 0.0),
            parent=root,
        )
    return root


def build_helix(animate=True):
    clear_scene()

    p_wood = build_pbr_pair("WoodHlx", "wood_dark", 512, 512, bump_scale=1.9)
    p_iron = build_pbr_pair("IronHlx", "castiron", 512, 512, bump_scale=2.1)
    p_brass = build_pbr_pair("BrassHlx", "brass", 512, 512, bump_scale=1.2)
    p_copper = build_pbr_pair("CopperHlx", "copper", 512, 512, bump_scale=1.4)
    p_stone = build_pbr_pair("StoneHlx", "stone", 512, 512, bump_scale=1.8)

    m_hull = make_mat("BucRoure", "#3e2718", metallic=0.0, roughness=0.72, pbr_pair=p_wood)
    m_deck = make_mat("CobertaHlx", "#9c7648", metallic=0.0, roughness=0.68, pbr_pair=p_wood)
    m_iron = make_mat("FerroFosa", "#2a2f35", metallic=0.84, roughness=0.45, pbr_pair=p_iron)
    m_steel = make_mat("AcerPolit", "#c4ccd4", metallic=0.95, roughness=0.19)
    m_brass = make_mat("BronzeHelix", "#cf9c38", metallic=0.92, roughness=0.22, pbr_pair=p_brass)
    m_copper = make_mat("CoureObraViva", "#9c5636", metallic=0.84, roughness=0.36, pbr_pair=p_copper)
    m_rope = make_mat("CableTraccio", "#9b855b", metallic=0.0, roughness=0.86, pbr_pair=p_stone)
    m_water = make_mat("AiguaMar", "#1d6b99", metallic=0.0, roughness=0.14, alpha=0.42)
    m_wake = make_mat("EstelaAigua", "#c4ebfc", metallic=0.0, roughness=0.35, alpha=0.52)

    add_shadow_floor(z=0.0, size=16.0)

    # Tanc comparatiu d'aigua translúcid amb superfície ondulada
    make_box("BaseAiguaFons", (6.90, 2.50, 0.10), (0.0, 0.0, 0.05), m_iron, bevel=0.015)
    make_box("VolumAigua", (6.76, 2.34, 0.90), (0.0, 0.0, 0.54), m_water, bevel=0.015)
    make_wavy_water_top("SuperficieMar", 6.76, 2.34, 0.99, m_water)

    # 1. COSTAT ESQUERRE: HMS RATTLER (POPA CORBADA SECCIONADA + OBERTTURA D'HÈLIX)
    make_curved_stern_cutaway("Rattler", -0.82, 1.0, m_hull, m_deck, m_copper, m_iron)
    # Timó articulat darrere el marc de l'hèlix
    make_box("RattlerMarcPost", (0.12, 0.14, 1.18), (-0.42, 0.0, 0.88), m_hull, bevel=0.008)
    make_box("RattlerTimo", (0.28, 0.065, 0.88), (-0.24, 0.0, 0.78), m_hull, bevel=0.008)

    # Motor de dos cilindres oscil·lants + multiplicador d'engranatges + arbre portahèlix submergit
    for cx_m in (-2.55, -2.26):
        make_cyl(f"CilRattler_{cx_m:.2f}", 0.16, 0.56, (cx_m, 0.10, 1.12), m_iron, bevel=0.008)
    make_cyl("XemRattler", 0.11, 0.88, (-2.42, 0.28, 2.08), m_iron)
    make_cyl("AnellXemR", 0.12, 0.05, (-2.42, 0.28, 2.48), m_brass)
    make_cyl("CoixinetArbre", 0.10, 0.22, (-1.85, 0.0, 0.56), m_brass, rot=(0, math.pi / 2, 0))
    make_cyl("CaixaEstopaPopa", 0.11, 0.20, (-1.04, 0.0, 0.56), m_brass, rot=(0, math.pi / 2, 0))
    g_gear_drv = add_empty("EngranatgeGranRG", (-2.05, 0.0, 0.96))
    make_gear("EngranatgeGranR", 0.27, 0.06, 22, (0, 0, 0), m_iron, m_brass, axis="X", parent=g_gear_drv)
    g_gear_pin = add_empty("PinyoHelixG", (-2.05, 0.0, 0.56))
    make_gear("PinyoHelix", 0.13, 0.07, 11, (0, 0, 0), m_brass, axis="X", parent=g_gear_pin)

    g_shaft_h = add_empty("ArbreHelix", (-1.15, 0.0, 0.56))
    make_cyl("ArbreH", 0.048, 1.62, (-0.20, 0.0, 0.0), m_steel, rot=(0, math.pi / 2, 0), parent=g_shaft_h)
    make_propeller("HelixBronze", 0.42, (0.54, 0.0, 0.0), m_brass, parent=g_shaft_h)

    g_wake_h = add_empty("EstelaHelix", (-0.52, 0.0, 0.56))
    for i, (wx, wr) in enumerate([(0.0, 0.16), (0.18, 0.23), (0.38, 0.28)]):
        make_torus(f"OnaH_{i}", wr, 0.022, (wx, 0.0, 0.0), m_wake, rot=(0, math.pi / 2, 0), parent=g_wake_h)

    # 2. CABLE CATENARI DE TRACCIÓ ENTRE POPES (duel de remolc 1845)
    pts_c = [(-0.82, 0.0, 1.64), (-0.42, 0.0, 1.56), (0.0, 0.0, 1.53), (0.42, 0.0, 1.56), (0.82, 0.0, 1.64)]
    make_curve_tube("CableDuel", pts_c, 0.024, m_rope)
    make_cyl("BitaRattler", 0.065, 0.20, (-0.82, 0.0, 1.68), m_iron)
    make_cyl("BitaAlecto", 0.065, 0.20, (0.82, 0.0, 1.68), m_iron)

    # 3. COSTAT DRET: HMS ALECTO (POPA CORBADA SECCIONADA I RODA DE PALES LATERAL)
    make_curved_stern_cutaway("Alecto", 0.82, -1.0, m_hull, m_deck, m_copper, m_iron)
    make_box("AlectoTimo", (0.28, 0.065, 0.88), (0.54, 0.0, 0.78), m_hull, bevel=0.008)
    make_cyl("MotorAlecto", 0.22, 0.56, (2.25, 0.14, 1.04), m_iron, bevel=0.008)
    make_cyl("XemAlecto", 0.11, 0.88, (2.35, 0.28, 2.08), m_iron)
    make_cyl("AnellXemA", 0.12, 0.05, (2.35, 0.28, 2.48), m_brass)

    g_paddles = add_empty("RodaPalesAlecto", (1.95, -0.56, 1.32))
    make_cyl("EixPalesAl", 0.045, 0.72, (0, 0.34, 0), m_steel, rot=(math.pi / 2, 0, 0), parent=g_paddles)
    r_pal = 0.74
    make_torus("CercolAl1", r_pal, 0.018, (0, -0.10, 0), m_iron, rot=(math.pi / 2, 0, 0), parent=g_paddles)
    make_torus("CercolAl2", r_pal, 0.018, (0, 0.10, 0), m_iron, rot=(math.pi / 2, 0, 0), parent=g_paddles)
    for k in range(10):
        a = 2.0 * math.pi * k / 10
        ca, sa = math.cos(a), math.sin(a)
        make_rod_between(f"RaigAl_{k}", (0, 0, 0), (r_pal * ca, 0, r_pal * sa), 0.016, m_iron, parent=g_paddles)
        make_box(
            f"PalaAl_{k}",
            (0.028, 0.28, 0.16),
            (r_pal * 0.94 * ca, 0.0, r_pal * 0.94 * sa),
            m_deck,
            rot=(0, -a, 0),
            parent=g_paddles,
            bevel=0.004,
        )

    def apply_pose(p):
        theta = 2.0 * math.pi * p
        g_gear_drv.rotation_euler = (theta, 0.0, 0.0)
        g_gear_pin.rotation_euler = (-2.0 * theta, 0.0, 0.0)
        g_shaft_h.rotation_euler = (-2.0 * theta, 0.0, 0.0)
        g_paddles.rotation_euler = (0.0, -theta, 0.0)
        s = 0.85 + 0.22 * math.sin(theta * 2.0)
        g_wake_h.scale = (s, s, s)

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        anim_objs = [g_gear_drv, g_gear_pin, g_shaft_h, g_paddles, g_wake_h]
        for fr in range(1, 61):
            p = (fr - 1) / 60.0
            apply_pose(p)
            for o in anim_objs:
                o.keyframe_insert(data_path="rotation_euler", frame=fr)
                o.keyframe_insert(data_path="scale", frame=fr)
        set_linear_fcurves(anim_objs)
        scene.frame_set(12)
    else:
        apply_pose(0.20)

    cam_loc = (-2.10, -7.15, 2.95)
    target = (0.0, 0.05, 0.98)
    setup_lighting(cam_loc, target, lens=42.0, mood="workshop")

    anchors = {
        "rattler": (-0.64, 0.0, 0.68),
        "arbre": (-1.55, 0.0, 0.60),
        "motor": (-2.15, 0.0, 1.05),
        "cable": (0.0, 0.0, 1.56),
        "alecto": (1.95, -0.60, 1.32),
    }

    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
    render_image(os.path.join(out_dir, "helix-muntada.png"), res_x=1200, res_y=760, samples=32)
    render_closeup(os.path.join(out_dir, "helix-detall.png"), (-1.45, -2.55, 1.18), (-0.78, 0.0, 0.62), lens=48.0, samples=28)

    proj = project_anchors(anchors)
    export_glb_and_meta("helix", "helix.glb", anchors, extra_meta={"proj_2d": proj})


if __name__ == "__main__":
    build_helix(animate=True)

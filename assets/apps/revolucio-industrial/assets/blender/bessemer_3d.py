# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Convertidor Bessemer en secció frontal (Henry Bessemer, 1856):
castells de fosa amb eix basculant, corona i volant de basculament,
recipient en forma de pera suau i reblada amb folre refractari de maó,
caixa de vent i 7 toveres inferiors, bany d'acer incandescent, plomall turbulent
de flama orgànica i cullera de colada sobre carro amb lingoteres.
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
    make_cone,
    make_curve_tube,
    make_cutaway_cyl,
    make_cyl,
    make_gear,
    make_mat,
    make_rivet_ring,
    make_smoke_plume,
    make_spoked_wheel,
    make_worker,
    project_anchors,
    render_closeup,
    render_image,
    set_linear_fcurves,
    set_smooth,
    set_worker_pose,
    setup_lighting,
)


def make_pear_vessel(name, mat_shell, mat_lining, parent=None):
    """Recipient en forma de pera suau d'acer reblat i folre refractari seccionat (-Y)."""
    profile = [
        (-1.05, 0.34, 0.50),
        (-0.96, 0.48, 0.64),
        (-0.80, 0.58, 0.74),
        (-0.52, 0.62, 0.78),
        (-0.20, 0.63, 0.79),
        (0.14, 0.59, 0.74),
        (0.45, 0.50, 0.64),
        (0.72, 0.38, 0.50),
        (0.95, 0.28, 0.39),
        (1.16, 0.24, 0.34),
        (1.24, 0.25, 0.36),
    ]
    start_a, end_a = -0.04 * math.pi, 1.16 * math.pi
    n_seg = 44

    def build_revolved(sfx, r_idx_in, r_idx_out, mat):
        mesh = bpy.data.meshes.new(f"{name}_{sfx}_Mesh")
        obj = bpy.data.objects.new(f"{name}_{sfx}", mesh)
        link_obj(obj)
        obj.data.materials.append(mat)
        if parent:
            obj.parent = parent

        bm = bmesh.new()
        rings_in, rings_out = [], []
        for z_p, r_i, r_o in profile:
            ri = r_i if r_idx_in == 1 else r_o
            ro = r_o if r_idx_out == 2 else (r_o + 0.042)
            rin, rout = [], []
            for j in range(n_seg + 1):
                a = start_a + (end_a - start_a) * (j / n_seg)
                ca, sa = math.cos(a), math.sin(a)
                rin.append(bm.verts.new((ri * ca, ri * sa, z_p)))
                rout.append(bm.verts.new((ro * ca, ro * sa, z_p)))
            rings_in.append(rin)
            rings_out.append(rout)

        nr = len(profile)
        for k in range(nr - 1):
            for j in range(n_seg):
                bm.faces.new((rings_out[k][j], rings_out[k][j + 1], rings_out[k + 1][j + 1], rings_out[k + 1][j]))
                bm.faces.new((rings_in[k][j + 1], rings_in[k][j], rings_in[k + 1][j], rings_in[k + 1][j + 1]))
        for j in range(n_seg):
            bm.faces.new((rings_out[-1][j], rings_out[-1][j + 1], rings_in[-1][j + 1], rings_in[-1][j]))
            bm.faces.new((rings_in[0][j], rings_in[0][j + 1], rings_out[0][j + 1], rings_out[0][j]))
        for k in range(nr - 1):
            bm.faces.new((rings_in[k][0], rings_out[k][0], rings_out[k + 1][0], rings_in[k + 1][0]))
            bm.faces.new((rings_out[k][-1], rings_in[k][-1], rings_in[k + 1][-1], rings_out[k + 1][-1]))

        bm.normal_update()
        bm.to_mesh(mesh)
        bm.free()
        apply_box_uv(obj, uv_scale=0.6)
        set_smooth(obj)
        return obj

    build_revolved("Refractari", 1, 2, mat_lining)
    build_revolved("CarcassaAcer", 2, 3, mat_shell)


def build_bessemer(animate=True):
    clear_scene()

    p_stone = build_pbr_pair("StoneBes", "stone", 512, 512, bump_scale=2.4)
    p_brick = build_pbr_pair("BrickBes", "brick", 512, 512, bump_scale=2.2)
    p_iron = build_pbr_pair("IronBes", "castiron", 512, 512, bump_scale=2.1)

    m_stone = make_mat("FossatPedra", "#8e8473", metallic=0.0, roughness=0.90, pbr_pair=p_stone)
    m_brick = make_mat("FolreRefractari", "#a4593d", metallic=0.0, roughness=0.86, pbr_pair=p_brick)
    m_iron = make_mat("FerroFosa", "#272b30", metallic=0.86, roughness=0.42, pbr_pair=p_iron)
    m_steel = make_mat("AcerCarcassa", "#4d5660", metallic=0.88, roughness=0.34, pbr_pair=p_iron)
    m_brass = make_mat("LlautóValv", "#d2a23d", metallic=0.92, roughness=0.25)
    m_molten = make_mat("AcerLiquid", "#ff6218", metallic=0.15, roughness=0.30, emission_hex="#ff4406", emission_strength=4.0)
    m_flame = make_mat("FlamaBessemer", "#ffae38", metallic=0.0, roughness=0.35, alpha=0.66, emission_hex="#ff8811", emission_strength=3.6)
    m_air = make_mat("AireBufat", "#86ccf2", metallic=0.0, roughness=0.25, alpha=0.46, emission_hex="#5ab5e6", emission_strength=0.45)

    add_shadow_floor(z=0.0, size=14.0)

    # 1. BASE I CASTELLS DE SUPORT AMB VOLANT DE MANIOBRA
    make_box("BaseTaller", (5.40, 2.50, 0.24), (0.0, 0.0, 0.12), m_stone, bevel=0.02)
    piv_z = 1.98
    for sx in (-1.18, 1.18):
        make_box(f"PeuSuport_{sx:.2f}", (0.36, 0.94, 0.24), (sx, 0.0, 0.36), m_iron, bevel=0.01)
        make_box(f"ColumnaSuport_{sx:.2f}", (0.26, 0.44, 1.66), (sx, 0.0, 1.25), m_iron, bevel=0.012)
        make_cyl(f"CoixinetMunyo_{sx:.2f}", 0.17, 0.28, (sx, 0.0, piv_z), m_brass, rot=(0, math.pi / 2, 0))

    make_curve_tube("CanonadaAire", [(2.15, 0.0, 0.45), (1.58, 0.0, 0.55), (1.58, 0.0, piv_z), (1.18, 0.0, piv_z)], 0.095, m_steel)
    make_cyl("BridaAire", 0.15, 0.05, (1.58, 0.0, 1.25), m_brass)

    g_gear_tilt = add_empty("CoronaBasculamentG", (-0.98, 0.0, piv_z))
    make_gear("CoronaBasculament", 0.34, 0.09, 24, (0, 0, 0), m_iron, m_brass, axis="X", parent=g_gear_tilt)
    make_gear("PinyoBasculament", 0.14, 0.09, 10, (-0.98, -0.35, piv_z - 0.32), m_brass, axis="X")
    make_spoked_wheel("VolantManiobra", 0.32, 0.04, 6, (-1.36, -0.35, piv_z - 0.32), m_iron, m_brass, axis="X")

    # 2. GRUP BASCULANT DEL CONVERTIDOR BESSEMER
    g_conv = add_empty("ConvertidorBessemer", (0.0, 0.0, piv_z))
    make_cutaway_cyl("CinturoMunyo", 0.79, 0.87, 0.28, (0, 0, 0), m_iron, start_ang=-0.04 * math.pi, end_ang=1.16 * math.pi, segs=44, parent=g_conv)
    make_rivet_ring("ReblonsCinturo", (0, 0, 0.08), 0.875, 22, rivet_r=0.010, axis="Z", mat=m_steel, parent=g_conv)
    make_rivet_ring("ReblonsVent", (0, 0, -0.78), 0.785, 20, rivet_r=0.010, axis="Z", mat=m_steel, parent=g_conv)
    make_cyl("MunyoEsq", 0.14, 0.46, (-1.00, 0, 0), m_steel, rot=(0, math.pi / 2, 0), parent=g_conv)
    make_cyl("MunyoDret", 0.14, 0.46, (1.00, 0, 0), m_steel, rot=(0, math.pi / 2, 0), parent=g_conv)

    make_pear_vessel("Pera", m_steel, m_brick, parent=g_conv)
    make_curve_tube("TubVentExt", [(0.86, 0.0, 0.0), (0.98, 0.0, -0.58), (0.62, 0.0, -1.16), (0.18, 0.0, -1.16)], 0.068, m_steel, parent=g_conv)

    make_cutaway_cyl("CaixaVent", 0.32, 0.44, 0.20, (0, 0, -1.16), m_iron, start_ang=-0.04 * math.pi, end_ang=1.16 * math.pi, segs=32, parent=g_conv)
    make_cutaway_cyl("FonsToveres", 0.02, 0.38, 0.14, (0, 0, -0.98), m_brick, start_ang=-0.04 * math.pi, end_ang=1.16 * math.pi, segs=32, parent=g_conv)
    g_raigs_aire = add_empty("RaigsToveres", (0, 0, -0.92), parent=g_conv)
    for tx, ty in [(-0.20, 0.05), (0.0, 0.02), (0.20, 0.05), (-0.11, 0.18), (0.11, 0.18), (0.0, 0.24)]:
        make_cyl(f"Tovera_{tx:.2f}_{ty:.2f}", 0.024, 0.22, (tx, ty, -0.06), m_brass, parent=g_raigs_aire)
        make_cone(f"Vent_{tx:.2f}_{ty:.2f}", 0.018, 0.052, 0.48, (tx, ty, 0.27), m_air, parent=g_raigs_aire)

    # Bany d'acer incandescent amb superfície cilíndrica gruixuda
    make_cutaway_cyl("BanyConvertidor", 0.02, 0.58, 0.52, (0, 0, -0.56), m_molten, start_ang=-0.02 * math.pi, end_ang=1.12 * math.pi, segs=36, parent=g_conv)

    # Plomall turbulent orgànic de flama sortint per la boca superior
    g_flama = add_empty("FlamaBoca", (0, 0, 1.24), parent=g_conv)
    make_smoke_plume("PlomallFlamaBes", (0.0, 0.0, 0.0), 1.05, 0.04, 0.0, 0.24, m_flame, wisps=18, seed=77, parent=g_flama, flare=0.45)

    # 3. CULLERA DE COLADA, LINGOTERES DE FOSA I OPERARI
    cull_x, cull_z = -1.68, 0.62
    make_box("CarroCullera", (0.92, 0.92, 0.12), (cull_x, -0.25, 0.30), m_iron, bevel=0.01)
    make_cutaway_cyl("CulleraCos", 0.30, 0.38, 0.58, (cull_x, -0.25, cull_z), m_iron, start_ang=-0.05 * math.pi, end_ang=1.18 * math.pi, segs=32)
    make_cyl("CulleraBase", 0.38, 0.08, (cull_x, -0.25, cull_z - 0.28), m_iron)
    make_cutaway_cyl("AcerCullera", 0.02, 0.29, 0.30, (cull_x, -0.25, cull_z - 0.08), m_molten, start_ang=-0.05 * math.pi, end_ang=1.18 * math.pi, segs=28)
    for ix in (-2.28, -2.02):
        make_cone(f"Lingotera_{ix:.2f}", 0.10, 0.07, 0.42, (ix, 0.45, 0.45), m_iron)

    g_colada = add_empty("RaigColada", (-1.38, -0.18, 1.05))
    make_cyl("RaigColadaCyl", 0.052, 0.88, (0, 0, 0), m_molten, rot=(0, 0.25, 0), parent=g_colada)

    worker_b = make_worker("OperariBessemer", (-1.78, -0.68, 0.24), facing_yaw=-math.pi * 0.45, scale=0.88, role="weaver")

    def apply_pose(p):
        if p < 0.62:
            tilt = 0.0
            flame_s = 0.85 + 0.35 * abs(math.sin(p * math.pi * 6.0))
            air_s = 1.0
            pour_s = 0.001
        elif p < 0.78:
            q = (p - 0.62) / 0.16
            sm = q * q * (3.0 - 2.0 * q)
            tilt = -1.78 * sm
            flame_s = max(0.001, 0.85 * (1.0 - sm))
            air_s = max(0.001, 1.0 - sm)
            pour_s = 1.0 if q > 0.75 else 0.001
        elif p < 0.88:
            tilt = -1.78
            flame_s = 0.001
            air_s = 0.001
            pour_s = 1.0
        else:
            q = (p - 0.88) / 0.12
            sm = q * q * (3.0 - 2.0 * q)
            tilt = -1.78 * (1.0 - sm)
            flame_s = 0.25 * sm
            air_s = sm
            pour_s = 0.001

        g_conv.rotation_euler = (0.0, tilt, 0.0)
        g_gear_tilt.rotation_euler = (0.0, tilt, 0.0)
        g_flama.scale = (1.0, 1.0, flame_s)
        g_raigs_aire.scale = (1.0, 1.0, air_s)
        g_colada.scale = (pour_s, pour_s, pour_s)
        set_worker_pose(
            worker_b,
            torso_rot=(0.06, 0.0, -0.18),
            head_rot=(-0.18, 0.0, -0.22),
            r_sh=(0.82, -0.10, -0.20),
            r_elb=(-0.55, 0.0, 0.0),
            l_sh=(0.45, 0.08, 0.15),
            l_elb=(-0.35, 0.0, 0.0),
        )

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        anim_objs = [g_conv, g_gear_tilt, g_flama, g_raigs_aire, g_colada]
        for fr in range(1, 61):
            p = (fr - 1) / 60.0
            apply_pose(p)
            for o in anim_objs:
                o.keyframe_insert(data_path="rotation_euler", frame=fr)
                o.keyframe_insert(data_path="scale", frame=fr)
        set_linear_fcurves(anim_objs)
        scene.frame_set(16)
    else:
        apply_pose(0.28)

    cam_loc = (-2.35, -6.95, 2.75)
    target = (-0.25, 0.0, 1.55)
    setup_lighting(cam_loc, target, lens=40.0, mood="workshop")

    anchors = {
        "convertidor": (0.0, -0.35, 1.85),
        "toveres": (0.0, -0.10, 0.92),
        "eix": (1.18, -0.15, piv_z),
        "cullera": (cull_x, -0.40, cull_z + 0.15),
    }

    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
    render_image(os.path.join(out_dir, "bessemer-muntada.png"), res_x=1200, res_y=760, samples=32)
    render_closeup(os.path.join(out_dir, "bessemer-detall.png"), (-0.65, -3.00, 1.65), (0.0, 0.0, 1.48), lens=48.0, samples=28)

    proj = project_anchors(anchors)
    export_glb_and_meta("bessemer", "bessemer.glb", anchors, extra_meta={"proj_2d": proj})


if __name__ == "__main__":
    build_bessemer(animate=True)

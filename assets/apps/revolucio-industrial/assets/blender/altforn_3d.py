# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Alt forn de coc en secció (model Coalbrookdale, segle XVIII):
terraplè esglaonat de pedra amb pont sobre cavalletes, via i vagoneta de mineral,
torre atalussada de pedra amb anells reblats i folre refractari de maó,
capes de càrrega irregulars de coc, mineral i calcària, màquina bufadora de volant,
tovera, gresol incandescent i llit de colada de lingots en sorra.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy

from pbr_comu import (
    add_empty,
    add_shadow_floor,
    build_pbr_pair,
    clear_scene,
    export_glb_and_meta,
    make_box,
    make_coal_pile,
    make_cone,
    make_curve_tube,
    make_cutaway_cyl,
    make_cyl,
    make_furrow_bed,
    make_mat,
    make_rivet_ring,
    make_rod_between,
    make_smoke_plume,
    make_spoked_wheel,
    make_torus,
    make_worker,
    project_anchors,
    render_closeup,
    render_image,
    set_linear_fcurves,
    set_worker_pose,
    setup_lighting,
)


def build_altforn(animate=True):
    clear_scene()

    p_stone = build_pbr_pair("StoneAlt", "stone", 512, 512, bump_scale=2.5)
    p_brick = build_pbr_pair("BrickAlt", "brick", 512, 512, bump_scale=2.3)
    p_iron = build_pbr_pair("IronAlt", "castiron", 512, 512, bump_scale=2.1)
    p_wood = build_pbr_pair("WoodAlt", "wood_dark", 512, 512, bump_scale=1.8)
    p_soil = build_pbr_pair("SoilAlt", "soil", 512, 512, bump_scale=2.0)

    m_stone = make_mat("PedraForn", "#8c806d", metallic=0.0, roughness=0.90, pbr_pair=p_stone, tex_scale=(1.8, 2.0))
    m_brick = make_mat("MaoRefractari", "#9c4731", metallic=0.0, roughness=0.86, pbr_pair=p_brick, tex_scale=(1.8, 2.0))
    m_iron = make_mat("FerroFosa", "#272c31", metallic=0.85, roughness=0.44, pbr_pair=p_iron)
    m_steel = make_mat("AcerPolit", "#bfc7cf", metallic=0.94, roughness=0.22)
    m_brass = make_mat("LlautóAlt", "#cf9d3b", metallic=0.90, roughness=0.26)
    m_wood = make_mat("FustaPont", "#6c4827", metallic=0.0, roughness=0.76, pbr_pair=p_wood)
    m_sand = make_mat("SorraColada", "#b69969", metallic=0.0, roughness=0.92, pbr_pair=p_soil, tex_scale=(2.4, 2.2))
    m_ore = make_mat("MineralFerro", "#7d3528", metallic=0.18, roughness=0.82)
    m_coke = make_mat("CocForn", "#1b1d20", metallic=0.08, roughness=0.88)
    m_lime = make_mat("Calcaria", "#cfc8b6", metallic=0.0, roughness=0.88)
    m_slag = make_mat("Escoria", "#c98b34", metallic=0.1, roughness=0.45, emission_hex="#e67e22", emission_strength=1.4)
    m_molten = make_mat("FerroLiquid", "#ff5e14", metallic=0.1, roughness=0.35, emission_hex="#ff4508", emission_strength=3.8)
    m_air = make_mat("FluxAire", "#79c0e6", metallic=0.0, roughness=0.3, alpha=0.45, emission_hex="#55a8d8", emission_strength=0.45)
    m_flame = make_mat("FlamaBoca", "#ff9642", metallic=0.0, roughness=0.4, alpha=0.52, emission_hex="#ff7020", emission_strength=2.2)

    add_shadow_floor(z=0.0, size=18.0)

    # 1. BASE DE PEDRA I MARGE ESGLAONAT DE CÀRREGA AMB PONT DE CAVALLETES I VAGONETA
    make_box("SocolBase", (6.90, 2.50, 0.22), (0.0, 0.15, 0.11), m_stone, bevel=0.02)
    # Terraplè esglaonat en contraforts (no pas un cub llis!)
    make_box("TerrapleBase", (1.65, 1.90, 0.92), (2.48, 0.35, 0.68), m_stone, bevel=0.03)
    make_box("TerrapleMig", (1.42, 1.62, 0.92), (2.56, 0.35, 1.56), m_stone, bevel=0.03)
    make_box("TerrapleAlt", (1.20, 1.38, 0.78), (2.64, 0.35, 2.38), m_stone, bevel=0.03)
    for px in (1.72, 2.06):
        make_box(f"Contrafort_{px:.2f}", (0.28, 1.55, 2.35), (px, 0.35, 1.35), m_stone, rot=(0, 0.12, 0), bevel=0.02)

    # Pont de fusta sobre cavalletes amb rails i barana de seguretat
    make_box("PontCarrega", (2.15, 0.66, 0.10), (1.35, 0.15, 2.74), m_wood, bevel=0.01)
    for bx in (0.98, 1.52):
        make_rod_between(f"CavalletA_{bx:.2f}", (bx, -0.10, 2.72), (bx + 0.28, -0.10, 1.82), 0.045, m_wood)
        make_rod_between(f"CavalletB_{bx:.2f}", (bx, 0.40, 2.72), (bx + 0.28, 0.40, 1.82), 0.045, m_wood)
    for ry in (-0.08, 0.36):
        make_box(f"RailPont_{ry:.2f}", (2.10, 0.03, 0.04), (1.38, ry, 2.81), m_iron)
    for py_r in (-0.16, 0.46):
        make_rod_between(f"BaranaPont_{py_r:.2f}", (0.62, py_r, 3.06), (2.38, py_r, 3.06), 0.014, m_iron)
        for px_r in (0.65, 1.25, 1.85, 2.35):
            make_cyl(f"PostBar_{py_r:.2f}_{px_r:.2f}", 0.014, 0.30, (px_r, py_r, 2.92), m_iron)

    # Vagoneta de càrrega reblada amb 4 rodes i munt de mineral real
    make_box("VagonetaCos", (0.52, 0.38, 0.26), (1.42, 0.14, 3.00), m_iron, bevel=0.008)
    for wx in (1.24, 1.60):
        for wy in (-0.08, 0.36):
            make_cyl(f"RodaVag_{wx:.2f}_{wy:.2f}", 0.075, 0.035, (wx, wy, 2.86), m_steel, rot=(math.pi / 2, 0, 0))
    make_coal_pile("CarregaVagoneta", (1.42, 0.14, 3.10), 0.22, 0.16, 0.14, m_ore, count=20, seed=5)
    worker_top = make_worker("CarregadorForn", (1.92, 0.14, 2.80), facing_yaw=math.pi * 0.5, scale=0.82, role="weaver")
    set_worker_pose(worker_top, torso_rot=(0.24, 0.0, 0.0), l_sh=(0.82, 0.0, 0.0), r_sh=(0.82, 0.0, 0.0))

    # 2. TORRE ATALUSSADA DE L'ALT FORN SECCIONADA (X = 0.0, Y = 0.20)
    fx, fy = 0.0, 0.20
    make_cutaway_cyl("TorreBaseExt", 0.72, 1.16, 0.92, (fx, fy, 0.68), m_stone, start_ang=-0.05 * math.pi, end_ang=1.18 * math.pi, segs=36)
    make_cutaway_cyl("TorreCosMitja", 0.64, 1.02, 1.10, (fx, fy, 1.66), m_stone, start_ang=-0.05 * math.pi, end_ang=1.18 * math.pi, segs=36)
    make_cutaway_cyl("TorreCosAlt", 0.52, 0.86, 0.72, (fx, fy, 2.54), m_stone, start_ang=-0.05 * math.pi, end_ang=1.18 * math.pi, segs=36)
    # Arcs de descarrega laterals a la base
    make_box("PilarFrontDret", (0.28, 0.34, 0.88), (0.94, -0.34, 0.66), m_stone, bevel=0.01)
    make_box("PilarFrontEsq", (0.28, 0.34, 0.88), (-0.94, -0.34, 0.66), m_stone, bevel=0.01)

    for rz, rr in [(1.18, 1.04), (1.82, 1.03), (2.36, 0.87), (2.82, 0.87)]:
        make_cutaway_cyl(f"TirantTorre_{rz:.2f}", rr - 0.02, rr + 0.02, 0.06, (fx, fy, rz), m_iron, start_ang=-0.05 * math.pi, end_ang=1.18 * math.pi, segs=36)
        make_rivet_ring(f"ReblonsTorre_{rz:.2f}", (fx, fy, rz), rr + 0.02, 18, rivet_r=0.009, axis="Z", mat=m_steel)

    # Folre refractari de maó + embut de càrrega superior
    make_cutaway_cyl("RefractariAlt", 0.42, 0.56, 1.38, (fx, fy, 2.22), m_brick, start_ang=-0.02 * math.pi, end_ang=1.12 * math.pi, segs=32)
    make_cutaway_cyl("RefractariVentre", 0.50, 0.68, 0.72, (fx, fy, 1.20), m_brick, start_ang=-0.02 * math.pi, end_ang=1.12 * math.pi, segs=32)
    make_cutaway_cyl("RefractariGresol", 0.34, 0.54, 0.65, (fx, fy, 0.56), m_brick, start_ang=-0.02 * math.pi, end_ang=1.12 * math.pi, segs=32)
    make_cutaway_cyl("BocaCarrega", 0.36, 0.68, 0.24, (fx, fy, 2.98), m_iron, start_ang=-0.05 * math.pi, end_ang=1.18 * math.pi, segs=32)
    make_cone("CampanaCarrega", 0.34, 0.06, 0.24, (fx, fy, 2.90), m_iron)

    # 3. CAPES DE CÀRREGA TEXTURADES (coc facetat, mineral i calcària), GRESOL I FLAMARADA ORGÀNICA
    layers_grp = add_empty("CapesCarrega", (fx, fy, 0.0))
    layer_specs = [
        (2.68, 0.36, m_ore, 11),
        (2.50, 0.37, m_coke, 13),
        (2.32, 0.38, m_lime, 15),
        (2.14, 0.39, m_ore, 17),
        (1.94, 0.41, m_coke, 19),
        (1.74, 0.43, m_ore, 21),
        (1.54, 0.45, m_coke, 23),
    ]
    for idx, (lz, lr, lm, sd) in enumerate(layer_specs):
        make_coal_pile(f"CapaCarb_{idx}", (0.0, 0.04, lz - 0.04), lr, lr * 0.85, 0.15, lm, count=18, seed=sd, parent=layers_grp)

    g_glow = add_empty("ZonaCalor", (fx, fy, 1.14))
    make_coal_pile("NucliBrasesForn", (0.0, 0.02, -0.10), 0.44, 0.38, 0.42, m_molten, count=26, seed=31, parent=g_glow)
    make_cutaway_cyl("FerroGresol", 0.02, 0.33, 0.36, (fx, fy, 0.46), m_molten, start_ang=-0.02 * math.pi, end_ang=1.08 * math.pi, segs=24)
    make_cutaway_cyl("EscoriaGresol", 0.02, 0.35, 0.12, (fx, fy, 0.70), m_slag, start_ang=-0.02 * math.pi, end_ang=1.08 * math.pi, segs=24)

    g_flama = add_empty("FlamaSuperior", (fx, fy, 3.08))
    make_smoke_plume("PlomallBoca", (0.0, 0.0, 0.0), 0.72, -0.18, 0.04, 0.22, m_flame, wisps=16, seed=41, parent=g_flama, flare=0.45)

    # 4. MÀQUINA BUFADORA AMB VOLANT I TOVERA
    bx = -2.25
    make_box("BaseBufadora", (1.25, 1.15, 0.35), (bx, 0.10, 0.38), m_stone, bevel=0.015)
    make_cutaway_cyl("CilindreBufador", 0.32, 0.38, 1.05, (bx, 0.10, 1.10), m_iron, start_ang=-0.10 * math.pi, end_ang=1.15 * math.pi, segs=32)
    make_cyl("TapaBufInf", 0.40, 0.06, (bx, 0.10, 0.56), m_iron)
    make_cyl("TapaBufSup", 0.40, 0.06, (bx, 0.10, 1.64), m_iron)
    g_vol_buf = add_empty("VolantBufadora", (bx - 0.56, 0.10, 1.88))
    make_spoked_wheel("RodaBuf", 0.44, 0.055, 8, (0, 0, 0), m_iron, m_brass, axis="Y", parent=g_vol_buf)
    make_rod_between("SuportVolBuf", (bx - 0.38, 0.10, 0.58), (bx - 0.52, 0.10, 1.88), 0.045, m_iron)

    g_buf_piston = add_empty("PistoBufador", (bx, 0.10, 1.05))
    make_cyl("DiscBuf", 0.30, 0.10, (0, 0, 0), m_steel, parent=g_buf_piston)
    make_cyl("TijaBuf", 0.04, 0.85, (0, 0, 0.42), m_steel, parent=g_buf_piston)

    make_curve_tube(
        "ConducteTovera",
        [(bx + 0.35, 0.10, 0.72), (-1.45, 0.10, 0.72), (-0.75, 0.10, 0.92), (-0.38, 0.15, 0.92)],
        0.075,
        m_iron,
    )
    make_cone("BroquetTovera", 0.085, 0.045, 0.24, (-0.36, 0.15, 0.92), m_steel, rot=(0, math.pi / 2, 0))
    g_vent = add_empty("RaigAireTovera", (-0.18, 0.15, 0.92))
    make_cone("ConAire", 0.025, 0.11, 0.28, (0.05, 0, 0), m_air, rot=(0, math.pi / 2, 0), parent=g_vent)

    # 5. LLIT DE SORRA ESCULPIT AMB MOTLLES DE LINGOTS ENCAIXATS
    make_furrow_bed("LlitSorra", (0.0, -0.78), 1.68, 1.12, 0.28, m_sand, furrows=4, amp=0.022, nx=32, ny=26, seed=71)
    g_sagnia = add_empty("RaigSagnia", (0.0, -0.25, 0.36))
    make_box("CanalMare", (0.12, 0.92, 0.045), (0.0, -0.42, -0.02), m_molten, parent=g_sagnia, bevel=0.008)
    for lx in (-0.48, -0.24, 0.24, 0.48):
        make_box(f"Lingot_{lx:.2f}", (0.11, 0.34, 0.045), (lx, -0.86, 0.33), m_molten, bevel=0.008)
    make_box("BrancCanal", (1.08, 0.09, 0.045), (0.0, -0.66, 0.33), m_molten, bevel=0.006)

    def apply_pose(p):
        theta = 2.0 * math.pi * p
        g_buf_piston.location = (bx, 0.10, 1.08 + 0.34 * math.sin(theta))
        g_vol_buf.rotation_euler = (0.0, theta, 0.0)
        air_k = 0.65 + 0.45 * max(0.0, -math.cos(theta))
        g_vent.scale = (air_k, 1.0, 1.0)
        g_glow.scale = (1.0, 1.0, 0.95 + 0.08 * math.sin(theta * 2.0))
        g_flama.location = (fx, fy, 3.08 + 0.06 * math.sin(theta * 3.0))
        layers_grp.location = (fx, fy, -0.02 * (p % 1.0))

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        anim_objs = [g_buf_piston, g_vol_buf, g_vent, g_glow, g_flama, layers_grp]
        for fr in range(1, 61):
            p = (fr - 1) / 60.0
            apply_pose(p)
            for o in anim_objs:
                o.keyframe_insert(data_path="location", frame=fr)
                o.keyframe_insert(data_path="rotation_euler", frame=fr)
                o.keyframe_insert(data_path="scale", frame=fr)
        set_linear_fcurves(anim_objs)
        scene.frame_set(16)
    else:
        apply_pose(0.25)

    cam_loc = (-2.65, -7.25, 2.95)
    target = (0.12, 0.05, 1.52)
    setup_lighting(cam_loc, target, lens=40.0, mood="workshop")

    anchors = {
        "carrega": (0.85, 0.05, 2.95),
        "cuba": (0.0, 0.02, 2.05),
        "bufadora": (bx, -0.10, 1.15),
        "toveres": (-0.55, 0.05, 0.92),
        "gresol": (0.0, -0.10, 0.56),
        "llit": (0.0, -0.82, 0.38),
    }

    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
    render_image(os.path.join(out_dir, "altforn-muntada.png"), res_x=1200, res_y=760, samples=32)
    render_closeup(os.path.join(out_dir, "altforn-detall.png"), (-0.75, -3.10, 1.15), (-0.10, -0.15, 0.75), lens=48.0, samples=28)

    proj = project_anchors(anchors)
    export_glb_and_meta("altforn", "altforn.glb", anchors, extra_meta={"proj_2d": proj})


if __name__ == "__main__":
    build_altforn(animate=True)

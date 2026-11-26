# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Constructor compartit per a les dues fàbriques tèxtils de 3 plantes (hidràulica i de vapor)
amb tall frontal complet, finestrals arquejats de fàbrica, columnes de fosa,
coberta amb lluerna, arbre vertical, eixos al sostre amb suports penjants i corretges de cuir,
màquines recognoscibles per planta (cardes amb velo blanc, water-frames amb bobines,
telers mecànics amb tela) i motor lateral detallat (roda hidràulica de catúfols o caldera reblada + màquina de vapor).
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
    make_curve_tube,
    make_cyl,
    make_gear,
    make_mat,
    make_rivet_ring,
    make_rod_between,
    make_smoke_plume,
    make_spoked_wheel,
    make_torus,
    project_anchors,
    render_closeup,
    render_image,
    set_linear_fcurves,
    setup_lighting,
)


def _make_arched_factory_window(pfx, x, y, z, m_glass, m_frame, m_stone):
    make_box(f"{pfx}_Ampit", (0.48, 0.08, 0.05), (x, y - 0.06, z - 0.34), m_stone, bevel=0.004)
    make_box(f"{pfx}_Vidre", (0.40, 0.03, 0.62), (x, y - 0.05, z), m_glass)
    make_cyl(f"{pfx}_ArcVidre", 0.20, 0.03, (x, y - 0.05, z + 0.30), m_glass, rot=(math.pi / 2, 0, 0), verts=16)
    make_box(f"{pfx}_MarcV", (0.025, 0.05, 0.68), (x, y - 0.06, z + 0.04), m_frame)
    for hz in (z - 0.10, z + 0.12, z + 0.30):
        make_box(f"{pfx}_MarcH_{hz:.2f}", (0.42, 0.05, 0.025), (x, y - 0.06, hz), m_frame)


def build_fabrica(mode="aigua", animate=True):
    clear_scene()

    p_stone = build_pbr_pair("StoneFab", "stone", 512, 512, bump_scale=2.4)
    p_brick = build_pbr_pair("BrickFab", "brick", 512, 512, bump_scale=2.4)
    p_wood = build_pbr_pair("WoodFab", "wood", 512, 512, bump_scale=1.8)
    p_iron = build_pbr_pair("IronFab", "castiron", 512, 512, bump_scale=2.0)
    p_brass = build_pbr_pair("BrassFab", "brass", 512, 512, bump_scale=1.2)
    p_leather = build_pbr_pair("LeatherFab", "leather", 512, 512, bump_scale=1.6)
    p_cloth = build_pbr_pair("ClothFab", "cotton_cloth", 512, 512, bump_scale=1.4)

    m_stone = make_mat("PedraBase", "#9c907c", metallic=0.0, roughness=0.88, pbr_pair=p_stone)
    m_brick = make_mat("MaoFabrica", "#9b4936", metallic=0.0, roughness=0.85, pbr_pair=p_brick, tex_scale=(2.6, 2.2))
    m_slate = make_mat("TeuladaPissarra", "#3a424c", metallic=0.08, roughness=0.68)
    m_wood = make_mat("FustaBigues", "#734d29", metallic=0.0, roughness=0.74, pbr_pair=p_wood)
    m_iron = make_mat("FerroFosa", "#272c31", metallic=0.86, roughness=0.44, pbr_pair=p_iron)
    m_steel = make_mat("AcerEixos", "#c4ccd4", metallic=0.95, roughness=0.20)
    m_brass = make_mat("LlautoEng", "#cf9d3b", metallic=0.90, roughness=0.25, pbr_pair=p_brass)
    m_copper = make_mat("CoureFab", "#b8633b", metallic=0.88, roughness=0.30)
    m_leather = make_mat("Corretges", "#6a3c20", metallic=0.0, roughness=0.72, pbr_pair=p_leather)
    m_cotton = make_mat("CotoBlanc", "#efe9d8", metallic=0.0, roughness=0.88, pbr_pair=p_cloth)
    m_cloth_r = make_mat("TelaVermella", "#b83b2c", metallic=0.0, roughness=0.75)
    m_cloth_b = make_mat("TelaBlava", "#2f6b99", metallic=0.0, roughness=0.75)
    m_glass = make_mat("VidreFinestra", "#e6f2fa", metallic=0.0, roughness=0.14, emission_hex="#dff0ff", emission_strength=0.45)
    m_water = make_mat("AiguaCanal", "#247db5", metallic=0.0, roughness=0.14, alpha=0.56)
    m_fire = make_mat("FocCaldera", "#ff5e14", metallic=0.0, roughness=0.45, emission_hex="#ff4508", emission_strength=3.4)
    m_smoke = make_mat("FumFabrica", "#c2cacf", metallic=0.0, roughness=0.70, alpha=0.42)

    add_shadow_floor(z=0.0, size=18.0)

    # 1. EDIFICI VICTORIAN DE 3 PLANTES SECCIONAT PEL DAVANT (X = -1.10 .. +2.90)
    b_cx = 0.90
    make_box("SocolEdifici", (7.10, 2.35, 0.24), (-0.25, 0.15, 0.12), m_stone, bevel=0.02)
    make_box("ParetDarrera", (4.10, 0.18, 3.32), (b_cx, 0.88, 1.88), m_brick, bevel=0.015)
    make_box("ParetEsq", (0.18, 1.42, 3.32), (-1.08, 0.24, 1.88), m_brick, bevel=0.015)
    make_box("ParetDreta", (0.18, 1.42, 3.32), (2.88, 0.24, 1.88), m_brick, bevel=0.015)
    # Teulada a dues aigües amb lluerna superior
    make_box("TeuladaDarr", (4.35, 0.96, 0.11), (b_cx, 0.58, 3.74), m_slate, rot=(-0.42, 0, 0), bevel=0.01)
    make_box("TeuladaDavant", (4.35, 0.96, 0.11), (b_cx, -0.18, 3.74), m_slate, rot=(0.42, 0, 0), bevel=0.01)
    make_box("LluernaCarena", (2.60, 0.34, 0.18), (b_cx, 0.22, 4.02), m_glass, bevel=0.008)

    floor_zs = (0.28, 1.38, 2.48)
    for fz in floor_zs[1:]:
        make_box(f"Forjat_{fz:.2f}", (3.92, 1.28, 0.09), (b_cx, 0.22, fz), m_wood, bevel=0.008)

    # Columnes de fosa i finestrals arquejats per planta
    for iz, fz in enumerate(floor_zs):
        for wx in (-0.30, 0.65, 1.65, 2.50):
            _make_arched_factory_window(f"Fin_{iz}_{wx:.2f}", wx, 0.80, fz + 0.54, m_glass, m_iron, m_stone)
        if iz < 2:
            for cx in (-0.32, 0.65, 1.65):
                make_cyl(f"ColFosa_{iz}_{cx:.2f}", 0.036, 1.06, (cx, -0.28, fz + 0.54), m_iron)

    # 2. ARBRE VERTICAL, EIXOS DE TRANSMISSIÓ AMB PENJADORS I CORRETGES
    shaft_x, shaft_y = -0.72, 0.20
    make_cyl("ArbreVertical", 0.050, 3.12, (shaft_x, shaft_y, 1.85), m_steel)
    ceil_zs = (1.26, 2.36, 3.36)
    g_eixos = []
    mach_xs = (0.12, 1.12, 2.12)
    g_machines_rot = []
    for iz, cz in enumerate(ceil_zs):
        make_gear(f"EngArb_{iz}", 0.12, 0.04, 14, (shaft_x, shaft_y, cz), m_brass, axis="Z")
        make_gear(f"EngEix_{iz}", 0.12, 0.04, 14, (shaft_x + 0.12, shaft_y, cz), m_iron, axis="X")
        ge = add_empty(f"EixPlanta_{iz}", (0.95, shaft_y, cz))
        make_cyl(f"BarraEix_{iz}", 0.028, 3.45, (0, 0, 0), m_steel, rot=(0, math.pi / 2, 0), parent=ge)
        for hx in (-0.95, 0.05, 1.05):
            make_box(f"Penjador_{iz}_{hx:.2f}", (0.04, 0.08, 0.14), (hx + 0.95, shaft_y, cz + 0.06), m_iron)
        for mx in mach_xs:
            make_cyl(f"PolSostre_{iz}_{mx:.2f}", 0.105, 0.06, (mx - 0.95, 0, 0), m_iron, rot=(math.pi / 2, 0, 0), parent=ge)
            fz_base = floor_zs[iz]
            # Corretja plana de cuir de doble branc ben alineada amb la politja de la màquina!
            make_rod_between(f"CorrA_{iz}_{mx:.2f}", (mx + 0.24, shaft_y - 0.02, cz), (mx + 0.24, shaft_y - 0.04, fz_base + 0.42), 0.011, m_leather)
            make_rod_between(f"CorrB_{iz}_{mx:.2f}", (mx + 0.24, shaft_y + 0.04, cz), (mx + 0.24, shaft_y + 0.02, fz_base + 0.42), 0.011, m_leather)
        g_eixos.append(ge)

    # 3. MÀQUINES RECOGNOSCIBLES A CADA PLANTA (sense caixes!)
    for idx_m, mx in enumerate(mach_xs):
        # PLANTA 1: Carda amb muntants arquejats de fosa, gran tambor i velo blanc sortint
        for sy in (-0.04, 0.42):
            make_box(f"CardaPeu_{idx_m}_{sy:.2f}", (0.58, 0.045, 0.44), (mx, sy, 0.50), m_iron, bevel=0.006)
        make_box(f"CardaTrav_{idx_m}", (0.62, 0.48, 0.05), (mx, 0.19, 0.34), m_iron, bevel=0.004)
        gc = add_empty(f"TamborCarda_{idx_m}", (mx, 0.19, 0.64))
        make_cyl(f"TamborC_{idx_m}", 0.18, 0.42, (0, 0, 0), m_wood, rot=(math.pi / 2, 0, 0), parent=gc)
        make_cyl(f"VeloCoto_{idx_m}", 0.188, 0.34, (0, 0, 0), m_cotton, rot=(math.pi / 2, 0, 0), parent=gc)
        make_spoked_wheel(f"PolCarda_{idx_m}", 0.12, 0.04, 6, (mx + 0.24, 0.02, 0.64), m_iron, m_brass, axis="Y")
        make_cyl(f"VeloSortida_{idx_m}", 0.045, 0.24, (mx - 0.26, 0.19, 0.62), m_cotton, rot=(math.pi / 2, 0, 0))
        g_machines_rot.append(gc)

        # PLANTA 2: Filadora tipus Water-Frame amb bastidor en A, creel de bobines dalt i fusos baix
        for sx in (mx - 0.22, mx + 0.20):
            make_box(f"FilMuntant_{idx_m}_{sx:.2f}", (0.045, 0.42, 0.66), (sx, 0.18, 1.72), m_wood, bevel=0.005)
        make_box(f"FilTauler_{idx_m}", (0.50, 0.36, 0.035), (mx, 0.18, 1.90), m_wood, bevel=0.004)
        make_box(f"FilBancFusos_{idx_m}", (0.50, 0.28, 0.04), (mx, 0.10, 1.56), m_wood, bevel=0.004)
        for bi in (-0.13, 0.0, 0.13):
            make_cyl(f"BobCreel_{idx_m}_{bi:.2f}", 0.035, 0.14, (mx + bi, 0.22, 2.04), m_cotton)
            make_cyl(f"FusBaix_{idx_m}_{bi:.2f}", 0.022, 0.16, (mx + bi, 0.08, 1.66), m_cotton)
            make_rod_between(f"FilEstirat_{idx_m}_{bi:.2f}", (mx + bi, 0.20, 1.98), (mx + bi, 0.08, 1.74), 0.005, m_cotton)
        gf = add_empty(f"VolantFil_{idx_m}", (mx + 0.24, 0.18, 1.76))
        make_spoked_wheel(f"RodaFil_{idx_m}", 0.13, 0.035, 6, (0, 0, 0), m_brass, axis="X", parent=gf)
        g_machines_rot.append(gf)

        # PLANTA 3: Teler mecànic tipus Cartwright amb bastidor obert, llisos i peça de tela tenyida
        for sx in (mx - 0.24, mx + 0.22):
            for sy in (-0.02, 0.38):
                make_box(f"TelPilar_{idx_m}_{sx:.2f}_{sy:.2f}", (0.04, 0.04, 0.64), (sx, sy, 2.80), m_iron, bevel=0.004)
        make_box(f"TelTravers_{idx_m}", (0.52, 0.42, 0.045), (mx, 0.18, 3.10), m_iron, bevel=0.004)
        m_tela = m_cloth_r if idx_m != 2 else m_cloth_b
        make_box(f"TelaTeler_{idx_m}", (0.44, 0.36, 0.022), (mx, 0.16, 2.86), m_tela, bevel=0.003)
        make_cyl(f"PlegadorTela_{idx_m}", 0.048, 0.44, (mx, -0.02, 2.82), m_tela, rot=(0, math.pi / 2, 0))
        make_box(f"MarcLlisos_{idx_m}", (0.44, 0.025, 0.22), (mx, 0.16, 2.95), m_wood)
        gt = add_empty(f"PolTeler_{idx_m}", (mx + 0.24, 0.18, 2.84))
        make_spoked_wheel(f"RodaTel_{idx_m}", 0.125, 0.035, 6, (0, 0, 0), m_iron, axis="X", parent=gt)
        g_machines_rot.append(gt)

    # 4. BALES DE COTÓ A BAIX A LA DRETA I ROTLLES DE TELA ACABADA A DALT
    for bx, bz in [(2.58, 0.40), (2.58, 0.60), (2.28, 0.40)]:
        make_box(f"BalaCoto_{bx:.2f}_{bz:.2f}", (0.26, 0.34, 0.17), (bx, -0.15, bz), m_cotton, bevel=0.025)
    make_cyl("RotlloVermell", 0.068, 0.36, (2.58, -0.10, 2.66), m_cloth_r, rot=(math.pi / 2, 0, 0))
    make_cyl("RotlloBlau", 0.068, 0.36, (2.58, -0.10, 2.80), m_cloth_b, rot=(math.pi / 2, 0, 0))

    # 5. MOTOR LATERAL A L'ESQUERRA SEGONS MODE
    motor_rot_objs = []
    extra_anim = []
    g_eix_motor = None
    g_piston = None
    g_biela = None
    g_fum = None

    if mode == "aigua":
        # Canal de pedra amb comportes de fusta, caiguda d'aigua corbada i roda hidràulica de catúfols
        make_box("SoportCanal", (1.28, 0.62, 2.38), (-3.22, 0.24, 1.40), m_stone, bevel=0.02)
        make_box("CanalFusta", (1.62, 0.50, 0.22), (-2.78, 0.20, 2.66), m_wood, bevel=0.01)
        make_box("AiguaCanal", (1.56, 0.38, 0.14), (-2.78, 0.20, 2.74), m_water, bevel=0.01)
        make_box("ComportaAigua", (0.04, 0.42, 0.36), (-2.06, 0.20, 2.78), m_iron)
        make_curve_tube("XorroAigua", [(-2.06, 0.18, 2.66), (-1.96, 0.18, 2.40), (-1.92, 0.18, 2.02), (-1.90, 0.18, 1.62)], 0.11, m_water)
        make_box("BasalAigua", (2.35, 0.94, 0.18), (-2.28, 0.18, 0.28), m_water, bevel=0.01)

        g_eix_motor = add_empty("RodaHidraulica", (-2.15, 0.18, 1.35))
        r_hw = 0.96
        make_cyl("BoixaHW", 0.14, 0.52, (0, 0, 0), m_iron, rot=(math.pi / 2, 0, 0), parent=g_eix_motor)
        make_torus("CercolHW1", r_hw, 0.032, (0, -0.20, 0), m_iron, rot=(math.pi / 2, 0, 0), major_segs=36, parent=g_eix_motor)
        make_torus("CercolHW2", r_hw, 0.032, (0, 0.20, 0), m_iron, rot=(math.pi / 2, 0, 0), major_segs=36, parent=g_eix_motor)
        for k in range(14):
            a = 2.0 * math.pi * k / 14
            ca, sa = math.cos(a), math.sin(a)
            make_rod_between(f"RaigHW1_{k}", (0, -0.20, 0), (r_hw * ca, -0.20, r_hw * sa), 0.024, m_wood, parent=g_eix_motor)
            make_rod_between(f"RaigHW2_{k}", (0, 0.20, 0), (r_hw * ca, 0.20, r_hw * sa), 0.024, m_wood, parent=g_eix_motor)
            make_box(f"Catufol_{k}", (0.04, 0.40, 0.22), (r_hw * 0.94 * ca, 0, r_hw * 0.94 * sa), m_wood, rot=(0, -a, 0), parent=g_eix_motor, bevel=0.005)
        make_cyl("EixRodaFab", 0.06, 1.55, (0.72, 0, 0), m_steel, rot=(0, math.pi / 2, 0), parent=g_eix_motor)
        make_gear("EngMotorV", 0.22, 0.06, 16, (-0.72, shaft_y, 1.35), m_brass, axis="Z")
        make_gear("EngMotorH", 0.22, 0.06, 16, (-0.86, shaft_y, 1.35), m_iron, axis="X")
        motor_rot_objs.append(g_eix_motor)
    else:
        # Fàbrica de vapor: caldera reblada + brases orgàniques + xemeneia octogonal + màquina de vapor horitzontal
        make_box("SalaVaporBase", (2.88, 1.44, 0.24), (-2.55, 0.15, 0.36), m_stone, bevel=0.015)
        make_cyl("CalderaFab", 0.36, 1.12, (-2.95, 0.20, 1.06), m_iron, rot=(0, math.pi / 2, 0), bevel=0.012)
        make_rivet_ring("ReblonsCaldFab", (-2.65, 0.20, 1.06), 0.365, 16, rivet_r=0.009, axis="X", mat=m_steel)
        make_box("FornCaldFab", (0.92, 0.68, 0.44), (-2.95, 0.20, 0.62), m_brick, bevel=0.01)
        make_coal_pile("FocCaldFab", (-2.95, -0.06, 0.54), 0.22, 0.14, 0.14, m_fire, count=18, seed=11)
        make_curve_tube("TubVaporFab", [(-2.95, 0.20, 1.44), (-2.95, 0.18, 1.78), (-2.55, 0.18, 1.78), (-2.55, 0.18, 1.68)], 0.036, m_copper)

        # Xemeneia octogonal atalussada amb corona de pedra i plomall de fum orgànic
        make_cyl("XemeneiaBaseFab", 0.32, 3.78, (-3.50, 0.35, 2.10), m_brick, verts=8, bevel=0.012)
        make_cyl("XemeneiaCorFab", 0.38, 0.16, (-3.50, 0.35, 4.02), m_stone, verts=8, bevel=0.01)
        g_fum = add_empty("FumXemFab", (-3.50, 0.35, 4.14))
        make_smoke_plume("PlomallFab", (0.0, 0.0, 0.0), 1.05, -0.68, 0.05, 0.16, m_smoke, wisps=18, seed=31, parent=g_fum)

        make_cyl("CilindreFab", 0.18, 0.54, (-2.55, 0.18, 1.56), m_brass, rot=(0, math.pi / 2, 0), bevel=0.008)
        make_box("BancadaMaqFab", (1.28, 0.34, 0.18), (-2.12, 0.18, 1.32), m_iron, bevel=0.008)
        g_piston = add_empty("PistoFab", (-2.55, 0.18, 1.56))
        make_cyl("TijaPistoFab", 0.028, 0.56, (0.25, 0, 0), m_steel, rot=(0, math.pi / 2, 0), parent=g_piston)

        vx, vz = -1.72, 1.56
        g_eix_motor = add_empty("VolantVaporFab", (vx, 0.18, vz))
        make_spoked_wheel("VolantFab", 0.50, 0.09, 6, (0, 0, 0), m_iron, m_brass, axis="Y", parent=g_eix_motor)
        make_cyl("BotoVolFab", 0.03, 0.08, (0.16, -0.06, 0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_eix_motor)
        make_cyl("EixMotorFab", 0.05, 1.12, (0.50, 0, 0), m_steel, rot=(0, math.pi / 2, 0), parent=g_eix_motor)
        make_gear("EngVaporV", 0.20, 0.06, 16, (-0.72, shaft_y, 1.56), m_brass, axis="Z")
        make_gear("EngVaporH", 0.20, 0.06, 16, (-0.86, shaft_y, 1.56), m_iron, axis="X")

        g_biela = add_empty("BielaFab", (0, 0, 0))
        make_box("BielaFabCos", (0.52, 0.035, 0.06), (0.26, 0, 0), m_steel, parent=g_biela, bevel=0.004)
        extra_anim.extend([g_piston, g_biela, g_fum])
        motor_rot_objs.append(g_eix_motor)

    def apply_pose(p):
        theta = 2.0 * math.pi * p
        if mode == "aigua":
            g_eix_motor.rotation_euler = (0.0, theta, 0.0)
        else:
            g_eix_motor.rotation_euler = (0.0, 2.0 * theta, 0.0)
            t2 = 2.0 * theta
            kx = -1.72 + 0.16 * math.cos(t2)
            kz = 1.56 - 0.16 * math.sin(t2)
            dx = math.sqrt(max(0.01, 0.52 * 0.52 - (kz - 1.56) ** 2))
            xc = kx - dx
            g_piston.location = (xc - 0.52, 0.18, 1.56)
            g_biela.location = (xc, 0.12, 1.56)
            g_biela.rotation_euler = (0.0, math.atan2(-(kz - 1.56), kx - xc), 0.0)
            g_fum.location = (-3.50, 0.35, 4.14 + 0.08 * math.sin(t2))

        for ge in g_eixos:
            ge.rotation_euler = (2.0 * theta, 0.0, 0.0)
        for gm in g_machines_rot:
            gm.rotation_euler = (3.0 * theta, 0.0, 0.0)

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        anim_objs = motor_rot_objs + g_eixos + g_machines_rot + extra_anim
        for fr in range(1, 61):
            p = (fr - 1) / 60.0
            apply_pose(p)
            for o in anim_objs:
                o.keyframe_insert(data_path="location", frame=fr)
                o.keyframe_insert(data_path="rotation_euler", frame=fr)
        set_linear_fcurves(anim_objs)
        scene.frame_set(16)
    else:
        apply_pose(0.22)

    cam_loc = (-2.25, -8.55, 3.25)
    target = (-0.15, 0.10, 1.85)
    setup_lighting(cam_loc, target, lens=40.0, mood="workshop")

    anchors = {
        "motor": (-2.15, -0.10, 1.45) if mode == "aigua" else (-1.72, 0.0, 1.56),
        "arbre": (shaft_x, 0.0, 2.05),
        "eixos": (0.85, 0.0, 2.36),
        "corretges": (1.15, 0.05, 1.98),
        "cardes": (1.15, 0.0, 0.65),
        "filadores": (1.15, 0.0, 1.72),
        "telers": (1.15, 0.0, 2.82),
        "coto": (2.55, -0.15, 0.55),
    }
    if mode != "aigua":
        anchors["caldera"] = (-2.95, 0.0, 1.05)
        anchors["xemeneia"] = (-3.50, 0.20, 3.25)

    prefix = "hidraulica" if mode == "aigua" else "vaporera"
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
    render_image(os.path.join(out_dir, f"{prefix}-muntada.png"), res_x=1200, res_y=760, samples=32)
    render_closeup(os.path.join(out_dir, f"{prefix}-detall.png"), (-1.45, -4.15, 2.15), (-0.85, 0.10, 1.65), lens=46.0, samples=28)

    proj = project_anchors(anchors)
    export_glb_and_meta(prefix, f"{prefix}.glb", anchors, extra_meta={"proj_2d": proj})

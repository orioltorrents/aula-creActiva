# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Sembradora mecànica de tres fileres de Jethro Tull (c. 1701),
sobre llit de terra llaurada amb solcs reals en relleu, tremuja amb munt de gra real,
dosador de culleres de llautó, relles corbes, canals oberts de llauna i pagès a escala.
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
    make_cone,
    make_curve_tube,
    make_cutaway_cyl,
    make_cyl,
    make_furrow_bed,
    make_gear,
    make_grain_pile,
    make_mat,
    make_rivet_ring,
    make_rod_between,
    make_sphere,
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


def build_sembradora(animate=True):
    clear_scene()

    p_wood = build_pbr_pair("WoodSmb", "wood", 512, 512, bump_scale=1.8)
    p_iron = build_pbr_pair("IronSmb", "castiron", 512, 512, bump_scale=2.1)
    p_brass = build_pbr_pair("BrassSmb", "brass", 512, 512, bump_scale=1.2)
    p_soil = build_pbr_pair("SoilSmb", "soil", 512, 512, bump_scale=2.8)
    p_leather = build_pbr_pair("LeatherSmb", "leather", 512, 512, bump_scale=1.6)

    m_wood = make_mat("FustaRoure", "#7b532c", metallic=0.0, roughness=0.72, pbr_pair=p_wood)
    m_wood_d = make_mat("FustaFosca", "#4e3218", metallic=0.0, roughness=0.76, pbr_pair=p_wood)
    m_iron = make_mat("FerroForjat", "#2c3138", metallic=0.86, roughness=0.42, pbr_pair=p_iron)
    m_steel = make_mat("AcerPolit", "#bcc5ce", metallic=0.94, roughness=0.22)
    m_tin = make_mat("LlaunaCanal", "#9fa9b3", metallic=0.88, roughness=0.32)
    m_brass = make_mat("LlautóDosador", "#d29f3d", metallic=0.90, roughness=0.26, pbr_pair=p_brass)
    m_soil = make_mat("TerraLlaurada", "#5a422b", metallic=0.0, roughness=0.92, pbr_pair=p_soil, tex_scale=(2.8, 2.2))
    m_plinth = make_mat("SocolMuseu", "#23211f", metallic=0.05, roughness=0.82)
    m_seed = make_mat("LlavorBlat", "#dfad42", metallic=0.0, roughness=0.46)
    m_leather = make_mat("CorretjaSmb", "#62391f", metallic=0.0, roughness=0.72, pbr_pair=p_leather)

    add_shadow_floor(z=0.0, size=14.0)

    # 1. LLIT DE TERRA LLAURADA EN RELLEU REAL SOBRE SÒCOL
    make_box("SocolCamp", (4.42, 2.30, 0.08), (0.0, 0.0, 0.04), m_plinth, bevel=0.015)
    make_furrow_bed(
        "SolcsLlaurats",
        (0.0, 0.0),
        4.30,
        2.18,
        0.10,
        m_soil,
        furrows=6,
        amp=0.052,
        unploughed_x=0.62,
        nx=60,
        ny=44,
        seed=31,
    )
    row_ys = (-0.42, 0.0, 0.42)

    # 2. BASTIDOR DE FUSTA ENSAMBLAT AMB FERRATGES, ESTEVES CORBES I RODES FERRADES
    g_maq = add_empty("SembradoraConjunt", (0.0, 0.0, 0.0))

    for by in (-0.64, 0.64):
        make_box(f"BastLong_{by:.2f}", (2.18, 0.088, 0.098), (0.16, by, 0.72), m_wood, parent=g_maq, bevel=0.009)
    for bx in (-0.70, -0.05, 0.62, 1.15):
        make_box(f"BastTrav_{bx:.2f}", (0.088, 1.38, 0.088), (bx, 0.0, 0.72), m_wood, parent=g_maq, bevel=0.008)
        for cy in (-0.64, 0.64):
            make_box(f"Escaire_{bx:.2f}_{cy:.2f}", (0.11, 0.096, 0.105), (bx, cy, 0.72), m_iron, parent=g_maq, bevel=0.004)
            make_cyl(f"Pern_{bx:.2f}_{cy:.2f}", 0.011, 0.125, (bx, cy, 0.72), m_steel, verts=8, parent=g_maq)

    # Vares davanteres corbades amb ganxos de ferro
    for by in (-0.52, 0.52):
        pts_v = [
            (1.12, by, 0.72),
            (1.48, by * 0.96, 0.74),
            (1.88, by * 0.90, 0.78),
            (2.26, by * 0.85, 0.84),
        ]
        make_curve_tube(f"VaraCavall_{by:.2f}", pts_v, 0.036, m_wood_d, parent=g_maq)
        make_torus(f"GanxoVara_{by:.2f}", 0.030, 0.008, (2.27, by * 0.85, 0.84), m_iron, parent=g_maq)
    make_box("BarraTir", (0.08, 1.08, 0.07), (1.36, 0.0, 0.74), m_wood_d, parent=g_maq, bevel=0.007)

    # Esteves posteriors corbades al vapor amb mànecs tornejats i tirants de ferro
    for by in (-0.42, 0.42):
        pts_e = [
            (-0.68, by, 0.72),
            (-1.05, by * 0.98, 0.86),
            (-1.46, by * 0.96, 1.05),
            (-1.78, by * 0.94, 1.18),
        ]
        make_curve_tube(f"Esteva_{by:.2f}", pts_e, 0.030, m_wood, parent=g_maq)
        make_cyl(f"ManecEst_{by:.2f}", 0.038, 0.21, (-1.84, by * 0.94, 1.20), m_wood_d, rot=(0, 1.28, 0), parent=g_maq, bevel=0.006)
        make_rod_between(f"TirantEst_{by:.2f}", (-0.55, by * 1.15, 0.72), (-1.22, by * 0.97, 0.94), 0.011, m_iron, parent=g_maq)
    make_rod_between("TravesserEst", (-1.42, -0.40, 1.03), (-1.42, 0.40, 1.03), 0.022, m_wood_d, parent=g_maq)

    # Dues grans rodes de carreta de 12 radis amb boixes reforçades i llanta reblada
    r_w = 0.56
    wx, wz = 0.05, 0.14 + r_w
    make_cyl("EixRodes", 0.036, 1.78, (wx, 0.0, wz), m_iron, rot=(math.pi / 2, 0, 0), parent=g_maq)
    g_rodes = []
    for sy in (-0.80, 0.80):
        rw = make_spoked_wheel(
            f"Roda_{sy:.2f}",
            r_w,
            0.076,
            12,
            (wx, sy, wz),
            m_wood,
            mat_hub=m_iron,
            axis="Y",
            parent=g_maq,
        )
        make_torus(f"CercolRoda_{sy:.2f}", r_w + 0.014, 0.017, (0, 0, 0), m_iron, rot=(math.pi / 2, 0, 0), major_segs=36, parent=rw)
        make_rivet_ring(f"ReblonsRoda_{sy:.2f}", (0, 0, 0), r_w + 0.030, 16, rivet_r=0.008, axis="Y", mat=m_steel, parent=rw)
        make_cyl(f"CercleBoixa_{sy:.2f}", 0.105, 0.18, (0, 0, 0), m_brass, rot=(math.pi / 2, 0, 0), verts=18, parent=rw)
        g_rodes.append(rw)

    # 3. TREMUJA DE FUSTA ENCAIXONADA AMB CANTONERES DE FERRO, TAPA OBERTA I GRA REAL
    tr_x, tr_z = 0.08, 1.24
    make_box("TremujaDarrera", (0.58, 0.045, 0.46), (tr_x, 0.56, tr_z), m_wood, rot=(0.16, 0, 0), parent=g_maq, bevel=0.006)
    make_box("TremujaEsq", (0.045, 1.12, 0.46), (tr_x - 0.28, 0.0, tr_z), m_wood, rot=(0, -0.15, 0), parent=g_maq, bevel=0.006)
    make_box("TremujaDreta", (0.045, 1.12, 0.46), (tr_x + 0.28, 0.0, tr_z), m_wood, rot=(0, 0.15, 0), parent=g_maq, bevel=0.006)
    make_box("TremujaFrontBaix", (0.50, 0.045, 0.24), (tr_x, -0.52, tr_z - 0.10), m_wood, rot=(-0.16, 0, 0), parent=g_maq, bevel=0.006)
    make_box("TremujaCintaInf", (0.56, 1.14, 0.025), (tr_x, 0.0, tr_z - 0.22), m_iron, parent=g_maq, bevel=0.004)
    # Tapa inclinada oberta cap enrere perquè s'hi vegi el gra
    make_box("TapaTremujaOberta", (0.56, 1.18, 0.032), (tr_x - 0.42, 0.0, tr_z + 0.36), m_wood_d, rot=(0, -0.82, 0), parent=g_maq, bevel=0.005)
    # Cantoneres metàl·liques de la tremuja
    for cx_off in (-0.28, 0.28):
        for cy_off in (-0.54, 0.54):
            make_box(f"Cantonera_{cx_off:.2f}_{cy_off:.2f}", (0.055, 0.055, 0.26), (tr_x + cx_off * 0.98, cy_off, tr_z - 0.08), m_iron, parent=g_maq, bevel=0.003)

    # Munt de llavors de blat reals dins la tremuja
    make_grain_pile("GraTremuja", (tr_x, 0.0, tr_z - 0.05), 0.24, 0.48, 0.16, m_seed, count=140, seed=17, parent=g_maq)

    # 4. DOSADOR ROTATIU AMB CULLERES DE LLAUTÓ I COMPORTES REGULADORES
    dos_x, dos_z = 0.08, 0.92
    g_dosador = add_empty("DosadorGrup", (dos_x, 0.0, dos_z), parent=g_maq)
    make_cyl("EixDosador", 0.026, 1.44, (0, 0, 0), m_iron, rot=(math.pi / 2, 0, 0), parent=g_dosador)
    for ry in row_ys:
        make_cyl(f"TamborDos_{ry:.2f}", 0.078, 0.13, (0, ry, 0), m_wood_d, rot=(math.pi / 2, 0, 0), parent=g_dosador, bevel=0.004)
        make_cyl(f"AnellDosA_{ry:.2f}", 0.082, 0.016, (0, ry - 0.06, 0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_dosador)
        make_cyl(f"AnellDosB_{ry:.2f}", 0.082, 0.016, (0, ry + 0.06, 0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_dosador)
        for k in range(8):
            a = k * (math.pi / 4.0)
            make_box(
                f"OscaDos_{ry:.2f}_{k}",
                (0.026, 0.085, 0.024),
                (0.078 * math.cos(a), ry, 0.078 * math.sin(a)),
                m_brass,
                rot=(0, -a, 0),
                parent=g_dosador,
                bevel=0.003,
            )
        # Palanca reguladora de llautó al costat de cada caixa dosadora
        make_box(f"ComportaDos_{ry:.2f}", (0.11, 0.02, 0.08), (dos_x - 0.14, ry, dos_z + 0.08), m_brass, parent=g_maq, bevel=0.003)

    # Transmissió per engranatges i corretja reblada al lateral esquerre (-Y)
    g_eng_eix = add_empty("EngranatgeEixG", (wx, -0.68, wz), parent=g_maq)
    make_gear("EngranatgeEix", 0.15, 0.044, 16, (0, 0, 0), m_brass, mat_hub=m_iron, axis="Y", parent=g_eng_eix)
    g_eng_dos = add_empty("EngranatgeDosadorG", (dos_x, -0.68, dos_z), parent=g_maq)
    make_gear("EngranatgeDosador", 0.105, 0.044, 11, (0, 0, 0), m_brass, mat_hub=m_iron, axis="Y", parent=g_eng_dos)
    make_rod_between("CadenaSmb1", (wx - 0.12, -0.68, wz), (dos_x - 0.09, -0.68, dos_z), 0.015, m_leather, parent=g_maq)
    make_rod_between("CadenaSmb2", (wx + 0.12, -0.68, wz), (dos_x + 0.09, -0.68, dos_z), 0.015, m_leather, parent=g_maq)

    # 5. RELLES CORBES FORJADES, CANALS OBERTS DE LLAUNA I LLAVORS EN SOLC
    seeds_anim = []
    for i_row, ry in enumerate(row_ys):
        # Braç corbat i rella metàl·lica obre-solcs
        pts_r = [(0.42, ry, 0.72), (0.40, ry, 0.50), (0.36, ry, 0.28), (0.30, ry, 0.16)]
        make_curve_tube(f"SuportRella_{i_row}", pts_r, 0.022, m_iron, parent=g_maq)
        make_cone(f"PuntaRella_{i_row}", 0.068, 0.010, 0.24, (0.35, ry, 0.19), m_steel, rot=(0, -1.28, 0), parent=g_maq)

        # Embut de llautó + canal semicircular obert frontalment perquè es vegin caure les llavors!
        make_cone(f"EmbutTub_{i_row}", 0.095, 0.042, 0.20, (0.08, ry, 0.78), m_brass, rot=(math.pi, 0, 0), parent=g_maq)
        make_cutaway_cyl(
            f"CanalLlauna_{i_row}",
            0.032,
            0.039,
            0.56,
            (0.06, ry, 0.45),
            m_tin,
            start_ang=-math.pi * 0.22,
            end_ang=math.pi * 1.18,
            segs=24,
            parent=g_maq,
        )
        make_torus(f"AnellaCanal_{i_row}", 0.040, 0.005, (0.06, ry, 0.58), m_brass, parent=g_maq)

        for j in range(4):
            gs = add_empty(f"LlavorAnim_{i_row}_{j}", (0.06, ry, 0.65), parent=g_maq)
            gr = make_sphere(f"Gra_{i_row}_{j}", 0.016, (0, 0, 0), m_seed, segs=10, rings=8, parent=gs)
            gr.scale = (1.65, 0.75, 0.75)
            seeds_anim.append((gs, i_row, j))

        for kx in (-0.28, -0.58, -0.88, -1.18):
            gr_s = make_sphere(f"GraSolc_{i_row}_{kx:.2f}", 0.016, (kx, ry, 0.15), m_seed, segs=8, rings=6)
            gr_s.scale = (1.6, 0.75, 0.70)

    # 6. RASCLET POSTERIOR DE PUES CORBES I CADENES
    make_box("BarraRasclet", (0.08, 1.20, 0.07), (-0.94, 0.0, 0.36), m_wood, parent=g_maq, bevel=0.006)
    make_rod_between("BracRascletEsq", (-0.68, -0.52, 0.72), (-0.94, -0.52, 0.36), 0.020, m_iron, parent=g_maq)
    make_rod_between("BracRascletDret", (-0.68, 0.52, 0.72), (-0.94, 0.52, 0.36), 0.020, m_iron, parent=g_maq)
    for k_p, py in enumerate([-0.50 + 0.125 * k for k in range(9)]):
        make_curve_tube(
            f"PuaRasclet_{k_p}",
            [(-0.94, py, 0.36), (-0.98, py, 0.24), (-1.04, py, 0.14)],
            0.010,
            m_steel,
            parent=g_maq,
        )

    # 7. PAGÈS A ESCALA GUIA L'ARADA SEMBRADORA SENSE TAPAR EL MECANISME
    worker = make_worker("PagesSembradora", (-1.92, 0.55, 0.12), facing_yaw=-math.pi * 0.42, scale=0.95, role="spinner")

    def apply_pose(p):
        theta = 2.0 * math.pi * p
        for rw in g_rodes:
            rw.rotation_euler = (0.0, theta, 0.0)
        g_eng_eix.rotation_euler = (0.0, theta, 0.0)
        g_dosador.rotation_euler = (0.0, theta * 1.45, 0.0)
        g_eng_dos.rotation_euler = (0.0, theta * 1.45, 0.0)
        bob_z = 0.008 * math.sin(theta * 4.0)
        g_maq.location = (0.0, 0.0, bob_z)
        for gs, i_row, j in seeds_anim:
            ph = (p + j / 4.0 + i_row * 0.19) % 1.0
            gs.location = (0.06, row_ys[i_row], 0.74 - 0.58 * ph)
        sway = math.sin(theta * 2.0)
        set_worker_pose(
            worker,
            torso_rot=(0.14, 0.0, -0.18 + 0.04 * sway),
            head_rot=(-0.10, 0.0, -0.12),
            r_sh=(0.68, -0.08, -0.15),
            r_elb=(-0.55, 0.0, 0.0),
            l_sh=(0.62, 0.08, 0.10),
            l_elb=(-0.50, 0.0, 0.0),
            r_hip=(-0.22 * sway, 0.0, 0.0),
            l_hip=(0.22 * sway, 0.0, 0.0),
        )

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        worker_objs = [worker["torso"], worker["head"], worker["l_sh"], worker["l_elb"], worker["r_sh"], worker["r_elb"], worker["l_hip"], worker["r_hip"]]
        anim_objs = g_rodes + [g_eng_eix, g_dosador, g_eng_dos, g_maq] + [gs for gs, _, _ in seeds_anim] + worker_objs
        for fr in range(1, 61):
            p = (fr - 1) / 60.0
            apply_pose(p)
            for o in anim_objs:
                o.keyframe_insert(data_path="location", frame=fr)
                o.keyframe_insert(data_path="rotation_euler", frame=fr)
        set_linear_fcurves(anim_objs)
        scene.frame_set(16)
    else:
        apply_pose(0.25)

    cam_loc = (2.05, -4.15, 2.25)
    target = (-0.12, -0.02, 0.80)
    setup_lighting(cam_loc, target, lens=42.0, mood="workshop")

    anchors = {
        "tremuja": (tr_x, -0.25, 1.34),
        "dosador": (dos_x, -0.45, dos_z),
        "roda": (wx, -0.80, wz + 0.22),
        "tub": (0.06, -0.42, 0.48),
        "rella": (0.38, -0.42, 0.20),
        "rasclet": (-0.96, -0.35, 0.30),
        "bastidor": (0.72, -0.64, 0.74),
        "esteves": (-1.52, -0.42, 1.08),
    }

    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
    render_image(os.path.join(out_dir, "sembradora-muntada.png"), res_x=1200, res_y=760, samples=32)
    render_closeup(os.path.join(out_dir, "sembradora-detall.png"), (0.75, -1.95, 1.24), (0.08, -0.18, 0.72), lens=48.0, samples=28)

    proj = project_anchors(anchors)
    export_glb_and_meta("sembradora", "sembradora.glb", anchors, extra_meta={"proj_2d": proj})


if __name__ == "__main__":
    build_sembradora(animate=True)

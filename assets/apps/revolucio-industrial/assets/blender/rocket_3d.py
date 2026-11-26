# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Locomotora Rocket de George i Robert Stephenson (1829), reconstrucció museística
en tall longitudinal seccionat: tènder amb bota d'aigua seccionada i coc facetat,
fogar interior de coure amb camisa d'aigua, perns d'estai, cendrer i graella,
manòmetre i nivell d'aigua al culat, caldera groga reblada amb superfície real
d'aigua bullint cobrint 18 tubs de coure, vàlvula de ressort Salter, caixa de
distribució seccionada amb vàlvula corredora animada per excèntrica, cilindre
inclinat seccionat amb creuera, bomba d'alimentació, caixa de fums oberta amb
blastpipe central de coure i xemeneia atirantada.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector

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
    make_mat,
    make_rivet_ring,
    make_rod_between,
    make_smoke_plume,
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


def build_rocket(animate=True):
    clear_scene()

    p_stone = build_pbr_pair("StoneRkt", "stone", 512, 512, bump_scale=2.4)
    p_wood = build_pbr_pair("WoodRkt", "wood_dark", 512, 512, bump_scale=1.9)
    p_oak = build_pbr_pair("OakRkt", "wood", 512, 512, bump_scale=1.6)
    p_iron = build_pbr_pair("IronRkt", "castiron", 512, 512, bump_scale=2.1)
    p_brass = build_pbr_pair("BrassRkt", "brass", 512, 512, bump_scale=1.2)
    p_copper = build_pbr_pair("CopperRkt", "copper", 512, 512, bump_scale=1.4)

    m_ballast = make_mat("BalastVia", "#867f73", metallic=0.0, roughness=0.92, pbr_pair=p_stone, tex_scale=(3.2, 1.6))
    m_wood = make_mat("FustaTravessa", "#5c3b20", metallic=0.0, roughness=0.75, pbr_pair=p_wood)
    m_oak = make_mat("RoureBota", "#7b4e29", metallic=0.0, roughness=0.68, pbr_pair=p_oak)
    m_iron = make_mat("FerroFosa", "#25292e", metallic=0.86, roughness=0.44, pbr_pair=p_iron)
    m_steel = make_mat("AcerPolit", "#c8d0d8", metallic=0.95, roughness=0.20)
    m_brass = make_mat("Llauto", "#d4a63f", metallic=0.92, roughness=0.24, pbr_pair=p_brass)
    m_copper = make_mat("CoureTubs", "#c26c3f", metallic=0.89, roughness=0.28, pbr_pair=p_copper)
    m_yellow = make_mat("GrocRocket", "#dba728", metallic=0.22, roughness=0.38)
    m_red = make_mat("VermellBota", "#7b2e26", metallic=0.10, roughness=0.52, pbr_pair=p_wood)
    m_sec = make_mat("TallSeccio", "#b63a28", metallic=0.18, roughness=0.46)
    m_dial = make_mat("EsferaManometre", "#f5edd8", metallic=0.0, roughness=0.45)
    m_coal = make_mat("CocNegre", "#191b1e", metallic=0.08, roughness=0.86)
    m_fire = make_mat(
        "BrasesFogar",
        "#ff5a16",
        metallic=0.0,
        roughness=0.48,
        emission_hex="#ff4808",
        emission_strength=3.8,
    )
    m_flame = make_mat(
        "FlamaGasos",
        "#ff9a2e",
        metallic=0.0,
        roughness=0.35,
        alpha=0.52,
        emission_hex="#ff7a18",
        emission_strength=2.1,
    )
    m_water = make_mat("AiguaCaldera", "#297cb3", metallic=0.0, roughness=0.14, alpha=0.50)
    m_steam_hot = make_mat(
        "VaporRocket",
        "#ffb66c",
        metallic=0.0,
        roughness=0.32,
        alpha=0.42,
        emission_hex="#ff8c38",
        emission_strength=0.42,
    )
    m_smoke = make_mat("FumXemeneia", "#cdd5db", metallic=0.0, roughness=0.68, alpha=0.44)

    add_shadow_floor(z=0.0, size=18.0)

    # 1. VIA FERROVIÀRIA (balast, travesses amb coixinets de fosa i rails perfilats)
    make_box("Balast", (7.30, 1.98, 0.14), (-0.70, 0.0, 0.07), m_ballast, bevel=0.02, uv_scale=0.8)
    for tx in [-4.05 + 0.46 * i for i in range(16)]:
        make_box(f"Travessa_{tx:.2f}", (0.18, 1.44, 0.09), (tx, 0.0, 0.16), m_wood, bevel=0.008)
        for ry_s in (-0.50, 0.50):
            make_box(f"CoixVia_{tx:.2f}_{ry_s:.2f}", (0.13, 0.11, 0.028), (tx, ry_s, 0.21), m_iron, bevel=0.003)
    rail_y = 0.50
    for ry in (-rail_y, rail_y):
        make_box(f"RailBase_{ry:.2f}", (7.10, 0.08, 0.025), (-0.70, ry, 0.22), m_iron, bevel=0.003)
        make_box(f"Rail_{ry:.2f}", (7.10, 0.048, 0.066), (-0.70, ry, 0.256), m_steel, bevel=0.004)

    rail_top_z = 0.289

    # 2. TÈNDER POSTERIOR AMB COC FACETAT, PALA I BOTA D'AIGUA SECCIONADA
    tend_x = -2.62
    make_box("TenderXassis", (1.76, 1.20, 0.12), (tend_x, 0.0, 0.68), m_wood, bevel=0.012)
    make_box("TenderLateralDarr", (1.76, 0.07, 0.36), (tend_x, rail_y + 0.05, 0.90), m_yellow, bevel=0.008)
    make_box("TenderLateralFrontBaix", (1.76, 0.07, 0.14), (tend_x, -rail_y - 0.05, 0.79), m_yellow, bevel=0.006)
    make_box("TenderCulat", (0.07, 1.18, 0.36), (tend_x - 0.84, 0.0, 0.90), m_yellow, bevel=0.008)
    make_box("TenderMamparoCoc", (0.05, 1.06, 0.32), (tend_x + 0.14, 0.0, 0.88), m_wood, bevel=0.005)
    r_tend = 0.34
    t_wheels = []
    for wx in (tend_x - 0.50, tend_x + 0.50):
        make_cyl(f"EixTend_{wx:.2f}", 0.036, 1.14, (wx, 0.0, rail_top_z + r_tend), m_steel, rot=(math.pi / 2, 0, 0))
        for sy in (-rail_y, rail_y):
            w = make_spoked_wheel(f"RodaTend_{wx:.2f}_{sy:.2f}", r_tend, 0.068, 10, (wx, sy, rail_top_z + r_tend), m_iron, m_brass, axis="Y")
            t_wheels.append(w)
            # Coixinet de greixatge i ballesta del tènder
            make_box(f"CoixTend_{wx:.2f}_{sy:.2f}", (0.12, 0.07, 0.10), (wx, sy, rail_top_z + r_tend + 0.05), m_iron, bevel=0.004)
            make_box(f"BallestaTend_{wx:.2f}_{sy:.2f}", (0.42, 0.05, 0.045), (wx, sy, 0.64), m_iron, bevel=0.005)

    # Bota d'aigua seccionada per mostrar l'aigua de reserva + cèrcols + embut de llautó + mànega
    make_cutaway_cyl(
        "BotaCos",
        0.29,
        0.33,
        0.82,
        (tend_x - 0.33, 0.0, 1.06),
        m_red,
        start_ang=-0.12 * math.pi,
        end_ang=1.18 * math.pi,
        segs=32,
        rot=(0.0, math.pi / 2, 0.0),
    )
    make_cyl("BotaTapaEsq", 0.325, 0.04, (tend_x - 0.72, 0.0, 1.06), m_oak, rot=(0, math.pi / 2, 0))
    make_cyl("BotaTapaDret", 0.325, 0.04, (tend_x + 0.06, 0.0, 1.06), m_oak, rot=(0, math.pi / 2, 0))
    make_cutaway_cyl(
        "AiguaBota",
        0.01,
        0.28,
        0.74,
        (tend_x - 0.33, 0.0, 1.06),
        m_water,
        start_ang=-0.10 * math.pi,
        end_ang=0.58 * math.pi,
        segs=22,
        rot=(0.0, math.pi / 2, 0.0),
    )
    for cx in (-0.34, -0.13, 0.13, 0.34):
        make_cutaway_cyl(
            f"CercolBota_{cx:.2f}",
            0.328,
            0.342,
            0.032,
            (tend_x - 0.33 + cx, 0.0, 1.06),
            m_iron,
            start_ang=-0.12 * math.pi,
            end_ang=1.18 * math.pi,
            segs=28,
            rot=(0.0, math.pi / 2, 0.0),
        )
    make_cyl("TapBota", 0.055, 0.09, (tend_x - 0.33, 0.0, 1.42), m_brass)
    make_cone("EmbutBota", 0.09, 0.04, 0.08, (tend_x - 0.33, 0.0, 1.49), m_brass)
    make_coal_pile("PilaCocTender", (tend_x + 0.46, 0.0, 0.78), 0.34, 0.42, 0.38, m_coal, count=64, seed=17)
    make_curve_tube("ManegaAigua", [(tend_x + 0.06, -0.24, 0.84), (-1.75, -0.28, 0.68), (-1.30, -0.34, 0.82), (-0.75, -0.44, 0.92)], 0.028, m_copper)
    make_box("EnganxallTender", (0.42, 0.12, 0.055), (-1.66, 0.0, 0.68), m_iron, bevel=0.005)

    # 3. BASTIDOR DE LA LOCOMOTORA, TOPALLS, BALLESTES I RODES REBLADES
    make_box("BastidorDarr", (3.08, 0.08, 0.14), (0.05, rail_y + 0.04, 0.72), m_yellow, bevel=0.008)
    make_box("BastidorFrontInf", (3.08, 0.08, 0.10), (0.05, -rail_y - 0.04, 0.66), m_yellow, bevel=0.006)
    make_box("TravesTopall", (0.14, 1.22, 0.18), (1.60, 0.0, 0.70), m_wood, bevel=0.01)
    for ty in (-0.42, 0.42):
        make_cyl(f"Topall_{ty:.2f}", 0.085, 0.15, (1.72, ty, 0.70), m_iron, rot=(0, math.pi / 2, 0), bevel=0.008)
        make_cyl(f"PlatTopall_{ty:.2f}", 0.11, 0.025, (1.80, ty, 0.70), m_steel, rot=(0, math.pi / 2, 0))
    make_box("PlataformaMaquinista", (0.64, 1.12, 0.08), (-1.42, 0.0, 0.74), m_wood, bevel=0.006)
    make_box("BaranaMaq1", (0.032, 0.032, 0.58), (-1.68, 0.48, 1.04), m_iron)
    make_box("BaranaMaq2", (0.032, 0.032, 0.58), (-1.68, -0.48, 1.04), m_iron)
    make_box("BaranaSup", (0.036, 0.98, 0.032), (-1.68, 0.0, 1.32), m_iron)

    r_drive = 0.62
    drv_x = 0.74
    drv_z = rail_top_z + r_drive
    make_cyl("EixMotriu", 0.052, 1.18, (drv_x, 0.0, drv_z), m_steel, rot=(math.pi / 2, 0, 0))
    # Ballestes i caixes d'eix de les rodes motrius
    for sy in (-rail_y, rail_y):
        make_box(f"CaixaEixMot_{sy:.2f}", (0.14, 0.09, 0.14), (drv_x, sy, drv_z + 0.06), m_brass, bevel=0.005)
        make_box(f"BallestaMot_{sy:.2f}", (0.56, 0.055, 0.055), (drv_x, sy, drv_z + 0.16), m_iron, bevel=0.006)

    g_drv_front = add_empty("RodaMotriuFront", (drv_x, -rail_y, drv_z))
    make_spoked_wheel("RodaMotF", r_drive, 0.088, 16, (0, 0, 0), m_yellow, mat_hub=m_iron, axis="Y", parent=g_drv_front)
    make_torus("LlandaMotF", r_drive, 0.026, (0, 0, 0), m_steel, rot=(math.pi / 2, 0, 0), major_segs=44, parent=g_drv_front)
    make_rivet_ring("ReblonsRodaF", (0, -0.044, 0), r_drive - 0.038, 16, rivet_r=0.009, axis="Y", mat=m_iron, parent=g_drv_front)
    r_crank = 0.24
    make_cyl("BotoRodaFront", 0.038, 0.14, (r_crank, -0.07, 0.0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_drv_front)

    g_drv_back = add_empty("RodaMotriuDarr", (drv_x, rail_y, drv_z))
    make_spoked_wheel("RodaMotD", r_drive, 0.088, 16, (0, 0, 0), m_yellow, mat_hub=m_iron, axis="Y", parent=g_drv_back)
    make_torus("LlandaMotD", r_drive, 0.026, (0, 0, 0), m_steel, rot=(math.pi / 2, 0, 0), major_segs=44, parent=g_drv_back)
    make_cyl("BotoRodaDarr", 0.038, 0.14, (0.0, 0.07, r_crank), m_brass, rot=(math.pi / 2, 0, 0), parent=g_drv_back)

    r_trail = 0.36
    trl_x = -0.82
    trl_z = rail_top_z + r_trail
    make_cyl("EixPortador", 0.042, 1.14, (trl_x, 0.0, trl_z), m_steel, rot=(math.pi / 2, 0, 0))
    g_trl_f = make_spoked_wheel("RodaPortF", r_trail, 0.072, 10, (trl_x, -rail_y, trl_z), m_iron, m_brass, axis="Y")
    g_trl_d = make_spoked_wheel("RodaPortD", r_trail, 0.072, 10, (trl_x, rail_y, trl_z), m_iron, m_brass, axis="Y")

    # 4. FOGAR DOBLE PARET SECCIONAT (CAMISA D'AIGUA + COURE INTERIOR + PERNS D'ESTAI + CENDRER + INSTRUMENTS)
    fb_x = -1.08
    # Caixa exterior de ferro forjat (oberta pel davant -Y amb marc vermell de tall)
    make_box("FogarExtDarr", (0.64, 0.06, 0.78), (fb_x, 0.39, 1.14), m_iron, bevel=0.008)
    make_box("FogarExtSostre", (0.64, 0.62, 0.05), (fb_x, 0.11, 1.51), m_iron, bevel=0.008)
    make_box("FogarExtEsq", (0.06, 0.62, 0.78), (fb_x - 0.29, 0.11, 1.14), m_iron, bevel=0.008)
    # Camisa d'aigua que envolta el fogar per darrere, dalt i darrere el culat
    make_box("CamisaAiguaDarr", (0.52, 0.08, 0.62), (fb_x, 0.30, 1.15), m_water, bevel=0.004)
    make_box("CamisaAiguaSostre", (0.52, 0.44, 0.09), (fb_x, 0.08, 1.43), m_water, bevel=0.004)
    make_box("CamisaAiguaEsq", (0.07, 0.44, 0.56), (fb_x - 0.22, 0.08, 1.14), m_water, bevel=0.004)
    # Caixa interior de foc de coure amb perns d'estai visibles
    make_box("FogarCoureDarr", (0.44, 0.03, 0.54), (fb_x + 0.02, 0.23, 1.10), m_copper, bevel=0.004)
    make_box("FogarCoureSostre", (0.44, 0.36, 0.03), (fb_x + 0.02, 0.05, 1.37), m_copper, bevel=0.004)
    make_box("FogarCoureEsq", (0.03, 0.36, 0.54), (fb_x - 0.18, 0.05, 1.10), m_copper, bevel=0.004)
    # Marc vermell de secció del fogar (deixa clar on talla el pla seccionat)
    make_box("TallFogarSostre", (0.64, 0.025, 0.06), (fb_x, -0.20, 1.50), m_sec)
    make_box("TallFogarEsq", (0.06, 0.025, 0.78), (fb_x - 0.29, -0.20, 1.14), m_sec)
    # Perns d'estai (staybolts) entre la caixa de coure i l'exterior
    for sx in (fb_x - 0.10, fb_x + 0.06, fb_x + 0.20):
        for sz in (0.98, 1.14, 1.30):
            make_cyl(f"EstaiFogar_{sx:.2f}_{sz:.2f}", 0.011, 0.14, (sx, 0.30, sz), m_copper, rot=(math.pi / 2, 0, 0), verts=8)
    # Graella de barrots i cendrer inferior amb brases caigudes
    for gx in [fb_x - 0.14 + 0.055 * k for k in range(7)]:
        make_box(f"BarrotGraella_{gx:.2f}", (0.028, 0.42, 0.038), (gx, 0.02, 0.84), m_iron, bevel=0.002)
    make_box("Cendrer", (0.50, 0.44, 0.06), (fb_x + 0.02, 0.04, 0.72), m_iron, bevel=0.004)
    g_brases = add_empty("BrasesGrup", (fb_x + 0.02, 0.02, 0.87))
    make_coal_pile("BrasesIncandescents", (0.0, 0.0, 0.0), 0.19, 0.18, 0.14, m_fire, count=28, seed=9, parent=g_brases)
    make_coal_pile("CarboSobreBrases", (0.02, -0.02, 0.06), 0.15, 0.14, 0.10, m_coal, count=18, seed=13, parent=g_brases)
    # Llengües de flama que pugen cap als tubs de la caldera
    g_flames = add_empty("FlamesFogar", (fb_x + 0.16, 0.02, 1.06))
    for fli, (fz, fy, r_fl) in enumerate([(0.0, -0.06, 0.045), (0.08, 0.04, 0.050), (-0.06, 0.06, 0.040)]):
        make_cone(f"FlamaEntrada_{fli}", r_fl, 0.008, 0.22, (0.0, fy, fz), m_flame, rot=(0, math.pi / 2, 0), parent=g_flames)

    # Porta del fogar i instruments del culat (nivell de vidre, manòmetre, palanca regulador)
    make_torus("PortaFogarMarc", 0.11, 0.018, (fb_x - 0.32, 0.12, 1.04), m_brass, rot=(0, math.pi / 2, 0))
    make_cyl("NivellAiguaTub", 0.014, 0.26, (fb_x - 0.34, -0.08, 1.24), m_water)
    make_cyl("NivellBridaSup", 0.024, 0.04, (fb_x - 0.34, -0.08, 1.38), m_brass, rot=(0, math.pi / 2, 0))
    make_cyl("NivellBridaInf", 0.024, 0.04, (fb_x - 0.34, -0.08, 1.10), m_brass, rot=(0, math.pi / 2, 0))
    make_cyl("ManometreCos", 0.065, 0.035, (fb_x - 0.33, 0.18, 1.38), m_brass, rot=(0, math.pi / 2, 0))
    make_cyl("ManometreEsfera", 0.052, 0.012, (fb_x - 0.35, 0.18, 1.38), m_dial, rot=(0, math.pi / 2, 0))
    make_box("ReguladorPalanca", (0.03, 0.04, 0.28), (fb_x - 0.35, 0.02, 1.36), m_steel, rot=(0.35, 0, 0), bevel=0.003)

    # 5. CALDERA GROGA REBLADA (TALL FRONTAL REAL, AIGUA A BAIX + VAPOR A DALT + 18 TUBS DE COURE)
    cald_cx = 0.08
    cald_cz = 1.16
    cald_len = 1.78
    # Corfa exterior: a=0 és -Z (baix), a=pi/2 és +Y (darrere), a=pi és +Z (dalt), a=3pi/2 és -Y (davant obert!)
    make_cutaway_cyl(
        "CalderaExterior",
        0.38,
        0.43,
        cald_len,
        (cald_cx, 0.0, cald_cz),
        m_yellow,
        start_ang=-0.12 * math.pi,
        end_ang=1.14 * math.pi,
        segs=42,
        rot=(0.0, math.pi / 2, 0.0),
    )
    # Vora vermella de tall al llarg de la caldera per destacar el plànol de secció
    make_box("TallCaldInf", (cald_len, 0.055, 0.026), (cald_cx, -0.15, cald_cz - 0.38), m_sec)
    make_box("TallCaldSup", (cald_len, 0.055, 0.026), (cald_cx, -0.17, cald_cz + 0.37), m_sec)

    for rx in (-0.62, -0.14, 0.34, 0.82):
        make_cutaway_cyl(
            f"AnellCald_{rx:.2f}",
            0.425,
            0.448,
            0.045,
            (rx, 0.0, cald_cz),
            m_brass,
            start_ang=-0.12 * math.pi,
            end_ang=1.14 * math.pi,
            segs=42,
            rot=(0.0, math.pi / 2, 0.0),
        )
        make_rivet_ring(f"ReblonsCald_{rx:.2f}", (rx, 0.0, cald_cz), 0.436, 20, rivet_r=0.007, axis="X", mat=m_iron)

    # Plaques tabulars de coure (tube plates) als dos extrems de la caldera
    make_cutaway_cyl(
        "PlacaTubularEsq",
        0.02,
        0.38,
        0.032,
        (-0.79, 0.0, cald_cz),
        m_copper,
        start_ang=-0.08 * math.pi,
        end_ang=1.12 * math.pi,
        rot=(0, math.pi / 2, 0),
    )
    make_cutaway_cyl(
        "PlacaTubularDret",
        0.02,
        0.38,
        0.032,
        (0.95, 0.0, cald_cz),
        m_copper,
        start_ang=-0.08 * math.pi,
        end_ang=1.12 * math.pi,
        rot=(0, math.pi / 2, 0),
    )

    # Aigua a la meitat INFERIOR (-0.08*pi .. 0.50*pi) + superfície plana de nivell + vapor a la meitat SUPERIOR (0.52*pi .. 1.10*pi)
    make_cutaway_cyl(
        "AiguaCalderaCyl",
        0.01,
        0.365,
        cald_len - 0.08,
        (cald_cx, 0.0, cald_cz),
        m_water,
        start_ang=-0.08 * math.pi,
        end_ang=0.50 * math.pi,
        segs=28,
        rot=(0, math.pi / 2, 0),
    )
    make_box("SuperficieAigua", (cald_len - 0.10, 0.42, 0.018), (cald_cx, 0.14, cald_cz + 0.02), m_water)
    make_cutaway_cyl(
        "VaporCalderaCyl",
        0.01,
        0.355,
        cald_len - 0.10,
        (cald_cx, 0.0, cald_cz),
        m_steam_hot,
        start_ang=0.53 * math.pi,
        end_ang=1.08 * math.pi,
        segs=24,
        rot=(0, math.pi / 2, 0),
    )

    # Feix de 16 tubs de fum de coure repartits a la part submergida de la caldera
    tube_coords = [
        (cald_cz - 0.25, -0.06), (cald_cz - 0.25, 0.08),
        (cald_cz - 0.18, -0.16), (cald_cz - 0.18, -0.02), (cald_cz - 0.18, 0.12), (cald_cz - 0.18, 0.24),
        (cald_cz - 0.10, -0.22), (cald_cz - 0.10, -0.08), (cald_cz - 0.10, 0.06), (cald_cz - 0.10, 0.20),
        (cald_cz - 0.02, -0.16), (cald_cz - 0.02, -0.02), (cald_cz - 0.02, 0.12), (cald_cz - 0.02, 0.24),
        (cald_cz + 0.05, -0.06), (cald_cz + 0.05, 0.08),
    ]
    for ti, (tz, ty) in enumerate(tube_coords):
        make_cyl(f"TubFum_{ti}", 0.021, cald_len + 0.12, (cald_cx, ty, tz), m_copper, rot=(0, math.pi / 2, 0), verts=14)

    # Dom de vapor, tub col·lector interior i doble vàlvula de seguretat (cúpula + ressort Salter)
    make_cutaway_cyl(
        "PresaVapor",
        0.11,
        0.15,
        0.34,
        (-0.14, 0.0, 1.66),
        m_brass,
        start_ang=-0.10 * math.pi,
        end_ang=1.15 * math.pi,
        segs=28,
    )
    make_sphere("CupulaVapor", 0.15, (-0.14, 0.0, 1.83), m_brass)
    make_cyl("ValvSeguretat", 0.040, 0.22, (0.48, 0.0, 1.68), m_brass)
    make_cyl("RessortSalter", 0.026, 0.16, (0.60, -0.04, 1.64), m_brass)
    make_rod_between("PalancaSeguretat", (0.44, 0.0, 1.79), (0.66, -0.04, 1.74), 0.012, m_steel)
    # Canonada de vapor sec cap a la caixa de distribució del cilindre davanter i posterior
    make_curve_tube("TubPresaCil", [(-0.14, 0.0, 1.62), (-0.34, -0.26, 1.74), (-0.50, -0.54, 1.64)], 0.032, m_copper)
    make_curve_tube("TubPresaCilDarr", [(-0.14, 0.0, 1.62), (-0.34, 0.26, 1.74), (-0.50, 0.54, 1.64)], 0.032, m_copper)

    # 6. CAIXA DE FUMS SECCIONADA, BLASTPIPE DE COURE, XEMENEIA ATIRANTADA I PLOMALL
    chim_x = 1.15
    make_cutaway_cyl(
        "CaixaFums",
        0.36,
        0.42,
        0.40,
        (chim_x, 0.0, cald_cz),
        m_iron,
        start_ang=-0.10 * math.pi,
        end_ang=1.18 * math.pi,
        segs=36,
        rot=(0.0, math.pi / 2, 0.0),
    )
    make_rivet_ring("ReblonsCaixaFums", (chim_x + 0.17, 0.0, cald_cz), 0.40, 18, rivet_r=0.008, axis="X", mat=m_steel)
    make_cyl("XemeneiaCos", 0.15, 1.68, (chim_x, 0.0, 2.30), m_iron, bevel=0.008)
    make_cyl("AnellXem", 0.165, 0.055, (chim_x, 0.0, 1.68), m_iron)
    make_cyl("CoronaXem", 0.22, 0.14, (chim_x, 0.0, 3.16), m_brass, bevel=0.01)
    # Tirants diagonals de la xemeneia fins a la caldera
    make_rod_between("TirantXem1", (chim_x - 0.11, -0.09, 2.55), (0.35, -0.28, 1.56), 0.011, m_iron)
    make_rod_between("TirantXem2", (chim_x - 0.11, 0.09, 2.55), (0.35, 0.28, 1.56), 0.011, m_iron)
    # Tubs d'escapament d'ambdós cilindres que conflueixen al broquet blastpipe sota la xemeneia!
    make_curve_tube(
        "TubEscapament",
        [(-0.32, -0.56, 1.56), (0.35, -0.34, 1.66), (chim_x - 0.02, -0.06, 1.32), (chim_x, 0.0, 1.52)],
        0.032,
        m_copper,
    )
    make_curve_tube(
        "TubEscapamentDarr",
        [(-0.32, 0.56, 1.56), (0.35, 0.34, 1.66), (chim_x - 0.02, 0.06, 1.32), (chim_x, 0.0, 1.52)],
        0.032,
        m_copper,
    )
    make_cone("BroquetBlastpipe", 0.075, 0.036, 0.38, (chim_x, 0.0, 1.54), m_brass)
    g_fum = add_empty("FumXemeneia", (chim_x, 0.0, 3.26))
    make_smoke_plume("PlomallXem", (0.0, 0.0, 0.0), 0.98, -0.78, 0.05, 0.13, m_smoke, wisps=22, seed=19, parent=g_fum)

    # 7. CILINDRE INCLINAT SECCIONAT + CAIXA DE DISTRIBUCIÓ SECCIONADA + VÀLVULA CORREDORA + EXCÈNTRICA
    p_cyl = Vector((-0.52, -0.58, 1.44))
    p_axle = Vector((drv_x, -0.58, drv_z))
    cyl_dir = (p_axle - p_cyl).normalized()
    ang_cyl = math.atan2(-cyl_dir.z, cyl_dir.x)

    g_cyl_incl = add_empty("CilindreInclinatGrup", tuple(p_cyl))
    g_cyl_incl.rotation_euler = (0.0, ang_cyl, 0.0)
    make_cutaway_cyl(
        "CilindreRocket",
        0.13,
        0.18,
        0.54,
        (0.0, 0.0, 0.0),
        m_brass,
        start_ang=-0.10 * math.pi,
        end_ang=1.15 * math.pi,
        segs=32,
        rot=(0.0, math.pi / 2, 0.0),
        parent=g_cyl_incl,
    )
    make_cyl("TapaCilDarr", 0.185, 0.04, (-0.28, 0.0, 0.0), m_iron, rot=(0, math.pi / 2, 0), parent=g_cyl_incl)
    make_cyl("Prensaestopes", 0.065, 0.07, (0.28, 0.0, 0.0), m_brass, rot=(0, math.pi / 2, 0), parent=g_cyl_incl)
    make_box("GuiaInclSup", (0.58, 0.06, 0.026), (0.58, 0.0, 0.095), m_steel, parent=g_cyl_incl, bevel=0.002)
    make_box("GuiaInclInf", (0.58, 0.06, 0.026), (0.58, 0.0, -0.095), m_steel, parent=g_cyl_incl, bevel=0.002)

    # Caixa de distribució (steam chest) just sobre el cilindre seccionada per veure la vàlvula corredora D!
    make_box("CaixaDistDarr", (0.34, 0.04, 0.14), (0.0, 0.06, 0.23), m_iron, parent=g_cyl_incl, bevel=0.005)
    make_box("CaixaDistSostre", (0.34, 0.13, 0.03), (0.0, 0.0, 0.29), m_sec, parent=g_cyl_incl)
    make_box("PortVaporEsq", (0.04, 0.06, 0.07), (-0.11, 0.0, 0.16), m_copper, parent=g_cyl_incl)
    make_box("PortVaporDret", (0.04, 0.06, 0.07), (0.11, 0.0, 0.16), m_copper, parent=g_cyl_incl)
    g_valve = add_empty("ValvulaCorredoraGrup", (0.0, -0.01, 0.21), parent=g_cyl_incl)
    make_box("ValvulaCorredora", (0.14, 0.07, 0.06), (0.0, 0.0, 0.0), m_copper, parent=g_valve, bevel=0.005)
    make_cyl("VaretaValvula", 0.012, 0.56, (0.28, 0.0, 0.0), m_steel, rot=(0, math.pi / 2, 0), parent=g_valve)

    # Cilindre simètric al costat oposat (+Y) perquè la vista 360° sigui completa
    g_cyl_far = add_empty("CilindreOposatGrup", (-0.52, 0.58, 1.44))
    g_cyl_far.rotation_euler = (0.0, ang_cyl, 0.0)
    make_cyl("CilindreOposat", 0.175, 0.54, (0, 0, 0), m_brass, rot=(0, math.pi / 2, 0), parent=g_cyl_far, bevel=0.008)
    make_box("BielaOposada", (1.28, 0.04, 0.06), (0.85, 0, 0), m_steel, parent=g_cyl_far, bevel=0.004)

    g_piston = add_empty("PistoInclinat", (0.0, 0.0, 0.0), parent=g_cyl_incl)
    make_cyl("CapPistoRkt", 0.124, 0.078, (0.0, 0.0, 0.0), m_iron, rot=(0, math.pi / 2, 0), parent=g_piston)
    make_torus("CercPisto1", 0.125, 0.008, (-0.025, 0.0, 0.0), m_brass, rot=(0, math.pi / 2, 0), parent=g_piston)
    make_torus("CercPisto2", 0.125, 0.008, (0.025, 0.0, 0.0), m_brass, rot=(0, math.pi / 2, 0), parent=g_piston)
    make_cyl("TijaPistoRkt", 0.022, 0.58, (0.29, 0.0, 0.0), m_steel, rot=(0, math.pi / 2, 0), parent=g_piston)
    make_box("CreueraRkt", (0.11, 0.09, 0.16), (0.58, 0.0, 0.0), m_brass, parent=g_piston, bevel=0.005)
    # Bomba d'alimentació d'aigua accionada des de la creuera cap a la caldera
    make_cyl("BombaAiguaCos", 0.042, 0.24, (0.05, -0.45, 1.05), m_brass, rot=(0, math.pi / 2, 0))
    make_cyl("EmbolBomba", 0.022, 0.22, (-0.12, -0.45, 1.05), m_steel, rot=(0, math.pi / 2, 0))

    L_biela = 0.85
    g_biela = add_empty("BielaRocket", (0, 0, 0))
    make_box("BielaRktCos", (L_biela, 0.042, 0.068), (L_biela * 0.5, 0.0, 0.0), m_steel, parent=g_biela, bevel=0.006)
    make_box("CapBiela1", (0.11, 0.07, 0.10), (0.0, 0.0, 0.0), m_brass, parent=g_biela, bevel=0.004)
    make_box("CapBiela2", (0.12, 0.07, 0.11), (L_biela, 0.0, 0.0), m_brass, parent=g_biela, bevel=0.004)

    # Excèntrica a l'eix motriu + vareta d'excèntrica fins a la caixa de distribució
    g_excentrica = add_empty("ExcentricaEix", (drv_x, -0.40, drv_z))
    make_cyl("DiscExcentrica", 0.095, 0.045, (0.04, 0.0, 0.0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_excentrica)

    # 8. FOGONER / MAQUINISTA A ESCALA SOBRE LA PLATAFORMA (costat oposat a la càmera)
    worker = make_worker("MaquinistaRocket", (-1.52, 0.16, 0.78), facing_yaw=-math.pi * 0.45, scale=0.92, role="weaver")

    def apply_pose(p):
        theta = 2.0 * math.pi * p
        g_drv_front.rotation_euler = (0.0, theta, 0.0)
        g_drv_back.rotation_euler = (0.0, theta, 0.0)
        g_excentrica.rotation_euler = (0.0, theta, 0.0)
        rot_t = theta * (r_drive / r_trail)
        g_trl_f.rotation_euler = (0.0, rot_t, 0.0)
        g_trl_d.rotation_euler = (0.0, rot_t, 0.0)
        for tw in t_wheels:
            tw.rotation_euler = (0.0, rot_t * (r_trail / r_tend), 0.0)

        cx = drv_x + r_crank * math.cos(theta)
        cz = drv_z - r_crank * math.sin(theta)
        dp = Vector((cx - p_cyl.x, 0.0, cz - p_cyl.z))
        along = dp.dot(cyl_dir)
        perp = (dp - cyl_dir * along).length
        back_dist = math.sqrt(max(0.01, L_biela * L_biela - perp * perp))
        s_cross = along - back_dist
        s_piston = s_cross - 0.58
        g_piston.location = (s_piston, 0.0, 0.0)
        # La vàlvula corredora avança ~90° respecte al pistó per obrir l'admissió abans del punt mort
        g_valve.location = (0.075 * math.sin(theta - ang_cyl), -0.01, 0.21)

        cross_world = p_cyl + cyl_dir * s_cross
        g_biela.location = (cross_world.x, -0.58, cross_world.z)
        ang_b = math.atan2(-(cz - cross_world.z), cx - cross_world.x)
        g_biela.rotation_euler = (0.0, ang_b, 0.0)

        g_fum.location = (chim_x, 0.0, 3.26 + 0.08 * math.sin(theta * 2.0))
        g_brases.scale = (1.0, 1.0, 0.94 + 0.08 * math.sin(theta * 2.0))
        g_flames.scale = (1.0 + 0.14 * math.sin(theta * 2.0), 1.0, 0.95 + 0.08 * math.cos(theta * 2.0))
        set_worker_pose(
            worker,
            torso_rot=(0.06, 0.0, -0.10),
            head_rot=(-0.05, 0.0, 0.10 + 0.06 * math.sin(theta)),
            r_sh=(0.62, -0.12, -0.18),
            r_elb=(-0.55, 0.0, 0.0),
            l_sh=(0.35, 0.08, 0.10),
            l_elb=(-0.45, 0.0, 0.0),
        )

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        worker_objs = [worker["head"], worker["torso"], worker["r_sh"], worker["r_elb"]]
        anim_objs = [
            g_drv_front,
            g_drv_back,
            g_excentrica,
            g_trl_f,
            g_trl_d,
            g_piston,
            g_valve,
            g_biela,
            g_fum,
            g_brases,
            g_flames,
        ] + t_wheels + worker_objs
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
        apply_pose(0.20)

    cam_loc = (2.85, -7.45, 2.95)
    target = (-0.42, 0.0, 1.48)
    setup_lighting(cam_loc, target, lens=42.0, mood="workshop")

    anchors = {
        "tender": (tend_x, -0.18, 1.12),
        "fogar": (-1.08, -0.10, 1.05),
        "caldera": (0.08, -0.15, 1.24),
        "tubs": (0.18, -0.05, 1.04),
        "vapor": (-0.14, -0.08, 1.78),
        "cilindre": (-0.50, -0.58, 1.48),
        "biela": (0.28, -0.60, 1.12),
        "roda": (drv_x + 0.12, -0.58, drv_z - 0.08),
        "escapament": (1.10, -0.12, 1.48),
        "xemeneia": (chim_x, -0.14, 2.65),
    }

    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
    render_image(os.path.join(out_dir, "rocket-muntada.png"), res_x=1200, res_y=760, samples=32)
    render_closeup(os.path.join(out_dir, "rocket-detall.png"), (0.25, -2.95, 1.82), (-0.15, -0.12, 1.22), lens=46.0, samples=28)

    proj = project_anchors(anchors)
    export_glb_and_meta("rocket", "rocket.glb", anchors, extra_meta={"proj_2d": proj})


if __name__ == "__main__":
    build_rocket(animate=True)

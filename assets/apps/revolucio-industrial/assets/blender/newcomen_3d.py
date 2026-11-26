# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Generador 3D procedural (Blender 5.3 CLI) — rigor museogràfic i PBR:
Màquina de vapor atmosfèrica de Thomas Newcomen (1712 / model museogràfic de Dudley Castle).

Diferències històriques respecte de Watt:
  - Caldera de coure tipus paller situada directament SOTA el cilindre vertical
  - Cilindre de llautó OBERT per dalt (l'aire atmosfèric empeny directament el pistó)
  - Segell d'aigua freda damunt mateix del pistó
  - Dipòsit elevat d'aigua freda amb canonada d'injecció DIRECTA dins del cilindre
  - Tub i pou calent de desguàs per evacuar l'aigua condensada després de cada cop
  - Balancí simètric de roure sobre mur/pilar de maó amb cadenes planes i bomba de mina amb contrapès

Ús:
  blender -b -P assets/blender/newcomen_3d.py
  blender -b -P assets/blender/newcomen_3d.py -- --glb-only
"""

import json
import math
import os
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if THIS_DIR not in sys.path:
    sys.path.insert(0, THIS_DIR)

import watt_3d as w3d
from watt_3d import (
    MODELS_DIR,
    OUT_DIR,
    add_empty,
    anchors_to_gltf_3d,
    build_pbr_pair,
    clear_scene,
    hex_rgba,
    link_obj,
    make_box,
    make_chain_links,
    make_concentric_arch_head,
    make_cutaway_cylinder,
    make_cyl,
    make_mat,
    make_pipe_elbow,
    make_sphere,
    make_tapered_beam,
    render_image,
    set_linear_fcurves,
)


def build_newcomen_scene(animate=False):
    clear_scene()

    pbr_brick = build_pbr_pair("NcMao", "brick", 512, 512, bump_scale=3.0)
    pbr_wood = build_pbr_pair("NcRoure", "wood", 512, 512, bump_scale=2.2)
    pbr_stone = build_pbr_pair("NcPedra", "stone", 512, 512, bump_scale=2.6)
    pbr_iron = build_pbr_pair("NcFerro", "castiron", 512, 512, bump_scale=2.0)
    pbr_copper = build_pbr_pair("NcCoure", "copper", 512, 512, bump_scale=1.2)

    m_stone = make_mat("Pedra", "#aea389", roughness=0.90, pbr_pair=pbr_stone, tex_scale=(1.1, 1.1), normal_strength=0.95)
    m_brick = make_mat("Mao", "#8f402a", roughness=0.86, pbr_pair=pbr_brick, tex_scale=(1.35, 1.35), normal_strength=1.0)
    m_wood = make_mat("Roure", "#8e5c30", roughness=0.64, pbr_pair=pbr_wood, tex_scale=(0.95, 0.95), normal_strength=0.75)
    m_wood_dark = make_mat("RoureFosc", "#5a3719", roughness=0.68, pbr_pair=pbr_wood, tex_scale=(1.15, 1.15), normal_strength=0.75)

    m_copper = make_mat("Coure", "#c46b3f", metallic=0.90, roughness=0.26, pbr_pair=pbr_copper, tex_scale=(1.2, 1.2), normal_strength=0.45)
    m_brass = make_mat("Llauto", "#d4a642", metallic=0.92, roughness=0.22)
    m_lead = make_mat("Plom", "#67727a", metallic=0.72, roughness=0.45)
    m_cut = make_mat("TallTecnic", "#b93d24", metallic=0.14, roughness=0.52)
    m_iron = make_mat("FerroColat", "#2f3439", metallic=0.84, roughness=0.45, pbr_pair=pbr_iron, tex_scale=(1.6, 1.6), normal_strength=0.65)
    m_steel = make_mat("AcerPolit", "#b8c0c8", metallic=0.96, roughness=0.18)
    m_water = make_mat("AiguaFreda", "#3a8dc2", metallic=0.05, roughness=0.08, alpha=0.72)
    m_glass = make_mat("VidreNivell", "#dbe9f2", metallic=0.05, roughness=0.08, alpha=0.42)
    m_steam_hi = make_mat("VaporCalentAlt", "#f7b57e", roughness=0.55, alpha=0.32, emission_hex="#f38b47", emission_strength=0.45)
    m_steam_mid = make_mat("VaporCalentMig", "#f5a76c", roughness=0.60, alpha=0.22, emission_hex="#f0823c", emission_strength=0.30)
    m_mist_cold = make_mat("BoiraInjeccio", "#8fd0f2", roughness=0.40, alpha=0.45, emission_hex="#47a0d6", emission_strength=0.35)
    m_fire = make_mat("FocCarbo", "#ff681c", roughness=0.9, emission_hex="#ff7214", emission_strength=5.2)
    m_coal = make_mat("Carbo", "#1d1815", roughness=0.95)
    m_valv_open = make_mat("ValvulaOberta", "#4f9b33", metallic=0.35, roughness=0.35)
    m_valv_shut = make_mat("ValvulaTancada", "#c43f27", metallic=0.35, roughness=0.35)

    # --- 0. SÒL OMBRA, BASE DE PEDRA I POU DE LA MINA ---
    if not animate:
        bpy.ops.mesh.primitive_plane_add(size=38.0, location=(0.4, 0.0, -0.004))
        shadow_pl = bpy.context.active_object
        shadow_pl.name = "SombraTerra"
        shadow_pl.is_shadow_catcher = True

    g_base = add_empty("Base")
    make_box("PeanyaPedra", (8.8, 2.95, 0.36), (-0.40, 0.0, 0.18), m_stone, parent=g_base, bevel=0.03)
    make_cutaway_cylinder("PouMina", 1.04, 0.73, 0.0, 0.96, (4.25, 0.0, 0.0), m_stone, m_stone, 0.38, 0.96, ang0=-0.62, ang1=0.62, top_open=True, parent=g_base)
    for s_i in range(10):
        sa = -math.pi * 0.28 + (1.58 * math.pi) * (s_i / 9.0)
        make_box(f"BrocalCarreu_{s_i}", (0.34, 0.34, 0.11), (4.25 + 0.89 * math.cos(sa), 0.89 * math.sin(sa), 1.00), m_stone, rot=(0, 0, sa), parent=g_base, bevel=0.014)
    make_cyl("PouAigua", 0.725, 0.62, (4.25, 0.0, 0.32), m_water, parent=g_base, bevel=0.0)
    make_box("PouPuntalEsq", (0.11, 0.11, 0.62), (3.66, 0.0, 0.44), m_wood_dark, parent=g_base)
    make_box("PouPuntalDret", (0.11, 0.11, 0.62), (4.84, 0.0, 0.44), m_wood_dark, parent=g_base)
    make_box("BassaDesguas", (1.36, 1.36, 0.56), (5.72, 0.0, 0.28), m_stone, parent=g_base, bevel=0.025)
    make_box("BassaVora", (1.44, 1.44, 0.09), (5.72, 0.0, 0.56), m_stone, parent=g_base, bevel=0.015)
    make_box("BassaAigua", (1.10, 1.10, 0.42), (5.72, 0.0, 0.36), m_water, parent=g_base, bevel=0.0)

    # --- 1. FOGAR DE MAÓ, CALDERA DE COURE DIRECTAMENT SOTA EL CILINDRE (X = -1.65) ---
    g_fogar = add_empty("FogarCaldera", (-1.65, 0.0, 0.36))
    make_box("FogarSocol", (2.30, 2.04, 0.14), (0.0, 0.0, 0.07), m_stone, parent=g_fogar, bevel=0.02)
    make_box("FogarCos", (2.14, 1.90, 1.24), (0.0, 0.0, 0.70), m_brick, parent=g_fogar, bevel=0.02)
    make_box("FogarCornisa", (2.26, 2.02, 0.10), (0.0, 0.0, 1.34), m_stone, parent=g_fogar, bevel=0.018)
    for bx in (-0.86, 0.86):
        make_box(f"BuckstayDavant_{bx}", (0.08, 0.06, 1.36), (bx, -0.97, 0.72), m_iron, parent=g_fogar, bevel=0.008)
        make_box(f"BuckstayDarrere_{bx}", (0.08, 0.06, 1.36), (bx, 0.97, 0.72), m_iron, parent=g_fogar, bevel=0.008)
        make_cyl(f"TirantFogar_{bx}", 0.016, 2.02, (bx, 0.0, 1.26), m_iron, rot=(math.pi / 2, 0, 0), verts=10, parent=g_fogar, bevel=0.0)

    make_box("XemeneiaBase", (0.70, 0.70, 0.65), (-0.75, 0.92, 1.35), m_brick, parent=g_fogar, bevel=0.015)
    make_box("XemeneiaFogar", (0.58, 0.58, 3.05), (-0.75, 0.92, 2.75), m_brick, parent=g_fogar, bevel=0.015)
    make_box("XemeneiaRemat", (0.72, 0.72, 0.13), (-0.75, 0.92, 4.30), m_stone, parent=g_fogar, bevel=0.015)

    # Boca del fogar amb dovelles i brases vives
    make_box("BocaFoc", (0.64, 0.14, 0.54), (0.0, -0.92, 0.52), m_coal, parent=g_fogar, bevel=0.0)
    for di in range(-3, 4):
        da = di * 0.23
        make_box(f"DovellaFoc_{di}", (0.12, 0.11, 0.12), (0.34 * math.sin(da), -0.95, 0.62 + 0.25 * math.cos(da)), m_brick, rot=(0, da, 0), parent=g_fogar, bevel=0.008)
    make_box("MarcFerroFogar", (0.80, 0.07, 0.54), (0.0, -0.97, 0.50), m_iron, parent=g_fogar, bevel=0.006)
    make_box("PortaFoc", (0.28, 0.05, 0.44), (-0.28, -0.99, 0.48), m_iron, rot=(0, 0, -0.58), parent=g_fogar, bevel=0.006)
    for bi in range(6):
        make_sphere(f"Brasa_{bi}", 0.095, (-0.19 + bi * 0.075, -0.89, 0.37), m_fire, segs=10, rings=8, parent=g_fogar)

    # Caldera de paller de coure directament sota el cilindre (Z_base=1.39, cim=2.45)
    make_cyl("CalderaCos", 0.90, 0.76, (0.0, 0.0, 1.76), m_copper, verts=38, parent=g_fogar)
    make_sphere("CalderaCupula", 0.90, (0.0, 0.0, 2.08), m_copper, segs=36, rings=20, parent=g_fogar)
    make_cyl("CalderaCinturo", 0.92, 0.08, (0.0, 0.0, 1.78), m_brass, verts=38, parent=g_fogar)
    for ri in range(16):
        ra = 2 * math.pi * ri / 16.0
        make_sphere(f"RebloCaldera_{ri}", 0.021, (0.915 * math.cos(ra), 0.915 * math.sin(ra), 1.84), m_brass, segs=8, rings=6, parent=g_fogar)
        make_sphere(f"RebloCupula_{ri}", 0.020, (0.835 * math.cos(ra), 0.835 * math.sin(ra), 2.18), m_brass, segs=8, rings=6, parent=g_fogar)
    make_cyl("CalderaManHole", 0.16, 0.12, (-0.38, -0.45, 2.38), m_iron, rot=(0.40, -0.35, 0), parent=g_fogar)
    make_cyl("NivellVidre", 0.028, 0.38, (0.48, -0.86, 1.78), m_glass, verts=12, parent=g_fogar, bevel=0.0)
    # Coll curt de vapor cap al cilindre superior
    make_cyl("CollVapor", 0.21, 0.32, (0.0, 0.0, 2.86), m_brass, verts=22, parent=g_fogar)

    # --- 2. BASTIDA DE FUSTA, DIPÒSIT D'AIGUA FREDA I POU CALENT DE DESGUÀS ---
    g_aux = add_empty("BastidaAux", (0.0, 0.0, 0.36))
    for px in (-3.65, -2.92):
        for py in (-0.42, 0.42):
            make_box(f"PilarBastida_{px}_{py}", (0.11, 0.11, 3.25), (px, py, 1.62), m_wood_dark, parent=g_aux, bevel=0.008)
    make_box("PlataformaDip", (1.02, 1.06, 0.10), (-3.28, 0.0, 3.28), m_wood, parent=g_aux, bevel=0.008)
    # Dipòsit elevat d'aigua freda (folrat en plom amb superfície d'aigua visible)
    make_box("DipositFredCos", (0.84, 0.84, 0.64), (-3.28, 0.0, 3.65), m_lead, parent=g_aux, bevel=0.012)
    make_box("DipositFredCercol", (0.88, 0.88, 0.06), (-3.28, 0.0, 3.76), m_iron, parent=g_aux, bevel=0.005)
    make_box("DipositFredAigua", (0.72, 0.72, 0.12), (-3.28, 0.0, 3.93), m_water, parent=g_aux, bevel=0.0)
    # Canonada d'injecció d'aigua freda des del dipòsit fins a l'interior del cilindre
    make_pipe_elbow(
        "TubInjeccio",
        [(-3.28, 0.0, 3.33), (-3.28, 0.0, 2.95), (-1.92, 0.0, 2.95), (-1.65, 0.0, 2.95)],
        0.044,
        m_copper,
        mat_flange=m_brass,
        parent=g_aux,
    )
    make_box("CaixaValvInjeccio", (0.18, 0.18, 0.20), (-2.65, 0.0, 2.95), m_brass, parent=g_aux, bevel=0.010)
    g_maneta_inj = add_empty("ManetaInjeccio", (-2.65, -0.13, 2.95 + 0.36))
    make_cyl("ManInjEix", 0.024, 0.10, (0.0, 0.03, 0.0), m_brass, rot=(math.pi / 2, 0, 0), verts=12, parent=g_maneta_inj)
    make_box("ManInjBarra", (0.24, 0.030, 0.036), (-0.09, 0.0, 0.0), m_steel, parent=g_maneta_inj, bevel=0.004)
    make_cyl("ManInjPom", 0.038, 0.07, (-0.22, 0.0, 0.0), m_valv_shut, rot=(0, math.pi / 2, 0), verts=12, parent=g_maneta_inj)

    # Vàlvula reguladora del vapor entre caldera i cilindre
    g_maneta_adm = add_empty("ManetaVapor", (-1.65, -0.22, 3.22))
    make_cyl("ManAdmEix", 0.025, 0.12, (0.0, 0.04, 0.0), m_brass, rot=(math.pi / 2, 0, 0), verts=12, parent=g_maneta_adm)
    make_box("ManAdmBarra", (0.26, 0.032, 0.038), (0.10, 0.0, 0.0), m_steel, parent=g_maneta_adm, bevel=0.004)
    make_cyl("ManAdmPom", 0.038, 0.07, (0.24, 0.0, 0.0), m_valv_open, rot=(0, math.pi / 2, 0), verts=12, parent=g_maneta_adm)

    # Canonada de desguàs cap al pou calent de fusta al terra
    make_pipe_elbow(
        "TubDesguas",
        [(-1.65, 0.0, 3.04), (-2.55, 0.0, 3.04), (-3.28, 0.0, 2.40), (-3.28, 0.0, 0.58)],
        0.042,
        m_lead,
        mat_flange=m_iron,
        parent=g_aux,
    )
    make_cyl("PouCalentTina", 0.36, 0.54, (-3.28, 0.0, 0.27), m_wood, verts=22, parent=g_aux)
    make_cyl("PouCalentCercol", 0.375, 0.06, (-3.28, 0.0, 0.42), m_iron, verts=22, parent=g_aux)
    make_cyl("PouCalentAigua", 0.32, 0.14, (-3.28, 0.0, 0.49), m_water, verts=22, parent=g_aux, bevel=0.0)

    # --- 3. CILINDRE OBERT PER DALT SECCIONAT, PISTÓ AMB SEGELL D'AIGUA I INJECCIÓ ---
    cyl_z = 3.36
    g_cyl = add_empty("Cilindre", (-1.65, 0.0, cyl_z))
    make_cutaway_cylinder("CilindreCos", 0.50, 0.42, 0.0, 1.56, (0.0, 0.0, 0.0), m_brass, m_cut, 0.16, 1.48, ang0=-1.15, ang1=0.35, top_open=True, parent=g_cyl)
    make_cyl("CilindreBridaInf", 0.57, 0.09, (0.0, 0.0, 0.04), m_brass, parent=g_cyl)
    make_cyl("CilindreAnellSup", 0.55, 0.07, (0.0, 0.0, 1.53), m_brass, parent=g_cyl)

    # Vapor càlid sota el pistó i raig d'aigua freda d'injecció dins del cilindre
    g_vap_baix = add_empty("VaporCilindre", (-1.65, 0.0, cyl_z + 0.10))
    for i, r_sc in enumerate((0.39, 0.33, 0.25)):
        make_cyl(f"VaporNuv_{i}", r_sc, 0.50 - i * 0.05, (0.0, 0.0, 0.26), m_steam_hi if i == 0 else m_steam_mid, verts=22, parent=g_vap_baix, bevel=0.04)

    g_inj_mist = add_empty("RaigInjeccio", (-1.65, 0.0, cyl_z + 0.38))
    make_cyl("RaigInjeccioNucli", 0.024, 0.42, (-0.10, -0.05, 0.18), m_mist_cold, rot=(0.0, 0.45, 0.0), verts=12, parent=g_inj_mist, bevel=0.0)
    make_sphere("BoiraFreda", 0.26, (0.0, -0.05, 0.28), m_mist_cold, segs=16, rings=10, parent=g_inj_mist)

    # Pistó obert per dalt amb capa d'aigua segelladora damunt seu + tija + cadena plana fins al balancí
    piston_base_z = cyl_z + 0.85
    g_piston = add_empty("Piston", (-1.65, 0.0, piston_base_z))
    make_cyl("PistonDisc", 0.415, 0.24, (0.0, 0.0, 0.0), m_iron, parent=g_piston, bevel=0.010)
    make_cyl("PistonEstopada", 0.425, 0.07, (0.0, 0.0, 0.0), m_brass, parent=g_piston, bevel=0.005)
    # Segell d'aigua damunt del pistó de Newcomen
    make_cyl("PistonSegellAigua", 0.40, 0.08, (0.0, 0.0, 0.145), m_water, parent=g_piston, bevel=0.0)
    make_cyl("PistonTija", 0.062, 1.02, (0.0, 0.0, 0.58), m_steel, parent=g_piston, bevel=0.004)
    make_cyl("PistonForquilla", 0.10, 0.14, (0.0, 0.0, 1.12), m_iron, parent=g_piston)
    make_chain_links("CadPist", 0.0, 0.0, 1.62, 1.14, m_iron, mat_pin=m_brass, parent=g_piston)

    # --- 4. PILAR CENTRAL DE MAÓ I GRAN BALANCÍ SIMÈTRIC DE ROURE ---
    g_pilar = add_empty("PilarCentral", (1.30, 0.0, 0.36))
    make_box("PilarSocol", (1.46, 1.42, 0.26), (0.0, 0.0, 0.13), m_stone, parent=g_pilar, bevel=0.025)
    make_box("PilarBase", (1.26, 1.22, 0.18), (0.0, 0.0, 0.34), m_stone, parent=g_pilar, bevel=0.018)
    make_box("PilarCos", (1.08, 1.04, 4.10), (0.0, 0.0, 2.45), m_brick, parent=g_pilar, bevel=0.02)
    make_box("PilarAnellPedra", (1.18, 1.14, 0.14), (0.0, 0.0, 2.40), m_stone, parent=g_pilar, bevel=0.015)
    make_box("PilarCapcal", (1.36, 1.28, 0.24), (0.0, 0.0, 4.62), m_stone, parent=g_pilar, bevel=0.02)
    make_box("SuportPivotBase", (1.04, 0.82, 0.10), (0.0, 0.0, 4.78), m_iron, parent=g_pilar)
    make_box("SuportPivot", (0.88, 0.66, 0.42), (0.0, 0.0, 4.97), m_iron, parent=g_pilar)
    make_cyl("CoixinetPivot", 0.16, 0.84, (0.0, 0.0, 5.24), m_brass, rot=(math.pi / 2, 0, 0), parent=g_pilar)

    pivot_z = 5.62
    g_balanci = add_empty("Balanci", (1.30, 0.0, pivot_z))
    make_tapered_beam("BalanciBiga", 2.86, 2.86, 0.60, 0.42, 0.40, (0.0, 0.0, 0.0), m_wood, parent=g_balanci)
    for side in (-1, 1):
        make_box(f"BigaTira_{side}", (5.45, 0.022, 0.08), (0.0, side * 0.21, 0.0), m_iron, parent=g_balanci, bevel=0.004)
    for px in (-2.4, -1.2, 1.2, 2.4):
        make_cyl(f"BigaPern_{px}", 0.024, 0.46, (px, 0.0, 0.0), m_iron, rot=(math.pi / 2, 0, 0), verts=8, parent=g_balanci, bevel=0.0)
    make_box("BalanciPuntal", (0.24, 0.28, 0.64), (0.0, 0.0, 0.55), m_wood_dark, parent=g_balanci, bevel=0.012)
    make_box("PuntalCasquet", (0.32, 0.36, 0.12), (0.0, 0.0, 0.86), m_iron, parent=g_balanci)
    make_cyl("TirantEsq", 0.030, 2.65, (-1.28, 0.0, 0.54), m_iron, rot=(0.0, 1.32, 0.0), parent=g_balanci, bevel=0.002)
    make_cyl("TirantDret", 0.030, 2.65, (1.28, 0.0, 0.54), m_iron, rot=(0.0, -1.32, 0.0), parent=g_balanci, bevel=0.002)
    make_box("BalanciFerraduraC", (0.56, 0.46, 0.68), (0.0, 0.0, 0.0), m_iron, parent=g_balanci)
    make_cyl("BalanciEix", 0.12, 0.68, (0.0, 0.0, 0.0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_balanci)
    make_concentric_arch_head("ArcEsq", 2.95, 0.34, 0.36, True, 0.0, m_wood_dark, m_iron, parent=g_balanci)
    make_concentric_arch_head("ArcDret", 2.95, 0.34, 0.36, False, 0.0, m_wood_dark, m_iron, parent=g_balanci)

    # --- 5. BOMBA DE LA MINA AMB CONTRAPÈS SOBRE LA VARETA I CANALÓ (X = +4.25) ---
    g_bomba = add_empty("BombaMina", (4.25, 0.0, 0.96))
    make_box("GuiaBombaP1", (0.16, 0.16, 1.48), (-0.48, 0.0, 0.72), m_wood, parent=g_bomba)
    make_box("GuiaBombaP2", (0.16, 0.16, 1.48), (0.48, 0.0, 0.72), m_wood, parent=g_bomba)
    make_box("GuiaBombaTrav", (1.22, 0.22, 0.14), (0.0, 0.0, 1.32), m_iron, parent=g_bomba)
    make_cyl("GuiaCollar", 0.15, 0.20, (0.0, 0.0, 1.32), m_brass, parent=g_bomba)
    make_cyl("BombaCos", 0.24, 1.15, (0.0, 0.0, -0.18), m_copper, parent=g_bomba)
    make_cyl("BombaBridaSup", 0.29, 0.07, (0.0, 0.0, 0.36), m_brass, parent=g_bomba)
    make_cyl("BombaBridaInf", 0.29, 0.07, (0.0, 0.0, -0.72), m_brass, parent=g_bomba)
    make_cyl("BombaTubSubmergit", 0.15, 0.52, (0.0, 0.0, -0.78), m_iron, parent=g_bomba)
    make_box("CanaletaFusta", (1.42, 0.28, 0.12), (0.82, 0.0, 0.12), m_wood_dark, parent=g_bomba, bevel=0.008)
    make_box("CanaletaVora1", (1.42, 0.04, 0.16), (0.82, -0.12, 0.18), m_wood, parent=g_bomba, bevel=0.004)
    make_box("CanaletaVora2", (1.42, 0.04, 0.16), (0.82, 0.12, 0.18), m_wood, parent=g_bomba, bevel=0.004)
    make_box("CanaletaAigua", (1.36, 0.18, 0.05), (0.82, 0.0, 0.18), m_water, parent=g_bomba, bevel=0.0)
    g_raig_mina = make_cyl("RaigDesguas", 0.058, 0.56, (1.50, 0.0, -0.09), m_water, rot=(0.0, 0.18, 0.0), parent=g_bomba, bevel=0.0)

    g_bomba_tija = add_empty("BombaTija", (4.25, 0.0, 1.32))
    make_cyl("BombaBarra", 0.062, 3.62, (0.0, 0.0, 1.72), m_steel, parent=g_bomba_tija, bevel=0.004)
    # Contrapesos de ferro colat sobre la vareta (el seu pes arrossega el pistó amunt a la fase 1!)
    make_box("ContrapesVareta", (0.28, 0.28, 0.34), (0.0, 0.0, 1.75), m_iron, parent=g_bomba_tija, bevel=0.012)
    make_cyl("BombaEmbol", 0.19, 0.24, (0.0, 0.0, -0.14), m_brass, parent=g_bomba_tija)
    make_chain_links("CadBomba", 0.0, 0.0, 4.30, 3.40, m_iron, mat_pin=m_brass, parent=g_bomba_tija)

    def apply_pose(p):
        # u = +1 pistó amunt (omple vapor), u = -1 pistó avall (pressió atmosfèrica empeny)
        if p < 0.34:
            q = max(0.0, min(1.0, p / 0.34))
            u = -1.0 + 2.0 * (q * q * (3.0 - 2.0 * q))
        elif p < 0.47:
            u = 1.0
        elif p < 0.85:
            q = max(0.0, min(1.0, (p - 0.47) / 0.38))
            u = 1.0 - 2.0 * (q * q * (3.0 - 2.0 * q))
        else:
            u = -1.0

        ang = -0.15 * u  # Quan u=+1 (pistó amunt), extrem esquerre puja -> ang = -0.15
        g_balanci.rotation_euler = (0.0, ang, 0.0)
        dz_left = -2.95 * math.sin(ang)
        g_piston.location = (-1.65, 0.0, piston_base_z + dz_left)
        g_bomba_tija.location = (4.25, 0.0, 1.32 - dz_left)

        # Vapor sota el pistó
        piston_rel = 0.85 + dz_left
        vap_h = max(0.08, piston_rel - 0.14)
        g_vap_baix.scale = (1.0, 1.0, vap_h / 0.50)

        # Injecció freda activa entre 0.34 i 0.48
        inj_on = 0.33 <= p < 0.48
        g_inj_mist.scale = (1.0, 1.0, 1.0) if inj_on else (0.01, 0.01, 0.01)
        g_maneta_adm.rotation_euler = (0.0, 0.0 if p < 0.34 else -0.95, 0.0)
        g_maneta_inj.rotation_euler = (0.0, 0.0 if inj_on else -0.95, 0.0)
        g_raig_mina.scale = (1.0, 1.0, 1.0) if (0.47 <= p < 0.86) else (0.25, 0.25, 0.8)

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        anim_objs = [g_balanci, g_piston, g_bomba_tija, g_vap_baix, g_inj_mist, g_maneta_adm, g_maneta_inj, g_raig_mina]
        for fr in range(1, 61):
            p = (fr - 1) / 60.0
            apply_pose(p)
            for o in anim_objs:
                o.keyframe_insert(data_path="location", frame=fr)
                o.keyframe_insert(data_path="rotation_euler", frame=fr)
                o.keyframe_insert(data_path="scale", frame=fr)
        set_linear_fcurves(anim_objs)
    else:
        apply_pose(0.24)

    # --- IL·LUMINACIÓ I CÀMERA ---
    world = bpy.data.worlds.new("TallerNewcomen")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = hex_rgba("#f7f1e1", 1.0)
    bg.inputs["Strength"].default_value = 0.82

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
    cam_loc = Vector((2.6, -15.2, 5.4))
    target = Vector((0.80, 0.0, 2.85))
    cam_obj.location = cam_loc
    cam_obj.rotation_euler = (target - cam_loc).to_track_quat("-Z", "Y").to_euler()
    link_obj(cam_obj)
    bpy.context.scene.camera = cam_obj

    anchors = {
        "caldera": (-1.65, -0.90, 2.15),
        "cilindre": (-1.15, -0.45, 4.05),
        "piston": (-1.65, -0.45, piston_base_z + 0.15),
        "balanci": (0.20, -0.22, pivot_z + 0.16),
        "diposit": (-3.28, -0.42, 4.00),
        "desguas": (-3.28, -0.36, 0.85),
        "bombamina": (4.25, -0.28, 1.45),
    }
    return anchors


def _project_pct(anchors):
    scene = bpy.context.scene
    cam = scene.camera
    depsgraph = bpy.context.evaluated_depsgraph_get()
    out = {}
    for k, pt in anchors.items():
        co = world_to_camera_view(scene, cam, Vector(pt))
        out[k] = [round(co.x * 100.0, 1), round((1.0 - co.y) * 100.0, 1)]
    del depsgraph
    return out


def main():
    glb_only = "--glb-only" in sys.argv
    if not glb_only:
        anc = build_newcomen_scene(animate=False)
        render_image(os.path.join(OUT_DIR, "newcomen-muntada.png"), res_x=1360, res_y=840, samples=36, file_format="PNG")
        pts = _project_pct(anc)
        # Primer pla sobre el cilindre obert, el dipòsit d'injecció i la caldera sota seu
        scene = bpy.context.scene
        cam = scene.camera
        cam.location = Vector((-1.10, -5.80, 4.10))
        cam.rotation_euler = (Vector((-2.15, 0.0, 3.25)) - cam.location).to_track_quat("-Z", "Y").to_euler()
        cam.data.lens = 45.0
        render_image(os.path.join(OUT_DIR, "newcomen-detall.png"), res_x=960, res_y=540, samples=28, file_format="PNG")

    anc_glb = build_newcomen_scene(animate=True)
    # Netejar SombraTerra si existís abans d'exportar
    if "SombraTerra" in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects["SombraTerra"], do_unlink=True)
    glb_path = os.path.join(MODELS_DIR, "newcomen.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format="GLB",
        export_animations=True,
        export_animation_mode="SCENE",
        export_anim_scene_split_object=False,
        export_yup=True,
    )
    meta = {
        "hotspots_3d": anchors_to_gltf_3d(anc_glb),
        "glb_bytes": os.path.getsize(glb_path),
    }
    if not glb_only:
        meta["muntada_pct"] = pts
    with open(os.path.join(OUT_DIR, "newcomen_meta.json"), "w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2)
    print("NEWCOMEN_3D_OK", json.dumps(meta))


if __name__ == "__main__":
    main()

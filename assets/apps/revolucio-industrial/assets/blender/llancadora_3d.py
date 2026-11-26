# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Generador 3D procedural (Blender 5.3 CLI) — rigor museogràfic i PBR:
Teler manual amb llançadora volant de John Kay (1733 · model de roure anglès).

Inclou:
  - Bastidor de roure anglès ensamblat a caixa i metxa amb bigues superiors i tornapuntes
  - Plegador d'ordit posterior amb rodet de trinquets i 20 fils individuals separats en dues capes
  - Dos lliços de fusta i filferro suspesos de corrons superiors i accionats per dos pedals inferiors
  - Batà basculant amb pinta de pues metàl·liques i pista allargada que sobresurt de l'ordit
  - Caixes laterals amb vareta guia de ferro i tacos de cuir que colpegen la barqueta
  - Llançadora en forma de barqueta amb puntes d'acer, canilla interior de fil vermell i trama volant
  - Cordill en V unit als dos tacos amb mànec central d'una sola mà
  - Sòcol de pedra del taller i exportació .glb + renders Cycles muntat i detall proper

Ús:
  blender -b -P assets/blender/llancadora_3d.py
  blender -b -P assets/blender/llancadora_3d.py -- --glb-only
"""

import math
import os
import sys

import bpy
from mathutils import Vector

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if THIS_DIR not in sys.path:
    sys.path.insert(0, THIS_DIR)

from pbr_comu import (
    OUT_DIR,
    add_empty,
    add_shadow_floor,
    build_pbr_pair,
    clear_scene,
    export_glb_and_meta,
    make_box,
    make_cyl,
    make_gear,
    make_mat,
    make_rod_between,
    make_shuttle,
    make_sphere,
    make_worker,
    make_workshop_floor,
    project_anchors,
    render_closeup,
    render_image,
    set_linear_fcurves,
    set_worker_pose,
    setup_lighting,
)


def _clamp(v):
    return max(0.0, min(1.0, v))


def _ease(v):
    v = _clamp(v)
    return v * v * (3.0 - 2.0 * v)


def _seg(p, a, b):
    return _ease((p - a) / (b - a))


def _mix(a, b, q):
    return a + (b - a) * q


def eval_loom_state(p):
    """Cicle fidel en dues passades: obrir calada -> tir esq->dret -> batre -> canvi -> tornada -> batre."""
    shed = _mix(-1.0, 1.0, _seg(p, 0.00, 0.14)) if p < 0.56 else _mix(1.0, -1.0, _seg(p, 0.56, 0.70))
    shuttle_x = (
        -1.15
        if p < 0.18
        else _mix(-1.15, 1.15, _seg(p, 0.18, 0.36))
        if p < 0.68
        else _mix(1.15, -1.15, _seg(p, 0.68, 0.86))
        if p < 0.98
        else -1.15
    )
    beat1 = _seg(p, 0.39, 0.48) - _seg(p, 0.48, 0.56)
    beat2 = _seg(p, 0.87, 0.94) - _seg(p, 0.94, 1.00)
    beat = max(0.0, min(1.0, beat1 + beat2))

    # Impactes breus dels tacos laterals i estrebada del mànec del cordill en V
    kick_l = _seg(p, 0.16, 0.19) * (1.0 - _seg(p, 0.19, 0.25))
    kick_r = _seg(p, 0.66, 0.69) * (1.0 - _seg(p, 0.69, 0.75))
    handle_x = -0.18 * kick_l + 0.18 * kick_r
    return {
        "shed": shed,
        "shuttle_x": shuttle_x,
        "beat": beat,
        "kick_l": kick_l,
        "kick_r": kick_r,
        "handle_x": handle_x,
    }


def build_llancadora_scene(animate=False):
    clear_scene()

    pbr_wood = build_pbr_pair("LlanRoure", "wood", 512, 512, bump_scale=2.2)
    pbr_wood_dark = build_pbr_pair("LlanRoureFosc", "wood_dark", 512, 512, bump_scale=2.0)
    pbr_iron = build_pbr_pair("LlanFerro", "castiron", 512, 512, bump_scale=1.8)
    pbr_brass = build_pbr_pair("LlanLlauto", "brass", 512, 512, bump_scale=0.9)
    pbr_leather = build_pbr_pair("LlanCuir", "leather", 512, 512, bump_scale=2.0)
    pbr_cotton = build_pbr_pair("LlanCotoCru", "cotton_cloth", 512, 512, bump_scale=2.2)
    pbr_cloth = build_pbr_pair("LlanTelaTeixida", "woven_cloth", 512, 512, bump_scale=2.2)

    m_wood = make_mat("Roure", "#8e5c30", roughness=0.60, pbr_pair=pbr_wood, tex_scale=(1.0, 1.0), normal_strength=0.75)
    m_wood_dark = make_mat("RoureFosc", "#5a371a", roughness=0.65, pbr_pair=pbr_wood_dark, tex_scale=(1.1, 1.1), normal_strength=0.75)
    m_iron = make_mat("Ferro", "#31363c", metallic=0.84, roughness=0.44, pbr_pair=pbr_iron, normal_strength=0.65)
    m_steel = make_mat("Acer", "#aeb7bf", metallic=0.92, roughness=0.22)
    m_brass = make_mat("Llauto", "#d4a43a", metallic=0.92, roughness=0.24, pbr_pair=pbr_brass, normal_strength=0.35)
    m_leather = make_mat("Cuir", "#4e2e19", roughness=0.72, pbr_pair=pbr_leather, normal_strength=0.80)
    m_cotton = make_mat("CotoOrdit", "#e9dfc4", roughness=0.88, pbr_pair=pbr_cotton, tex_scale=(1.8, 1.8), normal_strength=0.65)
    m_cloth = make_mat("TelaCoto", "#ebe1c7", roughness=0.84, pbr_pair=pbr_cloth, tex_scale=(1.8, 1.8), normal_strength=0.60)
    m_warp = make_mat("OrditCru", "#e4d7b7", roughness=0.82)
    m_weft = make_mat("TramaVermella", "#b83a24", roughness=0.74)
    m_cord = make_mat("CordillCanem", "#9a7a4a", roughness=0.82)

    add_shadow_floor(z=0.0, size=14.0)

    # Sòcol de postes de roure i escenografia de taller domèstic
    make_workshop_floor("cottage_wood", size=(3.60, 2.75, 0.14), center=(0.0, -0.20), with_room_backdrop=True)

    # --- 1. BASTIDOR DE ROURE ANGLÈS ---
    # Costat frontal = -Y (cara al teixidor/càmera); costat posterior = +Y (ordit)
    g_frame = add_empty("Bastidor")
    for sx in (-1.04, 1.04):
        for sy in (-0.84, 0.84):
            make_box(f"Pilar_{sx}_{sy}", (0.11, 0.11, 1.72), (sx, sy, 1.00), m_wood_dark, parent=g_frame, bevel=0.010)
            make_box(f"PeuFerro_{sx}_{sy}", (0.15, 0.15, 0.04), (sx, sy, 0.16), m_iron, parent=g_frame, bevel=0.004)
        # Travessers laterals sense cares coplanars amb els pilars
        make_box(f"TravLatBaix_{sx}", (0.078, 1.57, 0.088), (sx, 0.0, 0.25), m_wood, parent=g_frame)
        make_box(f"TravLatMig_{sx}", (0.076, 1.57, 0.080), (sx, 0.0, 0.84), m_wood, parent=g_frame)
        make_box(f"TravLatSup_{sx}", (0.082, 1.57, 0.090), (sx, 0.0, 1.82), m_wood, parent=g_frame)
        # Tornapuntes diagonals de rigidesa
        make_rod_between(f"TornapuntaDarrere_{sx}", (sx, 0.82, 0.30), (sx, 0.42, 0.84), 0.032, m_wood_dark, verts=8, parent=g_frame)
        make_rod_between(f"TornapuntaDavant_{sx}", (sx, -0.82, 0.30), (sx, -0.44, 0.84), 0.032, m_wood_dark, verts=8, parent=g_frame)

    # Travessers transversals
    make_box("BigaDarrereBaix", (1.97, 0.082, 0.085), (0.0, 0.84, 0.25), m_wood, parent=g_frame)
    make_box("BigaDarrereSup", (1.97, 0.088, 0.090), (0.0, 0.84, 1.82), m_wood, parent=g_frame)
    make_box("BigaDavantSup", (1.97, 0.088, 0.090), (0.0, -0.84, 1.82), m_wood, parent=g_frame)
    make_box("BigaSuportLlicos", (1.97, 0.085, 0.088), (0.0, 0.32, 1.82), m_wood_dark, parent=g_frame)
    make_box("BigaPivotBata", (1.97, 0.085, 0.088), (0.0, -0.18, 1.82), m_wood_dark, parent=g_frame)
    make_box("BigaPitDavant", (1.97, 0.092, 0.082), (0.0, -0.84, 0.89), m_wood, parent=g_frame)
    make_box("BigaOrditDarrere", (1.97, 0.082, 0.076), (0.0, 0.84, 0.90), m_wood, parent=g_frame)

    # --- 2. PLEGADOR D'ORDIT POSTERIOR I FILS EN DUES CAPES (CALADA) ---
    g_ordit = add_empty("Ordit")
    make_cyl("PlegadorOrditNucli", 0.045, 2.16, (0.0, 0.72, 0.66), m_wood_dark, rot=(0, math.pi / 2, 0), parent=g_ordit)
    make_cyl("PlegadorOrditCoto", 0.125, 1.56, (0.0, 0.72, 0.66), m_cotton, rot=(0, math.pi / 2, 0), parent=g_ordit)
    make_gear("TrinquetOrdit", 0.13, 0.025, 18, (-0.94, 0.72, 0.66), m_iron, mat_hub=m_brass, axis="X", parent=g_ordit)
    make_cyl("RodetPosterior", 0.040, 1.80, (0.0, 0.78, 0.91), m_wood, rot=(0, math.pi / 2, 0), parent=g_ordit)

    # Pivots dels fils d'ordit: 22+22 fils fins (densitat històrica realista sense barres gruixudes)
    n_warp = 22
    def build_warp_group(name, y_pivot, z_pivot, y_end, x_offset):
        grp = add_empty(name, (0.0, y_pivot, z_pivot), parent=g_ordit)
        dy = y_end - y_pivot
        for i in range(n_warp):
            x = -0.74 + i * (1.48 / (n_warp - 1)) + x_offset
            make_rod_between(f"{name}_Fil_{i}", (x, 0.0, 0.0), (x, dy, 0.0), 0.0022, m_warp, verts=6, parent=grp)
        return grp

    g_ord_par_darr = build_warp_group("OrditParellDarr", 0.78, 0.91, 0.32, -0.015)
    g_ord_par_dav = build_warp_group("OrditParellDav", -0.42, 0.91, 0.32, -0.015)
    g_ord_imp_darr = build_warp_group("OrditImparellDarr", 0.78, 0.91, 0.32, 0.015)
    g_ord_imp_dav = build_warp_group("OrditImparellDav", -0.42, 0.91, 0.32, 0.015)

    # --- 3. LLIÇOS, CORRONS SUPERIORS I PEDALS INFERIORS ---
    g_llicos = add_empty("Llicos")
    for px in (-0.42, 0.42):
        make_cyl(f"CorroLlic_{px}", 0.068, 0.06, (px, 0.32, 1.72), m_wood, rot=(0, math.pi / 2, 0), parent=g_llicos)
        make_box(f"BridaCorro_{px}", (0.08, 0.04, 0.14), (px, 0.32, 1.77), m_iron, parent=g_llicos, bevel=0.003)

    def build_heddle_frame(name, y_pos, x_off):
        hf = add_empty(name, (0.0, y_pos, 0.91), parent=g_llicos)
        make_box(f"{name}_BarSup", (1.64, 0.024, 0.035), (0.0, 0.0, 0.25), m_wood, parent=hf, bevel=0.003)
        make_box(f"{name}_BarInf", (1.64, 0.024, 0.035), (0.0, 0.0, -0.25), m_wood, parent=hf, bevel=0.003)
        for sx in (-0.80, 0.80):
            make_box(f"{name}_Costat_{sx}", (0.025, 0.024, 0.50), (sx, 0.0, 0.0), m_wood, parent=hf, bevel=0.003)
        for px in (-0.42, 0.42):
            make_cyl(f"{name}_CordSup_{px}", 0.006, 0.55, (px, 0.0, 0.54), m_cord, verts=8, parent=hf, bevel=0.0)
            make_cyl(f"{name}_CordInf_{px*0.35}", 0.006, 0.58, (px * 0.35, 0.0, -0.54), m_cord, verts=8, parent=hf, bevel=0.0)
        for k in range(n_warp):
            kx = -0.74 + k * (1.48 / (n_warp - 1)) + x_off
            make_cyl(f"{name}_Filferro_{k}", 0.0022, 0.48, (kx, 0.0, 0.0), m_steel, verts=6, parent=hf, bevel=0.0)
            make_sphere(f"{name}_Ullet_{k}", 0.0072, (kx, 0.0, 0.0), m_brass, segs=8, rings=6, parent=hf)
        return hf

    g_llic1 = build_heddle_frame("Llic1", 0.28, -0.015)
    g_llic2 = build_heddle_frame("Llic2", 0.36, 0.015)

    # Pedals inferiors pivotats darrere (Y = 0.65, Z = 0.21)
    g_pedal1 = add_empty("Pedal1", (-0.16, 0.65, 0.21), parent=g_llicos)
    make_box("Pedal1Taula", (0.11, 1.06, 0.038), (0.0, -0.50, 0.0), m_wood, parent=g_pedal1, bevel=0.004)
    g_pedal2 = add_empty("Pedal2", (0.16, 0.65, 0.21), parent=g_llicos)
    make_box("Pedal2Taula", (0.11, 1.06, 0.038), (0.0, -0.50, 0.0), m_wood, parent=g_pedal2, bevel=0.004)

    # --- 4. BATÀ BASCULANT, PINTA METÀL·LICA, PISTA ALLARGADA I CAIXES LATERALS ---
    # Pivot dalt a Y = -0.18, Z = 1.82. Pista a local Z = -0.94 (alçada ~0.88)
    g_bata = add_empty("Bata", (0.0, -0.18, 1.82))
    for sx in (-0.92, 0.92):
        make_box(f"EspasaBata_{sx}", (0.055, 0.065, 1.02), (sx, 0.0, -0.49), m_wood_dark, parent=g_bata, bevel=0.006)
        make_cyl(f"PernBata_{sx}", 0.022, 0.14, (sx, 0.0, 0.0), m_iron, rot=(0, math.pi / 2, 0), verts=12, parent=g_bata)

    # Pista allargada de punta a punta (-1.42 .. +1.42) perquè es vegin les caixes fora de l'ordit!
    make_box("PistaBata", (2.86, 0.145, 0.048), (0.0, -0.02, -0.955), m_wood, parent=g_bata, bevel=0.006)
    make_box("PassamaPinta", (1.88, 0.055, 0.055), (0.0, 0.0, -0.68), m_wood, parent=g_bata, bevel=0.006)
    make_box("BasePinta", (1.76, 0.042, 0.032), (0.0, 0.0, -0.915), m_brass, parent=g_bata, bevel=0.003)
    # 38 pues de la pinta metàl·lica
    for r in range(38):
        rx_pua = -0.82 + r * (1.64 / 37.0)
        make_box(f"PuaPinta_{r}", (0.005, 0.014, 0.21), (rx_pua, 0.0, -0.80), m_steel, parent=g_bata, bevel=0.0)

    # --- 5. CAIXES LATERALS I TACOS DE CUIR (A DINS DEL BATÀ) ---
    g_caixes = add_empty("Caixes", (0.0, 0.0, 0.0), parent=g_bata)
    for side_n, sx in (("Esq", -1.24), ("Dreta", 1.24)):
        make_box(f"CaixaParetDarrere_{side_n}", (0.36, 0.024, 0.095), (sx, 0.048, -0.89), m_wood_dark, parent=g_caixes)
        make_box(f"CaixaParetDavant_{side_n}", (0.36, 0.020, 0.068), (sx, -0.088, -0.90), m_wood_dark, parent=g_caixes)
        make_box(f"CaixaTapa_{side_n}", (0.025, 0.145, 0.095), (-1.42 if sx < 0 else 1.42, -0.02, -0.89), m_brass, parent=g_caixes, bevel=0.003)
        # Vareta guia de ferro horitzontal per on llisca el taco
        make_cyl(f"VaretaTaco_{side_n}", 0.009, 0.34, (sx, -0.02, -0.875), m_steel, rot=(0, math.pi / 2, 0), verts=10, parent=g_caixes, bevel=0.0)

    g_taco_esq = add_empty("TacoEsq", (-1.34, -0.02, -0.89), parent=g_caixes)
    make_box("TacoEsqBloc", (0.042, 0.062, 0.072), (0.0, 0.0, 0.0), m_leather, parent=g_taco_esq, bevel=0.004)
    g_taco_dret = add_empty("TacoDret", (1.34, -0.02, -0.89), parent=g_caixes)
    make_box("TacoDretBloc", (0.042, 0.062, 0.072), (0.0, 0.0, 0.0), m_leather, parent=g_taco_dret, bevel=0.004)

    # --- 6. LLANÇADORA VOLANT I TRAMA VERMELLA ---
    g_llanc = make_shuttle("Llancadora", (-1.15, -0.02, -0.90), m_wood_dark, m_steel, m_weft, scale=1.0, parent=g_bata)
    # Fil de trama actiu visible quan passa per la calada
    g_trama_activa = make_box("TramaActiva", (1.44, 0.012, 0.012), (0.0, -0.02, -0.90), m_weft, parent=g_bata, bevel=0.0)

    # --- 7. CORDILL EN V I MÀNEC D'UNA SOLA MÀ ---
    g_cordill = add_empty("CordillIManec", (0.0, 0.0, 0.0), parent=g_bata)
    for px in (-0.52, 0.52):
        make_cyl(f"PolitjaCord_{px}", 0.028, 0.024, (px, -0.04, -0.36), m_brass, rot=(math.pi / 2, 0, 0), verts=14, parent=g_cordill)
    g_manec = add_empty("ManecImpuls", (0.0, -0.10, -0.58), parent=g_cordill)
    make_cyl("ManecFusta", 0.022, 0.135, (0.0, 0.0, 0.0), m_wood_dark, rot=(0, 0, 0), verts=14, parent=g_manec, bevel=0.004)
    make_cyl("ManecAnella", 0.026, 0.018, (0.0, 0.0, 0.06), m_brass, verts=14, parent=g_manec)
    # Trams fixos des dels tacos fins les politges + V fins al mànec
    make_rod_between("CordEsqPujada", (-1.34, -0.02, -0.85), (-0.52, -0.04, -0.36), 0.0055, m_cord, verts=8, parent=g_cordill)
    make_rod_between("CordDretPujada", (1.34, -0.02, -0.85), (0.52, -0.04, -0.36), 0.0055, m_cord, verts=8, parent=g_cordill)
    # Brancs cap al mànec (parentats al batà amb rotació animada senzilla perquè sempre toquin les politges!)
    g_cord_v_esq = add_empty("CordVEsq", (-0.52, -0.04, -0.36), parent=g_cordill)
    make_rod_between("CordVEsqLin", (0.0, 0.0, 0.0), (0.52, -0.06, -0.16), 0.0055, m_cord, verts=8, parent=g_cord_v_esq)
    g_cord_v_dret = add_empty("CordVDret", (0.52, -0.04, -0.36), parent=g_cordill)
    make_rod_between("CordVDretLin", (0.0, 0.0, 0.0), (-0.52, -0.06, -0.16), 0.0055, m_cord, verts=8, parent=g_cord_v_dret)

    # --- 8. TELA TEIXIDA I PLEGADOR FRONTAL ---
    g_tela = add_empty("Tela")
    make_box("TelaTeixidaPlana", (1.54, 0.44, 0.016), (0.0, -0.64, 0.90), m_cloth, parent=g_tela, bevel=0.003)
    # Passades de trama vermella recents incorporades al teixit
    for ti in range(4):
        make_box(f"LlistaTrama_{ti}", (1.53, 0.014, 0.019), (0.0, -0.44 - ti * 0.055, 0.902), m_weft, parent=g_tela, bevel=0.0)
    make_box("TelaBaixada", (1.54, 0.016, 0.24), (0.0, -0.85, 0.78), m_cloth, rot=(0.24, 0, 0), parent=g_tela, bevel=0.002)
    make_cyl("PlegadorTelaNucli", 0.045, 2.16, (0.0, -0.74, 0.66), m_wood_dark, rot=(0, math.pi / 2, 0), parent=g_tela)
    make_cyl("PlegadorTelaCoto", 0.115, 1.56, (0.0, -0.74, 0.66), m_cloth, rot=(0, math.pi / 2, 0), parent=g_tela)
    make_gear("RodaTela", 0.115, 0.024, 16, (0.94, -0.74, 0.66), m_brass, mat_hub=m_iron, axis="X", parent=g_tela)
    make_cyl("ManovellaTelaEix", 0.018, 0.14, (1.12, -0.74, 0.66), m_iron, rot=(0, math.pi / 2, 0), parent=g_tela)
    make_box("ManovellaBrac", (0.025, 0.032, 0.16), (1.18, -0.74, 0.59), m_iron, parent=g_tela, bevel=0.003)
    make_cyl("ManovellaPom", 0.018, 0.11, (1.24, -0.74, 0.52), m_wood_dark, rot=(0, math.pi / 2, 0), parent=g_tela)

    # --- 9. TEIXIDOR A ESCALA REAL DAVANT DEL TELER ---
    worker = make_worker("TeixidorKay", (0.14, -1.24, 0.14), facing_yaw=0.08, scale=1.0, role="weaver")

    def apply_pose(p):
        st = eval_loom_state(p)
        # Batà: reposa enrere (+0.29 rad -> pista a Y~+0.09) i bat fins Y=-0.40 (-0.23 rad)
        rx_bata = 0.29 - 0.52 * st["beat"]
        g_bata.rotation_euler = (rx_bata, 0.0, 0.0)

        # Lliços i pedals en oposició neta (+-0.095 m)
        dz_heddle = 0.095 * st["shed"]
        g_llic1.location = (0.0, 0.28, 0.91 + dz_heddle)
        g_llic2.location = (0.0, 0.36, 0.91 - dz_heddle)
        g_pedal1.rotation_euler = (0.14 * st["shed"], 0.0, 0.0)
        g_pedal2.rotation_euler = (-0.14 * st["shed"], 0.0, 0.0)

        # Capes de l'ordit pivotant exactament fins l'ullet de cada lliç (L=0.46 darrere, L=0.74 davant)
        ang_par_darr = math.atan2(dz_heddle, 0.46)
        ang_par_dav = -math.atan2(dz_heddle, 0.74)
        g_ord_par_darr.rotation_euler = (-ang_par_darr, 0.0, 0.0)
        g_ord_par_dav.rotation_euler = (-ang_par_dav, 0.0, 0.0)
        g_ord_imp_darr.rotation_euler = (ang_par_darr, 0.0, 0.0)
        g_ord_imp_dav.rotation_euler = (ang_par_dav, 0.0, 0.0)

        # Llançadora + tacos + mànec cordill
        g_llanc.location = (st["shuttle_x"], -0.02, -0.90)
        g_taco_esq.location = (-1.34 + 0.16 * st["kick_l"], -0.02, -0.89)
        g_taco_dret.location = (1.34 - 0.16 * st["kick_r"], -0.02, -0.89)
        g_manec.location = (st["handle_x"], -0.10, -0.58)
        g_cord_v_esq.rotation_euler = (0.0, -st["handle_x"] * 0.42, 0.0)
        g_cord_v_dret.rotation_euler = (0.0, -st["handle_x"] * 0.42, 0.0)

        # Trama activa visible quan vola per dins la calada
        vis_x = max(0.05, min(1.0, (st["shuttle_x"] + 0.75) / 1.50))
        g_trama_activa.scale = (vis_x, 1.0, 1.0)

        # Teixidor: mà dreta estira el mànec del cordill; mà esquerra acompanya el batà; cames premen els pedals
        hx = st["handle_x"]
        set_worker_pose(
            worker,
            torso_rot=(0.14 + 0.08 * st["beat"], 0.0, -0.08 * hx),
            head_rot=(-0.14, 0.0, 0.12 * hx),
            r_sh=(1.22, 0.0, -0.35 + 0.65 * hx),
            r_elb=(-0.55 - 0.18 * abs(hx), 0.0, 0.0),
            l_sh=(1.08 + 0.25 * st["beat"], 0.0, 0.22),
            l_elb=(-0.62 + 0.18 * st["beat"], 0.0, 0.0),
            l_hip=(0.12 * st["shed"], 0.0, 0.0),
            r_hip=(-0.12 * st["shed"], 0.0, 0.0),
        )

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        worker_objs = [
            worker["torso"],
            worker["head"],
            worker["l_sh"],
            worker["l_elb"],
            worker["r_sh"],
            worker["r_elb"],
            worker["l_hip"],
            worker["r_hip"],
        ]
        anim_objs = [
            g_bata,
            g_llic1,
            g_llic2,
            g_pedal1,
            g_pedal2,
            g_ord_par_darr,
            g_ord_par_dav,
            g_ord_imp_darr,
            g_ord_imp_dav,
            g_llanc,
            g_taco_esq,
            g_taco_dret,
            g_manec,
            g_cord_v_esq,
            g_cord_v_dret,
            g_trama_activa,
        ] + worker_objs
        for fr in range(1, 61):
            p = (fr - 1) / 60.0
            apply_pose(p)
            for o in anim_objs:
                o.keyframe_insert(data_path="location", frame=fr)
                o.keyframe_insert(data_path="rotation_euler", frame=fr)
                o.keyframe_insert(data_path="scale", frame=fr)
        set_linear_fcurves(anim_objs)
    else:
        # Posa en el moment més didàctic: calada ben oberta i llançadora creuant el centre
        apply_pose(0.27)

    setup_lighting(cam_loc=(2.88, -3.72, 2.28), target=(0.0, -0.22, 0.92), lens=38.0, mood="workshop")

    anchors = {
        "ordit": (-0.45, 0.56, 0.92),
        "llancadora": (0.12, 0.08, 0.92),
        "caixes": (-1.22, 0.08, 0.92),
        "cordill": (0.02, -0.02, 1.12),
        "pinta": (0.48, 0.10, 1.06),
        "tela": (0.00, -0.64, 0.90),
        "bastidor": (-1.04, -0.84, 1.48),
        "llicos": (-0.25, 0.32, 1.18),
    }
    return anchors


def main():
    glb_only = "--glb-only" in sys.argv
    if not glb_only:
        anc = build_llancadora_scene(animate=False)
        render_image(os.path.join(OUT_DIR, "llancadora-muntada.png"), res_x=1200, res_y=760, samples=32)
        pts = project_anchors(anc)
        render_closeup(
            os.path.join(OUT_DIR, "llancadora-detall.png"),
            cam_loc=(1.75, -1.95, 1.50),
            target=(-0.45, -0.02, 0.92),
            lens=54.0,
            samples=28,
        )

    anc_glb = build_llancadora_scene(animate=True)
    export_glb_and_meta(
        "llancadora",
        "llancadora.glb",
        anc_glb,
        extra_meta={"muntada_pct": pts} if not glb_only else None,
    )


if __name__ == "__main__":
    main()

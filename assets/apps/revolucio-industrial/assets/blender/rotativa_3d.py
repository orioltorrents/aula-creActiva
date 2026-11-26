# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Màquina de vapor rotativa de doble efecte (tipus Boulton & Watt / horitzontal industrial)
amb vàlvula corredora en D, excèntrica, regulador centrífug de boles, creuera, biela-manovella,
gran volant d'inèrcia i corretges de transmissió cap a la fàbrica.
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
    link_obj,
    make_box,
    make_cone,
    make_curve_tube,
    make_cutaway_cyl,
    make_cyl,
    make_gear,
    make_mat,
    make_rivet_ring,
    make_rod_between,
    make_smoke_plume,
    make_sphere,
    make_spoked_wheel,
    make_torus,
    make_workshop_floor,
    project_anchors,
    render_closeup,
    render_image,
    set_linear_fcurves,
    setup_lighting,
)


def make_bevel_disc(name, r_outer, thick, loc, mat, rot=(0, 0, 0), parent=None):
    return make_cyl(name, r_outer, thick, loc, mat, rot=rot, verts=28, parent=parent, bevel=0.004)


def build_rotativa(animate=True):
    clear_scene()

    # Materials PBR
    p_stone = build_pbr_pair("StoneRot", "stone", bump_scale=2.2)
    p_iron = build_pbr_pair("IronRot", "castiron", bump_scale=2.0)
    p_paint = build_pbr_pair("PaintRot", "painted_iron", bump_scale=1.3)
    p_brass = build_pbr_pair("BrassRot", "brass", bump_scale=1.2)
    p_leather = build_pbr_pair("LeatherRot", "leather", bump_scale=1.6)
    p_copper = build_pbr_pair("CopperRot", "copper", bump_scale=1.4)

    m_stone = make_mat("PedraSocol", "#b9ad97", metallic=0.0, roughness=0.88, pbr_pair=p_stone, tex_scale=(1.4, 0.9))
    m_iron = make_mat("FosaNegra", "#2e3338", metallic=0.82, roughness=0.46, pbr_pair=p_iron)
    m_paint = make_mat("FosaPintada", "#2d4b52", metallic=0.35, roughness=0.42, pbr_pair=p_paint)
    m_steel = make_mat("AcerPolit", "#c4ccd3", metallic=0.95, roughness=0.19)
    m_brass = make_mat("LlautoBrillant", "#d2a23d", metallic=0.92, roughness=0.25, pbr_pair=p_brass)
    m_copper = make_mat("CoureCalent", "#b6643d", metallic=0.86, roughness=0.32, pbr_pair=p_copper)
    m_leather = make_mat("CorretjaCuir", "#6a3c20", metallic=0.0, roughness=0.72, pbr_pair=p_leather)
    m_valve_red = make_mat("VolantVermell", "#8e2d25", metallic=0.25, roughness=0.45)

    # Vapor viu (càlid) i vapor usat (fred) translúcids perquè es vegi la camisa d'acer interior
    m_steam_hot = make_mat(
        "VaporCalent",
        "#ff9648",
        metallic=0.0,
        roughness=0.35,
        alpha=0.36,
        emission_hex="#ff7722",
        emission_strength=0.45,
    )
    m_steam_out = make_mat(
        "VaporUsat",
        "#9ec7dc",
        metallic=0.0,
        roughness=0.40,
        alpha=0.28,
        emission_hex="#82b8d8",
        emission_strength=0.22,
    )

    add_shadow_floor(z=0.0, size=14.0)
    make_workshop_floor("mill_stone", size=(6.4, 3.2, 0.14), center=(-0.10, 0.10), with_room_backdrop=False)

    # 1. PLINT DE PEDRA I BANCADA DE FOSA
    make_box("PlintPedra", (4.70, 1.32, 0.42), (-0.12, 0.14, 0.21), m_stone, bevel=0.018, uv_scale=0.5)
    make_box("CornisaPlint", (4.82, 1.42, 0.06), (-0.12, 0.14, 0.43), m_stone, bevel=0.01)
    # Reblons i llautó d'engreixador al cilindre i manòmetre a l'entrada de vapor
    make_rivet_ring("ReblonsCilEsq", (cyl_cx - 0.39 if False else -2.35, 0.0, 0.96), 0.30, 14, rivet_r=0.008, axis="X", mat=m_steel)
    make_rivet_ring("ReblonsCilDret", (-1.57, 0.0, 0.96), 0.30, 14, rivet_r=0.008, axis="X", mat=m_steel)
    make_cyl("LubricadorCil", 0.036, 0.11, (-1.96, 0.12, 1.56), m_brass)
    make_cyl("ManometreEsfera", 0.065, 0.028, (-2.22, -0.06, 2.22), m_brass, rot=(math.pi / 2, 0, 0))

    # Bancada de ferro pintat (part esquerra sota cilindre/creuera + fossa dreta del volant)
    make_box("BancadaEsq", (2.30, 0.72, 0.28), (-1.22, 0.08, 0.60), m_paint, bevel=0.014)
    make_box("BancadaDreta", (2.15, 0.72, 0.18), (1.00, 0.08, 0.55), m_paint, bevel=0.014)
    make_box("FossaMarcFront", (1.95, 0.14, 0.16), (1.00, -0.21, 0.68), m_paint, bevel=0.008)
    make_box("FossaMarcDarr", (1.95, 0.14, 0.16), (1.00, 0.48, 0.68), m_paint, bevel=0.008)

    # Pern d'ancoratge a la pedra
    for bx in (-2.15, -1.35, -0.35, 0.65, 1.65):
        for by in (-0.28, 0.46):
            make_cyl(f"Pern_{bx:.1f}_{by:.1f}", 0.025, 0.10, (bx, by, 0.48), m_iron, verts=8, bevel=0.002)

    # Guies paral·leles de la creuera (acer polit sobre bancada)
    make_box("GuiaSup", (1.08, 0.16, 0.045), (-0.75, 0.0, 1.13), m_steel, bevel=0.004)
    make_box("GuiaInf", (1.08, 0.16, 0.045), (-0.75, 0.0, 0.79), m_steel, bevel=0.004)
    make_box("SuportGuiaEsq", (0.10, 0.24, 0.36), (-1.28, 0.0, 0.96), m_paint, bevel=0.006)
    make_box("SuportGuiaDreta", (0.10, 0.24, 0.36), (-0.22, 0.0, 0.96), m_paint, bevel=0.006)

    # 2. CILINDRE HORITZONTAL DE DOBLE EFECTE (tall frontal per veure el pistó i el vapor)
    cyl_cx, cyl_cz = -1.96, 0.96
    cyl_len = 0.88
    # En tall frontal (-Y obert): en Blender, després de rotar (0, pi/2, 0), els angles locals (x,y) passen a (-z, y),
    # així el costat frontal -Y correspon a l'angle local -pi/2 (= 1.5*pi). Deixem obert [-0.88*pi .. -0.15*pi],
    # és a dir dibuixem de -0.12*pi a +1.12*pi (la meitat posterior + superior/inferior visibles).
    make_cutaway_cyl(
        "CilindreExt",
        0.24,
        0.31,
        cyl_len,
        (cyl_cx, 0.0, cyl_cz),
        m_paint,
        start_ang=-0.12 * math.pi,
        end_ang=1.12 * math.pi,
        segs=36,
        rot=(0.0, math.pi / 2, 0.0),
    )
    make_cutaway_cyl(
        "CilindreCamisa",
        0.215,
        0.242,
        cyl_len - 0.02,
        (cyl_cx, 0.0, cyl_cz),
        m_steel,
        start_ang=-0.10 * math.pi,
        end_ang=1.10 * math.pi,
        segs=36,
        rot=(0.0, math.pi / 2, 0.0),
    )
    # Brides d'extrem i tapes del cilindre (també seccionades per mostrar l'interior)
    for sx in (-1, 1):
        bx = cyl_cx + sx * (cyl_len * 0.5 + 0.02)
        make_cutaway_cyl(
            f"BridaCil_{sx}",
            0.22,
            0.37,
            0.055,
            (bx, 0.0, cyl_cz),
            m_iron,
            start_ang=-0.12 * math.pi,
            end_ang=1.12 * math.pi,
            segs=32,
            rot=(0.0, math.pi / 2, 0.0),
        )
        make_cutaway_cyl(
            f"TapaCil_{sx}",
            0.045,
            0.34,
            0.04,
            (bx + sx * 0.035, 0.0, cyl_cz),
            m_iron,
            start_ang=-0.12 * math.pi,
            end_ang=1.12 * math.pi,
            segs=32,
            rot=(0.0, math.pi / 2, 0.0),
        )
    # Caixa d'estopa frontal (costat dret del cilindre)
    make_cyl("CaixaEstopa", 0.075, 0.11, (cyl_cx + cyl_len * 0.5 + 0.09, 0.0, cyl_cz), m_brass, rot=(0, math.pi / 2, 0))
    # Peus de suport del cilindre sobre la bancada
    for px in (-2.28, -1.64):
        make_box(f"PeuCil_{px:.2f}", (0.14, 0.44, 0.24), (px, 0.0, 0.72), m_paint, bevel=0.008)

    # 3. CAIXA DE DISTRIBUCIÓ I VÀLVULA CORREDORA EN D (inclinada sobre el cilindre com al GIF)
    box_tilt = -0.14  # inclinada lleugerament cap a la dreta com al referent
    g_caixa = add_empty("CaixaDistribucio", (cyl_cx, 0.0, 1.38))
    g_caixa.rotation_euler = (0.0, box_tilt, 0.0)
    # Paret posterior i fons/sostre seccionat de la caixa de vapor
    make_box("CaixaFons", (0.72, 0.10, 0.22), (0.0, 0.11, 0.0), m_paint, parent=g_caixa, bevel=0.006)
    make_box("CaixaSostre", (0.72, 0.26, 0.04), (0.0, 0.02, 0.10), m_paint, parent=g_caixa, bevel=0.004)
    make_box("CaixaBase", (0.76, 0.26, 0.05), (0.0, 0.02, -0.10), m_iron, parent=g_caixa, bevel=0.004)
    make_box("CaixaTapaEsq", (0.05, 0.26, 0.22), (-0.36, 0.02, 0.0), m_iron, parent=g_caixa, bevel=0.004)
    make_box("CaixaTapaDreta", (0.05, 0.26, 0.22), (0.36, 0.02, 0.0), m_iron, parent=g_caixa, bevel=0.004)
    # Brida d'estopa de la tija de la vàlvula
    make_cyl("EstopaValv", 0.036, 0.08, (0.40, 0.0, -0.02), m_brass, rot=(0, math.pi / 2, 0), parent=g_caixa)

    # Conductes de vapor entre caixa de distribució i extrems del cilindre
    make_box("CanalEsq", (0.11, 0.14, 0.26), (-0.28, 0.04, -0.20), m_paint, parent=g_caixa, bevel=0.006)
    make_box("CanalDret", (0.11, 0.14, 0.20), (0.28, 0.04, -0.18), m_paint, parent=g_caixa, bevel=0.006)

    # Taco corredor en D (slide valve) de llautó dins la caixa
    g_corredora = add_empty("ValvulaCorredora", (0.0, 0.0, -0.035), parent=g_caixa)
    make_box("CorredoraCosEsq", (0.075, 0.13, 0.08), (-0.11, -0.01, 0.0), m_brass, parent=g_corredora, bevel=0.004)
    make_box("CorredoraCosDret", (0.075, 0.13, 0.08), (0.11, -0.01, 0.0), m_brass, parent=g_corredora, bevel=0.004)
    make_box("CorredoraPont", (0.295, 0.13, 0.032), (0.0, -0.01, 0.042), m_brass, parent=g_corredora, bevel=0.004)

    # Canonada d'entrada de vapor (esquerra) + vàlvula manual + vàlvula regulada + escapament (centre)
    adm_x = -2.22
    make_cyl("TubAdmissio", 0.052, 0.94, (adm_x, 0.02, 1.92), m_copper, bevel=0.004)
    make_cyl("BridaAdmBase", 0.095, 0.04, (adm_x, 0.02, 1.46), m_brass)
    make_cyl("BridaAdm1", 0.095, 0.03, (adm_x, 0.02, 1.88), m_brass)
    make_cyl("CosValvMan", 0.085, 0.12, (adm_x, 0.02, 2.02), m_brass)
    make_cyl("EixVolantValv", 0.018, 0.16, (adm_x - 0.10, 0.02, 2.02), m_steel, rot=(0, math.pi / 2, 0))
    make_spoked_wheel("VolantValv", 0.11, 0.022, 4, (adm_x - 0.18, 0.02, 2.02), m_valve_red, mat_hub=m_brass, axis="X")
    # Vàlvula de papallona accionada pel regulador
    make_cyl("CosPapallona", 0.075, 0.08, (adm_x, 0.02, 1.66), m_brass)
    g_lleba_adm = add_empty("PalancaPapallona", (adm_x + 0.07, 0.02, 1.66))
    make_box("BracPapallona", (0.11, 0.02, 0.025), (0.04, 0.0, 0.0), m_steel, parent=g_lleba_adm, bevel=0.002)

    # Tub d'escapament vertical
    make_cyl("TubEscapament", 0.055, 0.85, (-1.94, 0.06, 1.88), m_iron)
    make_cyl("BridaEsc", 0.09, 0.03, (-1.94, 0.06, 1.50), m_iron)
    g_fum_esc = add_empty("NúvolEscapament", (-1.94, 0.06, 2.34))
    make_smoke_plume("VaporEsc", (0.0, 0.0, 0.0), 0.62, -0.08, 0.04, 0.068, m_steam_out, wisps=12, seed=29, parent=g_fum_esc)

    # Càmeres de vapor dins el cilindre (esquerra i dreta del pistó: alterna calent/usat amb escala per glTF)
    g_cam_esq_hot = add_empty("VaporCamEsqHot", (cyl_cx - cyl_len * 0.45, 0.0, cyl_cz))
    make_cyl("VaporEsqHotCyl", 0.20, 0.50, (0.25, 0.0, 0.0), m_steam_hot, rot=(0, math.pi / 2, 0), parent=g_cam_esq_hot, bevel=0.0)
    g_cam_esq_out = add_empty("VaporCamEsqOut", (cyl_cx - cyl_len * 0.45, 0.0, cyl_cz))
    make_cyl("VaporEsqOutCyl", 0.20, 0.50, (0.25, 0.0, 0.0), m_steam_out, rot=(0, math.pi / 2, 0), parent=g_cam_esq_out, bevel=0.0)

    g_cam_dret_hot = add_empty("VaporCamDretHot", (cyl_cx + cyl_len * 0.45, 0.0, cyl_cz))
    make_cyl("VaporDretHotCyl", 0.20, 0.50, (-0.25, 0.0, 0.0), m_steam_hot, rot=(0, math.pi / 2, 0), parent=g_cam_dret_hot, bevel=0.0)
    g_cam_dret_out = add_empty("VaporCamDretOut", (cyl_cx + cyl_len * 0.45, 0.0, cyl_cz))
    make_cyl("VaporDretOutCyl", 0.20, 0.50, (-0.25, 0.0, 0.0), m_steam_out, rot=(0, math.pi / 2, 0), parent=g_cam_dret_out, bevel=0.0)

    # 4. PISTÓ, TIJA I CREUERA
    g_piston = add_empty("GrupPisto", (cyl_cx, 0.0, cyl_cz))
    make_cyl("CapPisto", 0.208, 0.11, (0.0, 0.0, 0.0), m_iron, rot=(0, math.pi / 2, 0), parent=g_piston, bevel=0.005)
    make_cyl("Segment1", 0.213, 0.022, (-0.03, 0.0, 0.0), m_brass, rot=(0, math.pi / 2, 0), parent=g_piston, bevel=0.002)
    make_cyl("Segment2", 0.213, 0.022, (0.03, 0.0, 0.0), m_brass, rot=(0, math.pi / 2, 0), parent=g_piston, bevel=0.002)
    make_cyl("TijaPisto", 0.032, 1.18, (0.60, 0.0, 0.0), m_steel, rot=(0, math.pi / 2, 0), parent=g_piston, bevel=0.002)
    # Patí de la creuera (a +1.20 respecte al centre del pistó)
    make_box("CreueraCos", (0.18, 0.13, 0.28), (1.20, 0.0, 0.0), m_iron, parent=g_piston, bevel=0.008)
    make_box("PatiSup", (0.20, 0.15, 0.04), (1.20, 0.0, 0.145), m_brass, parent=g_piston, bevel=0.004)
    make_box("PatiInf", (0.20, 0.15, 0.04), (1.20, 0.0, -0.145), m_brass, parent=g_piston, bevel=0.004)
    make_cyl("PernCreuera", 0.038, 0.17, (1.20, 0.0, 0.0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_piston)

    # 5. EIX PRINCIPAL, MANOVELLA, EXCÈNTRICA, VOLANT I POLITJA
    ax_x, ax_z = 1.05, 0.96
    R_crank = 0.28
    L_biela = 1.81  # distància centre creuera (-0.76) a centre eix (1.05) = 1.81 exacte!

    # Coixinets de l'eix principal
    make_box("SuportCoixDavant", (0.30, 0.16, 0.26), (ax_x, -0.22, 0.80), m_paint, bevel=0.008)
    make_box("CoixDavant", (0.22, 0.14, 0.14), (ax_x, -0.22, ax_z), m_iron, bevel=0.006)
    make_cyl("CasquetDavant", 0.068, 0.15, (ax_x, -0.22, ax_z), m_brass, rot=(math.pi / 2, 0, 0))
    make_box("SuportCoixDarr", (0.32, 0.18, 0.26), (ax_x, 0.50, 0.80), m_paint, bevel=0.008)
    make_box("CoixDarr", (0.24, 0.16, 0.14), (ax_x, 0.50, ax_z), m_iron, bevel=0.006)
    make_cyl("CasquetDarr", 0.068, 0.17, (ax_x, 0.50, ax_z), m_brass, rot=(math.pi / 2, 0, 0))

    # Grup rotatori de l'eix principal
    g_eix = add_empty("GrupEixVolant", (ax_x, 0.0, ax_z))
    make_cyl("EixPrincipal", 0.056, 0.96, (0.0, 0.24, 0.0), m_steel, rot=(math.pi / 2, 0, 0), parent=g_eix)

    # Manovella amb contrapès a y = 0.0 (en el pla del pistó i la creuera)
    make_cyl("BossManovella", 0.11, 0.08, (0.0, 0.0, 0.0), m_iron, rot=(math.pi / 2, 0, 0), parent=g_eix)
    make_box("BracManovella", (R_crank + 0.08, 0.065, 0.11), (R_crank * 0.5, 0.0, 0.0), m_steel, parent=g_eix, bevel=0.008)
    make_cyl("ContrapesMan", 0.17, 0.065, (-0.10, 0.0, 0.0), m_iron, rot=(math.pi / 2, 0, 0), parent=g_eix)
    make_cyl("BotoManovella", 0.042, 0.12, (R_crank, 0.0, 0.0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_eix)

    # Excèntrica desfasada 90° a y = +0.14 (acciona la vàlvula corredora)
    r_exc = 0.075
    make_cyl("DiscExcentrica", 0.165, 0.052, (0.0, 0.14, r_exc), m_iron, rot=(math.pi / 2, 0, 0), parent=g_eix)
    make_torus("CollariExcentrica", 0.172, 0.018, (0.0, 0.14, r_exc), m_brass, rot=(math.pi / 2, 0, 0), parent=g_eix)

    # Gran volant d'inèrcia de 6 raigs a y = +0.34
    make_spoked_wheel("VolantInercia", 1.18, 0.14, 6, (0.0, 0.34, 0.0), m_paint, mat_hub=m_iron, axis="Y", parent=g_eix)
    make_torus("CantoVolant", 1.18, 0.025, (0.0, 0.34, 0.0), m_steel, rot=(math.pi / 2, 0, 0), major_segs=44, parent=g_eix)

    # Politja de transmissió darrere el volant / integrada a y = +0.23
    make_spoked_wheel("PolitjaMotriu", 0.58, 0.11, 6, (0.0, 0.23, 0.0), m_iron, mat_hub=m_brass, axis="Y", parent=g_eix)

    # Engranatge cònic petit sobre l'eix per moure el regulador centrífug
    make_gear("EngranatgeEix", 0.13, 0.04, 14, (0.0, -0.10, 0.0), m_brass, axis="Y", parent=g_eix)

    # 6. BIELA PRINCIPAL (connecta creuera amb botó de manovella)
    g_biela = add_empty("GrupBiela", (0.0, 0.0, 0.0))
    make_box("BielaCos", (L_biela - 0.10, 0.055, 0.085), (L_biela * 0.5, 0.0, 0.0), m_steel, parent=g_biela, bevel=0.008)
    make_box("CapBielaCreuera", (0.14, 0.095, 0.13), (0.0, 0.0, 0.0), m_brass, parent=g_biela, bevel=0.006)
    make_box("CapBielaMan", (0.16, 0.095, 0.14), (L_biela, 0.0, 0.0), m_brass, parent=g_biela, bevel=0.006)

    # Vareta de l'excèntrica (anirà del collarí de l'excèntrica cap a la tija de la vàlvula corredora)
    g_vareta_exc = add_empty("VaretaExcentrica", (0.0, 0.0, 0.0))
    vareta_cyl = make_cyl("VaretaExcCos", 0.020, 1.0, (0.5, 0.0, 0.0), m_steel, rot=(0, math.pi / 2, 0), parent=g_vareta_exc, bevel=0.0)
    make_cyl("TijaValvGuia", 0.018, 0.45, (0.0, 0.0, 0.0), m_steel, rot=(0, math.pi / 2, 0), parent=g_corredora)

    # 7. REGULADOR CENTRÍFUG DE WATT (sobre pedestal a x = -0.58)
    reg_x, reg_y, reg_z = -0.58, 0.24, 0.74
    make_cyl("ColumnaReg", 0.068, 0.62, (reg_x, reg_y, reg_z + 0.31), m_iron)
    make_cyl("BaseColReg", 0.13, 0.07, (reg_x, reg_y, reg_z + 0.035), m_paint)
    make_gear("EngranatgeRegBase", 0.10, 0.03, 12, (reg_x, reg_y, reg_z + 0.14), m_brass, axis="Z")
    # Arbre horitzontal discret des de l'eix del volant fins a la base del regulador
    make_cyl("ArbreReg", 0.022, 1.66, (0.24, 0.18, 0.88), m_steel, rot=(0, math.pi / 2, 0.08))

    g_reg_rot = add_empty("EixReguladorRot", (reg_x, reg_y, reg_z + 0.62))
    make_cyl("FusReg", 0.022, 0.56, (0.0, 0.0, 0.26), m_steel, parent=g_reg_rot)
    make_cyl("CapReg", 0.048, 0.05, (0.0, 0.0, 0.50), m_brass, parent=g_reg_rot)
    # Dos braços articulats amb boles pesants de llautó
    g_boles = []
    for side in (-1, 1):
        gb = add_empty(f"BracBola_{side}", (0.0, 0.0, 0.50), parent=g_reg_rot)
        make_rod_between(f"VaretaBola_{side}", (0, 0, 0), (side * 0.20, 0, -0.26), 0.013, m_steel, parent=gb)
        make_sphere(f"BolaReg_{side}", 0.072, (side * 0.22, 0, -0.29), m_brass, parent=gb)
        make_rod_between(f"TirantManeguet_{side}", (side * 0.11, 0, -0.14), (0, 0, -0.34), 0.010, m_steel, parent=gb)
        g_boles.append((side, gb))
    g_maneguet = add_empty("ManeguetReg", (0.0, 0.0, 0.16), parent=g_reg_rot)
    make_cyl("CollariManeguet", 0.045, 0.07, (0.0, 0.0, 0.0), m_brass, parent=g_maneguet)

    # Palanca i tirant del regulador connectat al maneguet i cap a la vàlvula de papallona d'entrada
    make_cyl("SuportPalancaReg", 0.020, 0.16, (reg_x + 0.08, reg_y - 0.06, reg_z + 0.68), m_iron)
    g_palanca_reg = add_empty("PalancaReg", (reg_x + 0.04, reg_y - 0.06, reg_z + 0.76))
    make_box("BracPalRegH", (0.22, 0.022, 0.025), (-0.04, 0.0, 0.0), m_steel, parent=g_palanca_reg, bevel=0.002)
    make_rod_between(
        "TirantValvAdm",
        (reg_x - 0.10, reg_y - 0.06, reg_z + 0.76),
        (adm_x + 0.12, 0.02, 1.66),
        0.012,
        m_steel,
    )

    # 8. EIX SUPERIOR DE LA FÀBRICA I DOBLE CORRETJA TANGENT EXACTA
    fab_x, fab_z = 2.08, 2.24
    r_mot, r_fab = 0.58, 0.26
    make_cyl("EixFabrica", 0.045, 0.85, (fab_x, 0.24, fab_z), m_steel, rot=(math.pi / 2, 0, 0))
    g_pol_fab = add_empty("PolitjaFabrica", (fab_x, 0.23, fab_z))
    make_spoked_wheel("PolFab", r_fab, 0.12, 6, (0, 0, 0), m_iron, mat_hub=m_brass, axis="Y", parent=g_pol_fab)
    dx_pf, dz_pf = fab_x - ax_x, fab_z - ax_z
    dist_pf = math.hypot(dx_pf, dz_pf)
    base_a = math.atan2(dz_pf, dx_pf)
    alpha_pf = math.acos((r_mot - r_fab) / dist_pf)
    for tag, sg in [("CorretjaSup", 1.0), ("CorretjaInf", -1.0)]:
        na = base_a + sg * alpha_pf
        p0 = (ax_x + r_mot * math.cos(na), 0.23, ax_z + r_mot * math.sin(na))
        p1 = (fab_x + r_fab * math.cos(na), 0.23, fab_z + r_fab * math.sin(na))
        make_rod_between(tag, p0, p1, 0.022, m_leather)

    def apply_pose(p):
        theta = 2.0 * math.pi * p  # 1 volta completa de manovella per cicle
        # Rotació del volant (gira horari vist des de -Y -> rot_y positiu en Euler Y?
        # Comprovem: Vector (R, 0, 0) rotat rot_y = theta dona (R*cos(theta), 0, -R*sin(theta)).
        g_eix.rotation_euler = (0.0, theta, 0.0)
        g_pol_fab.rotation_euler = (0.0, theta * 2.2, 0.0)

        # Posició exacta del botó de manovella
        cx = ax_x + R_crank * math.cos(theta)
        cz = ax_z - R_crank * math.sin(theta)

        # Posició exacta de la creuera (manté Z = ax_z = cyl_cz)
        dz = cz - ax_z
        dx = math.sqrt(max(0.01, L_biela * L_biela - dz * dz))
        x_cross = cx - dx
        x_piston = x_cross - 1.20
        g_piston.location = (x_piston, 0.0, cyl_cz)

        # Biela: origen a creuera (x_cross, 0, ax_z), orientació cap a botó de manovella (cx, 0, cz)
        g_biela.location = (x_cross, 0.0, ax_z)
        ang_biela = math.atan2(-(cz - ax_z), cx - x_cross)
        g_biela.rotation_euler = (0.0, ang_biela, 0.0)

        # Excèntrica (90° avançada respecte la manovella) mou la vàlvula corredora en D
        exc_ang = theta + math.pi * 0.5
        # El centre de l'excèntrica és (0, 0.14, r_exc) abans de rotar: després de rotar theta al voltant de Y:
        # (r_exc * sin(theta), 0.14, r_exc * cos(theta)) -> en coordenades món:
        ex_x = ax_x + r_exc * math.sin(theta)
        ex_z = ax_z + r_exc * math.cos(theta)

        # Desplaçament corredora en coordenades locals de g_caixa
        slide_x = 0.095 * math.sin(theta)
        g_corredora.location = (slide_x, 0.0, -0.035)
        # Extrem dret de la tija de la vàlvula en món
        tija_x = cyl_cx + (0.42 + slide_x) * math.cos(box_tilt)
        tija_z = 1.38 - (0.42 + slide_x) * math.sin(box_tilt)

        v_vec = Vector((ex_x - tija_x, 0.0, ex_z - tija_z))
        v_len = v_vec.length
        g_vareta_exc.location = (tija_x, 0.08, tija_z)
        g_vareta_exc.rotation_euler = (0.0, math.atan2(-v_vec.z, v_vec.x), 0.0)
        vareta_cyl.location = (v_len * 0.5, 0.0, 0.0)
        vareta_cyl.scale = (1.0, 1.0, v_len)

        # Càmeres de vapor esquerra i dreta dins el cilindre
        lim_esq = cyl_cx - cyl_len * 0.45
        lim_dret = cyl_cx + cyl_len * 0.45
        w_esq = max(0.05, (x_piston - 0.055) - lim_esq)
        w_dret = max(0.05, lim_dret - (x_piston + 0.055))
        s_esq = (w_esq / 0.50, 1.0, 1.0)
        s_dret = (w_dret / 0.50, 1.0, 1.0)
        tiny = (0.001, 0.001, 0.001)
        if slide_x >= 0:
            g_cam_esq_hot.scale = s_esq
            g_cam_esq_out.scale = tiny
            g_cam_dret_hot.scale = tiny
            g_cam_dret_out.scale = s_dret
        else:
            g_cam_esq_hot.scale = tiny
            g_cam_esq_out.scale = s_esq
            g_cam_dret_hot.scale = s_dret
            g_cam_dret_out.scale = tiny

        # Regulador centrífug: gira ràpid i les boles pugen lleugerament amb el pas de màxima velocitat
        g_reg_rot.rotation_euler = (0.0, 0.0, 4.0 * theta)
        lift = 0.08 * math.sin(2.0 * theta)
        for side, gb in g_boles:
            gb.rotation_euler = (0.0, side * lift, 0.0)
        g_maneguet.location = (0.0, 0.0, 0.16 + 0.04 * lift / 0.08)
        g_palanca_reg.rotation_euler = (0.0, 0.18 * lift / 0.08, 0.0)
        g_lleba_adm.rotation_euler = (0.0, 0.25 * lift / 0.08, 0.0)

        # Vapor d'escapament ascendent suau
        g_fum_esc.location = (-1.94, 0.06, 2.38 + 0.05 * math.sin(theta * 2.0))

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        anim_objs = [
            g_eix,
            g_pol_fab,
            g_piston,
            g_biela,
            g_corredora,
            g_vareta_exc,
            vareta_cyl,
            g_cam_esq_hot,
            g_cam_esq_out,
            g_cam_dret_hot,
            g_cam_dret_out,
            g_reg_rot,
            g_maneguet,
            g_palanca_reg,
            g_lleba_adm,
            g_fum_esc,
        ] + [gb for _, gb in g_boles]
        for fr in range(1, 61):
            p = (fr - 1) / 60.0
            apply_pose(p)
            for o in anim_objs:
                o.keyframe_insert(data_path="location", frame=fr)
                o.keyframe_insert(data_path="rotation_euler", frame=fr)
                o.keyframe_insert(data_path="scale", frame=fr)
        set_linear_fcurves(anim_objs)
        scene.frame_set(12)
    else:
        apply_pose(0.18)

    cam_loc = (2.15, -6.45, 2.75)
    target = (-0.15, 0.05, 1.28)
    setup_lighting(cam_loc, target, lens=42.0, mood="workshop")

    anchors = {
        "cilindre": (cyl_cx, -0.32, cyl_cz),
        "piston": (cyl_cx - 0.06, -0.18, cyl_cz),
        "distribucio": (cyl_cx, -0.18, 1.42),
        "creuera": (-0.82, -0.16, 0.96),
        "biela": (0.20, -0.12, 0.94),
        "excentrica": (ax_x, 0.08, 1.06),
        "regulador": (reg_x, reg_y - 0.14, 1.66),
        "volant": (ax_x + 0.55, 0.25, 1.85),
        "corretja": (1.58, 0.23, 1.62),
    }

    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
    render_image(os.path.join(out_dir, "rotativa-muntada.png"), res_x=1200, res_y=760, samples=28)
    render_closeup(os.path.join(out_dir, "rotativa-detall.png"), (-1.45, -2.55, 1.55), (-1.15, 0.0, 1.12), lens=48.0, samples=24)

    proj = project_anchors(anchors)
    export_glb_and_meta("rotativa", "rotativa.glb", anchors, extra_meta={"proj_2d": proj})


if __name__ == "__main__":
    build_rotativa(animate=True)

# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Generador 3D procedural (Blender 5.3 CLI) — rigor museogràfic i PBR:
Mula de filar de Samuel Crompton (1779 · tipus Hall i' th' Wood / Bolton Museum).

Inclou:
  - Bastidor fix (capçal) de roure anglès amb rails llargs d'acer sobre sòcol de postes
  - Fileta de dues altures amb 24 bobines de metxa de cotó cardat (fibra natural sense quadrícula)
  - Tres parelles de corrons d'estiratge (acer estriat inferior + cuir superior + contrapesos)
    amb tren d'engranatges laterals i pinyons intermedis que ENGRANEN realment dent amb dent
  - Gran roda manual de comandament muntada al CAPÇAL FIX (com l'exemplar de Bolton / Belper),
    amb cordó de transmissió fins al corró de llauna del carro mòbil
  - Carro mòbil de 24 fusos inclinats (14°), 24 cops cònics de cotó, rodes sobre rails i fil-guia
  - 24 fils helicoïdals que s'estiren, s'aprimen i es torcen realment durant l'estiratge fi
  - Filador a escala real al capçal accionant la roda manual i controlant el carro
  - Sòl de taller de fusta, llum de taller i escenografia interior per a Cycles

Ús:
  blender -b -P assets/blender/mula_3d.py
  blender -b -P assets/blender/mula_3d.py -- --glb-only
"""

import math
import os
import sys

import bpy

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if THIS_DIR not in sys.path:
    sys.path.insert(0, THIS_DIR)

from pbr_comu import (
    OUT_DIR,
    add_empty,
    add_shadow_floor,
    aim_and_twist_strand,
    build_pbr_pair,
    clear_scene,
    export_glb_and_meta,
    make_box,
    make_cone,
    make_cyl,
    make_gear,
    make_mat,
    make_rod_between,
    make_spoked_wheel,
    make_twisted_strand,
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


def _circle_intersect_below(x1, z1, d1, x2, z2, d2):
    """Calcula el centre (x, z) per sota de (x1,z1)-(x2,z2) a distàncies d1 i d2 perquè engranin exactament."""
    dx = x2 - x1
    dz = z2 - z1
    dist = math.hypot(dx, dz)
    a = (d1 * d1 - d2 * d2 + dist * dist) / (2.0 * dist)
    h = math.sqrt(max(1e-6, d1 * d1 - a * a))
    xm = x1 + a * dx / dist
    zm = z1 + a * dz / dist
    # Prenem la solució inferior (-Z) per sota la línia dels corrons
    return xm + h * (dz / dist), zm - h * (dx / dist)


def eval_mule_state(p):
    """4 fases del cicle de Crompton: alimentar -> estiratge fi (corrons aturats) -> fil-guia -> enrotllar."""
    fed = _seg(p, 0.00, 0.38)
    last = _seg(p, 0.38, 0.55)
    wind = _seg(p, 0.67, 0.96)
    car_x = (
        _mix(0.06, 0.80, fed)
        if p < 0.38
        else _mix(0.80, 1.04, last)
        if p < 0.55
        else 1.04
        if p < 0.67
        else _mix(1.04, 0.06, wind)
    )
    roller_ang = fed * 2.0 * math.pi * 1.4
    spindle_ang = (
        2.0 * math.pi * 4.5 * _seg(p, 0.00, 0.55)
        if p < 0.55
        else 2.0 * math.pi * (4.5 - 0.14 * _seg(p, 0.55, 0.62))
        if p < 0.67
        else 2.0 * math.pi * (4.36 + 2.0 * wind)
    )
    guide_drop = _seg(p, 0.55, 0.67) * (1.0 - _seg(p, 0.94, 1.00))
    cop_scale = 0.82 + 0.25 * wind
    return {
        "car_x": car_x,
        "roller_ang": roller_ang,
        "spindle_ang": spindle_ang,
        "guide_drop": guide_drop,
        "cop_scale": cop_scale,
        "last": last,
        "fed": fed,
        "wind": wind,
    }


def build_mula_scene(animate=False):
    clear_scene()

    pbr_wood = build_pbr_pair("MulaRoure", "wood", 512, 512, bump_scale=2.0)
    pbr_wood_dark = build_pbr_pair("MulaRoureFosc", "wood_dark", 512, 512, bump_scale=2.0)
    pbr_iron = build_pbr_pair("MulaFerro", "castiron", 512, 512, bump_scale=1.8)
    pbr_brass = build_pbr_pair("MulaLlauto", "brass", 512, 512, bump_scale=0.8)
    pbr_leather = build_pbr_pair("MulaCuir", "leather", 512, 512, bump_scale=1.8)
    pbr_cotton = build_pbr_pair("MulaCoto", "cotton_cloth", 512, 512, bump_scale=1.8)
    pbr_yarn = build_pbr_pair("MulaFil", "twisted_yarn", 512, 512, bump_scale=2.2)

    m_wood = make_mat("Roure", "#8e5c30", roughness=0.58, pbr_pair=pbr_wood, normal_strength=0.72)
    m_wood_dark = make_mat("RoureFosc", "#5a371a", roughness=0.65, pbr_pair=pbr_wood_dark, normal_strength=0.72)
    m_iron = make_mat("Ferro", "#31363c", metallic=0.84, roughness=0.44, pbr_pair=pbr_iron, normal_strength=0.60)
    m_steel = make_mat("Acer", "#b8c0c8", metallic=0.92, roughness=0.22)
    m_tin = make_mat("Llauna", "#959fa6", metallic=0.88, roughness=0.30)
    m_brass = make_mat("Llauto", "#d4a43a", metallic=0.92, roughness=0.24, pbr_pair=pbr_brass, normal_strength=0.32)
    m_leather = make_mat("Cuir", "#4e2e19", roughness=0.72, pbr_pair=pbr_leather, normal_strength=0.75)
    m_cotton = make_mat("Coto", "#f2ead5", roughness=0.90, pbr_pair=pbr_cotton, normal_strength=0.55)
    m_yarn = make_mat("FilTorcut", "#ede0bd", roughness=0.78, pbr_pair=pbr_yarn, tex_scale=(1.0, 2.4), normal_strength=0.85)
    m_cord = make_mat("CordoTrans", "#967d50", roughness=0.85)

    add_shadow_floor(z=0.0, size=14.0)
    make_workshop_floor("cottage_wood", size=(4.0, 3.2, 0.12), center=(0.08, -0.08), with_room_backdrop=True)

    # --- 1. BASTIDOR FIX (CAPÇAL) I RAILS LLARGS D'ACER (24 FUSOS: Y = -0.92 .. +0.92) ---
    g_frame = add_empty("Bastidor")
    frame_ys = (-1.04, 1.04)
    for px in (-1.16, -0.44):
        for py in frame_ys:
            make_box(f"PilarFix_{px}_{py}", (0.10, 0.10, 1.26), (px, py, 0.75), m_wood_dark, parent=g_frame, bevel=0.008)
            make_box(f"PeuFix_{px}_{py}", (0.14, 0.14, 0.04), (px, py, 0.14), m_iron, parent=g_frame, bevel=0.004)
    for py in frame_ys:
        make_box(f"TravLatFix_{py}", (0.64, 0.072, 0.078), (-0.80, py, 0.28), m_wood, parent=g_frame)
        make_box(f"TravSupFix_{py}", (0.72, 0.078, 0.085), (-0.80, py, 0.92), m_wood, parent=g_frame)
        make_box(f"SuportCorrons_{py}", (0.48, 0.048, 0.11), (-0.54, py, 1.00), m_iron, parent=g_frame, bevel=0.005)
    make_box("TravDarrereInf", (0.076, 1.98, 0.078), (-1.16, 0.0, 0.28), m_wood, parent=g_frame)
    make_box("TravDarrereSup", (0.076, 1.98, 0.082), (-1.16, 0.0, 1.32), m_wood, parent=g_frame)
    make_box("BigaCorrons", (0.28, 2.02, 0.065), (-0.54, 0.0, 0.91), m_wood_dark, parent=g_frame)

    # Rails d'acer amples sobre el sòcol (top a Z = 0.17)
    for ry in (-0.88, 0.88):
        make_box(f"RailBase_{ry}", (2.28, 0.075, 0.025), (0.62, ry, 0.132), m_iron, parent=g_frame, bevel=0.003)
        make_box(f"RailGuia_{ry}", (2.25, 0.032, 0.032), (0.62, ry, 0.155), m_steel, parent=g_frame, bevel=0.003)

    # --- 2. FILETA DE DUES ALTURES AMB 24 BOBINES DE METXA ---
    n_sp = 24
    y_slots = [-0.90 + k * (1.80 / (n_sp - 1)) for k in range(n_sp)]
    g_fileta = add_empty("Fileta")
    for sy in (-0.98, 0.98):
        make_box(f"MuntantFileta_{sy}", (0.08, 0.08, 0.72), (-1.04, sy, 1.50), m_wood, rot=(0.0, 0.14, 0.0), parent=g_fileta)
    make_box("PrestatgeFiletaBaix", (0.20, 2.04, 0.040), (-1.02, 0.0, 1.20), m_wood_dark, parent=g_fileta)
    make_box("PrestatgeFiletaAlt", (0.20, 2.04, 0.040), (-1.08, 0.0, 1.52), m_wood_dark, parent=g_fileta)
    make_box("BarraGuiaFileta", (0.035, 2.04, 0.035), (-0.92, 0.0, 1.82), m_wood, parent=g_fileta)

    for idx, ys in enumerate(y_slots):
        tier_x = -1.02 if (idx % 2 == 0) else -1.08
        tier_z = 1.35 if (idx % 2 == 0) else 1.67
        make_cyl(f"EixBobina_{idx}", 0.009, 0.28, (tier_x, ys, tier_z), m_wood_dark, verts=10, parent=g_fileta)
        make_cyl(f"DiscBobInf_{idx}", 0.044, 0.012, (tier_x, ys, tier_z - 0.125), m_wood, verts=14, parent=g_fileta)
        make_cyl(f"DiscBobSup_{idx}", 0.040, 0.012, (tier_x, ys, tier_z + 0.125), m_wood, verts=14, parent=g_fileta)
        make_cyl(f"MetxaBobina_{idx}", 0.041, 0.23, (tier_x, ys, tier_z), m_cotton, verts=14, parent=g_fileta)
        make_rod_between(f"MetxaEntrada_{idx}", (tier_x + 0.04, ys, tier_z - 0.03), (-0.68, ys, 1.01), 0.007, m_cotton, verts=6, parent=g_fileta)

    # --- 3. TRES PARELLES DE CORRONS D'ESTIRATGE + TREN D'ENGRANATGES ENGRANATS DENT AMB DENT ---
    g_corrons = add_empty("Corrons")
    roller_xs = (-0.68, -0.54, -0.40)
    r_inf_objs, r_sup_objs = [], []
    for idx, rx in enumerate(roller_xs):
        ri = add_empty(f"CorroInf_{idx}", (rx, 0.0, 0.975), parent=g_corrons)
        make_cyl(f"CorroInfCil_{idx}", 0.024, 2.10, (0.0, 0.0, 0.0), m_steel, rot=(math.pi / 2, 0.0, 0.0), verts=18, parent=ri)
        rs = add_empty(f"CorroSup_{idx}", (rx, 0.0, 1.024), parent=g_corrons)
        make_cyl(f"CorroSupCil_{idx}", 0.023, 1.96, (0.0, 0.0, 0.0), m_leather, rot=(math.pi / 2, 0.0, 0.0), verts=18, parent=rs)
        make_cyl(f"CorroSupEix_{idx}", 0.011, 2.08, (0.0, 0.0, 0.0), m_brass, rot=(math.pi / 2, 0.0, 0.0), verts=12, parent=rs)
        make_cyl(f"CorroEixExt_{idx}", 0.013, 0.16, (rx, -1.07, 0.975), m_steel, rot=(math.pi / 2, 0.0, 0.0), verts=12, parent=g_corrons)
        make_cyl(f"TirantPes_{idx}", 0.007, 0.24, (rx, -0.96, 0.90), m_iron, verts=8, parent=g_corrons, bevel=0.0)
        make_cyl(f"PesCorro_{idx}", 0.032, 0.09, (rx, -0.96, 0.76), m_iron, verts=14, parent=g_corrons)
        r_inf_objs.append(ri)
        r_sup_objs.append(rs)
        if idx < 2:
            for ys in y_slots:
                make_rod_between(
                    f"MetxaEntre_{idx}_{ys:.2f}",
                    (rx, ys, 1.00),
                    (roller_xs[idx + 1], ys, 1.00),
                    0.0062 - idx * 0.0018,
                    m_yarn,
                    verts=6,
                    parent=g_corrons,
                )

    # Engranatges laterals amb mòdul únic m = 0.0056 i rodes intermedies perquè tots engranin sense aire!
    mod = 0.0056
    z_g = 0.975
    y_gear = -1.12
    gear_teeth = (18, 14, 10)  # relació aprox 1.0 : 1.3 : 1.8 amb pinyons intermedis
    gear_r = [t * mod * 0.5 for t in gear_teeth]
    gear_pivs = []
    for idx, rx in enumerate(roller_xs):
        gp = add_empty(f"EngrCorroPiv_{idx}", (rx, y_gear, z_g), parent=g_corrons)
        make_gear(f"EngrCorro_{idx}", gear_r[idx], 0.022, gear_teeth[idx], (0.0, 0.0, 0.0), m_brass, mat_hub=m_iron, axis="Y", parent=gp)
        gear_pivs.append((gp, gear_teeth[idx]))

    # Rodes intermedies exactament tangents (d_sum = r_a + r_idler)
    idler_specs = [
        (0, 1, 16),  # entre corró 0 i 1
        (1, 2, 18),  # entre corró 1 i 2
    ]
    idler_pivs = []
    for k, (ia, ib, it_t) in enumerate(idler_specs):
        r_id = it_t * mod * 0.5
        ix, iz = _circle_intersect_below(roller_xs[ia], z_g, gear_r[ia] + r_id, roller_xs[ib], z_g, gear_r[ib] + r_id)
        make_cyl(f"IdlerEix_{k}", 0.010, 0.08, (ix, y_gear + 0.03, iz), m_steel, rot=(math.pi / 2, 0.0, 0.0), verts=10, parent=g_corrons)
        ip = add_empty(f"IdlerPiv_{k}", (ix, y_gear, iz), parent=g_corrons)
        gr = make_gear(f"Idler_{k}", r_id, 0.020, it_t, (0.0, 0.0, 0.0), m_iron, mat_hub=m_brass, axis="Y", parent=ip)
        gr.rotation_euler = (math.pi / 2, math.pi / it_t, 0.0)  # mig pas angular perquè la dent entri al buit
        idler_pivs.append((ip, it_t, gear_teeth[ia]))

    # --- 4. CAPÇAL FIX AMB LA GRAN RODA MANUAL DE COMANDAMENT (EXEMPLAR DE BOLTON) ---
    g_headstock = add_empty("CapcalFix")
    # Banc lateral fix al peu del capçal (X = -0.35, Y = -1.24) fora del pas del carro mòbil
    make_box("BancCapcalBase", (0.48, 0.22, 0.08), (-0.35, -1.24, 0.16), m_wood_dark, parent=g_headstock, bevel=0.005)
    make_rod_between("MuntantCapcalA", (-0.52, -1.24, 0.18), (-0.35, -1.24, 0.86), 0.044, m_wood, verts=8, parent=g_headstock)
    make_rod_between("MuntantCapcalB", (-0.18, -1.24, 0.18), (-0.35, -1.24, 0.86), 0.044, m_wood, verts=8, parent=g_headstock)
    make_box("CoixinetRodaCapcal", (0.095, 0.095, 0.085), (-0.35, -1.24, 0.86), m_iron, parent=g_headstock, bevel=0.004)

    g_flywheel = make_spoked_wheel("GranRodaCapcal", 0.38, 0.042, 8, (-0.35, -1.30, 0.86), m_iron, mat_hub=m_brass, axis="Y", parent=g_headstock)
    make_cyl("ManovellaBase", 0.015, 0.08, (0.24, -0.05, 0.0), m_steel, rot=(math.pi / 2, 0.0, 0.0), verts=12, parent=g_flywheel)
    make_cyl("ManovellaPom", 0.020, 0.12, (0.24, -0.11, 0.0), m_wood_dark, rot=(math.pi / 2, 0.0, 0.0), verts=14, parent=g_flywheel)

    # Politja guia tensora al cap de via (+X = 1.66) per conduir el cordó sense fi cap al carro
    make_box("PostPolitjaTensora", (0.10, 0.10, 0.62), (1.66, -1.16, 0.43), m_wood_dark, parent=g_headstock, bevel=0.005)
    make_cyl("PolitjaTensora", 0.09, 0.032, (1.66, -1.16, 0.54), m_brass, rot=(math.pi / 2, 0.0, 0.0), verts=20, parent=g_headstock)
    make_rod_between("CordoRodaSup", (-0.35, -1.18, 1.18), (1.66, -1.16, 0.62), 0.009, m_cord, verts=8, parent=g_headstock)
    make_rod_between("CordoRodaInf", (-0.35, -1.18, 0.54), (1.66, -1.16, 0.46), 0.009, m_cord, verts=8, parent=g_headstock)

    # Pinyó d'accionament des del capçal cap a l'engranatge del corró frontal (engranat exacte!)
    r_drive_pin = 14 * mod * 0.5
    p_dr_x, p_dr_z = _circle_intersect_below(roller_xs[2], z_g, gear_r[2] + r_drive_pin, roller_xs[2] + 0.06, z_g - 0.04, r_drive_pin + 0.02)
    # Fem més net: pinyó vertical just sota l'engranatge del corró frontal (-0.40, z_g - r2 - r_drive_pin)
    p_dr_x = roller_xs[2]
    p_dr_z = z_g - gear_r[2] - r_drive_pin
    g_drive_pin_piv = add_empty("EngrCapcalPiv", (p_dr_x, y_gear, p_dr_z), parent=g_headstock)
    make_gear("EngrCapcal", r_drive_pin, 0.022, 14, (0.0, 0.0, 0.0), m_brass, mat_hub=m_iron, axis="Y", parent=g_drive_pin_piv)
    make_rod_between("EixTransCorrons", (-0.35, -1.24, 0.86), (p_dr_x, y_gear, p_dr_z), 0.012, m_steel, verts=10, parent=g_headstock)

    # --- 5. CARRO MÒBIL SOBRE RAILS + 4 RODES + 24 FUSOS INCLINATS (14°) ---
    g_carro = add_empty("Carro", (0.06, 0.0, 0.0))
    make_box("CarroTaulerInf", (0.46, 1.96, 0.062), (0.0, 0.0, 0.40), m_wood, parent=g_carro)
    make_box("CarroMarcSup", (0.42, 1.94, 0.052), (0.0, 0.0, 0.70), m_wood_dark, parent=g_carro)
    for sx in (-0.17, 0.17):
        for sy in (-0.90, 0.0, 0.90):
            make_box(f"CarroMuntant_{sx}_{sy}", (0.052, 0.052, 0.34), (sx, sy, 0.54), m_wood, parent=g_carro)
            make_box(f"CartelaCarro_{sx}_{sy}", (0.066, 0.066, 0.066), (sx, sy, 0.40), m_iron, parent=g_carro, bevel=0.003)

    # Corró de llauna interior per accionar els 24 fusos + politja lateral sobre el cordó del capçal
    g_tin = add_empty("CorroLlaunaRot", (0.04, 0.0, 0.54), parent=g_carro)
    make_cyl("CorroLlauna", 0.068, 1.84, (0.0, 0.0, 0.0), m_tin, rot=(math.pi / 2, 0.0, 0.0), verts=22, parent=g_tin)
    make_cyl("PolitjaLlaunaCarro", 0.075, 0.032, (0.0, -1.16, 0.0), m_brass, rot=(math.pi / 2, 0.0, 0.0), verts=20, parent=g_tin)

    wheel_objs = []
    for wx in (-0.16, 0.16):
        for wy in (-0.88, 0.88):
            make_box(f"ForquillaRoda_{wx}_{wy}", (0.065, 0.045, 0.15), (wx, wy, 0.33), m_iron, parent=g_carro, bevel=0.004)
            w = make_spoked_wheel(f"RodaCarro_{wx}_{wy}", 0.095, 0.028, 6, (wx, wy, 0.266), m_iron, mat_hub=m_brass, axis="Y", parent=g_carro)
            wheel_objs.append(w)

    g_fusos = add_empty("Fusos", (0.0, 0.0, 0.0), parent=g_carro)
    spindle_objs = []
    cop_objs = []
    tilt = 0.244  # 14 graus cap enrere
    for idx, ys in enumerate(y_slots):
        make_cyl(f"CoixinetFus_{idx}", 0.015, 0.024, (-0.15, ys, 0.67), m_brass, verts=10, parent=g_fusos)
        make_cyl(f"BridaFusSup_{idx}", 0.012, 0.018, (-0.125, ys, 0.76), m_brass, verts=10, parent=g_fusos)
        sp_tilt = add_empty(f"FusInclinat_{idx}", (-0.15, ys, 0.67), parent=g_fusos)
        sp_tilt.rotation_euler = (0.0, tilt, 0.0)
        sp_root = add_empty(f"Fus_{idx}", (0.0, 0.0, 0.0), parent=sp_tilt)
        make_cyl(f"FusEix_{idx}", 0.0055, 0.42, (0.0, 0.0, 0.21), m_steel, verts=10, parent=sp_root, bevel=0.0)
        make_cyl(f"FusPolitja_{idx}", 0.017, 0.016, (0.0, 0.0, 0.055), m_brass, verts=12, parent=sp_root)
        cop = make_cone(f"CopCoto_{idx}", 0.026, 0.008, 0.19, (0.0, 0.0, 0.22), m_cotton, verts=14, parent=sp_root)
        spindle_objs.append(sp_root)
        cop_objs.append(cop)

    # Fil-guia (faller wire) basculant davant dels 24 fusos
    g_faller = add_empty("FilGuia", (-0.08, 0.0, 0.72), parent=g_carro)
    for sy in (-0.94, 0.94):
        make_box(f"BracGuia_{sy}", (0.020, 0.022, 0.36), (-0.06, sy, 0.17), m_iron, rot=(0.0, 0.22, 0.0), parent=g_faller, bevel=0.002)
    make_cyl("FilferroGuia", 0.005, 1.92, (-0.02, 0.0, 0.34), m_brass, rot=(math.pi / 2, 0.0, 0.0), verts=10, parent=g_faller)
    make_box("PalancaGuia", (0.025, 0.035, 0.22), (-0.10, -0.96, 0.08), m_wood_dark, rot=(0.0, 0.65, 0.0), parent=g_faller)

    # --- 6. 24 FILS CONTINUS AMB ESTIRAMENT, APRIMAMENT I TORSIÓ REAL ---
    yarn_pairs = []
    nip_x, nip_z = -0.40, 1.00
    tip_local_dx = 0.42 * math.sin(tilt)
    tip_local_dz = 0.42 * math.cos(tilt)
    for idx, ys in enumerate(y_slots):
        yarn_pairs.append(make_twisted_strand(f"FilMula_{idx}", m_yarn, radius=0.0030, verts=8))

    # --- 7. FILADOR A ESCALA AL COSTAT DEL CAPÇAL (SENSE TAPAR ENGRANATGES NI CORRONS) ---
    worker = make_worker("FiladorMula", (-0.88, -1.36, 0.12), facing_yaw=-0.38, scale=1.0, role="spinner")

    def apply_pose(p):
        st = eval_mule_state(p)
        cx = st["car_x"]
        g_carro.location = (cx, 0.0, 0.0)

        # Corrons + engranatges engranats amb direccions alternades
        for idx, (ri, rs) in enumerate(zip(r_inf_objs, r_sup_objs)):
            mult = (1.0, 1.28, 1.80)[idx]
            ang_r = st["roller_ang"] * mult
            ri.rotation_euler = (0.0, ang_r, 0.0)
            rs.rotation_euler = (0.0, -ang_r, 0.0)

        base_ang = st["roller_ang"]
        for gp, t in gear_pivs:
            ratio = gear_teeth[0] / float(t)
            gp.rotation_euler = (0.0, base_ang * ratio, 0.0)
        for ip, it_t, ref_t in idler_pivs:
            ratio = -gear_teeth[0] / float(it_t)
            ip.rotation_euler = (0.0, base_ang * ratio, 0.0)
        g_drive_pin_piv.rotation_euler = (0.0, -base_ang * (gear_teeth[0] / 14.0), 0.0)

        w_rot = cx / 0.095
        for w in wheel_objs:
            w.rotation_euler = (0.0, w_rot, 0.0)

        fly_ang = st["spindle_ang"] * 0.45
        g_flywheel.rotation_euler = (0.0, fly_ang, 0.0)
        g_tin.rotation_euler = (0.0, st["spindle_ang"] * 1.4, 0.0)

        for sp, cop in zip(spindle_objs, cop_objs):
            sp.rotation_euler = (0.0, 0.0, st["spindle_ang"])
            cop.scale = (st["cop_scale"], st["cop_scale"], 1.0)

        g_faller.rotation_euler = (0.0, -0.58 * st["guide_drop"], 0.0)

        # Fils: s'estiren de ~0.38 m a 1.38 m, s'aprimen (1.42 -> 0.65) i giren helicoïdalment
        tip_x = cx - 0.15 + tip_local_dx
        tip_z = 0.67 + tip_local_dz - 0.14 * st["guide_drop"]
        draw_prog = _clamp((cx - 0.06) / 0.98)
        r_thin = 1.42 - 0.77 * draw_prog
        twist_z = st["spindle_ang"] * 0.55
        for ys, sp_pair in zip(y_slots, yarn_pairs):
            aim_and_twist_strand(sp_pair, (nip_x, ys, nip_z), (tip_x, ys, tip_z), radius_scale=r_thin, twist_angle=twist_z)

        # Operari: mà esquerra acompanya la barra de retorn/carro; mà dreta gira el volant al capçal
        set_worker_pose(
            worker,
            torso_rot=(0.08 + 0.08 * draw_prog, 0.0, -0.25 + 0.35 * draw_prog),
            head_rot=(-0.08, 0.0, 0.25 * draw_prog),
            r_sh=(0.88 + 0.28 * math.sin(fly_ang), -0.15, 0.15 + 0.18 * math.cos(fly_ang)),
            r_elb=(-0.78 + 0.25 * math.cos(fly_ang), 0.0, 0.0),
            l_sh=(0.75 + 0.35 * draw_prog, 0.18, -0.35 * draw_prog),
            l_elb=(-0.55 - 0.25 * st["guide_drop"], 0.0, 0.0),
        )

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        gear_all = [gp for gp, _ in gear_pivs] + [ip for ip, _, _ in idler_pivs] + [g_drive_pin_piv]
        strand_all = [o for pair in yarn_pairs for o in pair]
        worker_objs = [worker["torso"], worker["head"], worker["l_sh"], worker["l_elb"], worker["r_sh"], worker["r_elb"]]
        anim_objs = (
            [g_carro, g_flywheel, g_tin, g_faller]
            + r_inf_objs
            + r_sup_objs
            + gear_all
            + wheel_objs
            + spindle_objs
            + cop_objs
            + strand_all
            + worker_objs
        )
        for fr in range(1, 61):
            p = (fr - 1) / 60.0
            apply_pose(p)
            for o in anim_objs:
                o.keyframe_insert(data_path="location", frame=fr)
                if o.rotation_mode == "QUATERNION":
                    o.keyframe_insert(data_path="rotation_quaternion", frame=fr)
                else:
                    o.keyframe_insert(data_path="rotation_euler", frame=fr)
                o.keyframe_insert(data_path="scale", frame=fr)
        set_linear_fcurves(anim_objs)
    else:
        apply_pose(0.46)

    setup_lighting(cam_loc=(2.15, -4.35, 2.35), target=(0.05, -0.10, 0.86), lens=38.0, mood="workshop")

    anchors = {
        "fileta": (-1.04, -0.35, 1.48),
        "corrons": (-0.54, -0.85, 1.03),
        "carro": (0.72, -0.88, 0.42),
        "fus": (0.55, -0.45, 0.98),
        "bastidor": (-1.16, -1.04, 0.88),
        "roda": (-0.35, -1.30, 0.90),
    }
    return anchors


def main():
    glb_only = "--glb-only" in sys.argv
    if not glb_only:
        anc = build_mula_scene(animate=False)
        render_image(os.path.join(OUT_DIR, "mula-muntada.png"), res_x=1200, res_y=760, samples=32)
        pts = project_anchors(anc)
        render_closeup(
            os.path.join(OUT_DIR, "mula-detall.png"),
            cam_loc=(-0.15, -2.20, 1.32),
            target=(-0.48, -0.80, 0.92),
            lens=48.0,
            samples=28,
        )

    anc_glb = build_mula_scene(animate=True)
    export_glb_and_meta(
        "mula",
        "mula.glb",
        anc_glb,
        extra_meta={"muntada_pct": pts} if not glb_only else None,
    )


if __name__ == "__main__":
    main()

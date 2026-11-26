# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Generador 3D procedural (Blender 5.3 CLI) — rigor museogràfic i PBR:
Water Frame de Richard Arkwright (c. 1775, Cromford / Science and Industry Museum).

Inclou:
  - Bastidor vertical tipus armari de roure anglès fosc amb muntants mortasats sobre lloses de fàbrica
  - Roda hidràulica exterior separada per muret de pedra del molí que mou un eix de fàbrica amb politja i corretja
  - Rastellera superior amb 4 bobines de metxa de cotó cardat (sense quadrícula)
  - Capçal d'estirament amb 3 parells de corrons (acer + cuir + contrapesos) i engranatges que ENGRANEN dent amb dent
  - 4 aletes giratòries en U invertida i 4 bobines sobre barra de vaivé (copping rail)
  - Fils amb estirament progressiu entre corrons i torsió helicoïdal giratòria fins a l'aleta
  - Jove operari/a (~1,42 m) vigilant el trencament dels fils a escala real
  - Sòl de lloses de pedra, llum de taller i escenografia interior de fàbrica per a Cycles

Ús:
  blender -b -P assets/blender/water_3d.py
  blender -b -P assets/blender/water_3d.py -- --glb-only
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
    make_cyl,
    make_gear,
    make_mat,
    make_rod_between,
    make_sphere,
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


def _circle_intersect_above(x1, z1, d1, x2, z2, d2):
    """Centre (x, z) per sobre de (x1,z1)-(x2,z2) a distàncies d1 i d2."""
    dx = x2 - x1
    dz = z2 - z1
    dist = math.hypot(dx, dz)
    a = (d1 * d1 - d2 * d2 + dist * dist) / (2.0 * dist)
    h = math.sqrt(max(1e-6, d1 * d1 - a * a))
    xm = x1 + a * dx / dist
    zm = z1 + a * dz / dist
    return xm - h * (dz / dist), zm + h * (dx / dist)


def _make_flyer(name, mat_steel, mat_brass, parent=None):
    fl = add_empty(name, (0.0, 0.0, 0.0), parent=parent)
    make_cyl(f"{name}_Coll", 0.014, 0.052, (0.0, 0.0, 0.025), mat_brass, verts=14, parent=fl)
    make_box(f"{name}_Espatlla", (0.118, 0.018, 0.016), (0.0, 0.0, -0.004), mat_steel, parent=fl, bevel=0.003)
    for sx in (-0.052, 0.052):
        make_cyl(f"{name}_Brac_{sx}", 0.0065, 0.215, (sx, 0.0, -0.115), mat_steel, verts=10, parent=fl, bevel=0.0)
        make_sphere(f"{name}_UllBrac_{sx}", 0.0095, (sx, 0.0, -0.215), mat_brass, parent=fl)
    return fl


def _make_pillow(name, loc, mat_iron, mat_brass, parent=None):
    pb = add_empty(name, loc, parent=parent)
    make_box(f"{name}_Cos", (0.065, 0.085, 0.048), (0.0, 0.0, 0.0), mat_iron, parent=pb, bevel=0.004)
    make_cyl(f"{name}_Boixa", 0.022, 0.072, (0.0, 0.0, 0.0), mat_brass, rot=(0, math.pi / 2, 0), verts=14, parent=pb)
    return pb


def eval_water_state(p):
    ang_drive = 2.0 * math.pi * p
    return {
        "ang_drive": ang_drive,
        "ang_r1": 1.0 * ang_drive,
        "ang_r2": 1.6 * ang_drive,
        "ang_r3": 3.2 * ang_drive,
        "ang_flyer": 8.0 * ang_drive,
        "ang_bobbin": 6.5 * ang_drive,
        "rail_dz": 0.042 * math.sin(2.0 * math.pi * p),
        "p": p,
    }


def build_water_scene(animate=False):
    clear_scene()

    pbr_wood = build_pbr_pair("WfRoure", "wood", 512, 512, bump_scale=2.0)
    pbr_wood_dark = build_pbr_pair("WfRoureFosc", "wood_dark", 512, 512, bump_scale=2.0)
    pbr_stone = build_pbr_pair("WfPedra", "flagstone", 512, 512, bump_scale=2.2)
    pbr_iron = build_pbr_pair("WfFerro", "castiron", 512, 512, bump_scale=1.8)
    pbr_brass = build_pbr_pair("WfLlauto", "brass", 512, 512, bump_scale=0.8)
    pbr_leather = build_pbr_pair("WfCuir", "leather", 512, 512, bump_scale=1.8)
    pbr_cotton = build_pbr_pair("WfCoto", "cotton_cloth", 512, 512, bump_scale=1.8)
    pbr_yarn = build_pbr_pair("WfFil", "twisted_yarn", 512, 512, bump_scale=2.2)

    m_stone = make_mat("Pedra", "#969083", roughness=0.90, pbr_pair=pbr_stone, tex_scale=(1.2, 1.2), normal_strength=0.85)
    m_wood = make_mat("Roure", "#835228", roughness=0.58, pbr_pair=pbr_wood, normal_strength=0.72)
    m_wood_dark = make_mat("RoureFosc", "#482a14", roughness=0.65, pbr_pair=pbr_wood_dark, normal_strength=0.72)
    m_iron = make_mat("Ferro", "#2c3137", metallic=0.86, roughness=0.42, pbr_pair=pbr_iron, normal_strength=0.60)
    m_steel = make_mat("Acer", "#c0c8d0", metallic=0.94, roughness=0.18)
    m_brass = make_mat("Llauto", "#d6a53a", metallic=0.92, roughness=0.22, pbr_pair=pbr_brass, normal_strength=0.32)
    m_tin = make_mat("Estany", "#a7afb5", metallic=0.88, roughness=0.30)
    m_leather = make_mat("Cuir", "#58341c", roughness=0.68, pbr_pair=pbr_leather, normal_strength=0.75)
    m_cotton = make_mat("CotoCru", "#efe7d2", roughness=0.90, pbr_pair=pbr_cotton, normal_strength=0.55)
    m_yarn = make_mat("FilTorcut", "#e7d8b5", roughness=0.78, pbr_pair=pbr_yarn, tex_scale=(1.0, 2.4), normal_strength=0.85)
    m_cord = make_mat("CordoCanem", "#9c8256", roughness=0.85)
    m_water = make_mat("AiguaCanal", "#4a86a8", roughness=0.14)

    add_shadow_floor(z=0.0, size=14.0)
    make_workshop_floor("mill_stone", size=(3.15, 2.25, 0.14), center=(-0.22, -0.08), with_room_backdrop=True)

    # Canaló hidràulic exterior separat del taller per un muret de fàbrica que travessa l'eix
    make_box("CanaletaFossa", (0.48, 2.15, 0.03), (-1.42, -0.08, 0.135), m_water, bevel=0.004)
    for cx in (-1.66, -1.16):
        make_box(f"MuretCanal_{cx}", (0.08, 2.15, 0.10), (cx, -0.08, 0.18), m_stone, bevel=0.006)
    make_box("MuretSeparacioFabrica", (0.14, 1.85, 0.72), (-1.08, 0.0, 0.50), m_stone, bevel=0.010)

    # --- 1. BASTIDOR VERTICAL TIPUS ARMARI DE ROURE FOSC ---
    g_frame = add_empty("Bastidor")
    for sx in (-0.54, 0.54):
        for sy in (-0.42, 0.42):
            make_box(f"Pilar_{sx}_{sy}", (0.095, 0.095, 1.58), (sx, sy, 0.93), m_wood_dark, parent=g_frame, bevel=0.008)
            make_box(f"Sabata_{sx}_{sy}", (0.135, 0.135, 0.036), (sx, sy, 0.158), m_iron, parent=g_frame, bevel=0.004)
        make_box(f"TravLatBaix_{sx}", (0.074, 0.75, 0.082), (sx, 0.0, 0.25), m_wood, parent=g_frame)
        make_box(f"TravLatMig_{sx}", (0.074, 0.75, 0.082), (sx, 0.0, 0.86), m_wood, parent=g_frame)
        make_box(f"TravLatAlt_{sx}", (0.074, 0.75, 0.082), (sx, 0.0, 1.32), m_wood, parent=g_frame)
        make_box(f"Escaire_{sx}", (0.080, 0.15, 0.14), (sx, -0.34, 1.24), m_iron, parent=g_frame, bevel=0.003)

    for sy in (-0.42, 0.42):
        make_box(f"BigaBaix_{sy}", (0.99, 0.074, 0.082), (0.0, sy, 0.23), m_wood, parent=g_frame)
    make_box("BigaAltPost", (0.99, 0.074, 0.082), (0.0, 0.42, 1.32), m_wood, parent=g_frame)
    make_box("BigaAltDavant", (0.99, 0.068, 0.064), (0.0, -0.42, 1.27), m_wood, parent=g_frame)
    make_box("BigaPontMigDavant", (0.99, 0.056, 0.048), (0.0, -0.27, 0.90), m_wood_dark, parent=g_frame)
    make_box("BigaPontBaixDavant", (0.99, 0.058, 0.052), (0.0, -0.27, 0.49), m_wood_dark, parent=g_frame)
    make_box("BancCorrons", (1.02, 0.42, 0.044), (0.0, 0.04, 1.36), m_wood, rot=(0.14, 0.0, 0.0), parent=g_frame, bevel=0.004)

    # --- 2. RASTELLERA SUPERIOR DE 4 BOBINES DE METXA ---
    xs_sp = (-0.36, -0.12, 0.12, 0.36)
    g_creel = add_empty("RastelleraMetxa", (0.0, 0.0, 0.0), parent=g_frame)
    for sx in (-0.54, 0.54):
        make_box(f"BracRast_{sx}", (0.068, 0.075, 0.36), (sx, 0.24, 1.66), m_wood_dark, parent=g_creel, bevel=0.004)
    make_box("BarraSupRast", (1.16, 0.068, 0.055), (0.0, 0.24, 1.82), m_wood, parent=g_creel, bevel=0.004)
    make_box("BarraInfRast", (1.16, 0.068, 0.050), (0.0, 0.24, 1.54), m_wood, parent=g_creel, bevel=0.004)

    for i, x in enumerate(xs_sp):
        make_cyl(f"EixMetxa_{i}", 0.011, 0.28, (x, 0.24, 1.68), m_steel, verts=12, parent=g_creel, bevel=0.0)
        make_cyl(f"BobinaMetxa_{i}", 0.068, 0.18, (x, 0.24, 1.68), m_cotton, verts=22, parent=g_creel)
        for sz in (1.585, 1.775):
            make_cyl(f"ValonaMetxa_{i}_{sz}", 0.076, 0.014, (x, 0.24, sz), m_wood_dark, verts=20, parent=g_creel)
        make_sphere(f"GuiaMetxa_{i}", 0.012, (x, 0.18, 1.49), m_brass, parent=g_creel)

    # --- 3. 3 PARELLS DE CORRONS + TREN D'ENGRANATGES LATERALS ENGRANATS ---
    g_draft = add_empty("CorronsEstirament")
    roller_locs = [(0.16, 1.43), (0.02, 1.41), (-0.12, 1.39)]
    roller_groups = []
    mod = 0.0056
    gear_teeth = (18, 14, 10)
    gear_radii = [t * mod * 0.5 for t in gear_teeth]
    side_gears = []

    for idx, (ry, rz) in enumerate(roller_locs):
        r_bot = add_empty(f"CorroInf_{idx}", (0.0, ry, rz), parent=g_draft)
        make_cyl(f"EixCorroInf_{idx}", 0.017, 1.18, (0.02, 0.0, 0.0), m_steel, rot=(0, math.pi / 2, 0), verts=18, parent=r_bot)
        for x in xs_sp:
            make_cyl(f"EstriaCorro_{idx}_{x}", 0.022, 0.058, (x, 0.0, 0.0), m_steel, rot=(0, math.pi / 2, 0), verts=18, parent=r_bot)

        r_top = add_empty(f"CorroSup_{idx}", (0.0, ry, rz + 0.042), parent=g_draft)
        make_cyl(f"EixCorroSup_{idx}", 0.014, 1.04, (0.0, 0.0, 0.0), m_iron, rot=(0, math.pi / 2, 0), verts=14, parent=r_top)
        for x in xs_sp:
            make_cyl(f"CuirCorro_{idx}_{x}", 0.023, 0.056, (x, 0.0, 0.0), m_leather, rot=(0, math.pi / 2, 0), verts=18, parent=r_top)
        roller_groups.append((r_bot, r_top))

        gp = add_empty(f"EngrCorroPiv_{idx}", (0.60, ry, rz), parent=g_draft)
        make_gear(f"EngrCorro_{idx}", gear_radii[idx], 0.022, gear_teeth[idx], (0.0, 0.0, 0.0), m_brass if idx != 1 else m_iron, mat_hub=m_iron, axis="X", parent=gp)
        side_gears.append((gp, gear_teeth[idx]))

    # Engranatges intermedis tangents sobre el mateix pla X=0.60
    wf_idlers = []
    for k, (ia, ib, it_t) in enumerate(((0, 1, 16), (1, 2, 18))):
        r_id = it_t * mod * 0.5
        ry_a, rz_a = roller_locs[ia]
        ry_b, rz_b = roller_locs[ib]
        iy, iz = _circle_intersect_above(ry_a, rz_a, gear_radii[ia] + r_id, ry_b, rz_b, gear_radii[ib] + r_id)
        make_cyl(f"WfIdlerEix_{k}", 0.010, 0.07, (0.57, iy, iz), m_steel, rot=(0, math.pi / 2, 0), verts=10, parent=g_draft)
        ip = add_empty(f"WfIdlerPiv_{k}", (0.60, iy, iz), parent=g_draft)
        gr = make_gear(f"WfIdler_{k}", r_id, 0.020, it_t, (0.0, 0.0, 0.0), m_iron, mat_hub=m_brass, axis="X", parent=ip)
        gr.rotation_euler = (math.pi / it_t, math.pi / 2, 0.0)
        wf_idlers.append((ip, it_t))

    for wx in (-0.24, 0.0, 0.24):
        make_rod_between(f"GanxoPes_{wx}", (wx, 0.02, 1.46), (wx, 0.02, 1.12), 0.007, m_iron, verts=8, parent=g_draft)
        make_cyl(f"Contrapes_{wx}", 0.046, 0.14, (wx, 0.02, 1.05), m_iron, verts=16, parent=g_draft)

    make_box("BarraUllsGuia", (1.00, 0.038, 0.026), (0.0, -0.27, 1.24), m_wood_dark, parent=g_frame, bevel=0.003)
    for i, x in enumerate(xs_sp):
        make_sphere(f"UllGuiaAleta_{i}", 0.011, (x, -0.27, 1.225), m_brass, parent=g_frame)

    # --- 4. 4 FUSOS FRONTALS AMB ALETES EN U, BOBINES I PONT DE VAIVÉ ---
    g_spindles = add_empty("PontAletes")
    y_sp = -0.27
    g_rail = add_empty("PontVaive", (0.0, y_sp, 0.62), parent=g_spindles)
    make_box("TauloVaive", (1.02, 0.095, 0.032), (0.0, 0.0, 0.0), m_wood, parent=g_rail, bevel=0.004)
    for sx in (-0.48, 0.48):
        make_cyl(f"GuiaVaive_{sx}", 0.011, 0.36, (sx, y_sp, 0.68), m_steel, verts=10, parent=g_spindles, bevel=0.0)

    flyers, bobbins = [], []
    for i, x in enumerate(xs_sp):
        make_cyl(f"CoixinetFusInf_{i}", 0.016, 0.024, (x, y_sp, 0.515), m_brass, verts=14, parent=g_spindles)
        make_cyl(f"CoixinetFusMig_{i}", 0.016, 0.024, (x, y_sp, 0.88), m_brass, verts=14, parent=g_spindles)

        fl_rot = add_empty(f"AletaRot_{i}", (x, y_sp, 0.98), parent=g_spindles)
        make_cyl(f"EixFus_{i}", 0.0075, 0.50, (0.0, 0.0, -0.25), m_steel, verts=12, parent=fl_rot, bevel=0.0)
        make_cyl(f"TorteraFus_{i}", 0.034, 0.024, (0.0, 0.0, -0.43), m_brass, verts=18, parent=fl_rot)
        _make_flyer(f"Aleta_{i}", m_steel, m_brass, parent=fl_rot)
        flyers.append(fl_rot)

        bob_rot = add_empty(f"BobinaRot_{i}", (x, 0.0, 0.016), parent=g_rail)
        make_cyl(f"BobinaNucli_{i}", 0.016, 0.16, (0.0, 0.0, 0.08), m_wood_dark, verts=14, parent=bob_rot)
        make_cyl(f"BobinaFil_{i}", 0.032, 0.128, (0.0, 0.0, 0.08), m_yarn, verts=18, parent=bob_rot)
        for bz in (0.008, 0.152):
            make_cyl(f"ValonaBob_{i}_{bz}", 0.038, 0.012, (0.0, 0.0, bz), m_wood, verts=18, parent=bob_rot)
        bobbins.append(bob_rot)

    # --- 5. TRANSMISSIÓ HIDRÀULICA PER EIX DE FÀBRICA + CORRETJA ---
    g_drive = add_empty("TransmissioHidraulica")
    g_water_shaft = add_empty("EixAigua", (-0.82, 0.0, 0.40), parent=g_drive)
    make_cyl("BarraAigua", 0.026, 1.48, (0.06, 0.0, 0.0), m_steel, rot=(0, math.pi / 2, 0), verts=18, parent=g_water_shaft)
    make_spoked_wheel("PolitjaHidraulica", 0.27, 0.10, 8, (-0.58, 0.0, 0.0), m_wood_dark, mat_hub=m_iron, axis="X", parent=g_water_shaft)
    for k in range(12):
        ang_p = 2.0 * math.pi * k / 12.0
        make_box(f"PalaAigua_{k}", (0.12, 0.018, 0.078), (-0.58, 0.295 * math.cos(ang_p), 0.295 * math.sin(ang_p)), m_wood, rot=(ang_p, 0, 0), parent=g_water_shaft, bevel=0.002)
    # Politja a l'eix de fàbrica + politja d'entrada a la màquina (separades i unides per corretja)
    make_cyl("PolitjaEmbarrat", 0.11, 0.068, (-0.12, 0.0, 0.0), m_iron, rot=(0, math.pi / 2, 0), verts=24, parent=g_water_shaft)
    make_cyl("PolitjaEmbragatge", 0.13, 0.068, (0.18, 0.0, 0.0), m_brass, rot=(0, math.pi / 2, 0), verts=24, parent=g_water_shaft)
    make_gear("PinyoConicH", 0.082, 0.032, 16, (0.82, 0.0, 0.0), m_iron, mat_hub=m_brass, axis="X", parent=g_water_shaft)
    _make_pillow("CoixinetAigua", (-0.64, 0.0, 0.40), m_iron, m_brass, parent=g_drive)
    _make_pillow("CoixinetCanalExt", (-1.52, 0.0, 0.40), m_iron, m_brass, parent=g_drive)
    make_box("PilastraCanalExt", (0.10, 0.14, 0.22), (-1.52, 0.0, 0.27), m_stone, parent=g_drive, bevel=0.004)

    make_rod_between("CorretjaMoliA", (-0.94, -0.09, 0.40), (-0.94, -0.09, 1.62), 0.014, m_leather, verts=8, parent=g_drive)
    make_rod_between("CorretjaMoliB", (-0.94, 0.09, 0.40), (-0.94, 0.09, 1.62), 0.014, m_leather, verts=8, parent=g_drive)

    g_king_shaft = add_empty("EixReiVertical", (0.0, 0.12, 0.36), parent=g_drive)
    make_cyl("BarraEixRei", 0.022, 1.18, (0.0, 0.0, 0.52), m_steel, verts=16, parent=g_king_shaft, bevel=0.0)
    make_gear("CoronaConicaV", 0.095, 0.030, 18, (0.0, 0.0, 0.04), m_brass, mat_hub=m_iron, axis="Z", parent=g_king_shaft)
    make_cyl("TamboMotorFusos", 0.145, 0.14, (0.0, 0.0, 0.21), m_tin, verts=28, parent=g_king_shaft)
    make_gear("PinyoSuperiorRei", 0.068, 0.026, 14, (0.0, 0.0, 1.05), m_brass, mat_hub=m_iron, axis="Z", parent=g_king_shaft)

    # Eix superior d'engranatges que engrana amb EngrCorro_0 (ry=0.16, rz=1.43, r=0.0504)
    r_top_pin = 12 * mod * 0.5
    g_top_shaft = add_empty("EixReenviamentSup", (0.0, 0.16, 1.43 - gear_radii[0] - r_top_pin), parent=g_drive)
    make_cyl("BarraReenvSup", 0.016, 0.68, (0.30, 0.0, 0.0), m_steel, rot=(0, math.pi / 2, 0), verts=14, parent=g_top_shaft)
    make_gear("PinyoReenvSup", r_top_pin, 0.022, 12, (0.60, 0.0, 0.0), m_iron, mat_hub=m_brass, axis="X", parent=g_top_shaft)

    for i, x in enumerate(xs_sp):
        make_rod_between(f"CordillaFusL_{i}", (-0.08 + i * 0.05, 0.12, 0.57), (x - 0.025, y_sp, 0.55), 0.0036, m_cord, verts=6, parent=g_drive)
        make_rod_between(f"CordillaFusR_{i}", (-0.08 + i * 0.05, 0.12, 0.54), (x + 0.025, y_sp, 0.55), 0.0036, m_cord, verts=6, parent=g_drive)

    # --- 6. 4 FILS AMB APRIMAMENT ENTRE CORRONS I TORSIÓ HELICOÏDAL REAL CAP A L'ALETA ---
    g_fils = add_empty("FilsCotons")
    twist_upper = []
    twist_collar = []
    for i, x in enumerate(xs_sp):
        # Metxa gruixuda d'entrada i estiratge progressiu pels 3 parells de corrons (1 -> 0.68 -> 0.42)
        make_rod_between(f"MetxaFil_{i}", (x, 0.18, 1.49), (x, 0.16, 1.45), 0.0068, m_cotton, verts=8, parent=g_fils)
        make_rod_between(f"MetxaEst12_{i}", (x, 0.16, 1.45), (x, 0.02, 1.43), 0.0052, m_cotton, verts=8, parent=g_fils)
        make_rod_between(f"MetxaEst23_{i}", (x, 0.02, 1.43), (x, -0.12, 1.41), 0.0032, m_yarn, verts=8, parent=g_fils)
        # Trams actius de torsió giratòria (des del 3r parell -> ull -> aleta)
        tu = make_twisted_strand(f"FilTorsSup_{i}", m_yarn, radius=0.0024, verts=10, parent=g_fils)
        aim_and_twist_strand(tu, (x, -0.12, 1.41), (x, -0.27, 1.225), radius_scale=1.0, twist_angle=0.0)
        twist_upper.append(tu)
        tc = make_twisted_strand(f"FilTorsCol_{i}", m_yarn, radius=0.0022, verts=10, parent=g_fils)
        aim_and_twist_strand(tc, (x, -0.27, 1.225), (x, -0.27, 1.005), radius_scale=1.0, twist_angle=0.0)
        twist_collar.append(tc)
        # Fil dins del braç de cada aleta giratòria
        make_rod_between(f"FilDinsAleta_{i}", (0.0, 0.0, 0.03), (-0.052, 0.0, -0.004), 0.0022, m_yarn, verts=6, parent=flyers[i])
        make_rod_between(f"FilBracAleta_{i}", (-0.052, 0.0, -0.004), (-0.052, 0.0, -0.215), 0.0022, m_yarn, verts=6, parent=flyers[i])
        make_rod_between(f"FilCapBobina_{i}", (-0.052, 0.0, -0.215), (-0.028, 0.0, -0.255), 0.0022, m_yarn, verts=6, parent=flyers[i])

    # --- 7. JOVE VIGILANT DELS FILS A ESCALA REAL (~1,42 m, AL COSTAT ESQUERRE SENSE TAPAR EL PRIMER PLA) ---
    worker = make_worker("VigilantWaterFrame", (-0.78, -0.78, 0.14), facing_yaw=-math.pi * 0.28, scale=0.86, role="piecer")

    def apply_pose(p):
        st = eval_water_state(p)
        g_water_shaft.rotation_euler = (st["ang_drive"], 0.0, 0.0)
        g_king_shaft.rotation_euler = (0.0, 0.0, st["ang_drive"] * 1.4)
        g_top_shaft.rotation_euler = (-st["ang_r1"] * (gear_teeth[0] / 12.0), 0.0, 0.0)

        speeds = (st["ang_r1"], st["ang_r2"], st["ang_r3"])
        for idx, (r_bot, r_top) in enumerate(roller_groups):
            r_bot.rotation_euler = (speeds[idx], 0.0, 0.0)
            r_top.rotation_euler = (-speeds[idx], 0.0, 0.0)
        for gp, t in side_gears:
            gp.rotation_euler = (st["ang_r1"] * (gear_teeth[0] / float(t)), 0.0, 0.0)
        for ip, it_t in wf_idlers:
            ip.rotation_euler = (-st["ang_r1"] * (gear_teeth[0] / float(it_t)), 0.0, 0.0)

        for fl in flyers:
            fl.rotation_euler = (0.0, 0.0, st["ang_flyer"])
        for bob in bobbins:
            bob.rotation_euler = (0.0, 0.0, st["ang_bobbin"])
        g_rail.location = (0.0, y_sp, 0.62 + st["rail_dz"])

        twist_z = st["ang_flyer"] * 0.70
        for tu, tc in zip(twist_upper, twist_collar):
            tu[1].rotation_euler = (0.0, 0.0, twist_z)
            tc[1].rotation_euler = (0.0, 0.0, twist_z)

        # Jove observant la filada i comprovant la tensió d'un fil amb la mà esquerra
        watch = math.sin(2.0 * math.pi * p)
        set_worker_pose(
            worker,
            torso_rot=(0.10 + 0.04 * watch, 0.0, 0.14),
            head_rot=(-0.10, 0.0, 0.25 + 0.12 * watch),
            l_sh=(0.95 + 0.12 * watch, 0.0, -0.20),
            l_elb=(-0.65, 0.0, 0.0),
            r_sh=(0.35, -0.05, 0.10),
            r_elb=(-0.45, 0.0, 0.0),
        )

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        strand_objs = [o[1] for o in (twist_upper + twist_collar)]
        gear_all = [gp for gp, _ in side_gears] + [ip for ip, _ in wf_idlers]
        worker_objs = [worker["torso"], worker["head"], worker["l_sh"], worker["l_elb"], worker["r_sh"], worker["r_elb"]]
        anim_objs = (
            [g_water_shaft, g_king_shaft, g_top_shaft, g_rail]
            + [r for pair in roller_groups for r in pair]
            + gear_all
            + flyers
            + bobbins
            + strand_objs
            + worker_objs
        )
        for fr in range(1, 61):
            p = (fr - 1) / 60.0
            apply_pose(p)
            for o in anim_objs:
                o.keyframe_insert(data_path="location", frame=fr)
                o.keyframe_insert(data_path="rotation_euler", frame=fr)
        set_linear_fcurves(anim_objs)
    else:
        apply_pose(0.25)

    setup_lighting(cam_loc=(2.35, -3.45, 2.15), target=(-0.16, -0.02, 0.96), lens=37.0, mood="workshop")

    anchors = {
        "metxa": (-0.12, 0.24, 1.68),
        "corrons": (0.12, 0.02, 1.45),
        "engranatges": (0.60, 0.02, 1.41),
        "aleta": (-0.12, -0.27, 0.88),
        "aigua": (-1.40, 0.0, 0.42),
        "bastidor": (0.54, -0.42, 1.15),
    }
    return anchors


def main():
    glb_only = "--glb-only" in sys.argv
    if not glb_only:
        anc = build_water_scene(animate=False)
        render_image(os.path.join(OUT_DIR, "water-muntada.png"), res_x=1200, res_y=760, samples=32)
        pts = project_anchors(anc)
        render_closeup(
            os.path.join(OUT_DIR, "water-detall.png"),
            cam_loc=(1.35, -1.35, 1.42),
            target=(0.10, -0.10, 1.05),
            lens=46.0,
            samples=28,
        )

    anc_glb = build_water_scene(animate=True)
    export_glb_and_meta(
        "water",
        "water.glb",
        anc_glb,
        extra_meta={"muntada_pct": pts} if not glb_only else None,
    )


if __name__ == "__main__":
    main()

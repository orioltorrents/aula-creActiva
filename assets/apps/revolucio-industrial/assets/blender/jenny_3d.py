# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Generador 3D procedural (Blender 5.3 CLI) — rigor museogràfic i PBR:
Spinning Jenny de James Hargreaves (1764–1770 · disposició del gravat de Wilson Lowry a Rees's Cyclopaedia).

Inclou:
  - Bastidor llarg rectangular de roure anglès amb carrils horitzontals d'acer de punta a punta
  - Banc de 8 fusos verticals en un extrem (-X) amb torteres de llautó, tambor d'estany inferior i fil guia
  - Rastellera inferior inclinada amb 8 bobines de metxa de cotó cardat (fibra natural sense quadrícula)
  - Carro mòbil de la pinça doble recorrent gairebé tota la llargada del bastidor sobre rodetes de llautó
  - Gran roda lateral a l'extrem del filador (+X) amb maneta tornejada i corretja llarga fins al tambor
  - 8 fils helicoïdals que s'estiren, s'aprimen i es torcen realment durant la passada
  - Filador a escala real (~1,66 m) accionant la maneta amb la mà dreta i guiant la pinça amb l'esquerra
  - Sol de postes de roure, llum de taller i escenografia interior per a Cycles

Ús:
  blender -b -P assets/blender/jenny_3d.py
  blender -b -P assets/blender/jenny_3d.py -- --glb-only
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


def _clamp(v):
    return max(0.0, min(1.0, v))


def _ease(v):
    v = _clamp(v)
    return v * v * (3.0 - 2.0 * v)


def _seg(p, a, b):
    return _ease((p - a) / (b - a))


def eval_jenny_state(p):
    """
    Cicle de 4 fases de la Spinning Jenny (disposició Lowry):
      0.00–0.12: pinça oberta prop dels fusos deixa entrar un tram nou de metxa
      0.12–0.54: pinça tancada recorre tota la llargada (+X) estirant i torçant els 8 fils
      0.54–0.66: breu descàrrega de la punta del fus + baixa el fil guia
      0.66–0.96: retorn cap als fusos bobinant el fil torçut sobre les fusades
    """
    if p < 0.12:
        car_t = 0.0
        clamp_open = 1.0 - _seg(p, 0.07, 0.12)
        faller = 0.0
        wheel_rev = 0.20 * _seg(p, 0.0, 0.12)
    elif p < 0.54:
        car_t = _seg(p, 0.12, 0.54)
        clamp_open = 0.0
        faller = 0.0
        wheel_rev = 0.20 + 3.20 * _seg(p, 0.12, 0.54)
    elif p < 0.66:
        car_t = 1.0
        clamp_open = 0.0
        faller = _seg(p, 0.56, 0.66)
        wheel_rev = 3.40 - 0.30 * _seg(p, 0.54, 0.66)
    elif p < 0.94:
        car_t = 1.0 - _seg(p, 0.66, 0.94)
        clamp_open = _seg(p, 0.88, 0.94)
        faller = 1.0 - _seg(p, 0.86, 0.94)
        wheel_rev = 3.10 + 1.40 * _seg(p, 0.66, 0.94)
    else:
        car_t = 0.0
        clamp_open = 1.0
        faller = 0.0
        wheel_rev = 4.50

    return {
        "car_t": car_t,
        "clamp_open": clamp_open,
        "faller": faller,
        "wheel_ang": 2.0 * math.pi * wheel_rev,
        "spindle_ang": 2.0 * math.pi * wheel_rev * 5.2,
    }


def build_jenny_scene(animate=False):
    clear_scene()

    pbr_wood = build_pbr_pair("JnRoure", "wood", 512, 512, bump_scale=2.0)
    pbr_wood_dark = build_pbr_pair("JnRoureFosc", "wood_dark", 512, 512, bump_scale=2.0)
    pbr_iron = build_pbr_pair("JnFerro", "castiron", 512, 512, bump_scale=1.8)
    pbr_brass = build_pbr_pair("JnLlauto", "brass", 512, 512, bump_scale=0.8)
    pbr_leather = build_pbr_pair("JnCuir", "leather", 512, 512, bump_scale=1.8)
    pbr_cotton = build_pbr_pair("JnCoto", "cotton_cloth", 512, 512, bump_scale=2.0)
    pbr_yarn = build_pbr_pair("JnFil", "twisted_yarn", 512, 512, bump_scale=2.2)

    m_wood = make_mat("Roure", "#8e5c30", roughness=0.58, pbr_pair=pbr_wood, normal_strength=0.72)
    m_wood_dark = make_mat("RoureFosc", "#543218", roughness=0.65, pbr_pair=pbr_wood_dark, normal_strength=0.72)
    m_iron = make_mat("Ferro", "#31363c", metallic=0.84, roughness=0.44, pbr_pair=pbr_iron, normal_strength=0.60)
    m_steel = make_mat("Acer", "#c0c8d0", metallic=0.94, roughness=0.18)
    m_brass = make_mat("Llauto", "#d6a53a", metallic=0.92, roughness=0.22, pbr_pair=pbr_brass, normal_strength=0.32)
    m_tin = make_mat("Estany", "#a7afb5", metallic=0.88, roughness=0.30)
    m_leather = make_mat("Cuir", "#58341c", roughness=0.70, pbr_pair=pbr_leather, normal_strength=0.75)
    m_cotton = make_mat("CotoCru", "#efe7d2", roughness=0.90, pbr_pair=pbr_cotton, tex_scale=(1.4, 1.4), normal_strength=0.65)
    m_yarn = make_mat("FilTorcut", "#e7d8b5", roughness=0.76, pbr_pair=pbr_yarn, tex_scale=(1.0, 2.4), normal_strength=0.85)
    m_cop = make_mat("FusadaFil", "#eadcc0", roughness=0.82, pbr_pair=pbr_cotton, tex_scale=(1.6, 1.6), normal_strength=0.55)
    m_cord = make_mat("CordoCanem", "#9c8256", roughness=0.85)

    add_shadow_floor(z=0.0, size=14.0)
    make_workshop_floor("cottage_wood", size=(3.65, 2.35, 0.12), center=(0.15, -0.08), with_room_backdrop=True)

    # --- 1. BASTIDOR LLARG HORITZONTAL TIPUS LOWRY (X = -0.96 .. +0.88, Y = -0.46 .. +0.46) ---
    g_frame = add_empty("Bastidor")
    for sx in (-0.96, 0.88):
        for sy in (-0.46, 0.46):
            make_box(f"Pota_{sx}_{sy}", (0.075, 0.075, 0.74), (sx, sy, 0.49), m_wood_dark, parent=g_frame, bevel=0.007)
            make_box(f"Sabata_{sx}_{sy}", (0.105, 0.105, 0.032), (sx, sy, 0.136), m_iron, parent=g_frame, bevel=0.004)
        make_box(f"TravTransInf_{sx}", (0.062, 0.85, 0.068), (sx, 0.0, 0.24), m_wood, parent=g_frame)
        make_box(f"TravTransSup_{sx}", (0.066, 0.85, 0.070), (sx, 0.0, 0.82), m_wood_dark, parent=g_frame)

    for sy in (-0.46, 0.46):
        make_box(f"TravLongInf_{sy}", (1.77, 0.062, 0.068), (-0.04, sy, 0.24), m_wood, parent=g_frame)
        # Carrils llargs horitzontals d'extrem a extrem per on corre la pinça
        make_box(f"CarrilSup_{sy}", (1.90, 0.068, 0.068), (-0.04, sy, 0.86), m_wood, parent=g_frame, bevel=0.005)
        make_box(f"GuiaAcer_{sy}", (1.84, 0.018, 0.014), (-0.04, sy, 0.898), m_steel, parent=g_frame, bevel=0.002)
        make_rod_between(f"TirantDiag_{sy}", (-0.93, sy, 0.26), (-0.45, sy, 0.84), 0.020, m_wood_dark, verts=8, parent=g_frame)
        make_rod_between(f"TirantDiagD_{sy}", (0.85, sy, 0.26), (0.40, sy, 0.84), 0.020, m_wood_dark, verts=8, parent=g_frame)

    # --- 2. BANC DE 8 FUSOS A L'EXTREM ESQUERRE (-X = -0.84) + TAMBOR + FIL GUIA ---
    n_sp = 8
    ys_sp = [-0.35 + i * (0.70 / (n_sp - 1)) for i in range(n_sp)]
    g_spindles_bank = add_empty("BancFusos", (0.0, 0.0, 0.0))

    # Muntants verticals al capçal esquerre que subjecten el pont dels 8 fusos
    for sy in (-0.46, 0.46):
        make_box(f"MuntantFus_{sy}", (0.068, 0.068, 0.42), (-0.86, sy, 0.96), m_wood_dark, parent=g_spindles_bank, bevel=0.005)
    make_box("PontFusosBaix", (0.072, 0.94, 0.045), (-0.86, 0.0, 0.64), m_wood_dark, parent=g_spindles_bank, bevel=0.004)
    make_box("PontFusosMig", (0.062, 0.94, 0.040), (-0.83, 0.0, 0.86), m_wood, parent=g_spindles_bank, bevel=0.004)

    # Tambor d'estany horitzontal transversal sota els fusos (X = -0.68, Z = 0.46)
    g_drum = add_empty("TamboCordes", (-0.68, 0.0, 0.46), parent=g_spindles_bank)
    make_cyl("TamborEstany", 0.068, 0.82, (0.0, 0.0, 0.0), m_tin, rot=(math.pi / 2, 0.0, 0.0), verts=26, parent=g_drum)
    make_cyl("EixTambor", 0.015, 1.12, (0.0, -0.06, 0.0), m_steel, rot=(math.pi / 2, 0.0, 0.0), verts=14, parent=g_drum)
    make_cyl("PolitjaTambor", 0.058, 0.030, (0.0, -0.58, 0.0), m_brass, rot=(math.pi / 2, 0.0, 0.0), verts=22, parent=g_drum)
    for sy in (-0.44, 0.44):
        make_box(f"SuportTambor_{sy}", (0.068, 0.042, 0.28), (-0.68, sy, 0.36), m_iron, parent=g_spindles_bank, bevel=0.004)

    spindle_rotors = []
    spindle_cops = []
    tilt_sp = 0.14  # inclinats lleugerament cap al filador (+X)
    sp_x0, sp_z0 = -0.86, 0.66
    for i, y in enumerate(ys_sp):
        sp_base = add_empty(f"FusBase_{i}", (sp_x0, y, sp_z0), parent=g_spindles_bank)
        sp_base.rotation_euler = (0.0, tilt_sp, 0.0)
        make_cyl(f"CoixinetFus_{i}", 0.013, 0.022, (0.0, 0.0, 0.0), m_brass, verts=12, parent=sp_base)
        sp_rot = add_empty(f"FusRot_{i}", (0.0, 0.0, 0.0), parent=sp_base)
        make_cyl(f"TijaFus_{i}", 0.006, 0.50, (0.0, 0.0, 0.25), m_steel, verts=10, parent=sp_rot, bevel=0.0)
        make_cyl(f"TorteraFus_{i}", 0.022, 0.016, (0.0, 0.0, 0.08), m_brass, verts=16, parent=sp_rot)
        cop = make_cone(f"Fusada_{i}", 0.024, 0.007, 0.15, (0.0, 0.0, 0.30), m_cop, verts=16, parent=sp_rot)
        spindle_rotors.append(sp_rot)
        spindle_cops.append(cop)
        make_rod_between(f"CordoFusSup_{i}", (-0.68, y, 0.52), (-0.85, y, 0.74), 0.003, m_cord, verts=6, parent=g_spindles_bank)
        make_rod_between(f"CordoFusInf_{i}", (-0.68, y, 0.40), (-0.85, y, 0.73), 0.003, m_cord, verts=6, parent=g_spindles_bank)

    # Fil guia basculant (faller wire) just davant dels fusos
    g_faller = add_empty("FilGuiaPivot", (-0.72, 0.0, 0.90), parent=g_spindles_bank)
    for sy in (-0.42, 0.42):
        make_box(f"BracGuia_{sy}", (0.14, 0.018, 0.020), (0.06, sy, 0.0), m_iron, parent=g_faller, bevel=0.002)
    make_cyl("BarraFilGuia", 0.0045, 0.86, (0.12, 0.0, 0.0), m_brass, rot=(math.pi / 2, 0.0, 0.0), verts=10, parent=g_faller, bevel=0.0)

    # --- 3. RASTELLERA DE 8 BOBINES DE METXA SOTA L'EXTREM DELS FUSOS ---
    g_metxes = add_empty("RampaMetxes", (0.0, 0.0, 0.0), parent=g_frame)
    for sy in (-0.42, 0.42):
        make_rod_between(f"SuportRampa_{sy}", (-0.66, sy, 0.24), (-0.28, sy, 0.50), 0.020, m_wood_dark, verts=8, parent=g_metxes)
    make_cyl("EixMetxesBaix", 0.011, 0.86, (-0.46, 0.0, 0.36), m_iron, rot=(math.pi / 2, 0.0, 0.0), verts=14, parent=g_metxes)
    make_cyl("GuiaFilferroMetxes", 0.008, 0.86, (-0.56, 0.0, 0.72), m_brass, rot=(math.pi / 2, 0.0, 0.0), verts=12, parent=g_metxes)

    roving_tips = []
    for i, y in enumerate(ys_sp):
        make_cyl(f"NucliMetxa_{i}", 0.012, 0.088, (-0.46, y, 0.36), m_wood, rot=(math.pi / 2, 0.0, 0.0), verts=12, parent=g_metxes)
        make_cyl(f"BobinaMetxa_{i}", 0.038, 0.072, (-0.46, y, 0.36), m_cotton, rot=(math.pi / 2, 0.0, 0.0), verts=18, parent=g_metxes)
        for side_d in (-0.038, 0.038):
            make_cyl(f"ValonaMetxa_{i}_{side_d}", 0.042, 0.008, (-0.46, y + side_d, 0.36), m_wood_dark, rot=(math.pi / 2, 0.0, 0.0), verts=16, parent=g_metxes)
        make_sphere(f"UllGuiaMetxa_{i}", 0.010, (-0.56, y, 0.72), m_brass, parent=g_metxes)
        roving_tips.append((-0.56, y, 0.725))

    # --- 4. CARRO MÒBIL DE LA PINÇA DOBLE RECORRENT TOTA LA LLARGADA ---
    g_carriage = add_empty("PincaMobil", (0.0, 0.0, 0.905))
    make_box("PincaBase", (0.084, 1.00, 0.038), (0.0, 0.0, 0.020), m_wood, parent=g_carriage, bevel=0.004)
    for sy in (-0.46, 0.46):
        for wx in (-0.032, 0.032):
            make_cyl(f"RodetaPinca_{sy}_{wx}", 0.019, 0.018, (wx, sy, 0.0), m_brass, rot=(math.pi / 2, 0.0, 0.0), verts=16, parent=g_carriage)
        make_box(f"MuntantPinca_{sy}", (0.078, 0.032, 0.085), (0.0, sy, 0.068), m_iron, parent=g_carriage, bevel=0.003)

    g_jaw = add_empty("PincaMordassa", (-0.030, 0.0, 0.046), parent=g_carriage)
    make_box("MordassaBarra", (0.060, 0.94, 0.032), (0.030, 0.0, 0.016), m_wood_dark, parent=g_jaw, bevel=0.004)
    make_box("ManecPinca", (0.042, 0.22, 0.034), (0.072, 0.0, 0.024), m_wood, parent=g_jaw, bevel=0.006)
    make_cyl("PalancaMordassa", 0.008, 0.13, (0.035, -0.26, 0.048), m_brass, rot=(0.0, -0.50, 0.0), verts=10, parent=g_jaw)

    # --- 5. GRAN RODA MOTRIU LATERAL A L'EXTREM DEL FILADOR (+X) AMB CORRETGES ---
    g_wheel_grp = add_empty("TransmissioRoda")
    make_box("PeuRodaExt", (0.48, 0.18, 0.075), (0.46, -0.58, 0.155), m_wood_dark, parent=g_wheel_grp, bevel=0.005)
    make_rod_between("MuntantRodaA", (0.28, -0.58, 0.18), (0.46, -0.58, 0.78), 0.042, m_wood, verts=8, parent=g_wheel_grp)
    make_rod_between("MuntantRodaB", (0.64, -0.58, 0.18), (0.46, -0.58, 0.78), 0.042, m_wood, verts=8, parent=g_wheel_grp)
    make_box("CoixinetRoda", (0.085, 0.075, 0.070), (0.46, -0.58, 0.78), m_iron, parent=g_wheel_grp, bevel=0.004)

    # Eix Y cap al lateral frontal del filador
    g_wheel = make_spoked_wheel("GranRoda", 0.34, 0.038, 8, (0.46, -0.58, 0.78), m_wood, mat_hub=m_brass, axis="Y", parent=g_wheel_grp)
    make_cyl("BracManeta", 0.011, 0.14, (0.0, -0.075, 0.14), m_iron, rot=(math.pi / 2, 0.0, 0.0), verts=10, parent=g_wheel)
    make_cyl("EmpunyaduraManeta", 0.017, 0.11, (0.0, -0.145, 0.14), m_wood_dark, rot=(math.pi / 2, 0.0, 0.0), verts=14, parent=g_wheel)

    # Corretja sense fi llarga des de la Gran Roda (+X=0.46) fins a la politja del tambor (-X=-0.68)
    make_rod_between("CorretjaRodaSup", (0.46, -0.58, 1.11), (-0.68, -0.58, 0.515), 0.009, m_leather, verts=8, parent=g_wheel_grp)
    make_rod_between("CorretjaRodaInf", (0.46, -0.58, 0.45), (-0.68, -0.58, 0.405), 0.009, m_leather, verts=8, parent=g_wheel_grp)

    # --- 6. 8 FILS CONTINUS AMB ESTIRAMENT, APRIMAMENT I TORSIÓ REAL ---
    g_strands = add_empty("Fils")
    strands_back = []
    strands_front = []
    for i in range(n_sp):
        strands_back.append(make_twisted_strand(f"FilDarrere_{i}", m_cotton, radius=0.0042, verts=8, parent=g_strands))
        strands_front.append(make_twisted_strand(f"FilDavant_{i}", m_yarn, radius=0.0028, verts=10, parent=g_strands))

    sp_tip_x = sp_x0 + 0.49 * math.sin(tilt_sp)
    sp_tip_z = sp_z0 + 0.49 * math.cos(tilt_sp)
    sp_cop_x = sp_x0 + 0.31 * math.sin(tilt_sp)
    sp_cop_z = sp_z0 + 0.31 * math.cos(tilt_sp)

    # --- 7. FILADOR A ESCALA REAL AL CAPDAVANT DRET (+X) ---
    worker = make_worker("FiladorJenny", (0.98, -0.32, 0.12), facing_yaw=math.pi * 0.42, scale=1.0, role="spinner")

    def apply_pose(p):
        st = eval_jenny_state(p)
        car_t = st["car_t"]
        # La pinça recorre pràcticament tota la llargada del bastidor: X = -0.54 .. +0.76
        cx = -0.54 + (0.76 - (-0.54)) * car_t
        cz = 0.905
        g_carriage.location = (cx, 0.0, cz)
        g_jaw.rotation_euler = (0.0, -0.32 * st["clamp_open"], 0.0)

        w_ang = st["wheel_ang"]
        g_wheel.rotation_euler = (0.0, w_ang, 0.0)
        g_drum.rotation_euler = (0.0, st["spindle_ang"] * 0.45, 0.0)
        for sp_rot in spindle_rotors:
            sp_rot.rotation_euler = (0.0, 0.0, st["spindle_ang"])

        g_faller.rotation_euler = (0.0, 0.62 * st["faller"], 0.0)

        # Fils: s'allarguen de 0.22 m a 1.52 m, s'aprimen (1.42 -> 0.72) i giren helicoïdalment
        fx_end = sp_tip_x * (1.0 - st["faller"]) + sp_cop_x * st["faller"]
        fz_end = sp_tip_z * (1.0 - st["faller"]) + sp_cop_z * st["faller"]
        clamp_z = cz + 0.044
        r_thin = 1.42 - 0.70 * car_t
        twist_z = st["spindle_ang"] * 0.55
        for i, y in enumerate(ys_sp):
            p_clamp = (cx, y, clamp_z)
            aim_and_twist_strand(strands_back[i], roving_tips[i], p_clamp, radius_scale=1.18, twist_angle=0.0)
            aim_and_twist_strand(strands_front[i], p_clamp, (fx_end, y, fz_end), radius_scale=r_thin, twist_angle=twist_z)

        # Moviment del filador: mà dreta gira la maneta de la roda; mà esquerra estira la pinça
        lean = 0.16 * (1.0 - car_t)
        set_worker_pose(
            worker,
            torso_rot=(lean, 0.0, 0.0),
            head_rot=(-0.12, 0.0, 0.22),
            l_sh=(0.95 + 0.32 * (1.0 - car_t), 0.12, -0.18),
            l_elb=(-0.55 - 0.42 * car_t, 0.0, 0.0),
            r_sh=(0.90 + 0.24 * math.sin(w_ang), -0.18, 0.12 + 0.16 * math.cos(w_ang)),
            r_elb=(-0.62 + 0.22 * math.cos(w_ang), 0.0, 0.0),
        )

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        strand_objs = [o for pair in (strands_back + strands_front) for o in pair]
        worker_objs = [worker["torso"], worker["head"], worker["l_sh"], worker["l_elb"], worker["r_sh"], worker["r_elb"]]
        anim_objs = [g_carriage, g_jaw, g_wheel, g_drum, g_faller] + spindle_rotors + strand_objs + worker_objs
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
        apply_pose(0.42)

    setup_lighting(cam_loc=(2.35, -3.45, 2.08), target=(0.08, -0.08, 0.85), lens=38.0, mood="workshop")

    anchors = {
        "metxes": (-0.46, 0.0, 0.40),
        "pinca": (0.10, 0.0, 0.96),
        "fusos": (-0.82, 0.0, 1.05),
        "roda": (0.46, -0.58, 0.82),
        "corda": (-0.12, -0.58, 0.68),
        "bastidor": (-0.05, -0.46, 0.86),
    }
    return anchors


def main():
    glb_only = "--glb-only" in sys.argv
    if not glb_only:
        anc = build_jenny_scene(animate=False)
        render_image(os.path.join(OUT_DIR, "jenny-muntada.png"), res_x=1200, res_y=760, samples=32)
        pts = project_anchors(anc)
        render_closeup(
            os.path.join(OUT_DIR, "jenny-detall.png"),
            cam_loc=(0.55, -1.75, 1.38),
            target=(-0.38, 0.0, 0.90),
            lens=44.0,
            samples=28,
        )

    anc_glb = build_jenny_scene(animate=True)
    export_glb_and_meta(
        "jenny",
        "jenny.glb",
        anc_glb,
        extra_meta={"muntada_pct": pts} if not glb_only else None,
    )


if __name__ == "__main__":
    main()

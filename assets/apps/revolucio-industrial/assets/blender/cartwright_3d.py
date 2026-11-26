# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Generador 3D procedural (Blender 5.3 CLI) — rigor museogràfic i PBR:
Teler mecànic horitzontal d'Edmund Cartwright (millores de 1787–1790, gravat de Strickland).

Inclou:
  - Bastidor de roure anglès amb ensamblatges rebaixats, tirants de ferro colat i cargols de llautó
  - Transmissió motriu superior amb mènsula de ferro, doble politja (fixa i boja) + forquilla
    d'embragatge, corretja plana de cuir i gran volant de ferro colat de 6 raigs lliure sobre sòcol
  - Eix principal amb doble manovella forjada i bieles amb ull i brida de llautó fins al batà
  - Reductor 2:1 engranat (pinyó de llautó + roda de ferro) cap a l'eix de lleves amb coixinets bipartits
  - Lleves de calada que accionen palanques inferiors amb corró cap als dos lliços penjats en corretges
  - Mecanisme d'impuls lateral: lleves laterals, cordons, polines sota pista, espases i tacs de cuir
    sobre varetes guia d'acer dins les caixes de llançadora, amb molls espirals de retorn
  - 34 fils d'ordit fins, pinta metàl·lica de 44 pues, corró de pit polit, teixit enrotllat sense Z-fighting,
    regulador de tensió amb contrapès penjant i trempador frontal

Ús:
  blender -b -P assets/blender/cartwright_3d.py
  blender -b -P assets/blender/cartwright_3d.py -- --glb-only
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
    build_pbr_pair,
    clear_scene,
    export_glb_and_meta,
    make_box,
    make_cam,
    make_cyl,
    make_gear,
    make_mat,
    make_rod_between,
    make_shuttle,
    make_sphere,
    make_spoked_wheel,
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


def _make_pillow_block(name, loc, axis_x, mat_iron, mat_brass, parent=None, cap_h=0.055):
    """Coixinet bipartit de ferro colat amb base rebaixada, gorra, 2 perns i greixador."""
    pb = add_empty(name, loc, parent=parent)
    if axis_x:
        make_box(f"{name}_Base", (0.092, 0.145, 0.036), (0.0, 0.0, -0.024), mat_iron, parent=pb, bevel=0.004)
        make_box(f"{name}_Cos", (0.082, 0.088, cap_h), (0.0, 0.0, 0.0), mat_iron, parent=pb, bevel=0.005)
        make_cyl(f"{name}_Brida", 0.034, 0.096, (0.0, 0.0, 0.0), mat_brass, rot=(0, math.pi / 2, 0), verts=18, parent=pb)
        for sy in (-0.052, 0.052):
            make_cyl(f"{name}_Pern_{sy}", 0.007, 0.048, (0.0, sy, 0.004), mat_brass, verts=10, parent=pb, bevel=0.0)
        make_cyl(f"{name}_Greixador", 0.009, 0.028, (0.0, 0.0, cap_h * 0.5 + 0.014), mat_brass, verts=10, parent=pb, bevel=0.0)
    return pb


def _make_helix_spring(name, p0, p1, radius, turns, wire_r, mat, parent=None):
    """Moll helicoïdal real entre dos punts (per retorn dels impulsors)."""
    dx, dy, dz = p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]
    dist = math.sqrt(dx * dx + dy * dy + dz * dz) or 0.01
    steps = turns * 12
    pts = []
    # Base ortonormal al voltant de (dx, dy, dz)
    ux, uy, uz = dx / dist, dy / dist, dz / dist
    if abs(uz) < 0.9:
        rx, ry, rz = -uy, ux, 0.0
    else:
        rx, ry, rz = 1.0, 0.0, 0.0
    rlen = math.sqrt(rx * rx + ry * ry + rz * rz)
    rx, ry, rz = rx / rlen, ry / rlen, rz / rlen
    vx = uy * rz - uz * ry
    vy = uz * rx - ux * rz
    vz = ux * ry - uy * rx

    for i in range(steps + 1):
        t = i / steps
        ang = 2.0 * math.pi * turns * t
        c, s = math.cos(ang), math.sin(ang)
        px = p0[0] + dx * t + radius * (c * rx + s * vx)
        py = p0[1] + dy * t + radius * (c * ry + s * vy)
        pz = p0[2] + dz * t + radius * (c * rz + s * vz)
        pts.append((px, py, pz))

    curve = bpy.data.curves.new(name + "_Cur", type="CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = wire_r
    curve.bevel_resolution = 3
    sp = curve.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for i, co in enumerate(pts):
        sp.points[i].co = (co[0], co[1], co[2], 1.0)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    if parent is not None:
        obj.parent = parent
    return obj


def eval_cartwright_state(p):
    """Cicle sincronitzat: 1 volta de l'eix de lleves = 2 voltes de l'eix principal / manovella (2:1)."""
    half = 0 if p < 0.5 else 1
    q = p * 2.0 - half
    sign = 1.0 if half == 0 else -1.0

    shed = _mix(-sign, sign, _seg(q, 0.00, 0.22))
    shuttle_x = _mix(-1.12 * sign, 1.12 * sign, _seg(q, 0.28, 0.56))
    beat = _seg(q, 0.62, 0.78) * (1.0 - _seg(q, 0.78, 0.96))

    kick_l = _seg(q, 0.23, 0.29) * (1.0 - _seg(q, 0.29, 0.40)) if half == 0 else 0.0
    kick_r = _seg(q, 0.23, 0.29) * (1.0 - _seg(q, 0.29, 0.40)) if half == 1 else 0.0

    ang_main = 4.0 * math.pi * p
    ang_cam = 2.0 * math.pi * p
    return {
        "shed": shed,
        "shuttle_x": shuttle_x,
        "beat": beat,
        "kick_l": kick_l,
        "kick_r": kick_r,
        "ang_main": ang_main,
        "ang_cam": ang_cam,
    }


def build_cartwright_scene(animate=False):
    clear_scene()

    pbr_wood = build_pbr_pair("CwRoure", "wood", 512, 512, bump_scale=2.2)
    pbr_wood_dark = build_pbr_pair("CwRoureFosc", "wood_dark", 512, 512, bump_scale=2.0)
    pbr_iron = build_pbr_pair("CwFerro", "castiron", 512, 512, bump_scale=2.0)
    pbr_brass = build_pbr_pair("CwLlauto", "brass", 512, 512, bump_scale=0.9)
    pbr_leather = build_pbr_pair("CwCuir", "leather", 512, 512, bump_scale=2.0)
    pbr_cotton = build_pbr_pair("CwCotoCru", "cotton_cloth", 512, 512, bump_scale=2.2)
    pbr_cloth = build_pbr_pair("CwTelaTeixida", "woven_cloth", 512, 512, bump_scale=2.2)

    m_wood = make_mat("Roure", "#8a572c", roughness=0.56, pbr_pair=pbr_wood, tex_scale=(1.0, 1.0), normal_strength=0.75)
    m_wood_dark = make_mat("RoureFosc", "#523117", roughness=0.64, pbr_pair=pbr_wood_dark, tex_scale=(1.1, 1.1), normal_strength=0.75)
    m_iron = make_mat("Ferro", "#2e3339", metallic=0.86, roughness=0.42, pbr_pair=pbr_iron, normal_strength=0.65)
    m_steel = make_mat("Acer", "#bcc4cc", metallic=0.93, roughness=0.20)
    m_brass = make_mat("Llauto", "#d6a63b", metallic=0.92, roughness=0.22, pbr_pair=pbr_brass, normal_strength=0.35)
    m_leather = make_mat("Cuir", "#58341c", roughness=0.68, pbr_pair=pbr_leather, normal_strength=0.80)
    m_cotton = make_mat("CotoOrdit", "#e9dfc4", roughness=0.88, pbr_pair=pbr_cotton, tex_scale=(1.8, 1.8), normal_strength=0.65)
    m_cloth = make_mat("TelaCoto", "#ebe1c7", roughness=0.84, pbr_pair=pbr_cloth, tex_scale=(1.8, 1.8), normal_strength=0.60)
    m_warp = make_mat("OrditCru", "#e2d4b4", roughness=0.80)
    m_weft = make_mat("TramaVermella", "#b83a24", roughness=0.72)

    add_shadow_floor(z=0.0, size=14.0)

    # Sòcol de lloses de fàbrica del Lancashire i escenografia interior
    make_workshop_floor("mill_stone", size=(3.90, 2.95, 0.14), center=(0.15, -0.15), with_room_backdrop=True)

    # --- 1. BASTIDOR DE ROURE ANGLÈS AMB FERRETES I COIXINETS ---
    g_frame = add_empty("Bastidor")
    z_main = 0.60
    z_cam = 0.536  # distància exacta als centres: hypot(0.244, 0.064) = 0.252 m -> Pinyo(0.085)+Roda(0.168) engranen!
    y_main = -0.34
    y_cam = -0.096

    for sx in (-1.04, 1.04):
        make_box(f"PilarDarrere_{sx}", (0.11, 0.11, 1.72), (sx, 0.80, 1.00), m_wood_dark, parent=g_frame, bevel=0.009)
        make_box(f"PilarMig_{sx}", (0.10, 0.10, 1.72), (sx, -0.18, 1.00), m_wood_dark, parent=g_frame, bevel=0.009)
        make_box(f"PilarDavant_{sx}", (0.11, 0.11, 0.80), (sx, -0.80, 0.54), m_wood_dark, parent=g_frame, bevel=0.009)
        for py in (-0.80, -0.18, 0.80):
            make_box(f"Sabata_{sx}_{py}", (0.155, 0.155, 0.042), (sx, py, 0.161), m_iron, parent=g_frame, bevel=0.004)
        # Travessers inferiors i mitjans (desplaçats 4 mm en X per evitar cares coplanars)
        make_box(f"TravLatBaixDarr_{sx}", (0.082, 0.88, 0.085), (sx, 0.31, 0.25), m_wood, parent=g_frame)
        make_box(f"TravLatBaixDav_{sx}", (0.082, 0.52, 0.085), (sx, -0.49, 0.25), m_wood, parent=g_frame)
        make_box(f"TravLatMig_{sx}", (0.076, 1.50, 0.078), (sx, 0.0, 0.88), m_wood, parent=g_frame)
        make_box(f"TravLatSup_{sx}", (0.082, 0.88, 0.088), (sx, 0.31, 1.82), m_wood, parent=g_frame)
        # Escaires de ferro colat i reblons de llautó als nusos
        make_box(f"Escaire_{sx}", (0.088, 0.18, 0.16), (sx, -0.70, 0.80), m_iron, parent=g_frame, bevel=0.003)
        for rz in (0.76, 0.86):
            make_cyl(f"CargolEsc_{sx}_{rz}", 0.009, 0.125, (sx, -0.78, rz), m_brass, rot=(0, math.pi / 2, 0), verts=8, parent=g_frame, bevel=0.0)
        # Suports verticals sota els coixinets bipartits (des de TravLatBaix fins a Z_eix)
        make_box(f"PedestalPrinc_{sx}", (0.090, 0.140, 0.28), (sx, y_main, 0.43), m_iron, parent=g_frame, bevel=0.004)
        _make_pillow_block(f"CoixinetPrinc_{sx}", (sx, y_main, z_main), True, m_iron, m_brass, parent=g_frame)
        make_box(f"PedestalLleves_{sx}", (0.088, 0.135, 0.21), (sx, y_cam, 0.395), m_iron, parent=g_frame, bevel=0.004)
        _make_pillow_block(f"CoixinetLleves_{sx}", (sx, y_cam, z_cam), True, m_iron, m_brass, parent=g_frame)

    make_box("BigaDarrereBaix", (1.97, 0.082, 0.085), (0.0, 0.80, 0.25), m_wood, parent=g_frame)
    make_box("BigaDarrereSup", (1.97, 0.088, 0.088), (0.0, 0.80, 1.82), m_wood, parent=g_frame)
    make_box("BigaLlicos", (1.97, 0.082, 0.082), (0.0, 0.32, 1.82), m_wood_dark, parent=g_frame)
    make_box("BigaPivotBata", (1.97, 0.085, 0.088), (0.0, -0.18, 1.82), m_wood_dark, parent=g_frame)
    make_box("BigaPitDavant", (1.97, 0.088, 0.082), (0.0, -0.80, 0.88), m_wood, parent=g_frame)
    make_box("BigaOrditDarrere", (1.97, 0.082, 0.076), (0.0, 0.80, 0.88), m_wood, parent=g_frame)

    # --- 2. TRANSMISSIÓ MOTRIU SUPERIOR, DOBLE POLITJA, FORQUILLA I VOLANT LLIURE ---
    g_trans = add_empty("Transmissio")
    # Bancada lateral per al coixinet exterior del volant (sense col·lisió amb la llanda!)
    make_box("PeuVolant", (0.56, 0.44, 0.08), (1.32, y_main, 0.18), m_wood_dark, parent=g_trans, bevel=0.006)
    make_box("ColumnaVolant", (0.10, 0.15, 0.35), (1.53, y_main, 0.395), m_iron, parent=g_trans, bevel=0.005)
    _make_pillow_block("CoixinetExtern", (1.53, y_main, z_main), True, m_iron, m_brass, parent=g_trans)

    # Mènsula superior de ferro colat muntada sobre el bastidor dret (dins l'enquadrament)
    make_box("MensulaHoritz", (0.40, 0.11, 0.068), (1.18, -0.22, 1.82), m_iron, parent=g_trans, bevel=0.005)
    make_rod_between("MensulaBrac", (1.04, -0.22, 1.50), (1.35, -0.22, 1.81), 0.032, m_iron, verts=8, parent=g_trans)
    _make_pillow_block("CoixinetEmbarrat", (1.33, -0.24, 1.86), True, m_iron, m_brass, parent=g_trans, cap_h=0.045)
    make_cyl("EixEmbarrat", 0.024, 0.40, (1.28, -0.24, 1.86), m_steel, rot=(0, math.pi / 2, 0), parent=g_trans)
    g_top_pulley = make_cyl("PolitjaFabrica", 0.130, 0.092, (1.24, -0.24, 1.86), m_wood, rot=(0, math.pi / 2, 0), verts=32, parent=g_trans)

    # Doble politja inferior (fixa + boja) sobre l'eix principal + palanca d'embragatge
    g_loom_pulley = add_empty("PolitjaTelerGrup", (1.24, y_main, z_main), parent=g_trans)
    make_cyl("PolitjaFixa", 0.115, 0.056, (-0.030, 0.0, 0.0), m_brass, rot=(0, math.pi / 2, 0), verts=28, parent=g_loom_pulley)
    make_cyl("PolitjaBoja", 0.112, 0.052, (0.032, 0.0, 0.0), m_iron, rot=(0, math.pi / 2, 0), verts=28, parent=g_loom_pulley)
    make_box("ForquillaGuia", (0.025, 0.10, 0.24), (1.20, -0.44, 0.72), m_iron, parent=g_trans, bevel=0.003)
    make_rod_between("PalancaEmbrag", (1.20, -0.44, 0.76), (1.14, -0.78, 1.00), 0.013, m_steel, verts=10, parent=g_trans)
    make_sphere("PomEmbrag", 0.026, (1.14, -0.78, 1.00), m_brass, parent=g_trans)

    # Corretja plana de cuir entre politja de fàbrica i politja fixa del teler
    make_rod_between("CorretjaDavant", (1.21, -0.37, 1.85), (1.21, -0.455, z_main), 0.015, m_leather, verts=10, parent=g_trans)
    make_rod_between("CorretjaDarrere", (1.21, -0.11, 1.85), (1.21, -0.225, z_main), 0.015, m_leather, verts=10, parent=g_trans)

    # Gran volant d'inèrcia de ferro colat amb 6 raigs (Z_inf = 0.60 - 0.35 = 0.25 > 0.22 PeuVolant!)
    g_flywheel = make_spoked_wheel("VolantInercia", 0.35, 0.048, 6, (1.40, y_main, z_main), m_iron, mat_hub=m_brass, axis="X", parent=g_trans)

    # --- 3. EIX PRINCIPAL AMB MANOVELLES FORJADES + REDUCTOR 2:1 + EIX DE LLEVES ---
    g_eix = add_empty("EixILleves")
    g_main_shaft = add_empty("EixPrincipal", (0.0, y_main, z_main), parent=g_eix)
    make_cyl("BarraEixPrinc", 0.026, 2.74, (0.24, 0.0, 0.0), m_steel, rot=(0, math.pi / 2, 0), verts=22, parent=g_main_shaft)
    make_gear("Pinyo2a1", 0.085, 0.042, 14, (1.13, 0.0, 0.0), m_brass, mat_hub=m_iron, axis="X", parent=g_main_shaft)
    for sx in (-0.88, 0.88):
        make_box(f"BracManovella_{sx}", (0.040, 0.050, 0.145), (sx, 0.0, -0.055), m_iron, parent=g_main_shaft, bevel=0.005)
        make_cyl(f"PernManovella_{sx}", 0.019, 0.072, (sx, 0.0, -0.11), m_brass, rot=(0, math.pi / 2, 0), verts=14, parent=g_main_shaft)

    # Eix de lleves engranat 2:1 sota l'ordit (desfasat mig dent perquè engranin netament)
    g_cam_shaft = add_empty("EixLleves", (0.0, y_cam, z_cam), parent=g_eix)
    make_cyl("BarraEixLleves", 0.024, 2.38, (0.04, 0.0, 0.0), m_steel, rot=(0, math.pi / 2, 0), verts=20, parent=g_cam_shaft)
    g_roda_phase = add_empty("Roda2a1_Phase", (1.13, 0.0, 0.0), parent=g_cam_shaft)
    g_roda_phase.rotation_euler = (math.pi / 28.0, 0.0, 0.0)
    make_gear("Roda2a1", 0.168, 0.042, 28, (0.0, 0.0, 0.0), m_iron, mat_hub=m_brass, axis="X", parent=g_roda_phase)
    # Lleves en cor per als trepitjadors dels lliços
    make_cam("LlevaLlic1", 0.058, 0.064, 0.044, (-0.18, 0.0, 0.0), m_brass, axis="X", rot_phase=0.0, parent=g_cam_shaft)
    make_cam("LlevaLlic2", 0.058, 0.064, 0.044, (0.18, 0.0, 0.0), m_brass, axis="X", rot_phase=math.pi, parent=g_cam_shaft)
    # Lleves impulsores laterals (wiper cams de Strickland)
    make_cam("LlevaImpulsEsq", 0.054, 0.072, 0.036, (-1.12, 0.0, 0.0), m_iron, axis="X", rot_phase=0.6, parent=g_cam_shaft)
    make_cam("LlevaImpulsDret", 0.054, 0.072, 0.036, (1.02, 0.0, 0.0), m_iron, axis="X", rot_phase=0.6 + math.pi, parent=g_cam_shaft)

    # --- 4. PLEGADOR D'ORDIT AMB CONTRAPÈS DE TENSIÓ I 34 FILS D'ORDIT FINS ---
    g_ordit = add_empty("Ordit")
    make_cyl("PlegadorOrditNucli", 0.045, 2.14, (0.0, 0.72, 0.66), m_wood_dark, rot=(0, math.pi / 2, 0), parent=g_ordit)
    make_cyl("PlegadorOrditCoto", 0.125, 1.54, (0.0, 0.72, 0.66), m_cotton, rot=(0, math.pi / 2, 0), parent=g_ordit)
    make_gear("TrinquetOrdit", 0.125, 0.024, 20, (-0.92, 0.72, 0.66), m_iron, mat_hub=m_brass, axis="X", parent=g_ordit)
    # Palanca i contrapès regulador de tensió de l'ordit (dins el bastidor dret/posterior)
    make_cyl("BridaTensio", 0.130, 0.022, (0.86, 0.72, 0.66), m_leather, rot=(0, math.pi / 2, 0), parent=g_ordit)
    make_rod_between("PalancaTensio", (0.86, 0.72, 0.54), (0.86, 0.25, 0.34), 0.014, m_iron, verts=8, parent=g_ordit)
    make_cyl("ContrapesOrdit", 0.068, 0.12, (0.86, 0.30, 0.27), m_iron, verts=16, parent=g_ordit)
    make_cyl("RodetPosterior", 0.042, 1.78, (0.0, 0.76, 0.935), m_wood, rot=(0, math.pi / 2, 0), parent=g_ordit)

    n_pairs = 17
    def build_warp_group(name, y_pivot, z_pivot, y_end, x_offset):
        grp = add_empty(name, (0.0, y_pivot, z_pivot), parent=g_ordit)
        dy = y_end - y_pivot
        for i in range(n_pairs):
            x = -0.74 + i * (1.48 / (n_pairs - 1)) + x_offset
            make_rod_between(f"{name}_Fil_{i}", (x, 0.0, 0.0), (x, dy, 0.0), 0.0028, m_warp, verts=6, parent=grp)
        return grp

    g_ord_par_darr = build_warp_group("OrditParellDarr", 0.76, 0.945, 0.32, -0.021)
    g_ord_par_dav = build_warp_group("OrditParellDav", -0.44, 0.945, 0.32, -0.021)
    g_ord_imp_darr = build_warp_group("OrditImparellDarr", 0.76, 0.945, 0.32, 0.021)
    g_ord_imp_dav = build_warp_group("OrditImparellDav", -0.44, 0.945, 0.32, 0.021)

    # --- 5. LLIÇOS PENJATS EN RODETES I ACCIONATS PER TREPITJADORS DE LLIÇ ---
    g_llicos = add_empty("Llicos")
    for px in (-0.42, 0.42):
        make_cyl(f"CorroLlic_{px}", 0.065, 0.052, (px, 0.32, 1.72), m_wood, rot=(0, math.pi / 2, 0), parent=g_llicos)
        make_rod_between(f"CorretjaLlic_{px}", (px, 0.28, 1.72), (px, 0.28, 1.18), 0.008, m_leather, verts=6, parent=g_llicos)
        make_rod_between(f"CorretjaLlic2_{px}", (px, 0.36, 1.72), (px, 0.36, 1.18), 0.008, m_leather, verts=6, parent=g_llicos)

    palanques = []
    for idx, (cx, cy_llic) in enumerate(((-0.18, 0.28), (0.18, 0.36))):
        pal = add_empty(f"PalancaTrepitjador_{idx}", (cx, -0.28, 0.42), parent=g_llicos)
        make_box(f"PalBarra_{idx}", (0.032, 0.66, 0.040), (0.0, 0.32, 0.0), m_wood_dark, parent=pal, bevel=0.003)
        make_cyl(f"CorroSeguidor_{idx}", 0.024, 0.038, (0.0, 0.18, 0.028), m_brass, rot=(0, math.pi / 2, 0), verts=14, parent=pal)
        palanques.append(pal)

    def build_heddle_frame(name, y_pos, x_off):
        hf = add_empty(name, (0.0, y_pos, 0.945), parent=g_llicos)
        make_box(f"{name}_BarSup", (1.62, 0.024, 0.035), (0.0, 0.0, 0.25), m_wood, parent=hf, bevel=0.003)
        make_box(f"{name}_BarInf", (1.62, 0.024, 0.035), (0.0, 0.0, -0.25), m_wood, parent=hf, bevel=0.003)
        for sx in (-0.79, 0.79):
            make_box(f"{name}_Costat_{sx}", (0.025, 0.024, 0.50), (sx, 0.0, 0.0), m_wood, parent=hf, bevel=0.003)
        make_cyl(f"{name}_TirantInf", 0.008, 0.28, (0.0, 0.0, -0.39), m_iron, verts=8, parent=hf, bevel=0.0)
        for k in range(n_pairs):
            kx = -0.74 + k * (1.48 / (n_pairs - 1)) + x_off
            make_cyl(f"{name}_Filferro_{k}", 0.0024, 0.48, (kx, 0.0, 0.0), m_steel, verts=6, parent=hf, bevel=0.0)
            make_sphere(f"{name}_Ullet_{k}", 0.0072, (kx, 0.0, 0.0), m_brass, segs=8, rings=6, parent=hf)
        return hf

    g_llic1 = build_heddle_frame("Llic1", 0.28, -0.021)
    g_llic2 = build_heddle_frame("Llic2", 0.36, 0.021)

    # --- 6. BATÀ BASCULANT, PINTA METÀL·LICA (44 PUES) I BIELES FORJADES AMB BRIDES ---
    g_bata = add_empty("Bata", (0.0, -0.18, 1.82))
    for sx in (-0.88, 0.88):
        make_box(f"EspasaBata_{sx}", (0.052, 0.062, 1.00), (sx, 0.0, -0.48), m_wood_dark, parent=g_bata, bevel=0.006)
        make_cyl(f"PernBataSup_{sx}", 0.022, 0.14, (sx, 0.0, 0.0), m_iron, rot=(0, math.pi / 2, 0), verts=14, parent=g_bata)
        make_box(f"UllBataInf_{sx}", (0.062, 0.068, 0.068), (sx, -0.02, -0.92), m_iron, parent=g_bata, bevel=0.004)
        make_cyl(f"PernBataInf_{sx}", 0.019, 0.125, (sx, -0.02, -0.92), m_brass, rot=(0, math.pi / 2, 0), verts=14, parent=g_bata)

    make_box("PistaBata", (2.82, 0.14, 0.048), (0.0, -0.02, -0.935), m_wood, parent=g_bata, bevel=0.006)
    make_box("PassamaPinta", (1.84, 0.052, 0.052), (0.0, 0.0, -0.66), m_wood, parent=g_bata, bevel=0.006)
    make_box("BasePinta", (1.72, 0.040, 0.030), (0.0, 0.0, -0.895), m_brass, parent=g_bata, bevel=0.003)
    for r in range(44):
        rx_pua = -0.80 + r * (1.60 / 43.0)
        make_box(f"PuaPinta_{r}", (0.0042, 0.013, 0.21), (rx_pua, 0.0, -0.78), m_steel, parent=g_bata, bevel=0.0)

    # Caixes de llançadora amb vareta guia d'acer i tac mòbil de cuir (picker)
    for side_n, sx, sign in (("Esq", -1.22, -1), ("Dreta", 1.22, 1)):
        make_box(f"CaixaDarr_{side_n}", (0.34, 0.022, 0.095), (sx, 0.045, -0.875), m_wood_dark, parent=g_bata)
        make_box(f"CaixaDav_{side_n}", (0.34, 0.020, 0.068), (sx, -0.085, -0.885), m_wood_dark, parent=g_bata)
        make_box(f"CaixaTapa_{side_n}", (0.024, 0.14, 0.095), (sign * 1.39, -0.02, -0.875), m_brass, parent=g_bata, bevel=0.003)
        make_cyl(f"VaretaGuia_{side_n}", 0.007, 0.34, (sx, -0.02, -0.845), m_steel, rot=(0, math.pi / 2, 0), verts=10, parent=g_bata, bevel=0.0)

    # Bieles forjades d'acer amb brides de llautó als dos caps
    biela_objs = []
    for sx in (-0.88, 0.88):
        br = add_empty(f"Biela_{sx}", (sx, y_main, z_main - 0.11))
        make_cyl(f"BielaBarra_{sx}", 0.017, 1.0, (0.0, 0.0, 0.50), m_steel, verts=12, parent=br, bevel=0.0)
        make_box(f"BielaCapInf_{sx}", (0.046, 0.056, 0.065), (0.0, 0.0, 0.015), m_brass, parent=br, bevel=0.004)
        make_box(f"BielaCapSup_{sx}", (0.044, 0.052, 0.058), (0.0, 0.0, 0.985), m_brass, parent=br, bevel=0.004)
        biela_objs.append((br, sx))

    # --- 7. IMPULSORS MECÀNICS AMB POLINES SOTA LA PISTA, MOLL ESPIRAL I LLANÇADORA ---
    g_imp_esq = add_empty("ImpulsorEsq", (-1.18, y_cam, z_cam))
    make_box("EspasaImpEsq", (0.036, 0.044, 0.52), (-0.06, 0.0, 0.24), m_wood_dark, parent=g_imp_esq, bevel=0.004)
    make_box("TacImpEsq", (0.062, 0.052, 0.064), (-0.04, 0.06, 0.46), m_leather, parent=g_imp_esq, bevel=0.004)
    make_cyl("PolinaImpEsq", 0.032, 0.024, (-0.10, 0.0, 0.08), m_brass, rot=(0, math.pi / 2, 0), verts=14, parent=g_imp_esq)
    _make_helix_spring("MollRetornEsq", (-1.04, -0.18, 0.62), (-1.22, -0.10, 0.68), 0.016, 7, 0.0032, m_steel, parent=g_eix)

    g_imp_dret = add_empty("ImpulsorDret", (1.18, y_cam, z_cam))
    make_box("EspasaImpDret", (0.036, 0.044, 0.52), (0.06, 0.0, 0.24), m_wood_dark, parent=g_imp_dret, bevel=0.004)
    make_box("TacImpDret", (0.062, 0.052, 0.064), (0.04, 0.06, 0.46), m_leather, parent=g_imp_dret, bevel=0.004)
    make_cyl("PolinaImpDret", 0.032, 0.024, (0.10, 0.0, 0.08), m_brass, rot=(0, math.pi / 2, 0), verts=14, parent=g_imp_dret)
    _make_helix_spring("MollRetornDret", (1.04, -0.18, 0.62), (1.22, -0.10, 0.68), 0.016, 7, 0.0032, m_steel, parent=g_eix)

    g_llanc = make_shuttle("Llancadora", (-1.12, -0.02, -0.885), m_wood_dark, m_steel, m_weft, scale=1.0, parent=g_bata)
    g_trama_activa = make_box("TramaActiva", (1.44, 0.011, 0.011), (0.0, -0.02, -0.885), m_weft, parent=g_bata, bevel=0.0)

    # --- 8. TELA TEIXIDA SOBRE CORRÓ DE PIT (ZERO Z-FIGHTING!), TREMPADOR I PLEGADOR ---
    g_tela = add_empty("Tela")
    # Corró de pit polit per sobre de BigaPitDavant (Z=0.88+0.041=0.921; corró centrat a Z=0.925, R=0.024 -> cim 0.949)
    make_cyl("CorroPitPolit", 0.024, 1.82, (0.0, -0.80, 0.925), m_steel, rot=(0, math.pi / 2, 0), verts=18, parent=g_tela)
    make_box("TelaPlana", (1.52, 0.39, 0.012), (0.0, -0.625, 0.946), m_cloth, parent=g_tela, bevel=0.002)
    # Trempador (temple bar) de llautó amb pues als costats per mantenir l'amplada del teixit
    make_box("TrempadorBarra", (1.58, 0.026, 0.016), (0.0, -0.455, 0.960), m_brass, parent=g_tela, bevel=0.002)
    for sx in (-0.76, 0.76):
        make_box(f"TrempadorCap_{sx}", (0.055, 0.060, 0.024), (sx, -0.455, 0.962), m_iron, parent=g_tela, bevel=0.002)
    for ti in range(6):
        make_box(f"LlistaTrama_{ti}", (1.51, 0.010, 0.014), (0.0, -0.485 - ti * 0.046, 0.948), m_weft, parent=g_tela, bevel=0.0)
    make_box("TelaBaixada", (1.52, 0.012, 0.25), (0.0, -0.818, 0.80), m_cloth, rot=(0.24, 0, 0), parent=g_tela, bevel=0.002)
    make_cyl("PlegadorTelaNucli", 0.045, 2.14, (0.0, -0.70, 0.66), m_wood_dark, rot=(0, math.pi / 2, 0), parent=g_tela)
    make_cyl("PlegadorTelaCoto", 0.115, 1.54, (0.0, -0.70, 0.66), m_cloth, rot=(0, math.pi / 2, 0), parent=g_tela)
    make_gear("RodaTela", 0.115, 0.024, 18, (-0.92, -0.70, 0.66), m_brass, mat_hub=m_iron, axis="X", parent=g_tela)

    # --- 9. TEIXIDORA VIGILANT EL TELER MECÀNIC A ESCALA REAL ---
    worker = make_worker("VigilantCartwright", (-0.88, -1.24, 0.14), facing_yaw=math.pi * 0.14, scale=1.0, role="weaver")

    def apply_pose(p):
        st = eval_cartwright_state(p)
        g_main_shaft.rotation_euler = (st["ang_main"], 0.0, 0.0)
        g_loom_pulley.rotation_euler = (st["ang_main"], 0.0, 0.0)
        g_flywheel.rotation_euler = (st["ang_main"], 0.0, 0.0)
        g_top_pulley.rotation_euler = (st["ang_main"] * 0.86, 0.0, 0.0)
        g_cam_shaft.rotation_euler = (-st["ang_cam"], 0.0, 0.0)

        rx_bata = 0.25 - 0.48 * st["beat"]
        g_bata.rotation_euler = (rx_bata, 0.0, 0.0)

        # Bieles connectant exactament la manovella (Y=-0.34, Z=0.60, r=0.11) amb el pern inferior del batà (offset (0,-0.02,-0.92))
        c_ang = st["ang_main"]
        cy = y_main + 0.11 * math.sin(c_ang)
        cz = z_main - 0.11 * math.cos(c_ang)
        py_bata = -0.18 - 0.92 * math.sin(rx_bata) - 0.02 * math.cos(rx_bata)
        pz_bata = 1.82 - 0.92 * math.cos(rx_bata) + 0.02 * math.sin(rx_bata)
        dy_b = py_bata - cy
        dz_b = pz_bata - cz
        len_b = math.sqrt(dy_b * dy_b + dz_b * dz_b)
        ang_b = math.atan2(-dy_b, dz_b)
        for br, sx in biela_objs:
            br.location = (sx, cy, cz)
            br.rotation_euler = (ang_b, 0.0, 0.0)
            br.scale = (1.0, 1.0, len_b)

        dz_heddle = 0.095 * st["shed"]
        g_llic1.location = (0.0, 0.28, 0.945 + dz_heddle)
        g_llic2.location = (0.0, 0.36, 0.945 - dz_heddle)
        palanques[0].rotation_euler = (-0.15 * st["shed"], 0.0, 0.0)
        palanques[1].rotation_euler = (0.15 * st["shed"], 0.0, 0.0)

        ang_par_darr = math.atan2(dz_heddle, 0.44)
        ang_par_dav = -math.atan2(dz_heddle, 0.76)
        g_ord_par_darr.rotation_euler = (-ang_par_darr, 0.0, 0.0)
        g_ord_par_dav.rotation_euler = (-ang_par_dav, 0.0, 0.0)
        g_ord_imp_darr.rotation_euler = (ang_par_darr, 0.0, 0.0)
        g_ord_imp_dav.rotation_euler = (ang_par_dav, 0.0, 0.0)

        g_imp_esq.rotation_euler = (0.0, 0.34 * st["kick_l"], 0.0)
        g_imp_dret.rotation_euler = (0.0, -0.34 * st["kick_r"], 0.0)
        g_llanc.location = (st["shuttle_x"], -0.02, -0.885)
        vis_x = max(0.05, min(1.0, abs(st["shuttle_x"]) / 0.85))
        g_trama_activa.scale = (vis_x, 1.0, 1.0)

        # Teixidora supervisant la tela i els engranatges
        set_worker_pose(
            worker,
            torso_rot=(0.10 + 0.03 * math.sin(2.0 * math.pi * p), 0.0, 0.0),
            head_rot=(-0.12, 0.0, -0.18 + 0.06 * math.sin(2.0 * math.pi * p)),
            l_sh=(0.68, 0.0, -0.08),
            l_elb=(-0.58, 0.0, 0.0),
            r_sh=(0.82, -0.08, 0.14),
            r_elb=(-0.62, 0.0, 0.0),
        )

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        worker_objs = [worker["torso"], worker["head"], worker["l_sh"], worker["l_elb"], worker["r_sh"], worker["r_elb"]]
        anim_objs = [
            g_main_shaft,
            g_loom_pulley,
            g_flywheel,
            g_top_pulley,
            g_cam_shaft,
            g_bata,
            g_llic1,
            g_llic2,
            g_ord_par_darr,
            g_ord_par_dav,
            g_ord_imp_darr,
            g_ord_imp_dav,
            g_imp_esq,
            g_imp_dret,
            g_llanc,
            g_trama_activa,
        ] + palanques + [b for b, _ in biela_objs] + worker_objs
        for fr in range(1, 61):
            p = (fr - 1) / 60.0
            apply_pose(p)
            for o in anim_objs:
                o.keyframe_insert(data_path="location", frame=fr)
                o.keyframe_insert(data_path="rotation_euler", frame=fr)
                o.keyframe_insert(data_path="scale", frame=fr)
        set_linear_fcurves(anim_objs)
    else:
        apply_pose(0.20)

    setup_lighting(cam_loc=(3.28, -3.88, 2.38), target=(0.12, -0.18, 0.94), lens=38.0, mood="workshop")

    anchors = {
        "transmissio": (1.40, -0.34, 0.86),
        "eix": (0.85, -0.18, 0.48),
        "llicos": (-0.20, 0.32, 1.22),
        "llancadora": (-0.15, 0.04, 0.92),
        "pinta": (0.50, 0.06, 1.08),
        "ordit": (-0.52, 0.62, 0.95),
        "tela": (-0.15, -0.60, 0.95),
        "bastidor": (-1.04, 0.80, 1.48),
    }
    return anchors


def main():
    glb_only = "--glb-only" in sys.argv
    if not glb_only:
        anc = build_cartwright_scene(animate=False)
        render_image(os.path.join(OUT_DIR, "cartwright-muntada.png"), res_x=1200, res_y=760, samples=32)
        pts = project_anchors(anc)
        render_closeup(
            os.path.join(OUT_DIR, "cartwright-detall.png"),
            cam_loc=(2.68, -2.18, 1.24),
            target=(0.76, -0.20, 0.62),
            lens=44.0,
            samples=28,
        )

    anc_glb = build_cartwright_scene(animate=True)
    export_glb_and_meta(
        "cartwright",
        "cartwright.glb",
        anc_glb,
        extra_meta={"muntada_pct": pts} if not glb_only else None,
    )


if __name__ == "__main__":
    main()

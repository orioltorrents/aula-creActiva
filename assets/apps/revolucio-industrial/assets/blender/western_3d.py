# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Vapor transatlàntic de rodes de pales (SS Great Western, I. K. Brunel, 1838),
en tall longitudinal complet pel costat d'estribord (-Y):
- Casc corbat de roure amb obra viva folrada de coure, roda de proa, timó i coberta entaulonada.
- Cambra de popa oberta amb saló victoriana, claraboia i roda del timó.
- Carbonera de gran capacitat amb pila de carbó i fogoner amb pala carregant les calderes.
- Caldera marina retornada totalment seccionada amb doble fogar, brases, graelles,
  aigua blava cobrint els tubs de retorn de coure, cúpula de vapor i tub principal.
- Sala de màquines Maudslay de palanques laterals (side-lever) amb bastidor gòtic,
  cilindre vertical seccionat, caixa de vàlvula, condensador i bomba d'aire,
  creuera, tirants, balancí baix, biela forcada i cigonyal superior.
- Doble roda de pales de 14 àleps (frontal descoberta amb arc seccionat i posterior amb tambor).
- Quatre pals amb obencs, estaies, veles bombades al vent, botes salvavides i mar ondulat.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bmesh
import bpy
from mathutils import Vector

from pbr_comu import (
    add_empty,
    add_shadow_floor,
    apply_box_uv,
    build_pbr_pair,
    clear_scene,
    export_glb_and_meta,
    link_obj,
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
    make_spoked_wheel,
    make_torus,
    make_worker,
    project_anchors,
    render_closeup,
    render_image,
    set_linear_fcurves,
    set_smooth,
    set_worker_pose,
    setup_lighting,
)


def make_wavy_sea(name, size_x, size_y, z_base, height, m_water):
    """Volum d'aigua translúcida amb ondulació suau a la superfície."""
    make_box(f"{name}_Base", (size_x, size_y, height), (0.0, 0.08, z_base + height * 0.5), m_water, bevel=0.02)
    bm = bmesh.new()
    nx, ny = 52, 22
    grid = []
    for ix in range(nx + 1):
        x = (ix / nx - 0.5) * size_x
        row = []
        for iy in range(ny + 1):
            y = 0.08 + (iy / ny - 0.5) * size_y
            z = z_base + height + 0.032 * math.sin(x * 2.1 + y * 1.1) + 0.016 * math.cos(x * 4.6 - y * 2.2)
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for ix in range(nx):
        for iy in range(ny):
            bm.faces.new((grid[ix][iy], grid[ix + 1][iy], grid[ix + 1][iy + 1], grid[ix][iy + 1]))
    mesh = bpy.data.meshes.new(name + "_WaveMesh")
    obj = bpy.data.objects.new(name + "_Wave", mesh)
    link_obj(obj)
    obj.data.materials.append(m_water)
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=0.5)
    set_smooth(obj)


def make_billowed_sail(name, center, width_y, height_z, bulge_x, mat):
    """Vela de lona corbada i bombada pel vent (+X) amb relleu realista."""
    bm = bmesh.new()
    nu, nv = 10, 8
    cx, cy, cz = center
    grid = []
    for iu in range(nu + 1):
        u = iu / nu
        v_row = []
        for iv in range(nv + 1):
            v = iv / nv
            y = cy + (v - 0.5) * width_y * (0.90 + 0.14 * u)
            z = cz + (0.5 - u) * height_z
            belly = bulge_x * math.sin(u * math.pi) * math.sin(v * math.pi)
            rake = (0.5 - u) * 0.06
            v_row.append(bm.verts.new((cx + belly + rake, y, z)))
        grid.append(v_row)
    for iu in range(nu):
        for iv in range(nv):
            bm.faces.new((grid[iu][iv], grid[iu][iv + 1], grid[iu + 1][iv + 1], grid[iu + 1][iv]))
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    obj.data.materials.append(mat)
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    mod = obj.modifiers.new("Solidify", "SOLIDIFY")
    mod.thickness = 0.016
    apply_box_uv(obj, uv_scale=0.8)
    set_smooth(obj)
    return obj


def make_hull_section(name, m_hull, m_deck, m_rib, m_copper, m_sec):
    """Buc corbat seccionat al frontal (-Y) fins a y=-0.38 amb quadernes, sentina i obra viva coure."""
    bm = bmesh.new()
    nu = 28
    out_grids, in_grids = [], []
    for iu in range(nu + 1):
        u = iu / nu
        x = -3.45 + 7.05 * u
        if u < 0.18:
            t = u / 0.18
            half_w = 0.24 + 0.54 * (t ** 0.58)
            z_keel = 0.25 - 0.04 * t
            z_sheer = 1.66 - 0.12 * t
        elif u > 0.78:
            t = (1.0 - u) / 0.22
            half_w = 0.08 + 0.70 * (t ** 0.72)
            z_keel = 0.21 + 0.26 * ((1.0 - t) ** 1.6)
            z_sheer = 1.54 + 0.16 * (1.0 - t)
        else:
            half_w = 0.78
            z_keel = 0.21
            z_sheer = 1.54

        y_cut = -0.36 if 0.12 < u < 0.84 else -min(0.36, half_w * 0.55)
        prof = [
            (y_cut, z_keel + 0.05),
            (-0.04, z_keel),
            (half_w * 0.58, z_keel + 0.09),
            (half_w * 0.94, 0.78),
            (half_w, 1.22),
            (half_w * 0.96, z_sheer),
        ]
        row_o, row_i = [], []
        for py, pz in prof:
            row_o.append(bm.verts.new((x, py, pz)))
            row_i.append(bm.verts.new((x, max(y_cut + 0.02, py - 0.085), pz + 0.075)))
        out_grids.append(row_o)
        in_grids.append(row_i)

    np = len(out_grids[0])
    for iu in range(nu):
        for ip in range(np - 1):
            bm.faces.new((out_grids[iu][ip], out_grids[iu + 1][ip], out_grids[iu + 1][ip + 1], out_grids[iu][ip + 1]))
            bm.faces.new((in_grids[iu][ip + 1], in_grids[iu + 1][ip + 1], in_grids[iu + 1][ip], in_grids[iu][ip]))
        bm.faces.new((out_grids[iu][0], out_grids[iu + 1][0], in_grids[iu + 1][0], in_grids[iu][0]))
        bm.faces.new((in_grids[iu][-1], in_grids[iu + 1][-1], out_grids[iu + 1][-1], out_grids[iu][-1]))
    for idx, flip in ((0, True), (nu, False)):
        for ip in range(np - 1):
            if flip:
                bm.faces.new((out_grids[idx][ip], out_grids[idx][ip + 1], in_grids[idx][ip + 1], in_grids[idx][ip]))
            else:
                bm.faces.new((in_grids[idx][ip], in_grids[idx][ip + 1], out_grids[idx][ip + 1], out_grids[idx][ip]))

    mesh = bpy.data.meshes.new(name + "_HullMesh")
    obj = bpy.data.objects.new(name + "_Hull", mesh)
    link_obj(obj)
    obj.data.materials.append(m_hull)
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=0.6)
    set_smooth(obj)

    # Quilla folrada de coure, roda de proa amb mascaró daurat, timó i coberta entaulonada
    make_box(f"{name}_Quilla", (6.50, 0.22, 0.14), (0.0, 0.02, 0.22), m_copper, bevel=0.015)
    make_curve_tube(f"{name}_RodaProa", [(3.15, 0.0, 0.25), (3.48, 0.0, 0.68), (3.62, 0.0, 1.24), (3.64, 0.0, 1.72)], 0.095, m_hull)
    make_box(f"{name}_Timo", (0.36, 0.07, 0.88), (-3.62, 0.0, 0.68), m_hull, bevel=0.008)
    make_box(f"{name}_TallVoraInf", (5.10, 0.035, 0.05), (0.05, -0.35, 0.29), m_sec)

    # Quadernes internes + sentina entaulonada + mampares obertes per mostrar cada compartiment
    for qx in [-2.75 + 0.68 * i for i in range(9)]:
        make_box(f"{name}_Quad_{qx:.2f}", (0.075, 0.96, 0.065), (qx, 0.16, 0.31), m_rib, bevel=0.004)
        make_box(f"{name}_QuadDarr_{qx:.2f}", (0.075, 0.075, 1.15), (qx, 0.66, 0.89), m_rib, bevel=0.004)
    make_box(f"{name}_Sentina", (5.80, 0.88, 0.045), (0.0, 0.12, 0.34), m_rib, bevel=0.005)
    make_box(f"{name}_Coberta", (6.75, 0.76, 0.085), (0.05, 0.34, 1.56), m_deck, bevel=0.01)
    make_box(f"{name}_Amurada", (6.45, 0.08, 0.20), (0.05, 0.70, 1.68), m_hull, bevel=0.006)
    make_cyl(f"{name}_Baupres", 0.052, 1.48, (4.05, 0.05, 1.84), m_deck, rot=(0, 1.22, 0))
    make_rod_between(f"{name}_Barbiquejo", (3.42, 0.0, 0.98), (4.58, 0.05, 2.04), 0.012, m_hull)

    # Mampares divisorios baixes entre compartiments (deixen veure tota l'alçada sense tapar)
    for mx in (-2.08, -0.98, 1.52):
        make_box(f"{name}_Mamparo_{mx:.2f}", (0.055, 0.80, 1.08), (mx, 0.26, 0.92), m_rib, bevel=0.004)


def build_western(animate=True):
    clear_scene()

    p_wood = build_pbr_pair("WoodWst", "wood", 512, 512, bump_scale=1.7)
    p_wood_d = build_pbr_pair("WoodDWst", "wood_dark", 512, 512, bump_scale=1.9)
    p_iron = build_pbr_pair("IronWst", "castiron", 512, 512, bump_scale=2.0)
    p_brass = build_pbr_pair("BrassWst", "brass", 512, 512, bump_scale=1.2)
    p_copper = build_pbr_pair("CopperWst", "copper", 512, 512, bump_scale=1.4)
    p_cloth = build_pbr_pair("ClothWst", "cotton_cloth", 512, 512, bump_scale=1.4)

    m_hull = make_mat("BucRoureFosc", "#3a2518", metallic=0.0, roughness=0.72, pbr_pair=p_wood_d)
    m_deck = make_mat("CobertaPi", "#a47a4c", metallic=0.0, roughness=0.66, pbr_pair=p_wood)
    m_saloon = make_mat("CaobaSalo", "#6a3222", metallic=0.0, roughness=0.52, pbr_pair=p_wood)
    m_iron = make_mat("FerroFosa", "#272c31", metallic=0.84, roughness=0.45, pbr_pair=p_iron)
    m_steel = make_mat("AcerPolit", "#c8d0d8", metallic=0.95, roughness=0.20)
    m_brass = make_mat("Llauto", "#d4a43e", metallic=0.92, roughness=0.24, pbr_pair=p_brass)
    m_copper = make_mat("CoureCalent", "#c0683d", metallic=0.88, roughness=0.28, pbr_pair=p_copper)
    m_sec = make_mat("TallSeccio", "#b63a28", metallic=0.16, roughness=0.46)
    m_sail = make_mat("VelaLona", "#efe6d0", metallic=0.0, roughness=0.82, pbr_pair=p_cloth)
    m_red_band = make_mat("BandaVermella", "#993228", metallic=0.08, roughness=0.50)
    m_coal = make_mat("CarboMineral", "#17191c", metallic=0.08, roughness=0.86)
    m_fire = make_mat("BrasesCaldera", "#ff5918", metallic=0.0, roughness=0.48, emission_hex="#ff4508", emission_strength=3.6)
    m_boiler_w = make_mat("AiguaCalderaMar", "#2d83ba", metallic=0.0, roughness=0.16, alpha=0.30)
    m_steam = make_mat("VaporCalderaMar", "#ffba75", metallic=0.0, roughness=0.35, alpha=0.28, emission_hex="#ff8c38", emission_strength=0.35)
    m_water = make_mat("AiguaMar", "#1e6694", metallic=0.0, roughness=0.14, alpha=0.44)
    m_smoke = make_mat("FumVapor", "#ccd4da", metallic=0.0, roughness=0.68, alpha=0.44)

    add_shadow_floor(z=0.0, size=18.0)
    make_wavy_sea("Mar", 9.0, 3.1, 0.0, 0.36, m_water)

    # 1. BUC CORBAT SECCIONAT
    make_hull_section("GreatWestern", m_hull, m_deck, m_deck, m_copper, m_sec)

    # 2. CAMBRA DE POPA OBERTA (GRAN SALÓ VICTORIANA, LLITERES, TAULA, LLÀNTIA, ULLS DE BOU, TIMÓ I TELÈGRAF)
    make_box("SaloParetFons", (1.12, 0.06, 0.92), (-2.72, 0.56, 0.88), m_saloon, bevel=0.005)
    make_box("CatifaSalo", (0.96, 0.56, 0.02), (-2.72, 0.24, 0.37), m_red_band, bevel=0.003)
    make_box("SaloTaula", (0.64, 0.24, 0.04), (-2.72, 0.16, 0.64), m_saloon, bevel=0.005)
    make_cyl("PotaTaula1", 0.025, 0.28, (-2.94, 0.16, 0.50), m_saloon)
    make_cyl("PotaTaula2", 0.025, 0.28, (-2.50, 0.16, 0.50), m_saloon)
    make_box("SaloBanc1", (0.62, 0.14, 0.04), (-2.72, 0.38, 0.54), m_red_band, bevel=0.004)
    # Lliteres de passatgers amb matalassos i coixins blancs + marc de fusta
    for lz in (0.96, 1.26):
        make_box(f"LliteraFusta_{lz:.2f}", (1.02, 0.36, 0.04), (-2.72, 0.38, lz), m_saloon, bevel=0.004)
        make_box(f"Matalas_{lz:.2f}", (0.86, 0.30, 0.055), (-2.72, 0.38, lz + 0.045), m_sail, bevel=0.012)
        make_box(f"Coixi_{lz:.2f}", (0.20, 0.24, 0.045), (-3.04, 0.38, lz + 0.08), m_sail, bevel=0.012)
    make_cyl("LlantiaSalo", 0.065, 0.10, (-2.72, 0.16, 1.40), m_brass)
    for px_b in (-3.02, -2.72, -2.42):
        make_torus(f"UllBouSalo_{px_b:.2f}", 0.065, 0.014, (px_b, 0.53, 1.16), m_brass, rot=(math.pi / 2, 0, 0))
        make_cyl(f"VidreBou_{px_b:.2f}", 0.055, 0.02, (px_b, 0.53, 1.16), m_boiler_w, rot=(math.pi / 2, 0, 0))
    make_box("ClaraboiaCabines", (0.72, 0.40, 0.20), (-2.72, 0.30, 1.70), m_deck, bevel=0.008)
    make_spoked_wheel("RodaTimo", 0.22, 0.032, 8, (-3.32, 0.26, 1.82), m_deck, m_brass, axis="X")
    make_cyl("ColTelegrafPont", 0.035, 0.34, (-3.08, 0.38, 1.73), m_brass)
    make_cyl("EsferaTelegrafPont", 0.075, 0.05, (-3.08, 0.38, 1.92), m_brass, rot=(math.pi / 2, 0, 0))

    # Bodega davantera amb caixes amb llistons en X, bocois amb cèrcols de ferro, bales i escala d'escotilla
    for bi, (bx, by, bz, sz) in enumerate(
        [(1.92, 0.16, 0.56, (0.52, 0.40, 0.40)), (2.56, 0.18, 0.50, (0.42, 0.36, 0.30))]
    ):
        make_box(f"CaixaCarrega_{bi}", sz, (bx, by, bz), m_deck, bevel=0.01)
        make_box(f"LlistoSup_{bi}", (sz[0] + 0.02, 0.02, 0.04), (bx, by - sz[1] * 0.5, bz + sz[2] * 0.35), m_saloon)
        make_box(f"LlistoInf_{bi}", (sz[0] + 0.02, 0.02, 0.04), (bx, by - sz[1] * 0.5, bz - sz[2] * 0.35), m_saloon)
    for bci, (bcx, bcy, bcz) in enumerate([(1.92, 0.20, 0.96), (2.28, 0.22, 0.54)]):
        make_cyl(f"Bocoi_{bci}", 0.15, 0.36, (bcx, bcy, bcz), m_saloon, bevel=0.012)
        make_torus(f"CercolBocoiA_{bci}", 0.152, 0.012, (bcx, bcy, bcz - 0.10), m_iron)
        make_torus(f"CercolBocoiB_{bci}", 0.152, 0.012, (bcx, bcy, bcz + 0.10), m_iron)
    make_box("BalaCotoHold", (0.38, 0.32, 0.26), (2.56, 0.20, 0.78), m_sail, bevel=0.02)
    make_rod_between("EscalaBodega1", (1.68, 0.02, 0.36), (1.82, 0.02, 1.54), 0.016, m_deck)
    make_rod_between("EscalaBodega2", (1.68, 0.26, 0.36), (1.82, 0.26, 1.54), 0.016, m_deck)
    for r_e in range(5):
        ez = 0.52 + r_e * 0.22
        ex = 1.68 + (ez - 0.36) / 1.18 * 0.14
        make_cyl(f"GraoEscala_{r_e}", 0.011, 0.24, (ex, 0.14, ez), m_deck, rot=(math.pi / 2, 0, 0))
    make_cyl("MolinetAncora", 0.10, 0.54, (2.92, 0.24, 1.72), m_iron, rot=(math.pi / 2, 0, 0))
    make_rod_between("AncoraCan", (3.32, -0.18, 1.52), (3.44, -0.22, 1.02), 0.020, m_iron)
    make_box("AncoraCreu", (0.18, 0.04, 0.05), (3.44, -0.22, 1.02), m_iron, bevel=0.008)

    # 3. CARBONERA CENTRAL, FOGONER AMB PALA I LLANTERNA, I CALDERA MARINA SECCIONADA
    make_coal_pile("PilaCarboBodega", (-1.72, 0.12, 0.37), 0.44, 0.30, 0.46, m_coal, count=74, seed=41)
    stoker = make_worker("FogonerVaixell", (-1.22, -0.02, 0.36), facing_yaw=0.06, scale=0.68, role="weaver")
    set_worker_pose(
        stoker,
        torso_rot=(0.18, 0.0, -0.15),
        head_rot=(0.05, 0.0, 0.10),
        r_sh=(0.68, -0.14, -0.16),
        r_elb=(-0.55, 0.0, 0.0),
        l_sh=(0.55, 0.12, 0.12),
        l_elb=(-0.60, 0.0, 0.0),
    )
    make_rod_between("ManecPala", (-1.42, -0.02, 0.88), (-0.98, 0.04, 0.62), 0.014, m_deck)
    make_box("FullaPala", (0.14, 0.12, 0.016), (-0.94, 0.05, 0.60), m_iron, bevel=0.003)
    make_cyl("LlanternaSala", 0.045, 0.11, (-1.12, 0.34, 1.34), m_fire)

    # CALDERA MARINA RETORNADA OBERTA EN SECCIÓ FRONTAL (-Y COMPLETAMENT DESCOBERT I SENSE OBSTACLES!)
    bx_c = -0.58
    make_box("CaldFons", (0.90, 0.06, 1.06), (bx_c, 0.48, 0.90), m_iron, bevel=0.01)
    make_box("CaldParetEsq", (0.06, 0.68, 1.06), (bx_c - 0.42, 0.16, 0.90), m_iron, bevel=0.01)
    make_box("CaldParetDret", (0.06, 0.68, 1.06), (bx_c + 0.42, 0.16, 0.90), m_iron, bevel=0.01)
    make_box("CaldSostre", (0.90, 0.68, 0.06), (bx_c, 0.16, 1.41), m_iron, bevel=0.01)
    make_box("CaldTerraRefract", (0.80, 0.58, 0.05), (bx_c, 0.16, 0.41), m_saloon, bevel=0.005)
    # Marc vermell de secció a la vora frontal oberta de la caldera
    make_box("CaldTallSup", (0.90, 0.03, 0.05), (bx_c, -0.18, 1.40), m_sec)
    make_box("CaldTallEsq", (0.05, 0.03, 1.06), (bx_c - 0.42, -0.18, 0.90), m_sec)
    make_box("CaldTallDret", (0.05, 0.03, 1.06), (bx_c + 0.42, -0.18, 0.90), m_sec)
    # Indicador de nivell i manòmetre frontals a la caldera
    make_cyl("NivellCaldW", 0.014, 0.32, (bx_c + 0.41, -0.19, 1.08), m_brass)
    make_cyl("ManometreW", 0.052, 0.03, (bx_c + 0.41, -0.19, 1.32), m_brass, rot=(math.pi / 2, 0, 0))

    # Doble fogar interior amb graelles, brases vives + aigua blava translúcida + 6 tubs de retorn de coure!
    for fx_off in (-0.19, 0.19):
        make_box(f"GraellaMar_{fx_off:.2f}", (0.26, 0.46, 0.03), (bx_c + fx_off, 0.14, 0.56), m_iron)
        make_coal_pile(f"BrasesMar_{fx_off:.2f}", (bx_c + fx_off, 0.12, 0.60), 0.11, 0.18, 0.10, m_fire, count=16, seed=55 + int(fx_off * 100))
    # Volum d'aigua bullint i càmera de vapor superior dins la caldera
    make_box("AiguaCalderaMarBox", (0.76, 0.48, 0.42), (bx_c, 0.18, 0.96), m_boiler_w)
    make_box("VaporCalderaMarBox", (0.76, 0.48, 0.18), (bx_c, 0.18, 1.28), m_steam)
    # 6 tubs de retorn de fum en dues fileres ben visibles dins l'aigua + col·lector cap a xemeneia
    for row_z in (0.90, 1.08):
        for col_y in (-0.08, 0.10, 0.28):
            make_cyl(f"TubFumMar_{row_z:.2f}_{col_y:.2f}", 0.028, 0.74, (bx_c, col_y, row_z), m_copper, rot=(0, math.pi / 2, 0), verts=14)
    make_box("CaixaFumsPost", (0.14, 0.50, 0.62), (bx_c - 0.34, 0.16, 1.02), m_iron, bevel=0.008)

    # Cúpula de vapor i canonada principal de coure fins al cilindre de la màquina
    make_cyl("CupulaCaldMar", 0.16, 0.24, (bx_c + 0.12, 0.16, 1.54), m_brass, bevel=0.01)
    make_cyl("ValvSegCaldMar", 0.04, 0.18, (bx_c - 0.22, 0.16, 1.50), m_brass)
    make_curve_tube("TubVaporMaq", [(bx_c + 0.12, 0.16, 1.58), (0.32, 0.08, 1.48), (0.82, -0.02, 1.28), (0.96, -0.02, 1.12)], 0.044, m_copper)

    # Xemeneia alta amb vents d'acer, banda vermella i plomall de fum
    make_cyl("XemeneiaCos", 0.17, 1.96, (bx_c - 0.04, 0.22, 2.38), m_iron, bevel=0.006)
    make_cyl("XemeneiaBanda", 0.176, 0.28, (bx_c - 0.04, 0.22, 2.86), m_red_band, bevel=0.004)
    make_torus("CoronaXemW", 0.182, 0.022, (bx_c - 0.04, 0.22, 3.35), m_brass)
    make_rod_between("VentXem1", (bx_c - 0.04, 0.38, 3.05), (bx_c - 0.65, 0.64, 1.70), 0.008, m_steel)
    make_rod_between("VentXem2", (bx_c - 0.04, 0.38, 3.05), (bx_c + 0.65, 0.64, 1.70), 0.008, m_steel)
    g_fum = add_empty("FumVaixell", (bx_c - 0.04, 0.22, 3.42))
    make_smoke_plume("PlomallVaixell", (0.0, 0.0, 0.0), 1.05, -0.95, 0.05, 0.14, m_smoke, wisps=22, seed=67, parent=g_fum)

    # 4. SALA DE MÀQUINES MAUDSLAY DE PALANQUES LATERALS (SIDE-LEVER) AMB BASTIDOR GÒTIC, VÀLVULA I CONDENSADOR
    mcx, mcy, mcz = 1.22, 0.06, 0.86
    make_box("BancadaMaquina", (1.36, 0.72, 0.08), (0.82, 0.16, 0.39), m_iron, bevel=0.008)
    # Cilindre vertical seccionat frontalment + caixa de vàlvula oberta amb distribució + condensador i bomba d'aire
    make_cutaway_cyl(
        "CilindreSideLever",
        0.18,
        0.24,
        0.64,
        (mcx, mcy, mcz),
        m_brass,
        start_ang=-0.12 * math.pi,
        end_ang=1.12 * math.pi,
        segs=32,
    )
    make_cyl("BaseCilMaq", 0.26, 0.08, (mcx, mcy, 0.50), m_iron)
    make_cyl("TapaCilMaq", 0.25, 0.06, (mcx, mcy, 1.19), m_brass)
    make_box("CaixaValvFons", (0.14, 0.06, 0.48), (mcx - 0.28, mcy + 0.06, mcz), m_copper, bevel=0.005)
    make_box("CaixaValvSup", (0.14, 0.16, 0.04), (mcx - 0.28, mcy, mcz + 0.22), m_sec)
    make_box("CaixaValvInf", (0.14, 0.16, 0.04), (mcx - 0.28, mcy, mcz - 0.22), m_sec)
    g_valv_w = add_empty("ValvulaSlideW", (mcx - 0.28, mcy - 0.02, mcz))
    make_box("ValvulaSlideCosW", (0.08, 0.06, 0.18), (0.0, 0.0, 0.0), m_steel, parent=g_valv_w, bevel=0.004)
    make_cyl("TijaValvW", 0.012, 0.34, (0.0, 0.0, 0.20), m_steel, parent=g_valv_w)
    make_curve_tube("TubEscapCondW", [(mcx - 0.28, mcy + 0.04, mcz - 0.16), (0.86, 0.16, 0.68), (0.78, 0.24, 0.72)], 0.032, m_copper)
    make_cutaway_cyl("CondensadorW", 0.12, 0.16, 0.38, (0.78, 0.24, 0.64), m_iron, start_ang=-0.10 * math.pi, end_ang=1.15 * math.pi, segs=24)
    make_cyl("BombaAireW", 0.10, 0.38, (0.56, 0.24, 0.64), m_brass)

    # Columnes gòtiques inclinades sostenint el cigonyal superior de les pales
    crank_x, crank_z = 0.58, 1.42
    for cy_col in (-0.06, 0.44):
        make_rod_between(f"ColGoticA_{cy_col:.2f}", (0.30, cy_col, 0.40), (crank_x, cy_col, crank_z), 0.044, m_iron)
        make_rod_between(f"ColGoticB_{cy_col:.2f}", (0.88, cy_col, 0.40), (crank_x, cy_col, crank_z), 0.044, m_iron)
        make_box(f"CapitelGotic_{cy_col:.2f}", (0.20, 0.12, 0.12), (crank_x, cy_col, crank_z), m_iron, bevel=0.008)

    piv_x, piv_z = 0.80, 0.52
    make_cyl("SuportPivot", 0.085, 0.56, (piv_x, 0.16, piv_z - 0.07), m_iron, rot=(math.pi / 2, 0, 0))
    g_lever = add_empty("PalancaLateral", (piv_x, -0.09, piv_z))
    make_box("PalancaCos", (0.94, 0.055, 0.12), (0.0, 0.0, 0.0), m_steel, parent=g_lever, bevel=0.01)
    make_cyl("PalancaBoss", 0.09, 0.08, (0.0, 0.0, 0.0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_lever)

    g_piston = add_empty("PistoMaq", (mcx, mcy, mcz))
    make_cyl("CapPistoMaq", 0.17, 0.095, (0, 0, 0), m_iron, parent=g_piston)
    make_cyl("TijaPistoMaq", 0.030, 0.60, (0, 0, 0.30), m_steel, parent=g_piston)
    make_box("CreueraTopMaq", (0.15, 0.28, 0.055), (0, -0.05, 0.60), m_brass, parent=g_piston, bevel=0.005)
    g_tirant_cil = add_empty("TirantCilindre", (0, 0, 0))
    make_cyl("TirantCilCos", 0.022, 0.98, (0, 0, -0.49), m_steel, parent=g_tirant_cil)

    R_crank = 0.22
    L_biela = 0.92
    g_biela = add_empty("BielaMaq", (0, 0, 0))
    make_box("BielaMaqCos", (0.054, 0.046, L_biela), (0, 0, L_biela * 0.5), m_steel, parent=g_biela, bevel=0.005)
    make_cyl("CapBielaMaq1", 0.058, 0.070, (0, 0, 0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_biela)
    make_cyl("CapBielaMaq2", 0.058, 0.070, (0, 0, L_biela), m_brass, rot=(math.pi / 2, 0, 0), parent=g_biela)

    # 5. EIX SUPERIOR, COIXINET SECCIONAT FRONTAL (SENSE TAPAR LA SALA DE MÀQUINES!) I RODA COMPLETA DE BABORD
    g_eix_pales = add_empty("EixRodaPales", (crank_x, 0.0, crank_z))
    make_cyl("EixTransversal", 0.055, 1.72, (0, 0.36, 0), m_steel, rot=(math.pi / 2, 0, 0), parent=g_eix_pales)
    make_cyl("TallEixSecW", 0.062, 0.03, (0, -0.48, 0), m_sec, rot=(math.pi / 2, 0, 0), parent=g_eix_pales)
    make_box("ManovellaMaq", (R_crank + 0.07, 0.05, 0.095), (R_crank * 0.5, -0.09, 0), m_iron, parent=g_eix_pales, bevel=0.005)
    make_cyl("BotoManMaq", 0.038, 0.085, (R_crank, -0.09, 0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_eix_pales)
    make_cyl("ExcentricaW", 0.11, 0.05, (0.04, -0.22, 0), m_brass, rot=(math.pi / 2, 0, 0), parent=g_eix_pales)

    def build_paddle_wheel(pfx, y_pos):
        gw = add_empty(f"RodaPales_{pfx}", (0, y_pos, 0), parent=g_eix_pales)
        r_p = 1.06
        make_torus(f"CercolExt_{pfx}", r_p, 0.024, (0, -0.15, 0), m_iron, rot=(math.pi / 2, 0, 0), parent=gw)
        make_torus(f"CercolInt_{pfx}", r_p, 0.024, (0, 0.15, 0), m_iron, rot=(math.pi / 2, 0, 0), parent=gw)
        make_torus(f"CercolMig_{pfx}", r_p * 0.65, 0.020, (0, 0.0, 0), m_iron, rot=(math.pi / 2, 0, 0), parent=gw)
        n_p = 14
        for k in range(n_p):
            a = 2.0 * math.pi * k / n_p
            ca, sa = math.cos(a), math.sin(a)
            make_rod_between(f"RaigP_{pfx}_{k}", (0, -0.15, 0), (r_p * ca, -0.15, r_p * sa), 0.018, m_iron, parent=gw)
            make_rod_between(f"RaigP2_{pfx}_{k}", (0, 0.15, 0), (r_p * ca, 0.15, r_p * sa), 0.018, m_iron, parent=gw)
            make_box(f"Pala_{pfx}_{k}", (0.034, 0.38, 0.22), (r_p * 0.94 * ca, 0.0, r_p * 0.94 * sa), m_deck, rot=(0, -a, 0), parent=gw, bevel=0.004)
        return gw

    # Roda completa i visibilíssima al costat de babord (+Y) i arc vermell indicant on anava el tambor frontal tallat
    build_paddle_wheel("Darr", 0.98)
    make_cutaway_cyl("CaixaPalesDarr", 1.14, 1.20, 0.46, (crank_x, 0.98, crank_z), m_hull, start_ang=-0.05 * math.pi, end_ang=1.05 * math.pi, rot=(math.pi / 2, 0, 0))
    make_cutaway_cyl("ArcTamborFront", 1.15, 1.20, 0.10, (crank_x, -0.52, crank_z), m_sec, start_ang=0.14 * math.pi, end_ang=0.86 * math.pi, rot=(math.pi / 2, 0, 0))

    # Bots salvavides penjats en pescants corbats a babord
    for lbi, lbx in enumerate((-1.95, 1.75)):
        make_box(f"BotSalv_{lbi}", (0.58, 0.18, 0.14), (lbx, 0.72, 1.92), m_sail, bevel=0.04)
        make_rod_between(f"PescantA_{lbi}", (lbx - 0.22, 0.68, 1.66), (lbx - 0.22, 0.74, 2.02), 0.014, m_iron)
        make_rod_between(f"PescantB_{lbi}", (lbx + 0.22, 0.68, 1.66), (lbx + 0.22, 0.74, 2.02), 0.014, m_iron)

    # 6. QUATRE PALS AMB VELES BOMBADES PEL VENT, FLOCS DE PROA I EIXÀRCIA COMPLETA
    masts = (-2.42, -1.12, 1.48, 2.68)
    for mi, mx in enumerate(masts):
        h_mast = 2.75 if mi in (1, 2) else 2.35
        top_z = 1.56 + h_mast
        make_cyl(f"Pal_{mi}", 0.052, h_mast, (mx, 0.26, 1.56 + h_mast * 0.5), m_deck, bevel=0.004)
        make_box(f"Cofa_{mi}", (0.24, 0.34, 0.04), (mx, 0.26, 1.56 + h_mast * 0.62), m_deck, bevel=0.004)
        make_rod_between(f"Obenc1_{mi}", (mx, 0.26, top_z - 0.16), (mx - 0.20, 0.66, 1.66), 0.009, m_hull)
        make_rod_between(f"Obenc2_{mi}", (mx, 0.26, top_z - 0.16), (mx + 0.20, 0.66, 1.66), 0.009, m_hull)
        for vy, h_v, w_v in ((2.55, 0.70, 1.16), (3.34, 0.56, 0.90))[: (2 if mi in (1, 2) else 1)]:
            make_cyl(f"Verga_{mi}_{vy:.1f}", 0.024, w_v + 0.18, (mx, 0.22, vy), m_deck, rot=(math.pi / 2, 0, 0))
            make_billowed_sail(f"Vela_{mi}_{vy:.1f}", (mx + 0.05, 0.22, vy - h_v * 0.52), w_v, h_v, 0.16, m_sail)
    for mi in range(len(masts) - 1):
        make_rod_between(f"Estai_{mi}", (masts[mi], 0.26, 3.72), (masts[mi + 1], 0.26, 3.35), 0.009, m_hull)
    make_rod_between("EstaiProa", (masts[-1], 0.26, 3.62), (4.48, 0.05, 2.02), 0.010, m_hull)
    make_billowed_sail("FlocProa", (3.72, 0.12, 2.65), 0.64, 0.95, 0.14, m_sail)

    def apply_pose(p):
        theta = 2.0 * math.pi * p
        g_eix_pales.rotation_euler = (0.0, theta, 0.0)
        kx = crank_x + R_crank * math.cos(theta)
        kz = crank_z - R_crank * math.sin(theta)
        ang_lev = -0.42 * math.sin(theta)
        g_lever.rotation_euler = (0.0, ang_lev, 0.0)
        lx = piv_x - 0.36 * math.cos(ang_lev)
        lz = piv_z + 0.36 * math.sin(ang_lev)
        rz = piv_z - 0.36 * math.sin(ang_lev)
        g_biela.location = (lx, -0.09, lz)
        v_b = Vector((kx - lx, 0.0, kz - lz))
        g_biela.rotation_euler = (0.0, math.atan2(v_b.x, v_b.z), 0.0)
        g_biela.scale = (1.0, 1.0, v_b.length / L_biela)
        dz_p = rz - piv_z
        g_piston.location = (mcx, mcy, mcz + dz_p)
        g_valv_w.location = (mcx - 0.28, mcy - 0.02, mcz + 0.09 * math.cos(theta))
        g_tirant_cil.location = (mcx, -0.09, mcz + dz_p + 0.60)
        g_fum.location = (bx_c - 0.05, 0.22, 3.42 + 0.06 * math.sin(theta * 2.0))

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        anim_objs = [g_eix_pales, g_lever, g_biela, g_piston, g_valv_w, g_tirant_cil, g_fum]
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
        apply_pose(0.20)

    cam_loc = (3.65, -9.25, 3.25)
    target = (0.0, 0.05, 1.75)
    setup_lighting(cam_loc, target, lens=39.0, mood="workshop")

    anchors = {
        "carbonera": (-1.72, -0.08, 0.65),
        "calderes": (-0.58, -0.10, 0.96),
        "xemeneia": (bx_c - 0.04, 0.08, 2.75),
        "maquina": (1.12, -0.12, 0.90),
        "roda": (crank_x, 0.98, crank_z + 0.68),
        "veles": (1.48, 0.16, 2.85),
        "cabines": (-2.72, -0.05, 0.85),
        "carrega": (2.25, -0.04, 0.72),
    }

    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
    render_image(os.path.join(out_dir, "western-muntada.png"), res_x=1200, res_y=760, samples=32)
    render_closeup(os.path.join(out_dir, "western-detall.png"), (0.45, -3.75, 1.48), (0.30, 0.05, 0.94), lens=42.0, samples=28)

    proj = project_anchors(anchors)
    export_glb_and_meta("western", "western.glb", anchors, extra_meta={"proj_2d": proj})


if __name__ == "__main__":
    build_western(animate=True)

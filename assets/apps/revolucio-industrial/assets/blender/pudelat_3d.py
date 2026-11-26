# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Forn de pudelat de reverber i tren laminador (Henry Cort, 1784):
volta refractària contínua de canó sense esquerdes ni espais buits, armadura de ferro
amb tirants i tensors, fogar de carbó facetat, muret refractari, bany de ferro roent
amb llengua orgànica de flama, pudelador a escala remenant la bola i tren laminador
obert amb dos corrons d'acer acanalats, cargols de pressió i volant d'impuls.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bmesh
import bpy

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
    make_cyl,
    make_gear,
    make_mat,
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


def make_reverberatory_arch(name, mat, parent=None):
    """Volta de maó refractari contínua i hermètica que baixa suaument sobre la sola."""
    bm = bmesh.new()
    xs = [-2.58, -2.20, -1.80, -1.38, -0.96, -0.56, -0.22]
    z_tops = [1.56, 1.66, 1.62, 1.54, 1.46, 1.38, 1.32]
    thick = 0.22
    y_f, y_b = -0.34, 0.56
    ny = 10
    top_grid, bot_grid = [], []
    for x, zc in zip(xs, z_tops):
        rt, rb = [], []
        for iy in range(ny + 1):
            fy = iy / ny
            y = y_f + (y_b - y_f) * fy
            arch = 0.14 * math.sin(fy * math.pi)
            rt.append(bm.verts.new((x, y, zc + arch + thick)))
            rb.append(bm.verts.new((x, y, zc + arch)))
        top_grid.append(rt)
        bot_grid.append(rb)
    nx = len(xs) - 1
    for ix in range(nx):
        for iy in range(ny):
            bm.faces.new((top_grid[ix][iy], top_grid[ix + 1][iy], top_grid[ix + 1][iy + 1], top_grid[ix][iy + 1]))
            bm.faces.new((bot_grid[ix][iy + 1], bot_grid[ix + 1][iy + 1], bot_grid[ix + 1][iy], bot_grid[ix][iy]))
    for ix in range(nx):
        bm.faces.new((bot_grid[ix][0], bot_grid[ix + 1][0], top_grid[ix + 1][0], top_grid[ix][0]))
        bm.faces.new((top_grid[ix][-1], top_grid[ix + 1][-1], bot_grid[ix + 1][-1], bot_grid[ix][-1]))
    for iy in range(ny):
        bm.faces.new((top_grid[0][iy], top_grid[0][iy + 1], bot_grid[0][iy + 1], bot_grid[0][iy]))
        bm.faces.new((bot_grid[-1][iy], bot_grid[-1][iy + 1], top_grid[-1][iy + 1], top_grid[-1][iy]))

    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=0.65)
    set_smooth(obj)
    return obj


def build_pudelat(animate=True):
    clear_scene()

    p_stone = build_pbr_pair("StonePud", "stone", 512, 512, bump_scale=2.4)
    p_brick = build_pbr_pair("BrickPud", "brick", 512, 512, bump_scale=2.4)
    p_iron = build_pbr_pair("IronPud", "castiron", 512, 512, bump_scale=2.1)

    m_stone = make_mat("PedraSocol", "#a09580", metallic=0.0, roughness=0.88, pbr_pair=p_stone)
    m_brick = make_mat("MaoForn", "#9d4630", metallic=0.0, roughness=0.86, pbr_pair=p_brick, tex_scale=(2.2, 2.2))
    m_refract = make_mat("RefractariClar", "#c79a6b", metallic=0.0, roughness=0.84, pbr_pair=p_brick)
    m_iron = make_mat("FerroFosa", "#272b30", metallic=0.86, roughness=0.42, pbr_pair=p_iron)
    m_steel = make_mat("AcerCorrons", "#c2cad2", metallic=0.95, roughness=0.20)
    m_brass = make_mat("LlautoPud", "#d2a23d", metallic=0.90, roughness=0.26)
    m_coal = make_mat("CarboFogar", "#17191c", metallic=0.08, roughness=0.88)
    m_flame = make_mat("FlamaReverber", "#ff7c24", metallic=0.0, roughness=0.38, alpha=0.62, emission_hex="#ff5a10", emission_strength=3.0)
    m_molten = make_mat("FerroPudelat", "#ff681e", metallic=0.15, roughness=0.32, emission_hex="#ff4b0a", emission_strength=3.6)

    add_shadow_floor(z=0.0, size=16.0)

    # 1. BASE DE TALLER METAL·LÚRGIC
    make_box("PlintAtelier", (6.65, 2.20, 0.24), (0.0, 0.10, 0.12), m_stone, bevel=0.02)

    # 2. FORN DE REVERBER SECCIONAT PEL DAVANT (-Y OBERT)
    make_box("FornParetDarr", (2.68, 0.22, 1.50), (-1.42, 0.58, 0.99), m_brick, bevel=0.015)
    make_box("FornParetEsq", (0.22, 1.05, 1.50), (-2.65, 0.15, 0.99), m_brick, bevel=0.015)
    make_box("FornParetDreta", (0.22, 1.05, 1.38), (-0.18, 0.15, 0.93), m_brick, bevel=0.015)
    make_box("FornBaseSota", (2.68, 1.05, 0.52), (-1.42, 0.15, 0.50), m_brick, bevel=0.015)

    # Volta contínua hermètica + tirants metàl·lics verticals i tensors superiors (buckstays)
    make_reverberatory_arch("VoltaReverber", m_refract)
    for tx in (-2.55, -1.85, -1.05, -0.30):
        make_box(f"TirantFornF_{tx:.2f}", (0.055, 0.07, 1.62), (tx, -0.36, 1.04), m_iron, bevel=0.004)
        make_box(f"TirantFornD_{tx:.2f}", (0.055, 0.07, 1.62), (tx, 0.72, 1.04), m_iron, bevel=0.004)
        make_rod_between(f"TensorSup_{tx:.2f}", (tx, -0.36, 1.84), (tx, 0.72, 1.84), 0.014, m_steel)

    # Fogar a l'esquerra amb barrots, carbó facetat i muret refractari (firebridge)
    for gx in [-2.36 + 0.075 * k for k in range(7)]:
        make_box(f"GraellaBarrot_{gx:.2f}", (0.036, 0.68, 0.05), (gx, 0.10, 0.78), m_iron, bevel=0.002)
    make_coal_pile("LlitCarboFogar", (-2.16, 0.10, 0.80), 0.25, 0.28, 0.16, m_coal, count=26, seed=19)
    make_coal_pile("BrasesFogar", (-2.10, 0.05, 0.88), 0.20, 0.22, 0.10, m_molten, count=14, seed=29)
    make_box("MuretSeparador", (0.20, 0.74, 0.36), (-1.78, 0.10, 0.94), m_refract, bevel=0.01)

    # Sola de pudelació i bany incandescent
    make_box("SolaCubeta", (1.28, 0.72, 0.16), (-1.03, 0.10, 0.84), m_refract, bevel=0.01)
    make_box("BanyFerro", (1.16, 0.58, 0.08), (-1.03, 0.08, 0.94), m_molten, bevel=0.015)

    # Llengua orgànica de flama corbent-se sota la volta
    g_flames = add_empty("FlamesReverber", (-1.85, 0.08, 1.18))
    make_smoke_plume("FlamaVolta", (0.0, 0.0, 0.0), 0.26, 1.25, 0.0, 0.16, m_flame, wisps=16, seed=43, parent=g_flames, flare=0.25)

    # Xemeneia de maó amb cantoneres i tirants de ferro
    make_box("XemeneiaBase", (0.50, 0.58, 1.82), (-0.22, 0.26, 2.40), m_brick, bevel=0.015)
    for zc in (2.15, 2.65, 3.12):
        make_box(f"AnellXem_{zc:.2f}", (0.54, 0.62, 0.045), (-0.22, 0.26, zc), m_iron, bevel=0.004)
    make_box("XemeneiaCorona", (0.58, 0.66, 0.12), (-0.22, 0.26, 3.32), m_iron, bevel=0.008)

    # Bola pastosa orgànica + barra llarga del pudelador i operari al davant/esquerra
    g_bola = add_empty("BolaPudelada", (-1.03, 0.05, 1.02))
    make_coal_pile("BolaFerro", (0.0, 0.0, -0.06), 0.18, 0.16, 0.15, m_molten, count=18, seed=61, parent=g_bola)
    make_rod_between("BarraPudelador", (0.0, 0.0, 0.02), (0.06, -1.18, 0.12), 0.018, m_steel, parent=g_bola)
    worker_pud = make_worker("Pudelador", (-0.64, -1.26, 0.24), facing_yaw=math.pi * 0.85, scale=0.88, role="weaver")

    # 3. TREN DE LAMINATGE OBERT (CASTELLS AMB FINESTRA PER VEURE CORRONS I CARGOLS DE PRESSIÓ)
    lam_x = 1.65
    make_box("BancadaLam", (2.10, 1.20, 0.34), (lam_x, 0.08, 0.40), m_iron, bevel=0.015)
    for ly in (-0.36, 0.40):
        # Castells en U / columna davantera i posterior deixant obert el centre per veure el perfil!
        make_box(f"CastColEsq_{ly:.2f}", (0.11, 0.14, 1.08), (lam_x - 0.18, ly, 1.08), m_iron, bevel=0.008)
        make_box(f"CastColDret_{ly:.2f}", (0.11, 0.14, 1.08), (lam_x + 0.18, ly, 1.08), m_iron, bevel=0.008)
        make_box(f"PontCastell_{ly:.2f}", (0.52, 0.18, 0.14), (lam_x, ly, 1.64), m_iron, bevel=0.008)
        make_cyl(f"CargolPrensa_{ly:.2f}", 0.036, 0.30, (lam_x, ly, 1.78), m_brass)
        make_torus(f"VolantPrensa_{ly:.2f}", 0.10, 0.015, (lam_x, ly, 1.92), m_iron)
    make_box("TaulaEntrada", (0.72, 0.64, 0.07), (lam_x - 0.56, 0.02, 0.94), m_iron, bevel=0.006)
    make_box("TaulaSortida", (0.85, 0.64, 0.07), (lam_x + 0.62, 0.02, 0.94), m_iron, bevel=0.006)

    z_sup, z_inf = 1.24, 0.96
    g_cor_sup = add_empty("CorroSup", (lam_x, 0.02, z_sup))
    g_cor_inf = add_empty("CorroInf", (lam_x, 0.02, z_inf))
    make_cyl("CorroSupCos", 0.13, 0.72, (0, 0, 0), m_steel, rot=(math.pi / 2, 0, 0), parent=g_cor_sup)
    make_cyl("CorroInfCos", 0.13, 0.72, (0, 0, 0), m_steel, rot=(math.pi / 2, 0, 0), parent=g_cor_inf)
    for gy in (-0.18, 0.0, 0.18):
        make_torus(f"CanalSup_{gy:.2f}", 0.132, 0.014, (0, gy, 0), m_iron, rot=(math.pi / 2, 0, 0), parent=g_cor_sup)
        make_torus(f"CanalInf_{gy:.2f}", 0.132, 0.014, (0, gy, 0), m_iron, rot=(math.pi / 2, 0, 0), parent=g_cor_inf)
    make_gear("EngCorSup", 0.14, 0.06, 14, (0, 0.54, 0), m_iron, m_brass, axis="Y", parent=g_cor_sup)
    make_gear("EngCorInf", 0.14, 0.06, 14, (0, 0.54, 0), m_iron, m_brass, axis="Y", parent=g_cor_inf)
    make_spoked_wheel("VolantLam", 0.42, 0.08, 6, (0, 0.68, 0), m_iron, m_brass, axis="Y", parent=g_cor_inf)

    g_barra = add_empty("PerfilLaminat", (lam_x, 0.02, 1.10))
    make_box("PerfilRoent", (1.25, 0.10, 0.045), (0.0, 0.0, 0.0), m_molten, parent=g_barra, bevel=0.008)

    def apply_pose(p):
        theta = 2.0 * math.pi * p
        g_bola.location = (-1.03 + 0.24 * math.sin(theta), 0.05 + 0.08 * math.cos(theta * 2.0), 1.02)
        g_bola.rotation_euler = (0.0, 0.0, 0.12 * math.cos(theta))
        g_flames.scale = (1.0 + 0.06 * math.sin(theta * 3.0), 1.0, 0.90 + 0.14 * math.sin(theta * 3.0))

        g_cor_sup.rotation_euler = (0.0, -2.0 * theta, 0.0)
        g_cor_inf.rotation_euler = (0.0, 2.0 * theta, 0.0)
        u = p % 1.0
        g_barra.location = (lam_x - 0.35 + 0.72 * u, 0.02, 1.10)
        g_barra.scale = (0.75 + 0.55 * u, 1.0, 1.35 - 0.55 * u)

        set_worker_pose(
            worker_pud,
            torso_rot=(0.14, 0.0, 0.15 + 0.12 * math.sin(theta)),
            head_rot=(-0.08, 0.0, 0.12),
            l_sh=(0.86 + 0.16 * math.sin(theta), 0.10, -0.15),
            l_elb=(-0.55, 0.0, 0.0),
            r_sh=(0.72 + 0.16 * math.sin(theta), -0.10, 0.18),
            r_elb=(-0.45, 0.0, 0.0),
        )

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        w_objs = [worker_pud["torso"], worker_pud["head"], worker_pud["l_sh"], worker_pud["r_sh"]]
        anim_objs = [g_bola, g_flames, g_cor_sup, g_cor_inf, g_barra] + w_objs
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
        apply_pose(0.25)

    cam_loc = (2.35, -7.65, 3.05)
    target = (0.0, 0.05, 1.45)
    setup_lighting(cam_loc, target, lens=40.0, mood="workshop")

    anchors = {
        "fogar": (-2.16, -0.05, 0.92),
        "forn": (-1.35, -0.05, 1.56),
        "sola": (-1.03, -0.10, 0.94),
        "pudelador": (-0.98, -0.75, 1.12),
        "xemeneia": (-0.24, 0.10, 2.65),
        "laminador": (lam_x, -0.18, 1.15),
    }

    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
    render_image(os.path.join(out_dir, "pudelat-muntada.png"), res_x=1200, res_y=760, samples=32)
    render_closeup(os.path.join(out_dir, "pudelat-detall.png"), (2.45, -2.35, 1.62), (1.55, 0.0, 1.12), lens=48.0, samples=28)

    proj = project_anchors(anchors)
    export_glb_and_meta("pudelat", "pudelat.glb", anchors, extra_meta={"proj_2d": proj})


if __name__ == "__main__":
    build_pudelat(animate=True)

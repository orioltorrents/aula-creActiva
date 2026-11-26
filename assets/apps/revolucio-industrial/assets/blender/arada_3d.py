# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Arada triangular de Rotherham (Joseph Foljambe, 1730):
biga corbada amb regulador de cadena, ganivet vertical subjectat amb brida,
rella triangular forjada, orelló helicoïdal de fusta folrada amb xapa d'acer reblada,
cinta contínua de gleba voltejant-se sobre llit de terra llaurada real i llaurador a escala.
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
    make_curve_tube,
    make_cyl,
    make_furrow_bed,
    make_mat,
    make_rod_between,
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


def make_mouldboard(name, mat_plate, mat_wood_back, parent=None):
    """Orelló helicoïdal autèntic: cos de roure i xapa d'acer corbada al frontal."""
    objs = []
    for layer_name, mat, y_shift, thick in (
        (name, mat_plate, 0.0, 0.012),
        (f"{name}_Fusta", mat_wood_back, 0.015, 0.024),
    ):
        mesh = bpy.data.meshes.new(layer_name + "_Mesh")
        obj = bpy.data.objects.new(layer_name, mesh)
        link_obj(obj)
        obj.data.materials.append(mat)
        if parent:
            obj.parent = parent

        bm = bmesh.new()
        nu, nv = 20, 12
        grid_front, grid_back = [], []
        for iu in range(nu + 1):
            u = iu / nu
            x = 0.38 - u * 0.96
            row_f, row_b = [], []
            twist = (u ** 1.12) * 1.52
            y_off = -0.02 - 0.34 * (u ** 1.28) + y_shift
            for iv in range(nv + 1):
                v = iv / nv
                w = 0.09 + 0.38 * math.sin(u * math.pi * 0.66)
                h_rel = v * w
                dy = y_off - h_rel * math.sin(twist) * 0.88 - 0.07 * math.sin(v * math.pi) * u
                dz = 0.21 + h_rel * math.cos(twist * 0.52) + 0.05 * u
                row_f.append(bm.verts.new((x, dy, dz)))
                row_b.append(bm.verts.new((x, dy + thick, dz + thick * 0.35)))
            grid_front.append(row_f)
            grid_back.append(row_b)

        for iu in range(nu):
            for iv in range(nv):
                bm.faces.new((grid_front[iu][iv], grid_front[iu + 1][iv], grid_front[iu + 1][iv + 1], grid_front[iu][iv + 1]))
                bm.faces.new((grid_back[iu][iv + 1], grid_back[iu + 1][iv + 1], grid_back[iu + 1][iv], grid_back[iu][iv]))
        for iu in range(nu):
            bm.faces.new((grid_front[iu][0], grid_back[iu][0], grid_back[iu + 1][0], grid_front[iu + 1][0]))
            bm.faces.new((grid_front[iu + 1][nv], grid_back[iu + 1][nv], grid_back[iu][nv], grid_front[iu][nv]))
        for iv in range(nv):
            bm.faces.new((grid_front[0][iv], grid_front[0][iv + 1], grid_back[0][iv + 1], grid_back[0][iv]))
            bm.faces.new((grid_back[nu][iv], grid_back[nu][iv + 1], grid_front[nu][iv + 1], grid_front[nu][iv]))

        bm.normal_update()
        bm.to_mesh(mesh)
        bm.free()
        apply_box_uv(obj, uv_scale=0.8)
        set_smooth(obj)
        objs.append(obj)
    return objs[0]


def make_share(name, mat, parent=None):
    """Rella triangular afuada i emmotllada de ferro forjat."""
    mesh = bpy.data.meshes.new(name + "_Mesh")
    obj = bpy.data.objects.new(name, mesh)
    link_obj(obj)
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent

    bm = bmesh.new()
    z0, z1 = 0.18, 0.24
    pts = [(0.64, -0.02, z0), (0.20, 0.04, z0), (0.20, -0.28, z0)]
    pts_top = [(0.64, -0.02, z0 + 0.014), (0.20, 0.04, z1), (0.20, -0.28, z1 - 0.01)]
    vb = [bm.verts.new(p) for p in pts]
    vt = [bm.verts.new(p) for p in pts_top]
    bm.faces.new((vt[0], vt[1], vt[2]))
    bm.faces.new((vb[2], vb[1], vb[0]))
    for i in range(3):
        j = (i + 1) % 3
        bm.faces.new((vb[i], vb[j], vt[j], vt[i]))
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    apply_box_uv(obj, uv_scale=0.8)
    set_smooth(obj)
    return obj


def build_arada(animate=True):
    clear_scene()

    p_wood = build_pbr_pair("WoodArd", "wood", 512, 512, bump_scale=1.8)
    p_iron = build_pbr_pair("IronArd", "castiron", 512, 512, bump_scale=2.0)
    p_soil = build_pbr_pair("SoilArd", "soil", 512, 512, bump_scale=2.8)

    m_wood = make_mat("FustaRoure", "#7e562e", metallic=0.0, roughness=0.73, pbr_pair=p_wood)
    m_wood_d = make_mat("FustaFosca", "#4e3218", metallic=0.0, roughness=0.77, pbr_pair=p_wood)
    m_iron = make_mat("FerroForjat", "#2d3238", metallic=0.86, roughness=0.42, pbr_pair=p_iron)
    m_steel = make_mat("FerroPolit", "#b5bec8", metallic=0.94, roughness=0.20)
    m_soil = make_mat("TerraCamp", "#5a4128", metallic=0.0, roughness=0.92, pbr_pair=p_soil, tex_scale=(2.6, 2.2))
    m_soil_fresh = make_mat("TerraGleb", "#3f2917", metallic=0.0, roughness=0.94, pbr_pair=p_soil, tex_scale=(1.8, 1.8))
    m_plinth = make_mat("SocolArada", "#23211f", metallic=0.05, roughness=0.82)

    add_shadow_floor(z=0.0, size=12.0)

    # 1. BASE DE TERRA LLAURADA EN RELLEU REAL SOBRE SÒCOL
    make_box("SocolArada", (4.12, 2.02, 0.08), (0.0, 0.0, 0.04), m_plinth, bevel=0.015)
    make_furrow_bed(
        "SolcsArada",
        (0.0, 0.0),
        4.0,
        1.90,
        0.10,
        m_soil,
        furrows=5,
        amp=0.052,
        unploughed_x=0.58,
        nx=56,
        ny=40,
        seed=41,
    )
    # Cordó de terra fresca recent bolcada al costat esquerre del solc
    for cx in (-1.35, -0.82, -0.35):
        make_coal_pile(f"CordoGleb_{cx:.2f}", (cx, -0.44, 0.14), 0.30, 0.16, 0.13, m_soil_fresh, count=18, seed=int(abs(cx) * 100))

    # 2. CONJUNT DE L'ARADA DE ROTHERHAM
    g_arada = add_empty("AradaRotherham", (0.0, 0.0, 0.0))

    # Cama (biga corbada autèntica, més gruixuda al centre i afilada als extrems)
    pts_cama = [
        (-0.68, 0.0, 0.84),
        (-0.15, 0.0, 0.82),
        (0.45, 0.0, 0.78),
        (1.05, 0.0, 0.72),
        (1.56, 0.0, 0.68),
    ]
    make_curve_tube("CamaPrincipal", pts_cama, 0.048, m_wood, parent=g_arada)

    # Regulador dentat d'enganxall + cadena de tir frontal
    make_box("BridaEnganxall", (0.14, 0.095, 0.22), (1.55, 0.0, 0.67), m_iron, parent=g_arada, bevel=0.005)
    for lx in range(4):
        make_torus(
            f"BaulaCadena_{lx}",
            0.036,
            0.008,
            (1.64 + lx * 0.052, 0.0, 0.67 - lx * 0.006),
            m_steel,
            rot=(math.pi * 0.5 * (lx % 2), math.pi / 2, 0),
            parent=g_arada,
        )

    # Bastidor triangular: rella inferior d'arrossegament i muntants reforçats amb perns
    make_box("SolaLliscament", (1.02, 0.072, 0.072), (-0.22, 0.0, 0.21), m_iron, parent=g_arada, bevel=0.006)
    make_rod_between("MuntantDavant", (0.20, 0.0, 0.79), (0.14, 0.0, 0.23), 0.038, m_wood_d, parent=g_arada)
    make_rod_between("MuntantDarrera", (-0.64, 0.0, 0.84), (-0.68, 0.0, 0.23), 0.042, m_wood_d, parent=g_arada)
    make_box("AbrazaderaPost", (0.12, 0.11, 0.12), (-0.65, 0.0, 0.84), m_iron, parent=g_arada, bevel=0.004)

    # Ganivet vertical afilat (coulter) subjectat a la cama amb brida i falca
    make_box("GanivetFulla", (0.095, 0.020, 0.68), (0.64, -0.01, 0.55), m_steel, rot=(0, 0.22, 0), parent=g_arada, bevel=0.004)
    make_box("BridaGanivet", (0.13, 0.115, 0.13), (0.68, 0.0, 0.75), m_iron, parent=g_arada, bevel=0.004)

    # Rella triangular + Orelló helicoïdal bicapa (roure + xapa de ferro) + reblons
    make_share("RellaFerro", m_steel, parent=g_arada)
    make_mouldboard("OrelloFerro", m_steel, m_wood_d, parent=g_arada)

    # Dues esteves corbades amb tirants i mànecs tornejats
    make_curve_tube("EstevaEsq", [(-0.64, 0.02, 0.84), (-1.12, 0.15, 0.96), (-1.62, 0.24, 1.14)], 0.028, m_wood, parent=g_arada)
    make_curve_tube("EstevaDreta", [(-0.64, -0.04, 0.78), (-1.12, -0.15, 0.94), (-1.62, -0.24, 1.14)], 0.028, m_wood, parent=g_arada)
    make_cyl("ManecEsq", 0.036, 0.20, (-1.69, 0.25, 1.16), m_wood_d, rot=(0, 1.28, 0), parent=g_arada, bevel=0.006)
    make_cyl("ManecDret", 0.036, 0.20, (-1.69, -0.25, 1.16), m_wood_d, rot=(0, 1.28, 0), parent=g_arada, bevel=0.006)
    make_rod_between("TravesserEst", (-1.18, 0.16, 0.97), (-1.18, -0.16, 0.96), 0.022, m_wood_d, parent=g_arada)

    # Gleves orgàniques animades que pugen i s'enrotllen sobre l'orelló
    gleves = []
    for k in range(3):
        gg = add_empty(f"GlebaAnim_{k}", (0.35, -0.10, 0.24))
        make_coal_pile(f"GlebaCos_{k}", (0.0, 0.0, -0.05), 0.17, 0.13, 0.11, m_soil_fresh, count=14, seed=50 + k, parent=gg)
        gleves.append(gg)

    # 3. LLAURADOR A ESCALA DARRERE LES ESTEVES (costat oposat a la càmera)
    worker = make_worker("Llaurador", (-1.82, 0.36, 0.12), facing_yaw=-math.pi * 0.44, scale=0.95, role="spinner")

    def apply_pose(p):
        theta = 2.0 * math.pi * p
        g_arada.location = (0.0, 0.0, 0.010 * math.sin(theta * 2.0))
        g_arada.rotation_euler = (0.015 * math.sin(theta), 0.010 * math.cos(theta * 2.0), 0.0)
        for k, gg in enumerate(gleves):
            u = (p + k / 3.0) % 1.0
            gx = 0.50 - 1.12 * u
            gy = -0.06 - 0.38 * (u ** 1.22)
            gz = 0.22 + 0.14 * math.sin(u * math.pi)
            gg.location = (gx, gy, gz)
            gg.rotation_euler = (-2.6 * u, 0.18 * math.sin(u * math.pi), 0.0)
        sway = math.sin(theta * 2.0)
        set_worker_pose(
            worker,
            torso_rot=(0.16, 0.0, -0.10 + 0.05 * sway),
            head_rot=(-0.10, 0.0, -0.08),
            r_sh=(0.66, -0.08, -0.16),
            r_elb=(-0.50, 0.0, 0.0),
            l_sh=(0.64, 0.08, 0.10),
            l_elb=(-0.48, 0.0, 0.0),
            r_hip=(-0.22 * sway, 0.0, 0.0),
            l_hip=(0.22 * sway, 0.0, 0.0),
        )

    if animate:
        scene = bpy.context.scene
        scene.frame_start = 1
        scene.frame_end = 60
        worker_objs = [worker["torso"], worker["head"], worker["l_sh"], worker["l_elb"], worker["r_sh"], worker["r_elb"], worker["l_hip"], worker["r_hip"]]
        anim_objs = [g_arada] + gleves + worker_objs
        for fr in range(1, 61):
            p = (fr - 1) / 60.0
            apply_pose(p)
            for o in anim_objs:
                o.keyframe_insert(data_path="location", frame=fr)
                o.keyframe_insert(data_path="rotation_euler", frame=fr)
        set_linear_fcurves(anim_objs)
        scene.frame_set(16)
    else:
        apply_pose(0.25)

    cam_loc = (1.92, -3.58, 1.88)
    target = (-0.08, -0.08, 0.62)
    setup_lighting(cam_loc, target, lens=42.0, mood="workshop")

    anchors = {
        "cama": (0.45, -0.06, 0.80),
        "ganivet": (0.64, -0.06, 0.55),
        "rella": (0.44, -0.14, 0.22),
        "orello": (-0.08, -0.26, 0.36),
        "esteves": (-1.45, -0.22, 1.08),
    }

    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
    render_image(os.path.join(out_dir, "arada-muntada.png"), res_x=1200, res_y=760, samples=32)
    render_closeup(os.path.join(out_dir, "arada-detall.png"), (0.72, -1.78, 0.96), (0.14, -0.14, 0.36), lens=48.0, samples=28)

    proj = project_anchors(anchors)
    export_glb_and_meta("arada", "arada.glb", anchors, extra_meta={"proj_2d": proj})


if __name__ == "__main__":
    build_arada(animate=True)

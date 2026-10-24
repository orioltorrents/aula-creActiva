"""
Pipeta Pasteur de plàstic (LDPE) — 3 mL, 155 mm.

    blender --background --factory-startup --python crear-pipeta-pasteur_3mL.py

Genera, dins la carpeta d'aquest script:
    pipeta-pasteur_3mL.blend   model + estudi separat
    pipeta-pasteur_3mL.glb     només MODEL, amb extras
    pipeta-pasteur_3mL.png     vista prèvia

Tub capil·lar amb bulb de succió i punta cònica. Sense graduació.
Origen a la punta, a z = 0.
"""
import bpy
import bmesh
import json
import math
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent
VARIANT_ID = "pipeta-pasteur_3mL"
TOOL_ID = "pipeta-pasteur"
BLEND = HERE / (VARIANT_ID + ".blend")
GLB = HERE / (VARIANT_ID + ".glb")
PNG = HERE / (VARIANT_ID + ".png")
HERE.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 1. PARÀMETRES (metres)
# ─────────────────────────────────────────────────────────────────────────────
H = 0.1550          # llargada total
R_BULB = 0.0080     # radi màxim del bulb (Ø 16)
R_TUB = 0.0036      # radi exterior del tub (Ø 7,2)
R_PUNTA = 0.0007    # radi exterior de la punta
R_FORAT = 0.00035   # radi del forat de la punta (Ø 0,7)
SEG = 48

# Perfils (z mm, r mm), de la punta cap amunt
PTS_O = [(0.0, 0.70), (5.0, 0.95), (12.0, 1.60), (20.0, 2.50), (30.0, 3.60),
         (95.0, 3.60), (100.0, 4.60), (105.0, 6.20), (110.0, 7.40),
         (113.0, 7.90), (138.0, 7.90), (142.0, 7.30), (147.0, 5.50),
         (151.0, 3.00), (153.5, 1.50), (155.0, 0.00)]
PTS_I = [(0.0, 0.35), (5.0, 0.55), (12.0, 1.10), (20.0, 2.00), (30.0, 3.00),
         (95.0, 3.00), (105.0, 5.40), (113.0, 7.10), (138.0, 7.10),
         (142.0, 6.60), (147.0, 4.80), (151.0, 2.40), (154.2, 0.00)]


def catmull(pts, z):
    if z <= pts[0][0]:
        return pts[0][1]
    if z >= pts[-1][0]:
        return pts[-1][1]
    i = max(j for j in range(len(pts) - 1) if pts[j][0] <= z)
    p0 = pts[max(i - 1, 0)]
    p1, p2 = pts[i], pts[i + 1]
    p3 = pts[min(i + 2, len(pts) - 1)]
    t = (z - p1[0]) / (p2[0] - p1[0])
    m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * (p2[0] - p1[0])
    m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * (p2[0] - p1[0])
    t2, t3 = t * t, t * t * t
    return ((2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 +
            (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2)


# ─────────────────────────────────────────────────────────────────────────────
# 2. ESCENA NETA
# ─────────────────────────────────────────────────────────────────────────────
scene = bpy.data.scenes.new("PIPETA-PASTEUR_3mL · model")
bpy.context.window.scene = scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

for _s in list(bpy.data.scenes):
    if _s is not scene:
        bpy.data.scenes.remove(_s)
for _o in list(bpy.data.objects):
    bpy.data.objects.remove(_o, do_unlink=True)
for _me in list(bpy.data.meshes):
    bpy.data.meshes.remove(_me)
for _ma in list(bpy.data.materials):
    bpy.data.materials.remove(_ma)

model = bpy.data.collections.new("PIPETA-PASTEUR_3mL · model")
estudi = bpy.data.collections.new("ESTUDI · camera i llums")
scene.collection.children.link(model)
scene.collection.children.link(estudi)


def OB(name, data, col=model):
    ob = bpy.data.objects.new(name, data)
    col.objects.link(ob)
    return ob


# ─────────────────────────────────────────────────────────────────────────────
# 3. GEOMETRIA: exterior de dalt a baix + punta + interior de baix a dalt
# ─────────────────────────────────────────────────────────────────────────────
zs = [i * 1.5 for i in range(0, 104)]          # 0 .. 154.5 mm
exterior = [(catmull(PTS_O, z), z) for z in reversed(zs)]
interior = [(catmull(PTS_I, z), z) for z in zs]
perfil = [(0.0, 155.0)] + exterior + interior + [(0.0, 154.2)]   # els dos pols del bulb

verts, faces, starts, lens = [], [], [], []
for r_mm, z_mm in perfil:
    r, z = r_mm / 1000.0, z_mm / 1000.0
    n = 1 if r <= 1e-9 else SEG
    starts.append(len(verts))
    lens.append(n)
    for i in range(n):
        th = 2 * math.pi * i / SEG
        verts.append((r * math.cos(th), r * math.sin(th), z))
for j in range(len(perfil) - 1):
    a, na = starts[j], lens[j]
    b, nb = starts[j + 1], lens[j + 1]
    for i in range(SEG):
        k = (i + 1) % SEG
        if na == 1 and nb == 1:
            continue
        if na == 1:
            faces.append((a, b + i, b + k))
        elif nb == 1:
            faces.append((a + i, a + k, b))
        else:
            faces.append((a + i, a + k, b + k, b + i))

me = bpy.data.meshes.new("pipeta_malla")
me.from_pydata(verts, [], faces)
me.update()
bm = bmesh.new()
bm.from_mesh(me)
bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=1e-7)
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
bm.to_mesh(me)
bm.free()
for f in me.polygons:
    f.use_smooth = True

# ─────────────────────────────────────────────────────────────────────────────
# 4. OBJECTES I MATERIAL
# ─────────────────────────────────────────────────────────────────────────────
root = OB(VARIANT_ID, None)
root.empty_display_type = 'PLAIN_AXES'
root.empty_display_size = 0.02

mesh_obj = OB("TOOL_pipeta_pasteur", me)
mesh_obj.parent = root

mat = bpy.data.materials.new("LDPE translúcid")
mat.use_nodes = True
bsdf = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
bsdf.inputs['Base Color'].default_value = (0.86, 0.89, 0.92, 1.0)
bsdf.inputs['Roughness'].default_value = 0.25
bsdf.inputs['Metallic'].default_value = 0.0
bsdf.inputs['Alpha'].default_value = 0.55
for nom in ('Specular IOR Level', 'Specular'):
    if nom in bsdf.inputs:
        bsdf.inputs[nom].default_value = 0.5
        break
mat.surface_render_method = 'BLENDED'
mat.blend_method = 'BLEND'
mat.use_backface_culling = False
mesh_obj.data.materials.append(mat)

bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# ─────────────────────────────────────────────────────────────────────────────
# 5. METADADES
# ─────────────────────────────────────────────────────────────────────────────
METADADES = {
    "tool_id": TOOL_ID,
    "variant_id": VARIANT_ID,
    "label_ca": "Pipeta Pasteur de plàstic de 3 mL",
    "display_name": "Pipeta Pasteur de plàstic",
    "category": "manipulacio",
    "capacity_ml": 3,
    "material_type": "plastic",
    "graduation_type": "none",
    "usage_tags": ["transfer-small-volumes", "drop-liquid", "sample"],
    "measurement_note_ca": (
        "No té escala: els 3 mL són la capacitat nominal del bulb, no un "
        "volum que es pugui mesurar. Per mesurar, cal una pipeta graduada."
    ),
}
for k, v in METADADES.items():
    root[k] = v
    mesh_obj[k] = v
root["tipus"] = "pipeta pasteur"
root["unitats"] = "metres"
root["llargada_mm"] = 155.0
root["diametre_bulb_mm"] = 16.0
root["diametre_tub_mm"] = 7.2
root["diametre_punta_mm"] = 1.4
root["material"] = "LDPE"
mesh_obj["tipus"] = "pipeta pasteur"
mesh_obj["unitats"] = "metres"

# ─────────────────────────────────────────────────────────────────────────────
# 6. ESTUDI
# ─────────────────────────────────────────────────────────────────────────────
def MAT_FONS(name, color, rough=0.6):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    return m


mat_fons = MAT_FONS("Fons · blau clar", (0.30, 0.45, 0.62))
v = [(-0.5, -0.5, 0.0), (0.5, -0.5, 0.0), (0.5, 0.5, 0.0), (-0.5, 0.5, 0.0)]
me_f = bpy.data.meshes.new("Superficie_malla")
me_f.from_pydata(v, [], [(0, 1, 2, 3)])
me_f.update()
terra = OB("Superficie_estudi", me_f, estudi)
terra.data.materials.append(mat_fons)

world = bpy.data.worlds.new("Ambient")
world.use_nodes = True
scene.world = world
bgn = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bgn.inputs[0].default_value = (0.34, 0.50, 0.70, 1)
bgn.inputs[1].default_value = 0.65


def aim(ob, at):
    ob.rotation_euler = (Vector(at) - ob.location).to_track_quat('-Z', 'Y').to_euler()


def area(name, loc, power, size):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy, ld.shape = power, 'RECTANGLE'
    ld.size, ld.size_y = size, size
    ob = OB(name, ld, estudi)
    ob.location = loc
    aim(ob, (0, 0, 0.07))


area("Softbox_esquerra", (-0.26, -0.24, 0.38), 12, 0.22)
area("Softbox_dreta", (0.28, -0.18, 0.28), 8, 0.26)
area("Softbox_superior", (0.02, 0.10, 0.44), 10, 0.26)

cam_data = bpy.data.cameras.new("Camera")
cam = OB("Camera_presentacio", cam_data, estudi)
cam_data.lens = 55
cam_data.clip_start = .001
cam_data.clip_end = 2
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 0.190
cam.location = (0.0, -0.40, 0.078)
aim(cam, (0.0, 0.0, 0.078))
scene.camera = cam

# ─────────────────────────────────────────────────────────────────────────────
# 7. RENDER, DESAR I EXPORTAR
# ─────────────────────────────────────────────────────────────────────────────
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 96
scene.cycles.use_denoising = True
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x, scene.render.resolution_y = 900, 900
scene.render.resolution_percentage = 100
scene.view_settings.exposure = -0.25
scene.view_settings.look = 'AgX - Medium High Contrast'

bpy.ops.wm.save_as_mainfile(filepath=str(BLEND), compress=True)
print("BLEND", BLEND)

bpy.ops.object.select_all(action='DESELECT')
for ob in model.objects:
    ob.select_set(True)
bpy.context.view_layer.objects.active = root
bpy.ops.export_scene.gltf(
    filepath=str(GLB), export_format='GLB', use_selection=True,
    use_active_scene=True, export_extras=True, export_animations=False,
    export_cameras=False, export_lights=False, export_apply=True,
)
print("GLB", GLB)

# foto: la pipeta tombada en diagonal, com a la imatge de referència
mesh_obj.rotation_euler = (0.0, math.radians(52.0), 0.0)
bpy.context.view_layer.update()
bb = [mesh_obj.matrix_world @ Vector(c) for c in mesh_obj.bound_box]
zmin = min(x.z for x in bb)
mesh_obj.location = (0.0, 0.0, -zmin)
bb = [mesh_obj.matrix_world @ Vector(c) for c in mesh_obj.bound_box]
cx = (min(v.x for v in bb) + max(v.x for v in bb)) / 2
cz = (min(v.z for v in bb) + max(v.z for v in bb)) / 2
ample = max(max(v.x for v in bb) - min(v.x for v in bb),
            max(v.z for v in bb) - min(v.z for v in bb))
cam_data.type = 'PERSP'
cam_data.lens = 60
cam.location = (cx + ample * 0.15, -ample * 2.4, cz + ample * 0.35)
aim(cam, (cx, 0.0, cz))
scene.render.resolution_x, scene.render.resolution_y = 900, 760

scene.render.filepath = str(PNG)
bpy.ops.render.render(write_still=True)
print("PNG", PNG)

# ─────────────────────────────────────────────────────────────────────────────
# 8. QA
# ─────────────────────────────────────────────────────────────────────────────
bm = bmesh.new()
bm.from_mesh(mesh_obj.data)
qa = {
    "vertexs": len(bm.verts),
    "cares": len(bm.faces),
    "no_manifold": sum(1 for e in bm.edges if not e.is_manifold),
    "dims_mm": [round(d * 1000, 1) for d in mesh_obj.dimensions],
}
bm.free()
print("QA_BEGIN")
print(json.dumps({"asset": VARIANT_ID, "blender": bpy.app.version_string,
                  "qa": qa, "metadades": METADADES}, indent=1, ensure_ascii=False))
print("QA_END")
print("DONE", HERE)

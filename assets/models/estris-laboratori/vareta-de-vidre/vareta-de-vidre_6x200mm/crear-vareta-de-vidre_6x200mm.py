"""
Vareta de vidre per remenar — generació del paquet web.

    blender --background --factory-startup --python crear-vareta-de-vidre_6x200mm.py

Genera, dins la carpeta d'aquest script:
    vareta-de-vidre_6x200mm.blend   model + estudi separat
    vareta-de-vidre_6x200mm.glb     només MODEL, amb extras
    vareta-de-vidre_6x200mm.png     vista prèvia

Càpsula de vidre de 6 × 200 mm: cilindre amb els dos caps semisfèrics
(vores flamejades). Origen a la punta inferior, z = 0.
"""
import bpy
import bmesh
import json
import math
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent
VARIANT_ID = "vareta-de-vidre_6x200mm"
TOOL_ID = "vareta-de-vidre"
BLEND = HERE / (VARIANT_ID + ".blend")
GLB = HERE / (VARIANT_ID + ".glb")
PNG = HERE / (VARIANT_ID + ".png")
HERE.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 1. PARÀMETRES (metres)
# ─────────────────────────────────────────────────────────────────────────────
R = 0.0030          # radi: Ø 6 mm
L = 0.2000          # llargada total
SEG = 32            # segments de la circumferència
CAP = 8             # anells de cada cap semisfèric

# ─────────────────────────────────────────────────────────────────────────────
# 2. ESCENA NETA
# ─────────────────────────────────────────────────────────────────────────────
scene = bpy.data.scenes.new("VARETA-DE-VIDRE_6x200mm · model")
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

model = bpy.data.collections.new("VARETA-DE-VIDRE_6x200mm · model")
estudi = bpy.data.collections.new("ESTUDI · camera i llums")
scene.collection.children.link(model)
scene.collection.children.link(estudi)


def OB(name, data, col=model):
    ob = bpy.data.objects.new(name, data)
    col.objects.link(ob)
    return ob


# ─────────────────────────────────────────────────────────────────────────────
# 3. GEOMETRIA: perfil de revolució d'una càpsula
# ─────────────────────────────────────────────────────────────────────────────
perfil = []
for i in range(CAP + 1):
    phi = -math.pi / 2 + (math.pi / 2) * i / CAP
    perfil.append((R * math.cos(phi), R + R * math.sin(phi)))
for i in range(CAP + 1):
    phi = (math.pi / 2) * i / CAP
    perfil.append((R * math.cos(phi), (L - R) + R * math.sin(phi)))

verts, faces, starts, lens = [], [], [], []
for r, z in perfil:
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

me = bpy.data.meshes.new("vareta_vidre_malla")
me.from_pydata(verts, [], faces)
me.update()
bm = bmesh.new()
bm.from_mesh(me)
bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=1e-7)
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
bm.to_mesh(me)
bm.free()
for p in me.polygons:
    p.use_smooth = True

# ─────────────────────────────────────────────────────────────────────────────
# 4. OBJECTES I MATERIAL
# ─────────────────────────────────────────────────────────────────────────────
root = OB(VARIANT_ID, None)
root.empty_display_type = 'PLAIN_AXES'
root.empty_display_size = 0.03

mesh_obj = OB("TOOL_vareta_vidre", me)
mesh_obj.parent = root

mat = bpy.data.materials.new("Vidre de borosilicat")
mat.use_nodes = True
bsdf = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
bsdf.inputs['Base Color'].default_value = (0.96, 0.98, 1.0, 1.0)
bsdf.inputs['Roughness'].default_value = 0.05
bsdf.inputs['Metallic'].default_value = 0.0
bsdf.inputs['Transmission Weight'].default_value = 1.0
bsdf.inputs['IOR'].default_value = 1.45
for nom in ('Specular IOR Level', 'Specular'):
    if nom in bsdf.inputs:
        bsdf.inputs[nom].default_value = 0.5
        break
mat.surface_render_method = 'DITHERED'
mesh_obj.data.materials.append(mat)

# ─────────────────────────────────────────────────────────────────────────────
# 5. METADADES
# ─────────────────────────────────────────────────────────────────────────────
METADADES = {
    "tool_id": TOOL_ID,
    "variant_id": VARIANT_ID,
    "label_ca": "Vareta de vidre per remenar (6 × 200 mm)",
    "display_name": "Vareta de vidre per remenar",
    "category": "manipulacio",
    "capacity_ml": 0,
    "material_type": "vidre",
    "graduation_type": "none",
    "usage_tags": ["stir", "mix", "guide-liquid"],
    "measurement_note_ca": (
        "No mesura res: no té cap graduació. Serveix per remenar i per fer "
        "córrer un líquid per la paret del got."
    ),
}
for k, v in METADADES.items():
    root[k] = v
    mesh_obj[k] = v
root["tipus"] = "vareta de vidre"
root["unitats"] = "metres"
root["diametre_mm"] = 6.0
root["llargada_mm"] = 200.0
root["material"] = "borosilicat 3.3"
mesh_obj["tipus"] = "vareta de vidre"
mesh_obj["unitats"] = "metres"

# ─────────────────────────────────────────────────────────────────────────────
# 6. ESTUDI (fosca: una vareta transparent sobre blanc no es veu)
# ─────────────────────────────────────────────────────────────────────────────
def MAT_FONS(name, color, rough=0.55):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    return m


mat_fons = MAT_FONS("Fons · blau fosc", (0.03, 0.045, 0.06))

v = [(-0.75, -0.75, 0.0), (0.75, -0.75, 0.0), (0.75, 0.75, 0.0), (-0.75, 0.75, 0.0)]
me_f = bpy.data.meshes.new("Superficie_malla")
me_f.from_pydata(v, [], [(0, 1, 2, 3)])
me_f.update()
terra = OB("Superficie_estudi", me_f, estudi)
terra.data.materials.append(mat_fons)

world = bpy.data.worlds.new("Ambient")
world.use_nodes = True
scene.world = world
bgn = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bgn.inputs[0].default_value = (0.06, 0.09, 0.13, 1)
bgn.inputs[1].default_value = 1.0


def aim(ob, at):
    ob.rotation_euler = (Vector(at) - ob.location).to_track_quat('-Z', 'Y').to_euler()


def area(name, loc, power, size):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy, ld.shape = power, 'RECTANGLE'
    ld.size, ld.size_y = size, size
    ob = OB(name, ld, estudi)
    ob.location = loc
    aim(ob, (0, 0, 0.10))


area("Softbox_esquerra", (-0.22, -0.18, 0.42), 16, 0.25)
area("Softbox_dreta", (0.30, -0.15, 0.30), 9, 0.30)
area("Rim_darrere", (0.05, 0.35, 0.35), 14, 0.20)

cam_data = bpy.data.cameras.new("Camera")
cam = OB("Camera_presentacio", cam_data, estudi)
cam_data.lens = 50
cam_data.clip_start = .001
cam_data.clip_end = 2
cam.location = (0.150, -0.420, 0.120)
aim(cam, (0.0, 0.0, 0.100))
scene.camera = cam

# ─────────────────────────────────────────────────────────────────────────────
# 7. RENDER, DESAR I EXPORTAR
# ─────────────────────────────────────────────────────────────────────────────
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 96
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 16
scene.cycles.transmission_bounces = 16
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x, scene.render.resolution_y = 700, 900
scene.render.resolution_percentage = 100
scene.view_settings.exposure = 0.0
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

# La foto es fa amb la vareta tombada (com a les imatges de referència): dreta,
# un cilindre de 6 mm en un marc vertical no es llegeix. Això passa DESPRÉS de
# desar i exportar, així que el .blend i el .glb conserven l'origen a la punta.
mesh_obj.rotation_euler = (0.0, math.pi / 2, 0.0)
mesh_obj.location = (-0.100, 0.0, 0.0031)
cam_data.lens = 55
cam.location = (0.055, -0.285, 0.185)
aim(cam, (0.0, 0.0, 0.004))
scene.render.resolution_x, scene.render.resolution_y = 900, 620

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
    "volum_cm3": round(bm.calc_volume(signed=False) * 1e6, 3),
    "dims_mm": [round(d * 1000, 1) for d in mesh_obj.dimensions],
}
bm.free()
print("QA_BEGIN")
print(json.dumps({"asset": VARIANT_ID, "blender": bpy.app.version_string,
                  "qa": qa, "metadades": METADADES}, indent=1, ensure_ascii=False))
print("QA_END")
print("DONE", HERE)

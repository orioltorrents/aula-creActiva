"""
Espàtula de laboratori amb cullereta — 200 mm, acer inoxidable.

    blender --background --factory-startup --python crear-espatula_200mm.py

Genera, dins la carpeta d'aquest script:
    espatula_200mm.blend   model + estudi separat
    espatula_200mm.glb     només MODEL, amb extras
    espatula_200mm.png     vista prèvia

Cullereta ovalada en un extrem, mànec pla i pala plana a l'altre.
Origen al punt més baix (fons de la cullereta), a z = 0.
"""
import bpy
import bmesh
import json
import math
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent
VARIANT_ID = "espatula_200mm"
TOOL_ID = "espatula"
BLEND = HERE / (VARIANT_ID + ".blend")
GLB = HERE / (VARIANT_ID + ".glb")
PNG = HERE / (VARIANT_ID + ".png")
HERE.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 1. PARÀMETRES (metres)
# ─────────────────────────────────────────────────────────────────────────────
LARGADA = 0.200        # de punta a punta
GRUIX = 0.0012         # gruix de la xapa
RX, RY, FOND = 0.0160, 0.0122, 0.0075   # cullereta: semieixos i fondària
PARET = 0.0007         # gruix del vidre... de la xapa de la cullereta
X_CULLERA = -0.0840    # centre de la cullereta
Z_XAPA = 0.0042        # cara inferior de la xapa plana
SEG = 48
ANELLS = 10

# ─────────────────────────────────────────────────────────────────────────────
# 2. ESCENA NETA
# ─────────────────────────────────────────────────────────────────────────────
scene = bpy.data.scenes.new("ESPATULA_200mm · model")
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

model = bpy.data.collections.new("ESPATULA_200mm · model")
estudi = bpy.data.collections.new("ESTUDI · camera i llums")
scene.collection.children.link(model)
scene.collection.children.link(estudi)


def OB(name, data, col=model):
    ob = bpy.data.objects.new(name, data)
    col.objects.link(ob)
    return ob


MAT = bpy.data.materials.new("Acer inoxidable")
MAT.use_nodes = True
_p = next(n for n in MAT.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
_p.inputs['Base Color'].default_value = (0.72, 0.74, 0.77, 1.0)
_p.inputs['Metallic'].default_value = 1.0
_p.inputs['Roughness'].default_value = 0.22

# ─────────────────────────────────────────────────────────────────────────────
# 3. CULLERETA: paraboloide el·líptic + Solidify
# ─────────────────────────────────────────────────────────────────────────────
verts, faces = [], []
verts.append((0.0, 0.0, 0.0))
for j in range(1, ANELLS + 1):
    t = j / ANELLS
    for i in range(SEG):
        th = 2 * math.pi * i / SEG
        verts.append((RX * t * math.cos(th), RY * t * math.sin(th), FOND * t * t))
for i in range(SEG):                       # ventall central
    k = (i + 1) % SEG
    faces.append((0, 1 + i, 1 + k))
for j in range(ANELLS - 1):                 # anells
    a = 1 + j * SEG
    b = 1 + (j + 1) * SEG
    for i in range(SEG):
        k = (i + 1) % SEG
        faces.append((a + i, b + i, b + k, a + k))

me_c = bpy.data.meshes.new("cullera_malla")
me_c.from_pydata(verts, [], faces)
me_c.update()
cullera = OB("Cullera", me_c)
cullera.data.materials.append(MAT)

mod = cullera.modifiers.new("gruix", 'SOLIDIFY')
mod.thickness = PARET
mod.offset = 1.0      # el gruix va cap amunt: el fons de la cullera queda a z = 0
bpy.context.view_layer.objects.active = cullera
bpy.ops.object.modifier_apply(modifier=mod.name)

# desplaçar al seu lloc i suavitzar
bm = bmesh.new()
bm.from_mesh(cullera.data)
bmesh.ops.translate(bm, verts=list(bm.verts), vec=(X_CULLERA, 0.0, 0.0))
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
bm.to_mesh(cullera.data)
bm.free()
for f in cullera.data.polygons:
    f.use_smooth = True

# ─────────────────────────────────────────────────────────────────────────────
# 4. MÀNEC + PALA: contorn pla extruït
# ─────────────────────────────────────────────────────────────────────────────
mig = [
    (-0.0720, 0.0034), (-0.0620, 0.0040), (-0.0300, 0.0046), (0.0200, 0.0042),
    (0.0340, 0.0075), (0.0420, 0.0125), (0.0900, 0.0128), (0.0970, 0.0118),
    (0.1000, 0.0085), (0.1000, 0.0000),
]
contorn = mig + [(x, -y) for (x, y) in reversed(mig[:-1])]

bm = bmesh.new()
vs = [bm.verts.new((x, y, Z_XAPA + GRUIX)) for (x, y) in contorn]
cara = bm.faces.new(vs)
res = bmesh.ops.extrude_face_region(bm, geom=[cara])
nous = [g for g in res['geom'] if isinstance(g, bmesh.types.BMVert)]
bmesh.ops.translate(bm, verts=nous, vec=(0.0, 0.0, -GRUIX))
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
me_x = bpy.data.meshes.new("xapa_malla")
bm.to_mesh(me_x)
bm.free()
xapa = OB("Xapa", me_x)
xapa.data.materials.append(MAT)

# ─────────────────────────────────────────────────────────────────────────────
# 5. UNIR-HO EN UN SOL OBJECTE
# ─────────────────────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='DESELECT')
cullera.select_set(True)
xapa.select_set(True)
bpy.context.view_layer.objects.active = xapa
bpy.ops.object.join()
mesh_obj = bpy.context.view_layer.objects.active
mesh_obj.name = "TOOL_espatula"
mesh_obj.data.name = "espatula_malla"

# ─────────────────────────────────────────────────────────────────────────────
# 6. ARREL I METADADES
# ─────────────────────────────────────────────────────────────────────────────
root = OB(VARIANT_ID, None)
root.empty_display_type = 'PLAIN_AXES'
root.empty_display_size = 0.03
mesh_obj.parent = root

bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
mesh_obj.location = (0.0, 0.0, 0.0)
mesh_obj.rotation_euler = (0.0, 0.0, 0.0)
mesh_obj.scale = (1.0, 1.0, 1.0)

METADADES = {
    "tool_id": TOOL_ID,
    "variant_id": VARIANT_ID,
    "label_ca": "Espàtula de laboratori amb cullereta (200 mm)",
    "display_name": "Espàtula amb cullereta",
    "category": "manipulacio",
    "capacity_ml": 0,
    "material_type": "metall",
    "graduation_type": "none",
    "usage_tags": ["take-solid", "scrape", "weigh-solid"],
    "measurement_note_ca": (
        "No mesura res: no té graduació. Serveix per agafar sòlids, "
        "raspar el fons dels recipients i carregar la balança."
    ),
}
for k, v in METADADES.items():
    root[k] = v
    mesh_obj[k] = v
root["tipus"] = "espatula"
root["unitats"] = "metres"
root["llargada_mm"] = 200.0
root["amplada_pala_mm"] = 25.6
root["cullera_mm"] = [32.0, 24.4, 7.5]
root["material"] = "acer inoxidable AISI 304"
mesh_obj["tipus"] = "espatula"
mesh_obj["unitats"] = "metres"

# ─────────────────────────────────────────────────────────────────────────────
# 7. ESTUDI
# ─────────────────────────────────────────────────────────────────────────────
def MAT_FONS(name, color, rough=0.6):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    return m


mat_fons = MAT_FONS("Fons · gris clar", (0.80, 0.81, 0.82))
v = [(-0.6, -0.6, 0.0), (0.6, -0.6, 0.0), (0.6, 0.6, 0.0), (-0.6, 0.6, 0.0)]
me_f = bpy.data.meshes.new("Superficie_malla")
me_f.from_pydata(v, [], [(0, 1, 2, 3)])
me_f.update()
terra = OB("Superficie_estudi", me_f, estudi)
terra.data.materials.append(mat_fons)

world = bpy.data.worlds.new("Ambient")
world.use_nodes = True
scene.world = world
bgn = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bgn.inputs[0].default_value = (0.82, 0.85, 0.88, 1)
bgn.inputs[1].default_value = 0.55


def aim(ob, at):
    ob.rotation_euler = (Vector(at) - ob.location).to_track_quat('-Z', 'Y').to_euler()


def area(name, loc, power, size, sy=1.0):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy, ld.shape = power, 'RECTANGLE'
    ld.size, ld.size_y = size, size * sy
    ob = OB(name, ld, estudi)
    ob.location = loc
    aim(ob, (0, 0, 0.005))


area("Softbox_esquerra", (-0.22, -0.20, 0.30), 12, 0.20)
area("Softbox_dreta", (0.24, -0.16, 0.24), 8, 0.24)
area("Softbox_superior", (0.02, 0.10, 0.34), 10, 0.26)

cam_data = bpy.data.cameras.new("Camera")
cam = OB("Camera_presentacio", cam_data, estudi)
cam_data.lens = 50
cam_data.clip_start = .001
cam_data.clip_end = 2
cam.location = (0.060, -0.300, 0.175)
aim(cam, (0.0, 0.0, 0.006))
scene.camera = cam

# ─────────────────────────────────────────────────────────────────────────────
# 8. RENDER, DESAR I EXPORTAR
# ─────────────────────────────────────────────────────────────────────────────
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 96
scene.cycles.use_denoising = True
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x, scene.render.resolution_y = 900, 620
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

scene.render.filepath = str(PNG)
bpy.ops.render.render(write_still=True)
print("PNG", PNG)

# ─────────────────────────────────────────────────────────────────────────────
# 9. QA
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

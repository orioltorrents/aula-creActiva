"""
Reixeta de laboratori amb centre ceràmic — 125 × 125 mm.

    blender --background --factory-startup --python crear-reixeta_125mm.py

Genera, dins la carpeta d'aquest script:
    reixeta_125mm.blend   model + estudi separat
    reixeta_125mm.glb     només MODEL, amb extras
    reixeta_125mm.png     vista prèvia

Trama de fil d'acer de 0,5 mm cada 2 mm i disc ceràmic de 65 mm al centre.
Els fils dels dos sentits van a altures diferents (0–0,5 i 0,5–1,0 mm):
així teixeixen de veritat i no comparteixen cap cara coplanar.
Origen al pla de la trama, a z = 0.
"""
import bpy
import bmesh
import json
import math
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent
VARIANT_ID = "reixeta_125mm"
TOOL_ID = "reixeta"
BLEND = HERE / (VARIANT_ID + ".blend")
GLB = HERE / (VARIANT_ID + ".glb")
PNG = HERE / (VARIANT_ID + ".png")
HERE.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 1. PARÀMETRES (metres)
# ─────────────────────────────────────────────────────────────────────────────
L = 0.125          # costat de la xapa
FIL = 0.0005       # diàmetre del fil
PAS = 0.0020       # separació entre fils
CER_R = 0.0325     # radi del disc ceràmic (Ø 65)
CER_H = 0.0013     # gruix del disc
SEG = 64

# ─────────────────────────────────────────────────────────────────────────────
# 2. ESCENA NETA
# ─────────────────────────────────────────────────────────────────────────────
scene = bpy.data.scenes.new("REIXETA_125mm · model")
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

model = bpy.data.collections.new("REIXETA_125mm · model")
estudi = bpy.data.collections.new("ESTUDI · camera i llums")
scene.collection.children.link(model)
scene.collection.children.link(estudi)


def OB(name, data, col=model):
    ob = bpy.data.objects.new(name, data)
    col.objects.link(ob)
    return ob


def mesh_from(name, V, F, smooth=False):
    me = bpy.data.meshes.new(name)
    me.from_pydata(V, [], F)
    me.update()
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(me)
    bm.free()
    for f in me.polygons:
        f.use_smooth = smooth
    return me


# ─────────────────────────────────────────────────────────────────────────────
# 3. TRAMA
# ─────────────────────────────────────────────────────────────────────────────
N = 63                       # fils per sentit (124 mm de trama)
pos = [-L / 2 + FIL + i * PAS for i in range(N)]

V, F = [], []


def box(x0, x1, y0, y1, z0, z1, V, F):
    b = len(V)
    for z in (z0, z1):
        for x, y in ((x0, y0), (x1, y0), (x1, y1), (x0, y1)):
            V.append((x, y, z))
    F.extend([(b + 0, b + 3, b + 2, b + 1), (b + 4, b + 5, b + 6, b + 7),
              (b + 0, b + 1, b + 5, b + 4), (b + 1, b + 2, b + 6, b + 5),
              (b + 2, b + 3, b + 7, b + 6), (b + 3, b + 0, b + 4, b + 7)])


h = L / 2 - FIL
for p in pos:                                    # fils en X (baixos)
    box(-h, h, p - FIL / 2, p + FIL / 2, 0.0, FIL, V, F)
for p in pos:                                    # fils en Y (alts)
    box(p - FIL / 2, p + FIL / 2, -h, h, FIL, 2 * FIL, V, F)

me_trama = mesh_from("reixeta_trama", V, F)

MAT_ACER = bpy.data.materials.new("Fil d'acer galvanitzat")
MAT_ACER.use_nodes = True
_pa = next(n for n in MAT_ACER.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
_pa.inputs['Base Color'].default_value = (0.66, 0.68, 0.71, 1.0)
_pa.inputs['Metallic'].default_value = 0.9
_pa.inputs['Roughness'].default_value = 0.35

trama = OB("Trama", me_trama)
trama.data.materials.append(MAT_ACER)

# ─────────────────────────────────────────────────────────────────────────────
# 4. DISC CERÀMIC (per sobre de la trama, sense tocar-la)
# ─────────────────────────────────────────────────────────────────────────────
Z0 = 2 * FIL + 0.00005
Vc, Fc = [], []
Vc.append((0.0, 0.0, Z0))
for i in range(SEG):
    th = 2 * math.pi * i / SEG
    Vc.append((CER_R * math.cos(th), CER_R * math.sin(th), Z0))
Vc.append((0.0, 0.0, Z0 + CER_H))
for i in range(SEG):
    th = 2 * math.pi * i / SEG
    Vc.append((CER_R * math.cos(th), CER_R * math.sin(th), Z0 + CER_H))
C_BAIX, R_BAIX = 0, 1                    # centre i anell inferiors
C_DALT = SEG + 1                         # centre superior
R_DALT = SEG + 2                         # primer vèrtex de l'anell superior
for i in range(SEG):
    k = (i + 1) % SEG
    Fc.append((C_BAIX, R_BAIX + i, R_BAIX + k))
    Fc.append((C_DALT, R_DALT + k, R_DALT + i))
for i in range(SEG):
    k = (i + 1) % SEG
    Fc.append((R_BAIX + i, R_BAIX + k, R_DALT + k, R_DALT + i))

me_cer = mesh_from("reixeta_ceramica", Vc, Fc, smooth=False)

MAT_CER = bpy.data.materials.new("Ceràmica blanca")
MAT_CER.use_nodes = True
_pc = next(n for n in MAT_CER.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
_pc.inputs['Base Color'].default_value = (0.90, 0.89, 0.85, 1.0)
_pc.inputs['Metallic'].default_value = 0.0
_pc.inputs['Roughness'].default_value = 0.75

cer = OB("Ceramica", me_cer)
cer.data.materials.append(MAT_CER)

# ─────────────────────────────────────────────────────────────────────────────
# 5. UNIR I ARREL
# ─────────────────────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='DESELECT')
trama.select_set(True)
cer.select_set(True)
bpy.context.view_layer.objects.active = trama
bpy.ops.object.join()
mesh_obj = bpy.context.view_layer.objects.active
mesh_obj.name = "TOOL_reixeta"
mesh_obj.data.name = "reixeta_malla"

root = OB(VARIANT_ID, None)
root.empty_display_type = 'PLAIN_AXES'
root.empty_display_size = 0.03
mesh_obj.parent = root

bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

METADADES = {
    "tool_id": TOOL_ID,
    "variant_id": VARIANT_ID,
    "label_ca": "Reixeta de laboratori amb centre ceràmic (125 mm)",
    "display_name": "Reixeta de laboratori",
    "category": "escalfament",
    "capacity_ml": 0,
    "material_type": "metall",
    "graduation_type": "none",
    "usage_tags": ["heat", "support-vessel", "protect-flame"],
    "measurement_note_ca": (
        "No mesura res. Reparteix la flama i protegeix el recipient de vidre "
        "quan s'escalfa sobre un trípode."
    ),
}
for k, v in METADADES.items():
    root[k] = v
    mesh_obj[k] = v
root["tipus"] = "reixeta"
root["unitats"] = "metres"
root["costat_mm"] = 125.0
root["ceramica_mm"] = 65.0
root["fil_mm"] = 0.5
root["pas_trama_mm"] = 2.0
root["material"] = "acer galvanitzat + ceràmica"
mesh_obj["tipus"] = "reixeta"
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


mat_fons = MAT_FONS("Fons · gris mitjà", (0.10, 0.105, 0.115))
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
bgn.inputs[0].default_value = (0.55, 0.60, 0.68, 1)
bgn.inputs[1].default_value = 0.45


def aim(ob, at):
    ob.rotation_euler = (Vector(at) - ob.location).to_track_quat('-Z', 'Y').to_euler()


def area(name, loc, power, size):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy, ld.shape = power, 'RECTANGLE'
    ld.size, ld.size_y = size, size
    ob = OB(name, ld, estudi)
    ob.location = loc
    aim(ob, (0, 0, 0.0))


area("Softbox_esquerra", (-0.26, -0.24, 0.36), 9, 0.24)
area("Softbox_dreta", (0.28, -0.18, 0.26), 6, 0.28)
area("Softbox_superior", (0.02, 0.12, 0.42), 7, 0.28)

cam_data = bpy.data.cameras.new("Camera")
cam = OB("Camera_presentacio", cam_data, estudi)
cam_data.lens = 55
cam_data.clip_start = .001
cam_data.clip_end = 2
cam.location = (0.105, -0.245, 0.275)
aim(cam, (0.0, 0.0, 0.001))
scene.camera = cam

# ─────────────────────────────────────────────────────────────────────────────
# 7. RENDER, DESAR I EXPORTAR
# ─────────────────────────────────────────────────────────────────────────────
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 96
scene.cycles.use_denoising = True
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x, scene.render.resolution_y = 1200, 1000
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

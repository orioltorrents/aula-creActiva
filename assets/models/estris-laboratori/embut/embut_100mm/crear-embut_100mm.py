"""
Embut de vidre de laboratori — boca Ø 100 mm, alçada 150 mm.

    blender --background --factory-startup --python crear-embut_100mm.py

Genera, dins la carpeta d'aquest script:
    embut_100mm.blend   model + estudi separat
    embut_100mm.glb     només MODEL, amb extras
    embut_100mm.png     vista prèvia

Con de 60° amb coll recte i punta bisellada. Vidre de borosilicat amb
transmissió (no alpha: en una paret d'1,2 mm l'alpha el faria desaparèixer).
Origen a la punta, a z = 0.
"""
import bpy
import bmesh
import json
import math
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent
VARIANT_ID = "embut_100mm"
TOOL_ID = "embut"
BLEND = HERE / (VARIANT_ID + ".blend")
GLB = HERE / (VARIANT_ID + ".glb")
PNG = HERE / (VARIANT_ID + ".png")
HERE.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 1. PARÀMETRES (metres)
# ─────────────────────────────────────────────────────────────────────────────
H = 0.150          # alçada total
R_RIM = 0.050      # radi de la boca (Ø 100)
R_STEM_O = 0.0050  # coll exterior (Ø 10)
R_STEM_I = 0.0036  # coll interior (Ø 7,2)
Z_STEM = 0.0725    # on acaba el con i comença el coll
Z_TIP = 0.0000
R_TIP_O = 0.0042
R_TIP_I = 0.0036
SEG = 64
PAS = 6            # subdivisions de cada tram recte

# ─────────────────────────────────────────────────────────────────────────────
# 2. ESCENA NETA
# ─────────────────────────────────────────────────────────────────────────────
scene = bpy.data.scenes.new("EMBUT_100mm · model")
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

model = bpy.data.collections.new("EMBUT_100mm · model")
estudi = bpy.data.collections.new("ESTUDI · camera i llums")
scene.collection.children.link(model)
scene.collection.children.link(estudi)


def OB(name, data, col=model):
    ob = bpy.data.objects.new(name, data)
    col.objects.link(ob)
    return ob


def tram(p, a, b, n):
    """Afegeix n punts entremig de a i b (exclou a, inclou b)."""
    for i in range(1, n + 1):
        t = i / n
        p.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))


def perfil():
    """Contorn tancat (r, z): exterior de dalt a baix, punta, i interior avall a dalt."""
    p = [(R_RIM + 0.0006, H)]                 # vora exterior superior
    tram(p, p[-1], (R_RIM + 0.0006, H - 0.0013), 1)
    tram(p, p[-1], (R_RIM, H - 0.0025), 1)
    tram(p, p[-1], (R_STEM_O + 0.0006, Z_STEM), PAS)     # con exterior
    tram(p, p[-1], (R_STEM_O, Z_STEM - 0.0010), 1)
    tram(p, p[-1], (R_STEM_O, 0.0050), PAS)              # coll exterior
    tram(p, p[-1], (R_TIP_O, Z_TIP), 1)                  # bisell de la punta
    tram(p, p[-1], (R_TIP_I, Z_TIP), 1)                  # gruix de la punta
    tram(p, p[-1], (R_STEM_I, 0.0050), PAS)              # coll interior
    tram(p, p[-1], (R_STEM_I + 0.0006, Z_STEM - 0.0010), 1)
    tram(p, p[-1], (R_RIM - 0.0014, H - 0.0025), PAS)    # con interior
    tram(p, p[-1], (R_RIM - 0.0014, H), 1)               # vora interior
    return p


# ─────────────────────────────────────────────────────────────────────────────
# 3. MESH DE REVOLUCIÓ (contorn tancat: no toca mai l'eix)
# ─────────────────────────────────────────────────────────────────────────────
prof = perfil()
verts, faces = [], []
for r, z in prof:
    for i in range(SEG):
        th = 2 * math.pi * i / SEG
        verts.append((r * math.cos(th), r * math.sin(th), z))
n = len(prof)
for j in range(n):
    a = j * SEG
    b = ((j + 1) % n) * SEG
    for i in range(SEG):
        k = (i + 1) % SEG
        faces.append((a + i, a + k, b + k, b + i))

me = bpy.data.meshes.new("embut_malla")
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
root.empty_display_size = 0.03

mesh_obj = OB("TOOL_embut", me)
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

bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# ─────────────────────────────────────────────────────────────────────────────
# 5. METADADES
# ─────────────────────────────────────────────────────────────────────────────
METADADES = {
    "tool_id": TOOL_ID,
    "variant_id": VARIANT_ID,
    "label_ca": "Embut de vidre de 100 mm",
    "display_name": "Embut de vidre",
    "category": "manipulacio",
    "capacity_ml": 0,
    "material_type": "vidre",
    "graduation_type": "none",
    "usage_tags": ["filter", "transfer-liquid", "fill-container"],
    "measurement_note_ca": (
        "No mesura res: no té graduació. Serveix per filtrar i per traspassar "
        "líquids a un recipient de coll estret."
    ),
}
for k, v in METADADES.items():
    root[k] = v
    mesh_obj[k] = v
root["tipus"] = "embut"
root["unitats"] = "metres"
root["diametre_boca_mm"] = 100.0
root["alcada_mm"] = 150.0
root["coll_exterior_mm"] = 10.0
root["coll_interior_mm"] = 7.2
root["angle_con_graus"] = 60.0
root["material"] = "borosilicat 3.3"
mesh_obj["tipus"] = "embut"
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


mat_fons = MAT_FONS("Fons · blau grisós", (0.20, 0.28, 0.36))
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
bgn.inputs[0].default_value = (0.22, 0.30, 0.38, 1)
bgn.inputs[1].default_value = 0.7


def aim(ob, at):
    ob.rotation_euler = (Vector(at) - ob.location).to_track_quat('-Z', 'Y').to_euler()


def area(name, loc, power, size):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy, ld.shape = power, 'RECTANGLE'
    ld.size, ld.size_y = size, size
    ob = OB(name, ld, estudi)
    ob.location = loc
    aim(ob, (0, 0, 0.06))


area("Softbox_esquerra", (-0.30, -0.26, 0.42), 24, 0.26)
area("Softbox_dreta", (0.32, -0.20, 0.30), 14, 0.30)
area("Softbox_superior", (0.02, 0.12, 0.48), 20, 0.30)

cam_data = bpy.data.cameras.new("Camera")
cam = OB("Camera_presentacio", cam_data, estudi)
cam_data.lens = 55
cam_data.clip_start = .001
cam_data.clip_end = 2
cam.location = (0.230, -0.300, 0.190)
aim(cam, (0.0, 0.0, 0.055))
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
scene.render.resolution_x, scene.render.resolution_y = 800, 700
scene.render.resolution_percentage = 100
scene.view_settings.exposure = -0.2
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

# la foto es fa amb l'embut tombat, com a la imatge de referència:
# recolza la boca i la punta, inclinat 18°. El .blend i el .glb el guarden dret.
mesh_obj.rotation_euler = (0.0, math.radians(72.0), 0.0)
bpy.context.view_layer.update()
bb = [mesh_obj.matrix_world @ Vector(c) for c in mesh_obj.bound_box]
zmin = min(v.z for v in bb)
mesh_obj.location = (0.0, 0.0, -zmin)
bpy.context.view_layer.update()
bb = [mesh_obj.matrix_world @ Vector(c) for c in mesh_obj.bound_box]
cx = (min(v.x for v in bb) + max(v.x for v in bb)) / 2
cz = (min(v.z for v in bb) + max(v.z for v in bb)) / 2
ample = max(max(v.x for v in bb) - min(v.x for v in bb),
            max(v.z for v in bb) - min(v.z for v in bb))
cam_data.lens = 50
cam.location = (cx + ample * 0.25, -ample * 2.1, cz + ample * 0.55)
aim(cam, (cx, 0.0, cz))
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
    "dims_mm": [round(d * 1000, 1) for d in mesh_obj.dimensions],
}
bm.free()
print("QA_BEGIN")
print(json.dumps({"asset": VARIANT_ID, "blender": bpy.app.version_string,
                  "qa": qa, "metadades": METADADES}, indent=1, ensure_ascii=False))
print("QA_END")
print("DONE", HERE)

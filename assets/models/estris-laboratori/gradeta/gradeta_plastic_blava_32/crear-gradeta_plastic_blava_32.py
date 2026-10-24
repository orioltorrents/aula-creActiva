"""
Gradeta de plàstic blava per a tubs d'assaig — generació del paquet web.

    blender --background --factory-startup --python crear-gradeta_plastic_blava_32.py

Genera, dins la carpeta d'aquest script:
    gradeta_plastic_blava_32.blend   model + estudi separat
    gradeta_plastic_blava_32.glb     només MODEL, amb extras
    gradeta_plastic_blava_32.png     vista prèvia

Dimensions reals: 200 × 90 × 90 mm. 8 × 4 cel·les = 32 tubs de 16 mm.
Els tubs hi van drets i es recolzen a la base.
"""
import bpy
import bmesh
import json
import math
import os
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent
VARIANT_ID = "gradeta_plastic_blava_32"
TOOL_ID = "gradeta"
BLEND = HERE / (VARIANT_ID + ".blend")
GLB = HERE / (VARIANT_ID + ".glb")
PNG = HERE / (VARIANT_ID + ".png")
HERE.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 1. PARÀMETRES (metres)
# ─────────────────────────────────────────────────────────────────────────────
W, D, H = 0.200, 0.090, 0.090
NC, NR = 8, 4
BAR = 0.003
PLATE = 0.004
Z_BASE, Z_MID, Z_TOP = 0.0, 0.043, 0.086
FRAME = 0.004

# ─────────────────────────────────────────────────────────────────────────────
# 2. ESCENA NETA
# ─────────────────────────────────────────────────────────────────────────────
scene = bpy.data.scenes.new("GRADETA_plastic_blava_32 · model")
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

model = bpy.data.collections.new("GRADETA_plastic_blava_32 · model")
estudi = bpy.data.collections.new("ESTUDI · camera i llums")
scene.collection.children.link(model)
scene.collection.children.link(estudi)


def OB(name, data, col=model):
    ob = bpy.data.objects.new(name, data)
    col.objects.link(ob)
    return ob


V, F = [], []


def box(x0, x1, y0, y1, z0, z1):
    b = len(V)
    for z in (z0, z1):
        for x, y in ((x0, y0), (x1, y0), (x1, y1), (x0, y1)):
            V.append((x, y, z))
    F.extend([(b + 0, b + 3, b + 2, b + 1), (b + 4, b + 5, b + 6, b + 7),
              (b + 0, b + 1, b + 5, b + 4), (b + 1, b + 2, b + 6, b + 5),
              (b + 2, b + 3, b + 7, b + 6), (b + 3, b + 0, b + 4, b + 7)])


def plate(z0, nx, ny):
    """Pis de gelosia. Les barres acaben DINS els marcs i els pisos van
    escalonats 0,05 mm: cap cara no queda coplanar amb una altra i no hi ha
    z-fighting."""
    hx, hy = W / 2 - BAR / 2, D / 2 - BAR / 2
    cx, cy = 2 * hx / nx, 2 * hy / ny
    x_end = W / 2 - FRAME + 0.001        # dins del marc (0,096–0,100)
    y_end = D / 2 - 0.001                # dins dels muntants (0,041–0,045)
    zb = z0 if z0 < 1e-9 else z0 + 0.00005
    zt = z0 + PLATE - 0.00005
    for k in range(ny + 1):
        y = -hy + k * cy
        box(-x_end, x_end, y - BAR / 2, y + BAR / 2, zb, zt)
    # transversals 0,2 mm més avall, perquè tampoc no toquin les longitudinals
    for k in range(nx + 1):
        x = -hx + k * cx
        box(x - BAR / 2, x + BAR / 2, -y_end, y_end,
            zb + 0.0002, zt - 0.0002)


def frame(xc):
    for yy in (-D / 2, D / 2 - FRAME):
        box(xc - FRAME / 2, xc + FRAME / 2, yy, yy + FRAME, 0.0, H - 0.0005)
    # els travessers van 0,2 mm més estrets que els muntants: si no, les
    # cares laterals coincideixen i Cycles hi fa shadow acne (taques negres)
    for zz in (0.0, Z_MID, Z_TOP):
        box(xc - FRAME / 2 + 0.0002, xc + FRAME / 2 - 0.0002,
            -D / 2, D / 2, zz, zz + FRAME - 0.0005)


plate(Z_BASE, NC * 2, NR * 2)
plate(Z_MID, NC, NR)
plate(Z_TOP, NC, NR)
frame(-W / 2 + FRAME / 2)
frame(W / 2 - FRAME / 2)

me = bpy.data.meshes.new("gradeta_plastic_blava_malla")
me.from_pydata(V, [], F)
me.update()
bm = bmesh.new()
bm.from_mesh(me)
# sense remove_doubles: cada barra queda com un prisma tancat i cap aresta
# no queda compartida per quatre cares (la gelosia és d'una peça visualment)
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
bm.to_mesh(me)
bm.free()

# ─────────────────────────────────────────────────────────────────────────────
# 3. MATERIAL I OBJECTES
# ─────────────────────────────────────────────────────────────────────────────
mat = bpy.data.materials.new("Plàstic blau de laboratori")
mat.use_nodes = True
bsdf = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
bsdf.inputs['Base Color'].default_value = (0.02, 0.10, 0.62, 1.0)
bsdf.inputs['Roughness'].default_value = 0.35
bsdf.inputs['Metallic'].default_value = 0.0
for nom in ('Specular IOR Level', 'Specular'):
    if nom in bsdf.inputs:
        bsdf.inputs[nom].default_value = 0.5
        break

root = OB(VARIANT_ID, None)
root.empty_display_type = 'PLAIN_AXES'
root.empty_display_size = 0.03

mesh_obj = OB("TOOL_gradeta_plastic_blava", me)
mesh_obj.data.materials.append(mat)
mesh_obj.parent = root

METADADES = {
    "tool_id": TOOL_ID,
    "variant_id": VARIANT_ID,
    "label_ca": "Gradeta de plàstic blava per a 32 tubs",
    "display_name": "Gradeta de plàstic blava per a tubs d'assaig",
    "category": "suport",
    "capacity_ml": 0,
    "material_type": "plastic",
    "graduation_type": "none",
    "usage_tags": ["hold-tubes", "organize-samples", "support"],
    "measurement_note_ca": (
        "No mesura res: és un suport. Admet 32 tubs de fins a 18 mm de "
        "diàmetre exterior; els tubs reposen sobre la graella inferior."
    ),
}
for k, v in METADADES.items():
    root[k] = v
    mesh_obj[k] = v
root["tipus"] = "gradeta"
root["unitats"] = "metres"
root["mides_mm"] = [200.0, 90.0, 90.0]
root["cells"] = [NC, NR]
root["material"] = "polipropilè"
mesh_obj["tipus"] = "gradeta"
mesh_obj["unitats"] = "metres"

# ─────────────────────────────────────────────────────────────────────────────
# 4. ESTUDI
# ─────────────────────────────────────────────────────────────────────────────
def MAT_FONS(name, color, rough=0.55):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    return m


mat_fons = MAT_FONS("Fons · gris perla", (0.74, 0.755, 0.77))


def caixa(name, x0, x1, y0, y1, z0, z1, mat_):
    v = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
         (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
         (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    me_ = bpy.data.meshes.new(name + "_malla")
    me_.from_pydata(v, [], f)
    me_.update()
    ob = OB(name, me_, estudi)
    ob.data.materials.append(mat_)
    return ob


caixa("Superficie_estudi", -2, 2, -2, 2, -0.01, 0.0, mat_fons)

world = bpy.data.worlds.new("Ambient")
world.use_nodes = True
scene.world = world
bgn = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bgn.inputs[0].default_value = (0.78, 0.81, 0.85, 1)
bgn.inputs[1].default_value = 0.85


def aim(ob, at):
    ob.rotation_euler = (Vector(at) - ob.location).to_track_quat('-Z', 'Y').to_euler()


def area(name, loc, power, size):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy, ld.shape = power, 'RECTANGLE'
    ld.size, ld.size_y = size, size
    ob = OB(name, ld, estudi)
    ob.location = loc
    aim(ob, (0, 0, 0.045))


area("Softbox_esquerra", (-0.38, -0.34, 0.46), 18, 0.35)
area("Softbox_dreta", (0.44, -0.24, 0.30), 14, 0.40)
area("Rim_darrere", (0.10, 0.46, 0.40), 12, 0.30)

cam_data = bpy.data.cameras.new("Camera")
cam = OB("Camera_presentacio", cam_data, estudi)
cam_data.lens = 60
cam_data.clip_start = .001
cam_data.clip_end = 2
cam.location = (0.330, -0.330, 0.240)
aim(cam, (0.0, 0.0, 0.045))
scene.camera = cam

# ─────────────────────────────────────────────────────────────────────────────
# 5. RENDER, DESAR I EXPORTAR
# ─────────────────────────────────────────────────────────────────────────────
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x, scene.render.resolution_y = 900, 760
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

scene.render.filepath = str(PNG)
bpy.ops.render.render(write_still=True)
print("PNG", PNG)

# ─────────────────────────────────────────────────────────────────────────────
# 6. QA
# ─────────────────────────────────────────────────────────────────────────────
bm = bmesh.new()
bm.from_mesh(mesh_obj.data)
qa = {
    "vertexs": len(bm.verts),
    "cares": len(bm.faces),
    "no_manifold": sum(1 for e in bm.edges if not e.is_manifold),
    "dims_mm": [round(d * 1000, 1) for d in mesh_obj.dimensions],
    "volum_cm3": round(bm.calc_volume(signed=False) * 1e6, 1),
}
bm.free()
print("QA_BEGIN")
print(json.dumps({"asset": VARIANT_ID, "blender": bpy.app.version_string,
                  "qa": qa, "metadades": METADADES}, indent=1, ensure_ascii=False))
print("QA_END")
print("DONE", HERE)

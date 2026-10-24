"""
Tub d'assaig 16 × 150 mm — generació del paquet web (Blender 5.2.3 LTS).

    blender --background --factory-startup --python crear-tub-dassaig_16x150mm.py

Genera, dins la carpeta d'aquest script:
    tub-dassaig_16x150mm.blend   escena editable (model + estudi separat)
    tub-dassaig_16x150mm.glb     només MODEL, amb extras
    tub-dassaig_16x150mm.png     vista prèvia

El .blend i el .glb porten el vidre de la web (alphaMode BLEND, alpha 0,065),
el mateix que la resta de la biblioteca. La imatge es renderitza amb un vidre
de previsualització (transmissió) perquè el model s'hi vegi; el fitxer desat
NO porta aquest material.

Referència dimensional: tub de 20 mL, 16 × 150 mm, paret 1,2 mm, boro 3.3,
amb llavi, fons arrodonit. Sense inscripcions.
"""
import bpy, bmesh, math, os, json
from pathlib import Path
from mathutils import Vector

# ─────────────────────────────────────────────────────────────────────────────
# 0. RUTES I IDENTIFICADORS
# ─────────────────────────────────────────────────────────────────────────────
HERE = Path(__file__).resolve().parent
OUT_DIR = HERE
VARIANT_ID = "tub-dassaig_16x150mm"
TOOL_ID = "tub-dassaig"
BLEND = OUT_DIR / (VARIANT_ID + ".blend")
GLB = OUT_DIR / (VARIANT_ID + ".glb")
PNG = OUT_DIR / (VARIANT_ID + ".png")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 1. MESURES (metres) — fitxa del fabricant
# ─────────────────────────────────────────────────────────────────────────────
R_EXT = 0.0080          # Ø exterior 16 mm
R_INT = 0.0068          # Ø interior 13,6 mm → paret 1,2 mm
H_TOTAL = 0.1500        # llargada 150 mm
RIM_R = 0.0088          # llavi Ø 17,6 mm
N_SEG = 96
N_HEMI = 12
BZ, BR, BC = 0.1486, 0.0014, 0.0074   # bead del llavi: centre (BC, BZ), radi BR

# ─────────────────────────────────────────────────────────────────────────────
# 2. ESCENA
# ─────────────────────────────────────────────────────────────────────────────
scene = bpy.data.scenes.new("TUB-DASSAIG_16x150mm · model")
bpy.context.window.scene = scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1.0

# --factory-startup arrossega l'escena "Scene" amb el Cube, la càmera i el llum:
# si no es netegen, s'exporten com a escena germana dins el GLB.
for _s in list(bpy.data.scenes):
    if _s is not scene:
        bpy.data.scenes.remove(_s)
for _o in list(bpy.data.objects):
    bpy.data.objects.remove(_o, do_unlink=True)
for _me in list(bpy.data.meshes):
    bpy.data.meshes.remove(_me)
for _ma in list(bpy.data.materials):
    bpy.data.materials.remove(_ma)

model = bpy.data.collections.new("TUB-DASSAIG_16x150mm · model")
estudi = bpy.data.collections.new("ESTUDI · camera i llums")
scene.collection.children.link(model)
scene.collection.children.link(estudi)

def OB(name, data, col=model):
    ob = bpy.data.objects.new(name, data)
    col.objects.link(ob)
    return ob

def mesh_from(name, verts, faces, smooth=True):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=1e-7)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(me); bm.free()
    if smooth:
        for f in me.polygons:
            f.use_smooth = True
    return me

# ─────────────────────────────────────────────────────────────────────────────
# 3. MODEL — perfil de revolució
# ─────────────────────────────────────────────────────────────────────────────
def hemi(radius, z_centre, phi):
    return (radius * math.cos(phi), z_centre + radius * math.sin(phi))

def build_profile():
    p = []
    for i in range(N_HEMI + 1):                       # fons exterior
        phi = -math.pi / 2 + (math.pi / 2) * i / N_HEMI
        p.append(hemi(R_EXT, R_EXT, phi))
    a0 = math.acos((R_EXT - BC) / BR)
    p.append((R_EXT, BZ - BR * math.sin(a0)))         # paret fins al bead
    for i in range(1, 5):                             # bead, meitat inferior
        a = -a0 + a0 * i / 4.0
        p.append((BC + BR * math.cos(a), BZ + BR * math.sin(a)))
    for i in range(1, 5):                             # bead, meitat superior
        a = (math.pi / 2) * i / 4.0
        p.append((BC + BR * math.cos(a), BZ + BR * math.sin(a)))
    p += [(0.0072, 0.1497), (0.0069, 0.1490), (R_INT, 0.1480)]   # vora interior
    p.append((R_INT, R_EXT))                          # paret interior
    for i in range(N_HEMI - 1, -1, -1):               # fons interior
        phi = -math.pi / 2 + (math.pi / 2) * i / N_HEMI
        p.append(hemi(R_INT, R_EXT, phi))
    return p

def build_tube():
    perfil = build_profile()
    verts, faces, ring_start, ring_len = [], [], [], []
    for r, z in perfil:
        n = 1 if r == 0 else N_SEG
        ring_start.append(len(verts)); ring_len.append(n)
        for i in range(n):
            th = 2 * math.pi * i / N_SEG
            verts.append((r * math.cos(th), r * math.sin(th), z))
    for j in range(len(perfil) - 1):
        a, na = ring_start[j], ring_len[j]
        b, nb = ring_start[j + 1], ring_len[j + 1]
        for i in range(N_SEG):
            k = (i + 1) % N_SEG
            if na == 1 and nb == 1:
                continue
            if na == 1:
                faces.append((a, b + i, b + k))
            elif nb == 1:
                faces.append((a + i, a + k, b))
            else:
                faces.append((a + i, a + k, b + k, b + i))
    me = mesh_from("Vidre_tub_dassaig_malla", verts, faces)
    return OB("Vidre_tub_dassaig_16x150mm", me)

# ─────────────────────────────────────────────────────────────────────────────
# 4. MATERIALS
# ─────────────────────────────────────────────────────────────────────────────
def principled(mat):
    return next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')

# Vidre de la web: el mateix que la resta de la biblioteca (alphaMode BLEND).
mat_web = bpy.data.materials.new("Vidre borosilicat · transparent")
mat_web.use_nodes = True
_p = principled(mat_web)
_p.inputs['Base Color'].default_value = (0.008, 0.012, 0.015, 1)
_p.inputs['Alpha'].default_value = 0.065
_p.inputs['Roughness'].default_value = 0.08
_p.inputs['IOR'].default_value = 1.46
_p.inputs['Specular IOR Level'].default_value = 0.15
_p.inputs['Transmission Weight'].default_value = 0.0
mat_web.surface_render_method = 'BLENDED'
mat_web.blend_method = 'BLEND'
mat_web.use_backface_culling = True      # glTF: doubleSided = false, com la resta

# ─────────────────────────────────────────────────────────────────────────────
# 5. METADADES (custom properties a l'arrel i a les malles)
# ─────────────────────────────────────────────────────────────────────────────
root = OB(VARIANT_ID, None)          # EMPTY arrel, seleccionable
root.empty_display_type = 'PLAIN_AXES'
root.empty_display_size = 0.02

METADADES = {
    "tool_id": TOOL_ID,
    "variant_id": VARIANT_ID,
    "label_ca": "Tub d'assaig de 16 × 150 mm",
    "capacity_ml": 20,
    "graduation_type": "none",
    "usage_tags": ["contain-liquid", "mix", "heat"],
    "measurement_note_ca": (
        "Tub sense graduacions: no serveix per mesurar volums. Els 20 mL són "
        "capacitat nominal (fins a la vora), no un volum calibrat."
    ),
}

tube = build_tube()
tube.data.materials.append(mat_web)
tube.parent = root

# arrel: metadades web + dades pròpies de l'instrument
for k, v in METADADES.items():
    root[k] = v
root["tipus"] = "tub d'assaig"
root["escala"] = "sense graduacions"
root["unitats"] = "metres"
root["material"] = "borosilicat 3.3"
root["alcada_mm"] = 150.0
root["diametre_ext_mm"] = 16.0
root["diametre_int_mm"] = 13.6
root["gruix_paret_mm"] = 1.2
root["diametre_llavi_mm"] = 17.6

# malla seleccionable: mateixes claus web, perquè el clic resolgui la variant
for k, v in METADADES.items():
    tube[k] = v

# ─────────────────────────────────────────────────────────────────────────────
# 6. ESTUDI (fora del MODEL: no s'exporta)
# ─────────────────────────────────────────────────────────────────────────────
def MAT_FONS(name, color, rough=0.55):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = principled(m)
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    return m

mat_fons = MAT_FONS("Fons · gris perla", (0.62, 0.645, 0.67))
mat_plafo = bpy.data.materials.new("Fons · plafó emissiu")
mat_plafo.use_nodes = True
_nt = mat_plafo.node_tree
for _n in list(_nt.nodes):
    _nt.nodes.remove(_n)
_out = _nt.nodes.new('ShaderNodeOutputMaterial')
_em = _nt.nodes.new('ShaderNodeEmission')
_em.inputs[0].default_value = (0.66, 0.69, 0.73, 1)
_em.inputs[1].default_value = 0.30
_nt.links.new(_em.outputs[0], _out.inputs[0])

def caixa(name, x0, x1, y0, y1, z0, z1, mat):
    v = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
         (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
         (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    me = mesh_from(name + "_malla", v, f, smooth=False)
    ob = OB(name, me, estudi)
    ob.data.materials.append(mat)
    return ob

caixa("Superficie_estudi", -3, 3, -3, 3, -0.02, 0.0, mat_fons)
caixa("Fons_estudi", -3, 3, 0.22, 0.24, -0.02, 3.0, mat_plafo)

world = bpy.data.worlds.new("Ambient")
world.use_nodes = True
scene.world = world
bgn = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bgn.inputs[0].default_value = (0.80, 0.84, 0.88, 1)
bgn.inputs[1].default_value = 0.30

def aim(ob, at):
    ob.rotation_euler = (Vector(at) - ob.location).to_track_quat('-Z', 'Y').to_euler()

def area(name, loc, power, size, sy=2.4):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy, ld.shape = power, 'RECTANGLE'
    ld.size, ld.size_y = size, size * sy
    ob = OB(name, ld, estudi)
    ob.location = loc
    aim(ob, (0, 0, .075))

area("Softbox_esquerra", (-.35, -.30, .50), 4, .05)
area("Softbox_dreta", (.35, -.30, .50), 4, .05)
area("Rim_darrere", (.06, .12, .34), 3, .05, 2.2)

cam_data = bpy.data.cameras.new("Camera")
cam = OB("Camera_presentacio", cam_data, estudi)
cam_data.type = 'PERSP'
cam_data.lens = 70
cam_data.clip_start = .001
cam_data.clip_end = 2
cam.location = (0.170, -0.255, 0.135)
aim(cam, (0.0, 0.0, 0.074))
scene.camera = cam

# ─────────────────────────────────────────────────────────────────────────────
# 7. RENDER DE PREVISIÓ (vidre de previsualització, temporal)
# ─────────────────────────────────────────────────────────────────────────────
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 96
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 16
scene.cycles.transmission_bounces = 16
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x, scene.render.resolution_y = 1000, 1100
scene.render.resolution_percentage = 100
scene.view_settings.exposure = 0.0
scene.view_settings.look = 'AgX - Medium High Contrast'

# ─────────────────────────────────────────────────────────────────────────────
# 8. DESAR .BLEND I EXPORTAR .GLB (amb el material web, sense el vidre de preview)
# ─────────────────────────────────────────────────────────────────────────────
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND), compress=True)
print("BLEND", BLEND)

bpy.ops.object.select_all(action='DESELECT')
for ob in model.objects:
    ob.select_set(True)
bpy.context.view_layer.objects.active = root
bpy.ops.export_scene.gltf(
    filepath=str(GLB),
    export_format='GLB',
    use_selection=True,
    use_active_scene=True,
    export_extras=True,
    export_animations=False,
    export_cameras=False,
    export_lights=False,
)
print("GLB", GLB)

# ─────────────────────────────────────────────────────────────────────────────
# 9. PREVISIÓ: vidre amb transmissió només per a la imatge (no es desa)
# ─────────────────────────────────────────────────────────────────────────────
_p.inputs['Alpha'].default_value = 1.0
_p.inputs['Transmission Weight'].default_value = 1.0
_p.inputs['Base Color'].default_value = (0.97, 0.99, 1.0, 1)
_p.inputs['Roughness'].default_value = 0.05
mat_web.surface_render_method = 'DITHERED'

scene.render.filepath = str(PNG)
bpy.ops.render.render(write_still=True)
print("PNG", PNG)

# ─────────────────────────────────────────────────────────────────────────────
# 10. QA
# ─────────────────────────────────────────────────────────────────────────────
bm = bmesh.new(); bm.from_mesh(tube.data)
qa = {
    "vertexs": len(bm.verts),
    "cares": len(bm.faces),
    "no_manifold": sum(1 for e in bm.edges if not e.is_manifold),
    "volum_cm3": round(bm.calc_volume(signed=False) * 1e6, 3),
    "dims_mm": [round(d * 1000, 2) for d in tube.dimensions],
}
bm.free()
print("QA_BEGIN")
print(json.dumps({"asset": VARIANT_ID, "blender": bpy.app.version_string,
                  "qa": qa, "metadades": METADADES}, indent=1, ensure_ascii=False))
print("QA_END")
print("DONE", OUT_DIR)

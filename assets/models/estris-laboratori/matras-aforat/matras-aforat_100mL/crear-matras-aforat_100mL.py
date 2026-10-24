"""
Matràs aforat 100 mL — generació del paquet web (Blender 5.2.3 LTS).

    blender --background --factory-startup --python crear-matras-aforat_100mL.py

Genera, dins la carpeta d'aquest script:
    matras-aforat_100mL.blend
    matras-aforat_100mL.glb            (buit)
    matras-aforat_100mL-amb-liquid.glb (líquid enrasat a 100 mL + morph targets)
    matras-aforat_100mL.png

Referència: matràs aforat de 100 mL, bulb Ø60 mm, base Ø40 mm, alçada 180 mm
amb tap (175 mm el vidre), coll 14/23 (Ø interior 12 mm). La marca es col·loca
on el volum interior calculat és exactament 100,0 mL.
"""
import bpy, bmesh, math, os, json
from pathlib import Path
from mathutils import Vector

HERE = Path(__file__).resolve().parent
VARIANT_ID = "matras-aforat_100mL"
TOOL_ID = "matras-aforat"
BLEND = HERE / (VARIANT_ID + ".blend")
GLB = HERE / (VARIANT_ID + ".glb")
GLB_LIQ = HERE / (VARIANT_ID + "-amb-liquid.glb")
PNG = HERE / (VARIANT_ID + ".png")
HERE.mkdir(parents=True, exist_ok=True)

# ───────────────────────────────────────────────────────────────────────────
# 1. MESURES (metres)
# ───────────────────────────────────────────────────────────────────────────
WALL = 0.0012          # gruix de paret (vidre fi, com a la foto)
H_TOTAL = 0.175        # alçada del vidre (180 amb tap)
R_BASE_OUT = 0.020     # base Ø40
R_NECK_IN = 0.0060     # coll Ø12 interior
Z_NECK = 0.057         # on comença el coll (interior)
N_SEG = 96
Z_FLOOR_IN = WALL      # fons interior (gruix del cul)
CAPACITY = 100.0       # mL a la marca

# Perfil INTERIOR (z, r) en mm, amb el fons a z = 1.5 mm (gruix del cul)
PTS_MM = [
    (1.5, 18.0), (3.0, 19.5), (6.0, 22.0), (10.0, 24.5), (14.0, 26.3),
    (18.0, 27.6), (22.0, 28.3), (26.0, 28.5), (30.0, 28.2), (34.0, 27.2),
    (38.0, 25.6), (42.0, 23.3), (45.5, 20.5), (48.0, 17.0), (50.0, 13.0),
    (51.5, 9.0), (52.5, 6.8), (54.0, 6.2), (57.0, 6.0), (169.5, 6.0),
]
PTS = [(z / 1000.0, r / 1000.0) for z, r in PTS_MM]


def r_inner(z):
    """Radi interior a l'alçada z (m) amb Catmull-Rom sobre PTS."""
    if z <= PTS[0][0]:
        return PTS[0][1]
    if z >= PTS[-1][0]:
        return PTS[-1][1]
    i = max(j for j in range(len(PTS) - 1) if PTS[j][0] <= z)
    p0 = PTS[max(i - 1, 0)]
    p1, p2 = PTS[i], PTS[i + 1]
    p3 = PTS[min(i + 2, len(PTS) - 1)]
    t = (z - p1[0]) / (p2[0] - p1[0])
    m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * (p2[0] - p1[0])
    m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * (p2[0] - p1[0])
    t2, t3 = t * t, t * t * t
    return ((2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 +
            (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2)


def volume_to(z):
    """Volum interior (m³) des del fons fins a z."""
    n = 400
    z0 = Z_FLOOR_IN
    h = (z - z0) / n
    v = 0.0
    for k in range(n):
        a = z0 + k * h
        b = a + h
        v += math.pi * ((r_inner(a) + r_inner(b)) / 2) ** 2 * h
    return v


# alçada de la marca: on el volum és 100,0 mL
lo, hi = 0.050, 0.170
for _ in range(60):
    mid = (lo + hi) / 2
    if volume_to(mid) < CAPACITY * 1e-6:
        lo = mid
    else:
        hi = mid
Z_MARK = (lo + hi) / 2
V_MARK = volume_to(Z_MARK) * 1e6
print(f"MARCA z = {Z_MARK*1000:.2f} mm, volum = {V_MARK:.3f} mL")

# ───────────────────────────────────────────────────────────────────────────
# 2. ESCENA
# ───────────────────────────────────────────────────────────────────────────
scene = bpy.data.scenes.new("MATRAS-AFORAT_100mL · model")
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

model = bpy.data.collections.new("MATRAS-AFORAT_100mL · model")
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

def revolucio(name, perfil, smooth=True):
    """perfil: llista de (r, z). Retorna la malla girada al voltant de Z."""
    verts, faces, starts, lens = [], [], [], []
    for r, z in perfil:
        n = 1 if r <= 1e-9 else N_SEG
        starts.append(len(verts)); lens.append(n)
        for i in range(n):
            th = 2 * math.pi * i / N_SEG
            verts.append((r * math.cos(th), r * math.sin(th), z))
    for j in range(len(perfil) - 1):
        a, na = starts[j], lens[j]
        b, nb = starts[j + 1], lens[j + 1]
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
    return mesh_from(name, verts, faces, smooth)

# ───────────────────────────────────────────────────────────────────────────
# 3. VIDRE
# ───────────────────────────────────────────────────────────────────────────
def perfil_vidre():
    p = []
    # fons interior: del centre (z = WALL) a la vora
    p.append((0.0, Z_FLOOR_IN))
    for z in (Z_FLOOR_IN, 0.003, 0.005, 0.008):
        p.append((r_inner(z), z))
    # paret interior cap amunt
    z = 0.010
    while z < Z_NECK:
        p.append((r_inner(z), z))
        z += 0.004
    z = Z_NECK
    while z < 0.1695:
        p.append((R_NECK_IN, z))
        z += 0.008
    p.append((R_NECK_IN, 0.1695))
    # llavi: s'eixampla i es doblega
    p += [(0.0066, 0.1702), (0.0072, 0.1712), (0.0077, 0.1726),
          (0.0079, 0.1738), (0.0076, 0.1746), (0.0071, 0.1750),
          (0.0067, 0.1746), (0.0064, 0.1736), (0.0062, 0.1720),
          (R_NECK_IN + WALL, 0.1695)]
    # paret exterior cap avall
    z = 0.1695
    while z > 0.008:
        p.append((r_inner(z) + WALL, z))
        z -= 0.008
    p += [(r_inner(0.008) + WALL, 0.008), (r_inner(0.005) + WALL, 0.005),
          (r_inner(0.003) + WALL, 0.003), (0.0195, 0.0015), (R_BASE_OUT, 0.0),
          (0.0, 0.0)]
    return p


MAT_WEB = bpy.data.materials.new("Vidre borosilicat · transparent")
MAT_WEB.use_nodes = True
_p = next(n for n in MAT_WEB.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
_p.inputs['Base Color'].default_value = (0.008, 0.012, 0.015, 1)
_p.inputs['Alpha'].default_value = 0.065
_p.inputs['Roughness'].default_value = 0.08
_p.inputs['IOR'].default_value = 1.46
_p.inputs['Specular IOR Level'].default_value = 0.15
MAT_WEB.surface_render_method = 'BLENDED'
MAT_WEB.blend_method = 'BLEND'
MAT_WEB.use_backface_culling = True

vidre_me = revolucio("Matras_aforat_malla", perfil_vidre())
vidre = OB("Vidre_matras_aforat_100mL", vidre_me)
vidre.data.materials.append(MAT_WEB)

# ───────────────────────────────────────────────────────────────────────────
# 4. MARCA D'AFORAMENT I ETIQUETA
# ───────────────────────────────────────────────────────────────────────────
MAT_TINTA = bpy.data.materials.new("Tinta · gris grafit")
MAT_TINTA.use_nodes = True
_pt = next(n for n in MAT_TINTA.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
_pt.inputs['Base Color'].default_value = (0.02, 0.025, 0.03, 1)
_pt.inputs['Roughness'].default_value = 0.75
_pt.inputs['Specular IOR Level'].default_value = 0.0

# la marca d'aforament va en vermell fosc, com a la foto
MAT_MARCA = bpy.data.materials.new("Tinta · vermell de marca")
MAT_MARCA.use_nodes = True
_pm = next(n for n in MAT_MARCA.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
_pm.inputs['Base Color'].default_value = (0.36, 0.03, 0.02, 1)
_pm.inputs['Roughness'].default_value = 0.6
_pm.inputs['Specular IOR Level'].default_value = 0.0

# la impressió del bulb, blau com a la foto
MAT_BLAU = bpy.data.materials.new("Tinta · blau d'impressió")
MAT_BLAU.use_nodes = True
_pb = next(n for n in MAT_BLAU.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
_pb.inputs['Base Color'].default_value = (0.01, 0.07, 0.32, 1)
_pb.inputs['Roughness'].default_value = 0.55
_pb.inputs['Specular IOR Level'].default_value = 0.0

FONT = None
for _fp in ("C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/Arial.ttf"):
    try:
        FONT = bpy.data.fonts.load(_fp, check_existing=True)
        break
    except Exception:
        FONT = None

R_RING = R_NECK_IN + WALL + 0.00004
RING_D = 0.00006
Z0R, Z1R = Z_MARK - 0.0002, Z_MARK + 0.0002
verts, faces = [], []
for i in range(N_SEG):
    th = 2 * math.pi * i / N_SEG
    for rr, zz in ((R_RING, Z0R), (R_RING, Z1R),
                   (R_RING + RING_D, Z1R), (R_RING + RING_D, Z0R)):
        verts.append((rr * math.cos(th), rr * math.sin(th), zz))
for i in range(N_SEG):
    j = (i + 1) % N_SEG
    for k in range(4):
        k2 = (k + 1) % 4
        faces.append((i * 4 + k, i * 4 + k2, j * 4 + k2, j * 4 + k))
marca = OB("Marca_aforament_100mL", mesh_from("Marca_malla", verts, faces, smooth=False))
marca.data.materials.append(MAT_MARCA)

def wrap_on_superficie(me, r_ref, theta_c):
    """Projecta el text sobre el bulb: el radi es recalcula a cada z."""
    cx, cy = r_ref * math.cos(theta_c), r_ref * math.sin(theta_c)
    tx, ty = -math.sin(theta_c), math.cos(theta_c)
    nx, ny = math.cos(theta_c), math.sin(theta_c)
    for v in me.vertices:
        dx, dy = v.co.x - cx, v.co.y - cy
        u = dx * tx + dy * ty
        d = dx * nx + dy * ny
        th = theta_c + u / r_ref
        r_sup = r_inner(v.co.z) + WALL + 0.00004
        rr = r_sup + d
        v.co.x = rr * math.cos(th)
        v.co.y = rr * math.sin(th)

def text_obj(txt, size, theta, z, name):
    r_ref = r_inner(z) + WALL + 0.00004
    cu = bpy.data.curves.new(name, 'FONT')
    if FONT is not None:
        cu.font = FONT
    cu.body = txt
    cu.size = size
    cu.extrude = 0.00004
    cu.align_x = 'CENTER'
    cu.align_y = 'CENTER'
    ob = OB(name, cu)
    ob.location = (r_ref * math.cos(theta), r_ref * math.sin(theta), z)
    ob.rotation_euler = (math.pi / 2, 0, theta + math.pi / 2)
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.convert(target='MESH')
    ob = bpy.context.view_layer.objects.active
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=1e-9)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(ob.data); bm.free()
    ob.data.update()
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    wrap_on_superficie(ob.data, r_ref, theta)
    ob.data.update()
    return ob

# Joc d'impressió del bulb, com a la foto: capacitat, classe, tolerància,
# temperatura i material. (dtheta en radians respecte del davant)
TH_FRONT = -math.pi / 2
TEXTS = [
    ("A",        0.0030, +0.175, 0.0410),
    ("BORO 3.3", 0.0018, -0.185, 0.0410),
    ("100",      0.0082, -0.008, 0.0300),
    ("ml",       0.0032, +0.285, 0.0312),
    ("±0,1 ml",  0.0019, -0.095, 0.0196),
    ("20 °C",    0.0019, +0.095, 0.0196),
]
parts = []
for txt, size, dth, z in TEXTS:
    parts.append(text_obj(txt, size, TH_FRONT + dth, z,
                          "Txt_" + txt.replace(" ", "_")))
bpy.ops.object.select_all(action='DESELECT')
for o in parts:
    o.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
etiqueta = bpy.context.view_layer.objects.active
etiqueta.name = "Etiqueta_100mL"
etiqueta.data.name = "Etiqueta_malla"
etiqueta.data.materials.clear()
etiqueta.data.materials.append(MAT_BLAU)

# ───────────────────────────────────────────────────────────────────────────
# 5. LÍQUID (enrasat a 100 mL, amb morph targets de ±2 mL)
# ───────────────────────────────────────────────────────────────────────────
AREA_NECK = math.pi * R_NECK_IN ** 2
DIP = 0.0012                      # fondària del menisc al centre

def perfil_liquid(z_top):
    p = [(0.0, Z_FLOOR_IN)]
    z = Z_FLOOR_IN
    while z < z_top - 0.001:
        p.append((r_inner(z), z))
        z += 0.001
    # menisc còncau: la vora toca el vidre més amunt que el centre
    p.append((r_inner(z_top), z_top + DIP))
    for k in range(1, 7):
        frac = 1.0 - k / 6.0
        p.append((r_inner(z_top) * frac, z_top + DIP * frac * frac))
    return p

liq_me = revolucio("Liquid_malla", perfil_liquid(Z_MARK))
liq = OB("Liquid_100mL", liq_me)
MAT_LIQ = bpy.data.materials.new("Liquid · blau")
MAT_LIQ.use_nodes = True
_pl = next(n for n in MAT_LIQ.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
_pl.inputs['Base Color'].default_value = (0.02, 0.22, 0.55, 1)
_pl.inputs['Roughness'].default_value = 0.15
_pl.inputs['Alpha'].default_value = 0.75
MAT_LIQ.blend_method = 'BLEND'
liq.data.materials.append(MAT_LIQ)

# shape keys: Basis = enrasat a 100 mL; +1 = 102 mL; −1 = 98 mL
liq.shape_key_add(name="Basis", from_mix=False)
DELTA = 2.0e-6 / AREA_NECK

for nom, signe in (("nivell_alt", +1), ("nivell_baix", -1)):
    cle = liq.shape_key_add(name=nom, from_mix=False)
    for i, v in enumerate(liq.data.vertices):
        if v.co.z > Z_MARK - 1e-6:
            cle.data[i].co = (v.co.x, v.co.y, v.co.z + signe * DELTA)

# ───────────────────────────────────────────────────────────────────────────
# 6. METADADES
# ───────────────────────────────────────────────────────────────────────────
# ───────────────────────────────────────────────────────────────────────────
# 5b. TAP (peça independent: es pot amagar o aixecar)
# ───────────────────────────────────────────────────────────────────────────
Z_TAP = 0.1695          # el tap recolza sobre la boca del coll
MAT_TAP = bpy.data.materials.new("Tap · PE translúcid")
MAT_TAP.use_nodes = True
_ptap = next(n for n in MAT_TAP.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
_ptap.inputs['Base Color'].default_value = (0.93, 0.94, 0.95, 1)
_ptap.inputs['Roughness'].default_value = 0.35
_ptap.inputs['Alpha'].default_value = 0.85
_ptap.inputs['Specular IOR Level'].default_value = 0.4
MAT_TAP.blend_method = 'BLEND'

# perfil en coordenades LOCALS: z = 0 és la boca del coll
PERFIL_TAP = [
    (0.0, -0.0230), (0.0050, -0.0230), (0.0055, -0.0225),
    (0.0060, -0.0010), (0.00615, 0.0),
    (0.0086, 0.0), (0.0086, 0.0032), (0.0080, 0.0044),
    (0.0060, 0.0052), (0.0, 0.0054),
]
tap = OB("Tap_matras_aforat_100mL", revolucio("Tap_malla", PERFIL_TAP))
tap.data.materials.append(MAT_TAP)
tap.location = (0.0, 0.0, Z_TAP)

root = OB(VARIANT_ID, None)
root.empty_display_type = 'PLAIN_AXES'
root.empty_display_size = 0.02

METADADES = {
    "tool_id": TOOL_ID,
    "variant_id": VARIANT_ID,
    "label_ca": "Matràs aforat de 100 mL",
    "capacity_ml": 100,
    "graduation_type": "none",
    "usage_tags": ["prepare-solution", "dilute", "accurate-volume", "contain-liquid"],
    "measurement_note_ca": (
        "Té una sola marca d'aforament a 100 mL, no una escala: serveix per "
        "preparar un volum exacte, no per mesurar volums qualssevol. Model "
        "didàctic, sense certificat de calibratge."
    ),
}
for k, v in METADADES.items():
    root[k] = v
root["tipus"] = "matràs aforat"
root["escala"] = "marca única d'aforament a 100 mL"
root["unitats"] = "metres"
root["material"] = "borosilicat 3.3"
root["alcada_mm"] = 175.0
root["diametre_bulb_mm"] = 60.0
root["diametre_base_mm"] = 40.0
root["diametre_coll_int_mm"] = 12.0
root["marca_aforament_mm"] = round(Z_MARK * 1000, 2)
root["nivell_ml"] = 100

for ob in (vidre, marca, etiqueta, liq, tap):
    ob.parent = root
    for k, v in METADADES.items():
        ob[k] = v
liq["nivell_ml"] = 100
tap["element"] = "tap"
tap["removable"] = True
root["te_tap"] = True
liq["rang_nivell_ml"] = [98, 102]

# ───────────────────────────────────────────────────────────────────────────
# 7. ESTUDI
# ───────────────────────────────────────────────────────────────────────────
def MAT_FONS(name, color, rough=0.55):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    pp = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    pp.inputs['Base Color'].default_value = (*color, 1)
    pp.inputs['Roughness'].default_value = rough
    return m

mat_fons = MAT_FONS("Fons · gris perla", (0.74, 0.755, 0.77))
mat_plafo = bpy.data.materials.new("Fons · plafó emissiu")
mat_plafo.use_nodes = True
_nt = mat_plafo.node_tree
for _n in list(_nt.nodes):
    _nt.nodes.remove(_n)
_out = _nt.nodes.new('ShaderNodeOutputMaterial')
_em = _nt.nodes.new('ShaderNodeEmission')
_em.inputs[0].default_value = (0.66, 0.69, 0.73, 1)
_em.inputs[1].default_value = 0.48
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
caixa("Fons_estudi", -3, 3, 0.25, 0.27, -0.02, 3.0, mat_plafo)

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
    aim(ob, (0, 0, .090))

area("Softbox_esquerra", (-.40, -.32, .55), 5, .06)
area("Softbox_dreta", (.40, -.32, .55), 5, .06)
area("Rim_darrere", (.06, .14, .38), 3.5, .05, 2.2)

cam_data = bpy.data.cameras.new("Camera")
cam = OB("Camera_presentacio", cam_data, estudi)
cam_data.type = 'PERSP'
cam_data.lens = 70
cam_data.clip_start = .001
cam_data.clip_end = 2
cam.location = (0.150, -0.370, 0.140)
aim(cam, (0.0, 0.0, 0.085))
scene.camera = cam

# ───────────────────────────────────────────────────────────────────────────
# 8. RENDER, DESAR I EXPORTAR
# ───────────────────────────────────────────────────────────────────────────
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

bpy.ops.wm.save_as_mainfile(filepath=str(BLEND), compress=True)
print("BLEND", BLEND)

def exporta(path, amb_liquid):
    bpy.ops.object.select_all(action='DESELECT')
    for ob in model.objects:
        if ob.name == "Liquid_100mL" and not amb_liquid:
            continue
        ob.select_set(True)
    bpy.context.view_layer.objects.active = root
    bpy.ops.export_scene.gltf(
        filepath=str(path), export_format='GLB', use_selection=True,
        use_active_scene=True, export_extras=True, export_animations=False,
        export_cameras=False, export_lights=False, export_morph=True,
    )
    print("GLB", path)

exporta(GLB, False)
exporta(GLB_LIQ, True)

# previsualització: vidre clar sense refracció (transparent + glossy), com a les
# fotos de catàleg. Només per a la imatge: el .blend desat porta el material web.
MAT_PREV = bpy.data.materials.new("Vidre · preview")
MAT_PREV.use_nodes = True
_nt = MAT_PREV.node_tree
for _n in list(_nt.nodes):
    _nt.nodes.remove(_n)
_out = _nt.nodes.new('ShaderNodeOutputMaterial')
_mix = _nt.nodes.new('ShaderNodeMixShader')
_bsdf = _nt.nodes.new('ShaderNodeBsdfPrincipled')
_bsdf.inputs['Base Color'].default_value = (0.94, 0.97, 1.0, 1)
_bsdf.inputs['Roughness'].default_value = 0.03
_bsdf.inputs['Alpha'].default_value = 0.08
_bsdf.inputs['Transmission Weight'].default_value = 0.0
_bsdf.inputs['IOR'].default_value = 1.46
_nt.links.new(_bsdf.outputs[0], _out.inputs[0])
vidre.data.materials[0] = MAT_PREV

# el líquid, més opac a la foto per llegir bé el nivell
_pl.inputs['Alpha'].default_value = 1.0
scene.render.filepath = str(PNG)
bpy.ops.render.render(write_still=True)
print("PNG", PNG)

# ───────────────────────────────────────────────────────────────────────────
# 9. QA
# ───────────────────────────────────────────────────────────────────────────
def estat(ob):
    bm = bmesh.new(); bm.from_mesh(ob.data)
    out = {
        "vertexs": len(bm.verts),
        "cares": len(bm.faces),
        "no_manifold": sum(1 for e in bm.edges if not e.is_manifold),
        "volum_cm3": round(bm.calc_volume(signed=False) * 1e6, 3),
        "dims_mm": [round(d * 1000, 2) for d in ob.dimensions],
    }
    bm.free()
    return out

print("QA_BEGIN")
print(json.dumps({
    "asset": VARIANT_ID,
    "blender": bpy.app.version_string,
    "marca_mm": round(Z_MARK * 1000, 2),
    "capacitat_marca_mL": round(V_MARK, 3),
    "qa": {o.name: estat(o) for o in (vidre, marca, etiqueta, liq)},
    "shape_keys": [k.name for k in liq.data.shape_keys.key_blocks] if liq.data.shape_keys else [],
    "metadades": METADADES,
}, indent=1, ensure_ascii=False))
print("QA_END")
print("DONE", HERE)


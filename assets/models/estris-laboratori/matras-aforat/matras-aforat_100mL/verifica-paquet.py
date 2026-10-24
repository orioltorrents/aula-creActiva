"""
Verificació del paquet matras-aforat_100mL.

    blender -b -P verifica-paquet.py -- glb
    blender -b -P verifica-paquet.py -- glb-liquid
    blender -b -P verifica-paquet.py -- blend

Retorna codi 1 si alguna prova falla.
"""
import bpy
import bmesh
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
VARIANT = HERE.name
TOOL = HERE.parent.name
GLB = HERE / (VARIANT + ".glb")
GLB_LIQ = HERE / (VARIANT + "-amb-liquid.glb")
BLEND = HERE / (VARIANT + ".blend")
META_PATH = HERE / "metadades.json"

WEB_KEYS = ["tool_id", "variant_id", "label_ca", "capacity_ml",
            "graduation_type", "usage_tags", "measurement_note_ca"]

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["glb"]
MODE = args[0]
META = json.loads(META_PATH.read_text(encoding="utf-8"))
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))


def same(a, b):
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return [str(x) for x in a] == [str(x) for x in b]
    return a == b


def props_ok(obj, label):
    for key in WEB_KEYS:
        got = obj.get(key)
        check(f"{label}: {key}", got is not None and same(got, META[key]),
              f"={got!r} vs {META[key]!r}")


def resolve_variant(obj):
    node = obj
    while node is not None:
        if node.get("variant_id"):
            return node["variant_id"]
        node = node.parent
    return None


# noms i fitxers
check("carpeta de variant = variant_id", HERE.name == META["variant_id"], HERE.name)
check("carpeta de categoria = tool_id", HERE.parent.name == META["tool_id"], HERE.parent.name)
check("fitxers amb el nom de la variant",
      GLB.name == VARIANT + ".glb" and BLEND.name == VARIANT + ".blend",
      [GLB.name, BLEND.name])
check("metadades.json existeix", META_PATH.is_file(), str(META_PATH))


def obre_glb(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    return list(bpy.data.objects)


if MODE in ("glb", "glb-liquid"):
    path = GLB_LIQ if MODE == "glb-liquid" else GLB
    check("existeix el GLB", path.is_file(), str(path))
    objs = obre_glb(path)
    mallas = [o for o in objs if o.type == "MESH"]
    check("importa sense error", True, f"{len(objs)} objectes")
    check("cap càmera", not any(o.type == "CAMERA" for o in objs))
    check("cap llum", not any(o.type == "LIGHT" for o in objs))
    noms = " ".join(o.name.lower() for o in objs)
    check("cap sòl ni fons", not any(k in noms for k in ("superficie", "fons", "softbox")),
          [o.name for o in objs])

    te_liquid = any("liquid" in o.name.lower() for o in mallas)
    check("líquid present només a la variant amb líquid",
          te_liquid == (MODE == "glb-liquid"), te_liquid)

    vidre = next((o for o in mallas if "vidre" in o.name.lower()), None)
    check("malla de vidre present", vidre is not None, [o.name for o in mallas])
    if vidre:
        raiz = vidre.parent
        check("arrel EMPTY pròpia", raiz is not None and raiz.type == "EMPTY",
              raiz.name if raiz else None)
        check("clic a la malla resol la variant", resolve_variant(vidre) == VARIANT,
              resolve_variant(vidre))
        props_ok(vidre, "vidre")
        props_ok(raiz, "arrel")
        dims = [round(d * 1000, 1) for d in vidre.dimensions]
        check("dimensions del matràs (mm)", all(abs(a - b) < 0.8 for a, b in
                                                zip(dims, [60.0, 60.0, 175.0])), dims)
        check("marca d'aforament a 81,38 mm",
              abs(float(raiz.get("marca_aforament_mm", 0)) - 81.38) < 0.05,
              raiz.get("marca_aforament_mm"))
        marca = next((o for o in mallas if "marca" in o.name.lower()), None)
        check("objecte de la marca present", marca is not None, [o.name for o in mallas])
        tap = next((o for o in mallas if "tap" in o.name.lower()), None)
        check("tap present", tap is not None, [o.name for o in mallas])
        if tap:
            check("tap amb origen a la boca del coll",
                  abs(tap.matrix_world.translation.z - 0.1695) < 2e-3,
                  round(tap.matrix_world.translation.z, 4))
            check("tap marcat com a extraïble", bool(tap.get("removable")), tap.get("removable"))
            check("el clic al tap també resol la variant",
                  resolve_variant(tap) == VARIANT, resolve_variant(tap))

    if te_liquid:
        liq = next(o for o in mallas if "liquid" in o.name.lower())
        claus = [k.name for k in liq.data.shape_keys.key_blocks] if liq.data.shape_keys else []
        check("dos morph targets al líquid",
              "nivell_alt" in claus and "nivell_baix" in claus, claus)
        bm = bmesh.new(); bm.from_mesh(liq.data)
        vol = bm.calc_volume(signed=False) * 1e6
        bm.free()
        check("líquid enrasat (~100 mL)", 99.0 < vol < 101.0, round(vol, 3))

elif MODE == "blend":
    check("existeix el .blend", BLEND.is_file(), str(BLEND))
    bpy.ops.wm.open_mainfile(filepath=str(BLEND))
    scene = bpy.context.scene
    check("una sola escena", len(bpy.data.scenes) == 1, [s.name for s in bpy.data.scenes])
    check("unitats mètriques i escala 1,0",
          scene.unit_settings.system == "METRIC" and abs(scene.unit_settings.scale_length - 1.0) < 1e-9,
          (scene.unit_settings.system, scene.unit_settings.scale_length))
    check("cap objecte de fàbrica", "Cube" not in bpy.data.objects, list(bpy.data.objects.keys()))
    colecciones = {c.name: [o.name for o in c.objects] for c in bpy.data.collections}
    check("dues col·leccions", len(colecciones) == 2, list(colecciones))
    model = colecciones.get("MATRAS-AFORAT_100mL · model", [])
    check("model amb arrel i cinc peces", len(model) == 6, model)
    raiz = bpy.data.objects.get(VARIANT)
    check("arrel amb el nom de la variant", raiz is not None and raiz.type == "EMPTY",
          raiz.name if raiz else None)
    if raiz:
        props_ok(raiz, "arrel")
        check("marca a 81,38 mm",
              abs(float(raiz.get("marca_aforament_mm", 0)) - 81.38) < 0.05,
              raiz.get("marca_aforament_mm"))
    for nom in ("Vidre_matras_aforat_100mL", "Marca_aforament_100mL",
                "Etiqueta_100mL", "Liquid_100mL", "Tap_matras_aforat_100mL"):
        ob = bpy.data.objects.get(nom)
        check(f"existeix {nom}", ob is not None and ob.parent == raiz, nom)
        if ob:
            bm = bmesh.new(); bm.from_mesh(ob.data)
            nm = sum(1 for e in bm.edges if not e.is_manifold)
            bm.free()
            check(f"{nom} estanca", nm == 0, nm)
    liq = bpy.data.objects.get("Liquid_100mL")
    if liq and liq.data.shape_keys:
        zs = [v.co.z for v in liq.data.vertices]
        bm = bmesh.new(); bm.from_mesh(liq.data)
        vol = bm.calc_volume(signed=False) * 1e6
        bm.free()
        check("líquid enrasat (~100 mL)", 99.0 < vol < 101.0, round(vol, 3))
        check("cim del líquid a la marca", abs(max(zs) * 1000 - 81.38) < 1.5,
              round(max(zs) * 1000, 2))
else:
    check("mode vàlid", False, MODE)

fallides = [r for r in results if not r[1]]
for nom, ok, detall in results:
    print(("PASS " if ok else "FAIL ") + nom + ("" if ok else f"  -> {detall}"))
print(f"RESUM {MODE}: {len(results) - len(fallides)}/{len(results)} proves correctes")
if fallides:
    print("FALLIDES:", [r[0] for r in fallides])
    sys.exit(1)
print("OK", MODE, VARIANT)

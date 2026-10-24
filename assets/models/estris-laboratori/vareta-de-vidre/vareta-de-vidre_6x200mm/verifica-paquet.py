"""
Verificació del paquet vareta-de-vidre_6x200mm.

    blender -b -P verifica-paquet.py -- glb
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
BLEND = HERE / (VARIANT + ".blend")
META_PATH = HERE / "metadades.json"

WEB_KEYS = ["tool_id", "variant_id", "label_ca", "display_name", "category",
            "capacity_ml", "material_type", "graduation_type", "usage_tags",
            "measurement_note_ca"]

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


check("carpeta de variant = variant_id", HERE.name == META["variant_id"], HERE.name)
check("carpeta de categoria = tool_id", HERE.parent.name == META["tool_id"], HERE.parent.name)
check("fitxers amb el nom de la variant",
      GLB.name == VARIANT + ".glb" and BLEND.name == VARIANT + ".blend",
      [GLB.name, BLEND.name])
check("metadades.json existeix", META_PATH.is_file(), str(META_PATH))

if MODE == "glb":
    check("existeix el GLB", GLB.is_file(), str(GLB))
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(GLB))
    objs = list(bpy.data.objects)
    mallas = [o for o in objs if o.type == "MESH"]
    check("importa sense error", True, f"{len(objs)} objectes")
    check("una sola malla", len(mallas) == 1, [o.name for o in mallas])
    check("cap càmera", not any(o.type == "CAMERA" for o in objs))
    check("cap llum", not any(o.type == "LIGHT" for o in objs))
    noms = " ".join(o.name.lower() for o in objs)
    check("cap sòl ni fons", not any(k in noms for k in ("superficie", "fons", "softbox")),
          [o.name for o in objs])
    if mallas:
        m = mallas[0]
        raiz = m.parent
        check("malla amb el nom TOOL_", m.name.startswith("TOOL_"), m.name)
        check("arrel EMPTY pròpia", raiz is not None and raiz.type == "EMPTY",
              raiz.name if raiz else None)
        check("clic a la malla resol la variant", resolve_variant(m) == VARIANT,
              resolve_variant(m))
        props_ok(m, "malla")
        props_ok(raiz, "arrel")
        dims = sorted(round(d * 1000, 1) for d in m.dimensions)
        check("dimensions (mm)", all(abs(a - b) < 0.6 for a, b in
                                     zip(dims, [6.0, 6.0, 200.0])), dims)
        mats = [x for x in m.data.materials if x]
        check("un sol material", len(mats) == 1, [x.name for x in mats])
        if mats:
            p = next((n for n in mats[0].node_tree.nodes
                      if n.type == 'BSDF_PRINCIPLED'), None)
            t = p.inputs['Transmission Weight'].default_value if p else None
            check("vidre amb transmissió", t is not None and t > 0.9, t)

elif MODE == "blend":
    check("existeix el .blend", BLEND.is_file(), str(BLEND))
    bpy.ops.wm.open_mainfile(filepath=str(BLEND))
    scene = bpy.context.scene
    check("una sola escena", len(bpy.data.scenes) == 1, [s.name for s in bpy.data.scenes])
    check("unitats mètriques i escala 1,0",
          scene.unit_settings.system == "METRIC"
          and abs(scene.unit_settings.scale_length - 1.0) < 1e-9,
          (scene.unit_settings.system, scene.unit_settings.scale_length))
    check("cap objecte de fàbrica", "Cube" not in bpy.data.objects,
          list(bpy.data.objects.keys()))
    colecciones = {c.name: [o.name for o in c.objects] for c in bpy.data.collections}
    check("dues col·leccions", len(colecciones) == 2, list(colecciones))
    model = colecciones.get("VARETA-DE-VIDRE_6x200mm · model", [])
    check("model amb arrel i malla", len(model) == 2, model)
    raiz = bpy.data.objects.get(VARIANT)
    m = bpy.data.objects.get("TOOL_vareta_vidre")
    check("arrel amb el nom de la variant", raiz is not None and raiz.type == "EMPTY",
          raiz.name if raiz else None)
    check("malla filla de l'arrel", m is not None and m.parent == raiz,
          m.parent.name if m and m.parent else None)
    if raiz:
        props_ok(raiz, "arrel")
    if m:
        props_ok(m, "malla")
        check("origen de la malla a (0,0,0)",
              all(abs(v) < 1e-9 for v in m.location), tuple(m.location))
        check("transformacions aplicades",
              all(abs(v - 1.0) < 1e-9 for v in m.scale), tuple(m.scale))
        check("la malla està dreta (sense rotació)",
              all(abs(v) < 1e-9 for v in m.rotation_euler), tuple(m.rotation_euler))
        bm = bmesh.new()
        bm.from_mesh(m.data)
        nm = sum(1 for e in bm.edges if not e.is_manifold)
        vol = bm.calc_volume(signed=False) * 1e6
        bm.free()
        check("malla estanca (no_manifold = 0)", nm == 0, nm)
        check("volum de vidre coherent", 5.0 < vol < 6.2, round(vol, 3))
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

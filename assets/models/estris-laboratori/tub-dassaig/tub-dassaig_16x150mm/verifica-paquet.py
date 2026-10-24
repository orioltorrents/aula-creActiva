"""
Verificació del paquet tub-dassaig_16x150mm.

    blender --background --factory-startup --python verifica-paquet.py -- glb
    blender --background --factory-startup --python verifica-paquet.py -- blend

Comprova el contingut real del GLB (important-lo en una escena buida) i el
.blend, i els compara amb metadades.json. Retorna codi 1 si alguna prova falla.
"""
import bpy
import bmesh
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
VARIANT = HERE.name                 # el nom de la carpeta és la font de veritat
TOOL = HERE.parent.name             # i el de la carpeta de categoria
GLB = HERE / (VARIANT + ".glb")
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


# ── coherència de noms: carpeta, fitxers i metadades ────────────────────────
check("carpeta de variant = variant_id", HERE.name == META["variant_id"], HERE.name)
check("carpeta de categoria = tool_id", HERE.parent.name == META["tool_id"], HERE.parent.name)
check("fitxers amb el nom de la variant",
      GLB.name == VARIANT + ".glb" and BLEND.name == VARIANT + ".blend",
      [GLB.name, BLEND.name])
check("metadades.json existeix", META_PATH.is_file(), str(META_PATH))


def same(a, b):
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return [str(x) for x in a] == [str(x) for x in b]
    if isinstance(a, float) or isinstance(b, float):
        try:
            return abs(float(a) - float(b)) < 1e-6
        except (TypeError, ValueError):
            return False
    return a == b


def props_ok(obj, label):
    for key in WEB_KEYS:
        got = obj.get(key)
        check(f"{label}: {key}", got is not None and same(got, META[key]),
              f"GLB/.blend={got!r} metadades={META[key]!r}")


def resolve_variant(obj):
    """El que fa la web: pujar pels pares fins a trobar variant_id."""
    node = obj
    while node is not None:
        if node.get("variant_id"):
            return node["variant_id"]
        node = node.parent
    return None


if MODE == "glb":
    check("existeix el GLB", GLB.is_file(), str(GLB))
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(GLB))

    objetos = list(bpy.data.objects)
    mallas = [o for o in objetos if o.type == "MESH"]
    camaras = [o for o in objetos if o.type == "CAMERA"]
    luces = [o for o in objetos if o.type == "LIGHT"]

    check("el GLB importa sense error", True, f"{len(objetos)} objectes")
    check("una sola malla", len(mallas) == 1, [o.name for o in mallas])
    check("cap càmera", len(camaras) == 0, [o.name for o in camaras])
    check("cap llum", len(luces) == 0, [o.name for o in luces])
    check("cap sòl ni fons", not any(
        k in " ".join(o.name.lower() for o in objetos)
        for k in ("superficie", "fons", "softbox", "camera")), [o.name for o in objetos])

    if mallas:
        malla = mallas[0]
        raiz = malla.parent
        check("l'arrel és un EMPTY propi", raiz is not None and raiz.type == "EMPTY",
              raiz.name if raiz else None)
        check("identificador de la malla seleccionable",
              malla.get("variant_id") == VARIANT, malla.get("variant_id"))
        check("identificador a l'arrel",
              raiz is not None and raiz.get("variant_id") == VARIANT,
              raiz.get("variant_id") if raiz else None)
        check("clic a la malla resol la variant",
              resolve_variant(malla) == VARIANT, resolve_variant(malla))
        check("tool_id a l'arrel", raiz is not None and raiz.get("tool_id") == TOOL,
              raiz.get("tool_id") if raiz else None)
        props_ok(malla, "malla")
        props_ok(raiz, "arrel")

        dims = [round(d * 1000, 3) for d in malla.dimensions]
        esperat = [17.6, 17.6, 150.0]
        check("dimensions del GLB (mm)", all(abs(a - b) < 0.6 for a, b in zip(dims, esperat)),
              f"{dims} vs {esperat}")

        mats = [m for m in malla.data.materials if m]
        check("un sol material", len(mats) == 1, [m.name for m in mats])
        if mats:
            m = mats[0]
            p = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
            alpha = p.inputs["Alpha"].default_value if p else None
            check("vidre transparent (alpha 0,065)", alpha is not None and abs(alpha - 0.065) < 1e-4,
                  f"alpha={alpha}")

elif MODE == "blend":
    check("existeix el .blend", BLEND.is_file(), str(BLEND))
    bpy.ops.wm.open_mainfile(filepath=str(BLEND))

    scene = bpy.context.scene
    check("una sola escena", len(bpy.data.scenes) == 1, [s.name for s in bpy.data.scenes])
    check("unitats mètriques i escala 1,0",
          scene.unit_settings.system == "METRIC" and abs(scene.unit_settings.scale_length - 1.0) < 1e-9,
          (scene.unit_settings.system, scene.unit_settings.scale_length))
    check("cap objecte de fàbrica (Cube)", "Cube" not in bpy.data.objects, list(bpy.data.objects.keys()))

    colecciones = {c.name: [o.name for o in c.objects] for c in bpy.data.collections}
    check("dues col·leccions (model i estudi)", len(colecciones) == 2, list(colecciones))
    check("col·lecció de model", "TUB-DASSAIG_16x150mm · model" in colecciones, list(colecciones))
    check("col·lecció d'estudi", "ESTUDI · camera i llums" in colecciones, list(colecciones))

    modelo = [o for o in bpy.data.objects
              if o.name in colecciones.get("TUB-DASSAIG_16x150mm · model", [])]
    check("el model té arrel i una malla", len(modelo) == 2, [o.name for o in modelo])

    raiz = bpy.data.objects.get(VARIANT)
    malla = bpy.data.objects.get("Vidre_tub_dassaig_16x150mm")
    check("arrel amb el nom de la variant", raiz is not None and raiz.type == "EMPTY",
          raiz.name if raiz else None)
    check("malla filla de l'arrel", malla is not None and malla.parent == raiz,
          malla.parent.name if malla and malla.parent else None)

    if raiz is not None:
        props_ok(raiz, "arrel")
        check("dades de l'instrument a l'arrel",
              abs(float(raiz.get("diametre_llavi_mm", 0)) - 17.6) < 1e-6
              and abs(float(raiz.get("alcada_mm", 0)) - 150.0) < 1e-6,
              (raiz.get("diametre_llavi_mm"), raiz.get("alcada_mm")))
    if malla is not None:
        props_ok(malla, "malla")
        bm = bmesh.new(); bm.from_mesh(malla.data)
        nm = sum(1 for e in bm.edges if not e.is_manifold)
        vol = round(bm.calc_volume(signed=False) * 1e6, 3)
        bm.free()
        check("malla estanca (no_manifold = 0)", nm == 0, nm)
        check("volum de vidre coherent", abs(vol - 8.384) < 0.01, vol)

else:
    check("mode vàlid (glb|blend)", False, MODE)

fallides = [r for r in results if not r[1]]
for nom, ok, detall in results:
    print(("PASS " if ok else "FAIL ") + nom + ("" if ok else f"  -> {detall}"))
print(f"RESUM {MODE}: {len(results) - len(fallides)}/{len(results)} proves correctes")
if fallides:
    print("FALLIDES:", [r[0] for r in fallides])
    sys.exit(1)
print("OK", MODE, VARIANT)

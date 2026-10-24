"""Export the current laboratory-tool Blender file as a web-ready GLB."""

import json
import os
import re
import struct
from pathlib import Path

import bpy


ROOT = Path(
    os.environ.get("ESTRIS_CATALOG_ROOT", Path(__file__).resolve().parent)
).resolve()
LEGACY_TOOL_DEFAULTS = {
    "vas-de-precipitats": {
        "type": "vas de precipitats",
        "label": "Vas de precipitats",
        "graduation_type": "approximate",
        "usage_tags": ["contain-liquid", "mix", "approximate-volume"],
        "measurement_note_ca": (
            "Graduacions aproximades; no és material volumètric de precisió."
        ),
    },
    "proveta": {
        "type": "proveta",
        "label": "Proveta",
        "graduation_type": "graduated",
        "usage_tags": ["measure-volume"],
        "measurement_note_ca": "Model didàctic; no certificat de calibratge.",
    },
    "matras-erlenmeyer": {
        "type": "erlenmeyer",
        "label": "Matràs d'Erlenmeyer",
        "graduation_type": "approximate",
        "usage_tags": ["contain-liquid", "mix", "approximate-volume"],
        "measurement_note_ca": (
            "Graduacions aproximades; no és material volumètric de precisió."
        ),
    },
}
STANDARD_METADATA_KEYS = {
    "tool_id",
    "variant_id",
    "label_ca",
    "capacity_ml",
    "graduation_type",
    "usage_tags",
    "measurement_note_ca",
    "graduation_interval_ml",
}
METADATA_ALIASES = {
    "capacitat_ml": "capacity_ml",
    "divisio_ml": "graduation_interval_ml",
}


def normalize_id_property(value):
    if hasattr(value, "to_list"):
        return [normalize_id_property(item) for item in value.to_list()]
    if isinstance(value, dict) or hasattr(value, "items"):
        return {
            str(key): normalize_id_property(item)
            for key, item in value.items()
        }
    if isinstance(value, (list, tuple)):
        return [normalize_id_property(item) for item in value]
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    raise TypeError(f"Unsupported Blender custom property value: {type(value)}")


def find_model_root(tool_id, variant_id, capacity_ml):
    identified = [
        obj
        for obj in bpy.data.objects
        if obj.type == "EMPTY" and obj.get("variant_id") == variant_id
    ]
    if len(identified) == 1:
        return identified[0]
    if len(identified) > 1:
        raise RuntimeError(
            f"Multiple model roots have variant_id {variant_id}: "
            f"{[obj.name for obj in identified]}"
        )

    legacy = LEGACY_TOOL_DEFAULTS.get(tool_id)
    if legacy is None or capacity_ml is None:
        raise RuntimeError(
            f"No model root declares variant_id {variant_id}. "
            "Set tool_id and variant_id as custom properties on the model root."
        )
    candidates = [
        obj
        for obj in bpy.data.objects
        if obj.type == "EMPTY"
        and obj.get("capacitat_ml") is not None
        and round(float(obj["capacitat_ml"])) == capacity_ml
        and legacy["type"] in str(obj.get("tipus", "")).lower()
    ]
    if len(candidates) != 1:
        raise RuntimeError(
            f"Expected one legacy {tool_id} root at {capacity_ml} mL, "
            f"found {[obj.name for obj in candidates]}"
        )
    return candidates[0]


def get_capacity(root, variant_id):
    value = root.get("capacity_ml", root.get("capacitat_ml"))
    if value is not None:
        return float(value) if isinstance(value, float) else int(value)
    match = re.search(r"_(\d+)m[lL]$", variant_id)
    return int(match.group(1)) if match else None


def get_root_metadata(root):
    metadata = {}
    for key, value in root.items():
        if key.startswith("_"):
            continue
        normalized_key = METADATA_ALIASES.get(key, key)
        metadata[normalized_key] = normalize_id_property(value)
    return metadata


def get_metadata(root, tool_id, variant_id, capacity_ml):
    metadata = get_root_metadata(root)
    legacy = LEGACY_TOOL_DEFAULTS.get(tool_id)

    if legacy is None:
        required = ("label_ca", "graduation_type", "usage_tags")
        missing = [key for key in required if metadata.get(key) is None]
        if missing:
            raise RuntimeError(
                f"New tool category {tool_id} must define custom properties "
                f"{missing} on its model root."
            )
    else:
        metadata.setdefault(
            "label_ca",
            legacy["label"]
            + (f" de {capacity_ml:g} mL" if capacity_ml is not None else ""),
        )
        metadata.setdefault("graduation_type", legacy["graduation_type"])
        metadata.setdefault("usage_tags", legacy["usage_tags"])
        metadata.setdefault(
            "measurement_note_ca", legacy["measurement_note_ca"]
        )

    metadata["tool_id"] = tool_id
    metadata["variant_id"] = variant_id
    if capacity_ml is None:
        metadata.pop("capacity_ml", None)
    else:
        metadata["capacity_ml"] = capacity_ml
    if metadata.get("measurement_note_ca") is None:
        metadata.pop("measurement_note_ca", None)
    return metadata


def validate_glb(path, metadata):
    data = path.read_bytes()
    if len(data) < 20 or data[:4] != b"glTF":
        raise RuntimeError(f"Export did not produce a valid GLB: {path}")
    magic, version, declared_length = struct.unpack_from("<III", data, 0)
    if magic != 0x46546C67 or version != 2 or declared_length != len(data):
        raise RuntimeError(f"Invalid GLB header or length: {path}")

    offset = 12
    document = None
    while offset + 8 <= len(data):
        chunk_length, chunk_type = struct.unpack_from("<II", data, offset)
        offset += 8
        chunk_end = offset + chunk_length
        if chunk_end > len(data):
            raise RuntimeError(f"Invalid GLB chunk length: {path}")
        if chunk_type == 0x4E4F534A:
            document = json.loads(data[offset:chunk_end].decode("utf-8"))
            break
        offset = chunk_end
    if document is None:
        raise RuntimeError(f"GLB has no JSON chunk: {path}")

    expected_ids = {
        "tool_id": metadata["tool_id"],
        "variant_id": metadata["variant_id"],
    }
    if not any(
        all((node.get("extras") or {}).get(key) == value
            for key, value in expected_ids.items())
        for node in document.get("nodes", [])
    ):
        raise RuntimeError(f"GLB is missing model identifiers: {path}")
    if not any(mesh.get("primitives") for mesh in document.get("meshes", [])):
        raise RuntimeError(f"GLB contains no renderable mesh primitives: {path}")


def main():
    blend_path = Path(bpy.data.filepath).resolve()
    if not blend_path.is_file():
        raise RuntimeError("Open a saved .blend file before running this exporter.")

    variant_id = blend_path.parent.name
    tool_id = blend_path.parent.parent.name
    capacity_match = re.search(r"_(\d+)m[lL]$", variant_id)
    filename_capacity = (
        int(capacity_match.group(1)) if capacity_match else None
    )
    root = find_model_root(tool_id, variant_id, filename_capacity)
    if root.get("tool_id") not in (None, tool_id):
        raise RuntimeError(
            f"Model root tool_id {root['tool_id']} does not match "
            f"category folder {tool_id}."
        )
    capacity_ml = get_capacity(root, variant_id)
    model_collections = [
        collection
        for collection in root.users_collection
        if "model" in collection.name.lower()
    ]
    if len(model_collections) != 1:
        raise RuntimeError(
            f"Expected one model collection for {root.name}, "
            f"found {[collection.name for collection in model_collections]}"
        )

    collection = model_collections[0]
    objects = list(collection.objects)
    if root not in objects:
        raise RuntimeError(f"{root.name} is not in {collection.name}")
    liquid_objects = [
        obj for obj in objects if "liquid" in obj.name.lower()
    ]
    base_objects = [obj for obj in objects if obj not in liquid_objects]
    if not base_objects:
        raise RuntimeError(f"No exportable objects found for {variant_id}")

    metadata = get_metadata(root, tool_id, variant_id, capacity_ml)
    for obj in objects:
        for key, value in metadata.items():
            obj[key] = value

    bpy.ops.object.select_all(action="DESELECT")
    for obj in base_objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = root

    glb_path = blend_path.with_suffix(".glb")
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        use_selection=True,
        use_active_collection=True,
        use_active_collection_with_nested=False,
        collection=collection.name,
        export_extras=True,
        export_animations=False,
    )
    validate_glb(glb_path, metadata)

    liquid_paths = set()
    if liquid_objects:
        liquid_paths.add(
            blend_path.parent / f"{variant_id}-amb-liquid.glb"
        )
        liquid_paths.update(
            blend_path.parent.glob(f"{variant_id}-amb-liquid*.glb")
        )
        for path in sorted(liquid_paths):
            bpy.ops.object.select_all(action="DESELECT")
            for obj in objects:
                obj.select_set(True)
            bpy.context.view_layer.objects.active = root
            bpy.ops.export_scene.gltf(
                filepath=str(path),
                export_format="GLB",
                use_selection=True,
                use_active_collection=True,
                use_active_collection_with_nested=False,
                collection=collection.name,
                export_extras=True,
                export_animations=False,
            )
            validate_glb(path, metadata)

    catalog_path = ROOT / "catalog-estris.json"
    catalog = {"schema_version": 1, "models": []}
    if catalog_path.exists():
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    models = {
        item["variant_id"]: item
        for item in catalog.get("models", [])
    }
    model_record = {
        **metadata,
        "model": glb_path.relative_to(ROOT).as_posix(),
    }
    if liquid_objects:
        liquid_path = blend_path.parent / f"{variant_id}-amb-liquid.glb"
        model_record["model_with_liquid"] = (
            liquid_path.relative_to(ROOT).as_posix()
        )
    models[variant_id] = model_record
    catalog["models"] = sorted(
        models.values(), key=lambda item: item["variant_id"]
    )
    catalog_path.write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Exported {variant_id}: {glb_path}")
    for path in sorted(liquid_paths):
        print(f"Exported liquid variant: {path}")
    print(f"Updated catalog: {catalog_path}")


main()

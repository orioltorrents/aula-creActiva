# SPDX-License-Identifier: AGPL-3.0-or-later
"""Genera sequencies de fotogrames WebP per a la vista Moviment del capitol El coto.

Us:
  blender -b -P assets/blender/render_textil_moviment.py
  blender -b -P assets/blender/render_textil_moviment.py -- --only jenny,mula --frames 24
"""

import importlib
import os
import sys

import bpy

THIS_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(THIS_DIR, "..", ".."))
MOV_DIR = os.path.join(ROOT_DIR, "img", "moviment")
if THIS_DIR not in sys.path:
    sys.path.insert(0, THIS_DIR)

SCENES = {
    "llancadora": ("llancadora_3d", "build_llancadora_scene"),
    "jenny": ("jenny_3d", "build_jenny_scene"),
    "water": ("water_3d", "build_water_scene"),
    "mula": ("mula_3d", "build_mula_scene"),
    "cartwright": ("cartwright_3d", "build_cartwright_scene"),
}


def parse_args():
    only = list(SCENES.keys())
    n_frames = 28
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    i = 0
    while i < len(argv):
        if argv[i] == "--only" and i + 1 < len(argv):
            only = [x.strip() for x in argv[i + 1].split(",") if x.strip() in SCENES]
            i += 2
        elif argv[i] == "--frames" and i + 1 < len(argv):
            n_frames = max(8, int(argv[i + 1]))
            i += 2
        else:
            i += 1
    return only, n_frames


def render_machine_frames(mach_id, n_frames):
    mod_name, fn_name = SCENES[mach_id]
    mod = importlib.import_module(mod_name)
    build_fn = getattr(mod, fn_name)
    build_fn(animate=True)

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 10
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 4
    scene.render.film_transparent = not bool(scene.get("render_room"))
    scene.render.resolution_x = 840
    scene.render.resolution_y = 532
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.color_mode = "RGB"
    scene.render.image_settings.quality = 80
    scene.view_settings.view_transform = "AgX"

    os.makedirs(MOV_DIR, exist_ok=True)
    for idx in range(n_frames):
        p = idx / float(n_frames)
        f_float = max(1.0, min(60.0, 1.0 + p * 60.0))
        fr = int(f_float)
        sub = f_float - fr
        scene.frame_set(fr, subframe=sub)
        out_path = os.path.join(MOV_DIR, f"{mach_id}-{idx:02d}.webp")
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
    print(f"MOVIMENT_OK {mach_id} frames={n_frames}", flush=True)


def main():
    only, n_frames = parse_args()
    for mach_id in only:
        render_machine_frames(mach_id, n_frames)


if __name__ == "__main__":
    main()

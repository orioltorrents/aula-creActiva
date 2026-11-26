# SPDX-License-Identifier: AGPL-3.0-or-later
"""Comprimeix els models 3D (.glb) que exporta Blender perquè el visor carregui ràpid.

- Geometria amb Draco (el visor <model-viewer> ja porta el descompressor).
- Textures en WebP (màxim 1024 px).
- Ajunta les peces fixes i elimina dades repetides; no simplifica la geometria
  ni toca les animacions.

Cal Node.js. La primera vegada, npx descarrega @gltf-transform/cli.

Ús (des de la carpeta del web):
  python assets/optimitza_models.py              # tots els models encara sense comprimir
  python assets/optimitza_models.py mula jenny   # només aquests

Després d'exportar un model de nou des de Blender, torna a executar aquest script:
els fitxers ja comprimits se salten.
"""
import json
import shutil
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

MODELS = Path(__file__).resolve().parent / 'models'
CLI = '@gltf-transform/cli@4.5.1'
OPCIONS = ['--compress', 'draco', '--texture-compress', 'webp', '--texture-size', '1024',
           '--simplify', 'false', '--palette', 'false']


def ja_comprimit(glb: Path) -> bool:
    b = glb.read_bytes()
    longitud = struct.unpack('<I', b[12:16])[0]
    info = json.loads(b[20:20 + longitud])
    return 'KHR_draco_mesh_compression' in info.get('extensionsUsed', [])


def main(noms):
    fitxers = [MODELS / f'{n}.glb' for n in noms] if noms else sorted(MODELS.glob('*.glb'))
    npx = shutil.which('npx') or shutil.which('npx.cmd')
    if not npx:
        sys.exit('Cal Node.js (npx) per comprimir els models.')
    for glb in fitxers:
        if not glb.exists():
            print(f'No existeix: {glb.name}')
            continue
        if ja_comprimit(glb):
            print(f'Ja comprimit: {glb.name}')
            continue
        abans = glb.stat().st_size
        with tempfile.TemporaryDirectory() as tmp:
            sortida = Path(tmp) / glb.name
            subprocess.run([npx, '--yes', CLI, 'optimize', str(glb), str(sortida), *OPCIONS],
                           check=True, capture_output=True)
            shutil.move(str(sortida), glb)
        print(f'{glb.name}: {abans // 1024} KB -> {glb.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main(sys.argv[1:])

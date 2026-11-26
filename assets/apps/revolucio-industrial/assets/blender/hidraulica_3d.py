# SPDX-License-Identifier: AGPL-3.0-or-later
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fabrica_comu_3d import build_fabrica

if __name__ == "__main__":
    build_fabrica(mode="aigua", animate=True)

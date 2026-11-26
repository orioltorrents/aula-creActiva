# SPDX-License-Identifier: AGPL-3.0-or-later
"""Genera les geometries SVG dels mapes amb PyQGIS 3.44.

Execució a Windows:
  & 'C:\\Program Files\\QGIS 3.44.15\\bin\\python-qgis-ltr.bat' assets\\gis\\genera_mapes.py

El traçat de 1830 uneix punts històrics documentats però no és un aixecament
de la via. La corba atlàntica és una connexió entre ports, no un diari de bord.
"""

import json
from pathlib import Path

from qgis.core import (
    QgsApplication,
    QgsCoordinateReferenceSystem,
    QgsCoordinateTransform,
    QgsGeometry,
    QgsPointXY,
    QgsProject,
    QgsRectangle,
    QgsVectorLayer,
)

HERE = Path(__file__).resolve().parent
QgsApplication.setPrefixPath(r"C:\Program Files\QGIS 3.44.15\apps\qgis-ltr", True)
app = QgsApplication([], False)
app.initQgis()

wgs84 = QgsCoordinateReferenceSystem("EPSG:4326")
project = QgsProject.instance().transformContext()
land = QgsVectorLayer(
    "/vsizip/" + (HERE / "ne_10m_land.zip").as_posix() + "/ne_10m_land.shp",
    "Natural Earth 10m land",
    "ogr",
)
if not land.isValid():
    raise RuntimeError("No es pot obrir ne_10m_land.zip")


def make_map(name, epsg, bounds, pixels, simplify_m, route, places):
    target = QgsCoordinateReferenceSystem(epsg)
    tr = QgsCoordinateTransform(wgs84, target, project)
    p0 = tr.transform(QgsPointXY(bounds[0], bounds[1]))
    p1 = tr.transform(QgsPointXY(bounds[2], bounds[3]))
    xmin, xmax = sorted((p0.x(), p1.x()))
    ymin, ymax = sorted((p0.y(), p1.y()))
    width, height = pixels

    def screen(pt):
        return [round((pt.x() - xmin) * width / (xmax - xmin), 1),
                round((ymax - pt.y()) * height / (ymax - ymin), 1)]

    def point(lon, lat):
        return screen(tr.transform(QgsPointXY(lon, lat)))

    def path(points):
        return "M" + "L".join(f"{x:g} {y:g}" for x, y in points) + "Z"

    clip = QgsGeometry.fromRect(QgsRectangle(*bounds))
    polygons = []
    for feature in land.getFeatures():
        geom = feature.geometry()
        if not geom.boundingBox().intersects(clip.boundingBox()):
            continue
        geom = geom.intersection(clip)
        if geom.isEmpty():
            continue
        geom.transform(tr)
        geom = geom.simplify(simplify_m)
        groups = geom.asMultiPolygon() if geom.isMultipart() else [geom.asPolygon()]
        for polygon in groups:
            for ring in polygon:
                if len(ring) >= 4:
                    polygons.append(path([screen(p) for p in ring]))

    route_points = [point(lon, lat) for lon, lat in route]
    named = {label: point(lon, lat) for label, lon, lat in places}
    return {"crs": epsg, "bounds": bounds, "land": "".join(polygons),
            "route": route_points, "places": named,
            "scale20": round(20000 * width / (xmax - xmin), 1)}


# La seqüència segueix la ruta general de 1830: Crown Street/Edge Hill,
# Rainhill, Parkside, Chat Moss i Liverpool Road. Els vèrtexs intermedis
# serveixen només per a la lectura cartogràfica i no representen rails exactes.
rail = make_map(
    "rail", "EPSG:27700", [-3.16, 53.34, -2.17, 53.59], (1200, 640), 180,
    [(-2.967, 53.403), (-2.943, 53.401), (-2.895, 53.406),
     (-2.839, 53.409), (-2.775, 53.416), (-2.712, 53.428),
     (-2.646, 53.453), (-2.581, 53.455), (-2.505, 53.464),
     (-2.427, 53.468), (-2.348, 53.478), (-2.257, 53.478)],
    [("Liverpool", -2.967, 53.403), ("Rainhill", -2.775, 53.416),
     ("Parkside", -2.646, 53.453), ("Chat Moss", -2.505, 53.464),
     ("Manchester", -2.257, 53.478)],
)

# Itinerari explicatiu entre Bristol i Nova York. No es conserva una derrota
# diària georeferenciada del primer viatge del Great Western (abril de 1838).
sea = make_map(
    "sea", "EPSG:3857", [-83, 29, 5, 65], (1200, 640), 18000,
    [(-2.60, 51.45), (-6.0, 51.0), (-17.0, 49.8), (-31.0, 48.2),
     (-45.0, 46.5), (-58.0, 44.4), (-67.0, 42.5), (-74.01, 40.70)],
    [("Bristol", -2.60, 51.45), ("Nova York", -74.01, 40.70)],
)

result = {"rail": rail, "sea": sea}
text = "// SPDX-License-Identifier: AGPL-3.0-or-later\n" + \
       "/* Geometria generada amb QGIS 3.44 i Natural Earth 10m. */\n" + \
       "window.RI_MAPES = " + json.dumps(result, ensure_ascii=False, separators=(",", ":")) + ";\n"
(HERE / "mapes-geometria.js").write_text(text, encoding="utf-8")
print("Mapa ferroviari:", len(rail["land"]), "caràcters de costa;")
print("Mapa atlàntic:", len(sea["land"]), "caràcters de costa;")
print("Sortida:", HERE / "mapes-geometria.js")

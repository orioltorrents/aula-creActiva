# Mapes de les rutes

Els mapes de `tren.html#mapa` i `vaixell.html#atlantic` combinen geometria generada amb **QGIS 3.44.15 LTR** i una capa SVG animada pròpia. El fitxer `mapes-geometria.js` conté les costes de Natural Earth projectades i simplificades, els punts i les línies de ruta. `genera_mapes.py` el regenera des del fitxer de dades original `ne_10m_land.zip`:

```powershell
& 'C:\Program Files\QGIS 3.44.15\bin\python-qgis-ltr.bat' assets\gis\genera_mapes.py
```

La sortida és estàtica i funciona al navegador sense instal·lar QGIS a l'ordinador de l'alumne. QGIS s'utilitza per transformar les coordenades a **British National Grid (EPSG:27700)** al mapa ferroviari i **Web Mercator (EPSG:3857)** a l'Atlàntic, retallar i simplificar les costes i calcular l'escala gràfica del mapa ferroviari.

## Què és històric i què és esquemàtic

- **Ferrocarril, 1830:** Crown Street/Edge Hill (Liverpool), Rainhill, Parkside, Chat Moss i Liverpool Road (Manchester) són punts històrics. La línia que els uneix és una **reconstrucció aproximada**, no l'aixecament del traçat exacte ni un mapa de les estacions de 1830. La distància presentada com «uns 50 km» correspon a l'ordre de magnitud de les 31 milles indicades pel Science and Industry Museum. La durada d'1 h i 30 min correspon al servei directe de primera classe, no a tots els trens.
- **Mar, abril de 1838:** el *Great Western* surt de Bristol el 8 d'abril i arriba a Nova York el dia 23. El Royal Museums Greenwich dona una durada de **15 dies i mig**. La línia entre ports és una **connexió geogràfica esquemàtica**, no la derrota real; no se'n disposa aquí d'un diari de navegació georeferenciat. La distància indicada, **uns 5.400 km en línia recta**, és la distància aproximada entre les coordenades dels ports, no la distància navegada.
- **Comparació amb la vela:** l'estimació «entorn de cinc setmanes» resumeix la durada de viatges de passatgers cap a l'oest en la dècada de 1840, segons una recerca de dades històriques. **No** és el temps d'un veler que sortís de Bristol al mateix moment que el *Great Western*. Els dos vaixells animats i les dues barres de temps són una comparació orientativa de durades, no una cursa real.
- Les costes de Natural Earth representen geografia actual generalitzada, no la línia de costa documentada l'any 1830 o 1838.

## Fonts

- [Universitat de Manchester, *Liverpool's Lost Railway Heritage*, figura 1](https://hummedia.manchester.ac.uk/institutes/mui/marg/research/projects/past-projects/Liverpool_Lost_Railway_Heritage.pdf): mapa de referència de la ruta original i els punts intermedis.
- [Science and Industry Museum, *Extremes in the museum collection*](https://blog.scienceandindustrymuseum.org.uk/extremes/): trajecte de 31 milles de la Rocket.
- [Science and Industry Museum, guia *Revolution Manchester — Move*](https://www.scienceandindustrymuseum.org.uk/sites/default/files/2023-07/2703_REV_MAN_Move-LPG_DIGITAL_AW-compressed.pdf): 1 h i 30 min per al servei directe de primera classe.
- [Historic England, Liverpool and Manchester Railway](https://historicengland.org.uk/listing/heritage-gateway/results/record/40b1668f-44ca-471f-970f-e86d7ea4f9ac/MGM22274): terminal de Crown Street, Parkside i obertura de 1830.
- [Royal Museums Greenwich, *Sail to steam*](https://www.rmg.co.uk/stories/ocean/sailing-ships-steam-power-how-industrial-revolution-changed-life-sea-forever): 15 dies i mig del primer viatge del *Great Western*.
- [SS Great Britain Trust, pla de conservació](https://www.ssgreatbritain.org/wp-content/uploads/2021/05/ssGBConservationPlanVol2.pdf): sortida el 8 d'abril i arribada el 23 d'abril de 1838.
- [Hatton, *Time on the Crossing* (2023), IZA](https://docs.iza.org/dp16274.pdf): aproximadament cinc setmanes per als velers de passatgers de la dècada de 1840; també adverteix que no hi ha una sèrie anual completa per a aquell període.
- [Natural Earth, *Land 1:10m*](https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-land/) i [condicions d'ús](https://www.naturalearthdata.com/about/terms-of-use/): base de terra en domini públic.

Les coordenades manuals dels punts es conserven a `genera_mapes.py`; són aproximacions per a una visualització didàctica. Les línies, els rètols i les animacions originals del web es comparteixen sota CC BY-NC-SA 4.0, segons la llicència del projecte.

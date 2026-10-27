# Memòria Global del Projecte: aulaCreActiva

## Estat actual
- `AGENTS.md` conté les regles permanents; aquest fitxer conserva només l'estat, els riscos i els tres últims passos significatius.
- L'activitat d'Estris de laboratori és una activitat 3D compartida entre Biologia i Física i Química.
- El banc de laboratori inclou preguntes de noms, funcions, capacitats, materials, àcids, selecció 3D i comparació de volums.
- Física i Química té projectes per a 2n, 3r i 4t ESO amb un únic hub i una única activitat de laboratori reutilitzada.
- Els models i les dades del laboratori viuen a `assets/models/estris-laboratori/`.
- El laboratori de Biologia inclou el submenú `Microscopi òptic` i l'activitat 3D comparteix el model de `assets/models/microscopi-optic/`.
- El GLB del microscopi s'ha reexportat amb els materials clars reduïts un 18% per evitar saturació al visor web; conserva 179 nodes i totes les categories del JSON.
- Ràdio té un projecte per a 1r ESO només amb Connexions i un projecte per a 2n ESO amb Connexions i Taula de So, compartint el mateix codi.

## Riscos oberts
- Cal fer una prova manual de la navegació del laboratori des dels tres projectes de Física i Química i comprovar el retorn al menú.
- Cal desplegar Apps Script després dels canvis de `api/Projects.gs`.
- El catàleg del backend encara ha d'incorporar els projectes de Física i Química per mantenir-se coherent amb el catàleg local.
- La carpeta `assets/models/estris-laboratori/reixeta/` és un canvi local pendent d'integració i no s'ha modificat.
- Cal fer una prova manual del visor del microscopi en navegador, especialment clics sobre grups de submalles i el retorn al submenú.

## Millores pendents
- Provar manualment que Ràdio 1r ESO només mostra Connexions i que Ràdio 2n ESO mostra Connexions i La Taula de So.
- Revisar les traduccions del nom “Mediterràniament” en castellà, anglès i àrab.
- Afegir una validació automàtica que comprovi les rutes dels projectes i les activitats compartides.
- Revisar els estils inline generats des de `js/app.js`; el renderitzat de targetes de projecte construeix un atribut `style`.
- Completar el tancament del bloc de codi del Check 7 al final d'`AGENTS.md`.

## Tres últims passos

### 2026-10-24 - Comparació de volums en provetes
- Exportades les variants de proveta amb líquid a 300 mL i 200 mL.
- Afegida una pregunta per calcular els 100 mL abocats entre els dos nivells.

### 2026-10-24 - Projectes de Física i Química
- Afegits `p2_fisica_quimica`, `p3_fisica_quimica` i `p4_fisica_quimica` al dashboard.
- Els tres projectes comparteixen `fragments/projects/fisica-quimica/index.html` i l'activitat `bio-activity-lab-tools-3d`.

### 2026-10-27 - Microscopi òptic 3D
- Afegides les targetes jeràrquiques de Laboratori i el submenú de parts del microscopi.
- Afegits el JSON d'anatomia, el visor Three.js amb OrbitControls/Raycaster, preguntes de selecció i desament de resultats.
- Validats els 179 nodes del GLB, les 14 categories configurades, les 12 preguntes, la sintaxi JavaScript i el balanç de `div` del fragment.

### 2026-10-27 - Ajust visual del microscopi
- Rebaixats els materials clars del blend i reexportat `microscopi-optic-complet.glb`.
- Verificada la correspondència entre el GLB reexportat i les 14 categories del JSON.

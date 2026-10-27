# Memòria Global del Projecte: aulaCreActiva

## Estat actual
- `AGENTS.md` conté les regles permanents; aquest fitxer conserva només l'estat, els riscos i els tres últims passos significatius.
- L'activitat d'Estris de laboratori és una activitat 3D compartida entre Biologia i Física i Química.
- El banc de laboratori inclou preguntes de noms, funcions, capacitats, materials, àcids, selecció 3D i comparació de volums.
- Física i Química té projectes per a 2n, 3r i 4t ESO amb un únic hub i una única activitat de laboratori reutilitzada.
- Els models i les dades del laboratori viuen a `assets/models/estris-laboratori/`.
- La targeta `Microscopi òptic` del laboratori obre directament l'activitat 3D, que comparteix el model de `assets/models/microscopi-optic/`.
- El GLB del microscopi s'ha reexportat amb els materials clars reduïts un 18% per evitar saturació al visor web; conserva 179 nodes i totes les categories del JSON.
- El visor del microscopi inclou controls del revòlver i enfocament: el primer gira `MIC_Revolver` sobre Y de glTF i el segon mou `MIC_Suport_Enfocament` amb límits i comprovació de col·lisions.
- Ràdio té un projecte per a 1r ESO només amb Connexions i un projecte per a 2n ESO amb Connexions i Taula de So, compartint el mateix codi.

## Riscos oberts
- Cal fer una prova manual de la navegació del laboratori des dels tres projectes de Física i Química i comprovar el retorn al menú.
- Cal fer una prova manual del gir del revòlver, l'arrossegament dels quatre comandaments i la col·lisió amb els objectius en dispositius tàctils.
- Cal desplegar Apps Script després dels canvis de `api/Projects.gs`.
- El catàleg del backend encara ha d'incorporar els projectes de Física i Química per mantenir-se coherent amb el catàleg local.
- La carpeta `assets/models/estris-laboratori/reixeta/` és un canvi local pendent d'integració i no s'ha modificat.

## Millores pendents
- Provar manualment que Ràdio 1r ESO només mostra Connexions i que Ràdio 2n ESO mostra Connexions i La Taula de So.
- Revisar les traduccions del nom “Mediterràniament” en castellà, anglès i àrab.
- Afegir una validació automàtica que comprovi les rutes dels projectes i les activitats compartides.
- Revisar els estils inline generats des de `js/app.js`; el renderitzat de targetes de projecte construeix un atribut `style`.
- Completar el tancament del bloc de codi del Check 7 al final d'`AGENTS.md`.

## Tres últims passos

### 2026-10-27 - Microscopi òptic 3D
- Afegits els controls interactius del revòlver i de l'enfocament al visor Three.js.
- Configurats els eixos Blender/glTF, les velocitats en mm/radià, els límits de recorregut i la prevenció d'interseccions amb els objectius.
- Validats els nodes necessaris del GLB, la configuració JSON, la sintaxi JavaScript i el balanç de `div` del fragment.

### 2026-10-27 - Ajust visual del microscopi
- Rebaixats els materials clars del blend i reexportat `microscopi-optic-complet.glb`.
- Verificada la correspondència entre el GLB reexportat i les 14 categories del JSON.

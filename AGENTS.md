# AGENTS.md

Guia de treball per a agents i col·laboradors del projecte **Aula CreActiva**.

Aquest projecte és una web app educativa estàtica amb HTML, CSS i JavaScript. La prioritat és mantenir el codi clar, modular i fàcil de mantenir durant el curs.

## Objectiu

Donar orientacions per treballar amb coherència en l’estructura actual del projecte, amb especial èmfasi en fragments, CSS BEM i navegació JavaScript.

## Estructura principal

### HTML i shell
- `index.html`: shell principal amb el contenidor global `#app`.

### Fragments (views dinàmiques)
- `fragments/screens/`: pantalles base (`login.html`, `dashboard.html`, `game-screen.html`).
- `fragments/projects/`: continguts de projectes per injecció dinàmica.
- `fragments/activities/`: activitats i continguts associats per projecte.

### CSS
- `css/style.css`: manifest d'importació que carrega les fulles d'estil reals.
- `css/base/`: base global (`base.css`, `tokens.css`).
- `css/components/`: estils de components reutilitzables (botons, targetes, panells).
- `css/pages/`: estils de pàgines específiques.
- `css/layout/`: estils de shell i estructures grans.
- `css/utilities/`: utilitats i utilities (idioma, espaciament, etc.).

### JavaScript
- `js/app.js`: inicialització global, càrrega de fragments, navegació i helpers universals.
- `js/core/app.js`: lògica de suport del nucli.
- `js/games/`: activitats i jocs interactius (un fitxer per activitat).
- `js/activities/`: lògica compartida per projectes amb activitats investigables.
  - `shared/`: helpers compartits (p.ex. `preguntes-investigables-base.js`).
  - `mediterrani/`, `rates/`, `treball-recerca/`: fitxers específics de projecte.
- `js/config/`: configuració (p.ex. `project-activities.js`).

### Estàtica i dades
- `assets/images/`: imatges per projecte i components (activities, art, biologia, etc.).
- `api/`: integracions de servei (Apps Script, etc.).
- `README.md`: documentació general del projecte.

## Notes importants

- El CSS és parcialment modularitzat, però `css/style.css` continua sent el punt d’entrada principal.
- La càrrega dinàmica de fragments es fa des de `js/app.js` amb `loadFragment`, `loadNestedFragments` i `ensureProjectFragment`.
- `index.html` ha de romandre com a shell; `#app` és l’arrel on s’injecten `login`, `dashboard` i `game-screen`.
- No afegeixis noves rutes o selectors sense comprovar primer possibles duplicats o conflictes globals.

## Dashboard de professorat

- La secció de professorat viu a `fragments/screens/dashboard.html` i només s'ha de mostrar a rols de professorat o administració.
- La visibilitat i la inicialització es gestionen des de `js/app.js` amb `canUseTeacherTools()` i `setupTeacherTools(projects, groups)`.
- Mantén les targetes de primer nivell com a `teacher-tool-card` i els panells desplegables com a blocs separats, sense posar cards dins de cards.
- El panell **Eines de professorat** agrupa Programacions, Metodologies actives, Pissarra digital i QPlay.
- El panell **Full de resultats** depèn dels IDs `teacher-results-project`, `teacher-results-course`, `teacher-results-panel`, `teacher-copy-formula-btn`, `teacher-create-sheet-btn`, `teacher-create-students-sheet-btn`, `teacher-results-title`, `teacher-results-formula` i `teacher-results-feedback`.
- Els enllaços externs actuals són Metodologies actives (`https://metact.github.io/`), Pissarra digital (`https://escritorio-digital.github.io/`) i QPlay (`https://jjdeharo.github.io/qplay/`).

## Backend Apps Script

- `api/Code.js` concentra el registre d'accions a `ACTIONS`; qualsevol endpoint nou s'ha d'afegir allà.
- Les accions que escriuen al Sheet o creen fulls han de continuar passant per fluxos controlats i, quan pertoqui, per `withWriteLock`.
- Les eines de professorat fan servir `getResultGroups`, `createResultsSheet` i `createGroupStudentsSheet`.
- `getResultGroups` llegeix grups únics de la pestanya `resultats`, prioritzant la columna `grup` i fent servir `curs` com a fallback.
- `createResultsSheet` assumeix que a `resultats` la columna 4 és el grup i la columna 5 és el projecte o matèria.
- Si canvies `api/Code.js` o `api/appsscript.json`, recorda que cal desplegar una nova versió de la Web App d'Apps Script.

## Activitats de Biologia

- El hub de Biologia és a `fragments/activities/biologia/index.html` i la navegació es gestiona a `openBioSystem` / `openBioActivity` dins `js/app.js`.
- La secció **Genètica** conté l'activitat `genetica-sim`, implementada a `js/games/bio-genetica-sim.js` i estilada a `css/pages/biologia-genetica.css`.
- La genètica mendeliana desa resultats amb `saveResult` com la resta d'activitats avaluables.
- Si es reaprofiten idees d'eines externes com MendelSim, evita copiar-ne grans blocs de codi sense revisar la llicència. Per ara l'activitat és una implementació pròpia inspirada en el seu enfocament didàctic i manté un enllaç a l'original.

## Tokens CSS i disseny

Els tokens globals es defineixen a `css/base/tokens.css` i són accessibles com a variables CSS a tot el projecte:

- **Colors base**: `--primary-color`, `--secondary-bg`, `--surface-bg`, `--card-bg`, etc.
- **Colors d'estat**: `--error` (#ef4444), `--success` (#10b981), `--warning` (#eab308), `--purple` (#8b5cf6).
- **Radis**: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`.
- **Ombres**: `--shadow-sm`, `--card-shadow`, `--shadow-lg`.
- **Transicions**: `--transition-fast` (0.2s per interaccions).
- **Tipografia**: `--font-family` (Outfit, sans-serif).

Reutilitza **sempre** aquests tokens en lloc de definir colors o valors nous inline. Si necessites un token nou, afegeix-lo a `css/base/tokens.css`.

## Git i seguretat

- No facis `git reset --hard`, `git checkout --` ni eliminacions destructives sense permís.
- No revertiu canvis locals d'altres persones sense confirmació.
- Mantingues els canvis tan acotats com sigui possible a la petició de l'usuari.

## Bones pràctiques CSS

- Usa BEM per als components: `bloc`, `bloc__element`, `bloc--modificador`.
- Evita selectors massa específics; opta per classes reutilitzables.
- Evita estils inline a l’HTML i al JS.
- Si un patró es repeteix, crea una classe CSS en el fitxer adequat.
- Prioritza variables i tokens globals abans d’afegir colors o valors nous.
- Mantingues cada regla en el fitxer correcte: globals en el manifest, components a `css/components/`, pàgines a `css/pages/`.
- Les seccions grans han de ser layouts; no posis cards dins de cards.

### Referència de components de quiz

Reutilitza aquestes classes abans de crear-ne de noves:

- `quiz-filter-button`
- `quiz-filter-button--topic`
- `quiz-filter-button--easy`
- `quiz-filter-button--medium`
- `quiz-filter-button--hard`
- `quiz-filter-button--mixed`
- `quiz-option-button`
- `quiz-option-button--compact`
- `quiz-category-button`
- `quiz-feedback--success`
- `quiz-feedback--error`
- `quiz-feedback--warning`
- `quiz-feedback--muted`
- `target-hint`

## Bones pràctiques JavaScript

- Mantingues la lògica de cada activitat dins el seu fitxer a `js/games/` o `js/activities/`.
- Reutilitza helpers globals a `js/app.js` quan el comportament és compartit.
- Per feedback de color, usa `setElementStateColor(element, stateName)` en lloc de `element.style.color`.
- Per botons de dificultat, usa `getQuizLevelButtonModifier(levelName)` o `getQuizFilterButtonModifier(fieldName, value)`.
- Evita `element.style.*` quan no és necessari.
- No canviïs noms de funcions referenciades pels fragments sense actualitzar totes les crides.
- Comprova que els IDs esperats per les funcions existeixin als fragments carregats.
- Afegeix gestió d’errors a les càrregues de fragments i a les inicialitzacions de jocs si és possible.
### Helpers globals disponibles a `js/app.js`

- **`setElementStateColor(element, stateName)`**: Assigna classe de color d'estat (`success`, `error`, `warning`, `muted`).
- **`getQuizLevelButtonModifier(levelName)`**: Retorna el modificador BEM per a nivell de dificultat (`easy`, `medium`, `hard`).
- **`getQuizFilterButtonModifier(fieldName, value)`**: Retorna el modificador BEM per a botó de filtre (adaptat al camp).
- **`loadFragment(path)`**: Carrega un fragment HTML dinàmicament a `#app`.
- **`loadNestedFragments(container)`**: Processa placeholders `data-fragment` dins un contenidor.
- **`ensureProjectFragment(projectName)`**: Carrega el fragment del projecte si no és present.
- **`navigateTo(screen, options)`**: Navega entre pantalles (login, dashboard, game, etc.).
- **`callApiGet(action, params)`**: Crida accions del backend Apps Script amb GET i paràmetres serialitzats.

## Bones pràctiques HTML i fragments

- `index.html` ha de ser només un shell amb scripts globals i `#app`.
- Mou les pantalles, projectes i activitats a `fragments/` quan treballis en una zona ja migrada.
- Quan migris fragments, comprova que `id`, funcions JS i navegació segueixin connectats.
- Evita `style=""` inline.
- Per botons, combina la classe base `btn` amb modificadors BEM o classes específiques.
- Si mous una activitat, comprova el menú, la targeta, el contenidor i les funcions JS corresponents.
- Els fragments poden contenir placeholders `data-fragment`; `loadNestedFragments` els processa automàticament.

### Noms i IDs convencionals

Segueix aquests patrons per mantenir la coherència:

- **Fragmentos de projectes**: `fragments/projects/{projectName}/{projectName}.html`
- **Activitats**: `fragments/activities/{projectName}/{activityName}.html`
- **IDs de jocs**: `data-game-id="{activityName}"` (coincideix amb fitxer `js/games/{activityName}.js`)
- **Contenidors de pantalles**: `id="app-screen"` com a arrel, amb classes `game-screen`, `dashboard-screen`, etc.
- **Botons de navegació**: classes BEM base `btn` amb `btn--primary`, `btn--secondary`, etc.

## Treball com a agent

- Les regles permanents del projecte viuen en aquest fitxer; consulta [MEMORY.md](./MEMORY.md) a l'inici de la feina per recuperar-ne el context temporal.
- Després d'una feina significativa, actualitza `MEMORY.md` només amb l'estat actual, els riscos oberts i els tres últims passos significatius. Mantén com a màxim tres passos i elimina el més antic quan n'afegeixis un de nou.
- No dupliquis a `MEMORY.md` les regles permanents, ni hi mantinguis un roadmap o una llista de propers passos.
- Fes canvis petits i proves freqüents.
- Documenta qualsevol refactorització de l’estructura abans de començar.
- Si fas una migració, comprova que l’antiga i la nova versió funcionin amb el mateix HTML.
- No afegeixis regles globals noves sense verificar l’impacte en altres activitats.
- Prioritza llegibilitat i coherència amb l’estil del projecte.

### Cicle de revisió

1. **Entendre la feina**: Legeix els comentaris al fitxer o pregunta si no està clar.
2. **Fer canvis**: Edita només els fitxers necessaris.
3. **Validar**: Executa els checks de validació (veure secció més avall).
4. **Proves manuals**: Obri el navegador i prova les funcionalitats relacionades.
5. **Commit**: Fes un commit descriptiu amb les millores.

## Validació i checks

Sempre executa aquestes validacions ABANS de donar per acabada una feina:

### Check 1: Caràcters i codificació

```powershell
rg -n "\xC3|\xC2|\xEF\xBF\xBD|\xE2" index.html css js
```

Detecta caràcters corruptats o encoding dolent. No ha de retornar resultats.

### Check 2: Estils inline

```powershell
rg -n "style=\"" index.html
rg -n "style\\.cssText" js
```

Els estils han de ser a CSS, mai inline. No ha de retornar resultats.

### Check 3: Classes CSS obsoletes

```powershell
rg -n "quiz-filter-button--success|quiz-filter-button--pink" css js index.html
```

Detecta classes CSS que han estat deprecated. No ha de retornar resultats.

### Check 4: Estat del repositori

```powershell
git -c safe.directory='D:/77 - Intermunicipal/Curs 2025-2026/aulaCreActiva' status --short
```

Revisa els fitxers canviats. Assegura't que només has modificat els fitxers necessaris.

### Check 5: Sintaxi JavaScript (opcional, si hi ha Node)

Si tens Node disponible, valida la sintaxi bàsica dels fitxers JS modificats amb un linter o parser.

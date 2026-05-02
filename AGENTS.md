# AGENTS.md

Guia de treball per a agents i col·laboradors del projecte **Aula CreActiva**.

Aquest projecte és una web app educativa estàtica amb HTML, CSS i JavaScript. La prioritat és mantenir el codi clar, modular i fàcil de mantenir durant el curs.

## Objectiu

Donar orientacions per treballar amb coherència en l’estructura actual del projecte, amb especial èmfasi en fragments, CSS BEM i navegació JavaScript.

## Estructura principal

- `index.html`: shell principal amb el contenidor global `#app`.
- `fragments/`: pantalles, projectes i activitats que s’injecten dinàmicament.
- `css/style.css`: manifest d’importació que carrega les fulles d’estil reals.
- `css/components/`: estils de components reutilitzables.
- `css/pages/`: estils de pàgines específiques.
- `js/app.js`: inicialització global, càrrega de fragments i navegació.
- `js/core/app.js`: lògica de suport del nucli.
- `js/games/`: activitats i jocs interactius.
- `js/activities/`: activitats específiques per projecte.
- `js/config/`: configuració de projectes i activitats.
- `assets/`: imatges i recursos estàtics.
- `api/`: fitxers i integracions de servei (Apps Script, etc.).

## Notes importants

- El CSS és parcialment modularitzat, però `css/style.css` continua sent el punt d’entrada principal.
- La càrrega dinàmica de fragments es fa des de `js/app.js` amb `loadFragment`, `loadNestedFragments` i `ensureProjectFragment`.
- `index.html` ha de romandre com a shell; `#app` és l’arrel on s’injecten `login`, `dashboard` i `game-screen`.
- No afegeixis noves rutes o selectors sense comprovar primer possibles duplicats o conflictes globals.

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

## Bones pràctiques HTML i fragments

- `index.html` ha de ser només un shell amb scripts globals i `#app`.
- Mou les pantalles, projectes i activitats a `fragments/` quan treballis en una zona ja migrada.
- Quan migris fragments, comprova que `id`, funcions JS i navegació segueixin connectats.
- Evita `style=""` inline.
- Per botons, combina la classe base `btn` amb modificadors BEM o classes específiques.
- Si mous una activitat, comprova el menú, la targeta, el contenidor i les funcions JS corresponents.
- Els fragments poden contenir placeholders `data-fragment`; `loadNestedFragments` els processa automàticament.

## Treball com a agent

- Fes canvis petits i proves freqüents.
- Documenta qualsevol refactorització de l’estructura abans de començar.
- Si fas una migració, comprova que l’antiga i la nova versió funcionin amb el mateix HTML.
- No afegeixis regles globals noves sense verificar l’impacte en altres activitats.
- Prioritza llegibilitat i coherència amb l’estil del projecte.

## Comprovar abans de marcar la feina com a acabada

```powershell
rg -n "\xC3|\xC2|\xEF\xBF\xBD|\xE2" index.html css js
rg -n "style=\"" index.html
rg -n "style\\.cssText" js
rg -n "quiz-filter-button--success|quiz-filter-button--pink" css js index.html
git -c safe.directory='D:/77 - Intermunicipal/Curs 2025-2026/aula-creActiva' status --short
```

Si hi ha Node disponible, valida la sintaxi bàsica dels fitxers JS modificats.

## Git i seguretat

- No facis `git reset --hard`, `git checkout --` ni eliminacions destructives sense permís.
- No revertiu canvis locals d'altres persones sense confirmació.
- Mantingues els canvis tan acotats com sigui possible a la petició de l'usuari.

# AGENTS.md

Guia de treball per a agents i col·laboradors del projecte **Aula CreActiva**.

Aquest projecte és una web app educativa estàtica amb HTML, CSS i JavaScript. La prioritat és mantenir el codi clar, reutilitzable i fàcil de modificar durant el curs.

## Objectiu d'aquesta guia

Aquesta guia dona orientacions pràctiques per treballar de forma coherent amb l'estructura actual del projecte. Si vols fer canvis importants de migració o refactorització, ho has de documentar i fer en petits passos.

## Estructura actual del projecte

- `index.html`: shell principal de l'app; conté la càrrega inicial i els contenidors globals.
- `fragments/`: pantalles, projectes i activitats migrades fora de `index.html`.
- `css/style.css`: estil global actual. Al projecte encara no està migrat a capes separades.
- `js/app.js`: helpers globals i inicialització principal de l'aplicació.
- `js/core/app.js`: lògica de suport del nucli de l'aplicació.
- `js/games/`: activitats i jocs principals amb comportament interactiu.
- `js/activities/`: activitats modulars o específiques per projecte.
- `js/config/`: configuració de projectes i activitats.
- `assets/`: imatges, targetes i altres recursos estàtics.
- `api/`: fitxers de servei i integracions (Apps Script, etc.).

## Notes sobre l'estructura real

- Actualment no hi ha carpetes `css/base/`, `css/layout/`, `css/components/`, `css/pages/` ni `css/utilities/` al projecte.
- La guia preveu una organització més modular de CSS, però abans de migrar-la cal revisar totes les dependències i evitar trencar el carregament de l'estil.
- Si fas una migració de CSS, fes-la per fases i comprova que l'interfície segueix funcionant a cada pas.

## CSS

- Segueix BEM per als components: `bloc`, `bloc__element`, `bloc--modificador`.
- Evita selectors massa específics si es pot resoldre amb una classe reutilitzable.
- Evita estils inline a l'HTML i al JS. Si un patró es repeteix, crea una classe CSS.
- Usa variables i tokens globals abans d'afegir colors o valors nous.
- Mantingues les regles al fitxer adequat: global al CSS general i components reutilitzables amb noms BEM clars.
- No posis targetes dins de targetes. Les seccions grans han de ser layouts, no cards flotants.

### Components de quiz

Per botons i feedback de quiz, reutilitza aquestes classes abans de crear-ne de noves:

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

## JavaScript

- Mantingues la lògica de cada activitat dins el seu fitxer a `js/games/` o `js/activities/`.
- Reutilitza helpers globals existents a `js/app.js` quan el comportament sigui compartit.
- Per feedback de color, usa `setElementStateColor(element, stateName)` en lloc de modificar `style.color` directament.
- Per botons de dificultat, usa `getQuizLevelButtonModifier(levelName)` o `getQuizFilterButtonModifier(fieldName, value)`.
- Evita repetir estils amb `element.style.*` si el valor no és realment dinàmic.
- No canviïs noms de funcions invocades des de `index.html` o fragments sense actualitzar totes les crides.

## HTML

- Mantingues `index.html` com a shell principal: carregador, contenidors globals i connexions comunes.
- Mou el contingut de pantalles, projectes i activitats cap a `fragments/` quan treballis una zona ja migrada.
- Quan migris contingut a fragments, comprova que els `id`, les funcions JS i el sistema de navegació/carrega segueixen connectats.
- Evita `style=""` inline.
- Per botons, combina sempre la base `btn` amb modificadors BEM o components específics.
- Si mous una activitat de projecte, comprova que el menú, la targeta, el contenidor i les funcions JS segueixen connectats.

## Com treballar com a agent

- Fes canvis petits i proves freqüents.
- Documenta qualsevol refactorització de l'estructura abans de començar.
- Si fas una migració de CSS o de fragments, comprova que l'antiga i la nova versió funcionen amb el mateix HTML.
- No introdueixis regles globals noves que pugui afectar múltiples activitats sense provar-les.

## Abans de donar una tasca per acabada

Executa comprovacions ràpides quan siguin rellevants:

```powershell
rg -n "\xC3|\xC2|\xEF\xBF\xBD|\xE2" index.html css js
rg -n "style=\"" index.html
rg -n "style\\.cssText" js
rg -n "quiz-filter-button--success|quiz-filter-button--pink" css js index.html
git -c safe.directory='D:/77 - Intermunicipal/Curs 2025-2026/aula-creActiva' status --short
```

Si hi ha Node disponible, fes una validació bàsica de sintaxi dels fitxers JS modificats.

## Git i seguretat

- No facis `git reset --hard`, `git checkout --` ni eliminacions destructives sense permís explícit.
- El repositori pot tenir canvis locals d'altres persones. No els reverteixis.
- Mantingues els canvis tan acotats com sigui possible a la petició de l'usuari.

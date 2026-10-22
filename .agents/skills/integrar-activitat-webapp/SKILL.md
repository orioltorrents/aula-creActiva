---
name: integrar-activitat-webapp
description: "Use when adding or substantially changing an activity or game in Aula CreActiva: connect its fragment, JavaScript, project menu, styles, translations, results, and navigation to the existing web app."
---

# Integrar una activitat a Aula CreActiva

## Quan fer-la servir

- En crear una activitat o joc nou.
- En connectar una activitat existent a un projecte o al menú.
- En modificar el cicle de vida, l'avaluació o la navegació d'una activitat.

Combina aquesta skill amb la skill específica de la interacció (per exemple, ordenar conceptes o identificar parts d'una imatge).

## Procediment

1. Llegeix `AGENTS.md` i `MEMORY.md` per conèixer les regles i l'estat actual.
2. Examina una activitat similar abans de decidir l'estructura. Comprova fragments, `js/games/`, `js/activities/`, `js/config/project-activities.js`, estils i inicialització a `js/app.js`.
3. Reutilitza els helpers, components, patrons de navegació i tokens CSS existents. No creïs una nova ruta, selector o helper global sense comprovar abans si ja n'hi ha un.
4. Mantén el fragment HTML, la lògica de la interacció i els estils als llocs corresponents. Conserva els IDs i noms que connecten aquests fitxers; si els canvies, actualitza totes les referències.
5. Afegeix l'activitat al menú o configuració del projecte seguint el patró que aquest projecte utilitzi actualment. No dupliquis una targeta que ja es genera des de la configuració.
6. Connecta una inicialització repetible: en tornar a obrir l'activitat, reinicia l'estat i evita registrar listeners duplicats o deixar resultats antics visibles.
7. Fes servir les claus de `js/i18n.js` quan el text hagi de seguir el sistema de traduccions existent.
8. Desa resultats només si l'activitat és avaluable i seguint el patró actual de `saveResult`/`callApi`. No afegeixis cap acció de backend si n'hi ha una de reutilitzable.
9. Comprova que la interacció funcioni amb ratolí i en pantalles tàctils; proporciona també una alternativa accessible amb teclat quan correspongui.
10. Executa els checks pertinents de `AGENTS.md`, revisa `git status` i prova manualment el flux afectat si es pot.

## Criteris

- `index.html` continua sent el shell; les pantalles i activitats van als fragments.
- Segueix les convencions de classes BEM, botons i feedback del projecte.
- No introdueixis estils inline a l'HTML. Mantén els estils a la fulla adequada i reutilitza tokens CSS.
- No copiïs grans blocs de codi o contingut d'eines externes sense comprovar-ne la llicència.
- Mantén els canvis limitats a la petició i no reverteixis canvis preexistents.

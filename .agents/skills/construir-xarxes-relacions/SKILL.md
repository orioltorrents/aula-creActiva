---
name: construir-xarxes-relacions
description: "Use when creating or changing an activity in Aula CreActiva where students build or interpret a network, graph, food web, or set of relationships and connections between elements."
---

# Crear una activitat de xarxes i relacions

## Quan fer-la servir

- L'alumnat ha de connectar elements per representar relacions, fluxos o dependències.
- Cal crear o revisar una xarxa tròfica o una activitat de connexions.

Per ordenar una llista de passos lineal, fes servir `ordenar-conceptes`. Per preguntes d'opció múltiple sobre relacions, fes servir `quiz-avaluatiu`. Per integrar l'activitat, combina aquesta skill amb `integrar-activitat-webapp`.

## Procediment

1. Confirma què representa cada element i cada connexió. Defineix direcció, sentit, tipus de relació, connexions obligatòries i si s'admeten més d'una solució vàlida.
2. Separa els nodes i les arestes de les etiquetes visibles; assigna IDs estables i conserva la semàntica en les traduccions.
3. Tria una interacció que faci visible la tasca (seleccionar parelles, connectar nodes o completar un graf) i ofereix una alternativa accessible a les accions amb ratolí o arrossegament.
4. Corregeix la xarxa amb regles explícites. Si l'ordre dels extrems importa, comprova'l; no tractis una relació dirigida com si fos simètrica.
5. Defineix el tractament de connexions duplicades, incorrectes, incompletes i repetides. Evita afegir o puntuar una aresta més d'una vegada.
6. Mostra quines relacions són correctes i explica breument el criteri o la conseqüència del flux. No facis del color l'únic senyal d'estat.
7. Comprova que els nodes i les arestes continuïn llegibles en pantalles estretes i amb zoom, i que el graf no depengui només de la posició visual.
8. Reinicia xarxa, estat, feedback i puntuació en començar una nova ronda; desa resultats només si l'activitat ja segueix el flux d'avaluació de l'app.
9. Segueix `integrar-activitat-webapp` per connectar fragment, menú, JavaScript, estils, traduccions i navegació.

## Referències del projecte

- `js/games/natura-xarxes.js`
- `fragments/activities/entorns/natura-activity-xarxes.html`
- `js/games/radio-conexions.js` i `fragments/activities/radio/radio-activity-conexions.html`

Confirma sempre la direcció i el significat de les relacions amb el contingut de l'activitat; no els dedueixis de la disposició gràfica.

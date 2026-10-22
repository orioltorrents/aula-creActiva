---
name: classificar-elements
description: "Use when creating or changing a classification or sorting activity in Aula CreActiva: assign species, concepts, examples, or evidence to categories or dimensions and assess the classification."
---

# Crear una activitat de classificació

## Quan fer-la servir

- L'alumnat ha d'assignar elements a una o més categories, etiquetes o dimensions.
- Cal revisar activitats com els rols tròfics, els arrossegaments de conceptes o exercicis d'agrupació.

No és una activitat de seqüenciació temporal: per ordenar passos o fases, fes servir `ordenar-conceptes`. Per integrar-la, combina aquesta skill amb `integrar-activitat-webapp`.

## Procediment

1. Defineix les categories i el criteri que les distingeix. Aclareix si cada element té una única resposta o si són vàlides diverses classificacions; si és ambigu, demana confirmació.
2. Separa els identificadors estables, les dades de l'element i les etiquetes traduïdes. Documenta respostes alternatives i excepcions justificades.
3. Tria la interacció segons la tasca: selecció, arrossegament a grups o classificació per diverses dimensions. No introdueixis drag-and-drop si un control de selecció és més clar o accessible.
4. Si es pot classificar en més d'una dimensió, mantén cada resposta independent i mostra explícitament quines dimensions falten.
5. Comprova que les categories no siguin confusament solapades i que l'activitat expliqui el criteri abans de començar.
6. Corregeix per identificadors i regles explícites, no comparant textos visibles. Evita comptar dues vegades una resposta i defineix si es permet corregir-la.
7. Dona feedback que expliqui el criteri, no només el color o un missatge d'encert/error. Reinicia seleccions, estat i puntuació en tornar a jugar.
8. Proporciona controls accessibles per teclat i una alternativa al gest d'arrossegar quan sigui necessari. Desa resultats només amb el patró existent de l'app.
9. Segueix `integrar-activitat-webapp` per connectar fragment, menú, JavaScript, estil, traduccions i navegació.

## Referències del projecte

- `js/games/natura-rols.js` i `fragments/activities/entorns/natura-activity-rols.html`: classificació per règim i nivell tròfic amb justificació.
- `js/games/bio-concept-drag.js`: activitat d'arrossegament de conceptes.

No assumeixis que una classificació científica té les mateixes categories o criteris que aquests exemples.

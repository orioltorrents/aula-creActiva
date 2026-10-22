---
name: quiz-avaluatiu
description: "Use when creating or changing a quiz or knowledge-check activity in Aula CreActiva: multiple choice, true/false, exam or practice mode, filters, scoring, feedback, and results."
---

# Crear un quiz avaluable

## Quan fer-lo servir

- L'alumnat respon preguntes amb opcions, afirmacions de cert/fals o una resposta seleccionada.
- Cal afegir pràctica, examen, dificultat, categories o preguntes aleatòries.
- Cal revisar activitats com `mediterrani-test`, `natura-rols`, `treball-recerca-biblio` o els quizzes de Biologia.

Per a una activitat nova, combina aquesta skill amb `integrar-activitat-webapp`. Si la resposta requereix clicar una zona d'una imatge o ordenar elements, combina-la també amb `identificar-parts-imatge` o `ordenar-conceptes` segons correspongui.

## Procediment

1. Defineix què avalua cada pregunta, la resposta correcta, les respostes acceptades i l'explicació pedagògica. No dedueixis ni inventis contingut o criteris de puntuació.
2. Inspecciona un quiz semblant i reutilitza l'estructura de dades, els filtres i els helpers existents. Mantén els IDs de contingut separats dels textos traduïts.
3. Defineix explícitament longitud de la ronda, puntuació, penalitzacions, preguntes sense respondre i condicions de finalització. Pràctica i examen han d'aplicar només les diferències demanades.
4. Barreja les opcions sense alterar la resposta correcta; si cal barrejar una llista, fes servir Fisher–Yates, no `sort(() => Math.random() - 0.5)`.
5. Després de respondre, bloqueja o gestiona coherentment les respostes repetides, mostra feedback textual accessible i actualitza progrés i puntuació una sola vegada.
6. Reinicia preguntes, seleccions, missatges, comptadors i listeners en començar o tornar a obrir una ronda.
7. Desa resultats només si el patró actual de l'activitat ho requereix; reutilitza `saveResult`/el flux existent i evita duplicats o desar rondes parcials.
8. Comprova preguntes buides, opcions repetides, l'última pregunta, reinici, filtres i qualsevol mode de pràctica/examen. Utilitza els components de quiz compartits i les traduccions existents.
9. Segueix `integrar-activitat-webapp` per connectar fragment, menú, JavaScript, estils, navegació i validació.

## Referències del projecte

- `js/games/mediterrani-test.js` i `fragments/activities/mediterrani/med-activity-test_mar.html`: qüestionari sobre contingut audiovisual.
- `js/games/natura-rols.js` i `fragments/activities/entorns/natura-activity-rols.html`: classificació avaluada amb justificació.
- `js/activities/treball-recerca/tr-activity-biblio.js` i `fragments/activities/treball-recerca/tr-activity-biblio.html`: filtres per tema i dificultat.

Fes servir aquests exemples com a referència de patrons; no copiïs contingut ni assumeixis que comparteixen la mateixa regla de puntuació.

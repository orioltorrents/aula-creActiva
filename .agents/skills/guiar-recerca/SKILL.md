---
name: guiar-recerca
description: "Use when creating or changing a guided inquiry or research activity in Aula CreActiva: investigable questions, choosing topics, diagnosing research questions, bibliography, citations, or field-study workflows."
---

# Crear una activitat de recerca guiada

## Quan fer-la servir

- L'alumnat formula o tria preguntes investigables, concreta un tema o revisa les parts d'una recerca.
- L'alumnat treballa fonts, bibliografia, citacions o fases d'un estudi de camp.
- Cal ampliar activitats de `treball-recerca`, `entorns` o `rates`.

Per ordenar fases com una seqüència, combina aquesta skill amb `ordenar-conceptes`; per preguntes tipus test, amb `quiz-avaluatiu`. Per integrar-la a l'app, combina-la amb `integrar-activitat-webapp`.

## Procediment

1. Defineix l'objectiu d'aprenentatge i la fase de recerca: triar tema, formular pregunta, diagnosticar-ne mancances, recollir evidències o citar fonts.
2. Confirma amb el responsable docent els criteris de qualitat, les respostes acceptades i qualsevol convenció de citació. Si manquen, pregunta; no inventis criteris de recerca o format bibliogràfic.
3. Presenta exemples i contraexemples contextualitzats. Explica per què una resposta funciona i què cal millorar, no només si és correcta.
4. Separa dades, criteris d'avaluació i textos visibles. Reutilitza els helpers i els patrons compartits de `js/activities/shared/` i evita duplicar lògica entre projectes.
5. Si l'activitat fa servir fonts o dades, identifica'n la procedència, comprova que estiguin disponibles i evita presentar informació incerta com a fet verificat.
6. Dissenya ajudes progressives que orientin sense revelar immediatament la resposta. Ofereix una via clara per revisar, corregir i avançar.
7. Si les respostes són obertes, defineix rúbrica, criteris parcials i revisió humana; no les corregeixis amb una comparació estricta de cadenes.
8. Desa puntuació o progrés només quan correspongui i segons el flux existent. Reinicia estat i feedback en cada intent.
9. Comprova el recorregut complet de l'alumnat, les traduccions i les opcions d'accessibilitat. Segueix `integrar-activitat-webapp` per connectar els fragments i la navegació.

## Referències del projecte

- `js/activities/shared/preguntes-investigables-base.js`
- `js/activities/treball-recerca/` i `fragments/activities/treball-recerca/`
- `js/activities/rates/rates-preguntes.js`
- `js/games/natura-orenetes.js`

Adapta els criteris al projecte i a les instruccions docents; no assumeixis que una pregunta investigable o una citació té una única forma vàlida.

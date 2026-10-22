---
name: activitat-cartografica
description: "Use when creating or changing a map-based geography activity in Aula CreActiva: locate countries or places, answer map prompts, practice/exam modes, map labels, and geographic scoring."
---

# Crear una activitat cartogràfica

## Quan fer-la servir

- L'alumnat ha de localitzar països, ciutats, regions o elements geogràfics sobre un mapa.
- Cal modificar una activitat com `mediterrani-map` o `mediterrani-capitals`.

Per a preguntes amb una imatge anatòmica, un diagrama o una fotografia, fes servir `identificar-parts-imatge`. Per integrar l'activitat, combina aquesta skill amb `integrar-activitat-webapp`.

## Procediment

1. Confirma la font cartogràfica, els elements que s'avaluaran, els noms acceptats i les variants geogràfiques. No inventis coordenades, fronteres ni respostes.
2. Inspecciona el patró actual de mapa del projecte i identifica si les regions són SVG, imatge amb zones o un altre component. Reutilitza aquesta representació abans d'afegir dependències o convertir formats.
3. Vincula cada regió a un identificador estable i a dades geogràfiques; no facis servir el text traduït de l'etiqueta com a clau de correcció.
4. Calcula clics i etiquetes respecte del mapa renderitzat, preservant la proporció i tenint en compte `viewBox`, retalls, zoom o canvis de mida. Comprova mides petites i grans.
5. Proporciona una manera accessible de seleccionar les regions amb teclat i lector de pantalla quan la interacció principal sigui gràfica. No confiïs només en el color per indicar encert/error.
6. Separa clarament els modes de pràctica i examen: ajuda, noms visibles, temporitzador i feedback han de seguir el comportament definit per l'activitat.
7. Evita comptar dues vegades la mateixa resposta; tracta seleccions incorrectes, canvi de resposta, final de ronda i reinici de manera explícita.
8. Valida tots els elements del conjunt de dades contra les regions renderitzades i desa resultats només seguint el flux existent de l'app.
9. Segueix `integrar-activitat-webapp` per connectar fragment, menú, inicialització, estil, traduccions i navegació.

## Referències del projecte

- `js/activities/mediterrani/mediterrani-map.js`
- `fragments/activities/mediterrani/med-activity-map.html`
- `js/activities/mediterrani/mediterrani-capitals.js`

Les geometries, l'escala i els noms acceptats depenen de cada mapa; no reutilitzis coordenades d'una activitat en una altra.

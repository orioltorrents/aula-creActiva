---
name: ordenar-conceptes
description: "Use when creating or changing a drag-and-drop sequencing activity in Aula CreActiva: reorder concepts, actions, steps, phases, or events and assess their order."
---

# Crear una activitat d'ordenar conceptes

## Quan fer-la servir

- L'alumnat ha d'ordenar fases, passos, conceptes o accions.
- Cal revisar o ampliar activitats com `natura-xarxes` o `natura-impacte`.

Per a una activitat nova, combina aquesta skill amb `integrar-activitat-webapp`.

## Procediment

1. Confirma quin ordre es considera correcte i si hi ha més d'una seqüència vàlida. Si el criteri no és clar, no el dedueixis només del text: pregunta abans d'implementar la correcció.
2. Decideix d'on provenen les dades. Reutilitza el Sheet/API existent si encaixa; altrament, mantén les dades al lloc que segueixi el patró més proper.
3. Dona a cada element un identificador únic i estable, separat del text que es mostra o es tradueix. Desa l'ordre correcte com a seqüència d'IDs.
4. Mostra els elements inicialment barrejats, sense modificar l'ordre de referència. Evita `sort(() => Math.random() - 0.5)` per barrejar; fes servir una barreja Fisher–Yates.
5. Permet reordenar sense perdre ni duplicar elements. Si uses arrossegar i deixar anar, comprova el comportament tàctil i afegeix controls de teclat o alternatives accessibles per canviar la posició.
6. En corregir, compara els IDs de la seqüència actual amb la seqüència esperada. Defineix explícitament si es puntua posició per posició, per parelles o amb una altra regla pedagògicament justificada.
7. Mostra feedback comprensible i deixa clar com tornar-ho a provar. Reinicia penalitzacions, seleccions i estat de correcció quan comença una nova ronda.
8. Desa la puntuació mitjançant el flux existent només si és una activitat avaluable; evita desar rondes parcials o resultats duplicats.
9. Revisa la inicialització repetida i els listeners: obrir de nou l'activitat no ha d'afegir `dragover` o altres esdeveniments una vegada i una altra.
10. Segueix els passos de `integrar-activitat-webapp` per connectar fragment, menú, JavaScript, estils i validació.

## Referències del projecte

- `js/games/natura-xarxes.js`: seqüència definida al codi i arrossegar elements.
- `js/games/natura-impacte.js`: fases carregades des de l'API amb dades alternatives.
- `fragments/activities/entorns/natura-activity-xarxes.html` i `natura-activity-impacte.html`: contenidors de les activitats.

Fes servir aquests fitxers com a exemples de domini, no com a codi per copiar sense revisar. Construeix sobre helpers comuns si ja existeixen i no dupliquis lògica de correcció o arrossegament innecessàriament.

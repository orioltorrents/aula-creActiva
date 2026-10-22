---
name: analitzar-mitjans
description: "Use when creating or changing an Aula CreActiva activity based on audio, video, images, or other media: listening identification, media comprehension, playback, questions, and interactive sound equipment."
---

# Crear una activitat d'anàlisi de mitjans

## Quan fer-la servir

- L'alumnat escolta o mira un recurs per identificar sons, comprendre contingut o respondre preguntes.
- Cal controlar la reproducció o interactuar amb una representació d'equip audiovisual o musical.
- Exemples: `radio-conexions`, `radio-taula` i el test de `mediterrani`.

Per clicar parts d'una imatge, combina aquesta skill amb `identificar-parts-imatge`; per un quiz independent del mitjà, fes servir `quiz-avaluatiu`. Per integrar l'activitat, combina-la amb `integrar-activitat-webapp`.

## Procediment

1. Confirma la font i els drets d'ús del mitjà, què ha d'aprendre l'alumnat i si l'activitat avalua comprensió, identificació o manipulació. No substitueixis ni copiïs contingut protegit sense autorització.
2. Reutilitza els recursos i patrons de reproducció del projecte. Indica l'estat de càrrega i tracta explícitament errors, formats no compatibles i mitjans absents.
3. Dona controls de reproducció accessibles i etiquetats, amb estat de pausa/reproducció visible. No iniciïs àudio inesperadament ni facis servir el so com a únic canal d'informació.
4. Mantén sincronitzats pregunta, fragment de mitjà i resposta. Defineix si es permet repetir, pausar o saltar i aplica-ho igualment a totes les rondes.
5. Per una taula de so o imatge interactiva, posiciona les zones respecte de la imatge renderitzada i valida la interacció en pantalles tàctils i amb zoom. Proporciona una alternativa accessible a les zones petites.
6. Mantén les preguntes i respostes desacoblades dels noms dels fitxers de mitjà. Si hi ha filtres o temes, valida que cada filtre disposi de preguntes i recursos vàlids.
7. Mostra feedback textual i descriu què s'ha d'escoltar o observar quan sigui útil. No penalitzis silenciosament errors de reproducció de l'entorn.
8. Reinicia els controls, la reproducció, la pregunta i la puntuació en tornar a obrir l'activitat. Atura recursos actius en canviar de pantalla i evita listeners duplicats.
9. Desa resultats només seguint el flux existent. Segueix `integrar-activitat-webapp` per connectar fragments, configuració, estils, traduccions i navegació.

## Referències del projecte

- `js/games/radio-conexions.js`
- `fragments/activities/radio/radio-activity-conexions.html`
- `js/games/radio-taula.js` i `fragments/activities/radio/radio-activity-taula.html`
- `js/games/mediterrani-test.js`

Valida els recursos, els controls i el comportament de reproducció al navegador emprat pel projecte.

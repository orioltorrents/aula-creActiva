---
name: simular-sistemes
description: "Use when creating or changing an interactive simulation or model in Aula CreActiva: genetics, biological systems, experiments, manipulable variables, predictions, and simulated outcomes."
---

# Crear una simulació o model interactiu

## Quan fer-la servir

- L'alumnat canvia variables o condicions per observar resultats i entendre un sistema.
- Cal modificar una simulació com `bio-genetica-sim` o una activitat interactiva de laboratori.

Per preguntes amb respostes fixes, fes servir `quiz-avaluatiu`; per identificar zones d'un diagrama, `identificar-parts-imatge`. Per integrar-la, combina aquesta skill amb `integrar-activitat-webapp`.

## Procediment

1. Defineix el fenomen, les variables modificables, els resultats observables i les limitacions del model. Verifica les regles amb el contingut del projecte o el responsable docent.
2. Distingeix les dades científiques, l'estat de la simulació i la presentació visual. No confonguis una aproximació didàctica amb una predicció real ni inventis precisió.
3. Fes que cada control indiqui què modifica i actualitzi el resultat de manera coherent. Valida límits, valors absents, combinacions impossibles i condicions inicials.
4. Mantén reproduïble el comportament: defineix l'aleatorietat, permet repetir o restablir una prova i no canviïs resultats anteriors sense una acció explícita.
5. Presenta resultats amb unitats, etiquetes i context suficients. Si la simulació simplifica un procés, fes visible la simplificació pertinent.
6. Si es puntua una predicció, separa-la de l'observació produïda pel model i avalua-la amb criteris pedagògicament justificats.
7. Assegura controls accessibles, actualitzacions anunciables per tecnologia assistiva i una representació alternativa si el resultat depèn només d'una visualització.
8. Reinicia controls, resultat i missatges en començar una prova nova; evita listeners duplicats i no desis resultats parcials involuntaris.
9. Desa només amb el flux existent de l'app. Segueix `integrar-activitat-webapp` per connectar la simulació amb fragments, navegació, estils i traduccions.

## Referències del projecte

- `js/games/bio-genetica-sim.js` i l'activitat `genetica-sim` de `fragments/activities/biologia/index.html`
- `js/games/bio-lab-tools.js`

Respecta el model científic propi de l'activitat i revisa els supòsits abans de modificar-ne les fórmules o els resultats.

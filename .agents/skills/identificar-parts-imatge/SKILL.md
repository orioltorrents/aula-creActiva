---
name: identificar-parts-imatge
description: "Use when creating or changing an image-based identification activity in Aula CreActiva: ask students to locate anatomy, structures, objects, or map features by clicking image regions or completing image-anchored labels."
---

# Crear una activitat per identificar parts d'una imatge

## Quan fer-la servir

- L'alumnat ha de clicar la part d'una imatge que respon una pregunta.
- L'alumnat ha d'assignar noms a punts o zones marcats sobre un diagrama.
- Cal revisar activitats com `bio-cor`.

Per a una activitat nova, combina aquesta skill amb `integrar-activitat-webapp`.

## Procediment

1. Tria la mecànica adequada:
   - **Clicar la zona demanada**: mostra una pregunta i l'alumne selecciona la regió corresponent. Patró de `bio-cor`.
   - **Etiquetar punts de referència**: mostra marcadors fixos i l'alumne n'introdueix o selecciona el nom.
   No barregis les dues mecàniques si no hi ha una necessitat didàctica concreta.
2. Confirma quines parts s'avaluaran, els noms acceptats i si hi ha sinònims. Mantén IDs estables separats dels textos traduïts.
3. Fes servir una imatge adequada, amb `alt` descriptiu, i defineix les zones en coordenades normalitzades respecte d'un sistema lògic de la imatge, no en píxels de pantalla.
4. Converteix les coordenades del clic o dels marcadors tenint en compte la mida real de la imatge renderitzada. Evita que `object-fit`, retalls, marges o canvis de proporció desplacin les zones. Si l'escala canvia, comprova tant imatges grans com pantalles petites.
5. Per a les zones clicables, calibra posició i mida perquè no se superposin de manera confusa. Fes-les prou grans per a pantalles tàctils; si les estructures són petites o contigües, ofereix una alternativa de selecció (per exemple, controls accessibles) en lloc de dependre només del clic.
6. Per als marcadors, posiciona'ls en relació amb el contenidor de la imatge, no amb la finestra. Reutilitza el patró CSS de posicionament del projecte quan sigui adequat.
7. Proporciona feedback per encert/error, ajuda o pistes si formen part de l'activitat i un mecanisme per repetir-la. Reinicia el pas, la puntuació i els missatges en cada inicialització.
8. Comprova l'ús amb ratolí, teclat i tàctil. Els controls han de tenir noms accessibles; no facis que el color sigui l'únic indicador de correcció.
9. Desa resultats només quan correspongui i amb el flux existent de l'app.
10. Segueix els passos de `integrar-activitat-webapp` per connectar fragment, menú, JavaScript, estils i validació.

## Referències del projecte

- `js/games/bio-cor.js`: identificació de parts del cor amb clic sobre la imatge i zones definides en coordenades lògiques.
- `fragments/activities/biologia/index.html`: markup de l'activitat del cor.

Les coordenades i els noms de les parts depenen de cada imatge: no reutilitzis la configuració del cor en altres imatges.

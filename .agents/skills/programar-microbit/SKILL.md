---
name: programar-microbit
description: "Use when creating or changing a micro:bit or physical-computing learning activity in Aula CreActiva: programming concepts, device inputs and outputs, blocks, sensors, accessibility, and assessment."
---

# Crear una activitat de micro:bit i computació física

## Quan fer-la servir

- L'alumnat aprèn o aplica conceptes de programació i computació física vinculats a micro:bit.
- Cal modificar l'activitat `paralimpics-microbit` o afegir una tasca basada en sensors, entrades o sortides.

Per preguntes de coneixement sobre micro:bit sense programar ni raonar sobre entrades/sortides, fes servir `quiz-avaluatiu`. Per integrar-la, combina aquesta skill amb `integrar-activitat-webapp`.

## Procediment

1. Defineix l'objectiu computacional i el resultat esperat: seqüència, condició, repetició, entrada, sortida o comportament del dispositiu.
2. Confirma els blocs, APIs, capacitats i restriccions de la versió de micro:bit o entorn utilitzat. No inventis funcions ni demanis maquinari que l'activitat no té.
3. Relaciona les instruccions amb les entrades i sortides concretes. Distingeix el codi, el comportament simulat i el comportament del dispositiu físic.
4. Proposa reptes progressius amb casos de prova i resultats observables. Si hi ha més d'una solució vàlida, avalua el comportament i no una forma exacta de codi.
5. Si l'activitat és un quiz sobre micro:bit, mantén-la com a quiz: no simulis una connexió o execució de codi que no existeixi.
6. Ofereix controls accessibles i alternatives quan la tasca requereixi moviment, so, visió o un dispositiu físic; no facis d'una sola modalitat sensorial un requisit sense alternativa.
7. Reinicia la tasca i el resultat de manera explícita. Desa notes o puntuacions només amb el patró existent i sense registrar informació del dispositiu que no sigui necessària.
8. Prova els nivells, les respostes alternatives, el cas de reinici i la navegació de retorn. Segueix `integrar-activitat-webapp` per connectar fragment, JavaScript, menú, traduccions i estils.

## Referències del projecte

- `fragments/activities/paralimpics/paralimpics-activity-microbit.html`
- `js/games/paralimpics-microbit.js`

L'activitat actual pot ser de preguntes sobre el dispositiu i no un entorn per executar codi. Preserva aquesta distinció si no s'ha demanat explícitament ampliar-ne la mecànica.

# Laboratori de reactius i sobrants: document de disseny

Data: 26 d'octubre de 2026
Estat: proposta per validar abans de programar
Relació: tercera app de la família de química, després de `FormulacioInorganica` i `IgualacioQuimica`. Vegeu també `IgualacioQuimica/Pla_apps_germanes_quimica.md`.
Referència externa: simulació de PhET *Reactivos, productos y sobrantes* ([phet.colorado.edu/es](https://phet.colorado.edu/es/)).

## Índex

1. [Finalitat i encaix curricular](#1-finalitat-i-encaix-curricular)
2. [Idea central: la recepta i els lots](#2-idea-central-la-recepta-i-els-lots)
3. [Millores respecte del PhET](#3-millores-respecte-del-phet)
4. [Nivells i activitats](#4-nivells-i-activitats)
5. [Banc de reaccions per nivell](#5-banc-de-reaccions-per-nivell)
6. [Errors conceptuals](#6-errors-conceptuals)
7. [Textos de la interfície](#7-textos-de-la-interfície)
8. [Textos del mode Aprèn](#8-textos-del-mode-aprèn)
9. [Ajudes i pistes per activitat](#9-ajudes-i-pistes-per-activitat)
10. [Missatges de comprovació](#10-missatges-de-comprovació)
11. [Fitxes «A la vida real»](#11-fitxes-a-la-vida-real)
12. [Glossari visual](#12-glossari-visual)
13. [Dades, validació i verificació](#13-dades-validació-i-verificació)

---

## 1. Finalitat i encaix curricular

L'app ha d'ajudar l'alumnat a entendre què passa quan els reactius no hi són en la proporció exacta de l'equació: quin reactiu s'acaba primer (**reactiu limitant**), quin en sobra (**reactiu en excés**) i quanta quantitat de producte es forma.

| Curs | Sabers que treballa |
|---|---|
| 2n–3r d'ESO | Reacció química com a reorganització d'àtoms; conservació de la massa; interpretació d'una equació igualada |
| 3r–4t d'ESO | Proporcions de combinació; reactiu limitant i en excés amb models de partícules; càlculs senzills |
| 1r de batxillerat | Estequiometria amb mols i masses; reactiu limitant; rendiment i puresa (ampliació) |

Referència curricular: àmbit de la matèria i el canvi químic de Física i química de l'ESO (Decret 175/2022, LOMLOE) i Física i química de 1r de batxillerat (Decret 171/2022).

Competències que mobilitza: interpretar models, fer prediccions i contrastar-les amb l'observació, argumentar amb proves (els lots i el comptador d'àtoms) i connectar la química amb situacions quotidianes i industrials.

---

## 2. Idea central: la recepta i els lots

Tota l'app es basa en tres idees, sempre visibles:

1. **La recepta** és l'equació igualada. Els coeficients diuen la proporció en què es combinen les substàncies, no quantes n'hi ha al recipient.
2. **Un lot** és un grup de reactius exactament igual a la recepta: per a 2 H₂ + O₂ → 2 H₂O, un lot són 2 molècules d'H₂ i 1 molècula d'O₂. Cada lot que es completa dona els productes de la recepta.
3. **El reactiu limitant** és el que permet fer menys lots. Quan s'acaben els lots possibles, la reacció s'atura; tot el que no forma part d'un lot complet és **sobrant**.

```text
Lots possibles de cada reactiu = molècules que tinc ÷ coeficient (part entera)
Lots que es fan               = el valor més petit
Productes                     = lots × coeficient de cada producte
Sobrant de cada reactiu       = molècules que tinc − lots × coeficient
```

### Decisió de model: lots sencers a escala de partícules

Amb partícules soltes, només reaccionen lots sencers (com al PhET). Per això, de vegades, també sobra alguna molècula del reactiu limitant: per exemple, amb 5 rodes i 4 quadres només es fan 2 bicicletes i sobra 1 roda. L'app ho explica així:

> Ha sobrat una molècula del reactiu limitant perquè sola no pot formar un lot. Amb quantitats reals, com els mols del laboratori, el reactiu limitant s'esgota del tot.

Criteris per evitar confusions:

- **Fàcil (analogies):** els lots incomplets s'hi permeten, perquè són intuïtius (una roda sola no és mitja bicicleta).
- **Mitjà:** als reptes, el reactiu limitant sempre és múltiple del seu coeficient i, per tant, s'esgota del tot. A Explora s'hi pot arribar lliurement i surt l'explicació anterior.
- **Avançat:** apareixen expressament els lots incomplets, amb una pregunta per explicar-los.
- **Batxillerat:** es treballa amb mols (quantitats contínues), i el reactiu limitant sempre s'esgota.

---

## 3. Millores respecte del PhET

| Al PhET | En aquesta app |
|---|---|
| Mostra l'abans i el després, però no per què | **Animació en lots:** les molècules s'agrupen segons la recepta i cada lot es transforma en productes. El limitant es veu, no s'endevina |
| El joc diu «correcte» o «incorrecte» | **Feedback diagnòstic:** detecta l'error conceptual concret (vegeu l'apartat 6) i l'explica |
| No hi ha predicció explícita a la pantalla de molècules | **Cicle Predir → Fer reaccionar → Explicar** a totes les activitats |
| No hi ha taula de càlcul | **Taula Abans / Canvi / Després**, automàtica als primers nivells i per completar a Avançat i Batxillerat |
| Molècules sense context | **Reaccions reals** amb fitxa «A la vida real» (cuina, cotxe, cos humà, indústria) |
| No arriba als mols ni a les masses | **Nivell de batxillerat** amb mols, grams i conservació de la massa |
| No es veu que els àtoms es conserven | **Comptador d'àtoms** sempre visible: abans = després |
| Només en anglès i castellà | **Català**, textos de nivell A2–B1 i glossari visual |

---

## 4. Nivells i activitats

### 4.1 Nivells

| Nivell | Color | Contingut | Quantitats |
|---|---|---|---|
| Fàcil | Verd | Analogies quotidianes (entrepans, bicicletes…) | 0–10 de cada peça |
| Mitjà | Taronja | Reaccions senzilles amb models moleculars | 0–10 molècules de cada reactiu |
| Avançat | Lila | Reaccions amb més productes, compostos iònics, un sol reactiu, lots incomplets i taula per completar | 0–18 |
| Batxillerat | Blau fosc | Mols i masses; rendiment i puresa com a ampliació | Valors continus |

Els colors segueixen els de `IgualacioQuimica`, que també té quatre nivells.

### 4.2 Modes

- **Aprèn:** set mòduls curts amb explicació, model visual i exemples (apartat 8).
- **Practica:** activitats sense límit, amb pistes i ajudes.
- **Repte:** 10 preguntes amb 2 intents, puntuació (2 punts a la primera, 1 a la segona) i estrelles, com a les altres apps.
- **Explora** (dins de Practica): el recipient lliure, sense pregunta. Es tria la reacció i les quantitats, i es fa reaccionar.

### 4.3 Activitats

| Codi | Activitat | Què ha de fer l'alumne | Nivells |
|---|---|---|---|
| `prediu` | **Prediu el resultat** | Veu la recepta i els reactius; indica amb comptadors quants productes es formen i quants reactius sobren. Després es fa reaccionar | Tots |
| `limitant` | **Quin és el limitant?** | Tria el reactiu limitant (o «cap: proporció exacta») i, a Avançat, la justificació correcta entre tres | Tots |
| `abans` | **Què hi havia abans?** | Veu els productes i els sobrants; ha de deduir quants reactius hi havia | Mitjà, Avançat |
| `exacta` | **Que no sobri res** | Ajusta les quantitats de reactius perquè no sobri res i es formi una quantitat de producte determinada | Tots |
| `taula` | **Completa la taula** | Omple la taula Abans / Canvi / Després | Avançat, Batxillerat |
| `calcula` | **Calcula amb mols i grams** | A partir de les masses, troba el limitant, la massa de producte i la massa sobrant | Batxillerat |
| `barreja` | **Barreja** | Alterna les activitats del nivell | Tots |

---

## 5. Banc de reaccions per nivell

Totes les equacions i tots els casos s'han comprovat automàticament: àtoms igualats, lots, productes, sobrants i conservació de la massa. Els «casos clau» són reptes fixos que sempre surten en el banc. A més, l'app generarà casos aleatoris amb les regles de l'apartat 5.5.

Marca **E1** = cas dissenyat contra l'error «el limitant és el que en té menys».

### 5.1 Fàcil: analogies

| Codi | Recepta | Casos clau (abans → resultat) |
|---|---|---|
| F1 | 2 llesques de pa + 1 llesca de formatge → 1 entrepà | 6 pa, 3 formatge → 3 entrepans, no sobra res · 7 pa, 5 formatge → 3 entrepans; sobren 1 pa i 2 formatge · 4 pa, 4 formatge → 2 entrepans; sobren 2 formatge |
| F2 | 2 rodes + 1 quadre → 1 bicicleta | 9 rodes, 3 quadres → 3 bicicletes; sobren 3 rodes · 5 rodes, 4 quadres → 2 bicicletes; sobren 1 roda i 2 quadres (**E1**) |
| F3 | 3 rodes + 1 quadre → 1 tricicle | 7 rodes, 3 quadres → 2 tricicles; sobren 1 roda i 1 quadre (**E1**) |
| F4 | 4 rodes + 1 carrosseria → 1 cotxe de joguina | 10 rodes, 3 carrosseries → 2 cotxes; sobren 2 rodes i 1 carrosseria (**E1**) |
| F5 | 4 potes + 1 tauler → 1 taula | 8 potes, 1 tauler → 1 taula; sobren 4 potes |
| F6 | 2 llesques de pa + 1 pernil + 1 formatge → 1 entrepà mixt | 6 pa, 2 pernil, 4 formatge → 2 entrepans; sobren 2 pa i 2 formatge |
| F7 | 2 llesques de pa + 1 tomàquet → 2 pans amb tomàquet | 6 pa, 2 tomàquets → 4 pans amb tomàquet; sobren 2 pa |
| F8 | 3 flors + 1 cinta → 1 ram | 10 flors, 4 cintes → 3 rams; sobren 1 flor i 1 cinta |
| F9 | 5 perles + 1 fil → 1 polsera | 12 perles, 3 fils → 2 polseres; sobren 2 perles i 1 fil (**E1**) |

F6 introdueix tres reactius. F7 mostra que un producte també pot tenir coeficient (amb un sol tomàquet es fan dues llesques).

### 5.2 Mitjà: molècules

| Codi | Equació | Context | Casos clau (abans → resultat) |
|---|---|---|---|
| M1 | 2 H₂ + O₂ → 2 H₂O | Formació de l'aigua | 4 H₂, 2 O₂ → 4 H₂O, no sobra res · 6 H₂, 5 O₂ → 6 H₂O; sobren 2 O₂ (**E1**) · 4 H₂, 4 O₂ → 4 H₂O; sobren 2 O₂ |
| M2 | N₂ + 3 H₂ → 2 NH₃ | Amoníac per a adobs | 2 N₂, 6 H₂ → 4 NH₃, no sobra res · 3 N₂, 6 H₂ → 4 NH₃; sobra 1 N₂ (**E1**) · 4 N₂, 9 H₂ → 6 NH₃; sobra 1 N₂ (**E1**) |
| M3 | H₂ + Cl₂ → 2 HCl | Àcid clorhídric | 3 H₂, 5 Cl₂ → 6 HCl; sobren 2 Cl₂ |
| M4 | C + O₂ → CO₂ | Carbó d'una barbacoa | 4 C, 6 O₂ → 4 CO₂; sobren 2 O₂ |
| M5 | 2 C + O₂ → 2 CO | Combustió amb poc oxigen | 6 C, 2 O₂ → 4 CO; sobren 2 C |
| M6 | CH₄ + 2 O₂ → CO₂ + 2 H₂O | Gas natural de la cuina | 2 CH₄, 4 O₂ → 2 CO₂ + 4 H₂O, no sobra res · 3 CH₄, 4 O₂ → 2 CO₂ + 4 H₂O; sobra 1 CH₄ (**E1**) |
| M7 | S + O₂ → SO₂ | Combustió del sofre | 5 S, 3 O₂ → 3 SO₂; sobren 2 S |
| M8 | 2 SO₂ + O₂ → 2 SO₃ | Pluja àcida | 4 SO₂, 4 O₂ → 4 SO₃; sobren 2 O₂ |
| M9 | N₂ + O₂ → 2 NO | Dins d'un motor | 2 N₂, 5 O₂ → 4 NO; sobren 3 O₂ |
| M10 | 2 NO + O₂ → 2 NO₂ | Contaminació urbana | 6 NO, 2 O₂ → 4 NO₂; sobren 2 NO |
| M11 | 2 CO + O₂ → 2 CO₂ | Catalitzador del cotxe | 4 CO, 3 O₂ → 4 CO₂; sobra 1 O₂ |
| M12 | HCl + NaOH → NaCl + H₂O | Neutralització | 4 HCl, 6 NaOH → 4 NaCl + 4 H₂O; sobren 2 NaOH |

Contrast didàctic: a M3 el nombre total de molècules no canvia (8 → 8); a M1 sí (6 + 5 = 11 → 6 + 2 = 8). Es fa servir a l'error E5.

### 5.3 Avançat

| Codi | Equació | Context | Casos clau (abans → resultat) |
|---|---|---|---|
| A1 | C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O | Bombona de propà | 2 C₃H₈, 10 O₂ → 6 CO₂ + 8 H₂O, no sobra res · 3 C₃H₈, 10 O₂ → 6 CO₂ + 8 H₂O; sobra 1 C₃H₈ · 2 C₃H₈, 8 O₂ → 3 CO₂ + 4 H₂O; sobren 1 C₃H₈ i 3 O₂ (**lot incomplet**) |
| A2 | C₂H₅OH + 3 O₂ → 2 CO₂ + 3 H₂O | Alcohol de cremar | 2 C₂H₅OH, 9 O₂ → 4 CO₂ + 6 H₂O; sobren 3 O₂ |
| A3 | 2 CH₄ + 3 O₂ → 2 CO + 4 H₂O | Combustió incompleta del gas | 4 CH₄, 6 O₂ → 4 CO + 8 H₂O, no sobra res |
| A4 | 4 NH₃ + 5 O₂ → 4 NO + 6 H₂O | Àcid nítric (procés d'Ostwald) | 4 NH₃, 10 O₂ → 4 NO + 6 H₂O; sobren 5 O₂ |
| A5 | 2 H₂S + 3 O₂ → 2 SO₂ + 2 H₂O | Gasos volcànics | 6 H₂S, 6 O₂ → 4 SO₂ + 4 H₂O; sobren 2 H₂S (mateixa quantitat, però no és 1:1) |
| A6 | 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂ | Fotosíntesi | 12 CO₂, 18 H₂O → 2 C₆H₁₂O₆ + 12 O₂; sobren 6 H₂O |
| A7 | C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O | Respiració cel·lular | 2 C₆H₁₂O₆, 6 O₂ → 6 CO₂ + 6 H₂O; sobra 1 C₆H₁₂O₆ (**E1**) |
| A8 | 4 Fe + 3 O₂ → 2 Fe₂O₃ | Rovell (model simplificat) | 8 Fe, 3 O₂ → 2 Fe₂O₃; sobren 4 Fe |
| A9 | 2 Mg + O₂ → 2 MgO | Bengales | 6 Mg, 2 O₂ → 4 MgO; sobren 2 Mg |
| A10 | 2 Na + Cl₂ → 2 NaCl | Sal comuna | 4 Na, 3 Cl₂ → 4 NaCl; sobra 1 Cl₂ |
| A11 | Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂ | Alt forn | 2 Fe₂O₃, 3 CO → 2 Fe + 3 CO₂; sobra 1 Fe₂O₃ (**E1**) |
| A12 | 2 Al + Fe₂O₃ → Al₂O₃ + 2 Fe | Soldadura de vies (termita) | 4 Al, 3 Fe₂O₃ → 2 Al₂O₃ + 4 Fe; sobra 1 Fe₂O₃ |
| A13 | CaCO₃ + 2 HCl → CaCl₂ + H₂O + CO₂ | Salfumant sobre marbre | 3 CaCO₃, 4 HCl → 2 CaCl₂ + 2 H₂O + 2 CO₂; sobra 1 CaCO₃ (**E1**) |
| A14 | NaHCO₃ + HCl → NaCl + H₂O + CO₂ | Bicarbonat contra l'acidesa | 5 NaHCO₃, 3 HCl → 3 NaCl + 3 H₂O + 3 CO₂; sobren 2 NaHCO₃ |
| A15 | Mg(OH)₂ + 2 HCl → MgCl₂ + 2 H₂O | Antiàcid (llet de magnèsia) | 2 Mg(OH)₂, 6 HCl → 2 MgCl₂ + 4 H₂O; sobren 2 HCl |
| A16 | H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O | Neutralització | 3 H₂SO₄, 4 NaOH → 2 Na₂SO₄ + 4 H₂O; sobra 1 H₂SO₄ (**E1**) |
| A17 | 2 H₂O₂ → 2 H₂O + O₂ | Aigua oxigenada | 6 H₂O₂ → 6 H₂O + 3 O₂; **un sol reactiu: no hi ha limitant** |
| A18 | CaCO₃ → CaO + CO₂ | Forn de calç | 4 CaCO₃ → 4 CaO + 4 CO₂; **un sol reactiu: no hi ha limitant** |

Els compostos iònics (MgO, NaCl, Fe₂O₃, CaCO₃…) no formen molècules. Al model se'n dibuixa una **unitat de fórmula**, amb una vora discontínua i una nota la primera vegada que apareix (vegeu el mòdul 2 de l'apartat 8).

Les reaccions A3 i M6 es presenten en parella: amb el mateix combustible, si falta oxigen es forma CO en lloc de CO₂.

### 5.4 Batxillerat: mols i masses

Masses atòmiques arrodonides que fa servir l'app (g/mol): H 1; C 12; N 14; O 16; Na 23; Mg 24; Al 27; S 32; Cl 35,5; Ca 40; Fe 56.

| Codi | Equació | Dades | Limitant | Productes | Sobrant | Comprovació de massa |
|---|---|---|---|---|---|---|
| B1 | N₂ + 3 H₂ → 2 NH₃ | 28 g N₂ (1 mol) i 9 g H₂ (4,5 mol) | N₂ | 2 mol NH₃ = 34 g | 1,5 mol H₂ = 3 g | 37 g = 37 g |
| B2 | 2 H₂ + O₂ → 2 H₂O | 10 g H₂ (5 mol) i 64 g O₂ (2 mol) | O₂ (**E11**: en té més grams) | 4 mol H₂O = 72 g | 1 mol H₂ = 2 g | 74 g = 74 g |
| B3 | CH₄ + 2 O₂ → CO₂ + 2 H₂O | 32 g CH₄ (2 mol) i 96 g O₂ (3 mol) | O₂ (**E12**: en té més mols) | 1,5 mol CO₂ = 66 g; 3 mol H₂O = 54 g | 0,5 mol CH₄ = 8 g | 128 g = 128 g |
| B4 | C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O | 44 g C₃H₈ (1 mol) i 128 g O₂ (4 mol) | O₂ | 2,4 mol CO₂ = 105,6 g; 3,2 mol H₂O = 57,6 g | 0,2 mol C₃H₈ = 8,8 g | 172 g = 172 g |
| B5 | Fe₂O₃ + 3 CO → 2 Fe + 3 CO₂ | 160 g Fe₂O₃ (1 mol) i 112 g CO (4 mol) | Fe₂O₃ | 2 mol Fe = 112 g; 3 mol CO₂ = 132 g | 1 mol CO = 28 g | 272 g = 272 g |
| B6 | 2 Al + Fe₂O₃ → Al₂O₃ + 2 Fe | 54 g Al (2 mol) i 320 g Fe₂O₃ (2 mol) | Al (mateixos mols, **E12**) | 1 mol Al₂O₃ = 102 g; 2 mol Fe = 112 g | 1 mol Fe₂O₃ = 160 g | 374 g = 374 g |
| B7 | CaCO₃ + 2 HCl → CaCl₂ + H₂O + CO₂ | 50 g CaCO₃ (0,5 mol) i 73 g HCl (2 mol) | CaCO₃ | 0,5 mol de cada: 55,5 g CaCl₂; 9 g H₂O; 22 g CO₂ | 1 mol HCl = 36,5 g | 123 g = 123 g |
| B8 | Mg(OH)₂ + 2 HCl → MgCl₂ + 2 H₂O | 29 g Mg(OH)₂ (0,5 mol) i 18,25 g HCl (0,5 mol) | HCl (mateixos mols, **E12**) | 0,25 mol MgCl₂ = 23,75 g; 0,5 mol H₂O = 9 g | 0,25 mol Mg(OH)₂ = 14,5 g | 47,25 g = 47,25 g |
| B9 | 4 Fe + 3 O₂ → 2 Fe₂O₃ | 112 g Fe (2 mol) i 64 g O₂ (2 mol) | Fe | 1 mol Fe₂O₃ = 160 g | 0,5 mol O₂ = 16 g | 176 g = 176 g |
| B10 | NaHCO₃ + HCl → NaCl + H₂O + CO₂ | 8,4 g NaHCO₃ (0,1 mol) i 7,3 g HCl (0,2 mol) | NaHCO₃ | 0,1 mol de cada: 5,85 g NaCl; 1,8 g H₂O; 4,4 g CO₂ | 0,1 mol HCl = 3,65 g | 15,7 g = 15,7 g |

**Ampliació (rendiment i puresa):**

| Codi | Enunciat | Solució |
|---|---|---|
| R1 | Amb les dades de B1 s'obtenen realment 8,5 g d'NH₃. Quin és el rendiment? | Teòric 34 g → rendiment = 8,5 / 34 × 100 = 25 % |
| R2 | Es descomponen 200 g de pedra calcària amb un 80 % de CaCO₃ (CaCO₃ → CaO + CO₂). Quina massa de CO₂ s'obté? | 160 g CaCO₃ = 1,6 mol → 1,6 mol CO₂ = 70,4 g |

### 5.5 Regles per generar casos aleatoris

| Nivell | Regles |
|---|---|
| Fàcil | Quantitats de 0 a 10; almenys 1 lot possible; un 40 % dels casos amb el limitant que té més peces (E1); un 15 % en proporció exacta |
| Mitjà | Quantitats de 1 a 10; el limitant sempre múltiple del seu coeficient; un 40 % E1; un 15 % en proporció exacta; un 15 % amb la mateixa quantitat dels dos reactius (E14) |
| Avançat | Quantitats de 1 a 18; un 20 % amb lots incomplets; un 10 % amb un sol reactiu (A17, A18); un 30 % E1 |
| Batxillerat | Masses que donen mols amb un decimal com a màxim; un 30 % amb el limitant que en té més grams (E11); un 30 % amb el limitant que en té més mols (E12) |

En tots els nivells, el nombre total de partícules dibuixades no passa de 40 perquè el recipient continuï sent llegible.

---

## 6. Errors conceptuals

Cada error té un codi que fa servir el corrector per triar el missatge. La columna «Com es detecta» descriu la resposta típica de l'alumne. Els textos dels missatges són a l'apartat 10.

| Codi | Error conceptual | Com es detecta | Com l'aborda l'app |
|---|---|---|---|
| E1 | El limitant és el reactiu del qual n'hi ha menys | Tria com a limitant el reactiu amb menys partícules, grams o mols, i no és el correcte | Casos E1 a tots els nivells; els lots mostren que el que en té més pot acabar-se primer |
| E2 | El limitant és el del coeficient més petit (o més gran) | Tria sempre el reactiu del coeficient extrem, independentment de les quantitats | Mateixa reacció amb quantitats diferents i limitants diferents |
| E3 | Els coeficients són les quantitats que hi ha al recipient | Respon els productes de la recepta (1 lot) en lloc dels de tots els lots | Separació visual entre la «recepta» (a dalt) i el «recipient» (al mig) |
| E4 | Sempre s'han de gastar tots els reactius, o sempre n'ha de sobrar algun | Respon «no sobra res» quan sí que en sobra, o «sobra» en proporcions exactes | Casos en proporció exacta barrejats amb casos amb sobrants |
| E5 | Es conserva el nombre de molècules | Fa que el nombre de molècules de productes sigui igual al de reactius gastats | Comptador d'àtoms i de molècules; contrast entre M1 i M3 |
| E6 | La massa es perd (o el gas «no compta») | A batxillerat, la massa de productes + sobrants no coincideix amb la inicial | Comprovació de massa a la taula i balança animada |
| E7 | El sobrant desapareix o es converteix en producte més tard | Posa el sobrant com a 0 o el suma als productes | El sobrant queda separat, amb rètol «No ha reaccionat» |
| E8 | Si dobles un reactiu, dobles el producte | Dobla els productes quan només s'ha doblat un reactiu | Activitat «Que no sobri res» i casos en què doblar un sol reactiu no canvia res |
| E9 | Confondre coeficients i subíndexs | Compta 2 H₂O com 2 àtoms d'H, o canvia subíndexs | Desglossament d'àtoms en passar per sobre d'una fórmula |
| E10 | Escriure el sobrant com a producte de l'equació | A la taula, escriu el reactiu sobrant a la columna de productes | La recepta no canvia mai; el sobrant només surt al recipient i a la fila «Després» |
| E11 | Comparar grams per trobar el limitant | Tria el reactiu amb menys massa | Pas obligatori «Passa a mols» abans de comparar |
| E12 | Comparar mols sense dividir pel coeficient | Tria el reactiu amb menys mols | Pas «Lots possibles = mols ÷ coeficient» a la taula |
| E13 | El reactiu en excés no serveix per a res | Pregunta d'Avançat: tria «és un error del químic» | Mòdul 6 d'Aprèn i fitxes (excés d'oxigen per evitar el CO) |
| E14 | Els reactius sempre reaccionen 1 a 1 | Amb quantitats iguals, diu que no en sobra cap | Casos amb la mateixa quantitat i coeficients diferents (M1, A5) |
| E15 | Una molècula sola pot fer «mitja reacció» | A Avançat, dibuixa o compta fraccions de molècula | Explicació dels lots incomplets; contrast amb els mols a batxillerat |
| E16 | Tota reacció té un reactiu limitant | Tria un limitant en una reacció d'un sol reactiu | Casos A17 i A18 amb l'opció «Només hi ha un reactiu» |
| E17 | Els productes es formen «a parts iguals» | Posa el mateix nombre de cada producte sense mirar els coeficients | Casos amb coeficients de producte diferents (M6, A1, A2) |

Nota: aquests errors estan àmpliament descrits en la recerca en didàctica de l'estequiometria. Els percentatges dels casos aleatoris (apartat 5.5) són una decisió de disseny, no una dada empírica, i caldrà ajustar-los després de provar l'app amb alumnes.

---

## 7. Textos de la interfície

### 7.1 Capçalera i navegació

| Element | Text |
|---|---|
| Títol de l'app | Laboratori de reactius i sobrants |
| Títol de la pestanya del navegador | Reactius i sobrants |
| Pestanyes de mode | Aprèn · Practica · Repte |
| Nivells | Fàcil · Mitjà · Avançat · Batxillerat |
| Selector de reacció | Totes les reaccions ▾ |
| Opcions del selector | Totes les reaccions · Analogies · Combustions · Atmosfera i contaminació · Cos humà · Indústria · Àcids i bases · Un sol reactiu |
| Botó principal | Nova pregunta (Practica) · Nou repte (Repte) |
| Icones (etiqueta accessible) | Glossari · El meu progrés · Mode projector |

### 7.2 Zona de treball

| Element | Text |
|---|---|
| Títol de la recepta | Recepta |
| Explicació sota la recepta | Els nombres de la recepta diuen en quina proporció es combinen. No són les quantitats que tens. |
| Títol del recipient abans | Abans de la reacció |
| Títol del recipient després | Després de la reacció |
| Zona de productes | Productes |
| Zona de sobrants | Sobrants · No han reaccionat |
| Comptador | Lots fets: {n} |
| Rètol d'un lot incomplet | Lot incomplet |
| Comptador d'àtoms | Àtoms: abans {a} · després {b} |
| Comptador d'àtoms quan quadra | Es conserven tots els àtoms ✓ |
| Unitat de fórmula (compostos iònics) | Unitat de fórmula: no és una molècula |
| Etiquetes accessibles dels comptadors | Treu-ne un · Afegeix-ne un |

### 7.3 Botons d'acció

| Botó | Text |
|---|---|
| Predir | Fixa la predicció |
| Reaccionar | Fes reaccionar ▶ |
| Reiniciar el recipient | Torna a començar |
| Comprovar | Comprova |
| Pista | Pista |
| Solució | Mostra la solució |
| Següent | Següent pregunta → |
| Veure els lots | Mostra els lots |
| Velocitat de l'animació | Lent · Normal · Ràpid |

### 7.4 Enunciats per activitat

| Activitat | Etiqueta | Enunciat |
|---|---|---|
| `prediu` | Prediu el resultat | Quants productes es formaran i quants reactius sobraran? |
| `limitant` | Quin és el limitant? | Quin reactiu s'acaba primer? |
| `limitant` (Avançat) | Per què? | Tria l'explicació correcta. |
| `abans` | Què hi havia abans? | Aquests són els productes i els sobrants. Quants reactius hi havia al principi? |
| `exacta` | Que no sobri res | Posa els reactius justos per obtenir {n} {producte} sense que sobri res. |
| `taula` | Completa la taula | Omple les caselles buides de la taula Abans / Canvi / Després. |
| `calcula` | Calcula | Calcula el reactiu limitant, la massa de {producte} que s'obté i la massa que sobra. |

Opcions fixes de l'activitat `limitant`:

- «{reactiu}» (una opció per a cada reactiu)
- «Cap: estan en proporció exacta»
- «Només hi ha un reactiu» (només en reaccions d'un sol reactiu)

Justificacions (Avançat), una de correcta i dues de distractores:

- Correcta: «Perquè permet fer menys lots.»
- Distractor E1: «Perquè n'hi ha menys molècules.»
- Distractor E2: «Perquè té el coeficient més petit.» o «Perquè té el coeficient més gran.»

### 7.5 Taula Abans / Canvi / Després

| Element | Text |
|---|---|
| Títol | Taula de la reacció |
| Files | Abans · Canvi · Després |
| Nota del canvi | Els reactius es gasten (−) i els productes es formen (+), sempre en la proporció de la recepta. |
| Fila addicional (batxillerat) | Massa molar (g/mol) · Massa (g) · Mols (mol) · Lots possibles (mols ÷ coeficient) |
| Comprovació de massa | Massa inicial: {a} g · Massa final: {b} g |

### 7.6 Mode Repte

| Element | Text |
|---|---|
| Comptador | Pregunta {i} de 10 |
| Intents | Intents |
| Punts | {n} punts |
| Títol del resultat | Repte acabat! |
| Puntuació | {n} punts de 20 |
| Detall | {a} a la primera, {b} a la segona i {c} sense encertar. Encertar a la primera val 2 punts; a la segona, 1. |
| Botons | Torna a jugar · Torna a practicar |
| Valoració (3 estrelles, ≥ 18 punts) | Excel·lent! Domines el reactiu limitant. |
| Valoració (2 estrelles, 12–17 punts) | Molt bé! Repassa els casos en què fallaves. |
| Valoració (1 estrella, 6–11 punts) | Vas pel bon camí. Practica una mica més amb els lots. |
| Valoració (0 estrelles, < 6 punts) | Torna a mirar el mòdul «Lots i reactiu limitant» i prova-ho de nou. |

### 7.7 Progrés i estats buits

| Element | Text |
|---|---|
| Títol del panell | El meu progrés |
| Resum | Has encertat {a} de {b} preguntes. |
| Per nivell | {nivell}: {a} encerts de {b} |
| Errors freqüents | Errors que més repeteixes |
| Reiniciar | Esborra el progrés |
| Confirmació | Segur que vols esborrar tot el progrés? No es pot desfer. |
| Sense dades | Encara no has respost cap pregunta. |
| Filtres sense resultats | No hi ha reaccions amb aquests filtres. Activa un altre nivell o tria una altra família. |
| Peu | Peu corporatiu de la skill `felip-app-footer` (CC BY-NC-SA 4.0) |

---

## 8. Textos del mode Aprèn

Cada mòdul té una explicació breu, un model visual interactiu i dos o tres exemples. Els textos són de nivell A2–B1.

### Mòdul 0. La recepta d'una reacció

**Introducció:** Una equació química igualada és com una recepta de cuina: diu quins ingredients cal posar i en quina proporció.

- **Llegir la recepta.** 2 H₂ + O₂ → 2 H₂O vol dir: «2 molècules d'hidrogen i 1 molècula d'oxigen formen 2 molècules d'aigua».
- **Els coeficients són proporcions.** El 2 de 2 H₂ no vol dir que al recipient hi hagi 2 molècules. Vol dir que, per cada molècula d'oxigen, en calen 2 d'hidrogen.
- **Coeficient i subíndex no són el mateix.** A 2 H₂O, el 2 del davant (coeficient) diu quantes molècules hi ha. El ₂ petit (subíndex) diu quants àtoms d'hidrogen té cada molècula.
- **Una recepta ha d'estar igualada.** Si no hi ha els mateixos àtoms a cada costat, no és una recepta vàlida. Per igualar-la, fes servir el Laboratori d'igualació d'equacions.

Exemple visual: la recepta de l'entrepà (2 llesques + 1 formatge → 1 entrepà) al costat de la recepta de l'aigua.

### Mòdul 1. Els lots

**Introducció:** Per saber què passarà, agrupa els reactius en lots. Un lot és un grup exactament igual a la recepta.

- **Fer lots.** Si tens 6 llesques de pa i 3 de formatge, pots fer 3 lots (3 entrepans).
- **Cada lot dona els productes de la recepta.** 3 lots d'entrepà → 3 entrepans. 3 lots de 2 H₂ + O₂ → 6 H₂O.
- **Si no es pot completar un lot, aquelles peces sobren.** Amb 7 llesques i 3 de formatge, també es fan 3 entrepans i sobra 1 llesca.

Model interactiu: l'alumne arrossega o afegeix peces i veu com s'encerclen els lots complets.

### Mòdul 2. Reactiu limitant i reactiu en excés

**Introducció:** La reacció s'atura quan s'acaba un dels reactius. Aquest reactiu mana: decideix quant producte es pot fer.

- **Reactiu limitant:** el que permet fer menys lots. S'acaba primer.
- **Reactiu en excés:** el que en sobra quan la reacció s'atura.
- **Compte!** El limitant no sempre és el que en tens menys. Amb 6 H₂ i 5 O₂, l'hidrogen dona per a 3 lots i l'oxigen per a 5: el limitant és l'hidrogen, encara que en tinguis més molècules.
- **Proporció exacta.** Si tots els reactius donen per al mateix nombre de lots, no en sobra cap.
- **Compostos iònics.** Substàncies com la sal (NaCl) no estan fetes de molècules, sinó d'ions ordenats en un cristall. Al model en dibuixem una unitat de fórmula (1 Na i 1 Cl) amb una vora discontínua.

Regla per recordar-ho: **lots possibles = quantitat ÷ coeficient. El que en dona menys és el limitant.**

### Mòdul 3. Què es conserva i què no

**Introducció:** En una reacció, els àtoms no es creen ni es destrueixen: només canvien de parella.

- **Es conserven els àtoms.** Abans i després de la reacció hi ha els mateixos àtoms de cada element, comptant també els sobrants.
- **Es conserva la massa.** Com que els àtoms es conserven, la massa total també. És la llei de Lavoisier.
- **No sempre es conserva el nombre de molècules.** A 2 H₂ + O₂ → 2 H₂O, 3 molècules en formen 2. A H₂ + Cl₂ → 2 HCl, 2 en formen 2.
- **Els gasos també compten.** Si es desprèn un gas, sembla que «es perd massa», però la massa és al gas.

Model interactiu: comptador d'àtoms de colors abans i després, i una balança que es manté equilibrada.

### Mòdul 4. La taula Abans / Canvi / Després

**Introducció:** Una taula ajuda a ordenar els càlculs i a no oblidar cap substància.

- **Abans:** el que hi ha al recipient al principi. Els productes comencen a 0.
- **Canvi:** el que es gasta (−) i el que es forma (+). Sempre és lots × coeficient.
- **Després:** abans + canvi. El reactiu limitant queda a 0 (o amb un lot incomplet); el reactiu en excés queda amb el sobrant.

Exemple resolt: N₂ + 3 H₂ → 2 NH₃ amb 3 N₂ i 6 H₂.

| | N₂ | H₂ | NH₃ |
|---|---|---|---|
| Abans | 3 | 6 | 0 |
| Canvi | −2 | −6 | +4 |
| Després | 1 | 0 | 4 |

### Mòdul 5. Del lot al mol (batxillerat)

**Introducció:** Al laboratori no comptem molècules d'una en una: en comptem mols. Un mol és un paquet de 6,022 · 10²³ partícules.

- **Els coeficients també valen en mols.** 2 H₂ + O₂ → 2 H₂O vol dir també «2 mol d'H₂ i 1 mol d'O₂ formen 2 mol d'H₂O».
- **Passa sempre de grams a mols.** Per trobar el limitant, no comparis grams: 10 g d'H₂ són 5 mol, i 64 g d'O₂ en són només 2.
- **Divideix pel coeficient.** Lots possibles d'H₂ = 5 ÷ 2 = 2,5; d'O₂ = 2 ÷ 1 = 2. El limitant és l'O₂.
- **Amb mols, el limitant s'esgota del tot.** Els mols poden tenir decimals, i no hi ha lots incomplets.
- **Comprova la massa.** Massa inicial = massa dels productes + massa dels sobrants.

Passos per resoldre un problema:

1. Escriu l'equació igualada.
2. Passa les masses a mols (n = m ÷ M).
3. Divideix els mols de cada reactiu pel seu coeficient.
4. El valor més petit indica el limitant.
5. Calcula els mols de productes i de sobrants, i passa'ls a grams.
6. Comprova que la massa es conserva.

### Mòdul 6. Per què es posa un reactiu en excés?

**Introducció:** A la indústria i a la vida quotidiana, sovint es posa expressament un reactiu en excés.

- **Per aprofitar el reactiu car o perillós.** Si un reactiu és car, se'n posa un altre en excés perquè el car reaccioni tot.
- **Per seguretat.** En una estufa o una caldera cal oxigen en excés: si en falta, es forma monòxid de carboni (CO), un gas tòxic que no fa olor.
- **Per neutralitzar del tot.** Per neutralitzar un vessament d'àcid, es posa base en excés per assegurar que no en quedi.
- **L'excés també té un cost.** El reactiu sobrant s'ha de recuperar o tractar com a residu.

Exemple visual: la mateixa quantitat de metà amb molt oxigen (M6, es forma CO₂) i amb poc oxigen (A3, es forma CO).

### Mòdul 7. La química de cada dia

Galeria de targetes amb les reaccions del banc agrupades per context (cuina, cotxe, cos humà, indústria, medicaments). Cada targeta obre la fitxa «A la vida real» de l'apartat 11 i el botó **Prova-ho al laboratori**, que obre Explora amb aquella reacció.

---

## 9. Ajudes i pistes per activitat

L'ajuda del panell lateral és sempre visible. Les pistes s'obren de una en una amb el botó **Pista** (tres nivells: recordatori, mètode i pas concret). A Repte, cada pista utilitzada resta 1 punt dels possibles en aquella pregunta.

### `prediu`: Prediu el resultat

Ajuda:
- Agrupa els reactius en lots iguals a la recepta.
- Compta quants lots pots fer amb cada reactiu.
- El valor més petit és el nombre de lots que es fan.

Pistes:
1. Quantes molècules de {reactiu A} demana cada lot? I de {reactiu B}?
2. Amb {qA} {A} pots fer {lotsA} lots, i amb {qB} {B}, {lotsB}. Quants lots es fan, doncs?
3. Es fan {lots} lots. Cada lot dona {coef} {producte}: en total, {lots} × {coef}.

### `limitant`: Quin és el limitant?

Ajuda:
- El limitant és el que s'acaba primer.
- No miris quantes en tens: mira quants lots en pots fer.
- Lots possibles = quantitat ÷ coeficient.

Pistes:
1. Recorda: no és el que en tens menys, sinó el que dona menys lots.
2. Divideix la quantitat de cada reactiu pel seu coeficient.
3. {A}: {qA} ÷ {cA} = {lotsA} lots. {B}: {qB} ÷ {cB} = {lotsB} lots.

### `abans`: Què hi havia abans?

Ajuda:
- Els productes et diuen quants lots s'han fet.
- Cada lot ha gastat els reactius de la recepta.
- Al principi hi havia el que s'ha gastat més el que ha sobrat.

Pistes:
1. Quants lots calen per formar {qP} {producte}?
2. S'han fet {lots} lots. Quantes {A} s'han gastat? Quantes {B}?
3. Abans = gastat + sobrant. {A}: {gA} + {sA}.

### `exacta`: Que no sobri res

Ajuda:
- Perquè no sobri res, tots els reactius han de donar per al mateix nombre de lots.
- Calcula primer quants lots necessites.

Pistes:
1. Quants lots calen per obtenir {n} {producte}?
2. Necessites {lots} lots. Multiplica cada coeficient de la recepta per {lots}.
3. Cal posar {lots} × {cA} {A} i {lots} × {cB} {B}.

### `taula`: Completa la taula

Ajuda:
- Abans: el que hi ha al principi; els productes comencen a 0.
- Canvi: lots × coeficient, en negatiu per als reactius i en positiu per als productes.
- Després: abans + canvi.

Pistes:
1. Comença trobant quants lots es fan.
2. La fila Canvi és sempre proporcional a la recepta.
3. El limitant queda a 0 a la fila Després (o amb el que no fa un lot sencer).

### `calcula`: Calcula amb mols i grams

Ajuda:
- Passa les masses a mols: n = m ÷ M.
- Divideix els mols de cada reactiu pel seu coeficient.
- El valor més petit indica el limitant.

Pistes:
1. Calcula la massa molar de cada reactiu i passa a mols.
2. {A}: {nA} mol ÷ {cA} = {xA}. {B}: {nB} mol ÷ {cB} = {xB}.
3. El limitant és {lim}. Mols de {producte} = {x} × {cP}; massa = mols × {MP} g/mol.

---

## 10. Missatges de comprovació

Els missatges són curts, concrets i amables. Les claus entre claus `{}` les omple l'app.

### 10.1 Encerts

Es fa servir un d'aquests missatges a l'atzar, seguit de la frase de l'explicació:

- Molt bé!
- Perfecte!
- Exacte!
- Ho has clavat!

Frase d'explicació segons l'activitat:

| Activitat | Text |
|---|---|
| `prediu` | S'han fet {lots} lots: es formen {productes} i sobren {sobrants}. |
| `limitant` | {lim} és el limitant: només dona per a {lots} lots. |
| `limitant` (exacta) | No sobra res: tots els reactius donen per a {lots} lots. |
| `limitant` (un reactiu) | Només hi ha un reactiu: no pot ser limitant ni estar en excés. |
| `abans` | Al principi hi havia {reactius}. |
| `exacta` | Amb {reactius} es fan {lots} lots justos i no sobra res. |
| `taula` | Taula completa. La massa es conserva: {a} = {b}. |
| `calcula` | El limitant és {lim}. S'obtenen {m} g de {producte} i sobren {s} g de {exces}. |

### 10.2 Missatges d'error per diagnòstic

| Codi | Missatge |
|---|---|
| E1 | No és el que en tens menys. Mira els lots: {A} dona per a {lotsA} lots i {B} per a {lotsB}. |
| E2 | Fixa't en les quantitats, no només en el coeficient. Quants lots dona cada reactiu? |
| E3 | Has comptat només 1 lot. Al recipient n'hi caben {lots}: multiplica pel nombre de lots. |
| E4 (diu que no sobra) | Sí que sobra alguna cosa: {A} dona per a més lots dels que es fan. |
| E4 (diu que sobra) | Aquesta vegada no sobra res: tots els reactius donen per a {lots} lots. |
| E5 | Els àtoms es conserven, però les molècules no sempre. Compta els àtoms, no les molècules. |
| E6 | La massa no quadra. Recorda que la massa inicial ha de ser igual a la dels productes més la dels sobrants. |
| E7 | El sobrant no desapareix: queda al recipient sense reaccionar. |
| E8 | Si només augmentes un reactiu, l'altre continua limitant. Els lots no augmenten. |
| E9 | Compte amb els subíndexs: cada {fórmula} té {n} àtoms de {element}. |
| E10 | El sobrant no és un producte. Va a la fila «Després» dels reactius. |
| E11 | No comparis grams. Passa primer a mols: {A} són {nA} mol i {B}, {nB} mol. |
| E12 | Divideix els mols pel coeficient: {A} → {xA}; {B} → {xB}. |
| E13 | El reactiu en excés té una funció: assegura que l'altre reaccioni del tot. |
| E14 | Els reactius no sempre reaccionen 1 a 1. La recepta diu {cA} {A} per cada {cB} {B}. |
| E15 | Una molècula no es pot partir. Si no arriba a un lot sencer, sobra. |
| E16 | Aquesta reacció només té un reactiu. Es gasta tot el que pot formar lots. |
| E17 | Cada producte es forma segons el seu coeficient: {cP1} {P1} i {cP2} {P2} per lot. |
| Genèric | Encara no. Revisa quants lots es poden fer. |

Si una resposta encaixa amb dos errors, es mostra el de codi més baix, perquè és el més bàsic.

### 10.3 Lots incomplets (Explora i Avançat)

Ha sobrat {n} {reactiu limitant} perquè sol no pot formar un lot. Amb quantitats reals, com els mols del laboratori, el reactiu limitant s'esgota del tot.

### 10.4 Avisos d'entrada

| Situació | Text |
|---|---|
| Camp buit | Escriu un nombre a cada casella. |
| Nombre negatiu | Les quantitats no poden ser negatives. |
| Decimal a nivell de partícules | Aquí comptes partícules senceres: escriu un nombre enter. |
| Batxillerat: massa sense unitats coherents | Escriu la massa en grams. Pots fer servir la coma decimal. |
| Massa molar errònia | Revisa la massa molar de {fórmula}: suma les masses dels seus àtoms. |
| Recipient ple | El recipient és ple: com a màxim hi caben {n} partícules de cada reactiu. |

### 10.5 Solució mostrada

Solució: es fan {lots} lots. Limitant: {lim}. Productes: {productes}. Sobrants: {sobrants}.

En mostrar la solució, l'app executa l'animació dels lots perquè l'alumne vegi el raonament i no només el resultat.

---

## 11. Fitxes «A la vida real»

Textos breus (2–3 frases) que surten al panell d'ajuda després d'encertar i al mòdul 7. Són fets establerts; quan el model és simplificat, s'indica.

### Analogies

| Codi | Text |
|---|---|
| F1–F9 | Una fàbrica funciona com una reacció: si falta una peça, la producció s'atura encara que sobrin les altres. Aquesta peça és el «reactiu limitant» de la cadena de muntatge. |

### Mitjà

| Codi | Text |
|---|---|
| M1 | L'hidrogen i l'oxigen reaccionen per formar aigua i alliberen molta energia. Els motors principals del transbordador espacial funcionaven amb hidrogen i oxigen líquids, i les piles de combustible ho aprofiten per fer electricitat. |
| M2 | És el procés de Haber-Bosch, que fabrica amoníac a partir del nitrogen de l'aire. L'amoníac és la base dels adobs nitrogenats que fan créixer bona part dels aliments del món. |
| M3 | Així es fabrica el clorur d'hidrogen. Dissolt en aigua és l'àcid clorhídric; el salfumant n'és una dissolució que es fa servir per netejar. |
| M4 | Quan el carbó d'una barbacoa crema amb prou aire, el carboni es converteix en diòxid de carboni. |
| M5 | Si el carbó crema amb poc oxigen, es forma monòxid de carboni, un gas tòxic sense olor ni color. Per això no s'ha d'encendre mai un braser o una barbacoa en un lloc tancat. |
| M6 | El gas natural de la cuina i de moltes calefaccions és sobretot metà. Amb prou oxigen, crema amb una flama blava i forma diòxid de carboni i aigua. |
| M7 | El sofre crema amb una flama blava i forma diòxid de sofre, un gas d'olor picant. El carbó i el petroli contenen sofre, i en cremar-los s'allibera aquest gas. |
| M8 | El diòxid de sofre de l'aire es transforma en triòxid de sofre, que amb l'aigua de la pluja forma àcid sulfúric: és una de les causes de la pluja àcida. |
| M9 | A la temperatura tan alta de l'interior d'un motor, el nitrogen i l'oxigen de l'aire reaccionen i formen monòxid de nitrogen. |
| M10 | El monòxid de nitrogen dels tubs d'escapament es transforma a l'aire en diòxid de nitrogen, un gas marronós que contamina l'aire de les ciutats. |
| M11 | El catalitzador del tub d'escapament dels cotxes transforma el monòxid de carboni, tòxic, en diòxid de carboni. |
| M12 | Un àcid i una base es neutralitzen i formen una sal i aigua. Si en sobra un, la dissolució final és àcida o bàsica. |

### Avançat

| Codi | Text |
|---|---|
| A1 | El propà de les bombones de càmping i de moltes barbacoes de gas crema així. Necessita molt d'oxigen: 5 molècules per cada molècula de propà. |
| A2 | L'etanol és l'alcohol de cremar dels fogonets. També es fa servir com a biocombustible barrejat amb la benzina. |
| A3 | És la combustió incompleta del gas: si una caldera o un escalfador no té prou ventilació, es forma monòxid de carboni. Per això cal revisar-los i ventilar bé. |
| A4 | És el primer pas del procés d'Ostwald, que fabrica àcid nítric a partir d'amoníac. L'àcid nítric s'usa per fer adobs i explosius. |
| A5 | El sulfur d'hidrogen fa olor d'ous podrits i surt dels volcans i de les aigües sulfuroses. En cremar, forma diòxid de sofre. |
| A6 | És l'equació global de la fotosíntesi: les plantes fan servir l'energia de la llum per fabricar glucosa i alliberen oxigen. |
| A7 | És l'equació global de la respiració cel·lular: les cèl·lules obtenen energia de la glucosa i fan servir l'oxigen que respirem. |
| A8 | El ferro es rovella en contacte amb l'oxigen. En realitat, el rovell també necessita aigua i té una composició més complexa; aquesta equació n'és un model simplificat. |
| A9 | El magnesi crema amb una llum blanca molt intensa. Es fa servir en bengales i focs artificials, i s'usava als antics flaixos de fotografia. |
| A10 | El sodi i el clor reaccionen de manera molt violenta i formen clorur de sodi, la sal de cuina. |
| A11 | A l'alt forn, el monòxid de carboni transforma el mineral de ferro (òxid de ferro) en ferro metàl·lic. Així s'obté el ferro per fer acer. |
| A12 | És la reacció de la termita: l'alumini treu l'oxigen a l'òxid de ferro i es forma ferro fos. S'utilitza per soldar les vies del tren. |
| A13 | El salfumant fa bombolles en contacte amb el marbre o la pedra calcària perquè es desprèn diòxid de carboni. Per això no s'ha de fer servir per netejar el marbre. |
| A14 | El bicarbonat de sodi neutralitza l'excés d'àcid de l'estómac, que és àcid clorhídric. El diòxid de carboni que es forma surt en forma de rots. |
| A15 | L'hidròxid de magnesi és el component de la «llet de magnèsia» i d'alguns antiàcids. Neutralitza l'àcid de l'estómac. |
| A16 | L'àcid sulfúric i l'hidròxid de sodi es neutralitzen. Per neutralitzar un vessament d'àcid al laboratori, es posa base de mica en mica i es comprova el pH. |
| A17 | L'aigua oxigenada es descompon en aigua i oxigen. En una ferida fa bombolles perquè un enzim de la sang, la catalasa, accelera aquesta reacció. |
| A18 | En escalfar la pedra calcària en un forn de calç, es descompon en calç viva i diòxid de carboni. És un pas de la fabricació del ciment. |

### Batxillerat

Les fitxes de B1–B10 fan servir el text de la reacció corresponent (M o A) i hi afegeixen una frase sobre el càlcul, per exemple a B2: «Encara que hi hagi més grams d'oxigen, hi ha menys mols: per això l'oxigen és el limitant».

---

## 12. Glossari visual

Cada terme té una icona o un dibuix petit i una definició de nivell A2–B1.

| Terme | Definició |
|---|---|
| Àtom | La partícula més petita d'un element. A l'app és una boleta de color. |
| Molècula | Un grup d'àtoms units. Per exemple, l'aigua (H₂O) té 2 àtoms d'hidrogen i 1 d'oxigen. |
| Unitat de fórmula | El grup d'ions més petit que representa un compost iònic, com NaCl. No és una molècula. |
| Reactiu | Substància que hi ha al principi i que es transforma. |
| Producte | Substància nova que es forma en la reacció. |
| Equació química | La manera d'escriure una reacció amb fórmules: reactius → productes. |
| Coeficient | El nombre gran davant d'una fórmula. Diu en quina proporció reacciona. |
| Subíndex | El nombre petit dins d'una fórmula. Diu quants àtoms d'un element té. |
| Recepta | A l'app, l'equació igualada: diu quant de cada substància cal per fer un lot. |
| Lot | Un grup de reactius exactament igual a la recepta. |
| Reactiu limitant | El reactiu que s'acaba primer. Decideix quant producte es forma. |
| Reactiu en excés | El reactiu que sobra quan la reacció s'atura. |
| Sobrant | La part del reactiu que no ha reaccionat. |
| Proporció exacta | Quan tots els reactius s'acaben alhora i no sobra res. |
| Conservació de la massa | La massa total no canvia en una reacció: els àtoms només es reorganitzen. |
| Mol | Un paquet de 6,022 · 10²³ partícules. Es fa servir per comptar partícules al laboratori. |
| Massa molar | La massa d'un mol d'una substància, en g/mol. |
| Rendiment | El percentatge del producte que s'obté realment respecte del que s'hauria d'obtenir. |
| Puresa | El percentatge d'una mostra que és realment la substància que ens interessa. |

---

## 13. Dades, validació i verificació

### 13.1 Format de les dades

Les reaccions es desen en un fitxer `js/reaccions.js` (sense dependències externes):

```js
{
  id: "M6",
  level: 2,
  families: ["combustio"],
  reactants: [{ formula: "CH4", coef: 1 }, { formula: "O2", coef: 2 }],
  products: [{ formula: "CO2", coef: 1 }, { formula: "H2O", coef: 2 }],
  context: "Gas natural de la cuina",
  ionic: false,
  cases: [{ before: [3, 4], tags: ["E1"] }],
  reallife: "El gas natural de la cuina…"
}
```

Les analogies tenen els mateixos camps, amb `pieces` (nom, icona i color) en lloc de fórmules.

### 13.2 Script de validació (`scripts/valida-reaccions.mjs`)

Comprova automàticament:

1. Cada equació està igualada (mateixos àtoms a cada costat).
2. Els coeficients són enters positius i sense divisor comú.
3. Cada cas clau dona el resultat indicat (lots, productes, sobrants).
4. Els casos marcats E1 tenen el limitant amb més partícules que l'altre reactiu.
5. A Mitjà, el limitant de cada cas és múltiple del seu coeficient.
6. A Batxillerat, la massa inicial és igual a la final (tolerància 0,01 g) i els mols tenen com a màxim dos decimals.
7. Cada reacció té fitxa «A la vida real», context i nivell.
8. Cap cas supera el límit de 40 partícules dibuixades.

### 13.3 Verificació visual

Abans de donar l'app per acabada, cal comprovar-la a 1920 × 1080, 1366 × 768 i 1366 × 740, amb escalat del sistema al 125 % i al 150 %, i en tauleta i mòbil. Ha de seguir el comportament d'adaptació a la pantalla d'`edu-apps/Equacions`.

### 13.4 Següent pas

Un cop validat aquest document:

1. Disseny de la pantalla única (Explora, Practica i Repte) a 1366 × 740, reutilitzant l'estètica de `FormulacioInorganica` i `IgualacioQuimica`.
2. Dibuix de partícules i animació dels lots.
3. Programació de les activitats en l'ordre `prediu` → `limitant` → `exacta` → `abans` → `taula` → `calcula`.
4. README amb captures i enllaç des del menú general d'`edu-apps`.

# Auditoria i pla de millora de l'app d'igualació d'equacions

Data de l'auditoria: 26 d'octubre de 2026
Estat: aplicat el 26 d'octubre de 2026 (fases 1 a 5). Vegeu l'apartat 9 per a les decisions finals.
Referència externa: [PhET – Balancing Chemical Equations](https://phet.colorado.edu/es/simulations/balancing-chemical-equations)

Objectiu general: fer l'app **més senzilla, més visual, pràctica i útil** per a l'alumnat d'ESO, sense perdre'n l'essència ni l'estètica actual, i que s'adapti bé a pantalles de 1366×740 i 1920×1080.

---

## 1. Resum

L'app té una bona base visual, però hi ha quatre problemes greus:

1. **Les equacions iòniques no funcionen.** L'analitzador llegeix `Fe2+` com dos àtoms de ferro. A eq070, eq102 i eq103 ni tan sols la solució oficial apareix com a «Equilibrada».
2. **17 de les 80 equacions ja vénen igualades** amb tots els coeficients a 1 (13 de 31 al nivell 1 i 4 de 36 al nivell 2). L'app hi mostra «Equilibrada 😊» sense que l'alumne faci res.
3. **No cap en una pantalla.** A 1366×740 la pàgina fa 1.745 px d'alçada i el botó «Comprova» és a 935 px. Ni a 1920×1080 es veuen els botons sense desplaçar-se.
4. **El marcador es pot inflar.** Cada clic a «Comprova» suma un encert, també després de «Mostra solució».

Verificació feta:

- Les 80 solucions de referència són correctes: els àtoms i les càrregues quadren i els coeficients són mínims.
- He fet servir el mateix analitzador de fórmules que l'app (`parseFormula` de `js/app.js`).
- He fet captures a 1366×740 i 1920×1080.

---

## 2. Errors de funcionament

| # | Error | Conseqüència | Fitxer |
|---|---|---|---|
| 1 | `parseFormula` interpreta `Fe2+`, `Mn2+`, `Cr3+`, `Sn2+`, `Sn4+`, `Fe3+` com a Fe₂, Mn₂… | eq070, eq102 i eq103 són impossibles d'equilibrar | `js/app.js` (`parseSingleFormulaPart`) |
| 2 | No es comprova la càrrega elèctrica dels ions | eq105: `Cl2 → 2 Cl-` (amb la resta a 0) es dona per bo | `js/app.js` (`isBalanced`) |
| 3 | Es permet el coeficient 0 (`min="0"` i `Math.max(0, …)`) | L'alumne pot «eliminar» substàncies | `js/app.js` (`buildEquationSide`, `updateCoefficient`) |
| 4 | S'accepten múltiples no simplificats (p. ex. 4, 2, 4) sense cap avís | No s'aprèn la idea de coeficients mínims | `js/app.js` (`handleCheck`) |
| 5 | «Comprova» suma intents i encerts cada vegada que es prem | El marcador no és fiable | `js/app.js` (`handleCheck`) |
| 6 | «Mostra solució» + «Comprova» compta com a encert i manté la ratxa | El marcador no és fiable | `js/app.js` (`showSolution`) |
| 7 | L'estat «Equilibrada» s'actualitza en temps real | Delata la resposta abans de comprovar | `js/app.js` (`updateAtomTable`) |
| 8 | El NaCl es dibuixa amb 2 Na i 2 Cl | La imatge no coincideix amb la taula d'àtoms | `js/app.js` (`createLattice`) |
| 9 | Els ions es dibuixen com a molècules (Fe²⁺ surt com dos àtoms de Fe) | Error conceptual | `js/app.js` (`buildGenericMolecule`) |
| 10 | Les molècules sense model propi es dibuixen en anell (glucosa, heptà…) | Imatge irreal i confusa | `js/app.js` (`buildGenericMolecule`) |
| 11 | La notació de càrrega és barrejada (`Fe2+` i `Cr2O7^2-`) | Ambigüitat entre subíndex i càrrega | `data/eq_advanced.json` |
| 12 | El rètol diu «Ràting» | Ha de dir «Ratxa» | `index.html` |
| 13 | Text malmès per la codificació (`ConfiguraciÃ³`, `mÃ©s`, `catÃ leg`…) | 14 línies afectades | `index.html`, `js/app.js`, `css/styles.css` |
| 14 | `maybeFixMojibake` és un pedaç per a un problema de codificació | Codi innecessari si els fitxers són UTF-8 | `js/app.js` |

### Solucions proposades

- **Notació única de càrrega:** sempre amb `^` (`Fe^2+`, `MnO4^-`, `Cr2O7^2-`, `H^+`, `OH^-`). L'analitzador separa la càrrega abans de comptar els àtoms.
- **Comprovació de càrrega:** quan hi ha ions, la suma de càrregues ha de ser igual als dos costats.
- **Coeficient mínim 1.** El botó «−» queda desactivat a 1.
- **Avís de simplificació:** si el MCD dels coeficients és més gran que 1, mostrar «Equilibrada, però es pot simplificar (divideix per N)» i no comptar-ho com a encert.
- **Marcador:**
  - Comptar un sol encert per equació.
  - Si s'ha mostrat la solució, no sumar encert i reiniciar la ratxa.
  - Bloquejar «Comprova» un cop encertada, fins a la següent equació.
- **Dibuix:**
  - El NaCl es dibuixa com 1 Na + 1 Cl.
  - Els ions es dibuixen com un sol àtom amb la càrrega indicada.
  - Les molècules orgàniques es dibuixen en cadena.

---

## 3. Fórmules químiques

### 3.1 Equacions que ja vénen igualades i substituts proposats

He verificat tots els substituts: quadren, tenen coeficients mínims i **no** surten igualats amb tots els coeficients a 1.

| ID | Actual (ja igualada) | Substitut | Solució | Tipus | Context |
|---|---|---|---|---|---|
| eq005 | CaCO₃ → CaO + CO₂ | H₂O → H₂ + O₂ | 2, 2, 1 | Descomposició | Electròlisi de l'aigua |
| eq013 | Ca + Cl₂ → CaCl₂ | Al + Cl₂ → AlCl₃ | 2, 3, 2 | Síntesi | — |
| eq018 | CaO + H₂O → Ca(OH)₂ | Na₂O + H₂O → NaOH | 1, 1, 2 | Síntesi | Òxid bàsic + aigua |
| eq019 | HCl + NaOH → NaCl + H₂O | HCl + Mg(OH)₂ → MgCl₂ + H₂O | 2, 1, 1, 2 | Neutralització | Antiàcid estomacal |
| eq021 | NH₃ + HCl → NH₄Cl | NH₃ + H₂SO₄ → (NH₄)₂SO₄ | 2, 1, 1 | Neutralització | Fertilitzants |
| eq037 | Ca(OH)₂ → CaO + H₂O | Al(OH)₃ → Al₂O₃ + H₂O | 2, 1, 3 | Descomposició | — |
| eq038 | CuCO₃ → CuO + CO₂ | NaN₃ → Na + N₂ | 2, 2, 3 | Descomposició | Coixí de seguretat (airbag) |
| eq041 | HNO₃ + KOH → KNO₃ + H₂O | H₂SO₄ + KOH → K₂SO₄ + H₂O | 1, 2, 1, 2 | Neutralització | — |
| eq042 | CH₃COOH + NaOH → CH₃COONa + H₂O | CH₃COOH + CaCO₃ → Ca(CH₃COO)₂ + CO₂ + H₂O | 2, 1, 1, 1, 1 | Doble substitució | Vinagre per treure la calç |
| eq044 | S + O₂ → SO₂ | H₂S + O₂ → SO₂ + H₂O | 2, 3, 2, 2 | Combustió | — |
| eq045 | C + O₂ → CO₂ | C + O₂ → CO | 2, 1, 2 | Combustió | Combustió incompleta (monòxid de carboni) |
| eq046 | CaO + CO₂ → CaCO₃ | N₂ + O₂ → NO₂ | 1, 2, 2 | Síntesi | Contaminació dels motors |
| eq048 | AgNO₃ + KBr → AgBr + KNO₃ | AgNO₃ + CaCl₂ → AgCl + Ca(NO₃)₂ | 2, 1, 2, 1 | Doble substitució | Precipitació |
| eq009 | AgNO₃ + NaCl → AgCl + NaNO₃ | AlCl₃ + AgNO₃ → AgCl + Al(NO₃)₃ | 1, 3, 3, 1 | Doble substitució | Precipitació |
| eq028 | Fe + CuSO₄ → FeSO₄ + Cu | Fe + O₂ + H₂O → Fe(OH)₃ | 4, 3, 6, 4 | Síntesi | Rovell |
| eq031 | SO₃ + H₂O → H₂SO₄ | NO₂ + H₂O → HNO₃ + NO | 3, 1, 2, 1 | Síntesi | Pluja àcida |
| eq058 | Zn + CuSO₄ → ZnSO₄ + Cu | Al + CuCl₂ → AlCl₃ + Cu | 2, 3, 2, 3 | Substitució simple | — |

La taula recull les 17 equacions que ja vénen igualades: 13 de nivell 1 i 4 de nivell 2.

A més, la redox eq070 (Fe³⁺ + Sn²⁺ → Fe²⁺ + Sn⁴⁺) queda igualada en àtoms amb tots els coeficients a 1, però no en càrrega. Per això la comprovació de càrrega és imprescindible si es manté.

**Opció didàctica:** es poden mantenir una o dues equacions igualades com a «trampa», amb el missatge «Aquesta ja estava igualada! 👀». Té valor didàctic, però ha de ser una excepció.

> Nota: NaHCO₃ + HCl → NaCl + CO₂ + H₂O **també ja està igualada**. No s'ha de fer servir com a substitut.

### 3.2 Errors als textos de les explicacions

| ID | Text actual | Correcció |
|---|---|---|
| eq027 | «Precipitació de **I2** de plom(II)…» | «Precipitació de **iodur** de plom(II)…» |
| eq067 | «Oxidació del fòsfor blanc a **diòxid** de difòsfor» | «… a **pentaòxid** de difòsfor» |
| eq112 | «L'àcid **nitríc concentra** oxida H2S a sofre» | «L'àcid **nítric concentrat** oxida l'H₂S a sofre» |
| eq109 | «**l'iod** reacciona amb tiosulfat» | «**el iode** reacciona amb el tiosulfat» |
| eq033 | «Reacció àcid-òxid **bàsic** entre Al2O3 i HCl» | «… òxid **amfòter** …» |
| eq039 | «clorur **ferrós**» | «clorur de **ferro(II)**», coherent amb la resta |
| eq001 | Diu quantes molècules calen | Reescriure-la sense donar la solució |
| eq002 | «calen quatre àtoms de ferro i tres de dioxigen» | Reescriure-la sense donar la solució |
| eq004 | «Dos àtoms de sodi reaccionen amb una molècula de clor» | Reescriure-la sense donar la solució |
| eq025 | «amb coeficients enters mínims» | Context químic real (p. ex. «L'età és un component del gas natural») |
| eq035 | «amb coeficients equilibrats» | «Respiració cel·lular: la glucosa reacciona amb l'oxigen» |
| eq069 | «amb coeficients grans» | Context real (p. ex. «L'heptà és un component de la gasolina») |
| eq107 | «amb coeficients elevats» | «El butà és el gas de les bombones domèstiques» |
| eq108 | «amb requeriment alt d'oxigen» | Context real |

Criteri general: **mostrar les explicacions només després d'encertar** o en una icona ⓘ, perquè no orientin la resposta.

### 3.3 Matisos químics menors

- **eq066** (S + O₂ → SO₃): el sofre crema i forma SO₂; el SO₃ s'obté amb catalitzador. Es pot canviar per 2 SO₂ + O₂ → 2 SO₃.
- **eq064** (Na + O₂ → Na₂O): en la combustió del sodi es forma sobretot peròxid. És acceptable a l'ESO.
- **eq062** (H₂CO₃ + NaOH): l'àcid carbònic és inestable. També és acceptable.
- **eq001** (H₂ + O₂ → H₂O): està classificada com a combustió. És correcte, però també és una síntesi.

### 3.4 Tipus de reacció

Ara les categories se solapen:

- «Oxidació» (metalls + O₂).
- «Oxidació-reducció».
- «Combustió».
- A més, eq028, eq029 i eq060 també són redox.

Proposta per a l'ESO, amb sis tipus:

1. Síntesi
2. Descomposició
3. Combustió
4. Substitució simple
5. Doble substitució
6. Neutralització

Les reaccions de metall + oxigen passen a «Síntesi». La categoria «Oxidació-reducció» queda només per al nivell de batxillerat.

### 3.5 Nivells

El nivell 3 actual barreja combustions amb redox iòniques en medi àcid o bàsic, que són contingut de **batxillerat**, no d'ESO.

Distribució actual:

| Nivell | Equacions |
|---|---|
| 1 | 31 |
| 2 | 36 |
| 3 | 13 |

Proposta:

| Nivell | Contingut |
|---|---|
| 1 – Fàcil | 2–3 substàncies, coeficients petits |
| 2 – Mitjà | 4 substàncies, grups entre parèntesis |
| 3 – Avançat ESO | Coeficients grans, 4–6 substàncies, sense ions |
| Batxillerat (opcional) | Redox iòniques actuals, amb comprovació de càrrega |

Equacions noves per al **nivell 3 d'ESO** (totes verificades):

| Equació | Solució | Context |
|---|---|---|
| C₈H₁₈ + O₂ → CO₂ + H₂O | 2, 25, 16, 18 | Gasolina |
| Fe₂O₃ + CO → Fe + CO₂ | 1, 3, 2, 3 | Alt forn |
| NH₃ + O₂ → NO + H₂O | 4, 5, 4, 6 | Fabricació d'àcid nítric |
| FeS₂ + O₂ → Fe₂O₃ + SO₂ | 4, 11, 2, 8 | Torrefacció de la pirita |
| Cu + HNO₃ → Cu(NO₃)₂ + NO + H₂O | 3, 8, 3, 2, 4 | Atac del coure amb àcid |
| C₁₂H₂₂O₁₁ + O₂ → CO₂ + H₂O | 1, 12, 12, 11 | Combustió del sucre |
| CO₂ + H₂O → C₆H₁₂O₆ + O₂ | 6, 6, 1, 6 | Fotosíntesi |
| Fe₂O₃ + Al → Al₂O₃ + Fe | 1, 2, 1, 2 | Aluminotèrmia (soldadura de vies) |
| Mg + N₂ → Mg₃N₂ | 3, 1, 1 | Síntesi |
| Ca₃(PO₄)₂ + H₂SO₄ → CaSO₄ + H₃PO₄ | 1, 3, 3, 2 | Fertilitzants |
| KMnO₄ + HCl → KCl + MnCl₂ + Cl₂ + H₂O | 2, 16, 2, 2, 5, 8 | Repte final |

Criteri general: prioritzar equacions amb **context quotidià** (fotosíntesi, respiració, airbag, rovell, antiàcids, pluja àcida, gasolina, butà).

---

## 4. Adaptació a la pantalla

### Estat actual (verificat)

| Pantalla | Alçada del document | Què es veu sense desplaçar-se |
|---|---|---|
| 1366×740 | 1.745 px | Títol, equació i coeficients; molècules tallades; botons a 935 px |
| 1920×1080 | — | Equació, coeficients i molècules; botons, marcador i taula a sota |

### Problemes i propostes

| Problema | Proposta |
|---|---|
| La capçalera ocupa uns 135 px | Barra superior compacta d'uns 56 px, amb el títol i el botó «Nova equació» |
| La fórmula surt 3 vegades (MathJax, targetes de coeficients i rètols de les molècules) | Una sola fila: cada fórmula amb el seu coeficient [−][n][+] a sota, com al PhET |
| El panell lateral ocupa 280 px només per a filtres i consells | Filtres com a xips a la barra superior; consells en una icona ⓘ |
| Molècules petites dins de caixes grans | Caixes més baixes i molècules més grans, escalades segons l'espai |
| Botons i marcador sota la línia de flotació | Barra d'accions fixa just sota l'escena |
| La taula d'àtoms queda a baix de tot | Gràfic de barres o balança al costat de l'escena |
| No hi ha escalat global | Aplicar el patró de `edu-apps/Equacions` (`fitScale`) |

### Patró d'escalat (referència: `Equacions/js/app.js`)

- `BASE_W = 1440`, `BASE_H = 800`, `MIN_ZOOM = 0.75`, `MIN_DESKTOP_W = 1200`.
- `zoom = max(MIN_ZOOM, min(1, w / BASE_W, h / BASE_H))`, arrodonit a passos de 0,05.
- Es desa a la variable CSS `--ui-zoom`.
- Classes `h-700`, `h-680` i `h-640` segons l'alçada efectiva, per compactar més.
- Es recalcula amb l'esdeveniment `resize` (canvi de finestra o de monitor).
- Per sota de 1200 px d'amplada no s'escala: disposició responsiva en una columna, amb desplaçament vertical.
- Es respecta el zoom d'accessibilitat del navegador.

### Objectiu i verificació

- Tota l'activitat en **una sola pantalla**, sense desplaçament: equació, molècules, barres o balança i botons.
- Sense desplaçament horitzontal, ni retalls, ni solapaments.
- Comprovacions:
  - 1920×1080
  - 1366×768 i 1366×740
  - Escalat del sistema al 125 % i al 150 %
  - Tauleta i mòbil

---

## 5. Millores de disseny i usabilitat (idees del PhET)

### Com funciona el simulador del PhET

- **Introducció:** poques equacions, amb eines opcionals (cap, gràfic de barres o balança).
- **Joc:** 3 nivells, 5 equacions per partida, 2 intents per equació, puntuació amb estrelles i cronòmetre opcional.
- Avís quan l'equació està equilibrada però no simplificada.

### Propostes

1. **Dos modes en pestanyes: «Practica» i «Repte».**
   - Practica: lliure, amb ajudes.
   - Repte: 5 equacions, 2 intents per equació, estrelles al final i cronòmetre opcional.
2. **Selector d'ajuda visual amb tres botons-icona: Cap | Barres | Balança.**
   - Barres: per a cada element, una barra a l'esquerra i una a la dreta, del color de l'element. Substitueix la taula d'àtoms.
   - Balança: un plat per element que s'inclina cap al costat amb més àtoms.
3. **Llegenda de colors dels àtoms** (● H ● O ● C…). Ara no se sap quin color és cada element.
4. **Colors CPK estàndard:** H blanc amb vora, C gris fosc, O vermell, N blau, Cl verd, S groc, P taronja, metalls en tons grisos o propis. Ara el C és lila i l'H ambre.
5. **Fórmules en lletra recta.** MathJax les mostra en cursiva com si fossin variables (*AgNO₃*), cosa incorrecta segons la IUPAC. Proposta: treure MathJax i fer servir HTML amb `<sub>` i `<sup>`.
6. **Comprovació en dos temps:** no mostrar «Equilibrada» fins que es prem «Comprova». Les barres i la balança poden donar feedback en directe.
7. **Missatges clars i concrets:**
   - «Equilibrada, però es pot simplificar (divideix per 2).»
   - «Cap coeficient pot ser 0.»
   - «Recorda: no canviïs els subíndexs, només els coeficients.»
   - «Encara falten 2 àtoms d'O a la dreta.»
8. **Pistes progressives en tres passos:**
   1. Quin element no quadra.
   2. Quin compost convé canviar.
   3. Quin valor provar.

   Les fórmules de les pistes s'han d'escriure amb subíndexs (ara surt «H2O»).
9. **Simplificar la interfície:**
   - Treure l'interruptor «Activa les pistes guiades», perquè el botó de pista ja n'és l'interruptor.
   - Convertir «Consells ràpids» en una icona ⓘ.
   - Deixar «Reinicia coeficients» com a icona ↺.
   - Deixar «Mostra solució» com a botó secundari, amb confirmació en el mode Repte.
10. **Celebració** en encertar (confeti breu i estrelles), com a `Equacions`.
11. **Progrés per nivell** desat al navegador (p. ex. «Nivell 1: 12/31 ✔») i botó per reiniciar-lo.
12. **Equacions sense repetir** fins que s'han fet totes les del filtre.
13. **Mode projector** amb lletra més gran per a la pissarra digital.
14. **Opcional:** solució pas a pas pel mètode d'inspecció (element per element).
15. **Accessibilitat:**
    - Contrast suficient (el verd clar del «0» de la taula és poc llegible).
    - Navegació amb teclat.
    - `aria-live` als missatges de feedback.
    - Els elements no es distingeixen només pel color: el símbol també es mostra dins de cada àtom.

---

## 6. Codi i manteniment

- **`scripts/update_equations.py` és perillós:** només conté 19 equacions. Si s'executa, sobreescriu els JSON i **se'n perden 61**. Cal actualitzar-lo o eliminar-lo.
- **Una sola font de dades:** `data/equations_master.json` és un duplicat que l'app no carrega. Cal decidir si es fa servir un sol fitxer o un per nivell.
- **Codi mort o redundant:**
  - `balanceCaption`, `STATUS_COPY`, `formatFormulaHTML` i `formatFormulaTeX`.
  - Els `<select>` ocults (`#reactionType`, `#difficultyLevel`) i la lògica de compatibilitat associada.
  - Les funcions redefinides a posteriori (`populateTypeOptions = …`, `applyTypeFilter = …`, `renderEquation = …`) dins d'`enhanceUI`, que s'han d'integrar a les funcions originals.
  - Les línies buides a `updateEquationDisplay`.
  - `maybeFixMojibake` (desar tots els fitxers en UTF-8 sense BOM).
- **Fitxers a eliminar de la carpeta pública:**
  - `tmp_patch.txt`.
  - `Instruccions.txt`, que és text de ChatGPT i acaba amb «Si vols, puc preparar-te…». Si s'hi vol conservar alguna idea, es pot passar a aquest document.
- **Dependència de CDN:**
  - Tailwind CDN mostra l'avís «should not be used in production» i gairebé no s'utilitza: només unes quantes classes a la taula.
  - MathJax pesa uns 2 MB i fa que l'app no funcioni sense connexió.
  - Treure'ls tots dos simplifica l'app i la fa més ràpida.
- **Peu de pàgina:** unificar-lo amb la skill `felip-app-footer`.
- **README:**
  - Treure el camí antic `I:\Mi unitat\Github`.
  - Decidir el públic (ESO, o ESO i batxillerat).
  - Actualitzar la captura i l'estructura de fitxers.
- **Validació automàtica de dades:** un petit script que comprovi, per a cada equació:
  - que la solució quadra en àtoms i càrrega;
  - que els coeficients són mínims;
  - que no està igualada amb tots els coeficients a 1;
  - que no hi ha identificadors ni equacions duplicats.

---

## 7. Planificació

### Fase 1. Correccions crítiques (prioritat alta)

- [x] Unificar la notació de càrrega (`^`) a les dades.
- [x] Corregir l'analitzador d'ions i afegir la comprovació de càrrega, o bé moure les redox iòniques a un nivell de batxillerat.
- [x] Substituir les 17 equacions ja igualades (taula 3.1).
- [x] Prohibir el coeficient 0 (mínim 1).
- [x] Avisar dels múltiples no simplificats.
- [x] Corregir el marcador: un encert per equació, sense encert després de mostrar la solució, i «Ratxa» en lloc de «Ràting».
- [x] Corregir els textos de la secció 3.2.
- [x] Corregir els caràcters malmesos (UTF-8).

### Fase 2. Pantalla i disposició (prioritat alta)

- [x] Barra superior compacta amb títol, filtres en xips i «Nova equació».
- [x] Fila única de fórmules amb els coeficients a sota; eliminar la duplicació de la fórmula.
- [x] Escena de molècules més compacta, amb molècules més grans.
- [x] Barra d'accions fixa sota l'escena.
- [x] Escalat global amb el patró `fitScale` d'`Equacions`.
- [x] Verificar a 1920×1080, 1366×768, 1366×740, 125 %, 150 %, tauleta i mòbil.

### Fase 3. Visualització (prioritat mitjana)

- [x] Selector d'ajuda visual: Cap | Barres | Balança.
- [x] Gràfic de barres per element (substitueix la taula d'àtoms).
- [x] Balança per element.
- [x] Colors CPK i llegenda d'elements, amb el símbol dins de cada àtom.
- [x] Fórmules en HTML amb lletra recta (sense MathJax).
- [x] Dibuix correcte de NaCl, ions i molècules orgàniques en cadena.
- [x] Explicacions visibles només després d'encertar.

### Fase 4. Ampliació i gamificació (prioritat mitjana-baixa)

- [x] Nova classificació en sis tipus de reacció.
- [x] Nivell 3 d'ESO amb les equacions de la secció 3.5.
- [x] Nivell opcional de batxillerat (redox iòniques).
- [x] Mode Repte: 5 equacions, 2 intents, estrelles i cronòmetre opcional.
- [x] Pistes progressives en tres passos.
- [x] Progrés per nivell, equacions sense repetir i celebració.
- [x] Mode projector.

### Fase 5. Neteja tècnica i documentació (prioritat baixa)

- [x] Una sola font de dades i eliminar `equations_master.json` o el script desfasat.
- [x] Script de validació automàtica de les equacions.
- [x] Eliminar el codi mort i integrar els pedaços d'`enhanceUI`.
- [x] Treure Tailwind CDN i MathJax.
- [x] Eliminar `tmp_patch.txt` i `Instruccions.txt`.
- [x] Peu de pàgina amb la skill `felip-app-footer`.
- [x] Actualitzar el README i la captura.

---

## 8. Altres simulacions del PhET per adaptar a l'ESO

| Simulació del PhET | Curs | Per què és útil |
|---|---|---|
| **Reactius, productes i sobrants** | 3r–4t | És la continuació natural d'aquesta app: reactiu limitant i excés, amb molècules |
| **Construeix un àtom** | 2n–3r | Protons, neutrons i electrons, ions, nombre atòmic i màssic |
| **Isòtops i massa atòmica** | 3r | Isòtops i massa atòmica mitjana |
| **Construeix una molècula** | 3r | Fórmules i models moleculars; lliga amb aquesta app |
| **Estats de la matèria** | 2n | Model cineticomolecular i canvis d'estat |
| **Densitat** | 1r–2n | Massa, volum i flotació |
| **Escala de pH** | 3r–4t | Àcids i bases de la vida quotidiana |
| **Concentració** i **Molaritat** | 3r–4t | Dissolucions i concentració |
| **Propietats dels gasos** | 4t | Pressió, volum, temperatura i lleis dels gasos |

**Recomanació:** fer «Reactius, productes i sobrants» com a segona app, perquè pot reutilitzar el motor de fórmules, el dibuix de molècules i el sistema d'escalat d'aquesta.

La planificació detallada de les apps germanes és a `Pla_apps_germanes_quimica.md`.

---

## 9. Aplicació del pla (26 d'octubre de 2026)

Totes les fases s'han aplicat i verificat amb proves automàtiques al navegador (Playwright) i amb `node scripts/valida-equacions.mjs`.

### Decisions que s'aparten de la proposta

- **Set tipus de reacció en lloc de sis.** Es manté «Oxidació-reducció» per a les redox moleculars del nivell Avançat (alt forn, procés d'Ostwald, pirita, fotosíntesi, KMnO₄ + HCl) i per a les del nivell Batxillerat. «Desplaçament» passa a dir-se «Substitució». La categoria «Oxidació» desapareix: aquestes reaccions passen a «Síntesi».
- **eq031**: en lloc de NO₂ + H₂O → HNO₃ + NO, que no és una síntesi, s'ha fet servir SO₂ + O₂ + H₂O → H₂SO₄ (2, 1, 2, 2), també de pluja àcida.
- **Nivells reorganitzats**: Fàcil 32, Mitjà 37, Avançat 13 i Batxillerat 9, en total 91 equacions. Les combustions llargues i les redox moleculars passen a Avançat i les iòniques, a Batxillerat.
- **No s'ha mantingut cap equació «trampa»** ja igualada.
- **Fitxers de dades nous** (`eq_nivell1.json`… `eq_batxillerat.json` i `config.json`). Substitueixen els antics, `equations_master.json` i `scripts/update_equations.py`.
- **Escalat**: a més de reduir-se, la interfície també s'amplia en pantalles grans (fins a ×1,6). El mode projector fa servir una base més petita perquè tot surti més gran.

### Pendent (opcional)

- Solució pas a pas pel mètode d'inspecció (proposta 14 de l'apartat 5).
- Apps germanes (apartat 8 i `Pla_apps_germanes_quimica.md`).

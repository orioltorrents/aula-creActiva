# Pla d'apps germanes de química per a l'ESO

Data: 26 d'octubre de 2026
Estat: proposta (no s'ha creat cap app)
Relació: família d'apps germanes de l'app d'igualació d'equacions (`IgualacioQuimica`). Vegeu també `Auditoria_i_pla_de_millora.md`.

## 1. Finalitat

Crear una petita col·lecció d'apps que ajudin l'alumnat d'ESO a **entendre i practicar** els conceptes bàsics de química, des de la partícula fins a la reacció química. Cada app ha de ser:

- **Senzilla:** un sol concepte central i poques decisions a la pantalla.
- **Molt visual:** partícules, models i gràfics que es mouen segons el que fa l'alumne.
- **Pràctica:** dos modes, «Explora» (manipular i observar) i «Repte» (exercicis amb feedback).
- **Útil a l'aula:** funciona en una sola pantalla a 1366×740 i 1920×1080, té mode projector i desa el progrés al navegador.

Referència curricular: àmbit de la matèria i el canvi químic de Física i química de l'ESO a Catalunya (Decret 175/2022, LOMLOE). Abans de concretar cada app, cal revisar els sabers exactes de cada curs.

---

## 2. Itinerari conceptual

Les apps segueixen una progressió lògica: cada una prepara la següent.

```text
1. Estats de la matèria (model de partícules)
        ↓
2. Substàncies pures i mescles
        ↓
3. Construeix un àtom ──→ 4. Taula periòdica interactiva
        ↓
5. Enllaç i molècules
        ↓
6. Formulació inorgànica
        ↓
7. Igualació d'equacions (app actual)
        ↓
8. Reactius, productes i sobrants
        ↓
9. El mol i la massa molar
        ↓
10. Dissolucions i concentració
        ↓
11. Àcids, bases i pH
        ↓
12. Velocitat de reacció
```

---

## 3. Fitxa de cada app

### 3.1 Estats de la matèria (1r–2n ESO)

- **Concepte:** model cineticomolecular; sòlid, líquid i gas; canvis d'estat i temperatura.
- **Visual:** un recipient amb partícules que vibren, llisquen o es mouen lliurement. Un termòmetre que s'escalfa o es refreda, i la gràfica de l'escalfament amb els trams horitzontals dels canvis d'estat.
- **Explora:** escalfar i refredar aigua, i comparar substàncies amb punts de fusió i d'ebullició diferents.
- **Repte:**
  - Identificar l'estat a partir del dibuix de partícules.
  - Interpretar una gràfica d'escalfament.
  - Posar nom al canvi d'estat (fusió, solidificació, vaporització, condensació, sublimació, sublimació inversa).
- **Errors conceptuals a treballar:** les partícules no «es fonen» ni «s'expandeixen»; entre partícules no hi ha aire.

### 3.2 Substàncies pures i mescles (1r–2n ESO)

- **Concepte:** element, compost, mescla homogènia i heterogènia; mètodes de separació.
- **Visual:** «capses» de partícules (àtoms sols, molècules iguals, molècules diferents barrejades) i un laboratori amb filtració, decantació, evaporació, destil·lació i separació magnètica.
- **Explora:** construir mescles arrossegant partícules.
- **Repte:**
  - Classificar dibuixos de partícules.
  - Triar el mètode de separació adequat per a una mescla real (aigua i sorra, aigua i sal, ferro i sofre…).

### 3.3 Construeix un àtom (2n–3r ESO)

- **Concepte:** protons, neutrons i electrons; nombre atòmic (Z), nombre màssic (A); ions i isòtops.
- **Visual:** nucli i capes electròniques. A mesura que s'afegeixen partícules, es mostren el símbol, la càrrega i la notació ᴬ_Z X.
- **Explora:** afegir i treure partícules i veure com canvien l'element, la càrrega i la massa.
- **Repte:**
  - «Construeix el ²³Na⁺».
  - Completar taules (Z, A, p⁺, n, e⁻).
  - Detectar si dos àtoms són isòtops.
- **Errors conceptuals a treballar:** canviar els neutrons no canvia l'element; canviar els electrons forma un ió, no un altre element.

### 3.4 Taula periòdica interactiva (3r ESO)

- **Concepte:** grups i períodes; metalls, no-metalls i gasos nobles; electrons de valència i càrrega habitual dels ions.
- **Visual:** taula acolorida per famílies, amb una fitxa de l'element (model atòmic, ús quotidià i imatge).
- **Explora:** filtrar per família, estat a temperatura ambient o ús quotidià.
- **Repte:**
  - Situar elements a la taula.
  - Deduir la càrrega de l'ió a partir del grup.
  - Joc de «Qui és qui?» amb pistes.
- **Reutilització:** el mòdul de colors i dades d'elements el poden fer servir totes les altres apps.

### 3.5 Enllaç i molècules (3r–4t ESO)

- **Concepte:** enllaç iònic, covalent i metàl·lic; regla de l'octet; fórmula a partir de les valències.
- **Visual:**
  - Iònic: transferència d'electrons i formació d'ions que s'atrauen.
  - Covalent: parells d'electrons compartits (diagrames de Lewis senzills).
- **Explora:** combinar dos elements i veure quin enllaç es forma i quina fórmula en resulta.
- **Repte:**
  - Construir H₂O, CO₂, NH₃, CH₄, NaCl, MgCl₂…
  - Predir el tipus d'enllaç i les propietats (punt de fusió, conductivitat).

### 3.6 Formulació inorgànica (3r–4t ESO)

- **Concepte:** fórmules i noms d'òxids, hidrurs, sals binàries, hidròxids i, a 4t, oxoàcids i oxisals senzilles (nomenclatura IUPAC, amb prefixos i amb nombre d'oxidació).
- **Visual:** «peces de trencaclosques» amb càrregues que encaixen fins que la càrrega total és zero.
- **Explora:** combinar ions i veure la fórmula i el nom resultants.
- **Repte:**
  - Nom → fórmula i fórmula → nom.
  - Nivells per tipus de compost.
  - Banc de compostos de la vida quotidiana (sal comuna, calç, bicarbonat, àcid de les bateries…).
- **Relació:** és la base que necessita l'app d'igualació; els compostos poden compartir la mateixa base de dades.

### 3.7 Igualació d'equacions (3r–4t ESO) — app actual

- **Concepte:** llei de conservació de la massa (Lavoisier); coeficients i subíndexs.
- **Pla de millora:** vegeu `Auditoria_i_pla_de_millora.md`.

### 3.8 Reactius, productes i sobrants (3r–4t ESO)

- **Concepte:** proporcions de combinació, reactiu limitant i reactiu en excés.
- **Visual:**
  - Primer, una analogia quotidiana: «sandvitxos» (2 llesques de pa + 1 de formatge).
  - Després, molècules reals: 2 H₂ + O₂ → 2 H₂O, amb els sobrants que queden.
- **Explora:** triar quantes molècules de cada reactiu hi ha i veure què es forma i què sobra.
- **Repte:**
  - Predir els productes i els sobrants abans de «fer reaccionar».
  - Trobar el reactiu limitant.
- **Reutilització:** el motor de fórmules, el dibuix de molècules i l'escalat de l'app d'igualació.

### 3.9 El mol i la massa molar (4t ESO)

- **Concepte:** quantitat de substància, massa molar, nombre d'Avogadro, i càlculs estequiomètrics senzills.
- **Visual:** una balança on «1 mol» de substàncies diferents té masses diferents però el mateix nombre de partícules. Una «escala de zoom» de grams a partícules.
- **Explora:** posar una massa d'una substància i veure els mols i les partícules.
- **Repte:**
  - Calcular la massa molar a partir de la fórmula.
  - Convertir entre grams, mols i partícules.
  - Fer càlculs estequiomètrics a partir d'una equació igualada (enllaç directe amb l'app 3.7).

### 3.10 Dissolucions i concentració (3r–4t ESO)

- **Concepte:** solut i dissolvent; concentració en g/L i en percentatge en massa; dilució; saturació i solubilitat.
- **Visual:** un vas amb partícules de solut, un color que s'intensifica amb la concentració i un mesurador.
- **Explora:** afegir solut, afegir aigua o evaporar, i veure la concentració.
- **Repte:**
  - Preparar una dissolució d'una concentració donada.
  - Interpretar etiquetes reals (sèrum fisiològic, begudes, productes de neteja).

### 3.11 Àcids, bases i pH (3r–4t ESO)

- **Concepte:** àcid, base, neutralització; escala de pH; indicadors.
- **Visual:** escala de pH amb substàncies quotidianes (llimona, vinagre, aigua, sabó, lleixiu), un indicador que canvia de color (col llombarda) i una neutralització amb gotes.
- **Explora:** barrejar substàncies i veure el pH resultant de forma qualitativa.
- **Repte:**
  - Ordenar substàncies per pH.
  - Predir el color de l'indicador.
  - Completar neutralitzacions (enllaç amb l'app 3.7).

### 3.12 Velocitat de reacció (4t ESO)

- **Concepte:** factors que afecten la velocitat: temperatura, concentració, superfície de contacte i catalitzadors; teoria de col·lisions.
- **Visual:** partícules que xoquen. Només els xocs amb prou energia i ben orientats reaccionen. Una gràfica de productes respecte del temps.
- **Explora:** canviar un factor cada vegada i comparar les gràfiques.
- **Repte:**
  - Predir quina reacció anirà més ràpid.
  - Explicar casos quotidians (nevera, comprimit efervescent sencer o triturat, enzims).

---

## 4. Elements comuns a totes les apps

Per mantenir la coherència i reduir la feina, totes les apps han de compartir:

| Element comú | Descripció |
|---|---|
| Disseny | La mateixa estètica de l'app d'igualació (targetes blanques, fons blau clar, tipografia) |
| Estructura | Barra superior compacta, zona central visual i barra d'accions; modes «Explora» i «Repte» |
| Escalat | Patró `fitScale` d'`edu-apps/Equacions` (base 1440×800, zoom mínim 0,75) |
| Elements químics | Un sol mòdul amb símbols, noms en català, colors CPK, masses atòmiques i valències |
| Fórmules | Un sol analitzador de fórmules i ions (amb la correcció de la càrrega) i un sol renderitzador HTML |
| Molècules | El mateix motor de dibuix SVG de molècules |
| Feedback | Missatges curts i concrets, pistes progressives en tres passos i celebració en encertar |
| Progrés | Desat al navegador, amb resum per nivell i botó per reiniciar |
| Aula | Mode projector i funcionament sense connexió (sense CDN) |
| Llengua | Català, amb textos adaptables a nivell A2–B1 per a l'alumnat nouvingut |
| Peu | Skill `felip-app-footer` (CC BY-NC-SA 4.0) |
| Menú | Enllaç des del menú general d'`edu-apps` i enllaços creuats entre apps germanes |

Opcionalment, es pot crear una **carpeta de mòduls compartits** (per exemple `edu-apps/quimica-comu/`) amb els elements, l'analitzador, el dibuix de molècules i l'escalat.

---

## 5. Atenció a la diversitat (NESE i nouvinguts)

- Glossari visual amb icona i imatge per als termes clau (àtom, molècula, reactiu, producte…).
- Instruccions breus i amb icones, i opció de llegir-les en veu alta.
- Nivells graduats i ajudes visibles en el mode Explora.
- Exemples de la vida quotidiana i de l'entorn proper.
- Mateix nivell d'exigència en el mode Repte, amb més suport però no menys contingut.

---

## 6. Planificació i prioritats

| Ordre | App | Curs | Motiu de la prioritat | Esforç estimat |
|---|---|---|---|---|
| 0 | Millora de l'app d'igualació | 3r–4t | Base tècnica comuna (analitzador, molècules, escalat) | Mitjà |
| 1 | Reactius, productes i sobrants | 3r–4t | Continuació directa i reutilització gairebé total del motor | Baix–mitjà |
| 2 | Formulació inorgànica | 3r–4t | Gran necessitat a l'aula i base de les equacions | Mitjà |
| 3 | Construeix un àtom | 2n–3r | Concepte fonamental i molt visual | Mitjà |
| 4 | Taula periòdica interactiva | 3r | Reutilitza el mòdul d'elements per a tota la família | Baix–mitjà |
| 5 | El mol i la massa molar | 4t | Conceptes abstractes que milloren molt amb la visualització | Mitjà |
| 6 | Estats de la matèria | 1r–2n | Model de partícules, base de tot | Mitjà–alt (animació) |
| 7 | Enllaç i molècules | 3r–4t | Connecta àtom, taula i formulació | Alt |
| 8 | Àcids, bases i pH | 3r–4t | Molt quotidiana i motivadora | Mitjà |
| 9 | Dissolucions i concentració | 3r–4t | Càlcul i visualització senzills | Baix–mitjà |
| 10 | Substàncies pures i mescles | 1r–2n | Senzilla i útil als primers cursos | Baix |
| 11 | Velocitat de reacció | 4t | Simulació de partícules més complexa | Alt |

### Fases

1. **Fase 1 — Fonaments:** millorar l'app d'igualació i extreure'n els mòduls comuns (elements, analitzador de fórmules, molècules i escalat).
2. **Fase 2 — Bloc de la reacció química:** reactius i sobrants, formulació i el mol.
3. **Fase 3 — Bloc de l'àtom:** construeix un àtom, taula periòdica, i enllaç i molècules.
4. **Fase 4 — Bloc de la matèria:** estats de la matèria, substàncies i mescles, i dissolucions.
5. **Fase 5 — Química quotidiana:** àcids, bases i pH, i velocitat de reacció.

### Procés per a cada app

1. Concretar els sabers del currículum i els errors conceptuals habituals.
2. Esbossar la pantalla única (Explora i Repte) a 1366×740.
3. Preparar el banc d'exercicis en JSON i validar-lo amb un script automàtic.
4. Programar-la reutilitzant els mòduls comuns.
5. Verificar-la visualment a 1920×1080, 1366×768, 1366×740, al 125 % i al 150 %, i en tauleta i mòbil.
6. Provar-la amb un grup d'alumnes i ajustar-la.
7. Afegir el README, la captura, el peu i l'enllaç al menú d'`edu-apps`.

---

## 7. Referències del PhET relacionades

| App germana | Simulació del PhET de referència |
|---|---|
| Estats de la matèria | Estados de la materia: conceptos básicos |
| Construeix un àtom | Construye un átomo; Isótopos y masa atómica |
| Enllaç i molècules | Construye una molécula; Forma de la molécula |
| Reactius, productes i sobrants | Reactivos, productos y sobrantes |
| Dissolucions i concentració | Concentración; Molaridad |
| Àcids, bases i pH | Escala de pH: conceptos básicos |
| Velocitat de reacció | Reacciones y velocidad |

Totes es troben a [phet.colorado.edu/es](https://phet.colorado.edu/es/). Abans de fer servir cap nom o dada concreta, convé comprovar quines simulacions estan disponibles en HTML5.

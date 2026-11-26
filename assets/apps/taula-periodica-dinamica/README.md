# Taula periòdica dinàmica

Adaptació per a Aula CreActiva de la [revisió original de Felip Sarroca](https://github.com/felipsarroca/edu-apps/tree/8cca89ad10dff4aa1d8d9593ac1a6b03157c10ab/TaulaPeriodicaDinamica). El mode Repte es limita a 10 preguntes i envia el resultat complet a l'Aula. Es conserven la puntuació, les pistes i les llicències originals.

Aplicació web (HTML, CSS i JavaScript, sense dependències) que acoloreix la taula periòdica segons el criteri que es triï: famílies, propietats periòdiques, propietats físiques, química i vida, abundància i història.

Funciona obrint directament `index.html` (també des de `file://`) o publicada a GitHub Pages.

## Funcionalitats

- **36 visualitzacions** agrupades en set blocs:
  - *Classificació*: famílies (amb halògens), metalls/semimetalls/no-metalls, blocs s-p-d-f, estat físic a 25 °C i estat segons la temperatura (control lliscant de 1 K a 6.000 K, temperatures de referència i botó ▶ que escalfa la taula des del zero absolut fins a la temperatura del Sol).
  - *Estructura i enllaç*: electrons de valència amb l'estructura de Lewis (punts al voltant del símbol), estats d'oxidació habituals (formulació d'ESO), electronegativitat, energia d'ionització, afinitat electrònica i radi atòmic.
  - *Propietats físiques*: densitat, punts de fusió i d'ebullició (en °C o K), conductivitat elèctrica i tèrmica, ferromagnetisme i estructura cristal·lina (amb el dibuix de la cel·la unitat cc, ccc, hc i del diamant a la fitxa).
  - *Química i vida*: color a la flama (amb el color real de cada element i els que s'usen als focs artificials), reactivitat, bioelements (primaris, secundaris i oligoelements), toxicitat, radioactivitat (natural o artificial), isòtops estables (amb l'abundància natural de cada isòtop a la fitxa) i període de semidesintegració (escala logarítmica amb marques de referència: 1 s, 1 dia, 1.000 anys i edat de la Terra).
  - *Abundància*: escorça terrestre, cos humà i univers (escala logarítmica).
  - *Recursos i societat*: matèries primeres crítiques i estratègiques de la UE, amb el principal país productor i els minerals de conflicte; elements del mòbil (pantalla, bateria, xips, imants i carcassa, amb la funció de cada element) i preu aproximat per kg (ordres de magnitud).
  - *Origen i història*: origen còsmic (Big Bang, estrelles, supernoves, xocs d'estrelles de neutrons), origen del nom (mitologia, astres, llocs, persones, propietats, minerals) i any de descobriment, amb un control lliscant i un botó ▶ que anima la línia del temps del 1650 a avui, amb fites històriques (Lavoisier, Mendeléiev, els Curie...) i el recompte d'elements coneguts; i país del descobriment (amb els descobriments compartits i les científiques que hi van participar).
- **Escales de color contínues** amb llegenda en degradat per a les magnituds numèriques.
- **Llegenda interactiva**: en clicar una categoria, es destaquen els seus elements.
- **Panell d'informació** a l'espai buit de la taula: vista ampliada de l'element sota el cursor, descripció del mode i tendències periòdiques amb fletxes.
- **Fitxa de l'element** amb totes les propietats, el valor del mode actiu destacat, notes que matisen les dades, un resum i el descobriment. Inclou el model de Bohr de l'àtom (protons, neutrons i electrons per capes, amb la capa externa destacada), l'etimologia del nom i l'origen còsmic. En els elements radioactius, inclou la corba de desintegració de l'isòtop més estable i un context per entendre-la.
- **Compara**: tria dos elements i en veus les propietats en paral·lel.
- **Repte**: preguntes sobre les tendències periòdiques (per exemple, quin element del període 3 té el radi més gran o quin actínid dura més) i endevinalles: cal trobar l'element a partir de pistes successives (origen còsmic, família, descobriment, posició i origen del nom). Cada error en descobreix una de nova.
- **Mode projector** (text més gran) i **tema clar o fosc**.
- Els elements 104-118 es mostren amb una vora discontínua: tenen propietats predites.

## Adaptació a la pantalla

- La interfície es dissenya per a 1440 × 820 px útils. En portàtils més petits (1366 × 768) o amb escalat del sistema (125 %, 150 %) es redueix sencera (`--ui-zoom`, com a l'app *Equacions*), amb un mínim del 75 %.
- La graella s'escala per ocupar tot l'espai disponible i es recalcula en redimensionar la finestra o en canviar de monitor.
- En mòbils i tauletes (< 900 px), el tauler de control se situa a dalt, la taula es pot desplaçar dins del seu marc i el peu queda al final.

## Estructura

- `index.html`: estructura de la interfície.
- `style.css`: estils, temes i adaptació a la pantalla.
- `app.js`: definició dels modes, pintat, llegenda, fitxa, comparació, repte i escalat.
- `data/elements.js`: dataset base (PeriodicTableJSON, de Bowserinator, elements 1-118).
- `data/propietats.js`: dades complementàries revisades (classificació, radis, conductivitats, abundàncies, estats d'oxidació, bioelements, toxicitat, períodes de semidesintegració, isòtop més abundant, matèries primeres crítiques, descobriment i notes).
- `data/origens.js`: etimologia del nom i origen còsmic de cada element.
- `data/extra.js`: canvis d'estat a 1 atm, isòtops estables, estructura cristal·lina, elements del mòbil, país del descobriment i preu aproximat.
- `data/noms_ca.js` i `data/summaries_ca.js`: noms i resums en català.
- `assets/CC_BY-NC-SA.png`: distintiu de la llicència.
- Documents i imatges de referència: `Valors dels elements de la Taula Periòdica.pdf/.docx`, `Propietats dels Elements.pdf` i les imatges `*.JPG`.

## Fonts de les dades

| Dada | Font |
|---|---|
| Massa, electronegativitat (Pauling), 1a energia d'ionització, densitat, punts de fusió i d'ebullició, configuració | PeriodicTableJSON (Bowserinator) |
| Radi atòmic | Slater (1964); gasos nobles, Clementi (1967) |
| Conductivitat elèctrica (20 °C) i tèrmica (300 K) | CRC Handbook of Chemistry and Physics |
| Abundància a l'escorça | CRC Handbook of Chemistry and Physics |
| Abundància al cos humà | J. Emsley, *The Elements* (adult de 70 kg) |
| Abundància a l'univers | K. Croswell (1996), Via Làctia |
| Període de semidesintegració (isòtop més estable) | NUBASE2020 (Kondev et al., 2021) i IAEA LiveChart; elements 104-118, valors aproximats |
| Isòtop més abundant (model de Bohr) | IUPAC/CIAAW, composició isotòpica dels elements (2021) |
| Capes electròniques | Calculades a partir de la configuració electrònica (PeriodicTableJSON) |
| Matèries primeres crítiques | Reglament (UE) 2024/1252 i Comissió Europea, estudi de matèries primeres crítiques (2023) |
| Minerals de conflicte | Reglament (UE) 2017/821 |
| Origen còsmic | J. A. Johnson, *Science* 363 (2019); N. Prantzos et al., *MNRAS* 491 (2020) |
| Origen del nom | IUPAC; P. Enghag, *Encyclopedia of the Elements* (2004); J. Coromines, *Diccionari etimològic* |
| Color a la flama | A. I. Vogel, *Química analítica qualitativa*; Royal Society of Chemistry |
| Afinitat electrònica | PeriodicTableJSON (valors experimentals); no es mostren els lantànids ni els elements des del 87 |
| Isòtops estables i abundància natural | IAEA, Live Chart of Nuclides (NUBASE2020 i ENSDF) |
| Estructura cristal·lina | CRC Handbook of Chemistry and Physics |
| Elements del mòbil | A. Brunning, Compound Interest; Royal Society of Chemistry; American Chemical Society |
| País del descobriment | Elaboració pròpia a partir dels descobridors (Viquipèdia) |
| Preu aproximat | Wikipedia, *Prices of chemical elements* (USGS, 2020); cotitzacions dels metalls preciosos (2025) |
| Any de descobriment | Taula de la carpeta (`AnyDescobrimentElements.JPG`) |

## Afegir un mode nou

Afegeix una entrada a l'objecte `MODES` d'`app.js`:

- Mode de categories: `kind: 'cat'`, `cats` (clau, etiqueta i color) i `catOf(el)`.
- Mode numèric: `kind: 'num'`, `value(el)`, `fmt(v, el)` i `legendFmt(v)`; opcionalment `log: true`.
- Camps opcionals: `group` (grup del selector), `desc`, `note`, `source` i `trend`.

## Llicència

Aplicació de Felip Sarroca i sota llicència [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ca). El dataset PeriodicTableJSON es distribueix sota llicència CC BY-SA 3.0.

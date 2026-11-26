# Redisseny del web — estat i procediment per continuar

**Iniciat:** 13-11-2026. **Encàrrec de Felip:** el web anterior (un sol HTML amb molt scroll, fosc, amb diagrames de caixes) no li agrada. Vol que l'alumnat **vegi** com funcionen i de què es componen màquines, fàbriques i transports: imatges potents, clares i molt pedagògiques.

Aquest fitxer és la guia per reprendre la feina des de qualsevol ordinador. **Actualitza la taula d'estat cada vegada que acabis una peça.**

**Darrera revisió gràfica (13-11-2026, segon encàrrec de Felip):** tretze parelles de màquina muntada i vista explotada amb ChatGPT (`img/illustration-*.webp`, `img/exploded-*.webp`). Les explotades parteixen de la làmina muntada, amb desplaçaments curts dels conjunts i punts numerats verificats per imatge. Afegida la roda de filar tradicional. Eliminats el comparador amb fotos i els selectors de punts de vista. El cotó té cinc animacions noves en perspectiva obliqua fixa (`js/textil-models.js`); les plantes i seccions ja no són la vista inicial. Fotografies conservades al desplegable de fonts. Prompts a `assets/prompts-explotades.json`. Peu fix amb distintiu a l'esquerra, dues línies a la dreta i textos «Codi: AGPLv3 · Continguts: CC BY-NC-SA 4.0», segons BibliotecaSol. La llicència de codi porta al LICENSE d'aquest projecte; la de continguts, al resum català de Creative Commons.

**Verificació d'aquesta revisió:** 27 escenes × 5 finestres (1920×1080, 1366×768, 1093×614 amb DPR 1,25, 911×512 amb DPR 1,5 i 390×844): sense errors de JavaScript ni desbordaments. Comprovats els modes, la selecció de peces, el zoom, les etiquetes, els reptes, els enllaços del peu i 60 posicions dels mecanismes amb moviment reduït activat/desactivat. L'escalat de Windows s'ha simulat amb l'espai útil i el DPR; no s'ha canviat el sistema operatiu.

## 1. Decisions preses

- **Nom definitiu (13-11-2026): «La Revolució Industrial».** Sense el subtítol «per dins» a la portada, la marca, les pestanyes del navegador ni la targeta del menú de webs.

- **Diverses pàgines, sense scroll a l'ordinador.** `index.html` (portada amb un paisatge clicable) i una pàgina per capítol: `camp.html`, `vapor.html`, `textil.html`, `fabrica.html`, `metalls.html`, `tren.html`, `vaixell.html`, `capital.html`. Cada capítol té pestanyes d'**escenes** i una pestanya final **Repte** (preguntes).
- **Imatges (criteri revisat per Felip el 13-11-2026):** il·lustracions raster amb ChatGPT per veure la màquina completa; fotografies històriques a «Màquina real»; SVG reservat als esquemes animats i interactius. Prioritat a la claredat, les proporcions, una perspectiva coherent i poca informació simultània.
- **Estètica suavitzada (13-11-2026):** atles il·lustrat sobre paper clar, amb vores fines en tons de paper, ombres difuminades, tipografia menys gruixuda i ressaltats discrets. Es conserven la paleta, Fraunces (títols), Figtree (text), les il·lustracions i la distribució. Evitar recuperar marcs negres gruixuts, ombres dures desplaçades i caixes redundants dins de les targetes. Codi de colors: taronja = calor/vapor, blau = aigua/fred, vermell = focus.
- **Cada escena:** pregunta inicial, dibuix gran animat, control de reproducció (play, fase anterior/següent, lliscador per «aturar el temps», velocitat), «Pas a pas», peces clicables amb fitxa, botó «Etiquetes» (amagar-les per autoavaluar-se), «La idea clau» i bloc de Batxillerat (només visible amb el nivell «+ Batxillerat»).
- **Escala:** com `edu-apps/Equacions`: disseny base 1440 × 800 i `zoom` a `<html>` (funció `ajusta()` de `js/nucli.js`). Per sota de 980 px d'amplada passa a disposició mòbil amb scroll vertical.
- Es mantenen: peu corporatiu, llicències (AGPL + CC BY-NC-SA), formulari d'errors, enllaç `ja.cat/revindustrial`.
- **Publicació de seguiment autoritzada per Felip el 13-11-2026.** El redisseny encara requereix revisió visual i de contingut.

## 2. Arquitectura dels fitxers

| Fitxer | Funció |
|---|---|
| `css/estil.css` | Tot l'estil: interfície i classes de dibuix SVG (`.t` traç, `.ferro`, `.coure`, `.fusta`, `.mao`, `.aigua`, `.flux`...). |
| `js/nucli.js` | Motor comú: llista de capítols (`RI.CAPITOLS`), capçalera, pestanyes, bucle d'animació, etiquetes, peces, repte, escala. També peces de dibuix: `RI.roda`, `RI.engranatge`, `RI.foc`, `RI.focs`, `RI.persona`, `RI.nuvol`, `RI.retol`, `RI.fletxa`, `RI.tram`, `RI.color`. |
| `js/<capitol>.js` | Un per capítol. Crida `RI.capitol({id, titol, escenes:[...], repte:[...]})`. |
| `js/portada.js` | Defineix `RI.portada()` (portada). |
| `<capitol>.html`, `index.html` | Carcasses idèntiques (només canvien `data-capitol`, el títol i el script). |
| `app.js`, `styles.css` | **Web antic. S'han d'esborrar** quan el nou estigui complet (`git rm app.js styles.css`). |

### Com es defineix una escena

```js
{ id:'newcomen', nom:'Newcomen', any:'1712', qui:'...', durada:11,   // segons per cicle
  model:'text petit sota el dibuix', pregunta:'...', intro:'html',
  svg: () => RI.svg(`...`),            // dibuix; zona útil 0–1200 × 0–720, fons de −60 a 1260
  anima: ({p,t,k,el}) => {...},        // p = moment del cicle (0–1), t = segons, k = fase, el('id')
  fases:[{fins:0.34, nom:'...', text:'html', focus:['caldera']}],   // «fins» = final de la fase
  parts:{caldera:{nom:'Caldera', text:'...'}},        // lligades a <g data-part="caldera">
  etiquetes:[['caldera', x, y, ancoraX, ancoraY, 'text opcional']],
  capes:[{id:'forca', nom:'Segueix la força', on:false}],  // posa la classe capa-forca a l'SVG
  clau:'...', batx:{titol, text, font, fontNom} }
```

Atributs automàtics dins l'SVG: `data-flux="v"` (guions que corren), `data-fase="0.2-0.5"` (visible només en aquell tram del cicle), `data-en="0,2"` (visible en aquelles fases), `data-gira="cx cy voltes"`, `data-girat="cx cy graus/s"`, `data-puf="x y dx dy n r període"` (bafarades de vapor o fum; classes `vap`, `fum`, `calor`).

## 3. Com provar-ho

1. Obre un terminal a la carpeta del projecte i executa `python -m http.server 4173`.
2. Visita `http://localhost:4173/` (si no veus els canvis, força la recàrrega amb Ctrl+F5).
3. Per saltar a una escena i un moment concrets, a la consola del navegador: `RI.ves(1, 0.2)` (escena 2, 20 % del cicle).
4. Comprova sempre a 1920 × 1080, 1366 × 768 i mòbil (390 × 844), i que la consola no mostri errors.

## 4. Estat de la feina

| Peça | Estat | Notes |
|---|---|---|
| `css/estil.css`, `js/nucli.js` | Fet i revisat visualment | Gradients metàl·lics/fusta/mar, ajudes realistes (`arbre`, `cavall`, `ovella`, `vaca`), focus legible i etiquetes que segueixen punts rotats (`id@lx,ly`). |
| Carcasses HTML (9) | Fet | |
| `js/vapor.js` | Fet i revisat visualment | Newcomen, condensador de Watt, màquina rotativa (sol i planeta amb etiqueta dinàmica) + repte. |
| `js/tren.js` | Fet i revisat visualment | Rocket en tall + cursa Liverpool–Manchester (cavalls amb arnés) + repte. |
| `js/fabrica.js` | Fet i revisat visualment | Filatura hidràulica i de vapor, capes «força» i «cotó», etiquetes ajustades + repte. |
| `js/textil.js`, `textil-models.js`, `textil-roda.js` | Revisió nova | Roda de filar → teler → Jenny → Water Frame → mula → síntesi de la cursa. Una perspectiva obliqua, amb controls de fases i repte ampliat. |
| `js/metalls.js` | Fet i revisat visualment | Carbonera/forn de coc, alt forn amb bufadora i escòria, pudelador i convertidor Bessemer basculant + repte. |
| `js/vaixell.js` | Fet i revisat visualment | Tall net del *Great Western* amb eixàrcia i folre de coure, *Rattler*–*Alecto*, mapa Atlàntic real + repte. |
| `js/camp.js` | Fet i revisat visualment | Rotació Norfolk detallada, sembradora de Tull amb transmissió i ocells, arada de Rotherham amb gleves i tàndem + repte. |
| `js/capital.js` | Fet i revisat visualment | Societat anònima amb viaducte i estació, banc/borsa i cotització annotada, càrtel/trust/holding + repte. |
| `js/portada.js` + estil | Fet i revisat visualment | Paisatge complet amb 8 fites històriques detallades i tots els pins visibles a escriptori i mòbil. |
| `js/reals.js` | Substituït | Manifest de 13 màquines muntades i 13 explotades, posicions dels punts i llegendes interactives. Fotos històriques al desplegable de fonts. |
| Esborrar `app.js` i `styles.css` | Fet | |
| Verificació a 3 mides | Fet | Comprovat sense errors de consola ni desbordaments a 1440×900, 1366×768 i 390×844 (panell dret sense scroll a escriptori). |
| `README.md`, captures noves, `VISIO-I-GUIO.md` | Pendent | |
| Commit, push i comprovació del web publicat | Fet / actualitzat | Pujat a `main` amb totes les làmines vectorials, mode pas a pas i autoauditoria visual. |

## 5. Guió de les escenes que falten

- **Tren (`tren.js`)** — 1) *Rocket* de Stephenson (1829) en tall: fogar, caldera multitubular, cilindre inclinat, biela, roda motriu, escapament a la xemeneia, tènder; rodes i biela amb cinemàtica real i via que corre. 2) Cursa Liverpool–Manchester (~50 km, cap al 1830): barcassa de canal (~12 h), diligència (~4 h), tren (menys de 2 h); xifres aproximades, dir-ho.
- **Fàbrica (`fabrica.js`)** — tall d'una filatura de diversos pisos: 1) hidràulica (roda → eix vertical → eixos de cada pis → corretges → màquines; el cotó puja de planta en planta); 2) de vapor (mateix edifici amb sala de màquines, caldera i xemeneia). Capes «Segueix la força» i «Segueix el cotó».
- **Cotó (`textil.js`)** — 1) la cursa entre filar i teixir (balança que es decanta: 1733 Kay, 1764 Jenny, 1769 Water Frame, 1779 mula, 1785 teler mecànic); 2) teler i llançadora volant; 3) Spinning Jenny; 4) Water Frame (corrons que giren cada cop més de pressa); 5) mula de Crompton.
- **Ferro i acer (`metalls.js`)** — 1) del carbó al coc (Darby, 1709); 2) alt forn en tall (càrrega per dalt, aire calent, ferro colat i escòria); 3) pudelació i laminatge (Cort, 1784); 4) convertidor Bessemer (1856) que bascula. Explicar ferro colat / ferro forjat / acer.
- **Vaixell (`vaixell.js`)** — 1) *Great Western* (1838) en tall: calderes, màquina de palanques laterals, roda de pales, carboneres, veles auxiliars; 2) pales contra hèlix (prova *Rattler*–*Alecto*, 1845); 3) travessar l'Atlàntic: veler (5–6 setmanes) contra vapor (unes 2 setmanes el 1838).
- **Camp (`camp.js`)** — 1) guaret contra rotació Norfolk (quatre parcel·les que giren + cicle farratge → bestiar → fems); 2) sembradora de Jethro Tull (c. 1701) en tall contra sembra a eixam; 3) arada de Rotherham (1730) amb les peces.
- **Capital (`capital.js`)** — 1) societat anònima (inversors → accions → empresa → dividends; responsabilitat limitada); 2) banc i borsa; 3) càrtel, trust i holding (finals del XIX).
- **Portada (`portada.js`)** — un sol paisatge SVG animat (camps → mina → fàbrica → alt forn → tren → port → banc) on cada element porta al seu capítol, més les vuit targetes amb la pregunta de cada capítol. Tot en una pantalla.

## 6. Per acabar (quan tot estigui dibuixat)

1. Revisió lingüística de tots els textos i revisió de dates.
2. `git rm app.js styles.css`; refer captures a `captures/`; actualitzar `README.md` i afegir un apartat 12 a `VISIO-I-GUIO.md`.
3. Ensenyar-ho a Felip en local. Amb el seu vistiplau: commit, push a `main`, esperar GitHub Pages i comprovar `https://ja.cat/revindustrial` tal com ho veu l'usuari.
4. **Actualització tèxtils, múltiples punts de vista i vista explotada (13/11/2026)**:
   - Suport natiu a `nucli.js` i `estil.css` per a **vistes explotades** (`[data-exp]`, guies discontínues `[data-guia]` i desplaçament coordinat d'etiquetes `.etq-e`) i **múltiples punts de vista** (`.vistes`, `data-vista`, sincronitzats amb `p`).
   - Nous gradients i textures de roure, ferro fos, llautó i cotó a `RI.DEFS`.
   - Reconstrucció 3D i multi-vista completa de les 4 màquines de `js/textil.js` (`Llançadora volant`, `Spinning Jenny`, `Water Frame`, `La mula`), més vistes explotades a `sembradora`, `arada`, `watt`, `rotativa`, `rocket`, `bessemer` i `western`.
   - Enllaç de `AGPL-3.0-or-later` al peu de pàgina cap a `LICENSE` a GitHub.
5. **Làmines tècniques 3D explotades, comparació amb «Màquina real» i segona passada SVG (13/11/2026)**:
   - 12 làmines tècniques en vista explotada 3D estil enciclopèdic (`img/exp-*.webp`), integrades amb fusió sobre pergamí (`#lamina-exp`), zones interactives (`.exp-zona`) i etiquetes en català que es poden amagar com a autoavaluació.
   - Botó «Màquina real» (`#lamina-real`, `data-capa="_real"`) en 13 escenes clau amb cartela de museu i il·lustració d'alta resolució.
   - Segona passada de realisme metàl·lic i estructural (`RI.roda`, `RI.engranatge`, reblons de caldera, cilindres i palanques en `vapor.js`, `tren.js`, `vaixell.js`, `metalls.js`, `fabrica.js` i `camp.js`), més correcció d'ID duplicat `#capes` a `metalls.js` (`#fcapes`).
6. **Làmines reals vectorials d’estudi, mode «Pas a pas», zoom ×1,8 i auditoria UI (13/11/2026)**:
   - Substitució de les fotografies de baixa resolució per **13 làmines tècniques vectorials d’estudi** (`js/reals.js`, `RI.REALS`) amb il·luminació, materials i escala humana (100 % crisp a qualsevol resolució), carregades als 7 capítols.
   - **Control de reproducció «Pas a pas» / «Continu»** (`#b-pas` a `nucli.js`): per defecte, l’animació s’atura al final de cada pas (`#b-play.espera`) fins que l’alumnat prem `▶` per continuar o activa el mode `Continu`.
   - **Desactivació de la barra de reproducció en làmines estàtiques** (`.comandament.inactiva` quan és activa `Vista explotada`, `Màquina real` o un repte): atura el bucle de reproducció, bloqueja tecles/botons i indica tornar al diagrama per animar.
   - **Zoom ×1,8 interactiu** (`[data-zoom]` + seguiment del ratolí a `.lamina-zoom`) tant a `Vista explotada` com a `Màquina real`, i navegació reactiva per `hashchange`.
   - **Ajust del panell dret sense scroll vertical innecessari** en escriptori (`1440×900` i `1366×768`) i reforços visuals pedagògics a `vapor.js` (fletxes de pressió/buit a Newcomen i força del vapor a Watt) i `metalls.js` (equació d’oxidació `C + O₂ → CO₂ ↑` i reducció del carboni `4 % → 0,5 %` al Bessemer).
7. **Redisseny lleuger i sense scroll del panell dret (13/11/2026)**:
   - Columna `.panell` equilibrada (`clamp(370px, 27.5vw, 410px)`), tipografia més continguda i separacions visuals més clares entre pregunta, fases, peces i idea clau.
   - Fitxa de peça tancable (`.fitxa-tanca`) i bloc `+ Batxillerat` convertit en desplegable flotant (`.batx-wrap` / `.batx-bloc`) perquè totes les escenes i els botons inferiors (`.p-nav`) càpiguen sempre sense scroll vertical a `1440×900` i `1366×768`.
   - Estat posterior: les làmines muntades i explotades es van generar amb ChatGPT i el projecte va incorporar models 3D de Blender; aquest bloqueig de quota ja no és vigent.
8. **Comprensió interna i focus explícit «on és la innovació» (13/11/2026)**:
   - Nou helper `RI.innova` a `js/nucli.js` (càpsula destacada amb punter i halo opcional sobre el mecanisme innovador).
   - Millores a totes 25 escenes dels 8 capítols (`camp.js`, `vapor.js`, `textil.js`, `fabrica.js`, `metalls.js`, `tren.js`, `vaixell.js`, `capital.js`): càpsules `★ INNOVACIÓ` sense solapaments, enllaços mecànics animats (roda→dosador a la sembradora, flux giratori a l'orelló de Rotherham, columna d'aigua ascendent i tirant+papallona al regulador centrífug de Watt, fletxes de doble efecte, ràtios `×1/×2/×4` als corrons de la Water Frame, contrast de temperatures `~100 °C / ~20 °C` i de càrregues `30 t → centenars de t`).
9. **Animacions tèxtils clares i eixos de muntatge a les vistes explotades (13/11/2026)**:
   - Reconstrucció integral de les animacions de `textil.js` (`llancadora`, `jenny`, `water`, `mula`) amb més claredat mecànica: calada ombrejada i trama independent picada per la pinta (`teler`), orientació unificada esquerra→dreta en 3D i planta + pinça mòbil amb estat `OBERTA/TANCADA/ENROTLLA` + ones helicoïdals de torsió (`jenny`), fibres en moviment accelerant-se `×1/×2/×4` i canvi de profunditat 3D de les aletes (`water`), 6 fils paral·lels sense creuament en X + rètol `CORRONS GIRANT / CORRONS PARATS!` (`mula`).
   - Overlay SVG d'eixos d'acoblament i siluetes guia (`.exp-guies` a `estil.css`, `nucli.js` i `explotada.guies` a `textil.js`, `vapor.js`, `metalls.js`, `tren.js` i `vaixell.js`) per indicar clarament on encaixa cada peça dins la màquina muntada.
   - Estat posterior: la generació de làmines es va resoldre amb ChatGPT i es van afegir models 3D de Blender. Els 18 fitxers `.glb` actuals estan comprimits amb Draco.
10. **Revisió estètica i didàctica: 23 propostes aplicades (13/11/2026)** (totes menys la 22, el mode «Prediu»):
   - **Màquina real**: fotos reals de Wikimedia Commons amb autor i llicència a la cartela (alt forn de Coalbrookdale, teler de Kilbarchan, Newcomen, Watt, rotativa, Jenny, Water Frame, mula, Cromford, Bessemer, Rocket, gravat de Tull i pintura del Great Western). Comparador lliscant foto/dibuix i escala humana.
   - **Nucli** (`nucli.js`, `estil.css`): càpsula d'innovació que s'encén a la fase clau (`e.innova`), etiquetes atenuades fora del focus, llegenda de colors per capítol (`cap.llegenda`), capes automàtiques per fase (`e.capaFase`), «Connecta amb…» i línia de temps d'escenes, botó «Amplia» (gira en vertical al mòbil) i correcció del desbordament horitzontal al mòbil.
   - **Repte**: opcions barrejades i preguntes visuals noves «toca la peça» i «ordena el procés» a tots els capítols.
   - **Escenes**: Newcomen (sostre, balancí i buit), caixes i tacos de la llançadora, braç de la Jenny que segueix la manovella, mula vista de costat amb fases i cota, laminador amb escletxa real, comptador «minut N de 20» al Bessemer, roda de pales «fantasma», mapa real de l'Atlàntic (Natural Earth, domini públic) amb rutes i vents, monedes i accions que circulen a «El capital», colors de flux per fase a la fàbrica i retocs de la portada (fum, tren, nau del cotó, pins).
   - **Parcials (3 i 8), resolts posteriorment**: les làmines es van generar amb ChatGPT i es van complementar amb el visor 3D de models Blender.
   - Comprovat sense errors de consola a 1366 × 768, 1440 × 810 i 390 × 844.


## Revisió del moviment del cotó (13 de novembre de 2026)

Vegeu [el dossier de revisió](assets/revisio-coto.md) per als criteris, les fonts i les simplificacions. S’han refet les cinc seqüències per mostrar acció, transformació, recollida i aportació de cada invent. Una comparació abans/després, una vista obliqua fixa centrada en el mecanisme i els missatges sincronitzats guien la lectura. S’ha corregit la roda tradicional a una roda manual de fus apta per explicar el cotó, amb dues làmines noves de ChatGPT. La cursa és ara una cadena causal sense produccions inventades.

A petició explícita de Felip, els originals anteriors s’han conservat a [versions/2026-11-13-coto-abans-revisio](versions/2026-11-13-coto-abans-revisio/README.md): 80 fitxers verificats byte a byte, manifest SHA-256, versió navegable independent i restaurador parcial. Es conserva l’estètica general vigent; no s’aplica cap nova suavització.

### Segona passada: seguir un sol fil

Després de veure la primera revisió, Felip demana una millora més profunda. El moviment passa a `js/textil-detalls.js`: detall funcional ampliat amb bastidor atenuat, fibra verdosa i fil daurat, miniatura sincronitzada del conjunt amb el mateix angle i indicadors de recollida simultània. En mòbil es prioritza el detall. No s’alteren les làmines estàtiques ni l’estètica general.

Es corregeixen la profunditat i les cares visibles del motor geomètric, les superfícies corbes, la disposició dels corrons de la Water Frame, els dos braços de l’aleta, els moviments de les guies i el creixement de la trama segons el sentit de la llançadora. La primera revisió publicada queda conservada íntegrament a [versions/2026-11-13-coto-primera-revisio](versions/2026-11-13-coto-primera-revisio/README.md), amb 84 fitxers i manifest SHA-256. El dossier `assets/revisio-coto.md` documenta les simplificacions i les comprovacions.

## Teler mecànic de Cartwright (14 de novembre de 2026)

Felip detecta que només s’esmentava a «La cursa». S’afegeix una escena pròpia entre la mula i la síntesi: 28 escenes totals, 14 parelles de làmines. `js/textil-cartwright.js` registra l’estat, el model i el contingut. L’animació coordina calada, impuls de la llançadora i batuda; la biela conserva la longitud i les lleves es calculen a partir de la llei del moviment dels lliços. La transmissió mostra una relació 2:1 entre l’eix principal i l’eix de lleves, amb una seqüència didàctica de dues passades per cicle.

La data de 1785 s’identifica com a patent. La representació horitzontal il·lustra el principi de les millores de 1787–1790, documentat a la memòria de J. M. Strickland (1843). No s’atribueix al prototip d’ordit vertical de 1785 la forma del model posterior. Les dimensions, les lleis de les lleves i la transmissió són una síntesi didàctica, no mesures extretes de la patent. La font gravada de 1790 es conserva a `img/real-cartwright-1790.jpg`; el desplegable n’indica la procedència i el domini públic. Les dues làmines noves de ChatGPT i els prompts es documenten a `assets/prompts-cartwright.json`.

S’amplia el repte amb una pregunta de comparació amb Kay i una de selecció de l’eix. Es compacta lleument l’espai horitzontal de les pestanyes del cotó per mantenir visible el botó del repte després d’afegir l’escena. En pantalles estretes, el desplaçament horitzontal de la barra manté visible la pestanya seleccionada, també en obrir un enllaç directe o redimensionar.

## Revisió de realisme dels esquemes en moviment (14 de novembre de 2026)

**Encàrrec de Felip:** els esquemes animats (SVG) han de ser molt realistes i estètics, i han de deixar veure perfectament el funcionament i l’avantatge de la novetat de cada invent. La millora es fa dins de la vista «Moviment» de cada escena. Una vista afegida «Abans i ara» (sistema antic i nou costat per costat) es va provar i es va descartar el mateix dia: complicava el web i aportava poc.

**Què s’ha fet**

- `js/materials.js` (nou, carregat després de `nucli.js`): textures procedurals generades un sol cop (fusta, maó, pedra, roca, terra, coure, llautó, ferro, acer, plom, carbó, herba), ombrejats de volum (`sh-cil`, `sh-tub`, `sh-cup`, `sh-pla`, `sh-llum`) i peces de dibuix: `RI.sol`, `RI.caixa`, `RI.cami`, `RI.tub`, `RI.brida`, `RI.reblons`, `RI.cadena`, `RI.brasa`, `RI.flamarada`, `RI.rodaR`, `RI.engranatgeR`, `RI.figura`, `RI.cavallR`, `RI.ombra`, `RI.cartell`, `RI.fons`.
- Redibuixats amb aquests materials, conservant geometria, identificadors, fases, peces i animacions: Newcomen, Watt i rotativa (`vapor.js`); Rocket (`tren.js`); forn de coc, alt forn, pudelació i laminador, i Bessemer (`metalls.js`); fàbrica d’aigua i de vapor (`fabrica.js`); *Great Western* i pales contra hèlix (`vaixell.js`); sembradora i arada (`camp.js`).
- Cotó: `js/textil-realista.js` (nou) pinta la màquina sencera amb la geometria i els estats ja verificats (`textil-models.js`, `textil-estats.js`), amb textures i llum segons l’orientació de cada cara. El pintor anterior (`textil-detalls.js`) continua al repositori.
- `RI.svg` retalla el dibuix al seu marc: res no sobresurt a les bandes laterals.
- Els rètols didàctics (`RI.cartell`), les fletxes i les etiquetes es mantenen plans i nets, per distingir-los del dibuix realista.

**Sense tocar en aquesta revisió:** rotació Norfolk, la cursa Liverpool–Manchester, el mapa de l’Atlàntic, «Tres metalls», «La cursa» del cotó i el capítol del capital (són esquemes o mapes, no màquines).

**Còpia de seguretat:** `versions/2026-11-14-moviment-abans-realisme/` (codi exacte a `originals/` amb empremtes SHA-256, i versió navegable). No s’enllaça des del web.

**Verificació:** `python assets/verifica_visual.py` (140 combinacions d’escena i mida, sense errors) i `node assets/verifica-cinematica.cjs`. Totes dues funcionen sense servidor local.

## Actualització del redisseny 2D del cotó (2026-11-14)

- **Còpia de seguretat arxivada:** `versions/2026-11-14-coto-abans-redisseny/` conserva els 14 fitxers originals anteriors al redisseny (inclosos `textil-models.js`, `textil-detalls.js` i `textil-realista.js`, juntament amb `manifest.json` i una còpia navegable de `textil.html`).
- **Substitució per talls tècnics en 2D (`js/textil-dibuix.js`):** Les sis màquines de `textil.html` (`roda`, `llancadora`, `jenny`, `water`, `mula` i `cartwright`) passen d'un renderitzador oblic amb polígons a seccions i vistes tècniques en 2D amb textures de `RI.MATS`, corretges i fils animats, etiquetatge dinàmic amb seguiment i finestres de detall sincronitzades per mostrar el guany històric de cada invent.
- **Verificació:** `node assets/verifica-cinematica.cjs` i `python assets/verifica_visual.py` superats després del canvi (`140` combinacions d'escena i finestra, `0` errors).

## Retirada de «La cursa» i redisseny clarificat de Cartwright (2026-11-14)

- **Arxiu abans del canvi:** `versions/2026-11-14-cartwright-i-cursa-abans-redisseny/` conserva `textil.html`, tots els scripts `js/textil*.js`, `js/nucli.js`, `js/materials.js`, `js/reals.js`, `css/estil.css` i els guions d'`assets/`.
- **Eliminació de la pestanya 7 («La cursa»):** retirada de `js/textil.js`; l'apartat del cotó passa a 6 escenes centrades en les màquines (més el Repte final) i s'ajusta `assets/verifica_visual.py` (`total == 6`).
- **Teler mecànic de Cartwright (`js/textil-dibuix.js`):** nova disposició neta sense muntants centrals davant els fils, amb balancí superior dels lliços, lleves d'excentricitat pronunciada amb rodet seguidor, impulsor lateral articulat, engranatge reductor `Relació 2:1`, biela en pla inferior lliure, tela progressiva i vista frontal ampliada amb dents de pinta, braços impulsors mecànics i indicadors de fase sincronitzats.

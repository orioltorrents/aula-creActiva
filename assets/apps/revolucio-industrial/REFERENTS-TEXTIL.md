# Animacions del cotó: referents i pla de millora

Document de planificació (14-11-2026). Felip considera que totes les animacions del web estan bé excepte les del capítol del cotó (`textil.html`). Aquí hi ha el diagnòstic de l'estat actual, els referents trobats i un pla per refer-les més endavant. **No s'ha implementat res.**

## 1. Diagnòstic de l'estat actual

Captures de la vista «Moviment» a 1366 × 768 (pintor actual: `js/textil-dibuix.js`).

| Escena | Què falla |
|---|---|
| Roda de filar | La màquina ocupa la pantalla però el fil (on passa tot) fa pocs píxels. La mà i la fibra semblen enganxades, no s'entén que el fil s'estira i es torça. |
| Llançadora volant | Perspectiva 3/4 correcta, però l'ordit és un esquema de línies verdes i vermelles, poc dens. La llançadora és petita i el cop del cordill (el gest clau) no es llegeix. No hi ha teixidor. |
| Spinning Jenny | Tall lateral amb **un sol fus** a la vista principal i un requadre a part amb vuit fusos estàtics. No es veu el que la fa revolucionària: una persona fent molts fils alhora. |
| Water Frame | Els corrons es veuen bé, però l'aleta (el que torça i enrotlla) és petita i a part, en un requadre de «4 caps». La roda hidràulica sembla enganxada al bastidor; en realitat movia l'eix de tota la fàbrica. |
| Mula de Crompton | **Fidelitat a verificar:** la gran roda és sobre el carro. A les mules manuals posteriors el capçal (corrons i roda) era fix i el que s'allunyava era el carro amb desenes de fusos; cal confirmar com era la de Crompton amb l'exemplar de Bolton (Hall i' th' Wood). Un sol fil visible. |
| Teler de Cartwright | El millor dels sis, però saturat: rètols, panell de fases i fils de colors competeixen. No es veu que una sola persona vigila diversos telers. |

**Problemes comuns**

1. **Escala equivocada.** Les innovacions del cotó són a escala del fil (estirar, torçar, enrotllar, creuar). Si es mostra la màquina sencera, el fil es perd; si es mostra només el fil, es perd la màquina. Cal mostrar les dues coses alhora.
2. **Estil desigual.** Dos telers en 3/4 i quatre filadores en tall lateral pla, amb aspecte de joguina al costat dels esquemes de vapor o metalls.
3. **Sense persones.** Al cotó, l'avantatge es mesura en fils per persona; sense la figura humana no es veu.
4. **Requadres estàtics** que competeixen amb l'animació en lloc d'explicar-la.

Els renders de Blender (`assets/blender/out/*-muntada.png`) són molt més realistes, però també necessiten revisió: a la Jenny, per exemple, els fusos són sobre el travesser del fons i els fils fan un ventall que no correspon al model històric (els fusos eren en un extrem, i la pinça corria sobre el bastidor).

## 2. Referents

### Gravats i làmines d'època (fonts per a la forma i la disposició)

| Referent | Què se n'aprofita | Accés |
|---|---|---|
| Edward Baines, *History of the Cotton Manufacture in Great Britain* (1835), làmines de T. Allom | Mula, water frame, telers mecànics en una nau real, amb operaris. Model per a l'escena de fàbrica i l'escala humana. | Escanejat complet a [archive.org](https://archive.org/download/historyofcottonm00bainrich/historyofcottonm00bainrich.pdf); làmina «Mule spinning» a Wellcome (CC BY 4.0, [còpia del fitxer de Commons](https://download.osmand.net/wiki/File:Mule_spinning_Wellcome_L0011292.jpg)); «Richard Arkwright's Spinning Machine» a [Columbia](https://exhibitions.library.columbia.edu/items/show/12495). |
| Abraham Rees, *Cyclopaedia* (c. 1805–1819), article «Cotton Manufacture» | Alçats i plantes tècniques: Jenny (gravat de Wilson Lowry), water frame, mula, banc de metxes. El millor model per a la geometria exacta. | «Water Spinning Frame» a la [col·lecció Rylands de Manchester](https://luna.manchester.ac.uk/luna/servlet/detail/Manchester~91~1~424730~189695:Cotton-Manufacture--Water-Spinning-); índex de la [Universitat d'Arizona](https://raptor.cs.arizona.edu/patterns/weaving/articles795.html). Cal buscar-les a Commons per confirmar la llicència. |
| Diderot i d'Alembert, *Encyclopédie*, Planches (1762–1772) | Roda de filar («Fil et laine, rouet», 5 làmines) i teler manual, anteriors a les màquines: serveixen de punt de partida «abans de l'invent». | [Índex de les làmines a Wikisource](https://fr.wikisource.org/wiki/Index_des_Planches_de_l%E2%80%99Encyclop%C3%A9die); [Encyclopédie a Commons](https://commons.wikimedia.org/wiki/Encyclop%C3%A9die). |
| *Encyclopaedia Britannica* (1911), «Cotton-spinning machinery» | Explicació textual precisa del cicle de la mula i de l'estiratge per corrons. Per contrastar la cinemàtica. | [Wikisource](https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Cotton-spinning_Machinery). |

### Màquines conservades i museus (fonts per al moviment real)

| Referent | Què se n'aprofita |
|---|---|
| Science Museum Group: [water frame d'Arkwright (1775)](https://collection.sciencemuseumgroup.org.uk/objects/co44832), [rèplica de la Jenny (Platt Brothers)](https://collection.sciencemuseumgroup.org.uk/search/mphc/co44544), [models de teler mecànic](https://collection.sciencemuseumgroup.org.uk/search/object_type/looms) | Fotografies de peces reals: proporcions, materials, nombre de fusos i cordes de transmissió. |
| [Helmshore Mills Textile Museum](https://en.wikipedia.org/wiki/Helmshore_Mills_Textile_Museum) (Lancashire) | Water frame complet de c. 1790 i mules en funcionament (demostracions de cardatge i de filatura amb mula). Referent per al ritme del carro. |
| [Belper North Mill](https://www.belpernorthmill.org.uk/collections/our-favourite-things/the-spinning-mule/) | Mula manual d'aprenentatge: la versió més propera a la de Crompton que es pot veure funcionant. |
| [Queen Street Mill](https://www.gracesguide.co.uk/Queen_Street_Mill_Museum) (Burnley) | Nau de telers moguts per eix de línia i màquina de vapor; vint telers en marxa. Posterior a Cartwright, però amb els mateixos tres moviments: calada, llançadora i batuda. |
| [Derwent Valley Mills / Cromford](https://www.derwentvalleymills.org/discover/derwent-valley-mills-history/derwent-valley-mills-history-development/) | Context de la primera fàbrica: roda hidràulica, eix i pisos de màquines. |
| [mNACTEC, Terrassa](https://en.wikipedia.org/wiki/MNACTEC) | Al Vapor Aymerich hi ha una carda, una contínua de filar i un teler Jacquard en funcionament. Referent proper per a una sortida i per filmar o fotografiar el moviment real. |

### Referents d'animació didàctica (fonts per a l'estil)

| Referent | Què se n'aprofita |
|---|---|
| [507 Mechanical Movements](https://507movements.com/mm_496.html) (H. T. Brown, 1868, animat) | Un mecanisme per animació, línia neta, moviment continu sense rètols: claredat màxima. |
| Explicacions 3D tipus Jared Owen o Animagraffs | Càmera que s'acosta a la peça clau mentre la resta continua en marxa; talls que s'obren. |
| [NPS: How does weaving work?](https://www.nps.gov/articles/000/how-does-weaving-work.htm) | Seqüència calada → llançadora → batuda en tres passos visuals, amb un llenguatge per a no especialistes. |
| [Toyota Commemorative Museum (galeria virtual)](https://www.tcmit.org/vgt/textile/english/scene-05-iframe/target-04/) | Museu tèxtil japonès amb recorregut virtual per escenes i punts clicables sobre les màquines. La pàgina consultada només té una imatge fixa, però el model de recorregut és útil. |

**Per trobar vídeos** (no s'han pogut verificar des d'aquí): cercar a YouTube «Helmshore spinning mule demonstration», «Quarry Bank mill weaving demonstration», «spinning jenny replica working» i «water frame working model». Serveixen per calcar el ritme, no per incrustar-los.

## 3. Pla proposat

### Principi: màquina sencera + lupa sincronitzada

Cada escena té dues capes que es mouen amb el mateix lliscador:

- **Màquina sencera**, amb una persona a escala treballant-hi. S'hi veu l'escala, la força que la mou i quants fils fa alhora.
- **Lupa circular** (medalló) sobre la zona on passa la innovació, ampliada 6–10 vegades, on el fil és gruixut i es veu estirar-se, torçar-se (ratlles en espiral que giren) i enrotllar-se. Una línia fina connecta la lupa amb el punt de la màquina.

Així se substitueixen els requadres estàtics actuals per una sola peça explicativa.

### Què ha de mostrar cada escena

| Escena | Lupa | Persona i escala | Correcció o novetat |
|---|---|---|---|
| Roda de filar | Punta del fus: el fil llisca per la punta (torçar) i després s'enrotlla al canviar l'angle | Una filadora asseguda, una mà a la roda i l'altra estirant | Fil llarg (un braç) en lloc d'un tram curt |
| Llançadora volant | La llançadora sortint de la caixa pel cop del taco | Teixidor amb una mà al cordill i l'altra al batà | Ordit dens i de color natural; trama d'un sol color fort |
| Spinning Jenny | La pinça estirant i els fusos torçant: 8 fils iguals alhora | Una persona movent la pinça amb una mà i la roda amb l'altra | Fusos en un extrem, com al gravat de Lowry; el comptador «1 persona = 8 fils» integrat a l'escena |
| Water Frame | Tres parells de corrons (cada un més ràpid) i l'aleta enrotllant sense parar | Una nena o un noi vigilant fils trencats (context mínim) | La roda hidràulica en una vista de fàbrica per eix, no enganxada al bastidor |
| Mula de Crompton | El fil allargant-se mentre el carro s'allunya: corrons + carro combinats | Un filador al capçal fix i el carro amb desenes de fusos | Verificar amb l'exemplar de Bolton on era la roda; més fusos al carro |
| Teler de Cartwright | Els tres moviments numerats al mateix punt de la tela | Una persona vigilant dos o més telers | Menys rètols simultanis; les fases s'il·luminen a la mateixa màquina |

### Tècnica: tres opcions

| Opció | Com | A favor | En contra |
|---|---|---|---|
| **A. SVG millorat** (continuació de l'actual) | Redibuixar a mà amb `materials.js`, en perspectiva 3/4 com els telers, i afegir la lupa en SVG | Lleuger, nítid a qualsevol mida, ja verificat a 1366 × 768 i mòbil | El realisme té sostre; feina molt laboriosa per a sis màquines |
| **B. Seqüència de fotogrames de Blender + capa SVG** (recomanada) | Renderitzar 24–36 fotogrames del cicle de cada model `.glb` ja fet, en WebP, sincronitzats amb el lliscador; a sobre, el fil, la lupa i els rètols en SVG | Realisme del 3D sense WebGL; segueix el camí ja provat al pilot de Watt (`prototips/watt-pilot/`, vaivé de 20 fotogrames) | Pes (cal comprimir: ~1–2 MB per escena); cal revisar abans la fidelitat dels models |
| C. Visor 3D en directe | Fer servir `visor-3d.html` com a vista principal | Ja existeix | Pesat per a PC antics i pissarra; menys control didàctic del que es veu |

**Recomanació:** opció B per a les cinc màquines de cotó, i la lupa sempre en SVG (perquè el fil necessita nitidesa i color didàctic). La roda de filar pot quedar en SVG millorat (opció A), perquè és senzilla.

### Ordre de treball

1. **Corregir els models de Blender** contrastant-los amb Rees i Baines: Jenny (posició dels fusos i de la pinça), mula (capçal fix i carro). Revisar les proporcions de la resta.
2. **Prototip amb una sola màquina**, la mula (la que té l'error més gran i el moviment més didàctic), a `prototips/cotó-mula/`. Felip el valida abans de continuar.
3. Estendre el model validat a Jenny, Water Frame, llançadora i Cartwright.
4. Figures humanes amb el mateix estil per a totes les escenes.
5. Verificació: `assets/verifica_visual.py`, captures a 1920 × 1080, 1366 × 768, mòbil i escalat al 125 % i 150 %; pes per escena i fluïdesa en un PC de l'escola.
6. Còpia de seguretat del pintor actual a `versions/` abans de substituir-lo, com a la revisió del 14-11-2026.

### Decisions pendents de Felip

- Opció tècnica (A, B o C) i si s'accepta el pes afegit de la B.
- Si les figures humanes han de ser realistes o siluetes estilitzades.
- Si la mula ha de ser la de Crompton (manual, 1779) o la selfactina posterior (més coneguda a Catalunya); el capítol parla de la de Crompton.

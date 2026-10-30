# Memòria Global del Projecte: aulaCreActiva

## Estat actual
- La targeta «Història de la Terra i del Mediterrani» de «Creació del Mediterrani» utilitza `targeta-historia-terra-mediterrania.jpeg`.
- La targeta «Plaques tectòniques» de «Creació del Mediterrani» utilitza `targeta-plaques-tectoniques.jpeg`.
- La targeta «Crisi salina del Messinià» de «Creació del Mediterrani» utilitza `targeta-crisi-salina-del-messinia.jpeg`.
- Les set targetes de fase de Mediterràniament tenen alçada uniforme; «Mar crítica», «ADN Mediterrani» i «Maqueta» tenen imatge i frase de subtítol.
- `AGENTS.md` conté les regles permanents; aquest fitxer conserva només l'estat, els riscos i els tres últims passos significatius.
- L'activitat d'Estris de laboratori és una activitat 3D compartida entre Biologia i Física i Química.
- El banc de laboratori inclou preguntes de noms, funcions, capacitats, materials, àcids, selecció 3D i comparació de volums.
- Física i Química té projectes per a 2n, 3r i 4t ESO amb un únic hub i una única activitat de laboratori reutilitzada; el laboratori de 2n mostra les targetes compartides d'Estris de laboratori i Microscopi òptic.
- El capçal de les activitats té una fletxa simple que restaura la vista anterior i una doble fletxa que torna al dashboard; la fletxa simple conserva el retorn anterior en navegació niada i substitueix els botons interns de retorn als menús.
- A Entorns de Natura, el capçal mostra el nom del subprojecte o de l'activitat; s'han retirat els títols duplicats del cos de les activitats i dels subprojectes.
- A Rates a la carrera, el títol de Preguntes investigables es mostra al capçal i no es repeteix al cos de l'activitat.
- A Mediterràniament, el capçal mostra el projecte o l'activitat (Capitals del Mediterrani, El Mar del Mig, Països del Mediterrani o Biodiversitat) sense repetir-ne el títol al contingut.
- A Capitals s'ha retirat la instrucció groga que quedava massa ampla; els controls de pràctica continuen disponibles.
- Els botons de modes i d'amagar el país al Mapa del Mediterrani tenen una alçada mínima igual a la del botó «Començar Test» d'El Mar del Mig.
- Al Mapa del Mediterrani, la instrucció per seleccionar el país de la bandera es mostra a dalt; el missatge inferior queda reservat al feedback de la resposta.
- Al Mapa del Mediterrani, puntuació i temps comparteixen la fila superior dels controls; els espais verticals s'han reduït perquè el mapa quedi més amunt.
- Al Mapa del Mediterrani, el feedback de resposta («Correcte»/«Incorrecte») apareix a la dreta de la bandera.
- Els botons del Mapa del Mediterrani mantenen una amplada ajustada al text quan s'activa Pràctica o Examen.
- La bandera i el nom del país es mostren centrats damunt del mapa.
- En respondre al Mapa del Mediterrani, la bandera i el nom es mantenen fixos; només el país clicat s'il·lumina breument en verd o vermell.
- Quadern de bitàcola és una activitat activa de Presentació; de moment només mostra la introducció i `jove-mariner-quader-bitacola.jpeg`. Les seccions de característiques, treball en grup i seguiment docent s'han retirat a petició de l'usuari. La introducció indica que cal mantenir-lo al dia en finalitzar cada tasca i tenir-lo llest abans de la següent.
- La targeta de fase «Mar entre terres» de Mediterràniament utilitza `targeta_mediterraniament.jpeg`.
- La targeta «Xarxa de pescador» de les Activitats inicials utilitza `targeta-xarxa-pescador.jpeg`; l'activitat continua marcada com a pendent.
- La targeta «Postal d'estiu» de les Activitats inicials utilitza `targeta-postal-estiu.jpeg`; l'activitat continua marcada com a pendent.
- La targeta «El teu mar» de les Activitats inicials utilitza `targeta-el-teu-mar.jpeg`; l'activitat continua marcada com a pendent.
- El nom visible de la targeta «El meu mar» s'ha canviat per «El teu mar» i les traduccions s'han ajustat; l'identificador intern resta `el-meu-mar`.
- El test d'El Mar del Mig manté el vídeo en una columna al costat de les preguntes perquè no desaparegui avall quan comença el qüestionari; en mòbil, el vídeo apareix abans del test.
- El repàs de magnituds i prefixos del SI és una activitat de 2n d'ESO; es desa una puntuació acumulada quan l'alumne finalitza la pràctica.
- Factors de conversió és una activitat de 2n d'ESO amb rondes de 10 exercicis i desament automàtic de la puntuació final; el nivell avançat practica densitats i el banc de factors es mostra agrupat per magnitud.
- Representació gràfica és una activitat de 2n d'ESO amb rondes de cinc gràfics de dades, puntuació sobre 10 i desament automàtic en acabar.
- Els models i les dades del laboratori viuen a `assets/models/estris-laboratori/`.
- La targeta `Microscopi òptic` del laboratori obre directament l'activitat 3D, que comparteix el model de `assets/models/microscopi-optic/`.
- El GLB del microscopi s'ha reexportat amb els materials clars reduïts un 18% per evitar saturació al visor web; conserva 179 nodes i totes les categories del JSON.
- El visor del microscopi inclou controls del revòlver i enfocament: el primer gira `MIC_Revolver` sobre Y de glTF i el segon mou `MIC_Suport_Enfocament` amb límits i comprovació de col·lisions.
- Ràdio té un projecte per a 1r ESO només amb Connexions i un projecte per a 2n ESO amb Connexions i Taula de So, compartint el mateix codi.
- Geologia i Ciències Ambientals té projectes per a 1r i 2n de batxillerat amb una única activitat compartida de Talls geològics i riscos (PAU): tres relleus procedurals, dos nivells, quatre fases guiades i desament via `saveResult`.
- La llavor, la versió i el desglossament del tall es conserven com a JSON a `feedback_pos`; els riscos d'aquesta versió són inundacions i avingudes. Documentació: `docs/talls-geologics.md`.
- Formulació inorgànica conserva la pàgina completa externa dins `assets/apps/formulacio-inorganica/`, amb 660 compostos, tres nivells, modes Aprèn/Practica/Repte i pont de desament a Aula CreActiva.
- El patró d'integració d'aplicacions externes està documentat a `.agents/skills/integrar-app-externa/SKILL.md`, amb aïllament per iframe, pont de resultats i checklist de riscos.
- La guia pública de l'arquitectura i els pendents és `docs/integracio-aplicacions-externes.md`.
- Mediterraniament té una nova targeta pare de Creació del Mar Mediterrani amb submenú propi, vídeo de plaques tectòniques i dos placeholders pendents.
- El submenú de Creació del Mar Mediterrani mostra directament només les tres targetes; no hi afegeix cap subtítol ni introducció interna perquè el títol ja és al capçalera global.
- El submenú Creació del Mar Mediterrani incorpora Història de la Terra i del Mediterrani amb 164 preguntes locals, quatre nivells (1r ESO, 4t ESO, 1r i 2n Batxillerat), quatre temes i opció de temes barrejats; cada combinació nivell-tema té com a mínim deu preguntes.
- Mediterràniament mostra ara quatre targetes grans de fase amb els noms curts «Presentació», «Activitats inicials», «Vora mar» i «Mar entre terres»; les capçaleres internes fan servir els noms complets amb «Mediterràniament - ...».
- Mediterràniament inclou tres fases noves separades després de «Mar entre terres»: «Mar crítica», «ADN Mediterrani» i «MAQUETA»; Mar crítica utilitza `targeta-mar-critica.jpeg`, i les fases noves encara no tenen activitats associades.
- Vora mar mostra dues targetes en aquest ordre: Mars i oceans, amb preguntes, vídeo de 3Cat i la imatge `targeta-mars-i-oceans.jpeg`, i Països banyats pel Mediterrani, amb la imatge `targeta-paisos-banyats-pel-mediterrani.jpeg`, que obre un submenú amb Països del Mediterrani i Capitals del Mediterrani.
- En obrir un submenú intern com Països banyats pel Mediterrani, no s'ha de repetir la capçalera ni la descripció de la fase Vora mar.
- El submenú de Països banyats pel Mediterrani mostra directament les targetes Països del Mediterrani i Capitals del Mediterrani, sense repetir-ne el títol.
- La fase Presentació utilitza `targeta-presentacio.jpeg`; la targeta «Presentació del projecte» continua amb `targeta-mediterraniament-presentacio.jpeg`.
- La fase «Activitats inicials» utilitza `targeta-activitats-inicials.jpeg` com a imatge de fons.
- La targeta principal del projecte Mediterraniament al dashboard utilitza `targeta-mediterraniament.jpeg`.
- La targeta de fase «Mar entre terres» utilitza `targeta-mar-entre-terres.jpeg` com a fons; els quatre títols de fase comparteixen tipografia serif i mida gran, mentre que «Vora mar» i «Mar entre terres» també són centrats.
- Dins dels submenús de fase no es repeteixen les capçaleres ni les descripcions; es mostren directament les targetes i el nom complet queda al capçal global.
- Activitats inicials mostra quatre targetes en aquest ordre: Xarxa de pescador, Postal d'estiu, El meu mar i El Mar del Mig; les tres primeres són pendents.
- Mar entre terres mostra tres targetes en aquest ordre: Creació del Mediterrani, Com és el Mediterrani i Biodiversitat del Mediterrani; les dues primeres utilitzen les imatges pròpies i «Com és el Mediterrani» continua marcada com a pendent.
- Les quatre targetes grans de fase utilitzen imatges de fons que ocupen tota la targeta, amb una capa d'ombra per garantir la lectura del text.

## Riscos oberts
- Cal comprovar el desament real dels talls geològics després del desplegament d'Apps Script i la interacció en dispositiu tàctil físic; la prova en navegador ha interceptat el backend.
- El backend de resultats no és idempotent: una resposta perduda seguida d'un reintent pot duplicar una fila.
- La prova de navegador ha detectat l'error preexistent `Cannot access 'RIVER_HYPOTHESES' before initialization` en carregar els scripts globals; no ha impedit el flux de talls geològics.
- Cal fer una prova manual de la navegació del laboratori des dels tres projectes de Física i Química i comprovar el retorn al menú.
- Cal fer una prova manual del gir del revòlver, l'arrossegament dels quatre comandaments i la col·lisió amb els objectius en dispositius tàctils.
- Cal comprovar manualment l'accés al repàs del SI des del menú de 2n i confirmar que no apareix a 3r ni a 4t d'ESO.
- Cal provar manualment els dos botons de retorn en activitats de Biologia, Física i Química i el laboratori compartit.
- Cal comprovar manualment l'accés a Factors de conversió i l'arrossegament de targetes en dispositius tàctils.
- Cal provar manualment que les targetes compartides d'Estris i Microscopi obren l'activitat correcta a Física i Química de 2n i que els botons de retorn tornen al menú de laboratori.
- Cal fer una prova manual de Representació gràfica amb alumnat, especialment la tolerància dels punts a mòbil i el desament real de la nota.
- Cal desplegar Apps Script després dels canvis de `api/Projects.gs`.
- El catàleg del backend encara ha d'incorporar els projectes de Física i Química per mantenir-se coherent amb el catàleg local.
- La carpeta `assets/models/estris-laboratori/reixeta/` és un canvi local pendent d'integració i no s'ha modificat.
- Cal fer una prova manual de l'iframe de Formulació inorgànica, especialment el repte, el pont de resultats, el retorn i la visualització en mòbil.
- Cal confirmar manualment que el mode immersiu de Formulació ocupa tota la zona sota el capçalera i no genera doble scroll en ordinador i mòbil.

## Tres últims passos

### 2026-10-30 - Imatge de la targeta Història de la Terra i del Mediterrani
- Connectada `targeta-historia-terra-mediterrania.jpeg` a la targeta corresponent de «Creació del Mediterrani».
- Substituït el gràfic decoratiu mantenint el títol, la descripció i la navegació.
- Validats l'asset, l'estructura HTML i el diff.

### 2026-10-30 - Imatge de la targeta Crisi salina del Messinià
- Connectada `targeta-crisi-salina-del-messinia.jpeg` a la targeta corresponent de «Creació del Mediterrani».
- Substituït el gràfic decoratiu mantenint el títol, la descripció i la navegació.
- Validats l'asset, l'estructura HTML i el diff.

### 2026-10-30 - Imatge de la targeta Plaques tectòniques
- Connectada `targeta-plaques-tectoniques.jpeg` a la targeta «Plaques tectòniques» de «Creació del Mediterrani».
- Substituït el gràfic decoratiu de temps geològic per la imatge de portada.
- Validats l'asset, l'estructura HTML i el diff.
- Validada la configuració JavaScript i el diff.

### 2026-10-30 - Imatge i títol de la fase Maqueta
- Connectada `targeta-maqueta.jpeg` com a fons de la fase «Maqueta» i ajustat el títol amb només la primera lletra en majúscula.
- Mantinguts la mida, el títol i la navegació de la targeta.
- Validats l'asset, la configuració JavaScript i el diff.

### 2026-10-30 - Mida uniforme i imatge de la fase ADN Mediterrani
- Donada a totes les targetes de fase una alçada igual, també en la graella mòbil.
- Connectada `targeta-adn-mediterrani.jpeg` com a fons de la fase «ADN Mediterrani».
- Validats l'asset, la configuració JavaScript i els estils.

### 2026-10-30 - Imatge de la fase Activitats inicials
- Connectada `targeta-activitats-inicials.jpeg` a la targeta de fase «Activitats inicials».
- Mantinguts el títol, la descripció i la navegació de la fase.
- Validats l'asset, la configuració JavaScript i el diff.

### 2026-10-30 - Imatge de la fase Mar entre terres
- Connectada `targeta-mar-entre-terres.jpeg` a la targeta «Mar entre terres».
- Substituït el fons anterior de Biodiversitat, mantenint el títol i la navegació.
- Validats l'asset, la configuració JavaScript i el diff.


### 2026-10-30 - Il·lustració inicial del quadern
- Afegida `jove-mariner-quader-bitacola.jpeg` a l'inici de l'activitat, abans de l'explicació.
- La imatge es mostra sencera i centrada perquè es vegin les dues escenes i el títol.
- Validats la referència de l'arxiu, l'estructura del fragment i els estils.

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
- S'ha afegit el projecte «Física 1r Batxillerat» amb un hub de cinc targetes: Cinemàtica, Dinàmica, Treball i energia, Camp gravitatori i Camp elèctric.
- Les targetes de Física de Batxillerat utilitzen il·lustracions SVG locals; Cinemàtica obre l'activitat de vector unitari i Dinàmica obre els diagrames de forces.
- Dinàmica és una reimplementació pròpia en català inspirada en l'activitat GPL-3.0 de diagrames de forces: escena SVG a l'esquerra, enunciat, selecció de forces, vectors arrossegables, pistes, correcció ponderada, informe adaptatiu i desament detallat al Sheets.
- Google Sheets mostra ara les condicions dels reptes de construcció de fórmules, inclosos els reptes booleans amb comparacions, i només les valida quan són visibles; els exercicis de càlcul no imposen requisits ocults.
- Google Sheets permet triar tipus d'exercici, dificultat i rondes de 10, 20, 30 o 40 preguntes; la ronda completa conserva la proporció 10 rangs, 15 fórmules i 15 referències.
- Les preguntes de referències de Google Sheets separen ara visualment les cel·les objectiu de les distractores en les quatre categories: relatives, absolutes, columna fixa i fila fixa.
- Les respostes booleanes `TRUE`, `FALSE`, `CERT` i `FALS` dels exercicis de fórmules es validen sense passar pel tokenitzador matemàtic, i mostren feedback quan són incorrectes.
- La targeta de Google Sheets descriu rangs, fórmules i referències; Google Docs mostra el seu logo local i continua marcat com a «Aviat».
- Google Sheets té ara un submenú propi amb la targeta «Rangs, fórmules i referències»; l'activitat només s'inicialitza en obrir aquesta targeta i el retorn simple conserva el menú intermedi.
- L'activitat «Rangs, fórmules i referències» mostra el títol global «Digitalització - Rangs, fórmules i referències» i ja no repeteix «Exercicis de Google Sheets» dins del fragment.
- Els exercicis de rangs inclouen selecció de columnes i files consecutives amb Maj/Clic i seleccions discontínues amb Ctrl/Cmd/Clic, mantenint també la selecció de rangs de cel·les.
- Els nivells mitjà i avançat de Rangs utilitzen graelles de 6-8 i 9-12 files/columnes; els reptes avançats poden demanar esborrar estructuralment files o columnes amb el menú contextual.
- El menú contextual dels reptes estructurals de Rangs és una finestra flotant i ofereix «Esborra la selecció» i «Amaga la selecció»; els exercicis d'amagar tenen correcció pròpia.
- Google Sheets desa ara a `feedback_pos` i `feedback_neg` el detall de cada resposta finalitzada, amb tipus, dificultat, enunciat, resposta i resposta esperada; la pantalla final també mostra el resum d'encerts i errors.
- Les pistes de combinació de clics dels exercicis de selecció de files i columnes només es mostren al nivell inicial; els nivells mitjà i avançat només indiquen la selecció objectiu.
- La selecció discontínua de files i columnes processa `Ctrl/Cmd` en `pointerdown` i evita duplicar l'acció en el `click`, per mantenir la selecció múltiple en navegadors que perden el modificador.
- El catàleg local i `api/Projects.gs` mostren «Digitalització» amb accent; després del canvi d'Apps Script cal desplegar una nova versió de la Web App.
- S'ha afegit el projecte «Música 1r ESO» amb una targeta de projecte il·lustrada i un hub amb la targeta pendent «Pentagrama», també amb il·lustració SVG local.
- Pentagrama és ara una activitat autocorregible amb tres pentagrames de quinze notes, dificultats Iniciació/Intermedi/Avançat, claus de Sol/Fa/Do, alteracions, pistes i desament de resultats amb `callApi('saveResult', ...)`.
- Corregit l'error crític d'inicialització de `RIVER_HYPOTHESES`; les hipòtesis generals i les específiques del Projecte Rius ara es combinen en una única matriu inicialitzada abans d'utilitzar-la.
- Corregida la navegació de «Rols tròfics»: `app.js` ara crida `initRolsActivity()`, que és la funció d'inicialització existent.
- Consolidada la navegació d'Entorns de Natura a `app.js`; s'han eliminat les còpies globals de `showNaturaMenu()`, `openNaturaProject()` i `openNaturaActivity()` dels fitxers de projecte i de Xarxes Tròfiques.
- El desament de `saveResult` ara genera i conserva `resultat_id`, crea la columna al final de `resultats` si cal i rebutja reintents duplicats dins del bloqueig d'escriptura.
- `getCardAvailabilityIds()` reconeix ara les targetes de Física i Química, Física de Batxillerat, Geologia i Música, inclosa Formulació inorgànica.
- Les càrregues inicials de login i dashboard ara mostren un error visible en català amb botó de reintent quan fallen, en lloc de deixar només un error a la consola.
- La sessió recuperada de `localStorage` es valida abans de carregar el dashboard; si és JSON corrupte o no conté un correu, es descarta i es mostra el login.
- La vista de Pentagrama ocupa tota l'amplada disponible i els 15 desplegables de cada pentagrama queden alineats sota les notes, sense textos visibles repetits de «Pentagrama, nota».

## Riscos oberts
- Cal comprovar el desament real dels talls geològics després del desplegament d'Apps Script i la interacció en dispositiu tàctil físic; la prova en navegador ha interceptat el backend.
- Cal provar en Apps Script el nou control d'idempotència de `saveResult`, inclòs el primer desament que crea la columna `resultat_id` i un reintent del mateix objecte.
- L'error `Cannot access 'RIVER_HYPOTHESES' before initialization` ha estat corregit; cal repetir la prova global del navegador per confirmar que no queda cap error de càrrega relacionat.
- Cal fer una prova manual de la navegació del laboratori des dels tres projectes de Física i Química i comprovar el retorn al menú.
- Cal fer una prova manual del gir del revòlver, l'arrossegament dels quatre comandaments i la col·lisió amb els objectius en dispositius tàctils.
- Cal comprovar manualment l'accés al repàs del SI des del menú de 2n i confirmar que no apareix a 3r ni a 4t d'ESO.
- Cal provar manualment els dos botons de retorn en activitats de Biologia, Física i Química i el laboratori compartit.
- Cal comprovar manualment l'accés a Factors de conversió i l'arrossegament de targetes en dispositius tàctils.
- Cal provar manualment que les targetes compartides d'Estris i Microscopi obren l'activitat correcta a Física i Química de 2n i que els botons de retorn tornen al menú de laboratori.
- Cal fer una prova manual de Representació gràfica amb alumnat, especialment la tolerància dels punts a mòbil i el desament real de la nota.
- Cal provar manualment Pentagrama amb 45 selectors, especialment el desplaçament horitzontal en mòbil, la lectura de les claus i el desament real amb un alumne autenticat.
- Cal desplegar Apps Script després dels canvis de `api/Projects.gs`.
- El catàleg del backend encara ha d'incorporar els projectes de Física i Química per mantenir-se coherent amb el catàleg local.
- La carpeta `assets/models/estris-laboratori/reixeta/` és un canvi local pendent d'integració i no s'ha modificat.
- Cal fer una prova manual de l'iframe de Formulació inorgànica, especialment el repte, el pont de resultats, el retorn i la visualització en mòbil.
- Cal confirmar manualment que el mode immersiu de Formulació ocupa tota la zona sota el capçalera i no genera doble scroll en ordinador i mòbil.
- Cal provar manualment la ronda de Cinemàtica, el percentatge sobre 50 apartats i el desament detallat al Sheets amb un alumne autenticat.
- Cal provar manualment Dinàmica en ratolí i tàctil, especialment els vectors sobre el SVG, el càlcul de la puntuació i el desament final al Sheets.

## Tres últims passos

### 2026-11-07 - Diagrames de forces de Dinàmica
- Activada la targeta Dinàmica i creat el fragment amb l'enunciat complet, escena SVG responsive i panell de resposta.
- Implementades deu situacions de forces, selecció, vectors arrossegables, guies, pistes, correcció ponderada i informe per categories amb selecció adaptativa.
- Connectat el desament final mitjançant `callApi('saveResult', ...)`, conservant respostes, vectors, errors i pistes en JSON.
- Corregida la composició de les escenes: el bloc toca el terra, s'hi mostren els eixos `x`/`y` i la velocitat `v`, i els eixos dels plans inclinats segueixen el pla i la normal.
- Centrats els eixos en el centre geomètric de la caixa i reduïda l'alçada del bloc per acostar el dibuix al model de referència.
- L'escena de pla inclinat s'ha aproximat a la referència aportada: triangle gris, bloc fi rotat, eixos horitzontal/vertical i paral·lel/perpendicular al pla, angle de 25°, velocitat `v` i acceleració `a`.
- Dinàmica presenta ara 10 situacions aleatòries diferents per partida, seleccionades del banc de preguntes sense repeticions, i desa aquesta configuració com a `random-10`.
- Corregida la geometria de les situacions de paret: el bloc queda en contacte amb la paret i el centre de les forces es desplaça al centre real del bloc.
- Activada la targeta «Treball mecànic» amb una reimplementació pròpia inspirada en la versió GPL-3.0: paper mil·limetrat canvas, vector `AB`, regla, transportador, calculadora, cinc apartats de resposta, sis exercicis aleatoris i desament final.

### 2026-11-10 - Reptes visibles de fórmules de Google Sheets
- Separats els bancs de preguntes de càlcul i de construcció de fórmules.
- Afegides consignes visibles per als operadors obligatoris, inclòs el repte de dos operadors de prioritat superior a la suma o la resta.
- Corregida la validació perquè analitzi els operadors tokenitzats i mostri feedback específic quan el resultat és correcte però falta un requisit.

### 2026-11-12 - Projecte Música 1r ESO
- Afegit `p1_musica` als catàlegs local i d'Apps Script per als formats `1r ESO` i `1ESO`.
- Creat el hub de Música amb la targeta pendent «Pentagrama» i connectada la navegació del dashboard.
- Afegides les il·lustracions SVG locals de Música i Pentagrama; validats la sintaxi JavaScript i el balanç de `div`.

### 2026-11-12 - Activitat Pentagrama
- Substituïda la targeta pendent per una activitat de lectura musical amb 3 pentagrames i 15 notes per pentagrama.
- Afegits selectors de resposta, generació procedural, tres nivells de dificultat, claus, línies addicionals, alteracions, pistes i feedback visual.
- Connectat el resultat a la sessió de login i a `saveResult`, amb bloqueig anti-duplicats, reintent manual i feedback JSON positiu/negatiu.
- Eixamplada la zona de treball i alineats els selectors de notes sota cadascuna de les 45 notes; s'ha eliminat el text visible repetitiu dels selectors.

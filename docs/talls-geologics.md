# Talls geològics i riscos (PAU)

## Accés i integració

- Projectes `batx1_ambientals` i `batx2_ambientals`, amb un únic hub a `fragments/projects/ciencies-ambientals/index.html`.
- Activitat `talls-geologics`, amb control de disponibilitat mitjançant `blockUnavailableActivity`.
- Motor pur: `js/activities/ciencies-ambientals/talls-geologics-model.js`.
- Interfície, textos i desament: `js/games/talls-geologics.js`.
- Català i castellà; les altres llengües de la plataforma tenen fallback explícit al català per a aquesta activitat.
- Cal desplegar una nova versió d'Apps Script pel canvi de catàleg a `api/Projects.gs`.

## Model didàctic, versió 1.0

La llavor, el nivell i la versió determinen la geometria. Coordenades en metres:
mapa de 400 × 280 m, nord a dalt, tall A–B a Y=110 m, corbes cada 10 m.
Les tres plantilles són vall en Y, vall central i turó central amb dues valls.
El terreny, els afloraments i els polígons del tall provenen de les mateixes funcions.
Les cotes del perfil van de 80 a 140 m, amb exageració vertical ×3 indicada.

El nivell bàsic té contacte horitzontal a 105, 110 o 115 m. L'avançat té un
pla inclinat amb direcció est/oest i angle explícit. Si la cota del contacte
coincideix amb una corba de nivell, en el nivell bàsic coincideixen en planta.
Els al·luvions omplen una incisió superficial de fins a 4 m, limitada a la
proximitat del drenatge. La línia discontínua és una convenció didàctica
explicada, no una afirmació de simbologia universal.

La identificació de torrents avalua una marca per branca prop d'A–B (±20 m
en Y i ±10 m en X respecte al tàlveg). Les marques repetides o incorrectes
redueixen la proporció d'encerts. Hi ha alternativa per coordenada X.
Les cotes es poden posar amb clic o entrada numèrica (ajust 1 m, tolerància ±5 m).
La interpolació de la resposta és cúbica monòtona, sense pics artificials.
El perfil i els contactes correctes es proporcionen després de fixar la fase
corresponent, per no acumular penalitzacions entre habilitats diferents.

En aquesta versió, poble i càmping són sempre en zones de vall amb al·luvions:
el risc avaluable és inundació/avinguda torrencial. Les dues mesures són
reubicació dels usos vulnerables i alerta/evacuació. No és un model hidràulic
ni delimita períodes de retorn. No genera encara casos avaluables de moviments
de vessant. L'equivalent sobre 2,50 és una adaptació de la nota, no un barem
oficial verificat d'una convocatòria PAU concreta.

## Puntuació i resultats

Perfil 3 punts, contactes 2,5, litologies 2, torrents 1, riscos 1,5.
Cada regió litològica té el mateix pes dins del seu apartat.
Es conserva la primera resposta de cada fase. Un intent complet es desa
automàticament en prémer «Corregir i desar puntuació».

`guardarPuntuacioTallGeologic` utilitza `callApi('saveResult', ...)`:

- Identitat, curs, grup i projecte capturats de la sessió en iniciar l'intent.
- Abans de desar es comprova que l'usuari i el projecte encara coincideixin.
- `puntuacio`: nota sobre 100 arrodonida, com Representació gràfica.
- `feedback_pos`: JSON amb `exercici_id`, `seed_escenari`, `versio`,
  `plantilla`, `punts_sobre_10`, `punts_pau_2_5` i `desglossament`.
- `feedback_neg`: identificadors dels apartats amb errors.
- Data del registre generada pel backend, sense nova ruta ni noves columnes.

El controlador bloqueja dobles clics i intents ja confirmats. Si el servidor
desa però la resposta es perd, el backend actual no garanteix idempotència:
un reintent podria duplicar la fila. La interfície ho indica en cas d'error.

## Verificació

```powershell
node tests/talls-geologics-model.test.cjs
node --check js/games/talls-geologics.js
node --check js/activities/ciencies-ambientals/talls-geologics-model.js
```

Les proves del motor cobreixen 600 escenaris (tres plantilles, dos nivells),
reproducció, geometria, coherència dels emplaçaments, puntuació perfecta i buida,
límits de tolerància, marques repetides i interpolació dels contorns.

Prova funcional: entrar des dels dos cursos, generar amb llavor `sinera-demo`,
completar les quatre fases amb ratolí/teclat, comprovar trames i superposició,
canviar a castellà, repetir en pantalla estreta i comprovar desament/error.
La prova automatitzada en Edge utilitzada durant la implementació intercepta
Apps Script: no introdueix files de prova al full real. El desament real i la
usabilitat amb dispositiu tàctil físic queden pendents de verificació docent.

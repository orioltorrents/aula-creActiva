# Integració d'aplicacions web externes

## Objectiu

Aula CreActiva pot incorporar aplicacions educatives completes creades fora del projecte sense haver de reescriure'n immediatament la interfície, el motor d'activitats o el catàleg de dades.

El primer cas és **Formulació inorgànica**, procedent de:

<https://github.com/felipsarroca/edu-apps/tree/main/FormulacioInorganica>

## Arquitectura

L'aplicació externa es conserva sencera dins d'una carpeta pròpia:

```text
assets/apps/formulacio-inorganica/
├── index.html
├── css/styles.css
├── js/app.js
├── js/formula.js
├── js/nomenclatura.js
├── js/exercicis.js
├── js/aprenentatge.js
├── assets/
├── docs/
└── scripts/
```

Aula CreActiva la mostra mitjançant un fragment molt petit:

```text
fragments/activities/fisica-quimica/formulacio-inorganica.html
└── iframe → assets/apps/formulacio-inorganica/index.html
```

El shell principal no copia els selectors interns ni els components de l'aplicació externa. Només controla el contenidor, la navegació, la sessió i el pont de resultats.

## Aïllament

### CSS

El CSS extern s'executa dins del document de l'iframe. Per això:

- Els selectors externs no modifiquen els components globals.
- Els tokens i resets d'Aula CreActiva no redissenyen l'aplicació externa.
- No cal prefixar manualment tots els selectors de l'aplicació importada.
- Els ajustos del shell es limiten a la mida, posició i comportament de l'iframe.

### JavaScript

El JavaScript extern també té el seu propi document i àmbit d'execució:

- Les variables internes no entren a l'àmbit de `js/app.js`.
- Els listeners de la pàgina externa no es registren al document principal.
- El shell no depèn de les funcions internes de l'activitat.
- La comunicació entre les dues aplicacions només es fa mitjançant un pont explícit.

## Flux de navegació

1. L'alumne entra al projecte de Física i Química.
2. El hub mostra la targeta **Formulació inorgànica**.
3. Aula CreActiva carrega el fragment de l'activitat.
4. El fragment mostra l'aplicació externa a pantalla completa sota el capçalera global.
5. La fletxa doble `«` del capçalera torna al menú anterior.
6. L'aplicació externa conserva els seus modes, filtres, nivells i progrés local.

El capçalera global disposa d'una acció de retorn configurable. Formulació la configura perquè torni al menú de Física i Química; si una activitat no defineix cap acció especial, es manté el retorn general al dashboard.

## Nivells i contingut

Formulació conserva el seu catàleg complet:

- 211 compostos de nivell fàcil, associats a 3r ESO.
- 261 compostos de nivell mitjà, associats a 4t ESO.
- 188 compostos de nivell de batxillerat.
- 10 famílies de compostos.
- Modes Aprèn, Practica i Repte.

El catàleg es valida amb el script original:

```powershell
node assets/apps/formulacio-inorganica/scripts/valida-dades.mjs
```

## Desament de resultats

El mode Repte té 10 preguntes i dos intents per pregunta:

- Primera resposta correcta: 2 punts.
- Segona resposta correcta: 1 punt.
- Dos errors: 0 punts.

Quan acaba el Repte:

1. L'aplicació externa calcula punts, intents, encerts i errors.
2. Crida `window.parent.aulaCreActivaSaveFormulacioResult(payload)`.
3. `js/app.js` afegeix l'alumne, curs, grup i projecte.
4. Es crida `callApi('saveResult', data)`.
5. `api/Results.gs` desa una fila a la pestanya `resultats`.

El resultat inclou:

- Email de l'alumne.
- Curs i grup.
- Projecte.
- Activitat.
- Nivells i famílies seleccionats.
- Puntuació sobre 100.
- Temps.
- Intents totals.
- Encerts a la primera i a la segona oportunitat.
- Preguntes fallades.

El detall estructurat es desa en JSON dins `feedback_pos` i `feedback_neg`.

El mode Practica conserva actualment el progrés al `localStorage` de l'aplicació externa. No desa una fila al full per cada resposta.

## Avantatges

- Conservació fidel de la pàgina original.
- Importació dels 660 compostos i de tota la lògica didàctica.
- Aïllament del CSS i JavaScript externs.
- Menys risc de regressions al shell principal.
- Actualitzacions de l'activitat més controlables.
- Reutilització del sistema existent de resultats.
- Patró aplicable a altres eines educatives externes.

## Problemes pendents

### Idempotència

Si Apps Script escriu una fila però la resposta es perd, un reintent pot duplicar el resultat. Caldria afegir un identificador de sessió i rebutjar duplicats al backend.

### Pràctica no centralitzada

Els intents del mode Practica es queden al navegador. Si es vol una anàlisi per alumne, caldria crear una sessió de pràctica i desar-ne un resum o una nova pestanya d'intents.

### Actualitzacions de l'origen

Si es torna a copiar la pàgina original, es poden perdre els canvis del pont de resultats. Cal revisar sempre el diff de `assets/apps/formulacio-inorganica/js/app.js` abans d'actualitzar-la.

### Cursos

El nivell de batxillerat existeix dins l'activitat, però encara cal decidir si s'ha de crear un projecte independent de Física i Química de 1r de Batxillerat al catàleg local i al backend.

### Comunicació entre finestres

Actualment el pont usa una funció directa de `window.parent` perquè l'iframe és same-origin. Si l'aplicació es publiqués en un domini diferent, caldria migrar a `postMessage` i validar `event.origin`.

### Proves manuals

Cal provar en navegador real:

- Ordinador i mòbil.
- Pantalla completa.
- Retorn amb la fletxa global.
- Repte complet i desament al full.
- Error de connexió i reintent.
- Canvi de nivell i família.
- Visualització del mode projector.

## Skill reutilitzable

La guia operativa per repetir aquest patró és:

`.agents/skills/integrar-app-externa/SKILL.md`

Inclou el procediment, el protocol de resultats, la checklist i les precaucions de llicència, manteniment, responsivitat i seguretat.

## Llicència

Formulació inorgànica declara llicència Creative Commons BY-NC-SA 4.0. Cal mantenir l'atribució a Felip Sarroca, conservar la referència a la llicència i respectar-ne les condicions quan es distribueixi l'adaptació.

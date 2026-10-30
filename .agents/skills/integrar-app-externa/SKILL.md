# Skill: integrar una aplicació web externa

## Quan fer-la servir

Fes servir aquesta skill quan s'hagi d'incorporar a Aula CreActiva una aplicació web completa que ja té el seu HTML, CSS, JavaScript, dades i recursos propis.

És especialment adequada quan es vol conservar la interfície original i evitar una reescriptura immediata del seu motor d'interacció.

## Arquitectura aplicada

La integració actual de Formulació inorgànica utilitza quatre capes:

```text
Aula CreActiva
├── fragments/activities/fisica-quimica/formulacio-inorganica.html
│   └── iframe de l'aplicació externa
├── css/pages/fisica-quimica-formulacio.css
│   └── mida i contenidor de l'iframe
├── js/app.js
│   └── navegació, sessió i pont de resultats
└── assets/apps/formulacio-inorganica/
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

L'aplicació externa conserva la seva pàgina, els seus selectors, el seu CSS, els seus mòduls ES i el seu `localStorage`. El shell principal només controla:

- Quan es mostra i s'amaga l'activitat.
- El retorn al menú anterior.
- La sessió actual d'Aula CreActiva.
- El desament dels resultats a Apps Script.

## Per què s'utilitza un iframe

Un iframe crea un context de document independent. Això evita que el CSS i el JavaScript de l'aplicació externa contaminin el shell principal.

### Aïllament CSS

- Les regles de `assets/apps/formulacio-inorganica/css/styles.css` només s'apliquen dins de l'iframe.
- Les regles de `css/style.css` no entren dins de l'aplicació externa.
- No cal prefixar manualment els més de dos mil selectors del CSS original.
- Els tokens, resets i components d'Aula CreActiva no poden alterar directament el disseny extern.

### Aïllament JavaScript

- Les variables de mòdul de l'aplicació externa no comparteixen l'àmbit lèxic amb `js/app.js`.
- Els listeners interns de l'aplicació externa no es registren al document principal.
- Els errors de l'aplicació externa queden confinats al document de l'iframe, excepte errors comunicats pel pont.

### Recursos relatius

Els fitxers externs es mantenen junts dins de `assets/apps/formulacio-inorganica/`. Això és important perquè els imports ES, les imatges, el CSS i els scripts de validació utilitzen rutes relatives.

No s'han de moure només alguns fitxers sense revisar totes les rutes relatives.

## Pont de resultats

El pont actual és intencionadament petit:

1. L'aplicació externa finalitza el Repte.
2. Calcula punts, estrelles, intents, encerts a la primera, encerts a la segona i errors.
3. Crida `window.parent.aulaCreActivaSaveFormulacioResult(payload)`.
4. `js/app.js` afegeix l'usuari, curs, grup i projecte actuals.
5. `callApi('saveResult', data)` envia el resultat a Apps Script.
6. `api/Results.gs` escriu una fila a `resultats` amb `withWriteLock` i `appendRow`.

El payload actual conté, com a mínim:

```js
{
    mode: 'repte',
    points: 0,
    maxPoints: 20,
    stars: 0,
    attempts: 0,
    firstCorrect: 0,
    secondCorrect: 0,
    missed: 0,
    levels: [1, 2],
    families: [],
    activity: 'barreja',
    results: [2, 1, 0]
}
```

El shell transforma `levels` en noms de curs i desa el detall com a JSON dins `feedback_pos` i `feedback_neg`. La puntuació es normalitza a 100 abans d'enviar-la.

## Avantatges

- Conserva la interfície original sense reimplementar-la.
- Permet importar una aplicació completa amb dades i validadores pròpies.
- Redueix el risc de conflictes CSS i JavaScript.
- Permet actualitzar l'activitat externa de forma més aïllada.
- Manté la navegació i la identitat d'Aula CreActiva.
- Reutilitza el `saveResult` existent sense crear una API específica per a cada aplicació.
- Facilita la incorporació de futures aplicacions educatives amb el mateix patró.

## Limitacions i riscos actuals

### Pont amb l'API global

El pont depèn del nom global `window.aulaCreActivaSaveFormulacioResult`. Si es canvia el nom, cal modificar l'aplicació externa i el shell.

Per a una integració més general, caldria definir un protocol únic, per exemple:

```js
window.parent.postMessage({
    type: 'aula-creactiva-result',
    app: 'formulacio-inorganica',
    payload
}, expectedOrigin);
```

El receptor hauria de validar sempre `event.origin` i `event.source`.

### Desament parcial

Actualment es desa el Repte complet, no cada resposta del mode Practica. Si cal analitzar cada intent individual, cal crear una pestanya o endpoint específic, perquè una fila per clic generaria soroll i dificultaria la idempotència.

### Idempotència

Si la resposta del backend es perd després d'escriure el full, un reintent pot crear una fila duplicada. El resultat hauria d'incorporar un `session_id` o `attempt_id` estable i Apps Script hauria de rebutjar duplicats.

### Progrés local

El `localStorage` de l'aplicació externa és local al navegador i no forma part del progrés central d'Aula CreActiva. Si es vol un progrés visible per al professorat, cal migrar-lo a un model de dades del backend.

### Cursos i nivells

Que l'aplicació mostri el nivell de Batxillerat no crea automàticament un projecte de Física i Química de Batxillerat al catàleg. El catàleg local i el backend s'han de mantenir coherents abans de publicar aquest accés com a projecte propi.

### Actualitzacions de l'origen

Si es tornen a copiar fitxers de l'aplicació externa, es poden perdre les modificacions del pont, el `package.json` local o els ajustos de compatibilitat. Cal revisar sempre el diff de:

- `assets/apps/.../js/app.js`
- `assets/apps/.../css/styles.css`
- `package.json`
- La llicència i l'atribució.

### Responsivitat

Hi ha dues capes de responsivitat: el shell de l'iframe i la pàgina externa. Cal provar ordinador, tauleta, mòbil, mode projector i pantalla completa. No s'ha d'intentar corregir el CSS intern des del pare amb selectors que travessin l'iframe.

### Accessibilitat

El `title` de l'iframe i la fletxa global de retorn són responsabilitat del shell. Els formularis, diàlegs, focus i missatges interns són responsabilitat de l'aplicació externa. Cal revisar-los per separat.

### Política de seguretat

L'iframe actual és same-origin perquè es serveix des del mateix projecte. Si l'aplicació es mou a un altre domini, el pont directe a `window.parent` deixarà de ser fiable i caldrà `postMessage` amb una llista d'orígens permesos.

## Procediment per a una nova aplicació externa

1. Revisar llicència, atribució, dependències i riscos de privacitat.
2. Importar l'aplicació sencera a `assets/apps/{id}/` sense barrejar-ne els fitxers amb `css/` o `js/` globals.
3. Comprovar les rutes relatives amb un servidor HTTP local.
4. Crear un fragment mínim amb un iframe i un `title` descriptiu.
5. Afegir una classe CSS del shell que controli només la mida i el posicionament de l'iframe.
6. Afegir la targeta i la navegació seguint el hub del projecte.
7. Definir un payload de resultats estable i documentat.
8. Connectar el payload a una acció backend existent abans de crear una acció nova.
9. Evitar desar cada esdeveniment si només cal una nota final.
10. Afegir identificadors de sessió abans d'implementar reintents automàtics.
11. Validar sintaxi dels mòduls, dades, HTML, càrrega HTTP i flux de retorn.
12. Fer proves manuals d'ordinador, mòbil, pantalla completa, sessió absent, error d'API i reintent.

## Checklist de validació

- [ ] La llicència i l'atribució són visibles i correctes.
- [ ] L'aplicació externa està confinada a la seva carpeta.
- [ ] El fragment principal només conté el wrapper i l'iframe.
- [ ] No hi ha selectors del CSS extern injectats al shell.
- [ ] Les rutes relatives funcionen amb servidor HTTP.
- [ ] El retorn del capçalera torna al menú esperat.
- [ ] El resultat inclou alumne, curs, grup, projecte i nivell.
- [ ] El Repte només es desa una vegada.
- [ ] Els errors de connexió mostren feedback i no confirmen un desament fals.
- [ ] El validador de dades extern passa.
- [ ] Es comprova el comportament en mòbil i pantalla completa.
- [ ] Els canvis locals del pont no es perden en actualitzar l'origen.

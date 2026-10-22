---
name: integrar-activitats-3d
description: Incorporar models GLB a una web educativa existent per explorar-los, seleccionar parts anatòmiques i corregir respostes. Aplicar especialment al model del bètid i a activitats d’identificació mitjançant clics.
---

# Activitat educativa: identifica les parts del bètid

## 1. Objectiu

Integrar a la web existent una activitat que permeti:

- Observar, girar i ampliar el bètid en 3D.
- Llegir una pregunta, com ara «Clica les brànquies».
- Seleccionar una part amb ratolí o pantalla tàctil.
- Rebre una resposta de correcte o incorrecte.
- Avançar entre preguntes i consultar el resultat final.

Adaptar l’activitat al disseny, la navegació i el sistema de
resultats de la web existent.

Abans de programar, inspeccionar el projecte i identificar
el framework i com estan implementades les altres activitats.
No assumir que la web utilitza React, WordPress o cap altra tecnologia.

## 2. Entendre els fitxers

### Betid.blend

És el projecte editable de Blender.

Utilitzar-lo per modificar geometria, materials i parts del model.
No cal carregar-lo al navegador.

### Betid_web.glb

És el model que ha de carregar la web.

GLB és el contenidor binari del format glTF 2.0. Pot contenir
geometria, materials, textures, jerarquia, metadades i animacions.

Aquest fitxer concret conté:

- 969.768 bytes: aproximadament 0,97 MB.
- 42 peces anatòmiques.
- 11 categories anatòmiques.
- 6 materials.
- Cap textura d’imatge.
- Cap animació.
- Cap càmera ni llum.
- Cap dependència externa ni compressió Draco.

Els colors procedeixen dels materials.
La web ha d’afegir la càmera, la il·luminació i els controls.

El GLB no conté l’activitat, la puntuació ni les respostes
executables: aquestes funcions corresponen al codi de la web.

### Anatomia_betid.json

Conté els noms de les parts, la correspondència amb el model
i les preguntes inicials.

Utilitzar-lo com a configuració de l’activitat, separada del visor.
Això permet canviar preguntes sense tornar a exportar el model.

## 3. Respectar els identificadors anatòmics

Cada peça del GLB conté aquestes propietats personalitzades:

- anatomy_id: categoria anatòmica.
- element_id: identificador d’una peça concreta.
- label_ca: nom que es pot mostrar a l’alumne.

En el GLB s’emmagatzemen dins d’extras.
Amb GLTFLoader es recuperen mitjançant object.userData.

Categories exactes d’aquest model:

| anatomy_id | Nom | Peces |
|---|---|---:|
| cap | Cap | 1 |
| ulls | Ulls compostos | 2 |
| antenes | Antenes | 2 |
| peces_bucals | Peces bucals | 1 |
| torax | Tòrax | 1 |
| esbossos_alars | Esbossos alars | 2 |
| potes | Potes | 6 |
| abdomen | Abdomen | 10 |
| branquies | Brànquies | 14 |
| cercs | Cercs laterals | 2 |
| filament_central | Filament caudal central | 1 |

Exemple:

{
  "anatomy_id": "branquies",
  "element_id": "branquia_1_E",
  "label_ca": "Brànquies"
}

Per preguntar «Clica les brànquies», acceptar qualsevol peça
amb anatomy_id igual a branquies.

No exigir una brànquia concreta si l’enunciat no ho demana.
No confondre els dos cercs laterals amb el filament central.

Les peces d’una pota estan unides: aquest model no permet
avaluar fèmur o tíbia com a zones independents.

## 4. Carregar el model a la web

Utilitzar Three.js i els complements GLTFLoader i OrbitControls,
tots de la mateixa versió.

Reutilitzar la instal·lació existent de Three.js si ja n’hi ha.
Fixar les dependències al fitxer de versions del projecte.

Ubicació orientativa dels recursos:

public/models/betid/Betid_web.glb
public/models/betid/Anatomia_betid.json

Adaptar les URL a la configuració real de la web.
En molts frameworks, public/ no forma part de la URL pública.

Carregar els fitxers per HTTP o HTTPS.
Preferir el mateix domini de la web per evitar problemes de CORS.

Exemple de càrrega dins d’un visor ja inicialitzat:

```js
import { GLTFLoader } from
  'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

try {
  const gltf = await loader.loadAsync(modelUrl);
  const model = gltf.scene;

  scene.add(model);
} catch (error) {
  mostrarError('No s’ha pogut carregar el model.');
}
```

Aquest fragment pressuposa una escena inicialitzada.
Completar-lo amb càmera, llums, renderer i controls.

Mostrar un estat de càrrega i un botó de reintent si falla.
Enquadrar automàticament el model segons els seus límits.

No interpretar les dimensions del fitxer com la mida real
de l’insecte: el model utilitza una escala didàctica.

## 5. Detectar la part seleccionada

Utilitzar Raycaster per trobar la superfície que queda
sota el punt on l’alumne ha clicat.

Calcular les coordenades respecte del canvas, no de tota
la finestra del navegador.

Una peça anatòmica pot carregar-se com un grup amb diverses
submalles de material. Per això, buscar anatomy_id també
als seus pares.

```js
function trobarPart(object, modelRoot) {
  let node = object;

  while (node) {
    if (typeof node.userData?.anatomy_id === 'string') {
      return node.userData;
    }

    if (node === modelRoot) break;
    node = node.parent;
  }

  return null;
}
```

Procediment:

1. Obtenir el rectangle del canvas amb getBoundingClientRect().
2. Convertir el clic a coordenades normalitzades entre -1 i 1.
3. Actualitzar les matrius de càmera i model.
4. Executar raycaster.setFromCamera().
5. Intersectar el model recursivament.
6. Agafar la primera superfície visible.
7. Resoldre la categoria amb trobarPart().
8. Comparar-la amb la resposta esperada.

Ignorar clics al fons.

No travessar una peça visible per seleccionar-ne una
que queda amagada darrere.

## 6. Separar clic i moviment

Girar el model no ha de comptar com una resposta.

Registrar pointerdown, pointermove i pointerup.

Acceptar una selecció només si:

- El gest correspon a un clic o toc.
- El desplaçament màxim és inferior a un llindar petit.
- No hi ha hagut un gest amb diversos dits.
- No s’ha cancel·lat el punter.
- La pregunta continua sent la mateixa.

Comprovar el desplaçament màxim durant tot el gest.
No comparar només el punt inicial i el final: l’alumne
pot arrossegar i tornar al mateix lloc.

## 7. Definir les preguntes i corregir

Utilitzar una estructura de pregunta com aquesta:

```json
{
  "id": "identificar-branquies",
  "prompt": "Clica les brànquies del bètid",
  "target_anatomy_id": "branquies"
}
```

La comprovació bàsica és:

```js
const correcta =
  partSeleccionada.anatomy_id ===
  pregunta.target_anatomy_id;
```

Abans d’iniciar l’activitat, comprovar que totes les
categories demanades existeixen al model.

Oferir dos modes:

- Explorar: clicar una part mostra el seu nom.
- Practicar: clicar una part respon la pregunta.

En el mode de pràctica, no mostrar la resposta simplement
passant el cursor per sobre.

## 8. Feedback i puntuació

Mostrar feedback amb text i color:

- Correcte: «Correcte!».
- Incorrecte: «Aquesta és una altra part. Torna-ho a provar».

Ressaltar la categoria seleccionada.

Clonar els materials abans de modificar-los: diverses peces
comparteixen material i un canvi podria afectar altres parts.
Restaurar l’aspecte original després del feedback.

Proposta de puntuació inicial:

- 1 punt per encertar al primer intent sense pista.
- Després d’un error o una pista, permetre continuar
  fins a trobar la resposta, però sense sumar aquell punt.
- Comptar separadament preguntes resoltes i encerts
  al primer intent.

Ignorar clics repetits sobre una pregunta ja resolta.

Avançar amb un botó «Següent».
Oferir «Torna a començar» al final i reiniciar tot l’estat.

Fer configurable aquesta política si la web ja té
un altre criteri de puntuació.

## 9. Integració amb els resultats de la web

Separar la representació 3D de la lògica educativa.

Organitzar el codi en:

- Visor: dibuix, càmera, controls i selecció.
- Activitat: preguntes, intents, pistes i puntuació.
- Resultats: connexió amb el sistema existent.

Registrar, quan pertoqui:

- Identificador d’activitat i versió del model.
- Identificador de pregunta.
- Categoria seleccionada.
- Resposta correcta o incorrecta.
- Número d’intent.
- Ús de pista.

Utilitzar l’API i l’autenticació que ja tingui la web.
No inventar un sistema de desament que no existeixi.

Distingir entre resultats en memòria, localStorage
i resultats desats al servidor.

## 10. Usabilitat i accessibilitat

Incloure:

- Gir i zoom amb ratolí i tacte.
- Restauració de la vista.
- Vistes dorsal i ventral.
- Botons amb focus visible.
- Feedback textual anunciat amb aria-live.
- Alternativa de selecció per teclat.
- Disseny adaptable a mòbil.

Per a peces petites, facilitar zoom i una vista guiada.
Les peces bucals necessiten una orientació adequada.

Si WebGL no està disponible, mostrar una explicació
i una alternativa amb imatge.

## 11. Verificació abans d’entregar

Comprovar:

- Càrrega correcta i error de càrrega.
- Correspondència entre GLB i JSON.
- Les 11 categories i les 42 peces anatòmiques.
- Clics sobre submalles amb identificador al pare.
- Encert, error, pista i reinici.
- Clic al fons sense penalització.
- Gir i zoom sense respondre accidentalment.
- Clics repetits sense duplicar punts.
- Ressaltat sense modificar altres peces.
- Funcionament en mòbil i amb teclat.
- Alliberament de recursos en sortir de l’activitat.

No assumir que hi haurà 42 objectes renderitzables:
les 42 peces del GLB contenen 97 primitives de material
i el carregador pot generar diverses submalles.

Entregar una explicació breu del que funciona,
què s’ha provat i quines connexions amb la web
encara queden pendents.
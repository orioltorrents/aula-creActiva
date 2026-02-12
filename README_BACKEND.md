# Configuració del Backend (Google Apps Script)

Perquè la web funcioni, necessitem un lloc on guardar les dades. Farem servir un Google Sheet amb un petit script.

## Pas 1: Preparar el Google Sheet

1.  Crea un **nou Full de Càlcul de Google** (Google Sheet).
2.  Posa-li el nom que vulguis, per exemple: `DB_Escola_Projectes`.
3.  Crea dues pestanyes (a baix a l'esquerra):
    *   **Pestanya 1**: Canvia-li el nom a `usuaris`.
    *   **Pestanya 2**: Canvia-li el nom a `resultats`.
4.  A la pestanya `usuaris`, escriu aquestes capçaleres a la fila 1 (A1:G1):
    *   `id` | `email` | `password` | `nom` | `cognoms` | `curs` | `grup`
5.  A la pestanya `resultats`, escriu aquestes capçaleres a la fila 1 (A1:J1):
    *   `timestamp` | `email` | `curs` | `projecte` | `app` | `nivell` | `puntuacio` | `temps_segons` | `feedback_pos` | `feedback_neg`
6.  Afegeix **almenys un usuari de prova** a la pestanya `usuaris`:
    *   Exemple: `1` | `alumne@escola.cat` | `1234` | `Joan` | `Garcia` | `1r ESO` | `A`

## Pas 2: Configurar l'Script

1.  Dins del Google Sheet, ve a: **Extensions** > **Apps Script**.
2.  S'obrirà una nova pestanya. Esborra tot el codi que hi ha a `Codi.gs` (o `Code.gs`).
3.  Copia el contingut del fitxer `api/Code.js` que tens en aquest projecte i enganxa'l allà.
4.  Mira la línia que diu: `const SHEET_ID = 'POSA_AQUI_EL_TEU_SHEET_ID';`
5.  Has de canviar `POSA_AQUI_EL_TEU_SHEET_ID` per l'ID real del teu full de càlcul.
    *   L'ID és la part llarga de la URL del full.
    *   Exemple URL: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5...LrOg/edit`
    *   L'ID és el text estrany entre `/d/` i `/edit`: `1BxiMVs0XRA5...LrOg`.

## Pas 3: Publicar l'API

1.  A l'editor d'Apps Script, clica el botó blau **Deploy** (o "Implantar") > **New deployment** ("Nova implantació").
2.  A la roda dentada ("Select type"), tria **Web app**.
3.  Configuració:
    *   **Description**: API Escola
    *   **Execute as**: `Me` (Jo) -> *Important!*
    *   **Who has access**: `Anyone` (Qualsevol) -> *Molt Important!* Perquè la web pugui accedir-hi sense, demanar login de Google al navegador.
4.  Clica **Deploy**.
5.  Et demanarà permisos ("Authorize access"). Dona-li, tria el teu compte, i si surt "Google hasn't verified this app", clica "Advanced" > "Go to... (unsafe)".
6.  Et donará una **URL** llarga que acaba en `/exec`. **COPIA AQUESTA URL**.

## Pas 4: Connectar amb el Frontend

1.  Ves al fitxer `js/app.js` del teu projecte web.
2.  Busca la variable `CONST_API_URL` (o similar) i enganxa-hi la URL que has copiat.

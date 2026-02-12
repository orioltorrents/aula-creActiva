/**
 * API Backend per a l'Escola Web App
 * 
 * INSTRUCCIONS:
 * 1. Crea un nou Google Sheet.
 * 2. Crea 2 pestanyes: "usuaris" i "resultats".
 * 3. A "usuaris", crea les capçaleres: id, email, password, cognoms, nom, curs, grup
 * 4. A "resultats", crea les capçaleres: timestamp, email, curs, projecte, app, nivell, puntuacio, temps_segons, feedback_pos, feedback_neg
 * 5. Obre Extensions > Apps Script.
 * 6. Copia aquest codi a "Codi.gs".
 * 7. Substitueix SHEET_ID pel teu ID del full de càlcul.
 * 8. Desplega com a aplicació web (Deploy > New deployment > type: Web App > Execute as: Me > Who has access: Anyone).
 */

const SHEET_ID = '1xFjjrZhBXZWlMkgARjrhQnZraRWS2uNUZfaNqvzQjV8'; // <--- IMPORTANT: CANVIAR AIXÒ

function doGet(e) {
    return handleRequest(e);
}

function doPost(e) {
    return handleRequest(e);
}

function handleRequest(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const action = e.parameter.action;

        // Si és POST, les dades poden venir al body
        let data = {};
        if (e.postData && e.postData.contents) {
            try {
                data = JSON.parse(e.postData.contents);
            } catch (err) {
                data = e.parameter; // Fallback per si no és JSON body
            }
        } else {
            data = e.parameter;
        }

        let result = {};

        if (action === 'login') {
            result = loginUser(data.email, data.password);
        } else if (action === 'getProjects') {
            result = getProjects(data.curs);
        } else if (action === 'saveResult') {
            result = saveResult(data);
        } else {
            result = { status: 'error', message: 'Acció desconeguda' };
        }

        return createJSONOutput(result);

    } catch (error) {
        return createJSONOutput({ status: 'error', message: error.toString() });
    } finally {
        lock.releaseLock();
    }
}

// --- FUNCIONS DE NEGOCI ---

function loginUser(email, password) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('usuaris');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Índexs de columnes
    const emailIdx = headers.indexOf('email');
    const passIdx = headers.indexOf('password');

    // Cerca d'usuari (ignorant majúscules/minúscules al mail)
    // Comencem a 1 per saltar capçaleres
    for (let i = 1; i < data.length; i++) {
        if (String(data[i][emailIdx]).toLowerCase() === String(email).toLowerCase() &&
            String(data[i][passIdx]) === String(password)) {

            // Usuari trobat
            const user = {};
            headers.forEach((header, index) => {
                if (header !== 'password') { // No enviem la contrasenya al client
                    user[header] = data[i][index];
                }
            });

            return { status: 'success', user: user };
        }
    }

    return { status: 'error', message: 'Credencials incorrectes' };
}

function getProjects(curs) {
    // Aquí definim els projectes hardcoded o els podem llegir d'una pestanya "projectes" si es vol dinàmic.
    // Per simplicitat i segons requisits, ho fem estàtic al backend per ara.

    const catalog = {
        // Formats estàndard
        '1r ESO': [
            { id: 'p1_rates', titol: 'Rates a la carrera', descripcio: 'Projecte de biologia i matemàtiques.' },
            { id: 'p1_mediterrani', titol: 'Mediterrani', descripcio: 'Història i geografia del mar Mediterrani.' }
        ],
        '2n ESO': [
            { id: 'p2_paralimpics', titol: 'Paralímpics', descripcio: 'Educació física i valors.' }
        ],
        '3r ESO': [
            { id: 'p3_solidart', titol: 'SolidArt', descripcio: 'Art i solidaritat.' }
        ],
        '4t ESO': [
            { id: 'p4_natura', titol: 'Entorns de Natura', descripcio: 'Medi ambient i sostenibilitat.' }
        ],
        // Aliases per si al Sheet posen "1ESO" en comptes de "1r ESO"
        '1ESO': [
            { id: 'p1_rates', titol: 'Rates a la carrera', descripcio: 'Projecte de biologia i matemàtiques.' },
            { id: 'p1_mediterrani', titol: 'Mediterrani', descripcio: 'Història i geografia del mar Mediterrani.' }
        ],
        '2ESO': [
            { id: 'p2_paralimpics', titol: 'Paralímpics', descripcio: 'Educació física i valors.' }
        ],
        '3ESO': [
            { id: 'p3_solidart', titol: 'SolidArt', descripcio: 'Art i solidaritat.' }
        ],
        '4ESO': [
            { id: 'p4_natura', titol: 'Entorns de Natura', descripcio: 'Medi ambient i sostenibilitat.' }
        ]
    };

    const projectes = catalog[curs] || [];

    return { status: 'success', projectes: projectes };
}

function saveResult(data) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('resultats');

    // Ordre: timestamp, email, curs, projecte, app, nivell, puntuacio, temps_segons, feedback_pos, feedback_neg
    const row = [
        new Date(),
        data.email,
        data.curs,
        data.projecte,
        data.app,
        data.nivell,
        data.puntuacio,
        data.temps_segons,
        data.feedback_pos,
        data.feedback_neg
    ];

    sheet.appendRow(row);
    return { status: 'success', message: 'Resultat guardat correctament' };
}

// --- UTILITATS ---

function createJSONOutput(object) {
    return ContentService.createTextOutput(JSON.stringify(object))
        .setMimeType(ContentService.MimeType.JSON);
}

// CORRECCIÓ CORS: Google Apps Script Web App no permet configurar capçaleres CORS directament en el `doGet`/`doPost`
// d'una manera que el navegador accepti en pre-flight (OPTIONS).
// PERÒ: Si es fa el desplegament "Who has access: Anyone", Google fa un redirect 302 que sol funcionar amb `fetch`
// si es segueixen les redireccions.
// El return JSON estàndard sol funcionar per GET/POST simple.

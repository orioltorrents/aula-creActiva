/**
 * API Backend per a l'Escola Web App
 * 
 * INSTRUCCIONS:
 * 1. Crea un nou Google Sheet.
 * 2. Crea les pestanyes: "usuaris", "resultats", "preguntes_natura", "resultats_rols" i "fases_impacte".
 * 3. A "usuaris", crea les capçaleres: id, email, password, cognoms, nom, curs, grup
 * 4. A "resultats", crea les capçaleres: timestamp, email, curs, projecte, app, nivell, puntuacio, temps_segons, feedback_pos, feedback_neg
 * 5. A "fases_impacte", crea les capçaleres: Ordre, Fase (fins a 10 files per l'activitat d'ordenació)
 * 6. Obre Extensions > Apps Script.
 * 7. Copia aquest codi a "Codi.gs".
 * 8. Substitueix SHEET_ID pel teu ID del full de càlcul.
 * 9. Desplega com a aplicació web (Deploy > New deployment > type: Web App > Execute as: Me > Who has access: Anyone).
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
        // Estratègia Robusta: Fusionar paràmetres de URL (e.parameter) i del Body (e.postData)
        let data = { ...e.parameter }; // Comencem amb els query params

        if (e.postData && e.postData.contents) {
            try {
                const bodyJson = JSON.parse(e.postData.contents);
                // Fusionem: El body té preferència si hi ha duplicats, però mantenim el que ja tenim
                data = { ...data, ...bodyJson };
            } catch (err) {
                // Si falla el parseig JSON, assumim que són paràmetres de formulari normals o text
                // No fem res, ens quedem amb e.parameter
            }
        }

        // Ara busquem l'acció al objecte fusionat
        const action = data.action;

        let result = {};

        if (action === 'login') {
            result = loginUser(data.email, data.password);
        } else if (action === 'getProjects') {
            result = getProjects(data.curs);
        } else if (action === 'saveResult') {
            result = saveResult(data);
        } else if (action === 'getNaturaQuestions') {
            result = getNaturaQuestions(data.ecosistema);
        } else if (action === 'saveNaturaQuizResult') {
            result = saveNaturaQuizResult(data);
        } else if (action === 'getImpactePhases') {
            result = getImpactePhases();
        } else if (action === 'getBiblioQuestions') {
            result = getBiblioQuestions();
        } else if (action === 'getRadioConfig') {
            result = getRadioConfig();
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
            { id: 'p2_paralimpics', titol: 'Paralímpics', descripcio: 'Educació física i valors.' },
            { id: 'p2_biologia', titol: 'Biologia', descripcio: 'Estudi dels éssers vius i el seu entorn.' },
            { id: 'p2_radio', titol: 'Ràdio', descripcio: 'Comunicació, locució i edició radiofònica.' }
        ],
        '3r ESO': [
            { id: 'p3_solidart', titol: 'SolidArt', descripcio: 'Art i solidaritat.' }
        ],
        '4t ESO': [
            { id: 'p4_natura', titol: 'Entorns de Natura', descripcio: 'Medi ambient i sostenibilitat.' },
            { id: 'p4_digitalitzacio', titol: 'Digitalització', descripcio: 'Eines i recursos digitals per al segle XXI.' }
        ],
        // Aliases per si al Sheet posen "1ESO" en comptes de "1r ESO"
        '1ESO': [
            { id: 'p1_rates', titol: 'Rates a la carrera', descripcio: 'Projecte de biologia i matemàtiques.' },
            { id: 'p1_mediterrani', titol: 'Mediterrani', descripcio: 'Història i geografia del mar Mediterrani.' }
        ],
        '2ESO': [
            { id: 'p2_paralimpics', titol: 'Paralímpics', descripcio: 'Educació física i valors.' },
            { id: 'p2_biologia', titol: 'Biologia', descripcio: 'Estudi dels éssers vius i el seu entorn.' },
            { id: 'p2_radio', titol: 'Ràdio', descripcio: 'Comunicació, locució i edició radiofònica.' }
        ],
        '3ESO': [
            { id: 'p3_solidart', titol: 'SolidArt', descripcio: 'Art i solidaritat.' }
        ],
        '4ESO': [
            { id: 'p4_natura', titol: 'Entorns de Natura', descripcio: 'Medi ambient i sostenibilitat.' },
            { id: 'p4_digitalitzacio', titol: 'Digitalització', descripcio: 'Eines i recursos digitals per al segle XXI.' }
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

function getNaturaQuestions(ecosistema) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('preguntes_natura');
    if (!sheet) return { status: 'error', message: 'Pestanya preguntes_natura no trobada' };

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const ecoIdx = headers.indexOf('Ecosistema');

    // Filtrar per ecosistema i saltar capçalera
    let filtered = data.slice(1).filter(row => row[ecoIdx] === ecosistema);

    // Aleatoritzar i agafar max 10
    filtered = filtered.sort(() => Math.random() - 0.5).slice(0, 10);

    const questions = filtered.map(row => {
        const q = {};
        headers.forEach((h, i) => q[h] = row[i]);
        return q;
    });

    return { status: 'success', questions: questions };
}


function getImpactePhases() {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('fases_impacte');
    if (!sheet) return { status: 'error', message: 'Pestanya fases_impacte no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a fases_impacte' };

    const headers = data[0];
    const ordreIdx = headers.indexOf('Ordre');
    const faseIdx = headers.indexOf('Fase');

    if (faseIdx === -1) return { status: 'error', message: 'Falta la columna Fase a fases_impacte' };

    const phases = data.slice(1)
        .filter(row => row[faseIdx])
        .map((row, i) => ({
            id: `impacte_${ordreIdx !== -1 && row[ordreIdx] ? row[ordreIdx] : (i + 1)}`,
            text: String(row[faseIdx]).trim(),
            order: ordreIdx !== -1 && row[ordreIdx] ? Number(row[ordreIdx]) : (i + 1)
        }))
        .sort((a, b) => a.order - b.order)
        .slice(0, 10)
        .map(({ id, text }) => ({ id, text }));

    return { status: 'success', phases: phases };
}

function saveNaturaQuizResult(data) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('resultats_rols');
    if (!sheet) return { status: 'error', message: 'Pestanya resultats_rols no trobada' };

    // Columnes: Timestamp, Email, ID pregunta, Règim alumne, Nivell alumne, Justificació, Punts Règim, Punts Nivell, Punts Just., Punts Total
    const row = [
        new Date(),
        data.email,
        data.questionId,
        data.regimAlumne,
        data.nivellAlumne,
        data.justificacio,
        data.puntuacioRegim,
        data.puntuacioNivell,
        data.puntuacioJustificacio,
        data.puntuacioTotal
    ];

    sheet.appendRow(row);
    return { status: 'success', message: 'Resposta guardada' };
}

function getBiblioQuestions() {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('bibliografia-APA');
    if (!sheet) return { status: 'error', message: 'Pestanya bibliografia-APA no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a bibliografia-APA' };

    const headers = data[0];
    const typeIdx = headers.indexOf('Tipus');
    const levelIdx = headers.indexOf('Nivell');
    const qIdx = headers.indexOf('Pregunta');
    const correctIdx = headers.indexOf('Correcta');

    // Marem les alternatives (Correcta + Incorrectes) enviant de la D fins a la H
    const questions = data.slice(1).map(row => {
        return {
            type: String(row[typeIdx]).trim(),
            level: String(row[levelIdx]).toLowerCase().trim(),
            q: row[qIdx],
            correct: row[correctIdx],
            alternatives: [row[3], row[4], row[5], row[6], row[7]]
                .filter(val => val !== undefined && val !== null && String(val).trim() !== "")
        };
    });

    return { status: 'success', questions: questions };
}

function getRadioConfig() {
    return {
        status: 'success',
        effects: [
            { id: '00', type: 'SMALL HALL' },
            { id: '10', type: 'SMALL ROOM' },
            { id: '13', type: 'MID ROOM' },
            { id: '27', type: 'SPRING' },
            { id: '36', type: 'REVERSE' },
            { id: '40', type: 'EARLY REFL' },
            { id: '50', type: 'DELAY' },
            { id: '59', type: 'ECHO' },
            { id: '66', type: 'FLANGER' },
            { id: '74', type: 'PITH SHIFT' },
            { id: '82', type: 'FLANGER & REVERB' },
            { id: '90', type: 'DELAY & GATED' },
            { id: '92', type: 'DELAY & CHORUS' },
            { id: '96', type: 'DELAY & PHASER' },
            { id: '98', type: 'DELAY & PITCH' }
        ]
    };
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

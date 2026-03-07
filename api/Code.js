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
        } else if (action === 'getRadioConnectionsQuestions') {
            result = getRadioConnectionsQuestions();
        } else if (action === 'getCirculatoriQuestions') {
            result = getCirculatoriQuestions();
        } else if (action === 'getTrQuestions') {
            result = getTrQuestions(data.tipusBatxillerat);
        } else if (action === 'getTrTemesQuestions') {
            result = getTrTemesQuestions(data.tipusBatxillerat);
        } else if (action === 'getNaturaPreguntes') {
            result = getNaturaPreguntes(data.tipusBatxillerat);
        } else if (action === 'getNaturaTemesQuestions') {
            result = getNaturaTemesQuestions(data.tipusBatxillerat);
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
            { id: 'p1_rates', titol: 'Rates a la carrera', descripcio: 'Projecte de biologia i matemàtiques.', imatge: 'assets/img/rates.png' },
            { id: 'p1_mediterrani', titol: 'Mediterrani', descripcio: 'Història i geografia del mar Mediterrani.', imatge: 'assets/img/mediterrani.png' }
        ],
        '2n ESO': [
            { id: 'p2_paralimpics', titol: 'Paralímpics', descripcio: 'Educació física i valors.', imatge: 'assets/img/paralimpics.png' },
            { id: 'p2_biologia', titol: 'Biologia', descripcio: 'Estudi dels éssers vius i el seu entorn.' },
            { id: 'p2_radio', titol: 'Ràdio', descripcio: 'Comunicació, locució i edició radiofònica.' }
        ],
        '3r ESO': [
            { id: 'p3_solidart', titol: 'SolidArt', descripcio: 'Art i solidaritat.', imatge: 'assets/img/solidart.png' }
        ],
        '4t ESO': [
            { id: 'p4_natura', titol: 'Entorns de Natura', descripcio: 'Medi ambient i sostenibilitat.', imatge: 'assets/img/natura.png' },
            { id: 'p4_digitalitzacio', titol: 'Digitalització', descripcio: 'Eines i recursos digitals per al segle XXI.' }
        ],
        // Batxillerat
        '1r Batxillerat': [
            { id: 'batx1_tr', titol: 'Treball de recerca', descripcio: 'Aprendre a formular bones preguntes investigables.', imatge: 'assets/images/targeta-tr.png' }
        ],
        '2n Batxillerat': [],
        // Aliases per si al Sheet posen "1ESO" en comptes de "1r ESO"
        '1ESO': [
            { id: 'p1_rates', titol: 'Rates a la carrera', descripcio: 'Projecte de biologia i matemàtiques.', imatge: 'assets/img/rates.png' },
            { id: 'p1_mediterrani', titol: 'Mediterrani', descripcio: 'Història i geografia del mar Mediterrani.', imatge: 'assets/img/mediterrani.png' }
        ],
        '2ESO': [
            { id: 'p2_paralimpics', titol: 'Paralímpics', descripcio: 'Educació física i valors.', imatge: 'assets/images/targeta-paralimpics.png' },
            { id: 'p2_biologia', titol: 'Biologia', descripcio: 'Estudi dels éssers vius i el seu entorn.' },
            { id: 'p2_radio', titol: 'Ràdio', descripcio: 'Comunicació, locució i edició radiofònica.' }
        ],
        '3ESO': [
            { id: 'p3_solidart', titol: 'SolidArt', descripcio: 'Art i solidaritat.', imatge: 'assets/img/solidart.png' }
        ],
        '4ESO': [
            { id: 'p4_natura', titol: 'Entorns de Natura', descripcio: 'Medi ambient i sostenibilitat.', imatge: 'assets/img/natura.png' },
            { id: 'p4_digitalitzacio', titol: 'Digitalització', descripcio: 'Eines i recursos digitals per al segle XXI.' }
        ],
        '1Batx': [
            { id: 'batx1_tr', titol: 'Treball de recerca', descripcio: 'Aprendre a formular bones preguntes investigables.', imatge: 'assets/images/targeta-tr.png' }
        ],
        '2Batx': []
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

    // Normalitzem headers (minúscules, trim, fora accents)
    const rawHeaders = data[0].map(h => String(h).replace(/^\uFEFF/, '').trim());
    const headers = rawHeaders.map(h =>
        h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    );

    const findIdx = (names) => {
        for (let name of names) {
            const norm = String(name).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const idx = headers.indexOf(norm);
            if (idx !== -1) return idx;
        }
        return -1;
    };

    // ✅ Aquests són els teus headers reals
    const typeIdx = findIdx(['Tipus de pregunta', 'Tipus', 'Tipo de pregunta', 'Tipo']);
    const levelIdx = findIdx(['Nivell', 'Nivel', 'Level']);
    const qIdx = findIdx(['Pregunta', 'Question']);
    const correctIdx = findIdx(['Correcta', 'Correct', 'Correcta ']);
    const wrong1Idx = findIdx(['Incorrecta1', 'Incorrecta 1', 'Incorrecta_1']);
    const wrong2Idx = findIdx(['Incorrecta2', 'Incorrecta 2', 'Incorrecta_2']);
    const wrong3Idx = findIdx(['Incorrecta3', 'Incorrecta 3', 'Incorrecta_3']);

    if (typeIdx === -1) return { status: 'error', message: 'Falta la columna "Tipus de pregunta"' };
    if (qIdx === -1) return { status: 'error', message: 'Falta la columna "Pregunta"' };
    if (correctIdx === -1) return { status: 'error', message: 'Falta la columna "Correcta"' };

    const questions = data.slice(1)
        .filter(row => row[qIdx] && String(row[qIdx]).trim() !== "")
        .map(row => {
            const type = String(row[typeIdx] ?? "").trim();
            const level = String(row[levelIdx] ?? "").trim(); // deixa'l tal qual ("Fàcil", "Difícil")
            const q = String(row[qIdx] ?? "").trim();
            const correct = String(row[correctIdx] ?? "").trim();

            const wrongs = [
                wrong1Idx !== -1 ? row[wrong1Idx] : "",
                wrong2Idx !== -1 ? row[wrong2Idx] : "",
                wrong3Idx !== -1 ? row[wrong3Idx] : ""
            ]
                .map(v => String(v ?? "").trim())
                .filter(v => v);

            const alternatives = [correct, ...wrongs].filter(v => v);

            return {
                // ✅ IMPORTANT: retorna també amb headers “compatibles” amb el teu frontend actual
                "Tipus de pregunta": type,
                "Nivell": level,
                "Pregunta": q,
                "Correcta": correct,
                "Incorrecta1": wrongs[0] || "",
                "Incorrecta2": wrongs[1] || "",
                "Incorrecta3": wrongs[2] || "",

                // ✅ i també en format normalitzat (per si el frontend llegeix .type/.level/.q)
                type,
                level,
                q,
                correct,
                alternatives
            };
        });

    return { status: 'success', questions };
}

function getTrTemesQuestions(tipusBatxillerat) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('temes-TR-preguntes');
    if (!sheet) return { status: 'error', message: 'Pestanya temes-TR-preguntes no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a temes-TR-preguntes' };

    const headers = data[0].map(h => String(h).toLowerCase().trim());

    // Busquem les columnes per nom (normalitzat)
    const temaIdx = headers.indexOf('tema');
    const tipusBtxIdx = headers.indexOf('tipus_batxillerat');

    const colIdxs = [];
    for (let i = 1; i <= 10; i++) {
        colIdxs.push({
            pIdx: headers.indexOf(`pregunta_${i}`),
            tIdx: headers.indexOf(`tipus_${i}`)
        });
    }

    if (temaIdx === -1 || colIdxs[0].pIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques (com a mínim cal "tema" i "pregunta_1") a temes-TR-preguntes' };
    }

    // Extracció de categories úniques (si no passem tipus)
    if (!tipusBatxillerat || tipusBatxillerat.trim() === '') {
        const categoriesSet = new Set();
        if (tipusBtxIdx !== -1) {
            for (let i = 1; i < data.length; i++) {
                const cat = String(data[i][tipusBtxIdx]).trim();
                if (cat) categoriesSet.add(cat);
            }
        }

        // Si no hi ha categories pero hi ha dades, oferim un botó "General" per poder jugar
        if (categoriesSet.size === 0 && data.length > 1) {
            categoriesSet.add('General');
        }

        return { status: 'success', categories: Array.from(categoriesSet) };
    }

    // Filtrar per temes vàlids (ignorarem les que estiguin buides de tema) i pel tipus de batxillerat demanat
    let questionsFiltered = data.slice(1).filter(row => {
        const hasTema = row[temaIdx] && String(row[temaIdx]).trim() !== '';

        // Si hem triat "General" i no hi havia categories, mostrem tot
        const isGeneralFallback = (tipusBatxillerat || "").toLowerCase() === 'general';
        const isTargetType = (tipusBtxIdx !== -1 && !isGeneralFallback)
            ? (String(row[tipusBtxIdx] || "").trim().toLowerCase() === String(tipusBatxillerat).toLowerCase())
            : true;

        return hasTema && isTargetType;
    });

    // Remenar aleatòriament els temes i quedar-nos amd 10 màxim
    questionsFiltered = questionsFiltered.sort(() => Math.random() - 0.5).slice(0, 10);

    const topics = questionsFiltered.map(row => {
        const tema = row[temaIdx];

        // Preparem l'array de preguntes
        let qs = [];
        for (let i = 0; i < 10; i++) {
            const idxs = colIdxs[i];
            qs.push({
                id: `q${i + 1}`,
                text: idxs.pIdx !== -1 ? String(row[idxs.pIdx]).trim() : '',
                type: idxs.tIdx !== -1 ? String(row[idxs.tIdx]).trim() : ''
            });
        }

        // Filtrem aquelles que no tinguin text per si un tema en té menys de 10
        qs = qs.filter(q => q.text && String(q.text).trim() !== '');

        // Barregem sempre les preguntes dins de l'array perquè no surtin ordenades per com estan a l'Excel
        qs = qs.sort(() => Math.random() - 0.5);

        return {
            tema: tema,
            preguntes: qs
        };
    });

    return { status: 'success', topics: topics };
}

function getTrQuestions(tipusBatxillerat) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('preguntes_investigables');
    if (!sheet) return { status: 'error', message: 'Pestanya preguntes_investigables no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a preguntes_investigables' };

    const headers = data[0].map(h => String(h).toLowerCase().trim());

    // Busquem les columnes per nom (normalitzat)
    const idIdx = headers.indexOf('id');
    const pqIdx = headers.indexOf('pregunta');
    const invIdx = headers.indexOf('investigable/no investigable');
    const tipusIdx = headers.indexOf('tipus_batxillerat');
    const raoIdx = headers.indexOf('perquè_no_investigable');
    const tipusErrorIdx = headers.indexOf('tipus_error');
    const escalaIdx = headers.indexOf('escala_tr');

    if (pqIdx === -1 || invIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques (cal "pregunta" i "investigable/no investigable")' };
    }

    // Filtrar per tipus_batxillerat (ignorarem les que estiguin buides de pregunta)
    let questionsFiltered = data.slice(1).filter(row => {
        const hasQuestion = row[pqIdx] && String(row[pqIdx]).trim() !== '';
        // Si no s'ha demanat cap tipus, tornem tot el que tingui pregunta. Si no, filtrem:
        const isTargetType = tipusBatxillerat ? (String(row[tipusIdx] || "").trim().toLowerCase() === String(tipusBatxillerat).toLowerCase()) : true;

        return hasQuestion && isTargetType;
    });

    // Remenar aleatòriament les preguntes i quedar-nos només amb les 15 primeres
    questionsFiltered = questionsFiltered.sort(() => Math.random() - 0.5).slice(0, 15);

    const questions = questionsFiltered.map(row => {
        return {
            id: idIdx !== -1 ? row[idIdx] : '',
            pregunta: row[pqIdx],
            investigable: row[invIdx],
            tipus_batxillerat: tipusIdx !== -1 ? row[tipusIdx] : '',
            perque_no_investigable: raoIdx !== -1 ? row[raoIdx] : '',
            tipus_error: tipusErrorIdx !== -1 ? row[tipusErrorIdx] : '',
            escala_tr: escalaIdx !== -1 ? row[escalaIdx] : ''
        };
    });

    // També obtenim els tipus de batxillerat disponibles (únics) de tot el full (ignorant blancs)
    const allCategories = new Set();
    if (tipusIdx !== -1) {
        data.slice(1).forEach(row => {
            const tipus = String(row[tipusIdx] || "").trim();
            if (tipus !== "" && row[pqIdx] && String(row[pqIdx]).trim() !== '') {
                // Afegim el text tal qual del sheet, la llista tindrà les majúscules segons convingui
                allCategories.add(tipus);
            }
        });
    }

    return { status: 'success', questions: questions, categories: Array.from(allCategories) };
}

function getCirculatoriQuestions() {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // Funció d'ajuda per trobar pestanya per nom (insensible a majúscules/espais)
    const findSheet = (name) => {
        const sheets = ss.getSheets();
        const norm = name.toLowerCase().trim();
        return sheets.find(s => s.getName().toLowerCase().trim() === norm);
    };

    const sheet = findSheet('aparell-circulatori');
    if (!sheet) return { status: 'error', message: 'Pestanya "aparell-circulatori" no trobada al Google Sheet' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'No hi ha dades a la pestanya "aparell-circulatori"' };

    const headers = data[0].map(h => String(h).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

    // Funció d'ajuda per trobar índex de columna per múltiples noms possibles
    const findIdx = (names) => {
        for (let name of names) {
            let norm = name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let idx = headers.indexOf(norm);
            if (idx !== -1) return idx;
        }
        return -1;
    };

    const typeIdx = findIdx(['Tipus de pregunta', 'Tipus pregunta', 'Tipus', 'Tipo de pregunta', 'Tipo pregunta', 'Tipo']);
    const levelIdx = findIdx(['Nivell', 'Nivel', 'Level']);
    const qIdx = findIdx(['Pregunta', 'Question']);
    const correctIdx = findIdx(['Correcta', 'Correct']);

    if (qIdx === -1 || correctIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques al Google Sheet (calen "Pregunta" i "Correcta")' };
    }

    const questions = data.slice(1)
        .filter(row => row[qIdx] && String(row[qIdx]).trim() !== "") // Ignorar files buides
        .map(row => {
            return {
                type: typeIdx !== -1 ? String(row[typeIdx] || "").trim() : "",
                level: levelIdx !== -1 ? String(row[levelIdx] || "").toLowerCase().trim() : "mixed",
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

function getRadioConnectionsQuestions() {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('preguntes_radio_conexions');
    if (!sheet) {
        // Fallback or development questions if sheet doesn't exist yet
        const defaultQuestions = [
            { id: 1, image: 'xlr_male.png', correct: 'XLR Mascle', alternatives: ['XLR Mascle', 'XLR Femella', 'Jack Mono', 'Jack Estèreo'] },
            { id: 2, image: 'xlr_female.png', correct: 'XLR Femella', alternatives: ['XLR Mascle', 'XLR Femella', 'Jack Mono', 'Jack Estèreo'] },
            { id: 3, image: 'jack_mono.png', correct: 'Jack 6.35mm Mono (TS)', alternatives: ['Jack 6.35mm Mono (TS)', 'Jack 6.35mm Estèreo (TRS)', 'Mini-Jack 3.5mm', 'RCA'] },
            { id: 4, image: 'jack_stereo.png', correct: 'Jack 6.35mm Estèreo (TRS)', alternatives: ['Jack 6.35mm Mono (TS)', 'Jack 6.35mm Estèreo (TRS)', 'Mini-Jack 3.5mm', 'RCA'] },
            { id: 5, image: 'minijack_trs.png', correct: 'Mini-Jack 3.5mm (TRS)', alternatives: ['Mini-Jack 3.5mm (TRS)', 'Mini-Jack 3.5mm amb micro (TRRS)', 'RCA', 'USB-C'] },
            { id: 6, image: 'minijack_trrs.png', correct: 'Mini-Jack 3.5mm amb micro (TRRS)', alternatives: ['Mini-Jack 3.5mm (TRS)', 'Mini-Jack 3.5mm amb micro (TRRS)', 'RCA', 'USB-C'] },
            { id: 7, image: 'rca_white_red.png', correct: 'RCA (L/R)', alternatives: ['RCA (L/R)', 'XLR', 'Jack', 'HDMI'] },
            { id: 8, image: 'usb_a.png', correct: 'USB Tipus A', alternatives: ['USB Tipus A', 'USB Tipus B', 'USB Tipus C', 'Micro-USB'] },
            { id: 9, image: 'usb_b.png', correct: 'USB Tipus B', alternatives: ['USB Tipus A', 'USB Tipus B', 'USB Tipus C', 'Micro-USB'] },
            { id: 10, image: 'usb_c.png', correct: 'USB Tipus C', alternatives: ['USB Tipus A', 'USB Tipus B', 'USB Tipus C', 'Micro-USB'] },
            { id: 11, image: 'hdmi.png', correct: 'HDMI', alternatives: ['HDMI', 'VGA', 'DVI', 'DisplayPort'] },
            { id: 12, image: 'toslink.png', correct: 'Toslink (Òptic)', alternatives: ['Toslink (Òptic)', 'Coaxial', 'SPDIF', 'Jack'] },
            { id: 13, image: 'speakon.png', correct: 'Speakon', alternatives: ['Speakon', 'Powercon', 'XLR', 'Jack'] },
            { id: 14, image: 'iec.png', correct: 'IEC (Alimentació PC)', alternatives: ['IEC (Alimentació PC)', 'Schuko', 'Powercon', 'C7 (8-fig)'] },
            { id: 15, image: 'schuko.png', correct: 'Schuko (Endoll domèstic)', alternatives: ['Schuko (Endoll domèstic)', 'IEC', 'Powercon', 'BNC'] },
            { id: 16, image: 'powercon.png', correct: 'Powercon', alternatives: ['Powercon', 'IEC', 'Schuko', 'Speakon'] },
            { id: 17, image: 'bnc.png', correct: 'BNC', alternatives: ['BNC', 'RCA', 'F-Connector', 'SMA'] },
            { id: 18, image: 'mid_cable.png', correct: 'MIDI (5-pin DIN)', alternatives: ['MIDI (5-pin DIN)', 'XLR', 'Mini-DIN', 'Firewire'] },
            { id: 19, image: 'micro_usb.png', correct: 'Micro-USB', alternatives: ['Micro-USB', 'Mini-USB', 'USB-C', 'Lightning'] },
            { id: 20, image: 'lightning.png', correct: 'Lightning', alternatives: ['Lightning', 'USB-C', 'Micro-USB', '30-pin Dock'] }
        ];
        return { status: 'success', questions: defaultQuestions };
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a preguntes_radio_conexions' };

    const headers = data[0];
    const imgIdx = headers.indexOf('Imatge');
    const correctIdx = headers.indexOf('Correcta');

    const questions = data.slice(1).map((row, index) => {
        return {
            id: index + 1,
            image: row[imgIdx],
            correct: row[correctIdx],
            alternatives: [row[1], row[2], row[3], row[4]] // Suposem que les opcions estan a les columnes B-E
                .filter(val => val !== undefined && val !== null && String(val).trim() !== "")
        };
    });

    return { status: 'success', questions: questions };
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
function getNaturaPreguntes(tipusBatxillerat) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('natura_preguntes');
    if (!sheet) return { status: 'error', message: 'Pestanya natura_preguntes no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a natura_preguntes' };

    const headers = data[0].map(h => String(h).toLowerCase().trim());
    const pqIdx = headers.indexOf('pregunta');
    const invIdx = headers.indexOf('investigable/no investigable');
    const tipusIdx = headers.indexOf('tipus_batxillerat');
    const raoIdx = headers.indexOf('perquè_no_investigable');

    if (pqIdx === -1 || invIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques a natura_preguntes' };
    }

    if (!tipusBatxillerat || tipusBatxillerat.trim() === '') {
        const categoriesSet = new Set();
        if (tipusIdx !== -1) {
            for (let i = 1; i < data.length; i++) {
                const cat = String(data[i][tipusIdx]).trim();
                if (cat) categoriesSet.add(cat);
            }
        }
        return { status: 'success', categories: Array.from(categoriesSet) };
    }

    let filtered = data.slice(1).filter(row => {
        const hasQ = row[pqIdx] && String(row[pqIdx]).trim() !== '';
        const isType = tipusIdx !== -1 ? (String(row[tipusIdx] || "").trim().toLowerCase() === String(tipusBatxillerat).toLowerCase()) : true;
        return hasQ && isType;
    });

    const questions = filtered.sort(() => Math.random() - 0.5).slice(0, 15).map(row => ({
        pregunta: row[pqIdx],
        investigable: row[invIdx],
        perque_no_investigable: raoIdx !== -1 ? row[raoIdx] : ''
    }));

    return { status: 'success', questions };
}

function getNaturaTemesQuestions(tipusBatxillerat) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('natura_temes');
    if (!sheet) return { status: 'error', message: 'Pestanya natura_temes no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a natura_temes' };

    const headers = data[0].map(h => String(h).toLowerCase().trim());
    const temaIdx = headers.indexOf('tema');
    const tipusBtxIdx = headers.indexOf('tipus_batxillerat');

    const colIdxs = [];
    for (let i = 1; i <= 10; i++) {
        colIdxs.push({
            pIdx: headers.indexOf(`pregunta_${i}`),
            tIdx: headers.indexOf(`tipus_${i}`)
        });
    }

    if (temaIdx === -1 || colIdxs[0].pIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques a natura_temes' };
    }

    if (!tipusBatxillerat || tipusBatxillerat.trim() === '') {
        const categoriesSet = new Set();
        if (tipusBtxIdx !== -1) {
            for (let i = 1; i < data.length; i++) {
                const cat = String(data[i][tipusBtxIdx]).trim();
                if (cat) categoriesSet.add(cat);
            }
        }
        if (categoriesSet.size === 0 && data.length > 1) categoriesSet.add('General');
        return { status: 'success', categories: Array.from(categoriesSet) };
    }

    let filtered = data.slice(1).filter(row => {
        const hasTema = row[temaIdx] && String(row[temaIdx]).trim() !== '';
        const isGen = tipusBatxillerat.toLowerCase() === 'general';
        const isType = (tipusBtxIdx !== -1 && !isGen) ? (String(row[tipusBtxIdx] || "").trim().toLowerCase() === String(tipusBatxillerat).toLowerCase()) : true;
        return hasTema && isType;
    });

    const topics = filtered.sort(() => Math.random() - 0.5).slice(0, 10).map(row => {
        let qs = [];
        for (let i = 0; i < 10; i++) {
            const idxs = colIdxs[i];
            if (idxs.pIdx !== -1 && String(row[idxs.pIdx]).trim()) {
                qs.push({
                    text: String(row[idxs.pIdx]).trim(),
                    type: idxs.tIdx !== -1 ? String(row[idxs.tIdx]).trim() : ''
                });
            }
        }
        return { tema: row[temaIdx], preguntes: qs.sort(() => Math.random() - 0.5) };
    });

    return { status: 'success', topics };
}

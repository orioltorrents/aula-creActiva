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
        } else if (action === 'getMediterraniBiodiversitatQuestions') {
            result = getMediterraniBiodiversitatQuestions();
        } else if (action === 'getCirculatoriQuestions') {
            result = getCirculatoriQuestions();
        } else if (action === 'getReproductorQuestions') {
            result = getReproductorQuestions();
        } else if (action === 'getImmunitariQuestions') {
            result = getImmunitariQuestions();
        } else if (action === 'getEndocriQuestions') {
            result = getEndocriQuestions();
        } else if (action === 'getLocomotorQuestions') {
            result = getLocomotorQuestions();
        } else if (action === 'getVistaQuestions') {
            result = getVistaQuestions();
        } else if (action === 'getOidaQuestions') {
            result = getOidaQuestions();
        } else if (action === 'getOlfacteQuestions') {
            result = getOlfacteQuestions();
        } else if (action === 'getGustQuestions') {
            result = getGustQuestions();
        } else if (action === 'getTacteQuestions') {
            result = getTacteQuestions();
        } else if (action === 'getTrQuestions') {
            result = getTrQuestions(data.subambit, data.tipusBatxillerat || data.ambit);
        } else if (action === 'getTrTemesQuestions') {
            result = getTrTemesQuestions(data.tipusBatxillerat || data.ambit);
        } else if (action === 'getNaturaPreguntes') {
            result = getNaturaPreguntes(data.subambit, data.tipusBatxillerat || data.ambit);
        } else if (action === 'getNaturaTemesQuestions') {
            result = getNaturaTemesQuestions(data.tipusBatxillerat || data.ambit);
        } else if (action === 'getSolidartQuadres') {
            result = getSolidartQuadres(data.dificultat);
        } else if (action === 'getSolidartQuadres2') {
            result = getSolidartQuadres2(data.dificultat);
        } else if (action === 'getDiagnosticQuestions') {
            result = getDiagnosticQuestions();
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
        // Batxillerat
        '1r Batxillerat': [
            { id: 'batx1_tr', titol: 'Treball de recerca', descripcio: 'Aprendre a formular bones preguntes investigables.' }
        ],
        '2n Batxillerat': [],
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
        ],
        '1Batx': [
            { id: 'batx1_tr', titol: 'Treball de recerca', descripcio: 'Aprendre a formular bones preguntes investigables.' }
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

function getTrQuestions(subambit, tipusBatxillerat) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('preguntes_investigables');
    if (!sheet) return { status: 'error', message: 'Pestanya preguntes_investigables no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a preguntes_investigables' };

    const headers = data[0].map(h => String(h).toLowerCase().trim());

    // Busquem les columnes per nom (normalitzat)
    const idIdx = headers.indexOf('id');
    const pqIdx = headers.indexOf('pregunta');
    const invIdx = headers.indexOf('investigable/no investigable');
    const subIdx = headers.indexOf('subambit');
    const tipusIdx = headers.indexOf('tipus_batxillerat');
    const raoIdx = headers.indexOf('perquè_no_investigable');
    const tipusErrorIdx = headers.indexOf('tipus_error');
    const escalaIdx = headers.indexOf('escala_tr');

    if (pqIdx === -1 || invIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques (cal "pregunta" i "investigable/no investigable")' };
    }

    // Step 1: No filters provided -> Return both lists of options
    if (!subambit && !tipusBatxillerat) {
        const subambitsSet = new Set();
        const ambitsSet = new Set();
        for (let i = 1; i < data.length; i++) {
            if (data[i][pqIdx]) {
                const s = String(data[i][subIdx] || "").trim();
                const a = String(data[i][tipusIdx] || "").trim();
                if (s) subambitsSet.add(s);
                if (a) ambitsSet.add(a);
            }
        }
        return {
            status: 'success',
            level: 'setup',
            subambits: Array.from(subambitsSet).sort(),
            ambits: Array.from(ambitsSet).sort()
        };
    }

    // Step 2: Filter and return questions
    let questionsFiltered = data.slice(1).filter(row => {
        const hasQuestion = row[pqIdx] && String(row[pqIdx]).trim() !== '';

        // "Barrejat" or "Mix" means no filtering
        const isMixSub = !subambit || subambit.toLowerCase() === 'mix' || subambit.toLowerCase() === 'barrejat';
        const isMixAmbit = !tipusBatxillerat || tipusBatxillerat.toLowerCase() === 'mix' || tipusBatxillerat.toLowerCase() === 'barrejat';

        const matchesSub = isMixSub ? true : (String(row[subIdx] || "").trim().toLowerCase() === String(subambit).toLowerCase());
        const matchesAmbit = isMixAmbit ? true : (String(row[tipusIdx] || "").trim().toLowerCase() === String(tipusBatxillerat).toLowerCase());

        return hasQuestion && matchesSub && matchesAmbit;
    });

    // Remenar i agafar 15
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

    return { status: 'success', level: 'questions', questions: questions };
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

function getEndocriQuestions() {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    const findSheet = (name) => {
        const sheets = ss.getSheets();
        const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-\s_]/g, "");
        const normTarget = normalize(name);
        return sheets.find(s => normalize(s.getName()) === normTarget) || sheets.find(s => s.getName().toLowerCase().trim() === name.toLowerCase().trim());
    };

    const sheet = findSheet('sistema-endocri');
    if (!sheet) return { status: 'error', message: 'Pestanya "sistema-endocri" no trobada al Google Sheet' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'No hi ha dades a la pestanya "sistema-endocri"' };

    const headers = data[0].map(h => String(h).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

    const findIdx = (names) => {
        for (let name of names) {
            let norm = name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let idx = headers.indexOf(norm);
            if (idx !== -1) return idx;
        }
        return -1;
    };

    const typeIdx = findIdx(['tipus de pregunta', 'tipus', 'tipo de pregunta']);
    const levelIdx = findIdx(['nivell', 'nivel', 'level']);
    const qIdx = findIdx(['pregunta', 'question']);
    const correctIdx = findIdx(['correcta', 'correct']);
    const wrong1Idx = findIdx(['incorrecta1', 'incorrecta 1', 'incorrecta_1']);
    const wrong2Idx = findIdx(['incorrecta2', 'incorrecta 2', 'incorrecta_2']);
    const wrong3Idx = findIdx(['incorrecta3', 'incorrecta 3', 'incorrecta_3']);

    if (qIdx === -1 || correctIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques al Google Sheet (calen "Pregunta" i "Correcta")' };
    }

    const questions = data.slice(1)
        .filter(row => row[qIdx] && String(row[qIdx]).trim() !== "") // Ignorar files buides
        .map(row => {
            const correct = row[correctIdx];
            const wrongs = [
                wrong1Idx !== -1 ? row[wrong1Idx] : "",
                wrong2Idx !== -1 ? row[wrong2Idx] : "",
                wrong3Idx !== -1 ? row[wrong3Idx] : ""
            ].filter(val => val !== undefined && val !== null && String(val).trim() !== "");
            
            return {
                type: typeIdx !== -1 ? String(row[typeIdx] || "").trim() : "",
                level: levelIdx !== -1 ? String(row[levelIdx] || "").toLowerCase().trim() : "mixed",
                q: row[qIdx],
                correct: correct,
                alternatives: [correct, ...wrongs]
            };
        });

    return { status: 'success', questions: questions };
}

function getLocomotorQuestions() {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    const findSheet = (name) => {
        const sheets = ss.getSheets();
        const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-\s_]/g, "");
        const normTarget = normalize(name);
        return sheets.find(s => normalize(s.getName()) === normTarget) || sheets.find(s => s.getName().toLowerCase().trim() === name.toLowerCase().trim());
    };

    const sheet = findSheet('aparell-locomotor') || findSheet('sistema-locomotor');
    if (!sheet) return { status: 'error', message: 'Pestanya "aparell-locomotor" no trobada al Google Sheet' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'No hi ha dades a la pestanya "aparell-locomotor"' };

    const headers = data[0].map(h => String(h).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

    const findIdx = (names) => {
        for (let name of names) {
            let norm = name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let idx = headers.indexOf(norm);
            if (idx !== -1) return idx;
        }
        return -1;
    };

    const typeIdx = findIdx(['tipus de pregunta', 'tipus', 'tipo de pregunta']);
    const levelIdx = findIdx(['nivell', 'nivel', 'level']);
    const qIdx = findIdx(['pregunta', 'question']);
    const correctIdx = findIdx(['correcta', 'correct']);
    const wrong1Idx = findIdx(['incorrecta1', 'incorrecta 1', 'incorrecta_1']);
    const wrong2Idx = findIdx(['incorrecta2', 'incorrecta 2', 'incorrecta_2']);
    const wrong3Idx = findIdx(['incorrecta3', 'incorrecta 3', 'incorrecta_3']);

    if (qIdx === -1 || correctIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques al Google Sheet (calen "Pregunta" i "Correcta")' };
    }

    const questions = data.slice(1)
        .filter(row => row[qIdx] && String(row[qIdx]).trim() !== "")
        .map(row => {
            const correct = row[correctIdx];
            const wrongs = [
                wrong1Idx !== -1 ? row[wrong1Idx] : "",
                wrong2Idx !== -1 ? row[wrong2Idx] : "",
                wrong3Idx !== -1 ? row[wrong3Idx] : ""
            ].filter(val => val !== undefined && val !== null && String(val).trim() !== "");
            
            return {
                type: typeIdx !== -1 ? String(row[typeIdx] || "").trim() : "",
                level: levelIdx !== -1 ? String(row[levelIdx] || "").toLowerCase().trim() : "mixed",
                q: row[qIdx],
                correct: correct,
                alternatives: [correct, ...wrongs]
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

function getRadioConnectionsQuestionsLegacy() {
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

function getRadioConnectionsQuestions() {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheetNames = ['radio_connectors', 'preguntes_radio_conexions'];
    let sheet = null;

    for (let i = 0; i < sheetNames.length; i++) {
        sheet = spreadsheet.getSheetByName(sheetNames[i]);
        if (sheet) break;
    }

    if (!sheet) {
        return {
            status: 'success',
            questions: [
                { id: 1, difficulty: '', image: 'xlr_male.png', topic: 'connectors', type: 'text', question: 'Quin connector es mostra?', correct: 'XLR Mascle', alternatives: ['XLR Mascle', 'XLR Femella', 'Jack Mono', 'Jack Estereo'], imageAlternatives: [] },
                { id: 2, difficulty: '', image: 'xlr_female.png', topic: 'connectors', type: 'text', question: 'Quin connector es mostra?', correct: 'XLR Femella', alternatives: ['XLR Mascle', 'XLR Femella', 'Jack Mono', 'Jack Estereo'], imageAlternatives: [] },
                { id: 3, difficulty: '', image: 'jack_mono.png', topic: 'connectors', type: 'text', question: 'Quin connector es mostra?', correct: 'Jack 6.35mm Mono (TS)', alternatives: ['Jack 6.35mm Mono (TS)', 'Jack 6.35mm Estereo (TRS)', 'Mini-Jack 3.5mm', 'RCA'], imageAlternatives: [] },
                { id: 4, difficulty: '', image: 'jack_stereo.png', topic: 'connectors', type: 'text', question: 'Quin connector es mostra?', correct: 'Jack 6.35mm Estereo (TRS)', alternatives: ['Jack 6.35mm Mono (TS)', 'Jack 6.35mm Estereo (TRS)', 'Mini-Jack 3.5mm', 'RCA'], imageAlternatives: [] }
            ]
        };
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a ' + sheet.getName() };

    const normalizedHeaders = data[0].map(normalizeRadioConnectionsHeader);
    const hasNewSchema = normalizedHeaders.indexOf('pregunta') !== -1 || normalizedHeaders.indexOf('resposta_correcta') !== -1;

    if (!hasNewSchema) {
        const originalHeaders = data[0];
        const imgIdx = originalHeaders.indexOf('Imatge');
        const correctIdx = originalHeaders.indexOf('Correcta');

        const legacyQuestions = data.slice(1).map((row, index) => {
            const correct = cleanRadioConnectionsCell(row[correctIdx]);
            return {
                id: index + 1,
                difficulty: '',
                image: cleanRadioConnectionsCell(row[imgIdx]),
                topic: '',
                type: 'text',
                question: 'Tria la resposta correcta:',
                correct: correct,
                alternatives: [row[1], row[2], row[3], row[4]]
                    .map(cleanRadioConnectionsCell)
                    .filter(value => value !== ''),
                imageAlternatives: []
            };
        }).filter(question => question.image && question.correct && question.alternatives.length >= 2);

        return { status: 'success', questions: legacyQuestions };
    }

    const difficultyIdx = normalizedHeaders.indexOf('dificultat');
    const imageIdx = normalizedHeaders.indexOf('nom_imatge');
    const topicIdx = normalizedHeaders.indexOf('tema');
    const typeIdx = normalizedHeaders.indexOf('tipus_pregunta');
    const questionIdx = normalizedHeaders.indexOf('pregunta');
    const correctIdx = normalizedHeaders.indexOf('resposta_correcta');
    const wrongIdxs = [
        normalizedHeaders.indexOf('incorrecta_1'),
        normalizedHeaders.indexOf('incorrecta_2'),
        normalizedHeaders.indexOf('incorrecta_3')
    ];
    const correctImageIdx = normalizedHeaders.indexOf('imatge_correcta');
    const wrongImageIdxs = [
        normalizedHeaders.indexOf('imatge_incorrecta_1'),
        normalizedHeaders.indexOf('imatge_incorrecta_2'),
        normalizedHeaders.indexOf('imatge_incorrecta_3')
    ];

    const questions = data.slice(1)
        .map((row, index) => {
            const type = typeIdx === -1 ? '' : cleanRadioConnectionsCell(row[typeIdx]);
            const isImageType = isRadioConnectionsImageQuestion({ type: type });
            const textCorrect = correctIdx === -1 ? '' : cleanRadioConnectionsCell(row[correctIdx]);
            const correctImage = correctImageIdx === -1 ? '' : cleanRadioConnectionsCell(row[correctImageIdx]);
            const correct = isImageType && !textCorrect ? correctImage : textCorrect;
            const rawWrongs = wrongIdxs.map(idx => idx === -1 ? '' : cleanRadioConnectionsCell(row[idx]));
            const wrongs = rawWrongs.filter(value => value !== '');
            const wrongImages = wrongImageIdxs.map(idx => idx === -1 ? '' : cleanRadioConnectionsCell(row[idx]));
            let imageAlternatives = [
                { text: textCorrect, value: correctImage || textCorrect, image: correctImage, correct: true }
            ].concat(rawWrongs.map((wrong, wrongIndex) => ({
                text: wrong,
                value: wrongImages[wrongIndex] || wrong,
                image: wrongImages[wrongIndex] || '',
                correct: false
            }))).filter(option => option.image !== '');

            if (isImageType && imageAlternatives.length < 2) {
                imageAlternatives = [correct].concat(wrongs)
                    .filter(value => isRadioConnectionsImageFile(value))
                    .map(value => ({
                        text: '',
                        value: value,
                        image: value,
                        correct: value === correct
                    }));
            }

            return {
                id: index + 1,
                difficulty: difficultyIdx === -1 ? '' : cleanRadioConnectionsCell(row[difficultyIdx]),
                image: imageIdx === -1 ? '' : cleanRadioConnectionsCell(row[imageIdx]),
                topic: topicIdx === -1 ? '' : cleanRadioConnectionsCell(row[topicIdx]),
                type: type,
                question: questionIdx === -1 ? 'Tria la resposta correcta:' : cleanRadioConnectionsCell(row[questionIdx]),
                correct: correct,
                alternatives: [correct].concat(wrongs).filter(value => value !== ''),
                imageAlternatives: imageAlternatives
            };
        })
        .filter(question => {
            if (!question.question || !question.correct) return false;
            if (isRadioConnectionsImageQuestion(question)) return question.imageAlternatives.length >= 2;
            return question.alternatives.length >= 2;
        });

    return { status: 'success', questions: questions };
}

function normalizeRadioConnectionsHeader(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s-]+/g, '_');
}

function cleanRadioConnectionsCell(value) {
    return String(value === undefined || value === null ? '' : value).trim();
}

function isRadioConnectionsImageQuestion(question) {
    const type = normalizeRadioConnectionsHeader(question.type);
    return type === 'imatge' || type === 'imatges' || type === 'foto' || type === 'fotos' || type === 'image';
}

function isRadioConnectionsImageFile(value) {
    return /\.(png|jpe?g|webp|gif|svg)$/i.test(String(value || '').trim());
}

function getMediterraniBiodiversitatQuestions() {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheetNames = ['mediterrani_biodiversitat', 'biodiversitat_mediterrani'];
    let sheet = null;

    for (let i = 0; i < sheetNames.length; i++) {
        sheet = spreadsheet.getSheetByName(sheetNames[i]);
        if (sheet) break;
    }

    if (!sheet) {
        return {
            status: 'error',
            message: 'No he trobat la pestanya mediterrani_biodiversitat al Google Sheet'
        };
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
        return { status: 'error', message: 'Sense dades a ' + sheet.getName() };
    }

    const headers = data[0].map(normalizeMediterraniBiodiversitatHeader);
    const difficultyIdx = headers.indexOf('dificultat');
    const imageIdx = headers.indexOf('nom_imatge');
    const topicIdx = headers.indexOf('tema');
    const typeIdx = headers.indexOf('tipus_pregunta');
    const questionIdx = headers.indexOf('pregunta');
    const correctIdx = headers.indexOf('resposta_correcta');
    const wrongIdxs = [
        headers.indexOf('incorrecta_1'),
        headers.indexOf('incorrecta_2'),
        headers.indexOf('incorrecta_3')
    ];
    const correctImageIdx = headers.indexOf('imatge_correcta');
    const wrongImageIdxs = [
        headers.indexOf('imatge_incorrecta_1'),
        headers.indexOf('imatge_incorrecta_2'),
        headers.indexOf('imatge_incorrecta_3')
    ];

    const requiredColumns = [
        { name: 'nom_imatge', index: imageIdx },
        { name: 'pregunta', index: questionIdx },
        { name: 'resposta_correcta', index: correctIdx },
        { name: 'incorrecta_1', index: wrongIdxs[0] },
        { name: 'incorrecta_2', index: wrongIdxs[1] },
        { name: 'incorrecta_3', index: wrongIdxs[2] }
    ];

    const missingColumns = requiredColumns
        .filter(column => column.index === -1)
        .map(column => column.name);

    if (missingColumns.length > 0) {
        return {
            status: 'error',
            message: 'Falten columnes a ' + sheet.getName() + ': ' + missingColumns.join(', ')
        };
    }

    const questions = data.slice(1)
        .map((row, index) => {
            const type = typeIdx === -1 ? '' : cleanMediterraniBiodiversitatCell(row[typeIdx]);
            const isImageType = isMediterraniBiodiversitatImageQuestion({ type: type });
            const textCorrect = cleanMediterraniBiodiversitatCell(row[correctIdx]);
            const correctImage = correctImageIdx === -1 ? '' : cleanMediterraniBiodiversitatCell(row[correctImageIdx]);
            const correct = isImageType && !textCorrect ? correctImage : textCorrect;
            const rawWrongs = wrongIdxs
                .map(idx => cleanMediterraniBiodiversitatCell(row[idx]));
            const wrongs = rawWrongs.filter(value => value !== '');
            const wrongImages = wrongImageIdxs
                .map(idx => idx === -1 ? '' : cleanMediterraniBiodiversitatCell(row[idx]));
            let imageAlternatives = [
                { text: textCorrect, value: correctImage || textCorrect, image: correctImage, correct: true }
            ].concat(rawWrongs.map((wrong, wrongIndex) => ({
                text: wrong,
                value: wrongImages[wrongIndex] || wrong,
                image: wrongImages[wrongIndex] || '',
                correct: false
            }))).filter(option => option.image !== '');

            if (isImageType && imageAlternatives.length < 2) {
                imageAlternatives = [correct].concat(wrongs)
                    .filter(value => isMediterraniBiodiversitatImageFile(value))
                    .map(value => ({
                        text: '',
                        value: value,
                        image: value,
                        correct: value === correct
                    }));
            }

            return {
                id: index + 1,
                difficulty: difficultyIdx === -1 ? '' : cleanMediterraniBiodiversitatCell(row[difficultyIdx]),
                image: cleanMediterraniBiodiversitatCell(row[imageIdx]),
                topic: topicIdx === -1 ? '' : cleanMediterraniBiodiversitatCell(row[topicIdx]),
                type: type,
                question: cleanMediterraniBiodiversitatCell(row[questionIdx]),
                correct: correct,
                correctImage: correctImage,
                alternatives: [correct].concat(wrongs).filter(value => value !== ''),
                imageAlternatives: imageAlternatives
            };
        })
        .filter(question => {
            if (!question.question || !question.correct) return false;
            if (isMediterraniBiodiversitatImageQuestion(question)) {
                return question.imageAlternatives.length >= 2;
            }
            return question.alternatives.length >= 2;
        });

    if (questions.length === 0) {
        return { status: 'error', message: 'No hi ha preguntes completes a ' + sheet.getName() };
    }

    return { status: 'success', questions: questions };
}

function normalizeMediterraniBiodiversitatHeader(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s-]+/g, '_');
}

function cleanMediterraniBiodiversitatCell(value) {
    return String(value === undefined || value === null ? '' : value).trim();
}

function isMediterraniBiodiversitatImageQuestion(question) {
    const type = normalizeMediterraniBiodiversitatHeader(question.type);
    return type === 'imatge' || type === 'imatges' || type === 'foto' || type === 'fotos' || type === 'image';
}

function isMediterraniBiodiversitatImageFile(value) {
    return /\.(png|jpe?g|webp|gif|svg)$/i.test(String(value || '').trim());
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
function getNaturaPreguntes(subambit, tipusBatxillerat) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('natura_preguntes');
    if (!sheet) return { status: 'error', message: 'Pestanya natura_preguntes no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a natura_preguntes' };

    const headers = data[0].map(h => String(h).toLowerCase().trim());
    const pqIdx = headers.indexOf('pregunta');
    const invIdx = headers.indexOf('investigable/no investigable');
    const subIdx = headers.indexOf('subambit');
    const tipusIdx = headers.indexOf('tipus_batxillerat');
    const raoIdx = headers.indexOf('perquè_no_investigable');

    if (pqIdx === -1 || invIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques a natura_preguntes' };
    }

    // Step 1: No filters provided -> Return both lists of options
    if (!subambit && !tipusBatxillerat) {
        const subambitsSet = new Set();
        const ambitsSet = new Set();
        for (let i = 1; i < data.length; i++) {
            if (data[i][pqIdx]) {
                const s = String(data[i][subIdx] || "").trim();
                const a = String(data[i][tipusIdx] || "").trim();
                if (s) subambitsSet.add(s);
                if (a) ambitsSet.add(a);
            }
        }
        return {
            status: 'success',
            level: 'setup',
            subambits: Array.from(subambitsSet).sort(),
            ambits: Array.from(ambitsSet).sort()
        };
    }

    // Step 2: Filter and return questions
    let filtered = data.slice(1).filter(row => {
        const hasQ = row[pqIdx] && String(row[pqIdx]).trim() !== '';

        const isMixSub = !subambit || subambit.toLowerCase() === 'mix' || subambit.toLowerCase() === 'barrejat';
        const isMixAmbit = !tipusBatxillerat || tipusBatxillerat.toLowerCase() === 'mix' || tipusBatxillerat.toLowerCase() === 'barrejat';

        const matchesSub = isMixSub ? true : (String(row[subIdx] || "").trim().toLowerCase() === String(subambit).toLowerCase());
        const matchesAmbit = isMixAmbit ? true : (String(row[tipusIdx] || "").trim().toLowerCase() === String(tipusBatxillerat).toLowerCase());

        return hasQ && matchesSub && matchesAmbit;
    });

    const questions = filtered.sort(() => Math.random() - 0.5).slice(0, 15).map(row => ({
        pregunta: row[pqIdx],
        investigable: row[invIdx],
        perque_no_investigable: raoIdx !== -1 ? row[raoIdx] : ''
    }));

    return { status: 'success', level: 'questions', questions };
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

// Helper per normalitzar strings (treu accents, espais i passa a minúscules)
function normalizeStr(str) {
    if (!str) return "";
    return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function getSolidartQuadres(dificultat) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('quadres');
    if (!sheet) return { status: 'error', message: 'Pestanya quadres no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a la pestanya quadres' };

    const headers = data[0].map(h => String(h).toLowerCase().trim());
    const difIdx = headers.indexOf('dificultat');
    const imgIdx = headers.indexOf('nom_imatge');
    const qIdx = headers.indexOf('pregunta');
    const ansIdx = headers.indexOf('resposta_correcta');
    const inc1Idx = headers.indexOf('incorrecta_1');
    const inc2Idx = headers.indexOf('incorrecta_2');
    const inc3Idx = headers.indexOf('incorrecta_3');

    if (imgIdx === -1 || qIdx === -1 || ansIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques a la pestanya quadres' };
    }

    let filtered = data.slice(1);
    const normalizedTarget = normalizeStr(dificultat);

    if (dificultat && normalizedTarget !== 'mix' && difIdx !== -1) {
        filtered = filtered.filter(row => normalizeStr(row[difIdx]) === normalizedTarget);
    }

    if (filtered.length === 0) {
        return {
            status: 'error',
            message: 'No s\'han trobat preguntes per a la dificultat: ' + dificultat + '. Revisa la columna "dificultat" de la pestanya "quadres".'
        };
    }

    const questions = filtered.sort(() => Math.random() - 0.5).slice(0, 10).map(row => {
        const options = [
            row[ansIdx],
            row[inc1Idx],
            row[inc2Idx],
            row[inc3Idx]
        ].filter(o => o !== "").sort(() => Math.random() - 0.5);

        return {
            dificultat: row[difIdx],
            imatge: row[imgIdx],
            pregunta: row[qIdx],
            resposta_correcta: row[ansIdx],
            opcions: options
        };
    });

    return { status: 'success', questions };
}

function getSolidartQuadres2(dificultat) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('quadres2');
    if (!sheet) return { status: 'error', message: 'ERROR: La pestanya "quadres2" no existeix al Google Sheet.' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'ERROR: La pestanya "quadres2" està buida (només té la capçalera o res).' };

    const headers = data[0].map(h => String(h).toLowerCase().trim());
    const difIdx = headers.indexOf('dificultat');
    const qIdx = headers.indexOf('pregunta');
    const imgCorrectIdx = headers.indexOf('img_correcta');
    const inc1Idx = headers.indexOf('incorrecta_1');
    const inc2Idx = headers.indexOf('incorrecta_2');
    const inc3Idx = headers.indexOf('incorrecta_3');

    // Més flexible: si no troba img_correcta, potser es diu nom_imatge?
    const finalImgIdx = imgCorrectIdx !== -1 ? imgCorrectIdx : headers.indexOf('nom_imatge');

    if (qIdx === -1 || finalImgIdx === -1) {
        return {
            status: 'error',
            message: 'ERROR: Falten columnes a "quadres2". Necessito "pregunta" i "img_correcta" (o "nom_imatge"). Columnes trobades: ' + headers.join(', ')
        };
    }

    let filtered = data.slice(1).filter(row => row[qIdx] && String(row[qIdx]).trim() !== "");
    const normalizedTarget = normalizeStr(dificultat);

    if (dificultat && normalizedTarget !== 'mix' && difIdx !== -1) {
        filtered = filtered.filter(row => normalizeStr(row[difIdx]) === normalizedTarget);
    }

    if (filtered.length === 0) {
        return {
            status: 'error',
            message: 'No s\'han trobat preguntes per a la dificultat: ' + dificultat + '. Revisa la columna "dificultat".'
        };
    }

    const questions = filtered.sort(() => Math.random() - 0.5).slice(0, 10).map(row => {
        const options = [
            row[finalImgIdx],
            row[inc1Idx] || "",
            row[inc2Idx] || "",
            row[inc3Idx] || ""
        ].filter(o => o !== "").sort(() => Math.random() - 0.5);

        return {
            dificultat: difIdx !== -1 ? row[difIdx] : 'Mix',
            pregunta: row[qIdx],
            img_correcta: row[finalImgIdx],
            opcions: options
        };
    });

    return { status: 'success', questions };
}
function getDiagnosticQuestions() {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('diagnostic_preguntes');
        if (!sheet) return { status: 'error', message: 'No s\'ha trobat la pestanya diagnostic_preguntes' };

        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const questions = [];

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const q = {};
            headers.forEach((header, index) => {
                q[header] = row[index];
            });
            questions.push(q);
        }

        return { status: 'success', questions: questions };
    } catch (e) {
        return { status: 'error', message: e.toString() };
    }
}


function getSentitQuestions(senseName) {
    try {
        const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('sentit-' + senseName.toLowerCase());
        if (!sheet) return { status: 'error', message: 'No s\'ha trobat la pestanya sentit-' + senseName.toLowerCase() };

        const data = sheet.getDataRange().getValues();
        if (data.length <= 1) return { status: 'success', data: [] };

        const headers = data[0].map(h => String(h).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        
        const findIdx = (names) => {
            for (let name of names) {
                let norm = name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                let idx = headers.indexOf(norm);
                if (idx !== -1) return idx;
            }
            return -1;
        };

        const temaIdx = findIdx(['tipus de pregunta', 'tipus', 'tema', 'type']);
        const nivellIdx = findIdx(['nivell', 'nivel', 'level']);
        // Si no hi ha columna de tema, usem la columna de nivell per al tipus també
        const effectiveTemaIdx = temaIdx !== -1 ? temaIdx : nivellIdx;
        const qIdx = findIdx(['pregunta', 'question']);
        const correctIdx = findIdx(['correcta', 'correct']);
        const wrong1Idx = findIdx(['incorrecta1', 'incorrecta 1', 'incorrecta_1']);
        const wrong2Idx = findIdx(['incorrecta2', 'incorrecta 2', 'incorrecta_2']);
        const wrong3Idx = findIdx(['incorrecta3', 'incorrecta 3', 'incorrecta_3']);

        const questions = [];

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (qIdx !== -1 && correctIdx !== -1 && row[qIdx] && row[correctIdx]) {
                const alternatives = [
                    row[correctIdx],
                    wrong1Idx !== -1 ? row[wrong1Idx] : '',
                    wrong2Idx !== -1 ? row[wrong2Idx] : '',
                    wrong3Idx !== -1 ? row[wrong3Idx] : ''
                ].filter(a => a && String(a).trim() !== '');

                let qObj = {
                    type: effectiveTemaIdx !== -1 && row[effectiveTemaIdx] ? String(row[effectiveTemaIdx]).trim() : '',
                    level: nivellIdx !== -1 && row[nivellIdx] ? String(row[nivellIdx]).trim() : '',
                    q: row[qIdx],
                    correct: row[correctIdx],
                    alternatives: alternatives
                };
                questions.push(qObj);
            }
        }

        return { status: 'success', data: questions };
    } catch(e) {
        return { status: 'error', message: e.toString() };
    }
}

function getVistaQuestions() { return getSentitQuestions('Vista'); }
function getOidaQuestions() { return getSentitQuestions('Oida'); }
function getOlfacteQuestions() { return getSentitQuestions('Olfacte'); }
function getGustQuestions() { return getSentitQuestions('Gust'); }
function getTacteQuestions() { return getSentitQuestions('Tacte'); }

function getReproductorQuestions() {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    const findSheet = (name) => {
        const sheets = ss.getSheets();
        const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-\s_]/g, "");
        const normTarget = normalize(name);
        return sheets.find(s => normalize(s.getName()) === normTarget)
            || sheets.find(s => s.getName().toLowerCase().trim() === name.toLowerCase().trim());
    };

    const sheet = findSheet('aparell-reproductor');
    if (!sheet) return { status: 'error', message: 'Pestanya "aparell-reproductor" no trobada al Google Sheet' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'No hi ha dades a la pestanya "aparell-reproductor"' };

    const headers = data[0].map(h => String(h).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

    const findIdx = (names) => {
        for (let name of names) {
            let norm = name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let idx = headers.indexOf(norm);
            if (idx !== -1) return idx;
        }
        return -1;
    };

    // Cerca les columnes pel nom: accepta tant "Tipus de pregunta" com "Tipus"
    const typeIdx = findIdx(['tipus de pregunta', 'tipus pregunta', 'tipus', 'tipo de pregunta', 'tipo']);
    const levelIdx = findIdx(['nivell', 'nivel', 'level']);
    const qIdx = findIdx(['pregunta', 'question']);
    const correctIdx = findIdx(['correcta', 'correct']);
    const wrong1Idx = findIdx(['incorrecta1', 'incorrecta 1', 'incorrecta_1']);
    const wrong2Idx = findIdx(['incorrecta2', 'incorrecta 2', 'incorrecta_2']);
    const wrong3Idx = findIdx(['incorrecta3', 'incorrecta 3', 'incorrecta_3']);

    if (qIdx === -1 || correctIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques al Google Sheet (calen "Pregunta" i "Correcta")' };
    }

    const questions = data.slice(1)
        .filter(row => row[qIdx] && String(row[qIdx]).trim() !== "")
        .map(row => {
            const correct = row[correctIdx];
            const wrongs = [
                wrong1Idx !== -1 ? row[wrong1Idx] : "",
                wrong2Idx !== -1 ? row[wrong2Idx] : "",
                wrong3Idx !== -1 ? row[wrong3Idx] : ""
            ].filter(val => val !== undefined && val !== null && String(val).trim() !== "");

            return {
                type: typeIdx !== -1 ? String(row[typeIdx] || "").trim() : "",
                level: levelIdx !== -1 ? String(row[levelIdx] || "").trim() : "",
                q: String(row[qIdx]).trim(),
                correct: correct,
                alternatives: [correct, ...wrongs]
            };
        });

    return { status: 'success', data: questions };
}

function getImmunitariQuestions() {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    const findSheet = (name) => {
        const sheets = ss.getSheets();
        const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-\s_]/g, "");
        const normTarget = normalize(name);
        return sheets.find(s => normalize(s.getName()) === normTarget)
            || sheets.find(s => s.getName().toLowerCase().trim() === name.toLowerCase().trim());
    };

    const sheet = findSheet('sistema-immunitari');
    if (!sheet) return { status: 'error', message: 'Pestanya "sistema-immunitari" no trobada al Google Sheet' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'No hi ha dades a la pestanya "sistema-immunitari"' };

    const headers = data[0].map(h => String(h).toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

    const findIdx = (names) => {
        for (let name of names) {
            let norm = name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let idx = headers.indexOf(norm);
            if (idx !== -1) return idx;
        }
        return -1;
    };

    const typeIdx = findIdx(['tipus de pregunta', 'tipus pregunta', 'tipus', 'tipo de pregunta', 'tipo']);
    const levelIdx = findIdx(['nivell', 'nivel', 'level']);
    const qIdx = findIdx(['pregunta', 'question']);
    const correctIdx = findIdx(['correcta', 'correct']);
    const wrong1Idx = findIdx(['incorrecta1', 'incorrecta 1', 'incorrecta_1']);
    const wrong2Idx = findIdx(['incorrecta2', 'incorrecta 2', 'incorrecta_2']);
    const wrong3Idx = findIdx(['incorrecta3', 'incorrecta 3', 'incorrecta_3']);

    if (qIdx === -1 || correctIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques al Google Sheet (calen "Pregunta" i "Correcta")' };
    }

    const questions = data.slice(1)
        .filter(row => row[qIdx] && String(row[qIdx]).trim() !== "")
        .map(row => {
            const correct = row[correctIdx];
            const wrongs = [
                wrong1Idx !== -1 ? row[wrong1Idx] : "",
                wrong2Idx !== -1 ? row[wrong2Idx] : "",
                wrong3Idx !== -1 ? row[wrong3Idx] : ""
            ].filter(val => val !== undefined && val !== null && String(val).trim() !== "");

            return {
                type: typeIdx !== -1 ? String(row[typeIdx] || "").trim() : "",
                level: levelIdx !== -1 ? String(row[levelIdx] || "").trim() : "",
                q: String(row[qIdx]).trim(),
                correct: correct,
                alternatives: [correct, ...wrongs]
            };
        });

    return { status: 'success', data: questions };
}

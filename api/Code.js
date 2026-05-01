/**
 * API backend de l'app.
 *
 * Aquest fitxer viu a Google Apps Script i fa de pont entre el frontend i el
 * Google Sheet. El frontend envia una "action" i aquest codi decideix quina
 * funció executar: login, carregar preguntes, guardar resultats, etc.
 * 
 * Configuració bàsica:
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

// ID del Google Sheet que fa de base de dades.
const SHEET_ID = '1xFjjrZhBXZWlMkgARjrhQnZraRWS2uNUZfaNqvzQjV8';

function doGet(e) {
    return handleRequest(e);
}

function doPost(e) {
    return handleRequest(e);
}

const ACTIONS = {
    login: data => loginUser(data.email, data.password),
    getProjects: data => getProjects(data.curs),
    saveResult: data => saveResult(data),
    getNaturaQuestions: data => getNaturaQuestions(data.ecosistema),
    saveNaturaQuizResult: data => saveNaturaQuizResult(data),
    getImpactePhases: () => getImpactePhases(),
    getBiblioQuestions: () => getBiblioQuestions(),
    getRadioConfig: () => getRadioConfig(),
    getRadioConnectionsQuestions: () => getRadioConnectionsQuestions(),
    getMediterraniBiodiversitatQuestions: () => getMediterraniBiodiversitatQuestions(),
    getCirculatoriQuestions: () => getCirculatoriQuestions(),
    getReproductorQuestions: () => getReproductorQuestions(),
    getImmunitariQuestions: () => getImmunitariQuestions(),
    getEndocriQuestions: () => getEndocriQuestions(),
    getLocomotorQuestions: () => getLocomotorQuestions(),
    getVistaQuestions: () => getVistaQuestions(),
    getOidaQuestions: () => getOidaQuestions(),
    getOlfacteQuestions: () => getOlfacteQuestions(),
    getGustQuestions: () => getGustQuestions(),
    getTacteQuestions: () => getTacteQuestions(),
    getTrQuestions: data => getTrQuestions(data.subambit, data.tipusBatxillerat || data.ambit),
    getTrTemesQuestions: data => getTrTemesQuestions(data.tipusBatxillerat || data.ambit),
    getNaturaPreguntes: data => getNaturaPreguntes(data.subambit, data.tipusBatxillerat || data.ambit),
    getNaturaTemesQuestions: data => getNaturaTemesQuestions(data.tipusBatxillerat || data.ambit),
    getSolidartQuadres: data => getSolidartQuadres(data.dificultat),
    getSolidartQuadres2: data => getSolidartQuadres2(data.dificultat),
    getDiagnosticQuestions: () => getDiagnosticQuestions(),
    getOrenetesData: () => getOrenetesData(),
    getOrenetesPreguntes: () => getOrenetesPreguntes()
};

function handleRequest(e) {
    try {
        // Una petició pot arribar amb dades a la URL o al cos del POST.
        // Ajuntem totes dues fonts en un sol objecte perquè la resta del codi sigui simple.
        let data = { ...e.parameter };

        if (e.postData && e.postData.contents) {
            try {
                const bodyJson = JSON.parse(e.postData.contents);
                // Si una dada existeix als dos llocs, la del body mana.
                data = { ...data, ...bodyJson };
            } catch (err) {
                // Si el body no és JSON, ignorem el body i treballem només amb els paràmetres de la URL.
            }
        }

        // "action" diu al backend què ha de fer: login, guardar resultat, carregar preguntes...
        const action = data.action;
        const handler = ACTIONS[action];

        const result = handler
            ? handler(data)
            : { status: 'error', message: 'Acció desconeguda' };

        return createJSONOutput(result);

    } catch (error) {
        return createJSONOutput({ status: 'error', message: error.toString() });
    }
}

function withWriteLock(callback) {
    const lock = LockService.getScriptLock();

    if (!lock.tryLock(10000)) {
        return { status: 'error', message: 'No s\'ha pogut guardar ara mateix. Torna-ho a provar en uns segons.' };
    }

    try {
        return callback();
    } finally {
        lock.releaseLock();
    }
}

// --- FUNCIONS DE NEGOCI ---

function loginUser(email, password) {
    const sheet = getSheet('usuaris');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const emailIdx = headers.indexOf('email');
    const passIdx = headers.indexOf('password');

    // Comencem a la fila 1 perquè la fila 0 són les capçaleres.
    // El correu no distingeix majúscules/minúscules; la contrasenya sí.
    for (let i = 1; i < data.length; i++) {
        if (String(data[i][emailIdx]).toLowerCase() === String(email).toLowerCase() &&
            String(data[i][passIdx]) === String(password)) {

            const user = {};
            headers.forEach((header, index) => {
                // Mai retornem la contrasenya al navegador.
                if (header !== 'password') {
                    user[header] = data[i][index];
                }
            });

            return { status: 'success', user: user };
        }
    }

    return { status: 'error', message: 'Credencials incorrectes' };
}

function getProjects(curs) {
    // Catàleg manual de projectes. Si algun dia vols que sigui editable sense tocar codi,
    // aquest objecte es pot moure a una pestanya "projectes" del Google Sheet.

    const catalog = {
        // Noms de curs habituals.
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
        // Batxillerat.
        '1r Batxillerat': [
            { id: 'batx1_tr', titol: 'Treball de recerca', descripcio: 'Aprendre a formular bones preguntes investigables.' }
        ],
        '2n Batxillerat': [],
        // Aliases: acceptem també versions curtes que poden aparèixer al Sheet.
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
    return withWriteLock(() => {
        const sheet = getSheet('resultats');

        // Aquesta llista ha de seguir el mateix ordre que les capçaleres de la pestanya "resultats".
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
    });
}

function getNaturaQuestions(ecosistema) {
    const sheet = getSheet('preguntes_natura');
    if (!sheet) return { status: 'error', message: 'Pestanya preguntes_natura no trobada' };

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const ecoIdx = headers.indexOf('Ecosistema');

    let filtered = data.slice(1).filter(row => row[ecoIdx] === ecosistema);

    // Mostrem com a màxim 10 preguntes diferents cada vegada.
    filtered = sample(filtered, 10);

    const questions = filtered.map(row => {
        const q = {};
        headers.forEach((h, i) => q[h] = row[i]);
        return q;
    });

    return { status: 'success', questions: questions };
}


function getImpactePhases() {
    const sheet = getSheet('fases_impacte');
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
            text: cleanCell(row[faseIdx]),
            order: ordreIdx !== -1 && row[ordreIdx] ? Number(row[ordreIdx]) : (i + 1)
        }))
        .sort((a, b) => a.order - b.order)
        .slice(0, 10)
        .map(({ id, text }) => ({ id, text }));

    return { status: 'success', phases: phases };
}

function saveNaturaQuizResult(data) {
    return withWriteLock(() => {
        const sheet = getSheet('resultats_rols');
        if (!sheet) return { status: 'error', message: 'Pestanya resultats_rols no trobada' };

        // Aquesta llista ha de seguir l'ordre de capçaleres de la pestanya "resultats_rols".
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
    });
}

function getBiblioQuestions() {
    const sheet = getSheet('bibliografia-APA');
    if (!sheet) return { status: 'error', message: 'Pestanya bibliografia-APA no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a bibliografia-APA' };

    // Fem les capçaleres més fàcils de comparar: minúscules, sense accents ni espais sobrants.
    const rawHeaders = data[0].map(cleanCell);
    const headers = rawHeaders.map(normalizeHeader);
    const findIdx = names => findHeaderIndex(headers, names);

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
        .filter(row => cleanCell(row[qIdx]) !== "")
        .map(row => {
            const type = cleanCell(row[typeIdx]);
            const level = cleanCell(row[levelIdx]);
            const q = cleanCell(row[qIdx]);
            const correct = cleanCell(row[correctIdx]);

            const wrongs = [
                wrong1Idx !== -1 ? row[wrong1Idx] : "",
                wrong2Idx !== -1 ? row[wrong2Idx] : "",
                wrong3Idx !== -1 ? row[wrong3Idx] : ""
            ]
                .map(cleanCell)
                .filter(v => v);

            const alternatives = [correct, ...wrongs].filter(v => v);

            return {
                // Format antic: algunes pantalles encara llegeixen aquests noms exactes.
                "Tipus de pregunta": type,
                "Nivell": level,
                "Pregunta": q,
                "Correcta": correct,
                "Incorrecta1": wrongs[0] || "",
                "Incorrecta2": wrongs[1] || "",
                "Incorrecta3": wrongs[2] || "",

                // Format nou: més còmode per treballar des de JavaScript.
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
    const sheet = getSheet('temes-TR-preguntes');
    if (!sheet) return { status: 'error', message: 'Pestanya temes-TR-preguntes no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a temes-TR-preguntes' };

    const headers = data[0].map(normalizeHeader);

    const temaIdx = findHeaderIndex(headers, ['tema']);
    const tipusBtxIdx = findHeaderIndex(headers, ['tipus_batxillerat']);

    const colIdxs = [];
    for (let i = 1; i <= 10; i++) {
        colIdxs.push({
            pIdx: findHeaderIndex(headers, [`pregunta_${i}`]),
            tIdx: findHeaderIndex(headers, [`tipus_${i}`])
        });
    }

    if (temaIdx === -1 || colIdxs[0].pIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques (com a mínim cal "tema" i "pregunta_1") a temes-TR-preguntes' };
    }

    // Si encara no s'ha triat categoria, retornem les opcions disponibles per muntar la pantalla inicial.
    if (!tipusBatxillerat || tipusBatxillerat.trim() === '') {
        const categoriesSet = new Set();
        if (tipusBtxIdx !== -1) {
            for (let i = 1; i < data.length; i++) {
                const cat = cleanCell(data[i][tipusBtxIdx]);
                if (cat) categoriesSet.add(cat);
            }
        }

        // Si la pestanya té dades però no té categories, donem una opció genèrica per poder jugar igualment.
        if (categoriesSet.size === 0 && data.length > 1) {
            categoriesSet.add('General');
        }

        return { status: 'success', categories: Array.from(categoriesSet) };
    }

    // Quan ja tenim categoria, filtrem els temes i ignorem files sense tema.
    let questionsFiltered = data.slice(1).filter(row => {
        const hasTema = cleanCell(row[temaIdx]) !== '';

        const isGeneralFallback = (tipusBatxillerat || "").toLowerCase() === 'general';
        const isTargetType = (tipusBtxIdx !== -1 && !isGeneralFallback)
            ? (cleanCell(row[tipusBtxIdx]).toLowerCase() === cleanCell(tipusBatxillerat).toLowerCase())
            : true;

        return hasTema && isTargetType;
    });

    // Triem fins a 10 temes a l'atzar.
    questionsFiltered = sample(questionsFiltered, 10);

    const topics = questionsFiltered.map(row => {
        const tema = row[temaIdx];

        let qs = [];
        for (let i = 0; i < 10; i++) {
            const idxs = colIdxs[i];
            qs.push({
                id: `q${i + 1}`,
                text: idxs.pIdx !== -1 ? cleanCell(row[idxs.pIdx]) : '',
                type: idxs.tIdx !== -1 ? cleanCell(row[idxs.tIdx]) : ''
            });
        }

        // Un tema pot tenir menys de 10 preguntes; descartem les columnes buides.
        qs = qs.filter(q => cleanCell(q.text) !== '');

        qs = shuffle(qs);

        return {
            tema: tema,
            preguntes: qs
        };
    });

    return { status: 'success', topics: topics };
}

function getTrQuestions(subambit, tipusBatxillerat) {
    const sheet = getSheet('preguntes_investigables');
    if (!sheet) return { status: 'error', message: 'Pestanya preguntes_investigables no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a preguntes_investigables' };

    const headers = data[0].map(normalizeHeader);

    const idIdx = findHeaderIndex(headers, ['id']);
    const pqIdx = findHeaderIndex(headers, ['pregunta']);
    const invIdx = findHeaderIndex(headers, ['investigable/no investigable']);
    const subIdx = findHeaderIndex(headers, ['subambit']);
    const tipusIdx = findHeaderIndex(headers, ['tipus_batxillerat']);
    const raoIdx = findHeaderIndex(headers, ['perquè_no_investigable']);
    const tipusErrorIdx = findHeaderIndex(headers, ['tipus_error']);
    const escalaIdx = findHeaderIndex(headers, ['escala_tr']);

    if (pqIdx === -1 || invIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques (cal "pregunta" i "investigable/no investigable")' };
    }

    // Primer pas del joc: si no hi ha filtres, retornem les opcions perquè l'alumne pugui triar.
    if (!subambit && !tipusBatxillerat) {
        const subambitsSet = new Set();
        const ambitsSet = new Set();
        for (let i = 1; i < data.length; i++) {
            if (data[i][pqIdx]) {
                const s = cleanCell(data[i][subIdx]);
                const a = cleanCell(data[i][tipusIdx]);
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

    // Segon pas del joc: amb els filtres triats, retornem les preguntes.
    let questionsFiltered = data.slice(1).filter(row => {
        const hasQuestion = cleanCell(row[pqIdx]) !== '';

        // "Barrejat" o "Mix" vol dir: no filtris per aquest camp.
        const normalizedSubambit = cleanCell(subambit).toLowerCase();
        const normalizedBatxillerat = cleanCell(tipusBatxillerat).toLowerCase();
        const isMixSub = !subambit || normalizedSubambit === 'mix' || normalizedSubambit === 'barrejat';
        const isMixAmbit = !tipusBatxillerat || normalizedBatxillerat === 'mix' || normalizedBatxillerat === 'barrejat';

        const matchesSub = isMixSub ? true : (cleanCell(row[subIdx]).toLowerCase() === normalizedSubambit);
        const matchesAmbit = isMixAmbit ? true : (cleanCell(row[tipusIdx]).toLowerCase() === normalizedBatxillerat);

        return hasQuestion && matchesSub && matchesAmbit;
    });

    // Triem fins a 15 preguntes a l'atzar.
    questionsFiltered = sample(questionsFiltered, 15);

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

function getStandardTextQuizQuestions(config) {
    const sheet = findFlexibleSheet(config.sheetNames);
    if (!sheet) return { status: 'error', message: config.missingMessage };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
        if (config.emptySuccess) return { status: 'success', [config.returnKey]: [] };
        return { status: 'error', message: config.emptyMessage };
    }

    const headers = data[0].map(normalizeHeader);
    const findIdx = names => findHeaderIndex(headers, names);

    const typeIdx = findIdx(config.typeNames || ['tipus de pregunta', 'tipus pregunta', 'tipus', 'tema', 'type', 'tipo de pregunta', 'tipo pregunta', 'tipo']);
    const levelIdx = findIdx(config.levelNames || ['nivell', 'nivel', 'level']);
    const effectiveTypeIdx = config.useLevelAsTypeFallback && typeIdx === -1 ? levelIdx : typeIdx;
    const qIdx = findIdx(config.questionNames || ['pregunta', 'question']);
    const correctIdx = findIdx(config.correctNames || ['correcta', 'correct']);
    const wrongIdxs = [
        findIdx(['incorrecta1', 'incorrecta 1', 'incorrecta_1']),
        findIdx(['incorrecta2', 'incorrecta 2', 'incorrecta_2']),
        findIdx(['incorrecta3', 'incorrecta 3', 'incorrecta_3'])
    ];

    if (qIdx === -1 || correctIdx === -1) {
        return { status: 'error', message: 'Falten columnes critiques al Google Sheet (calen "Pregunta" i "Correcta")' };
    }

    const questions = data.slice(1)
        .filter(row => cleanCell(row[qIdx]) !== '' && (!config.requireCorrectForFilter || cleanCell(row[correctIdx]) !== ''))
        .map(row => {
            const correct = row[correctIdx];
            const wrongs = wrongIdxs
                .map(idx => idx !== -1 ? row[idx] : '')
                .filter(value => cleanCell(value) !== '');
            const alternatives = config.alternativesFromFixedColumns
                ? config.alternativesFromFixedColumns.map(idx => row[idx]).filter(value => cleanCell(value) !== '')
                : [correct, ...wrongs];
            const rawLevel = levelIdx !== -1 ? cleanCell(row[levelIdx]) : (config.levelDefault || '');

            return {
                type: effectiveTypeIdx !== -1 ? cleanCell(row[effectiveTypeIdx]) : '',
                level: config.lowercaseLevel ? rawLevel.toLowerCase() : rawLevel,
                q: config.cleanQuestion ? cleanCell(row[qIdx]) : row[qIdx],
                correct: correct,
                alternatives: alternatives
            };
        });

    return { status: 'success', [config.returnKey || 'questions']: questions };
}

function getCirculatoriQuestions() {
    return getStandardTextQuizQuestions({
        sheetNames: ['aparell-circulatori'],
        missingMessage: 'Pestanya "aparell-circulatori" no trobada al Google Sheet',
        emptyMessage: 'No hi ha dades a la pestanya "aparell-circulatori"',
        levelDefault: 'mixed',
        lowercaseLevel: true,
        alternativesFromFixedColumns: [3, 4, 5, 6, 7],
        returnKey: 'questions'
    });
}

function getEndocriQuestions() {
    return getStandardTextQuizQuestions({
        sheetNames: ['sistema-endocri'],
        missingMessage: 'Pestanya "sistema-endocri" no trobada al Google Sheet',
        emptyMessage: 'No hi ha dades a la pestanya "sistema-endocri"',
        levelDefault: 'mixed',
        lowercaseLevel: true,
        returnKey: 'questions'
    });
}

function getLocomotorQuestions() {
    return getStandardTextQuizQuestions({
        sheetNames: ['aparell-locomotor', 'sistema-locomotor'],
        missingMessage: 'Pestanya "aparell-locomotor" no trobada al Google Sheet',
        emptyMessage: 'No hi ha dades a la pestanya "aparell-locomotor"',
        levelDefault: 'mixed',
        lowercaseLevel: true,
        returnKey: 'questions'
    });
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
    const sheet = getSheet('preguntes_radio_conexions');
    if (!sheet) {
        // Preguntes de reserva perquè l'activitat no quedi buida si falta la pestanya.
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
            alternatives: [row[1], row[2], row[3], row[4]]
                .filter(val => cleanCell(val) !== "")
        };
    });

    return { status: 'success', questions: questions };
}

function getRadioConnectionsQuestions() {
    const sheet = getFirstExistingSheet(['radio_connectors', 'preguntes_radio_conexions']);

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
    return normalizeHeader(value);
}

function cleanRadioConnectionsCell(value) {
    return cleanCell(value);
}

function isRadioConnectionsImageQuestion(question) {
    const type = normalizeRadioConnectionsHeader(question.type);
    return type === 'imatge' || type === 'imatges' || type === 'foto' || type === 'fotos' || type === 'image';
}

function isRadioConnectionsImageFile(value) {
    return /\.(png|jpe?g|webp|gif|svg)$/i.test(cleanCell(value));
}

function getMediterraniBiodiversitatQuestions() {
    const sheet = getFirstExistingSheet(['mediterrani_biodiversitat', 'biodiversitat_mediterrani']);

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
    return normalizeHeader(value);
}

function cleanMediterraniBiodiversitatCell(value) {
    return cleanCell(value);
}

function isMediterraniBiodiversitatImageQuestion(question) {
    const type = normalizeMediterraniBiodiversitatHeader(question.type);
    return type === 'imatge' || type === 'imatges' || type === 'foto' || type === 'fotos' || type === 'image';
}

function isMediterraniBiodiversitatImageFile(value) {
    return /\.(png|jpe?g|webp|gif|svg)$/i.test(cleanCell(value));
}

// --- UTILITATS ---

function getSpreadsheet() {
    return SpreadsheetApp.openById(SHEET_ID);
}

function getSheet(sheetName) {
    return getSpreadsheet().getSheetByName(sheetName);
}

function getFirstExistingSheet(sheetNames) {
    const spreadsheet = getSpreadsheet();

    for (let i = 0; i < sheetNames.length; i++) {
        const sheet = spreadsheet.getSheetByName(sheetNames[i]);
        if (sheet) return sheet;
    }

    return null;
}

function normalizeHeader(value) {
    return String(value || '')
        .replace(/^\uFEFF/, '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s-]+/g, '_');
}

function normalizeLoose(value) {
    return normalizeHeader(value).replace(/_/g, '');
}

function cleanCell(value) {
    return String(value === undefined || value === null ? '' : value).trim();
}

function findHeaderIndex(headers, names) {
    const normalizedHeaders = headers.map(normalizeHeader);

    for (let i = 0; i < names.length; i++) {
        const index = normalizedHeaders.indexOf(normalizeHeader(names[i]));
        if (index !== -1) return index;
    }

    return -1;
}

function findLooseHeaderIndex(headers, names) {
    const normalizedHeaders = headers.map(normalizeLoose);

    for (let i = 0; i < names.length; i++) {
        const index = normalizedHeaders.indexOf(normalizeLoose(names[i]));
        if (index !== -1) return index;
    }

    return -1;
}

function findFlexibleSheet(sheetNames) {
    const spreadsheet = getSpreadsheet();
    const sheets = spreadsheet.getSheets();
    const normalizedNames = sheetNames.map(normalizeLoose);

    for (let i = 0; i < sheets.length; i++) {
        if (normalizedNames.indexOf(normalizeLoose(sheets[i].getName())) !== -1) {
            return sheets[i];
        }
    }

    return null;
}

function shuffle(array) {
    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }

    return result;
}

function sample(array, maxItems) {
    return shuffle(array).slice(0, maxItems);
}

function rowToObject(headers, row) {
    const object = {};

    headers.forEach((header, index) => {
        object[header] = row[index];
    });

    return object;
}

function createJSONOutput(object) {
    return ContentService.createTextOutput(JSON.stringify(object))
        .setMimeType(ContentService.MimeType.JSON);
}

// Nota CORS: Apps Script no deixa posar capçaleres CORS reals aquí.
// Per evitar problemes, el frontend hauria de fer peticions GET/POST simples i seguir redireccions.
function getNaturaPreguntes(subambit, tipusBatxillerat) {
    const sheet = getSheet('natura_preguntes');
    if (!sheet) return { status: 'error', message: 'Pestanya natura_preguntes no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a natura_preguntes' };

    const headers = data[0].map(normalizeHeader);
    const pqIdx = findHeaderIndex(headers, ['pregunta']);
    const invIdx = findHeaderIndex(headers, ['investigable/no investigable']);
    const subIdx = findHeaderIndex(headers, ['subambit']);
    const tipusIdx = findHeaderIndex(headers, ['tipus_batxillerat']);
    const raoIdx = findHeaderIndex(headers, ['perquè_no_investigable']);

    if (pqIdx === -1 || invIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques a natura_preguntes' };
    }

    // Primer pas: sense filtres, retornem les opcions de configuració del joc.
    if (!subambit && !tipusBatxillerat) {
        const subambitsSet = new Set();
        const ambitsSet = new Set();
        for (let i = 1; i < data.length; i++) {
            if (data[i][pqIdx]) {
                const s = cleanCell(data[i][subIdx]);
                const a = cleanCell(data[i][tipusIdx]);
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

    // Segon pas: amb filtres, retornem les preguntes que toquen.
    let filtered = data.slice(1).filter(row => {
        const hasQ = cleanCell(row[pqIdx]) !== '';

        const normalizedSubambit = cleanCell(subambit).toLowerCase();
        const normalizedBatxillerat = cleanCell(tipusBatxillerat).toLowerCase();
        const isMixSub = !subambit || normalizedSubambit === 'mix' || normalizedSubambit === 'barrejat';
        const isMixAmbit = !tipusBatxillerat || normalizedBatxillerat === 'mix' || normalizedBatxillerat === 'barrejat';

        const matchesSub = isMixSub ? true : (cleanCell(row[subIdx]).toLowerCase() === normalizedSubambit);
        const matchesAmbit = isMixAmbit ? true : (cleanCell(row[tipusIdx]).toLowerCase() === normalizedBatxillerat);

        return hasQ && matchesSub && matchesAmbit;
    });

    const questions = sample(filtered, 15).map(row => ({
        pregunta: row[pqIdx],
        investigable: row[invIdx],
        perque_no_investigable: raoIdx !== -1 ? row[raoIdx] : ''
    }));

    return { status: 'success', level: 'questions', questions };
}

function getNaturaTemesQuestions(tipusBatxillerat) {
    const sheet = getSheet('natura_temes');
    if (!sheet) return { status: 'error', message: 'Pestanya natura_temes no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a natura_temes' };

    const headers = data[0].map(normalizeHeader);
    const temaIdx = findHeaderIndex(headers, ['tema']);
    const tipusBtxIdx = findHeaderIndex(headers, ['tipus_batxillerat']);

    const colIdxs = [];
    for (let i = 1; i <= 10; i++) {
        colIdxs.push({
            pIdx: findHeaderIndex(headers, [`pregunta_${i}`]),
            tIdx: findHeaderIndex(headers, [`tipus_${i}`])
        });
    }

    if (temaIdx === -1 || colIdxs[0].pIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques a natura_temes' };
    }

    if (!tipusBatxillerat || tipusBatxillerat.trim() === '') {
        const categoriesSet = new Set();
        if (tipusBtxIdx !== -1) {
            for (let i = 1; i < data.length; i++) {
                const cat = cleanCell(data[i][tipusBtxIdx]);
                if (cat) categoriesSet.add(cat);
            }
        }
        if (categoriesSet.size === 0 && data.length > 1) categoriesSet.add('General');
        return { status: 'success', categories: Array.from(categoriesSet) };
    }

    let filtered = data.slice(1).filter(row => {
        const hasTema = cleanCell(row[temaIdx]) !== '';
        const isGen = tipusBatxillerat.toLowerCase() === 'general';
        const isType = (tipusBtxIdx !== -1 && !isGen) ? (cleanCell(row[tipusBtxIdx]).toLowerCase() === cleanCell(tipusBatxillerat).toLowerCase()) : true;
        return hasTema && isType;
    });

    const topics = sample(filtered, 10).map(row => {
        let qs = [];
        for (let i = 0; i < 10; i++) {
            const idxs = colIdxs[i];
            if (idxs.pIdx !== -1 && cleanCell(row[idxs.pIdx])) {
                qs.push({
                    text: cleanCell(row[idxs.pIdx]),
                    type: idxs.tIdx !== -1 ? cleanCell(row[idxs.tIdx]) : ''
                });
            }
        }
        return { tema: row[temaIdx], preguntes: shuffle(qs) };
    });

    return { status: 'success', topics };
}

// Normalitza text per comparar valors escrits de formes una mica diferents.
function normalizeStr(str) {
    if (!str) return "";
    return cleanCell(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function getSolidartQuadres(dificultat) {
    const sheet = getSheet('quadres');
    if (!sheet) return { status: 'error', message: 'Pestanya quadres no trobada' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a la pestanya quadres' };

    const headers = data[0].map(normalizeHeader);
    const difIdx = findHeaderIndex(headers, ['dificultat']);
    const imgIdx = findHeaderIndex(headers, ['nom_imatge']);
    const qIdx = findHeaderIndex(headers, ['pregunta']);
    const ansIdx = findHeaderIndex(headers, ['resposta_correcta']);
    const inc1Idx = findHeaderIndex(headers, ['incorrecta_1']);
    const inc2Idx = findHeaderIndex(headers, ['incorrecta_2']);
    const inc3Idx = findHeaderIndex(headers, ['incorrecta_3']);

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

    const questions = sample(filtered, 10).map(row => {
        const options = shuffle([
            row[ansIdx],
            row[inc1Idx],
            row[inc2Idx],
            row[inc3Idx]
        ].filter(o => cleanCell(o) !== ""));

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
    const sheet = getSheet('quadres2');
    if (!sheet) return { status: 'error', message: 'ERROR: La pestanya "quadres2" no existeix al Google Sheet.' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'ERROR: La pestanya "quadres2" està buida (només té la capçalera o res).' };

    const headers = data[0].map(normalizeHeader);
    const difIdx = findHeaderIndex(headers, ['dificultat']);
    const qIdx = findHeaderIndex(headers, ['pregunta']);
    const imgCorrectIdx = findHeaderIndex(headers, ['img_correcta']);
    const inc1Idx = findHeaderIndex(headers, ['incorrecta_1']);
    const inc2Idx = findHeaderIndex(headers, ['incorrecta_2']);
    const inc3Idx = findHeaderIndex(headers, ['incorrecta_3']);

    // Acceptem dos noms de columna per no trencar Sheets antics.
    const finalImgIdx = imgCorrectIdx !== -1 ? imgCorrectIdx : findHeaderIndex(headers, ['nom_imatge']);

    if (qIdx === -1 || finalImgIdx === -1) {
        return {
            status: 'error',
            message: 'ERROR: Falten columnes a "quadres2". Necessito "pregunta" i "img_correcta" (o "nom_imatge"). Columnes trobades: ' + headers.join(', ')
        };
    }

    let filtered = data.slice(1).filter(row => cleanCell(row[qIdx]) !== "");
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

    const questions = sample(filtered, 10).map(row => {
        const options = shuffle([
            row[finalImgIdx],
            row[inc1Idx] || "",
            row[inc2Idx] || "",
            row[inc3Idx] || ""
        ].filter(o => cleanCell(o) !== ""));

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
        const sheet = getSheet('diagnostic_preguntes');
        if (!sheet) return { status: 'error', message: 'No s\'ha trobat la pestanya diagnostic_preguntes' };

        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const questions = [];

        for (let i = 1; i < data.length; i++) {
            questions.push(rowToObject(headers, data[i]));
        }

        return { status: 'success', questions: questions };
    } catch (e) {
        return { status: 'error', message: e.toString() };
    }
}


function getSentitQuestions(senseName) {
    try {
        return getStandardTextQuizQuestions({
            sheetNames: ['sentit-' + senseName.toLowerCase()],
            missingMessage: 'No s\'ha trobat la pestanya sentit-' + senseName.toLowerCase(),
            emptySuccess: true,
            returnKey: 'data',
            useLevelAsTypeFallback: true,
            requireCorrectForFilter: true
        });
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
    return getStandardTextQuizQuestions({
        sheetNames: ['aparell-reproductor'],
        missingMessage: 'Pestanya "aparell-reproductor" no trobada al Google Sheet',
        emptyMessage: 'No hi ha dades a la pestanya "aparell-reproductor"',
        cleanQuestion: true,
        returnKey: 'data'
    });
}

function getImmunitariQuestions() {
    return getStandardTextQuizQuestions({
        sheetNames: ['sistema-immunitari'],
        missingMessage: 'Pestanya "sistema-immunitari" no trobada al Google Sheet',
        emptyMessage: 'No hi ha dades a la pestanya "sistema-immunitari"',
        cleanQuestion: true,
        returnKey: 'data'
    });
}

function getOrenetesData() {
    try {
        const sheet = getSheet('orenetes_nius');
        if (!sheet) return { status: 'error', message: 'No s\'ha trobat la pestanya orenetes_nius' };

        const data = sheet.getDataRange().getValues();
        if (data.length <= 1) return { status: 'success', data: [] };

        const headers = data[0].map(normalizeHeader);
        const findIdx = names => findHeaderIndex(headers, names);

        const dificultatIdx = findIdx(['dificultat']);
        const imgIdx = findIdx(['imatge', 'nom_imatge']);
        const descIdx = findIdx(['descripcio', 'descripció', 'descripcio imatge']);
        const bonEstatIdx = findIdx(['nius en bon estat', 'bon estat']);
        const actiusIdx = findIdx(['nius actius', 'actius']);
        const trencatsIdx = findIdx(['nius trencats', 'trencats']);
        const restesIdx = findIdx(['restes', 'nius restes']);

        if (imgIdx === -1) {
            return { status: 'error', message: 'Falta la columna nom_imatge a la pestanya orenetes_nius' };
        }

        const questions = [];

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row[imgIdx]) {
                questions.push({
                    dificultat: dificultatIdx !== -1 ? cleanCell(row[dificultatIdx]) : '',
                    imatge: row[imgIdx],
                    descripcio: descIdx !== -1 ? cleanCell(row[descIdx]) : '',
                    bonEstat: bonEstatIdx !== -1 ? Number(row[bonEstatIdx]) || 0 : 0,
                    actius: actiusIdx !== -1 ? Number(row[actiusIdx]) || 0 : 0,
                    trencats: trencatsIdx !== -1 ? Number(row[trencatsIdx]) || 0 : 0,
                    restes: restesIdx !== -1 ? Number(row[restesIdx]) || 0 : 0
                });
            }
        }

        return { status: 'success', data: questions };
    } catch(e) {
        return { status: 'error', message: e.toString() };
    }
}

function getOrenetesPreguntes() {
    try {
        const sheet = getFirstExistingSheet(['orenetes_preguntes', 'preguntes_orenetes']);

        if (!sheet) {
            return { status: 'error', message: 'No s\'ha trobat la pestanya orenetes_preguntes' };
        }

        const data = sheet.getDataRange().getValues();
        if (data.length <= 1) return { status: 'success', questions: [] };

        const headers = data[0].map(normalizeOrenetesPreguntesHeader);
        const findIdx = names => findHeaderIndex(headers, names);

        const difficultyIdx = findIdx(['dificultat']);
        const topicIdx = findIdx(['tema']);
        const imageIdx = findIdx(['nom_imatge', 'imatge', 'imatge_pregunta']);
        const questionIdx = findIdx(['pregunta']);
        const correctIdx = findIdx(['resposta_correcta', 'correcta']);
        const correctImageIdx = findIdx(['imatge_correcta', 'foto_correcta']);
        const wrongIdxs = [
            findIdx(['incorrecta_1', 'resposta_incorrecta_1']),
            findIdx(['incorrecta_2', 'resposta_incorrecta_2']),
            findIdx(['incorrecta_3', 'resposta_incorrecta_3'])
        ];
        const wrongImageIdxs = [
            findIdx(['imatge_incorrecta_1', 'foto_incorrecta_1']),
            findIdx(['imatge_incorrecta_2', 'foto_incorrecta_2']),
            findIdx(['imatge_incorrecta_3', 'foto_incorrecta_3'])
        ];

        const missingColumns = [
            { name: 'pregunta', index: questionIdx },
            { name: 'resposta_correcta', index: correctIdx }
        ].filter(column => column.index === -1).map(column => column.name);

        if (missingColumns.length > 0) {
            return {
                status: 'error',
                message: 'Falten columnes a ' + sheet.getName() + ': ' + missingColumns.join(', ')
            };
        }

        const questions = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const questionText = cleanOrenetesPreguntesCell(row[questionIdx]);
            const correctText = cleanOrenetesPreguntesCell(row[correctIdx]);
            const correctImage = correctImageIdx === -1
                ? getOrenetesPreguntesImageFromCell(correctText)
                : cleanOrenetesPreguntesCell(row[correctImageIdx]);
            const wrongTexts = wrongIdxs.map(idx => idx === -1 ? '' : cleanOrenetesPreguntesCell(row[idx]));
            const wrongImages = wrongTexts.map((wrong, index) => {
                const imageIdx = wrongImageIdxs[index];
                if (imageIdx !== -1) return cleanOrenetesPreguntesCell(row[imageIdx]);
                return getOrenetesPreguntesImageFromCell(wrong);
            });

            const options = [
                {
                    text: getOrenetesPreguntesOptionText(correctText, correctImage),
                    value: correctText || correctImage,
                    image: correctImage,
                    correct: true
                }
            ].concat(wrongImages.map((image, index) => ({
                text: getOrenetesPreguntesOptionText(wrongTexts[index], image),
                value: wrongTexts[index] || image,
                image: image,
                correct: false
            }))).filter(option => option.value !== '');

            if (questionText && (correctText || correctImage) && options.length >= 2) {
                questions.push({
                    id: i,
                    difficulty: difficultyIdx === -1 ? '' : cleanOrenetesPreguntesCell(row[difficultyIdx]),
                    topic: topicIdx === -1 ? '' : cleanOrenetesPreguntesCell(row[topicIdx]),
                    image: imageIdx === -1 ? '' : cleanOrenetesPreguntesCell(row[imageIdx]),
                    question: questionText,
                    correct: correctText || correctImage,
                    options: options
                });
            }
        }

        return { status: 'success', questions: questions };
    } catch(e) {
        return { status: 'error', message: e.toString() };
    }
}

function normalizeOrenetesPreguntesHeader(value) {
    return normalizeHeader(value);
}

function cleanOrenetesPreguntesCell(value) {
    return cleanCell(value);
}

function getOrenetesPreguntesImageFromCell(value) {
    const cleanValue = cleanOrenetesPreguntesCell(value);
    return isOrenetesPreguntesImageFile(cleanValue) ? cleanValue : '';
}

function getOrenetesPreguntesOptionText(text, image) {
    const cleanText = cleanOrenetesPreguntesCell(text);
    return cleanText === cleanOrenetesPreguntesCell(image) ? '' : cleanText;
}

function isOrenetesPreguntesImageFile(value) {
    return /\.(png|jpe?g|webp|gif|svg)$/i.test(cleanCell(value));
}



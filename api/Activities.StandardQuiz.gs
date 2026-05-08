/**
 * Helper genèric per a activitats tipus quiz textual i activitats que el reutilitzen.
 */

function getStandardTextQuizQuestions(config) {
    const sheet = findFlexibleSheet(config.sheetNames);
    if (!sheet) return { status: 'error', message: config.missingMessage };

    const data = getCachedSheetValues(sheet);
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

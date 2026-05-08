/**
 * Activitats específiques de Biologia.
 */

function getBioConceptDragData(sheetName) {
    const requestedSheet = cleanCell(sheetName);
    const sheetNames = requestedSheet
        ? [requestedSheet, 'biologia_conceptes', 'biologia-conceptes', 'conceptes_biologia']
        : ['biologia_conceptes', 'biologia-conceptes', 'conceptes_biologia'];
    const sheet = getFirstExistingSheet(sheetNames);

    if (!sheet) {
        return {
            status: 'error',
            message: 'Pestanya "biologia_conceptes" no trobada al Google Sheet'
        };
    }

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) {
        return {
            status: 'error',
            message: 'La pestanya "' + sheet.getName() + '" no te dades'
        };
    }

    const headers = data[0].map(normalizeHeader);
    const findIdx = names => findHeaderIndex(headers, names);
    const topicIdx = findIdx(['tema', 'topic', 'unitat', 'bloc']);
    const subtopicIdx = findIdx(['subtema', 'subtemes', 'sub_tema', 'sub_temes', 'subtopic', 'subtopics']);
    const difficultyIdx = findIdx(['nivell', 'dificultat', 'difficulty', 'level']);
    const conceptIdx = findIdx(['concepte', 'concept', 'paraigua', 'categoria']);
    const definitionIdx = findIdx(['definicio', 'definiciÃ³', 'definition', 'descripcio', 'descripciÃ³']);

    if (conceptIdx === -1 || definitionIdx === -1) {
        return {
            status: 'error',
            message: 'Falten columnes a "' + sheet.getName() + '": calen "Concepte" i "Definicio"'
        };
    }

    const items = [];
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const concept = cleanCell(row[conceptIdx]);
        const definition = cleanCell(row[definitionIdx]);

        if (concept && definition) {
            items.push({
                id: sheet.getSheetId() + '_' + i,
                topic: topicIdx !== -1 ? cleanCell(row[topicIdx]) : 'General',
                subtopic: subtopicIdx !== -1 ? cleanCell(row[subtopicIdx]) : 'General',
                difficulty: difficultyIdx !== -1 ? cleanCell(row[difficultyIdx]) : 'General',
                concept: concept,
                definition: definition
            });
        }
    }

    if (items.length === 0) {
        return {
            status: 'error',
            message: 'No hi ha files completes amb Concepte i Definicio a "' + sheet.getName() + '"'
        };
    }

    return { status: 'success', items: items };
}

function getBioPedigreeData(sheetName, refresh) {
    const requestedSheet = cleanCell(sheetName);
    const sheetNames = requestedSheet
        ? [requestedSheet, 'biologia_pedigrees', 'genetica_pedigrees', 'pedigrees']
        : ['biologia_pedigrees', 'genetica_pedigrees', 'pedigrees'];
    const sheet = getFirstExistingSheet(sheetNames);

    if (!sheet) {
        return {
            status: 'error',
            message: 'Pestanya "biologia_pedigrees" no trobada al Google Sheet'
        };
    }

    if (isTruthy(refresh)) {
        clearSheetCache(sheet);
    }

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) {
        return {
            status: 'error',
            message: 'La pestanya "' + sheet.getName() + '" no te dades'
        };
    }

    const rawHeaders = data[0].map(cleanCell);
    const headers = rawHeaders.map(normalizeHeader);
    const imageIdx = findHeaderIndex(headers, ['imatge', 'imagen', 'image', 'nom_imatge']);
    const levelIdx = findHeaderIndex(headers, ['nivell', 'nivel', 'level', 'dificultat', 'difficulty']);
    const titleIdx = findHeaderIndex(headers, ['titol', 'titulo', 'title', 'cas']);
    const inheritanceIdx = findHeaderIndex(headers, [
        'herencia',
        'herencia_probable',
        'patro_herencia',
        'tipus_herencia',
        'ad_ar',
        'ad/ar',
        'inheritance'
    ]);
    const patternPossibleIdx = findHeaderIndex(headers, [
        'patro_possible',
        'patro_es_possible',
        'possible',
        'es_possible',
        'compatible',
        'patro_compatible',
        'pattern_possible'
    ]);

    const personColumns = [];
    for (let i = 0; i < rawHeaders.length; i++) {
        const label = rawHeaders[i];
        if (isBioPedigreePersonHeader(label)) {
            personColumns.push({ index: i, id: label });
        }
    }

    if (imageIdx === -1) {
        return { status: 'error', message: 'Falta la columna "imatge" a ' + sheet.getName() };
    }

    if (personColumns.length === 0) {
        return { status: 'error', message: 'Cal com a minim una columna de persona, per exemple I-1, I-2 o II-1' };
    }

    const items = [];
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const image = cleanCell(row[imageIdx]);
        const answers = [];

        personColumns.forEach(column => {
            const value = cleanCell(row[column.index]);
            if (isBioPedigreeFilledAnswer(value)) {
                answers.push({
                    id: column.id,
                    generation: getBioPedigreeGeneration(column.id),
                    order: getBioPedigreePersonOrder(column.id),
                    answer: value
                });
            }
        });

        if (image && answers.length > 0) {
            items.push({
                id: sheet.getSheetId() + '_' + i,
                image: image,
                level: levelIdx === -1 ? 'General' : cleanCell(row[levelIdx]) || 'General',
                title: titleIdx === -1 ? '' : cleanCell(row[titleIdx]),
                inheritance: inheritanceIdx === -1 ? '' : cleanCell(row[inheritanceIdx]),
                patternPossible: patternPossibleIdx === -1 ? '' : cleanCell(row[patternPossibleIdx]),
                answers: answers.sort(sortBioPedigreeAnswers)
            });
        }
    }

    if (items.length === 0) {
        return { status: 'error', message: 'No hi ha files completes amb imatge i genotips a ' + sheet.getName() };
    }

    return { status: 'success', items: items };
}

function isBioPedigreeFilledAnswer(value) {
    const text = cleanCell(value);
    if (!text) return false;
    return !/^(?:-|--|_|pendent|pending|blank|buit|buida|n\/a|na)$/i.test(text);
}

function isTruthy(value) {
    const text = cleanCell(value).toLowerCase();
    return text === '1' || text === 'true' || text === 'yes' || text === 'si' || text === 'sí';
}

function isBioPedigreePersonHeader(value) {
    return /^[IVXLCDM]+-\d+$/i.test(cleanCell(value));
}

function getBioPedigreeGeneration(id) {
    const match = cleanCell(id).match(/^([IVXLCDM]+)-/i);
    return match ? match[1].toUpperCase() : '';
}

function getBioPedigreePersonOrder(id) {
    const match = cleanCell(id).match(/-(\d+)$/);
    return match ? Number(match[1]) : 0;
}

function sortBioPedigreeAnswers(a, b) {
    const generationCompare = romanToNumber(a.generation) - romanToNumber(b.generation);
    if (generationCompare !== 0) return generationCompare;
    return a.order - b.order;
}

function romanToNumber(roman) {
    const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    const text = cleanCell(roman).toUpperCase();
    let total = 0;
    let previous = 0;

    for (let i = text.length - 1; i >= 0; i--) {
        const value = values[text[i]] || 0;
        if (value < previous) {
            total -= value;
        } else {
            total += value;
            previous = value;
        }
    }

    return total;
}

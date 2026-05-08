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

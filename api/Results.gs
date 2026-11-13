/**
 * Escriptura i gestió de resultats.
 */

function saveResult(data) {
    return withWriteLock(() => {
        const sheet = getSheet('resultats');
        if (!sheet) return { status: 'error', message: 'Pestanya resultats no trobada' };

        const resultId = data.resultat_id || Utilities.getUuid();
        ensureResultIdColumn(sheet);
        if (resultAlreadySaved(sheet, resultId)) {
            return { status: 'success', message: 'Resultat ja guardat', duplicate: true };
        }

        // Aquesta llista ha de seguir el mateix ordre que les capçaleres de la pestanya "resultats".
        const result = {
            data: new Date(),
            timestamp: new Date(),
            resultat_id: resultId,
            email: data.email,
            curs: data.curs,
            grup: data.grup || data.curs,
            projecte: data.projecte,
            app: data.app,
            nivell: data.nivell,
            puntuacio: data.puntuacio,
            temps_segons: data.temps_segons,
            feedback_pos: data.feedback_pos,
            feedback_neg: data.feedback_neg
        };

        const row = buildResultRow(sheet, result);

        sheet.appendRow(row);
        clearSheetCache(sheet);
        return { status: 'success', message: 'Resultat guardat correctament' };
    });
}

function ensureResultIdColumn(sheet) {
    const lastColumn = sheet.getLastColumn();
    const headers = lastColumn > 0
        ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(normalizeHeader)
        : [];

    if (headers.indexOf('resultat_id') === -1) {
        sheet.getRange(1, lastColumn + 1).setValue('resultat_id');
    }
}

function resultAlreadySaved(sheet, resultId) {
    const lastColumn = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(normalizeHeader);
    const idColumn = headers.indexOf('resultat_id');
    const lastRow = sheet.getLastRow();

    if (idColumn === -1 || lastRow < 2) return false;

    const ids = sheet.getRange(2, idColumn + 1, lastRow - 1, 1).getDisplayValues().flat();
    return ids.includes(String(resultId));
}

function buildResultRow(sheet, result) {
    const lastColumn = sheet.getLastColumn();

    if (lastColumn > 0) {
        const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(normalizeHeader);

        if (headers.indexOf('grup') !== -1) {
            return headers.map(header => Object.prototype.hasOwnProperty.call(result, header) ? result[header] : '');
        }
    }

    return [
        result.data,
        result.email,
        result.curs,
        result.projecte,
        result.app,
        result.nivell,
        result.puntuacio,
        result.temps_segons,
        result.feedback_pos,
        result.feedback_neg,
        result.resultat_id
    ];
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
        clearSheetCache(sheet);
        return { status: 'success', message: 'Resposta guardada' };
    });
}

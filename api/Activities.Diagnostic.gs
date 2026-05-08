/**
 * Activitats diagnòstiques.
 */

function getDiagnosticQuestions() {
    try {
        const sheet = getSheet('diagnostic_preguntes');
        if (!sheet) return { status: 'error', message: 'No s\'ha trobat la pestanya diagnostic_preguntes' };

        const data = getCachedSheetValues(sheet);
        if (data.length <= 1) return { status: 'success', questions: [] };
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

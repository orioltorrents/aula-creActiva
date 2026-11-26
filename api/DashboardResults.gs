/**
 * Backend del Dashboard de Professorat — Aula CreActiva
 */

function getDashboardResults(data) {
    const requestData = data || {};
    const userEmail = String(requestData.email || Session.getActiveUser().getEmail() || '').trim().toLowerCase();

    if (!userEmail) {
        return { status: 'error', message: 'No s\'ha pogut identificar la sessió.' };
    }

    const usersSheet = getSheet('usuaris');
    if (!usersSheet) {
        return { status: 'error', message: 'Pestanya usuaris no trobada' };
    }

    const usersData = getCachedSheetValues(usersSheet);
    if (usersData.length <= 1) {
        return { status: 'error', message: 'No hi ha usuaris registrats' };
    }

    const userHeaders = usersData[0].map(normalizeHeader);
    const emailIndex = findHeaderIndex(userHeaders, ['email']);
    const roleIndex = findHeaderIndex(userHeaders, ['rol']);
    const nameIndex = findHeaderIndex(userHeaders, ['nom']);
    const surnameIndex = findHeaderIndex(userHeaders, ['cognoms']);

    if (emailIndex === -1 || roleIndex === -1) {
        return { status: 'error', message: 'Falten les columnes email o rol a la pestanya usuaris' };
    }

    let currentUser = null;
    usersData.slice(1).forEach(row => {
        if (String(row[emailIndex] || '').trim().toLowerCase() === userEmail) {
            currentUser = {
                email: String(row[emailIndex] || ''),
                role: String(row[roleIndex] || '').trim().toLowerCase(),
                name: nameIndex === -1 ? '' : String(row[nameIndex] || ''),
                surname: surnameIndex === -1 ? '' : String(row[surnameIndex] || '')
            };
        }
    });

    if (!currentUser || (currentUser.role !== 'professor' && currentUser.role !== 'admin')) {
        return { status: 'error', message: 'Accés exclusiu per al professorat.' };
    }

    const resultsSheet = getSheet('resultats');
    if (!resultsSheet) {
        return { status: 'error', message: 'Pestanya resultats no trobada' };
    }

    const resultsData = getCachedSheetValues(resultsSheet);
    if (resultsData.length <= 1) {
        return { status: 'success', user: currentUser, resultats: [] };
    }

    const headers = resultsData[0].map(normalizeHeader);
    const resultats = resultsData.slice(1).map(row => {
        const record = {};
        headers.forEach((header, index) => {
            record[header] = row[index] === undefined ? '' : row[index];
        });
        return record;
    });

    return {
        status: 'success',
        user: currentUser,
        resultats: resultats
    };
}

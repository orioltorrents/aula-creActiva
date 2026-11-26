/**
 * Backend del Dashboard de Professorat — Aula CreActiva
 */

function getDashboardResults(data) {
    const requestData = data || {};
    let authentication;
    if (requestData.dashboardToken) {
        const key = dashboardSessionKey_(requestData.dashboardToken);
        const session = key && CacheService.getScriptCache().get(key);
        authentication = session
            ? { status: 'success', user: JSON.parse(session) }
            : { status: 'error', code: 'dashboard_session_expired', message: 'La sessió ha caducat. Torna a iniciar sessió.' };
    } else {
        authentication = loginUser(requestData.email, requestData.password);
    }
    if (!authentication || authentication.status !== 'success') {
        return authentication || { status: 'error', message: 'No s\'ha pogut validar el compte.' };
    }

    const currentUser = authentication.user || {};
    if (!isDashboardTeacher_(currentUser)) {
        return { status: 'error', message: 'Accés exclusiu per al professorat.' };
    }

    const userForDashboard = {
        email: currentUser.email || '',
        nom: currentUser.nom || currentUser.name || '',
        cognoms: currentUser.cognoms || currentUser.surname || ''
    };

    const resultsSheet = getSheet('resultats');
    if (!resultsSheet) {
        return { status: 'error', message: 'Pestanya resultats no trobada' };
    }

    const resultsData = getCachedSheetValues(resultsSheet);
    if (resultsData.length <= 1) {
        return { status: 'success', user: userForDashboard, resultats: [], dashboardToken: authentication.dashboardToken };
    }

    const headers = resultsData[0].map(normalizeHeader);
    const resultats = resultsData.slice(1).map(row => {
        const record = {};
        headers.forEach((header, index) => {
            const value = row[index] === undefined ? '' : row[index];
            record[header] = value instanceof Date ? value.toISOString() : value;
        });
        return record;
    });

    return {
        status: 'success',
        user: userForDashboard,
        dashboardToken: authentication.dashboardToken,
        resultats: resultats
    };
}

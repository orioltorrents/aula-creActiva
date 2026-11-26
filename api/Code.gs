/**
 * API backend de l'app Aula CreActiva.
 *
 * Punt d'entrada públic de la Web App d'Apps Script.
 * La resta de la lògica està separada en fitxers .gs temàtics.
 */

function doGet(e) {
    if (e && e.parameter && e.parameter.page === 'dashboard-professors') {
        return HtmlService.createTemplateFromFile('dashboard-professors')
            .evaluate()
            .setTitle('Dashboard de Professorat — Aula CreActiva')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    return handleRequest(e);
}

function doPost(e) {
    return handleRequest(e);
}

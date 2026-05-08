/**
 * Router principal de l'API.
 *
 * Llegeix l'action rebuda pel frontend i la connecta amb la funció corresponent.
 */

const ACTIONS = {
    login: data => loginUser(data.email, data.password),
    getProjects: data => getProjects(data.curs),

    saveResult: data => saveResult(data),
    createResultsSheet: data => createResultsSheet(data),
    createGroupStudentsSheet: data => createGroupStudentsSheet(data),
    getResultGroups: () => getResultGroups(),

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
    getBioConceptDragData: data => getBioConceptDragData(data.sheetName),

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
        const request = e || {};
        let data = { ...(request.parameter || {}) };

        if (request.postData && request.postData.contents) {
            try {
                const bodyJson = JSON.parse(request.postData.contents);
                data = { ...data, ...bodyJson };
            } catch (err) {
                // Si el body no és JSON, ignorem el cos i treballem només amb els paràmetres.
            }
        }

        const action = data.action;
        const handler = ACTIONS[action];

        const result = handler
            ? handler(data)
            : { status: 'error', message: 'Acció desconeguda' };

        return createJSONOutput(result);

    } catch (error) {
        return createJSONOutput({
            status: 'error',
            message: error.toString()
        });
    }
}

function createJSONOutput(object) {
    return ContentService
        .createTextOutput(JSON.stringify(object))
        .setMimeType(ContentService.MimeType.JSON);
}
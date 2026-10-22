/**
 * Visibilitat opcional de projectes i activitats per curs.
 *
 * Pestanya esperada: disponibilitat
 * Columnes: curs, projecte_id, tipus, activitat_id, visible
 */

function getAvailability(curs) {
    const sheet = getFirstExistingSheet(['disponibilitat', 'disponibilidad', 'availability']);

    if (!sheet) {
        return { status: 'success', disponibilitat: [] };
    }

    const values = getCachedSheetValues(sheet);
    if (values.length < 2) {
        return { status: 'success', disponibilitat: [] };
    }

    const headers = values[0];
    const courseIndex = findLooseHeaderIndex(headers, ['curs', 'curso', 'course']);
    const projectIndex = findLooseHeaderIndex(headers, ['projecte_id', 'proyecto_id', 'project_id']);
    const typeIndex = findLooseHeaderIndex(headers, ['tipus', 'tipo', 'type']);
    const activityIndex = findLooseHeaderIndex(headers, ['activitat_id', 'actividad_id', 'activity_id']);
    const visibleIndex = findLooseHeaderIndex(headers, ['visible', 'actiu', 'activo', 'enabled']);

    if (courseIndex === -1 || projectIndex === -1 || visibleIndex === -1) {
        return { status: 'success', disponibilitat: [] };
    }

    const requestedCourse = normalizeAvailabilityCourse(curs);
    const rows = values.slice(1).map(row => ({
        curs: cleanCell(row[courseIndex]),
        projecte_id: cleanCell(row[projectIndex]),
        tipus: typeIndex === -1 ? '' : cleanCell(row[typeIndex]).toLowerCase(),
        activitat_id: activityIndex === -1 ? '' : cleanCell(row[activityIndex]),
        visible: parseAvailabilityBoolean(row[visibleIndex])
    })).filter(row => {
        return row.projecte_id && normalizeAvailabilityCourse(row.curs) === requestedCourse;
    });

    return { status: 'success', disponibilitat: rows };
}

function normalizeAvailabilityCourse(value) {
    const normalized = normalizeLoose(value);
    const aliases = {
        '1reso': '1eso',
        '2neso': '2eso',
        '3reso': '3eso',
        '4teso': '4eso',
        '1rbatxillerat': '1batx',
        '1batxillerat': '1batx',
        '2nbatxillerat': '2batx',
        '2batxillerat': '2batx'
    };

    return aliases[normalized] || normalized;
}

function parseAvailabilityBoolean(value) {
    if (typeof value === 'boolean') return value;

    const normalized = normalizeLoose(value);
    return !['false', '0', 'no', 'off', 'inactiu', 'inactivo'].includes(normalized);
}

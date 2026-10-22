/**
 * Utilitats generals compartides.
 */

function normalizeHeader(value) {
    return String(value || '')
        .replace(/^\uFEFF/, '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s-]+/g, '_');
}

function normalizeLoose(value) {
    return normalizeHeader(value).replace(/_/g, '');
}

function cleanCell(value) {
    return String(value === undefined || value === null ? '' : value).trim();
}

function findHeaderIndex(headers, names) {
    const normalizedHeaders = headers.map(normalizeHeader);

    for (let i = 0; i < names.length; i++) {
        const index = normalizedHeaders.indexOf(normalizeHeader(names[i]));
        if (index !== -1) return index;
    }

    return -1;
}

function findLooseHeaderIndex(headers, names) {
    const normalizedHeaders = headers.map(normalizeLoose);

    for (let i = 0; i < names.length; i++) {
        const index = normalizedHeaders.indexOf(normalizeLoose(names[i]));
        if (index !== -1) return index;
    }

    return -1;
}

function shuffle(array) {
    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }

    return result;
}

function sample(array, maxItems) {
    return shuffle(array).slice(0, maxItems);
}

function rowToObject(headers, row) {
    const object = {};

    headers.forEach((header, index) => {
        object[header] = row[index];
    });

    return object;
}

// Normalitza text per comparar valors escrits de formes una mica diferents.
function normalizeStr(str) {
    if (!str) return "";
    return cleanCell(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/**
 * Activitats del projecte SolidArt.
 */

function getSolidartQuadres(dificultat) {
    const sheet = getSheet('quadres');
    if (!sheet) return { status: 'error', message: 'Pestanya quadres no trobada' };

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a la pestanya quadres' };

    const headers = data[0].map(normalizeHeader);
    const difIdx = findHeaderIndex(headers, ['dificultat']);
    const imgIdx = findHeaderIndex(headers, ['nom_imatge']);
    const qIdx = findHeaderIndex(headers, ['pregunta']);
    const ansIdx = findHeaderIndex(headers, ['resposta_correcta']);
    const inc1Idx = findHeaderIndex(headers, ['incorrecta_1']);
    const inc2Idx = findHeaderIndex(headers, ['incorrecta_2']);
    const inc3Idx = findHeaderIndex(headers, ['incorrecta_3']);

    if (imgIdx === -1 || qIdx === -1 || ansIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques a la pestanya quadres' };
    }

    let filtered = data.slice(1);
    const normalizedTarget = normalizeStr(dificultat);

    if (dificultat && normalizedTarget !== 'mix' && difIdx !== -1) {
        filtered = filtered.filter(row => normalizeStr(row[difIdx]) === normalizedTarget);
    }

    if (filtered.length === 0) {
        return {
            status: 'error',
            message: 'No s\'han trobat preguntes per a la dificultat: ' + dificultat + '. Revisa la columna "dificultat" de la pestanya "quadres".'
        };
    }

    const questions = sample(filtered, 10).map(row => {
        const options = shuffle([
            row[ansIdx],
            row[inc1Idx],
            row[inc2Idx],
            row[inc3Idx]
        ].filter(o => cleanCell(o) !== ""));

        return {
            dificultat: row[difIdx],
            imatge: row[imgIdx],
            pregunta: row[qIdx],
            resposta_correcta: row[ansIdx],
            opcions: options
        };
    });

    return { status: 'success', questions };
}

function getSolidartQuadres2(dificultat) {
    const sheet = getSheet('quadres2');
    if (!sheet) return { status: 'error', message: 'ERROR: La pestanya "quadres2" no existeix al Google Sheet.' };

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'error', message: 'ERROR: La pestanya "quadres2" està buida (només té la capçalera o res).' };

    const headers = data[0].map(normalizeHeader);
    const difIdx = findHeaderIndex(headers, ['dificultat']);
    const qIdx = findHeaderIndex(headers, ['pregunta']);
    const imgCorrectIdx = findHeaderIndex(headers, ['img_correcta']);
    const inc1Idx = findHeaderIndex(headers, ['incorrecta_1']);
    const inc2Idx = findHeaderIndex(headers, ['incorrecta_2']);
    const inc3Idx = findHeaderIndex(headers, ['incorrecta_3']);

    // Acceptem dos noms de columna per no trencar Sheets antics.
    const finalImgIdx = imgCorrectIdx !== -1 ? imgCorrectIdx : findHeaderIndex(headers, ['nom_imatge']);

    if (qIdx === -1 || finalImgIdx === -1) {
        return {
            status: 'error',
            message: 'ERROR: Falten columnes a "quadres2". Necessito "pregunta" i "img_correcta" (o "nom_imatge"). Columnes trobades: ' + headers.join(', ')
        };
    }

    let filtered = data.slice(1).filter(row => cleanCell(row[qIdx]) !== "");
    const normalizedTarget = normalizeStr(dificultat);

    if (dificultat && normalizedTarget !== 'mix' && difIdx !== -1) {
        filtered = filtered.filter(row => normalizeStr(row[difIdx]) === normalizedTarget);
    }

    if (filtered.length === 0) {
        return {
            status: 'error',
            message: 'No s\'han trobat preguntes per a la dificultat: ' + dificultat + '. Revisa la columna "dificultat".'
        };
    }

    const questions = sample(filtered, 10).map(row => {
        const options = shuffle([
            row[finalImgIdx],
            row[inc1Idx] || "",
            row[inc2Idx] || "",
            row[inc3Idx] || ""
        ].filter(o => cleanCell(o) !== ""));

        return {
            dificultat: difIdx !== -1 ? row[difIdx] : 'Mix',
            pregunta: row[qIdx],
            img_correcta: row[finalImgIdx],
            opcions: options
        };
    });

    return { status: 'success', questions };
}

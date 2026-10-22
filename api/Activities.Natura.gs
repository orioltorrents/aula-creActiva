/**
 * Activitats del projecte Entorns de Natura.
 */

function getNaturaQuestions(ecosistema) {
    const sheet = getSheet('preguntes_natura');
    if (!sheet) return { status: 'error', message: 'Pestanya preguntes_natura no trobada' };

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a preguntes_natura' };

    const headers = data[0].map(normalizeHeader);
    const ecoIdx = findHeaderIndex(headers, ['ecosistema']);

    if (ecoIdx === -1) return { status: 'error', message: 'Falta la columna Ecosistema a preguntes_natura' };

    const normalizedEcosistema = cleanCell(ecosistema).toLowerCase();
    let filtered = data.slice(1).filter(row => cleanCell(row[ecoIdx]).toLowerCase() === normalizedEcosistema);

    // Mostrem com a màxim 10 preguntes diferents cada vegada.
    filtered = sample(filtered, 10);

    const questions = filtered.map(row => {
        const q = {};
        data[0].forEach((h, i) => q[h] = row[i]);
        return q;
    });

    return { status: 'success', questions: questions };
}

function getImpactePhases() {
    const sheet = getSheet('fases_impacte');
    if (!sheet) return { status: 'error', message: 'Pestanya fases_impacte no trobada' };

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a fases_impacte' };

    const headers = data[0].map(normalizeHeader);
    const ordreIdx = findHeaderIndex(headers, ['ordre']);
    const faseIdx = findHeaderIndex(headers, ['fase']);

    if (faseIdx === -1) return { status: 'error', message: 'Falta la columna Fase a fases_impacte' };

    const phases = data.slice(1)
        .filter(row => row[faseIdx])
        .map((row, i) => ({
            id: `impacte_${ordreIdx !== -1 && row[ordreIdx] ? row[ordreIdx] : (i + 1)}`,
            text: cleanCell(row[faseIdx]),
            order: ordreIdx !== -1 && row[ordreIdx] ? Number(row[ordreIdx]) : (i + 1)
        }))
        .sort((a, b) => a.order - b.order)
        .slice(0, 10)
        .map(({ id, text }) => ({ id, text }));

    return { status: 'success', phases: phases };
}

function getNaturaPreguntes(subambit, tipusBatxillerat) {
    const sheet = getSheet('natura_preguntes');
    if (!sheet) return { status: 'error', message: 'Pestanya natura_preguntes no trobada' };

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a natura_preguntes' };

    const headers = data[0].map(normalizeHeader);
    const pqIdx = findHeaderIndex(headers, ['pregunta']);
    const invIdx = findHeaderIndex(headers, ['investigable/no investigable']);
    const subIdx = findHeaderIndex(headers, ['subambit']);
    const tipusIdx = findHeaderIndex(headers, ['tipus_batxillerat']);
    const raoIdx = findHeaderIndex(headers, ['perquè_no_investigable']);

    if (pqIdx === -1 || invIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques a natura_preguntes' };
    }

    // Primer pas: sense filtres, retornem les opcions de configuració del joc.
    if (!subambit && !tipusBatxillerat) {
        const subambitsSet = new Set();
        const ambitsSet = new Set();
        for (let i = 1; i < data.length; i++) {
            if (data[i][pqIdx]) {
                const s = cleanCell(data[i][subIdx]);
                const a = cleanCell(data[i][tipusIdx]);
                if (s) subambitsSet.add(s);
                if (a) ambitsSet.add(a);
            }
        }
        return {
            status: 'success',
            level: 'setup',
            subambits: Array.from(subambitsSet).sort(),
            ambits: Array.from(ambitsSet).sort()
        };
    }

    // Segon pas: amb filtres, retornem les preguntes que toquen.
    let filtered = data.slice(1).filter(row => {
        const hasQ = cleanCell(row[pqIdx]) !== '';

        const normalizedSubambit = cleanCell(subambit).toLowerCase();
        const normalizedBatxillerat = cleanCell(tipusBatxillerat).toLowerCase();
        const isMixSub = !subambit || normalizedSubambit === 'mix' || normalizedSubambit === 'barrejat';
        const isMixAmbit = !tipusBatxillerat || normalizedBatxillerat === 'mix' || normalizedBatxillerat === 'barrejat';

        const matchesSub = isMixSub ? true : (cleanCell(row[subIdx]).toLowerCase() === normalizedSubambit);
        const matchesAmbit = isMixAmbit ? true : (cleanCell(row[tipusIdx]).toLowerCase() === normalizedBatxillerat);

        return hasQ && matchesSub && matchesAmbit;
    });

    const questions = sample(filtered, 15).map(row => ({
        pregunta: row[pqIdx],
        investigable: row[invIdx],
        perque_no_investigable: raoIdx !== -1 ? row[raoIdx] : ''
    }));

    return { status: 'success', level: 'questions', questions };
}

function getNaturaTemesQuestions(tipusBatxillerat) {
    const sheet = getSheet('natura_temes');
    if (!sheet) return { status: 'error', message: 'Pestanya natura_temes no trobada' };

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a natura_temes' };

    const headers = data[0].map(normalizeHeader);
    const temaIdx = findHeaderIndex(headers, ['tema']);
    const tipusBtxIdx = findHeaderIndex(headers, ['tipus_batxillerat']);

    const colIdxs = [];
    for (let i = 1; i <= 10; i++) {
        colIdxs.push({
            pIdx: findHeaderIndex(headers, [`pregunta_${i}`]),
            tIdx: findHeaderIndex(headers, [`tipus_${i}`])
        });
    }

    if (temaIdx === -1 || colIdxs[0].pIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques a natura_temes' };
    }

    if (!tipusBatxillerat || tipusBatxillerat.trim() === '') {
        const categoriesSet = new Set();
        if (tipusBtxIdx !== -1) {
            for (let i = 1; i < data.length; i++) {
                const cat = cleanCell(data[i][tipusBtxIdx]);
                if (cat) categoriesSet.add(cat);
            }
        }
        if (categoriesSet.size === 0 && data.length > 1) categoriesSet.add('General');
        return { status: 'success', categories: Array.from(categoriesSet) };
    }

    let filtered = data.slice(1).filter(row => {
        const hasTema = cleanCell(row[temaIdx]) !== '';
        const isGen = tipusBatxillerat.toLowerCase() === 'general';
        const isType = (tipusBtxIdx !== -1 && !isGen) ? (cleanCell(row[tipusBtxIdx]).toLowerCase() === cleanCell(tipusBatxillerat).toLowerCase()) : true;
        return hasTema && isType;
    });

    const topics = sample(filtered, 10).map(row => {
        let qs = [];
        for (let i = 0; i < 10; i++) {
            const idxs = colIdxs[i];
            if (idxs.pIdx !== -1 && cleanCell(row[idxs.pIdx])) {
                qs.push({
                    text: cleanCell(row[idxs.pIdx]),
                    type: idxs.tIdx !== -1 ? cleanCell(row[idxs.tIdx]) : ''
                });
            }
        }
        return { tema: row[temaIdx], preguntes: shuffle(qs) };
    });

    return { status: 'success', topics };
}

/**
 * Activitats del Treball de Recerca.
 */

function getBiblioQuestions() {
    const sheet = getSheet('bibliografia-APA');
    if (!sheet) return { status: 'error', message: 'Pestanya bibliografia-APA no trobada' };

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a bibliografia-APA' };

    // Fem les capçaleres més fàcils de comparar: minúscules, sense accents ni espais sobrants.
    const rawHeaders = data[0].map(cleanCell);
    const headers = rawHeaders.map(normalizeHeader);
    const findIdx = names => findHeaderIndex(headers, names);

    const typeIdx = findIdx(['Tipus de pregunta', 'Tipus', 'Tipo de pregunta', 'Tipo']);
    const levelIdx = findIdx(['Nivell', 'Nivel', 'Level']);
    const qIdx = findIdx(['Pregunta', 'Question']);
    const correctIdx = findIdx(['Correcta', 'Correct', 'Correcta ']);
    const wrong1Idx = findIdx(['Incorrecta1', 'Incorrecta 1', 'Incorrecta_1']);
    const wrong2Idx = findIdx(['Incorrecta2', 'Incorrecta 2', 'Incorrecta_2']);
    const wrong3Idx = findIdx(['Incorrecta3', 'Incorrecta 3', 'Incorrecta_3']);

    if (typeIdx === -1) return { status: 'error', message: 'Falta la columna "Tipus de pregunta"' };
    if (qIdx === -1) return { status: 'error', message: 'Falta la columna "Pregunta"' };
    if (correctIdx === -1) return { status: 'error', message: 'Falta la columna "Correcta"' };

    const questions = data.slice(1)
        .filter(row => cleanCell(row[qIdx]) !== "")
        .map(row => {
            const type = cleanCell(row[typeIdx]);
            const level = cleanCell(row[levelIdx]);
            const q = cleanCell(row[qIdx]);
            const correct = cleanCell(row[correctIdx]);

            const wrongs = [
                wrong1Idx !== -1 ? row[wrong1Idx] : "",
                wrong2Idx !== -1 ? row[wrong2Idx] : "",
                wrong3Idx !== -1 ? row[wrong3Idx] : ""
            ]
                .map(cleanCell)
                .filter(v => v);

            const alternatives = [correct, ...wrongs].filter(v => v);

            return {
                // Format antic: algunes pantalles encara llegeixen aquests noms exactes.
                "Tipus de pregunta": type,
                "Nivell": level,
                "Pregunta": q,
                "Correcta": correct,
                "Incorrecta1": wrongs[0] || "",
                "Incorrecta2": wrongs[1] || "",
                "Incorrecta3": wrongs[2] || "",

                // Format nou: més còmode per treballar des de JavaScript.
                type,
                level,
                q,
                correct,
                alternatives
            };
        });

    return { status: 'success', questions };
}

function getTrTemesQuestions(tipusBatxillerat) {
    const sheet = getSheet('temes-TR-preguntes');
    if (!sheet) return { status: 'error', message: 'Pestanya temes-TR-preguntes no trobada' };

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a temes-TR-preguntes' };

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
        return { status: 'error', message: 'Falten columnes crítiques (com a mínim cal "tema" i "pregunta_1") a temes-TR-preguntes' };
    }

    // Si encara no s'ha triat categoria, retornem les opcions disponibles per muntar la pantalla inicial.
    if (!tipusBatxillerat || tipusBatxillerat.trim() === '') {
        const categoriesSet = new Set();
        if (tipusBtxIdx !== -1) {
            for (let i = 1; i < data.length; i++) {
                const cat = cleanCell(data[i][tipusBtxIdx]);
                if (cat) categoriesSet.add(cat);
            }
        }

        // Si la pestanya té dades però no té categories, donem una opció genèrica per poder jugar igualment.
        if (categoriesSet.size === 0 && data.length > 1) {
            categoriesSet.add('General');
        }

        return { status: 'success', categories: Array.from(categoriesSet) };
    }

    // Quan ja tenim categoria, filtrem els temes i ignorem files sense tema.
    let questionsFiltered = data.slice(1).filter(row => {
        const hasTema = cleanCell(row[temaIdx]) !== '';

        const isGeneralFallback = (tipusBatxillerat || "").toLowerCase() === 'general';
        const isTargetType = (tipusBtxIdx !== -1 && !isGeneralFallback)
            ? (cleanCell(row[tipusBtxIdx]).toLowerCase() === cleanCell(tipusBatxillerat).toLowerCase())
            : true;

        return hasTema && isTargetType;
    });

    // Triem fins a 10 temes a l'atzar.
    questionsFiltered = sample(questionsFiltered, 10);

    const topics = questionsFiltered.map(row => {
        const tema = row[temaIdx];

        let qs = [];
        for (let i = 0; i < 10; i++) {
            const idxs = colIdxs[i];
            qs.push({
                id: `q${i + 1}`,
                text: idxs.pIdx !== -1 ? cleanCell(row[idxs.pIdx]) : '',
                type: idxs.tIdx !== -1 ? cleanCell(row[idxs.tIdx]) : ''
            });
        }

        // Un tema pot tenir menys de 10 preguntes; descartem les columnes buides.
        qs = qs.filter(q => cleanCell(q.text) !== '');

        qs = shuffle(qs);

        return {
            tema: tema,
            preguntes: qs
        };
    });

    return { status: 'success', topics: topics };
}

function getTrQuestions(subambit, tipusBatxillerat) {
    const sheet = getSheet('preguntes_investigables');
    if (!sheet) return { status: 'error', message: 'Pestanya preguntes_investigables no trobada' };

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a preguntes_investigables' };

    const headers = data[0].map(normalizeHeader);

    const idIdx = findHeaderIndex(headers, ['id']);
    const pqIdx = findHeaderIndex(headers, ['pregunta']);
    const invIdx = findHeaderIndex(headers, ['investigable/no investigable']);
    const subIdx = findHeaderIndex(headers, ['subambit']);
    const tipusIdx = findHeaderIndex(headers, ['tipus_batxillerat']);
    const raoIdx = findHeaderIndex(headers, ['perquè_no_investigable']);
    const tipusErrorIdx = findHeaderIndex(headers, ['tipus_error']);
    const escalaIdx = findHeaderIndex(headers, ['escala_tr']);

    if (pqIdx === -1 || invIdx === -1) {
        return { status: 'error', message: 'Falten columnes crítiques (cal "pregunta" i "investigable/no investigable")' };
    }

    // Primer pas del joc: si no hi ha filtres, retornem les opcions perquè l'alumne pugui triar.
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

    // Segon pas del joc: amb els filtres triats, retornem les preguntes.
    let questionsFiltered = data.slice(1).filter(row => {
        const hasQuestion = cleanCell(row[pqIdx]) !== '';

        // "Barrejat" o "Mix" vol dir: no filtris per aquest camp.
        const normalizedSubambit = cleanCell(subambit).toLowerCase();
        const normalizedBatxillerat = cleanCell(tipusBatxillerat).toLowerCase();
        const isMixSub = !subambit || normalizedSubambit === 'mix' || normalizedSubambit === 'barrejat';
        const isMixAmbit = !tipusBatxillerat || normalizedBatxillerat === 'mix' || normalizedBatxillerat === 'barrejat';

        const matchesSub = isMixSub ? true : (cleanCell(row[subIdx]).toLowerCase() === normalizedSubambit);
        const matchesAmbit = isMixAmbit ? true : (cleanCell(row[tipusIdx]).toLowerCase() === normalizedBatxillerat);

        return hasQuestion && matchesSub && matchesAmbit;
    });

    // Triem fins a 15 preguntes a l'atzar.
    questionsFiltered = sample(questionsFiltered, 15);

    const questions = questionsFiltered.map(row => {
        return {
            id: idIdx !== -1 ? row[idIdx] : '',
            pregunta: row[pqIdx],
            investigable: row[invIdx],
            tipus_batxillerat: tipusIdx !== -1 ? row[tipusIdx] : '',
            perque_no_investigable: raoIdx !== -1 ? row[raoIdx] : '',
            tipus_error: tipusErrorIdx !== -1 ? row[tipusErrorIdx] : '',
            escala_tr: escalaIdx !== -1 ? row[escalaIdx] : ''
        };
    });

    return { status: 'success', level: 'questions', questions: questions };
}

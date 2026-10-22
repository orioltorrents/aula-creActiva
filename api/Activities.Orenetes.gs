/**
 * Activitats d'orenetes.
 */

function getOrenetesData() {
    try {
        const sheet = getSheet('orenetes_nius');
        if (!sheet) return { status: 'error', message: 'No s\'ha trobat la pestanya orenetes_nius' };

        const data = getCachedSheetValues(sheet);
        if (data.length <= 1) return { status: 'success', data: [] };

        const headers = data[0].map(normalizeHeader);
        const findIdx = names => findHeaderIndex(headers, names);

        const dificultatIdx = findIdx(['dificultat']);
        const imgIdx = findIdx(['imatge', 'nom_imatge']);
        const descIdx = findIdx(['descripcio', 'descripció', 'descripcio imatge']);
        const bonEstatIdx = findIdx(['nius en bon estat', 'bon estat']);
        const actiusIdx = findIdx(['nius actius', 'actius']);
        const trencatsIdx = findIdx(['nius trencats', 'trencats']);
        const restesIdx = findIdx(['restes', 'nius restes']);

        if (imgIdx === -1) {
            return { status: 'error', message: 'Falta la columna nom_imatge a la pestanya orenetes_nius' };
        }

        const questions = [];

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row[imgIdx]) {
                questions.push({
                    dificultat: dificultatIdx !== -1 ? cleanCell(row[dificultatIdx]) : '',
                    imatge: row[imgIdx],
                    descripcio: descIdx !== -1 ? cleanCell(row[descIdx]) : '',
                    bonEstat: bonEstatIdx !== -1 ? Number(row[bonEstatIdx]) || 0 : 0,
                    actius: actiusIdx !== -1 ? Number(row[actiusIdx]) || 0 : 0,
                    trencats: trencatsIdx !== -1 ? Number(row[trencatsIdx]) || 0 : 0,
                    restes: restesIdx !== -1 ? Number(row[restesIdx]) || 0 : 0
                });
            }
        }

        return { status: 'success', data: questions };
    } catch(e) {
        return { status: 'error', message: e.toString() };
    }
}

function getOrenetesPreguntes() {
    try {
        const sheet = getFirstExistingSheet(['orenetes_preguntes', 'preguntes_orenetes']);

        if (!sheet) {
            return { status: 'error', message: 'No s\'ha trobat la pestanya orenetes_preguntes' };
        }

        const data = getCachedSheetValues(sheet);
        if (data.length <= 1) return { status: 'success', questions: [] };

        const headers = data[0].map(normalizeOrenetesPreguntesHeader);
        const findIdx = names => findHeaderIndex(headers, names);

        const difficultyIdx = findIdx(['dificultat']);
        const topicIdx = findIdx(['tema']);
        const imageIdx = findIdx(['nom_imatge', 'imatge', 'imatge_pregunta']);
        const questionIdx = findIdx(['pregunta']);
        const correctIdx = findIdx(['resposta_correcta', 'correcta']);
        const correctImageIdx = findIdx(['imatge_correcta', 'foto_correcta']);
        const wrongIdxs = [
            findIdx(['incorrecta_1', 'resposta_incorrecta_1']),
            findIdx(['incorrecta_2', 'resposta_incorrecta_2']),
            findIdx(['incorrecta_3', 'resposta_incorrecta_3'])
        ];
        const wrongImageIdxs = [
            findIdx(['imatge_incorrecta_1', 'foto_incorrecta_1']),
            findIdx(['imatge_incorrecta_2', 'foto_incorrecta_2']),
            findIdx(['imatge_incorrecta_3', 'foto_incorrecta_3'])
        ];

        const missingColumns = [
            { name: 'pregunta', index: questionIdx },
            { name: 'resposta_correcta', index: correctIdx }
        ].filter(column => column.index === -1).map(column => column.name);

        if (missingColumns.length > 0) {
            return {
                status: 'error',
                message: 'Falten columnes a ' + sheet.getName() + ': ' + missingColumns.join(', ')
            };
        }

        const questions = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const questionText = cleanOrenetesPreguntesCell(row[questionIdx]);
            const correctText = cleanOrenetesPreguntesCell(row[correctIdx]);
            const correctImage = correctImageIdx === -1
                ? getOrenetesPreguntesImageFromCell(correctText)
                : cleanOrenetesPreguntesCell(row[correctImageIdx]);
            const wrongTexts = wrongIdxs.map(idx => idx === -1 ? '' : cleanOrenetesPreguntesCell(row[idx]));
            const wrongImages = wrongTexts.map((wrong, index) => {
                const imageIdx = wrongImageIdxs[index];
                if (imageIdx !== -1) return cleanOrenetesPreguntesCell(row[imageIdx]);
                return getOrenetesPreguntesImageFromCell(wrong);
            });

            const options = [
                {
                    text: getOrenetesPreguntesOptionText(correctText, correctImage),
                    value: correctText || correctImage,
                    image: correctImage,
                    correct: true
                }
            ].concat(wrongImages.map((image, index) => ({
                text: getOrenetesPreguntesOptionText(wrongTexts[index], image),
                value: wrongTexts[index] || image,
                image: image,
                correct: false
            }))).filter(option => option.value !== '');

            if (questionText && (correctText || correctImage) && options.length >= 2) {
                questions.push({
                    id: i,
                    difficulty: difficultyIdx === -1 ? '' : cleanOrenetesPreguntesCell(row[difficultyIdx]),
                    topic: topicIdx === -1 ? '' : cleanOrenetesPreguntesCell(row[topicIdx]),
                    image: imageIdx === -1 ? '' : cleanOrenetesPreguntesCell(row[imageIdx]),
                    question: questionText,
                    correct: correctText || correctImage,
                    options: options
                });
            }
        }

        return { status: 'success', questions: questions };
    } catch(e) {
        return { status: 'error', message: e.toString() };
    }
}

function normalizeOrenetesPreguntesHeader(value) {
    return normalizeHeader(value);
}

function cleanOrenetesPreguntesCell(value) {
    return cleanCell(value);
}

function getOrenetesPreguntesImageFromCell(value) {
    const cleanValue = cleanOrenetesPreguntesCell(value);
    return isOrenetesPreguntesImageFile(cleanValue) ? cleanValue : '';
}

function getOrenetesPreguntesOptionText(text, image) {
    const cleanText = cleanOrenetesPreguntesCell(text);
    return cleanText === cleanOrenetesPreguntesCell(image) ? '' : cleanText;
}

function isOrenetesPreguntesImageFile(value) {
    return /\.(png|jpe?g|webp|gif|svg)$/i.test(cleanCell(value));
}

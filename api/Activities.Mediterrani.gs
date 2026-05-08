/**
 * Activitats del projecte Mediterrani.
 */

function getMediterraniBiodiversitatQuestions() {
    const sheet = getFirstExistingSheet(['mediterrani_biodiversitat', 'biodiversitat_mediterrani']);

    if (!sheet) {
        return {
            status: 'error',
            message: 'No he trobat la pestanya mediterrani_biodiversitat al Google Sheet'
        };
    }

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) {
        return { status: 'error', message: 'Sense dades a ' + sheet.getName() };
    }

    const headers = data[0].map(normalizeMediterraniBiodiversitatHeader);
    const difficultyIdx = headers.indexOf('dificultat');
    const imageIdx = headers.indexOf('nom_imatge');
    const topicIdx = headers.indexOf('tema');
    const typeIdx = headers.indexOf('tipus_pregunta');
    const questionIdx = headers.indexOf('pregunta');
    const correctIdx = headers.indexOf('resposta_correcta');
    const wrongIdxs = [
        headers.indexOf('incorrecta_1'),
        headers.indexOf('incorrecta_2'),
        headers.indexOf('incorrecta_3')
    ];
    const correctImageIdx = headers.indexOf('imatge_correcta');
    const wrongImageIdxs = [
        headers.indexOf('imatge_incorrecta_1'),
        headers.indexOf('imatge_incorrecta_2'),
        headers.indexOf('imatge_incorrecta_3')
    ];

    const requiredColumns = [
        { name: 'nom_imatge', index: imageIdx },
        { name: 'pregunta', index: questionIdx },
        { name: 'resposta_correcta', index: correctIdx },
        { name: 'incorrecta_1', index: wrongIdxs[0] },
        { name: 'incorrecta_2', index: wrongIdxs[1] },
        { name: 'incorrecta_3', index: wrongIdxs[2] }
    ];

    const missingColumns = requiredColumns
        .filter(column => column.index === -1)
        .map(column => column.name);

    if (missingColumns.length > 0) {
        return {
            status: 'error',
            message: 'Falten columnes a ' + sheet.getName() + ': ' + missingColumns.join(', ')
        };
    }

    const questions = data.slice(1)
        .map((row, index) => {
            const type = typeIdx === -1 ? '' : cleanMediterraniBiodiversitatCell(row[typeIdx]);
            const isImageType = isMediterraniBiodiversitatImageQuestion({ type: type });
            const textCorrect = cleanMediterraniBiodiversitatCell(row[correctIdx]);
            const correctImage = correctImageIdx === -1 ? '' : cleanMediterraniBiodiversitatCell(row[correctImageIdx]);
            const correct = isImageType && !textCorrect ? correctImage : textCorrect;
            const rawWrongs = wrongIdxs
                .map(idx => cleanMediterraniBiodiversitatCell(row[idx]));
            const wrongs = rawWrongs.filter(value => value !== '');
            const wrongImages = wrongImageIdxs
                .map(idx => idx === -1 ? '' : cleanMediterraniBiodiversitatCell(row[idx]));
            let imageAlternatives = [
                { text: textCorrect, value: correctImage || textCorrect, image: correctImage, correct: true }
            ].concat(rawWrongs.map((wrong, wrongIndex) => ({
                text: wrong,
                value: wrongImages[wrongIndex] || wrong,
                image: wrongImages[wrongIndex] || '',
                correct: false
            }))).filter(option => option.image !== '');

            if (isImageType && imageAlternatives.length < 2) {
                imageAlternatives = [correct].concat(wrongs)
                    .filter(value => isMediterraniBiodiversitatImageFile(value))
                    .map(value => ({
                        text: '',
                        value: value,
                        image: value,
                        correct: value === correct
                    }));
            }

            return {
                id: index + 1,
                difficulty: difficultyIdx === -1 ? '' : cleanMediterraniBiodiversitatCell(row[difficultyIdx]),
                image: cleanMediterraniBiodiversitatCell(row[imageIdx]),
                topic: topicIdx === -1 ? '' : cleanMediterraniBiodiversitatCell(row[topicIdx]),
                type: type,
                question: cleanMediterraniBiodiversitatCell(row[questionIdx]),
                correct: correct,
                correctImage: correctImage,
                alternatives: [correct].concat(wrongs).filter(value => value !== ''),
                imageAlternatives: imageAlternatives
            };
        })
        .filter(question => {
            if (!question.question || !question.correct) return false;
            if (isMediterraniBiodiversitatImageQuestion(question)) {
                return question.imageAlternatives.length >= 2;
            }
            return question.alternatives.length >= 2;
        });

    if (questions.length === 0) {
        return { status: 'error', message: 'No hi ha preguntes completes a ' + sheet.getName() };
    }

    return { status: 'success', questions: questions };
}

function normalizeMediterraniBiodiversitatHeader(value) {
    return normalizeHeader(value);
}

function cleanMediterraniBiodiversitatCell(value) {
    return cleanCell(value);
}

function isMediterraniBiodiversitatImageQuestion(question) {
    const type = normalizeMediterraniBiodiversitatHeader(question.type);
    return type === 'imatge' || type === 'imatges' || type === 'foto' || type === 'fotos' || type === 'image';
}

function isMediterraniBiodiversitatImageFile(value) {
    return /\.(png|jpe?g|webp|gif|svg)$/i.test(cleanCell(value));
}

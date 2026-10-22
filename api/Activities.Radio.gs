/**
 * Activitats de Ràdio.
 */

function getRadioConfig() {
    return {
        status: 'success',
        effects: [
            { id: '00', type: 'SMALL HALL' },
            { id: '10', type: 'SMALL ROOM' },
            { id: '13', type: 'MID ROOM' },
            { id: '27', type: 'SPRING' },
            { id: '36', type: 'REVERSE' },
            { id: '40', type: 'EARLY REFL' },
            { id: '50', type: 'DELAY' },
            { id: '59', type: 'ECHO' },
            { id: '66', type: 'FLANGER' },
            { id: '74', type: 'PITH SHIFT' },
            { id: '82', type: 'FLANGER & REVERB' },
            { id: '90', type: 'DELAY & GATED' },
            { id: '92', type: 'DELAY & CHORUS' },
            { id: '96', type: 'DELAY & PHASER' },
            { id: '98', type: 'DELAY & PITCH' }
        ]
    };
}

function getDefaultRadioConnectionsQuestions() {
    return [
        { id: 1, image: 'xlr_connector.jpg', correct: 'XLR', alternatives: ['XLR', 'RCA', 'HDMI', 'USB Tipus C'] },
        { id: 2, image: 'jack_63.jpg', correct: 'Jack 6.35 mm', alternatives: ['Jack 6.35 mm', 'Mini-jack 3.5 mm', 'RCA', 'USB Tipus B'] },
        { id: 3, image: 'minijack.jpg', correct: 'Mini-jack 3.5 mm', alternatives: ['Mini-jack 3.5 mm', 'Jack 6.35 mm', 'HDMI', 'Mini-USB'] },
        { id: 4, image: 'rca_connector.jpg', correct: 'RCA', alternatives: ['RCA', 'XLR', 'HDMI', 'USB Tipus A'] },
        { id: 5, image: 'usb_a.jpg', correct: 'USB Tipus A', alternatives: ['USB Tipus A', 'USB Tipus B', 'USB Tipus C', 'Mini-USB'] },
        { id: 6, image: 'usb_b.jpg', correct: 'USB Tipus B', alternatives: ['USB Tipus A', 'USB Tipus B', 'USB Tipus C', 'Mini-USB'] },
        { id: 7, image: 'usb_c.jpg', correct: 'USB Tipus C', alternatives: ['USB Tipus A', 'USB Tipus B', 'USB Tipus C', 'Mini-USB'] },
        { id: 8, image: 'mini_usb.jpg', correct: 'Mini-USB', alternatives: ['Mini-USB', 'USB Tipus C', 'Mini-jack 3.5 mm', 'HDMI'] },
        { id: 9, image: 'trrs.jpg', correct: 'Mini-jack TRRS', alternatives: ['Mini-jack TRRS', 'Mini-jack 3.5 mm', 'Jack 6.35 mm', 'XLR'] },
        { id: 10, image: 'hdmi.jpg', correct: 'HDMI', alternatives: ['HDMI', 'RCA', 'USB Tipus C', 'XLR'] }
    ];
}

function getRadioConnectionsQuestionsLegacy() {
    const sheet = getSheet('preguntes_radio_conexions');
    if (!sheet) {
        // Preguntes de reserva perquè l'activitat no quedi buida si falta la pestanya.
        return { status: 'success', questions: getDefaultRadioConnectionsQuestions() };
    }

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a preguntes_radio_conexions' };

    const headers = data[0];
    const imgIdx = headers.indexOf('Imatge');
    const correctIdx = headers.indexOf('Correcta');

    const questions = data.slice(1).map((row, index) => {
        return {
            id: index + 1,
            image: row[imgIdx],
            correct: row[correctIdx],
            alternatives: [row[1], row[2], row[3], row[4]]
                .filter(val => cleanCell(val) !== "")
        };
    });

    return { status: 'success', questions: questions };
}

function getRadioConnectionsQuestions() {
    const sheet = getFirstExistingSheet(['radio_connectors', 'preguntes_radio_conexions']);

    if (!sheet) {
        const defaultQuestions = getDefaultRadioConnectionsQuestions().map(question => ({
            id: question.id,
            difficulty: '',
            image: question.image,
            topic: 'connectors',
            type: 'text',
            question: 'Quin connector es mostra?',
            correct: question.correct,
            alternatives: question.alternatives,
            imageAlternatives: []
        }));

        return {
            status: 'success',
            questions: defaultQuestions
        };
    }

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'error', message: 'Sense dades a ' + sheet.getName() };

    const normalizedHeaders = data[0].map(normalizeRadioConnectionsHeader);
    const hasNewSchema = normalizedHeaders.indexOf('pregunta') !== -1 || normalizedHeaders.indexOf('resposta_correcta') !== -1;

    if (!hasNewSchema) {
        const originalHeaders = data[0];
        const imgIdx = originalHeaders.indexOf('Imatge');
        const correctIdx = originalHeaders.indexOf('Correcta');

        const legacyQuestions = data.slice(1).map((row, index) => {
            const correct = cleanRadioConnectionsCell(row[correctIdx]);
            return {
                id: index + 1,
                difficulty: '',
                image: cleanRadioConnectionsCell(row[imgIdx]),
                topic: '',
                type: 'text',
                question: 'Tria la resposta correcta:',
                correct: correct,
                alternatives: [row[1], row[2], row[3], row[4]]
                    .map(cleanRadioConnectionsCell)
                    .filter(value => value !== ''),
                imageAlternatives: []
            };
        }).filter(question => question.image && question.correct && question.alternatives.length >= 2);

        return { status: 'success', questions: legacyQuestions };
    }

    const difficultyIdx = normalizedHeaders.indexOf('dificultat');
    const imageIdx = normalizedHeaders.indexOf('nom_imatge');
    const topicIdx = normalizedHeaders.indexOf('tema');
    const typeIdx = normalizedHeaders.indexOf('tipus_pregunta');
    const questionIdx = normalizedHeaders.indexOf('pregunta');
    const correctIdx = normalizedHeaders.indexOf('resposta_correcta');
    const wrongIdxs = [
        normalizedHeaders.indexOf('incorrecta_1'),
        normalizedHeaders.indexOf('incorrecta_2'),
        normalizedHeaders.indexOf('incorrecta_3')
    ];
    const correctImageIdx = normalizedHeaders.indexOf('imatge_correcta');
    const wrongImageIdxs = [
        normalizedHeaders.indexOf('imatge_incorrecta_1'),
        normalizedHeaders.indexOf('imatge_incorrecta_2'),
        normalizedHeaders.indexOf('imatge_incorrecta_3')
    ];

    const questions = data.slice(1)
        .map((row, index) => {
            const type = typeIdx === -1 ? '' : cleanRadioConnectionsCell(row[typeIdx]);
            const isImageType = isRadioConnectionsImageQuestion({ type: type });
            const textCorrect = correctIdx === -1 ? '' : cleanRadioConnectionsCell(row[correctIdx]);
            const correctImage = correctImageIdx === -1 ? '' : cleanRadioConnectionsCell(row[correctImageIdx]);
            const correct = isImageType && !textCorrect ? correctImage : textCorrect;
            const rawWrongs = wrongIdxs.map(idx => idx === -1 ? '' : cleanRadioConnectionsCell(row[idx]));
            const wrongs = rawWrongs.filter(value => value !== '');
            const wrongImages = wrongImageIdxs.map(idx => idx === -1 ? '' : cleanRadioConnectionsCell(row[idx]));
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
                    .filter(value => isRadioConnectionsImageFile(value))
                    .map(value => ({
                        text: '',
                        value: value,
                        image: value,
                        correct: value === correct
                    }));
            }

            return {
                id: index + 1,
                difficulty: difficultyIdx === -1 ? '' : cleanRadioConnectionsCell(row[difficultyIdx]),
                image: imageIdx === -1 ? '' : cleanRadioConnectionsCell(row[imageIdx]),
                topic: topicIdx === -1 ? '' : cleanRadioConnectionsCell(row[topicIdx]),
                type: type,
                question: questionIdx === -1 ? 'Tria la resposta correcta:' : cleanRadioConnectionsCell(row[questionIdx]),
                correct: correct,
                alternatives: [correct].concat(wrongs).filter(value => value !== ''),
                imageAlternatives: imageAlternatives
            };
        })
        .filter(question => {
            if (!question.question || !question.correct) return false;
            if (isRadioConnectionsImageQuestion(question)) return question.imageAlternatives.length >= 2;
            return question.alternatives.length >= 2;
        });

    return { status: 'success', questions: questions };
}

function normalizeRadioConnectionsHeader(value) {
    return normalizeHeader(value);
}

function cleanRadioConnectionsCell(value) {
    return cleanCell(value);
}

function isRadioConnectionsImageQuestion(question) {
    const type = normalizeRadioConnectionsHeader(question.type);
    return type === 'imatge' || type === 'imatges' || type === 'foto' || type === 'fotos' || type === 'image';
}

function isRadioConnectionsImageFile(value) {
    return /\.(png|jpe?g|webp|gif|svg)$/i.test(cleanCell(value));
}

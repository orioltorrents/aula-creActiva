/**
 * Audio Connections Quiz Logic
 */

const connectionsQuiz = {
    allQuestions: [],
    questions: [],
    currentStep: 0,
    score: 0,
    isFinished: false,
    selectedFilter: null
};

const CONNECTIONS_IMAGE_DIR = 'assets/images/activities/radio/connectors/';

async function initConnectionsQuiz() {
    connectionsQuiz.allQuestions = [];
    connectionsQuiz.questions = [];
    connectionsQuiz.currentStep = 0;
    connectionsQuiz.score = 0;
    connectionsQuiz.isFinished = false;
    connectionsQuiz.selectedFilter = null;

    const selector = document.getElementById('connections-selector');
    const quizContainer = document.getElementById('connections-quiz-container');
    const resultsContainer = document.getElementById('connections-results');
    const optionsGrid = document.getElementById('connection-options');
    const feedbackEl = document.getElementById('connection-feedback');

    if (!quizContainer || !resultsContainer || !optionsGrid) return;

    if (selector) selector.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    optionsGrid.innerHTML = '<div class="loader"></div>';
    if (feedbackEl) feedbackEl.innerText = '';

    try {
        const response = await callApi('getRadioConnectionsQuestions');
        if (response && response.status === 'success') {
            connectionsQuiz.allQuestions = response.questions;
            startConnectionsSelector();
        } else {
            showConnectionsError(response && response.message ? response.message : 'No he pogut carregar les preguntes.');
        }
    } catch (e) {
        console.error('Error en initConnectionsQuiz:', e);
        showConnectionsError('No he pogut connectar amb el Google Sheet.');
    }
}

function startConnectionsSelector() {
    const selector = document.getElementById('connections-selector');
    const buttonsContainer = document.getElementById('connections-filter-buttons');
    const quizContainer = document.getElementById('connections-quiz-container');
    const resultsContainer = document.getElementById('connections-results');

    if (!selector || !buttonsContainer) return;

    if (quizContainer) quizContainer.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    selector.classList.remove('hidden');
    buttonsContainer.innerHTML = '';

    addConnectionsFilterSection(buttonsContainer, 'Per dificultat:', 'difficulty');
    addConnectionsFilterSection(buttonsContainer, 'Per tema:', 'topic');

    const mixLabel = document.createElement('p');
    mixLabel.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    mixLabel.innerText = 'O be:';
    buttonsContainer.appendChild(mixLabel);

    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn btn--primary';
    mixBtn.classList.add('quiz-filter-button', 'quiz-filter-button--wide', 'quiz-filter-button--mixed');
    mixBtn.innerText = 'Barrejat (totes)';
    mixBtn.onclick = () => startConnectionsQuiz('Barrejat', null);
    buttonsContainer.appendChild(mixBtn);
}

function addConnectionsFilterSection(container, labelText, field) {
    const values = getConnectionsUniqueValues(field);
    if (values.length === 0) return;

    const label = document.createElement('p');
    label.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    label.innerText = labelText;
    container.appendChild(label);

    values.forEach(value => {
        const btn = document.createElement('button');
        btn.className = 'btn btn--primary';
        btn.classList.add('quiz-filter-button', getQuizFilterButtonModifier(field, value));
        btn.innerText = value;
        btn.onclick = () => startConnectionsQuiz(value, field);
        container.appendChild(btn);
    });
}

function getConnectionsUniqueValues(field) {
    return [...new Set(
        connectionsQuiz.allQuestions
            .map(question => String(question[field] || '').trim())
            .filter(value => value !== '')
    )].sort((a, b) => a.localeCompare(b));
}

function startConnectionsQuiz(value = 'Barrejat', filterBy = null) {
    const selector = document.getElementById('connections-selector');
    const quizContainer = document.getElementById('connections-quiz-container');
    const resultsContainer = document.getElementById('connections-results');

    let pool = connectionsQuiz.allQuestions;
    if (filterBy) {
        pool = pool.filter(question =>
            String(question[filterBy] || '').toLowerCase() === String(value || '').toLowerCase()
        );
    }

    if (pool.length === 0) {
        alert('No hi ha preguntes per aquesta seleccio.');
        startConnectionsSelector();
        return;
    }

    connectionsQuiz.selectedFilter = filterBy ? { value, filterBy } : null;
    connectionsQuiz.questions = [...pool].sort(() => 0.5 - Math.random()).slice(0, 20);
    connectionsQuiz.currentStep = 0;
    connectionsQuiz.score = 0;
    connectionsQuiz.isFinished = false;

    if (selector) selector.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    if (quizContainer) quizContainer.classList.remove('hidden');

    renderConnectionQuestion();
}

function renderConnectionQuestion() {
    if (connectionsQuiz.currentStep >= connectionsQuiz.questions.length) {
        finishConnectionsQuiz();
        return;
    }

    const question = connectionsQuiz.questions[connectionsQuiz.currentStep];
    const imgEl = document.getElementById('connection-img');
    const optionsGrid = document.getElementById('connection-options');
    const progressEl = document.getElementById('connections-progress');
    const scoreEl = document.getElementById('connections-score');
    const feedbackEl = document.getElementById('connection-feedback');
    const questionTextEl = document.getElementById('connection-question-text');

    if (!imgEl || !optionsGrid || !progressEl || !scoreEl || !questionTextEl) return;

    if (feedbackEl) feedbackEl.innerText = '';

    progressEl.innerText = (typeof i18n !== 'undefined' ? i18n.t('question') : 'Pregunta') + ` ${connectionsQuiz.currentStep + 1}/${connectionsQuiz.questions.length}`;
    scoreEl.innerText = (typeof i18n !== 'undefined' ? i18n.t('score') : 'Punts') + `: ${connectionsQuiz.score}`;
    questionTextEl.innerText = question.question || 'Tria la resposta correcta:';

    if (question.image) {
        imgEl.style.display = 'block';
        imgEl.src = getConnectionImagePath(question.image);
        imgEl.alt = question.topic || question.correct || 'Connector';
        imgEl.onerror = () => {
            imgEl.onerror = null;
            imgEl.src = buildConnectionPlaceholder(question.image || question.correct);
        };
    } else {
        imgEl.removeAttribute('src');
        imgEl.style.display = 'none';
    }

    optionsGrid.innerHTML = '';

    const isImageQuestion = isConnectionImageQuestion(question);
    const optionList = getConnectionOptions(question, isImageQuestion);
    const shuffledOptions = [...optionList].sort(() => 0.5 - Math.random());

    shuffledOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = isImageQuestion ? 'answer-option radio-connection-image-option' : 'answer-option';
        btn.dataset.value = option.value || option.text;
        btn.onclick = () => checkConnectionAnswer(option.value || option.text, question.correct, btn);

        if (isImageQuestion && option.image) {
            const optionImg = document.createElement('img');
            optionImg.src = getConnectionImagePath(option.image);
            optionImg.alt = option.text || 'Opcio de resposta';
            optionImg.onerror = () => {
                optionImg.onerror = null;
                optionImg.src = buildConnectionPlaceholder(option.image || option.text);
            };
            btn.appendChild(optionImg);

            if (option.text && option.text !== option.image) {
                const optionText = document.createElement('span');
                optionText.innerText = option.text;
                btn.appendChild(optionText);
            }
        } else {
            btn.innerText = option.text;
        }

        optionsGrid.appendChild(btn);
    });
}

function checkConnectionAnswer(selected, correct, btn) {
    if (connectionsQuiz.isFinished) return;

    const feedbackEl = document.getElementById('connection-feedback');
    const options = document.querySelectorAll('#connection-options .answer-option');

    options.forEach(option => {
        option.disabled = true;
    });

    if (selected === correct) {
        connectionsQuiz.score += 10;
        btn.classList.add('correct');
        if (feedbackEl) {
            feedbackEl.innerText = typeof i18n !== 'undefined' ? i18n.t('correct') : 'Correcte!';
            setElementStateColor(feedbackEl, 'success');
        }
    } else {
        btn.classList.add('incorrect');
        if (feedbackEl) {
            feedbackEl.innerText = `${typeof i18n !== 'undefined' ? i18n.t('incorrect') : 'Incorrecte'} (${correct})`;
            setElementStateColor(feedbackEl, 'error');
        }

        options.forEach(option => {
            if (option.innerText === correct || option.dataset.value === correct) {
                option.classList.add('correct');
            }
        });
    }

    setTimeout(() => {
        connectionsQuiz.currentStep++;
        renderConnectionQuestion();
    }, 1500);
}

function finishConnectionsQuiz() {
    connectionsQuiz.isFinished = true;

    document.getElementById('connections-quiz-container').classList.add('hidden');
    document.getElementById('connections-results').classList.remove('hidden');

    const finalScore = connectionsQuiz.score;
    const totalQuestions = connectionsQuiz.questions.length;
    const maxScore = totalQuestions * 10;

    const percentage = maxScore > 0 ? Math.round((finalScore / maxScore) * 100) : 0;
    document.getElementById('connections-final-score').innerText = `${percentage}%`;

    let msg = '';
    if (finalScore >= maxScore * 0.9) msg = typeof i18n !== 'undefined' ? i18n.t('final_message_expert') : 'Excel·lent!';
    else if (finalScore >= maxScore * 0.5) msg = typeof i18n !== 'undefined' ? i18n.t('final_message_analyst') : 'Bon resultat.';
    else msg = typeof i18n !== 'undefined' ? i18n.t('final_message_apprentice') : 'Cal seguir practicant.';

    document.getElementById('connections-final-msg').innerText = msg;

    saveConnectionsResult(percentage);
}

async function saveConnectionsResult(percentage) {
    if (typeof state === 'undefined' || !state.user) return;

    const filterLabel = connectionsQuiz.selectedFilter ? connectionsQuiz.selectedFilter.value : 'Barrejat';
    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject.titol,
        app: 'Conexions d\'Audio',
        nivell: filterLabel,
        puntuacio: percentage,
        temps_segons: 0,
        feedback_pos: 'Bon coneixement dels connectors fisics.',
        feedback_neg: ''
    };

    await callApi('saveResult', result);
}

function showConnectionsError(message) {
    const selector = document.getElementById('connections-selector');
    const quizContainer = document.getElementById('connections-quiz-container');
    const optionsGrid = document.getElementById('connection-options');
    const questionTextEl = document.getElementById('connection-question-text');
    const progressEl = document.getElementById('connections-progress');
    const scoreEl = document.getElementById('connections-score');
    const imgEl = document.getElementById('connection-img');

    if (selector) selector.classList.add('hidden');
    if (quizContainer) quizContainer.classList.remove('hidden');
    if (progressEl) progressEl.innerText = 'Sense preguntes';
    if (scoreEl) scoreEl.innerText = 'Punts: 0';
    if (questionTextEl) questionTextEl.innerText = message;
    if (optionsGrid) optionsGrid.innerHTML = '';
    if (imgEl) imgEl.src = buildConnectionPlaceholder('Sense imatge');
}

function isConnectionImageQuestion(question) {
    const type = String(question.type || '').trim().toLowerCase();
    return ['imatge', 'imatges', 'foto', 'fotos', 'image'].includes(type);
}

function getConnectionOptions(question, isImageQuestion) {
    if (isImageQuestion && question.imageAlternatives && question.imageAlternatives.length > 1) {
        return question.imageAlternatives;
    }

    if (isImageQuestion) {
        const imageOptions = question.alternatives
            .filter(option => isConnectionImageFile(option))
            .map(option => ({
                text: '',
                value: option,
                image: option,
                correct: option === question.correct
            }));

        if (imageOptions.length > 1) return imageOptions;
    }

    return question.alternatives.map(option => ({
        text: option,
        value: option,
        image: '',
        correct: option === question.correct
    }));
}

function isConnectionImageFile(value) {
    return /\.(png|jpe?g|webp|gif|svg)$/i.test(String(value || '').trim());
}

function getConnectionImagePath(fileName) {
    return `${CONNECTIONS_IMAGE_DIR}${fileName}`;
}

function buildConnectionPlaceholder(text) {
    const safeText = String(text || 'Imatge no trobada')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
            <rect width="640" height="420" fill="#eef6f4"/>
            <rect x="40" y="40" width="560" height="340" rx="16" fill="#ffffff" stroke="#b6d8d2" stroke-width="3"/>
            <text x="320" y="198" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#27665d">Imatge no trobada</text>
            <text x="320" y="242" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#4d766f">${safeText}</text>
        </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

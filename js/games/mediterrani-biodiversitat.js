/**
 * Activitat: Biodiversitat del Mediterrani
 * Preguntes amb imatge carregades des del Google Sheet.
 */

const mediterraniBiodiversitatQuiz = {
    allQuestions: [],
    questions: [],
    currentStep: 0,
    score: 0,
    isFinished: false,
    selectedFilter: null
};

const MEDITERRANI_BIODIVERSITAT_IMAGE_DIR = 'assets/images/activities/mediterrani/biodiversitat/';

async function initMediterraniBiodiversitatQuiz() {
    mediterraniBiodiversitatQuiz.allQuestions = [];
    mediterraniBiodiversitatQuiz.questions = [];
    mediterraniBiodiversitatQuiz.currentStep = 0;
    mediterraniBiodiversitatQuiz.score = 0;
    mediterraniBiodiversitatQuiz.isFinished = false;
    mediterraniBiodiversitatQuiz.selectedFilter = null;

    const selector = document.getElementById('med-biodiv-selector');
    const quizContainer = document.getElementById('med-biodiv-quiz-container');
    const resultsContainer = document.getElementById('med-biodiv-results');
    const optionsGrid = document.getElementById('med-biodiv-options');
    const feedbackEl = document.getElementById('med-biodiv-feedback');

    if (!quizContainer || !resultsContainer || !optionsGrid) return;

    if (selector) selector.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    optionsGrid.innerHTML = '<div class="loader"></div>';
    if (feedbackEl) feedbackEl.innerText = '';

    try {
        const response = await callApi('getMediterraniBiodiversitatQuestions');
        if (response && response.status === 'success') {
            mediterraniBiodiversitatQuiz.allQuestions = response.questions;
            startMediterraniBiodiversitatSelector();
        } else {
            showMediterraniBiodiversitatError(response && response.message
                ? response.message
                : 'No he pogut carregar les preguntes.');
        }
    } catch (error) {
        console.error('Error carregant Biodiversitat del Mediterrani:', error);
        showMediterraniBiodiversitatError('No he pogut connectar amb el Google Sheet.');
    }
}

function startMediterraniBiodiversitatSelector() {
    const selector = document.getElementById('med-biodiv-selector');
    const buttonsContainer = document.getElementById('med-biodiv-filter-buttons');
    const quizContainer = document.getElementById('med-biodiv-quiz-container');
    const resultsContainer = document.getElementById('med-biodiv-results');

    if (!selector || !buttonsContainer) return;

    if (quizContainer) quizContainer.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    selector.classList.remove('hidden');
    buttonsContainer.innerHTML = '';

    addMediterraniBiodiversitatFilterSection(buttonsContainer, 'Per dificultat:', 'difficulty');
    addMediterraniBiodiversitatFilterSection(buttonsContainer, 'Per tema:', 'topic');

    const mixLabel = document.createElement('p');
    mixLabel.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    mixLabel.innerText = 'O be:';
    buttonsContainer.appendChild(mixLabel);

    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn btn--primary';
    mixBtn.classList.add('quiz-filter-button', 'quiz-filter-button--wide', 'quiz-filter-button--mixed');
    mixBtn.innerText = 'Barrejat (totes)';
    mixBtn.onclick = () => startMediterraniBiodiversitatQuiz('Barrejat', null);
    buttonsContainer.appendChild(mixBtn);
}

function addMediterraniBiodiversitatFilterSection(container, labelText, field) {
    const values = getMediterraniBiodiversitatUniqueValues(field);
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
        btn.onclick = () => startMediterraniBiodiversitatQuiz(value, field);
        container.appendChild(btn);
    });
}

function getMediterraniBiodiversitatUniqueValues(field) {
    return [...new Set(
        mediterraniBiodiversitatQuiz.allQuestions
            .map(question => String(question[field] || '').trim())
            .filter(value => value !== '')
    )].sort((a, b) => a.localeCompare(b));
}

function startMediterraniBiodiversitatQuiz(value = 'Barrejat', filterBy = null) {
    const selector = document.getElementById('med-biodiv-selector');
    const quizContainer = document.getElementById('med-biodiv-quiz-container');
    const resultsContainer = document.getElementById('med-biodiv-results');

    let pool = mediterraniBiodiversitatQuiz.allQuestions;
    if (filterBy) {
        pool = pool.filter(question =>
            String(question[filterBy] || '').toLowerCase() === String(value || '').toLowerCase()
        );
    }

    if (pool.length === 0) {
        alert('No hi ha preguntes per aquesta seleccio.');
        startMediterraniBiodiversitatSelector();
        return;
    }

    mediterraniBiodiversitatQuiz.selectedFilter = filterBy ? { value, filterBy } : null;
    mediterraniBiodiversitatQuiz.questions = [...pool]
        .sort(() => 0.5 - Math.random())
        .slice(0, 20);
    mediterraniBiodiversitatQuiz.currentStep = 0;
    mediterraniBiodiversitatQuiz.score = 0;
    mediterraniBiodiversitatQuiz.isFinished = false;

    if (selector) selector.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    if (quizContainer) quizContainer.classList.remove('hidden');

    renderMediterraniBiodiversitatQuestion();
}

function renderMediterraniBiodiversitatQuestion() {
    if (mediterraniBiodiversitatQuiz.currentStep >= mediterraniBiodiversitatQuiz.questions.length) {
        finishMediterraniBiodiversitatQuiz();
        return;
    }

    const question = mediterraniBiodiversitatQuiz.questions[mediterraniBiodiversitatQuiz.currentStep];
    const imgEl = document.getElementById('med-biodiv-img');
    const metaEl = document.getElementById('med-biodiv-meta');
    const questionEl = document.getElementById('med-biodiv-question-text');
    const optionsGrid = document.getElementById('med-biodiv-options');
    const progressEl = document.getElementById('med-biodiv-progress');
    const scoreEl = document.getElementById('med-biodiv-score');
    const feedbackEl = document.getElementById('med-biodiv-feedback');

    if (!imgEl || !questionEl || !optionsGrid || !progressEl || !scoreEl) return;

    if (feedbackEl) feedbackEl.innerText = '';

    progressEl.innerText = `Pregunta ${mediterraniBiodiversitatQuiz.currentStep + 1}/${mediterraniBiodiversitatQuiz.questions.length}`;
    scoreEl.innerText = `Punts: ${mediterraniBiodiversitatQuiz.score}`;

    if (question.image) {
        imgEl.style.display = 'block';
        imgEl.src = getMediterraniBiodiversitatImagePath(question.image);
        imgEl.alt = question.topic || question.correct || 'Imatge de biodiversitat mediterrania';
        imgEl.onerror = () => {
            imgEl.onerror = null;
            imgEl.src = buildMediterraniBiodiversitatPlaceholder(question.image || question.correct);
        };
    } else {
        imgEl.removeAttribute('src');
        imgEl.style.display = 'none';
    }

    const tags = [question.difficulty, question.topic, question.type]
        .filter(value => value && String(value).trim() !== '');
    if (metaEl) {
        metaEl.innerText = tags.join(' / ');
        metaEl.classList.toggle('hidden', tags.length === 0);
    }

    questionEl.innerText = question.question;
    optionsGrid.innerHTML = '';

    const isImageQuestion = isMediterraniBiodiversitatImageQuestion(question);
    const optionList = getMediterraniBiodiversitatOptions(question, isImageQuestion);

    const shuffledOptions = [...optionList].sort(() => 0.5 - Math.random());
    shuffledOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = isImageQuestion ? 'answer-option med-biodiv-image-option' : 'answer-option';
        btn.onclick = () => checkMediterraniBiodiversitatAnswer(option.value || option.text, question.correct, btn);

        if (isImageQuestion && option.image) {
            const optionImg = document.createElement('img');
            optionImg.src = getMediterraniBiodiversitatImagePath(option.image);
            optionImg.alt = option.text || 'Opcio de resposta';
            optionImg.onerror = () => {
                optionImg.onerror = null;
                optionImg.src = buildMediterraniBiodiversitatPlaceholder(option.image || option.text);
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

function checkMediterraniBiodiversitatAnswer(selected, correct, btn) {
    if (mediterraniBiodiversitatQuiz.isFinished) return;

    const feedbackEl = document.getElementById('med-biodiv-feedback');
    const options = document.querySelectorAll('#med-biodiv-options .answer-option');

    options.forEach(option => {
        option.disabled = true;
    });

    if (selected === correct) {
        mediterraniBiodiversitatQuiz.score += 10;
        btn.classList.add('correct');
        if (feedbackEl) {
            feedbackEl.innerText = typeof i18n !== 'undefined' ? i18n.t('correct') : 'Correcte!';
            setElementStateColor(feedbackEl, 'success');
        }
    } else {
        btn.classList.add('incorrect');
        if (feedbackEl) {
            feedbackEl.innerText = typeof i18n !== 'undefined' ? i18n.t('incorrect') : 'Incorrecte';
            setElementStateColor(feedbackEl, 'error');
        }

        options.forEach(option => {
            if (option.innerText === correct) {
                option.classList.add('correct');
            }
        });
    }

    setTimeout(() => {
        mediterraniBiodiversitatQuiz.currentStep++;
        renderMediterraniBiodiversitatQuestion();
    }, 1500);
}

function finishMediterraniBiodiversitatQuiz() {
    mediterraniBiodiversitatQuiz.isFinished = true;

    const quizContainer = document.getElementById('med-biodiv-quiz-container');
    const resultsContainer = document.getElementById('med-biodiv-results');
    const finalScoreEl = document.getElementById('med-biodiv-final-score');
    const finalMsgEl = document.getElementById('med-biodiv-final-msg');

    if (quizContainer) quizContainer.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.remove('hidden');

    const totalQuestions = mediterraniBiodiversitatQuiz.questions.length;
    const maxScore = totalQuestions * 10;
    const percentage = maxScore > 0 ? Math.round((mediterraniBiodiversitatQuiz.score / maxScore) * 100) : 0;

    if (finalScoreEl) finalScoreEl.innerText = `${percentage}%`;
    if (finalMsgEl) {
        if (percentage >= 90) finalMsgEl.innerText = 'Excel·lent coneixement de la biodiversitat mediterrània.';
        else if (percentage >= 50) finalMsgEl.innerText = 'Bon camí: ja reconeixes força espècies i ecosistemes.';
        else finalMsgEl.innerText = 'Cal seguir observant i practicant amb les imatges.';
    }

    saveMediterraniBiodiversitatResult(percentage);
}

async function saveMediterraniBiodiversitatResult(percentage) {
    if (typeof state === 'undefined' || !state.user) return;

    const filterLabel = mediterraniBiodiversitatQuiz.selectedFilter
        ? mediterraniBiodiversitatQuiz.selectedFilter.value
        : 'Barrejat';

    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject ? state.currentProject.titol : 'Projecte Mediterrani',
        app: 'Biodiversitat del Mediterrani',
        nivell: filterLabel,
        puntuacio: percentage,
        temps_segons: 0,
        feedback_pos: 'Identificacio visual de biodiversitat mediterrania.',
        feedback_neg: ''
    };

    await callApi('saveResult', result);
}

function showMediterraniBiodiversitatError(message) {
    const selector = document.getElementById('med-biodiv-selector');
    const quizContainer = document.getElementById('med-biodiv-quiz-container');
    const optionsGrid = document.getElementById('med-biodiv-options');
    const questionEl = document.getElementById('med-biodiv-question-text');
    const progressEl = document.getElementById('med-biodiv-progress');
    const scoreEl = document.getElementById('med-biodiv-score');
    const imgEl = document.getElementById('med-biodiv-img');

    if (selector) selector.classList.add('hidden');
    if (quizContainer) quizContainer.classList.remove('hidden');
    if (progressEl) progressEl.innerText = 'Sense preguntes';
    if (scoreEl) scoreEl.innerText = 'Punts: 0';
    if (questionEl) questionEl.innerText = message;
    if (optionsGrid) optionsGrid.innerHTML = '';
    if (imgEl) imgEl.src = buildMediterraniBiodiversitatPlaceholder('Sense imatge');
}

function isMediterraniBiodiversitatImageQuestion(question) {
    const type = String(question.type || '').trim().toLowerCase();
    return ['imatge', 'imatges', 'foto', 'fotos', 'image'].includes(type);
}

function getMediterraniBiodiversitatOptions(question, isImageQuestion) {
    if (isImageQuestion && question.imageAlternatives && question.imageAlternatives.length > 1) {
        return question.imageAlternatives;
    }

    if (isImageQuestion) {
        const imageOptions = question.alternatives
            .filter(option => isMediterraniBiodiversitatImageFile(option))
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

function isMediterraniBiodiversitatImageFile(value) {
    return /\.(png|jpe?g|webp|gif|svg)$/i.test(String(value || '').trim());
}

function getMediterraniBiodiversitatImagePath(fileName) {
    return `${MEDITERRANI_BIODIVERSITAT_IMAGE_DIR}${fileName}`;
}

function buildMediterraniBiodiversitatPlaceholder(text) {
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

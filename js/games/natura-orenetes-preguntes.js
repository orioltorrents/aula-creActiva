/**
 * NATURA - Preguntes del Projecte Orenetes
 * Quiz visual amb quatre fotos com a opcions de resposta.
 */

const orenetesPreguntesState = {
    allQuestions: [],
    questions: [],
    currentStep: 0,
    score: 0,
    selectedFilter: null,
    answered: false,
    startTime: null,
    resultSaved: false
};

const ORENETES_PREGUNTES_IMAGE_DIR = 'assets/images/activities/entorns/orenetes/';
const ORENETES_PREGUNTES_LOGO = 'assets/images/activities/entorns/cards/targeta-projecte-orentes.png';

async function initOrenetesPreguntesQuiz() {
    orenetesPreguntesState.allQuestions = [];
    orenetesPreguntesState.questions = [];
    orenetesPreguntesState.currentStep = 0;
    orenetesPreguntesState.score = 0;
    orenetesPreguntesState.selectedFilter = null;
    orenetesPreguntesState.answered = false;
    orenetesPreguntesState.startTime = new Date();
    orenetesPreguntesState.resultSaved = false;

    const selector = document.getElementById('orenetes-questions-selector');
    const quizContainer = document.getElementById('orenetes-questions-quiz-container');
    const resultsContainer = document.getElementById('orenetes-questions-results');
    const optionsGrid = document.getElementById('orenetes-questions-options');
    const feedbackEl = document.getElementById('orenetes-questions-feedback');
    const imgEl = document.getElementById('orenetes-questions-img');

    if (!quizContainer || !resultsContainer || !optionsGrid) return;

    if (selector) selector.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    optionsGrid.innerHTML = '<div class="loader"></div>';
    if (feedbackEl) feedbackEl.textContent = '';
    if (imgEl) {
        imgEl.style.display = 'block';
        imgEl.src = ORENETES_PREGUNTES_LOGO;
        imgEl.alt = 'Projecte Orenetes';
    }

    try {
        const response = await callApi('getOrenetesPreguntes');
        if (response?.status === 'success' && response.questions?.length) {
            orenetesPreguntesState.allQuestions = response.questions;
            startOrenetesPreguntesSelector();
        } else {
            showOrenetesPreguntesError(response?.message || 'No hi ha preguntes completes a la pestanya orenetes_preguntes.');
        }
    } catch (error) {
        console.error('Error carregant preguntes del Projecte Orenetes:', error);
        showOrenetesPreguntesError('No he pogut connectar amb el Google Sheet.');
    }
}

function startOrenetesPreguntesSelector() {
    const selector = document.getElementById('orenetes-questions-selector');
    const buttonsContainer = document.getElementById('orenetes-questions-filter-buttons');
    const quizContainer = document.getElementById('orenetes-questions-quiz-container');
    const resultsContainer = document.getElementById('orenetes-questions-results');

    if (!selector || !buttonsContainer) return;

    if (quizContainer) quizContainer.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    selector.classList.remove('hidden');
    buttonsContainer.innerHTML = '';

    addOrenetesPreguntesFilterSection(buttonsContainer, 'Per dificultat:', 'difficulty');
    addOrenetesPreguntesFilterSection(buttonsContainer, 'Per tema:', 'topic');

    const mixLabel = document.createElement('p');
    mixLabel.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    mixLabel.textContent = 'O be:';
    buttonsContainer.appendChild(mixLabel);

    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn btn--primary';
    mixBtn.classList.add('quiz-filter-button', 'quiz-filter-button--wide', 'quiz-filter-button--mixed');
    mixBtn.textContent = 'Barrejat (totes)';
    mixBtn.onclick = () => startOrenetesPreguntesQuiz('Barrejat', null);
    buttonsContainer.appendChild(mixBtn);
}

function addOrenetesPreguntesFilterSection(container, labelText, field) {
    const values = getOrenetesPreguntesUniqueValues(field);
    if (values.length === 0) return;

    const label = document.createElement('p');
    label.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    label.textContent = labelText;
    container.appendChild(label);

    values.forEach(value => {
        const btn = document.createElement('button');
        btn.className = 'btn btn--primary';
        btn.classList.add('quiz-filter-button', getQuizFilterButtonModifier(field, value));
        btn.textContent = value;
        btn.onclick = () => startOrenetesPreguntesQuiz(value, field);
        container.appendChild(btn);
    });
}

function getOrenetesPreguntesUniqueValues(field) {
    return [...new Set(
        orenetesPreguntesState.allQuestions
            .map(question => String(question[field] || '').trim())
            .filter(value => value !== '')
    )].sort((a, b) => a.localeCompare(b));
}

function startOrenetesPreguntesQuiz(value = 'Barrejat', filterBy = null) {
    const selector = document.getElementById('orenetes-questions-selector');
    const quizContainer = document.getElementById('orenetes-questions-quiz-container');
    const resultsContainer = document.getElementById('orenetes-questions-results');

    let pool = orenetesPreguntesState.allQuestions;
    if (filterBy) {
        pool = pool.filter(question =>
            String(question[filterBy] || '').toLowerCase() === String(value || '').toLowerCase()
        );
    }

    if (pool.length === 0) {
        alert('No hi ha preguntes per aquesta seleccio.');
        startOrenetesPreguntesSelector();
        return;
    }

    orenetesPreguntesState.selectedFilter = filterBy ? { value, filterBy } : null;
    orenetesPreguntesState.questions = [...pool]
        .sort(() => 0.5 - Math.random())
        .slice(0, 20);
    orenetesPreguntesState.currentStep = 0;
    orenetesPreguntesState.score = 0;
    orenetesPreguntesState.answered = false;

    if (selector) selector.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    if (quizContainer) quizContainer.classList.remove('hidden');

    renderOrenetesPreguntesQuestion();
}

function renderOrenetesPreguntesQuestion() {
    if (orenetesPreguntesState.currentStep >= orenetesPreguntesState.questions.length) {
        finishOrenetesPreguntesQuiz();
        return;
    }

    const question = orenetesPreguntesState.questions[orenetesPreguntesState.currentStep];
    const imgEl = document.getElementById('orenetes-questions-img');
    const metaEl = document.getElementById('orenetes-questions-meta');
    const questionEl = document.getElementById('orenetes-questions-text');
    const optionsGrid = document.getElementById('orenetes-questions-options');
    const progressEl = document.getElementById('orenetes-questions-progress');
    const scoreEl = document.getElementById('orenetes-questions-score');
    const feedbackEl = document.getElementById('orenetes-questions-feedback');

    if (!questionEl || !optionsGrid || !progressEl || !scoreEl) return;

    orenetesPreguntesState.answered = false;
    if (feedbackEl) feedbackEl.textContent = '';

    progressEl.textContent = `Pregunta ${orenetesPreguntesState.currentStep + 1}/${orenetesPreguntesState.questions.length}`;
    scoreEl.textContent = `Punts: ${orenetesPreguntesState.score}`;
    questionEl.textContent = question.question;

    if (imgEl) {
        if (question.image) {
            imgEl.style.display = 'block';
            imgEl.src = buildOrenetesPreguntesImageSrc(question.image);
            imgEl.alt = question.topic || question.question || 'Imatge del Projecte Orenetes';
            imgEl.onerror = () => {
                imgEl.onerror = null;
                imgEl.src = buildOrenetesPreguntesPlaceholder(question.image);
            };
        } else {
            imgEl.removeAttribute('src');
            imgEl.style.display = 'none';
        }
    }

    const tags = [question.difficulty, question.topic].filter(value => value && String(value).trim() !== '');
    if (metaEl) {
        metaEl.textContent = tags.join(' / ');
        metaEl.classList.toggle('hidden', tags.length === 0);
    }

    optionsGrid.innerHTML = '';
    const isImageQuestion = question.options.some(option => option.image);
    [...question.options].sort(() => 0.5 - Math.random()).forEach(option => {
        const btn = document.createElement('button');
        const optionValue = option.value || option.text || option.image;
        btn.className = isImageQuestion ? 'answer-option orenetes-questions-image-option' : 'answer-option';
        btn.dataset.value = optionValue;
        btn.onclick = () => checkOrenetesPreguntesAnswer(optionValue, question.correct, btn);

        if (isImageQuestion && option.image) {
            const optionImg = document.createElement('img');
            optionImg.src = buildOrenetesPreguntesImageSrc(option.image);
            optionImg.alt = option.text || 'Opcio de resposta';
            optionImg.onerror = () => {
                optionImg.onerror = null;
                optionImg.src = buildOrenetesPreguntesPlaceholder(option.image || option.text);
            };
            btn.appendChild(optionImg);

            if (option.text) {
                const optionText = document.createElement('span');
                optionText.textContent = option.text;
                btn.appendChild(optionText);
            }
        } else {
            const optionText = document.createElement('span');
            optionText.textContent = option.text || optionValue;
            btn.appendChild(optionText);
        }

        optionsGrid.appendChild(btn);
    });
}

function checkOrenetesPreguntesAnswer(selected, correct, btn) {
    if (orenetesPreguntesState.answered) return;

    const feedbackEl = document.getElementById('orenetes-questions-feedback');
    const options = document.querySelectorAll('#orenetes-questions-options .answer-option');
    orenetesPreguntesState.answered = true;

    options.forEach(option => {
        option.disabled = true;
        if (option.dataset.value === correct) option.classList.add('correct');
    });

    if (selected === correct) {
        orenetesPreguntesState.score += 10;
        btn.classList.add('correct');
        if (feedbackEl) {
            feedbackEl.textContent = typeof i18n !== 'undefined' ? i18n.t('correct') : 'Correcte!';
            setElementStateColor(feedbackEl, 'success');
        }
    } else {
        btn.classList.add('incorrect');
        if (feedbackEl) {
            feedbackEl.textContent = typeof i18n !== 'undefined' ? i18n.t('incorrect') : 'Incorrecte';
            setElementStateColor(feedbackEl, 'error');
        }
    }

    setTimeout(() => {
        orenetesPreguntesState.currentStep++;
        renderOrenetesPreguntesQuestion();
    }, 1500);
}

function finishOrenetesPreguntesQuiz() {
    const quizContainer = document.getElementById('orenetes-questions-quiz-container');
    const resultsContainer = document.getElementById('orenetes-questions-results');
    const finalScoreEl = document.getElementById('orenetes-questions-final-score');
    const finalMsgEl = document.getElementById('orenetes-questions-final-msg');

    if (quizContainer) quizContainer.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.remove('hidden');

    const totalQuestions = orenetesPreguntesState.questions.length;
    const maxScore = totalQuestions * 10;
    const percentage = maxScore > 0 ? Math.round((orenetesPreguntesState.score / maxScore) * 100) : 0;
    const message = buildOrenetesPreguntesFinalMessage(percentage);

    if (finalScoreEl) finalScoreEl.textContent = `${percentage}%`;
    if (finalMsgEl) finalMsgEl.textContent = message;

    saveOrenetesPreguntesResult(percentage, message);
}

async function saveOrenetesPreguntesResult(percentage, message) {
    if (orenetesPreguntesState.resultSaved || typeof state === 'undefined' || !state.user) return;

    const filterLabel = orenetesPreguntesState.selectedFilter
        ? orenetesPreguntesState.selectedFilter.value
        : 'Barrejat';

    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject?.titol || 'Entorns de Natura',
        app: 'Preguntes del Projecte Orenetes',
        nivell: filterLabel,
        puntuacio: percentage,
        temps_segons: Math.round((new Date() - orenetesPreguntesState.startTime) / 1000),
        feedback_pos: percentage >= 80 ? message : '',
        feedback_neg: percentage < 80 ? message : ''
    };

    try {
        const response = await callApi('saveResult', result);
        if (response?.status === 'success') orenetesPreguntesState.resultSaved = true;
    } catch (error) {
        console.error('Error guardant resultat de preguntes Orenetes:', error);
    }
}

function showOrenetesPreguntesError(message) {
    const selector = document.getElementById('orenetes-questions-selector');
    const quizContainer = document.getElementById('orenetes-questions-quiz-container');
    const optionsGrid = document.getElementById('orenetes-questions-options');
    const questionEl = document.getElementById('orenetes-questions-text');
    const progressEl = document.getElementById('orenetes-questions-progress');
    const scoreEl = document.getElementById('orenetes-questions-score');
    const imgEl = document.getElementById('orenetes-questions-img');

    if (selector) selector.classList.add('hidden');
    if (quizContainer) quizContainer.classList.remove('hidden');
    if (progressEl) progressEl.textContent = 'Sense preguntes';
    if (scoreEl) scoreEl.textContent = 'Punts: 0';
    if (questionEl) questionEl.textContent = message;
    if (optionsGrid) optionsGrid.innerHTML = '';
    if (imgEl) {
        imgEl.style.display = 'block';
        imgEl.src = buildOrenetesPreguntesPlaceholder('Sense imatge');
    }
}

function buildOrenetesPreguntesImageSrc(imageName) {
    const value = String(imageName || '').trim();
    if (/^(https?:|data:|assets\/)/i.test(value)) return value;
    return `${ORENETES_PREGUNTES_IMAGE_DIR}${value}`;
}

function buildOrenetesPreguntesFinalMessage(percentage) {
    if (percentage >= 90) return 'Excel.lent: reconeixes molt be les imatges del Projecte Orenetes.';
    if (percentage >= 60) return 'Bon cami: ja identifiques moltes situacions, pero encara pots afinar.';
    return 'Cal seguir practicant l\'observacio de les fotos abans del treball de camp.';
}

function buildOrenetesPreguntesPlaceholder(text) {
    const safeText = String(text || 'Imatge no trobada')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
            <rect width="640" height="420" fill="#f6f1e6"/>
            <rect x="42" y="42" width="556" height="336" rx="14" fill="#fffdf7" stroke="#9a7b4f" stroke-width="3"/>
            <text x="320" y="198" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#5f4528">Imatge no trobada</text>
            <text x="320" y="242" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#7a6143">${safeText}</text>
        </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

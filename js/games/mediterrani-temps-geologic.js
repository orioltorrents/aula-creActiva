const MEDITERRANI_TEMPS_GEOLOGIC_DATA_URL = 'assets/data/mediterrani/temps-geologic-preguntes.json';
const MEDITERRANI_TEMPS_GEOLOGIC_LEVELS = [
    { value: 'eso1', label: 'Fàcil', modifier: 'quiz-filter-button--easy' },
    { value: 'eso4', label: 'Mitjà', modifier: 'quiz-filter-button--medium' },
    { value: 'bat1', label: 'Difícil', modifier: 'quiz-filter-button--hard' },
    { value: 'bat2', label: 'Molt difícil', modifier: 'quiz-filter-button--very-hard' }
];
const MEDITERRANI_TEMPS_GEOLOGIC_TOPICS = [
    { value: 'origen', label: 'Origen de la Terra i de l’Univers' },
    { value: 'temps', label: 'Escala del temps geològic' },
    { value: 'vida', label: 'Evolució i extincions' },
    { value: 'mediterrani', label: 'Geologia del Mediterrani' }
];

const mediterraniTempsGeologicQuiz = {
    allQuestions: [],
    questions: [],
    level: '',
    topic: '',
    current: 0,
    score: 0,
    answered: false
};

function geoQuizText(key, fallback) {
    return typeof i18n !== 'undefined' && i18n.t(key) !== key ? i18n.t(key) : fallback;
}

async function initMediterraniTempsGeologicQuiz() {
    const selector = document.getElementById('med-temps-geologic-selector');
    const quiz = document.getElementById('med-temps-geologic-quiz');
    const results = document.getElementById('med-temps-geologic-results');
    if (!selector || !quiz || !results) return;

    document.getElementById('med-temps-geologic-next').onclick = nextMediterraniTempsGeologicQuestion;
    document.getElementById('med-temps-geologic-retry').onclick = startMediterraniTempsGeologicQuiz;
    document.getElementById('med-temps-geologic-change').onclick = resetMediterraniTempsGeologicToSelector;

    selector.classList.remove('hidden');
    quiz.classList.add('hidden');
    results.classList.add('hidden');
    mediterraniTempsGeologicQuiz.level = '';
    mediterraniTempsGeologicQuiz.topic = '';
    mediterraniTempsGeologicQuiz.current = 0;
    mediterraniTempsGeologicQuiz.score = 0;

    if (!mediterraniTempsGeologicQuiz.allQuestions.length) {
        try {
            const response = await fetch(MEDITERRANI_TEMPS_GEOLOGIC_DATA_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            mediterraniTempsGeologicQuiz.allQuestions = await response.json();
        } catch (error) {
            console.error('Error carregant les preguntes del temps geològic:', error);
            selector.innerHTML = `<p class="quiz-feedback--error">${geoQuizText('geoquiz_load_error', 'No s’han pogut carregar les preguntes.')}</p>`;
            return;
        }
    }

    renderMediterraniTempsGeologicFilters();
}

function renderMediterraniTempsGeologicFilters() {
    const container = document.getElementById('med-temps-geologic-filters');
    const startButton = document.getElementById('med-temps-geologic-start');
    if (!container || !startButton) return;
    container.innerHTML = '';

    const levelTitle = document.createElement('p');
    levelTitle.className = 'med-temps-geologic__filter-title';
    levelTitle.textContent = geoQuizText('geoquiz_level', 'Tria el nivell:');
    container.appendChild(levelTitle);

    const levelGroup = document.createElement('div');
    levelGroup.className = 'med-temps-geologic__filter-group';
    MEDITERRANI_TEMPS_GEOLOGIC_LEVELS.forEach(level => {
        levelGroup.appendChild(createGeoQuizFilterButton(level.label, level.value, level.modifier, 'level'));
    });
    container.appendChild(levelGroup);

    const topicTitle = document.createElement('p');
    topicTitle.className = 'med-temps-geologic__filter-title';
    topicTitle.textContent = geoQuizText('geoquiz_topic', 'Tria el tema:');
    container.appendChild(topicTitle);

    const topicGroup = document.createElement('div');
    topicGroup.className = 'med-temps-geologic__filter-group';
    MEDITERRANI_TEMPS_GEOLOGIC_TOPICS.forEach(topic => {
        topicGroup.appendChild(createGeoQuizFilterButton(topic.label, topic.value, 'quiz-filter-button--topic', 'topic'));
    });
    topicGroup.appendChild(createGeoQuizFilterButton(
        geoQuizText('geoquiz_mixed_topics', 'Temes barrejats'),
        'mixed',
        'quiz-filter-button--mixed',
        'topic'
    ));
    container.appendChild(topicGroup);

    startButton.onclick = startMediterraniTempsGeologicQuiz;
    updateMediterraniTempsGeologicSelection();
}

function createGeoQuizFilterButton(label, value, modifier, type) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn btn--primary quiz-filter-button ${modifier}`;
    button.dataset.filterType = type;
    button.dataset.filterValue = value;
    button.setAttribute('aria-pressed', 'false');
    button.textContent = label;
    button.onclick = () => {
        mediterraniTempsGeologicQuiz[type] = value;
        updateMediterraniTempsGeologicSelection();
    };
    return button;
}

function updateMediterraniTempsGeologicSelection() {
    const { level, topic } = mediterraniTempsGeologicQuiz;
    document.querySelectorAll('#med-temps-geologic-filters [data-filter-type]').forEach(button => {
        const selected = button.dataset.filterType === 'level'
            ? button.dataset.filterValue === level
            : button.dataset.filterValue === topic;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', String(selected));
    });
    const startButton = document.getElementById('med-temps-geologic-start');
    if (startButton) startButton.disabled = !level || !topic;
}

function shuffleGeoQuiz(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function startMediterraniTempsGeologicQuiz() {
    const state = mediterraniTempsGeologicQuiz;
    const pool = state.allQuestions.filter(question =>
        question.level === state.level && (state.topic === 'mixed' || question.topic === state.topic)
    );
    if (!pool.length) return;

    state.questions = shuffleGeoQuiz(pool).slice(0, 10);
    state.current = 0;
    state.score = 0;
    state.answered = false;
    document.getElementById('med-temps-geologic-selector').classList.add('hidden');
    document.getElementById('med-temps-geologic-results').classList.add('hidden');
    document.getElementById('med-temps-geologic-quiz').classList.remove('hidden');
    renderMediterraniTempsGeologicQuestion();
}

function renderMediterraniTempsGeologicQuestion() {
    const state = mediterraniTempsGeologicQuiz;
    const question = state.questions[state.current];
    if (!question) {
        finishMediterraniTempsGeologicQuiz();
        return;
    }
    state.answered = false;
    document.getElementById('med-temps-geologic-progress').textContent = `${geoQuizText('question', 'Pregunta')} ${state.current + 1}/${state.questions.length}`;
    document.getElementById('med-temps-geologic-score').textContent = `${geoQuizText('score', 'Puntuació')}: ${state.score}`;
    document.getElementById('med-temps-geologic-selection').textContent = `${getGeoQuizLevelLabel(state.level)} · ${getGeoQuizTopicLabel(state.topic)}`;
    document.getElementById('med-temps-geologic-question').textContent = question.question;
    document.getElementById('med-temps-geologic-feedback').textContent = '';
    document.getElementById('med-temps-geologic-next').classList.add('hidden');

    const options = document.getElementById('med-temps-geologic-options');
    options.innerHTML = '';
    shuffleGeoQuiz(question.options.map((text, index) => ({ text, index }))).forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn quiz-option-button';
        button.textContent = option.text;
        button.onclick = () => answerMediterraniTempsGeologicQuestion(option.index, button);
        options.appendChild(button);
    });
}

function answerMediterraniTempsGeologicQuestion(selectedIndex, selectedButton) {
    const state = mediterraniTempsGeologicQuiz;
    if (state.answered) return;
    state.answered = true;
    const question = state.questions[state.current];
    const correct = selectedIndex === question.correct;
    if (correct) state.score += 1;

    document.querySelectorAll('#med-temps-geologic-options button').forEach(button => { button.disabled = true; });
    if (correct) {
        selectedButton.classList.add('correct');
    } else {
        selectedButton.classList.add('incorrect');
        document.querySelectorAll('#med-temps-geologic-options button').forEach(button => {
            if (button.textContent === question.options[question.correct]) button.classList.add('correct');
        });
    }
    const feedback = document.getElementById('med-temps-geologic-feedback');
    feedback.textContent = correct ? geoQuizText('correct', 'Correcte!') : geoQuizText('incorrect', 'Incorrecte.');
    setElementStateColor(feedback, correct ? 'success' : 'error');
    document.getElementById('med-temps-geologic-score').textContent = `${geoQuizText('score', 'Puntuació')}: ${state.score}`;
    document.getElementById('med-temps-geologic-next').classList.remove('hidden');
}

function nextMediterraniTempsGeologicQuestion() {
    if (!mediterraniTempsGeologicQuiz.answered) return;
    mediterraniTempsGeologicQuiz.current += 1;
    renderMediterraniTempsGeologicQuestion();
}

async function finishMediterraniTempsGeologicQuiz() {
    const quizState = mediterraniTempsGeologicQuiz;
    const percentage = Math.round((quizState.score / quizState.questions.length) * 100);
    document.getElementById('med-temps-geologic-quiz').classList.add('hidden');
    document.getElementById('med-temps-geologic-results').classList.remove('hidden');
    document.getElementById('med-temps-geologic-final-score').textContent = `${percentage}% (${quizState.score}/${quizState.questions.length})`;
    document.getElementById('med-temps-geologic-final-message').textContent = percentage >= 70
        ? geoQuizText('geoquiz_good', 'Molt bé!')
        : geoQuizText('geoquiz_review', 'Cal continuar repassant el temps geològic.');

    if (typeof state === 'undefined' || !state.user || !state.currentProject) return;
    try {
        await callApi('saveResult', {
            email: state.user.email,
            curs: state.user.curs,
            projecte: state.currentProject.titol,
            app: 'Història de la Terra i del Mediterrani',
            nivell: `${getGeoQuizLevelLabel(quizState.level)} · ${getGeoQuizTopicLabel(quizState.topic)}`,
            puntuacio: percentage,
            temps_segons: 0,
            feedback_pos: `${quizState.score}/${quizState.questions.length}`,
            feedback_neg: ''
        });
    } catch (error) {
        console.error('Error desant les preguntes del temps geològic:', error);
    }
}

function getGeoQuizLevelLabel(value) {
    return MEDITERRANI_TEMPS_GEOLOGIC_LEVELS.find(level => level.value === value)?.label || value;
}

function getGeoQuizTopicLabel(value) {
    if (value === 'mixed') return geoQuizText('geoquiz_mixed_topics', 'Temes barrejats');
    return MEDITERRANI_TEMPS_GEOLOGIC_TOPICS.find(topic => topic.value === value)?.label || value;
}

function resetMediterraniTempsGeologicToSelector() {
    document.getElementById('med-temps-geologic-results').classList.add('hidden');
    document.getElementById('med-temps-geologic-selector').classList.remove('hidden');
    renderMediterraniTempsGeologicFilters();
}

document.addEventListener('languageChanged', () => {
    if (!document.getElementById('med-activity-temps-geologic')?.classList.contains('hidden')) {
        renderMediterraniTempsGeologicFilters();
    }
});

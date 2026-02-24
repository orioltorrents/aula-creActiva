/**
 * Activitat: Quiz Aparell Circulatori
 * Projecte: Biologia
 */

let circQuizState = {
    allQuestions: [],
    activeQuestions: [],
    currentQ: 0,
    score: 0,
    examFinished: false,
    locked: false,
    selectedType: 'all',
    selectedLevel: 'mixed'
};

async function initCircQuiz() {
    // UI Reset
    document.getElementById('bio-activity-circulatori-quiz').classList.remove('hidden');
    document.getElementById('circ-quiz-selection').classList.remove('hidden');
    document.getElementById('circ-quiz-topic-selection').innerHTML = ''; // Netejar dinàmics
    document.getElementById('circ-quiz-ui').classList.add('hidden');
    document.getElementById('circ-quiz-results').classList.add('hidden');

    // Hide other sub-activity menus
    document.getElementById('bio-circulatori-activities').classList.add('hidden');

    const feedback = document.getElementById('circ-quiz-feedback');
    feedback.innerText = i18n.t('loading') || 'Carregant dades...';
    feedback.style.color = 'var(--text-main)';
    feedback.style.fontWeight = 'normal';


    try {
        const response = await callApi('getCirculatoriQuestions');
        if (response && response.status === 'success' && response.questions) {
            circQuizState.allQuestions = response.questions;

            // Mostrar selector
            document.getElementById('circ-quiz-selection').classList.remove('hidden');
            feedback.innerText = '';

            // Generar botons de TIPUS dinàmicament
            generateCircTopicButtons(response.questions);

        } else {
            const errorMsg = response && response.message ? response.message : 'Error al carregar dades.';
            feedback.innerText = `Error: ${errorMsg}. Revisa que la pestanya al Google Sheet es digui "aparell-circulatori" i contingui dades amb les capçaleres correctes (Pregunta, Correcta, etc).`;
            feedback.style.color = 'var(--error)';
            feedback.style.fontWeight = 'bold';
        }

    } catch (e) {
        console.error("Error fetching circulatori questions", e);
        feedback.innerText = 'Error de connexió.';
    }
}

function generateCircTopicButtons(questions) {
    const container = document.getElementById('circ-quiz-topic-selection');
    container.innerHTML = '';

    // Obtenir tipus únics
    const types = [...new Set(questions.map(q => q.type))].filter(t => t && t !== "");

    if (types.length === 0) return;

    const label = document.createElement('p');
    label.className = 'font-bold mb-3 text-center';
    label.innerText = 'Tria un tema (nivell barrejat):';
    container.appendChild(label);

    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'flex flex-wrap justify-center gap-4 mb-6';

    types.forEach(type => {
        const btn = document.createElement('button');
        btn.className = 'btn-primary';
        btn.style = "background-color: var(--primary-color); width: auto; font-size: 0.95rem; padding: 10px 20px; min-width: 120px;";
        btn.innerText = type;
        btn.onclick = () => startCircQuizWithFilter(type, 'mixed');
        btnWrapper.appendChild(btn);
    });

    container.appendChild(btnWrapper);
}

function startCircQuizWithFilter(type = 'all', level = 'mixed') {
    circQuizState.selectedType = type;
    circQuizState.selectedLevel = level;

    // Filtrar preguntes
    let pool = [...circQuizState.allQuestions];

    const targetLevel = normalizeCircLevel(level);

    if (type !== 'all') {
        pool = pool.filter(q => q.type === type);
    }

    if (targetLevel !== 'mixed') {
        pool = pool.filter(q => normalizeCircLevel(q.level) === targetLevel);
    }

    if (pool.length === 0) {
        const feedback = document.getElementById('circ-quiz-feedback');
        feedback.innerText = `No s'han trobat preguntes per a aquesta combinació.`;
        feedback.style.color = 'var(--error)';
        return;
    }

    // Processar i barrejar
    circQuizState.activeQuestions = pool.sort(() => Math.random() - 0.5).slice(0, 10).map(qData => {
        const shuffledAlts = [...qData.alternatives].sort(() => Math.random() - 0.5);
        const correctIdx = shuffledAlts.indexOf(qData.correct);
        return {
            q: qData.q,
            a: shuffledAlts,
            correct: correctIdx
        };
    });

    // Start Game UI
    document.getElementById('circ-quiz-selection').classList.add('hidden');
    document.getElementById('circ-quiz-ui').classList.remove('hidden');

    circQuizState.currentQ = 0;
    circQuizState.score = 0;
    circQuizState.examFinished = false;
    circQuizState.locked = false;

    showCircQuizQuestion();
}

function normalizeCircLevel(text) {
    if (!text) return "";
    let t = String(text).toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Mapatge flexible de nivells
    if (t === 'facil' || t === 'easy') return 'easy';
    if (t === 'mitja' || t === 'medio' || t === 'medium') return 'medium';
    if (t === 'dificil' || t === 'hard') return 'hard';

    return t;
}


function showCircQuizQuestion() {
    const qData = circQuizState.activeQuestions[circQuizState.currentQ];

    document.getElementById('circ-quiz-progress').innerText = `${i18n.t('question')} ${circQuizState.currentQ + 1}/${circQuizState.activeQuestions.length}`;
    document.getElementById('circ-quiz-score').innerText = `${i18n.t('score')}: ${circQuizState.score}`;

    document.getElementById('circ-quiz-question-text').innerText = qData.q;

    const optsContainer = document.getElementById('circ-quiz-options');
    optsContainer.innerHTML = '';

    qData.a.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-option w-full text-left mb-2';
        btn.innerText = optText;
        btn.onclick = () => handleCircQuizAnswer(idx);
        optsContainer.appendChild(btn);
    });

    document.getElementById('circ-quiz-feedback').innerText = '';
}

function handleCircQuizAnswer(selectedIndex) {
    if (circQuizState.locked) return;
    circQuizState.locked = true;

    const qData = circQuizState.activeQuestions[circQuizState.currentQ];
    const isCorrect = selectedIndex === qData.correct;

    const buttons = document.getElementById('circ-quiz-options').querySelectorAll('button');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === qData.correct) btn.classList.add('correct');
        else if (idx === selectedIndex) btn.classList.add('incorrect');
    });


    if (isCorrect) {
        circQuizState.score += 10;
        document.getElementById('circ-quiz-feedback').innerText = i18n.t('correct');
        document.getElementById('circ-quiz-feedback').style.color = 'var(--success)';
    } else {
        document.getElementById('circ-quiz-feedback').innerText = i18n.t('incorrect');
        document.getElementById('circ-quiz-feedback').style.color = 'var(--error)';
    }

    setTimeout(() => {
        circQuizState.currentQ++;
        circQuizState.locked = false;
        if (circQuizState.currentQ >= circQuizState.activeQuestions.length) {
            finishCircQuiz();
        } else {
            showCircQuizQuestion();
        }
    }, 1500);
}

async function finishCircQuiz() {
    circQuizState.examFinished = true;
    document.getElementById('circ-quiz-ui').classList.add('hidden');
    document.getElementById('circ-quiz-results').classList.remove('hidden');

    const totalPossible = circQuizState.activeQuestions.length * 10;
    const percentage = Math.round((circQuizState.score / totalPossible) * 100);
    document.getElementById('circ-quiz-final-score').innerText = `${circQuizState.score} / ${totalPossible} (${percentage}%)`;

    let msg = "";
    if (percentage >= 90) msg = "Excel·lent! Tens un domini total de l'aparell circulatori! 🩸";
    else if (percentage >= 70) msg = "Molt bé! Coneixes bé el funcionament del cor i els vasos. ❤️";
    else if (percentage >= 50) msg = "Ho has superat, però cal repassar alguns conceptes. 📚";
    else msg = "Caldria revisar bé el tema del circulatori. Ànims! 💪";

    document.getElementById('circ-quiz-message').innerText = msg;

    // Guardar resultat
    if (typeof saveResult === 'function') {
        let label = i18n.t('act_circ_quiz_title');
        if (circQuizState.selectedType !== 'all') label += ` (${circQuizState.selectedType})`;

        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        saveResult({
            email: userData.email,
            curs: userData.curs,
            projecte: 'Biologia',
            app: label,
            nivell: circQuizState.selectedLevel,
            puntuacio: percentage,
            temps_segons: 0,
            feedback_pos: '',
            feedback_neg: ''
        });
    }
}

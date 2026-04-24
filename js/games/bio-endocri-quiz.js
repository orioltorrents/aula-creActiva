/**
 * Activitat: Quiz Sistema Endocrí
 * Projecte: Biologia
 */

let endoQuizState = {
    allQuestions: [],
    activeQuestions: [],
    currentQ: 0,
    score: 0,
    examFinished: false,
    locked: false,
    selectedType: 'all',
    selectedLevel: 'mixed'
};

async function initEndoQuiz() {
    // UI Reset
    document.getElementById('bio-activity-endocri-quiz').classList.remove('hidden');
    document.getElementById('endo-quiz-selection').classList.remove('hidden');
    document.getElementById('endo-quiz-topic-selection').innerHTML = ''; // Netejar dinàmics
    document.getElementById('endo-quiz-ui').classList.add('hidden');
    document.getElementById('endo-quiz-results').classList.add('hidden');

    // Hide other sub-activity menus
    document.getElementById('bio-endocri-activities').classList.add('hidden');

    const feedback = document.getElementById('endo-quiz-feedback');
    feedback.innerText = i18n.t('loading') || 'Carregant dades...';
    feedback.style.color = 'var(--text-main)';
    feedback.style.fontWeight = 'normal';


    try {
        const response = await callApi('getEndocriQuestions');
        if (response && response.status === 'success' && response.questions) {
            endoQuizState.allQuestions = response.questions;

            // Mostrar selector
            document.getElementById('endo-quiz-selection').classList.remove('hidden');
            feedback.innerText = '';

            // Generar botons de TIPUS dinàmicament
            generateEndoTopicButtons(response.questions);

        } else {
            const errorMsg = response && response.message ? response.message : 'Error al carregar dades.';
            feedback.innerText = `Error: ${errorMsg}. Revisa que la pestanya al Google Sheet es digui "sistema-endocri" i contingui dades amb les capçaleres correctes (Pregunta, Correcta, etc).`;
            feedback.style.color = 'var(--error)';
            feedback.style.fontWeight = 'bold';
        }

    } catch (e) {
        console.error("Error fetching endocri questions", e);
        feedback.innerText = 'Error de connexió.';
    }
}

function generateEndoTopicButtons(questions) {
    const container = document.getElementById('endo-quiz-topic-selection');
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
        btn.onclick = () => startEndoQuizWithFilter(type, 'mixed');
        btnWrapper.appendChild(btn);
    });

    container.appendChild(btnWrapper);
}

function startEndoQuizWithFilter(type = 'all', level = 'mixed') {
    endoQuizState.selectedType = type;
    endoQuizState.selectedLevel = level;

    // Filtrar preguntes
    let pool = [...endoQuizState.allQuestions];

    const targetLevel = normalizeEndoLevel(level);

    if (type !== 'all') {
        pool = pool.filter(q => q.type === type);
    }

    if (targetLevel !== 'mixed') {
        pool = pool.filter(q => normalizeEndoLevel(q.level) === targetLevel);
    }

    if (pool.length === 0) {
        const feedback = document.getElementById('endo-quiz-feedback');
        feedback.innerText = `No s'han trobat preguntes per a aquesta combinació.`;
        feedback.style.color = 'var(--error)';
        return;
    }

    // Processar i barrejar
    endoQuizState.activeQuestions = pool.sort(() => Math.random() - 0.5).slice(0, 10).map(qData => {
        const shuffledAlts = [...qData.alternatives].sort(() => Math.random() - 0.5);
        const correctIdx = shuffledAlts.indexOf(qData.correct);
        return {
            q: qData.q,
            a: shuffledAlts,
            correct: correctIdx
        };
    });

    // Start Game UI
    document.getElementById('endo-quiz-selection').classList.add('hidden');
    document.getElementById('endo-quiz-ui').classList.remove('hidden');

    endoQuizState.currentQ = 0;
    endoQuizState.score = 0;
    endoQuizState.examFinished = false;
    endoQuizState.locked = false;

    showEndoQuizQuestion();
}

function normalizeEndoLevel(text) {
    if (!text) return "";
    let t = String(text).toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Mapatge flexible de nivells
    if (t === 'facil' || t === 'easy') return 'easy';
    if (t === 'mitja' || t === 'medio' || t === 'medium') return 'medium';
    if (t === 'dificil' || t === 'hard') return 'hard';

    return t;
}


function showEndoQuizQuestion() {
    const qData = endoQuizState.activeQuestions[endoQuizState.currentQ];

    document.getElementById('endo-quiz-progress').innerText = `${i18n.t('question')} ${endoQuizState.currentQ + 1}/${endoQuizState.activeQuestions.length}`;
    document.getElementById('endo-quiz-score').innerText = `${i18n.t('score')}: ${endoQuizState.score}`;

    document.getElementById('endo-quiz-question-text').innerText = qData.q;

    const optsContainer = document.getElementById('endo-quiz-options');
    optsContainer.innerHTML = '';

    qData.a.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-option w-full text-left mb-2';
        btn.innerText = optText;
        btn.onclick = () => handleEndoQuizAnswer(idx);
        optsContainer.appendChild(btn);
    });

    document.getElementById('endo-quiz-feedback').innerText = '';
}

function handleEndoQuizAnswer(selectedIndex) {
    if (endoQuizState.locked) return;
    endoQuizState.locked = true;

    const qData = endoQuizState.activeQuestions[endoQuizState.currentQ];
    const isCorrect = selectedIndex === qData.correct;

    const buttons = document.getElementById('endo-quiz-options').querySelectorAll('button');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === qData.correct) btn.classList.add('correct');
        else if (idx === selectedIndex) btn.classList.add('incorrect');
    });


    if (isCorrect) {
        endoQuizState.score += 10;
        document.getElementById('endo-quiz-feedback').innerText = i18n.t('correct');
        document.getElementById('endo-quiz-feedback').style.color = 'var(--success)';
    } else {
        document.getElementById('endo-quiz-feedback').innerText = i18n.t('incorrect');
        document.getElementById('endo-quiz-feedback').style.color = 'var(--error)';
    }

    setTimeout(() => {
        endoQuizState.currentQ++;
        endoQuizState.locked = false;
        if (endoQuizState.currentQ >= endoQuizState.activeQuestions.length) {
            finishEndoQuiz();
        } else {
            showEndoQuizQuestion();
        }
    }, 1500);
}

async function finishEndoQuiz() {
    endoQuizState.examFinished = true;
    document.getElementById('endo-quiz-ui').classList.add('hidden');
    document.getElementById('endo-quiz-results').classList.remove('hidden');

    const totalPossible = endoQuizState.activeQuestions.length * 10;
    const percentage = Math.round((endoQuizState.score / totalPossible) * 100);
    document.getElementById('endo-quiz-final-score').innerText = `${endoQuizState.score} / ${totalPossible} (${percentage}%)`;

    let msg = "";
    if (percentage >= 90) msg = "Excel·lent! Tens un domini total del sistema endocrí! 🧠";
    else if (percentage >= 70) msg = "Molt bé! Coneixes bé les glàndules i hormones. 🩸";
    else if (percentage >= 50) msg = "Ho has superat, però cal repassar alguns conceptes. 📚";
    else msg = "Caldria revisar bé el tema de l'endocrí. Ànims! 💪";

    document.getElementById('endo-quiz-message').innerText = msg;

    // Guardar resultat
    if (typeof saveResult === 'function') {
        let label = i18n.t('act_endo_quiz_title') || 'Repàs de l\'Endocrí';
        if (endoQuizState.selectedType !== 'all') label += ` (${endoQuizState.selectedType})`;

        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        saveResult({
            email: userData.email,
            curs: userData.curs,
            projecte: 'Biologia',
            app: label,
            nivell: endoQuizState.selectedLevel,
            puntuacio: percentage,
            temps_segons: 0,
            feedback_pos: '',
            feedback_neg: ''
        });
    }
}

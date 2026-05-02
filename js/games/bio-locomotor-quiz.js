/**
 * Activitat: Quiz Aparell Locomotor
 * Projecte: Biologia
 */

let locomotorQuizState = {
    allQuestions: [],
    activeQuestions: [],
    currentQ: 0,
    score: 0,
    examFinished: false,
    locked: false,
    selectedType: 'all',
    selectedLevel: 'mixed'
};

async function initLocomotorQuiz() {
    // UI Reset
    document.getElementById('bio-activity-locomotor-quiz').classList.remove('hidden');
    document.getElementById('locomotor-quiz-selection').classList.remove('hidden');
    document.getElementById('locomotor-quiz-topic-selection').innerHTML = ''; // Netejar dinàmics
    document.getElementById('locomotor-quiz-ui').classList.add('hidden');
    document.getElementById('locomotor-quiz-results').classList.add('hidden');

    // Hide other sub-activity menus
    document.getElementById('bio-locomotor-activities').classList.add('hidden');

    const feedback = document.getElementById('locomotor-quiz-feedback');
    feedback.innerText = i18n.t('loading') || 'Carregant dades...';
    setElementStateColor(feedback, 'muted');
    feedback.style.fontWeight = 'normal';


    try {
        const response = await callApi('getLocomotorQuestions');
        if (response && response.status === 'success' && response.questions) {
            locomotorQuizState.allQuestions = response.questions;

            // Mostrar selector
            document.getElementById('locomotor-quiz-selection').classList.remove('hidden');
            feedback.innerText = '';

            // Generar botons de TIPUS dinàmicament
            generateLocomotorTopicButtons(response.questions);

        } else {
            const errorMsg = response && response.message ? response.message : 'Error al carregar dades.';
            feedback.innerText = `Error: ${errorMsg}. Revisa que la pestanya al Google Sheet es digui "aparell-locomotor" i contingui dades amb les capçaleres correctes (Pregunta, Correcta, etc).`;
            setElementStateColor(feedback, 'error');
            feedback.style.fontWeight = 'bold';
        }

    } catch (e) {
        console.error("Error fetching locomotor questions", e);
        feedback.innerText = 'Error de connexió.';
    }
}

function generateLocomotorTopicButtons(questions) {
    const container = document.getElementById('locomotor-quiz-topic-selection');
    container.innerHTML = '';

    // --- SECCIÓ PER TEMA (type) ---
    const types = [...new Set(questions.map(q => q.type))].filter(t => t && t !== "");

    if (types.length > 0) {
        const topicLabel = document.createElement('p');
        topicLabel.className = 'w-full text-center font-bold mb-3';
        topicLabel.innerText = 'Per Tema:';
        container.appendChild(topicLabel);

        const topicWrapper = document.createElement('div');
        topicWrapper.className = 'flex flex-wrap justify-center gap-4 mb-4';

        types.forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'btn btn--primary';
            btn.style = "background-color: #3b82f6; width: auto; font-size: 0.95rem; padding: 10px 20px; min-width: 120px;";
            btn.innerText = type;
            btn.onclick = () => startLocomotorQuizWithFilter(type, 'mixed');
            topicWrapper.appendChild(btn);
        });
        container.appendChild(topicWrapper);
    }

    // --- SECCIÓ PER NIVELL (level) ---
    const rawLevels = [...new Set(questions.map(q => q.level))].filter(l => l && l.toString().trim() !== "");

    if (rawLevels.length > 0) {
        const levelLabel = document.createElement('p');
        levelLabel.className = 'w-full text-center font-bold mb-3 mt-2';
        levelLabel.innerText = 'Per Nivell:';
        container.appendChild(levelLabel);

        const levelWrapper = document.createElement('div');
        levelWrapper.className = 'flex flex-wrap justify-center gap-4 mb-4';

        rawLevels.forEach(lvl => {
            const btn = document.createElement('button');
            btn.className = 'btn btn--primary';
            btn.style = "background-color: #10b981; width: auto; font-size: 0.95rem; padding: 10px 20px; min-width: 120px;";
            btn.innerText = lvl;
            btn.onclick = () => startLocomotorQuizWithFilter('all', lvl);
            levelWrapper.appendChild(btn);
        });
        container.appendChild(levelWrapper);
    }

    // --- BOTÓ BARREJAT (tots) ---
    const mixLabel = document.createElement('p');
    mixLabel.className = 'w-full text-center font-bold mb-3 mt-2';
    mixLabel.innerText = 'O bé:';
    container.appendChild(mixLabel);

    const mixWrapper = document.createElement('div');
    mixWrapper.className = 'flex flex-wrap justify-center gap-4';

    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn btn--primary';
    mixBtn.style = "background-color: #7c3aed; width: auto; font-size: 0.95rem; padding: 10px 20px; min-width: 120px;";
    mixBtn.innerText = 'Barrejat (Tots)';
    mixBtn.onclick = () => startLocomotorQuizWithFilter('all', 'mixed');
    mixWrapper.appendChild(mixBtn);
    container.appendChild(mixWrapper);
}

function startLocomotorQuizWithFilter(type = 'all', level = 'mixed') {
    locomotorQuizState.selectedType = type;
    locomotorQuizState.selectedLevel = level;

    // Filtrar preguntes
    let pool = [...locomotorQuizState.allQuestions];

    const targetLevel = normalizeLocomotorLevel(level);

    if (type !== 'all') {
        pool = pool.filter(q => q.type === type);
    }

    if (targetLevel !== 'mixed') {
        pool = pool.filter(q => normalizeLocomotorLevel(q.level) === targetLevel);
    }

    if (pool.length === 0) {
        const feedback = document.getElementById('locomotor-quiz-feedback');
        feedback.innerText = `No s'han trobat preguntes per a aquesta combinació.`;
        setElementStateColor(feedback, 'error');
        return;
    }

    // Processar i barrejar
    locomotorQuizState.activeQuestions = pool.sort(() => Math.random() - 0.5).slice(0, 10).map(qData => {
        const shuffledAlts = [...qData.alternatives].sort(() => Math.random() - 0.5);
        const correctIdx = shuffledAlts.indexOf(qData.correct);
        return {
            q: qData.q,
            a: shuffledAlts,
            correct: correctIdx
        };
    });

    // Start Game UI
    document.getElementById('locomotor-quiz-selection').classList.add('hidden');
    document.getElementById('locomotor-quiz-ui').classList.remove('hidden');

    locomotorQuizState.currentQ = 0;
    locomotorQuizState.score = 0;
    locomotorQuizState.examFinished = false;
    locomotorQuizState.locked = false;

    showLocomotorQuizQuestion();
}

function normalizeLocomotorLevel(text) {
    if (!text) return "";
    let t = String(text).toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Mapatge flexible de nivells
    if (t === 'facil' || t === 'easy') return 'easy';
    if (t === 'mitja' || t === 'medio' || t === 'medium') return 'medium';
    if (t === 'dificil' || t === 'hard') return 'hard';

    return t;
}


function showLocomotorQuizQuestion() {
    const qData = locomotorQuizState.activeQuestions[locomotorQuizState.currentQ];

    document.getElementById('locomotor-quiz-progress').innerText = `${i18n.t('question')} ${locomotorQuizState.currentQ + 1}/${locomotorQuizState.activeQuestions.length}`;
    document.getElementById('locomotor-quiz-score').innerText = `${i18n.t('score')}: ${locomotorQuizState.score}`;

    document.getElementById('locomotor-quiz-question-text').innerText = qData.q;

    const optsContainer = document.getElementById('locomotor-quiz-options');
    optsContainer.innerHTML = '';

    qData.a.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-option w-full text-left mb-2';
        btn.innerText = optText;
        btn.onclick = () => handleLocomotorQuizAnswer(idx);
        optsContainer.appendChild(btn);
    });

    document.getElementById('locomotor-quiz-feedback').innerText = '';
}

function handleLocomotorQuizAnswer(selectedIndex) {
    if (locomotorQuizState.locked) return;
    locomotorQuizState.locked = true;

    const qData = locomotorQuizState.activeQuestions[locomotorQuizState.currentQ];
    const isCorrect = selectedIndex === qData.correct;

    const buttons = document.getElementById('locomotor-quiz-options').querySelectorAll('button');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === qData.correct) btn.classList.add('correct');
        else if (idx === selectedIndex) btn.classList.add('incorrect');
    });


    if (isCorrect) {
        locomotorQuizState.score += 10;
        document.getElementById('locomotor-quiz-feedback').innerText = i18n.t('correct');
        setElementStateColor(document.getElementById('locomotor-quiz-feedback'), 'success');
    } else {
        document.getElementById('locomotor-quiz-feedback').innerText = i18n.t('incorrect');
        setElementStateColor(document.getElementById('locomotor-quiz-feedback'), 'error');
    }

    setTimeout(() => {
        locomotorQuizState.currentQ++;
        locomotorQuizState.locked = false;
        if (locomotorQuizState.currentQ >= locomotorQuizState.activeQuestions.length) {
            finishLocomotorQuiz();
        } else {
            showLocomotorQuizQuestion();
        }
    }, 1500);
}

async function finishLocomotorQuiz() {
    locomotorQuizState.examFinished = true;
    document.getElementById('locomotor-quiz-ui').classList.add('hidden');
    document.getElementById('locomotor-quiz-results').classList.remove('hidden');

    const totalPossible = locomotorQuizState.activeQuestions.length * 10;
    const percentage = Math.round((locomotorQuizState.score / totalPossible) * 100);
    document.getElementById('locomotor-quiz-final-score').innerText = `${percentage}%`;

    let msg = "";
    if (percentage >= 90) msg = "Excel·lent! Tens un domini total de l'aparell locomotor! 🦴";
    else if (percentage >= 70) msg = "Molt bé! Coneixes bé l'esquelet i la musculatura. 💪";
    else if (percentage >= 50) msg = "Ho has superat, però cal repassar alguns conceptes. 📚";
    else msg = "Caldria revisar bé el tema del locomotor. Ànims! 🚀";

    document.getElementById('locomotor-quiz-message').innerText = msg;

    // Guardar resultat
    let label = i18n.t('act_loco_quiz_title') || 'Repàs del Locomotor';
    if (locomotorQuizState.selectedType !== 'all') label += ` (${locomotorQuizState.selectedType})`;

    if (state.user) {
        callApi('saveResult', {
            email: state.user.email,
            curs: state.user.curs,
            projecte: 'Biologia',
            app: label,
            nivell: locomotorQuizState.selectedLevel,
            puntuacio: percentage,
            temps_segons: 0,
            feedback_pos: `Punts: ${locomotorQuizState.score}`,
            feedback_neg: ''
        }).then(response => {
            console.log("Resultat guardat", response);
        }).catch(err => console.error("Error guardant resultat", err));
    }
}



/**
 * Audio Connections Quiz Logic
 */

const connectionsQuiz = {
    questions: [],
    currentStep: 0,
    score: 0,
    isFinished: false
};

async function initConnectionsQuiz() {
    connectionsQuiz.currentStep = 0;
    connectionsQuiz.score = 0;
    connectionsQuiz.isFinished = false;

    // Mostrem loader
    const optionsGrid = document.getElementById('connection-options');
    optionsGrid.innerHTML = '<div class="loader"></div>';

    try {
        const response = await callApi('getRadioConnectionsQuestions');
        if (response && response.status === 'success') {
            // Triem 20 preguntes a l'atzar si n'hi ha més, o totes si n'hi ha 20 o menys
            connectionsQuiz.questions = response.questions.sort(() => 0.5 - Math.random()).slice(0, 20);
            renderConnectionQuestion();
        } else {
            console.error("Error carregant preguntes de conexions:", response);
        }
    } catch (e) {
        console.error("Error en initConnectionsQuiz:", e);
    }
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

    // Reset feedback
    feedbackEl.innerText = '';

    // Update progress and score
    progressEl.innerText = i18n.t('question') + ` ${connectionsQuiz.currentStep + 1}/${connectionsQuiz.questions.length}`;
    scoreEl.innerText = i18n.t('score') + `: ${connectionsQuiz.score}`;

    // Update image
    // Si la imatge no existeix, podem mostrar un placeholder o el nom
    imgEl.src = `assets/images/connections/${question.image}`;
    imgEl.onerror = () => {
        imgEl.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(question.correct);
    };

    // Render options
    optionsGrid.innerHTML = '';

    // Shuffle alternatives
    const shuffledOptions = [...question.alternatives].sort(() => 0.5 - Math.random());

    shuffledOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.innerText = option;
        btn.onclick = () => checkConnectionAnswer(option, question.correct, btn);
        optionsGrid.appendChild(btn);
    });
}

function checkConnectionAnswer(selected, correct, btn) {
    if (connectionsQuiz.isFinished) return;

    const feedbackEl = document.getElementById('connection-feedback');
    const options = document.querySelectorAll('#connection-options .btn-option');

    // Desactivar tots els botons per evitar clics múltiples
    options.forEach(opt => opt.disabled = true);

    if (selected === correct) {
        connectionsQuiz.score += 10;
        btn.classList.add('correct');
        feedbackEl.innerText = i18n.t('correct');
        feedbackEl.style.color = 'green';
    } else {
        btn.classList.add('incorrect');
        feedbackEl.innerText = i18n.t('incorrect') + ` (${correct})`;
        feedbackEl.style.color = 'red';

        // Marcar la correcta
        options.forEach(opt => {
            if (opt.innerText === correct) {
                opt.classList.add('correct');
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

    document.getElementById('connections-final-score').innerText = `${finalScore} / ${maxScore}`;

    let msg = '';
    if (finalScore >= maxScore * 0.9) msg = i18n.t('final_message_expert');
    else if (finalScore >= maxScore * 0.5) msg = i18n.t('final_message_analyst');
    else msg = i18n.t('final_message_apprentice');

    document.getElementById('connections-final-msg').innerText = msg;

    saveConnectionsResult(finalScore);
}

async function saveConnectionsResult(score) {
    if (typeof state === 'undefined' || !state.user) return;

    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject.titol,
        app: 'Conexions d\'Àudio',
        nivell: 'Identificació de connectors',
        puntuacio: score,
        temps_segons: 0,
        feedback_pos: 'Bon coneixement dels connectors físics.',
        feedback_neg: ''
    };

    await callApi('saveResult', result);
}

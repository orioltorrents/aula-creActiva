/**
 * NATURA - Classificació de rols tròfics
 */

const naturaRolsState = {
    questions: [],
    currentIndex: 0,
    ecosystem: '',
    score: 0,
    mode: 'practice', // 'practice' or 'exam'
    selections: {
        regime: null,
        level: null
    }
};

function startRolsQuiz(ecosystem) {
    naturaRolsState.ecosystem = ecosystem;
    naturaRolsState.currentIndex = 0;
    naturaRolsState.score = 0;
    naturaRolsState.questions = [];

    // Hide selection, show loader or quiz
    document.getElementById('rols-ecosystem-selection').classList.add('hidden');
    document.getElementById('rols-quiz-area').classList.remove('hidden');
    document.getElementById('rols-results-area').classList.add('hidden');

    loadQuestions();
}

async function loadQuestions() {
    // Simulació o crida real
    const response = await callApi('getNaturaQuestions', { ecosistema: naturaRolsState.ecosystem });
    if (response && response.status === 'success') {
        naturaRolsState.questions = response.questions;
        if (naturaRolsState.questions.length === 0) {
            alert('No hi ha preguntes per l\'ecosistema: ' + naturaRolsState.ecosystem);
            showNaturaMenu();
            return;
        }
        renderQuestion();
    } else {
        const msg = (response && response.message) ? response.message : 'Error desconegut';
        alert('Error carregant preguntes: ' + msg);
        showNaturaMenu();
    }
}

function renderQuestion() {
    const q = naturaRolsState.questions[naturaRolsState.currentIndex];

    // Reset state
    naturaRolsState.selections.regime = null;
    naturaRolsState.selections.level = null;
    document.getElementById('rols-justification').value = '';
    document.getElementById('rols-feedback').classList.add('hidden');
    document.getElementById('rols-submit-btn').classList.remove('hidden');
    document.getElementById('rols-next-btn').classList.add('hidden');

    // UI
    document.getElementById('rols-current-q').innerText = naturaRolsState.currentIndex + 1;
    document.getElementById('rols-progress-fill').style.width = `${((naturaRolsState.currentIndex + 1) / 10) * 100}%`;
    document.getElementById('rols-species-name').innerText = q['Espècie'];
    document.getElementById('rols-diet-desc').innerText = q['Descripció dieta'];

    // Image handling
    const imgContainer = document.getElementById('rols-species-img-container');
    const imgEl = document.getElementById('rols-species-img');
    if (q['URL Imatge']) {
        imgEl.src = q['URL Imatge'];
        imgContainer.classList.remove('hidden');
    } else {
        imgContainer.classList.add('hidden');
    }

    // Clear buttons
    document.querySelectorAll('#rols-regime-options .btn-outline').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('#rols-level-options .btn-outline').forEach(b => b.classList.remove('selected'));
}

function selectRegime(regime, btn) {
    naturaRolsState.selections.regime = regime;
    document.querySelectorAll('#rols-regime-options .btn-outline').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function selectLevel(level, btn) {
    naturaRolsState.selections.level = level;
    document.querySelectorAll('#rols-level-options .btn-outline').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function submitRolsAnswer() {
    const justification = document.getElementById('rols-justification').value.trim();

    // ValIdació
    if (!naturaRolsState.selections.regime || !naturaRolsState.selections.level || justification.length < 10) {
        alert('Si us plau, respon totes les opcions i justifica la resposta (mínim 10 caràcters).');
        return;
    }

    const q = naturaRolsState.questions[naturaRolsState.currentIndex];
    let pRegime = 0, pLevel = 0, pJust = 0;

    // 1. Règim
    if (i18n.t(naturaRolsState.selections.regime).toLowerCase() === q['Règim correcte'].toLowerCase()) {
        pRegime = 1;
    }

    // 2. Nivell
    if (i18n.t(naturaRolsState.selections.level).toLowerCase() === q['Nivell correcte'].toLowerCase()) {
        pLevel = 1;
    }

    // 3. Justificació (Paraules clau)
    const keywords = q['Paraules clau justificació'].split(';').map(k => k.trim().toLowerCase());
    const justLower = justification.toLowerCase();
    let matches = 0;
    keywords.forEach(k => {
        if (justLower.includes(k)) matches++;
    });

    if (matches >= 2) pJust = 2;
    else if (matches === 1) pJust = 1;

    const totalQ = pRegime + pLevel + pJust;
    naturaRolsState.score += totalQ;

    saveIndividualResult(q.ID, pRegime, pLevel, pJust, totalQ, justification);

    if (naturaRolsState.mode === 'practice') {
        showFeedback(pRegime, pLevel, pJust, q);
    } else {
        nextRolsQuestion();
    }
}

function showFeedback(pRegime, pLevel, pJust, q) {
    const feedback = document.getElementById('rols-feedback');
    feedback.classList.remove('hidden');

    let html = `<strong>${i18n.t('total_score')}: ${pRegime + pLevel + pJust}/4</strong><br>`;
    html += `Règim: ${pRegime ? '✅' : '❌ (' + q['Règim correcte'] + ')'}<br>`;
    html += `Nivell: ${pLevel ? '✅' : '❌ (' + q['Nivell correcte'] + ')'}<br>`;
    html += `Encerts paraules clau: ${pJust}/2<br>`;

    feedback.innerHTML = html;
    feedback.className = (pRegime + pLevel + pJust >= 3) ? 'mt-4 p-3 rounded correct' : 'mt-4 p-3 rounded incorrect';

    document.getElementById('rols-submit-btn').classList.add('hidden');
    document.getElementById('rols-next-btn').classList.remove('hidden');
}

function nextRolsQuestion() {
    naturaRolsState.currentIndex++;
    if (naturaRolsState.currentIndex < 10 && naturaRolsState.currentIndex < naturaRolsState.questions.length) {
        renderQuestion();
    } else {
        showFinalResults();
    }
}

function showFinalResults() {
    document.getElementById('rols-quiz-area').classList.add('hidden');
    document.getElementById('rols-results-area').classList.remove('hidden');

    const finalScore = naturaRolsState.score;
    const percentage = Math.round((finalScore / 40) * 100);

    document.getElementById('rols-final-score').innerText = finalScore;
    document.getElementById('rols-final-percentage').innerText = `${percentage}%`;

    const msgEl = document.getElementById('rols-final-msg');
    if (percentage >= 85) {
        msgEl.innerText = i18n.t('final_message_expert');
        msgEl.style.backgroundColor = '#dcfce7';
    } else if (percentage >= 50) {
        msgEl.innerText = i18n.t('final_message_analyst');
        msgEl.style.backgroundColor = '#fef3c7';
    } else {
        msgEl.innerText = i18n.t('final_message_apprentice');
        msgEl.style.backgroundColor = '#fee2e2';
    }

    // Guardar resultat final del projecte
    if (state.user && state.currentProject) {
        saveNaturaResult(percentage);
    }
}

async function saveIndividualResult(qId, pReg, pLev, pJust, pTotal, justification) {
    const data = {
        action: 'saveNaturaQuizResult',
        email: state.user.email,
        questionId: qId,
        regimAlumne: i18n.t(naturaRolsState.selections.regime),
        nivellAlumne: i18n.t(naturaRolsState.selections.level),
        justificacio: justification,
        puntuacioRegim: pReg,
        puntuacioNivell: pLev,
        puntuacioJustificacio: pJust,
        puntuacioTotal: pTotal
    };

    await callApi('saveNaturaQuizResult', data);
}

// Suport per a traduccions dinàmiques (si calgués)
function updateRolsLanguage() {
    // Es podria implementar si cal refrescar pantalles estàtiques
}

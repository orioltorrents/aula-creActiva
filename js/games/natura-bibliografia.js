/**
 * Activitat: BIBLIOGRAFIA I CITES
 * Projecte: Entorns de Natura
 */

let biblioState = {
    activeQuestions: [],
    currentQ: 0,
    score: 0,
    examFinished: false,
    locked: false
};

async function initBiblioGame() {
    // Mostrar loader
    document.getElementById('natura-activity-biblio').classList.remove('hidden');
    document.getElementById('biblio-quiz-container').classList.add('hidden');
    document.getElementById('biblio-results').classList.add('hidden');
    document.getElementById('natura-activities-menu').classList.add('hidden');

    const feedback = document.getElementById('biblio-feedback');
    feedback.innerText = i18n.t('loading') || 'Carregant preguntes...';
    feedback.style.color = 'var(--text-main)';

    try {
        const response = await callApi('getBiblioQuestions');
        if (response && response.status === 'success' && response.questions) {
            biblioState.activeQuestions = processBiblioQuestions(response.questions);

            biblioState.currentQ = 0;
            biblioState.score = 0;
            biblioState.examFinished = false;
            biblioState.locked = false;

            document.getElementById('biblio-quiz-container').classList.remove('hidden');
            showBiblioQuestion();
        } else {
            feedback.innerText = 'Error al carregar les preguntes de la brúixola.';
            feedback.style.color = 'var(--error)';
        }
    } catch (e) {
        console.error("Error fetching biblio questions", e);
        feedback.innerText = 'Error de connexió.';
    }
}

/**
 * Processa les preguntes del Sheet:
 * - Barreja l'ordre de les preguntes.
 * - Barreja les alternatives de cada pregunta.
 */
function processBiblioQuestions(rawQuestions) {
    // 1. Barrejar preguntes i agafar màxim 10
    const shuffledQuestions = rawQuestions.sort(() => Math.random() - 0.5).slice(0, 10);

    return shuffledQuestions.map(qData => {
        // Barrejar les alternatives
        const shuffledAlts = [...qData.alternatives].sort(() => Math.random() - 0.5);
        // Trobar el nou índex de la resposta correcta
        const correctIdx = shuffledAlts.indexOf(qData.correct);

        return {
            q: qData.q,
            a: shuffledAlts,
            correct: correctIdx
        };
    });
}

function showBiblioQuestion() {
    const qData = biblioState.activeQuestions[biblioState.currentQ];

    document.getElementById('biblio-progress').innerText = `${i18n.t('question')} ${biblioState.currentQ + 1}/${biblioState.activeQuestions.length}`;
    document.getElementById('biblio-score').innerText = `${i18n.t('score')}: ${biblioState.score}`;

    document.getElementById('biblio-question-text').innerText = qData.q;

    const optsContainer = document.getElementById('biblio-options');
    optsContainer.innerHTML = '';

    qData.a.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-option w-full text-left mb-2';
        btn.innerText = optText;
        btn.onclick = () => handleBiblioAnswer(idx);
        optsContainer.appendChild(btn);
    });

    document.getElementById('biblio-feedback').innerText = '';
}

function handleBiblioAnswer(selectedIndex) {
    if (biblioState.locked) return;
    biblioState.locked = true;

    const qData = biblioState.activeQuestions[biblioState.currentQ];
    const isCorrect = selectedIndex === qData.correct;

    const buttons = document.getElementById('biblio-options').querySelectorAll('button');
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === qData.correct) btn.classList.add('correct');
        else if (idx === selectedIndex) btn.classList.add('incorrect');
    });

    if (isCorrect) {
        biblioState.score += 10;
        document.getElementById('biblio-feedback').innerText = i18n.t('correct');
        document.getElementById('biblio-feedback').style.color = 'var(--success)';
    } else {
        document.getElementById('biblio-feedback').innerText = i18n.t('incorrect');
        document.getElementById('biblio-feedback').style.color = 'var(--error)';
    }

    setTimeout(() => {
        biblioState.currentQ++;
        biblioState.locked = false;
        if (biblioState.currentQ >= biblioState.activeQuestions.length) {
            finishBiblioGame();
        } else {
            showBiblioQuestion();
        }
    }, 1500);
}

async function finishBiblioGame() {
    biblioState.examFinished = true;
    document.getElementById('biblio-quiz-container').classList.add('hidden');
    document.getElementById('biblio-results').classList.remove('hidden');

    const totalPossible = biblioState.activeQuestions.length * 10;
    const percentage = Math.round((biblioState.score / totalPossible) * 100);
    document.getElementById('biblio-final-score').innerText = `${biblioState.score} / ${totalPossible} (${percentage}%)`;

    let msg = "";
    if (percentage >= 90) msg = "Excel·lent! Domines la bibliografia APA! 🎓";
    else if (percentage >= 70) msg = "Molt bé! Saps com citar les teves fonts. 📚";
    else if (percentage >= 50) msg = "Ho has superat, però cal fixar-se més en els detalls del format. ✍️";
    else msg = "Cal repassar com es fan les cites i la bibliografia. Ànims! 💪";

    document.getElementById('biblio-message').innerText = msg;

    // Guardar resultat
    if (typeof saveNaturaResult === 'function') {
        saveNaturaResult(percentage, i18n.t('act_biblio_title'));
    }
}

function showNaturaMenuFromBiblio() {
    document.getElementById('natura-activity-biblio').classList.add('hidden');
    document.getElementById('natura-activities-menu').classList.remove('hidden');
}

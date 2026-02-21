/**
 * Activitat: BIBLIOGRAFIA I CITES
 * Projecte: Entorns de Natura
 */

let biblioState = {
    allQuestions: [],
    activeQuestions: [],
    currentQ: 0,
    score: 0,
    examFinished: false,
    locked: false,
    selectedType: 'all',
    selectedLevel: 'mixed'
};

async function initBiblioGame() {
    // UI Reset
    document.getElementById('natura-activity-biblio').classList.remove('hidden');
    document.getElementById('biblio-level-selection').classList.add('hidden');
    document.getElementById('biblio-topic-selection').innerHTML = ''; // Netejar dinàmics
    document.getElementById('biblio-quiz-container').classList.add('hidden');
    document.getElementById('biblio-results').classList.add('hidden');
    document.getElementById('natura-activities-menu').classList.add('hidden');

    const feedback = document.getElementById('biblio-feedback');
    feedback.innerText = i18n.t('loading') || 'Carregant dades...';
    feedback.style.color = 'var(--text-main)';

    try {
        const response = await callApi('getBiblioQuestions');
        if (response && response.status === 'success' && response.questions) {
            biblioState.allQuestions = response.questions;

            // Mostrar selector
            document.getElementById('biblio-level-selection').classList.remove('hidden');
            feedback.innerText = '';

            // Generar botons de TIPUS dinàmicament
            generateTopicButtons(response.questions);

        } else {
            const errorMsg = response && response.message ? response.message : 'Error al carregar dades.';
            feedback.innerText = `Error: ${errorMsg}`;
            feedback.style.color = 'var(--error)';
        }
    } catch (e) {
        console.error("Error fetching biblio questions", e);
        feedback.innerText = 'Error de connexió.';
    }
}

function generateTopicButtons(questions) {
    const container = document.getElementById('biblio-topic-selection');
    container.innerHTML = '';

    // Obtenir tipus únics
    const types = [...new Set(questions.map(q => q.type))].filter(t => t && t !== "");

    if (types.length === 0) return;

    const label = document.createElement('p');
    label.className = 'font-bold mb-3';
    label.innerText = 'Tria un tema (nivell barrejat):';
    container.appendChild(label);

    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'flex flex-wrap justify-center gap-3 mb-6';

    types.forEach(type => {
        const btn = document.createElement('button');
        btn.className = 'btn-primary';
        btn.style = "background-color: var(--primary-color); width: auto; font-size: 0.9rem;";
        btn.innerText = type;
        btn.onclick = () => startGameWithFilter(type, 'mixed');
        btnWrapper.appendChild(btn);
    });

    container.appendChild(btnWrapper);
}

function startGameWithFilter(type = 'all', level = 'mixed') {
    biblioState.selectedType = type;
    biblioState.selectedLevel = level;

    // Filtrar preguntes
    let pool = [...biblioState.allQuestions];

    const targetLevel = normalizeLevel(level);

    if (type !== 'all') {
        pool = pool.filter(q => q.type === type);
    }

    if (targetLevel !== 'mixed') {
        pool = pool.filter(q => normalizeLevel(q.level) === targetLevel);
    }

    if (pool.length === 0) {
        const feedback = document.getElementById('biblio-feedback');
        feedback.innerText = `No s'han trobat preguntes per a aquesta combinació.`;
        feedback.style.color = 'var(--error)';
        return;
    }

    // Processar i barrejar
    biblioState.activeQuestions = pool.sort(() => Math.random() - 0.5).slice(0, 10).map(qData => {
        const shuffledAlts = [...qData.alternatives].sort(() => Math.random() - 0.5);
        const correctIdx = shuffledAlts.indexOf(qData.correct);
        return {
            q: qData.q,
            a: shuffledAlts,
            correct: correctIdx
        };
    });

    // Start Game UI
    document.getElementById('biblio-level-selection').classList.add('hidden');
    document.getElementById('biblio-quiz-container').classList.remove('hidden');

    biblioState.currentQ = 0;
    biblioState.score = 0;
    biblioState.examFinished = false;
    biblioState.locked = false;

    showBiblioQuestion();
}

/**
 * Normalitza el text per comparar nivells (treu accents i espais)
 */
function normalizeLevel(text) {
    if (!text) return "";
    return String(text)
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Treu accents
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
        let label = i18n.t('act_biblio_title');
        if (biblioState.selectedType !== 'all') label += ` (${biblioState.selectedType})`;
        saveNaturaResult(percentage, label);
    }
}

function showNaturaMenuFromBiblio() {
    document.getElementById('natura-activity-biblio').classList.add('hidden');
    document.getElementById('natura-activities-menu').classList.remove('hidden');
    document.getElementById('biblio-level-selection').classList.remove('hidden');
}

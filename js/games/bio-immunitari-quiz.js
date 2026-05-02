/**
 * Activitat: Quiz Sistema Immunitari
 * Projecte: Biologia
 */

const bioImmunitariQuiz = {
    allQuestions: [],
    sessionQuestions: [],
    currentStep: 0,
    score: 100,
    isFinished: false,
    selectedFilter: null
};

function initImmunitariQuiz() {
    bioImmunitariQuiz.allQuestions = [];
    bioImmunitariQuiz.sessionQuestions = [];
    bioImmunitariQuiz.currentStep = 0;
    bioImmunitariQuiz.score = 100;
    bioImmunitariQuiz.isFinished = false;
    bioImmunitariQuiz.selectedFilter = null;

    document.getElementById('bio-activity-immunitari-quiz').classList.remove('hidden');
    document.getElementById('bio-immunitari-quiz-loader').classList.remove('hidden');
    document.getElementById('bio-immunitari-quiz-level-selector').classList.add('hidden');
    document.getElementById('bio-immunitari-quiz-ui').classList.add('hidden');
    document.getElementById('bio-immunitari-quiz-final').classList.add('hidden');

    document.getElementById('bio-immunitari-activities').classList.add('hidden');

    if (typeof callApi === 'function') {
        callApi('getImmunitariQuestions', {})
            .then(data => {
                const questions = (data && data.status === 'success')
                    ? (data.questions || data.data || [])
                    : [];

                if (questions.length > 0) {
                    bioImmunitariQuiz.allQuestions = questions;
                    startImmunitariQuizLevelSelector();
                } else {
                    document.getElementById('bio-immunitari-quiz-loader').innerText =
                        "No s'han pogut carregar les preguntes. Comprova que existeixi la pestanya \"sistema-immunitari\" al Google Sheet amb les columnes correctes.";
                }
            })
            .catch(err => {
                console.error("Error carregant preguntes del Sistema Immunitari:", err);
                document.getElementById('bio-immunitari-quiz-loader').innerText = "Error de connexió.";
            });
    }
}

function startImmunitariQuizLevelSelector() {
    document.getElementById('bio-immunitari-quiz-loader').classList.add('hidden');
    document.getElementById('bio-immunitari-quiz-level-selector').classList.remove('hidden');

    const container = document.getElementById('bio-immunitari-quiz-level-buttons');
    if (!container) return;
    container.innerHTML = '';

    // --- SECCIÓ PER TEMA (type) ---
    const topics = [...new Set(
        bioImmunitariQuiz.allQuestions
            .map(q => q.type || q.Tipus || q['Tipus de pregunta'] || '')
            .filter(v => v && v.toString().trim() !== '')
    )];

    if (topics.length > 0) {
        const topicLabel = document.createElement('p');
        topicLabel.className = 'w-full text-center font-bold mb-2 text-gray-600';
        topicLabel.innerText = 'Per Tema:';
        container.appendChild(topicLabel);
        topics.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'btn btn--primary';
            btn.classList.add('quiz-filter-button', 'quiz-filter-button--wide', 'quiz-filter-button--success');
            btn.innerText = cat;
            btn.onclick = () => startImmunitariQuiz(cat, 'type');
            container.appendChild(btn);
        });
    }

    // --- SECCIÓ PER NIVELL (level) ---
    const levelOrder = ['Fàcil', 'Mitjà', 'Difícil'];
    const rawLevels = [...new Set(
        bioImmunitariQuiz.allQuestions
            .map(q => q.level || q.Nivell || '')
            .filter(v => v && v.toString().trim() !== '')
    )];
    const levels = rawLevels.sort((a, b) => {
        const ai = levelOrder.indexOf(a);
        const bi = levelOrder.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

    if (levels.length > 0) {
        const levelLabel = document.createElement('p');
        levelLabel.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
        levelLabel.innerText = 'Per Nivell:';
        container.appendChild(levelLabel);
        const levelColors = { 'Fàcil': '#22c55e', 'Mitjà': '#f59e0b', 'Difícil': '#ef4444' };
        levels.forEach(lvl => {
            const btn = document.createElement('button');
            btn.className = 'btn btn--primary';
            const color = levelColors[lvl] || '#6366f1';
            btn.classList.add('quiz-filter-button');
            btn.style.backgroundColor = color;
            btn.innerText = lvl;
            btn.onclick = () => startImmunitariQuiz(lvl, 'level');
            container.appendChild(btn);
        });
    }

    // --- BOTÓ BARREJAT ---
    const mixLabel = document.createElement('p');
    mixLabel.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    mixLabel.innerText = 'O bé:';
    container.appendChild(mixLabel);
    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn btn--primary';
    mixBtn.classList.add('quiz-filter-button', 'quiz-filter-button--wide', 'quiz-filter-button--mixed');
    mixBtn.innerText = 'Barrejat (Tot)';
    mixBtn.onclick = () => startImmunitariQuiz('Barrejat', null);
    container.appendChild(mixBtn);
}

function startImmunitariQuiz(value, filterBy) {
    bioImmunitariQuiz.selectedFilter = { value, filterBy };
    document.getElementById('bio-immunitari-quiz-level-selector').classList.add('hidden');

    let pool = bioImmunitariQuiz.allQuestions;
    if (filterBy === 'type') {
        pool = pool.filter(q => {
            const t = q.type || q.Tipus || q['Tipus de pregunta'] || '';
            return t.toString().toLowerCase() === value.toString().toLowerCase();
        });
    } else if (filterBy === 'level') {
        pool = pool.filter(q => {
            const l = q.level || q.Nivell || '';
            return l.toString().toLowerCase() === value.toString().toLowerCase();
        });
    }

    if (pool.length === 0) {
        alert("No hi ha preguntes per aquesta selecció.");
        startImmunitariQuizLevelSelector();
        document.getElementById('bio-immunitari-quiz-level-selector').classList.remove('hidden');
        return;
    }

    bioImmunitariQuiz.sessionQuestions = [...pool].sort(() => Math.random() - 0.5).slice(0, 10).map(qData => {
        const correctText = qData.correct || qData.Correcta;
        const alts = qData.alternatives
            ? [...qData.alternatives]
            : [correctText, qData.Incorrecta1, qData.Incorrecta2, qData.Incorrecta3].filter(a => a);
        return {
            q: qData.q || qData.Pregunta || '',
            a: alts.sort(() => Math.random() - 0.5),
            correctText
        };
    });

    bioImmunitariQuiz.currentStep = 0;
    bioImmunitariQuiz.score = 100;
    bioImmunitariQuiz.isFinished = false;

    document.getElementById('bio-immunitari-quiz-ui').classList.remove('hidden');
    renderImmunitariQuizQuestion();
}

function renderImmunitariQuizQuestion() {
    const questionData = bioImmunitariQuiz.sessionQuestions[bioImmunitariQuiz.currentStep];

    document.getElementById('immun-quiz-progress').innerText =
        `Pregunta ${bioImmunitariQuiz.currentStep + 1} de ${bioImmunitariQuiz.sessionQuestions.length}`;
    document.getElementById('immun-quiz-score').innerText = `Punts: ${bioImmunitariQuiz.score}`;
    document.getElementById('immun-quiz-question-text').innerText = questionData.q;

    const container = document.getElementById('immun-quiz-options');
    container.innerHTML = '';

    questionData.a.forEach(ansText => {
        const btn = document.createElement('button');
        btn.className = 'answer-option w-full text-left mb-2';
        btn.innerText = ansText;
        btn.dataset.correct = (ansText === questionData.correctText).toString();
        btn.onclick = () => handleImmunitariQuizAnswer(ansText === questionData.correctText, btn);
        container.appendChild(btn);
    });

    document.getElementById('immun-quiz-feedback').innerText = '';
}

function handleImmunitariQuizAnswer(isCorrect, btnElement) {
    if (bioImmunitariQuiz.isFinished) return;

    const container = document.getElementById('immun-quiz-options');
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => {
        b.disabled = true;
        if (b.dataset.correct === 'true') b.classList.add('correct');
        else if (b === btnElement) b.classList.add('incorrect');
    });

    const feedbackEl = document.getElementById('immun-quiz-feedback');

    if (isCorrect) {
        feedbackEl.innerText = '✅ Correcte!';
        setElementStateColor(feedbackEl, 'success');
        setTimeout(() => {
            bioImmunitariQuiz.currentStep++;
            if (bioImmunitariQuiz.currentStep >= bioImmunitariQuiz.sessionQuestions.length) {
                endImmunitariQuiz();
            } else {
                renderImmunitariQuizQuestion();
            }
        }, 1500);
    } else {
        feedbackEl.innerText = '❌ Incorrecte. Torna-ho a provar.';
        setElementStateColor(feedbackEl, 'error');
        bioImmunitariQuiz.score = Math.max(0, bioImmunitariQuiz.score - 10);
        document.getElementById('immun-quiz-score').innerText = `Punts: ${bioImmunitariQuiz.score}`;
        setTimeout(() => {
            feedbackEl.innerText = '';
            buttons.forEach(b => {
                b.disabled = false;
                b.classList.remove('correct', 'incorrect');
            });
        }, 1500);
    }
}

async function endImmunitariQuiz() {
    bioImmunitariQuiz.isFinished = true;
    document.getElementById('bio-immunitari-quiz-ui').classList.add('hidden');
    document.getElementById('bio-immunitari-quiz-final').classList.remove('hidden');

    document.getElementById('immun-quiz-final-score').innerText = `${bioImmunitariQuiz.score}%`;

    let msg = '';
    if (bioImmunitariQuiz.score >= 90) msg = "Excel·lent! Ets tot un expert del sistema immunitari! 🛡️";
    else if (bioImmunitariQuiz.score >= 70) msg = "Molt bé! Coneixes bé les defenses de l'organisme. 💪";
    else if (bioImmunitariQuiz.score >= 50) msg = "Ho has superat, però caldria repassar alguns conceptes. 📚";
    else msg = "Caldria revisar bé el tema. Ànims, tu pots! 🔄";
    document.getElementById('immun-quiz-message').innerText = msg;

    if (typeof state !== 'undefined' && state.user && typeof callApi === 'function') {
        const filterLabel = bioImmunitariQuiz.selectedFilter
            ? ` (${bioImmunitariQuiz.selectedFilter.value})` : '';
        await callApi('saveResult', {
            email: state.user.email,
            curs: state.user.curs,
            projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
            app: `Quiz Sistema Immunitari${filterLabel}`,
            nivell: bioImmunitariQuiz.selectedFilter?.value || 'Barrejat',
            puntuacio: bioImmunitariQuiz.score,
            temps_segons: 0,
            feedback_pos: `Punts: ${bioImmunitariQuiz.score}`,
            feedback_neg: ''
        });
    }
}



/**
 * Activitat: Quiz Aparell Reproductor
 * Projecte: Biologia
 */

const bioReproductorQuiz = {
    allQuestions: [],
    sessionQuestions: [],
    currentStep: 0,
    score: 100,
    isFinished: false,
    selectedFilter: null
};

function initReproductorQuiz() {
    bioReproductorQuiz.allQuestions = [];
    bioReproductorQuiz.sessionQuestions = [];
    bioReproductorQuiz.currentStep = 0;
    bioReproductorQuiz.score = 100;
    bioReproductorQuiz.isFinished = false;
    bioReproductorQuiz.selectedFilter = null;

    document.getElementById('bio-activity-reproductor-quiz').classList.remove('hidden');
    document.getElementById('bio-reproductor-quiz-loader').classList.remove('hidden');
    document.getElementById('bio-reproductor-quiz-level-selector').classList.add('hidden');
    document.getElementById('bio-reproductor-quiz-ui').classList.add('hidden');
    document.getElementById('bio-reproductor-quiz-final').classList.add('hidden');

    // Hide activity list
    document.getElementById('bio-reproductor-activities').classList.add('hidden');

    if (typeof callApi === 'function') {
        callApi('getReproductorQuestions', {})
            .then(data => {
                if (data && data.status === 'success' && data.questions && data.questions.length > 0) {
                    bioReproductorQuiz.allQuestions = data.questions;
                    startReproductorQuizLevelSelector();
                } else if (data && data.status === 'success' && data.data && data.data.length > 0) {
                    bioReproductorQuiz.allQuestions = data.data;
                    startReproductorQuizLevelSelector();
                } else {
                    document.getElementById('bio-reproductor-quiz-loader').innerText =
                        "No s'han pogut carregar les preguntes. Comprova que existeixi la pestanya \"aparell-reproductor\" al Google Sheet amb les columnes correctes.";
                }
            })
            .catch(err => {
                console.error("Error carregant preguntes del Reproductor:", err);
                document.getElementById('bio-reproductor-quiz-loader').innerText = "Error de connexió.";
            });
    }
}

function startReproductorQuizLevelSelector() {
    document.getElementById('bio-reproductor-quiz-loader').classList.add('hidden');
    document.getElementById('bio-reproductor-quiz-level-selector').classList.remove('hidden');

    const container = document.getElementById('bio-reproductor-quiz-level-buttons');
    if (!container) return;
    container.innerHTML = '';

    // --- SECCIÓ PER TEMA (type) ---
    const topics = [...new Set(
        bioReproductorQuiz.allQuestions
            .map(q => q.type || q.Tipus || q.tipus)
            .filter(v => v && v.toString().trim() !== '')
    )];

    if (topics.length > 0) {
        const topicLabel = document.createElement('p');
        topicLabel.className = 'w-full text-center font-bold mb-2 text-gray-600';
        topicLabel.innerText = 'Per Tema:';
        container.appendChild(topicLabel);
        topics.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'btn-primary';
            btn.style.cssText = 'background-color:#ec4899;width:auto;min-width:140px;';
            btn.innerText = cat;
            btn.onclick = () => startReproductorQuiz(cat, 'type');
            container.appendChild(btn);
        });
    }

    // --- SECCIÓ PER NIVELL (level) ---
    const levelOrder = ['Fàcil', 'Mitjà', 'Difícil'];
    const rawLevels = [...new Set(
        bioReproductorQuiz.allQuestions
            .map(q => q.level || q.Nivell || q.nivell)
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
            btn.className = 'btn-primary';
            const color = levelColors[lvl] || '#6366f1';
            btn.style.cssText = `background-color:${color};width:auto;min-width:120px;`;
            btn.innerText = lvl;
            btn.onclick = () => startReproductorQuiz(lvl, 'level');
            container.appendChild(btn);
        });
    }

    // --- BOTÓ BARREJAT ---
    const mixLabel = document.createElement('p');
    mixLabel.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    mixLabel.innerText = 'O bé:';
    container.appendChild(mixLabel);
    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn-primary';
    mixBtn.style.cssText = 'background-color:#7c3aed;width:auto;min-width:140px;';
    mixBtn.innerText = 'Barrejat (Tot)';
    mixBtn.onclick = () => startReproductorQuiz('Barrejat', null);
    container.appendChild(mixBtn);
}

function startReproductorQuiz(value, filterBy) {
    bioReproductorQuiz.selectedFilter = { value, filterBy };
    document.getElementById('bio-reproductor-quiz-level-selector').classList.add('hidden');

    let pool = bioReproductorQuiz.allQuestions;
    if (filterBy === 'type') {
        pool = pool.filter(q => {
            const t = q.type || q.Tipus || q.tipus || '';
            return t.toString().toLowerCase() === value.toString().toLowerCase();
        });
    } else if (filterBy === 'level') {
        pool = pool.filter(q => {
            const l = q.level || q.Nivell || q.nivell || '';
            return l.toString().toLowerCase() === value.toString().toLowerCase();
        });
    }

    if (pool.length === 0) {
        alert("No hi ha preguntes per aquesta selecció.");
        startReproductorQuizLevelSelector();
        document.getElementById('bio-reproductor-quiz-level-selector').classList.remove('hidden');
        return;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    bioReproductorQuiz.sessionQuestions = shuffled.slice(0, 10).map(qData => {
        const correctText = qData.correct || qData.Correcta;
        const alts = qData.alternatives
            ? [...qData.alternatives]
            : [correctText, qData.Incorrecta1, qData.Incorrecta2, qData.Incorrecta3].filter(a => a);
        const shuffledAlts = alts.sort(() => Math.random() - 0.5);
        return {
            q: qData.q || qData.Pregunta || '',
            a: shuffledAlts,
            correctText
        };
    });

    bioReproductorQuiz.currentStep = 0;
    bioReproductorQuiz.score = 100;
    bioReproductorQuiz.isFinished = false;

    document.getElementById('bio-reproductor-quiz-ui').classList.remove('hidden');
    renderReproductorQuizQuestion();
}

function renderReproductorQuizQuestion() {
    const questionData = bioReproductorQuiz.sessionQuestions[bioReproductorQuiz.currentStep];

    document.getElementById('reprod-quiz-progress').innerText =
        `Pregunta ${bioReproductorQuiz.currentStep + 1} de ${bioReproductorQuiz.sessionQuestions.length}`;
    document.getElementById('reprod-quiz-score').innerText = `Punts: ${bioReproductorQuiz.score}`;
    document.getElementById('reprod-quiz-question-text').innerText = questionData.q;

    const container = document.getElementById('reprod-quiz-options');
    container.innerHTML = '';

    questionData.a.forEach(ansText => {
        const btn = document.createElement('button');
        btn.className = 'btn-option w-full text-left mb-2';
        btn.innerText = ansText;
        btn.dataset.correct = (ansText === questionData.correctText).toString();
        btn.onclick = () => handleReproductorQuizAnswer(ansText === questionData.correctText, btn);
        container.appendChild(btn);
    });

    document.getElementById('reprod-quiz-feedback').innerText = '';
}

function handleReproductorQuizAnswer(isCorrect, btnElement) {
    if (bioReproductorQuiz.isFinished) return;

    const container = document.getElementById('reprod-quiz-options');
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => {
        b.disabled = true;
        if (b.dataset.correct === 'true') {
            b.classList.add('correct');
        } else if (b === btnElement) {
            b.classList.add('incorrect');
        }
    });

    const feedbackEl = document.getElementById('reprod-quiz-feedback');

    if (isCorrect) {
        feedbackEl.innerText = '✅ Correcte!';
        feedbackEl.style.color = 'var(--success)';

        setTimeout(() => {
            bioReproductorQuiz.currentStep++;
            if (bioReproductorQuiz.currentStep >= bioReproductorQuiz.sessionQuestions.length) {
                endReproductorQuiz();
            } else {
                renderReproductorQuizQuestion();
            }
        }, 1500);
    } else {
        feedbackEl.innerText = '❌ Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'var(--error)';
        bioReproductorQuiz.score = Math.max(0, bioReproductorQuiz.score - 10);
        document.getElementById('reprod-quiz-score').innerText = `Punts: ${bioReproductorQuiz.score}`;

        setTimeout(() => {
            feedbackEl.innerText = '';
            buttons.forEach(b => {
                b.disabled = false;
                b.classList.remove('correct', 'incorrect');
            });
        }, 1500);
    }
}

async function endReproductorQuiz() {
    bioReproductorQuiz.isFinished = true;
    document.getElementById('bio-reproductor-quiz-ui').classList.add('hidden');
    document.getElementById('bio-reproductor-quiz-final').classList.remove('hidden');

    document.getElementById('reprod-quiz-final-score').innerText = `${bioReproductorQuiz.score}%`;

    let msg = '';
    if (bioReproductorQuiz.score >= 90) msg = "Excel·lent! Domines l'aparell reproductor! 🌟";
    else if (bioReproductorQuiz.score >= 70) msg = "Molt bé! Coneixes bé el tema. Segueix practicant! 💪";
    else if (bioReproductorQuiz.score >= 50) msg = "Ho has superat, però caldria repassar alguns conceptes. 📚";
    else msg = "Caldria revisar bé el tema. Ànims, tu pots! 🔄";
    document.getElementById('reprod-quiz-message').innerText = msg;

    if (typeof state !== 'undefined' && state.user && typeof callApi === 'function') {
        const filterLabel = bioReproductorQuiz.selectedFilter
            ? ` (${bioReproductorQuiz.selectedFilter.value})`
            : '';
        await callApi('saveResult', {
            email: state.user.email,
            curs: state.user.curs,
            projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
            app: `Quiz Aparell Reproductor${filterLabel}`,
            nivell: bioReproductorQuiz.selectedFilter?.value || 'Barrejat',
            puntuacio: bioReproductorQuiz.score,
            temps_segons: 0,
            feedback_pos: `Punts: ${bioReproductorQuiz.score}`,
            feedback_neg: ''
        });
    }
}



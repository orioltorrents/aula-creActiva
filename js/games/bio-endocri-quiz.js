/**
 * Quiz del Sistema Endocrí
 */

const bioEndocriQuiz = {
    allQuestions: [],
    sessionQuestions: [],
    currentStep: 0,
    score: 100,
    isFinished: false
};

function initEndocriQuiz() {
    bioEndocriQuiz.allQuestions = [];
    bioEndocriQuiz.sessionQuestions = [];
    bioEndocriQuiz.currentStep = 0;
    bioEndocriQuiz.score = 100;
    bioEndocriQuiz.isFinished = false;

    document.getElementById('bio-activity-endocri-quiz').classList.remove('hidden');
    document.getElementById('bio-endocri-quiz-loader').classList.remove('hidden');
    document.getElementById('bio-endocri-quiz-ui').classList.add('hidden');
    document.getElementById('bio-endocri-quiz-final').classList.add('hidden');
    document.getElementById('bio-endocri-quiz-level-selector').classList.add('hidden');

    if (typeof callApi === 'function') {
        callApi('getEndocriQuestions', {})
            .then(data => {
                if (data.status === 'success' && data.questions && data.questions.length > 0) {
                    bioEndocriQuiz.allQuestions = data.questions;
                    startEndocriQuizLevelSelector();
                } else {
                    alert("No s'han pogut carregar les preguntes de l'Endocrí. Comprova la pestanya del Sheet.");
                }
            })
            .catch(err => {
                console.error("Error carregant les preguntes:", err);
                alert("Error de connexió.");
            });
    } else {
        alert("callApi no definida.");
    }
}

function startEndocriQuizLevelSelector() {
    document.getElementById('bio-endocri-quiz-loader').classList.add('hidden');
    document.getElementById('bio-endocri-quiz-level-selector').classList.remove('hidden');

    const container = document.getElementById('bio-endocri-quiz-level-buttons');
    if (!container) return;
    container.innerHTML = '';

    // --- SECCIÓ PER TEMA (type) ---
    const topicLabel = document.createElement('p');
    topicLabel.className = 'w-full text-center font-bold mb-2 text-gray-600';
    topicLabel.innerText = 'Per Tema:';
    container.appendChild(topicLabel);

    const topics = [...new Set(bioEndocriQuiz.allQuestions
        .map(q => q.type)
        .filter(v => v && v.toString().trim() !== '')
    )];

    topics.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'btn btn--primary';
        btn.style.backgroundColor = '#3b82f6';
        btn.style.width = 'auto';
        btn.style.minWidth = '120px';
        btn.innerText = cat;
        btn.onclick = () => startEndocriQuiz(cat, 'type');
        container.appendChild(btn);
    });

    // --- SECCIÓ PER NIVELL (level) ---
    const levelLabel = document.createElement('p');
    levelLabel.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    levelLabel.innerText = 'Per Nivell:';
    container.appendChild(levelLabel);

    const levels = [...new Set(bioEndocriQuiz.allQuestions
        .map(q => q.level)
        .filter(v => v && v.toString().trim() !== '')
    )];

    levels.forEach(lvl => {
        const btn = document.createElement('button');
        btn.className = 'btn btn--primary';
        btn.style.backgroundColor = '#10b981';
        btn.style.width = 'auto';
        btn.style.minWidth = '120px';
        btn.innerText = lvl;
        btn.onclick = () => startEndocriQuiz(lvl, 'level');
        container.appendChild(btn);
    });

    // --- BOTÓ BARREJAT (tots) ---
    const mixLabel = document.createElement('p');
    mixLabel.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    mixLabel.innerText = 'O bé:';
    container.appendChild(mixLabel);

    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn btn--primary';
    mixBtn.style.backgroundColor = '#7c3aed';
    mixBtn.style.width = 'auto';
    mixBtn.style.minWidth = '120px';
    mixBtn.innerText = 'Barrejat (Tots)';
    mixBtn.onclick = () => startEndocriQuiz('Barrejat', null);
    container.appendChild(mixBtn);
}

function startEndocriQuiz(value, filterBy) {
    document.getElementById('bio-endocri-quiz-level-selector').classList.add('hidden');

    let pool = bioEndocriQuiz.allQuestions;
    if (filterBy === 'type') {
        pool = bioEndocriQuiz.allQuestions.filter(q =>
            q.type && q.type.toString().toLowerCase() === value.toString().toLowerCase()
        );
    } else if (filterBy === 'level') {
        pool = bioEndocriQuiz.allQuestions.filter(q =>
            q.level && q.level.toString().toLowerCase() === value.toString().toLowerCase()
        );
    }

    if (pool.length === 0) {
        alert("No hi ha preguntes per aquest nivell.");
        initEndocriQuiz();
        return;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    bioEndocriQuiz.sessionQuestions = shuffled.slice(0, 10).map(qData => {
        const shuffledAlts = [...qData.alternatives].sort(() => 0.5 - Math.random());
        const correctIdx = shuffledAlts.indexOf(qData.correct);
        return {
            q: qData.q,
            a: shuffledAlts,
            correct: correctIdx
        };
    });

    bioEndocriQuiz.currentStep = 0;
    bioEndocriQuiz.score = 100;
    bioEndocriQuiz.isFinished = false;

    document.getElementById('bio-endocri-quiz-ui').classList.remove('hidden');
    renderEndocriQuizQuestion();
}

function renderEndocriQuizQuestion() {
    const questionData = bioEndocriQuiz.sessionQuestions[bioEndocriQuiz.currentStep];

    document.getElementById('endo-quiz-progress').innerText = `Pregunta ${bioEndocriQuiz.currentStep + 1} de ${bioEndocriQuiz.sessionQuestions.length}`;
    document.getElementById('endo-quiz-score-display').innerText = `Punts: ${bioEndocriQuiz.score}`;

    document.getElementById('endo-quiz-text').innerText = questionData.q || '';

    const container = document.getElementById('endo-quiz-options');
    container.innerHTML = '';

    questionData.a.forEach((ansText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-option w-full text-left mb-2';
        btn.innerText = ansText;
        btn.dataset.isCorrect = (idx === questionData.correct);
        btn.onclick = () => handleEndocriQuizAnswer(btn.dataset.isCorrect === 'true', btn);
        container.appendChild(btn);
    });

    document.getElementById('endo-quiz-feedback').innerText = '';
}

function handleEndocriQuizAnswer(isCorrect, btnElement) {
    if (bioEndocriQuiz.isFinished) return;

    const container = document.getElementById('endo-quiz-options');
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => {
        b.disabled = true;
        if (b.dataset.isCorrect === 'true') {
            b.classList.add('correct');
        } else if (b === btnElement) {
            b.classList.add('incorrect');
        }
    });

    const feedbackEl = document.getElementById('endo-quiz-feedback');

    if (isCorrect) {
        feedbackEl.innerText = 'Correcte!';
        feedbackEl.style.color = 'var(--success)';

        setTimeout(() => {
            bioEndocriQuiz.currentStep++;
            if (bioEndocriQuiz.currentStep >= bioEndocriQuiz.sessionQuestions.length) {
                endEndocriQuiz();
            } else {
                renderEndocriQuizQuestion();
            }
        }, 1500);
    } else {
        feedbackEl.innerText = 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'var(--error)';
        bioEndocriQuiz.score = Math.max(0, bioEndocriQuiz.score - 10);
        document.getElementById('endo-quiz-score-display').innerText = `Punts: ${bioEndocriQuiz.score}`;

        setTimeout(() => {
            feedbackEl.innerText = '';
            buttons.forEach(b => {
                b.disabled = false;
                b.classList.remove('correct', 'incorrect');
            });
        }, 1500);
    }
}

async function endEndocriQuiz() {
    bioEndocriQuiz.isFinished = true;
    document.getElementById('bio-endocri-quiz-ui').classList.add('hidden');
    document.getElementById('bio-endocri-quiz-final').classList.remove('hidden');

    document.getElementById('endo-quiz-final-score').innerText = `${bioEndocriQuiz.score}%`;
    const finalMsg = document.getElementById('endo-quiz-final-msg');
    if (finalMsg) finalMsg.innerText = `Molt bé! Has completat el quiz del sistema endocrí.`;

    if (typeof state !== 'undefined' && state.user && typeof callApi === 'function') {
        const result = {
            email: state.user.email,
            curs: state.user.curs,
            projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
            app: 'Quiz de l\'Endocrí',
            nivell: 'Preguntes',
            puntuacio: bioEndocriQuiz.score,
            temps_segons: 0,
            feedback_pos: 'Bona feina component el quiz de l\'Endocrí.',
            feedback_neg: ''
        };
        await callApi('saveResult', result);
    }
}



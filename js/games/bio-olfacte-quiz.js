/**
 * Quiz de la Olfacte
 */

const bioOlfacteQuiz = {
    allQuestions: [],
    sessionQuestions: [],
    currentStep: 0,
    score: 100,
    isFinished: false
};

function initOlfacteQuiz() {
    bioOlfacteQuiz.allQuestions = [];
    bioOlfacteQuiz.sessionQuestions = [];
    bioOlfacteQuiz.currentStep = 0;
    bioOlfacteQuiz.score = 100;
    bioOlfacteQuiz.isFinished = false;

    document.getElementById('bio-activity-olfacte-quiz').classList.remove('hidden');
    document.getElementById('bio-olfacte-quiz-loader').classList.remove('hidden');
    document.getElementById('bio-olfacte-quiz-ui').classList.add('hidden');
    document.getElementById('bio-olfacte-quiz-final').classList.add('hidden');

    if (typeof callApi === 'function') {
        callApi('getOlfacteQuestions', {})
            .then(data => {
                if (data.status === 'success' && data.data && data.data.length > 0) {
                    bioOlfacteQuiz.allQuestions = data.data;
                    startOlfacteQuizLevelSelector();
                } else {
                    alert("No s'han pogut carregar les preguntes de la Olfacte. Comprova la pestanya del Sheet.");
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

function startOlfacteQuizLevelSelector() {
    document.getElementById('bio-olfacte-quiz-loader').classList.add('hidden');
    document.getElementById('bio-olfacte-quiz-level-selector').classList.remove('hidden');

    const container = document.getElementById('bio-olfacte-quiz-level-buttons');
    if (!container) return;
    container.innerHTML = '';

    const topics = [...new Set(bioOlfacteQuiz.allQuestions.map(q => q.type).filter(v => v && v.toString().trim() !== ''))];
    if (topics.length > 0) {
        const topicLabel = document.createElement('p');
        topicLabel.className = 'w-full text-center font-bold mb-2 text-gray-600';
        topicLabel.innerText = 'Per Tema:';
        container.appendChild(topicLabel);
        topics.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'btn btn--primary';
            btn.classList.add('quiz-filter-button', 'quiz-filter-button--topic');
            btn.innerText = cat;
            btn.onclick = () => startOlfacteQuiz(cat, 'type');
            container.appendChild(btn);
        });
    }

    const levels = [...new Set(bioOlfacteQuiz.allQuestions.map(q => q.level).filter(v => v && v.toString().trim() !== ''))];
    if (levels.length > 0) {
        const levelLabel = document.createElement('p');
        levelLabel.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
        levelLabel.innerText = 'Per Nivell:';
        container.appendChild(levelLabel);
        levels.forEach(lvl => {
            const btn = document.createElement('button');
            btn.className = 'btn btn--primary';
            btn.classList.add('quiz-filter-button', getQuizLevelButtonModifier(lvl));
            btn.innerText = lvl;
            btn.onclick = () => startOlfacteQuiz(lvl, 'level');
            container.appendChild(btn);
        });
    }

    const mixLabel = document.createElement('p');
    mixLabel.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    mixLabel.innerText = 'O bé:';
    container.appendChild(mixLabel);
    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn btn--primary';
    mixBtn.classList.add('quiz-filter-button', 'quiz-filter-button--mixed');
    mixBtn.innerText = 'Barrejat (Tots)';
    mixBtn.onclick = () => startOlfacteQuiz('Barrejat', null);
    container.appendChild(mixBtn);
}

function startOlfacteQuiz(value, filterBy) {
    document.getElementById('bio-olfacte-quiz-level-selector').classList.add('hidden');

    let pool = bioOlfacteQuiz.allQuestions;
    if (filterBy === 'type') {
        pool = bioOlfacteQuiz.allQuestions.filter(q => q.type && q.type.toString().toLowerCase() === value.toString().toLowerCase());
    } else if (filterBy === 'level') {
        pool = bioOlfacteQuiz.allQuestions.filter(q => q.level && q.level.toString().toLowerCase() === value.toString().toLowerCase());
    }

    if (pool.length === 0) {
        alert("No hi ha preguntes per aquesta selecció.");
        initOlfacteQuiz();
        return;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    bioOlfacteQuiz.sessionQuestions = shuffled.slice(0, 10);

    bioOlfacteQuiz.currentStep = 0;
    bioOlfacteQuiz.score = 100;
    bioOlfacteQuiz.isFinished = false;

    document.getElementById('bio-olfacte-quiz-ui').classList.remove('hidden');
    renderOlfacteQuizQuestion();
}

function renderOlfacteQuizQuestion() {
    const questionData = bioOlfacteQuiz.sessionQuestions[bioOlfacteQuiz.currentStep];

    document.getElementById('olfacte-quiz-progress').innerText = `Pregunta ${bioOlfacteQuiz.currentStep + 1} de ${bioOlfacteQuiz.sessionQuestions.length}`;
    document.getElementById('olfacte-quiz-score-display').innerText = `Punts: ${bioOlfacteQuiz.score}`;

    document.getElementById('olfacte-quiz-text').innerText = questionData.q || questionData.Pregunta || '';

    const correctText = questionData.correct || questionData.Correcta;
    const alts = questionData.alternatives
        ? [...questionData.alternatives]
        : [correctText, questionData.Incorrecta1, questionData.Incorrecta2, questionData.Incorrecta3].filter(a => a);

    const answers = alts.map(text => ({ text, correct: text === correctText }));
    answers.sort(() => 0.5 - Math.random());

    const container = document.getElementById('olfacte-quiz-options');
    container.innerHTML = '';

    answers.forEach((ans) => {
        const btn = document.createElement('button');
        btn.className = 'answer-option w-full text-left mb-2';
        btn.innerText = ans.text;
        btn.dataset.correct = ans.correct;
        btn.onclick = () => handleOlfacteQuizAnswer(ans.correct, btn);
        container.appendChild(btn);
    });

    document.getElementById('olfacte-quiz-feedback').innerText = '';
}

function handleOlfacteQuizAnswer(isCorrect, btnElement) {
    if (bioOlfacteQuiz.isFinished) return;

    const container = document.getElementById('olfacte-quiz-options');
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => {
        b.disabled = true;
        if (b.dataset.correct === 'true') {
            b.classList.add('correct');
        } else if (b === btnElement) {
            b.classList.add('incorrect');
        }
    });

    const feedbackEl = document.getElementById('olfacte-quiz-feedback');

    if (isCorrect) {
        feedbackEl.innerText = 'Correcte!';
        setElementStateColor(feedbackEl, 'success');

        setTimeout(() => {
            bioOlfacteQuiz.currentStep++;
            if (bioOlfacteQuiz.currentStep >= bioOlfacteQuiz.sessionQuestions.length) {
                endOlfacteQuiz();
            } else {
                renderOlfacteQuizQuestion();
            }
        }, 1500);
    } else {
        feedbackEl.innerText = 'Incorrecte. Torna-ho a provar.';
        setElementStateColor(feedbackEl, 'error');
        bioOlfacteQuiz.score = Math.max(0, bioOlfacteQuiz.score - 10);
        document.getElementById('olfacte-quiz-score-display').innerText = `Punts: ${bioOlfacteQuiz.score}`;

        setTimeout(() => {
            feedbackEl.innerText = '';
            buttons.forEach(b => {
                b.disabled = false;
                b.classList.remove('correct', 'incorrect');
            });
        }, 1500);
    }
}

async function endOlfacteQuiz() {
    bioOlfacteQuiz.isFinished = true;
    document.getElementById('bio-olfacte-quiz-ui').classList.add('hidden');
    document.getElementById('bio-olfacte-quiz-final').classList.remove('hidden');

    const resultMsg = document.getElementById('endo-quiz-message'); // reuse class styling, ID might need change
    if(resultMsg) resultMsg.innerText = `Molt bé! Has aconseguit ${bioOlfacteQuiz.score} punts.`;
    document.getElementById('olfacte-quiz-final-score').innerText = `${bioOlfacteQuiz.score}%`;

    if (typeof state !== 'undefined' && state.user && typeof callApi === 'function') {
        const result = {
            email: state.user.email,
            curs: state.user.curs,
            projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
            app: 'Quiz de la Olfacte',
            nivell: 'Preguntes',
            puntuacio: bioOlfacteQuiz.score,
            temps_segons: 0,
            feedback_pos: 'Bona feina component el quiz de la Olfacte.',
            feedback_neg: ''
        };
        await callApi('saveResult', result);
    }
}



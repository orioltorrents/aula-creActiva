/**
 * Quiz de la Oida
 */

const bioOidaQuiz = {
    allQuestions: [],
    sessionQuestions: [],
    currentStep: 0,
    score: 100,
    isFinished: false
};

function initOidaQuiz() {
    bioOidaQuiz.allQuestions = [];
    bioOidaQuiz.sessionQuestions = [];
    bioOidaQuiz.currentStep = 0;
    bioOidaQuiz.score = 100;
    bioOidaQuiz.isFinished = false;

    document.getElementById('bio-activity-oida-quiz').classList.remove('hidden');
    document.getElementById('bio-oida-quiz-loader').classList.remove('hidden');
    document.getElementById('bio-oida-quiz-ui').classList.add('hidden');
    document.getElementById('bio-oida-quiz-final').classList.add('hidden');

    if (typeof callApi === 'function') {
        callApi('getOidaQuestions', {})
            .then(data => {
                if (data.status === 'success' && data.data && data.data.length > 0) {
                    bioOidaQuiz.allQuestions = data.data;
                    startOidaQuizLevelSelector();
                } else {
                    alert("No s'han pogut carregar les preguntes de la Oida. Comprova la pestanya del Sheet.");
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

function startOidaQuizLevelSelector() {
    document.getElementById('bio-oida-quiz-loader').classList.add('hidden');
    document.getElementById('bio-oida-quiz-level-selector').classList.remove('hidden');

    const container = document.getElementById('bio-oida-quiz-level-buttons');
    if (!container) return;
    container.innerHTML = '';

    const topics = [...new Set(bioOidaQuiz.allQuestions.map(q => q.type).filter(v => v && v.toString().trim() !== ''))];
    if (topics.length > 0) {
        const topicLabel = document.createElement('p');
        topicLabel.className = 'w-full text-center font-bold mb-2 text-gray-600';
        topicLabel.innerText = 'Per Tema:';
        container.appendChild(topicLabel);
        topics.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'btn-primary';
            btn.style.cssText = 'background-color:#3b82f6;width:auto;min-width:120px;';
            btn.innerText = cat;
            btn.onclick = () => startOidaQuiz(cat, 'type');
            container.appendChild(btn);
        });
    }

    const levels = [...new Set(bioOidaQuiz.allQuestions.map(q => q.level).filter(v => v && v.toString().trim() !== ''))];
    if (levels.length > 0) {
        const levelLabel = document.createElement('p');
        levelLabel.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
        levelLabel.innerText = 'Per Nivell:';
        container.appendChild(levelLabel);
        levels.forEach(lvl => {
            const btn = document.createElement('button');
            btn.className = 'btn-primary';
            btn.style.cssText = 'background-color:#10b981;width:auto;min-width:120px;';
            btn.innerText = lvl;
            btn.onclick = () => startOidaQuiz(lvl, 'level');
            container.appendChild(btn);
        });
    }

    const mixLabel = document.createElement('p');
    mixLabel.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    mixLabel.innerText = 'O bé:';
    container.appendChild(mixLabel);
    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn-primary';
    mixBtn.style.cssText = 'background-color:#7c3aed;width:auto;min-width:120px;';
    mixBtn.innerText = 'Barrejat (Tots)';
    mixBtn.onclick = () => startOidaQuiz('Barrejat', null);
    container.appendChild(mixBtn);
}

function startOidaQuiz(value, filterBy) {
    document.getElementById('bio-oida-quiz-level-selector').classList.add('hidden');

    let pool = bioOidaQuiz.allQuestions;
    if (filterBy === 'type') {
        pool = bioOidaQuiz.allQuestions.filter(q => q.type && q.type.toString().toLowerCase() === value.toString().toLowerCase());
    } else if (filterBy === 'level') {
        pool = bioOidaQuiz.allQuestions.filter(q => q.level && q.level.toString().toLowerCase() === value.toString().toLowerCase());
    }

    if (pool.length === 0) {
        alert("No hi ha preguntes per aquesta selecció.");
        initOidaQuiz();
        return;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    bioOidaQuiz.sessionQuestions = shuffled.slice(0, 10);

    bioOidaQuiz.currentStep = 0;
    bioOidaQuiz.score = 100;
    bioOidaQuiz.isFinished = false;

    document.getElementById('bio-oida-quiz-ui').classList.remove('hidden');
    renderOidaQuizQuestion();
}

function renderOidaQuizQuestion() {
    const questionData = bioOidaQuiz.sessionQuestions[bioOidaQuiz.currentStep];
    
    document.getElementById('oida-quiz-progress').innerText = `Pregunta ${bioOidaQuiz.currentStep + 1} de ${bioOidaQuiz.sessionQuestions.length}`;
    document.getElementById('oida-quiz-score-display').innerText = `Punts: ${bioOidaQuiz.score}`;
    
    document.getElementById('oida-quiz-text').innerText = questionData.q || questionData.Pregunta || '';

    const correctText = questionData.correct || questionData.Correcta;
    const alts = questionData.alternatives
        ? [...questionData.alternatives]
        : [correctText, questionData.Incorrecta1, questionData.Incorrecta2, questionData.Incorrecta3].filter(a => a);

    const answers = alts.map(text => ({ text, correct: text === correctText }));
    answers.sort(() => 0.5 - Math.random());

    const container = document.getElementById('oida-quiz-options');
    container.innerHTML = '';

    answers.forEach((ans) => {
        const btn = document.createElement('button');
        btn.className = 'btn-option w-full text-left mb-2';
        btn.innerText = ans.text;
        btn.dataset.correct = ans.correct;
        btn.onclick = () => handleOidaQuizAnswer(ans.correct, btn);
        container.appendChild(btn);
    });

    document.getElementById('oida-quiz-feedback').innerText = '';
}

function handleOidaQuizAnswer(isCorrect, btnElement) {
    if (bioOidaQuiz.isFinished) return;

    const container = document.getElementById('oida-quiz-options');
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => {
        b.disabled = true;
        if (b.dataset.correct === 'true') {
            b.classList.add('correct');
        } else if (b === btnElement) {
            b.classList.add('incorrect');
        }
    });

    const feedbackEl = document.getElementById('oida-quiz-feedback');

    if (isCorrect) {
        feedbackEl.innerText = 'Correcte!';
        feedbackEl.style.color = 'var(--success)';
        
        setTimeout(() => {
            bioOidaQuiz.currentStep++;
            if (bioOidaQuiz.currentStep >= bioOidaQuiz.sessionQuestions.length) {
                endOidaQuiz();
            } else {
                renderOidaQuizQuestion();
            }
        }, 1500);
    } else {
        feedbackEl.innerText = 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'var(--error)';
        bioOidaQuiz.score = Math.max(0, bioOidaQuiz.score - 10);
        document.getElementById('oida-quiz-score-display').innerText = `Punts: ${bioOidaQuiz.score}`;
        
        setTimeout(() => {
            feedbackEl.innerText = '';
            buttons.forEach(b => {
                b.disabled = false;
                b.classList.remove('correct', 'incorrect');
            });
        }, 1500);
    }
}

async function endOidaQuiz() {
    bioOidaQuiz.isFinished = true;
    document.getElementById('bio-oida-quiz-ui').classList.add('hidden');
    document.getElementById('bio-oida-quiz-final').classList.remove('hidden');

    const resultMsg = document.getElementById('endo-quiz-message'); // reuse class styling, ID might need change
    if(resultMsg) resultMsg.innerText = `Molt bé! Has aconseguit ${bioOidaQuiz.score} punts.`;
    document.getElementById('oida-quiz-final-score').innerText = `${bioOidaQuiz.score}%`;

    if (typeof state !== 'undefined' && state.user && typeof callApi === 'function') {
        const result = {
            email: state.user.email,
            curs: state.user.curs,
            projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
            app: 'Quiz de la Oida',
            nivell: 'Preguntes',
            puntuacio: bioOidaQuiz.score,
            temps_segons: 0,
            feedback_pos: 'Bona feina component el quiz de la Oida.',
            feedback_neg: ''
        };
        await callApi('saveResult', result);
    }
}

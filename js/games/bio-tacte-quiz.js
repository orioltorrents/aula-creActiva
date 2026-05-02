/**
 * Quiz de la Tacte
 */

const bioTacteQuiz = {
    allQuestions: [],
    sessionQuestions: [],
    currentStep: 0,
    score: 100,
    isFinished: false
};

function initTacteQuiz() {
    bioTacteQuiz.allQuestions = [];
    bioTacteQuiz.sessionQuestions = [];
    bioTacteQuiz.currentStep = 0;
    bioTacteQuiz.score = 100;
    bioTacteQuiz.isFinished = false;

    document.getElementById('bio-activity-tacte-quiz').classList.remove('hidden');
    document.getElementById('bio-tacte-quiz-loader').classList.remove('hidden');
    document.getElementById('bio-tacte-quiz-ui').classList.add('hidden');
    document.getElementById('bio-tacte-quiz-final').classList.add('hidden');

    if (typeof callApi === 'function') {
        callApi('getTacteQuestions', {})
            .then(data => {
                if (data.status === 'success' && data.data && data.data.length > 0) {
                    bioTacteQuiz.allQuestions = data.data;
                    startTacteQuizLevelSelector();
                } else {
                    alert("No s'han pogut carregar les preguntes de la Tacte. Comprova la pestanya del Sheet.");
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

function startTacteQuizLevelSelector() {
    document.getElementById('bio-tacte-quiz-loader').classList.add('hidden');
    document.getElementById('bio-tacte-quiz-level-selector').classList.remove('hidden');

    const container = document.getElementById('bio-tacte-quiz-level-buttons');
    if (!container) return;
    container.innerHTML = '';

    const topics = [...new Set(bioTacteQuiz.allQuestions.map(q => q.type).filter(v => v && v.toString().trim() !== ''))];
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
            btn.onclick = () => startTacteQuiz(cat, 'type');
            container.appendChild(btn);
        });
    }

    const levels = [...new Set(bioTacteQuiz.allQuestions.map(q => q.level).filter(v => v && v.toString().trim() !== ''))];
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
            btn.onclick = () => startTacteQuiz(lvl, 'level');
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
    mixBtn.onclick = () => startTacteQuiz('Barrejat', null);
    container.appendChild(mixBtn);
}

function startTacteQuiz(value, filterBy) {
    document.getElementById('bio-tacte-quiz-level-selector').classList.add('hidden');

    let pool = bioTacteQuiz.allQuestions;
    if (filterBy === 'type') {
        pool = bioTacteQuiz.allQuestions.filter(q => q.type && q.type.toString().toLowerCase() === value.toString().toLowerCase());
    } else if (filterBy === 'level') {
        pool = bioTacteQuiz.allQuestions.filter(q => q.level && q.level.toString().toLowerCase() === value.toString().toLowerCase());
    }

    if (pool.length === 0) {
        alert("No hi ha preguntes per aquesta selecció.");
        initTacteQuiz();
        return;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    bioTacteQuiz.sessionQuestions = shuffled.slice(0, 10);

    bioTacteQuiz.currentStep = 0;
    bioTacteQuiz.score = 100;
    bioTacteQuiz.isFinished = false;

    document.getElementById('bio-tacte-quiz-ui').classList.remove('hidden');
    renderTacteQuizQuestion();
}

function renderTacteQuizQuestion() {
    const questionData = bioTacteQuiz.sessionQuestions[bioTacteQuiz.currentStep];
    
    document.getElementById('tacte-quiz-progress').innerText = `Pregunta ${bioTacteQuiz.currentStep + 1} de ${bioTacteQuiz.sessionQuestions.length}`;
    document.getElementById('tacte-quiz-score-display').innerText = `Punts: ${bioTacteQuiz.score}`;
    
    document.getElementById('tacte-quiz-text').innerText = questionData.q || questionData.Pregunta || '';

    const correctText = questionData.correct || questionData.Correcta;
    const alts = questionData.alternatives
        ? [...questionData.alternatives]
        : [correctText, questionData.Incorrecta1, questionData.Incorrecta2, questionData.Incorrecta3].filter(a => a);

    const answers = alts.map(text => ({ text, correct: text === correctText }));
    answers.sort(() => 0.5 - Math.random());

    const container = document.getElementById('tacte-quiz-options');
    container.innerHTML = '';

    answers.forEach((ans) => {
        const btn = document.createElement('button');
        btn.className = 'btn-option w-full text-left mb-2';
        btn.innerText = ans.text;
        btn.dataset.correct = ans.correct;
        btn.onclick = () => handleTacteQuizAnswer(ans.correct, btn);
        container.appendChild(btn);
    });

    document.getElementById('tacte-quiz-feedback').innerText = '';
}

function handleTacteQuizAnswer(isCorrect, btnElement) {
    if (bioTacteQuiz.isFinished) return;

    const container = document.getElementById('tacte-quiz-options');
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => {
        b.disabled = true;
        if (b.dataset.correct === 'true') {
            b.classList.add('correct');
        } else if (b === btnElement) {
            b.classList.add('incorrect');
        }
    });

    const feedbackEl = document.getElementById('tacte-quiz-feedback');

    if (isCorrect) {
        feedbackEl.innerText = 'Correcte!';
        feedbackEl.style.color = 'var(--success)';
        
        setTimeout(() => {
            bioTacteQuiz.currentStep++;
            if (bioTacteQuiz.currentStep >= bioTacteQuiz.sessionQuestions.length) {
                endTacteQuiz();
            } else {
                renderTacteQuizQuestion();
            }
        }, 1500);
    } else {
        feedbackEl.innerText = 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'var(--error)';
        bioTacteQuiz.score = Math.max(0, bioTacteQuiz.score - 10);
        document.getElementById('tacte-quiz-score-display').innerText = `Punts: ${bioTacteQuiz.score}`;
        
        setTimeout(() => {
            feedbackEl.innerText = '';
            buttons.forEach(b => {
                b.disabled = false;
                b.classList.remove('correct', 'incorrect');
            });
        }, 1500);
    }
}

async function endTacteQuiz() {
    bioTacteQuiz.isFinished = true;
    document.getElementById('bio-tacte-quiz-ui').classList.add('hidden');
    document.getElementById('bio-tacte-quiz-final').classList.remove('hidden');

    const resultMsg = document.getElementById('endo-quiz-message'); // reuse class styling, ID might need change
    if(resultMsg) resultMsg.innerText = `Molt bé! Has aconseguit ${bioTacteQuiz.score} punts.`;
    document.getElementById('tacte-quiz-final-score').innerText = `${bioTacteQuiz.score}%`;

    if (typeof state !== 'undefined' && state.user && typeof callApi === 'function') {
        const result = {
            email: state.user.email,
            curs: state.user.curs,
            projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
            app: 'Quiz de la Tacte',
            nivell: 'Preguntes',
            puntuacio: bioTacteQuiz.score,
            temps_segons: 0,
            feedback_pos: 'Bona feina component el quiz de la Tacte.',
            feedback_neg: ''
        };
        await callApi('saveResult', result);
    }
}



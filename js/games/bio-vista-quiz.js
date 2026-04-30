/**
 * Quiz de la Vista
 */

const bioVistaQuiz = {
    allQuestions: [],
    sessionQuestions: [],
    currentStep: 0,
    score: 100,
    isFinished: false
};

function initVistaQuiz() {
    bioVistaQuiz.allQuestions = [];
    bioVistaQuiz.sessionQuestions = [];
    bioVistaQuiz.currentStep = 0;
    bioVistaQuiz.score = 100;
    bioVistaQuiz.isFinished = false;

    document.getElementById('bio-activity-vista-quiz').classList.remove('hidden');
    document.getElementById('bio-vista-quiz-loader').classList.remove('hidden');
    document.getElementById('bio-vista-quiz-ui').classList.add('hidden');
    document.getElementById('bio-vista-quiz-final').classList.add('hidden');

    if (typeof callApi === 'function') {
        callApi('getVistaQuestions', {})
            .then(data => {
                if (data.status === 'success' && data.data && data.data.length > 0) {
                    bioVistaQuiz.allQuestions = data.data;
                    startVistaQuizLevelSelector();
                } else {
                    alert("No s'han pogut carregar les preguntes de la Vista. Comprova la pestanya del Sheet.");
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

function startVistaQuizLevelSelector() {
    document.getElementById('bio-vista-quiz-loader').classList.add('hidden');
    document.getElementById('bio-vista-quiz-level-selector').classList.remove('hidden');

    const container = document.getElementById('bio-vista-quiz-level-buttons');
    if (!container) return;
    container.innerHTML = '';

    // --- SECCIÓ PER TEMA (type) ---
    const topics = [...new Set(bioVistaQuiz.allQuestions.map(q => q.type).filter(v => v && v.toString().trim() !== ''))];
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
            btn.onclick = () => startVistaQuiz(cat, 'type');
            container.appendChild(btn);
        });
    }

    // --- SECCIÓ PER NIVELL (level) ---
    const levels = [...new Set(bioVistaQuiz.allQuestions.map(q => q.level).filter(v => v && v.toString().trim() !== ''))];
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
            btn.onclick = () => startVistaQuiz(lvl, 'level');
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
    mixBtn.style.cssText = 'background-color:#7c3aed;width:auto;min-width:120px;';
    mixBtn.innerText = 'Barrejat (Tots)';
    mixBtn.onclick = () => startVistaQuiz('Barrejat', null);
    container.appendChild(mixBtn);
}

function startVistaQuiz(value, filterBy) {
    document.getElementById('bio-vista-quiz-level-selector').classList.add('hidden');

    let pool = bioVistaQuiz.allQuestions;
    if (filterBy === 'type') {
        pool = bioVistaQuiz.allQuestions.filter(q => q.type && q.type.toString().toLowerCase() === value.toString().toLowerCase());
    } else if (filterBy === 'level') {
        pool = bioVistaQuiz.allQuestions.filter(q => q.level && q.level.toString().toLowerCase() === value.toString().toLowerCase());
    }

    if (pool.length === 0) {
        alert("No hi ha preguntes per aquesta selecció.");
        initVistaQuiz();
        return;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    bioVistaQuiz.sessionQuestions = shuffled.slice(0, 10);

    bioVistaQuiz.currentStep = 0;
    bioVistaQuiz.score = 100;
    bioVistaQuiz.isFinished = false;

    document.getElementById('bio-vista-quiz-ui').classList.remove('hidden');
    renderVistaQuizQuestion();
}

function renderVistaQuizQuestion() {
    const questionData = bioVistaQuiz.sessionQuestions[bioVistaQuiz.currentStep];
    
    document.getElementById('vista-quiz-progress').innerText = `Pregunta ${bioVistaQuiz.currentStep + 1} de ${bioVistaQuiz.sessionQuestions.length}`;
    document.getElementById('vista-quiz-score-display').innerText = `Punts: ${bioVistaQuiz.score}`;
    
    document.getElementById('vista-quiz-text').innerText = questionData.q || questionData.Pregunta || '';

    const correctText = questionData.correct || questionData.Correcta;
    const alts = questionData.alternatives
        ? [...questionData.alternatives]
        : [correctText, questionData.Incorrecta1, questionData.Incorrecta2, questionData.Incorrecta3].filter(a => a);

    const answers = alts.map(text => ({ text, correct: text === correctText }));
    answers.sort(() => 0.5 - Math.random());

    const container = document.getElementById('vista-quiz-options');
    container.innerHTML = '';

    answers.forEach((ans) => {
        const btn = document.createElement('button');
        btn.className = 'btn-option w-full text-left mb-2';
        btn.innerText = ans.text;
        btn.dataset.correct = ans.correct;
        btn.onclick = () => handleVistaQuizAnswer(ans.correct, btn);
        container.appendChild(btn);
    });

    document.getElementById('vista-quiz-feedback').innerText = '';
}

function handleVistaQuizAnswer(isCorrect, btnElement) {
    if (bioVistaQuiz.isFinished) return;

    const container = document.getElementById('vista-quiz-options');
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => {
        b.disabled = true;
        if (b.dataset.correct === 'true') {
            b.classList.add('correct');
        } else if (b === btnElement) {
            b.classList.add('incorrect');
        }
    });

    const feedbackEl = document.getElementById('vista-quiz-feedback');

    if (isCorrect) {
        feedbackEl.innerText = 'Correcte!';
        feedbackEl.style.color = 'var(--success)';
        
        setTimeout(() => {
            bioVistaQuiz.currentStep++;
            if (bioVistaQuiz.currentStep >= bioVistaQuiz.sessionQuestions.length) {
                endVistaQuiz();
            } else {
                renderVistaQuizQuestion();
            }
        }, 1500);
    } else {
        feedbackEl.innerText = 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'var(--error)';
        bioVistaQuiz.score = Math.max(0, bioVistaQuiz.score - 10);
        document.getElementById('vista-quiz-score-display').innerText = `Punts: ${bioVistaQuiz.score}`;
        
        setTimeout(() => {
            feedbackEl.innerText = '';
            buttons.forEach(b => {
                b.disabled = false;
                b.classList.remove('correct', 'incorrect');
            });
        }, 1500);
    }
}

async function endVistaQuiz() {
    bioVistaQuiz.isFinished = true;
    document.getElementById('bio-vista-quiz-ui').classList.add('hidden');
    document.getElementById('bio-vista-quiz-final').classList.remove('hidden');

    const resultMsg = document.getElementById('endo-quiz-message'); // reuse class styling, ID might need change
    if(resultMsg) resultMsg.innerText = `Molt bé! Has aconseguit ${bioVistaQuiz.score} punts.`;
    document.getElementById('vista-quiz-final-score').innerText = `${bioVistaQuiz.score}%`;

    if (typeof state !== 'undefined' && state.user && typeof callApi === 'function') {
        const result = {
            email: state.user.email,
            curs: state.user.curs,
            projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
            app: 'Quiz de la Vista',
            nivell: 'Preguntes',
            puntuacio: bioVistaQuiz.score,
            temps_segons: 0,
            feedback_pos: 'Bona feina component el quiz de la Vista.',
            feedback_neg: ''
        };
        await callApi('saveResult', result);
    }
}

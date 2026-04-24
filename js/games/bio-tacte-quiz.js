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

    // Detectar si usem "Nivell" o "Tema"
    const firstQ = bioTacteQuiz.allQuestions[0];
    const categoryKey = (firstQ && firstQ.Tema) ? 'Tema' : 'Nivell';

    // Obtenir valors únics
    const categories = [...new Set(bioTacteQuiz.allQuestions
        .map(q => q[categoryKey])
        .filter(v => v && v.toString().trim() !== '')
    )];

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'btn-primary';
        btn.style.backgroundColor = '#3b82f6';
        btn.style.width = 'auto';
        btn.style.minWidth = '120px';
        btn.innerText = cat;
        btn.onclick = () => startTacteQuiz(cat);
        container.appendChild(btn);
    });

    // Botó Barrejat
    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn-primary bg-purple-600 hover:bg-purple-700';
    mixBtn.style.width = 'auto';
    mixBtn.style.minWidth = '120px';
    mixBtn.innerText = 'Barrejat (Tots)';
    mixBtn.onclick = () => startTacteQuiz('Barrejat');
    container.appendChild(mixBtn);
}

function startTacteQuiz(level) {
    document.getElementById('bio-tacte-quiz-level-selector').classList.add('hidden');

    const firstQ = bioTacteQuiz.allQuestions[0];
    const categoryKey = (firstQ && firstQ.Tema) ? 'Tema' : 'Nivell';

    let pool = bioTacteQuiz.allQuestions;
    if (level !== 'Barrejat') {
        pool = bioTacteQuiz.allQuestions.filter(q => 
            q[categoryKey] && q[categoryKey].toString().toLowerCase() === level.toString().toLowerCase()
        );
    }


    if (pool.length === 0) {
        alert("No hi ha preguntes per aquest nivell.");
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
    
    document.getElementById('tacte-quiz-text').innerText = questionData.Pregunta || '';

    const answers = [
        { text: questionData.Correcta, correct: true },
        { text: questionData.Incorrecta1, correct: false },
        { text: questionData.Incorrecta2, correct: false },
        { text: questionData.Incorrecta3, correct: false }
    ].filter(a => a.text);

    answers.sort(() => 0.5 - Math.random());

    const container = document.getElementById('tacte-quiz-options');
    container.innerHTML = '';

    answers.forEach((ans, idx) => {
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
    document.getElementById('tacte-quiz-final-score').innerText = `${bioTacteQuiz.score} / 100`;

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

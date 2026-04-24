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

    // Detectar si usem "Nivell" o "Tema"
    const firstQ = bioOidaQuiz.allQuestions[0];
    const categoryKey = (firstQ && firstQ.Tema) ? 'Tema' : 'Nivell';

    // Obtenir valors únics
    const categories = [...new Set(bioOidaQuiz.allQuestions
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
        btn.onclick = () => startOidaQuiz(cat);
        container.appendChild(btn);
    });

    // Botó Barrejat
    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn-primary bg-purple-600 hover:bg-purple-700';
    mixBtn.style.width = 'auto';
    mixBtn.style.minWidth = '120px';
    mixBtn.innerText = 'Barrejat (Tots)';
    mixBtn.onclick = () => startOidaQuiz('Barrejat');
    container.appendChild(mixBtn);
}

function startOidaQuiz(level) {
    document.getElementById('bio-oida-quiz-level-selector').classList.add('hidden');

    const firstQ = bioOidaQuiz.allQuestions[0];
    const categoryKey = (firstQ && firstQ.Tema) ? 'Tema' : 'Nivell';

    let pool = bioOidaQuiz.allQuestions;
    if (level !== 'Barrejat') {
        pool = bioOidaQuiz.allQuestions.filter(q => 
            q[categoryKey] && q[categoryKey].toString().toLowerCase() === level.toString().toLowerCase()
        );
    }


    if (pool.length === 0) {
        alert("No hi ha preguntes per aquest nivell.");
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
    
    document.getElementById('oida-quiz-text').innerText = questionData.Pregunta || '';

    const answers = [
        { text: questionData.Correcta, correct: true },
        { text: questionData.Incorrecta1, correct: false },
        { text: questionData.Incorrecta2, correct: false },
        { text: questionData.Incorrecta3, correct: false }
    ].filter(a => a.text);

    answers.sort(() => 0.5 - Math.random());

    const container = document.getElementById('oida-quiz-options');
    container.innerHTML = '';

    answers.forEach((ans, idx) => {
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
    document.getElementById('oida-quiz-final-score').innerText = `${bioOidaQuiz.score} / 100`;

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

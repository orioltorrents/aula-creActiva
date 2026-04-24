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

    // Detectar si usem "Nivell" o "Tema"
    const firstQ = bioEndocriQuiz.allQuestions[0];
    const categoryKey = (firstQ && firstQ.Tema) ? 'Tema' : 'Nivell';

    // Obtenir valors únics
    const categories = [...new Set(bioEndocriQuiz.allQuestions
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
        btn.onclick = () => startEndocriQuiz(cat);
        container.appendChild(btn);
    });

    // Botó Barrejat
    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn-primary bg-purple-600 hover:bg-purple-700';
    mixBtn.style.width = 'auto';
    mixBtn.style.minWidth = '120px';
    mixBtn.innerText = 'Barrejat (Tots)';
    mixBtn.onclick = () => startEndocriQuiz('Barrejat');
    container.appendChild(mixBtn);
}

function startEndocriQuiz(level) {
    document.getElementById('bio-endocri-quiz-level-selector').classList.add('hidden');

    const firstQ = bioEndocriQuiz.allQuestions[0];
    const categoryKey = (firstQ && firstQ.Tema) ? 'Tema' : 'Nivell';

    let pool = bioEndocriQuiz.allQuestions;
    if (level !== 'Barrejat') {
        pool = bioEndocriQuiz.allQuestions.filter(q => 
            q[categoryKey] && q[categoryKey].toString().toLowerCase() === level.toString().toLowerCase()
        );
    }

    if (pool.length === 0) {
        alert("No hi ha preguntes per aquest nivell.");
        initEndocriQuiz();
        return;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    bioEndocriQuiz.sessionQuestions = shuffled.slice(0, 10);

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
    
    document.getElementById('endo-quiz-text').innerText = questionData.Pregunta || '';

    const answers = [
        { text: questionData.Correcta, correct: true },
        { text: questionData.Incorrecta1, correct: false },
        { text: questionData.Incorrecta2, correct: false },
        { text: questionData.Incorrecta3, correct: false }
    ].filter(a => a.text);

    answers.sort(() => 0.5 - Math.random());

    const container = document.getElementById('endo-quiz-options');
    container.innerHTML = '';

    answers.forEach(ans => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left p-4 rounded bg-gray-100 hover:bg-gray-200 border transition-colors';
        btn.innerText = ans.text;
        btn.onclick = () => handleEndocriQuizAnswer(ans.correct, btn);
        container.appendChild(btn);
    });

    document.getElementById('endo-quiz-feedback').innerText = '';
}

function handleEndocriQuizAnswer(isCorrect, btnElement) {
    if (bioEndocriQuiz.isFinished) return;

    const container = document.getElementById('endo-quiz-options');
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);

    const feedbackEl = document.getElementById('endo-quiz-feedback');

    if (isCorrect) {
        btnElement.classList.remove('bg-gray-100', 'hover:bg-gray-200');
        btnElement.classList.add('bg-green-500', 'text-white');
        feedbackEl.innerText = 'Correcte!';
        feedbackEl.style.color = 'green';
        
        setTimeout(() => {
            bioEndocriQuiz.currentStep++;
            if (bioEndocriQuiz.currentStep >= bioEndocriQuiz.sessionQuestions.length) {
                endEndocriQuiz();
            } else {
                renderEndocriQuizQuestion();
            }
        }, 1500);
    } else {
        btnElement.classList.remove('bg-gray-100', 'hover:bg-gray-200');
        btnElement.classList.add('bg-red-500', 'text-white');
        feedbackEl.innerText = 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'red';
        bioEndocriQuiz.score = Math.max(0, bioEndocriQuiz.score - 10);
        document.getElementById('endo-quiz-score-display').innerText = `Punts: ${bioEndocriQuiz.score}`;
        
        setTimeout(() => {
            btnElement.classList.add('bg-gray-100', 'hover:bg-gray-200');
            btnElement.classList.remove('bg-red-500', 'text-white');
            feedbackEl.innerText = '';
            buttons.forEach(b => b.disabled = false);
        }, 1500);
    }
}

async function endEndocriQuiz() {
    bioEndocriQuiz.isFinished = true;
    document.getElementById('bio-endocri-quiz-ui').classList.add('hidden');
    document.getElementById('bio-endocri-quiz-final').classList.remove('hidden');

    document.getElementById('endo-quiz-final-score').innerText = `${bioEndocriQuiz.score} / 100`;
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

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

    // Detectar si usem "Nivell" o "Tema"
    const firstQ = bioVistaQuiz.allQuestions[0];
    const categoryKey = (firstQ && firstQ.Tema) ? 'Tema' : 'Nivell';

    // Obtenir valors únics
    const categories = [...new Set(bioVistaQuiz.allQuestions
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
        btn.onclick = () => startVistaQuiz(cat);
        container.appendChild(btn);
    });

    // Botó Barrejat
    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn-primary bg-purple-600 hover:bg-purple-700';
    mixBtn.style.width = 'auto';
    mixBtn.style.minWidth = '120px';
    mixBtn.innerText = 'Barrejat (Tots)';
    mixBtn.onclick = () => startVistaQuiz('Barrejat');
    container.appendChild(mixBtn);
}

function startVistaQuiz(level) {
    document.getElementById('bio-vista-quiz-level-selector').classList.add('hidden');

    const firstQ = bioVistaQuiz.allQuestions[0];
    const categoryKey = (firstQ && firstQ.Tema) ? 'Tema' : 'Nivell';

    let pool = bioVistaQuiz.allQuestions;
    if (level !== 'Barrejat') {
        pool = bioVistaQuiz.allQuestions.filter(q => 
            q[categoryKey] && q[categoryKey].toString().toLowerCase() === level.toString().toLowerCase()
        );
    }


    if (pool.length === 0) {
        alert("No hi ha preguntes per aquest nivell.");
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
    
    document.getElementById('vista-quiz-text').innerText = questionData.Pregunta || '';

    const answers = [
        { text: questionData.Correcta, correct: true },
        { text: questionData.Incorrecta1, correct: false },
        { text: questionData.Incorrecta2, correct: false },
        { text: questionData.Incorrecta3, correct: false }
    ].filter(a => a.text);

    answers.sort(() => 0.5 - Math.random());

    const container = document.getElementById('vista-quiz-options');
    container.innerHTML = '';

    answers.forEach(ans => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left p-4 rounded bg-gray-100 hover:bg-gray-200 border transition-colors';
        btn.innerText = ans.text;
        btn.onclick = () => handleVistaQuizAnswer(ans.correct, btn);
        container.appendChild(btn);
    });

    document.getElementById('vista-quiz-feedback').innerText = '';
}

function handleVistaQuizAnswer(isCorrect, btnElement) {
    if (bioVistaQuiz.isFinished) return;

    const container = document.getElementById('vista-quiz-options');
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);

    const feedbackEl = document.getElementById('vista-quiz-feedback');

    if (isCorrect) {
        btnElement.classList.remove('bg-gray-100', 'hover:bg-gray-200');
        btnElement.classList.add('bg-green-500', 'text-white');
        feedbackEl.innerText = 'Correcte!';
        feedbackEl.style.color = 'green';
        
        setTimeout(() => {
            bioVistaQuiz.currentStep++;
            if (bioVistaQuiz.currentStep >= bioVistaQuiz.sessionQuestions.length) {
                endVistaQuiz();
            } else {
                renderVistaQuizQuestion();
            }
        }, 1500);
    } else {
        btnElement.classList.remove('bg-gray-100', 'hover:bg-gray-200');
        btnElement.classList.add('bg-red-500', 'text-white');
        feedbackEl.innerText = 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'red';
        bioVistaQuiz.score = Math.max(0, bioVistaQuiz.score - 10);
        document.getElementById('vista-quiz-score-display').innerText = `Punts: ${bioVistaQuiz.score}`;
        
        setTimeout(() => {
            btnElement.classList.add('bg-gray-100', 'hover:bg-gray-200');
            btnElement.classList.remove('bg-red-500', 'text-white');
            feedbackEl.innerText = '';
            buttons.forEach(b => b.disabled = false);
        }, 1500);
    }
}

async function endVistaQuiz() {
    bioVistaQuiz.isFinished = true;
    document.getElementById('bio-vista-quiz-ui').classList.add('hidden');
    document.getElementById('bio-vista-quiz-final').classList.remove('hidden');

    const resultMsg = document.getElementById('endo-quiz-message'); // reuse class styling, ID might need change
    if(resultMsg) resultMsg.innerText = `Molt bé! Has aconseguit ${bioVistaQuiz.score} punts.`;
    document.getElementById('vista-quiz-final-score').innerText = `${bioVistaQuiz.score} / 100`;

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

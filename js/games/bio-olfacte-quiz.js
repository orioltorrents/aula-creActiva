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

    // Detectar si usem "Nivell" o "Tema"
    const firstQ = bioOlfacteQuiz.allQuestions[0];
    const categoryKey = (firstQ && firstQ.Tema) ? 'Tema' : 'Nivell';

    // Obtenir valors únics
    const categories = [...new Set(bioOlfacteQuiz.allQuestions
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
        btn.onclick = () => startOlfacteQuiz(cat);
        container.appendChild(btn);
    });

    // Botó Barrejat
    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn-primary bg-purple-600 hover:bg-purple-700';
    mixBtn.style.width = 'auto';
    mixBtn.style.minWidth = '120px';
    mixBtn.innerText = 'Barrejat (Tots)';
    mixBtn.onclick = () => startOlfacteQuiz('Barrejat');
    container.appendChild(mixBtn);
}

function startOlfacteQuiz(level) {
    document.getElementById('bio-olfacte-quiz-level-selector').classList.add('hidden');

    const firstQ = bioOlfacteQuiz.allQuestions[0];
    const categoryKey = (firstQ && firstQ.Tema) ? 'Tema' : 'Nivell';

    let pool = bioOlfacteQuiz.allQuestions;
    if (level !== 'Barrejat') {
        pool = bioOlfacteQuiz.allQuestions.filter(q => 
            q[categoryKey] && q[categoryKey].toString().toLowerCase() === level.toString().toLowerCase()
        );
    }


    if (pool.length === 0) {
        alert("No hi ha preguntes per aquest nivell.");
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
    
    document.getElementById('olfacte-quiz-text').innerText = questionData.Pregunta || '';

    const answers = [
        { text: questionData.Correcta, correct: true },
        { text: questionData.Incorrecta1, correct: false },
        { text: questionData.Incorrecta2, correct: false },
        { text: questionData.Incorrecta3, correct: false }
    ].filter(a => a.text);

    answers.sort(() => 0.5 - Math.random());

    const container = document.getElementById('olfacte-quiz-options');
    container.innerHTML = '';

    answers.forEach(ans => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left p-4 rounded bg-gray-100 hover:bg-gray-200 border transition-colors';
        btn.innerText = ans.text;
        btn.onclick = () => handleOlfacteQuizAnswer(ans.correct, btn);
        container.appendChild(btn);
    });

    document.getElementById('olfacte-quiz-feedback').innerText = '';
}

function handleOlfacteQuizAnswer(isCorrect, btnElement) {
    if (bioOlfacteQuiz.isFinished) return;

    const container = document.getElementById('olfacte-quiz-options');
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);

    const feedbackEl = document.getElementById('olfacte-quiz-feedback');

    if (isCorrect) {
        btnElement.classList.remove('bg-gray-100', 'hover:bg-gray-200');
        btnElement.classList.add('bg-green-500', 'text-white');
        feedbackEl.innerText = 'Correcte!';
        feedbackEl.style.color = 'green';
        
        setTimeout(() => {
            bioOlfacteQuiz.currentStep++;
            if (bioOlfacteQuiz.currentStep >= bioOlfacteQuiz.sessionQuestions.length) {
                endOlfacteQuiz();
            } else {
                renderOlfacteQuizQuestion();
            }
        }, 1500);
    } else {
        btnElement.classList.remove('bg-gray-100', 'hover:bg-gray-200');
        btnElement.classList.add('bg-red-500', 'text-white');
        feedbackEl.innerText = 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'red';
        bioOlfacteQuiz.score = Math.max(0, bioOlfacteQuiz.score - 10);
        document.getElementById('olfacte-quiz-score-display').innerText = `Punts: ${bioOlfacteQuiz.score}`;
        
        setTimeout(() => {
            btnElement.classList.add('bg-gray-100', 'hover:bg-gray-200');
            btnElement.classList.remove('bg-red-500', 'text-white');
            feedbackEl.innerText = '';
            buttons.forEach(b => b.disabled = false);
        }, 1500);
    }
}

async function endOlfacteQuiz() {
    bioOlfacteQuiz.isFinished = true;
    document.getElementById('bio-olfacte-quiz-ui').classList.add('hidden');
    document.getElementById('bio-olfacte-quiz-final').classList.remove('hidden');

    const resultMsg = document.getElementById('endo-quiz-message'); // reuse class styling, ID might need change
    if(resultMsg) resultMsg.innerText = `Molt bé! Has aconseguit ${bioOlfacteQuiz.score} punts.`;
    document.getElementById('olfacte-quiz-final-score').innerText = `${bioOlfacteQuiz.score} / 100`;

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

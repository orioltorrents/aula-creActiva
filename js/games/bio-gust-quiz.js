/**
 * Quiz de la Gust
 */

const bioGustQuiz = {
    allQuestions: [],
    sessionQuestions: [],
    currentStep: 0,
    score: 100,
    isFinished: false
};

function initGustQuiz() {
    bioGustQuiz.allQuestions = [];
    bioGustQuiz.sessionQuestions = [];
    bioGustQuiz.currentStep = 0;
    bioGustQuiz.score = 100;
    bioGustQuiz.isFinished = false;

    document.getElementById('bio-activity-gust-quiz').classList.remove('hidden');
    document.getElementById('bio-gust-quiz-loader').classList.remove('hidden');
    document.getElementById('bio-gust-quiz-ui').classList.add('hidden');
    document.getElementById('bio-gust-quiz-final').classList.add('hidden');

    if (typeof callApi === 'function') {
        callApi('getGustQuestions', {})
            .then(data => {
                if (data.status === 'success' && data.data && data.data.length > 0) {
                    bioGustQuiz.allQuestions = data.data;
                    startGustQuizLevelSelector();
                } else {
                    alert("No s'han pogut carregar les preguntes de la Gust. Comprova la pestanya del Sheet.");
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

function startGustQuizLevelSelector() {
    document.getElementById('bio-gust-quiz-loader').classList.add('hidden');
    document.getElementById('bio-gust-quiz-level-selector').classList.remove('hidden');

    const container = document.getElementById('bio-gust-quiz-level-buttons');
    if (!container) return;
    container.innerHTML = '';

    // Detectar si usem "Nivell" o "Tema"
    const firstQ = bioGustQuiz.allQuestions[0];
    const categoryKey = (firstQ && firstQ.Tema) ? 'Tema' : 'Nivell';

    // Obtenir valors únics
    const categories = [...new Set(bioGustQuiz.allQuestions
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
        btn.onclick = () => startGustQuiz(cat);
        container.appendChild(btn);
    });

    // Botó Barrejat
    const mixBtn = document.createElement('button');
    mixBtn.className = 'btn-primary bg-purple-600 hover:bg-purple-700';
    mixBtn.style.width = 'auto';
    mixBtn.style.minWidth = '120px';
    mixBtn.innerText = 'Barrejat (Tots)';
    mixBtn.onclick = () => startGustQuiz('Barrejat');
    container.appendChild(mixBtn);
}

function startGustQuiz(level) {
    document.getElementById('bio-gust-quiz-level-selector').classList.add('hidden');

    const firstQ = bioGustQuiz.allQuestions[0];
    const categoryKey = (firstQ && firstQ.Tema) ? 'Tema' : 'Nivell';

    let pool = bioGustQuiz.allQuestions;
    if (level !== 'Barrejat') {
        pool = bioGustQuiz.allQuestions.filter(q => 
            q[categoryKey] && q[categoryKey].toString().toLowerCase() === level.toString().toLowerCase()
        );
    }


    if (pool.length === 0) {
        alert("No hi ha preguntes per aquest nivell.");
        initGustQuiz();
        return;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    bioGustQuiz.sessionQuestions = shuffled.slice(0, 10);

    bioGustQuiz.currentStep = 0;
    bioGustQuiz.score = 100;
    bioGustQuiz.isFinished = false;

    document.getElementById('bio-gust-quiz-ui').classList.remove('hidden');
    renderGustQuizQuestion();
}

function renderGustQuizQuestion() {
    const questionData = bioGustQuiz.sessionQuestions[bioGustQuiz.currentStep];
    
    document.getElementById('gust-quiz-progress').innerText = `Pregunta ${bioGustQuiz.currentStep + 1} de ${bioGustQuiz.sessionQuestions.length}`;
    document.getElementById('gust-quiz-score-display').innerText = `Punts: ${bioGustQuiz.score}`;
    
    document.getElementById('gust-quiz-text').innerText = questionData.Pregunta || '';

    const answers = [
        { text: questionData.Correcta, correct: true },
        { text: questionData.Incorrecta1, correct: false },
        { text: questionData.Incorrecta2, correct: false },
        { text: questionData.Incorrecta3, correct: false }
    ].filter(a => a.text);

    answers.sort(() => 0.5 - Math.random());

    const container = document.getElementById('gust-quiz-options');
    container.innerHTML = '';

    answers.forEach(ans => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left p-4 rounded bg-gray-100 hover:bg-gray-200 border transition-colors';
        btn.innerText = ans.text;
        btn.onclick = () => handleGustQuizAnswer(ans.correct, btn);
        container.appendChild(btn);
    });

    document.getElementById('gust-quiz-feedback').innerText = '';
}

function handleGustQuizAnswer(isCorrect, btnElement) {
    if (bioGustQuiz.isFinished) return;

    const container = document.getElementById('gust-quiz-options');
    const buttons = container.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);

    const feedbackEl = document.getElementById('gust-quiz-feedback');

    if (isCorrect) {
        btnElement.classList.remove('bg-gray-100', 'hover:bg-gray-200');
        btnElement.classList.add('bg-green-500', 'text-white');
        feedbackEl.innerText = 'Correcte!';
        feedbackEl.style.color = 'green';
        
        setTimeout(() => {
            bioGustQuiz.currentStep++;
            if (bioGustQuiz.currentStep >= bioGustQuiz.sessionQuestions.length) {
                endGustQuiz();
            } else {
                renderGustQuizQuestion();
            }
        }, 1500);
    } else {
        btnElement.classList.remove('bg-gray-100', 'hover:bg-gray-200');
        btnElement.classList.add('bg-red-500', 'text-white');
        feedbackEl.innerText = 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'red';
        bioGustQuiz.score = Math.max(0, bioGustQuiz.score - 10);
        document.getElementById('gust-quiz-score-display').innerText = `Punts: ${bioGustQuiz.score}`;
        
        setTimeout(() => {
            btnElement.classList.add('bg-gray-100', 'hover:bg-gray-200');
            btnElement.classList.remove('bg-red-500', 'text-white');
            feedbackEl.innerText = '';
            buttons.forEach(b => b.disabled = false);
        }, 1500);
    }
}

async function endGustQuiz() {
    bioGustQuiz.isFinished = true;
    document.getElementById('bio-gust-quiz-ui').classList.add('hidden');
    document.getElementById('bio-gust-quiz-final').classList.remove('hidden');

    const resultMsg = document.getElementById('endo-quiz-message'); // reuse class styling, ID might need change
    if(resultMsg) resultMsg.innerText = `Molt bé! Has aconseguit ${bioGustQuiz.score} punts.`;
    document.getElementById('gust-quiz-final-score').innerText = `${bioGustQuiz.score} / 100`;

    if (typeof state !== 'undefined' && state.user && typeof callApi === 'function') {
        const result = {
            email: state.user.email,
            curs: state.user.curs,
            projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
            app: 'Quiz de la Gust',
            nivell: 'Preguntes',
            puntuacio: bioGustQuiz.score,
            temps_segons: 0,
            feedback_pos: 'Bona feina component el quiz de la Gust.',
            feedback_neg: ''
        };
        await callApi('saveResult', result);
    }
}

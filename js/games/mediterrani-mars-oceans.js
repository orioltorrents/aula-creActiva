const MEDITERRANI_MARS_OCEANS_QUESTIONS = [
    { question: 'Quants oceans hi ha en el món?', options: ['Cinc', 'Quatre', 'Sis', 'Tres'], correct: 0 },
    { question: 'Quin d’aquests és un oceà?', options: ['Pacífic', 'Mediterrani', 'Carib', 'Bàltic'], correct: 0 },
    { question: 'Quin és un dels principals orígens de l’aigua dels mars i oceans?', options: ['El vapor alliberat pel vulcanisme i la condensació posterior', 'La sal que es transforma en aigua', 'La llum de la Lluna', 'Els núvols que arriben des de Mart'], correct: 0 },
    { question: 'Quina combinació descriu millor el mar Mediterrani?', options: ['És gairebé tancat, salat i comunica amb l’Atlàntic per Gibraltar', 'És un oceà completament obert i d’aigua dolça', 'És un mar cobert de gel tot l’any', 'No té illes ni costes continentals'], correct: 0 },
    { question: 'Per què l’aigua del mar és salada?', options: ['Els rius dissolen minerals de les roques i els transporten fins al mar', 'Perquè hi ha un molinet màgic al fons del mar', 'Perquè tots els rius són salats', 'Perquè la sal arriba només amb la llum solar'], correct: 0 },
    { question: 'Què són les illes de plàstic?', options: ['Acumulacions de residus plàstics transportats pels corrents marins', 'Illes formades només per corall', 'Illes volcàniques que suren', 'Grups d’icebergs del pol Nord'], correct: 0 },
    { question: 'Quin efecte perjudicial té el plàstic sobre els mars?', options: ['Pot ser ingerit pels animals i entrar a les xarxes tròfiques', 'Augmenta sempre la biodiversitat', 'Converteix l’aigua salada en dolça', 'Fa desaparèixer tots els corrents marins'], correct: 0 },
    { question: 'Quant pot tardar aproximadament una bossa de plàstic a degradar-se?', options: ['Uns 500 anys', 'Uns 50 anys', 'Uns 5 anys', 'Uns 5 dies'], correct: 0 },
    { question: 'A quina profunditat aproximada ha arribat l’ésser humà en una fossa oceànica?', options: ['Uns 10.898 metres', '172 metres', '8.850 metres', '500 metres'], correct: 0 },
    { question: 'Entre quins anys es va desenvolupar la Guerra Civil espanyola?', options: ['1936–1939', '1939–1945', '1918–1921', '2007–2008'], correct: 0 }
];

const mediterraniMarsOceansState = { questions: [], current: 0, score: 0, answered: false };

function shuffleMarsOceans(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function initMediterraniMarsOceansQuiz() {
    const start = document.getElementById('med-mars-oceans-start');
    const next = document.getElementById('med-mars-oceans-next');
    const retry = document.getElementById('med-mars-oceans-retry');
    if (!start || !next || !retry) return;
    start.onclick = startMediterraniMarsOceansQuiz;
    next.onclick = nextMediterraniMarsOceansQuestion;
    retry.onclick = startMediterraniMarsOceansQuiz;
    start.classList.remove('hidden');
    document.getElementById('med-mars-oceans-container').classList.add('hidden');
    document.getElementById('med-mars-oceans-results').classList.add('hidden');
}

function startMediterraniMarsOceansQuiz() {
    mediterraniMarsOceansState.questions = shuffleMarsOceans(MEDITERRANI_MARS_OCEANS_QUESTIONS);
    mediterraniMarsOceansState.current = 0;
    mediterraniMarsOceansState.score = 0;
    mediterraniMarsOceansState.answered = false;
    document.getElementById('med-mars-oceans-start').classList.add('hidden');
    document.getElementById('med-mars-oceans-results').classList.add('hidden');
    document.getElementById('med-mars-oceans-container').classList.remove('hidden');
    renderMediterraniMarsOceansQuestion();
}

function renderMediterraniMarsOceansQuestion() {
    const state = mediterraniMarsOceansState;
    const question = state.questions[state.current];
    if (!question) return finishMediterraniMarsOceansQuiz();
    state.answered = false;
    document.getElementById('med-mars-oceans-progress').textContent = `Pregunta ${state.current + 1}/${state.questions.length}`;
    document.getElementById('med-mars-oceans-score').textContent = `Encerts: ${state.score}`;
    document.getElementById('med-mars-oceans-question').textContent = question.question;
    document.getElementById('med-mars-oceans-feedback').textContent = '';
    document.getElementById('med-mars-oceans-next').classList.add('hidden');
    const options = document.getElementById('med-mars-oceans-options');
    options.innerHTML = '';
    shuffleMarsOceans(question.options.map((text, index) => ({ text, index }))).forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn quiz-option-button';
        button.textContent = option.text;
        button.onclick = () => answerMediterraniMarsOceansQuestion(option.index, button);
        options.appendChild(button);
    });
}

function answerMediterraniMarsOceansQuestion(selectedIndex, selectedButton) {
    const state = mediterraniMarsOceansState;
    if (state.answered) return;
    state.answered = true;
    const question = state.questions[state.current];
    const correct = selectedIndex === question.correct;
    if (correct) state.score += 1;
    document.querySelectorAll('#med-mars-oceans-options button').forEach(button => { button.disabled = true; });
    selectedButton.classList.add(correct ? 'correct' : 'incorrect');
    document.querySelectorAll('#med-mars-oceans-options button').forEach(button => {
        if (button.textContent === question.options[question.correct]) button.classList.add('correct');
    });
    const feedback = document.getElementById('med-mars-oceans-feedback');
    feedback.textContent = correct ? 'Correcte!' : 'Incorrecte.';
    setElementStateColor(feedback, correct ? 'success' : 'error');
    document.getElementById('med-mars-oceans-score').textContent = `Encerts: ${state.score}`;
    document.getElementById('med-mars-oceans-next').classList.remove('hidden');
}

function nextMediterraniMarsOceansQuestion() {
    if (!mediterraniMarsOceansState.answered) return;
    mediterraniMarsOceansState.current += 1;
    renderMediterraniMarsOceansQuestion();
}

async function finishMediterraniMarsOceansQuiz() {
    const quizState = mediterraniMarsOceansState;
    const percentage = Math.round((quizState.score / quizState.questions.length) * 100);
    document.getElementById('med-mars-oceans-container').classList.add('hidden');
    document.getElementById('med-mars-oceans-results').classList.remove('hidden');
    document.getElementById('med-mars-oceans-final-score').textContent = `${percentage}% (${quizState.score}/${quizState.questions.length})`;
    document.getElementById('med-mars-oceans-message').textContent = percentage >= 70 ? 'Molt bé!' : 'Cal repassar el vídeo i els continguts.';
    if (typeof state === 'undefined' || !state.user || !state.currentProject) return;
    try {
        await callApi('saveResult', {
            email: state.user.email,
            curs: state.user.curs,
            projecte: state.currentProject.titol,
            app: 'Mars i oceans',
            nivell: 'Nivell 1',
            puntuacio: percentage,
            temps_segons: 0,
            feedback_pos: `${quizState.score}/${quizState.questions.length}`,
            feedback_neg: ''
        });
    } catch (error) {
        console.error('Error desant el test de Mars i oceans:', error);
    }
}

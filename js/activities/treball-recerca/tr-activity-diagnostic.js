/*
==========================================================
ACTIVITAT: DIAGNÒSTIC DE PREGUNTES
Projecte: Treball de Recerca

Aquest fitxer conté la lògica específica de l'activitat
de diagnòstic de preguntes del Treball de Recerca.

Què fa aquest fitxer?
- Inicialitza l'activitat
- Mostra preguntes per analitzar
- Permet decidir si una pregunta és investigable o no
- Permet marcar quins problemes té la pregunta
- Comprova la resposta de l'alumne
- Mostra feedback detallat
- Proposa una possible millora de la pregunta
- Gestiona el pas a la pregunta següent

Què NO fa aquest fitxer?
- No controla el menú principal del projecte
- No mostra ni amaga el hub del projecte
- No decideix quina activitat s'obre
- No gestiona la navegació general entre activitats

Per tant, aquest fitxer és responsable només de la
lògica interna de l'activitat de diagnòstic de preguntes.

==========================================================
*/

let diagnosticState = {
    questions: [],
    currentQuestionIndex: 0,
    selectedInvestigable: null,
    selectedProblems: [],
    currentQuestion: null
};

/**
 * Inicialitza l'activitat (anomenada des de app.js)
 */
function initTrDiagnostic() {
    // Reset UI
    document.getElementById('tr-diagnostic-setup').classList.remove('hidden');
    document.getElementById('tr-diagnostic-quiz-container').classList.add('hidden');
    document.getElementById('tr-diagnostic-feedback').classList.add('hidden');

    diagnosticState.questions = [];
    diagnosticState.currentQuestionIndex = 0;
}

/**
 * Comença l'activitat carregant les preguntes
 */
async function startTrDiagnostic() {
    const setupDiv = document.getElementById('tr-diagnostic-setup');
    const quizContainer = document.getElementById('tr-diagnostic-quiz-container');

    setupDiv.classList.add('hidden');
    quizContainer.classList.remove('hidden');

    document.getElementById('tr-diagnostic-text').textContent = 'Carregant preguntes...';

    try {
        const response = await callApi('getDiagnosticQuestions');
        if (response && response.status === 'success' && response.questions.length > 0) {
            diagnosticState.questions = shuffleArray(response.questions);
            loadDiagnosticQuestion();
        } else {
            document.getElementById('tr-diagnostic-text').textContent = 'No s\'han trobat preguntes per a aquesta activitat.';
        }
    } catch (e) {
        console.error("Error carregant preguntes de diagnòstic:", e);
        document.getElementById('tr-diagnostic-text').textContent = 'Error al carregar les preguntes.';
    }
}

/**
 * Carrega la pregunta actual a la interfície
 */
function loadDiagnosticQuestion() {
    const q = diagnosticState.questions[diagnosticState.currentQuestionIndex];
    diagnosticState.currentQuestion = q;
    diagnosticState.selectedInvestigable = null;
    diagnosticState.selectedProblems = [];

    // UI Reset
    document.getElementById('tr-diagnostic-text').textContent = q.pregunta;
    document.getElementById('tr-diagnostic-feedback').classList.add('hidden');

    // Reset Buttons
    document.getElementById('btn-diag-yes').classList.remove('active');
    document.getElementById('btn-diag-no').classList.remove('active');

    // Reset Problems Area
    const problemsArea = document.getElementById('tr-diagnostic-problems-area');
    problemsArea.classList.add('opacity-50', 'pointer-events-none');

    // Reset Checkboxes
    const checkboxes = document.querySelectorAll('#diagnostic-options input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = false;
        cb.parentElement.classList.remove('bg-indigo-50', 'border-indigo-200');
    });

    // Disable Check Button
    document.getElementById('btn-diag-check').disabled = true;
}

/**
 * Selecciona si la pregunta és investigable o no
 */
function selectDiagInvestigable(val) {
    diagnosticState.selectedInvestigable = val;

    const btnYes = document.getElementById('btn-diag-yes');
    const btnNo = document.getElementById('btn-diag-no');
    const problemsArea = document.getElementById('tr-diagnostic-problems-area');

    if (val) {
        btnYes.classList.add('active');
        btnNo.classList.remove('active');
        // Si és investigable, el diagnòstic normalment no s'hauria de fer o indicar que no té problemes
        // Però per seguir l'estructura pedagògica, deixem que triïn si volen (normalment no hi haurà checkboxes marcats)
        problemsArea.classList.remove('opacity-50', 'pointer-events-none');
    } else {
        btnNo.classList.add('active');
        btnYes.classList.remove('active');
        problemsArea.classList.remove('opacity-50', 'pointer-events-none');
    }

    updateCheckButton();
}

/**
 * Actualitza l'estat del botó de comprovació
 */
function updateCheckButton() {
    const checkBtn = document.getElementById('btn-diag-check');
    if (diagnosticState.selectedInvestigable !== null) {
        checkBtn.disabled = false;
    } else {
        checkBtn.disabled = true;
    }
}

// Listener per als checkboxes (afegit en runtime o via delegació)
document.addEventListener('change', (e) => {
    if (e.target.name === 'problem') {
        const span = e.target.parentElement;
        if (e.target.checked) {
            span.classList.add('bg-indigo-50', 'border-indigo-200');
        } else {
            span.classList.remove('bg-indigo-50', 'border-indigo-200');
        }
    }
});

/**
 * Comprova la resposta de l'alumne
 */
async function checkDiagnosticAnswer() {
    const q = diagnosticState.currentQuestion;
    const checkboxes = document.querySelectorAll('#diagnostic-options input[type="checkbox"]');
    diagnosticState.selectedProblems = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);

    const isCorrectInvestigable = (diagnosticState.selectedInvestigable === (String(q.investigable).toUpperCase() === 'TRUE'));

    // Valida problemes (si investigable és false)
    let problemsMatch = true;
    const targetProblems = [];
    if (String(q.problema_massa_general).toUpperCase() === 'TRUE') targetProblems.push('massa_general');
    if (String(q.problema_sense_variables).toUpperCase() === 'TRUE') targetProblems.push('sense_variables');
    if (String(q.problema_no_mesurable).toUpperCase() === 'TRUE') targetProblems.push('no_mesurable');
    if (String(q.problema_no_comparacio).toUpperCase() === 'TRUE') targetProblems.push('no_comparacio');
    if (String(q.problema_inabordable).toUpperCase() === 'TRUE') targetProblems.push('inabordable');
    if (String(q.problema_ambigua).toUpperCase() === 'TRUE') targetProblems.push('ambigua');

    // Comprovem si els conjunts coincideixen EXACTAMENT
    if (diagnosticState.selectedProblems.length !== targetProblems.length) {
        problemsMatch = false;
    } else {
        for (let p of targetProblems) {
            if (!diagnosticState.selectedProblems.includes(p)) {
                problemsMatch = false;
                break;
            }
        }
    }

    const isTotallyCorrect = isCorrectInvestigable && problemsMatch;

    showDiagnosticFeedback(isTotallyCorrect, q);

    // Guardar resultat
    saveDiagnosticResult(isTotallyCorrect);
}

/**
 * Mostra el feedback a l'usuari
 */
function showDiagnosticFeedback(correct, q) {
    const feedbackDiv = document.getElementById('tr-diagnostic-feedback');
    const header = document.getElementById('tr-diagnostic-feedback-header');
    const text = document.getElementById('tr-diagnostic-feedback-text');
    const suggestionText = document.getElementById('tr-diagnostic-suggestion-text');

    feedbackDiv.classList.remove('hidden', 'feedback-panel--correct', 'feedback-panel--incorrect');
    feedbackDiv.classList.add(correct ? 'feedback-panel--correct' : 'feedback-panel--incorrect');

    header.innerHTML = correct ? '✔ Resposta correcta' : '❌ Resposta incorrecta';
    text.textContent = q.explicacio;
    suggestionText.textContent = q.millora || "Com demana el professor..."; // Millora és opcional segons el dataset, si no hi és podem posar un placeholder o treure el bloc

    if (!q.millora) {
        document.getElementById('tr-diagnostic-suggestion').classList.add('hidden');
    } else {
        document.getElementById('tr-diagnostic-suggestion').classList.remove('hidden');
    }

    feedbackDiv.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Carrega la següent pregunta
 */
function loadNextDiagnosticQuestion() {
    diagnosticState.currentQuestionIndex++;
    if (diagnosticState.currentQuestionIndex >= diagnosticState.questions.length) {
        diagnosticState.currentQuestionIndex = 0; // Torna a començar o podríem mostrar resultats finals
        diagnosticState.questions = shuffleArray(diagnosticState.questions);
    }
    loadDiagnosticQuestion();
}

/**
 * Guarda el resultat a la base de dades
 */
async function saveDiagnosticResult(correct) {
    if (!state.user || !state.currentProject) return;

    const data = {
        action: 'saveResult',
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject.titol,
        app: 'Diagnòstic de preguntes',
        nivell: 'Estàndard',
        puntuacio: correct ? 1 : 0,
        temps_segons: 0,
        feedback_pos: correct ? 'Identificació correcta' : '',
        feedback_neg: correct ? '' : 'Cal revisar els criteris d\'investigabilitat'
    };

    try {
        await callApi('saveResult', data);
    } catch (e) {
        console.error("Error guardant resultat de diagnòstic:", e);
    }
}

// Helpers
function shuffleArray(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

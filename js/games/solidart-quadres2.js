/**
 * SOLIDART: QUADRES 2 (REVERSE IMAGE QUIZ)
 * Lògica del joc on es dona un text i s'ha de triar la imatge correcta.
 */

let solidartQuadres2State = {
    questions: [],
    currentIndex: 0,
    score: 0,
    startTime: null,
    dificultat: '',
    feedbackLevel: 'simple',
    autoAdvanceTimer: null
};

const SOLIDART_QUADRES2_AUTO_ADVANCE_MS = 1200;

async function initSolidartQuadres2(dificultat) {
    const setupDiv = document.getElementById('solidart-quadres2-setup');
    const quizDiv = document.getElementById('solidart-quadres2-quiz-container');
    const resultsDiv = document.getElementById('solidart-quadres2-results');

    setupDiv.classList.add('hidden');
    quizDiv.classList.remove('hidden');
    quizDiv.innerHTML = '<div class="text-center p-10"><div class="loader">Carregant preguntes...</div></div>';
    resultsDiv.classList.add('hidden');

    try {
        const response = await callApi('getSolidartQuadres2', { dificultat });

        if (response && response.status === 'success' && response.questions.length > 0) {
            solidartQuadres2State = {
                questions: response.questions,
                currentIndex: 0,
                score: 0,
                startTime: new Date(),
                dificultat: dificultat,
                feedbackLevel: document.getElementById('solidart-feedback-level2')?.value || 'simple'
            };
            clearSolidartQuadres2AutoAdvance();
            if (typeof toggleFullscreen === 'function' && !document.fullscreenElement) {
                toggleFullscreen();
            }
            renderSolidartQuadres2();
        } else {
            const errorMsg = response && response.message ? response.message : "No s'han trobat preguntes per a aquesta dificultat.";
            quizDiv.innerHTML = `<div class="alert alert-error">${errorMsg}</div>
                                 <button class="btn-secondary mt-4" onclick="showSolidartMenu()">Tornar</button>`;
        }
    } catch (e) {
        console.error("Error initSolidartQuadres2:", e);
        quizDiv.innerHTML = '<div class="alert alert-error">Error de connexió amb el servidor.</div>';
    }
}

function renderSolidartQuadres2() {
    const quizDiv = document.getElementById('solidart-quadres2-quiz-container');
    quizDiv.innerHTML = `
        <div class="stats-bar flex justify-between mb-4">
            <span id="solidart-quadres2-progress"></span>
            <span id="solidart-quadres2-score-display"></span>
        </div>
        <div class="question-container text-center">
            <h4 id="solidart-quadres2-text" class="text-2xl font-bold mb-8 p-6 bg-white rounded-xl shadow-sm border"></h4>
            <div id="solidart-quadres2-options" class="grid grid-cols-2 gap-4"></div>
        </div>
        <div id="solidart-quadres2-feedback-area" class="hidden text-center mt-6 p-4 rounded bg-gray-50 border">
            <p id="solidart-quadres2-feedback-msg" class="text-xl font-bold mb-2"></p>
            <button class="btn-primary hidden" onclick="nextSolidartQuadres2()">Següent</button>
        </div>
    `;

    clearSolidartQuadres2AutoAdvance();
    const q = solidartQuadres2State.questions[solidartQuadres2State.currentIndex];

    document.getElementById('solidart-quadres2-progress').textContent = `Pregunta ${solidartQuadres2State.currentIndex + 1} / ${solidartQuadres2State.questions.length}`;
    document.getElementById('solidart-quadres2-score-display').textContent = `Punts: ${solidartQuadres2State.score}`;
    document.getElementById('solidart-quadres2-text').textContent = q.pregunta;

    const optionsDiv = document.getElementById('solidart-quadres2-options');
    optionsDiv.innerHTML = '';

    q.opcions.forEach(imgName => {
        const btn = document.createElement('div');
        btn.className = 'activity-card p-2 cursor-pointer border-2 hover:border-primary transition-all';
        const imgSrc = `assets/images/activities/solidart/artworks/${imgName}`;
        const placeholderSrc = buildSolidartQuadres2Placeholder(imgName);
        btn.innerHTML = `
            <img src="${imgSrc}" class="w-full h-40 object-contain rounded" onerror="this.onerror=null; this.src='${placeholderSrc}'">
        `;
        btn.onclick = () => checkSolidartQuadres2(imgName, btn);
        optionsDiv.appendChild(btn);
    });
}

function buildSolidartQuadres2Placeholder(text) {
    const safeText = String(text || 'Imatge no trobada')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
            <rect width="640" height="420" fill="#f8f5f0"/>
            <rect x="48" y="48" width="544" height="324" rx="10" fill="#ffffff" stroke="#d8cbb8" stroke-width="3"/>
            <text x="320" y="198" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#7a4f2b">Imatge no trobada</text>
            <text x="320" y="242" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#8a6b4d">${safeText}</text>
        </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function checkSolidartQuadres2(selectedImg, selectedBtn) {
    const q = solidartQuadres2State.questions[solidartQuadres2State.currentIndex];
    const isCorrect = selectedImg === q.img_correcta;
    const level = solidartQuadres2State.feedbackLevel;

    // Bloquejar clics
    const optionsButtons = document.querySelectorAll('#solidart-quadres2-options > div');
    optionsButtons.forEach(btn => btn.style.pointerEvents = 'none');

    if (level !== 'none') {
        if (level === 'full') {
            optionsButtons.forEach(btn => {
                const img = btn.querySelector('img');
                const src = img.getAttribute('src').split('/').pop();
                if (src === q.img_correcta) {
                    btn.classList.add('border-green-500', 'bg-green-50');
                }
            });
        }

        if (isCorrect) {
            selectedBtn.classList.add('border-green-500', 'bg-green-50');
        } else {
            selectedBtn.classList.add('border-red-500', 'bg-red-50');
        }
    }

    if (isCorrect) solidartQuadres2State.score++;

    const feedbackArea = document.getElementById('solidart-quadres2-feedback-area');
    const feedbackMsg = document.getElementById('solidart-quadres2-feedback-msg');
    feedbackArea.classList.remove('hidden');

    if (isCorrect) {
        feedbackMsg.textContent = "Resposta registrada ✨";
        feedbackMsg.className = "text-xl font-bold mb-2 text-green-600";
    } else {
        feedbackMsg.textContent = "Resposta registrada";
        feedbackMsg.className = "text-xl font-bold mb-2 text-red-600";
    }

    document.getElementById('solidart-quadres2-score-display').textContent = `Punts: ${solidartQuadres2State.score}`;

    scheduleSolidartQuadres2AutoAdvance();
}

function nextSolidartQuadres2() {
    clearSolidartQuadres2AutoAdvance();
    solidartQuadres2State.currentIndex++;
    if (solidartQuadres2State.currentIndex < solidartQuadres2State.questions.length) {
        renderSolidartQuadres2();
    } else {
        finishSolidartQuadres2();
    }
}

function scheduleSolidartQuadres2AutoAdvance() {
    clearSolidartQuadres2AutoAdvance();
    solidartQuadres2State.autoAdvanceTimer = setTimeout(() => {
        solidartQuadres2State.autoAdvanceTimer = null;
        nextSolidartQuadres2();
    }, SOLIDART_QUADRES2_AUTO_ADVANCE_MS);
}

function clearSolidartQuadres2AutoAdvance() {
    if (solidartQuadres2State.autoAdvanceTimer) {
        clearTimeout(solidartQuadres2State.autoAdvanceTimer);
        solidartQuadres2State.autoAdvanceTimer = null;
    }
}

async function finishSolidartQuadres2() {
    document.getElementById('solidart-quadres2-quiz-container').classList.add('hidden');
    const resultsDiv = document.getElementById('solidart-quadres2-results');
    resultsDiv.classList.remove('hidden');

    const total = solidartQuadres2State.questions.length;
    const score = solidartQuadres2State.score;
    const percentage = Math.round((score / total) * 100);

    document.getElementById('solidart-quadres2-final-score').textContent = `${percentage}%`;
    document.getElementById('solidart-quadres2-final-percentage').textContent = `${percentage}%`;

    let msg = "";
    if (percentage === 100) msg = "Perfecte! Veus l'art a tot arreu! 🎨";
    else if (percentage >= 80) msg = "Molt bé! Reconeixes perfectament els estils.";
    else if (percentage >= 50) msg = "Bona feina, segueix observant els detalls.";
    else msg = "Cal fixar-se més en els trets característics de cada autor.";

    document.getElementById('solidart-quadres2-final-msg').textContent = msg;

    const resultData = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: 'SolidArt',
        app: 'Quadres i autors 2',
        nivell: solidartQuadres2State.dificultat,
        puntuacio: percentage,
        temps_segons: Math.round((new Date() - solidartQuadres2State.startTime) / 1000),
        feedback_pos: msg,
        feedback_neg: percentage < 50 ? "Repassa les obres clau de cada corrent." : ""
    };

    try {
        await callApi('saveResult', resultData);
    } catch (e) {
        console.error("Error saving SolidArt 2 results:", e);
    }
}

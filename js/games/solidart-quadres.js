/**
 * SOLIDART: QUADRES I AUTORS
 * Lògica del joc d'endevinar pintures, autors i estils.
 */

let solidartQuadresState = {
    questions: [],
    currentIndex: 0,
    score: 0,
    startTime: null,
    dificultat: '',
    feedbackLevel: 'simple',
    autoAdvanceTimer: null
};

const SOLIDART_QUADRES_AUTO_ADVANCE_MS = 1200;

async function initSolidartQuadres(dificultat) {
    const setupDiv = document.getElementById('solidart-quadres-setup');
    const quizDiv = document.getElementById('solidart-quadres-quiz-container');
    const resultsDiv = document.getElementById('solidart-quadres-results');

    // UI Loading
    setupDiv.classList.add('hidden');
    quizDiv.classList.remove('hidden');
    quizDiv.innerHTML = '<div class="text-center p-10"><div class="loader">Carregant preguntes...</div></div>';
    resultsDiv.classList.add('hidden');

    try {
        const response = await callApi('getSolidartQuadres', { dificultat });

        if (response && response.status === 'success' && response.questions.length > 0) {
            solidartQuadresState = {
                questions: response.questions,
                currentIndex: 0,
                score: 0,
                startTime: new Date(),
                dificultat: dificultat,
                feedbackLevel: document.getElementById('solidart-feedback-level')?.value || 'simple'
            };
            clearSolidartQuadresAutoAdvance();
            if (typeof toggleFullscreen === 'function' && !document.fullscreenElement) {
                toggleFullscreen();
            }
            renderSolidartQuadre();
        } else {
            const errorMsg = response && response.message ? response.message : "No s'han trobat preguntes per a aquesta dificultat.";
            quizDiv.innerHTML = `<div class="alert alert-error">${errorMsg}</div>
                                 <button class="btn-secondary mt-4" onclick="showSolidartMenu()">Tornar</button>`;
        }
    } catch (e) {
        console.error("Error initSolidartQuadres:", e);
        quizDiv.innerHTML = '<div class="alert alert-error">Error de connexió amb el servidor.</div>';
    }
}

function renderSolidartQuadre() {
    const quizDiv = document.getElementById('solidart-quadres-quiz-container');
    // Restaurar estructura original si s'havia sobreescrit pel loader
    quizDiv.innerHTML = `
        <div class="game-panel__stats flex justify-between mb-4">
            <span id="solidart-quadres-progress"></span>
            <span id="solidart-quadres-score-display"></span>
        </div>
        <div class="game-panel__question text-center">
            <div id="solidart-quadres-image-container" class="mb-4 mx-auto" style="width: 100%; max-width: 600px; height: 400px; display: flex; align-items: center; justify-content: center; overflow: hidden; background-color: #f9fafb; border-radius: 8px;">
                <img id="solidart-quadres-img" src="" alt="Obra d'art" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;">
            </div>
            <h4 id="solidart-quadres-text" class="text-xl font-semibold mb-6"></h4>
            <div id="solidart-quadres-options" class="grid grid-cols-2 gap-4"></div>
        </div>
        <div id="solidart-quadres-feedback-area" class="feedback-panel hidden text-center mt-4 p-4 rounded bg-gray-50 border">
            <p id="solidart-quadres-feedback-msg" class="feedback-panel__title text-xl font-bold mb-2"></p>
            <button id="solidart-quadres-next-btn" class="btn-primary hidden" onclick="nextSolidartQuadre()">Següent</button>
        </div>
    `;

    clearSolidartQuadresAutoAdvance();
    const q = solidartQuadresState.questions[solidartQuadresState.currentIndex];

    document.getElementById('solidart-quadres-progress').textContent = `Pregunta ${solidartQuadresState.currentIndex + 1} / ${solidartQuadresState.questions.length}`;
    document.getElementById('solidart-quadres-score-display').textContent = `Punts: ${solidartQuadresState.score}`;

    const img = document.getElementById('solidart-quadres-img');
<<<<<<< HEAD
    img.src = `assets/images/art/${q.imatge}`;
    img.onerror = () => {
        img.src = 'assets/images/ui/placeholder-art.png';
        console.warn(`Imatge no trobada: assets/images/art/${q.imatge}`);
    };
=======
    img.src = `assets/images/activities/solidart/artworks/${q.imatge}`;
    img.onerror = () => {
        img.src = buildSolidartPlaceholder(q.imatge);
        console.warn(`Imatge no trobada: assets/images/activities/solidart/artworks/${q.imatge}`);
    };
>>>>>>> c1a29bccb178cf83c078d0ac2a8ab710a7bcf757

    document.getElementById('solidart-quadres-text').textContent = q.pregunta;

    const optionsDiv = document.getElementById('solidart-quadres-options');
    optionsDiv.innerHTML = '';

    q.opcions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = opt;
        btn.onclick = () => checkSolidartQuadre(opt);
        optionsDiv.appendChild(btn);
    });
}

function buildSolidartPlaceholder(text) {
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

function checkSolidartQuadre(selected) {
    const q = solidartQuadresState.questions[solidartQuadresState.currentIndex];
    const isCorrect = selected === q.resposta_correcta;

    // Disable all buttons
    const buttons = document.querySelectorAll('#solidart-quadres-options button');
    const level = solidartQuadresState.feedbackLevel;

    buttons.forEach(btn => {
        btn.disabled = true;

        if (level === 'none') return; // No colors at all

        if (level === 'full' && btn.textContent === q.resposta_correcta) {
            btn.style.backgroundColor = 'var(--success-bg, #dcfce7)';
            btn.style.borderColor = 'var(--success, #22c55e)';
        }

        if (btn.textContent === selected) {
            if (isCorrect) {
                if (level !== 'none') {
                    btn.style.backgroundColor = 'var(--success-bg, #dcfce7)';
                    btn.style.borderColor = 'var(--success, #22c55e)';
                }
            } else {
                if (level !== 'none') {
                    btn.style.backgroundColor = 'var(--error-bg, #fee2e2)';
                    btn.style.borderColor = 'var(--error, #ef4444)';
                }
            }
        }
    });

    if (isCorrect) {
        solidartQuadresState.score++;
    }

    const feedbackArea = document.getElementById('solidart-quadres-feedback-area');
    const feedbackMsg = document.getElementById('solidart-quadres-feedback-msg');

    feedbackArea.classList.remove('hidden');
    if (isCorrect) {
        feedbackMsg.textContent = "Resposta registrada ✨"; // Changed from "Correcte!" to be more neutral if desired, but "Correcte" is fine too if we just want to hide the ANSWER.
        feedbackMsg.className = "text-xl font-bold mb-2 text-green-600";
    } else {
        feedbackMsg.textContent = "Resposta registrada";
        feedbackMsg.className = "text-xl font-bold mb-2 text-red-600";
    }

    // Update score display immediately
    document.getElementById('solidart-quadres-score-display').textContent = `Punts: ${solidartQuadresState.score}`;

    scheduleSolidartQuadresAutoAdvance();
}

function nextSolidartQuadre() {
    clearSolidartQuadresAutoAdvance();
    solidartQuadresState.currentIndex++;

    if (solidartQuadresState.currentIndex < solidartQuadresState.questions.length) {
        renderSolidartQuadre();
        document.getElementById('solidart-quadres-feedback-area').classList.add('hidden');
    } else {
        finishSolidartQuadres();
    }
}

function scheduleSolidartQuadresAutoAdvance() {
    clearSolidartQuadresAutoAdvance();
    solidartQuadresState.autoAdvanceTimer = setTimeout(() => {
        solidartQuadresState.autoAdvanceTimer = null;
        nextSolidartQuadre();
    }, SOLIDART_QUADRES_AUTO_ADVANCE_MS);
}

function clearSolidartQuadresAutoAdvance() {
    if (solidartQuadresState.autoAdvanceTimer) {
        clearTimeout(solidartQuadresState.autoAdvanceTimer);
        solidartQuadresState.autoAdvanceTimer = null;
    }
}

async function finishSolidartQuadres() {
    document.getElementById('solidart-quadres-quiz-container').classList.add('hidden');
    const resultsDiv = document.getElementById('solidart-quadres-results');
    resultsDiv.classList.remove('hidden');

    const total = solidartQuadresState.questions.length;
    const score = solidartQuadresState.score;
    const percentage = Math.round((score / total) * 100);

    document.getElementById('solidart-quadres-final-score').textContent = `${percentage}%`;
    document.getElementById('solidart-quadres-final-percentage').textContent = `${percentage}%`;

    let msg = "";
    if (percentage === 100) msg = "Perfecte! Ets un expert en art! 🎨";
    else if (percentage >= 80) msg = "Molt bé! Tens un gran coneixement artístic.";
    else if (percentage >= 50) msg = "Bona feina, però encara pots aprendre més sobre aquests autors.";
    else msg = "Continua practicant per millorar la teva cultura visual.";

    document.getElementById('solidart-quadres-final-msg').textContent = msg;

    // Guardar resultats
    const resultData = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: 'SolidArt',
        app: 'Quadres i autors',
        nivell: solidartQuadresState.dificultat,
        puntuacio: percentage,
        temps_segons: Math.round((new Date() - solidartQuadresState.startTime) / 1000),
        feedback_pos: msg,
        feedback_neg: percentage < 50 ? "Cal repassar més els autors i estils." : ""
    };

    try {
        await callApi('saveResult', resultData);
    } catch (e) {
        console.error("Error saving SolidArt results:", e);
    }
}




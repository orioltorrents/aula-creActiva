/**
 * Cakewalk Sonar Interactive Activity
 */

const sonarGame = {
    currentStep: 0,
    score: 100,
    targets: [
        { key: 'act_audio_sec1', x: 0, y: 0, w: 1000, h: 105 },   // Toolbar (Dalt)
        { key: 'act_audio_sec2', x: 0, y: 105, w: 175, h: 426 }, // Inspector (Esquerra)
        { key: 'act_audio_sec3', x: 175, y: 140, w: 590, h: 372 }, // Track View (Centre)
        { key: 'act_audio_sec4', x: 765, y: 140, w: 235, h: 372 }, // Browser (Dreta)
        { key: 'act_audio_q1', x: 308, y: 215, w: 20, h: 20 },  // Arm (R) - Petit, avall i esquerra
        { key: 'act_audio_q2', x: 311, y: 186, w: 26, h: 26 },  // Mute (M)
        { key: 'act_audio_q3', x: 334, y: 186, w: 26, h: 26 },  // Solo (S)
        { key: 'act_audio_q4', x: 555, y: 55, w: 28, h: 28 },   // Main Record
        { key: 'act_audio_q5', x: 768, y: 312, w: 35, h: 20 },  // Audio FX Tab
        { key: 'act_audio_q6', x: 525, y: 55, w: 28, h: 28 },   // Play
        { key: 'act_audio_q7', x: 495, y: 55, w: 28, h: 28 },   // Stop
        { key: 'act_audio_q8', x: 334, y: 211, w: 26, h: 26 },  // Write (W)
        { key: 'act_audio_q9', x: 185, y: 512, w: 55, h: 18 }   // Consola tab
    ],
    isFinished: false,
    debugMode: true // Permet calibració en temps real
};

function initSonarGame() {
    sonarGame.currentStep = 0;
    sonarGame.score = 100;
    sonarGame.isFinished = false;
    updateSonarUI();

    const img = document.getElementById('sonar-image');
    if (img) {
        img.onclick = handleSonarClick;
    }
}

function updateSonarUI() {
    const questionEl = document.getElementById('sonar-question');
    const feedbackEl = document.getElementById('sonar-feedback');
    const scoreEl = document.getElementById('sonar-score-display');
    const skipBtn = document.getElementById('sonar-skip-btn');
    const helpBtn = document.getElementById('sonar-help-btn');
    const calibrationUI = document.getElementById('sonar-calibration-ui');

    if (scoreEl) scoreEl.innerText = i18n.t('score_label') + sonarGame.score;

    if (sonarGame.isFinished) {
        questionEl.innerText = i18n.t('act_audio_finished');
        feedbackEl.innerText = '';
        if (skipBtn) skipBtn.classList.add('hidden');
        if (helpBtn) helpBtn.classList.add('hidden');
        if (calibrationUI) calibrationUI.classList.add('hidden');
        return;
    }

    if (skipBtn) skipBtn.classList.remove('hidden');
    if (helpBtn) helpBtn.classList.remove('hidden');

    const currentTarget = sonarGame.targets[sonarGame.currentStep];
    questionEl.innerText = i18n.t(currentTarget.key);
}

function showSonarHelp() {
    if (sonarGame.isFinished) return;

    // Penalització només si no estem en debug
    if (!sonarGame.debugMode) {
        sonarGame.score = Math.max(0, sonarGame.score - 10);
        updateSonarUI();
    }

    const target = sonarGame.targets[sonarGame.currentStep];
    renderHelpHint(target);

    // Mostra la interfície de calibratge
    const calibrationUI = document.getElementById('sonar-calibration-ui');
    if (calibrationUI) {
        calibrationUI.classList.remove('hidden');
        updateCalibrationDisplay();
    }
}

function renderHelpHint(target) {
    // Eliminar existent
    const existing = document.querySelector('.sonar-help-hint');
    if (existing) existing.remove();

    const img = document.getElementById('sonar-image');
    const wrapper = img.parentElement;

    const hint = document.createElement('div');
    hint.className = 'sonar-help-hint';

    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 531;

    const scaleX = rect.width / logicalWidth;
    const scaleY = rect.height / logicalHeight;

    hint.style.left = (target.x * scaleX) + 'px';
    hint.style.top = (target.y * scaleY) + 'px';
    hint.style.width = (target.w * scaleX) + 'px';
    hint.style.height = (target.h * scaleY) + 'px';

    wrapper.appendChild(hint);

    // Auto-eliminar si NO estem en debug
    if (!sonarGame.debugMode) {
        setTimeout(() => {
            if (hint.parentElement) {
                hint.parentElement.removeChild(hint);
            }
        }, 2500);
    }
}

function nudgeTarget(axis, delta) {
    const target = sonarGame.targets[sonarGame.currentStep];
    target[axis] += delta;
    renderHelpHint(target);
    updateCalibrationDisplay();
    console.log(`Calibració [${target.key}]: x:${target.x}, y:${target.y}, w:${target.w}, h:${target.h}`);
}

function updateCalibrationDisplay() {
    const target = sonarGame.targets[sonarGame.currentStep];
    const display = document.getElementById('calibration-values');
    if (display) {
        display.innerText = `x:${target.x} y:${target.y} w:${target.w} h:${target.h}`;
    }
}

function closeCalibration() {
    const calibrationUI = document.getElementById('sonar-calibration-ui');
    const hint = document.querySelector('.sonar-help-hint');
    if (calibrationUI) calibrationUI.classList.add('hidden');
    if (hint) hint.remove();
}

function skipQuestion() {
    if (sonarGame.isFinished) return;
    sonarGame.score = Math.max(0, sonarGame.score - 5);
    nextStep();
}

function nextStep() {
    sonarGame.currentStep++;
    if (sonarGame.currentStep >= sonarGame.targets.length) {
        sonarGame.isFinished = true;
        saveSonarResult();
    }
    updateSonarUI();
}

function handleSonarClick(event) {
    if (sonarGame.isFinished) return;

    const img = event.target;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 531;

    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const target = sonarGame.targets[sonarGame.currentStep];
    const feedbackEl = document.getElementById('sonar-feedback');

    if (clickX >= target.x && clickX <= target.x + target.w &&
        clickY >= target.y && clickY <= target.y + target.h) {

        feedbackEl.innerText = i18n.t('act_audio_feedback_correct');
        feedbackEl.style.color = 'green';

        setTimeout(() => {
            feedbackEl.innerText = '';
            nextStep();
        }, 1000);
    } else {
        feedbackEl.innerText = i18n.t('act_audio_feedback_incorrect');
        feedbackEl.style.color = 'red';
        sonarGame.score = Math.max(0, sonarGame.score - 1);
        updateSonarUI();
    }
}

async function saveSonarResult() {
    if (typeof state === 'undefined' || !state.user) return;

    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject.titol,
        app: 'Cakewalk Sonar',
        nivell: 'Identificació de controls',
        puntuacio: sonarGame.score,
        temps_segons: 0,
        feedback_pos: 'Excel·lent identificació de la interfície',
        feedback_neg: ''
    };

    await callApi('saveResult', result);
}

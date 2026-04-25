/**
 * Radio Sound Board (Taula de So) Interactive Activity
 */

const radioBoardGame = {
    currentStep: 0,
    score: 100,
    targets: [
        { key: 'act_radio_q1', x: 100, y: 100, w: 50, h: 50 },  // Gain
        { key: 'act_radio_q2', x: 200, y: 100, w: 50, h: 50 },  // High
        { key: 'act_radio_q3', x: 300, y: 100, w: 50, h: 50 },  // Mid
        { key: 'act_radio_q4', x: 400, y: 100, w: 50, h: 50 },  // Low
        { key: 'act_radio_q5', x: 500, y: 100, w: 50, h: 50 },  // Aux
        { key: 'act_radio_q6', x: 600, y: 100, w: 50, h: 50 },  // FX
        { key: 'act_radio_q7', x: 700, y: 100, w: 50, h: 50 },  // Pan
        { key: 'act_radio_q8', x: 800, y: 100, w: 50, h: 50 },  // Mute
        { key: 'act_radio_q9', x: 900, y: 100, w: 50, h: 50 },  // PFL
        { key: 'act_radio_q10', x: 100, y: 200, w: 50, h: 50 }, // Main
        { key: 'act_radio_q11', x: 200, y: 200, w: 50, h: 50 }, // G1/G2
        { key: 'act_radio_q12', x: 300, y: 200, w: 50, h: 50 }, // Master
        { key: 'act_radio_q13', x: 400, y: 200, w: 50, h: 50 }, // Phones
        { key: 'act_radio_q14', x: 500, y: 200, w: 50, h: 50 }, // PC/USB
        { key: 'act_radio_q15', x: 600, y: 200, w: 50, h: 50 }  // BT/MP3
    ],
    isFinished: false,
    debugMode: false // Permet calibració en temps real (Canviar a true per editar)
};

function initRadioBoardGame() {
    radioBoardGame.currentStep = 0;
    radioBoardGame.score = 100;
    radioBoardGame.isFinished = false;
    updateRadioBoardUI();

    const img = document.getElementById('radio-board-image');
    if (img) {
        img.onclick = handleRadioBoardClick;
    }
}

function updateRadioBoardUI() {
    const questionEl = document.getElementById('radio-board-question');
    const feedbackEl = document.getElementById('radio-board-feedback');
    const scoreEl = document.getElementById('radio-board-score-display');
    const skipBtn = document.getElementById('radio-board-skip-btn');
    const helpBtn = document.getElementById('radio-board-help-btn');
    const calibrationUI = document.getElementById('radio-board-calibration-ui');

    if (scoreEl) scoreEl.innerText = i18n.t('score') + ": " + radioBoardGame.score;

    if (radioBoardGame.isFinished) {
        questionEl.innerText = i18n.t('act_radio_finished');
        feedbackEl.innerText = '';
        if (skipBtn) skipBtn.classList.add('hidden');
        if (helpBtn) helpBtn.classList.add('hidden');
        if (calibrationUI) calibrationUI.classList.add('hidden');
        return;
    }

    if (skipBtn) skipBtn.classList.remove('hidden');
    if (helpBtn) helpBtn.classList.remove('hidden');

    const currentTarget = radioBoardGame.targets[radioBoardGame.currentStep];
    questionEl.innerText = i18n.t(currentTarget.key);
}

function showRadioBoardHelp() {
    if (radioBoardGame.isFinished) return;

    if (!radioBoardGame.debugMode) {
        radioBoardGame.score = Math.max(0, radioBoardGame.score - 10);
        updateRadioBoardUI();
    }

    const target = radioBoardGame.targets[radioBoardGame.currentStep];
    renderRadioBoardHelpHint(target);

    // Mostra la interfície de calibratge (només en mode depuració)
    const calibrationUI = document.getElementById('radio-board-calibration-ui');
    if (calibrationUI && radioBoardGame.debugMode) {
        calibrationUI.classList.remove('hidden');
        updateRadioBoardCalibrationDisplay();
    }

}

function renderRadioBoardHelpHint(target) {
    const existing = document.querySelector('.radio-board-help-hint');
    if (existing) existing.remove();

    const img = document.getElementById('radio-board-image');
    const wrapper = img.parentElement;

    const hint = document.createElement('div');
    hint.className = 'radio-board-help-hint';
    hint.style.position = 'absolute';
    hint.style.border = '2px solid red';
    hint.style.backgroundColor = 'rgba(255,0,0,0.3)';
    hint.style.pointerEvents = 'none';
    hint.style.zIndex = '10';

    const rect = img.getBoundingClientRect();
    // Use natural dimensions or a fixed logical scale
    const logicalWidth = 1000;
    const logicalHeight = 1000;

    const scaleX = rect.width / logicalWidth;
    const scaleY = rect.height / logicalHeight;

    hint.style.left = (target.x * scaleX) + 'px';
    hint.style.top = (target.y * scaleY) + 'px';
    hint.style.width = (target.w * scaleX) + 'px';
    hint.style.height = (target.h * scaleY) + 'px';

    wrapper.appendChild(hint);

    if (!radioBoardGame.debugMode) {
        setTimeout(() => {
            if (hint.parentElement) hint.remove();
        }, 2500);
    }
}

function nudgeRadioTarget(axis, delta) {
    const target = radioBoardGame.targets[radioBoardGame.currentStep];
    target[axis] += delta;
    renderRadioBoardHelpHint(target);
    updateRadioBoardCalibrationDisplay();
}

function updateRadioBoardCalibrationDisplay() {
    const target = radioBoardGame.targets[radioBoardGame.currentStep];
    const display = document.getElementById('radio-board-calibration-values');
    if (display) {
        display.innerText = `x:${target.x} y:${target.y} w:${target.w} h:${target.h}`;
    }
}

function closeRadioBoardCalibration() {
    const calibrationUI = document.getElementById('radio-board-calibration-ui');
    const hint = document.querySelector('.radio-board-help-hint');
    if (calibrationUI) calibrationUI.classList.add('hidden');
    if (hint) hint.remove();
}

function skipRadioBoardQuestion() {
    if (radioBoardGame.isFinished) return;
    radioBoardGame.score = Math.max(0, radioBoardGame.score - 5);
    nextRadioBoardStep();
}

function nextRadioBoardStep() {
    radioBoardGame.currentStep++;
    if (radioBoardGame.currentStep >= radioBoardGame.targets.length) {
        radioBoardGame.isFinished = true;
        saveRadioBoardResult();
    }
    updateRadioBoardUI();
}

function handleRadioBoardClick(event) {
    if (radioBoardGame.isFinished) return;

    const img = event.target;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;

    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const target = radioBoardGame.targets[radioBoardGame.currentStep];
    const feedbackEl = document.getElementById('radio-board-feedback');

    if (clickX >= target.x && clickX <= target.x + target.w &&
        clickY >= target.y && clickY <= target.y + target.h) {

        feedbackEl.innerText = i18n.t('act_radio_feedback_correct');
        feedbackEl.style.color = 'green';

        setTimeout(() => {
            feedbackEl.innerText = '';
            nextRadioBoardStep();
        }, 1000);
    } else {
        feedbackEl.innerText = i18n.t('act_radio_feedback_incorrect');
        feedbackEl.style.color = 'red';
        radioBoardGame.score = Math.max(0, radioBoardGame.score - 1);
        updateRadioBoardUI();
    }
}

async function saveRadioBoardResult() {
    if (typeof state === 'undefined' || !state.user) return;

    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject.titol,
        app: 'Taula de So',
        nivell: 'Identificació de controls',
        puntuacio: radioBoardGame.score,
        temps_segons: 0,
        feedback_pos: 'Molt bon coneixement dels controls de la taula',
        feedback_neg: ''
    };

    await callApi('saveResult', result);
}

/**
 * Human Heart (El Cor Humà) Interactive Activity
 */

const bioHeartGame = {
    currentStep: 0,
    score: 100,
    targets: [
        { key: 'act_heart_q1', x: 400, y: 450, w: 80, h: 80 },  // Aurícula Dreta
        { key: 'act_heart_q2', x: 550, y: 350, w: 80, h: 80 },  // Aurícula Esquerra
        { key: 'act_heart_q3', x: 400, y: 600, w: 100, h: 100 }, // Ventricle Dret
        { key: 'act_heart_q4', x: 550, y: 600, w: 100, h: 100 }, // Ventricle Esquerre
        { key: 'act_heart_q5', x: 500, y: 200, w: 80, h: 80 },   // Aorta
        { key: 'act_heart_q6', x: 450, y: 150, w: 60, h: 60 },   // Vena Cava Sup
        { key: 'act_heart_q7', x: 450, y: 800, w: 60, h: 60 },   // Vena Cava Inf
        { key: 'act_heart_q8', x: 400, y: 300, w: 80, h: 80 },   // Arteria Pulmonar
        { key: 'act_heart_q9', x: 650, y: 400, w: 60, h: 60 },   // Venes Pulmonars
        { key: 'act_heart_q10', x: 430, y: 530, w: 50, h: 50 },  // Vàlvula Tricúspide
        { key: 'act_heart_q11', x: 570, y: 480, w: 50, h: 50 }   // Vàlvula Mitral
    ],
    isFinished: false,
    debugMode: true // Permet calibració en temps real
};

function initBioHeartGame() {
    bioHeartGame.currentStep = 0;
    bioHeartGame.score = 100;
    bioHeartGame.isFinished = false;
    updateBioHeartUI();

    const img = document.getElementById('bio-heart-image');
    if (img) {
        img.onclick = handleBioHeartClick;
    }
}

function updateBioHeartUI() {
    const questionEl = document.getElementById('bio-heart-question');
    const feedbackEl = document.getElementById('bio-heart-feedback');
    const scoreEl = document.getElementById('bio-heart-score-display');
    const skipBtn = document.getElementById('bio-heart-skip-btn');
    const helpBtn = document.getElementById('bio-heart-help-btn');
    const calibrationUI = document.getElementById('bio-heart-calibration-ui');

    if (scoreEl) scoreEl.innerText = i18n.t('score') + ": " + bioHeartGame.score;

    if (bioHeartGame.isFinished) {
        questionEl.innerText = i18n.t('act_heart_finished');
        feedbackEl.innerText = '';
        if (skipBtn) skipBtn.classList.add('hidden');
        if (helpBtn) helpBtn.classList.add('hidden');
        if (calibrationUI) calibrationUI.classList.add('hidden');
        return;
    }

    if (skipBtn) skipBtn.classList.remove('hidden');
    if (helpBtn) helpBtn.classList.remove('hidden');

    const currentTarget = bioHeartGame.targets[bioHeartGame.currentStep];
    questionEl.innerText = i18n.t(currentTarget.key);
}

function showBioHeartHelp() {
    if (bioHeartGame.isFinished) return;

    if (!bioHeartGame.debugMode) {
        bioHeartGame.score = Math.max(0, bioHeartGame.score - 10);
        updateBioHeartUI();
    }

    const target = bioHeartGame.targets[bioHeartGame.currentStep];
    renderBioHeartHelpHint(target);

    // Mostra la interfície de calibratge
    const calibrationUI = document.getElementById('bio-heart-calibration-ui');
    if (calibrationUI) {
        calibrationUI.classList.remove('hidden');
        updateBioHeartCalibrationDisplay();
    }
}

function renderBioHeartHelpHint(target) {
    const existing = document.querySelector('.bio-heart-help-hint');
    if (existing) existing.remove();

    const img = document.getElementById('bio-heart-image');
    const wrapper = img.parentElement;

    const hint = document.createElement('div');
    hint.className = 'bio-heart-help-hint';
    hint.style.position = 'absolute';
    hint.style.border = '2px solid red';
    hint.style.backgroundColor = 'rgba(255,0,0,0.3)';
    hint.style.pointerEvents = 'none';
    hint.style.zIndex = '10';

    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;

    const scaleX = rect.width / logicalWidth;
    const scaleY = rect.height / logicalHeight;

    hint.style.left = (target.x * scaleX) + 'px';
    hint.style.top = (target.y * scaleY) + 'px';
    hint.style.width = (target.w * scaleX) + 'px';
    hint.style.height = (target.h * scaleY) + 'px';

    wrapper.appendChild(hint);

    if (!bioHeartGame.debugMode) {
        setTimeout(() => {
            if (hint.parentElement) hint.remove();
        }, 2500);
    }
}

function nudgeBioHeartTarget(axis, delta) {
    const target = bioHeartGame.targets[bioHeartGame.currentStep];
    target[axis] += delta;
    renderBioHeartHelpHint(target);
    updateBioHeartCalibrationDisplay();
}

function updateBioHeartCalibrationDisplay() {
    const target = bioHeartGame.targets[bioHeartGame.currentStep];
    const display = document.getElementById('bio-heart-calibration-values');
    if (display) {
        display.innerText = `x:${target.x} y:${target.y} w:${target.w} h:${target.h}`;
    }
}

function closeBioHeartCalibration() {
    const calibrationUI = document.getElementById('bio-heart-calibration-ui');
    const hint = document.querySelector('.bio-heart-help-hint');
    if (calibrationUI) calibrationUI.classList.add('hidden');
    if (hint) hint.remove();
}

function skipBioHeartQuestion() {
    if (bioHeartGame.isFinished) return;
    bioHeartGame.score = Math.max(0, bioHeartGame.score - 5);
    nextBioHeartStep();
}

function nextBioHeartStep() {
    bioHeartGame.currentStep++;
    if (bioHeartGame.currentStep >= bioHeartGame.targets.length) {
        bioHeartGame.isFinished = true;
        saveBioHeartResult();
    }
    updateBioHeartUI();
}

function handleBioHeartClick(event) {
    if (bioHeartGame.isFinished) return;

    const img = event.target;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;

    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const target = bioHeartGame.targets[bioHeartGame.currentStep];
    const feedbackEl = document.getElementById('bio-heart-feedback');

    if (clickX >= target.x && clickX <= target.x + target.w &&
        clickY >= target.y && clickY <= target.y + target.h) {

        feedbackEl.innerText = i18n.t('act_heart_feedback_correct');
        feedbackEl.style.color = 'green';

        setTimeout(() => {
            feedbackEl.innerText = '';
            nextBioHeartStep();
        }, 1000);
    } else {
        feedbackEl.innerText = i18n.t('act_heart_feedback_incorrect');
        feedbackEl.style.color = 'red';
        bioHeartGame.score = Math.max(0, bioHeartGame.score - 1);
        updateBioHeartUI();
    }
}

async function saveBioHeartResult() {
    if (typeof state === 'undefined' || !state.user) return;

    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject.titol,
        app: 'El Cor Humà',
        nivell: 'Anatomia bàsica',
        puntuacio: bioHeartGame.score,
        temps_segons: 0,
        feedback_pos: 'Molt bona identificació de les parts del cor.',
        feedback_neg: ''
    };

    await callApi('saveResult', result);
}

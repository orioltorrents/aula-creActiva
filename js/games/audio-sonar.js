/**
 * Cakewalk Sonar Interactive Activity
 */

const sonarGame = {
    currentStep: 0,
    score: 100,
    targets: [
        { key: 'act_audio_q1', x: 315, y: 435, w: 22, h: 22 }, // Arm (R)
        { key: 'act_audio_q2', x: 315, y: 395, w: 22, h: 22 }, // Mute (M)
        { key: 'act_audio_q3', x: 338, y: 395, w: 22, h: 22 }, // Solo (S)
        { key: 'act_audio_q4', x: 572, y: 225, w: 25, h: 25 }, // Main Record (Transport)
        { key: 'act_audio_q5', x: 768, y: 312, w: 35, h: 20 }, // Audio FX Tab
        { key: 'act_audio_q6', x: 538, y: 225, w: 25, h: 25 }, // Play (Transport)
        { key: 'act_audio_q7', x: 504, y: 225, w: 25, h: 25 }, // Stop (Transport)
        { key: 'act_audio_q8', x: 338, y: 435, w: 22, h: 22 }, // Write (W)
        { key: 'act_audio_q9', x: 200, y: 975, w: 60, h: 20 }  // Consola tab (bottom) - x/y might need check
    ],
    isFinished: false
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

    if (scoreEl) scoreEl.innerText = i18n.t('score_label') + sonarGame.score;

    if (sonarGame.isFinished) {
        questionEl.innerText = i18n.t('act_audio_finished');
        feedbackEl.innerText = '';
        if (skipBtn) skipBtn.classList.add('hidden');
        return;
    }

    if (skipBtn) skipBtn.classList.remove('hidden');

    const currentTarget = sonarGame.targets[sonarGame.currentStep];
    questionEl.innerText = i18n.t(currentTarget.key);
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

    // Scale click to matches image's logical resolution
    // Let's assume logical resolution is 1000px width based on provided image
    const logicalWidth = 1000;
    const logicalHeight = 531;

    // We use naturalWidth/Height to be more precise if browser loaded it
    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    // DEBUG: console.log(`Click at: ${clickX.toFixed(0)}, ${clickY.toFixed(0)}`);

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
        sonarGame.score = Math.max(0, sonarGame.score - 1); // Small penalty for wrong click
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
        puntuacio: 10,
        temps_segons: 0, // Podríem mesurar-lo
        feedback_pos: 'Excel·lent identificació de la interfície',
        feedback_neg: ''
    };

    await callApi('saveResult', result);
}

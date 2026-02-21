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
        { key: 'act_audio_q1', x: 311, y: 213, w: 22, h: 22 },  // Arm (R) - Pista 1
        { key: 'act_audio_q2', x: 311, y: 188, w: 22, h: 22 },  // Mute (M) - Pista 1
        { key: 'act_audio_q3', x: 334, y: 188, w: 22, h: 22 },  // Solo (S) - Pista 1
        { key: 'act_audio_q4', x: 555, y: 55, w: 25, h: 25 },   // Main Record (Transport)
        { key: 'act_audio_q5', x: 768, y: 312, w: 35, h: 20 },  // Audio FX Tab
        { key: 'act_audio_q6', x: 525, y: 55, w: 27, h: 25 },   // Play (Transport)
        { key: 'act_audio_q7', x: 495, y: 55, w: 25, h: 25 },   // Stop (Transport)
        { key: 'act_audio_q8', x: 334, y: 213, w: 22, h: 22 },  // Write (W) - Pista 1
        { key: 'act_audio_q9', x: 185, y: 512, w: 55, h: 18 }   // Consola tab
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
    const helpBtn = document.getElementById('sonar-help-btn');

    if (scoreEl) scoreEl.innerText = i18n.t('score_label') + sonarGame.score;

    if (sonarGame.isFinished) {
        questionEl.innerText = i18n.t('act_audio_finished');
        feedbackEl.innerText = '';
        if (skipBtn) skipBtn.classList.add('hidden');
        if (helpBtn) helpBtn.classList.add('hidden');
        return;
    }

    if (skipBtn) skipBtn.classList.remove('hidden');
    if (helpBtn) helpBtn.classList.remove('hidden');

    const currentTarget = sonarGame.targets[sonarGame.currentStep];
    questionEl.innerText = i18n.t(currentTarget.key);
}

function showSonarHelp() {
    if (sonarGame.isFinished) return;

    // Penalty
    sonarGame.score = Math.max(0, sonarGame.score - 10);
    updateSonarUI();

    const target = sonarGame.targets[sonarGame.currentStep];
    const img = document.getElementById('sonar-image');
    const wrapper = img.parentElement;

    // Create hint element
    const hint = document.createElement('div');
    hint.className = 'sonar-help-hint';

    // Calculate relative position based on current image size
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

    // Remove after 2.5 seconds
    setTimeout(() => {
        if (hint.parentElement) {
            hint.parentElement.removeChild(hint);
        }
    }, 2500);
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

    // Scale click to matches image's logical resolution (1000x531)
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

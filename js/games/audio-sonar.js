/**
 * Cakewalk Sonar Interactive Activity
 */

const sonarGame = {
    currentStep: 0,
    score: 100,
    targets: [
        { key: 'act_audio_sec1', x: 7, y: 35, w: 986, h: 100 },  // Toolbar/Transport top
        { key: 'act_audio_sec2', x: 7, y: 140, w: 165, h: 360 }, // Inspector
        { key: 'act_audio_sec3', x: 175, y: 140, w: 585, h: 360 }, // Track View
        { key: 'act_audio_sec4', x: 765, y: 140, w: 228, h: 360 }, // Browser
        { key: 'act_audio_q1', x: 315, y: 435, w: 22, h: 22 }, // Arm (R)
        { key: 'act_audio_q2', x: 315, y: 395, w: 22, h: 22 }, // Mute (M)
        { key: 'act_audio_q3', x: 338, y: 395, w: 22, h: 22 }, // Solo (S)
        { key: 'act_audio_q4', x: 572, y: 225, w: 25, h: 25 }, // Main Record (Transport)
        { key: 'act_audio_q5', x: 768, y: 312, w: 35, h: 20 }, // Audio FX Tab
        { key: 'act_audio_q6', x: 538, y: 225, w: 25, h: 25 }, // Play (Transport)
        { key: 'act_audio_q7', x: 504, y: 225, w: 25, h: 25 }, // Stop (Transport)
        { key: 'act_audio_q8', x: 338, y: 435, w: 22, h: 22 }, // Write (W)
        { key: 'act_audio_q9', x: 180, y: 512, w: 50, h: 18 }  // Consola tab
    ],
    isFinished: false,
    debugMode: false
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

    // DEBUG mode: show coordinates
    if (sonarGame.debugMode) {
        console.log(`Click at: ${clickX.toFixed(0)}, ${clickY.toFixed(0)}`);
        const coordDisplay = document.getElementById('sonar-coord-display');
        if (coordDisplay) {
            coordDisplay.innerText = `Click: x=${clickX.toFixed(0)}, y=${clickY.toFixed(0)}`;
        }
    }

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

// ============ DEBUG HELPERS ============

function toggleSonarDebugMode() {
    sonarGame.debugMode = !sonarGame.debugMode;
    const btn = document.getElementById('sonar-debug-btn');
    if (btn) {
        btn.innerText = sonarGame.debugMode ? '🔧 Debug: ON' : '🔧 Debug: OFF';
        btn.style.backgroundColor = sonarGame.debugMode ? '#10b981' : '#6b7280';
    }

    if (sonarGame.debugMode) {
        drawDebugOverlay();
    } else {
        removeDebugOverlay();
    }
}

function drawDebugOverlay() {
    removeDebugOverlay(); // Clear existing overlay

    const wrapper = document.querySelector('.image-interactive-wrapper');
    const img = document.getElementById('sonar-image');
    if (!wrapper || !img) return;

    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 531;

    const scaleX = rect.width / logicalWidth;
    const scaleY = rect.height / logicalHeight;

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'sonar-debug-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '10';

    // Draw each target
    sonarGame.targets.forEach((target, index) => {
        const box = document.createElement('div');
        box.className = 'debug-box';
        box.style.position = 'absolute';
        box.style.left = (target.x * scaleX) + 'px';
        box.style.top = (target.y * scaleY) + 'px';
        box.style.width = (target.w * scaleX) + 'px';
        box.style.height = (target.h * scaleY) + 'px';
        box.style.border = '2px solid #ef4444';
        box.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        box.style.boxSizing = 'border-box';

        // Label
        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.top = '-20px';
        label.style.left = '0';
        label.style.fontSize = '11px';
        label.style.fontWeight = 'bold';
        label.style.color = '#ef4444';
        label.style.backgroundColor = 'white';
        label.style.padding = '2px 4px';
        label.style.borderRadius = '3px';
        label.style.whiteSpace = 'nowrap';
        label.innerText = `${index}: ${target.key}`;

        box.appendChild(label);
        overlay.appendChild(box);
    });

    wrapper.appendChild(overlay);

    // Add coordinate display
    let coordDisplay = document.getElementById('sonar-coord-display');
    if (!coordDisplay) {
        coordDisplay = document.createElement('div');
        coordDisplay.id = 'sonar-coord-display';
        coordDisplay.style.marginTop = '10px';
        coordDisplay.style.padding = '8px';
        coordDisplay.style.backgroundColor = '#f3f4f6';
        coordDisplay.style.borderRadius = '4px';
        coordDisplay.style.fontFamily = 'monospace';
        coordDisplay.style.fontSize = '12px';
        coordDisplay.innerText = 'Clica sobre la imatge per veure coordenades';
        wrapper.parentElement.appendChild(coordDisplay);
    }
}

function removeDebugOverlay() {
    const overlay = document.getElementById('sonar-debug-overlay');
    if (overlay) overlay.remove();

    const coordDisplay = document.getElementById('sonar-coord-display');
    if (coordDisplay) coordDisplay.remove();
}

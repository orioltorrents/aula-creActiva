/**
 * Joc de la Gust - Senyalar Parts
 */

const bioGustPartsGame = {
    currentStep: 0,
    score: 100,
    sessionQuestions: [],
    allQuestions: [
        { key: 'act_gust_zone_acid', x: 200, y: 200, w: 100, h: 100 },
        { key: 'act_gust_zone_dolc', x: 300, y: 300, w: 100, h: 100 },
        { key: 'act_gust_zone_salat', x: 400, y: 400, w: 100, h: 100 },
        { key: 'act_gust_zone_amarg', x: 500, y: 500, w: 100, h: 100 },
        { key: 'act_gust_zone_umami', x: 600, y: 600, w: 100, h: 100 }
    ],
    isFinished: false,
    debugMode: false
};

function initBioGustPartsGame() {
    bioGustPartsGame.currentStep = 0;
    bioGustPartsGame.score = 100;
    bioGustPartsGame.isFinished = false;
    bioGustPartsGame.debugMode = typeof isAdminUser === 'function' ? isAdminUser() : false;

    const img = document.getElementById('bio-gust-parts-image');
    img.src = 'assets/images/biologia/sentit-gust.png';

    const shuffled = [...bioGustPartsGame.allQuestions].sort(() => 0.5 - Math.random());
    const uniqueKeys = new Set();
    bioGustPartsGame.sessionQuestions = [];

    for (let q of shuffled) {
        if (!uniqueKeys.has(q.key)) {
            uniqueKeys.add(q.key);
            bioGustPartsGame.sessionQuestions.push(q);
        }
    }

    document.getElementById('bio-gust-parts-ui').classList.remove('hidden');
    updateBioGustPartsUI();

    if (img) {
        img.onclick = handleBioGustPartsClick;
    }
}

function updateBioGustPartsUI() {
    const questionEl = document.getElementById('bio-gust-parts-question');
    const feedbackEl = document.getElementById('bio-gust-parts-feedback');
    const scoreEl = document.getElementById('bio-gust-parts-score-display');
    const skipBtn = document.getElementById('bio-gust-parts-skip-btn');
    const helpBtn = document.getElementById('bio-gust-parts-help-btn');
    const calibrationUI = document.getElementById('bio-gust-parts-calibration-ui');

    if (scoreEl) scoreEl.innerText = i18n.t('score') + ": " + bioGustPartsGame.score;

    if (bioGustPartsGame.isFinished) {
        questionEl.innerText = i18n.t('act_gust_parts_finished') || 'Heu identificat totes les parts!';
        feedbackEl.innerText = '';
        if (skipBtn) skipBtn.classList.add('hidden');
        if (helpBtn) helpBtn.classList.add('hidden');
        if (calibrationUI) calibrationUI.classList.add('hidden');
        return;
    }

    if (skipBtn) skipBtn.classList.remove('hidden');
    if (helpBtn) helpBtn.classList.remove('hidden');
    if (calibrationUI && !bioGustPartsGame.debugMode) calibrationUI.classList.add('hidden');

    const currentTarget = bioGustPartsGame.sessionQuestions[bioGustPartsGame.currentStep];
    const translatedTarget = i18n.t(currentTarget.key) !== currentTarget.key ? i18n.t(currentTarget.key) : currentTarget.key;

    questionEl.innerText = `(${bioGustPartsGame.currentStep + 1}/${bioGustPartsGame.sessionQuestions.length}) Trobeu la zona corresponent a: ${translatedTarget}`;
}

function showBioGustPartsHelp() {
    if (bioGustPartsGame.isFinished) return;

    bioGustPartsGame.score = Math.max(0, bioGustPartsGame.score - 10);
    updateBioGustPartsUI();

    const target = bioGustPartsGame.sessionQuestions[bioGustPartsGame.currentStep];
    renderBioGustPartsHelpHint(target);

    const calibrationUI = document.getElementById('bio-gust-parts-calibration-ui');
    if (calibrationUI && bioGustPartsGame.debugMode) {
        calibrationUI.classList.remove('hidden');
        updateBioGustPartsCalibrationDisplay();
    }
}

function renderBioGustPartsHelpHint(target) {
    const existings = document.querySelectorAll('.bio-gust-parts-help-hint');
    existings.forEach(el => el.remove());

    const img = document.getElementById('bio-gust-parts-image');
    if (!img) return;

    const wrapper = img.parentElement;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;
    const scaleX = rect.width / logicalWidth;
    const scaleY = rect.height / logicalHeight;

    const matchingTargets = bioGustPartsGame.allQuestions.filter(q => q.key === target.key);

    matchingTargets.forEach(t => {
        const hint = document.createElement('div');
        hint.className = 'bio-gust-parts-help-hint';
        hint.style.position = 'absolute';
        hint.style.border = '2px solid red';
        hint.style.backgroundColor = 'rgba(255,0,0,0.3)';
        hint.style.pointerEvents = 'none';
        hint.style.zIndex = '10';

        hint.style.left = (img.offsetLeft + t.x * scaleX) + 'px';
        hint.style.top = (img.offsetTop + t.y * scaleY) + 'px';
        hint.style.width = (t.w * scaleX) + 'px';
        hint.style.height = (t.h * scaleY) + 'px';

        wrapper.appendChild(hint);
    });

    if (!bioGustPartsGame.debugMode) {
        setTimeout(() => {
            const currentHints = document.querySelectorAll('.bio-gust-parts-help-hint');
            currentHints.forEach(el => el.remove());
        }, 2500);
    }
}

function nudgeBioGustPartsTarget(axis, delta) {
    const target = bioGustPartsGame.sessionQuestions[bioGustPartsGame.currentStep];
    target[axis] += delta;
    renderBioGustPartsHelpHint(target);
    updateBioGustPartsCalibrationDisplay();
}

function updateBioGustPartsCalibrationDisplay() {
    const target = bioGustPartsGame.sessionQuestions[bioGustPartsGame.currentStep];
    const display = document.getElementById('bio-gust-parts-calibration-values');
    if (display) {
        display.innerText = `x:${target.x} y:${target.y} w:${target.w} h:${target.h}`;
    }
}

function closeBioGustPartsCalibration() {
    const calibrationUI = document.getElementById('bio-gust-parts-calibration-ui');
    const hints = document.querySelectorAll('.bio-gust-parts-help-hint');
    if (calibrationUI) calibrationUI.classList.add('hidden');
    hints.forEach(el => el.remove());
}

function exportBioGustPartsConfig() {
    const currentTarget = bioGustPartsGame.sessionQuestions[bioGustPartsGame.currentStep];
    const originalIndex = bioGustPartsGame.allQuestions.findIndex(q => q.key === currentTarget.key);
    if (originalIndex !== -1) {
        bioGustPartsGame.allQuestions[originalIndex] = { ...currentTarget };
    }
    const code = JSON.stringify(bioGustPartsGame.allQuestions, null, 4);
    console.log("NOVA CONFIGURACIÓ PER A bio-gust-parts.js:");
    console.log(code);
    const textArea = document.createElement("textarea");
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert("Codi copiat al portapapers!");
    } catch (err) {
        prompt("Copia aquest codi:", code);
    }
    document.body.removeChild(textArea);
}

function skipBioGustPartsQuestion() {
    if (bioGustPartsGame.isFinished) return;
    bioGustPartsGame.score = Math.max(0, bioGustPartsGame.score - 5);
    nextBioGustPartsStep();
}

function nextBioGustPartsStep() {
    bioGustPartsGame.currentStep++;
    if (bioGustPartsGame.currentStep >= bioGustPartsGame.sessionQuestions.length) {
        bioGustPartsGame.isFinished = true;
        saveBioGustPartsResult();
    }
    updateBioGustPartsUI();
}

function handleBioGustPartsClick(event) {
    if (bioGustPartsGame.isFinished) return;

    const hints = document.querySelectorAll('.bio-gust-parts-help-hint');
    hints.forEach(el => el.remove());

    const img = event.target;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;
    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const currentTarget = bioGustPartsGame.sessionQuestions[bioGustPartsGame.currentStep];
    const feedbackEl = document.getElementById('bio-gust-parts-feedback');
    const matchingTargets = bioGustPartsGame.allQuestions.filter(q => q.key === currentTarget.key);
    let hit = false;

    for (let t of matchingTargets) {
        if (clickX >= t.x && clickX <= t.x + t.w && clickY >= t.y && clickY <= t.y + t.h) {
            hit = true;
            break;
        }
    }

    if (hit) {
        feedbackEl.innerText = i18n.t('act_gust_parts_feedback_correct') || 'Correcte!';
        feedbackEl.style.color = 'green';
        setTimeout(() => {
            feedbackEl.innerText = '';
            nextBioGustPartsStep();
        }, 1000);
    } else {
        feedbackEl.innerText = i18n.t('act_gust_parts_feedback_incorrect') || 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'red';
        bioGustPartsGame.score = Math.max(0, bioGustPartsGame.score - 10);
        updateBioGustPartsUI();
    }
}

async function saveBioGustPartsResult() {
    if (typeof state === 'undefined' || !state.user) return;
    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
        app: 'Les Zones del Gust',
        nivell: 'Anatomia de la Llengua',
        puntuacio: bioGustPartsGame.score,
        temps_segons: 0,
        feedback_pos: 'Bona feina component la Gust.',
        feedback_neg: ''
    };
    if (typeof callApi === 'function') {
        await callApi('saveResult', result);
    }
}

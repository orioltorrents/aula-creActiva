/**
 * Joc de la Vista - Senyalar Parts
 */

const bioVistaPartsGame = {
    currentStep: 0,
    score: 100,
    sessionQuestions: [],
    allQuestions: [
        { key: 'act_vista_part_cornea', x: 200, y: 500, w: 50, h: 50 },
        { key: 'act_vista_part_pupilla', x: 300, y: 500, w: 50, h: 50 },
        { key: 'act_vista_part_iris', x: 160, y: 335, w: 40, h: 330 },
        { key: 'act_vista_part_cristalli', x: 400, y: 500, w: 50, h: 50 },
        { key: 'act_vista_part_retina', x: 800, y: 500, w: 50, h: 50 },
        { key: 'act_vista_part_nervi', x: 900, y: 500, w: 50, h: 50 }
    ],
    isFinished: false,
    debugMode: false
};

function initBioVistaPartsGame() {
    bioVistaPartsGame.currentStep = 0;
    bioVistaPartsGame.score = 100;
    bioVistaPartsGame.isFinished = false;
    bioVistaPartsGame.debugMode = typeof isAdminUser === 'function' ? isAdminUser() : false;

    const img = document.getElementById('bio-vista-parts-image');
<<<<<<< HEAD
    img.src = 'assets/images/biologia/sentit-vista.png'; 
=======
    img.src = 'assets/images/activities/biologia/senses/sentit-vista.png'; 
>>>>>>> c1a29bccb178cf83c078d0ac2a8ab710a7bcf757

    const shuffled = [...bioVistaPartsGame.allQuestions].sort(() => 0.5 - Math.random());
    const uniqueKeys = new Set();
    bioVistaPartsGame.sessionQuestions = [];

    for (let q of shuffled) {
        if (!uniqueKeys.has(q.key)) {
            uniqueKeys.add(q.key);
            bioVistaPartsGame.sessionQuestions.push(q);
        }
    }

    document.getElementById('bio-vista-parts-ui').classList.remove('hidden');
    updateBioVistaPartsUI();

    if (img) {
        img.onclick = handleBioVistaPartsClick;
    }
}

function updateBioVistaPartsUI() {
    const questionEl = document.getElementById('bio-vista-parts-question');
    const feedbackEl = document.getElementById('bio-vista-parts-feedback');
    const scoreEl = document.getElementById('bio-vista-parts-score-display');
    const skipBtn = document.getElementById('bio-vista-parts-skip-btn');
    const helpBtn = document.getElementById('bio-vista-parts-help-btn');
    const calibrationUI = document.getElementById('bio-vista-parts-calibration-ui');

    if (scoreEl) scoreEl.innerText = i18n.t('score') + ": " + bioVistaPartsGame.score;

    if (bioVistaPartsGame.isFinished) {
        questionEl.innerText = i18n.t('act_vista_parts_finished') || 'Heu identificat totes les parts!';
        feedbackEl.innerText = '';
        if (skipBtn) skipBtn.classList.add('hidden');
        if (helpBtn) helpBtn.classList.add('hidden');
        if (calibrationUI) calibrationUI.classList.add('hidden');
        return;
    }

    if (skipBtn) skipBtn.classList.remove('hidden');
    if (helpBtn) helpBtn.classList.remove('hidden');
    if (calibrationUI && !bioVistaPartsGame.debugMode) calibrationUI.classList.add('hidden');

    const currentTarget = bioVistaPartsGame.sessionQuestions[bioVistaPartsGame.currentStep];
    const translatedTarget = i18n.t(currentTarget.key) !== currentTarget.key ? i18n.t(currentTarget.key) : currentTarget.key;

    questionEl.innerText = `(${bioVistaPartsGame.currentStep + 1}/${bioVistaPartsGame.sessionQuestions.length}) Trobeu la zona corresponent a: ${translatedTarget}`;
}

function showBioVistaPartsHelp() {
    if (bioVistaPartsGame.isFinished) return;

    bioVistaPartsGame.score = Math.max(0, bioVistaPartsGame.score - 10);
    updateBioVistaPartsUI();

    const target = bioVistaPartsGame.sessionQuestions[bioVistaPartsGame.currentStep];
    renderBioVistaPartsHelpHint(target);

    const calibrationUI = document.getElementById('bio-vista-parts-calibration-ui');
    if (calibrationUI && bioVistaPartsGame.debugMode) {
        calibrationUI.classList.remove('hidden');
        updateBioVistaPartsCalibrationDisplay();
    }
}

function renderBioVistaPartsHelpHint(target) {
    const existings = document.querySelectorAll('.bio-vista-parts-help-hint');
    existings.forEach(el => el.remove());

    const img = document.getElementById('bio-vista-parts-image');
    if (!img) return; 

    const wrapper = img.parentElement;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;
    const scaleX = rect.width / logicalWidth;
    const scaleY = rect.height / logicalHeight;

    const matchingTargets = bioVistaPartsGame.allQuestions.filter(q => q.key === target.key);

    matchingTargets.forEach(t => {
        const hint = document.createElement('div');
        hint.className = 'bio-vista-parts-help-hint';
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

    if (!bioVistaPartsGame.debugMode) {
        setTimeout(() => {
            const currentHints = document.querySelectorAll('.bio-vista-parts-help-hint');
            currentHints.forEach(el => el.remove());
        }, 2500);
    }
}

function nudgeBioVistaPartsTarget(axis, delta) {
    const target = bioVistaPartsGame.sessionQuestions[bioVistaPartsGame.currentStep];
    target[axis] += delta;
    renderBioVistaPartsHelpHint(target);
    updateBioVistaPartsCalibrationDisplay();
}

function updateBioVistaPartsCalibrationDisplay() {
    const target = bioVistaPartsGame.sessionQuestions[bioVistaPartsGame.currentStep];
    const display = document.getElementById('bio-vista-parts-calibration-values');
    if (display) {
        display.innerText = `x:${target.x} y:${target.y} w:${target.w} h:${target.h}`;
    }
}

function closeBioVistaPartsCalibration() {
    const calibrationUI = document.getElementById('bio-vista-parts-calibration-ui');
    const hints = document.querySelectorAll('.bio-vista-parts-help-hint');
    if (calibrationUI) calibrationUI.classList.add('hidden');
    hints.forEach(el => el.remove());
}

function exportBioVistaPartsConfig() {
    const currentTarget = bioVistaPartsGame.sessionQuestions[bioVistaPartsGame.currentStep];
    const originalIndex = bioVistaPartsGame.allQuestions.findIndex(q => q.key === currentTarget.key);
    if (originalIndex !== -1) {
        bioVistaPartsGame.allQuestions[originalIndex] = { ...currentTarget };
    }
    const code = JSON.stringify(bioVistaPartsGame.allQuestions, null, 4);
    console.log("NOVA CONFIGURACIÓ PER A bio-vista-parts.js:");
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

function skipBioVistaPartsQuestion() {
    if (bioVistaPartsGame.isFinished) return;
    bioVistaPartsGame.score = Math.max(0, bioVistaPartsGame.score - 5);
    nextBioVistaPartsStep();
}

function nextBioVistaPartsStep() {
    bioVistaPartsGame.currentStep++;
    if (bioVistaPartsGame.currentStep >= bioVistaPartsGame.sessionQuestions.length) {
        bioVistaPartsGame.isFinished = true;
        saveBioVistaPartsResult();
    }
    updateBioVistaPartsUI();
}

function handleBioVistaPartsClick(event) {
    if (bioVistaPartsGame.isFinished) return;

    const hints = document.querySelectorAll('.bio-vista-parts-help-hint');
    hints.forEach(el => el.remove());

    const img = event.target;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;
    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const currentTarget = bioVistaPartsGame.sessionQuestions[bioVistaPartsGame.currentStep];
    const feedbackEl = document.getElementById('bio-vista-parts-feedback');
    const matchingTargets = bioVistaPartsGame.allQuestions.filter(q => q.key === currentTarget.key);
    let hit = false;

    for (let t of matchingTargets) {
        if (clickX >= t.x && clickX <= t.x + t.w && clickY >= t.y && clickY <= t.y + t.h) {
            hit = true;
            break;
        }
    }

    if (hit) {
        feedbackEl.innerText = i18n.t('act_vista_parts_feedback_correct') || 'Correcte!';
        feedbackEl.style.color = 'green';
        setTimeout(() => {
            feedbackEl.innerText = '';
            nextBioVistaPartsStep();
        }, 1000);
    } else {
        feedbackEl.innerText = i18n.t('act_vista_parts_feedback_incorrect') || 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'red';
        bioVistaPartsGame.score = Math.max(0, bioVistaPartsGame.score - 10);
        updateBioVistaPartsUI();
    }
}

async function saveBioVistaPartsResult() {
    if (typeof state === 'undefined' || !state.user) return;
    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
        app: 'Anatomia de la Vista',
        nivell: 'Parts de l\'ull',
        puntuacio: bioVistaPartsGame.score,
        temps_segons: 0,
        feedback_pos: 'Bona feina component la Vista.',
        feedback_neg: ''
    };
    if (typeof callApi === 'function') {
        await callApi('saveResult', result);
    }
}

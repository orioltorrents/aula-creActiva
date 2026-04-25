/**
 * Joc de la Olfacte - Senyalar Parts
 */

const bioOlfactePartsGame = {
    currentStep: 0,
    score: 100,
    sessionQuestions: [],
    allQuestions: [
        { key: 'act_olfacte_part_cornea', x: 200, y: 500, w: 50, h: 50 },
        { key: 'act_olfacte_part_pupilla', x: 300, y: 500, w: 50, h: 50 },
        { key: 'act_olfacte_part_iris', x: 300, y: 400, w: 50, h: 50 },
        { key: 'act_olfacte_part_cristalli', x: 400, y: 500, w: 50, h: 50 },
        { key: 'act_olfacte_part_retina', x: 800, y: 500, w: 50, h: 50 },
        { key: 'act_olfacte_part_nervi', x: 900, y: 500, w: 50, h: 50 }
    ],
    isFinished: false,
    debugMode: true
};

function initBioOlfactePartsGame() {
    bioOlfactePartsGame.currentStep = 0;
    bioOlfactePartsGame.score = 100;
    bioOlfactePartsGame.isFinished = false;

    const img = document.getElementById('bio-olfacte-parts-image');
    img.src = 'assets/images/sentit-olfacte.png'; 

    const shuffled = [...bioOlfactePartsGame.allQuestions].sort(() => 0.5 - Math.random());
    const uniqueKeys = new Set();
    bioOlfactePartsGame.sessionQuestions = [];

    for (let q of shuffled) {
        if (!uniqueKeys.has(q.key)) {
            uniqueKeys.add(q.key);
            bioOlfactePartsGame.sessionQuestions.push(q);
        }
    }

    document.getElementById('bio-olfacte-parts-ui').classList.remove('hidden');
    updateBioOlfactePartsUI();

    if (img) {
        img.onclick = handleBioOlfactePartsClick;
    }
}

function updateBioOlfactePartsUI() {
    const questionEl = document.getElementById('bio-olfacte-parts-question');
    const feedbackEl = document.getElementById('bio-olfacte-parts-feedback');
    const scoreEl = document.getElementById('bio-olfacte-parts-score-display');
    const skipBtn = document.getElementById('bio-olfacte-parts-skip-btn');
    const helpBtn = document.getElementById('bio-olfacte-parts-help-btn');
    const calibrationUI = document.getElementById('bio-olfacte-parts-calibration-ui');

    if (scoreEl) scoreEl.innerText = i18n.t('score') + ": " + bioOlfactePartsGame.score;

    if (bioOlfactePartsGame.isFinished) {
        questionEl.innerText = i18n.t('act_olfacte_parts_finished') || 'Heu identificat totes les parts!';
        feedbackEl.innerText = '';
        if (skipBtn) skipBtn.classList.add('hidden');
        if (helpBtn) helpBtn.classList.add('hidden');
        if (calibrationUI) calibrationUI.classList.add('hidden');
        return;
    }

    const isAdmin = state && state.user && state.user.rol && state.user.rol.toLowerCase().includes('admin');
    const isProfe = state && state.user && state.user.rol && state.user.rol.toLowerCase().includes('profe');

    if (skipBtn) skipBtn.classList.remove('hidden');
    if (helpBtn) {
        if (isProfe || isAdmin) helpBtn.classList.remove('hidden');
        else helpBtn.classList.add('hidden');
    }

    const currentTarget = bioOlfactePartsGame.sessionQuestions[bioOlfactePartsGame.currentStep];
    const translatedTarget = i18n.t(currentTarget.key) !== currentTarget.key ? i18n.t(currentTarget.key) : currentTarget.key;

    questionEl.innerText = `(${bioOlfactePartsGame.currentStep + 1}/${bioOlfactePartsGame.sessionQuestions.length}) Trobeu la zona corresponent a: ${translatedTarget}`;
}

function showBioOlfactePartsHelp() {
    if (bioOlfactePartsGame.isFinished) return;

    bioOlfactePartsGame.score = Math.max(0, bioOlfactePartsGame.score - 10);
    updateBioOlfactePartsUI();

    const target = bioOlfactePartsGame.sessionQuestions[bioOlfactePartsGame.currentStep];
    renderBioOlfactePartsHelpHint(target);

    const calibrationUI = document.getElementById('bio-olfacte-parts-calibration-ui');
    const isAdmin = state && state.user && state.user.rol && state.user.rol.toLowerCase().includes('admin');
    if (calibrationUI && isAdmin) {
        calibrationUI.classList.remove('hidden');
        updateBioOlfactePartsCalibrationDisplay();
    }
}

function renderBioOlfactePartsHelpHint(target) {
    const existings = document.querySelectorAll('.bio-olfacte-parts-help-hint');
    existings.forEach(el => el.remove());

    const img = document.getElementById('bio-olfacte-parts-image');
    if (!img) return; 

    const wrapper = img.parentElement;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;
    const scaleX = rect.width / logicalWidth;
    const scaleY = rect.height / logicalHeight;

    const matchingTargets = bioOlfactePartsGame.allQuestions.filter(q => q.key === target.key);

    matchingTargets.forEach(t => {
        const hint = document.createElement('div');
        hint.className = 'bio-olfacte-parts-help-hint';
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

    const isAdmin = state && state.user && state.user.rol && state.user.rol.toLowerCase().includes('admin');
    if (!isAdmin) {
        setTimeout(() => {
            const currentHints = document.querySelectorAll('.bio-olfacte-parts-help-hint');
            currentHints.forEach(el => el.remove());
        }, 2500);
    }
}

function nudgeBioOlfactePartsTarget(axis, delta) {
    const target = bioOlfactePartsGame.sessionQuestions[bioOlfactePartsGame.currentStep];
    target[axis] += delta;
    renderBioOlfactePartsHelpHint(target);
    updateBioOlfactePartsCalibrationDisplay();
}

function updateBioOlfactePartsCalibrationDisplay() {
    const target = bioOlfactePartsGame.sessionQuestions[bioOlfactePartsGame.currentStep];
    const display = document.getElementById('bio-olfacte-parts-calibration-values');
    if (display) {
        display.innerText = `x:${target.x} y:${target.y} w:${target.w} h:${target.h}`;
    }
}

function closeBioOlfactePartsCalibration() {
    const calibrationUI = document.getElementById('bio-olfacte-parts-calibration-ui');
    const hints = document.querySelectorAll('.bio-olfacte-parts-help-hint');
    if (calibrationUI) calibrationUI.classList.add('hidden');
    hints.forEach(el => el.remove());
}

function exportBioOlfactePartsConfig() {
    const currentTarget = bioOlfactePartsGame.sessionQuestions[bioOlfactePartsGame.currentStep];
    const originalIndex = bioOlfactePartsGame.allQuestions.findIndex(q => q.key === currentTarget.key);
    if (originalIndex !== -1) {
        bioOlfactePartsGame.allQuestions[originalIndex] = { ...currentTarget };
    }
    const code = JSON.stringify(bioOlfactePartsGame.allQuestions, null, 4);
    console.log("NOVA CONFIGURACIÓ PER A bio-olfacte-parts.js:");
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

function skipBioOlfactePartsQuestion() {
    if (bioOlfactePartsGame.isFinished) return;
    bioOlfactePartsGame.score = Math.max(0, bioOlfactePartsGame.score - 5);
    nextBioOlfactePartsStep();
}

function nextBioOlfactePartsStep() {
    bioOlfactePartsGame.currentStep++;
    if (bioOlfactePartsGame.currentStep >= bioOlfactePartsGame.sessionQuestions.length) {
        bioOlfactePartsGame.isFinished = true;
        saveBioOlfactePartsResult();
    }
    updateBioOlfactePartsUI();
}

function handleBioOlfactePartsClick(event) {
    if (bioOlfactePartsGame.isFinished) return;

    const hints = document.querySelectorAll('.bio-olfacte-parts-help-hint');
    hints.forEach(el => el.remove());

    const img = event.target;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;
    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const currentTarget = bioOlfactePartsGame.sessionQuestions[bioOlfactePartsGame.currentStep];
    const feedbackEl = document.getElementById('bio-olfacte-parts-feedback');
    const matchingTargets = bioOlfactePartsGame.allQuestions.filter(q => q.key === currentTarget.key);
    let hit = false;

    for (let t of matchingTargets) {
        if (clickX >= t.x && clickX <= t.x + t.w && clickY >= t.y && clickY <= t.y + t.h) {
            hit = true;
            break;
        }
    }

    if (hit) {
        feedbackEl.innerText = i18n.t('act_olfacte_parts_feedback_correct') || 'Correcte!';
        feedbackEl.style.color = 'green';
        setTimeout(() => {
            feedbackEl.innerText = '';
            nextBioOlfactePartsStep();
        }, 1000);
    } else {
        feedbackEl.innerText = i18n.t('act_olfacte_parts_feedback_incorrect') || 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'red';
        bioOlfactePartsGame.score = Math.max(0, bioOlfactePartsGame.score - 10);
        updateBioOlfactePartsUI();
    }
}

async function saveBioOlfactePartsResult() {
    if (typeof state === 'undefined' || !state.user) return;
    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
        app: 'Anatomia de la Olfacte',
        nivell: 'Parts de l\'ull',
        puntuacio: bioOlfactePartsGame.score,
        temps_segons: 0,
        feedback_pos: 'Bona feina component la Olfacte.',
        feedback_neg: ''
    };
    if (typeof callApi === 'function') {
        await callApi('saveResult', result);
    }
}

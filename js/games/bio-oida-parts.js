/**
 * Joc de la Oida - Senyalar Parts
 */

const bioOidaPartsGame = {
    currentStep: 0,
    score: 100,
    sessionQuestions: [],
    allQuestions: [
        { key: 'act_oida_part_cornea', x: 200, y: 500, w: 50, h: 50 },
        { key: 'act_oida_part_pupilla', x: 300, y: 500, w: 50, h: 50 },
        { key: 'act_oida_part_iris', x: 300, y: 400, w: 50, h: 50 },
        { key: 'act_oida_part_cristalli', x: 400, y: 500, w: 50, h: 50 },
        { key: 'act_oida_part_retina', x: 800, y: 500, w: 50, h: 50 },
        { key: 'act_oida_part_nervi', x: 900, y: 500, w: 50, h: 50 }
    ],
    isFinished: false,
    debugMode: true
};

function initBioOidaPartsGame() {
    bioOidaPartsGame.currentStep = 0;
    bioOidaPartsGame.score = 100;
    bioOidaPartsGame.isFinished = false;

    const img = document.getElementById('bio-oida-parts-image');
    img.src = 'assets/images/sentit-oida.png'; 

    const shuffled = [...bioOidaPartsGame.allQuestions].sort(() => 0.5 - Math.random());
    const uniqueKeys = new Set();
    bioOidaPartsGame.sessionQuestions = [];

    for (let q of shuffled) {
        if (!uniqueKeys.has(q.key)) {
            uniqueKeys.add(q.key);
            bioOidaPartsGame.sessionQuestions.push(q);
        }
    }

    document.getElementById('bio-oida-parts-ui').classList.remove('hidden');
    updateBioOidaPartsUI();

    if (img) {
        img.onclick = handleBioOidaPartsClick;
    }
}

function updateBioOidaPartsUI() {
    const questionEl = document.getElementById('bio-oida-parts-question');
    const feedbackEl = document.getElementById('bio-oida-parts-feedback');
    const scoreEl = document.getElementById('bio-oida-parts-score-display');
    const skipBtn = document.getElementById('bio-oida-parts-skip-btn');
    const helpBtn = document.getElementById('bio-oida-parts-help-btn');
    const calibrationUI = document.getElementById('bio-oida-parts-calibration-ui');

    if (scoreEl) scoreEl.innerText = i18n.t('score') + ": " + bioOidaPartsGame.score;

    if (bioOidaPartsGame.isFinished) {
        questionEl.innerText = i18n.t('act_oida_parts_finished') || 'Heu identificat totes les parts!';
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

    const currentTarget = bioOidaPartsGame.sessionQuestions[bioOidaPartsGame.currentStep];
    const translatedTarget = i18n.t(currentTarget.key) !== currentTarget.key ? i18n.t(currentTarget.key) : currentTarget.key;

    questionEl.innerText = `(${bioOidaPartsGame.currentStep + 1}/${bioOidaPartsGame.sessionQuestions.length}) Trobeu la zona corresponent a: ${translatedTarget}`;
}

function showBioOidaPartsHelp() {
    if (bioOidaPartsGame.isFinished) return;

    bioOidaPartsGame.score = Math.max(0, bioOidaPartsGame.score - 10);
    updateBioOidaPartsUI();

    const target = bioOidaPartsGame.sessionQuestions[bioOidaPartsGame.currentStep];
    renderBioOidaPartsHelpHint(target);

    const calibrationUI = document.getElementById('bio-oida-parts-calibration-ui');
    const isAdmin = state && state.user && state.user.rol && state.user.rol.toLowerCase().includes('admin');
    if (calibrationUI && isAdmin) {
        calibrationUI.classList.remove('hidden');
        updateBioOidaPartsCalibrationDisplay();
    }
}

function renderBioOidaPartsHelpHint(target) {
    const existings = document.querySelectorAll('.bio-oida-parts-help-hint');
    existings.forEach(el => el.remove());

    const img = document.getElementById('bio-oida-parts-image');
    if (!img) return; 

    const wrapper = img.parentElement;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;
    const scaleX = rect.width / logicalWidth;
    const scaleY = rect.height / logicalHeight;

    const matchingTargets = bioOidaPartsGame.allQuestions.filter(q => q.key === target.key);

    matchingTargets.forEach(t => {
        const hint = document.createElement('div');
        hint.className = 'bio-oida-parts-help-hint';
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
            const currentHints = document.querySelectorAll('.bio-oida-parts-help-hint');
            currentHints.forEach(el => el.remove());
        }, 2500);
    }
}

function nudgeBioOidaPartsTarget(axis, delta) {
    const target = bioOidaPartsGame.sessionQuestions[bioOidaPartsGame.currentStep];
    target[axis] += delta;
    renderBioOidaPartsHelpHint(target);
    updateBioOidaPartsCalibrationDisplay();
}

function updateBioOidaPartsCalibrationDisplay() {
    const target = bioOidaPartsGame.sessionQuestions[bioOidaPartsGame.currentStep];
    const display = document.getElementById('bio-oida-parts-calibration-values');
    if (display) {
        display.innerText = `x:${target.x} y:${target.y} w:${target.w} h:${target.h}`;
    }
}

function closeBioOidaPartsCalibration() {
    const calibrationUI = document.getElementById('bio-oida-parts-calibration-ui');
    const hints = document.querySelectorAll('.bio-oida-parts-help-hint');
    if (calibrationUI) calibrationUI.classList.add('hidden');
    hints.forEach(el => el.remove());
}

function exportBioOidaPartsConfig() {
    const currentTarget = bioOidaPartsGame.sessionQuestions[bioOidaPartsGame.currentStep];
    const originalIndex = bioOidaPartsGame.allQuestions.findIndex(q => q.key === currentTarget.key);
    if (originalIndex !== -1) {
        bioOidaPartsGame.allQuestions[originalIndex] = { ...currentTarget };
    }
    const code = JSON.stringify(bioOidaPartsGame.allQuestions, null, 4);
    console.log("NOVA CONFIGURACIÓ PER A bio-oida-parts.js:");
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

function skipBioOidaPartsQuestion() {
    if (bioOidaPartsGame.isFinished) return;
    bioOidaPartsGame.score = Math.max(0, bioOidaPartsGame.score - 5);
    nextBioOidaPartsStep();
}

function nextBioOidaPartsStep() {
    bioOidaPartsGame.currentStep++;
    if (bioOidaPartsGame.currentStep >= bioOidaPartsGame.sessionQuestions.length) {
        bioOidaPartsGame.isFinished = true;
        saveBioOidaPartsResult();
    }
    updateBioOidaPartsUI();
}

function handleBioOidaPartsClick(event) {
    if (bioOidaPartsGame.isFinished) return;

    const hints = document.querySelectorAll('.bio-oida-parts-help-hint');
    hints.forEach(el => el.remove());

    const img = event.target;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;
    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const currentTarget = bioOidaPartsGame.sessionQuestions[bioOidaPartsGame.currentStep];
    const feedbackEl = document.getElementById('bio-oida-parts-feedback');
    const matchingTargets = bioOidaPartsGame.allQuestions.filter(q => q.key === currentTarget.key);
    let hit = false;

    for (let t of matchingTargets) {
        if (clickX >= t.x && clickX <= t.x + t.w && clickY >= t.y && clickY <= t.y + t.h) {
            hit = true;
            break;
        }
    }

    if (hit) {
        feedbackEl.innerText = i18n.t('act_oida_parts_feedback_correct') || 'Correcte!';
        feedbackEl.style.color = 'green';
        setTimeout(() => {
            feedbackEl.innerText = '';
            nextBioOidaPartsStep();
        }, 1000);
    } else {
        feedbackEl.innerText = i18n.t('act_oida_parts_feedback_incorrect') || 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'red';
        bioOidaPartsGame.score = Math.max(0, bioOidaPartsGame.score - 10);
        updateBioOidaPartsUI();
    }
}

async function saveBioOidaPartsResult() {
    if (typeof state === 'undefined' || !state.user) return;
    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
        app: 'Anatomia de la Oida',
        nivell: 'Parts de l\'ull',
        puntuacio: bioOidaPartsGame.score,
        temps_segons: 0,
        feedback_pos: 'Bona feina component la Oida.',
        feedback_neg: ''
    };
    if (typeof callApi === 'function') {
        await callApi('saveResult', result);
    }
}

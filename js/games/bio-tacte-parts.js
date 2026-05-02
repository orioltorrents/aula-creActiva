/**
 * Joc de la Tacte - Senyalar Parts
 */

const bioTactePartsGame = {
    currentStep: 0,
    score: 100,
    sessionQuestions: [],
    allQuestions: [
        { key: 'act_tacte_part_cornea', x: 200, y: 500, w: 50, h: 50 },
        { key: 'act_tacte_part_pupilla', x: 300, y: 500, w: 50, h: 50 },
        { key: 'act_tacte_part_iris', x: 300, y: 400, w: 50, h: 50 },
        { key: 'act_tacte_part_cristalli', x: 400, y: 500, w: 50, h: 50 },
        { key: 'act_tacte_part_retina', x: 800, y: 500, w: 50, h: 50 },
        { key: 'act_tacte_part_nervi', x: 900, y: 500, w: 50, h: 50 }
    ],
    isFinished: false,
    debugMode: false
};

function initBioTactePartsGame() {
    bioTactePartsGame.currentStep = 0;
    bioTactePartsGame.score = 100;
    bioTactePartsGame.isFinished = false;
    bioTactePartsGame.debugMode = typeof isAdminUser === 'function' ? isAdminUser() : false;

    const img = document.getElementById('bio-tacte-parts-image');
<<<<<<< HEAD
    img.src = 'assets/images/biologia/sentit-tacte.png'; 
=======
    img.src = 'assets/images/activities/biologia/senses/sentit-tacte.png'; 
>>>>>>> c1a29bccb178cf83c078d0ac2a8ab710a7bcf757

    const shuffled = [...bioTactePartsGame.allQuestions].sort(() => 0.5 - Math.random());
    const uniqueKeys = new Set();
    bioTactePartsGame.sessionQuestions = [];

    for (let q of shuffled) {
        if (!uniqueKeys.has(q.key)) {
            uniqueKeys.add(q.key);
            bioTactePartsGame.sessionQuestions.push(q);
        }
    }

    document.getElementById('bio-tacte-parts-ui').classList.remove('hidden');
    updateBioTactePartsUI();

    if (img) {
        img.onclick = handleBioTactePartsClick;
    }
}

function updateBioTactePartsUI() {
    const questionEl = document.getElementById('bio-tacte-parts-question');
    const feedbackEl = document.getElementById('bio-tacte-parts-feedback');
    const scoreEl = document.getElementById('bio-tacte-parts-score-display');
    const skipBtn = document.getElementById('bio-tacte-parts-skip-btn');
    const helpBtn = document.getElementById('bio-tacte-parts-help-btn');
    const calibrationUI = document.getElementById('bio-tacte-parts-calibration-ui');

    if (scoreEl) scoreEl.innerText = i18n.t('score') + ": " + bioTactePartsGame.score;

    if (bioTactePartsGame.isFinished) {
        questionEl.innerText = i18n.t('act_tacte_parts_finished') || 'Heu identificat totes les parts!';
        feedbackEl.innerText = '';
        if (skipBtn) skipBtn.classList.add('hidden');
        if (helpBtn) helpBtn.classList.add('hidden');
        if (calibrationUI) calibrationUI.classList.add('hidden');
        return;
    }

    const isAdmin = typeof isAdminUser === 'function' ? isAdminUser() : false;
    const isProfe = typeof isTeacherUser === 'function' ? isTeacherUser() : false;

    if (skipBtn) skipBtn.classList.remove('hidden');
    if (helpBtn) {
        if (isProfe || isAdmin) helpBtn.classList.remove('hidden');
        else helpBtn.classList.add('hidden');
    }
    if (calibrationUI && !isAdmin) calibrationUI.classList.add('hidden');

    const currentTarget = bioTactePartsGame.sessionQuestions[bioTactePartsGame.currentStep];
    const translatedTarget = i18n.t(currentTarget.key) !== currentTarget.key ? i18n.t(currentTarget.key) : currentTarget.key;

    questionEl.innerText = `(${bioTactePartsGame.currentStep + 1}/${bioTactePartsGame.sessionQuestions.length}) Trobeu la zona corresponent a: ${translatedTarget}`;
}

function showBioTactePartsHelp() {
    if (bioTactePartsGame.isFinished) return;

    bioTactePartsGame.score = Math.max(0, bioTactePartsGame.score - 10);
    updateBioTactePartsUI();

    const target = bioTactePartsGame.sessionQuestions[bioTactePartsGame.currentStep];
    renderBioTactePartsHelpHint(target);

    const calibrationUI = document.getElementById('bio-tacte-parts-calibration-ui');
    const isAdmin = typeof isAdminUser === 'function' ? isAdminUser() : false;
    if (calibrationUI && isAdmin) {
        calibrationUI.classList.remove('hidden');
        updateBioTactePartsCalibrationDisplay();
    }
}

function renderBioTactePartsHelpHint(target) {
    const existings = document.querySelectorAll('.bio-tacte-parts-help-hint');
    existings.forEach(el => el.remove());

    const img = document.getElementById('bio-tacte-parts-image');
    if (!img) return; 

    const wrapper = img.parentElement;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;
    const scaleX = rect.width / logicalWidth;
    const scaleY = rect.height / logicalHeight;

    const matchingTargets = bioTactePartsGame.allQuestions.filter(q => q.key === target.key);

    matchingTargets.forEach(t => {
        const hint = document.createElement('div');
        hint.className = 'bio-tacte-parts-help-hint';
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

    const isAdmin = typeof isAdminUser === 'function' ? isAdminUser() : false;
    if (!isAdmin) {
        setTimeout(() => {
            const currentHints = document.querySelectorAll('.bio-tacte-parts-help-hint');
            currentHints.forEach(el => el.remove());
        }, 2500);
    }
}

function nudgeBioTactePartsTarget(axis, delta) {
    const target = bioTactePartsGame.sessionQuestions[bioTactePartsGame.currentStep];
    target[axis] += delta;
    renderBioTactePartsHelpHint(target);
    updateBioTactePartsCalibrationDisplay();
}

function updateBioTactePartsCalibrationDisplay() {
    const target = bioTactePartsGame.sessionQuestions[bioTactePartsGame.currentStep];
    const display = document.getElementById('bio-tacte-parts-calibration-values');
    if (display) {
        display.innerText = `x:${target.x} y:${target.y} w:${target.w} h:${target.h}`;
    }
}

function closeBioTactePartsCalibration() {
    const calibrationUI = document.getElementById('bio-tacte-parts-calibration-ui');
    const hints = document.querySelectorAll('.bio-tacte-parts-help-hint');
    if (calibrationUI) calibrationUI.classList.add('hidden');
    hints.forEach(el => el.remove());
}

function exportBioTactePartsConfig() {
    const currentTarget = bioTactePartsGame.sessionQuestions[bioTactePartsGame.currentStep];
    const originalIndex = bioTactePartsGame.allQuestions.findIndex(q => q.key === currentTarget.key);
    if (originalIndex !== -1) {
        bioTactePartsGame.allQuestions[originalIndex] = { ...currentTarget };
    }
    const code = JSON.stringify(bioTactePartsGame.allQuestions, null, 4);
    console.log("NOVA CONFIGURACIÓ PER A bio-tacte-parts.js:");
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

function skipBioTactePartsQuestion() {
    if (bioTactePartsGame.isFinished) return;
    bioTactePartsGame.score = Math.max(0, bioTactePartsGame.score - 5);
    nextBioTactePartsStep();
}

function nextBioTactePartsStep() {
    bioTactePartsGame.currentStep++;
    if (bioTactePartsGame.currentStep >= bioTactePartsGame.sessionQuestions.length) {
        bioTactePartsGame.isFinished = true;
        saveBioTactePartsResult();
    }
    updateBioTactePartsUI();
}

function handleBioTactePartsClick(event) {
    if (bioTactePartsGame.isFinished) return;

    const hints = document.querySelectorAll('.bio-tacte-parts-help-hint');
    hints.forEach(el => el.remove());

    const img = event.target;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;
    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const currentTarget = bioTactePartsGame.sessionQuestions[bioTactePartsGame.currentStep];
    const feedbackEl = document.getElementById('bio-tacte-parts-feedback');
    const matchingTargets = bioTactePartsGame.allQuestions.filter(q => q.key === currentTarget.key);
    let hit = false;

    for (let t of matchingTargets) {
        if (clickX >= t.x && clickX <= t.x + t.w && clickY >= t.y && clickY <= t.y + t.h) {
            hit = true;
            break;
        }
    }

    if (hit) {
        feedbackEl.innerText = i18n.t('act_tacte_parts_feedback_correct') || 'Correcte!';
        feedbackEl.style.color = 'green';
        setTimeout(() => {
            feedbackEl.innerText = '';
            nextBioTactePartsStep();
        }, 1000);
    } else {
        feedbackEl.innerText = i18n.t('act_tacte_parts_feedback_incorrect') || 'Incorrecte. Torna-ho a provar.';
        feedbackEl.style.color = 'red';
        bioTactePartsGame.score = Math.max(0, bioTactePartsGame.score - 10);
        updateBioTactePartsUI();
    }
}

async function saveBioTactePartsResult() {
    if (typeof state === 'undefined' || !state.user) return;
    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
        app: 'Anatomia de la Tacte',
        nivell: 'Parts de l\'ull',
        puntuacio: bioTactePartsGame.score,
        temps_segons: 0,
        feedback_pos: 'Bona feina component la Tacte.',
        feedback_neg: ''
    };
    if (typeof callApi === 'function') {
        await callApi('saveResult', result);
    }
}

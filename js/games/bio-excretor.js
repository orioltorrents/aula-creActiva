/**
 * Sistema Excretor Interactive Activity
 */

const bioExcretorGame = {
    currentStep: 0,
    score: 100,
    sessionQuestions: [],
    allQuestions: [
        { key: 'act_excretor_q1', x: 210, y: 140, w: 180, h: 320 },
        { key: 'act_excretor_q2', x: 205, y: 130, w: 170, h: 325 },
        { key: 'act_excretor_q3', x: 600, y: 105, w: 195, h: 325 },
        { key: 'act_excretor_q4', x: 600, y: 120, w: 195, h: 310 },
        { key: 'act_excretor_q5', x: 370, y: 315, w: 40, h: 375 },
        { key: 'act_excretor_q6', x: 360, y: 330, w: 50, h: 360 },
        { key: 'act_excretor_q7', x: 585, y: 350, w: 50, h: 345 },
        { key: 'act_excretor_q8', x: 585, y: 320, w: 45, h: 370 },
        { key: 'act_excretor_q9', x: 385, y: 670, w: 230, h: 165 },
        { key: 'act_excretor_q10', x: 390, y: 675, w: 230, h: 150 },
        { key: 'act_excretor_q11', x: 475, y: 840, w: 50, h: 115 },
        { key: 'act_excretor_q12', x: 475, y: 840, w: 50, h: 105 },
        { key: 'act_excretor_q13', x: 495, y: 70, w: 55, h: 465 },
        { key: 'act_excretor_q14', x: 500, y: 75, w: 50, h: 445 },
        { key: 'act_excretor_q15', x: 440, y: 75, w: 55, h: 450 },
        { key: 'act_excretor_q16', x: 440, y: 75, w: 55, h: 455 },
        { key: 'act_excretor_q17', x: 0, y: 0, w: 100, h: 100 },
        { key: 'act_excretor_q18', x: 0, y: 0, w: 100, h: 100 },
        { key: 'act_excretor_q19', x: 0, y: 0, w: 100, h: 100 },
        { key: 'act_excretor_q20', x: 0, y: 0, w: 100, h: 100 },
        { key: 'act_excretor_q21', x: 0, y: 0, w: 100, h: 100 }
    ],
    isFinished: false,
    debugMode: true
};

function initBioExcretorGame() {
    bioExcretorGame.currentStep = 0;
    bioExcretorGame.score = 100;
    bioExcretorGame.isFinished = false;

    // Filtrem per claus úniques perquè no surti la mateixa pregunta diverses vegades
    const shuffled = [...bioExcretorGame.allQuestions].sort(() => 0.5 - Math.random());
    const uniqueKeys = new Set();
    bioExcretorGame.sessionQuestions = [];

    for (let q of shuffled) {
        if (!uniqueKeys.has(q.key)) {
            uniqueKeys.add(q.key);
            bioExcretorGame.sessionQuestions.push(q);
        }
    }

    bioExcretorGame.sessionQuestions = bioExcretorGame.sessionQuestions.slice(0, 10); // Ajusta la quantitat de preguntes

    updateBioExcretorUI();

    const img = document.getElementById('bio-excretor-image');
    if (img) {
        img.onclick = handleBioExcretorClick;
    }
}

function updateBioExcretorUI() {
    const questionEl = document.getElementById('bio-excretor-question');
    const feedbackEl = document.getElementById('bio-excretor-feedback');
    const scoreEl = document.getElementById('bio-excretor-score-display');
    const skipBtn = document.getElementById('bio-excretor-skip-btn');
    const helpBtn = document.getElementById('bio-excretor-help-btn');
    const calibrationUI = document.getElementById('bio-excretor-calibration-ui');

    if (scoreEl) scoreEl.innerText = i18n.t('score') + ": " + bioExcretorGame.score;

    if (bioExcretorGame.isFinished) {
        questionEl.innerText = i18n.t('act_excretor_finished') || 'Heu acabat el sistema excretor!';
        feedbackEl.innerText = '';
        if (skipBtn) skipBtn.classList.add('hidden');
        if (helpBtn) helpBtn.classList.add('hidden');
        if (calibrationUI) calibrationUI.classList.add('hidden');
        return;
    }

    if (skipBtn) skipBtn.classList.remove('hidden');
    if (helpBtn) helpBtn.classList.remove('hidden');

    const currentTarget = bioExcretorGame.sessionQuestions[bioExcretorGame.currentStep];

    // Assegura't de definir totes les etiquetes act_excretor_q1... a translations.js
    questionEl.innerText = `(${bioExcretorGame.currentStep + 1}/${bioExcretorGame.sessionQuestions.length}) ` +
        (i18n.t(currentTarget.key) !== currentTarget.key ? i18n.t(currentTarget.key) : "Trobeu la zona corresponent a: " + currentTarget.key);
}

function showBioExcretorHelp() {
    if (bioExcretorGame.isFinished) return;

    bioExcretorGame.score = Math.max(0, bioExcretorGame.score - 10);
    updateBioExcretorUI();

    const target = bioExcretorGame.sessionQuestions[bioExcretorGame.currentStep];
    renderBioExcretorHelpHint(target);

    // Mostra la interfície de calibratge (només en mode depuració)
    const calibrationUI = document.getElementById('bio-excretor-calibration-ui');
    if (calibrationUI && bioExcretorGame.debugMode) {
        calibrationUI.classList.remove('hidden');
        updateBioExcretorCalibrationDisplay();
    }
}

function renderBioExcretorHelpHint(target) {
    const existings = document.querySelectorAll('.bio-excretor-help-hint');
    existings.forEach(el => el.remove());

    const img = document.getElementById('bio-excretor-image');
    if (!img) return; // Prevenció per si no es troba la imatge

    const wrapper = img.parentElement;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;
    const scaleX = rect.width / logicalWidth;
    const scaleY = rect.height / logicalHeight;

    // Dibuixa el rectangle per a TOTES les respostes correctes (ex: totes les piràmides)
    const matchingTargets = bioExcretorGame.allQuestions.filter(q => q.key === target.key);

    matchingTargets.forEach(t => {
        const hint = document.createElement('div');
        hint.className = 'bio-excretor-help-hint';
        hint.style.position = 'absolute';
        hint.style.border = '2px solid red';
        hint.style.backgroundColor = 'rgba(255,0,0,0.3)';
        hint.style.pointerEvents = 'none';
        hint.style.zIndex = '10';

        hint.style.left = (t.x * scaleX) + 'px';
        hint.style.top = (t.y * scaleY) + 'px';
        hint.style.width = (t.w * scaleX) + 'px';
        hint.style.height = (t.h * scaleY) + 'px';

        wrapper.appendChild(hint);
    });

    if (!bioExcretorGame.debugMode) {
        setTimeout(() => {
            const currentHints = document.querySelectorAll('.bio-excretor-help-hint');
            currentHints.forEach(el => el.remove());
        }, 2500);
    }
}

function nudgeBioExcretorTarget(axis, delta) {
    const target = bioExcretorGame.sessionQuestions[bioExcretorGame.currentStep];
    target[axis] += delta;
    renderBioExcretorHelpHint(target);
    updateBioExcretorCalibrationDisplay();
}

function updateBioExcretorCalibrationDisplay() {
    const target = bioExcretorGame.sessionQuestions[bioExcretorGame.currentStep];
    const display = document.getElementById('bio-excretor-calibration-values');
    if (display) {
        display.innerText = `x:${target.x} y:${target.y} w:${target.w} h:${target.h}`;
    }
}

function closeBioExcretorCalibration() {
    const calibrationUI = document.getElementById('bio-excretor-calibration-ui');
    const hints = document.querySelectorAll('.bio-excretor-help-hint');
    if (calibrationUI) calibrationUI.classList.add('hidden');
    hints.forEach(el => el.remove());
}

function exportBioExcretorConfig() {
    const currentTarget = bioExcretorGame.sessionQuestions[bioExcretorGame.currentStep];
    const originalIndex = bioExcretorGame.allQuestions.findIndex(q => q.key === currentTarget.key);

    if (originalIndex !== -1) {
        bioExcretorGame.allQuestions[originalIndex] = { ...currentTarget };
    }

    const code = JSON.stringify(bioExcretorGame.allQuestions, null, 4);

    console.log("NOVA CONFIGURACIÓ PER A bio-excretor.js:");
    console.log(code);

    const textArea = document.createElement("textarea");
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert("Codi copiat al portapapers! Enganxa'l a la variable 'allQuestions' de bio-excretor.js");
    } catch (err) {
        prompt("Copia aquest codi i enganxa'l a bio-excretor.js:", code);
    }
    document.body.removeChild(textArea);
}

function skipBioExcretorQuestion() {
    if (bioExcretorGame.isFinished) return;
    bioExcretorGame.score = Math.max(0, bioExcretorGame.score - 5);
    nextBioExcretorStep();
}

function nextBioExcretorStep() {
    bioExcretorGame.currentStep++;
    if (bioExcretorGame.currentStep >= bioExcretorGame.sessionQuestions.length) {
        bioExcretorGame.isFinished = true;
        saveBioExcretorResult();
    }
    updateBioExcretorUI();
}

function handleBioExcretorClick(event) {
    if (bioExcretorGame.isFinished) return;

    // Eliminar l'ajuda si existeix quan cliquem
    const hints = document.querySelectorAll('.bio-excretor-help-hint');
    hints.forEach(el => el.remove());

    const img = event.target;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;

    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const currentTarget = bioExcretorGame.sessionQuestions[bioExcretorGame.currentStep];
    const feedbackEl = document.getElementById('bio-excretor-feedback');

    // Mirem si el clic cau a qualsevol dels objectes amb aquesta mateixa clau
    const matchingTargets = bioExcretorGame.allQuestions.filter(q => q.key === currentTarget.key);
    let hit = false;

    for (let t of matchingTargets) {
        if (clickX >= t.x && clickX <= t.x + t.w && clickY >= t.y && clickY <= t.y + t.h) {
            hit = true;
            break;
        }
    }

    if (hit) {

        feedbackEl.innerText = i18n.t('act_excretor_feedback_correct') || 'Correcte!';
        feedbackEl.style.color = 'green';

        setTimeout(() => {
            feedbackEl.innerText = '';
            nextBioExcretorStep();
        }, 1000);
    } else {
        feedbackEl.innerText = i18n.t('act_excretor_feedback_incorrect') || 'Incorrecte. Torna-ho a provar o utilitza l\'ajuda.';
        feedbackEl.style.color = 'red';
        bioExcretorGame.score = Math.max(0, bioExcretorGame.score - 10);
        updateBioExcretorUI();
    }
}

async function saveBioExcretorResult() {
    if (typeof state === 'undefined' || !state.user) return;

    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject.titol,
        app: 'El Sistema Excretor',
        nivell: 'Anatomia (10 preguntes)',
        puntuacio: bioExcretorGame.score,
        temps_segons: 0,
        feedback_pos: 'Bona feina component el sistema excretor.',
        feedback_neg: ''
    };

    if (typeof callApi === 'function') {
        await callApi('saveResult', result);
    }
}

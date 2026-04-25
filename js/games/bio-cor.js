/**
 * Human Heart (El Cor Humà) Interactive Activity
 */

const bioHeartGame = {
    currentStep: 0,
    score: 100,
    sessionQuestions: [],
    allQuestions: [
        // Aurícula Dreta (RA)
        { key: 'act_heart_q1', x: 316, y: 348, w: 115, h: 115 },
        { key: 'act_heart_q2', x: 316, y: 348, w: 115, h: 115 },
        { key: 'act_heart_q3', x: 316, y: 348, w: 115, h: 115 },
        // Aurícula Esquerra (LA)
        { key: 'act_heart_q4', x: 537, y: 361, w: 95, h: 95 },
        { key: 'act_heart_q5', x: 537, y: 361, w: 95, h: 95 },
        { key: 'act_heart_q6', x: 537, y: 361, w: 95, h: 95 },
        // Ventricle Dret (RV)
        { key: 'act_heart_q7', x: 332, y: 540, w: 160, h: 160 },
        { key: 'act_heart_q8', x: 332, y: 540, w: 160, h: 160 },
        // Ventricle Esquerre (LV)
        { key: 'act_heart_q9', x: 517, y: 539, w: 151, h: 151 },
        { key: 'act_heart_q10', x: 517, y: 539, w: 151, h: 151 },
        { key: 'act_heart_q11', x: 517, y: 539, w: 151, h: 151 },
        // Arteria Aorta
        { key: 'act_heart_q12', x: 441, y: 142, w: 100, h: 100 },
        { key: 'act_heart_q13', x: 441, y: 142, w: 100, h: 100 },
        { key: 'act_heart_q14', x: 441, y: 142, w: 100, h: 100 },
        // Vena Cava Superior
        { key: 'act_heart_q15', x: 318, y: 171, w: 84, h: 84 },
        { key: 'act_heart_q16', x: 318, y: 171, w: 84, h: 84 },
        // Vena Cava Inferior
        { key: 'act_heart_q17', x: 315, y: 770, w: 77, h: 77 },
        { key: 'act_heart_q18', x: 315, y: 770, w: 77, h: 77 },
        // Arteria Pulmonar
        { key: 'act_heart_q19', x: 494, y: 258, w: 77, h: 77 },
        { key: 'act_heart_q20', x: 494, y: 258, w: 77, h: 77 },
        // Venes Pulmonars
        { key: 'act_heart_q21', x: 622, y: 313, w: 110, h: 110 },
        { key: 'act_heart_q22', x: 622, y: 313, w: 110, h: 110 },
        // Vàlvula Tricúspide
        { key: 'act_heart_q23', x: 392, y: 474, w: 50, h: 50 },
        { key: 'act_heart_q24', x: 392, y: 474, w: 50, h: 50 },
        // Vàlvula Mitral
        { key: 'act_heart_q25', x: 530, y: 477, w: 50, h: 50 },
        { key: 'act_heart_q26', x: 530, y: 477, w: 50, h: 50 }
    ],
    isFinished: false,
    debugMode: false // Permet calibració en temps real (Canviar a true per editar)
};

function initBioHeartGame() {
    bioHeartGame.currentStep = 0;
    bioHeartGame.score = 100;
    bioHeartGame.isFinished = false;

    // Barregem i seleccionem 25 preguntes
    bioHeartGame.sessionQuestions = [...bioHeartGame.allQuestions]
        .sort(() => 0.5 - Math.random())
        .slice(0, 25);

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

    const currentTarget = bioHeartGame.sessionQuestions[bioHeartGame.currentStep];
    questionEl.innerText = `(${bioHeartGame.currentStep + 1}/25) ` + i18n.t(currentTarget.key);
}

function showBioHeartHelp() {
    if (bioHeartGame.isFinished) return;

    bioHeartGame.score = Math.max(0, bioHeartGame.score - 10);
    updateBioHeartUI();


    const target = bioHeartGame.sessionQuestions[bioHeartGame.currentStep];
    renderBioHeartHelpHint(target);

    // Mostra la interfície de calibratge (només en mode depuració)
    const calibrationUI = document.getElementById('bio-heart-calibration-ui');
    if (calibrationUI && bioHeartGame.debugMode) {
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
    const target = bioHeartGame.sessionQuestions[bioHeartGame.currentStep];
    target[axis] += delta;
    renderBioHeartHelpHint(target);
    updateBioHeartCalibrationDisplay();
}

function updateBioHeartCalibrationDisplay() {
    const target = bioHeartGame.sessionQuestions[bioHeartGame.currentStep];
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

function exportBioHeartConfig() {
    // 1. Aconseguir la pregunta actual del set de sessió
    const currentTarget = bioHeartGame.sessionQuestions[bioHeartGame.currentStep];

    // 2. Trobar la referència original a allQuestions per actualitzar-la permanentment
    // Nota: currentTarget és una referència a un objecte que ja està a allQuestions (via el spread a init)
    // Però per seguretat, busquem l'index.
    const originalIndex = bioHeartGame.allQuestions.findIndex(q => q.key === currentTarget.key);

    if (originalIndex !== -1) {
        bioHeartGame.allQuestions[originalIndex] = { ...currentTarget };
    }

    // 3. Generar el codi string per copiar
    const code = JSON.stringify(bioHeartGame.allQuestions, null, 4);

    // 4. Mostrar a l'usuari
    console.log("NOVA CONFIGURACIÓ PER A bio-cor.js:");
    console.log(code);

    const textArea = document.createElement("textarea");
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert("Codi copiat al portapapers! Enganxa'l a la variable 'allQuestions' de bio-cor.js");
    } catch (err) {
        prompt("Copia aquest codi i enganxa'l a bio-cor.js:", code);
    }
    document.body.removeChild(textArea);
}


function skipBioHeartQuestion() {
    if (bioHeartGame.isFinished) return;
    bioHeartGame.score = Math.max(0, bioHeartGame.score - 5);
    nextBioHeartStep();
}

function nextBioHeartStep() {
    bioHeartGame.currentStep++;
    if (bioHeartGame.currentStep >= bioHeartGame.sessionQuestions.length) {
        bioHeartGame.isFinished = true;
        saveBioHeartResult();
    }
    updateBioHeartUI();
}

function handleBioHeartClick(event) {
    if (bioHeartGame.isFinished) return;

    // Eliminar l'ajuda si existeix quan cliquem
    const hint = document.querySelector('.bio-heart-help-hint');
    if (hint) hint.remove();

    const img = event.target;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;

    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const target = bioHeartGame.sessionQuestions[bioHeartGame.currentStep];
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
        bioHeartGame.score = Math.max(0, bioHeartGame.score - 10);
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
        nivell: 'Fisiologia mixta (25 preguntes)',
        puntuacio: bioHeartGame.score,
        temps_segons: 0,
        feedback_pos: 'Excel·lent coneixement de l\'anatomia i fisiologia del cor.',
        feedback_neg: ''
    };

    await callApi('saveResult', result);
}

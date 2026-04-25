/**
 * Sistema Endocrí - Activitat de Glàndules
 */

const bioEndocriGlandsGame = {
    currentStep: 0,
    score: 100,
    model: 'home', // 'home' o 'dona'
    sessionQuestions: [],
    allQuestionsHome: [
        { key: 'act_endo_gland_hipotalem', x: 980, y: 585, w: 50, h: 40 },
        { key: 'act_endo_gland_hipofisi', x: 985, y: 585, w: 40, h: 40 },
        { key: 'act_endo_gland_pineal', x: 985, y: 585, w: 40, h: 40 },
        { key: 'act_endo_gland_tiroides', x: 965, y: 780, w: 75, h: 60 },
        { key: 'act_endo_gland_paratiroides', x: 965, y: 780, w: 75, h: 60 },
        { key: 'act_endo_gland_suprarenals', x: 925, y: 1020, w: 40, h: 40 },
        { key: 'act_endo_gland_suprarenals', x: 1045, y: 1020, w: 40, h: 35 },
        { key: 'act_endo_gland_pancrees', x: 955, y: 1065, w: 130, h: 65 },
        { key: 'act_endo_gland_gonades', x: 965, y: 1410, w: 25, h: 35 },
        { key: 'act_endo_gland_gonades', x: 1020, y: 1410, w: 25, h: 35 }
    ],
    allQuestionsDona: [
        { key: 'act_endo_gland_hipotalem', x: 980, y: 585, w: 50, h: 40 },
        { key: 'act_endo_gland_hipofisi', x: 985, y: 585, w: 40, h: 40 },
        { key: 'act_endo_gland_pineal', x: 985, y: 585, w: 40, h: 40 },
        { key: 'act_endo_gland_tiroides', x: 965, y: 780, w: 75, h: 60 },
        { key: 'act_endo_gland_paratiroides', x: 965, y: 780, w: 75, h: 60 },
        { key: 'act_endo_gland_suprarenals', x: 925, y: 1020, w: 40, h: 40 },
        { key: 'act_endo_gland_suprarenals', x: 1045, y: 1020, w: 40, h: 35 },
        { key: 'act_endo_gland_pancrees', x: 955, y: 1065, w: 130, h: 65 },
        { key: 'act_endo_gland_gonades', x: 900, y: 1260, w: 55, h: 40 },
        { key: 'act_endo_gland_gonades', x: 1050, y: 1260, w: 55, h: 40 }
        
    ],
    isFinished: false,
    debugMode: true
};

function initBioEndocriGlandsGame() {
    document.getElementById('bio-endocri-glands-selector').classList.remove('hidden');
    document.getElementById('bio-endocri-glands-ui').classList.add('hidden');
}

function startBioEndocriGlandsGame(model) {
    bioEndocriGlandsGame.model = model;
    bioEndocriGlandsGame.currentStep = 0;
    bioEndocriGlandsGame.score = 100;
    bioEndocriGlandsGame.isFinished = false;

    // Actualitzem la imatge
    const img = document.getElementById('bio-endocri-glands-image');
    if (model === 'home') {
        img.src = 'assets/images/glandules-endocrines-home.png';
    } else {
        img.src = 'assets/images/glandules-endocrines-dona.png';
    }

    document.getElementById('bio-endocri-glands-selector').classList.add('hidden');
    document.getElementById('bio-endocri-glands-ui').classList.remove('hidden');

    const sourceQuestions = model === 'home' ? bioEndocriGlandsGame.allQuestionsHome : bioEndocriGlandsGame.allQuestionsDona;
    
    // Barregem i assegurem úniques
    const shuffled = [...sourceQuestions].sort(() => 0.5 - Math.random());
    const uniqueKeys = new Set();
    bioEndocriGlandsGame.sessionQuestions = [];

    for (let q of shuffled) {
        if (!uniqueKeys.has(q.key)) {
            uniqueKeys.add(q.key);
            bioEndocriGlandsGame.sessionQuestions.push(q);
        }
    }

    updateBioEndocriGlandsUI();

    if (img) {
        img.onclick = handleBioEndocriGlandsClick;
    }
}

function updateBioEndocriGlandsUI() {
    const questionEl = document.getElementById('bio-endocri-glands-question');
    const feedbackEl = document.getElementById('bio-endocri-glands-feedback');
    const scoreEl = document.getElementById('bio-endocri-glands-score-display');
    const skipBtn = document.getElementById('bio-endocri-glands-skip-btn');
    const helpBtn = document.getElementById('bio-endocri-glands-help-btn');
    const calibrationUI = document.getElementById('bio-endocri-glands-calibration-ui');

    if (scoreEl) scoreEl.innerText = i18n.t('score') + ": " + bioEndocriGlandsGame.score;

    if (bioEndocriGlandsGame.isFinished) {
        questionEl.innerText = i18n.t('act_endo_glands_finished') || 'Heu identificat totes les glàndules!';
        feedbackEl.innerText = '';
        if (skipBtn) skipBtn.classList.add('hidden');
        if (helpBtn) helpBtn.classList.add('hidden');
        if (calibrationUI) calibrationUI.classList.add('hidden');
        return;
    }

    if (skipBtn) skipBtn.classList.remove('hidden');
    if (helpBtn) helpBtn.classList.remove('hidden');

    const currentTarget = bioEndocriGlandsGame.sessionQuestions[bioEndocriGlandsGame.currentStep];

    const modelName = bioEndocriGlandsGame.model === 'home' ? 'Home' : 'Dona';
    const translatedTarget = i18n.t(currentTarget.key) !== currentTarget.key ? i18n.t(currentTarget.key) : currentTarget.key;
    
    // Si és testicles/ovaris depèn del model
    let finalTargetName = translatedTarget;
    if (currentTarget.key === 'act_endo_gland_gonades') {
        finalTargetName = bioEndocriGlandsGame.model === 'home' ? i18n.t('act_endo_gland_testicles') || 'Testicles' : i18n.t('act_endo_gland_ovaris') || 'Ovaris';
    }

    questionEl.innerText = `(${bioEndocriGlandsGame.currentStep + 1}/${bioEndocriGlandsGame.sessionQuestions.length}) Trobeu la zona corresponent a: ${finalTargetName}`;
}

function showBioEndocriGlandsHelp() {
    if (bioEndocriGlandsGame.isFinished) return;

    bioEndocriGlandsGame.score = Math.max(0, bioEndocriGlandsGame.score - 10);
    updateBioEndocriGlandsUI();

    const target = bioEndocriGlandsGame.sessionQuestions[bioEndocriGlandsGame.currentStep];
    renderBioEndocriGlandsHelpHint(target);

    const calibrationUI = document.getElementById('bio-endocri-glands-calibration-ui');
    if (calibrationUI && bioEndocriGlandsGame.debugMode) {
        calibrationUI.classList.remove('hidden');
        updateBioEndocriGlandsCalibrationDisplay();
    }
}

function renderBioEndocriGlandsHelpHint(target) {
    const existings = document.querySelectorAll('.bio-endocri-glands-help-hint');
    existings.forEach(el => el.remove());

    const img = document.getElementById('bio-endocri-glands-image');
    if (!img) return; 

    const wrapper = img.parentElement;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;
    const scaleX = rect.width / logicalWidth;
    const scaleY = rect.height / logicalHeight;

    const sourceQuestions = bioEndocriGlandsGame.model === 'home' ? bioEndocriGlandsGame.allQuestionsHome : bioEndocriGlandsGame.allQuestionsDona;
    const matchingTargets = sourceQuestions.filter(q => q.key === target.key);

    matchingTargets.forEach(t => {
        const hint = document.createElement('div');
        hint.className = 'bio-endocri-glands-help-hint';
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

    if (!bioEndocriGlandsGame.debugMode) {
        setTimeout(() => {
            const currentHints = document.querySelectorAll('.bio-endocri-glands-help-hint');
            currentHints.forEach(el => el.remove());
        }, 2500);
    }
}

function nudgeBioEndocriGlandsTarget(axis, delta) {
    const target = bioEndocriGlandsGame.sessionQuestions[bioEndocriGlandsGame.currentStep];
    target[axis] += delta;
    renderBioEndocriGlandsHelpHint(target);
    updateBioEndocriGlandsCalibrationDisplay();
}

function updateBioEndocriGlandsCalibrationDisplay() {
    const target = bioEndocriGlandsGame.sessionQuestions[bioEndocriGlandsGame.currentStep];
    const display = document.getElementById('bio-endocri-glands-calibration-values');
    if (display) {
        display.innerText = `x:${target.x} y:${target.y} w:${target.w} h:${target.h}`;
    }
}

function closeBioEndocriGlandsCalibration() {
    const calibrationUI = document.getElementById('bio-endocri-glands-calibration-ui');
    const hints = document.querySelectorAll('.bio-endocri-glands-help-hint');
    if (calibrationUI) calibrationUI.classList.add('hidden');
    hints.forEach(el => el.remove());
}

function exportBioEndocriGlandsConfig() {
    const currentTarget = bioEndocriGlandsGame.sessionQuestions[bioEndocriGlandsGame.currentStep];
    const sourceQuestions = bioEndocriGlandsGame.model === 'home' ? bioEndocriGlandsGame.allQuestionsHome : bioEndocriGlandsGame.allQuestionsDona;
    
    const originalIndex = sourceQuestions.findIndex(q => q.key === currentTarget.key);

    if (originalIndex !== -1) {
        sourceQuestions[originalIndex] = { ...currentTarget };
    }

    const code = JSON.stringify(sourceQuestions, null, 4);

    console.log(`NOVA CONFIGURACIÓ PER A bio-endocri-glands.js (${bioEndocriGlandsGame.model}):`);
    console.log(code);

    const textArea = document.createElement("textarea");
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert("Codi copiat al portapapers! Enganxa'l a l'array pertinent dins de bio-endocri-glands.js");
    } catch (err) {
        prompt("Copia aquest codi i enganxa'l a bio-endocri-glands.js:", code);
    }
    document.body.removeChild(textArea);
}

function skipBioEndocriGlandsQuestion() {
    if (bioEndocriGlandsGame.isFinished) return;
    bioEndocriGlandsGame.score = Math.max(0, bioEndocriGlandsGame.score - 5);
    nextBioEndocriGlandsStep();
}

function nextBioEndocriGlandsStep() {
    bioEndocriGlandsGame.currentStep++;
    if (bioEndocriGlandsGame.currentStep >= bioEndocriGlandsGame.sessionQuestions.length) {
        bioEndocriGlandsGame.isFinished = true;
        saveBioEndocriGlandsResult();
    }
    updateBioEndocriGlandsUI();
}

function handleBioEndocriGlandsClick(event) {
    if (bioEndocriGlandsGame.isFinished) return;

    const hints = document.querySelectorAll('.bio-endocri-glands-help-hint');
    hints.forEach(el => el.remove());

    const img = event.target;
    const rect = img.getBoundingClientRect();
    const logicalWidth = 1000;
    const logicalHeight = 1000;

    const scaleX = logicalWidth / rect.width;
    const scaleY = logicalHeight / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const currentTarget = bioEndocriGlandsGame.sessionQuestions[bioEndocriGlandsGame.currentStep];
    const feedbackEl = document.getElementById('bio-endocri-glands-feedback');

    const sourceQuestions = bioEndocriGlandsGame.model === 'home' ? bioEndocriGlandsGame.allQuestionsHome : bioEndocriGlandsGame.allQuestionsDona;
    const matchingTargets = sourceQuestions.filter(q => q.key === currentTarget.key);
    let hit = false;

    for (let t of matchingTargets) {
        if (clickX >= t.x && clickX <= t.x + t.w && clickY >= t.y && clickY <= t.y + t.h) {
            hit = true;
            break;
        }
    }

    if (hit) {
        feedbackEl.innerText = i18n.t('act_endo_glands_feedback_correct') || 'Correcte!';
        feedbackEl.style.color = 'green';

        setTimeout(() => {
            feedbackEl.innerText = '';
            nextBioEndocriGlandsStep();
        }, 1000);
    } else {
        feedbackEl.innerText = i18n.t('act_endo_glands_feedback_incorrect') || 'Incorrecte. Torna-ho a provar o utilitza l\'ajuda.';
        feedbackEl.style.color = 'red';
        bioEndocriGlandsGame.score = Math.max(0, bioEndocriGlandsGame.score - 10);
        updateBioEndocriGlandsUI();
    }
}

async function saveBioEndocriGlandsResult() {
    if (typeof state === 'undefined' || !state.user) return;

    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
        app: 'Glàndules Endocrines',
        nivell: bioEndocriGlandsGame.model === 'home' ? 'Cos Masculí' : 'Cos Femení',
        puntuacio: bioEndocriGlandsGame.score,
        temps_segons: 0,
        feedback_pos: 'Bona feina component el sistema endocrí.',
        feedback_neg: ''
    };

    if (typeof callApi === 'function') {
        await callApi('saveResult', result);
    }
}

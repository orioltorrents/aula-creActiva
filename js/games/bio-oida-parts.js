/**
 * Joc de l'Oïda - Senyalar Parts (Multi-Imatge)
 * La imatge canvia automàticament segons la secció de cada pregunta:
 *   section: 'externa'  -> assets/images/activities/biologia/senses/orella-externa.png
 *   section: 'mitjana'  -> assets/images/activities/biologia/senses/orella-mitjana.png
 *   section: 'interna'  -> assets/images/activities/biologia/senses/orella-interna.png
 */

const OIDA_IMAGES = {
    externa: 'assets/images/activities/biologia/senses/orella-externa.png',
    mitjana: 'assets/images/activities/biologia/senses/orella-mitjana.png',
    interna: 'assets/images/activities/biologia/senses/orella-interna.png'
};

const bioOidaPartsGame = {
    currentStep: 0,
    score: 100,
    sessionQuestions: [],
    allQuestions: [
        // --- ORELLA EXTERNA ---
        { key: 'act_oida_part_pavello',   section: 'externa', x: 100, y: 100, w: 120, h: 120 },
        { key: 'act_oida_part_conducte',  section: 'externa', x: 300, y: 300, w: 100, h: 100 },
        { key: 'act_oida_part_timpa',     section: 'externa', x: 500, y: 400, w: 100, h: 100 },

        // --- ORELLA MITJANA ---
        { key: 'act_oida_part_martell',   section: 'mitjana', x: 200, y: 200, w: 100, h: 100 },
        { key: 'act_oida_part_enclusa',   section: 'mitjana', x: 350, y: 250, w: 100, h: 100 },
        { key: 'act_oida_part_estrep',    section: 'mitjana', x: 500, y: 300, w: 100, h: 100 },
        { key: 'act_oida_part_eustaqui',  section: 'mitjana', x: 400, y: 500, w: 120, h: 100 },

        // --- ORELLA INTERNA ---
        { key: 'act_oida_part_coclea',    section: 'interna', x: 300, y: 300, w: 150, h: 150 },
        { key: 'act_oida_part_semicirculars', section: 'interna', x: 200, y: 150, w: 200, h: 150 },
        { key: 'act_oida_part_nervi',     section: 'interna', x: 600, y: 400, w: 100, h: 100 },
        { key: 'act_oida_part_vestibul',  section: 'interna', x: 400, y: 300, w: 100, h: 100 }
    ],
    isFinished: false,
    debugMode: false
};

function initBioOidaPartsGame() {
    bioOidaPartsGame.currentStep = 0;
    bioOidaPartsGame.score = 100;
    bioOidaPartsGame.isFinished = false;
    bioOidaPartsGame.debugMode = typeof isAdminUser === 'function' ? isAdminUser() : false;

    // Barrejar mantenint l'ordre per seccions (opcional: barreja total)
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
    updateBioOidaPartsImage();
    updateBioOidaPartsUI();

    const img = document.getElementById('bio-oida-parts-image');
    if (img) img.onclick = handleBioOidaPartsClick;
}

function updateBioOidaPartsImage() {
    if (bioOidaPartsGame.isFinished) return;
    const currentTarget = bioOidaPartsGame.sessionQuestions[bioOidaPartsGame.currentStep];
    if (!currentTarget) return;

    const img = document.getElementById('bio-oida-parts-image');
    const sectionLabel = document.getElementById('bio-oida-parts-section-label');
    const section = currentTarget.section || 'externa';
    const newSrc = OIDA_IMAGES[section] || OIDA_IMAGES.externa;

    if (img && img.src !== newSrc) {
        img.src = newSrc;
    }

    if (sectionLabel) {
        const labels = {
            externa: '🔵 Orella Externa',
            mitjana: '🟠 Orella Mitjana',
            interna: '🔴 Orella Interna'
        };
        sectionLabel.innerText = labels[section] || '';
    }
}

function updateBioOidaPartsUI() {
    const questionEl = document.getElementById('bio-oida-parts-question');
    const feedbackEl = document.getElementById('bio-oida-parts-feedback');
    const scoreEl    = document.getElementById('bio-oida-parts-score-display');
    const skipBtn    = document.getElementById('bio-oida-parts-skip-btn');
    const helpBtn    = document.getElementById('bio-oida-parts-help-btn');
    const calibrationUI = document.getElementById('bio-oida-parts-calibration-ui');

    if (scoreEl) scoreEl.innerText = i18n.t('score') + ': ' + bioOidaPartsGame.score;

    if (bioOidaPartsGame.isFinished) {
        questionEl.innerText = i18n.t('act_oida_parts_finished') || 'Heu identificat totes les parts de l\'orella!';
        feedbackEl.innerText = '';
        if (skipBtn) skipBtn.classList.add('hidden');
        if (helpBtn) helpBtn.classList.add('hidden');
        if (calibrationUI) calibrationUI.classList.add('hidden');
        return;
    }

    if (skipBtn) skipBtn.classList.remove('hidden');
    if (helpBtn) helpBtn.classList.remove('hidden');
    if (calibrationUI && !bioOidaPartsGame.debugMode) calibrationUI.classList.add('hidden');

    const currentTarget = bioOidaPartsGame.sessionQuestions[bioOidaPartsGame.currentStep];
    const translatedTarget = i18n.t(currentTarget.key) !== currentTarget.key
        ? i18n.t(currentTarget.key)
        : currentTarget.key;

    questionEl.innerText = `(${bioOidaPartsGame.currentStep + 1}/${bioOidaPartsGame.sessionQuestions.length}) Trobeu: ${translatedTarget}`;

    // Actualitzar imatge si ha canviat de secció
    updateBioOidaPartsImage();
}

function showBioOidaPartsHelp() {
    if (bioOidaPartsGame.isFinished) return;

    bioOidaPartsGame.score = Math.max(0, bioOidaPartsGame.score - 10);
    updateBioOidaPartsUI();

    const target = bioOidaPartsGame.sessionQuestions[bioOidaPartsGame.currentStep];
    renderBioOidaPartsHelpHint(target);

    const calibrationUI = document.getElementById('bio-oida-parts-calibration-ui');
    if (calibrationUI && bioOidaPartsGame.debugMode) {
        calibrationUI.classList.remove('hidden');
        updateBioOidaPartsCalibrationDisplay();
    }
}

function renderBioOidaPartsHelpHint(target) {
    document.querySelectorAll('.bio-oida-parts-help-hint').forEach(el => el.remove());

    const img = document.getElementById('bio-oida-parts-image');
    if (!img) return;

    const wrapper = img.parentElement;
    const rect = img.getBoundingClientRect();
    const scaleX = rect.width / 1000;
    const scaleY = rect.height / 1000;

    const matchingTargets = bioOidaPartsGame.allQuestions.filter(q => q.key === target.key);
    matchingTargets.forEach(t => {
        const hint = document.createElement('div');
        hint.className = 'bio-oida-parts-help-hint target-hint';
        hint.style.left   = (img.offsetLeft + t.x * scaleX) + 'px';
        hint.style.top    = (img.offsetTop  + t.y * scaleY) + 'px';
        hint.style.width  = (t.w * scaleX) + 'px';
        hint.style.height = (t.h * scaleY) + 'px';
        wrapper.appendChild(hint);
    });

    if (!bioOidaPartsGame.debugMode) {
        setTimeout(() => {
            document.querySelectorAll('.bio-oida-parts-help-hint').forEach(el => el.remove());
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
    if (display && target) {
        display.innerText = `key:${target.key} | section:${target.section} | x:${target.x} y:${target.y} w:${target.w} h:${target.h}`;
    }
}

function closeBioOidaPartsCalibration() {
    const calibrationUI = document.getElementById('bio-oida-parts-calibration-ui');
    document.querySelectorAll('.bio-oida-parts-help-hint').forEach(el => el.remove());
    if (calibrationUI) calibrationUI.classList.add('hidden');
}

function exportBioOidaPartsConfig() {
    const currentTarget = bioOidaPartsGame.sessionQuestions[bioOidaPartsGame.currentStep];
    const originalIndex = bioOidaPartsGame.allQuestions.findIndex(q => q.key === currentTarget.key);
    if (originalIndex !== -1) {
        bioOidaPartsGame.allQuestions[originalIndex] = { ...currentTarget };
    }
    const code = JSON.stringify(bioOidaPartsGame.allQuestions, null, 4);
    console.log('NOVA CONFIGURACIÓ bio-oida-parts.js:\n', code);
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert('Codi copiat al portapapers!');
    } catch (err) {
        prompt('Copia aquest codi:', code);
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

    document.querySelectorAll('.bio-oida-parts-help-hint').forEach(el => el.remove());

    const img = event.target;
    const rect = img.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 1000 / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top)  * scaleY;

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
        setElementStateColor(feedbackEl, 'success');
        setTimeout(() => {
            feedbackEl.innerText = '';
            nextBioOidaPartsStep();
        }, 1000);
    } else {
        feedbackEl.innerText = i18n.t('act_oida_parts_feedback_incorrect') || 'Incorrecte. Torna-ho a provar.';
        setElementStateColor(feedbackEl, 'error');
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
        app: 'Anatomia de l\'Oïda',
        nivell: 'Parts de l\'Orella',
        puntuacio: bioOidaPartsGame.score,
        temps_segons: 0,
        feedback_pos: 'Bona feina identificant les parts de l\'orella.',
        feedback_neg: ''
    };
    if (typeof callApi === 'function') {
        await callApi('saveResult', result);
    }
}

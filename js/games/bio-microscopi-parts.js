const BIO_MICROSCOPE_PARTS = [
    { id: 'ocular', name: 'ocular', x: 76, y: 11, anchorX: 64, anchorY: 21 },
    { id: 'revolver', name: 'revòlver', aliases: ['revolver'], x: 78, y: 30, anchorX: 50, anchorY: 35 },
    { id: 'objectius', name: 'objectius', x: 80, y: 47, anchorX: 49, anchorY: 51 },
    { id: 'cargol-macro', name: 'cargol macromètric', aliases: ['cargol macrometric', 'macrometric'], x: 78, y: 59, anchorX: 68, anchorY: 49 },
    { id: 'cargol-micro', name: 'cargol micromètric', aliases: ['cargol micrometric', 'micrometric'], x: 77, y: 70, anchorX: 71, anchorY: 57 },
    { id: 'platina', name: 'platina', x: 8, y: 52, anchorX: 36, anchorY: 61 },
    { id: 'pinces', name: 'pinces', x: 8, y: 65, anchorX: 47, anchorY: 56 },
    { id: 'llum', name: 'llum', aliases: ['font de llum', 'il·luminador', 'illuminador'], x: 10, y: 77, anchorX: 47, anchorY: 69 },
    { id: 'braç', name: 'braç', aliases: ['brac'], x: 76, y: 82, anchorX: 63, anchorY: 68 },
    { id: 'base', name: 'base', x: 10, y: 89, anchorX: 54, anchorY: 87 }
];

const BIO_MICROSCOPE_LEVELS = {
    easy: { label: 'Fàcil', mode: 'select', score: 10 },
    medium: { label: 'Mitjà', mode: 'bank', score: 10 },
    hard: { label: 'Difícil', mode: 'text', score: 10 }
};

let bioMicroscopeState = {
    level: 'easy',
    selectedPartId: '',
    startedAt: null,
    checked: false
};

function initBioMicroscopiPartsGame() {
    bioMicroscopeState = {
        level: 'easy',
        selectedPartId: '',
        startedAt: null,
        checked: false
    };

    const start = document.getElementById('bio-microscope-start');
    const game = document.getElementById('bio-microscope-game');
    const results = document.getElementById('bio-microscope-results');
    const form = document.getElementById('bio-microscope-form');
    const checkButton = document.getElementById('bio-microscope-check-btn');
    const retryButton = document.getElementById('bio-microscope-retry-btn');

    if (!start || !game || !results || !form) return;

    start.classList.remove('hidden');
    game.classList.add('hidden');
    results.classList.add('hidden');
    setBioMicroscopeFeedback('', '');

    form.removeEventListener('submit', handleBioMicroscopeStart);
    form.addEventListener('submit', handleBioMicroscopeStart);

    checkButton?.removeEventListener('click', checkBioMicroscopeAnswers);
    checkButton?.addEventListener('click', checkBioMicroscopeAnswers);

    retryButton?.removeEventListener('click', resetBioMicroscopeRound);
    retryButton?.addEventListener('click', resetBioMicroscopeRound);
}

function handleBioMicroscopeStart(event) {
    event.preventDefault();
    const selected = document.querySelector('input[name="bio-microscope-level"]:checked');
    bioMicroscopeState.level = selected ? selected.value : 'easy';
    bioMicroscopeState.startedAt = Date.now();
    bioMicroscopeState.checked = false;
    bioMicroscopeState.selectedPartId = '';

    document.getElementById('bio-microscope-start')?.classList.add('hidden');
    document.getElementById('bio-microscope-results')?.classList.add('hidden');
    document.getElementById('bio-microscope-game')?.classList.remove('hidden');

    renderBioMicroscopeGame();
}

function renderBioMicroscopeGame() {
    const level = BIO_MICROSCOPE_LEVELS[bioMicroscopeState.level] || BIO_MICROSCOPE_LEVELS.easy;
    setBioMicroscopeText('bio-microscope-level-label', level.label);
    setBioMicroscopeText('bio-microscope-instructions', getBioMicroscopeInstructions(level.mode));
    setBioMicroscopeFeedback('', '');
    document.getElementById('bio-microscope-check-btn')?.removeAttribute('disabled');
    document.getElementById('bio-microscope-retry-btn')?.classList.add('hidden');
    document.getElementById('bio-microscope-results')?.classList.add('hidden');

    renderBioMicroscopeLabels(level.mode);
    renderBioMicroscopeBank(level.mode);
}

function getBioMicroscopeInstructions(mode) {
    if (mode === 'select') return 'Tria el nom correcte a cada desplegable.';
    if (mode === 'bank') return 'Selecciona un nom del banc i clica la casella on va.';
    return 'Escriu el nom correcte a cada casella. Pots escriure sense accents.';
}

function renderBioMicroscopeLabels(mode) {
    const labels = document.getElementById('bio-microscope-labels');
    if (!labels) return;

    labels.innerHTML = '';
    const options = shuffleBioMicroscopeItems(BIO_MICROSCOPE_PARTS);

    BIO_MICROSCOPE_PARTS.forEach((part, index) => {
        const label = document.createElement('label');
        label.className = 'bio-microscope__label';
        label.dataset.partId = part.id;
        label.style.setProperty('--label-x', `${part.x}%`);
        label.style.setProperty('--label-y', `${part.y}%`);
        label.style.setProperty('--anchor-x', `${part.anchorX}%`);
        label.style.setProperty('--anchor-y', `${part.anchorY}%`);

        const marker = document.createElement('span');
        marker.className = 'bio-microscope__marker';
        marker.textContent = String(index + 1);
        label.appendChild(marker);

        const control = createBioMicroscopeControl(part, mode, options);
        label.appendChild(control);
        labels.appendChild(label);
    });
}

function createBioMicroscopeControl(part, mode, options) {
    if (mode === 'select') {
        const select = document.createElement('select');
        select.className = 'bio-microscope__control';
        select.dataset.partId = part.id;

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Tria...';
        select.appendChild(placeholder);

        options.forEach(optionPart => {
            const option = document.createElement('option');
            option.value = optionPart.name;
            option.textContent = optionPart.name;
            select.appendChild(option);
        });

        return select;
    }

    if (mode === 'bank') {
        const button = document.createElement('button');
        button.className = 'bio-microscope__drop-slot';
        button.type = 'button';
        button.dataset.partId = part.id;
        button.textContent = 'Assigna';
        button.addEventListener('click', () => placeBioMicroscopeBankAnswer(button));
        return button;
    }

    const input = document.createElement('input');
    input.className = 'bio-microscope__control';
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = 'Nom de la part';
    input.dataset.partId = part.id;
    return input;
}

function renderBioMicroscopeBank(mode) {
    const bank = document.getElementById('bio-microscope-bank');
    if (!bank) return;

    bank.innerHTML = '';
    bank.classList.toggle('hidden', mode !== 'bank');
    if (mode !== 'bank') return;

    shuffleBioMicroscopeItems(BIO_MICROSCOPE_PARTS).forEach(part => {
        const button = document.createElement('button');
        button.className = 'bio-microscope__bank-option';
        button.type = 'button';
        button.dataset.partId = part.id;
        button.textContent = part.name;
        button.addEventListener('click', () => selectBioMicroscopeBankOption(button));
        bank.appendChild(button);
    });
}

function selectBioMicroscopeBankOption(button) {
    if (button.disabled || bioMicroscopeState.checked) return;

    document.querySelectorAll('.bio-microscope__bank-option').forEach(option => {
        option.classList.toggle('bio-microscope__bank-option--selected', option === button);
    });
    bioMicroscopeState.selectedPartId = button.dataset.partId || '';
}

function placeBioMicroscopeBankAnswer(slot) {
    if (!bioMicroscopeState.selectedPartId || bioMicroscopeState.checked) return;

    const selected = document.querySelector(`.bio-microscope__bank-option[data-part-id="${bioMicroscopeState.selectedPartId}"]`);
    if (!selected || selected.disabled) return;

    const previousPartId = slot.dataset.answerId;
    if (previousPartId) {
        const previous = document.querySelector(`.bio-microscope__bank-option[data-part-id="${previousPartId}"]`);
        if (previous) previous.disabled = false;
    }

    slot.dataset.answerId = bioMicroscopeState.selectedPartId;
    slot.textContent = selected.textContent;
    selected.disabled = true;
    selected.classList.remove('bio-microscope__bank-option--selected');
    bioMicroscopeState.selectedPartId = '';
}

function checkBioMicroscopeAnswers() {
    if (bioMicroscopeState.checked) return;

    const level = BIO_MICROSCOPE_LEVELS[bioMicroscopeState.level] || BIO_MICROSCOPE_LEVELS.easy;
    const labels = [...document.querySelectorAll('#bio-microscope-labels .bio-microscope__label')];
    let correct = 0;

    labels.forEach(label => {
        const part = BIO_MICROSCOPE_PARTS.find(item => item.id === label.dataset.partId);
        const answer = getBioMicroscopeAnswer(label, level.mode);
        const isCorrect = part ? isBioMicroscopeAnswerCorrect(answer, part) : false;

        label.classList.toggle('bio-microscope__label--correct', isCorrect);
        label.classList.toggle('bio-microscope__label--incorrect', !isCorrect);
        label.dataset.correctLabel = part ? part.name : '';
        disableBioMicroscopeLabel(label, level.mode);
        if (isCorrect) correct += 1;
    });

    bioMicroscopeState.checked = true;
    document.getElementById('bio-microscope-check-btn')?.setAttribute('disabled', 'disabled');
    document.getElementById('bio-microscope-retry-btn')?.classList.remove('hidden');

    const total = BIO_MICROSCOPE_PARTS.length;
    const percentage = Math.round((correct / total) * 100);
    setBioMicroscopeFeedback(`${correct} de ${total} parts correctes (${percentage}%).`, percentage >= 80 ? 'success' : 'warning');
    finishBioMicroscopeGame(percentage, correct, total);
}

function getBioMicroscopeAnswer(label, mode) {
    if (mode === 'bank') {
        const slot = label.querySelector('.bio-microscope__drop-slot');
        const part = BIO_MICROSCOPE_PARTS.find(item => item.id === slot?.dataset.answerId);
        return part ? part.name : '';
    }

    const control = label.querySelector('.bio-microscope__control');
    return control ? control.value : '';
}

function disableBioMicroscopeLabel(label, mode) {
    if (mode === 'bank') {
        label.querySelector('.bio-microscope__drop-slot')?.setAttribute('disabled', 'disabled');
        return;
    }

    label.querySelector('.bio-microscope__control')?.setAttribute('disabled', 'disabled');
}

function isBioMicroscopeAnswerCorrect(answer, part) {
    const normalizedAnswer = normalizeBioMicroscopeAnswer(answer);
    const validAnswers = [part.name, ...(part.aliases || [])].map(normalizeBioMicroscopeAnswer);
    return validAnswers.includes(normalizedAnswer);
}

function resetBioMicroscopeRound() {
    bioMicroscopeState.checked = false;
    bioMicroscopeState.selectedPartId = '';
    document.getElementById('bio-microscope-check-btn')?.removeAttribute('disabled');
    renderBioMicroscopeGame();
}

function finishBioMicroscopeGame(percentage, correct, total) {
    const elapsedSeconds = bioMicroscopeState.startedAt
        ? Math.round((Date.now() - bioMicroscopeState.startedAt) / 1000)
        : 0;

    setBioMicroscopeText('bio-microscope-final-score', `${percentage}%`);
    setBioMicroscopeText(
        'bio-microscope-message',
        percentage >= 80
            ? 'Molt bé: reconeixes les parts principals del microscopi.'
            : 'Repassa les parts del microscopi i torna-ho a provar.'
    );

    saveBioMicroscopeResult(percentage, correct, total, elapsedSeconds);
    document.getElementById('bio-microscope-results')?.classList.remove('hidden');
}

function saveBioMicroscopeResult(percentage, correct, total, elapsedSeconds) {
    if (typeof state === 'undefined' || !state.user || typeof callApi !== 'function') return;

    const level = BIO_MICROSCOPE_LEVELS[bioMicroscopeState.level] || BIO_MICROSCOPE_LEVELS.easy;
    callApi('saveResult', {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
        app: 'Parts del microscopi',
        nivell: level.label,
        puntuacio: percentage,
        temps_segons: elapsedSeconds,
        feedback_pos: `${correct}/${total} parts correctes`,
        feedback_neg: percentage >= 80 ? '' : 'Cal repassar les parts del microscopi'
    }).catch(error => console.error('Error guardant resultat del microscopi:', error));
}

function setBioMicroscopeFeedback(message, stateName) {
    const feedback = document.getElementById('bio-microscope-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    setElementStateColor(feedback, stateName);
}

function setBioMicroscopeText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function normalizeBioMicroscopeAnswer(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[·.]/g, '')
        .replace(/\s+/g, ' ');
}

function shuffleBioMicroscopeItems(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

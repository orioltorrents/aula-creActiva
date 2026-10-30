const fisicaQuimicaFactorsUnits = {
    length: {
        label: 'Longitud',
        groupKey: 'other',
        units: [
            { symbol: 'mm', scale: 0.001 },
            { symbol: 'cm', scale: 0.01 },
            { symbol: 'dm', scale: 0.1 },
            { symbol: 'm', scale: 1 },
            { symbol: 'dam', scale: 10 },
            { symbol: 'hm', scale: 100 },
            { symbol: 'km', scale: 1000 }
        ]
    },
    mass: {
        label: 'Massa',
        groupKey: 'mass',
        units: [
            { symbol: 'mg', scale: 0.001 },
            { symbol: 'cg', scale: 0.01 },
            { symbol: 'dg', scale: 0.1 },
            { symbol: 'g', scale: 1 },
            { symbol: 'dag', scale: 10 },
            { symbol: 'hg', scale: 100 },
            { symbol: 'kg', scale: 1000 }
        ]
    },
    time: {
        label: 'Temps',
        groupKey: 'other',
        units: [
            { symbol: 's', scale: 1 },
            { symbol: 'min', scale: 60 },
            { symbol: 'h', scale: 3600 }
        ]
    },
    area: {
        label: 'Superfície',
        groupKey: 'other',
        units: [
            { symbol: 'mm²', scale: 0.000001 },
            { symbol: 'cm²', scale: 0.0001 },
            { symbol: 'dm²', scale: 0.01 },
            { symbol: 'm²', scale: 1 },
            { symbol: 'dam²', scale: 100 },
            { symbol: 'hm²', scale: 10000 },
            { symbol: 'km²', scale: 1000000 }
        ]
    },
    volume: {
        label: 'Capacitat',
        groupKey: 'capacity',
        units: [
            { symbol: 'mL', scale: 0.001 },
            { symbol: 'cL', scale: 0.01 },
            { symbol: 'dL', scale: 0.1 },
            { symbol: 'L', scale: 1 },
            { symbol: 'daL', scale: 10 },
            { symbol: 'hL', scale: 100 },
            { symbol: 'kL', scale: 1000 }
        ]
    },
    cubic: {
        label: 'Volum cúbic',
        groupKey: 'cubic',
        units: [
            { symbol: 'mm³', scale: 0.000000001 },
            { symbol: 'cm³', scale: 0.000001 },
            { symbol: 'dm³', scale: 0.001 },
            { symbol: 'm³', scale: 1 }
        ]
    }
};

const fisicaQuimicaFactorsBankGroups = [
    { key: 'mass', label: 'Massa' },
    { key: 'cubic', label: 'Volum cúbic' },
    { key: 'bridge', label: 'Ponts d’equivalència' },
    { key: 'capacity', label: 'Capacitat' },
    { key: 'other', label: 'Altres magnituds' }
];

const fisicaQuimicaFactorsBridgeBank = [
    {
        id: 'bridge-mL-to-cm³',
        groupKey: 'bridge',
        numerator: { value: 1, unit: 'cm³' },
        denominator: { value: 1, unit: 'mL' }
    },
    {
        id: 'bridge-cm³-to-mL',
        groupKey: 'bridge',
        numerator: { value: 1, unit: 'mL' },
        denominator: { value: 1, unit: 'cm³' }
    },
    {
        id: 'bridge-L-to-dm³',
        groupKey: 'bridge',
        numerator: { value: 1, unit: 'dm³' },
        denominator: { value: 1, unit: 'L' }
    },
    {
        id: 'bridge-dm³-to-L',
        groupKey: 'bridge',
        numerator: { value: 1, unit: 'L' },
        denominator: { value: 1, unit: 'dm³' }
    },
    {
        id: 'bridge-kL-to-m³',
        groupKey: 'bridge',
        numerator: { value: 1, unit: 'm³' },
        denominator: { value: 1, unit: 'kL' }
    },
    {
        id: 'bridge-m³-to-kL',
        groupKey: 'bridge',
        numerator: { value: 1, unit: 'kL' },
        denominator: { value: 1, unit: 'm³' }
    }
];

const fisicaQuimicaFactorsLevels = {
    basic: { label: 'Bàsic', minSteps: 1, maxSteps: 1 },
    intermediate: { label: 'Intermedi', minSteps: 2, maxSteps: 3 },
    advanced: { label: 'Avançat' }
};

const fisicaQuimicaFactorsState = {
    level: 'basic',
    levelLabel: 'Bàsic',
    questions: [],
    questionIndex: 0,
    correct: 0,
    selectedFactors: [],
    answered: false,
    startedAt: 0,
    finished: false,
    saving: false,
    saved: false
};

function fisicaQuimicaFactorsShuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
}

function fisicaQuimicaFactorsBuildBank(categoryKey) {
    const category = fisicaQuimicaFactorsUnits[categoryKey];
    const units = category.units;
    const factors = [];

    for (let index = 0; index < units.length - 1; index += 1) {
        const smaller = units[index];
        const larger = units[index + 1];
        const ratio = larger.scale / smaller.scale;

        factors.push({
            id: `${categoryKey}-${smaller.symbol}-to-${larger.symbol}`,
            groupKey: category.groupKey,
            numerator: { value: 1, unit: larger.symbol },
            denominator: { value: ratio, unit: smaller.symbol }
        });
        factors.push({
            id: `${categoryKey}-${larger.symbol}-to-${smaller.symbol}`,
            groupKey: category.groupKey,
            numerator: { value: ratio, unit: smaller.symbol },
            denominator: { value: 1, unit: larger.symbol }
        });
    }

    return factors;
}

function fisicaQuimicaFactorsBuildAllBanks() {
    const factors = Object.keys(fisicaQuimicaFactorsUnits)
        .flatMap(categoryKey => fisicaQuimicaFactorsBuildBank(categoryKey));
    return [...factors, ...fisicaQuimicaFactorsBridgeBank];
}

function fisicaQuimicaFactorsBuildPath(categoryKey, source, target) {
    const units = fisicaQuimicaFactorsUnits[categoryKey].units;
    const sourceIndex = units.findIndex(unit => unit.symbol === source.symbol);
    const targetIndex = units.findIndex(unit => unit.symbol === target.symbol);
    const path = [];

    for (let index = sourceIndex; index !== targetIndex;) {
        const nextIndex = index + (targetIndex > sourceIndex ? 1 : -1);
        path.push(`${categoryKey}-${units[index].symbol}-to-${units[nextIndex].symbol}`);
        index = nextIndex;
    }

    return path;
}

function fisicaQuimicaFactorsCreateDensityQuestion() {
    const massUnits = [fisicaQuimicaFactorsUnits.mass.units[3], fisicaQuimicaFactorsUnits.mass.units[6]];
    const volumeUnits = fisicaQuimicaFactorsUnits.cubic.units.slice(1);
    const combinations = massUnits.flatMap(mass => volumeUnits.map(volume => ({ mass, volume })));
    const sourceIndex = Math.floor(Math.random() * combinations.length);
    const source = combinations[sourceIndex];
    const targets = combinations.filter(candidate =>
        candidate.mass.symbol !== source.mass.symbol
        && candidate.volume.symbol !== source.volume.symbol);
    const target = targets[Math.floor(Math.random() * targets.length)];
    const startValues = [1500, 850, 2750, 0.75, 2.4];
    const startValue = startValues[Math.floor(Math.random() * startValues.length)];
    const sourceUnit = { symbol: `${source.mass.symbol}/${source.volume.symbol}` };
    const targetUnit = { symbol: `${target.mass.symbol}/${target.volume.symbol}` };
    const path = [
        ...fisicaQuimicaFactorsBuildPath('mass', source.mass, target.mass),
        ...fisicaQuimicaFactorsBuildPath('cubic', target.volume, source.volume)
    ];

    return {
        type: 'density',
        source: sourceUnit,
        target: targetUnit,
        startValue,
        expectedValue: startValue
            * source.mass.scale / target.mass.scale
            * target.volume.scale / source.volume.scale,
        path,
        factors: fisicaQuimicaFactorsShuffle(fisicaQuimicaFactorsBuildAllBanks())
    };
}

function fisicaQuimicaFactorsCreateQuestion(level) {
    if (level === 'advanced') return fisicaQuimicaFactorsCreateDensityQuestion();

    const levelConfig = fisicaQuimicaFactorsLevels[level];
    const availableCategories = Object.keys(fisicaQuimicaFactorsUnits)
        .filter(categoryKey => fisicaQuimicaFactorsUnits[categoryKey].units.length - 1 >= levelConfig.minSteps);
    const categoryKey = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const category = fisicaQuimicaFactorsUnits[categoryKey];
    const maxSteps = Math.min(levelConfig.maxSteps, category.units.length - 1);
    const steps = levelConfig.minSteps + Math.floor(Math.random() * (maxSteps - levelConfig.minSteps + 1));
    const startIndex = Math.floor(Math.random() * (category.units.length - steps));
    const ascending = Math.random() < 0.5;
    const sourceIndex = ascending ? startIndex : startIndex + steps;
    const targetIndex = ascending ? startIndex + steps : startIndex;
    const source = category.units[sourceIndex];
    const target = category.units[targetIndex];
    const startValue = 2 + Math.floor(Math.random() * 9);
    const path = fisicaQuimicaFactorsBuildPath(categoryKey, source, target);

    const expectedValue = startValue * source.scale / target.scale;
    return {
        categoryKey,
        categoryLabel: category.label,
        source,
        target,
        startValue,
        expectedValue,
        path,
        factors: fisicaQuimicaFactorsShuffle(fisicaQuimicaFactorsBuildAllBanks())
    };
}

function initFisicaQuimicaFactorsGame() {
    Object.assign(fisicaQuimicaFactorsState, {
        level: 'basic',
        levelLabel: 'Bàsic',
        questions: [],
        questionIndex: 0,
        correct: 0,
        selectedFactors: [],
        answered: false,
        startedAt: 0,
        finished: false,
        saving: false,
        saved: false
    });

    document.getElementById('fq-factors-setup').classList.remove('hidden');
    document.getElementById('fq-factors-game').classList.add('hidden');
    document.getElementById('fq-factors-results').classList.add('hidden');
    document.getElementById('fq-factors-save-retry').classList.add('hidden');

    const dropZone = document.getElementById('fq-factors-drop-zone');
    if (dropZone.dataset.eventsBound !== 'true') {
        dropZone.dataset.eventsBound = 'true';
        dropZone.addEventListener('dragover', event => {
            event.preventDefault();
            dropZone.classList.add('fq-factors__drop-zone--active');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('fq-factors__drop-zone--active');
        });
        dropZone.addEventListener('drop', event => {
            event.preventDefault();
            dropZone.classList.remove('fq-factors__drop-zone--active');
            const factorId = event.dataTransfer?.getData('text/plain');
            if (factorId) addFisicaQuimicaFactorsItem(factorId);
        });
    }

    const bank = document.getElementById('fq-factors-bank');
    if (bank.dataset.eventsBound !== 'true') {
        bank.dataset.eventsBound = 'true';
        bank.addEventListener('click', event => {
            const factorButton = event.target.closest('[data-factor-id]');
            if (factorButton) addFisicaQuimicaFactorsItem(factorButton.dataset.factorId);
        });
        bank.addEventListener('dragstart', event => {
            const factorButton = event.target.closest('[data-factor-id]');
            if (!factorButton) return;
            event.dataTransfer.setData('text/plain', factorButton.dataset.factorId);
        });
    }

    if (dropZone.dataset.removeBound !== 'true') {
        dropZone.dataset.removeBound = 'true';
        dropZone.addEventListener('click', event => {
            const factorButton = event.target.closest('[data-remove-index]');
            if (factorButton) removeFisicaQuimicaFactorsItem(Number(factorButton.dataset.removeIndex));
        });
    }
}

function startFisicaQuimicaFactorsRound(level) {
    const levelConfig = fisicaQuimicaFactorsLevels[level];
    if (!levelConfig) {
        throw new Error(`Nivell de factors de conversió desconegut: ${level}`);
    }

    Object.assign(fisicaQuimicaFactorsState, {
        level,
        levelLabel: levelConfig.label,
        questions: Array.from({ length: 10 }, () => fisicaQuimicaFactorsCreateQuestion(level)),
        questionIndex: 0,
        correct: 0,
        selectedFactors: [],
        answered: false,
        startedAt: Date.now(),
        finished: false,
        saving: false,
        saved: false
    });

    document.getElementById('fq-factors-setup').classList.add('hidden');
    document.getElementById('fq-factors-game').classList.remove('hidden');
    document.getElementById('fq-factors-results').classList.add('hidden');
    renderFisicaQuimicaFactorsQuestion();
}

function renderFisicaQuimicaFactorsQuestion() {
    const question = fisicaQuimicaFactorsState.questions[fisicaQuimicaFactorsState.questionIndex];
    if (!question) {
        finishFisicaQuimicaFactorsRound();
        return;
    }

    fisicaQuimicaFactorsState.selectedFactors = [];
    fisicaQuimicaFactorsState.answered = false;
    document.getElementById('fq-factors-progress').textContent =
        `Exercici ${fisicaQuimicaFactorsState.questionIndex + 1}/${fisicaQuimicaFactorsState.questions.length}`;
    document.getElementById('fq-factors-score').textContent = `Encerts: ${fisicaQuimicaFactorsState.correct}`;
    document.getElementById('fq-factors-level').textContent = `Nivell: ${fisicaQuimicaFactorsState.levelLabel}`;
    document.getElementById('fq-factors-problem').textContent =
        `${question.startValue} ${question.source.symbol} → ? ${question.target.symbol}`;
    document.getElementById('fq-factors-target-unit').textContent = question.target.symbol;
    document.getElementById('fq-factors-answer').value = '';
    document.getElementById('fq-factors-check').disabled = false;
    document.getElementById('fq-factors-next').classList.add('hidden');
    document.getElementById('fq-factors-feedback').textContent = '';
    setElementStateColor(document.getElementById('fq-factors-feedback'), 'muted');
    renderFisicaQuimicaFactorsBoard();
}

function renderFisicaQuimicaFactorsBoard() {
    const question = fisicaQuimicaFactorsState.questions[fisicaQuimicaFactorsState.questionIndex];
    const bank = document.getElementById('fq-factors-bank');
    const dropZone = document.getElementById('fq-factors-drop-zone');
    bank.replaceChildren();
    dropZone.replaceChildren();

    const startValue = document.createElement('span');
    startValue.className = 'fq-factors__start-value';
    startValue.textContent = `${question.startValue} ${question.source.symbol}`;
    dropZone.appendChild(startValue);

    if (fisicaQuimicaFactorsState.selectedFactors.length === 0) {
        const operator = document.createElement('span');
        operator.className = 'fq-factors__operator';
        operator.textContent = '×';
        dropZone.appendChild(operator);
        const placeholder = document.createElement('span');
        placeholder.className = 'fq-factors__placeholder';
        placeholder.textContent = 'Selecciona o arrossega aquí els factors, en ordre.';
        dropZone.appendChild(placeholder);
    } else {
        fisicaQuimicaFactorsState.selectedFactors.forEach((factorId, index) => {
            const factor = question.factors.find(item => item.id === factorId);
            const operator = document.createElement('span');
            operator.className = 'fq-factors__operator';
            operator.textContent = '×';
            dropZone.append(operator, createFisicaQuimicaFactorsButton(factor, index));
        });
    }

    fisicaQuimicaFactorsBankGroups.forEach(group => {
        const factors = question.factors.filter(factor => factor.groupKey === group.key);
        const section = document.createElement('section');
        section.className = 'fq-factors__bank-group';

        const heading = document.createElement('h4');
        heading.className = 'fq-factors__bank-heading';
        heading.textContent = group.label;
        const list = document.createElement('div');
        list.className = 'fq-factors__bank-list';
        factors.forEach(factor => list.appendChild(createFisicaQuimicaFactorsButton(factor)));
        section.append(heading, list);
        bank.appendChild(section);
    });
}

function createFisicaQuimicaFactorsButton(factor, removeIndex = null) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = removeIndex === null
        ? 'fq-factors__fraction'
        : 'fq-factors__fraction fq-factors__fraction--placed';

    if (removeIndex === null) {
        button.dataset.factorId = factor.id;
        button.draggable = true;
        button.setAttribute('aria-label',
            `Afegeix el factor ${factor.numerator.value} ${factor.numerator.unit} sobre ${factor.denominator.value} ${factor.denominator.unit}`);
    } else {
        button.dataset.removeIndex = String(removeIndex);
        button.setAttribute('aria-label',
            `Retira el factor ${factor.numerator.value} ${factor.numerator.unit} sobre ${factor.denominator.value} ${factor.denominator.unit}`);
        button.title = 'Selecciona per retirar aquest factor';
    }

    const numerator = document.createElement('span');
    numerator.textContent = `${factor.numerator.value} ${factor.numerator.unit}`;
    const line = document.createElement('span');
    line.className = 'fq-factors__fraction-line';
    const denominator = document.createElement('span');
    denominator.textContent = `${factor.denominator.value} ${factor.denominator.unit}`;
    button.append(numerator, line, denominator);
    return button;
}

function addFisicaQuimicaFactorsItem(factorId) {
    const question = fisicaQuimicaFactorsState.questions[fisicaQuimicaFactorsState.questionIndex];
    if (fisicaQuimicaFactorsState.answered || !question?.factors.some(factor => factor.id === factorId)) return;
    fisicaQuimicaFactorsState.selectedFactors.push(factorId);
    renderFisicaQuimicaFactorsBoard();
}

function removeFisicaQuimicaFactorsItem(index) {
    if (fisicaQuimicaFactorsState.answered) return;
    fisicaQuimicaFactorsState.selectedFactors.splice(index, 1);
    renderFisicaQuimicaFactorsBoard();
}

function checkFisicaQuimicaFactorsAnswer() {
    const state = fisicaQuimicaFactorsState;
    if (state.answered || state.finished || state.saving) return;

    const question = state.questions[state.questionIndex];
    const input = document.getElementById('fq-factors-answer');
    const feedback = document.getElementById('fq-factors-feedback');
    if (!state.selectedFactors.length || input.value.trim() === '') {
        feedback.textContent = 'Construeix la cadena de factors i introdueix el resultat abans de comprovar.';
        setElementStateColor(feedback, 'warning');
        return;
    }

    const factorsCorrect = state.selectedFactors.length === question.path.length
        && state.selectedFactors.every((factorId, index) => factorId === question.path[index]);
    const answer = Number(input.value);
    const numericCorrect = Number.isFinite(answer)
        && Math.abs(answer - question.expectedValue) <= Math.max(1e-9, Math.abs(question.expectedValue) * 1e-9);
    const isCorrect = factorsCorrect && numericCorrect;

    state.answered = true;
    if (isCorrect) state.correct += 1;
    feedback.textContent = isCorrect
        ? 'Correcte! Els factors cancel·len les unitats intermèdies i el resultat és correcte.'
        : `No és correcte. La cadena tenia ${question.path.length} factor${question.path.length === 1 ? '' : 's'} i el resultat és ${question.expectedValue} ${question.target.symbol}.`;
    setElementStateColor(feedback, isCorrect ? 'success' : 'error');
    document.getElementById('fq-factors-check').disabled = true;
    document.getElementById('fq-factors-next').classList.remove('hidden');
    document.getElementById('fq-factors-score').textContent = `Encerts: ${state.correct}`;
}

function nextFisicaQuimicaFactorsQuestion() {
    if (!fisicaQuimicaFactorsState.answered || fisicaQuimicaFactorsState.finished) return;
    fisicaQuimicaFactorsState.questionIndex += 1;
    renderFisicaQuimicaFactorsQuestion();
}

function finishFisicaQuimicaFactorsRound() {
    const state = fisicaQuimicaFactorsState;
    state.finished = true;
    document.getElementById('fq-factors-game').classList.add('hidden');
    document.getElementById('fq-factors-results').classList.remove('hidden');

    const percentage = Math.round(state.correct / state.questions.length * 100);
    document.getElementById('fq-factors-final-score').textContent =
        `${state.correct}/${state.questions.length} encerts · ${percentage}%`;
    saveFisicaQuimicaFactorsResult();
}

async function saveFisicaQuimicaFactorsResult() {
    const gameState = fisicaQuimicaFactorsState;
    if (gameState.saving || gameState.saved || !gameState.finished) return;

    const feedback = document.getElementById('fq-factors-save-feedback');
    if (typeof state === 'undefined' || !state.user || !state.currentProject
        || typeof callApi !== 'function') {
        feedback.textContent = 'No es pot desar la puntuació perquè falta la sessió d’usuari o la connexió amb el servei.';
        setElementStateColor(feedback, 'error');
        document.getElementById('fq-factors-save-retry').classList.remove('hidden');
        return;
    }

    gameState.saving = true;
    document.getElementById('fq-factors-save-retry').classList.add('hidden');
    feedback.textContent = 'Desant la puntuació…';
    setElementStateColor(feedback, 'muted');

    const percentage = Math.round(gameState.correct / gameState.questions.length * 100);
    const elapsedSeconds = Math.round((Date.now() - gameState.startedAt) / 1000);
    try {
        const result = await callApi('saveResult', {
            email: state.user.email,
            curs: state.user.curs,
            grup: state.user.grup || state.user.curs,
            projecte: state.currentProject.titol,
            app: 'Factors de conversió',
            nivell: gameState.levelLabel,
            puntuacio: percentage,
            temps_segons: elapsedSeconds,
            feedback_pos: `Encerts: ${gameState.correct}/${gameState.questions.length}`,
            feedback_neg: ''
        });
        if (!result || result.status !== 'success') {
            throw new Error(result?.message || 'El servei no ha confirmat el desament.');
        }

        gameState.saved = true;
        feedback.textContent = 'Puntuació desada correctament.';
        setElementStateColor(feedback, 'success');
    } catch (error) {
        console.error('Error desant la puntuació dels factors de conversió:', error);
        feedback.textContent = 'No s’ha pogut desar la puntuació. Comprova la connexió i torna-ho a provar.';
        setElementStateColor(feedback, 'error');
        document.getElementById('fq-factors-save-retry').classList.remove('hidden');
    } finally {
        gameState.saving = false;
    }
}

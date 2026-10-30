const fisicaQuimicaSIPrefixes = [
    { name: 'giga', symbol: 'G', exponent: 9, kind: 'multiple' },
    { name: 'mega', symbol: 'M', exponent: 6, kind: 'multiple' },
    { name: 'quilo', symbol: 'k', exponent: 3, kind: 'multiple' },
    { name: 'hecto', symbol: 'h', exponent: 2, kind: 'multiple' },
    { name: 'deca', symbol: 'da', exponent: 1, kind: 'multiple' },
    { name: 'deci', symbol: 'd', exponent: -1, kind: 'submultiple' },
    { name: 'centi', symbol: 'c', exponent: -2, kind: 'submultiple' },
    { name: 'mil·li', symbol: 'm', exponent: -3, kind: 'submultiple' },
    { name: 'micro', symbol: 'µ', exponent: -6, kind: 'submultiple' },
    { name: 'nano', symbol: 'n', exponent: -9, kind: 'submultiple' }
];

const fisicaQuimicaSIUnits = [
    { id: 'metre', name: 'metre', symbol: 'm', quantity: 'longitud', quantityName: 'Longitud', type: 'fundamental', power: 1, baseExponent: 0, targetSymbol: 'm' },
    { id: 'gram', name: 'gram', symbol: 'g', quantity: 'massa', quantityName: 'Massa', type: 'fundamental', power: 1, baseExponent: -3, targetSymbol: 'kg' },
    { id: 'second', name: 'segon', symbol: 's', quantity: 'temps', quantityName: 'Temps', type: 'fundamental', power: 1, baseExponent: 0, targetSymbol: 's' },
    { id: 'kelvin', name: 'kelvin', symbol: 'K', quantity: 'temperatura', quantityName: 'Temperatura', type: 'fundamental', power: 1, baseExponent: 0, targetSymbol: 'K' },
    { id: 'ampere', name: 'ampere', symbol: 'A', quantity: 'intensitat', quantityName: 'Intensitat de corrent', type: 'fundamental', power: 1, baseExponent: 0, targetSymbol: 'A' },
    { id: 'square-metre', name: 'metre quadrat', symbol: 'm²', quantity: 'superficie', quantityName: 'Superfície', type: 'derivada', power: 2, baseExponent: 0, targetSymbol: 'm²' },
    { id: 'cubic-metre', name: 'metre cúbic', symbol: 'm³', quantity: 'volum', quantityName: 'Volum', type: 'derivada', power: 3, baseExponent: 0, targetSymbol: 'm³' }
];

const fisicaQuimicaSIState = {
    question: null,
    attempts: 0,
    correctFields: 0,
    locked: false,
    startedAt: 0,
    saving: false,
    finished: false
};

function fisicaQuimicaSIChoose(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function fisicaQuimicaSIPopulateSelect(selectId, options, placeholder) {
    const select = document.getElementById(selectId);
    if (!select) {
        throw new Error(`No existeix el selector #${selectId}.`);
    }

    select.replaceChildren(new Option(placeholder, ''));
    options.forEach(({ value, label }) => {
        select.add(new Option(label, value));
    });
}

function initFisicaQuimicaSIGame() {
    fisicaQuimicaSIState.attempts = 0;
    fisicaQuimicaSIState.correctFields = 0;
    fisicaQuimicaSIState.locked = false;
    fisicaQuimicaSIState.startedAt = Date.now();
    fisicaQuimicaSIState.saving = false;
    fisicaQuimicaSIState.finished = false;

    fisicaQuimicaSIPopulateSelect(
        'fq-si-magnitude',
        fisicaQuimicaSIUnits.map(unit => ({ value: unit.quantity, label: unit.quantityName })),
        'Selecciona una magnitud'
    );
    fisicaQuimicaSIPopulateSelect(
        'fq-si-prefix',
        fisicaQuimicaSIPrefixes.map(prefix => ({ value: prefix.name, label: `${prefix.name} (${prefix.symbol})` })),
        'Selecciona un prefix'
    );
    fisicaQuimicaSIPopulateSelect(
        'fq-si-unit-name',
        fisicaQuimicaSIUnits.map(unit => ({ value: unit.id, label: `${unit.name} (${unit.symbol})` })),
        'Selecciona una unitat'
    );

    nextFisicaQuimicaSIQuestion();
    const saveButton = document.getElementById('fq-si-save');
    saveButton.disabled = false;
    saveButton.textContent = 'Finalitza i desa la puntuació';
    const saveFeedback = document.getElementById('fq-si-save-feedback');
    saveFeedback.textContent = '';
    setElementStateColor(saveFeedback, 'muted');
}

function nextFisicaQuimicaSIQuestion() {
    if (fisicaQuimicaSIState.finished || fisicaQuimicaSIState.saving) return;
    const unit = fisicaQuimicaSIChoose(fisicaQuimicaSIUnits);
    const prefixOptions = fisicaQuimicaSIPrefixes.filter(
        item => item.kind === (Math.random() < 0.5 ? 'multiple' : 'submultiple')
    );
    const selectedPrefix = fisicaQuimicaSIChoose(prefixOptions);
    const exponent = selectedPrefix.exponent * unit.power + unit.baseExponent;

    fisicaQuimicaSIState.question = { unit, prefix: selectedPrefix, exponent };
    fisicaQuimicaSIState.locked = false;

    document.getElementById('fq-si-unit-display').textContent = `${selectedPrefix.symbol}${unit.symbol}`;
    document.getElementById('fq-si-equation-left').textContent = `1 ${selectedPrefix.symbol}${unit.symbol} =`;
    document.getElementById('fq-si-equation-right').textContent = unit.targetSymbol;
    ['fq-si-magnitude', 'fq-si-type', 'fq-si-prefix-kind', 'fq-si-prefix', 'fq-si-unit-name'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('fq-si-exponent').value = '';
    const feedback = document.getElementById('fq-si-feedback');
    feedback.textContent = '';
    setElementStateColor(feedback, 'muted');
    document.getElementById('fq-si-check').disabled = false;
    document.getElementById('fq-si-next').classList.add('hidden');
    document.getElementById('fq-si-next').disabled = false;
    updateFisicaQuimicaSIStats();
}

function checkFisicaQuimicaSIAnswer() {
    if (fisicaQuimicaSIState.locked || fisicaQuimicaSIState.saving || fisicaQuimicaSIState.finished || !fisicaQuimicaSIState.question) return;

    const answers = {
        magnitude: document.getElementById('fq-si-magnitude').value,
        type: document.getElementById('fq-si-type').value,
        prefixKind: document.getElementById('fq-si-prefix-kind').value,
        prefix: document.getElementById('fq-si-prefix').value,
        unit: document.getElementById('fq-si-unit-name').value,
        exponent: document.getElementById('fq-si-exponent').value
    };
    if (Object.values(answers).some(value => value === '')) {
        const feedback = document.getElementById('fq-si-feedback');
        feedback.textContent = 'Completa tots els camps abans de corregir.';
        setElementStateColor(feedback, 'warning');
        return;
    }

    const { unit, prefix, exponent } = fisicaQuimicaSIState.question;
    const checks = [
        answers.magnitude === unit.quantity,
        answers.type === unit.type,
        answers.prefixKind === prefix.kind,
        answers.prefix === prefix.name,
        answers.unit === unit.id,
        Number(answers.exponent) === exponent
    ];
    const earned = checks.filter(Boolean).length;
    fisicaQuimicaSIState.attempts += 1;
    fisicaQuimicaSIState.correctFields += earned;
    fisicaQuimicaSIState.locked = true;

    const feedback = document.getElementById('fq-si-feedback');
    if (earned === checks.length) {
        feedback.textContent = 'Molt bé! Totes les respostes són correctes.';
        setElementStateColor(feedback, 'success');
    } else {
        const sign = exponent > 0 ? '+' : '';
        const typeName = unit.type === 'fundamental' ? 'fonamental' : 'derivada';
        const prefixKindName = prefix.kind === 'multiple' ? 'múltiple' : 'submúltiple';
        feedback.textContent = `Has encertat ${earned} de ${checks.length}. Solució: ${unit.quantityName}, ${typeName}, ${prefixKindName}; prefix ${prefix.name}, unitat ${unit.name}; exponent ${sign}${exponent}.`;
        setElementStateColor(feedback, earned === 0 ? 'error' : 'warning');
    }

    document.getElementById('fq-si-check').disabled = true;
    document.getElementById('fq-si-next').classList.remove('hidden');
    updateFisicaQuimicaSIStats();
}

async function saveFisicaQuimicaSIResult() {
    if (fisicaQuimicaSIState.saving || fisicaQuimicaSIState.finished) return;

    const feedback = document.getElementById('fq-si-save-feedback');
    if (fisicaQuimicaSIState.attempts === 0) {
        feedback.textContent = 'Respon com a mínim un exercici abans de desar la puntuació.';
        setElementStateColor(feedback, 'warning');
        return;
    }

    if (typeof state === 'undefined' || !state.user || !state.currentProject || typeof callApi !== 'function') {
        feedback.textContent = 'No es pot desar la puntuació perquè falta la sessió d’usuari o la connexió amb el servei.';
        setElementStateColor(feedback, 'error');
        return;
    }

    fisicaQuimicaSIState.saving = true;
    const saveButton = document.getElementById('fq-si-save');
    saveButton.disabled = true;
    document.getElementById('fq-si-check').disabled = true;
    document.getElementById('fq-si-next').disabled = true;
    feedback.textContent = 'Desant la puntuació…';
    setElementStateColor(feedback, 'muted');

    const percentage = Math.round(
        (fisicaQuimicaSIState.correctFields / (fisicaQuimicaSIState.attempts * 6)) * 100
    );
    const elapsedSeconds = Math.round((Date.now() - fisicaQuimicaSIState.startedAt) / 1000);

    try {
        const result = await callApi('saveResult', {
            email: state.user.email,
            curs: state.user.curs,
            grup: state.user.grup || state.user.curs,
            projecte: state.currentProject.titol,
            app: 'Magnituds i prefixos del SI',
            nivell: 'Pràctica continuada',
            puntuacio: percentage,
            temps_segons: elapsedSeconds,
            feedback_pos: `Punts: ${fisicaQuimicaSIState.correctFields}/${fisicaQuimicaSIState.attempts * 6}; intents: ${fisicaQuimicaSIState.attempts}`,
            feedback_neg: ''
        });

        if (!result || result.status !== 'success') {
            throw new Error(result?.message || 'El servei no ha confirmat el desament.');
        }

        fisicaQuimicaSIState.finished = true;
        feedback.textContent = 'Puntuació desada correctament. Ja pots tornar al menú.';
        setElementStateColor(feedback, 'success');
        saveButton.textContent = 'Puntuació desada';
        document.getElementById('fq-si-next').disabled = true;
    } catch (error) {
        console.error('Error desant la puntuació del repàs del SI:', error);
        feedback.textContent = 'No s’ha pogut desar la puntuació. Comprova la connexió i torna-ho a provar.';
        setElementStateColor(feedback, 'error');
        saveButton.disabled = false;
        document.getElementById('fq-si-check').disabled = fisicaQuimicaSIState.locked;
        document.getElementById('fq-si-next').disabled = false;
    } finally {
        fisicaQuimicaSIState.saving = false;
    }
}

function updateFisicaQuimicaSIStats() {
    const score = fisicaQuimicaSIState.attempts === 0
        ? 0
        : (fisicaQuimicaSIState.correctFields / (fisicaQuimicaSIState.attempts * 6)) * 10;
    document.getElementById('fq-si-score').textContent = `Puntuació: ${score.toFixed(1).replace('.', ',')}/10`;
    document.getElementById('fq-si-attempts').textContent = `Intents: ${fisicaQuimicaSIState.attempts}`;
}

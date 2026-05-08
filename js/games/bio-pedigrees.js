const BIO_PEDIGREE_IMAGE_BASE = 'assets/images/activities/biologia/pedigrees/';
const BIO_PEDIGREE_MAX_ROUNDS = 8;

let bioPedigreeState = {
    allItems: [],
    rounds: [],
    currentIndex: 0,
    correctCells: 0,
    totalCells: 0,
    startedAt: null,
    selectedLevel: null
};

async function initBioPedigreeGame() {
    bioPedigreeState = {
        allItems: [],
        rounds: [],
        currentIndex: 0,
        correctCells: 0,
        totalCells: 0,
        startedAt: null,
        selectedLevel: null
    };

    showBioPedigreeSection('bio-pedigree-loader');
    setBioPedigreeFeedback('', '');
    bindBioPedigreeButtons();

    try {
        const response = await callApi('getBioPedigreeData', { sheetName: 'biologia_pedigrees', refresh: 1 });

        if (!response || response.status !== 'success' || !Array.isArray(response.items)) {
            showBioPedigreeError(response && response.message ? response.message : 'No he pogut carregar els pedigrees.');
            return;
        }

        bioPedigreeState.allItems = response.items;
        renderBioPedigreeLevelSelector();
    } catch (error) {
        console.error('Error carregant pedigrees:', error);
        showBioPedigreeError('No he pogut connectar amb el Google Sheet.');
    }
}

function bindBioPedigreeButtons() {
    const checkBtn = document.getElementById('bio-pedigree-check-btn');
    const nextBtn = document.getElementById('bio-pedigree-next-btn');

    if (checkBtn) {
        checkBtn.removeEventListener('click', checkBioPedigreeAnswers);
        checkBtn.addEventListener('click', checkBioPedigreeAnswers);
    }

    if (nextBtn) {
        nextBtn.removeEventListener('click', nextBioPedigreeRound);
        nextBtn.addEventListener('click', nextBioPedigreeRound);
    }
}

function renderBioPedigreeLevelSelector() {
    const container = document.getElementById('bio-pedigree-level-buttons');
    if (!container) return;

    const levels = Array.from(new Set(bioPedigreeState.allItems.map(item => item.level || 'General'))).sort();
    container.innerHTML = '';

    levels.forEach(level => {
        const button = document.createElement('button');
        button.className = `btn btn--primary btn--auto-width quiz-filter-button ${getQuizFilterButtonModifier('difficulty', level)}`;
        button.type = 'button';
        button.textContent = level;
        button.addEventListener('click', () => startBioPedigreeRounds(level));
        container.appendChild(button);
    });

    const mixedButton = document.createElement('button');
    mixedButton.className = 'btn btn--secondary btn--auto-width quiz-filter-button quiz-filter-button--mixed';
    mixedButton.type = 'button';
    mixedButton.textContent = 'Barrejat';
    mixedButton.addEventListener('click', () => startBioPedigreeRounds(null));
    container.appendChild(mixedButton);

    showBioPedigreeSection('bio-pedigree-selector');
}

function startBioPedigreeRounds(level) {
    const pool = level
        ? bioPedigreeState.allItems.filter(item => item.level === level)
        : bioPedigreeState.allItems;

    bioPedigreeState.rounds = shuffleBioPedigreeItems(pool).slice(0, BIO_PEDIGREE_MAX_ROUNDS);
    bioPedigreeState.currentIndex = 0;
    bioPedigreeState.correctCells = 0;
    bioPedigreeState.totalCells = 0;
    bioPedigreeState.selectedLevel = level || 'Barrejat';
    bioPedigreeState.startedAt = Date.now();

    renderBioPedigreeRound();
}

function renderBioPedigreeRound() {
    const item = bioPedigreeState.rounds[bioPedigreeState.currentIndex];
    if (!item) {
        finishBioPedigreeGame();
        return;
    }

    showBioPedigreeSection('bio-pedigree-game');
    setBioPedigreeText('bio-pedigree-progress', `Pedigree ${bioPedigreeState.currentIndex + 1} / ${bioPedigreeState.rounds.length}`);
    setBioPedigreeText('bio-pedigree-score', `Encerts: ${bioPedigreeState.correctCells} / ${bioPedigreeState.totalCells}`);
    setBioPedigreeText('bio-pedigree-level', item.level || 'General');
    setBioPedigreeText('bio-pedigree-title', item.title || `Pedigree ${bioPedigreeState.currentIndex + 1}`);
    setBioPedigreeText('bio-pedigree-inheritance', formatBioPedigreeInheritance(item.inheritance));
    setBioPedigreeFeedback('', '');

    const img = document.getElementById('bio-pedigree-image');
    if (img) {
        img.src = getBioPedigreeImagePath(item.image);
        img.alt = item.title || 'Pedigree genetic';
        img.onerror = () => {
            img.onerror = null;
            img.src = buildBioPedigreePlaceholder(item.image || 'Sense imatge');
        };
    }

    document.getElementById('bio-pedigree-next-btn')?.classList.add('hidden');
    const checkBtn = document.getElementById('bio-pedigree-check-btn');
    if (checkBtn) checkBtn.disabled = false;

    renderBioPedigreePatternCheck(item);
    renderBioPedigreeTable(item);
}

function renderBioPedigreePatternCheck(item) {
    const wrapper = document.getElementById('bio-pedigree-pattern-check');
    if (!wrapper) return;

    const expected = parseBioPedigreeBoolean(item.patternPossible);
    wrapper.classList.toggle('hidden', expected === null);
    wrapper.dataset.answer = expected === null ? '' : String(expected);
    wrapper.classList.remove('bio-pedigree__pattern-check--correct', 'bio-pedigree__pattern-check--incorrect');
    delete wrapper.dataset.correctLabel;

    wrapper.querySelectorAll('input').forEach(input => {
        input.checked = false;
        input.disabled = false;
    });
}

function renderBioPedigreeTable(item) {
    const table = document.getElementById('bio-pedigree-table');
    if (!table) return;

    const byGeneration = groupBioPedigreeAnswersByGeneration(item.answers || []);
    table.innerHTML = '';

    Object.keys(byGeneration).forEach(generation => {
        const row = document.createElement('div');
        row.className = 'bio-pedigree__generation-row';

        const label = document.createElement('div');
        label.className = 'bio-pedigree__generation-label';
        label.textContent = generation;
        row.appendChild(label);

        byGeneration[generation].forEach(answer => {
            const field = document.createElement('label');
            field.className = 'bio-pedigree__field';
            field.dataset.answer = normalizeBioPedigreeAnswer(answer.answer);

            const name = document.createElement('span');
            name.textContent = answer.id;

            const input = document.createElement('input');
            input.type = 'text';
            input.autocomplete = 'off';
            input.spellcheck = false;
            input.inputMode = 'text';
            input.placeholder = 'Aa';
            input.dataset.personId = answer.id;

            field.appendChild(name);
            field.appendChild(input);
            row.appendChild(field);
        });

        table.appendChild(row);
    });
}

function groupBioPedigreeAnswersByGeneration(answers) {
    return answers.reduce((groups, answer) => {
        const generation = answer.generation || answer.id.split('-')[0] || 'I';
        if (!groups[generation]) groups[generation] = [];
        groups[generation].push(answer);
        return groups;
    }, {});
}

function checkBioPedigreeAnswers() {
    const fields = [...document.querySelectorAll('#bio-pedigree-table .bio-pedigree__field')];
    const patternResult = checkBioPedigreePatternAnswer();
    if (fields.length === 0 && patternResult.total === 0) return;

    let roundCorrect = 0;

    fields.forEach(field => {
        const input = field.querySelector('input');
        const expected = field.dataset.answer || '';
        const given = normalizeBioPedigreeAnswer(input ? input.value : '');
        const isCorrect = given !== '' && given === expected;

        field.classList.toggle('bio-pedigree__field--correct', isCorrect);
        field.classList.toggle('bio-pedigree__field--incorrect', !isCorrect);
        if (input) {
            input.disabled = true;
            input.value = input.value.trim();
        }
        if (!isCorrect) {
            field.dataset.correctLabel = expected;
        }
        if (isCorrect) roundCorrect += 1;
    });

    roundCorrect += patternResult.correct;
    const roundTotal = fields.length + patternResult.total;

    bioPedigreeState.correctCells += roundCorrect;
    bioPedigreeState.totalCells += roundTotal;

    const roundPercent = Math.round((roundCorrect / roundTotal) * 100);
    setBioPedigreeText('bio-pedigree-score', `Encerts: ${bioPedigreeState.correctCells} / ${bioPedigreeState.totalCells}`);
    setBioPedigreeFeedback(
        `${roundCorrect} de ${roundTotal} respostes correctes (${roundPercent}%).`,
        roundCorrect === roundTotal ? 'success' : 'warning'
    );

    const checkBtn = document.getElementById('bio-pedigree-check-btn');
    if (checkBtn) checkBtn.disabled = true;
    document.getElementById('bio-pedigree-next-btn')?.classList.remove('hidden');
}

function checkBioPedigreePatternAnswer() {
    const wrapper = document.getElementById('bio-pedigree-pattern-check');
    if (!wrapper || wrapper.classList.contains('hidden') || wrapper.dataset.answer === '') {
        return { correct: 0, total: 0 };
    }

    const expected = wrapper.dataset.answer === 'true';
    const selected = wrapper.querySelector('input:checked');
    const selectedValue = selected ? selected.value === 'yes' : null;
    const isCorrect = selectedValue === expected;

    wrapper.classList.toggle('bio-pedigree__pattern-check--correct', isCorrect);
    wrapper.classList.toggle('bio-pedigree__pattern-check--incorrect', !isCorrect);
    wrapper.dataset.correctLabel = expected ? 'Si' : 'No';
    wrapper.querySelectorAll('input').forEach(input => {
        input.disabled = true;
    });

    return { correct: isCorrect ? 1 : 0, total: 1 };
}

function nextBioPedigreeRound() {
    bioPedigreeState.currentIndex += 1;
    renderBioPedigreeRound();
}

function finishBioPedigreeGame() {
    const percentage = bioPedigreeState.totalCells > 0
        ? Math.round((bioPedigreeState.correctCells / bioPedigreeState.totalCells) * 100)
        : 0;
    const elapsedSeconds = bioPedigreeState.startedAt
        ? Math.round((Date.now() - bioPedigreeState.startedAt) / 1000)
        : 0;

    showBioPedigreeSection('bio-pedigree-results');
    setBioPedigreeText('bio-pedigree-final-score', `${percentage}%`);
    setBioPedigreeText(
        'bio-pedigree-message',
        percentage >= 80
            ? 'Molt be: interpretes els patrons familiars i els genotips amb seguretat.'
            : 'Repassa com es dedueixen els genotips a partir del fenotip i la descendencia.'
    );

    saveBioPedigreeResult(percentage, elapsedSeconds);
}

function restartBioPedigreeGame() {
    if (bioPedigreeState.allItems.length > 0) {
        renderBioPedigreeLevelSelector();
    } else {
        initBioPedigreeGame();
    }
}

async function saveBioPedigreeResult(percentage, elapsedSeconds) {
    if (typeof callApi !== 'function' || typeof state === 'undefined' || !state.user) return;

    await callApi('saveResult', {
        email: state.user.email,
        curs: state.user.curs,
        grup: state.user.grup || state.user.curs,
        projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
        app: 'Pedigrees i genotips',
        nivell: bioPedigreeState.selectedLevel || 'Barrejat',
        puntuacio: percentage,
        temps_segons: elapsedSeconds,
        feedback_pos: `${bioPedigreeState.correctCells}/${bioPedigreeState.totalCells} genotips correctes`,
        feedback_neg: percentage >= 80 ? '' : 'Cal repassar la deduccio de genotips'
    });
}

function showBioPedigreeSection(sectionId) {
    ['bio-pedigree-loader', 'bio-pedigree-selector', 'bio-pedigree-game', 'bio-pedigree-results'].forEach(id => {
        document.getElementById(id)?.classList.toggle('hidden', id !== sectionId);
    });
}

function showBioPedigreeError(message) {
    showBioPedigreeSection('bio-pedigree-selector');
    const container = document.getElementById('bio-pedigree-level-buttons');
    if (container) {
        container.innerHTML = `<p class="quiz-feedback--error">${escapeBioPedigreeHtml(message)}</p>`;
    }
}

function setBioPedigreeText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function setBioPedigreeFeedback(message, stateName) {
    const feedback = document.getElementById('bio-pedigree-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    setElementStateColor(feedback, stateName);
}

function normalizeBioPedigreeAnswer(value) {
    return String(value || '')
        .trim()
        .replace(/\s+/g, '')
        .replace(/[×x]/g, 'X')
        .replace(/[⁺＋]/g, '+')
        .replace(/[⁻−]/g, '-')
        .toLowerCase();
}

function parseBioPedigreeBoolean(value) {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return null;
    if (['si', 'sí', 's', 'yes', 'y', 'true', '1', 'possible', 'compatible'].includes(text)) return true;
    if (['no', 'n', 'false', '0', 'impossible', 'incompatible'].includes(text)) return false;
    return null;
}

function formatBioPedigreeInheritance(value) {
    const rawValue = String(value || '').trim();
    const normalizedValue = rawValue
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace('AUTOSOMICA', 'AUTOSOMICA')
        .replace('AUTOSOMAL', 'AUTOSOMAL');

    if (!rawValue) return '';
    if (normalizedValue === 'AD') return 'Patro d herencia: autosomica dominant (AD)';
    if (normalizedValue === 'AR') return 'Patro d herencia: autosomica recessiva (AR)';
    return `Patro d herencia: ${rawValue}`;
}

function getBioPedigreeImagePath(fileName) {
    const cleanName = String(fileName || '').trim();
    if (/^https?:\/\//i.test(cleanName) || cleanName.startsWith('assets/')) return cleanName;
    return BIO_PEDIGREE_IMAGE_BASE + cleanName;
}

function buildBioPedigreePlaceholder(text) {
    const label = encodeURIComponent(String(text || 'Pedigree'));
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='560' viewBox='0 0 900 560'%3E%3Crect width='900' height='560' fill='%23f8fafc'/%3E%3Ctext x='450' y='280' text-anchor='middle' font-family='Arial' font-size='32' fill='%2364748b'%3E${label}%3C/text%3E%3C/svg%3E`;
}

function escapeBioPedigreeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function shuffleBioPedigreeItems(items) {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

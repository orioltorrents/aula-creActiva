const BIO_GENETICS_TOTAL_ROUNDS = 6;

const BIO_GENETICS_EXERCISES = [
    {
        id: 'mono_aa_aa_dominant',
        level: 'Monohibridisme',
        context: 'En els pesols, el color groc domina sobre el color verd.',
        parentA: 'Aa',
        parentB: 'Aa',
        dominance: 'complete',
        traits: { dominant: 'Groc', recessive: 'Verd', intermediate: 'Intermedi' },
        question: 'Quin percentatge de descendents tindra el fenotip dominant?',
        answer: { type: 'phenotype', key: 'dominant' }
    },
    {
        id: 'mono_aa_aa_recessive',
        level: 'Monohibridisme',
        context: 'En una especie imaginaria, el pel negre domina sobre el pel blanc.',
        parentA: 'Aa',
        parentB: 'Aa',
        dominance: 'complete',
        traits: { dominant: 'Negre', recessive: 'Blanc', intermediate: 'Intermedi' },
        question: 'Quin percentatge de descendents expressara el fenotip recessiu?',
        answer: { type: 'phenotype', key: 'recessive' }
    },
    {
        id: 'mono_aa_aa_heterozygous',
        level: 'Genotips',
        context: 'Creuem dos individus heterozigots per al mateix caracter.',
        parentA: 'Aa',
        parentB: 'Aa',
        dominance: 'complete',
        traits: { dominant: 'Dominant', recessive: 'Recessiu', intermediate: 'Intermedi' },
        question: 'Quin percentatge de descendents sera heterozigot Aa?',
        answer: { type: 'genotype', key: 'Aa' }
    },
    {
        id: 'mono_aa_aa_homo_rec',
        level: 'Genotips',
        context: 'Creuem dos individus portadors del mateix al.lel recessiu.',
        parentA: 'Aa',
        parentB: 'Aa',
        dominance: 'complete',
        traits: { dominant: 'Dominant', recessive: 'Recessiu', intermediate: 'Intermedi' },
        question: 'Quin percentatge de descendents sera homozigot recessiu aa?',
        answer: { type: 'genotype', key: 'aa' }
    },
    {
        id: 'mono_aa_aa_incomplete',
        level: 'Dominancia incompleta',
        context: 'En una flor, vermell i blanc mostren dominancia incompleta: els heterozigots son roses.',
        parentA: 'Aa',
        parentB: 'Aa',
        dominance: 'incomplete',
        traits: { dominant: 'Vermell', recessive: 'Blanc', intermediate: 'Rosa' },
        question: 'Quin percentatge de descendents tindra el fenotip intermedi?',
        answer: { type: 'phenotype', key: 'intermediate' }
    },
    {
        id: 'mono_aa_aa_testcross',
        level: 'Encreuament de prova',
        context: 'Un individu heterozigot es creua amb un homozigot recessiu.',
        parentA: 'Aa',
        parentB: 'aa',
        dominance: 'complete',
        traits: { dominant: 'Dominant', recessive: 'Recessiu', intermediate: 'Intermedi' },
        question: 'Quin percentatge de descendents tindra fenotip recessiu?',
        answer: { type: 'phenotype', key: 'recessive' }
    },
    {
        id: 'mono_aa_AA',
        level: 'Genotips',
        context: 'Un homozigot dominant es creua amb un homozigot recessiu.',
        parentA: 'AA',
        parentB: 'aa',
        dominance: 'complete',
        traits: { dominant: 'Dominant', recessive: 'Recessiu', intermediate: 'Intermedi' },
        question: 'Quin percentatge de descendents sera heterozigot Aa?',
        answer: { type: 'genotype', key: 'Aa' }
    },
    {
        id: 'mono_bb_Bb',
        level: 'Monohibridisme',
        context: 'El fenotip B domina sobre el fenotip b.',
        parentA: 'BB',
        parentB: 'Bb',
        dominance: 'complete',
        traits: { dominant: 'Fenotip B', recessive: 'Fenotip b', intermediate: 'Intermedi' },
        question: 'Quin percentatge de descendents tindra el fenotip dominant?',
        answer: { type: 'phenotype', key: 'dominant' }
    }
];

let bioGeneticsState = {
    roundIndex: 0,
    score: 0,
    rounds: [],
    current: null,
    currentResult: null,
    answered: false,
    startedAt: null
};

function initBioGeneticsSimGame() {
    bioGeneticsState = {
        roundIndex: 0,
        score: 0,
        rounds: [],
        current: null,
        currentResult: null,
        answered: false,
        startedAt: null
    };

    document.getElementById('bio-genetics-start')?.classList.remove('hidden');
    document.getElementById('bio-genetics-game')?.classList.add('hidden');
    document.getElementById('bio-genetics-results')?.classList.add('hidden');

    const startButton = document.getElementById('bio-genetics-start-btn');
    const nextButton = document.getElementById('bio-genetics-next-btn');

    if (startButton) {
        startButton.removeEventListener('click', startBioGeneticsRounds);
        startButton.addEventListener('click', startBioGeneticsRounds);
    }

    if (nextButton) {
        nextButton.removeEventListener('click', nextBioGeneticsRound);
        nextButton.addEventListener('click', nextBioGeneticsRound);
    }
}

function startBioGeneticsRounds() {
    bioGeneticsState.rounds = shuffleBioGeneticsItems(BIO_GENETICS_EXERCISES).slice(0, BIO_GENETICS_TOTAL_ROUNDS);
    bioGeneticsState.roundIndex = 0;
    bioGeneticsState.score = 0;
    bioGeneticsState.startedAt = Date.now();

    document.getElementById('bio-genetics-start')?.classList.add('hidden');
    document.getElementById('bio-genetics-results')?.classList.add('hidden');
    document.getElementById('bio-genetics-game')?.classList.remove('hidden');

    renderBioGeneticsRound();
}

function renderBioGeneticsRound() {
    const exercise = bioGeneticsState.rounds[bioGeneticsState.roundIndex];
    if (!exercise) {
        finishBioGeneticsRounds();
        return;
    }

    const result = calculateBioGeneticsCross(exercise);
    bioGeneticsState.current = exercise;
    bioGeneticsState.currentResult = result;
    bioGeneticsState.answered = false;

    setBioGeneticsText('bio-genetics-progress', `Repte ${bioGeneticsState.roundIndex + 1} / ${bioGeneticsState.rounds.length}`);
    setBioGeneticsText('bio-genetics-score', `Encerts: ${bioGeneticsState.score}`);
    setBioGeneticsText('bio-genetics-level', exercise.level);
    setBioGeneticsText('bio-genetics-context', exercise.context);
    setBioGeneticsText('bio-genetics-question', exercise.question);
    setBioGeneticsText('bio-genetics-cross', `${exercise.parentA} x ${exercise.parentB}`);

    const feedback = document.getElementById('bio-genetics-feedback');
    if (feedback) {
        feedback.textContent = '';
        setElementStateColor(feedback, '');
    }

    document.getElementById('bio-genetics-next-btn')?.classList.add('hidden');
    renderBioGeneticsPunnett(result);
    renderBioGeneticsOptions(getBioGeneticsCorrectPercent(exercise, result));
}

function renderBioGeneticsOptions(correctPercent) {
    const container = document.getElementById('bio-genetics-options');
    if (!container) return;

    const options = [0, 25, 50, 75, 100];
    container.innerHTML = '';

    options.forEach(value => {
        const button = document.createElement('button');
        button.className = 'answer-option bio-genetics__option';
        button.type = 'button';
        button.textContent = `${value}%`;
        button.addEventListener('click', () => answerBioGeneticsRound(button, value, correctPercent));
        container.appendChild(button);
    });
}

function answerBioGeneticsRound(button, value, correctPercent) {
    if (bioGeneticsState.answered) return;

    bioGeneticsState.answered = true;
    const isCorrect = value === correctPercent;
    const feedback = document.getElementById('bio-genetics-feedback');

    document.querySelectorAll('#bio-genetics-options .answer-option').forEach(option => {
        option.disabled = true;
        option.classList.toggle('correct', option.textContent === `${correctPercent}%`);
    });

    if (!isCorrect) {
        button.classList.add('incorrect');
    } else {
        bioGeneticsState.score += 1;
    }

    if (feedback) {
        feedback.textContent = isCorrect
            ? 'Correcte. El quadre de Punnett confirma la proporcio.'
            : `No exactament. La resposta correcta era ${correctPercent}%.`;
        setElementStateColor(feedback, isCorrect ? 'success' : 'error');
    }

    setBioGeneticsText('bio-genetics-score', `Encerts: ${bioGeneticsState.score}`);
    document.getElementById('bio-genetics-next-btn')?.classList.remove('hidden');
}

function nextBioGeneticsRound() {
    bioGeneticsState.roundIndex += 1;
    renderBioGeneticsRound();
}

function finishBioGeneticsRounds() {
    const total = bioGeneticsState.rounds.length || BIO_GENETICS_TOTAL_ROUNDS;
    const percentage = Math.round((bioGeneticsState.score / total) * 100);
    const elapsedSeconds = bioGeneticsState.startedAt
        ? Math.round((Date.now() - bioGeneticsState.startedAt) / 1000)
        : 0;

    document.getElementById('bio-genetics-game')?.classList.add('hidden');
    document.getElementById('bio-genetics-results')?.classList.remove('hidden');

    setBioGeneticsText('bio-genetics-final-score', `${percentage}%`);
    setBioGeneticsText(
        'bio-genetics-message',
        percentage >= 80
            ? 'Molt be: interpretes els encreuaments mendelians amb seguretat.'
            : 'Repassa els genotips, els gamets i les proporcions del quadre de Punnett.'
    );

    saveBioGeneticsResult(percentage, elapsedSeconds);
}

function calculateBioGeneticsCross(exercise) {
    const gametesA = generateBioGeneticsGametes(exercise.parentA);
    const gametesB = generateBioGeneticsGametes(exercise.parentB);
    const cells = [];

    gametesA.forEach(gameteA => {
        gametesB.forEach(gameteB => {
            cells.push(normalizeBioGeneticsGenotype(gameteA + gameteB));
        });
    });

    return {
        gametesA,
        gametesB,
        cells,
        genotypeRatios: countBioGeneticsValues(cells),
        phenotypeRatios: countBioGeneticsValues(cells.map(genotype =>
            getBioGeneticsPhenotypeKey(genotype, exercise.dominance)
        ))
    };
}

function generateBioGeneticsGametes(genotype) {
    if (!genotype || genotype.length < 2) return [];
    return [genotype[0], genotype[1]];
}

function normalizeBioGeneticsGenotype(genotype) {
    return genotype
        .split('')
        .sort((a, b) => {
            const aIsUpper = a === a.toUpperCase();
            const bIsUpper = b === b.toUpperCase();
            if (aIsUpper !== bIsUpper) return aIsUpper ? -1 : 1;
            return a.localeCompare(b);
        })
        .join('');
}

function getBioGeneticsPhenotypeKey(genotype, dominance) {
    const a = genotype[0];
    const b = genotype[1];
    const aIsUpper = a === a.toUpperCase();
    const bIsUpper = b === b.toUpperCase();
    const isHeterozygous = a !== b;

    if (dominance === 'incomplete' && isHeterozygous) {
        return 'intermediate';
    }

    return aIsUpper || bIsUpper ? 'dominant' : 'recessive';
}

function countBioGeneticsValues(values) {
    const total = values.length || 1;
    return values.reduce((map, value) => {
        if (!map[value]) {
            map[value] = { key: value, count: 0, percent: 0 };
        }
        map[value].count += 1;
        map[value].percent = Math.round((map[value].count / total) * 100);
        return map;
    }, {});
}

function getBioGeneticsCorrectPercent(exercise, result) {
    if (exercise.answer.type === 'genotype') {
        return result.genotypeRatios[exercise.answer.key]?.percent || 0;
    }

    return result.phenotypeRatios[exercise.answer.key]?.percent || 0;
}

function renderBioGeneticsPunnett(result) {
    const punnett = document.getElementById('bio-genetics-punnett');
    const ratios = document.getElementById('bio-genetics-ratios');
    const exercise = bioGeneticsState.current;
    if (!punnett || !ratios || !exercise) return;

    punnett.innerHTML = '';
    ratios.innerHTML = '';

    const corner = createBioGeneticsPunnettCell('', true);
    punnett.appendChild(corner);
    result.gametesB.forEach(gamete => punnett.appendChild(createBioGeneticsPunnettCell(gamete, true)));

    let cellIndex = 0;
    result.gametesA.forEach(gameteA => {
        punnett.appendChild(createBioGeneticsPunnettCell(gameteA, true));
        result.gametesB.forEach(() => {
            const genotype = result.cells[cellIndex];
            const phenotype = getBioGeneticsPhenotypeKey(genotype, exercise.dominance);
            const cell = createBioGeneticsPunnettCell(genotype, false);
            cell.classList.add(`bio-genetics__punnett-cell--${phenotype}`);
            punnett.appendChild(cell);
            cellIndex += 1;
        });
    });

    ratios.appendChild(createBioGeneticsRatioBlock('Genotips', result.genotypeRatios));
    ratios.appendChild(createBioGeneticsRatioBlock('Fenotips', result.phenotypeRatios, exercise.traits));
}

function createBioGeneticsPunnettCell(text, isHeader) {
    const cell = document.createElement('div');
    cell.className = isHeader ? 'bio-genetics__punnett-cell bio-genetics__punnett-cell--header' : 'bio-genetics__punnett-cell';
    cell.textContent = text;
    return cell;
}

function createBioGeneticsRatioBlock(title, ratioMap, traitLabels = null) {
    const block = document.createElement('div');
    block.className = 'bio-genetics__ratio-block';

    const heading = document.createElement('h5');
    heading.textContent = title;
    block.appendChild(heading);

    Object.values(ratioMap)
        .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
        .forEach(item => {
            const row = document.createElement('p');
            const label = traitLabels ? (traitLabels[item.key] || item.key) : item.key;
            row.textContent = `${label}: ${item.count}/4 (${item.percent}%)`;
            block.appendChild(row);
        });

    return block;
}

function saveBioGeneticsResult(percentage, elapsedSeconds) {
    if (typeof state === 'undefined' || !state.user || typeof callApi !== 'function') return;

    callApi('saveResult', {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
        app: 'Genetica mendeliana',
        nivell: 'Monohibridisme',
        puntuacio: percentage,
        temps_segons: elapsedSeconds,
        feedback_pos: `${bioGeneticsState.score} encerts de ${bioGeneticsState.rounds.length}`,
        feedback_neg: ''
    }).catch(error => console.error('Error guardant resultat de genetica:', error));
}

function shuffleBioGeneticsItems(items) {
    return [...items].sort(() => 0.5 - Math.random());
}

function setBioGeneticsText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}

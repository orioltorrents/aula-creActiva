const bioConceptDragState = {
    allItems: [],
    roundItems: [],
    placed: new Map(),
    selectedId: null,
    filter: null,
    startedAt: null,
    finished: false
};

const BIO_CONCEPT_DRAG_FALLBACK = [
    { id: 'fallback_1', topic: 'Genetica molecular', subtopic: 'Acids nucleics', difficulty: 'Facil', concept: 'ADN', definition: 'Molecula que guarda la informacio genetica de la cel.lula.' },
    { id: 'fallback_2', topic: 'Genetica molecular', subtopic: 'Acids nucleics', difficulty: 'Facil', concept: 'ARNm', definition: 'Copia temporal d un gen que porta la informacio fins als ribosomes.' },
    { id: 'fallback_3', topic: 'Genetica molecular', subtopic: 'Acids nucleics', difficulty: 'Facil', concept: 'ARNr', definition: 'ARN que forma part dels ribosomes i ajuda a fabricar proteines.' },
    { id: 'fallback_4', topic: 'Genetica molecular', subtopic: 'Estructura', difficulty: 'Mitja', concept: 'ADN', definition: 'Te doble cadena i bases nitrogenades A, T, C i G.' },
    { id: 'fallback_5', topic: 'Genetica molecular', subtopic: 'Expressio genica', difficulty: 'Mitja', concept: 'ARNm', definition: 'Es produeix durant la transcripcio.' },
    { id: 'fallback_6', topic: 'Genetica molecular', subtopic: 'Ribosomes', difficulty: 'Mitja', concept: 'ARNr', definition: 'S associa amb proteines per construir les subunitats ribosomiques.' }
];

async function initBioConceptDragGame() {
    resetBioConceptDragView();
    setBioConceptDragStatus('Carregant conceptes...', 'muted');

    try {
        const response = await callApi('getBioConceptDragData', { sheetName: 'biologia_conceptes' });
        if (response && response.status === 'success' && Array.isArray(response.items) && response.items.length > 0) {
            bioConceptDragState.allItems = normalizeBioConceptDragItems(response.items);
        } else {
            bioConceptDragState.allItems = BIO_CONCEPT_DRAG_FALLBACK;
            const message = response && response.message
                ? `${response.message}. Mostro dades de mostra.`
                : 'Mostro dades de mostra fins que la pestanya tingui contingut.';
            setBioConceptDragStatus(message, 'warning');
        }
    } catch (error) {
        console.error('Error en initBioConceptDragGame:', error);
        bioConceptDragState.allItems = BIO_CONCEPT_DRAG_FALLBACK;
        setBioConceptDragStatus('No he pogut connectar amb el Google Sheet. Mostro dades de mostra.', 'warning');
    }

    renderBioConceptDragFilters();
}

function resetBioConceptDragView() {
    bioConceptDragState.roundItems = [];
    bioConceptDragState.placed = new Map();
    bioConceptDragState.selectedId = null;
    bioConceptDragState.filter = null;
    bioConceptDragState.startedAt = null;
    bioConceptDragState.finished = false;

    document.getElementById('bio-concept-drag-setup')?.classList.remove('hidden');
    document.getElementById('bio-concept-drag-game')?.classList.add('hidden');
    document.getElementById('bio-concept-drag-results')?.classList.add('hidden');
}

function normalizeBioConceptDragItems(items) {
    return items
        .map((item, index) => ({
            id: item.id || `concept_${index + 1}`,
            topic: String(item.topic || item.tema || 'General').trim(),
            subtopic: String(item.subtopic || item.subtema || item.subtemes || 'General').trim(),
            difficulty: String(item.difficulty || item.nivell || 'General').trim(),
            concept: String(item.concept || item.concepte || '').trim(),
            definition: String(item.definition || item.definicio || '').trim()
        }))
        .filter(item => item.concept && item.definition);
}

function renderBioConceptDragFilters() {
    const container = document.getElementById('bio-concept-drag-filter-buttons');
    if (!container) return;

    container.innerHTML = '';
    addBioConceptDragFilterSection(container, 'Per dificultat:', 'difficulty');
    addBioConceptDragTopicSection(container);

    const mixedButton = document.createElement('button');
    mixedButton.className = 'btn btn--primary quiz-filter-button quiz-filter-button--mixed';
    mixedButton.type = 'button';
    mixedButton.innerText = 'Barrejat';
    mixedButton.addEventListener('click', () => startBioConceptDragRound([], 'Barrejat'));
    container.appendChild(mixedButton);

    if (!document.getElementById('bio-concept-drag-status')?.innerText) {
        setBioConceptDragStatus('Tria una dificultat, un tema o juga barrejat.', 'muted');
    }
}

function addBioConceptDragTopicSection(container) {
    const values = getBioConceptDragUniqueValues('topic');
    if (values.length === 0) return;

    const label = document.createElement('p');
    label.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    label.innerText = 'Per tema:';
    container.appendChild(label);

    values.forEach(value => {
        const button = document.createElement('button');
        button.className = 'btn btn--primary quiz-filter-button quiz-filter-button--topic';
        button.type = 'button';
        button.innerText = value;
        button.addEventListener('click', () => renderBioConceptDragSubtopicFilters(value));
        container.appendChild(button);
    });
}

function renderBioConceptDragSubtopicFilters(topic) {
    const container = document.getElementById('bio-concept-drag-filter-buttons');
    if (!container) return;

    const topicItems = getBioConceptDragItemsByFilters([{ field: 'topic', value: topic }]);
    const subtopics = getBioConceptDragUniqueValues('subtopic', topicItems);

    container.innerHTML = '';

    const backButton = document.createElement('button');
    backButton.className = 'btn btn--secondary btn--auto-width';
    backButton.type = 'button';
    backButton.innerText = 'Tornar als temes';
    backButton.addEventListener('click', () => {
        setBioConceptDragStatus('Tria una dificultat, un tema o juga barrejat.', 'muted');
        renderBioConceptDragFilters();
    });
    container.appendChild(backButton);

    const playTopicButton = document.createElement('button');
    playTopicButton.className = 'btn btn--primary quiz-filter-button quiz-filter-button--mixed';
    playTopicButton.type = 'button';
    playTopicButton.innerText = `Tot el tema: ${topic}`;
    playTopicButton.addEventListener('click', () => startBioConceptDragRound([{ field: 'topic', value: topic }], topic));
    container.appendChild(playTopicButton);

    if (subtopics.length > 0) {
        const label = document.createElement('p');
        label.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
        label.innerText = `Subtemes de ${topic}:`;
        container.appendChild(label);

        subtopics.forEach(subtopic => {
            const button = document.createElement('button');
            button.className = 'btn btn--primary quiz-filter-button quiz-filter-button--topic';
            button.type = 'button';
            button.innerText = subtopic;
            button.addEventListener('click', () => {
                startBioConceptDragRound([
                    { field: 'topic', value: topic },
                    { field: 'subtopic', value: subtopic }
                ], `${topic} - ${subtopic}`);
            });
            container.appendChild(button);
        });
    }

    setBioConceptDragStatus(`Ara tria un subtema de ${topic}, o juga tot el tema.`, 'muted');
}

function addBioConceptDragFilterSection(container, labelText, field) {
    const values = getBioConceptDragUniqueValues(field);
    if (values.length === 0) return;

    const label = document.createElement('p');
    label.className = 'w-full text-center font-bold mb-2 mt-4 text-gray-600';
    label.innerText = labelText;
    container.appendChild(label);

    values.forEach(value => {
        const button = document.createElement('button');
        button.className = 'btn btn--primary quiz-filter-button';
        button.classList.add(getQuizFilterButtonModifier(field, value));
        button.type = 'button';
        button.innerText = value;
        button.addEventListener('click', () => startBioConceptDragRound([{ field, value }], value));
        container.appendChild(button);
    });
}

function getBioConceptDragUniqueValues(field, items = bioConceptDragState.allItems) {
    return [...new Set(
        items
            .map(item => item[field])
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
}

function getBioConceptDragItemsByFilters(filters = []) {
    return filters.reduce((items, filter) => {
        if (!filter || !filter.field) return items;
        return items.filter(item =>
            normalizeBioConceptDragText(item[filter.field]) === normalizeBioConceptDragText(filter.value)
        );
    }, bioConceptDragState.allItems);
}

function startBioConceptDragRound(filters = [], label = 'Barrejat') {
    const initialPool = getBioConceptDragItemsByFilters(filters);
    const scopedRound = getBioConceptDragSingleSubtopicPool(initialPool, label);
    const pool = scopedRound.items;

    if (pool.length < 2) {
        setBioConceptDragStatus('Calen com a minim dues definicions per jugar amb aquesta seleccio.', 'warning');
        return;
    }

    bioConceptDragState.filter = { filters, value: scopedRound.label };
    bioConceptDragState.roundItems = sampleBioConceptDragItems(pool, 12);
    bioConceptDragState.placed = new Map();
    bioConceptDragState.selectedId = null;
    bioConceptDragState.startedAt = Date.now();
    bioConceptDragState.finished = false;

    document.getElementById('bio-concept-drag-setup')?.classList.add('hidden');
    document.getElementById('bio-concept-drag-results')?.classList.add('hidden');
    document.getElementById('bio-concept-drag-game')?.classList.remove('hidden');

    renderBioConceptDragBoard();
}

function getBioConceptDragSingleSubtopicPool(items, label) {
    const groups = items.reduce((map, item) => {
        const subtopic = item.subtopic || 'General';
        if (!map.has(subtopic)) map.set(subtopic, []);
        map.get(subtopic).push(item);
        return map;
    }, new Map());

    const playableGroups = [...groups.entries()]
        .filter(([, groupItems]) => groupItems.length >= 2)
        .sort((a, b) => a[0].localeCompare(b[0]));

    if (playableGroups.length === 0) {
        return { items: [], label };
    }

    if (playableGroups.length === 1) {
        const [subtopic, groupItems] = playableGroups[0];
        return {
            items: groupItems,
            label: label && label !== subtopic ? `${label} - ${subtopic}` : subtopic
        };
    }

    const [subtopic, groupItems] = playableGroups[Math.floor(Math.random() * playableGroups.length)];
    return {
        items: groupItems,
        label: label && label !== 'Barrejat' ? `${label} - ${subtopic}` : subtopic
    };
}

function sampleBioConceptDragItems(items, maxItems) {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, maxItems).map((item, index) => ({
        ...item,
        roundId: `bio_drag_${index}_${Date.now()}`
    }));
}

function renderBioConceptDragBoard() {
    const targets = document.getElementById('bio-concept-drag-targets');
    const cards = document.getElementById('bio-concept-drag-cards');
    if (!targets || !cards) return;

    const concepts = getBioConceptDragConcepts();
    targets.innerHTML = '';
    cards.innerHTML = '';

    concepts.forEach(concept => {
        targets.appendChild(createBioConceptDragTarget(concept));
    });

    [...bioConceptDragState.roundItems]
        .sort(() => 0.5 - Math.random())
        .forEach(item => {
            if (!bioConceptDragState.placed.has(item.roundId)) {
                cards.appendChild(createBioConceptDragCard(item));
            }
        });

    updateBioConceptDragStats();
    setBioConceptDragStatus('Arrossega cada definicio fins al concepte corresponent.', 'muted');
}

function createBioConceptDragTarget(concept) {
    const target = document.createElement('button');
    target.className = 'bio-concept-drag__target';
    target.type = 'button';
    target.dataset.concept = concept;

    const expectedCount = bioConceptDragState.roundItems.filter(item => item.concept === concept).length;
    const conceptLabel = document.createElement('span');
    conceptLabel.className = 'bio-concept-drag__concept';
    conceptLabel.innerText = concept;

    const hint = document.createElement('span');
    hint.className = 'bio-concept-drag__hint';
    hint.innerText = `0 / ${expectedCount} definicions`;

    const placed = document.createElement('span');
    placed.className = 'bio-concept-drag__placed';

    target.append(conceptLabel, hint, placed);

    target.addEventListener('dragover', event => {
        event.preventDefault();
        target.classList.add('is-over');
    });
    target.addEventListener('dragleave', () => target.classList.remove('is-over'));
    target.addEventListener('drop', event => {
        event.preventDefault();
        target.classList.remove('is-over');
        placeBioConceptDragCard(event.dataTransfer.getData('text/plain'), concept);
    });
    target.addEventListener('click', () => {
        if (bioConceptDragState.selectedId) {
            placeBioConceptDragCard(bioConceptDragState.selectedId, concept);
        }
    });

    return target;
}

function createBioConceptDragCard(item) {
    const card = document.createElement('button');
    card.className = 'bio-concept-drag__card';
    card.type = 'button';
    card.draggable = true;
    card.dataset.id = item.roundId;
    card.innerText = item.definition;

    card.addEventListener('dragstart', event => {
        bioConceptDragState.selectedId = item.roundId;
        event.dataTransfer.setData('text/plain', item.roundId);
    });
    card.addEventListener('click', () => selectBioConceptDragCard(item.roundId));

    return card;
}

function selectBioConceptDragCard(roundId) {
    bioConceptDragState.selectedId = roundId;
    document.querySelectorAll('.bio-concept-drag__card').forEach(card => {
        card.classList.toggle('is-selected', card.dataset.id === roundId);
    });
}

function placeBioConceptDragCard(roundId, concept) {
    if (!roundId || bioConceptDragState.finished || bioConceptDragState.placed.has(roundId)) return;

    const item = bioConceptDragState.roundItems.find(candidate => candidate.roundId === roundId);
    if (!item) return;

    const isCorrect = item.concept === concept;
    bioConceptDragState.placed.set(roundId, { concept, isCorrect });
    bioConceptDragState.selectedId = null;

    const sourceCard = document.querySelector(`.bio-concept-drag__card[data-id="${roundId}"]`);
    if (sourceCard) sourceCard.remove();

    const target = findBioConceptDragTarget(concept);
    const placedContainer = target?.querySelector('.bio-concept-drag__placed');
    if (placedContainer) {
        const placedCard = document.createElement('span');
        placedCard.className = `bio-concept-drag__card bio-concept-drag__card--placed is-placed ${isCorrect ? 'is-correct' : 'is-wrong'}`;
        placedCard.innerText = item.definition;
        placedContainer.appendChild(placedCard);
    }

    updateBioConceptDragTargetProgress(concept);
    updateBioConceptDragStats();

    if (isCorrect) {
        setBioConceptDragStatus('Correcte.', 'success');
    } else {
        setBioConceptDragStatus(`Aquesta definicio correspon a ${item.concept}.`, 'error');
    }

    if (bioConceptDragState.placed.size === bioConceptDragState.roundItems.length) {
        finishBioConceptDragRound();
    }
}

function updateBioConceptDragTargetProgress(concept) {
    const target = findBioConceptDragTarget(concept);
    if (!target) return;

    const expectedCount = bioConceptDragState.roundItems.filter(item => item.concept === concept).length;
    const placedCount = [...bioConceptDragState.placed.values()].filter(item => item.concept === concept).length;
    const hint = target.querySelector('.bio-concept-drag__hint');
    if (hint) hint.innerText = `${placedCount} / ${expectedCount} definicions`;
    target.classList.toggle('is-complete', placedCount >= expectedCount);
}

function updateBioConceptDragStats() {
    const progress = document.getElementById('bio-concept-drag-progress');
    const score = document.getElementById('bio-concept-drag-score');
    const correct = [...bioConceptDragState.placed.values()].filter(item => item.isCorrect).length;
    const total = bioConceptDragState.roundItems.length;

    if (progress) progress.innerText = `Definicions: ${bioConceptDragState.placed.size} / ${total}`;
    if (score) score.innerText = `Encerts: ${correct}`;
}

function finishBioConceptDragRound() {
    bioConceptDragState.finished = true;
    const correct = [...bioConceptDragState.placed.values()].filter(item => item.isCorrect).length;
    const total = bioConceptDragState.roundItems.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const elapsedSeconds = bioConceptDragState.startedAt ? Math.round((Date.now() - bioConceptDragState.startedAt) / 1000) : 0;

    document.getElementById('bio-concept-drag-game')?.classList.add('hidden');
    document.getElementById('bio-concept-drag-results')?.classList.remove('hidden');

    const finalScore = document.getElementById('bio-concept-drag-final-score');
    const message = document.getElementById('bio-concept-drag-message');
    if (finalScore) finalScore.innerText = `${percentage}%`;
    if (message) {
        message.innerText = percentage >= 80
            ? 'Molt be: tens els conceptes ben connectats.'
            : 'Repassa les definicions i torna-ho a provar.';
    }

    saveBioConceptDragResult(percentage, elapsedSeconds);
}

async function saveBioConceptDragResult(percentage, elapsedSeconds) {
    if (typeof state === 'undefined' || !state.user) return;

    const filterLabel = bioConceptDragState.filter ? bioConceptDragState.filter.value : 'Barrejat';
    await callApi('saveResult', {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject ? state.currentProject.titol : 'Biologia',
        app: 'Conceptes de Biologia',
        nivell: filterLabel,
        puntuacio: percentage,
        temps_segons: elapsedSeconds,
        feedback_pos: 'Classificacio de conceptes completada.',
        feedback_neg: ''
    });
}

function restartBioConceptDragGame() {
    initBioConceptDragGame();
}

function setBioConceptDragStatus(message, stateName) {
    const status = document.getElementById('bio-concept-drag-status');
    if (!status) return;
    status.innerText = message || '';
    setElementStateColor(status, stateName || 'muted');
}

function getBioConceptDragConcepts() {
    return [...new Set(bioConceptDragState.roundItems.map(item => item.concept))]
        .sort((a, b) => a.localeCompare(b));
}

function normalizeBioConceptDragText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function findBioConceptDragTarget(concept) {
    return [...document.querySelectorAll('.bio-concept-drag__target')]
        .find(target => target.dataset.concept === concept);
}

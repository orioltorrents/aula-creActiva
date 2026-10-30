const fisicaQuimicaGraphPairs = [
    {
        id: 'position-time',
        xLabel: 'Temps',
        xUnit: 's',
        yLabel: 'Posició',
        yUnit: 'm',
        createRows() {
            const start = [0, 1, 2][Math.floor(Math.random() * 3)];
            const rate = 1 + Math.floor(Math.random() * 3);
            return Array.from({ length: 5 }, (_, index) => ({
                x: index * 5,
                y: start + index * rate
            }));
        }
    },
    {
        id: 'temperature-time',
        xLabel: 'Temps',
        xUnit: 'min',
        yLabel: 'Temperatura',
        yUnit: '°C',
        createRows() {
            const start = 16 + Math.floor(Math.random() * 9);
            const direction = Math.random() < 0.5 ? -1 : 1;
            const change = 1 + Math.floor(Math.random() * 3);
            return Array.from({ length: 5 }, (_, index) => ({
                x: index * 2,
                y: start + index * direction * change
            }));
        }
    },
    {
        id: 'mass-volume',
        xLabel: 'Volum',
        xUnit: 'mL',
        yLabel: 'Massa',
        yUnit: 'g',
        createRows() {
            const massPerMillilitre = [0.5, 0.8, 1, 1.2, 1.5, 2][Math.floor(Math.random() * 6)];
            return Array.from({ length: 5 }, (_, index) => ({
                x: index * 50,
                y: Number((index * 50 * massPerMillilitre).toFixed(1))
            }));
        }
    }
];

const fisicaQuimicaGraphRoundLength = 5;

const fisicaQuimicaGraphState = {
    questions: [],
    questionIndex: 0,
    placed: [],
    score: 0,
    attempts: 0,
    locked: false,
    saving: false,
    saved: false,
    finished: false,
    startedAt: 0,
    cursor: null,
    canvas: null,
    context: null,
    resizeObserver: null
};

function fisicaQuimicaGraphShuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
}

function fisicaQuimicaGraphCreateRound() {
    const pairOrder = fisicaQuimicaGraphShuffle(fisicaQuimicaGraphPairs);
    const pairs = Array.from({ length: fisicaQuimicaGraphRoundLength }, (_, index) =>
        pairOrder[index % pairOrder.length]);
    return fisicaQuimicaGraphShuffle(pairs).map(pair => ({
        id: pair.id,
        xLabel: pair.xLabel,
        xUnit: pair.xUnit,
        yLabel: pair.yLabel,
        yUnit: pair.yUnit,
        rows: pair.createRows()
    }));
}

function initFisicaQuimicaGraphGame() {
    const state = fisicaQuimicaGraphState;
    state.questions = fisicaQuimicaGraphCreateRound();
    state.questionIndex = 0;
    state.placed = [];
    state.score = 0;
    state.attempts = 0;
    state.locked = false;
    state.saving = false;
    state.saved = false;
    state.finished = false;
    state.startedAt = Date.now();
    state.cursor = null;
    state.canvas = document.getElementById('fq-graph-canvas');
    state.context = state.canvas?.getContext('2d') || null;

    if (!state.canvas || !state.context) {
        throw new Error('No s’ha pogut inicialitzar el llenç de l’activitat de gràfiques.');
    }
    state.resizeObserver?.disconnect();
    state.resizeObserver = new ResizeObserver(renderFisicaQuimicaGraph);
    state.resizeObserver.observe(document.getElementById('fq-graph-canvas-wrap'));

    if (state.canvas.dataset.eventsBound !== 'true') {
        state.canvas.dataset.eventsBound = 'true';
        state.canvas.addEventListener('click', placeFisicaQuimicaGraphPoint);
        state.canvas.addEventListener('pointermove', updateFisicaQuimicaGraphCursor);
        state.canvas.addEventListener('pointerleave', hideFisicaQuimicaGraphCursor);
        state.canvas.addEventListener('keydown', handleFisicaQuimicaGraphKeydown);
    }

    const joinToggle = document.getElementById('fq-graph-join');
    if (joinToggle.dataset.eventsBound !== 'true') {
        joinToggle.dataset.eventsBound = 'true';
        joinToggle.addEventListener('change', renderFisicaQuimicaGraph);
    }

    document.getElementById('fq-graph-game').classList.remove('hidden');
    document.getElementById('fq-graph-results').classList.add('hidden');
    document.getElementById('fq-graph-save-retry').classList.add('hidden');
    document.getElementById('fq-graph-new-round').disabled = false;
    renderFisicaQuimicaGraphQuestion();
}

function fisicaQuimicaGraphNiceAxis(minimum, maximum) {
    const range = maximum - minimum || 1;
    const rawStep = range / 5;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const candidates = [1, 2, 5, 10].map(value => value * magnitude);
    const step = candidates.reduce((best, candidate) => {
        const candidateCount = Math.ceil(maximum / candidate) - Math.floor(minimum / candidate);
        const bestCount = Math.ceil(maximum / best) - Math.floor(minimum / best);
        const candidateScore = Math.abs(candidateCount - 5);
        const bestScore = Math.abs(bestCount - 5);
        return candidateScore < bestScore ? candidate : best;
    }, candidates[0]);
    const axisMin = Math.floor(minimum / step) * step;
    const axisMax = Math.ceil(maximum / step) * step;
    const ticks = [];
    for (let value = axisMin; value <= axisMax + step / 2; value += step) {
        ticks.push(Number(value.toFixed(8)));
    }
    return { min: axisMin, max: axisMax || step, step, ticks };
}

function fisicaQuimicaGraphGetGeometry() {
    const canvas = fisicaQuimicaGraphState.canvas;
    const rows = fisicaQuimicaGraphState.questions[fisicaQuimicaGraphState.questionIndex].rows;
    const xValues = rows.map(row => row.x);
    const yValues = rows.map(row => row.y);
    const xPadding = (Math.max(...xValues) - Math.min(...xValues) || 1) * 0.12;
    const yPadding = (Math.max(...yValues) - Math.min(...yValues) || 1) * 0.15;
    const xAxis = fisicaQuimicaGraphNiceAxis(Math.min(...xValues) - xPadding, Math.max(...xValues) + xPadding);
    const yAxis = fisicaQuimicaGraphNiceAxis(Math.min(...yValues) - yPadding, Math.max(...yValues) + yPadding);
    const margin = { left: Math.max(66, canvas.width * 0.09), right: 24, top: 24, bottom: 62 };
    const plotWidth = canvas.width - margin.left - margin.right;
    const plotHeight = canvas.height - margin.top - margin.bottom;
    const xToPixel = value => margin.left + ((value - xAxis.min) / (xAxis.max - xAxis.min)) * plotWidth;
    const yToPixel = value => canvas.height - margin.bottom - ((value - yAxis.min) / (yAxis.max - yAxis.min)) * plotHeight;
    const pixelToX = value => xAxis.min + ((value - margin.left) / plotWidth) * (xAxis.max - xAxis.min);
    const pixelToY = value => yAxis.min + ((canvas.height - margin.bottom - value) / plotHeight) * (yAxis.max - yAxis.min);
    return { margin, plotWidth, plotHeight, xAxis, yAxis, xToPixel, yToPixel, pixelToX, pixelToY };
}

function renderFisicaQuimicaGraphQuestion() {
    const state = fisicaQuimicaGraphState;
    const question = state.questions[state.questionIndex];
    if (!question) {
        finishFisicaQuimicaGraphRound();
        return;
    }

    state.placed = question.rows.map(() => null);
    state.locked = false;
    state.cursor = null;
    document.getElementById('fq-graph-progress').textContent =
        `Gràfic ${state.questionIndex + 1}/${state.questions.length}`;
    document.getElementById('fq-graph-score').textContent =
        `Puntuació: ${fisicaQuimicaGraphFormatScore(state.score)}/10`;
    document.getElementById('fq-graph-attempts').textContent = `Correccions: ${state.attempts}`;
    document.getElementById('fq-graph-pair').textContent =
        `${question.yLabel} (${question.yUnit}) segons ${question.xLabel.toLowerCase()} (${question.xUnit})`;
    document.getElementById('fq-graph-table-caption').textContent =
        'Col·loca els cinc punts a la gràfica en l’ordre de la taula.';
    document.getElementById('fq-graph-check').disabled = false;
    document.getElementById('fq-graph-undo').disabled = false;
    document.getElementById('fq-graph-next').classList.add('hidden');
    document.getElementById('fq-graph-join').checked = false;
    document.getElementById('fq-graph-feedback').textContent = '';
    setElementStateColor(document.getElementById('fq-graph-feedback'), 'muted');
    renderFisicaQuimicaGraphTable(question);
    renderFisicaQuimicaGraph();
}

function renderFisicaQuimicaGraphTable(question) {
    const head = document.getElementById('fq-graph-table-head');
    const body = document.getElementById('fq-graph-table-body');
    const firstHeading = document.createElement('th');
    firstHeading.scope = 'col';
    firstHeading.textContent = '#';
    const xHeading = document.createElement('th');
    xHeading.scope = 'col';
    xHeading.textContent = `${question.xLabel} (${question.xUnit})`;
    const yHeading = document.createElement('th');
    yHeading.scope = 'col';
    yHeading.textContent = `${question.yLabel} (${question.yUnit})`;
    const statusHeading = document.createElement('th');
    statusHeading.scope = 'col';
    statusHeading.textContent = 'Estat';
    head.replaceChildren(firstHeading, xHeading, yHeading, statusHeading);

    body.replaceChildren();
    question.rows.forEach((row, index) => {
        const tableRow = document.createElement('tr');
        const number = document.createElement('th');
        number.scope = 'row';
        number.textContent = String(index + 1);
        const xCell = document.createElement('td');
        xCell.textContent = fisicaQuimicaGraphFormatValue(row.x);
        const yCell = document.createElement('td');
        yCell.textContent = fisicaQuimicaGraphFormatValue(row.y);
        const status = document.createElement('td');
        status.id = `fq-graph-row-status-${index}`;
        status.textContent = 'Pendent';
        tableRow.append(number, xCell, yCell, status);
        body.appendChild(tableRow);
    });
}

function fisicaQuimicaGraphFormatValue(value) {
    return Number(value).toLocaleString('ca-ES', { maximumFractionDigits: 1 });
}

function fisicaQuimicaGraphFormatScore(value) {
    return value.toLocaleString('ca-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function renderFisicaQuimicaGraph() {
    const state = fisicaQuimicaGraphState;
    const canvas = state.canvas;
    const context = state.context;
    if (!canvas || !context || !state.questions[state.questionIndex]) return;

    const bounds = canvas.getBoundingClientRect();
    if (bounds.width === 0) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(bounds.width * pixelRatio);
    const height = Math.round(width * 0.62);
    const tokens = getComputedStyle(document.documentElement);
    const color = name => tokens.getPropertyValue(name).trim();
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }

    const geometry = fisicaQuimicaGraphGetGeometry();
    const { margin, xAxis, yAxis, xToPixel, yToPixel } = geometry;
    const right = canvas.width - margin.right;
    const bottom = canvas.height - margin.bottom;
    const question = state.questions[state.questionIndex];
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color('--surface-bg');
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = `${Math.max(12, canvas.width * 0.015)}px ${getComputedStyle(document.body).fontFamily}`;
    context.lineWidth = Math.max(1, pixelRatio);

    context.strokeStyle = color('--border-muted');
    context.fillStyle = color('--text-light');
    context.textAlign = 'center';
    context.textBaseline = 'top';
    xAxis.ticks.forEach(tick => {
        const x = xToPixel(tick);
        context.beginPath();
        context.moveTo(x, margin.top);
        context.lineTo(x, bottom);
        context.stroke();
        context.fillText(fisicaQuimicaGraphFormatValue(tick), x, bottom + 8 * pixelRatio);
    });
    context.textAlign = 'right';
    context.textBaseline = 'middle';
    yAxis.ticks.forEach(tick => {
        const y = yToPixel(tick);
        context.beginPath();
        context.moveTo(margin.left, y);
        context.lineTo(right, y);
        context.stroke();
        context.fillText(fisicaQuimicaGraphFormatValue(tick), margin.left - 8 * pixelRatio, y);
    });

    context.strokeStyle = color('--text-color');
    context.fillStyle = color('--text-color');
    context.lineWidth = 2 * pixelRatio;
    context.beginPath();
    const xZero = Math.min(Math.max(xToPixel(0), margin.left), right);
    const yZero = Math.min(Math.max(yToPixel(0), margin.top), bottom);
    context.moveTo(margin.left, yZero);
    context.lineTo(right, yZero);
    context.moveTo(xZero, bottom);
    context.lineTo(xZero, margin.top);
    context.stroke();

    context.font = `600 ${Math.max(13, canvas.width * 0.017)}px ${getComputedStyle(document.body).fontFamily}`;
    context.textAlign = 'center';
    context.textBaseline = 'bottom';
    context.fillText(`${question.xLabel} (${question.xUnit})`, (margin.left + right) / 2, canvas.height - 4 * pixelRatio);
    context.save();
    context.translate(16 * pixelRatio, (margin.top + bottom) / 2);
    context.rotate(-Math.PI / 2);
    context.fillText(`${question.yLabel} (${question.yUnit})`, 0, 0);
    context.restore();

    const placed = state.placed.map((point, index) =>
        point ? { ...point, expected: question.rows[index] } : null);
    if (document.getElementById('fq-graph-join').checked) {
        context.beginPath();
        context.strokeStyle = color('--info-text');
        context.lineWidth = 2 * pixelRatio;
        let started = false;
        placed.forEach(point => {
            if (!point) {
                started = false;
                return;
            }
            if (!started) {
                context.moveTo(point.x, point.y);
                started = true;
            } else {
                context.lineTo(point.x, point.y);
            }
        });
        context.stroke();
    }

    placed.forEach(point => {
        if (!point) return;
        context.beginPath();
        context.fillStyle = point.status === 'correct' ? color('--success')
            : point.status === 'incorrect' ? color('--error')
                : color('--info-text');
        context.arc(point.x, point.y, 5 * pixelRatio, 0, Math.PI * 2);
        context.fill();
    });
    if (state.cursor && !state.locked) {
        context.save();
        context.strokeStyle = color('--text-light');
        context.setLineDash([5 * pixelRatio, 4 * pixelRatio]);
        context.beginPath();
        context.moveTo(state.cursor.x, margin.top);
        context.lineTo(state.cursor.x, bottom);
        context.moveTo(margin.left, state.cursor.y);
        context.lineTo(right, state.cursor.y);
        context.stroke();
        context.restore();
    }
}

function cleanupFisicaQuimicaGraphGame() {
    fisicaQuimicaGraphState.resizeObserver?.disconnect();
    fisicaQuimicaGraphState.resizeObserver = null;
}

function fisicaQuimicaGraphCanvasPoint(event) {
    const canvas = fisicaQuimicaGraphState.canvas;
    const bounds = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - bounds.left) * canvas.width / bounds.width,
        y: (event.clientY - bounds.top) * canvas.height / bounds.height
    };
}

function updateFisicaQuimicaGraphCursor(event) {
    if (fisicaQuimicaGraphState.locked) return;
    fisicaQuimicaGraphState.cursor = fisicaQuimicaGraphCanvasPoint(event);
    const geometry = fisicaQuimicaGraphGetGeometry();
    const x = geometry.pixelToX(fisicaQuimicaGraphState.cursor.x);
    const y = geometry.pixelToY(fisicaQuimicaGraphState.cursor.y);
    document.getElementById('fq-graph-coordinate').textContent =
        `Coordenades aproximades: (${fisicaQuimicaGraphFormatValue(x)}, ${fisicaQuimicaGraphFormatValue(y)})`;
    renderFisicaQuimicaGraph();
}

function hideFisicaQuimicaGraphCursor() {
    fisicaQuimicaGraphState.cursor = null;
    document.getElementById('fq-graph-coordinate').textContent = 'Mou el cursor per consultar les coordenades.';
    renderFisicaQuimicaGraph();
}

function placeFisicaQuimicaGraphPoint(event) {
    const state = fisicaQuimicaGraphState;
    if (state.locked || state.placed.every(point => point !== null)) return;
    const point = fisicaQuimicaGraphCanvasPoint(event);
    const { margin } = fisicaQuimicaGraphGetGeometry();
    const maxX = state.canvas.width - margin.right;
    const maxY = state.canvas.height - margin.bottom;
    if (point.x < margin.left || point.x > maxX || point.y < margin.top || point.y > maxY) return;

    const index = state.placed.findIndex(item => item === null);
    state.placed[index] = { x: point.x, y: point.y, status: 'placed' };
    document.getElementById('fq-graph-table-caption').textContent =
        index === state.placed.length - 1
            ? 'Ja has col·locat els cinc punts. Corregeix la gràfica quan estiguis a punt.'
            : `Col·loca el punt ${index + 2} de ${state.placed.length}.`;
    renderFisicaQuimicaGraph();
}

function undoFisicaQuimicaGraphPoint() {
    const state = fisicaQuimicaGraphState;
    if (state.locked) return;
    for (let index = state.placed.length - 1; index >= 0; index -= 1) {
        if (state.placed[index]) {
            state.placed[index] = null;
            break;
        }
    }
    const placedCount = state.placed.filter(Boolean).length;
    document.getElementById('fq-graph-table-caption').textContent =
        `Col·loca el punt ${Math.min(placedCount + 1, state.placed.length)} de ${state.placed.length}.`;
    renderFisicaQuimicaGraph();
}

function handleFisicaQuimicaGraphKeydown(event) {
    const state = fisicaQuimicaGraphState;
    if (event.key === 'Backspace') {
        event.preventDefault();
        undoFisicaQuimicaGraphPoint();
    } else if (event.key === 'Enter' && !event.ctrlKey) {
        event.preventDefault();
        checkFisicaQuimicaGraphAnswer();
    } else if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault();
        nextFisicaQuimicaGraphQuestion();
    } else if (event.key === ' ' && state.cursor && !state.locked) {
        event.preventDefault();
        const bounds = state.canvas.getBoundingClientRect();
        placeFisicaQuimicaGraphPoint({
            clientX: bounds.left + state.cursor.x / state.canvas.width * bounds.width,
            clientY: bounds.top + state.cursor.y / state.canvas.height * bounds.height
        });
    } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const step = Math.max(8, state.canvas.width * 0.01);
        const current = state.cursor || {
            x: state.canvas.width / 2,
            y: state.canvas.height / 2
        };
        state.cursor = {
            x: Math.max(0, Math.min(state.canvas.width, current.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0))),
            y: Math.max(0, Math.min(state.canvas.height, current.y + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0)))
        };
        const geometry = fisicaQuimicaGraphGetGeometry();
        document.getElementById('fq-graph-coordinate').textContent =
            `Coordenades aproximades: (${fisicaQuimicaGraphFormatValue(geometry.pixelToX(state.cursor.x))}, ${fisicaQuimicaGraphFormatValue(geometry.pixelToY(state.cursor.y))}). Espai per col·locar.`;
        renderFisicaQuimicaGraph();
    }
}

function checkFisicaQuimicaGraphAnswer() {
    const state = fisicaQuimicaGraphState;
    if (state.locked || state.saving || state.finished) return;
    const question = state.questions[state.questionIndex];
    const geometry = fisicaQuimicaGraphGetGeometry();
    let correctCoordinates = 0;
    let incorrectCoordinates = 0;

    state.placed.forEach((point, index) => {
        const statusElement = document.getElementById(`fq-graph-row-status-${index}`);
        if (!point) {
            incorrectCoordinates += 2;
            if (statusElement) statusElement.textContent = 'Sense punt';
            return;
        }

        const row = question.rows[index];
        const expectedX = geometry.xToPixel(row.x);
        const expectedY = geometry.yToPixel(row.y);
        const toleranceX = Math.max(8, geometry.plotWidth * 0.03);
        const toleranceY = Math.max(8, geometry.plotHeight * 0.03);
        const correctX = Math.abs(point.x - expectedX) <= toleranceX;
        const correctY = Math.abs(point.y - expectedY) <= toleranceY;
        correctCoordinates += Number(correctX) + Number(correctY);
        incorrectCoordinates += Number(!correctX) + Number(!correctY);
        point.status = correctX && correctY ? 'correct' : 'incorrect';
        if (statusElement) statusElement.textContent = point.status === 'correct' ? 'Correcte' : 'Revisa’l';
    });

    const change = (correctCoordinates - incorrectCoordinates) * 0.2;
    state.score = Math.max(0, Math.min(10, Math.round((state.score + change) * 100) / 100));
    state.attempts += 1;
    state.locked = true;

    const feedback = document.getElementById('fq-graph-feedback');
    feedback.textContent =
        `Coordenades correctes: ${correctCoordinates}/10. Incorrectes o no col·locades: ${incorrectCoordinates}. `
        + `Canvi: ${change > 0 ? '+' : ''}${fisicaQuimicaGraphFormatScore(change)} punts.`;
    setElementStateColor(feedback, incorrectCoordinates === 0 ? 'success' : correctCoordinates > 0 ? 'warning' : 'error');
    document.getElementById('fq-graph-score').textContent =
        `Puntuació: ${fisicaQuimicaGraphFormatScore(state.score)}/10`;
    document.getElementById('fq-graph-attempts').textContent = `Correccions: ${state.attempts}`;
    document.getElementById('fq-graph-check').disabled = true;
    document.getElementById('fq-graph-undo').disabled = true;
    renderFisicaQuimicaGraph();
    if (state.questionIndex === state.questions.length - 1) {
        document.getElementById('fq-graph-next').textContent = 'Veure resultat final';
    } else {
        document.getElementById('fq-graph-next').textContent = 'Següent gràfic';
    }
    document.getElementById('fq-graph-next').classList.remove('hidden');
}

function nextFisicaQuimicaGraphQuestion() {
    const state = fisicaQuimicaGraphState;
    if (!state.locked || state.finished) return;
    state.questionIndex += 1;
    renderFisicaQuimicaGraphQuestion();
}

function finishFisicaQuimicaGraphRound() {
    const state = fisicaQuimicaGraphState;
    if (state.finished) return;
    state.finished = true;
    document.getElementById('fq-graph-game').classList.add('hidden');
    document.getElementById('fq-graph-results').classList.remove('hidden');
    document.getElementById('fq-graph-final-score').textContent =
        `${fisicaQuimicaGraphFormatScore(state.score)} / 10 punts`;
    saveFisicaQuimicaGraphResult();
}

async function saveFisicaQuimicaGraphResult() {
    const gameState = fisicaQuimicaGraphState;
    if (gameState.saving || gameState.saved || !gameState.finished) return;
    const feedback = document.getElementById('fq-graph-save-feedback');

    if (typeof state === 'undefined' || !state.user || !state.currentProject || typeof callApi !== 'function') {
        feedback.textContent = 'No es pot desar la puntuació perquè falta la sessió d’usuari o la connexió amb el servei.';
        setElementStateColor(feedback, 'error');
        document.getElementById('fq-graph-save-retry').classList.remove('hidden');
        return;
    }

    gameState.saving = true;
    document.getElementById('fq-graph-save-retry').classList.add('hidden');
    document.getElementById('fq-graph-new-round').disabled = true;
    feedback.textContent = 'Desant la puntuació…';
    setElementStateColor(feedback, 'muted');

    try {
        const percentage = Math.round(gameState.score * 10);
        const elapsedSeconds = Math.round((Date.now() - gameState.startedAt) / 1000);
        const result = await callApi('saveResult', {
            email: state.user.email,
            curs: state.user.curs,
            grup: state.user.grup || state.user.curs,
            projecte: state.currentProject.titol,
            app: 'Representació gràfica de dades',
            nivell: 'Ronda de 5 gràfics',
            puntuacio: percentage,
            temps_segons: elapsedSeconds,
            feedback_pos: `Puntuació: ${fisicaQuimicaGraphFormatScore(gameState.score)}/10; gràfics: ${gameState.questions.length}; correccions: ${gameState.attempts}`,
            feedback_neg: ''
        });
        if (!result || result.status !== 'success') {
            throw new Error(result?.message || 'El servei no ha confirmat el desament.');
        }

        gameState.saved = true;
        feedback.textContent = 'Puntuació desada correctament.';
        setElementStateColor(feedback, 'success');
    } catch (error) {
        console.error('Error desant la puntuació de representació gràfica:', error);
        feedback.textContent = 'No s’ha pogut desar la puntuació. Comprova la connexió i torna-ho a provar.';
        setElementStateColor(feedback, 'error');
        document.getElementById('fq-graph-save-retry').classList.remove('hidden');
        document.getElementById('fq-graph-new-round').disabled = false;
    } finally {
        gameState.saving = false;
    }
}

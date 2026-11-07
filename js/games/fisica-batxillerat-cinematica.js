const fisicaBatxCinematicaState = {
    questions: [],
    questionIndex: 0,
    correctAnswers: 0,
    attempts: 0,
    startedAt: 0,
    finished: false,
    saving: false,
    saved: false
};

function fisicaBatxCinematicaRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fisicaBatxCinematicaRound(value) {
    return Math.round(value * 100) / 100;
}

function fisicaBatxCinematicaFormat(value) {
    return fisicaBatxCinematicaRound(value).toString().replace('.', ',');
}

function fisicaBatxCinematicaCreateQuestion() {
    const ax = fisicaBatxCinematicaRandomInteger(-8, 8);
    const ay = fisicaBatxCinematicaRandomInteger(-8, 8);
    let bx = fisicaBatxCinematicaRandomInteger(-8, 8);
    let by = fisicaBatxCinematicaRandomInteger(-8, 8);

    while (bx === ax && by === ay) {
        bx = fisicaBatxCinematicaRandomInteger(-8, 8);
        by = fisicaBatxCinematicaRandomInteger(-8, 8);
    }

    const dx = bx - ax;
    const dy = by - ay;
    const module = Math.hypot(dx, dy);

    return {
        a: { x: ax, y: ay },
        b: { x: bx, y: by },
        expected: {
            dx,
            dy,
            module,
            ux: dx / module,
            uy: dy / module
        },
        submitted: null,
        correct: null
    };
}

function fisicaBatxCinematicaGetInputValues() {
    const ids = ['dx', 'dy', 'module', 'ux', 'uy'];
    const values = {};

    for (const id of ids) {
        const input = document.getElementById(`fisica-batx-cinematica-${id}`);
        const rawValue = input?.value.trim().replace(',', '.');
        if (rawValue === '' || !Number.isFinite(Number(rawValue))) return null;
        values[id] = Number(rawValue);
    }

    return values;
}

function fisicaBatxCinematicaIsClose(actual, expected) {
    const tolerance = Number.isInteger(expected) ? 0.01 : 0.03;
    return Math.abs(actual - expected) <= tolerance;
}

function fisicaBatxCinematicaRenderGraph(question) {
    const svg = document.getElementById('fisica-batx-cinematica-graph');
    if (!svg || !question) return;

    const plot = { left: 70, right: 590, top: 40, bottom: 360 };
    const min = -10;
    const max = 10;
    const scaleX = value => plot.left + ((value - min) / (max - min)) * (plot.right - plot.left);
    const scaleY = value => plot.bottom - ((value - min) / (max - min)) * (plot.bottom - plot.top);
    const xAxisY = scaleY(0);
    const yAxisX = scaleX(0);
    const ax = scaleX(question.a.x);
    const ay = scaleY(question.a.y);
    const bx = scaleX(question.b.x);
    const by = scaleY(question.b.y);
    const gridLines = [];
    const labels = [];

    for (let value = min; value <= max; value += 1) {
        const x = scaleX(value);
        const y = scaleY(value);
        const major = value % 2 === 0;
        gridLines.push(`<line class="${major ? 'fisica-batx-cinematica__grid-line fisica-batx-cinematica__grid-line--major' : 'fisica-batx-cinematica__grid-line'}" x1="${x}" y1="${plot.top}" x2="${x}" y2="${plot.bottom}"></line>`);
        gridLines.push(`<line class="${major ? 'fisica-batx-cinematica__grid-line fisica-batx-cinematica__grid-line--major' : 'fisica-batx-cinematica__grid-line'}" x1="${plot.left}" y1="${y}" x2="${plot.right}" y2="${y}"></line>`);
        if (value % 2 === 0 && value !== 0) {
            labels.push(`<text class="fisica-batx-cinematica__axis-label" x="${x}" y="${xAxisY + 22}">${value}</text>`);
            labels.push(`<text class="fisica-batx-cinematica__axis-label" x="${yAxisX - 12}" y="${y + 4}">${value}</text>`);
        }
    }

    svg.innerHTML = `
        <title id="fisica-batx-cinematica-graph-title">Pla cartesià de l’exercici</title>
        <desc id="fisica-batx-cinematica-graph-desc">El vector va del punt A al punt B. A és (${question.a.x}, ${question.a.y}) i B és (${question.b.x}, ${question.b.y}).</desc>
        <defs>
            <marker id="fisica-batx-cinematica-arrowhead" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto" markerUnits="strokeWidth">
                <path d="M 0 0 L 7 2.5 L 0 5 z" class="fisica-batx-cinematica__vector-arrowhead"></path>
            </marker>
        </defs>
        <rect class="fisica-batx-cinematica__graph-paper" x="0" y="0" width="640" height="420" rx="12"></rect>
        ${gridLines.join('')}
        <line class="fisica-batx-cinematica__axis" x1="${plot.left}" y1="${xAxisY}" x2="${plot.right + 12}" y2="${xAxisY}" marker-end="url(#fisica-batx-cinematica-arrowhead)"></line>
        <line class="fisica-batx-cinematica__axis" x1="${yAxisX}" y1="${plot.bottom}" x2="${yAxisX}" y2="${plot.top - 12}" marker-end="url(#fisica-batx-cinematica-arrowhead)"></line>
        ${labels.join('')}
        <text class="fisica-batx-cinematica__axis-name" x="${plot.right + 4}" y="${xAxisY - 10}">x</text>
        <text class="fisica-batx-cinematica__axis-name" x="${yAxisX + 10}" y="${plot.top - 12}">y</text>
        <line class="fisica-batx-cinematica__vector" x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" marker-end="url(#fisica-batx-cinematica-arrowhead)"></line>
        <circle class="fisica-batx-cinematica__point fisica-batx-cinematica__point--a" cx="${ax}" cy="${ay}" r="4.5"></circle>
        <circle class="fisica-batx-cinematica__point fisica-batx-cinematica__point--b" cx="${bx}" cy="${by}" r="4.5"></circle>
        <text class="fisica-batx-cinematica__point-label" x="${ax + 12}" y="${ay - 12}">A</text>
        <text class="fisica-batx-cinematica__point-label" x="${bx + 12}" y="${by - 12}">B</text>
    `;
}

function initFisicaBatxCinematica() {
    const game = document.getElementById('fisica-batx-cinematica-game');
    const results = document.getElementById('fisica-batx-cinematica-results');
    if (!game || !results) return;

    fisicaBatxCinematicaState.questions = Array.from({ length: 10 }, fisicaBatxCinematicaCreateQuestion);
    fisicaBatxCinematicaState.questionIndex = 0;
    fisicaBatxCinematicaState.correctAnswers = 0;
    fisicaBatxCinematicaState.attempts = 0;
    fisicaBatxCinematicaState.startedAt = Date.now();
    fisicaBatxCinematicaState.finished = false;
    fisicaBatxCinematicaState.saving = false;
    fisicaBatxCinematicaState.saved = false;

    game.classList.remove('hidden');
    results.classList.add('hidden');
    document.getElementById('fisica-batx-cinematica-save-retry')?.classList.add('hidden');
    fisicaBatxCinematicaRenderQuestion();
}

function fisicaBatxCinematicaRenderQuestion() {
    const question = fisicaBatxCinematicaState.questions[fisicaBatxCinematicaState.questionIndex];
    if (!question) return;

    document.getElementById('fisica-batx-cinematica-progress').textContent =
        `Exercici ${fisicaBatxCinematicaState.questionIndex + 1} de ${fisicaBatxCinematicaState.questions.length}`;
    document.getElementById('fisica-batx-cinematica-point-a').textContent = `A = (${question.a.x}, ${question.a.y})`;
    document.getElementById('fisica-batx-cinematica-point-b').textContent = `B = (${question.b.x}, ${question.b.y})`;
    fisicaBatxCinematicaRenderGraph(question);

    ['dx', 'dy', 'module', 'ux', 'uy'].forEach(id => {
        const input = document.getElementById(`fisica-batx-cinematica-${id}`);
        input.value = '';
        input.disabled = false;
    });

    const feedback = document.getElementById('fisica-batx-cinematica-feedback');
    feedback.textContent = '';
    setElementStateColor(feedback, 'muted');
    document.getElementById('fisica-batx-cinematica-check').disabled = false;
    document.getElementById('fisica-batx-cinematica-next').classList.add('hidden');
    document.getElementById('fisica-batx-cinematica-next').textContent = 'Següent exercici';
    fisicaBatxCinematicaUpdateStats();
}

function checkFisicaBatxCinematicaAnswer() {
    const state = fisicaBatxCinematicaState;
    if (state.finished || state.saving) return;

    const submitted = fisicaBatxCinematicaGetInputValues();
    const feedback = document.getElementById('fisica-batx-cinematica-feedback');
    if (!submitted) {
        feedback.textContent = 'Completa tots els camps amb nombres vàlids abans de corregir.';
        setElementStateColor(feedback, 'warning');
        return;
    }

    const question = state.questions[state.questionIndex];
    const checks = Object.keys(question.expected).map(key =>
        fisicaBatxCinematicaIsClose(submitted[key], question.expected[key])
    );
    const earned = checks.filter(Boolean).length;
    question.submitted = submitted;
    question.correct = checks;
    state.correctAnswers += earned;
    state.attempts += 1;

    const errors = Object.keys(question.expected)
        .filter((key, index) => !checks[index])
        .map(key => `${key}: ${fisicaBatxCinematicaFormat(question.expected[key])}`);

    if (earned === checks.length) {
        feedback.textContent = 'Molt bé! Has resolt correctament els cinc apartats.';
        setElementStateColor(feedback, 'success');
    } else {
        feedback.textContent = `Has encertat ${earned} de ${checks.length}. Valors correctes: ${errors.join(' · ') || 'revisa el procediment.'}`;
        setElementStateColor(feedback, earned > 0 ? 'warning' : 'error');
    }

    ['dx', 'dy', 'module', 'ux', 'uy'].forEach(id => {
        document.getElementById(`fisica-batx-cinematica-${id}`).disabled = true;
    });
    document.getElementById('fisica-batx-cinematica-check').disabled = true;
    const nextButton = document.getElementById('fisica-batx-cinematica-next');
    nextButton.textContent = state.questionIndex === state.questions.length - 1 ? 'Veure resultat final' : 'Següent exercici';
    nextButton.classList.remove('hidden');
    fisicaBatxCinematicaUpdateStats();
}

function nextFisicaBatxCinematicaQuestion() {
    const state = fisicaBatxCinematicaState;
    if (state.questionIndex >= state.questions.length - 1) {
        fisicaBatxCinematicaFinish();
        return;
    }

    state.questionIndex += 1;
    fisicaBatxCinematicaRenderQuestion();
}

function fisicaBatxCinematicaFinish() {
    const state = fisicaBatxCinematicaState;
    if (state.finished) return;

    state.finished = true;
    const percentage = Math.round((state.correctAnswers / (state.questions.length * 5)) * 100);
    document.getElementById('fisica-batx-cinematica-game').classList.add('hidden');
    document.getElementById('fisica-batx-cinematica-results').classList.remove('hidden');
    document.getElementById('fisica-batx-cinematica-final-score').textContent =
        `${percentage}% d’encerts (${state.correctAnswers}/${state.questions.length * 5})`;
    saveFisicaBatxCinematicaResult();
}

async function saveFisicaBatxCinematicaResult() {
    const state = fisicaBatxCinematicaState;
    if (state.saving || state.saved || !state.finished) return;

    const feedback = document.getElementById('fisica-batx-cinematica-save-feedback');
    const retryButton = document.getElementById('fisica-batx-cinematica-save-retry');
    if (typeof window.appState === 'undefined' || !window.appState.user || !window.appState.currentProject || typeof callApi !== 'function') {
        feedback.textContent = 'No es pot desar la puntuació perquè falta la sessió d’usuari o la connexió amb el servei.';
        setElementStateColor(feedback, 'error');
        retryButton?.classList.remove('hidden');
        return;
    }

    state.saving = true;
    retryButton?.classList.add('hidden');
    feedback.textContent = 'Desant la puntuació…';
    setElementStateColor(feedback, 'muted');

    const percentage = Math.round((state.correctAnswers / (state.questions.length * 5)) * 100);
    const details = state.questions.map((question, index) => ({
        exercici: index + 1,
        puntA: question.a,
        puntB: question.b,
        esperat: Object.fromEntries(Object.entries(question.expected).map(([key, value]) => [key, fisicaBatxCinematicaRound(value)])),
        resposta: question.submitted,
        apartatsEncertats: question.correct?.filter(Boolean).length || 0
    }));
    const positiveDetails = {
        versio: '1.0',
        percentatge: percentage,
        encerts: state.correctAnswers,
        apartats: state.questions.length * 5,
        intents: state.attempts,
        exercicis: details
    };

    try {
        const response = await callApi('saveResult', {
            email: window.appState.user.email,
            curs: window.appState.user.curs,
            grup: window.appState.user.grup || window.appState.user.curs,
            projecte: window.appState.currentProject.titol,
            app: 'Cinemàtica - vector unitari AB',
            nivell: '1r Batxillerat',
            puntuacio: percentage,
            temps_segons: Math.round((Date.now() - state.startedAt) / 1000),
            feedback_pos: JSON.stringify(positiveDetails),
            feedback_neg: JSON.stringify(details.filter(item => item.apartatsEncertats < 5))
        });

        if (!response || response.status !== 'success') {
            throw new Error(response?.message || 'El servei no ha confirmat el desament.');
        }

        state.saved = true;
        feedback.textContent = 'Puntuació i detall dels exercicis desats correctament al full de resultats.';
        setElementStateColor(feedback, 'success');
    } catch (error) {
        console.error('Error desant la puntuació de Cinemàtica:', error);
        feedback.textContent = 'No s’ha pogut desar la puntuació. Pots tornar-ho a provar.';
        setElementStateColor(feedback, 'error');
        retryButton?.classList.remove('hidden');
    } finally {
        state.saving = false;
    }
}

function fisicaBatxCinematicaUpdateStats() {
    const total = fisicaBatxCinematicaState.questions.length * 5;
    const percentage = total > 0 ? Math.round((fisicaBatxCinematicaState.correctAnswers / total) * 100) : 0;
    document.getElementById('fisica-batx-cinematica-score').textContent =
        `Encerts: ${fisicaBatxCinematicaState.correctAnswers}/${total} (${percentage}%)`;
}

function restartFisicaBatxCinematica() {
    initFisicaBatxCinematica();
}

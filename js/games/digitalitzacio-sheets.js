const DIGITALITZACIO_SHEETS_ROUND_LENGTH = 40;
const DIGITALITZACIO_SHEETS_RANGE_COUNT = 10;
const DIGITALITZACIO_SHEETS_FORMULA_COUNT = 15;
const DIGITALITZACIO_SHEETS_MIN_SIZE = 4;
const DIGITALITZACIO_SHEETS_MAX_SIZE = 7;

const digitalitzacioSheetsState = {
    questions: [],
    questionIndex: 0,
    selected: null,
    dragStart: null,
    dragging: false,
    dragMoved: false,
    markedCells: new Set(),
    score: 0,
    answered: false,
    startedAt: 0,
    eventsBound: false
};

function digitalitzacioSheetsShuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
}

function digitalitzacioSheetsRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function digitalitzacioSheetsColumnName(columnIndex) {
    let name = '';
    let value = columnIndex + 1;
    while (value > 0) {
        const remainder = (value - 1) % 26;
        name = String.fromCharCode(65 + remainder) + name;
        value = Math.floor((value - 1) / 26);
    }
    return name;
}

function digitalitzacioSheetsCellReference(row, column) {
    return `${digitalitzacioSheetsColumnName(column)}${row + 1}`;
}

function digitalitzacioSheetsRangeText(range) {
    const first = digitalitzacioSheetsCellReference(range.top, range.left);
    const last = digitalitzacioSheetsCellReference(range.bottom, range.right);
    return `${first}:${last}`;
}

function digitalitzacioSheetsCreateRange(rows, columns, shape) {
    const top = digitalitzacioSheetsRandomInt(0, Math.max(0, rows - 2));
    const left = digitalitzacioSheetsRandomInt(0, Math.max(0, columns - 2));
    const bottom = shape === 'row' ? top : digitalitzacioSheetsRandomInt(top + 1, rows - 1);
    const right = shape === 'column' ? left : digitalitzacioSheetsRandomInt(left + 1, columns - 1);
    return { top, left, bottom, right };
}

function digitalitzacioSheetsCreateQuestion() {
    const rows = digitalitzacioSheetsRandomInt(DIGITALITZACIO_SHEETS_MIN_SIZE, DIGITALITZACIO_SHEETS_MAX_SIZE);
    const columns = digitalitzacioSheetsRandomInt(DIGITALITZACIO_SHEETS_MIN_SIZE, DIGITALITZACIO_SHEETS_MAX_SIZE);
    const shape = digitalitzacioSheetsShuffle(['block', 'column', 'row'])[0];
    const range = digitalitzacioSheetsCreateRange(rows, columns, shape);
    const mode = digitalitzacioSheetsShuffle(['select', 'write', 'select', 'write'])[0];
    const visual = digitalitzacioSheetsShuffle(['blue', 'yellow', 'green'])[0];
    const values = Array.from({ length: rows }, () => Array.from({ length: columns }, () =>
        String(digitalitzacioSheetsRandomInt(10, 99))
    ));

    return {
        rows,
        columns,
        range,
        shape,
        mode,
        visual,
        values,
        answer: digitalitzacioSheetsRangeText(range)
    };
}

function digitalitzacioSheetsCreateRound() {
    const rangeQuestions = Array.from({ length: DIGITALITZACIO_SHEETS_RANGE_COUNT }, digitalitzacioSheetsCreateQuestion);
    const formulaQuestions = Array.from({ length: DIGITALITZACIO_SHEETS_FORMULA_COUNT },
        digitalitzacioSheetsCreateFormulaQuestion);
    const referenceQuestions = Array.from({
        length: DIGITALITZACIO_SHEETS_ROUND_LENGTH - DIGITALITZACIO_SHEETS_RANGE_COUNT - DIGITALITZACIO_SHEETS_FORMULA_COUNT
    }, digitalitzacioSheetsCreateReferenceQuestion);
    return digitalitzacioSheetsShuffle([...rangeQuestions, ...formulaQuestions, ...referenceQuestions]);
}

function digitalitzacioSheetsCreateReferenceQuestion() {
    const categories = ['absolute', 'relative', 'column', 'row'];
    const category = categories[digitalitzacioSheetsRandomInt(0, categories.length - 1)];
    const rows = 4;
    const columns = 4;
    const target = new Set();
    const values = Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => {
        const key = `${row}:${column}`;
        const isTarget = Math.random() < 0.38;
        if (isTarget) target.add(key);
        const sourceColumn = digitalitzacioSheetsColumnName((column + 1) % columns);
        const sourceRow = row + 1;
        if (category === 'absolute' && isTarget) return `=${sourceColumn}$${sourceRow}`.replace(sourceColumn, `$${sourceColumn}`);
        if (category === 'relative' && isTarget) return `=${sourceColumn}${sourceRow}`;
        if (category === 'column' && isTarget) return `=$${sourceColumn}${sourceRow}`;
        if (category === 'row' && isTarget) return `=${sourceColumn}$${sourceRow}`;
        return `=${sourceColumn}${sourceRow}`;
    }));
    if (target.size < 2) target.add('0:0');
    const forcedFormula = category === 'absolute' ? '=$B$1'
        : category === 'column' ? '=$B1'
            : category === 'row' ? '=B$1' : '=B1';
    if (target.has('0:0')) values[0][0] = forcedFormula;
    return {
        type: 'reference',
        rows,
        columns,
        values,
        targetCells: [...target],
        category,
        mode: 'reference'
    };
}

function digitalitzacioSheetsCreateFormulaQuestion() {
    const a = digitalitzacioSheetsRandomInt(2, 9);
    const b = digitalitzacioSheetsRandomInt(2, 9);
    const c = digitalitzacioSheetsRandomInt(2, 6);
    const templates = [
        { formula: `${a}+${b}*${c}`, required: ['+','*'] },
        { formula: `(${a}+${b})*${c}`, required: ['+','*','('] },
        { formula: `${a}^2+${b}`, required: ['^','+'] },
        { formula: `${a * c}/${c}+${b}`, required: ['/','+'] },
        { formula: `${a + b}-${b}-${c}`, required: ['-'] },
        { formula: `${a}+${b}*${c}>${a + b}`, required: ['+','*','>'] },
        { formula: `${a}^2<=${b}*${c}`, required: ['^','*','<='] },
        { formula: `(${a}+${b})/${c}<>${a}`, required: ['+','/','<>'] },
        { formula: `${a}<${b}+${c}`, required: ['<','+'] },
        { formula: `${a}=${a}^1`, required: ['=','^'] }
    ];
    const template = templates[digitalitzacioSheetsRandomInt(0, templates.length - 1)];
    const parsed = digitalitzacioSheetsEvaluateFormula(template.formula);
    const build = Math.random() < 0.5;
    return {
        type: 'formula',
        formulaMode: build ? 'build' : 'evaluate',
        formula: template.formula,
        result: parsed.value,
        required: template.required,
        values: [],
        mode: 'formula'
    };
}

function digitalitzacioSheetsTokenizeFormula(source) {
    const tokens = [];
    let index = 0;
    while (index < source.length) {
        const rest = source.slice(index);
        if (/^\s/.test(rest)) {
            index += 1;
            continue;
        }
        const number = rest.match(/^\d+(?:\.\d+)?/);
        if (number) {
            tokens.push({ type: 'number', value: Number(number[0]) });
            index += number[0].length;
            continue;
        }
        const comparison = rest.match(/^(?:<>|>=|<=|=|>|<)/);
        if (comparison) {
            tokens.push({ type: 'operator', value: comparison[0] });
            index += comparison[0].length;
            continue;
        }
        const operator = rest.match(/^[+\-*/^()]/);
        if (operator) {
            tokens.push({ type: 'operator', value: operator[0] });
            index += 1;
            continue;
        }
        throw new Error('Símbol no admès');
    }
    tokens.push({ type: 'end', value: '' });
    return tokens;
}

function digitalitzacioSheetsEvaluateFormula(source) {
    let input = String(source || '').trim();
    if (input.startsWith('=')) input = input.slice(1);
    if (!input || input.length > 120) throw new Error('Fórmula buida o massa llarga');
    const tokens = digitalitzacioSheetsTokenizeFormula(input);
    let position = 0;
    let comparison;
    const peek = () => tokens[position];
    const take = value => {
        if (peek().value !== value) throw new Error('Sintaxi incorrecta');
        position += 1;
    };
    const primary = () => {
        if (peek().type === 'number') return tokens[position++].value;
        if (peek().value === '(') {
            position += 1;
            const value = comparison();
            take(')');
            return value;
        }
        if (peek().value === '-') {
            position += 1;
            return -primary();
        }
        throw new Error('Falta un nombre');
    };
    const power = () => {
        const base = primary();
        if (peek().value === '^') {
            position += 1;
            return base ** power();
        }
        return base;
    };
    const multiplication = () => {
        let value = power();
        while (peek().value === '*' || peek().value === '/') {
            const operator = tokens[position++].value;
            const right = power();
            if (operator === '/' && right === 0) throw new Error('Divisió per zero');
            value = operator === '*' ? value * right : value / right;
        }
        return value;
    };
    const addition = () => {
        let value = multiplication();
        while (peek().value === '+' || peek().value === '-') {
            const operator = tokens[position++].value;
            const right = multiplication();
            value = operator === '+' ? value + right : value - right;
        }
        return value;
    };
    comparison = () => {
        const left = addition();
        if (['>', '<', '>=', '<=', '<>', '='].includes(peek().value)) {
            const operator = tokens[position++].value;
            const right = addition();
            if (operator === '>') return left > right;
            if (operator === '<') return left < right;
            if (operator === '>=') return left >= right;
            if (operator === '<=') return left <= right;
            if (operator === '<>') return left !== right;
            return left === right;
        }
        return left;
    };
    const result = comparison();
    if (peek().type !== 'end' || typeof result === 'number' && !Number.isFinite(result)) {
        throw new Error('Fórmula incorrecta');
    }
    return { value: result };
}

function digitalitzacioSheetsRangeFromCells(first, second = first) {
    return {
        top: Math.min(first.row, second.row),
        left: Math.min(first.column, second.column),
        bottom: Math.max(first.row, second.row),
        right: Math.max(first.column, second.column)
    };
}

function digitalitzacioSheetsRangesEqual(first, second) {
    return first && second && first.top === second.top && first.left === second.left
        && first.bottom === second.bottom && first.right === second.right;
}

function digitalitzacioSheetsParseRange(value, rows, columns) {
    const match = String(value || '').trim().toUpperCase().match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/);
    if (!match) return null;

    const columnToIndex = column => {
        let result = 0;
        for (const character of column) result = result * 26 + character.charCodeAt(0) - 64;
        return result - 1;
    };
    const first = { left: columnToIndex(match[1]), top: Number(match[2]) - 1 };
    const last = {
        left: columnToIndex(match[3] || match[1]),
        top: Number(match[4] || match[2]) - 1
    };
    const range = {
        top: Math.min(first.top, last.top),
        left: Math.min(first.left, last.left),
        bottom: Math.max(first.top, last.top),
        right: Math.max(first.left, last.left)
    };
    if (range.top < 0 || range.left < 0 || range.bottom >= rows || range.right >= columns) return null;
    return range;
}

function digitalitzacioSheetsGetCellFromEvent(event) {
    const cell = event.target.closest('[data-sheet-row]');
    if (!cell || !document.getElementById('digi-sheets-grid')?.contains(cell)) return null;
    return { row: Number(cell.dataset.sheetRow), column: Number(cell.dataset.sheetColumn) };
}

function digitalitzacioSheetsSelectTo(cell) {
    const state = digitalitzacioSheetsState;
    if (!state.dragStart) state.dragStart = cell;
    state.selected = digitalitzacioSheetsRangeFromCells(state.dragStart, cell);
    digitalitzacioSheetsRenderSelection();
}

function digitalitzacioSheetsHandlePointerDown(event) {
    if (digitalitzacioSheetsState.answered) return;
    if (digitalitzacioSheetsState.questions[digitalitzacioSheetsState.questionIndex]?.type === 'reference') return;
    const cell = digitalitzacioSheetsGetCellFromEvent(event);
    if (!cell) return;
    digitalitzacioSheetsState.dragStart = cell;
    digitalitzacioSheetsState.dragging = true;
    digitalitzacioSheetsState.dragMoved = false;
    digitalitzacioSheetsState.selected = digitalitzacioSheetsRangeFromCells(cell);
    digitalitzacioSheetsRenderSelection();
}

function digitalitzacioSheetsHandlePointerEnter(event) {
    const state = digitalitzacioSheetsState;
    if (state.questions[state.questionIndex]?.type === 'reference') return;
    if (!state.dragging || state.answered) return;
    const cell = digitalitzacioSheetsGetCellFromEvent(event);
    if (cell) {
        if (cell.row !== state.dragStart?.row || cell.column !== state.dragStart?.column) state.dragMoved = true;
        digitalitzacioSheetsSelectTo(cell);
    }
}

function digitalitzacioSheetsHandlePointerUp() {
    digitalitzacioSheetsState.dragging = false;
}

function digitalitzacioSheetsHandleCellClick(event) {
    const state = digitalitzacioSheetsState;
    if (state.answered || state.dragging) return;
    const cell = digitalitzacioSheetsGetCellFromEvent(event);
    if (!cell) return;
    if (state.questions[state.questionIndex]?.type === 'reference') {
        const key = `${cell.row}:${cell.column}`;
        if (state.markedCells.has(key)) state.markedCells.delete(key);
        else state.markedCells.add(key);
        digitalitzacioSheetsRenderSelection();
        return;
    }
    if (digitalitzacioSheetsState.dragMoved) {
        digitalitzacioSheetsState.dragMoved = false;
        return;
    }
    if (event.shiftKey && digitalitzacioSheetsState.dragStart) {
        digitalitzacioSheetsSelectTo(cell);
    } else {
        digitalitzacioSheetsState.dragStart = cell;
        digitalitzacioSheetsState.selected = digitalitzacioSheetsRangeFromCells(cell);
        digitalitzacioSheetsRenderSelection();
    }
}

function digitalitzacioSheetsIsInside(range, row, column) {
    return range && row >= range.top && row <= range.bottom && column >= range.left && column <= range.right;
}

function digitalitzacioSheetsRenderSelection() {
    const state = digitalitzacioSheetsState;
    const selected = state.selected;
    const isReference = state.questions[state.questionIndex]?.type === 'reference';
    document.querySelectorAll('#digi-sheets-grid [data-sheet-row]').forEach(cell => {
        const row = Number(cell.dataset.sheetRow);
        const column = Number(cell.dataset.sheetColumn);
        const marked = isReference ? state.markedCells.has(`${row}:${column}`) : digitalitzacioSheetsIsInside(selected, row, column);
        cell.classList.toggle('digi-sheets__cell--selected', marked);
        cell.setAttribute('aria-pressed', marked ? 'true' : 'false');
    });
}

function digitalitzacioSheetsRenderGrid(question) {
    const head = document.getElementById('digi-sheets-grid-head');
    const body = document.getElementById('digi-sheets-grid-body');
    const headerRow = document.createElement('tr');
    const corner = document.createElement('th');
    corner.setAttribute('aria-hidden', 'true');
    headerRow.appendChild(corner);
    for (let column = 0; column < question.columns; column += 1) {
        const header = document.createElement('th');
        header.scope = 'col';
        header.textContent = digitalitzacioSheetsColumnName(column);
        headerRow.appendChild(header);
    }
    head.replaceChildren(headerRow);
    body.replaceChildren();

    for (let row = 0; row < question.rows; row += 1) {
        const tableRow = document.createElement('tr');
        const rowHeader = document.createElement('th');
        rowHeader.scope = 'row';
        rowHeader.textContent = String(row + 1);
        tableRow.appendChild(rowHeader);
        for (let column = 0; column < question.columns; column += 1) {
            const tableCell = document.createElement('td');
            const button = document.createElement('button');
            button.type = 'button';
            const isTargetCell = question.mode === 'write'
                && digitalitzacioSheetsIsInside(question.range, row, column);
            const isFormulaCell = question.type === 'reference';
            button.className = `digi-sheets__cell${isTargetCell ? ` digi-sheets__cell--${question.visual}` : ''}${isFormulaCell ? ' digi-sheets__cell--formula' : ''}`;
            button.dataset.sheetRow = String(row);
            button.dataset.sheetColumn = String(column);
            button.textContent = question.values[row][column];
            button.setAttribute('aria-label', isFormulaCell
                ? `${digitalitzacioSheetsCellReference(row, column)} ${question.values[row][column]}`
                : digitalitzacioSheetsCellReference(row, column));
            button.setAttribute('aria-pressed', 'false');
            tableCell.appendChild(button);
            tableRow.appendChild(tableCell);
        }
        body.appendChild(tableRow);
    }
    digitalitzacioSheetsRenderSelection();
}

function digitalitzacioSheetsSelectionInstruction(question) {
    const height = question.range.bottom - question.range.top + 1;
    const width = question.range.right - question.range.left + 1;
    const column = digitalitzacioSheetsColumnName(question.range.left);
    const row = question.range.top + 1;
    return `Selecciona ${height} files i ${width} columnes començant a la fila ${row} i columna ${column}.`;
}

function digitalitzacioSheetsReferenceInstruction(question) {
    const labels = {
        absolute: 'referències absolutes',
        relative: 'referències relatives',
        column: 'referències amb la columna fixa',
        row: 'referències amb la fila fixa'
    };
    return `Marca les cel·les que contenen ${labels[question.category]}.`;
}

function digitalitzacioSheetsSetFeedback(message, stateName = 'muted') {
    const feedback = document.getElementById('digi-sheets-feedback');
    feedback.textContent = message;
    if (typeof setElementStateColor === 'function') setElementStateColor(feedback, stateName);
}

function digitalitzacioSheetsUpdateStats() {
    const state = digitalitzacioSheetsState;
    document.getElementById('digi-sheets-progress').textContent =
        `${state.questionIndex + 1}/${state.questions.length}`;
    document.getElementById('digi-sheets-score').textContent = `Puntuació: ${state.score}/${state.questions.length}`;
}

function digitalitzacioSheetsRenderQuestion() {
    const state = digitalitzacioSheetsState;
    const question = state.questions[state.questionIndex];
    state.selected = null;
    state.dragStart = null;
    state.dragging = false;
    state.dragMoved = false;
    state.markedCells = new Set();
    state.answered = false;
    digitalitzacioSheetsUpdateStats();
    const isFormula = question.type === 'formula';
    const isReference = question.type === 'reference';
    document.querySelector('.digi-sheets__table-wrap').classList.toggle('hidden', isFormula);
    document.getElementById('digi-sheets-hint').classList.toggle('hidden', isFormula || isReference);
    document.getElementById('digi-sheets-formula-display').classList.toggle('hidden', !isFormula || question.formulaMode !== 'evaluate');
    document.getElementById('digi-sheets-formula-target').classList.toggle('hidden', !isFormula || question.formulaMode !== 'build');
    document.getElementById('digi-sheets-input-wrap').classList.toggle('hidden', isFormula || question.mode !== 'write');
    document.getElementById('digi-sheets-formula-input-wrap').classList.toggle('hidden', !isFormula);
    if (!isFormula) digitalitzacioSheetsRenderGrid(question);
    document.getElementById('digi-sheets-question').textContent = isFormula
        ? (question.formulaMode === 'evaluate'
            ? 'Calcula el resultat de la fórmula.'
            : 'Construeix una fórmula que doni el resultat demanat.')
        : isReference
            ? digitalitzacioSheetsReferenceInstruction(question)
        : question.mode === 'select'
            ? digitalitzacioSheetsSelectionInstruction(question)
            : 'Escriu el rang de la zona pintada al full.';
    document.getElementById('digi-sheets-formula-display').textContent = isFormula ? `=${question.formula}` : '';
    document.getElementById('digi-sheets-formula-target').textContent = isFormula
        ? `Resultat objectiu: ${question.result}` : '';
    document.getElementById('digi-sheets-range-input').value = '';
    document.getElementById('digi-sheets-range-input').disabled = question.mode !== 'write';
    document.getElementById('digi-sheets-formula-input').value = '';
    document.getElementById('digi-sheets-check').disabled = false;
    document.getElementById('digi-sheets-next').classList.add('hidden');
    digitalitzacioSheetsSetFeedback('');
}

function initDigitalitzacioSheetsGame() {
    const state = digitalitzacioSheetsState;
    state.questions = digitalitzacioSheetsCreateRound();
    state.questionIndex = 0;
    state.score = 0;
    state.startedAt = Date.now();
    state.answered = false;
    document.getElementById('digi-sheets-game').classList.remove('hidden');
    document.getElementById('digi-sheets-results').classList.add('hidden');

    if (!state.eventsBound) {
        const grid = document.getElementById('digi-sheets-grid');
        grid.addEventListener('pointerdown', digitalitzacioSheetsHandlePointerDown);
        grid.addEventListener('pointerover', digitalitzacioSheetsHandlePointerEnter);
        grid.addEventListener('click', digitalitzacioSheetsHandleCellClick);
        window.addEventListener('pointerup', digitalitzacioSheetsHandlePointerUp);
        state.eventsBound = true;
    }
    digitalitzacioSheetsRenderQuestion();
}

function checkDigitalitzacioSheetsAnswer() {
    const state = digitalitzacioSheetsState;
    if (state.answered) return;
    const question = state.questions[state.questionIndex];
    if (question.type === 'formula') {
        checkDigitalitzacioSheetsFormulaAnswer(question);
        return;
    }
    if (question.type === 'reference') {
        checkDigitalitzacioSheetsReferenceAnswer(question);
        return;
    }
    let answer = state.selected;
    if (question.mode === 'write') {
        answer = digitalitzacioSheetsParseRange(
            document.getElementById('digi-sheets-range-input').value,
            question.rows,
            question.columns
        );
    }
    if (!answer) {
        digitalitzacioSheetsSetFeedback('Selecciona o escriu un rang abans de corregir.', 'warning');
        return;
    }

    state.answered = true;
    const correct = digitalitzacioSheetsRangesEqual(answer, question.range);
    if (correct) state.score += 1;
    digitalitzacioSheetsUpdateStats();
    document.getElementById('digi-sheets-check').disabled = true;
    document.getElementById('digi-sheets-next').classList.remove('hidden');
    digitalitzacioSheetsSetFeedback(
        correct ? 'Correcte! El rang és exacte.' : 'No és correcte.',
        correct ? 'success' : 'error'
    );
}

function checkDigitalitzacioSheetsReferenceAnswer(question) {
    const state = digitalitzacioSheetsState;
    if (state.answered) return;
    if (state.markedCells.size === 0) {
        digitalitzacioSheetsSetFeedback('Marca almenys una cel·la abans de corregir.', 'warning');
        return;
    }
    state.answered = true;
    const target = new Set(question.targetCells);
    const correct = state.markedCells.size === target.size
        && [...target].every(cell => state.markedCells.has(cell));
    if (correct) state.score += 1;
    digitalitzacioSheetsUpdateStats();
    document.getElementById('digi-sheets-check').disabled = true;
    document.getElementById('digi-sheets-next').classList.remove('hidden');
    digitalitzacioSheetsSetFeedback(correct ? 'Correcte!' : 'No és correcte.', correct ? 'success' : 'error');
}

function checkDigitalitzacioSheetsFormulaAnswer(question) {
    const state = digitalitzacioSheetsState;
    if (state.answered) return;
    const input = document.getElementById('digi-sheets-formula-input').value;
    let result;
    const normalizedInput = input.trim().toUpperCase();
    if (question.formulaMode === 'evaluate' && ['TRUE', 'CERT', 'FALSE', 'FALS'].includes(normalizedInput)) {
        result = { value: normalizedInput === 'TRUE' || normalizedInput === 'CERT' };
    } else {
        try {
            result = digitalitzacioSheetsEvaluateFormula(input);
        } catch (error) {
            digitalitzacioSheetsSetFeedback('La fórmula no és vàlida.', 'error');
            return;
        }
    }
    const sameResult = typeof result.value === 'number' && typeof question.result === 'number'
        ? Math.abs(result.value - question.result) < 0.000001
        : result.value === question.result;
    const hasRequiredOperators = question.formulaMode !== 'build'
        || question.required.every(operator => input.includes(operator));
    const correct = sameResult && hasRequiredOperators;
    state.answered = true;
    if (correct) state.score += 1;
    digitalitzacioSheetsUpdateStats();
    document.getElementById('digi-sheets-check').disabled = true;
    document.getElementById('digi-sheets-next').classList.remove('hidden');
    digitalitzacioSheetsSetFeedback(
        correct ? 'Correcte!' : 'No és correcte.',
        correct ? 'success' : 'error'
    );
}

function nextDigitalitzacioSheetsQuestion() {
    const state = digitalitzacioSheetsState;
    if (!state.answered) return;
    state.questionIndex += 1;
    if (state.questionIndex >= state.questions.length) {
        finishDigitalitzacioSheetsGame();
        return;
    }
    digitalitzacioSheetsRenderQuestion();
}

async function finishDigitalitzacioSheetsGame() {
    const gameState = digitalitzacioSheetsState;
    document.getElementById('digi-sheets-game').classList.add('hidden');
    document.getElementById('digi-sheets-results').classList.remove('hidden');
    document.getElementById('digi-sheets-final-score').textContent =
        `${gameState.score}/${gameState.questions.length} (${Math.round(gameState.score / gameState.questions.length * 100)}%)`;
    document.getElementById('digi-sheets-save-feedback').textContent = 'Resultat preparat.';

    if (typeof state !== 'undefined' && state.user && typeof callApi === 'function') {
        try {
            await callApi('saveResult', {
                email: state.user.email,
                curs: state.user.curs,
                grup: state.user.grup || state.user.curs,
                projecte: state.currentProject?.titol || 'Digitalització',
                app: 'Google Sheets - Exercicis de rangs',
                nivell: 'Rangs petits i mitjans',
                puntuacio: Math.round(gameState.score / gameState.questions.length * 100),
                temps_segons: Math.round((Date.now() - gameState.startedAt) / 1000),
                feedback_pos: JSON.stringify({ encerts: gameState.score, total: gameState.questions.length }),
                feedback_neg: ''
            });
            document.getElementById('digi-sheets-save-feedback').textContent = 'Resultat desat.';
        } catch (error) {
            document.getElementById('digi-sheets-save-feedback').textContent = 'No s’ha pogut desar el resultat.';
            console.error('Error desant el resultat de Google Sheets:', error);
        }
    }
}

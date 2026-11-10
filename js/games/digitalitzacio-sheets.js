const DIGITALITZACIO_SHEETS_ROUND_LENGTH = 40;
const DIGITALITZACIO_SHEETS_RANGE_COUNT = 10;
const DIGITALITZACIO_SHEETS_FORMULA_COUNT = 15;
const DIGITALITZACIO_SHEETS_MIN_SIZE = 4;
const DIGITALITZACIO_SHEETS_MAX_SIZE = 12;
const DIGITALITZACIO_SHEETS_DEFAULT_COUNT = 40;
const DIGITALITZACIO_SHEETS_DIFFICULTIES = ['easy', 'medium', 'hard'];

const digitalitzacioSheetsState = {
    questions: [],
    questionIndex: 0,
    selected: null,
    selectionAnchor: null,
    selectedRows: new Set(),
    selectedColumns: new Set(),
    headerPointerHandled: false,
    deletedRows: new Set(),
    deletedColumns: new Set(),
    hiddenRows: new Set(),
    hiddenColumns: new Set(),
    dragStart: null,
    dragging: false,
    dragMoved: false,
    markedCells: new Set(),
    score: 0,
    responses: [],
    answered: false,
    startedAt: 0,
    eventsBound: false,
    settings: {
        type: 'all',
        difficulty: 'all',
        count: DIGITALITZACIO_SHEETS_DEFAULT_COUNT
    }
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

function digitalitzacioSheetsPickIndices(total, count) {
    return digitalitzacioSheetsShuffle(Array.from({ length: total }, (_, index) => index))
        .slice(0, Math.min(total, count))
        .sort((first, second) => first - second);
}

function digitalitzacioSheetsCreateHeaderSelection(rows, columns, selectionKind) {
    const isColumnSelection = selectionKind.startsWith('columns');
    const total = isColumnSelection ? columns : rows;
    const axis = isColumnSelection ? 'column' : 'row';
    if (selectionKind.endsWith('contiguous')) {
        const start = digitalitzacioSheetsRandomInt(0, Math.max(0, total - 2));
        const end = digitalitzacioSheetsRandomInt(start + 1, total - 1);
        return { axis, indices: Array.from({ length: end - start + 1 }, (_, offset) => start + offset) };
    }
    return { axis, indices: digitalitzacioSheetsPickIndices(total, 3) };
}

function digitalitzacioSheetsCreateDeleteSelection(rows, columns, axis) {
    const total = axis === 'column' ? columns : rows;
    const count = digitalitzacioSheetsRandomInt(1, Math.min(3, total - 1));
    const start = digitalitzacioSheetsRandomInt(0, total - count);
    return {
        axis,
        indices: Array.from({ length: count }, (_, offset) => start + offset),
        mode: 'contiguous'
    };
}

function digitalitzacioSheetsCreateQuestion(difficulty = 'all') {
    const level = difficulty === 'all'
        ? digitalitzacioSheetsShuffle(DIGITALITZACIO_SHEETS_DIFFICULTIES)[0]
        : difficulty;
    const sizeByDifficulty = {
        easy: [4, 5],
        medium: [6, 8],
        hard: [9, DIGITALITZACIO_SHEETS_MAX_SIZE]
    };
    const [minimumSize, maximumSize] = sizeByDifficulty[level];
    const rows = digitalitzacioSheetsRandomInt(minimumSize, maximumSize);
    const columns = digitalitzacioSheetsRandomInt(minimumSize, maximumSize);
    const shapesByDifficulty = {
        easy: ['row', 'column'],
        medium: ['block', 'column', 'row'],
        hard: ['block']
    };
    const shape = digitalitzacioSheetsShuffle(shapesByDifficulty[level])[0];
    const range = digitalitzacioSheetsCreateRange(rows, columns, shape);
    const selectionKindsByDifficulty = {
        easy: ['cells', 'columns-contiguous', 'rows-contiguous'],
        medium: ['cells', 'columns-contiguous', 'rows-contiguous', 'columns-discontinuous', 'rows-discontinuous', 'delete-rows', 'hide-rows'],
        hard: ['cells', 'columns-discontinuous', 'rows-discontinuous', 'delete-rows', 'delete-columns', 'hide-rows', 'hide-columns']
    };
    const selectionKind = digitalitzacioSheetsShuffle(selectionKindsByDifficulty[level])[0];
    const headerSelection = selectionKind === 'cells' ? null
        : selectionKind === 'delete-rows' ? digitalitzacioSheetsCreateDeleteSelection(rows, columns, 'row')
            : selectionKind === 'delete-columns' ? digitalitzacioSheetsCreateDeleteSelection(rows, columns, 'column')
                : digitalitzacioSheetsCreateHeaderSelection(rows, columns, selectionKind);
    const mode = level === 'easy' ? 'select' : level === 'hard' ? 'write'
        : digitalitzacioSheetsShuffle(['select', 'write'])[0];
    const visual = digitalitzacioSheetsShuffle(['blue', 'yellow', 'green'])[0];
    const values = Array.from({ length: rows }, () => Array.from({ length: columns }, () =>
        String(digitalitzacioSheetsRandomInt(10, 99))
    ));

    return {
        type: 'range',
        difficulty: level,
        rows,
        columns,
        range,
        shape,
        selectionKind,
        headerSelection,
        mode,
        visual,
        values,
        answer: digitalitzacioSheetsRangeText(range)
    };
}

function digitalitzacioSheetsCreateRound(settings = digitalitzacioSheetsState.settings) {
    const count = settings.count || DIGITALITZACIO_SHEETS_DEFAULT_COUNT;
    const typeCounts = settings.type === 'all'
        ? digitalitzacioSheetsGetTypeCounts(count)
        : { [settings.type]: count };
    const questions = [];
    Object.entries(typeCounts).forEach(([type, typeCount]) => {
        for (let index = 0; index < typeCount; index += 1) {
            if (type === 'range') questions.push(digitalitzacioSheetsCreateQuestion(settings.difficulty));
            if (type === 'formula') questions.push(digitalitzacioSheetsCreateFormulaQuestion(settings.difficulty));
            if (type === 'reference') questions.push(digitalitzacioSheetsCreateReferenceQuestion(settings.difficulty));
        }
    });
    return digitalitzacioSheetsShuffle(questions);
}

function digitalitzacioSheetsGetTypeCounts(count) {
    const rangeCount = Math.round(count * DIGITALITZACIO_SHEETS_RANGE_COUNT / DIGITALITZACIO_SHEETS_ROUND_LENGTH);
    const formulaCount = Math.round(count * DIGITALITZACIO_SHEETS_FORMULA_COUNT / DIGITALITZACIO_SHEETS_ROUND_LENGTH);
    return {
        range: rangeCount,
        formula: formulaCount,
        reference: count - rangeCount - formulaCount
    };
}

function digitalitzacioSheetsCreateReferenceQuestion(difficulty = 'all') {
    const categories = ['absolute', 'relative', 'column', 'row'];
    const categoryByDifficulty = {
        easy: ['relative'],
        medium: ['absolute', 'row'],
        hard: ['column', 'absolute', 'row']
    };
    const level = difficulty === 'all'
        ? digitalitzacioSheetsShuffle(DIGITALITZACIO_SHEETS_DIFFICULTIES)[0]
        : difficulty;
    const availableCategories = difficulty === 'all' ? categories : categoryByDifficulty[level];
    const category = availableCategories[digitalitzacioSheetsRandomInt(0, availableCategories.length - 1)];
    const rows = 4;
    const columns = 4;
    const target = new Set();
    const formulasByCategory = {
        absolute: (column, row) => `=$${column}$${row}`,
        relative: (column, row) => `=${column}${row}`,
        column: (column, row) => `=$${column}${row}`,
        row: (column, row) => `=${column}$${row}`
    };
    const distractorCategory = category === 'relative' ? 'absolute' : 'relative';
    const values = Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => {
        const key = `${row}:${column}`;
        const isTarget = Math.random() < 0.38;
        if (isTarget) target.add(key);
        const sourceColumn = digitalitzacioSheetsColumnName((column + 1) % columns);
        const sourceRow = row + 1;
        const formulaCategory = isTarget ? category : distractorCategory;
        return formulasByCategory[formulaCategory](sourceColumn, sourceRow);
    }));
    if (target.size < 2) target.add('0:0');
    const forcedFormula = formulasByCategory[category]('B', 1);
    if (target.has('0:0')) values[0][0] = forcedFormula;
    return {
        type: 'reference',
        difficulty: level,
        rows,
        columns,
        values,
        targetCells: [...target],
        category,
        mode: 'reference'
    };
}

function digitalitzacioSheetsCreateFormulaQuestion(difficulty = 'all') {
    const a = digitalitzacioSheetsRandomInt(2, 9);
    const b = digitalitzacioSheetsRandomInt(2, 9);
    const c = digitalitzacioSheetsRandomInt(2, 6);
    const evaluateTemplates = [
        { formula: `${a}+${b}*${c}`, required: ['+','*'], difficulty: 'easy' },
        { formula: `(${a}+${b})*${c}`, required: ['+','*','('], difficulty: 'medium' },
        { formula: `${a}^2+${b}`, required: ['^','+'], difficulty: 'medium' },
        { formula: `${a * c}/${c}+${b}`, required: ['/','+'], difficulty: 'medium' },
        { formula: `${a + b}-${b}-${c}`, required: ['-'], difficulty: 'easy' },
        { formula: `${a}+${b}*${c}>${a + b}`, required: ['+','*','>'], difficulty: 'hard' },
        { formula: `${a}^2<=${b}*${c}`, required: ['^','*','<='], difficulty: 'hard' },
        { formula: `(${a}+${b})/${c}<>${a}`, required: ['+','/','<>'], difficulty: 'hard' },
        { formula: `${a}<${b}+${c}`, required: ['<','+'], difficulty: 'hard' },
        { formula: `${a}=${a}^1`, required: ['=','^'], difficulty: 'hard' }
    ];
    const buildTemplates = [
        {
            formula: `${a}*${b}+${c}^2`,
            required: ['*', '^'],
            difficulty: 'hard',
            instruction: 'Construeix una fórmula que doni el resultat demanat. Fes servir dos operadors diferents amb prioritat superior a la suma o la resta: per exemple, multiplicació, divisió o potència.'
        },
        {
            formula: `(${a}+${b})*${c}`,
            required: ['+', '*', '('],
            difficulty: 'medium',
            instruction: 'Construeix una fórmula que doni el resultat demanat. Fes servir parèntesis, una suma i una multiplicació.'
        },
        {
            formula: `${a}^2+${b}`,
            required: ['^', '+'],
            difficulty: 'medium',
            instruction: 'Construeix una fórmula que doni el resultat demanat. Fes servir una potència i una suma.'
        },
        {
            formula: `${a * c}/${c}+${b}`,
            required: ['/', '+'],
            difficulty: 'medium',
            instruction: 'Construeix una fórmula que doni el resultat demanat. Fes servir una divisió i una suma.'
        },
        {
            formula: `${a}<${a + 1}`,
            required: ['<'],
            difficulty: 'hard',
            instruction: 'Construeix una fórmula que doni el resultat demanat. Fes servir l’operador de comparació <.'
        },
        {
            formula: `${a + 1}<${a}`,
            required: ['<'],
            difficulty: 'hard',
            instruction: 'Construeix una fórmula que doni el resultat demanat. Fes servir l’operador de comparació <.'
        }
    ];
    const templates = [...evaluateTemplates.map(template => ({ ...template, formulaMode: 'evaluate' })),
        ...buildTemplates.map(template => ({ ...template, formulaMode: 'build' }))]
        .filter(template => difficulty === 'all' || template.difficulty === difficulty);
    const template = templates[digitalitzacioSheetsRandomInt(0, templates.length - 1)];
    const parsed = digitalitzacioSheetsEvaluateFormula(template.formula);
    return {
        type: 'formula',
        difficulty: template.difficulty,
        formulaMode: template.formulaMode,
        formula: template.formula,
        result: parsed.value,
        required: template.required,
        instruction: template.instruction || 'Calcula el resultat de la fórmula.',
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

function digitalitzacioSheetsGetFormulaOperators(source) {
    let input = String(source || '').trim();
    if (input.startsWith('=')) input = input.slice(1);
    return new Set(digitalitzacioSheetsTokenizeFormula(input)
        .filter(token => token.type === 'operator')
        .map(token => token.value));
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

function digitalitzacioSheetsGetHeaderFromEvent(event) {
    const header = event.target.closest('[data-sheet-axis]');
    if (!header || !document.getElementById('digi-sheets-grid')?.contains(header)) return null;
    return {
        axis: header.dataset.sheetAxis,
        index: Number(header.dataset.sheetIndex)
    };
}

function digitalitzacioSheetsIsHeaderSelection(question) {
    return question.type === 'range' && question.selectionKind !== 'cells';
}

function digitalitzacioSheetsHandleHeaderClick(event, header) {
    const state = digitalitzacioSheetsState;
    const question = state.questions[state.questionIndex];
    if (!digitalitzacioSheetsIsHeaderSelection(question) || question.headerSelection.axis !== header.axis) return;
    const selected = header.axis === 'column' ? state.selectedColumns : state.selectedRows;
    const isDiscontinuous = question.selectionKind.endsWith('discontinuous');
    const hasModifier = event.ctrlKey || event.metaKey;
    if (isDiscontinuous && hasModifier) {
        if (selected.has(header.index)) selected.delete(header.index);
        else selected.add(header.index);
    } else if (!isDiscontinuous && event.shiftKey && state.selectionAnchor !== null) {
        selected.clear();
        const start = Math.min(state.selectionAnchor, header.index);
        const end = Math.max(state.selectionAnchor, header.index);
        for (let index = start; index <= end; index += 1) selected.add(index);
    } else {
        selected.clear();
        selected.add(header.index);
    }
    state.selectionAnchor = header.index;
    digitalitzacioSheetsRenderSelection();
}

function digitalitzacioSheetsIsDeleteSelection(question) {
    return question?.selectionKind === 'delete-rows' || question?.selectionKind === 'delete-columns';
}

function digitalitzacioSheetsIsStructuralSelection(question) {
    return digitalitzacioSheetsIsDeleteSelection(question)
        || question?.selectionKind === 'hide-rows'
        || question?.selectionKind === 'hide-columns';
}

function digitalitzacioSheetsHideContextMenu() {
    document.getElementById('digi-sheets-context-menu')?.classList.add('hidden');
}

function digitalitzacioSheetsHandleContextMenu(event) {
    const state = digitalitzacioSheetsState;
    const question = state.questions[state.questionIndex];
    if (!digitalitzacioSheetsIsStructuralSelection(question)) return;
    const header = digitalitzacioSheetsGetHeaderFromEvent(event);
    if (!header || header.axis !== question.headerSelection.axis) return;
    event.preventDefault();
    const selected = header.axis === 'column' ? state.selectedColumns : state.selectedRows;
    if (!selected.has(header.index)) {
        selected.clear();
        selected.add(header.index);
        state.selectionAnchor = header.index;
        digitalitzacioSheetsRenderSelection();
    }
    document.getElementById('digi-sheets-context-menu')?.classList.remove('hidden');
}

function digitalitzacioSheetsApplyHeaderAction(action) {
    const state = digitalitzacioSheetsState;
    const question = state.questions[state.questionIndex];
    if (!digitalitzacioSheetsIsStructuralSelection(question)) return;
    const selected = question.headerSelection.axis === 'column' ? state.selectedColumns : state.selectedRows;
    if (!selected.size) return;
    const isColumn = question.headerSelection.axis === 'column';
    if (action === 'delete') {
        if (isColumn) state.deletedColumns = new Set(selected);
        else state.deletedRows = new Set(selected);
    } else {
        if (isColumn) state.hiddenColumns = new Set(selected);
        else state.hiddenRows = new Set(selected);
    }
    state.selectedRows.clear();
    state.selectedColumns.clear();
    digitalitzacioSheetsHideContextMenu();
    digitalitzacioSheetsRenderGrid(question);
    digitalitzacioSheetsSetFeedback(
        action === 'delete'
            ? 'Selecció esborrada. Prem «Corregeix» per comprovar-la.'
            : 'Selecció amagada. Prem «Corregeix» per comprovar-la.',
        'muted'
    );
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
    const header = digitalitzacioSheetsGetHeaderFromEvent(event);
    if (header) {
        digitalitzacioSheetsState.headerPointerHandled = true;
        digitalitzacioSheetsHandleHeaderClick(event, header);
        return;
    }
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
    const header = digitalitzacioSheetsGetHeaderFromEvent(event);
    if (header) {
        if (state.headerPointerHandled) {
            state.headerPointerHandled = false;
            return;
        }
        digitalitzacioSheetsHandleHeaderClick(event, header);
        return;
    }
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
    const question = state.questions[state.questionIndex];
    const isReference = question?.type === 'reference';
    const isHeaderSelection = digitalitzacioSheetsIsHeaderSelection(question);
    document.querySelectorAll('#digi-sheets-grid [data-sheet-row]').forEach(cell => {
        const row = Number(cell.dataset.sheetRow);
        const column = Number(cell.dataset.sheetColumn);
        const marked = isReference
            ? state.markedCells.has(`${row}:${column}`)
            : isHeaderSelection
                ? question.headerSelection.axis === 'column'
                    ? state.selectedColumns.has(column)
                    : state.selectedRows.has(row)
                : digitalitzacioSheetsIsInside(selected, row, column);
        cell.classList.toggle('digi-sheets__cell--selected', marked);
        cell.setAttribute('aria-pressed', marked ? 'true' : 'false');
    });
    document.querySelectorAll('#digi-sheets-grid [data-sheet-axis]').forEach(header => {
        const axis = header.dataset.sheetAxis;
        const index = Number(header.dataset.sheetIndex);
        const marked = axis === 'column' ? state.selectedColumns.has(index) : state.selectedRows.has(index);
        header.classList.toggle('digi-sheets__header-button--selected', marked);
        header.setAttribute('aria-pressed', marked ? 'true' : 'false');
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
        if (digitalitzacioSheetsState.deletedColumns.has(column)
            || digitalitzacioSheetsState.hiddenColumns.has(column)) continue;
        const header = document.createElement('th');
        header.scope = 'col';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'digi-sheets__header-button';
        button.dataset.sheetAxis = 'column';
        button.dataset.sheetIndex = String(column);
        button.textContent = digitalitzacioSheetsColumnName(column);
        button.setAttribute('aria-label', `Columna ${button.textContent}`);
        button.setAttribute('aria-pressed', 'false');
        header.appendChild(button);
        headerRow.appendChild(header);
    }
    head.replaceChildren(headerRow);
    body.replaceChildren();

    for (let row = 0; row < question.rows; row += 1) {
        if (digitalitzacioSheetsState.deletedRows.has(row)
            || digitalitzacioSheetsState.hiddenRows.has(row)) continue;
        const tableRow = document.createElement('tr');
        const rowHeader = document.createElement('th');
        rowHeader.scope = 'row';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'digi-sheets__header-button';
        button.dataset.sheetAxis = 'row';
        button.dataset.sheetIndex = String(row);
        button.textContent = String(row + 1);
        button.setAttribute('aria-label', `Fila ${button.textContent}`);
        button.setAttribute('aria-pressed', 'false');
        rowHeader.appendChild(button);
        tableRow.appendChild(rowHeader);
        for (let column = 0; column < question.columns; column += 1) {
            if (digitalitzacioSheetsState.deletedColumns.has(column)
                || digitalitzacioSheetsState.hiddenColumns.has(column)) continue;
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
    if (digitalitzacioSheetsIsStructuralSelection(question)) {
        const axis = question.headerSelection.axis === 'column' ? 'columnes' : 'files';
        const labels = question.headerSelection.indices.map(index => question.headerSelection.axis === 'column'
            ? digitalitzacioSheetsColumnName(index)
            : String(index + 1));
        const action = question.selectionKind.startsWith('delete') ? 'esborra' : 'amaga';
        return `Selecciona les ${axis} ${labels.join(', ')} i fes clic dret. Després tria «${action} la selecció».`;
    }
    if (question.selectionKind === 'columns-contiguous' || question.selectionKind === 'rows-contiguous') {
        const axis = question.headerSelection.axis === 'column' ? 'columnes' : 'files';
        const labels = question.headerSelection.indices.map(index => question.headerSelection.axis === 'column'
            ? digitalitzacioSheetsColumnName(index)
            : String(index + 1));
        const hint = question.difficulty === 'easy'
            ? ' amb clic a la primera i Maj/Clic a l’última'
            : '';
        return `Selecciona les ${axis} ${labels[0]} fins a ${labels[labels.length - 1]}${hint}.`;
    }
    if (question.selectionKind === 'columns-discontinuous' || question.selectionKind === 'rows-discontinuous') {
        const axis = question.headerSelection.axis === 'column' ? 'columnes' : 'files';
        const labels = question.headerSelection.indices.map(index => question.headerSelection.axis === 'column'
            ? digitalitzacioSheetsColumnName(index)
            : String(index + 1));
        const hint = question.difficulty === 'easy' ? ' amb Ctrl/Clic o Cmd/Clic' : '';
        return `Selecciona les ${axis} ${labels.join(', ')}${hint}.`;
    }
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

function digitalitzacioSheetsQuestionType(question) {
    if (question.type === 'formula') return question.formulaMode === 'build' ? 'construccio-formula' : 'calcul-formula';
    if (question.type === 'reference') return 'referencies';
    if (question.selectionKind === 'delete-rows' || question.selectionKind === 'delete-columns') return 'esborrar-files-columnes';
    if (question.selectionKind === 'hide-rows' || question.selectionKind === 'hide-columns') return 'amagar-files-columnes';
    if (question.selectionKind === 'columns-contiguous' || question.selectionKind === 'rows-contiguous') return 'seleccio-contigua';
    if (question.selectionKind === 'columns-discontinuous' || question.selectionKind === 'rows-discontinuous') return 'seleccio-discontinua';
    return question.mode === 'write' ? 'rang-escrit' : 'rang-seleccionat';
}

function digitalitzacioSheetsQuestionPrompt(question) {
    if (question.type === 'formula') return question.instruction;
    if (question.type === 'reference') return digitalitzacioSheetsReferenceInstruction(question);
    return digitalitzacioSheetsSelectionInstruction(question);
}

function digitalitzacioSheetsRecordAnswer(question, correct, details) {
    const entry = {
        pregunta: digitalitzacioSheetsState.questionIndex + 1,
        tipus: digitalitzacioSheetsQuestionType(question),
        dificultat: question.difficulty,
        enunciat: digitalitzacioSheetsQuestionPrompt(question),
        correcte: correct,
        ...details
    };
    digitalitzacioSheetsState.responses.push(entry);
}

function digitalitzacioSheetsFeedbackSummary() {
    const responses = digitalitzacioSheetsState.responses;
    return {
        encerts: responses.filter(response => response.correcte).length,
        errors: responses.filter(response => !response.correcte).length,
        total: responses.length,
        items: responses
    };
}

function digitalitzacioSheetsHeaderLabels(indices, axis) {
    return indices.map(index => axis === 'column'
        ? digitalitzacioSheetsColumnName(index)
        : String(index + 1));
}

function digitalitzacioSheetsUpdateStats() {
    const state = digitalitzacioSheetsState;
    document.getElementById('digi-sheets-progress').textContent =
        `${state.questionIndex + 1}/${state.questions.length}`;
    document.getElementById('digi-sheets-score').textContent = `Puntuació: ${state.score}/${state.questions.length}`;
}

function digitalitzacioSheetsGetSettings() {
    const type = document.getElementById('digi-sheets-type')?.value || 'all';
    const difficulty = document.getElementById('digi-sheets-difficulty')?.value || 'all';
    const count = Number(document.getElementById('digi-sheets-count')?.value) || DIGITALITZACIO_SHEETS_DEFAULT_COUNT;
    return { type, difficulty, count };
}

function digitalitzacioSheetsRenderQuestion() {
    const state = digitalitzacioSheetsState;
    const question = state.questions[state.questionIndex];
    state.selected = null;
    state.selectionAnchor = null;
    state.selectedRows = new Set();
    state.selectedColumns = new Set();
    state.headerPointerHandled = false;
    state.deletedRows = new Set();
    state.deletedColumns = new Set();
    state.hiddenRows = new Set();
    state.hiddenColumns = new Set();
    digitalitzacioSheetsHideContextMenu();
    state.dragStart = null;
    state.dragging = false;
    state.dragMoved = false;
    state.markedCells = new Set();
    state.answered = false;
    digitalitzacioSheetsUpdateStats();
    const isFormula = question.type === 'formula';
    const isReference = question.type === 'reference';
    const isHeaderSelection = digitalitzacioSheetsIsHeaderSelection(question);
    document.querySelector('.digi-sheets__table-wrap').classList.toggle('hidden', isFormula);
    document.getElementById('digi-sheets-hint').classList.toggle('hidden', isFormula || isReference || isHeaderSelection);
    document.getElementById('digi-sheets-formula-display').classList.toggle('hidden', !isFormula || question.formulaMode !== 'evaluate');
    document.getElementById('digi-sheets-formula-target').classList.toggle('hidden', !isFormula || question.formulaMode !== 'build');
    document.getElementById('digi-sheets-input-wrap').classList.toggle('hidden', isFormula || isHeaderSelection || question.mode !== 'write');
    document.getElementById('digi-sheets-formula-input-wrap').classList.toggle('hidden', !isFormula);
    if (!isFormula) digitalitzacioSheetsRenderGrid(question);
    document.getElementById('digi-sheets-question').textContent = isFormula
        ? question.instruction
        : isReference
            ? digitalitzacioSheetsReferenceInstruction(question)
        : isHeaderSelection
            ? digitalitzacioSheetsSelectionInstruction(question)
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
    state.settings = digitalitzacioSheetsGetSettings();
    state.questions = digitalitzacioSheetsCreateRound(state.settings);
    state.questionIndex = 0;
    state.score = 0;
    state.responses = [];
    state.startedAt = Date.now();
    state.answered = false;
    document.getElementById('digi-sheets-game').classList.remove('hidden');
    document.getElementById('digi-sheets-results').classList.add('hidden');

    if (!state.eventsBound) {
        const grid = document.getElementById('digi-sheets-grid');
        grid.addEventListener('pointerdown', digitalitzacioSheetsHandlePointerDown);
        grid.addEventListener('pointerover', digitalitzacioSheetsHandlePointerEnter);
        grid.addEventListener('click', digitalitzacioSheetsHandleCellClick);
        grid.addEventListener('contextmenu', digitalitzacioSheetsHandleContextMenu);
        document.querySelectorAll('#digi-sheets-context-menu [data-sheet-action]').forEach(button => {
            button.addEventListener('click', () => digitalitzacioSheetsApplyHeaderAction(button.dataset.sheetAction));
        });
        document.addEventListener('click', event => {
            if (!event.target.closest('#digi-sheets-context-menu')) digitalitzacioSheetsHideContextMenu();
        });
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
    if (digitalitzacioSheetsIsStructuralSelection(question)) {
        checkDigitalitzacioSheetsStructuralAnswer(question);
        return;
    }
    if (digitalitzacioSheetsIsHeaderSelection(question)) {
        checkDigitalitzacioSheetsHeaderAnswer(question);
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
    digitalitzacioSheetsRecordAnswer(question, correct, {
        esperat: digitalitzacioSheetsRangeText(question.range),
        resposta: digitalitzacioSheetsRangeText(answer)
    });
    digitalitzacioSheetsUpdateStats();
    document.getElementById('digi-sheets-check').disabled = true;
    document.getElementById('digi-sheets-next').classList.remove('hidden');
    digitalitzacioSheetsSetFeedback(
        correct ? 'Correcte! El rang és exacte.' : 'No és correcte.',
        correct ? 'success' : 'error'
    );
}

function checkDigitalitzacioSheetsStructuralAnswer(question) {
    const state = digitalitzacioSheetsState;
    const isDelete = question.selectionKind.startsWith('delete');
    const applied = question.headerSelection.axis === 'column'
        ? isDelete ? state.deletedColumns : state.hiddenColumns
        : isDelete ? state.deletedRows : state.hiddenRows;
    const alternate = question.headerSelection.axis === 'column'
        ? isDelete ? state.hiddenColumns : state.deletedColumns
        : isDelete ? state.hiddenRows : state.deletedRows;
    const actionLabel = isDelete ? 'esborra' : 'amaga';
    if (applied.size === 0 && alternate.size === 0) {
        digitalitzacioSheetsSetFeedback(`Fes clic dret sobre la selecció i tria «${actionLabel} la selecció».`, 'warning');
        return;
    }
    const target = new Set(question.headerSelection.indices);
    const correct = applied.size === target.size && [...target].every(index => applied.has(index)) && alternate.size === 0;
    digitalitzacioSheetsRecordAnswer(question, correct, {
        accio_esperada: isDelete ? 'esborrar' : 'amagar',
        accio_realitzada: alternate.size > 0 ? (isDelete ? 'amagar' : 'esborrar') : actionLabel,
        esperat: digitalitzacioSheetsHeaderLabels(question.headerSelection.indices, question.headerSelection.axis),
        resposta: digitalitzacioSheetsHeaderLabels([...applied].length ? [...applied] : [...alternate], question.headerSelection.axis)
    });
    state.answered = true;
    if (correct) state.score += 1;
    digitalitzacioSheetsUpdateStats();
    document.getElementById('digi-sheets-check').disabled = true;
    document.getElementById('digi-sheets-next').classList.remove('hidden');
    digitalitzacioSheetsSetFeedback(
        correct
            ? isDelete ? 'Correcte! Les files o columnes s’han esborrat correctament.' : 'Correcte! Les files o columnes s’han amagat correctament.'
            : 'No és correcte.',
        correct ? 'success' : 'error'
    );
}

function checkDigitalitzacioSheetsHeaderAnswer(question) {
    const state = digitalitzacioSheetsState;
    const selected = question.headerSelection.axis === 'column'
        ? state.selectedColumns
        : state.selectedRows;
    if (selected.size === 0) {
        digitalitzacioSheetsSetFeedback('Selecciona almenys una fila o columna abans de corregir.', 'warning');
        return;
    }
    const target = new Set(question.headerSelection.indices);
    const correct = selected.size === target.size && [...target].every(index => selected.has(index));
    digitalitzacioSheetsRecordAnswer(question, correct, {
        esperat: digitalitzacioSheetsHeaderLabels(question.headerSelection.indices, question.headerSelection.axis),
        resposta: digitalitzacioSheetsHeaderLabels([...selected], question.headerSelection.axis)
    });
    state.answered = true;
    if (correct) state.score += 1;
    digitalitzacioSheetsUpdateStats();
    document.getElementById('digi-sheets-check').disabled = true;
    document.getElementById('digi-sheets-next').classList.remove('hidden');
    digitalitzacioSheetsSetFeedback(
        correct ? 'Correcte! La selecció és exacta.' : 'No és correcte.',
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
    digitalitzacioSheetsRecordAnswer(question, correct, {
        esperat: [...target],
        resposta: [...state.markedCells]
    });
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
    const formulaOperators = question.formulaMode === 'build'
        ? digitalitzacioSheetsGetFormulaOperators(input)
        : new Set();
    const missingOperators = question.formulaMode === 'build'
        ? question.required.filter(operator => !formulaOperators.has(operator))
        : [];
    const hasRequiredOperators = missingOperators.length === 0;
    const correct = sameResult && hasRequiredOperators;
    digitalitzacioSheetsRecordAnswer(question, correct, {
        esperat: question.result,
        resposta: input.trim(),
        operadors_faltants: missingOperators
    });
    state.answered = true;
    if (correct) state.score += 1;
    digitalitzacioSheetsUpdateStats();
    document.getElementById('digi-sheets-check').disabled = true;
    document.getElementById('digi-sheets-next').classList.remove('hidden');
    const missingMessage = missingOperators.length > 0
        ? ` El resultat és correcte, però falta utilitzar: ${missingOperators.join(', ')}.`
        : '';
    digitalitzacioSheetsSetFeedback(
        correct ? 'Correcte!' : `No és correcte.${sameResult ? missingMessage : ''}`,
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
    const feedback = digitalitzacioSheetsFeedbackSummary();
    const positives = feedback.items.filter(item => item.correcte);
    const negatives = feedback.items.filter(item => !item.correcte);
    document.getElementById('digi-sheets-game').classList.add('hidden');
    document.getElementById('digi-sheets-results').classList.remove('hidden');
    document.getElementById('digi-sheets-final-score').textContent =
        `${gameState.score}/${gameState.questions.length} (${Math.round(gameState.score / gameState.questions.length * 100)}%)`;
    document.getElementById('digi-sheets-feedback-summary').textContent =
        `Feedback: ${positives.length} respostes correctes i ${negatives.length} respostes per revisar.`;
    document.getElementById('digi-sheets-save-feedback').textContent = 'Resultat preparat.';

    if (typeof state !== 'undefined' && state.user && typeof callApi === 'function') {
        try {
            await callApi('saveResult', {
                email: state.user.email,
                curs: state.user.curs,
                grup: state.user.grup || state.user.curs,
                projecte: state.currentProject?.titol || 'Digitalització',
                app: 'Google Sheets - Rangs, fórmules i referències',
                nivell: `${gameState.settings.type}/${gameState.settings.difficulty}/${gameState.settings.count}`,
                puntuacio: Math.round(gameState.score / gameState.questions.length * 100),
                temps_segons: Math.round((Date.now() - gameState.startedAt) / 1000),
                feedback_pos: JSON.stringify({ encerts: positives.length, total: gameState.questions.length, items: positives }),
                feedback_neg: JSON.stringify({ errors: negatives.length, total: gameState.questions.length, items: negatives })
            });
            document.getElementById('digi-sheets-save-feedback').textContent = 'Resultat desat.';
        } catch (error) {
            document.getElementById('digi-sheets-save-feedback').textContent = 'No s’ha pogut desar el resultat.';
            console.error('Error desant el resultat de Google Sheets:', error);
        }
    }
}

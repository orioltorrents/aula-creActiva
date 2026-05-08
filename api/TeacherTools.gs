/**
 * Eines de professorat i exportació de resultats.
 */

function createResultsSheet(data) {
    const projectTitle = cleanCell(data.projecte) || 'Materia';
    const groupName = cleanCell(data.grup || data.curs) || 'Grup';
    const spreadsheetTitle = cleanCell(data.title) || `Resultats - ${projectTitle} - ${groupName}`;
    const tabName = sanitizeSheetName(data.tabName || `${groupName} - ${projectTitle}`);
    const formula = buildResultsSheetFormula(projectTitle, groupName);

    const spreadsheet = SpreadsheetApp.create(spreadsheetTitle);
    const sheet = spreadsheet.getSheets()[0];

    sheet.setName(tabName);
    sheet.getRange('A1').setFormula(formula);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 8);

    return {
        status: 'success',
        url: spreadsheet.getUrl(),
        title: spreadsheetTitle,
        tabName: tabName
    };
}

function buildResultsSheetFormula(projectTitle, groupName) {
    const safeProject = escapeFormulaString(projectTitle);
    const safeGroup = escapeFormulaString(groupName);

    return `=QUERY(IMPORTRANGE("${SHEET_ID}"; "resultats!A:K"); "select Col1,Col2,Col4,Col5,Col7,Col8,Col9,Col10,Col11 where Col4 = '${safeGroup}' and Col5 = '${safeProject}' order by Col1 desc"; 1)`;
}

function getResultGroups() {
    const sheet = getSheet('resultats');
    if (!sheet) return { status: 'error', message: 'Pestanya resultats no trobada' };

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return { status: 'success', groups: [] };

    const headers = data[0].map(normalizeHeader);
    let groupIdx = findHeaderIndex(headers, ['grup']);

    if (groupIdx === -1) {
        groupIdx = findHeaderIndex(headers, ['curs']);
    }

    if (groupIdx === -1) {
        return { status: 'error', message: 'Falta la columna grup a la pestanya resultats' };
    }

    const groupsSet = new Set();

    data.slice(1).forEach(row => {
        cleanCell(row[groupIdx])
            .split(',')
            .map(group => group.trim())
            .filter(group => group !== '')
            .forEach(group => groupsSet.add(group));
    });

    return {
        status: 'success',
        groups: Array.from(groupsSet).sort((a, b) => a.localeCompare(b, 'ca', { sensitivity: 'base' }))
    };
}

function createGroupStudentsSheet(data) {
    const groupName = cleanCell(data.grup || data.curs);
    if (!groupName) return { status: 'error', message: 'Cal triar un grup.' };

    const students = getStudentsByGroup(groupName);
    const spreadsheetTitle = `Alumnes - ${groupName}`;
    const tabName = sanitizeSheetName(`Alumnes ${groupName}`);
    const spreadsheet = SpreadsheetApp.create(spreadsheetTitle);
    const sheet = spreadsheet.getSheets()[0];

    sheet.setName(tabName);
    sheet.getRange(1, 1, 1, 4).setValues([['nom', 'cognoms', 'email', 'grup']]);

    if (students.length > 0) {
        sheet.getRange(2, 1, students.length, 4).setValues(students);
    }

    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 4);

    return {
        status: 'success',
        url: spreadsheet.getUrl(),
        title: spreadsheetTitle,
        tabName: tabName,
        count: students.length
    };
}

function getStudentsByGroup(groupName) {
    const sheet = getSheet('usuaris');
    if (!sheet) throw new Error('Pestanya usuaris no trobada');

    const data = getCachedSheetValues(sheet);
    if (data.length <= 1) return [];

    const headers = data[0].map(normalizeHeader);
    const nomIdx = findHeaderIndex(headers, ['nom']);
    const cognomsIdx = findHeaderIndex(headers, ['cognoms']);
    const emailIdx = findHeaderIndex(headers, ['email']);
    const grupIdx = findHeaderIndex(headers, ['grup']);
    const rolIdx = findHeaderIndex(headers, ['rol']);

    if (nomIdx === -1 || cognomsIdx === -1 || emailIdx === -1 || grupIdx === -1) {
        throw new Error('Falten les columnes nom, cognoms, email o grup a la pestanya usuaris');
    }

    const targetGroup = cleanCell(groupName).toLowerCase();

    return data.slice(1)
        .filter(row => {
            const rowGroups = cleanCell(row[grupIdx])
                .split(',')
                .map(group => group.trim().toLowerCase());
            const role = rolIdx === -1 ? '' : cleanCell(row[rolIdx]).toLowerCase();

            return rowGroups.indexOf(targetGroup) !== -1 && role.indexOf('prof') === -1 && role.indexOf('admin') === -1;
        })
        .map(row => [
            cleanCell(row[nomIdx]),
            cleanCell(row[cognomsIdx]),
            cleanCell(row[emailIdx]),
            cleanCell(row[grupIdx])
        ])
        .sort((a, b) => {
            const surnameCompare = a[1].localeCompare(b[1], 'ca', { sensitivity: 'base' });
            return surnameCompare !== 0 ? surnameCompare : a[0].localeCompare(b[0], 'ca', { sensitivity: 'base' });
        });
}

function sanitizeSheetName(name) {
    const cleanedName = cleanCell(name)
        .replace(/[\\/?*[\]:]/g, '-')
        .substring(0, 90);

    return cleanedName || 'Resultats';
}

function escapeFormulaString(value) {
    return cleanCell(value)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '""');
}

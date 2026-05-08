/**
 * Accés al Google Spreadsheet i helpers de cache.
 */

function getSpreadsheet() {
    if (!spreadsheetInstance) {
        spreadsheetInstance = SpreadsheetApp.openById(SHEET_ID);
    }

    return spreadsheetInstance;
}

function getSheet(sheetName) {
    return getSpreadsheet().getSheetByName(sheetName);
}

function getCachedSheetValues(sheet) {
    const cache = CacheService.getScriptCache();
    const cacheKey = 'sheet_values_' + sheet.getSheetId();
    const cached = cache.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    const values = sheet.getDataRange().getValues();

    try {
        cache.put(cacheKey, JSON.stringify(values), CACHE_TTL_SECONDS);
    } catch (error) {
        // Si una pestanya és massa gran per a la cache, simplement la llegim normal.
    }

    return values;
}

function clearSheetCache(sheet) {
    if (!sheet) return;
    CacheService.getScriptCache().remove('sheet_values_' + sheet.getSheetId());
}

function getFirstExistingSheet(sheetNames) {
    const spreadsheet = getSpreadsheet();

    for (let i = 0; i < sheetNames.length; i++) {
        const sheet = spreadsheet.getSheetByName(sheetNames[i]);
        if (sheet) return sheet;
    }

    return findFlexibleSheet(sheetNames);
}

function findFlexibleSheet(sheetNames) {
    const spreadsheet = getSpreadsheet();
    const sheets = spreadsheet.getSheets();
    const normalizedNames = sheetNames.map(normalizeLoose);

    for (let i = 0; i < sheets.length; i++) {
        if (normalizedNames.indexOf(normalizeLoose(sheets[i].getName())) !== -1) {
            return sheets[i];
        }
    }

    return null;
}

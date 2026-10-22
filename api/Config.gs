/**
 * Configuració global del backend.
 */

// ID del Google Sheet que fa de base de dades.
const SHEET_ID = '1xFjjrZhBXZWlMkgARjrhQnZraRWS2uNUZfaNqvzQjV8';

// Durant 5 minuts reutilitzem lectures del Sheet per no demanar les mateixes dades a Google en cada petició.
const CACHE_TTL_SECONDS = 300;

let spreadsheetInstance = null;

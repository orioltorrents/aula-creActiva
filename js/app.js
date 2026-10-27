
/**
 * CLIENT-SIDE LOGIC
 * Connecta amb Google Apps Script API
 */

// **********************************************************
// CONFIGURACI
// **********************************************************
// Substitueix aquesta URL per la que t'ha donat el Google Apps Script al fer "Deploy"
// Exemple: 'https://script.google.com/macros/s/AKfycbx.../exec'
const API_URL = 'https://script.google.com/macros/s/AKfycbwY3h5mvbmO64iWskhqoXb4xKbyMs-W5SwWLabV50QbmEINsjFMYvMcsSPIaqFM9bmu9w/exec';
const DATA_SHEET_ID = '1xFjjrZhBXZWlMkgARjrhQnZraRWS2uNUZfaNqvzQjV8';

const LOCAL_PROJECT_CATALOG = {
    '1r ESO': [
        { id: 'p1_rates', titol: 'Rates a la carrera', descripcio: 'Projecte de biologia i matematiques.' },
        { id: 'p1_mediterrani', titol: 'Mediterràniament', descripcio: 'Historia i geografia del mar Mediterrani.' },
        { id: 'p1_biologia', titol: 'Biologia 1r ESO', descripcio: 'Conceptes de Biologia i material de laboratori.' },
        { id: 'p1_radio', titol: 'Ràdio 1r ESO', descripcio: 'Connexions i cables d’àudio.' }
    ],
    '2n ESO': [
        { id: 'p2_paralimpics', titol: 'Paralímpics', descripcio: 'Educacio fisica i valors.' },
        { id: 'p2_biologia', titol: 'Biologia', descripcio: 'Estudi dels essers vius i el seu entorn.' },
        { id: 'p2_fisica_quimica', titol: 'Física i Química 2n ESO', descripcio: 'Pràctiques i estris de laboratori.' },
        { id: 'p2_radio', titol: 'Ràdio 2n ESO', descripcio: 'Comunicacio, locucio i edicio radiofonica.' }
    ],
    '3r ESO': [
        { id: 'p3_solidart', titol: 'SolidArt', descripcio: 'Art i solidaritat.' },
        { id: 'p3_biologia', titol: 'Biologia 3r ESO', descripcio: 'Biologia humana i activitats de repas.' },
        { id: 'p3_fisica_quimica', titol: 'Física i Química 3r ESO', descripcio: 'Pràctiques i estris de laboratori.' }
    ],
    '4t ESO': [
        { id: 'p4_natura', titol: 'Entorns de Natura', descripcio: 'Medi ambient i sostenibilitat.' },
        { id: 'p4_digitalitzacio', titol: 'Digitalitzacio', descripcio: 'Eines i recursos digitals per al segle XXI.' },
        { id: 'p4_biologia', titol: 'Biologia 4t ESO', descripcio: 'Genetica, pedigrees i herencia.' },
        { id: 'p4_fisica_quimica', titol: 'Física i Química 4t ESO', descripcio: 'Pràctiques i estris de laboratori.' }
    ],
    '1r Batxillerat': [
        { id: 'batx1_tr', titol: 'Treball de recerca', descripcio: 'Aprendre a formular bones preguntes investigables.' }
    ],
    '2n Batxillerat': [],
    '1ESO': [
        { id: 'p1_rates', titol: 'Rates a la carrera', descripcio: 'Projecte de biologia i matematiques.' },
        { id: 'p1_mediterrani', titol: 'Mediterràniament', descripcio: 'Historia i geografia del mar Mediterrani.' },
        { id: 'p1_biologia', titol: 'Biologia 1r ESO', descripcio: 'Conceptes de Biologia i material de laboratori.' },
        { id: 'p1_radio', titol: 'Ràdio 1r ESO', descripcio: 'Connexions i cables d’àudio.' }
    ],
    '2ESO': [
        { id: 'p2_paralimpics', titol: 'Paralímpics', descripcio: 'Educacio fisica i valors.' },
        { id: 'p2_biologia', titol: 'Biologia', descripcio: 'Estudi dels essers vius i el seu entorn.' },
        { id: 'p2_fisica_quimica', titol: 'Física i Química 2n ESO', descripcio: 'Pràctiques i estris de laboratori.' },
        { id: 'p2_radio', titol: 'Ràdio 2n ESO', descripcio: 'Comunicacio, locucio i edicio radiofonica.' }
    ],
    '3ESO': [
        { id: 'p3_solidart', titol: 'SolidArt', descripcio: 'Art i solidaritat.' },
        { id: 'p3_biologia', titol: 'Biologia 3r ESO', descripcio: 'Biologia humana i activitats de repas.' },
        { id: 'p3_fisica_quimica', titol: 'Física i Química 3r ESO', descripcio: 'Pràctiques i estris de laboratori.' }
    ],
    '4ESO': [
        { id: 'p4_natura', titol: 'Entorns de Natura', descripcio: 'Medi ambient i sostenibilitat.' },
        { id: 'p4_digitalitzacio', titol: 'Digitalitzacio', descripcio: 'Eines i recursos digitals per al segle XXI.' },
        { id: 'p4_biologia', titol: 'Biologia 4t ESO', descripcio: 'Genetica, pedigrees i herencia.' },
        { id: 'p4_fisica_quimica', titol: 'Física i Química 4t ESO', descripcio: 'Pràctiques i estris de laboratori.' }
    ],
    '1Batx': [
        { id: 'batx1_tr', titol: 'Treball de recerca', descripcio: 'Aprendre a formular bones preguntes investigables.' }
    ],
    '2Batx': []
};

// **********************************************************
// ESTAT DE L'APLICACI
// **********************************************************
const state = {
    user: null,
    currentProject: null,
    currentGameTitle: '',
    availabilityRows: []
};

function getCurrentUserGroups() {
    if (!state.user) return [];

    const rawGroups = String(state.user.grup || state.user.curs || '');

    return rawGroups
        .split(',')
        .map(group => group.trim())
        .filter(group => group !== '');
}

async function loadTeacherResultGroups() {
    const fallbackGroups = getCurrentUserGroups();

    if (!canUseTeacherTools()) {
        return fallbackGroups;
    }

    const response = await callApiGet('getResultGroups');

    if (response && response.status === 'success' && Array.isArray(response.groups) && response.groups.length > 0) {
        return response.groups;
    }

    if (response && response.status === 'error') {
        console.warn('No s han pogut carregar els grups de resultats:', response.message);
    }

    return fallbackGroups;
}

function setGameTitle(title) {
    const fallbackTitle = state.currentProject ? state.currentProject.titol : 'Activitat';
    state.currentGameTitle = title || fallbackTitle;

    const gameUserName = document.getElementById('game-user-name');
    if (gameUserName) {
        const userName = state.user
            ? [state.user.nom, state.user.cognoms].filter(Boolean).join(' ').trim()
            : '';
        gameUserName.textContent = userName;
        gameUserName.classList.toggle('hidden', !userName);
    }

    const gameTitle = document.getElementById('game-title');
    if (gameTitle) {
        gameTitle.textContent = state.currentGameTitle;
    }
}

function prepareFragmentImages(container) {
    if (!container) return;

    container.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) img.loading = 'lazy';
        if (!img.hasAttribute('decoding')) img.decoding = 'async';
    });
}

async function loadFragment(containerSelector, fragmentPath) {
    const container = document.querySelector(containerSelector);

    if (!container) {
        throw new Error(`No existeix el contenidor: ${containerSelector}`);
    }

    const response = await fetch(fragmentPath, {
        cache: "no-cache"
    });

    if (!response.ok) {
        throw new Error(`No s'ha pogut carregar el fragment: ${fragmentPath}`);
    }

    container.innerHTML = await response.text();
    prepareFragmentImages(container);

    return container;
}

async function loadFragmentInto(container, fragmentPath) {
    if (!container) {
        throw new Error(`No existeix el contenidor per al fragment: ${fragmentPath}`);
    }

    const response = await fetch(fragmentPath, {
        cache: "no-cache"
    });

    if (!response.ok) {
        throw new Error(`No s'ha pogut carregar el fragment: ${fragmentPath}`);
    }

    container.innerHTML = await response.text();
    prepareFragmentImages(container);

    return container;
}

async function loadNestedFragments(root = document) {
    const placeholders = [...root.querySelectorAll('[data-fragment]')];

    await Promise.all(placeholders.map(async placeholder => {
        const fragmentPath = placeholder.dataset.fragment;
        await loadFragmentInto(placeholder, fragmentPath);
        const fragmentRoot = placeholder.firstElementChild || placeholder;
        await loadNestedFragments(fragmentRoot);
    }));
}

async function ensureProjectFragment(projectId, fragmentPath) {
    const existingProject = document.getElementById(projectId);
    if (existingProject) return existingProject;

    const activityArea = document.getElementById('activity-area');
    if (!activityArea) {
        throw new Error('No existeix el contenidor #activity-area');
    }

    const placeholder = document.createElement('div');
    activityArea.appendChild(placeholder);

    await loadFragmentInto(placeholder, fragmentPath);
    await loadNestedFragments(placeholder);

    if (typeof translateUI === 'function') {
        translateUI();
    }

    return document.getElementById(projectId);
}

async function showDashboardFragment() {
    await loadFragment("#app", "fragments/screens/dashboard.html");

    const logoutBtn = document.getElementById("logout-btn");
    const languageSelector = document.getElementById("language-selector");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    if (languageSelector) {
        languageSelector.addEventListener("change", (event) => {
            const lang = event.target.value;

            if (typeof i18n !== "undefined") {
                i18n.setLanguage(lang);
                translateUI();
            }
        });
    }
}

async function showGameFragment() {
    await loadFragment("#app", "fragments/screens/game-screen.html");
    await loadNestedFragments(document.getElementById("game-screen"));

    const backDashboardBtn = document.getElementById("back-dashboard-btn");
    const fullscreenBtn = document.getElementById("fullscreen-btn");

    if (backDashboardBtn) {
        backDashboardBtn.addEventListener("click", () => {
            loadDashboard().catch(error => {
                console.error("Error carregant dashboard:", error);
            });
        });
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", toggleFullscreen);
    }

    if (typeof translateUI === "function") {
        translateUI();
    }
}

function getCurrentUserRole() {
    if (typeof state === 'undefined' || !state.user) return '';
    return String(state.user.rol || '').trim().toLowerCase();
}

function hasUserRole(roleFragment) {
    const normalizedRole = String(roleFragment || '').trim().toLowerCase();
    if (!normalizedRole) return false;
    return getCurrentUserRole().includes(normalizedRole);
}

function isAdminUser() {
    return hasUserRole('admin');
}

function isTeacherUser() {
    return hasUserRole('profe') || hasUserRole('prof');
}

function canUseTeacherTools() {
    return isAdminUser() || isTeacherUser();
}

function setElementStateColor(element, stateName) {
    if (!element) return;
    element.classList.remove(
        'state-success',
        'state-error',
        'state-warning',
        'state-muted',
        'quiz-feedback--success',
        'quiz-feedback--error',
        'quiz-feedback--warning',
        'quiz-feedback--muted'
    );

    if (stateName) {
        element.classList.add(`state-${stateName}`);
        element.classList.add(`quiz-feedback--${stateName}`);
    }
}

function getQuizLevelButtonModifier(levelName) {
    const normalizedLevel = (levelName || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    if (normalizedLevel.includes('facil') || normalizedLevel.includes('easy')) {
        return 'quiz-filter-button--easy';
    }

    if (normalizedLevel.includes('mitj') || normalizedLevel.includes('medium')) {
        return 'quiz-filter-button--medium';
    }

    if (normalizedLevel.includes('dificil') || normalizedLevel.includes('hard')) {
        return 'quiz-filter-button--hard';
    }

    return 'quiz-filter-button--topic';
}

function getQuizFilterButtonModifier(fieldName, value) {
    return fieldName === 'difficulty'
        ? getQuizLevelButtonModifier(value)
        : 'quiz-filter-button--topic';
}

function normalizeQuizLevelName(levelName) {
    return (levelName || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[_-]+/g, ' ')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .trim();
}

function getQuizLevelRank(levelName) {
    const normalizedLevel = normalizeQuizLevelName(levelName);
    const order = {
        'molt facil': 0,
        facil: 1,
        easy: 1,
        mitja: 2,
        mitjana: 2,
        medium: 2,
        avancat: 3,
        advanced: 3,
        dificil: 4,
        hard: 4,
        'molt dificil': 5,
        'very hard': 5,
        pau: 6,
        'pau dificil': 7,
        'pau dificils': 7,
        'pau hard': 7
    };

    return Object.prototype.hasOwnProperty.call(order, normalizedLevel) ? order[normalizedLevel] : 100;
}

function getQuizLevelLabel(levelName) {
    const labels = {
        'molt facil': 'Molt fcil',
        facil: 'Fcil',
        mitja: 'Mitj',
        mitjana: 'Mitj',
        avancat: 'Avanat',
        dificil: 'Difcil',
        'molt dificil': 'Molt difcil',
        pau: 'PAU',
        'pau dificil': 'PAU difcil'
    };

    return labels[normalizeQuizLevelName(levelName)] || levelName;
}

function sortQuizLevels(levels) {
    return [...levels].sort((a, b) => {
        const rankA = getQuizLevelRank(a);
        const rankB = getQuizLevelRank(b);

        if (rankA !== rankB) {
            return rankA - rankB;
        }

        return String(a).localeCompare(String(b), 'ca', { sensitivity: 'base' });
    });
}


// **********************************************************
// INICIALITZACI
// **********************************************************
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
        state.user = JSON.parse(savedUser);

        loadDashboard().catch(error => {
            console.error("Error carregant dashboard:", error);
        });
    } else {
        showLoginFragment().catch(error => {
            console.error("Error carregant login:", error);
        });
    }
});

// **********************************************************
// FUNCIONS DE NAVEGACI
// **********************************************************


function showScreen(screenName) {
    const currentScreens = {
        login: document.getElementById('login-screen'),
        dashboard: document.getElementById('dashboard-screen'),
        game: document.getElementById('game-screen')
    };

    Object.values(currentScreens).forEach(screen => {
        if (!screen) return;

        screen.classList.remove('active');
        screen.classList.add('hidden');
    });

    if (currentScreens[screenName]) {
        currentScreens[screenName].classList.add('active');
        currentScreens[screenName].classList.remove('hidden');
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error entering fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// **********************************************************
// API CALLS
// **********************************************************
async function callApi(action, params = {}) {
    if (API_URL.includes('POSA_AQUI')) {
        alert("ERROR: Has de configurar l'API_URL al fitxer js/app.js!");
        return null;
    }

    const url = new URL(API_URL);
    url.searchParams.append('action', action);

    // Convertim params a query string per al GET (Simple CORS fix: use GET for everything if possible or POST text/plain)
    // Per simplicitat, farem servir GET per defecte o POST amb no-cors si calia, per el redirect de GAS via GET sol anar b.
    // Tanmateix, per enviar dades (POST) a vegades s millor user `navigator.sendBeacon` o `fetch` amb `no-cors` (per no reps resposta).
    // Anem a intentar GET per tot ja que JSONP est deprecated i CORS s complex a GAS.
    // L'estratgia: enviar tot per query params si s curt, o POST text/plain (que no dispara preflight).

    // Mtode: Utilitzarem 'no-cors' per enviar dades sense esperar resposta JSON precisa si falla CORS,
    // o b, assumim que el redireccionament funciona (normalment s).

    // Soluci Robusta: Enviar com POST text/plain. Google Apps Script ho llegeix a e.postData.contents.
    // Aix evita el Preflight OPTIONS.

    // Modifiquem la URL existent (declarada a la lnia 98) per afegir l'acci
    // Aix assegura que el backend rebi e.parameter.action fins i tot en POST
    url.searchParams.set('action', action);

    // Opcions per a POST (per defecte)
    const requestParams = { ...params, action: action };

    if (action === 'saveResult' && state.user && state.user.grup && !requestParams.grup) {
        requestParams.grup = state.user.grup;
    }

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(requestParams)
    };

    try {
        const response = await fetch(url.toString(), options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { status: 'error', message: 'Error de connexi' };
    }
}

// **********************************************************
// LGICA DE NEGOCI
// **********************************************************

async function callApiGet(action, params = {}) {
    if (API_URL.includes('POSA_AQUI')) {
        alert("ERROR: Has de configurar l'API_URL al fitxer js/app.js!");
        return null;
    }

    const url = new URL(API_URL);
    url.searchParams.set('action', action);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value == null ? '' : String(value));
    });

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            cache: 'no-cache'
        });
        const responseText = await response.text();

        try {
            return JSON.parse(responseText);
        } catch (parseError) {
            console.error('API GET non-JSON response:', responseText);
            return {
                status: 'error',
                message: responseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240) || 'Resposta no JSON de l API'
            };
        }
    } catch (error) {
        console.error('API GET Error:', error);
        return { status: 'error', message: `Error de connexio: ${error.message}` };
    }
}

function getApiErrorMessage(response, fallbackMessage) {
    if (!response) return fallbackMessage;
    if (response.message) return response.message;
    if (response.error) return response.error;
    return fallbackMessage;
}

function showCreatedSheetWindowStatus(targetWindow, title, message) {
    if (!targetWindow || targetWindow.closed || !targetWindow.document) return;

    targetWindow.document.title = title;
    targetWindow.document.body.textContent = '';

    const heading = targetWindow.document.createElement('h1');
    heading.textContent = title;

    const paragraph = targetWindow.document.createElement('p');
    paragraph.textContent = message;

    targetWindow.document.body.appendChild(heading);
    targetWindow.document.body.appendChild(paragraph);
}

async function handleLogin(email, password) {
    const btn = document.getElementById('login-btn');
    const loader = document.getElementById('login-loader');
    const errorMsg = document.getElementById('login-error');

    btn.disabled = true;
    loader.classList.remove('hidden');
    errorMsg.textContent = '';

    try {
        const response = await callApi('login', { email, password });

        if (response && response.status === 'success') {
            state.user = response.user;
            localStorage.setItem('user', JSON.stringify(state.user));

            await loadDashboard().catch(error => {
                console.error("Error carregant dashboard:", error);
            });
        } else {
            errorMsg.textContent = response ? response.message : 'Error desconegut';
        }
    } catch (e) {
        console.error("Error dins handleLogin:", e);
        errorMsg.textContent = 'Error de xarxa. Comprova la URL.';
    } finally {
        btn.disabled = false;
        loader.classList.add('hidden');
    }
}

function logout() {
    state.user = null;
    state.currentProject = null;
    localStorage.removeItem('user');

    showLoginFragment().catch(error => {
        console.error("Error carregant login:", error);
    });
}

async function showLoginFragment() {
    await loadFragment("#app", "fragments/screens/login.html");

    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            await handleLogin(email, password);
        });
    }

    if (typeof translateUI === "function") {
        translateUI();
    }
}

function escapeSheetsQueryValue(value) {
    return String(value || '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '""');
}

function buildTeacherResultsFormula(projectTitle, groupName) {
    const safeProject = escapeSheetsQueryValue(projectTitle);
    const safeGroup = escapeSheetsQueryValue(groupName);

    return `=QUERY(IMPORTRANGE("${DATA_SHEET_ID}"; "resultats!A:K"); "select Col1,Col2,Col4,Col5,Col7,Col8,Col9,Col10,Col11 where Col4 = '${safeGroup}' and Col5 = '${safeProject}' order by Col1 desc"; 1)`;
}

function buildTeacherResultsTitle(projectTitle, groupName) {
    return `Resultats - ${projectTitle || 'Materia'} - ${groupName || 'Grup'}`;
}

function buildTeacherResultsTabName(projectTitle, groupName) {
    return `${groupName || 'Grup'} - ${projectTitle || 'Materia'}`
        .replace(/[\\/?*[\]:]/g, '-')
        .slice(0, 90);
}

function updateTeacherResultsFormula() {
    const projectSelect = document.getElementById('teacher-results-project');
    const groupSelect = document.getElementById('teacher-results-course');
    const titleOutput = document.getElementById('teacher-results-title');
    const formulaOutput = document.getElementById('teacher-results-formula');

    if (!projectSelect || !groupSelect || !formulaOutput || !titleOutput) return;

    titleOutput.textContent = buildTeacherResultsTitle(projectSelect.value, groupSelect.value);
    formulaOutput.textContent = buildTeacherResultsFormula(projectSelect.value, groupSelect.value);
}

function populateTeacherSelect(select, items, getValue, getLabel) {
    if (!select) return;

    select.innerHTML = '';
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = getValue(item);
        option.textContent = getLabel(item);
        select.appendChild(option);
    });
}

function setupTeacherTools(projects, groups) {
    const section = document.getElementById('teacher-tools-section');
    if (!section) return;

    if (!canUseTeacherTools()) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');

    const projectSelect = document.getElementById('teacher-results-project');
    const groupSelect = document.getElementById('teacher-results-course');
    const toolsCard = document.getElementById('teacher-tools-card');
    const toolsPanel = document.getElementById('teacher-tools-panel');
    const resultsCard = document.getElementById('teacher-results-card');
    const resultsPanel = document.getElementById('teacher-results-panel');
    const copyFormulaBtn = document.getElementById('teacher-copy-formula-btn');
    const createSheetBtn = document.getElementById('teacher-create-sheet-btn');
    const createStudentsSheetBtn = document.getElementById('teacher-create-students-sheet-btn');
    const programmingCard = document.getElementById('teacher-programming-card');
    const feedback = document.getElementById('teacher-results-feedback');

    populateTeacherSelect(
        projectSelect,
        projects,
        project => project.titol,
        project => project.titol
    );
    populateTeacherSelect(groupSelect, groups, group => group, group => group);
    updateTeacherResultsFormula();

    [projectSelect, groupSelect].forEach(select => {
        if (!select) return;
        select.addEventListener('change', () => {
            updateTeacherResultsFormula();
            if (feedback) feedback.textContent = '';
        });
    });

    if (toolsCard && toolsPanel) {
        toolsCard.addEventListener('click', () => {
            toolsPanel.classList.toggle('hidden');
            if (resultsPanel) resultsPanel.classList.add('hidden');
        });
    }

    if (resultsCard && resultsPanel) {
        resultsCard.addEventListener('click', () => {
            resultsPanel.classList.toggle('hidden');
            if (toolsPanel) toolsPanel.classList.add('hidden');
            updateTeacherResultsFormula();
        });
    }

    if (copyFormulaBtn) {
        copyFormulaBtn.addEventListener('click', async () => {
            const formula = document.getElementById('teacher-results-formula')?.textContent || '';
            if (!formula) return;

            try {
                await navigator.clipboard.writeText(formula);
                if (feedback) feedback.textContent = 'Formula copiada.';
            } catch (error) {
                if (feedback) feedback.textContent = 'No s\'ha pogut copiar automaticament. Selecciona la formula manualment.';
            }
        });
    }

    if (createSheetBtn) {
        createSheetBtn.addEventListener('click', async () => {
            const projectTitle = projectSelect?.value || '';
            const groupName = groupSelect?.value || '';
            const title = buildTeacherResultsTitle(projectTitle, groupName);
            const tabName = buildTeacherResultsTabName(projectTitle, groupName);
            const createdSheetWindow = window.open('about:blank', '_blank');

            createSheetBtn.disabled = true;
            if (feedback) feedback.textContent = 'Creant el full...';
            showCreatedSheetWindowStatus(
                createdSheetWindow,
                'Creant el full',
                'Estem preparant el Google Sheet. Aquesta pestanya s obrira automaticament quan estigui a punt.'
            );

            try {
                const response = await callApiGet('createResultsSheet', {
                    projecte: projectTitle,
                    grup: groupName,
                    title,
                    tabName
                });

                if (response && response.status === 'success' && response.url) {
                    if (feedback) feedback.textContent = 'Full creat. Obrint...';
                    if (createdSheetWindow) {
                        createdSheetWindow.location.href = response.url;
                    } else {
                        window.open(response.url, '_blank', 'noopener,noreferrer');
                    }
                } else {
                    const message = getApiErrorMessage(response, 'No s\'ha pogut crear el full.');
                    if (feedback) feedback.textContent = message;
                    showCreatedSheetWindowStatus(createdSheetWindow, 'No s ha pogut crear el full', message);
                    console.error('Error createResultsSheet:', response);
                }
            } catch (error) {
                const message = `Error creant el full: ${error.message}`;
                if (feedback) feedback.textContent = message;
                showCreatedSheetWindowStatus(createdSheetWindow, 'No s ha pogut crear el full', message);
            } finally {
                createSheetBtn.disabled = false;
            }
        });
    }

    if (createStudentsSheetBtn) {
        createStudentsSheetBtn.addEventListener('click', async () => {
            const groupName = groupSelect?.value || '';
            const createdSheetWindow = window.open('about:blank', '_blank');

            createStudentsSheetBtn.disabled = true;
            if (feedback) feedback.textContent = 'Creant la llista alumnes...';
            showCreatedSheetWindowStatus(
                createdSheetWindow,
                'Creant la llista alumnes',
                'Estem preparant el Google Sheet. Aquesta pestanya s obrira automaticament quan estigui a punt.'
            );

            try {
                const response = await callApiGet('createGroupStudentsSheet', {
                    grup: groupName
                });

                if (response && response.status === 'success' && response.url) {
                    if (feedback) feedback.textContent = `Llista creada amb ${response.count || 0} alumnes. Obrint...`;
                    if (createdSheetWindow) {
                        createdSheetWindow.location.href = response.url;
                    } else {
                        window.open(response.url, '_blank', 'noopener,noreferrer');
                    }
                } else {
                    const message = getApiErrorMessage(response, 'No s\'ha pogut crear la llista alumnes.');
                    if (feedback) feedback.textContent = message;
                    showCreatedSheetWindowStatus(createdSheetWindow, 'No s ha pogut crear la llista', message);
                    console.error('Error createGroupStudentsSheet:', response);
                }
            } catch (error) {
                const message = `Error creant la llista: ${error.message}`;
                if (feedback) feedback.textContent = message;
                showCreatedSheetWindowStatus(createdSheetWindow, 'No s ha pogut crear la llista', message);
            } finally {
                createStudentsSheetBtn.disabled = false;
            }
        });
    }

    if (programmingCard) {
        programmingCard.addEventListener('click', () => {
            if (resultsPanel) resultsPanel.classList.add('hidden');
            alert('Targeta preparada per connectar-hi les programacions didactiques.');
        });
    }
}

function getDashboardCourses() {
    return String(state.user?.curs || '')
        .split(',')
        .map(course => course.trim())
        .filter(course => course !== '');
}

function normalizeAvailabilityValue(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s_-]+/g, '');
}

function normalizeAvailabilityCourse(value) {
    const normalized = normalizeAvailabilityValue(value);
    const aliases = {
        '1reso': '1eso',
        '2neso': '2eso',
        '3reso': '3eso',
        '4teso': '4eso',
        '1rbatxillerat': '1batx',
        '1batxillerat': '1batx',
        '2nbatxillerat': '2batx',
        '2batxillerat': '2batx'
    };
    return aliases[normalized] || normalized;
}

function getProjectCourse(projectId) {
    const match = String(projectId || '').match(/^p([1-4])_/);
    if (match) return `${match[1]}ESO`;
    if (projectId === 'batx1_tr') return '1Batx';
    return '';
}

function getAvailabilityRows(projectId, type, activityId = '') {
    const projectCourse = normalizeAvailabilityCourse(getProjectCourse(projectId));
    const normalizedActivity = normalizeAvailabilityValue(activityId);

    const projectRows = state.availabilityRows.filter(row => {
        if (normalizeAvailabilityValue(row.projecte_id) !== normalizeAvailabilityValue(projectId)) return false;
        if (projectCourse && normalizeAvailabilityCourse(row.curs) !== projectCourse) return false;
        if (normalizeAvailabilityValue(row.tipus || 'projecte') !== normalizeAvailabilityValue(type)) return false;
        return true;
    });

    if (type === 'projecte') return projectRows;

    // 1. Coincidència exacta
    const exactMatches = projectRows.filter(row => {
        return normalizeAvailabilityValue(row.activitat_id) === normalizedActivity;
    });

    if (exactMatches.length > 0) {
        return exactMatches;
    }

    // 2. Si no hi ha coincidència exacta, provar comparació de la base del nom (ex: bioindicadors <-> rius/bioindicadors)
    return projectRows.filter(row => {
        const rowAct = normalizeAvailabilityValue(row.activitat_id);
        if (rowAct.includes('/') || String(row.activitat_id || '').includes('/')) {
            const rowBase = normalizeAvailabilityValue(String(row.activitat_id || '').split('/').pop());
            const targetBase = normalizeAvailabilityValue(String(activityId || '').split('/').pop());
            return Boolean(rowBase && rowBase === targetBase);
        }
        return false;
    });
}

function isProjectAvailable(projectId) {
    if (canUseTeacherTools()) return true;
    const rules = getAvailabilityRows(projectId, 'projecte');
    return rules.length === 0 || rules.some(rule => rule.visible !== false);
}

function isActivityAvailable(projectId, activityIds) {
    if (canUseTeacherTools()) return true;
    const candidates = Array.isArray(activityIds) ? activityIds : [activityIds];
    const rules = candidates.flatMap(activityId => getAvailabilityRows(projectId, 'activitat', activityId));
    return rules.length === 0 || rules.some(rule => rule.visible !== false);
}

function blockUnavailableActivity(activityIds) {
    return !state.currentProject || isActivityAvailable(state.currentProject.id, activityIds);
}

async function loadAvailability(courses) {
    state.availabilityRows = [];

    const responses = await Promise.all(courses.map(course => callApiGet('getAvailability', { curs: course })));
    responses.forEach(response => {
        if (response && response.status === 'success' && Array.isArray(response.disponibilitat)) {
            state.availabilityRows.push(...response.disponibilitat);
        }
    });
}

function getCardAvailabilityIds(card, projectId) {
    const onclick = card.getAttribute('onclick') || '';
    const activityMatch = onclick.match(/open(?:Rates|Mediterrani|Paralimpics|Radio|Digitalitzacio|Solidart|Tr|Bio)Activity\(['"]([^'"]+)/i);
    const senseMatch = onclick.match(/openSenseSubActivity\(['"]([^'"]+)/i);
    const systemId = card.getAttribute('data-bio-system');

    if (systemId) return [systemId, `biologia/${systemId}`];
    if (senseMatch) return [senseMatch[1], `biologia/${senseMatch[1]}`];

    const projectMatch = onclick.match(/openNaturaProject\(['"]([^'"]+)/i);
    if (projectMatch) return [projectMatch[1]];

    const naturaMatch = onclick.match(/openNaturaActivity\(['"]([^'"]+)/i);
    if (naturaMatch) {
        const parent = card.closest('[id^="natura-project-"]');
        const projectName = parent ? parent.id.replace('natura-project-', '') : '';
        return projectName
            ? [`${projectName}/${naturaMatch[1]}`, naturaMatch[1]]
            : [naturaMatch[1]];
    }

    if (activityMatch) return [activityMatch[1], `biologia/${activityMatch[1]}`];
    return [];
}

function applyAvailabilityToCurrentProject() {
    const projectId = state.currentProject?.id;
    const hub = document.querySelector('.game-module:not(.hidden)');
    if (!projectId || !hub) return;

    hub.querySelectorAll('.activity-card').forEach(card => {
        const ids = getCardAvailabilityIds(card, projectId);
        if (ids.length === 0) return;
        card.classList.toggle('availability-hidden', !isActivityAvailable(projectId, ids));
    });
}

function dedupeProjects(projects) {
    const seenIds = new Set();

    return projects.filter(project => {
        if (!project || !project.id || seenIds.has(project.id)) return false;
        seenIds.add(project.id);
        return true;
    });
}

function getLocalProjectsForCourses(courses) {
    const projects = courses.flatMap(course =>
        (LOCAL_PROJECT_CATALOG[course] || []).map(project => normalizeDashboardProject(project, course))
    );
    return dedupeProjects(projects.filter(Boolean)).filter(project => isProjectAvailable(project.id));
}

function getProjectVisuals() {
    return {
        'p1_rates': { icon: '<img src="assets/images/activities/rates/cards/targeta_rates-a-la-carrera.png" alt="Rates" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        'p1_mediterrani': { icon: '<img src="assets/images/activities/mediterrani/cards/targeta_mediterrani.png" alt="Mediterràniament" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #0ea5e9, #2563eb)' },
        'p1_natura': { icon: '<img src="assets/images/targeta_biologia.png" alt="Biologia" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
        'p3_solidart': { icon: '<img src="assets/images/activities/solidart/cards/targeta_solidart.png" alt="SolidArt" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
        'p4_natura': { icon: '<img src="assets/images/activities/entorns/cards/targeta_entorns-card.jpg" alt="Entorns de Natura" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
        'p2_paralimpics': { icon: '<img src="assets/images/activities/paralimpics/cards/targeta-paralimpics.png" alt="Paralímpics" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
        'p4_digitalitzacio': { icon: '<img src="assets/images/activities/digitalitzacio/cards/targeta-digitalitzacio.png" alt="Digitalitzacio" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
        'p1_biologia': { icon: '<img src="assets/images/activities/biologia/cards/repas-biologia-humana.png" alt="Biologia 1r ESO" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)' },
        'p2_biologia': { icon: '<img src="assets/images/activities/biologia/cards/biologia_humana.png" alt="Biologia Humana" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
        'p3_biologia': { icon: '<img src="assets/images/activities/biologia/cards/biologia_humana.png" alt="Biologia 3r ESO" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
        'p4_biologia': { icon: '<img src="assets/images/activities/biologia/cards/targeta-genetica.png" alt="Biologia 4t ESO" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
        'p2_fisica_quimica': { icon: '<img src="assets/images/activities/biologia/lab/labtools.png" alt="Física i Química 2n ESO" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #0ea5e9, #0369a1)' },
        'p3_fisica_quimica': { icon: '<img src="assets/images/activities/biologia/lab/labtools.png" alt="Física i Química 3r ESO" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #0284c7, #075985)' },
        'p4_fisica_quimica': { icon: '<img src="assets/images/activities/biologia/lab/labtools.png" alt="Física i Química 4t ESO" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #0369a1, #164e63)' },
        'p1_radio': { icon: '<img src="assets/images/activities/radio/targeta-radio.png" alt="Ràdio 1r ESO" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #facc15, #ca8a04)' },
        'p2_radio': { icon: '<img src="assets/images/activities/radio/targeta-radio.png" alt="Ràdio 2n ESO" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #facc15, #ca8a04)' },
        'batx1_tr': { icon: '<img src="assets/images/activities/treball-recerca/cards/targeta-tr.png" alt="Treball de recerca" class="project-card__image" decoding="async">', gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' }
    };
}

function renderProjectCards(grid, projects) {
    if (!grid) return;

    const projectVisuals = getProjectVisuals();
    grid.innerHTML = '';
    projects = projects.filter(project => isProjectAvailable(project.id));

    if (projects.length === 0) {
        grid.innerHTML = `<p>${i18n.t('no_projects') || 'No tens projectes assignats o no s\'han pogut carregar.'}</p>`;
        return;
    }

    projects.forEach(proj => {
        const visual = projectVisuals[proj.id] || { icon: 'P', gradient: 'linear-gradient(135deg, #94a3b8, #64748b)' };

        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="project-card__media" style="${!proj.imatge ? `background: ${visual.gradient}` : ''}">
                ${proj.imatge
                ? `<img src="${proj.imatge}" alt="${proj.titol}" class="project-card__image" decoding="async">`
                : visual.icon}
            </div>
            <div class="project-card__content">
                <div class="project-card__title">${proj.titol}</div>
                <div class="project-card__description">${proj.descripcio}</div>
            </div>
        `;
        card.addEventListener('click', () => {
            openProject(proj).catch(error => {
                console.error('Error obrint projecte:', error);
            });
        });
        grid.appendChild(card);
    });
}

function isBiologiaProject(projectId) {
    return ['p1_biologia', 'p2_biologia', 'p3_biologia', 'p4_biologia'].includes(projectId);
}

function isFisicaQuimicaProject(projectId) {
    return ['p2_fisica_quimica', 'p3_fisica_quimica', 'p4_fisica_quimica'].includes(projectId);
}

async function openFisicaQuimicaLaboratori() {
    const bioHub = await ensureProjectFragment(
        'project-hub-biologia',
        'fragments/projects/biologia/index.html'
    );
    if (!bioHub) return;

    document.querySelectorAll('.game-module').forEach(module => module.classList.add('hidden'));
    bioHub.classList.remove('hidden');
    document.getElementById('bio-systems-menu')?.classList.add('hidden');
    openBioActivity('lab-tools');
    setGameTitle(state.currentProject?.titol || 'Física i Química');
}

function returnFromBioLabTools() {
    resetBioLabTools3DGame();
    if (isFisicaQuimicaProject(state.currentProject?.id)) {
        document.getElementById('bio-activity-lab-tools-3d')?.classList.add('hidden');
        document.getElementById('project-hub-fisica-quimica')?.classList.remove('hidden');
        setGameTitle(state.currentProject.titol);
        return;
    }
    openBioSystem('laboratori');
}

function returnFromBioMicroscopiOptic() {
    resetBioMicroscopiOptic3DGame();
    openBioSystem('laboratori');
}

async function getApiProjectsForCourses(courses) {
    const responses = await Promise.all(courses.map(curs => callApiGet('getProjects', { curs })));
    const projects = [];

    responses.forEach((response, index) => {
        if (response && response.status === 'success' && response.projectes) {
            response.projectes.forEach(project => {
                const normalizedProject = normalizeDashboardProject(project, courses[index]);
                if (normalizedProject) projects.push(normalizedProject);
            });
        }
    });

    return dedupeProjects(projects).filter(project => isProjectAvailable(project.id));
}

function normalizeDashboardProject(project, courseName = '') {
    if (!project) return project;

    const title = String(project.titol || '').toLowerCase();
    const id = String(project.id || '').toLowerCase();
    if (!id.includes('biologia') && !title.includes('biologia')) return project;

    const courseKey = getCourseProjectKey(courseName || project.curs || project.course || project.titol);
    if (courseKey === '3ESO') return null;

    const bioCourse = courseKey === '1ESO' || courseKey === '4ESO' ? courseKey : '2ESO';
    return {
        ...project,
        id: `p${bioCourse.charAt(0)}_biologia`,
        titol: `Biologia ${bioCourse}`,
        descripcio: 'Estudi dels éssers vius i el seu entorn.'
    };
}

function getCourseProjectKey(value) {
    const normalized = String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '');

    if (normalized.includes('1eso') || normalized.includes('1reso') || normalized.includes('1r')) return '1ESO';
    if (normalized.includes('2eso') || normalized.includes('2neso') || normalized.includes('2n')) return '2ESO';
    if (normalized.includes('3eso') || normalized.includes('3reso') || normalized.includes('3r')) return '3ESO';
    if (normalized.includes('4eso') || normalized.includes('4teso') || normalized.includes('4t')) return '4ESO';

    return '2ESO';
}

async function loadDashboard() {
    await showDashboardFragment();

    showScreen('dashboard');



    // Update User Info
    const userName = document.getElementById('user-name');
    if (userName) {
        userName.removeAttribute('data-i18n');
        userName.textContent = `${state.user.nom} ${state.user.cognoms}`;
    }
    document.getElementById('user-course').textContent = state.user.curs;
    document.getElementById('welcome-msg').textContent = `Hola, ${state.user.nom}!`;

    // Load Projects
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '<div class="loader">Carregant projectes...</div>';

    const dashboardCourses = getDashboardCourses();
    await loadAvailability(dashboardCourses).catch(error => {
        console.warn('No s ha pogut carregar la disponibilitat:', error);
        state.availabilityRows = [];
    });
    let dashboardProjects = getLocalProjectsForCourses(dashboardCourses);

    renderProjectCards(grid, dashboardProjects);

    if (dashboardProjects.length === 0) {
        try {
            dashboardProjects = await getApiProjectsForCourses(dashboardCourses);
            renderProjectCards(grid, dashboardProjects);
        } catch (e) {
            console.error("Error carregant projectes:", e);
        }
    } else {
        getApiProjectsForCourses(dashboardCourses)
            .then(apiProjects => {
                if (apiProjects.length > 0 && JSON.stringify(apiProjects) !== JSON.stringify(dashboardProjects)) {
                    dashboardProjects = dedupeProjects([...dashboardProjects, ...apiProjects]);
                    renderProjectCards(grid, dashboardProjects);
                }
            })
            .catch(e => console.warn("No s han pogut refrescar els projectes:", e));
    }

    loadTeacherResultGroups()
        .then(resultGroups => setupTeacherTools(dashboardProjects, resultGroups))
        .catch(error => {
            console.warn("No s han pogut preparar les eines de professorat:", error);
            setupTeacherTools(dashboardProjects, getCurrentUserGroups());
        });

}

async function openProject(project) {
    if (!isProjectAvailable(project?.id)) return;
    state.currentProject = project;
    state.currentGameTitle = project.titol;
    await showGameFragment();
    showScreen('game');
    setGameTitle(project.titol);

    // Reset UIs
    document.querySelectorAll('.game-module').forEach(el => el.classList.add('hidden'));
    const simulationResult = document.getElementById('simulation-result');
    if (simulationResult) simulationResult.textContent = '';

    // Carregar joc especfic segons ID del projecte
    if (project.id === 'p1_rates') {
        const gameDiv = await ensureProjectFragment(
            'game-container-p1_rates',
            'fragments/projects/rates/projecte-rates.html'
        );
        if (gameDiv) {
            gameDiv.classList.remove('hidden');
            showRatesMenu();
        }
    } else if (project.id === 'p1_mediterrani') {
        const hubDiv = await ensureProjectFragment(
            'project-hub-mediterrani',
            'fragments/projects/mediterrani/index.html'
        );
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof renderMediterraniActivities === 'function') {
                renderMediterraniActivities();
            }
            if (typeof showMediterraniMenu === 'function') {
                showMediterraniMenu();
            }
        }
    } else if (project.id === 'p2_paralimpics') {
        const hubDiv = await ensureProjectFragment(
            'project-hub-paralimpics',
            'fragments/projects/paralimpics/index.html'
        );
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof showParalimpicsMenu === 'function') {
                showParalimpicsMenu();
            }
        }
    } else if (project.id === 'p3_solidart') {
        const hubDiv = await ensureProjectFragment(
            'project-hub-solidart',
            'fragments/projects/solidart/index.html'
        );
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            showSolidartMenu();
        }
    } else if (project.id === 'batx1_tr') {
        const hubDiv = await ensureProjectFragment(
            'project-hub-tr',
            'fragments/projects/treball-recerca/index.html'
        );
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof renderTrActivities === 'function') {
                renderTrActivities();
            }
            if (typeof showTrMenu === 'function') {
                showTrMenu();
            }
        }
    } else if (project.id === 'p1_natura' || project.id === 'p4_natura') {
        const hubDiv = await ensureProjectFragment(
            'project-hub-natura',
            'fragments/projects/entorns/index.html'
        );
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof renderEntornsActivities === 'function') {
                renderEntornsActivities();
            }
            if (typeof showNaturaMenu === 'function') {
                showNaturaMenu();
            }
        }
    } else if (project.id === 'p4_digitalitzacio') {
        const hubDiv = await ensureProjectFragment(
            'project-hub-digitalitzacio',
            'fragments/projects/digitalitzacio/index.html'
        );
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof showDigitalitzacioMenu === 'function') {
                showDigitalitzacioMenu();
            }
        }
    } else if (isFisicaQuimicaProject(project.id)) {
        const hubDiv = await ensureProjectFragment(
            'project-hub-fisica-quimica',
            'fragments/projects/fisica-quimica/index.html'
        );
        if (hubDiv) hubDiv.classList.remove('hidden');
    } else if (isBiologiaProject(project.id)) {
        const hubDiv = await ensureProjectFragment(
            'project-hub-biologia',
            'fragments/projects/biologia/index.html'
        );
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof showBioMenu === 'function') {
                showBioMenu();
            }
        }
    } else if (project.id === 'p1_radio' || project.id === 'p2_radio') {
        const hubDiv = await ensureProjectFragment(
            'project-hub-radio',
            'fragments/projects/radio/index.html'
        );
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof showRadioMenu === 'function') {
                showRadioMenu();
            }
        }
    } else {
        // Fallback genric
        document.getElementById('game-container-generic').classList.remove('hidden');
    }

    applyAvailabilityToCurrentProject();
}

;

function translateUI() {
    if (typeof i18n === 'undefined') return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = i18n.t(key);
    });

    if (state.user) {
        const welcomeMsg = document.getElementById('welcome-msg');

        if (welcomeMsg) {
            welcomeMsg.textContent = `${i18n.t('hi')}, ${state.user.nom}!`;
        }
    }

    if (state.currentProject) {
        setGameTitle(state.currentGameTitle || state.currentProject.titol);

        if (
            state.currentProject.id === 'p1_mediterrani'
            && document.getElementById('project-hub-mediterrani')
            && typeof updateMediterraniLanguage === 'function'
        ) {
            updateMediterraniLanguage();
        } else if (
            state.currentProject.id === 'p2_paralimpics'
            && document.getElementById('project-hub-paralimpics')
            && typeof updateParalimpicsLanguage === 'function'
        ) {
            updateParalimpicsLanguage();
        } else if (
            (state.currentProject.id === 'p1_natura' || state.currentProject.id === 'p4_natura')
            && document.getElementById('project-hub-natura')
            && typeof updateNaturaLanguage === 'function'
        ) {
            updateNaturaLanguage();
            if (typeof updateRolsLanguage === 'function') updateRolsLanguage();
        }
    }
}

async function simulateGameSave() {
    if (!state.user || !state.currentProject) return;

    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject.titol,
        app: 'Simulador',
        nivell: 'Fcil',
        puntuacio: Math.floor(Math.random() * 101),
        temps_segons: 120,
        feedback_pos: 'Has estat rpid',
        feedback_neg: 'Cal millorar la precisi'
    };

    const statusP = document.getElementById('simulation-result');
    statusP.textContent = 'Guardant...';

    const response = await callApi('saveResult', result);

    if (response && response.status === 'success') {
        statusP.textContent = 'Resultat guardat correctament!';
        setElementStateColor(statusP, 'success');
    } else {
        statusP.textContent = 'Error al guardar.';
        setElementStateColor(statusP, 'error');
    }
}

// --- MEDITERRANI NAVIGATION ---
function showMediterraniMenu() {
    const hub = document.getElementById('project-hub-mediterrani');
    if (hub) {
        document.getElementById('med-activities-menu').classList.remove('hidden');
        hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    }
}

function openMediterraniActivity(actId) {
    if (!blockUnavailableActivity(actId)) return;
    const hub = document.getElementById('project-hub-mediterrani');
    const menu = document.getElementById('med-activities-menu');
    const activity = document.getElementById(`med-activity-${actId}`);

    if (menu) menu.classList.add('hidden');
    if (hub) hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    if (activity) activity.classList.remove('hidden');

    if (actId === 'biodiversitat' && typeof initMediterraniBiodiversitatQuiz === 'function') {
        initMediterraniBiodiversitatQuiz();
    }
}

// --- TREBALL DE RECERCA NAVIGATION ---
function showTrMenu() {
    const hub = document.getElementById('project-hub-tr');
    if (hub) {
        document.getElementById('tr-activities-menu').classList.remove('hidden');
        hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    }
}

function openTrActivity(actId) {
    if (!blockUnavailableActivity(actId)) return;
    document.getElementById('tr-activities-menu').classList.add('hidden');
    document.getElementById(`tr-activity-${actId}`).classList.remove('hidden');

    if (actId === 'preguntes' && typeof loadTrCategories === 'function') {
        loadTrCategories();
    } else if (actId === 'temes' && typeof loadTrTemesCategories === 'function') {
        loadTrTemesCategories();
    } else if (actId === 'biblio' && typeof initTrBiblioGame === 'function') {
        initTrBiblioGame();
    } else if (actId === 'diagnostic' && typeof initTrDiagnostic === 'function') {
        initTrDiagnostic();
    }
}

// --- PARALIMPICS NAVIGATION ---
function showParalimpicsMenu() {
    const hub = document.getElementById('project-hub-paralimpics');
    if (hub) {
        document.getElementById('par-activities-menu').classList.remove('hidden');
        hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    }
}

function openParalimpicsActivity(actId) {
    if (!blockUnavailableActivity(actId)) return;
    document.getElementById('par-activities-menu').classList.add('hidden');
    document.getElementById(`paralimpics-activity-${actId}`).classList.remove('hidden');
}

// --- DIGITALITZACI NAVIGATION ---
function showDigitalitzacioMenu() {
    const hub = document.getElementById('project-hub-digitalitzacio');
    if (hub) {
        document.getElementById('digi-activities-menu').classList.remove('hidden');
        hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    }
}

function openDigitalitzacioActivity(actId) {
    if (!blockUnavailableActivity(actId)) return;
    document.getElementById('digi-activities-menu').classList.add('hidden');
    document.getElementById(`digi-activity-${actId}`).classList.remove('hidden');

    if (actId === 'audio' && typeof initSonarGame === 'function') {
        initSonarGame();
    }
}

// --- SOLIDART NAVIGATION ---
function showSolidartMenu() {
    if (typeof clearSolidartQuadresAutoAdvance === 'function') clearSolidartQuadresAutoAdvance();
    if (typeof clearSolidartQuadres2AutoAdvance === 'function') clearSolidartQuadres2AutoAdvance();

    const hub = document.getElementById('project-hub-solidart');
    if (hub) {
        document.getElementById('solidart-activities-menu').classList.remove('hidden');
        hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    }
}

function openSolidartActivity(actId) {
    if (!blockUnavailableActivity(actId)) return;
    if (typeof clearSolidartQuadresAutoAdvance === 'function') clearSolidartQuadresAutoAdvance();
    if (typeof clearSolidartQuadres2AutoAdvance === 'function') clearSolidartQuadres2AutoAdvance();

    const hub = document.getElementById('project-hub-solidart');
    document.getElementById('solidart-activities-menu').classList.add('hidden');
    if (hub) hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    document.getElementById(`solidart-activity-${actId}`).classList.remove('hidden');

    if (actId === 'quadres') {
        // Reset sub-activity state
        const setupDiv = document.getElementById('solidart-quadres-setup');
        setupDiv.classList.remove('hidden');
        document.getElementById('solidart-quadres-quiz-container').classList.add('hidden');
        document.getElementById('solidart-quadres-results').classList.add('hidden');

        // Role-based visibility for feedback config
        const configDiv = document.getElementById('solidart-feedback-config');
        if (state.user && state.user.rol === 'prof') {
            configDiv.classList.remove('hidden');
        } else {
            configDiv.classList.add('hidden');
            // Reset to default for students if needed, or keep last selected by prof
            const selector = document.getElementById('solidart-feedback-level');
            if (selector) selector.value = 'simple';
        }
    } else if (actId === 'quadres2') {
        const setupDiv = document.getElementById('solidart-quadres2-setup');
        setupDiv.classList.remove('hidden');
        document.getElementById('solidart-quadres2-quiz-container').classList.add('hidden');
        document.getElementById('solidart-quadres2-results').classList.add('hidden');

        const configDiv = document.getElementById('solidart-feedback-config2');
        if (state.user && state.user.rol === 'prof') {
            configDiv.classList.remove('hidden');
        } else {
            configDiv.classList.add('hidden');
            const selector = document.getElementById('solidart-feedback-level2');
            if (selector) selector.value = 'simple';
        }
    }
}

// --- NATURA NAVIGATION ---
function showNaturaMenu() {
    const hub = document.getElementById('project-hub-natura');
    if (hub) {
        document.getElementById('natura-activities-menu').classList.remove('hidden');
        hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
        applyAvailabilityToCurrentProject();
    }
}

function openNaturaProject(projectId) {
    if (!blockUnavailableActivity(projectId)) return;
    const hub = document.getElementById('project-hub-natura');
    const menu = document.getElementById('natura-activities-menu');
    const projectMenu = document.getElementById(`natura-project-${projectId}`);

    if (menu) menu.classList.add('hidden');
    if (hub) hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    if (projectMenu) projectMenu.classList.remove('hidden');
    applyAvailabilityToCurrentProject();
}

// **********************************************************
// RATES A LA CARRERA (HUB)
// **********************************************************
function showRatesMenu() {
    document.getElementById('rates-activities-menu').classList.remove('hidden');
    document.querySelectorAll('#game-container-p1_rates .sub-activity').forEach(el => el.classList.add('hidden'));
}

function openRatesActivity(activityId) {
    if (!blockUnavailableActivity(activityId)) return;
    // Amagar men
    document.getElementById('rates-activities-menu').classList.add('hidden');

    // Amagar totes les sub-activitats
    document.querySelectorAll('#game-container-p1_rates .sub-activity').forEach(el => el.classList.add('hidden'));

    // Mostrar la seleccionada
    const subAct = document.getElementById(`rates-activity-${activityId}`);
    if (subAct) {
        subAct.classList.remove('hidden');
        if (activityId === 'preguntes') {
            loadRatesCategories();
        }
    }
}

function openNaturaActivity(actId) {
    const parent = document.querySelector('.sub-activity:not(.hidden)[id^="natura-project-"]');
    const projectName = parent ? parent.id.replace('natura-project-', '') : '';
    const availabilityIds = projectName ? [`${projectName}/${actId}`, actId] : [actId];
    if (!blockUnavailableActivity(availabilityIds)) return;
    document.getElementById('natura-activities-menu')?.classList.add('hidden');
    document.querySelectorAll('#project-hub-natura .sub-activity').forEach(el => el.classList.add('hidden'));

    if (actId === 'xarxes') {
        document.getElementById('natura-activity-xarxes').classList.remove('hidden');
        if (typeof initXarxesGame === 'function') initXarxesGame();
    } else if (actId === 'impacte') {
        document.getElementById('natura-activity-impacte').classList.remove('hidden');
        if (typeof initImpacteGame === 'function') initImpacteGame();
    } else if (actId === 'rols') {
        document.getElementById('natura-activity-rols').classList.remove('hidden');
        if (typeof initRolsGame === 'function') initRolsGame();
    } else if (actId === 'biblio') {
        document.getElementById('natura-activity-biblio').classList.remove('hidden');
        if (typeof initBiblioGame === 'function') initBiblioGame();
    } else if (actId === 'preguntes') {
        document.getElementById('natura-activity-preguntes').classList.remove('hidden');
        if (typeof loadNaturaCategories === 'function') {
            document.getElementById('natura-preguntes-setup').classList.remove('hidden');
            document.getElementById('natura-preguntes-quiz-container').classList.add('hidden');
            document.getElementById('natura-preguntes-results').classList.add('hidden');
            loadNaturaCategories();
        }
    } else if (actId === 'temes') {
        document.getElementById('natura-activity-temes').classList.remove('hidden');
        if (typeof loadNaturaTemesCategories === 'function') {
            document.getElementById('natura-temes-setup').classList.remove('hidden');
            document.getElementById('natura-temes-quiz-container').classList.add('hidden');
            document.getElementById('natura-temes-results').classList.add('hidden');
            loadNaturaTemesCategories();
        }
    } else if (actId === 'orenetes') {
        document.getElementById('natura-activity-orenetes').classList.remove('hidden');
        if (typeof initOrenetesGame === 'function') initOrenetesGame();
    } else if (actId === 'orenetes-preguntes') {
        document.getElementById('natura-activity-orenetes-preguntes').classList.remove('hidden');
        if (typeof initOrenetesPreguntesQuiz === 'function') initOrenetesPreguntesQuiz();
    } else if (actId === 'betid-3d') {
        document.getElementById('natura-activity-betid-3d').classList.remove('hidden');
        if (typeof initBetid3DGame === 'function') initBetid3DGame();
    } else if (actId === 'clau-macroinvertebrats') {
        document.getElementById('natura-activity-clau-macroinvertebrats').classList.remove('hidden');
        if (typeof initMacroKeyActivity === 'function') initMacroKeyActivity();
    } else if (actId === 'bioindicadors') {
        document.getElementById('natura-activity-bioindicadors').classList.remove('hidden');
        if (typeof initRiverBioActivity === 'function') initRiverBioActivity();
    } else if (actId === 'hipotesis') {
        document.getElementById('natura-activity-hipotesis').classList.remove('hidden');
        if (typeof initRiverHypothesisGame === 'function') initRiverHypothesisGame();
    } else if (actId === 'familia-color') {
        document.getElementById('natura-activity-familia-color').classList.remove('hidden');
        if (typeof initFamiliaColorGame === 'function') initFamiliaColorGame();
    }
}

// --- BIOLOGIA NAVIGATION ---
const BIO_SYSTEM_TITLES = {
    circulatori: 'Circulatori',
    excretor: 'Excretor',
    endocri: 'Endocr',
    locomotor: 'Locomotor',
    immunitari: 'Immunitari',
    reproductor: 'Reproductor',
    laboratori: 'Laboratori',
    conceptes: 'Conceptes de Biologia',
    formats: 'Formats per cèl·lules',
    genetica: 'Gentica'
};

const BIO_ACTIVITY_TITLES = {
    cor: 'Cor',
    'circulatori-quiz': 'Reps del Circulatori',
    cells: 'Cllules de la Sang',
    'excretor-game': 'Excretor',
    'endocri-quiz': 'Reps de l\'Endocr',
    'endocri-glands': 'Glndules endocrines',
    'locomotor-quiz': 'Reps del Locomotor',
    'immunitari-quiz': 'Reps de l\'Immunitari',
    'reproductor-quiz': 'Reps del Reproductor',
    'lab-tools': 'Laboratori',
    'microscopi-optic-3d': 'Parts del microscopi òptic',
    'concept-drag': 'Arrossega conceptes',
    'cellula-eucariota': 'La cèl·lula eucariota',
    'genetica-sim': 'Genètica',
    'genetica-pedigrees': 'Pedigrees i genotips',
    'vista-parts': 'Vista',
    'vista-quiz': 'Reps: Vista',
    'oida-parts': 'Oda',
    'oida-quiz': 'Reps: Oda',
    'olfacte-parts': 'Olfacte',
    'olfacte-quiz': 'Reps: Olfacte',
    'gust-parts': 'Gust',
    'gust-quiz': 'Reps: Gust',
    'tacte-parts': 'Tacte',
    'tacte-quiz': 'Reps: Tacte'
};

const BIO_SENSE_TITLES = {
    vista: 'Vista',
    oida: 'Oda',
    olfacte: 'Olfacte',
    gust: 'Gust',
    tacte: 'Tacte'
};

const BIO_PROJECT_SCOPES = {
    p1_biologia: ['conceptes', 'laboratori', 'formats'],
    p4_biologia: ['genetica']
};

function getCurrentBioProjectScope() {
    const projectId = state.currentProject ? state.currentProject.id : '';
    return BIO_PROJECT_SCOPES[projectId] || null;
}

function isBioSystemAllowed(systemId) {
    const scope = getCurrentBioProjectScope();
    return !scope || scope.includes(systemId);
}

function applyBioProjectScope() {
    const scope = getCurrentBioProjectScope();

    document.querySelectorAll('#bio-systems-menu [data-bio-system]').forEach(card => {
        const systemId = card.getAttribute('data-bio-system');
        const isVisible = !scope || scope.includes(systemId);
        card.classList.toggle('hidden', !isVisible);
    });
}

function showBioMenu() {
    setGameTitle(state.currentProject ? state.currentProject.titol : 'Biologia');

    if (typeof resetBioLabToolsGame === 'function') {
        resetBioLabToolsGame();
    }

    const hub = document.getElementById('project-hub-biologia');
    if (hub) {
        document.getElementById('bio-systems-menu').classList.remove('hidden');
        applyBioProjectScope();
        updateBioCourseVisibility();
        // Hide all sub-activity lists and individual activities
        document.querySelectorAll('#project-hub-biologia .activities-grid:not(#bio-systems-menu)').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('#project-hub-biologia .sub-activity').forEach(el => el.classList.add('hidden'));
    }
}

function updateBioCourseVisibility() {
    const currentCourse = getCurrentBioCourseNumber();
    const scope = getCurrentBioProjectScope();
    document.querySelectorAll('#bio-systems-menu [data-bio-courses]').forEach(card => {
        const allowedCourses = String(card.dataset.bioCourses || '').split(/\s+/);
        const systemId = card.getAttribute('data-bio-system');
        const isAllowedByScope = !scope || !systemId || scope.includes(systemId);
        const isVisible = allowedCourses.includes(currentCourse) && isAllowedByScope;
        card.classList.toggle('hidden', !isVisible);
    });
}

function getCurrentBioCourseNumber() {
    const id = state.currentProject ? String(state.currentProject.id || '') : '';
    if (id === 'p1_biologia') return '1';
    if (id === 'p4_biologia') return '4';
    return '2';
}

function openBioSystem(systemId) {
    if (!blockUnavailableActivity([systemId, `biologia/${systemId}`])) {
        showBioMenu();
        return;
    }
    if (!isBioSystemAllowed(systemId)) {
        showBioMenu();
        return;
    }

    setGameTitle(BIO_SYSTEM_TITLES[systemId] || 'Biologia');

    if (typeof resetBioLabToolsGame === 'function') {
        resetBioLabToolsGame();
    }

    // Amagar el men principal de sistemes i totes les activitats individuals
    document.getElementById('bio-systems-menu')?.classList.add('hidden');
    document.querySelectorAll('#project-hub-biologia .sub-activity').forEach(el => el.classList.add('hidden'));

    // Mostrar el menú d'activitats del sistema seleccionat
    const systemDiv = document.getElementById(`bio-${systemId}-activities`);
    if (systemDiv) {
        systemDiv.classList.remove('hidden');
        updateBioActivityCourseVisibility(systemDiv);
    }
}

function updateBioActivityCourseVisibility(container) {
    if (!container) return;

    const currentCourse = getCurrentBioCourseNumber();
    container.querySelectorAll('[data-bio-courses]').forEach(card => {
        const allowedCourses = String(card.dataset.bioCourses || '').split(/\s+/);
        card.classList.toggle('hidden', !allowedCourses.includes(currentCourse));
    });
}



function openBioActivity(actId, options = {}) {
    if (!blockUnavailableActivity([actId, `biologia/${actId}`])) return;
    setGameTitle(BIO_ACTIVITY_TITLES[actId] || 'Biologia');

    if (actId !== 'lab-tools' && typeof resetBioLabToolsGame === 'function') {
        resetBioLabToolsGame();
    }

    // Hide all activity menus
    document.querySelectorAll('#project-hub-biologia .activities-grid:not(#bio-systems-menu)').forEach(el => el.classList.add('hidden'));
    // Hide all individual activity containers
    document.querySelectorAll('#project-hub-biologia .sub-activity').forEach(el => el.classList.add('hidden'));


    if (actId === 'cor') {
        document.getElementById('bio-activity-cor').classList.remove('hidden');
        if (typeof initBioHeartGame === 'function') {
            initBioHeartGame();
        }
    } else if (actId === 'immunitari-quiz') {
        document.getElementById('bio-activity-immunitari-quiz').classList.remove('hidden');
        if (typeof initImmunitariQuiz === 'function') {
            initImmunitariQuiz();
        }
    } else if (actId === 'reproductor-quiz') {
        document.getElementById('bio-activity-reproductor-quiz').classList.remove('hidden');
        if (typeof initReproductorQuiz === 'function') {
            initReproductorQuiz();
        }
    } else if (actId === 'circulatori-quiz') {
        document.getElementById('bio-activity-circulatori-quiz').classList.remove('hidden');
        if (typeof initCircQuiz === 'function') {
            initCircQuiz();
        }
    } else if (actId === 'cells') {
        document.getElementById('bio-activity-cells').classList.remove('hidden');
        if (typeof initCellsGame === 'function') {
            initCellsGame();
        }
    } else if (actId === 'excretor-game') {
        document.getElementById('bio-activity-excretor-game').classList.remove('hidden');
        if (typeof initBioExcretorGame === 'function') {
            initBioExcretorGame();
        }
    } else if (actId === 'endocri-quiz') {
        document.getElementById('bio-activity-endocri-quiz').classList.remove('hidden');
        if (typeof initEndocriQuiz === 'function') {
            initEndocriQuiz();
        }
    } else if (actId === 'endocri-glands') {
        document.getElementById('bio-activity-endocri-glands').classList.remove('hidden');
        if (typeof initBioEndocriGlandsGame === 'function') {
            initBioEndocriGlandsGame();
        }
    } else if (actId === 'locomotor-quiz') {
        document.getElementById('bio-activity-locomotor-quiz').classList.remove('hidden');
        if (typeof initLocomotorQuiz === 'function') {
            initLocomotorQuiz();
        }
    } else if (actId === 'lab-tools' || actId === 'lab-tools-3d') {
        document.getElementById('bio-activity-lab-tools-3d').classList.remove('hidden');
        if (typeof initBioLabTools3DGame === 'function') {
            initBioLabTools3DGame();
        }
    } else if (actId === 'microscopi-optic-3d') {
        if (typeof resetBioMicroscopiOptic3DGame === 'function') {
            resetBioMicroscopiOptic3DGame();
        }
        document.getElementById('bio-activity-microscopi-optic-3d')?.classList.remove('hidden');
    } else if (actId === 'concept-drag') {
        document.getElementById('bio-activity-concept-drag').classList.remove('hidden');
        if (typeof initBioConceptDragGame === 'function') {
            initBioConceptDragGame();
        }
    } else if (actId === 'cellula-eucariota') {
        document.getElementById('bio-activity-cellula-eucariota').classList.remove('hidden');
        if (typeof initBioCellulaEucariotaQuiz === 'function') {
            initBioCellulaEucariotaQuiz();
        }
    } else if (actId === 'genetica-sim') {
        document.getElementById('bio-activity-genetica-sim').classList.remove('hidden');
        if (typeof initBioGeneticsSimGame === 'function') {
            initBioGeneticsSimGame(options);
        }
    } else if (actId === 'genetica-pedigrees') {
        document.getElementById('bio-activity-genetica-pedigrees').classList.remove('hidden');
        if (typeof initBioPedigreeGame === 'function') {
            initBioPedigreeGame();
        }
    } else if (actId.endsWith('-quiz')) {
        const sense = actId.split('-')[0];
        document.getElementById('bio-activity-' + actId).classList.remove('hidden');
        const initFnName = 'init' + sense.charAt(0).toUpperCase() + sense.slice(1) + 'Quiz';
        if (typeof window[initFnName] === 'function') {
            window[initFnName]();
        }
    } else if (actId.endsWith('-parts')) {
        const sense = actId.split('-')[0];
        document.getElementById('bio-activity-' + actId).classList.remove('hidden');
        const initFnName = 'initBio' + sense.charAt(0).toUpperCase() + sense.slice(1) + 'PartsGame';
        if (typeof window[initFnName] === 'function') {
            window[initFnName]();
        }
    }
}

function openSenseMenu() {
    setGameTitle('Sentits');

    document.getElementById('bio-systems-menu').classList.add('hidden');
    // Amagar totes les llistes d'activitats de sistemes
    document.querySelectorAll('#project-hub-biologia .activities-grid:not(#bio-systems-menu)').forEach(el => el.classList.add('hidden'));
    // Amagar totes les sub-activitats (jocs)
    document.querySelectorAll('#project-hub-biologia .sub-activity').forEach(el => el.classList.add('hidden'));

    // Mostrar el men principal dels sentits
    document.getElementById('bio-senses-activities').classList.remove('hidden');
}

function openSenseSubActivity(senseId) {
    if (!blockUnavailableActivity([senseId, `biologia/${senseId}`])) return;
    setGameTitle(BIO_SENSE_TITLES[senseId] || 'Sentits');

    // Amagar el men principal dels sentits i totes les llistes d'activitats
    document.getElementById('bio-senses-activities').classList.add('hidden');
    document.querySelectorAll('#project-hub-biologia .activities-grid:not(#bio-systems-menu)').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('#project-hub-biologia .sub-activity').forEach(el => el.classList.add('hidden'));

    // Mostrar el sub-men del sentit seleccionat (ex: sense-vista-menu)
    const menuId = 'sense-' + senseId + '-menu';
    const menu = document.getElementById(menuId);
    if (menu) menu.classList.remove('hidden');
}



// --- RADIO NAVIGATION ---
function showRadioMenu() {
    const hub = document.getElementById('project-hub-radio');
    if (hub) {
        document.getElementById('radio-activities-menu').classList.remove('hidden');
        const taulaCard = document.getElementById('radio-activity-taula-card');
        if (taulaCard) {
            taulaCard.classList.toggle('hidden', state.currentProject?.id === 'p1_radio');
        }
        hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    }
}

function openRadioActivity(actId) {
    if (!blockUnavailableActivity(actId)) return;
    if (actId === 'taula' && state.currentProject?.id === 'p1_radio') {
        showRadioMenu();
        return;
    }
    document.getElementById('radio-activities-menu').classList.add('hidden');
    document.querySelectorAll('#project-hub-radio .sub-activity').forEach(el => el.classList.add('hidden'));

    if (actId === 'taula') {
        document.getElementById('radio-activity-taula').classList.remove('hidden');
        if (typeof initRadioBoardGame === 'function') {
            initRadioBoardGame();
        }
    } else if (actId === 'conexions') {
        document.getElementById('radio-activity-conexions').classList.remove('hidden');
        if (typeof initConnectionsQuiz === 'function') {
            initConnectionsQuiz();
        }
    }
}


/**
 * CLIENT-SIDE LOGIC
 * Connecta amb Google Apps Script API
 */

// **********************************************************
// CONFIGURACIÓ
// **********************************************************
// Substitueix aquesta URL per la que t'ha donat el Google Apps Script al fer "Deploy"
// Exemple: 'https://script.google.com/macros/s/AKfycbx.../exec'
const API_URL = 'https://script.google.com/macros/s/AKfycbwY3h5mvbmO64iWskhqoXb4xKbyMs-W5SwWLabV50QbmEINsjFMYvMcsSPIaqFM9bmu9w/exec';

// **********************************************************
// ESTAT DE L'APLICACIÓ
// **********************************************************
const state = {
    user: null,
    currentProject: null
};

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

    return container;
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
    element.classList.remove('state-success', 'state-error', 'state-warning', 'state-muted');

    if (stateName) {
        element.classList.add(`state-${stateName}`);
    }
}


// **********************************************************
// INICIALITZACIÓ
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
// FUNCIONS DE NAVEGACIÓ
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
    // Per simplicitat, farem servir GET per defecte o POST amb no-cors si calia, però el redirect de GAS via GET sol anar bé.
    // Tanmateix, per enviar dades (POST) a vegades és millor user `navigator.sendBeacon` o `fetch` amb `no-cors` (però no reps resposta).
    // Anem a intentar GET per tot ja que JSONP està deprecated i CORS és complex a GAS.
    // L'estratègia: enviar tot per query params si és curt, o POST text/plain (que no dispara preflight).

    // Mètode: Utilitzarem 'no-cors' per enviar dades sense esperar resposta JSON precisa si falla CORS,
    // o bé, assumim que el redireccionament funciona (normalment sí).

    // Solució Robusta: Enviar com POST text/plain. Google Apps Script ho llegeix a e.postData.contents.
    // Això evita el Preflight OPTIONS.

    // Modifiquem la URL existent (declarada a la línia 98) per afegir l'acció
    // Això assegura que el backend rebi e.parameter.action fins i tot en POST
    url.searchParams.set('action', action);

    // Opcions per a POST (per defecte)
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ ...params, action: action })
    };

    try {
        const response = await fetch(API_URL, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { status: 'error', message: 'Error de connexió' };
    }
}

// **********************************************************
// LÒGICA DE NEGOCI
// **********************************************************

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

async function loadDashboard() {
    await showDashboardFragment();

    showScreen('dashboard');

    

    // Update User Info
    document.getElementById('user-name').textContent = `${state.user.nom} ${state.user.cognoms}`;
    document.getElementById('user-course').textContent = state.user.curs;
    document.getElementById('welcome-msg').textContent = `Hola, ${state.user.nom}!`;

    // Load Projects
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '<div class="loader">Carregant projectes...</div>';

    // Suport per a múltiples cursos (ex: "1ESO, 2ESO")
    const courses = state.user.curs.split(',').map(c => c.trim()).filter(c => c !== "");

    let allProjects = [];
    let seenIds = new Set();

    try {
        // Fem les crides en paral·lel per a tots els cursos
        const fetchPromises = courses.map(curs => callApi('getProjects', { curs }));
        const responses = await Promise.all(fetchPromises);

        responses.forEach(response => {
            if (response && response.status === 'success' && response.projectes) {
                response.projectes.forEach(proj => {
                    if (!seenIds.has(proj.id)) {
                        seenIds.add(proj.id);
                        allProjects.push(proj);
                    }
                });
            }
        });
    } catch (e) {
        console.error("Error carregant projectes:", e);
    }

    grid.innerHTML = ''; // Netejar

    // Configuració visual dels projectes
    const projectVisuals = {
        'p1_rates': { icon: '<img src="assets/images/activities/rates/cards/targeta_rates-a-la-carrera.png" alt="Rates" class="project-card__image">', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        'p1_mediterrani': { icon: '<img src="assets/images/activities/mediterrani/cards/targeta_mediterrani.png" alt="Mediterrani" class="project-card__image">', gradient: 'linear-gradient(135deg, #0ea5e9, #2563eb)' },
        'p1_natura': { icon: '<img src="assets/images/targeta_biologia.png" alt="Biologia" class="project-card__image">', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
        'p3_solidart': { icon: '<img src="assets/images/activities/solidart/cards/targeta_solidart.png" alt="SolidArt" class="project-card__image">', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
        'p4_natura': { icon: '<img src="assets/images/activities/entorns/cards/targeta_entorns.png" alt="Entorns de Natura" class="project-card__image">', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
        'p2_paralimpics': { icon: '<img src="assets/images/activities/paralimpics/cards/targeta-paralimpics.png" alt="Paralímpics" class="project-card__image">', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
        'p4_digitalitzacio': { icon: '<img src="assets/images/activities/digitalitzacio/cards/targeta-digitalitzacio.png" alt="Digitalització" class="project-card__image">', gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
        'p2_biologia': { icon: '<img src="assets/images/activities/biologia/cards/biologia_humana.png" alt="Biologia Humana" class="project-card__image">', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
        'p2_radio': { icon: '<img src="assets/images/activities/radio/targeta-radio.png" alt="Ràdio" class="project-card__image">', gradient: 'linear-gradient(135deg, #facc15, #ca8a04)' },
        'batx1_tr': { icon: '<img src="assets/images/activities/treball-recerca/cards/targeta-tr.png" alt="Treball de recerca" class="project-card__image">', gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)' }
    };

    if (allProjects.length > 0) {
        allProjects.forEach(proj => {
            const visual = projectVisuals[proj.id] || { icon: '📁', gradient: 'linear-gradient(135deg, #94a3b8, #64748b)' };

            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-card__media" style="${!proj.imatge ? `background: ${visual.gradient}` : ''}">
                    ${proj.imatge
                    ? `<img src="${proj.imatge}" alt="${proj.titol}" class="project-card__image">`
                    : visual.icon}
                </div>
                <div class="project-card__content">
                    <div class="project-card__title">${proj.titol}</div>
                    <div class="project-card__description">${proj.descripcio}</div>
                </div>
            `;
            card.addEventListener('click', () => openProject(proj));
            grid.appendChild(card);
        });
    } else {
        grid.innerHTML = `<p>${i18n.t('no_projects') || 'No tens projectes assignats o no s\'han pogut carregar.'}</p>`;
    }
}

function openProject(project) {
    state.currentProject = project;
    showScreen('game');
    document.getElementById('game-title').textContent = project.titol;

    // Reset UIs
    document.querySelectorAll('.game-module').forEach(el => el.classList.add('hidden'));
    document.getElementById('simulation-result').textContent = '';

    // Carregar joc específic segons ID del projecte
    if (project.id === 'p1_rates') {
        const gameDiv = document.getElementById('game-container-p1_rates');
        if (gameDiv) {
            gameDiv.classList.remove('hidden');
            showRatesMenu();
        }
    } else if (project.id === 'p1_mediterrani') {
        const hubDiv = document.getElementById('project-hub-mediterrani');
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof showMediterraniMenu === 'function') {
                showMediterraniMenu();
            }
        }
    } else if (project.id === 'p2_paralimpics') {
        const hubDiv = document.getElementById('project-hub-paralimpics');
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof showParalimpicsMenu === 'function') {
                showParalimpicsMenu();
            }
        }
    } else if (project.id === 'p3_solidart') {
        const hubDiv = document.getElementById('project-hub-solidart');
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            showSolidartMenu();
        }
    } else if (project.id === 'batx1_tr') {
        const hubDiv = document.getElementById('project-hub-tr');
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof showTrMenu === 'function') {
                showTrMenu();
            }
        }
    } else if (project.id === 'p1_natura' || project.id === 'p4_natura') {
        const hubDiv = document.getElementById('project-hub-natura');
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof showNaturaMenu === 'function') {
                showNaturaMenu();
            }
        }
    } else if (project.id === 'p4_digitalitzacio') {
        const hubDiv = document.getElementById('project-hub-digitalitzacio');
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof showDigitalitzacioMenu === 'function') {
                showDigitalitzacioMenu();
            }
        }
    } else if (project.id === 'p2_biologia') {
        const hubDiv = document.getElementById('project-hub-biologia');
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof showBioMenu === 'function') {
                showBioMenu();
            }
        }
    } else if (project.id === 'p2_radio') {
        const hubDiv = document.getElementById('project-hub-radio');
        if (hubDiv) {
            hubDiv.classList.remove('hidden');
            if (typeof showRadioMenu === 'function') {
                showRadioMenu();
            }
        }
    } else {
        // Fallback genèric
        document.getElementById('game-container-generic').classList.remove('hidden');
    }
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
        if (state.currentProject.id === 'p1_mediterrani' && typeof updateMediterraniLanguage === 'function') {
            updateMediterraniLanguage();
        } else if (state.currentProject.id === 'p2_paralimpics' && typeof updateParalimpicsLanguage === 'function') {
            updateParalimpicsLanguage();
        } else if ((state.currentProject.id === 'p1_natura' || state.currentProject.id === 'p4_natura') && typeof updateNaturaLanguage === 'function') {
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
        nivell: 'Fàcil',
        puntuacio: Math.floor(Math.random() * 101),
        temps_segons: 120,
        feedback_pos: 'Has estat ràpid',
        feedback_neg: 'Cal millorar la precisió'
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
    document.getElementById('par-activities-menu').classList.add('hidden');
    document.getElementById(`paralimpics-activity-${actId}`).classList.remove('hidden');
}

// --- DIGITALITZACIÓ NAVIGATION ---
function showDigitalitzacioMenu() {
    const hub = document.getElementById('project-hub-digitalitzacio');
    if (hub) {
        document.getElementById('digi-activities-menu').classList.remove('hidden');
        hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    }
}

function openDigitalitzacioActivity(actId) {
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
    }
}

function openNaturaProject(projectId) {
    const hub = document.getElementById('project-hub-natura');
    const menu = document.getElementById('natura-activities-menu');
    const projectMenu = document.getElementById(`natura-project-${projectId}`);

    if (menu) menu.classList.add('hidden');
    if (hub) hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    if (projectMenu) projectMenu.classList.remove('hidden');
}

// **********************************************************
// RATES A LA CARRERA (HUB)
// **********************************************************
function showRatesMenu() {
    document.getElementById('rates-activities-menu').classList.remove('hidden');
    document.querySelectorAll('#game-container-p1_rates .sub-activity').forEach(el => el.classList.add('hidden'));
}

function openRatesActivity(activityId) {
    // Amagar menú
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
    }
}

// --- BIOLOGIA NAVIGATION ---
function showBioMenu() {
    const hub = document.getElementById('project-hub-biologia');
    if (hub) {
        document.getElementById('bio-systems-menu').classList.remove('hidden');
        // Hide all sub-activity lists and individual activities
        document.querySelectorAll('#project-hub-biologia .activities-grid:not(#bio-systems-menu)').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('#project-hub-biologia .sub-activity').forEach(el => el.classList.add('hidden'));
    }
}

function openBioSystem(systemId) {
    // Amagar el menú principal de sistemes i totes les activitats individuals
    document.getElementById('bio-systems-menu')?.classList.add('hidden');
    document.querySelectorAll('#project-hub-biologia .sub-activity').forEach(el => el.classList.add('hidden'));

    // Mostrar el menú d'activitats del sistema seleccionat
    const systemDiv = document.getElementById(`bio-${systemId}-activities`);
    if (systemDiv) {
        systemDiv.classList.remove('hidden');
    }
}



function openBioActivity(actId) {
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
    document.getElementById('bio-systems-menu').classList.add('hidden');
    // Amagar totes les llistes d'activitats de sistemes
    document.querySelectorAll('#project-hub-biologia .activities-grid:not(#bio-systems-menu)').forEach(el => el.classList.add('hidden'));
    // Amagar totes les sub-activitats (jocs)
    document.querySelectorAll('#project-hub-biologia .sub-activity').forEach(el => el.classList.add('hidden'));

    // Mostrar el menú principal dels sentits
    document.getElementById('bio-senses-activities').classList.remove('hidden');
}

function openSenseSubActivity(senseId) {
    // Amagar el menú principal dels sentits i totes les llistes d'activitats
    document.getElementById('bio-senses-activities').classList.add('hidden');
    document.querySelectorAll('#project-hub-biologia .activities-grid:not(#bio-systems-menu)').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('#project-hub-biologia .sub-activity').forEach(el => el.classList.add('hidden'));

    // Mostrar el sub-menú del sentit seleccionat (ex: sense-vista-menu)
    const menuId = 'sense-' + senseId + '-menu';
    const menu = document.getElementById(menuId);
    if (menu) menu.classList.remove('hidden');
}



// --- RADIO NAVIGATION ---
function showRadioMenu() {
    const hub = document.getElementById('project-hub-radio');
    if (hub) {
        document.getElementById('radio-activities-menu').classList.remove('hidden');
        hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    }
}

function openRadioActivity(actId) {
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

/**
 * CLIENT-SIDE LOGIC
 * Connecta amb Google Apps Script API
 */

// **********************************************************
// CONFIGURACIÓ
// **********************************************************
// Substitueix aquesta URL per la que t'ha donat el Google Apps Script al fer "Deploy"
// Exemple: 'https://script.google.com/macros/s/AKfycbx.../exec'
const API_URL = 'https://script.google.com/macros/s/AKfycbw_fSYQ7po7RpS4nVH00RU0UJA3C_nWd_Sc-14TXG5o8FfqtVYEy_UQsM_Jc4z31gVN/exec';

// **********************************************************
// ESTAT DE L'APLICACIÓ
// **********************************************************
const state = {
    user: null,
    currentProject: null
};

// **********************************************************
// ELEMENTS DEL DOM
// **********************************************************
const screens = {
    login: document.getElementById('login-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    game: document.getElementById('game-screen')
};

const forms = {
    login: document.getElementById('login-form')
};

// **********************************************************
// INICIALITZACIÓ
// **********************************************************
document.addEventListener('DOMContentLoaded', () => {
    // Comprovar si hi ha sessió guardada (localStorage)
    const savedUser = localStorage.getItem('user');

    // Inicialitzar traduccions
    translateUI();

    if (savedUser) {
        state.user = JSON.parse(savedUser);
        loadDashboard();
    } else {
        showScreen('login');
    }

    // Login Listener
    forms.login.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await handleLogin(email, password);
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Back from Game
    document.getElementById('back-dashboard-btn').addEventListener('click', () => {
        showScreen('dashboard');
    });

    // Simulate Game Save
    document.getElementById('simulate-score-btn').addEventListener('click', simulateGameSave);
});

// **********************************************************
// FUNCIONS DE NAVEGACIÓ
// **********************************************************
function showScreen(screenName) {
    // Amagar totes
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden'); // Ensure hidden class is applied
        // Wait, logic here: .active is display block, .hidden is display none.
        // My CSS has .screen { display: none } by default. .active { display: block }.
        // So removing active should be enough, but adding hidden is safe explicitly if needed.
        // Actually CSS: .screen { display: none } .screen.active { display: block }
        // So just removing .active is sufficient.
    });

    // Mostrar la desitjada
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
        screens[screenName].classList.remove('hidden');
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

    // UI Loading
    btn.disabled = true;
    loader.classList.remove('hidden');
    errorMsg.textContent = '';

    try {
        const response = await callApi('login', { email, password });

        if (response && response.status === 'success') {
            state.user = response.user;
            localStorage.setItem('user', JSON.stringify(state.user));
            loadDashboard();
        } else {
            errorMsg.textContent = response ? response.message : 'Error desconegut';
        }
    } catch (e) {
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
    showScreen('login');
}

async function loadDashboard() {
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
        'p1_mediterrani': { icon: '🌊', gradient: 'linear-gradient(135deg, #0ea5e9, #2563eb)' },
        'p1_natura': { icon: '🌿', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
        'p4_natura': { icon: '🌲', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
        'p2_paralimpics': { icon: '🏅', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
        'p4_digitalitzacio': { icon: '💻', gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
        'p2_biologia': { icon: '🔬', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
        'p2_radio': { icon: '🎙️', gradient: 'linear-gradient(135deg, #facc15, #ca8a04)' }
    };

    if (allProjects.length > 0) {
        allProjects.forEach(proj => {
            const visual = projectVisuals[proj.id] || { icon: '📁', gradient: 'linear-gradient(135deg, #94a3b8, #64748b)' };

            const card = document.createElement('div');
            card.className = 'project-card';
            card.style.minWidth = '180px'; // Targeta més estreta per optimitzar espai
            card.innerHTML = `
                <div class="card-image" style="background: ${visual.gradient}">${visual.icon}</div>
                <div class="card-content">
                    <div class="card-title">${proj.titol}</div>
                    <div class="card-desc">${proj.descripcio}</div>
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
        if (gameDiv) gameDiv.classList.remove('hidden');
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
        if (hubDiv) hubDiv.classList.remove('hidden');
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

// Listener pel canvi d'idioma
document.getElementById('language-selector').addEventListener('change', (e) => {
    const lang = e.target.value;
    if (typeof i18n !== 'undefined') {
        i18n.setLanguage(lang);
        translateUI();
    }
});

function translateUI() {
    if (typeof i18n === 'undefined') return;

    // Actualitzar textos UI comuns que tinguin l'atribut data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = i18n.t(key);
    });

    // Actualitzar textos dinàmics si cal
    if (state.user) {
        document.getElementById('welcome-msg').textContent = `${i18n.t('hi')}, ${state.user.nom}!`;
    }

    // Si estem dins d'un joc, potser cal refrescar-lo
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
        puntuacio: Math.floor(Math.random() * 10) + 1,
        temps_segons: 120,
        feedback_pos: 'Has estat ràpid',
        feedback_neg: 'Cal millorar la precisió'
    };

    const statusP = document.getElementById('simulation-result');
    statusP.textContent = 'Guardant...';

    const response = await callApi('saveResult', result);

    if (response && response.status === 'success') {
        statusP.textContent = 'Resultat guardat correctament!';
        statusP.style.color = 'green';
    } else {
        statusP.textContent = 'Error al guardar.';
        statusP.style.color = 'red';
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
    document.getElementById('med-activities-menu').classList.add('hidden');
    document.getElementById(`med-activity-${actId}`).classList.remove('hidden');
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

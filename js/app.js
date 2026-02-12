/**
 * CLIENT-SIDE LOGIC
 * Connecta amb Google Apps Script API
 */

// **********************************************************
// CONFIGURACIÓ
// **********************************************************
// Substitueix aquesta URL per la que t'ha donat el Google Apps Script al fer "Deploy"
// Exemple: 'https://script.google.com/macros/s/AKfycbx.../exec'
const API_URL = 'https://script.google.com/macros/s/AKfycbwJujNxA_J3llPURnOTuW3lMnZMTuh-B5DCSLpf5YDGst0BtCj0qYj2VdpICumYapwKEw/exec';

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

    const response = await callApi('getProjects', { curs: state.user.curs });

    grid.innerHTML = ''; // Netejar

    if (response && response.status === 'success' && response.projectes.length > 0) {
        response.projectes.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="card-image">📁</div>
                <div class="card-content">
                    <div class="card-title">${proj.titol}</div>
                    <div class="card-desc">${proj.descripcio}</div>
                </div>
            `;
            card.addEventListener('click', () => openProject(proj));
            grid.appendChild(card);
        });
    } else {
        grid.innerHTML = '<p>No tens projectes assignats o no s\'han pogut carregar.</p>';
    }
}

function openProject(project) {
    state.currentProject = project;
    showScreen('game');
    document.getElementById('game-title').textContent = project.titol;
    document.getElementById('simulation-result').textContent = '';
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

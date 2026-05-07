/**
 * NATURA - Projecte Orenetes
 * L'activitat carrega imatges de nius i corregeix una fitxa de camp amb 4 recomptes.
 */

const orenetesState = {
    items: [],
    currentIndex: 0,
    score: 0,
    fieldHits: 0,
    checked: false,
    startTime: null,
    resultSaved: false
};

const ORENETES_FIELDS = [
    { key: 'bonEstat', inputId: 'orenetes-input-bonestat', label: 'Nius en bon estat' },
    { key: 'actius', inputId: 'orenetes-input-actius', label: 'Nius actius' },
    { key: 'trencats', inputId: 'orenetes-input-trencats', label: 'Nius trencats' },
    { key: 'restes', inputId: 'orenetes-input-restes', label: 'Restes' }
];

async function initOrenetesGame() {
    const setup = document.getElementById('orenetes-setup');
    const game = document.getElementById('orenetes-game');
    const results = document.getElementById('orenetes-results');

    if (!setup || !game || !results) return;

    setup.classList.remove('hidden');
    game.classList.add('hidden');
    results.classList.add('hidden');
    setup.innerHTML = '<p class="mb-4 text-gray-700">Carregant fitxes de camp...</p>';

    try {
        const response = await callApi('getOrenetesData');
        const items = response?.data || [];

        if (response?.status !== 'success' || items.length === 0) {
            const message = response?.message || 'No hi ha dades a la pestanya orenetes_nius.';
            setup.innerHTML = `
                <div class="orenetes-empty">
                    <p>${message}</p>
                    <button class="btn btn--secondary mt-4" onclick="showNaturaMenu()">Tornar al menu</button>
                </div>
            `;
            return;
        }

        orenetesState.items = items.sort(() => Math.random() - 0.5);
        orenetesState.currentIndex = 0;
        orenetesState.score = 0;
        orenetesState.fieldHits = 0;
        orenetesState.checked = false;
        orenetesState.startTime = new Date();
        orenetesState.resultSaved = false;

        setup.classList.add('hidden');
        game.classList.remove('hidden');
        renderOrenetesItem();
    } catch (error) {
        console.error('Error carregant Projecte Orenetes:', error);
        setup.innerHTML = '<div class="orenetes-empty">Error de connexio carregant les dades.</div>';
    }
}

function renderOrenetesItem() {
    const item = orenetesState.items[orenetesState.currentIndex];
    const total = orenetesState.items.length;

    orenetesState.checked = false;

    document.getElementById('orenetes-progress').textContent = `Imatge ${orenetesState.currentIndex + 1} / ${total}`;
    document.getElementById('orenetes-score').textContent = `${orenetesState.score}%`;
    document.getElementById('orenetes-description').textContent = item.descripcio || 'Observa la imatge i completa la fitxa de camp.';

    const img = document.getElementById('orenetes-image');
    img.src = buildOrenetesImageSrc(item.imatge);
    img.alt = item.descripcio || 'Nius d\'oreneta';
    img.onerror = () => {
        img.src = buildOrenetesPlaceholder(item.imatge);
    };

    ORENETES_FIELDS.forEach(field => {
        const input = document.getElementById(field.inputId);
        input.value = '';
        input.disabled = false;
        input.classList.remove('orenetes-input-correct', 'orenetes-input-incorrect');
    });

    document.getElementById('orenetes-check-btn').disabled = false;
    document.getElementById('orenetes-feedback').classList.add('hidden');
    document.getElementById('orenetes-next-btn').classList.add('hidden');
}

function checkOrenetesAnswer() {
    if (orenetesState.checked) return;

    const item = orenetesState.items[orenetesState.currentIndex];
    const feedback = document.getElementById('orenetes-feedback');
    let correctFields = 0;

    ORENETES_FIELDS.forEach(field => {
        const input = document.getElementById(field.inputId);
        const studentValue = Number(input.value);
        const targetValue = Number(item[field.key]) || 0;
        const isCorrect = Number.isFinite(studentValue) && studentValue === targetValue;

        input.disabled = true;
        input.classList.toggle('orenetes-input-correct', isCorrect);
        input.classList.toggle('orenetes-input-incorrect', !isCorrect);
        if (isCorrect) correctFields++;
    });

    const itemPercentage = Math.round((correctFields / ORENETES_FIELDS.length) * 100);
    orenetesState.fieldHits += correctFields;
    orenetesState.score = Math.round((orenetesState.fieldHits / ((orenetesState.currentIndex + 1) * ORENETES_FIELDS.length)) * 100);
    orenetesState.checked = true;

    document.getElementById('orenetes-score').textContent = `${orenetesState.score}%`;
    document.getElementById('orenetes-check-btn').disabled = true;

    feedback.classList.remove('hidden', 'feedback-panel--good', 'feedback-panel--mid', 'feedback-panel--low');
    if (itemPercentage === 100) {
        feedback.textContent = 'Fitxa perfecta: 100% d\'encerts en aquesta imatge.';
        feedback.classList.add('feedback-panel--good');
    } else if (itemPercentage >= 50) {
        feedback.textContent = `Has encertat ${correctFields} de 4 camps (${itemPercentage}%). Revisa la imatge amb calma.`;
        feedback.classList.add('feedback-panel--mid');
    } else {
        feedback.textContent = `Has encertat ${correctFields} de 4 camps (${itemPercentage}%). Torna a observar formes, vores i restes.`;
        feedback.classList.add('feedback-panel--low');
    }

    const nextBtn = document.getElementById('orenetes-next-btn');
    nextBtn.textContent = orenetesState.currentIndex + 1 < orenetesState.items.length ? 'Seguent imatge' : 'Veure resultat final';
    nextBtn.classList.remove('hidden');
}

function nextOrenetesImage() {
    if (!orenetesState.checked) return;

    orenetesState.currentIndex++;
    if (orenetesState.currentIndex < orenetesState.items.length) {
        renderOrenetesItem();
    } else {
        finishOrenetesGame();
    }
}

async function finishOrenetesGame() {
    const totalItems = orenetesState.items.length;
    const totalFields = totalItems * ORENETES_FIELDS.length;
    const percentage = totalFields ? Math.round((orenetesState.fieldHits / totalFields) * 100) : 0;
    const message = buildOrenetesFinalMessage(percentage);

    document.getElementById('orenetes-game').classList.add('hidden');
    document.getElementById('orenetes-results').classList.remove('hidden');
    document.getElementById('orenetes-final-score').textContent = `${percentage}%`;
    document.getElementById('orenetes-final-msg').textContent = message;

    await saveOrenetesResult(percentage, message);
}

async function saveOrenetesResult(percentage, message) {
    if (orenetesState.resultSaved || !state.user) return;

    const resultData = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject?.titol || 'Entorns de Natura',
        app: 'Projecte Orenetes',
        nivell: getOrenetesResultLevel(),
        puntuacio: percentage,
        temps_segons: Math.round((new Date() - orenetesState.startTime) / 1000),
        feedback_pos: percentage >= 80 ? message : '',
        feedback_neg: percentage < 80 ? message : ''
    };

    try {
        const response = await callApi('saveResult', resultData);
        if (response && response.status === 'success') {
            orenetesState.resultSaved = true;
            console.log('Resultat Orenetes guardat a resultats:', resultData);
        } else {
            console.error('No s\'ha pogut guardar el resultat Orenetes:', response);
        }
    } catch (error) {
        console.error('Error guardant resultat Orenetes:', error);
    }
}

function getOrenetesResultLevel() {
    const levels = [...new Set(orenetesState.items
        .map(item => String(item.dificultat || '').trim())
        .filter(level => level))];

    if (levels.length === 1) return levels[0];
    if (levels.length > 1) return 'Mix';
    return 'Fitxa de camp';
}

function buildOrenetesImageSrc(imageName) {
    const value = String(imageName || '').trim();
    if (/^(https?:|data:|assets\/)/i.test(value)) return value;
    return `assets/images/activities/entorns/orenetes/${value}`;
}

function buildOrenetesFinalMessage(percentage) {
    if (percentage === 100) return 'Excel.lent: totes les fitxes coincideixen amb les dades del Sheet.';
    if (percentage >= 80) return 'Molt bona observacio. Et falten pocs detalls per clavar totes les fitxes.';
    if (percentage >= 50) return 'Bona feina. Practica la diferencia entre nius sencers, actius, trencats i restes.';
    return 'Cal entrenar mes la mirada de camp abans de fer el recompte final.';
}

function buildOrenetesPlaceholder(text) {
    const safeText = String(text || 'Imatge no trobada')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="900" height="620" viewBox="0 0 900 620">
            <rect width="900" height="620" fill="#f6f1e6"/>
            <rect x="64" y="64" width="772" height="492" rx="12" fill="#fffdf7" stroke="#9a7b4f" stroke-width="4"/>
            <path d="M150 410 C250 250 360 250 450 410 C550 250 660 250 750 410" fill="none" stroke="#9a7b4f" stroke-width="18" stroke-linecap="round"/>
            <text x="450" y="214" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="#5f4528">Imatge no trobada</text>
            <text x="450" y="274" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#7a6143">${safeText}</text>
        </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

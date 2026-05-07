// js/games/treball-recerca-temes.js

let trTemesList = [];
let trCurrentTemaIndex = 0;
let trTotalPoints = 0;
let trMaxPossiblePoints = 0;
let trSelectedQuestions = new Set(); // To track which button indices are selected
let isTrChecked = false;

let trTemesCategoriesLoaded = false;

async function loadTrTemesCategories() {
    const setupDiv = document.getElementById('tr-temes-setup');
    const container = document.getElementById('tr-temes-categories-container');
    const quizDiv = document.getElementById('tr-temes-quiz-container');
    const resultsDiv = document.getElementById('tr-temes-results');

    setupDiv.classList.remove('hidden');
    quizDiv.classList.add('hidden');
    resultsDiv.classList.add('hidden');

    container.innerHTML = '<p class="text-gray-500">Carregant àmbits disponibles...</p>';

    try {
        const response = await callApi('getTrTemesQuestions', { tipusBatxillerat: '' });
        if (response && response.status === 'success') {
            const categories = response.categories || [];
            container.innerHTML = ''; // clear loading

            if (categories.length === 0) {
                container.innerHTML = '<p class="text-red-500">No hi ha cap tema disponible.</p>';
                return;
            }

            categories.forEach((cat) => {
                const btn = document.createElement('button');
                btn.className = 'btn btn--primary shadow-md quiz-category-button quiz-filter-button--topic';
                btn.textContent = cat;
                btn.onclick = () => initTrTemes(cat);
                container.appendChild(btn);
            });

            trTemesCategoriesLoaded = true;
        } else {
            const errorMsg = response && response.message ? response.message : 'Error desconegut';
            container.innerHTML = `<p class="text-red-500 border border-red-300 bg-red-50 p-4 rounded">Error carregant dades del Google Sheets: <b>${errorMsg}</b></p>`;
        }
    } catch (e) {
        container.innerHTML = `<p class="text-red-500 border border-red-300 bg-red-50 p-4 rounded">Error de connexió: <b>${e.message}</b></p>`;
    }
}

async function initTrTemes(tipusBatxillerat) {
    const setupDiv = document.getElementById('tr-temes-setup');
    const quizDiv = document.getElementById('tr-temes-quiz-container');

    // Feedback de càrrega
    const loadingText = document.createElement('p');
    loadingText.className = 'text-gray-500 mt-4';
    loadingText.id = 'tr-temes-loading-text';
    loadingText.textContent = 'Carregant temes...';
    setupDiv.appendChild(loadingText);

    try {
        const response = await callApi('getTrTemesQuestions', { tipusBatxillerat: tipusBatxillerat });

        if (response && response.status === 'success') {
            trTemesList = response.topics || [];

            if (trTemesList.length === 0) {
                alert("Ho sentim, no hi ha temes disponibles per aquest àmbit.");
                const lt = document.getElementById('tr-temes-loading-text');
                if (lt) lt.remove();
                return;
            }

            trCurrentTemaIndex = 0;
            trTotalPoints = 0;
            // Calculem el màxim de punts segons les preguntes que realment han arribat
            trMaxPossiblePoints = trTemesList.reduce((acc, curr) => acc + curr.preguntes.length, 0);

            setupDiv.classList.add('hidden');
            quizDiv.classList.remove('hidden');
            const ltFinal = document.getElementById('tr-temes-loading-text');
            if (ltFinal) ltFinal.remove();

            renderTrTemaContent();
        } else {
            alert("Error carregant els temes: " + (response ? response.message : "Desconegut"));
            const ltFinal = document.getElementById('tr-temes-loading-text');
            if (ltFinal) ltFinal.remove();
        }
    } catch (e) {
        console.error("Connection Error:", e);
        alert("Error de connexió en demanar els temes a la base de dades.");
        const ltFinal = document.getElementById('tr-temes-loading-text');
        if (ltFinal) ltFinal.remove();
    }
}

function renderTrTemaContent() {
    if (trCurrentTemaIndex >= trTemesList.length) {
        showTrTemesResults();
        return;
    }

    const currentTopic = trTemesList[trCurrentTemaIndex];
    trSelectedQuestions.clear();
    isTrChecked = false;

    // Update Headers
    document.getElementById('tr-temes-progress').textContent = `Tema ${trCurrentTemaIndex + 1} / ${trTemesList.length}`;
    document.getElementById('tr-temes-score').textContent = `Punts: ${trTotalPoints}`;
    document.getElementById('tr-temes-tema').textContent = currentTopic.tema;

    // Render Options
    const optionsContainer = document.getElementById('tr-temes-options');
    optionsContainer.innerHTML = '';

    currentTopic.preguntes.forEach((q, idx) => {
        const btn = document.createElement('button');
        btn.id = `tr-temes-qbtn-${idx}`;
        // Styling default unselected state
        btn.className = 'w-full text-left p-4 border-2 border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-lg cursor-pointer';
        btn.textContent = q.text;

        btn.onclick = () => toggleTrTemaSelection(idx, btn);
        optionsContainer.appendChild(btn);
    });

    // Reset UI bottom area
    document.getElementById('tr-temes-check-btn').classList.remove('hidden');
    const feedbackArea = document.getElementById('tr-temes-feedback-area');
    feedbackArea.classList.add('hidden');
    document.getElementById('tr-temes-feedback-list').innerHTML = '';
}

function toggleTrTemaSelection(idx, btnEl) {
    if (isTrChecked) return; // Prevent clicking after check

    if (trSelectedQuestions.has(idx)) {
        trSelectedQuestions.delete(idx);
        btnEl.classList.remove('border-blue-500', 'bg-blue-50');
        btnEl.classList.add('border-gray-200', 'bg-gray-50');
        btnEl.style.borderColor = '';
        btnEl.style.backgroundColor = '';
    } else {
        trSelectedQuestions.add(idx);
        btnEl.classList.remove('border-gray-200', 'bg-gray-50', 'hover:bg-gray-100');
        btnEl.classList.add('border-blue-500', 'bg-blue-50');
        btnEl.style.borderColor = '#3b82f6'; // Blau Tailwind
        btnEl.style.backgroundColor = '#eff6ff'; // Fons blau clar Tailwind
    }
}

async function checkTrTemesRespostes() {
    if (isTrChecked) return;
    isTrChecked = true;

    const currentTopic = trTemesList[trCurrentTemaIndex];
    const feedbackList = document.getElementById('tr-temes-feedback-list');
    feedbackList.innerHTML = '';

    document.getElementById('tr-temes-check-btn').classList.add('hidden');

    let topicPoints = 0;

    // Arrays for DB saving tracking
    let feedbacksPos = [];
    let feedbacksNeg = [];

    currentTopic.preguntes.forEach((q, idx) => {
        const isSelected = trSelectedQuestions.has(idx);
        // "investigable" check based on the type stored in the DB row.
        const correctIsInvestigable = String(q.type).toLowerCase().includes('investigable') && !String(q.type).toLowerCase().includes('no investigable');

        let isCorrect = false;
        let pClass = '';
        let feedbackText = '';

        if (isSelected && correctIsInvestigable) {
            isCorrect = true;
            pClass = 'text-green-700 bg-green-50 border-green-200';
            feedbackText = `✔ Correcte. Aquesta pregunta és investigable perquè permet recollir dades. ("${q.text}")`;
            feedbacksPos.push(`Encert Inv: ${q.text.substring(0, 25)}`);
        } else if (!isSelected && !correctIsInvestigable) {
            isCorrect = true;
            pClass = 'text-green-700 bg-green-50 border-green-200';
            feedbackText = `✔ Correcte. Aquesta pregunta només demana informació i no es pot respondre amb una investigació. ("${q.text}")`;
            feedbacksPos.push(`Encert NoInv: ${q.text.substring(0, 25)}`);
        } else if (isSelected && !correctIsInvestigable) {
            isCorrect = false;
            pClass = 'text-red-700 bg-red-50 border-red-200';
            feedbackText = `✖ Incorrecte. "${q.text}" NO és investigable perquè només demana informació i no permet recollir dades.`;
            feedbacksNeg.push(`Errada (Marcar no-inv): ${q.text.substring(0, 25)}`);
        } else if (!isSelected && correctIsInvestigable) {
            isCorrect = false;
            pClass = 'text-red-700 bg-red-50 border-red-200';
            feedbackText = `✖ Incorrecte. Et faltava seleccionar "${q.text}", ja que SÍ és investigable.`;
            feedbacksNeg.push(`Errada (Ometre inv): ${q.text.substring(0, 25)}`);
        }

        if (isCorrect) topicPoints++;

        // Visual update to the button
        const btn = document.getElementById(`tr-temes-qbtn-${idx}`);
        btn.className = `w-full text-left p-4 border-2 rounded-lg text-lg mb-2 opacity-80 cursor-default`;

        if (isCorrect) {
            btn.classList.add('border-green-500', 'bg-green-50');
            btn.style.borderColor = '#22c55e'; // green-500
            btn.style.backgroundColor = '#f0fdf4'; // green-50
        } else {
            btn.classList.add('border-red-500', 'bg-red-50');
            btn.style.borderColor = '#ef4444'; // red-500
            btn.style.backgroundColor = '#fef2f2'; // red-50
        }

        // Add feedback message
        const fbEl = document.createElement('div');
        fbEl.className = `p-3 rounded border text-left ${pClass}`;
        fbEl.textContent = feedbackText;
        feedbackList.appendChild(fbEl);
    });

    trTotalPoints += topicPoints;
    document.getElementById('tr-temes-score').textContent = `Punts: ${trTotalPoints}`;

    document.getElementById('tr-temes-feedback-area').classList.remove('hidden');

    // Desem el resultat a la base de dades
    await saveTrTemesResult(currentTopic, topicPoints, currentTopic.preguntes.length, feedbacksPos, feedbacksNeg);
}

function nextTrTema() {
    trCurrentTemaIndex++;
    renderTrTemaContent();
}

function showTrTemesResults() {
    document.getElementById('tr-temes-quiz-container').classList.add('hidden');
    const resultsDiv = document.getElementById('tr-temes-results');
    resultsDiv.classList.remove('hidden');

    const percent = Math.round((trTotalPoints / trMaxPossiblePoints) * 100);

    document.getElementById('tr-temes-final-score').textContent = `${percent}%`;
    document.getElementById('tr-temes-final-percentage').textContent = `${percent}%`;

    const msgEl = document.getElementById('tr-temes-final-msg');
    if (percent >= 90) {
        msgEl.textContent = "Domines molt bé què és una pregunta investigable.";
        msgEl.className = "text-lg mb-8 text-green-600 font-bold";
    } else if (percent >= 70) {
        msgEl.textContent = "Vas bé però encara pots millorar.";
        msgEl.className = "text-lg mb-8 text-yellow-600 font-bold";
    } else {
        msgEl.textContent = "Encara confons preguntes d'informació amb preguntes investigables.";
        msgEl.className = "text-lg mb-8 text-red-600 font-bold";
    }
}

async function saveTrTemesResult(topicObj, puntsAconseguits, puntsPossibles, feedbacksPos, feedbacksNeg) {
    if (!state.user) return; // Si no hi ha sessió, no guardem

    // Temps fictici
    const temps = 15;

    const fPosStr = feedbacksPos.join(" | ");
    const fNegStr = feedbacksNeg.join(" | ");

    const percent = puntsPossibles ? Math.round((puntsAconseguits / puntsPossibles) * 100) : 0;

    const resultData = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: 'Treball de Recerca',
        app: 'Temes i preguntes',
        nivell: topicObj.tema.substring(0, 50),
        puntuacio: percent,
        temps_segons: temps,
        feedback_pos: fPosStr.substring(0, 400),
        feedback_neg: fNegStr.substring(0, 400)
    };

    callApi('saveResult', resultData).catch(e => console.error("Error guardant resultats TR: ", e));
}

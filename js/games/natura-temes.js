// js/games/natura-temes.js

let naturaTemesList = [];
let naturaCurrentTemaIndex = 0;
let naturaTemesScore = 0;
let naturaSelectedQuestionIds = new Set();
let naturaTemesCategoriesLoaded = false;

async function loadNaturaTemesCategories() {
    if (naturaTemesCategoriesLoaded) return;

    const container = document.getElementById('natura-temes-categories-container');
    if (!container) return;
    container.innerHTML = '<p class="text-gray-500 text-center w-full">Carregant àmbits...</p>';

    try {
        const response = await callApi('getNaturaTemesQuestions', { tipusBatxillerat: '' });
        if (response && response.status === 'success') {
            const categories = response.categories || [];
            container.innerHTML = '';

            if (categories.length === 0) {
                container.innerHTML = '<p class="text-red-500">No hi ha cap tema disponible.</p>';
                return;
            }

            categories.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = 'btn btn--primary shadow-md px-6 py-4 text-xl font-bold rounded-lg';
                btn.style.backgroundColor = '#10b981'; // Green for Natura
                btn.textContent = cat;
                btn.onclick = () => initNaturaTemes(cat);
                container.appendChild(btn);
            });
            naturaTemesCategoriesLoaded = true;
        } else {
            container.innerHTML = '<p class="text-red-500">Error carregant categories.</p>';
        }
    } catch (e) {
        container.innerHTML = '<p class="text-red-500">Error de connexió.</p>';
    }
}

async function initNaturaTemes(category) {
    const setupDiv = document.getElementById('natura-temes-setup');
    const quizDiv = document.getElementById('natura-temes-quiz-container');
    const resultsDiv = document.getElementById('natura-temes-results');

    setupDiv.classList.add('hidden');
    resultsDiv.classList.add('hidden');
    quizDiv.classList.add('hidden');

    try {
        const response = await callApi('getNaturaTemesQuestions', { tipusBatxillerat: category });
        if (response && response.status === 'success') {
            naturaTemesList = response.topics || [];
            if (naturaTemesList.length === 0) {
                alert("No hi ha temes per aquesta categoria.");
                setupDiv.classList.remove('hidden');
                return;
            }
            naturaCurrentTemaIndex = 0;
            naturaTemesScore = 0;
            quizDiv.classList.remove('hidden');
            renderNaturaTema();
        } else {
            alert("Error: " + response.message);
            setupDiv.classList.remove('hidden');
        }
    } catch (e) {
        alert("Error de connexió.");
        setupDiv.classList.remove('hidden');
    }
}

function renderNaturaTema() {
    const currentTema = naturaTemesList[naturaCurrentTemaIndex];
    naturaSelectedQuestionIds.clear();

    document.getElementById('natura-temes-progress').textContent = `Tema ${naturaCurrentTemaIndex + 1} / ${naturaTemesList.length}`;
    document.getElementById('natura-temes-score').textContent = `Punts: ${naturaTemesScore}`;
    document.getElementById('natura-temes-tema').textContent = currentTema.tema;

    const optionsContainer = document.getElementById('natura-temes-options');
    optionsContainer.innerHTML = '';

    currentTema.preguntes.forEach((q, idx) => {
        const qId = `q${idx}`;
        const btn = document.createElement('button');
        btn.className = 'w-full text-left p-4 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-300 transition-all text-lg';
        btn.innerHTML = q.text;
        btn.onclick = () => {
            if (naturaSelectedQuestionIds.has(qId)) {
                naturaSelectedQuestionIds.delete(qId);
                btn.style.borderColor = '#e5e7eb';
                btn.style.backgroundColor = '#ffffff';
                btn.style.fontWeight = 'normal';
            } else {
                naturaSelectedQuestionIds.add(qId);
                btn.style.borderColor = '#3b82f6';
                btn.style.backgroundColor = '#eff6ff';
                btn.style.fontWeight = '600';
            }
        };
        optionsContainer.appendChild(btn);
    });

    document.getElementById('natura-temes-check-btn').classList.remove('hidden');
    document.getElementById('natura-temes-feedback-area').classList.add('hidden');
}

function checkNaturaTemesRespostes() {
    const currentTema = naturaTemesList[naturaCurrentTemaIndex];
    const feedbackList = document.getElementById('natura-temes-feedback-list');
    feedbackList.innerHTML = '';

    let correctCount = 0;
    let totalInvestigable = currentTema.preguntes.filter(q => q.type.toLowerCase().includes('investigable') && !q.type.toLowerCase().includes('no')).length;

    currentTema.preguntes.forEach((q, idx) => {
        const qId = `q${idx}`;
        const isInvestigable = q.type.toLowerCase().includes('investigable') && !q.type.toLowerCase().includes('no');
        const isSelected = naturaSelectedQuestionIds.has(qId);

        const card = document.createElement('div');
        card.className = `p-3 rounded border ${isSelected === isInvestigable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`;

        let icon = isSelected === isInvestigable ? '✔' : '✖';
        let statusText = "";
        if (isInvestigable && isSelected) { statusText = "Correcte! És investigable."; correctCount++; }
        else if (isInvestigable && !isSelected) { statusText = "T'has oblidat d'aquesta, era investigable."; }
        else if (!isInvestigable && isSelected) { statusText = "Aquesta NO era investigable."; }
        else { statusText = "Correcte, no és investigable."; correctCount++; }

        card.innerHTML = `<div class="flex gap-2"><span>${icon}</span><div><strong>${q.text}</strong><br><small>${statusText}</small></div></div>`;
        feedbackList.appendChild(card);
    });

    const temaPoints = Math.max(0, Math.round((correctCount / currentTema.preguntes.length) * 10));
    naturaTemesScore += temaPoints;

    document.getElementById('natura-temes-check-btn').classList.add('hidden');
    document.getElementById('natura-temes-feedback-area').classList.remove('hidden');
    document.getElementById('natura-temes-score').textContent = `Punts: ${naturaTemesScore}`;
}

function nextNaturaTema() {
    naturaCurrentTemaIndex++;
    if (naturaCurrentTemaIndex < naturaTemesList.length) {
        renderNaturaTema();
    } else {
        showNaturaTemesResults();
    }
}

function showNaturaTemesResults() {
    document.getElementById('natura-temes-quiz-container').classList.add('hidden');
    const resultsDiv = document.getElementById('natura-temes-results');
    resultsDiv.classList.remove('hidden');

    const maxScore = naturaTemesList.length * 10;
    const percent = Math.round((naturaTemesScore / maxScore) * 100);

    document.getElementById('natura-temes-final-score').textContent = `${percent}%`;
    document.getElementById('natura-temes-final-percentage').textContent = `${percent}%`;

    const msgEl = document.getElementById('natura-temes-final-msg');
    if (percent >= 80) msgEl.textContent = "Molt bé! Saps identificar perfectament els temes de recerca.";
    else if (percent >= 50) msgEl.textContent = "Bon intent, però encara pots ajustar millor el focus.";
    else msgEl.textContent = "Revisa els conceptes de pregunta investigable.";

    saveNaturaTemesResult();
}

async function saveNaturaTemesResult() {
    if (!state.user) return;
    const maxScore = naturaTemesList.length * 10;
    const percent = maxScore ? Math.round((naturaTemesScore / maxScore) * 100) : 0;
    const resultData = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: 'Entorns de Natura',
        app: 'Temes i Preguntes',
        nivell: 'Mix',
        puntuacio: percent,
        temps_segons: 60,
        feedback_pos: `Punts totals: ${naturaTemesScore}`,
        feedback_neg: ""
    };
    callApi('saveResult', resultData).catch(e => console.error(e));
}

// js/games/treball-recerca.js

let trPreguntesList = [];
let trCurrentQuestionIndex = 0;
let trCorrectAnswers = 0;
let trCategoriesLoaded = false;

async function loadTrCategories() {
    if (trCategoriesLoaded) return;

    const container = document.getElementById('tr-preguntes-categories-container');
    container.innerHTML = '<p class="text-gray-500">Carregant àmbits disponibles...</p>';

    try {
        const response = await callApi('getTrQuestions', { tipusBatxillerat: '' });
        if (response && response.status === 'success') {
            const categories = response.categories || [];
            container.innerHTML = ''; // clear loading

            if (categories.length === 0) {
                container.innerHTML = '<p class="text-red-500">No hi ha cap pregunta disponible.</p>';
                return;
            }

            const colors = ['var(--primary)', 'var(--secondary)', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];

            categories.forEach((cat, index) => {
                const btn = document.createElement('button');
                btn.className = 'btn-primary';
                btn.style.padding = '1.5rem 2rem';
                btn.style.fontSize = '1.25rem';
                btn.style.backgroundColor = colors[index % colors.length];
                btn.textContent = cat;
                btn.onclick = () => initTrPreguntes(cat);
                container.appendChild(btn);
            });

            trCategoriesLoaded = true;
        } else {
            container.innerHTML = '<p class="text-red-500">Error carregant els àmbits.</p>';
        }
    } catch (e) {
        container.innerHTML = '<p class="text-red-500">Error de connexió.</p>';
    }
}

async function initTrPreguntes(tipusBatxillerat) {
    // Show loading text on the buttons or somewhere
    const setupDiv = document.getElementById('tr-preguntes-setup');
    const quizDiv = document.getElementById('tr-preguntes-quiz-container');
    const resultsDiv = document.getElementById('tr-preguntes-results');

    // Hide results if we are restarting
    resultsDiv.classList.add('hidden');

    try {
        const response = await callApi('getTrQuestions', { tipusBatxillerat: tipusBatxillerat });

        if (response && response.status === 'success') {
            trPreguntesList = response.questions;

            if (trPreguntesList.length === 0) {
                alert("No s'han trobat preguntes per aquest àmbit.");
                return;
            }

            trCurrentQuestionIndex = 0;
            trCorrectAnswers = 0;

            setupDiv.classList.add('hidden');
            quizDiv.classList.remove('hidden');

            renderTrPregunta();
        } else {
            alert("Error carregant les preguntes: " + (response ? response.message : "Error de connexió"));
        }
    } catch (e) {
        alert("Error de connexió. Torna-ho a provar.");
    }
}

function renderTrPregunta() {
    if (trCurrentQuestionIndex >= trPreguntesList.length) {
        showTrResults();
        return;
    }

    const question = trPreguntesList[trCurrentQuestionIndex];
    document.getElementById('tr-preguntes-progress').textContent = `Pregunta ${trCurrentQuestionIndex + 1} / ${trPreguntesList.length}`;
    document.getElementById('tr-preguntes-text').textContent = question.pregunta;

    // Reset UI
    document.getElementById('tr-preguntes-feedback-area').classList.add('hidden');

    const btnI = document.getElementById('btn-investigable');
    const btnNi = document.getElementById('btn-no-investigable');

    btnI.disabled = false;
    btnI.style.opacity = '1';

    btnNi.disabled = false;
    btnNi.style.opacity = '1';
}

async function checkTrPreguntaRespuesta(respostaAlumne) {
    const question = trPreguntesList[trCurrentQuestionIndex];
    const respostaCorrecta = question.investigable.trim();

    // Disable buttons
    document.getElementById('btn-investigable').disabled = true;
    document.getElementById('btn-no-investigable').disabled = true;

    // Mostrar què ha passat i el feedback
    const feedbackArea = document.getElementById('tr-preguntes-feedback-area');
    const feedbackMsg = document.getElementById('tr-preguntes-feedback-msg');
    const feedbackDesc = document.getElementById('tr-preguntes-feedback-desc');

    let isCorrect = false;

    // Simplifiquem la comparació per ser case insensitive i treure espais
    if (respostaAlumne.toLowerCase() === respostaCorrecta.toLowerCase()) {
        isCorrect = true;
        trCorrectAnswers++;
        feedbackArea.className = 'text-center mt-4 p-4 rounded bg-green-50 border border-green-200';
        feedbackMsg.textContent = '✔ Correcte';
        feedbackMsg.className = 'text-xl font-bold mb-2 text-green-700';

        if (respostaCorrecta.toLowerCase() === 'investigable') {
            feedbackDesc.textContent = "Molt bé! Aquesta pregunta es pot respondre recollint i analitzant dades.";
        } else {
            feedbackDesc.textContent = "Exacte. " + question.perque_no_investigable;
        }

    } else {
        feedbackArea.className = 'text-center mt-4 p-4 rounded bg-red-50 border border-red-200';
        feedbackMsg.textContent = '✖ No és correcte';
        feedbackMsg.className = 'text-xl font-bold mb-2 text-red-700';

        if (respostaCorrecta.toLowerCase() === 'investigable') {
            feedbackDesc.textContent = "Aquesta és una pregunta investigable perquè permet recollir dades per trobar la resposta.";
        } else {
            feedbackDesc.textContent = question.perque_no_investigable;
        }
    }

    feedbackArea.classList.remove('hidden');

    // Desem el resultat a la base de dades
    await saveTrResult(question, respostaAlumne, respostaCorrecta, isCorrect);
}

function nextTrPregunta() {
    trCurrentQuestionIndex++;
    renderTrPregunta();
}

function showTrResults() {
    document.getElementById('tr-preguntes-quiz-container').classList.add('hidden');
    const resultsDiv = document.getElementById('tr-preguntes-results');
    resultsDiv.classList.remove('hidden');

    const total = trPreguntesList.length;
    const percent = Math.round((trCorrectAnswers / total) * 100);

    document.getElementById('tr-preguntes-final-score').textContent = `${trCorrectAnswers} / ${total}`;
    document.getElementById('tr-preguntes-final-percentage').textContent = `${percent}%`;

    const msgEl = document.getElementById('tr-preguntes-final-msg');
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

async function saveTrResult(question, respostaAlumne, respostaCorrecta, isCorrect) {
    if (!state.user) return; // Si no hi ha sessió, no guardem

    // Per al temps agafem una aproximació, no s'ha especificat cronòmetre
    const temps = 10;

    // Adaptem els camps al "saveResult" existent. 
    // Ordre columnes: timestamp, email, curs, projecte, app, nivell, puntuacio, temps_segons, feedback_pos, feedback_neg
    // Aprofitem els camps per enviar ID pregunta, etc.
    const resultData = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: 'Treball de Recerca',
        app: 'Preguntes investigables',
        nivell: question.tipus_batxillerat || 'General',
        puntuacio: isCorrect ? 1 : 0,
        temps_segons: temps,
        // Guardem codi de pregunta i què ha triat al camp "feedback" com a metadata útil 
        feedback_pos: `ID: ${question.id} | Q: ${question.pregunta.substring(0, 30)}...`,
        feedback_neg: `Resp: ${respostaAlumne} | Corr: ${respostaCorrecta}`
    };

    // Fem un 'fire and forget' per no blocar la UI (ja hi ha await adalt pero si falla no mostrem error)
    callApi('saveResult', resultData).catch(e => console.error(e));
}

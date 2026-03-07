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

            categories.forEach((cat) => {
                const btn = document.createElement('button');
                btn.className = 'btn-primary shadow-md';
                btn.style.padding = '1.5rem 2rem';
                btn.style.fontSize = '1.5rem';
                btn.style.fontWeight = 'bold';
                btn.style.textTransform = 'capitalize';
                btn.style.backgroundColor = '#3b82f6'; // Blau per defecte
                btn.style.transition = 'background-color 0.3s ease, transform 0.1s ease';

                // Efecte Hover
                btn.onmouseover = () => {
                    btn.style.backgroundColor = '#ef4444'; // Vermell
                    btn.style.transform = 'scale(1.05)';
                };

                btn.onmouseout = () => {
                    btn.style.backgroundColor = '#3b82f6'; // Torna a blau
                    btn.style.transform = 'scale(1)';
                };

                btn.textContent = cat;
                btn.onclick = () => initTrPreguntes(cat);
                container.appendChild(btn);
            });

            trCategoriesLoaded = true;
        } else {
            const errorMsg = response && response.message ? response.message : 'Error desconegut';
            container.innerHTML = `<p class="text-red-500 border border-red-300 bg-red-50 p-4 rounded">Error carregant dades del Google Sheets: <b>${errorMsg}</b></p>`;
            console.error(response);
        }
    } catch (e) {
        container.innerHTML = `<p class="text-red-500 border border-red-300 bg-red-50 p-4 rounded">Error de connexió: <b>${e.message}</b></p>`;
        console.error(e);
    }
}

async function initTrPreguntes(tipusBatxillerat) {
    const setupDiv = document.getElementById('tr-preguntes-setup');
    const quizDiv = document.getElementById('tr-preguntes-quiz-container');
    const resultsDiv = document.getElementById('tr-preguntes-results');

    // Mostrem text de càrrega als botons (sense carregar spinner sencer per no molestar)
    if (setupDiv) setupDiv.innerHTML += '<p class="text-gray-500 mt-4" id="tr-loading-text">Carregant preguntes...</p>';

    resultsDiv.classList.add('hidden');
    quizDiv.classList.add('hidden');

    try {
        const response = await callApi('getTrQuestions', { tipusBatxillerat: tipusBatxillerat });

        if (response && response.status === 'success') {
            trPreguntesList = response.questions || [];

            if (trPreguntesList.length === 0) {
                alert("Ho sentim, no hi ha preguntes disponibles per aquest àmbit.");
                const loadTxt = document.getElementById('tr-loading-text');
                if (loadTxt) loadTxt.remove();
                return;
            }

            trCurrentQuestionIndex = 0;
            trCorrectAnswers = 0;

            if (setupDiv) setupDiv.classList.add('hidden');
            quizDiv.classList.remove('hidden');

            renderTrPregunta();
        } else {
            alert("Error carregant les preguntes: " + (response ? response.message : "Desconegut"));
            const loadTxt = document.getElementById('tr-loading-text');
            if (loadTxt) loadTxt.remove();
        }
    } catch (e) {
        console.error("Connection Error:", e);
        alert("Error de connexió en demanar les preguntes a la base de dades.");
        const loadTxt = document.getElementById('tr-loading-text');
        if (loadTxt) loadTxt.remove();
    }
}

function renderTrPregunta() {
    if (trCurrentQuestionIndex >= trPreguntesList.length) {
        showTrResults();
        return;
    }

    const currentQ = trPreguntesList[trCurrentQuestionIndex];
    document.getElementById('tr-preguntes-progress').textContent = `Pregunta ${trCurrentQuestionIndex + 1} / ${trPreguntesList.length}`;
    document.getElementById('tr-preguntes-text').textContent = currentQ.pregunta;

    // Reset UI
    document.getElementById('tr-preguntes-feedback-area').classList.add('hidden');
    document.getElementById('btn-investigable').disabled = false;
    document.getElementById('btn-no-investigable').disabled = false;
    document.getElementById('btn-investigable').style.opacity = "1";
    document.getElementById('btn-no-investigable').style.opacity = "1";
}

function checkTrPreguntaRespuesta(respostaHabilitada) {
    document.getElementById('btn-investigable').disabled = true;
    document.getElementById('btn-no-investigable').disabled = true;

    const currentQ = trPreguntesList[trCurrentQuestionIndex];

    // Check if what user clicked matches what db says 
    // Usually 'investigable/no investigable' column says "Investigable" or "No investigable"
    const isInvestigableDB = String(currentQ.investigable).toLowerCase().includes('no') ? false : true;
    const isInvestigableUser = respostaHabilitada === 'Investigable';

    const isCorrect = isInvestigableDB === isInvestigableUser;

    if (isCorrect) trCorrectAnswers++;

    // Guardem l'acció a l'objecte per a finalResult
    currentQ.userPassed = isCorrect;

    // Show Feedback
    const fbArea = document.getElementById('tr-preguntes-feedback-area');
    const fbMsg = document.getElementById('tr-preguntes-feedback-msg');
    const fbDesc = document.getElementById('tr-preguntes-feedback-desc');

    fbArea.classList.remove('hidden');

    if (isCorrect) {
        fbArea.className = 'text-center mt-4 p-4 rounded bg-green-50 border border-green-200';
        fbMsg.textContent = "✔ Correcte!";
        fbMsg.className = "text-xl font-bold mb-2 text-green-700";
    } else {
        fbArea.className = 'text-center mt-4 p-4 rounded bg-red-50 border border-red-200';
        fbMsg.textContent = "✖ Incorrecte.";
        fbMsg.className = "text-xl font-bold mb-2 text-red-700";
        document.getElementById(respostaHabilitada === 'Investigable' ? 'btn-no-investigable' : 'btn-investigable').style.opacity = "0.5";
    }

    // Raó
    if (isInvestigableDB) {
        fbDesc.textContent = "Aquesta pregunta ÉS investigable perquè " + (currentQ.perque_no_investigable || "es pot respondre dissenyant un experiment o pauta d'observació.");
    } else {
        fbDesc.textContent = "Aquesta pregunta NO és investigable perquè " + (currentQ.perque_no_investigable || "només demana informació que es pot trobar a la bibliografia o a internet.");
    }
}

function nextTrPregunta() {
    trCurrentQuestionIndex++;
    renderTrPregunta();
}

function showTrResults() {
    document.getElementById('tr-preguntes-quiz-container').classList.add('hidden');
    const resultsDiv = document.getElementById('tr-preguntes-results');
    resultsDiv.classList.remove('hidden');

    const totalQs = trPreguntesList.length;
    const percent = Math.round((trCorrectAnswers / totalQs) * 100);

    document.getElementById('tr-preguntes-final-score').textContent = `${trCorrectAnswers} / ${totalQs}`;
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

    saveTrResult();
}

async function saveTrResult() {
    if (!state.user) return; // Si no hi ha sessió, no guardem

    // Temps fictici per no crear timer ara
    const temps = 30;

    let feedPos = [];
    let feedNeg = [];

    // Recopilem les preguntes per feedback
    trPreguntesList.forEach(q => {
        if (q.userPassed) {
            feedPos.push(`Encert: ${q.pregunta.substring(0, 30)}`);
        } else {
            feedNeg.push(`${q.tipus_error || 'Sense tipus h'}: ${q.pregunta.substring(0, 40)}`);
        }
    });

    const resultData = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: 'Treball de Recerca',
        app: 'Preguntes investigables (Targetes)',
        nivell: (trPreguntesList[0] ? trPreguntesList[0].tipus_batxillerat : 'Mix').substring(0, 50),
        puntuacio: trCorrectAnswers,
        temps_segons: temps,
        feedback_pos: feedPos.join(" | ").substring(0, 400),
        feedback_neg: feedNeg.join(" | ").substring(0, 400)
    };

    callApi('saveResult', resultData).catch(e => console.error("Error guardant resultats TR: ", e));
}

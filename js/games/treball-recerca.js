// js/games/treball-recerca.js

async function loadTrCategories() {
    const container = document.getElementById('tr-preguntes-categories-container');
    if (!container) return;

    container.innerHTML = `<p class="text-gray-500">Carregant opcions...</p>`;

    try {
        const response = await callApi('getTrQuestions', { subambit: '', tipusBatxillerat: '' });
        if (response && response.status === 'success') {
            const subambits = response.subambits || [];
            const ambits = response.ambits || [];
            container.innerHTML = '';

            // Estructura vertical (Batxillerat a dalt, Sub-àmbits a sota)
            const stack = document.createElement('div');
            stack.className = 'flex flex-col gap-10 w-full max-w-4xl mx-auto mt-10';

            // Bloc Superior: Tipus de Batxillerat
            const topBlock = document.createElement('div');
            topBlock.className = 'flex flex-row flex-wrap gap-3 justify-center';
            const topTitle = document.createElement('h4');
            topTitle.className = 'w-full text-xl font-bold mb-4 text-blue-600 border-b-2 pb-2 text-center';
            topTitle.textContent = 'Tipus de Batxillerat';
            topBlock.appendChild(topTitle);

            ambits.forEach(opt => {
                const btn = createTrBtn(opt, () => initTrPreguntes('', opt));
                topBlock.appendChild(btn);
            });

            // Bloc Inferior: Sub-àmbits
            const bottomBlock = document.createElement('div');
            bottomBlock.className = 'flex flex-row flex-wrap gap-3 justify-center';
            const bottomTitle = document.createElement('h4');
            bottomTitle.className = 'w-full text-xl font-bold mb-4 text-red-600 border-b-2 pb-2 text-center';
            bottomTitle.textContent = 'Sub-àmbits';
            bottomBlock.appendChild(bottomTitle);

            subambits.forEach(opt => {
                const btn = createTrBtn(opt, () => initTrPreguntes(opt, ''), 'quiz-filter-button--hard');
                bottomBlock.appendChild(btn);
            });

            stack.appendChild(topBlock);
            stack.appendChild(bottomBlock);
            container.appendChild(stack);

            // Botó Barrejat al mig/baix
            const mixContainer = document.createElement('div');
            mixContainer.className = 'col-span-full flex justify-center mt-8';
            const mixBtn = createTrBtn('Totes barrejades', () => initTrPreguntes('Mix', 'Mix'), 'quiz-filter-button--mixed');
            mixBtn.style.padding = '1.2rem 3rem';
            mixContainer.appendChild(mixBtn);
            container.appendChild(mixContainer);

        } else {
            container.innerHTML = `<p class="text-red-500 p-4 rounded">Error: <b>${response.message || 'Error desconegut'}</b></p>`;
        }
    } catch (e) {
        container.innerHTML = `<p class="text-red-500 p-4 rounded">Error de connexió: <b>${e.message}</b></p>`;
    }
}

function createTrBtn(text, onClick, modifierClass = 'quiz-filter-button--topic') {
    const btn = document.createElement('button');
    btn.className = `btn btn--primary shadow-md quiz-option-button quiz-option-button--compact ${modifierClass}`;
    btn.textContent = text;
    btn.onclick = onClick;
    return btn;
}

async function initTrPreguntes(subambit, tipusBatxillerat) {
    const setupDiv = document.getElementById('tr-preguntes-setup');
    const quizDiv = document.getElementById('tr-preguntes-quiz-container');
    const resultsDiv = document.getElementById('tr-preguntes-results');

    if (setupDiv) setupDiv.innerHTML += '<p class="text-gray-500 mt-4" id="tr-loading-text">Carregant preguntes...</p>';

    resultsDiv.classList.add('hidden');
    quizDiv.classList.add('hidden');

    try {
        const response = await callApi('getTrQuestions', { subambit: subambit, tipusBatxillerat: tipusBatxillerat });

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

    document.getElementById('tr-preguntes-final-score').textContent = `${percent}%`;
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
    const totalQs = trPreguntesList.length;
    const percent = totalQs ? Math.round((trCorrectAnswers / totalQs) * 100) : 0;
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
        puntuacio: percent,
        temps_segons: temps,
        feedback_pos: feedPos.join(" | ").substring(0, 400),
        feedback_neg: feedNeg.join(" | ").substring(0, 400)
    };

    callApi('saveResult', resultData).catch(e => console.error("Error guardant resultats TR: ", e));
}



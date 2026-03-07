// js/games/rates-preguntes.js

async function loadRatesCategories() {
    const container = document.getElementById('rates-preguntes-categories-container');
    if (!container) return;

    container.innerHTML = `<p class="text-gray-500">Carregant opcions...</p>`;

    try {
        const response = await callApi('getTrQuestions', { subambit: '', tipusBatxillerat: '' });
        if (response && response.status === 'success') {
            const subambits = response.subambits || [];
            const ambits = response.ambits || [];
            container.innerHTML = '';

            const grid = document.createElement('div');
            grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto mt-4';

            const leftCol = document.createElement('div');
            leftCol.className = 'flex flex-row flex-wrap gap-2 justify-center';
            const leftTitle = document.createElement('h4');
            leftTitle.className = 'w-full text-lg font-bold mb-2 text-pink-600 border-b pb-1 text-center';
            leftTitle.textContent = 'Tipus de Batxillerat';
            leftCol.appendChild(leftTitle);

            ambits.forEach(opt => {
                const btn = createRatesBtn(opt, () => initRatesPreguntes('', opt));
                leftCol.appendChild(btn);
            });

            const rightCol = document.createElement('div');
            rightCol.className = 'flex flex-row flex-wrap gap-2 justify-center';
            const rightTitle = document.createElement('h4');
            rightTitle.className = 'w-full text-lg font-bold mb-2 text-rose-600 border-b pb-1 text-center';
            rightTitle.textContent = 'Sub-àmbits';
            rightCol.appendChild(rightTitle);

            subambits.forEach(opt => {
                const btn = createRatesBtn(opt, () => initRatesPreguntes(opt, ''), '#e11d48');
                rightCol.appendChild(btn);
            });

            grid.appendChild(leftCol);
            grid.appendChild(rightCol);
            container.appendChild(grid);

            const mixContainer = document.createElement('div');
            mixContainer.className = 'col-span-full flex justify-center mt-8';
            const mixBtn = createRatesBtn('Totes barreja des', () => initRatesPreguntes('Mix', 'Mix'), '#8b5cf6');
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

function createRatesBtn(text, onClick, bgColor = '#f43f5e') {
    const btn = document.createElement('button');
    btn.className = 'btn-primary shadow-md';
    btn.style.padding = '0.7rem 1.2rem';
    btn.style.width = 'auto';
    btn.style.fontSize = '1rem';
    btn.style.fontWeight = 'bold';
    btn.style.backgroundColor = bgColor;
    btn.style.transition = 'all 0.3s ease';

    btn.onmouseover = () => {
        btn.style.filter = 'brightness(1.1)';
        btn.style.transform = 'translateY(-2px)';
    };
    btn.onmouseout = () => {
        btn.style.filter = 'brightness(1)';
        btn.style.transform = 'translateY(0)';
    };

    btn.textContent = text;
    btn.onclick = onClick;
    return btn;
}

async function initRatesPreguntes(subambit, tipusBatxillerat) {
    const setupDiv = document.getElementById('rates-preguntes-setup');
    const quizDiv = document.getElementById('rates-preguntes-quiz-container');
    const resultsDiv = document.getElementById('rates-preguntes-results');

    if (setupDiv) setupDiv.innerHTML += '<p class="text-gray-500 mt-4" id="rates-loading-text">Carregant preguntes...</p>';

    resultsDiv.classList.add('hidden');
    quizDiv.classList.add('hidden');

    try {
        const response = await callApi('getTrQuestions', { subambit: subambit, tipusBatxillerat: tipusBatxillerat });

        if (response && response.status === 'success') {
            ratesPreguntesList = response.questions || [];

            if (ratesPreguntesList.length === 0) {
                alert("Ho sentim, no hi ha preguntes disponibles per aquest àmbit.");
                const loadTxt = document.getElementById('rates-loading-text');
                if (loadTxt) loadTxt.remove();
                return;
            }

            ratesCurrentQuestionIndex = 0;
            ratesCorrectAnswers = 0;

            if (setupDiv) setupDiv.classList.add('hidden');
            quizDiv.classList.remove('hidden');

            renderRatesPregunta();
        } else {
            alert("Error carregant les preguntes: " + (response ? response.message : "Desconegut"));
            const loadTxt = document.getElementById('rates-loading-text');
            if (loadTxt) loadTxt.remove();
        }
    } catch (e) {
        console.error("Connection Error:", e);
        alert("Error de connexió.");
        const loadTxt = document.getElementById('rates-loading-text');
        if (loadTxt) loadTxt.remove();
    }
}

function renderRatesPregunta() {
    if (ratesCurrentQuestionIndex >= ratesPreguntesList.length) {
        showRatesResults();
        return;
    }

    const currentQ = ratesPreguntesList[ratesCurrentQuestionIndex];
    document.getElementById('rates-preguntes-progress').textContent = `Pregunta ${ratesCurrentQuestionIndex + 1} / ${ratesPreguntesList.length}`;
    document.getElementById('rates-preguntes-text').textContent = currentQ.pregunta;

    document.getElementById('rates-preguntes-feedback-area').classList.add('hidden');
    document.getElementById('btn-rates-investigable').disabled = false;
    document.getElementById('btn-rates-no-investigable').disabled = false;
    document.getElementById('btn-rates-investigable').style.opacity = "1";
    document.getElementById('btn-rates-no-investigable').style.opacity = "1";
}

function checkRatesPreguntaRespuesta(respostaHabilitada) {
    document.getElementById('btn-rates-investigable').disabled = true;
    document.getElementById('btn-rates-no-investigable').disabled = true;

    const currentQ = ratesPreguntesList[ratesCurrentQuestionIndex];
    const isInvestigableDB = String(currentQ.investigable).toLowerCase().includes('no') ? false : true;
    const isInvestigableUser = respostaHabilitada === 'Investigable';
    const isCorrect = isInvestigableDB === isInvestigableUser;

    if (isCorrect) ratesCorrectAnswers++;
    currentQ.userPassed = isCorrect;

    const fbArea = document.getElementById('rates-preguntes-feedback-area');
    const fbMsg = document.getElementById('rates-preguntes-feedback-msg');
    const fbDesc = document.getElementById('rates-preguntes-feedback-desc');

    fbArea.classList.remove('hidden');

    if (isCorrect) {
        fbArea.className = 'text-center mt-4 p-4 rounded bg-green-50 border border-green-200';
        fbMsg.textContent = "✔ Correcte!";
        fbMsg.className = "text-xl font-bold mb-2 text-green-700";
    } else {
        fbArea.className = 'text-center mt-4 p-4 rounded bg-red-50 border border-red-200';
        fbMsg.textContent = "✖ Incorrecte.";
        fbMsg.className = "text-xl font-bold mb-2 text-red-700";
        document.getElementById(respostaHabilitada === 'Investigable' ? 'btn-rates-no-investigable' : 'btn-rates-investigable').style.opacity = "0.5";
    }

    if (isInvestigableDB) {
        fbDesc.textContent = "Aquesta pregunta ÉS investigable perquè " + (currentQ.perque_no_investigable || "es pot respondre dissenyant un experiment o pauta d'observació.");
    } else {
        fbDesc.textContent = "Aquesta pregunta NO és investigable perquè " + (currentQ.perque_no_investigable || "només demana informació.");
    }
}

function nextRatesPregunta() {
    ratesCurrentQuestionIndex++;
    renderRatesPregunta();
}

function showRatesResults() {
    document.getElementById('rates-preguntes-quiz-container').classList.add('hidden');
    const resultsDiv = document.getElementById('rates-preguntes-results');
    resultsDiv.classList.remove('hidden');

    const totalQs = ratesPreguntesList.length;
    const percent = Math.round((ratesCorrectAnswers / totalQs) * 100);

    document.getElementById('rates-preguntes-final-score').textContent = `${ratesCorrectAnswers} / ${totalQs}`;
    document.getElementById('rates-preguntes-final-percentage').textContent = `${percent}%`;

    const msgEl = document.getElementById('rates-preguntes-final-msg');
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

    saveRatesPreguntaResult();
}

async function saveRatesPreguntaResult() {
    if (!state.user) return;

    let feedPos = [];
    let feedNeg = [];

    ratesPreguntesList.forEach(q => {
        if (q.userPassed) {
            feedPos.push(`Encert: ${q.pregunta.substring(0, 30)}`);
        } else {
            feedNeg.push(`Err: ${q.pregunta.substring(0, 40)}`);
        }
    });

    const resultData = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: 'Rates a la carrera',
        app: 'Preguntes investigables',
        nivell: 'Mix',
        puntuacio: ratesCorrectAnswers,
        temps_segons: 30,
        feedback_pos: feedPos.join(" | ").substring(0, 400),
        feedback_neg: feedNeg.join(" | ").substring(0, 400)
    };

    callApi('saveResult', resultData).catch(e => console.error("Error guardant resultats Rates: ", e));
}

// js/games/natura-preguntes.js

let naturaPreguntesList = [];
let naturaCurrentQuestionIndex = 0;
let naturaCorrectAnswers = 0;
let naturaCategoriesLoaded = false;

async function loadNaturaCategories() {
    if (naturaCategoriesLoaded) return;

    const container = document.getElementById('natura-preguntes-categories-container');
    if (!container) return;
    container.innerHTML = '<p class="text-gray-500">Carregant àmbits disponibles...</p>';

    try {
        const response = await callApi('getNaturaPreguntes', { tipusBatxillerat: '' });
        if (response && response.status === 'success') {
            const categories = response.categories || [];
            container.innerHTML = '';

            if (categories.length === 0) {
                container.innerHTML = '<p class="text-red-500">No hi ha cap àmbit disponible.</p>';
                return;
            }

            categories.forEach((cat) => {
                const btn = document.createElement('button');
                btn.className = 'btn-primary shadow-md';
                btn.style.padding = '1.5rem 2rem';
                btn.style.fontSize = '1.5rem';
                btn.style.fontWeight = 'bold';
                btn.style.textTransform = 'capitalize';
                btn.style.backgroundColor = '#10b981'; // Green for Natura
                btn.style.transition = 'background-color 0.3s ease, transform 0.1s ease';

                btn.onmouseover = () => {
                    btn.style.backgroundColor = '#059669';
                    btn.style.transform = 'scale(1.05)';
                };

                btn.onmouseout = () => {
                    btn.style.backgroundColor = '#10b981';
                    btn.style.transform = 'scale(1)';
                };

                btn.textContent = cat;
                btn.onclick = () => initNaturaPreguntes(cat);
                container.appendChild(btn);
            });

            naturaCategoriesLoaded = true;
        } else {
            const errorMsg = response && response.message ? response.message : 'Error desconegut';
            container.innerHTML = `<p class="text-red-500 border border-red-300 bg-red-50 p-4 rounded">Error: <b>${errorMsg}</b></p>`;
        }
    } catch (e) {
        container.innerHTML = `<p class="text-red-500 border border-red-300 bg-red-50 p-4 rounded">Error de connexió: <b>${e.message}</b></p>`;
    }
}

async function initNaturaPreguntes(tipusBatxillerat) {
    const setupDiv = document.getElementById('natura-preguntes-setup');
    const quizDiv = document.getElementById('natura-preguntes-quiz-container');
    const resultsDiv = document.getElementById('natura-preguntes-results');

    if (setupDiv) setupDiv.innerHTML += '<p class="text-gray-500 mt-4" id="natura-loading-text">Carregant preguntes...</p>';

    resultsDiv.classList.add('hidden');
    quizDiv.classList.add('hidden');

    try {
        const response = await callApi('getNaturaPreguntes', { tipusBatxillerat: tipusBatxillerat });

        if (response && response.status === 'success') {
            naturaPreguntesList = response.questions || [];

            if (naturaPreguntesList.length === 0) {
                alert("Ho sentim, no hi ha preguntes disponibles per aquest àmbit.");
                const loadTxt = document.getElementById('natura-loading-text');
                if (loadTxt) loadTxt.remove();
                return;
            }

            naturaCurrentQuestionIndex = 0;
            naturaCorrectAnswers = 0;

            if (setupDiv) setupDiv.classList.add('hidden');
            quizDiv.classList.remove('hidden');

            renderNaturaPregunta();
        } else {
            alert("Error carregant les preguntes: " + (response ? response.message : "Desconegut"));
            const loadTxt = document.getElementById('natura-loading-text');
            if (loadTxt) loadTxt.remove();
        }
    } catch (e) {
        console.error("Connection Error:", e);
        alert("Error de connexió.");
        const loadTxt = document.getElementById('natura-loading-text');
        if (loadTxt) loadTxt.remove();
    }
}

function renderNaturaPregunta() {
    if (naturaCurrentQuestionIndex >= naturaPreguntesList.length) {
        showNaturaResults();
        return;
    }

    const currentQ = naturaPreguntesList[naturaCurrentQuestionIndex];
    document.getElementById('natura-preguntes-progress').textContent = `Pregunta ${naturaCurrentQuestionIndex + 1} / ${naturaPreguntesList.length}`;
    document.getElementById('natura-preguntes-text').textContent = currentQ.pregunta;

    document.getElementById('natura-preguntes-feedback-area').classList.add('hidden');
    document.getElementById('btn-natura-investigable').disabled = false;
    document.getElementById('btn-natura-no-investigable').disabled = false;
    document.getElementById('btn-natura-investigable').style.opacity = "1";
    document.getElementById('btn-natura-no-investigable').style.opacity = "1";
}

function checkNaturaPreguntaRespuesta(respostaHabilitada) {
    document.getElementById('btn-natura-investigable').disabled = true;
    document.getElementById('btn-natura-no-investigable').disabled = true;

    const currentQ = naturaPreguntesList[naturaCurrentQuestionIndex];
    const isInvestigableDB = String(currentQ.investigable).toLowerCase().includes('no') ? false : true;
    const isInvestigableUser = respostaHabilitada === 'Investigable';
    const isCorrect = isInvestigableDB === isInvestigableUser;

    if (isCorrect) naturaCorrectAnswers++;
    currentQ.userPassed = isCorrect;

    const fbArea = document.getElementById('natura-preguntes-feedback-area');
    const fbMsg = document.getElementById('natura-preguntes-feedback-msg');
    const fbDesc = document.getElementById('natura-preguntes-feedback-desc');

    fbArea.classList.remove('hidden');

    if (isCorrect) {
        fbArea.className = 'text-center mt-4 p-4 rounded bg-green-50 border border-green-200';
        fbMsg.textContent = "✔ Correcte!";
        fbMsg.className = "text-xl font-bold mb-2 text-green-700";
    } else {
        fbArea.className = 'text-center mt-4 p-4 rounded bg-red-50 border border-red-200';
        fbMsg.textContent = "✖ Incorrecte.";
        fbMsg.className = "text-xl font-bold mb-2 text-red-700";
        document.getElementById(respostaHabilitada === 'Investigable' ? 'btn-natura-no-investigable' : 'btn-natura-investigable').style.opacity = "0.5";
    }

    if (isInvestigableDB) {
        fbDesc.textContent = "Aquesta pregunta ÉS investigable perquè " + (currentQ.perque_no_investigable || "es pot respondre dissenyant un experiment o pauta d'observació.");
    } else {
        fbDesc.textContent = "Aquesta pregunta NO és investigable perquè " + (currentQ.perque_no_investigable || "només demana informació.");
    }
}

function nextNaturaPregunta() {
    naturaCurrentQuestionIndex++;
    renderNaturaPregunta();
}

function showNaturaResults() {
    document.getElementById('natura-preguntes-quiz-container').classList.add('hidden');
    const resultsDiv = document.getElementById('natura-preguntes-results');
    resultsDiv.classList.remove('hidden');

    const totalQs = naturaPreguntesList.length;
    const percent = Math.round((naturaCorrectAnswers / totalQs) * 100);

    document.getElementById('natura-preguntes-final-score').textContent = `${naturaCorrectAnswers} / ${totalQs}`;
    document.getElementById('natura-preguntes-final-percentage').textContent = `${percent}%`;

    const msgEl = document.getElementById('natura-preguntes-final-msg');
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

    saveNaturaPreguntaResult();
}

async function saveNaturaPreguntaResult() {
    if (!state.user) return;

    let feedPos = [];
    let feedNeg = [];

    naturaPreguntesList.forEach(q => {
        if (q.userPassed) {
            feedPos.push(`Encert: ${q.pregunta.substring(0, 30)}`);
        } else {
            feedNeg.push(`Err: ${q.pregunta.substring(0, 40)}`);
        }
    });

    const resultData = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: 'Entorns de Natura',
        app: 'Preguntes investigables',
        nivell: 'Mix',
        puntuacio: naturaCorrectAnswers,
        temps_segons: 30,
        feedback_pos: feedPos.join(" | ").substring(0, 400),
        feedback_neg: feedNeg.join(" | ").substring(0, 400)
    };

    callApi('saveResult', resultData).catch(e => console.error("Error guardant resultats Natura: ", e));
}

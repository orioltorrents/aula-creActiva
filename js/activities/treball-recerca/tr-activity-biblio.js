/*
==========================================================
ACTIVITAT: BIBLIOGRAFIA I CITES
Projecte: Treball de Recerca

Aquest fitxer conté la lògica específica de l'activitat
de bibliografia i cites del Treball de Recerca.

Què fa aquest fitxer?
- Inicialitza l'activitat
- Permet seleccionar tema o nivell
- Carrega les preguntes corresponents
- Mostra les opcions de resposta
- Comprova si la resposta és correcta
- Actualitza el progrés i la puntuació
- Mostra feedback a l'alumne
- Gestiona el pas a la pregunta següent
- Mostra el resultat final de l'activitat

Què NO fa aquest fitxer?
- No controla el menú principal del projecte
- No mostra ni amaga el hub del projecte
- No decideix quina activitat s'obre
- No gestiona la navegació general entre activitats

Per tant, aquest fitxer és responsable només de la
lògica interna de l'activitat de bibliografia i cites.

==========================================================
*/

let trBiblioState = {
    allQuestions: [],
    activeQuestions: [],
    currentQ: 0,
    score: 0,
    examFinished: false,
    locked: false,
    selectedType: "all",
    selectedLevel: "mixed",
};

/* -----------------------------
   Helpers per llegir dades robustament
----------------------------- */

function sanitizeTrBiblioValue(raw) {
    if (raw === undefined || raw === null) return "";
    const s = String(raw).trim();
    if (!s) return "";
    const low = s.toLowerCase();
    if (low === "undefined" || low === "null") return "";
    return s;
}

function normalizeTrBiblioKeyName(k) {
    return String(k)
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[\r\n\t]+/g, " ")
        .trim();
}

function getTrBiblioByExactOrLooseKey(obj, exactKeys = [], loosePredicates = []) {
    if (!obj || typeof obj !== "object") return "";

    const mapNormToReal = {};
    for (const real of Object.keys(obj)) {
        mapNormToReal[normalizeTrBiblioKeyName(real)] = real;
    }

    for (const ek of exactKeys) {
        const real = mapNormToReal[normalizeTrBiblioKeyName(ek)];
        if (real != null) {
            const v = sanitizeTrBiblioValue(obj[real]);
            if (v) return v;
        }
    }

    return "";
}

function getTrBiblioQuestionType(q) {
    return getTrBiblioByExactOrLooseKey(q, ["Tipus de pregunta", "Tipus", "type", "tipus", "topic", "tema"]);
}

function getTrBiblioQuestionLevel(q) {
    return getTrBiblioByExactOrLooseKey(q, ["Nivell", "level", "nivell", "dificultat", "dificultad"]);
}

function getTrBiblioQuestionText(q) {
    return getTrBiblioByExactOrLooseKey(q, ["Pregunta", "question", "q", "pregunta"]);
}

function getTrBiblioCorrectAnswer(q) {
    return getTrBiblioByExactOrLooseKey(q, ["Correcta", "correct", "correctAnswer", "correcta"]);
}

function getTrBiblioWrongAnswers(q) {
    const w1 = getTrBiblioByExactOrLooseKey(q, ["Incorrecta1"]);
    const w2 = getTrBiblioByExactOrLooseKey(q, ["Incorrecta2"]);
    const w3 = getTrBiblioByExactOrLooseKey(q, ["Incorrecta3"]);

    const altArrayRaw = q.alternatives ?? q.options ?? q.respostes;
    if (Array.isArray(altArrayRaw)) {
        return altArrayRaw.map(sanitizeTrBiblioValue).filter(Boolean);
    }

    return [w1, w2, w3].map(sanitizeTrBiblioValue).filter(Boolean);
}

function normalizeTrBiblioLevel(text) {
    if (!text) return "";
    return String(text)
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/* -----------------------------
   Init
----------------------------- */

async function initTrBiblioGame() {
    document.getElementById("tr-activity-biblio")?.classList.remove("hidden");
    document.getElementById("tr-biblio-level-selection")?.classList.remove("hidden");

    const topicContainer = document.getElementById("tr-biblio-topic-selection");
    if (topicContainer) {
        topicContainer.classList.remove("hidden");
        topicContainer.innerHTML = "";
    }

    document.getElementById("tr-biblio-quiz-container")?.classList.add("hidden");
    document.getElementById("tr-biblio-results")?.classList.add("hidden");
    document.getElementById("tr-activities-menu")?.classList.add("hidden");

    const feedback = document.getElementById("tr-biblio-feedback");
    if (feedback) {
        feedback.innerText = "Carregant dades...";
        setElementStateColor(feedback, 'muted');
    }

    try {
        const response = await callApi("getBiblioQuestions");

        if (response && response.status === "success" && Array.isArray(response.questions)) {
            trBiblioState.allQuestions = response.questions;
            if (feedback) feedback.innerText = "";
            generateTrBiblioTopicButtons(response.questions);
        } else {
            const errorMsg = response && response.message ? response.message : "Error al carregar dades.";
            if (feedback) {
                feedback.innerText = `Error: ${errorMsg}`;
                setElementStateColor(feedback, 'error');
            }
        }
    } catch (e) {
        console.error("Error fetching biblio questions", e);
        if (feedback) {
            feedback.innerText = "Error de connexió.";
            setElementStateColor(feedback, 'error');
        }
    }
}

/* -----------------------------
   Botons TIPUS
----------------------------- */

function generateTrBiblioTopicButtons(questions) {
    const container = document.getElementById("tr-biblio-topic-selection");
    if (!container) return;

    container.innerHTML = "";

    const types = [...new Set(
        questions
            .map(getTrBiblioQuestionType)
            .map(sanitizeTrBiblioValue)
            .filter(Boolean)
    )];

    const label = document.createElement("p");
    label.className = "font-bold mb-3 text-center";
    label.innerText = "Tria un tipus de pregunta (nivell barrejat):";
    container.appendChild(label);

    const btnWrapper = document.createElement("div");
    btnWrapper.className = "flex flex-wrap justify-center gap-4 mb-6";

    // Botó TOTES
    const allBtn = document.createElement("button");
    allBtn.className = "btn btn--primary";
    allBtn.style = "background-color: var(--primary-color); width:auto; font-size:0.95rem; padding:10px 20px; min-width:120px;";
    allBtn.innerText = "Totes";
    allBtn.onclick = () => startTrBiblioWithFilter("all", "mixed");
    btnWrapper.appendChild(allBtn);

    types.forEach((type) => {
        const btn = document.createElement("button");
        btn.className = "btn btn--primary";
        btn.style = "background-color: var(--primary-color); width:auto; font-size:0.95rem; padding:10px 20px; min-width:120px;";
        btn.innerText = type;
        btn.onclick = () => startTrBiblioWithFilter(type, "mixed");
        btnWrapper.appendChild(btn);
    });

    container.appendChild(btnWrapper);
}

/* -----------------------------
   Inici joc + filtre
----------------------------- */

function startTrBiblioWithFilter(type = "all", level = "mixed") {
    trBiblioState.selectedType = type;
    trBiblioState.selectedLevel = level;

    let pool = [...trBiblioState.allQuestions];
    const targetLevel = normalizeTrBiblioLevel(level);

    if (type !== "all") {
        const wanted = sanitizeTrBiblioValue(type);
        pool = pool.filter((q) => sanitizeTrBiblioValue(getTrBiblioQuestionType(q)) === wanted);
    }

    if (targetLevel !== "mixed") {
        pool = pool.filter((q) => normalizeTrBiblioLevel(getTrBiblioQuestionLevel(q)) === targetLevel);
    }

    if (pool.length === 0) {
        const feedback = document.getElementById("tr-biblio-feedback");
        if (feedback) {
            feedback.innerText = "No s'han trobat preguntes per a aquesta combinació.";
            setElementStateColor(feedback, 'error');
        }
        return;
    }

    trBiblioState.activeQuestions = pool
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map((row) => {
            const qText = getTrBiblioQuestionText(row);
            const correct = getTrBiblioCorrectAnswer(row);
            const wrongs = getTrBiblioWrongAnswers(row);
            const options = [correct, ...wrongs].map(sanitizeTrBiblioValue).filter(Boolean);
            const uniqueOptions = [...new Set(options)];

            if (!qText || !correct || uniqueOptions.length < 2) return null;

            const shuffled = [...uniqueOptions].sort(() => Math.random() - 0.5);
            const correctIdx = shuffled.indexOf(correct);

            if (correctIdx < 0) return null;

            return { q: qText, a: shuffled, correct: correctIdx };
        })
        .filter(Boolean);

    if (trBiblioState.activeQuestions.length === 0) {
        const feedback = document.getElementById("tr-biblio-feedback");
        if (feedback) {
            feedback.innerText = "Error en el format de les preguntes.";
            setElementStateColor(feedback, 'error');
        }
        return;
    }

    document.getElementById("tr-biblio-level-selection")?.classList.add("hidden");
    document.getElementById("tr-biblio-quiz-container")?.classList.remove("hidden");

    trBiblioState.currentQ = 0;
    trBiblioState.score = 0;
    trBiblioState.examFinished = false;
    trBiblioState.locked = false;

    showTrBiblioQuestion();
}

/* -----------------------------
   Render Pregunta
----------------------------- */

function showTrBiblioQuestion() {
    const qData = trBiblioState.activeQuestions[trBiblioState.currentQ];
    if (!qData) return;

    document.getElementById("tr-biblio-progress").innerText = `Pregunta ${trBiblioState.currentQ + 1}/${trBiblioState.activeQuestions.length}`;
    document.getElementById("tr-biblio-score").innerText = `Puntuació: ${trBiblioState.score}`;
    document.getElementById("tr-biblio-question-text").innerText = qData.q;

    const optsContainer = document.getElementById("tr-biblio-options");
    optsContainer.innerHTML = "";

    qData.a.forEach((optText, idx) => {
        const btn = document.createElement("button");
        btn.className = "answer-option w-full text-left mb-2";
        btn.innerText = optText;
        btn.onclick = () => handleTrBiblioAnswer(idx);
        optsContainer.appendChild(btn);
    });

    document.getElementById("tr-biblio-feedback").innerText = "";
}

/* -----------------------------
   Resposta
----------------------------- */

function handleTrBiblioAnswer(selectedIndex) {
    if (trBiblioState.locked) return;
    trBiblioState.locked = true;

    const qData = trBiblioState.activeQuestions[trBiblioState.currentQ];
    const isCorrect = selectedIndex === qData.correct;

    const buttons = document.getElementById("tr-biblio-options").querySelectorAll("button");
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === qData.correct) btn.classList.add("correct");
        else if (idx === selectedIndex) btn.classList.add("incorrect");
    });

    const fb = document.getElementById("tr-biblio-feedback");

    if (isCorrect) {
        trBiblioState.score += 10;
        fb.innerText = "Correcte!";
        setElementStateColor(fb, 'success');
    } else {
        fb.innerText = "Incorrecte!";
        setElementStateColor(fb, 'error');
    }

    setTimeout(() => {
        trBiblioState.currentQ++;
        trBiblioState.locked = false;

        if (trBiblioState.currentQ >= trBiblioState.activeQuestions.length) {
            finishTrBiblioGame();
        } else {
            showTrBiblioQuestion();
        }
    }, 1500);
}

/* -----------------------------
   Final Joc
----------------------------- */

async function finishTrBiblioGame() {
    trBiblioState.examFinished = true;
    document.getElementById("tr-biblio-quiz-container").classList.add("hidden");
    document.getElementById("tr-biblio-results").classList.remove("hidden");

    const totalPossible = trBiblioState.activeQuestions.length * 10;
    const percentage = Math.round((trBiblioState.score / totalPossible) * 100);

    document.getElementById("tr-biblio-final-score").innerText = `${trBiblioState.score} / ${totalPossible} (${percentage}%)`;

    let msg = "";
    if (percentage >= 90) msg = "Excel·lent! Domines la bibliografia APA! 🎓";
    else if (percentage >= 70) msg = "Molt bé! Saps com citar les teves fonts. 📚";
    else if (percentage >= 50) msg = "Ho has superat, però cal fixar-se més en els detalls del format. ✍️";
    else msg = "Cal repassar com es fan les cites i la bibliografia. Ànims! 💪";

    document.getElementById("tr-biblio-message").innerText = msg;

    saveTrBiblioResult(percentage);
}

async function saveTrBiblioResult(percentage) {
    if (!state.user) return;

    const resultData = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: 'Treball de Recerca',
        app: 'Bibliografia i cites',
        nivell: trBiblioState.selectedLevel,
        puntuacio: percentage,
        temps_segons: 60,
        feedback_pos: `Tipus: ${trBiblioState.selectedType}`,
        feedback_neg: ""
    };

    callApi('saveResult', resultData).catch(e => console.error("Error guardant resultats TR Biblio: ", e));
}

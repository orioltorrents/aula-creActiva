const BIO_LAB_TOOLS_TIME_LIMIT = 60;
const BIO_LAB_TOOLS_MAX_ROUNDS = 12;

// Mapeig dels IDs del SVG extern als noms que usa el joc
const BIO_LAB_TOOLS_SVG_ID_MAPPING = {
    "encenedor de Bunsen": "bec Bunsen",
    "matràs aforat": "matràs aforat",
    "pipeta": "pipeta",
    "morter": "morter",
    "termòmetre": "termòmetre",
    "matràs d'Erlenmeyer": "matràs d'Erlenmeyer",
    "gradeta": "gradeta",
    "proveta": "proveta",
    "embut": "embut",
    "pinces de metall": "pinces de fusta",
    "pipeta Pasteur": "pipeta Pasteur",
    "vas de precipitats": "vas de precipitats",
    "reixeta": "reixeta"
};

const BIO_LAB_TOOLS_QUESTIONS = [
    { text: "Quin estri serveix per triturar substàncies?", tool: "morter" },
    { text: "On mesuraries amb precisió el volum d'un líquid?", tool: "proveta" },
    { text: "Quin objecte s'utilitza com a suport per escalfar mostres?", tool: "reixeta" },
    { text: "On posaries una mostra per escalfar-la amb el bec Bunsen?", tool: "matràs d'Erlenmeyer" },
    { text: "Quin estri de vidre faries servir per transferir petites quantitats de líquid?", tool: "pipeta" },
    { text: "Quin estri faries servir per posar 2 mL de líquid en un tub d'assaig?", tool: "pipeta Pasteur" },
    { text: "On podries preparar dissolucions?", tool: "vas de precipitats" },
    { text: "Quin objecte serveix per mantenir els tubs d'assaig drets?", tool: "gradeta" },
    { text: "Amb quin estri mesuraries la temperatura d'un líquid?", tool: "termòmetre" },
    { text: "Quin estri ajuda a abocar un líquid sense esquitxos?", tool: "embut" },
    { text: "Quin estri utilitzaries per subjectar un tub d'assaig calent?", tool: "pinces de fusta" },
    { text: "Quin estri fa una flama regulable per escalfar?", tool: "bec Bunsen" }
];

const BIO_LAB_TOOLS_PROMPTS = [
    "Clica el",
    "Selecciona el",
    "On és el",
    "Toca el",
    "Fes clic damunt del"
];

let bioLabToolsState = {
    score: 0,
    round: 0,
    timeLeft: BIO_LAB_TOOLS_TIME_LIMIT,
    targetTool: "",
    timerId: null,
    pendingNextId: null,
    availableQuestions: [],
    svgReady: false
};

function initBioLabToolsGame() {
    resetBioLabToolsGame();

    const start = document.getElementById("bio-lab-tools-start");
    const game = document.getElementById("bio-lab-tools-game");
    const results = document.getElementById("bio-lab-tools-results");
    const form = document.getElementById("bio-lab-tools-form");
    const startFeedback = document.getElementById("bio-lab-tools-start-feedback");

    if (!start || !game || !results || !form) return;

    start.classList.remove("hidden");
    game.classList.add("hidden");
    results.classList.add("hidden");
    if (startFeedback) {
        startFeedback.textContent = "";
        setElementStateColor(startFeedback, "");
    }

    form.removeEventListener("submit", handleBioLabToolsStart);
    form.addEventListener("submit", handleBioLabToolsStart);

    bindBioLabToolsItems();
    
    // Assegurem que l'SVG estigui preparat (esperar si és necessari)
    ensureBioLabToolsSVGReady();
}

function resetBioLabToolsGame() {
    if (bioLabToolsState.timerId) {
        clearInterval(bioLabToolsState.timerId);
    }
    if (bioLabToolsState.pendingNextId) {
        clearTimeout(bioLabToolsState.pendingNextId);
    }

    bioLabToolsState = {
        score: 0,
        round: 0,
        timeLeft: BIO_LAB_TOOLS_TIME_LIMIT,
        targetTool: "",
        timerId: null,
        pendingNextId: null,
        availableQuestions: []
    };

    clearBioLabToolHighlights();
}

function handleBioLabToolsStart(event) {
    event.preventDefault();

    const startFeedback = document.getElementById("bio-lab-tools-start-feedback");
    const feedback = document.getElementById("bio-lab-tools-feedback");
    const playerName = (typeof state !== "undefined" && state.user)
        ? [state.user.nom, state.user.cognoms].filter(Boolean).join(" ").trim() || "Jugador"
        : "Jugador";

    if (startFeedback) {
        startFeedback.textContent = "";
        setElementStateColor(startFeedback, "");
    }
    if (feedback) {
        feedback.textContent = "";
        setElementStateColor(feedback, "");
    }

    bioLabToolsState.playerName = playerName;
    bioLabToolsState.score = 0;
    bioLabToolsState.round = 0;
    bioLabToolsState.timeLeft = BIO_LAB_TOOLS_TIME_LIMIT;
    bioLabToolsState.availableQuestions = [...BIO_LAB_TOOLS_QUESTIONS];

    document.getElementById("bio-lab-tools-start").classList.add("hidden");
    document.getElementById("bio-lab-tools-results").classList.add("hidden");
    document.getElementById("bio-lab-tools-game").classList.remove("hidden");
    document.getElementById("bio-lab-tools-player").textContent = playerName;
    document.getElementById("bio-lab-tools-total").textContent = BIO_LAB_TOOLS_MAX_ROUNDS;

    updateBioLabToolsStats();
    nextBioLabToolsQuestion();
    startBioLabToolsTimer();
}

function bindBioLabToolsItems() {
    const svgContainer = document.getElementById("bio-lab-tools-svg");
    if (!svgContainer) {
        console.warn("No SVG container found for bio-lab-tools");
        return;
    }

    // Si és un <object>, carreguem el SVG extern
    if (svgContainer.tagName === "OBJECT") {
        loadBioLabToolsExternalSVG(svgContainer);
    } else {
        // SVG inline, vinculem els events normalment
        document.querySelectorAll("#bio-lab-tools-svg .bio-lab-tools__item").forEach(item => {
            item.removeEventListener("click", handleBioLabToolsChoice);
            item.removeEventListener("keydown", handleBioLabToolsKeydown);
            item.addEventListener("click", handleBioLabToolsChoice);
            item.addEventListener("keydown", handleBioLabToolsKeydown);
        });
    }
}

function loadBioLabToolsExternalSVG(container) {
    const svgPath = container.getAttribute("data");
    
    fetch(svgPath)
        .then(response => response.text())
        .then(svgText => {
            // Parseamos el SVG
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
            const rootSVG = svgDoc.documentElement;

            // Estableixem els atributs necessaris
            rootSVG.setAttribute("id", "bio-lab-tools-svg");
            rootSVG.setAttribute("class", "bio-lab-tools__scene");
            rootSVG.setAttribute("role", "img");
            rootSVG.setAttribute("aria-label", "Taula amb estris de laboratori");

            // Afegim els atributs data-tool als elements del SVG
            prepareBioLabToolsSVGElements(rootSVG);

            // Reemplaçem el contenedor <object> pel SVG
            container.parentNode.replaceChild(rootSVG, container);

            // Marquem el SVG com a preparat
            bioLabToolsState.svgReady = true;

            // Vinculem els events als elements del SVG
            attachBioLabToolsEventListeners();
        })
        .catch(error => {
            console.error("Error loading bio-lab-tools SVG:", error);
            bioLabToolsState.svgReady = false;
        });
}

function prepareBioLabToolsSVGElements(svgDoc) {
    // Iterem pels IDs del mapeig i afegim els atributs necessaris
    Object.entries(BIO_LAB_TOOLS_SVG_ID_MAPPING).forEach(([svgId, toolName]) => {
        const element = svgDoc.getElementById(svgId);
        if (element) {
            element.setAttribute("class", "bio-lab-tools__item");
            element.setAttribute("data-tool", toolName);
            element.setAttribute("tabindex", "0");
            element.setAttribute("role", "button");
            element.setAttribute("aria-label", toolName);
        }
    });
}

function attachBioLabToolsEventListeners() {
    const svgElement = document.getElementById("bio-lab-tools-svg");
    if (!svgElement) return;

    svgElement.querySelectorAll(".bio-lab-tools__item").forEach(item => {
        item.removeEventListener("click", handleBioLabToolsChoice);
        item.removeEventListener("keydown", handleBioLabToolsKeydown);
        item.addEventListener("click", handleBioLabToolsChoice);
        item.addEventListener("keydown", handleBioLabToolsKeydown);
    });
}

function ensureBioLabToolsSVGReady() {
    const svgContainer = document.getElementById("bio-lab-tools-svg");
    
    // Si ja és un SVG real (inline o carregat), marcar-lo com a preparat
    if (svgContainer && (svgContainer.tagName === "svg" || bioLabToolsState.svgReady)) {
        bioLabToolsState.svgReady = true;
        return;
    }
    
    // Si és un <object>, esperar a que es carregui
    if (svgContainer && svgContainer.tagName === "OBJECT") {
        // Ja s'està carregant a bindBioLabToolsItems(), esperar
        const maxAttempts = 50; // 5 segons màxim
        let attempts = 0;
        
        const checkSVGReady = () => {
            if (bioLabToolsState.svgReady || document.getElementById("bio-lab-tools-svg")?.tagName === "svg") {
                bioLabToolsState.svgReady = true;
                return;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                window.setTimeout(checkSVGReady, 100);
            }
        };
        
        checkSVGReady();
    }
}


function handleBioLabToolsKeydown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleBioLabToolsChoice(event);
}

function nextBioLabToolsQuestion() {
    bioLabToolsState.pendingNextId = null;

    if (bioLabToolsState.round >= BIO_LAB_TOOLS_MAX_ROUNDS) {
        endBioLabToolsGame();
        return;
    }

    clearBioLabToolHighlights();
    bioLabToolsState.round += 1;

    const useRealQuestion = Math.random() < 0.75 && bioLabToolsState.availableQuestions.length > 0;

    if (useRealQuestion) {
        const questionIndex = Math.floor(Math.random() * bioLabToolsState.availableQuestions.length);
        const current = bioLabToolsState.availableQuestions.splice(questionIndex, 1)[0];
        bioLabToolsState.targetTool = current.tool;
        document.getElementById("bio-lab-tools-question").textContent = current.text;
    } else {
        const items = [...document.querySelectorAll("#bio-lab-tools-svg .bio-lab-tools__item")];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const toolName = randomItem.dataset.tool;
        const prompt = BIO_LAB_TOOLS_PROMPTS[Math.floor(Math.random() * BIO_LAB_TOOLS_PROMPTS.length)];

        bioLabToolsState.targetTool = toolName;
        document.getElementById("bio-lab-tools-question").textContent = `${prompt} ${toolName}.`;
    }

    const feedback = document.getElementById("bio-lab-tools-feedback");
    feedback.textContent = "";
    setElementStateColor(feedback, "");
    updateBioLabToolsStats();
}

function handleBioLabToolsChoice(event) {
    if (!bioLabToolsState.targetTool) return;

    const item = event.currentTarget;
    const selectedTool = item.dataset.tool;
    const feedback = document.getElementById("bio-lab-tools-feedback");
    const isCorrect = selectedTool === bioLabToolsState.targetTool;

    clearBioLabToolHighlights();

    if (isCorrect) {
        bioLabToolsState.score += 1;
        item.classList.add("bio-lab-tools__item--correct");
        feedback.textContent = "Correcte!";
        setElementStateColor(feedback, "success");
        updateBioLabToolsStats();
        bioLabToolsState.targetTool = "";
        bioLabToolsState.pendingNextId = window.setTimeout(nextBioLabToolsQuestion, 650);
    } else {
        item.classList.add("bio-lab-tools__item--wrong");
        feedback.textContent = "Torna-ho a provar.";
        setElementStateColor(feedback, "error");
    }
}

function startBioLabToolsTimer() {
    const timer = document.getElementById("bio-lab-tools-timer");

    if (bioLabToolsState.timerId) {
        clearInterval(bioLabToolsState.timerId);
    }

    timer.classList.remove("bio-lab-tools__timer--low");
    bioLabToolsState.timerId = window.setInterval(() => {
        bioLabToolsState.timeLeft -= 1;
        updateBioLabToolsStats();

        if (bioLabToolsState.timeLeft <= 10) {
            timer.classList.add("bio-lab-tools__timer--low");
        }

        if (bioLabToolsState.timeLeft <= 0) {
            endBioLabToolsGame();
        }
    }, 1000);
}

function updateBioLabToolsStats() {
    document.getElementById("bio-lab-tools-score").textContent = bioLabToolsState.score;
    document.getElementById("bio-lab-tools-round").textContent = bioLabToolsState.round;
    document.getElementById("bio-lab-tools-timer").textContent = `Temps: ${bioLabToolsState.timeLeft} s`;
}

function clearBioLabToolHighlights() {
    document.querySelectorAll("#bio-lab-tools-svg .bio-lab-tools__item").forEach(item => {
        item.classList.remove("bio-lab-tools__item--correct", "bio-lab-tools__item--wrong");
    });
}

function endBioLabToolsGame() {
    if (bioLabToolsState.timerId) {
        clearInterval(bioLabToolsState.timerId);
        bioLabToolsState.timerId = null;
    }
    if (bioLabToolsState.pendingNextId) {
        clearTimeout(bioLabToolsState.pendingNextId);
        bioLabToolsState.pendingNextId = null;
    }

    bioLabToolsState.targetTool = "";

    const game = document.getElementById("bio-lab-tools-game");
    const results = document.getElementById("bio-lab-tools-results");
    const finalScore = document.getElementById("bio-lab-tools-final-score");
    const message = document.getElementById("bio-lab-tools-message");

    if (!game || !results || !finalScore || !message) return;

    game.classList.add("hidden");
    results.classList.remove("hidden");
    finalScore.textContent = `${bioLabToolsState.score} / ${BIO_LAB_TOOLS_MAX_ROUNDS}`;

    const percentage = Math.round((bioLabToolsState.score / BIO_LAB_TOOLS_MAX_ROUNDS) * 100);
    if (percentage >= 85) {
        message.textContent = "Molt bé! Domines molt bé el material de laboratori.";
    } else if (percentage >= 60) {
        message.textContent = "Bon resultat. Repassa els estris que has dubtat.";
    } else {
        message.textContent = "Cal practicar una mica més els noms i usos dels estris.";
    }

    saveBioLabToolsResult(percentage);
}

function saveBioLabToolsResult(percentage) {
    if (typeof state === "undefined" || !state.user || typeof callApi !== "function") return;

    const timeUsed = BIO_LAB_TOOLS_TIME_LIMIT - Math.max(bioLabToolsState.timeLeft, 0);

    callApi("saveResult", {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject ? state.currentProject.titol : "Biologia",
        app: "Estris de laboratori",
        nivell: "Estàndard",
        puntuacio: percentage,
        temps_segons: timeUsed,
        feedback_pos: `${bioLabToolsState.score} encerts`,
        feedback_neg: ""
    }).catch(error => console.error("Error guardant resultat d'estris de laboratori:", error));
}

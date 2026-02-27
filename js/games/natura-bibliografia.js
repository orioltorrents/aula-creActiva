/**
 * Activitat: BIBLIOGRAFIA I CITES
 * Projecte: Entorns de Natura
 *
 * Headers esperats (Sheet):
 * Tipus de pregunta | Nivell | Pregunta | Correcta | Incorrecta1 | Incorrecta2 | Incorrecta3
 */

let biblioState = {
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

function sanitizeValue(raw) {
  if (raw === undefined || raw === null) return "";
  const s = String(raw).trim();
  if (!s) return "";
  const low = s.toLowerCase();
  if (low === "undefined" || low === "null") return "";
  return s;
}

function findKeyLoose(obj, predicateFn) {
  if (!obj || typeof obj !== "object") return null;
  const keys = Object.keys(obj);
  return keys.find((k) => predicateFn(String(k)));
}

function normalizeKeyName(k) {
  // lower + trim + col·lapsa espais + elimina salts de línia
  return String(k)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .trim();
}

function getByExactOrLooseKey(obj, exactKeys = [], loosePredicates = []) {
  if (!obj || typeof obj !== "object") return "";

  // 1) prova exactes (però tolerant a espais/majúscules)
  const mapNormToReal = {};
  for (const real of Object.keys(obj)) {
    mapNormToReal[normalizeKeyName(real)] = real;
  }

  for (const ek of exactKeys) {
    const real = mapNormToReal[normalizeKeyName(ek)];
    if (real != null) {
      const v = sanitizeValue(obj[real]);
      if (v) return v;
    }
  }

  // 2) prova "loose" (si el backend ha canviat el header)
  for (const pred of loosePredicates) {
    const found = findKeyLoose(obj, (k) => pred(normalizeKeyName(k)));
    if (found) {
      const v = sanitizeValue(obj[found]);
      if (v) return v;
    }
  }

  return "";
}

function getQuestionType(q) {
  // Detecta "Tipus de pregunta" encara que vingui amb espais/salts/variants
  return getByExactOrLooseKey(
    q,
    ["Tipus de pregunta", "Tipus", "type", "tipus", "topic", "tema"],
    [
      (nk) => nk.includes("tipus") && nk.includes("pregunta"),
      (nk) => nk === "tipus de pregunta",
    ]
  );
}

function getQuestionLevel(q) {
  return getByExactOrLooseKey(
    q,
    ["Nivell", "level", "nivell", "dificultat", "dificultad"],
    [(nk) => nk.includes("nivell") || nk.includes("level")]
  );
}

function getQuestionText(q) {
  return getByExactOrLooseKey(
    q,
    ["Pregunta", "question", "q", "pregunta"],
    [(nk) => nk === "pregunta" || nk.includes("pregunta")]
  );
}

function getCorrectAnswer(q) {
  return getByExactOrLooseKey(
    q,
    ["Correcta", "correct", "correctAnswer", "correcta"],
    [(nk) => nk.includes("correct")]
  );
}

function getWrongAnswers(q) {
  const w1 = getByExactOrLooseKey(q, ["Incorrecta1"], [(nk) => nk.includes("incorrecta1") || nk.includes("incorrecta 1")]);
  const w2 = getByExactOrLooseKey(q, ["Incorrecta2"], [(nk) => nk.includes("incorrecta2") || nk.includes("incorrecta 2")]);
  const w3 = getByExactOrLooseKey(q, ["Incorrecta3"], [(nk) => nk.includes("incorrecta3") || nk.includes("incorrecta 3")]);

  // accepta també array si algun dia backend envia options
  const altArrayRaw = q.alternatives ?? q.options ?? q.respostes;
  if (Array.isArray(altArrayRaw)) {
    return altArrayRaw.map(sanitizeValue).filter(Boolean);
  }

  return [w1, w2, w3].map(sanitizeValue).filter(Boolean);
}

/**
 * Normalitza el text per comparar nivells (treu accents i espais)
 */
function normalizeLevel(text) {
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

async function initBiblioGame() {
  // UI Reset
  document.getElementById("natura-activity-biblio")?.classList.remove("hidden");
  document.getElementById("biblio-level-selection")?.classList.add("hidden");

  const topicContainer = document.getElementById("biblio-topic-selection");
  if (topicContainer) {
    topicContainer.classList.remove("hidden");
    topicContainer.innerHTML = "";
  }

  document.getElementById("biblio-quiz-container")?.classList.add("hidden");
  document.getElementById("biblio-results")?.classList.add("hidden");
  document.getElementById("natura-activities-menu")?.classList.add("hidden");

  const feedback = document.getElementById("biblio-feedback");
  if (feedback) {
    feedback.innerText = (typeof i18n !== "undefined" && i18n.t("loading")) || "Carregant dades...";
    feedback.style.color = "var(--text-main)";
  }

  try {
    const response = await callApi("getBiblioQuestions");

    if (response && response.status === "success" && Array.isArray(response.questions)) {
      biblioState.allQuestions = response.questions;

      // DEBUG útil
      console.log("TOTAL preguntes:", response.questions.length);
      console.log("KEYS 1a pregunta:", Object.keys(response.questions[0] || {}));
      console.log("Type ex (fuzzy):", getQuestionType(response.questions[0] || {}));
      console.log("Level ex (fuzzy):", getQuestionLevel(response.questions[0] || {}));

      document.getElementById("biblio-level-selection")?.classList.remove("hidden");
      if (feedback) feedback.innerText = "";

      generateTopicButtons(response.questions);
    } else {
      const errorMsg = response && response.message ? response.message : "Error al carregar dades.";
      if (feedback) {
        feedback.innerText = `Error: ${errorMsg}`;
        feedback.style.color = "var(--error)";
      }
    }
  } catch (e) {
    console.error("Error fetching biblio questions", e);
    if (feedback) {
      feedback.innerText = "Error de connexió.";
      feedback.style.color = "var(--error)";
    }
  }
}

/* -----------------------------
   Botons TIPUS
----------------------------- */

function generateTopicButtons(questions) {
  const container = document.getElementById("biblio-topic-selection");
  if (!container) {
    console.warn("No existeix #biblio-topic-selection al DOM");
    return;
  }

  container.classList.remove("hidden");
  container.innerHTML = "";

  if (!Array.isArray(questions) || questions.length === 0) {
    container.innerHTML = `<p class="text-center">No hi ha preguntes.</p>`;
    return;
  }

  // Recollim tipus únics (filtrant buits/undefined)
  const types = [...new Set(
    questions
      .map(getQuestionType)
      .map(sanitizeValue)
      .filter(Boolean)
  )];

  console.log("Types detectats FINAL:", types);

  const label = document.createElement("p");
  label.className = "font-bold mb-3 text-center";
  label.innerText = "Tria un tipus de pregunta (nivell barrejat):";
  container.appendChild(label);

  const btnWrapper = document.createElement("div");
  btnWrapper.className = "flex flex-wrap justify-center gap-4 mb-6";

  // Botó TOTES
  const allBtn = document.createElement("button");
  allBtn.className = "btn-primary";
  allBtn.style =
    "background-color: var(--primary-color); width:auto; font-size:0.95rem; padding:10px 20px; min-width:120px;";
  allBtn.innerText = "Totes";
  allBtn.onclick = () => startGameWithFilter("all", "mixed");
  btnWrapper.appendChild(allBtn);

  if (types.length === 0) {
    const p = document.createElement("p");
    p.className = "text-center";
    p.innerText =
      "No detecto cap valor a 'Tipus de pregunta' a les dades que arriben del backend. Mira la consola (KEYS 1a pregunta).";
    container.appendChild(p);
    container.appendChild(btnWrapper);
    return;
  }

  // Botons per cada tipus
  types.forEach((type) => {
    const btn = document.createElement("button");
    btn.className = "btn-primary";
    btn.style =
      "background-color: var(--primary-color); width:auto; font-size:0.95rem; padding:10px 20px; min-width:120px;";
    btn.innerText = type;
    btn.onclick = () => startGameWithFilter(type, "mixed");
    btnWrapper.appendChild(btn);
  });

  container.appendChild(btnWrapper);
}

/* -----------------------------
   Inici joc + filtre
----------------------------- */

function startGameWithFilter(type = "all", level = "mixed") {
  biblioState.selectedType = type;
  biblioState.selectedLevel = level;

  let pool = [...biblioState.allQuestions];
  const targetLevel = normalizeLevel(level);

  // Filtre per tipus
  if (type !== "all") {
    const wanted = sanitizeValue(type);
    pool = pool.filter((q) => sanitizeValue(getQuestionType(q)) === wanted);
  }

  // Filtre per nivell (si algun dia l'uses)
  if (targetLevel !== "mixed") {
    pool = pool.filter((q) => normalizeLevel(getQuestionLevel(q)) === targetLevel);
  }

  if (pool.length === 0) {
    const feedback = document.getElementById("biblio-feedback");
    if (feedback) {
      feedback.innerText = `No s'han trobat preguntes per a aquesta combinació.`;
      feedback.style.color = "var(--error)";
    }
    return;
  }

  // Construim preguntes amb el teu format de headers
  biblioState.activeQuestions = pool
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
    .map((row) => {
      const qText = getQuestionText(row);
      const correct = getCorrectAnswer(row);
      const wrongs = getWrongAnswers(row);

      const options = [correct, ...wrongs].map(sanitizeValue).filter(Boolean);

      // elimina duplicats
      const uniqueOptions = [...new Set(options)];

      // si no hi ha mínim 2 opcions, descartem
      if (!qText || !correct || uniqueOptions.length < 2) return null;

      const shuffled = [...uniqueOptions].sort(() => Math.random() - 0.5);
      const correctIdx = shuffled.indexOf(correct);

      if (correctIdx < 0) return null;

      return { q: qText, a: shuffled, correct: correctIdx };
    })
    .filter(Boolean);

  if (biblioState.activeQuestions.length === 0) {
    const feedback = document.getElementById("biblio-feedback");
    if (feedback) {
      feedback.innerText =
        "Les preguntes s'han carregat però no encaixen amb el format (Pregunta/Correcta/Incorrecta1..3).";
      feedback.style.color = "var(--error)";
    }
    return;
  }

  // UI start
  document.getElementById("biblio-level-selection")?.classList.add("hidden");
  document.getElementById("biblio-quiz-container")?.classList.remove("hidden");

  biblioState.currentQ = 0;
  biblioState.score = 0;
  biblioState.examFinished = false;
  biblioState.locked = false;

  showBiblioQuestion();
}

/* -----------------------------
   Render Pregunta
----------------------------- */

function showBiblioQuestion() {
  const qData = biblioState.activeQuestions[biblioState.currentQ];
  if (!qData) return;

  document.getElementById("biblio-progress").innerText =
    `${(typeof i18n !== "undefined" && i18n.t("question")) || "Pregunta"} ${biblioState.currentQ + 1}/${biblioState.activeQuestions.length}`;

  document.getElementById("biblio-score").innerText =
    `${(typeof i18n !== "undefined" && i18n.t("score")) || "Puntuació"}: ${biblioState.score}`;

  document.getElementById("biblio-question-text").innerText = qData.q;

  const optsContainer = document.getElementById("biblio-options");
  optsContainer.innerHTML = "";

  qData.a.forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.className = "btn-option w-full text-left mb-2";
    btn.innerText = optText;
    btn.onclick = () => handleBiblioAnswer(idx);
    optsContainer.appendChild(btn);
  });

  document.getElementById("biblio-feedback").innerText = "";
}

/* -----------------------------
   Resposta
----------------------------- */

function handleBiblioAnswer(selectedIndex) {
  if (biblioState.locked) return;
  biblioState.locked = true;

  const qData = biblioState.activeQuestions[biblioState.currentQ];
  const isCorrect = selectedIndex === qData.correct;

  const buttons = document.getElementById("biblio-options").querySelectorAll("button");
  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === qData.correct) btn.classList.add("correct");
    else if (idx === selectedIndex) btn.classList.add("incorrect");
  });

  const fb = document.getElementById("biblio-feedback");

  if (isCorrect) {
    biblioState.score += 10;
    fb.innerText = (typeof i18n !== "undefined" && i18n.t("correct")) || "Correcte!";
    fb.style.color = "var(--success)";
  } else {
    fb.innerText = (typeof i18n !== "undefined" && i18n.t("incorrect")) || "Incorrecte!";
    fb.style.color = "var(--error)";
  }

  setTimeout(() => {
    biblioState.currentQ++;
    biblioState.locked = false;

    if (biblioState.currentQ >= biblioState.activeQuestions.length) {
      finishBiblioGame();
    } else {
      showBiblioQuestion();
    }
  }, 1500);
}

/* -----------------------------
   Final Joc
----------------------------- */

async function finishBiblioGame() {
  biblioState.examFinished = true;
  document.getElementById("biblio-quiz-container").classList.add("hidden");
  document.getElementById("biblio-results").classList.remove("hidden");

  const totalPossible = biblioState.activeQuestions.length * 10;
  const percentage = Math.round((biblioState.score / totalPossible) * 100);

  document.getElementById("biblio-final-score").innerText =
    `${biblioState.score} / ${totalPossible} (${percentage}%)`;

  let msg = "";
  if (percentage >= 90) msg = "Excel·lent! Domines la bibliografia APA! 🎓";
  else if (percentage >= 70) msg = "Molt bé! Saps com citar les teves fonts. 📚";
  else if (percentage >= 50) msg = "Ho has superat, però cal fixar-se més en els detalls del format. ✍️";
  else msg = "Cal repassar com es fan les cites i la bibliografia. Ànims! 💪";

  document.getElementById("biblio-message").innerText = msg;

  // Guardar resultat
  if (typeof saveNaturaResult === "function") {
    let label = (typeof i18n !== "undefined" && i18n.t("act_biblio_title")) || "Bibliografia i cites";
    if (biblioState.selectedType !== "all") label += ` (${biblioState.selectedType})`;
    saveNaturaResult(percentage, label);
  }
}

/* -----------------------------
   Tornar al menú
----------------------------- */

function showNaturaMenuFromBiblio() {
  document.getElementById("natura-activity-biblio").classList.add("hidden");
  document.getElementById("natura-activities-menu").classList.remove("hidden");
  document.getElementById("biblio-level-selection").classList.remove("hidden");
}
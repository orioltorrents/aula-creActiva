// Laboratori de formulació inorgànica: modes Aprèn, Practica i Repte, activitats i progrés.

import { formulaHTML, formulaText } from "./formula.js";
import { buildCatalog, LEVELS, FAMILIES, KINDS, OXOANIONS, ionTable, ionLabel, cationName } from "./nomenclatura.js";
import {
  family, familyWithArticle, shuffle, normalizeName, promptNames, checkName, checkFormula,
  ionChoices, buildFormula, checkBuild, nameDistractors, formulaDistractors, hints,
} from "./exercicis.js";
import { MODULES } from "./aprenentatge.js";

const CHALLENGE_SIZE = 10;
const CHALLENGE_TRIES = 2;
const STORAGE = { settings: "fi_settings_v1", stats: "fi_stats_v1", progress: "fi_progress_v1" };

const ACTIVITIES = [
  { id: "barreja", name: "Barreja", desc: "Tots els tipus d'activitat alternats" },
  { id: "construeix", name: "Construeix amb ions", desc: "Uneix ions fins que la càrrega total sigui zero" },
  { id: "nomFormula", name: "Del nom a la fórmula", desc: "Escriu la fórmula" },
  { id: "formulaNom", name: "De la fórmula al nom", desc: "Escriu el nom" },
  { id: "tria", name: "Tria la resposta", desc: "Quatre opcions, una de correcta" },
  { id: "classifica", name: "Classifica", desc: "Digues a quina família pertany" },
];
const MIX_WEIGHTS = { construeix: 2, nomFormula: 2, formulaNom: 2, tria: 2, classifica: 1 };

const $ = (id) => document.getElementById(id);
const el = {
  levelChips: $("levelChips"),
  familyDropdown: $("familyDropdown"),
  familyTrigger: $("familyTrigger"),
  familyMenu: $("familyMenu"),
  newQuestionBtn: $("newQuestionBtn"),
  ionsBtn: $("ionsBtn"),
  progressBtn: $("progressBtn"),
  projectorBtn: $("projectorBtn"),
  learnView: $("learnView"),
  moduleNav: $("moduleNav"),
  moduleCard: $("moduleCard"),
  practiceView: $("practiceView"),
  qTags: $("qTags"),
  challengeBar: $("challengeBar"),
  statusBox: $("statusBox"),
  statusIcon: $("statusIcon"),
  statusText: $("statusText"),
  qLabel: $("qLabel"),
  qPrompt: $("qPrompt"),
  qKind: $("qKind"),
  workArea: $("workArea"),
  checkBtn: $("checkBtn"),
  hintBtn: $("hintBtn"),
  solutionBtn: $("solutionBtn"),
  nextBtn: $("nextBtn"),
  feedback: $("feedback"),
  activityList: $("activityList"),
  helpBody: $("helpBody"),
  attemptCount: $("attemptCount"),
  correctCount: $("correctCount"),
  streakCount: $("streakCount"),
  infoDialog: $("infoDialog"),
  ionTables: $("ionTables"),
  statCards: $("statCards"),
  levelCards: $("levelCards"),
  familyProgress: $("familyProgress"),
  resetProgressBtn: $("resetProgressBtn"),
  resultDialog: $("resultDialog"),
  resultStars: $("resultStars"),
  resultPoints: $("resultPoints"),
  resultDetail: $("resultDetail"),
  playAgainBtn: $("playAgainBtn"),
  backPracticeBtn: $("backPracticeBtn"),
};

const state = {
  catalog: [],
  mode: "practica",
  settings: { levels: [1], families: [], activity: "barreja", projector: false, module: "m0", infoTab: "ions" },
  stats: { attempts: 0, correct: 0, streak: 0, bestStreak: 0 },
  progress: {},
  bag: [],
  q: null,
  challenge: null,
};

const fm = (formula) => `<span class="fm">${formulaHTML(formula)}</span>`;
const richText = (html) => html.replace(/\[\[(.+?)\]\]/g, (_, f) => fm(f));
const maxLevel = () => Math.max(...state.settings.levels);

/* ---------- Desament al navegador ---------- */

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/* ---------- Escala de la interfície ----------
   Pensada per a 1440 × 800 px útils: s'amplia en pantalles grans i es redueix en portàtils
   perquè tot càpiga sense desplaçar-se. En mòbils (menys de 900 px) no s'escala.
   El mode projector fa servir una base més petita: tot surt més gran. */
const MOBILE_W = 900;
function fitScale() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const [baseW, baseH] = state.settings.projector ? [1200, 680] : [1440, 800];
  let z = Math.min(w / baseW, h / baseH);
  z = Math.min(1.6, Math.max(0.7, Math.floor(z * 20) / 20));
  if (w < MOBILE_W) z = 1;
  document.documentElement.style.setProperty("--ui-zoom", String(z));
  document.documentElement.classList.toggle("is-mobile", w < MOBILE_W);
  document.documentElement.classList.toggle("compact", w >= MOBILE_W && w / z < 1400);
}

/* ---------- Filtres ---------- */

function renderFilters() {
  el.levelChips.innerHTML = LEVELS.map(
    (l) => `<button type="button" class="level-chip l${l.id}" data-level="${l.id}" aria-pressed="${state.settings.levels.includes(l.id)}" title="${l.course}">${l.name}</button>`
  ).join("");
  el.levelChips.querySelectorAll(".level-chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      const id = Number(chip.dataset.level);
      const levels = state.settings.levels.includes(id) ? state.settings.levels.filter((x) => x !== id) : [...state.settings.levels, id];
      if (!levels.length) return;
      state.settings.levels = levels.sort();
      onFiltersChanged();
    })
  );
  el.familyMenu.innerHTML = FAMILIES.map(
    (f) => `<label class="check-row"><input type="checkbox" value="${f.id}" ${state.settings.families.includes(f.id) ? "checked" : ""} />${f.plural}${f.level === 3 ? ' <small class="badge-l3">Batx.</small>' : ""}</label>`
  ).join("");
  el.familyMenu.querySelectorAll("input").forEach((input) =>
    input.addEventListener("change", () => {
      state.settings.families = [...el.familyMenu.querySelectorAll("input:checked")].map((i) => i.value);
      onFiltersChanged();
    })
  );
  const n = state.settings.families.length;
  el.familyTrigger.textContent = n === 0 ? "Totes les famílies" : n === 1 ? family(state.settings.families[0]).plural : `${n} famílies`;
}

function onFiltersChanged() {
  save(STORAGE.settings, state.settings);
  state.bag = [];
  renderFilters();
  if (state.mode === "apren") renderModule();
  else if (state.mode === "repte") startChallenge();
  else newQuestion();
}

function pool() {
  const { levels, families } = state.settings;
  return state.catalog.filter((c) => levels.includes(c.level) && (!families.length || families.includes(c.family)));
}

function renderActivities() {
  el.activityList.innerHTML = ACTIVITIES.map(
    (a) => `<button type="button" role="radio" class="activity-opt" data-activity="${a.id}" aria-checked="${state.settings.activity === a.id}">
        <span class="activity-name">${a.name}</span><span class="activity-desc">${a.desc}</span></button>`
  ).join("");
  el.activityList.querySelectorAll(".activity-opt").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.settings.activity = btn.dataset.activity;
      save(STORAGE.settings, state.settings);
      renderActivities();
      if (state.mode === "practica") newQuestion();
    })
  );
}

/* ---------- Tria de la pregunta ---------- */

function weightedType(comp) {
  const types = Object.entries(MIX_WEIGHTS).filter(([t]) => t !== "construeix" || comp.ions);
  const total = types.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [t, w] of types) {
    r -= w;
    if (r < 0) return t;
  }
  return types[0][0];
}

function nextCompound(filter = () => true) {
  const list = pool().filter(filter);
  if (!list.length) return null;
  // De tant en tant, una substància de la vida quotidiana.
  const daily = list.filter((c) => c.context);
  if (daily.length && Math.random() < 0.3) return daily[Math.floor(Math.random() * daily.length)];
  state.bag = state.bag.filter((id) => list.some((c) => c.id === id));
  if (!state.bag.length) state.bag = shuffle(list.map((c) => c.id));
  const id = state.bag.pop();
  return list.find((c) => c.id === id);
}

function makeQuestion(forcedType) {
  const activity = forcedType ?? (state.settings.activity === "barreja" ? null : state.settings.activity);
  let comp = nextCompound(activity === "construeix" ? (c) => c.ions : undefined);
  let type = activity;
  if (!comp && activity === "construeix") {
    comp = nextCompound();
    type = "nomFormula";
  }
  if (!comp) return null;
  if (!type) type = weightedType(comp);
  const names = promptNames(comp, maxLevel()).filter((n) => type !== "construeix" || !n.kinds.includes("com"));
  const name = (names.length ? names : comp.names)[Math.floor(Math.random() * (names.length || comp.names.length))];
  const q = { comp, type, name, hintStep: 0, solved: false, solutionShown: false, hintsShown: [] };
  if (type === "tria") {
    q.direction = Math.random() < 0.5 ? "toName" : "toFormula";
    const correct = q.direction === "toName" ? name.text : comp.formula;
    const wrong = q.direction === "toName" ? nameDistractors(comp, name.text, state.catalog, maxLevel()) : formulaDistractors(comp, state.catalog, maxLevel());
    q.correct = correct;
    q.options = shuffle([correct, ...wrong]);
    q.disabled = [];
  }
  if (type === "classifica") {
    q.families = FAMILIES.filter((f) => f.level <= maxLevel() || f.id === comp.family).map((f) => f.id);
    q.disabled = [];
  }
  if (type === "construeix") {
    q.choices = ionChoices(comp, maxLevel());
    q.build = { cat: null, an: null, nC: 1, nA: 1 };
  }
  return q;
}

/* ---------- Pintar la pregunta ---------- */

function kindsLabel(kinds) {
  return kinds.map((k) => KINDS[k]).join(" · ");
}

function renderQuestion() {
  const q = state.q;
  const { comp, type } = q;
  const fam = family(comp.family);
  const showFamily = type !== "classifica" || q.solved;
  el.qTags.innerHTML = [
    `<span class="tag activity">${ACTIVITIES.find((a) => a.id === type).name}</span>`,
    showFamily ? `<span class="tag family">${fam.name}</span>` : "",
    `<span class="tag level l${comp.level}">${LEVELS.find((l) => l.id === comp.level).name}</span>`,
  ].join("");

  const nameHTML = `<span class="q-name">${q.name.text}</span>`;
  const formulaPrompt = `<span class="q-formula">${formulaHTML(comp.formula)}</span>`;
  const labels = {
    construeix: ["Construeix el compost amb els ions:", nameHTML, `Nomenclatura: ${kindsLabel(q.name.kinds)}`],
    nomFormula: ["Escriu la fórmula de:", nameHTML, `Nomenclatura: ${kindsLabel(q.name.kinds)}`],
    formulaNom: ["Escriu el nom de:", formulaPrompt, "Pots fer servir qualsevol nomenclatura acceptada."],
    classifica: ["A quina família pertany?", formulaPrompt, ""],
    tria:
      q.direction === "toName"
        ? ["Quin és el nom de:", formulaPrompt, "Tria l'opció correcta."]
        : ["Quina és la fórmula de:", nameHTML, `Nomenclatura: ${kindsLabel(q.name.kinds)}`],
  };
  const [label, prompt, kind] = labels[type];
  el.qLabel.textContent = label;
  el.qPrompt.innerHTML = prompt;
  el.qPrompt.classList.toggle("is-formula", prompt === formulaPrompt);
  el.qKind.textContent = kind;

  const renderers = { construeix: renderBuild, nomFormula: renderFormulaInput, formulaNom: renderNameInput, tria: renderOptions, classifica: renderClassify };
  renderers[type]();
  const autoCheck = type === "tria" || type === "classifica";
  el.checkBtn.hidden = autoCheck;
  renderHelp();
}

function renderFormulaInput() {
  el.workArea.innerHTML = `
    <div class="answer-box">
      <label class="answer-label" for="answerInput">Fórmula</label>
      <input id="answerInput" class="answer-input formula-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Per exemple: Fe2O3" />
      <p class="preview">Es llegeix: <span id="preview" class="fm">—</span></p>
      <p class="input-tip">Escriu els subíndexs com a números normals (H2SO4) i fes servir parèntesis per als grups: Ca(OH)2.</p>
    </div>`;
  const input = $("answerInput");
  const preview = $("preview");
  input.addEventListener("input", () => {
    const v = input.value.replace(/\s+/g, "");
    preview.innerHTML = v ? formulaHTML(v) : "—";
  });
  bindEnter(input);
  focusInput(input);
}

const ACCENT_KEYS = ["à", "è", "é", "í", "ï", "ò", "ó", "ú", "ü", "ç", "l·l", "'", "(", ")", "I", "V"];
function renderNameInput() {
  el.workArea.innerHTML = `
    <div class="answer-box">
      <label class="answer-label" for="answerInput">Nom</label>
      <input id="answerInput" class="answer-input" autocomplete="off" spellcheck="false" placeholder="Per exemple: òxid de ferro(III)" />
      <div class="key-row" aria-label="Caràcters especials">${ACCENT_KEYS.map((k) => `<button type="button" class="key" data-key="${k}">${k}</button>`).join("")}</div>
      <p class="input-tip">El nom comença per la part negativa: clorur <b>de</b> sodi. Els nombres d'oxidació van en xifres romanes: ferro(III).</p>
    </div>`;
  const input = $("answerInput");
  el.workArea.querySelectorAll(".key").forEach((key) =>
    key.addEventListener("click", () => {
      const { selectionStart: a, selectionEnd: b, value } = input;
      input.value = value.slice(0, a) + key.dataset.key + value.slice(b);
      const pos = a + key.dataset.key.length;
      input.focus();
      input.setSelectionRange(pos, pos);
    })
  );
  bindEnter(input);
  focusInput(input);
}

function bindEnter(input) {
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (state.q.solved) handleNext();
    else handleCheck();
  });
}

function focusInput(input) {
  if (!document.documentElement.classList.contains("is-mobile")) requestAnimationFrame(() => input.focus({ preventScroll: true }));
}

function renderOptions() {
  const q = state.q;
  const asFormula = q.direction === "toFormula";
  el.workArea.innerHTML = `<div class="options${asFormula ? " formulas" : ""}">${q.options
    .map((opt, i) => {
      const cls = q.solved && opt === q.correct ? " correct" : q.disabled.includes(opt) ? " wrong" : "";
      return `<button type="button" class="opt${cls}" data-i="${i}" ${q.solved || q.disabled.includes(opt) ? "disabled" : ""}>
        <span class="opt-letter">${"ABCD"[i]}</span><span class="opt-text">${asFormula ? fm(opt) : opt}</span></button>`;
    })
    .join("")}</div>`;
  el.workArea.querySelectorAll(".opt").forEach((btn) => btn.addEventListener("click", () => handleChoice(q.options[Number(btn.dataset.i)])));
}

function renderClassify() {
  const q = state.q;
  el.workArea.innerHTML = `<div class="families">${q.families
    .map((id) => {
      const f = family(id);
      const cls = q.solved && id === q.comp.family ? " correct" : q.disabled.includes(id) ? " wrong" : "";
      return `<button type="button" class="fam-btn${cls}" data-family="${id}" ${q.solved || q.disabled.includes(id) ? "disabled" : ""}>${f.name}</button>`;
    })
    .join("")}</div>`;
  el.workArea.querySelectorAll(".fam-btn").forEach((btn) => btn.addEventListener("click", () => handleChoice(btn.dataset.family)));
}

/* Construeix amb ions */

function ionTileHTML(ion, attrs = "") {
  const sign = ion.charge > 0 ? "pos" : "neg";
  const name = ion.charge > 0 ? cationName(ion) : ion.name;
  return `<button type="button" class="ion-tile ${sign}" ${attrs} aria-label="${formulaText(ionLabel(ion))}, ${name}">${fm(ionLabel(ion))}</button>`;
}

function renderBuild() {
  const q = state.q;
  const { cat, an, nC, nA } = q.build;
  const tray = (list, side, selected) =>
    list.map((ion, i) => ionTileHTML(ion, `data-side="${side}" data-i="${i}" aria-pressed="${selected === ion}" ${q.solved ? "disabled" : ""}`)).join("");
  const plus = cat ? cat.charge * nC : 0;
  const minus = an ? -an.charge * nA : 0;
  const cells = (n, cls) => Array.from({ length: Math.min(n, 24) }, () => `<i class="${cls}"></i>`).join("");
  const total = plus - minus;
  const formula = cat && an ? buildFormula(cat, an, nC, nA) : "";
  const stepper = (side, n, ion) => `
    <div class="stepper">
      <button type="button" class="step-btn" data-step="${side}" data-d="-1" ${!ion || n <= 1 || q.solved ? "disabled" : ""} aria-label="Treu-ne un"><span class="pm minus" aria-hidden="true"></span></button>
      <span class="step-num">${n}</span>
      <button type="button" class="step-btn" data-step="${side}" data-d="1" ${!ion || n >= 6 || q.solved ? "disabled" : ""} aria-label="Afegeix-ne un"><span class="pm plus" aria-hidden="true"></span></button>
    </div>`;
  el.workArea.innerHTML = `
    <div class="build">
      <div class="trays">
        <div class="tray"><span class="tray-label pos">Catió (+)</span><div class="tiles">${tray(q.choices.cations, "cat", cat)}</div></div>
        <div class="tray"><span class="tray-label neg">Anió (−)</span><div class="tiles">${tray(q.choices.anions, "an", an)}</div></div>
      </div>
      <div class="assembly">
        <div class="slot pos">${cat ? fm(ionLabel(cat)) : '<span class="slot-empty">Tria un catió</span>'}<span class="times">×</span>${stepper("cat", nC, cat)}</div>
        <div class="slot neg">${an ? fm(ionLabel(an)) : '<span class="slot-empty">Tria un anió</span>'}<span class="times">×</span>${stepper("an", nA, an)}</div>
        <div class="charge-meter${cat && an && total === 0 ? " zero" : ""}" aria-label="Càrrega total ${total}">
          <div class="meter-row"><span class="meter-label">+${plus}</span><span class="cells">${cells(plus, "p")}</span></div>
          <div class="meter-row"><span class="meter-label">−${minus}</span><span class="cells">${cells(minus, "m")}</span></div>
          <p class="meter-total">Càrrega total: <b>${total > 0 ? "+" : ""}${total}</b>${cat && an && total === 0 ? " ✓" : ""}</p>
        </div>
        <div class="build-formula" aria-live="polite">${formula ? fm(formula) : "<span class='slot-empty'>La fórmula apareixerà aquí</span>"}</div>
      </div>
    </div>`;
  el.workArea.querySelectorAll(".ion-tile[data-side]").forEach((tile) =>
    tile.addEventListener("click", () => {
      const list = tile.dataset.side === "cat" ? q.choices.cations : q.choices.anions;
      q.build[tile.dataset.side] = list[Number(tile.dataset.i)];
      renderBuild();
    })
  );
  el.workArea.querySelectorAll(".step-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const key = btn.dataset.step === "cat" ? "nC" : "nA";
      q.build[key] = Math.min(6, Math.max(1, q.build[key] + Number(btn.dataset.d)));
      renderBuild();
    })
  );
}

/* ---------- Panell d'ajuda ---------- */

const TYPE_TIPS = {
  construeix: ["Tria el catió i l'anió que diu el nom.", "Canvia quants n'hi ha fins que la càrrega total sigui zero.", "Si els dos nombres es poden dividir, simplifica."],
  nomFormula: ["A la fórmula, primer va la part positiva.", "La suma de càrregues ha de ser zero.", "Els grups de més d'un ió van entre parèntesis."],
  formulaNom: ["Primer la part negativa, després «de» + la positiva.", "Si el metall té diverses càrregues, indica-la en xifres romanes.", "També pots fer servir prefixos (di-, tri-…)."],
  tria: ["Llegeix totes les opcions abans de triar.", "Fixa't en els subíndexs, els parèntesis i les terminacions."],
  classifica: ["Mira quins elements hi ha: oxigen? hidrogen? un metall?", "Compta quants elements diferents té."],
};

function compoundCard(comp) {
  const names = comp.names.map((n) => `<li><span class="name-text">${n.text}</span><span class="kind">${kindsLabel(n.kinds)}</span></li>`).join("");
  return `
    <div class="comp-card">
      <div class="comp-formula">${fm(comp.formula)}</div>
      <p class="comp-family">${family(comp.family).name}</p>
      <ul class="name-list">${names}</ul>
      ${comp.note ? `<p class="comp-note">${comp.note}</p>` : ""}
      ${comp.context ? `<p class="comp-context"><b>A la vida real:</b> ${comp.context}</p>` : ""}
    </div>`;
}

function renderHelp() {
  const q = state.q;
  if (!q) {
    el.helpBody.innerHTML = "";
    return;
  }
  if (q.solved) {
    el.helpBody.innerHTML = compoundCard(q.comp);
    return;
  }
  const tips = TYPE_TIPS[q.type].map((t) => `<li>${t}</li>`).join("");
  const given = q.hintsShown.map((h, i) => `<li><b>Pista ${i + 1}.</b> ${h}</li>`).join("");
  el.helpBody.innerHTML = `
    <ul class="tips-list">${tips}</ul>
    ${given ? `<ol class="hints-list">${given}</ol>` : ""}`;
}

/* ---------- Estat, missatges i marcador ---------- */

function setStatus(kind) {
  const map = { idle: ["?", "Sense respondre", ""], ok: ["✓", "Correcte", "ok"], bad: ["✗", "Torna-ho a provar", "bad"] };
  const [icon, text, cls] = map[kind];
  el.statusBox.className = `status ${cls}`;
  el.statusIcon.textContent = icon;
  el.statusText.textContent = text;
}

function setFeedback(html, kind = "neutral") {
  el.feedback.className = `feedback ${kind}`;
  el.feedback.innerHTML = html;
}

function updateScoreboard() {
  el.attemptCount.textContent = state.stats.attempts;
  el.correctCount.textContent = state.stats.correct;
  el.streakCount.textContent = state.stats.streak;
  save(STORAGE.stats, state.stats);
}

function lockControls(solved) {
  el.checkBtn.disabled = solved;
  el.hintBtn.disabled = solved;
  el.solutionBtn.disabled = solved;
  el.nextBtn.hidden = !solved || state.mode === "repte";
  const input = $("answerInput");
  if (input) input.readOnly = solved;
}

/* ---------- Preguntes ---------- */

function newQuestion() {
  const q = makeQuestion();
  state.q = q;
  if (!q) {
    el.qTags.innerHTML = "";
    el.qLabel.textContent = "No hi ha compostos amb aquests filtres.";
    el.qPrompt.innerHTML = "";
    el.qKind.textContent = "Activa un altre nivell (per exemple, Batxillerat) o tria més famílies.";
    el.workArea.innerHTML = "";
    setFeedback("");
    setStatus("idle");
    renderHelp();
    return;
  }
  setStatus("idle");
  setFeedback("");
  renderQuestion();
  lockControls(false);
}

function handleCheck() {
  const q = state.q;
  if (!q || q.solved) return;
  let result;
  if (q.type === "nomFormula") result = checkFormula(q.comp, $("answerInput").value);
  else if (q.type === "formulaNom") result = checkName(q.comp, $("answerInput").value, state.catalog);
  else if (q.type === "construeix") {
    const { cat, an, nC, nA } = q.build;
    result = checkBuild(q.comp, cat, an, nC, nA);
    if (!cat || !an) {
      setFeedback(result.message, "hint");
      return;
    }
  } else return;
  if (/^Escriu/.test(result.message ?? "")) {
    setFeedback(result.message, "hint");
    return;
  }
  if (result.ok) onCorrect(result.note);
  else onWrong(result.message);
}

function handleChoice(value) {
  const q = state.q;
  if (!q || q.solved) return;
  const correct = q.type === "tria" ? value === q.correct : value === q.comp.family;
  if (correct) {
    onCorrect();
    return;
  }
  q.disabled.push(value);
  let message;
  if (q.type === "classifica") {
    const f = family(value);
    message = `No és ${familyWithArticle(value)}. (${f.name}: ${f.rule.charAt(0).toLowerCase()}${f.rule.slice(1)})`;
  }
  else if (q.direction === "toFormula") message = `${formulaText(value)} no és correcta. ${checkFormula(q.comp, value).message}`;
  else message = `«${value}» no és correcte. ${checkName(q.comp, value, state.catalog).message}`;
  onWrong(message);
}

function onWrong(message) {
  state.stats.attempts += 1;
  state.stats.streak = 0;
  updateScoreboard();
  setStatus("bad");
  if (state.mode === "repte") {
    onChallengeMiss(message);
    return;
  }
  setFeedback(message, "error");
  if (state.q.type === "tria") renderOptions();
  if (state.q.type === "classifica") renderClassify();
}

function onCorrect(note) {
  const q = state.q;
  q.solved = true;
  state.stats.attempts += 1;
  setStatus("ok");
  if (q.solutionShown) {
    state.stats.streak = 0;
  } else {
    state.stats.correct += 1;
    state.stats.streak += 1;
    state.stats.bestStreak = Math.max(state.stats.bestStreak ?? 0, state.stats.streak);
    state.progress[q.comp.id] = true;
    save(STORAGE.progress, state.progress);
    celebrate();
  }
  updateScoreboard();
  const others = acceptedNamesShown(q);
  const parts = [`<strong>Molt bé!</strong>`];
  if (note) parts.push(note);
  if (others) parts.push(others);
  if (q.comp.context) parts.push(`<span class="ctx">${q.comp.context}</span>`);
  setFeedback(parts.join(" "), "success");
  renderQuestion();
  lockControls(true);
  if (state.mode === "repte") onChallengeSolved();
  else el.nextBtn.focus({ preventScroll: true });
}

function acceptedNamesShown(q) {
  if (q.type === "classifica") return `${fm(q.comp.formula)} és ${familyWithArticle(q.comp.family)}.`;
  if (q.type === "formulaNom" || (q.type === "tria" && q.direction === "toName")) {
    const list = q.comp.names.map((n) => `«${n.text}»`);
    return list.length > 1 ? `Noms acceptats: ${list.join(", ")}.` : "";
  }
  const others = q.comp.names.filter((n) => normalizeName(n.text) !== normalizeName(q.name.text)).map((n) => `«${n.text}»`);
  return others.length ? `També es pot dir ${others.join(" o ")}.` : "";
}

function handleHint() {
  const q = state.q;
  if (!q || q.solved || state.mode === "repte") return;
  const list = hints(q.comp, q.type === "tria" ? (q.direction === "toName" ? "formulaNom" : "nomFormula") : q.type);
  if (q.hintStep >= list.length) {
    setFeedback("Ja has vist totes les pistes. Si vols, mira la solució.", "hint");
    return;
  }
  const hint = list[q.hintStep];
  q.hintStep += 1;
  q.hintsShown.push(hint);
  setFeedback(`<strong>Pista ${q.hintStep} de ${list.length}:</strong> ${hint}`, "hint");
  renderHelp();
}

function handleSolution() {
  const q = state.q;
  if (!q || q.solved || state.mode === "repte") return;
  q.solutionShown = true;
  q.solved = true;
  state.stats.streak = 0;
  updateScoreboard();
  if (q.type === "construeix") {
    const { cat, an, nC, nA } = q.comp.ions;
    q.build = { cat, an, nC, nA };
  }
  const input = $("answerInput");
  if (input) input.value = q.type === "nomFormula" ? q.comp.formula : q.comp.names[0].text;
  setStatus("idle");
  renderQuestion();
  if (input && $("answerInput")) $("answerInput").value = q.type === "nomFormula" ? q.comp.formula : q.comp.names[0].text;
  setFeedback(`Aquesta és la solució: ${fm(q.comp.formula)} — ${q.comp.names.map((n) => `«${n.text}»`).join(", ")}. No compta com a encert.`, "hint");
  lockControls(true);
}

function handleNext() {
  if (state.mode === "repte") nextChallengeQuestion();
  else newQuestion();
}

/* ---------- Mode Repte ---------- */

function startChallenge() {
  state.challenge = { index: 0, points: 0, results: [], tries: CHALLENGE_TRIES, seen: new Set(), startedAt: Date.now() };
  nextChallengeQuestion(true);
}

function nextChallengeQuestion(first = false) {
  const c = state.challenge;
  if (!first) c.index += 1;
  if (c.index >= CHALLENGE_SIZE) {
    finishChallenge();
    return;
  }
  c.tries = CHALLENGE_TRIES;
  let q = null;
  for (let i = 0; i < 12; i += 1) {
    q = makeQuestion(null);
    if (!q || !c.seen.has(q.comp.id)) break;
  }
  state.q = q;
  if (!q) {
    newQuestion();
    return;
  }
  c.seen.add(q.comp.id);
  setStatus("idle");
  setFeedback("");
  renderQuestion();
  lockControls(false);
  renderChallengeBar();
}

function renderChallengeBar() {
  const c = state.challenge;
  el.challengeBar.hidden = state.mode !== "repte" || !c;
  if (!c) return;
  const dots = Array.from({ length: CHALLENGE_TRIES }, (_, i) => `<i class="${i < c.tries ? "on" : ""}"></i>`).join("");
  el.challengeBar.innerHTML = `
    <span class="cb-item">Pregunta <b>${Math.min(c.index + 1, CHALLENGE_SIZE)}</b> de ${CHALLENGE_SIZE}</span>
    <span class="cb-item">Intents <span class="tries-dots">${dots}</span></span>
    <span class="cb-item"><span class="star-sm">★</span> <b>${c.points}</b> punts</span>`;
}

function onChallengeMiss(message) {
  const c = state.challenge;
  c.tries -= 1;
  renderChallengeBar();
  if (c.tries > 0) {
    setFeedback(`${message} <strong>Et queda un intent.</strong>`, "error");
    if (state.q.type === "tria") renderOptions();
    if (state.q.type === "classifica") renderClassify();
    return;
  }
  const q = state.q;
  q.solved = true;
  q.solutionShown = true;
  c.results.push(0);
  if (q.type === "construeix") q.build = { ...q.comp.ions };
  renderQuestion();
  setFeedback(`${message} La resposta era ${fm(q.comp.formula)}: ${q.comp.names.map((n) => `«${n.text}»`).join(", ")}.`, "error");
  lockControls(true);
  showChallengeNext();
}

function onChallengeSolved() {
  const c = state.challenge;
  const pts = c.tries === CHALLENGE_TRIES ? 2 : 1;
  c.points += pts;
  c.results.push(pts);
  renderChallengeBar();
  el.feedback.insertAdjacentHTML("afterbegin", `<b class="pts">+${pts} ${pts === 1 ? "punt" : "punts"}</b> `);
  showChallengeNext();
}

function showChallengeNext() {
  el.nextBtn.hidden = false;
  el.nextBtn.innerHTML = `${state.challenge.index + 1 >= CHALLENGE_SIZE ? "Mostra el resultat" : "Següent pregunta"} <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  el.nextBtn.focus({ preventScroll: true });
}

function bridgeResultStatus(text, kind = "neutral") {
  let status = $("aulaCreActivaSaveStatus");
  if (!status) {
    status = document.createElement("p");
    status.id = "aulaCreActivaSaveStatus";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    el.resultDetail.insertAdjacentElement("afterend", status);
  }
  status.className = `bridge-save-status ${kind}`;
  status.textContent = text;
}

async function reportChallengeResult(payload) {
  const parent = window.parent !== window ? window.parent : null;
  const bridge = parent?.aulaCreActivaSaveFormulacioResult;
  if (typeof bridge !== "function") return;

  bridgeResultStatus("Desant el resultat a Aula CreActiva…");
  try {
    const response = await bridge(payload);
    if (!response || response.status !== "success") throw new Error(response?.message || "Resultat no confirmat");
    bridgeResultStatus("Resultat desat amb l’alumne actual.", "success");
  } catch (error) {
    console.error("No s’ha pogut desar el repte a Aula CreActiva:", error);
    bridgeResultStatus("No s’ha pogut desar el resultat. Torna-ho a provar.", "error");
  }
}

function finishChallenge() {
  const c = state.challenge;
  const max = CHALLENGE_SIZE * 2;
  const ratio = c.points / max;
  const stars = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
  el.resultStars.innerHTML = [1, 2, 3].map((i) => `<span class="${i <= stars ? "on" : ""}">★</span>`).join("");
  el.resultPoints.textContent = `${c.points} punts de ${max}`;
  const first = c.results.filter((p) => p === 2).length;
  const second = c.results.filter((p) => p === 1).length;
  el.resultDetail.textContent = `${first} a la primera, ${second} a la segona i ${CHALLENGE_SIZE - first - second} sense encertar. Encertar a la primera val 2 punts; a la segona, 1.`;
  el.resultDialog.showModal();
  const missed = CHALLENGE_SIZE - first - second;
  const attempts = first + (second * 2) + (missed * CHALLENGE_TRIES);
  void reportChallengeResult({
    mode: "repte",
    points: c.points,
    maxPoints: max,
    stars,
    attempts,
    firstCorrect: first,
    secondCorrect: second,
    missed,
    elapsedSeconds: Math.round((Date.now() - (state.challenge?.startedAt || Date.now())) / 1000),
    levels: [...state.settings.levels],
    families: [...state.settings.families],
    activity: state.settings.activity,
    results: [...c.results],
  });
  if (stars >= 2) celebrate();
}

/* ---------- Modes ---------- */

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    const on = tab.dataset.mode === mode;
    tab.classList.toggle("active", on);
    tab.setAttribute("aria-selected", String(on));
  });
  el.learnView.hidden = mode !== "apren";
  el.practiceView.hidden = mode === "apren";
  el.newQuestionBtn.hidden = mode === "apren";
  el.newQuestionBtn.textContent = mode === "repte" ? "Nou repte" : "Nova pregunta";
  el.hintBtn.hidden = mode === "repte";
  el.solutionBtn.hidden = mode === "repte";
  document.querySelector(".activity-panel").hidden = mode === "repte";
  el.nextBtn.innerHTML = `Següent pregunta <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  if (mode === "apren") {
    state.challenge = null;
    renderModule();
  } else if (mode === "repte") {
    startChallenge();
  } else {
    state.challenge = null;
    renderChallengeBar();
    newQuestion();
  }
}

/* ---------- Mode Aprèn ---------- */

function renderModule() {
  const current = MODULES.find((m) => m.id === state.settings.module) ?? MODULES[0];
  el.moduleNav.innerHTML = `<h2 class="panel-title">Mòduls</h2>${MODULES.map(
    (m) => `<button type="button" class="module-link${m === current ? " active" : ""}" data-module="${m.id}" aria-current="${m === current}">
      <span class="module-num">${m.num}</span><span class="module-title">${m.title}</span>${m.level > 1 ? `<span class="tag level l${m.level}">${LEVELS[m.level - 1].name}</span>` : ""}</button>`
  ).join("")}`;
  el.moduleNav.querySelectorAll(".module-link").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.settings.module = btn.dataset.module;
      save(STORAGE.settings, state.settings);
      renderModule();
      el.moduleCard.scrollTop = 0;
    })
  );

  const cards = current.cards
    .map(
      (c) => `<section class="learn-box${c.level === 3 ? " batx" : ""}">
        <h3>${c.title}${c.level === 3 ? ' <span class="tag level l3">Batxillerat</span>' : ""}</h3>${richText(c.html)}</section>`
    )
    .join("");
  const examples = current.examples.length
    ? `<h3 class="pane-title">Exemples</h3>
       <div class="example-table">${current.examples
         .map((f) => state.catalog.find((c) => c.formula === f))
         .filter(Boolean)
         .map(
           (c) => `<div class="example-row"><span class="ex-formula">${fm(c.formula)}</span>
             <span class="ex-names">${c.names.filter((n) => n.level <= Math.max(maxLevel(), 2)).map((n) => `<span class="ex-name">${n.text}<small>${kindsLabel(n.kinds)}</small></span>`).join("")}</span></div>`
         )
         .join("")}</div>`
    : "";
  const acidTable = current.acidTable
    ? `<h3 class="pane-title">Taula d'oxoàcids</h3>
       <div class="acid-table">${OXOANIONS.filter((a) => a.level <= maxLevel())
         .map((a) => {
           const acid = state.catalog.find((c) => c.family === "oxoacid" && c.ions?.an === a);
           return `<div class="acid-row"><span>${fm(acid.formula)}</span><span>àcid ${a.acid}</span><span>${fm(ionLabel(a))}</span><span>${a.name}</span></div>`;
         })
         .join("")}</div>
       ${maxLevel() < 3 ? '<p class="muted">Activa el nivell Batxillerat per veure també els oxoàcids del brom, el iode, el seleni, el crom i el manganès.</p>' : ""}`
    : "";
  const gallery = current.gallery
    ? `<div class="gallery">${state.catalog
        .filter((c) => c.context && state.settings.levels.includes(c.level))
        .map((c) => `<div class="gallery-card"><span class="g-formula">${fm(c.formula)}</span><span class="g-name">${c.names[0].text}</span><span class="g-ctx">${c.context}</span></div>`)
        .join("")}</div>`
    : "";
  const errors = current.errors.length
    ? `<section class="learn-box errors"><h3>Errors habituals</h3><ul>${current.errors.map((e) => `<li>${richText(e)}</li>`).join("")}</ul></section>`
    : "";
  const idx = MODULES.indexOf(current);
  const practice = current.families.length
    ? `<button type="button" class="primary-btn" id="practiseModuleBtn">Practica aquest mòdul</button>`
    : current.gallery
      ? `<button type="button" class="primary-btn" id="practiseDailyBtn">Practica amb aquestes substàncies</button>`
      : "";
  el.moduleCard.innerHTML = `
    <header class="learn-head">
      <span class="learn-kicker">Mòdul ${current.num}</span>
      <h2>${current.title}</h2>
      <p class="learn-intro">${richText(current.intro)}</p>
    </header>
    <div class="learn-boxes">${cards}</div>
    ${acidTable}${examples}${gallery}${errors}
    <footer class="learn-foot">
      ${idx > 0 ? `<button type="button" class="action-btn ghost" data-go="${MODULES[idx - 1].id}">← ${MODULES[idx - 1].title}</button>` : "<span></span>"}
      ${practice}
      ${idx < MODULES.length - 1 ? `<button type="button" class="action-btn ghost" data-go="${MODULES[idx + 1].id}">${MODULES[idx + 1].title} →</button>` : "<span></span>"}
    </footer>`;
  el.moduleCard.querySelectorAll("[data-go]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.settings.module = btn.dataset.go;
      save(STORAGE.settings, state.settings);
      renderModule();
      el.moduleCard.scrollTop = 0;
    })
  );
  $("practiseModuleBtn")?.addEventListener("click", () => {
    state.settings.families = [...current.families];
    if (current.level > Math.max(...state.settings.levels)) state.settings.levels = [...new Set([...state.settings.levels, current.level])].sort();
    save(STORAGE.settings, state.settings);
    state.bag = [];
    renderFilters();
    setMode("practica");
  });
  $("practiseDailyBtn")?.addEventListener("click", () => {
    state.settings.families = [];
    save(STORAGE.settings, state.settings);
    renderFilters();
    setMode("practica");
  });
}

/* ---------- Diàleg: taula d'ions i progrés ---------- */

function renderIonTables() {
  const { cations, monoAnions, polyAnions } = ionTable();
  const row = (ion, name, extra = "") =>
    `<div class="ion-row${ion.level === 3 ? " batx" : ""}"><span class="ion-f">${fm(ionLabel(ion))}</span><span class="ion-n">${name}</span>${extra}</div>`;
  const acidOf = (a) => (a.acid ? `<span class="ion-x">de l'àcid ${a.acid}</span>` : "");
  el.ionTables.innerHTML = `
    <div class="ion-columns">
      <section><h3 class="pane-title pos">Cations</h3>${cations.map((c) => row(c, cationName(c))).join("")}</section>
      <section><h3 class="pane-title neg">Anions monoatòmics</h3>${monoAnions.map((a) => row(a, a.name)).join("")}
        <p class="muted small">Els anions d'un sol element acaben en <b class="nowrap">-ur</b>, excepte l'òxid.</p></section>
      <section class="wide"><h3 class="pane-title neg">Anions poliatòmics</h3><div class="ion-grid">${polyAnions.map((a) => row(a, a.name, acidOf(a))).join("")}</div></section>
    </div>
    <p class="muted small">Els ions marcats amb fons lila són de batxillerat.</p>`;
}

const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);

function renderProgress() {
  const solved = state.catalog.filter((c) => state.progress[c.id]);
  const { attempts, correct, bestStreak = 0, streak } = state.stats;
  const cards = [
    ["Compostos resolts", solved.length, "blue"],
    ["Encerts", correct, "green"],
    ["Intents", attempts, "slate"],
    ["Precisió", attempts ? `${pct(correct, attempts)}<small>%</small>` : "—", "amber"],
    ["Millor ratxa", Math.max(bestStreak, streak), "violet"],
  ];
  el.statCards.innerHTML = cards
    .map(([label, value, tone]) => `<div class="stat-card ${tone}"><span class="stat-value">${value}</span><span class="stat-label">${label}</span></div>`)
    .join("");
  el.levelCards.innerHTML = LEVELS.map((level) => {
    const list = state.catalog.filter((c) => c.level === level.id);
    const done = list.filter((c) => state.progress[c.id]).length;
    const p = pct(done, list.length);
    return `<div class="level-card l${level.id}">
        <div class="ring" style="--p:${Math.max(p, done ? 2 : 0)}" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${list.length}" aria-label="${level.name}"><span>${p}%</span></div>
        <div class="level-info"><strong>${level.name}</strong><span class="level-num">${done}/${list.length}</span><small>${level.course}</small></div>
      </div>`;
  }).join("");
  el.familyProgress.innerHTML = FAMILIES.map((f) => {
    const list = state.catalog.filter((c) => c.family === f.id);
    const done = list.filter((c) => state.progress[c.id]).length;
    return `<div class="progress-row"><span class="progress-name">${f.plural}</span>
        <div class="progress-track" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${list.length}" aria-label="${f.plural}"><span style="width:${Math.max(pct(done, list.length), done ? 2 : 0)}%"></span></div>
        <span class="progress-num">${done}/${list.length}</span></div>`;
  }).join("");
}

function showInfoTab(tab) {
  document.querySelectorAll(".info-tab").forEach((btn) => {
    const on = btn.dataset.tab === tab;
    btn.setAttribute("aria-selected", String(on));
    btn.tabIndex = on ? 0 : -1;
  });
  document.querySelectorAll(".info-pane").forEach((pane) => {
    pane.hidden = pane.id !== `pane-${tab}`;
  });
  el.infoDialog.querySelector(".info-body").scrollTop = 0;
  state.settings.infoTab = tab;
  save(STORAGE.settings, state.settings);
}

function openInfo(tab) {
  if (!el.ionTables.childElementCount) renderIonTables();
  renderProgress();
  showInfoTab(tab);
  el.infoDialog.showModal();
}

/* ---------- Celebració ---------- */

function celebrate() {
  try {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch {}
  const box = document.createElement("div");
  box.className = "confetti";
  box.setAttribute("aria-hidden", "true");
  const colors = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];
  for (let i = 0; i < 40; i += 1) {
    const piece = document.createElement("i");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    piece.style.setProperty("--dx", `${Math.random() * 160 - 80}px`);
    piece.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
    box.appendChild(piece);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2000);
}

/* ---------- Esdeveniments ---------- */

function applyProjector() {
  document.documentElement.classList.toggle("projector", state.settings.projector);
  el.projectorBtn.setAttribute("aria-pressed", String(state.settings.projector));
  fitScale();
}

function attachEvents() {
  el.newQuestionBtn.addEventListener("click", () => (state.mode === "repte" ? startChallenge() : newQuestion()));
  el.checkBtn.addEventListener("click", handleCheck);
  el.hintBtn.addEventListener("click", handleHint);
  el.solutionBtn.addEventListener("click", handleSolution);
  el.nextBtn.addEventListener("click", handleNext);

  document.querySelectorAll(".mode-tab").forEach((tab) =>
    tab.addEventListener("click", () => {
      if (tab.dataset.mode !== state.mode) setMode(tab.dataset.mode);
    })
  );

  el.familyTrigger.addEventListener("click", () => {
    const open = el.familyDropdown.classList.toggle("open");
    el.familyTrigger.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (event) => {
    if (!el.familyDropdown.contains(event.target)) {
      el.familyDropdown.classList.remove("open");
      el.familyTrigger.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") el.familyDropdown.classList.remove("open");
  });

  el.projectorBtn.addEventListener("click", () => {
    state.settings.projector = !state.settings.projector;
    save(STORAGE.settings, state.settings);
    applyProjector();
  });

  el.ionsBtn.addEventListener("click", () => openInfo("ions"));
  el.progressBtn.addEventListener("click", () => openInfo("progres"));
  const tabs = [...document.querySelectorAll(".info-tab")];
  tabs.forEach((btn, i) => {
    btn.addEventListener("click", () => showInfoTab(btn.dataset.tab));
    btn.addEventListener("keydown", (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      const next = tabs[(i + step + tabs.length) % tabs.length];
      showInfoTab(next.dataset.tab);
      next.focus();
    });
  });

  let resetArmed = false;
  el.resetProgressBtn.addEventListener("click", () => {
    if (!resetArmed) {
      resetArmed = true;
      el.resetProgressBtn.textContent = "Segur? Torna-hi a clicar per esborrar-ho";
      return;
    }
    resetArmed = false;
    el.resetProgressBtn.textContent = "Esborra el progrés i el marcador";
    state.progress = {};
    state.stats = { attempts: 0, correct: 0, streak: 0, bestStreak: 0 };
    save(STORAGE.progress, state.progress);
    updateScoreboard();
    renderProgress();
  });

  document.querySelectorAll("dialog").forEach((dialog) =>
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.closest("[data-close]")) dialog.close();
    })
  );

  el.playAgainBtn.addEventListener("click", () => {
    el.resultDialog.close();
    startChallenge();
  });
  el.backPracticeBtn.addEventListener("click", () => {
    el.resultDialog.close();
    setMode("practica");
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitScale, 60);
  });
}

function init() {
  state.settings = load(STORAGE.settings, state.settings);
  state.stats = load(STORAGE.stats, state.stats);
  state.progress = load(STORAGE.progress, {});
  state.catalog = buildCatalog();
  applyProjector();
  renderFilters();
  renderActivities();
  attachEvents();
  updateScoreboard();
  setMode("practica");
}

init();

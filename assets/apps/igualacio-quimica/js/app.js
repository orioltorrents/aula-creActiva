// Laboratori d'igualació d'equacions: interfície, modes Practica i Repte, ajudes visuals i progrés.

import { analyse, parseFormula, equationElements, hasIons, formulaHTML, formulaText } from "./chem.js";
import { moleculeSVG, elementColor, elementName } from "./molecules.js";

const CONFIG_URL = "data/config.json";
const MAX_DRAWN = 30;
const CHALLENGE_SIZE = 5;
const CHALLENGE_TRIES = 2;
const STORAGE = { settings: "iq_settings_v2", stats: "iq_stats_v2", progress: "iq_progress_v2" };

const $ = (id) => document.getElementById(id);
const el = {
  levelChips: $("levelChips"),
  typeTrigger: $("typeTrigger"),
  typeMenu: $("typeMenu"),
  typeDropdown: $("typeDropdown"),
  newEquationBtn: $("newEquationBtn"),
  projectorBtn: $("projectorBtn"),
  infoBtn: $("infoBtn"),
  eqTags: $("eqTags"),
  challengeBar: $("challengeBar"),
  statusBox: $("statusBox"),
  statusIcon: $("statusIcon"),
  statusText: $("statusText"),
  scene: $("scene"),
  reactantCols: $("reactantCols"),
  productCols: $("productCols"),
  checkBtn: $("checkBtn"),
  hintBtn: $("hintBtn"),
  resetBtn: $("resetBtn"),
  solutionBtn: $("solutionBtn"),
  nextBtn: $("nextBtn"),
  feedback: $("feedback"),
  aidBody: $("aidBody"),
  legend: $("legend"),
  attemptCount: $("attemptCount"),
  correctCount: $("correctCount"),
  streakCount: $("streakCount"),
  infoDialog: $("infoDialog"),
  guideSteps: $("guideSteps"),
  guideRules: $("guideRules"),
  typeCards: $("typeCards"),
  statCards: $("statCards"),
  levelCards: $("levelCards"),
  typeProgress: $("typeProgress"),
  resetProgressBtn: $("resetProgressBtn"),
  resultDialog: $("resultDialog"),
  resultStars: $("resultStars"),
  resultPoints: $("resultPoints"),
  resultDetail: $("resultDetail"),
  playAgainBtn: $("playAgainBtn"),
  backPracticeBtn: $("backPracticeBtn"),
  confirmDialog: $("confirmDialog"),
  confirmYes: $("confirmYes"),
  confirmNo: $("confirmNo"),
};

const state = {
  config: null,
  equations: [],
  pool: [],
  bag: [],
  seenAll: false,
  mode: "practica",
  current: null,
  coefs: [],
  solved: false,
  solutionShown: false,
  hintStep: 0,
  settings: { aid: "barres", projector: false, showTimer: false, levels: [1, 2, 3], types: [], infoTab: "metode" },
  stats: { attempts: 0, correct: 0, streak: 0, bestStreak: 0 },
  progress: {},
  challenge: null,
};

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
   Pensada per a 1440 × 800 px útils: s'amplia en pantalles grans (1920 × 1080)
   i es redueix en portàtils (1366 × 740) perquè tot càpiga sense desplaçar-se.
   En mòbils (menys de 900 px d'amplada) no s'escala i la pàgina fa desplaçament.
   El mode projector fa servir una base més petita: tot surt més gran.
   Amb equacions molt llargues (6 substàncies o 5 elements), el projector
   amplia una mica menys perquè les columnes i el recompte d'àtoms hi càpiguen. */
const MOBILE_W = 900;
function isLongEquation(eq) {
  return Boolean(eq) && (eq.reactants.length + eq.products.length >= 6 || equationElements(eq).length >= 5);
}

function fitScale() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  let [baseW, baseH] = [1440, 800];
  if (state.settings.projector) [baseW, baseH] = isLongEquation(state.current) ? [1320, 740] : [1180, 660];
  let z = Math.min(w / baseW, h / baseH);
  z = Math.min(1.6, Math.max(0.7, Math.floor(z * 20) / 20));
  if (w < MOBILE_W) z = 1;
  document.documentElement.style.setProperty("--ui-zoom", String(z));
  document.documentElement.classList.toggle("is-mobile", w < MOBILE_W);
  // Amb poca amplada efectiva (projector en portàtils), la barra superior s'escurça.
  document.documentElement.classList.toggle("compact", w >= MOBILE_W && w / z < 1400);
  requestAnimationFrame(fitAllBuckets);
}

/* ---------- Dades ---------- */

async function loadData() {
  const response = await fetch(CONFIG_URL);
  if (!response.ok) throw new Error("No s'ha pogut carregar la configuració.");
  state.config = await response.json();
  const lists = await Promise.all(
    state.config.dataFiles.map((url) =>
      fetch(url)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => [])
    )
  );
  state.equations = lists.flat();
}

const levelInfo = (id) => state.config.levels.find((l) => l.id === id);
const typeInfo = (id) => state.config.types.find((t) => t.id === id);

function applyFilters() {
  const { levels, types } = state.settings;
  state.pool = state.equations.filter(
    (eq) => levels.includes(eq.level) && (!types.length || types.includes(eq.type))
  );
  state.bag = [];
  state.seenAll = false;
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Equacions sense repetir fins que s'han fet totes les del filtre.
function nextFromBag() {
  let restarted = false;
  if (!state.bag.length) {
    restarted = state.seenAll && state.pool.length > 1;
    state.bag = shuffle(state.pool.filter((eq) => eq !== state.current));
    if (!state.bag.length) state.bag = state.pool.slice();
  }
  const eq = state.bag.pop();
  state.seenAll = state.bag.length === 0;
  return { eq, restarted };
}

/* ---------- Filtres ---------- */

function renderFilters() {
  el.levelChips.innerHTML = "";
  state.config.levels.forEach((level) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `level-chip l${level.id}`;
    chip.textContent = level.name;
    chip.title = level.description;
    chip.setAttribute("aria-pressed", String(state.settings.levels.includes(level.id)));
    chip.addEventListener("click", () => {
      const set = new Set(state.settings.levels);
      if (set.has(level.id)) {
        if (set.size === 1) return;
        set.delete(level.id);
      } else {
        set.add(level.id);
      }
      state.settings.levels = [...set].sort();
      onFiltersChanged();
    });
    el.levelChips.appendChild(chip);
  });

  el.typeMenu.innerHTML = "";
  state.config.types.forEach((type) => {
    const label = document.createElement("label");
    label.className = "check-row";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = type.id;
    input.checked = !state.settings.types.length || state.settings.types.includes(type.id);
    input.addEventListener("change", () => {
      const checked = [...el.typeMenu.querySelectorAll("input:checked")].map((i) => i.value);
      if (!checked.length) {
        input.checked = true;
        return;
      }
      state.settings.types = checked.length === state.config.types.length ? [] : checked;
      onFiltersChanged({ keepMenu: true });
    });
    const span = document.createElement("span");
    span.textContent = type.name;
    label.append(input, span);
    el.typeMenu.appendChild(label);
  });
  updateTypeTrigger();
}

function updateTypeTrigger() {
  const { types } = state.settings;
  el.typeTrigger.textContent = !types.length
    ? "Tots els tipus"
    : types.length === 1
    ? typeInfo(types[0]).name
    : `${types.length} tipus`;
}

function onFiltersChanged({ keepMenu = false } = {}) {
  save(STORAGE.settings, state.settings);
  if (keepMenu) {
    updateTypeTrigger();
    el.levelChips.querySelectorAll(".level-chip").forEach((chip, i) => {
      chip.setAttribute("aria-pressed", String(state.settings.levels.includes(state.config.levels[i].id)));
    });
  } else {
    renderFilters();
  }
  applyFilters();
  if (!state.pool.length) {
    showEmpty();
    return;
  }
  if (state.mode === "repte") startChallenge();
  else newEquation();
}

function showEmpty() {
  state.current = null;
  el.reactantCols.innerHTML = "";
  el.productCols.innerHTML = "";
  el.eqTags.innerHTML = "";
  el.aidBody.innerHTML = "";
  el.legend.innerHTML = "";
  setFeedback("No hi ha cap equació amb aquests filtres. Tria més nivells o tipus.", "error");
  lockControls(true);
}

/* ---------- Equació actual ---------- */

function loadEquation(eq) {
  state.current = eq;
  state.coefs = Array(eq.reactants.length + eq.products.length).fill(1);
  state.solved = false;
  state.solutionShown = false;
  state.hintStep = 0;
  renderEquation();
  lockControls(false);
  setStatus("idle");
  setFeedback("", "neutral");
  el.nextBtn.hidden = true;
}

function newEquation() {
  if (!state.pool.length) return showEmpty();
  const { eq, restarted } = nextFromBag();
  loadEquation(eq);
  if (restarted) setFeedback("Ja has vist totes les equacions d'aquest filtre. Tornem a començar!", "hint");
}

function renderEquation() {
  const eq = state.current;
  const level = levelInfo(eq.level);
  const type = typeInfo(eq.type);
  el.eqTags.innerHTML =
    `<span class="tag type" title="${type?.description ?? ""}">${type?.name ?? eq.type}</span>` +
    `<span class="tag level l${eq.level}">${level?.name ?? eq.level}</span>` +
    (hasIons(eq) ? '<span class="tag ions" title="Cal igualar també la càrrega elèctrica">Amb ions</span>' : "");

  const nR = eq.reactants.length;
  el.scene.style.setProperty("--nr", nR);
  el.scene.style.setProperty("--np", eq.products.length);
  el.reactantCols.innerHTML = "";
  el.productCols.innerHTML = "";
  eq.reactants.forEach((f, i) => el.reactantCols.appendChild(buildTerm(f, i)));
  eq.products.forEach((f, i) => el.productCols.appendChild(buildTerm(f, nR + i)));

  renderLegend();
  renderAid();
  if (state.settings.projector) fitScale();
  else requestAnimationFrame(fitAllBuckets);
}

function buildTerm(formula, index) {
  const term = document.createElement("div");
  term.className = "term";
  term.dataset.index = String(index);
  const name = formulaText(formula);
  term.innerHTML = `
    <div class="bucket" aria-hidden="true"><div class="sprites"></div><span class="count-badge"></span></div>
    <div class="formula"><span class="coef"></span><span class="f">${formulaHTML(formula)}</span></div>
    <div class="stepper">
      <button type="button" class="step minus" aria-label="Treu una unitat (${name})">&minus;</button>
      <input type="number" class="coef-input" min="1" max="99" step="1" inputmode="numeric" aria-label="Coeficient (${name})" />
      <button type="button" class="step plus" aria-label="Afegeix una unitat (${name})">+</button>
    </div>`;
  const input = term.querySelector("input");
  term.querySelector(".minus").addEventListener("click", () => setCoef(index, state.coefs[index] - 1));
  term.querySelector(".plus").addEventListener("click", () => setCoef(index, state.coefs[index] + 1));
  input.addEventListener("input", () => {
    const v = Number.parseInt(input.value, 10);
    if (Number.isFinite(v) && v >= 1) setCoef(index, v, { keepInput: true });
  });
  input.addEventListener("blur", () => {
    input.value = state.coefs[index];
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      // Sense preventDefault, el mateix Enter activaria el botó «Següent» que rep el focus.
      event.preventDefault();
      input.blur();
      handleCheck();
    }
  });
  updateTerm(term, index);
  return term;
}

function termEl(index) {
  return el.scene.querySelector(`.term[data-index="${index}"]`);
}

function formulaAt(index) {
  const eq = state.current;
  const nR = eq.reactants.length;
  return index < nR ? eq.reactants[index] : eq.products[index - nR];
}

function updateTerm(term, index, { keepInput = false } = {}) {
  const n = state.coefs[index];
  const coef = term.querySelector(".coef");
  coef.textContent = n;
  coef.classList.toggle("is-one", n === 1);
  const input = term.querySelector("input");
  if (!keepInput) input.value = n;
  term.querySelector(".minus").disabled = n <= 1 || state.solved;
  term.querySelector(".plus").disabled = n >= 99 || state.solved;

  const { markup } = moleculeSVG(formulaAt(index));
  const shown = Math.min(n, MAX_DRAWN);
  const sprites = term.querySelector(".sprites");
  if (sprites.childElementCount !== shown) {
    sprites.innerHTML = Array(shown).fill(`<div class="sprite">${markup}</div>`).join("");
  }
  const badge = term.querySelector(".count-badge");
  badge.textContent = n > MAX_DRAWN ? `${n} en total` : "";
  badge.hidden = n <= MAX_DRAWN;
}

// Redueix la lletra de les fórmules llargues perquè no es tallin.
function fitFormula(term) {
  const box = term.querySelector(".formula");
  box.style.fontSize = "";
  let size = parseFloat(getComputedStyle(box).fontSize);
  for (let i = 0; i < 6 && box.scrollWidth > box.clientWidth && size > 12; i += 1) {
    size = Math.max(12, Math.floor((size * box.clientWidth) / box.scrollWidth) - 1);
    box.style.fontSize = `${size}px`;
  }
}

// Mida de les molècules perquè omplin la caixa sense sortir-ne.
function fitBucket(term) {
  fitFormula(term);
  const index = Number(term.dataset.index);
  const bucket = term.querySelector(".bucket");
  const sprites = term.querySelector(".sprites");
  const n = sprites.childElementCount;
  if (!n) return;
  const { aspect, unit } = moleculeSVG(formulaAt(index));
  const W = bucket.clientWidth - 12;
  const H = bucket.clientHeight - 12;
  if (W <= 0 || H <= 0) return;
  const gap = 4;
  let best = { h: 0, cols: 1 };
  for (let cols = 1; cols <= n; cols += 1) {
    const rows = Math.ceil(n / cols);
    const cellW = (W - gap * (cols - 1)) / cols;
    const cellH = (H - gap * (rows - 1)) / rows;
    const h = Math.min(cellH, cellW / aspect);
    if (h > best.h) best = { h, cols };
  }
  // No fer els àtoms més grans del compte: com a màxim, el doble de la mida del dibuix.
  const viewH = unit / Math.max(aspect, 1);
  const h = Math.max(4, Math.min(best.h, viewH * 2));
  const w = h * aspect;
  sprites.style.gridTemplateColumns = `repeat(${best.cols}, ${w.toFixed(1)}px)`;
  sprites.style.setProperty("--sprite-h", `${h.toFixed(1)}px`);
  sprites.style.setProperty("--sprite-w", `${w.toFixed(1)}px`);
  // Si els àtoms queden massa petits, s'amaguen les lletres.
  bucket.classList.toggle("tiny", h / viewH < 0.62);
}

function fitAllBuckets() {
  el.scene.querySelectorAll(".term").forEach(fitBucket);
}

function setCoef(index, value, opts) {
  if (!state.current || state.solved) return;
  const v = Math.min(99, Math.max(1, Math.trunc(value) || 1));
  state.coefs[index] = v;
  const term = termEl(index);
  updateTerm(term, index, opts);
  fitBucket(term);
  renderAid();
  if (!state.solutionShown) setFeedback("", "neutral");
  setStatus("idle");
  clearHighlights();
}

/* ---------- Llegenda i ajudes visuals ---------- */

function dot(element) {
  return `<span class="dot${element === "H" ? " light" : ""}" style="--c:${elementColor(element)}">${element}</span>`;
}

function renderLegend() {
  el.legend.innerHTML = equationElements(state.current)
    .map((e) => `<span class="legend-item">${dot(e)}${elementName(e)}</span>`)
    .join("");
}

function renderAid() {
  if (!state.current) return;
  document.querySelectorAll(".aid-opt").forEach((btn) => {
    btn.setAttribute("aria-checked", String(btn.dataset.aid === state.settings.aid));
  });
  const result = analyse(state.current, state.coefs);
  const ions = hasIons(state.current);
  const aid = state.settings.aid;
  if (aid === "cap") {
    el.aidBody.innerHTML = `<p class="aid-empty">Sense ajuda visual.<br />Compta els àtoms tu mateix i prem «Comprova».</p>`;
    return;
  }
  if (aid === "barres") {
    el.aidBody.innerHTML =
      `<div class="bars-head"><span>Reactius</span><span></span><span>Productes</span></div>` +
      result.elements.map(barRow).join("") +
      (ions ? chargeRow(result) : "");
    return;
  }
  el.aidBody.innerHTML =
    `<div class="scales">${result.elements.map(scaleItem).join("")}</div>` + (ions ? chargeRow(result) : "");
}

function barRow({ element, left, right }) {
  const max = Math.max(left, right, 1);
  const color = element === "H" ? "#cbd5e1" : elementColor(element);
  return `
    <div class="bar-row${left === right ? " ok" : ""}" role="img" aria-label="${element}: ${left} a l'esquerra i ${right} a la dreta">
      <div class="bar left"><span class="bar-num">${left}</span><span class="bar-fill" style="--w:${(left / max) * 100}%;--c:${color}"></span></div>
      ${dot(element)}
      <div class="bar right"><span class="bar-fill" style="--w:${(right / max) * 100}%;--c:${color}"></span><span class="bar-num">${right}</span></div>
    </div>`;
}

function scaleItem({ element, left, right }) {
  const max = Math.max(left, right, 1);
  const tilt = left === right ? 0 : Math.max(-14, Math.min(14, ((right - left) / max) * 14));
  const color = elementColor(element);
  const dark = element === "H" || element === "S";
  return `
    <figure class="scale${left === right ? " ok" : ""}" role="img" aria-label="${element}: ${left} a l'esquerra i ${right} a la dreta">
      <svg viewBox="0 0 120 74" aria-hidden="true">
        <path class="stand" d="M60 26v40M44 68h32"/>
        <g transform="rotate(${tilt.toFixed(1)} 60 26)">
          <path class="beam" d="M14 26h92"/>
          <path class="hang" d="M18 26l-9 17M18 26l9 17M102 26l-9 17M102 26l9 17"/>
          <path class="plate" d="M4 43h28a14 6 0 0 1-28 0zM88 43h28a14 6 0 0 1-28 0z"/>
          <text x="18" y="62" class="num">${left}</text>
          <text x="102" y="62" class="num">${right}</text>
        </g>
        <circle cx="60" cy="26" r="10" fill="${color}" class="pivot${element === "H" ? " light" : ""}"/>
        <text x="60" y="30" class="sym" fill="${dark ? "#1e293b" : "#fff"}">${element}</text>
      </svg>
    </figure>`;
}

function formatCharge(q) {
  if (q === 0) return "0";
  return q > 0 ? `+${q}` : `−${Math.abs(q)}`;
}

function chargeRow(result) {
  return `
    <div class="charge-row${result.chargeOk ? " ok" : ""}">
      <span>${formatCharge(result.leftCharge)}</span>
      <strong>Càrrega</strong>
      <span>${formatCharge(result.rightCharge)}</span>
    </div>`;
}

/* ---------- Estat, missatges i bloqueig ---------- */

const STATUS = {
  idle: { icon: "?", text: "Sense comprovar" },
  ok: { icon: "✓", text: "Equilibrada" },
  bad: { icon: "✗", text: "No equilibrada" },
  simplify: { icon: "÷", text: "Es pot simplificar" },
};

function setStatus(kind) {
  el.statusBox.className = `status ${kind}`;
  el.statusIcon.textContent = STATUS[kind].icon;
  el.statusText.textContent = STATUS[kind].text;
}

function setFeedback(message, tone) {
  el.feedback.innerHTML = message;
  el.feedback.className = `feedback ${tone}`;
}

function lockControls(locked) {
  el.checkBtn.disabled = locked;
  el.hintBtn.disabled = locked;
  el.resetBtn.disabled = locked;
  el.solutionBtn.disabled = locked;
  el.scene.querySelectorAll(".stepper input").forEach((i) => {
    i.disabled = locked;
  });
  el.scene.querySelectorAll(".term").forEach((term) => updateTerm(term, Number(term.dataset.index)));
}

function updateScoreboard() {
  el.attemptCount.textContent = state.stats.attempts;
  el.correctCount.textContent = state.stats.correct;
  el.streakCount.textContent = state.stats.streak;
  save(STORAGE.stats, state.stats);
}

function clearHighlights() {
  el.scene.querySelectorAll(".term.highlight").forEach((t) => t.classList.remove("highlight"));
}

/* ---------- Comprovació ---------- */

// Apostrofació: «d'oxigen», «l'hidrogen», però «de iode», «el iode».
const elides = (word) => /^h?[aeiouàèéíòóú]/i.test(word) && !/^h?i[aeiou]/i.test(word);
const withDe = (word) => (elides(word) ? `d'${word}` : `de ${word}`);
const withArticle = (word) => (elides(word) ? `l'${word}` : `el ${word}`);

function firstGap(result) {
  const row = result.elements.find((r) => r.left !== r.right);
  const diff = Math.abs(row.left - row.right);
  const side = row.left > row.right ? "a la dreta" : "a l'esquerra";
  return `Encara ${diff === 1 ? "falta 1 àtom" : `falten ${diff} àtoms`} ${withDe(elementName(row.element))} (${row.element}) ${side}.`;
}

function handleCheck() {
  if (!state.current || state.solved) return;
  const result = analyse(state.current, state.coefs);
  state.stats.attempts += 1;

  if (result.balanced && !result.simplest) {
    setStatus("simplify");
    setFeedback(
      `Equilibrada, però es pot simplificar: divideix tots els coeficients per ${result.divisor}.`,
      "hint"
    );
  } else if (result.balanced) {
    setStatus("ok");
    onSolved();
  } else {
    setStatus("bad");
    state.stats.streak = 0;
    const msg = result.atomsOk
      ? `Els àtoms quadren, però la càrrega no: ${formatCharge(result.leftCharge)} a l'esquerra i ${formatCharge(result.rightCharge)} a la dreta.`
      : firstGap(result);
    if (state.mode === "repte") onChallengeMiss(msg);
    else setFeedback(msg, "error");
  }
  updateScoreboard();
}

function onSolved() {
  const eq = state.current;
  state.solved = true;
  lockControls(true);
  if (state.solutionShown) {
    state.stats.streak = 0;
    setFeedback("Correcte, però has vist la solució: no compta com a encert.", "hint");
  } else {
    state.stats.correct += 1;
    state.stats.streak += 1;
    state.stats.bestStreak = Math.max(state.stats.bestStreak ?? 0, state.stats.streak);
    markProgress(eq);
    celebrate();
    setFeedback(`<strong>Molt bé! Equació igualada.</strong> ${eq.explanation}`, "success");
  }
  if (state.mode === "repte") onChallengeSolved();
  else el.nextBtn.hidden = false;
  el.nextBtn.focus({ preventScroll: true });
}

/* ---------- Pistes progressives ---------- */

function handleHint() {
  if (!state.current || state.solved) return;
  const eq = state.current;
  const result = analyse(eq, state.coefs);
  clearHighlights();
  if (result.atomsOk && result.chargeOk) {
    setFeedback(
      result.simplest
        ? "Ja quadren tots els àtoms. Prem «Comprova»!"
        : `Ja quadra, però els coeficients es poden dividir per ${result.divisor}.`,
      "hint"
    );
    return;
  }
  state.hintStep = Math.min(3, state.hintStep + 1);
  const formulas = [...eq.reactants, ...eq.products];
  const indices = formulas.map((_, i) => i);
  const unbalanced = result.elements.filter((r) => r.left !== r.right);
  let row = null;
  let target;
  if (unbalanced.length) {
    // Element que surt en menys substàncies (el més fàcil per començar).
    const appearances = (e) => formulas.filter((f) => parseFormula(f)[e]).length;
    row = unbalanced.sort(
      (a, b) =>
        appearances(a.element) - appearances(b.element) ||
        Math.abs(b.left - b.right) - Math.abs(a.left - a.right)
    )[0];
    const candidates = indices.filter((i) => parseFormula(formulas[i])[row.element]);
    target = candidates.find((i) => state.coefs[i] !== eq.coefficients[i]) ?? candidates[0];
  } else {
    target = indices.find((i) => state.coefs[i] !== eq.coefficients[i]) ?? 0;
  }
  const name = formulaText(formulas[target]);
  let msg;
  if (state.hintStep === 1) {
    msg = row
      ? `Pista 1 de 3: fixa't en ${withArticle(elementName(row.element))} (${row.element}): n'hi ha ${row.left} a l'esquerra i ${row.right} a la dreta.`
      : "Pista 1 de 3: els àtoms quadren, però la càrrega no. Fixa't en els ions.";
  } else if (state.hintStep === 2) {
    msg = `Pista 2 de 3: canvia el coeficient de la substància ressaltada (${name}).`;
    termEl(target).classList.add("highlight");
  } else {
    msg = `Pista 3 de 3: prova amb el coeficient ${eq.coefficients[target]} per a ${name}.`;
    termEl(target).classList.add("highlight");
  }
  setFeedback(msg, "hint");
}

/* ---------- Solució ---------- */

function handleSolution() {
  if (!state.current || state.solved) return;
  if (state.mode === "repte") {
    el.confirmDialog.showModal();
    return;
  }
  applySolution();
  state.stats.streak = 0;
  updateScoreboard();
  setFeedback("Aquesta és la solució. No compta com a encert: prova-ho amb una altra equació!", "hint");
  el.nextBtn.hidden = false;
}

function applySolution() {
  state.solutionShown = true;
  clearHighlights();
  state.current.coefficients.forEach((v, i) => {
    state.coefs[i] = v;
    updateTerm(termEl(i), i);
  });
  fitAllBuckets();
  renderAid();
}

function handleReset() {
  if (!state.current || state.solved) return;
  state.coefs = state.coefs.map(() => 1);
  el.scene.querySelectorAll(".term").forEach((term) => updateTerm(term, Number(term.dataset.index)));
  fitAllBuckets();
  renderAid();
  setStatus("idle");
  setFeedback("", "neutral");
  clearHighlights();
}

/* ---------- Mode Repte: 5 equacions, 2 intents i estrelles ---------- */

function startChallenge() {
  if (!state.pool.length) return showEmpty();
  state.challenge = {
    list: shuffle(state.pool).slice(0, CHALLENGE_SIZE),
    index: 0,
    tries: 0,
    points: 0,
    results: [],
    start: Date.now(),
    resultId: globalThis.crypto?.randomUUID?.() || `igualacio-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    finished: false,
  };
  loadEquation(state.challenge.list[0]);
  setNextLabel("Següent equació");
  renderChallengeBar();
}

function renderChallengeBar() {
  const c = state.challenge;
  const on = state.mode === "repte" && c;
  el.challengeBar.hidden = !on;
  el.hintBtn.hidden = Boolean(on);
  if (!on) return;
  const triesLeft = CHALLENGE_TRIES - c.tries;
  const dots = Array.from({ length: CHALLENGE_TRIES }, (_, i) => `<i class="${i < triesLeft ? "on" : ""}"></i>`).join("");
  const showTimer = state.settings.showTimer;
  el.challengeBar.innerHTML = `
    <span class="cb-item">Equació <strong>${Math.min(c.index + 1, c.list.length)}</strong> de ${c.list.length}</span>
    <span class="cb-item tries" title="Intents que et queden">Intents <span class="tries-dots">${dots}</span></span>
    <span class="cb-item"><span class="star-sm" aria-hidden="true">★</span><strong>${c.points}</strong> punts</span>
    <button type="button" class="cb-item timer" id="timerBtn" aria-pressed="${showTimer}" title="Mostra o amaga el cronòmetre">⏱ <span id="timerText">${showTimer ? formatTime(Date.now() - c.start) : "Cronòmetre"}</span></button>`;
  $("timerBtn").addEventListener("click", () => {
    state.settings.showTimer = !state.settings.showTimer;
    save(STORAGE.settings, state.settings);
    renderChallengeBar();
  });
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

setInterval(() => {
  const c = state.challenge;
  if (state.mode === "repte" && c && !c.finished && state.settings.showTimer) {
    const t = $("timerText");
    if (t) t.textContent = formatTime(Date.now() - c.start);
  }
}, 500);

function onChallengeMiss(msg) {
  const c = state.challenge;
  c.tries += 1;
  if (c.tries >= CHALLENGE_TRIES) {
    applySolution();
    state.solved = true;
    lockControls(true);
    c.results.push(0);
    setFeedback(`${msg} S'han acabat els intents: aquesta era la solució.`, "error");
    showChallengeNext();
  } else {
    setFeedback(`${msg} Et queda 1 intent.`, "error");
  }
  renderChallengeBar();
}

function onChallengeSolved() {
  const c = state.challenge;
  const pts = c.tries === 0 ? 2 : 1;
  c.points += pts;
  c.results.push(pts);
  setFeedback(`<strong>+${pts} ${pts === 1 ? "punt" : "punts"}!</strong> ${state.current.explanation}`, "success");
  renderChallengeBar();
  showChallengeNext();
}

function setNextLabel(text) {
  el.nextBtn.firstChild.textContent = `${text} `;
}

function showChallengeNext() {
  const c = state.challenge;
  setNextLabel(c.index + 1 >= c.list.length ? "Mostra el resultat" : "Següent equació");
  el.nextBtn.hidden = false;
}

function handleNext() {
  if (state.mode !== "repte") {
    newEquation();
    return;
  }
  const c = state.challenge;
  c.index += 1;
  if (c.index >= c.list.length) {
    finishChallenge();
    return;
  }
  c.tries = 0;
  loadEquation(c.list[c.index]);
  renderChallengeBar();
}

function finishChallenge() {
  const c = state.challenge;
  if (c.finished || c.results.length !== c.list.length) return;
  c.finished = true;
  const max = c.list.length * 2;
  const ratio = c.points / max;
  const stars = ratio >= 0.95 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.35 ? 1 : 0;
  const solved = c.results.filter((p) => p > 0).length;
  el.resultStars.innerHTML = [0, 1, 2].map((i) => `<span class="${i < stars ? "on" : ""}">★</span>`).join("");
  el.resultStars.setAttribute("aria-label", `${stars} estrelles de 3`);
  el.resultPoints.textContent = `${c.points} punts de ${max}`;
  el.resultDetail.textContent = `Has igualat ${solved} de ${c.list.length} equacions en ${formatTime(Date.now() - c.start)}. Encertar a la primera val 2 punts; a la segona, 1.`;
  el.resultDialog.showModal();
  c.payload = {
    resultat_id: c.resultId,
    elapsedSeconds: Math.floor((Date.now() - c.start) / 1000),
    total: c.list.length,
    equations: c.list.map((eq, index) => ({
      id: eq.id,
      level: levelInfo(eq.level)?.name || String(eq.level),
      points: c.results[index],
    })),
  };
  void saveChallenge(c);
  if (stars >= 2) celebrate();
}

async function saveChallenge(c) {
  if (!c?.payload || c.saving || c.saved) return;
  const status = $("resultSaveStatus");
  const retry = $("retryResultBtn");
  retry.hidden = true;
  if (window.parent === window) {
    status.textContent = "Obre l’activitat des d’Aula CreActiva per desar el resultat.";
    return;
  }
  c.saving = true;
  status.textContent = "Desant el resultat…";
  try {
    const response = await window.parent.aulaCreActivaSaveIgualacioResult(c.payload, window);
    if (response?.status !== "success") throw new Error("Desament fallit");
    c.saved = true;
    if (state.challenge === c) status.textContent = "Resultat desat.";
  } catch {
    if (state.challenge === c) {
      status.textContent = "No s’ha pogut desar el resultat.";
      retry.hidden = false;
    }
  } finally {
    c.saving = false;
  }
}

$("retryResultBtn").addEventListener("click", () => void saveChallenge(state.challenge));

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  document.documentElement.classList.toggle("mode-repte", mode === "repte");
  el.newEquationBtn.textContent = mode === "repte" ? "Nou repte" : "Nova equació";
  if (mode === "repte") {
    startChallenge();
  } else {
    state.challenge = null;
    renderChallengeBar();
    setNextLabel("Següent equació");
    newEquation();
  }
}

/* ---------- Progrés i celebració ---------- */

function markProgress(eq) {
  state.progress[eq.id] = true;
  save(STORAGE.progress, state.progress);
}

/* ---------- Guia del laboratori (diàleg d'informació) ---------- */

// Converteix «2 Na + Cl2 -> 2 NaCl» en una equació i els seus coeficients.
function parseExample(text) {
  const [left, right] = text.split("->").map((side) =>
    side.trim().split(" + ").map((term) => {
      const m = term.trim().match(/^(\d+)\s+(.+)$/);
      return m ? [Number(m[1]), m[2]] : [1, term.trim()];
    })
  );
  return {
    eq: { reactants: left.map((t) => t[1]), products: right.map((t) => t[1]) },
    coefs: [...left, ...right].map((t) => t[0]),
  };
}

// Equació en línia: coeficient (si no és 1) + fórmula, amb «+» i fletxa.
function equationHTML(eq, coefs, { mark = -1, molecules = false } = {}) {
  const term = (f, i) => {
    const c = coefs[i];
    const sprite = molecules ? `<span class="mini-mols">${Array.from({ length: c }, () => `<span class="mini-mol sprite">${moleculeSVG(f).markup}</span>`).join("")}</span>` : "";
    return `<span class="eq-term${i === mark ? " marked" : ""}">${sprite}<span class="eq-formula">${c > 1 ? `<b class="eq-coef">${c}</b>` : ""}${formulaHTML(f)}</span></span>`;
  };
  const nR = eq.reactants.length;
  const side = (list, offset) => list.map((f, i) => term(f, i + offset)).join('<span class="eq-op">+</span>');
  return `<div class="eq-line">${side(eq.reactants, 0)}<span class="eq-op arrow">→</span>${side(eq.products, nR)}</div>`;
}

// Fitxes d'àtoms: «H 2 | 2» en verd si quadra, en vermell si no.
function countChips(eq, coefs) {
  return analyse(eq, coefs)
    .elements.map(({ element, left, right }) => {
      const ok = left === right;
      return `<span class="count-chip ${ok ? "ok" : "bad"}">${dot(element)}<span>${left}</span><i>|</i><span>${right}</span><em aria-label="${ok ? "quadra" : "no quadra"}">${ok ? "✓" : "✗"}</em></span>`;
    })
    .join("");
}

const GUIDE_EQ = { reactants: ["H2", "O2"], products: ["H2O"] };
const GUIDE_STEPS = [
  {
    coefs: [1, 1, 1],
    mark: -1,
    title: "Compta els àtoms de cada costat",
    text: "Hi ha 2 àtoms d'oxigen a l'esquerra, però només 1 a la dreta. L'hidrogen sí que quadra.",
  },
  {
    coefs: [1, 1, 2],
    mark: 2,
    title: "Posa un 2 davant de l'aigua",
    text: "Ara hi ha 2 molècules d'aigua: l'oxigen quadra, però l'hidrogen passa a 4 àtoms a la dreta.",
  },
  {
    coefs: [2, 1, 2],
    mark: 0,
    title: "Posa un 2 davant de l'hidrogen",
    text: "Amb 2 molècules d'hidrogen tenim 4 àtoms de H a cada costat. Tots els elements quadren!",
  },
  {
    coefs: [2, 1, 2],
    mark: -1,
    final: true,
    title: "Revisa que siguin els més petits",
    text: "2, 1, 2 no es poden simplificar: és la resposta correcta. El coeficient 1 no s'escriu.",
  },
];

function renderGuide() {
  el.guideSteps.innerHTML = GUIDE_STEPS.map(
    (step, i) => `
      <li class="step-card${step.final ? " final" : ""}">
        <span class="step-num" aria-hidden="true">${i + 1}</span>
        <div class="step-main">
          <h4>${step.title}</h4>
          ${equationHTML(GUIDE_EQ, step.coefs, { mark: step.mark, molecules: !step.final })}
          <div class="count-chips">${countChips(GUIDE_EQ, step.coefs)}</div>
          <p>${step.text}</p>
        </div>
      </li>`
  ).join("");

  const sub = (f) => `<span class="eq-formula">${formulaHTML(f)}</span>`;
  const mols = (f, n = 1) => Array.from({ length: n }, () => `<span class="mini-mol sprite">${moleculeSVG(f).markup}</span>`).join("");
  el.guideRules.innerHTML = `
    <article class="rule">
      <h4><span class="rule-icon">1</span>Canvia coeficients, mai subíndexs</h4>
      <div class="compare">
        <figure class="good"><div class="mini-mols">${mols("H2O", 2)}</div><figcaption><b class="eq-coef">2</b>${sub("H2O")}<small>2 molècules d'aigua ✓</small></figcaption></figure>
        <figure class="bad"><div class="mini-mols">${mols("H2O2")}</div><figcaption>${sub("H2O2")}<small>és una altra substància ✗</small></figcaption></figure>
      </div>
    </article>
    <article class="rule">
      <h4><span class="rule-icon">2</span>Nombres enters i tan petits com puguis</h4>
      <p class="simplify"><span>4, 2, 4</span><span class="arrow">÷ 2 →</span><strong>2, 1, 2</strong></p>
    </article>
    <article class="rule">
      <h4><span class="rule-icon">3</span>Tria bé per on comences</h4>
      <p>Comença per l'element que surt en menys substàncies. Deixa l'hidrogen i l'oxigen per al final.</p>
    </article>
    <article class="rule">
      <h4><span class="rule-icon">4</span>Amb ions, també la càrrega</h4>
      <p>A batxillerat, la suma de càrregues ha de ser igual a cada costat, a més dels àtoms.</p>
    </article>
    <article class="rule tools">
      <h4><span class="rule-icon">?</span>Les ajudes de l'app</h4>
      <ul>
        <li><b>Barres i Balança</b>: veus quin costat té més àtoms de cada element.</li>
        <li><b>Pista</b>: en tres passos, de l'element que falla fins al valor que pots provar.</li>
        <li><b>Comprova</b> (o tecla Retorn): et diu exactament què falta.</li>
        <li><b>Repte</b>: 5 equacions i 2 intents per a cadascuna, sense pistes.</li>
      </ul>
    </article>`;
}

// Esquema d'un tipus: «A», «AB»… com a fitxes de colors; la resta, com a text.
const TILE_COLORS = { A: "#2563eb", B: "#f59e0b", C: "#16a34a", D: "#db2777" };
function patternHTML(pattern) {
  return pattern
    .split(" ")
    .map((token) => {
      if (token === "+") return '<span class="eq-op">+</span>';
      if (token === "->") return '<span class="eq-op arrow">→</span>';
      if (/^[A-D]{1,2}$/.test(token)) {
        return `<span class="tiles">${[...token].map((l) => `<span class="tile" style="--c:${TILE_COLORS[l]}">${l}</span>`).join("")}</span>`;
      }
      if (/^[A-Z][A-Za-z0-9]*$/.test(token)) return `<span class="eq-formula">${formulaHTML(token)}</span>`;
      return `<span class="word">${token}</span>`;
    })
    .join("");
}

function renderTypes() {
  el.typeCards.innerHTML = state.config.types
    .map((t) => {
      const count = state.equations.filter((eq) => eq.type === t.id).length;
      const ex = parseExample(t.example);
      return `
        <article class="type-card">
          <header><h4>${t.name}</h4><span class="type-count">${count} equacions</span></header>
          <div class="pattern">${patternHTML(t.pattern)}</div>
          <p>${t.description}</p>
          <div class="type-example"><span class="label">Exemple</span>${equationHTML(ex.eq, ex.coefs)}</div>
        </article>`;
    })
    .join("");
}

const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);

function levelMessage(done, total) {
  if (!total) return "Sense equacions";
  if (done === total) return "Completat! 🏆";
  if (done === 0) return "Encara per començar";
  if (done / total >= 0.5) return "Més de la meitat!";
  return "En marxa";
}

function renderProgress() {
  const all = state.equations;
  const solved = all.filter((eq) => state.progress[eq.id]).length;
  const { attempts, correct, bestStreak = 0, streak } = state.stats;
  const cards = [
    ["Equacions resoltes", `${solved}<small>/${all.length}</small>`, "blue"],
    ["Encerts", correct, "green"],
    ["Intents", attempts, "slate"],
    ["Precisió", attempts ? `${pct(correct, attempts)}<small>%</small>` : "—", "amber"],
    ["Millor ratxa", Math.max(bestStreak, streak), "violet"],
  ];
  el.statCards.innerHTML = cards
    .map(([label, value, tone]) => `<div class="stat-card ${tone}"><span class="stat-value">${value}</span><span class="stat-label">${label}</span></div>`)
    .join("");

  el.levelCards.innerHTML = state.config.levels
    .map((level) => {
      const list = all.filter((eq) => eq.level === level.id);
      const done = list.filter((eq) => state.progress[eq.id]).length;
      const p = pct(done, list.length);
      return `
        <div class="level-card l${level.id}${done === list.length && done ? " complete" : ""}">
          <div class="ring" style="--p:${p}" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${list.length}" aria-label="${level.name}"><span>${p}%</span></div>
          <div class="level-info">
            <strong>${level.name}</strong>
            <span class="level-num">${done}/${list.length}</span>
            <small>${levelMessage(done, list.length)}</small>
          </div>
        </div>`;
    })
    .join("");

  el.typeProgress.innerHTML = state.config.types
    .map((t) => {
      const list = all.filter((eq) => eq.type === t.id);
      const done = list.filter((eq) => state.progress[eq.id]).length;
      return `
        <div class="progress-row">
          <span class="progress-name">${t.name}</span>
          <div class="progress-track" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${list.length}" aria-label="${t.name}"><span style="width:${pct(done, list.length)}%"></span></div>
          <span class="progress-num">${done}/${list.length}</span>
        </div>`;
    })
    .join("");
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

function openInfo() {
  if (!el.guideSteps.childElementCount) {
    renderGuide();
    renderTypes();
  }
  renderProgress();
  showInfoTab(state.settings.infoTab || "metode");
  el.infoDialog.showModal();
}

function celebrate() {
  try {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  } catch {}
  const box = document.createElement("div");
  box.className = "confetti";
  box.setAttribute("aria-hidden", "true");
  const colors = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];
  for (let i = 0; i < 46; i += 1) {
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

function attachEvents() {
  el.newEquationBtn.addEventListener("click", () => (state.mode === "repte" ? startChallenge() : newEquation()));
  el.checkBtn.addEventListener("click", handleCheck);
  el.hintBtn.addEventListener("click", handleHint);
  el.resetBtn.addEventListener("click", handleReset);
  el.solutionBtn.addEventListener("click", handleSolution);
  el.nextBtn.addEventListener("click", handleNext);

  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.dataset.mode !== state.mode) setMode(tab.dataset.mode);
    });
  });

  document.querySelectorAll(".aid-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.settings.aid = btn.dataset.aid;
      save(STORAGE.settings, state.settings);
      renderAid();
    });
  });

  el.typeTrigger.addEventListener("click", () => {
    const open = el.typeDropdown.classList.toggle("open");
    el.typeTrigger.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (event) => {
    if (!el.typeDropdown.contains(event.target)) {
      el.typeDropdown.classList.remove("open");
      el.typeTrigger.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") el.typeDropdown.classList.remove("open");
  });

  el.projectorBtn.addEventListener("click", () => {
    state.settings.projector = !state.settings.projector;
    save(STORAGE.settings, state.settings);
    applyProjector();
  });

  el.infoBtn.addEventListener("click", openInfo);
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

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.closest("[data-close]")) dialog.close();
    });
  });

  el.confirmYes.addEventListener("click", () => {
    el.confirmDialog.close();
    applySolution();
    state.solved = true;
    state.stats.streak = 0;
    updateScoreboard();
    lockControls(true);
    state.challenge.results.push(0);
    setFeedback("Aquesta és la solució. Aquesta equació no suma punts.", "hint");
    renderChallengeBar();
    showChallengeNext();
  });
  el.confirmNo.addEventListener("click", () => el.confirmDialog.close());
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

function applyProjector() {
  document.documentElement.classList.toggle("projector", state.settings.projector);
  el.projectorBtn.setAttribute("aria-pressed", String(state.settings.projector));
  fitScale();
}

async function init() {
  state.settings = load(STORAGE.settings, state.settings);
  state.stats = load(STORAGE.stats, state.stats);
  state.progress = load(STORAGE.progress, {});
  attachEvents();
  applyProjector();
  updateScoreboard();
  try {
    await loadData();
  } catch (error) {
    setFeedback(`${error.message} Cal obrir l'app des d'un servidor web.`, "error");
    return;
  }
  const levelIds = state.config.levels.map((l) => l.id);
  state.settings.levels = state.settings.levels.filter((l) => levelIds.includes(l));
  if (!state.settings.levels.length) state.settings.levels = [1, 2, 3];
  const typeIds = state.config.types.map((t) => t.id);
  state.settings.types = state.settings.types.filter((t) => typeIds.includes(t));
  renderFilters();
  applyFilters();
  newEquation();
}

init();

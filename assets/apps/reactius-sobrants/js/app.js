// Laboratori de reactius i sobrants: modes Aprèn, Practica (amb Explora) i Repte, activitats i progrés.

import { formulaHTML } from "./chem.js";
import { LEVELS, FAMILIES, REACTIONS, PROBLEMS, EXTRA, ATOMIC_MASS, reactionById } from "./reaccions.js";
import {
  react, makeCase, MESSAGES, subLabel, qty, formatNum, parseNum, incompleteNote,
  diagnosePredict, diagnoseLimit, limitantAnswer, JUSTIFICATIONS, diagnoseBefore, exactaTarget, diagnoseExact,
  checkTable, hints, solveProblem, diagnoseCalc, calcHints, checkMolTable, molTableHints, molarMass, near,
} from "./motor.js";
import { particleHTML, recipeHTML, reactorHTML, atomsHTML, playReaction, fitReactors } from "./reactor.js";
import { MODULES } from "./aprenentatge.js";

const CHALLENGE_SIZE = 10;
const CHALLENGE_TRIES = 2;
const STORAGE = { settings: "rs_settings_v1", stats: "rs_stats_v1", progress: "rs_progress_v1" };

const ACTIVITIES = [
  { id: "barreja", name: "Barreja", desc: "Tots els tipus d'activitat alternats" },
  { id: "explora", name: "Explora", desc: "Recipient lliure: tria la reacció i les quantitats" },
  { id: "prediu", name: "Prediu el resultat", desc: "Què es forma i què sobra" },
  { id: "limitant", name: "Quin és el limitant?", desc: "Quin reactiu s'acaba primer" },
  { id: "abans", name: "Què hi havia abans?", desc: "Dedueix els reactius inicials" },
  { id: "exacta", name: "Que no sobri res", desc: "Posa els reactius justos" },
  { id: "taula", name: "Completa la taula", desc: "Abans, canvi i després" },
  { id: "calcula", name: "Calcula amb mols i grams", desc: "Limitant, producte i sobrant" },
];
// Nivells en què té sentit cada activitat.
const ACT_LEVELS = { explora: [1, 2, 3], prediu: [1, 2, 3], limitant: [1, 2, 3], abans: [2, 3], exacta: [1, 2, 3], taula: [3, 4], calcula: [4] };
const MIX_WEIGHTS = { prediu: 3, limitant: 3, abans: 2, exacta: 2, taula: 2, calcula: 4 };

const ERROR_INFO = {
  E1: "Pensar que el limitant és el reactiu que en tens menys",
  E2: "Triar el limitant només pel coeficient",
  E3: "Comptar només un lot",
  E4: "No veure si sobra o no sobra res",
  E5: "Pensar que es conserva el nombre de molècules",
  E6: "Oblidar la conservació de la massa",
  E7: "Fer desaparèixer el sobrant",
  E8: "Augmentar només un reactiu",
  E11: "Comparar grams en lloc de mols",
  E12: "Comparar mols sense dividir pel coeficient",
  E14: "Pensar que els reactius reaccionen 1 a 1",
  E15: "Partir molècules per completar un lot",
  E16: "Buscar un limitant quan només hi ha un reactiu",
  E17: "Formar els productes a parts iguals",
};

const GLOSSARY = [
  ["Àtom", "La partícula més petita d'un element. A l'app és una boleta de color."],
  ["Molècula", "Un grup d'àtoms units. Per exemple, l'aigua (H₂O) té 2 àtoms d'hidrogen i 1 d'oxigen."],
  ["Unitat de fórmula", "El grup d'ions més petit que representa un compost iònic, com NaCl. No és una molècula."],
  ["Reactiu", "Substància que hi ha al principi i que es transforma."],
  ["Producte", "Substància nova que es forma en la reacció."],
  ["Equació química", "La manera d'escriure una reacció amb fórmules: reactius → productes."],
  ["Coeficient", "El nombre gran davant d'una fórmula. Diu en quina proporció reacciona."],
  ["Subíndex", "El nombre petit dins d'una fórmula. Diu quants àtoms d'un element té."],
  ["Recepta", "A l'app, l'equació igualada: diu quant de cada substància cal per fer un lot."],
  ["Lot", "Un grup de reactius exactament igual a la recepta."],
  ["Reactiu limitant", "El reactiu que s'acaba primer. Decideix quant producte es forma."],
  ["Reactiu en excés", "El reactiu que sobra quan la reacció s'atura."],
  ["Sobrant", "La part del reactiu que no ha reaccionat."],
  ["Proporció exacta", "Quan tots els reactius s'acaben alhora i no sobra res."],
  ["Conservació de la massa", "La massa total no canvia en una reacció: els àtoms només es reorganitzen."],
  ["Mol", "Un paquet de 6,022 · 10²³ partícules. Es fa servir per comptar partícules al laboratori."],
  ["Massa molar", "La massa d'un mol d'una substància, en g/mol."],
  ["Rendiment", "El percentatge del producte que s'obté realment respecte del que s'hauria d'obtenir."],
  ["Puresa", "El percentatge d'una mostra que és realment la substància que ens interessa."],
];

const SUCCESS = ["Molt bé!", "Perfecte!", "Exacte!", "Ho has clavat!"];

const $ = (id) => document.getElementById(id);
const el = {
  levelChips: $("levelChips"),
  familyDropdown: $("familyDropdown"),
  familyTrigger: $("familyTrigger"),
  familyMenu: $("familyMenu"),
  newQuestionBtn: $("newQuestionBtn"),
  glossaryBtn: $("glossaryBtn"),
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
  qRecipe: $("qRecipe"),
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
  glossaryList: $("glossaryList"),
  massChips: $("massChips"),
  statCards: $("statCards"),
  levelCards: $("levelCards"),
  errorList: $("errorList"),
  resetProgressBtn: $("resetProgressBtn"),
  resultDialog: $("resultDialog"),
  resultStars: $("resultStars"),
  resultPoints: $("resultPoints"),
  resultVerdict: $("resultVerdict"),
  resultDetail: $("resultDetail"),
  playAgainBtn: $("playAgainBtn"),
  backPracticeBtn: $("backPracticeBtn"),
};

const state = {
  mode: "practica",
  settings: { levels: [1, 2], families: [], activity: "barreja", projector: false, module: "m0", infoTab: "glossari", speed: "normal" },
  stats: { attempts: 0, correct: 0, streak: 0, bestStreak: 0, errors: {} },
  progress: {},
  bag: {},
  q: null,
  explore: null,
  challenge: null,
  stopAnim: null,
};

const fm = (f) => `<span class="fm">${formulaHTML(f)}</span>`;
// [[…]] és una fórmula o una equació: els coeficients i els signes queden fora de la fórmula.
const richText = (html) =>
  html.replace(/\[\[(.+?)\]\]/g, (_, text) =>
    `<span class="nowrap">${text
      .split(" ")
      .map((t) => (/[A-Z]/.test(t) ? fm(t) : `<b>${t}</b>`))
      .join(" ")}</span>`
  );
const listJoin = (items) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} i ${items.at(-1)}`);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const lotsWord = (n) => `${n} ${n === 1 ? "lot" : "lots"}`;

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
   Pensada per a 1440 × 800 px útils (com edu-apps/Equacions i les apps germanes de química):
   s'amplia en pantalles grans i es redueix en portàtils perquè tot càpiga sense desplaçar-se.
   En mòbils (menys de 900 px) no s'escala. El mode projector fa servir una base més petita. */
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
  // Alçada útil petita (portàtils amb escalat del 150 %): es compacta la pregunta i el recipient.
  document.documentElement.classList.toggle("short", w >= MOBILE_W && h / z < 700);
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
    (f) => `<label class="check-row"><input type="checkbox" value="${f.id}" ${state.settings.families.includes(f.id) ? "checked" : ""} />${f.name}</label>`
  ).join("");
  el.familyMenu.querySelectorAll("input").forEach((input) =>
    input.addEventListener("change", () => {
      state.settings.families = [...el.familyMenu.querySelectorAll("input:checked")].map((i) => i.value);
      onFiltersChanged();
    })
  );
  const n = state.settings.families.length;
  el.familyTrigger.textContent = n === 0 ? "Totes les reaccions" : n === 1 ? FAMILIES.find((f) => f.id === state.settings.families[0]).name : `${n} famílies`;
}

function onFiltersChanged() {
  save(STORAGE.settings, state.settings);
  state.bag = {};
  renderFilters();
  renderActivities();
  if (state.mode === "apren") renderModule();
  else if (state.mode === "repte") startChallenge();
  else newQuestion();
}

const famOk = (rx) => !state.settings.families.length || rx.families.some((f) => state.settings.families.includes(f));

// Elements que pot fer servir una activitat amb els filtres actuals.
function poolFor(type) {
  const levels = state.settings.levels.filter((l) => (ACT_LEVELS[type] ?? []).includes(l));
  const items = [];
  levels.forEach((lvl) => {
    if (lvl <= 3) {
      REACTIONS.filter((rx) => rx.level === lvl && famOk(rx))
        .filter((rx) => !(type === "exacta" && rx.reactants.length === 1))
        .filter((rx) => !(type === "taula" && rx.analogy))
        .forEach((rx) => items.push({ id: rx.id, kind: type === "taula" ? "taula" : type, rx, level: lvl }));
    } else if (type === "taula") {
      PROBLEMS.filter((pb) => famOk(reactionById(pb.reaction))).forEach((pb) => items.push({ id: pb.id, kind: "moltaula", pb, rx: reactionById(pb.reaction), level: 4 }));
    } else if (type === "calcula") {
      PROBLEMS.filter((pb) => famOk(reactionById(pb.reaction))).forEach((pb) => items.push({ id: pb.id, kind: "calcula", pb, rx: reactionById(pb.reaction), level: 4 }));
      EXTRA.filter((ex) => famOk(reactionById(ex.reaction))).forEach((ex) => items.push({ id: ex.id, kind: "extra", ex, rx: reactionById(ex.reaction), level: 4 }));
    }
  });
  return items;
}

const available = (type) => poolFor(type).length > 0;

function renderActivities() {
  el.activityList.innerHTML = ACTIVITIES.map((a) => {
    const off = a.id !== "barreja" && !available(a.id);
    return `<button type="button" role="radio" class="activity-opt${off ? " off" : ""}" data-activity="${a.id}" aria-checked="${state.settings.activity === a.id}" ${off ? 'title="No disponible amb els nivells triats"' : ""}>
        <span class="activity-name">${a.name}</span><span class="activity-desc">${a.desc}</span></button>`;
  }).join("");
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

function nextItem(type) {
  const list = poolFor(type);
  if (!list.length) return null;
  const bag = (state.bag[type] = (state.bag[type] ?? []).filter((id) => list.some((it) => it.id === id)));
  if (!bag.length) state.bag[type] = shuffle(list.map((it) => it.id));
  const id = state.bag[type].pop();
  return list.find((it) => it.id === id);
}

function mixType() {
  const types = Object.entries(MIX_WEIGHTS).filter(([t]) => available(t));
  if (!types.length) return null;
  let r = Math.random() * types.reduce((s, [, w]) => s + w, 0);
  for (const [t, w] of types) {
    r -= w;
    if (r < 0) return t;
  }
  return types[0][0];
}

function makeQuestion(forcedType) {
  const type = forcedType ?? (state.settings.activity === "barreja" ? mixType() : state.settings.activity);
  if (!type) return null;
  const item = nextItem(type);
  if (!item) return { empty: true, type };
  const q = { type: item.kind, id: item.id, rx: item.rx, level: item.level, pb: item.pb, ex: item.ex, hintStep: 0, hintsShown: [], solved: false, solutionShown: false, ans: {}, disabled: [], step: 1 };
  if (["prediu", "limitant", "abans", "taula"].includes(q.type)) {
    const useKey = Math.random() < 0.45;
    q.q = useKey ? [...pick(item.rx.cases).q] : makeCase(item.rx, item.level).q;
    if (q.type === "limitant") {
      const R = react(item.rx, q.q);
      if (!R.single && !R.exact && R.limiting.length !== 1) q.q = makeCase(item.rx, item.level).q;
    }
  }
  if (q.type === "exacta") {
    q.target = exactaTarget(item.rx, item.level);
    q.ans.q = item.rx.reactants.map(() => 0);
  }
  if (q.type === "prediu") q.ans = { products: item.rx.products.map(() => 0), left: item.rx.reactants.map(() => 0) };
  if (q.type === "abans") q.ans.q = item.rx.reactants.map(() => 0);
  if (q.type === "taula") q.ans = { canvi: [], despres: [] };
  if (q.type === "moltaula") q.ans = { abans: [], canvi: [], despres: [] };
  if (q.type === "calcula") q.ans = { lim: null, mProduct: "", mLeft: "" };
  if (q.type === "extra") q.ans = { value: "" };
  return q;
}

/* ---------- Components ---------- */

const numStep = (key, value, label) => `
  <span class="num-step" data-key="${key}">
    <button type="button" class="step-btn" data-d="-1" aria-label="Treu-ne un a ${label}"><span class="pm minus" aria-hidden="true"></span></button>
    <input class="num-in" type="text" inputmode="numeric" value="${value}" aria-label="${label}" autocomplete="off" />
    <button type="button" class="step-btn" data-d="1" aria-label="Afegeix-ne un a ${label}"><span class="pm plus" aria-hidden="true"></span></button>
  </span>`;

const plainLabel = (s) => subLabel(s).replace(/<[^>]+>/g, "");

// Enllaça els comptadors: path = "products.0", "left.1", "q.0"...
function bindSteps(root, target, onChange, max = 40) {
  root.querySelectorAll(".num-step").forEach((box) => {
    const [field, idx] = box.dataset.key.split(".");
    const input = box.querySelector("input");
    const set = (v) => {
      const val = Math.max(0, Math.min(max, Number.isFinite(v) ? v : 0));
      target[field][Number(idx)] = val;
      input.value = String(val);
      onChange?.();
    };
    box.querySelectorAll(".step-btn").forEach((btn) => btn.addEventListener("click", () => set(target[field][Number(idx)] + Number(btn.dataset.d))));
    input.addEventListener("input", () => {
      const v = Number.parseInt(input.value, 10);
      target[field][Number(idx)] = Number.isFinite(v) ? Math.max(0, Math.min(max, v)) : 0;
      onChange?.();
    });
    input.addEventListener("focus", () => input.select());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (state.q?.solved) handleNext();
        else handleCheck();
      }
    });
  });
}

const ansRow = (s, key, value, readonly) => `
  <div class="ans-row">
    <span class="ans-icon">${particleHTML(s)}</span>
    <span class="ans-name">${subLabel(s)}</span>
    ${readonly ? `<b class="ans-fixed">${value}</b>` : numStep(key, value, plainLabel(s))}
  </div>`;

/* ---------- Pintar la pregunta ---------- */

const ACT_NAME = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a.name]));
ACT_NAME.moltaula = "Completa la taula";
ACT_NAME.extra = "Rendiment i puresa";

function renderQuestion() {
  const q = state.q;
  const rx = q.rx;
  const lvl = LEVELS.find((l) => l.id === q.level);
  el.qTags.innerHTML = [
    `<span class="tag activity">${ACT_NAME[q.type]}</span>`,
    `<span class="tag family">${rx.context}</span>`,
    `<span class="tag level l${lvl.id}">${lvl.name}</span>`,
  ].join("");
  const labels = {
    prediu: "Quants productes es formaran i quants reactius sobraran?",
    limitant: q.step === 2 ? "Per què? Tria l'explicació correcta." : "Quin reactiu s'acaba primer?",
    abans: "Aquests són els productes i els sobrants. Quants reactius hi havia al principi?",
    exacta: q.target ? `Posa els reactius justos per obtenir ${qty(rx.products[q.target.i], q.target.n)} sense que sobri res.` : "",
    taula: "Omple les caselles buides de la taula Abans / Canvi / Després.",
    moltaula: "Omple la taula en mols: abans, canvi i després.",
    calcula: q.pb ? `Calcula el reactiu limitant, la massa de ${fm(q.pb.main)} que s'obté i la massa que sobra.` : "",
    extra: "Resol el problema.",
  };
  el.qLabel.innerHTML = labels[q.type];
  el.qRecipe.innerHTML = q.type === "extra" ? `<p class="extra-text">${q.ex.text}</p>` : recipeHTML(rx, { compact: !rx.analogy });
  el.qKind.textContent = rx.analogy ? "Recepta" : q.level === 4 ? "Equació igualada (recepta en mols)" : "Recepta (equació igualada)";
  const renderers = { prediu: renderPredict, limitant: renderLimit, abans: renderBefore, exacta: renderExact, taula: renderTable, moltaula: renderMolTable, calcula: renderCalc, extra: renderExtra };
  renderers[q.type]();
  el.checkBtn.hidden = q.type === "limitant";
  renderHelp();
}

function reactorBlock(stage, q = state.q.q) {
  const rx = state.q.rx;
  // A «Què hi havia abans?» els àtoms delatarien la resposta: es mostren quan ja s'ha resolt.
  const atoms = state.q.type === "abans" && !state.q.solved ? "" : atomsHTML(rx, q, stage === "despres");
  return `<div class="reactor-wrap"><div class="reactor-host" id="reactorHost">${reactorHTML(rx, q, stage)}</div><div id="atomHost">${atoms}</div></div>`;
}

function renderPredict() {
  const q = state.q;
  const { rx } = q;
  const ro = q.solved;
  el.workArea.innerHTML = `
    <div class="work-grid">
      ${reactorBlock(q.solved ? "despres" : "abans")}
      <div class="answer-panel">
        <h3 class="ans-head">Què hi haurà després?</h3>
        <div class="ans-group"><span class="ans-title">Productes que es formen</span>
          ${rx.products.map((s, i) => ansRow(s, `products.${i}`, q.ans.products[i], ro)).join("")}</div>
        <div class="ans-group"><span class="ans-title">Reactius que sobren</span>
          ${rx.reactants.map((s, i) => ansRow(s, `left.${i}`, q.ans.left[i], ro)).join("")}</div>
      </div>
    </div>`;
  bindSteps(el.workArea, q.ans);
}

function renderLimit() {
  const q = state.q;
  const { rx } = q;
  const R = react(rx, q.q);
  const correct = limitantAnswer(rx, q.q);
  let options;
  if (q.step === 2) {
    options = q.justs.map((j) => {
      const cls = q.justSolved && j.id === "ok" ? " correct" : q.disabled.includes(j.id) ? " wrong" : "";
      return `<button type="button" class="opt${cls}" data-just="${j.id}" ${q.justSolved || q.disabled.includes(j.id) ? "disabled" : ""}><span class="opt-text">${j.text}</span></button>`;
    });
  } else {
    const opts = rx.reactants.map((s, i) => ({ key: String(i), html: `${particleHTML(s)}<span class="opt-text">${subLabel(s)}</span>` }));
    opts.push({ key: "exacta", html: `<span class="opt-text">Cap: estan en proporció exacta</span>` });
    if (R.single) opts.push({ key: "single", html: `<span class="opt-text">Només hi ha un reactiu</span>` });
    options = opts.map((o) => {
      const value = /^\d+$/.test(o.key) ? Number(o.key) : o.key;
      const cls = (q.solved || q.step === 2) && value === correct ? " correct" : q.disabled.includes(value) ? " wrong" : "";
      return `<button type="button" class="opt${cls}" data-choice="${o.key}" ${q.solved || q.step === 2 || q.disabled.includes(value) ? "disabled" : ""}>${o.html}</button>`;
    });
  }
  el.workArea.innerHTML = `
    <div class="work-grid">
      ${reactorBlock(q.solved ? "despres" : "abans")}
      <div class="answer-panel">
        <h3 class="ans-head">${q.step === 2 ? "Per què és el limitant?" : "El reactiu limitant és…"}</h3>
        <div class="limit-options">${options.join("")}</div>
      </div>
    </div>`;
  el.workArea.querySelectorAll("[data-choice]").forEach((btn) =>
    btn.addEventListener("click", () => handleLimitChoice(/^\d+$/.test(btn.dataset.choice) ? Number(btn.dataset.choice) : btn.dataset.choice))
  );
  el.workArea.querySelectorAll("[data-just]").forEach((btn) => btn.addEventListener("click", () => handleJustification(btn.dataset.just)));
}

function renderBefore() {
  const q = state.q;
  const { rx } = q;
  const ro = q.solved;
  el.workArea.innerHTML = `
    <div class="work-grid">
      ${reactorBlock(q.solved ? "abans" : "despres", q.solved ? q.q : q.q)}
      <div class="answer-panel">
        <h3 class="ans-head">Què hi havia abans?</h3>
        <div class="ans-group"><span class="ans-title">Reactius al principi</span>
          ${rx.reactants.map((s, i) => ansRow(s, `q.${i}`, q.ans.q[i], ro)).join("")}</div>
      </div>
    </div>`;
  bindSteps(el.workArea, q.ans);
}

function renderExact() {
  const q = state.q;
  const { rx } = q;
  const ro = q.solved;
  const T = rx.products[q.target.i];
  el.workArea.innerHTML = `
    <div class="work-grid">
      ${reactorBlock("abans", q.ans.q)}
      <div class="answer-panel">
        <h3 class="ans-head">Objectiu</h3>
        <div class="goal">${particleHTML(T)}<span><b>${q.target.n}</b> ${subLabel(T, q.target.n)}</span><span class="goal-tag">sense sobrants</span></div>
        <div class="ans-group"><span class="ans-title">Reactius que poses</span>
          ${rx.reactants.map((s, i) => ansRow(s, `q.${i}`, q.ans.q[i], ro)).join("")}</div>
      </div>
    </div>`;
  bindSteps(el.workArea, q.ans, () => {
    $("reactorHost").innerHTML = reactorHTML(rx, q.ans.q, "abans");
    $("atomHost").innerHTML = atomsHTML(rx, q.ans.q, false);
  });
}

function tableInput(row, i, value, wrong, label) {
  return `<input class="cell-in${wrong ? " wrong" : ""}" type="text" inputmode="decimal" data-row="${row}" data-i="${i}" value="${value ?? ""}" aria-label="${label}" autocomplete="off" />`;
}

function renderTable() {
  const q = state.q;
  const { rx } = q;
  const subs = [...rx.reactants, ...rx.products];
  const nR = rx.reactants.length;
  const R = react(rx, q.q);
  const wrong = q.tableWrong ?? { canvi: [], despres: [] };
  const sol = q.solved ? { canvi: [...rx.reactants.map((s) => -s.c * R.lots), ...R.products], despres: [...R.left, ...R.products] } : null;
  const sign = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : "0");
  const cell = (row, i) =>
    sol ? `<b class="cell-fixed">${row === "canvi" ? sign(sol[row][i]) : sol[row][i]}</b>` : tableInput(row, i, q.ans[row][i], wrong[row][i], `${row === "canvi" ? "Canvi" : "Després"} de ${plainLabel(subs[i])}`);
  el.workArea.innerHTML = `
    <div class="work-grid table-mode">
      ${reactorBlock(q.solved ? "despres" : "abans")}
      <div class="answer-panel wide">
        <h3 class="ans-head">Taula de la reacció</h3>
        <table class="abc-table">
          <thead><tr><th></th>${subs.map((s, i) => `<th class="${i < nR ? "th-r" : "th-p"}">${subLabel(s)}</th>`).join("")}</tr></thead>
          <tbody>
            <tr><th>Abans</th>${subs.map((_, i) => `<td><b class="cell-fixed">${i < nR ? q.q[i] : 0}</b></td>`).join("")}</tr>
            <tr><th>Canvi</th>${subs.map((_, i) => `<td>${cell("canvi", i)}</td>`).join("")}</tr>
            <tr><th>Després</th>${subs.map((_, i) => `<td>${cell("despres", i)}</td>`).join("")}</tr>
          </tbody>
        </table>
        <p class="table-note">Els reactius es gasten (−) i els productes es formen (+), sempre en la proporció de la recepta.</p>
      </div>
    </div>`;
  bindCells();
}

function bindCells() {
  el.workArea.querySelectorAll(".cell-in").forEach((input) => {
    input.addEventListener("input", () => {
      state.q.ans[input.dataset.row][Number(input.dataset.i)] = input.value;
      input.classList.remove("wrong");
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (state.q.solved) handleNext();
        else handleCheck();
      }
    });
  });
}

function renderMolTable() {
  const q = state.q;
  const S = solveProblem(q.pb);
  const { rx } = S;
  const subs = [...rx.reactants, ...rx.products];
  const nR = rx.reactants.length;
  const wrong = q.tableWrong ?? { abans: [], canvi: [], despres: [] };
  const sol = q.solved
    ? { abans: S.n, canvi: [...rx.reactants.map((s) => -s.c * S.x), ...S.products.map((p) => p.n)], despres: [...S.left.map((l) => l.n), ...S.products.map((p) => p.n)] }
    : null;
  const cell = (row, i) => {
    if (row === "abans" && i >= nR) return `<b class="cell-fixed">0</b>`;
    if (sol) {
      const v = sol[row][i];
      const text = row === "canvi" && Math.abs(v) > 1e-9 ? `${v > 0 ? "+" : "−"}${formatNum(Math.abs(v), 3)}` : formatNum(v, 3);
      return `<b class="cell-fixed">${text}</b>`;
    }
    return tableInput(row, i, q.ans[row][i], wrong[row][i], `${row} de ${plainLabel(subs[i])}`);
  };
  el.workArea.innerHTML = `
    <div class="calc-grid">
      <div class="data-card">
        <h3 class="ans-head">Dades</h3>
        <p>${listJoin(rx.reactants.map((s, i) => `<b>${formatNum(q.pb.grams[i])} g</b> de ${fm(s.f)}`))}.</p>
        ${massChipsHTML(subs)}
      </div>
      <div class="answer-panel wide">
        <h3 class="ans-head">Taula en mols</h3>
        <table class="abc-table">
          <thead><tr><th></th>${subs.map((s, i) => `<th class="${i < nR ? "th-r" : "th-p"}">${fm(s.f)}</th>`).join("")}</tr></thead>
          <tbody>
            <tr class="given"><th>Massa (g)</th>${subs.map((_, i) => `<td>${i < nR ? formatNum(q.pb.grams[i]) : "—"}</td>`).join("")}</tr>
            <tr class="given"><th>M (g/mol)</th>${subs.map((s) => `<td>${formatNum(molarMass(s.f))}</td>`).join("")}</tr>
            <tr><th>Abans (mol)</th>${subs.map((_, i) => `<td>${cell("abans", i)}</td>`).join("")}</tr>
            <tr><th>Canvi (mol)</th>${subs.map((_, i) => `<td>${cell("canvi", i)}</td>`).join("")}</tr>
            <tr><th>Després (mol)</th>${subs.map((_, i) => `<td>${cell("despres", i)}</td>`).join("")}</tr>
          </tbody>
        </table>
        <p class="table-note">Pots fer servir la coma decimal. S'accepten dos decimals.</p>
        ${q.solved ? massCheckHTML(S) : ""}
      </div>
    </div>`;
  bindCells();
}

function massChipsHTML(subs) {
  const els = [...new Set(subs.flatMap((s) => Object.keys(ATOMIC_MASS).filter((e) => new RegExp(`${e}(?![a-z])`).test(s.f))))];
  return `<div class="mass-row"><span class="ans-title">Masses atòmiques</span>${els.map((e) => `<span class="atom-chip"><b>${e}</b> ${formatNum(ATOMIC_MASS[e])}</span>`).join("")}</div>`;
}

function massCheckHTML(S) {
  const before = S.rx.reactants.reduce((s, _, i) => s + S.n[i] * S.M[i], 0);
  const after = S.products.reduce((s, p) => s + p.g, 0) + S.left.reduce((s, l) => s + l.g, 0);
  return `<div class="mass-check"><span>Massa inicial: <b>${formatNum(before)} g</b></span><span>Massa final: <b>${formatNum(after)} g</b></span><span class="ac-ok">La massa es conserva ✓</span></div>`;
}

function renderCalc() {
  const q = state.q;
  const S = solveProblem(q.pb);
  const { rx } = S;
  const P = rx.products[S.main];
  const ro = q.solved;
  const subs = [...rx.reactants, ...rx.products];
  const limBtns = rx.reactants
    .map((s, i) => {
      const on = q.ans.lim === i;
      const cls = q.solved && i === S.lim ? " correct" : on ? " picked" : "";
      return `<button type="button" class="opt small${cls}" data-lim="${i}" aria-pressed="${on}" ${ro ? "disabled" : ""}>${fm(s.f)}</button>`;
    })
    .join("");
  const val = (k, v) => (ro ? `<b class="cell-fixed">${formatNum(v)}</b>` : `<input class="cell-in big" type="text" inputmode="decimal" data-calc="${k}" value="${q.ans[k]}" autocomplete="off" aria-label="${k === "mProduct" ? "Massa de producte" : "Massa que sobra"}" />`);
  const solTable = q.solved
    ? `<table class="abc-table compact"><thead><tr><th></th>${subs.map((s) => `<th>${fm(s.f)}</th>`).join("")}</tr></thead><tbody>
        <tr><th>Abans (mol)</th>${subs.map((_, i) => `<td>${i < rx.reactants.length ? formatNum(S.n[i], 3) : "0"}</td>`).join("")}</tr>
        <tr><th>Després (mol)</th>${[...S.left.map((l) => l.n), ...S.products.map((p) => p.n)].map((v) => `<td>${formatNum(v, 3)}</td>`).join("")}</tr>
        <tr><th>Després (g)</th>${[...S.left.map((l) => l.g), ...S.products.map((p) => p.g)].map((v) => `<td>${formatNum(v)}</td>`).join("")}</tr>
      </tbody></table>${massCheckHTML(S)}`
    : "";
  el.workArea.innerHTML = `
    <div class="calc-grid">
      <div class="data-card">
        <h3 class="ans-head">Dades</h3>
        <p>Tens ${listJoin(rx.reactants.map((s, i) => `<b>${formatNum(q.pb.grams[i])} g</b> de ${fm(s.f)}`))}.</p>
        ${massChipsHTML(subs)}
        ${solTable}
      </div>
      <div class="answer-panel">
        <h3 class="ans-head">Resultats</h3>
        <div class="calc-row"><span class="ans-title">Reactiu limitant</span><div class="lim-btns">${limBtns}</div></div>
        <label class="calc-row"><span class="ans-title">Massa de ${fm(P.f)} que s'obté</span><span class="unit-in">${val("mProduct", S.products[S.main].g)}<span>g</span></span></label>
        <label class="calc-row"><span class="ans-title">Massa de reactiu en excés que sobra</span><span class="unit-in">${val("mLeft", S.left[S.excess].g)}<span>g</span></span></label>
      </div>
    </div>`;
  el.workArea.querySelectorAll("[data-lim]").forEach((btn) =>
    btn.addEventListener("click", () => {
      q.ans.lim = Number(btn.dataset.lim);
      renderCalc();
    })
  );
  el.workArea.querySelectorAll("[data-calc]").forEach((input) => {
    input.addEventListener("input", () => (q.ans[input.dataset.calc] = input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (q.solved) handleNext();
        else handleCheck();
      }
    });
  });
}

function renderExtra() {
  const q = state.q;
  const { ex } = q;
  el.workArea.innerHTML = `
    <div class="calc-grid">
      <div class="data-card">
        <h3 class="ans-head">Equació</h3>
        ${recipeHTML(q.rx, { compact: true })}
        ${massChipsHTML([...q.rx.reactants, ...q.rx.products])}
        ${q.solved ? `<ol class="steps-list">${ex.steps.map((s) => `<li>${s}</li>`).join("")}</ol>` : ""}
      </div>
      <div class="answer-panel">
        <h3 class="ans-head">${ex.kind === "rendiment" ? "Rendiment" : "Massa obtinguda"}</h3>
        <label class="calc-row"><span class="ans-title">Resultat</span><span class="unit-in">${
          q.solved ? `<b class="cell-fixed">${formatNum(ex.answer)}</b>` : `<input class="cell-in big" type="text" inputmode="decimal" id="extraIn" value="${q.ans.value}" autocomplete="off" aria-label="Resultat" />`
        }<span>${ex.unit}</span></span></label>
      </div>
    </div>`;
  const input = $("extraIn");
  input?.addEventListener("input", () => (q.ans.value = input.value));
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCheck();
    }
  });
}

/* ---------- Explora ---------- */

function exploreList() {
  const levels = state.settings.levels.filter((l) => l <= 3);
  const lv = levels.length ? levels : [1, 2, 3];
  return REACTIONS.filter((rx) => lv.includes(rx.level) && famOk(rx));
}

function startExplore(rxId) {
  const list = exploreList();
  const rx = (rxId && reactionById(rxId)) || (state.explore && list.find((r) => r.id === state.explore.rx.id)) || list[0] || REACTIONS[0];
  const q = state.explore?.rx === rx ? state.explore.q : [...rx.cases[0].q];
  state.explore = { rx, q, stage: "abans" };
  state.q = null;
  renderExplore();
}

function renderExplore() {
  const ex = state.explore;
  const { rx } = ex;
  const list = exploreList();
  if (!list.includes(rx)) list.unshift(rx);
  const lvl = LEVELS.find((l) => l.id === rx.level);
  el.qTags.innerHTML = `<span class="tag activity">Explora</span><span class="tag family">${rx.context}</span><span class="tag level l${lvl.id}">${lvl.name}</span>`;
  el.qLabel.textContent = "Tria la reacció i les quantitats, i fes reaccionar.";
  el.qRecipe.innerHTML = recipeHTML(rx, { compact: !rx.analogy });
  el.qKind.textContent = rx.analogy ? "Recepta" : "Recepta (equació igualada)";
  const groups = LEVELS.filter((l) => l.id <= 3)
    .map((l) => {
      const items = list.filter((r) => r.level === l.id);
      return items.length ? `<optgroup label="${l.name}">${items.map((r) => `<option value="${r.id}" ${r === rx ? "selected" : ""}>${r.context}</option>`).join("")}</optgroup>` : "";
    })
    .join("");
  const speeds = [["lent", "Lent"], ["normal", "Normal"], ["rapid", "Ràpid"]]
    .map(([k, t]) => `<button type="button" class="seg${state.settings.speed === k ? " on" : ""}" data-speed="${k}" aria-pressed="${state.settings.speed === k}">${t}</button>`)
    .join("");
  el.workArea.innerHTML = `
    <div class="work-grid">
      <div class="reactor-wrap"><div class="reactor-host" id="reactorHost">${reactorHTML(rx, ex.q, ex.stage)}</div><div id="atomHost">${atomsHTML(rx, ex.q, ex.stage === "despres")}</div></div>
      <div class="answer-panel">
        <label class="ans-title" for="rxSelect">Reacció</label>
        <select id="rxSelect" class="rx-select">${groups}</select>
        <div class="ans-group"><span class="ans-title">Reactius al recipient</span>
          ${rx.reactants.map((s, i) => ansRow(s, `q.${i}`, ex.q[i], false)).join("")}</div>
        <div class="explore-actions">
          <button type="button" class="primary-btn" id="reactBtn">Fes reaccionar ▶</button>
          <button type="button" class="action-btn ghost small" id="resetBtn">Torna a començar</button>
        </div>
        <div class="speed"><span class="ans-title">Velocitat</span><div class="segmented">${speeds}</div></div>
      </div>
    </div>`;
  $("rxSelect").addEventListener("change", (event) => {
    stopAnim();
    const next = reactionById(event.target.value);
    state.explore = { rx: next, q: [...next.cases[0].q], stage: "abans" };
    setFeedback("");
    renderExplore();
  });
  bindSteps(el.workArea, ex, () => {
    stopAnim();
    ex.stage = "abans";
    $("reactorHost").innerHTML = reactorHTML(rx, ex.q, "abans");
    $("atomHost").innerHTML = atomsHTML(rx, ex.q, false);
    setFeedback("");
  }, 18);
  $("reactBtn").addEventListener("click", () => {
    if (react(rx, ex.q).lots < 1) {
      setFeedback("Amb aquestes quantitats no es pot formar cap lot: afegeix reactius.", "hint");
      return;
    }
    animate(rx, ex.q, () => {
      ex.stage = "despres";
      const R = react(rx, ex.q);
      const parts = [summaryHTML(rx, ex.q)];
      if (R.incomplete) parts.push(incompleteNote(rx, R));
      setFeedback(parts.join(" "), "success");
      renderHelpExplore();
    });
  });
  $("resetBtn").addEventListener("click", () => {
    stopAnim();
    ex.stage = "abans";
    setFeedback("");
    renderExplore();
  });
  el.workArea.querySelectorAll("[data-speed]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.settings.speed = btn.dataset.speed;
      save(STORAGE.settings, state.settings);
      el.workArea.querySelectorAll("[data-speed]").forEach((b) => {
        b.classList.toggle("on", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
    })
  );
  renderHelpExplore();
}

function renderHelpExplore() {
  const { rx } = state.explore;
  el.helpBody.innerHTML = `
    <ul class="tips-list">
      <li>Canvia les quantitats amb els botons − i +.</li>
      <li>Prem <b>Fes reaccionar</b> i mira com es formen els lots.</li>
      <li>Busca quantitats amb què no sobri res.</li>
    </ul>
    <div class="life-card"><b>A la vida real:</b> ${rx.life}</div>`;
}

/* ---------- Animació ---------- */

function stopAnim() {
  state.stopAnim?.();
  state.stopAnim = null;
}

function animate(rx, q, onDone) {
  stopAnim();
  const host = $("reactorHost");
  if (!host) return;
  $("atomHost").innerHTML = atomsHTML(rx, q, false);
  state.stopAnim = playReaction(host, rx, q, {
    speed: state.settings.speed,
    onDone: () => {
      state.stopAnim = null;
      const atomHost = $("atomHost");
      if (atomHost) atomHost.innerHTML = atomsHTML(rx, q, true);
      onDone?.();
    },
  });
}

function summaryHTML(rx, q) {
  const R = react(rx, q);
  const prods = listJoin(rx.products.map((s, i) => qty(s, R.products[i])));
  const lefts = rx.reactants.map((s, i) => (R.left[i] ? qty(s, R.left[i]) : "")).filter(Boolean);
  return `S'han fet ${lotsWord(R.lots)}: es formen ${prods} i ${lefts.length ? `sobren ${listJoin(lefts)}` : "no sobra res"}.`;
}

/* ---------- Panell d'ajuda ---------- */

const TYPE_TIPS = {
  prediu: ["Agrupa els reactius en lots iguals a la recepta.", "Compta quants lots pots fer amb cada reactiu.", "El valor més petit és el nombre de lots que es fan."],
  limitant: ["El limitant és el que s'acaba primer.", "No miris quantes en tens: mira quants lots en pots fer.", "Lots possibles = quantitat ÷ coeficient."],
  abans: ["Els productes et diuen quants lots s'han fet.", "Cada lot ha gastat els reactius de la recepta.", "Al principi hi havia el que s'ha gastat més el que ha sobrat."],
  exacta: ["Perquè no sobri res, tots els reactius han de donar per al mateix nombre de lots.", "Calcula primer quants lots necessites."],
  taula: ["Abans: el que hi ha al principi; els productes comencen a 0.", "Canvi: lots × coeficient, en negatiu per als reactius i en positiu per als productes.", "Després: abans + canvi."],
  moltaula: ["Abans: mols = massa ÷ massa molar.", "Divideix els mols pel coeficient: el valor més petit indica el limitant.", "Canvi = aquest valor × coeficient. Després = abans + canvi."],
  calcula: ["Passa les masses a mols: n = m ÷ M.", "Divideix els mols de cada reactiu pel seu coeficient.", "El valor més petit indica el limitant."],
  extra: ["Rendiment = massa obtinguda ÷ massa teòrica × 100.", "Massa pura = massa de la mostra × percentatge de puresa ÷ 100."],
};

function questionHints(q) {
  if (q.type === "calcula") return calcHints(q.pb);
  if (q.type === "moltaula") return molTableHints(q.pb);
  if (q.type === "extra") return q.ex.steps;
  return hints(q.type, q.rx, q.type === "exacta" ? null : q.q, { target: q.target });
}

function lifeHTML(q) {
  const note = q.pb?.note ? `<p class="life-note">${q.pb.note}</p>` : "";
  return `<div class="life-card"><b>A la vida real:</b> ${q.rx.life}</div>${note}`;
}

function renderHelp() {
  const q = state.q;
  if (!q) {
    el.helpBody.innerHTML = "";
    return;
  }
  if (q.solved) {
    el.helpBody.innerHTML = `<p class="help-recipe">${q.rx.context}</p>${lifeHTML(q)}`;
    return;
  }
  const tips = TYPE_TIPS[q.type].map((t) => `<li>${t}</li>`).join("");
  const given = q.hintsShown.map((h, i) => `<li><b>Pista ${i + 1}.</b> ${h}</li>`).join("");
  el.helpBody.innerHTML = `<ul class="tips-list">${tips}</ul>${given ? `<ol class="hints-list">${given}</ol>` : ""}`;
}

/* ---------- Estat, missatges i marcador ---------- */

function setStatus(kind) {
  const map = { idle: ["?", "Sense respondre", ""], ok: ["✓", "Correcte", "ok"], bad: ["✗", "Torna-ho a provar", "bad"], explore: ["▶", "Explora", ""] };
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
}

/* ---------- Preguntes ---------- */

function newQuestion() {
  stopAnim();
  setFeedback("");
  const exploring = state.mode === "practica" && state.settings.activity === "explora";
  document.querySelector(".action-bar").classList.toggle("exploring", exploring);
  if (exploring) {
    setStatus("explore");
    startExplore();
    return;
  }
  state.explore = null;
  const q = makeQuestion();
  if (!q || q.empty) {
    state.q = null;
    el.qTags.innerHTML = "";
    el.qLabel.textContent = q?.empty ? "Aquesta activitat no està disponible amb els nivells triats." : "No hi ha reaccions amb aquests filtres.";
    el.qRecipe.innerHTML = "";
    el.qKind.textContent = q?.empty ? `«${ACT_NAME[q.type]}» és per als nivells ${ACT_LEVELS[q.type].map((l) => LEVELS[l - 1].name).join(", ")}. Activa'n algun o tria una altra activitat.` : "Activa un altre nivell o tria una altra família.";
    el.workArea.innerHTML = "";
    setStatus("idle");
    renderHelp();
    lockControls(true);
    el.nextBtn.hidden = true;
    return;
  }
  state.q = q;
  setStatus("idle");
  renderQuestion();
  lockControls(false);
}

function tableAnswer(row, n) {
  return Array.from({ length: n }, (_, i) => {
    const raw = state.q.ans[row][i];
    const v = parseNum(raw);
    return v;
  });
}

function handleCheck() {
  const q = state.q;
  if (!q || q.solved) return;
  const { rx } = q;
  let res;
  switch (q.type) {
    case "prediu":
      res = diagnosePredict(rx, q.q, q.ans);
      break;
    case "abans":
      res = diagnoseBefore(rx, q.q, q.ans.q);
      break;
    case "exacta":
      if (q.ans.q.every((x) => x === 0)) return setFeedback("Posa algun reactiu al recipient.", "hint");
      res = diagnoseExact(rx, q.target, q.ans.q);
      break;
    case "taula": {
      const n = rx.reactants.length + rx.products.length;
      const ans = { canvi: tableAnswer("canvi", n), despres: tableAnswer("despres", n) };
      if ([...ans.canvi, ...ans.despres].some((v) => v === null)) return setFeedback("Escriu un nombre a cada casella.", "hint");
      res = checkTable(rx, q.q, ans);
      q.tableWrong = res.wrong;
      if (!res.ok) res.code = res.message === MESSAGES.E7() ? "E7" : "generic";
      break;
    }
    case "moltaula": {
      const nR = rx.reactants.length;
      const n = nR + rx.products.length;
      const ans = { abans: tableAnswer("abans", nR), canvi: tableAnswer("canvi", n), despres: tableAnswer("despres", n) };
      if ([...ans.abans, ...ans.canvi, ...ans.despres].some((v) => v === null)) return setFeedback("Escriu un nombre a cada casella. Pots fer servir la coma decimal.", "hint");
      res = checkMolTable(q.pb, ans);
      q.tableWrong = res.wrong;
      if (!res.ok) res.code = "generic";
      break;
    }
    case "calcula": {
      const mProduct = parseNum(q.ans.mProduct);
      const mLeft = parseNum(q.ans.mLeft);
      if (q.ans.lim === null) return setFeedback("Tria quin és el reactiu limitant.", "hint");
      if (mProduct === null || mLeft === null) return setFeedback("Escriu les dues masses en grams. Pots fer servir la coma decimal.", "hint");
      res = diagnoseCalc(q.pb, { lim: q.ans.lim, mProduct, mLeft });
      break;
    }
    case "extra": {
      const v = parseNum(q.ans.value);
      if (v === null) return setFeedback("Escriu un nombre. Pots fer servir la coma decimal.", "hint");
      res = near(v, q.ex.answer) ? { ok: true } : { ok: false, code: "generic", message: "Encara no. Revisa els passos: fes servir la Pista si la necessites." };
      break;
    }
    default:
      return;
  }
  if (res.ok) onCorrect(res);
  else {
    onWrong(res.message, res.code);
    if (q.type === "taula") renderTable();
    if (q.type === "moltaula") renderMolTable();
  }
}

function handleLimitChoice(choice) {
  const q = state.q;
  if (!q || q.solved || q.step !== 1) return;
  const res = diagnoseLimit(q.rx, q.q, choice);
  if (!res.ok) {
    q.disabled.push(choice);
    onWrong(res.message, res.code);
    if (!q.solved) renderLimit();
    return;
  }
  const R = res.R;
  if (q.level >= 3 && !R.single && !R.exact) {
    q.step = 2;
    q.disabled = [];
    const coefs = q.rx.reactants.map((s) => s.c);
    const e2 = JUSTIFICATIONS.find((j) => j.id === "E2");
    const e2text = coefs[choice] === Math.max(...coefs) ? "Perquè té el coeficient més gran." : e2.text;
    q.justs = shuffle([JUSTIFICATIONS[0], JUSTIFICATIONS[1], { id: "E2", text: e2text }]);
    setFeedback(`Correcte: el reactiu limitant és ${subLabel(q.rx.reactants[choice])}. Ara tria per què.`, "hint");
    el.qLabel.innerHTML = "Per què? Tria l'explicació correcta.";
    renderLimit();
    return;
  }
  onCorrect(res);
}

function handleJustification(id) {
  const q = state.q;
  if (!q || q.solved) return;
  if (id === "ok") {
    q.justSolved = true;
    onCorrect(diagnoseLimit(q.rx, q.q, limitantAnswer(q.rx, q.q)));
    return;
  }
  q.disabled.push(id);
  const R = react(q.rx, q.q);
  const msg = id === "E1" ? "No depèn de quantes partícules hi ha, sinó de quants lots se'n poden fer." : "El coeficient sol no ho decideix: cal dividir la quantitat pel coeficient.";
  onWrong(msg, id);
  if (!q.solved) renderLimit();
  void R;
}

function recordError(code) {
  if (!code || code === "generic") return;
  const key = code.startsWith("E4") ? "E4" : code;
  if (!ERROR_INFO[key]) return;
  state.stats.errors = state.stats.errors ?? {};
  state.stats.errors[key] = (state.stats.errors[key] ?? 0) + 1;
}

function onWrong(message, code) {
  state.stats.attempts += 1;
  state.stats.streak = 0;
  recordError(code);
  updateScoreboard();
  setStatus("bad");
  if (state.mode === "repte") {
    onChallengeMiss(message, code);
    return;
  }
  setFeedback(message, "error");
}

function explanation(q, res) {
  const { rx } = q;
  switch (q.type) {
    case "prediu":
    case "taula":
      return summaryHTML(rx, q.q);
    case "limitant": {
      const R = res.R ?? react(rx, q.q);
      if (R.single) return "Només hi ha un reactiu: no pot ser limitant ni estar en excés.";
      if (R.exact) return `No sobra res: tots els reactius donen per a ${lotsWord(R.lots)}.`;
      return `El reactiu limitant és ${subLabel(rx.reactants[R.limiting[0]])}: només n'hi ha per a ${lotsWord(R.lots)}.`;
    }
    case "abans":
      return `Al principi hi havia ${listJoin(rx.reactants.map((s, i) => qty(s, q.q[i])))}.`;
    case "exacta":
      return `Amb ${listJoin(rx.reactants.map((s, i) => qty(s, q.ans.q[i])))} es fan ${lotsWord(q.target.lots)} justos i no sobra res.`;
    case "moltaula":
    case "calcula": {
      const S = solveProblem(q.pb);
      const P = S.rx.products[S.main];
      return `El limitant és ${fm(S.rx.reactants[S.lim].f)}. S'obtenen ${formatNum(S.products[S.main].g)} g de ${fm(P.f)} i sobren ${formatNum(S.left[S.excess].g)} g de ${fm(S.rx.reactants[S.excess].f)}.`;
    }
    case "extra":
      return `El resultat és ${formatNum(q.ex.answer)} ${q.ex.unit}.`;
    default:
      return "";
  }
}

const PARTICLE_TYPES = ["prediu", "limitant", "abans", "exacta", "taula"];

function finishSolved(q, parts, kind) {
  setFeedback(parts.filter(Boolean).join(" "), kind);
  renderQuestion();
  lockControls(true);
  if (PARTICLE_TYPES.includes(q.type)) {
    const qq = q.type === "exacta" ? q.ans.q : q.q;
    if (q.type === "abans") $("reactorHost").innerHTML = reactorHTML(q.rx, qq, "abans");
    animate(q.rx, qq);
  }
}

function onCorrect(res) {
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
    state.progress[q.id] = true;
    save(STORAGE.progress, state.progress);
    celebrate();
  }
  updateScoreboard();
  const R = PARTICLE_TYPES.includes(q.type) ? react(q.rx, q.type === "exacta" ? q.ans.q : q.q) : null;
  const parts = [`<strong>${pick(SUCCESS)}</strong>`, explanation(q, res)];
  if (R?.incomplete) parts.push(incompleteNote(q.rx, R));
  finishSolved(q, parts, "success");
  if (state.mode === "repte") onChallengeSolved();
  else el.nextBtn.focus({ preventScroll: true });
}

function handleHint() {
  const q = state.q;
  if (!q || q.solved || state.mode === "repte") return;
  const list = questionHints(q);
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

function fillSolution(q) {
  const { rx } = q;
  if (q.type === "prediu") {
    const R = react(rx, q.q);
    q.ans = { products: [...R.products], left: [...R.left] };
  }
  if (q.type === "abans") q.ans.q = [...q.q];
  if (q.type === "exacta") q.ans.q = rx.reactants.map((s) => s.c * q.target.lots);
  if (q.type === "limitant") {
    q.step = 1;
    q.justSolved = true;
  }
  if (q.type === "calcula") q.ans.lim = solveProblem(q.pb).lim;
}

function handleSolution() {
  const q = state.q;
  if (!q || q.solved || state.mode === "repte") return;
  q.solutionShown = true;
  q.solved = true;
  state.stats.streak = 0;
  updateScoreboard();
  fillSolution(q);
  setStatus("idle");
  finishSolved(q, [`<strong>Solució:</strong>`, explanation(q, {}), "No compta com a encert."], "hint");
}

function handleNext() {
  if (state.mode === "repte") nextChallengeQuestion();
  else newQuestion();
}

/* ---------- Mode Repte ---------- */

function startChallenge() {
  stopAnim();
  state.explore = null;
  document.querySelector(".action-bar").classList.remove("exploring");
  state.challenge = {
    index: 0, points: 0, results: [], tries: CHALLENGE_TRIES, seen: new Set(),
    resultId: globalThis.crypto?.randomUUID?.() || `reactius-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    startedAt: Date.now(), errors: {},
  };
  nextChallengeQuestion(true);
}

function nextChallengeQuestion(first = false) {
  const c = state.challenge;
  if (!first) c.index += 1;
  if (c.index >= CHALLENGE_SIZE) {
    finishChallenge();
    return;
  }
  stopAnim();
  c.tries = CHALLENGE_TRIES;
  let q = null;
  for (let i = 0; i < 12; i += 1) {
    const type = mixType();
    q = type ? makeQuestion(type) : null;
    if (!q || q.empty || !c.seen.has(q.id)) break;
  }
  if (!q || q.empty) {
    state.q = null;
    newQuestion();
    return;
  }
  state.q = q;
  c.seen.add(q.id);
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

function onChallengeMiss(message, code) {
  const c = state.challenge;
  const q = state.q;
  const key = code?.startsWith("E4") ? "E4" : code;
  if (Object.hasOwn(ERROR_INFO, key)) c.errors[key] = (c.errors[key] ?? 0) + 1;
  c.tries -= 1;
  renderChallengeBar();
  if (c.tries > 0) {
    setFeedback(`${message} <strong>Et queda un intent.</strong>`, "error");
    if (q.type === "limitant") renderLimit();
    return;
  }
  q.solved = true;
  q.solutionShown = true;
  c.results.push(0);
  fillSolution(q);
  finishSolved(q, [message, `<strong>Solució:</strong> ${explanation(q, {})}`], "error");
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

function finishChallenge() {
  const c = state.challenge;
  if (c.results.length !== CHALLENGE_SIZE || el.resultDialog.open) return;
  const max = CHALLENGE_SIZE * 2;
  const stars = c.points >= 18 ? 3 : c.points >= 14 ? 2 : c.points >= 8 ? 1 : 0;
  const verdicts = [
    "Torna a mirar el mòdul «Reactiu limitant i en excés» i prova-ho de nou.",
    "Vas pel bon camí. Practica una mica més amb els lots.",
    "Molt bé! Repassa els casos en què fallaves.",
    "Excel·lent! Domines el reactiu limitant.",
  ];
  el.resultStars.innerHTML = [1, 2, 3].map((i) => `<span class="${i <= stars ? "on" : ""}">★</span>`).join("");
  el.resultPoints.textContent = `${c.points} punts de ${max}`;
  el.resultVerdict.textContent = verdicts[stars];
  const first = c.results.filter((p) => p === 2).length;
  const second = c.results.filter((p) => p === 1).length;
  el.resultDetail.textContent = `${first} a la primera, ${second} a la segona i ${CHALLENGE_SIZE - first - second} sense encertar. Encertar a la primera val 2 punts; a la segona, 1.`;
  el.resultDialog.showModal();
  c.payload ??= {
    resultat_id: c.resultId,
    results: [...c.results],
    levels: LEVELS.filter((level) => state.settings.levels.includes(level.id)).map((level) => level.name),
    elapsedSeconds: Math.floor((Date.now() - c.startedAt) / 1000),
    errors: Object.entries(c.errors).map(([code, count]) => ({ code, count, description: ERROR_INFO[code] })),
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
    const response = await window.parent.aulaCreActivaSaveReactiusResult(c.payload);
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

/* ---------- Modes ---------- */

function setMode(mode) {
  stopAnim();
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

function miniLab(id, demo) {
  const rx = reactionById(demo.rx);
  return `
    <section class="mini-lab" data-lab="${id}">
      ${demo.caption ? `<p class="mini-caption">${richText(demo.caption)}</p>` : ""}
      <div class="mini-recipe">${recipeHTML(rx, { compact: !rx.analogy })}</div>
      <div class="mini-grid">
        <div class="reactor-wrap"><div class="reactor-host">${reactorHTML(rx, demo.q, "abans")}</div><div class="atom-host">${demo.atoms ? atomsHTML(rx, demo.q, false) : ""}</div></div>
        <div class="mini-controls">
          ${demo.editable ? rx.reactants.map((s, i) => ansRow(s, `q.${i}`, demo.q[i], false)).join("") : ""}
          <div class="explore-actions">
            <button type="button" class="primary-btn" data-react>Fes reaccionar ▶</button>
            <button type="button" class="action-btn ghost small" data-reset>Torna a començar</button>
          </div>
          <p class="mini-summary" aria-live="polite"></p>
        </div>
      </div>
    </section>`;
}

function bindMiniLab(root, demo) {
  const rx = reactionById(demo.rx);
  const st = { q: [...demo.q] };
  const host = root.querySelector(".reactor-host");
  const atomHost = root.querySelector(".atom-host");
  const summary = root.querySelector(".mini-summary");
  let stop = null;
  const reset = () => {
    stop?.();
    host.innerHTML = reactorHTML(rx, st.q, "abans");
    atomHost.innerHTML = demo.atoms ? atomsHTML(rx, st.q, false) : "";
    summary.innerHTML = "";
  };
  bindSteps(root, st, reset, 18);
  root.querySelector("[data-reset]").addEventListener("click", reset);
  root.querySelector("[data-react]").addEventListener("click", () => {
    stop?.();
    const R = react(rx, st.q);
    if (R.lots < 1) {
      summary.textContent = "Amb aquestes quantitats no es pot formar cap lot.";
      return;
    }
    stop = playReaction(host, rx, st.q, {
      speed: state.settings.speed,
      onDone: () => {
        if (demo.atoms) atomHost.innerHTML = atomsHTML(rx, st.q, true);
        const lim = R.single || R.exact ? "" : ` El reactiu limitant és ${subLabel(rx.reactants[R.limiting[0]])}.`;
        summary.innerHTML = `${summaryHTML(rx, st.q)}${lim}`;
      },
    });
  });
}

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

  const cards = current.cards.map((c) => `<section class="learn-box"><h3>${c.title}</h3>${richText(c.html)}</section>`).join("");
  const recipes = current.recipes
    ? `<div class="recipe-gallery">${current.recipes.map((id) => {
        const rx = reactionById(id);
        return `<div class="recipe-card">${recipeHTML(rx, { compact: !rx.analogy })}<p class="muted">${rx.analogy ? "La recepta de l'entrepà" : "La recepta de l'aigua"}</p></div>`;
      }).join("")}</div>`
    : "";
  const rule = current.rule ? `<p class="rule-box">${current.rule}</p>` : "";
  const steps = current.steps ? `<section class="learn-box wide"><h3>Passos per resoldre un problema</h3><ol class="steps-list">${current.steps.map((s) => `<li>${s}</li>`).join("")}</ol></section>` : "";
  const table = current.table
    ? `<section class="learn-box wide"><h3>Exemple</h3><p>${richText(current.table.caption)}</p>
        <table class="abc-table"><thead><tr>${current.table.head.map((h) => `<th>${h ? fm(h) : ""}</th>`).join("")}</tr></thead>
        <tbody>${current.table.rows.map((r) => `<tr><th>${r[0]}</th>${r.slice(1).map((v) => `<td>${v}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`
    : "";
  const demo = current.demo ? miniLab("demo", current.demo) : "";
  const pair = current.pair ? `<div class="pair-labs">${current.pair.map((d, i) => miniLab(`pair${i}`, { ...d, editable: false })).join("")}</div>` : "";
  const gallery = current.gallery
    ? `<div class="gallery">${REACTIONS.filter((rx) => !rx.analogy && state.settings.levels.some((l) => l >= rx.level || l === 4))
        .map((rx) => `<div class="gallery-card"><span class="g-title">${rx.context}</span><span class="g-eq">${recipeHTML(rx, { compact: true })}</span><span class="g-ctx">${rx.life}</span>
          <button type="button" class="action-btn ghost small" data-try="${rx.id}">Prova-ho al laboratori</button></div>`)
        .join("")}</div>`
    : "";
  const idx = MODULES.indexOf(current);
  el.moduleCard.innerHTML = `
    <header class="learn-head">
      <span class="learn-kicker">Mòdul ${current.num}</span>
      <h2>${current.title}</h2>
      <p class="learn-intro">${richText(current.intro)}</p>
    </header>
    ${demo}
    <div class="learn-boxes">${cards}${steps}${table}</div>
    ${rule}${recipes}${pair}${gallery}
    <footer class="learn-foot">
      ${idx > 0 ? `<button type="button" class="action-btn ghost" data-go="${MODULES[idx - 1].id}">← ${MODULES[idx - 1].title}</button>` : "<span></span>"}
      <button type="button" class="primary-btn" id="practiseBtn">Practica</button>
      ${idx < MODULES.length - 1 ? `<button type="button" class="action-btn ghost" data-go="${MODULES[idx + 1].id}">${MODULES[idx + 1].title} →</button>` : "<span></span>"}
    </footer>`;
  if (current.demo) bindMiniLab(el.moduleCard.querySelector('[data-lab="demo"]'), current.demo);
  current.pair?.forEach((d, i) => bindMiniLab(el.moduleCard.querySelector(`[data-lab="pair${i}"]`), { ...d, editable: false }));
  el.moduleCard.querySelectorAll("[data-go]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.settings.module = btn.dataset.go;
      save(STORAGE.settings, state.settings);
      renderModule();
      el.moduleCard.scrollTop = 0;
    })
  );
  el.moduleCard.querySelectorAll("[data-try]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const rx = reactionById(btn.dataset.try);
      if (!state.settings.levels.includes(rx.level)) state.settings.levels = [...new Set([...state.settings.levels, rx.level])].sort();
      state.settings.activity = "explora";
      state.settings.families = [];
      save(STORAGE.settings, state.settings);
      renderFilters();
      renderActivities();
      state.explore = { rx, q: [...rx.cases[0].q], stage: "abans" };
      setMode("practica");
    })
  );
  $("practiseBtn").addEventListener("click", () => setMode("practica"));
}

/* ---------- Diàleg: glossari i progrés ---------- */

function renderGlossary() {
  el.glossaryList.innerHTML = GLOSSARY.map(([t, d]) => `<div class="gloss-item"><dt>${t}</dt><dd>${d}</dd></div>`).join("");
  el.massChips.innerHTML = Object.entries(ATOMIC_MASS)
    .map(([e, m]) => `<span class="atom-chip"><b>${e}</b> ${formatNum(m)}</span>`)
    .join("");
}

const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);

function itemsOfLevel(level) {
  if (level <= 3) return REACTIONS.filter((rx) => rx.level === level).map((rx) => rx.id);
  return [...PROBLEMS.map((p) => p.id), ...EXTRA.map((e) => e.id)];
}

function renderProgress() {
  const all = LEVELS.flatMap((l) => itemsOfLevel(l.id));
  const solved = all.filter((id) => state.progress[id]);
  const { attempts, correct, bestStreak = 0, streak } = state.stats;
  const cards = [
    ["Reaccions resoltes", solved.length, "blue"],
    ["Encerts", correct, "green"],
    ["Intents", attempts, "slate"],
    ["Precisió", attempts ? `${pct(correct, attempts)}<small>%</small>` : "—", "amber"],
    ["Millor ratxa", Math.max(bestStreak, streak), "violet"],
  ];
  el.statCards.innerHTML = cards.map(([label, value, tone]) => `<div class="stat-card ${tone}"><span class="stat-value">${value}</span><span class="stat-label">${label}</span></div>`).join("");
  el.levelCards.innerHTML = LEVELS.map((level) => {
    const list = itemsOfLevel(level.id);
    const done = list.filter((id) => state.progress[id]).length;
    const p = pct(done, list.length);
    return `<div class="level-card l${level.id}">
        <div class="ring" style="--p:${Math.max(p, done ? 2 : 0)}" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${list.length}" aria-label="${level.name}"><span>${p}%</span></div>
        <div class="level-info"><strong>${level.name}</strong><span class="level-num">${done}/${list.length}</span><small>${level.course}</small></div>
      </div>`;
  }).join("");
  const errors = Object.entries(state.stats.errors ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 4);
  el.errorList.innerHTML = errors.length
    ? errors.map(([code, n]) => `<div class="progress-row"><span class="progress-name">${ERROR_INFO[code]}</span><span class="progress-num">${n} ${n === 1 ? "vegada" : "vegades"}</span></div>`).join("")
    : '<p class="muted">Encara no hi ha errors registrats.</p>';
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
  if (!el.glossaryList.childElementCount) renderGlossary();
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

  el.glossaryBtn.addEventListener("click", () => openInfo("glossari"));
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
    state.stats = { attempts: 0, correct: 0, streak: 0, bestStreak: 0, errors: {} };
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
    resizeTimer = setTimeout(() => {
      fitScale();
      fitReactors();
    }, 60);
  });

  // Cada vegada que es dibuixa un recipient, s'ajusta la mida de les partícules a l'espai.
  let fitFrame = 0;
  new MutationObserver(() => {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => fitReactors());
  }).observe(document.body, { childList: true, subtree: true });
}

function init() {
  state.settings = load(STORAGE.settings, state.settings);
  state.stats = load(STORAGE.stats, state.stats);
  state.progress = load(STORAGE.progress, {});
  applyProjector();
  renderFilters();
  renderActivities();
  attachEvents();
  updateScoreboard();
  setMode("practica");
}

init();

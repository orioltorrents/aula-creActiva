// Recipient del laboratori: dibuixa les partícules i anima la reacció en tres fases.
//   abans     → reactius separats per substància
//   lots      → els reactius s'agrupen en lots iguals a la recepta (el que no fa un lot sencer, a part)
//   lots-done → cada lot es transforma en els productes de la recepta
//   despres   → productes i sobrants

import { moleculeSVG } from "./molecules.js";
import { formulaHTML, formulaText } from "./chem.js";
import { ICONS } from "./icons.js";
import { IONIC, PIECES } from "./reaccions.js";
import { react, atomBalance, subLabel } from "./motor.js";

const fm = (f) => `<span class="fm">${formulaHTML(f)}</span>`;
const plain = (s, n = 2) => (s.p ? (n === 1 ? PIECES[s.p].one : PIECES[s.p].many) : formulaText(s.f));

export function particleHTML(s) {
  if (s.p) return `<span class="pt piece">${ICONS[s.p]}</span>`;
  const m = moleculeSVG(s.f);
  const w = Math.min(Math.max(m.aspect, 0.8), 2.4);
  return `<span class="pt mol${IONIC.has(s.f) ? " ionic" : ""}" style="--a:${w.toFixed(2)}">${m.markup}</span>`;
}

const many = (s, n) => Array.from({ length: n }, () => particleHTML(s)).join("");

// Recepta: coeficient, model i fórmula de cada terme, amb el nom a sota.
export function recipeHTML(rx, { compact = false } = {}) {
  const term = (s) => `
    <span class="term">
      <span class="term-top"><b class="coef${s.c === 1 ? " one" : ""}">${s.c}</b>${particleHTML(s)}${s.p ? "" : fm(s.f)}</span>
      ${compact ? "" : `<span class="term-name">${s.p ? plain(s, s.c) : ""}</span>`}
    </span>`;
  const side = (list) => list.map(term).join('<span class="op">+</span>');
  return `<div class="recipe-line">${side(rx.reactants)}<span class="arrow" aria-hidden="true">→</span>${side(rx.products)}</div>`;
}

export function recipeText(rx) {
  const side = (list) => list.map((s) => `${s.c} ${plain(s, s.c)}`).join(" + ");
  return `${side(rx.reactants)} → ${side(rx.products)}`;
}

function sizeClass(total) {
  return total <= 12 ? "pt-xl" : total <= 24 ? "pt-l" : total <= 36 ? "pt-m" : "pt-s";
}

const bin = (s, n, cls = "", tag = "") => `
  <div class="bin ${cls}">
    <div class="bin-head"><span class="bin-name">${subLabel(s, n)}</span><span class="bin-count">× ${n}</span>${tag}</div>
    <div class="bin-body">${n ? many(s, n) : '<span class="bin-empty">—</span>'}</div>
  </div>`;

function stageHTML(rx, q, stage) {
  const R = react(rx, q);
  if (stage === "abans") {
    const total = q.reduce((s, x) => s + x, 0);
    return { cls: sizeClass(total), title: "Abans de la reacció", body: `<div class="bins">${rx.reactants.map((s, i) => bin(s, q[i], "reactant")).join("")}</div>` };
  }
  if (stage === "despres") {
    const total = R.products.reduce((s, x) => s + x, 0) + R.left.reduce((s, x) => s + x, 0);
    const prods = rx.products.map((s, i) => bin(s, R.products[i], "product")).join("");
    const lefts = rx.reactants
      .map((s, i) => (R.left[i] ? bin(s, R.left[i], "leftover", '<span class="bin-tag">No ha reaccionat</span>') : ""))
      .join("");
    return {
      cls: sizeClass(total),
      title: "Després de la reacció",
      body: `<div class="bins">${prods}${lefts}</div>`,
    };
  }
  const done = stage === "lots-done";
  const perLot = (done ? rx.products : rx.reactants).reduce((s, x) => s + x.c, 0);
  const leftTotal = R.left.reduce((s, x) => s + x, 0);
  const lots = Array.from({ length: R.lots }, (_, k) => {
    const body = (done ? rx.products : rx.reactants).map((s) => many(s, s.c)).join("");
    return `<div class="lot${done ? " done" : ""}" style="--i:${k}"><span class="lot-n">Lot ${k + 1}</span><div class="lot-body">${body}</div></div>`;
  }).join("");
  const leftover = leftTotal
    ? `<div class="leftover-zone" style="--i:${R.lots}"><span class="lz-title">${R.incomplete ? "Sobren · no arriben a un lot" : "Sobren"}</span><div class="lot-body">${rx.reactants.map((s, i) => many(s, R.left[i])).join("")}</div></div>`
    : "";
  return {
    cls: sizeClass(R.lots * perLot + leftTotal),
    title: done ? "Cada lot es transforma" : "Formant lots",
    body: `<div class="lot-grid">${lots}${leftover}</div>`,
  };
}

export function reactorHTML(rx, q, stage = "abans") {
  const st = stageHTML(rx, q, stage);
  const R = react(rx, q);
  const counter = stage === "abans" ? "" : `<span class="lot-counter">Lots fets: <b>${R.lots}</b></span>`;
  return `
    <div class="reactor stage-${stage}">
      <div class="reactor-head"><span class="reactor-title">${st.title}</span>${counter}</div>
      <div class="reactor-body ${st.cls}">${st.body}</div>
    </div>`;
}

export function summaryText(rx, q) {
  const R = react(rx, q);
  const prods = rx.products.map((s, i) => `${R.products[i]} ${plain(s, R.products[i])}`).join(", ");
  const lefts = rx.reactants.map((s, i) => (R.left[i] ? `${R.left[i]} ${plain(s, R.left[i])}` : "")).filter(Boolean);
  return `S'han fet ${R.lots} lots. Es formen ${prods}. ${lefts.length ? `Sobren ${lefts.join(", ")}.` : "No sobra res."}`;
}

// Comptador d'àtoms: abans i, si ja ha reaccionat, després.
export function atomsHTML(rx, q, after = false) {
  const bal = atomBalance(rx, q);
  if (!bal) return "";
  const row = (counts) =>
    Object.keys(bal.before)
      .map((el) => `<span class="atom-chip"><b>${el}</b> ${counts[el] ?? 0}</span>`)
      .join("");
  return `
    <div class="atom-counter${after && bal.ok ? " ok" : ""}">
      <span class="ac-label">Àtoms abans</span>${row(bal.before)}
      ${after ? `<span class="ac-label">després</span>${row(bal.after)}${bal.ok ? '<span class="ac-ok">Es conserven tots els àtoms ✓</span>' : ""}` : ""}
    </div>`;
}

// Si les partícules no caben al recipient, en redueix la mida pas a pas (cap desplaçament intern).
const SIZES = ["pt-xl", "pt-l", "pt-m", "pt-s", "pt-xs"];
export function fitReactors(root = document) {
  root.querySelectorAll(".reactor-body").forEach((body) => {
    body.dataset.size ||= SIZES.find((c) => body.classList.contains(c)) ?? "pt-m";
    let i = SIZES.indexOf(body.dataset.size);
    body.classList.remove(...SIZES);
    body.classList.add(SIZES[i]);
    while (body.scrollHeight > body.clientHeight + 2 && i < SIZES.length - 1) {
      body.classList.replace(SIZES[i], SIZES[i + 1]);
      i += 1;
    }
  });
}

const reducedMotion = () => {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
};

export const SPEEDS = { lent: 1.7, normal: 1, rapid: 0.45 };

// Anima la reacció dins de host (un element que conté .reactor). Retorna una funció per aturar-la.
export function playReaction(host, rx, q, { speed = "normal", onStage, onDone } = {}) {
  const f = SPEEDS[speed] ?? 1;
  const R = react(rx, q);
  const timers = [];
  const show = (stage) => {
    host.innerHTML = reactorHTML(rx, q, stage);
    onStage?.(stage);
  };
  if (reducedMotion()) {
    show("despres");
    onDone?.();
    return () => {};
  }
  const stagger = Math.min(220, 1400 / Math.max(R.lots, 1));
  host.style.setProperty("--stagger", `${Math.round(stagger * f)}ms`);
  show("lots");
  const t1 = (R.lots * stagger + 900) * f;
  timers.push(setTimeout(() => show("lots-done"), t1));
  timers.push(setTimeout(() => show("despres"), t1 + (R.lots * stagger + 1100) * f));
  timers.push(setTimeout(() => onDone?.(), t1 + (R.lots * stagger + 1300) * f));
  return () => timers.forEach(clearTimeout);
}

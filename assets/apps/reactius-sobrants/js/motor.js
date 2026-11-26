// Motor del laboratori de reactius i sobrants: lots, casos, diagnòstic d'errors, pistes i càlculs amb mols.
// No depèn del DOM: el fan servir l'app i l'script de validació.

import { parseFormula, formulaHTML } from "./chem.js";
import { PIECES, NAMES, ATOMIC_MASS, reactionById } from "./reaccions.js";

/* ---------- Noms i quantitats ---------- */

const fm = (f) => `<span class="fm">${formulaHTML(f)}</span>`;

// Nom curt d'una substància o peça (per a rètols i missatges).
export function subLabel(s, n = 2) {
  if (s.p) return n === 1 ? PIECES[s.p].one : PIECES[s.p].many;
  return fm(s.f);
}

export function subName(s) {
  return s.p ? PIECES[s.p].many : NAMES[s.f] ?? s.f;
}

export const qty = (s, n) => `${n} ${subLabel(s, n)}`;

const listJoin = (items) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} i ${items.at(-1)}`);

export function formatNum(x, decimals = 2) {
  const v = Math.round(x * 10 ** decimals) / 10 ** decimals;
  return String(v).replace(".", ",");
}

export function parseNum(text) {
  const t = String(text ?? "").trim().replace(/\s+/g, "").replace(",", ".");
  if (!t || !/^[-+−]?\d*\.?\d+$/.test(t)) return null;
  return Number(t.replace("−", "-"));
}

/* ---------- La reacció: lots, productes i sobrants ---------- */

export function react(rx, q) {
  const per = rx.reactants.map((s, i) => Math.floor(q[i] / s.c));
  const lots = Math.min(...per);
  const products = rx.products.map((s) => s.c * lots);
  const left = rx.reactants.map((s, i) => q[i] - s.c * lots);
  const single = rx.reactants.length === 1;
  const exact = left.every((x) => x === 0);
  const limiting = single || exact ? [] : rx.reactants.map((_, i) => i).filter((i) => per[i] === lots);
  const incomplete = single ? left[0] > 0 : limiting.some((i) => left[i] > 0);
  return { per, lots, products, left, single, exact, limiting, incomplete };
}

// Àtoms abans (reactius) i després (productes + sobrants).
export function atomBalance(rx, q) {
  if (rx.analogy) return null;
  const R = react(rx, q);
  const add = (acc, f, n) => {
    Object.entries(parseFormula(f)).forEach(([el, k]) => (acc[el] = (acc[el] ?? 0) + k * n));
    return acc;
  };
  const before = rx.reactants.reduce((acc, s, i) => add(acc, s.f, q[i]), {});
  const after = rx.products.reduce((acc, s, i) => add(acc, s.f, R.products[i]), {});
  rx.reactants.forEach((s, i) => add(after, s.f, R.left[i]));
  return { before, after, ok: Object.keys(before).every((el) => before[el] === after[el]) };
}

/* ---------- Generació de casos (Disseny.md, apartat 5.5) ---------- */

const MAX_PARTICLES = 40;
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

const TYPE_WEIGHTS = {
  1: { E1: 40, exacta: 15, lliure: 45 },
  2: { E1: 40, exacta: 15, E14: 15, lliure: 30 },
  3: { incomplet: 20, E1: 30, exacta: 10, lliure: 40 },
};

function pickType(level) {
  const entries = Object.entries(TYPE_WEIGHTS[Math.min(level, 3)]);
  let t = Math.random() * entries.reduce((s, [, w]) => s + w, 0);
  for (const [type, w] of entries) {
    t -= w;
    if (t < 0) return type;
  }
  return "lliure";
}

function caseFits(rx, q, type, level) {
  const R = react(rx, q);
  if (R.lots < 1) return false;
  const sum = (list) => list.reduce((s, x) => s + x, 0);
  // Es dibuixen totes les partícules abans i després (productes i sobrants).
  if (sum(q) > MAX_PARTICLES || sum(R.products) + sum(R.left) > MAX_PARTICLES) return false;
  if (!R.single && !R.exact && R.limiting.length !== 1) return false;
  if (type !== "incomplet" && R.incomplete && level >= 2) return false;
  if (R.single) return type === "incomplet" ? R.incomplete : true;
  const L = R.limiting[0];
  switch (type) {
    case "exacta":
      return R.exact;
    case "E1":
      return !R.exact && q.some((x, j) => j !== L && q[L] > x);
    case "E14":
      return !R.exact && new Set(q).size < q.length;
    case "incomplet":
      return R.incomplete;
    default:
      return true;
  }
}

// Quantitats inicials aleatòries per a una reacció i un nivell.
export function makeCase(rx, level, forcedType) {
  const lvl = Math.min(level, 3);
  const [lo, hi] = lvl === 1 ? [0, 10] : lvl === 2 ? [1, 10] : [1, 18];
  const types = [forcedType ?? pickType(lvl), "lliure"];
  for (const type of types) {
    for (let k = 0; k < 600; k += 1) {
      const q = rx.reactants.map((s) => (rx.reactants.length === 1 ? s.c * randInt(1, 6) + (type === "incomplet" ? 1 : 0) : randInt(lo, hi)));
      if (caseFits(rx, q, type, lvl)) return { q, type };
    }
  }
  return { q: [...rx.cases[0].q], type: "clau" };
}

/* ---------- Diagnòstic (Disseny.md, apartats 6 i 10) ---------- */

const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const lotsList = (rx, R, q) => listJoin(rx.reactants.map((s, i) => `${subLabel(s)} → ${R.per[i]} ${R.per[i] === 1 ? "lot" : "lots"}`));

function argminUnique(values) {
  const min = Math.min(...values);
  const idx = values.map((v, i) => (v === min ? i : -1)).filter((i) => i >= 0);
  return idx.length === 1 ? idx[0] : -1;
}

export const MESSAGES = {
  E1: (rx, R, q) => `No és el que en tens menys. Mira els lots: ${lotsList(rx, R, q)}.`,
  E2: () => "Fixa't en les quantitats, no només en el coeficient. Quants lots dona cada reactiu?",
  E3: (rx, R) => `Has comptat només 1 lot. Al recipient n'hi caben ${R.lots}: multiplica pel nombre de lots.`,
  E4a: (rx, R) => {
    const i = R.left.findIndex((x) => x > 0);
    return `Sí que sobra alguna cosa: amb ${subLabel(rx.reactants[i])} es podrien fer més lots dels que es fan.`;
  },
  E4b: (rx, R) => `Aquesta vegada no sobra res: tots els reactius donen per a ${R.lots} lots.`,
  E5: () => "Els àtoms es conserven, però les molècules no sempre. Compta els àtoms, no les molècules.",
  E7: () => "El sobrant no desapareix: queda al recipient sense reaccionar.",
  E14: (rx) => `Els reactius no sempre reaccionen 1 a 1. La recepta diu ${rx.reactants[0].c} ${subLabel(rx.reactants[0], rx.reactants[0].c)} per cada ${rx.reactants[1].c} ${subLabel(rx.reactants[1], rx.reactants[1].c)}.`,
  E15: () => "Una molècula no es pot partir. Si no arriba a un lot sencer, sobra.",
  E16: () => "Aquesta reacció només té un reactiu. Es gasta tot el que pot formar lots.",
  E17: (rx) => `Cada producte es forma segons el seu coeficient: ${listJoin(rx.products.map((s) => `${s.c} ${subLabel(s, s.c)}`))} per lot.`,
  generic: () => "Encara no. Revisa quants lots es poden fer.",
};

export const incompleteNote = (rx, R) => {
  const i = R.single ? 0 : R.limiting[0];
  const s = rx.reactants[i];
  return `Ha sobrat ${qty(s, R.left[i])} perquè sol no pot formar un lot. Amb quantitats reals, com els mols del laboratori, el reactiu limitant s'esgota del tot.`;
};

// Prediu el resultat: ans = { products: [...], left: [...] }.
export function diagnosePredict(rx, q, ans) {
  const R = react(rx, q);
  const okP = eq(ans.products, R.products);
  const okL = eq(ans.left, R.left);
  if (okP && okL) return { ok: true, R };
  const fail = (code, extra) => ({ ok: false, code, message: (extra ?? "") + MESSAGES[code](rx, R, q), R });
  const coefs = rx.reactants.map((s) => s.c);

  if (!okP && !R.single) {
    const minI = argminUnique(q);
    if (minI >= 0 && !R.limiting.includes(minI)) {
      const lots1 = Math.floor(q[minI] / coefs[minI]);
      const wouldBe = rx.products.map((s) => s.c * lots1);
      if (lots1 !== R.lots && eq(ans.products, wouldBe)) return fail("E1");
    }
  }
  if (!okP && R.lots > 1 && eq(ans.products, rx.products.map((s) => s.c))) return fail("E3");
  const pc = rx.products.map((s) => s.c);
  if (!okP && rx.products.length > 1 && new Set(pc).size > 1 && new Set(ans.products).size === 1) return fail("E17");
  if (!R.single && !R.exact && new Set(q).size < q.length && ans.left.every((x) => x === 0) && !okP) return fail("E14");
  const sum = (a) => a.reduce((s, x) => s + x, 0);
  if (!okP && !rx.analogy && sum(ans.products) + sum(ans.left) === sum(q) && sum(R.products) + sum(R.left) !== sum(q)) return fail("E5");
  if (okP && !R.exact && ans.left.every((x) => x === 0)) return fail(R.incomplete && R.left.filter((x) => x > 0).length === 1 ? "E15" : "E4a");
  if (okP && R.exact) return fail("E4b");
  if (okP && R.incomplete && !R.single && ans.left[R.limiting[0]] === 0) return fail("E15");
  if (okP) return { ok: false, code: "E7", message: "Els productes són correctes. Revisa els sobrants: sobrant = el que tenies − el que s'ha gastat.", R };
  if (okL) return { ok: false, code: "generic", message: `Els sobrants són correctes. Revisa els productes: cada lot dona ${listJoin(rx.products.map((s) => `${s.c} ${subLabel(s, s.c)}`))}.`, R };
  return fail("generic");
}

// Quin és el limitant? choice = índex del reactiu, "exacta" o "single".
export function limitantAnswer(rx, q) {
  const R = react(rx, q);
  return R.single ? "single" : R.exact ? "exacta" : R.limiting[0];
}

export function diagnoseLimit(rx, q, choice) {
  const R = react(rx, q);
  if (choice === limitantAnswer(rx, q)) return { ok: true, R };
  const fail = (code) => ({ ok: false, code, message: MESSAGES[code](rx, R, q), R });
  if (R.single) return fail("E16");
  if (choice === "single") return { ok: false, code: "generic", message: "Hi ha més d'un reactiu: compara quants lots dona cadascun.", R };
  if (choice === "exacta") return fail("E4a");
  if (R.exact) return fail("E4b");
  const coefs = rx.reactants.map((s) => s.c);
  if (argminUnique(q) === choice) return fail("E1");
  if (new Set(coefs).size > 1 && (coefs[choice] === Math.min(...coefs) || coefs[choice] === Math.max(...coefs))) return fail("E2");
  return fail("E1");
}

export const JUSTIFICATIONS = [
  { id: "ok", text: "Perquè permet fer menys lots." },
  { id: "E1", text: "Perquè n'hi ha menys partícules." },
  { id: "E2", text: "Perquè té el coeficient més petit." },
];

// Què hi havia abans? A partir dels productes i dels sobrants.
export function diagnoseBefore(rx, q, ans) {
  const R = react(rx, q);
  if (eq(ans, q)) return { ok: true, R };
  const used = rx.reactants.map((s) => s.c * R.lots);
  if (eq(ans, used) && R.left.some((x) => x > 0)) return { ok: false, code: "E7", message: "Has comptat només el que s'ha gastat. Al principi també hi havia el que ha sobrat.", R };
  if (eq(ans, R.left)) return { ok: false, code: "E7", message: "Això és el que ha sobrat. Suma-hi el que s'ha gastat en els lots.", R };
  if (R.lots > 1 && eq(ans, rx.reactants.map((s, i) => s.c + R.left[i]))) return { ok: false, code: "E3", message: MESSAGES.E3(rx, R), R };
  const p0 = rx.products[0];
  return { ok: false, code: "generic", message: `Encara no. Primer calcula quants lots s'han fet: ${qty(p0, R.products[0])} ÷ ${p0.c}.`, R };
}

// Que no sobri res: target = { i: índex del producte, n: quantitat }.
export function exactaTarget(rx, level) {
  const i = Math.floor(Math.random() * rx.products.length);
  const maxReact = Math.max(...rx.reactants.map((s) => s.c));
  const maxLots = Math.max(1, Math.min(level <= 1 ? 4 : 5, Math.floor((level <= 2 ? 10 : 18) / maxReact)));
  const lots = randInt(Math.min(2, maxLots), maxLots);
  return { i, n: rx.products[i].c * lots, lots };
}

export function diagnoseExact(rx, target, ans) {
  const R = react(rx, ans);
  if (R.exact && R.lots === target.lots) return { ok: true, R };
  if (R.exact && R.lots > 0) return { ok: false, code: "generic", message: `No sobra res, però fas ${R.lots} ${R.lots === 1 ? "lot" : "lots"} i en calen ${target.lots}.`, R };
  if (ans.length > 1 && new Set(ans).size === 1 && new Set(rx.reactants.map((s) => s.c)).size > 1) return { ok: false, code: "E14", message: MESSAGES.E14(rx), R };
  const leftovers = rx.reactants.map((s, i) => (R.left[i] > 0 ? qty(s, R.left[i]) : "")).filter(Boolean);
  const made = `${R.lots} ${R.lots === 1 ? "lot" : "lots"}`;
  return { ok: false, code: "E8", message: `Ara es farien ${made}${leftovers.length ? ` i sobraria: ${listJoin(leftovers)}` : ""}. En calen ${target.lots} sense que sobri res.`, R };
}

// Completa la taula: ans = { canvi: [...], despres: [...] } (reactius i després productes).
export function checkTable(rx, q, ans) {
  const R = react(rx, q);
  const canvi = [...rx.reactants.map((s) => -s.c * R.lots), ...R.products];
  const despres = [...R.left, ...R.products];
  const wrong = { canvi: canvi.map((v, i) => ans.canvi[i] !== v), despres: despres.map((v, i) => ans.despres[i] !== v) };
  const ok = !wrong.canvi.some(Boolean) && !wrong.despres.some(Boolean);
  if (ok) return { ok, R, wrong };
  const nR = rx.reactants.length;
  let message;
  if (ans.canvi.slice(0, nR).some((v, i) => v === -canvi[i] && v !== 0)) message = "Els reactius es gasten: el seu canvi és negatiu (−).";
  else if (ans.canvi.slice(nR).some((v, i) => v === -canvi[nR + i] && v !== 0)) message = "Els productes es formen: el seu canvi és positiu (+).";
  else if (wrong.canvi.some(Boolean)) message = "Revisa la fila Canvi: primer troba quants lots es fan i multiplica'ls pel coeficient.";
  else if (ans.despres.slice(0, nR).every((v) => v === 0) && R.left.some((x) => x > 0)) message = MESSAGES.E7();
  else message = "La fila Canvi és correcta. Revisa la fila Després: abans + canvi.";
  return { ok, R, wrong, message };
}

/* ---------- Pistes (Disseny.md, apartat 9) ---------- */

export function hints(type, rx, q, extra = {}) {
  const R = q ? react(rx, q) : null;
  const [A, B] = rx.reactants;
  const per = (i) => `${subLabel(rx.reactants[i])}: ${q[i]} ÷ ${rx.reactants[i].c} = ${R.per[i]} ${R.per[i] === 1 ? "lot" : "lots"}`;
  const P = rx.products[0];
  switch (type) {
    case "prediu":
      return [
        `Quants ${B ? `${subLabel(A)} i quants ${subLabel(B)}` : subLabel(A)} demana cada lot? Mira la recepta.`,
        `${listJoin(rx.reactants.map((_, i) => per(i)))}. Quants lots es fan, doncs?`,
        `Es fan ${R.lots} ${R.lots === 1 ? "lot" : "lots"}. Cada lot dona ${listJoin(rx.products.map((s) => `${s.c} ${subLabel(s, s.c)}`))}: multiplica per ${R.lots}.`,
      ];
    case "limitant":
      return R.single
        ? ["Quants reactius té aquesta reacció?", "Només hi ha un reactiu: no es pot comparar amb cap altre.", "Tria «Només hi ha un reactiu»."]
        : [
            "Recorda: no és el que en tens menys, sinó el que dona menys lots.",
            "Divideix la quantitat de cada reactiu pel seu coeficient.",
            `${listJoin(rx.reactants.map((_, i) => per(i)))}.`,
          ];
    case "abans":
      return [
        `Quants lots calen per formar ${qty(P, R.products[0])}?`,
        `S'han fet ${R.lots} ${R.lots === 1 ? "lot" : "lots"}. ${listJoin(rx.reactants.map((s) => `de ${subLabel(s)} se n'han gastat ${R.lots} × ${s.c}`))}.`,
        `Abans = gastat + sobrant. ${listJoin(rx.reactants.map((s, i) => `${subLabel(s)}: ${s.c * R.lots} + ${R.left[i]}`))}.`,
      ];
    case "exacta": {
      const t = extra.target;
      const T = rx.products[t.i];
      return [
        `Quants lots calen per obtenir ${qty(T, t.n)}? Cada lot en dona ${T.c}.`,
        `Necessites ${t.lots} lots. Multiplica cada coeficient dels reactius per ${t.lots}.`,
        `Cal posar ${listJoin(rx.reactants.map((s) => `${t.lots} × ${s.c} ${subLabel(s, s.c)}`))}.`,
      ];
    }
    case "taula":
      return [
        "Comença trobant quants lots es fan.",
        `Es fan ${R.lots} lots. La fila Canvi és lots × coeficient: negativa per als reactius i positiva per als productes.`,
        "La fila Després és abans + canvi. El limitant queda a 0 (o amb el que no fa un lot sencer).",
      ];
    default:
      return [];
  }
}

/* ---------- Batxillerat: mols i masses ---------- */

export function molarMass(f) {
  return Object.entries(parseFormula(f)).reduce((s, [el, k]) => s + ATOMIC_MASS[el] * k, 0);
}

const round4 = (x) => Math.round(x * 10000) / 10000;

export function solveProblem(pb) {
  const rx = reactionById(pb.reaction);
  const M = rx.reactants.map((s) => molarMass(s.f));
  const n = pb.grams.map((g, i) => round4(g / M[i]));
  const ratio = n.map((x, i) => round4(x / rx.reactants[i].c));
  const x = Math.min(...ratio);
  const lim = ratio.indexOf(x);
  const products = rx.products.map((s) => {
    const mol = round4(s.c * x);
    return { f: s.f, M: molarMass(s.f), n: mol, g: round4(mol * molarMass(s.f)) };
  });
  const left = rx.reactants.map((s, i) => {
    const mol = round4(n[i] - s.c * x);
    return { f: s.f, M: M[i], n: mol, g: round4(mol * M[i]) };
  });
  const excess = left.findIndex((l, i) => i !== lim && l.n > 1e-9);
  const main = products.findIndex((pr) => pr.f === pb.main);
  return { rx, M, n, ratio, x, lim, products, left, excess, main };
}

export const near = (a, b) => a !== null && Math.abs(a - b) <= Math.max(0.02, Math.abs(b) * 0.01);

// Calcula: ans = { lim, mProduct, mLeft }.
export function diagnoseCalc(pb, ans) {
  const S = solveProblem(pb);
  const { rx } = S;
  const okLim = ans.lim === S.lim;
  const okP = near(ans.mProduct, S.products[S.main].g);
  const okL = near(ans.mLeft, S.left[S.excess].g);
  if (okLim && okP && okL) return { ok: true, S };
  if (!okLim) {
    const minG = argminUnique(pb.grams);
    const minN = argminUnique(S.n);
    const names = rx.reactants.map((s) => fm(s.f));
    if (ans.lim === minG && minG !== S.lim)
      return { ok: false, code: "E11", message: `No comparis grams. Passa primer a mols: ${listJoin(rx.reactants.map((s, i) => `${names[i]} són ${formatNum(S.n[i])} mol`))}.`, S };
    if (ans.lim === minN || S.n[0] === S.n[1])
      return { ok: false, code: "E12", message: `Divideix els mols pel coeficient: ${listJoin(rx.reactants.map((s, i) => `${names[i]} → ${formatNum(S.n[i])} ÷ ${s.c}`))}.`, S };
    return { ok: false, code: "E12", message: "Passa les masses a mols i divideix pel coeficient. El valor més petit indica el limitant.", S };
  }
  const P = rx.products[S.main];
  if (!okP)
    return { ok: false, code: "generic", message: `El limitant és correcte. Revisa la massa de ${fm(P.f)}: mols de ${fm(P.f)} = (mols del limitant ÷ el seu coeficient) × ${P.c}; després multiplica per la massa molar.`, S };
  return { ok: false, code: "E6", message: `La massa de producte és correcta. Revisa el sobrant: mols inicials − mols gastats del reactiu en excés, i passa-ho a grams. Recorda que la massa inicial ha de ser igual a la dels productes més la dels sobrants.`, S };
}

export function calcHints(pb) {
  const S = solveProblem(pb);
  const { rx } = S;
  const P = rx.products[S.main];
  return [
    `Calcula la massa molar de cada reactiu i passa a mols (n = m ÷ M): ${listJoin(rx.reactants.map((s, i) => `M(${fm(s.f)}) = ${formatNum(S.M[i])} g/mol`))}.`,
    `${listJoin(rx.reactants.map((s, i) => `${fm(s.f)}: ${formatNum(S.n[i])} mol ÷ ${s.c} = ${formatNum(S.ratio[i], 3)}`))}.`,
    `El limitant és ${fm(rx.reactants[S.lim].f)}. Mols de ${fm(P.f)} = ${formatNum(S.x, 3)} × ${P.c}; massa = mols × ${formatNum(molarMass(P.f))} g/mol.`,
  ];
}

// Taula en mols (batxillerat): ans = { abans: [reactius], canvi: [tots], despres: [tots] }.
export function checkMolTable(pb, ans) {
  const S = solveProblem(pb);
  const abans = S.n;
  const canvi = [...S.rx.reactants.map((s) => -s.c * S.x), ...S.products.map((p) => p.n)];
  const despres = [...S.left.map((l) => l.n), ...S.products.map((p) => p.n)];
  const nearOk = (a, b) => a !== null && Math.abs(a - b) <= Math.max(0.011, Math.abs(b) * 0.01);
  const wrong = {
    abans: abans.map((v, i) => !nearOk(ans.abans[i], v)),
    canvi: canvi.map((v, i) => !nearOk(ans.canvi[i], v)),
    despres: despres.map((v, i) => !nearOk(ans.despres[i], v)),
  };
  const ok = ![...wrong.abans, ...wrong.canvi, ...wrong.despres].some(Boolean);
  if (ok) return { ok, S, wrong };
  let message;
  if (wrong.abans.some(Boolean)) message = "Revisa la fila Abans: mols = massa ÷ massa molar.";
  else if (ans.canvi.slice(0, abans.length).some((v, i) => nearOk(v, -canvi[i]) && Math.abs(canvi[i]) > 1e-9)) message = "Els reactius es gasten: el seu canvi és negatiu (−).";
  else if (wrong.canvi.some(Boolean)) message = "Revisa la fila Canvi: divideix els mols de cada reactiu pel coeficient per trobar el limitant; després multiplica pels coeficients.";
  else message = "La fila Canvi és correcta. Revisa la fila Després: abans + canvi.";
  return { ok, S, wrong, message };
}

export function molTableHints(pb) {
  const S = solveProblem(pb);
  return [
    "Fila Abans: passa cada massa a mols (n = m ÷ M). Els productes comencen a 0.",
    `Divideix els mols pel coeficient: el valor més petit (${formatNum(S.x, 3)}) indica quants «lots» de mols reaccionen.`,
    `Canvi = ${formatNum(S.x, 3)} × coeficient (negatiu per als reactius). Després = abans + canvi.`,
  ];
}

// Correcció de respostes, opcions errònies plausibles i pistes per a cada tipus d'exercici.
// No depèn del DOM.

import { cleanFormulaInput, parseFormula, sameCounts, multipleOf, formulaText } from "./formula.js";
import {
  FAMILIES, CATIONS, H_CATION, MONO_ANIONS, OXOANIONS, ACID_ANIONS, OH, PEROXIDE, ROMAN,
  ionicFormula, ionCounts, ionLabel, cationName, elides,
} from "./nomenclatura.js";

const withArticle = (word) => (elides(word) ? `l'${word}` : `el ${word}`);

export const family = (id) => FAMILIES.find((f) => f.id === id);
const article = (fam) => (/^(Òxid|Hidrur|Hidròxid|Oxoàcid|Oxosal)/.test(fam.name) ? "un" : fam.id === "nometalls" ? "un" : "una");
export const familyWithArticle = (id) => {
  const fam = family(id);
  return `${article(fam)} ${fam.name.toLowerCase()}`;
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];
export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

/* ---------- Noms ---------- */

export function normalizeName(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[’‘´`]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\s*\(\s*/g, "(")
    .replace(/\s*\)/g, ")")
    .replace(/d'\s+/g, "d'")
    .trim();
}

const stripAccents = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/·/g, "");

export const acceptedNames = (comp) => [...comp.names.map((n) => n.text), ...comp.accept];

// Noms que es poden fer servir com a enunciat segons els nivells triats.
export function promptNames(comp, maxLevel) {
  const list = comp.names.filter((n) => n.level <= maxLevel);
  return list.length ? list : comp.names;
}

export function checkName(comp, input, catalog) {
  const value = normalizeName(input);
  if (!value) return { ok: false, message: "Escriu el nom del compost." };
  const names = acceptedNames(comp).map(normalizeName);
  const exact = comp.names.find((n) => normalizeName(n.text) === value);
  if (names.includes(value)) return { ok: true, matched: exact ?? null };
  const loose = acceptedNames(comp).find((n) => stripAccents(normalizeName(n)) === stripAccents(value));
  if (loose) return { ok: true, note: `Compte amb els accents: s'escriu «${loose}».` };

  const ions = comp.ions;
  if (ions?.cat.variable) {
    const stock = normalizeName(comp.names.find((n) => n.kinds.includes("ox") || n.kinds.includes("trad"))?.text ?? "");
    if (stock && value === stock.replace(/\([ivx]+\)/, "")) {
      return { ok: false, message: `Falta el nombre d'oxidació: el ${ions.cat.name} pot actuar amb diverses càrregues. S'indica en xifres romanes entre parèntesis.` };
    }
    if (stock && value.replace(/\([ivx]+\)/, "(n)") === stock.replace(/\([ivx]+\)/, "(n)")) {
      return { ok: false, message: "Revisa el nombre d'oxidació (les xifres romanes): ha de coincidir amb la càrrega del catió." };
    }
  }
  const other = catalog.find((c) => c !== comp && acceptedNames(c).some((n) => normalizeName(n) === value));
  if (other) return { ok: false, message: `Aquest nom correspon a ${formulaText(other.formula)}, no a aquest compost.` };

  const swapEnding = (t) => t.replace(/(at|it)\b/g, (m) => (m === "at" ? "it" : "at")).replace(/(ic|ós)\b/g, (m) => (m === "ic" ? "ós" : "ic"));
  if (names.some((n) => swapEnding(n) === value)) {
    return { ok: false, message: "Revisa la terminació. Recorda: àcid -ic → anió -at; àcid -ós → anió -it." };
  }
  const noPrefix = (t) => t.replace(/monòxid/g, "òxid").replace(/\b(mono|di|tri|tetra|penta|hexa|hepta|octa)(?=[a-zàèéíòóú])/g, "").replace(/d'|de /g, "");
  if (names.some((n) => noPrefix(n) === noPrefix(value))) {
    return { ok: false, message: "Gairebé! Revisa els prefixos (mono-, di-, tri-…): han de coincidir amb els subíndexs de la fórmula." };
  }
  if (names.some((n) => n.replace(/d'|de /g, "") === value.replace(/d'|de /g, ""))) {
    return { ok: false, message: "Revisa l'apostrofació: «de» s'apostrofa davant de vocal o h (d'alumini, d'hidrogen), però no davant de iode." };
  }
  return { ok: false, message: `No és correcte. Pista: és ${familyWithArticle(comp.family)}.` };
}

/* ---------- Fórmules ---------- */

export function checkFormula(comp, input) {
  const clean = cleanFormulaInput(input);
  if (!clean) return { ok: false, message: "Escriu la fórmula." };
  if (clean === comp.formula) return { ok: true };
  if (/\(/.test(comp.formula) && clean === comp.formula.replace(/[()]/g, "")) {
    return { ok: false, message: "Falten els parèntesis: quan hi ha més d'un ió poliatòmic, el grup va entre parèntesis, com a Fe₂(SO₄)₃." };
  }
  if (clean.toLowerCase() === comp.formula.toLowerCase()) {
    return { ok: false, message: "Compte amb les majúscules: cada símbol comença amb majúscula i la segona lletra va en minúscula (Co és cobalt; CO són carboni i oxigen)." };
  }
  let counts;
  try {
    counts = parseFormula(clean);
  } catch (error) {
    const tip = /caràcter/.test(error.message) ? " Escriu els subíndexs com a números: Fe2O3." : "";
    return { ok: false, message: `${error.message}${tip}` };
  }
  const target = parseFormula(comp.formula);
  if (sameCounts(target, counts)) {
    if (/\(/.test(clean) && !/\(/.test(comp.formula)) {
      return { ok: false, message: "Sobren els parèntesis: només calen quan hi ha més d'un grup poliatòmic." };
    }
    return { ok: false, message: "Els àtoms són correctes, però l'ordre no: escriu primer la part positiva (metall, amoni o hidrogen) i després la negativa." };
  }
  if (comp.family === "peroxid" && multipleOf(counts, target)) {
    return { ok: false, message: "En un peròxid, el grup O₂ no es pot separar ni simplificar: és l'ió O₂²⁻." };
  }
  const factor = multipleOf(target, counts);
  if (factor) return { ok: false, message: `Es pot simplificar: divideix tots els subíndexs per ${factor}.` };
  const sameElements = Object.keys(target).length === Object.keys(counts).length && Object.keys(target).every((k) => counts[k]);
  if (sameElements) {
    return { ok: false, message: comp.ions ? "Els elements són correctes, però els subíndexs no: la suma de càrregues ha de ser zero." : "Els elements són correctes, però els subíndexs no: fixa't en els prefixos del nom." };
  }
  return { ok: false, message: "Hi ha elements que no corresponen al nom. Revisa quins ions o elements formen el compost." };
}

/* ---------- Construeix el compost amb ions ---------- */

const sameElement = (a, b) => a.element && a.element === b.element;
const central = (an) => an.formula.replace(/^H\d?/, "").replace(/O\d*$/, "").replace(/\d/g, "");

export function ionChoices(comp, maxLevel) {
  const { cat, an } = comp.ions;
  const cationPool = [...CATIONS, H_CATION].filter((c) => c.level <= maxLevel && c.id !== cat.id);
  const cats = [cat, ...cationPool.filter((c) => sameElement(c, cat))];
  shuffle(cationPool).forEach((c) => {
    if (cats.length < 4 && !cats.includes(c)) cats.push(c);
  });
  const anionPool = [...MONO_ANIONS, OH, PEROXIDE, ...OXOANIONS, ...ACID_ANIONS].filter((a) => a.level <= Math.max(maxLevel, an.level) && a.id !== an.id);
  const related = anionPool.filter((a) => central(a) && central(a) === central(an));
  const ans = [an, ...shuffle(related).slice(0, 2)];
  shuffle(anionPool).forEach((a) => {
    if (ans.length < 4 && !ans.includes(a)) ans.push(a);
  });
  return { cations: shuffle(cats.slice(0, 4)), anions: shuffle(ans.slice(0, 4)) };
}

export function buildFormula(cat, an, nC, nA) {
  return ionicFormula(cat, an, nC, nA, cat.id === "H1" && an.charge < 0 && !an.acidSalt && an.id !== PEROXIDE.id);
}

export function checkBuild(comp, cat, an, nC, nA) {
  if (!cat || !an) return { ok: false, message: "Tria un catió (part positiva) i un anió (part negativa)." };
  const target = comp.ions;
  if (cat.id !== target.cat.id) {
    if (sameElement(cat, target.cat)) return { ok: false, message: "El catió és de l'element correcte, però no amb aquesta càrrega: fixa't en el nombre d'oxidació del nom." };
    return { ok: false, message: "Aquest catió no correspon al nom. Quin element o grup positiu s'anomena al final?" };
  }
  if (an.id !== target.an.id) {
    if (an.oxo && target.an.oxo && central(an) === central(target.an)) {
      return { ok: false, message: "L'anió és de l'element correcte, però no és aquest. Recorda: hipo-…-it < -it < -at < per-…-at." };
    }
    return { ok: false, message: "Aquest anió no correspon al nom. Quina part negativa s'anomena primer?" };
  }
  const total = cat.charge * nC + an.charge * nA;
  if (total !== 0) {
    const sign = total > 0 ? "+" : "−";
    return { ok: false, message: `La càrrega total és ${sign}${Math.abs(total)}: ha de ser zero. ${total > 0 ? "Hi ha massa càrrega positiva." : "Hi ha massa càrrega negativa."}` };
  }
  const g = gcd(nC, nA);
  if (g > 1) return { ok: false, message: `La càrrega és zero, però es pot simplificar: divideix ${nC} i ${nA} per ${g}.` };
  return { ok: true };
}

/* ---------- Opcions errònies plausibles (tria la resposta) ---------- */

function uniqueOptions(correct, candidates, exclude, count = 3) {
  const seen = new Set([correct, ...exclude].map((x) => normalizeName(x)));
  const out = [];
  candidates.forEach((c) => {
    const key = normalizeName(c);
    if (c && !seen.has(key) && out.length < count) {
      seen.add(key);
      out.push(c);
    }
  });
  return out;
}

export function nameDistractors(comp, correctName, catalog, maxLevel) {
  const muts = [];
  const roman = correctName.match(/\(([IVX]+)\)/);
  if (roman) {
    // Altres nombres d'oxidació reals del mateix element; si no n'hi ha, el veí més proper.
    const n = ROMAN.indexOf(roman[1]);
    const el = comp.ions?.cat.element;
    const real = el ? CATIONS.filter((c) => c.element === el && c.charge !== n).map((c) => c.charge) : [];
    const options = real.length ? real : [n > 1 ? n - 1 : n + 1];
    options.forEach((k) => muts.push(correctName.replace(`(${roman[1]})`, `(${ROMAN[k]})`)));
    muts.push(correctName.replace(/\([IVX]+\)/, ""));
  }
  const sibling = { at: "it", it: "at", ic: "ós", "ós": "ic" };
  muts.push(correctName.replace(/(at|it|ic|ós)\b/, (m) => sibling[m]));
  const prefixes = ["", "mono", "di", "tri", "tetra", "penta", "hexa", "hepta"];
  const pre = correctName.match(/^(di|tri|tetra|penta|hexa|hepta)/);
  if (pre) {
    const i = prefixes.indexOf(pre[1]);
    muts.push(correctName.replace(pre[1], prefixes[i + 1] ?? "di"));
    muts.push(correctName.replace(pre[1], i > 2 ? prefixes[i - 1] : "tri"));
  } else if (comp.family === "oxid" || comp.family === "nometalls") {
    muts.push(`di${correctName}`);
  }
  if (comp.family === "oxid" && comp.ions && !correctName.startsWith("peròxid")) muts.push(correctName.replace(/^(mon|di|tri|tetra|penta|hepta)?òxid/, "peròxid"));
  const neighbours = shuffle(
    catalog.filter(
      (c) =>
        c !== comp &&
        c.level <= maxLevel &&
        (c.family === comp.family || (c.ions && comp.ions && (c.ions.cat.id === comp.ions.cat.id || c.ions.an.id === comp.ions.an.id)))
    )
  ).map((c) => pick(promptNames(c, maxLevel)).text);
  return uniqueOptions(correctName, [...shuffle(muts), ...neighbours], acceptedNames(comp));
}

export function formulaDistractors(comp, catalog, maxLevel) {
  const muts = [];
  if (comp.ions) {
    const { cat, an, nC, nA } = comp.ions;
    const make = (c, a, x, y) => buildFormula(c, a, x, y);
    muts.push(make(cat, an, nA, nC));
    muts.push(make(cat, an, -an.charge, cat.charge));
    muts.push(make(cat, an, 1, 1));
    if (/\(/.test(comp.formula)) muts.push(comp.formula.replace(/[()]/g, ""));
    CATIONS.filter((c) => sameElement(c, cat) && c.id !== cat.id).forEach((c) => {
      const k = ionCounts(c, an);
      muts.push(make(c, an, k.nC, k.nA));
    });
    if (an.oxo) {
      OXOANIONS.filter((a) => central(a) === central(an) && a.id !== an.id).forEach((a) => {
        const k = ionCounts(cat, a);
        muts.push(make(cat, a, k.nC, k.nA));
      });
    }
  } else {
    const m = comp.formula.match(/^([A-Z][a-z]?)(\d*)([A-Z][a-z]?)(\d*)$/);
    if (m) {
      const [, a, x, b, y] = m;
      muts.push(`${a}${y}${b}${x}`);
      muts.push(`${a}${b}${Number(y || 1) + 1}`);
      muts.push(`${a}2${b}${y}`);
      muts.push(`${b}${y}${a}${x}`);
    }
  }
  const sameElements = (c) => {
    try {
      const a = Object.keys(parseFormula(c.formula)).sort().join();
      return a === Object.keys(parseFormula(comp.formula)).sort().join();
    } catch {
      return false;
    }
  };
  const neighbours = shuffle(catalog.filter((c) => c !== comp && c.level <= maxLevel && (sameElements(c) || c.family === comp.family))).map((c) => c.formula);
  const valid = (f) => {
    try {
      parseFormula(f);
      return f !== comp.formula && !/^[A-Z][a-z]?1/.test(f);
    } catch {
      return false;
    }
  };
  const out = [];
  [...shuffle(muts), ...neighbours].forEach((f) => {
    const clean = f.replace(/([A-Za-z)])1(?!\d)/g, "$1");
    if (valid(clean) && !out.includes(clean) && out.length < 3) out.push(clean);
  });
  return out;
}

/* ---------- Pistes progressives ---------- */

export function hints(comp, type) {
  const fam = family(comp.family);
  const first = `És ${familyWithArticle(comp.family)}: ${fam.rule.charAt(0).toLowerCase()}${fam.rule.slice(1)}`;
  if (type === "classifica") {
    const els = Object.keys(parseFormula(comp.formula));
    return [
      `Fixa't en quins elements hi ha: ${els.join(", ")}. Hi ha oxigen? Hi ha hidrogen? Hi ha algun metall?`,
      els.length === 1 ? "Només hi ha un element." : `Hi ha ${els.length} elements diferents.`,
      first,
    ];
  }
  if (comp.ions) {
    const { cat, an, nC, nA } = comp.ions;
    const ions = `Els ions són ${withArticle(cationName(cat))}, ${formulaText(ionLabel(cat))}, i ${withArticle(an.name)}, ${formulaText(ionLabel(an))}.`;
    const qc = cat.charge * nC;
    const balance = `Per compensar les càrregues calen ${nC} ${formulaText(ionLabel(cat))} (${qc > 0 ? "+" : ""}${qc}) i ${nA} ${formulaText(ionLabel(an))} (−${qc}).`;
    if (type === "formulaNom") {
      const name = comp.names[0].text;
      return [first, ions, `El nom comença per «${name.split(" ")[0]} …».`];
    }
    return [first, ions, balance];
  }
  if (type === "formulaNom") {
    return [first, "Compta els àtoms de cada element: els prefixos (di-, tri-, tetra-…) indiquen quants n'hi ha.", `El nom comença per «${comp.names[0].text.split(" ")[0]} …».`];
  }
  return [first, "Els prefixos del nom (di = 2, tri = 3, tetra = 4, penta = 5…) són els subíndexs.", `La fórmula comença per ${comp.formula.match(/^[A-Z][a-z]?/)[0]}.`];
}

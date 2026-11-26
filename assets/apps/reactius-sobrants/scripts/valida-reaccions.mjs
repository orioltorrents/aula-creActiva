// Validació de les dades del laboratori de reactius i sobrants (Disseny.md, apartat 13.2).
// Ús: node scripts/valida-reaccions.mjs

import { parseFormula } from "../js/chem.js";
import { REACTIONS, PROBLEMS, EXTRA, PIECES, ATOMIC_MASS, reactionById } from "../js/reaccions.js";
import { react, makeCase, solveProblem, atomBalance } from "../js/motor.js";

const MAX_PARTICLES = 40;
const errors = [];
const fail = (id, msg) => errors.push(`${id}: ${msg}`);
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

const countAtoms = (side) =>
  side.reduce((acc, s) => {
    Object.entries(parseFormula(s.f)).forEach(([el, k]) => (acc[el] = (acc[el] ?? 0) + k * s.c));
    return acc;
  }, {});

for (const rx of REACTIONS) {
  const all = [...rx.reactants, ...rx.products];

  // 1. Equació igualada.
  if (!rx.analogy) {
    const L = countAtoms(rx.reactants);
    const R = countAtoms(rx.products);
    const els = new Set([...Object.keys(L), ...Object.keys(R)]);
    for (const el of els) if (L[el] !== R[el]) fail(rx.id, `no està igualada (${el}: ${L[el] ?? 0} → ${R[el] ?? 0})`);
    for (const el of els) if (!(el in ATOMIC_MASS)) fail(rx.id, `falta la massa atòmica de ${el}`);
  } else {
    all.forEach((s) => PIECES[s.p] || fail(rx.id, `peça desconeguda ${s.p}`));
  }

  // 2. Coeficients enters positius i sense divisor comú.
  const coefs = all.map((s) => s.c);
  if (coefs.some((c) => !Number.isInteger(c) || c < 1)) fail(rx.id, "hi ha coeficients que no són enters positius");
  if (coefs.reduce(gcd) !== 1) fail(rx.id, "els coeficients tenen un divisor comú");

  // 7. Fitxa, context i nivell.
  if (!rx.life || !rx.context || ![1, 2, 3].includes(rx.level)) fail(rx.id, "falta la fitxa «A la vida real», el context o el nivell");

  for (const { q, tags } of rx.cases) {
    const id = `${rx.id} [${q.join(", ")}]`;
    const R = react(rx, q);

    // 3. Cada cas clau dona el resultat que indiquen les etiquetes.
    if (q.length !== rx.reactants.length) fail(id, "el nombre de quantitats no coincideix amb el de reactius");
    if (R.lots < 1) fail(id, "no es pot formar cap lot");
    if (tags.includes("exacta") && !R.exact) fail(id, "marcat com a proporció exacta, però sobra alguna cosa");
    if (tags.includes("incomplet") && !R.incomplete) fail(id, "marcat com a lot incomplet, però el limitant s'esgota del tot");
    if (tags.includes("E16") && !R.single) fail(id, "marcat E16, però té més d'un reactiu");
    if (tags.includes("E14") && rx.reactants.every((s) => s.c === 1)) fail(id, "marcat E14, però la recepta és 1 a 1");
    if (!rx.analogy && !atomBalance(rx, q).ok) fail(id, "els àtoms no es conserven");

    // 4. Casos E1: el limitant té més partícules que algun altre reactiu.
    if (tags.includes("E1")) {
      if (R.limiting.length !== 1) fail(id, "marcat E1, però no hi ha un únic limitant");
      else {
        const lim = R.limiting[0];
        if (!q.some((x, i) => i !== lim && x < q[lim])) fail(id, "marcat E1, però el limitant no és el que en té més");
      }
    }

    // 5. A Mitjà, el limitant és múltiple del seu coeficient (llevat dels lots incomplets marcats).
    if (rx.level === 2 && !tags.includes("incomplet") && !R.single)
      R.limiting.forEach((i) => q[i] % rx.reactants[i].c !== 0 && fail(id, "a Mitjà el limitant ha de ser múltiple del coeficient"));

    // 8. Límit de partícules dibuixades (abans i després).
    const before = q.reduce((s, x) => s + x, 0);
    const after = R.products.reduce((s, x) => s + x, 0) + R.left.reduce((s, x) => s + x, 0);
    if (Math.max(before, after) > MAX_PARTICLES) fail(id, `supera ${MAX_PARTICLES} partícules (${before} → ${after})`);
  }

  // 8 bis. El generador de casos també respecta el límit i forma lots.
  for (let k = 0; k < 200; k += 1) {
    const { q } = makeCase(rx, rx.level);
    const R = react(rx, q);
    const after = R.products.reduce((s, x) => s + x, 0) + R.left.reduce((s, x) => s + x, 0);
    if (R.lots < 1 || Math.max(q.reduce((s, x) => s + x, 0), after) > MAX_PARTICLES) {
      fail(rx.id, `el generador ha creat un cas no vàlid [${q.join(", ")}]`);
      break;
    }
  }
}

// 6. Batxillerat: conservació de la massa i mols amb dos decimals com a màxim.
const twoDecimals = (x) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;
for (const pb of PROBLEMS) {
  const rx = reactionById(pb.reaction);
  if (!rx) {
    fail(pb.id, `la reacció ${pb.reaction} no existeix`);
    continue;
  }
  const S = solveProblem(pb);
  const before = pb.grams.reduce((s, g) => s + g, 0);
  const after = S.products.reduce((s, p) => s + p.g, 0) + S.left.reduce((s, l) => s + l.g, 0);
  if (Math.abs(before - after) > 0.01) fail(pb.id, `la massa no es conserva (${before} g → ${after.toFixed(3)} g)`);
  S.n.forEach((n, i) => twoDecimals(n) || fail(pb.id, `els mols de ${rx.reactants[i].f} tenen més de dos decimals (${n})`));
  if (S.main < 0) fail(pb.id, `el producte principal ${pb.main} no és a l'equació`);
  if (S.excess < 0) fail(pb.id, "no hi ha reactiu en excés");
  if (new Set(S.ratio).size !== S.ratio.length) fail(pb.id, "hi ha més d'un limitant");
}

for (const ex of EXTRA) {
  if (!reactionById(ex.reaction)) fail(ex.id, `la reacció ${ex.reaction} no existeix`);
  if (!ex.text || !Number.isFinite(ex.answer) || !ex.unit || !ex.steps?.length) fail(ex.id, "falten dades del problema");
}

const ids = [...REACTIONS.map((r) => r.id), ...PROBLEMS.map((p) => p.id), ...EXTRA.map((e) => e.id)];
ids.filter((id, i) => ids.indexOf(id) !== i).forEach((id) => fail(id, "identificador repetit"));

const total = REACTIONS.reduce((s, rx) => s + rx.cases.length, 0);
if (errors.length) {
  console.error(`✗ ${errors.length} errors:\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log(`✓ ${REACTIONS.length} reaccions, ${total} casos clau, ${PROBLEMS.length} problemes de mols i ${EXTRA.length} de rendiment i puresa: tot correcte.`);

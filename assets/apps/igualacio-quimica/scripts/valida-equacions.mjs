// Valida les dades de les equacions amb el mateix motor que l'app.
// Ús (des de la carpeta de l'app):  node scripts/valida-equacions.mjs
//
// Comprova, per a cada equació:
//   - que les fórmules es poden analitzar;
//   - que la solució quadra en àtoms i en càrrega i té els coeficients mínims;
//   - que no està igualada amb tots els coeficients a 1;
//   - que la solució és única (llevat de múltiples);
//   - que el tipus i el nivell existeixen i que no hi ha identificadors ni equacions duplicats.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { analyse, parseFormula, formulaCharge, equationElements } from "../js/chem.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJSON = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));

const config = readJSON("data/config.json");
const typeIds = new Set(config.types.map((t) => t.id));
const levelIds = new Set(config.levels.map((l) => l.id));

const errors = [];
const warnings = [];
const ids = new Map();
const signatures = new Map();
const perLevel = {};
const perType = {};
let total = 0;

// Rang d'una matriu racional (eliminació gaussiana amb fraccions exactes).
function rank(matrix) {
  const rows = matrix.map((row) => row.map((v) => BigInt(v)));
  const cols = rows[0]?.length ?? 0;
  let r = 0;
  for (let c = 0; c < cols && r < rows.length; c += 1) {
    const pivot = rows.findIndex((row, i) => i >= r && row[c] !== 0n);
    if (pivot < 0) continue;
    [rows[r], rows[pivot]] = [rows[pivot], rows[r]];
    for (let i = 0; i < rows.length; i += 1) {
      if (i === r || rows[i][c] === 0n) continue;
      const a = rows[r][c];
      const b = rows[i][c];
      rows[i] = rows[i].map((v, k) => v * a - rows[r][k] * b);
    }
    r += 1;
  }
  return r;
}

for (const file of config.dataFiles) {
  const list = readJSON(file);
  for (const eq of list) {
    total += 1;
    const tag = `${file} ${eq.id}`;
    const report = (msg) => errors.push(`${tag}: ${msg}`);
    try {
      [...eq.reactants, ...eq.products].forEach((f) => parseFormula(f));
    } catch (e) {
      report(e.message);
      continue;
    }
    const n = eq.reactants.length + eq.products.length;
    if (eq.coefficients.length !== n) {
      report(`hi ha ${eq.coefficients.length} coeficients per a ${n} substàncies`);
      continue;
    }
    if (ids.has(eq.id)) report(`identificador repetit (també a ${ids.get(eq.id)})`);
    ids.set(eq.id, file);
    const sig = [eq.reactants.slice().sort().join("+"), eq.products.slice().sort().join("+")].join("->");
    if (signatures.has(sig)) report(`equació repetida (igual que ${signatures.get(sig)})`);
    signatures.set(sig, eq.id);
    if (!typeIds.has(eq.type)) report(`tipus desconegut «${eq.type}»`);
    if (!levelIds.has(eq.level)) report(`nivell desconegut «${eq.level}»`);
    if (!eq.explanation?.trim()) report("falta l'explicació");

    const sol = analyse(eq, eq.coefficients);
    if (!sol.allPositive) report("la solució té coeficients no positius");
    if (!sol.atomsOk) report("la solució no quadra en àtoms");
    if (!sol.chargeOk) report(`la solució no quadra en càrrega (${sol.leftCharge} / ${sol.rightCharge})`);
    if (!sol.simplest) report(`la solució no és mínima (es pot dividir per ${sol.divisor})`);

    const ones = analyse(eq, Array(n).fill(1));
    if (ones.balanced) report("ja està igualada amb tots els coeficients a 1");

    const withIons = [...eq.reactants, ...eq.products].some((f) => formulaCharge(f) !== 0);
    if (withIons && eq.level !== 4) report("té ions però no és del nivell de batxillerat");

    // Matriu de conservació (elements + càrrega): la solució ha de ser única.
    const rowsM = equationElements(eq).map((el) => [
      ...eq.reactants.map((f) => parseFormula(f)[el] ?? 0),
      ...eq.products.map((f) => -(parseFormula(f)[el] ?? 0)),
    ]);
    if (withIons) {
      rowsM.push([...eq.reactants.map(formulaCharge), ...eq.products.map((f) => -formulaCharge(f))]);
    }
    const freedom = n - rank(rowsM);
    if (freedom !== 1) warnings.push(`${tag}: té ${freedom} famílies de solucions independents`);

    perLevel[eq.level] = (perLevel[eq.level] ?? 0) + 1;
    perType[eq.type] = (perType[eq.type] ?? 0) + 1;
  }
}

// Els exemples de cada tipus de reacció (guia de l'app) també han d'estar igualats.
for (const type of config.types) {
  const [left, right] = type.example.split("->").map((side) =>
    side.trim().split(" + ").map((term) => {
      const m = term.trim().match(/^(\d+)\s+(.+)$/);
      return m ? [Number(m[1]), m[2]] : [1, term.trim()];
    })
  );
  const eq = { reactants: left.map((t) => t[1]), products: right.map((t) => t[1]) };
  const result = analyse(eq, [...left, ...right].map((t) => t[0]));
  if (!result.balanced || !result.simplest) errors.push(`config.json ${type.id}: l'exemple «${type.example}» no està ben igualat`);
}

console.log(`Equacions revisades: ${total}`);
console.log("Per nivell:", perLevel);
console.log("Per tipus:", perType);
warnings.forEach((w) => console.log(`AVÍS  ${w}`));
errors.forEach((e) => console.log(`ERROR ${e}`));
if (errors.length) {
  console.log(`\n${errors.length} errors.`);
  process.exit(1);
}
console.log("\nTot correcte.");

// Valida el catàleg de compostos amb el mateix motor que l'app.
// Ús (des de la carpeta de l'app):  node scripts/valida-dades.mjs
//
// Comprova:
//   - que totes les fórmules es poden llegir i no n'hi ha de repetides;
//   - que cap nom (ni variant acceptada) no correspon a dos compostos diferents;
//   - que els compostos iònics són neutres i tenen els subíndexs mínims;
//   - que cada compost té almenys un nom i que les opcions errònies no inclouen cap nom correcte.

import { buildCatalog, FAMILIES, LEVELS } from "../js/nomenclatura.js";
import { parseFormula } from "../js/formula.js";
import { nameDistractors, formulaDistractors, acceptedNames, normalizeName, checkFormula, checkName } from "../js/exercicis.js";

const catalog = buildCatalog();
const errors = [];
const formulas = new Map();
const names = new Map();
const perFamily = {};
const perLevel = {};
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

catalog.forEach((c) => {
  const tag = `${c.formula} (${c.family})`;
  try {
    parseFormula(c.formula);
  } catch (e) {
    errors.push(`${tag}: ${e.message}`);
  }
  if (formulas.has(c.formula)) errors.push(`${tag}: fórmula repetida`);
  formulas.set(c.formula, c);
  if (!c.names.length) errors.push(`${tag}: sense nom`);
  acceptedNames(c).forEach((n) => {
    const key = normalizeName(n);
    if (names.has(key) && names.get(key) !== c.formula) errors.push(`${tag}: el nom «${n}» també és de ${names.get(key)}`);
    names.set(key, c.formula);
  });
  if (c.ions) {
    const { cat, an, nC, nA } = c.ions;
    if (cat.charge * nC + an.charge * nA !== 0) errors.push(`${tag}: no és neutre`);
    if (gcd(nC, nA) !== 1) errors.push(`${tag}: subíndexs no mínims`);
  }
  if (!checkFormula(c, c.formula).ok) errors.push(`${tag}: la pròpia fórmula no es dona per bona`);
  c.names.forEach((n) => {
    if (!checkName(c, n.text, catalog).ok) errors.push(`${tag}: el nom «${n.text}» no es dona per bo`);
  });
  for (let i = 0; i < 3; i += 1) {
    const max = Math.max(c.level, 1);
    const wrongNames = nameDistractors(c, c.names[0].text, catalog, max);
    const ok = acceptedNames(c).map(normalizeName);
    wrongNames.forEach((w) => {
      if (ok.includes(normalizeName(w))) errors.push(`${tag}: opció errònia correcta «${w}»`);
    });
    if (wrongNames.length < 3) errors.push(`${tag}: només ${wrongNames.length} noms erronis`);
    const wrongFormulas = formulaDistractors(c, catalog, max);
    if (wrongFormulas.includes(c.formula)) errors.push(`${tag}: fórmula errònia igual a la correcta`);
    if (wrongFormulas.length < 3) errors.push(`${tag}: només ${wrongFormulas.length} fórmules errònies`);
  }
  perFamily[c.family] = (perFamily[c.family] ?? 0) + 1;
  perLevel[c.level] = (perLevel[c.level] ?? 0) + 1;
});

console.log(`Compostos: ${catalog.length}`);
console.log("Per família:", Object.fromEntries(FAMILIES.map((f) => [f.name, perFamily[f.id] ?? 0])));
console.log("Per nivell:", Object.fromEntries(LEVELS.map((l) => [l.name, perLevel[l.id] ?? 0])));
[...new Set(errors)].forEach((e) => console.log(`ERROR ${e}`));
if (errors.length) {
  console.log(`\n${new Set(errors).size} errors.`);
  process.exit(1);
}
console.log("\nTot correcte.");

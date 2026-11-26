// Motor químic: anàlisi de fórmules, recompte d'àtoms i càrregues, i comprovació d'equacions.
// No depèn del DOM: el fan servir l'app i l'script de validació (scripts/valida-equacions.mjs).
//
// Notació de les fórmules:
//   - Subíndexs com a dígits: H2O, Ca(OH)2, (NH4)2SO4, CuSO4·5H2O
//   - Càrrega sempre amb «^»: Fe^2+, MnO4^-, Cr2O7^2-, H^+, OH^-

const CHARGE_RE = /\^(\d*)([+-])$/;

// Separa la càrrega iònica del cos de la fórmula.
export function splitCharge(formula) {
  const clean = String(formula ?? "").trim().replace(/\s+/g, "").replace(/−/g, "-");
  const match = clean.match(CHARGE_RE);
  if (!match) return { body: clean, charge: 0 };
  const size = match[1] ? Number.parseInt(match[1], 10) : 1;
  return {
    body: clean.slice(0, match.index),
    charge: match[2] === "+" ? size : -size,
  };
}

export function formulaCharge(formula) {
  return splitCharge(formula).charge;
}

// Retorna el recompte d'àtoms d'una fórmula: { H: 2, O: 1 }.
export function parseFormula(formula) {
  const { body } = splitCharge(formula);
  return body
    .replace(/\((aq|s|l|g)\)$/i, "")
    .split(/[.·*]/)
    .filter(Boolean)
    .reduce((acc, part) => addCounts(acc, parsePart(part)), {});
}

function parsePart(part) {
  let body = part;
  let multiplier = 1;
  const leading = body.match(/^(\d+)(.+)$/);
  if (leading) {
    multiplier = Number.parseInt(leading[1], 10);
    body = leading[2];
  }
  let index = 0;
  const stack = [{}];

  const readNumber = () => {
    const start = index;
    while (index < body.length && /\d/.test(body[index])) index += 1;
    return index > start ? Number.parseInt(body.slice(start, index), 10) : 1;
  };

  while (index < body.length) {
    const char = body[index];
    if (char === "(" || char === "[") {
      index += 1;
      stack.push({});
    } else if (char === ")" || char === "]") {
      index += 1;
      const factor = readNumber();
      const group = stack.pop();
      addCounts(stack[stack.length - 1], group, factor);
    } else if (/[A-Z]/.test(char)) {
      let symbol = char;
      index += 1;
      while (index < body.length && /[a-z]/.test(body[index])) {
        symbol += body[index];
        index += 1;
      }
      const amount = readNumber();
      const target = stack[stack.length - 1];
      target[symbol] = (target[symbol] ?? 0) + amount;
    } else {
      throw new Error(`Caràcter inesperat «${char}» a la fórmula ${part}`);
    }
  }
  if (stack.length !== 1) throw new Error(`Parèntesis desaparellats a la fórmula ${part}`);
  return scaleCounts(stack[0], multiplier);
}

function scaleCounts(counts, factor) {
  return Object.fromEntries(Object.entries(counts).map(([el, n]) => [el, n * factor]));
}

function addCounts(target, source, factor = 1) {
  Object.entries(source).forEach(([el, n]) => {
    target[el] = (target[el] ?? 0) + n * factor;
  });
  return target;
}

// Elements en l'ordre en què apareixen a l'equació.
export function equationElements(equation) {
  const seen = [];
  [...equation.reactants, ...equation.products].forEach((formula) => {
    Object.keys(parseFormula(formula)).forEach((el) => {
      if (!seen.includes(el)) seen.push(el);
    });
  });
  return seen;
}

export function sideTotals(formulas, coefficients) {
  const atoms = {};
  let charge = 0;
  formulas.forEach((formula, i) => {
    const n = coefficients[i] ?? 0;
    addCounts(atoms, parseFormula(formula), n);
    charge += formulaCharge(formula) * n;
  });
  return { atoms, charge };
}

export function hasIons(equation) {
  return [...equation.reactants, ...equation.products].some((f) => formulaCharge(f) !== 0);
}

export function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x;
}

export function gcdList(values) {
  return values.reduce((acc, v) => gcd(acc, v), 0);
}

// Analitza uns coeficients. Retorna l'estat de cada element i de la càrrega.
export function analyse(equation, coefficients) {
  const nR = equation.reactants.length;
  const left = sideTotals(equation.reactants, coefficients.slice(0, nR));
  const right = sideTotals(equation.products, coefficients.slice(nR));
  const elements = equationElements(equation).map((el) => ({
    element: el,
    left: left.atoms[el] ?? 0,
    right: right.atoms[el] ?? 0,
  }));
  const atomsOk = elements.every((row) => row.left === row.right);
  const chargeOk = left.charge === right.charge;
  const allPositive = coefficients.every((c) => Number.isInteger(c) && c >= 1);
  const divisor = allPositive ? gcdList(coefficients) : 1;
  return {
    elements,
    leftCharge: left.charge,
    rightCharge: right.charge,
    atomsOk,
    chargeOk,
    allPositive,
    balanced: allPositive && atomsOk && chargeOk,
    divisor,
    simplest: divisor === 1,
  };
}

// Fórmula en HTML amb lletra recta, subíndexs i càrrega en superíndex.
export function formulaHTML(formula) {
  const { body, charge } = splitCharge(formula);
  let html = body
    .replace(/[.*]/g, "·")
    .replace(/([A-Za-z)\]])(\d+)/g, "$1<sub>$2</sub>");
  if (charge) {
    const size = Math.abs(charge) === 1 ? "" : Math.abs(charge);
    html += `<sup>${size}${charge > 0 ? "+" : "−"}</sup>`;
  }
  return html;
}

// Fórmula en text pla amb caràcters Unicode (per a missatges i aria-label).
export function formulaText(formula) {
  const SUB = "₀₁₂₃₄₅₆₇₈₉";
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const { body, charge } = splitCharge(formula);
  let text = body.replace(/([A-Za-z)\]])(\d+)/g, (_, a, d) => a + [...d].map((c) => SUB[c]).join(""));
  if (charge) {
    const size = Math.abs(charge) === 1 ? "" : [...String(Math.abs(charge))].map((c) => SUP[c]).join("");
    text += size + (charge > 0 ? "⁺" : "⁻");
  }
  return text;
}

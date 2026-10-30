// Lectura i escriptura de fórmules: recompte d'àtoms, validació de símbols i format HTML.
// No depèn del DOM: el fan servir l'app i l'script de validació (scripts/valida-dades.mjs).
//
// Notació: subíndexs com a dígits (H2O, Ca(OH)2, Fe2(SO4)3) i càrrega amb «^» (Fe^3+, SO4^2-).

const SYMBOLS = new Set(
  (
    "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr " +
    "Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu " +
    "Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr"
  ).split(" ")
);

const SUB_DIGITS = "₀₁₂₃₄₅₆₇₈₉";

// Neteja el que escriu l'alumne: espais, subíndexs Unicode i signes.
export function cleanFormulaInput(text) {
  return String(text ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[₀-₉]/g, (d) => String(SUB_DIGITS.indexOf(d)))
    .replace(/[−–]/g, "-");
}

// Recompte d'àtoms: { Fe: 2, S: 3, O: 12 }. Llança un error si la fórmula no és vàlida.
export function parseFormula(formula) {
  const body = cleanFormulaInput(formula).replace(/\^\d*[+-]$/, "");
  if (!body) throw new Error("La fórmula és buida.");
  let index = 0;
  const stack = [{}];
  const readNumber = () => {
    const start = index;
    while (index < body.length && /\d/.test(body[index])) index += 1;
    return index > start ? Number.parseInt(body.slice(start, index), 10) : 1;
  };
  while (index < body.length) {
    const char = body[index];
    if (char === "(") {
      index += 1;
      stack.push({});
    } else if (char === ")") {
      index += 1;
      if (stack.length < 2) throw new Error("Hi ha un parèntesi de tancament de més.");
      const factor = readNumber();
      const group = stack.pop();
      Object.entries(group).forEach(([el, n]) => {
        const top = stack[stack.length - 1];
        top[el] = (top[el] ?? 0) + n * factor;
      });
    } else if (/[A-Z]/.test(char)) {
      let symbol = char;
      index += 1;
      while (index < body.length && /[a-z]/.test(body[index])) {
        symbol += body[index];
        index += 1;
      }
      if (!SYMBOLS.has(symbol)) throw new Error(`«${symbol}» no és el símbol de cap element.`);
      const amount = readNumber();
      const top = stack[stack.length - 1];
      top[symbol] = (top[symbol] ?? 0) + amount;
    } else {
      throw new Error(`No s'entén el caràcter «${char}».`);
    }
  }
  if (stack.length !== 1) throw new Error("Falta tancar un parèntesi.");
  return stack[0];
}

export function sameCounts(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((k) => (a[k] ?? 0) === (b[k] ?? 0));
}

// Si b és un múltiple de a, retorna el factor (2, 3…); si no, 0.
export function multipleOf(a, b) {
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length || !keys.every((k) => b[k])) return 0;
  const factor = b[keys[0]] / a[keys[0]];
  return Number.isInteger(factor) && factor > 1 && keys.every((k) => b[k] === a[k] * factor) ? factor : 0;
}

// Fórmula en HTML amb subíndexs i càrrega en superíndex.
export function formulaHTML(formula) {
  const text = String(formula ?? "");
  const match = text.match(/\^(\d*)([+-])$/);
  const body = match ? text.slice(0, match.index) : text;
  let html = body.replace(/([A-Za-z)])(\d+)/g, "$1<sub>$2</sub>");
  if (match) html += `<sup>${match[1] === "1" ? "" : match[1]}<span class="sgn">${match[2] === "+" ? "+" : "−"}</span></sup>`;
  return html;
}

// Fórmula en text pla amb subíndexs Unicode (per a missatges i aria-label).
export function formulaText(formula) {
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "+": "⁺", "-": "⁻" };
  const text = String(formula ?? "");
  const match = text.match(/\^(\d*)([+-])$/);
  const body = match ? text.slice(0, match.index) : text;
  let out = body.replace(/([A-Za-z)])(\d+)/g, (_, a, d) => a + [...d].map((c) => SUB_DIGITS[c]).join(""));
  if (match) out += [...(match[1] === "1" ? "" : match[1]), match[2]].map((c) => SUP[c]).join("");
  return out;
}

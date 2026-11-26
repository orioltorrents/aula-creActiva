// Dibuix de molècules i ions en SVG a partir de la fórmula.
// Cada model és { atoms: [{ el, x, y }], bonds: [[i, j]], charge }.
// - Elements i ions monoatòmics: un sol àtom (amb la càrrega, si n'hi ha).
// - Molècules orgàniques: cadena de carbonis amb els H i els O al voltant.
// - Oxoàcids, oxosals i ions poliatòmics: àtom central amb els oxígens al voltant.
// - Compostos iònics binaris: xarxa d'àtoms en contacte, sense enllaços.

import { parseFormula, splitCharge } from "./chem.js";

const SVG_NS = "http://www.w3.org/2000/svg";

// Colors CPK (adaptats perquè el símbol es llegeixi bé a dins).
export const ELEMENT_INFO = {
  H: { color: "#ffffff", name: "hidrogen" },
  C: { color: "#3f3f46", name: "carboni" },
  N: { color: "#2f6fe0", name: "nitrogen" },
  O: { color: "#e53935", name: "oxigen" },
  F: { color: "#8bd14f", name: "fluor" },
  Cl: { color: "#2fae44", name: "clor" },
  Br: { color: "#a1352c", name: "brom" },
  I: { color: "#7b2a9e", name: "iode" },
  S: { color: "#f4c20d", name: "sofre" },
  P: { color: "#f08a24", name: "fòsfor" },
  Na: { color: "#a35ee8", name: "sodi" },
  K: { color: "#7e3ac4", name: "potassi" },
  Mg: { color: "#4fae2a", name: "magnesi" },
  Ca: { color: "#2b7f39", name: "calci" },
  Ba: { color: "#13917a", name: "bari" },
  Al: { color: "#a8979a", name: "alumini" },
  Fe: { color: "#cf6a2d", name: "ferro" },
  Cu: { color: "#b8682a", name: "coure" },
  Zn: { color: "#6e74a8", name: "zinc" },
  Ag: { color: "#aeb3bc", name: "plata" },
  Hg: { color: "#8f92b8", name: "mercuri" },
  Pb: { color: "#585b67", name: "plom" },
  Mn: { color: "#8c6cc0", name: "manganès" },
  Cr: { color: "#6d82b8", name: "crom" },
  Sn: { color: "#5f7d7d", name: "estany" },
};

const RADII = { H: 9, C: 13, N: 13, O: 13, F: 13, Cl: 15, S: 15, P: 15, Br: 16, I: 17 };
const METALS = new Set(["Li", "Na", "K", "Mg", "Ca", "Ba", "Al", "Fe", "Cu", "Zn", "Ag", "Hg", "Pb", "Mn", "Cr", "Sn", "Ni", "Co"]);
const CATIONS = new Set(["Li", "Na", "K", "Mg", "Ca", "Ba", "Al", "Fe", "Cu", "Zn", "Ag", "Hg", "Pb", "Sn", "Ni", "Co"]);
const GAP = 3;

export function elementColor(el) {
  if (ELEMENT_INFO[el]) return ELEMENT_INFO[el].color;
  let hash = 0;
  for (const ch of el) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `hsl(${hash % 360} 55% 45%)`;
}

export function elementName(el) {
  return ELEMENT_INFO[el]?.name ?? el;
}

function radius(el) {
  return RADII[el] ?? (METALS.has(el) ? 17 : 15);
}

// Text fosc sobre colors clars i blanc sobre colors foscos.
function textColor(hex) {
  if (!hex.startsWith("#")) return "#fff";
  const n = Number.parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#1e293b" : "#ffffff";
}

const model = (atoms = [], bonds = [], charge = 0) => ({ atoms, bonds, charge });
const at = (el, x, y) => ({ el, x, y });

function single(el) {
  return model([at(el, 0, 0)]);
}

function chainOf(el, n) {
  const d = radius(el) * 2 + GAP + 6;
  const atoms = [];
  const bonds = [];
  for (let i = 0; i < n; i += 1) {
    atoms.push(at(el, i * d, n > 2 && i % 2 ? 12 : 0));
    if (i) bonds.push([i - 1, i]);
  }
  return model(atoms, bonds);
}

// Àtom central amb els lligands al voltant; els H s'enganxen als O de fora.
function star(center, ligands, hydrogens = 0) {
  const atoms = [at(center, 0, 0)];
  const bonds = [];
  const n = ligands.length;
  const angles =
    n === 1 ? [0]
    : n === 2 ? (center === "C" ? [180, 0] : [200, 340])
    : n === 3 ? [270, 30, 150]
    : n === 4 ? [225, 315, 45, 135]
    : Array.from({ length: n }, (_, i) => 270 + (360 / n) * i);
  ligands.forEach((el, i) => {
    const a = (angles[i] * Math.PI) / 180;
    const d = radius(center) + radius(el) + GAP + 6;
    atoms.push(at(el, Math.cos(a) * d, Math.sin(a) * d));
    bonds.push([0, atoms.length - 1]);
  });
  let h = hydrogens;
  for (let i = 1; i < atoms.length && h > 0; i += 1) {
    if (atoms[i].el !== "O") continue;
    const { x, y } = atoms[i];
    const len = Math.hypot(x, y) || 1;
    const d = radius("O") + radius("H") + GAP + 4;
    atoms.push(at("H", x + (x / len) * d, y + (y / len) * d));
    bonds.push([i, atoms.length - 1]);
    h -= 1;
  }
  return model(atoms, bonds);
}

// Cadena de carbonis (alcans, alcohols, glucosa, sacarosa, àcid acètic...).
function organicChain(counts) {
  const nC = counts.C;
  let nO = counts.O ?? 0;
  let nN = counts.N ?? 0;
  let nH = counts.H ?? 0;
  const dx = radius("C") * 2 + GAP + 8;
  const atoms = [];
  const bonds = [];
  for (let i = 0; i < nC; i += 1) {
    atoms.push(at("C", i * dx, i % 2 ? 6 : -6));
    if (i) bonds.push([i - 1, i]);
  }
  // Posicions lliures al voltant de cada carboni.
  const slots = [];
  for (let i = 0; i < nC; i += 1) {
    if (i === 0) slots.push({ c: i, dir: [-1, 0] });
    slots.push({ c: i, dir: [0, -1] }, { c: i, dir: [0, 1] });
    if (i === nC - 1) slots.push({ c: i, dir: [1, 0] });
  }
  const place = (slot, el) => {
    const c = atoms[slot.c];
    const d = radius("C") + radius(el) + GAP + 4;
    atoms.push(at(el, c.x + slot.dir[0] * d, c.y + slot.dir[1] * d));
    bonds.push([slot.c, atoms.length - 1]);
    return atoms.length - 1;
  };
  // Heteroàtoms: primer a l'extrem dret i després a dalt de la cadena, de dreta a esquerra.
  const hetero = [];
  const preference = [
    ...slots.filter((s) => s.dir[0] === 1),
    ...slots.filter((s) => s.dir[1] === -1).reverse(),
    ...slots.filter((s) => s.dir[1] === 1).reverse(),
    ...slots.filter((s) => s.dir[0] === -1),
  ];
  const used = new Set();
  while (nO + nN > 0) {
    const s = preference.find((slot) => !used.has(slot));
    if (!s) break;
    used.add(s);
    const el = nN > 0 ? "N" : "O";
    if (el === "N") nN -= 1; else nO -= 1;
    hetero.push(place(s, el));
  }
  slots.forEach((s) => {
    if (used.has(s) || nH <= 0) return;
    used.add(s);
    place(s, "H");
    nH -= 1;
  });
  // Hidrògens que sobren: als heteroàtoms (grups –OH, –NH2).
  hetero.forEach((idx) => {
    if (nH <= 0) return;
    const o = atoms[idx];
    const parent = atoms[bonds.find(([, b]) => b === idx)[0]];
    const vx = o.x - parent.x;
    const vy = o.y - parent.y;
    const len = Math.hypot(vx, vy) || 1;
    const d = radius(o.el) + radius("H") + GAP + 4;
    atoms.push(at("H", o.x + (vx / len) * d, o.y + (vy / len) * d));
    bonds.push([idx, atoms.length - 1]);
    nH -= 1;
  });
  return model(atoms, bonds);
}

// Xarxa iònica: àtoms en contacte, repartits de manera alterna.
function lattice(counts) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, n]) => s + n, 0);
  const seq = [];
  const done = Object.fromEntries(entries.map(([el]) => [el, 0]));
  for (let k = 0; k < total; k += 1) {
    // Tria l'element més endarrerit respecte del seu percentatge.
    let best = null;
    let bestScore = Infinity;
    entries.forEach(([el, n]) => {
      if (done[el] >= n) return;
      const score = (done[el] + 0.5) / n;
      if (score < bestScore) { bestScore = score; best = el; }
    });
    seq.push(best);
    done[best] += 1;
  }
  const cols = total <= 3 ? total : total <= 6 ? Math.ceil(total / 2) : Math.ceil(Math.sqrt(total * 1.4));
  const step = Math.max(...entries.map(([el]) => radius(el))) * 2 - 1;
  const atoms = seq.map((el, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    return at(el, col * step + (row % 2 ? step / 2 : 0), row * step * 0.88);
  });
  return model(atoms, []);
}

// Fragments de la fórmula al primer nivell: elements i grups entre parèntesis.
function topTokens(body) {
  const tokens = [];
  let i = 0;
  const num = () => {
    const m = body.slice(i).match(/^\d+/);
    if (!m) return 1;
    i += m[0].length;
    return Number.parseInt(m[0], 10);
  };
  while (i < body.length) {
    if (body[i] === "(") {
      let depth = 1;
      let j = i + 1;
      while (j < body.length && depth) {
        if (body[j] === "(") depth += 1;
        if (body[j] === ")") depth -= 1;
        j += 1;
      }
      const inner = body.slice(i + 1, j - 1);
      i = j;
      tokens.push({ group: inner, n: num() });
    } else {
      const m = body.slice(i).match(/^[A-Z][a-z]?/);
      if (!m) { i += 1; continue; }
      i += m[0].length;
      tokens.push({ el: m[0], n: num() });
    }
  }
  return tokens;
}

// Col·loca diverses unitats (ions) una al costat de l'altra, en una o dues files.
function pack(units) {
  const boxes = units.map((u) => ({ u, b: bbox(u) }));
  const area = boxes.reduce((s, { b }) => s + (b.w + 6) * (b.h + 6), 0);
  const maxW = Math.max(Math.sqrt(area) * 1.5, ...boxes.map(({ b }) => b.w));
  const rows = [[]];
  let w = 0;
  boxes.forEach((item) => {
    if (w > 0 && w + item.b.w > maxW) { rows.push([]); w = 0; }
    rows[rows.length - 1].push(item);
    w += item.b.w + 6;
  });
  const atoms = [];
  const bonds = [];
  let y = 0;
  rows.forEach((row) => {
    const rowH = Math.max(...row.map(({ b }) => b.h));
    const rowW = row.reduce((s, { b }) => s + b.w + 6, -6);
    let x = -rowW / 2;
    row.forEach(({ u, b }) => {
      const offset = atoms.length;
      u.atoms.forEach((a) => atoms.push(at(a.el, a.x - b.x + x, a.y - b.y + y + (rowH - b.h) / 2)));
      u.bonds.forEach(([p, q]) => bonds.push([p + offset, q + offset]));
      x += b.w + 6;
    });
    y += rowH + 6;
  });
  return model(atoms, bonds);
}

function interleave(cations, anions) {
  if (!cations.length) return anions;
  if (!anions.length) return cations;
  const out = [];
  const [many, few] = cations.length >= anions.length ? [cations, anions] : [anions, cations];
  const ratio = many.length / few.length;
  let k = 0;
  many.forEach((u, i) => {
    out.push(u);
    if (k < few.length && (i + 1) >= ratio * (k + 0.5)) out.push(few[k++]);
  });
  while (k < few.length) out.push(few[k++]);
  return out;
}

const LIBRARY = {
  H2O: () => star("O", ["H", "H"]),
  CO2: () => star("C", ["O", "O"]),
  H2O2: () => {
    const m = model([at("O", -15, 0), at("O", 15, 0), at("H", -28, -16), at("H", 28, 16)], [[0, 1], [0, 2], [1, 3]]);
    return m;
  },
};

export function buildModel(formula) {
  const { body, charge } = splitCharge(formula);
  const counts = parseFormula(formula);
  const els = Object.keys(counts);
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const withCharge = (m) => ({ ...m, charge });

  if (total === 1) return withCharge(single(els[0]));
  if (LIBRARY[body]) return withCharge(LIBRARY[body]());
  if (els.length === 1) return withCharge(chainOf(els[0], total));

  const tokens = topTokens(body);
  if (tokens.some((t) => t.group)) {
    const cations = [];
    const anions = [];
    const rest = [];
    tokens.forEach((t) => {
      if (t.group) {
        for (let k = 0; k < t.n; k += 1) (t.group.startsWith("NH") ? cations : anions).push(buildModel(t.group));
      } else if (CATIONS.has(t.el)) {
        for (let k = 0; k < t.n; k += 1) cations.push(single(t.el));
      } else {
        rest.push(t.el + (t.n > 1 ? t.n : ""));
      }
    });
    if (rest.length) anions.push(buildModel(rest.join("")));
    return withCharge(pack(interleave(cations, anions)));
  }

  const isOrganic = counts.C && counts.H && els.every((e) => ["C", "H", "O", "N"].includes(e)) && (counts.C >= 2 || counts.H >= 3);
  if (isOrganic) return withCharge(organicChain(counts));

  const cationEls = els.filter((e) => CATIONS.has(e));
  const coreEls = els.filter((e) => !CATIONS.has(e));
  const core = Object.fromEntries(coreEls.map((e) => [e, counts[e]]));
  const centers = coreEls.filter((e) => e !== "O" && e !== "H" && core[e] === 1);

  // Oxoàcids i oxosals: XOn (amb H als oxígens) + cations a banda.
  if (core.O >= 2 && centers.length === 1 && Object.keys(core).every((e) => e === centers[0] || e === "O" || e === "H")) {
    const anion = star(centers[0], Array(core.O).fill("O"), core.H ?? 0);
    const cations = cationEls.flatMap((e) => Array(counts[e]).fill(0).map(() => single(e)));
    return withCharge(cations.length ? pack(interleave(cations, [anion])) : anion);
  }
  // Permanganat i semblants: el metall de transició fa de centre.
  const tmCenter = els.find((e) => (e === "Mn" || e === "Cr") && counts[e] === 1);
  if (tmCenter && counts.O >= 2) {
    const anion = star(tmCenter, Array(counts.O).fill("O"));
    const cations = els.filter((e) => e !== tmCenter && e !== "O").flatMap((e) => Array(counts[e]).fill(0).map(() => single(e)));
    return withCharge(cations.length ? pack(interleave(cations, [anion])) : anion);
  }
  // Composts iònics: cations + la resta.
  if (cationEls.length) {
    const cations = () => cationEls.flatMap((e) => Array(counts[e]).fill(0).map(() => single(e)));
    // Azida (NaN3): ió N3 lineal.
    if (coreEls.length === 1 && coreEls[0] === "N" && core.N > 1) {
      return withCharge(pack(interleave(cations(), [chainOf("N", core.N)])));
    }
    // Hidròxids i altres anions amb hidrogen o de més d'un element (NaOH, K2Cr2O7).
    if (core.H || coreEls.length > 1) {
      const coreFormula = coreEls.map((e) => e + (core[e] > 1 ? core[e] : "")).join("");
      const anion = buildModel(coreFormula.replace(/^H(\d*)O(\d*)$/, "O$2H$1"));
      return withCharge(pack(interleave(cations(), [anion])));
    }
    // Composts binaris (NaCl, Fe2O3, CaCl2...): xarxa d'àtoms en contacte.
    return withCharge(lattice(counts));
  }
  // Molècules covalents amb un àtom central: NH3, H2S, SO2, SO3, NO2, HCl...
  if (total === 2) {
    const [a, b] = els.length === 2 ? els : [els[0], els[0]];
    return withCharge(model([at(a, 0, 0), at(b, radius(a) + radius(b) + GAP + 6, 0)], [[0, 1]]));
  }
  const center = els.find((e) => counts[e] === 1 && e !== "H") ?? els.find((e) => counts[e] === 1);
  if (center) {
    const ligands = els.filter((e) => e !== center).flatMap((e) => Array(counts[e]).fill(e));
    return withCharge(star(center, ligands));
  }
  return withCharge(lattice(counts));
}

function bbox(m) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  m.atoms.forEach((a) => {
    const r = radius(a.el);
    minX = Math.min(minX, a.x - r);
    minY = Math.min(minY, a.y - r);
    maxX = Math.max(maxX, a.x + r);
    maxY = Math.max(maxY, a.y + r);
  });
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

const cache = new Map();

// Retorna un SVG nou per a la fórmula i la seva relació d'aspecte (amplada / alçada).
export function moleculeSVG(formula) {
  if (!cache.has(formula)) {
    const m = buildModel(formula);
    const b = bbox(m);
    const pad = 3;
    const extraTop = m.charge ? 8 : 0;
    const extraRight = m.charge ? 10 : 0;
    const view = { x: b.x - pad, y: b.y - pad - extraTop, w: b.w + pad * 2 + extraRight, h: b.h + pad * 2 + extraTop };
    let inner = "";
    m.bonds.forEach(([p, q]) => {
      const a = m.atoms[p];
      const c = m.atoms[q];
      inner += `<line class="bond" x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${c.x.toFixed(1)}" y2="${c.y.toFixed(1)}"/>`;
    });
    m.atoms.forEach((a) => {
      const r = radius(a.el);
      const fill = elementColor(a.el);
      inner +=
        `<g class="atom"><circle cx="${a.x.toFixed(1)}" cy="${a.y.toFixed(1)}" r="${r}" fill="${fill}"${a.el === "H" ? ' class="light"' : ""}/>` +
        `<circle class="shine" cx="${(a.x - r * 0.35).toFixed(1)}" cy="${(a.y - r * 0.38).toFixed(1)}" r="${(r * 0.3).toFixed(1)}"/>` +
        `<text x="${a.x.toFixed(1)}" y="${(a.y + r * 0.36).toFixed(1)}" font-size="${(r * (a.el.length > 1 ? 0.92 : 1.05)).toFixed(1)}" fill="${textColor(fill)}">${a.el}</text></g>`;
    });
    if (m.charge) {
      const size = Math.abs(m.charge) === 1 ? "" : Math.abs(m.charge);
      const sign = m.charge > 0 ? "+" : "−";
      const cx = b.x + b.w + extraRight - 7;
      const cy = b.y - extraTop + 7;
      inner += `<g class="charge ${m.charge > 0 ? "pos" : "neg"}"><circle cx="${cx}" cy="${cy}" r="10"/><text x="${cx}" y="${cy + 3.6}" font-size="${size ? 10 : 13}">${size}${sign}</text></g>`;
    }
    cache.set(formula, {
      markup: `<svg xmlns="${SVG_NS}" viewBox="${view.x.toFixed(1)} ${view.y.toFixed(1)} ${view.w.toFixed(1)} ${view.h.toFixed(1)}" aria-hidden="true" focusable="false">${inner}</svg>`,
      aspect: view.w / view.h,
      atoms: m.atoms.length,
      unit: Math.max(view.w, view.h),
    });
  }
  return cache.get(formula);
}

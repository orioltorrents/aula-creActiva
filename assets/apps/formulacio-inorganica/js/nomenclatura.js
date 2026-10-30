// Catàleg de compostos inorgànics amb els seus noms (recomanacions IUPAC del 2005, versió catalana).
// Els compostos iònics es generen a partir dels ions; la resta (substàncies simples, òxids de no-metalls,
// compostos entre no-metalls i hidrurs progenitors) són llistes revisades a mà.
// No depèn del DOM: el fan servir l'app i l'script de validació.

export const LEVELS = [
  { id: 1, name: "Fàcil", course: "3r d'ESO" },
  { id: 2, name: "Mitjà", course: "4t d'ESO" },
  { id: 3, name: "Batxillerat", course: "Batxillerat" },
];

export const FAMILIES = [
  { id: "simple", name: "Substància simple", plural: "Substàncies simples", level: 1, module: 1, rule: "Està formada per un sol element." },
  { id: "oxid", name: "Òxid", plural: "Òxids", level: 1, module: 2, rule: "Un element (metall o no-metall) combinat amb oxigen, que actua com a O²⁻." },
  { id: "hidrur", name: "Hidrur", plural: "Hidrurs", level: 1, module: 2, rule: "Hidrogen combinat amb un altre element: un metall (hidrur metàl·lic) o un no-metall (hidràcids i hidrurs progenitors)." },
  { id: "salBinaria", name: "Sal binària", plural: "Sals binàries", level: 1, module: 2, rule: "Un metall (o l'amoni) combinat amb un no-metall que no és oxigen ni hidrogen." },
  { id: "nometalls", name: "Compost entre no-metalls", plural: "Compostos entre no-metalls", level: 1, module: 2, rule: "Dos no-metalls units, sense oxigen ni hidrogen. S'anomenen amb prefixos." },
  { id: "peroxid", name: "Peròxid", plural: "Peròxids", level: 3, module: 2, rule: "Un metall o l'hidrogen combinat amb el grup peròxid, O₂²⁻, que no es pot simplificar." },
  { id: "hidroxid", name: "Hidròxid", plural: "Hidròxids", level: 2, module: 3, rule: "Un metall combinat amb l'ió hidròxid, OH⁻." },
  { id: "oxoacid", name: "Oxoàcid", plural: "Oxoàcids", level: 2, module: 4, rule: "Hidrogen + no-metall (o metall de transició) + oxigen: H + oxoanió." },
  { id: "oxosal", name: "Oxosal", plural: "Oxosals", level: 2, module: 5, rule: "Un metall (o l'amoni) combinat amb un oxoanió." },
  { id: "salAcida", name: "Sal àcida", plural: "Sals àcides", level: 3, module: 5, rule: "Un metall (o l'amoni) combinat amb un anió que conserva algun hidrogen." },
];

export const KINDS = {
  comp: "Composició",
  ox: "Nombre d'oxidació",
  trad: "Tradicional",
  hid: "D'hidrogen",
  com: "Nom comú",
  acc: "Nom acceptat",
  elem: "Nom de l'element",
};

export const ELEMENT_NAMES = {
  H: "hidrogen", Li: "liti", Na: "sodi", K: "potassi", Mg: "magnesi", Ca: "calci", Sr: "estronci", Ba: "bari",
  Al: "alumini", Zn: "zinc", Ag: "argent", Fe: "ferro", Co: "cobalt", Ni: "níquel", Cu: "coure", Au: "or",
  Hg: "mercuri", Pb: "plom", Sn: "estany", Cr: "crom", Mn: "manganès", B: "bor", C: "carboni", Si: "silici",
  N: "nitrogen", P: "fòsfor", O: "oxigen", S: "sofre", Se: "seleni", F: "fluor", Cl: "clor", Br: "brom", I: "iode",
  He: "heli", Ne: "neó", Ar: "argó",
};

const PREFIX = ["", "mono", "di", "tri", "tetra", "penta", "hexa", "hepta", "octa"];
export const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII"];

/* ---------- Regles de llengua ---------- */

// S'apostrofa davant de vocal o h + vocal, però no davant de i/u semivocals (de iode).
export function elides(word) {
  return /^h?([aeoàèéòó]|[iíuú](?![aeiouàèéíòóú]))/i.test(word);
}

export const de = (word) => (elides(word) ? `d'${word}` : `de ${word}`);

const prefixed = (n, word) => (n === 1 ? word : PREFIX[n] + word);
const monoWord = (word) => (word === "òxid" ? "monòxid" : `mono${word}`);
const dePrefixed = (n, word) => (n === 1 ? de(word) : `de ${PREFIX[n]}${word}`);

/* ---------- Ions ---------- */

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

function cation(symbol, charge, opts = {}) {
  return {
    id: `${symbol}${charge}`,
    formula: symbol,
    charge,
    name: ELEMENT_NAMES[symbol],
    element: symbol,
    variable: Boolean(opts.variable),
    rare: Boolean(opts.rare),
    only: opts.only ?? null,
    poly: false,
    level: opts.level ?? 1,
  };
}

const V = { variable: true };
export const CATIONS = [
  cation("Li", 1), cation("Na", 1), cation("K", 1), cation("Mg", 2), cation("Ca", 2), cation("Sr", 2), cation("Ba", 2),
  cation("Al", 3), cation("Zn", 2), cation("Ag", 1),
  cation("Fe", 2, V), cation("Fe", 3, V), cation("Co", 2, V), cation("Co", 3, { ...V, rare: true }),
  cation("Ni", 2, V), cation("Ni", 3, { ...V, rare: true }), cation("Cu", 1, V), cation("Cu", 2, V),
  cation("Au", 1, { ...V, rare: true }), cation("Au", 3, V), cation("Hg", 2, V), cation("Pb", 2, V),
  cation("Pb", 4, { ...V, rare: true }), cation("Sn", 2, V), cation("Sn", 4, V), cation("Cr", 2, { ...V, rare: true }),
  cation("Cr", 3, V), cation("Mn", 2, V), cation("Mn", 4, { ...V, only: ["oxid"] }),
  { id: "NH4", formula: "NH4", charge: 1, name: "amoni", variable: false, poly: true, level: 2, only: ["salBinaria", "oxosal", "salAcida"] },
];
export const H_CATION = { id: "H1", formula: "H", charge: 1, name: "hidrogen", element: "H", variable: false, poly: false, level: 1 };

function anion(formula, charge, name, level = 1, extra = {}) {
  return { id: formula + charge, formula, charge: -charge, name, poly: /[A-Z].*[A-Z]|\d/.test(formula), level, ...extra };
}

export const MONO_ANIONS = [
  anion("F", 1, "fluorur"), anion("Cl", 1, "clorur"), anion("Br", 1, "bromur"), anion("I", 1, "iodur"),
  anion("S", 2, "sulfur"), anion("Se", 2, "selenur", 3), anion("O", 2, "òxid"), anion("H", 1, "hidrur"),
];
const byFormula = (list, f) => list.find((a) => a.formula === f);
export const OH = anion("OH", 1, "hidròxid", 2);
export const PEROXIDE = { ...anion("O2", 2, "peròxid", 3), poly: true };

// Oxoanions: fórmula, càrrega, anió, àcid, arrel per a la nomenclatura d'hidrogen, nivell.
export const OXOANIONS = [
  ["SO4", 2, "sulfat", "sulfúric", "tetraoxidosulfat", 2],
  ["SO3", 2, "sulfit", "sulfurós", "trioxidosulfat", 2],
  ["NO3", 1, "nitrat", "nítric", "trioxidonitrat", 2],
  ["NO2", 1, "nitrit", "nitrós", "dioxidonitrat", 2],
  ["CO3", 2, "carbonat", "carbònic", "trioxidocarbonat", 2],
  ["PO4", 3, "fosfat", "fosfòric", "tetraoxidofosfat", 2],
  ["BO3", 3, "borat", "bòric", "trioxidoborat", 2],
  ["SiO4", 4, "silicat", "silícic", "tetraoxidosilicat", 2],
  ["ClO", 1, "hipoclorit", "hipoclorós", "oxidoclorat", 2],
  ["ClO2", 1, "clorit", "clorós", "dioxidoclorat", 2],
  ["ClO3", 1, "clorat", "clòric", "trioxidoclorat", 2],
  ["ClO4", 1, "perclorat", "perclòric", "tetraoxidoclorat", 2],
  ["BrO", 1, "hipobromit", "hipobromós", "oxidobromat", 3],
  ["BrO3", 1, "bromat", "bròmic", "trioxidobromat", 3],
  ["BrO4", 1, "perbromat", "perbròmic", "tetraoxidobromat", 3],
  ["IO", 1, "hipoiodit", "hipoiodós", "oxidoiodat", 3],
  ["IO3", 1, "iodat", "iòdic", "trioxidoiodat", 3],
  ["IO4", 1, "periodat", "periòdic", "tetraoxidoiodat", 3],
  ["SeO4", 2, "selenat", "selènic", "tetraoxidoselenat", 3],
  ["SeO3", 2, "selenit", "selenós", "trioxidoselenat", 3],
  ["CrO4", 2, "cromat", "cròmic", "tetraoxidocromat", 3],
  ["Cr2O7", 2, "dicromat", "dicròmic", "heptaoxidodicromat", 3],
  ["MnO4", 2, "manganat", "mangànic", "tetraoxidomanganat", 3],
  ["MnO4", 1, "permanganat", "permangànic", "tetraoxidomanganat", 3],
].map(([f, q, name, acid, hydro, level]) => anion(f, q, name, level, { acid, hydro, oxo: true }));

// Anions amb hidrogen (sals àcides). S'accepta també la grafia «hidrogeno-».
export const ACID_ANIONS = [
  ["HCO3", 1, "hidrogencarbonat"],
  ["HSO4", 1, "hidrogensulfat"],
  ["HSO3", 1, "hidrogensulfit"],
  ["H2PO4", 1, "dihidrogenfosfat"],
  ["HPO4", 2, "hidrogenfosfat"],
  ["HS", 1, "hidrogensulfur"],
].map(([f, q, name]) => anion(f, q, name, 3, { acidSalt: true }));

export function ionLabel(ion) {
  const q = Math.abs(ion.charge);
  return `${ion.formula}^${q === 1 ? "" : q}${ion.charge > 0 ? "+" : "-"}`;
}

export const cationName = (c) => (c.variable ? `${c.name}(${ROMAN[c.charge]})` : c.name);
export const ionName = (ion) => (ion.charge > 0 ? `ió ${cationName(ion)}` : `ió ${ion.name}`);

/* ---------- Construcció de compostos ---------- */

export function ionCounts(cat, an) {
  const g = gcd(cat.charge, -an.charge);
  return { nC: -an.charge / g, nA: cat.charge / g };
}

export function ionicFormula(cat, an, nC, nA, acid = false) {
  const part = (ion, n, bracket) => (bracket && n > 1 ? `(${ion.formula})${n}` : `${ion.formula}${n > 1 ? n : ""}`);
  return part(cat, nC, cat.poly) + part(an, nA, an.poly && !acid);
}

function mergeNames(list) {
  const out = [];
  list.forEach((n) => {
    const same = out.find((o) => o.text === n.text);
    if (same) same.kinds = [...new Set([...same.kinds, ...n.kinds])];
    else out.push({ ...n, kinds: [...n.kinds] });
  });
  return out;
}

const nm = (text, kind, level = 1) => ({ text, kinds: [kind], level });

function record(data) {
  return {
    accept: [],
    ions: null,
    context: CONTEXT[data.formula] ?? null,
    ...data,
    names: mergeNames(data.names),
  };
}

// Òxids, hidrurs metàl·lics, sals binàries i hidròxids: nom amb nombre d'oxidació i de composició.
function binaryIonic(cat, an, family) {
  const { nC, nA } = ionCounts(cat, an);
  const formula = ionicFormula(cat, an, nC, nA);
  const names = [nm(`${an.name} ${de(cationName(cat))}`, "ox")];
  const accept = [];
  if (!cat.poly) {
    if (nA === 1) {
      const mono = `${monoWord(an.name)} ${dePrefixed(nC, cat.name)}`;
      const plain = `${an.name} ${dePrefixed(nC, cat.name)}`;
      if (cat.variable && nC === 1) {
        names.push(nm(mono, "comp"));
        accept.push(plain);
      } else {
        names.push(nm(plain, "comp"));
        accept.push(mono);
      }
    } else {
      names.push(nm(`${prefixed(nA, an.name)} ${dePrefixed(nC, cat.name)}`, "comp"));
    }
  }
  return record({
    formula,
    family,
    level: Math.max(familyLevel(family), cat.level, an.level),
    names,
    accept,
    ions: { cat, an, nC, nA },
  });
}

function peroxide(cat) {
  const { nC, nA } = ionCounts(cat, PEROXIDE);
  const formula = ionicFormula(cat, PEROXIDE, nC, nA);
  const names = [nm(`peròxid ${de(cationName(cat))}`, "acc"), nm(`${prefixed(2 * nA, "òxid")} ${dePrefixed(nC, cat.name)}`, "comp")];
  if (cat.id === "H1") names.push(nm("aigua oxigenada", "com"));
  return record({ formula, family: "peroxid", level: 3, names, ions: { cat, an: PEROXIDE, nC, nA } });
}

function oxosalt(cat, an, family) {
  const { nC, nA } = ionCounts(cat, an);
  const formula = ionicFormula(cat, an, nC, nA);
  const name = `${an.name} ${de(cationName(cat))}`;
  const accept = an.acidSalt ? [name.replace(/hidrogen(?=[a-z])/g, "hidrogeno")] : [];
  const names = [nm(name, "trad")];
  if (formula === "NaHCO3") names.push(nm("bicarbonat de sodi", "com"));
  return record({
    formula,
    family,
    level: Math.max(familyLevel(family), cat.level, an.level),
    names,
    accept,
    ions: { cat, an, nC, nA },
  });
}

function oxoacid(an) {
  const { nC } = ionCounts(H_CATION, an);
  const formula = ionicFormula(H_CATION, an, nC, 1, true);
  const names = [nm(`àcid ${an.acid}`, "trad"), nm(`${nC === 1 ? "" : PREFIX[nC]}hidrogen(${an.hydro})`, "hid", 3)];
  return record({ formula, family: "oxoacid", level: an.level, names, ions: { cat: H_CATION, an, nC, nA: 1, acid: true } });
}

// Hidràcids: HCl, H2S… Noms de composició i, en dissolució aquosa, «àcid …hídric».
function hydracid(an, acidName, level = 1) {
  const { nC } = ionCounts(H_CATION, an);
  const formula = ionicFormula(H_CATION, an, nC, 1, true);
  const names = [nm(`${an.name} ${dePrefixed(nC, "hidrogen")}`, "comp"), nm(`àcid ${acidName}`, "com")];
  const accept = nC > 1 ? [`${an.name} d'hidrogen`] : [];
  return record({
    formula,
    family: "hidrur",
    level: Math.max(level, an.level),
    names,
    accept,
    note: "El nom «àcid …hídric» s'usa quan està dissolt en aigua.",
    ions: { cat: H_CATION, an, nC, nA: 1, acid: true },
  });
}

function familyLevel(id) {
  return FAMILIES.find((f) => f.id === id).level;
}

/* ---------- Llistes revisades a mà ---------- */

const SIMPLES = [
  ["H2", [["dihidrogen", "comp"], ["hidrogen", "com"]]],
  ["N2", [["dinitrogen", "comp"], ["nitrogen", "com"]]],
  ["O2", [["dioxigen", "comp"], ["oxigen", "com"]]],
  ["O3", [["trioxigen", "comp"], ["ozó", "com"]]],
  ["F2", [["difluor", "comp"], ["fluor", "com"]]],
  ["Cl2", [["diclor", "comp"], ["clor", "com"]]],
  ["Br2", [["dibrom", "comp"], ["brom", "com"]]],
  ["I2", [["diiode", "comp"], ["iode", "com"]]],
  ["P4", [["tetrafòsfor", "comp"], ["fòsfor blanc", "com"]]],
  ["S8", [["octasofre", "comp"], ["sofre", "com"]]],
  ["He", [["heli", "elem"]]],
  ["Ne", [["neó", "elem"]]],
  ["Ar", [["argó", "elem"]]],
  ["Fe", [["ferro", "elem"]]],
  ["Cu", [["coure", "elem"]]],
  ["Au", [["or", "elem"]]],
  ["Hg", [["mercuri", "elem"]]],
  ["Na", [["sodi", "elem"]]],
];

// Òxids de no-metalls: fórmula, composició, nombre d'oxidació.
const NONMETAL_OXIDES = [
  ["CO", "monòxid de carboni", "òxid de carboni(II)"],
  ["CO2", "diòxid de carboni", "òxid de carboni(IV)"],
  ["SiO2", "diòxid de silici", "òxid de silici"],
  ["SO2", "diòxid de sofre", "òxid de sofre(IV)"],
  ["SO3", "triòxid de sofre", "òxid de sofre(VI)"],
  ["N2O", "òxid de dinitrogen", "òxid de nitrogen(I)"],
  ["NO", "monòxid de nitrogen", "òxid de nitrogen(II)"],
  ["N2O3", "triòxid de dinitrogen", "òxid de nitrogen(III)"],
  ["NO2", "diòxid de nitrogen", "òxid de nitrogen(IV)"],
  ["N2O5", "pentaòxid de dinitrogen", "òxid de nitrogen(V)"],
  ["P2O3", "triòxid de difòsfor", "òxid de fòsfor(III)"],
  ["P2O5", "pentaòxid de difòsfor", "òxid de fòsfor(V)"],
  ["B2O3", "triòxid de dibor", "òxid de bor"],
  ["Cl2O", "òxid de diclor", "òxid de clor(I)"],
  ["Cl2O3", "triòxid de diclor", "òxid de clor(III)"],
  ["Cl2O5", "pentaòxid de diclor", "òxid de clor(V)"],
  ["Cl2O7", "heptaòxid de diclor", "òxid de clor(VII)"],
  ["Br2O", "òxid de dibrom", "òxid de brom(I)"],
  ["I2O5", "pentaòxid de diiode", "òxid de iode(V)"],
  ["SeO2", "diòxid de seleni", "òxid de seleni(IV)", 3],
];

// Compostos entre no-metalls: fórmula, composició, nombre d'oxidació (si n'hi ha).
const NONMETAL_BINARIES = [
  ["PCl3", "triclorur de fòsfor", "clorur de fòsfor(III)"],
  ["PCl5", "pentaclorur de fòsfor", "clorur de fòsfor(V)"],
  ["CCl4", "tetraclorur de carboni", "clorur de carboni(IV)"],
  ["CS2", "disulfur de carboni", "sulfur de carboni(IV)"],
  ["SF6", "hexafluorur de sofre", "fluorur de sofre(VI)"],
  ["NCl3", "triclorur de nitrogen", "clorur de nitrogen(III)"],
  ["BF3", "trifluorur de bor", "fluorur de bor"],
  ["SiCl4", "tetraclorur de silici", "clorur de silici"],
  ["SiC", "carbur de silici", null],
  ["OF2", "difluorur d'oxigen", null],
  ["BrF3", "trifluorur de brom", "fluorur de brom(III)", 3],
  ["IF5", "pentafluorur de iode", "fluorur de iode(V)", 3],
];

// Hidrurs progenitors: nom comú acceptat i nom sistemàtic.
const PARENT_HYDRIDES = [
  ["H2O", [["aigua", "com"]], 1],
  ["NH3", [["amoníac", "com"], ["azà", "acc"]], 1],
  ["CH4", [["metà", "acc"]], 1],
  ["PH3", [["fosfà", "acc"]], 3, ["fosfina"]],
  ["SiH4", [["silà", "acc"]], 3],
];

// Contextos de la vida quotidiana.
export const CONTEXT = {
  NaCl: "Sal de cuina.",
  KCl: "Substitut de la sal de cuina.",
  KI: "S'afegeix a la sal iodada.",
  CaCl2: "Sal per desglaçar les carreteres.",
  NaF: "Pasta de dents.",
  CaF2: "Fluorita, un mineral.",
  AgBr: "Pel·lícules fotogràfiques antigues.",
  PbS: "Galena, el mineral del plom.",
  HgS: "Cinabri, el mineral del mercuri.",
  NH4Cl: "Piles seques i soldadura.",
  Fe2O3: "Rovell: el ferro s'oxida a l'aire humit.",
  CaO: "Calç viva, per fer morter.",
  Al2O3: "Corindó: els robins i els safirs.",
  ZnO: "Cremes solars de protecció.",
  SnO2: "Cassiterita, el mineral de l'estany.",
  MnO2: "Piles alcalines.",
  Cu2O: "Pigment vermell.",
  MgO: "Magnèsia dels gimnastes i escaladors.",
  CO2: "Bombolles de les begudes i gas de la respiració.",
  CO: "Gas tòxic de les combustions incompletes.",
  SO2: "Conservant del vi i causa de la pluja àcida.",
  NO2: "Fum marronós de la contaminació del trànsit.",
  N2O: "Gas hilarant, anestèsic.",
  SiO2: "Sorra i quars.",
  H2O: "Aigua.",
  NH3: "Netejadors amoniacals i adobs.",
  CH4: "Gas natural.",
  HCl: "Salfumant (dissolt en aigua) i suc gàstric.",
  H2S: "Olor d'ous podrits.",
  NaH: "Agent reductor al laboratori.",
  H2O2: "Aigua oxigenada, desinfectant.",
  NaOH: "Sosa càustica, per fer sabó.",
  KOH: "Fabricació de sabons tous.",
  "Ca(OH)2": "Calç apagada, per fer morter.",
  "Mg(OH)2": "Antiàcid (llet de magnèsia).",
  "Al(OH)3": "Antiàcid per a l'estómac.",
  H2SO4: "Àcid de les bateries dels cotxes.",
  HNO3: "Fabricació d'adobs i explosius.",
  H3PO4: "Refrescs de cola.",
  H2CO3: "Es forma quan el CO₂ es dissol a l'aigua amb gas.",
  H3BO3: "Antisèptic suau (aigua bòrica).",
  CaCO3: "Marbre, pedra calcària i closques.",
  Na2CO3: "Sosa de rentar.",
  NaClO: "Lleixiu.",
  "Ca(ClO)2": "Desinfectant de piscines.",
  CaSO4: "Guix.",
  MgSO4: "Sal d'Epsom.",
  CuSO4: "Tractament de les vinyes (brou bordelès).",
  BaSO4: "Contrast per a radiografies de l'aparell digestiu.",
  KNO3: "Salnitre, de la pólvora.",
  NH4NO3: "Adob agrícola.",
  NaNO2: "Conservant dels embotits (E-250).",
  NaNO3: "Nitrat de Xile, un adob.",
  "Ca3(PO4)2": "Ossos i dents.",
  AgNO3: "Tintes de cabell antigues i cauteritzar berrugues.",
  KMnO4: "Desinfectant de color lila.",
  K2Cr2O7: "Antics controls d'alcoholèmia.",
  NaHCO3: "Bicarbonat de cuina i llevat químic.",
  O3: "Capa d'ozó, que ens protegeix dels raigs UV.",
  N2: "El 78 % de l'aire.",
  O2: "El 21 % de l'aire; el respirem.",
  Hg: "Termòmetres antics.",
};

/* ---------- Catàleg ---------- */

const COMMON_SALT_CATIONS = ["Na1", "K1", "Li1", "Mg2", "Ca2", "Ba2", "Al3", "Zn2", "Ag1", "NH4", "Fe2", "Fe3", "Cu1", "Cu2", "Pb2", "Ni2", "Co2", "Hg2"];
const ADVANCED_SALT_CATIONS = ["Na1", "K1", "Mg2", "Ca2", "Ba2", "Ag1", "NH4", "Fe3", "Cu2"];
const ACID_SALT_CATIONS = ["Na1", "K1", "Li1", "Mg2", "Ca2", "Ba2", "NH4", "Fe2", "Cu2"];
const HYDRIDE_METALS = ["Li1", "Na1", "K1", "Mg2", "Ca2", "Ba2", "Al3"];
const PEROXIDE_CATIONS = ["H1", "Li1", "Na1", "K1", "Mg2", "Ca2", "Ba2", "Zn2"];

const catById = (id) => (id === "H1" ? H_CATION : CATIONS.find((c) => c.id === id));
const allows = (cat, family, an) => {
  if (cat.only) return cat.only.includes(family);
  if (cat.rare) return family === "oxid" || family === "hidroxid" || (family === "salBinaria" && an?.formula === "Cl");
  return true;
};

export function buildCatalog() {
  const list = [];
  SIMPLES.forEach(([formula, names]) =>
    list.push(record({ formula, family: "simple", level: 1, names: names.map(([t, k]) => nm(t, k)) }))
  );

  const metals = CATIONS.filter((c) => !c.poly);
  metals.filter((c) => allows(c, "oxid")).forEach((c) => list.push(binaryIonic(c, byFormula(MONO_ANIONS, "O"), "oxid")));
  NONMETAL_OXIDES.forEach(([formula, comp, ox, level = 1]) => {
    const names = [nm(comp, "comp"), nm(ox, "ox")];
    const accept = /^òxid de di/.test(comp) ? [comp.replace(/^òxid/, "monòxid")] : [];
    list.push(record({ formula, family: "oxid", level, names, accept }));
  });

  HYDRIDE_METALS.forEach((id) => list.push(binaryIonic(catById(id), byFormula(MONO_ANIONS, "H"), "hidrur")));
  [["F", "fluorhídric"], ["Cl", "clorhídric"], ["Br", "bromhídric"], ["I", "iodhídric"], ["S", "sulfhídric"], ["Se", "selenhídric"]].forEach(
    ([f, acid]) => list.push(hydracid(byFormula(MONO_ANIONS, f), acid))
  );
  PARENT_HYDRIDES.forEach(([formula, names, level, accept = []]) =>
    list.push(record({ formula, family: "hidrur", level, names: names.map(([t, k]) => nm(t, k)), accept }))
  );

  const binaryAnions = MONO_ANIONS.filter((a) => ["F", "Cl", "Br", "I", "S"].includes(a.formula));
  CATIONS.forEach((c) =>
    binaryAnions.forEach((a) => {
      if (allows(c, "salBinaria", a)) list.push(binaryIonic(c, a, "salBinaria"));
    })
  );
  NONMETAL_BINARIES.forEach(([formula, comp, ox, level = 1]) => {
    const names = [nm(comp, "comp")];
    if (ox) names.push(nm(ox, "ox"));
    list.push(record({ formula, family: "nometalls", level, names }));
  });

  PEROXIDE_CATIONS.forEach((id) => list.push(peroxide(catById(id))));
  metals.filter((c) => allows(c, "hidroxid")).forEach((c) => list.push(binaryIonic(c, OH, "hidroxid")));
  OXOANIONS.forEach((a) => list.push(oxoacid(a)));
  OXOANIONS.forEach((a) => {
    const cats = a.level >= 3 ? ADVANCED_SALT_CATIONS : COMMON_SALT_CATIONS;
    cats.forEach((id) => list.push(oxosalt(catById(id), a, "oxosal")));
  });
  ACID_ANIONS.forEach((a) => ACID_SALT_CATIONS.forEach((id) => list.push(oxosalt(catById(id), a, "salAcida"))));

  // La fórmula és única i serveix d'identificador estable per al progrés desat.
  return list.map((c) => ({ ...c, id: c.formula }));
}

// Ions agrupats per a la taula de referència.
export function ionTable() {
  return {
    cations: [...CATIONS, H_CATION],
    monoAnions: MONO_ANIONS,
    polyAnions: [OH, PEROXIDE, ...OXOANIONS, ...ACID_ANIONS],
  };
}

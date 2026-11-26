// Banc de reaccions del laboratori de reactius i sobrants (vegeu Disseny.md, apartat 5).
// No depèn del DOM: el fan servir l'app i l'script de validació (scripts/valida-reaccions.mjs).
//
// Cada reacció: reactius i productes amb la fórmula (f) o la peça (p, a les analogies) i el coeficient (c).
// Els casos clau (cases) són reptes fixos: q = quantitats inicials de cada reactiu; tags = errors que treballen.

export const LEVELS = [
  { id: 1, name: "Fàcil", course: "Analogies · 2n–3r d'ESO" },
  { id: 2, name: "Mitjà", course: "Molècules · 3r–4t d'ESO" },
  { id: 3, name: "Avançat", course: "Reaccions reals · 4t d'ESO" },
  { id: 4, name: "Batxillerat", course: "Mols i masses · 1r de batxillerat" },
];

export const FAMILIES = [
  { id: "analogia", name: "Analogies" },
  { id: "combustio", name: "Combustions" },
  { id: "atmosfera", name: "Atmosfera i contaminació" },
  { id: "vius", name: "Éssers vius" },
  { id: "industria", name: "Indústria" },
  { id: "acidbase", name: "Àcids i bases" },
  { id: "unreactiu", name: "Un sol reactiu" },
];

// Peces de les analogies: nom en singular i plural, i icona (vegeu icons.js).
export const PIECES = {
  pa: { one: "llesca de pa", many: "llesques de pa", short: "pa" },
  formatge: { one: "llesca de formatge", many: "llesques de formatge", short: "formatge" },
  entrepa: { one: "entrepà", many: "entrepans", short: "entrepà" },
  pernil: { one: "llesca de pernil", many: "llesques de pernil", short: "pernil" },
  mixt: { one: "entrepà mixt", many: "entrepans mixtos", short: "entrepà mixt" },
  tomaquet: { one: "tomàquet", many: "tomàquets", short: "tomàquet" },
  patomaquet: { one: "pa amb tomàquet", many: "pans amb tomàquet", short: "pa amb tomàquet" },
  roda: { one: "roda", many: "rodes", short: "roda" },
  quadre: { one: "quadre", many: "quadres", short: "quadre" },
  bicicleta: { one: "bicicleta", many: "bicicletes", short: "bicicleta" },
  tricicle: { one: "tricicle", many: "tricicles", short: "tricicle" },
  carrosseria: { one: "carrosseria", many: "carrosseries", short: "carrosseria" },
  cotxe: { one: "cotxe de joguina", many: "cotxes de joguina", short: "cotxe" },
  pota: { one: "pota", many: "potes", short: "pota" },
  tauler: { one: "tauler", many: "taulers", short: "tauler" },
  taula: { one: "taula", many: "taules", short: "taula" },
  flor: { one: "flor", many: "flors", short: "flor" },
  cinta: { one: "cinta", many: "cintes", short: "cinta" },
  ram: { one: "ram", many: "rams", short: "ram" },
  perla: { one: "perla", many: "perles", short: "perla" },
  fil: { one: "fil", many: "fils", short: "fil" },
  polsera: { one: "polsera", many: "polseres", short: "polsera" },
};

// Noms de les substàncies (per als rètols i els missatges).
export const NAMES = {
  H2: "hidrogen", O2: "oxigen", N2: "nitrogen", Cl2: "clor", C: "carboni", S: "sofre",
  Fe: "ferro", Mg: "magnesi", Na: "sodi", Al: "alumini",
  H2O: "aigua", NH3: "amoníac", HCl: "clorur d'hidrogen", CO2: "diòxid de carboni", CO: "monòxid de carboni",
  CH4: "metà", SO2: "diòxid de sofre", SO3: "triòxid de sofre", NO: "monòxid de nitrogen", NO2: "diòxid de nitrogen",
  NaOH: "hidròxid de sodi", NaCl: "clorur de sodi", C3H8: "propà", C2H5OH: "etanol", H2S: "sulfur d'hidrogen",
  C6H12O6: "glucosa", Fe2O3: "òxid de ferro(III)", MgO: "òxid de magnesi", Al2O3: "òxid d'alumini",
  CaCO3: "carbonat de calci", CaCl2: "clorur de calci", NaHCO3: "hidrogenocarbonat de sodi", "Mg(OH)2": "hidròxid de magnesi",
  MgCl2: "clorur de magnesi", H2SO4: "àcid sulfúric", Na2SO4: "sulfat de sodi", H2O2: "peròxid d'hidrogen", CaO: "òxid de calci",
};

// Compostos iònics: al model se'n dibuixa una unitat de fórmula, no una molècula.
export const IONIC = new Set(["NaOH", "NaCl", "Fe2O3", "MgO", "Al2O3", "CaCO3", "CaCl2", "NaHCO3", "Mg(OH)2", "MgCl2", "Na2SO4", "CaO"]);

// Masses atòmiques arrodonides (g/mol).
export const ATOMIC_MASS = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.5, Ca: 40, Fe: 56 };

const r = (...list) => list.map(([c, f]) => ({ c, f }));
const p = (...list) => list.map(([c, piece]) => ({ c, p: piece }));
const ANALOGY_LIFE = "Una fàbrica funciona com una reacció: si falta una peça, la producció s'atura encara que sobrin les altres. Aquesta peça és el «reactiu limitant» de la cadena de muntatge.";

export const REACTIONS = [
  /* ---------- Fàcil: analogies ---------- */
  { id: "F1", level: 1, families: ["analogia"], analogy: true, context: "Entrepans", reactants: p([2, "pa"], [1, "formatge"]), products: p([1, "entrepa"]),
    cases: [{ q: [6, 3], tags: ["exacta"] }, { q: [7, 5], tags: ["incomplet"] }, { q: [4, 4], tags: ["E14"] }], life: ANALOGY_LIFE },
  { id: "F2", level: 1, families: ["analogia"], analogy: true, context: "Bicicletes", reactants: p([2, "roda"], [1, "quadre"]), products: p([1, "bicicleta"]),
    cases: [{ q: [9, 3], tags: [] }, { q: [5, 4], tags: ["E1", "incomplet"] }], life: ANALOGY_LIFE },
  { id: "F3", level: 1, families: ["analogia"], analogy: true, context: "Tricicles", reactants: p([3, "roda"], [1, "quadre"]), products: p([1, "tricicle"]),
    cases: [{ q: [7, 3], tags: ["E1", "incomplet"] }], life: ANALOGY_LIFE },
  { id: "F4", level: 1, families: ["analogia"], analogy: true, context: "Cotxes de joguina", reactants: p([4, "roda"], [1, "carrosseria"]), products: p([1, "cotxe"]),
    cases: [{ q: [10, 3], tags: ["E1", "incomplet"] }], life: ANALOGY_LIFE },
  { id: "F5", level: 1, families: ["analogia"], analogy: true, context: "Taules", reactants: p([4, "pota"], [1, "tauler"]), products: p([1, "taula"]),
    cases: [{ q: [8, 1], tags: [] }], life: ANALOGY_LIFE },
  { id: "F6", level: 1, families: ["analogia"], analogy: true, context: "Entrepans mixtos", reactants: p([2, "pa"], [1, "pernil"], [1, "formatge"]), products: p([1, "mixt"]),
    cases: [{ q: [6, 2, 4], tags: [] }], life: ANALOGY_LIFE },
  { id: "F7", level: 1, families: ["analogia"], analogy: true, context: "Pa amb tomàquet", reactants: p([2, "pa"], [1, "tomaquet"]), products: p([2, "patomaquet"]),
    cases: [{ q: [6, 2], tags: [] }], life: ANALOGY_LIFE },
  { id: "F8", level: 1, families: ["analogia"], analogy: true, context: "Rams de flors", reactants: p([3, "flor"], [1, "cinta"]), products: p([1, "ram"]),
    cases: [{ q: [10, 4], tags: ["incomplet"] }], life: ANALOGY_LIFE },
  { id: "F9", level: 1, families: ["analogia"], analogy: true, context: "Polseres", reactants: p([5, "perla"], [1, "fil"]), products: p([1, "polsera"]),
    cases: [{ q: [12, 3], tags: ["E1", "incomplet"] }], life: ANALOGY_LIFE },

  /* ---------- Mitjà: molècules ---------- */
  { id: "M1", level: 2, families: ["combustio"], context: "Formació de l'aigua", reactants: r([2, "H2"], [1, "O2"]), products: r([2, "H2O"]),
    cases: [{ q: [4, 2], tags: ["exacta"] }, { q: [6, 5], tags: ["E1"] }, { q: [4, 4], tags: ["E14"] }],
    life: "L'hidrogen i l'oxigen reaccionen per formar aigua i alliberen molta energia. Els motors principals del transbordador espacial funcionaven amb hidrogen i oxigen líquids, i les piles de combustible ho aprofiten per fer electricitat." },
  { id: "M2", level: 2, families: ["industria"], context: "Amoníac per a adobs", reactants: r([1, "N2"], [3, "H2"]), products: r([2, "NH3"]),
    cases: [{ q: [2, 6], tags: ["exacta"] }, { q: [3, 6], tags: ["E1"] }, { q: [4, 9], tags: ["E1"] }],
    life: "És el procés de Haber-Bosch, que fabrica amoníac a partir del nitrogen de l'aire. L'amoníac és la base dels adobs nitrogenats que fan créixer bona part dels aliments del món." },
  { id: "M3", level: 2, families: ["industria"], context: "Àcid clorhídric", reactants: r([1, "H2"], [1, "Cl2"]), products: r([2, "HCl"]),
    cases: [{ q: [3, 5], tags: [] }],
    life: "Així es fabrica el clorur d'hidrogen. Dissolt en aigua és l'àcid clorhídric; el salfumant n'és una dissolució que es fa servir per netejar." },
  { id: "M4", level: 2, families: ["combustio"], context: "Carbó d'una barbacoa", reactants: r([1, "C"], [1, "O2"]), products: r([1, "CO2"]),
    cases: [{ q: [4, 6], tags: [] }],
    life: "Quan el carbó d'una barbacoa crema amb prou aire, el carboni es converteix en diòxid de carboni." },
  { id: "M5", level: 2, families: ["combustio"], context: "Combustió amb poc oxigen", reactants: r([2, "C"], [1, "O2"]), products: r([2, "CO"]),
    cases: [{ q: [6, 2], tags: [] }],
    life: "Si el carbó crema amb poc oxigen, es forma monòxid de carboni, un gas tòxic sense olor ni color. Per això no s'ha d'encendre mai un braser o una barbacoa en un lloc tancat." },
  { id: "M6", level: 2, families: ["combustio"], context: "Gas natural de la cuina", reactants: r([1, "CH4"], [2, "O2"]), products: r([1, "CO2"], [2, "H2O"]),
    cases: [{ q: [2, 4], tags: ["exacta"] }, { q: [3, 4], tags: ["E1"] }],
    life: "El gas natural de la cuina i de moltes calefaccions és sobretot metà. Amb prou oxigen, crema amb una flama blava i forma diòxid de carboni i aigua." },
  { id: "M7", level: 2, families: ["combustio", "atmosfera"], context: "Combustió del sofre", reactants: r([1, "S"], [1, "O2"]), products: r([1, "SO2"]),
    cases: [{ q: [5, 3], tags: [] }],
    life: "El sofre crema amb una flama blava i forma diòxid de sofre, un gas d'olor picant. El carbó i el petroli contenen sofre, i en cremar-los s'allibera aquest gas." },
  { id: "M8", level: 2, families: ["atmosfera"], context: "Pluja àcida", reactants: r([2, "SO2"], [1, "O2"]), products: r([2, "SO3"]),
    cases: [{ q: [4, 4], tags: ["E14"] }],
    life: "El diòxid de sofre de l'aire es transforma en triòxid de sofre, que amb l'aigua de la pluja forma àcid sulfúric: és una de les causes de la pluja àcida." },
  { id: "M9", level: 2, families: ["atmosfera"], context: "Dins d'un motor", reactants: r([1, "N2"], [1, "O2"]), products: r([2, "NO"]),
    cases: [{ q: [2, 5], tags: [] }],
    life: "A la temperatura tan alta de l'interior d'un motor, el nitrogen i l'oxigen de l'aire reaccionen i formen monòxid de nitrogen." },
  { id: "M10", level: 2, families: ["atmosfera"], context: "Contaminació urbana", reactants: r([2, "NO"], [1, "O2"]), products: r([2, "NO2"]),
    cases: [{ q: [6, 2], tags: [] }],
    life: "El monòxid de nitrogen dels tubs d'escapament es transforma a l'aire en diòxid de nitrogen, un gas marronós que contamina l'aire de les ciutats." },
  { id: "M11", level: 2, families: ["atmosfera"], context: "Catalitzador del cotxe", reactants: r([2, "CO"], [1, "O2"]), products: r([2, "CO2"]),
    cases: [{ q: [4, 3], tags: [] }],
    life: "El catalitzador del tub d'escapament dels cotxes transforma el monòxid de carboni, tòxic, en diòxid de carboni." },
  { id: "M12", level: 2, families: ["acidbase"], context: "Neutralització", reactants: r([1, "HCl"], [1, "NaOH"]), products: r([1, "NaCl"], [1, "H2O"]),
    cases: [{ q: [4, 6], tags: [] }],
    life: "Un àcid i una base es neutralitzen i formen una sal i aigua. Si en sobra un, la dissolució final és àcida o bàsica." },

  /* ---------- Avançat ---------- */
  { id: "A1", level: 3, families: ["combustio"], context: "Bombona de propà", reactants: r([1, "C3H8"], [5, "O2"]), products: r([3, "CO2"], [4, "H2O"]),
    cases: [{ q: [2, 10], tags: ["exacta"] }, { q: [3, 10], tags: [] }, { q: [2, 8], tags: ["incomplet"] }],
    life: "El propà de les bombones de càmping i de moltes barbacoes de gas crema així. Necessita molt d'oxigen: 5 molècules per cada molècula de propà." },
  { id: "A2", level: 3, families: ["combustio"], context: "Alcohol de cremar", reactants: r([1, "C2H5OH"], [3, "O2"]), products: r([2, "CO2"], [3, "H2O"]),
    cases: [{ q: [2, 9], tags: [] }],
    life: "L'etanol és l'alcohol de cremar dels fogonets. També es fa servir com a biocombustible barrejat amb la benzina." },
  { id: "A3", level: 3, families: ["combustio"], context: "Combustió incompleta del gas", reactants: r([2, "CH4"], [3, "O2"]), products: r([2, "CO"], [4, "H2O"]),
    cases: [{ q: [4, 6], tags: ["exacta"] }],
    life: "És la combustió incompleta del gas: si una caldera o un escalfador no té prou ventilació, es forma monòxid de carboni. Per això cal revisar-los i ventilar bé." },
  { id: "A4", level: 3, families: ["industria"], context: "Àcid nítric (procés d'Ostwald)", reactants: r([4, "NH3"], [5, "O2"]), products: r([4, "NO"], [6, "H2O"]),
    cases: [{ q: [4, 10], tags: [] }],
    life: "És el primer pas del procés d'Ostwald, que fabrica àcid nítric a partir d'amoníac. L'àcid nítric s'usa per fer adobs i explosius." },
  { id: "A5", level: 3, families: ["atmosfera"], context: "Gasos volcànics", reactants: r([2, "H2S"], [3, "O2"]), products: r([2, "SO2"], [2, "H2O"]),
    cases: [{ q: [6, 6], tags: ["E14"] }],
    life: "El sulfur d'hidrogen fa olor d'ous podrits i surt dels volcans i de les aigües sulfuroses. En cremar, forma diòxid de sofre." },
  { id: "A6", level: 3, families: ["vius"], context: "Fotosíntesi", reactants: r([6, "CO2"], [6, "H2O"]), products: r([1, "C6H12O6"], [6, "O2"]),
    cases: [{ q: [12, 18], tags: [] }],
    life: "És l'equació global de la fotosíntesi: les plantes fan servir l'energia de la llum per fabricar glucosa i alliberen oxigen." },
  { id: "A7", level: 3, families: ["vius"], context: "Respiració cel·lular", reactants: r([1, "C6H12O6"], [6, "O2"]), products: r([6, "CO2"], [6, "H2O"]),
    cases: [{ q: [2, 6], tags: ["E1"] }],
    life: "És l'equació global de la respiració cel·lular: les cèl·lules obtenen energia de la glucosa i fan servir l'oxigen que respirem." },
  { id: "A8", level: 3, families: ["industria"], context: "Rovell (model simplificat)", reactants: r([4, "Fe"], [3, "O2"]), products: r([2, "Fe2O3"]),
    cases: [{ q: [8, 3], tags: [] }],
    life: "El ferro es rovella en contacte amb l'oxigen. En realitat, el rovell també necessita aigua i té una composició més complexa; aquesta equació n'és un model simplificat." },
  { id: "A9", level: 3, families: ["combustio"], context: "Bengales", reactants: r([2, "Mg"], [1, "O2"]), products: r([2, "MgO"]),
    cases: [{ q: [6, 2], tags: [] }],
    life: "El magnesi crema amb una llum blanca molt intensa. Es fa servir en bengales i focs artificials, i s'usava als antics flaixos de fotografia." },
  { id: "A10", level: 3, families: ["industria"], context: "Sal comuna", reactants: r([2, "Na"], [1, "Cl2"]), products: r([2, "NaCl"]),
    cases: [{ q: [4, 3], tags: [] }],
    life: "El sodi i el clor reaccionen de manera molt violenta i formen clorur de sodi, la sal de cuina." },
  { id: "A11", level: 3, families: ["industria"], context: "Alt forn", reactants: r([1, "Fe2O3"], [3, "CO"]), products: r([2, "Fe"], [3, "CO2"]),
    cases: [{ q: [2, 3], tags: ["E1"] }],
    life: "A l'alt forn, el monòxid de carboni transforma el mineral de ferro (òxid de ferro) en ferro metàl·lic. Així s'obté el ferro per fer acer." },
  { id: "A12", level: 3, families: ["industria"], context: "Soldadura de vies (termita)", reactants: r([2, "Al"], [1, "Fe2O3"]), products: r([1, "Al2O3"], [2, "Fe"]),
    cases: [{ q: [4, 3], tags: [] }],
    life: "És la reacció de la termita: l'alumini treu l'oxigen a l'òxid de ferro i es forma ferro fos. S'utilitza per soldar les vies del tren." },
  { id: "A13", level: 3, families: ["acidbase"], context: "Salfumant sobre marbre", reactants: r([1, "CaCO3"], [2, "HCl"]), products: r([1, "CaCl2"], [1, "H2O"], [1, "CO2"]),
    cases: [{ q: [3, 4], tags: ["E1"] }],
    life: "El salfumant fa bombolles en contacte amb el marbre o la pedra calcària perquè es desprèn diòxid de carboni. Per això no s'ha de fer servir per netejar el marbre." },
  { id: "A14", level: 3, families: ["acidbase", "vius"], context: "Bicarbonat contra l'acidesa", reactants: r([1, "NaHCO3"], [1, "HCl"]), products: r([1, "NaCl"], [1, "H2O"], [1, "CO2"]),
    cases: [{ q: [5, 3], tags: [] }],
    life: "El bicarbonat de sodi neutralitza l'excés d'àcid de l'estómac, que és àcid clorhídric. El diòxid de carboni que es forma surt en forma de rots." },
  { id: "A15", level: 3, families: ["acidbase", "vius"], context: "Antiàcid (llet de magnèsia)", reactants: r([1, "Mg(OH)2"], [2, "HCl"]), products: r([1, "MgCl2"], [2, "H2O"]),
    cases: [{ q: [2, 6], tags: [] }],
    life: "L'hidròxid de magnesi és el component de la «llet de magnèsia» i d'alguns antiàcids. Neutralitza l'àcid de l'estómac." },
  { id: "A16", level: 3, families: ["acidbase"], context: "Neutralització", reactants: r([1, "H2SO4"], [2, "NaOH"]), products: r([1, "Na2SO4"], [2, "H2O"]),
    cases: [{ q: [3, 4], tags: ["E1"] }],
    life: "L'àcid sulfúric i l'hidròxid de sodi es neutralitzen. Per neutralitzar un vessament d'àcid al laboratori, es posa base de mica en mica i es comprova el pH." },
  { id: "A17", level: 3, families: ["unreactiu"], context: "Aigua oxigenada", reactants: r([2, "H2O2"]), products: r([2, "H2O"], [1, "O2"]),
    cases: [{ q: [6], tags: ["E16"] }],
    life: "L'aigua oxigenada es descompon en aigua i oxigen. En una ferida fa bombolles perquè un enzim de la sang, la catalasa, accelera aquesta reacció." },
  { id: "A18", level: 3, families: ["unreactiu", "industria"], context: "Forn de calç", reactants: r([1, "CaCO3"]), products: r([1, "CaO"], [1, "CO2"]),
    cases: [{ q: [4], tags: ["E16"] }],
    life: "En escalfar la pedra calcària en un forn de calç, es descompon en calç viva i diòxid de carboni. És un pas de la fabricació del ciment." },
];

// Batxillerat: problemes amb masses (g). main = producte que es demana calcular.
export const PROBLEMS = [
  { id: "B1", reaction: "M2", grams: [28, 9], main: "NH3", note: "Encara que hi hagi menys grams d'hidrogen, n'hi ha més mols: per això el limitant és el nitrogen." },
  { id: "B2", reaction: "M1", grams: [10, 64], main: "H2O", note: "Encara que hi hagi més grams d'oxigen, hi ha menys mols: per això l'oxigen és el limitant." },
  { id: "B3", reaction: "M6", grams: [32, 96], main: "CO2", note: "Hi ha més mols d'oxigen que de metà, però cada lot en necessita 2: l'oxigen és el limitant." },
  { id: "B4", reaction: "A1", grams: [44, 128], main: "CO2", note: "Cada mol de propà necessita 5 mol d'oxigen: amb 4 mol d'oxigen no n'hi ha prou." },
  { id: "B5", reaction: "A11", grams: [160, 112], main: "Fe", note: "Una tona d'òxid de ferro dona unes 0,7 tones de ferro: és el càlcul que es fa a la siderúrgia." },
  { id: "B6", reaction: "A12", grams: [54, 320], main: "Fe", note: "Hi ha els mateixos mols de cada reactiu, però l'alumini se'n gasta el doble: l'alumini és el limitant." },
  { id: "B7", reaction: "A13", grams: [50, 73], main: "CO2", note: "Sobra àcid: per això el salfumant continua fent bombolles si s'hi afegeix més marbre." },
  { id: "B8", reaction: "A15", grams: [29, 18.25], main: "MgCl2", note: "Mateixos mols de cada reactiu, però l'àcid se'n gasta el doble: l'HCl és el limitant." },
  { id: "B9", reaction: "A8", grams: [112, 64], main: "Fe2O3", note: "Amb oxigen en excés, tot el ferro es pot convertir en òxid." },
  { id: "B10", reaction: "A14", grams: [8.4, 7.3], main: "CO2", note: "El bicarbonat s'esgota primer: queda àcid sense neutralitzar." },
];

// Ampliació de batxillerat: rendiment i puresa (una sola resposta numèrica).
export const EXTRA = [
  { id: "R1", kind: "rendiment", reaction: "M2", text: "Amb 28 g de N₂ i 9 g de H₂ s'haurien d'obtenir 34 g d'NH₃, però realment se n'obtenen 8,5 g. Quin és el rendiment de la reacció?", answer: 25, unit: "%",
    steps: ["Rendiment = massa obtinguda ÷ massa teòrica × 100.", "8,5 ÷ 34 × 100 = 25 %."] },
  { id: "R2", kind: "puresa", reaction: "A18", text: "Es descomponen 200 g de pedra calcària amb un 80 % de CaCO₃ (CaCO₃ → CaO + CO₂). Quina massa de CO₂ s'obté?", answer: 70.4, unit: "g",
    steps: ["Massa de CaCO₃ pur: 200 × 0,80 = 160 g → 160 ÷ 100 = 1,6 mol.", "Per cada mol de CaCO₃ se n'obté un de CO₂: 1,6 × 44 = 70,4 g."] },
];

export const reactionById = (id) => REACTIONS.find((x) => x.id === id);

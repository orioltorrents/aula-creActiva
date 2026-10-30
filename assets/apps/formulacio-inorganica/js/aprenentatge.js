// Fitxes del mode «Aprèn»: un mòdul per a cada bloc de l'índex de continguts.
// Les fórmules s'escriuen entre claudàtors dobles, [[Fe2(SO4)3]], i l'app les converteix en HTML.
// «examples» són fórmules del catàleg: l'app hi afegeix tots els noms acceptats.

export const MODULES = [
  {
    id: "m0",
    num: 0,
    title: "Les peces del joc",
    level: 1,
    families: [],
    intro:
      "Formular és escriure la fórmula d'una substància; anomenar és dir-ne el nom. Gairebé tot es basa en una idea: les parts positives i les negatives s'han de compensar.",
    cards: [
      {
        title: "Els ions: peces amb càrrega",
        html: `<p>Un <b>catió</b> és una peça positiva: els metalls ([[Na^+]], [[Fe^3+]]), l'amoni ([[NH4^+]]) o l'hidrogen ([[H^+]]).</p>
          <p>Un <b>anió</b> és una peça negativa: [[Cl^-]] (clorur), [[O^2-]] (òxid), [[SO4^2-]] (sulfat)…</p>
          <p>Els ions <b>poliatòmics</b> són grups d'àtoms que es comporten com una sola peça.</p>`,
      },
      {
        title: "El nombre d'oxidació",
        html: `<p>És la càrrega que té (o tindria) cada àtom dins del compost.</p>
          <ul>
            <li>Els metalls sempre són <b>positius</b>. Alguns en tenen més d'un: el ferro pot ser +2 o +3. Per això escrivim <b>ferro(II)</b> o <b>ferro(III)</b>, en xifres romanes.</li>
            <li>L'<b>hidrogen</b> és +1 amb els no-metalls ([[HCl]]) i −1 amb els metalls ([[NaH]]).</li>
            <li>L'<b>oxigen</b> és −2 ([[CaO]]), excepte als peròxids, on és −1 ([[H2O2]]).</li>
          </ul>`,
      },
      {
        title: "La regla d'or: càrrega total zero",
        html: `<ol class="steps-mini">
            <li>Escriu els dos ions: [[Al^3+]] i [[O^2-]].</li>
            <li>Busca quants de cada cal perquè la suma doni zero: 2 × (+3) + 3 × (−2) = 0.</li>
            <li>Aquests nombres són els subíndexs: [[Al2O3]].</li>
            <li>Simplifica si pots: [[Ca^2+]] i [[O^2-]] → 1 i 1 → [[CaO]] (no Ca₂O₂).</li>
            <li>Si cal més d'un ió poliatòmic, va entre parèntesis: [[Ca(OH)2]], [[Fe2(SO4)3]].</li>
          </ol>`,
      },
      {
        title: "Les maneres d'anomenar",
        html: `<table class="mini-table">
            <thead><tr><th>Nomenclatura</th><th>Com funciona</th><th>Exemple: [[Fe2O3]]</th></tr></thead>
            <tbody>
              <tr><td><b>Composició</b></td><td>Prefixos que diuen quants àtoms hi ha</td><td>triòxid de diferro</td></tr>
              <tr><td><b>Nombre d'oxidació</b></td><td>La càrrega del metall en xifres romanes, només si en pot tenir més d'una</td><td>òxid de ferro(III)</td></tr>
              <tr><td><b>Tradicional</b></td><td>Només per als oxoàcids i les oxosals</td><td>àcid sulfúric, sulfat de sodi</td></tr>
            </tbody>
          </table>
          <p class="tip">El nom es diu al revés que la fórmula: primer la part negativa i després «de» + la positiva. [[NaCl]] → clorur <b>de</b> sodi.</p>`,
      },
      {
        title: "Els prefixos",
        html: `<div class="prefix-grid">
            <span><b>1</b> mono-</span><span><b>2</b> di-</span><span><b>3</b> tri-</span><span><b>4</b> tetra-</span>
            <span><b>5</b> penta-</span><span><b>6</b> hexa-</span><span><b>7</b> hepta-</span><span><b>8</b> octa-</span>
          </div>
          <p>«Mono-» normalment no s'escriu, excepte en casos com <b>monòxid de carboni</b> ([[CO]]).</p>`,
      },
    ],
    errors: [
      "Confondre majúscules i minúscules: [[Co]] és cobalt, però [[CO]] és monòxid de carboni.",
      "Dir el nom en l'ordre de la fórmula: no és «sodi clorur», sinó «clorur de sodi».",
      "Posar xifres romanes a metalls amb una sola càrrega: és «clorur de sodi», no «clorur de sodi(I)».",
    ],
    examples: [],
  },
  {
    id: "m1",
    num: 1,
    title: "Substàncies simples",
    level: 1,
    families: ["simple"],
    intro: "Una substància simple està formada per un sol element. N'hi ha que són àtoms solts i d'altres que formen molècules.",
    cards: [
      {
        title: "Metalls i gasos nobles",
        html: `<p>S'escriuen amb el símbol de l'element: [[Fe]] (ferro), [[Cu]] (coure), [[He]] (heli), [[Ar]] (argó).</p>`,
      },
      {
        title: "Les set molècules diatòmiques",
        html: `<p>Aquests elements van sempre en parelles quan estan sols: [[H2]], [[N2]], [[O2]], [[F2]], [[Cl2]], [[Br2]] i [[I2]].</p>
          <p>Nom de composició: <b>dioxigen</b>, <b>diclor</b>… També s'accepta el nom comú: oxigen, clor…</p>`,
      },
      {
        title: "Altres molècules",
        html: `<p>[[O3]] és l'<b>ozó</b> (trioxigen), [[P4]] és el fòsfor blanc (tetrafòsfor) i [[S8]] és el sofre (octasofre).</p>`,
      },
    ],
    errors: ["Escriure el gas oxigen com a «O»: la molècula és [[O2]].", "Confondre [[O2]] (l'oxigen que respirem) amb [[O3]] (l'ozó)."],
    examples: ["O2", "O3", "N2", "Cl2", "P4", "S8"],
  },
  {
    id: "m2",
    num: 2,
    title: "Compostos binaris",
    level: 1,
    families: ["oxid", "hidrur", "salBinaria", "nometalls", "peroxid"],
    intro: "Estan formats per dos elements. La part negativa acaba en -ur (clorur, sulfur…) o és l'òxid.",
    cards: [
      {
        title: "Anions monoatòmics",
        html: `<div class="ion-chips">
            <span>[[F^-]] fluorur</span><span>[[Cl^-]] clorur</span><span>[[Br^-]] bromur</span><span>[[I^-]] iodur</span>
            <span>[[S^2-]] sulfur</span><span>[[O^2-]] òxid</span><span>[[H^-]] hidrur</span><span>[[Se^2-]] selenur</span>
          </div>`,
      },
      {
        title: "Òxids",
        html: `<p>Element + [[O^2-]]. Amb un metall, s'acostuma a fer servir el nombre d'oxidació: [[Fe2O3]] <b>òxid de ferro(III)</b>.</p>
          <p>Amb un no-metall, s'acostuma a fer servir la composició: [[CO2]] <b>diòxid de carboni</b>, [[N2O5]] <b>pentaòxid de dinitrogen</b>.</p>`,
      },
      {
        title: "Hidrurs",
        html: `<p><b>Metàl·lics</b>: metall + [[H^-]]. [[NaH]] hidrur de sodi, [[CaH2]] dihidrur de calci.</p>
          <p><b>Amb no-metalls</b>: l'hidrogen va davant. [[HCl]] és el clorur d'hidrogen; dissolt en aigua és l'<b>àcid clorhídric</b>.</p>
          <p>Alguns tenen nom propi: [[H2O]] aigua, [[NH3]] amoníac, [[CH4]] metà.</p>`,
      },
      {
        title: "Sals binàries",
        html: `<p>Metall (o amoni) + no-metall: [[NaCl]] clorur de sodi, [[FeCl3]] clorur de ferro(III) o triclorur de ferro, [[NH4Cl]] clorur d'amoni.</p>`,
      },
      {
        title: "Compostos entre no-metalls",
        html: `<p>S'anomenen amb prefixos: [[PCl5]] pentaclorur de fòsfor, [[CCl4]] tetraclorur de carboni, [[SF6]] hexafluorur de sofre.</p>
          <p class="tip">A la fórmula, l'element que va primer és el que apareix abans en aquesta llista: B, Si, C, P, N, H, S, I, Br, Cl, O, F.</p>`,
      },
      {
        title: "Peròxids (batxillerat)",
        level: 3,
        html: `<p>Contenen el grup [[O2^2-]], que <b>no es pot simplificar</b>: [[H2O2]] peròxid d'hidrogen (aigua oxigenada), [[Na2O2]] peròxid de sodi, [[BaO2]] peròxid de bari.</p>`,
      },
    ],
    errors: [
      "No simplificar: Ca₂O₂ s'ha d'escriure [[CaO]].",
      "Oblidar el nombre d'oxidació quan el metall en té diversos: «òxid de ferro» no diu si és [[FeO]] o [[Fe2O3]].",
      "Simplificar un peròxid: [[Na2O2]] no és «NaO».",
    ],
    examples: ["CaO", "Fe2O3", "CO2", "NaH", "HCl", "NH3", "FeCl3", "PCl5"],
  },
  {
    id: "m3",
    num: 3,
    title: "Hidròxids",
    level: 2,
    families: ["hidroxid"],
    intro: "Un metall combinat amb l'ió hidròxid, [[OH^-]]. Són les bases: la sosa càustica, la calç apagada, els antiàcids…",
    cards: [
      {
        title: "Com es formulen",
        html: `<p>El grup [[OH^-]] té càrrega −1. Cal tants grups com la càrrega del metall: [[Na^+]] → [[NaOH]]; [[Ca^2+]] → [[Ca(OH)2]]; [[Fe^3+]] → [[Fe(OH)3]].</p>
          <p class="tip">Si n'hi ha més d'un, el grup OH va entre parèntesis.</p>`,
      },
      {
        title: "Com s'anomenen",
        html: `<p>Nombre d'oxidació: <b>hidròxid de ferro(III)</b>. Composició: <b>trihidròxid de ferro</b>.</p>`,
      },
    ],
    errors: ["Oblidar els parèntesis: «CaOH2» voldria dir 1 oxigen i 2 hidrògens; la fórmula correcta és [[Ca(OH)2]]."],
    examples: ["NaOH", "Ca(OH)2", "Fe(OH)3", "Al(OH)3", "Cu(OH)2"],
  },
  {
    id: "m4",
    num: 4,
    title: "Oxoàcids",
    level: 2,
    families: ["oxoacid"],
    intro: "Contenen hidrogen, un no-metall (o un metall de transició) i oxigen. Es poden veure com H⁺ + un oxoanió.",
    cards: [
      {
        title: "Els noms tradicionals",
        html: `<p>Quan un element en forma diversos, la terminació indica quant oxigen té:</p>
          <table class="mini-table">
            <thead><tr><th>Menys oxigen</th><th></th><th></th><th>Més oxigen</th></tr></thead>
            <tbody>
              <tr><td>hipo-…-ós</td><td>…-ós</td><td>…-ic</td><td>per-…-ic</td></tr>
              <tr><td>[[HClO]] hipoclorós</td><td>[[HClO2]] clorós</td><td>[[HClO3]] clòric</td><td>[[HClO4]] perclòric</td></tr>
            </tbody>
          </table>`,
      },
      {
        title: "Quants hidrògens?",
        html: `<p>Tants com la càrrega de l'oxoanió: [[SO4^2-]] → [[H2SO4]]; [[NO3^-]] → [[HNO3]]; [[PO4^3-]] → [[H3PO4]]. A la fórmula dels àcids no es posen parèntesis.</p>`,
      },
      {
        title: "Nomenclatura d'hidrogen (batxillerat)",
        level: 3,
        html: `<p>Nombre d'hidrògens + <b>hidrogen</b> + (prefix + <b>oxido</b> + arrel + <b>at</b>):</p>
          <p>[[H2SO4]] → <b>dihidrogen(tetraoxidosulfat)</b>; [[HNO3]] → <b>hidrogen(trioxidonitrat)</b>.</p>`,
      },
    ],
    errors: ["Confondre [[H2SO4]] (sulfúric) amb [[H2SO3]] (sulfurós).", "Posar parèntesis: no és «H2(SO4)», sinó [[H2SO4]]."],
    examples: ["H2SO4", "H2SO3", "HNO3", "HNO2", "H2CO3", "H3PO4", "HClO", "HClO4"],
    acidTable: true,
  },
  {
    id: "m5",
    num: 5,
    title: "Oxosals",
    level: 2,
    families: ["oxosal", "salAcida"],
    intro: "Un metall (o l'amoni) combinat amb un oxoanió. Són molt comunes: el marbre, el guix, el lleixiu, els adobs…",
    cards: [
      {
        title: "De l'àcid a l'anió",
        html: `<p>Treu els hidrògens a l'àcid: la càrrega de l'anió és el nombre d'hidrògens que has tret. I canvia la terminació:</p>
          <div class="rule-pair"><span><b>-ic</b> → <b>-at</b></span><span><b>-ós</b> → <b>-it</b></span></div>
          <p>[[H2SO4]] àcid sulfúric → [[SO4^2-]] <b>sulfat</b>; [[HNO2]] àcid nitrós → [[NO2^-]] <b>nitrit</b>.</p>`,
      },
      {
        title: "Formula l'oxosal",
        html: `<p>Com sempre, la càrrega total ha de ser zero: [[Na^+]] + [[SO4^2-]] → [[Na2SO4]]; [[Fe^3+]] + [[SO4^2-]] → [[Fe2(SO4)3]].</p>
          <p>Nom: anió + «de» + catió (amb nombre d'oxidació si cal): <b>sulfat de ferro(III)</b>.</p>`,
      },
      {
        title: "Sals àcides (batxillerat)",
        level: 3,
        html: `<p>L'anió conserva algun hidrogen: [[HCO3^-]] <b>hidrogencarbonat</b>, [[H2PO4^-]] <b>dihidrogenfosfat</b>.</p>
          <p>[[NaHCO3]] és l'hidrogencarbonat de sodi: el bicarbonat de la cuina.</p>`,
      },
    ],
    errors: ["Confondre sulfat ([[SO4^2-]]) i sulfit ([[SO3^2-]]).", "Oblidar els parèntesis: «Fe2SO43» ha de ser [[Fe2(SO4)3]]."],
    examples: ["Na2SO4", "CaCO3", "KNO3", "NaClO", "Fe2(SO4)3", "(NH4)2SO4", "NaHCO3"],
  },
  {
    id: "m6",
    num: 6,
    title: "Ions poliatòmics",
    level: 2,
    families: ["oxosal", "salBinaria", "salAcida"],
    intro: "Grups d'àtoms amb càrrega que es mouen junts. Convé conèixer-los bé: apareixen a moltes sals.",
    cards: [
      {
        title: "Cations poliatòmics",
        html: `<p>[[NH4^+]] <b>amoni</b>: forma sals com [[NH4Cl]] o [[(NH4)2SO4]], que s'usen com a adobs.</p>
          <p>[[H3O^+]] <b>oxidani</b>: és la forma de l'H⁺ en aigua i explica l'acidesa.</p>`,
      },
      {
        title: "Taula d'anions",
        html: `<p>Tens la taula completa d'ions al botó <b>Taula d'ions</b> de la barra superior. Recorda també:</p>
          <div class="ion-chips">
            <span>[[OH^-]] hidròxid</span><span>[[CO3^2-]] carbonat</span><span>[[SO4^2-]] sulfat</span><span>[[NO3^-]] nitrat</span>
            <span>[[PO4^3-]] fosfat</span><span>[[ClO^-]] hipoclorit</span><span>[[MnO4^-]] permanganat</span><span>[[Cr2O7^2-]] dicromat</span>
          </div>`,
      },
    ],
    errors: ["Escriure l'amoni com «NH3»: [[NH3]] és l'amoníac, una molècula neutra; l'ió amoni és [[NH4^+]]."],
    examples: ["NH4Cl", "(NH4)2SO4", "NH4NO3", "KMnO4", "K2Cr2O7"],
  },
  {
    id: "m7",
    num: 7,
    title: "La química de cada dia",
    level: 1,
    families: [],
    intro: "Moltes substàncies que fem servir cada dia tenen una fórmula i un nom químic. Les reconeixes?",
    cards: [],
    errors: [],
    examples: [],
    gallery: true,
  },
];

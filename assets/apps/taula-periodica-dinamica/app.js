/* Taula periòdica dinàmica
   Dades: data/elements.js (PeriodicTableJSON), data/propietats.js (dades revisades),
   data/noms_ca.js i data/summaries_ca.js. */
(() => {
  'use strict';

  const D = window.PT_DADES || {};
  const NAMES = window.PT_NOMS_CA || {};
  const SUMMARIES = window.SUMMARIES_CA || {};
  const ORI = window.PT_ORIGENS || {};
  const X = window.PT_EXTRA || {};
  const ELS = ((window.PT_ELEMENTS && window.PT_ELEMENTS.elements) || []).filter(e => e.number <= 118);
  const root = document.documentElement;

  /* ---------- emmagatzematge (tolerant a navegadors que el bloquegen) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('tpd:' + k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('tpd:' + k, v); } catch (e) { /* sense emmagatzematge */ } }
  };

  const state = {
    mode: store.get('mode', 'families'),
    temp: store.get('temp', 'C'),
    yearLimit: 2010,
    focus: null,       // categoria destacada a la llegenda
    hover: null,       // element de la vista prèvia
    compare: null,     // array de símbols quan el mode comparació és actiu
    quiz: null,        // estat del repte
    playing: null,     // animació (línia del temps o temperatura)
    tempPos: 655,      // posició del control de temperatura (655 ≈ 25 °C)
    tempFix: 298       // temperatura exacta d'un botó de referència (K)
  };

  /* ================= format de nombres (convencions catalanes) ================= */
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  const minus = s => String(s).replace(/^-/, '−');
  const comma = s => String(s).replace('.', ',');
  function fmtFixed(v, d) { return minus(comma(v.toFixed(d))); }
  function fmtSig(v, sig = 3) {
    if (v === 0) return '0';
    const e = Math.floor(Math.log10(Math.abs(v)));
    if (e >= 5 || e <= -4) {
      const m = v / Math.pow(10, e);
      return minus(comma(String(Number(m.toPrecision(sig))))) + '·10' + String(e).split('').map(c => SUP[c]).join('');
    }
    return minus(comma(String(Number(v.toPrecision(sig)))));
  }
  const fmtPct = v => fmtSig(v, 3) + ' %';
  function fmtTemp(k, unit = state.temp) {
    return unit === 'K' ? Math.round(k) + ' K' : minus(Math.round(k - 273.15)) + ' °C';
  }
  function fmtYear(y) {
    if (y < 0) return 'c. ' + (-y) + ' aC';
    if (y < 1600) return 'c. ' + y;
    return String(y);
  }
  const fmtOx = arr => arr.slice().sort((a, b) => a - b).map(n => n > 0 ? '+' + n : n === 0 ? '0' : minus(n)).join(', ');
  /* durades: tria la unitat més entenedora (anys, dies, hores, minuts, segons, mil·lisegons) */
  const YEAR_S = 31557600; // any julià, en segons
  const DUR_UNITS = [[YEAR_S, 'a', 'anys'], [86400, 'd', 'dies'], [3600, 'h', 'hores'], [60, 'min', 'minuts'], [1, 's', 'segons'], [1e-3, 'ms', 'mil·lisegons']];
  function numCa(x) {
    const r = Number(x.toPrecision(3));
    if (r >= 1e3 && Number.isInteger(r)) return String(r).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return comma(String(r));
  }
  function fmtDur(sec, long = false) {
    const [f, short, word] = DUR_UNITS.find(([u]) => sec >= u) || DUR_UNITS[DUR_UNITS.length - 1];
    const v = sec / f;
    if (short === 'a' && v >= 1e5) {
      if (long && v < 1e12) return numCa(v / 1e6) + ' milions d\'anys';
      return fmtSig(v, 2) + (long ? ' anys' : ' a');
    }
    return numCa(v) + ' ' + (long ? word : short);
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ================= consultes de dades ================= */
  const nameOf = el => NAMES[el.symbol] || el.name;
  const isPredicted = el => el.number >= 104;           // propietats predites, no mesurades
  const noBulk = el => el.number >= 100;                // no se n'ha obtingut mai una mostra visible
  const inList = (list, s) => Array.isArray(list) && list.includes(s);
  const groupOf = el => (el.ypos <= 7 ? el.xpos : null);

  function family(el) {
    const s = el.symbol, z = el.number;
    for (const [k, list] of Object.entries(D.families || {})) if (list.includes(s)) return k;
    if (z >= 57 && z <= 71) return 'lantanid';
    if (z >= 89 && z <= 103) return 'actinid';
    return 'transicio';
  }
  const isMetalFamily = f => ['alcali', 'alcalinoterri', 'transicio', 'lantanid', 'actinid', 'altresMetalls'].includes(f);

  const val = {
    en: el => (isPredicted(el) ? null : (typeof el.electronegativity_pauling === 'number' ? el.electronegativity_pauling : null)),
    ion: el => (isPredicted(el) ? null : (Array.isArray(el.ionization_energies) && typeof el.ionization_energies[0] === 'number' ? el.ionization_energies[0] : null)),
    radius: el => (typeof (D.radi || {})[el.symbol] === 'number' ? D.radi[el.symbol] : null),
    isGas: el => el.phase === 'Gas',
    densityRaw: el => (noBulk(el) || typeof el.density !== 'number' ? null : el.density),
    density: el => { const d = val.densityRaw(el); return d === null ? null : (val.isGas(el) ? d / 1000 : d); },
    melt: el => (noBulk(el) || typeof el.melt !== 'number' ? null : el.melt),
    boil: el => (noBulk(el) || typeof el.boil !== 'number' ? null : el.boil),
    sigma: el => { const r = (D.resistivitat || {})[el.symbol]; if (typeof r === 'number') return 1e9 / r; const s = (D.semiconductors || {})[el.symbol]; return typeof s === 'number' ? s : null; },
    thermal: el => (typeof (D.termica || {})[el.symbol] === 'number' ? D.termica[el.symbol] : null),
    abund: (key, el) => (typeof ((D[key] || {})[el.symbol]) === 'number' ? D[key][el.symbol] : null),
    ox: el => (D.oxidacio || {})[el.symbol] || null,
    year: el => ((D.descobriment || {})[el.symbol] || [null])[0],
    discoverer: el => ((D.descobriment || {})[el.symbol] || [null, null])[1],
    /* període de semidesintegració en segons (null si té isòtops estables o és el bismut) */
    halfData: el => (D.semivida || {})[el.symbol] || null,
    halfSec: el => { const h = val.halfData(el); return h ? h[0] * HALF_UNIT[h[1]] : null; },
    halfLife: el => (el.symbol === 'Bi' ? null : val.halfSec(el)),
    /* electrons per capa (K, L, M...), calculats a partir de la configuració electrònica */
    shells: el => { const s = []; for (const m of String(el.electron_configuration || '').matchAll(/(\d)([spdf])(\d+)/g)) s[m[1] - 1] = (s[m[1] - 1] || 0) + Number(m[3]); return Array.from(s, x => x || 0); },
    massNumber: el => { const a = (D.isotopPrincipal || {})[el.symbol]; if (a) return a; const h = (D.semivida || {})[el.symbol]; return h ? h[2] : null; },
    /* electrons de valència: només en els grups principals (en els de transició són variables) */
    valenceE: el => { const g = groupOf(el); if (el.symbol === 'He') return 2; if (g === 1 || g === 2) return g; if (g >= 13 && g <= 18) return g - 10; return null; },
    nameOrigin: el => (ORI.nom || {})[el.symbol] || null,
    cosmic: el => (ORI.cosmic || {})[el.symbol] || (el.number >= 93 ? ['laboratori', []] : null),
    critical: el => (D.critiques || {})[el.symbol] || null,
    flame: el => (D.flama || {})[el.symbol] || null,
    /* afinitat electrònica: només dades fiables (fins al radó, sense els lantànids 58-70) */
    eaRaw: el => ((el.number <= 86 && !(el.number >= 58 && el.number <= 70) && typeof el.electron_affinity === 'number') ? el.electron_affinity : null),
    ea: el => { const v = val.eaRaw(el); return v !== null && v > 0 ? v : null; },
    isotopes: el => (X.isotops || {})[el.symbol] || [],
    nIsotopes: el => val.isotopes(el).length,
    crystal: el => (X.cristall || {})[el.symbol] || null,
    country: el => (X.pais || {})[el.symbol] || null,
    phone: el => (X.mobil || {})[el.symbol] || null,
    price: el => (el.symbol in (X.preu || {}) ? X.preu[el.symbol] : null)
  };
  /* estat a una temperatura donada (en K) i 1 atm */
  const T_LOGMAX = Math.log10(6000);
  const posToK = p => Math.pow(10, p / 1000 * T_LOGMAX);
  const kToPos = k => Math.round(Math.log10(k) / T_LOGMAX * 1000);
  const tempK = () => state.tempFix || posToK(state.tempPos);
  function phaseAt(el, K) {
    if (noBulk(el)) return 'nodata';
    const sub = (X.sublima || {})[el.symbol];
    if (sub) return K < sub ? 'Solid' : 'Gas';
    const m = val.melt(el), b = val.boil(el);
    if (m === null || b === null) return 'nodata';
    if (inList(X.noSolid, el.symbol)) return K < b ? 'Liquid' : 'Gas';
    return K < m ? 'Solid' : K < b ? 'Liquid' : 'Gas';
  }
  function fmtTempC(K) {
    const c = K - 273.15;
    return (Math.abs(c) >= 1000 ? minus(numCa(Math.round(c))) : minus(Math.round(c))) + ' °C';
  }
  const fmtK = K => (K >= 1000 ? numCa(Math.round(K)) : K < 10 ? comma(K.toFixed(1)) : Math.round(K)) + ' K';
  const tempPreset = () => (X.temps || []).find(t => t[0] === state.tempFix) || null;
  const HALF_UNIT = { ms: 1e-3, s: 1, min: 60, h: 3600, d: 86400, a: YEAR_S };
  const DECAY_MODE = { 'α': 'desintegració alfa', 'β⁻': 'desintegració beta', CE: 'captura electrònica', FE: 'fissió espontània' };
  const supNum = n => String(n).split('').map(c => SUP[c]).join('');
  const isotopeOf = el => { const h = val.halfData(el); return h ? supNum(h[2]) + el.symbol : ''; };
  // «el radi-226», «l'urani-238»
  const isoName = (el, A) => { const n = nameOf(el).toLowerCase(), h = val.halfData(el); return (/^[aeiouàèéíòóúh]/.test(n) ? 'l’' : 'el ') + n + '-' + (A || (h ? h[2] : '')); };
  function halfCat(el) {
    if (el.symbol === 'Bi') return 'quasi';
    return val.halfData(el) ? null : 'estable';
  }
  const NODATA_CAT = label => ({ k: 'nodata', label, color: null });
  const COSMIC_CATS = [
    { k: 'bigbang', label: 'Big Bang', color: '#c4b5fd' },
    { k: 'raigs', label: 'Raigs còsmics', color: '#f0abfc' },
    { k: 'petites', label: 'Estrelles petites', color: '#fcd34d' },
    { k: 'massives', label: 'Estrelles massives', color: '#7dd3fc' },
    { k: 'nanes', label: 'Nanes blanques', color: '#fda4af' },
    { k: 'neutrons', label: 'Estrelles de neutrons', color: '#86efac' },
    { k: 'desintegracio', label: 'Desintegració (U, Th)', color: '#d6b48c' },
    { k: 'laboratori', label: 'Laboratori', color: '#a8a29e' }
  ];
  const COSMIC_LABEL = Object.fromEntries(COSMIC_CATS.map(c => [c.k, c.label]));
  const NAME_CATS = [
    { k: 'mite', label: 'Mitologia i folklore', color: '#f0abfc' },
    { k: 'astre', label: 'Astres', color: '#a5b4fc' },
    { k: 'lloc', label: 'Llocs', color: '#86efac' },
    { k: 'persona', label: 'Persones', color: '#fcd34d' },
    { k: 'propietat', label: 'Propietats (color, olor...)', color: '#7dd3fc' },
    { k: 'material', label: 'Minerals i materials', color: '#e7c9a9' },
    { k: 'antic', label: 'Noms antics o incerts', color: '#fca5a5' }
  ];
  const VALENCE_CATS = [
    { k: 'v1', label: '1 electró', color: '#fca5a5' },
    { k: 'v2', label: '2 electrons', color: '#fdba74' },
    { k: 'v3', label: '3 electrons', color: '#fde68a' },
    { k: 'v4', label: '4 electrons', color: '#bef264' },
    { k: 'v5', label: '5 electrons', color: '#86efac' },
    { k: 'v6', label: '6 electrons', color: '#5eead4' },
    { k: 'v7', label: '7 electrons', color: '#93c5fd' },
    { k: 'v8', label: '8 electrons', color: '#c4b5fd' },
    { k: 'variable', label: 'Variables', color: null }
  ];
  const CRIT_CATS = [
    { k: 'estrategica', label: 'Estratègiques (i crítiques)', color: '#f87171' },
    { k: 'critica', label: 'Crítiques', color: '#fdba74' },
    { k: 'conflicte', label: 'Minerals de conflicte (no crítics)', color: '#c4b5fd' },
    { k: 'no', label: 'No incloses a la llista', color: null }
  ];
  const ISO_CATS = [
    { k: 'i1', label: '1 isòtop estable', color: '#fef08a' },
    { k: 'i2', label: '2 isòtops', color: '#bef264' },
    { k: 'i34', label: '3 o 4 isòtops', color: '#5eead4' },
    { k: 'i56', label: '5 o 6 isòtops', color: '#7dd3fc' },
    { k: 'i710', label: 'De 7 a 10 isòtops', color: '#c4b5fd' },
    { k: 'cap', label: 'Cap: només radioactius', color: null }
  ];
  function isoCat(el) {
    const n = val.nIsotopes(el);
    return n === 0 ? 'cap' : n === 1 ? 'i1' : n === 2 ? 'i2' : n <= 4 ? 'i34' : n <= 6 ? 'i56' : 'i710';
  }
  function isoText(el) {
    const l = val.isotopes(el);
    if (!l.length) return 'Cap: tots els seus isòtops són radioactius';
    return l.map(([a, ab]) => `${supNum(a)}${el.symbol} ${numCa(ab)} %`).join(' · ');
  }
  const CRYSTAL_CATS = [
    { k: 'cc', label: 'Cúbica centrada en el cos', color: '#93c5fd' },
    { k: 'ccc', label: 'Cúbica centrada en les cares', color: '#86efac' },
    { k: 'hc', label: 'Hexagonal compacta', color: '#fcd34d' },
    { k: 'diamant', label: 'Cúbica del diamant', color: '#f0abfc' },
    { k: 'altres', label: 'Altres estructures', color: '#e7c9a9' },
    NODATA_CAT('Desconeguda')
  ];
  const CRYSTAL_INFO = {
    cc: { n: 8, pct: 68, t: 'Un àtom a cada vèrtex del cub i un altre al centre.' },
    ccc: { n: 12, pct: 74, t: 'Un àtom a cada vèrtex del cub i un altre al centre de cada cara. És l\'apilament més compacte possible, com les taronges d\'una parada del mercat.' },
    hc: { n: 12, pct: 74, t: 'Capes d\'àtoms en forma d\'hexàgon apilades alternadament. És tan compacta com la ccc.' },
    diamant: { n: 4, pct: 34, t: 'Els àtoms s\'uneixen formant tetràedres, com en el diamant. És una estructura molt oberta, però molt dura.' }
  };
  function crystalText(el) {
    const c = val.crystal(el);
    if (!c) return 'Desconeguda';
    if (c[0] === 'altres') return c[1].charAt(0).toUpperCase() + c[1].slice(1);
    const lab = CRYSTAL_CATS.find(x => x.k === c[0]).label;
    return c[1] === 'doble' ? 'Hexagonal compacta doble (variant de la hc)' : lab + (c[0] === 'diamant' ? '' : ' (' + c[0] + ')');
  }
  const PHONE_CATS = [
    { k: 'pantalla', label: 'Pantalla i càmera', color: '#7dd3fc' },
    { k: 'bateria', label: 'Bateria', color: '#86efac' },
    { k: 'circuits', label: 'Xips i circuits', color: '#fcd34d' },
    { k: 'imants', label: 'Imants (altaveu i vibració)', color: '#f0abfc' },
    { k: 'carcassa', label: 'Carcassa i protecció', color: '#fdba74' },
    { k: 'no', label: 'No hi és (o només en traces)', color: null }
  ];
  const COUNTRY_CATS = [
    { k: 'antic', label: 'Coneguts des d\'antic', color: '#d6a35c' },
    { k: 'ru', label: 'Regne Unit', color: '#93c5fd' },
    { k: 'suecia', label: 'Suècia', color: '#fde047' },
    { k: 'franca', label: 'França', color: '#a5b4fc' },
    { k: 'alemanya', label: 'Alemanya', color: '#fca5a5' },
    { k: 'espanya', label: 'Espanya', color: '#fdba74' },
    { k: 'eua', label: 'Estats Units', color: '#86efac' },
    { k: 'russia', label: 'Rússia (i URSS)', color: '#f0abfc' },
    { k: 'altres', label: 'Altres països', color: '#5eead4' }
  ];
  const MAIN_COUNTRIES = COUNTRY_CATS.map(c => c.k);
  const countryName = k => ((X.paisNom || {})[k] || k);
  const countryCat = el => { const c = val.country(el); return !c ? 'nodata' : MAIN_COUNTRIES.includes(c[0]) ? c[0] : 'altres'; };
  // «a Suècia», «al Regne Unit», «als Estats Units»
  const countryIn = k => ({ ru: 'al Regne Unit', eua: 'als Estats Units', japo: 'al Japó' }[k] || 'a ' + countryName(k));
  function countryText(el) {
    const c = val.country(el);
    if (!c) return '—';
    if (c[0] === 'antic') return 'Conegut des de l\'antiguitat o l\'edat mitjana';
    const others = c[1] || [];
    const nota = (X.paisNota || {})[el.symbol];
    return countryName(c[0]) + (others.length ? ' (compartit amb ' + others.map(countryName).join(' i ') + ')' : '') + '.' + (nota ? ' ' + nota : '');
  }
  const PRICE_CATS = [
    { k: 'p0', label: 'Menys d\'1 €/kg', color: '#2563eb' },
    { k: 'p1', label: '1–10 €/kg', color: '#0ea5e9' },
    { k: 'p2', label: '10–100 €/kg', color: '#22c55e' },
    { k: 'p3', label: '100–1.000 €/kg', color: '#eab308' },
    { k: 'p4', label: '1.000–10.000 €/kg', color: '#f97316' },
    { k: 'p5', label: 'Més de 10.000 €/kg', color: '#dc2626' },
    { k: 'p6', label: 'Radioactius: més de 100 €/g', color: '#7c3aed' },
    NODATA_CAT('No es comercialitza')
  ];
  const FLAME_CATS = [
    { k: 'vermell', label: 'Vermell', color: '#e0001b' },
    { k: 'taronja', label: 'Taronja', color: '#ff7a1a' },
    { k: 'groc', label: 'Groc', color: '#ffc107' },
    { k: 'verd', label: 'Verd', color: '#22c55e' },
    { k: 'blau', label: 'Blau', color: '#4f8df5' },
    { k: 'violeta', label: 'Violeta', color: '#a78bfa' },
    { k: 'cap', label: 'Sense color característic', color: null }
  ];
  function flameText(el) {
    const f = val.flame(el), fw = (D.focs || {})[el.symbol];
    if (!f) return 'Sense color característic';
    return f[1].charAt(0).toUpperCase() + f[1].slice(1) + (fw ? ' · s\'usa als focs artificials (' + fw + ')' : '');
  }
  function lewisHTML(n, he) {
    const sides = [0, 0, 0, 0]; // dalt, dreta, baix, esquerra
    if (he) sides[0] = 2;
    else for (let i = 0; i < n; i++) sides[i % 4]++;
    return ['t', 'r', 'b', 'l'].map((s, i) => (sides[i] ? `<i class="ld ${s}">${'<b></b>'.repeat(sides[i])}</i>` : '')).join('');
  }
  function cosmicText(el) {
    const c = val.cosmic(el);
    if (!c) return '—';
    const t = (ORI.cosmicText || {})[c[0]] || '';
    return COSMIC_LABEL[c[0]] + (t ? '. ' + t : '') + (c[1].length ? ' També: ' + c[1].map(k => COSMIC_LABEL[k].toLowerCase()).join(', ') + '.' : '');
  }
  function criticalText(el) {
    const c = val.critical(el), conf = inList(D.conflicte, el.symbol);
    let t = c ? (c[0] === 'estrategica' ? 'Estratègica' : 'Crítica') + (c[1] ? ' · principal productor: ' + c[1] : '') : 'No';
    if (conf) t = (c ? t + ' · ' : 'No crítica · ') + 'mineral de conflicte';
    return t;
  }
  function halfText(el) {
    const cat = halfCat(el), h = val.halfData(el);
    if (cat === 'estable') return 'Estable (té isòtops que no es desintegren)';
    const base = `${fmtDur(val.halfSec(el), true)} (${isotopeOf(el)}, ${DECAY_MODE[h[3]] || h[3]})`;
    return cat === 'quasi' ? base + ' · pràcticament estable' : base;
  }
  const fmtDensity = el => { const d = val.densityRaw(el); return d === null ? '—' : fmtSig(d, 3) + (val.isGas(el) ? ' g/L' : ' g/cm³'); };

  /* ================= definició dels modes ================= */
  const NODATA = { k: 'nodata', label: 'Sense dades', color: null };
  const FAMILY_CATS = [
    { k: 'alcali', label: 'Metalls alcalins', color: '#fca5a5' },
    { k: 'alcalinoterri', label: 'Metalls alcalinoterris', color: '#fdba74' },
    { k: 'transicio', label: 'Metalls de transició', color: '#fde68a' },
    { k: 'altresMetalls', label: 'Altres metalls (bloc p)', color: '#93c5fd' },
    { k: 'semimetall', label: 'Semimetalls', color: '#6ee7b7' },
    { k: 'noMetall', label: 'No-metalls', color: '#d9f99d' },
    { k: 'halogen', label: 'Halògens', color: '#c4b5fd' },
    { k: 'gasNoble', label: 'Gasos nobles', color: '#f9a8d4' },
    { k: 'lantanid', label: 'Lantànids', color: '#a5f3fc' },
    { k: 'actinid', label: 'Actínids', color: '#e7c9a9' }
  ];
  const FAMILY_LABEL = Object.fromEntries(FAMILY_CATS.map(c => [c.k, c.label]));
  const PREDICTED_NOTE = 'Elements 104–118 (vora discontínua): només se n\'han obtingut uns quants àtoms; la classificació i les propietats són predites.';

  function reactivity(el) {
    const f = family(el), s = el.symbol;
    if (el.number >= 99) return 'nodata';
    if (f === 'gasNoble') return 'inert';
    if (f === 'alcali' || s === 'F' || s === 'Cl') return 'molt';
    if (['Ca', 'Sr', 'Ba', 'Ra', 'Br', 'I', 'O', 'P'].includes(s)) return 'bastant';
    if (['Cu', 'Ag', 'Au', 'Pt', 'Pd', 'Rh', 'Ir', 'Os', 'Ru', 'Hg', 'N'].includes(s)) return 'poc';
    return 'moderat';
  }
  function condClass(el) {
    if (inList(D.aillants, el.symbol)) return 'aillant';
    if (el.symbol in (D.semiconductors || {})) return 'semi';
    const s = val.sigma(el);
    if (s === null) return 'nodata';
    if (s >= 1e7) return 'molt';
    if (s >= 1e6) return 'bo';
    return 'moderat';
  }
  function yearCat(y) {
    if (y === null) return 'nodata';
    if (y < 500) return 'antic';
    if (y < 1650) return 'mitja';
    if (y < 1800) return 'c18';
    if (y < 1850) return 'c19a';
    if (y < 1900) return 'c19b';
    if (y < 1950) return 'c20a';
    return 'c20b';
  }

  const MODES = {
    blank: {
      label: 'En blanc', kind: 'none',
      desc: 'Taula sense colors per localitzar els elements pel nombre atòmic i el símbol. Clica qualsevol element per veure\'n la fitxa.'
    },

    /* --- classificació --- */
    families: {
      label: 'Famílies', group: 'Classificació', kind: 'cat', cats: FAMILY_CATS, catOf: family,
      desc: 'Els elements d\'una mateixa família tenen propietats químiques semblants perquè tenen el mateix nombre d\'electrons de valència.',
      note: 'L\'hidrogen és un no-metall, tot i encapçalar el grup 1. ' + PREDICTED_NOTE
    },
    metallic: {
      label: 'Metalls, semimetalls i no-metalls', group: 'Classificació', kind: 'cat',
      cats: [
        { k: 'metall', label: 'Metalls', color: '#7dd3fc' },
        { k: 'semimetall', label: 'Semimetalls', color: '#6ee7b7' },
        { k: 'nometall', label: 'No-metalls', color: '#fcd34d' }
      ],
      catOf: el => { const f = family(el); return isMetalFamily(f) ? 'metall' : f === 'semimetall' ? 'semimetall' : 'nometall'; },
      desc: 'Una línia en escala separa els metalls (a l\'esquerra) dels no-metalls (a la dreta). Els semimetalls tenen propietats intermèdies.',
      trend: { h: ['←', 'Caràcter metàl·lic: augmenta cap a l\'esquerra'], v: ['↓', 'i cap avall del grup'] },
      note: 'Po i At tenen una classificació debatuda. ' + PREDICTED_NOTE
    },
    blocks: {
      label: 'Blocs electrònics (s, p, d, f)', group: 'Classificació', kind: 'cat',
      cats: [
        { k: 's', label: 'Bloc s', color: '#7dd3fc' },
        { k: 'p', label: 'Bloc p', color: '#f9a8d4' },
        { k: 'd', label: 'Bloc d', color: '#86efac' },
        { k: 'f', label: 'Bloc f', color: '#fcd34d' }
      ],
      catOf: el => (el.block || 'nodata').toLowerCase(),
      desc: 'El bloc indica el tipus d\'orbital (s, p, d o f) on entra l\'últim electró segons la configuració electrònica.',
      note: 'L\'heli és del bloc s, però se situa al grup 18. La posició de La, Ac, Lu i Lr és objecte de debat a la IUPAC.'
    },
    state: {
      label: 'Estat físic a 25 °C', group: 'Classificació', kind: 'cat',
      cats: [
        { k: 'Solid', label: 'Sòlid', color: '#86efac' },
        { k: 'Liquid', label: 'Líquid', color: '#60a5fa' },
        { k: 'Gas', label: 'Gas', color: '#fde047' },
        { k: 'nodata', label: 'Desconegut', color: null }
      ],
      catOf: el => (noBulk(el) ? 'nodata' : el.phase || 'nodata'),
      desc: 'Estat de cada element a 25 °C i 1 atm. Només el brom i el mercuri són líquids; el gal·li i el cesi es fonen a poc més de 28 °C.',
      note: 'Dels elements 100–118 no se n\'ha obtingut mai una mostra visible: l\'estat és desconegut.'
    },
    stateTemp: {
      label: 'Estat segons la temperatura', group: 'Classificació', kind: 'cat',
      cats: [
        { k: 'Solid', label: 'Sòlid', color: '#86efac' },
        { k: 'Liquid', label: 'Líquid', color: '#60a5fa' },
        { k: 'Gas', label: 'Gas', color: '#fde047' },
        { k: 'nodata', label: 'Desconegut', color: null }
      ],
      catOf: el => phaseAt(el, tempK()),
      desc: 'Mou el control o prem ▶ per escalfar la taula des del zero absolut fins a la temperatura del Sol. Cada element es fon quan arriba al punt de fusió i bull quan arriba al d\'ebullició.',
      note: 'Pressió d\'1 atm. L\'heli no se solidifica mai a aquesta pressió; el carboni i l\'arsènic passen directament de sòlid a gas (sublimen). Valors de l\'àstat i el franci estimats. Escala logarítmica, per veure bé les temperatures baixes.',
      source: 'Font: CRC Handbook of Chemistry and Physics.'
    },

    /* --- estructura i enllaç --- */
    valenceE: {
      label: 'Electrons de valència (Lewis)', group: 'Estructura i enllaç', kind: 'cat', lewis: true, previewNoMeta: true, cats: VALENCE_CATS,
      catOf: el => { const v = val.valenceE(el); return v === null ? 'variable' : 'v' + v; },
      metaOf: el => { const v = val.valenceE(el); return v === null ? '' : v + ' e⁻'; },
      desc: 'Electrons de la capa més externa, els que participen en els enllaços. Els punts al voltant del símbol en formen l\'estructura de Lewis. En els grups 13-18 coincideixen amb l\'última xifra del grup.',
      trend: { h: ['→', 'D\'1 a 8 al llarg de cada període'], v: ['↓', 'Els mateixos en tot el grup'] },
      note: 'Regla de l\'octet: els àtoms tendeixen a guanyar, perdre o compartir electrons fins a tenir-ne 8 a la capa externa. Variables: metalls de transició.'
    },
    valence: {
      label: 'Estats d\'oxidació (valències)', group: 'Estructura i enllaç', kind: 'cat',
      cats: [
        { k: 'pos', label: 'Només positius', color: '#fca5a5' },
        { k: 'neg', label: 'Només negatius', color: '#93c5fd' },
        { k: 'both', label: 'Positius i negatius', color: '#d8b4fe' },
        { k: 'zero', label: 'Només 0', color: '#d1d5db' },
        NODATA
      ],
      catOf: el => { const a = val.ox(el); if (!a) return 'nodata'; const p = a.some(n => n > 0), n = a.some(n => n < 0); return p && n ? 'both' : p ? 'pos' : n ? 'neg' : 'zero'; },
      metaOf: el => { const a = val.ox(el); return a ? fmtOx(a) : ''; },
      desc: 'Nombres d\'oxidació habituals que es fan servir en formulació inorgànica. Els metalls només en tenen de positius.',
      note: 'Selecció escolar: molts elements tenen altres estats d\'oxidació menys freqüents.'
    },
    electronegativity: {
      label: 'Electronegativitat', group: 'Estructura i enllaç', kind: 'num', value: val.en,
      fmt: v => fmtFixed(v, 2), legendFmt: v => fmtFixed(v, 1),
      desc: 'Tendència d\'un àtom a atreure els electrons d\'un enllaç. El fluor és l\'element més electronegatiu (3,98).',
      trend: { h: ['→', 'Augmenta al llarg del període'], v: ['↑', 'i cap amunt del grup'] },
      note: 'He, Ne i Ar no tenen valor a l\'escala de Pauling perquè no formen compostos estables.',
      source: 'Escala de Pauling. Font: PeriodicTableJSON.'
    },
    ionization: {
      label: 'Energia d\'ionització', group: 'Estructura i enllaç', kind: 'num', value: val.ion,
      fmt: v => Math.round(v) + ' kJ/mol', legendFmt: v => Math.round(v) + ' kJ/mol',
      desc: 'Energia necessària per arrencar l\'electró més extern d\'un àtom en estat gasós (primera energia d\'ionització).',
      trend: { h: ['→', 'Augmenta al llarg del període'], v: ['↑', 'i cap amunt del grup'] },
      source: 'Primera energia d\'ionització (kJ/mol). Font: PeriodicTableJSON (NIST).'
    },
    electronAffinity: {
      label: 'Afinitat electrònica', group: 'Estructura i enllaç', kind: 'num', value: val.ea,
      fmt: v => Math.round(v) + ' kJ/mol', legendFmt: v => Math.round(v) + ' kJ/mol',
      cats: [{ k: 'noanio', label: 'No formen anions estables', color: null, meta: '≤ 0' }],
      catOf: el => { const v = val.eaRaw(el); return v !== null && v <= 0 ? 'noanio' : null; },
      metaOf: () => '≤ 0',
      desc: 'Energia que s\'allibera quan un àtom en estat gasós capta un electró i es converteix en un ió negatiu (anió). Com més gran, més tendència a formar anions. El clor té el valor més alt.',
      trend: { h: ['→', 'Augmenta cap a la dreta (màxim als halògens)'], v: ['↑', 'i cap amunt, amb excepcions (Cl > F)'] },
      note: 'Els gasos nobles, el nitrogen i metalls com el Be, el Mg o el Zn no formen anions estables (≤ 0). En gris, sense dades fiables (lantànids i elements des del 87).',
      source: 'Font: PeriodicTableJSON (valors experimentals recopilats a la Viquipèdia).'
    },
    atomicRadius: {
      label: 'Radi atòmic', group: 'Estructura i enllaç', kind: 'num', value: val.radius,
      fmt: v => v + ' pm', legendFmt: v => Math.round(v) + ' pm',
      desc: 'Mida aproximada de l\'àtom, en picòmetres (1 pm = 10⁻¹² m).',
      trend: { h: ['←', 'Augmenta cap a l\'esquerra del període'], v: ['↓', 'i cap avall del grup'] },
      source: 'Radi empíric (Slater, 1964); gasos nobles: radi calculat (Clementi, 1967).'
    },

    /* --- propietats físiques --- */
    density: {
      label: 'Densitat', group: 'Propietats físiques', kind: 'num', value: val.density,
      fmt: (v, el) => fmtDensity(el), legendFmt: v => (v < 0.01 ? '≈ 0' : fmtSig(v, 2)) + ' g/cm³',
      desc: 'Massa per unitat de volum. L\'osmi (22,6 g/cm³) és l\'element més dens.',
      note: 'Els gasos es donen en g/L (0 °C, 1 atm): 1 g/L = 0,001 g/cm³.',
      source: 'Font: PeriodicTableJSON.'
    },
    meltPoint: {
      label: 'Punt de fusió', group: 'Propietats físiques', kind: 'num', value: val.melt, temp: true,
      fmt: v => fmtTemp(v), legendFmt: v => fmtTemp(v),
      desc: 'Temperatura a què el sòlid passa a líquid a 1 atm. El tungstè té el punt de fusió més alt dels metalls.',
      note: 'El carboni i l\'arsènic subliment a pressió atmosfèrica; l\'heli només se solidifica a pressió elevada.',
      source: 'Font: PeriodicTableJSON.'
    },
    boilPoint: {
      label: 'Punt d\'ebullició', group: 'Propietats físiques', kind: 'num', value: val.boil, temp: true,
      fmt: v => fmtTemp(v), legendFmt: v => fmtTemp(v),
      desc: 'Temperatura a què el líquid bull a 1 atm. L\'heli té el punt d\'ebullició més baix (−269 °C).',
      source: 'Font: PeriodicTableJSON.'
    },
    condElectric: {
      label: 'Conductivitat elèctrica', group: 'Propietats físiques', kind: 'cat',
      cats: [
        { k: 'molt', label: 'Molt bons conductors (≥ 10⁷ S/m)', color: '#ef4444' },
        { k: 'bo', label: 'Bons conductors (10⁶–10⁷ S/m)', color: '#fb923c' },
        { k: 'moderat', label: 'Conductors moderats (< 10⁶ S/m)', color: '#fde047' },
        { k: 'semi', label: 'Semiconductors', color: '#a78bfa' },
        { k: 'aillant', label: 'Aïllants', color: '#60a5fa' },
        NODATA
      ],
      catOf: condClass,
      metaOf: el => { const s = val.sigma(el); return s !== null ? fmtSig(s, 3) : (condClass(el) === 'semi' ? 'variable' : ''); },
      desc: 'Capacitat de conduir el corrent elèctric, en siemens per metre (S/m). L\'argent és el millor conductor.',
      note: 'Valors a 20 °C. Carboni: grafit (el diamant és aïllant). Silici i germani: purs (intrínsecs).',
      source: 'Font: CRC Handbook of Chemistry and Physics.'
    },
    condThermal: {
      label: 'Conductivitat tèrmica', group: 'Propietats físiques', kind: 'num', value: val.thermal, log: true,
      fmt: v => fmtSig(v, 3), legendFmt: v => fmtSig(v, 1) + ' W/m·K',
      desc: 'Capacitat de conduir la calor, en W/m·K. Els metalls condueixen molt millor que els gasos.',
      note: 'Valors a 300 K. Escala logarítmica: cada pas de color multiplica el valor.',
      source: 'Font: CRC Handbook of Chemistry and Physics.'
    },
    ferromagnetism: {
      label: 'Ferromagnetisme', group: 'Propietats físiques', kind: 'cat',
      cats: [
        { k: 'si', label: 'Ferromagnètic a temperatura ambient', color: '#38bdf8' },
        { k: 'fred', label: 'Ferromagnètic per sota de 20 °C', color: '#a5f3fc' },
        { k: 'no', label: 'No ferromagnètic', color: '#d1d5db' }
      ],
      catOf: el => (inList(D.ferromagnetics, el.symbol) ? 'si' : el.symbol === 'Gd' ? 'fred' : 'no'),
      desc: 'Els materials ferromagnètics són atrets amb força pels imants i es poden imantar.',
      note: 'Altres lantànids (Tb, Dy) són ferromagnètics només a temperatures molt baixes.'
    },
    crystal: {
      label: 'Estructura cristal·lina', group: 'Propietats físiques', kind: 'cat', cats: CRYSTAL_CATS,
      catOf: el => { const c = val.crystal(el); return c ? c[0] : 'nodata'; },
      metaOf: el => { const c = val.crystal(el); if (!c || c[0] !== 'altres') return ''; const w = c[1].split(' ')[0]; return { 'romboèdrica': 'romboèdr.', 'ortoròmbica': 'ortoròmb.', 'monoclínica': 'monoclín.' }[w] || w; },
      desc: 'Com s\'ordenen els àtoms en el sòlid. La majoria de metalls s\'apilen de manera compacta, en estructures cúbiques o hexagonals. Clica un element per veure\'n la cel·la unitat.',
      note: 'A temperatura ambient (gasos i líquids: el sòlid a baixa temperatura). L\'estructura pot canviar amb la temperatura: el ferro passa de cc a ccc a 912 °C.',
      source: 'Font: CRC Handbook of Chemistry and Physics.'
    },

    /* --- química i vida --- */
    flame: {
      label: 'Color a la flama', group: 'Química i vida', kind: 'cat', cats: FLAME_CATS, previewMetaOnly: true,
      catOf: el => { const f = val.flame(el); return f ? f[0] : 'cap'; },
      colorOf: el => { const f = val.flame(el); return f ? f[2] : null; },
      metaOf: el => { const f = val.flame(el); return f ? f[1] : ''; },
      desc: 'Si s\'escalfa una sal de l\'element a la flama, els electrons pugen de nivell i, en tornar-hi, emeten llum d\'un color característic. Així es poden identificar elements (assaig a la flama) i es fan els colors dels focs artificials.',
      note: 'Colors aproximats. El sodi és tan intens que pot amagar els altres colors. Focs artificials: estronci (vermell), calci (taronja), sodi (groc), bari (verd) i coure (blau). El magnesi crema amb una llum blanca molt brillant.',
      source: 'Fonts: A. I. Vogel, Química analítica qualitativa; Royal Society of Chemistry.'
    },
    reactivity: {
      label: 'Reactivitat', group: 'Química i vida', kind: 'cat',
      cats: [
        { k: 'molt', label: 'Molt reactius', color: '#ef4444' },
        { k: 'bastant', label: 'Bastant reactius', color: '#fb923c' },
        { k: 'moderat', label: 'Reactivitat moderada', color: '#fde047' },
        { k: 'poc', label: 'Poc reactius', color: '#86efac' },
        { k: 'inert', label: 'Gairebé inerts', color: '#cbd5e1' },
        NODATA
      ],
      catOf: reactivity,
      desc: 'Facilitat amb què l\'element reacciona amb l\'aire, l\'aigua o els àcids. Els alcalins i els halògens són els més reactius.',
      note: 'Classificació qualitativa i aproximada: la reactivitat depèn del medi i de la forma de l\'element. El nitrogen és poc reactiu perquè la molècula N₂ és molt estable.'
    },
    bioessential: {
      label: 'Bioelements', group: 'Química i vida', kind: 'cat',
      cats: [
        { k: 'primari', label: 'Primaris (≈ 96 % de la massa)', color: '#22c55e' },
        { k: 'secundari', label: 'Secundaris', color: '#86efac' },
        { k: 'oligo', label: 'Oligoelements essencials', color: '#bef264' },
        { k: 'possible', label: 'Possiblement essencials', color: '#fef08a' },
        { k: 'no', label: 'No essencials', color: '#e5e7eb' }
      ],
      catOf: el => { const b = D.bioelements || {}; for (const k of ['primari', 'secundari', 'oligo', 'possible']) if (inList(b[k], el.symbol)) return k; return 'no'; },
      desc: 'Elements que formen part dels éssers vius. Els primaris (C, H, O, N, P, S) formen les biomolècules.',
      note: 'Els oligoelements són imprescindibles en quantitats molt petites; en excés poden ser tòxics.'
    },
    toxic: {
      label: 'Toxicitat', group: 'Química i vida', kind: 'cat',
      cats: [
        { k: 'alta', label: 'Molt tòxics', color: '#ef4444' },
        { k: 'compostos', label: 'Tòxics en alguns compostos o en excés', color: '#fdba74' },
        { k: 'no', label: 'No destacats', color: '#e5e7eb' }
      ],
      catOf: el => (inList((D.toxicitat || {}).alta, el.symbol) ? 'alta' : inList((D.toxicitat || {}).compostos, el.symbol) ? 'compostos' : 'no'),
      desc: 'Selecció d\'elements amb toxicitat química destacada, com els metalls pesants (mercuri, plom, cadmi).',
      note: 'La toxicitat depèn de la dosi i de la forma química. Per al perill radioactiu, vegeu el mode Radioactivitat.'
    },
    radioactive: {
      label: 'Radioactivitat', group: 'Química i vida', kind: 'cat',
      cats: [
        { k: 'estable', label: 'Té isòtops estables', color: '#86efac' },
        { k: 'natural', label: 'Radioactiu natural', color: '#fdba74' },
        { k: 'artificial', label: 'Radioactiu artificial', color: '#f87171' }
      ],
      catOf: el => { const z = el.number; if (z === 43 || z === 61 || z >= 93) return 'artificial'; if (z >= 84) return 'natural'; return 'estable'; },
      desc: 'Els elements sense isòtops estables emeten radiació. Del poloni (84) en endavant, tots són radioactius.',
      note: 'Tc i Pm no tenen isòtops estables. Se\'n troben traces a la natura, com també de Np i Pu. El bismut es considera estable a la pràctica.'
    },
    isotopes: {
      label: 'Isòtops estables', group: 'Química i vida', kind: 'cat', cats: ISO_CATS, catOf: isoCat,
      metaOf: el => { const n = val.nIsotopes(el); return n ? String(n) : ''; },
      desc: 'Els isòtops són àtoms d\'un mateix element amb diferent nombre de neutrons. La majoria d\'elements són una barreja d\'isòtops estables: l\'estany en té 10, el rècord. Clica un element per veure\'n les proporcions a la natura.',
      note: `Els elements de nombre atòmic senar en tenen 2 com a màxim: els protons aparellats fan el nucli més estable. En total, n'hi ha ${Object.values(X.isotops || {}).reduce((s, l) => s + l.length, 0)}. Del bismut (83) endavant, cap element en té.`,
      source: 'Font: IAEA, Live Chart of Nuclides (inclou els isòtops dels quals no s\'ha observat mai la desintegració).'
    },
    halfLife: {
      label: 'Període de semidesintegració', group: 'Química i vida', kind: 'num', log: true,
      value: val.halfLife,
      fmt: v => fmtDur(v), longFmt: v => fmtDur(v, true), legendFmt: v => fmtDur(v),
      cats: [
        { k: 'estable', label: 'Estables', color: null },
        { k: 'quasi', label: 'Pràcticament estable (Bi)', color: '#94a3b8' }
      ],
      catOf: halfCat,
      metaOf: el => (el.symbol === 'Bi' ? fmtDur(val.halfSec(el)) : 'estable'),
      valueLabel: 'Radioactius',
      refs: [[1, '1 s'], [86400, '1 dia'], [1000 * YEAR_S, '1.000 anys'], [4.54e9 * YEAR_S, 'edat de la Terra', 1]],
      desc: 'Temps que triga a desintegrar-se la meitat dels àtoms d\'una mostra (isòtop més estable de cada element). Exemple: d\'1 g de radi-226, al cap de 1.600 anys en queda 0,5 g; al cap de 3.200 anys, 0,25 g.',
      trend: { h: ['→', 'Del plom (82) endavant, cap element és estable'], v: ['↓', 'Com més pesant és el nucli, menys dura'] },
      note: 'Escala logarítmica: cada color multiplica el temps. a = anys, d = dies, h = hores, min = minuts, s = segons, ms = mil·lisegons. Clica un element per veure\'n la corba de desintegració. Els valors dels elements 104–118 són aproximats.',
      source: 'Font: NUBASE2020 (Kondev et al., 2021) i IAEA LiveChart.'
    },

    /* --- abundància --- */
    earth: {
      label: 'Escorça terrestre', group: 'Abundància (% en massa)', kind: 'num', log: true,
      value: el => val.abund('escorca', el), fmt: v => fmtPct(v), legendFmt: v => fmtPct(v),
      desc: 'Percentatge en massa de cada element a l\'escorça terrestre. L\'oxigen i el silici en formen el 74 %.',
      note: 'Escala logarítmica. En gris, elements sense dades o només en traces.',
      source: 'Font: CRC Handbook of Chemistry and Physics.'
    },
    body: {
      label: 'Cos humà', group: 'Abundància (% en massa)', kind: 'num', log: true,
      value: el => val.abund('cos', el), fmt: v => fmtPct(v), legendFmt: v => fmtPct(v),
      desc: 'Percentatge en massa en una persona adulta. L\'oxigen, el carboni, l\'hidrogen i el nitrogen en formen el 96 %.',
      note: 'Escala logarítmica. En gris, elements absents o només en traces.',
      source: 'Font: J. Emsley, The Elements (adult de 70 kg).'
    },
    universe: {
      label: 'Univers', group: 'Abundància (% en massa)', kind: 'num', log: true,
      value: el => val.abund('univers', el), fmt: v => fmtPct(v), legendFmt: v => fmtPct(v),
      desc: 'Percentatge en massa a la nostra galàxia. L\'hidrogen i l\'heli, formats al Big Bang, en són gairebé el 98 %.',
      note: 'Escala logarítmica. En gris, elements molt minoritaris (sense dades).',
      source: 'Font: K. Croswell (1996), fracció en massa a la Via Làctia.'
    },

    /* --- recursos i societat --- */
    critical: {
      label: 'Matèries primeres crítiques (UE)', group: 'Recursos i societat', kind: 'cat', cats: CRIT_CATS,
      catOf: el => { const c = val.critical(el); if (c) return c[0]; return inList(D.conflicte, el.symbol) ? 'conflicte' : 'no'; },
      metaOf: el => { const c = val.critical(el), w = inList(D.conflicte, el.symbol) ? '⚠' : ''; return c ? [c[1], w].filter(Boolean).join(' ') : (w ? w + ' conflicte' : ''); },
      desc: 'Elements imprescindibles per a bateries, imants, xips o energies renovables amb un risc alt de no poder-ne obtenir prou. A cada cel·la, el principal país productor.',
      note: 'Estratègiques: claus per a la transició verda i digital i per a la defensa. ⚠ Minerals de conflicte (Sn, Ta, W, Au): la seva extracció pot finançar guerres; la UE n\'exigeix la traçabilitat. Alguns elements hi són pel seu mineral: bauxita (Al), barita (Ba), fluorita (F), roca fosfòrica (P) i grafit (C).',
      source: 'Font: Reglament (UE) 2024/1252 i Comissió Europea, estudi de matèries primeres crítiques (2023).'
    },
    phone: {
      label: 'Elements del mòbil', group: 'Recursos i societat', kind: 'cat', cats: PHONE_CATS,
      catOf: el => { const p = val.phone(el); return p ? p[0] : 'no'; },
      desc: 'Un telèfon mòbil pot contenir més de 60 elements diferents. Aquí hi ha els principals, segons la part on es fan servir. Clica un element per saber-ne la funció.',
      note: 'Molts hi són en quantitats molt petites, però són difícils de substituir. Reciclar els mòbils permet recuperar-los (mineria urbana).',
      source: 'Fonts: A. Brunning, Compound Interest; Royal Society of Chemistry; American Chemical Society.'
    },
    price: {
      label: 'Preu aproximat', group: 'Recursos i societat', kind: 'cat', cats: PRICE_CATS,
      catOf: el => { const p = val.price(el); return p === null ? 'nodata' : 'p' + p; },
      desc: 'Quant costa, aproximadament, 1 kg de cada element en la forma en què es ven (metall, gas o mineral). El ferro i el sofre costen menys d\'1 € el quilo; l\'or i el platí, desenes de milers d\'euros. Com més escàs i difícil d\'obtenir, més car. Són ordres de magnitud: els preus varien segons el mercat.',
      source: 'Fonts: Wikipedia, «Prices of chemical elements» (USGS, 2020); cotitzacions de 2025.'
    },

    /* --- origen i història --- */
    cosmic: {
      label: 'Origen còsmic', group: 'Origen i història', kind: 'cat', cats: COSMIC_CATS,
      catOf: el => { const c = val.cosmic(el); return c ? c[0] : 'nodata'; },
      desc: 'On es van formar els àtoms de cada element. Les estrelles petites els fabriquen en morir; les massives i les nanes blanques, en explotar (supernoves); les de neutrons, en xocar. Tret de l\'hidrogen, els àtoms del nostre cos vénen d\'estrelles: som pols d\'estrelles.',
      note: 'Es mostra l\'origen principal. A la fitxa, l\'explicació i els altres orígens.',
      source: 'Font: J. A. Johnson, Science 363 (2019); N. Prantzos et al., MNRAS (2020).'
    },
    nameOrigin: {
      label: 'Origen del nom', group: 'Origen i història', kind: 'cat', cats: NAME_CATS,
      catOf: el => { const n = val.nameOrigin(el); return n ? n[0] : 'nodata'; },
      metaOf: el => { const n = val.nameOrigin(el); return n ? n[1] : ''; },
      desc: 'D\'on ve el nom de cada element: mitologia, astres, llocs, persones, propietats o minerals. Molts noms vénen del grec i del llatí. Clica un element per llegir-ne l\'etimologia.',
      note: 'Símbols que vénen del llatí: Na (natrium), K (kalium), Fe, Cu, Ag, Sn, Sb, Au, Hg i Pb.',
      source: 'Fonts: IUPAC; P. Enghag, Encyclopedia of the Elements (2004); J. Coromines, Diccionari etimològic.'
    },
    discovery: {
      label: 'Any de descobriment', group: 'Origen i història', kind: 'cat',
      cats: [
        { k: 'antic', label: 'Antiguitat', color: '#d6a35c' },
        { k: 'mitja', label: 'Edat mitjana i moderna (500–1649)', color: '#fcd34d' },
        { k: 'c18', label: '1650–1799', color: '#bef264' },
        { k: 'c19a', label: '1800–1849', color: '#6ee7b7' },
        { k: 'c19b', label: '1850–1899', color: '#7dd3fc' },
        { k: 'c20a', label: '1900–1949', color: '#a5b4fc' },
        { k: 'c20b', label: 'Des de 1950', color: '#f0abfc' }
      ],
      catOf: el => yearCat(val.year(el)),
      metaOf: el => { const y = val.year(el); return y === null ? '' : fmtYear(y); },
      desc: 'Any en què l\'element es va identificar o aïllar. Mou el control lliscant per veure com creix la taula al llarg de la història.',
      note: 'Els anys anteriors al 1600 són aproximats. Mendeléiev va publicar la seva taula el 1869.',
      source: 'Font: taula d\'anys de descobriment (Viquipèdia).'
    },
    country: {
      label: 'País del descobriment', group: 'Origen i història', kind: 'cat', cats: COUNTRY_CATS, catOf: countryCat,
      metaOf: el => { const c = val.country(el); return c && countryCat(el) === 'altres' ? countryName(c[0]) : ''; },
      desc: 'País on es va descobrir o aïllar cada element. Suècia, rica en minerals, i el Regne Unit en van descobrir molts als segles XVIII i XIX. Des de 1940, els elements nous s\'han obtingut en grans laboratoris dels Estats Units, Rússia, Alemanya i el Japó.',
      note: 'Hi van participar Marie Curie (Po, Ra), Marguerite Perey (Fr), Ida Noddack (Re) i Lise Meitner (Pa). A la fitxa, els descobriments compartits.',
      source: 'Font: descobridors i anys de la Viquipèdia; elaboració pròpia.'
    }
  };
  const MODE_KEYS = Object.keys(MODES);
  if (!MODES[state.mode]) state.mode = 'families';

  /* ================= colors ================= */
  const SEQ = ['#2563eb', '#0ea5e9', '#22c55e', '#eab308', '#f97316', '#dc2626'];
  const hexToRgb = h => { const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0]; };
  function paletteAt(t) {
    t = Math.min(1, Math.max(0, t));
    const x = t * (SEQ.length - 1), i = Math.min(SEQ.length - 2, Math.floor(x)), f = x - i;
    const a = hexToRgb(SEQ[i]), b = hexToRgb(SEQ[i + 1]);
    return '#' + a.map((c, j) => Math.round(c + (b[j] - c) * f).toString(16).padStart(2, '0')).join('');
  }
  function fgFor(hex) {
    const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const [r, g, b] = hexToRgb(hex);
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    // contrast amb negre (L+0.05)/0.05 vs amb blanc 1.05/(L+0.05)
    return (L + 0.05) / 0.05 >= 1.05 / (L + 0.05) ? '#111318' : '#ffffff';
  }
  function setBG(node, color) {
    node.style.background = color;
    node.style.setProperty('--cell-fg', fgFor(color));
  }
  function buildScale(valueFn, log, els = ELS) {
    const vals = els.map(valueFn).filter(v => typeof v === 'number' && (!log || v > 0));
    if (!vals.length) return null;
    const f = log ? Math.log10 : (v => v);
    const lo = f(Math.min(...vals)), hi = f(Math.max(...vals));
    const inv = log ? (x => Math.pow(10, x)) : (x => x);
    return {
      min: inv(lo), max: inv(hi), mid: inv((lo + hi) / 2),
      color: v => paletteAt(hi === lo ? 0.5 : (f(v) - lo) / (hi - lo))
    };
  }

  /* ================= construcció de la graella ================= */
  const grid = document.getElementById('periodic-grid');
  const cells = {};
  let infoPanel = null;

  function addLabel(cls, text, col, row) {
    const d = document.createElement('div');
    d.className = cls; d.textContent = text;
    d.style.gridColumn = col; d.style.gridRow = row;
    d.setAttribute('aria-hidden', 'true');
    grid.appendChild(d);
    return d;
  }

  function createGrid() {
    grid.innerHTML = '';
    for (let g = 1; g <= 18; g++) addLabel('grid-label-group', g, g + 1, 1);
    for (let p = 1; p <= 7; p++) addLabel('grid-label-period', p, 1, p + 1);
    // referències al bloc f dins del grup 3
    const ref6 = addLabel('fblock-ref', '', 4, 7); ref6.innerHTML = '<span>57–71</span><span>*</span>';
    const ref7 = addLabel('fblock-ref', '', 4, 8); ref7.innerHTML = '<span>89–103</span><span>**</span>';
    const l1 = addLabel('grid-label-f', '* Lantànids', '1 / 4', 10);
    const l2 = addLabel('grid-label-f', '** Actínids', '1 / 4', 11);
    l1.removeAttribute('aria-hidden'); l2.removeAttribute('aria-hidden');

    infoPanel = document.createElement('div');
    infoPanel.className = 'info-panel';
    infoPanel.setAttribute('aria-live', 'polite');
    grid.appendChild(infoPanel);

    for (const el of ELS) {
      const c = document.createElement('button');
      c.type = 'button';
      c.className = 'cell';
      c.style.gridColumn = el.xpos + 1;
      c.style.gridRow = el.ypos + 1;
      c.dataset.sym = el.symbol;
      c.innerHTML = `<span class="num">${el.number}</span><span class="sym">${el.symbol}<span class="lewis" aria-hidden="true"></span></span><span class="name">${esc(nameOf(el))}</span><span class="meta"></span>`;
      c.addEventListener('click', () => onCellClick(el));
      c.addEventListener('mouseenter', () => { state.hover = el.symbol; if (!state.quiz && !state.compare) renderInfo(); });
      c.addEventListener('focus', () => { state.hover = el.symbol; if (!state.quiz && !state.compare) renderInfo(); });
      cells[el.symbol] = c;
      grid.appendChild(c);
    }
  }

  /* ================= pintat ================= */
  function cellState(el, m, scale) {
    if (m.kind === 'cat') {
      const k = m.catOf(el);
      const def = m.cats.find(c => c.k === k);
      const own = m.colorOf ? m.colorOf(el) : null;
      return { cat: k, color: own || (def ? def.color : null), meta: m.metaOf ? m.metaOf(el) : '' };
    }
    if (m.kind === 'num') {
      // categories fixes dins d'un mode numèric (p. ex. elements estables)
      const k = m.catOf ? m.catOf(el) : null;
      if (k) { const def = m.cats.find(c => c.k === k); return { cat: k, color: def.color, meta: m.metaOf ? m.metaOf(el) : '' }; }
      const v = m.value(el);
      if (v === null || v === undefined || (m.log && v <= 0) || !scale) return { cat: 'nodata', color: null, meta: '' };
      return { cat: 'value', color: scale.color(v), meta: m.fmt(v, el) };
    }
    return { cat: null, color: null, meta: '' };
  }

  function paint() {
    const q = state.quiz;
    const m = MODES[state.mode];
    const scale = m.kind === 'num' ? buildScale(m.value, m.log) : null;
    const qScale = q && q.prop ? buildScale(q.prop.value, q.prop.log, q.set.map(s => ELS.find(e => e.symbol === s))) : null;

    grid.classList.toggle('lewis-on', !q && !!m.lewis);
    for (const el of ELS) {
      const c = cells[el.symbol];
      c.className = 'cell';
      c.style.background = '';
      c.style.removeProperty('--cell-fg');
      let st;
      if (q && q.type === 'guess') {
        st = { cat: null, color: null, meta: '' };
        if (q.wrong.includes(el.symbol)) c.classList.add('wrong');
        if (q.answered && el.symbol === q.answer) c.classList.add('right');
      } else if (q) {
        const inSet = q.set.includes(el.symbol);
        st = { cat: null, color: null, meta: '' };
        if (!inSet) c.classList.add('dim');
        else if (q.answered) { const v = q.prop.value(el); st = { color: qScale.color(v), meta: q.prop.fmt(v, el) }; }
        if (q.answered && el.symbol === q.answer) c.classList.add('right');
        if (q.answered && el.symbol === q.picked && q.picked !== q.answer) c.classList.add('wrong');
      } else {
        st = cellState(el, m, scale);
        if (m.kind !== 'none' && isPredicted(el)) c.classList.add('predicted');
        if (state.focus && st.cat !== state.focus) c.classList.add('dim');
        if (state.mode === 'discovery') {
          const y = val.year(el);
          if (y !== null && y > state.yearLimit) c.classList.add('dim');
          else if (state.playing && y !== null && y > state.yearLimit - 5) c.classList.add('pop');
        }
        if (state.compare && state.compare.includes(el.symbol)) c.classList.add('picked');
      }
      if (st.color) { setBG(c, st.color); c.classList.add('colored'); }
      else if (st.cat === 'nodata') c.style.background = 'var(--nodata)';
      const meta = c.querySelector('.meta');
      meta.textContent = st.meta || '';
      const nv = !q && m.lewis ? val.valenceE(el) : null;
      c.querySelector('.lewis').innerHTML = nv ? lewisHTML(nv, el.symbol === 'He') : '';
      const long = (st.meta || '').length > 12;
      meta.classList.toggle('long', long);
      c.classList.toggle('has-long', long);
      c.setAttribute('aria-label', `${nameOf(el)}, ${el.symbol}, nombre atòmic ${el.number}${st.meta ? ', ' + st.meta : ''}`);
    }
    renderLegend();
    renderInfo();
  }

  /* ================= panell d'informació (espai buit de la taula) ================= */
  function previewHTML(el) {
    if (!el) return '<div class="info-preview empty">Passa per sobre d\'un element per veure\'l aquí</div>';
    const m = MODES[state.mode];
    const st = cellState(el, m, m.kind === 'num' ? buildScale(m.value, m.log) : null);
    let valText = st.meta;
    if (m.kind === 'cat' && st.cat) { const def = m.cats.find(c => c.k === st.cat); if (def) valText = def.label + (st.meta && !m.previewNoMeta ? ' · ' + st.meta : ''); }
    if (st.cat === 'nodata' && m.kind === 'num') valText = 'Sense dades';
    if (m.previewMetaOnly && st.meta) valText = st.meta.charAt(0).toUpperCase() + st.meta.slice(1);
    if (m.kind === 'num' && st.cat === 'value' && m.longFmt) valText = m.longFmt(m.value(el), el);
    if (m.kind === 'num' && m.cats && st.cat !== 'value' && st.cat !== 'nodata') {
      const def = m.cats.find(c => c.k === st.cat); if (def) valText = def.label.replace(/\s*\([^)]*\)$/, '');
    }
    const style = st.color ? `style="background:${st.color};--cell-fg:${fgFor(st.color)}"` : '';
    return `<div class="info-preview" ${style}>
      <span class="num">${el.number}</span><span class="sym">${el.symbol}</span>
      <span class="name">${esc(nameOf(el))}</span><span class="val">${esc(valText || '')}</span></div>`;
  }

  function renderInfo() {
    if (!infoPanel) return;
    const q = state.quiz;
    if (q?.total === ROUND_LENGTH) {
      const last = round.answers.at(-1);
      infoPanel.innerHTML = `<div class="info-body">
        <p class="quiz-score">Repte complet · ${q.score} encerts de ${ROUND_LENGTH}</p>
        <p class="quiz-feedback ${last.encert ? 'ok' : 'ko'}">${last.encert ? 'Última resposta correcta.' : `A l’última pregunta, la resposta correcta era ${esc(last.correcta)}.`}</p>
        <p role="status">${esc(round.message)}</p>
        <div class="panel-actions">
          ${round.failed ? '<button type="button" class="panel-btn" data-act="retry-save">Reintenta el desament</button>' : ''}
          <button type="button" class="panel-btn" data-act="restart-quiz">Nou repte</button>
          <button type="button" class="panel-btn secondary" data-act="quit">Torna a explorar</button>
        </div></div>`;
      return;
    }
    if (q && q.type === 'guess') {
      const ans = bySym(q.answer);
      const fb = q.answered
        ? (q.found
          ? `<p class="quiz-feedback ok">Correcte! És ${esc(isoArticle(ans))}, amb ${q.shown} ${q.shown === 1 ? 'pista' : 'pistes'}.</p>`
          : `<p class="quiz-feedback ko">S'han acabat les pistes. Era ${esc(isoArticle(ans))} (${ans.symbol}).</p>`)
        : `<p class="info-text">Clica l'element. Cada error descobreix una pista nova (${q.shown} de ${q.clues.length}).</p>`;
      infoPanel.innerHTML = `<div class="info-body compact">
        <p class="quiz-score">Repte · ${q.total}/${ROUND_LENGTH} resoltes · ${q.score} encerts</p>
        <p class="quiz-q">Endevina l'element</p>
        <ol class="clues">${q.clues.slice(0, q.answered ? q.clues.length : q.shown).map(c => `<li>${esc(c)}</li>`).join('')}</ol>${fb}
        <div class="panel-actions">
          ${q.answered ? '<button type="button" class="panel-btn" data-act="next">Següent repte</button>' : ''}
          <button type="button" class="panel-btn secondary" data-act="quit">Surt del repte</button>
        </div></div>`;
      return;
    }
    if (q) {
      const fb = q.answered
        ? (q.picked === q.answer
          ? `<p class="quiz-feedback ok">Correcte! ${esc(nameOf(bySym(q.answer)))}: ${esc(q.prop.longFmt(q.prop.value(bySym(q.answer)), bySym(q.answer)))}.</p>`
          : `<p class="quiz-feedback ko">No és correcte. La resposta és ${esc(nameOf(bySym(q.answer)))} (${esc(q.prop.longFmt(q.prop.value(bySym(q.answer)), bySym(q.answer)))}).</p>`)
        : '<p class="info-text">Clica l\'element que creguis correcte. Pensa en les tendències de la taula!</p>';
      infoPanel.innerHTML = `<div class="info-body">
        <p class="quiz-score">Repte · ${q.total}/${ROUND_LENGTH} resoltes · ${q.score} encerts</p>
        <p class="quiz-q">${esc(q.text)}</p>${fb}
        <div class="panel-actions">
          ${q.answered ? '<button type="button" class="panel-btn" data-act="next">Següent repte</button>' : ''}
          <button type="button" class="panel-btn secondary" data-act="quit">Surt del repte</button>
        </div></div>`;
      return;
    }
    if (state.compare) {
      const picked = state.compare.map(s => `<strong>${esc(nameOf(bySym(s)))}</strong>`).join(' i ');
      infoPanel.innerHTML = `${previewHTML(state.hover ? bySym(state.hover) : null)}<div class="info-body">
        <p class="info-title">Compara dos elements</p>
        <p class="info-text">${picked ? 'Has triat ' + picked + '. Ara tria el segon element.' : 'Clica dos elements de la taula per comparar-ne les propietats.'}</p>
        <div class="panel-actions"><button type="button" class="panel-btn secondary" data-act="stopcmp">Cancel·la</button></div></div>`;
      return;
    }
    const m = MODES[state.mode];
    let extra = '';
    if (state.mode === 'discovery') {
      const known = ELS.filter(e => { const y = val.year(e); return y !== null && y <= state.yearLimit; }).length;
      const f = (D.fites || []).filter(x => x[0] <= state.yearLimit).pop();
      extra = `<p class="milestone">${f ? `<strong>${f[0] <= 1650 ? 'Fins al 1650' : f[0]}</strong> · ${esc(f[1])}` : ''}</p>
        <p class="known">Elements coneguts ${state.yearLimit >= 2010 ? 'avui' : 'el ' + state.yearLimit}: <strong>${known}</strong> de 118</p>`;
    } else if (state.mode === 'stateTemp') {
      const K = tempK(), n = { Solid: 0, Liquid: 0, Gas: 0 };
      for (const e of ELS) { const p = phaseAt(e, K); if (p in n) n[p]++; }
      const pr = tempPreset();
      extra = `<p class="milestone">${pr ? `<strong>${esc(pr[2])}</strong>` : `<strong>${esc(fmtTempC(K))}</strong> (${esc(fmtK(K))})`}</p>
        <p class="known">Sòlids: <strong>${n.Solid}</strong> · líquids: <strong>${n.Liquid}</strong> · gasos: <strong>${n.Gas}</strong></p>`;
    } else if (state.mode === 'phone') {
      const inPhone = ELS.filter(e => val.phone(e));
      const crit = inPhone.filter(e => val.critical(e)).length;
      extra = `<p class="known"><strong>${crit}</strong> d'aquests ${inPhone.length} elements són matèries primeres crítiques per a la UE.</p>`;
    }
    const trend = m.trend ? `<div class="trend">
        <span class="trend-box"><span class="trend-arrow">${m.trend.h[0]}</span>${esc(m.trend.h[1])}</span>
        <span class="trend-box"><span class="trend-arrow">${m.trend.v[0]}</span>${esc(m.trend.v[1])}</span></div>` : '';
    infoPanel.innerHTML = `${previewHTML(state.hover ? bySym(state.hover) : null)}<div class="info-body">
      <p class="info-title">${esc(m.label)}</p><p class="info-text">${esc(m.desc)}</p>${extra}${trend}</div>`;
  }
  const bySym = s => ELS.find(e => e.symbol === s);
  const isoArticle = el => { const n = nameOf(el); return (/^[aeiouàèéíòóúhAEIOUÀÈÉÍÒÓÚH]/.test(n) ? 'l’' : 'el ') + n; };

  /* ================= llegenda i opcions ================= */
  function renderLegend() {
    const box = document.getElementById('legend');
    const m = MODES[state.mode];
    let html = '<h2>Llegenda</h2>';
    const q = state.quiz;
    if (q && q.type === 'guess') {
      html += '<p class="note" style="margin-top:0">Endevina l\'element: clica\'l a la taula. Cada error descobreix una pista nova. Les pistes fan servir els modes de la taula (origen còsmic, família, descobriment, origen del nom...).</p>';
      box.innerHTML = html;
      return;
    }
    if (q) {
      if (q.answered) {
        const sc = buildScale(q.prop.value, q.prop.log, q.set.map(bySym));
        html += `<div class="gradient" style="background:linear-gradient(90deg, ${SEQ.join(', ')})"></div>
          <div class="ticks"><span>${esc(q.prop.legendFmt(sc.min))}</span><span>${esc(q.prop.legendFmt(sc.max))}</span></div>
          <p class="note">${esc(q.prop.label)} dels elements del repte.</p>`;
      } else html += '<p class="note" style="margin-top:0">Repte en curs: els colors i els valors apareixeran quan responguis.</p>';
      box.innerHTML = html;
      return;
    }
    if (m.kind === 'none') {
      html += '<p class="note" style="margin-top:0">Sense colors: només número atòmic, símbol i nom. Clica un element per obrir-ne la fitxa.</p>';
    } else if (m.kind === 'cat') {
      const counts = {};
      for (const el of ELS) { const k = m.catOf(el); counts[k] = (counts[k] || 0) + 1; }
      html += '<div class="items">';
      for (const c of m.cats) {
        if (!counts[c.k]) continue;
        const sw = c.color ? `background:${c.color}` : 'background:var(--nodata)';
        html += `<button type="button" class="item" data-cat="${c.k}" aria-pressed="${state.focus === c.k}"><span class="swatch" style="${sw}"></span>${esc(c.label)} <span class="count">${counts[c.k]}</span></button>`;
      }
      html += '</div><p class="hint">Clica una categoria per destacar-ne els elements.</p>';
    } else {
      const sc = buildScale(m.value, m.log);
      if (sc) {
        const stops = SEQ.map((c, i) => `${c} ${Math.round(i / (SEQ.length - 1) * 100)}%`).join(', ');
        html += `<div class="gradient" style="background:linear-gradient(90deg, ${stops})"></div>`;
        if (m.refs && m.log) {
          // marques de referència (1 s, 1 dia...) situades a la seva posició de l'escala
          const lo = Math.log10(sc.min), hi = Math.log10(sc.max);
          const two = m.refs.some(r => r[2]);
          html += `<div class="refs${two ? ' two' : ''}">` + m.refs.map(([v, label, row]) => {
            const t = (Math.log10(v) - lo) / (hi - lo);
            if (t < 0 || t > 1) return '';
            const align = t > 0.85 ? 'end' : t < 0.12 ? 'start' : 'mid';
            return `<span class="ref ${align}${row ? ' row1' : ''}" style="left:${(t * 100).toFixed(1)}%"><i></i>${esc(label)}</span>`;
          }).join('') + '</div>';
          html += `<div class="ticks"><span>${esc(m.legendFmt(sc.min))}</span><span>${esc(m.legendFmt(sc.max))}</span></div>`;
        } else {
          html += `<div class="ticks"><span>${esc(m.legendFmt(sc.min))}</span><span>${esc(m.legendFmt(sc.mid))}</span><span>${esc(m.legendFmt(sc.max))}</span></div>`;
        }
      }
      const fixedCat = el => (m.catOf ? m.catOf(el) : null);
      if (m.cats) {
        const counts = {};
        for (const el of ELS) { const k = fixedCat(el); if (k) counts[k] = (counts[k] || 0) + 1; }
        const nVal = ELS.filter(el => !fixedCat(el) && typeof m.value(el) === 'number').length;
        html += '<div class="items">';
        if (m.valueLabel) html += `<button type="button" class="item" data-cat="value" aria-pressed="${state.focus === 'value'}"><span class="swatch" style="background:linear-gradient(90deg, ${SEQ.join(', ')})"></span>${esc(m.valueLabel)} <span class="count">${nVal}</span></button>`;
        for (const c of m.cats) {
          if (!counts[c.k]) continue;
          html += `<button type="button" class="item" data-cat="${c.k}" aria-pressed="${state.focus === c.k}"><span class="swatch" style="background:${c.color || 'var(--bg-blank-cell)'}"></span>${esc(c.label)} <span class="count">${counts[c.k]}</span></button>`;
        }
        html += '</div><p class="hint">Clica una categoria per destacar-ne els elements.</p>';
      }
      const nodata = ELS.filter(el => { if (fixedCat(el)) return false; const v = m.value(el); return v === null || v === undefined; }).length;
      if (nodata) html += `<div class="items"><span class="item"><span class="swatch" style="background:var(--nodata)"></span>Sense dades <span class="count">${nodata}</span></span></div>`;
    }
    if (m.note) html += `<p class="note">${esc(m.note)}</p>`;
    if (m.source) html += `<p class="source">${esc(m.source)}</p>`;
    box.innerHTML = html;
  }

  function renderOptions() {
    const box = document.getElementById('mode-options');
    const m = MODES[state.mode];
    if (m.temp) {
      box.innerHTML = `<div class="opt-row">Unitats:
        <span class="seg" role="group" aria-label="Unitats de temperatura">
          <button type="button" data-temp="C" aria-pressed="${state.temp === 'C'}">°C</button>
          <button type="button" data-temp="K" aria-pressed="${state.temp === 'K'}">K</button>
        </span></div>`;
    } else if (state.mode === 'discovery') {
      box.innerHTML = `<div class="opt-row timeline">
        <button type="button" class="play-btn" id="play-btn" aria-pressed="${!!state.playing}" title="${state.playing ? 'Atura' : 'Reprodueix'} la línia del temps" aria-label="${state.playing ? 'Atura' : 'Reprodueix'} la línia del temps">${state.playing ? '❚❚' : '▶'}</button>
        <input id="year-range" type="range" min="1650" max="2010" step="5" value="${state.yearLimit}" aria-label="Elements descoberts fins a l'any">
        <output class="year-out" id="year-out">${state.yearLimit >= 2010 ? 'avui' : state.yearLimit}</output></div>`;
    } else if (state.mode === 'stateTemp') {
      const K = tempK();
      box.innerHTML = `<div class="opt-row timeline">
        <button type="button" class="play-btn" id="play-btn" aria-pressed="${!!state.playing}" title="${state.playing ? 'Atura' : 'Escalfa'} la taula" aria-label="${state.playing ? 'Atura' : 'Escalfa'} la taula">${state.playing ? '❚❚' : '▶'}</button>
        <input id="temp-range" type="range" min="0" max="1000" step="1" value="${state.tempPos}" aria-label="Temperatura" aria-valuetext="${esc(fmtTempC(K))}">
        <output class="year-out temp-out" id="temp-out">${esc(fmtTempC(K))}<small>${esc(fmtK(K))}</small></output></div>
        <div class="temp-presets" role="group" aria-label="Temperatures de referència">${(X.temps || []).map(t =>
          `<button type="button" data-tk="${t[0]}" title="${esc(t[2])}" aria-pressed="${t[0] === state.tempFix}">${esc(t[1])}</button>`).join('')}</div>`;
    } else box.innerHTML = '';
  }

  /* animació de la línia del temps: avança 5 anys cada 0,17 s */
  function stopPlay() {
    if (state.playing) { clearInterval(state.playing); state.playing = null; }
  }
  function syncTimeline() {
    const b = document.getElementById('play-btn');
    if (state.mode === 'stateTemp') {
      const r = document.getElementById('temp-range'), o = document.getElementById('temp-out'), K = tempK();
      if (r) { r.value = state.tempPos; r.setAttribute('aria-valuetext', fmtTempC(K)); }
      if (o) o.innerHTML = `${esc(fmtTempC(K))}<small>${esc(fmtK(K))}</small>`;
      document.querySelectorAll('.temp-presets button').forEach(x => x.setAttribute('aria-pressed', String(Number(x.dataset.tk) === state.tempFix)));
      if (b) { b.textContent = state.playing ? '❚❚' : '▶'; b.setAttribute('aria-pressed', String(!!state.playing)); const t = (state.playing ? 'Atura' : 'Escalfa') + ' la taula'; b.title = t; b.setAttribute('aria-label', t); }
      return;
    }
    const r = document.getElementById('year-range'), o = document.getElementById('year-out');
    if (r) r.value = state.yearLimit;
    if (o) o.textContent = state.yearLimit >= 2010 ? 'avui' : state.yearLimit;
    if (b) { b.textContent = state.playing ? '❚❚' : '▶'; b.setAttribute('aria-pressed', String(!!state.playing)); const t = (state.playing ? 'Atura' : 'Reprodueix') + ' la línia del temps'; b.title = t; b.setAttribute('aria-label', t); }
  }
  function togglePlay() {
    if (state.playing) { stopPlay(); syncTimeline(); return; }
    if (state.mode === 'stateTemp') {
      // des d'una temperatura de referència, l'animació comença al zero absolut
      if (state.tempFix || state.tempPos >= 1000) state.tempPos = 0;
      state.tempFix = null;
      state.playing = setInterval(() => {
        state.tempPos = Math.min(1000, state.tempPos + 6);
        if (state.tempPos >= 1000) stopPlay();
        syncTimeline();
        paint();
      }, 90);
      syncTimeline();
      return;
    }
    if (state.yearLimit >= 2010) state.yearLimit = 1645;
    state.playing = setInterval(() => {
      state.yearLimit = Math.min(2010, state.yearLimit + 5);
      if (state.yearLimit >= 2010) stopPlay();
      syncTimeline();
      paint();
    }, 170);
    syncTimeline();
  }

  function setMode(mode) {
    stopPlay();
    if (!MODES[mode]) mode = 'families';
    state.mode = mode;
    state.focus = null;
    store.set('mode', mode);
    document.getElementById('mode-select').value = mode;
    renderOptions();
    renderLegend();
    paint();
  }

  function buildSelect() {
    const sel = document.getElementById('mode-select');
    let html = '', group = undefined;
    for (const k of MODE_KEYS) {
      const m = MODES[k];
      if (m.group !== group) {
        if (group) html += '</optgroup>';
        if (m.group) html += `<optgroup label="${esc(m.group)}">`;
        group = m.group;
      }
      html += `<option value="${k}">${esc(m.label)}</option>`;
    }
    if (group) html += '</optgroup>';
    sel.innerHTML = html;
    sel.addEventListener('change', e => setMode(e.target.value));
  }

  /* ================= fitxa de l'element ================= */
  function configHTML(el) {
    const raw = (el.electron_configuration_semantic || el.electron_configuration || '').replace(/^\*/, '');
    return esc(raw).replace(/([spdf])(\d+)/g, '$1<sup>$2</sup>');
  }
  function massText(el) {
    const m = el.atomic_mass;
    if (typeof m !== 'number') return '—';
    return Number.isInteger(m) ? `[${m}]` : fmtFixed(m, 2);
  }
  function catLabel(modeKey, el) {
    const m = MODES[modeKey], k = m.catOf(el), def = m.cats.find(c => c.k === k);
    return def ? def.label.replace(/\s*\([^)]*\)$/, '') : '—';
  }
  function fitxaRows(el) {
    const pred = isPredicted(el) ? ' (predit)' : '';
    const g = groupOf(el);
    const sigma = val.sigma(el);
    const condTxt = catLabel('condElectric', el) + (sigma !== null ? ' · ' + fmtSig(sigma, 3) + ' S/m' : '');
    const th = val.thermal(el);
    const abund = (k, mode) => { const v = val.abund(k, el); return [MODES[mode].label, v === null ? 'traces o sense dades' : fmtPct(v), mode]; };
    const t = (k) => (k === null ? '—' : `${fmtTemp(k, 'C')} (${fmtTemp(k, 'K')})`);
    const y = val.year(el);
    return [
      ['Nombre atòmic (Z)', el.number, 'blank'],
      ['Massa atòmica (u)', massText(el), null],
      ['Grup · període', `${g ? g : (family(el) === 'lantanid' ? 'lantànids' : 'actínids')} · ${el.period}`, null],
      ['Bloc', (el.block || '—').toLowerCase(), 'blocks'],
      ['Família', FAMILY_LABEL[family(el)] + pred, 'families'],
      ['Estat a 25 °C', catLabel('state', el), 'state'],
      ['Configuració electrònica', configHTML(el) + pred, null, true, true],
      ['Electrons de valència', val.valenceE(el) === null ? 'variables' : String(val.valenceE(el)), 'valenceE'],
      ['Estats d\'oxidació habituals', val.ox(el) ? fmtOx(val.ox(el)) : '—', 'valence'],
      ['Electronegativitat (Pauling)', val.en(el) !== null ? fmtFixed(val.en(el), 2) : '—', 'electronegativity'],
      ['1a energia d\'ionització', val.ion(el) !== null ? Math.round(val.ion(el)) + ' kJ/mol' : '—', 'ionization'],
      ['Afinitat electrònica', val.ea(el) !== null ? Math.round(val.ea(el)) + ' kJ/mol' : (val.eaRaw(el) !== null ? '≤ 0 (no forma anions estables)' : '—'), 'electronAffinity'],
      ['Radi atòmic', val.radius(el) !== null ? val.radius(el) + ' pm' : '—', 'atomicRadius'],
      ['Densitat', fmtDensity(el), 'density'],
      ['Punt de fusió', t(val.melt(el)), 'meltPoint'],
      ['Punt d\'ebullició', t(val.boil(el)), 'boilPoint'],
      ['Conductivitat elèctrica', condTxt, 'condElectric'],
      ['Conductivitat tèrmica', th !== null ? fmtSig(th, 3) + ' W/m·K' : '—', 'condThermal'],
      abund('escorca', 'earth'), abund('cos', 'body'), abund('univers', 'universe'),
      ['Bioelement', catLabel('bioessential', el), 'bioessential'],
      ['Toxicitat', catLabel('toxic', el), 'toxic'],
      ['Radioactivitat', catLabel('radioactive', el), 'radioactive'],
      ['Període de semidesintegració', halfText(el), 'halfLife', false, true],
      ['Magnetisme', catLabel('ferromagnetism', el), 'ferromagnetism'],
      ['Reactivitat', catLabel('reactivity', el), 'reactivity'],
      ['Any de descobriment', y === null ? '—' : fmtYear(y), 'discovery'],
      ['Matèria primera crítica (UE)', criticalText(el), 'critical'],
      ['Color a la flama', flameText(el), 'flame', false, true],
      ['Origen del nom', val.nameOrigin(el) ? val.nameOrigin(el)[2] : '—', 'nameOrigin', false, true, true],
      ['Origen còsmic', cosmicText(el), 'cosmic', false, true, true],
      ['Isòtops estables', isoText(el), 'isotopes', false, true],
      ['Estructura cristal·lina', crystalText(el), 'crystal'],
      ['Preu aproximat', catLabel('price', el), 'price'],
      ['País del descobriment', countryText(el), 'country', false, true, true],
      val.phone(el) ? ['Al mòbil', PHONE_CATS.find(c => c.k === val.phone(el)[0]).label + '. ' + val.phone(el)[1], 'phone', false, true, true] : null
    ].filter(Boolean);
  }

  let lastFocus = null;
  function openModal(html, tileColor) {
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-content').innerHTML = html;
    if (tileColor) {
      const tile = overlay.querySelector('.fitxa-tile');
      if (tile) setBG(tile, tileColor);
    }
    lastFocus = document.activeElement;
    overlay.classList.remove('hidden');
    document.getElementById('element-modal').focus();
  }
  function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* model de Bohr: nucli (protons i neutrons) i electrons per capes */
  const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
  function bohrHTML(el) {
    const sh = val.shells(el);
    if (!sh.length) return '';
    const Z = el.number, A = val.massNumber(el), N = A ? A - Z : null;
    const S = 300, c = S / 2, n = sh.length;
    const rad = i => (n === 1 ? 62 : 44 + i * (100 / (n - 1)));
    let orbits = '', dots = '';
    sh.forEach((k, i) => {
      const r = rad(i), last = i === n - 1, dr = k > 18 ? 3.4 : 4.2;
      orbits += `<circle class="orbit" cx="${c}" cy="${c}" r="${r.toFixed(1)}"/>`;
      for (let j = 0; j < k; j++) {
        const a = (-90 + i * 13 + 360 * j / k) * Math.PI / 180;
        dots += `<circle class="el${last ? ' ve' : ''}" cx="${(c + r * Math.cos(a)).toFixed(1)}" cy="${(c + r * Math.sin(a)).toFixed(1)}" r="${dr}"/>`;
      }
    });
    const nuc = `<circle class="nucleus" cx="${c}" cy="${c}" r="27"/>
      <text class="nuc-text" x="${c}" y="${c - 2}" text-anchor="middle">${Z} p⁺</text>
      <text class="nuc-text" x="${c}" y="${c + 12}" text-anchor="middle">${N === null ? '' : N + ' n⁰'}</text>`;
    const stable = !!(D.isotopPrincipal || {})[el.symbol];
    const iso = A ? `${supNum(A)}${el.symbol} (${isoName(el, A).replace(/^(el |l’)/, '')}), ${stable ? 'l\'isòtop més abundant a la natura' : 'l\'isòtop de vida més llarga'}` : '';
    const capes = sh.map((k, i) => `${SHELL_NAMES[i]} ${k}`).join(' · ');
    return `<div class="bohr">
      <svg viewBox="0 0 ${S} ${S}" role="img" aria-label="Model de Bohr de ${esc(nameOf(el))}: ${Z} protons, ${N === null ? '' : N + ' neutrons, '}${Z} electrons en capes ${esc(capes)}">${orbits}${nuc}${dots}</svg>
      <div class="bohr-info">
        <p class="decay-title">Estructura de l'àtom (model de Bohr)</p>
        <ul class="particles">
          <li><b class="pp"></b>${Z} protons</li>
          ${N === null ? '' : `<li><b class="pn"></b>${N} neutrons</li>`}
          <li><b class="pe"></b>${Z} electrons</li>
        </ul>
        ${iso ? `<p class="decay-text">Isòtop representat: ${esc(iso)}. Nombre màssic A = ${A} (protons + neutrons).</p>` : ''}
        <p class="decay-text"><strong>Capes:</strong> ${esc(capes)}${isPredicted(el) ? ' (predites)' : ''}.</p>
        <p class="decay-text">Capa externa (${SHELL_NAMES[n - 1]}): <strong>${sh[n - 1]} electrons</strong>, en taronja${val.valenceE(el) === null ? '. En els metalls de transició i de transició interna, també hi poden intervenir electrons de capes anteriors' : ''}.</p>
        <p class="bohr-note">El model de Bohr (1913) és una simplificació: els electrons no giren en òrbites fixes, sinó que ocupen orbitals (vegeu la configuració electrònica). El nucli no està a escala: és unes 100.000 vegades més petit que l'àtom.</p>
      </div></div>`;
  }

  /* cel·la unitat en perspectiva (cc, ccc, hc i diamant) */
  function crystalHTML(el) {
    const c = val.crystal(el);
    if (!c || !CRYSTAL_INFO[c[0]]) return '';
    const k = c[0], info = CRYSTAL_INFO[k];
    let pts = [], edges = [];
    const cube = [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1], [0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]];
    if (k === 'hc') {
      const h = 1.63, hex = y => Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3), y, Math.sin(i * Math.PI / 3)]);
      const lo = hex(0), hi = hex(h);
      pts = [...lo, ...hi, [0, 0, 0], [0, h, 0]].map(p => [...p, 'a']);
      [30, 150, 270].forEach(d => pts.push([Math.cos(d * Math.PI / 180) / Math.sqrt(3), h / 2, Math.sin(d * Math.PI / 180) / Math.sqrt(3), 'b']));
      for (let i = 0; i < 6; i++) edges.push([lo[i], lo[(i + 1) % 6]], [hi[i], hi[(i + 1) % 6]], [lo[i], hi[i]]);
    } else {
      pts = cube.map(p => [...p, 'a']);
      [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([i, j]) => edges.push([cube[i], cube[j]]));
      if (k === 'cc') pts.push([0.5, 0.5, 0.5, 'b']);
      if (k === 'ccc' || k === 'diamant') [[0.5, 0.5, 0], [0.5, 0.5, 1], [0.5, 0, 0.5], [0.5, 1, 0.5], [0, 0.5, 0.5], [1, 0.5, 0.5]].forEach(p => pts.push([...p, k === 'ccc' ? 'b' : 'a']));
      if (k === 'diamant') [[0.25, 0.25, 0.25], [0.75, 0.75, 0.25], [0.75, 0.25, 0.75], [0.25, 0.75, 0.75]].forEach(p => pts.push([...p, 'b']));
    }
    // projecció: centrat, rotació lleugera i perspectiva isomètrica
    const off = k === 'hc' ? [0, 0.815, 0] : [0.5, 0.5, 0.5], S = k === 'hc' ? 52 : 74;
    const ca = Math.cos(0.55), sa = Math.sin(0.55);
    const pr = ([x, y, z]) => { x -= off[0]; y -= off[1]; z -= off[2]; const xr = x * ca - z * sa, zr = x * sa + z * ca; return [80 + xr * S, 80 - y * S + zr * S * 0.38, zr]; };
    const lines = edges.map(([a, b]) => { const p = pr(a), q = pr(b); return `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}"/>`; }).join('');
    const atoms = pts.map(p => [pr(p), p[3]]).sort((a, b) => b[0][2] - a[0][2])
      .map(([p, t]) => `<circle class="${t === 'b' ? 'atom b' : 'atom'}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(k === 'hc' ? 7.5 : 9) * (1 - p[2] * 0.12)}"/>`).join('');
    return `<div class="bohr crystal-box">
      <svg viewBox="0 0 160 160" role="img" aria-label="Cel·la unitat: ${esc(crystalText(el))}"><g class="cell-edges">${lines}</g>${atoms}</svg>
      <div class="bohr-info">
        <p class="decay-title">Estructura cristal·lina: ${esc(crystalText(el).toLowerCase())}</p>
        <p class="decay-text">${esc(info.t)}</p>
        <p class="decay-text">Cada àtom toca <strong>${info.n} àtoms veïns</strong>, i els àtoms ocupen el <strong>${info.pct} %</strong> de l'espai; la resta és buit.</p>
        <p class="bohr-note">Dibuix de la cel·la unitat, el bloc mínim que, repetit en totes direccions, forma el cristall. Els àtoms s'han dibuixat més petits per veure'n la posició.</p>
      </div></div>`;
  }

  /* corba de desintegració: quantitat que queda al cap de 1, 2, 3 i 4 períodes */
  function decayHTML(el) {
    const T = val.halfLife(el);
    const ctx = (D.semividaContext || {})[el.symbol];
    if (T === null) return ctx && el.symbol !== 'Bi' ? `<p class="fitxa-note">${esc(ctx)}</p>` : '';
    const W = 440, H = 150, L = 46, R = 14, TOP = 12, B = 30;
    const x = k => L + (W - L - R) * k / 4, y = p => TOP + (H - TOP - B) * (1 - p / 100);
    let path = '';
    for (let i = 0; i <= 80; i++) { const k = i / 20; path += (i ? 'L' : 'M') + x(k).toFixed(1) + ' ' + y(100 * Math.pow(2, -k)).toFixed(1); }
    const pct = ['100 %', '50 %', '25 %', '12,5 %', '6,25 %'];
    let guides = '', labels = '';
    for (let k = 0; k <= 4; k++) {
      const p = 100 / Math.pow(2, k);
      if (k > 0) guides += `<path class="guide" d="M${x(k)} ${y(0)}V${y(p)}H${L}"/><circle class="dot" cx="${x(k)}" cy="${y(p)}" r="3.5"/>`;
      labels += `<text x="${x(k)}" y="${H - 10}" text-anchor="${k === 4 ? 'end' : k === 0 ? 'start' : 'middle'}">${k ? esc(fmtDur(T * k)) : '0'}</text>`;
      if (k < 4) labels += `<text x="${L - 6}" y="${y(p) + 4}" text-anchor="end">${pct[k]}</text>`;
    }
    const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Corba de desintegració de ${esc(isotopeOf(el))}: la quantitat es redueix a la meitat cada ${esc(fmtDur(T, true))}">
      <path class="axis" d="M${L} ${TOP}V${y(0)}H${W - R}"/>${guides}<path class="curve" d="${path}"/>${labels}</svg>`;
    return `<div class="decay">
      <p class="decay-title">Com es desintegra ${esc(isoName(el))} (${esc(isotopeOf(el))})</p>
      <p class="decay-text">Cada <strong>${esc(fmtDur(T, true))}</strong>, la quantitat es redueix a la meitat: de cada 100 àtoms, al cap d'un període en queden 50; al cap de dos, 25; al cap de tres, uns 12.</p>
      ${svg}
      ${ctx ? `<p class="decay-text">${esc(ctx)}</p>` : ''}</div>`;
  }

  function showElement(el) {
    const m = MODES[state.mode];
    const st = cellState(el, m, m.kind === 'num' ? buildScale(m.value, m.log) : null);
    const rows = fitxaRows(el).map(([k, v, mode, isHTML, wide, text]) =>
      `<div class="${[mode === state.mode && mode !== 'blank' ? 'current' : '', wide ? 'wide' : '', text ? 'textrow' : ''].join(' ').trim()}"><dt>${esc(k)}</dt><dd>${isHTML ? v : esc(v)}</dd></div>`).join('');
    const note = (D.notes || {})[el.symbol];
    const disc = val.discoverer(el);
    const y = val.year(el);
    const html = `
      <div class="fitxa-head">
        <div class="fitxa-tile"><span class="z">${el.number}</span><span class="s">${el.symbol}</span></div>
        <div><h2 id="modal-title">${esc(nameOf(el))}</h2>
          <div class="sub">${esc(FAMILY_LABEL[family(el)])}${isPredicted(el) ? ' · propietats predites' : ''}</div></div>
      </div>
      <dl class="fitxa-props">${rows}</dl>
      ${note ? `<p class="fitxa-note">${esc(note)}</p>` : ''}
      ${state.mode === 'crystal' ? crystalHTML(el) + bohrHTML(el) : bohrHTML(el) + crystalHTML(el)}
      ${decayHTML(el)}
      <p class="fitxa-summary">${esc(SUMMARIES[el.symbol] || '')}</p>
      ${disc ? `<p class="fitxa-disc"><strong>Descobriment:</strong> ${esc(disc)}${y !== null ? ' (' + esc(fmtYear(y)) + ')' : ''}.</p>` : ''}`;
    openModal(html, st.color);
  }

  /* ================= comparació ================= */
  const CMP_ROWS = [
    ['Nombre atòmic', el => el.number, v => String(v)],
    ['Massa atòmica (u)', el => el.atomic_mass, v => (Number.isInteger(v) ? `[${v}]` : fmtFixed(v, 2))],
    ['Electronegativitat', val.en, v => fmtFixed(v, 2)],
    ['1a energia d\'ionització (kJ/mol)', val.ion, v => String(Math.round(v))],
    ['Afinitat electrònica (kJ/mol)', val.ea, v => String(Math.round(v)), el => (val.eaRaw(el) !== null ? '≤ 0' : null)],
    ['Radi atòmic (pm)', val.radius, v => String(v)],
    ['Densitat (g/cm³)', val.density, v => fmtSig(v, 3)],
    ['Punt de fusió', val.melt, v => fmtTemp(v)],
    ['Punt d\'ebullició', val.boil, v => fmtTemp(v)],
    ['Conductivitat elèctrica (S/m)', val.sigma, v => fmtSig(v, 3)],
    ['Conductivitat tèrmica (W/m·K)', val.thermal, v => fmtSig(v, 3)],
    ['Escorça terrestre (%)', el => val.abund('escorca', el), v => fmtSig(v, 3)],
    ['Període de semidesintegració', val.halfSec, v => fmtDur(v, true), el => (halfCat(el) === 'estable' ? 'estable' : null)],
    ['Any de descobriment', val.year, v => fmtYear(v)]
  ];
  function showCompare(a, b) {
    const rows = CMP_ROWS.map(([label, f, fmt, alt]) => {
      const va = f(a), vb = f(b);
      const ok = x => typeof x === 'number';
      const hiA = ok(va) && ok(vb) && va > vb, hiB = ok(va) && ok(vb) && vb > va;
      const txt = (v, el) => (ok(v) ? esc(fmt(v)) : esc((alt && alt(el)) || '—'));
      return `<tr><td>${esc(label)}</td><td class="${hiA ? 'hi' : ''}">${txt(va, a)}</td><td class="${hiB ? 'hi' : ''}">${txt(vb, b)}</td></tr>`;
    }).join('');
    const extra = [['Família', el => FAMILY_LABEL[family(el)]], ['Estat a 25 °C', el => catLabel('state', el)], ['Estats d\'oxidació', el => (val.ox(el) ? fmtOx(val.ox(el)) : '—')],
      ['Electrons de valència', el => (val.valenceE(el) === null ? 'variables' : String(val.valenceE(el)))],
      ['Capes electròniques', el => val.shells(el).join(', ')],
      ['Origen còsmic', el => { const c = val.cosmic(el); return c ? COSMIC_LABEL[c[0]] : '—'; }],
      ['Isòtops estables', el => String(val.nIsotopes(el))],
      ['Estructura cristal·lina', crystalText],
      ['Preu aproximat', el => catLabel('price', el)],
      ['País del descobriment', el => { const c = val.country(el); return c ? (c[0] === 'antic' ? 'antiguitat' : countryName(c[0])) : '—'; }]]
      .map(([l, f]) => `<tr><td>${esc(l)}</td><td>${esc(f(a))}</td><td>${esc(f(b))}</td></tr>`).join('');
    openModal(`<h2 id="modal-title" style="margin:0 0 6px">Comparació</h2>
      <table class="cmp-table"><thead><tr><th></th><th>${esc(nameOf(a))} (${a.symbol})</th><th>${esc(nameOf(b))} (${b.symbol})</th></tr></thead>
      <tbody>${extra}${rows}</tbody></table>
      <p class="fitxa-disc">En negreta, el valor més alt de cada propietat. Densitat dels gasos convertida a g/cm³.</p>`);
  }
  function setCompare(on) {
    state.compare = on ? [] : null;
    document.getElementById('compare-btn').setAttribute('aria-pressed', String(on));
    if (on) setQuiz(false);
    paint();
  }

  /* ================= repte ================= */
  const QUIZ_PROPS = [
    { key: 'electronegativity', max: 'l\'electronegativitat més alta', min: 'l\'electronegativitat més baixa' },
    { key: 'ionization', max: 'la primera energia d\'ionització més alta', min: 'la primera energia d\'ionització més baixa' },
    { key: 'atomicRadius', max: 'el radi atòmic més gran', min: 'el radi atòmic més petit' },
    { key: 'meltPoint', max: 'el punt de fusió més alt', min: 'el punt de fusió més baix' },
    { key: 'density', max: 'la densitat més alta', min: 'la densitat més baixa' },
    { key: 'halfLife', max: 'el període de semidesintegració més llarg (dura més)', min: 'el període de semidesintegració més curt (dura menys)', radio: true }
  ];
  // conjunts d'elements radioactius per a les preguntes de semidesintegració
  const RADIO_SETS = [
    ['del període 7', e => e.period === 7 && e.ypos <= 7],
    ['dels actínids', e => e.ypos === 10],
    ['entre el poloni (84) i l’urani (92)', e => e.number >= 84 && e.number <= 92],
    ['entre l’urani (92) i el fermi (100)', e => e.number >= 92 && e.number <= 100]
  ];
  const MAIN_GROUPS = [1, 2, 13, 14, 15, 16, 17, 18];
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  /* endevinalla: pistes successives; cada error en descobreix una de nova */
  const GUESS_EXTRA = ['Pt', 'Au', 'Hg', 'Pb', 'U', 'Ra', 'Rn', 'W', 'Bi', 'Po', 'Pu', 'Ne'];
  function guessClues(el) {
    const c = [], cos = val.cosmic(el), y = val.year(el), v = val.valenceE(el), g = groupOf(el), n = val.nameOrigin(el);
    const ON = { bigbang: 'en el Big Bang', raigs: 'per l’acció dels raigs còsmics', petites: 'dins d’estrelles petites que moren', massives: 'en l’explosió d’estrelles massives', nanes: 'en l’explosió de nanes blanques', neutrons: 'en xocs d’estrelles de neutrons', desintegracio: 'per la desintegració de l’urani i el tori', laboratori: 'al laboratori' };
    c.push(`Els seus àtoms es van formar sobretot ${cos ? ON[cos[0]] : 'en un lloc desconegut'}. A 25 °C és ${catLabel('state', el).toLowerCase()}.`);
    c.push(`Família: ${FAMILY_LABEL[family(el)].toLowerCase()}.${v !== null ? ` Té ${v} electrons de valència.` : ''}`);
    const ct = val.country(el);
    c.push(y === null ? 'Data de descobriment desconeguda.' : y < 1600 ? 'Es coneix des de l\'antiguitat o l\'edat mitjana.' : `Es va descobrir l'any ${y}${ct && ct[0] !== 'antic' ? ' ' + countryIn(ct[0]) : ''}.`);
    c.push(`És al període ${el.period}${g ? ' i al grup ' + g : ''}.`);
    if (n) c.push(`El seu nom fa referència a: «${n[1]}».`);
    return c;
  }
  function newGuess(prev) {
    const pool = ELS.filter(e => e.number <= 56 || GUESS_EXTRA.includes(e.symbol));
    let el;
    do { el = rnd(pool); } while (prev && prev.answer === el.symbol);
    return {
      type: 'guess', answer: el.symbol, clues: guessClues(el), shown: 1, wrong: [],
      answered: false, found: false, picked: null, set: ELS.map(e => e.symbol),
      score: prev ? prev.score : 0, total: prev ? prev.total : 0
    };
  }
  function newQuestion(prev) {
    if (Math.random() < 0.35) return newGuess(prev);
    for (let tries = 0; tries < 200; tries++) {
      const p = rnd(QUIZ_PROPS), m = MODES[p.key];
      const byPeriod = Math.random() < 0.55;
      let set, where;
      if (p.radio) {
        const [w, f] = rnd(RADIO_SETS);
        set = ELS.filter(f);
        where = w;
      } else if (byPeriod) {
        const per = rnd([2, 3, 4, 5, 6]);
        set = ELS.filter(e => e.period === per && e.ypos <= 7 && MAIN_GROUPS.includes(groupOf(e)));
        where = `del període ${per}`;
      } else {
        const g = rnd([1, 2, 13, 14, 15, 16, 17]);
        set = ELS.filter(e => groupOf(e) === g && e.period <= 6);
        where = `del grup ${g}`;
      }
      set = set.filter(e => m.value(e) !== null);
      if (set.length < 3) continue;
      const want = Math.random() < 0.5 ? 'max' : 'min';
      const sorted = set.slice().sort((a, b) => m.value(a) - m.value(b));
      const ans = want === 'max' ? sorted[sorted.length - 1] : sorted[0];
      const runner = want === 'max' ? sorted[sorted.length - 2] : sorted[1];
      if (m.value(ans) === m.value(runner)) continue;
      const text = `Quin element ${where} té ${p[want]}?`;
      return {
        prop: { value: m.value, fmt: m.fmt, longFmt: m.longFmt || m.fmt, log: m.log, legendFmt: m.legendFmt, label: m.label },
        set: set.map(e => e.symbol), answer: ans.symbol, text,
        answered: false, picked: null,
        score: prev ? prev.score : 0, total: prev ? prev.total : 0
      };
    }
    return null;
  }
  const ROUND_LENGTH = 10;
  let round = null;

  function recordAnswer(q) {
    if (!q.answered) return;
    const guess = q.type === 'guess';
    round.answers.push({
      tipus: guess ? 'Endevinalla' : 'Tendència periòdica',
      pregunta: guess ? q.clues.slice(0, q.shown).join(' · ') : q.text,
      resposta: guess ? (q.found ? q.answer : q.wrong.at(-1)) : q.picked,
      correcta: q.answer,
      encert: guess ? q.found : q.picked === q.answer,
      errorsPrevis: guess ? [...q.wrong] : []
    });
    if (q.total === ROUND_LENGTH) {
      round.payload = {
        resultat_id: round.id,
        answers: round.answers,
        elapsedSeconds: Math.floor((Date.now() - round.started) / 1000)
      };
      void saveRound();
    }
  }

  async function saveRound() {
    const current = round;
    if (!current?.payload || current.saving || current.saved) return;
    current.saving = true;
    current.failed = false;
    current.message = 'Desant el resultat…';
    renderInfo();
    try {
      const bridge = window.parent.aulaCreActivaSaveTaulaPeriodicaResult;
      if (typeof bridge !== 'function') {
        current.message = 'Obre l’activitat des d’Aula CreActiva per desar els resultats.';
        return;
      }
      const response = await bridge(current.payload);
      if (response?.status !== 'success') throw new Error('Error de desament');
      current.saved = true;
      current.message = 'Resultat desat.';
    } catch {
      current.failed = true;
      current.message = 'No s’ha pogut desar el resultat. Torna-ho a provar.';
    } finally {
      current.saving = false;
      if (round === current) renderInfo();
    }
  }

  function setQuiz(on) {
    round = on ? {
      id: window.crypto?.randomUUID?.() || `taula-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      started: Date.now(), answers: []
    } : null;
    state.quiz = on ? (newQuestion(null) || newGuess(null)) : null;
    document.getElementById('quiz-btn').setAttribute('aria-pressed', String(!!state.quiz));
    if (on && state.compare) { state.compare = null; document.getElementById('compare-btn').setAttribute('aria-pressed', 'false'); }
    paint();
  }

  function onCellClick(el) {
    const q = state.quiz;
    if (q && q.type === 'guess') {
      if (q.answered || q.wrong.includes(el.symbol)) return;
      if (el.symbol === q.answer) { q.answered = true; q.found = true; q.total++; q.score++; }
      else {
        q.wrong.push(el.symbol);
        if (q.shown < q.clues.length) q.shown++;
        else { q.answered = true; q.total++; }
      }
      recordAnswer(q);
      paint();
      return;
    }
    if (q) {
      if (q.answered || !q.set.includes(el.symbol)) return;
      q.answered = true; q.picked = el.symbol; q.total++;
      if (el.symbol === q.answer) q.score++;
      recordAnswer(q);
      paint();
      return;
    }
    if (state.compare) {
      if (state.compare.includes(el.symbol)) state.compare = state.compare.filter(s => s !== el.symbol);
      else state.compare.push(el.symbol);
      if (state.compare.length === 2) {
        const [a, b] = state.compare.map(bySym);
        state.compare = [];
        paint();
        showCompare(a, b);
        return;
      }
      paint();
      return;
    }
    showElement(el);
  }

  /* ================= adaptació a la pantalla =================
     Com a Equacions: la interfície es pensa per a 1440 × 820 px útils. En
     pantalles d'ordinador més petites (p. ex. 1366 × 768, o escalat del 125 %)
     es redueix tota sencera (--ui-zoom). A més, la graella s'escala per omplir
     l'espai disponible sense retalls. En mòbils i tauletes, la barra es col·loca
     a dalt i la taula es pot desplaçar dins del seu marc. */
  const BASE_W = 1440, BASE_H = 820, MIN_ZOOM = 0.75, MOBILE_W = 900;
  const isMobile = () => window.innerWidth < MOBILE_W;

  function fitScale() {
    const w = window.innerWidth, h = window.innerHeight;
    let z = Math.min(1, w / BASE_W, h / BASE_H);
    z = Math.max(MIN_ZOOM, Math.floor(z * 20) / 20);
    if (isMobile() || root.classList.contains('projector')) z = 1;
    root.style.setProperty('--ui-zoom', String(z));
    placeFooter();
    fitGrid();
  }

  function placeFooter() {
    const footer = document.querySelector('.felip-app-footer');
    const target = isMobile() ? document.getElementById('app') : document.querySelector('.sidebar');
    if (footer && footer.parentElement !== target) target.appendChild(footer);
  }

  function fitGrid() {
    const vp = document.getElementById('grid-viewport');
    const scaler = document.getElementById('grid-scale');
    const gw = grid.offsetWidth, gh = grid.offsetHeight;
    if (!gw || !gh) return;
    let s;
    if (isMobile()) {
      s = Math.min(1, Math.max(0.5, (vp.clientWidth - 4) / gw));
    } else {
      const vw = vp.clientWidth - 12, vh = vp.clientHeight - 12;
      if (vw <= 0 || vh <= 0) return;
      s = Math.min(vw / gw, vh / gh, 1.5);
    }
    grid.style.transform = `scale(${s})`;
    scaler.style.width = (gw * s) + 'px';
    scaler.style.height = (gh * s) + 'px';
  }

  /* ================= tema i projector ================= */
  function initToggles() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const projBtn = document.getElementById('projector-btn');
    const syncTheme = () => themeBtn.setAttribute('aria-pressed', String(root.classList.contains('dark-mode')));
    themeBtn.addEventListener('click', () => {
      root.classList.toggle('dark-mode');
      store.set('theme', root.classList.contains('dark-mode') ? 'dark' : 'light');
      syncTheme();
    });
    syncTheme();
    if (store.get('projector', '0') === '1') root.classList.add('projector');
    projBtn.setAttribute('aria-pressed', String(root.classList.contains('projector')));
    projBtn.addEventListener('click', () => {
      root.classList.toggle('projector');
      const on = root.classList.contains('projector');
      store.set('projector', on ? '1' : '0');
      projBtn.setAttribute('aria-pressed', String(on));
      fitScale();
    });
  }

  /* ================= esdeveniments ================= */
  function initEvents() {
    document.getElementById('legend').addEventListener('click', e => {
      const b = e.target.closest('button[data-cat]');
      if (!b) return;
      state.focus = state.focus === b.dataset.cat ? null : b.dataset.cat;
      renderLegend();
      paint();
    });
    document.getElementById('mode-options').addEventListener('click', e => {
      const b = e.target.closest('button[data-temp]');
      if (!b) return;
      state.temp = b.dataset.temp;
      store.set('temp', state.temp);
      renderOptions(); renderLegend(); paint();
    });
    document.getElementById('mode-options').addEventListener('click', e => {
      if (e.target.closest('#play-btn')) togglePlay();
    });
    document.getElementById('mode-options').addEventListener('click', e => {
      const b = e.target.closest('button[data-tk]');
      if (!b) return;
      stopPlay();
      state.tempFix = Number(b.dataset.tk);
      state.tempPos = kToPos(state.tempFix);
      syncTimeline(); paint();
    });
    document.getElementById('mode-options').addEventListener('input', e => {
      if (e.target.id !== 'temp-range') return;
      stopPlay();
      state.tempPos = Number(e.target.value);
      state.tempFix = null;
      syncTimeline(); paint();
    });
    document.getElementById('mode-options').addEventListener('input', e => {
      if (e.target.id !== 'year-range') return;
      stopPlay(); syncTimeline();
      state.yearLimit = Number(e.target.value);
      document.getElementById('year-out').textContent = state.yearLimit >= 2010 ? 'avui' : state.yearLimit;
      paint();
    });
    grid.addEventListener('click', e => {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
        if (b.dataset.act === 'next' && state.quiz?.answered && state.quiz.total < ROUND_LENGTH) {
          state.quiz = newQuestion(state.quiz) || newGuess(state.quiz);
          paint();
        }
        if (b.dataset.act === 'retry-save') void saveRound();
        if (b.dataset.act === 'restart-quiz') setQuiz(true);
      if (b.dataset.act === 'quit') setQuiz(false);
      if (b.dataset.act === 'stopcmp') setCompare(false);
    });
    document.getElementById('compare-btn').addEventListener('click', () => setCompare(!state.compare));
    document.getElementById('quiz-btn').addEventListener('click', () => setQuiz(!state.quiz));

    const overlay = document.getElementById('modal-overlay');
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (!overlay.classList.contains('hidden')) closeModal();
        else if (state.quiz) setQuiz(false);
        else if (state.compare) setCompare(false);
      }
    });

    window.addEventListener('resize', fitScale);
    if ('ResizeObserver' in window) new ResizeObserver(() => fitGrid()).observe(document.getElementById('grid-viewport'));
  }

  /* ================= inici ================= */
  function main() {
    if (!ELS.length) {
      grid.textContent = 'No s\'han pogut carregar les dades (data/elements.js).';
      return;
    }
    buildSelect();
    createGrid();
    initToggles();
    initEvents();
    setMode(state.mode);
    fitScale();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main);
  else main();
})();

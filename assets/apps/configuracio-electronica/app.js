/* =========================================================
   Configuració electrònica — lògica de l'app
   Sense dependències. Tot es recalcula a partir de Z (nombre
   d'electrons de l'àtom neutre, 0–118).
   ========================================================= */
(function () {
  'use strict';

  /* ---------- dades dels elements ----------
     [símbol, nom, massa atòmica, família]. L'índex + 1 és Z.
     Famílies: am alcalins, ae alcalinoterris, tm transició, pt altres metalls,
     ml metal·loides, nm no metalls, ha halògens, ng gasos nobles,
     la lantànids, ac actínids, un propietats desconegudes. */
  const RAW = [
    ['H','Hidrogen',1.008,'nm'],['He','Heli',4.0026,'ng'],
    ['Li','Liti',6.94,'am'],['Be','Beril·li',9.0122,'ae'],['B','Bor',10.81,'ml'],['C','Carboni',12.011,'nm'],['N','Nitrogen',14.007,'nm'],['O','Oxigen',15.999,'nm'],['F','Fluor',18.998,'ha'],['Ne','Neó',20.18,'ng'],
    ['Na','Sodi',22.99,'am'],['Mg','Magnesi',24.305,'ae'],['Al','Alumini',26.982,'pt'],['Si','Silici',28.085,'ml'],['P','Fòsfor',30.974,'nm'],['S','Sofre',32.06,'nm'],['Cl','Clor',35.45,'ha'],['Ar','Argó',39.948,'ng'],
    ['K','Potassi',39.098,'am'],['Ca','Calci',40.078,'ae'],['Sc','Escandi',44.956,'tm'],['Ti','Titani',47.867,'tm'],['V','Vanadi',50.942,'tm'],['Cr','Crom',51.996,'tm'],['Mn','Manganès',54.938,'tm'],['Fe','Ferro',55.845,'tm'],['Co','Cobalt',58.933,'tm'],['Ni','Níquel',58.693,'tm'],['Cu','Coure',63.546,'tm'],['Zn','Zinc',65.38,'tm'],['Ga','Gal·li',69.723,'pt'],['Ge','Germani',72.63,'ml'],['As','Arsènic',74.922,'ml'],['Se','Seleni',78.971,'nm'],['Br','Brom',79.904,'ha'],['Kr','Criptó',83.798,'ng'],
    ['Rb','Rubidi',85.468,'am'],['Sr','Estronci',87.62,'ae'],['Y','Itri',88.906,'tm'],['Zr','Zirconi',91.224,'tm'],['Nb','Niobi',92.906,'tm'],['Mo','Molibdè',95.95,'tm'],['Tc','Tecneci',98,'tm'],['Ru','Ruteni',101.07,'tm'],['Rh','Rodi',102.91,'tm'],['Pd','Pal·ladi',106.42,'tm'],['Ag','Plata',107.87,'tm'],['Cd','Cadmi',112.41,'tm'],['In','Indi',114.82,'pt'],['Sn','Estany',118.71,'pt'],['Sb','Antimoni',121.76,'ml'],['Te','Tel·luri',127.6,'ml'],['I','Iode',126.9,'ha'],['Xe','Xenó',131.29,'ng'],
    ['Cs','Cesi',132.91,'am'],['Ba','Bari',137.33,'ae'],['La','Lantani',138.91,'la'],['Ce','Ceri',140.12,'la'],['Pr','Praseodimi',140.91,'la'],['Nd','Neodimi',144.24,'la'],['Pm','Prometi',145,'la'],['Sm','Samari',150.36,'la'],['Eu','Europi',151.96,'la'],['Gd','Gadolini',157.25,'la'],['Tb','Terbi',158.93,'la'],['Dy','Disprosi',162.5,'la'],['Ho','Holmi',164.93,'la'],['Er','Erbi',167.26,'la'],['Tm','Tuli',168.93,'la'],['Yb','Iterbi',173.05,'la'],['Lu','Luteci',174.97,'la'],
    ['Hf','Hafni',178.49,'tm'],['Ta','Tàntal',180.95,'tm'],['W','Wolframi',183.84,'tm'],['Re','Reni',186.21,'tm'],['Os','Osmi',190.23,'tm'],['Ir','Iridi',192.22,'tm'],['Pt','Platí',195.08,'tm'],['Au','Or',196.97,'tm'],['Hg','Mercuri',200.59,'tm'],['Tl','Tal·li',204.38,'pt'],['Pb','Plom',207.2,'pt'],['Bi','Bismut',208.98,'pt'],['Po','Poloni',209,'pt'],['At','Àstat',210,'ml'],['Rn','Radó',222,'ng'],
    ['Fr','Franci',223,'am'],['Ra','Radi',226,'ae'],['Ac','Actini',227,'ac'],['Th','Tori',232.04,'ac'],['Pa','Protoactini',231.04,'ac'],['U','Urani',238.03,'ac'],['Np','Neptuni',237,'ac'],['Pu','Plutoni',244,'ac'],['Am','Americi',243,'ac'],['Cm','Curi',247,'ac'],['Bk','Berkeli',247,'ac'],['Cf','Californi',251,'ac'],['Es','Einsteini',252,'ac'],['Fm','Fermi',257,'ac'],['Md','Mendelevi',258,'ac'],['No','Nobeli',259,'ac'],['Lr','Lawrenci',266,'ac'],
    ['Rf','Rutherfordi',267,'tm'],['Db','Dubni',268,'tm'],['Sg','Seaborgi',269,'tm'],['Bh','Bohri',270,'tm'],['Hs','Hassi',269,'tm'],['Mt','Meitneri',278,'un'],['Ds','Darmstadti',281,'un'],['Rg','Roentgeni',282,'un'],['Cn','Copernici',285,'un'],['Nh','Nihoni',286,'un'],['Fl','Flerovi',289,'un'],['Mc','Moscovi',290,'un'],['Lv','Livermori',293,'un'],['Ts','Tennes',294,'un'],['Og','Oganessó',294,'un']
  ];
  const FAMILY = {
    am:'Metalls alcalins', ae:'Metalls alcalinoterris', tm:'Metalls de transició', pt:'Altres metalls',
    ml:'Metal·loides', nm:'No metalls', ha:'Halògens', ng:'Gasos nobles',
    la:'Lantànids', ac:'Actínids', un:'Propietats desconegudes'
  };
  const BLOCK_NAME = { s:'bloc s', p:'bloc p', d:'bloc d', f:'bloc f' };
  const NOBLE = [2, 10, 18, 36, 54, 86, 118];
  const SHELL = ['K','L','M','N','O','P','Q'];

  /* Posició a la taula (forma de 18 columnes recomanada per la IUPAC:
     Lu i Lr al grup 3; La–Yb i Ac–No a les files del bloc f). */
  function position(z) {
    let period = 1; while (z > NOBLE[period - 1]) period++;
    const o = z - (period === 1 ? 0 : NOBLE[period - 2]);
    if (period === 1) return { period, group: z === 1 ? 1 : 18 };
    if (period <= 3) return { period, group: o <= 2 ? o : o + 10 };
    if (period <= 5) return { period, group: o };
    if (o <= 2) return { period, group: o };
    if (o <= 16) return { period, group: null, fcol: o + 1 }; // fila f, columnes 3–16
    return { period, group: o === 17 ? 3 : o - 14 };
  }
  const ELEMENTS = RAW.map((r, i) => Object.assign({ z: i + 1, sym: r[0], name: r[1], mass: r[2], fam: r[3] }, position(i + 1)));

  /* ---------- subnivells en ordre d'ompliment (Aufbau / Moeller) ---------- */
  const L = { s:0, p:1, d:2, f:3 };
  const AUFBAU = ['1s','2s','2p','3s','3p','4s','3d','4p','5s','4d','5p','6s','4f','5d','6p','7s','5f','6d','7p']
    .map((name, i) => { const t = name[1]; return { name, n: +name[0], t, l: L[t], boxes: 2 * L[t] + 1, cap: 2 * (2 * L[t] + 1), order: i + 1 }; });
  let acc = 0; AUFBAU.forEach(s => { s.start = acc; acc += s.cap; }); // electrons abans del subnivell

  function fill(z) { // { '1s':2, ... } segons l'ordre d'ompliment
    const c = {}; let left = z;
    for (const s of AUFBAU) { const k = Math.min(left, s.cap); c[s.name] = k; left -= k; }
    return c;
  }
  function subOf(e) { // subnivell de l'electró número e (1..118)
    return AUFBAU.find(s => e > s.start && e <= s.start + s.cap) || null;
  }
  function blockOf(z) { const s = subOf(z); return s ? s.t : null; }

  /* Excepcions: configuració real (experimental, NIST) diferent de la teòrica */
  const EXC = {
    24:['[Ar] 3d5 4s1','half'], 29:['[Ar] 3d10 4s1','full'],
    41:['[Kr] 4d4 5s1','close'], 42:['[Kr] 4d5 5s1','half'], 44:['[Kr] 4d7 5s1','close'], 45:['[Kr] 4d8 5s1','close'],
    46:['[Kr] 4d10','full'], 47:['[Kr] 4d10 5s1','full'],
    57:['[Xe] 5d1 6s2','close'], 58:['[Xe] 4f1 5d1 6s2','close'], 64:['[Xe] 4f7 5d1 6s2','halfF'],
    78:['[Xe] 4f14 5d9 6s1','close'], 79:['[Xe] 4f14 5d10 6s1','full'],
    89:['[Rn] 6d1 7s2','close'], 90:['[Rn] 6d2 7s2','close'], 91:['[Rn] 5f2 6d1 7s2','close'],
    92:['[Rn] 5f3 6d1 7s2','close'], 93:['[Rn] 5f4 6d1 7s2','close'], 96:['[Rn] 5f7 6d1 7s2','halfF'],
    103:['[Rn] 5f14 7s2 7p1','close']
  };
  const EXC_WHY = {
    half:'Un electró s passa al subnivell d, que queda <b>semiple</b> (5 electrons desaparellats): és més estable.',
    full:'Un electró s passa al subnivell d, que queda <b>ple</b> (10 electrons): és més estable.',
    halfF:'El subnivell f es manté <b>semiple</b> (7 electrons) i l\'electró següent va al subnivell d.',
    close:'Els subnivells implicats tenen energies <b>molt properes</b>.'
  };

  /* ---------- estat ---------- */
  const root = document.documentElement;
  let Z = 0, prevZ = 0;
  let mode = 'block';
  try { if (localStorage.getItem('confe:mode') === 'family') mode = 'family'; } catch (e) { }

  const $ = id => document.getElementById(id);
  const sup = n => '<sup>' + n + '</sup>';
  const fmtMass = m => Number.isInteger(m) ? '(' + m + ')' : String(m).replace('.', ',');
  const colorOf = el => mode === 'block' ? 'var(--' + blockOf(el.z) + '-bg)' : 'var(--' + el.fam + ')';

  function setZ(z) {
    z = Math.max(0, Math.min(118, z));
    if (z === Z) return;
    prevZ = Z; Z = z;
    render();
  }

  /* ---------- taula periòdica ---------- */
  const cells = [];
  const axG = [], axP = [];
  function buildTable() {
    const t = $('ptable');
    const frag = document.createDocumentFragment();
    for (let g = 1; g <= 18; g++) {
      const d = document.createElement('div'); d.className = 'ax'; d.textContent = g;
      d.style.gridColumn = g + 1; d.style.gridRow = 1; frag.appendChild(d); axG[g] = d;
    }
    for (let p = 1; p <= 7; p++) {
      const d = document.createElement('div'); d.className = 'ax'; d.textContent = p;
      d.style.gridColumn = 1; d.style.gridRow = p + 1; frag.appendChild(d); axP[p] = d;
    }
    [['Lantànids', 10], ['Actínids', 11]].forEach(([txt, row]) => {
      const d = document.createElement('div'); d.className = 'fl'; d.textContent = txt; d.style.gridRow = row; frag.appendChild(d);
    });
    ELEMENTS.forEach(el => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'el';
      b.innerHTML = '<span class="z">' + el.z + '</span><span class="sy">' + el.sym + '</span>';
      b.title = el.z + ' · ' + el.name;
      b.setAttribute('aria-label', el.name + ', nombre atòmic ' + el.z);
      if (el.group) { b.style.gridColumn = el.group + 1; b.style.gridRow = el.period + 1; }
      else { b.style.gridColumn = el.fcol + 1; b.style.gridRow = el.period === 6 ? 10 : 11; }
      b.addEventListener('click', () => setZ(el.z));
      frag.appendChild(b); cells[el.z] = b;
    });
    t.appendChild(frag);
  }

  function paintTable() {
    ELEMENTS.forEach(el => cells[el.z].style.setProperty('--c', colorOf(el)));
    const lg = $('legend');
    if (mode === 'block') {
      lg.className = 'legend blocks';
      lg.innerHTML = ['s', 'p', 'd', 'f'].map(b => '<span><i style="--c:var(--' + b + '-bg)"></i><b class="c-' + b + '">' + b + '</b> ' +
        { s:'(grups 1–2 i He)', p:'(grups 13–18)', d:'(grups 3–12)', f:'(lantànids i actínids)' }[b] + '</span>').join('') +
        '<span style="flex-basis:100%;justify-content:center">El bloc indica el subnivell on entra l\'últim electró.</span>';
    } else {
      lg.className = 'legend';
      lg.innerHTML = Object.keys(FAMILY).map(k => '<span><i style="--c:var(--' + k + ')"></i>' + FAMILY[k] + '</span>').join('');
    }
    document.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.mode === mode)));
  }

  function markTable() {
    cells.forEach((c, z) => c && c.classList.toggle('sel', z === Z));
    axG.forEach((d, g) => d && d.classList.remove('on'));
    axP.forEach((d, p) => d && d.classList.remove('on'));
    if (Z) {
      const el = ELEMENTS[Z - 1];
      if (el.group) axG[el.group].classList.add('on');
      axP[el.period].classList.add('on');
    }
  }

  /* ---------- diagrama d'orbitals ---------- */
  const halves = {}; // 'electró' -> element
  function buildOrbitals() {
    const o = $('orbitals');
    let html = '';
    ['s', 'p', 'd', 'f'].forEach((t, i) => {
      html += '<div class="oh" style="grid-column:' + (i + 1) + ';grid-row:1"><b class="c-' + t + '">' + t + '</b>' +
        (2 * L[t] + 1) + (t === 's' ? ' orbital' : ' orbitals') + ' · ' + 2 * (2 * L[t] + 1) + ' e⁻</div>';
    });
    AUFBAU.forEach(s => {
      html += '<div class="sub" id="sub-' + s.name + '" style="grid-column:' + (s.l + 1) + ';grid-row:' + (s.n + 1) + '">' +
        '<span class="lbl c-' + s.t + '">' + s.name + '<sup></sup></span><div class="boxes">';
      for (let b = 0; b < s.boxes; b++) {
        const up = s.start + b + 1, dn = s.start + s.boxes + b + 1;
        html += '<div class="box">' +
          '<button type="button" class="half" data-e="' + up + '" title="Fins a l\'electró ' + up + '" aria-label="' + s.name + ', orbital ' + (b + 1) + ', electró amunt: fins a l\'electró ' + up + '"></button>' +
          '<button type="button" class="half" data-e="' + dn + '" title="Fins a l\'electró ' + dn + '" aria-label="' + s.name + ', orbital ' + (b + 1) + ', electró avall: fins a l\'electró ' + dn + '"></button></div>';
      }
      html += '</div></div>';
    });
    o.innerHTML = html;
    o.querySelectorAll('.half').forEach(h => {
      const e = +h.dataset.e;
      if (e > 118) { h.disabled = true; h.style.cursor = 'default'; h.title = ''; }
      halves[e] = h;
    });
    o.addEventListener('click', ev => {
      const h = ev.target.closest('.half');
      if (h && !h.disabled) setZ(+h.dataset.e === Z ? Z - 1 : +h.dataset.e);
    });
  }

  function paintOrbitals() {
    const c = fill(Z);
    const cur = subOf(Z), nxt = Z < 118 ? subOf(Z + 1) : null;
    for (const e in halves) {
      const h = halves[e], n = +e, s = subOf(n) || AUFBAU[AUFBAU.length - 1];
      const isUp = (n - s.start) <= s.boxes;
      h.textContent = n <= Z ? (isUp ? '↑' : '↓') : '';
      h.className = 'half' + (n <= Z ? ' c-' + s.t : '') + (n === Z + 1 ? ' next' : '') + (n === Z ? ' last' : '') +
        (n === Z && Z > prevZ ? ' pop' : '');
    }
    AUFBAU.forEach(s => {
      const node = $('sub-' + s.name);
      node.querySelector('sup').textContent = c[s.name] ? c[s.name] : '';
      node.classList.toggle('cur', !!cur && cur.name === s.name);
    });
    $('next-hint').innerHTML = nxt ? '· el següent electró va al <b class="c-' + nxt.t + '">' + nxt.name + '</b>' : '· tots els subnivells coneguts plens';
  }

  /* ---------- diagrama de Moeller ---------- */
  const MX = 52, MY = 27, MW = 40, MH = 20, OX = 42, OY = 16;
  const mpos = s => ({ x: OX + s.l * MX, y: OY + (s.n - 1) * MY });
  function buildMoeller() {
    let g = '<defs><marker id="ah" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path class="hd" d="M0 0L8 4L0 8z"/></marker></defs>';
    for (let k = 1; k <= 8; k++) { // diagonal n + l = k
      const d = AUFBAU.filter(s => s.n + s.l === k);
      if (!d.length) continue;
      const a = mpos(d[0]), b = mpos(d[d.length - 1]);
      g += '<line class="ln" marker-end="url(#ah)" x1="' + (a.x + 26) + '" y1="' + (a.y - 14) + '" x2="' + (b.x - 31) + '" y2="' + (b.y + 16) + '"/>';
    }
    AUFBAU.forEach(s => {
      const p = mpos(s);
      g += '<g id="m-' + s.name + '"><rect x="' + (p.x - MW / 2) + '" y="' + (p.y - MH / 2) + '" width="' + MW + '" height="' + MH + '" rx="5"/>' +
        '<text x="' + p.x + '" y="' + (p.y + .5) + '">' + s.name + '</text></g>';
    });
    $('moeller').innerHTML = g;
  }
  function paintMoeller() {
    const c = fill(Z), cur = Z < 118 ? subOf(Z + 1) : null;
    AUFBAU.forEach(s => {
      const g = $('m-' + s.name), r = g.querySelector('rect'), k = c[s.name];
      const full = k === s.cap, part = k > 0 && !full;
      g.setAttribute('class', full ? 'full' : (cur && cur.name === s.name) || part ? 'cur' : '');
      r.style.fill = full ? 'var(--' + s.t + '-bg)' : part ? 'color-mix(in srgb, var(--' + s.t + '-bg) 45%, var(--card))' : '';
      r.style.stroke = (cur && cur.name === s.name) || part ? 'var(--' + s.t + ')' : '';
    });
  }

  /* ---------- fitxa de l'element ---------- */
  function paintElement() {
    const tile = $('tile'), facts = $('facts');
    if (!Z) {
      tile.className = 'tile empty'; tile.style.removeProperty('--c');
      tile.innerHTML = '<span class="sy">?</span>';
      facts.innerHTML = '<div class="name">Cap element</div><p class="msg">Encara no hi ha cap electró. Prem <b>+</b>, fes clic a la casella que brilla o tria un element de la taula.</p>';
      return;
    }
    const el = ELEMENTS[Z - 1], b = blockOf(Z), c = fill(Z);
    tile.className = 'tile'; tile.style.setProperty('--c', colorOf(el));
    tile.innerHTML = '<span class="z">' + Z + '</span><span class="sy">' + el.sym + '</span><span class="nm">' + el.name + '</span><span class="ms">' + fmtMass(el.mass) + ' u</span>';
    const nMax = Math.max(...AUFBAU.filter(s => c[s.name]).map(s => s.n));
    const val = AUFBAU.filter(s => s.n === nMax).reduce((a, s) => a + c[s.name], 0);
    facts.innerHTML =
      '<div class="name">' + el.name + '</div>' +
      '<dt>Protons i electrons</dt><dd>' + Z + '</dd>' +
      '<dt>Període · grup</dt><dd>' + el.period + ' · ' + (el.group ? el.group : '— (fila del bloc f)') + '</dd>' +
      '<dt>Bloc · família</dt><dd><span class="c-' + b + '">' + b + '</span> · ' + FAMILY[el.fam] + '</dd>' +
      '<dt>Capa de valència</dt><dd>n = ' + nMax + ' (' + SHELL[nMax - 1] + ') · ' + val + (val === 1 ? ' electró' : ' electrons') + '</dd>';
  }

  /* ---------- configuració ---------- */
  const term = (name, k) => '<span class="t c-' + name[1] + '">' + name + sup(k) + '</span>';
  function cfgHTML(c, skip) {
    return AUFBAU.filter(s => c[s.name] && s.start + s.cap > skip).map(s => term(s.name, c[s.name])).join(' ');
  }
  function coreOf(z) { let g = 0; NOBLE.forEach(n => { if (n < z) g = n; }); return g; }
  function parseReal(str) {
    return str.replace(/\[(\w+)\]/, '<span class="core">[$1]</span>').replace(/(\d)([spdf])(\d+)/g, (m, n, t, k) => term(n + t, k));
  }
  function paintConfig() {
    const box = $('config');
    if (!Z) {
      box.innerHTML = '<div class="cfg-row"><div class="k">Configuració electrònica</div><div class="v small" style="color:var(--muted)">Afegeix electrons per construir l\'àtom. Cada electró ocupa el subnivell lliure de menys energia.</div></div>';
      return;
    }
    const c = fill(Z), core = coreOf(Z), last = subOf(Z);
    const k = Z - last.start; // posició dins del subnivell
    const box_ = k <= last.boxes ? k - 1 : k - last.boxes - 1;
    const ml = box_ - last.l, ms = k <= last.boxes ? '+½' : '−½';
    const mlTxt = ml > 0 ? '+' + ml : ml < 0 ? '−' + (-ml) : '0';
    let html =
      '<div class="cfg-row"><div class="k">Configuració electrònica</div><div class="v">' + cfgHTML(c, 0) + '</div></div>' +
      '<div class="cfg-row"><div class="k">Abreujada (amb el gas noble anterior)</div><div class="v">' +
        (core ? '<span class="core">[' + ELEMENTS[core - 1].sym + ']</span> ' + cfgHTML(c, core) : '<span class="hint">No en té: no hi ha cap gas noble abans.</span>') + '</div></div>' +
      '<div class="cfg-row inline"><div class="k">Últim electró:</div><div class="v small qn">' + term(last.name, k) +
        ' &nbsp;n = ' + last.n + ', l = ' + last.l + ', m<sub>l</sub> = ' + mlTxt + ', m<sub>s</sub> = ' + ms + '</div></div>';
    if (EXC[Z]) {
      html += '<div class="note"><b>Excepció.</b> La configuració real és <span class="v">' + parseReal(EXC[Z][0]) + '</span>. ' + EXC_WHY[EXC[Z][1]] + '</div>';
    }
    box.innerHTML = html;
  }

  /* ---------- model de Bohr ---------- */
  function paintBohr() {
    const c = fill(Z), per = Array(7).fill(0);
    AUFBAU.forEach(s => { per[s.n - 1] += c[s.name]; });
    let shells = 0; per.forEach((k, i) => { if (k) shells = i + 1; });
    const cx = 150, cy = 150, r0 = 30, step = shells ? Math.min(26, (142 - r0) / shells) : 26;
    let g = '';
    for (let i = 0; i < shells; i++) {
      const r = r0 + step * (i + 1), val = i === shells - 1;
      g += '<circle class="orbit' + (val ? ' val' : '') + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';
      const n = per[i];
      // electró nou: l'últim de la capa on ha entrat
      const lastShell = Z > prevZ && Z ? subOf(Z).n - 1 : -1;
      for (let j = 0; j < n; j++) {
        const a = -Math.PI / 2 + (2 * Math.PI * j) / n;
        g += '<circle class="e' + (val ? ' val' : '') + (i === lastShell && j === n - 1 ? ' new' : '') +
          '" cx="' + (cx + r * Math.cos(a)).toFixed(1) + '" cy="' + (cy + r * Math.sin(a)).toFixed(1) + '" r="' + (n > 18 ? 3 : 3.8) + '"/>';
      }
    }
    g += '<circle class="nuc" cx="' + cx + '" cy="' + cy + '" r="' + (r0 - 4) + '"/>';
    if (Z) g += '<text class="nuc-t" x="' + cx + '" y="' + (cy - 4) + '">' + ELEMENTS[Z - 1].sym + '</text><text class="nuc-s" x="' + cx + '" y="' + (cy + 14) + '">' + Z + ' p⁺</text>';
    else g += '<text class="nuc-t" x="' + cx + '" y="' + cy + '">?</text>';
    $('bohr').innerHTML = g;
    $('bohr').setAttribute('aria-label', 'Model de Bohr: ' + (shells ? per.slice(0, shells).join(', ') + ' electrons per capa' : 'sense electrons'));
    $('shells').innerHTML = shells ? per.slice(0, shells).map((k, i) => '<span' + (i === shells - 1 ? ' class="val"' : '') + '>' + SHELL[i] + ' (n = ' + (i + 1) + '): ' + k + '</span>').join('') : '';
  }

  /* ---------- render ---------- */
  function render() {
    $('count').textContent = Z;
    $('btn-minus').disabled = Z <= 0;
    $('btn-plus').disabled = Z >= 118;
    $('btn-reset').disabled = Z === 0;
    markTable(); paintOrbitals(); paintMoeller(); paintElement(); paintConfig(); paintBohr();
  }

  /* ---------- adaptació a la pantalla ----------
     Com a Equacions: el disseny és per a 1440 × 800 px útils. En pantalles
     d'ordinador més petites (1366 × 768, escalat del 125 % o 150 %) es redueix
     tot uniformement; en pantalles grans i pissarres s'amplia fins a 1,4×.
     Per sota del zoom mínim, la pàgina es pot desplaçar verticalment.
     En mòbils i tauletes estretes (< 900 px) es passa a una sola columna. */
  const BASE_W = 1440, BASE_H = 800, MIN_ZOOM = 0.75, MAX_ZOOM = 1.4, COMPACT_W = 900;
  function fitScale() {
    const w = window.innerWidth, h = window.innerHeight;
    const compact = w < COMPACT_W;
    let z = Math.min(w / BASE_W, h / BASE_H);
    z = Math.floor(z * 20) / 20;
    z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
    if (compact) z = 1;
    root.classList.toggle('compact', compact);
    root.style.setProperty('--ui-zoom', String(z));
    // En mòbil, la llegenda surt de la taula (que es desplaça horitzontalment)
    const panel = document.querySelector('.table-panel');
    const target = compact ? document.querySelector('.card-table') : $('ptable');
    if (panel.parentElement !== target) target.insertBefore(panel, target.firstChild);
  }

  /* ---------- esdeveniments ---------- */
  function init() {
    buildTable(); buildOrbitals(); buildMoeller(); paintTable(); render();
    $('btn-plus').addEventListener('click', () => setZ(Z + 1));
    $('btn-minus').addEventListener('click', () => setZ(Z - 1));
    $('btn-reset').addEventListener('click', () => setZ(0));
    document.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {
      mode = b.dataset.mode; try { localStorage.setItem('confe:mode', mode); } catch (e) { }
      paintTable(); paintElement();
    }));
    $('btn-theme').addEventListener('click', () => {
      const dark = root.classList.toggle('dark');
      try { localStorage.setItem('confe:theme', dark ? 'dark' : 'light'); } catch (e) { }
    });
    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'ArrowRight' || e.key === '+' || e.key === '=' || e.key === 'ArrowUp') { setZ(Z + 1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === '-' || e.key === 'ArrowDown') { setZ(Z - 1); e.preventDefault(); }
      else if (e.key === 'Home') { setZ(0); e.preventDefault(); }
      else if (e.key === 'End') { setZ(118); e.preventDefault(); }
    });
    window.addEventListener('resize', fitScale);
    fitScale();
  }
  init();
})();

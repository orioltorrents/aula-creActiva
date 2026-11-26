// SPDX-License-Identifier: AGPL-3.0-or-later
/* Capítol 8 · El capital: societat anònima, banc i borsa, i concentració empresarial. */
(function () {
  const { svg, roda, persona, txt, retol, fletxa, tram } = RI;
  const fons = () => `<rect class="crema" x="-60" width="1320" height="720"/><path d="M-60 680H1260" stroke="#e5dcc8" stroke-width="40"/>`;
  const COLORS = ['#d9482b', '#2f7fb5', '#5b8c35', '#b9722a', '#7a4f9a'], ACC = [40, 25, 20, 10, 5];
  const fabr = (x, y, c, k) => `<g transform="translate(${x} ${y}) scale(${k || 1})"><path class="t" fill="${c}" d="M-52 0V-44l28 16V-44l28 16V-44l28 16V-94h14l4 94z"/><rect x="33" y="-94" width="18" height="6" fill="#2a2420"/><rect class="t2 vidre" x="-40" y="-22" width="14" height="14" rx="2"/><rect class="t2 vidre" x="-16" y="-22" width="14" height="14" rx="2"/><rect class="t2 vidre" x="8" y="-22" width="14" height="14" rx="2"/><rect x="-50" y="-4" width="102" height="4" fill="#2a2420" opacity=".25"/></g>`;
  const temple = (x, y, nom, c) => `<g transform="translate(${x} ${y})"><rect class="t" fill="${c || '#e9dfc8'}" x="-86" y="-110" width="172" height="96"/><path class="t" fill="${c || '#e9dfc8'}" d="M-96 -110L0 -164 96 -110Z"/><path d="M-76 -114L0 -154 76 -114Z" fill="#fffdf7" opacity=".45"/><rect class="t" fill="${c || '#e9dfc8'}" x="-88" y="-110" width="176" height="16"/>${[-66, -33, 0, 33, 66].map((d) => `<rect class="t blanc" x="${d - 7}" y="-94" width="14" height="78"/><path d="M${d - 3} -90v70M${d + 3} -90v70" stroke="#c8b99d" stroke-width="1"/>`).join('')}<path d="M-12 0v-30a12 12 0 0 1 24 0V0Z" fill="#5e432c" stroke="#2a2420" stroke-width="2"/><rect class="t" fill="${c || '#e9dfc8'}" x="-100" y="-16" width="200" height="10"/><rect class="t" fill="${c || '#e9dfc8'}" x="-106" y="-6" width="212" height="8"/><text x="0" y="-122" class="tx mig">${nom}</text></g>`;
  const moneda = (x, y, r) => `<g><circle class="t2 groc" cx="${x}" cy="${y}" r="${r || 9}"/><circle cx="${x}" cy="${y}" r="${(r || 9) * 0.58}" fill="none" stroke="#9e6e14" stroke-width="1.2"/></g>`;
  const cami = (d, c, v, fases, g) => `<path d="${d}" class="flux" stroke="${c}" stroke-width="${g || 11}" data-flux="${v}" data-en="${fases}"/>`;
  /* objectes que viatgen pel camí: monedes (diners) o petits títols (accions) */
  let nMon = 0;
  const titolMini = (c) => `<g><rect x="-13" y="-9" width="26" height="18" rx="3" fill="#fffdf7" stroke="#2a2420" stroke-width="1.6"/><rect x="-13" y="-9" width="26" height="6" fill="${c || '#7a4f9a'}"/></g>`;
  const viatge = (d, fases, n, cos) => { const id = 'mv' + nMon++; return `<g data-en="${fases}"><path id="${id}" d="${d}" fill="none" stroke="none"/>${Array.from({ length: n }, (_, i) => `<g class="mon" data-p="${id}" data-i="${i}" data-n="${n}">${cos}</g>`).join('')}</g>`; };
  const diners = (d, fases, n) => viatge(d, fases, n || 3, moneda(0, 0, 9));
  const accions = (d, fases, n) => viatge(d, fases, n || 2, titolMini());
  function mouViatges(g, t) {
    if (!g._mon) g._mon = Array.from(g.querySelectorAll('.mon')).map((n) => { const pa = g.querySelector('#' + n.dataset.p); return { n, pa, l: pa.getTotalLength(), i: +n.dataset.i, k: +n.dataset.n }; });
    g._mon.forEach((m) => { const f = (t * 0.32 + m.i / m.k) % 1, q = m.pa.getPointAtLength(f * m.l); m.n.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`); m.n.setAttribute('opacity', Math.min(1, f * 8, (1 - f) * 8).toFixed(2)); });
  }
  const lliures = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' £';

  /* ---------- 1 · societat anònima ---------- */
  function societat() {
    let s = fons();
    // inversors
    ACC.forEach((n, i) => {
      const y = 150 + i * 118;
      s += `<g data-part="inversors">${persona(84, y, 84, { color: COLORS[i], barret: i % 2 === 0 })}<g class="titol-acc" data-i="${i}" opacity="0"><rect class="t2" x="118" y="${y - 66}" width="78" height="44" rx="5" fill="#fffdf7"/><rect x="118" y="${y - 66}" width="78" height="12" fill="${COLORS[i]}"/><text x="157" y="${y - 38}" class="tx mig">${n}</text><text x="157" y="${y - 25}" class="tx-p mig">acc.</text></g></g>`;
      s += cami(`M204 ${y - 40}C320 ${y - 40} 330 400 440 400`, '#f2b632', 1.6, '2') + cami(`M440 420C330 420 320 ${y - 20} 204 ${y - 20}`, '#5b8c35', 1.6, '4');
      s += diners(`M204 ${y - 40}C320 ${y - 40} 330 400 440 400`, '2', 2) + accions(`M440 400C330 400 320 ${y - 40} 204 ${y - 40}`, '2', 1) + diners(`M440 420C330 420 320 ${y - 20} 204 ${y - 20}`, '4', 2);
    });
    s += `<text x="84" y="56" class="tx-g mig">Inversors</text>`;
    // l'empresa
    s += `<g data-part="empresa"><rect class="t" x="440" y="300" width="290" height="230" rx="14" fill="#fffdf7"/><rect x="440" y="300" width="290" height="48" rx="14" fill="#7a4f9a"/><rect x="440" y="330" width="290" height="18" fill="#7a4f9a"/><rect class="t nf" x="440" y="300" width="290" height="230" rx="14"/><text x="585" y="333" class="tx-b mig">Companyia del Ferrocarril, S.A.</text>
      <g id="graella">${Array.from({ length: 100 }, (_, i) => `<rect class="acc" x="${470 + (i % 20) * 11.5}" y="${366 + Math.floor(i / 20) * 14}" width="9.5" height="11" rx="2" fill="#d9cdb4"/>`).join('')}</g><text x="585" y="462" class="tx-p mig">100 accions de 1.000 £ (xifres il·lustratives)</text><text id="caixa" x="585" y="508" class="tx-g mig">caixa: 0 £</text></g>`;
    s += `<g data-en="0"><rect class="t" x="432" y="76" width="306" height="164" rx="14" fill="#fff6d6"/><text x="585" y="108" class="tx mig">Construir la línia costa…</text><rect class="t vermell" x="464" y="126" width="242" height="28" rx="5"/><text x="585" y="145" class="tx-p mig" style="fill:#fff">cost enorme: milions</text><text x="585" y="184" class="tx-p mig">…i la fortuna d’un sol burgès:</text><rect class="t groc" x="464" y="198" width="26" height="18" rx="4"/>${moneda(506, 207, 7)}${moneda(520, 207, 7)}</g>`;
    // el ferrocarril amb estació i viaducte d'arcs
    s += `<g data-part="negoci"><path class="t pedra" d="M846 470h346v62h-26v-36a18 18 0 0 0-36 0v36h-32v-36a18 18 0 0 0-36 0v36h-32v-36a18 18 0 0 0-36 0v36h-32v-36a18 18 0 0 0-36 0v36h-32v-36a18 18 0 0 0-36 0v36h-22z"/><rect class="t ferro" x="846" y="462" width="346" height="8"/>
      <g transform="translate(1134 462)"><rect class="t" x="-32" y="-54" width="64" height="54" fill="#e6cfa8"/><path class="t vermell" d="M-38-54l38-22 38 22z"/><rect class="t2 vidre" x="-22" y="-42" width="12" height="16"/><rect class="t2 vidre" x="10" y="-42" width="12" height="16"/><rect class="t2" x="-8" y="-28" width="16" height="28" fill="#5e432c"/><circle class="t2 blanc" cx="0" cy="-62" r="6"/><path d="M0-62v-4m0 4l3 2" stroke="#2a2420" stroke-width="1.5"/></g>
      <g id="trenet"><rect class="t" x="894" y="410" width="84" height="34" rx="8" fill="#f2c230"/><rect class="t2" x="894" y="390" width="24" height="22" fill="#d9482b"/><path class="t ferro2" d="M960 410v-38h14l4 38z"/><ellipse cx="967" cy="368" rx="9" ry="5" fill="#fffdf7" opacity=".75"/><rect class="t blau" x="988" y="414" width="52" height="30" rx="4"/><rect class="t blau" x="1048" y="414" width="52" height="30" rx="4"/>${roda(914, 450, 14, { raigs: 6, color: '#f2c230' })}${roda(956, 450, 14, { raigs: 6, color: '#f2c230' })}${roda(1002, 452, 10, { raigs: 4 })}${roda(1028, 452, 10, { raigs: 4 })}${roda(1062, 452, 10, { raigs: 4 })}${roda(1088, 452, 10, { raigs: 4 })}</g>
      <text x="1020" y="556" class="tx mig">vies, ponts, estacions, locomotores</text></g>`;
    s += cami('M730 380C800 380 820 400 880 400', '#f2b632', 1.6, '3') + cami('M880 440C820 440 800 460 730 460', '#5b8c35', 1.6, '3,4');
    s += diners('M730 380C800 380 820 400 880 400', '3', 2) + diners('M880 440C820 440 800 460 730 460', '3,4', 2);
    s += `<g data-en="3">${retol(805, 350, 'inversió', { fons: '#f2b632', color: '#2a2420', w: 100 })}${retol(805, 500, 'ingressos', { fons: '#5b8c35', w: 110 })}</g>`;
    s += `<g data-en="2">${retol(585, 264, 'diners a canvi d’accions', { fons: '#2a2420', w: 240 })}</g><g data-en="4">${retol(585, 264, 'dividends: qui té més accions, cobra més', { fons: '#5b8c35', w: 370 })}</g>`;
    s += `<g data-en="4"><rect class="t" x="800" y="582" width="390" height="96" rx="14" fill="#fff6d6"/><text x="995" y="616" class="tx mig">I si l’empresa fa fallida?</text><text x="995" y="642" class="tx-p mig">Cada soci només perd el que hi va posar:</text><text x="995" y="662" class="tx-p mig">és la responsabilitat limitada.</text></g>`;
    s += RI.innova(985, 52, 'INNOVACIÓ · accions petites + responsabilitat limitada', { apunta: [585, 300], halo: [585, 415, 130, 82], w: 420 });
    return svg(s);
  }
  function animaSoc({ p, t, k, el, svg: g }) {
    if (!g._acc) { g._acc = Array.from(g.querySelectorAll('.acc')); g._tit = Array.from(g.querySelectorAll('.titol-acc')); }
    const f = k < 2 ? 0 : k === 2 ? tram(p, 0.42, 0.58, 0, 1, true) : 1; let ac = 0;
    const propietari = (i) => { let s = 0; for (let j = 0; j < 5; j++) { s += ACC[j]; if (i < s) return j; } return 4; };
    g._acc.forEach((r, i) => r.setAttribute('fill', k >= 1 && i < f * 100 ? COLORS[propietari(i)] : '#d9cdb4'));
    el('graella').setAttribute('opacity', k >= 1 ? 1 : 0.25);
    g._tit.forEach((t) => t.setAttribute('opacity', k > 2 || (k === 2 && f > 0.3) ? 1 : 0));
    const caixa = k < 2 ? 0 : k === 2 ? Math.round(f * 100) : k === 3 ? Math.round(tram(p, 0.6, 0.8, 100, 20, true)) : Math.round(tram(p, 0.8, 1, 60, 30, true));
    el('caixa').textContent = 'caixa: ' + lliures(caixa * 1000); void ac;
    mouViatges(g, t);
    el('trenet').setAttribute('transform', `translate(${k >= 3 ? (Math.sin(p * 40) * 26).toFixed(1) : 0} 0)`);
  }

  /* ---------- 2 · banc i borsa ---------- */
  function banc() {
    let s = fons();
    s += `<text x="300" y="60" class="tx-g mig">El banc</text><text x="900" y="60" class="tx-g mig">La borsa</text><path d="M600 40V680" class="t1 nf" stroke-dasharray="4 8"/>`;
    s += RI.innova(300, 102, 'INNOVACIÓ · converteix estalvis petits en crèdit industrial', { w: 425 });
    s += RI.innova(900, 294, 'INNOVACIÓ · converteix accions en diners líquids al moment', { w: 435 });
    s += `<g data-part="estalviadors">${persona(60, 300, 80, { color: '#2f7fb5' })}${persona(60, 430, 80, { color: '#b9722a', barret: true })}${persona(60, 560, 80, { color: '#5b8c35' })}<text x="60" y="610" class="tx-p mig">estalviadors</text></g>`;
    s += `<g data-part="banc">${temple(300, 470, 'BANC')}</g>`;
    s += `<g data-part="empresari">${fabr(530, 300, '#a8452f', 0.9)}${persona(520, 420, 80, { color: '#7a4f9a', barret: true })}<text x="525" y="450" class="tx-p mig">empresari</text></g>`;
    s += cami('M90 260C160 260 180 380 220 400', '#f2b632', 1.5, '0') + cami('M90 390C140 390 170 410 210 420', '#f2b632', 1.5, '0') + cami('M90 520C150 520 170 450 210 440', '#f2b632', 1.5, '0');
    s += cami('M380 380C430 330 440 300 480 280', '#f2b632', 1.5, '1') + cami('M490 330C450 360 430 400 390 420', '#d9482b', 1.5, '1', 8);
    s += diners('M90 260C160 260 180 380 220 400', '0', 2) + diners('M90 390C140 390 170 410 210 420', '0', 2) + diners('M90 520C150 520 170 450 210 440', '0', 2) + diners('M380 380C430 330 440 300 480 280', '1', 2) + diners('M490 330C450 360 430 400 390 420', '1', 2);
    s += `<g data-en="0">${retol(170, 200, 'dipòsits', { fons: '#2a2420', w: 100 })}</g><g data-en="1">${retol(400, 250, 'préstec', { fons: '#f2b632', color: '#2a2420', w: 96 })}${retol(470, 500, 'el torna amb interès', { fons: '#d9482b', w: 200 })}</g>`;
    s += `<g data-part="borsa">${temple(900, 250, 'BORSA', '#d6ecf3')}</g>`;
    s += `<g data-part="compravenda">${persona(700, 420, 80, { color: '#d9482b', barret: true })}${persona(1100, 420, 80, { color: '#2f7fb5', barret: true })}<rect class="t2" x="738" y="346" width="56" height="38" rx="4" fill="#fffdf7"/><rect x="738" y="346" width="56" height="10" class="lila"/><text x="766" y="376" class="tx-p mig">acció</text>${moneda(1044, 368)}${moneda(1060, 362)}${moneda(1052, 378)}
      ${cami('M800 366H1020', '#7a4f9a', 1.5, '2', 8)}${cami('M1020 392H800', '#f2b632', 1.5, '2')}${accions('M800 366H1020', '2', 2)}${diners('M1020 392H800', '2', 3)}</g>`;
    s += `<g data-part="preu"><rect class="t" x="676" y="468" width="460" height="206" rx="14" fill="#fffdf7"/><path d="M710 640H1110M710 640V492" class="t2"/><path d="M710 590H1110M710 540H1110" stroke="#e5dcc8" stroke-width="1.5" stroke-dasharray="4 4"/><text x="720" y="488" class="tx-p">preu de l’acció</text><text x="1086" y="658" class="tx-p">temps</text>
      <path id="corba" d="M712 610L760 590 800 600 850 560 900 570 950 520 990 500 1020 530 1040 620 1070 600 1098 612" class="nf s-lila" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>
      <circle id="punta" r="7" fill="#7a4f9a" stroke="#fffdf7" stroke-width="2.5" opacity="0"/>
      <g data-fase="0.78-1">${retol(842, 508, 'eufòria: tothom compra', { fons: '#5b8c35', w: 196 })}</g>
      <g data-fase="0.88-1"><circle cx="990" cy="500" r="6" fill="#d9482b"/>${retol(980, 662, 'pànic: tothom ven', { fons: '#d9482b', w: 176 })}</g></g>`;
    return svg(s);
  }
  function animaBanc({ p, t, el, svg: g }) {
    const q = p < 0.72 ? 0 : tram(p, 0.72, 0.98, 0, 1, true), c = el('corba');
    c.setAttribute('stroke-dashoffset', (100 - q * 100).toFixed(1));
    const pt = c.getPointAtLength(q * (g._lc || (g._lc = c.getTotalLength()))), pu = el('punta');
    pu.setAttribute('cx', pt.x.toFixed(1)); pu.setAttribute('cy', pt.y.toFixed(1)); pu.setAttribute('opacity', p >= 0.72 ? 1 : 0);
    mouViatges(g, t);
  }

  /* ---------- 3 · concentració ---------- */
  function concentracio() {
    let s = fons();
    const marc = (x, nom, any, sub) => `<rect class="t" x="${x}" y="50" width="376" height="620" rx="18" fill="#fffdf7"/><text x="${x + 188}" y="96" class="tx-gg mig">${nom}</text><text x="${x + 188}" y="122" class="tx-p mig">${any}</text>${sub.map((l, i) => `<text x="${x + 188}" y="${570 + i * 26}" class="tx mig">${l}</text>`).join('')}`;
    s += RI.innova(600, 24, 'INNOVACIÓ EMPRESARIAL · de competir per preus a controlar el mercat', { w: 515 });
    // càrtel
    s += `<g data-part="cartel">${marc(10, 'Càrtel', 'acord entre empreses', ['Empreses independents', 'pacten preus i es reparteixen', 'el mercat per no competir'])}
      ${fabr(100, 310, '#d9482b')}${fabr(300, 310, '#2f7fb5')}${fabr(200, 480, '#5b8c35')}<path d="M150 284H250M130 326L180 398M270 326L220 398" class="t nf" stroke-dasharray="8 7"/>${retol(198, 236, 'preu pactat', { fons: '#2a2420', w: 130 })}${retol(198, 366, 'acord fràgil', { fons: '#fffdf7', color: '#2a2420', vora: '#2a2420', w: 118 })}</g>`;
    // trust
    s += `<g data-part="trust">${marc(412, 'Trust', 'fusió', ['Les empreses d’un sector', 's’uneixen en una de sola', 'que domina tot el mercat'])}
      <rect class="t" x="446" y="190" width="308" height="320" rx="20" fill="#f6dccf"/><path class="t nf" d="M520 320L600 410L680 320" stroke="#a8452f" stroke-width="5"/>${fabr(520, 320, '#d9482b')}${fabr(680, 320, '#d9482b')}${fabr(600, 480, '#d9482b')}${retol(600, 190, 'una sola direcció', { fons: '#d9482b', w: 180 })}${retol(600, 356, 'mateix propietari', { fons: '#a8452f', w: 164 })}</g>`;
    // holding
    s += `<g data-part="holding">${marc(814, 'Holding', 'control per accions', ['Una societat té la majoria', 'de les accions d’altres,', 'que conserven el seu nom'])}
      <rect class="t lila" x="922" y="168" width="160" height="72" rx="12"/><text x="1002" y="198" class="tx-b mig">societat</text><text x="1002" y="220" class="tx-b mig">matriu</text>
      <path d="M960 240L900 380M1002 240V380M1044 240L1104 380" class="t nf"/>${fabr(900, 476, '#b9722a', 0.8)}<g transform="translate(1002 476)">${temple(0, 0, '', '#2f7fb5').replace('transform="translate(0 0)"', 'transform="scale(.48)"')}</g><g transform="translate(1104 476)"><rect class="t" x="-36" y="-40" width="60" height="28" rx="6" fill="#5b8c35"/><path class="t ferro2" d="M12-40v-22h10v22z"/>${roda(-20, -6, 10, { raigs: 4 })}${roda(10, -6, 10, { raigs: 4 })}</g>
      ${retol(910, 320, '51 %', { fons: '#fffdf7', color: '#2a2420', vora: '#2a2420', w: 64 })}${retol(1002, 320, '51 %', { fons: '#fffdf7', color: '#2a2420', vora: '#2a2420', w: 64 })}${retol(1094, 320, '51 %', { fons: '#fffdf7', color: '#2a2420', vora: '#2a2420', w: 64 })}
      <text x="900" y="502" class="tx-p mig">fàbrica</text><text x="1002" y="502" class="tx-p mig">banc</text><text x="1104" y="502" class="tx-p mig">ferrocarril</text></g>`;
    return svg(s);
  }

  RI.capitol({
    id: 'capital', titol: 'El capital', llegenda: [['#f2b632', 'diners'], ['#5b8c35', 'beneficis'], ['#7a4f9a', 'accions']],
    escenes: [
      {
        id: 'societat', nom: 'La societat anònima', any: 'segle XIX', durada: 30,
        pregunta: 'Qui paga una fàbrica o un ferrocarril?',
        intro: 'Un taller el pot pagar una família. Una línia de tren, no: costa una fortuna que ningú té. La solució és <b>ajuntar els diners de molta gent</b>.',
        svg: societat, anima: animaSoc, innova: [1, 2],
        fases: [
          { fins: 0.2, nom: 'Cal molt capital', text: 'Vies, ponts, estacions, locomotores… El cost és moltíssimes vegades més gran que la fortuna d’un sol empresari.', focus: ['empresa'] },
          { fins: 0.4, nom: 'El capital es divideix en accions', text: 'Es crea una societat anònima (S.A.) i el seu capital es parteix en trossos iguals i petits: les <b>accions</b>.', focus: ['empresa'] },
          { fins: 0.6, nom: 'Cadascú en compra les que pot', text: 'Qui compra accions és propietari d’una part de l’empresa: els accionistes. No cal que hi treballin ni que es coneguin: per això és «anònima».', focus: ['inversors', 'empresa'] },
          { fins: 0.8, nom: 'L’empresa inverteix i ven', text: 'Amb els diners reunits es construeix la línia. Els bitllets i el transport de mercaderies donen ingressos.', focus: ['empresa', 'negoci'] },
          { fins: 1, nom: 'Es reparteixen els beneficis', text: 'El guany es reparteix en <b>dividends</b>, segons les accions de cadascú. Si va malament, es perd el que s’ha posat, però res més.', focus: ['inversors'] }
        ],
        parts: {
          inversors: { nom: 'Accionistes', text: 'Burgesos, comerciants, propietaris… El número és quantes accions té cadascú.' },
          empresa: { nom: 'Societat anònima', text: 'L’empresa. Decideix la junta d’accionistes: una acció, un vot. Qui té més accions, mana més.' },
          negoci: { nom: 'El negoci', text: 'Allò en què s’inverteix el capital i que ha de donar beneficis.' }
        },
        clau: 'La societat anònima reuneix el capital de molts i reparteix el risc: sense ella no hi hauria ferrocarrils ni grans fàbriques.',
        batx: { titol: 'Capitalisme industrial i financer', text: 'Al principi les fàbriques tèxtils es financen amb capital familiar i reinversió de beneficis. És el ferrocarril, cap al 1830-1850, el que generalitza la societat anònima i dona protagonisme a bancs i borses. A Espanya, la llei de ferrocarrils de 1855 atreu sobretot capital estranger.', font: 'https://xtec.gencat.cat/web/.content/curriculum/batxillerat/curriculum-171-2022/materies-de-modalitat/modalitat-humanitats-i-ciencies-socials/Historia-del-Mon-Contemporani.pdf', fontNom: 'Currículum d’Història del Món Contemporani' }
      },
      {
        id: 'banc', nom: 'El banc i la borsa', any: 'segle XIX', durada: 24,
        pregunta: 'On es troben els qui tenen diners i els qui en necessiten?',
        intro: 'Dues institucions fan d’intermediàries: el <b>banc</b> presta els estalvis d’uns a uns altres, i la <b>borsa</b> és el mercat on es compren i venen accions.',
        svg: banc, anima: animaBanc, llegenda: false,
        fases: [
          { fins: 0.25, nom: 'El banc reuneix estalvis', text: 'Molta gent hi deixa petites quantitats. Juntes fan un capital gran.', focus: ['estalviadors', 'banc'] },
          { fins: 0.5, nom: 'I els presta a canvi d’interès', text: 'L’empresari rep un préstec per comprar màquines i el torna amb un afegit: l’interès. D’aquí surt el guany del banc.', focus: ['banc', 'empresari'] },
          { fins: 0.72, nom: 'A la borsa es venen accions', text: 'Qui vol recuperar els diners ven les seves accions a algú altre. L’empresa no torna res: només canvia el propietari.', focus: ['borsa', 'compravenda'] },
          { fins: 1, nom: 'El preu puja i baixa', text: 'Si molta gent vol comprar, el preu puja; si tothom vol vendre, s’enfonsa. Quan passa de cop, hi ha una crisi.', focus: ['preu'] }
        ],
        parts: {
          estalviadors: { nom: 'Estalviadors', text: 'Deixen els diners al banc i en reben un petit interès.' },
          banc: { nom: 'Banc', text: 'Guanya la diferència entre l’interès que cobra pels préstecs i el que paga pels dipòsits.' },
          empresari: { nom: 'Empresari', text: 'Demana crèdit per invertir en la seva fàbrica.' },
          borsa: { nom: 'Borsa', text: 'El mercat de les accions. Les més importants del segle XIX eren les de Londres i París.' },
          compravenda: { nom: 'Compra i venda', text: 'Qui compra una acció espera cobrar dividends o vendre-la més cara.' },
          preu: { nom: 'Cotització', text: 'El preu de l’acció a cada moment. Depèn de l’oferta i la demanda, i també dels rumors.' }
        },
        clau: 'El banc presta; la borsa posa preu. Tots dos fan circular el capital cap a la indústria.',
        batx: { titol: 'Les crisis del capitalisme', text: 'Són crisis noves: no falta menjar, sinó que sobra producció o esclata una bombolla. El 1873 el pànic comença a la borsa de Viena, s’estén per Europa i els Estats Units i obre una llarga depressió. Compara-les amb les crisis de subsistència de l’Antic Règim.', font: 'https://xtec.gencat.cat/web/.content/curriculum/batxillerat/curriculum-171-2022/materies-de-modalitat/modalitat-humanitats-i-ciencies-socials/Historia-del-Mon-Contemporani.pdf', fontNom: 'Currículum d’Història del Món Contemporani' }
      },
      {
        id: 'concentracio', nom: 'Càrtel, trust i holding', any: 'finals del segle XIX', durada: 18,
        model: 'Formes de concentració empresarial · Segona Revolució Industrial',
        pregunta: 'Com s’ho fan les empreses per no competir?',
        intro: 'Competir abaixa els preus i els beneficis. A finals del segle XIX les grans empreses busquen <b>controlar el mercat</b>. Hi ha tres maneres, i no són el mateix.',
        svg: concentracio, llegenda: false,
        fases: [
          { fins: 0.33, nom: 'Càrtel: un pacte', text: 'Diverses empreses del mateix sector acorden preus o es reparteixen les zones de venda. Continuen sent empreses separades. Molt habitual a Alemanya.', focus: ['cartel'] },
          { fins: 0.66, nom: 'Trust: una fusió', text: 'Les empreses s’uneixen sota una sola direcció i esdevenen un gegant que pot arribar al monopoli. L’exemple clàssic és la Standard Oil de Rockefeller (1882).', focus: ['trust'] },
          { fins: 1, nom: 'Holding: control per accions', text: 'Una societat no fabrica res: posseeix la majoria de les accions d’altres empreses, sovint de sectors diferents, i així les dirigeix totes.', focus: ['holding'] }
        ],
        parts: {
          cartel: { nom: 'Càrtel', text: 'Acord entre empreses independents. Si una el trenca, el pacte s’acaba.' },
          trust: { nom: 'Trust', text: 'Fusió d’empreses en una de sola. Elimina la competència dins del sector.' },
          holding: { nom: 'Holding', text: 'Societat que controla altres empreses perquè en té la majoria de les accions.' }
        },
        clau: 'Del capitalisme de moltes empreses petites al de pocs gegants: és el capitalisme monopolista.',
        batx: { titol: 'La reacció: lleis antimonopoli', text: 'Als Estats Units, la Sherman Act (1890) prohibeix els acords que restringeixen la competència, i el 1911 el Tribunal Suprem obliga a dividir la Standard Oil. Debat: la gran empresa abarateix per economies d’escala o encareix perquè no té rivals?', font: 'https://www.archives.gov/milestone-documents/sherman-anti-trust-act', fontNom: 'National Archives (EUA) · Sherman Anti-Trust Act' }
      }
    ],
    repte: [
      { q: 'Què és una acció?', o: ['Un préstec del banc', 'Una part petita del capital d’una empresa', 'El sou d’un obrer'], c: 1, e: 'Qui la compra és propietari d’una part de l’empresa.' },
      { q: 'Per què es van crear societats anònimes?', o: ['Per reunir el capital de molta gent', 'Per pagar menys els obrers', 'Per amagar el nom de l’amo'], c: 0, e: 'Cap fortuna individual podia pagar un ferrocarril.' },
      { q: 'Què és un dividend?', o: ['L’interès d’un préstec', 'La part del benefici que cobra cada accionista', 'El preu d’una acció'], c: 1, e: 'Es reparteix segons el nombre d’accions de cadascú.' },
      { q: 'Què vol dir «responsabilitat limitada»?', o: ['Que l’accionista només pot perdre el que hi va invertir', 'Que l’empresa no pot tenir pèrdues', 'Que només hi pot haver cinc socis'], c: 0, e: 'El risc queda limitat i per això més gent s’atreveix a invertir.' },
      { tipus: 'toca', esc: 'banc', part: 'borsa', p: 0.6, q: 'Toca el lloc on es compren i venen accions.', e: 'La borsa: el mercat de les accions, on el preu puja i baixa segons l’oferta i la demanda.' },
      { tipus: 'ordena', esc: 'societat', q: 'Ordena com funciona una societat anònima.', e: 'Cal molt capital → es divideix en accions → la gent les compra → l’empresa inverteix → es reparteixen dividends.' },
      { q: 'En què es diferencia un càrtel d’un trust?', o: ['El càrtel és un pacte entre empreses independents; el trust és una fusió', 'Són exactament el mateix', 'El trust és un banc'], c: 0, e: 'Al càrtel cada empresa continua existint; al trust en queda una de sola.' }
    ]
  });
})();

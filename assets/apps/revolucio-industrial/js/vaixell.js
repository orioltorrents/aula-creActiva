// SPDX-License-Identifier: AGPL-3.0-or-later
/* Capítol 7 · El vaixell de vapor: el Great Western, pales contra hèlix i la travessia de l'Atlàntic. */
(function () {
  const { svg, focs, roda, persona, nuvol, txt, retol, fletxa, tram, lerp } = RI;
  const S = { x: 670, y: 420 }, PIV = { x: 566, y: 545 }, MIG = 104, RC = 30, LB = 120;
  const INK = '#2e221a';
  const ones = (y, c, g) => `<path d="M-60 ${y}${Array.from({ length: 34 }, () => 'q10-7 20 0t20 0').join('')}" class="nf" stroke="${c || '#fff'}" stroke-width="${g || 2.200}" stroke-linecap="round"/>`;
  const pales = (cx, cy, r, n) => Array.from({ length: n }, (_, i) => { const a = (i * 2 * Math.PI) / n, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; return `<rect x="${(x - 5).toFixed(1)}" y="${(y - 16).toFixed(1)}" width="10" height="32" fill="url(#tx-fustac)" stroke="${INK}" stroke-width="1.300" transform="rotate(${((a * 180) / Math.PI + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }).join('');
  const mar = (y) => `<rect x="-60" y="${y}" width="1320" height="${720 - y}" fill="url(#g-mar)"/><path d="M-60 ${y + 40}h1320v${680 - y}h-1320z" fill="#0e3a5c" opacity=".18"/>`;
  const vela = (d) => `<path d="${d}" fill="#f4eedd"/><path d="${d}" fill="url(#sh-llum)" opacity=".8"/><path d="${d}" class="vora"/>`;

  /* ---------- 1 · el Great Western en tall ---------- */
  function western() {
    const { caixa, cami, cartell, figura, rodaR, brasa, reblons } = RI, T2 = RI.tub;
    let s = `<rect x="-60" y="0" width="1320" height="474" fill="url(#g-cel)"/><g filter="url(#f-suau)">${nuvol(900, 78, 1.5)}${nuvol(60, 128, 1.1)}</g>` + mar(470);
    s += ones(470, '#e6f5fc') + ones(525, '#a9d3ec', 1.600) + ones(605, '#8cc3e6', 1.600) + ones(672, '#76b5dc', 1.600);
    // pals, eixàrcia i veles auxiliars
    s += `<g data-part="veles">${[[168, 118], [468, 86], [842, 86], [990, 126]].map(([x, y]) => `${caixa(x - 5, y, 10, 380 - y, 'fusta-v', 'cil')}<path d="M${x} ${y + 12}L${x - 66} 366M${x} ${y + 12}L${x + 120} 366" stroke="${INK}" stroke-width="1.200" opacity=".5"/>${vela(`M${x + 8} ${y + 28}L${x + 114} ${y + 56}Q${x + 126} ${y + 125} ${x + 120} ${y + 188}L${x + 8} ${y + 198}Z`)}<path d="M${x + 42} ${y + 38}Q${x + 50} ${y + 120} ${x + 44} ${y + 194}M${x + 78} ${y + 47}Q${x + 88} ${y + 122} ${x + 82} ${y + 191}" stroke="#cfc6ad" stroke-width="1.200" fill="none"/>${T2(`M${x + 8} ${y + 28}L${x + 114} ${y + 56}M${x + 8} ${y + 198}L${x + 120} ${y + 188}`, 4.500, 'fusta')}`).join('')}<path d="M163 118v-32l52 12-52 12" fill="#c8402a" stroke="${INK}" stroke-width="1.400" stroke-linejoin="round"/>${T2('M1110 372L1204 334', 5, 'fusta')}<path d="M990 132L1200 335" stroke="${INK}" stroke-width="1.300" opacity=".5"/></g>`;
    // buc en secció: obra morta pintada, folre de coure sota l'aigua i interior de fusta
    s += cami('M84 372H1130Q1104 484 1038 580H170Q104 542 84 372Z', 'fustaf', 'pla', { tint: '#14181b', to: 0.62 });
    s += cami('M104 470H1096Q1078 528 1038 580H170Q122 544 104 470Z', 'coure', 'pla') + reblons(140, 478, 1070, 478, 40, 1.500);
    s += `<path d="M112 392H1092Q1072 474 1024 558H186Q130 520 112 392Z" fill="url(#tx-fustac)"/><path d="M112 392H1092Q1072 474 1024 558H186Q130 520 112 392Z" fill="#f4ead2" opacity=".55"/><path d="M112 392H1092Q1072 474 1024 558H186Q130 520 112 392Z" fill="url(#sh-pla)"/><path d="M112 392H1092Q1072 474 1024 558H186Q130 520 112 392Z" class="vora"/><path d="M260 558V578M380 558V578M500 558V578M620 558V578M740 558V578M860 558V578" stroke="#4a2b16" stroke-width="3" opacity=".5"/>`;
    s += cami('M84 480l-22 6 4 72 34-6z', 'fusta', 'llum') + caixa(80, 366, 1054, 14, 'fusta', 'tub', { rx: 5 });
    s += `<path d="M-40 470H92M1104 470H1240" stroke="#fffdf7" stroke-width="3" stroke-dasharray="10 7" opacity=".85"/>`;
    // interior: cabines, bodega, carboneres, calderes i xemeneia
    const cabina = (x, w, fin) => `<rect x="${x}" y="396" width="${w}" height="78" fill="#f1d3bc" stroke="${INK}" stroke-width="1.400"/><rect x="${x}" y="396" width="${w}" height="78" fill="url(#sh-pla)"/>${fin.map((fx) => `<rect x="${fx}" y="408" width="22" height="18" fill="#cfe6ef" stroke="${INK}" stroke-width="1.300"/>`).join('')}`;
    s += `<g data-part="cabines">${cabina(122, 92, [134, 170])}${figura(150, 474, 46, { camisa: '#6f5a7a', barret: false })}${figura(190, 474, 46, { camisa: '#4a5f7a' })}${cabina(810, 150, [824, 864, 904])}${figura(850, 474, 46, { camisa: '#8a6238', barret: false })}${figura(920, 474, 46, { camisa: '#5f7a4a' })}</g>`;
    s += `<g data-part="carrega">${caixa(820, 500, 40, 40, 'fustac', 'llum')}${caixa(864, 500, 40, 40, 'fustac', 'llum')}${caixa(842, 480, 40, 22, 'fustac', 'llum')}<ellipse cx="940" cy="520" rx="22" ry="20" fill="url(#tx-fusta)" stroke="${INK}" stroke-width="1.400"/><ellipse cx="940" cy="520" rx="22" ry="20" fill="url(#sh-bola)" opacity=".6"/><ellipse cx="985" cy="524" rx="18" ry="16" fill="url(#tx-fusta)" stroke="${INK}" stroke-width="1.400"/><path d="M820 520h84M842 490h40M928 503v34M952 503v34" stroke="#30353a" stroke-width="1.600"/></g>`;
    s += `<g data-part="carbonera"><path d="M222 556V430q36-22 72 0V556z" fill="url(#tx-carbo)" stroke="${INK}" stroke-width="1.500"/><path d="M196 556V490h26v66zM790 556V440q-18-10-36 0v116z" fill="url(#tx-carbo)" stroke="${INK}" stroke-width="1.500"/></g>`;
    s += `<g data-part="calderes">${caixa(302, 420, 140, 136, 'ferro', 'cil', { rx: 10 })}${reblons(310, 426, 434, 426, 10, 1.800, '#8c959c')}${reblons(310, 492, 434, 492, 10, 1.800, '#8c959c')}<rect x="312" y="432" width="120" height="54" rx="5" fill="url(#g-aiguat)" stroke="${INK}" stroke-width="1.200"/><path d="M312 446q8-5 16 0t16 0 16 0 16 0 16 0 16 0 16 0" fill="none" stroke="#fff" stroke-width="1.300"/><rect x="312" y="498" width="54" height="50" rx="4" fill="#1a110b"/><rect x="378" y="498" width="54" height="50" rx="4" fill="#1a110b"/>${brasa(339, 546, 44, 30, { n: 2 })}${brasa(405, 546, 44, 30, { n: 2 })}<g data-puf="350 444 0 -12 3 4 1.300" class="vap"></g><g data-puf="400 444 0 -12 3 4 1.600" class="vap"></g></g>`;
    s += `<g data-part="xemeneia"><path d="M352 420V170h40V420z" fill="#22262a"/><path d="M352 420V170h40V420z" fill="url(#sh-cil)"/><path d="M352 420V170h40V420z" class="vora"/><rect x="350" y="170" width="44" height="26" fill="#c8402a" stroke="${INK}" stroke-width="1.400"/><rect x="350" y="170" width="44" height="26" fill="url(#sh-cil)"/><path d="M352 246h40M352 320h40" stroke="#6d767d" stroke-width="2"/></g><g data-puf="372 160 -200 -80 7 18 2" class="fum boira"></g>`;
    s += T2('M442 440H476', 9, 'coure');
    // roda de pales (fora del buc) amb el seu tambor
    s += `<g data-part="roda"><g opacity=".55"><g id="vroda">${pales(S.x, S.y, 104, 12)}${rodaR(S.x, S.y, 112, { raigs: 12, gruix: 8, raig: 3.500, tex: 'ferro' })}<circle cx="${S.x}" cy="${S.y}" r="74" fill="none" stroke="${INK}" stroke-width="2.400"/></g></g><circle cx="${S.x}" cy="${S.y}" r="118" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="9 7" opacity=".7"/><path d="M548 380A122 122 0 0 1 792 380" fill="none" stroke="${INK}" stroke-width="8"/><path d="M548 380A122 122 0 0 1 792 380" fill="none" stroke="#b9834a" stroke-width="5"/>${cartell(S.x, 278, 'la roda és fora, a cada costat del buc', { fons: '#fffdf7', color: '#2a2420', w: 300 })}</g>`;
    // màquina de palanques laterals
    s += `<g data-part="maquina">${caixa(456, 548, 250, 12, 'fustaf', 'tub')}<rect x="476" y="436" width="40" height="80" fill="#3a2a18"/><rect id="vcam" x="476" y="436" width="40" height="40" fill="#f9a35e"/><path d="M468 428H524V524H468ZM476 436V516H516V436Z" fill="url(#tx-ferro)" fill-rule="evenodd"/><path d="M468 428H524V524H468ZM476 436V516H516V436Z" fill="url(#sh-cil)" fill-rule="evenodd"/><path d="M468 428H524V524H468ZM476 436V516H516V436Z" class="vora" fill-rule="evenodd"/>`;
    s += `<g id="vpist">${caixa(476, -5, 40, 10, 'ferro', 'tub')}${T2('M496 -72V0', 7, 'ferro')}${caixa(452, -78, 50, 9, 'ferro', 'tub', { rx: 3 })}</g><line id="vtija" x1="458" y1="400" x2="458" y2="545" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    s += `<g id="vpal"><path d="M${PIV.x - MIG - 8} ${PIV.y}L${PIV.x} ${PIV.y - 16}L${PIV.x + MIG + 8} ${PIV.y}L${PIV.x} ${PIV.y + 16}Z" fill="url(#tx-ferro)" stroke="${INK}" stroke-width="1.500" stroke-linejoin="round"/><path d="M${PIV.x - MIG - 8} ${PIV.y}L${PIV.x} ${PIV.y - 16}L${PIV.x + MIG + 8} ${PIV.y}Z" fill="#fff" opacity=".14"/></g><circle cx="${PIV.x}" cy="${PIV.y}" r="9" fill="url(#g-esf-llauto)" class="vora2"/>`;
    s += `<line id="vbiela" x1="670" y1="545" x2="670" y2="420" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><line id="vbiela2" x1="670" y1="545" x2="670" y2="420" stroke="#8d979e" stroke-width="9.500" stroke-linecap="round"/><line id="vman" x1="670" y1="420" x2="700" y2="420" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><circle cx="670" cy="420" r="13" fill="url(#g-esf-llauto)" class="vora2"/></g>`;
    s += `<g data-puf="600 474 -80 -10 5 9 0.900" class="vap boira" opacity=".85"></g>${fletxa('M1050 640H1186', '#fffdf7', 6)}<text x="1118" y="676" class="tx-b mig">avança</text><g data-en="2">${fletxa('M900 618H740', '#fffdf7', 6)}<text x="820" y="654" class="tx-b mig">les pales empenyen l’aigua enrere</text></g>`;
    return svg(s);
  }
  function animaWestern({ t, el }) {
    const th = t * 2.2, C = { x: S.x + RC * Math.cos(th), y: S.y + RC * Math.sin(th) };
    const ey = C.y + Math.sqrt(LB * LB - Math.pow(C.x - 670, 2)), fi = Math.asin((ey - PIV.y) / MIG), g = (fi * 180) / Math.PI;
    const E = { x: PIV.x + MIG * Math.cos(fi), y: PIV.y + MIG * Math.sin(fi) }, A = { x: PIV.x - MIG * Math.cos(fi), y: PIV.y - MIG * Math.sin(fi) };
    el('vroda').setAttribute('transform', `rotate(${(((th * 180) / Math.PI) % 360).toFixed(1)} ${S.x} ${S.y})`);
    el('vpal').setAttribute('transform', `rotate(${g.toFixed(2)} ${PIV.x} ${PIV.y})`);
    ['vbiela', 'vbiela2'].forEach((id) => { const l = el(id); l.setAttribute('x1', E.x.toFixed(1)); l.setAttribute('y1', E.y.toFixed(1)); l.setAttribute('x2', C.x.toFixed(1)); l.setAttribute('y2', C.y.toFixed(1)); });
    const m = el('vman'); m.setAttribute('x2', C.x.toFixed(1)); m.setAttribute('y2', C.y.toFixed(1));
    const yp = 476 + (A.y - PIV.y);
    el('vpist').setAttribute('transform', `translate(0 ${yp.toFixed(1)})`);
    const tj = el('vtija'); tj.setAttribute('x2', A.x.toFixed(1)); tj.setAttribute('y2', A.y.toFixed(1)); tj.setAttribute('y1', (yp - 74).toFixed(1));
    const puja = Math.cos(th) > 0;
    const c = el('vcam'); if (puja) { c.setAttribute('y', (yp + 5).toFixed(1)); c.setAttribute('height', Math.max(0, 516 - yp - 5).toFixed(1)); } else { c.setAttribute('y', 436); c.setAttribute('height', Math.max(0, yp - 5 - 436).toFixed(1)); }
  }

  /* ---------- 2 · pales contra hèlix ---------- */
  function prova() {
    const { caixa, cami, cartell, rodaR } = RI, T2 = RI.tub;
    let s = `<rect x="-60" y="0" width="1320" height="424" fill="url(#g-cel)"/><g filter="url(#f-suau)">${nuvol(200, 90, 1.4)}${nuvol(950, 120, 1.2)}</g>` + mar(420);
    const xem = (x) => `<path d="M${x} 342V230h34V342z" fill="#22262a"/><path d="M${x} 342V230h34V342z" fill="url(#sh-cil)"/><path d="M${x} 342V230h34V342z" class="vora"/><rect x="${x - 1}" y="230" width="36" height="16" fill="#c8402a" stroke="${INK}" stroke-width="1.300"/>`;
    s += `<g id="parella">`;
    // Rattler (hèlix), mira a l'esquerra
    s += `<g data-part="rattler">${cami('M110 350H560V440Q560 470 530 470H190Q130 440 110 350Z', 'fustaf', 'pla', { tint: '#14181b', to: 0.55 })}<path d="M124 420H560V440Q560 470 530 470H190Q150 452 124 420Z" fill="url(#tx-coure)" opacity=".9"/><path d="M118 372H560" stroke="#f4eedd" stroke-width="5"/>${caixa(104, 342, 460, 12, 'fusta', 'tub', { rx: 4 })}${xem(330)}${caixa(205, 150, 8, 192, 'fusta-v', 'cil')}${caixa(455, 170, 8, 172, 'fusta-v', 'cil')}${vela('M216 180l80 30v90l-80 12z')}`;
    s += `${T2('M560 448H600', 7, 'ferro')}<g id="helix"><ellipse cx="606" cy="424" rx="9" ry="24" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.400"/><ellipse cx="606" cy="472" rx="9" ry="24" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.400"/></g><circle cx="606" cy="448" r="7" fill="url(#g-esf-ferro)" class="vora2"/>${cartell(330, 300, 'RATTLER · hèlix', { fons: '#fffdf7', color: '#2a2420', w: 170 })}</g><g data-puf="347 222 60 -70 6 14 1.600" class="fum boira"></g>`;
    // Alecto (pales), mira a la dreta
    s += `<g data-part="alecto">${cami('M1090 350H640V440Q640 470 670 470H1010Q1070 440 1090 350Z', 'fustaf', 'pla', { tint: '#2a1c12', to: 0.4 })}<path d="M1076 420H640V440Q640 470 670 470H1010Q1050 452 1076 420Z" fill="url(#tx-coure)" opacity=".9"/><path d="M1082 372H640" stroke="#f4eedd" stroke-width="5"/>${caixa(636, 342, 460, 12, 'fusta', 'tub', { rx: 4 })}${xem(790)}${caixa(735, 170, 8, 172, 'fusta-v', 'cil')}${caixa(985, 150, 8, 192, 'fusta-v', 'cil')}${vela('M982 180l-80 30v90l80 12z')}`;
    s += `<g id="pales2">${pales(880, 400, 74, 10)}${rodaR(880, 400, 80, { raigs: 10, gruix: 7, raig: 3, tex: 'ferro' })}</g><path d="M792 342A90 90 0 0 1 968 342" fill="none" stroke="${INK}" stroke-width="8"/><path d="M792 342A90 90 0 0 1 968 342" fill="none" stroke="#b9834a" stroke-width="5"/>${cartell(880, 300, 'ALECTO · pales', { fons: '#fffdf7', color: '#2a2420', w: 160 })}</g><g data-puf="807 222 -60 -70 6 14 1.600" class="fum boira"></g>`;
    s += `<path d="M560 380Q600 392 640 380" fill="none" stroke="${INK}" stroke-width="5.500"/><path d="M560 380Q600 392 640 380" fill="none" stroke="#c7a36c" stroke-width="3" stroke-dasharray="5 2"/>`;
    s += `</g>`;
    s += `<rect x="-60" y="420" width="1320" height="300" fill="#2f7fb5" opacity=".34"/>${ones(420)}${ones(500, '#8cc3e6', 1.600)}${ones(590, '#76b5dc', 1.600)}`;
    s += `<g id="esc-h" opacity="0"><g data-puf="640 448 90 0 5 9 0.800" class="vap boira"></g></g><g id="esc-p" opacity="0"><g data-puf="850 440 -90 -10 5 9 0.800" class="vap boira"></g></g>`;
    s += `<g data-en="2">${fletxa('M560 560H300', '#fffdf7', 8)}<text x="430" y="600" class="tx-b mig">l’hèlix arrossega l’altre vaixell, popa endavant</text></g>`;
    s += `<g>${cartell(250, 660, 'sempre treballa sota l’aigua', { w: 270 })}${cartell(590, 660, 'les onades no la trenquen', { w: 250 })}${cartell(940, 660, 'deixa lliures els costats del buc', { w: 290 })}</g>`;
    return svg(s);
  }
  function animaProva({ p, t, k, el }) {
    const marxa = k >= 1, dx = k < 2 ? 0 : tram(p, 0.6, 1, 0, -230, true);
    el('parella').setAttribute('transform', `translate(${dx.toFixed(1)} ${(Math.sin(t * 1.4) * 3).toFixed(1)})`);
    el('esc-h').setAttribute('transform', `translate(${dx.toFixed(1)} 0)`); el('esc-p').setAttribute('transform', `translate(${dx.toFixed(1)} 0)`);
    el('esc-h').setAttribute('opacity', marxa ? 1 : 0); el('esc-p').setAttribute('opacity', marxa ? 1 : 0);
    if (marxa) { el('pales2').setAttribute('transform', `rotate(${((t * 150) % 360).toFixed(1)} 880 400)`); el('helix').setAttribute('transform', `translate(606 448) scale(1 ${Math.cos(t * 14).toFixed(2)}) translate(-606 -448)`); }
  }

  RI.capitol({
    id: 'vaixell', titol: 'El vaixell de vapor', llegenda: [['#f9a35e', 'vapor a pressió'], ['#2f7fb5', 'aigua']],
    escenes: [
      {
        id: 'western', nom: 'Per dins d’un vapor', any: '1838', qui: 'I. K. Brunel · SS Great Western', durada: 16,
        model: 'Vapor de pales Great Western (1838), secció simplificada · reconstrucció didàctica',
        pregunta: 'Com navegues sense esperar el vent?',
        intro: 'El <b>Great Western</b> va ser el primer vapor construït expressament per travessar l’Atlàntic. Per dins és una fàbrica flotant: carbó, calderes, màquina i dues rodes de pales.',
        svg: western, anima: animaWestern, innova: [1],
        fases: [
          { fins: 0.25, nom: 'Carbó a les calderes', text: 'Els fogoners alimenten el foc dia i nit. Les carboneres ocupen una gran part del vaixell: en un viatge se’n cremen centenars de tones.', focus: ['carbonera', 'calderes', 'xemeneia'] },
          { fins: 0.5, nom: 'El vapor mou la màquina', text: 'El vapor empeny el pistó amunt i avall. Unes palanques baixes, a banda i banda, passen el moviment a la biela sense ocupar alçada.', focus: ['maquina'] },
          { fins: 0.75, nom: 'L’eix fa girar les pales', text: 'La biela fa girar la manovella i l’eix, que travessa el buc. A cada costat hi ha una roda: les pales entren a l’aigua i l’empenyen enrere.', focus: ['maquina', 'roda'] },
          { fins: 1, nom: 'I les veles?', text: 'Encara hi són. Ajuden quan el vent és bo, estalvien carbó i són l’assegurança si la màquina s’espatlla.', focus: ['veles', 'cabines', 'carrega'] }
        ],
        parts: {
          calderes: { nom: 'Calderes', text: 'Quatre grans dipòsits de ferro plens d’aigua de mar. El foc els travessa per dins i produeix el vapor.' },
          carbonera: { nom: 'Carboneres', text: 'Els magatzems de carbó. Com més lluny vas, més carbó necessites i menys espai queda per a la càrrega.' },
          xemeneia: { nom: 'Xemeneia', text: 'Treu el fum de les calderes per sobre de la coberta i de les veles.' },
          maquina: { nom: 'Màquina de palanques laterals', text: 'Cilindre vertical, pistó, palanca i biela. És una màquina de balancí girada cap per avall perquè hi càpiga sota coberta.' },
          roda: { nom: 'Roda de pales', text: 'Com una roda hidràulica que funciona al revés: no és l’aigua qui la mou, és ella qui empeny l’aigua.' },
          veles: { nom: 'Pals i veles', text: 'Quatre pals amb veles auxiliars. Els vapors en van portar durant dècades.' },
          cabines: { nom: 'Cabines', text: 'Hi viatjaven uns 150 passatgers, amb saló i menjador. El bitllet era molt car.' },
          carrega: { nom: 'Bodega', text: 'Correu, mercaderies de valor i equipatges.' }
        },
        etiquetes: [['veles', 640, 130, 590, 180, 'Pals i veles'], ['xemeneia', 270, 230, 352, 260], ['calderes', 300, 626, 360, 540], ['carbonera', 120, 610, 240, 520, 'Carboneres'], ['maquina', 560, 612, 516, 552, 'Màquina'], ['roda', 930, 330, 778, 380, 'Roda de pales'], ['cabines', 1020, 330, 900, 410], ['carrega', 1090, 560, 990, 524, 'Bodega']],
        real: {
          img: 'img/real-western.webp',
          titol: 'El Great Western, pintat per Joseph Walter (c. 1838)',
          museu: 'Bristol Museums, Galleries and Archives',
          lic: 'Pintura d’època · domini públic · Wikimedia Commons'
        },
        clau: 'El vapor dona al mar el que el tren dona a la terra: horaris. El vaixell surt i arriba el dia previst.',
        batx: { titol: 'El problema del carbó', text: 'Molts científics deien que cap vapor podria carregar prou carbó per creuar l’oceà. Brunel va entendre que la capacitat creix amb el cub de la mida i la resistència de l’aigua només amb el quadrat: calia fer el vaixell més gran. Relaciona-ho amb les estacions carboneres i l’expansió colonial.', font: 'https://www.ssgreatbritain.org/brunel/', fontNom: 'Brunel’s SS Great Britain · Brunel i els seus vaixells' }
      },
      {
        id: 'helix', nom: 'Pales o hèlix?', any: '1845', qui: 'Prova de la marina britànica', durada: 14,
        model: 'Prova entre el Rattler i l’Alecto (3 d’abril de 1845) · esquema didàctic',
        pregunta: 'Quin sistema empeny millor?',
        intro: 'Les rodes de pales tenien defectes: amb mala mar una sortia de l’aigua, i un canó les destrossava. L’<b>hèlix</b> era la candidata. Per decidir-ho, van lligar dos vaixells iguals per la popa.',
        svg: prova, anima: animaProva, innova: [2], llegenda: false,
        fases: [
          { fins: 0.25, nom: 'Dos vaixells gairebé iguals', text: 'Mateixa mida i màquines de potència semblant. L’un porta hèlix; l’altre, rodes de pales. Un cable els uneix popa amb popa.', focus: ['rattler', 'alecto'] },
          { fins: 0.6, nom: 'Tots dos a tota màquina', text: 'Cadascú estira cap al seu costat. L’aigua bull al voltant de les pales i darrere l’hèlix.' },
          { fins: 1, nom: 'L’hèlix guanya', text: 'El Rattler arrossega l’Alecto cap enrere a uns 2,5 nusos. Des d’aleshores, els vaixells nous es fan amb hèlix.', focus: ['rattler'] }
        ],
        parts: {
          rattler: { nom: 'HMS Rattler', text: 'Vaixell d’hèlix. L’hèlix és un cargol que es rosca dins l’aigua: en girar, l’empeny enrere i el vaixell avança.' },
          alecto: { nom: 'HMS Alecto', text: 'Vaixell de rodes de pales. Funciona bé en rius i en mar calma, però pateix amb les onades.' }
        },
        clau: 'Hèlix + buc de ferro + vapor: la combinació dels grans vaixells de la segona meitat del segle XIX.',
        batx: { titol: 'Una demostració pensada per convèncer', text: 'La prova va ser més un espectacle públic que un experiment net (el Rattler ja havia guanyat curses abans). Mostra com es legitima una tecnologia nova davant l’opinió i el govern. El 1843 Brunel ja havia construït el Great Britain, de ferro i amb hèlix.', font: 'https://www.ssgreatbritain.org/', fontNom: 'Brunel’s SS Great Britain' }
      },
      {
        id: 'atlantic', nom: 'Travessar l’Atlàntic', any: '1838', durada: 16,
        model: 'QGIS · Natural Earth · connexió esquemàtica entre Bristol i Nova York',
        pregunta: 'Què canviava en travessar l’Atlàntic?',
        intro: 'Bristol i Nova York estan separats per uns <b>5.400 km en línia recta</b>. El <b>Great Western</b> hi va arribar en quinze dies i mig el 1838. Compara-ho amb els velers cap a l’oest dels anys 1840: és una simulació de durades, no una cursa real ni la derrota exacta dels vaixells.',
        svg: RI.mapaAtlantic, anima: RI.animaMapaAtlantic, llegenda: false,
        fases: [
          { fins: 0.44, nom: 'El vapor: 15 dies i mig', text: 'El primer viatge del Great Western, de Bristol a Nova York, dura aproximadament quinze dies i mig. L’arribada demostra que un gran vapor pot creuar l’oceà.' },
          { fins: 1, nom: 'La vela: entorn de cinc setmanes', text: 'Al decenni de 1840, la travessia cap a l’oest en un veler de passatgers durava entorn de cinc setmanes. És una mitjana d’altres viatges, no el temps d’un vaixell que sortís amb el Great Western.' }
        ],
        clau: 'Vapor (1838): 15 dies i mig. Vela (anys 1840): entorn de cinc setmanes cap a l’oest. El vapor escurça i fa més previsible la travessia.',
        batx: { titol: 'Un viatge i una mitjana', text: 'Els quinze dies i mig corresponen al primer viatge d’un vaixell concret el 1838; les cinc setmanes resumeixen travessies de velers cap a l’oest durant els anys 1840. Què perdries si presentessis aquestes dades com una cursa entre dos vaixells?', font: 'https://www.rmg.co.uk/stories/ocean/sailing-ships-steam-power-how-industrial-revolution-changed-life-sea-forever', fontNom: 'Royal Museums Greenwich · Del veler al vapor' }
      }
    ],
    repte: [
      { q: 'Què fa moure un vaixell de pales?', o: ['El vent a les veles', 'Les pales, que empenyen l’aigua enrere', 'El corrent del mar'], c: 1, e: 'La màquina fa girar les rodes i les pales empenyen l’aigua: el vaixell avança en sentit contrari.' },
      { q: 'Per què el Great Western encara portava veles?', o: ['Per decoració', 'Per estalviar carbó i com a seguretat si fallava la màquina', 'Perquè no tenia màquina'], c: 1, e: 'Els primers vapors combinaven els dos sistemes.' },
      { q: 'Quin era el gran problema dels viatges llargs amb vapor?', o: ['El carbó ocupava molt espai', 'Les pales feien soroll', 'No hi havia mariners'], c: 0, e: 'Com més llarg el viatge, més carbó i menys lloc per a càrrega i passatgers.' },
      { tipus: 'toca', esc: 'western', part: 'maquina', p: 0.4, q: 'Toca la màquina que transforma el vapor en moviment dins del Great Western.', e: 'La màquina de palanques laterals: un balancí girat cap per avall perquè càpiga sota coberta.' },
      { tipus: 'ordena', esc: 'western', q: 'Ordena com es mou el Great Western.', e: 'Carbó i calderes → el vapor mou la màquina → l’eix fa girar les pales → i les veles ajuden.' },
      { q: 'Què va demostrar la prova del Rattler i l’Alecto?', o: ['Que les pales eren més ràpides', 'Que l’hèlix empenyia millor que les pales', 'Que la vela guanyava el vapor'], c: 1, e: 'El vaixell d’hèlix va arrossegar el de pales cap enrere.' },
      { q: 'Quin avantatge té l’hèlix amb mala mar?', o: ['Treballa sempre sota l’aigua', 'Pesa menys que una vela', 'No necessita màquina'], c: 0, e: 'Les rodes de pales sortien de l’aigua quan el vaixell es balancejava.' },
      { q: 'Quant va durar aproximadament el primer viatge del Great Western de Bristol a Nova York?', o: ['3 dies', '15 dies i mig', '60 dies'], c: 1, e: 'Va sortir el 8 d’abril de 1838 i va arribar a Nova York el dia 23.' }
    ]
  });
})();

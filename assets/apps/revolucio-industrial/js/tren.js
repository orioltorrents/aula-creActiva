// SPDX-License-Identifier: AGPL-3.0-or-later
/* Capítol 6 · La locomotora: la Rocket per dins i la cursa de Liverpool a Manchester. */
(function () {
  const { svg, foc, focs, roda, persona, nuvol, cavall, txt, retol, fletxa } = RI;
  const W = { x: 760, y: 480 }, RM = 42, LB = 230, UA = (-145 * Math.PI) / 180, U = { x: Math.cos(UA), y: Math.sin(UA) };
  const tub = (d, c, g) => `<path d="${d}" class="nf" stroke="#2a2420" stroke-width="${(g || 8) + 5}" stroke-linejoin="round"/><path d="${d}" class="nf" stroke="${c}" stroke-width="${g || 8}" stroke-linejoin="round"/>`;
  const arbre = (x, y, k) => RI.arbre(x, y, (k || 1) * 0.72);

  function rocket() {
    const { caixa, cami, brida, reblons, figura, ombra, cartell, rodaR, brasa } = RI;
    const T2 = RI.tub, INK = '#2e221a';
    // paisatge: cel, turons llunyans i arbres desenfocats que passen
    let s = `<rect x="-60" y="0" width="1320" height="720" fill="url(#g-cel)"/><g filter="url(#f-suau)" opacity=".9">${nuvol(150, 110, 1.5)}${nuvol(980, 170, 1.2)}</g><path d="M-60 470c220-80 420-30 600-56s430-70 720 6v190H-60z" fill="#b3cc93" opacity=".6"/><path d="M-60 520c200-70 380-30 560-50s420-60 760 10v120H-60z" fill="#8fb26a" opacity=".8"/>`;
    let arbres = ''; for (let i = 0; i < 2; i++) [[80, 0.9], [330, 1.2], [610, 0.8], [900, 1.1], [1150, 0.9]].forEach(([x, k]) => { arbres += arbre(x + i * 1320, 596, k); });
    s += `<g opacity=".6" filter="url(#f-suau)"><g id="arbres">${arbres}</g></g>`;
    // terraplè, balast, travesses i carril
    s += `<rect x="-60" y="588" width="1320" height="26" fill="url(#tx-herba)"/>` + cami('M-60 612H1260V720H-60Z', 'terra', 'pla') + `<path d="M-60 604H1260V624H-60Z" fill="url(#tx-roca)"/><path d="M-60 604H1260V624H-60Z" fill="#000" opacity=".12"/>`;
    let tr = ''; for (let x = -120; x < 1340; x += 60) tr += `<rect x="${x}" y="606" width="34" height="13" fill="url(#tx-fustaf)" stroke="${INK}" stroke-width="1.200"/>`;
    s += `<g id="trav">${tr}</g><rect x="-60" y="598" width="1320" height="9" fill="#4d555b" stroke="${INK}" stroke-width="1.200"/><path d="M-60 600H1260" stroke="#cfd6db" stroke-width="1.600"/>`;
    s += ombra(560, 606, 520, 6, 0.22);
    // tènder: bota d'aigua i caixa de carbó
    s += `<g data-part="tender"><g id="rt1">${rodaR(115, 550, 50, { raigs: 8, tex: 'fustag', gruix: 8, raig: 3.500 })}</g><g id="rt2">${rodaR(245, 550, 50, { raigs: 8, tex: 'fustag', gruix: 8, raig: 3.500 })}</g>`;
    s += caixa(56, 470, 250, 18, 'fustaf', 'tub') + cami('M110 368H198Q242 368 242 419Q242 470 198 470H110Q66 470 66 419Q66 368 110 368Z', 'fusta', 'tub');
    s += `<clipPath id="tall-bota"><ellipse cx="154" cy="424" rx="50" ry="32"/></clipPath><g clip-path="url(#tall-bota)"><rect x="100" y="388" width="110" height="72" fill="#3a2616"/><rect x="100" y="408" width="110" height="52" fill="url(#g-aiguat)"/><path d="M100 409q9-4 18 0t18 0 18 0 18 0 18 0 18 0" fill="none" stroke="#fff" stroke-width="1.300"/></g><ellipse cx="154" cy="424" rx="50" ry="32" fill="none" stroke="#e8c89a" stroke-width="2.400"/>`;
    [92, 216].forEach((x) => { s += `<rect x="${x}" y="371" width="7" height="96" rx="3" fill="#30353a" stroke="${INK}" stroke-width="1"/>`; });
    s += caixa(248, 418, 54, 52, 'fustaf', 'llum') + `<path d="M250 420q26-36 50 0z" fill="url(#tx-carbo)" stroke="${INK}" stroke-width="1.300"/>` + T2('M236 452C280 486 320 476 356 436', 6, 'coure') + T2('M306 479h36', 5, 'ferro') + `</g>`;
    // roda posterior i bastidor
    s += `<g id="rpost">${rodaR(470, 540, 60, { raigs: 8, tex: 'fustag', gruix: 9, raig: 4 })}</g>`;
    s += caixa(336, 440, 528, 13, 'ferro', 'tub') + caixa(852, 424, 16, 44, 'fusta-v', 'cil') + caixa(296, 440, 52, 11, 'fustaf', 'tub');
    s += figura(316, 441, 215, { attr: 'class="atenua"' });
    // fogar de coure, tallat: foc envoltat d'aigua
    s += `<g data-part="fogar">${caixa(350, 235, 92, 215, 'coure', 'cil', { rx: 8 })}${reblons(356, 246, 356, 438, 9, 2.200)}${reblons(436, 246, 436, 438, 9, 2.200)}<rect x="362" y="248" width="72" height="194" rx="5" fill="#6fb6dc"/><rect x="370" y="256" width="60" height="186" rx="4" fill="#2a1710"/><rect x="370" y="256" width="60" height="186" rx="4" fill="url(#g-resplendor)"/>${brasa(400, 438, 50, 84, { n: 2 })}<path d="M362 248h72v194h-72z" fill="none" stroke="#f3c59c" stroke-width="2.200"/>${caixa(342, 330, 10, 46, 'ferro', 'llum', { rx: 3 })}</g>`;
    // caldera folrada de fusta pintada, tallada: aigua, vapor i tubs de foc
    const tall = 'M464 270Q468 260 500 262H764Q786 262 788 284V352Q786 372 764 372H496Q466 372 464 352Z';
    s += `<g data-part="caldera">${caixa(440, 250, 362, 130, 'fustag', 'tub', { rx: 10 })}<path d="M446 272H796M446 294H796M446 316H796M446 338H796M446 360H796" stroke="#7a5a12" stroke-width="1" opacity=".5"/>`;
    [452, 540, 628, 716, 786].forEach((x) => { s += `<rect x="${x}" y="250" width="7" height="130" fill="#2b2f33"/><rect x="${x}" y="250" width="7" height="130" fill="url(#sh-tub)"/>`; });
    s += `<clipPath id="tall-rocket"><path d="${tall}"/></clipPath><g clip-path="url(#tall-rocket)"><rect x="460" y="258" width="332" height="118" fill="#3a2616"/><rect x="460" y="258" width="332" height="26" fill="#f6e3c4" opacity=".55"/><rect x="460" y="284" width="332" height="92" fill="url(#g-aiguat)"/><path d="M460 285q14-6 28 0t28 0 28 0 28 0 28 0 28 0 28 0 28 0 28 0 28 0 28 0 28 0" fill="none" stroke="#fff" stroke-width="1.500"/><g data-puf="560 296 0 -14 3 3.500 1.300" class="vap"></g><g data-puf="700 296 0 -14 3 3.500 1.700" class="vap"></g><g data-puf="640 296 0 -14 3 3 1.100" class="vap"></g></g></g>`;
    let tubs = ''; [302, 320, 338, 356].forEach((y, i) => { tubs += T2(`M432 ${y}H802`, 9, 'coure') + `<path d="M436 ${y}H800" class="flux s-groc" stroke-width="3.500" data-flux="${2.2 + i * 0.2}"/>`; });
    s += `<g data-part="tubs" clip-path="url(#tall-rocket)">${tubs}</g><path d="${tall}" fill="none" stroke="#f7e4a6" stroke-width="2.800"/><path d="${tall}" fill="none" stroke="${INK}" stroke-width=".9"/>`;
    // caixa de fums i xemeneia blanca
    s += `<g data-part="xemeneia">${caixa(800, 246, 48, 138, 'ferro', 'cil', { rx: 6 })}<path d="M808 250V98l-8-28h48l-8 28V250Z" fill="#f1ecdf"/><path d="M808 250V98l-8-28h48l-8 28V250Z" fill="url(#sh-cil)" opacity=".8"/><path d="M808 250V98l-8-28h48l-8 28V250Z" class="vora"/><path d="M800 70l6-12 6 12 6-12 6 12 6-12 6 12 6-12 6 12" fill="#f1ecdf" stroke="${INK}" stroke-width="1.300" stroke-linejoin="round"/>${brida(824, 240, 40, 7, 'llauto')}<path d="M824 262V120" class="flux s-gris" data-flux="3"/></g><g data-puf="824 60 -170 -70 7 15 1.500" class="vap boira"></g><g data-puf="824 60 -150 -50 4 12 2.100" class="fum boira" opacity=".45"></g>`;
    // tubs de vapor i d'escapament
    s += `<g data-part="vapor">${cami('M598 252q0-28 22-28t22 28z', 'llauto', 'cup')}${T2('M620 230V220H506V248', 7, 'coure')}<path d="M620 230V220H506V246" class="flux s-blanc" stroke-width="3.500" data-flux="2.500"/></g>`;
    s += `<g data-part="escapament">${T2('M474 238V204H824V268', 7, 'plom')}<path d="M474 234V204H824V262" class="flux s-blanc" stroke-width="3.500" data-flux="3"/></g>`;
    // roda motriu
    s += `<g data-part="roda"><g id="rmot">${rodaR(W.x, W.y, 120, { raigs: 12, tex: 'fustag', gruix: 14, raig: 5, boto: 22, botoTex: 'ferro', extra: `<circle cx="${W.x}" cy="${W.y}" r="117.500" fill="none" stroke="#3a3f44" stroke-width="5"/><path d="M${W.x} ${W.y}h${RM}" stroke="${INK}" stroke-width="17" stroke-linecap="round"/><path d="M${W.x} ${W.y}h${RM}" stroke="#7d868d" stroke-width="12" stroke-linecap="round"/>` })}</g></g>`;
    // cilindre inclinat (coordenades locals: x al llarg de l'eix, des del centre de la roda)
    s += `<g transform="translate(${W.x} ${W.y}) rotate(-145)"><g data-part="cilindre"><path d="M176 -16H300M176 16H300" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M176 -16H300M176 16H300" stroke="#9aa3aa" stroke-width="2.400" stroke-linecap="round"/><rect x="310" y="-22" width="100" height="44" fill="#3a2a18"/><rect id="cam-a" x="310" y="-22" width="40" height="44" fill="#f9a35e"/><rect id="cam-b" x="360" y="-22" width="50" height="44" fill="#eef4f6"/>`;
    s += `<path d="M302 -30H418V30H302ZM310 -22V22H410V-22Z" fill="url(#tx-llauto)" fill-rule="evenodd"/><path d="M302 -30H418V30H302ZM310 -22V22H410V-22Z" fill="url(#sh-tub)" fill-rule="evenodd"/><path d="M302 -30H418V30H302ZM310 -22V22H410V-22Z" class="vora" fill-rule="evenodd"/>${caixa(330, -52, 60, 22, 'llauto', 'tub', { rx: 4 })}</g>`;
    s += `<g data-part="piston" id="creu">${T2('M0 0H130', 7, 'ferro')}${caixa(125, -22, 10, 44, 'ferro', 'cil')}${caixa(-12, -17, 24, 34, 'ferro', 'pla', { rx: 4 })}</g></g>`;
    s += `<g data-part="biela"><line id="biela" x1="600" y1="370" x2="760" y2="480" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><line id="biela2" x1="600" y1="370" x2="760" y2="480" stroke="#6d767d" stroke-width="11.500" stroke-linecap="round"/><line id="biela3" x1="600" y1="370" x2="760" y2="480" stroke="#c3ccd2" stroke-width="3" stroke-linecap="round"/><circle id="bulo" cx="760" cy="480" r="9" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.300"/></g>`;
    s += `<g data-en="1">${cartell(620, 410, '25 tubs: molta més superfície calenta', { fons: '#8c4a14', w: 300 })}</g><g data-en="3">${cartell(980, 420, 'vaivé → gir', { fons: '#d9482b' })}</g><g data-en="4">${cartell(1010, 150, 'el raig de vapor estira l’aire', { w: 250 })}${cartell(1010, 184, 'i aviva el foc')}</g>`;
    return svg(s);
  }
  function animaRocket({ t, el }) {
    const th = (2 * Math.PI * 4 * t) / 10, al = th - UA, d = RM * Math.cos(al) + Math.sqrt(LB * LB - Math.pow(RM * Math.sin(al), 2));
    const C = { x: W.x + RM * Math.cos(th), y: W.y + RM * Math.sin(th) }, X = { x: W.x + d * U.x, y: W.y + d * U.y }, g = (th * 180) / Math.PI;
    el('rmot').setAttribute('transform', `rotate(${(g % 360).toFixed(1)} ${W.x} ${W.y})`);
    el('rpost').setAttribute('transform', `rotate(${((g * 2) % 360).toFixed(1)} 470 540)`);
    el('rt1').setAttribute('transform', `rotate(${((g * 2.4) % 360).toFixed(1)} 115 550)`); el('rt2').setAttribute('transform', `rotate(${((g * 2.4) % 360).toFixed(1)} 245 550)`);
    el('creu').setAttribute('transform', `translate(${d.toFixed(1)} 0)`);
    ['biela', 'biela2', 'biela3'].forEach((id) => { const l = el(id); l.setAttribute('x1', X.x.toFixed(1)); l.setAttribute('y1', X.y.toFixed(1)); l.setAttribute('x2', C.x.toFixed(1)); l.setAttribute('y2', C.y.toFixed(1)); });
    const b = el('bulo'); b.setAttribute('cx', C.x.toFixed(1)); b.setAttribute('cy', C.y.toFixed(1));
    const xp = d + 130, puja = Math.sin(al) < 0;
    el('cam-a').setAttribute('width', Math.max(0, xp - 5 - 310).toFixed(1)); el('cam-a').setAttribute('fill', puja ? '#f9a35e' : '#eef4f6');
    el('cam-b').setAttribute('x', (xp + 5).toFixed(1)); el('cam-b').setAttribute('width', Math.max(0, 410 - xp - 5).toFixed(1)); el('cam-b').setAttribute('fill', puja ? '#eef4f6' : '#f9a35e');
    const dist = th * 120;
    el('trav').setAttribute('transform', `translate(${(-(dist % 60)).toFixed(1)} 0)`);
    el('arbres').setAttribute('transform', `translate(${(-60 - ((dist * 0.25) % 1320)).toFixed(1)} 0)`);
  }

  /* ---------- la cursa ---------- */
  function cursa() {
    let s = `<rect class="crema" x="-60" width="1320" height="720"/>`;
    s += `<text x="120" y="70" class="tx-g mig">Liverpool</text><text x="1080" y="70" class="tx-g mig">Manchester</text><path d="M200 62H1000" class="t nf" stroke-dasharray="2 10"/><text x="600" y="54" class="tx-p mig">uns 50 km</text>`;
    s += `<path d="M120 90V680M1080 90V680" class="t nf" stroke-dasharray="8 8"/>`;
    s += `<g><circle class="t blanc" cx="600" cy="120" r="44"/><path d="M600 84v8M600 148v8M564 120h8M628 120h8" class="t2"/><line id="agulla" x1="600" y1="120" x2="600" y2="88" class="t" stroke-width="5"/><circle cx="600" cy="120" r="5" class="negre"/></g><text id="hores" x="662" y="130" class="tx-gg">0 h</text>`;
    s += RI.innova(255, 120, 'INNOVACIÓ · rail de ferro + vapor = velocitat i càrrega gegants', { w: 455 });
    s += retol(965, 120, '30 t (canal) → centenars de t (tren)', { fons: '#1f6f78', w: 290 });
    // canal
    s += `<rect x="-60" y="196" width="1320" height="100" fill="#cfe6ee"/><rect class="aigua" x="-60" y="246" width="1320" height="50" opacity=".85"/><rect class="herba" x="-60" y="232" width="1320" height="16"/><text x="-40" y="218" class="tx">Canal · barcassa estirada per un cavall</text>
      <g id="v-canal"><path class="t fusta" d="M-150 250h130l-14 30h-104z"/><path class="t carbo" d="M-136 250q50-30 96 0z"/>${persona(-32, 250, 34, { color: '#7a4f9a' })}<path d="M-20 256L48 228" class="t1"/>${cavall(68, 240, 0.72, { arnes: true })}</g>`;
    // camí
    s += `<rect x="-60" y="352" width="1320" height="100" fill="#efe0bd"/><rect x="-60" y="430" width="1320" height="22" fill="#c9a877"/><text x="-40" y="374" class="tx">Camí · diligència amb quatre cavalls</text>
      <g id="v-cami"><rect class="t vermell" x="-150" y="384" width="80" height="36" rx="8"/><rect class="t vidre" x="-140" y="390" width="22" height="14"/><rect class="t vidre" x="-108" y="390" width="22" height="14"/><path class="t fosc" d="M-156 384h92l-6-10h-80z"/>${roda(-132, 426, 14, { raigs: 6 })}${roda(-88, 426, 14, { raigs: 6 })}<path d="M-70 410h34" class="t"/>${cavall(-16, 434, 0.64, { color: '#5a4636', arnes: true })}${cavall(34, 434, 0.64, { arnes: true })}</g>`;
    // via
    s += `<rect x="-60" y="508" width="1320" height="110" fill="#e3ead5"/><rect class="pedra" x="-60" y="596" width="1320" height="22"/><rect class="t ferro" x="-60" y="590" width="1320" height="7"/><text x="-40" y="530" class="tx">Ferrocarril · locomotora de vapor amb vagons</text>
      <g id="v-tren">${[-330, -250, -170].map((x) => `<rect class="t blau" x="${x}" y="548" width="70" height="30" rx="4"/><rect class="t vidre" x="${x + 8}" y="554" width="14" height="12"/><rect class="t vidre" x="${x + 28}" y="554" width="14" height="12"/><rect class="t vidre" x="${x + 48}" y="554" width="14" height="12"/>${roda(x + 16, 582, 9, { raigs: 4 })}${roda(x + 54, 582, 9, { raigs: 4 })}`).join('')}
        <rect class="t fusta" x="-92" y="556" width="34" height="22" rx="8"/>${roda(-75, 582, 9, { raigs: 4 })}<rect class="t" x="-50" y="544" width="56" height="26" rx="6" fill="#f2c230"/><path class="t blanc" d="M-6 544v-34h12v34z"/>${roda(-38, 578, 12, { raigs: 6, color: '#f2c230' })}${roda(-8, 572, 18, { raigs: 8, color: '#f2c230' })}<g data-puf="0 506 -60 -30 4 7 1.2" class="vap"></g></g>`;
    s += `<g id="a-tren" opacity="0">${retol(960, 498, 'menys de 2 hores', { fons: '#1f6f78' })}</g><g id="a-cami" opacity="0">${retol(970, 342, 'unes 4 hores', { fons: '#d9482b' })}</g><g id="a-canal" opacity="0">${retol(960, 186, 'unes 12 hores', { fons: '#2f7fb5' })}</g>`;
    s += `<text x="600" y="668" class="tx-p mig">Temps aproximats cap al 1830. La barcassa portava unes 30 tones; la diligència, una quinzena de viatgers; un tren, centenars.</text>`;
    return svg(s);
  }
  function animaCursa({ p, el }) {
    const h = Math.min(12, p * 12.6), pos = (T) => 120 + 960 * Math.min(1, h / T);
    el('v-tren').setAttribute('transform', `translate(${pos(1.75).toFixed(1)} 0)`);
    el('v-cami').setAttribute('transform', `translate(${pos(4).toFixed(1)} 0)`);
    el('v-canal').setAttribute('transform', `translate(${pos(12).toFixed(1)} 0)`);
    el('a-tren').setAttribute('opacity', h >= 1.75 ? 1 : 0); el('a-cami').setAttribute('opacity', h >= 4 ? 1 : 0); el('a-canal').setAttribute('opacity', h >= 12 ? 1 : 0);
    el('agulla').setAttribute('transform', `rotate(${(h * 30).toFixed(1)} 600 120)`);
    el('hores').textContent = (Math.floor(h * 2) / 2).toString().replace('.', ',') + ' h';
  }

  RI.capitol({
    id: 'tren', titol: 'La locomotora', llegenda: [['#f08a4b', 'calor · vapor'], ['#2f7fb5', 'aigua'], ['#c9d6dc', 'vapor usat']],
    escenes: [
      {
        id: 'rocket', nom: 'La Rocket per dins', any: '1829', qui: 'George i Robert Stephenson', durada: 20,
        model: 'Locomotora Rocket (1829), secció simplificada · reconstrucció didàctica',
        pregunta: 'Com mous un tren sense cavalls?',
        intro: 'La <b>Rocket</b> va guanyar el concurs de Rainhill (1829) i va fixar el model de totes les locomotores de vapor. Segueix l’energia: del foc a les rodes en cinc passos.',
        svg: rocket, anima: animaRocket, innova: [1, 4],
        fases: [
          { fins: 0.2, nom: 'El foc crema al fogar', text: 'El fogoner hi tira coc. Les parets del fogar estan envoltades d’aigua, que comença a escalfar-se.', focus: ['fogar', 'tender'] },
          { fins: 0.4, nom: 'Els tubs fan bullir l’aigua', text: 'Els gasos calents del foc travessen la caldera per 25 tubs de coure (aquí en veus quatre). Com que toquen molta aigua alhora, es fa <b>molt vapor en poc temps</b>.', focus: ['caldera', 'tubs'] },
          { fins: 0.6, nom: 'El vapor empeny el pistó', text: 'El vapor a pressió baixa fins al cilindre i empeny el pistó, ara per un costat, ara per l’altre.', focus: ['vapor', 'cilindre', 'piston'] },
          { fins: 0.8, nom: 'La biela fa girar la roda', text: 'El pistó va endavant i endarrere. La biela, enganxada fora del centre de la roda, converteix aquest vaivé en gir.', focus: ['piston', 'biela', 'roda'] },
          { fins: 1, nom: 'El vapor usat aviva el foc', text: 'El vapor que ja ha treballat surt disparat per la xemeneia. En sortir, xucla l’aire a través dels tubs i el foc crema més fort: com més corre, més tira.', focus: ['escapament', 'xemeneia', 'tubs'] }
        ],
        parts: {
          fogar: { nom: 'Fogar', text: 'La cambra on crema el combustible. Està envoltat d’una camisa d’aigua per aprofitar tota la calor.' },
          caldera: { nom: 'Caldera', text: 'Dipòsit ple d’aigua (blau) amb vapor a pressió a dalt. La Rocket era pintada de groc.' },
          tubs: { nom: 'Tubs de fum', text: 'La gran novetat: molts tubs prims per on passen els gasos calents. Multipliquen la superfície que escalfa l’aigua.' },
          vapor: { nom: 'Presa de vapor', text: 'Recull el vapor de la part alta de la caldera i el porta al cilindre.' },
          cilindre: { nom: 'Cilindre', text: 'Inclinat i unit directament a la roda. A dins, el vapor empeny el pistó pels dos costats.' },
          piston: { nom: 'Pistó', text: 'Es mou endavant i endarrere dins del cilindre i estira la biela.' },
          biela: { nom: 'Biela', text: 'Barra que uneix el pistó amb la roda motriu.' },
          roda: { nom: 'Roda motriu', text: 'Rep la força de la biela i empeny la locomotora sobre el rail. Ferro llis sobre ferro llis: n’hi ha prou perquè no patini.' },
          escapament: { nom: 'Tub d’escapament', text: 'Porta el vapor usat fins a la base de la xemeneia.' },
          xemeneia: { nom: 'Xemeneia', text: 'Hi surten junts el fum del foc i el vapor usat. El raig de vapor crea el tiratge.' },
          tender: { nom: 'Tènder', text: 'Vagó amb la reserva d’aigua (la bota) i de combustible.' }
        },
        etiquetes: [['fogar', 300, 180, 372, 250], ['tubs', 620, 660, 620, 356, 'Tubs de fum'], ['caldera', 500, 660, 500, 370], ['vapor', 700, 160, 628, 226, 'Presa de vapor'], ['cilindre', 420, 120, 462, 240], ['biela', 960, 480, 700, 440], ['roda', 940, 560, 850, 540, 'Roda motriu'], ['escapament', 590, 110, 600, 204, 'Tub d’escapament'], ['xemeneia', 940, 110, 840, 130], ['tender', 150, 320, 150, 372]],
        explotada: {
          img: 'img/exp-rocket.webp',
          model: 'Làmina tècnica en vista explotada · Locomotora Rocket (Stephenson, 1829)',
          guies: '<path class="sil" d="M240 375L760 545L830 515"/><path d="M435 385L422 448M615 240V310M305 295L540 385M455 495L540 385M445 575L540 480M710 420L840 505M940 580V410"/><circle cx="422" cy="448" r="4.5"/><circle cx="615" cy="310" r="4.5"/><circle cx="540" cy="385" r="4.5"/><circle cx="710" cy="420" r="4.5"/>',
          zones: [['fogar', 265, 225, 135, 135], ['xemeneia', 435, 235, 55, 155], ['vapor', 615, 175, 65, 75], ['caldera', 615, 365, 145, 115], ['tubs', 685, 425, 145, 85], ['cilindre', 625, 610, 125, 85], ['cilindre', 840, 505, 115, 85], ['roda', 340, 615, 145, 135], ['tender', 950, 265, 145, 145]],
          etiquetes: [['fogar', 135, 115, 255, 205], ['xemeneia', 340, 78, 435, 185], ['vapor', 625, 82, 615, 165, 'Presa de vapor'], ['tender', 1035, 120, 975, 195], ['tubs', 845, 345, 705, 415, 'Tubs de fum'], ['caldera', 345, 445, 520, 325], ['roda', 155, 665, 300, 605, 'Roda motriu'], ['cilindre', 745, 705, 655, 625]]
        },
        real: {
          img: 'img/real-rocket.webp',
          titol: 'La Rocket original (1829), tal com es conserva avui, vista per darrere',
          museu: 'National Railway Museum · York (Regne Unit)',
          lic: 'Foto: Malcolmxl5 · Wikimedia Commons · CC0',
          etiquetes: [['fogar', 58, 50, 'Fogar'], ['cilindre', 33, 38, 'Cilindre'], ['xemeneia', 36, 6, 'Xemeneia']]
        },
        clau: 'Calor → vapor a pressió → vaivé del pistó → gir de les rodes.',
        batx: { titol: 'Tres idees que fan guanyar la Rocket', text: 'Caldera multitubular, tiratge forçat amb el vapor d’escapament i cilindres units directament a les rodes. Cap era del tot nova (Trevithick ja havia fet córrer una locomotora el 1804), però combinades donen una màquina lleugera i ràpida. La innovació sovint és combinació.', font: 'https://www.railwaymuseum.org.uk/objects-and-stories/stephensons-rocket-rainhill-and-rise-locomotive', fontNom: 'National Railway Museum · La Rocket i Rainhill' }
      },
      {
        id: 'cursa', nom: 'Més de pressa que cap cavall', any: '1830', qui: 'Línia Liverpool – Manchester', durada: 14,
        pregunta: 'Quant temps guanyes amb el tren?',
        intro: 'El 1830 s’obre la primera línia entre dues ciutats amb locomotores de vapor i horari fix. Fes sortir els tres transports alhora i mira el rellotge.',
        svg: cursa, anima: animaCursa, llegenda: false,
        fases: [
          { fins: 0.15, nom: 'El tren arriba en menys de 2 hores', text: 'I no porta una quinzena de viatgers, sinó centenars, o desenes de tones de cotó del port a les fàbriques.' },
          { fins: 0.33, nom: 'La diligència, unes 4 hores', text: 'Cal canviar els cavalls pel camí. El bitllet és car i hi cap poca gent.' },
          { fins: 1, nom: 'La barcassa, unes 12 hores', text: 'El canal mou molta càrrega amb un sol cavall i és barat, però és lent i a l’hivern es pot glaçar.' }
        ],
        clau: 'El tren no només és més ràpid: porta molt més pes, a tota hora i amb horari. Les distàncies «s’encongeixen».',
        batx: { titol: 'Causa o conseqüència de la industrialització?', text: 'El ferrocarril necessita ferro, carbó, màquines i capital que ja existien; i alhora multiplica la demanda de tots quatre i unifica mercats. Argumenta: és més un resultat de la primera industrialització o el motor de la seva segona etapa?', font: 'https://www.scienceandindustrymuseum.org.uk/objects-and-stories/making-the-liverpool-and-manchester-railway', fontNom: 'Science and Industry Museum · Liverpool and Manchester Railway' }
      },
      {
        id: 'mapa', nom: 'La ruta al mapa', any: '1830', qui: 'Liverpool – Manchester', durada: 15,
        model: 'QGIS · Natural Earth · traçat aproximat de la línia de 1830',
        pregunta: 'Per què aquesta línia seguia aquest camí?',
        intro: 'Del <b>port de Liverpool</b> a les fàbriques de <b>Manchester</b>: el mapa situa la ruta, Rainhill i el pas difícil per Chat Moss. El traçat és aproximat; no representa cada corba de la via original.',
        svg: RI.mapaFerrocarril, anima: RI.animaMapaFerrocarril, llegenda: false,
        fases: [
          { fins: 0.28, nom: 'Sortida de Liverpool', text: 'El port rep cotó i altres mercaderies. El terminal de viatgers de la línia de 1830 és Crown Street, a Edge Hill.' },
          { fins: 0.48, nom: 'Rainhill', text: 'Aquí s’havien provat les locomotores el 1829. La Rocket guanyà les proves abans de l’obertura de la línia.' },
          { fins: 0.78, nom: 'Travessar Chat Moss', text: 'El pantà obligà a construir una base especial per sostenir els rails. La ruta no era una simple línia recta sobre terra ferma.' },
          { fins: 1, nom: 'Arribada a Manchester', text: 'La línia arriba a Liverpool Road, al costat del nucli industrial. Un servei directe de primera classe podia fer el trajecte en una hora i mitja.' }
        ],
        clau: 'Un trajecte d’uns 50 km connectava el port amb la ciutat tèxtil; la via també havia de superar el terreny.',
        batx: { titol: 'Mapa, font i reconstrucció', text: 'Compara aquest traçat aproximat amb un plànol d’època: què pots confirmar i què no? Distingeix la localització dels punts històrics de la línia dibuixada entre ells.', font: 'https://hummedia.manchester.ac.uk/institutes/mui/marg/research/projects/past-projects/Liverpool_Lost_Railway_Heritage.pdf', fontNom: 'Universitat de Manchester · mapa històric de la línia (figura 1)' }
      }
    ],
    repte: [
      { q: 'Per què la caldera de la Rocket té molts tubs?', o: ['Perquè pesi menys', 'Perquè els gasos calents toquin més aigua i facin més vapor', 'Per guardar-hi el carbó'], c: 1, e: 'Més superfície de contacte entre el foc i l’aigua vol dir més vapor en menys temps.' },
      { tipus: 'toca', esc: 'rocket', part: 'biela', p: 0.7, q: 'Toca la peça que converteix el vaivé del pistó en gir de la roda.', e: 'La biela: uneix el pistó amb un punt de la roda que no és el centre.' },
      { tipus: 'ordena', esc: 'rocket', q: 'Segueix l’energia: ordena el que passa dins la Rocket.', e: 'Foc → tubs i vapor → pistó → biela i roda → el vapor usat aviva el foc.' },
      { q: 'Què passa amb el vapor que ja ha empès el pistó?', o: ['Torna a la caldera', 'Surt per la xemeneia i aviva el foc', 'Es guarda al tènder'], c: 1, e: 'El raig de vapor arrossega l’aire i fa que el foc cremi més fort.' },
      { q: 'Què porta el tènder?', o: ['Viatgers', 'Aigua i combustible', 'Les eines del maquinista'], c: 1, e: 'Sense aigua no hi ha vapor i sense combustible no hi ha foc.' },
      { q: 'Cap al 1830, quant trigava el tren de Liverpool a Manchester?', o: ['Menys de 2 hores', 'Unes 6 hores', 'Un dia sencer'], c: 0, e: 'La diligència necessitava unes 4 hores i la barcassa del canal, unes 12.' },
      { q: 'Quin avantatge del tren és tan important com la velocitat?', o: ['No necessitava vies', 'Podia portar molta càrrega i molts viatgers alhora', 'No gastava carbó'], c: 1, e: 'Capacitat i regularitat: més mercaderies, més barates i amb horari.' },
      { q: 'Què exigia el pas de la línia Liverpool–Manchester per Chat Moss?', o: ['Construir una base estable sobre terreny pantanós', 'Fer-hi navegar vaixells de vapor', 'Canviar el traçat fins a Londres'], c: 0, e: 'El terreny pantanós feia difícil sostenir la via: calgué una solució d’enginyeria.' }
    ]
  });
})();

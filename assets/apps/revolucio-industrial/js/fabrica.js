// SPDX-License-Identifier: AGPL-3.0-or-later
/* Capítol 4 · La fàbrica: una filatura en tall, moguda per aigua o per vapor. */
(function () {
  const { svg, focs, roda, persona, nuvol, txt, retol, fletxa } = RI;
  const XS = [480, 610, 740, 870], EIX = { g: 520, p1: 390, p2: 260 };
  const INK = '#2e221a';
  const corretja = (x, y1, y2, r1, r2) => `<path d="M${x - r1} ${y1}L${x - r2} ${y2}M${x + r1} ${y1}L${x + r2} ${y2}" stroke="${INK}" stroke-width="4.200"/><path d="M${x - r1} ${y1}L${x - r2} ${y2}M${x + r1} ${y1}L${x + r2} ${y2}" stroke="#8a5a34" stroke-width="2.600"/><path data-capa="forca" d="M${x - r1} ${y1}L${x - r2} ${y2}" class="flux2 s-taronja" stroke-width="3" data-flux="2.500"/>`;
  const politja = (x, y) => `<g data-girat="${x} ${y} 260">${RI.rodaR(x, y, 11, { raigs: 4, tex: 'fusta', gruix: 4, raig: 1.600, boto: 3.500 })}</g>`;
  const fusta = (d) => `<path d="${d}" fill="url(#tx-fusta)" stroke="${INK}" stroke-width="1.400" stroke-linejoin="round"/><path d="${d}" fill="url(#sh-pla)"/>`;
  const carda = (x, yb) => `${fusta(`M${x - 40} ${yb}v-26h80v26h-10v-16h-60v16z`)}<g data-girat="${x} ${yb - 46} 200"><circle cx="${x}" cy="${yb - 46}" r="30" fill="url(#tx-acer)" stroke="${INK}" stroke-width="1.400"/><circle cx="${x}" cy="${yb - 46}" r="25" fill="none" stroke="${INK}" stroke-width="4.500" stroke-dasharray="1.500 4" opacity=".75"/><path d="M${x - 22} ${yb - 46}h44" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="${yb - 46}" r="5" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1"/></g><circle cx="${x}" cy="${yb - 46}" r="30" fill="url(#sh-bola)" opacity=".5" pointer-events="none"/><g data-girat="${x + 38} ${yb - 36} -500"><circle cx="${x + 38}" cy="${yb - 36}" r="10" fill="url(#tx-acer)" stroke="${INK}" stroke-width="1.300"/><path d="M${x + 30} ${yb - 36}h16" stroke="${INK}" stroke-width="1.400"/></g><path d="M${x - 62} ${yb - 30}q20-22 34-12" fill="none" stroke="#d8d2c2" stroke-width="10.500" stroke-linecap="round"/><path d="M${x - 62} ${yb - 30}q20-22 34-12" fill="none" stroke="#fffdf7" stroke-width="8" stroke-linecap="round"/><path d="M${x + 48} ${yb - 34}q16 2 18 22" fill="none" stroke="#fffdf7" stroke-width="4" stroke-linecap="round"/>`;
  const filadora = (x, yb) => { let b = ''; for (let i = 0; i < 4; i++) { const bx = x - 30 + i * 20; b += `<path d="M${bx} ${yb - 66}V${yb - 40}" stroke="#fffdf7" stroke-width="2"/><rect x="${bx - 5}" y="${yb - 46}" width="10" height="18" rx="3" fill="#f6efdc" stroke="${INK}" stroke-width="1.200"/><path d="M${bx - 7} ${yb - 28}h14" stroke="#a8801e" stroke-width="2.400"/>`; } return `${fusta(`M${x - 44} ${yb}v-28h88v28h-8v-20h-72v20z`)}<rect x="${x - 44}" y="${yb - 80}" width="88" height="9" fill="url(#tx-fusta)" stroke="${INK}" stroke-width="1.300"/><path d="M${x - 40} ${yb - 72}v44M${x + 40} ${yb - 72}v44" stroke="${INK}" stroke-width="5"/><path d="M${x - 40} ${yb - 72}v44M${x + 40} ${yb - 72}v44" stroke="#a8733f" stroke-width="2.600"/>${b}${[[-22, 300], [2, 500], [26, 800]].map(([dx, v]) => `<g data-girat="${x + dx} ${yb - 64} ${v}"><circle cx="${x + dx}" cy="${yb - 64}" r="6" fill="url(#tx-acer)" stroke="${INK}" stroke-width="1.200"/><path d="M${x + dx - 5} ${yb - 64}h10" stroke="${INK}" stroke-width="1.300"/></g>`).join('')}`; };
  const teler = (x, yb, i) => `${fusta(`M${x - 42} ${yb}v-78h84v78h-9v-68h-66v68z`)}<circle cx="${x - 30}" cy="${yb - 26}" r="12" fill="#efe6cf" stroke="${INK}" stroke-width="1.300"/><circle cx="${x - 30}" cy="${yb - 26}" r="6" fill="none" stroke="#cdbf9e" stroke-width="1.200"/><circle cx="${x + 30}" cy="${yb - 30}" r="10" fill="#fffdf7" stroke="${INK}" stroke-width="1.300"/><path d="M${x - 30} ${yb - 38}L${x + 30} ${yb - 40}M${x - 30} ${yb - 14}L${x + 30} ${yb - 40}" stroke="#fffdf7" stroke-width="2.500"/><path d="M${x - 30} ${yb - 38}L${x + 30} ${yb - 40}M${x - 30} ${yb - 14}L${x + 30} ${yb - 40}" stroke="#8fa6ab" stroke-width="1" stroke-dasharray="1 4"/><line class="pinta" data-x="${x}" data-y="${yb - 74}" x1="${x}" y1="${yb - 74}" x2="${x}" y2="${yb - 20}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;

  function fabrica(v) {
    const { caixa, cami, cartell, ombra, figura, rodaR, brasa, reblons } = RI, T2 = RI.tub;
    const aigua = v === 'aigua';
    let s = `<rect x="-60" y="0" width="1320" height="624" fill="url(#g-cel)"/><g filter="url(#f-suau)">${nuvol(560, 80, 1.5)}${nuvol(1060, 130, 1.1)}</g><path d="M-60 560c160-60 300-40 420-30s600-70 900 20v70H-60z" fill="#a9c487" opacity=".7"/>` + cami('M-60 620H1260V720H-60Z', 'terra', 'pla') + `<rect x="-60" y="614" width="1320" height="12" fill="url(#tx-herba)"/>`;
    // edifici en tall: paret del fons amb finestres, sostres de bigues i murs de maó
    s += `<rect x="356" y="240" width="628" height="380" fill="#efe3c6"/><rect x="356" y="240" width="628" height="380" fill="url(#sh-pla)"/>`;
    [262, 392, 522].forEach((y) => { [545, 675, 805, 930].forEach((x) => { s += `<path d="M${x - 15} ${y + 62}V${y + 16}q15-18 30 0V${y + 62}z" fill="#cfe6ef" stroke="#9a8b70" stroke-width="2"/><path d="M${x} ${y + 4}V${y + 62}M${x - 15} ${y + 34}h30" stroke="#9a8b70" stroke-width="1.400"/>`; }); });
    s += `<path d="M316 244L670 150 1024 244v-16L670 132 316 228z" fill="#8c3a26" stroke="${INK}" stroke-width="1.500" stroke-linejoin="round"/><path d="M316 236L670 141 1024 236" fill="none" stroke="#c0654a" stroke-width="2"/>` + cami('M340 240L670 152 1000 240Z', 'mao', 'pla');
    s += caixa(340, 240, 16, 380, 'mao', 'llum') + caixa(984, 240, 16, 380, 'mao', 'llum') + caixa(356, 490, 628, 10, 'fusta', 'tub') + caixa(356, 360, 628, 10, 'fusta', 'tub') + caixa(340, 232, 660, 10, 'fusta', 'tub') + caixa(340, 618, 660, 10, 'pedra', 'pla');
    [300, 430, 560].forEach((y) => { s += `<rect x="986" y="${y}" width="12" height="40" fill="#cfe6ef" stroke="${INK}" stroke-width="1.300"/>`; });
    s += caixa(986, 545, 12, 73, 'fustaf', 'cil');
    // motor
    if (aigua) {
      s += `<rect x="-60" y="636" width="400" height="26" fill="url(#g-aiguat)"/><path d="M-50 640q12-6 24 0t24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0" class="nf s-blanc" stroke-width="2"/>` + caixa(140, 620, 200, 20, 'pedra', 'pla');
      let pales = ''; for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8, d = `M${(240 + Math.cos(a) * 78).toFixed(1)} ${(546 + Math.sin(a) * 78).toFixed(1)}L${(240 + Math.cos(a + 0.22) * 96).toFixed(1)} ${(546 + Math.sin(a + 0.22) * 96).toFixed(1)}`; pales += `<path d="${d}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="${d}" stroke="#8b5a2b" stroke-width="4" stroke-linecap="round"/>`; }
      s += `<g data-part="motor">${caixa(-60, 438, 310, 20, 'fusta', 'tub')}<rect x="-60" y="441" width="306" height="9" fill="url(#g-aiguat)"/>${T2('M-30 458V620M90 458V620', 7, 'fusta')}<path d="M-30 520L90 458M-30 458L90 520" stroke="#6b4a2f" stroke-width="3"/><path d="M248 446q20 4 22 30" class="nf" stroke="#5fa6cf" stroke-width="10" stroke-linecap="round"/><path d="M-50 446H240" class="flux2 s-blanc" stroke-width="3" data-flux="2.500"/>`;
      s += `<g data-gira="240 546 2">${pales}${rodaR(240, 546, 86, { raigs: 8, tex: 'fusta', gruix: 14, raig: 5 })}</g><path d="M300 600q10 20 -6 36" class="nf" stroke="#5fa6cf" stroke-width="8" stroke-linecap="round" stroke-dasharray="6 8"/></g>`;
    } else {
      s += `<rect x="-60" y="430" width="400" height="190" fill="#e9dcc0"/><rect x="-60" y="430" width="400" height="190" fill="url(#sh-pla)"/><path d="M-70 432H346V416H-70z" fill="#8c3a26" stroke="${INK}" stroke-width="1.500"/>` + caixa(-60, 618, 400, 10, 'pedra', 'pla');
      s += `<g data-part="xemeneia">${cami('M-50 430L-44 70h26l6 360z', 'mao', 'llum')}${caixa(-48, 60, 34, 12, 'pedra', 'pla')}</g><g data-puf="-31 54 60 -50 6 16 2.400" class="fum boira"></g>`;
      s += `<g data-part="caldera">${caixa(-56, 520, 112, 100, 'mao', 'pla')}<path d="M-40 614V584q40-26 80 0v30z" fill="#1a110b"/>${brasa(0, 612, 62, 30)}${cami('M-48 502Q-48 468 -14 468H14Q48 468 48 502V522Q48 556 14 556H-14Q-48 556 -48 522Z', 'coure', 'cup')}${reblons(-24, 474, -24, 550, 6, 1.800)}${reblons(24, 474, 24, 550, 6, 1.800)}${T2('M0 468V452H104V522', 9, 'coure')}<path d="M0 466V452H104V520" class="flux s-blanc" stroke-width="4" data-flux="2"/><path d="M62 620q22-30 44 0z" fill="url(#tx-carbo)" stroke="${INK}" stroke-width="1.300"/></g>`;
      s += `<g data-part="motor">${caixa(60, 560, 92, 60, 'pedra', 'pla')}<rect x="66" y="526" width="76" height="30" fill="#3a2a18"/><rect id="f-cam" x="66" y="526" width="40" height="30" fill="#f9a35e"/><path d="M58 518H150V564H58ZM66 526V556H142V526Z" fill="url(#tx-llauto)" fill-rule="evenodd"/><path d="M58 518H150V564H58ZM66 526V556H142V526Z" fill="url(#sh-tub)" fill-rule="evenodd"/><path d="M58 518H150V564H58ZM66 526V556H142V526Z" class="vora" fill-rule="evenodd"/>`;
      s += `<g id="f-pist">${T2('M-70 0H0', 7, 'ferro')}${caixa(-76, -15, 9, 30, 'ferro', 'cil')}${caixa(-8, -10, 16, 20, 'ferro', 'pla', { rx: 3 })}</g><g id="f-volant">${rodaR(250, 541, 86, { raigs: 6, gruix: 15, raig: 7 })}</g><line id="f-biela" x1="180" y1="541" x2="250" y2="541" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><line id="f-biela2" x1="180" y1="541" x2="250" y2="541" stroke="#8d979e" stroke-width="7.500" stroke-linecap="round"/></g>`;
    }
    // transmissió: arbre vertical, engranatges cònics i eixos de cada pis
    s += `<g data-part="arbre">${T2('M240 541H384', 10, 'ferro')}${T2('M384 250V550', 11, 'ferro')}${[541, EIX.g, EIX.p1, EIX.p2].map((y) => `<path d="M370 ${y - 14}h28l-6 10h-16z" fill="url(#tx-llauto)" stroke="${INK}" stroke-width="1.300"/><path d="M398 ${y - 12}v24l-10-5v-14z" fill="url(#tx-llauto)" stroke="${INK}" stroke-width="1.300"/>`).join('')}<path data-capa="forca" d="M250 541H384V256" class="flux s-taronja" data-flux="2.500"/></g>`;
    let eixos = '', corr = '';
    [EIX.g, EIX.p1, EIX.p2].forEach((y) => { eixos += T2(`M390 ${y}H950`, 7, 'ferro') + `<path data-capa="forca" d="M392 ${y}H948" class="flux s-taronja" data-flux="2.500"/>`; XS.forEach((x) => { eixos += politja(x, y); }); });
    XS.forEach((x) => { corr += corretja(x, EIX.g, 574, 10, 14) + corretja(x, EIX.p1, 410, 10, 8) + corretja(x, EIX.p2, 286, 10, 6); });
    s += `<g data-part="eixos">${eixos}</g><g data-part="corretges">${corr}</g>`;
    // màquines i treballadors
    s += `<g data-part="cardes">${XS.map((x) => carda(x, 620)).join('')}</g><g data-part="filadores">${XS.map((x) => filadora(x, 490)).join('')}</g><g data-part="telers">${XS.map((x, i) => teler(x, 360, i)).join('')}</g>`;
    s += `<g class="atenua">${figura(545, 620, 62, { camisa: '#6f5a7a' })}${figura(805, 620, 62, { camisa: '#4a5f7a', gir: true })}${figura(675, 490, 62, { camisa: '#8a6238' })}${figura(930, 490, 48, { camisa: '#5f7a4a', barret: false })}${figura(545, 360, 62, { camisa: '#4a5f7a' })}${figura(805, 360, 62, { camisa: '#8a4a3a', gir: true })}</g>`;
    // el cotó: carro, bales i recorregut
    const bala = (x, y) => `<rect x="${x}" y="${y}" width="52" height="30" rx="7" fill="#f6f1e4" stroke="${INK}" stroke-width="1.400"/><rect x="${x}" y="${y}" width="52" height="30" rx="7" fill="url(#sh-pla)"/><path d="M${x + 14} ${y}v30M${x + 38} ${y}v30" stroke="#8a7a5c" stroke-width="1.600"/>`;
    s += `<g data-part="coto">${ombra(1105, 622, 80, 5)}${caixa(1040, 574, 130, 14, 'fusta', 'tub')}${rodaR(1068, 600, 20, { raigs: 8, tex: 'fusta', gruix: 5, raig: 2 })}${rodaR(1142, 600, 20, { raigs: 8, tex: 'fusta', gruix: 5, raig: 2 })}${bala(1048, 544)}${bala(1104, 544)}${bala(1076, 514)}<g><rect x="928" y="318" width="44" height="14" rx="7" fill="#d9482b" stroke="${INK}" stroke-width="1.300"/><rect x="928" y="332" width="44" height="14" rx="7" fill="#2f7fb5" stroke="${INK}" stroke-width="1.300"/><rect x="928" y="346" width="44" height="14" rx="7" fill="#f2b632" stroke="${INK}" stroke-width="1.300"/></g></g>`;
    s += `<g data-capa="coto"><path d="M1040 604H436V474H916V344H930" class="nf" stroke="#fffdf7" stroke-width="12" stroke-linejoin="round" opacity=".7"/><path d="M1040 604H436V474H916V344H930" class="flux s-verd" stroke-width="8" data-flux="1.600" stroke-linejoin="round"/>${cartell(1150, 652, 'bales de cotó', { fons: '#5b8c35' })}${cartell(1066, 330, 'tela acabada', { fons: '#5b8c35' })}</g>`;
    s += cartell(424, 596, '1 · Cardar', { fons: '#fffdf7', color: '#2a2420', w: 108, attr: 'data-capa="coto"' }) + cartell(424, 466, '2 · Filar', { fons: '#fffdf7', color: '#2a2420', w: 96, attr: 'data-capa="coto"' }) + cartell(424, 336, '3 · Teixir', { fons: '#fffdf7', color: '#2a2420', w: 100, attr: 'data-capa="coto"' });
    s += txt(670, 118, aigua ? 'Filatura hidràulica' : 'Filatura de vapor', 'tx-g mig');
    return svg(s);
  }
  function anima(v) {
    return ({ t, p, el, svg: g }) => {
      if (!g._pintes) g._pintes = Array.from(g.querySelectorAll('.pinta'));
      g._pintes.forEach((l, i) => l.setAttribute('transform', `rotate(${(Math.sin(t * 7 + i) * 16).toFixed(1)} ${l.dataset.x} ${l.dataset.y})`));
      if (v !== 'aigua') {
        const th = t * 3, C = { x: 250 + 34 * Math.cos(th), y: 541 + 34 * Math.sin(th) }, xx = C.x - Math.sqrt(72 * 72 - Math.pow(C.y - 541, 2));
        el('f-volant').setAttribute('transform', `rotate(${(((th * 180) / Math.PI) % 360).toFixed(1)} 250 541)`);
        el('f-pist').setAttribute('transform', `translate(${xx.toFixed(1)} 541)`);
        ['f-biela', 'f-biela2'].forEach((id) => { const l = el(id); l.setAttribute('x1', xx.toFixed(1)); l.setAttribute('x2', C.x.toFixed(1)); l.setAttribute('y2', C.y.toFixed(1)); });
        el('f-cam').setAttribute('width', Math.max(0, xx - 76 - 66).toFixed(1));
      }
    };
  }
  const partsComunes = {
    arbre: { nom: 'Arbre vertical', text: 'Un eix dret que puja la força del motor a tots els pisos. A cada planta, un parell d’engranatges cònics canvia la direcció del gir.' },
    eixos: { nom: 'Eixos de transmissió', text: 'Barres de ferro que recorren el sostre de cada sala girant sense parar. Tenen una politja per a cada màquina.' },
    corretges: { nom: 'Corretges', text: 'Cintes de cuir que baixen del sostre i fan girar cada màquina. Si en treus una, només s’atura aquella màquina.' },
    cardes: { nom: 'Cardes', text: 'Tambors amb pues que desenreden el cotó i el deixen en una metxa tova i contínua.' },
    filadores: { nom: 'Filadores', text: 'Estiren la metxa amb corrons i la torcen fins a convertir-la en fil resistent.' },
    telers: { nom: 'Telers', text: 'Entrecreuen els fils (ordit i trama) per fer la tela.' },
    coto: { nom: 'El cotó', text: 'Entra en bales premsades i surt convertit en peces de tela. Tot el procés passa sota un mateix sostre.' }
  };
  const etqComunes = [['arbre', 300, 330, 380, 330, 'Arbre vertical'], ['eixos', 670, 172, 676, 258, 'Eix de transmissió'], ['corretges', 1080, 404, 880, 404, 'Corretja'], ['cardes', 960, 662, 890, 590, 'Cardes'], ['filadores', 1090, 480, 900, 466, 'Filadores'], ['telers', 1080, 276, 900, 308, 'Telers']];
  const capes = [{ id: 'forca', nom: 'Segueix la força', on: true }, { id: 'coto', nom: 'Segueix el cotó', on: false }];

  RI.capitol({
    id: 'fabrica', titol: 'La fàbrica', llegenda: [['#f08a4b', 'força del motor'], ['#5b8c35', 'camí del cotó']],
    escenes: [
      {
        id: 'hidraulica', nom: 'Fàbrica d’aigua', any: '1771', qui: 'Model d’Arkwright · Cromford', durada: 16, capes,
        model: 'Filatura de diversos pisos · model didàctic, no és un edifici concret',
        pregunta: 'Com mous cent màquines amb un sol motor?',
        intro: 'Abans es filava a casa, amb una roda per persona. La fàbrica ho capgira: <b>un sol motor</b> mou totes les màquines de l’edifici. Activa «Segueix la força» i «Segueix el cotó».',
        svg: () => fabrica('aigua'), anima: anima('aigua'), innova: [1], capaFase: { forca: [0, 1, 2], coto: [3] },
        fases: [
          { fins: 0.25, nom: 'L’aigua fa girar la roda', text: 'Un canal desvia l’aigua del riu i la deixa caure sobre la roda. El pes de l’aigua la fa girar dia i nit.', focus: ['motor'] },
          { fins: 0.5, nom: 'L’arbre vertical puja la força', text: 'L’eix de la roda entra a l’edifici i, amb engranatges, fa girar un arbre dret que travessa tots els pisos.', focus: ['arbre'] },
          { fins: 0.75, nom: 'Eixos i corretges la reparteixen', text: 'A cada sostre, un eix llarg gira contínuament. De cada politja baixa una corretja fins a una màquina.', focus: ['eixos', 'corretges'] },
          { fins: 1, nom: 'El cotó puja de pis en pis', text: 'A baix es carda, al mig es fila i a dalt es teixeix. Les persones ja no fan la força: alimenten i vigilen les màquines, al ritme que marca el motor.', focus: ['cardes', 'filadores', 'telers', 'coto'] }
        ],
        parts: Object.assign({ motor: { nom: 'Roda hidràulica', text: 'El motor de la fàbrica. Aprofita el pes de l’aigua que cau. Obliga a construir la fàbrica al costat d’un riu amb prou cabal.' } }, partsComunes),
        etiquetes: [['motor', 130, 400, 200, 480, 'Roda hidràulica']].concat(etqComunes),
        real: {
          img: 'img/real-fabrica.webp',
          titol: 'Filatura d’Arkwright a Cromford (1771)',
          museu: 'Cromford Mills · Derbyshire (Regne Unit)',
          lic: 'Foto: Alan Heardman · Wikimedia Commons · CC BY-SA 2.0'
        },
        clau: 'La fàbrica és una sola gran màquina: un motor, una xarxa d’eixos i moltes màquines treballant alhora.',
        batx: { titol: 'Disciplina de fàbrica', text: 'Com que tot depèn d’un sol motor, tothom ha de començar i acabar alhora: horaris, torns, sirenes i vigilants. Compara-ho amb el treball a domicili, on cada família decidia el seu ritme. La tècnica imposa una nova organització del treball.', font: 'https://www.cromfordmills.org.uk/', fontNom: 'Cromford Mills · la primera filatura hidràulica' }
      },
      {
        id: 'vaporera', nom: 'Fàbrica de vapor', any: 'des de 1785', qui: 'Manchester, Barcelona...', durada: 16, capes,
        model: 'El mateix edifici amb una màquina de vapor · model didàctic',
        pregunta: 'Què canvia si traiem la roda i hi posem vapor?',
        intro: 'Per dins, la fàbrica és igual: arbre, eixos i corretges. Però ara el motor és una <b>màquina de vapor</b>. Fixa’t en què apareix de nou a l’esquerra.',
        svg: () => fabrica('vapor'), anima: anima('vapor'), innova: [0, 1], capaFase: { forca: [0, 1, 2], coto: [3] },
        fases: [
          { fins: 0.25, nom: 'El carbó escalfa la caldera', text: 'Ja no cal un riu: cal carbó. Per això les fàbriques es traslladen a prop de les mines, dels ports o del tren.', focus: ['caldera', 'xemeneia'] },
          { fins: 0.5, nom: 'El pistó fa girar el volant', text: 'El vapor empeny el pistó, la biela mou el volant i el volant fa girar el mateix arbre vertical d’abans.', focus: ['motor', 'arbre'] },
          { fins: 0.75, nom: 'La mateixa transmissió', text: 'Eixos i corretges reparteixen la força igual que a la fàbrica d’aigua. La diferència és que es pot afegir més potència: més pisos, més màquines.', focus: ['eixos', 'corretges'] },
          { fins: 1, nom: 'Fàbriques a la ciutat', text: 'Sense dependre del riu ni de la sequera, les fàbriques s’amunteguen a les ciutats. El paisatge s’omple de xemeneies.', focus: ['xemeneia', 'cardes', 'filadores', 'telers'] }
        ],
        parts: Object.assign({ caldera: { nom: 'Caldera', text: 'Crema carbó per produir el vapor. Necessita fogoners i un subministrament constant de combustible.' }, xemeneia: { nom: 'Xemeneia', text: 'Treu el fum ben amunt i fa tirar el foc. És el símbol del paisatge industrial.' }, motor: { nom: 'Màquina de vapor', text: 'Cilindre, pistó, biela i volant: converteix la pressió del vapor en el gir que mou tota la fàbrica.' } }, partsComunes),
        etiquetes: [['xemeneia', 80, 200, -22, 220], ['caldera', 30, 396, 0, 480], ['motor', 200, 400, 230, 470, 'Màquina de vapor']].concat(etqComunes),
        clau: 'El vapor allibera la fàbrica del riu: es pot instal·lar on hi hagi carbó, treballadors i clients.',
        batx: { titol: 'El vapor no va substituir l’aigua de cop', text: 'A Anglaterra l’energia hidràulica va ser majoritària a la indústria cotonera fins ben entrat el segle XIX, i a Catalunya les colònies tèxtils del Ter i el Llobregat van triar l’aigua perquè el carbó era car. Per què conviuen dues tecnologies durant dècades?', font: 'https://www.mnactec.cat/', fontNom: 'Museu de la Ciència i de la Tècnica de Catalunya' }
      }
    ],
    repte: [
      { q: 'Quina és la idea essencial d’una fàbrica?', o: ['Cada treballador té el seu motor', 'Un sol motor mou totes les màquines', 'Les màquines funcionen a mà'], c: 1, e: 'Roda o màquina de vapor: una única font de força per a tot l’edifici.' },
      { tipus: 'toca', esc: 'hidraulica', part: 'arbre', p: 0.4, q: 'Toca la peça que puja la força del motor fins als pisos de dalt.', e: 'L’arbre vertical: travessa els pisos i, amb engranatges, fa girar l’eix de cada planta.' },
      { tipus: 'ordena', esc: 'hidraulica', q: 'Ordena el camí de la força dins la fàbrica d’aigua.', e: 'Roda hidràulica → arbre vertical → eixos i corretges → màquines que treballen el cotó.' },
      { q: 'Què fa la corretja?', o: ['Subjecta el sostre', 'Porta el gir de l’eix del sostre fins a cada màquina', 'Transporta el cotó'], c: 1, e: 'Cada màquina rep el moviment per la seva corretja.' },
      { q: 'En quin ordre es treballa el cotó?', o: ['Teixir, filar, cardar', 'Cardar, filar, teixir', 'Filar, cardar, teixir'], c: 1, e: 'Primer es desenreda (cardar), després es fa fil (filar) i al final tela (teixir).' },
      { q: 'Quin límit tenia la fàbrica hidràulica?', o: ['Havia d’estar al costat d’un riu amb prou aigua', 'No podia tenir més d’un pis', 'Només funcionava de nit'], c: 0, e: 'Depenia del lloc i del cabal: sequeres i glaçades l’aturaven.' },
      { q: 'Què permet la màquina de vapor?', o: ['Fabricar sense treballadors', 'Posar la fàbrica a la ciutat, prop del carbó i dels transports', 'No gastar combustible'], c: 1, e: 'La força ja no depèn del riu, però sí del carbó.' }
    ]
  });
})();

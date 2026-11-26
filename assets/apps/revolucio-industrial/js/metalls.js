// SPDX-License-Identifier: AGPL-3.0-or-later
/* Capítol 5 · Ferro i acer: coc, alt forn, pudelació, laminatge i convertidor Bessemer. */
(function () {
  const { svg, foc, focs, roda, persona, nuvol, arbre, txt, retol, fletxa, tram, lerp, color } = RI;
  const cel = (h) => `<rect class="cel" x="-60" width="1320" height="${h}"/><rect class="terra" x="-60" y="${h}" width="1320" height="${720 - h}"/><rect class="herba" x="-60" y="${h - 4}" width="1320" height="10"/>`;
  const tub = (d, c, g) => `<path d="${d}" class="nf" stroke="#2a2420" stroke-width="${(g || 8) + 5}" stroke-linejoin="round"/><path d="${d}" class="nf" stroke="${c}" stroke-width="${g || 8}" stroke-linejoin="round"/>`;
  const soca = (x, y) => `<g><path class="t2" fill="#8f6038" d="M${x - 11} ${y + 2}l3-13h16l3 13z"/><ellipse cx="${x}" cy="${y - 11}" rx="8" ry="3" fill="#d9b383" stroke="#2a2420" stroke-width="1.6"/></g>`;

  /* ---------- 1 · del carbó al coc ---------- */
  function coc() {
    const { caixa, cami, cartell, ombra } = RI, INK = '#2e221a';
    let s = `<rect x="-60" y="0" width="1320" height="566" fill="url(#g-cel)"/><path d="M-60 520c220-60 420-20 600-40s430-50 720 6v90H-60z" fill="#b3cc93" opacity=".55"/>` + cami('M-60 560H1260V720H-60Z', 'terra', 'pla') + `<rect x="-60" y="554" width="1320" height="12" fill="url(#tx-herba)"/>`;
    s += `<text x="180" y="76" class="tx-g mig">Abans: carbó vegetal</text><text x="600" y="76" class="tx-g mig">El forn de coc</text><text x="1020" y="76" class="tx-g mig">El resultat: coc</text><path d="M395 54V648M805 54V648" class="t1 nf" stroke-dasharray="4 8" opacity=".6"/>`;
    // bosc que es va talant, pila de llenya i carbonera coberta de terra
    [[34, 560, 0.92], [96, 560, 1.05], [164, 558, 0.88], [244, 560, 1.1], [318, 560, 0.94]].forEach(([x, y, k], i) => { s += soca(x, y) + arbre(x, y, k, { id: 'ar' + i }); });
    s += `<g id="llenya" opacity="0.25">${[[42, 548], [56, 548], [70, 548], [49, 536], [63, 536], [56, 524]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#d9b383" stroke="${INK}" stroke-width="1.200"/><circle cx="${x}" cy="${y}" r="3.500" fill="none" stroke="#a8733f" stroke-width="1"/>`).join('')}</g>`;
    s += ombra(190, 562, 86, 6) + cami('M116 560Q150 470 164 470h52q14 0 48 90z', 'terra', 'cup', { tint: '#3a2a1c', to: 0.35 }) + `<path d="M140 560l24-80M190 474v86M240 560l-24-80" stroke="#2e1f14" stroke-width="2" opacity=".5"/><rect x="178" y="458" width="24" height="15" rx="2" fill="#2b2826" stroke="${INK}" stroke-width="1.300"/><g data-puf="190 452 24 -75 5 11 2.400" class="fum boira"></g>`;
    s += cartell(185, 616, 'un sol forn es menja un bosc', { fons: '#b23a1f', w: 264, attr: 'data-en="0"' });
    s += cartell(185, 224, '✗ s’acaben els boscos', { fons: '#a8452f', w: 230 }) + cartell(185, 262, '✗ la fusta és cada cop més cara', { fons: '#a8452f', w: 270 }) + cartell(185, 300, '✗ tou: s’esclafa en forns alts', { fons: '#a8452f', w: 262 });
    // forn de coc de volta (rusc), tallat per veure'n la càrrega
    s += `<g data-part="forn">${ombra(600, 562, 180, 7)}<g filter="url(#f-projecta)">${cami('M446 560V416Q446 266 600 266T754 416V560Z', 'mao', 'cup')}</g>${caixa(438, 420, 14, 140, 'ferro', 'cil')}${caixa(748, 420, 14, 140, 'ferro', 'cil')}<path d="M484 560V426Q484 308 600 308T716 426V560Z" fill="#2a1710"/><path d="M484 560V426Q484 308 600 308T716 426V560Z" fill="url(#sh-fosc)"/>`;
    s += `<path id="carrega" d="M488 558V464q112-46 224 0V558z" fill="url(#tx-carbo)"/><path id="roent" d="M488 558V464q112-46 224 0V558z" fill="url(#g-bany)" opacity="0"/><path d="M488 558V464q112-46 224 0V558z" class="vora"/><path d="M484 560V426Q484 308 600 308T716 426V560Z" fill="none" stroke="#e9b08c" stroke-width="2.600"/>`;
    s += caixa(580, 246, 40, 24, 'ferro', 'llum', { rx: 2 }) + cami('M558 560v-58q0-14 14-14h56q14 0 14 14v58z', 'ferro', 'llum') + `<path d="M576 506h48M576 526h48" stroke="#b3bcc3" stroke-width="1.600"/></g>`;
    s += `<g data-en="1"><g data-puf="600 240 28 -120 6 14 1.900" class="fum boira"></g>${cartell(600, 616, 'marxen gasos, quitrà i sofre', { w: 280 })}${cartell(600, 174, 'gairebé sense aire: no crema, es cou', { fons: '#fffdf7', color: '#2a2420', w: 330 })}</g>`;
    // pila de coc: gris, porós i dur
    let pila = '';
    [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1]].forEach(([f, n]) => { for (let c = 0; c < n; c++) { const px = 900 + c * 42 + f * 21, py = 556 - f * 30; pila += `<path d="M${px} ${py}l9-22 23-6 14 13-6 17z" fill="url(#tx-plom)" stroke="${INK}" stroke-width="1.400" stroke-linejoin="round"/><path d="M${px} ${py}l9-22 23-6 14 13-6 17z" fill="url(#sh-cup)" opacity=".7"/><circle cx="${px + 14}" cy="${py - 11}" r="2.200" fill="#32373b"/><circle cx="${px + 26}" cy="${py - 8}" r="1.800" fill="#32373b"/><circle cx="${px + 20}" cy="${py - 17}" r="1.600" fill="#32373b"/><circle cx="${px + 32}" cy="${py - 16}" r="1.300" fill="#32373b"/>`; } });
    s += `<g data-part="coc"><g id="pila" opacity="0">${ombra(1010, 560, 130, 6)}${pila}${cartell(1020, 224, '✓ crema molt més calent', { fons: '#3e6e22', w: 250 })}${cartell(1020, 262, '✓ dur: aguanta grans torres', { fons: '#3e6e22', w: 260 })}${cartell(1020, 300, '✓ abundant: ve de la mina', { fons: '#3e6e22', w: 250 })}${fletxa('M1020 572V624', '#d9482b', 6)}${cartell(1020, 662, 'cap a l’alt forn →', { fons: '#fffdf7', color: '#2a2420', w: 190 })}</g></g>`;
    s += `<g data-en="0">${cartell(600, 616, 'entra carbó mineral (de la mina)', { w: 290 })}</g><g data-en="2">${cartell(600, 174, 'ha perdut els gasos i el sofre', { fons: '#fffdf7', color: '#2a2420', w: 280 })}${cartell(600, 616, 'surt coc: gris, porós i dur', { fons: '#3e6e22', w: 250 })}</g>`;
    return svg(s);
  }
  function animaCoc({ p, k, el }) {
    for (let i = 0; i < 5; i++) el('ar' + i).setAttribute('opacity', k === 0 ? (p > 0.05 + i * 0.05 ? 0.14 : 1) : 0.14);
    el('llenya').setAttribute('opacity', k === 0 ? (p > 0.12 ? 1 : 0.35) : 0.85);
    el('roent').setAttribute('opacity', k === 1 ? (0.5 + 0.3 * Math.sin(p * 55)).toFixed(2) : 0);
    el('carrega').setAttribute('fill', k >= 2 ? 'url(#tx-plom)' : 'url(#tx-carbo)');
    el('pila').setAttribute('opacity', k >= 2 ? 1 : 0);
  }

  /* ---------- 2 · alt forn ---------- */
  function altForn() {
    const { caixa, cami, cartell, ombra, figura, rodaR, brida, reblons, flamarada } = RI, T2 = RI.tub, INK = '#2e221a';
    let s = `<rect x="-60" y="0" width="1320" height="614" fill="url(#g-cel)"/><g filter="url(#f-suau)">${nuvol(150, 96, 1.4)}${nuvol(390, 62, 1.0)}</g>` + cami('M-60 610H1260V720H-60Z', 'terra', 'pla');
    // vessant on es recolza el forn: per dalt s'hi arriba amb la càrrega
    s += cami('M740 150H1270V720H700Z', 'terra', 'llum') + `<rect x="740" y="143" width="530" height="12" fill="url(#tx-herba)"/><path d="M740 150L700 720" stroke="${INK}" stroke-width="1.500"/>`;
    s += `<defs><clipPath id="cl-cuba"><path d="M526 150L466 426L516 516V588H604V516L654 426L594 150Z"/></clipPath></defs>`;
    s += `<g data-part="cuba">${ombra(560, 612, 200, 8)}<g filter="url(#f-projecta)">${cami('M376 610L456 130H664L744 610Z', 'mao', 'llum')}</g>`;
    [[240, 440, 680], [360, 422, 698], [480, 402, 718]].forEach(([y, a, b]) => { s += `<rect x="${a}" y="${y - 4}" width="${b - a}" height="8" fill="#30353a" stroke="${INK}" stroke-width="1"/><rect x="${a}" y="${y - 4}" width="${b - a}" height="8" fill="url(#sh-tub)"/>` + reblons(a + 10, y, b - 10, y, 12, 1.800, '#8c959c'); });
    s += `<path d="M526 150L466 426L516 516V588H604V516L654 426L594 150Z" fill="#3a2016"/><g clip-path="url(#cl-cuba)"><g id="fcapes">${Array.from({ length: 7 }, (_, i) => `<rect x="440" y="${-120 + i * 90}" width="240" height="30" fill="url(#tx-carbo)"/><rect class="mineral" x="440" y="${-90 + i * 90}" width="240" height="30"/><rect class="calc" x="440" y="${-60 + i * 90}" width="240" height="30"/>`).join('')}</g>`;
    s += `<rect x="440" y="395" width="240" height="200" fill="url(#g-bany)" opacity=".94"/><rect x="440" y="300" width="240" height="105" fill="#ff9a2e" opacity=".5"/><rect x="440" y="150" width="240" height="445" fill="url(#sh-cil)" opacity=".45"/></g><path d="M526 150L466 426L516 516V588H604V516L654 426L594 150Z" fill="none" stroke="#e9b08c" stroke-width="2.800"/><path d="M526 150L466 426L516 516V588H604V516L654 426L594 150Z" class="vora"/></g>`;
    // gresol: l'escòria sura sobre el ferro colat
    s += `<g data-part="gresol"><rect x="518" y="562" width="84" height="24" fill="#fff3a0" stroke="${INK}" stroke-width="1.300"/><rect x="518" y="544" width="84" height="18" fill="#6b635a" stroke="${INK}" stroke-width="1.300"/><text x="560" y="579" class="tx-p mig" style="font-size:12px;font-weight:800">ferro</text><text x="560" y="557" class="tx-p mig" style="font-size:11px;fill:#fff">escòria</text></g>`;
    // boca de càrrega i passarel·la
    s += `<g data-part="carrega">${caixa(634, 132, 142, 13, 'fusta', 'tub')}${T2('M680 146v34M726 146v34', 6, 'fusta')}${figura(806, 146, 76, { gir: true })}${cami('M694 132l36-28h42l-10 28z', 'fustaf', 'llum')}<path class="mineral" d="M712 114h42l-6 10h-34z"/><g>${rodaR(700, 128, 12, { raigs: 6, gruix: 3, raig: 1.500 })}</g><g data-fase="0-0.25"><g data-puf="596 122 -28 42 4 6 1" class="fum" opacity=".9"></g></g><g data-en="0">${cartell(970, 224, 'mineral de ferro', { fons: '#9a4f32' })}${cartell(970, 262, 'coc', { fons: '#2b2826', w: 80 })}${cartell(970, 300, 'pedra calcària', { fons: '#fffdf7', color: '#2a2420' })}</g></g>`;
    s += `<g data-puf="560 132 22 -90 6 16 2.100" class="fum boira" opacity=".6"></g>${flamarada(560, 150, 46, 70)}`;
    // màquina bufadora: cilindre d'aire amb èmbol, volant i toveres
    s += `<g data-part="bufadora">${ombra(146, 612, 110, 7)}${caixa(58, 490, 176, 120, 'pedra', 'pla')}${caixa(86, 362, 112, 128, 'ferro', 'cil', { rx: 6 })}${reblons(92, 370, 192, 370, 8, 2, '#8c959c')}${reblons(92, 482, 192, 482, 8, 2, '#8c959c')}<rect x="98" y="378" width="88" height="96" fill="#dbe9ef" stroke="${INK}" stroke-width="1.400"/><rect x="98" y="378" width="88" height="96" fill="url(#sh-cil)" opacity=".5"/>`;
    s += `${caixa(128, 330, 28, 32, 'ferro', 'cil')}<g id="embol">${caixa(98, -8, 88, 16, 'ferro', 'tub')}${T2('M142 -92V0', 9, 'ferro')}</g><g data-girat="64 420 70">${rodaR(64, 420, 42, { raigs: 6, gruix: 9 })}</g><circle cx="142" cy="300" r="10" fill="url(#g-esf-llauto)" class="vora2"/>`;
    s += `${T2('M198 468H422V498H520', 12, 'plom')}${brida(260, 468, 8, 20, 'ferro')}${brida(422, 484, 20, 8, 'ferro')}${cami('M490 486l34 6v12l-34 6z', 'llauto', 'tub')}<path d="M202 468H422V498H516" class="flux s-blau" data-flux="3" stroke-width="5"/>${T2('M704 498H600', 12, 'plom')}${cami('M630 486l-34 6v12l34 6z', 'llauto', 'tub')}<path d="M700 498H604" class="flux s-blau" data-flux="3" stroke-width="5"/></g>`;
    s += `<g data-en="1">${cartell(308, 424, 'aire a pressió', { fons: '#2f7fb5' })}</g><g data-en="2">${cartell(970, 412, 'més de 1.500 °C', { fons: '#d9482b' })}${cartell(970, 184, 'a dalt, uns 200 °C', { fons: '#f2b632', color: '#2a2420' })}${fletxa('M900 390V212', '#d9482b', 5)}${cartell(970, 494, 'calcària atrapa impureses → escòria', { fons: '#6b635a', w: 295 })}</g>`;
    // llit de colada: canals de sorra on el ferro fa lingots
    const canals = 'M518 584Q468 592 468 634H160M434 634V674M384 634V674M334 634V674M284 634V674M234 634V674M184 634V674';
    s += `<g data-part="llit"><path d="M130 622H496V684H130Z" fill="#d8c49a" stroke="${INK}" stroke-width="1.500"/><path d="M130 622H496V684H130Z" fill="url(#tx-terra)" opacity=".25"/><path d="${canals}" class="nf" stroke="#6b4f33" stroke-width="14" stroke-linecap="round"/><path d="${canals}" class="nf" stroke="#8a6a4a" stroke-width="10" stroke-linecap="round"/><path id="colada" d="${canals}" class="nf" stroke="#ffb02e" stroke-width="8" stroke-linecap="round" stroke-dasharray="900" stroke-dashoffset="900"/></g>`;
    s += `<g data-en="3">${cartell(312, 594, 'ferro colat en lingots', { fons: '#d9482b', w: 224 })}</g>`;
    return svg(s);
  }
  function animaForn({ p, t, el }) {
    el('fcapes').setAttribute('transform', `translate(0 ${((t * 14) % 90).toFixed(1)})`);
    el('embol').setAttribute('transform', `translate(0 ${(430 + 40 * Math.sin(t * 3)).toFixed(1)})`);
    el('colada').setAttribute('stroke-dashoffset', p < 0.75 ? 900 : tram(p, 0.76, 0.95, 900, 0).toFixed(0));
  }

  /* ---------- 3 · pudelació i laminatge ---------- */
  function pudelat() {
    const { caixa, cami, cartell, ombra, figura, brasa, reblons } = RI, INK = '#2e221a';
    let s = RI.fons(0) + cami('M-60 600H1260V720H-60Z', 'pedra', 'pla');
    s += `<g data-part="xemeneia"><g filter="url(#f-projecta)">${cami('M520 600L528 90h60l8 510z', 'mao', 'llum')}</g>${caixa(522, 80, 72, 12, 'pedra', 'pla')}<path d="M558 330V100" class="flux s-gris" data-flux="2"/></g><g data-puf="558 78 30 -60 5 13 2.200" class="fum boira"></g>`;
    // forn de reverber: la flama passa per sobre d'un mur i no toca el ferro
    s += `<g data-part="forn">${ombra(290, 604, 270, 8)}<g filter="url(#f-projecta)">${cami('M36 600V330Q284 246 534 330V600Z', 'mao', 'pla')}</g>${caixa(30, 350, 12, 250, 'ferro', 'cil')}${caixa(526, 350, 12, 250, 'ferro', 'cil')}<path d="M68 520V370Q284 300 510 360V440H460V520H218V440H188V520Z" fill="#2a1710"/><path d="M68 520V370Q284 300 510 360V440H460V520H218V440H188V520Z" fill="url(#sh-fosc)" opacity=".6"/><path d="M68 520V370Q284 300 510 360V440H460V520H218V440H188V520Z" fill="none" stroke="#e9b08c" stroke-width="2.400"/>`;
    s += `<path d="M108 500Q200 330 330 400T520 380" fill="none" stroke="#ff8a2a" stroke-width="20" stroke-linecap="round" opacity=".35" filter="url(#f-boira)"/><path d="M108 500Q200 330 330 400T520 380" class="flux s-taronja" stroke-width="9" data-flux="2.200"/><path d="M108 470Q210 350 340 430" class="flux s-groc" stroke-width="6" data-flux="2.600"/></g>`;
    s += `<g data-part="fogar"><path d="M70 520H186" stroke="${INK}" stroke-width="4.500" stroke-linecap="round"/>${brasa(128, 518, 96, 58)}</g>`;
    s += `<g data-part="sola"><path d="M222 518V478q116-18 234 0V518z" fill="url(#g-bany)" stroke="${INK}" stroke-width="1.500"/><ellipse cx="340" cy="476" rx="110" ry="14" fill="url(#g-resplendor)"/><g id="bola-g"><circle id="bola" cx="340" cy="484" r="26" fill="url(#g-roent)" stroke="${INK}" stroke-width="1.500" opacity="0"/></g></g>`;
    // pudelador amb el ganxo
    s += `<g data-part="pudelador">${figura(594, 600, 156, { gir: true, camisa: '#7a5a3a', brac: 'M-9-70q16 8 36 6M9-70q14 12 30 12' })}<path d="M582 524h24l4 50h-32z" fill="#5b3a20" stroke="${INK}" stroke-width="1.300"/><line id="ganxo" x1="540" y1="506" x2="340" y2="486" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>`;
    s += `<g data-en="0">${cartell(286, 244, 'la flama passa per sobre: el carbó no toca el ferro', { w: 450 })}</g><g data-en="1">${cartell(286, 244, 'remenant, el carboni es crema i el ferro s’espesseix', { fons: '#d9482b', w: 460 })}${cartell(694, 244, '4 % → < 0,1 % C', { fons: '#a8452f', w: 160 })}</g>`;
    // laminador: castell de ferro colat i dos corrons que giren en sentit contrari
    const corro = (id, y) => `<g id="${id}"><circle cx="900" cy="${y}" r="56" fill="url(#tx-acer)" stroke="${INK}" stroke-width="1.500"/><circle cx="900" cy="${y}" r="56" fill="url(#sh-bola)" opacity=".55"/><circle cx="900" cy="${y}" r="40" fill="none" stroke="${INK}" stroke-width="1" opacity=".5"/><circle cx="900" cy="${y}" r="17" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.300"/><path d="M900 ${y - 52}v24M900 ${y + 28}v24M848 ${y}h24M928 ${y}h24" stroke="${INK}" stroke-width="2.600" stroke-linecap="round" opacity=".7"/></g>`;
    s += `<g data-part="laminador">${ombra(900, 604, 130, 7)}${caixa(804, 582, 192, 18, 'pedra', 'pla')}<g filter="url(#f-projecta)"><path d="M820 582V226h160V582h-30V268H850V582z" fill="url(#tx-ferro)"/><path d="M820 582V226h160V582h-30V268H850V582z" fill="url(#sh-llum)"/><path d="M820 582V226h160V582h-30V268H850V582z" class="vora"/></g>${caixa(814, 216, 172, 15, 'ferro', 'tub', { rx: 3 })}${reblons(835, 250, 835, 566, 9, 2.200, '#8c959c')}${reblons(965, 250, 965, 566, 9, 2.200, '#8c959c')}${caixa(888, 196, 24, 22, 'llauto', 'cil', { rx: 3 })}`;
    s += `<rect id="barra-e" x="660" y="369" width="230" height="34" rx="6" fill="url(#g-roent)" stroke="${INK}" stroke-width="1.500"/><rect id="barra-s" x="900" y="377" width="0" height="18" rx="4" fill="url(#g-roent)" stroke="${INK}" stroke-width="1.500"/>${corro('corro1', 321)}${corro('corro2', 451)}</g>`;
    s += `<g data-en="3">${cartell(900, 174, 'els corrons l’aprimen i l’allarguen', { fons: '#d9482b', w: 320 })}<text x="745" y="356" class="tx-p mig" style="font-weight:800">entra gruixuda</text><text x="1085" y="420" class="tx-p mig" style="font-weight:800">surt prima i llarga</text></g>`;
    s += `<g><text x="1084" y="544" class="tx mig">barra · planxa · rail</text><rect x="1010" y="562" width="52" height="13" rx="2" fill="url(#tx-acer)" class="vora2"/><rect x="1072" y="566" width="60" height="6" rx="1" fill="url(#tx-acer)" class="vora2"/><path d="M1146 582h34v-6h-11v-14h7v-8h-26v8h7v14h-11z" fill="url(#tx-acer)" class="vora2"/></g>`;
    return svg(s);
  }
  function animaPud({ p, t, k, el }) {
    const a = t * 4, gx = 340 + 62 * Math.cos(a), gy = 492 + 10 * Math.sin(a * 2);
    const g = el('ganxo'); g.setAttribute('x2', k === 1 ? gx.toFixed(1) : 340); g.setAttribute('y2', k === 1 ? gy.toFixed(1) : 488);
    const b = el('bola'), f = tram(p, 0.5, 0.66, 0, 1);
    b.setAttribute('opacity', p > 0.4 && p < 0.68 ? 1 : 0); b.setAttribute('cx', lerp(340, 700, f).toFixed(1)); b.setAttribute('cy', lerp(484, 385, f).toFixed(1));
    const q = tram(p, 0.68, 0.98, 0, 1, true), e = el('barra-e'), sx = el('barra-s');
    e.setAttribute('opacity', p >= 0.66 ? 1 : 0); e.setAttribute('x', (660 + 230 * q).toFixed(1)); e.setAttribute('width', Math.max(0, 230 * (1 - q)).toFixed(1));
    sx.setAttribute('opacity', p >= 0.68 ? 1 : 0); sx.setAttribute('width', (320 * q).toFixed(1));
    const gir = p >= 0.66 ? (t * 220) % 360 : 0;
    el('corro1').setAttribute('transform', `rotate(${gir.toFixed(1)} 900 321)`); el('corro2').setAttribute('transform', `rotate(${(-gir).toFixed(1)} 900 451)`);
  }

  /* ---------- 4 · convertidor Bessemer ---------- */
  const PERA = 'M-45 -180C-70 -120 -125 -60 -125 20C-125 90 -100 150 -80 150H80C100 150 125 90 125 20C125 -60 70 -120 45 -180Z';
  const BUIT = 'M-30 -176C-52 -116 -102 -58 -102 20C-102 80 -84 128 -66 128H66C84 128 102 80 102 20C102 -58 52 -116 30 -176Z';
  function bessemer() {
    const { caixa, cami, cartell, ombra, rodaR, reblons, flamarada, brida } = RI, T2 = RI.tub, INK = '#2e221a';
    let s = RI.fons(0) + cami('M-60 640H1260V720H-60Z', 'pedra', 'pla');
    s += `<defs><clipPath id="cl-pera"><path d="${BUIT}"/></clipPath></defs>` + ombra(600, 644, 280, 9);
    s += `<g filter="url(#f-projecta)">${cami('M740 640L772 350h36L840 640z', 'ferro', 'llum')}${cami('M360 640L392 350h36L460 640z', 'ferro', 'llum')}</g>`;
    s += `<g data-en="0">${cami('M130 148h168l40 40-12 12-34-28H130z', 'ferro', 'pla')}<path d="M330 194Q378 248 424 306" class="nf" stroke="#ff9a2e" stroke-width="12" stroke-linecap="round"/><path d="M330 194Q378 248 424 306" class="nf" stroke="#fff3a0" stroke-width="4" stroke-linecap="round"/>${cartell(208, 118, 'ferro colat líquid', { fons: '#d9482b', w: 190 })}</g>`;
    s += `<g id="pera" transform="translate(600 360)"><g data-part="convertidor"><path d="${PERA}" fill="url(#tx-ferro)"/><path d="${PERA}" fill="url(#sh-cil)"/><path d="${PERA}" class="vora"/>${reblons(-112, -20, 112, -20, 13, 2.400, '#8c959c')}${reblons(-118, 40, 118, 40, 13, 2.400, '#8c959c')}<path d="${BUIT}" fill="#3a2016"/><g clip-path="url(#cl-pera)"><g id="bany-g"><rect id="bany" x="-400" y="25" width="800" height="500" fill="#f08a4b"/><g id="bombolles" opacity="0">${Array.from({ length: 11 }, (_, i) => `<circle class="bb" cx="${-70 + i * 14}" cy="100" r="5" fill="#fffdf7"/>`).join('')}</g></g><path d="${BUIT}" fill="url(#sh-cil)" opacity=".4"/></g><path d="${BUIT}" fill="none" stroke="#e9b08c" stroke-width="2.600"/><path d="${BUIT}" class="vora"/></g>`;
    s += `<g data-part="toveres">${caixa(-84, 150, 168, 26, 'ferro', 'tub', { rx: 4 })}<path d="M-60 150v-22M-30 150v-22M0 150v-22M30 150v-22M60 150v-22" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M-60 150v-22M-30 150v-22M0 150v-22M30 150v-22M60 150v-22" stroke="#c9d6dc" stroke-width="2.400" stroke-linecap="round"/></g>`;
    s += `<g id="flama" opacity="0">${flamarada(0, -176, 86, 200)}<g id="espurnes">${Array.from({ length: 10 }, (_, i) => `<circle class="esp" cx="${-28 + i * 6}" cy="-260" r="3" fill="#fff6b0"/>`).join('')}</g><g data-puf="0 -330 0 -160 8 9 0.900" class="calor boira"></g></g></g>`;
    // eix buit per on entra l'aire, i màquina bufadora
    s += `<g data-part="eix"><circle cx="410" cy="360" r="20" fill="url(#g-esf-llauto)" class="vora2"/><circle cx="790" cy="360" r="20" fill="url(#g-esf-llauto)" class="vora2"/>${T2('M790 360H1000V534', 12, 'plom')}${brida(880, 360, 8, 20, 'ferro')}${brida(1000, 450, 20, 8, 'ferro')}<path d="M996 530V360H794" class="flux s-blau" stroke-width="5" data-flux="3" data-fase="0.3-0.7"/>`;
    s += `${caixa(926, 608, 150, 32, 'pedra', 'pla')}${caixa(944, 534, 114, 74, 'ferro', 'llum', { rx: 6 })}<circle cx="980" cy="566" r="14" fill="#fffdf7" class="vora2"/><path d="M980 566l8-8" stroke="${INK}" stroke-width="2.200" stroke-linecap="round"/><g data-girat="1042 570 160">${rodaR(1042, 570, 32, { raigs: 6, gruix: 7 })}</g><text x="980" y="598" class="tx-p mig" style="font-size:12px;fill:#fffdf7">bufadora</text></g>`;
    // cullera de colada
    s += `<g data-part="cullera">${cami('M236 550h144l-14 78H250z', 'ferro', 'llum')}${T2('M236 550v-32M380 550v-32', 5, 'ferro')}<path id="acer-c" d="M244 590h128l-8 36H252z" fill="url(#g-bany)" opacity="0"/><path id="raig" d="M440 440Q380 480 318 590" class="nf" stroke="#fff3a0" stroke-width="12" stroke-linecap="round" opacity="0"/></g>`;
    s += `<g data-en="2">${cartell(940, 146, 'l’aire crema el carboni', { fons: '#d9482b', w: 220 })}${cartell(940, 182, 'C + O₂ → CO₂ ↑ (sense carbó)', { w: 264 })}${cartell(980, 442, '1.200 → 1.600 °C (sense combustible)', { fons: '#a8452f', w: 300 })}<text id="minuts" x="940" y="256" class="tx-gg mig">minut 0 de 20</text><text x="940" y="284" class="tx-p mig">4 % → 0,5 % de carboni</text></g><g data-en="3">${cartell(140, 514, 'acer líquid', { fons: '#f2b632', color: '#2a2420', w: 130 })}</g>`;
    return svg(s);
  }
  function animaBes({ p, t, el, svg: g }) {
    const a = p < 0.2 ? -75 : p < 0.3 ? tram(p, 0.2, 0.3, -75, 0) : p < 0.7 ? 0 : p < 0.8 ? tram(p, 0.7, 0.8, 0, -115) : -115;
    el('pera').setAttribute('transform', `translate(600 360) rotate(${a.toFixed(1)})`);
    el('bany-g').setAttribute('transform', `rotate(${(-a).toFixed(1)})`);
    const niv = p < 0.2 ? tram(p, 0.02, 0.2, 124, 36) : p < 0.8 ? 36 : tram(p, 0.8, 0.98, 36, 132);
    el('bany').setAttribute('y', niv.toFixed(1));
    el('bany').setAttribute('fill', color('#f08a4b', '#fff3a0', (p - 0.3) / 0.4));
    const bufa = p >= 0.3 && p < 0.7;
    el('flama').setAttribute('opacity', bufa ? 1 : 0);
    el('bombolles').setAttribute('opacity', bufa ? 1 : 0);
    if (bufa) {
      if (!g._bb) { g._bb = Array.from(g.querySelectorAll('.bb')); g._esp = Array.from(g.querySelectorAll('.esp')); }
      g._bb.forEach((c, i) => c.setAttribute('cy', (126 - ((t * 90 + i * 23) % 85)).toFixed(1)));
      g._esp.forEach((c, i) => {
        const f = ((t * 2.4 + i * 0.13) % 1);
        c.setAttribute('cx', (((i - 4.5) * 14) * (0.4 + f)).toFixed(1));
        c.setAttribute('cy', (-210 - f * 170).toFixed(1));
        c.setAttribute('opacity', (1 - f).toFixed(2));
      });
      el('minuts').textContent = 'minut ' + Math.round(((p - 0.3) / 0.4) * 20) + ' de 20';
    }
    el('raig').setAttribute('opacity', p > 0.8 && p < 0.98 ? 1 : 0);
    el('acer-c').setAttribute('opacity', p > 0.82 ? tram(p, 0.82, 0.98, 0, 1).toFixed(2) : 0);
  }

  /* ---------- 5 · tres metalls ---------- */
  function tres() {
    let s = `<rect class="crema" x="-60" width="1320" height="720"/>`;
    const fitxa = (x, nom, d, pct, n, prova, usos, col, barra) => {
      let punts = ''; for (let i = 0; i < n; i++) punts += `<circle cx="${x + 185 + Math.cos(i * 2.4) * (12 + (i * 37) % 52)}" cy="${250 + Math.sin(i * 2.4) * (12 + (i * 37) % 52)}" r="5.5" class="negre"/>`;
      return `<g><rect class="t" x="${x}" y="50" width="370" height="620" rx="18" fill="#fffdf7"/><rect x="${x}" y="50" width="370" height="76" rx="18" fill="${col}"/><rect x="${x}" y="100" width="370" height="26" fill="${col}"/><rect class="t nf" x="${x}" y="50" width="370" height="620" rx="18"/>
        <text x="${x + 185}" y="92" class="tx-g mig" style="fill:#fff">${nom}</text><text x="${x + 185}" y="116" class="tx-r mig" fill="#fff">${d}</text>
        <circle class="t" cx="${x + 185}" cy="250" r="78" fill="#c5ccd0"/>${punts}<text x="${x + 185}" y="370" class="tx-gg mig">${pct}</text><text x="${x + 185}" y="394" class="tx-p mig">de carboni (punts negres)</text>
        ${barra}<text x="${x + 185}" y="530" class="tx mig">${prova}</text><path d="M${x + 30} 556H${x + 340}" class="t1"/>${usos.map((u, i) => `<text x="${x + 185}" y="${590 + i * 26}" class="tx-p mig">${u}</text>`).join('')}</g>`;
    };
    s += fitxa(20, 'Ferro colat', 'surt de l’alt forn', '3 – 4 %', 34, 'Dur, però es trenca d’un cop', ['S’emmotlla: olles, columnes,', 'canonades, peces de màquina'], '#4a4541', `<path class="t ferro2" d="M90 440h100l-8 14 10 16H90zM220 470l8-16-10-14h102v30z"/><path d="M196 426l10 12M214 424l-4 14" class="t s-vermell"/>`);
    s += fitxa(415, 'Ferro forjat', 'surt del forn de pudelar', 'menys de 0,1 %', 2, 'Tou: es doblega i es forja', ['Es lamina i es martelleja:', 'barres, cadenes, primers rails'], '#a8452f', `<path class="nf" d="M490 470Q600 400 710 470" stroke="#2a2420" stroke-width="22" stroke-linecap="round"/><path class="nf" d="M490 470Q600 400 710 470" stroke="#7d8a92" stroke-width="16" stroke-linecap="round"/>`);
    s += fitxa(810, 'Acer', 'surt del convertidor', '0,2 – 1,5 %', 10, 'Dur i elàstic alhora', ['Rails, eines, molles, canons,', 'vaixells, ponts i gratacels'], '#2f7fb5', `<rect class="t ferro" x="880" y="444" width="230" height="20" rx="6"/><path d="M920 430q-10-14 0-26M1070 430q10-14 0-26" class="t nf s-blau"/>`);
    s += RI.innova(600, 22, 'INNOVACIÓ · controlar el % de carboni canvia completament la duresa', { w: 515 });
    return svg(s);
  }

  RI.capitol({
    id: 'metalls', titol: 'Ferro i acer', llegenda: [['#ff9a2e', 'calor · metall roent'], ['#2f7fb5', 'aire a pressió']],
    escenes: [
      {
        id: 'coc', nom: 'Del carbó al coc', any: '1709', qui: 'Abraham Darby · Coalbrookdale', durada: 15,
        pregunta: 'Amb què alimentes un forn quan s’acaben els boscos?',
        intro: 'Per fondre ferro es feia servir carbó vegetal, fet de fusta. Anglaterra es quedava sense boscos. Darby prova amb carbó mineral, però abans el <b>cou</b>.',
        svg: coc, anima: animaCoc, innova: [1],
        fases: [
          { fins: 0.33, nom: 'El problema: la fusta', text: 'Cada forn necessita hectàrees de bosc cada any. La fusta s’encareix i el ferro també.' },
          { fins: 0.66, nom: 'Coure el carbó sense aire', text: 'Es tanca el carbó mineral en un forn amb molt poc aire. No crema: s’escalfa i perd els gasos, el quitrà i part del sofre, que faria el ferro trencadís.', focus: ['forn'] },
          { fins: 1, nom: 'Queda el coc', text: 'Un combustible gairebé de carboni pur, porós i dur. Fa més calor que el carbó vegetal i aguanta el pes de forns molt més alts.', focus: ['coc'] }
        ],
        parts: { forn: { nom: 'Forn de coc', text: 'Una volta de maó tancada. La calor expulsa les substàncies volàtils del carbó.' }, coc: { nom: 'Coc', text: 'Carbó mineral «cuit». Serà alhora el combustible i el reactiu de l’alt forn.' } },
        clau: 'El coc deslliga el ferro del bosc i el lliga a la mina de carbó.',
        batx: { titol: 'Una difusió lenta', text: 'Darby fon ferro amb coc el 1709, però fins a mitjan segle XVIII la majoria de forns britànics encara cremen carbó vegetal. Només quan el preu de la fusta puja i milloren les màquines bufadores el coc s’imposa.', font: 'https://www.ironbridge.org.uk/', fontNom: 'Ironbridge Gorge Museums · Coalbrookdale' }
      },
      {
        id: 'altforn', nom: 'L’alt forn', any: 'segle XVIII', durada: 18,
        model: 'Alt forn de coc en secció · esquema didàctic',
        pregunta: 'Com treus ferro d’una pedra?',
        intro: 'El mineral de ferro és ferro enganxat a oxigen. L’alt forn és una torre que funciona dia i nit: per dalt hi entren pedres, per baix en surt <b>ferro líquid</b>.',
        svg: altForn, anima: animaForn, innova: [1, 2],
        fases: [
          { fins: 0.25, nom: 'Es carrega per dalt', text: 'Capes de mineral de ferro, coc i pedra calcària. A mesura que es consumeix el de baix, tot va baixant.', focus: ['carrega', 'cuba'] },
          { fins: 0.5, nom: 'S’hi bufa aire per baix', text: 'Una màquina bufadora injecta aire a pressió per les toveres. Amb més aire, el coc crema amb molta més força.', focus: ['bufadora'] },
          { fins: 0.75, nom: 'El coc fa dues feines', text: 'Escalfa fins a fondre-ho tot i, a més, «roba» l’oxigen del mineral: queda ferro. La calcària s’enduu les impureses i forma l’escòria, que sura.', focus: ['cuba', 'gresol'] },
          { fins: 1, nom: 'La sagnia', text: 'S’obre el forat de baix i el ferro líquid corre per canals de sorra fins a uns motlles. En refredar-se són lingots de <b>ferro colat</b>.', focus: ['gresol', 'llit'] }
        ],
        parts: {
          carrega: { nom: 'Boca de càrrega', text: 'A dalt de tot. Els forns es construïen arran d’un marge per poder-hi arribar amb carretons.' },
          cuba: { nom: 'Cuba', text: 'L’interior del forn, folrat de maó que resisteix el foc. S’eixampla cap avall perquè la càrrega baixi sense encallar-se.' },
          bufadora: { nom: 'Màquina bufadora i toveres', text: 'Un gran pistó (mogut per aigua o per vapor) empeny l’aire pels tubs fins al cor del forn.' },
          gresol: { nom: 'Gresol', text: 'El fons del forn. S’hi acumula el ferro líquid i, a sobre, l’escòria, que pesa menys.' },
          llit: { nom: 'Llit de colada', text: 'Canals i motlles fets a la sorra. Recorden una truja alletant porcells: per això en anglès el lingot es diu «pig iron».' }
        },
        etiquetes: [['carrega', 900, 100, 720, 126, 'Boca de càrrega'], ['cuba', 300, 250, 500, 290], ['bufadora', 150, 300, 142, 362, 'Màquina bufadora'], ['bufadora', 330, 540, 440, 498, 'Tovera'], ['gresol', 760, 566, 600, 572], ['llit', 638, 650, 468, 646, 'Llit de colada']],
        real: {
          img: 'img/real-altforn.webp',
          titol: 'L’alt forn d’Abraham Darby a Coalbrookdale (on es va fondre ferro amb coc el 1709)',
          museu: 'Museum of Iron · Ironbridge Gorge (Regne Unit)',
          lic: 'Foto: IronbridgeG · Wikimedia Commons · CC BY-SA 4.0',
          etiquetes: [['cuba', 50, 22, 'Torre del forn'], ['llit', 50, 82, 'Boca de colada']]
        },
        clau: 'Mineral + coc + aire = ferro colat. Abundant i barat, però trencadís.',
        batx: { titol: 'Carbó, ferro i vapor: un cercle', text: 'Les màquines de vapor mouen les bufadores i bomben l’aigua de les mines; les mines donen el carbó per al coc; el ferro serveix per fer màquines de vapor. Aquest cercle explica per què la industrialització s’accelera sola un cop comença.', font: 'https://www.ironbridge.org.uk/', fontNom: 'Ironbridge Gorge Museums' }
      },
      {
        id: 'pudelat', nom: 'Pudelar i laminar', any: '1784', qui: 'Henry Cort', durada: 16,
        model: 'Forn de reverber i tren de laminatge · esquema didàctic',
        pregunta: 'Com converteixes un ferro trencadís en bigues i rails?',
        intro: 'El ferro colat té massa carboni: no es pot forjar. Cort ho resol amb dues idees: un forn on el ferro es <b>remena</b> i uns <b>corrons</b> que el pasten.',
        svg: pudelat, anima: animaPud, innova: [0, 3],
        fases: [
          { fins: 0.25, nom: 'Un forn de dues cambres', text: 'El carbó crema en una banda i el ferro es fon a l’altra. Només hi arriba la flama, rebotada pel sostre: així el sofre del carbó no l’embruta.', focus: ['fogar', 'forn', 'xemeneia'] },
          { fins: 0.5, nom: 'El pudelador remena', text: 'Amb una barra llarga remou el bany. L’aire crema el carboni i el ferro, cada cop més pur, es va fent pastós.', focus: ['pudelador', 'sola'] },
          { fins: 0.66, nom: 'Surt la bola', text: 'El pudelador forma una bola incandescent d’uns 40 kg i la treu amb unes tenalles. És una feina duríssima.', focus: ['sola', 'pudelador'] },
          { fins: 1, nom: 'Laminar', text: 'La bola passa entre corrons amb canals. A cada passada surt més prima, més llarga i amb la forma desitjada.', focus: ['laminador'] }
        ],
        parts: {
          fogar: { nom: 'Fogar', text: 'Aquí crema el carbó, separat del metall per un petit mur.' },
          forn: { nom: 'Volta de reverber', text: 'El sostre baix fa rebotar («reverberar») la flama cap al ferro.' },
          sola: { nom: 'Sola', text: 'La cubeta on es fon i es remena el ferro colat.' },
          pudelador: { nom: 'Pudelador', text: 'L’obrer més ben pagat i més castigat de la siderúrgia: remenava ferro fos a mà durant hores.' },
          xemeneia: { nom: 'Xemeneia', text: 'Estira la flama a través del forn.' },
          laminador: { nom: 'Laminador', text: 'Dos corrons que giren en sentits contraris. Fan en minuts la feina de moltes hores de martell.' }
        },
        etiquetes: [['fogar', 80, 640, 136, 520], ['forn', 180, 296, 232, 318, 'Volta'], ['sola', 300, 650, 330, 510], ['pudelador', 676, 540, 604, 550], ['xemeneia', 680, 130, 588, 150], ['laminador', 1090, 300, 980, 300]],
        clau: 'Ferro forjat en grans quantitats: el material de les màquines, els ponts i els primers rails.',
        batx: { titol: 'Un coll d’ampolla humà', text: 'La pudelació no es va poder mecanitzar: depenia de la força i de l’ofici de cada pudelador. Per això, quan el ferrocarril dispara la demanda, es busca un mètode nou. És el camí que porta a Bessemer.', font: 'https://www.ironbridge.org.uk/', fontNom: 'Ironbridge Gorge Museums' }
      },
      {
        id: 'bessemer', nom: 'Bessemer', any: '1856', qui: 'Henry Bessemer', durada: 18,
        model: 'Convertidor Bessemer en secció · esquema didàctic',
        pregunta: 'Com fas acer en vint minuts?',
        intro: 'L’acer era el millor metall, però caríssim: es feia en petits gresols. Bessemer té una idea que sembla absurda: <b>bufar aire fred</b> a través del ferro fos.',
        svg: bessemer, anima: animaBes, innova: [2],
        fases: [
          { fins: 0.2, nom: 'Càrrega', text: 'El convertidor s’inclina i s’hi aboca ferro colat líquid, acabat de sortir de l’alt forn.', focus: ['convertidor'] },
          { fins: 0.3, nom: 'S’aixeca i comença el vent', text: 'Es posa dret i s’obre l’aire, que entra pel fons a través de les toveres.', focus: ['toveres', 'eix'] },
          { fins: 0.7, nom: 'El bufat', text: 'L’oxigen de l’aire crema el carboni i les impureses del ferro. Aquesta combustió fa pujar la temperatura tota sola: surt una gran flama per la boca.', focus: ['convertidor', 'toveres'] },
          { fins: 1, nom: 'La colada', text: 'Quan la flama canvia, es talla el vent, es torna a inclinar i s’aboca l’acer a la cullera. Tones d’acer en el temps que abans calia per a uns quilos.', focus: ['cullera'] }
        ],
        parts: {
          convertidor: { nom: 'Convertidor', text: 'Recipient d’acer en forma de pera, folrat per dins de material refractari. Bascula sobre un eix.' },
          toveres: { nom: 'Toveres', text: 'Forats al fons per on entra l’aire a pressió i travessa el metall líquid.' },
          eix: { nom: 'Eix i conducte d’aire', text: 'El convertidor gira sobre dos suports. L’aire hi arriba per dins d’un dels eixos.' },
          cullera: { nom: 'Cullera de colada', text: 'Recull l’acer líquid per repartir-lo en motlles (lingoteres).' }
        },
        etiquetes: [['convertidor', 840, 480, 700, 420], ['toveres', 600, 606, 600, 523, 'Toveres', 'pera@0,163'], ['eix', 880, 310, 800, 350, 'Eix'], ['cullera', 130, 594, 244, 594, 'Cullera']],
        explotada: {
          img: 'img/exp-bessemer.webp',
          model: 'Làmina tècnica en vista explotada · Convertidor Bessemer (1856)',
          guies: '<path d="M165 535L475 365M725 245L995 115M605 520V665"/><circle cx="475" cy="365" r="4.5"/><circle cx="725" cy="245" r="4.5"/><circle cx="605" cy="520" r="4.5"/>',
          zones: [['convertidor', 605, 325, 145, 210], ['eix', 255, 515, 175, 145], ['eix', 925, 285, 215, 155], ['toveres', 605, 605, 125, 125], ['cullera', 805, 665, 95, 105]],
          etiquetes: [['convertidor', 385, 145, 565, 245], ['eix', 965, 115, 875, 265, 'Eix i conducte d’aire'], ['toveres', 415, 715, 585, 615, 'Toveres'], ['cullera', 975, 735, 815, 655, 'Cullera']]
        },
        real: {
          img: 'img/real-bessemer.webp',
          titol: 'Convertidor Bessemer de 25 tones (s. XX), conservat a l’aire lliure',
          museu: 'Kelham Island Industrial Museum · Sheffield (Regne Unit)',
          lic: 'Foto: cooldudeandy01 · Wikimedia Commons · CC BY 2.0',
          etiquetes: [['convertidor', 50, 32, 'Convertidor'], ['eix', 77, 40, 'Eix de basculament']]
        },
        clau: 'Acer abundant i barat: comença l’era dels rails d’acer, els grans vaixells i els gratacels.',
        batx: { titol: 'Un invent que al principi fallava', text: 'El procés no funcionava amb minerals rics en fòsfor (la majoria dels europeus) i l’acer sortia trencadís. Es va resoldre amb el ferromanganès de Mushet i, el 1879, amb el revestiment bàsic de Thomas i Gilchrist. Bessemer pertany ja a la Segona Revolució Industrial.', font: 'https://blog.sciencemuseum.org.uk/onward-ever-sir-henry-bessemer-frs-19-1-1813-15-3-1898/', fontNom: 'Science Museum · Henry Bessemer' }
      },
      {
        id: 'tres', nom: 'Tres metalls', estatica: true, llegenda: false,
        pregunta: 'Ferro colat, ferro forjat o acer?',
        intro: 'Tots tres són ferro. La diferència és <b>quant carboni</b> porten barrejat, i això canvia del tot com es comporten.',
        svg: tres,
        clau: 'Massa carboni: trencadís. Gens: tou. La quantitat justa: acer.',
        batx: { titol: 'Cada metall, la seva època', text: 'Pont d’Ironbridge (1779): ferro colat. Rails i locomotores dels anys 1830-1860: ferro forjat. Torre Eiffel (1889): encara ferro pudelat. Pont de Brooklyn (1883) i gratacels de Chicago: acer. Relaciona cada obra amb el material disponible i barat al seu moment.', font: 'https://www.ironbridge.org.uk/', fontNom: 'Ironbridge Gorge Museums' }
      }
    ],
    repte: [
      { q: 'Què és el coc?', o: ['Carbó vegetal fet amb fusta', 'Carbó mineral cuit sense aire', 'Un mineral de ferro'], c: 1, e: 'En coure’s perd gasos, quitrà i sofre, i queda gairebé carboni pur.' },
      { q: 'Quines dues feines fa el coc dins l’alt forn?', o: ['Escalfa i treu l’oxigen del mineral', 'Refreda i filtra el ferro', 'Bufa aire i fa escòria'], c: 0, e: 'És combustible i, alhora, el que separa el ferro de l’oxigen.' },
      { q: 'Què surt de l’alt forn?', o: ['Acer', 'Ferro forjat', 'Ferro colat'], c: 2, e: 'Ferro amb molt carboni (3-4 %): dur però trencadís.' },
      { tipus: 'toca', esc: 'altforn', part: 'bufadora', p: 0.4, q: 'Toca la màquina que fa que el coc cremi amb molta més força dins l’alt forn.', e: 'La bufadora: injecta aire a pressió per les toveres.' },
      { tipus: 'ordena', esc: 'altforn', q: 'Ordena el procés de l’alt forn.', e: 'Càrrega per dalt → aire per baix → el coc escalfa i treu l’oxigen → sagnia del ferro colat.' },
      { q: 'Què aconsegueix el pudelador remenant el ferro?', o: ['Afegir-hi carboni', 'Cremar el carboni que sobra', 'Refredar-lo més de pressa'], c: 1, e: 'Amb menys carboni, el ferro es pot forjar i laminar.' },
      { q: 'Per què el convertidor Bessemer no necessita combustible?', o: ['Perquè funciona amb electricitat', 'Perquè el carboni del mateix ferro crema amb l’aire i fa pujar la temperatura', 'Perquè el ferro ja és fred'], c: 1, e: 'La combustió de les impureses dona tota la calor necessària.' },
      { tipus: 'toca', esc: 'bessemer', part: 'toveres', p: 0.5, q: 'Toca per on entra l’aire que crema el carboni al convertidor Bessemer.', e: 'Les toveres del fons: l’aire travessa tot el ferro líquid de baix a dalt.' },
      { q: 'Quin metall és dur i elàstic alhora?', o: ['El ferro colat', 'El ferro forjat', 'L’acer'], c: 2, e: 'Té la quantitat justa de carboni: entre el 0,2 i l’1,5 %.' }
    ]
  });
})();

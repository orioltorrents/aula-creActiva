// SPDX-License-Identifier: AGPL-3.0-or-later
/* Portada: un paisatge de la industrialització on cada lloc porta a un capítol. */
(function () {
  const { roda, foc, nuvol, ovella, arbre } = RI;
  const C = RI.CAPITOLS;
  const pin = (i, x, y) => `<g class="pin" transform="translate(${x} ${y})"><path d="M0 0v32" stroke="#b8a98e" stroke-width="1.5" stroke-dasharray="2 5" stroke-linecap="round"/><rect x="-14" y="-17" width="${C[i].nom.length * 9.2 + 54}" height="34" rx="17" fill="#fffdf7" stroke="#b8a98e" stroke-width="1.5"/><circle cx="3" cy="0" r="13" fill="${C[i].color}"/><text x="3" y="5.5" text-anchor="middle" class="pin-n">${i + 1}</text><text x="24" y="5.5" class="pin-t">${C[i].nom}</text></g>`;
  const fum = (x, y, n, cls) => Array.from({ length: n || 3 }, (_, i) => `<circle class="fumet ${cls || ''}" cx="${x}" cy="${y}" r="13" style="animation-delay:${-i * 1.3}s"/>`).join('');
  const finestres = (x, y, cols, files, dx, dy) => { let s = ''; for (let r = 0; r < files; r++) for (let c = 0; c < cols; c++) s += `<rect x="${x + c * dx}" y="${y + r * dy}" width="12" height="16" rx="1" fill="#ffe9a8" stroke="#2a2420" stroke-width="1.6"/>`; return s; };
  const lloc = (i, inner) => `<a class="lloc" href="${C[i].id}.html" aria-label="${i + 1}. ${C[i].nom}: ${C[i].pregunta}">${inner}</a>`;

  function paisatge() {
    let s = `<rect class="cel" width="1600" height="400"/><circle cx="1360" cy="88" r="46" fill="#ffe08a" opacity=".92"/>${nuvol(640, 62, 1.35)}${nuvol(980, 108, 1.15)}${nuvol(1220, 60, 0.9)}`;
    // relleu i riu/mar
    s += `<path d="M0 304Q200 206 430 282T870 252T1300 292L1600 268V520H0Z" fill="#b7d08a"/><path d="M0 342Q260 292 520 332T1000 322T1270 342V520H0Z" fill="#8fb85a"/>`;
    s += `<path d="M1226 346Q1300 332 1600 338V520H1182Q1246 432 1226 346Z" fill="url(#g-mar)"/><path d="M1260 382q14-7 28 0t28 0 28 0M1392 444q14-7 28 0t28 0 28 0M1290 484q14-7 28 0t28 0" stroke="#d8f0fb" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M700 332Q760 382 900 398T1200 422L1230 500H1180Q1100 432 880 422T660 342Z" fill="#6fb9e0" opacity=".9"/>`;
    // 1 camp: quatre parcel·les Norfolk, tanca de fusta, paller, arbre i ovelles
    s += lloc(0, `<polygon points="28,334 86,264 148,264 108,334" fill="#e6b93c" stroke="#2a2420" stroke-width="2.5"/><polygon points="108,334 148,264 210,264 190,334" fill="#9a7a52" stroke="#2a2420" stroke-width="2.5"/><polygon points="190,334 210,264 268,264 270,334" fill="#d9c77a" stroke="#2a2420" stroke-width="2.5"/><polygon points="86,264 124,224 262,224 268,264" fill="#7fb85a" stroke="#2a2420" stroke-width="2.5"/>
      <path d="M48 322l22-28M70 322l22-28M92 322l22-28M212 322l8-46M238 322l8-46" stroke="#a8791c" stroke-width="2" stroke-linecap="round"/>
      <path d="M122 252h136M130 244v14M164 244v14M198 244v14M232 244v14" stroke="#7a5333" stroke-width="2.2" stroke-linecap="round"/>
      ${arbre(46, 294, 0.56)}${ovella(168, 250, 0.78)}${ovella(216, 254, 0.74)}${pin(0, 196, 186)}`);
    // 2 vapor: mina amb casa de màquines, xemeneia, balancí amb arc i castellet de pou
    s += lloc(1, `<rect x="304" y="196" width="16" height="138" fill="url(#p-mao)" stroke="#2a2420" stroke-width="2.8"/>${fum(312, 188, 3)}
      <rect x="330" y="236" width="70" height="98" fill="url(#p-mao)" stroke="#2a2420" stroke-width="2.8"/><path d="M322 238l43-32 43 32z" fill="#a8452f" stroke="#2a2420" stroke-width="2.8"/>
      <rect x="352" y="260" width="22" height="32" rx="11" fill="#d6ecf3" stroke="#2a2420" stroke-width="2"/>
      <g class="balanci" style="transform-origin:400px 236px"><rect x="348" y="230" width="112" height="11" rx="4" fill="#c7935c" stroke="#2a2420" stroke-width="2.8"/><path d="M454 220a24 24 0 0 1 0 30" fill="none" stroke="#2a2420" stroke-width="4"/></g>
      <path d="M456 240v94M440 334l16-66 16 66" stroke="#2a2420" stroke-width="3.6" fill="none"/><path d="M420 334q14-20 30 0z" fill="#2b2826" stroke="#2a2420" stroke-width="2"/>${pin(1, 316, 162)}`);
    // 3 cotó: nau industrial de coberta dentada amb claraboies de vidre i bales de cotó
    s += lloc(2, `<g transform="translate(543 334) scale(1.4) translate(-543 -334)"><path d="M498 334V268l30-18v18l30-18v18l30-18v84z" fill="#efe3c6" stroke="#2a2420" stroke-width="2.8"/>
      <path d="M528 250v18M558 250v18M588 250v18" stroke="#8fc3e0" stroke-width="3.5"/><path d="M498 268l30-18M528 268l30-18M558 268l30-18" stroke="#b9722a" stroke-width="5" stroke-linecap="round"/>
      <rect x="524" y="294" width="38" height="40" rx="3" fill="#fffdf7" stroke="#2a2420" stroke-width="2.4"/><path d="M524 306h38M524 318h38" stroke="#b9722a" stroke-width="2.5"/>
      <rect x="568" y="318" width="16" height="16" rx="4" fill="#fffdf7" stroke="#2a2420" stroke-width="2"/><rect x="585" y="318" width="16" height="16" rx="4" fill="#fffdf7" stroke="#2a2420" stroke-width="2"/></g>${pin(2, 500, 180)}`);
    // 4 fàbrica: edifici multi-pis amb canal hidràulic i roda d'aigua
    s += lloc(3, `<rect x="786" y="158" width="20" height="178" fill="url(#p-mao)" stroke="#2a2420" stroke-width="2.8"/>${fum(796, 148, 4)}
      <rect x="660" y="196" width="130" height="140" fill="url(#p-mao)" stroke="#2a2420" stroke-width="2.8"/><path d="M650 198l75-28 75 28z" fill="#a8452f" stroke="#2a2420" stroke-width="2.8"/>${finestres(672, 208, 5, 4, 24, 30)}
      <path d="M622 296h38" stroke="#8f6038" stroke-width="7"/><path d="M624 295h34" stroke="#6fb9e0" stroke-width="3"/>
      <g class="gira-mig" style="transform-origin:652px 330px">${roda(652, 330, 32, { raigs: 8, color: '#a67547', gruix: 7 })}</g>${pin(3, 694, 152)}`);
    // 5 ferro i acer: alt forn amb passarel·la de càrrega, tovera i munts de coc/mineral
    s += lloc(4, `<path d="M880 338l22-126h56l22 126z" fill="url(#p-mao)" stroke="#2a2420" stroke-width="2.8"/><rect x="898" y="206" width="64" height="8" fill="#56636c" stroke="#2a2420" stroke-width="2"/><path d="M960 212h42v126" fill="none" stroke="#2a2420" stroke-width="3.5"/>
      <path d="M908 338l6-40h32l6 40z" fill="url(#g-roent)" stroke="#2a2420" stroke-width="2.4"/>${foc(930, 206, 30, 44)}${fum(930, 152, 3, 'fosc')}<path d="M986 338q22-30 48 0z" fill="#3d454b" stroke="#2a2420" stroke-width="2.4"/>${pin(4, 886, 156)}`);
    // 8 capital: borsa/banc neoclàssic amb frontó, columnes i escalinata
    s += lloc(7, `<rect x="1068" y="264" width="28" height="72" fill="#efe3c6" stroke="#2a2420" stroke-width="2.4"/><path d="M1064 266l18-16 18 16z" fill="#a8452f" stroke="#2a2420" stroke-width="2.4"/>
      <path d="M1098 262l56-32 56 32z" fill="#e9dfc8" stroke="#2a2420" stroke-width="2.8"/><rect x="1102" y="262" width="104" height="10" fill="#e9dfc8" stroke="#2a2420" stroke-width="2.4"/>
      ${[1112, 1134, 1156, 1178].map((x) => `<rect x="${x}" y="272" width="12" height="54" fill="#fffdf7" stroke="#2a2420" stroke-width="2.2"/>`).join('')}
      <rect x="1096" y="326" width="116" height="10" fill="#e9dfc8" stroke="#2a2420" stroke-width="2.4"/><circle cx="1154" cy="249" r="8" fill="#f2b632" stroke="#2a2420" stroke-width="2"/>${pin(7, 1088, 188)}`);
    // 7 vaixell: Great Western amb eixàrcia, veles, tambor de pales i bauprès
    s += lloc(6, `<g class="oneja"><path d="M1292 402h186q16 0 24-12l-24 50h-162l-24-38z" fill="#3d454b" stroke="#2a2420" stroke-width="2.8"/><rect x="1290" y="395" width="198" height="8" rx="3" fill="#c7935c" stroke="#2a2420" stroke-width="2.4"/>
      <path d="M1486 398l32-14" stroke="#8f6038" stroke-width="4" stroke-linecap="round"/>
      <rect x="1370" y="336" width="18" height="59" fill="#2a2420"/><rect x="1369" y="336" width="20" height="11" fill="#d9482b"/>${fum(1379, 326, 4, 'fosc')}
      <path d="M1326 395v-72M1446 395v-62" stroke="#8f6038" stroke-width="4.5" stroke-linecap="round"/><path d="M1326 326l160 60M1326 326l-34 69" stroke="#2a2420" stroke-width="1.3" opacity=".55"/>
      <path d="M1330 330l40 12v40l-40 4z" fill="#fffdf7" stroke="#2a2420" stroke-width="2.2"/><path d="M1450 342l32 10v34l-32 4z" fill="#fffdf7" stroke="#2a2420" stroke-width="2.2"/>
      <g class="gira-mig" style="transform-origin:1408px 412px">${roda(1408, 412, 30, { raigs: 8, color: '#a8452f', gruix: 6 })}</g><path d="M1374 396a34 34 0 0 1 68 0" fill="none" stroke="#2a2420" stroke-width="4"/></g>${pin(6, 1218, 274)}`);
    // via i 6 tren
    s += `<path d="M0 452H1240" stroke="#8a7a6a" stroke-width="20"/><path d="M0 444H1240" stroke="#2a2420" stroke-width="5"/><path d="M6 452H1240" stroke="#2a2420" stroke-width="12" stroke-dasharray="6 20"/>`;
    s += lloc(5, `<rect x="0" y="376" width="1240" height="84" fill="transparent"/><g class="tren-p">${fum(154, 366, 3)}<rect x="94" y="404" width="66" height="28" rx="7" fill="#f2c230" stroke="#2a2420" stroke-width="2.8"/><path d="M146 404v-34h13v34z" fill="#fffdf7" stroke="#2a2420" stroke-width="2.8"/><rect x="56" y="410" width="32" height="22" rx="7" fill="#c7935c" stroke="#2a2420" stroke-width="2.8"/><path d="M88 430h10" stroke="#2a2420" stroke-width="4"/>
      ${[-22, -92, -162].map((x) => `<rect x="${x}" y="406" width="62" height="26" rx="4" fill="#2f7fb5" stroke="#2a2420" stroke-width="2.8"/><rect x="${x + 8}" y="412" width="12" height="10" fill="#d6ecf3"/><rect x="${x + 26}" y="412" width="12" height="10" fill="#d6ecf3"/><rect x="${x + 44}" y="412" width="12" height="10" fill="#d6ecf3"/><circle cx="${x + 14}" cy="436" r="8" fill="#3d454b" stroke="#2a2420" stroke-width="2.4"/><circle cx="${x + 48}" cy="436" r="8" fill="#3d454b" stroke="#2a2420" stroke-width="2.4"/>`).join('')}
      <circle cx="72" cy="436" r="8" fill="#3d454b" stroke="#2a2420" stroke-width="2.4"/><circle cx="110" cy="434" r="10" fill="#f2c230" stroke="#2a2420" stroke-width="2.8"/><circle cx="142" cy="430" r="14" fill="#f2c230" stroke="#2a2420" stroke-width="2.8"/></g>${pin(5, 236, 356)}`);
    s += `<path d="M0 470H1250L1180 520H0Z" fill="#6f9c43"/>`;
    return `<svg class="esc paisatge" viewBox="0 0 1600 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Paisatge de la Revolució Industrial amb vuit llocs que porten als capítols">${RI.DEFS}${s}</svg>`;
  }

  RI.portada = function () {
    document.querySelector('#app').innerHTML = `
    <header class="cap">${RI.marca()}<p class="lema">Entra dins les màquines. Atura el temps. Mira com funcionen.</p>${RI.eines()}</header>
    <main class="portada">
      <section class="vista"><div class="vista-text"><h1>La Revolució Industrial</h1><p>Vuit capítols i vint-i-set màquines i processos animats. Tria un lloc del paisatge o un capítol.</p></div>${paisatge()}</section>
      <nav class="targetes" aria-label="Capítols">${C.map((c, i) => `<a href="${c.id}.html" class="targeta-cap" style="--c:${c.color}"><span class="n">${i + 1}</span><span class="ic">${RI.icona(c, 26)}</span><strong>${c.nom}</strong><span class="q">${c.pregunta}</span><small>${c.epoca}</small></a>`).join('')}</nav>
    </main>${RI.peu()}`;
    RI.activaEines();
  };
})();

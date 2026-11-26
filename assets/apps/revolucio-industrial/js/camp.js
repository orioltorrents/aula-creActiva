// SPDX-License-Identifier: AGPL-3.0-or-later
/* Capítol 1 · El camp: rotació Norfolk, sembradora de Tull i arada de Rotherham. */
(function () {
  const { svg, roda, persona, nuvol, cavall, ovella, vaca, txt, retol, fletxa, tram, lerp } = RI;

  /* dibuix dels conreus dins d'una parcel·la de 250 × 200 */
  function conreu(tipus) {
    let s = '';
    if (tipus === 'blat' || tipus === 'ordi') {
      const c = tipus === 'blat' ? '#e6be4c' : '#d8c57c', e = tipus === 'blat' ? '#9e6e14' : '#7f722e';
      s += `<rect width="250" height="200" fill="${c}"/><rect y="182" width="250" height="18" fill="#8b6d46" opacity=".45"/>`;
      for (let y = 50; y < 200; y += 34) for (let x = 18; x < 250; x += 22) {
        s += `<path d="M${x} ${y}v-20" stroke="${e}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
        s += `<ellipse cx="${x}" cy="${y - 21}" rx="3.5" ry="6" fill="${tipus === 'blat' ? '#d49a22' : '#baa850'}" stroke="${e}" stroke-width="1.2"/>`;
        if (tipus === 'ordi') s += `<path d="M${x - 1} ${y - 26}l-5-7M${x + 1} ${y - 26}l5-7" stroke="${e}" stroke-width="1.4" stroke-linecap="round"/>`;
      }
    } else if (tipus === 'naps') {
      s += `<rect width="250" height="200" fill="#8c6b45"/>`;
      for (let y = 42; y < 200; y += 22) s += `<path d="M4 ${y}H246" stroke="#6f5232" stroke-width="2" opacity=".55"/>`;
      for (let y = 46; y < 196; y += 46) for (let x = 28 + ((y / 46) % 2) * 16; x < 236; x += 48) {
        s += `<path d="M${x} ${y - 6}q-12-16-4-22M${x} ${y - 6}q12-16 4-22M${x} ${y - 6}v-22" stroke="#3f7d32" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="${x}" cy="${y}" rx="10" ry="8" fill="#f5ecf3" stroke="#7d3b7a" stroke-width="2"/><path d="M${x - 8} ${y - 2}a10 7 0 0 1 16 0z" fill="#9c559a"/>`;
      }
    } else if (tipus === 'trevol') {
      s += `<rect width="250" height="200" fill="#77b350"/>`;
      for (let y = 32; y < 200; y += 30) for (let x = 20 + ((y / 30) % 2) * 14; x < 240; x += 32) {
        s += `<circle cx="${x - 4}" cy="${y}" r="3.8" fill="#468232"/><circle cx="${x + 4}" cy="${y}" r="3.8" fill="#468232"/><circle cx="${x}" cy="${y - 5}" r="3.8" fill="#4f8f38"/>`;
      }
      s += ovella(66, 152, 0.92) + ovella(176, 86, 0.9) + ovella(184, 170, 0.92);
    } else {
      s += `<rect width="250" height="200" fill="#9e825e"/>`;
      for (let y = 26; y < 200; y += 20) s += `<path d="M6 ${y}q14-5 28 0t28 0 28 0 28 0 28 0 28 0 28 0 28 0 14 0" stroke="#785e3f" stroke-width="2.2" fill="none"/>`;
      s += `<path d="M56 146l4-14M62 148l7-11M174 68l4-13M180 70l7-10M118 112l3-11" stroke="#667d3c" stroke-width="2.5" stroke-linecap="round"/>`;
    }
    return s;
  }
  const NOMS = { blat: ['Blat', 'pa i venda'], naps: ['Naps', 'farratge d’hivern'], ordi: ['Ordi', 'cervesa i pinso'], trevol: ['Trèvol', 'pastura i adob'], guaret: ['Guaret', 'la terra descansa'] };
  const ORDRE = ['blat', 'naps', 'ordi', 'trevol'], POS = [[60, 90], [330, 90], [330, 320], [60, 320]];

  function norfolk() {
    let s = `<rect class="herba2" x="-60" width="1320" height="720"/><rect x="34" y="50" width="572" height="516" rx="12" fill="#5e8236" class="t"/>`;
    // tancats rurals (enclosures) al voltant de les parcel·les
    s += `<path d="M46 72H594M46 544H594M46 72V544M594 72V544" stroke="#6b4628" stroke-width="4" opacity=".55"/>`;
    // sistema antic (tres fulles)
    s += `<g id="g-antic">${[['blat', 60], ['ordi', 240], ['guaret', 420]].map(([c, x]) => `<g transform="translate(${x} 90)"><svg width="160" height="430" viewBox="0 0 250 200" preserveAspectRatio="none">${conreu(c)}</svg><rect class="t nf" width="160" height="430"/></g>${retol(x + 80, 120, NOMS[c][0], { fons: c === 'guaret' ? '#d9482b' : '#2a2420', w: 116 })}`).join('')}${retol(500, 480, '1/3 sense collita', { fons: '#d9482b', w: 156 })}${retol(180, 480, 'només 67 % útil', { fons: '#2a2420', w: 156 })}</g>`;
    // Norfolk: quatre parcel·les, cadascuna amb les quatre capes de conreu
    s += `<g id="g-norfolk">${POS.map(([x, y], i) => `<g transform="translate(${x} ${y})">${ORDRE.map((c) => `<g class="cv" data-i="${i}" data-c="${c}">${conreu(c)}<g transform="translate(125 26)">${retol(0, 0, NOMS[c][0] + ' · ' + NOMS[c][1], { fons: '#2a2420', w: 228 })}</g></g>`).join('')}<rect class="t nf" width="250" height="200"/><circle class="t blanc" cx="24" cy="176" r="15"/><text x="24" y="182" class="tx mig">${i + 1}</text></g>`).join('')}
      ${RI.innova(320, 26, 'INNOVACIÓ · naps i trèvol eliminen el guaret → 100 % productiu', { w: 470 })}
      <path d="M294 78q26-22 52 0" class="nf s-blanc" stroke-width="5" stroke-linecap="round" marker-end="url(#m-fl)"/>
      <path d="M594 282q22 26 0 52" class="nf s-blanc" stroke-width="5" stroke-linecap="round" marker-end="url(#m-fl)"/>
      <path d="M346 538q-26 22-52 0" class="nf s-blanc" stroke-width="5" stroke-linecap="round" marker-end="url(#m-fl)"/>
      <path d="M46 334q-22-26 0-52" class="nf s-blanc" stroke-width="5" stroke-linecap="round" marker-end="url(#m-fl)"/></g>`;
    s += `<rect x="70" y="582" width="500" height="84" rx="14" fill="#2a2420" opacity=".82"/><text id="any" x="320" y="618" class="tx-gg mig" style="fill:#fff">Any 1</text><text id="sub" x="320" y="648" class="tx mig" style="fill:#f7efe0">cada conreu passa a la parcel·la següent</text>`;
    // el cercle del bestiar
    s += `<g id="cercle"><rect class="t" x="650" y="50" width="530" height="620" rx="18" fill="#fffdf7"/><text x="915" y="92" class="tx-g mig">Per què funciona?</text>${retol(915, 122, 'el trèvol fixa nitrogen · el bestiar fa fems', { fons: '#5b8c35', w: 332 })}
      <circle cx="915" cy="380" r="168" class="nf" stroke="#dfd3bc" stroke-width="18"/><circle cx="915" cy="380" r="168" class="flux s-verd" stroke-width="9" data-flux="1.2"/>
      <path d="M982 224a168 168 0 0 1 70 64" class="nf s-verd" stroke-width="4" marker-end="url(#m-fl)"/>
      <path d="M1070 448a168 168 0 0 1-64 70" class="nf s-verd" stroke-width="4" marker-end="url(#m-fl)"/>
      <path d="M846 534a168 168 0 0 1-70-64" class="nf s-verd" stroke-width="4" marker-end="url(#m-fl)"/>
      <path d="M760 310a168 168 0 0 1 64-70" class="nf s-verd" stroke-width="4" marker-end="url(#m-fl)"/>
      <g><circle class="t" cx="915" cy="212" r="58" fill="#7fb85a"/><text x="915" y="206" class="tx mig">naps i</text><text x="915" y="226" class="tx mig">trèvol</text></g>
      <g><circle class="t" cx="1083" cy="380" r="58" fill="#fffdf7"/>${vaca(1082, 378, 0.92)}<text x="1083" y="420" class="tx-p mig">més bestiar</text></g>
      <g><circle class="t" cx="915" cy="548" r="58" fill="#9c6b3f"/><text x="915" y="544" class="tx mig" style="fill:#fff">més</text><text x="915" y="564" class="tx mig" style="fill:#fff">fems</text></g>
      <g><circle class="t" cx="747" cy="380" r="58" fill="#f0c84b"/><text x="747" y="374" class="tx mig">més</text><text x="747" y="394" class="tx mig">cereal</text></g>
      <text x="915" y="370" class="tx mig">terra sempre</text><text x="915" y="394" class="tx mig">fèrtil</text><text x="915" y="644" class="tx-p mig">i carn, llet i llana durant tot l’any</text></g>`;
    return svg(s);
  }
  function animaNorfolk({ k, el, svg: g }) {
    if (!g._cv) g._cv = Array.from(g.querySelectorAll('.cv'));
    const any = Math.max(0, k - 1);
    el('g-antic').style.display = k === 0 ? '' : 'none'; el('g-norfolk').style.display = k === 0 ? 'none' : '';
    g._cv.forEach((n) => { const i = +n.dataset.i, c = ORDRE[(((i - any) % 4) + 4) % 4]; n.style.display = n.dataset.c === c ? '' : 'none'; });
    el('any').textContent = k === 0 ? 'Abans: tres fulles' : 'Any ' + (any + 1);
    el('sub').textContent = k === 0 ? 'cada any, una de les tres es deixa en guaret' : 'cada conreu passa a la parcel·la següent';
    el('cercle').setAttribute('opacity', k === 0 ? 0.25 : 1);
  }

  /* ---------- sembradora de Jethro Tull ---------- */
  const paisatge = (h) => `<rect x="-60" y="0" width="1320" height="${h + 4}" fill="url(#g-cel)"/><path d="M-60 ${h - 70}c220-50 420-16 620-34s430-40 700 10v100H-60z" fill="#b9cf9a" opacity=".7"/><path d="M-60 ${h - 30}c200-34 420-10 640-22s440-24 680 8v60H-60z" fill="#9dbb78" opacity=".8"/>`;
  function sembradora() {
    const { caixa, cami, cartell, figura, rodaR, cavallR, ombra } = RI, T2 = RI.tub, INK = '#2e221a';
    let s = paisatge(540) + `<g filter="url(#f-suau)">${nuvol(120, 100, 1.4)}</g>` + cami('M-60 540H1260V720H-60Z', 'terra', 'pla');
    // terra ja sembrada (esquerra), solc obert sota la rella i rostoll sense sembrar (dreta)
    s += `<path d="M-60 540H450V562H-60Z" fill="#5e432a" opacity=".55"/><path d="M450 546H575V562H450Z" fill="#3f2c1a" opacity=".6"/><rect x="574" y="532" width="690" height="12" fill="url(#tx-herba)"/><path d="M-60 541H452" stroke="#3f2c1a" stroke-width="2" stroke-dasharray="14 6" opacity=".6"/>`;
    s += `<g id="llavors">${Array.from({ length: 11 }, () => `<g class="ll"><path class="brot" d="M0 0v-30m0 12q-12-2-14-14m14 6q12-2 14-14" stroke="#4f8a3a" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="4" rx="6" ry="4.500" fill="#e6b93c" stroke="${INK}" stroke-width="1"/></g>`).join('')}</g>`;
    s += cavallR(900, 540, 1.24) + `<path d="M708 424L946 446M708 438L946 452" stroke="${INK}" stroke-width="3.400" fill="none"/>` + figura(280, 540, 176, { camisa: '#7a5a3a', brac: 'M-9-70q16 6 36 12M9-70q8 12 22 20' });
    s += `<g data-part="esteves">${T2('M330 446L416 436M330 458L416 446', 8, 'fusta', { cap: 'round' })}</g>`;
    s += `<g data-part="bastidor">${ombra(560, 548, 170, 6)}${caixa(410, 422, 302, 22, 'fusta', 'tub')}${T2('M480 340L446 422M580 340L616 422', 8, 'fusta')}</g>`;
    s += `<g data-part="rasclet">${T2('M426 444V550M446 444V550M464 444V548', 4.500, 'ferro', { cap: 'round' })}</g>`;
    s += `<g data-part="tremuja">${cami('M450 248H610L580 340H480Z', 'fusta', 'llum')}<path d="M462 260H598L574 330H486Z" fill="#e6b93c" stroke="${INK}" stroke-width="1.300"/><path d="M462 260H598L574 330H486Z" fill="url(#sh-pla)"/><path d="M472 270h10m14 6h10m20-8h10m-50 22h10m24 0h10m16-12h10m-70 26h10m30 4h10" stroke="#9e6e14" stroke-width="4.500" stroke-linecap="round"/></g>`;
    s += `<g data-part="dosador">${caixa(496, 340, 68, 46, 'ferro', 'llum', { rx: 6 })}<circle cx="530" cy="363" r="19" fill="#1d1712"/><g id="dos"><circle cx="530" cy="363" r="17" fill="url(#tx-llauto)" stroke="${INK}" stroke-width="1.400"/><path d="M530 346v8M530 372v8M513 363h8M539 363h8M518 351l6 6M536 369l6 6M542 351l-6 6M524 369l-6 6" stroke="${INK}" stroke-width="2.600" stroke-linecap="round"/><circle cx="530" cy="363" r="4" fill="url(#g-esf-ferro)"/></g></g>`;
    s += `<g data-part="tub">${cami('M518 386h24l22 156h-12z', 'fustac', 'cil')}</g><ellipse id="cau" cx="540" cy="400" rx="6" ry="4.500" fill="#e6b93c" stroke="${INK}" stroke-width="1"/>`;
    s += `<g data-part="rella">${cami('M554 516h34l-18 46z', 'acer', 'llum')}</g>`;
    s += `<g data-part="roda"><g id="sroda">${rodaR(640, 468, 72, { raigs: 10, tex: 'fusta', gruix: 10, raig: 4, botoTex: 'ferro', extra: `<circle cx="640" cy="468" r="70.500" fill="none" stroke="#3a3f44" stroke-width="3.400"/>` })}</g><path d="M634 455L524 348M646 481L536 378" stroke="#7a4e2c" stroke-width="2.400" fill="none"/><path d="M634 455L524 348" class="flux2 s-taronja" stroke-width="3" data-flux="-2.200"/></g>`;
    // comparació: llavors tirades a mà (i ocells) o colgades en fileres
    s += `<g><rect x="770" y="46" width="200" height="190" rx="14" fill="url(#tx-terra)" stroke="${INK}" stroke-width="1.500"/><rect x="990" y="46" width="200" height="190" rx="14" fill="url(#tx-terra)" stroke="${INK}" stroke-width="1.500"/><rect x="990" y="46" width="200" height="190" rx="14" fill="#3f2c1a" opacity=".2"/>
      ${[1040, 1090, 1140].map((x) => `<rect x="${x - 8}" y="82" width="16" height="146" fill="#4a3320" opacity=".7" rx="4"/>` + Array.from({ length: 6 }, (_, i) => `<ellipse cx="${x}" cy="${98 + i * 22}" rx="4.500" ry="3.200" fill="#e6b93c" stroke="${INK}"/>`).join('')).join('')}
      ${Array.from({ length: 30 }, (_, i) => `<ellipse cx="${790 + ((i * 71 + 13) % 160)}" cy="${96 + ((i * 113 + 29) % 124)}" rx="4.500" ry="3.200" fill="#e6b93c" stroke="${INK}"/>`).join('')}
      <g transform="translate(838 118)"><ellipse cx="0" cy="0" rx="10" ry="6" fill="#3a332d"/><circle cx="9" cy="-4" r="4.500" fill="#3a332d"/><path d="M13-4l5 2-5 2z" fill="#e69e2c"/><path d="M-8 0l-8-4v6z" fill="#2a2420"/></g>
      <g transform="translate(918 176) scale(-1 1)"><ellipse cx="0" cy="0" rx="10" ry="6" fill="#4f453d"/><circle cx="9" cy="-4" r="4.500" fill="#4f453d"/><path d="M13-4l5 2-5 2z" fill="#e69e2c"/><path d="M-8 0l-8-4v6z" fill="#2a2420"/></g>
      ${cartell(870, 60, 'a eixam (a mà)', { fons: '#d9482b', w: 150 })}${cartell(1090, 60, 'en fileres', { fons: '#5b8c35', w: 110 })}
      <text x="870" y="262" class="tx-p mig">moltes se les mengen o es perden</text><text x="1090" y="262" class="tx-p mig">colgades, totes arrelen</text></g>`;
    return svg(s);
  }
  function animaSemb({ t, el, svg: g }) {
    if (!g._ll) g._ll = Array.from(g.querySelectorAll('.ll'));
    const d = t * 46, f = (d % 60) / 60;
    g._ll.forEach((n, i) => { const dist = (d % 60) + i * 60, x = 566 - dist; n.setAttribute('transform', `translate(${x.toFixed(1)} 560)`); const b = n.firstChild, cr = RI.clamp((dist - 150) / 260, 0, 1); b.setAttribute('transform', `scale(${cr.toFixed(2)})`); b.setAttribute('opacity', cr > 0 ? 1 : 0); });
    const c = el('cau'); c.setAttribute('cx', lerp(532, 560, f).toFixed(1)); c.setAttribute('cy', lerp(392, 556, f * f).toFixed(1));
    el('sroda').setAttribute('transform', `rotate(${(((d / 72) * 180) / Math.PI % 360).toFixed(1)} 640 468)`);
    el('dos').setAttribute('transform', `rotate(${((d * 6) % 360).toFixed(1)} 530 363)`);
  }

  /* ---------- arada de Rotherham ---------- */
  function arada() {
    const { caixa, cami, cartell, figura, cavallR, ombra } = RI, T2 = RI.tub, INK = '#2e221a';
    let s = paisatge(500) + `<g filter="url(#f-suau)">${nuvol(1000, 100, 1.4)}${nuvol(200, 140, 1)}</g>` + cami('M-60 500H1260V720H-60Z', 'terra', 'pla') + `<rect x="640" y="492" width="640" height="12" fill="url(#tx-herba)"/>`;
    // gleves capgirades darrere de l'orelló: l'herba queda colgada sota la terra girada
    s += `<g id="solcs">${Array.from({ length: 10 }, (_, i) => { const sx = 560 - i * 80; return `<path d="M${sx} 500q-34-44-70-6l-10 6z" fill="#5e432a" stroke="${INK}" stroke-width="1.300" stroke-linejoin="round"/><path d="M${sx} 500q-34-44-70-6l-10 6z" fill="url(#sh-cup)" opacity=".5"/><path d="M${sx - 12} 498q-18-16-36-4" stroke="#4f8236" stroke-width="3.500" fill="none" opacity=".8"/>`; }).join('')}</g><rect x="-60" y="500" width="700" height="6" fill="#5e432a"/>`;
    s += cavallR(1060, 500, 1.2, { color: '#5e4634', fosc: '#33231a' }) + cavallR(930, 500, 1.2) + `<path d="M798 380L962 412M798 386L962 420" stroke="${INK}" stroke-width="3" fill="none" stroke-dasharray="7 3"/>` + figura(232, 500, 176, { camisa: '#3d5a80', brac: 'M-9-70q14 8 32 22M9-70q6 14 16 32' });
    s += `<g data-part="esteves">${T2('M272 420L470 462M272 436L478 478', 9, 'fusta', { cap: 'round' })}</g>`;
    s += `<g data-part="cama">${ombra(600, 508, 220, 6)}${cami('M400 352L800 372V392L400 380Z', 'fusta', 'tub')}${T2('M480 384L520 440', 7, 'fusta')}<circle cx="796" cy="382" r="7" fill="url(#g-esf-ferro)" class="vora2"/></g>`;
    s += `<g data-part="orello">${cami('M560 492Q520 414 432 398L414 476Q500 482 540 530Z', 'acer', 'cup')}<path d="M446 414q54 14 82 64" fill="none" stroke="#fff" stroke-width="3" opacity=".65" stroke-linecap="round"/><path id="gleba-gira" d="M548 498Q500 442 440 448" class="flux s-verd" stroke-width="4" data-flux="-1.800"/></g>`;
    s += `<g data-part="rella">${cami('M660 528L540 532L560 490Z', 'ferro', 'llum')}</g>`;
    s += `<g data-part="ganivet">${cami('M690 378h14l-22 150-10-6z', 'acer', 'cil')}</g>`;
    s += `<g data-en="0">${cartell(820, 560, 'talla la terra en vertical', { w: 240 })}</g><g data-en="1">${cartell(760, 600, 'talla per sota i l’aixeca', { w: 230 })}</g><g data-en="2">${cartell(300, 566, 'la gira i colga les males herbes', { w: 290 })}</g>`;
    s += `<g><rect x="48" y="38" width="356" height="156" rx="14" fill="#fffdf7" stroke="${INK}" stroke-width="1.500"/><text x="226" y="68" class="tx mig">Arada pesant antiga</text>${[96, 150, 204, 258].map((x) => cavallR(x, 150, 0.36, { color: '#9a8468', fosc: '#5c4a34' })).join('')}${figura(322, 150, 56)}${figura(356, 150, 56)}<text x="226" y="178" class="tx-p mig">4 o més animals i 2 persones</text>
      <rect x="424" y="38" width="330" height="156" rx="14" fill="#fff6d6" stroke="${INK}" stroke-width="1.500"/><text x="589" y="68" class="tx mig">Arada de Rotherham</text>${cavallR(510, 150, 0.36)}${cavallR(570, 150, 0.36, { color: '#5e4634', fosc: '#33231a' })}${figura(650, 150, 56, { camisa: '#3d5a80' })}<text x="589" y="178" class="tx-p mig">2 cavalls i 1 persona</text></g>`;
    return svg(s);
  }
  function animaArada({ t, el }) { el('solcs').setAttribute('transform', `translate(${(-((t * 50) % 80)).toFixed(1)} 0)`); }

  RI.capitol({
    id: 'camp', titol: 'El camp',
    escenes: [
      {
        id: 'norfolk', nom: 'La rotació Norfolk', any: 'segle XVIII', qui: 'Est d’Anglaterra', durada: 25,
        model: 'Rotació de quatre conreus · model didàctic simplificat',
        pregunta: 'Com fas produir tota la terra, cada any?',
        intro: 'El cereal esgota la terra. La solució antiga era deixar-ne una part <b>en guaret</b> (sense sembrar). El sistema Norfolk troba una manera millor de fer-la descansar.',
        svg: norfolk, anima: animaNorfolk,
        fases: [
          { fins: 0.2, nom: 'Abans: el guaret', text: 'Cada any, una de cada tres parcel·les no dona res. I a l’hivern falta menjar per al bestiar: se n’ha de matar una bona part.' },
          { fins: 0.4, nom: 'Any 1 · Quatre conreus', text: 'Blat, naps, ordi i trèvol. Cap parcel·la buida.' },
          { fins: 0.6, nom: 'Any 2 · Tot gira', text: 'On hi havia blat ara hi ha trèvol, que «adoba» la terra; on hi havia naps, blat. Cada planta gasta i torna coses diferents.' },
          { fins: 0.8, nom: 'Any 3 · El bestiar hi ajuda', text: 'Naps i trèvol alimenten vaques i ovelles tot l’any. Els seus fems tornen als camps.' },
          { fins: 1, nom: 'Any 4 · I torna a començar', text: 'En quatre anys cada parcel·la ha tingut els quatre conreus. Més cereal, més carn i llet, i la terra no s’esgota.' }
        ],
        clau: 'Més menjar amb la mateixa terra: més població, i menys pagesos necessaris. Molts aniran a la ciutat.',
        batx: { titol: 'No va ser només tècnica', text: 'La rotació es difon lentament i de manera desigual, i va lligada als tancaments de terres (<i>enclosures</i>): els grans propietaris tanquen les terres comunals i molts pagesos pobres es queden sense. La «revolució agrícola» és també un canvi de propietat. Evita explicar-la només per un invent.', font: 'https://www.bbc.co.uk/history/british/empire_seapower/agricultural_revolution_01.shtml', fontNom: 'BBC History · Agricultural Revolution in England' }
      },
      {
        id: 'sembradora', nom: 'La sembradora', any: 'c. 1701', qui: 'Jethro Tull', durada: 14,
        model: 'Sembradora de Jethro Tull, secció simplificada (una sola filera) · reconstrucció didàctica',
        pregunta: 'Com sembres sense llençar la meitat de les llavors?',
        intro: 'Sembrar «a eixam» era llançar grapats de llavor caminant. Moltes quedaven a la vista dels ocells o massa juntes. Tull construeix una màquina que les col·loca <b>d’una en una</b>.',
        svg: sembradora, anima: animaSemb, innova: [1, 2],
        fases: [
          { fins: 0.25, nom: 'La tremuja guarda la llavor', text: 'Un dipòsit en forma d’embut. La llavor baixa pel seu propi pes.', focus: ['tremuja'] },
          { fins: 0.5, nom: 'El dosador les compta', text: 'Un cilindre amb osques gira mogut per la roda. A cada osca hi cap una llavor: com més avança la màquina, més llavors cauen, sempre a la mateixa distància.', focus: ['dosador', 'roda'] },
          { fins: 0.75, nom: 'La rella obre el solc', text: 'Una ganiveta de ferro obre una ratlla a la terra i el tub hi deixa la llavor, al fons, sempre a la mateixa fondària.', focus: ['rella', 'tub'] },
          { fins: 1, nom: 'El rasclet la tapa', text: 'Unes pues colguen la llavor. Queden fileres rectes: s’hi pot passar entremig per treure les males herbes.', focus: ['rasclet'] }
        ],
        parts: {
          tremuja: { nom: 'Tremuja', text: 'El dipòsit de la llavor.' },
          dosador: { nom: 'Dosador', text: 'Cilindre giratori amb osques. Deixa passar les llavors d’una en una.' },
          roda: { nom: 'Roda', text: 'A més de fer rodar la màquina, mou el dosador: per això la sembra és regular.' },
          tub: { nom: 'Tub', text: 'Condueix la llavor fins al fons del solc.' },
          rella: { nom: 'Rella', text: 'Obre el solc just davant d’on caurà la llavor.' },
          rasclet: { nom: 'Rasclet', text: 'Tapa la llavor amb terra perquè no se la mengin els ocells.' },
          bastidor: { nom: 'Bastidor', text: 'L’estructura de fusta. Les sembradores reals sembraven tres fileres alhora.' },
          esteves: { nom: 'Esteves', text: 'Els mànecs per guiar la màquina.' }
        },
        etiquetes: [['tremuja', 400, 230, 470, 280], ['dosador', 400, 330, 498, 360], ['roda', 740, 380, 690, 420], ['tub', 480, 480, 536, 470], ['rella', 660, 600, 574, 548], ['rasclet', 370, 600, 440, 530]],
        explotada: {
          img: 'img/exp-sembradora.webp',
          model: 'Làmina tècnica en vista explotada · Sembradora mecànica de Jethro Tull (c. 1701)',
          zones: [['tremuja', 550, 185, 145, 115], ['dosador', 550, 325, 110, 65], ['tub', 535, 425, 105, 65], ['bastidor', 590, 505, 215, 95], ['esteves', 840, 395, 125, 85], ['rella', 590, 635, 75, 85], ['rasclet', 995, 475, 115, 75], ['roda', 285, 605, 130, 145], ['roda', 855, 595, 130, 145]],
          etiquetes: [['tremuja', 315, 150, 520, 185], ['dosador', 310, 305, 535, 315], ['tub', 330, 415, 568, 388], ['roda', 120, 620, 280, 605], ['rella', 585, 755, 590, 645], ['esteves', 940, 245, 785, 315], ['rasclet', 1055, 405, 995, 465]]
        },
        real: {
          img: 'img/real-sembradora.webp',
          titol: 'Gravat original de la sembradora de Jethro Tull (làmina V)',
          museu: 'J. Tull, Horse-Hoeing Husbandry (1733)',
          lic: 'Domini públic · Wikimedia Commons'
        },
        clau: 'Menys llavor, més collita: la sembra en fileres és el principi de l’agricultura mecanitzada.',
        batx: { titol: 'Un invent avançat al seu temps', text: 'Tull la construeix cap al 1701 i la publica el 1731, però les sembradores no es generalitzen a Anglaterra fins ben entrat el segle XIX: eren cares, delicades i calia terra ben treballada. Bon exemple de la distància entre invenció i difusió.', font: 'https://www.bbc.co.uk/history/historic_figures/tull_jethro.shtml', fontNom: 'BBC History · Jethro Tull' }
      },
      {
        id: 'arada', nom: 'L’arada de Rotherham', any: '1730', qui: 'Joseph Foljambe', durada: 12,
        model: 'Arada de Rotherham · reconstrucció didàctica',
        pregunta: 'Com llaures més terra amb menys animals?',
        intro: 'Llaurar és tallar una llesca de terra i girar-la. L’arada de Rotherham ho fa amb un bastidor triangular lleuger i un <b>orelló corbat folrat de ferro</b>.',
        svg: arada, anima: animaArada, innova: [2],
        fases: [
          { fins: 0.25, nom: 'El ganivet talla', text: 'Una fulla vertical va al davant i talla la terra com un ganivet talla el pa.', focus: ['ganivet'] },
          { fins: 0.5, nom: 'La rella aixeca', text: 'La punta de ferro avança sota terra i separa la llesca del fons.', focus: ['rella'] },
          { fins: 0.75, nom: 'L’orelló gira', text: 'La terra llisca per la planxa corbada i queda capgirada: les males herbes a sota, la terra fresca a sobre.', focus: ['orello'] },
          { fins: 1, nom: 'Més lleugera', text: 'Com que pesa poc i llisca bé, n’hi ha prou amb dos cavalls i una sola persona. Es llaura més de pressa i més barat.', focus: ['cama', 'esteves'] }
        ],
        parts: {
          ganivet: { nom: 'Ganivet', text: 'Fulla de ferro que talla la terra en vertical.' },
          rella: { nom: 'Rella', text: 'La punta que talla la terra per sota.' },
          orello: { nom: 'Orelló', text: 'Planxa corbada, folrada de ferro, que gira la terra. La seva forma és la gran millora.' },
          cama: { nom: 'Cama', text: 'La biga principal, d’on estiren els animals.' },
          esteves: { nom: 'Esteves', text: 'Els dos mànecs amb què el pagès guia l’arada.' }
        },
        etiquetes: [['ganivet', 790, 300, 700, 400], ['rella', 720, 640, 620, 528], ['orello', 430, 640, 470, 470, 'Orelló'], ['cama', 600, 300, 600, 378], ['esteves', 330, 330, 330, 432]],
        explotada: {
          img: 'img/exp-arada.webp',
          model: 'Làmina tècnica en vista explotada · Arada triangular de Rotherham (Foljambe, 1730)',
          zones: [['cama', 475, 275, 300, 62], ['esteves', 905, 235, 145, 145], ['ganivet', 525, 445, 65, 105], ['rella', 475, 645, 110, 85], ['orello', 775, 555, 175, 95]],
          etiquetes: [['cama', 355, 165, 485, 270], ['esteves', 1035, 130, 945, 172], ['ganivet', 300, 445, 520, 445], ['rella', 275, 655, 465, 645], ['orello', 985, 585, 815, 545, 'Orelló']]
        },
        clau: 'Ferro al camp: eines més eficients alliberen braços i animals.',
        batx: { titol: 'Del taller a la fàbrica', text: 'L’arada de Rotherham es va fabricar en sèrie, amb peces iguals, i més endavant totalment de ferro (Ransome, 1785, rella de ferro colat). L’agricultura esdevé client de la siderúrgia: un altre fil que lliga el camp amb la indústria.', font: 'https://www.bbc.co.uk/history/british/empire_seapower/agricultural_revolution_01.shtml', fontNom: 'BBC History · Agricultural Revolution in England' }
      }
    ],
    repte: [
      { q: 'Què és el guaret?', o: ['Un tipus de blat', 'Deixar una terra sense sembrar perquè es recuperi', 'Una eina per llaurar'], c: 1, e: 'Era la manera antiga de fer descansar la terra, però deixava una part del camp sense collita.' },
      { q: 'Quins quatre conreus fan girar el sistema Norfolk?', o: ['Blat, naps, ordi i trèvol', 'Blat, patates, vinya i olivera', 'Arròs, cotó, blat i sucre'], c: 0, e: 'Dos cereals i dues plantes farratgeres que es van alternant.' },
      { q: 'Per què els naps i el trèvol són tan importants?', o: ['Perquè es venen molt cars', 'Perquè alimenten el bestiar i ajuden a recuperar la terra', 'Perquè no necessiten aigua'], c: 1, e: 'Més farratge vol dir més animals, més fems i terra més fèrtil.' },
      { tipus: 'toca', esc: 'sembradora', part: 'dosador', p: 0.4, q: 'Toca la peça de la sembradora que deixa caure les llavors d’una en una.', e: 'El dosador: un cilindre amb osques que gira amb la roda.' },
      { tipus: 'ordena', esc: 'sembradora', q: 'Ordena el camí que fa una llavor dins la sembradora.', e: 'Tremuja → dosador → rella i tub → rasclet.' },
      { q: 'Quin avantatge té sembrar en fileres?', o: ['Es gasta menys llavor i es pot desherbar entremig', 'Les plantes creixen sense sol', 'No cal llaurar'], c: 0, e: 'Totes les llavors queden colgades, separades i en línia.' },
      { tipus: 'toca', esc: 'arada', part: 'orello', p: 0.6, q: 'Toca la peça de l’arada de Rotherham que gira la terra.', e: 'L’orelló: una planxa corbada folrada de ferro. La seva forma és la gran millora.' },
      { q: 'Què va canviar amb l’arada de Rotherham?', o: ['Calien més bous', 'N’hi havia prou amb dos cavalls i una persona', 'Ja no calia sembrar'], c: 1, e: 'Era lleugera i el seu orelló de ferro girava la terra amb menys esforç.' }
    ]
  });
})();

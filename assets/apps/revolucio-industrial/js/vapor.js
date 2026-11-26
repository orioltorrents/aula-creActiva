// SPDX-License-Identifier: AGPL-3.0-or-later
/* Capítol 2 · El vapor: Newcomen, Watt i el moviment rotatiu. */
(function () {
  const { svg, foc, focs, roda, engranatge, persona, nuvol, txt, fletxa, retol, tram, color } = RI;
  const valv = (id, x, y) => `<g id="${id}"><circle class="t2" cx="${x}" cy="${y}" r="11" fill="#fffdf7"/><line id="${id}-l" x1="${x - 8}" y1="${y}" x2="${x + 8}" y2="${y}" stroke="#2a2420" stroke-width="5" stroke-linecap="round"/></g>`;
  function posaValv(el, id, x, y, oberta, vertical) {
    const g = el(id); if (!g) return;
    g.firstChild.setAttribute('fill', oberta ? '#8fd05c' : '#e9644a');
    el(id + '-l').setAttribute('transform', `rotate(${(oberta ? 0 : 90) + (vertical ? 90 : 0)} ${x} ${y})`);
  }

  /* ---------- màquina de balancí (Newcomen o Watt d'efecte simple) ---------- */
  function motor(w) {
    const { caixa, cami, tub, brida, reblons, cadena, brasa, figura, ombra, cartell } = RI;
    const INK = '#2e221a';
    let s = RI.fons(-64);
    // subsòl de roca, galeria inundada i pou de la mina
    s += cami('M-60 560H1260V720H-60Z', 'roca', 'pla');
    s += `<rect x="-60" y="556" width="110" height="10" fill="url(#tx-herba)"/><rect x="1096" y="556" width="164" height="10" fill="url(#tx-herba)"/>`;
    s += `<path d="M640 640H1160V712H640Z" fill="#33271e"/><path d="M640 640H1160V712H640Z" fill="url(#sh-pou)" opacity=".7"/><rect x="822" y="560" width="56" height="84" fill="#2a2019"/><rect x="822" y="560" width="56" height="84" fill="url(#sh-pou)"/>`;
    [700, 780, 930, 1010, 1100].forEach((x) => { s += caixa(x, 640, 9, 72, 'fustaf', 'cil') ; });
    s += caixa(640, 636, 520, 8, 'fustaf', 'tub') + caixa(818, 560, 7, 80, 'fustaf', 'cil') + caixa(875, 560, 7, 80, 'fustaf', 'cil');
    s += figura(1052, 708, 58, { color: '#3a2f27', camisa: '#6f5a45' }) + `<circle cx="1071" cy="672" r="3.500" fill="#ffd35c"/><circle cx="1071" cy="672" r="12" fill="url(#g-resplendor)"/>`;
    s += `<rect x="641" y="688" width="518" height="24" fill="url(#g-aiguat)"/><path d="M644 689q12-5 24 0t24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0 24 0" fill="none" stroke="#fff" stroke-width="1.600" opacity=".8"/>`;
    s += cartell(736, 668, 'la mina s’inunda', { fons: '#1d5f8f', mida: 14 });
    // terra de lloses
    s += caixa(50, 548, 1046, 16, 'pedra', 'pla');
    // pilar de maó amb coixinet
    s += ombra(600, 552, 70, 7) + `<g filter="url(#f-projecta)">` + caixa(538, 528, 104, 22, 'pedra', 'pla') + cami('M548 528L564 134H616L632 528Z', 'mao', 'llum') + `</g>` + caixa(554, 120, 72, 15, 'pedra', 'pla') + cami('M568 120L576 98H604L612 120Z', 'ferro', 'llum');

    if (!w) {
      // bastida de fusta al voltant de la caldera
      s += caixa(84, 196, 14, 352, 'fusta-v', 'cil') + caixa(502, 196, 14, 352, 'fusta-v', 'cil') + caixa(70, 196, 462, 15, 'fusta', 'tub');
      s += tub('M98 262L146 212', 9, 'fusta') + tub('M502 262L454 212', 9, 'fusta');
      // dipòsit d'aigua freda i canonada d'injecció
      s += `<g data-part="diposit">${caixa(105, 142, 80, 54, 'plom', 'llum', { rx: 3 })}<ellipse cx="145" cy="143" rx="40" ry="5" fill="#3f7fae" stroke="${INK}" stroke-width="1.300"/><ellipse cx="139" cy="142" rx="18" ry="1.600" fill="#fff" opacity=".6"/>${tub('M145 196V358H272', 9, 'coure')}${brida(145, 232, 16, 7, 'llauto')}${brida(200, 358, 7, 16, 'llauto')}<path d="M145 200V358H270" class="flux2 s-blau" stroke-width="3" data-flux="2.500" data-fase="0.34-0.47"/></g>`;
      // desguàs cap al pou calent
      s += `<g data-part="desguas">${tub('M296 386V404H175V522', 8, 'plom')}${cami('M148 518h56l-6 30h-44z', 'fustaf', 'llum')}<path d="M150 528h52M152 540h48" stroke="#30353a" stroke-width="2.600"/><ellipse cx="176" cy="519" rx="27" ry="3.500" fill="#5fa6cf" stroke="${INK}" stroke-width="1"/><path d="M175 408V516" class="flux2 s-blau" stroke-width="3" data-flux="1.500" data-fase="0.84-1"/></g>`;
      // caldera de coure sobre el fogar de maó
      s += `<g data-part="caldera">${ombra(330, 552, 140, 7)}${caixa(205, 470, 250, 78, 'mao', 'pla')}<path d="M284 548V512Q330 470 376 512V548Z" fill="#1a110b"/><path d="M284 512Q330 470 376 512" fill="none" stroke="#d99a72" stroke-width="7" stroke-dasharray="10 2.500"/><path d="M284 512Q330 470 376 512" fill="none" stroke="${INK}" stroke-width="1" transform="translate(0 -3.500)"/>${brasa(330, 546, 72, 40)}${cami('M262 506h16v42h-16z', 'ferro', 'llum')}${caixa(199, 462, 262, 9, 'pedra', 'pla')}`;
      s += cami('M226 464C226 384 434 384 434 464Z', 'coure', 'cup') + `<path d="M246 440Q330 398 414 440" fill="none" stroke="#7a3d1b" stroke-width="1.200" opacity=".7"/>`;
      for (let i = 0; i <= 8; i++) { const k = i / 8, x = (1 - k) * (1 - k) * 246 + 2 * k * (1 - k) * 330 + k * k * 414, y = (1 - k) * (1 - k) * 440 + 2 * k * (1 - k) * 398 + k * k * 440; s += reblons(x, y - 3, x, y - 3, 1, 2.200); }
      // finestra de tall: es veu l'aigua que bull i el vapor
      s += `<clipPath id="tall-cald"><path d="M300 458C300 432 318 420 348 420C384 420 408 438 412 458Z"/></clipPath><g clip-path="url(#tall-cald)"><rect x="296" y="414" width="120" height="48" fill="#4a2616"/><rect x="296" y="414" width="120" height="26" fill="#f6d9b8" opacity=".5"/><rect x="296" y="440" width="120" height="22" fill="url(#g-aiguat)"/><path d="M296 441q8-4 16 0t16 0 16 0 16 0 16 0 16 0 16 0 16 0" fill="none" stroke="#fff" stroke-width="1.300"/><g data-puf="330 458 0 -16 3 2.200 0.900" class="vap"></g><g data-puf="380 458 0 -16 3 2.200 1.100" class="vap"></g></g><path d="M300 458C300 432 318 420 348 420C384 420 408 438 412 458Z" fill="none" stroke="#f3c59c" stroke-width="2.600"/><path d="M300 458C300 432 318 420 348 420C384 420 408 438 412 458Z" fill="none" stroke="${INK}" stroke-width=".9" transform="translate(0 -1.600)"/>`;
      s += caixa(220, 458, 220, 9, 'coure', 'tub', { tint: '#5b2a10', to: 0.3 }) + reblons(230, 462.5, 430, 462.5, 15, 2.400) + tub('M330 386V414', 20, 'llauto') + `</g>`;
      s += `<g data-puf="330 430 0 -34 4 6 1.500" class="vap boira" data-fase="0-0.34"></g>`;
    } else {
      // Watt: caldera a part
      s += `<g data-part="caldera">${ombra(180, 552, 100, 7)}${caixa(95, 456, 170, 92, 'mao', 'pla')}<path d="M140 548V516Q180 480 220 516V548Z" fill="#1a110b"/><path d="M140 516Q180 480 220 516" fill="none" stroke="#d99a72" stroke-width="7" stroke-dasharray="10 2.500"/>${brasa(180, 546, 62, 36)}${caixa(89, 448, 182, 9, 'pedra', 'pla')}`;
      s += cami('M108 450V414Q108 372 180 372Q252 372 252 414V450Z', 'coure', 'cup') + reblons(116, 444, 244, 444, 12, 2.400) + `<path d="M112 420Q180 396 248 420" fill="none" stroke="#7a3d1b" stroke-width="1.200" opacity=".7"/>`;
      s += `<clipPath id="tall-cald"><path d="M150 440C150 414 164 400 188 400C214 400 232 416 236 440Z"/></clipPath><g clip-path="url(#tall-cald)"><rect x="146" y="396" width="94" height="48" fill="#4a2616"/><rect x="146" y="396" width="94" height="24" fill="#f6d9b8" opacity=".5"/><rect x="146" y="420" width="94" height="24" fill="url(#g-aiguat)"/><path d="M146 421q8-4 16 0t16 0 16 0 16 0 16 0 16 0" fill="none" stroke="#fff" stroke-width="1.300"/><g data-puf="176 440 0 -16 3 2.200 0.900" class="vap"></g><g data-puf="214 440 0 -16 3 2.200 1.100" class="vap"></g></g><path d="M150 440C150 414 164 400 188 400C214 400 232 416 236 440Z" fill="none" stroke="#f3c59c" stroke-width="2.600"/></g>`;
      // tub de vapor cap a dalt del cilindre
      s += `<g data-part="tub">${tub('M180 374V196H272V230', 13, 'coure')}${brida(180, 362, 22, 8, 'llauto')}${brida(180, 250, 20, 7, 'llauto')}${brida(272, 222, 20, 8, 'llauto')}<path d="M180 370V196H270V226" class="flux s-blanc" stroke-width="5" data-flux="2" data-fase="0-0.45"/></g>`;
      s += ombra(330, 552, 90, 7) + caixa(262, 394, 136, 154, 'pedra', 'pla');
      // camisa de vapor: una segona paret que manté calent el cilindre
      s += `<g data-part="camisa">${caixa(250, 206, 160, 190, 'llauto', 'cil', { rx: 9 })}<rect x="262" y="214" width="136" height="176" rx="4" fill="#f3a56a"/><rect x="262" y="214" width="136" height="176" rx="4" fill="url(#sh-cil)" opacity=".5"/>${reblons(256, 226, 256, 380, 8, 2.200, '#a8801e')}${reblons(404, 226, 404, 380, 8, 2.200, '#a8801e')}</g>`;
      s += `<g data-part="equilibri">${tub('M396 240H420V364H396', 9, 'coure')}${brida(420, 262, 16, 7, 'llauto')}${brida(420, 342, 16, 7, 'llauto')}<path d="M398 240H420V364H398" class="flux s-blanc" stroke-width="4" data-flux="2" data-fase="0.55-0.97"/></g>`;
      // condensador separat dins d'una cisterna d'aigua freda, amb la bomba d'aire
      s += `<g data-part="condensador">${tub('M300 392V414H457V468', 10, 'plom')}<path d="M300 394V414H457V464" class="flux s-taronja" stroke-width="4" data-flux="2.500" data-fase="0-0.34"/>${caixa(428, 436, 126, 112, 'fustaf', 'llum')}<rect x="435" y="446" width="112" height="98" fill="url(#g-aiguat)"/><path d="M436 447q7-4 14 0t14 0 14 0 14 0 14 0 14 0 14 0 14 0" fill="none" stroke="#fff" stroke-width="1.300"/><path d="M428 462h126M428 524h126" stroke="#30353a" stroke-width="3.400"/>`;
      s += `${caixa(440, 466, 36, 76, 'llauto', 'cil', { rx: 6 })}<rect x="445" y="472" width="26" height="64" rx="4" fill="#e9f3f7"/><g id="gotes"><circle cx="452" cy="486" r="3.200" fill="#2f7fb5"/><circle cx="463" cy="500" r="3.200" fill="#2f7fb5"/><circle cx="455" cy="514" r="3.200" fill="#2f7fb5"/><circle cx="465" cy="478" r="3.200" fill="#2f7fb5"/></g></g>`;
      s += `<g data-part="bomba">${caixa(492, 466, 36, 76, 'llauto', 'cil', { rx: 4 })}<rect x="497" y="472" width="26" height="64" rx="3" fill="#e9f3f7"/>${tub('M476 534H492', 8, 'plom')}<g id="bomba-m">${tub('M510 122V498', 5, 'ferro')}${caixa(497, 494, 26, 9, 'ferro', 'tub')}</g></g>`;
    }

    // cilindre en secció: les parets canvien de color amb la temperatura
    const paret = w ? 'M268 210H392V378Q392 390 380 390H280Q268 390 268 378ZM282 224V372H378V224Z' : 'M268 214V378Q268 390 280 390H380Q392 390 392 378V214H378V372H282V214Z';
    s += `<g data-part="cilindre">${caixa(282, w ? 224 : 214, 96, w ? 148 : 158, 'llauto', 'cil', { tint: '#2a1a0c', to: 0.62, vora: 0.01 })}<rect id="vap" x="282" y="300" width="96" height="72" fill="#f9c9a0" opacity=".88"/>${w ? '<rect id="vap2" x="282" y="224" width="96" height="60" fill="#f9c9a0" opacity=".88"/>' : ''}`;
    s += `<path id="cil" d="${paret}" fill="#f08a4b" fill-rule="evenodd"/><path d="${paret}" fill="url(#p-seccio)" fill-rule="evenodd"/><path d="${paret}" class="vora" fill-rule="evenodd"/>`;
    s += w ? caixa(260, 202, 140, 10, 'llauto', 'tub', { rx: 2 }) + reblons(270, 207, 390, 207, 8, 2.200, '#a8801e') + caixa(318, 190, 24, 13, 'llauto', 'cil', { rx: 2 }) : caixa(258, 208, 26, 9, 'llauto', 'tub', { rx: 2 }) + caixa(376, 208, 26, 9, 'llauto', 'tub', { rx: 2 });
    s += `</g>`;
    if (!w) s += `<g data-fase="0.34-0.47"><ellipse cx="326" cy="336" rx="42" ry="30" fill="#bfe3f5" opacity=".75" filter="url(#f-boira)"/><path d="M284 358l58-36M284 358l74-16M284 358l38-54M284 358l80 6M284 358l22-58" fill="none" stroke="#2f7fb5" stroke-width="3.400" stroke-linecap="round" stroke-dasharray="7 6"/><path d="M284 358l58-36M284 358l74-16M284 358l38-54M284 358l80 6" fill="none" stroke="#fff" stroke-width="1.200" stroke-linecap="round" stroke-dasharray="3 10"/></g>`;
    s += `<text id="buit" x="330" y="350" class="mig" fill="#1d5f8f" opacity="0" style="font-weight:900;font-size:22px;paint-order:stroke;stroke:#fff;stroke-width:5px">BUIT</text>`;
    // pistó amb l'estopada (i, a Newcomen, una capa d'aigua que segella)
    s += `<g data-part="piston" id="piston">${tub('M330 -114V0', 8, 'ferro')}${w ? '' : '<rect x="284" y="-18" width="92" height="8" fill="#5fa6cf" opacity=".85"/>'}${caixa(283, -11, 94, 22, 'ferro', 'tub', { rx: 2 })}<rect x="283" y="-3.500" width="94" height="7" fill="#d9c08a" stroke="${INK}" stroke-width=".8"/><path d="M286 0h88" stroke="#a88f58" stroke-width="1" stroke-dasharray="3 3"/>${cami('M322 -126h16v14h-16z', 'ferro', 'llum')}</g>`;
    s += cadena('cad1', 330, 108, 200);
    // vàlvules
    s += w ? valv('v-adm', 228, 196) + valv('v-eq', 420, 300) + valv('v-esc', 380, 414) : valv('v-adm', 330, 400) + valv('v-inj', 145, 290);
    // pressió atmosfèrica (Newcomen) o vapor (Watt)
    if (!w) s += `<g data-fase="0.47-0.84">${fletxa('M298 126V204', '#2f7fb5', 10)}${fletxa('M362 126V204', '#2f7fb5', 10)}${cartell(196, 100, 'pressió de l’aire (1 atm)', { fons: '#2f7fb5', w: 208 })}</g>`;
    else s += `<g data-fase="0.03-0.45">${fletxa('M304 232V268', '#d9482b', 6)}${fletxa('M356 232V268', '#d9482b', 6)}${cartell(500, 250, 'el vapor empeny', { fons: '#d9482b' })}</g>`;
    // bomba de la mina: vareta, tub d'elevació i canal de sortida
    s += `<g data-part="bombamina">${caixa(838, 536, 24, 172, 'ferro', 'cil')}<rect x="842" y="540" width="16" height="166" fill="url(#g-aiguat)"/><path d="M850 700V546" class="flux s-blanc" stroke-width="4" data-flux="2.500" data-fase="${w ? '0.03-0.45' : '0.47-0.84'}"/>${brida(850, 590, 30, 7, 'ferro')}${brida(850, 650, 30, 7, 'ferro')}`;
    s += cami('M862 534h104l-4 14h-100z', 'fusta', 'tub') + `<path d="M864 538h98" stroke="#5fa6cf" stroke-width="4" stroke-linecap="round" data-fase="${w ? '0.03-0.45' : '0.47-0.84'}"/><path d="M964 544q14 2 16 20" fill="none" stroke="#5fa6cf" stroke-width="7" stroke-linecap="round" data-fase="${w ? '0.03-0.45' : '0.47-0.84'}"/>`;
    s += cami('M948 560h140l-8 14h-124z', 'pedra', 'pla') + `<ellipse cx="1018" cy="561" rx="66" ry="5" fill="#5fa6cf" stroke="${INK}" stroke-width="1"/><ellipse cx="1004" cy="560" rx="28" ry="1.500" fill="#fff" opacity=".6"/>`;
    s += `<g id="vareta">${caixa(843, -400, 14, 400, 'fusta-v', 'cil')}${caixa(836, -6, 28, 14, 'ferro', 'tub', { rx: 3 })}${caixa(839, -250, 22, 9, 'ferro', 'tub')}${caixa(838, -436, 24, 40, 'ferro', 'llum', { rx: 2 })}</g>`;
    s += caixa(806, 452, 12, 96, 'fusta-v', 'cil') + caixa(882, 452, 12, 96, 'fusta-v', 'cil') + caixa(798, 464, 104, 12, 'fusta', 'tub') + `</g>`;
    s += cadena('cad2', 850, 108, 200);
    // balancí de fusta amb caps d'arc i ferramenta
    s += `<g data-part="balanci" id="biga">${cami('M340 38A260 260 0 0 0 340 182Q372 128 452 126Q590 138 728 126Q808 128 840 182A260 260 0 0 0 840 38Q808 92 728 94Q590 82 452 94Q372 92 340 38Z', 'fusta', 'tub')}`;
    s += `<path d="M340 38A260 260 0 0 0 340 182" fill="none" stroke="#30353a" stroke-width="6"/><path d="M840 38A260 260 0 0 1 840 182" fill="none" stroke="#30353a" stroke-width="6"/><path d="M340 38A260 260 0 0 0 330 110" fill="none" stroke="#1f2327" stroke-width="8" stroke-dasharray="11 6" stroke-linecap="round"/><path d="M840 38A260 260 0 0 1 850 110" fill="none" stroke="#1f2327" stroke-width="8" stroke-dasharray="11 6" stroke-linecap="round"/>`;
    s += caixa(444, 90, 12, 40, 'ferro', 'cil') + caixa(724, 90, 12, 40, 'ferro', 'cil') + caixa(356, 60, 9, 100, 'ferro', 'cil') + caixa(815, 60, 9, 100, 'ferro', 'cil') + caixa(562, 84, 56, 52, 'ferro', 'pla', { rx: 3 }) + reblons(570, 92, 610, 92, 3, 2.400, '#22272b') + reblons(570, 128, 610, 128, 3, 2.400, '#22272b');
    s += `<circle cx="590" cy="110" r="13" fill="url(#tx-llauto)" class="vora2"/><circle cx="590" cy="110" r="13" fill="url(#sh-bola)"/><circle cx="590" cy="110" r="4" fill="${INK}" opacity=".7"/></g>`;
    return svg(s, '-60 -64 1320 784');
  }

  function animaMotor(w) {
    return ({ p, el }) => {
      let u, calent;
      if (!w) {
        u = p < 0.34 ? tram(p, 0.02, 0.33, 1, -1) : p < 0.47 ? -1 : tram(p, 0.47, 0.84, -1, 1);
        calent = p < 0.34 ? tram(p, 0, 0.26, 0, 1) : tram(p, 0.34, 0.44, 1, 0);
      } else {
        u = p < 0.5 ? tram(p, 0.03, 0.45, -1, 1) : tram(p, 0.55, 0.97, 1, -1);
        calent = 1;
      }
      const yp = 296 + 54 * u, a = (54 * u) / 260;
      el('piston').setAttribute('transform', `translate(0 ${yp.toFixed(1)})`);
      el('biga').setAttribute('transform', `rotate(${((-a * 180) / Math.PI).toFixed(2)} 590 110)`);
      ['cad1', 'cad1b'].forEach((id) => el(id).setAttribute('y2', (yp - 122).toFixed(1)));
      const yv = 625 - 54 * u;
      el('vareta').setAttribute('transform', `translate(0 ${yv.toFixed(1)})`);
      ['cad2', 'cad2b'].forEach((id) => el(id).setAttribute('y2', (yv - 432).toFixed(1)));
      const v = el('vap'); v.setAttribute('y', (yp + 11).toFixed(1)); v.setAttribute('height', Math.max(0, 372 - yp - 11).toFixed(1));
      if (!w) {
        const buit = p >= 0.38 && p < 0.86;
        v.setAttribute('fill', p < 0.34 ? '#f9c9a0' : color('#f9c9a0', '#bcdcef', (p - 0.34) / 0.08));
        el('buit').setAttribute('opacity', buit && u < 0.3 ? 1 : 0); el('buit').setAttribute('y', (yp + 11 + (372 - yp - 11) / 2 + 6).toFixed(1));
        el('cil').setAttribute('fill', color('#8fc3e0', '#f08a4b', calent));
        posaValv(el, 'v-adm', 330, 400, p < 0.34, true); posaValv(el, 'v-inj', 145, 290, p >= 0.34 && p < 0.47, true);
      } else {
        const v2 = el('vap2'); v2.setAttribute('y', 224); v2.setAttribute('height', Math.max(0, yp - 11 - 224).toFixed(1));
        const baix = p < 0.34 ? color('#f9c9a0', '#eef4f6', p / 0.2) : p < 0.55 ? '#eef4f6' : '#f9c9a0';
        v.setAttribute('fill', baix);
        el('buit').setAttribute('opacity', p > 0.12 && p < 0.5 && u < 0.5 ? 1 : 0); el('buit').setAttribute('y', (yp + 11 + (372 - yp - 11) / 2 + 6).toFixed(1));
        posaValv(el, 'v-adm', 228, 196, p < 0.45, false); posaValv(el, 'v-esc', 380, 414, p < 0.45, false); posaValv(el, 'v-eq', 420, 300, p >= 0.55 && p < 0.97, true);
        el('bomba-m').setAttribute('transform', `translate(0 ${(16.6 * u).toFixed(1)})`);
        el('gotes').setAttribute('transform', `translate(0 ${((p * 3) % 1) * 16})`); el('gotes').setAttribute('opacity', p < 0.4 ? 1 : 0.25);
      }
    };
  }

  /* ---------- màquina rotativa de Watt ---------- */
  const O = { x: 520, y: 170 }, L = 270, S = { x: 790, y: 470 }, R = 90, LB = 300;
  function rotativa() {
    const { caixa, cami, tub, brida, reblons, figura, ombra, cartell, rodaR, engranatgeR } = RI;
    const INK = '#2e221a';
    let s = RI.fons(0);
    // sala de màquines: paret al fons, terra de lloses i fossa del volant
    s += caixa(-60, 0, 1320, 38, 'mao', 'fosc') + cami('M-60 600H1260V720H-60Z', 'pedra', 'pla');
    s += `<rect x="640" y="600" width="300" height="120" fill="#2a2019"/><rect x="640" y="600" width="300" height="120" fill="url(#sh-pou)"/><path d="M640 600V720M940 600V720" stroke="${INK}" stroke-width="1.500"/>`;
    // eix de transmissió del sostre i corretja de cuir
    s += `<g data-part="corretja">${caixa(1052, 38, 10, 66, 'ferro', 'cil')}${caixa(1180, 38, 10, 66, 'ferro', 'cil')}${tub('M1030 117H1210', 12, 'ferro')}<path d="M790 428L1058 86M790 512L1084 148" fill="none" stroke="${INK}" stroke-width="9"/><path d="M790 428L1058 86M790 512L1084 148" fill="none" stroke="#7a4e2c" stroke-width="6.500"/><path d="M790 428L1058 86" class="flux2" stroke="#d9b98a" data-flux="3" stroke-width="2"/><g data-girat="1070 117 300">${rodaR(1070, 117, 34, { raigs: 4, tex: 'fusta', gruix: 9 })}</g>${fletxa('M1112 190H1196', '#d9482b', 5)}<text x="1154" y="172" class="tx mig">cap a les màquines</text></g>`;
    // volant d'inèrcia
    s += `<g data-part="volant">${ombra(790, 716, 150, 6, 0.3)}<g id="volant">${rodaR(S.x, S.y, 168, { raigs: 6, gruix: 24, raig: 12, boto: 30 })}</g>${cami('M742 600L762 480H818L838 600Z', 'ferro', 'llum')}${caixa(756, 456, 68, 28, 'ferro', 'tub', { rx: 5 })}</g>`;
    // bancada de fusta i columna de ferro colat
    s += ombra(560, 612, 430, 8) + caixa(150, 584, 470, 22, 'fusta', 'tub') + caixa(150, 580, 14, 30, 'ferro', 'cil') + caixa(380, 580, 14, 30, 'ferro', 'cil') + caixa(606, 580, 14, 30, 'ferro', 'cil');
    s += `<g filter="url(#f-projecta)">${caixa(474, 562, 92, 22, 'ferro', 'pla', { rx: 3 })}${cami('M490 562Q506 500 508 204H532Q534 500 550 562Z', 'ferro', 'cil')}${caixa(498, 190, 44, 14, 'ferro', 'tub', { rx: 3 })}<path d="M514 210V556M526 210V556" stroke="#000" stroke-opacity=".22" stroke-width="2"/></g>`;
    // cilindre de doble efecte, en secció
    const paret = 'M193 312H307V528Q307 540 295 540H205Q193 540 193 528ZM207 322V530H293V322Z';
    s += `<g data-part="cilindre">${cami('M178 600L190 540H310L322 600Z', 'ferro', 'llum')}<path d="M226 600V574Q250 556 274 574V600Z" fill="#1a110b"/>${caixa(207, 322, 86, 208, 'llauto', 'cil', { tint: '#2a1a0c', to: 0.62, vora: 0.01 })}<rect id="cam-d" x="207" y="322" width="86" height="100" fill="#f9c9a0" opacity=".9"/><rect id="cam-b" x="207" y="430" width="86" height="100" fill="#eef4f6" opacity=".9"/>`;
    s += `<path d="${paret}" fill="#f08a4b" fill-rule="evenodd"/><path d="${paret}" fill="url(#p-seccio)" fill-rule="evenodd"/><path d="${paret}" class="vora" fill-rule="evenodd"/>${caixa(184, 300, 132, 13, 'llauto', 'tub', { rx: 2 })}${reblons(194, 306.500, 306, 306.500, 7, 2.300, '#a8801e')}${caixa(238, 286, 24, 15, 'llauto', 'cil', { rx: 2 })}${caixa(184, 536, 132, 9, 'llauto', 'tub', { rx: 2 })}</g>`;
    // distribució: caixa de vàlvules, vapor que arriba de la caldera i sortida al condensador
    s += `<g data-part="distribucio">${tub('M40 300H160V332', 13, 'coure')}${brida(72, 300, 8, 22, 'llauto')}${brida(160, 322, 22, 8, 'llauto')}<path d="M44 300H160V328" class="flux s-blanc" stroke-width="5" data-flux="2"/><circle id="papallona" cx="110" cy="300" r="6.500" fill="#fbbf24" stroke="#92400e" stroke-width="1.800"/>`;
    s += `${tub('M160 518V566H104', 11, 'plom')}${caixa(138, 330, 44, 190, 'ferro', 'cil', { rx: 7 })}${reblons(145, 340, 175, 340, 3, 2.200, '#22272b')}${reblons(145, 510, 175, 510, 3, 2.200, '#22272b')}${tub('M182 350H196', 10, 'llauto')}${tub('M182 500H196', 10, 'llauto')}`;
    s += `${caixa(48, 540, 60, 58, 'plom', 'llum', { rx: 5 })}<rect x="54" y="552" width="48" height="40" rx="3" fill="url(#g-aiguat)"/><text x="62" y="282" class="tx-p">vapor de la caldera</text><text x="78" y="528" class="tx-p mig">condensador</text>`;
    s += `<g id="fl-d">${fletxa('M186 350H230', '#d9482b', 6)}${fletxa('M250 332V376', '#d9482b', 5)}</g><g id="fl-b">${fletxa('M186 500H230', '#d9482b', 6)}${fletxa('M250 520V476', '#d9482b', 5)}</g></g>`;
    s += `<g data-part="piston" id="rpiston">${tub('M250 -250V0', 9, 'ferro')}${caixa(208, -9, 84, 18, 'ferro', 'tub', { rx: 2 })}<rect x="208" y="-3" width="84" height="6" fill="#d9c08a" stroke="${INK}" stroke-width=".8"/></g>`;
    // balancí de ferro colat
    s += `<g data-part="balanci" id="rbiga">${cami('M238 170Q238 154 256 152L520 138L784 152Q802 154 802 170Q802 186 784 188L520 202L256 188Q238 186 238 170Z', 'ferro', 'tub')}<path d="M296 164L486 154V186L296 176Z" fill="#000" opacity=".2"/><path d="M554 154L744 164V176L554 186Z" fill="#000" opacity=".2"/><path d="M296 164L486 154M554 154L744 164" stroke="#fff" stroke-opacity=".25" stroke-width="1.400"/>`;
    s += `<circle cx="250" cy="170" r="11" fill="url(#g-esf-llauto)" class="vora2"/><circle cx="790" cy="170" r="11" fill="url(#g-esf-llauto)" class="vora2"/><circle cx="520" cy="170" r="17" fill="url(#tx-ferro)" class="vora2"/><circle cx="520" cy="170" r="11" fill="url(#g-esf-llauto)" class="vora2"/></g>`;
    // sol i planeta amb la biela
    s += `<g data-part="sol"><g id="sol">${engranatgeR(S.x, S.y, 45, 14, { tex: 'llauto' })}</g></g>`;
    s += `<g data-part="biela"><line id="rbiela" x1="790" y1="170" x2="790" y2="380" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><line id="rbiela2" x1="790" y1="170" x2="790" y2="380" stroke="#6d767d" stroke-width="12.500" stroke-linecap="round"/><line id="rbiela3" x1="790" y1="170" x2="790" y2="380" stroke="#c3ccd2" stroke-width="3.500" stroke-linecap="round"/></g>`;
    s += `<g data-part="planeta"><g id="planeta">${engranatgeR(0, 0, 45, 14, { tex: 'ferro', pern: 'llauto' })}</g></g>`;
    // regulador centrífug i tirant fins a la vàlvula del vapor
    s += `<g data-part="regulador"><path id="tirant" d="M1040 436L520 264L110 292" fill="none" stroke="#d97706" stroke-width="2.600" stroke-dasharray="5 4" opacity=".8"/>${ombra(1040, 604, 60, 6)}${cami('M996 600L1012 548H1068L1084 600Z', 'ferro', 'llum')}${caixa(1034, 300, 12, 250, 'ferro', 'cil')}<g id="reg"><line id="reg-a" x1="1040" y1="318" x2="990" y2="390" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><line id="reg-b" x1="1040" y1="318" x2="1090" y2="390" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle id="reg-1" cx="990" cy="390" r="20" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.400"/><circle id="reg-2" cx="1090" cy="390" r="20" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.400"/><rect id="reg-m" x="1027" y="424" width="26" height="22" rx="4" fill="url(#tx-llauto)" stroke="${INK}" stroke-width="1.400"/></g><circle cx="1040" cy="314" r="9" fill="url(#g-esf-ferro)" class="vora2"/><path d="M1040 296l-6 10h12z" fill="url(#tx-llauto)" class="vora2"/></g>`;
    s += figura(396, 600, 150, { attr: 'class="atenua"' });
    return svg(s);
  }
  function animaRot({ p, t, el }) {
    const th = 2 * Math.PI * p - Math.PI / 2, P = { x: S.x + R * Math.cos(th), y: S.y + R * Math.sin(th) };
    let by = P.y - Math.sqrt(LB * LB - Math.pow(P.x - 790, 2));
    const fi = Math.asin((by - O.y) / L), B = { x: O.x + L * Math.cos(fi), y: O.y + L * Math.sin(fi) };
    const psi = Math.atan2(B.x - P.x, P.y - B.y), sol = 2 * th - psi;
    el('rbiga').setAttribute('transform', `rotate(${((fi * 180) / Math.PI).toFixed(2)} ${O.x} ${O.y})`);
    ['rbiela', 'rbiela2', 'rbiela3'].forEach((id) => { const l = el(id); l.setAttribute('x1', B.x.toFixed(1)); l.setAttribute('y1', B.y.toFixed(1)); l.setAttribute('x2', P.x.toFixed(1)); l.setAttribute('y2', P.y.toFixed(1)); });
    el('planeta').setAttribute('transform', `translate(${P.x.toFixed(1)} ${P.y.toFixed(1)}) rotate(${((psi * 180) / Math.PI + 12.86).toFixed(2)})`);
    el('sol').setAttribute('transform', `rotate(${((sol * 180) / Math.PI).toFixed(2)} ${S.x} ${S.y})`);
    el('volant').setAttribute('transform', `rotate(${((sol * 180) / Math.PI).toFixed(2)} ${S.x} ${S.y})`);
    const yp = 426 - L * Math.sin(fi) + (170 - 170);
    el('rpiston').setAttribute('transform', `translate(0 ${yp.toFixed(1)})`);
    const puja = p < 0.5;
    el('cam-d').setAttribute('height', Math.max(0, yp - 8 - 322).toFixed(1)); el('cam-d').setAttribute('fill', puja ? '#eef4f6' : '#f9c9a0');
    el('cam-b').setAttribute('y', (yp + 8).toFixed(1)); el('cam-b').setAttribute('height', Math.max(0, 530 - yp - 8).toFixed(1)); el('cam-b').setAttribute('fill', puja ? '#f9c9a0' : '#eef4f6');
    el('fl-d').setAttribute('opacity', puja ? 0 : 1); el('fl-b').setAttribute('opacity', puja ? 1 : 0);
    const c = Math.cos(t * 5), ob = 52;
    el('reg-1').setAttribute('cx', (1040 - ob * c).toFixed(1)); el('reg-2').setAttribute('cx', (1040 + ob * c).toFixed(1));
    el('reg-a').setAttribute('x2', (1040 - ob * c).toFixed(1)); el('reg-b').setAttribute('x2', (1040 + ob * c).toFixed(1));
    const ym = 424 - Math.abs(ob * c) * 0.42;
    el('reg-m').setAttribute('y', ym.toFixed(1));
    el('tirant').setAttribute('d', `M1040 ${(ym + 11).toFixed(1)}L520 264L110 296`);
    el('papallona').setAttribute('r', (4.5 + 3 * (1 - Math.abs(c))).toFixed(1));
  }

  RI.capitol({
    id: 'vapor', titol: 'El vapor', llegenda: true,
    escenes: [
      {
        id: 'newcomen', nom: 'Newcomen', any: '1712', qui: 'Thomas Newcomen · Anglaterra', durada: 11,
        model: 'Màquina atmosfèrica de Newcomen · reconstrucció didàctica',
        pregunta: 'Com treus l’aigua d’una mina inundada?',
        intro: 'Les mines de carbó s’omplien d’aigua. Newcomen va construir la primera màquina de vapor útil: una bomba gegant que funcionava <b>fent el buit</b> dins d’un cilindre.',
        svg: () => motor(false), anima: animaMotor(false), innova: [1, 2],
        fases: [
          { fins: 0.34, focus: ['caldera', 'cilindre', 'piston'], nom: 'El vapor omple el cilindre', text: 'S’obre la vàlvula. El vapor de la caldera entra al cilindre mentre el pes de la vareta de la bomba fa pujar el pistó.' },
          { fins: 0.47, focus: ['diposit', 'cilindre'], nom: 'Un raig d’aigua freda', text: 'Es tanca el vapor i s’injecta aigua freda <b>dins del cilindre</b>. El vapor es refreda de cop i es torna aigua: ocupa molt menys espai.' },
          { fins: 0.84, focus: ['piston', 'balanci', 'bombamina'], nom: 'El buit: l’aire empeny el pistó', text: 'Sota el pistó queda gairebé el buit. La pressió de l’aire de fora l’empeny cap avall, el balancí bascula i la vareta puja l’aigua de la mina.' },
          { fins: 1, focus: ['desguas', 'caldera', 'cilindre'], nom: 'Tornar a escalfar-ho tot', text: 'Surt l’aigua condensada. El cilindre ha quedat fred i el vapor nou l’ha de tornar a escalfar: <b>a cada cicle es llença calor</b>, és a dir, carbó.' }
        ],
        parts: {
          caldera: { nom: 'Caldera', text: 'Un dipòsit de coure amb aigua sobre el foc. L’aigua bull i produeix vapor a poca pressió.' },
          cilindre: { nom: 'Cilindre', text: 'Tub vertical obert per dalt. A dins s’hi fa entrar vapor i després es refreda. És on es perd la calor.' },
          piston: { nom: 'Pistó', text: 'Disc que puja i baixa dins del cilindre. Penja del balancí amb una cadena.' },
          balanci: { nom: 'Balancí', text: 'Gran biga de fusta que bascula com un gronxador: quan baixa el pistó, puja la vareta de la bomba.' },
          diposit: { nom: 'Dipòsit d’aigua freda', text: 'Alimenta el raig que refreda el vapor dins del cilindre.' },
          desguas: { nom: 'Desguàs', text: 'Per aquí surt l’aigua que s’ha format en condensar-se el vapor.' },
          bombamina: { nom: 'Bomba de la mina', text: 'La vareta mou una bomba al fons del pou i eleva l’aigua fins a la superfície.' }
        },
        etiquetes: [['caldera', 150, 470, 240, 470], ['cilindre', 465, 380, 388, 360], ['piston', 200, 250, 284, 296], ['balanci', 470, 60, 500, 100], ['diposit', 190, 118, 150, 150, 'Aigua freda'], ['desguas', 130, 420, 176, 430], ['bombamina', 950, 500, 868, 560]],
        explotada: {
          img: 'img/exp-newcomen.webp',
          model: 'Làmina tècnica en vista explotada · Màquina atmosfèrica de Newcomen (1712)',
          guies: '<path class="sil" d="M510 580V245Q510 185 615 185Q720 185 720 245V580"/><path d="M600 220V585M375 445L575 540M795 235L955 270M855 150H890"/><circle cx="615" cy="195" r="4.5"/><circle cx="600" cy="355" r="4.5"/><circle cx="575" cy="540" r="4.5"/><circle cx="890" cy="150" r="4.5"/>',
          zones: [['caldera', 320, 490, 145, 195], ['balanci', 575, 165, 290, 85], ['piston', 600, 310, 75, 48], ['cilindre', 615, 480, 85, 110], ['desguas', 675, 530, 55, 42], ['diposit', 980, 265, 110, 95], ['bombamina', 885, 555, 65, 160]],
          etiquetes: [['balanci', 575, 82, 575, 155], ['caldera', 145, 355, 285, 425], ['piston', 465, 295, 585, 295], ['cilindre', 465, 485, 595, 480], ['desguas', 725, 625, 670, 495], ['diposit', 1035, 145, 985, 255, 'Aigua freda'], ['bombamina', 1020, 560, 885, 555]]
        },
        real: {
          img: 'img/real-newcomen.webp',
          titol: 'Rèplica de la màquina de Newcomen en funcionament',
          museu: 'Black Country Living Museum · Dudley (Regne Unit)',
          lic: 'Foto: Chris Allen · Wikimedia Commons · CC BY-SA 2.0',
          etiquetes: [['balanci', 37, 36, 'Balancí'], ['bombamina', 26, 62, 'Bomba de la mina'], ['caldera', 71, 18, 'Xemeneia de la caldera']]
        },
        clau: 'No és el vapor qui empeny: és l’aire. El vapor només serveix per fer el buit.',
        batx: { titol: 'Una màquina malgastadora, però útil durant dècades', text: 'El rendiment era molt baix i només sortia a compte on el carbó era barat: a la boca de la mina. Tot i això se’n van construir centenars durant el segle XVIII. Una tecnologia imperfecta es pot difondre si resol un problema urgent.', font: 'https://blog.sciencemuseum.org.uk/a-new-age/', fontNom: 'Science Museum · A new age' }
      },
      {
        id: 'watt', nom: 'El condensador de Watt', any: '1769', qui: 'James Watt · Escòcia', durada: 10,
        model: 'Màquina de Watt d’efecte simple amb condensador separat · reconstrucció didàctica',
        pregunta: 'I si el cilindre no s’hagués de refredar mai?',
        intro: 'Watt reparava una maqueta de Newcomen i va veure el problema: es refredava i s’escalfava el mateix cilindre. La solució: <b>refredar el vapor en un altre lloc</b>.',
        svg: () => motor(true), anima: animaMotor(true), innova: [0],
        fases: [
          { fins: 0.5, focus: ['caldera', 'tub', 'cilindre', 'condensador', 'piston'], nom: 'Vapor a dalt, buit a baix', text: 'El vapor entra per sobre del pistó. El que hi havia a sota s’escapa cap al <b>condensador</b>, que és fred: allà es torna aigua i fa el buit. El pistó baixa amb força.' },
          { fins: 0.55, focus: ['equilibri', 'cilindre'], nom: 'Canvi de vàlvules', text: 'Es tanquen l’entrada de vapor i la sortida al condensador. S’obre la vàlvula que comunica la part de dalt i la de baix del cilindre.' },
          { fins: 1, focus: ['equilibri', 'piston', 'balanci', 'bomba', 'bombamina'], nom: 'El pistó torna a pujar', text: 'Amb la mateixa pressió a dalt i a baix, el pes de la vareta fa pujar el pistó. El vapor passa a sota, preparat per al cicle següent. El cilindre <b>no s’ha refredat</b>.' }
        ],
        parts: {
          caldera: { nom: 'Caldera', text: 'Ara és a part del cilindre. Produeix el vapor que empeny el pistó.' },
          tub: { nom: 'Tub de vapor', text: 'Porta el vapor de la caldera a la part superior del cilindre.' },
          camisa: { nom: 'Camisa de vapor', text: 'Una segona paret plena de vapor envolta el cilindre i el manté sempre calent.' },
          cilindre: { nom: 'Cilindre tancat', text: 'Està tapat per dalt: ja no hi entra aire fred. El pistó l’empeny el vapor, no l’atmosfera.' },
          piston: { nom: 'Pistó', text: 'Baixa quan té vapor a sobre i buit a sota.' },
          equilibri: { nom: 'Tub d’equilibri', text: 'Comunica les dues bandes del pistó perquè pugui tornar a pujar.' },
          condensador: { nom: 'Condensador separat', text: 'La gran idea de Watt: un recipient submergit en aigua freda on el vapor usat es converteix en aigua. El fred es queda aquí, lluny del cilindre.' },
          bomba: { nom: 'Bomba d’aire', text: 'Treu l’aigua i l’aire del condensador perquè s’hi mantingui el buit. La mou el mateix balancí.' },
          balanci: { nom: 'Balancí', text: 'Transmet el moviment del pistó a la bomba de la mina.' },
          bombamina: { nom: 'Bomba de la mina', text: 'Fa la mateixa feina que amb Newcomen, però gastant molt menys carbó.' }
        },
        etiquetes: [['caldera', 170, 622, 180, 520], ['tub', 130, 230, 180, 300], ['camisa', 200, 330, 260, 330], ['cilindre', 330, 180, 330, 214, 'Cilindre tancat'], ['equilibri', 500, 320, 424, 340], ['condensador', 392, 622, 458, 520], ['bomba', 576, 622, 512, 530], ['balanci', 470, 60, 500, 100], ['bombamina', 950, 500, 868, 560]],
        explotada: {
          img: 'img/exp-watt.webp',
          model: 'Làmina tècnica en vista explotada · Màquina de Watt amb condensador separat (1769)',
          guies: '<path class="sil" d="M770 205L800 135L830 205"/><path d="M525 435H580M695 435H645M600 135V280M260 220L535 265M968 382V450M1075 340V405M965 595V680"/><circle cx="600" cy="280" r="4.5"/><circle cx="580" cy="435" r="4.5"/><circle cx="645" cy="435" r="4.5"/><circle cx="965" cy="680" r="4.5"/>',
          zones: [['caldera', 225, 465, 155, 235], ['camisa', 468, 435, 65, 105], ['cilindre', 605, 425, 75, 175], ['equilibri', 755, 455, 85, 95], ['condensador', 965, 505, 75, 105], ['bomba', 1075, 480, 55, 115], ['balanci', 790, 170, 290, 85]],
          etiquetes: [['caldera', 130, 170, 225, 345], ['balanci', 540, 72, 675, 108], ['cilindre', 455, 200, 585, 340, 'Cilindre tancat'], ['camisa', 360, 440, 482, 440], ['equilibri', 725, 345, 725, 420], ['condensador', 805, 675, 945, 515], ['bomba', 1065, 305, 1065, 445]]
        },
        real: {
          img: 'img/real-watt.webp',
          titol: 'El primer condensador separat de James Watt (c. 1765)',
          museu: 'Peça original conservada al Regne Unit',
          lic: 'Foto: Mirko Junge · Wikimedia Commons · CC BY 3.0',
          etiquetes: [['condensador', 50, 45, 'Condensador separat']]
        },
        clau: 'La mateixa feina amb fins a un 75 % menys de carbó: el fred i la calor ja no es barallen dins del mateix cilindre.',
        batx: { titol: 'De la idea (1765) a la fàbrica (1776)', text: 'Watt té la idea el 1765, la patenta el 1769 i no ven màquines fins al 1776, associat amb l’empresari Matthew Boulton. Calien capital, obrers hàbils i cilindres ben foradats (Wilkinson). Invent i innovació no són el mateix moment.', font: 'https://blog.sciencemuseum.org.uk/james-watt-and-the-separate-condenser/', fontNom: 'Science Museum · Watt i el condensador separat' }
      },
      {
        id: 'rotativa', nom: 'Del vaivé al gir', any: '1781 – 1788', qui: 'Boulton & Watt · Birmingham', durada: 6,
        model: 'Màquina rotativa de Watt amb engranatge de sol i planeta · reconstrucció didàctica',
        pregunta: 'Com fas girar una fàbrica amb un pistó que només puja i baixa?',
        intro: 'Una bomba només necessita pujar i baixar. Però un teler o una filadora necessiten <b>un eix que giri</b>. Watt va afegir quatre invents a la seva màquina.',
        svg: rotativa, anima: animaRot, innova: [0, 1],
        fases: [
          { fins: 0.5, focus: ['distribucio', 'cilindre', 'balanci', 'biela', 'planeta', 'sol'], nom: 'El vapor empeny per sota', text: 'La distribució envia vapor sota el pistó i el fa pujar. L’altre extrem del balancí baixa i la biela arrossega l’engranatge «planeta».' },
          { fins: 1, focus: ['distribucio', 'cilindre', 'planeta', 'sol', 'volant', 'regulador'], nom: 'El vapor empeny per dalt', text: 'Ara el vapor entra per sobre: el pistó fa força <b>en els dos sentits</b> (doble efecte). El planeta acaba la volta al voltant del «sol» i el volant no para de girar.' }
        ],
        parts: {
          cilindre: { nom: 'Cilindre de doble efecte', text: 'El vapor empeny el pistó cap amunt i cap avall. La màquina fa el doble de feina amb el mateix cilindre.' },
          piston: { nom: 'Pistó', text: 'Va unit al balancí amb una tija rígida: ha d’empènyer i estirar.' },
          distribucio: { nom: 'Distribució', text: 'Joc de vàlvules que envia el vapor ara a dalt, ara a baix, i deixa sortir el vapor usat cap al condensador.' },
          balanci: { nom: 'Balancí', text: 'Transmet el moviment del pistó a la biela.' },
          biela: { nom: 'Biela', text: 'Barra que penja del balancí. Porta fixat l’engranatge planeta.' },
          planeta: { nom: 'Engranatge planeta', text: 'No gira sobre si mateix: dona voltes al voltant del sol, empès per la biela.' },
          sol: { nom: 'Engranatge sol', text: 'Va fixat a l’eix. El planeta l’obliga a girar: dues voltes per cada anada i tornada del pistó.' },
          volant: { nom: 'Volant d’inèrcia', text: 'Roda molt pesant que guarda moviment i fa que el gir sigui regular, sense estrebades.' },
          regulador: { nom: 'Regulador de boles', text: 'Si la màquina s’accelera, les boles s’obren i tanquen el pas de vapor; si s’alenteix, es tanquen i l’obren. Controla la velocitat tot sol.' },
          corretja: { nom: 'Corretja i eix', text: 'Porten el gir fins a les màquines de la fàbrica.' }
        },
        etiquetes: [['cilindre', 330, 250, 300, 318, 'Cilindre de doble efecte'], ['distribucio', 80, 440, 142, 430], ['balanci', 420, 110, 440, 152], ['biela', 880, 250, 796, 280], ['planeta', 886, 354, 790, 380, 'Planeta', 'planeta@0,0'], ['sol', 650, 520, 770, 480, 'Sol'], ['volant', 690, 680, 720, 620, 'Volant d’inèrcia'], ['regulador', 1080, 460, 1046, 420], ['corretja', 1000, 220, 990, 190]],
        explotada: {
          img: 'img/exp-rotativa.webp',
          model: 'Làmina tècnica en vista explotada · Màquina rotativa de Boulton & Watt (1788)',
          guies: '<path d="M555 415L845 555M910 345L855 540M445 555V610M295 520L385 485"/><circle cx="625" cy="448" r="4.5"/><circle cx="845" cy="555" r="4.5"/><circle cx="445" cy="610" r="4.5"/>',
          zones: [['distribucio', 245, 545, 125, 115], ['cilindre', 445, 475, 95, 125], ['balanci', 595, 145, 195, 75], ['biela', 765, 325, 45, 140], ['sol', 615, 455, 75, 75], ['planeta', 685, 515, 75, 75], ['volant', 885, 545, 145, 195], ['regulador', 910, 240, 85, 105]],
          etiquetes: [['distribucio', 145, 415, 240, 535], ['cilindre', 295, 325, 470, 455, 'Cilindre de doble efecte'], ['balanci', 395, 105, 550, 125], ['biela', 725, 210, 765, 295], ['sol', 540, 345, 610, 445, 'Sol'], ['planeta', 545, 650, 690, 455, 'Planeta'], ['regulador', 1040, 165, 915, 235], ['volant', 1055, 690, 955, 565, 'Volant d’inèrcia']]
        },
        real: {
          img: 'img/real-rotativa.webp',
          titol: 'Engranatge de sol i planeta d’una màquina de Boulton & Watt',
          museu: 'Science Museum · Londres',
          lic: 'Foto: Geni · Wikimedia Commons · CC BY-SA 4.0',
          etiquetes: [['biela', 42, 28, 'Biela'], ['sol', 52, 72, 'Sol i planeta']]
        },
        clau: 'Quan el vapor fa girar un eix, la fàbrica ja no ha d’estar al costat d’un riu.',
        batx: { titol: 'Per què «sol i planeta» i no una simple manovella?', text: 'La manovella estava protegida per una patent d’un competidor (James Pickard, 1780). Boulton & Watt la van esquivar amb aquest engranatge fins que la patent va caducar. Les patents condicionen el camí de la tècnica.', font: 'https://collection.sciencemuseumgroup.org.uk/objects/co50948/rotative-steam-engine-by-boulton-and-watt-1788', fontNom: 'Science Museum Group · Màquina rotativa de 1788' }
      }
    ],
    repte: [
      { q: 'En la màquina de Newcomen, què empeny el pistó cap avall?', o: ['La força del vapor calent', 'La pressió de l’aire de fora', 'El pes del balancí'], c: 1, e: 'El vapor es condensa, queda el buit i és l’atmosfera qui empeny el pistó.' },
      { q: 'Per què gastava tant carbó la màquina de Newcomen?', o: ['Perquè la caldera era massa petita', 'Perquè el cilindre es refredava i s’havia de reescalfar a cada cicle', 'Perquè la mina era molt fonda'], c: 1, e: 'L’aigua freda s’injectava dins del mateix cilindre i cada vegada calia tornar-lo a escalfar.' },
      { q: 'Quina és la gran idea de Watt?', o: ['Condensar el vapor en un recipient separat', 'Fer la caldera més gran', 'Canviar el carbó per llenya'], c: 0, e: 'Amb el condensador separat, el cilindre es manté sempre calent i s’estalvia molt combustible.' },
      { q: 'Per a què serveix l’engranatge de sol i planeta?', o: ['Per refredar el vapor', 'Per convertir el vaivé del pistó en gir', 'Per pujar l’aigua de la mina'], c: 1, e: 'Transforma el moviment d’anada i tornada en la rotació d’un eix que pot moure màquines.' },
      { q: 'Què fa el volant d’inèrcia?', o: ['Produeix vapor', 'Regula el pas de l’aigua', 'Fa que el gir sigui regular'], c: 2, e: 'És una roda pesant que acumula moviment i suavitza les estrebades del pistó.' },
      { tipus: 'toca', esc: 'watt', part: 'condensador', p: 0.25, q: 'Toca la peça que va inventar Watt per estalviar carbó.', e: 'El condensador separat: el vapor es refreda allà i el cilindre es manté sempre calent.' },
      { tipus: 'ordena', esc: 'newcomen', q: 'Ordena el cicle de la màquina de Newcomen.', e: 'Vapor → aigua freda → buit → tornar a escalfar: a cada volta es llença calor.' },
      { q: 'Què va permetre la màquina rotativa a les fàbriques?', o: ['Instal·lar-se lluny dels rius', 'Funcionar sense treballadors', 'No necessitar carbó'], c: 0, e: 'Abans depenien de la roda hidràulica; amb el vapor es podien construir a les ciutats i prop del carbó.' }
    ]
  });
})();

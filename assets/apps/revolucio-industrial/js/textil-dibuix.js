// SPDX-License-Identifier: AGPL-3.0-or-later
/* La Revolució Industrial — El cotó: talls tècnics animats en 2D.
   Substitueix el renderitzador oblic anterior per seccions i vistes netes
   amb textures reals (RI.MATS) perquè s'hi vegi amb claredat cada mecanisme
   i la innovació històrica que aporta. */
(function () {
  'use strict';
  const RI = window.RI;
  const INK = '#2e221a';
  const f1 = (n) => Math.round(n * 10) / 10;
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const S = (id, p) => RI.TEXTIL_ESTATS[id](p);
  const { caixa, cami, tub, brida, reblons, rodaR, engranatgeR, ombra, cartell, fletxa } = RI;

  const EXTRA_DEFS = `<defs>
    <linearGradient id="tx-cotobob" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9bfa6"/><stop offset=".35" stop-color="#fffdf5"/><stop offset=".75" stop-color="#ebe1c8"/><stop offset="1" stop-color="#b4a78b"/></linearGradient>
    <linearGradient id="tx-cotometxa" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b4c2ad"/><stop offset=".4" stop-color="#eef5e6"/><stop offset="1" stop-color="#9fb198"/></linearGradient>
    <linearGradient id="tx-tela" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7efe0"/><stop offset="1" stop-color="#dfd2b4"/></linearGradient>
    <linearGradient id="tx-peça-fons" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf7"/><stop offset="1" stop-color="#f5ecd8"/></linearGradient>
  </defs>`;

  function taller(floorY = 562) {
    return `${RI.fons(0)}<rect x="-260" y="${floorY}" width="1720" height="${740 - floorY}" fill="#e6dac0" opacity=".78"/><line x1="-260" y1="${floorY}" x2="1460" y2="${floorY}" stroke="#b9a988" stroke-width="2"/>`;
  }

  function badge(x, y, text, fons = '#2e221a', color = '#fff', extra = '') {
    const w = Math.max(54, text.length * 7.8 + 20);
    return `<g ${extra}><rect x="${f1(x - w / 2)}" y="${f1(y - 13)}" width="${f1(w)}" height="26" rx="13" fill="${fons}" stroke="#fffcf5" stroke-width="1.5"/><text x="${f1(x)}" y="${f1(y + 4.5)}" text-anchor="middle" font-size="13" font-weight="700" fill="${color}">${text}</text></g>`;
  }

  /* Corretja tangent exterior entre dues politges (centres x1,y1,r1 i x2,y2,r2). */
  function tangents(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
    const q = clamp((r1 - r2) / d, -0.99, 0.99), h = Math.sqrt(1 - q * q);
    const ux = dx / d, uy = dy / d;
    return [-1, 1].map((s) => {
      const nx = q * ux - s * h * uy, ny = q * uy + s * h * ux;
      return [x1 + r1 * nx, y1 + r1 * ny, x2 + r2 * nx, y2 + r2 * ny];
    });
  }
  function corretjaHTML(x1, y1, r1, x2, y2, r2, id, part) {
    const [[ax1, ay1, ax2, ay2], [bx1, by1, bx2, by2]] = tangents(x1, y1, r1, x2, y2, r2);
    const d1 = `M${f1(ax1)} ${f1(ay1)}L${f1(ax2)} ${f1(ay2)}`;
    const d2 = `M${f1(bx2)} ${f1(by2)}L${f1(bx1)} ${f1(by1)}`;
    return `<g data-part="${part}">
      <path d="${d1}" stroke="${INK}" stroke-width="6.5" stroke-linecap="round" fill="none"/>
      <path d="${d1}" stroke="#7a4e2c" stroke-width="4.2" stroke-linecap="round" fill="none"/>
      <path id="${id}-a" d="${d1}" stroke="#e7cca0" stroke-width="2" stroke-dasharray="7 13" stroke-linecap="round" fill="none"/>
      <path d="${d2}" stroke="${INK}" stroke-width="6.5" stroke-linecap="round" fill="none"/>
      <path d="${d2}" stroke="#7a4e2c" stroke-width="4.2" stroke-linecap="round" fill="none"/>
      <path id="${id}-b" d="${d2}" stroke="#e7cca0" stroke-width="2" stroke-dasharray="7 13" stroke-linecap="round" fill="none"/>
    </g>`;
  }

  /* Corró d'estiratge en secció lateral amb línies de gir visibles i engranatge opcional. */
  function corroHTML(cx, cy, r, id, part, opts = {}) {
    const tex = opts.cuir ? 'fustaf' : 'ferro';
    return `<g data-part="${part}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#tx-${tex})" stroke="${INK}" stroke-width="1.8"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sh-bola)" opacity=".55"/>
      <g id="${id}">
        <line x1="${cx - r + 3}" y1="${cy}" x2="${cx + r - 3}" y2="${cy}" stroke="#fff" stroke-width="2.2" stroke-opacity=".75" stroke-linecap="round"/>
        <line x1="${cx}" y1="${cy - r + 3}" x2="${cx}" y2="${cy + r - 3}" stroke="${INK}" stroke-width="2" stroke-opacity=".55" stroke-linecap="round"/>
        <circle cx="${cx}" cy="${cy - r * 0.52}" r="2.6" fill="#d97706"/>
      </g>
      <circle cx="${cx}" cy="${cy}" r="5.5" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.2"/>
    </g>`;
  }

  /* Mà senzilla i neta de taller (origen al canell o palmell). */
  function maHTML(id, part, flip = false) {
    const sx = flip ? -1 : 1;
    return `<g id="${id}" data-part="${part}"><g transform="scale(${sx} 1)">
      <path d="M-24 -7C-10 -12 8 -10 17 -3L24 3C26 6 22 10 17 8L9 4L14 10C15 13 11 16 7 13L-2 8C-9 11 -18 10 -24 5Z" fill="#e6bc98" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M-8 -4L10 -1" stroke="#c8946d" stroke-width="1.4" stroke-linecap="round"/>
    </g></g>`;
  }

  /* Bobina vertical vista de costat. */
  function bobinaHTML(cx, cy, w, h, metxa, part) {
    const bw = w + 12, fill = metxa ? 'url(#tx-cotometxa)' : 'url(#tx-cotobob)';
    return `<g data-part="${part}">
      ${caixa(cx - w / 2, cy - h / 2, w, h, 'fustac', 'cil', { vora: 0.01 })}
      <rect x="${f1(cx - w / 2)}" y="${f1(cy - h / 2)}" width="${w}" height="${h}" rx="3" fill="${fill}" stroke="${INK}" stroke-width="1.4"/>
      <path d="M${f1(cx - w / 2 + 3)} ${f1(cy - h * 0.25)}H${f1(cx + w / 2 - 3)}M${f1(cx - w / 2 + 3)} ${cy}H${f1(cx + w / 2 - 3)}M${f1(cx - w / 2 + 3)} ${f1(cy + h * 0.25)}H${f1(cx + w / 2 - 3)}" stroke="#8d8167" stroke-width="1" opacity=".55"/>
      ${caixa(cx - bw / 2, cy - h / 2 - 7, bw, 7, 'fustaf', 'tub', { rx: 2 })}
      ${caixa(cx - bw / 2, cy + h / 2, bw, 7, 'fustaf', 'tub', { rx: 2 })}
      <circle cx="${cx}" cy="${f1(cy - h / 2 - 11)}" r="4" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.1"/>
    </g>`;
  }

  /* Con de fil (cop) sobre un fus: es dibuixa el contorn i les línies espirals dinàmiques dins d'un grup. */
  function copPath(cx, baseY, h, r) {
    const tipY = baseY - h, midY = baseY - h * 0.24;
    return `M${f1(cx - r * 0.55)} ${baseY}Q${f1(cx - r * 1.05)} ${f1(midY)} ${f1(cx - 2.5)} ${tipY}H${f1(cx + 2.5)}Q${f1(cx + r * 1.05)} ${f1(midY)} ${f1(cx + r * 0.55)} ${baseY}Z`;
  }
  function copSpiral(cx, baseY, h, r, ang) {
    let s = '';
    for (let i = 0; i < 6; i++) {
      const f = 0.14 + i * 0.13, y = baseY - h * f;
      const rw = r * (f < 0.24 ? lerp(0.55, 1, f / 0.24) : lerp(1, 0.12, (f - 0.24) / 0.76));
      const x = cx + Math.sin(ang + i * 1.1) * rw * 0.82;
      s += `<path d="M${f1(cx - rw * 0.85)} ${f1(y + 2)}Q${f1(x)} ${f1(y - 3)} ${f1(cx + rw * 0.85)} ${f1(y + 1)}" fill="none" stroke="#a68a4d" stroke-width="1.1" opacity=".7"/>`;
    }
    return s;
  }

  /* Metxa de cotó cardat (amb fibres individuals de longitud constant que llisquen). */
  function fibresHTML(x1, y1, x2, y2, w1, w2, q) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    const p = [
      [x1 + nx * w1 * 0.5, y1 + ny * w1 * 0.5],
      [x2 + nx * w2 * 0.5, y2 + ny * w2 * 0.5],
      [x2 - nx * w2 * 0.5, y2 - ny * w2 * 0.5],
      [x1 - nx * w1 * 0.5, y1 - ny * w1 * 0.5]
    ].map((pt) => pt.map(f1).join(',')).join(' ');
    let s = `<polygon points="${p}" fill="#e6efe0" stroke="#6d8768" stroke-width="1.6" stroke-linejoin="round"/>`;
    const fl = Math.min(28, len * 0.45);
    for (let i = 0; i < 9; i++) {
      const f = ((i / 9 + q) % 1 + 1) % 1;
      const d = Math.max(0, len - fl) * f;
      const wHere = lerp(w1, w2, d / len) * 0.34;
      const off = Math.sin(i * 2.1) * wHere;
      const sx = x1 + ux * d + nx * off, sy = y1 + uy * d + ny * off;
      s += `<line x1="${f1(sx)}" y1="${f1(sy)}" x2="${f1(sx + ux * fl)}" y2="${f1(sy + uy * fl)}" stroke="${i === 3 ? '#2c6f68' : '#8ea688'}" stroke-width="${i === 3 ? 2.4 : 1.2}" stroke-linecap="round"/>`;
    }
    return s;
  }

  /* Fil torçut amb ona helicoïdal visible. */
  function filTorcutHTML(x1, y1, x2, y2, ang, twist = 1, thick = 3.2) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    const steps = Math.max(18, Math.round(len / 9));
    let wave = '';
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, px = lerp(x1, x2, t), py = lerp(y1, y2, t);
      const off = Math.sin(i * 0.85 - ang * 2.4) * 2.3 * twist;
      wave += (i ? 'L' : 'M') + `${f1(px + nx * off)} ${f1(py + ny * off)}`;
    }
    return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="#8c6724" stroke-width="${thick + 2.2}" stroke-linecap="round"/>
      <line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="#f6d88a" stroke-width="${thick}" stroke-linecap="round"/>
      <path d="${wave}" fill="none" stroke="#855e18" stroke-width="1.2" opacity=".88"/>`;
  }

  /* ==================== 1. LA RODA DE FILAR ==================== */
  function svgRoda() {
    let s = EXTRA_DEFS + taller(558);
    s += ombra(595, 565, 420, 9);

    // Banc i suports (bastidor)
    s += `<g data-part="bastidor">
      ${caixa(238, 468, 22, 90, 'fustaf', 'cil')}${caixa(892, 468, 22, 90, 'fustaf', 'cil')}
      ${caixa(204, 464, 26, 94, 'fusta-v', 'cil')}${caixa(922, 464, 26, 94, 'fusta-v', 'cil')}
      ${caixa(182, 444, 792, 26, 'fusta', 'tub', { rx: 3 })}
      ${reblons(216, 457, 216, 457, 1, 3, '#6b4423')}${reblons(935, 457, 935, 457, 1, 3, '#6b4423')}
      ${caixa(266, 286, 20, 160, 'fusta-v', 'cil')}${caixa(368, 286, 20, 160, 'fusta-v', 'cil')}
      ${caixa(816, 272, 24, 174, 'fusta-v', 'cil')}
      ${cami('M786 444L816 382V444Z', 'fustaf', 'pla')}
    </g>`;

    // Corretja de transmissió (roda r=148 a (828,288) -> politja r=18 a (348,308))
    s += corretjaHTML(828, 288, 148, 348, 308, 18, 'rd-belt', 'corretja');
    s += badge(578, 174, '1 volta roda → ~9 voltes fus', '#6f4e28', '#fff');

    // Roda gran amb manovella
    s += `<g data-part="roda">
      <g id="rd-wheel">${rodaR(828, 288, 156, { raigs: 10, tex: 'fusta', gruix: 17, raig: 8, boto: 24, pern: 'llauto' })}
        <line x1="828" y1="288" x2="870" y2="288" stroke="#3c4349" stroke-width="7" stroke-linecap="round"/>
        <circle cx="870" cy="288" r="9" fill="url(#tx-fustaf)" stroke="${INK}" stroke-width="1.6"/>
      </g>
      <path d="M998 232A180 180 0 0 1 1006 336" fill="none" stroke="#b45309" stroke-width="3" stroke-dasharray="6 5" marker-end="url(#m-fl)"/>
      <text x="1028" y="286" class="tx-p" fill="#92400e">gir a mà</text>
    </g>`;

    // Fus horitzontal, politja petita i con de fil que creix
    s += `<g data-part="fus">
      ${tub('M174 308H398', 7, 'plom', { cap: 'round' })}
      <polygon points="154,308 176,304 176,312" fill="#bfc8cf" stroke="${INK}" stroke-width="1.2"/>
      ${caixa(266, 298, 20, 20, 'llauto', 'cil', { rx: 3 })}${caixa(368, 298, 20, 20, 'llauto', 'cil', { rx: 3 })}
      <g id="rd-cop"></g>
      <circle cx="348" cy="308" r="18" fill="url(#tx-llauto)" stroke="${INK}" stroke-width="1.8"/>
      <g id="rd-whorl"><line x1="333" y1="308" x2="363" y2="308" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><circle cx="348" cy="296" r="2.8" fill="#d97706"/></g>
      <circle cx="348" cy="308" r="5" fill="#2e221a"/>
    </g>`;

    // Fibra, fil i mà que estira i canvia d'angle
    s += `<g data-part="fibra">
      <path id="rd-angle-arc" d="M126 320A48 48 0 0 1 142 260" fill="none" stroke="#d97706" stroke-width="2.4" stroke-dasharray="4 4" opacity="0"/>
      <g id="rd-fibre"></g>
      <g id="rd-floc">
        <path d="M-48 -6C-58 -18 -40 -28 -26 -20C-18 -30 4 -26 6 -12C14 -8 10 8 -4 10C-18 14 -42 12 -48 -6Z" fill="#eef4e6" stroke="#7d9678" stroke-width="1.6"/>
        <path d="M-38 -8Q-22 -14 -8 -4M-32 2Q-18 -2 -6 4" stroke="#99b093" stroke-width="1.2" fill="none"/>
      </g>
      ${maHTML('rd-hand', 'fibra')}
    </g>`;

    // Detall explicatiu a la dreta (com es fa un fil)
    s += `<g transform="translate(1035, 385)">
      <rect x="-15" y="-22" width="215" height="156" rx="12" fill="url(#tx-peça-fons)" stroke="#d6cbb5" stroke-width="1.5"/>
      <text x="92" y="2" text-anchor="middle" font-size="13.5" font-weight="800" fill="#6f4e28">Un fil en dos temps</text>
      <g id="rd-detall-pass"></g>
    </g>`;

    // Lupa macro sobre la punta del fus
    s += `<g id="tx-lupa" transform="translate(185, 132)" data-part="fibra">
      <line x1="0" y1="62" x2="-22" y2="176" stroke="#b45309" stroke-width="2" stroke-dasharray="5 5" opacity=".72"/>
      <circle cx="0" cy="0" r="64" fill="#fffdf7" stroke="#8d5d2e" stroke-width="5"/>
      <clipPath id="clip-lupa-roda"><circle cx="0" cy="0" r="60"/></clipPath>
      <g id="tx-lupa-body" clip-path="url(#clip-lupa-roda)"></g>
      <circle cx="0" cy="0" r="60" fill="none" stroke="rgba(46,34,26,.22)" stroke-width="1.5"/>
      <rect x="-58" y="54" width="116" height="22" rx="11" fill="#6f4e28" stroke="#fffdf7" stroke-width="1.5"/>
      <text x="0" y="69" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">Lupa ×8 · Torsió</text>
    </g>`;

    return RI.svg(s);
  }

  function animaRoda() {
    return ({ p, el }) => {
      const s = S('roda', p);
      const deg = (s.angle * 180) / Math.PI;
      const sdeg = (s.spindleAngle * 180) / Math.PI;
      el('rd-wheel').setAttribute('transform', `rotate(${f1(deg)} 828 288)`);
      el('rd-whorl').setAttribute('transform', `rotate(${f1(sdeg)} 348 308)`);
      const beltOff = (-s.angle * 150).toFixed(1);
      el('rd-belt-a').style.strokeDashoffset = beltOff;
      el('rd-belt-b').style.strokeDashoffset = beltOff;

      // Con de fil al fus horitzontal (x=252..330, y=308)
      const r = 10 + 17 * s.wind;
      const copEl = el('rd-cop');
      let cs = `<path d="M330 ${f1(308 - r * 0.55)}Q288 ${f1(308 - r * 1.05)} 248 304V312Q288 ${f1(308 + r * 1.05)} 330 ${f1(308 + r * 0.55)}Z" fill="url(#tx-cotobob)" stroke="${INK}" stroke-width="1.5"/>`;
      for (let i = 0; i < 6; i++) {
        const f = 0.18 + i * 0.13, x = lerp(248, 330, f);
        const rw = r * (f < 0.72 ? lerp(0.18, 1, f / 0.72) : lerp(1, 0.58, (f - 0.72) / 0.28));
        const y = 308 + Math.sin(s.spindleAngle + i * 1.2) * rw * 0.8;
        cs += `<path d="M${f1(x)} ${f1(308 - rw * 0.82)}Q${f1(x + 3)} ${f1(y)} ${f1(x)} ${f1(308 + rw * 0.82)}" fill="none" stroke="#9e8245" stroke-width="1.1" opacity=".7"/>`;
      }
      copEl.innerHTML = cs;

      // Posició de la mà: estira a l'esquerra (p<.57), puja en angle (.57-.72), acosta al con (.72-.97)
      let hx, hy;
      if (p < 0.57) {
        hx = lerp(136, 28, s.draw);
        hy = lerp(332, 392, s.draw);
      } else if (p < 0.72) {
        hx = lerp(28, 128, s.guide);
        hy = lerp(392, 232, s.guide);
      } else {
        hx = lerp(128, 212, s.wind);
        hy = lerp(232, 278, s.wind);
      }
      el('rd-hand').setAttribute('transform', `translate(${f1(hx)} ${f1(hy)})`);
      el('rd-floc').setAttribute('transform', `translate(${f1(hx - 4)} ${f1(hy - 2)})`);
      el('rd-angle-arc').setAttribute('opacity', p >= 0.56 && p < 0.74 ? '1' : '0');

      const endX = lerp(158, 294, s.guide), endY = 308;
      if (p < 0.57) {
        const midX = lerp(hx + 14, endX, 0.55 - 0.35 * s.draw);
        const midY = lerp(hy - 2, endY, 0.55 - 0.35 * s.draw);
        el('rd-fibre').innerHTML =
          fibresHTML(hx + 14, hy - 2, midX, midY, 13, lerp(11, 4.5, s.draw), s.draw * 0.6) +
          filTorcutHTML(midX, midY, endX, endY, s.spindleAngle * 0.25, Math.max(0.25, s.draw), 3.4);
      } else {
        el('rd-fibre').innerHTML = filTorcutHTML(hx + 14, hy - 2, endX, endY, s.spindleAngle * 0.25, 1, 3.6);
      }

      // Quadre resum d'estiratge vs recollida
      const winding = p >= 0.68;
      el('rd-detall-pass').innerHTML = `
        <rect x="0" y="18" width="185" height="44" rx="8" fill="${!winding ? '#edf4e7' : '#f7f1e1'}" stroke="${!winding ? '#5b8c35' : '#d6cbb5'}" stroke-width="1.5"/>
        <text x="92" y="37" text-anchor="middle" font-size="13" font-weight="800" fill="${!winding ? '#355c1c' : '#787166'}">1 · Estirar i tòrcer</text>
        <text x="92" y="54" text-anchor="middle" font-size="11.5" fill="#4a4139">El fil rellisca per la punta</text>
        <rect x="0" y="72" width="185" height="44" rx="8" fill="${winding ? '#fff2cc' : '#f7f1e1'}" stroke="${winding ? '#b45309' : '#d6cbb5'}" stroke-width="1.5"/>
        <text x="92" y="91" text-anchor="middle" font-size="13" font-weight="800" fill="${winding ? '#92400e' : '#787166'}">2 · Canviar angle i recollir</text>
        <text x="92" y="108" text-anchor="middle" font-size="11.5" fill="#4a4139">S’enrotlla al con del fus</text>`;

      const lupaEl = el('tx-lupa-body');
      if (lupaEl) {
        const tw = clamp(s.draw * 0.9 + (p >= 0.57 ? 0.35 : 0), 0.12, 1.15);
        const w1 = lerp(28, 12, s.draw);
        lupaEl.innerHTML =
          `<rect x="-64" y="-64" width="128" height="128" fill="#f7f0df"/>` +
          fibresHTML(-56, 0, 8, 0, w1, lerp(11, 5.5, s.draw), s.draw * 0.8) +
          filTorcutHTML(4, 0, 56, 0, s.spindleAngle * 0.35, tw, lerp(6.8, 3.8, s.draw)) +
          `<text x="0" y="-36" text-anchor="middle" font-size="10.5" font-weight="800" fill="#6f4e28">${winding ? 'Enrotllant fil torçut' : 'Fibres llisquen i torcen'}</text>`;
      }
    };
  }

  /* ==================== HELPERS 3D AXONOMÈTRICS 3/4 PER ALS TELERS ==================== */
  const TELER_OX = 590, TELER_OY = 464;
  function P3(x, y, z) {
    return [TELER_OX + 0.90 * x - 0.56 * y, TELER_OY + 0.14 * x + 0.36 * y - 0.90 * z];
  }
  const pt3 = (x, y, z) => { const [px, py] = P3(x, y, z); return `${f1(px)},${f1(py)}`; };
  const poly3 = (pts, fill, sw = 1.3, op = 1) =>
    `<polygon points="${pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' ')}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const line3 = (a, b, col, sw = 2, extra = '') => {
    const [x1, y1] = P3(...a), [x2, y2] = P3(...b);
    return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"${extra}/>`;
  };
  const PALS3 = {
    fusta: { top: '#deb47b', front: '#bc854a', side: '#8d5d2e' },
    fustaf: { top: '#b8834d', front: '#946133', side: '#6c431f' },
    ferro: { top: '#8f98a0', front: '#656e75', side: '#464d53' },
    llauto: { top: '#f2d37a', front: '#d4a63a', side: '#9b731c' },
    coto: { top: '#fbf5e6', front: '#e8dec5', side: '#c6b999' }
  };
  function box3(x0, x1, y0, y1, z0, z1, pal = 'fusta', sw = 1.3) {
    const c = PALS3[pal] || PALS3.fusta;
    const p010 = P3(x0, y1, z0), p110 = P3(x1, y1, z0), p111 = P3(x1, y1, z1), p011 = P3(x0, y1, z1);
    const p100 = P3(x1, y0, z0), p101 = P3(x1, y0, z1), p001 = P3(x0, y0, z1);
    return poly3([p100, p110, p111, p101], c.side, sw) +
      poly3([p010, p110, p111, p011], c.front, sw) +
      poly3([p001, p101, p111, p011], c.top, sw);
  }
  function cylX3(x0, x1, cy, cz, r, fillBody, fillEnd, sw = 1.5) {
    // Angles extrems perpendiculars a l'eix X projectat (0.90, 0.14)
    const a0 = Math.atan2(-0.81, 0.4024);
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const a = a0 + (Math.PI * i) / 14;
      pts.push(P3(x1, cy + r * Math.cos(a), cz + r * Math.sin(a)));
    }
    for (let i = 14; i >= 0; i--) {
      const a = a0 + (Math.PI * i) / 14;
      pts.push(P3(x0, cy + r * Math.cos(a), cz + r * Math.sin(a)));
    }
    const endPts = [];
    for (let i = 0; i < 24; i++) {
      const a = (Math.PI * 2 * i) / 24;
      endPts.push(P3(x1, cy + r * Math.cos(a), cz + r * Math.sin(a)));
    }
    return poly3(pts, fillBody, sw) + poly3(endPts, fillEnd, sw);
  }
  function discYZ3(cx, cy, cz, r, dx, fillFace, fillRim, ang = 0, spokes = 0, sw = 1.4, teeth = 0) {
    const steps = teeth ? teeth * 4 : 32;
    const fPts = [], bPts = [];
    for (let i = 0; i < steps; i++) {
      const a = (Math.PI * 2 * i) / steps + ang;
      const rr = teeth ? r + (i % 4 < 2 ? 3.5 : -2) : r;
      const dy = rr * Math.cos(a), dz = rr * Math.sin(a);
      fPts.push(P3(cx + dx * 0.5, cy + dy, cz + dz));
      bPts.push(P3(cx - dx * 0.5, cy + dy, cz + dz));
    }
    let out = '';
    for (let i = 0; i < steps; i++) {
      const j = (i + 1) % steps;
      out += `<polygon points="${f1(bPts[i][0])},${f1(bPts[i][1])} ${f1(bPts[j][0])},${f1(bPts[j][1])} ${f1(fPts[j][0])},${f1(fPts[j][1])} ${f1(fPts[i][0])},${f1(fPts[i][1])}" fill="${fillRim}" stroke="${INK}" stroke-width="0.9"/>`;
    }
    out += poly3(fPts, fillFace, sw);
    if (spokes > 0) {
      const ir = r * 0.78;
      const hole = [];
      for (let i = 0; i < 24; i++) {
        const a = (Math.PI * 2 * i) / 24;
        hole.push(P3(cx + dx * 0.5, cy + ir * Math.cos(a), cz + ir * Math.sin(a)));
      }
      out += poly3(hole, '#f4ebd7', 1.1, 0.72);
      for (let k = 0; k < spokes; k++) {
        const a = ang + (Math.PI * 2 * k) / spokes;
        out += line3([cx + dx * 0.5, cy, cz], [cx + dx * 0.5, cy + ir * Math.cos(a), cz + ir * Math.sin(a)], '#4b5258', 3.4);
      }
    }
    const [hx, hy] = P3(cx + dx * 0.5, cy, cz);
    out += `<circle cx="${f1(hx)}" cy="${f1(hy)}" r="${f1(Math.max(3.5, r * 0.14))}" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.2"/>`;
    return out;
  }
  function shuttle3HTML() {
    // Barqueta orientada al llarg de X centrada a (0,0,0) en pantalla relativa a P3(0,0,0)
    const o = P3(0, 0, 0);
    const rel = (x, y, z) => { const p = P3(x, y, z); return [p[0] - o[0], p[1] - o[1]]; };
    const topDeck = [rel(-33, 0, 6), rel(-15, -9, 7.5), rel(15, -9, 7.5), rel(33, 0, 6), rel(15, 9, 7.5), rel(-15, 9, 7.5)];
    const frontWall = [rel(-33, 0, 6), rel(-15, 9, 7.5), rel(15, 9, 7.5), rel(33, 0, 6), rel(15, 9, -4.5), rel(-15, 9, -4.5)];
    const cav = [rel(-14, -4, 7.5), rel(14, -4, 7.5), rel(14, 4, 7.5), rel(-14, 4, 7.5)];
    const tipL = [rel(-41, 0, 1.5), rel(-30, -4, 5.5), rel(-30, 4, 5.5), rel(-30, 4, -3)];
    const tipR = [rel(41, 0, 1.5), rel(30, -4, 5.5), rel(30, 4, 5.5), rel(30, 4, -3)];
    const pC0 = rel(-11, 0, 5), pC1 = rel(11, 0, 5);
    return poly3(frontWall, '#946133', 1.4) + poly3(topDeck, '#eab96e', 1.5) +
      poly3(tipL, 'url(#tx-llauto)', 1.2) + poly3(tipR, 'url(#tx-llauto)', 1.2) +
      poly3(cav, '#2e1f15', 1) +
      `<line x1="${f1(pC0[0])}" y1="${f1(pC0[1])}" x2="${f1(pC1[0])}" y2="${f1(pC1[1])}" stroke="#fffdf5" stroke-width="6.5" stroke-linecap="round"/>` +
      `<line x1="${f1(pC0[0])}" y1="${f1(pC0[1])}" x2="${f1(pC1[0])}" y2="${f1(pC1[1])}" stroke="#b4a78b" stroke-width="1.3" stroke-dasharray="2 3"/>`;
  }
  function batten3HTML(beatY, kickL, kickR, opts = {}) {
    // Batà penjant amb pues de la pinta, pista de lliscament i dues caixes laterals amb tacos
    const pivotY = 48, pivotZ = 252;
    let s = '';
    // Suports penjants des del pont superior fins a la pista (Y = beatY)
    s += line3([-246, pivotY, pivotZ], [-246, beatY + 2, 138], INK, 9);
    s += line3([-246, pivotY, pivotZ], [-246, beatY + 2, 138], '#8d5d2e', 6);
    s += line3([246, pivotY, pivotZ], [246, beatY + 2, 138], INK, 9);
    s += line3([246, pivotY, pivotZ], [246, beatY + 2, 138], '#8d5d2e', 6);
    // Pinta (darrere de la llançadora: Y = beatY - 6)
    s += box3(-218, 218, beatY - 10, beatY - 3, 170, 178, 'fustaf', 1.1);
    for (let rx = -205; rx <= 205; rx += 16) {
      s += line3([rx, beatY - 6, 134], [rx, beatY - 6, 171], '#6d777f', 1.6);
    }
    // Pista de lliscament inferior
    s += box3(-225, 225, beatY - 8, beatY + 18, 128, 137, 'fusta', 1.3);
    // Caixa esquerra i dreta amb taco mòbil dins
    s += box3(-326, -225, beatY - 9, beatY + 18, 128, 158, 'fustaf', 1.2);
    s += box3(-318 + kickL, -300 + kickL, beatY - 3, beatY + 13, 137, 155, 'llauto', 1.1);
    s += box3(225, 326, beatY - 9, beatY + 18, 128, 158, 'fustaf', 1.2);
    s += box3(300 - kickR, 318 - kickR, beatY - 3, beatY + 13, 137, 155, 'llauto', 1.1);
    if (!opts.noPivots) {
      for (const sx of [-246, 246]) {
        const [px, py] = P3(sx, pivotY, pivotZ);
        s += `<circle cx="${f1(px)}" cy="${f1(py)}" r="5" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.2"/>`;
      }
    }
    return s;
  }

  /* ==================== 2. LLANÇADORA VOLANT (JOHN KAY, 1733) ==================== */
  function svgLlancadora() {
    let s = EXTRA_DEFS + taller(565);
    // Ombra del bastidor al terra Z=0
    s += poly3([P3(-285, -195, 0), P3(285, -195, 0), P3(285, 185, 0), P3(-285, 185, 0)], '#9b8b6c', 0, 0.25);

    // Bastidor posterior i plegador d'ordit (darrere)
    s += `<g data-part="bastidor">
      ${box3(-265, -247, -185, -167, 0, 260, 'fustaf')}
      ${box3(247, 265, -185, -167, 0, 260, 'fustaf')}
      ${box3(-265, 265, -185, -167, 244, 260, 'fusta')}
      ${box3(-265, 265, -185, -167, 18, 34, 'fusta')}
      ${box3(-265, -247, -175, 175, 18, 34, 'fustaf')}
      ${box3(247, 265, -175, 175, 18, 34, 'fustaf')}
      ${box3(-265, -247, -175, 58, 244, 260, 'fusta')}
      ${box3(247, 265, -175, 58, 244, 260, 'fusta')}
      ${box3(-265, 265, 40, 56, 244, 260, 'fusta')}
    </g>`;

    // Plegador d'ordit posterior + grup inferior de l'ordit (passa per sota la llançadora)
    s += `<g data-part="ordit">
      ${cylX3(-226, 226, -175, 148, 22, 'url(#tx-cotobob)', '#efe5cd', 1.5)}
      ${cylX3(226, 244, -175, 148, 9, '#8d5d2e', '#6c431f', 1.2)}
      <polygon id="ll-shed-glow" points="" fill="#fff3b8" opacity=".36"/>
      <g id="ll-warp-low"></g>
    </g>`;

    // Lliços (dos marcs amb politges superiors penjant de la biga a Y=-38)
    s += `<g data-part="llicos">
      ${box3(-265, 265, -48, -30, 244, 258, 'fusta')}
      <g id="ll-heddles"></g>
    </g>`;

    // Batà penjant + pinta + caixes laterals + tacos
    s += `<g data-part="pinta" id="ll-batten"></g>`;

    // Trama volant + barqueta llançadora (dins la calada!)
    s += `<g data-part="llancadora">
      <g id="ll-active-weft"></g>
      <g id="ll-shuttle">${shuttle3HTML()}</g>
    </g>`;

    // Fils superiors de l'ordit (passen PER DAMUNT de la llançadora!)
    s += `<g data-part="ordit" id="ll-warp-up" pointer-events="none"></g>`;

    // Tela teixida i plegador frontal de tela (en primer pla, bastidor frontal rebaixat perquè no tapi el procés)
    s += `<g data-part="tela">
      <g id="ll-cloth"></g>
      ${cylX3(-226, 226, 165, 86, 20, 'url(#tx-cotobob)', '#efe5cd', 1.5)}
      ${cylX3(226, 244, 165, 86, 8, '#d4a63a', '#9b731c', 1.2)}
    </g>`;
    s += `<g data-part="bastidor">
      ${box3(-265, -247, 155, 175, 0, 156, 'fustaf')}
      ${box3(247, 265, 155, 175, 0, 156, 'fustaf')}
      ${box3(-265, 265, 155, 173, 140, 152, 'fusta')}
    </g>`;

    // Cordill en V, mànec central i una sola mà impulsant la llançadora
    s += `<g data-part="cordill">
      <line id="ll-cord-l" x1="0" y1="0" x2="0" y2="0" stroke="#8b6f47" stroke-width="2.6" stroke-linecap="round"/>
      <line id="ll-cord-r" x1="0" y1="0" x2="0" y2="0" stroke="#8b6f47" stroke-width="2.6" stroke-linecap="round"/>
      <g id="ll-handle">
        ${caixa(-7, -12, 14, 24, 'llauto', 'cil', { rx: 4 })}
        ${maHTML('ll-hand', 'cordill')}
      </g>
    </g>`;

    // Indicador compacte de les 3 accions sincronitzades al buit superior esquerre (deixa el teler gegant)
    s += `<g id="ll-steps" transform="translate(110, 108)"></g>`;

    return RI.svg(s, '95 96 965 492');
  }

  function animaLlancadora() {
    return ({ p, el }) => {
      const s = S('llancadora', p);
      const beatNorm = (-82 - s.y) / 70;
      const beatY = 18 + beatNorm * 72; // 18 (enrere) -> 90 (pica la tela a Y=95)

      // Lliços 3D a Y=-58 (posterior) i Y=-22 (anterior)
      const z1 = 148 + 28 * s.shed, z2 = 148 - 28 * s.shed;
      const heddleHTML = (y, zc, col) => {
        let h = box3(-212, 212, y - 3, y + 3, zc + 22, zc + 28, 'fusta', 1.1);
        h += box3(-212, 212, y - 3, y + 3, zc - 28, zc - 22, 'fusta', 1.1);
        h += line3([-110, y, zc + 28], [-110, y, 246], '#7a5c3a', 1.6);
        h += line3([110, y, zc + 28], [110, y, 246], '#7a5c3a', 1.6);
        for (let i = 0; i < 8; i++) {
          const hx = -182 + i * 52;
          const [cx, cy] = P3(hx, y, zc);
          h += line3([hx, y, zc - 22], [hx, y, zc + 22], col, 1.4);
          h += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="2.4" fill="#fffcf5" stroke="${col}" stroke-width="1.2"/>`;
        }
        return h;
      };
      // Polítges superiors del balancí dels lliços
      let pul = '';
      for (const px of [-110, 110]) {
        const [gx, gy] = P3(px, -38, 246);
        pul += `<circle cx="${f1(gx)}" cy="${f1(gy)}" r="8" fill="url(#tx-llauto)" stroke="${INK}" stroke-width="1.2"/>`;
      }
      el('ll-heddles').innerHTML = heddleHTML(-58, z1, '#2f6f68') + heddleHTML(-22, z2, '#7b8c6b') + pul;

      // Fils d'ordit en 3D: 15 fils; la meitat superior es pinta després de la llançadora
      let up = '', low = '';
      for (let i = 0; i < 15; i++) {
        const x = -196 + i * 28, odd = i % 2 === 1;
        const yh = odd ? -58 : -22, zh = odd ? z1 : z2;
        const isUp = (odd && s.shed >= 0) || (!odd && s.shed < 0);
        const col = odd ? '#2f6f68' : '#7b8c6b';
        const seg = line3([x, -175, 148], [x, yh, zh], col, odd ? 2.1 : 1.9) +
          line3([x, yh, zh], [x, 95, 148], col, odd ? 2.1 : 1.9);
        if (isUp) up += seg; else low += seg;
      }
      el('ll-warp-low').innerHTML = low;
      el('ll-warp-up').innerHTML = up;
      const glowPts = [P3(204, -175, 148), P3(204, s.shed >= 0 ? -58 : -22, Math.max(z1, z2)), P3(204, 95, 148), P3(204, s.shed >= 0 ? -22 : -58, Math.min(z1, z2))];
      el('ll-shed-glow').setAttribute('points', glowPts.map((pt) => `${f1(pt[0])},${f1(pt[1])}`).join(' '));
      el('ll-shed-glow').setAttribute('opacity', (0.48 * Math.abs(s.shed)).toFixed(2));

      // Batà penjant + pinta + caixes amb tacos
      const kickL = s.pull && p < 0.3 ? 32 : 0, kickR = s.pull && p >= 0.6 ? 32 : 0;
      el('ll-batten').innerHTML = batten3HTML(beatY, kickL, kickR);

      // Llançadora volant en 3D dins la calada (Y = beatY + 5, Z = 147)
      const sx3 = (s.x / 325) * 268;
      const [sx2, sy2] = P3(sx3, beatY + 5, 147);
      el('ll-shuttle').setAttribute('transform', `translate(${f1(sx2)} ${f1(sy2)})`);

      // Trama activa + fletxa direccional quan la llançadora creua la calada + trames incorporades
      let actW = '';
      if (s.weaving) {
        const dir = p < 0.5 ? 1 : -1;
        actW += line3([clamp(sx3 - dir * 68, -210, 210), beatY + 12, 162], [clamp(sx3 + dir * 48, -210, 210), beatY + 12, 162], '#d97706', 2.8, ' stroke-dasharray="5 4" marker-end="url(#m-fl)"');
      }
      if (p >= 0.18 && p < 0.50) {
        const wy = p < 0.40 ? beatY + 4 : lerp(beatY + 4, 95, s.beat1);
        const xEnd = p < 0.38 ? clamp(sx3, -200, 200) : 200;
        if (xEnd > -200) actW += line3([-200, wy, 148], [xEnd, wy, 148], '#c84b31', 3.4);
      }
      if (p >= 0.67 && p < 0.95) {
        const wy = p < 0.86 ? beatY + 4 : lerp(beatY + 4, 95, s.beat2);
        const xStart = p < 0.85 ? clamp(sx3, -200, 200) : -200;
        if (xStart < 200) actW += line3([200, wy, 148], [xStart, wy, 148], '#c84b31', 3.4);
      }
      el('ll-active-weft').innerHTML = actW;

      // Tela teixida 3D: pla horitzontal Y=95..165 a Z=148 + caiguda cap al corró frontal Y=165, Z=86
      let cl = poly3([P3(-206, 95, 148), P3(206, 95, 148), P3(206, 165, 148), P3(-206, 165, 148)], 'url(#tx-tela)', 1.5);
      cl += poly3([P3(-206, 165, 148), P3(206, 165, 148), P3(206, 165, 92), P3(-206, 165, 92)], '#dfd1b3', 1.4);
      for (let i = 0; i < 15; i++) {
        const x = -196 + i * 28;
        cl += line3([x, 95, 148], [x, 165, 148], '#cbbd9c', 1.1);
      }
      for (let wy = 112; wy <= 156; wy += 11) cl += line3([-200, wy, 148], [200, wy, 148], '#d89b87', 1.8, ' opacity=".6"');
      if (p >= 0.50) cl += line3([-200, 99, 148], [200, 99, 148], '#c84b31', 3.4);
      if (p >= 0.95) cl += line3([-200, 105, 148], [200, 105, 148], '#c84b31', 3.4);
      el('ll-cloth').innerHTML = cl;

      // Cordill en V, mànec i mà estirant al davant-centre
      const hShiftX = kickL ? 28 : kickR ? -28 : 0;
      const [hx, hy] = P3(hShiftX, 208, 104);
      const [cLx, cLy] = P3(-308 + kickL, beatY + 5, 152);
      const [cRx, cRy] = P3(308 - kickR, beatY + 5, 152);
      el('ll-handle').setAttribute('transform', `translate(${f1(hx)} ${f1(hy)})`);
      el('ll-hand').setAttribute('transform', 'translate(14 8)');
      el('ll-cord-l').setAttribute('x1', f1(cLx)); el('ll-cord-l').setAttribute('y1', f1(cLy));
      el('ll-cord-l').setAttribute('x2', f1(hx)); el('ll-cord-l').setAttribute('y2', f1(hy - 8));
      el('ll-cord-l').setAttribute('stroke', kickL ? '#d97706' : '#8b6f47');
      el('ll-cord-l').setAttribute('stroke-width', kickL ? '3.8' : '2.4');
      el('ll-cord-r').setAttribute('x1', f1(cRx)); el('ll-cord-r').setAttribute('y1', f1(cRy));
      el('ll-cord-r').setAttribute('x2', f1(hx)); el('ll-cord-r').setAttribute('y2', f1(hy - 8));
      el('ll-cord-r').setAttribute('stroke', kickR ? '#d97706' : '#8b6f47');
      el('ll-cord-r').setAttribute('stroke-width', kickR ? '3.8' : '2.4');

      // Indicador compacte dels 3 passos de teixir
      const cur = s.weaving ? 1 : beatNorm > 0.08 ? 2 : 0;
      const noms = ['1 · Calada (peus)', '2 · Llançadora (1 mà)', '3 · Batuda (pinta)'];
      let st = `<rect x="0" y="0" width="196" height="102" rx="11" fill="url(#tx-peça-fons)" stroke="#d6cbb5" stroke-width="1.4"/>
        <text x="98" y="18" text-anchor="middle" font-size="11.5" font-weight="800" fill="#6f4e28">Cicle del teixit</text>`;
      noms.forEach((nom, i) => {
        const on = cur === i;
        st += `<rect x="10" y="${25 + i * 24}" width="176" height="20" rx="10" fill="${on ? '#b9722a' : '#efe7d4'}" stroke="${on ? INK : '#d6cbb5'}" stroke-width="1.1"/>
          <text x="98" y="${39 + i * 24}" text-anchor="middle" font-size="10.8" font-weight="700" fill="${on ? '#fff' : '#6c655c'}">${nom}</text>`;
      });
      el('ll-steps').innerHTML = st;
    };
  }

  /* ==================== 3. SPINNING JENNY (HARGREAVES, 1764) ==================== */
  function svgJenny() {
    let s = EXTRA_DEFS + taller(562);
    s += ombra(430, 568, 370, 9);

    // Bastidor lateral net (sense barres que creuin davant del fus o la pinça)
    s += `<g data-part="bastidor">
      ${caixa(78, 250, 22, 312, 'fusta-v', 'cil')}${caixa(668, 250, 22, 312, 'fusta-v', 'cil')}
      ${caixa(70, 505, 626, 20, 'fusta', 'tub', { rx: 2 })}
      ${caixa(70, 244, 626, 20, 'fusta', 'tub', { rx: 3 })}
      ${caixa(148, 264, 18, 241, 'fustaf', 'cil')}
    </g>`;

    // Bobines de metxa sota el bastidor
    s += `<g data-part="metxes">
      ${caixa(270, 466, 130, 14, 'fustaf', 'tub', { rx: 2 })}
      ${bobinaHTML(325, 434, 34, 48, true, 'metxes')}
      <g id="jn-roving-feed"></g>
    </g>`;

    // Tambor i corretja de transmissió fins al fus i la roda
    s += `<g data-part="corda">
      ${corretjaHTML(705, 362, 102, 238, 456, 26, 'jn-belt1', 'corda')}
      ${corretjaHTML(238, 456, 26, 128, 396, 14, 'jn-belt2', 'corda')}
      <circle cx="238" cy="456" r="26" fill="url(#tx-ferro)" stroke="${INK}" stroke-width="1.8"/>
      <g id="jn-drum"><line x1="216" y1="456" x2="260" y2="456" stroke="#d8e0e6" stroke-width="2.4"/></g>
      <circle cx="238" cy="456" r="6" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.2"/>
    </g>`;

    // Roda gran a la dreta
    s += `<g data-part="roda">
      <g id="jn-wheel">${rodaR(705, 362, 108, { raigs: 8, tex: 'fusta', gruix: 14, raig: 7, boto: 20, pern: 'llauto' })}
        <line x1="705" y1="362" x2="740" y2="362" stroke="#3c4349" stroke-width="6" stroke-linecap="round"/>
        <circle cx="740" cy="362" r="7.5" fill="url(#tx-fustaf)" stroke="${INK}" stroke-width="1.5"/>
      </g>
    </g>`;

    // Fus inclinat a l'esquerra + fil-guia mòbil + con que creix
    s += `<g data-part="fusos">
      <g transform="rotate(11 128 396)">
        ${tub('M128 212V412', 6.5, 'plom', { cap: 'round' })}
        <polygon points="128,196 124,214 132,214" fill="#c7d0d6" stroke="${INK}" stroke-width="1.1"/>
        <g id="jn-cop"></g>
        <circle cx="128" cy="396" r="14" fill="url(#tx-llauto)" stroke="${INK}" stroke-width="1.6"/>
        <g id="jn-whorl"><line x1="117" y1="396" x2="139" y2="396" stroke="${INK}" stroke-width="2.2"/></g>
      </g>
      <g id="jn-faller">
        <line x1="168" y1="268" x2="162" y2="225" stroke="#b88928" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="162" cy="225" r="4.5" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.1"/>
      </g>
      <g id="jn-yarn"></g>
    </g>`;

    // Pinça mòbil sobre els rails superiors
    s += `<g id="jn-clasp" data-part="pinca">
      <rect x="-26" y="238" width="52" height="14" rx="3" fill="url(#tx-fusta)" stroke="${INK}" stroke-width="1.6"/>
      <g id="jn-jaw">
        <rect x="-26" y="220" width="52" height="13" rx="3" fill="url(#tx-llauto)" stroke="${INK}" stroke-width="1.6"/>
        <rect x="-12" y="206" width="24" height="14" rx="4" fill="url(#tx-fustaf)" stroke="${INK}" stroke-width="1.4"/>
      </g>
      <circle cx="-18" cy="256" r="6" fill="url(#g-esf-ferro)" stroke="${INK}" stroke-width="1.2"/>
      <circle cx="18" cy="256" r="6" fill="url(#g-esf-ferro)" stroke="${INK}" stroke-width="1.2"/>
      <g transform="translate(8 205)">${maHTML('jn-hand', 'pinca', true)}</g>
      <g id="jn-clasp-badge"></g>
    </g>`;

    // Quadre dret sincronitzat: 1 roda -> 8 fusos alhora!
    s += `<g transform="translate(848, 128)">
      <rect x="0" y="0" width="374" height="436" rx="14" fill="url(#tx-peça-fons)" stroke="#d6cbb5" stroke-width="1.6"/>
      <text x="187" y="30" text-anchor="middle" font-size="16" font-weight="800" fill="#6f4e28">1 roda → 8 fusos alhora</text>
      <text x="187" y="50" text-anchor="middle" font-size="12.5" fill="#5b6258">La pinça estira tots els fils d’un sol cop</text>
      <g id="jn-multi"></g>
    </g>`;

    return RI.svg(s);
  }

  function animaJenny() {
    return ({ p, el }) => {
      const s = S('jenny', p);
      // travel: 82..265 -> cx de la pinça de 240 a 595
      const cx = lerp(240, 595, (s.travel - 82) / (265 - 82));
      const wdeg = (s.angle * 180) / Math.PI;
      const ddeg = (s.driveAngle * 180) / Math.PI;
      const sdeg = (s.spindleAngle * 180) / Math.PI;

      el('jn-wheel').setAttribute('transform', `rotate(${f1(wdeg)} 705 362)`);
      el('jn-drum').setAttribute('transform', `rotate(${f1(ddeg)} 238 456)`);
      el('jn-whorl').setAttribute('transform', `rotate(${f1(sdeg)} 128 396)`);
      el('jn-belt1-a').style.strokeDashoffset = (-s.angle * 102).toFixed(1);
      el('jn-belt1-b').style.strokeDashoffset = (-s.angle * 102).toFixed(1);
      el('jn-belt2-a').style.strokeDashoffset = (-s.driveAngle * 26).toFixed(1);
      el('jn-belt2-b').style.strokeDashoffset = (-s.driveAngle * 26).toFixed(1);

      // Pinça i estat oberta/tancada
      el('jn-clasp').setAttribute('transform', `translate(${f1(cx)} 0)`);
      el('jn-jaw').setAttribute('transform', `translate(0 ${s.closed ? 0 : -14})`);
      el('jn-clasp-badge').innerHTML = badge(0, 178, s.closed ? 'PINÇA TANCADA' : 'PINÇA OBERTA', s.closed ? '#92400e' : '#2f6f68', '#fff');

      // Con de fil sobre el fus inclinat (en coordenades locals del fus rotades)
      const r = 7 + 12 * (s.copRadius - 7) / 10;
      el('jn-cop').innerHTML = `<path d="${copPath(128, 368, 92, r)}" fill="url(#tx-cotobob)" stroke="${INK}" stroke-width="1.4"/>${copSpiral(128, 368, 92, r, s.spindleAngle)}`;

      // Fil-guia (baixa a p=0.64..0.70)
      const fall = (306 - s.guideZ) / 54; // 0..1
      el('jn-faller').setAttribute('transform', `rotate(${f1(-fall * 48)} 168 268)`);
      const tipX = lerp(164, 148, fall), tipY = lerp(212, 294, fall);

      // Alimentació des de la bobina fins a la pinça
      el('jn-roving-feed').innerHTML = fibresHTML(325, 404, cx - 12, 240, 12, 10, s.draw * 0.4);

      // Tram estirat entre la pinça i el fus
      if (p < 0.52) {
        const midX = lerp(cx - 22, tipX, 0.55 - 0.35 * s.draw);
        const midY = lerp(238, tipY, 0.55 - 0.35 * s.draw);
        el('jn-yarn').innerHTML =
          fibresHTML(cx - 22, 238, midX, midY, 10, lerp(9, 3.8, s.draw), s.draw * 0.5) +
          filTorcutHTML(midX, midY, tipX, tipY, s.spindleAngle * 0.25, Math.max(0.25, s.draw), 3.4);
      } else {
        el('jn-yarn').innerHTML = filTorcutHTML(cx - 22, 238, tipX, tipY, s.spindleAngle * 0.25, 1, 3.5);
      }

      // 8 fusos simultanis a la dreta
      const barY = lerp(188, 104, s.draw) + (p >= 0.70 ? lerp(0, 84, s.wind) : 0);
      const claspY = p < 0.70 ? lerp(188, 104, s.draw) : lerp(104, 188, s.wind);
      let m = `<rect x="26" y="${f1(claspY)}" width="322" height="12" rx="3" fill="url(#tx-fusta)" stroke="${INK}" stroke-width="1.3"/>
        <rect x="26" y="378" width="322" height="14" rx="3" fill="url(#tx-ferro)" stroke="${INK}" stroke-width="1.3"/>`;
      for (let i = 0; i < 8; i++) {
        const x = 44 + i * 40.8;
        m += `<line x1="${f1(x)}" y1="${f1(claspY + 12)}" x2="${f1(x)}" y2="262" stroke="${p < 0.52 ? '#6d8768' : '#b88928'}" stroke-width="${p < 0.52 ? 2.4 : 2}"/>
          <line x1="${f1(x)}" y1="248" x2="${f1(x)}" y2="380" stroke="#7c878e" stroke-width="3.5" stroke-linecap="round"/>
          <path d="${copPath(x, 358, 72, r * 0.78)}" fill="url(#tx-cotobob)" stroke="${INK}" stroke-width="1.1"/>
          ${copSpiral(x, 358, 72, r * 0.78, s.spindleAngle + i * 0.5)}`;
      }
      m += `<text x="187" y="416" text-anchor="middle" font-size="12.5" font-weight="700" fill="#897142">${s.wind > 0.05 ? 'Tots vuit cons creixen alhora' : 'Un mateix moviment estira vuit fils'}</text>`;
      el('jn-multi').innerHTML = m;
    };
  }

  /* ==================== 4. WATER FRAME (ARKWRIGHT, 1769) ==================== */
  function svgWater() {
    let s = EXTRA_DEFS + taller(565);
    s += ombra(560, 572, 470, 9);

    // Canal d'aigua i roda hidràulica a la dreta (aigua)
    s += `<g data-part="aigua">
      <rect x="860" y="492" width="390" height="73" fill="url(#g-aiguat)"/>
      <path d="M862 494q18-6 36 0t36 0 36 0 36 0 36 0 36 0 36 0 36 0 36 0 36 0" fill="none" stroke="#fff" stroke-width="2" opacity=".75"/>
      <path d="M876 525H1220" class="flux2 s-blanc" stroke-width="3.5" data-flux="2.2"/>
      <g id="wt-waterwheel">${rodaR(1055, 378, 138, { raigs: 8, tex: 'fustaf', gruix: 18, raig: 9, boto: 26, pern: 'ferro' })}</g>
      <path d="M1175 450A148 148 0 0 1 1105 510" fill="none" stroke="#2f7fb5" stroke-width="4" marker-end="url(#m-fl)"/>
      <text x="1055" y="218" text-anchor="middle" class="tx-p" fill="#1d5f8f">Força hidràulica exterior</text>
      ${caixa(846, 138, 34, 427, 'pedra', 'pla')}
      ${tub('M728 378H1055', 11, 'ferro')}
      <circle cx="863" cy="378" r="14" fill="url(#tx-llauto)" stroke="${INK}" stroke-width="1.6"/>
      ${corretjaHTML(728, 378, 34, 728, 502, 20, 'wt-belt-a', 'aigua')}
      ${corretjaHTML(728, 378, 34, 578, 260, 22, 'wt-belt-b', 'aigua')}
      <circle cx="728" cy="378" r="34" fill="url(#tx-ferro)" stroke="${INK}" stroke-width="1.8"/>
      <g id="wt-mainpulley"><line x1="698" y1="378" x2="758" y2="378" stroke="#d8e0e6" stroke-width="3"/><line x1="728" y1="348" x2="728" y2="408" stroke="#d8e0e6" stroke-width="3"/></g>
      <circle cx="728" cy="378" r="9" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.4"/>
      ${tub('M600 502H742', 9, 'ferro')}
    </g>`;

    // Bastidor de fusta de la màquina (a l'esquerra del mur de pedra)
    s += `<g data-part="bastidor">
      ${caixa(140, 140, 22, 425, 'fusta-v', 'cil')}${caixa(768, 140, 22, 425, 'fusta-v', 'cil')}
      ${caixa(130, 132, 670, 20, 'fusta', 'tub', { rx: 3 })}
      ${caixa(140, 272, 646, 18, 'fusta', 'tub', { rx: 2 })}
      ${caixa(140, 520, 646, 20, 'fusta', 'tub', { rx: 2 })}
    </g>`;

    // Bobina superior de metxa
    s += `<g data-part="metxa">
      ${bobinaHTML(195, 194, 42, 60, true, 'metxa')}
    </g>`;

    // Tres parelles de corrons d'estiratge en secció lateral clara (x=295, 435, 575)
    s += `<g data-part="corrons">
      <g id="wt-fibres"></g>
      ${[295, 435, 575].map((cx, j) => `
        ${corroHTML(cx, 208, 19, `wt-rt-${j}`, 'corrons', { cuir: true })}
        ${corroHTML(cx, 250, 19, `wt-rb-${j}`, 'corrons')}
        <rect x="${cx - 10}" y="272" width="20" height="26" rx="2" fill="url(#tx-llauto)" stroke="${INK}" stroke-width="1.2"/>
        ${badge(cx, 162, ['×1', '×1,6', '×3,2'][j], j === 0 ? '#5b6258' : j === 1 ? '#2f6f68' : '#b45309', '#fff')}
      `).join('')}
      <path d="M325 162H405M465 162H545" stroke="#b45309" stroke-width="2.2" marker-end="url(#m-fl)"/>
    </g>`;

    // Aleta giratòria i bobina contínua (x=635, y=340..515)
    s += `<g data-part="aleta">
      <circle cx="635" cy="240" r="8" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.4"/>
      <g id="wt-yarn-in"></g>
      <g id="wt-flyer-back"></g>
      <g id="wt-bobbin"></g>
      <g id="wt-flyer-front"></g>
      ${badge(635, 316, 'Torça i recull sense parar', '#2f6f68', '#fff')}
    </g>`;

    // Finestra de detall: 4 caps treballant en continu
    s += `<g transform="translate(185, 342)">
      <rect x="0" y="0" width="320" height="162" rx="12" fill="url(#tx-peça-fons)" stroke="#d6cbb5" stroke-width="1.5"/>
      <text x="160" y="24" text-anchor="middle" font-size="14" font-weight="800" fill="#6f4e28">4 caps filant en continu</text>
      <g id="wt-four"></g>
    </g>`;

    return RI.svg(s);
  }

  function animaWater() {
    return ({ p, el }) => {
      const s = S('water', p);
      const wwDeg = (p * 360 * 1.4).toFixed(1);
      el('wt-waterwheel').setAttribute('transform', `rotate(${wwDeg} 1055 378)`);
      el('wt-mainpulley').setAttribute('transform', `rotate(${(p * 360 * 3).toFixed(1)} 728 378)`);
      const boff = (-p * 360 * 2).toFixed(1);
      ['wt-belt-a-a', 'wt-belt-a-b', 'wt-belt-b-a', 'wt-belt-b-b'].forEach((id) => { el(id).style.strokeDashoffset = boff; });

      // Gir de les tres parelles de corrons (oposat: superior antihorari, inferior horari!)
      s.pairs.forEach(([aTop, aBot], j) => {
        const cx = [295, 435, 575][j];
        el(`wt-rt-${j}`).setAttribute('transform', `rotate(${f1((aTop * 180) / Math.PI)} ${cx} 208)`);
        el(`wt-rb-${j}`).setAttribute('transform', `rotate(${f1((aBot * 180) / Math.PI)} ${cx} 250)`);
      });

      // Estiratge progressiu entre les parelles de corrons (17 px -> 10 px -> 4.5 px!)
      el('wt-fibres').innerHTML =
        fibresHTML(214, 198, 295, 229, 17, 15, p * 1.5) +
        fibresHTML(295, 229, 435, 229, 14, 8.5, p * 2.4) +
        fibresHTML(435, 229, 575, 229, 8.5, 4.2, p * 4.8);
      el('wt-yarn-in').innerHTML = filTorcutHTML(575, 229, 635, 240, s.flyerAngle * 0.4, 0.8, 3.2);

      // Aleta i bobina en 2D amb pas per davant i per darrere
      const a = s.flyerAngle, dx = 46 * Math.cos(a), front = Math.sin(a) >= 0;
      const bobR = 13 + 14 * s.fill, lift = Math.sin(p * Math.PI * 4) * 14;
      const armX = 635 + dx, oppX = 635 - dx, hookY = 438 + lift;

      el('wt-bobbin').innerHTML = `
        <line x1="635" y1="338" x2="635" y2="515" stroke="#5a6269" stroke-width="5"/>
        <rect x="${f1(635 - bobR)}" y="392" width="${f1(bobR * 2)}" height="94" rx="4" fill="url(#tx-cotobob)" stroke="${INK}" stroke-width="1.5"/>
        ${caixa(635 - 26, 384, 52, 8, 'fustaf', 'tub', { rx: 2 })}${caixa(635 - 26, 486, 52, 8, 'fustaf', 'tub', { rx: 2 })}`;

      const flyerArms = `<path d="M635 352Q${f1(armX)} 354 ${f1(armX)} 380V498" fill="none" stroke="${INK}" stroke-width="7.5" stroke-linecap="round"/>
        <path d="M635 352Q${f1(armX)} 354 ${f1(armX)} 380V498" fill="none" stroke="#d4a742" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M635 352Q${f1(oppX)} 354 ${f1(oppX)} 380V498" fill="none" stroke="${INK}" stroke-width="7.5" stroke-linecap="round"/>
        <path d="M635 352Q${f1(oppX)} 354 ${f1(oppX)} 380V498" fill="none" stroke="#b88928" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="${f1(armX)}" cy="${f1(hookY)}" r="4.5" fill="#fff" stroke="${INK}" stroke-width="1.4"/>
        <line x1="635" y1="240" x2="635" y2="352" stroke="#b4892c" stroke-width="3.2"/>
        <polyline points="635,352 ${f1(armX)},380 ${f1(armX)},${f1(hookY)} ${f1(635 + Math.cos(a) * bobR)},${f1(hookY)}" fill="none" stroke="#d97706" stroke-width="2.4" stroke-linejoin="round"/>`;

      el('wt-flyer-back').innerHTML = front ? '' : flyerArms;
      el('wt-flyer-front').innerHTML = front ? flyerArms : '';

      // 4 caps en continu
      let four = '<line x1="28" y1="138" x2="292" y2="138" stroke="#5a6269" stroke-width="5"/>';
      for (let i = 0; i < 4; i++) {
        const x = 58 + i * 68, ia = a + i * 0.9, idx = 24 * Math.cos(ia), br = 8 + 9 * s.fill;
        four += `<line x1="${x}" y1="36" x2="${x}" y2="140" stroke="#b4892c" stroke-width="2.2"/>
          <rect x="${f1(x - br)}" y="76" width="${f1(br * 2)}" height="48" rx="3" fill="url(#tx-cotobob)" stroke="${INK}" stroke-width="1.2"/>
          <path d="M${x} 54Q${f1(x + idx)} 56 ${f1(x + idx)} 70V128M${x} 54Q${f1(x - idx)} 56 ${f1(x - idx)} 70V128" fill="none" stroke="#b88928" stroke-width="2.8" stroke-linecap="round"/>`;
      }
      el('wt-four').innerHTML = four;
    };
  }

  /* ==================== 5. LA MULA DE CROMPTON (1779) ==================== */
  function svgMula() {
    let s = EXTRA_DEFS + taller(564);
    s += ombra(590, 572, 480, 9);

    // Bastidor fix i fileta a l'esquerra
    s += `<g data-part="bastidor">
      ${caixa(66, 152, 22, 412, 'fusta-v', 'cil')}${caixa(226, 152, 22, 412, 'fusta-v', 'cil')}
      ${caixa(56, 142, 202, 20, 'fusta', 'tub', { rx: 3 })}${caixa(66, 336, 182, 16, 'fusta', 'tub')}
    </g>`;

    // Fileta amb bobines de metxa
    s += `<g data-part="fileta">
      ${bobinaHTML(126, 208, 36, 54, true, 'fileta')}
      ${bobinaHTML(126, 294, 36, 54, true, 'fileta')}
      <g id="ml-roving-in"></g>
    </g>`;

    // Dades i dues parelles de corrons en tall lateral net (x=220, 286)
    s += `<g data-part="corrons">
      ${caixa(196, 276, 120, 14, 'fustaf', 'tub')}
      <g id="ml-roving-mid"></g>
      ${corroHTML(218, 226, 18, 'ml-rt-0', 'corrons', { cuir: true })}
      ${corroHTML(218, 264, 18, 'ml-rb-0', 'corrons')}
      ${corroHTML(286, 226, 18, 'ml-rt-1', 'corrons', { cuir: true })}
      ${corroHTML(286, 264, 18, 'ml-rb-1', 'corrons')}
      <g id="ml-roller-badge"></g>
    </g>`;

    // Rails de ferro a terra + marca d'estiratge fi (quan els corrons s'aturen)
    s += `<g data-part="carro">
      ${caixa(246, 546, 760, 12, 'ferro', 'tub')}
      <g id="ml-afterdraft" opacity="0">
        <line x1="762" y1="532" x2="875" y2="532" stroke="#d97706" stroke-width="3" stroke-dasharray="5 4"/>
        ${badge(818, 514, '+ estiratge fi (corrons aturats)', '#b45309', '#fff')}
      </g>
    </g>`;

    // Fil que s'estira entre corrons fixos i carro mòbil
    s += `<g data-part="fus" id="ml-yarn"></g>`;

    // Carro mòbil sobre rodes amb fus inclinat, fil-guia i roda manual
    s += `<g id="ml-carro">
      <g data-part="carro">
        ${caixa(-128, 412, 236, 30, 'fusta', 'tub', { rx: 3 })}
        ${caixa(-95, 442, 22, 62, 'fustaf', 'cil')}${caixa(65, 442, 22, 62, 'fustaf', 'cil')}
        <g id="ml-w1">${rodaR(-84, 516, 29, { raigs: 6, tex: 'ferro', gruix: 7, raig: 4, boto: 9, pern: 'llauto' })}</g>
        <g id="ml-w2">${rodaR(76, 516, 29, { raigs: 6, tex: 'ferro', gruix: 7, raig: 4, boto: 9, pern: 'llauto' })}</g>
      </g>
      <g data-part="roda">
        ${corretjaHTML(62, 326, 66, -56, 396, 18, 'ml-belt', 'roda')}
        <g id="ml-wheel">${rodaR(62, 326, 70, { raigs: 8, tex: 'ferro', gruix: 10, raig: 4.5, boto: 14, pern: 'llauto' })}
          <line x1="62" y1="326" x2="88" y2="326" stroke="#2e221a" stroke-width="5" stroke-linecap="round"/>
          <circle cx="88" cy="326" r="5.5" fill="url(#tx-fustaf)" stroke="${INK}" stroke-width="1.3"/>
        </g>
      </g>
      <g data-part="fus">
        <g transform="rotate(-14 -56 396)">
          ${tub('M-56 225V414', 6, 'plom', { cap: 'round' })}
          <polygon points="-56,210 -60,226 -52,226" fill="#c7d0d6" stroke="${INK}" stroke-width="1"/>
          <g id="ml-cop"></g>
          <circle cx="-56" cy="396" r="14" fill="url(#tx-llauto)" stroke="${INK}" stroke-width="1.5"/>
        </g>
        <g id="ml-faller">
          <line x1="-18" y1="292" x2="-15" y2="234" stroke="#b88928" stroke-width="3.4" stroke-linecap="round"/>
          <circle cx="-15" cy="234" r="4.5" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.2"/>
        </g>
      </g>
    </g>`;

    // Finestra dalt-dreta: 6 fusos coordinats
    s += `<g transform="translate(865, 104)">
      <rect x="0" y="0" width="352" height="142" rx="12" fill="url(#tx-peça-fons)" stroke="#d6cbb5" stroke-width="1.5"/>
      <text x="176" y="22" text-anchor="middle" font-size="14" font-weight="800" fill="#6f4e28">6 fusos coordinats sobre el carro</text>
      <g id="ml-six"></g>
    </g>`;

    return RI.svg(s);
  }

  function animaMula() {
    return ({ p, el }) => {
      const s = S('mula', p);
      // travel: -90..-360 -> carroX de 435 a 875 (a p=0.38 és ~775)
      const cx = lerp(435, 875, (-90 - s.travel) / 270);
      const dx = cx - 435;
      el('ml-carro').setAttribute('transform', `translate(${f1(cx)} 0)`);

      const wDeg = ((dx / 29) * 180) / Math.PI;
      el('ml-w1').setAttribute('transform', `rotate(${f1(wDeg)} -84 516)`);
      el('ml-w2').setAttribute('transform', `rotate(${f1(wDeg)} 76 516)`);

      const wheelDeg = ((s.spindleAngle / 4.2) * 180) / Math.PI;
      el('ml-wheel').setAttribute('transform', `rotate(${f1(wheelDeg)} 62 326)`);
      el('ml-belt-a').style.strokeDashoffset = (-s.spindleAngle * 18).toFixed(1);
      el('ml-belt-b').style.strokeDashoffset = (-s.spindleAngle * 18).toFixed(1);

      // Corrons (girant fins a p=0.38, aturats després!)
      const rDeg = (s.rollerAngle * 180) / Math.PI;
      el('ml-rt-0').setAttribute('transform', `rotate(${f1(-rDeg)} 218 226)`);
      el('ml-rb-0').setAttribute('transform', `rotate(${f1(rDeg)} 218 264)`);
      el('ml-rt-1').setAttribute('transform', `rotate(${f1(-rDeg * 1.8)} 286 226)`);
      el('ml-rb-1').setAttribute('transform', `rotate(${f1(rDeg * 1.8)} 286 264)`);
      el('ml-roller-badge').innerHTML = badge(252, 168, s.rollersRunning ? 'CORRONS GIRANT' : 'CORRONS ATURATS!', s.rollersRunning ? '#2f6f68' : '#b45309', '#fff');
      el('ml-afterdraft').setAttribute('opacity', p >= 0.38 && p < 0.57 ? '1' : '0');

      el('ml-roving-in').innerHTML = fibresHTML(145, 208, 218, 245, 13, 10, s.fed * 0.5);
      el('ml-roving-mid').innerHTML = fibresHTML(218, 245, 286, 245, 10, 4.5, s.fed * 0.9);

      // Con de fil al fus inclinat
      const r = 7 + 12 * (s.copRadius - 7) / 10;
      el('ml-cop').innerHTML = `<path d="${copPath(-56, 372, 96, r)}" fill="url(#tx-cotobob)" stroke="${INK}" stroke-width="1.4"/>${copSpiral(-56, 372, 96, r, s.spindleAngle)}`;

      // Fil-guia (s.guideZ: 203 -> 133)
      const fall = (203 - s.guideZ) / 70;
      el('ml-faller').setAttribute('transform', `rotate(${f1(-fall * 48)} -18 292)`);
      const tipX = cx + lerp(-98, -74, fall), tipY = lerp(220, 294, fall);
      el('ml-yarn').innerHTML = filTorcutHTML(302, 245, tipX, tipY, s.spindleAngle * 0.25, Math.max(0.4, s.fed * 0.7 + s.last * 0.3), 3.3);

      // 6 fusos coordinats
      let six = '<line x1="36" y1="112" x2="316" y2="112" stroke="#7a542f" stroke-width="8" stroke-linecap="round"/>';
      for (let i = 0; i < 6; i++) {
        const x = 58 + i * 47;
        six += `<line x1="${x}" y1="36" x2="${x}" y2="114" stroke="#7c878e" stroke-width="3.2" stroke-linecap="round"/>
          <path d="${copPath(x, 108, 56, r * 0.7)}" fill="url(#tx-cotobob)" stroke="${INK}" stroke-width="1.1"/>
          ${copSpiral(x, 108, 56, r * 0.7, s.spindleAngle + i * 0.4)}`;
      }
      six += `<text x="176" y="132" text-anchor="middle" font-size="11.5" font-weight="700" fill="#897142">${s.wind > 0.05 ? 'Tots sis cons creixen en tornar' : 'Corrons i carro coordinats'}</text>`;
      el('ml-six').innerHTML = six;
    };
  }

  /* ==================== 6. TELER MECÀNIC DE CARTWRIGHT (1785 / 1787-1790) ==================== */
  function svgCartwright() {
    let s = EXTRA_DEFS + taller(565);
    s += poly3([P3(-285, -195, 0), P3(315, -195, 0), P3(315, 185, 0), P3(-285, 185, 0)], '#9b8b6c', 0, 0.25);

    // Bastidor posterior i suports inferiors de ferro per als eixos
    s += `<g data-part="bastidor">
      ${box3(-265, -247, -185, -167, 0, 260, 'fustaf')}
      ${box3(247, 265, -185, -167, 0, 260, 'fustaf')}
      ${box3(-265, 265, -185, -167, 244, 260, 'fusta')}
      ${box3(-265, 265, -185, -167, 18, 34, 'fusta')}
      ${box3(-265, -247, -175, 175, 18, 34, 'fustaf')}
      ${box3(247, 265, -175, 175, 18, 34, 'fustaf')}
      ${box3(-265, -247, -175, 58, 244, 260, 'fusta')}
      ${box3(247, 265, -175, 58, 244, 260, 'fusta')}
      ${box3(-265, 265, 40, 56, 244, 260, 'fusta')}
      ${box3(-265, 265, -48, -30, 244, 258, 'fusta')}
    </g>`;

    // Plegador d'ordit posterior + calada inferior + ressalt lluminós
    s += `<g data-part="ordit">
      ${cylX3(-226, 226, -175, 148, 22, 'url(#tx-cotobob)', '#efe5cd', 1.5)}
      ${cylX3(226, 244, -175, 148, 9, '#656e75', '#464d53', 1.2)}
      <polygon id="cw-shed-glow" points="" fill="#fff3b8" opacity=".42"/>
      <g id="cw-warp-low"></g>
    </g>`;

    // Eix de lleves (Y=-38, Z=50), lleves excèntriques sota els lliços i rodets seguidors
    s += `<g data-part="eix">
      ${line3([-250, -38, 50], [268, -38, 50], INK, 9)}
      ${line3([-250, -38, 50], [268, -38, 50], '#7c878e', 5.5)}
      <g id="cw-cams"></g>
    </g>`;

    // Lliços accionats des de baix per les lleves i enllaçats dalt pel balancí
    s += `<g data-part="llicos" id="cw-heddles"></g>`;

    // Batà basculant amb pinta metàl·lica i caixes laterals
    s += `<g data-part="pinta" id="cw-batten"></g>`;

    // Trama activa + barqueta llançadora mecànica (dins la calada)
    s += `<g data-part="llancadora">
      <g id="cw-active-weft"></g>
      <g id="cw-shuttle">${shuttle3HTML()}</g>
    </g>`;

    // Fils superiors de l'ordit (passen PER DAMUNT de la llançadora!)
    s += `<g data-part="ordit" id="cw-warp-up" pointer-events="none"></g>`;

    // Tela teixida, plegador frontal i bastidor davanter rebaixat
    s += `<g data-part="tela">
      <g id="cw-cloth"></g>
      ${cylX3(-226, 226, 165, 86, 20, 'url(#tx-cotobob)', '#efe5cd', 1.5)}
      ${cylX3(226, 244, 165, 86, 8, '#d4a63a', '#9b731c', 1.2)}
    </g>`;
    s += `<g data-part="bastidor">
      ${box3(-265, -247, 155, 175, 0, 156, 'fustaf')}
      ${box3(247, 265, 155, 175, 0, 156, 'fustaf')}
      ${box3(-265, 265, 155, 173, 140, 152, 'fusta')}
    </g>`;

    // Espases impulsores mecàniques a totes dues bandes (al davant de les caixes perquè es vegin colpejar)
    s += `<g data-part="llancadora" id="cw-pickers"></g>`;

    // Eix principal (Y=-92, Z=72), reductor 2:1 i biela cap al batà al costat dret completament exposat
    s += `<g data-part="eix">
      ${line3([-250, -92, 72], [306, -92, 72], INK, 10)}
      ${line3([-250, -92, 72], [306, -92, 72], '#656e75', 6.5)}
      <g id="cw-gears"></g>
      ${badge(936, 482, 'Relació 2:1', '#6f4e28', '#fff')}
    </g>`;
    s += `<g data-part="pinta" id="cw-crank-rod"></g>`;

    // Transmissió motriu superior, corretja 3D tangent en el pla YZ i volant d'inèrcia al lateral dret
    const [topX, topY] = P3(290, -92, 276);
    const bA0 = P3(290, -92 - 23, 276), bA1 = P3(290, -92 - 46, 72);
    const bB0 = P3(290, -92 + 46, 72), bB1 = P3(290, -92 + 23, 276);
    const dBeltA = `M${f1(bA0[0])} ${f1(bA0[1])}L${f1(bA1[0])} ${f1(bA1[1])}`;
    const dBeltB = `M${f1(bB0[0])} ${f1(bB0[1])}L${f1(bB1[0])} ${f1(bB1[1])}`;
    s += `<g data-part="transmissio">
      ${line3([245, -92, 276], [322, -92, 276], '#474f56', 8)}
      ${discYZ3(290, -92, 276, 23, 14, '#deb47b', '#8d5d2e', 0.4, 4, 1.4)}
      <path d="${dBeltA}" stroke="${INK}" stroke-width="6.5" stroke-linecap="round" fill="none"/>
      <path d="${dBeltA}" stroke="#7a4e2c" stroke-width="4.2" stroke-linecap="round" fill="none"/>
      <path id="cw-belt-a" d="${dBeltA}" stroke="#e7cca0" stroke-width="2" stroke-dasharray="7 13" stroke-linecap="round" fill="none"/>
      <path d="${dBeltB}" stroke="${INK}" stroke-width="6.5" stroke-linecap="round" fill="none"/>
      <path d="${dBeltB}" stroke="#7a4e2c" stroke-width="4.2" stroke-linecap="round" fill="none"/>
      <path id="cw-belt-b" d="${dBeltB}" stroke="#e7cca0" stroke-width="2" stroke-dasharray="7 13" stroke-linecap="round" fill="none"/>
      <path d="M${f1(topX - 28)} ${f1(topY - 26)}A36 36 0 0 1 ${f1(topX + 30)} ${f1(topY - 12)}" fill="none" stroke="#b45309" stroke-width="2.5" stroke-dasharray="5 4" marker-end="url(#m-fl)"/>
      <g id="cw-flywheel"></g>
    </g>`;

    // Indicador compacte de les tres accions sincronitzades al buit superior esquerre
    s += `<g id="cw-steps" transform="translate(110, 108)"></g>`;

    return RI.svg(s, '95 96 965 492');
  }

  function animaCartwright() {
    return ({ p, el }) => {
      const s = S('cartwright', p);
      const beatNorm = (-82 - s.y) / 70;
      const beatY = 18 + beatNorm * 72; // 18 -> 90

      // Volant d'inèrcia i corretja animats
      el('cw-flywheel').innerHTML = discYZ3(290, -92, 72, 46, 10, '#7c878e', '#464d53', s.angle, 6, 1.4);
      const boff = (-s.angle * 52).toFixed(1);
      el('cw-belt-a').style.strokeDashoffset = boff;
      el('cw-belt-b').style.strokeDashoffset = boff;

      // Engranatge reductor 2:1 en perspectiva 3D al costat dret
      el('cw-gears').innerHTML =
        discYZ3(268, -38, 50, 34, 8, '#d4a63a', '#9b731c', s.camAngle + 0.14, 0, 1.2, 24) +
        discYZ3(268, -92, 72, 17, 9, '#f2d37a', '#9b731c', s.angle, 0, 1.2, 12);

      // Dues lleves excèntriques sota els lliços + rodets seguidors i varetes verticals
      const z1 = 148 + 26 * s.shed, z2 = 148 - 26 * s.shed;
      const scaleCamR = (r) => 22 + (r - 40) * 1.15;
      const camPoly3 = (cx, sign, fillF, fillR) => {
        const fPts = [], bPts = [];
        for (let i = 0; i < 40; i++) {
          const b = (Math.PI * 2 * i) / 40, a = b + s.camAngle;
          const rr = scaleCamR(RI.CARTWRIGHT_GEOMETRIA.camRadius(b, sign));
          const dy = rr * Math.cos(a), dz = rr * Math.sin(a);
          fPts.push(P3(cx + 4.5, -38 + dy, 50 + dz));
          bPts.push(P3(cx - 4.5, -38 + dy, 50 + dz));
        }
        let res = '';
        for (let i = 0; i < 40; i++) {
          const j = (i + 1) % 40;
          res += `<polygon points="${f1(bPts[i][0])},${f1(bPts[i][1])} ${f1(bPts[j][0])},${f1(bPts[j][1])} ${f1(fPts[j][0])},${f1(fPts[j][1])} ${f1(fPts[i][0])},${f1(fPts[i][1])}" fill="${fillR}" stroke="${INK}" stroke-width="0.7"/>`;
        }
        return res + poly3(fPts, fillF, 1.3);
      };
      const fol1Z = 50 + scaleCamR(40 + 11 * s.shed);
      const fol2Z = 50 + scaleCamR(40 - 11 * s.shed);
      const [f1x, f1y] = P3(186, -38, fol1Z);
      const [f2x, f2y] = P3(226, -38, fol2Z);
      el('cw-cams').innerHTML =
        camPoly3(186, 1, '#7c878e', '#464d53') +
        camPoly3(226, -1, '#98a1a8', '#525960') +
        line3([186, -38, fol1Z], [186, -58, z1 - 24], '#464d53', 4.2) +
        line3([226, -38, fol2Z], [226, -22, z2 - 24], '#464d53', 4.2) +
        `<circle cx="${f1(f1x)}" cy="${f1(f1y)}" r="5.5" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.2"/>` +
        `<circle cx="${f1(f2x)}" cy="${f1(f2y)}" r="5.5" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.2"/>`;

      // Lliços 3D i balancí superior oscil·lant (barra inferior arriba fins a X=232 per connectar amb les lleves fora dels fils)
      const heddleHTML = (y, zc, col) => {
        let h = box3(-212, 212, y - 3, y + 3, zc + 22, zc + 28, 'fusta', 1.1);
        h += box3(-212, 234, y - 3, y + 3, zc - 28, zc - 22, 'fusta', 1.1);
        for (let i = 0; i < 8; i++) {
          const hx = -182 + i * 52;
          const [cx, cy] = P3(hx, y, zc);
          h += line3([hx, y, zc - 22], [hx, y, zc + 22], col, 1.4);
          h += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="2.4" fill="#fffcf5" stroke="${col}" stroke-width="1.2"/>`;
        }
        return h;
      };
      const bal1 = 234 + (z1 - 148) * 0.25, bal2 = 234 + (z2 - 148) * 0.25;
      let heds = heddleHTML(-58, z1, '#2f6f68') + heddleHTML(-22, z2, '#b45309');
      for (const rx of [-120, 120]) {
        heds += line3([rx, -58, z1 + 28], [rx, -58, bal1], '#7a5c3a', 1.8);
        heds += line3([rx, -22, z2 + 28], [rx, -22, bal2], '#7a5c3a', 1.8);
        heds += line3([rx, -58, bal1], [rx, -22, bal2], '#8d5d2e', 5.5);
        const [bx, by] = P3(rx, -40, 234);
        heds += `<circle cx="${f1(bx)}" cy="${f1(by)}" r="4.5" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.2"/>`;
      }
      el('cw-heddles').innerHTML = heds;

      // Fils d'ordit en 3D i ressalt del túnel de la calada
      let up = '', low = '';
      for (let i = 0; i < 15; i++) {
        const x = -196 + i * 28, odd = i % 2 === 1;
        const yh = odd ? -58 : -22, zh = odd ? z1 : z2;
        const isUp = (odd && s.shed >= 0) || (!odd && s.shed < 0);
        const col = odd ? '#2f6f68' : '#b45309';
        const seg = line3([x, -175, 148], [x, yh, zh], col, odd ? 2.1 : 1.9) +
          line3([x, yh, zh], [x, 95, 148], col, odd ? 2.1 : 1.9);
        if (isUp) up += seg; else low += seg;
      }
      el('cw-warp-low').innerHTML = low;
      el('cw-warp-up').innerHTML = up;
      const glowPts = [P3(204, -175, 148), P3(204, s.shed >= 0 ? -58 : -22, Math.max(z1, z2)), P3(204, 95, 148), P3(204, s.shed >= 0 ? -22 : -58, Math.min(z1, z2))];
      el('cw-shed-glow').setAttribute('points', glowPts.map((pt) => `${f1(pt[0])},${f1(pt[1])}`).join(' '));
      el('cw-shed-glow').setAttribute('opacity', (0.48 * Math.abs(s.shed)).toFixed(2));

      // Batà penjant + pinta + caixes laterals
      const kickL = s.pickerLeft * 2.4, kickR = s.pickerRight * 2.4;
      el('cw-batten').innerHTML = batten3HTML(beatY, kickL, kickR);

      // Manovella i biela al costat dret empenyent la cama dreta del batà
      const crankY = -92 - 30 * Math.cos(s.angle), crankZ = 72 + 30 * Math.sin(s.angle);
      const batPinY = beatY + 4, batPinZ = 114;
      const [kx, ky] = P3(304, crankY, crankZ), [bx, by] = P3(254, batPinY, batPinZ);
      el('cw-crank-rod').innerHTML =
        line3([304, -92, 72], [304, crankY, crankZ], '#d4a63a', 6) +
        line3([304, crankY, crankZ], [254, batPinY, batPinZ], INK, 8.5) +
        line3([304, crankY, crankZ], [254, batPinY, batPinZ], '#8f98a0', 5.2) +
        `<circle cx="${f1(kx)}" cy="${f1(ky)}" r="5" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.2"/>` +
        `<circle cx="${f1(bx)}" cy="${f1(by)}" r="5" fill="url(#g-esf-llauto)" stroke="${INK}" stroke-width="1.2"/>`;

      // Espases impulsores mecàniques laterals (sense cordill ni mà!)
      const colL = s.pickerLeft > 1 ? '#d97706' : '#5a6269';
      const colR = s.pickerRight > 1 ? '#d97706' : '#5a6269';
      const [pLx, pLy] = P3(-324, beatY + 6, 48), [pRx, pRy] = P3(324, beatY + 6, 48);
      el('cw-pickers').innerHTML =
        line3([-324, beatY + 6, 48], [-312 + kickL, beatY + 6, 152], INK, 7.5) +
        line3([-324, beatY + 6, 48], [-312 + kickL, beatY + 6, 152], colL, 4.5) +
        line3([324, beatY + 6, 48], [312 - kickR, beatY + 6, 152], INK, 7.5) +
        line3([324, beatY + 6, 48], [312 - kickR, beatY + 6, 152], colR, 4.5) +
        `<circle cx="${f1(pLx)}" cy="${f1(pLy)}" r="5" fill="url(#g-esf-ferro)" stroke="${INK}" stroke-width="1.2"/>` +
        `<circle cx="${f1(pRx)}" cy="${f1(pRy)}" r="5" fill="url(#g-esf-ferro)" stroke="${INK}" stroke-width="1.2"/>`;

      // Llançadora en 3D dins la calada
      const sx3 = (s.x / 325) * 268;
      const [sx2, sy2] = P3(sx3, beatY + 5, 147);
      el('cw-shuttle').setAttribute('transform', `translate(${f1(sx2)} ${f1(sy2)})`);

      // Trames actives (+ fletxa direccional en el vol) i tela creixent
      let actW = '';
      if (s.weaving) {
        const dir = s.half === 0 ? 1 : -1;
        actW += line3([clamp(sx3 - dir * 68, -210, 210), beatY + 12, 162], [clamp(sx3 + dir * 48, -210, 210), beatY + 12, 162], '#d97706', 2.8, ' stroke-dasharray="5 4" marker-end="url(#m-fl)"');
      }
      s.wefts.forEach((w) => {
        const wy = w.y <= -150 ? 96 : beatY + 4;
        const xA = w.reverse ? 200 - 400 * w.amount : -200;
        const xB = w.reverse ? 200 : -200 + 400 * w.amount;
        if (xB > xA) actW += line3([xA, wy, 148], [xB, wy, 148], '#c84b31', 3.4);
      });
      el('cw-active-weft').innerHTML = actW;

      let cl = poly3([P3(-206, 95, 148), P3(206, 95, 148), P3(206, 165, 148), P3(-206, 165, 148)], 'url(#tx-tela)', 1.5);
      cl += poly3([P3(-206, 165, 148), P3(206, 165, 148), P3(206, 165, 92), P3(-206, 165, 92)], '#dfd1b3', 1.4);
      for (let i = 0; i < 15; i++) cl += line3([-196 + i * 28, 95, 148], [-196 + i * 28, 165, 148], '#cbbd9c', 1.1);
      for (let wy = 112; wy <= 156; wy += 11) cl += line3([-200, wy, 148], [200, wy, 148], '#d89b87', 1.8, ' opacity=".6"');
      el('cw-cloth').innerHTML = cl;

      // Indicador sincronitzat dels 3 temps automàtics
      const noms = ['1 · Calada (lleves)', '2 · Llançadora (impulsors)', '3 · Batuda (biela)'];
      let st = `<rect x="0" y="0" width="208" height="102" rx="11" fill="url(#tx-peça-fons)" stroke="#d6cbb5" stroke-width="1.4"/>
        <text x="104" y="18" text-anchor="middle" font-size="11.5" font-weight="800" fill="#6f4e28">Un eix coordina el cicle</text>`;
      noms.forEach((nom, i) => {
        const on = s.step === i;
        st += `<rect x="10" y="${25 + i * 24}" width="188" height="20" rx="10" fill="${on ? '#b9722a' : '#efe7d4'}" stroke="${on ? INK : '#d6cbb5'}" stroke-width="1.1"/>
          <text x="104" y="${39 + i * 24}" text-anchor="middle" font-size="10.8" font-weight="700" fill="${on ? '#fff' : '#6c655c'}">${nom}</text>`;
      });
      el('cw-steps').innerHTML = st;
    };
  }

  /* ==================== RENDERS BLENDER + HALOS + LUPA MACRO ==================== */
  const BLENDER_N = 28;
  const BLENDER_VER = '20261114-m2';
  const FRAME_CACHE = {};

  function precarregaFrames(id) {
    if (FRAME_CACHE[id]) return FRAME_CACHE[id];
    const arr = [];
    for (let i = 0; i < BLENDER_N; i++) {
      const im = new Image();
      im.src = `img/moviment/${id}-${String(i).padStart(2, '0')}.webp?v=${BLENDER_VER}`;
      arr.push(im);
    }
    FRAME_CACHE[id] = arr;
    return arr;
  }

  const BLENDER_SPEC = {
    llancadora: {
      lupa: [1066, 126, 673, 369, 'Lupa ×8 · Calada i passada'],
      parts: {
        ordit: [[634, 322, 114, 42]],
        llancadora: [[673, 369, 66, 36]],
        caixes: [[433, 315, 62, 42], [928, 362, 58, 40]],
        cordill: [[637, 319, 86, 36]],
        pinta: [[757, 348, 86, 40]],
        tela: [[523, 412, 128, 52]],
        bastidor: [[281, 223, 56, 72]],
        llicos: [[636, 279, 108, 36]]
      }
    },
    jenny: {
      lupa: [1066, 126, 540, 316, 'Lupa ×8 · Estiratge i torsió'],
      parts: {
        metxes: [[492, 467, 110, 46]],
        pinca: [[618, 344, 92, 40]],
        fusos: [[412, 285, 96, 54]],
        roda: [[612, 453, 84, 84]],
        corda: [[460, 459, 68, 36]],
        bastidor: [[499, 399, 96, 48]]
      }
    },
    water: {
      lupa: [1066, 126, 650, 290, 'Lupa ×10 · Corrons i aleta'],
      parts: {
        metxa: [[652, 172, 118, 46]],
        corrons: [[674, 251, 118, 42]],
        engranatges: [[802, 278, 54, 48]],
        aleta: [[566, 420, 128, 56]],
        aigua: [[370, 454, 96, 56]],
        bastidor: [[710, 385, 68, 88]]
      }
    },
    mula: {
      lupa: [1066, 126, 525, 382, 'Lupa ×8 · Estiratge fi i torsió'],
      parts: {
        fileta: [[326, 211, 132, 62]],
        corrons: [[359, 369, 118, 42]],
        carro: [[678, 599, 146, 52]],
        fus: [[684, 393, 128, 48]],
        bastidor: [[193, 400, 62, 86]],
        roda: [[325, 451, 86, 86]]
      }
    },
    cartwright: {
      lupa: [1066, 126, 606, 362, 'Lupa ×8 · Batuda i lleves 2:1'],
      parts: {
        transmissio: [[863, 485, 76, 84]],
        eix: [[748, 534, 88, 54]],
        llicos: [[618, 280, 110, 42]],
        llancadora: [[586, 362, 66, 36]],
        pinta: [[713, 350, 96, 42]],
        ordit: [[607, 317, 118, 42]],
        tela: [[478, 388, 126, 54]],
        bastidor: [[551, 192, 92, 66]]
      }
    }
  };

  function pintaLupaBlender(id, p, s) {
    let body = `<rect x="-74" y="-74" width="148" height="148" fill="#f7f0df"/>`;
    if (id === 'jenny') {
      const tw = clamp(0.25 + 0.95 * (p < 0.70 ? clamp(p / 0.70, 0, 1) : 1), 0.25, 1.3);
      const xJoin = lerp(-12, 22, s.draw);
      const thick = lerp(6.8, 3.0, s.draw);
      body += fibresHTML(-62, 6, xJoin, 6, lerp(28, 13, s.draw), thick + 4, s.draw * 0.7);
      body += filTorcutHTML(xJoin, 6, 62, 6, s.spindleAngle * 0.45, tw, thick);
      body += `<rect x="${f1(-58 + s.draw * 16)}" y="-22" width="12" height="56" rx="4" fill="#8d5d2e" stroke="${INK}" stroke-width="1.5"/>`;
      body += `<text x="0" y="-36" text-anchor="middle" font-size="9" font-weight="800" fill="#6f4e28">${p < 0.52 ? 'Pinça: estira i torça' : 'Fil-guia: plega al fus'}</text>`;
    } else if (id === 'water') {
      const spd = p * Math.PI * 16;
      const xs = [-44, -8, 28];
      xs.forEach((cx, i) => {
        body += `<circle cx="${cx}" cy="-14" r="11" fill="#464c52" stroke="${INK}" stroke-width="1.6"/>`;
        body += `<circle cx="${cx}" cy="16" r="11" fill="#9ca4ab" stroke="${INK}" stroke-width="1.6"/>`;
        const a = spd * [1, 1.6, 3.2][i];
        body += `<line x1="${f1(cx + 7 * Math.cos(a))}" y1="${f1(16 + 7 * Math.sin(a))}" x2="${f1(cx - 7 * Math.cos(a))}" y2="${f1(16 - 7 * Math.sin(a))}" stroke="#d97706" stroke-width="2.2"/>`;
        body += `<text x="${cx}" y="-30" text-anchor="middle" font-size="9.5" font-weight="800" fill="#51473b">${['1×', '1,6×', '3,2×'][i]}</text>`;
      });
      body += fibresHTML(-64, 1, -8, 1, 20, 10, (p * 4) % 1);
      body += fibresHTML(-8, 1, 28, 1, 10, 5.2, (p * 6.4) % 1);
      body += filTorcutHTML(28, 1, 66, 1, spd * 1.4, 1.15, 3.3);
      body += `<text x="0" y="38" text-anchor="middle" font-size="9" font-weight="800" fill="#6f4e28">Estiratge → aleta</text>`;
    } else if (id === 'mula') {
      const afterDraft = p >= 0.36 && p < 0.56;
      const mDraw = clamp(0.75 * s.fed + 0.25 * s.last, 0, 1);
      const wStart = lerp(24, 9, mDraw);
      const thick = afterDraft ? 2.5 : lerp(5.8, 3.2, mDraw);
      body += `<circle cx="-46" cy="-12" r="9" fill="#464c52" stroke="${INK}" stroke-width="1.4"/><circle cx="-46" cy="14" r="9" fill="#9ca4ab" stroke="${INK}" stroke-width="1.4"/>`;
      body += fibresHTML(-46, 2, -6, 2, wStart, thick + 3.5, mDraw * 0.9);
      body += filTorcutHTML(-6, 2, 62, 2, s.spindleAngle * 0.45, afterDraft ? 1.45 : 0.95, thick);
      body += `<text x="0" y="-36" text-anchor="middle" font-size="9" font-weight="800" fill="${afterDraft ? '#9e2d18' : '#6f4e28'}">${afterDraft ? 'Corrons aturats: fi!' : p < 0.36 ? 'Carro surt: estira' : 'Retorn: plega al fus'}</text>`;
    } else {
      const shed = s.shed != null ? s.shed : Math.sin(p * Math.PI * 2);
      const shxNorm = s.x != null ? s.x / 325 : Math.sin(p * Math.PI * 2);
      const shx = clamp(shxNorm, -1, 1) * 46;
      const beatVal = s.beat1 != null ? Math.max(s.beat1, s.beat2) : clamp((-(s.y != null ? s.y : -82) - 82) / 70, 0, 1);
      const reedX = lerp(42, -16, beatVal);
      body += `<rect x="-66" y="-28" width="44" height="56" rx="4" fill="#ebe0c7" stroke="#9e8e70" stroke-width="1.2"/>`;
      for (let k = -22; k <= 22; k += 8) {
        body += `<line x1="-64" y1="${k}" x2="-24" y2="${k}" stroke="#b8422b" stroke-width="2.2" opacity=".72"/>`;
      }
      const dyS = shed * 18;
      body += `<line x1="-22" y1="0" x2="64" y2="${f1(-dyS)}" stroke="#5c4732" stroke-width="2"/><line x1="-22" y1="0" x2="64" y2="${f1(dyS)}" stroke="#9c7e5a" stroke-width="2"/>`;
      body += `<line x1="-22" y1="0" x2="${f1(shx)}" y2="0" stroke="#c23b22" stroke-width="3.2" stroke-linecap="round"/>`;
      body += `<g transform="translate(${f1(shx)}, 0)"><polygon points="-16,0 -8,-6 8,-6 16,0 8,6 -8,6" fill="#6d4323" stroke="${INK}" stroke-width="1.3"/><rect x="-6" y="-2.5" width="12" height="5" rx="2" fill="#d9482b"/></g>`;
      body += `<line x1="${f1(reedX)}" y1="-34" x2="${f1(reedX)}" y2="34" stroke="#39444d" stroke-width="3.5" stroke-dasharray="4 3"/>`;
      body += `<text x="0" y="-36" text-anchor="middle" font-size="8.8" font-weight="800" fill="#6f4e28">${id === 'cartwright' ? 'Lleva 2:1 bat la trama' : 'Calada i vol de trama'}</text>`;
    }
    return body;
  }

  function svgBlenderMachine(id) {
    precarregaFrames(id);
    const sp = BLENDER_SPEC[id];
    const [lx, ly, ax, ay, lbl] = sp.lupa;
    let halos = '';
    for (const [part, list] of Object.entries(sp.parts)) {
      halos += `<g data-part="${part}">`;
      for (const [cx, cy, rx, ry] of list) {
        halos += `<ellipse class="tx-3d-halo" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
      }
      halos += `</g>`;
    }
    const inner = `
      <image id="tx-frame-bg" x="0" y="0" width="1200" height="760" href="img/moviment/${id}-00.webp?v=${BLENDER_VER}" preserveAspectRatio="xMidYMid slice"/>
      ${halos}
      <g id="tx-lupa" transform="translate(${lx}, ${ly})">
        <line x1="-58" y1="44" x2="${f1(ax - lx)}" y2="${f1(ay - ly)}" stroke="#b45309" stroke-width="2.4" stroke-dasharray="6 5" opacity=".82"/>
        <circle cx="${f1(ax - lx)}" cy="${f1(ay - ly)}" r="7" fill="rgba(217,119,6,.35)" stroke="#b45309" stroke-width="2"/>
        <circle cx="0" cy="0" r="72" fill="#fffdf7" stroke="#8d5d2e" stroke-width="5.5"/>
        <clipPath id="clip-lupa-${id}"><circle cx="0" cy="0" r="68"/></clipPath>
        <g id="tx-lupa-body" clip-path="url(#clip-lupa-${id})"></g>
        <circle cx="0" cy="0" r="68" fill="none" stroke="rgba(46,34,26,.22)" stroke-width="1.5"/>
        <rect x="-86" y="62" width="172" height="24" rx="12" fill="#6f4e28" stroke="#fffdf7" stroke-width="1.5"/>
        <text x="0" y="78" text-anchor="middle" font-size="11.2" font-weight="800" fill="#fff">${lbl}</text>
      </g>`;
    return RI.svg(inner, '0 0 1200 760').replace('class="esc"', 'class="esc tx3"');
  }

  function animaBlenderMachine(id) {
    let lastFrame = -1;
    return ({ p, el }) => {
      precarregaFrames(id);
      const idx = Math.floor((((p % 1) + 1) % 1) * BLENDER_N) % BLENDER_N;
      if (idx !== lastFrame) {
        lastFrame = idx;
        const bg = el('tx-frame-bg');
        if (bg) bg.setAttribute('href', `img/moviment/${id}-${String(idx).padStart(2, '0')}.webp?v=${BLENDER_VER}`);
      }
      const lupaEl = el('tx-lupa-body');
      if (lupaEl) lupaEl.innerHTML = pintaLupaBlender(id, p, S(id, p));
    };
  }

  /* ==================== REGISTRE D'ESCENES, ETIQUETES I SORTIDA ==================== */
  const BUILDERS = {
    roda: svgRoda,
    llancadora: () => svgBlenderMachine('llancadora'),
    jenny: () => svgBlenderMachine('jenny'),
    water: () => svgBlenderMachine('water'),
    mula: () => svgBlenderMachine('mula'),
    cartwright: () => svgBlenderMachine('cartwright')
  };
  const ANIMATORS = {
    roda: animaRoda(),
    llancadora: animaBlenderMachine('llancadora'),
    jenny: animaBlenderMachine('jenny'),
    water: animaBlenderMachine('water'),
    mula: animaBlenderMachine('mula'),
    cartwright: animaBlenderMachine('cartwright')
  };

  /* Etiquetes posicionades amb precisió sobre els renders 1200×760. */
  const ETIQUETES = {
    roda: [
      ['roda', 935, 130, 880, 175],
      ['corretja', 588, 138, 588, 224],
      ['fus', 292, 198, 292, 304],
      ['fibra', 108, 185, 108, 290],
      ['bastidor', 540, 520, 540, 466]
    ],
    llancadora: [
      ['ordit', 775, 118, 634, 322],
      ['llicos', 495, 118, 636, 279],
      ['caixes', 195, 290, 433, 315],
      ['llancadora', 690, 575, 673, 369],
      ['pinta', 980, 355, 757, 348],
      ['cordill', 310, 148, 637, 319],
      ['tela', 270, 565, 523, 412],
      ['bastidor', 165, 185, 281, 223]
    ],
    jenny: [
      ['metxes', 225, 590, 492, 467],
      ['pinca', 765, 175, 618, 344],
      ['fusos', 225, 175, 412, 285],
      ['corda', 395, 635, 460, 459],
      ['roda', 845, 545, 612, 453],
      ['bastidor', 845, 365, 499, 399]
    ],
    water: [
      ['metxa', 415, 112, 652, 172],
      ['corrons', 875, 228, 674, 251],
      ['engranatges', 965, 310, 802, 278],
      ['aleta', 255, 355, 566, 420],
      ['aigua', 195, 525, 370, 454],
      ['bastidor', 895, 495, 710, 385]
    ],
    mula: [
      ['fileta', 175, 128, 326, 211],
      ['corrons', 155, 285, 359, 369],
      ['carro', 865, 625, 678, 599],
      ['fus', 885, 395, 684, 393],
      ['roda', 185, 615, 325, 451],
      ['bastidor', 110, 415, 193, 400]
    ],
    cartwright: [
      ['transmissio', 1020, 470, 863, 485],
      ['eix', 935, 625, 748, 534],
      ['llicos', 495, 118, 618, 280],
      ['llancadora', 645, 645, 586, 362],
      ['pinta', 975, 345, 713, 350],
      ['ordit', 785, 125, 607, 317],
      ['tela', 235, 515, 478, 388],
      ['bastidor', 265, 145, 551, 192]
    ]
  };

  const SORTIDA = {
    roda: () => 'Fibres soltes → fil torçut → fil recollit',
    jenny: () => 'Una roda, múltiples fusos: tots els fils alhora',
    water: () => 'Quatre caps filant en continu amb força hidràulica',
    mula: () => 'Corrons i carro mòbil coordinats: 24 fusos fins',
    llancadora: (s) => (s.rows === 1 ? '1 passada incorporada a la tela' : s.rows + ' passades incorporades a la tela'),
    cartwright: (s) => (s.rows === 1 ? '1 passada incorporada a la tela' : s.rows + ' passades incorporades a la tela')
  };

  function svg(id) {
    return BUILDERS[id]();
  }
  function anima(id) {
    const fn = ANIMATORS[id];
    return (ctx) => {
      fn(ctx);
      const estat = RI.TEXTIL_ESTATS[id];
      if (!estat) return;
      const s = estat(ctx.p);
      const action = document.querySelector('#tx-action');
      const product = document.querySelector('#tx-product');
      if (action && action.textContent !== s.action) action.textContent = s.action;
      const out = (SORTIDA[id] || (() => ''))(s);
      if (product && product.textContent !== out) product.textContent = out;
    };
  }

  const MODELS = {
    roda: 'Roda manual de fus · tall lateral animat',
    llancadora: 'Llançadora volant de Kay · seqüència 3D real i lupa macro',
    jenny: 'Spinning Jenny (Lowry) · seqüència 3D real i lupa macro',
    water: 'Water Frame d’Arkwright · seqüència 3D real i lupa macro',
    mula: 'Mula de Crompton (24 fusos) · seqüència 3D real i lupa macro',
    cartwright: 'Teler mecànic de Cartwright · seqüència 3D real i lupa macro'
  };

  RI.TEXTIL_DIBUIX = { svg, anima, ETIQUETES, MODELS };
})();

// SPDX-License-Identifier: AGPL-3.0-or-later
/* La Revolució Industrial — materials realistes per als esquemes animats.
   Genera un sol cop unes textures procedurals (fusta, maó, pedra, roca, coure, llautó, ferro...)
   i ofereix peces de dibuix amb volum: sòlids texturats, reblons, cadenes, foc i figures. */
(function () {
  'use strict';
  const RI = window.RI;
  const lerp = (a, b, k) => a + (b - a) * k;
  const f1 = (n) => Math.round(n * 10) / 10;
  const INK = '#2e221a';

  /* ---------- soroll periòdic: les textures es poden repetir sense costures ---------- */
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
  const vn = (x, y, px, py, s) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const h = (a, b) => hash(((a % px) + px) % px, ((b % py) + py) % py, s);
    return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
  };
  const fbm = (x, y, px, py, s) => vn(x, y, px, py, s) * 0.5 + vn(x * 2, y * 2, px * 2, py * 2, s + 1) * 0.3 + vn(x * 4, y * 4, px * 4, py * 4, s + 2) * 0.2;
  const TEX = {};
  function textura(nom, w, h, fn) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const p = fn(x, y), i = (y * w + x) * 4; d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; d[i + 3] = 255; }
    g.putImageData(im, 0, 0);
    let url = c.toDataURL('image/jpeg', 0.9);
    try { const b = atob(url.split(',')[1]), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); url = URL.createObjectURL(new Blob([a], { type: 'image/jpeg' })); } catch (e) { /* es queda com a data URL */ }
    TEX[nom] = { url, w, h };
  }
  const k3 = (c, k) => [Math.min(255, c[0] * k), Math.min(255, c[1] * k), Math.min(255, c[2] * k)];
  const fusta = (base, s) => (x, y) => {
    const n = fbm((x / 256) * 3, (y / 256) * 34, 3, 34, s), fi = vn((x / 256) * 10, (y / 256) * 128, 10, 128, s + 7), veta = Math.abs(Math.sin(y * 0.19 + n * 9));
    return k3(base, 0.74 + 0.4 * n + 0.1 * (fi - 0.5) - (veta < 0.1 ? 0.12 : 0));
  };
  const metall = (base, s, clap, gra) => (x, y) => k3(base, 1 - clap / 2 + clap * fbm((x / 256) * 4, (y / 256) * 4, 4, 4, s) + gra * (vn((x / 256) * 96, (y / 256) * 96, 96, 96, s + 5) - 0.5));
  function fesTextures() {
    textura('fusta', 256, 256, fusta([168, 108, 58], 11));
    textura('fustaf', 256, 256, fusta([118, 76, 42], 23));
    textura('fustac', 256, 256, fusta([204, 156, 100], 37));
    textura('fustag', 256, 256, fusta([228, 180, 60], 43));
    const maons = [[178, 84, 56], [196, 100, 66], [160, 72, 50], [204, 118, 80], [150, 66, 48], [186, 92, 60]];
    textura('mao', 264, 192, (x, y) => {
      const fila = Math.floor(y / 16), xx = (x + (fila % 2 ? 22 : 0)) % 264, col = Math.floor(xx / 44), lx = xx - col * 44, ly = y - fila * 16;
      const gra = vn((x / 264) * 90, (y / 192) * 66, 90, 66, 3);
      if (lx < 2.4 || ly < 2.4) return k3([206, 194, 172], 0.86 + 0.2 * gra);
      const c = maons[Math.floor(hash(col, fila, 9) * 6)], bisell = ly < 4.5 ? 1.1 : ly > 13.5 ? 0.84 : 1;
      return k3(c, (0.86 + 0.26 * fbm((x / 264) * 12, (y / 192) * 9, 12, 9, 4) + 0.1 * (gra - 0.5)) * bisell);
    });
    textura('pedra', 256, 128, (x, y) => {
      const fila = Math.floor(y / 32), xx = (x + (fila % 2 ? 32 : 0)) % 256, col = Math.floor(xx / 64), lx = xx - col * 64, ly = y - fila * 32;
      const n = fbm((x / 256) * 10, (y / 128) * 5, 10, 5, 13), gra = vn((x / 256) * 110, (y / 128) * 55, 110, 55, 14);
      if (lx < 2 || ly < 2) return k3([126, 114, 96], 0.9 + 0.15 * gra);
      return k3([190, 177, 152], (0.8 + 0.2 * hash(col, fila, 15)) * (0.84 + 0.26 * n + 0.1 * (gra - 0.5)) * (ly < 4 ? 1.07 : ly > 29 ? 0.88 : 1));
    });
    textura('roca', 256, 256, (x, y) => {
      const n = fbm((x / 256) * 5, (y / 256) * 5, 5, 5, 21), r = Math.abs(fbm((x / 256) * 7, (y / 256) * 7, 7, 7, 25) - 0.5), gra = vn((x / 256) * 100, (y / 256) * 100, 100, 100, 27);
      return k3([150, 134, 112], 0.8 + 0.3 * n + 0.1 * (gra - 0.5) - (r < 0.012 ? 0.1 : 0));
    });
    textura('terra', 256, 256, (x, y) => {
      const n = fbm((x / 256) * 6, (y / 256) * 6, 6, 6, 31), p = vn((x / 256) * 34, (y / 256) * 34, 34, 34, 33), gra = vn((x / 256) * 120, (y / 256) * 120, 120, 120, 35);
      return k3([128, 98, 66], 0.74 + 0.36 * n + 0.14 * (gra - 0.5) + (p > 0.86 ? 0.2 : p < 0.1 ? -0.16 : 0));
    });
    textura('coure', 256, 256, metall([204, 122, 70], 41, 0.3, 0.07));
    textura('llauto', 256, 256, metall([206, 166, 68], 51, 0.2, 0.06));
    textura('ferro', 256, 256, metall([84, 90, 97], 61, 0.26, 0.09));
    textura('acer', 256, 256, metall([156, 164, 172], 71, 0.18, 0.07));
    textura('plom', 256, 256, metall([128, 132, 134], 81, 0.2, 0.06));
    textura('herba', 256, 256, (x, y) => { const n = fbm((x / 256) * 8, (y / 256) * 8, 8, 8, 91), g = vn((x / 256) * 80, (y / 256) * 120, 80, 120, 93); return k3([118, 156, 76], 0.76 + 0.34 * n + 0.2 * (g - 0.5)); });
    textura('carbo', 192, 192, (x, y) => { const n = fbm((x / 192) * 9, (y / 192) * 9, 9, 9, 97), g = vn((x / 192) * 40, (y / 192) * 40, 40, 40, 99); return k3([52, 48, 46], 0.6 + 0.7 * n + (g > 0.8 ? 0.7 : 0)); });
    textura('cuir', 128, 128, metall([122, 82, 50], 101, 0.24, 0.12));
  }
  try { fesTextures(); } catch (e) { /* sense canvas: els patrons queden buits i es veu el color de reserva */ }
  RI.TEX = TEX;

  /* ---------- definicions SVG ---------- */
  const ESC = { mao: 0.56, pedra: 0.62, roca: 1.5, fusta: 0.8, fustaf: 0.8, fustac: 0.8, fustag: 0.8, terra: 0.9, coure: 0.8, llauto: 0.6, ferro: 0.6, acer: 0.6, plom: 0.6, herba: 0.7, carbo: 0.5, cuir: 0.6 };
  const patrons = Object.keys(TEX).map((n) => { const t = TEX[n], k = ESC[n] || 1; return `<pattern id="tx-${n}" width="${t.w}" height="${t.h}" patternUnits="userSpaceOnUse" patternTransform="scale(${k})"><image href="${t.url}" width="${t.w}" height="${t.h}" preserveAspectRatio="none"/></pattern><pattern id="tx-${n}-v" width="${t.w}" height="${t.h}" patternUnits="userSpaceOnUse" patternTransform="rotate(90) scale(${k})"><image href="${t.url}" width="${t.w}" height="${t.h}" preserveAspectRatio="none"/></pattern>`; }).join('');
  const g = (id, x2, y2, stops) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
  const CIL = [[0, '#000', 0.5], [0.1, '#000', 0.2], [0.3, '#fff', 0.38], [0.48, '#fff', 0], [0.78, '#000', 0.2], [1, '#000', 0.58]];
  RI.MATS = `<defs>${patrons}
  ${g('sh-cil', 1, 0, CIL)}${g('sh-tub', 0, 1, CIL)}
  ${g('sh-pla', 0, 1, [[0, '#fff', 0.14], [0.45, '#fff', 0], [1, '#000', 0.24]])}
  ${g('sh-llum', 1, 0, [[0, '#fff', 0.16], [0.5, '#fff', 0], [1, '#000', 0.3]])}
  ${g('sh-fosc', 0, 1, [[0, '#000', 0.55], [1, '#000', 0.2]])}
  ${g('sh-pou', 0, 1, [[0, '#000', 0.25], [1, '#000', 0.78]])}
  <radialGradient id="sh-cup" cx=".34" cy=".26" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
  <radialGradient id="sh-bola" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
  <radialGradient id="g-brasa" cx=".5" cy=".85" r=".8"><stop offset="0" stop-color="#fff7c2"/><stop offset=".35" stop-color="#ffb23a"/><stop offset=".75" stop-color="#e2551f"/><stop offset="1" stop-color="#7a2410"/></radialGradient>
  <radialGradient id="g-resplendor" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb23a" stop-opacity=".75"/><stop offset=".5" stop-color="#ff8a2a" stop-opacity=".3"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-vinyeta" cx=".5" cy=".42" r=".75"><stop offset=".5" stop-color="#fbf6ea"/><stop offset="1" stop-color="#eadfc8"/></radialGradient>
  <linearGradient id="g-aiguat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0ee" stop-opacity=".88"/><stop offset="1" stop-color="#1f6ea6" stop-opacity=".94"/></linearGradient>
  <linearGradient id="g-flama" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff3a6"/><stop offset=".35" stop-color="#ffb02e"/><stop offset=".8" stop-color="#e2501f"/><stop offset="1" stop-color="#b7361a" stop-opacity=".6"/></linearGradient>
  <radialGradient id="g-esf-llauto" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#fff3bf"/><stop offset=".3" stop-color="#dcb548"/><stop offset=".75" stop-color="#9a7620"/><stop offset="1" stop-color="#5e4610"/></radialGradient>
  <radialGradient id="g-esf-ferro" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#dfe6ea"/><stop offset=".3" stop-color="#8d979e"/><stop offset=".75" stop-color="#4a5258"/><stop offset="1" stop-color="#23282c"/></radialGradient>
  <pattern id="p-seccio" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#2e221a" stroke-width="1.1" stroke-opacity=".5"/></pattern>
  <filter id="f-boira" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.2"/></filter>
  <filter id="f-difus" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
  <filter id="f-suau" x="-10%" y="-10%" width="120%" height="130%"><feGaussianBlur stdDeviation="1.1"/></filter>
  <filter id="f-projecta" x="-15%" y="-15%" width="130%" height="140%"><feDropShadow dx="3" dy="5" stdDeviation="4" flood-color="#2e221a" flood-opacity=".28"/></filter>
</defs>`;

  /* ---------- peces de dibuix ---------- */
  /* sòlid: una forma (p. ex. 'rect x="0" y="0" width="9" height="9"' o 'path d="..."') amb textura, volum i vora fina */
  RI.sol = (f, tex, sh, o = {}) => `<g ${o.attr || ''}><${f} fill="url(#tx-${tex})"/>${o.tint ? `<${f} fill="${o.tint}" opacity="${o.to || 0.3}"/>` : ''}${sh ? `<${f} fill="url(#sh-${sh})"/>` : ''}<${f} class="vora"${o.vora ? ` style="stroke-width:${o.vora}"` : ''}/></g>`;
  RI.caixa = (x, y, w, h, tex, sh, o = {}) => RI.sol(`rect x="${x}" y="${y}" width="${w}" height="${h}"${o.rx ? ` rx="${o.rx}"` : ''}`, tex, sh, o);
  RI.cami = (d, tex, sh, o) => RI.sol(`path d="${d}"`, tex, sh, o);
  /* tub o barra entre dos punts, amb gruix i lluïssor al llarg */
  RI.tub = (d, gruix, c, o = {}) => { const [fosc, mig, clar] = { coure: ['#7a3d1b', '#c8743c', '#f6c79a'], llauto: ['#7c5a14', '#c9a03a', '#f7e3a0'], ferro: ['#22272b', '#5a6269', '#b3bcc3'], plom: ['#4d5153', '#8d9294', '#d5d9da'], fusta: ['#5b3718', '#a66c38', '#dcae78'] }[c || 'coure']; return `<g ${o.attr || ''} fill="none" stroke-linejoin="round" stroke-linecap="${o.cap || 'butt'}"><path d="${d}" stroke="${INK}" stroke-width="${gruix + 2.6}"/><path d="${d}" stroke="${fosc}" stroke-width="${gruix}"/><path d="${d}" stroke="${mig}" stroke-width="${f1(gruix * 0.62)}"/><path d="${d}" stroke="${clar}" stroke-width="${f1(gruix * 0.2)}" stroke-opacity=".85"/></g>`; };
  /* brida o maneguet d'unió d'un tub */
  RI.brida = (x, y, w, h, c) => `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${w}" height="${h}" rx="2" fill="${c === 'ferro' ? '#4b5258' : c === 'coure' ? '#b5652f' : '#c9a03a'}" class="vora2"/><rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${w}" height="${h}" rx="2" fill="url(#sh-${w > h ? 'tub' : 'cil'})"/>`;
  /* filera de reblons o cargols */
  RI.reblons = (x1, y1, x2, y2, n, r, c) => { let s = ''; for (let i = 0; i < n; i++) { const k = n > 1 ? i / (n - 1) : 0.5, x = lerp(x1, x2, k), y = lerp(y1, y2, k); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r || 2.6}" fill="${c || '#8a4a22'}" stroke="${INK}" stroke-width=".8"/><circle cx="${f1(x - 0.8)}" cy="${f1(y - 0.8)}" r="${f1((r || 2.6) * 0.38)}" fill="#fff" opacity=".6"/>`; } return s; };
  /* cadena vertical animable: dues línies amb el mateix id-base (id i id+'b') */
  RI.cadena = (id, x, y1, y2) => `<line id="${id}" x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#30353a" stroke-width="8" stroke-dasharray="11 6" stroke-linecap="round"/><line id="${id}b" x1="${x}" y1="${y1 + 8.5}" x2="${x}" y2="${y2}" stroke="#8c959c" stroke-width="3" stroke-dasharray="6 11" stroke-linecap="round"/>`;
  /* foc: brases, flames amb moviment i resplendor */
  RI.brasa = (x, y, w, h, o = {}) => {
    const fl = (cx, ww, hh, d, op) => `<path class="flama2" style="animation-delay:${d}s;transform-origin:${f1(cx)}px ${y}px" d="M${f1(cx - ww / 2)} ${y}C${f1(cx - ww / 2)} ${f1(y - hh * 0.45)} ${f1(cx - ww * 0.2)} ${f1(y - hh * 0.55)} ${f1(cx - ww * 0.05)} ${f1(y - hh)}C${f1(cx + ww * 0.3)} ${f1(y - hh * 0.6)} ${f1(cx + ww / 2)} ${f1(y - hh * 0.4)} ${f1(cx + ww / 2)} ${y}Z" fill="url(#g-flama)" opacity="${op}"/>`;
    let s = `<ellipse cx="${x}" cy="${f1(y - h * 0.3)}" rx="${f1(w * 0.75)}" ry="${f1(h * 0.9)}" fill="url(#g-resplendor)" class="pampallugueja"/>`;
    const n = o.n || Math.max(3, Math.round(w / 22));
    for (let i = 0; i < n; i++) { const cx = x - w / 2 + (w * (i + 0.5)) / n; s += fl(cx, (w / n) * 1.5, h * (0.7 + 0.3 * ((i * 7) % 3) / 2), -i * 0.23, 0.95) + fl(cx + 3, (w / n) * 0.8, h * 0.5, -i * 0.31 - 0.4, 0.9); }
    for (let i = 0; i < n + 2; i++) { const cx = x - w / 2 + (w * i) / (n + 1); s += `<ellipse cx="${f1(cx)}" cy="${f1(y - 3 + (i % 2) * 2)}" rx="${f1(w / n / 2.2)}" ry="6" fill="${i % 3 ? '#3a2a22' : '#7a2e14'}" stroke="${INK}" stroke-width=".8"/><ellipse cx="${f1(cx - 1)}" cy="${f1(y - 5 + (i % 2) * 2)}" rx="${f1(w / n / 4)}" ry="2" fill="#ff9a2e" opacity=".8"/>`; }
    return `<g class="foc2">${s}</g>`;
  };
  /* roda de raigs amb textura (ferro colat o fusta); pensada per girar dins d'un grup */
  RI.rodaR = (cx, cy, r, o = {}) => {
    const n = o.raigs || 8, gr = o.gruix || Math.max(6, r * 0.13), tex = o.tex || 'ferro', w1 = o.raig || Math.max(4, r * 0.085), ri = r - gr, rh = o.boto || Math.max(7, r * 0.17);
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI) / n, c = Math.cos(a), si = Math.sin(a), px = -si, py = c;
      const p = (rr, ww) => `${f1(cx + c * rr + px * ww)} ${f1(cy + si * rr + py * ww)}`;
      s += `<path d="M${p(rh * 0.7, w1)}L${p(ri + 1, w1 * 0.62)}L${p(ri + 1, -w1 * 0.62)}L${p(rh * 0.7, -w1)}Z" fill="url(#tx-${tex})" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><path d="M${p(rh, w1 * 0.3)}L${p(ri, w1 * 0.2)}" stroke="#fff" stroke-opacity=".28" stroke-width="1.4"/>`;
    }
    return `<g ${o.attr || ''}>${s}<circle cx="${cx}" cy="${cy}" r="${f1(r - gr / 2)}" fill="none" stroke="url(#tx-${tex})" stroke-width="${f1(gr)}"/><circle cx="${cx}" cy="${cy}" r="${f1(r - gr * 0.22)}" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="${f1(gr * 0.22)}"/><circle cx="${cx}" cy="${cy}" r="${f1(ri + gr * 0.16)}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="${f1(gr * 0.22)}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="${f1(ri)}" fill="none" stroke="${INK}" stroke-width="1.3"/><circle cx="${cx}" cy="${cy}" r="${f1(rh)}" fill="url(#tx-${o.botoTex || tex})" stroke="${INK}" stroke-width="1.4"/><circle cx="${cx}" cy="${cy}" r="${f1(rh)}" fill="url(#sh-bola)"/><circle cx="${cx}" cy="${cy}" r="${f1(rh * 0.36)}" fill="url(#g-esf-${o.pern || 'llauto'})" stroke="${INK}" stroke-width="1"/>${o.extra || ''}</g>`;
  };
  /* engranatge amb textura i dents trapezoïdals */
  RI.engranatgeR = (cx, cy, r, n, o = {}) => {
    const h = o.dent || r * 0.17, pts = [], tex = o.tex || 'llauto';
    for (let i = 0; i < n; i++) { const a0 = (i / n) * 2 * Math.PI, st = (2 * Math.PI) / n; [[0.1, r - h / 2], [0.3, r + h / 2], [0.56, r + h / 2], [0.76, r - h / 2]].forEach(([k, rr]) => pts.push(f1(cx + Math.cos(a0 + st * k) * rr) + ',' + f1(cy + Math.sin(a0 + st * k) * rr))); }
    let forats = ''; for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2 + 0.6; forats += `<circle cx="${f1(cx + Math.cos(a) * r * 0.52)}" cy="${f1(cy + Math.sin(a) * r * 0.52)}" r="${f1(r * 0.13)}" fill="#2e221a" opacity=".55"/>`; }
    return `<g ${o.attr || ''}><polygon points="${pts.join(' ')}" fill="url(#tx-${tex})" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><circle cx="${cx}" cy="${cy}" r="${f1(r * 0.8)}" fill="url(#sh-bola)" opacity=".7"/><circle cx="${cx}" cy="${cy}" r="${f1(r * 0.74)}" fill="none" stroke="${INK}" stroke-width="1" opacity=".5"/>${forats}<circle cx="${cx}" cy="${cy}" r="${f1(Math.max(4, r * 0.22))}" fill="url(#g-esf-${o.pern || 'ferro'})" stroke="${INK}" stroke-width="1.2"/></g>`;
  };
  /* flamarada sola (boca d'un forn o d'un convertidor): tres llengües i resplendor */
  RI.flamarada = (x, y, w, h) => {
    const fl = (ww, hh, d, c) => `<path class="flama2" style="animation-delay:${d}s;transform-origin:${x}px ${y}px" d="M${f1(x - ww / 2)} ${y}C${f1(x - ww / 2)} ${f1(y - hh * 0.5)} ${f1(x - ww * 0.14)} ${f1(y - hh * 0.6)} ${x} ${f1(y - hh)}C${f1(x + ww * 0.14)} ${f1(y - hh * 0.6)} ${f1(x + ww / 2)} ${f1(y - hh * 0.5)} ${f1(x + ww / 2)} ${y}Z" fill="${c}"/>`;
    return `<g><ellipse cx="${x}" cy="${f1(y - h * 0.45)}" rx="${f1(w * 1.1)}" ry="${f1(h * 0.7)}" fill="url(#g-resplendor)" class="pampallugueja"/>${fl(w, h, 0, '#e2501f')}${fl(w * 0.66, h * 0.74, -0.3, '#ff9a2e')}${fl(w * 0.34, h * 0.46, -0.55, '#fff0a0')}</g>`;
  };
  /* figura humana en silueta, per donar escala sense trencar l'estil */
  RI.figura = (x, y, h, o = {}) => {
    const k = h / 100, c = o.color || '#4a3a2e', c2 = o.camisa || '#6b5744';
    const brac = o.brac || 'M-9-70q-6 14-7 30M9-70q7 14 8 30';
    return `<g transform="translate(${x} ${y}) scale(${f1(k * (o.gir ? -100 : 100)) / 100} ${f1(k * 100) / 100})" ${o.attr || ''}><ellipse cx="0" cy="1" rx="17" ry="3.5" fill="#000" opacity=".16"/><path d="M-7 0l1-40h5l1 40zM1 0l1-40h6l-1 40z" fill="${c}"/><path d="M-11-38q-2-22 2-34h18q4 12 2 34z" fill="${c2}"/><path d="${brac}" stroke="${c2}" stroke-width="6.5" stroke-linecap="round" fill="none"/><circle cx="0" cy="-82" r="8.5" fill="#d9a882"/><path d="${o.barret === false ? '' : 'M-10-86q10-12 20 0zM-12-86h24'}" fill="${c}" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>${o.extra || ''}</g>`;
  };
  /* cavall de tir de perfil (mira a la dreta), amb volum i guarniments; origen als peus */
  RI.cavallR = (x, y, k, o = {}) => {
    const c = o.color || '#8a5a36', f = o.fosc || '#4a2f1c', sx = (o.gir ? -1 : 1) * (k || 1);
    const cos = 'M-74-100C-44-112 28-114 56-104C66-128 78-146 92-158L112-142C104-126 96-106 90-86C86-66 74-54 58-50C28-42-36-42-64-52C-84-62-90-88-74-100Z';
    return `<g transform="translate(${x} ${y}) scale(${f1(sx * 100) / 100} ${k || 1})" ${o.attr || ''}><ellipse cx="0" cy="1" rx="92" ry="7" fill="#000" opacity=".16"/>
      <path d="M-78-94C-100-86-104-56-96-26C-88-46-84-70-70-84Z" fill="${f}"/>
      <path d="M-60-60C-54-48-46-42-48-30C-50-20-42-12-40-4H-28C-30-14-36-22-34-32C-32-44-30-52-34-60ZM40-58C42-46 44-38 42-28C41-18 44-10 44-4H56C56-12 54-20 56-30C58-40 60-50 60-58Z" fill="${f}" opacity=".9"/>
      <path d="M-74-66C-68-52-58-44-60-32C-62-22-54-12-52-4H-38C-40-14-48-22-46-32C-44-44-40-52-44-62ZM54-62C56-50 58-40 56-30C55-20 58-10 58-4H70C70-12 68-20 70-30C72-40 74-52 74-60Z" fill="${c}"/>
      <path d="M-54-4h18v6h-18zM56-4h16v6h-16zM-42-4h16v5h-16zM42-4h16v5h-16z" fill="#2e221a"/>
      <path d="${cos}" fill="${c}"/><path d="${cos}" fill="url(#sh-cup)" opacity=".75"/>
      <path d="M88-162C100-170 114-164 120-152L140-120C142-112 136-106 128-108L106-126C96-134 90-148 88-162Z" fill="${c}"/><path d="M92-164l2-14 10 12z" fill="${c}"/><circle cx="118" cy="-146" r="2.6" fill="#1a120c"/><path d="M134-116q4 2 4 6" stroke="#1a120c" stroke-width="1.6" fill="none"/>
      <path d="M58-106C68-130 80-150 94-164L100-158C88-144 78-126 70-102Z" fill="${f}"/>
      ${o.arnes === false ? '' : `<path d="M54-108C44-92 46-66 60-52L72-56C60-70 58-90 66-106Z" fill="#2e221a"/><path d="M58-100C52-88 54-70 64-58" stroke="#c9a03a" stroke-width="2.4" fill="none"/><path d="M60-74H-70" stroke="#2e221a" stroke-width="3"/><path d="M-20-108V-46" stroke="#2e221a" stroke-width="5"/><path d="M96-150l30 28M100-156l34 30" stroke="#2e221a" stroke-width="2"/>`}
    </g>`;
  };
  /* ombra de contacte a terra */
  RI.ombra = (cx, cy, rx, ry, a) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry || 8}" fill="#2e221a" opacity="${a || 0.18}" filter="url(#f-suau)"/>`;
  /* rètol didàctic net sobre el dibuix realista */
  RI.cartell = (x, y, s, o = {}) => { const w = o.w || s.length * 8.2 + 26, h = o.h || 28; return `<g ${o.attr || ''}><rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${h}" rx="${h / 2}" fill="${o.fons || '#2e221a'}" fill-opacity="${o.op || 0.94}"/><text x="${x}" y="${f1(y + 5.2)}" text-anchor="middle" font-size="${o.mida || 15}" font-weight="700" fill="${o.color || '#fff'}">${s}</text></g>`; };
  RI.fons = (vb) => `<rect x="-60" y="${vb || -70}" width="1320" height="800" fill="url(#g-vinyeta)"/>`;
})();

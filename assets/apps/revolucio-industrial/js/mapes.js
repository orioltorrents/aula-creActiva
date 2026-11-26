// SPDX-License-Identifier: AGPL-3.0-or-later
/* Mapes de rutes: geometria projectada amb QGIS, presentació SVG accessible. */
(function () {
  'use strict';
  const geo = window.RI_MAPES;
  if (!geo || !window.RI) return;
  const line = (points) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('');
  const label = (x, y, text, opts = {}) => `<text x="${x}" y="${y}" text-anchor="${opts.anchor || 'start'}" fill="${opts.fill || '#263833'}" font-family="Figtree,Arial,sans-serif" font-size="${opts.size || 23}" font-weight="${opts.weight || 700}" paint-order="stroke" stroke="${opts.halo || '#f9f4e8'}" stroke-width="${opts.outline || 5}" stroke-linejoin="round">${text}</text>`;
  const badge = (x, y, w, heading, body, dark = false) => `<g><rect x="${x}" y="${y}" width="${w}" height="79" rx="13" fill="${dark ? '#203e48' : '#fffaf0'}" stroke="${dark ? '#203e48' : '#b7a98b'}" stroke-width="2"/><text x="${x + 17}" y="${y + 28}" fill="${dark ? '#d9eee9' : '#607068'}" font-family="Figtree,Arial,sans-serif" font-size="17" font-weight="700">${heading}</text><text x="${x + 17}" y="${y + 61}" fill="${dark ? '#fff' : '#29312f'}" font-family="Fraunces,Georgia,serif" font-size="28" font-weight="700">${body}</text></g>`;
  const dot = (x, y, color, radius = 8) => `<circle cx="${x}" cy="${y}" r="${radius + 5}" fill="#fffdf7" stroke="${color}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${radius}" fill="${color}"/>`;

  RI.mapaFerrocarril = function () {
    const m = geo.rail, p = m.places, d = line(m.route);
    const s = `
      <title>Mapa de la línia Liverpool–Manchester de 1830</title>
      <desc>Mapa geogràfic amb Liverpool, Rainhill, Parkside, Chat Moss i Manchester. El tren avança de l'oest cap a l'est. El traçat és aproximat.</desc>
      <defs><linearGradient id="mapa-rail-mar" x2="0" y2="1"><stop stop-color="#b8d8dc"/><stop offset="1" stop-color="#dbe7dc"/></linearGradient><pattern id="mapa-rail-paper" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0H0V42" fill="none" stroke="#9d9a82" stroke-opacity=".13"/></pattern></defs>
      <rect x="-60" y="0" width="1320" height="720" fill="url(#mapa-rail-mar)"/>
      <g transform="translate(0 40)"><path d="${m.land}" fill="#e9e4ce" fill-rule="evenodd" stroke="#9ba68d" stroke-width="2"/><rect x="0" y="0" width="1200" height="640" fill="url(#mapa-rail-paper)"/></g>
      ${label(32, 56, 'Liverpool → Manchester', { size: 35, halo: '#e9e4ce', outline: 7 })}
      ${label(35, 86, 'La primera línia interurbana de vapor · 1830', { size: 17, weight: 600, fill: '#496861', outline: 4 })}
      <ellipse cx="${p['Chat Moss'][0]}" cy="${p['Chat Moss'][1] + 40}" rx="100" ry="64" fill="#91af78" opacity=".27" stroke="#5d8463" stroke-dasharray="6 7" stroke-width="2"/>
      <path d="${d}" transform="translate(0 40)" fill="none" stroke="#fff8e8" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${d}" transform="translate(0 40)" fill="none" stroke="#567c77" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity=".62"/>
      <path id="rail-ruta" d="${d}" transform="translate(0 40)" fill="none" stroke="#e09937" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      ${dot(p.Liverpool[0], p.Liverpool[1] + 40, '#1f6f78', 10)}
      ${dot(p.Rainhill[0], p.Rainhill[1] + 40, '#a86a22', 6)}
      ${dot(p.Parkside[0], p.Parkside[1] + 40, '#a86a22', 6)}
      ${dot(p['Chat Moss'][0], p['Chat Moss'][1] + 40, '#568760', 6)}
      ${dot(p.Manchester[0], p.Manchester[1] + 40, '#1f6f78', 10)}
      ${label(p.Liverpool[0] - 24, p.Liverpool[1] + 12, 'Liverpool', { anchor: 'end', size: 28 })}
      ${label(p.Rainhill[0], p.Rainhill[1] + 93, 'Rainhill', { anchor: 'middle', size: 20 })}
      ${label(p.Parkside[0], p.Parkside[1] - 19, 'Parkside', { anchor: 'middle', size: 19 })}
      ${label(p['Chat Moss'][0], p['Chat Moss'][1] - 28, 'Chat Moss', { anchor: 'middle', size: 20 })}
      ${label(p.Manchester[0] + 12, p.Manchester[1] - 27, 'Manchester', { anchor: 'end', size: 28 })}
      <g id="rail-tren" transform="translate(${p.Liverpool[0]} ${p.Liverpool[1] + 40})"><circle r="23" fill="#1f6f78" stroke="#fffaf0" stroke-width="4"/><path d="M-13 6V-5H4V-12H10V-5H14V6Z" fill="#fffaf0"/><circle cx="-6" cy="11" r="3" fill="#fffaf0"/><circle cx="8" cy="11" r="3" fill="#fffaf0"/></g>
      ${badge(30, 575, 205, 'DISTÀNCIA', 'uns 50 km')}
      ${badge(247, 575, 226, 'DIRECTE · 1a CLASSE', '1 h i 30 min', true)}
      <path d="M${1000 - m.scale20} 620h${m.scale20}" stroke="#344e52" stroke-width="4"/><path d="M${1000 - m.scale20} 614v12M1000 614v12" stroke="#344e52" stroke-width="3"/>
      ${label(1010, 626, '20 km', { size: 17, weight: 600 })}
      ${label(1190, 687, 'QGIS · Natural Earth · traçat aproximat', { anchor: 'end', size: 15, weight: 600, fill: '#4f655f', outline: 3 })}`;
    return RI.svg(s);
  };

  RI.animaMapaFerrocarril = function ({ p, el, svg }) {
    const route = el('rail-ruta');
    const length = svg._mapLength || (svg._mapLength = route.getTotalLength());
    const done = Math.max(0, Math.min(1, p));
    route.style.strokeDasharray = `${(length * done).toFixed(1)} ${length.toFixed(1)}`;
    const point = route.getPointAtLength(length * done);
    el('rail-tren').setAttribute('transform', `translate(${point.x.toFixed(1)} ${(point.y + 40).toFixed(1)})`);
  };

  RI.mapaAtlantic = function () {
    const m = geo.sea, p = m.places, d = line(m.route);
    const steam = line(m.route.map(([x, y], i) => [x, y - 20 * Math.sin(Math.PI * i / (m.route.length - 1))]));
    const sail = line(m.route.map(([x, y], i) => [x, y + 20 * Math.sin(Math.PI * i / (m.route.length - 1))]));
    const s = `
      <title>Ruta del Great Western, de Bristol a Nova York, abril de 1838</title>
      <desc>Mapa de l'Atlàntic amb els ports de Bristol i Nova York. La línia és una connexió esquemàtica i no la derrota real del vaixell.</desc>
      <defs><linearGradient id="mapa-ocea" x2="0" y2="1"><stop stop-color="#98c4d9"/><stop offset="1" stop-color="#619cbe"/></linearGradient><pattern id="mapa-ones" width="55" height="31" patternUnits="userSpaceOnUse"><path d="M0 15q14-8 28 0t27 0" fill="none" stroke="#eef8f8" stroke-opacity=".21" stroke-width="2"/></pattern><marker id="mapa-fletxa-oest" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto"><path d="M1 1L8 5 1 9" fill="none" stroke="#fffaf0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
      <rect x="-60" y="0" width="1320" height="720" fill="url(#mapa-ocea)"/>
      <rect x="-60" y="0" width="1320" height="720" fill="url(#mapa-ones)"/>
      <g transform="translate(0 40)"><path d="${m.land}" fill="#e7ddbe" fill-rule="evenodd" stroke="#a5a88b" stroke-width="2"/></g>
      <rect x="243" y="24" width="713" height="57" rx="16" fill="#fffaf0" fill-opacity=".94" stroke="#c5b99e" stroke-width="2"/>
      ${label(599, 61, 'BRISTOL → NOVA YORK · uns 5.400 km', { anchor: 'middle', size: 29, halo: '#fffaf0', outline: 3 })}
      ${label(560, 235, 'OCEÀ ATLÀNTIC', { anchor: 'middle', size: 25, weight: 600, fill: '#245b79', halo: '#a4cddd', outline: 3 })}
      ${label(170, 252, 'AMÈRICA DEL NORD', { size: 21, weight: 700, fill: '#36534c', halo: '#e7ddbe' })}
      ${label(1030, 225, 'EUROPA', { anchor: 'end', size: 21, weight: 700, fill: '#36534c', halo: '#e7ddbe' })}
      <path d="${d}" transform="translate(0 40)" fill="none" stroke="#fffdf7" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
      <path d="${steam}" transform="translate(0 40)" fill="none" stroke="#a34f25" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${sail}" transform="translate(0 40)" fill="none" stroke="#226582" stroke-width="7" stroke-dasharray="7 11" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
      <path id="mar-ruta" d="${steam}" transform="translate(0 40)" fill="none" stroke="#f0a653" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#mapa-fletxa-oest)"/>
      <path id="mar-vela-ruta" d="${sail}" transform="translate(0 40)" fill="none" stroke="#28728e" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      ${dot(p.Bristol[0], p.Bristol[1] + 40, '#b34d2f', 10)}
      ${dot(p['Nova York'][0], p['Nova York'][1] + 40, '#b34d2f', 10)}
      ${label(p.Bristol[0] + 12, p.Bristol[1] + 17, 'BRISTOL', { anchor: 'end', size: 27 })}
      ${label(p['Nova York'][0] + 17, p['Nova York'][1] - 19, 'NOVA YORK', { size: 27 })}
      <g id="mar-vaixell" transform="translate(${p.Bristol[0]} ${p.Bristol[1] + 24})"><circle r="25" fill="#b34d2f" stroke="#fffaf0" stroke-width="4"/><path d="M-15 2H16l-6 11H-9Z" fill="#fffaf0"/><path d="M-3 0v-14h8V0" fill="#fffaf0"/><path d="M-13-5h6M-13-11h6" stroke="#fffaf0" stroke-width="3"/></g>
      <g id="mar-veler" transform="translate(${p.Bristol[0]} ${p.Bristol[1] + 56})"><circle r="25" fill="#226582" stroke="#fffaf0" stroke-width="4"/><path d="M-15 4H16l-6 9H-9Z" fill="#fffaf0"/><path d="M-3-1v-21l16 20zM-6 1l-13-2L-6-18z" fill="#fffaf0"/></g>
      <rect x="35" y="546" width="1120" height="151" rx="17" fill="#fffaf0" fill-opacity=".96" stroke="#809dac" stroke-width="2"/>
      ${label(56, 574, 'COMPARACIÓ DE DURADES · no és una cursa real', { size: 18, weight: 700, fill: '#305669', halo: '#fffaf0', outline: 2 })}
      ${label(1065, 574, 'Dia', { anchor: 'end', size: 18, weight: 600, fill: '#305669', halo: '#fffaf0', outline: 2 })}
      <text id="mar-dia" x="1125" y="574" text-anchor="end" fill="#203e48" font-family="Fraunces,Georgia,serif" font-size="25" font-weight="700">0</text>
      <rect x="363" y="593" width="552" height="20" rx="10" fill="#ddd8cb"/>
      <rect id="mar-barra-vapor" x="363" y="593" width="0" height="20" rx="10" fill="#d78239"/>
      <rect x="363" y="642" width="552" height="20" rx="10" fill="#ddd8cb"/>
      <rect id="mar-barra-vela" x="363" y="642" width="0" height="20" rx="10" fill="#28728e"/>
      ${label(58, 611, 'VAPOR · 1838', { size: 22, fill: '#8d431f', halo: '#fffaf0', outline: 2 })}
      ${label(58, 660, 'VELA · anys 1840', { size: 22, fill: '#245e77', halo: '#fffaf0', outline: 2 })}
      ${label(1115, 611, '15 dies i mig', { anchor: 'end', size: 23, fill: '#8d431f', halo: '#fffaf0', outline: 2 })}
      ${label(1115, 660, '≈ 5 setmanes', { anchor: 'end', size: 23, fill: '#245e77', halo: '#fffaf0', outline: 2 })}
      ${label(1147, 715, 'QGIS · Natural Earth · rutes esquemàtiques', { anchor: 'end', size: 13, weight: 600, fill: '#24546e', halo: '#bbd8e2', outline: 2 })}`;
    return RI.svg(s);
  };

  RI.animaMapaAtlantic = function ({ p, el, svg }) {
    const steam = el('mar-ruta');
    const sail = el('mar-vela-ruta');
    const steamLength = svg._steamLength || (svg._steamLength = steam.getTotalLength());
    const sailLength = svg._sailLength || (svg._sailLength = sail.getTotalLength());
    const day = Math.max(0, Math.min(35, p * 35));
    const steamFraction = Math.min(1, day / 15.5);
    const sailFraction = day / 35;
    steam.style.strokeDasharray = `${(steamLength * steamFraction).toFixed(1)} ${steamLength.toFixed(1)}`;
    sail.style.strokeDasharray = `${(sailLength * sailFraction).toFixed(1)} ${sailLength.toFixed(1)}`;
    const steamPoint = steam.getPointAtLength(steamLength * steamFraction);
    const sailPoint = sail.getPointAtLength(sailLength * sailFraction);
    el('mar-vaixell').setAttribute('transform', `translate(${steamPoint.x.toFixed(1)} ${(steamPoint.y + 24).toFixed(1)})`);
    el('mar-veler').setAttribute('transform', `translate(${sailPoint.x.toFixed(1)} ${(sailPoint.y + 56).toFixed(1)})`);
    el('mar-barra-vapor').setAttribute('width', (552 * steamFraction).toFixed(1));
    el('mar-barra-vela').setAttribute('width', (552 * sailFraction).toFixed(1));
    el('mar-dia').textContent = Math.round(day);
  };
})();

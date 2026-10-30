/* Controlador d'un intent guiat. Les respostes de cada fase queden fixades
 * abans de mostrar la geometria correcta a la fase següent. */
const geologicalTexts = {
    ca: {
        title: 'Talls geològics i riscos (PAU)', description: 'Del mapa al tall: relleu, roques, torrents i riscos.',
        seed: 'Llavor', basic: 'Bàsic · horitzontal', advanced: 'Avançat · inclinat', start: 'Genera un exercici',
        orientation: 'Base d’orientació · 5 passos', guide: '1. Comprova les escales. 2. Construeix el perfil topogràfic. 3. Situa els contactes litològics. 4. Interpreta l’estructura i el cabussament. 5. Completa les trames i la llegenda.',
        convention: 'Model didàctic inspirat en les PAU. Contacte concordant: continu; base erosiva al·luvial: discontinu (convenció d’aquest exercici). El perfil té exageració vertical ×3. Equidistància: 10 m.',
        phase1: '1 · Torrents i perfil topogràfic', phase2: '2 · Contactes i estructura', phase3: '3 · Litologies del tall', phase4: '4 · Riscos geològics',
        help1: 'Marca cada torrent una sola vegada prop d’A–B (±20 m al mapa). Al perfil, fes clic prop d’una guia per posar-hi una cota, o completa les caselles. Ajust: 1 m; tolerància: ±5 m. Les guies inclouen contactes, corbes de nivell, fons de vall i extrems.',
        help2: 'El perfil correcte ja es mostra. Defineix el contacte entre les dues roques i la base dels sediments recents. El sentit de cabussament indica cap a on baixa el pla.',
        help3: 'Els contactes correctes ja es mostren. Tria una roca i aplica-la a cada regió, o utilitza els desplegables. Cada regió compta igual.',
        help4: 'Observa el poble i el càmping: posició al fons de vall, dipòsits recents i drenatge. Selecciona el risc, la justificació i dues mesures de tipus diferent.',
        freeze: 'Valida la fase i continua', final: 'Corregir i desar puntuació', undo: 'Desfés l’últim torrent', marks: 'Torrents marcats',
        point: 'Punt', elevation: 'Cota (m)', choose: 'Selecciona…', contact: 'Contacte entre les dues roques', attitude: 'Disposició dels estrats',
        alluvial: 'Contacte a la base dels al·luvions', shape: 'Forma del dipòsit recent', concordant: 'Concordant · continu', discordant: 'Discordant / erosiu · discontinu',
        horizontal: 'Horitzontal · 0°', west: 'Inclinat cap a l’oest', east: 'Inclinat cap a l’est', lens: 'Cubeta superficial al·luvial', plane: 'Pla profund',
        rock0: 'Calcàries', rock1: 'Conglomerats', rock2: 'Gresos', rock3: 'Lutites / argiles', rock4: 'Sediments al·luvials recents',
        region: 'Regió', village: 'Poble', camp: 'Càmping', castle: 'Castell', risk: 'Risc principal', reason: 'Argumentació',
        flood: 'Inundacions / avingudes torrencials', slide: 'Despreniments / esllavissades', volcano: 'Erupció volcànica',
        valley: 'Fons de vall amb drenatge i dipòsits al·luvials recents', summit: 'Cim elevat allunyat del drenatge', magma: 'Presència de magma superficial',
        landMeasure: 'Mesura d’ordenació del territori', emergencyMeasure: 'Mesura de preparació davant emergències',
        relocate: 'Reubicar els usos vulnerables fora de la zona inundable', build: 'Ampliar el càmping dins la llera', pave: 'Pavimentar la llera sense estudi hidràulic',
        alert: 'Pla d’alerta i evacuació amb seguiment meteorològic', ignore: 'Esperar que arribi l’aigua per decidir', wall: 'Confiar només en un mur sense estudi',
        result: 'Resultat de l’intent', profile: 'Perfil', contacts: 'Contactes', lithology: 'Litologies', torrents: 'Torrents',
        correction: 'La resposta original queda fixada. La geometria correcta permet continuar sense arrossegar errors.',
        explanation: 'Els contactes horitzontals segueixen una cota constant; els inclinats canvien de cota. Els al·luvions omplen una incisió erosiva superficial. El poble i el càmping són al fons de vall: els dipòsits indiquen activitat fluvial, però no delimiten per si sols una inundació real. La prevenció prioritza evitar l’exposició i preparar l’alerta i l’evacuació.',
        overlay: 'Solució: línia verda contínua. Perfil original: línia discontínua; punts verds correctes i vermells incorrectes. Les regions amb error tenen contorn discontinu; la taula indica la resposta correcta.',
        correct: 'Correcte', expected: 'Resposta correcta', saving: 'Desant la puntuació…', saved: 'Puntuació desada.',
        error: 'No s’ha confirmat el desament. Pots tornar-ho a provar; si s’ha perdut la resposta del servidor, el reintent podria duplicar el registre.', retry: 'Reintenta el desament',
        session: 'Falta la sessió d’usuari o el projecte. Torna a iniciar sessió abans de desar.', new: 'Nou exercici',
        template0: 'Vall bifurcada en Y', template1: 'Vall central', template2: 'Turó central i dues valls',
        keyboard: 'Alternativa al mapa: introdueix X (metres des de l’oest) per marcar un torrent sobre A–B.', add: 'Marca torrent',
        locked: 'La primera resposta de cada fase és la que es puntua. Un exercici complet = un intent desat.',
        profileLabel: 'Mapa geològic i tall A–B alineats', map: 'Mapa geològic', section: 'Tall A–B · cotes en metres', upper: 'Unitat superior', lower: 'Unitat inferior',
        empty: 'Sense resposta', warning: 'Algunes respostes estan buides. Prem de nou per fixar la fase amb aquestes respostes sense puntuar.'
    },
    es: {
        title: 'Cortes geológicos y riesgos (PAU)', description: 'Del mapa al corte: relieve, rocas, torrentes y riesgos.',
        seed: 'Semilla', basic: 'Básico · horizontal', advanced: 'Avanzado · inclinado', start: 'Generar un ejercicio',
        orientation: 'Base de orientación · 5 pasos', guide: '1. Comprueba las escalas. 2. Construye el perfil topográfico. 3. Sitúa los contactos litológicos. 4. Interpreta la estructura y el buzamiento. 5. Completa las tramas y la leyenda.',
        phase1: '1 · Torrentes y perfil topográfico', phase2: '2 · Contactos y estructura', phase3: '3 · Litologías del corte', phase4: '4 · Riesgos geológicos',
        freeze: 'Validar fase y continuar', final: 'Corregir y guardar puntuación', undo: 'Deshacer el último torrente', marks: 'Torrentes marcados',
        choose: 'Selecciona…', point: 'Punto', elevation: 'Cota (m)', contact: 'Contacto entre las dos rocas', attitude: 'Disposición de los estratos',
        alluvial: 'Contacto en la base de los aluviones', shape: 'Forma del depósito reciente', concordant: 'Concordante · continuo', discordant: 'Discordante / erosivo · discontinuo',
        horizontal: 'Horizontal · 0°', west: 'Inclinado hacia el oeste', east: 'Inclinado hacia el este', lens: 'Cubeta superficial aluvial', plane: 'Plano profundo',
        rock0: 'Calizas', rock1: 'Conglomerados', rock2: 'Areniscas', rock3: 'Lutitas / arcillas', rock4: 'Sedimentos aluviales recientes',
        region: 'Región', village: 'Pueblo', camp: 'Camping', castle: 'Castillo', risk: 'Riesgo principal', reason: 'Argumentación',
        flood: 'Inundaciones / avenidas torrenciales', slide: 'Desprendimientos / deslizamientos', volcano: 'Erupción volcánica',
        valley: 'Fondo de valle con drenaje y depósitos aluviales recientes', summit: 'Cima elevada alejada del drenaje', magma: 'Presencia de magma superficial',
        landMeasure: 'Medida de ordenación del territorio', emergencyMeasure: 'Medida de preparación ante emergencias',
        relocate: 'Reubicar los usos vulnerables fuera de la zona inundable', build: 'Ampliar el camping dentro del cauce', pave: 'Pavimentar el cauce sin estudio hidráulico',
        alert: 'Plan de alerta y evacuación con seguimiento meteorológico', ignore: 'Esperar a que llegue el agua para decidir', wall: 'Confiar solo en un muro sin estudio',
        result: 'Resultado del intento', profile: 'Perfil', contacts: 'Contactos', lithology: 'Litologías', torrents: 'Torrentes',
        correct: 'Correcto', expected: 'Respuesta correcta', saving: 'Guardando la puntuación…', saved: 'Puntuación guardada.', retry: 'Reintentar guardado', new: 'Nuevo ejercicio',
        template0: 'Valle bifurcado en Y', template1: 'Valle central', template2: 'Colina central y dos valles',
        add: 'Marcar torrente', upper: 'Unidad superior', lower: 'Unidad inferior', empty: 'Sin respuesta',
        convention: 'Modelo didáctico inspirado en las PAU. Contacto concordante: continuo; base erosiva aluvial: discontinuo (convención de este ejercicio). El perfil tiene exageración vertical ×3. Equidistancia: 10 m.',
        help1: 'Marca cada torrente una sola vez cerca de A–B (±20 m en el mapa). En el perfil, pulsa cerca de una guía para colocar una cota, o completa las casillas. Ajuste: 1 m; tolerancia: ±5 m. Las guías incluyen contactos, curvas de nivel, fondos de valle y extremos.',
        help2: 'Se muestra el perfil correcto. Define el contacto entre las dos rocas y la base de los sedimentos recientes. El sentido de buzamiento indica hacia dónde baja el plano.',
        help3: 'Se muestran los contactos correctos. Elige una roca y aplícala a cada región, o utiliza los desplegables. Cada región cuenta igual.',
        help4: 'Observa el pueblo y el camping: posición en el fondo del valle, depósitos recientes y drenaje. Selecciona el riesgo, la justificación y dos medidas de distinto tipo.',
        correction: 'La respuesta original queda fijada. La geometría correcta permite continuar sin arrastrar errores.',
        explanation: 'Los contactos horizontales siguen una cota constante; los inclinados cambian de cota. Los aluviones rellenan una incisión erosiva superficial. El pueblo y el camping están en el fondo del valle: los depósitos indican actividad fluvial, pero no delimitan por sí solos una inundación real. La prevención prioriza evitar la exposición y preparar la alerta y la evacuación.',
        overlay: 'Solución: línea verde continua. Perfil original: línea discontinua; puntos verdes correctos y rojos incorrectos. Las regiones erróneas tienen contorno discontinuo; la tabla indica la respuesta correcta.',
        error: 'No se ha confirmado el guardado. Puedes reintentarlo; si se ha perdido la respuesta del servidor, el reintento podría duplicar el registro.',
        session: 'Falta la sesión de usuario o el proyecto. Vuelve a iniciar sesión antes de guardar.',
        keyboard: 'Alternativa al mapa: introduce X (metros desde el oeste) para marcar un torrente sobre A–B.',
        locked: 'Se puntúa la primera respuesta de cada fase. Un ejercicio completo = un intento guardado.',
        profileLabel: 'Mapa geológico y corte A–B alineados', map: 'Mapa geológico', section: 'Corte A–B · cotas en metros',
        warning: 'Hay respuestas vacías. Pulsa de nuevo para fijar la fase con estas respuestas sin puntuar.'
    }
};
// Les llengües sense traducció específica utilitzen català, sense mostrar claus.
for (const [lang, dictionary] of Object.entries(i18n.translations)) {
    for (const [key, value] of Object.entries(geologicalTexts.ca)) {
        dictionary[`geo_${key}`] = geologicalTexts[lang]?.[key] || value;
    }
}
const geoT = key => i18n.t(`geo_${key}`);
let geologicalGame = null;

function showAmbientalsMenu() {
    if (geologicalGame?.saving) return;
    setGameBackAction(null);
    document.getElementById('ambientals-menu')?.classList.remove('hidden');
    document.getElementById('geo-activity')?.classList.add('hidden');
    setGameTitle(state.currentProject?.titol);
}
function openGeologicalActivity() {
    if (!blockUnavailableActivity('talls-geologics')) return;
    setGameBackToCurrentView();
    document.getElementById('ambientals-menu').classList.add('hidden');
    document.getElementById('geo-activity').classList.remove('hidden');
    setGameTitle(geoT('title'));
    geologicalGame = null;
    renderGeologicalSetup();
}
function geoEscape(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function geoButton(action, text, secondary = false) {
    return `<button type="button" class="btn btn--${secondary ? 'secondary' : 'primary'}" data-geo-action="${action}">${geoT(text)}</button>`;
}
function renderGeologicalSetup() {
    const root = document.getElementById('geo-root');
    root.innerHTML = `<h2>${geoT('title')}</h2>
        <p>${geoT('description')}</p><p>${geoT('locked')}</p>
        <form id="geo-setup" class="talls-geologics__controls">
        <label>${geoT('seed')} <input id="geo-seed" maxlength="64" required value="${Date.now().toString(36)}"></label>
        <label>${geoT('attitude')} <select id="geo-level"><option value="basic">${geoT('basic')}</option><option value="advanced">${geoT('advanced')}</option></select></label>
        <button class="btn btn--primary" type="submit">${geoT('start')}</button></form>`;
    root.onclick = geoClick;
    root.onchange = null;
    root.onkeydown = null;
    document.getElementById('geo-setup').onsubmit = event => {
        event.preventDefault();
        const seed = document.getElementById('geo-seed').value.trim();
        if (!seed) return;
        const m = GeologicalModel.create(seed, document.getElementById('geo-level').value === 'advanced');
        geologicalGame = { model: m, phase: 1, startedAt: Date.now(), saving: false, saved: false,
            user: state.user ? { ...state.user } : null, project: state.currentProject ? { ...state.currentProject } : null,
            answers: { profile: [], streams: [], fills: {}, risk: [] }, selectedRock: m.rocks[0], saveStatus: '', acknowledgeEmpty: false };
        geologicalGame.mapMarkup = geoMap(m);
        renderGeologicalGame();
    };
}
function geoSelect(name, label, options, value = '') {
    return `<label>${label}<select data-geo-field="${name}"><option value="">${geoT('choose')}</option>${options.map(v =>
        `<option value="${v}"${String(value) === String(v) ? ' selected' : ''}>${typeof v === 'number' ? geoT(`rock${v}`) : geoT(v)}</option>`).join('')}</select></label>`;
}
function geoPatterns() {
    return `<defs>${[0, 1, 2, 3, 4].map(i => `<pattern id="geo-rock-${i}" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" class="talls-geologics__rock-bg talls-geologics__rock-bg--${i}"/>${[
        '<path d="M0 0H12M0 6H12M3 0V6M9 6V12"/>',
        '<ellipse cx="3" cy="4" rx="2" ry="1.3"/><ellipse cx="9" cy="10" rx="2" ry="1.5"/>',
        '<circle cx="3" cy="3" r="0.6"/><circle cx="9" cy="9" r="0.6"/>',
        '<path d="M1 3H7M5 9H11"/>', ''
    ][i]}</pattern>`).join('')}</defs>`;
}
const geoX = x => x + 40;
const geoY = z => 570 - (z - 80) * 3;
const geoPath = (points, profile = false) => points.map((p, i) => `${i ? 'L' : 'M'}${geoX(p[0]).toFixed(2)},${(profile ? geoY(p[1]) : p[1] + 25).toFixed(2)}`).join(' ');
// Interpolació cúbica monòtona: suavitza sense inventar pics entre les cotes.
function geoProfileCurve(targets, answers) {
    let path = '', run = [];
    const flush = () => {
        if (!run.length) return;
        const slopes = run.slice(1).map((p, i) => (p[1] - run[i][1]) / (p[0] - run[i][0]));
        const tangents = run.map((_, i) => {
            if (!i) return slopes[0] || 0;
            if (i === run.length - 1) return slopes[i - 1] || 0;
            return slopes[i - 1] * slopes[i] <= 0 ? 0 : Math.sign(slopes[i]) * Math.min(Math.abs(slopes[i - 1]), Math.abs(slopes[i]));
        });
        path += ` M${geoX(run[0][0])},${geoY(run[0][1])}`;
        for (let i = 1; i < run.length; i++) {
            const a = run[i - 1], b = run[i], third = (b[0] - a[0]) / 3;
            path += ` C${geoX(a[0] + third)},${geoY(a[1] + tangents[i - 1] * third)} ${geoX(b[0] - third)},${geoY(b[1] - tangents[i] * third)} ${geoX(b[0])},${geoY(b[1])}`;
        }
        run = [];
    };
    targets.forEach((t, i) => { if (Number.isFinite(answers[i])) run.push([t.x, answers[i]]); else flush(); });
    flush();
    return path;
}
function geoMap(m) {
    let html = '';
    // Raster de litologies; els límits es dibuixen amb contorns interpolats.
    for (let y = 0; y < m.height; y += 4) for (let x = 0; x < m.width; x += 4) {
        html += `<rect x="${geoX(x)}" y="${y + 25}" width="4.1" height="4.1" fill="url(#geo-rock-${m.rockAt(x + 2, y + 2)})"/>`;
    }
    for (const row of GeologicalModel.contours(m.terrain, [90, 100, 110, 120, 130])) {
        html += `<path class="talls-geologics__contour" d="${row.segments.map(p => geoPath(p)).join(' ')}"/>`;
        const labelY = 30 + (130 - row.level) * 3;
        const candidates = row.segments.filter(p => p[0][0] > 20 && p[0][0] < 180);
        const seg = candidates.reduce((best, p) => !best || Math.abs(p[0][1] - labelY) < Math.abs(best[0][1] - labelY) ? p : best, null);
        if (seg) html += `<text class="talls-geologics__map-label" x="${geoX(seg[0][0])}" y="${seg[0][1] + 25}">${row.level}</text>`;
    }
    const contacts = GeologicalModel.contours((x, y) => m.terrain(x, y) - m.contact(x), [0])[0];
    html += `<path class="talls-geologics__contact" d="${contacts.segments.filter(p => m.depositDepth(...p[0]) === 0).map(p => geoPath(p)).join(' ')}"/>`;
    const edges = GeologicalModel.contours((x, y) => m.distance(x, y) - 13, [0])[0];
    html += `<path class="talls-geologics__contact talls-geologics__contact--erosion" d="${edges.segments.map(p => geoPath(p)).join(' ')}"/>`;
    html += `<path class="talls-geologics__cut" d="M40 ${m.sectionY + 25}H440"/><text x="24" y="${m.sectionY + 29}">A</text><text x="444" y="${m.sectionY + 29}">B</text>`;
    for (const site of m.sites) html += `<text class="talls-geologics__map-label" x="${geoX(site.x)}" y="${site.y + 25}">${site.key === 'camp' ? '△' : site.key === 'castle' ? '♜' : '⌂'} ${geoT(site.key)}</text>`;
    html += `<text class="talls-geologics__map-label" x="65" y="70">${m.advanced ? (m.direction === 'west' ? '⊣' : '⊢') + ' ' + m.angle.toFixed(1) + '°' : '+ 0°'}</text>
        <text x="427" y="20">N ↑</text><path class="talls-geologics__contact" d="M40 325v-5m0 5h50m0 0v-5"/><text x="40" y="341">0</text><text x="85" y="341">50 m</text>`;
    return html;
}
function geoSection(m, g) {
    let html = '';
    for (let z = 80; z <= 140; z += 5) html += `<path class="talls-geologics__grid" d="M40 ${geoY(z)}H440"/>${z % 10 === 0 ? `<text x="8" y="${geoY(z) + 4}">${z}</text>` : ''}`;
    for (let x = 0; x <= 400; x += 10) html += `<path class="talls-geologics__grid" d="M${geoX(x)} 390V570"/>`;
    if (g.phase >= 3) for (const region of m.regions) {
        const fill = g.answers.fills[region.id];
        const wrong = g.phase === 5 && fill !== region.rock;
        html += `<path d="${geoPath(region.points, true)}Z" class="talls-geologics__region${wrong ? ' talls-geologics__region--wrong' : ''}" ${fill !== undefined ? `fill="url(#geo-rock-${fill})"` : ''} ${g.phase === 3 ? `tabindex="0" role="button" data-geo-region="${region.id}" aria-label="${geoT('region')} ${region.id + 1}"` : ''}/>`;
        const middle = region.points[Math.floor(region.points.length / 4)];
        const reverse = region.points[region.points.length - 1 - Math.floor(region.points.length / 4)];
        html += `<text class="talls-geologics__region-label" x="${geoX(middle[0])}" y="${geoY((middle[1] + reverse[1]) / 2)}">${region.id + 1}</text>`;
    }
    const real = Array.from({ length: 401 }, (_, x) => [x, m.terrain(x, m.sectionY)]);
    if (g.phase > 1) html += `<path class="talls-geologics__solution" d="${geoPath(real, true)}"/>`;
    if (g.phase === 2 || g.phase === 5) {
        const a = g.answers;
        if (a.direction) {
            const slope = a.direction === 'horizontal' ? 0 : (a.direction === 'west' ? 1 : -1) * (m.advanced ? Math.abs(m.slope) : 0.05);
            const line = real.map(p => [p[0], m.contactZ + slope * (p[0] - 200)]).filter(p => p[1] <= m.terrain(p[0], m.sectionY) - m.depositDepth(p[0], m.sectionY));
            // Les trams separats per una vall no s'uneixen per damunt del terreny.
            let previous = -2;
            const d = line.map(p => { const command = p[0] - previous > 1 ? 'M' : 'L'; previous = p[0]; return `${command}${geoX(p[0])},${geoY(p[1])}`; }).join(' ');
            const wrong = g.phase === 5 && (a.direction !== m.direction || a.contactType !== 'concordant');
            html += `<path class="talls-geologics__contact ${a.contactType === 'discordant' ? 'talls-geologics__contact--erosion' : ''} ${wrong ? 'talls-geologics__contact--wrong' : ''}" d="${d}"/>`;
        }
        if (a.alluvialShape) for (const r of m.regions.filter(r => r.layer === 'alluvium')) {
            const base = r.points.slice(r.points.length / 2);
            const line = a.alluvialShape === 'lens' ? base : base.map(p => [p[0], 82]);
            const wrong = g.phase === 5 && (a.alluvialShape !== 'lens' || a.alluvialType !== 'discordant');
            html += `<path class="talls-geologics__contact ${a.alluvialType === 'discordant' ? 'talls-geologics__contact--erosion' : ''} ${wrong ? 'talls-geologics__contact--wrong' : ''}" d="${geoPath(line, true)}"/>`;
        }
    }
    if (g.phase >= 3) {
        const parts = [];
        let open = false;
        for (const [x, z] of real) {
            const base = z - m.depositDepth(x, m.sectionY), c = m.contact(x);
            if (c < base) { parts.push(`${open ? 'L' : 'M'}${geoX(x)},${geoY(c)}`); open = true; } else open = false;
        }
        html += `<path class="talls-geologics__solution" d="${parts.join(' ')}"/>`;
        for (const r of m.regions.filter(r => r.layer === 'alluvium')) html += `<path class="talls-geologics__solution talls-geologics__contact--erosion" d="${geoPath(r.points.slice(r.points.length / 2), true)}"/>`;
    }
    if (g.phase === 1 || g.phase === 5) {
        const d = geoProfileCurve(m.targets, g.answers.profile);
        html += `<path class="talls-geologics__answer" d="${d}"/>`;
        m.targets.forEach((t, i) => {
            html += `<path class="talls-geologics__guide" d="M${geoX(t.x)} 390V570"/><text x="${geoX(t.x)}" y="${585 + (i % 2) * 12}" class="talls-geologics__point-label">${i + 1}</text>`;
            const z = g.answers.profile[i];
            if (Number.isFinite(z)) html += `<circle class="talls-geologics__point ${g.phase === 5 ? GeologicalModel.correctElevation(t.z, z) ? 'talls-geologics__point--correct' : 'talls-geologics__point--wrong' : ''}" cx="${geoX(t.x)}" cy="${geoY(z)}" r="3"/>`;
        });
    }
    return html;
}
function geoDrawing() {
    const g = geologicalGame, m = g.model;
    return `<svg id="geo-drawing" viewBox="0 0 470 610" role="group" aria-label="${geoT('profileLabel')}">
        ${geoPatterns()}<text x="40" y="16">${geoT('map')}</text>${g.mapMarkup}
        ${g.answers.streams.map((p, i) => `<circle class="talls-geologics__stream" cx="${geoX(p.x)}" cy="${p.y + 25}" r="5"/><text x="${geoX(p.x) + 6}" y="${p.y + 25}">${i + 1}</text>`).join('')}
        ${g.phase > 1 ? m.channels(m.sectionY).map(x => `<path class="talls-geologics__solution" d="M${geoX(x)} ${m.sectionY + 15}v20"/>`).join('') : ''}
        <text x="40" y="375">${geoT('section')}</text>${geoSection(m, g)}</svg>`;
}
function geoPhaseControls() {
    const g = geologicalGame, m = g.model, a = g.answers;
    if (g.phase === 1) return `<p>${geoT('marks')}: ${a.streams.length} ${geoButton('undo', 'undo', true)}</p>
        <p>${geoT('keyboard')}</p><label>X (m) <input id="geo-stream-x" type="number" min="0" max="400" step="1" value="200"></label> ${geoButton('stream', 'add', true)}
        <div class="talls-geologics__points">${m.targets.map((t, i) => `<label>${geoT('point')} ${i + 1} · X=${t.x.toFixed(1)} m<input aria-label="${geoT('elevation')} ${i + 1}" data-geo-point="${i}" type="number" min="80" max="140" step="1" value="${a.profile[i] ?? ''}"></label>`).join('')}</div>`;
    if (g.phase === 2) return `<div class="talls-geologics__controls">${[
        geoSelect('contactType', geoT('contact'), ['discordant', 'concordant'], a.contactType),
        geoSelect('direction', geoT('attitude'), ['east', 'horizontal', 'west'], a.direction),
        geoSelect('alluvialType', geoT('alluvial'), ['concordant', 'discordant'], a.alluvialType),
        geoSelect('alluvialShape', geoT('shape'), ['plane', 'lens'], a.alluvialShape)
    ].join('')}</div>`;
    if (g.phase === 3) return `<div class="talls-geologics__controls">${[...m.rocks.slice(0, 2), 4].map(rock => `<button class="btn quiz-option-button" data-geo-rock="${rock}" aria-pressed="${g.selectedRock === rock}">${geoT(`rock${rock}`)}</button>`).join('')}</div>
        <div class="talls-geologics__controls">${m.regions.map(r => geoSelect(`fill-${r.id}`, `${geoT('region')} ${r.id + 1}`, [...m.rocks.slice(0, 2), 4], a.fills[r.id])).join('')}</div>`;
    return `<div class="talls-geologics__controls">${['village', 'camp'].map((site, i) =>
        geoSelect(`risk-${i}`, `${geoT(site)} · ${geoT('risk')}`, ['slide', 'flood', 'volcano'], a.risk[i]) +
        geoSelect(`risk-${i + 2}`, `${geoT(site)} · ${geoT('reason')}`, ['summit', 'magma', 'valley'], a.risk[i + 2])).join('')}
        ${geoSelect('risk-4', geoT('landMeasure'), ['build', 'relocate', 'pave'], a.risk[4])}
        ${geoSelect('risk-5', geoT('emergencyMeasure'), ['ignore', 'wall', 'alert'], a.risk[5])}</div>`;
}
function renderGeologicalGame() {
    const g = geologicalGame, m = g.model;
    const root = document.getElementById('geo-root');
    root.innerHTML = `<h2>${geoT('title')}</h2>
        <p>${geoT(`template${m.template}`)} · ${geoT('seed')}: <strong>${geoEscape(m.seed)}</strong> · v${m.version} · ${geoT(m.advanced ? 'advanced' : 'basic')}</p>
        <details><summary>${geoT('orientation')}</summary><p>${geoT('guide')}</p></details><p>${geoT('convention')}</p>
        <h3 id="geo-phase-title" tabindex="-1">${geoT(g.phase === 5 ? 'result' : `phase${g.phase}`)}</h3>
        <p>${geoT(g.phase === 5 ? 'overlay' : `help${g.phase}`)}</p>
        ${g.phase > 1 && g.phase < 5 ? `<p class="quiz-feedback--muted">${geoT('correction')}</p>` : ''}
        <div class="talls-geologics__legend">${[...m.rocks.slice(0, 2), 4].map((rock, i) => `<span><svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="url(#geo-rock-${rock})"/></svg>${geoT(`rock${rock}`)}${i < 2 ? ` (${geoT(i === 0 ? 'upper' : 'lower')})` : ''}</span>`).join('')}</div>
        <div class="talls-geologics__workspace"><div class="talls-geologics__drawing">${geoDrawing()}</div><div class="talls-geologics__answers">${g.phase < 5 ? geoPhaseControls() : geoResults()}</div></div>
        <p id="geo-feedback" role="status" aria-live="polite"></p>
        ${g.phase < 5 ? geoButton('next', g.phase === 4 ? 'final' : 'freeze') : `${geoButton('new', 'new', true)} ${!g.saved ? geoButton('save', 'retry') : ''}`} `;
    root.onclick = geoClick;
    root.onchange = geoChange;
    root.onkeydown = event => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target.hasAttribute('data-geo-region')) {
            event.preventDefault(); event.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
    };
    geoUpdateSaveStatus();
}
function geoResults() {
    const g = geologicalGame, m = g.model, result = g.result;
    return `<h3>${result.note.toFixed(2)} / 10 · ${result.pau.toFixed(2)} / 2,50 PAU</h3>
        <ul>${Object.entries(result.detail).map(([key, value]) => `<li>${geoT(key)}: ${value.toFixed(2)} / ${{ profile: 3, contacts: 2.5, lithology: 2, torrents: 1, risk: 1.5 }[key]}</li>`).join('')}</ul>
        <p>${geoT('explanation')}</p><p>${geoT('expected')}: ${geoT(m.direction)}; ${geoT('concordant')}; ${geoT('discordant')}; ${geoT('lens')}.</p>
        <details><summary>${geoT('profile')}</summary><ul>${m.targets.map((t, i) => `<li>${i + 1}: ${g.answers.profile[i] ?? geoT('empty')} → ${t.z.toFixed(1)} m</li>`).join('')}</ul></details>
        <ul>${m.regions.map(r => `<li>${geoT('region')} ${r.id + 1}: ${g.answers.fills[r.id] === r.rock ? geoT('correct') : `${g.answers.fills[r.id] === undefined ? geoT('empty') : geoT(`rock${g.answers.fills[r.id]}`)} → ${geoT(`rock${r.rock}`)}`}</li>`).join('')}</ul>
        <p>${geoT('expected')}: ${geoT('flood')}; ${geoT('valley')}; ${geoT('relocate')}; ${geoT('alert')}.</p>`;
}
function geoChange(event) {
    const g = geologicalGame;
    if (!g || g.phase === 5) return;
    g.acknowledgeEmpty = false;
    const el = event.target;
    if (el.hasAttribute('data-geo-point') && g.phase === 1) {
        const number = el.value === '' ? NaN : Number(el.value);
        g.answers.profile[Number(el.dataset.geoPoint)] = Number.isFinite(number) && number >= 80 && number <= 140 ? Math.round(number) : undefined;
        el.value = g.answers.profile[Number(el.dataset.geoPoint)] ?? '';
        document.getElementById('geo-drawing').outerHTML = geoDrawing();
    }
    const key = el.dataset.geoField;
    if (!key) return;
    if (key.startsWith('fill-') && g.phase === 3) g.answers.fills[key.slice(5)] = el.value === '' ? undefined : Number(el.value);
    else if (key.startsWith('risk-') && g.phase === 4) g.answers.risk[key.slice(5)] = el.value;
    else if (g.phase === 2) g.answers[key] = el.value;
    document.getElementById('geo-drawing').outerHTML = geoDrawing();
}
function geoClick(event) {
    const action = event.target.closest('[data-geo-action]')?.dataset.geoAction;
    const g = geologicalGame;
    if (!g || g.saving) return;
    if (action === 'new') { geologicalGame = null; renderGeologicalSetup(); return; }
    if (action === 'save') { guardarPuntuacioTallGeologic(); return; }
    if (action === 'undo' && g.phase === 1) { g.answers.streams.pop(); renderGeologicalGame(); return; }
    if (action === 'stream' && g.phase === 1) {
        const input = document.getElementById('geo-stream-x');
        if (input.value === '' || !input.checkValidity()) return;
        g.answers.streams.push({ x: Number(input.value), y: g.model.sectionY }); renderGeologicalGame(); return;
    }
    if (action === 'next' && g.phase < 5) {
        const a = g.answers;
        const complete = g.phase === 1 ? g.model.targets.every((_, i) => Number.isFinite(a.profile[i])) && a.streams.length > 0 :
            g.phase === 2 ? ['contactType', 'direction', 'alluvialType', 'alluvialShape'].every(key => a[key]) :
            g.phase === 3 ? g.model.regions.every(r => a.fills[r.id] !== undefined) : Array.from({ length: 6 }, (_, i) => a.risk[i]).every(Boolean);
        if (!complete && !g.acknowledgeEmpty) {
            g.acknowledgeEmpty = true; document.getElementById('geo-feedback').textContent = geoT('warning'); return;
        }
        g.acknowledgeEmpty = false;
        g.phase++;
        if (g.phase === 5) { g.result = GeologicalModel.score(g.model, a); g.elapsed = Math.round((Date.now() - g.startedAt) / 1000); }
        renderGeologicalGame();
        document.getElementById('geo-phase-title').focus();
        if (g.phase === 5) guardarPuntuacioTallGeologic();
        return;
    }
    const rock = event.target.closest('[data-geo-rock]');
    if (rock && g.phase === 3) { g.selectedRock = Number(rock.dataset.geoRock); renderGeologicalGame(); return; }
    const region = event.target.closest('[data-geo-region]');
    if (region && g.phase === 3) {
        const id = region.dataset.geoRegion;
        g.answers.fills[id] = g.selectedRock;
        renderGeologicalGame();
        document.querySelector(`[data-geo-region="${id}"]`)?.focus();
        return;
    }
    const svg = event.target.closest('#geo-drawing');
    if (!svg || g.phase !== 1) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
    const x = point.x - 40;
    if (x < 0 || x > 400) return;
    if (point.y >= 25 && point.y <= 305) g.answers.streams.push({ x, y: point.y - 25 });
    else if (point.y >= 390 && point.y <= 570) {
        const nearest = g.model.targets.reduce((best, t, i, arr) => Math.abs(t.x - x) < Math.abs(arr[best].x - x) ? i : best, 0);
        g.answers.profile[nearest] = Math.round(80 + (570 - point.y) / 3);
    } else return;
    g.acknowledgeEmpty = false;
    renderGeologicalGame();
}
function geoUpdateSaveStatus() {
    const g = geologicalGame;
    if (!g) return;
    const feedback = document.getElementById('geo-feedback');
    if (feedback && g.saveStatus) {
        feedback.textContent = geoT(g.saveStatus);
        setElementStateColor(feedback, g.saved ? 'success' : g.saving ? 'muted' : 'error');
    }
    document.querySelectorAll('#geo-root [data-geo-action]').forEach(button => {
        button.disabled = g.saving || (button.dataset.geoAction === 'save' && g.saved);
        if (button.dataset.geoAction === 'save') button.classList.toggle('hidden', g.saved);
    });
}
async function guardarPuntuacioTallGeologic() {
    const g = geologicalGame;
    if (!g || g.phase !== 5 || g.saving || g.saved) return;
    if (!g.user?.email || !g.project || state.user?.email !== g.user.email || state.currentProject?.id !== g.project.id) {
        g.saveStatus = 'session'; geoUpdateSaveStatus(); return;
    }
    g.saving = true; g.saveStatus = 'saving'; geoUpdateSaveStatus();
    const metadata = { exercici_id: 'pau_tall_geologic_random', seed_escenari: g.model.seed,
        versio: g.model.version, plantilla: g.model.template, punts_sobre_10: g.result.note,
        punts_pau_2_5: g.result.pau, desglossament: g.result.detail };
    try {
        const response = await callApi('saveResult', {
            email: g.user.email, curs: g.user.curs, grup: g.user.grup || g.user.curs,
            projecte: g.project.titol, app: 'Talls geològics i riscos (PAU)',
            nivell: g.model.advanced ? 'Avançat' : 'Bàsic', puntuacio: Math.round(g.result.note * 10),
            temps_segons: g.elapsed, feedback_pos: JSON.stringify(metadata),
            feedback_neg: Object.entries(g.result.detail).filter(([key, value]) => value < { profile: 3, contacts: 2.5, lithology: 2, torrents: 1, risk: 1.5 }[key]).map(([key]) => key).join(', ')
        });
        if (response?.status !== 'success') throw new Error(response?.message || 'saveResult');
        g.saved = true; g.saveStatus = 'saved';
    } catch (error) { console.error('Talls geològics:', error); g.saveStatus = 'error'; }
    finally { g.saving = false; if (geologicalGame === g) geoUpdateSaveStatus(); }
}
document.addEventListener('languageChanged', () => {
    const activity = document.getElementById('geo-activity');
    if (!activity || activity.classList.contains('hidden')) return;
    if (geologicalGame) {
        geologicalGame.mapMarkup = geoMap(geologicalGame.model);
        renderGeologicalGame();
    } else renderGeologicalSetup();
    setGameTitle(geoT('title'));
});

/* Reimplementació pròpia de l'activitat de diagrames de forces. */
(function () {
    'use strict';

    const ROOT_ID = 'fisica-batx-forces-activity';
    const MAX_POINTS = 10;
    const FORCE_NAMES = {
        weight: 'Pes', normal: 'Normal', friction: 'Fricció', applied: 'Força aplicada',
        tension: 'Tensió', motion: 'Força de moviment'
    };
    const FORCE_COLORS = { weight: '#ef4444', normal: '#2563eb', friction: '#f59e0b', applied: '#10b981', tension: '#8b5cf6', motion: '#94a3b8' };
    const FORCE_KEYS = Object.keys(FORCE_NAMES);
    const CENTER = { x: 320, y: 220 };
    const centerFor = (question) => {
        if (question?.category === 'pla inclinat') return { x: 320, y: 204 };
        if (question?.category === 'paret') return { x: 447, y: 220 };
        return CENTER;
    };
    const TOTAL_SITUATIONS = 10;
    const V = (x, y, magnitude) => ({ end: { x, y }, magnitude });

    const QUESTIONS = [
        { category: 'horitzontal', prompt: 'Un bloc de 4 kg es desplaça cap a la dreta sobre una superfície horitzontal sense fregament. Quines forces actuen sobre el bloc i com les has de representar?', data: 'm = 4 kg · superfície horitzontal · sense fregament', forces: ['weight', 'normal'], vectors: { weight: V(320, 315, 95), normal: V(320, 125, 95) }, explanation: 'El pes apunta verticalment cap avall i la normal del terra cap amunt. El moviment no és una força.', hints: ['Comença separant les interaccions del moviment: terra i gravetat.', 'En una superfície horitzontal sense fregament només hi ha dues forces verticals.'] },
        { category: 'horitzontal', prompt: 'Un bloc de 6 kg és estirat cap a la dreta amb una força horitzontal de 12 N sobre un terra sense fregament. El bloc accelera cap a la dreta.', data: 'm = 6 kg · F aplicada = 12 N · sense fregament', forces: ['weight', 'normal', 'applied'], vectors: { weight: V(320, 315, 95), normal: V(320, 125, 95), applied: V(430, 220, 72) }, explanation: 'La força aplicada és horitzontal i cap a la dreta. La normal i el pes són verticals i no s’ha d’afegir cap força de moviment.', hints: ['L’acceleració descriu el resultat de les forces, però no és una força nova.', 'Afegeix la interacció de la mà o la corda amb el bloc.'] },
        { category: 'pla inclinat', prompt: 'Un bloc reposa sobre un pla inclinat 25° cap amunt a la dreta. La superfície és llisa i el bloc llisca cap avall.', data: 'm = 3 kg · angle del pla = 25° · superfície llisa', forces: ['weight', 'normal'], vectors: { weight: V(320, 309, 100), normal: V(245, 139, 88) }, explanation: 'La normal sempre és perpendicular al pla. El pes continua sent vertical, independentment de la inclinació.', hints: ['El pes sempre apunta verticalment cap al centre de la Terra.', 'La normal ha de sortir perpendicular a la superfície, no verticalment.'] },
        { category: 'pla inclinat', prompt: 'Un bloc de 5 kg baixa per un pla inclinat 30° amb fregament. Representa totes les forces que actuen sobre ell.', data: 'm = 5 kg · angle = 30° · el bloc baixa cap a l’esquerra · amb fregament', forces: ['weight', 'normal', 'friction'], vectors: { weight: V(320, 309, 100), normal: V(250, 134, 88), friction: V(395, 164, 60) }, explanation: 'El fregament s’oposa al lliscament: si el bloc baixa cap a l’esquerra, apunta cap amunt del pla, a la dreta.', hints: ['El fregament sempre s’oposa al moviment relatiu entre les superfícies.', 'La fricció és paral·lela al pla i apunta cap amunt.'] },
        { category: 'fricció', prompt: 'Una força horitzontal estira un bloc cap a la dreta sobre un terra rugós. El bloc es mou a velocitat constant.', data: 'm = 8 kg · superfície rugosa · velocitat constant', forces: ['weight', 'normal', 'applied', 'friction'], vectors: { weight: V(320, 315, 95), normal: V(320, 125, 95), applied: V(430, 220, 72), friction: V(220, 220, 58) }, explanation: 'Com que es mou a velocitat constant, la força de fregament compensa horitzontalment la força aplicada.', hints: ['El terra rugós introdueix una força paral·lela a la superfície.', 'El fregament apunta en sentit contrari a la força aplicada i al moviment.'] },
        { category: 'fricció', prompt: 'Un bloc accelera cap a la dreta mentre una força horitzontal l’estira sobre una superfície rugosa.', data: 'm = 10 kg · acceleració cap a la dreta · superfície rugosa', forces: ['weight', 'normal', 'applied', 'friction'], vectors: { weight: V(320, 315, 95), normal: V(320, 125, 95), applied: V(440, 220, 85), friction: V(220, 220, 55) }, explanation: 'La força aplicada és més gran que el fregament, de manera que la resultant apunta cap a la dreta.', hints: ['Encara que acceleri, el fregament continua existint.', 'Dibuixa dues forces horitzontals oposades.'] },
        { category: 'tensió', prompt: 'Una massa de 2 kg penja verticalment d’una corda ideal subjectada al sostre i està en repòs.', data: 'm = 2 kg · corda ideal · repòs', forces: ['weight', 'tension'], vectors: { weight: V(320, 325, 92), tension: V(320, 125, 92) }, explanation: 'La corda exerceix una tensió cap amunt i la gravetat exerceix el pes cap avall.', hints: ['Busca totes les interaccions: gravetat i corda.', 'La tensió apunta al llarg de la corda, allunyant-se del cos.'] },
        { category: 'tensió', prompt: 'Un bloc sobre una taula és arrossegat cap a la dreta per una corda horitzontal. No hi ha fregament.', data: 'm = 7 kg · corda horitzontal · sense fregament', forces: ['weight', 'normal', 'tension'], vectors: { weight: V(320, 315, 95), normal: V(320, 125, 95), tension: V(435, 220, 75) }, explanation: 'La corda estira el bloc en la seva direcció. La taula aporta la normal i la Terra aporta el pes.', hints: ['Una corda només pot estirar, no empènyer.', 'La tensió té la mateixa direcció que la corda.'] },
        { category: 'paret', prompt: 'Un bloc és pressionat horitzontalment contra una paret vertical per una força cap a la dreta i queda en repòs.', data: 'm = 4 kg · paret vertical · bloc en repòs · sense lliscament', forces: ['weight', 'normal', 'applied', 'friction'], vectors: { weight: V(447, 315, 95), normal: V(347, 220, 78), applied: V(557, 220, 78), friction: V(447, 125, 60) }, explanation: 'La paret empeny el bloc cap a l’esquerra amb la normal. El fregament cap amunt evita que el bloc caigui.', hints: ['La paret també pot exercir una normal, perpendicular a ella.', 'Perquè no caigui, el fregament ha de ser vertical cap amunt.'] },
        { category: 'paret', prompt: 'Un bloc baixa lliscant per una paret vertical. La paret exerceix fregament sobre el bloc.', data: 'm = 5 kg · moviment cap avall · paret vertical', forces: ['weight', 'normal', 'friction'], vectors: { weight: V(447, 315, 95), normal: V(347, 220, 78), friction: V(447, 130, 55) }, explanation: 'El fregament s’oposa al moviment de baixada i apunta cap amunt. La normal és perpendicular a la paret.', hints: ['El fregament sempre s’oposa al lliscament.', 'La normal d’una paret vertical és horitzontal.'] }
    ];

    function initFisicaBatxilleratForces() {
        const root = document.getElementById(ROOT_ID);
        if (!root || root.dataset.initialized === 'true') return;
        root.dataset.initialized = 'true';
        const shuffle = (items) => items.map((item) => ({ item, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ item }) => item);
        const state = { question: 0, order: shuffle(QUESTIONS.map((_, index) => index)).slice(0, TOTAL_SITUATIONS), points: 0, responses: [], selected: [], drawings: {}, activeForce: null, hintLevel: 0, showSolution: false, startedAt: Date.now(), drag: null, saved: false };
        const $ = (id) => document.getElementById(id);
        const setText = (id, text) => { const el = $(id); if (el) el.textContent = text; };
        const show = (id, visible) => { const el = $(id); if (el) el.classList.toggle('hidden', !visible); };
        const current = () => QUESTIONS[state.order[state.question]];

        function createSvg(tag, attrs, text) {
            const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
            Object.entries(attrs || {}).forEach(([key, value]) => el.setAttribute(key, value));
            if (text) el.textContent = text;
            return el;
        }
        function arrow(svg, start, end, color, label, dashed, force) {
            const markerId = `force-arrow-${color.replace('#', '')}`;
            let defs = svg.querySelector('defs');
            if (!defs) { defs = createSvg('defs'); svg.appendChild(defs); }
            if (!svg.querySelector(`#${markerId}`)) {
                const marker = createSvg('marker', { id: markerId, markerWidth: 4, markerHeight: 4, refX: 3.5, refY: 2, orient: 'auto' });
                marker.appendChild(createSvg('path', { d: 'M0,0 L4,2 L0,4 z', fill: color })); defs.appendChild(marker);
            }
            const line = createSvg('line', { x1: start.x, y1: start.y, x2: end.x, y2: end.y, stroke: color, 'stroke-width': 4, 'marker-end': `url(#${markerId})`, class: dashed ? 'fisica-batx-forces__vector fisica-batx-forces__vector--solution' : 'fisica-batx-forces__vector' });
            svg.appendChild(line);
            if (label) {
                const offsets = { weight: { x: 10, y: 8 }, normal: { x: -78, y: -8 }, friction: { x: 10, y: 26 }, applied: { x: 10, y: -8 }, tension: { x: 10, y: -8 } };
                const offset = offsets[force] || { x: 10, y: 4 };
                svg.appendChild(createSvg('text', { x: end.x + offset.x, y: end.y + offset.y, fill: color, class: 'fisica-batx-forces__vector-label' }, label));
            }
        }
        function referenceLine(svg, start, end, label, className, labelOffset = { x: 8, y: 4 }) {
            const markerId = `reference-${className}`;
            if (!svg.querySelector(`#${markerId}`)) {
                const marker = createSvg('marker', { id: markerId, markerWidth: 4, markerHeight: 4, refX: 3.5, refY: 2, orient: 'auto' });
                marker.appendChild(createSvg('path', { d: 'M0,0 L4,2 L0,4 z', fill: '#475569' })); svg.querySelector('defs').appendChild(marker);
            }
            svg.appendChild(createSvg('line', { x1: start.x, y1: start.y, x2: end.x, y2: end.y, class: `fisica-batx-forces__reference ${className}`, 'marker-end': `url(#${markerId})` }));
            svg.appendChild(createSvg('text', { x: end.x + labelOffset.x, y: end.y + labelOffset.y, class: 'fisica-batx-forces__reference-label' }, label));
        }
        function renderReferenceSystem(svg, q) {
            const center = centerFor(q);
            if (q.category === 'pla inclinat') {
                referenceLine(svg, { x: 125, y: center.y }, { x: 505, y: center.y }, 'horitzontal', 'fisica-batx-forces__reference--world');
                referenceLine(svg, { x: center.x, y: 370 }, { x: center.x, y: 45 }, 'vertical', 'fisica-batx-forces__reference--world');
                referenceLine(svg, center, { x: 520, y: 125 }, '|| pla', 'fisica-batx-forces__reference--plane');
                referenceLine(svg, center, { x: 235, y: 42 }, '⊥ pla', 'fisica-batx-forces__reference--normal');
            } else {
                referenceLine(svg, center, { x: 450, y: center.y }, 'x', 'fisica-batx-forces__reference--axis');
                referenceLine(svg, center, { x: center.x, y: 105 }, 'y', 'fisica-batx-forces__reference--axis');
            }
        }
        function renderVelocity(svg, q) {
            const center = centerFor(q);
            if (q.category === 'pla inclinat') {
                referenceLine(svg, { x: center.x + 30, y: center.y - 19 }, { x: 445, y: 142 }, 'v', 'fisica-batx-forces__velocity');
                referenceLine(svg, center, { x: 220, y: 248 }, 'a', 'fisica-batx-forces__acceleration', { x: -5, y: 25 });
            } else if (q.category === 'paret') {
                referenceLine(svg, { x: 200, y: 285 }, { x: 200, y: 185 }, 'v', 'fisica-batx-forces__velocity');
            } else if (q.category === 'tensió' && q === QUESTIONS[6]) {
                referenceLine(svg, { x: 385, y: 185 }, { x: 385, y: 285 }, 'v', 'fisica-batx-forces__velocity');
            } else {
                referenceLine(svg, { x: 365, y: 165 }, { x: 465, y: 165 }, 'v', 'fisica-batx-forces__velocity');
            }
        }
        function renderScene(solution) {
            const svg = $('fisica-batx-forces-scene');
            if (!svg) return;
            const q = current(); const center = centerFor(q); svg.replaceChildren();
            const defs = createSvg('defs');
            const pattern = createSvg('pattern', { id: 'grid', width: 24, height: 24, patternUnits: 'userSpaceOnUse' });
            pattern.appendChild(createSvg('path', { d: 'M 24 0 L 0 0 0 24', fill: 'none', stroke: '#dbe5ef', 'stroke-width': 1 })); defs.appendChild(pattern); svg.appendChild(defs);
            const motionMarker = createSvg('marker', { id: 'motion-arrow', markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' });
            motionMarker.appendChild(createSvg('path', { d: 'M0,0 L8,4 L0,8 z', fill: '#64748b' })); defs.appendChild(motionMarker);
            svg.appendChild(createSvg('rect', { width: 640, height: 400, rx: 18, fill: '#ffffff' }));
            if (q.category === 'pla inclinat') {
                svg.appendChild(createSvg('polygon', { points: '58,340 560,120 560,350 58,350', fill: '#d8d8d8' }));
                svg.appendChild(createSvg('line', { x1: 58, y1: 340, x2: 560, y2: 120, class: 'fisica-batx-forces__surface' }));
                svg.appendChild(createSvg('rect', { x: 282, y: 184, width: 76, height: 40, rx: 5, fill: '#d9d9d9', stroke: '#333333', 'stroke-width': 3, transform: 'rotate(-24 320 204)' }));
                svg.appendChild(createSvg('circle', { cx: center.x, cy: center.y, r: 5, class: 'fisica-batx-forces__scene-center' }));
                svg.appendChild(createSvg('line', { x1: 58, y1: 340, x2: 122, y2: 340, class: 'fisica-batx-forces__angle-base' }));
                svg.appendChild(createSvg('path', { d: 'M92 340 A34 34 0 0 0 88.8 326.15', class: 'fisica-batx-forces__angle' }));
                svg.appendChild(createSvg('text', { x: 98, y: 365, class: 'fisica-batx-forces__angle-label' }, '25°'));
            } else if (q.category === 'paret') {
                svg.appendChild(createSvg('rect', { x: 485, y: 55, width: 42, height: 285, fill: '#b7c3d0', stroke: '#64748b', 'stroke-width': 3 }));
                svg.appendChild(createSvg('path', { d: 'M485 65 l-18 18 m18 20 l-18 18 m18 20 l-18 18 m18 20 l-18 18 m18 20 l-18 18 m18 20 l-18 18 m18 20 l-18 18', class: 'fisica-batx-forces__wall-lines' }));
                svg.appendChild(createSvg('rect', { x: 409, y: 200, width: 76, height: 40, rx: 6, fill: '#f4a261', stroke: '#9a4d20', 'stroke-width': 3 }));
                svg.appendChild(createSvg('text', { x: 490, y: 43, class: 'fisica-batx-forces__scene-label' }, 'paret'));
            } else if (q.category === 'tensió' && q === QUESTIONS[6]) {
                svg.appendChild(createSvg('line', { x1: 320, y1: 50, x2: 320, y2: 192, class: 'fisica-batx-forces__rope' }));
                svg.appendChild(createSvg('line', { x1: 275, y1: 50, x2: 365, y2: 50, class: 'fisica-batx-forces__ceiling' }));
                svg.appendChild(createSvg('circle', { cx: 320, cy: 220, r: 30, fill: '#f4a261', stroke: '#9a4d20', 'stroke-width': 3 }));
            } else {
                svg.appendChild(createSvg('line', { x1: 70, y1: 242, x2: 570, y2: 242, class: 'fisica-batx-forces__surface fisica-batx-forces__surface--horizontal' }));
                svg.appendChild(createSvg('line', { x1: 70, y1: 252, x2: 570, y2: 252, class: 'fisica-batx-forces__ground' }));
                svg.appendChild(createSvg('rect', { x: 282, y: 200, width: 76, height: 40, rx: 6, fill: '#f4a261', stroke: '#9a4d20', 'stroke-width': 3 }));
                if (q.category === 'fricció') svg.appendChild(createSvg('path', { d: 'M80 242 l12 12 m12 -12 l12 12 m12 -12 l12 12 m12 -12 l12 12 m12 -12 l12 12', class: 'fisica-batx-forces__roughness' }));
            }
            if (q === QUESTIONS[7]) svg.appendChild(createSvg('line', { x1: 320, y1: 220, x2: 435, y2: 220, class: 'fisica-batx-forces__rope' }));
            renderReferenceSystem(svg, q);
            renderVelocity(svg, q);
            const vectors = solution ? q.vectors : state.drawings;
            Object.entries(vectors).forEach(([force, vector]) => arrow(svg, center, vector.end, FORCE_COLORS[force], solution ? FORCE_NAMES[force] : null, solution, force));
            if (!solution && state.activeForce) svg.appendChild(createSvg('circle', { cx: center.x, cy: center.y, r: 7, class: 'fisica-batx-forces__origin' }));
            if ($('fisica-batx-forces-guide').checked) {
                svg.appendChild(createSvg('line', { x1: 100, y1: 220, x2: 540, y2: 220, class: 'fisica-batx-forces__guide' }));
                if (q.category === 'pla inclinat') svg.appendChild(createSvg('line', { x1: 170, y1: 325, x2: 490, y2: 205, class: 'fisica-batx-forces__guide' }));
            }
            if ($('fisica-batx-forces-world-guide').checked) {
                svg.appendChild(createSvg('line', { x1: 320, y1: 55, x2: 320, y2: 365, class: 'fisica-batx-forces__guide fisica-batx-forces__guide--world' }));
                svg.appendChild(createSvg('line', { x1: 75, y1: 220, x2: 565, y2: 220, class: 'fisica-batx-forces__guide fisica-batx-forces__guide--world' }));
            }
        }
        function renderOptions() {
            const wrap = $('fisica-batx-forces-options'); wrap.replaceChildren();
            FORCE_KEYS.forEach((force) => {
                const label = document.createElement('label'); label.className = 'fisica-batx-forces__force-option';
                const input = document.createElement('input'); input.type = 'checkbox'; input.value = force; input.checked = state.selected.includes(force);
                input.addEventListener('change', () => { state.selected = [...wrap.querySelectorAll('input:checked')].map((el) => el.value); });
                const swatch = document.createElement('span'); swatch.className = 'fisica-batx-forces__swatch'; swatch.style.setProperty('--force-color', FORCE_COLORS[force]);
                label.append(input, swatch, document.createTextNode(FORCE_NAMES[force])); wrap.appendChild(label);
            });
        }
        function renderForceButtons() {
            const wrap = $('fisica-batx-forces-buttons'); wrap.replaceChildren();
            state.selected.forEach((force) => {
                const button = document.createElement('button'); button.type = 'button'; button.className = 'btn fisica-batx-forces__force-button'; button.dataset.force = force; button.textContent = FORCE_NAMES[force]; button.style.setProperty('--force-color', FORCE_COLORS[force]);
                button.addEventListener('click', () => { state.activeForce = force; wrap.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === button)); setText('fisica-batx-forces-draw-status', `Dibuixa ara el vector de ${FORCE_NAMES[force]}.`); renderScene(false); }); wrap.appendChild(button);
            });
            state.activeForce = state.selected[0] || null; if (wrap.firstElementChild) wrap.firstElementChild.classList.add('is-active');
        }
        function renderQuestion() {
            const q = current(); state.selected = []; state.drawings = {}; state.activeForce = null; state.hintLevel = 0; state.showSolution = false;
            setText('fisica-batx-forces-phase', state.responses.length < 5 ? 'Diagnòstic' : 'Pràctica aleatòria');
            setText('fisica-batx-forces-counter', `Situació ${state.responses.length + 1} de ${TOTAL_SITUATIONS}`);
            setText('fisica-batx-forces-session-score', `Puntuació: ${state.points.toFixed(1).replace('.', ',')} / ${MAX_POINTS}`);
            setText('fisica-batx-forces-prompt', q.prompt); setText('fisica-batx-forces-data', q.data);
            $('fisica-batx-forces-progress').style.width = `${Math.min(100, state.points / MAX_POINTS * 100)}%`;
            show('fisica-batx-forces-selection', true); show('fisica-batx-forces-drawing', false); show('fisica-batx-forces-feedback', false); show('fisica-batx-forces-hint-box', false); show('fisica-batx-forces-report', false);
            renderOptions(); renderScene(false);
        }
        function readPoint(event) { const rect = $('fisica-batx-forces-scene').getBoundingClientRect(); return { x: (event.clientX - rect.left) * 640 / rect.width, y: (event.clientY - rect.top) * 400 / rect.height }; }
        function finishDrawing(event) { if (!state.drag) return; const point = readPoint(event); const center = centerFor(current()); state.drawings[state.drag.force] = { end: point, magnitude: Math.hypot(point.x - center.x, point.y - center.y) }; state.drag = null; renderScene(false); }
        function scoreResponse() {
            const q = current(); const center = centerFor(q); const selected = state.selected; const correct = q.forces;
            const tp = selected.filter((force) => correct.includes(force)).length;
            const identification = ((tp / correct.length) + (tp / Math.max(1, selected.length))) / 2;
            const detail = {}; let direction = 0; let magnitude = 0;
            correct.forEach((force) => {
                const expected = q.vectors[force]; const actual = state.drawings[force];
                if (!actual) { detail[force] = { direction: 0, magnitude: 0, missing: true }; return; }
                const a = Math.atan2(actual.end.y - center.y, actual.end.x - center.x); const e = Math.atan2(expected.end.y - center.y, expected.end.x - center.x);
                let delta = Math.abs(a - e); if (delta > Math.PI) delta = 2 * Math.PI - delta;
                const directionPart = Math.max(0, 1 - delta / (Math.PI / 2)); const magnitudePart = Math.max(0, 1 - Math.abs(actual.magnitude - expected.magnitude) / expected.magnitude);
                direction += directionPart; magnitude += magnitudePart; detail[force] = { direction: Math.round(directionPart * 100), magnitude: Math.round(magnitudePart * 100) };
            });
            direction /= correct.length; magnitude /= correct.length;
            let percent = identification * 35 + direction * 40 + magnitude * 25;
            if (state.hintLevel > 0) percent *= state.hintLevel === 1 ? 0.8 : 0.6;
            percent = Math.round(percent); const points = percent / 100 * 1.25; state.points += points;
            const errors = []; if (tp !== correct.length || selected.length !== correct.length) errors.push('identificació de forces'); if (direction < 0.8) errors.push('direcció i sentit'); if (magnitude < 0.8) errors.push('mòdul dels vectors');
            state.responses.push({ situation: state.responses.length + 1, category: q.category, prompt: q.prompt, selected: [...selected], correct: [...correct], drawings: JSON.parse(JSON.stringify(state.drawings)), score: percent, points, detail, hints: state.hintLevel, errors });
            setText('fisica-batx-forces-score', `${percent}%`); setText('fisica-batx-forces-score-breakdown', `Forces: ${Math.round(identification * 35)}/35 · direccions: ${Math.round(direction * 40)}/40 · mòduls: ${Math.round(magnitude * 25)}/25`);
            setText('fisica-batx-forces-explanation', q.explanation); show('fisica-batx-forces-drawing', false); show('fisica-batx-forces-feedback', true); setText('fisica-batx-forces-feedback-list', errors.length ? `Revisa: ${errors.join(', ')}.` : 'Molt bé: has identificat i representat correctament totes les forces.'); renderScene(false);
            const next = $('fisica-batx-forces-next'); next.textContent = state.points >= MAX_POINTS || state.responses.length >= TOTAL_SITUATIONS ? 'Finalitza i mostra l’informe' : 'Següent situació';
        }
        function showHint() { const q = current(); if (state.hintLevel < 2) state.hintLevel += 1; const text = q.hints[state.hintLevel - 1]; setText('fisica-batx-forces-hint-box', `Pista ${state.hintLevel}: ${text}`); show('fisica-batx-forces-hint-box', true); }
        function report(persist = false) {
            const average = state.responses.length ? state.responses.reduce((sum, item) => sum + item.score, 0) / state.responses.length : 0; setText('fisica-batx-forces-report-score', `Resultat: ${Math.round(average)}% de mitjana · ${state.points.toFixed(1).replace('.', ',')} punts de ${MAX_POINTS}`);
            const groups = {}; state.responses.forEach((item) => { groups[item.category] = groups[item.category] || []; groups[item.category].push(item.score); });
            const list = Object.entries(groups).map(([name, scores]) => { const value = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length); return `<div class="fisica-batx-forces__skill"><strong>${name}</strong><span>${value}%</span><progress value="${value}" max="100">${value}%</progress></div>`; }).join(''); $('fisica-batx-forces-skill-report').innerHTML = list || '<p>Encara no hi ha respostes.</p>'; setText('fisica-batx-forces-recommendation', average >= 80 ? 'Domines els diagrames de forces. Prova situacions amb més d’una interacció.' : 'Continua practicant la identificació d’interaccions abans de dibuixar els vectors.'); show('fisica-batx-forces-report', true); if (persist) saveResults(); }
        function saveResults() {
            if (state.saved || typeof window.callApi !== 'function' || !state.responses.length) return;
            const average = state.responses.reduce((sum, item) => sum + item.score, 0) / state.responses.length; const positive = state.responses.filter((item) => item.score >= 70).length;
            const payload = { game: 'fisica-batxillerat-forces', activity: 'Diagrames de forces', score: Math.round(average), points: Number(state.points.toFixed(2)), total: MAX_POINTS, timeSeconds: Math.round((Date.now() - state.startedAt) / 1000), phase: 'random-10', questions: state.responses.length, feedback_pos: JSON.stringify({ responses: state.responses, positive }), feedback_neg: JSON.stringify({ errors: state.responses.flatMap((item) => item.errors), hints: state.responses.reduce((sum, item) => sum + item.hints, 0) }) };
            setText('fisica-batx-forces-save-feedback', 'Desant el resultat...');
            callApi('saveResult', { email: window.appState.user.email, curs: window.appState.user.curs, grup: window.appState.user.grup || window.appState.user.curs, projecte: window.appState.currentProject.titol, app: 'Dinàmica - Diagrames de forces', nivell: '1r Batxillerat', puntuacio: Math.round(average), temps_segons: Math.round((Date.now() - state.startedAt) / 1000), feedback_pos: payload.feedback_pos, feedback_neg: payload.feedback_neg }).then((response) => { if (!response || response.status !== 'success') throw new Error(response?.message || 'saveResult'); state.saved = true; setText('fisica-batx-forces-save-feedback', 'Resultat desat correctament.'); show('fisica-batx-forces-save-retry', false); }).catch(() => { setText('fisica-batx-forces-save-feedback', 'No s’ha pogut desar ara. Ho pots tornar a provar.'); show('fisica-batx-forces-save-retry', true); });
        }
        $('fisica-batx-forces-confirm').addEventListener('click', () => { if (!state.selected.length) return setText('fisica-batx-forces-draw-status', 'Selecciona almenys una força.'); renderForceButtons(); show('fisica-batx-forces-selection', false); show('fisica-batx-forces-drawing', true); setText('fisica-batx-forces-draw-status', `Dibuixa el vector de ${FORCE_NAMES[state.activeForce]}.`); renderScene(false); });
        $('fisica-batx-forces-check').addEventListener('click', () => { if (Object.keys(state.drawings).length < state.selected.length) return setText('fisica-batx-forces-draw-status', 'Dibuixa un vector per a cada força seleccionada.'); scoreResponse(); });
        $('fisica-batx-forces-back-selection').addEventListener('click', () => { show('fisica-batx-forces-drawing', false); show('fisica-batx-forces-selection', true); renderOptions(); });
        $('fisica-batx-forces-undo').addEventListener('click', () => { const keys = Object.keys(state.drawings); delete state.drawings[keys[keys.length - 1]]; renderScene(false); });
        $('fisica-batx-forces-hint').addEventListener('click', showHint); $('fisica-batx-forces-report-button').addEventListener('click', () => report(false)); $('fisica-batx-forces-close-report').addEventListener('click', () => show('fisica-batx-forces-report', false)); $('fisica-batx-forces-save-retry').addEventListener('click', () => { state.saved = false; saveResults(); });
        $('fisica-batx-forces-next').addEventListener('click', () => { if (state.points >= MAX_POINTS || state.responses.length >= TOTAL_SITUATIONS) return report(true); state.question += 1; renderQuestion(); });
        $('fisica-batx-forces-reset').addEventListener('click', () => { state.question = 0; state.order = shuffle(QUESTIONS.map((_, index) => index)).slice(0, TOTAL_SITUATIONS); state.points = 0; state.responses = []; state.saved = false; state.startedAt = Date.now(); renderQuestion(); });
        $('fisica-batx-forces-calculator').addEventListener('click', () => {
            const expression = window.prompt('Calculadora: escriu una expressió amb nombres, +, -, *, / i parèntesis.');
            if (!expression) return;
            if (!/^[0-9+\-*/().\s]+$/.test(expression)) return window.alert('Expressió no vàlida.');
            try { window.alert(`${expression} = ${Function(`"use strict"; return (${expression})`)()}`); } catch (error) { window.alert('No s’ha pogut calcular l’expressió.'); }
        });
        $('fisica-batx-forces-guide').addEventListener('change', () => renderScene(state.showSolution)); $('fisica-batx-forces-world-guide').addEventListener('change', () => renderScene(state.showSolution)); $('fisica-batx-forces-view-student').addEventListener('click', () => { state.showSolution = false; renderScene(false); }); $('fisica-batx-forces-view-solution').addEventListener('click', () => { state.showSolution = true; renderScene(true); });
        const scene = $('fisica-batx-forces-scene'); scene.addEventListener('pointerdown', (event) => { if (!state.activeForce || !scene.contains(event.target)) return; const point = readPoint(event); const center = centerFor(current()); if (Math.hypot(point.x - center.x, point.y - center.y) > 55) return; event.preventDefault(); state.drag = { force: state.activeForce }; scene.setPointerCapture(event.pointerId); }); scene.addEventListener('pointerup', (event) => { event.preventDefault(); finishDrawing(event); }); scene.addEventListener('pointercancel', () => { state.drag = null; }); scene.addEventListener('pointermove', (event) => { if (!state.drag) return; event.preventDefault(); const point = readPoint(event); const center = centerFor(current()); state.drawings[state.drag.force] = { end: point, magnitude: Math.hypot(point.x - center.x, point.y - center.y) }; renderScene(false); });
        renderQuestion();
    }

    window.initFisicaBatxilleratForces = initFisicaBatxilleratForces;
}());

/* Reimplementació pròpia de Treball mecànic: mesura gràfica de vectors. */
(function () {
    'use strict';

    const ROOT_ID = 'fisica-batx-treball-activity';
    const EXERCISES = 6;
    const PARTS = 5;
    const TOLERANCE = { length: 0.16, angle: 2.5, vector: 13 };

    function initFisicaBatxilleratTreball() {
        const root = document.getElementById(ROOT_ID);
        if (!root || root.dataset.initialized === 'true') return;
        root.dataset.initialized = 'true';
        const canvas = document.getElementById('fisica-batx-treball-canvas');
        const ctx = canvas.getContext('2d');
        const $ = (id) => document.getElementById(id);
        const state = { exercise: 1, completed: 0, attempts: 0, points: 0, firstCaptured: false, firstPoints: 0, perfect: false, tool: 'draw', ruler: [], protractor: { center: null, rotation: 0, dragging: false, rotating: false }, ex: null, history: [], saved: false, startTime: Date.now(), width: 0, height: 0, scale: 36 };
        const inputs = { dr: $('fisica-batx-treball-dr'), force: $('fisica-batx-treball-force'), angle: $('fisica-batx-treball-angle'), work: $('fisica-batx-treball-work') };

        function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
        function magnitude(vector) { return Math.hypot(vector.x, vector.y); }
        function dot(a, b) { return a.x * b.x + a.y * b.y; }
        function vectorAngle(a, b) { return Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (magnitude(a) * magnitude(b))))) * 180 / Math.PI; }
        function signature(ex) { return [ex.A.x, ex.A.y, ex.B.x, ex.B.y, ex.F.x, ex.F.y].join(','); }
        function generateExercise() {
            for (let attempt = 0; attempt < 500; attempt += 1) {
                const A = { x: randomInt(-4, 1), y: randomInt(-3, 3) };
                const B = { x: randomInt(-3, 5), y: randomInt(-3, 3) };
                const F = { x: randomInt(-5, 5), y: randomInt(-4, 4) };
                const displacement = { x: B.x - A.x, y: B.y - A.y };
                const FEnd = { x: A.x + F.x, y: A.y + F.y };
                const angle = vectorAngle(displacement, F);
                const item = { A, B, F, FEnd };
                if (magnitude(displacement) < 2.5 || magnitude(displacement) > 7.5 || magnitude(F) < 2.3 || magnitude(F) > 6.5 || Math.abs(FEnd.x) > 7 || Math.abs(FEnd.y) > 5 || (angle > 84 && angle < 96) || state.history.includes(signature(item))) continue;
                state.history.push(signature(item)); state.history = state.history.slice(-20); return item;
            }
            return { A: { x: -2, y: -1 }, B: { x: 3, y: 2 }, F: { x: 4, y: 1 }, FEnd: { x: 2, y: 0 } };
        }
        function pointToCanvas(point) { return { x: state.width / 2 + point.x * state.scale, y: state.height / 2 - point.y * state.scale }; }
        function canvasToPoint(point) { return { x: (point.x - state.width / 2) / state.scale, y: (state.height / 2 - point.y) / state.scale }; }
        function pointer(event) { const rect = canvas.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top }; }
        function drawArrow(start, end, color, width) {
            ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width || 3; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
            const angle = Math.atan2(end.y - start.y, end.x - start.x); const length = 9;
            ctx.beginPath(); ctx.moveTo(end.x, end.y); ctx.lineTo(end.x - length * Math.cos(angle - 0.5), end.y - length * Math.sin(angle - 0.5)); ctx.lineTo(end.x - length * Math.cos(angle + 0.5), end.y - length * Math.sin(angle + 0.5)); ctx.closePath(); ctx.fill(); ctx.restore();
        }
        function label(text, point, color) { ctx.save(); ctx.font = '700 16px Georgia'; ctx.fillStyle = color || '#334155'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.strokeText(text, point.x + 7, point.y - 7); ctx.fillText(text, point.x + 7, point.y - 7); ctx.restore(); }
        function drawGrid() {
            ctx.clearRect(0, 0, state.width, state.height); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, state.width, state.height);
            const origin = pointToCanvas({ x: 0, y: 0 }); ctx.lineWidth = 1;
            for (let x = origin.x % state.scale; x < state.width; x += state.scale / 5) { ctx.strokeStyle = Math.round((x - origin.x) / state.scale) % 5 === 0 ? '#cbd5e1' : '#e8eef4'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, state.height); ctx.stroke(); }
            for (let y = origin.y % state.scale; y < state.height; y += state.scale / 5) { ctx.strokeStyle = Math.round((y - origin.y) / state.scale) % 5 === 0 ? '#cbd5e1' : '#e8eef4'; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(state.width, y); ctx.stroke(); }
            ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, origin.y); ctx.lineTo(state.width, origin.y); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, state.height); ctx.stroke();
            ctx.font = '12px system-ui'; ctx.fillStyle = '#64748b'; ctx.fillText('x', state.width - 18, origin.y - 7); ctx.fillText('y', origin.x + 7, 15);
        }
        function drawProtractor() {
            if (state.tool !== 'protractor' || !state.protractor.center) return;
            const p = state.protractor.center; const radius = Math.min(120, Math.max(85, state.scale * 2.8)); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(state.protractor.rotation);
            ctx.fillStyle = 'rgba(125, 211, 252, .15)'; ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, radius, Math.PI, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1; for (let degrees = 0; degrees <= 180; degrees += 10) { const radians = degrees * Math.PI / 180; const inner = radius - (degrees % 30 === 0 ? 14 : 8); ctx.beginPath(); ctx.moveTo(Math.cos(radians) * inner, -Math.sin(radians) * inner); ctx.lineTo(Math.cos(radians) * radius, -Math.sin(radians) * radius); ctx.stroke(); }
            ctx.strokeStyle = '#0369a1'; ctx.beginPath(); ctx.moveTo(-radius, 0); ctx.lineTo(radius, 0); ctx.stroke(); ctx.restore();
        }
        function draw() {
            if (!state.ex) return; drawGrid(); const A = pointToCanvas(state.ex.A); const B = pointToCanvas(state.ex.B); const F = pointToCanvas(state.ex.FEnd);
            drawArrow(A, F, '#15803d', 4); label('F', F, '#15803d');
            ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(A.x, A.y, 6, 0, Math.PI * 2); ctx.fill(); label('A', A, '#991b1b');
            ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(B.x, B.y, 6, 0, Math.PI * 2); ctx.fill(); label('B', B, '#1d4ed8');
            if (state.drawStart && state.drawEnd) { drawArrow(state.drawStart, state.drawEnd, '#111827', 4); label('Δr', state.drawEnd, '#111827'); }
            if (state.ruler.length === 2) { ctx.save(); ctx.setLineDash([7, 5]); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(state.ruler[0].x, state.ruler[0].y); ctx.lineTo(state.ruler[1].x, state.ruler[1].y); ctx.stroke(); ctx.restore(); }
            state.ruler.forEach((point) => { ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); ctx.fill(); }); drawProtractor();
        }
        function resize() { const rect = canvas.parentElement.getBoundingClientRect(); const width = Math.max(320, Math.floor(rect.width - 20)); const height = Math.max(300, Math.floor(rect.height - 20)); const previous = state.width ? { start: state.drawStart && canvasToPoint(state.drawStart), end: state.drawEnd && canvasToPoint(state.drawEnd) } : null; const dpr = window.devicePixelRatio || 1; state.width = width; state.height = height; state.scale = Math.max(24, Math.min(42, (width - 80) / 14, (height - 70) / 10)); canvas.width = width * dpr; canvas.height = height * dpr; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (previous?.start) state.drawStart = pointToCanvas(previous.start); if (previous?.end) state.drawEnd = pointToCanvas(previous.end); draw(); }
        function setText(id, value) { const element = $(id); if (element) element.textContent = value; }
        function parse(value) { const number = Number(String(value).replace(',', '.')); return Number.isFinite(number) ? number : null; }
        function getResults() { const displacement = { x: state.ex.B.x - state.ex.A.x, y: state.ex.B.y - state.ex.A.y }; return { dr: magnitude(displacement), force: magnitude(state.ex.F), angle: vectorAngle(displacement, state.ex.F), work: magnitude(displacement) * magnitude(state.ex.F) * Math.cos(vectorAngle(displacement, state.ex.F) * Math.PI / 180) }; }
        function mark(id, good, feedback) { const item = $(id); item.classList.remove('is-correct', 'is-wrong'); item.classList.add(good ? 'is-correct' : 'is-wrong'); item.querySelector('.fisica-batx-treball__mark').textContent = good ? '✓' : '×'; item.querySelector('.fisica-batx-treball__feedback').textContent = feedback; }
        function vectorCorrect() { if (!state.drawStart || !state.drawEnd) return false; const A = pointToCanvas(state.ex.A); const B = pointToCanvas(state.ex.B); return Math.hypot(state.drawStart.x - A.x, state.drawStart.y - A.y) <= TOLERANCE.vector && Math.hypot(state.drawEnd.x - B.x, state.drawEnd.y - B.y) <= TOLERANCE.vector; }
        function check() {
            if (state.perfect) return; state.attempts += 1; const result = getResults(); const values = [vectorCorrect(), false, false, false, false]; const dr = parse(inputs.dr.value); const force = parse(inputs.force.value); const angle = parse(inputs.angle.value); const work = parse(inputs.work.value);
            values[1] = dr !== null && Math.abs(dr - result.dr) <= TOLERANCE.length; values[2] = force !== null && Math.abs(force - result.force) <= TOLERANCE.length; values[3] = angle !== null && Math.abs(angle - result.angle) <= TOLERANCE.angle; const calculated = dr !== null && force !== null && angle !== null ? dr * force * Math.cos(angle * Math.PI / 180) : result.work; values[4] = work !== null && Math.abs(work - calculated) <= Math.max(1, Math.abs(result.work) * .1);
            mark('fisica-batx-treball-item-vector', values[0], values[0] ? 'Vector correcte.' : 'Comença a A i acaba exactament a B.'); mark('fisica-batx-treball-item-dr', values[1], values[1] ? 'Mesura correcta.' : 'Mesura el vector amb la regla.'); mark('fisica-batx-treball-item-force', values[2], values[2] ? 'Mesura correcta.' : 'Mesura la fletxa verda F.'); mark('fisica-batx-treball-item-angle', values[3], values[3] ? 'Angle dins de la tolerància.' : 'Mesura l’angle menor entre F i Δr.'); mark('fisica-batx-treball-item-work', values[4], values[4] ? 'Càlcul correcte.' : 'Aplica W = |F| · |Δr| · cos θ.');
            const correct = values.filter(Boolean).length; const first = !state.firstCaptured; if (first) { state.firstCaptured = true; state.firstPoints += correct; } state.points = state.firstPoints; setText('fisica-batx-treball-correction', `${first ? 'Primera comprovació' : 'Correcció'}: ${correct}/5 apartats correctes.`); setText('fisica-batx-treball-score', (state.points / 30 * 10).toFixed(2).replace('.', ',')); state.perfect = correct === 5; if (state.perfect) { state.completed += 1; state.firstCaptured = false; state.firstPoints = state.points; $('fisica-batx-treball-next').classList.remove('hidden'); $('fisica-batx-treball-check').classList.add('hidden'); if (state.completed >= EXERCISES) finish(); else setText('fisica-batx-treball-action', 'Exercici completat. Pots generar una nova situació.'); } else { setText('fisica-batx-treball-action', 'Corregeix els apartats pendents i torna-ho a provar.'); } setText('fisica-batx-treball-progress', ''); $('fisica-batx-treball-progress').style.width = `${state.completed / EXERCISES * 100}%`; saveResultIfFinished();
        }
        function prepareExercise() { state.ex = generateExercise(); state.drawStart = null; state.drawEnd = null; state.ruler = []; state.tool = 'draw'; state.perfect = false; state.firstCaptured = false; Object.values(inputs).forEach((input) => { input.value = ''; }); document.querySelectorAll('.fisica-batx-treball__answer').forEach((item) => { item.classList.remove('is-correct', 'is-wrong'); item.querySelector('.fisica-batx-treball__mark').textContent = ''; item.querySelector('.fisica-batx-treball__feedback').textContent = ''; }); setText('fisica-batx-treball-number', state.completed + 1); setText('fisica-batx-treball-prompt', 'Una força constant actua sobre un cos que es desplaça des de A fins a B. Mesura gràficament els vectors i calcula el treball mecànic.'); setText('fisica-batx-treball-data', `A(${state.ex.A.x}, ${state.ex.A.y}) m · B(${state.ex.B.x}, ${state.ex.B.y}) m · F(${state.ex.F.x}, ${state.ex.F.y}) N`); setText('fisica-batx-treball-readout', 'Traça el vector desplaçament des d’A fins a B.'); $('fisica-batx-treball-next').classList.add('hidden'); $('fisica-batx-treball-check').classList.remove('hidden'); draw(); }
        function openTool(tool) { state.tool = tool; const box = $('fisica-batx-treball-toolbox'); const controls = $('fisica-batx-treball-tool-controls'); showToolbox(true); controls.replaceChildren(); if (tool === 'ruler') { setText('fisica-batx-treball-tool-title', 'Regla'); setText('fisica-batx-treball-tool-help', 'Fes dos clics sobre el paper per mesurar una distància.'); const clear = document.createElement('button'); clear.className = 'btn btn--secondary'; clear.textContent = 'Neteja mesura'; clear.addEventListener('click', () => { state.ruler = []; draw(); }); controls.appendChild(clear); } else if (tool === 'protractor') { setText('fisica-batx-treball-tool-title', 'Transportador'); setText('fisica-batx-treball-tool-help', 'Col·locat sobre A. Gira’l amb els controls fins a alinear-lo amb un vector.'); [['−5°', -5], ['−1°', -1], ['+1°', 1], ['+5°', 5]].forEach(([text, amount]) => { const button = document.createElement('button'); button.className = 'btn btn--secondary'; button.textContent = text; button.addEventListener('click', () => { state.protractor.rotation += amount * Math.PI / 180; draw(); }); controls.appendChild(button); }); const center = document.createElement('button'); center.className = 'btn btn--secondary'; center.textContent = 'Centra en A'; center.addEventListener('click', () => { state.protractor.center = pointToCanvas(state.ex.A); state.protractor.rotation = 0; draw(); }); controls.appendChild(center); state.protractor.center = pointToCanvas(state.ex.A); draw(); } else { setText('fisica-batx-treball-tool-title', 'Calculadora'); setText('fisica-batx-treball-tool-help', 'Calcula en graus.'); const input = document.createElement('input'); input.className = 'fisica-batx-treball__calculator-input'; input.placeholder = 'Ex.: 12 * 3 * cos(30)'; const button = document.createElement('button'); button.className = 'btn btn--primary'; button.textContent = 'Calcula'; const output = document.createElement('output'); output.className = 'fisica-batx-treball__calculator-output'; button.addEventListener('click', () => { const expression = input.value.replace(/,/g, '.').replace(/cos\(/gi, 'Math.cos(Math.PI/180*').replace(/sin\(/gi, 'Math.sin(Math.PI/180*').replace(/tan\(/gi, 'Math.tan(Math.PI/180*'); try { if (!/^[0-9+*/().\sMathPI-]+$/.test(expression)) throw new Error(); output.textContent = String(Function(`"use strict";return (${expression})`)()); } catch (error) { output.textContent = 'Expressió no vàlida'; } }); controls.append(input, button, output); } }
        function showToolbox(visible) { $('fisica-batx-treball-toolbox').classList.toggle('hidden', !visible); }
        function finish() { setText('fisica-batx-treball-completed', `Activitat finalitzada: ${state.points}/30 punts de primera comprovació, nota ${(state.points / 30 * 10).toFixed(2).replace('.', ',')} / 10.`); saveResultIfFinished(); }
        function saveResultIfFinished() { if (state.completed < EXERCISES || state.saved || typeof window.callApi !== 'function') return; state.saved = true; const percentage = Math.round(state.points / 30 * 100); callApi('saveResult', { email: window.appState.user.email, curs: window.appState.user.curs, grup: window.appState.user.grup || window.appState.user.curs, projecte: window.appState.currentProject.titol, app: 'Treball mecànic - mesura gràfica', nivell: '1r Batxillerat', puntuacio: percentage, temps_segons: Math.round((Date.now() - state.startTime) / 1000), feedback_pos: JSON.stringify({ exercises: state.completed, firstAttemptPoints: state.points, maxPoints: 30 }), feedback_neg: JSON.stringify({ activity: 'treball-mecanic' }) }).catch(() => { state.saved = false; }); }
        canvas.addEventListener('pointerdown', (event) => { const point = pointer(event); if (state.tool === 'draw') { const A = pointToCanvas(state.ex.A); state.drawStart = Math.hypot(point.x - A.x, point.y - A.y) < 30 ? A : null; state.drawEnd = state.drawStart ? point : null; } else if (state.tool === 'ruler') { state.ruler = state.ruler.length === 2 ? [point] : [...state.ruler, point]; } else if (state.tool === 'protractor' && state.protractor.center && Math.hypot(point.x - state.protractor.center.x, point.y - state.protractor.center.y) < 130) { state.protractor.dragging = true; state.protractor.dx = point.x - state.protractor.center.x; state.protractor.dy = point.y - state.protractor.center.y; } canvas.setPointerCapture(event.pointerId); draw(); });
        canvas.addEventListener('pointermove', (event) => { const point = pointer(event); if (state.tool === 'draw' && state.drawStart) state.drawEnd = point; if (state.tool === 'protractor' && state.protractor.dragging) state.protractor.center = { x: point.x - state.protractor.dx, y: point.y - state.protractor.dy }; draw(); });
        canvas.addEventListener('pointerup', () => { state.protractor.dragging = false; draw(); });
        $('fisica-batx-treball-check').addEventListener('click', check); $('fisica-batx-treball-next').addEventListener('click', () => { if (state.perfect && state.completed < EXERCISES) prepareExercise(); }); $('fisica-batx-treball-ruler').addEventListener('click', () => openTool('ruler')); $('fisica-batx-treball-protractor').addEventListener('click', () => openTool('protractor')); $('fisica-batx-treball-calculator').addEventListener('click', () => openTool('calculator')); $('fisica-batx-treball-tool-close').addEventListener('click', () => showToolbox(false)); $('fisica-batx-treball-reset').addEventListener('click', () => { state.completed = 0; state.points = 0; state.attempts = 0; state.history = []; state.saved = false; state.startTime = Date.now(); prepareExercise(); }); window.addEventListener('resize', resize); prepareExercise(); requestAnimationFrame(resize);
    }
    window.initFisicaBatxilleratTreball = initFisicaBatxilleratTreball;
}());

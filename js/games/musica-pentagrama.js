/* Activitat de lectura musical de Música 1r ESO. */
(function () {
    'use strict';

    const NOTES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
    const CLEFS = {
        sol: { label: 'Sol', baseIndex: 2 },
        fa: { label: 'Fa', baseIndex: 4 },
        do: { label: 'Do', baseIndex: 3 }
    };
    const LEVELS = {
        iniciacio: { label: 'Iniciació', clefs: ['sol'], minStep: 0, maxStep: 8, accidentals: false },
        intermig: { label: 'Intermedi', clefs: ['sol', 'fa'], minStep: -2, maxStep: 10, accidentals: false },
        avancat: { label: 'Avançat', clefs: ['sol', 'fa', 'do'], minStep: -4, maxStep: 10, accidentals: true }
    };

    const game = {
        level: 'iniciacio',
        notes: [],
        startedAt: 0,
        timerId: null,
        hints: 0,
        attempts: 0,
        resultSent: false,
        saveInProgress: false,
        pendingResult: null
    };

    function getElement(id) {
        return document.getElementById(id);
    }

    function randomItem(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    function randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getLevel() {
        return LEVELS[game.level] || LEVELS.iniciacio;
    }

    function getNoteAtStep(clef, step) {
        const baseIndex = CLEFS[clef].baseIndex;
        return NOTES[((baseIndex + step) % NOTES.length + NOTES.length) % NOTES.length];
    }

    function accidentalFor(level) {
        if (!level.accidentals || Math.random() > 0.28) return '';
        return Math.random() > 0.5 ? '#' : 'b';
    }

    function createNote(clef) {
        const level = getLevel();
        const step = randomInteger(level.minStep, level.maxStep);
        return {
            clef,
            step,
            name: getNoteAtStep(clef, step),
            accidental: accidentalFor(level)
        };
    }

    function noteValue(note) {
        return `${note.name}${note.accidental}`;
    }

    function displayNote(value) {
        return String(value || '').replace('#', '♯').replace('b', '♭');
    }

    function optionMarkup() {
        const options = getLevel().accidentals
            ? NOTES.flatMap(note => ['', '#', 'b'].map(accidental => `${note}${accidental}`))
            : NOTES;
        return [`<option value="">Tria</option>`, ...options.map(value => `<option value="${value}">${displayNote(value)}</option>`)].join('');
    }

    function noteX(index) {
        return 140 + index * 60;
    }

    function staffY(step) {
        return 81 - step * 7;
    }

    function ledgerMarkup(step, x) {
        const lines = [];
        if (step < 0) {
            for (let line = -2; line >= step; line -= 2) {
                lines.push(`<line x1="${x - 18}" y1="${staffY(line)}" x2="${x + 18}" y2="${staffY(line)}" class="music-pentagrama__ledger" />`);
            }
        }
        if (step > 8) {
            for (let line = 10; line <= step; line += 2) {
                lines.push(`<line x1="${x - 18}" y1="${staffY(line)}" x2="${x + 18}" y2="${staffY(line)}" class="music-pentagrama__ledger" />`);
            }
        }
        return lines.join('');
    }

    function noteSvg(note, index) {
        const x = noteX(index);
        const y = staffY(note.step);
        const stemUp = note.step < 5;
        const stemX = stemUp ? x + 7 : x - 7;
        const stemEnd = stemUp ? y - 35 : y + 35;
        const accidental = note.accidental
            ? `<text x="${x - 25}" y="${y + 7}" class="music-pentagrama__accidental">${note.accidental === '#' ? '♯' : '♭'}</text>`
            : '';
        return `${ledgerMarkup(note.step, x)}${accidental}<ellipse cx="${x}" cy="${y}" rx="10" ry="7" transform="rotate(-18 ${x} ${y})" class="music-pentagrama__note" /><line x1="${stemX}" y1="${y}" x2="${stemX}" y2="${stemEnd}" class="music-pentagrama__stem" />`;
    }

    function clefSvg(clef) {
        const symbol = clef === 'sol' ? '𝄞' : clef === 'fa' ? '𝄢' : '𝄡';
        return `<text x="48" y="93" class="music-pentagrama__clef" aria-label="Clau de ${CLEFS[clef].label}">${symbol}</text>`;
    }

    function staffMarkup(staffIndex, clef, notes) {
        const lines = [25, 39, 53, 67, 81]
            .map(y => `<line x1="24" y1="${y}" x2="1010" y2="${y}" class="music-pentagrama__staff-line" />`)
            .join('');
        const notesSvg = notes.map(noteSvg).join('');
        const selectors = notes.map((note, index) => `<div class="music-pentagrama__note-control"><select class="music-pentagrama__select" data-note-index="${staffIndex * 15 + index}" aria-label="Pentagrama ${staffIndex + 1}, nota ${index + 1}">${optionMarkup()}</select></div>`).join('');
        return `<article class="music-pentagrama__staff-card"><div class="music-pentagrama__staff-heading"><h3>Pentagrama ${staffIndex + 1}</h3><span>Clau de ${CLEFS[clef].label}</span></div><div class="music-pentagrama__staff-body"><svg class="music-pentagrama__svg" viewBox="0 0 1040 120" role="img" aria-label="Pentagrama ${staffIndex + 1} amb quinze notes">${lines}${clefSvg(clef)}${notesSvg}</svg><div class="music-pentagrama__selectors">${selectors}</div></div></article>`;
    }

    function updateProgress() {
        const progress = getElement('music-pentagrama-progress');
        if (progress) progress.textContent = `${game.notes.length} notes · ${getLevel().label}`;
    }

    function updateTimer() {
        const elapsed = Math.floor((Date.now() - game.startedAt) / 1000);
        const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');
        const timer = getElement('music-pentagrama-timer');
        if (timer) timer.textContent = `${minutes}:${seconds}`;
    }

    function updateLevelButtons() {
        document.querySelectorAll('[data-music-level]').forEach(button => {
            button.classList.toggle('is-selected', button.dataset.musicLevel === game.level);
        });
    }

    function updateSaveFeedback(message, stateName) {
        const feedback = getElement('music-pentagrama-save');
        if (!feedback) return;
        feedback.textContent = message;
        feedback.className = `music-pentagrama__save-feedback${stateName ? ` music-pentagrama__save-feedback--${stateName}` : ''}`;
    }

    function generateGame() {
        const level = getLevel();
        game.notes = [];
        game.hints = 0;
        game.attempts = 0;
        game.resultSent = false;
        game.saveInProgress = false;
        game.pendingResult = null;
        game.startedAt = Date.now();
        updateSaveFeedback('');
        const staves = getElement('music-pentagrama-staves');
        if (!staves) return;
        staves.innerHTML = '';
        for (let staffIndex = 0; staffIndex < 3; staffIndex += 1) {
            const clef = randomItem(level.clefs);
            const notes = Array.from({ length: 15 }, () => createNote(clef));
            game.notes.push(...notes);
            staves.insertAdjacentHTML('beforeend', staffMarkup(staffIndex, clef, notes));
        }
        getElement('music-pentagrama-result')?.classList.add('hidden');
        getElement('music-pentagrama-check')?.removeAttribute('disabled');
        updateProgress();
        updateTimer();
        clearInterval(game.timerId);
        game.timerId = setInterval(updateTimer, 1000);
    }

    function selectLevel(level) {
        if (!LEVELS[level]) return;
        game.level = level;
        updateLevelButtons();
        generateGame();
    }

    function clearAnswerStates() {
        document.querySelectorAll('#musica-pentagrama-activity .music-pentagrama__select').forEach(select => {
            select.classList.remove('is-correct', 'is-incorrect');
            select.removeAttribute('aria-invalid');
        });
    }

    function showResult(result) {
        const box = getElement('music-pentagrama-result');
        if (!box) return;
        box.className = `music-pentagrama__result ${result.percentage >= 50 ? 'music-pentagrama__result--positive' : 'music-pentagrama__result--needs-practice'}`;
        box.innerHTML = `<strong>${result.score10.toFixed(2)} / 10</strong><span>${result.percentage}% · ${result.correct} encerts de ${result.total}</span><span>${result.correct === result.total ? 'Excel·lent! Has llegit totes les notes.' : 'Bon intent! Repassa les notes marcades en vermell.'}</span>`;
    }

    function addRetryButton() {
        const feedback = getElement('music-pentagrama-save');
        if (!feedback || getElement('music-pentagrama-retry')) return;
        const button = document.createElement('button');
        button.id = 'music-pentagrama-retry';
        button.type = 'button';
        button.className = 'btn btn--secondary';
        button.textContent = 'Tornar a intentar desar';
        button.addEventListener('click', savePendingResult);
        feedback.appendChild(button);
    }

    async function savePendingResult() {
        if (!game.pendingResult || game.saveInProgress || game.resultSent) return;
        if (typeof state === 'undefined' || !state.user || typeof callApi !== 'function') {
            updateSaveFeedback('No hi ha una sessió d’alumne vàlida per desar el resultat.', 'error');
            return;
        }
        game.saveInProgress = true;
        updateSaveFeedback('Desant el resultat...', 'pending');
        try {
            const response = await callApi('saveResult', game.pendingResult);
            if (!response || response.status !== 'success') throw new Error(response?.message || 'No s’ha pogut desar el resultat.');
            game.resultSent = true;
            game.pendingResult = null;
            updateSaveFeedback('Resultat desat correctament.', 'success');
        } catch (error) {
            console.error('Error desant el resultat de Pentagrama:', error);
            updateSaveFeedback('No s’ha pogut desar el resultat. Pots tornar-ho a intentar.', 'error');
            addRetryButton();
        } finally {
            game.saveInProgress = false;
        }
    }

    function checkGame() {
        if (!game.notes.length || game.resultSent || game.saveInProgress) return;
        game.attempts += 1;
        clearAnswerStates();
        const selects = [...document.querySelectorAll('#musica-pentagrama-activity .music-pentagrama__select')];
        const positive = [];
        const negative = [];
        let correct = 0;
        selects.forEach((select, index) => {
            const expected = noteValue(game.notes[index]);
            const answer = select.value;
            const isCorrect = answer === expected;
            select.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
            select.setAttribute('aria-invalid', String(!isCorrect));
            if (isCorrect) {
                correct += 1;
                positive.push({ index: index + 1, resposta: displayNote(answer), clau: CLEFS[game.notes[index].clef].label });
            } else {
                negative.push({ index: index + 1, resposta: displayNote(answer || 'En blanc'), correcta: displayNote(expected), clau: CLEFS[game.notes[index].clef].label, recomanacio: 'Repassa les línies i els espais de la clau indicada.' });
            }
        });
        const total = game.notes.length;
        const percentage = Math.round((correct / total) * 100);
        const score10 = Number(((correct / total) * 10).toFixed(2));
        const elapsed = Math.floor((Date.now() - game.startedAt) / 1000);
        showResult({ correct, total, percentage, score10 });
        clearInterval(game.timerId);
        const session = typeof state !== 'undefined' ? state.user : null;
        if (!session || typeof callApi !== 'function') {
            updateSaveFeedback('Resultat calculat, però cal iniciar sessió per desar-lo.', 'error');
            return;
        }
        game.pendingResult = {
            email: session.email,
            curs: session.curs,
            grup: session.grup || session.curs,
            projecte: typeof state.currentProject !== 'undefined' && state.currentProject ? state.currentProject.titol : 'Música 1r ESO',
            app: 'Pentagrama',
            nivell: getLevel().label,
            puntuacio: percentage,
            temps_segons: elapsed,
            feedback_pos: JSON.stringify({ total, encerts: positive, intents: game.attempts, pistes: game.hints }),
            feedback_neg: JSON.stringify({ errors: negative, intents: game.attempts, pistes: game.hints })
        };
        getElement('music-pentagrama-check')?.setAttribute('disabled', 'disabled');
        savePendingResult();
    }

    function openHints() {
        game.hints += 1;
        const dialog = getElement('music-pentagrama-hints-dialog');
        if (dialog?.showModal) dialog.showModal();
    }

    function closeHints() {
        getElement('music-pentagrama-hints-dialog')?.close();
    }

    function bindControls() {
        const activity = getElement('musica-pentagrama-activity');
        if (!activity || activity.dataset.bound === 'true') return;
        activity.dataset.bound = 'true';
        activity.querySelectorAll('[data-music-level]').forEach(button => button.addEventListener('click', () => selectLevel(button.dataset.musicLevel)));
        getElement('music-pentagrama-new')?.addEventListener('click', generateGame);
        getElement('music-pentagrama-check')?.addEventListener('click', checkGame);
        getElement('music-pentagrama-hints')?.addEventListener('click', openHints);
        getElement('music-pentagrama-hints-close')?.addEventListener('click', closeHints);
        getElement('music-pentagrama-hints-dialog')?.addEventListener('click', event => {
            if (event.target === event.currentTarget) closeHints();
        });
    }

    window.initMusicPentagrama = function () {
        bindControls();
        updateLevelButtons();
        generateGame();
    };
}());

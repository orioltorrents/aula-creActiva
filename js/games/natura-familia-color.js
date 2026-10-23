/**
 * Projecte Rius - Entrenament de família i color.
 * Reutilitza el catàleg de l'activitat de bioindicadors.
 */

(function () {
    const colorLabels = {
        blue: 'Blau',
        green: 'Verd',
        yellow: 'Groc',
        orange: 'Carbassa',
        red: 'Vermell'
    };
    const colorOrder = Object.keys(colorLabels);
    const familyLabels = {
        Sericostomatidae: 'Sericostomàtids', Perlidae: 'Perlids', Dugesiidae: 'Dugèsids',
        Calopterygidae: 'Calopterígids', Rhyacophilidae: 'Riacofílids', Polycentropodidae: 'Policentropòdids',
        Limnephilidae: 'Limnefílids', Philopotamidae: 'Filopotàmids', Astacidae: 'Astàcids',
        Aeshnidae: 'Esníds', Gomphidae: 'Gòmfids', Libellulidae: 'Libel·lúlids',
        Coenagrionidae: 'Coenagriònids', Lestidae: 'Lèstids', Ancylidae: 'Ancílids',
        Elmidae: 'Elmids', Dryopidae: 'Driòpids', Hydropsychidae: 'Hidropsíquids',
        Tipulidae: 'Tipúlids', Syrphidae: 'Sirfids', Gammaridae: 'Gàmàrids',
        Lumbricidae: 'Lumbrícids', Erpobdellidae: 'Erpobdèl·lids', Hydracarina: 'Hidracàrids',
        Asellidae: 'Asèl·lids', Ostracoda: 'Ostracodes', Copepoda: 'Copèpodes',
        Cladocera: 'Cladòcers', Baetidae: 'Baètids', Haliplidae: 'Halíplids',
        Gyrinidae: 'Girínids', Hydrophilidae: 'Hidrofílids', Culicidae: 'Culícids',
        Simuliidae: 'Simúlids', Chironomidae: 'Quironòmids', Lymnaeidae: 'Limnèids',
        Physidae: 'Físids', Planorbidae: 'Planòrbids', Sphaeriidae: 'Esfèrids',
        Hydrobiidae: 'Hidrobiids', Cambaridae: 'Cambàrids', Gerridae: 'Gèrrids',
        Notonectidae: 'Notonèctids', Nepidae: 'Nèpids', Corixidae: 'Coríxids'
    };
    const gameState = {
        round: [],
        index: 0,
        points: 0,
        familyAnswered: false,
        colorAnswered: false
    };

    function get(id) {
        return document.getElementById(id);
    }

    function shuffle(items) {
        return items.slice().sort(() => Math.random() - 0.5);
    }

    function getFamilyLabel(family) {
        const catalanName = familyLabels[family];
        return catalanName ? `${family} (${catalanName})` : family;
    }

    function initFamiliaColorGame() {
        const catalog = Array.isArray(window.riverBioSpecimens) ? window.riverBioSpecimens : [];
        if (!catalog.length) {
            const message = get('river-family-color-feedback');
            if (message) message.textContent = 'No s’ha pogut carregar el catàleg de macroinvertebrats.';
            return;
        }

        gameState.round = shuffle(catalog).slice(0, Math.min(10, catalog.length));
        gameState.index = 0;
        gameState.points = 0;
        get('river-family-color-game')?.classList.remove('hidden');
        get('river-family-color-results')?.classList.add('hidden');
        renderQuestion();
    }

    function renderQuestion() {
        const specimen = gameState.round[gameState.index];
        if (!specimen) return finishGame();

        state.familyAnswered = false;
        state.colorAnswered = false;
        get('river-family-color-progress').textContent = `Organisme ${gameState.index + 1} de ${gameState.round.length}`;
        get('river-family-color-score').textContent = `Punts: ${gameState.points}`;
        get('river-family-color-image').src = specimen.image;
        get('river-family-color-image').alt = specimen.name;
        get('river-family-color-name').textContent = specimen.name;
        get('river-family-color-feedback').className = 'river-family-color__feedback hidden';
        get('river-family-color-feedback').textContent = '';
        get('river-family-color-next').classList.add('hidden');

        const families = shuffle([...new Set(window.riverBioSpecimens.map(item => item.family))])
            .filter(family => family !== specimen.family)
            .slice(0, 3);
        const options = shuffle([specimen.family, ...families]);
        get('river-family-color-families').innerHTML = options.map((family) =>
            `<button type="button" class="river-family-color__family-option" data-family="${family}">${getFamilyLabel(family)}</button>`
        ).join('');
        get('river-family-color-families').querySelectorAll('button').forEach((button) => {
            button.addEventListener('click', () => chooseFamily(button.dataset.family));
        });

        get('river-family-color-colors').innerHTML = colorOrder.map((color) =>
            `<button type="button" class="river-family-color__color-option river-family-color__color-option--${color}" data-color="${color}" disabled>${colorLabels[color]}</button>`
        ).join('');
        get('river-family-color-colors').querySelectorAll('button').forEach((button) => {
            button.addEventListener('click', () => chooseColor(button.dataset.color));
        });
    }

    function chooseFamily(selectedFamily) {
        if (gameState.familyAnswered) return;
        const specimen = gameState.round[gameState.index];
        gameState.familyAnswered = true;
        const correct = selectedFamily === specimen.family;
        if (correct) gameState.points++;
        get('river-family-color-families').querySelectorAll('button').forEach((button) => {
            button.disabled = true;
            if (button.dataset.family === specimen.family) button.classList.add('is-correct');
            if (button.dataset.family === selectedFamily && !correct) button.classList.add('is-incorrect');
        });
        get('river-family-color-family-result').textContent = correct
            ? 'Família correcta.'
            : `La família correcta és ${getFamilyLabel(specimen.family)}.`;
        get('river-family-color-family-result').className = correct
            ? 'river-family-color__answer is-correct'
            : 'river-family-color__answer is-incorrect';
        get('river-family-color-colors').querySelectorAll('button').forEach((button) => { button.disabled = false; });
        get('river-family-color-score').textContent = `Punts: ${gameState.points}`;
    }

    function chooseColor(selectedColor) {
        if (!gameState.familyAnswered || gameState.colorAnswered) return;
        const specimen = gameState.round[gameState.index];
        gameState.colorAnswered = true;
        const correct = selectedColor === specimen.color;
        if (correct) gameState.points++;
        get('river-family-color-colors').querySelectorAll('button').forEach((button) => {
            button.disabled = true;
            if (button.dataset.color === specimen.color) button.classList.add('is-correct');
            if (button.dataset.color === selectedColor && !correct) button.classList.add('is-incorrect');
        });
        const feedback = get('river-family-color-feedback');
        feedback.className = correct ? 'river-family-color__feedback is-success' : 'river-family-color__feedback is-error';
        feedback.textContent = correct
            ? `Color correcte: ${colorLabels[specimen.color]}. ${specimen.name} pertany a la família ${getFamilyLabel(specimen.family)}.`
            : `El color correcte és ${colorLabels[specimen.color]}. ${specimen.name} pertany a la família ${getFamilyLabel(specimen.family)}.`;
        get('river-family-color-next').classList.remove('hidden');
        get('river-family-color-score').textContent = `Punts: ${gameState.points}`;
    }

    function nextFamiliaColorQuestion() {
        if (!gameState.colorAnswered) return;
        gameState.index++;
        renderQuestion();
    }

    function finishGame() {
        const maximum = gameState.round.length * 2;
        const percentage = Math.round((gameState.points / maximum) * 100);
        get('river-family-color-game').classList.add('hidden');
        get('river-family-color-results').classList.remove('hidden');
        get('river-family-color-final-score').textContent = `${percentage}% (${state.points}/${maximum})`;
        get('river-family-color-final-feedback').textContent = percentage >= 80
            ? 'Molt bé: reconeixes les famílies i els colors de les fitxes de camp.'
            : 'Revisa les fitxes de camp i torna a provar-ho per consolidar les associacions.';
        if (typeof saveNaturaResult === 'function' && typeof state !== 'undefined' && state.user && state.currentProject) {
            saveNaturaResult(percentage, 'Família i color dels bioindicadors');
        }
    }

    window.initFamiliaColorGame = initFamiliaColorGame;
    window.nextFamiliaColorQuestion = nextFamiliaColorQuestion;
})();

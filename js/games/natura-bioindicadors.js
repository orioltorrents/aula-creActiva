/*
 * Activitat: bioindicadors de la qualitat ecològica d'un riu.
 * Les famílies i els colors segueixen les fitxes de camp de macroinvertebrats.
 */

(function () {
    const colorOrder = ['blue', 'green', 'yellow', 'orange', 'red'];
    const colorLabels = {
        blue: 'blau',
        green: 'verd',
        yellow: 'groc',
        orange: 'carbassa',
        red: 'vermell'
    };
    const stateLabels = {
        blue: 'Molt bo',
        green: 'Bo',
        yellow: 'Moderat',
        orange: 'Dolent',
        red: 'Molt dolent',
        insufficient: 'Dades insuficients'
    };

    const specimens = [
        { id: 'ancylus', name: 'Ancylus', family: 'Ancylidae', color: 'yellow', image: 'assets/images/natura/clau-macroinvertebrats/Ancylus.PNG' },
        { id: 'dugesia', name: 'Dugesia', family: 'Dugesiidae', color: 'yellow', image: 'assets/images/natura/clau-macroinvertebrats/Dugesia.PNG' },
        { id: 'eiseniella', name: 'Eiseniella tetraedra', family: 'Lumbricidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Eiseniella tetraedra.PNG' },
        { id: 'helobdella', name: 'Helobdella stagnalis', family: 'Erpobdellidae', color: 'orange', image: 'assets/images/natura/clau-macroinvertebrats/Helobdella stagnalis.PNG' },
        { id: 'hidraca', name: 'Hidracar', family: 'Hydracarina', color: 'orange', image: 'assets/images/natura/clau-macroinvertebrats/Hidracar.PNG' },
        { id: 'proasellus', name: 'Proasellus coxalis', family: 'Asellidae', color: 'orange', image: 'assets/images/natura/clau-macroinvertebrats/Proasellus coxalis.PNG' },
        { id: 'eucypris', name: 'Eucypris', family: 'Ostracoda', color: 'orange', image: 'assets/images/natura/clau-macroinvertebrats/Eucypris.PNG' },
        { id: 'cyclopidae', name: 'Cyclopidae', family: 'Copepoda', color: 'orange', image: 'assets/images/natura/clau-macroinvertebrats/Cyclopidae.PNG' },
        { id: 'chydoridae', name: 'Chydoridae', family: 'Cladocera', color: 'orange', image: 'assets/images/natura/clau-macroinvertebrats/Chydoridae.PNG' },
        { id: 'betis', name: 'Bètid', family: 'Baetidae', color: 'orange', image: 'assets/images/natura/clau-macroinvertebrats/Betis.PNG' },
        { id: 'calopterigid', name: 'Calopterígids', family: 'Calopterygidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Calopterigid.PNG' },
        { id: 'elmis', name: 'Elmis', family: 'Elmidae', color: 'yellow', image: 'assets/images/natura/clau-macroinvertebrats/Elmis.PNG' },
        { id: 'dryops', name: 'Dryops algiricus', family: 'Dryopidae', color: 'yellow', image: 'assets/images/natura/clau-macroinvertebrats/Dryops algiricus.PNG' },
        { id: 'haliplus', name: 'Haliplus', family: 'Haliplidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Haliplus.PNG' },
        { id: 'gyrinus', name: 'Gyrinus urinator', family: 'Gyrinidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Gyrinus urinator.PNG' },
        { id: 'hydrophilus', name: 'Hydrophilus pistaceus', family: 'Hydrophilidae', color: 'orange', image: 'assets/images/natura/clau-macroinvertebrats/Hydrophilus pistaceus.PNG' },
        { id: 'hydropsyche', name: 'Hydropsyche', family: 'Hydropsychidae', color: 'yellow', image: 'assets/images/natura/clau-macroinvertebrats/Hydropsyche.PNG' },
        { id: 'rhyacophila', name: 'Rhyacophila', family: 'Rhyacophilidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Rhyacophila.PNG' },
        { id: 'polycentropus', name: 'Polycentropus', family: 'Polycentropodidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Polycentropus.PNG' },
        { id: 'halesus', name: 'Halesus', family: 'Limnephilidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Halesus.PNG' }
    ];

    let round = [];
    let currentIndex = 0;
    let assignments = [];

    function shuffle(items) {
        return items.slice().sort(() => Math.random() - 0.5);
    }

    function getUniqueFamilyCounts(items, colorProperty) {
        const families = Object.fromEntries(colorOrder.map(color => [color, new Set()]));

        items.forEach(item => {
            const color = item[colorProperty];
            if (families[color]) families[color].add(item.family);
        });

        return Object.fromEntries(colorOrder.map(color => [color, families[color].size]));
    }

    function calculateEcologicalState(items, colorProperty) {
        const counts = getUniqueFamilyCounts(items, colorProperty);
        return colorOrder.find(color => counts[color] >= 2) || 'insufficient';
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function initRiverBioActivity() {
        round = shuffle(specimens).slice(0, 10);
        currentIndex = 0;
        assignments = [];

        getElement('river-bio-round')?.classList.remove('hidden');
        getElement('river-bio-decision')?.classList.add('hidden');
        getElement('river-bio-result').textContent = '';

        colorOrder.forEach(color => {
            const drawer = getElement(`river-bio-drawer-${color}`);
            if (drawer) drawer.innerHTML = '';
            updateDrawerCount(color, 0);
        });

        renderCurrentSpecimen();
    }

    function renderCurrentSpecimen() {
        const specimen = round[currentIndex];
        const current = getElement('river-bio-current');
        if (!specimen || !current) return;

        getElement('river-bio-progress').textContent = `Espècie ${currentIndex + 1} de ${round.length}`;
        getElement('river-bio-classified').textContent = `Classificades: ${assignments.length}`;
        current.innerHTML = `
            <img src="${specimen.image}" alt="${specimen.name}" class="river-bio-specimen__image">
            <div class="river-bio-specimen__content">
                <span class="river-bio-specimen__eyebrow">Macroinvertebrat trobat al riu</span>
                <h4>${specimen.name}</h4>
                <p>Família: <strong>${specimen.family}</strong></p>
                <p>Tria el color de la fitxa de camp i col·loca’l al calaix corresponent.</p>
            </div>
        `;
    }

    function classifyRiverBioSpecimen(selectedColor) {
        const specimen = round[currentIndex];
        if (!specimen || !colorOrder.includes(selectedColor)) return;

        const card = document.createElement('article');
        card.className = `river-bio-specimen-card river-bio-specimen-card--${selectedColor}`;
        card.dataset.specimenId = specimen.id;
        card.innerHTML = `<img src="${specimen.image}" alt=""><span>${specimen.name}</span><small>${specimen.family}</small>`;
        getElement(`river-bio-drawer-${selectedColor}`)?.appendChild(card);

        assignments.push({ specimen, selectedColor, card });
        updateDrawerCount(selectedColor, getElement(`river-bio-drawer-${selectedColor}`).children.length);
        currentIndex++;

        if (currentIndex >= round.length) {
            getElement('river-bio-round')?.classList.add('hidden');
            getElement('river-bio-decision')?.classList.remove('hidden');
            getElement('river-bio-classified').textContent = `Classificades: ${assignments.length}`;
            return;
        }

        renderCurrentSpecimen();
    }

    function updateDrawerCount(color, count) {
        const element = getElement(`river-bio-count-${color}`);
        if (element) element.textContent = count;
    }

    function chooseRiverBioState(selectedState) {
        const expectedState = calculateEcologicalState(round, 'color');
        const chosenState = calculateEcologicalState(assignments, 'selectedColor');
        const classificationCorrect = assignments.filter(item => item.selectedColor === item.specimen.color).length;
        const stateCorrect = selectedState === expectedState;
        const percentage = Math.round(((classificationCorrect + (stateCorrect ? 1 : 0)) / (round.length + 1)) * 100);
        const result = getElement('river-bio-result');

        assignments.forEach(item => {
            item.card.classList.toggle('is-correct', item.selectedColor === item.specimen.color);
            item.card.classList.toggle('is-incorrect', item.selectedColor !== item.specimen.color);
        });

        const chosenCounts = getUniqueFamilyCounts(assignments, 'selectedColor');
        const actualCounts = getUniqueFamilyCounts(round, 'color');
        const countText = colorOrder
            .map(color => `${colorLabels[color]}: ${chosenCounts[color]} famílies`)
            .join(' · ');

        result.innerHTML = `
            <p class="river-bio-result__feedback ${stateCorrect ? 'is-success' : 'is-error'}">
                ${stateCorrect ? 'Interpretació correcta.' : 'La interpretació necessita revisió.'}
            </p>
            <p>Has classificat correctament ${classificationCorrect} de ${round.length} espècies i has obtingut un ${percentage}%.</p>
            <p><strong>Amb les teves classificacions:</strong> ${countText}.</p>
            <p><strong>Estat correcte:</strong> ${stateLabels[expectedState]}.</p>
            <p>${expectedState === 'insufficient'
                ? 'Cap color té dues famílies diferents: les dades no permeten decidir l’estat del riu.'
                : `El color ${colorLabels[expectedState]} és el de millor qualitat que arriba a dues famílies diferents.`}</p>
        `;

        getElement('river-bio-decision')?.setAttribute('data-expected-state', expectedState);
        getElement('river-bio-decision')?.setAttribute('data-chosen-state', chosenState);
        void actualCounts;

        saveRiverBioResult(percentage, expectedState, classificationCorrect, stateCorrect);
    }

    function saveRiverBioResult(percentage, expectedState, classificationCorrect, stateCorrect) {
        if (typeof state === 'undefined' || !state.user || typeof callApi !== 'function') return;

        callApi('saveResult', {
            email: state.user.email,
            curs: state.user.curs,
            grup: state.user.grup,
            projecte: 'Entorns de Natura',
            app: 'bioindicadors-macroinvertebrats',
            nivell: stateLabels[expectedState],
            puntuacio: percentage,
            temps_segons: 0,
            feedback_pos: `${classificationCorrect}/${round.length} classificacions; estat: ${stateCorrect ? 'correcte' : 'incorrecte'}`,
            feedback_neg: 'Interpretació basada en famílies diferents per color.'
        }).catch(error => console.error('Error guardant els bioindicadors:', error));
    }

    window.initRiverBioActivity = initRiverBioActivity;
    window.classifyRiverBioSpecimen = classifyRiverBioSpecimen;
    window.chooseRiverBioState = chooseRiverBioState;
})();

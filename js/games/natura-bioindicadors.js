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
        // BLAU (Aigües molt bones)
        { id: 'sericostoma', name: 'Sericostoma personatum', family: 'Sericostomatidae', color: 'blue', image: 'assets/images/natura/clau-macroinvertebrats/Sericostoma personatum.PNG' },
        { id: 'perla-marginata', name: 'Perla marginata', family: 'Perlidae', color: 'blue', image: 'assets/images/natura/clau-macroinvertebrats/Perla marginata.PNG' },

        // VERD (Aigües bones)
        { id: 'dugesia', name: 'Dugesia', family: 'Dugesiidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Dugesia.PNG' },
        { id: 'calopterigid', name: 'Calopterígids', family: 'Calopterygidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Calopterigid.PNG' },
        { id: 'rhyacophila', name: 'Rhyacophila', family: 'Rhyacophilidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Rhyacophila.PNG' },
        { id: 'polycentropus', name: 'Polycentropus', family: 'Polycentropodidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Polycentropus.PNG' },
        { id: 'halesus', name: 'Halesus', family: 'Limnephilidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Halesus.PNG' },
        { id: 'wormaldia', name: 'Wormaldia', family: 'Philopotamidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Wormaldia.PNG' },
        { id: 'potamophylax', name: 'Potamophylax', family: 'Limnephilidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Potamophylax.PNG' },
        { id: 'austrapotamobius', name: 'Austrapotamobius pallipes', family: 'Astacidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Austrapotamobius pallipes.PNG' },
        { id: 'anax-imperator', name: 'Anax imperator', family: 'Aeshnidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Anax imperator.PNG' },
        { id: 'onychogomphus-uncatus', name: 'Onychogomphus uncatus', family: 'Gomphidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Onychogomphus uncatus.PNG' },
        { id: 'orthetrum-brunneum', name: 'Orthetrum brunneum', family: 'Libellulidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Orthetrum brunneum..PNG' },
        { id: 'coenagrion-puella', name: 'Coenagrion puella', family: 'Coenagrionidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Coenagrion puella.PNG' },
        { id: 'lestes-viridis', name: 'Lestes viridis', family: 'Lestidae', color: 'green', image: 'assets/images/natura/clau-macroinvertebrats/Lestes viridis.PNG' },

        // GROC (Aigües moderades)
        { id: 'ancylus', name: 'Ancylus', family: 'Ancylidae', color: 'yellow', image: 'assets/images/natura/clau-macroinvertebrats/Ancylus.PNG' },
        { id: 'elmis', name: 'Elmis', family: 'Elmidae', color: 'yellow', image: 'assets/images/natura/clau-macroinvertebrats/Elmis.PNG' },
        { id: 'dryops', name: 'Dryops algiricus', family: 'Dryopidae', color: 'yellow', image: 'assets/images/natura/clau-macroinvertebrats/Dryops algiricus.PNG' },
        { id: 'hydropsyche', name: 'Hydropsyche', family: 'Hydropsychidae', color: 'yellow', image: 'assets/images/natura/clau-macroinvertebrats/Hydropsyche.PNG' },
        { id: 'tipula', name: 'Tipula', family: 'Tipulidae', color: 'yellow', image: 'assets/images/natura/clau-macroinvertebrats/Tipula.PNG' },
        { id: 'eristalis', name: 'Eristalis', family: 'Syrphidae', color: 'yellow', image: 'assets/images/natura/clau-macroinvertebrats/Eristalis.PNG' },
        { id: 'echinogammarus', name: 'Echinogammarus longisetosus', family: 'Gammaridae', color: 'yellow', image: 'assets/images/natura/clau-macroinvertebrats/Echinogammarus longisetosus.PNG' },

        // VERMELL (Aigües molt dolentes)
        { id: 'eiseniella', name: 'Eiseniella tetraedra', family: 'Lumbricidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Eiseniella tetraedra.PNG' },
        { id: 'helobdella', name: 'Helobdella stagnalis', family: 'Erpobdellidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Helobdella stagnalis.PNG' },
        { id: 'hidraca', name: 'Hidracar', family: 'Hydracarina', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Hidracar.PNG' },
        { id: 'proasellus', name: 'Proasellus coxalis', family: 'Asellidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Proasellus coxalis.PNG' },
        { id: 'eucypris', name: 'Eucypris', family: 'Ostracoda', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Eucypris.PNG' },
        { id: 'cyclopidae', name: 'Cyclopidae', family: 'Copepoda', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Cyclopidae.PNG' },
        { id: 'chydoridae', name: 'Chydoridae', family: 'Cladocera', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Chydoridae.PNG' },
        { id: 'betis', name: 'Bètid', family: 'Baetidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Betis.PNG' },
        { id: 'haliplus', name: 'Haliplus', family: 'Haliplidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Haliplus.PNG' },
        { id: 'gyrinus', name: 'Gyrinus urinator', family: 'Gyrinidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Gyrinus urinator.PNG' },
        { id: 'hydrophilus', name: 'Hydrophilus pistaceus', family: 'Hydrophilidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Hydrophilus pistaceus.PNG' },
        { id: 'culex', name: 'Culex', family: 'Culicidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Culex.PNG' },
        { id: 'simulium', name: 'Simulium', family: 'Simuliidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Simulium.PNG' },
        { id: 'chironomus', name: 'Chironomus', family: 'Chironomidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Chironomus.PNG' },
        { id: 'lymnaea', name: 'Lymnaea', family: 'Lymnaeidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Lymnaea.PNG' },
        { id: 'physella', name: 'Physella acuta', family: 'Physidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Physella acuta.PNG' },
        { id: 'gyraulus', name: 'Gyraulus', family: 'Planorbidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Gyraulus.PNG' },
        { id: 'pisidium', name: 'Pisidium casertanum', family: 'Sphaeriidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Pisidium casertanum.PNG' },
        { id: 'potamopyrgus', name: 'Potamopyrgus antipodarum', family: 'Hydrobiidae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Potamopyrgus antipodarum.PNG' },
        { id: 'procambarus', name: 'Procambarus clarkii', family: 'Cambaridae', color: 'red', image: 'assets/images/natura/clau-macroinvertebrats/Procambarus clarkii.PNG' },
        { id: 'gerris', name: 'Gerris', family: 'Gerridae', color: 'orange', image: 'assets/images/natura/clau-macroinvertebrats/Gerris.PNG' },
        { id: 'notonecta', name: 'Notonecta', family: 'Notonectidae', color: 'orange', image: 'assets/images/natura/clau-macroinvertebrats/Notonecta.PNG' },
        { id: 'nepa-cinerea', name: 'Nepa cinerea', family: 'Nepidae', color: 'orange', image: 'assets/images/natura/clau-macroinvertebrats/Nepa cinerea.PNG' },
        { id: 'parasigara', name: 'Parasigara', family: 'Corixidae', color: 'orange', image: 'assets/images/natura/clau-macroinvertebrats/Parasigara.PNG' }
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
        const sampleSize = Math.floor(Math.random() * 5) + 6;
        round = shuffle(specimens).slice(0, sampleSize);
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
        const classificationErrors = round.length - classificationCorrect;
        const stateCorrect = selectedState === expectedState;
        const percentage = Math.round(((classificationCorrect + (stateCorrect ? 1 : 0)) / (round.length + 1)) * 100);
        const result = getElement('river-bio-result');

        const chosenCounts = getUniqueFamilyCounts(assignments, 'selectedColor');
        const actualCounts = getUniqueFamilyCounts(round, 'color');
        const countText = colorOrder
            .map(color => `${colorLabels[color]}: ${chosenCounts[color]} famílies`)
            .join(' · ');

        const errorText = classificationErrors === 0
            ? 'Has classificat totes les espècies al color correcte!'
            : classificationErrors === 1
                ? 'Has comès 1 error de classificació d’espècie.'
                : `Has comès ${classificationErrors} errors de classificació d’espècies.`;

        result.innerHTML = `
            <p class="river-bio-result__feedback ${stateCorrect ? 'is-success' : 'is-error'}">
                ${stateCorrect ? 'Interpretació correcta.' : 'La interpretació necessita revisió.'}
            </p>
            <p>${errorText}</p>
            <p>Puntuació global: <strong>${percentage}%</strong></p>
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

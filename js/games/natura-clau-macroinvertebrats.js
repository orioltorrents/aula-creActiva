/*
 * Activitat: clau dicotòmica dels principals macroinvertebrats aquàtics.
 * La foto identifica l'organisme; la clau avalua el camí que segueix l'alumne.
 */

(function () {
    const mainSpecimens = [
        {
            id: 'ancylus',
            name: 'Ancylus',
            scientificName: 'Ancylus',
            image: 'assets/images/natura/clau-macroinvertebrats/Ancylus.PNG',
            result: 'Gasteròpodes',
            path: ['no', 'yes', 'no']
        },
        {
            id: 'betis',
            name: 'Bètid',
            scientificName: 'Baetis rhodani',
            image: 'assets/images/natura/clau-macroinvertebrats/Betis.PNG',
            result: 'Insectes',
            path: ['yes', 'six']
        },
        {
            id: 'culex',
            name: 'Culex',
            scientificName: 'Culex',
            image: 'assets/images/natura/clau-macroinvertebrats/Culex.PNG',
            result: 'Dípters',
            path: ['no', 'no', 'yes', 'yes']
        },
        {
            id: 'simulium',
            name: 'Simulium',
            scientificName: 'Simulium',
            image: 'assets/images/natura/clau-macroinvertebrats/Simulium.PNG',
            result: 'Dípters',
            path: ['no', 'no', 'yes', 'yes']
        },
        {
            id: 'dina-lineata',
            name: 'Dina lineata',
            scientificName: 'Dina lineata',
            image: 'assets/images/natura/clau-macroinvertebrats/Dina lineata.PNG',
            result: 'Hirudinis',
            path: ['no', 'no', 'yes', 'no', 'yes']
        },
        {
            id: 'hidracar',
            name: 'Hidracar',
            scientificName: 'Hydrachnidia',
            image: 'assets/images/natura/clau-macroinvertebrats/Hidracar.PNG',
            result: 'Aràcnids',
            path: ['yes', 'eight']
        },
        {
            id: 'eiseniella-tetraedra',
            name: 'Eiseniella tetraedra',
            scientificName: 'Eiseniella tetraedra',
            image: 'assets/images/natura/clau-macroinvertebrats/Eiseniella tetraedra.PNG',
            result: 'Oligoquets',
            path: ['no', 'no', 'yes', 'no', 'no']
        },
        {
            id: 'unio-mancus',
            name: 'Unio mancus',
            scientificName: 'Unio mancus',
            image: 'assets/images/natura/clau-macroinvertebrats/Unio mancus.PNG',
            result: 'Bivalves',
            path: ['no', 'yes', 'yes']
        },
        {
            id: 'proasellus-coxalis',
            name: 'Proasellus coxalis',
            scientificName: 'Proasellus coxalis',
            image: 'assets/images/natura/clau-macroinvertebrats/Proasellus coxalis.PNG',
            result: 'Crustacis',
            path: ['yes', 'more']
        },
        {
            id: 'potamopyrgus-antipodarum',
            name: 'Potamopyrgus antipodarum',
            scientificName: 'Potamopyrgus antipodarum',
            image: 'assets/images/natura/clau-macroinvertebrats/Potamopyrgus antipodarum.PNG',
            result: 'Gasteròpodes',
            path: ['no', 'yes', 'no']
        },
        {
            id: 'pisidium-casertanum',
            name: 'Pisidium casertanum',
            scientificName: 'Pisidium casertanum',
            image: 'assets/images/natura/clau-macroinvertebrats/Pisidium casertanum.PNG',
            result: 'Bivalves',
            path: ['no', 'yes', 'yes']
        },
        {
            id: 'physella-acuta',
            name: 'Physella acuta',
            scientificName: 'Physella acuta',
            image: 'assets/images/natura/clau-macroinvertebrats/Physella acuta.PNG',
            result: 'Gasteròpodes',
            path: ['no', 'yes', 'no']
        },
        {
            id: 'lymnaea',
            name: 'Lymnaea',
            scientificName: 'Lymnaea',
            image: 'assets/images/natura/clau-macroinvertebrats/Lymnaea.PNG',
            result: 'Gasteròpodes',
            path: ['no', 'yes', 'no']
        },
        {
            id: 'helobdella-stagnalis',
            name: 'Helobdella stagnalis',
            scientificName: 'Helobdella stagnalis',
            image: 'assets/images/natura/clau-macroinvertebrats/Helobdella stagnalis.PNG',
            result: 'Hirudinis',
            path: ['no', 'no', 'yes', 'no', 'yes']
        },
        {
            id: 'gyraulus',
            name: 'Gyraulus',
            scientificName: 'Gyraulus',
            image: 'assets/images/natura/clau-macroinvertebrats/Gyraulus.PNG',
            result: 'Gasteròpodes',
            path: ['no', 'yes', 'no']
        },
        {
            id: 'echinogammarus-longisetosus',
            name: 'Echinogammarus longisetosus',
            scientificName: 'Echinogammarus longisetosus',
            image: 'assets/images/natura/clau-macroinvertebrats/Echinogammarus longisetosus.PNG',
            result: 'Crustacis',
            path: ['yes', 'more']
        },
        {
            id: 'dugesia',
            name: 'Dugesia',
            scientificName: 'Dugesia',
            image: 'assets/images/natura/clau-macroinvertebrats/Dugesia.PNG',
            result: 'Turbelaris',
            path: ['no', 'no', 'no', 'flat']
        },
        {
            id: 'austrapotamobius-pallipes',
            name: 'Austrapotamobius pallipes',
            scientificName: 'Austrapotamobius pallipes',
            image: 'assets/images/natura/clau-macroinvertebrats/Austrapotamobius pallipes.PNG',
            result: 'Crustacis',
            path: ['yes', 'more']
        },
        {
            id: 'procambarus-clarkii',
            name: 'Procambarus clarkii',
            scientificName: 'Procambarus clarkii',
            image: 'assets/images/natura/clau-macroinvertebrats/Procambarus clarkii.PNG',
            result: 'Crustacis',
            path: ['yes', 'more']
        },
        {
            id: 'eucypris',
            name: 'Eucypris',
            scientificName: 'Eucypris',
            image: 'assets/images/natura/clau-macroinvertebrats/Eucypris.PNG',
            result: 'Crustacis',
            path: ['yes', 'more']
        },
        {
            id: 'chydoridae',
            name: 'Quidorids',
            scientificName: 'Chydoridae',
            image: 'assets/images/natura/clau-macroinvertebrats/Chydoridae.PNG',
            result: 'Crustacis',
            path: ['yes', 'more']
        },
        {
            id: 'cyclopidae',
            name: 'Ciclòpids',
            scientificName: 'Cyclopidae',
            image: 'assets/images/natura/clau-macroinvertebrats/Cyclopidae.PNG',
            result: 'Crustacis',
            path: ['yes', 'more']
        },
        {
            id: 'calopterigid',
            name: 'Calopterígids',
            scientificName: 'Calopterygidae',
            image: 'assets/images/natura/clau-macroinvertebrats/Calopterigid.PNG',
            result: 'Insectes',
            path: ['yes', 'six']
        },
        {
            id: 'tipula',
            name: 'Tipula',
            scientificName: 'Tipula',
            image: 'assets/images/natura/clau-macroinvertebrats/Tipula.PNG',
            result: 'Dípters',
            path: ['no', 'no', 'yes', 'yes']
        },
        {
            id: 'rheocricotopus',
            name: 'Rheocricotopus',
            scientificName: 'Rheocricotopus',
            image: 'assets/images/natura/clau-macroinvertebrats/Rheocricotopus.PNG',
            result: 'Dípters',
            path: ['no', 'no', 'yes', 'yes']
        },
        {
            id: 'eristalis',
            name: 'Eristalis',
            scientificName: 'Eristalis',
            image: 'assets/images/natura/clau-macroinvertebrats/Eristalis.PNG',
            result: 'Dípters',
            path: ['no', 'no', 'yes', 'yes']
        },
        {
            id: 'chironomus',
            name: 'Chironomus',
            scientificName: 'Chironomus',
            image: 'assets/images/natura/clau-macroinvertebrats/Chironomus.PNG',
            result: 'Dípters',
            path: ['no', 'no', 'yes', 'yes']
        },
        {
            id: 'hydropsyche',
            name: 'Hydropsyche',
            scientificName: 'Hydropsyche',
            image: 'assets/images/natura/clau-macroinvertebrats/Hydropsyche.PNG',
            result: 'Insectes',
            path: ['yes', 'six']
        },
        {
            id: 'polycentropus',
            name: 'Polycentropus',
            scientificName: 'Polycentropus',
            image: 'assets/images/natura/clau-macroinvertebrats/Polycentropus.PNG',
            result: 'Insectes',
            path: ['yes', 'six']
        },
        {
            id: 'potamophylax',
            name: 'Potamophylax',
            scientificName: 'Potamophylax',
            image: 'assets/images/natura/clau-macroinvertebrats/Potamophylax.PNG',
            result: 'Insectes',
            path: ['yes', 'six']
        },
        {
            id: 'rhyacophila',
            name: 'Rhyacophila',
            scientificName: 'Rhyacophila',
            image: 'assets/images/natura/clau-macroinvertebrats/Rhyacophila.PNG',
            result: 'Insectes',
            path: ['yes', 'six']
        },
        {
            id: 'sericostoma-personatum',
            name: 'Sericostoma personatum',
            scientificName: 'Sericostoma personatum',
            image: 'assets/images/natura/clau-macroinvertebrats/Sericostoma personatum.PNG',
            result: 'Insectes',
            path: ['yes', 'six']
        },
        {
            id: 'wormaldia',
            name: 'Wormaldia',
            scientificName: 'Wormaldia',
            image: 'assets/images/natura/clau-macroinvertebrats/Wormaldia.PNG',
            result: 'Insectes',
            path: ['yes', 'six']
        }
    ];

    const nodes = {
        start: {
            question: 'Té potes articulades?',
            options: [
                { id: 'yes', label: 'Sí, té potes articulades', next: 'leg-count' },
                { id: 'no', label: 'No té potes articulades', next: 'shell' }
            ]
        },
        'leg-count': {
            question: 'Quantes potes articulades observes?',
            options: [
                { id: 'six', label: '6 potes', result: 'Insectes' },
                { id: 'eight', label: '8 potes', result: 'Aràcnids' },
                { id: 'more', label: 'Més de 8 potes', result: 'Crustacis' }
            ]
        },
        shell: {
            question: 'Té closca?',
            options: [
                { id: 'yes', label: 'Sí, té closca', next: 'valves' },
                { id: 'no', label: 'No té closca', next: 'segmented' }
            ]
        },
        valves: {
            question: 'La closca té dues valves?',
            options: [
                { id: 'yes', label: 'Sí, té dues valves', result: 'Bivalves' },
                { id: 'no', label: 'No, no té dues valves', result: 'Gasteròpodes' }
            ]
        },
        segmented: {
            question: 'Té el cos segmentat?',
            options: [
                { id: 'yes', label: 'Sí, té el cos segmentat', next: 'appendages' },
                { id: 'no', label: 'No té el cos segmentat', next: 'unsegmented' }
            ]
        },
        appendages: {
            question: 'Té càpsula cefàlica, pseudòpodes, brànquies o altres apèndixs?',
            options: [
                { id: 'yes', label: 'Sí, té algun d’aquests apèndixs', result: 'Dípters' },
                { id: 'no', label: 'No té aquests apèndixs', next: 'sucker' }
            ]
        },
        sucker: {
            question: 'Té una ventosa?',
            options: [
                { id: 'yes', label: 'Sí, té una ventosa', result: 'Hirudinis' },
                { id: 'no', label: 'No té ventosa', result: 'Oligoquets' }
            ]
        },
        unsegmented: {
            question: 'Quina forma té el cos?',
            options: [
                { id: 'flat', label: 'És pla', result: 'Turbelaris' },
                { id: 'cylindrical', label: 'És cilíndric', result: 'Nematomorfs' },
                { id: 'medusa', label: 'Té forma de medusa o hidra', result: 'Cnidaris' },
                { id: 'colonial', label: 'És un animal colonial', result: 'Briozous' }
            ]
        }
    };

    const insectSpecimens = [
        {
            id: 'culex-insectes', name: 'Culex', scientificName: 'Culex',
            image: 'assets/images/natura/clau-macroinvertebrats/Culex.PNG',
            result: 'Dípters', family: 'Culícids', path: ['no']
        },
        {
            id: 'simulium-insectes', name: 'Simulium', scientificName: 'Simulium',
            image: 'assets/images/natura/clau-macroinvertebrats/Simulium.PNG',
            result: 'Dípters', family: 'Simúlids', path: ['no']
        },
        {
            id: 'betis-insectes', name: 'Bètid', scientificName: 'Baetis rhodani',
            image: 'assets/images/natura/clau-macroinvertebrats/Betis.PNG',
            result: 'Efemeròpters', family: '', path: ['yes', 'no', 'yes', 'cerci', 'gills']
        },
        {
            id: 'calopterigid-insectes', name: 'Calopterígids', scientificName: 'Calopterygidae',
            image: 'assets/images/natura/clau-macroinvertebrats/Calopterigid.PNG',
            result: 'Odonats', family: 'Calopterígids', path: ['yes', 'no', 'yes', 'lamina']
        },
        {
            id: 'tipula-insectes', name: 'Tipula', scientificName: 'Tipula',
            image: 'assets/images/natura/clau-macroinvertebrats/Tipula.PNG',
            result: 'Dípters', family: '', path: ['no']
        },
        {
            id: 'rheocricotopus-insectes', name: 'Rheocricotopus', scientificName: 'Rheocricotopus',
            image: 'assets/images/natura/clau-macroinvertebrats/Rheocricotopus.PNG',
            result: 'Dípters', family: 'Quironòmids', path: ['no']
        },
        {
            id: 'eristalis-insectes', name: 'Eristalis', scientificName: 'Eristalis',
            image: 'assets/images/natura/clau-macroinvertebrats/Eristalis.PNG',
            result: 'Dípters', family: 'Sírfids', path: ['no']
        },
        {
            id: 'chironomus-insectes', name: 'Chironomus', scientificName: 'Chironomus',
            image: 'assets/images/natura/clau-macroinvertebrats/Chironomus.PNG',
            result: 'Dípters', family: 'Quironòmids', path: ['no']
        },
        {
            id: 'hydropsyche-insectes', name: 'Hydropsyche', scientificName: 'Hydropsyche',
            image: 'assets/images/natura/clau-macroinvertebrats/Hydropsyche.PNG',
            result: 'Tricòpters', family: '', path: ['yes', 'no', 'no', 'short', 'yes']
        },
        {
            id: 'polycentropus-insectes', name: 'Polycentropus', scientificName: 'Polycentropus',
            image: 'assets/images/natura/clau-macroinvertebrats/Polycentropus.PNG',
            result: 'Tricòpters', family: '', path: ['yes', 'no', 'no', 'short', 'yes']
        },
        {
            id: 'potamophylax-insectes', name: 'Potamophylax', scientificName: 'Potamophylax',
            image: 'assets/images/natura/clau-macroinvertebrats/Potamophylax.PNG',
            result: 'Tricòpters', family: '', path: ['yes', 'no', 'no', 'short', 'yes']
        },
        {
            id: 'rhyacophila-insectes', name: 'Rhyacophila', scientificName: 'Rhyacophila',
            image: 'assets/images/natura/clau-macroinvertebrats/Rhyacophila.PNG',
            result: 'Tricòpters', family: '', path: ['yes', 'no', 'no', 'short', 'yes']
        },
        {
            id: 'sericostoma-personatum-insectes', name: 'Sericostoma personatum', scientificName: 'Sericostoma personatum',
            image: 'assets/images/natura/clau-macroinvertebrats/Sericostoma personatum.PNG',
            result: 'Tricòpters', family: '', path: ['yes', 'no', 'no', 'short', 'yes']
        },
        {
            id: 'wormaldia-insectes', name: 'Wormaldia', scientificName: 'Wormaldia',
            image: 'assets/images/natura/clau-macroinvertebrats/Wormaldia.PNG',
            result: 'Tricòpters', family: '', path: ['yes', 'no', 'no', 'short', 'yes']
        },
        {
            id: 'odonata', name: 'Libèl·lula', scientificName: 'Odonata',
            image: 'assets/images/natura/Odonata.png',
            result: 'Odonats', family: '', path: ['yes', 'no', 'yes', 'lamina']
        },
        {
            id: 'ephemeroptera', name: 'Efemeròpter', scientificName: 'Ephemeroptera',
            image: 'assets/images/natura/Efemeroptera.png',
            result: 'Efemeròpters', family: '', path: ['yes', 'no', 'yes', 'cerci', 'gills']
        },
        {
            id: 'trichoptera', name: 'Tricòpter', scientificName: 'Trichoptera',
            image: 'assets/images/natura/Tricoptera.png',
            result: 'Tricòpters', family: '', path: ['yes', 'no', 'no', 'short', 'yes']
        }
    ];

    const insectNodes = {
        start: {
            question: 'Té potes articulades?',
            options: [
                { id: 'no', label: 'No té potes articulades', result: 'Dípters' },
                { id: 'yes', label: 'Sí, té potes articulades', next: 'elytra' }
            ]
        },
        elytra: {
            question: 'Té aspecte d’escarabat amb èlitres coriacis?',
            options: [
                { id: 'yes', label: 'Sí, té èlitres', result: 'Coleòpters' },
                { id: 'no', label: 'No té èlitres', next: 'eyes' }
            ]
        },
        eyes: {
            question: 'Té ulls compostos i estoigs alars?',
            options: [
                { id: 'yes', label: 'Sí', next: 'caudal' },
                { id: 'no', label: 'No, té ulls simples i no té estoigs alars', next: 'mandibles' }
            ]
        },
        caudal: {
            question: 'Quins apèndixs caudals observes?',
            options: [
                { id: 'lamina', label: 'Làmines o cúpula anal', result: 'Odonats' },
                { id: 'siphon', label: 'Sifó respiratori o sense apèndixs', result: 'Heteròpters' },
                { id: 'cerci', label: 'Cercs pluriarticulats', next: 'gill-cerci' }
            ]
        },
        'gill-cerci': {
            question: 'Té brànquies abdominals?',
            options: [
                { id: 'gills', label: 'Sí, té brànquies abdominals', result: 'Efemeròpters' },
                { id: 'no-gills', label: 'No té brànquies abdominals', result: 'Plecòpters' }
            ]
        },
        mandibles: {
            question: 'Les mandíbules són més llargues que el cap?',
            options: [
                { id: 'long', label: 'Sí, són més llargues que el cap', result: 'Planipennis' },
                { id: 'short', label: 'No, són més curtes que el cap', next: 'caudal-larva' }
            ]
        },
        'caudal-larva': {
            question: 'Quina característica observes a l’extrem caudal?',
            options: [
                { id: 'long-projection', label: 'Una prolongació molt llarga', result: 'Megalòpters' },
                { id: 'yes', label: 'Dos pigòpodes amb ungles', result: 'Tricòpters' },
                { id: 'pseudopods', label: 'Pseudòpodes abdominals', result: 'Lepidòpters' },
                { id: 'other', label: 'Una altra forma', result: 'Coleòpters' }
            ]
        }
    };

    const keyHints = {
        groups: {
            start: 'Les potes articulades es mouen per segments i tenen articulacions visibles.',
            'leg-count': 'Compta les potes articulades que observes, no les prolongacions o brànquies.',
            shell: 'La closca és una coberta dura que protegeix el cos de l’organisme.',
            valves: 'Les valves són les dues peces que formen la closca d’un bivalve.',
            segmented: 'Un cos segmentat està dividit en anells o parts repetides.',
            appendages: 'Busca una càpsula cefàlica, pseudòpodes, brànquies o altres estructures que sobresurtin del cos.',
            sucker: 'Una ventosa és una estructura circular que permet fixar-se a una superfície.',
            unsegmented: 'Observa la forma general del cos: pot ser pla, cilíndric, semblant a una hidra o colonial.'
        },
        insects: {
            start: 'Les larves d’insecte tenen tres parells de potes articulades al tòrax.',
            elytra: 'Els èlitres són unes cobertes dures, semblants a una closca, que protegeixen les ales dels escarabats.',
            eyes: 'Els ulls compostos tenen moltes petites facetes. Els estoigs alars són cobertes que protegeixen les ales.',
            caudal: 'Mira les estructures de l’extrem posterior: poden ser làmines, una cúpula, un sifó o cercs.',
            'gill-cerci': 'Els cercs són apèndixs de l’extrem de l’abdomen. Les brànquies abdominals ajuden a respirar sota l’aigua.',
            mandibles: 'Les mandíbules són les peces dures de la boca. Compara la seva llargada amb la del cap.',
            'caudal-larva': 'Observa l’extrem posterior de la larva: busca una prolongació, pigòpodes amb ungles o pseudòpodes.'
        }
    };

    const keyCatalog = {
        groups: { specimens: mainSpecimens, nodes, title: 'Grans grups d’invertebrats aquàtics' },
        insects: { specimens: insectSpecimens, nodes: insectNodes, title: 'Ordres d’insectes en fase aquàtica' }
    };

    let selectedSpecimen = null;
    let currentNodeId = 'start';
    let currentStep = 0;
    let score = 0;
    let errors = 0;
    let firstAttempt = true;
    let pathLabels = [];
    let activeKeyId = 'groups';

    function getActiveKey() {
        return keyCatalog[activeKeyId];
    }

    function showMacroKeyHint() {
        const hint = document.getElementById('macro-key-hint');
        const text = keyHints[activeKeyId]?.[currentNodeId];
        if (!hint || !text) return;

        hint.textContent = text;
        hint.classList.remove('hidden');
    }

    function formatSpecimenName(specimen) {
        if (specimen.name === specimen.scientificName) {
            return `<em>${specimen.scientificName}</em>`;
        }

        return `${specimen.name}<br><em>${specimen.scientificName}</em>`;
    }

    function initMacroKeyActivity() {
        selectedSpecimen = null;
        currentNodeId = 'start';
        currentStep = 0;
        score = 0;
        errors = 0;
        firstAttempt = true;
        pathLabels = [];

        activeKeyId = 'groups';
        const keySelector = document.getElementById('macro-key-key-selector');
        const selector = document.getElementById('macro-key-specimen-selector');
        const game = document.getElementById('macro-key-game');
        const result = document.getElementById('macro-key-result');

        if (!keySelector || !selector || !game || !result) return;
        keySelector.classList.remove('hidden');
        selector.classList.add('hidden');
        game.classList.add('hidden');
        result.classList.add('hidden');
        renderSpecimenSelector();
    }

    function selectMacroKey(keyId) {
        if (!keyCatalog[keyId]) return;
        activeKeyId = keyId;
        document.getElementById('macro-key-key-selector')?.classList.add('hidden');
        document.getElementById('macro-key-specimen-selector')?.classList.remove('hidden');
        renderSpecimenSelector();
    }

    function renderSpecimenSelector() {
        const selector = document.getElementById('macro-key-specimen-selector');
        if (!selector) return;

        selector.innerHTML = getActiveKey().specimens.map(specimen => `
            <button type="button" class="macro-key-specimen-card" onclick="startMacroKeySpecimen('${specimen.id}')">
                <img src="${specimen.image}" alt="${specimen.name}">
                <span>${formatSpecimenName(specimen)}</span>
            </button>
        `).join('');
    }

    function startMacroKeySpecimen(specimenId) {
        selectedSpecimen = getActiveKey().specimens.find(specimen => specimen.id === specimenId);
        if (!selectedSpecimen) return;

        currentNodeId = 'start';
        currentStep = 0;
        score = 0;
        errors = 0;
        firstAttempt = true;
        pathLabels = [];

        document.getElementById('macro-key-specimen-selector')?.classList.add('hidden');
        document.getElementById('macro-key-result')?.classList.add('hidden');
        document.getElementById('macro-key-game')?.classList.remove('hidden');
        renderMacroKeyNode();
    }

    function renderMacroKeyNode() {
        const node = getActiveKey().nodes[currentNodeId];
        if (!node || !selectedSpecimen) return;

        const image = document.getElementById('macro-key-specimen-image');
        const name = document.getElementById('macro-key-specimen-name');
        const step = document.getElementById('macro-key-step');
        const question = document.getElementById('macro-key-question');
        const options = document.getElementById('macro-key-options');
        const feedback = document.getElementById('macro-key-feedback');
        const next = document.getElementById('macro-key-next');
        const hint = document.getElementById('macro-key-hint');

        if (image) {
            image.src = selectedSpecimen.image;
            image.alt = selectedSpecimen.name;
        }
        if (name) name.innerHTML = formatSpecimenName(selectedSpecimen);
        if (step) step.textContent = `Decisió ${currentStep + 1}`;
        if (question) question.textContent = node.question;
        if (feedback) feedback.className = 'game-panel__feedback hidden';
        if (next) next.classList.add('hidden');
        if (hint) {
            hint.textContent = '';
            hint.classList.add('hidden');
        }

        if (options) {
            options.innerHTML = node.options.map(option => `
                <button type="button" class="btn btn--outline macro-key-option" onclick="answerMacroKey('${option.id}')">
                    ${option.label}
                </button>
            `).join('');
        }

        updateMacroKeyScore();
        renderMacroKeyPath();
    }

    function answerMacroKey(optionId) {
        const node = getActiveKey().nodes[currentNodeId];
        const option = node?.options.find(item => item.id === optionId);
        if (!option || !selectedSpecimen) return;

        const expectedOptionId = selectedSpecimen.path[currentStep];
        const feedback = document.getElementById('macro-key-feedback');
        const next = document.getElementById('macro-key-next');

        if (optionId !== expectedOptionId) {
            errors++;
            firstAttempt = false;
            if (feedback) {
                feedback.className = 'game-panel__feedback feedback-panel--error';
                feedback.textContent = 'Aquesta opció no correspon a l’organisme. Observa de nou la imatge i torna-ho a provar.';
                feedback.classList.remove('hidden');
            }
            return;
        }

        if (firstAttempt) score++;
        pathLabels.push(option.label);
        currentStep++;
        firstAttempt = true;

        if (feedback) {
            feedback.className = 'game-panel__feedback feedback-panel--success';
            feedback.textContent = 'Correcte. Continua seguint la clau.';
            feedback.classList.remove('hidden');
        }
        if (next) next.classList.remove('hidden');

        document.querySelectorAll('.macro-key-option').forEach(button => {
            button.disabled = true;
        });
        updateMacroKeyScore();
        renderMacroKeyPath();
    }

    function nextMacroKeyStep() {
        const node = getActiveKey().nodes[currentNodeId];
        const lastOption = node.options.find(option => option.id === selectedSpecimen.path[currentStep - 1]);

        if (lastOption?.result) {
            finishMacroKey(lastOption.result);
            return;
        }

        currentNodeId = lastOption.next;
        renderMacroKeyNode();
    }

    function finishMacroKey(result) {
        const totalSteps = selectedSpecimen.path.length;
        const totalPoints = totalSteps + 1;
        const finalScore = score + (result === selectedSpecimen.result ? 1 : 0);
        const percentage = Math.round((finalScore / totalPoints) * 100);
        const familyText = selectedSpecimen.family ? ` Família: ${selectedSpecimen.family}.` : '';

        document.getElementById('macro-key-game')?.classList.add('hidden');
        document.getElementById('macro-key-result')?.classList.remove('hidden');
        document.getElementById('macro-key-result-message').innerHTML = result === selectedSpecimen.result
            ? `Has identificat l’organisme com a <strong>${result}</strong>.${familyText}`
            : `La clau t’ha portat a <strong>${result}</strong>, però el resultat esperat era <strong>${selectedSpecimen.result}</strong>.${familyText}`;
        document.getElementById('macro-key-result-score').textContent = `Puntuació: ${finalScore} / ${totalPoints} (${percentage}%) · Errors: ${errors}`;
        document.getElementById('macro-key-result-path').textContent = `Camí seguit: ${pathLabels.join(' → ')} → ${result}`;

        saveMacroKeyResult(result, percentage, finalScore, totalPoints);
    }

    function saveMacroKeyResult(result, percentage, finalScore, totalPoints) {
        if (typeof state === 'undefined' || !state.user || typeof callApi !== 'function') return;

        callApi('saveResult', {
            email: state.user.email,
            curs: state.user.curs,
            grup: state.user.grup,
            projecte: 'Entorns de Natura',
            app: `clau-macroinvertebrats-${activeKeyId}`,
            nivell: `${selectedSpecimen.name} · ${selectedSpecimen.result}${selectedSpecimen.family ? ` · ${selectedSpecimen.family}` : ''}`,
            puntuacio: percentage,
            temps_segons: 0,
            feedback_pos: `${result} · ${finalScore}/${totalPoints}`,
            feedback_neg: `Errors: ${errors}`
        }).catch(error => console.error('Error guardant la clau dicotòmica:', error));
    }

    function updateMacroKeyScore() {
        const scoreEl = document.getElementById('macro-key-score');
        if (scoreEl) scoreEl.textContent = `Punts: ${score}`;
    }

    function renderMacroKeyPath() {
        const pathEl = document.getElementById('macro-key-path');
        if (pathEl) pathEl.textContent = pathLabels.length ? `Camí: ${pathLabels.join(' → ')}` : 'Camí: inici';
    }

    window.initMacroKeyActivity = initMacroKeyActivity;
    window.selectMacroKey = selectMacroKey;
    window.startMacroKeySpecimen = startMacroKeySpecimen;
    window.showMacroKeyHint = showMacroKeyHint;
    window.answerMacroKey = answerMacroKey;
    window.nextMacroKeyStep = nextMacroKeyStep;
    window.restartMacroKeyActivity = initMacroKeyActivity;
})();

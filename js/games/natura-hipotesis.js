/**
 * Projecte Rius - Avaluador d'hipotesis.
 * L'alumnat comprova si una hipotesi permet imaginar una recerca concreta.
 */

const riverHypothesisState = {
    hypotheses: [],
    currentIndex: 0,
    totalPoints: 0,
    checked: false
};

const RIVER_HYPOTHESIS_CRITERIA = [
    { id: 'conditional', label: 'Està formulada com una predicció o condicional?', hint: 'Hi trobem «si», «pot ser que», «a mesura que» o una altra forma de predicció.' },
    { id: 'independent', label: 'Hi apareix la variable independent?', hint: 'Indica el factor o la condició que observarem o compararem.' },
    { id: 'dependent', label: 'Hi apareix la variable dependent?', hint: 'Indica què mesurarem o quin efecte esperem observar.' },
    { id: 'precision', label: 'La descripció és precisa i mesurable?', hint: 'Evita paraules vagues i concreta el lloc, la dada o el canvi que estudiarem.' },
    { id: 'investigable', label: 'Podem imaginar com investigar-la?', hint: 'Llegint-la podem imaginar una observació, una comparació o un mostratge.' }
];

const RIVER_HYPOTHESES = [
    {
        text: 'Si augmenta la concentració de nitrats a l’aigua, disminuirà el nombre de famílies de macroinvertebrats sensibles.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: 'El «si» introdueix una predicció.',
            independent: 'La concentració de nitrats és el factor que comparem.',
            dependent: 'El nombre de famílies sensibles és la resposta que mesurarem.',
            precision: 'Concreta nitrats i famílies de macroinvertebrats sensibles.',
            investigable: 'Podem comparar nitrats i famílies en diferents punts del riu.'
        }
    },
    {
        text: 'Si la temperatura de l’aigua puja durant l’estiu a la llera mitjana del riu.',
        checks: { conditional: true, independent: true, dependent: false, precision: true, investigable: false },
        explanations: {
            conditional: 'El «si» introdueix una condició.',
            independent: 'La temperatura de l’aigua és el factor observat.',
            dependent: 'No diu quin efecte o resposta mesurarem.',
            precision: 'Concreta l’època i la zona del riu.',
            investigable: 'Falta saber què volem observar com a conseqüència de la pujada.'
        }
    },
    {
        text: 'El riu està molt brut i això provocarà coses dolentes per als peixos.',
        checks: { conditional: false, independent: false, dependent: false, precision: false, investigable: false },
        explanations: {
            conditional: 'No formula una predicció amb una estructura condicional clara.',
            independent: '«Molt brut» no identifica quin factor mesurarem.',
            dependent: '«Coses dolentes» no indica cap resposta observable.',
            precision: '«Molt brut» i «coses dolentes» són expressions vagues.',
            investigable: 'No permet decidir quines dades recollirem ni com les compararem.'
        }
    },
    {
        text: 'A les zones amb bosc de ribera ben conservat, pot ser que la temperatura màxima de l’aigua sigui més baixa.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: '«Pot ser que» expressa una predicció que es pot comprovar.',
            independent: 'La presència o conservació del bosc de ribera és el factor comparat.',
            dependent: 'La temperatura màxima de l’aigua és la dada que mesurarem.',
            precision: 'Concreta bosc de ribera, temperatura màxima i zones de comparació.',
            investigable: 'Podem mesurar la temperatura en zones amb bosc i sense bosc.'
        }
    },
    {
        text: 'Si hi ha més ombra dels arbres, l’aigua serà més freda.',
        checks: { conditional: true, independent: true, dependent: true, precision: false, investigable: true },
        explanations: {
            conditional: 'El «si» introdueix la predicció.',
            independent: 'La quantitat d’ombra és el factor que observem.',
            dependent: 'La temperatura de l’aigua és la resposta que mesurarem.',
            precision: 'Caldria concretar què vol dir «més ombra» i quantificar el canvi de temperatura.',
            investigable: 'Podem comparar ombra i temperatura en diferents punts.'
        }
    },
    {
        text: 'A mesura que augmenta la velocitat del corrent, disminueix el nombre de larves de mosquit detectades en una mostra de 10 minuts.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: '«A mesura que» relaciona un canvi amb una predicció.',
            independent: 'La velocitat del corrent és el factor que varia.',
            dependent: 'El nombre de larves detectades és la resposta mesurada.',
            precision: 'Concreta el temps i la unitat d’observació de la mostra.',
            investigable: 'Podem prendre mostres de la mateixa durada en punts amb corrents diferents.'
        }
    },
    {
        text: 'Si l’aigua té poc oxigen, llavors hi haurà menys efemeròpters que en un punt amb més oxigen dissolt.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: 'La frase usa «si» i «llavors».',
            independent: 'La quantitat d’oxigen dissolt és el factor que comparem.',
            dependent: 'El nombre d’efemeròpters és la resposta que comptarem.',
            precision: 'Especifica oxigen dissolt, efemeròpters i una comparació entre punts.',
            investigable: 'Podem mesurar oxigen i comptar efemeròpters en dos punts.'
        }
    },
    {
        text: 'Els macroinvertebrats prefereixen els llocs bons del riu i per això n’hi haurà molts.',
        checks: { conditional: false, independent: false, dependent: false, precision: false, investigable: false },
        explanations: {
            conditional: 'No hi ha una predicció condicional clara.',
            independent: '«Llocs bons» no defineix quin factor observarem.',
            dependent: '«N’hi haurà molts» no diu què comptarem ni quants.',
            precision: '«Bons» i «molts» són termes massa imprecisos.',
            investigable: 'Caldria concretar les condicions del lloc i la dada que recollirem.'
        }
    }
];

function initRiverHypothesisGame() {
    const activity = document.getElementById('natura-activity-hipotesis');
    if (!activity) return;

    riverHypothesisState.hypotheses = [...RIVER_HYPOTHESES].sort(() => Math.random() - 0.5).slice(0, 5);
    riverHypothesisState.currentIndex = 0;
    riverHypothesisState.totalPoints = 0;
    riverHypothesisState.checked = false;

    document.getElementById('river-hypothesis-game')?.classList.remove('hidden');
    document.getElementById('river-hypothesis-results')?.classList.add('hidden');
    renderRiverHypothesis();
}

function renderRiverHypothesis() {
    const hypothesis = riverHypothesisState.hypotheses[riverHypothesisState.currentIndex];
    if (!hypothesis) return;

    riverHypothesisState.checked = false;
    document.getElementById('river-hypothesis-progress').textContent = `Hipòtesi ${riverHypothesisState.currentIndex + 1} de ${riverHypothesisState.hypotheses.length}`;
    document.getElementById('river-hypothesis-text').textContent = hypothesis.text;

    const checklist = document.getElementById('river-hypothesis-checklist');
    checklist.innerHTML = RIVER_HYPOTHESIS_CRITERIA.map((criterion) => `
        <label class="river-hypothesis-checklist__item" for="river-hypothesis-${criterion.id}">
            <input type="checkbox" id="river-hypothesis-${criterion.id}" value="${criterion.id}">
            <span>${criterion.label}</span>
            <small>${criterion.hint}</small>
        </label>
    `).join('');

    document.getElementById('river-hypothesis-feedback').className = 'river-hypothesis-feedback hidden';
    document.getElementById('river-hypothesis-feedback').innerHTML = '';
    document.getElementById('river-hypothesis-check').classList.remove('hidden');
    document.getElementById('river-hypothesis-next').classList.add('hidden');
}

function checkRiverHypothesis() {
    if (riverHypothesisState.checked) return;
    const hypothesis = riverHypothesisState.hypotheses[riverHypothesisState.currentIndex];
    let points = 0;
    const feedback = document.getElementById('river-hypothesis-feedback');

    RIVER_HYPOTHESIS_CRITERIA.forEach((criterion) => {
        const input = document.getElementById(`river-hypothesis-${criterion.id}`);
        const selected = input.checked;
        const expected = hypothesis.checks[criterion.id];
        const item = input.closest('.river-hypothesis-checklist__item');
        const correct = selected === expected;
        if (correct) points++;
        item.classList.add(correct ? 'is-correct' : 'is-incorrect');
        input.disabled = true;
    });

    riverHypothesisState.totalPoints += points;
    riverHypothesisState.checked = true;
    feedback.className = 'river-hypothesis-feedback';
    feedback.innerHTML = RIVER_HYPOTHESIS_CRITERIA.map((criterion) => {
        const input = document.getElementById(`river-hypothesis-${criterion.id}`);
        const expected = hypothesis.checks[criterion.id];
        const result = input.checked === expected;
        return `<p class="${result ? 'river-hypothesis-feedback__correct' : 'river-hypothesis-feedback__incorrect'}"><strong>${result ? 'Correcte' : 'Revisa-ho'} · ${criterion.label}</strong><br>${hypothesis.explanations[criterion.id]}</p>`;
    }).join('');

    document.getElementById('river-hypothesis-check').classList.add('hidden');
    document.getElementById('river-hypothesis-next').classList.remove('hidden');
}

function nextRiverHypothesis() {
    if (!riverHypothesisState.checked) return;
    riverHypothesisState.currentIndex++;
    if (riverHypothesisState.currentIndex >= riverHypothesisState.hypotheses.length) {
        finishRiverHypothesisGame();
        return;
    }
    renderRiverHypothesis();
}

function finishRiverHypothesisGame() {
    const maxPoints = riverHypothesisState.hypotheses.length * RIVER_HYPOTHESIS_CRITERIA.length;
    const percentage = Math.round((riverHypothesisState.totalPoints / maxPoints) * 100);
    document.getElementById('river-hypothesis-game').classList.add('hidden');
    document.getElementById('river-hypothesis-results').classList.remove('hidden');
    document.getElementById('river-hypothesis-score').textContent = `${percentage}% (${riverHypothesisState.totalPoints}/${maxPoints})`;
    const feedback = document.getElementById('river-hypothesis-results-feedback');
    feedback.textContent = percentage >= 80 ? 'Molt bé: saps detectar què necessita una hipòtesi investigable.' : 'Revisa les explicacions i torna-ho a provar per afinar la teva anàlisi.';
    setElementStateColor(feedback, percentage >= 80 ? 'success' : 'warning');

    if (typeof saveNaturaResult === 'function' && state.user && state.currentProject) {
        saveNaturaResult(percentage, 'Avaluador d’hipòtesis');
    }
}

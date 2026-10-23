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

RIVER_HYPOTHESES.push(
    {
        text: 'Si estudiem 20 minuts abans d’un examen, traurem millor nota.',
        checks: { conditional: true, independent: true, dependent: true, precision: false, investigable: true },
        explanations: {
            conditional: 'El «si» introdueix una predicció.', independent: 'El temps d’estudi és el factor que comparem.', dependent: 'La nota és la resposta que observem.', precision: '«Millor nota» necessita una comparació més concreta.', investigable: 'Podem comparar notes després de diferents temps d’estudi.'
        }
    },
    {
        text: 'A mesura que augmenta el temps d’ús del mòbil abans d’anar a dormir, disminueix la durada del son.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: '«A mesura que» formula una predicció.', independent: 'El temps d’ús del mòbil és el factor observat.', dependent: 'La durada del son és la dada que mesurem.', precision: 'Concreta el moment d’ús i la durada del son.', investigable: 'Podem registrar l’ús del mòbil i les hores dormides.'
        }
    },
    {
        text: 'Si una planta rep llum durant 8 hores al dia, creixerà més que una planta que en rep 4.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: 'El «si» introdueix la predicció.', independent: 'Les hores de llum són el factor que manipulem.', dependent: 'El creixement és la resposta que mesurarem.', precision: 'Indica les hores de llum i permet mesurar l’alçada.', investigable: 'Podem mantenir dues plantes en condicions iguals.'
        }
    },
    {
        text: 'Les plantes amb més sol estan més contentes i creixen molt.',
        checks: { conditional: false, independent: false, dependent: false, precision: false, investigable: false },
        explanations: {
            conditional: 'No presenta una predicció condicional clara.', independent: '«Més sol» no especifica quantes hores.', dependent: '«Més contentes» i «creixen molt» no són dades.', precision: 'Utilitza expressions vagues o antropomòrfiques.', investigable: 'Caldria concretar hores de llum i una mesura de creixement.'
        }
    },
    {
        text: 'Pot ser que escoltar música instrumental a 60 decibels ajudi a recordar més paraules d’una llista de 20.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: '«Pot ser que» expressa una predicció.', independent: 'La música i el volum són la condició comparada.', dependent: 'El nombre de paraules recordades és la resposta.', precision: 'Concreta el volum i la mida de la llista.', investigable: 'Podem comparar el record amb música i en silenci.'
        }
    },
    {
        text: 'Si bevem aigua, estarem més sans.',
        checks: { conditional: true, independent: true, dependent: true, precision: false, investigable: false },
        explanations: {
            conditional: 'El «si» introdueix una predicció.', independent: 'Beure aigua és el factor observat.', dependent: 'La salut és l’efecte que es vol estudiar.', precision: 'No indica quantitats ni mesures concretes.', investigable: 'Cal definir un període i un indicador de salut.'
        }
    },
    {
        text: 'Si augmenta la temperatura d’una massa de gel, disminuirà el temps que triga a fondre’s.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: 'La frase utilitza «si» i «disminuirà».', independent: 'La temperatura és el factor comparat.', dependent: 'El temps de fusió és la resposta.', precision: 'Defineix un canvi i una dada temporal.', investigable: 'Podem posar masses iguals de gel a temperatures diferents.'
        }
    },
    {
        text: 'Els videojocs són dolents perquè fan perdre el temps.',
        checks: { conditional: false, independent: false, dependent: false, precision: false, investigable: false },
        explanations: {
            conditional: 'No formula una predicció condicional.', independent: 'No concreta quin aspecte dels videojocs comparem.', dependent: '«Són dolents» no és una resposta mesurable.', precision: '«Perdre el temps» és una expressió imprecisa.', investigable: 'Caldria definir temps de joc i un efecte observable.'
        }
    },
    {
        text: 'Si un text té títols i subtítols, el temps necessari per trobar una dada concreta serà menor.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: 'El «si» presenta la predicció.', independent: 'La presència de títols és el factor comparat.', dependent: 'El temps de cerca és la resposta mesurada.', precision: 'Defineix una tasca i un temps mesurable.', investigable: 'Podem comparar textos amb i sense títols.'
        }
    },
    {
        text: 'A les aules amb les finestres obertes, l’aire és millor i els alumnes estan més atents.',
        checks: { conditional: false, independent: true, dependent: false, precision: false, investigable: false },
        explanations: {
            conditional: 'No hi ha una predicció condicional clara.', independent: 'Les finestres obertes són el factor comparat.', dependent: '«Aire millor» i «més atents» no defineixen dades.', precision: 'Cal mesurar la qualitat de l’aire i l’atenció.', investigable: 'La idea necessita variables i mesures operatives.'
        }
    },
    {
        text: 'Si reduïm els residus d’un esmorzar de 200 g a 100 g, disminueix el pes de la brossa setmanal de la classe.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: 'La frase usa «si» per formular la predicció.', independent: 'La quantitat de residus és el factor que reduïm.', dependent: 'El pes setmanal de la brossa és la dada.', precision: 'Inclou quantitats i un període de mesura.', investigable: 'Podem pesar els residus abans i després.'
        }
    },
    {
        text: 'Pot ser que caminar 30 minuts després de dinar redueixi la sensació de son a la tarda.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: '«Pot ser que» introdueix una predicció.', independent: 'Caminar 30 minuts és la condició comparada.', dependent: 'La sensació de son és la resposta.', precision: 'Concreta la durada i el moment de l’activitat.', investigable: 'Podem comparar una escala de son amb i sense passejada.'
        }
    },
    {
        text: 'Si utilitzem aigua amb sal, el paper trigarà més a assecar-se.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: 'El «si» introdueix la predicció.', independent: 'La sal de l’aigua és el factor comparat.', dependent: 'El temps d’assecat és la resposta.', precision: 'Es pot concretar la concentració de sal.', investigable: 'Podem comparar papers iguals amb aigua dolça i salada.'
        }
    },
    {
        text: 'Quan hi ha més trànsit, hi ha més contaminació i la gent respira pitjor.',
        checks: { conditional: true, independent: true, dependent: false, precision: false, investigable: false },
        explanations: {
            conditional: '«Quan» relaciona una condició amb una predicció.', independent: 'La quantitat de trànsit és el factor observat.', dependent: '«Respira pitjor» no concreta la resposta.', precision: '«Més contaminació» necessita un contaminant i una unitat.', investigable: 'Cal definir contaminants i indicadors de salut.'
        }
    },
    {
        text: 'Si comparem dues marques de paper amb la mateixa quantitat d’aigua, la més gruixuda n’absorbirà més abans de trencar-se.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: 'El «si» introdueix la predicció.', independent: 'El gruix o la marca és el factor comparat.', dependent: 'L’aigua absorbida és la resposta.', precision: 'Indica una comparació i una condició controlada.', investigable: 'Podem fer proves repetides amb mostres iguals.'
        }
    },
    {
        text: 'La tecnologia ajuda molt a aprendre i fa que les classes siguin millors.',
        checks: { conditional: false, independent: false, dependent: false, precision: false, investigable: false },
        explanations: {
            conditional: 'No hi ha una predicció condicional.', independent: '«La tecnologia» és massa general.', dependent: '«Aprendre més» i «classes millors» no són dades.', precision: 'La frase conté diversos termes vagues.', investigable: 'Cal concretar una eina, una tasca i una mesura.'
        }
    },
    {
        text: 'Si una llavor germina en foscor durant 7 dies, la tija serà més llarga que la d’una llavor germinada amb llum.',
        checks: { conditional: true, independent: true, dependent: true, precision: true, investigable: true },
        explanations: {
            conditional: 'La frase usa «si» per presentar la predicció.', independent: 'La llum és el factor comparat.', dependent: 'La longitud de la tija és la dada.', precision: 'Concreta la durada i la mesura.', investigable: 'Podem germinar llavors iguals en dues condicions.'
        }
    }
);

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

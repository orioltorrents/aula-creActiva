/**
 * Activitat: Les Cèl·lules de la Sang - Desplegables
 * Projecte: Biologia
 *
 * CONFIGURA L'ORDRE: Modifica l'array 'CELLS_ANSWER_KEY' per indicar
 * quin tipus de cèl·lula correspon a cada número (1, 2, 3) de la imatge.
 */

// -----------------------------------------------------------------------
// CLAU DE RESPOSTES - Canvia l'ordre si cal per coincidir amb la imatge!
// -----------------------------------------------------------------------
const CELLS_ANSWER_KEY = [
    { num: 1, common: 'Glòbul Vermell', scientific: 'Eritròcit' },
    { num: 2, common: 'Glòbul Blanc', scientific: 'Leucòcit' },
    { num: 3, common: 'Plaqueta', scientific: 'Trombocit' }
];

const COMMON_OPTIONS = ['Glòbul Vermell', 'Glòbul Blanc', 'Plaqueta'];
const SCIENTIFIC_OPTIONS = ['Eritròcit', 'Leucòcit', 'Trombocit'];

// -----------------------------------------------------------------------

function initCellsGame() {
    document.getElementById('cells-results').classList.add('hidden');
    document.getElementById('cells-matching-ui').classList.remove('hidden');
    document.getElementById('cells-feedback').innerText = '';

    // Omplir desplegables
    for (let i = 1; i <= 3; i++) {
        fillSelect(`select-common-${i}`, COMMON_OPTIONS);
        fillSelect(`select-scientific-${i}`, SCIENTIFIC_OPTIONS);

        // Reset estils de fila
        const row = document.getElementById(`row-cell-${i}`);
        row.classList.remove('border-green-400', 'bg-green-50', 'border-red-400', 'bg-red-50');
        row.classList.add('border');
    }
}

function fillSelect(selectId, options) {
    const sel = document.getElementById(selectId);
    sel.innerHTML = '<option value="" disabled selected>Tria...</option>';
    options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        sel.appendChild(o);
    });
    sel.disabled = false;
}

function checkCellsAnswers() {
    let correctCount = 0;
    const total = 6; // 3 noms comuns + 3 científics

    CELLS_ANSWER_KEY.forEach(({ num, common, scientific }) => {
        const selCommon = document.getElementById(`select-common-${num}`);
        const selScientific = document.getElementById(`select-scientific-${num}`);
        const row = document.getElementById(`row-cell-${num}`);

        const commonOk = selCommon.value === common;
        const scientificOk = selScientific.value === scientific;

        if (commonOk) correctCount++;
        if (scientificOk) correctCount++;

        // Feedback visual per fila
        row.classList.remove('border', 'border-green-400', 'bg-green-50', 'border-red-400', 'bg-red-50');
        if (commonOk && scientificOk) {
            row.classList.add('border-green-400', 'bg-green-50');
        } else {
            row.classList.add('border-red-400', 'bg-red-50');
        }

        // Bloquejar selects incorrectes perquè l'alumne vegi on s'ha equivocat
        selCommon.disabled = commonOk;
        selScientific.disabled = scientificOk;
    });

    const percentage = Math.round((correctCount / total) * 100);

    if (correctCount === total) {
        // Tot correcte: mostrar resultat
        showCellsResults(correctCount, total, percentage);
    } else {
        // Parcialment correcte: donar feedback i deixar corregir
        const feedback = document.getElementById('cells-feedback');
        feedback.innerText = `${correctCount} / ${total} correctes. Corregeix els vermells i torna-ho a provar!`;
        feedback.style.color = 'var(--error)';
    }
}

function showCellsResults(correct, total, percentage) {
    document.getElementById('cells-matching-ui').classList.add('hidden');
    document.getElementById('cells-results').classList.remove('hidden');
    document.getElementById('cells-feedback').innerText = '';

    document.getElementById('cells-final-score').innerText = `${correct} / ${total}  (${percentage}%)`;

    let msg;
    if (percentage === 100) msg = 'Perfecte! Coneixes tots els noms! 🔬🩸';
    else if (percentage >= 67) msg = 'Molt bé! Però repassa algun nom. 💪';
    else msg = 'Cal repassar les cèl·lules de la sang. Ànims! 📚';

    document.getElementById('cells-message').innerText = msg;

    // Guardar resultat
    if (typeof saveResult === 'function') {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        saveResult({
            email: userData.email,
            curs: userData.curs,
            projecte: 'Biologia',
            app: 'Les Cèl·lules de la Sang',
            nivell: 'Estàndard',
            puntuacio: percentage,
            temps_segons: 0,
            feedback_pos: '',
            feedback_neg: ''
        });
    }
}

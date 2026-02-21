/**
 * NATURA - Xarxes Tròfiques
 * Activitat d'ordenar accions
 */

const naturaXarxesState = {
    correctOrder: [
        'action_select_ecosystem',
        'action_identify_species',
        'action_observe_behavior',
        'action_collect_samples',
        'action_scientific_info',
        'action_diet_classification',
        'action_primary_producers',
        'action_assign_trophic_level',
        'action_draw_interactions',
        'action_final_web'
    ],
    currentOrder: [],
    penaltyPoints: 0
};

function showNaturaMenu() {
    const hub = document.getElementById('project-hub-natura');
    if (hub) {
        document.getElementById('natura-activities-menu').classList.remove('hidden');
        hub.querySelectorAll('.sub-activity').forEach(el => el.classList.add('hidden'));
    }
}

function openNaturaActivity(actId) {
    document.getElementById('natura-activities-menu').classList.add('hidden');
    document.getElementById(`natura-activity-${actId}`).classList.remove('hidden');

    if (actId === 'xarxes') {
        initXarxesGame();
    } else if (actId === 'rols') {
        initRolsActivity();
    } else if (actId === 'impacte' && typeof initImpacteGame === 'function') {
        initImpacteGame();
    } else if (actId === 'biblio' && typeof initBiblioGame === 'function') {
        initBiblioGame();
    }
}

function initRolsActivity() {
    document.getElementById('rols-ecosystem-selection').classList.remove('hidden');
    document.getElementById('rols-quiz-area').classList.add('hidden');
    document.getElementById('rols-results-area').classList.add('hidden');
}

function initXarxesGame() {
    const list = document.getElementById('xarxes-sortable-list');
    list.innerHTML = '';

    // Reset estat i amagar resultats previs
    naturaXarxesState.penaltyPoints = 0;
    document.getElementById('xarxes-result').classList.add('hidden');

    // Desordenar les accions (shuffled)
    const shuffled = [...naturaXarxesState.correctOrder].sort(() => Math.random() - 0.5);

    shuffled.forEach(key => {
        const li = document.createElement('li');
        li.className = 'sortable-item';
        li.draggable = true;
        li.dataset.key = key;
        li.innerHTML = `
            <span class="handle">☰</span>
            <span data-i18n="${key}">${i18n.t(key)}</span>
        `;

        // Drag events
        li.addEventListener('dragstart', () => li.classList.add('dragging'));
        li.addEventListener('dragend', () => li.classList.remove('dragging'));

        list.appendChild(li);
    });

    // Sortable logic
    list.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(list, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (afterElement == null) {
            list.appendChild(dragging);
        } else {
            list.insertBefore(dragging, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function verifyXarxesOrder() {
    const listItems = [...document.querySelectorAll('#xarxes-sortable-list .sortable-item')];
    const currentOrder = listItems.map(li => li.dataset.key);

    let correctCount = 0;
    currentOrder.forEach((key, index) => {
        if (key === naturaXarxesState.correctOrder[index]) {
            correctCount++;
        }
    });

    const percentage = Math.round((correctCount / naturaXarxesState.correctOrder.length) * 100);

    // Càlcul de penalització (si no està perfecte, s'acumulen 10 punts de penalització per intent)
    if (percentage < 100) {
        naturaXarxesState.penaltyPoints += 10;
    }

    const finalScore = Math.max(0, percentage - naturaXarxesState.penaltyPoints);

    // Mostrar resultats
    const resultDiv = document.getElementById('xarxes-result');
    resultDiv.classList.remove('hidden');

    // Actualitzem el percentage sense carregar-nos el contenidor
    const percentageSpan = document.getElementById('xarxes-percentage');
    if (percentageSpan) {
        let scoreText = `${percentage}%`;
        if (naturaXarxesState.penaltyPoints > 0) {
            scoreText += ` (Penalització intents: -${naturaXarxesState.penaltyPoints}%)`;
        }
        percentageSpan.textContent = scoreText;
    }

    const feedback = document.getElementById('xarxes-feedback');
    if (percentage === 100) {
        feedback.textContent = i18n.t('correct') + ` (Nota final: ${finalScore}%)`;
        feedback.style.color = 'var(--success)';

        // Guardar resultat quan el tinguin correcte
        if (state.user && state.currentProject) {
            saveNaturaResult(finalScore, i18n.t('act_xarxes_title'));
        }
    } else if (percentage >= 50) {
        feedback.textContent = 'Molt bé! Gairebé ho tens. Recorda que cada error resta punts.';
        feedback.style.color = 'orange';
    } else {
        feedback.textContent = 'Segueix intentant-ho. Revisa l\'ordre lògic. Recorda que cada error resta punts.';
        feedback.style.color = 'var(--error)';
    }
}

async function saveNaturaResult(percentage, appName) {
    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject.titol,
        app: appName || i18n.t('act_xarxes_title'),
        nivell: 'Normal',
        puntuacio: percentage,
        temps_segons: 0,
        feedback_pos: 'Completat correctament',
        feedback_neg: ''
    };

    console.log('Guardant resultat Natura:', result);
    const response = await callApi('saveResult', result);
    if (response && response.status === 'success') {
        console.log('Resultat guardat!');
    }
}

// Suport per a traduccions dinàmiques en el joc
function updateNaturaLanguage() {
    // Re-assignar el text de les accions si el joc ja està iniciat
    document.querySelectorAll('#xarxes-sortable-list .sortable-item span[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = i18n.t(key);
    });
}

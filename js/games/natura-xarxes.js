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
    currentOrder: []
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
    }
}

function initXarxesGame() {
    const list = document.getElementById('xarxes-sortable-list');
    list.innerHTML = '';

    // Amagar resultats previs
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

    // Mostrar resultats
    const resultDiv = document.getElementById('xarxes-result');
    resultDiv.classList.remove('hidden');
    document.getElementById('xarxes-percentage').textContent = `${percentage}%`;

    const feedback = document.getElementById('xarxes-feedback');
    if (percentage === 100) {
        feedback.textContent = i18n.t('correct');
        feedback.style.color = 'var(--success)';
    } else if (percentage >= 50) {
        feedback.textContent = 'Molt bé! Gairebé ho tens.';
        feedback.style.color = 'orange';
    } else {
        feedback.textContent = 'Segueix intentant-ho. Revisa l\'ordre lògic.';
        feedback.style.color = 'var(--error)';
    }

    // Opcional: Guardar resultat si és 100% o si l'usuari vol
    if (percentage === 100 && state.user && state.currentProject) {
        saveNaturaResult(percentage);
    }
}

async function saveNaturaResult(percentage) {
    const result = {
        email: state.user.email,
        curs: state.user.curs,
        projecte: state.currentProject.titol,
        app: i18n.t('act_xarxes_title'),
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

/**
 * NATURA - Fases d'un estudi d'impacte ambiental
 * Activitat d'ordenar fases (mateixa lògica que xarxes tròfiques)
 */

const naturaImpacteState = {
    phases: [],
    penaltyPoints: 0,
    dragBound: false
};

async function initImpacteGame() {
    const list = document.getElementById('impacte-sortable-list');
    if (!list) return;

    list.innerHTML = '';
    naturaImpacteState.penaltyPoints = 0;
    document.getElementById('impacte-result').classList.add('hidden');

    await loadImpactePhases();

    const shuffled = [...naturaImpacteState.phases].sort(() => Math.random() - 0.5);
    shuffled.forEach(phase => {
        const li = document.createElement('li');
        li.className = 'sortable-item';
        li.draggable = true;
        li.dataset.id = phase.id;
        li.innerHTML = `
            <span class="handle">☰</span>
            <span>${phase.text}</span>
        `;

        li.addEventListener('dragstart', () => li.classList.add('dragging'));
        li.addEventListener('dragend', () => li.classList.remove('dragging'));

        list.appendChild(li);
    });

    if (!naturaImpacteState.dragBound) {
        list.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getImpacteDragAfterElement(list, e.clientY);
            const dragging = document.querySelector('.dragging');
            if (!dragging) return;
            if (afterElement == null) {
                list.appendChild(dragging);
            } else {
                list.insertBefore(dragging, afterElement);
            }
        });
        naturaImpacteState.dragBound = true;
    }
}

async function loadImpactePhases() {
    const fallback = [
        'Definir l\'abast i els objectius del projecte',
        'Descriure el medi receptor i l\'estat inicial',
        'Identificar alternatives de disseny i ubicació',
        'Detectar factors ambientals potencialment afectats',
        'Predir impactes (magnitud, extensió i durada)',
        'Valorar la significació dels impactes',
        'Dissenyar mesures preventives i correctores',
        'Planificar mesures compensatòries si cal',
        'Definir el programa de vigilància ambiental',
        'Redactar l\'informe final i el resum no tècnic'
    ];

    const response = await callApi('getImpactePhases');
    if (response && response.status === 'success' && Array.isArray(response.phases) && response.phases.length > 0) {
        naturaImpacteState.phases = response.phases;
    } else {
        naturaImpacteState.phases = fallback.map((text, i) => ({ id: `impacte_${i + 1}`, text }));
    }
}

function getImpacteDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function verifyImpacteOrder() {
    const listItems = [...document.querySelectorAll('#impacte-sortable-list .sortable-item')];
    const currentOrder = listItems.map(li => li.dataset.id);
    const correctOrder = naturaImpacteState.phases.map(p => p.id);

    let correctCount = 0;
    currentOrder.forEach((id, index) => {
        if (id === correctOrder[index]) correctCount++;
    });

    const percentage = Math.round((correctCount / correctOrder.length) * 100);
    if (percentage < 100) {
        naturaImpacteState.penaltyPoints += 10;
    }

    const finalScore = Math.max(0, percentage - naturaImpacteState.penaltyPoints);
    const resultDiv = document.getElementById('impacte-result');
    resultDiv.classList.remove('hidden');

    const percentageSpan = document.getElementById('impacte-percentage');
    if (percentageSpan) {
        let scoreText = `${percentage}%`;
        if (naturaImpacteState.penaltyPoints > 0) {
            scoreText += ` (Penalització intents: -${naturaImpacteState.penaltyPoints}%)`;
        }
        percentageSpan.textContent = scoreText;
    }

    const feedback = document.getElementById('impacte-feedback');
    if (percentage === 100) {
        feedback.textContent = i18n.t('correct') + ` (Nota final: ${finalScore}%)`;
        feedback.style.color = 'var(--success)';

        if (state.user && state.currentProject && typeof saveNaturaResult === 'function') {
            saveNaturaResult(finalScore, i18n.t('act_impacte_title'));
        }
    } else if (percentage >= 50) {
        feedback.textContent = 'Molt bé! Gairebé ho tens. Recorda que cada error resta punts.';
        feedback.style.color = 'orange';
    } else {
        feedback.textContent = 'Segueix intentant-ho. Revisa l\'ordre lògic. Recorda que cada error resta punts.';
        feedback.style.color = 'var(--error)';
    }
}

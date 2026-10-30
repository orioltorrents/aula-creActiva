/*
==========================================================
MÒDUL DEL PROJECTE MEDITERRANI
==========================================================

Aquest fitxer JavaScript s'encarrega de gestionar la navegació
i la visualització del projecte Mediterrani.

Què fa aquest fitxer?
- Pinta dinàmicament les targetes del menú d'activitats.
- Mostra el menú principal del projecte.
- Amaga totes les subactivitats quan cal.
- Obre la subactivitat que l'usuari selecciona.

Què NO fa aquest fitxer?
- No gestiona la lògica interna de cada joc o activitat.
- No comprova respostes.
- No calcula puntuacions.
- No controla temporitzadors.

Per tant, aquest fitxer actua com a "controlador del projecte":
organitza la navegació entre les diferents pantalles del
Mediterrani, però la lògica específica de cada activitat
hauria d'estar dins de js/games/.

Exemples de funcions que hi poden anar:
- renderMediterraniActivities()
- showMediterraniMenu()
- hideMediterraniActivities()
- openMediterraniActivity()

Exemples de funcions que NO hi haurien d'anar:
- initMediterraniGame()
- nextTestQuestion()
- checkAnswer()
- updateScore()

==========================================================
*/

// Dibuixa les targetes del menú d'activitats del projecte Mediterrani
function renderMediterraniActivities() {
  const container = document.getElementById("med-activities-menu");
  const phaseActivities = document.getElementById("med-phase-activities");
  const phases = PROJECT_PHASES?.mediterrani || [];
  const activities = PROJECT_ACTIVITIES?.mediterrani || [];
  if (!container || !phaseActivities || phases.length === 0) return;

  container.innerHTML = phases.map(phase => `
    <div class="mediterrani-phase-card" role="button" tabindex="0" onclick="openMediterraniPhase('${phase.id}')"
      onkeydown="if(event.key === 'Enter' || event.key === ' '){event.preventDefault(); openMediterraniPhase('${phase.id}');}">
      ${phase.image ? `<span class="mediterrani-phase-card__media"><img src="${phase.image}" alt="" loading="lazy"></span>` : ''}
      <span class="mediterrani-phase-card__content">
        <strong class="mediterrani-phase-card__title">${phase.cardTitle || phase.title}</strong>
        <span class="mediterrani-phase-card__description">${phase.description}</span>
      </span>
    </div>
  `).join("");

  phaseActivities.innerHTML = phases.map(phase => {
    const phaseItems = activities
      .filter(activity => activity.phase === phase.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    return `<section id="med-${phase.id}" class="mediterrani-phase-menu hidden" aria-labelledby="med-${phase.id}-title">
      ${phase.showHeader !== false ? `<h2 id="med-${phase.id}-title" class="mediterrani-phase-menu__title">${phase.title}</h2>
      <p class="mediterrani-phase-menu__description">${phase.description}</p>` : ''}
      <div class="activities-grid mediterrani-phase-menu__activities">${phaseItems.map(renderMediterraniActivityCard).join("")}</div>
      ${phaseItems.filter(activity => activity.submenu).map(activity => `
        <div id="med-${phase.id}-${activity.submenu}" class="mediterrani-nested-menu hidden">
          <div class="activities-grid">${(activity.children || []).map(renderMediterraniActivityCard).join("")}</div>
        </div>`).join("")}
    </section>`;
  }).join("");

  if (typeof applyTranslations === "function") {
    applyTranslations();
  }
}

function renderMediterraniActivityCard(activity) {
  const action = activity.pending ? '' : activity.submenu
    ? `openMediterraniSubmenu('${activity.submenu}')`
    : `openMediterraniActivity('${activity.action}')`;
  return `<div class="activity-card${activity.pending ? ' mediterrani-activity-card--pending' : ''}"${action ? ` onclick="${action}"` : ' aria-disabled="true"'}>
    <div class="activity-card__media ${activity.mediaClass || ''}">
      ${activity.image ? `<img src="${activity.image}" alt="${activity.fallbackTitle}" class="activity-card__image">` : activity.mediaHtml || ''}
    </div>
    <div class="activity-card__content">
      <div class="activity-card__title" data-i18n="${activity.titleKey || ''}">${activity.fallbackTitle}</div>
      <div class="activity-card__description" data-i18n="${activity.descKey || ''}">${activity.fallbackDesc}</div>
    </div>
  </div>`;
}

function openMediterraniSubmenu(submenuId) {
  const nestedMenu = document.getElementById(`med-fase-03-${submenuId}`);
  const phaseMenu = nestedMenu?.closest('.mediterrani-phase-menu');
  const activities = phaseMenu?.querySelector('.mediterrani-phase-menu__activities');
  if (!nestedMenu || !phaseMenu || !activities) return;
  if (typeof setGameBackToCurrentView === "function") setGameBackToCurrentView();
  activities.classList.add('hidden');
  phaseMenu.querySelector('.mediterrani-phase-menu__title')?.classList.add('hidden');
  phaseMenu.querySelector('.mediterrani-phase-menu__description')?.classList.add('hidden');
  phaseMenu.querySelectorAll('.mediterrani-nested-menu').forEach(element => element.classList.add('hidden'));
  nestedMenu.classList.remove('hidden');
  if (typeof setGameTitle === "function") setGameTitle('Països banyats pel Mediterrani');
}

function openMediterraniPhase(phaseId) {
  const phase = PROJECT_PHASES?.mediterrani?.find(item => item.id === phaseId);
  const menu = document.getElementById("med-activities-menu");
  const phaseMenu = document.getElementById(`med-${phaseId}`);
  if (!phase || !menu || !phaseMenu) return;
  if (typeof setGameBackToCurrentView === "function") setGameBackToCurrentView();
  menu.classList.add("hidden");
  document.querySelectorAll("#med-phase-activities .mediterrani-phase-menu").forEach(element => element.classList.add("hidden"));
  phaseMenu.classList.remove("hidden");
  phaseMenu.querySelector('.mediterrani-phase-menu__title')?.classList.remove('hidden');
  phaseMenu.querySelector('.mediterrani-phase-menu__description')?.classList.remove('hidden');
  phaseMenu.querySelector('.mediterrani-phase-menu__activities')?.classList.remove('hidden');
  phaseMenu.querySelectorAll('.mediterrani-nested-menu').forEach(element => element.classList.add('hidden'));
  if (typeof setGameTitle === "function") setGameTitle(phase.title);
}

// Amaga totes les subactivitats del projecte Mediterrani
function hideMediterraniActivities() {
  // Llista d'identificadors de les subactivitats del projecte.
  // Si en el futur s'afegeixen noves activitats, caldrà afegir-les aquí.
  const activityIds = [
    "med-activity-capitals",
    "med-activity-test_mar",
    "med-activity-map",
    "med-activity-mars-oceans",
    "med-activity-biodiversitat",
    "med-activity-quadern-bitacola",
    "med-activity-temps-geologic",
    "med-activity-creacio-mar",
    "med-activity-plaques",
    "med-activity-crisi-messinia"
  ];

  // Recorrem cada id i amaguem el bloc si existeix
  activityIds.forEach(id => {
    const element = document.getElementById(id);

    if (element) {
      element.classList.add("hidden");
    }
  });
}

// Mostra el menú principal del projecte Mediterrani
function showMediterraniMenu() {
  // Recuperem el menú d'activitats
  const menu = document.getElementById("med-activities-menu");

  // Abans de mostrar el menú, amaguem totes les subactivitats
  hideMediterraniActivities();

  // Mostrem el menú si existeix
  if (menu) {
    menu.classList.remove("hidden");
  }
}

// Obre una activitat concreta del projecte Mediterrani
function openMediterraniActivity(activityName) {
  // Recuperem el menú principal del projecte
  const menu = document.getElementById("med-activities-menu");

  // Amaguem el menú si existeix
  if (menu) {
    menu.classList.add("hidden");
  }

  // Amaguem totes les subactivitats abans d'obrir-ne una
  hideMediterraniActivities();

  // Construïm l'id HTML de la subactivitat a partir del nom rebut
  const activityId = `med-activity-${activityName}`;

  // Recuperem el bloc de la subactivitat corresponent
  const activityElement = document.getElementById(activityId);

  // Mostrem la subactivitat si existeix
  if (activityElement) {
    activityElement.classList.remove("hidden");
  }

  if (activityName === "biodiversitat" && typeof initMediterraniBiodiversitatQuiz === "function") {
    initMediterraniBiodiversitatQuiz();
  }
}

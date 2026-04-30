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
  // Contenidor on es pinten les targetes
  const container = document.getElementById("med-activities-menu");

  // Activitats configurades per al projecte Mediterrani.
  // Si no n'hi ha cap definida, fem servir un array buit.
  const activities = PROJECT_ACTIVITIES?.mediterrani || [];

  // Si no existeix el contenidor o no hi ha activitats definides, sortim
  if (!container || activities.length === 0) return;

  // Generem les targetes a partir de la configuració
  container.innerHTML = activities.map(activity => `
    <div class="activity-card" onclick="openMediterraniActivity('${activity.action}')">
      <div class="act-icon">
        <img src="${activity.image}" alt="${activity.fallbackTitle}" class="act-img">
      </div>
      <div class="card-content">
        <div class="card-title" data-i18n="${activity.titleKey}">
          ${activity.fallbackTitle}
        </div>
        <div class="card-desc" data-i18n="${activity.descKey}">
          ${activity.fallbackDesc}
        </div>
      </div>
    </div>
  `).join("");

  // Reapliquem les traduccions si la funció existeix
  if (typeof applyTranslations === "function") {
    applyTranslations();
  }
}

// Amaga totes les subactivitats del projecte Mediterrani
function hideMediterraniActivities() {
  // Llista d'identificadors de les subactivitats del projecte.
  // Si en el futur s'afegeixen noves activitats, caldrà afegir-les aquí.
  const activityIds = [
    "med-activity-capitals",
    "med-activity-test_mar",
    "med-activity-map",
    "med-activity-biodiversitat"
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

/*
==========================================================
MÃ’DUL DEL PROJECTE MEDITERRANI
==========================================================

Aquest fitxer JavaScript s'encarrega de gestionar la navegaciÃ³
i la visualitzaciÃ³ del projecte Mediterrani.

QuÃ¨ fa aquest fitxer?
- Pinta dinÃ micament les targetes del menÃº d'activitats.
- Mostra el menÃº principal del projecte.
- Amaga totes les subactivitats quan cal.
- Obre la subactivitat que l'usuari selecciona.

QuÃ¨ NO fa aquest fitxer?
- No gestiona la lÃ²gica interna de cada joc o activitat.
- No comprova respostes.
- No calcula puntuacions.
- No controla temporitzadors.

Per tant, aquest fitxer actua com a "controlador del projecte":
organitza la navegaciÃ³ entre les diferents pantalles del
Mediterrani, perÃ² la lÃ²gica especÃ­fica de cada activitat
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

// Dibuixa les targetes del menÃº d'activitats del projecte Mediterrani
function renderMediterraniActivities() {
  // Contenidor on es pinten les targetes
  const container = document.getElementById("med-activities-menu");

  // Activitats configurades per al projecte Mediterrani.
  // Si no n'hi ha cap definida, fem servir un array buit.
  const activities = PROJECT_ACTIVITIES?.mediterrani || [];

  // Si no existeix el contenidor o no hi ha activitats definides, sortim
  if (!container || activities.length === 0) return;

  // Generem les targetes a partir de la configuraciÃ³
  container.innerHTML = activities.map(activity => `
    <div class="activity-card" onclick="openMediterraniActivity('${activity.action}')">
      <div class="activity-card__media">
        <img src="${activity.image}" alt="${activity.fallbackTitle}" class="activity-card__image">
      </div>
      <div class="activity-card__content">
        <div class="activity-card__title" data-i18n="${activity.titleKey}">
          ${activity.fallbackTitle}
        </div>
        <div class="activity-card__description" data-i18n="${activity.descKey}">
          ${activity.fallbackDesc}
        </div>
      </div>
    </div>
  `).join("");

  // Reapliquem les traduccions si la funciÃ³ existeix
  if (typeof applyTranslations === "function") {
    applyTranslations();
  }
}

// Amaga totes les subactivitats del projecte Mediterrani
function hideMediterraniActivities() {
  // Llista d'identificadors de les subactivitats del projecte.
  // Si en el futur s'afegeixen noves activitats, caldrÃ  afegir-les aquÃ­.
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

// Mostra el menÃº principal del projecte Mediterrani
function showMediterraniMenu() {
  // Recuperem el menÃº d'activitats
  const menu = document.getElementById("med-activities-menu");

  // Abans de mostrar el menÃº, amaguem totes les subactivitats
  hideMediterraniActivities();

  // Mostrem el menÃº si existeix
  if (menu) {
    menu.classList.remove("hidden");
  }
}

// Obre una activitat concreta del projecte Mediterrani
function openMediterraniActivity(activityName) {
  // Recuperem el menÃº principal del projecte
  const menu = document.getElementById("med-activities-menu");

  // Amaguem el menÃº si existeix
  if (menu) {
    menu.classList.add("hidden");
  }

  // Amaguem totes les subactivitats abans d'obrir-ne una
  hideMediterraniActivities();

  // ConstruÃ¯m l'id HTML de la subactivitat a partir del nom rebut
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


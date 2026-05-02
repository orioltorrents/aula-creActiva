/*
==========================================================
MÃ’DUL DEL PROJECTE ENTORNS DE NATURA
==========================================================

Aquest fitxer JavaScript s'encarrega de gestionar la navegaciÃ³
i la visualitzaciÃ³ del projecte Entorns de Natura.

QuÃ¨ fa aquest fitxer?
- Pinta dinÃ micament les targetes del menÃº d'activitats.
- Mostra el menÃº principal del projecte.
- Amaga totes les subactivitats quan cal.
- Obre la subactivitat que l'usuari selecciona.

QuÃ¨ NO fa aquest fitxer?
- No gestiona la lÃ²gica interna de cada activitat.
- No comprova respostes.
- No calcula puntuacions.
- No controla temporitzadors.

Per tant, aquest fitxer actua com a "controlador del projecte":
organitza la navegaciÃ³ entre les diferents pantalles d'Entorns
de Natura, perÃ² la lÃ²gica especÃ­fica de cada activitat
hauria d'estar dins de js/activities/entorns/.

Exemples de funcions que hi poden anar:
- renderEntornsActivities()
- showNaturaMenu()
- hideNaturaActivities()
- openNaturaActivity()

Exemples de funcions que NO hi haurien d'anar:
- verifyXarxesOrder()
- startRolsQuiz()
- checkNaturaPreguntaRespuesta()
- startGameWithFilter()

==========================================================
*/

// Dibuixa les targetes del menÃº d'activitats del projecte Entorns de Natura
function renderEntornsActivities() {
    // Contenidor on es pinten les targetes del menÃº
    const container = document.getElementById("natura-activities-menu");
  
    // Activitats configurades per al projecte Entorns de Natura.
    // Si no n'hi ha cap definida, fem servir un array buit.
    const activities = PROJECT_ACTIVITIES?.entorns || [];
  
    // Si no existeix el contenidor o no hi ha activitats definides, sortim
    if (!container || activities.length === 0) return;
  
    // Generem les targetes a partir de la configuraciÃ³
    container.innerHTML = activities.map(activity => `
      <div class="activity-card" onclick="openNaturaActivity('${activity.action}')">
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
  
  // Amaga totes les subactivitats del projecte Entorns de Natura
  function hideNaturaActivities() {
    // Llista d'identificadors de les subactivitats del projecte.
    // Si en el futur s'afegeixen noves activitats, caldrÃ  afegir-les aquÃ­.
    const activityIds = [
      "natura-activity-xarxes",
      "natura-activity-rols",
      "natura-activity-impacte",
      "natura-activity-biblio",
      "natura-activity-preguntes",
      "natura-activity-temes",
      "natura-activity-orenetes",
      "natura-activity-orenetes-preguntes",
      "natura-project-rius",
      "natura-project-impacte",
      "natura-project-orenetes",
      "natura-project-vespa",
      "natura-project-liquencity"
    ];
  
    // Recorrem cada id i amaguem el bloc si existeix
    activityIds.forEach(id => {
      const element = document.getElementById(id);
  
      if (element) {
        element.classList.add("hidden");
      }
    });
  }
  
  // Mostra el menÃº principal del projecte Entorns de Natura
  function showNaturaMenu() {
    // Recuperem el menÃº d'activitats
    const menu = document.getElementById("natura-activities-menu");
  
    // Abans de mostrar el menÃº, amaguem totes les subactivitats
    hideNaturaActivities();
  
    // Mostrem el menÃº si existeix
    if (menu) {
      menu.classList.remove("hidden");
    }
  }

  // Obre un submenÃƒÂº de projecte dins d'Entorns de Natura
  function openNaturaProject(projectName) {
    const menu = document.getElementById("natura-activities-menu");
    if (menu) {
      menu.classList.add("hidden");
    }

    hideNaturaActivities();

    const projectElement = document.getElementById(`natura-project-${projectName}`);
    if (projectElement) {
      projectElement.classList.remove("hidden");
    }
  }
  
  // Obre una activitat concreta del projecte Entorns de Natura
  function openNaturaActivity(activityName) {
    // Recuperem el menÃº principal del projecte
    const menu = document.getElementById("natura-activities-menu");
  
    // Amaguem el menÃº si existeix
    if (menu) {
      menu.classList.add("hidden");
    }
  
    // Amaguem totes les subactivitats abans d'obrir-ne una
    hideNaturaActivities();
  
    // ConstruÃ¯m l'id HTML de la subactivitat a partir del nom rebut
    const activityId = `natura-activity-${activityName}`;
  
    // Recuperem el bloc de la subactivitat corresponent
    const activityElement = document.getElementById(activityId);
  
    // Mostrem la subactivitat si existeix
    if (activityElement) {
      activityElement.classList.remove("hidden");
      if (activityName === "orenetes" && typeof initOrenetesGame === "function") {
        initOrenetesGame();
      } else if (activityName === "orenetes-preguntes" && typeof initOrenetesPreguntesQuiz === "function") {
        initOrenetesPreguntesQuiz();
      }
    }
  }


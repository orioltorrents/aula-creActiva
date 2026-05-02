/*
==========================================================
MÃ’DUL DEL PROJECTE TREBALL DE RECERCA
==========================================================

Aquest fitxer JavaScript s'encarrega de gestionar la navegaciÃ³
i la visualitzaciÃ³ del projecte Treball de Recerca.

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
organitza la navegaciÃ³ entre les diferents pantalles del
Treball de Recerca, perÃ² la lÃ²gica especÃ­fica de cada activitat
hauria d'estar dins de js/activities/treball-recerca/.

Exemples de funcions que hi poden anar:
- renderTrActivities()
- showTrMenu()
- hideTrActivities()
- openTrActivity()

Exemples de funcions que NO hi haurien d'anar:
- startTrDiagnostic()
- checkTrPreguntaRespuesta()
- checkTrTemesRespostes()
- startTrBiblioWithFilter()

==========================================================
*/

// Dibuixa les targetes del menÃº d'activitats del projecte Treball de Recerca
function renderTrActivities() {
    // Contenidor on es pinten les targetes del menÃº
    const container = document.getElementById("tr-activities-menu");
  
    // Activitats configurades per al projecte Treball de Recerca.
    // Si no n'hi ha cap definida, fem servir un array buit.
    const activities = PROJECT_ACTIVITIES?.treballRecerca || [];
  
    // Si no existeix el contenidor o no hi ha activitats definides, sortim
    if (!container || activities.length === 0) return;
  
    // Generem les targetes a partir de la configuraciÃ³
    container.innerHTML = activities.map(activity => `
      <div class="activity-card" onclick="openTrActivity('${activity.action}')">
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
  
  // Amaga totes les subactivitats del projecte Treball de Recerca
  function hideTrActivities() {
    // Llista d'identificadors de les subactivitats del projecte.
    // Si en el futur s'afegeixen noves activitats, caldrÃ  afegir-les aquÃ­.
    const activityIds = [
      "tr-activity-preguntes",
      "tr-activity-temes",
      "tr-activity-diagnostic",
      "tr-activity-biblio"
    ];
  
    // Recorrem cada id i amaguem el bloc si existeix
    activityIds.forEach(id => {
      const element = document.getElementById(id);
  
      if (element) {
        element.classList.add("hidden");
      }
    });
  }
  
  // Mostra el menÃº principal del projecte Treball de Recerca
  function showTrMenu() {
    // Recuperem el menÃº d'activitats
    const menu = document.getElementById("tr-activities-menu");
  
    // Abans de mostrar el menÃº, amaguem totes les subactivitats
    hideTrActivities();
  
    // Mostrem el menÃº si existeix
    if (menu) {
      menu.classList.remove("hidden");
    }
  }
  
  // Obre una activitat concreta del projecte Treball de Recerca
  function openTrActivity(activityName) {
    // Recuperem el menÃº principal del projecte
    const menu = document.getElementById("tr-activities-menu");
  
    // Amaguem el menÃº si existeix
    if (menu) {
      menu.classList.add("hidden");
    }
  
    // Amaguem totes les subactivitats abans d'obrir-ne una
    hideTrActivities();
  
    // ConstruÃ¯m l'id HTML de la subactivitat a partir del nom rebut
    const activityId = `tr-activity-${activityName}`;
  
    // Recuperem el bloc de la subactivitat corresponent
    const activityElement = document.getElementById(activityId);
  
    // Mostrem la subactivitat si existeix
    if (activityElement) {
      activityElement.classList.remove("hidden");
    }
  }

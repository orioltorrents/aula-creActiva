/*
==========================================================
MÒDUL DEL PROJECTE TREBALL DE RECERCA
==========================================================

Aquest fitxer JavaScript s'encarrega de gestionar la navegació
i la visualització del projecte Treball de Recerca.

Què fa aquest fitxer?
- Pinta dinàmicament les targetes del menú d'activitats.
- Mostra el menú principal del projecte.
- Amaga totes les subactivitats quan cal.
- Obre la subactivitat que l'usuari selecciona.

Què NO fa aquest fitxer?
- No gestiona la lògica interna de cada activitat.
- No comprova respostes.
- No calcula puntuacions.
- No controla temporitzadors.

Per tant, aquest fitxer actua com a "controlador del projecte":
organitza la navegació entre les diferents pantalles del
Treball de Recerca, però la lògica específica de cada activitat
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

// Dibuixa les targetes del menú d'activitats del projecte Treball de Recerca
function renderTrActivities() {
    // Contenidor on es pinten les targetes del menú
    const container = document.getElementById("tr-activities-menu");
  
    // Activitats configurades per al projecte Treball de Recerca.
    // Si no n'hi ha cap definida, fem servir un array buit.
    const activities = PROJECT_ACTIVITIES?.treballRecerca || [];
  
    // Si no existeix el contenidor o no hi ha activitats definides, sortim
    if (!container || activities.length === 0) return;
  
    // Generem les targetes a partir de la configuració
    container.innerHTML = activities.map(activity => `
      <div class="activity-card" onclick="openTrActivity('${activity.action}')">
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
  
  // Amaga totes les subactivitats del projecte Treball de Recerca
  function hideTrActivities() {
    // Llista d'identificadors de les subactivitats del projecte.
    // Si en el futur s'afegeixen noves activitats, caldrà afegir-les aquí.
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
  
  // Mostra el menú principal del projecte Treball de Recerca
  function showTrMenu() {
    // Recuperem el menú d'activitats
    const menu = document.getElementById("tr-activities-menu");
  
    // Abans de mostrar el menú, amaguem totes les subactivitats
    hideTrActivities();
  
    // Mostrem el menú si existeix
    if (menu) {
      menu.classList.remove("hidden");
    }
  }
  
  // Obre una activitat concreta del projecte Treball de Recerca
  function openTrActivity(activityName) {
    // Recuperem el menú principal del projecte
    const menu = document.getElementById("tr-activities-menu");
  
    // Amaguem el menú si existeix
    if (menu) {
      menu.classList.add("hidden");
    }
  
    // Amaguem totes les subactivitats abans d'obrir-ne una
    hideTrActivities();
  
    // Construïm l'id HTML de la subactivitat a partir del nom rebut
    const activityId = `tr-activity-${activityName}`;
  
    // Recuperem el bloc de la subactivitat corresponent
    const activityElement = document.getElementById(activityId);
  
    // Mostrem la subactivitat si existeix
    if (activityElement) {
      activityElement.classList.remove("hidden");
    }
  }
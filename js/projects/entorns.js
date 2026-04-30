/*
==========================================================
MÒDUL DEL PROJECTE ENTORNS DE NATURA
==========================================================

Aquest fitxer JavaScript s'encarrega de gestionar la navegació
i la visualització del projecte Entorns de Natura.

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
organitza la navegació entre les diferents pantalles d'Entorns
de Natura, però la lògica específica de cada activitat
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

// Dibuixa les targetes del menú d'activitats del projecte Entorns de Natura
function renderEntornsActivities() {
    // Contenidor on es pinten les targetes del menú
    const container = document.getElementById("natura-activities-menu");
  
    // Activitats configurades per al projecte Entorns de Natura.
    // Si no n'hi ha cap definida, fem servir un array buit.
    const activities = PROJECT_ACTIVITIES?.entorns || [];
  
    // Si no existeix el contenidor o no hi ha activitats definides, sortim
    if (!container || activities.length === 0) return;
  
    // Generem les targetes a partir de la configuració
    container.innerHTML = activities.map(activity => `
      <div class="activity-card" onclick="openNaturaActivity('${activity.action}')">
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
  
  // Amaga totes les subactivitats del projecte Entorns de Natura
  function hideNaturaActivities() {
    // Llista d'identificadors de les subactivitats del projecte.
    // Si en el futur s'afegeixen noves activitats, caldrà afegir-les aquí.
    const activityIds = [
      "natura-activity-xarxes",
      "natura-activity-rols",
      "natura-activity-impacte",
      "natura-activity-biblio",
      "natura-activity-preguntes",
      "natura-activity-temes",
      "natura-activity-orenetes"
    ];
  
    // Recorrem cada id i amaguem el bloc si existeix
    activityIds.forEach(id => {
      const element = document.getElementById(id);
  
      if (element) {
        element.classList.add("hidden");
      }
    });
  }
  
  // Mostra el menú principal del projecte Entorns de Natura
  function showNaturaMenu() {
    // Recuperem el menú d'activitats
    const menu = document.getElementById("natura-activities-menu");
  
    // Abans de mostrar el menú, amaguem totes les subactivitats
    hideNaturaActivities();
  
    // Mostrem el menú si existeix
    if (menu) {
      menu.classList.remove("hidden");
    }
  }
  
  // Obre una activitat concreta del projecte Entorns de Natura
  function openNaturaActivity(activityName) {
    // Recuperem el menú principal del projecte
    const menu = document.getElementById("natura-activities-menu");
  
    // Amaguem el menú si existeix
    if (menu) {
      menu.classList.add("hidden");
    }
  
    // Amaguem totes les subactivitats abans d'obrir-ne una
    hideNaturaActivities();
  
    // Construïm l'id HTML de la subactivitat a partir del nom rebut
    const activityId = `natura-activity-${activityName}`;
  
    // Recuperem el bloc de la subactivitat corresponent
    const activityElement = document.getElementById(activityId);
  
    // Mostrem la subactivitat si existeix
    if (activityElement) {
      activityElement.classList.remove("hidden");
      if (activityName === "orenetes" && typeof initOrenetesGame === "function") {
        initOrenetesGame();
      }
    }
  }

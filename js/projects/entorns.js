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
- La navegació del menú i de les activitats es gestiona a js/app.js.

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

    // El fragment d'Entorns ja defineix el menú de projectes i subprojectes.
    // Si té contingut, el respectem per no substituir-lo per targetes d'activitat.
    if (container && container.children.length > 0) {
      if (typeof translateUI === "function") {
        translateUI();
      }
      return;
    }

    // Si no existeix el contenidor o no hi ha activitats definides, sortim
    if (!container || activities.length === 0) return;

    // Generem les targetes a partir de la configuració
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

    // Reapliquem les traduccions si la funció existeix
    if (typeof applyTranslations === "function") {
      applyTranslations();
    }
  }

function renderMediterraniActivities() {
    const container = document.getElementById("med-activities-menu");
    const activities = projectActivities.mediterrani;
  
    if (!container || !activities) return;
  
    container.innerHTML = activities.map(activity => `
      <div class="activity-card" onclick="openMediterraniActivity('${activity.action}')">
        <div class="act-icon">
          <img src="${activity.image}" alt="${activity.fallbackTitle}" class="act-img">
        </div>
        <div class="card-content">
          <div class="card-title" data-i18n="${activity.titleKey}">${activity.fallbackTitle}</div>
          <div class="card-desc" data-i18n="${activity.descKey}">${activity.fallbackDesc}</div>
        </div>
      </div>
    `).join("");
}
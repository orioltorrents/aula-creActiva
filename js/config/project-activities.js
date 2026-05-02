// js/config/project-activities.js
/*
==========================================================
CONFIGURACIÓ DE LES ACTIVITATS DELS PROJECTES
==========================================================

Aquest fitxer defineix quines activitats té cada projecte
i quina informació s'ha de mostrar al menú de targetes.

Per a cada activitat es defineix:
- id intern
- clau de traducció del títol
- clau de traducció de la descripció
- títol de reserva
- descripció de reserva
- imatge de la targeta
- acció que s'ha d'obrir en clicar

Aquest fitxer no conté lògica de navegació ni de joc.
Només conté dades de configuració.

==========================================================


==========================================================
RESUM
==========================================================

Si fem servir PROJECT_ACTIVITIES per generar el menú:

- Sí que podem eliminar les targetes HTML escrites a mà
- No hem d'eliminar el contenidor del menú
- No hem d'eliminar el hub del projecte

Es manté:
- project-hub-mediterrani
- med-activities-menu

S'elimina més endavant:
- cada activity-card escrita manualment

<!-- =========================================================
     PROJECTE: MEDITERRANI
     Aquest bloc només conté el títol i el contenidor del menú.
     Les targetes es generen dinàmicament des del JS.
========================================================== -->
<div id="project-hub-mediterrani" class="game-module hidden">
    <!-- Títol del projecte -->
    <h3 data-i18n="med_project_title">Projecte Mediterrani</h3>

    <!-- Contenidor on el JS dibuixarà les targetes -->
    <div id="med-activities-menu" class="activities-grid"></div>
</div>

==========================================================
*/

// js/config/project-activities.js
const PROJECT_ACTIVITIES = {
  mediterrani: [
    {
      id: "capitals",
      titleKey: "act_capitals_title",
      descKey: "act_capitals_desc",
      fallbackTitle: "Capitals",
      fallbackDesc: "Aprèn les capitals del Mediterrani",
      image: "assets/images/activities/mediterrani/cards/targeta_mediterrani_capitals.png",
      action: "capitals"
    },
    {
      id: "mar-del-mig",
      titleKey: "act_sea_title",
      descKey: "act_sea_desc",
      fallbackTitle: "El Mar del Mig",
      fallbackDesc: "Vídeo i Test de coneixements",
      image: "assets/images/activities/mediterrani/cards/targeta_mediterrani_elmardelmig.png",
      action: "test_mar"
    },
    {
      id: "paisos",
      titleKey: "act_map_title",
      descKey: "act_map_desc",
      fallbackTitle: "Mapa del Mediterrani",
      fallbackDesc: "Identifica els països al mapa",
      image: "assets/images/activities/mediterrani/cards/targeta_mediterrani_paisos.png",
      action: "map"
    },
    {
      id: "biodiversitat",
      titleKey: "",
      descKey: "",
      fallbackTitle: "Biodiversitat del Mediterrani",
      fallbackDesc: "Descobreix espècies i ecosistemes mediterranis",
      image: "assets/images/activities/mediterrani/biodiversitat/targeta_mediterrani_biodiversitat.png",
      action: "biodiversitat"
    }
  ],

  treballRecerca: [
    {
      id: "preguntes",
      titleKey: "act_tr_preguntes_title",
      descKey: "act_tr_preguntes_desc",
      fallbackTitle: "Preguntes Investigables",
      fallbackDesc: "Aprèn a diferenciar preguntes investigables de les que no ho són.",
      image: "assets/images/activities/treball-recerca/cards/targeta-preguntes-investigables.png",
      action: "preguntes"
    },
    {
      id: "temes",
      titleKey: "act_tr_temes_title",
      descKey: "act_tr_temes_desc",
      fallbackTitle: "Temes i preguntes",
      fallbackDesc: "Tria bones preguntes d'un tema de recerca.",
      image: "assets/images/activities/treball-recerca/cards/targeta-temes-preguntes.png",
      action: "temes"
    },
    {
      id: "diagnostic",
      titleKey: "",
      descKey: "",
      fallbackTitle: "Diagnòstic de preguntes",
      fallbackDesc: "Aprèn a identificar què li falta a una pregunta per ser investigable.",
      image: "assets/images/activities/treball-recerca/cards/targeta_diagnostic-preguntes.png",
      action: "diagnostic"
    },
    {
      id: "biblio",
      titleKey: "act_biblio_title",
      descKey: "act_biblio_desc",
      fallbackTitle: "Bibliografia i Cites",
      fallbackDesc: "Aprèn a citar correctament les teves fonts",
      image: "assets/images/activities/treball-recerca/cards/targeta_biblio-APA.png",
      action: "biblio"
    }
  ],

  entorns: [
    {
      id: "xarxes",
      titleKey: "act_xarxes_title",
      descKey: "act_xarxes_desc",
      fallbackTitle: "Xarxes Tròfiques",
      fallbackDesc: "Ordena els passos per crear una xarxa tròfica",
      image: "assets/images/activities/entorns/cards/targeta_xarxes-trofiques.png",
      action: "xarxes"
    },
    {
      id: "rols",
      titleKey: "act_rols_title",
      descKey: "act_rols_desc",
      fallbackTitle: "Rols Tròfics",
      fallbackDesc: "Classifica espècies segons la seva dieta",
      image: "assets/images/activities/entorns/cards/targeta_rols-trofics.png",
      action: "rols"
    },
    {
      id: "impacte",
      titleKey: "act_impacte_title",
      descKey: "act_impacte_desc",
      fallbackTitle: "Estudi d'impacte ambiental",
      fallbackDesc: "Ordena les fases de creació de l'estudi",
      image: "assets/images/activities/entorns/cards/targeta_fases-eia.png",
      action: "impacte"
    },
    {
      id: "biblio",
      titleKey: "act_biblio_title",
      descKey: "act_biblio_desc",
      fallbackTitle: "Bibliografia i Cites",
      fallbackDesc: "Aprèn a citar correctament les teves fonts",
      image: "assets/images/activities/treball-recerca/cards/targeta_biblio-APA.png",
      action: "biblio"
    },
    {
      id: "preguntes",
      titleKey: "act_tr_preguntes_title",
      descKey: "act_tr_preguntes_desc",
      fallbackTitle: "Preguntes Investigables",
      fallbackDesc: "Aprèn a diferenciar preguntes investigables de les que no ho són.",
      image: "assets/images/activities/treball-recerca/cards/targeta-preguntes-investigables.png",
      action: "preguntes"
    },
    {
      id: "temes",
      titleKey: "act_tr_temes_title",
      descKey: "act_tr_temes_desc",
      fallbackTitle: "Temes i preguntes",
      fallbackDesc: "Tria bones preguntes d'un tema de recerca.",
      image: "assets/images/activities/treball-recerca/cards/targeta-temes-preguntes.png",
      action: "temes"
    },
    {
      id: "orenetes",
      titleKey: "act_orenetes_title",
      descKey: "act_orenetes_desc",
      fallbackTitle: "Projecte Orenetes",
      fallbackDesc: "Estudi i seguiment de les orenetes",
      image: "assets/images/activities/entorns/cards/targeta-projecte-orentes.png",
      action: "orenetes"
    },
    {
      id: "orenetes-preguntes",
      titleKey: "",
      descKey: "",
      fallbackTitle: "Preguntes del Projecte Orenetes",
      fallbackDesc: "Tria la foto correcta entre quatre opcions",
      image: "assets/images/activities/entorns/cards/targeta-projecte-orentes.png",
      action: "orenetes-preguntes"
    }
  ]
};

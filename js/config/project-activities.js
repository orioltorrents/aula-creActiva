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
    <h3 data-i18n="med_project_title">Projecte Mediterràniament</h3>

    <!-- Contenidor on el JS dibuixarà les targetes -->
    <div id="med-activities-menu" class="activities-grid"></div>
</div>

==========================================================
*/

// js/config/project-activities.js
const PROJECT_PHASES = {
  mediterrani: [
    { id: "fase-01", title: "Mediterràniament - Presentació", cardTitle: "Presentació", description: "Coneix el projecte i prepara el quadern de bitàcola.", image: "assets/images/activities/mediterrani/cards/targeta-presentacio.jpeg", showHeader: false },
    { id: "fase-02", title: "Mediterràniament - Activitats inicials", cardTitle: "Activitats inicials", description: "Descobreix el Mediterrani i activa les idees inicials.", image: "assets/images/activities/mediterrani/cards/targeta-activitats-inicials.jpeg", showHeader: false },
    { id: "fase-03", title: "Mediterràniament - Vora mar", cardTitle: "Vora mar", description: "Situa el Mediterrani entre mars, oceans i països.", image: "assets/images/activities/mediterrani/cards/targeta_mediterrani_paisos.png", showHeader: false },
    { id: "fase-04", title: "Mediterràniament - Mar entre terres", cardTitle: "Mar entre terres", description: "Investiga la història, les característiques i la biodiversitat del Mediterrani.", image: "assets/images/activities/mediterrani/cards/targeta-mar-entre-terres.jpeg", showHeader: false },
    { id: "fase-05", title: "Mediterràniament - Mar crítica", cardTitle: "Mar crítica", description: "Analitza els reptes que afecten el Mediterrani i pensa com podem protegir-lo.", image: "assets/images/activities/mediterrani/cards/targeta-mar-critica.jpeg", showHeader: false },
    { id: "fase-06", title: "Mediterràniament - ADN Mediterrani", cardTitle: "ADN Mediterrani", description: "Descobreix els trets naturals i culturals que defineixen el Mediterrani.", image: "assets/images/activities/mediterrani/cards/targeta-adn-mediterrani.jpeg", showHeader: false },
    { id: "fase-07", title: "Mediterràniament - Maqueta", cardTitle: "Maqueta", description: "Representa el Mediterrani amb una maqueta i comparteix allò que has après.", image: "assets/images/activities/mediterrani/cards/targeta-maqueta.jpeg", showHeader: false }
  ]
};

const PROJECT_ACTIVITIES = {
  mediterrani: [
    {
      id: "presentacio-projecte",
      titleKey: "act_med_presentation_title",
      descKey: "act_med_presentation_desc",
      fallbackTitle: "Presentació del projecte",
      fallbackDesc: "Descobreix el projecte Mediterraniament",
      image: "assets/images/activities/mediterrani/cards/targeta-mediterraniament-presentacio.jpeg",
      action: "presentacio-projecte",
      phase: "fase-01",
      pending: true
    },
    {
      id: "quadern-bitacola",
      titleKey: "act_med_logbook_title",
      descKey: "act_med_logbook_desc",
      fallbackTitle: "Quadern de bitàcola",
      fallbackDesc: "Recull el teu viatge pel Mediterrani",
      image: "assets/images/activities/mediterrani/cards/targeta-quadern-bitacola.jpeg",
      mediaClass: "med-logbook__media",
      mediaHtml: "<span aria-hidden=\"true\">📖</span>",
      action: "quadern-bitacola",
      phase: "fase-01"
    },
    {
      id: "xarxa-pescador",
      titleKey: "act_med_fisher_net_title",
      descKey: "act_med_pending_desc",
      fallbackTitle: "Xarxa de pescador",
      fallbackDesc: "Activitat en preparació",
      image: "assets/images/activities/mediterrani/cards/targeta-xarxa-pescador.jpeg",
      mediaClass: "med-pending-activity__media",
      mediaHtml: "<span aria-hidden=\"true\">🕸</span>",
      action: "xarxa-pescador",
      phase: "fase-02",
      pending: true
    },
    {
      id: "postal-estiu",
      titleKey: "act_med_summer_postcard_title",
      descKey: "act_med_pending_desc",
      fallbackTitle: "Postal d'estiu",
      fallbackDesc: "Activitat en preparació",
      image: "assets/images/activities/mediterrani/cards/targeta-postal-estiu.jpeg",
      mediaClass: "med-pending-activity__media",
      mediaHtml: "<span aria-hidden=\"true\">🌅</span>",
      action: "postal-estiu",
      phase: "fase-02",
      pending: true
    },
    {
      id: "el-meu-mar",
      titleKey: "act_med_my_sea_title",
      descKey: "act_med_pending_desc",
      fallbackTitle: "El teu mar",
      fallbackDesc: "Activitat en preparació",
      image: "assets/images/activities/mediterrani/cards/targeta-el-teu-mar.jpeg",
      mediaClass: "med-pending-activity__media",
      mediaHtml: "<span aria-hidden=\"true\">🌊</span>",
      action: "el-meu-mar",
      phase: "fase-02",
      pending: true
    },
    {
      id: "mar-del-mig",
      titleKey: "act_sea_title",
      descKey: "act_sea_desc",
      fallbackTitle: "El Mar del Mig",
      fallbackDesc: "Vídeo i Test de coneixements",
      image: "assets/images/activities/mediterrani/cards/targeta_mediterrani_elmardelmig.png",
      action: "test_mar",
      phase: "fase-02"
    },
    {
      id: "paisos",
      image: "assets/images/activities/mediterrani/cards/targeta-paisos-banyats-pel-mediterrani.jpeg",
      titleKey: "act_med_countries_title",
      descKey: "act_med_countries_desc",
      fallbackTitle: "Països banyats pel Mediterrani",
      fallbackDesc: "Identifica els països banyats pel mar Mediterrani",
      action: "map",
      phase: "fase-03",
      order: 2,
      submenu: "paisos",
      children: [
        {
          titleKey: "act_map_title",
          descKey: "act_map_desc",
          fallbackTitle: "Països del Mediterrani",
          fallbackDesc: "Identifica els països al mapa",
          image: "assets/images/activities/mediterrani/cards/targeta_mediterrani_paisos.png",
          action: "map"
        },
        {
          titleKey: "act_capitals_title",
          descKey: "act_capitals_desc",
          fallbackTitle: "Capitals del Mediterrani",
          fallbackDesc: "Aprèn les capitals del Mediterrani",
          image: "assets/images/activities/mediterrani/cards/targeta_mediterrani_capitals.png",
          action: "capitals"
        }
      ]
    },
    {
      id: "mars-oceans",
      titleKey: "act_seas_oceans_title",
      descKey: "act_seas_oceans_desc",
      fallbackTitle: "Mars i oceans",
      fallbackDesc: "Vídeo i preguntes sobre els mars i els oceans",
      image: "assets/images/activities/mediterrani/cards/targeta-mars-i-oceans.jpeg",
      mediaClass: "med-mars-oceans__media",
      mediaHtml: "<span aria-hidden=\"true\">🌊</span>",
      action: "mars-oceans",
      phase: "fase-03",
      order: 1
    },
    {
      id: "biodiversitat",
      titleKey: "",
      descKey: "",
      fallbackTitle: "Biodiversitat del Mediterrani",
      fallbackDesc: "Descobreix espècies i ecosistemes mediterranis",
      image: "assets/images/activities/mediterrani/biodiversitat/targeta_mediterrani_biodiversitat.png",
      action: "biodiversitat",
      phase: "fase-04",
      order: 3
    },
    {
      id: "com-es-mediterrani",
      titleKey: "act_med_characteristics_title",
      descKey: "act_med_pending_desc",
      fallbackTitle: "Com és el Mediterrani",
      fallbackDesc: "Activitat en preparació",
      image: "assets/images/activities/mediterrani/cards/targeta-com-es-el-mediterrani.jpeg",
      mediaClass: "med-pending-activity__media",
      mediaHtml: "<span aria-hidden=\"true\">🧭</span>",
      action: "com-es-mediterrani",
      phase: "fase-04",
      order: 2,
      pending: true
    },
    {
      id: "creacio-mar",
      titleKey: "",
      descKey: "",
      fallbackTitle: "Creació del Mediterrani",
      fallbackDesc: "Descobreix com es va formar a través del moviment de les plaques tectòniques.",
      image: "assets/images/activities/mediterrani/cards/targeta-creacio-del-mediterrani.jpeg",
      mediaClass: "med-creacio-mar__media",
      mediaHtml: "<span>540 Ma</span><strong>→</strong><span>avui</span>",
      action: "creacio-mar",
      phase: "fase-04",
      order: 1
    }
  ],

  treballRecerca: [
    {
      id: "preguntes",
      titleKey: "act_tr_preguntes_title",
      descKey: "act_tr_preguntes_desc",
      fallbackTitle: "Preguntes Investigables",
      fallbackDesc: "Aprèn a diferenciar preguntes investigables de les que no ho són.",
      image: "assets/images/activities/treball-recerca/cards/targeta_diagnostic-preguntes.png",
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
      image: "assets/images/activities/entorns/cards/targeta_xarxes-trofiques-card.jpg",
      action: "xarxes"
    },
    {
      id: "rols",
      titleKey: "act_rols_title",
      descKey: "act_rols_desc",
      fallbackTitle: "Rols Tròfics",
      fallbackDesc: "Classifica espècies segons la seva dieta",
      image: "assets/images/activities/entorns/cards/targeta_rols-trofics-card.jpg",
      action: "rols"
    },
    {
      id: "impacte",
      titleKey: "act_impacte_title",
      descKey: "act_impacte_desc",
      fallbackTitle: "Estudi d'impacte ambiental",
      fallbackDesc: "Ordena les fases de creació de l'estudi",
      image: "assets/images/activities/entorns/cards/targeta_fases-eia-card.jpg",
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
      image: "assets/images/activities/entorns/cards/targeta-projecte-orenetes.jpg",
      action: "orenetes"
    },
    {
      id: "orenetes-preguntes",
      titleKey: "",
      descKey: "",
      fallbackTitle: "Preguntes del Projecte Orenetes",
      fallbackDesc: "Tria la foto correcta entre quatre opcions",
      image: "assets/images/activities/entorns/cards/targeta-projecte-orenetes.jpg",
      action: "orenetes-preguntes"
    },
    {
      id: "betid-3d",
      titleKey: "",
      descKey: "",
      fallbackTitle: "Anatomia de les larves de macroinvertebrats",
      fallbackDesc: "Escull una larva i identifica les seves parts anatòmiques en 3D.",
      image: "assets/models/macroinvertebrats/Baetis_animat/Baetis_animat.png",
      action: "betid-3d"
    },
    {
      id: "clau-macroinvertebrats",
      titleKey: "",
      descKey: "",
      fallbackTitle: "Clau dicotòmica",
      fallbackDesc: "Determina el grup dels principals macroinvertebrats aquàtics.",
      image: "assets/images/natura/clau-macroinvertebrats/Simulium.PNG",
      action: "clau-macroinvertebrats"
    },
    {
      id: "hipotesis",
      titleKey: "",
      descKey: "",
      fallbackTitle: "Avaluador d'hipòtesis",
      fallbackDesc: "Comprova si una hipòtesi conté tot el necessari per investigar-la.",
      image: "assets/images/activities/treball-recerca/cards/targeta-preguntes-investigables.png",
      action: "hipotesis"
    },
    {
      id: "familia-color",
      titleKey: "",
      descKey: "",
      fallbackTitle: "Família i color dels bioindicadors",
      fallbackDesc: "Practica la família i el color de cada macroinvertebrat.",
      image: "assets/images/natura/targeta-familia-color.svg",
      action: "familia-color"
    }
  ]
};

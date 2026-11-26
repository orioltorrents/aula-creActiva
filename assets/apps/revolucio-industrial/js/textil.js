// SPDX-License-Identifier: AGPL-3.0-or-later
/* Capítol 3 · El cotó: de la roda tradicional a la mecanització del fil i del teler. */
(function () {
  const cap = {
    id: "textil", titol: "El cot\u00f3", llegenda: false,
    escenes: [RI.RODA_ESCENA,
      {
        "id": "llancadora",
        "nom": "Llançadora volant",
        "any": "1733",
        "qui": "John Kay",
        "durada": 18,
        "model": "Teler manual amb llançadora volant · dues passades alentides",
        "pregunta": "Com passes un fil entre centenars de fils sense tocar-lo?",
        "intro": "Teixir és passar un fil (la <b>trama</b>) per entre els fils llargs (l’<b>ordit</b>). Abans la llançadora es passava de mà en mà; Kay la fa volar amb una estirada de cordill.",
        "fases": [
          {
            "fins": 0.18,
            "nom": "Obrir un pas",
            "text": "Els lliços separen els fils de l’ordit. La llançadora ha de passar per aquest espai: la calada.",
            "focus": [
              "ordit",
              "llicos"
            ]
          },
          {
            "fins": 0.4,
            "nom": "Impulsar la llançadora",
            "text": "La mà estira el mànec. El cordill mou un taco lateral, que colpeja la llançadora. La barqueta travessa la calada deixant una trama nova.",
            "focus": [
              "cordill",
              "caixes",
              "llancadora"
            ]
          },
          {
            "fins": 0.57,
            "nom": "Incorporar la trama",
            "text": "Quan la llançadora ja és a la caixa, el batà acosta la pinta a la tela. La passada vermella queda incorporada al teixit.",
            "focus": [
              "pinta",
              "tela"
            ]
          },
          {
            "fins": 0.86,
            "nom": "Canviar els fils i tornar",
            "text": "Els grups de l’ordit intercanvien la posició. L’altre taco impulsa la llançadora de tornada: la trama queda entrecreuada.",
            "focus": [
              "llicos",
              "llancadora"
            ]
          },
          {
            "fins": 1,
            "nom": "Una altra passada de tela",
            "text": "La pinta atapeeix la segona passada. El cordill evita haver de portar la llançadora amb la mà d’un costat a l’altre.",
            "focus": [
              "pinta",
              "tela"
            ]
          }
        ],
        "parts": {
          "ordit": {
            "nom": "Ordit",
            "text": "Els fils llargs, tibants, que van d’un corró a l’altre del teler."
          },
          "llancadora": {
            "nom": "Llançadora",
            "text": "Peça de fusta en forma de barqueta que porta a dins una bobina de fil de trama."
          },
          "caixes": {
            "nom": "Caixes i tacos",
            "text": "Les caixes reben la llançadora. A dins, un taco l’impulsa quan el teixidor estira el cordill."
          },
          "cordill": {
            "nom": "Cordill i mànec",
            "text": "El teixidor estira el mànec amb una sola mà. L’altra mà queda lliure per moure la pinta."
          },
          "pinta": {
            "nom": "Pinta",
            "text": "Barra amb pues per on passen els fils de l’ordit. Atapeeix cada passada de trama."
          },
          "tela": {
            "nom": "Tela",
            "text": "Ordit i trama ja entrecreuats. S’enrotlla al corró de baix."
          },
          "bastidor": {
            "nom": "Bastidor",
            "text": "L’estructura de fusta manté els plegadors, els lliços i el batà en la posició de treball."
          },
          "llicos": {
            "nom": "Lliços",
            "text": "Els fils passen pels ullets dels lliços. En aixecar un grup i abaixar l’altre s’obre la calada per on passa la llançadora."
          }
        },
        "real": {
          "img": "img/real-teler.webp",
          "titol": "Teler manual de teixidor, encara en funcionament",
          "museu": "Weaver’s Cottage · Kilbarchan (Escòcia)",
          "lic": "Foto: Richard Sutcliffe · Wikimedia Commons · CC BY-SA 2.0",
          "etiquetes": [
            [
              "tela",
              70,
              62,
              "Tela"
            ],
            [
              "ordit",
              52,
              48,
              "Ordit"
            ]
          ]
        },
        "clau": "Una persona pot passar la trama en teles més amples i teixir més de pressa: augmenta la necessitat de fil.",
        "batx": {
          "titol": "La innovació és el sistema d’impuls",
          "text": "Kay no va inventar la barqueta: va afegir la pista de lliscament, les caixes laterals i els tacos accionats per cordill. Un sol teixidor podia treballar peces més amples. El guany variava segons la tela i el teler; no equival a una multiplicació universal per dos.",
          "font": "https://lancashiremuseumsstories.wordpress.com/2020/05/22/john-kay-and-the-flying-shuttle/",
          "fontNom": "Lancashire Museums · John Kay"
        },
        "innovacio": {
          "abans": "Cal passar la llançadora amb la mà",
          "ara": "Un cordill i dos tacos la impulsen"
        }
      },
      {
        "id": "jenny",
        "nom": "Spinning Jenny",
        "any": "1764",
        "qui": "James Hargreaves",
        "durada": 18,
        "model": "Jenny manual de vuit fusos · cicle esquemàtic alentit",
        "pregunta": "Com fila una sola persona vuit fils alhora?",
        "intro": "La Jenny fa treballar <b>diversos fusos amb una mateixa roda</b>. La persona controla l’estiratge amb una pinça comuna. Mira com creixen els vuit cons de fil durant la recollida.",
        "fases": [
          {
            "fins": 0.16,
            "nom": "Alimentar les metxes",
            "text": "La pinça oberta deixa passar cotó cardat. Els fusos encara no recullen fil.",
            "focus": [
              "metxes",
              "pinca"
            ]
          },
          {
            "fins": 0.52,
            "nom": "Estirar vuit metxes",
            "text": "La pinça es tanca i s’allunya dels fusos. Els dits ja no regulen cada fil per separat: un mateix moviment estira les vuit metxes.",
            "focus": [
              "pinca",
              "fusos"
            ]
          },
          {
            "fins": 0.7,
            "nom": "Acabar de donar torsió",
            "text": "La pinça manté la posició mentre els fusos acaben de tòrcer el fil. Una breu inversió prepara l’enrotllament.",
            "focus": [
              "roda",
              "fusos"
            ]
          },
          {
            "fins": 1,
            "nom": "Recollir vuit fils",
            "text": "La pinça torna i els fusos enrotllen els fils acabats. Creixen vuit cons alhora: aquest és el guany visible respecte de la roda tradicional.",
            "focus": [
              "fusos"
            ]
          }
        ],
        "parts": {
          "metxes": {
            "nom": "Alimentació de metxa",
            "text": "La metxa és cotó cardat encara tou i gruixut. Les guies la presenten a la pinça que en controla l’estiratge."
          },
          "pinca": {
            "nom": "Pinça mòbil",
            "text": "Dos llistons que agafen totes les metxes alhora i es mouen endavant i endarrere sobre el bastidor."
          },
          "fusos": {
            "nom": "Fusos",
            "text": "Tots reben el gir de la mateixa transmissió. Torcen el fil i, en una altra fase, l’enrotllen. Aquí se’n representen vuit; els models posteriors en tenien més."
          },
          "roda": {
            "nom": "Roda",
            "text": "Es mou a mà. Un sol gir fa rodar tots els fusos."
          },
          "corda": {
            "nom": "Corda de transmissió",
            "text": "Porta el moviment de la roda fins als fusos."
          },
          "bastidor": {
            "nom": "Bastidor",
            "text": "L’estructura de fusta manté alineats els conjunts de treball i de transmissió."
          }
        },
        "real": {
          "img": "img/real-jenny.webp",
          "titol": "Spinning Jenny (model del tipus de Hargreaves)",
          "museu": "North Mill Museum · Belper, Derbyshire (Regne Unit)",
          "lic": "Foto: Betty Longbottom · Wikimedia Commons · CC BY-SA 2.0",
          "etiquetes": [
            [
              "fusos",
              52,
              13,
              "Fusos"
            ],
            [
              "metxes",
              62,
              46,
              "Bobines de metxa"
            ]
          ]
        },
        "clau": "Multiplica els fils treballats alhora, amb una màquina manual que es pot utilitzar a casa.",
        "batx": {
          "titol": "Vuit fusos no vol dir vuit vegades més productivitat",
          "text": "El nombre de fils simultanis ajuda a entendre el mecanisme. La producció real també depenia dels temps de preparació, les ruptures i l’habilitat de la persona. La Jenny primerenca produïa sobretot fil per a trama; no resolia tota la necessitat de fil resistent per a ordit.",
          "font": "https://lancashiremuseumsstories.wordpress.com/2020/05/29/james-hargreaves-and-the-spinning-jenny/",
          "fontNom": "Lancashire Museums · Spinning Jenny"
        },
        "innovacio": {
          "abans": "Una roda treballa un sol fil",
          "ara": "Una roda acciona diversos fusos"
        }
      },
      {
        "id": "water",
        "nom": "Water Frame",
        "any": "1769",
        "qui": "Richard Arkwright",
        "durada": 18,
        "model": "Water Frame · quatre caps esquemàtics, velocitats relatives il·lustratives",
        "pregunta": "Com s’estira el cotó sense mans?",
        "intro": "Els corrons substitueixen l’estiratge amb els dits. Les parelles successives arrosseguen el cotó més de pressa: <b>les fibres llisquen i la metxa s’aprima</b>. A sota, el fil es torça i es recull sense interrompre l’alimentació.",
        "fases": [
          {
            "fins": 0.23,
            "nom": "Agafar la metxa",
            "text": "Dos corrons giren en sentits oposats. A la zona de contacte, tots dos arrosseguen la metxa en la mateixa direcció.",
            "focus": [
              "metxa",
              "corrons"
            ]
          },
          {
            "fins": 0.5,
            "nom": "Estirar entre parelles",
            "text": "Cada parella arrossega més de pressa que l’anterior. Les fibres llisquen entre elles: en surt un cordó més prim, sense que cada fibra s’allargui com una goma.",
            "focus": [
              "corrons"
            ]
          },
          {
            "fins": 0.76,
            "nom": "Tòrcer i recollir",
            "text": "L’aleta gira al voltant de la bobina. La diferència de velocitat entre totes dues permet recollir el fil mentre es continua donant torsió.",
            "focus": [
              "aleta"
            ]
          },
          {
            "fins": 1,
            "nom": "Mantenir la producció",
            "text": "La transmissió rep energia d’una roda hidràulica exterior. Els quatre caps continuen treballant i les bobines es van omplint. Aquí no hi ha pausa per tornar un carro.",
            "focus": [
              "aigua",
              "aleta"
            ]
          }
        ],
        "parts": {
          "metxa": {
            "nom": "Bobina de metxa",
            "text": "El cotó cardat, encara tou i gruixut."
          },
          "corrons": {
            "nom": "Corrons d’estiratge",
            "text": "Tres parells que giren a velocitats creixents. Substitueixen els dits de la filadora."
          },
          "aleta": {
            "nom": "Aleta i bobina",
            "text": "L’aleta gira al voltant de la bobina: torça el fil i l’enrotlla en un moviment continu."
          },
          "aigua": {
            "nom": "Transmissió motriu",
            "text": "La politja rep el moviment dels eixos de la fàbrica. Una roda hidràulica exterior proporciona la força; no forma part del bastidor de filatura."
          },
          "bastidor": {
            "nom": "Bastidor",
            "text": "L’estructura de fusta manté alineats els conjunts de treball i de transmissió."
          }
        },
        "real": {
          "img": "img/real-water.webp",
          "titol": "Water Frame d’Arkwright (c. 1775)",
          "museu": "Science and Industry Museum · Manchester",
          "lic": "Foto: Clem Rutter · Wikimedia Commons · CC BY 3.0",
          "etiquetes": [
            [
              "metxa",
              46,
              22,
              "Bobines de metxa"
            ],
            [
              "corrons",
              52,
              42,
              "Corrons"
            ],
            [
              "aleta",
              48,
              92,
              "Aletes i bobines"
            ]
          ]
        },
        "clau": "Estiratge mecanitzat i fil resistent en continu: la força de l’aigua permet reunir moltes màquines en una fàbrica.",
        "batx": {
          "titol": "De l’habilitat manual al sistema de fàbrica",
          "text": "L’esquema sintetitza l’estiratge per corrons i la filatura contínua amb aleta. No és una rèplica peça per peça: hi havia models amb diferents corrons i nombres de fusos. Les velocitats mostrades expliquen la relació entre parelles, no són mesures històriques. El model de 1775 del museu té vuit fils.",
          "font": "https://collection.sciencemuseumgroup.org.uk/objects/co44832/arkwrights-water-frame-1775",
          "fontNom": "Science Museum Group · Water Frame de 1775"
        },
        "innovacio": {
          "abans": "La mà regula l’estiratge",
          "ara": "Els corrons l’estiren amb energia exterior"
        }
      },
      {
        "id": "mula",
        "nom": "La mula",
        "any": "1779",
        "qui": "Samuel Crompton",
        "durada": 20,
        "model": "Mula primerenca · sis fusos esquemàtics, cicle alentit",
        "pregunta": "I si ajuntem el millor de les dues màquines?",
        "intro": "La mula combina <b>corrons d’estiratge i fusos sobre un carro mòbil</b>. Separa amb precisió alimentar, acabar d’estirar i recollir: així permet obtenir fil fi i resistent amb molts fusos.",
        "fases": [
          {
            "fins": 0.38,
            "nom": "Alimentar i allunyar el carro",
            "text": "Els corrons giren i donen metxa. Alhora, el carro s’allunya i els fusos donen torsió.",
            "focus": [
              "corrons",
              "carro"
            ]
          },
          {
            "fins": 0.55,
            "nom": "Acabar d’estirar i tòrcer",
            "text": "Els corrons s’aturen: les marques deixen de girar. El carro encara s’allunya una mica i els fusos acaben de donar torsió al fil.",
            "focus": [
              "corrons",
              "fus"
            ]
          },
          {
            "fins": 0.67,
            "nom": "Preparar la recollida",
            "text": "El carro queda quiet. Un breu retrocés dels fusos i el descens del fil-guia preparen l’enrotllament.",
            "focus": [
              "fus"
            ]
          },
          {
            "fins": 1,
            "nom": "Tornar i enrotllar",
            "text": "El carro torna cap als corrons, que continuen aturats. El fil-guia manté el fil a la zona d’enrotllament i els cons dels sis fusos creixen.",
            "focus": [
              "carro",
              "fus"
            ]
          }
        ],
        "parts": {
          "fileta": {
            "nom": "Fileta",
            "text": "El bastidor fix on hi ha les bobines de metxa."
          },
          "corrons": {
            "nom": "Corrons",
            "text": "Com els de la Water Frame: estiren la metxa abans que surti."
          },
          "carro": {
            "nom": "Carro mòbil",
            "text": "Va i ve sobre rails portant tots els fusos. És la idea de la Jenny, però més gran."
          },
          "fus": {
            "nom": "Fus",
            "text": "Gira per tòrcer el fil i després per enrotllar-lo."
          },
          "bastidor": {
            "nom": "Bastidor",
            "text": "L’estructura de fusta manté alineats els conjunts de treball i de transmissió."
          },
          "roda": {
            "nom": "Roda de comandament",
            "text": "En els primers models manuals, el filador acciona la roda i coordina el treball dels fusos amb el desplaçament del carro."
          }
        },
        "real": {
          "img": "img/real-mula.webp",
          "titol": "Mula de filar del segle XIX (ja automàtica)",
          "museu": "Quarry Bank Mill · Styal, Cheshire (Regne Unit)",
          "lic": "Foto: David Dixon · Wikimedia Commons · CC BY-SA 2.0",
          "etiquetes": [
            [
              "fus",
              18,
              32,
              "Fusos"
            ],
            [
              "carro",
              30,
              62,
              "Carro mòbil"
            ]
          ]
        },
        "clau": "La coordinació dels corrons i el carro combina finor, resistència i producció amb nombrosos fusos.",
        "batx": {
          "titol": "Una combinació que encara necessita ofici",
          "text": "La mula de Crompton de 1779 va combinar solucions anteriors per obtenir fil fi i resistent. El moviment aquí és una síntesi didàctica d’un cicle de mula, no una reconstrucció exacta del prototip. Les mules manuals exigien un filador expert; l’automatització posterior va ser gradual i va transformar els oficis.",
          "font": "https://www.revealinghistories.org.uk/why-was-cotton-so-important-in-north-west-england/objects/crompton-s-mule.html",
          "fontNom": "Revealing Histories · Bolton Museum"
        },
        "innovacio": {
          "abans": "Quantitat de fil o fil resistent, amb límits",
          "ara": "Corrons i carro permeten fil fi i resistent"
        }
      }
    ],
    repte: [
      {
        "q": "Quants fils es treballen alhora amb la roda de filar tradicional?",
        "o": [
          "Un sol fil",
          "Vuit fils",
          "Tants com amb una Water Frame"
        ],
        "c": 0,
        "e": "La roda de filar treballa un fil cada vegada. La Jenny multiplica el nombre de fusos."
      },
      {
        "q": "Què vol dir «filar»?",
        "o": [
          "Encreuar fils per fer tela",
          "Estirar i tòrcer la fibra per fer fil",
          "Tenyir la tela"
        ],
        "c": 1,
        "e": "Filar és convertir la fibra en fil; teixir és convertir el fil en tela."
      },
      {
        "q": "Quin problema va crear la llançadora volant?",
        "o": [
          "Va faltar fil",
          "Van sobrar teixidors",
          "Les teles eren massa estretes"
        ],
        "c": 0,
        "e": "Es teixia tan de pressa que els filadors no donaven l’abast."
      },
      {
        "q": "Com estira el cotó la Water Frame?",
        "o": [
          "Amb una pinça que recula",
          "Amb parells de corrons que giren cada cop més de pressa",
          "Amb el pes d’una pedra"
        ],
        "c": 1,
        "e": "Les parelles successives arrosseguen més de pressa: les fibres llisquen i la metxa s’aprima."
      },
      {
        "q": "Per què la Water Frame va afavorir el sistema de fàbrica?",
        "o": [
          "Perquè necessitava una roda hidràulica i un gran edifici",
          "Perquè era molt petita",
          "Perquè només la podien fer servir nens"
        ],
        "c": 0,
        "e": "L’energia hidràulica i la transmissió afavorien reunir màquines i treballadors en un mateix edifici."
      },
      {
        "q": "Què combina la mula de Crompton?",
        "o": [
          "El teler i la llançadora",
          "Els corrons de la Water Frame i el carro de la Jenny",
          "La roda d’aigua i el vapor"
        ],
        "c": 1,
        "e": "D’aquí li ve el nom: és un encreuament de dues màquines."
      },
      {
        "tipus": "toca",
        "esc": "llancadora",
        "part": "caixes",
        "p": 0.3,
        "q": "Toca les caixes amb els tacos que impulsen la llançadora quan s’estira el cordill.",
        "e": "Les caixes dels costats, amb un taco que colpeja la llançadora quan el teixidor estira el cordill."
      },
      {
        "tipus": "toca",
        "esc": "water",
        "part": "corrons",
        "p": 0.4,
        "q": "Toca la peça de la Water Frame que estira el cotó sense mans.",
        "e": "Els corrons: cada parell gira més de pressa que l’anterior i el cotó s’aprima."
      },
      {
        "tipus": "ordena",
        "esc": "mula",
        "q": "Ordena el que fa la mula en cada cicle.",
        "e": "Alimentar i allunyar → acabar d’estirar amb corrons aturats → preparar la recollida → tornar i enrotllar."
      },
      {
        "q": "Per què les innovacions tèxtils arriben «en cadena»?",
        "o": [
          "Per casualitat",
          "Perquè cada invent crea un nou coll d’ampolla en una altra fase",
          "Perquè ho manava el rei"
        ],
        "c": 1,
        "e": "Accelerar una fase deixa enrere l’altra i empeny a buscar una nova solució."
      }
    ]
  };
  cap.escenes.push(RI.CARTWRIGHT_ESCENA);
  cap.repte.push({q:'Què aporta el teler mecànic respecte de la llançadora volant de Kay?',o:['Coordina mecànicament la calada, el pas de la trama i la batuda','Només afegeix una altra llançadora','Transforma la fibra en fil'],c:0,e:'La novetat és mecanitzar i coordinar les tres accions principals del teixit.'});
  cap.repte.push({tipus:'toca',esc:'cartwright',part:'eix',p:.1,q:'Toca l’eix i les lleves que coordinen el teler mecànic.',e:'El gir es transmet als òrgans de treball perquè actuïn en el moment adequat.'});
  for(const e of cap.escenes){
    e.svg=()=>RI.TEXTIL_DIBUIX.svg(e.id);
    e.anima=RI.TEXTIL_DIBUIX.anima(e.id);
    if(RI.TEXTIL_DIBUIX.ETIQUETES[e.id])e.etiquetes=RI.TEXTIL_DIBUIX.ETIQUETES[e.id];
    if(RI.TEXTIL_DIBUIX.MODELS[e.id])e.model=RI.TEXTIL_DIBUIX.MODELS[e.id];
  }
  RI.TEXTIL_ESCENES=Object.fromEntries(cap.escenes.map(e=>[e.id,e]));
  RI.capitol(cap);
})();

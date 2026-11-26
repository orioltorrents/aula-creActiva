/* Dades dels modes: estat a qualsevol temperatura, isòtops estables, estructura cristal·lina,
   elements del mòbil, país del descobriment i preu aproximat. */
window.PT_EXTRA = {
  /* ---------- canvis d'estat a 1 atm ----------
     Correccions als punts de fusió i d'ebullició de PeriodicTableJSON:
     l'heli no se solidifica a 1 atm; el carboni i l'arsènic sublimen (temperatura en K). */
  sublima: { C: 3915, As: 887 },
  noSolid: ['He'],
  // temperatures de referència del control lliscant [K, etiqueta curta, explicació]
  temps: [
    [1, '1 K', 'Gairebé el zero absolut (−273 °C)'],
    [77, 'N₂ líquid', 'Nitrogen líquid (−196 °C)'],
    [184, 'Antàrtida', 'Temperatura més baixa mesurada a la Terra (−89 °C, Antàrtida)'],
    [298, '25 °C', 'Temperatura ambient (25 °C)'],
    [373, '100 °C', 'L\'aigua bull (100 °C)'],
    [523, 'Forn', 'Forn de cuina al màxim (250 °C)'],
    [1473, 'Lava', 'Lava d\'un volcà (1.200 °C)'],
    [5772, 'Sol', 'Superfície del Sol (5.500 °C)']
  ],

  /* ---------- isòtops estables ----------
     [nombre màssic, abundància natural en %]. Font: IAEA, Live Chart of Nuclides (NUBASE2020 i ENSDF).
     Inclou els isòtops observacionalment estables (no se n'ha detectat la desintegració). */
  isotops: {
    H: [[1,99.9855],[2,0.0145]],
    He: [[3,0.0002],[4,99.9998]],
    Li: [[6,4.85],[7,95.15]],
    Be: [[9,100.0]],
    B: [[10,19.65],[11,80.35]],
    C: [[12,98.94],[13,1.06]],
    N: [[14,99.6205],[15,0.3795]],
    O: [[16,99.757],[17,0.03835],[18,0.2045]],
    F: [[19,100.0]],
    Ne: [[20,90.48],[21,0.27],[22,9.25]],
    Na: [[23,100.0]],
    Mg: [[24,78.965],[25,10.011],[26,11.025]],
    Al: [[27,100.0]],
    Si: [[28,92.2545],[29,4.672],[30,3.0735]],
    P: [[31,100.0]],
    S: [[32,94.85],[33,0.763],[34,4.365],[36,0.0158]],
    Cl: [[35,75.8],[37,24.2]],
    Ar: [[36,0.3336],[38,0.0629],[40,99.6035]],
    K: [[39,93.2581],[41,6.7302]],
    Ca: [[40,96.941],[42,0.647],[43,0.135],[44,2.086],[46,0.004]],
    Sc: [[45,100.0]],
    Ti: [[46,8.25],[47,7.44],[48,73.72],[49,5.41],[50,5.18]],
    V: [[51,99.75]],
    Cr: [[52,83.789],[53,9.501],[54,2.365]],
    Mn: [[55,100.0]],
    Fe: [[54,5.845],[56,91.754],[57,2.119],[58,0.282]],
    Co: [[59,100.0]],
    Ni: [[58,68.0769],[60,26.2231],[61,1.1399],[62,3.6345],[64,0.9256]],
    Cu: [[63,69.15],[65,30.85]],
    Zn: [[64,49.17],[66,27.73],[67,4.04],[68,18.45]],
    Ga: [[69,60.108],[71,39.892]],
    Ge: [[70,20.52],[72,27.45],[73,7.76],[74,36.52],[76,7.75]],
    As: [[75,100.0]],
    Se: [[74,0.86],[76,9.23],[77,7.6],[78,23.69],[80,49.8]],
    Br: [[79,50.65],[81,49.35]],
    Kr: [[78,0.355],[80,2.286],[82,11.593],[83,11.5],[84,56.987],[86,17.279]],
    Rb: [[85,72.17]],
    Sr: [[84,0.56],[86,9.86],[87,7.0],[88,82.58]],
    Y: [[89,100.0]],
    Zr: [[90,51.45],[91,11.22],[92,17.15],[94,17.38]],
    Nb: [[93,100.0]],
    Mo: [[92,14.649],[94,9.187],[95,15.873],[96,16.673],[97,9.582],[98,24.292]],
    Ru: [[96,5.54],[98,1.87],[99,12.76],[100,12.6],[101,17.06],[102,31.55],[104,18.62]],
    Rh: [[103,100.0]],
    Pd: [[102,1.02],[104,11.14],[105,22.33],[106,27.33],[108,26.46],[110,11.72]],
    Ag: [[107,51.839],[109,48.161]],
    Cd: [[106,1.245],[108,0.888],[110,12.47],[111,12.795],[112,24.109],[114,28.754]],
    In: [[113,4.281]],
    Sn: [[112,0.97],[114,0.66],[115,0.34],[116,14.54],[117,7.68],[118,24.22],[119,8.59],[120,32.58],[122,4.63],[124,5.79]],
    Sb: [[121,57.21],[123,42.79]],
    Te: [[120,0.09],[122,2.55],[124,4.74],[125,7.07],[126,18.84]],
    I: [[127,100.0]],
    Xe: [[126,0.089],[128,1.91],[129,26.401],[130,4.071],[131,21.232],[132,26.909]],
    Cs: [[133,100.0]],
    Ba: [[130,0.11],[134,2.42],[135,6.59],[136,7.85],[137,11.23],[138,71.7]],
    La: [[139,99.91119]],
    Ce: [[136,0.186],[140,88.449]],
    Pr: [[141,100.0]],
    Nd: [[142,27.153],[143,12.173],[145,8.293],[146,17.189],[148,5.756]],
    Sm: [[144,3.08],[149,13.82],[150,7.37],[152,26.74],[154,22.74]],
    Eu: [[153,52.19]],
    Gd: [[154,2.18],[155,14.8],[156,20.47],[157,15.65],[158,24.84],[160,21.86]],
    Tb: [[159,100.0]],
    Dy: [[156,0.056],[158,0.095],[160,2.329],[161,18.889],[162,25.475],[163,24.896],[164,28.26]],
    Ho: [[165,100.0]],
    Er: [[162,0.139],[164,1.601],[166,33.503],[167,22.869],[168,26.978],[170,14.91]],
    Tm: [[169,100.0]],
    Yb: [[168,0.123],[170,2.982],[171,14.086],[172,21.686],[173,16.103],[174,32.025],[176,12.995]],
    Lu: [[175,97.401]],
    Hf: [[176,5.26],[177,18.6],[178,27.28],[179,13.62],[180,35.08]],
    Ta: [[181,99.98799]],
    W: [[182,26.5],[184,30.64],[186,28.43]],
    Re: [[185,37.4]],
    Os: [[187,1.96],[188,13.24],[189,16.15],[190,26.26],[192,40.78]],
    Ir: [[191,37.3],[193,62.7]],
    Pt: [[192,0.782],[194,32.864],[195,33.775],[196,25.211],[198,7.356]],
    Au: [[197,100.0]],
    Hg: [[196,0.15],[198,10.04],[199,16.94],[200,23.14],[201,13.17],[202,29.74],[204,6.82]],
    Tl: [[203,29.515],[205,70.485]],
    Pb: [[206,24.1],[207,22.1],[208,52.4]]
  },

  /* ---------- estructura cristal·lina ----------
     Estructura del sòlid a temperatura ambient (o, en els gasos i líquids, del sòlid a baixa temperatura).
     cc = cúbica centrada en el cos, ccc = cúbica centrada en les cares, hc = hexagonal compacta,
     diamant = cúbica del diamant, altres = [altres, nom]. Font: CRC Handbook of Chemistry and Physics. */
  cristall: {
    H: ['altres', 'hexagonal'], He: ['hc'], Li: ['cc'], Be: ['hc'], B: ['altres', 'romboèdrica'],
    C: ['altres', 'hexagonal (grafit)'], N: ['altres', 'hexagonal'], O: ['altres', 'cúbica (molecular)'],
    F: ['altres', 'cúbica (molecular)'], Ne: ['ccc'], Na: ['cc'], Mg: ['hc'], Al: ['ccc'], Si: ['diamant'],
    P: ['altres', 'ortoròmbica (fòsfor negre)'], S: ['altres', 'ortoròmbica'], Cl: ['altres', 'ortoròmbica'],
    Ar: ['ccc'], K: ['cc'], Ca: ['ccc'], Sc: ['hc'], Ti: ['hc'], V: ['cc'], Cr: ['cc'],
    Mn: ['altres', 'cúbica complexa (58 àtoms per cel·la)'], Fe: ['cc'], Co: ['hc'], Ni: ['ccc'], Cu: ['ccc'],
    Zn: ['hc'], Ga: ['altres', 'ortoròmbica'], Ge: ['diamant'], As: ['altres', 'romboèdrica'],
    Se: ['altres', 'hexagonal (cadenes)'], Br: ['altres', 'ortoròmbica'], Kr: ['ccc'], Rb: ['cc'], Sr: ['ccc'],
    Y: ['hc'], Zr: ['hc'], Nb: ['cc'], Mo: ['cc'], Tc: ['hc'], Ru: ['hc'], Rh: ['ccc'], Pd: ['ccc'], Ag: ['ccc'],
    Cd: ['hc'], In: ['altres', 'tetragonal'], Sn: ['altres', 'tetragonal (estany blanc)'],
    Sb: ['altres', 'romboèdrica'], Te: ['altres', 'hexagonal (cadenes)'], I: ['altres', 'ortoròmbica'],
    Xe: ['ccc'], Cs: ['cc'], Ba: ['cc'], La: ['hc', 'doble'], Ce: ['ccc'], Pr: ['hc', 'doble'], Nd: ['hc', 'doble'],
    Pm: ['hc', 'doble'], Sm: ['altres', 'romboèdrica'], Eu: ['cc'], Gd: ['hc'], Tb: ['hc'], Dy: ['hc'], Ho: ['hc'],
    Er: ['hc'], Tm: ['hc'], Yb: ['ccc'], Lu: ['hc'], Hf: ['hc'], Ta: ['cc'], W: ['cc'], Re: ['hc'], Os: ['hc'],
    Ir: ['ccc'], Pt: ['ccc'], Au: ['ccc'], Hg: ['altres', 'romboèdrica'], Tl: ['hc'], Pb: ['ccc'],
    Bi: ['altres', 'romboèdrica'], Po: ['altres', 'cúbica simple'], Rn: ['ccc'], Ra: ['cc'], Ac: ['ccc'],
    Th: ['ccc'], Pa: ['altres', 'tetragonal'], U: ['altres', 'ortoròmbica'], Np: ['altres', 'ortoròmbica'],
    Pu: ['altres', 'monoclínica'], Am: ['hc', 'doble'], Cm: ['hc', 'doble'], Bk: ['hc', 'doble'],
    Cf: ['hc', 'doble'], Es: ['ccc']
  },

  /* ---------- elements d'un telèfon mòbil ----------
     [component, funció]. Fonts: A. Brunning, Compound Interest, «The chemical elements of a smartphone»;
     Royal Society of Chemistry; American Chemical Society. */
  mobil: {
    In: ['pantalla', 'L\'òxid d\'indi i estany (ITO) forma la capa transparent i conductora de la pantalla tàctil.'],
    O: ['pantalla', 'Forma part del vidre de la pantalla i de molts òxids dels components.'],
    K: ['pantalla', 'Els ions de potassi endureixen el vidre de la pantalla perquè no es ratlli ni es trenqui fàcilment.'],
    Y: ['pantalla', 'Terra rara que produeix els colors de la pantalla i de la llum de fons.'],
    Eu: ['pantalla', 'Terra rara que produeix el vermell i el blau de la pantalla.'],
    Tb: ['pantalla', 'Terra rara que produeix el verd de la pantalla.'],
    Gd: ['pantalla', 'Terra rara que s\'afegeix als materials que fan els colors de la pantalla.'],
    La: ['pantalla', 'Vidre especial de les lents de la càmera, que desvia més la llum.'],
    Li: ['bateria', 'Els ions de liti passen d\'un elèctrode a l\'altre quan la bateria es carrega i es descarrega.'],
    Co: ['bateria', 'L\'òxid de liti i cobalt forma l\'elèctrode positiu de la bateria.'],
    C: ['bateria', 'El grafit forma l\'elèctrode negatiu de la bateria. També és a tots els plàstics.'],
    Si: ['circuits', 'Els xips i el processador són de silici molt pur.'],
    P: ['circuits', 'Quantitats mínimes de fòsfor (dopatge) fan que el silici dels xips condueixi millor.'],
    As: ['circuits', 'L\'arsenur de gal·li s\'usa als xips que emeten i reben el senyal de ràdio.'],
    Ga: ['circuits', 'L\'arsenur de gal·li s\'usa als xips de ràdio i el nitrur de gal·li, als LED i als carregadors ràpids.'],
    Cu: ['circuits', 'Cables, pistes dels circuits i bobines: és el metall més usat a l\'electrònica.'],
    Au: ['circuits', 'Contactes i connectors: no s\'oxida i condueix molt bé.'],
    Ag: ['circuits', 'Soldadures i contactes elèctrics.'],
    Sn: ['circuits', 'Soldadures que uneixen els components a la placa (amb plata i coure, sense plom).'],
    Ta: ['circuits', 'Condensadors molt petits que emmagatzemen càrrega elèctrica.'],
    Ba: ['circuits', 'El titanat de bari s\'usa en els condensadors ceràmics de la placa.'],
    Sb: ['circuits', 'Dopatge dels semiconductors i retardant de flama dels plàstics.'],
    Nd: ['imants', 'Els imants de neodimi, ferro i bor fan funcionar l\'altaveu, el micròfon i el motor de vibració.'],
    Pr: ['imants', 'S\'afegeix als imants de neodimi.'],
    Dy: ['imants', 'S\'afegeix als imants de neodimi perquè no perdin la força quan s\'escalfen.'],
    Fe: ['imants', 'Forma part dels imants de neodimi, ferro i bor.'],
    B: ['imants', 'Forma part dels imants de neodimi, ferro i bor.'],
    Al: ['carcassa', 'Carcassa i marc d\'alumini. També és al vidre de la pantalla (aluminosilicat).'],
    Mg: ['carcassa', 'Aliatges lleugers de l\'estructura interna.'],
    Ni: ['carcassa', 'Recobriments i blindatge contra les interferències electromagnètiques.'],
    Br: ['carcassa', 'Retardants de flama dels plàstics, que eviten que s\'incendiïn.']
  },

  /* ---------- país del descobriment ----------
     [país principal, [altres països]]. Segons els descobridors de data/propietats.js.
     antic = coneguts des de l'antiguitat o l'edat mitjana. */
  pais: {
    H: ['ru'], He: ['ru', ['franca']], Li: ['suecia'], Be: ['franca'], B: ['franca', ['ru']], C: ['antic'],
    N: ['ru'], O: ['suecia', ['ru']], F: ['franca'], Ne: ['ru'], Na: ['ru'], Mg: ['ru'], Al: ['dinamarca'],
    Si: ['suecia'], P: ['alemanya'], S: ['antic'], Cl: ['suecia'], Ar: ['ru'], K: ['ru'], Ca: ['ru'],
    Sc: ['suecia'], Ti: ['ru'], V: ['espanya'], Cr: ['franca'], Mn: ['suecia'], Fe: ['antic'], Co: ['suecia'],
    Ni: ['suecia'], Cu: ['antic'], Zn: ['antic'], Ga: ['franca'], Ge: ['alemanya'], As: ['antic'],
    Se: ['suecia'], Br: ['franca'], Kr: ['ru'], Rb: ['alemanya'], Sr: ['ru'], Y: ['finlandia'],
    Zr: ['alemanya'], Nb: ['ru'], Mo: ['suecia'], Tc: ['italia'], Ru: ['russia'], Rh: ['ru'], Pd: ['ru'],
    Ag: ['antic'], Cd: ['alemanya'], In: ['alemanya'], Sn: ['antic'], Sb: ['antic'], Te: ['austria'],
    I: ['franca'], Xe: ['ru'], Cs: ['alemanya'], Ba: ['ru', ['suecia']], La: ['suecia'],
    Ce: ['suecia', ['alemanya']], Pr: ['austria'], Nd: ['austria'], Pm: ['eua'], Sm: ['franca'], Eu: ['franca'],
    Gd: ['suissa'], Tb: ['suecia'], Dy: ['franca'], Ho: ['suissa', ['suecia']], Er: ['suecia'], Tm: ['suecia'],
    Yb: ['suissa'], Lu: ['franca', ['austria', 'eua']], Hf: ['dinamarca'], Ta: ['suecia'], W: ['espanya'],
    Re: ['alemanya'], Os: ['ru'], Ir: ['ru'], Pt: ['espanya'], Au: ['antic'], Hg: ['antic'], Tl: ['ru'],
    Pb: ['antic'], Bi: ['antic'], Po: ['franca'], At: ['eua'], Rn: ['alemanya'], Fr: ['franca'], Ra: ['franca'],
    Ac: ['franca'], Th: ['suecia'], Pa: ['alemanya'], U: ['alemanya'], Np: ['eua'], Pu: ['eua'], Am: ['eua'],
    Cm: ['eua'], Bk: ['eua'], Cf: ['eua'], Es: ['eua'], Fm: ['eua'], Md: ['eua'], No: ['russia', ['eua']],
    Lr: ['eua', ['russia']], Rf: ['russia', ['eua']], Db: ['russia', ['eua']], Sg: ['eua'], Bh: ['alemanya'],
    Hs: ['alemanya'], Mt: ['alemanya'], Ds: ['alemanya'], Rg: ['alemanya'], Cn: ['alemanya'], Nh: ['japo'],
    Fl: ['russia', ['eua']], Mc: ['russia', ['eua']], Lv: ['russia', ['eua']], Ts: ['russia', ['eua']],
    Og: ['russia', ['eua']]
  },
  paisNom: {
    antic: 'coneguts des d\'antic', ru: 'Regne Unit', suecia: 'Suècia', franca: 'França', alemanya: 'Alemanya',
    eua: 'Estats Units', russia: 'Rússia', espanya: 'Espanya', dinamarca: 'Dinamarca', finlandia: 'Finlàndia',
    italia: 'Itàlia', austria: 'Àustria', suissa: 'Suïssa', japo: 'Japó'
  },
  paisNota: {
    V: 'Andrés Manuel del Río el va descobrir a Mèxic, aleshores Nova Espanya.',
    Pt: 'Antonio de Ulloa el va descriure a l\'actual Colòmbia, aleshores part de l\'Imperi espanyol.',
    W: 'Els germans Elhuyar el van aïllar a Bergara (País Basc).',
    Y: 'Finlàndia formava part aleshores del Regne de Suècia.',
    Te: 'Es va descobrir a Transsilvània, aleshores part de l\'Imperi austríac.',
    Ru: 'Karl Ernst Claus el va descobrir a la Universitat de Kazan.',
    Al: 'Hans Christian Ørsted el va obtenir a Copenhaguen.',
    Hf: 'Es va descobrir a Copenhaguen, a l\'institut de Niels Bohr.',
    Tc: 'Es va obtenir a Palerm a partir d\'una peça d\'un accelerador dels Estats Units.',
    Nh: 'És el primer element descobert a l\'Àsia.',
    Fr: 'Marguerite Perey el va descobrir a l\'Institut del Radi de París, fundat per Marie Curie.',
    Re: 'Ida Noddack (Tacke) va ser una de les descobridores.',
    Pa: 'Lise Meitner i Otto Hahn en van descobrir l\'isòtop de vida més llarga el 1918.'
  },

  /* ---------- preu aproximat ----------
     Ordre de magnitud del preu (€/kg) en la forma comercial habitual (metall, gas o mineral).
     0: < 1 · 1: 1–10 · 2: 10–100 · 3: 100–1.000 · 4: 1.000–10.000 · 5: > 10.000 ·
     6: radioactius produïts en reactors o acceleradors (més de 100 € per gram).
     Fonts: Wikipedia, «Prices of chemical elements» (dades 2019-2020, a partir de l'USGS i el
     Handbook of Chemistry and Physics); cotitzacions dels metalls preciosos de 2025. */
  preu: {
    C: 0, N: 0, O: 0, S: 0, Cl: 0, Ar: 0, Fe: 0, Ba: 0,
    H: 1, B: 1, F: 1, Na: 1, Mg: 1, Al: 1, Si: 1, P: 1, Ca: 1, Cr: 1, Mn: 1, Cu: 1, Zn: 1, As: 1, Br: 1,
    Sr: 1, Cd: 1, Sb: 1, La: 1, Ce: 1, Pb: 1, Bi: 1,
    He: 2, Li: 2, K: 2, Ti: 2, Co: 2, Ni: 2, Se: 2, Y: 2, Zr: 2, Nb: 2, Mo: 2, Sn: 2, Te: 2, I: 2, Nd: 2,
    Sm: 2, Eu: 2, Gd: 2, Ho: 2, Er: 2, Yb: 2, W: 2, Hg: 2,
    Be: 3, V: 3, Ga: 3, Ne: 3, Kr: 3, In: 3, Pr: 3, Tb: 3, Dy: 3, Lu: 3, Hf: 3, Ta: 3, Th: 3, U: 3,
    Sc: 4, Ge: 4, Ag: 4, Xe: 4, Tm: 4, Re: 4, Tl: 4,
    Rb: 5, Ru: 5, Rh: 5, Pd: 5, Cs: 5, Os: 5, Ir: 5, Pt: 5, Au: 5,
    Tc: 6, Pm: 6, Po: 6, Ac: 6, Np: 6, Pu: 6, Am: 6, Cm: 6, Bk: 6, Cf: 6
  }
};

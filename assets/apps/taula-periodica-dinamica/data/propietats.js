/* Dades complementàries revisades de la Taula periòdica dinàmica.
   Totes les magnituds numèriques fan servir punt decimal (format JS).
   Les propietats generals (massa, electronegativitat, energia d'ionització,
   densitat, punts de fusió i d'ebullició, configuració) provenen de
   data/elements.js (PeriodicTableJSON, Bowserinator). */
window.PT_DADES = {

  /* ---------- classificació ---------- */
  families: {
    alcali: ['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr'],
    alcalinoterri: ['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra'],
    altresMetalls: ['Al', 'Ga', 'In', 'Sn', 'Tl', 'Pb', 'Bi', 'Po', 'Nh', 'Fl', 'Mc', 'Lv'],
    semimetall: ['B', 'Si', 'Ge', 'As', 'Sb', 'Te'],
    noMetall: ['H', 'C', 'N', 'O', 'P', 'S', 'Se'],
    halogen: ['F', 'Cl', 'Br', 'I', 'At', 'Ts'],
    gasNoble: ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn', 'Og']
    // metalls de transició (grups 3-12), lantànids (57-71) i actínids (89-103): per nombre atòmic
  },

  /* ---------- radi atòmic (pm) ----------
     Radi empíric (J. C. Slater, 1964); per als gasos nobles, radi calculat
     (E. Clementi, 1967). */
  radi: {
    H: 25, He: 31, Li: 145, Be: 105, B: 85, C: 70, N: 65, O: 60, F: 50, Ne: 38,
    Na: 180, Mg: 150, Al: 125, Si: 110, P: 100, S: 100, Cl: 100, Ar: 71,
    K: 220, Ca: 180, Sc: 160, Ti: 140, V: 135, Cr: 140, Mn: 140, Fe: 140, Co: 135, Ni: 135, Cu: 135, Zn: 135,
    Ga: 130, Ge: 125, As: 115, Se: 115, Br: 115, Kr: 88,
    Rb: 235, Sr: 200, Y: 180, Zr: 155, Nb: 145, Mo: 145, Tc: 135, Ru: 130, Rh: 135, Pd: 140, Ag: 160, Cd: 155,
    In: 155, Sn: 145, Sb: 145, Te: 140, I: 140, Xe: 108,
    Cs: 260, Ba: 215, La: 195, Ce: 185, Pr: 185, Nd: 185, Pm: 185, Sm: 185, Eu: 185, Gd: 180, Tb: 175, Dy: 175,
    Ho: 175, Er: 175, Tm: 175, Yb: 175, Lu: 175, Hf: 155, Ta: 145, W: 135, Re: 135, Os: 130, Ir: 135, Pt: 135,
    Au: 135, Hg: 150, Tl: 190, Pb: 180, Bi: 160, Po: 190, At: 150, Rn: 120,
    Fr: 270, Ra: 215, Ac: 195, Th: 180, Pa: 180, U: 175, Np: 175, Pu: 175, Am: 175
  },

  /* ---------- resistivitat elèctrica a 20 °C (nΩ·m) ----------
     Conductivitat σ = 10⁹ / ρ (S/m). Font: CRC Handbook / WebElements. */
  resistivitat: {
    Li: 92.8, Be: 36, Na: 47.7, Mg: 43.9, Al: 26.5, K: 72, Ca: 33.6, Sc: 562, Ti: 420, V: 197,
    Cr: 125, Mn: 1440, Fe: 96.1, Co: 62.4, Ni: 69.3, Cu: 16.78, Zn: 59, Ga: 270, As: 333,
    Rb: 128, Sr: 132, Y: 596, Zr: 421, Nb: 152, Mo: 53.4, Tc: 200, Ru: 71, Rh: 43.3, Pd: 105.4,
    Ag: 15.87, Cd: 72.7, In: 83.7, Sn: 115, Sb: 417, Cs: 205, Ba: 332,
    La: 615, Ce: 828, Pr: 700, Nd: 643, Pm: 750, Sm: 940, Eu: 900, Gd: 1310, Tb: 1150, Dy: 926,
    Ho: 814, Er: 860, Tm: 676, Yb: 250, Lu: 582, Hf: 331, Ta: 131, W: 52.8, Re: 193, Os: 81.2,
    Ir: 47.1, Pt: 105, Au: 22.14, Hg: 961, Tl: 180, Pb: 208, Bi: 1290, Po: 400, Ra: 1000,
    Th: 157, Pa: 177, U: 280, Np: 1220, Pu: 1460, Am: 690,
    C: 10000 // grafit (el diamant és aïllant)
  },
  semiconductors: { Si: 1.56e-3, Ge: 2.17, B: null, Se: null, Te: null }, // S/m (silici i germani intrínsecs)
  aillants: ['H', 'He', 'N', 'O', 'F', 'Ne', 'P', 'S', 'Cl', 'Ar', 'Br', 'Kr', 'I', 'Xe', 'Rn'],

  /* ---------- conductivitat tèrmica a 300 K (W/m·K) ---------- */
  termica: {
    H: 0.1805, He: 0.1513, Li: 85, Be: 200, B: 27, C: 140, N: 0.02583, O: 0.02658, F: 0.0277, Ne: 0.0491,
    Na: 142, Mg: 156, Al: 237, Si: 149, P: 0.236, S: 0.205, Cl: 0.0089, Ar: 0.01772,
    K: 102.5, Ca: 201, Sc: 15.8, Ti: 21.9, V: 30.7, Cr: 93.9, Mn: 7.81, Fe: 80.4, Co: 100, Ni: 90.9,
    Cu: 401, Zn: 116, Ga: 40.6, Ge: 60.2, As: 50.2, Se: 0.519, Br: 0.122, Kr: 0.00943,
    Rb: 58.2, Sr: 35.4, Y: 17.2, Zr: 22.6, Nb: 53.7, Mo: 138, Tc: 50.6, Ru: 117, Rh: 150, Pd: 71.8,
    Ag: 429, Cd: 96.6, In: 81.8, Sn: 66.8, Sb: 24.4, Te: 2.35, I: 0.449, Xe: 0.00565,
    Cs: 35.9, Ba: 18.4, La: 13.4, Ce: 11.3, Pr: 12.5, Nd: 16.5, Pm: 17.9, Sm: 13.3, Eu: 13.9, Gd: 10.6,
    Tb: 11.1, Dy: 10.7, Ho: 16.2, Er: 14.5, Tm: 16.9, Yb: 38.5, Lu: 16.4, Hf: 23, Ta: 57.5, W: 173,
    Re: 48, Os: 87.6, Ir: 147, Pt: 71.6, Au: 318, Hg: 8.3, Tl: 46.1, Pb: 35.3, Bi: 7.97, Po: 20,
    Rn: 0.00361, Ra: 18.6, Ac: 12, Th: 54, Pa: 47, U: 27.5, Np: 6.3, Pu: 6.74, Am: 10
  },

  /* ---------- abundàncies (fracció en massa, %) ---------- */
  // Escorça terrestre: CRC Handbook of Chemistry and Physics (mg/kg convertits a %)
  escorca: {
    O: 46.1, Si: 28.2, Al: 8.23, Fe: 5.63, Ca: 4.15, Na: 2.36, Mg: 2.33, K: 2.09, Ti: 0.565, H: 0.14,
    P: 0.105, Mn: 0.095, F: 0.0585, Ba: 0.0425, Sr: 0.037, S: 0.035, C: 0.02, Zr: 0.0165, Cl: 0.0145,
    V: 0.012, Cr: 0.0102, Rb: 0.009, Ni: 0.0084, Zn: 0.007, Ce: 0.00665, Cu: 0.006, Nd: 0.00415,
    La: 0.0039, Y: 0.0033, Co: 0.0025, Sc: 0.0022, Li: 0.002, Nb: 0.002, N: 0.0019, Ga: 0.0019,
    Pb: 0.0014, B: 0.001, Th: 0.00096, Pr: 0.00092, Sm: 0.000705, Gd: 0.00062, Dy: 0.00052,
    Er: 0.00035, Ar: 0.00035, Yb: 0.00032, Hf: 0.0003, Cs: 0.0003, Be: 0.00028, U: 0.00027,
    Br: 0.00024, Sn: 0.00023, Ta: 0.0002, Eu: 0.0002, As: 0.00018, Ge: 0.00015, Ho: 0.00013,
    W: 0.000125, Mo: 0.00012, Tb: 0.00012, Tl: 0.000085, Lu: 0.00008, Tm: 0.000052, I: 0.000045,
    In: 0.000025, Sb: 0.00002, Cd: 0.000015, Hg: 0.0000085, Ag: 0.0000075, Se: 0.000005,
    Pd: 0.0000015, Bi: 8.5e-7, He: 8e-7, Ne: 5e-7, Pt: 5e-7, Au: 4e-7, Os: 1.5e-7, Ir: 1e-7,
    Rh: 1e-7, Ru: 1e-7, Te: 1e-7, Re: 7e-8, Kr: 1e-8, Xe: 3e-9
  },
  // Cos humà: adult de 70 kg (J. Emsley, The Elements)
  cos: {
    O: 65, C: 18.5, H: 9.5, N: 3.2, Ca: 1.5, P: 1, K: 0.4, S: 0.3, Na: 0.2, Cl: 0.2, Mg: 0.1,
    Fe: 0.006, F: 0.0037, Zn: 0.0033, Si: 0.0014, Rb: 0.00097, Sr: 0.00046, Br: 0.00037,
    Cu: 0.0001, I: 0.00002, Se: 0.000019, Mn: 0.000017, Mo: 0.000013, Cr: 0.000003, Co: 0.000002
  },
  // Univers: fracció en massa a la Via Làctia (K. Croswell, 1996)
  univers: {
    H: 73.9, He: 24, O: 1.04, C: 0.46, Ne: 0.134, Fe: 0.109, N: 0.096, Si: 0.065, Mg: 0.058, S: 0.044,
    Ar: 0.02, Ca: 0.007, Ni: 0.006, Al: 0.006, Na: 0.002, Cr: 0.0015, P: 0.001, Cl: 0.0007,
    Ti: 0.0004, K: 0.0003
  },

  /* ---------- estats d'oxidació habituals (formulació inorgànica a l'ESO) ---------- */
  oxidacio: {
    H: [1, -1],
    Li: [1], Na: [1], K: [1], Rb: [1], Cs: [1], Fr: [1],
    Be: [2], Mg: [2], Ca: [2], Sr: [2], Ba: [2], Ra: [2],
    B: [3], Al: [3], Ga: [3], In: [3], Tl: [1, 3],
    C: [2, 4, -4], Si: [4, -4], Ge: [2, 4], Sn: [2, 4], Pb: [2, 4],
    N: [1, 2, 3, 4, 5, -3], P: [3, 5, -3], As: [3, 5, -3], Sb: [3, 5, -3], Bi: [3, 5],
    O: [-2], S: [2, 4, 6, -2], Se: [2, 4, 6, -2], Te: [2, 4, 6, -2], Po: [2, 4],
    F: [-1], Cl: [1, 3, 5, 7, -1], Br: [1, 3, 5, 7, -1], I: [1, 3, 5, 7, -1], At: [1, 3, 5, 7, -1],
    He: [0], Ne: [0], Ar: [0], Kr: [0], Xe: [0], Rn: [0],
    Sc: [3], Y: [3], La: [3], Ac: [3],
    Ti: [2, 3, 4], V: [2, 3, 4, 5], Cr: [2, 3, 6], Mn: [2, 3, 4, 6, 7], Fe: [2, 3], Co: [2, 3], Ni: [2, 3],
    Cu: [1, 2], Zn: [2], Zr: [4], Nb: [3, 5], Mo: [2, 3, 4, 6], Tc: [4, 7], Ru: [3, 4, 8], Rh: [3],
    Pd: [2, 4], Ag: [1], Cd: [2], Hf: [4], Ta: [5], W: [4, 6], Re: [4, 6, 7], Os: [2, 3, 4, 6, 8],
    Ir: [3, 4], Pt: [2, 4], Au: [1, 3], Hg: [1, 2],
    Ce: [3, 4], Pr: [3], Nd: [3], Pm: [3], Sm: [2, 3], Eu: [2, 3], Gd: [3], Tb: [3, 4], Dy: [3], Ho: [3],
    Er: [3], Tm: [2, 3], Yb: [2, 3], Lu: [3],
    Th: [4], Pa: [4, 5], U: [3, 4, 5, 6], Np: [3, 4, 5, 6], Pu: [3, 4, 5, 6], Am: [3, 4, 5], Cm: [3],
    Bk: [3, 4], Cf: [3], Es: [3], Fm: [2, 3], Md: [2, 3], No: [2, 3], Lr: [3]
  },

  /* ---------- química i vida ---------- */
  bioelements: {
    primari: ['C', 'H', 'O', 'N', 'P', 'S'],
    secundari: ['Na', 'K', 'Ca', 'Mg', 'Cl'],
    oligo: ['Fe', 'Cu', 'Zn', 'Mn', 'Co', 'Mo', 'Se', 'I', 'F'],
    possible: ['Cr', 'Ni', 'V', 'B', 'Si']
  },
  toxicitat: {
    alta: ['Hg', 'Pb', 'Cd', 'As', 'Tl', 'Be'],
    compostos: ['Cr', 'Ni', 'Ba', 'Sb', 'Se', 'F', 'Cl', 'Br', 'Os', 'U']
  },
  ferromagnetics: ['Fe', 'Co', 'Ni'],

  /* ---------- descobriment ----------
     Any segons la taula d'anys de descobriment de la carpeta (AnyDescobrimentElements.JPG);
     els anys negatius són aC. */
  descobriment: {
    H: [1766, 'Henry Cavendish'],
    He: [1895, 'William Ramsay (aïllament); detectat al Sol per P. Janssen i N. Lockyer el 1868'],
    Li: [1817, 'Johan August Arfwedson'],
    Be: [1797, 'Louis-Nicolas Vauquelin'],
    B: [1808, 'J. L. Gay-Lussac i L. J. Thénard; Humphry Davy'],
    C: [-3750, 'Conegut des de l\'antiguitat (Egipte i Mesopotàmia)'],
    N: [1772, 'Daniel Rutherford'],
    O: [1774, 'Carl Wilhelm Scheele i Joseph Priestley'],
    F: [1886, 'Henri Moissan (aïllament)'],
    Ne: [1898, 'William Ramsay i Morris Travers'],
    Na: [1807, 'Humphry Davy'],
    Mg: [1755, 'Joseph Black (identificació); aïllat per Humphry Davy el 1808'],
    Al: [1825, 'Hans Christian Ørsted'],
    Si: [1824, 'Jöns Jacob Berzelius'],
    P: [1669, 'Hennig Brand'],
    S: [-500, 'Conegut des de l\'antiguitat'],
    Cl: [1774, 'Carl Wilhelm Scheele'],
    Ar: [1894, 'Lord Rayleigh i William Ramsay'],
    K: [1807, 'Humphry Davy'],
    Ca: [1808, 'Humphry Davy'],
    Sc: [1879, 'Lars Fredrik Nilson'],
    Ti: [1791, 'William Gregor'],
    V: [1801, 'Andrés Manuel del Río'],
    Cr: [1797, 'Louis-Nicolas Vauquelin'],
    Mn: [1774, 'Johan Gottlieb Gahn (aïllament)'],
    Fe: [-2000, 'Conegut des de l\'antiguitat'],
    Co: [1735, 'Georg Brandt'],
    Ni: [1751, 'Axel Fredrik Cronstedt'],
    Cu: [-8000, 'Conegut des de la prehistòria (Pròxim Orient)'],
    Zn: [1500, 'Metal·lúrgia de l\'Índia; aïllat a Europa per Andreas Marggraf el 1746'],
    Ga: [1875, 'Paul-Émile Lecoq de Boisbaudran'],
    Ge: [1886, 'Clemens Winkler'],
    As: [1250, 'Atribuït a Albert el Gran'],
    Se: [1817, 'Jöns Jacob Berzelius'],
    Br: [1826, 'Antoine-Jérôme Balard'],
    Kr: [1898, 'William Ramsay i Morris Travers'],
    Rb: [1861, 'Robert Bunsen i Gustav Kirchhoff'],
    Sr: [1790, 'Adair Crawford'],
    Y: [1794, 'Johan Gadolin'],
    Zr: [1789, 'Martin Heinrich Klaproth'],
    Nb: [1801, 'Charles Hatchett'],
    Mo: [1781, 'Peter Jacob Hjelm (aïllament)'],
    Tc: [1937, 'Carlo Perrier i Emilio Segrè'],
    Ru: [1844, 'Karl Ernst Claus'],
    Rh: [1803, 'William Hyde Wollaston'],
    Pd: [1803, 'William Hyde Wollaston'],
    Ag: [-3000, 'Conegut des de l\'antiguitat'],
    Cd: [1817, 'Friedrich Stromeyer'],
    In: [1863, 'Ferdinand Reich i Hieronymus Theodor Richter'],
    Sn: [-3000, 'Conegut des de l\'antiguitat'],
    Sb: [-3000, 'Conegut des de l\'antiguitat'],
    Te: [1783, 'Franz-Joseph Müller von Reichenstein'],
    I: [1811, 'Bernard Courtois'],
    Xe: [1898, 'William Ramsay i Morris Travers'],
    Cs: [1860, 'Robert Bunsen i Gustav Kirchhoff'],
    Ba: [1808, 'Humphry Davy (aïllament); identificat per C. W. Scheele el 1772'],
    La: [1839, 'Carl Gustaf Mosander'],
    Ce: [1803, 'M. H. Klaproth; J. J. Berzelius i W. Hisinger'],
    Pr: [1885, 'Carl Auer von Welsbach'],
    Nd: [1885, 'Carl Auer von Welsbach'],
    Pm: [1945, 'J. A. Marinsky, L. E. Glendenin i C. D. Coryell'],
    Sm: [1879, 'Paul-Émile Lecoq de Boisbaudran'],
    Eu: [1901, 'Eugène-Anatole Demarçay'],
    Gd: [1880, 'Jean Charles Galissard de Marignac'],
    Tb: [1843, 'Carl Gustaf Mosander'],
    Dy: [1886, 'Paul-Émile Lecoq de Boisbaudran'],
    Ho: [1878, 'Marc Delafontaine i Jacques-Louis Soret; Per Teodor Cleve'],
    Er: [1842, 'Carl Gustaf Mosander'],
    Tm: [1879, 'Per Teodor Cleve'],
    Yb: [1878, 'Jean Charles Galissard de Marignac'],
    Lu: [1907, 'Georges Urbain; C. Auer von Welsbach i C. James'],
    Hf: [1923, 'Dirk Coster i George de Hevesy'],
    Ta: [1802, 'Anders Gustaf Ekeberg'],
    W: [1783, 'Germans Juan José i Fausto Elhuyar (aïllament)'],
    Re: [1925, 'Walter Noddack, Ida Tacke i Otto Berg'],
    Os: [1803, 'Smithson Tennant'],
    Ir: [1803, 'Smithson Tennant'],
    Pt: [1735, 'Antonio de Ulloa (descripció)'],
    Au: [-2500, 'Conegut des de l\'antiguitat'],
    Hg: [-1500, 'Conegut des de l\'antiguitat'],
    Tl: [1861, 'William Crookes'],
    Pb: [-4000, 'Conegut des de l\'antiguitat'],
    Bi: [1400, 'Conegut des de l\'edat mitjana; identificat com a element per C. F. Geoffroy el 1753'],
    Po: [1898, 'Marie i Pierre Curie'],
    At: [1940, 'D. R. Corson, K. R. MacKenzie i E. Segrè'],
    Rn: [1900, 'Friedrich Ernst Dorn'],
    Fr: [1939, 'Marguerite Perey'],
    Ra: [1898, 'Marie i Pierre Curie'],
    Ac: [1899, 'André-Louis Debierne'],
    Th: [1829, 'Jöns Jacob Berzelius'],
    Pa: [1913, 'Kasimir Fajans i Oswald Göhring'],
    U: [1789, 'Martin Heinrich Klaproth'],
    Np: [1940, 'Edwin McMillan i Philip Abelson'],
    Pu: [1940, 'Glenn T. Seaborg i col·laboradors (Berkeley)'],
    Am: [1944, 'Glenn T. Seaborg i col·laboradors (Chicago)'],
    Cm: [1944, 'Glenn T. Seaborg, Ralph James i Albert Ghiorso'],
    Bk: [1949, 'Laboratori de Berkeley (EUA)'],
    Cf: [1950, 'Laboratori de Berkeley (EUA)'],
    Es: [1952, 'Laboratori de Berkeley, a les restes de la prova termonuclear Ivy Mike'],
    Fm: [1952, 'Laboratori de Berkeley, a les restes de la prova termonuclear Ivy Mike'],
    Md: [1955, 'Laboratori de Berkeley (EUA)'],
    No: [1958, 'Laboratoris de Berkeley (EUA) i Dubna (Rússia); descobriment disputat'],
    Lr: [1961, 'Laboratori de Berkeley (EUA)'],
    Rf: [1964, 'Laboratoris de Dubna (Rússia) i Berkeley (EUA); descobriment disputat'],
    Db: [1967, 'Laboratoris de Dubna (Rússia) i Berkeley (EUA); descobriment disputat'],
    Sg: [1974, 'Laboratori de Berkeley (EUA)'],
    Bh: [1981, 'GSI (Darmstadt, Alemanya)'],
    Hs: [1984, 'GSI (Darmstadt, Alemanya)'],
    Mt: [1982, 'GSI (Darmstadt, Alemanya)'],
    Ds: [1994, 'GSI (Darmstadt, Alemanya)'],
    Rg: [1994, 'GSI (Darmstadt, Alemanya)'],
    Cn: [1996, 'GSI (Darmstadt, Alemanya)'],
    Nh: [2004, 'RIKEN (Japó)'],
    Fl: [1998, 'Dubna (Rússia) i Livermore (EUA)'],
    Mc: [2004, 'Dubna (Rússia) i Livermore (EUA)'],
    Lv: [2000, 'Dubna (Rússia) i Livermore (EUA)'],
    Ts: [2010, 'Dubna (Rússia), Oak Ridge i Vanderbilt (EUA)'],
    Og: [2006, 'Dubna (Rússia) i Livermore (EUA)']
  },

  /* ---------- període de semidesintegració ----------
     Isòtop de vida més llarga de cada element sense isòtops estables (i del bismut,
     que es considera estable a la pràctica).
     [valor, unitat (ms, s, min, h, d, a), nombre màssic, manera de desintegració]
     α = alfa, β⁻ = beta, CE = captura electrònica, FE = fissió espontània.
     Font: NUBASE2020 (Kondev et al., Chinese Physics C 45, 030001) i IAEA LiveChart.
     Els valors dels elements 104-118 són aproximats: es basen en molt pocs àtoms. */
  semivida: {
    Tc: [4.21e6, 'a', 97, 'CE'],
    Pm: [17.7, 'a', 145, 'CE'],
    Bi: [2.01e19, 'a', 209, 'α'],
    Po: [124, 'a', 209, 'α'],
    At: [8.1, 'h', 210, 'CE'],
    Rn: [3.82, 'd', 222, 'α'],
    Fr: [22.0, 'min', 223, 'β⁻'],
    Ra: [1600, 'a', 226, 'α'],
    Ac: [21.8, 'a', 227, 'β⁻'],
    Th: [1.40e10, 'a', 232, 'α'],
    Pa: [3.28e4, 'a', 231, 'α'],
    U: [4.47e9, 'a', 238, 'α'],
    Np: [2.14e6, 'a', 237, 'α'],
    Pu: [8.1e7, 'a', 244, 'α'],
    Am: [7350, 'a', 243, 'α'],
    Cm: [1.56e7, 'a', 247, 'α'],
    Bk: [1380, 'a', 247, 'α'],
    Cf: [898, 'a', 251, 'α'],
    Es: [472, 'd', 252, 'α'],
    Fm: [100.5, 'd', 257, 'α'],
    Md: [51.6, 'd', 258, 'α'],
    No: [58, 'min', 259, 'α'],
    Lr: [11, 'h', 266, 'FE'],
    Rf: [48, 'min', 267, 'FE'],
    Db: [16, 'h', 268, 'FE'],
    Sg: [14, 'min', 269, 'α'],
    Bh: [2.4, 'min', 270, 'α'],
    Hs: [16, 's', 269, 'α'],
    Mt: [4.5, 's', 278, 'α'],
    Ds: [14, 's', 281, 'FE'],
    Rg: [100, 's', 282, 'α'],
    Cn: [30, 's', 285, 'α'],
    Nh: [9.5, 's', 286, 'α'],
    Fl: [1.9, 's', 289, 'α'],
    Mc: [0.65, 's', 290, 'α'],
    Lv: [57, 'ms', 293, 'α'],
    Ts: [51, 'ms', 294, 'α'],
    Og: [0.69, 'ms', 294, 'α']
  },

  /* context per entendre el període de semidesintegració d'alguns elements */
  semividaContext: {
    U: 'S\'ha desintegrat aproximadament la meitat de l\'urani-238 que hi havia quan es va formar la Terra, fa 4.500 milions d\'anys.',
    Th: 'El seu període és més llarg que l\'edat de l\'Univers (13.800 milions d\'anys). Des que es va formar la Terra, només n\'ha desaparegut una cinquena part.',
    Ra: 'Marie Curie el va aïllar el 1902. El radi-226 es forma contínuament a partir de la desintegració de l\'urani.',
    Rn: 'Es forma a partir del radi de les roques i s\'acumula en soterranis mal ventilats: és la principal font natural de radiació que rebem.',
    Po: 'El poloni-210 (138 dies) és l\'isòtop més conegut i el que es troba a la natura.',
    Tc: 'El tecneci-99m (6 hores) s\'utilitza en milions de proves de medicina nuclear cada any.',
    Pu: 'El plutoni-239 (24.100 anys) és el que s\'utilitza als reactors i a les armes nuclears.',
    Am: 'L\'americi-241 (432 anys) és dins dels detectors de fum iònics de moltes cases.',
    Fr: 'És tan inestable que a tota l\'escorça terrestre n\'hi ha, en cada moment, uns 30 grams com a màxim.',
    At: 'És l\'element natural més escàs: a tota l\'escorça terrestre n\'hi ha menys d\'un gram.',
    Bi: 'El seu període (2·10¹⁹ anys) és mil milions de vegades l\'edat de l\'Univers: es considera estable a la pràctica.',
    Pm: 'És l\'únic lantànid sense isòtops estables.',
    Og: 'És l\'element més pesant conegut: cada àtom dura menys d\'una mil·lèsima de segon.'
  },

  /* ---------- nombre màssic de l'isòtop més abundant a la natura ----------
     (per als elements sense isòtops estables, s'usa el de vida més llarga: vegeu semivida)
     Font: IUPAC, Isotopic compositions of the elements 2021 (CIAAW). */
  isotopPrincipal: {
    H: 1, He: 4, Li: 7, Be: 9, B: 11, C: 12, N: 14, O: 16, F: 19, Ne: 20, Na: 23, Mg: 24, Al: 27, Si: 28,
    P: 31, S: 32, Cl: 35, Ar: 40, K: 39, Ca: 40, Sc: 45, Ti: 48, V: 51, Cr: 52, Mn: 55, Fe: 56, Co: 59,
    Ni: 58, Cu: 63, Zn: 64, Ga: 69, Ge: 74, As: 75, Se: 80, Br: 79, Kr: 84, Rb: 85, Sr: 88, Y: 89, Zr: 90,
    Nb: 93, Mo: 98, Ru: 102, Rh: 103, Pd: 106, Ag: 107, Cd: 114, In: 115, Sn: 120, Sb: 121, Te: 130,
    I: 127, Xe: 132, Cs: 133, Ba: 138, La: 139, Ce: 140, Pr: 141, Nd: 142, Sm: 152, Eu: 153, Gd: 158,
    Tb: 159, Dy: 164, Ho: 165, Er: 166, Tm: 169, Yb: 174, Lu: 175, Hf: 180, Ta: 181, W: 184, Re: 187,
    Os: 192, Ir: 193, Pt: 195, Au: 197, Hg: 202, Tl: 205, Pb: 208, Bi: 209, Th: 232, U: 238
  },

  /* ---------- matèries primeres crítiques de la Unió Europea ----------
     Reglament (UE) 2024/1252 (Llei de matèries primeres crítiques), annexos I i II, i
     Comissió Europea, Study on the critical raw materials for the EU (2023).
     [categoria, principal país productor mundial (extracció o primera transformació)]
     estrategica = estratègica i crítica; critica = crítica.
     Alguns elements hi figuren a través del seu mineral: Al (bauxita), Ba (barita),
     F (fluorita), P (roca fosfòrica), C (grafit natural). */
  critiques: {
    Al: ['estrategica', 'Austràlia'], Bi: ['estrategica', 'Xina'], B: ['estrategica', 'Turquia'],
    Co: ['estrategica', 'RD Congo'], Cu: ['estrategica', 'Xile'], Ga: ['estrategica', 'Xina'],
    Ge: ['estrategica', 'Xina'], Li: ['estrategica', 'Austràlia'], Mg: ['estrategica', 'Xina'],
    Mn: ['estrategica', 'Sud-àfrica'], C: ['estrategica', 'Xina'], Ni: ['estrategica', 'Indonèsia'],
    Pt: ['estrategica', 'Sud-àfrica'], Pd: ['estrategica', 'Rússia'], Rh: ['estrategica', 'Sud-àfrica'],
    Ir: ['estrategica', 'Sud-àfrica'], Ru: ['estrategica', 'Sud-àfrica'], Os: ['estrategica', 'Sud-àfrica'],
    Nd: ['estrategica', 'Xina'], Pr: ['estrategica', 'Xina'], Tb: ['estrategica', 'Xina'],
    Dy: ['estrategica', 'Xina'], Gd: ['estrategica', 'Xina'], Sm: ['estrategica', 'Xina'],
    Ce: ['estrategica', 'Xina'], Si: ['estrategica', 'Xina'], Ti: ['estrategica', 'Xina'],
    W: ['estrategica', 'Xina'],
    Sb: ['critica', 'Xina'], As: ['critica', 'Xina'], Ba: ['critica', 'Xina'], Be: ['critica', 'EUA'],
    F: ['critica', 'Xina'], Hf: ['critica', null], He: ['critica', 'EUA'], Er: ['critica', 'Xina'],
    Eu: ['critica', 'Xina'], Ho: ['critica', 'Xina'], Lu: ['critica', 'Xina'], Tm: ['critica', 'Xina'],
    Yb: ['critica', 'Xina'], Y: ['critica', 'Xina'], La: ['critica', 'Xina'], Nb: ['critica', 'Brasil'],
    P: ['critica', 'Xina'], Sc: ['critica', 'Xina'], Sr: ['critica', null], Ta: ['critica', 'RD Congo'],
    V: ['critica', 'Xina']
  },
  /* minerals de conflicte: estany, tàntal, tungstè i or (Reglament (UE) 2017/821) */
  conflicte: ['Sn', 'Ta', 'W', 'Au'],

  /* ---------- color a la flama (assaig a la flama) ----------
     [família de color, nom del color, color aproximat (hex)]
     Fonts: A. I. Vogel, Química analítica qualitativa; Royal Society of Chemistry,
     Practical Chemistry «Flame tests». Els colors de pantalla són aproximats. */
  flama: {
    Li: ['vermell', 'vermell carmí', '#d3123b'],
    Na: ['groc', 'groc intens', '#ffc107'],
    K: ['violeta', 'lila', '#c39bd3'],
    Rb: ['violeta', 'violeta vermellós', '#b5179e'],
    Cs: ['violeta', 'blau violeta', '#7b6fe0'],
    Ca: ['taronja', 'vermell ataronjat', '#ff5a1f'],
    Sr: ['vermell', 'vermell intens', '#e0001b'],
    Ba: ['verd', 'verd poma', '#9acd32'],
    Ra: ['vermell', 'vermell carmí', '#c8102e'],
    Cu: ['verd', 'verd blavós', '#14b8a6'],
    B: ['verd', 'verd brillant', '#22c55e'],
    Tl: ['verd', 'verd pur', '#3cb043'],
    In: ['blau', 'blau indi', '#4b4bd6'],
    Pb: ['blau', 'blau pàl·lid', '#9bbbe0'],
    As: ['blau', 'blau pàl·lid', '#8fb3e8'],
    Se: ['blau', 'blau cel', '#4fa3ff'],
    Sb: ['verd', 'verd pàl·lid', '#b5dfa0'],
    Te: ['verd', 'verd pàl·lid', '#a8d8a0'],
    Zn: ['verd', 'verd blavós pàl·lid', '#9ad9c9'],
    Mo: ['verd', 'verd groguenc', '#c5e063'],
    Mn: ['verd', 'verd groguenc', '#bfd85a'],
    P: ['verd', 'verd blavós pàl·lid', '#a6d8c8'],
    Fe: ['taronja', 'daurat', '#f2a33a']
  },
  /* elements que donen color als focs artificials (com a sals) */
  focs: { Sr: 'vermell', Li: 'vermell', Ca: 'taronja', Na: 'groc', Ba: 'verd', Cu: 'blau (amb clorurs)' },

  /* ---------- fites per a l'animació de la línia del temps ---------- */
  fites: [
    [1650, 'Abans del 1650 ja es coneixien 13 elements, com l\'or, el ferro, el coure o el sofre.'],
    [1669, 'Hennig Brand descobreix el fòsfor: és el primer element amb un descobridor conegut.'],
    [1735, 'Georg Brandt descobreix el cobalt, el primer metall desconegut a l\'antiguitat.'],
    [1774, 'Scheele i Priestley descobreixen l\'oxigen.'],
    [1789, 'Lavoisier publica la primera llista d\'elements químics: 33 «substàncies simples».'],
    [1807, 'Humphry Davy aïlla el sodi i el potassi amb electricitat (electròlisi).'],
    [1860, 'Bunsen i Kirchhoff inventen l\'espectroscòpia i descobreixen el cesi i el rubidi pel color de la seva llum.'],
    [1869, 'Mendeléiev publica la taula periòdica i deixa forats per a elements encara desconeguts.'],
    [1875, 'Es descobreix el gal·li, un dels elements que Mendeléiev havia predit.'],
    [1886, 'Es descobreix el germani: les prediccions de Mendeléiev s\'hi compleixen gairebé exactament.'],
    [1894, 'Rayleigh i Ramsay descobreixen l\'argó, el primer gas noble.'],
    [1898, 'Marie i Pierre Curie descobreixen el poloni i el radi, elements radioactius.'],
    [1913, 'Moseley demostra que els elements s\'ordenen pel nombre atòmic (els protons).'],
    [1937, 'S\'obté el tecneci, el primer element artificial.'],
    [1940, 'Es creen els primers elements més pesants que l\'urani: el neptuni i el plutoni.'],
    [1952, 'L\'einsteini i el fermi apareixen a les restes de la primera bomba d\'hidrogen.'],
    [1955, 'Es crea el mendelevi, àtom a àtom, en un accelerador de partícules.'],
    [1994, 'Els elements nous s\'obtenen de pocs en pocs àtoms i duren fraccions de segon.'],
    [2010, 'Es descobreix el tennes. El 2016 la IUPAC confirma els noms dels últims elements i la setena fila queda completa.']
  ],

  /* ---------- notes que matisen les dades ---------- */
  notes: {
    H: 'Encapçala el grup 1, però no és un metall alcalí.',
    He: 'És del bloc s (1s²), però se situa al grup 18 pel seu comportament de gas noble. Només se solidifica a pressió elevada (unes 25 atm).',
    C: 'A pressió atmosfèrica no es fon: sublima a uns 3900 K. La conductivitat elèctrica correspon al grafit; el diamant és aïllant.',
    As: 'A pressió atmosfèrica sublima a 887 K (614 °C); el punt de fusió indicat és sota pressió.',
    Ga: 'Es fon a 29,8 °C: es fon a la mà.',
    Cs: 'Es fon a 28,5 °C, una mica per sobre de la temperatura ambient.',
    Br: 'És un dels dos elements líquids a temperatura ambient, amb el mercuri.',
    Hg: 'És un dels dos elements líquids a temperatura ambient, amb el brom.',
    Gd: 'És ferromagnètic només per sota d\'uns 20 °C (temperatura de Curie, 293 K).',
    Bi: 'Tècnicament és radioactiu, però el seu període de semidesintegració (≈2·10¹⁹ anys) és tan llarg que es considera estable.',
    Po: 'La seva classificació (metall o semimetall) és debatuda.',
    At: 'La seva classificació és debatuda: algunes taules el consideren semimetall o fins i tot metall.',
    Tc: 'És l\'element més lleuger sense cap isòtop estable. Se\'n troben traces a la natura.',
    Pm: 'No té isòtops estables. Se\'n troben traces a la natura.',
    Xe: 'Tot i ser un gas noble, forma alguns compostos (amb estats +2, +4, +6 i +8), com el XeF₄.',
    Kr: 'Tot i ser un gas noble, forma algun compost (KrF₂).',
    La: 'La seva posició (bloc f o grup 3) és objecte de debat a la IUPAC.',
    Lu: 'Alguns químics el situen al grup 3, en lloc del lantani.',
    Ac: 'La seva posició (bloc f o grup 3) és objecte de debat a la IUPAC.',
    Lr: 'Alguns químics el situen al grup 3, en lloc de l\'actini.'
  }
};

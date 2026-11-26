/* Dades didàctiques del visor 3D interactiu (18 models Blender: vapor, cotó, camp, fàbrica, metalls, tren i vaixells) */
/* SPDX-License-Identifier: AGPL-3.0-or-later AND CC-BY-NC-SA-4.0 */
window.RI_VISOR3D_DADES = {
  newcomen: {
    titol: 'La màquina atmosfèrica de Newcomen',
    subtitol: '1712 · Thomas Newcomen · Caldera directament sota el cilindre obert, raig d’aigua freda interior i força atmosfèrica per bombar aigua de les mines.',
    badge: 'MODEL 3D',
    eyebrow: '1712 · Thomas Newcomen · La primera màquina de vapor útil',
    backHref: 'vapor.html#newcomen',
    backLabel: 'Tornar al capítol del vapor',
    glb: 'assets/models/newcomen.glb',
    poster: 'assets/blender/out/newcomen-muntada.png',
    cameraOrbit: '22deg 74deg 14.8m',
    cameraTarget: '0.55m 2.55m 0m',
    fov: '36deg',
    detallImg: 'assets/blender/out/newcomen-detall.png',
    detallAlt: 'Detall de la caldera de coure directament sota el cilindre obert, amb el dipòsit d’aigua freda elevat i els tubs d’injecció i desguàs',
    detallL: '1–5 · Caldera, cilindre obert i injecció freda',
    detallR: 'acosta al detall ↗',
    detallOrbit: '12deg 74deg 5.8m',
    detallTarget: '-1.95m 3.0m 0m',
    ideaTitol: 'Fer el buit dins el mateix cilindre',
    ideaHtml: 'El vapor es refreda amb un raig d’aigua freda <strong>dins del propi cilindre</strong>. L’aire exterior empeny el pistó avall, però a cada cicle s’ha de tornar a escalfar tot el metall: es malgasta molt de carbó.',
    flowBtnLabel: 'Curs del vapor i l’aigua freda',
    legendHot: 'Vapor càlid i aire atmosfèric',
    legendCold: 'Aigua freda d’injecció / desguàs',
    fonamentHtml: 'Reconstrucció didàctica de 1712: caldera tipus paller directament sota un cilindre obert amb segell d’aigua i injecció directa. Fonament: <a href="https://blog.sciencemuseum.org.uk/newcomen-engine/" target="_blank" rel="noopener">Science Museum · Newcomen 1712</a> i exemplar conservat del Black Country.',
    hotspots: {
      caldera: { num: 1, titol: 'Caldera i fogar sota el cilindre', text: 'Caldera de coure tipus paller muntada directament sobre el fogar de maó i sota la base del cilindre.', pos3d: [-1.65, 2.15, 0.9] },
      cilindre: { num: 2, titol: 'Cilindre obert per dalt', text: 'A diferència del de Watt, el cim és obert a l’aire: el cilindre s’escalfa amb vapor i es refreda amb aigua a cada cop.', pos3d: [-1.15, 4.05, 0.45] },
      piston: { num: 3, titol: 'Pistó amb segell d’aigua', text: 'Una fina làmina d’aigua freda al damunt segella l’ajust i evita que l’aire es coli quan es fa el buit a sota.', pos3d: [-1.65, 4.36, 0.45] },
      balanci: { num: 4, titol: 'Balancí simètric amb cadenes', text: 'La cadena només pot estirar: el contrapès de la bomba fa pujar el pistó i el buit l’estira cap avall.', pos3d: [0.2, 5.78, 0.22] },
      diposit: { num: 5, titol: 'Dipòsit d’aigua freda i injecció', text: 'Dipòsit elevat de plom que envia un raig directe a l’interior del cilindre per condensar el vapor de cop.', pos3d: [-3.28, 4.0, 0.42] },
      desguas: { num: 6, titol: 'Tub de desguàs i pou calent', text: 'Evacua l’aigua escalfada després de cada condensació cap a una tina de fusta lateral.', pos3d: [-3.28, 0.85, 0.36] },
      bombamina: { num: 7, titol: 'Vareta pesada i bomba de mina', text: 'El bloc de contrapès sobre la vareta compensa el pistó durant l’admissió de vapor i eleva l’aigua en el cop motriu.', pos3d: [4.25, 1.45, 0.28] }
    },
    flows: [
      { id: 'n-vap', cls: 'fl-hot', lbl: 'vapor ascendent', fases: [0], from: 'caldera', to: 'cilindre', dx1: 0, dy1: -10, dx2: 0, dy2: 12, ctrlDx: -14, ctrlDy: 0, lblDx: -26, lblDy: -4 },
      { id: 'n-inj', cls: 'fl-cold', lbl: 'raig d’aigua freda', fases: [1], from: 'diposit', to: 'cilindre', dx1: 8, dy1: 8, dx2: -10, dy2: 4, ctrlDx: 10, ctrlDy: 16, lblDx: 12, lblDy: 16 },
      { id: 'n-atm', cls: 'fl-eq', lbl: 'pressió aire (1 atm)', fases: [2], from: 'balanci', to: 'piston', dx1: -16, dy1: 4, dx2: 6, dy2: -14, ctrlDx: -12, ctrlDy: -16, lblDx: -10, lblDy: -10 },
      { id: 'n-des', cls: 'fl-cold', lbl: 'aigua condensada', fases: [3], from: 'cilindre', to: 'desguas', dx1: -12, dy1: 14, dx2: 10, dy2: -10, ctrlDx: -18, ctrlDy: 4, lblDx: -16, lblDy: 8 }
    ],
    fases: [
      {
        curt: 'Admissió de vapor',
        titol: 'El vapor omple el cilindre',
        desc: 'S’obre la vàlvula de la caldera: el vapor entra a baixa pressió mentre el pes de la vareta de la bomba fa pujar el pistó.',
        pMin: 0.00,
        pJump: 0.16,
        chips: [['Vapor: admès', 'oberta'], ['Injecció: tancada', 'tancada'], ['Vareta: baixa per pes', '']]
      },
      {
        curt: 'Raig d’aigua freda',
        titol: 'Injecció freda i condensació',
        desc: 'Es tanca el vapor i entra un raig d’aigua freda dins del cilindre; el vapor es condensa de cop i deixa buit a sota.',
        pMin: 0.34,
        pJump: 0.40,
        chips: [['Vapor: tancat', 'tancada'], ['Injecció: oberta', 'oberta'], ['Cilindre: es refreda', '']]
      },
      {
        curt: 'Cop atmosfèric',
        titol: 'L’aire empeny el pistó avall',
        desc: 'La pressió de l’atmosfera sobre el pistó obert el fa baixar amb força, bascula el balancí i puja l’aigua de la mina.',
        pMin: 0.47,
        pJump: 0.68,
        chips: [['Aire 1 atm: empeny', 'oberta'], ['Buit sota pistó', 'oberta'], ['Bomba: puja aigua', 'oberta']]
      },
      {
        curt: 'Desguàs i pèrdua tèrmica',
        titol: 'Desguàs i reescalfament',
        desc: 'Surt l’aigua tèbia pel desguàs. El cilindre ha quedat fred i el nou vapor n’haurà de recuperar tota la temperatura.',
        pMin: 0.84,
        pJump: 0.92,
        chips: [['Desguàs: evacua', 'oberta'], ['Pèrdua de calor alta', 'tancada']]
      }
    ]
  },

  watt: {
    titol: 'El cilindre calent, el condensador fred',
    subtitol: '1769 · James Watt · Màquina atmosfèrica perfeccionada amb camisa de vapor, tub d’equilibri i condensador separat.',
    badge: 'MODEL 3D',
    eyebrow: '1769 · James Watt · Energia tèrmica',
    backHref: 'vapor.html#watt',
    backLabel: 'Tornar al capítol del vapor',
    glb: 'assets/models/watt.glb',
    poster: 'assets/blender/out/watt-muntada.png',
    cameraOrbit: '22deg 74deg 15.2m',
    cameraTarget: '0.45m 2.4m 0m',
    fov: '36deg',
    detallImg: 'assets/blender/out/watt-detall.png',
    detallAlt: 'Detall ampliat del cilindre calent seccionat al costat del condensador fred amb gotes de condensació',
    detallL: '2–3 · Cilindre calent → 6 · Condensador',
    detallR: 'acosta al detall ↗',
    detallOrbit: '8deg 72deg 6.8m',
    detallTarget: '-0.85m 2.05m 0m',
    ideaTitol: 'Separar el fred de la calor',
    ideaHtml: 'El vapor es refreda en un recipient <strong>separat</strong> (condensador). Així el cilindre es manté sempre calent i no es malgasta carbó reescalfant-lo a cada cicle (estalvi de fins al <strong>75 % de carbó</strong>).',
    flowBtnLabel: 'Curs d’aigua calenta i freda',
    legendHot: 'Vapor / aigua calenta',
    legendCold: 'Aigua freda / condensat',
    fonamentHtml: 'Reconstrucció didàctica de 1769: combina camisa anular, vàlvules d’equilibri i condensador seccionat. Fonament històric: <a href="https://blog.sciencemuseum.org.uk/james-watt-and-the-separate-condenser/" target="_blank" rel="noopener">Science Museum (condensador separat)</a> i <a href="https://collection.sciencemuseumgroup.org.uk/objects/co50928/watts-second-separate-condenser-1765-condensers" target="_blank" rel="noopener">model de 1765</a>.',
    hotspots: {
      caldera: { num: 1, titol: 'Caldera i fogar', text: 'Ara és a part del cilindre, reblonada en doble anell, amb arc de maó, vàlvula de seguretat amb contrapès, manòmetre i nivell d’aigua.', pos3d: [-3.95, 2.74, 0.88] },
      camisa: { num: 2, titol: 'Camisa de vapor', text: 'Doble paret amb vapor càlid envoltant el cilindre interior (talls vermells): manté les parets sempre calentes sense malgastar calor.', pos3d: [-2.28, 2.55, 0.45] },
      cilindre: { num: 3, titol: 'Cilindre tancat', text: 'Tapat per dalt amb premsaestopes i brida de 10 perns: el pistó l’empeny el vapor viu, no la pressió atmosfèrica.', pos3d: [-1.18, 3.02, 0.42] },
      piston: { num: 4, titol: 'Pistó i cadena articulada', text: 'Baixa quan té vapor a sobre i buit a sota, estirat per una cadena plana amb passadors sobre el sector circular del balancí.', pos3d: [-1.68, 2.606, 0.48] },
      equilibri: { num: 5, titol: 'Tub d’equilibri i vàlvules', text: 'Comunica la part superior i inferior del cilindre mitjançant tres vàlvules animades perquè el pistó pugui tornar a pujar.', pos3d: [-0.77, 2.58, 0.22] },
      condensador: { num: 6, titol: 'Condensador separat (seccionat)', text: 'La gran innovació de Watt (1769): recipient immers en la tina d’aigua freda amb injecció freda i gotes de condensació.', pos3d: [0.02, 1.30, 0.36] },
      bomba: { num: 7, titol: 'Bomba d’aire (seccionada)', text: 'Immersa al costat del condensador i moguda pel balancí: l’èmbol i la vàlvula de peu extreuen aigua i aire per mantenir el buit.', pos3d: [0.76, 1.40, 0.28] },
      balanci: { num: 8, titol: 'Balancí amb puntal i arcs', text: 'Biga de roure afuada amb tires laterals de ferro, perns passants, tirants i sectors circulars concèntrics (arch-heads).', pos3d: [0.85, 5.11, 0.22] },
      bombamina: { num: 9, titol: 'Bomba i canaleta de la mina', text: 'Aspira l’aigua del pou de carreus i l’aboca per la canaleta cap a la bassa, fent la mateixa feina amb molt menys carbó.', pos3d: [4.45, 1.35, 0.28] }
    },
    flows: [
      { id: 'w-hot', cls: 'fl-hot', lbl: 'vapor calent', fases: [0, 1], from: 'caldera', to: 'cilindre', dx1: 6, dy1: -34, dx2: -14, dy2: -32, ctrlDy: -22, lblDy: -6 },
      { id: 'w-exh', cls: 'fl-hot', lbl: 'vapor usat', fases: [0, 1], from: 'equilibri', to: 'condensador', dx1: -4, dy1: -10, dx2: -8, dy2: -12, ctrlDy: -16, lblDy: -6 },
      { id: 'w-eq', cls: 'fl-eq', lbl: 'retorn equilibri', fases: [2, 3], from: 'equilibri', to: 'piston', dx1: 14, dy1: -16, dx2: 12, dy2: 20, ctrlDx: 18, ctrlDy: 0, lblDx: 24, lblDy: 4 },
      { id: 'w-inj', cls: 'fl-cold', lbl: 'injecció freda', fases: [0, 1], from: 'condensador', dx1: -34, dy1: 14, dx2: 26, dy2: -10, ctrlDy: 6, lblDx: -24, lblDy: 15 },
      { id: 'w-cnd', cls: 'fl-cold', lbl: 'condensat', fases: [1, 3], from: 'condensador', to: 'bomba', dx1: 8, dy1: 12, dx2: 0, dy2: 12, ctrlDy: 4, lblDx: 22, lblDy: 16 },
      { id: 'w-min', cls: 'fl-cold', lbl: 'aigua pujada', fases: [0, 1], from: 'bombamina', dx1: 0, dy1: 22, dx2: 38, dy2: -30, ctrlDx: 6, ctrlDy: -22, lblDx: 18, lblDy: -6 }
    ],
    fases: [
      {
        curt: 'Vapor i buit',
        titol: 'Vapor i buit',
        desc: 'Entra vapor calent per dalt del pistó i l’escapament obert crea buit al condensador fred.',
        pMin: 0.00,
        pJump: 0.10,
        chips: [['Admissió: oberta', 'oberta'], ['Equilibri: tancada', 'tancada'], ['Escapament: oberta', 'oberta']]
      },
      {
        curt: 'Pistó avall',
        titol: 'Pistó avall',
        desc: 'La diferència de pressions empeny el pistó cap avall; el balancí puja l’aigua de la mina.',
        pMin: 0.23,
        pJump: 0.32,
        chips: [['Admissió: oberta', 'oberta'], ['Equilibri: tancada', 'tancada'], ['Escapament: oberta', 'oberta']]
      },
      {
        curt: 'Canvi de vàlvules',
        titol: 'Canvi de vàlvules',
        desc: 'Punt mort inferior: es tanquen admissió i escapament i s’obre el pas d’equilibri.',
        pMin: 0.48,
        pJump: 0.50,
        chips: [['Admissió: tancada', 'tancada'], ['Equilibri: oberta', 'oberta'], ['Escapament: tancada', 'tancada']]
      },
      {
        curt: 'Retorn d’equilibri',
        titol: 'Retorn d’equilibri',
        desc: 'El vapor passa per darrere el tub d’equilibri; el pistó puja i el cilindre continua calent.',
        pMin: 0.52,
        pJump: 0.75,
        chips: [['Admissió: tancada', 'tancada'], ['Equilibri: oberta', 'oberta'], ['Escapament: tancada', 'tancada']]
      }
    ]
  },

  llancadora: {
    titol: 'La llançadora volant de John Kay',
    subtitol: '1733 · John Kay · Caixes laterals, tacos de cuir sobre varetes d’acer i cordill en V que dupliquen la velocitat del teixit.',
    badge: 'MODEL 3D',
    eyebrow: '1733 · John Kay · La primera peça clau del tèxtil',
    backHref: 'textil.html#llancadora',
    backLabel: 'Tornar al capítol del tèxtil',
    glb: 'assets/models/llancadora.glb',
    poster: 'assets/blender/out/llancadora-muntada.png',
    cameraOrbit: '36deg 72deg 5.6m',
    cameraTarget: '0.02m 0.92m 0.05m',
    fov: '36deg',
    detallImg: 'assets/blender/out/llancadora-detall.png',
    detallAlt: 'Detall de les caixes de llançadora, taco sobre vareta d’acer, pinta, cordill en V i teixit a ratlles',
    detallL: '3–4 · Caixa, taco i cordill en V',
    detallR: 'acosta al detall ↗',
    detallOrbit: '28deg 74deg 2.2m',
    detallTarget: '-0.35m 0.92m 0.05m',
    ideaTitol: 'Teixir més ample amb una sola mà',
    ideaHtml: 'Amb una sola estrebada del <strong>cordill central en V</strong>, un taco colpeja la llançadora amb punxes d’acer i la fa volar fins a l’altra caixa. Un sol teixidor fa peces molt més amples al <strong>doble de velocitat</strong> i deixa sense prou fil les filadores.',
    flowBtnLabel: 'Trajecte de la llançadora i calada',
    legendHot: 'Vol i cops de trama',
    legendCold: 'Moviment de lliços i pinta',
    fonamentHtml: 'Reconstrucció segons els models preservats de la col·lecció tèxtil britànica: <a href="https://collection.sciencemuseumgroup.org.uk/objects/co43043/kays-flying-shuttle-1733-model" target="_blank" rel="noopener">Science Museum Group (model de Kay, 1733)</a> i <a href="https://www.nts.org.uk/visit/places/weavers-cottage" target="_blank" rel="noopener">Weaver’s Cottage (Kilbarchan)</a>.',
    hotspots: {
      ordit: { num: 1, titol: 'Ordit i plegador posterior', text: 'Fils longitudinals tensats sobre el plegador de roure posterior i separats en dues capes (parells i senars) per obrir la calada.', pos3d: [-0.68, 0.92, -0.58] },
      llancadora: { num: 2, titol: 'Llançadora volant amb punxes', text: 'Cos de fusta dura acabat en punxes d’acer i canilla interior vermella que deixa el fil de trama en creuar la calada.', pos3d: [0.12, 0.92, -0.08] },
      caixes: { num: 3, titol: 'Caixes laterals i tacos de cuir', text: 'Prolonguen la pista del batà pels dos extrems: el taco de cuir llisca per una vareta d’acer i dispara la llançadora.', pos3d: [-1.22, 0.92, -0.08] },
      cordill: { num: 4, titol: 'Cordill en V i mànec central', text: 'Uneix tots dos tacos a un sol mànec penjant: el teixidor l’estreba amb una mà mentre amb l’altra mou el batà.', pos3d: [-0.02, 1.38, 0.08] },
      pinta: { num: 5, titol: 'Pinta i batà oscil·lant', text: 'Marc suspès des de dalt amb pues d’acer que guien la llançadora i baten cada passada contra la vora del teixit.', pos3d: [0.48, 1.06, -0.10] },
      tela: { num: 6, titol: 'Teixit acabat i plegador', text: 'La tela passa sobre el davantal frontal i s’enrotlla al plegador inferior amb roda de dents de llautó i manovella.', pos3d: [0.00, 0.90, 0.64] },
      bastidor: { num: 7, titol: 'Bastidor de roure anglès', text: 'Estructura sòlida de bigues ensamblades a caixa i metxa que absorbeix els cops del batà i la tensió de l’ordit.', pos3d: [-1.04, 1.48, 0.84] },
      llicos: { num: 8, titol: 'Lliços i pedals alternats', text: 'Dos marcs amb ullets connectats als pedals dels peus: pugen una meitat de l’ordit i baixen l’altra a cada passada.', pos3d: [-0.25, 1.18, -0.32] }
    },
    flows: [
      { id: 'll-vol', cls: 'fl-hot', lbl: 'vol d’anada i tornada', fases: [1, 3], from: 'caixes', to: 'pinta', dx1: 6, dy1: -8, dx2: 24, dy2: 14, ctrlDy: -40, lblDy: -10 },
      { id: 'll-estreb', cls: 'fl-hot', lbl: 'estrebada manual', fases: [1, 3], from: 'cordill', to: 'llancadora', dx1: 0, dy1: 4, dx2: 0, dy2: -8, ctrlDx: 10, ctrlDy: -4, lblDx: 28, lblDy: 0 },
      { id: 'll-calada', cls: 'fl-cold', lbl: 'pujada i baixada', fases: [0, 3], from: 'llicos', to: 'ordit', dx1: 0, dy1: -10, dx2: 0, dy2: 10, ctrlDx: -14, ctrlDy: 0, lblDx: -42, lblDy: 2 },
      { id: 'll-batuda', cls: 'fl-eq', lbl: 'batuda del teixit', fases: [2], from: 'pinta', to: 'tela', dx1: -8, dy1: 12, dx2: 8, dy2: -6, ctrlDy: 6, lblDy: 12 }
    ],
    fases: [
      {
        curt: 'Obrir calada',
        titol: 'Obrir calada',
        desc: 'Els pedals baixen i separen els lliços parells i senars per obrir el túnel triangular de l’ordit.',
        pMin: 0.00,
        pJump: 0.10,
        chips: [['Pedals: pas 1', 'oberta'], ['Taco: en repòs', 'tancada'], ['Batà: enrere', 'tancada']]
      },
      {
        curt: 'Estrebada i vol',
        titol: 'Estrebada i vol',
        desc: 'Una estrebada del mànec en V dispara el taco esquerre; la llançadora creua tota l’amplada d’un sol cop.',
        pMin: 0.16,
        pJump: 0.27,
        chips: [['Cordill: estrebada', 'oberta'], ['Llançadora: esq → dreta', 'oberta'], ['Batà: guia la pista', '']]
      },
      {
        curt: 'Batuda de pinta',
        titol: 'Batuda de pinta',
        desc: 'La mà lliure tira el batà cap endavant: la pinta d’acer premsa el nou fil de trama contra la tela.',
        pMin: 0.39,
        pJump: 0.48,
        chips: [['Pinta: bat endavant', 'oberta'], ['Trama: premuda', 'oberta'], ['Lliços: fixos', 'tancada']]
      },
      {
        curt: 'Canvi i retorn',
        titol: 'Canvi i retorn',
        desc: 'S’inverteixen els lliços per atrapar la trama i el taco dret torna la llançadora cap a la caixa inicial.',
        pMin: 0.56,
        pJump: 0.77,
        chips: [['Lliços: invertits', 'oberta'], ['Llançadora: dreta → esq', 'oberta'], ['Tela: s’enrotlla', '']]
      }
    ]
  },

  mula: {
    titol: 'La mula de filar (Mule-Jenny)',
    subtitol: '1779 · Samuel Crompton · Híbrid dels corrons d’Arkwright i el carro mòbil de Hargreaves per obtenir fil fi i resistent.',
    badge: 'MODEL 3D',
    eyebrow: '1779 · Samuel Crompton · Revolució en la filatura',
    backHref: 'textil.html#mula',
    backLabel: 'Tornar al capítol del tèxtil',
    glb: 'assets/models/mula.glb',
    poster: 'assets/blender/out/mula-muntada.png',
    cameraOrbit: '22deg 72deg 4.2m',
    cameraTarget: '0.02m 0.85m 0.05m',
    fov: '36deg',
    detallImg: 'assets/blender/out/mula-detall.png',
    detallAlt: 'Detall dels tres parells de corrons d’estiratge amb engranatges de llautó, pesos, fusos inclinats i fil-guia',
    detallL: '2 · Corrons d’estiratge i 4 · Fusos',
    detallR: 'acosta al detall ↗',
    detallOrbit: '16deg 74deg 2.0m',
    detallTarget: '-0.48m 1.02m 0.05m',
    ideaTitol: 'Estirar en dues fases per no trencar el fil',
    ideaHtml: 'Primer els <strong>tres parells de corrons</strong> estiren la metxa abans d’entregar-la al carro; després els corrons s’aturen i el <strong>carro s’allunya encara una mica</strong> mentre els fusos inclinats hi afegeixen torsió extra. Així surt un fil molt fi i resistent, que permet teixir a mà teles fines com la mussolina.',
    flowBtnLabel: 'Pas del fil i recorregut del carro',
    legendHot: 'Trajecte i tensió del fil',
    legendCold: 'Anada i tornada del carro',
    fonamentHtml: 'Basat en la primera mula de fusta conservada de Samuel Crompton (c. 1780): <a href="https://boltonlams.co.uk/museum/crompton/" target="_blank" rel="noopener">Bolton Museum — Hall i’ th’ Wood</a>.',
    hotspots: {
      fileta: { num: 1, titol: 'Fileta de metxes de cotó', text: 'Prestatge inclinat amb 6 bobines de cotó cardat (rovings) que alimenten sense tensió els corrons posteriors.', pos3d: [-1.04, 1.48, 0.35] },
      corrons: { num: 2, titol: 'Tres parells de corrons i engranatges', text: 'Roden a velocitat creixent (1×, 1,6× i 3,2×) amb pesos penjants i rodes de llautó externes per aprimar la metxa.', pos3d: [-0.54, 1.03, 0.85] },
      carro: { num: 3, titol: 'Carro mòbil sobre rails', text: 'Plataforma amb quatre rodes de pestanya que s’allunya estirant el fil i torna cap als corrons per enrotllar-lo.', pos3d: [0.72, 0.42, 0.88] },
      fus: { num: 4, titol: 'Fusos inclinats, fusades i fil-guia', text: 'Inclinats uns 14° cap als corrons perquè el fil llisqui per la punta mentre torça; el fil-guia el baixa per fer la fusada.', pos3d: [0.55, 0.98, 0.45] },
      bastidor: { num: 5, titol: 'Bastidor fix de roure', text: 'Sosté la fileta superior i els suports de fosa dels corrons d’estiratge alineats amb els rails del terra.', pos3d: [-1.16, 0.88, 1.04] },
      roda: { num: 6, titol: 'Roda manual i corró de llauna', text: 'El filador gira la roda amb manovella i fa moure per corretja el corró de llauna longitudinal que acciona tots els fusos alhora.', pos3d: [-0.35, 0.9, 1.3] }
    },
    flows: [
      { id: 'mu-fil', cls: 'fl-hot', lbl: 'estiratge de la metxa', fases: [0, 1], from: 'fileta', to: 'corrons', dx1: 6, dy1: 8, dx2: -8, dy2: -4, ctrlDy: -6, lblDy: -8 },
      { id: 'mu-torsio', cls: 'fl-hot', lbl: 'torsió fina a la punta', fases: [0, 1, 2], from: 'corrons', to: 'fus', dx1: 12, dy1: 0, dx2: -8, dy2: -6, ctrlDy: -14, lblDy: -8 },
      { id: 'mu-surt', cls: 'fl-cold', lbl: 'carro surt (1,5 m)', fases: [0, 1], from: 'carro', dx1: -28, dy1: 12, dx2: 56, dy2: 0, ctrlDy: 10, lblDx: 8, lblDy: 16 },
      { id: 'mu-torna', cls: 'fl-eq', lbl: 'retorn i enrotllament', fases: [2, 3], from: 'fus', to: 'corrons', dx1: -6, dy1: 18, dx2: 26, dy2: 24, ctrlDy: 24, lblDy: 18 }
    ],
    fases: [
      {
        curt: 'Estiratge i torsió',
        titol: 'Estiratge i torsió',
        desc: 'Els tres corrons giren entregant metxa estiramassada mentre el carro surt i els fusos apliquen la primera torsió.',
        pMin: 0.00,
        pJump: 0.20,
        chips: [['Corrons: en marxa', 'oberta'], ['Carro: s’allunya', 'oberta'], ['Fil-guia: amunt', 'tancada']]
      },
      {
        curt: 'Estiratge fi',
        titol: 'Estiratge fi (after-draft)',
        desc: 'Els corrons s’aturen de cop, però el carro avança encara uns centímetres tot torçant els trams gruixuts fins igualar el gruix.',
        pMin: 0.38,
        pJump: 0.47,
        chips: [['Corrons: aturats', 'tancada'], ['Carro: tram final', 'oberta'], ['Fusos: màxima torsió', 'oberta']]
      },
      {
        curt: 'Descàrrega i fil-guia',
        titol: 'Descàrrega i baixada del fil-guia',
        desc: 'Els fusos fan un breu gir invers per alliberar les espires de la punta i la barra del fil-guia prem el fil cap avall.',
        pMin: 0.55,
        pJump: 0.62,
        chips: [['Corrons: aturats', 'tancada'], ['Fusos: descarreguen', ''], ['Fil-guia: baixa', 'oberta']]
      },
      {
        curt: 'Enrotllament',
        titol: 'Retorn del carro i enrotllament',
        desc: 'El carro torna cap als corrons mentre els fusos recullen ordenadament el fil fi damunt de cada fusada cònica.',
        pMin: 0.67,
        pJump: 0.82,
        chips: [['Carro: torna endins', 'oberta'], ['Fusades: recullen fil', 'oberta'], ['Fil-guia: guia la capa', 'oberta']]
      }
    ]
  },

  jenny: {
    titol: 'La Spinning Jenny de Hargreaves',
    subtitol: '1764–1770 · James Hargreaves · Pinça mòbil sobre carrils inclinats i gran roda manual per filar vuit fils alhora.',
    badge: 'MODEL 3D',
    eyebrow: '1764–1770 · James Hargreaves · Multiplicar els fusos manuals',
    backHref: 'textil.html#jenny',
    backLabel: 'Tornar al capítol del tèxtil',
    glb: 'assets/models/jenny.glb',
    poster: 'assets/blender/out/jenny-muntada.png',
    cameraOrbit: '36deg 66deg 3.7m',
    cameraTarget: '0.05m 0.65m 0.05m',
    fov: '36deg',
    detallImg: 'assets/blender/out/jenny-detall.png',
    detallAlt: 'Detall de la pinça mòbil lliscant, les fusades còniques de fil, les torteres de llautó i el tambor inferior d’estany',
    detallL: '2–5 · Pinça, fusos i cordons de transmissió',
    detallR: 'acosta al detall ↗',
    detallOrbit: '42deg 64deg 2.0m',
    detallTarget: '0.05m 0.85m 0.25m',
    ideaTitol: 'Una sola mà mou molts fusos alhora',
    ideaHtml: 'La <strong>pinça de fusta</strong> substitueix els dits que retenen la metxa mentre la mà dreta gira la <strong>roda</strong>. Així un sol treballador estira, torça i plega múltiples fils al mateix temps sense energia hidràulica ni vapor.',
    flowBtnLabel: 'Recorregut de filatura i transmissió',
    legendHot: 'Rotació roda -> tambor -> fusos',
    legendCold: 'Estiratge de metxa a fusada',
    fonamentHtml: 'Reconstrucció didàctica basada en la patent de Hargreaves (1770) i l’exemplar conservat al <a href="https://lancashiremuseumsstories.wordpress.com/2020/05/29/james-hargreaves-and-the-spinning-jenny/" target="_blank" rel="noopener">North Mill Museum · Belper</a>.',
    hotspots: {
      metxes: { num: 1, titol: 'Bobines de metxa cardada', text: 'Prestatge inclinat amb 8 bobines de cotó tou encara sense tòrcer que passen per ulls de llautó cap a la pinça.', pos3d: [-0.3, 0.45, 0.22] },
      pinca: { num: 2, titol: 'Carro mòbil de la pinça', text: 'Llisca sobre rodetes de llautó al llarg dels carrils inclinats; quan es tanca i recula, aprima totes les metxes alhora.', pos3d: [0.0, 0.96, 0.18] },
      fusos: { num: 3, titol: 'Banc de 8 fusos i fil guia', text: 'Fusos d’acer inclinats amb fusades còniques i una barra de llautó basculant (faller wire) per repartir el fil plegat.', pos3d: [-0.25, 1.12, -0.52] },
      roda: { num: 4, titol: 'Gran roda manual amb maneta', text: 'Girada amb la mà dreta del filador; transmet el moviment multiplicat al tambor inferior d’estany.', pos3d: [0.84, 0.92, -0.02] },
      corda: { num: 5, titol: 'Tambor d’estany i cordes', text: 'El tambor cilíndric rep la corretja de la roda i reparteix el gir mitjançant cordills sense fi cap a cada tortera.', pos3d: [0.62, 0.56, -0.38] },
      bastidor: { num: 6, titol: 'Bastidor domèstic de roure', text: 'Estructura lleugera amb carrils inclinats que cap dins d’un taller domèstic sense necessitat de força hidràulica.', pos3d: [-0.72, 0.62, 0.82] }
    },
    flows: [
      { id: 'jn-metxa', cls: 'fl-cold', lbl: 'estiratge cap al fus', fases: [0, 1], from: 'metxes', to: 'pinca', dx1: 6, dy1: -10, dx2: -8, dy2: 10, ctrlDy: -10, lblDy: -6 },
      { id: 'jn-fil', cls: 'fl-cold', lbl: 'torsió en fus', fases: [1, 2], from: 'pinca', to: 'fusos', dx1: 6, dy1: -8, dx2: -10, dy2: 8, ctrlDy: -12, lblDy: -8 },
      { id: 'jn-roda', cls: 'fl-hot', lbl: 'corretja al tambor', fases: [1, 2, 3], from: 'roda', to: 'corda', dx1: -10, dy1: 8, dx2: 8, dy2: -8, ctrlDy: 10, lblDy: 8 },
      { id: 'jn-corda', cls: 'fl-hot', lbl: 'cordills als fusos', fases: [1, 3], from: 'corda', to: 'fusos', dx1: -12, dy1: -8, dx2: 14, dy2: 10, ctrlDx: 10, ctrlDy: -12, lblDx: 12, lblDy: -6 }
    ],
    fases: [
      {
        curt: 'Alimentar metxa',
        titol: 'Obertura de pinça i entrada de metxa',
        desc: 'La pinça s’obre breument prop dels fusos i deixa passar un tram nou de metxa tova de cotó des de les bobines inferiors.',
        pMin: 0.00,
        pJump: 0.06,
        chips: [['Pinça: oberta', 'oberta'], ['Carro: endavant', ''], ['Metxa: entra', 'oberta']]
      },
      {
        curt: 'Estirar i tòrcer',
        titol: 'Retrocés de pinça i torsió simultània',
        desc: 'La mordassa es tanca i el carro recula estirant els vuit fils mentre la roda manual fa girar ràpidament tots els fusos.',
        pMin: 0.12,
        pJump: 0.34,
        chips: [['Pinça: tancada', 'tancada'], ['Roda: gira', 'oberta'], ['Fils: s’aprimen i torcen', 'oberta']]
      },
      {
        curt: 'Descarregar i fil-guia',
        titol: 'Breu inversió i baixada del fil-guia',
        desc: 'Un petit gir invers allibera l’espiral de la punta del fus i la barra del fil-guia prem els fils cap a la panxa de la fusada.',
        pMin: 0.52,
        pJump: 0.60,
        chips: [['Roda: breu inversió', ''], ['Fil-guia: baixa', 'oberta'], ['Carro: aturat', 'tancada']]
      },
      {
        curt: 'Plegar en fusades',
        titol: 'Retorn del carro i bobinatge',
        desc: 'El carro torna cap als fusos mentre la roda gira suavament i enrotlla els vuit fils acabats damunt de cada fusada cònica.',
        pMin: 0.66,
        pJump: 0.80,
        chips: [['Carro: retorna', 'oberta'], ['Fusades: creixen', 'oberta']]
      }
    ]
  },

  water: {
    titol: 'El Water Frame d’Arkwright',
    subtitol: '1769–1775 · Richard Arkwright · Tres parells de corrons amb velocitat creixent, aletes giratòries i energia hidràulica en continu.',
    badge: 'MODEL 3D',
    eyebrow: '1769–1775 · Richard Arkwright · El pas cap a la fàbrica',
    backHref: 'textil.html#water',
    backLabel: 'Tornar al capítol del tèxtil',
    glb: 'assets/models/water.glb',
    poster: 'assets/blender/out/water-muntada.png',
    cameraOrbit: '36deg 68deg 4.15m',
    cameraTarget: '-0.05m 0.92m 0.02m',
    fov: '36deg',
    detallImg: 'assets/blender/out/water-detall.png',
    detallAlt: 'Detall dels corrons d’estirament amb pesos de ferro, tren lateral d’engranatges i aletes en U girant sobre les bobines',
    detallL: '2–4 · Corrons d’estirament, engranatges i aletes',
    detallR: 'acosta al detall ↗',
    detallOrbit: '44deg 70deg 2.0m',
    detallTarget: '0.08m 1.05m 0.10m',
    ideaTitol: 'Estirar amb corrons i moure-ho amb aigua',
    ideaHtml: 'Tres parells de <strong>corrons</strong> giren cada cop més de pressa (1×, 1,6×, 3,2×) per aprimar la metxa sense mans. L’energia ve d’una <strong>roda hidràulica</strong> exterior i produeix un ordit molt fort de manera contínua.',
    flowBtnLabel: 'Camí del cotó i transmissió hidràulica',
    legendHot: 'Força hidràulica -> tambor -> corrons',
    legendCold: 'Estirament continu en aleta',
    fonamentHtml: 'Reconstrucció didàctica de 1775: bastidor vertical, pesos penjants sobre corrons, aletes en U i vaivé de bobines. Font: <a href="https://collection.sciencemuseumgroup.org.uk/objects/co44832/arkwrights-water-frame-1775" target="_blank" rel="noopener">Science and Industry Museum · Manchester</a>.',
    hotspots: {
      metxa: { num: 1, titol: 'Rastellera de bobines de metxa', text: 'Quatre grosses bobines superiors plenes de cotó cardat que baixen verticalment sense interrupcions cap als corrons.', pos3d: [-0.12, 1.68, -0.24] },
      corrons: { num: 2, titol: 'Corrons d’estirament i pesos', text: 'Tres parells d’acer estriat i cuir premuts per contrapesos penjants de ferro colat per evitar que les fibres rellissin.', pos3d: [0.12, 1.45, -0.02] },
      engranatges: { num: 3, titol: 'Tren lateral d’engranatges', text: 'Multiplica la velocitat de cada parell successiu (1×, 1,6× i 3,2×) perquè la metxa s’estiri progressivament.', pos3d: [0.59, 1.41, -0.02] },
      aleta: { num: 4, titol: 'Aletes en U i pont de vaivé', text: 'Cada aleta metàl·lica gira ràpidament per tòrcer el fil mentre el pont elevador puja i baixa les bobines per repartir-lo.', pos3d: [-0.12, 0.88, 0.27] },
      aigua: { num: 5, titol: 'Transmissió hidràulica inferior', text: 'Roda de pales al canaló, parell cònic cap a l’eix rei vertical i tambor d’estany amb cordons fins als fusos.', pos3d: [-1.4, 0.42, 0.0] },
      bastidor: { num: 6, titol: 'Bastidor tipus armari fabril', text: 'Màquina alta, pesant i contínua: massa gran per a una casa, obliga a reunir les filadores dins d’una fàbrica vora un riu.', pos3d: [0.54, 1.15, 0.42] }
    },
    flows: [
      { id: 'wf-estira', cls: 'fl-cold', lbl: 'estiratge 1× -> 3,2×', fases: [0, 1], from: 'metxa', to: 'corrons', dx1: 6, dy1: 8, dx2: -8, dy2: -8, ctrlDy: -6, lblDy: -6 },
      { id: 'wf-aleta', cls: 'fl-cold', lbl: 'torsió contínua', fases: [2, 3], from: 'corrons', to: 'aleta', dx1: -8, dy1: 12, dx2: 6, dy2: -14, ctrlDx: -12, ctrlDy: 4, lblDx: -18, lblDy: 0 },
      { id: 'wf-hid', cls: 'fl-hot', lbl: 'força d’aigua -> aletes', fases: [0, 2, 3], from: 'aigua', to: 'aleta', dx1: 12, dy1: -6, dx2: -10, dy2: 10, ctrlDy: 8, lblDy: 8 },
      { id: 'wf-eng', cls: 'fl-hot', lbl: 'reductor als corrons', fases: [1, 3], from: 'aigua', to: 'engranatges', dx1: 14, dy1: -10, dx2: -10, dy2: 14, ctrlDx: 20, ctrlDy: -16, lblDx: 12, lblDy: -8 }
    ],
    fases: [
      {
        curt: 'Alimentar corrons',
        titol: 'Entrada de metxa al primer parell',
        desc: 'Els contrapesos de ferro estrenyen els corrons revestits de cuir contra l’acer estriat per agafar la metxa amb fermesa.',
        pMin: 0.00,
        pJump: 0.14,
        chips: [['Metxa: entra', 'oberta'], ['Contrapesos: premen', 'oberta'], ['Corrons: 1×', '']]
      },
      {
        curt: 'Estiratge progressiu',
        titol: 'Acceleració 1× -> 1,6× -> 3,2×',
        desc: 'Cada parell de corrons gira més de pressa gràcies al tren d’engranatges lateral: les fibres llisquen i s’aprimen contínuament.',
        pMin: 0.25,
        pJump: 0.38,
        chips: [['Engranatges: 3,2×', 'oberta'], ['Estiratge: continu', 'oberta'], ['Sense aturades', 'oberta']]
      },
      {
        curt: 'Tòrcer amb aleta',
        titol: 'Aleta en U i vaivé de bobina',
        desc: 'El fil entra per l’ull de l’aleta giratòria, rep una torsió forta apta per a ordit i s’enrotlla sobre la bobina que puja i baixa.',
        pMin: 0.50,
        pJump: 0.62,
        chips: [['Aleta: gira ràpid', 'oberta'], ['Pont vaivé: puja/baixa', 'oberta'], ['Fil resistent (ordit)', 'oberta']]
      },
      {
        curt: 'Producció fabril',
        titol: 'Moviment hidràulic ininterromput',
        desc: 'L’eix rei vertical rep la força del molí d’aigua i manté sincronitzats alhora els quatre fusos i tots els corrons.',
        pMin: 0.75,
        pJump: 0.88,
        chips: [['Roda hidràulica: contínua', 'oberta'], ['Fàbrica: producció constant', 'oberta']]
      }
    ]
  },

  cartwright: {
    titol: 'El teler mecànic de Cartwright',
    subtitol: '1787–1790 · Edmund Cartwright · Corretja des de la fàbrica, reducció 2:1, lleves i bieles per teixir amb força hidràulica o de vapor.',
    badge: 'MODEL 3D',
    eyebrow: '1787–1790 · Edmund Cartwright · Mecanització completa del teixit',
    backHref: 'textil.html#cartwright',
    backLabel: 'Tornar al capítol del tèxtil',
    glb: 'assets/models/cartwright.glb',
    poster: 'assets/blender/out/cartwright-muntada.png',
    cameraOrbit: '38deg 72deg 4.9m',
    cameraTarget: '0.15m 0.88m 0.05m',
    fov: '36deg',
    detallImg: 'assets/blender/out/cartwright-detall.png',
    detallAlt: 'Detall de la politja amb corretja, volant d’inèrcia, pinyó de llautó 2:1, eix de lleves i biela forjada del batà',
    detallL: '1–2 · Transmissió, engranatges 2:1 i biela',
    detallR: 'acosta al detall ↗',
    detallOrbit: '48deg 74deg 2.15m',
    detallTarget: '0.82m 0.56m 0.18m',
    ideaTitol: 'Tot el teler sincronitzat amb un sol eix',
    ideaHtml: 'La corretja de la fàbrica fa girar l’<strong>eix principal de manovelles</strong>, que bat la pinta a cada volta, mentre un <strong>engranatge reductor 2:1</strong> mou l’eix de lleves perquè una passada vagi a la dreta i la següent torni a l’esquerra sense intervenció humana.',
    flowBtnLabel: 'Transmissió de força i cicle 2:1',
    legendHot: 'Força motriu i impulsors',
    legendCold: 'Sincronització 2:1 i calada',
    fonamentHtml: 'Reconstrucció basada en el model industrial primerenc (1787–1790) descrit a <a href="https://books.google.com/books?id=bJ9EAAAAYAAJ" target="_blank" rel="noopener">Strickland (1843)</a> i les patents d’Edmund Cartwright.',
    hotspots: {
      transmissio: { num: 1, titol: 'Politja motriu doble, forquilla i volant', text: 'Recull el gir de l’embarrat superior mitjançant una corretja plana de cuir sobre politges fixa i boja, regularitzat per un volant lliure.', pos3d: [1.4, 0.86, 0.34] },
      eix: { num: 2, titol: 'Eix principal, pinyó 2:1, lleves i bieles', text: 'El pinyó de llautó (14 dents) mou la corona de ferro (28 dents) a meitat de velocitat per coordinar calada, tir i batuda.', pos3d: [0.85, 0.48, 0.18] },
      llicos: { num: 3, titol: 'Lliços penjats i trepitjadors de lleva', text: 'Dues lleves en cor empenyen palanques inferiors amb corró que baixen i pugen alternativament els marcs de l’ordit.', pos3d: [-0.2, 1.22, -0.32] },
      llancadora: { num: 4, titol: 'Impulsors amb moll i llançadora', text: 'Lleves de picat disparen les espases amb tacs de cuir sobre varetes guia d’acer i molls espirals de retorn.', pos3d: [-0.15, 0.92, -0.04] },
      pinta: { num: 5, titol: 'Batà i pinta de 44 pues amb bieles', text: 'Dues bieles d’acer forjat amb brides de llautó connecten el cigonyal al batà perquè bati cada fil de trama amb força.', pos3d: [0.5, 1.08, -0.06] },
      ordit: { num: 6, titol: 'Ordit tensat amb palanca i contrapès', text: 'Plegador posterior regulat amb brida i pes de ferro colat per mantenir la tensió uniforme de l’ordit.', pos3d: [-0.52, 0.95, -0.62] },
      tela: { num: 7, titol: 'Corró de pit, trempador i plegador', text: 'La tela passa sobre el corró d’acer polit i el trempador de llautó abans d’enrotllar-se al plegador frontal.', pos3d: [-0.15, 0.95, 0.6] },
      bastidor: { num: 8, titol: 'Bastidor reforçat amb escaires', text: 'Estructura pesant de roure sobre sabates i coixinets bipartits de fosa per resistir el ritme continu de fàbrica.', pos3d: [-1.04, 1.48, -0.8] }
    },
    flows: [
      { id: 'cw-corretja', cls: 'fl-hot', lbl: 'força de l’embarrat', fases: [0, 1, 2, 3], from: 'transmissio', to: 'eix', dx1: -6, dy1: -10, dx2: 6, dy2: -8, ctrlDx: 32, ctrlDy: 10, lblDx: 38, lblDy: 16 },
      { id: 'cw-bieles', cls: 'fl-hot', lbl: 'bieles cap al batà', fases: [2], from: 'eix', to: 'pinta', dx1: -4, dy1: -10, dx2: 8, dy2: 8, ctrlDx: 28, ctrlDy: -16, lblDx: 32, lblDy: -8 },
      { id: 'cw-lleves', cls: 'fl-cold', lbl: 'lleves 2:1 als lliços', fases: [0, 3], from: 'eix', to: 'llicos', dx1: -12, dy1: -12, dx2: 14, dy2: 8, ctrlDx: -10, ctrlDy: -28, lblDx: -14, lblDy: -8 },
      { id: 'cw-impuls', cls: 'fl-eq', lbl: 'llançadora mecànica', fases: [1, 3], from: 'llancadora', to: 'pinta', dx1: -14, dy1: 0, dx2: 12, dy2: 2, ctrlDy: -20, lblDy: -10 }
    ],
    fases: [
      {
        curt: 'Lleves i calada',
        titol: 'Lleves de calada (pas 1)',
        desc: 'L’eix de lleves (girant a la meitat de velocitat) bascula els lliços i deixa oberta la calada abans del tir.',
        pMin: 0.00,
        pJump: 0.08,
        chips: [['Eix principal: 1×', 'oberta'], ['Eix lleves: ½×', 'oberta'], ['Batà: enrere', 'tancada']]
      },
      {
        curt: 'Cop d’impulsor',
        titol: 'Cop d’impulsor mecànic',
        desc: 'La lleva de picat colpeja l’espasa esquerra i projecta la llançadora d’extrem a extrem pel túnel d’ordit.',
        pMin: 0.12,
        pJump: 0.22,
        chips: [['Impulsor: cop lateral', 'oberta'], ['Llançadora: vol ràpid', 'oberta'], ['Calada: oberta', 'oberta']]
      },
      {
        curt: 'Batuda per manovella',
        titol: 'Batuda per manovella i bieles',
        desc: 'La manovella de l’eix principal completa la volta i fa avançar el batà amb les dues bieles per prémer la trama.',
        pMin: 0.30,
        pJump: 0.39,
        chips: [['Bieles: bat endavant', 'oberta'], ['Llançadora: en caixa', 'tancada'], ['Tela: avança 1 passada', 'oberta']]
      },
      {
        curt: 'Segona passada',
        titol: 'Invertir calada i retorn automàtic',
        desc: 'A la segona volta de l’eix principal, l’eix de lleves arriba a 180°, canvia els lliços i dispara el retorn contrari.',
        pMin: 0.50,
        pJump: 0.72,
        chips: [['Eix lleves: mitja volta', 'oberta'], ['Impulsor contrari: actiu', 'oberta'], ['Ritme: continu', 'oberta']]
      }
    ]
  },

  rotativa: {
    titol: 'La màquina de vapor rotativa de doble efecte',
    subtitol: '1781–1788 · James Watt i Matthew Boulton · Cilindre tancat de doble efecte, vàlvula lliscant en D, excèntrica, regulador centrífug i volant d’inèrcia.',
    badge: 'MODEL 3D',
    eyebrow: '1781–1788 · Watt i Boulton · Força giratòria contínua',
    backHref: 'vapor.html#rotativa',
    backLabel: 'Tornar al capítol del vapor',
    glb: 'assets/models/rotativa.glb',
    poster: 'assets/blender/out/rotativa-muntada.png',
    cameraOrbit: '20deg 75deg 8.4m',
    cameraTarget: '-0.15m 1.15m 0m',
    fov: '35deg',
    detallImg: 'assets/blender/out/rotativa-detall.png',
    detallAlt: 'Detall del cilindre de doble efecte seccionat amb el pistó, la vàlvula lliscant en D, la creuera i el regulador centrífug',
    detallL: '1–4 · Cilindre doble, vàlvula en D i creuera',
    detallR: 'acosta al detall ↗',
    detallOrbit: '14deg 74deg 4.2m',
    detallTarget: '-1.35m 1.15m 0.1m',
    ideaTitol: 'Empènyer per totes dues cares i girar sense parar',
    ideaHtml: 'El vapor empeny alternativament per <strong>totes dues cares del pistó</strong> amb una vàlvula lliscant en D, generant <strong>gir continu</strong> mentre el <strong>regulador de boles</strong> controla el ritme. (El 1781 Watt usà primer planeta-sol abans de la manovella horitzontal.)',
    flowBtnLabel: 'Curs del vapor i força motriu',
    legendHot: 'Vapor viu / força motriu',
    legendCold: 'Vapor d’escapament i control centrífug',
    fonamentHtml: 'Reconstrucció mecànica inspirada en els models horitzontals de doble efecte amb vàlvula lliscant en D i regulador centrífug de boles (col·leccions del Science Museum i esquemes clàssics d’enginyeria del segle XIX).',
    hotspots: {
      cilindre: { num: 1, titol: 'Cilindre horitzontal de doble efecte', text: 'Completament tancat per tots dos caps: rep vapor a pressió primer darrere del pistó i després davant, aprofitant tant l’anada com la tornada.', pos3d: [-1.96, 0.96, 0.32], orbit: '10deg 76deg 2.5m' },
      piston: { num: 2, titol: 'Pistó i tija estanca', text: 'Pistó metàl·lic amb segments que travessa la tapa davantera mitjançant una caixa d’estopa per no perdre vapor.', pos3d: [-2.02, 0.96, 0.18], orbit: '6deg 76deg 2.2m' },
      distribucio: { num: 3, titol: 'Vàlvula lliscant en D (caixa de distribució)', text: 'Desplaçant-se a contrafase, connecta alternativament cada lumbrera amb el vapor viu o amb el conducte d’escapament central.', pos3d: [-1.96, 1.42, 0.18], orbit: '8deg 74deg 2.1m' },
      creuera: { num: 4, titol: 'Creuera i guies lineals', text: 'Manté la tija del pistó perfectament alineada mentre la biela oscil·la d’amunt a avall.', pos3d: [-0.82, 0.96, 0.16], orbit: '12deg 76deg 2.4m' },
      biela: { num: 5, titol: 'Biela i manovella', text: 'Converteixen el moviment rectilini alternatiu del pistó en gir continu de l’eix principal.', pos3d: [0.2, 0.94, 0.12], orbit: '16deg 76deg 3.0m' },
      excentrica: { num: 6, titol: 'Excèntrica de distribució', text: 'Anell descentrat sobre l’eix que mou automàticament la barra de la vàlvula en D sincronitzada amb la manovella.', pos3d: [1.05, 1.06, -0.08], orbit: '18deg 75deg 2.4m' },
      regulador: { num: 7, titol: 'Regulador centrífug de boles (Watt)', text: 'Quan l’eix accelera, les dues boles pesants s’obren per força centrífuga i tanquen parcialment la papallona d’entrada de vapor.', pos3d: [-0.58, 1.66, -0.1], orbit: '14deg 74deg 2.4m' },
      volant: { num: 8, titol: 'Volant d’inèrcia pesant', text: 'Emmagatzema energia cinètica per superar els punts morts de la manovella amb una velocitat uniforme.', pos3d: [1.6, 1.85, -0.25], orbit: '22deg 74deg 3.8m' },
      corretja: { num: 9, titol: 'Politja i corretja cap a la fàbrica', text: 'Transmet la força rotatòria al sostre de la nau industrial per moure desenes de telers i filadores.', pos3d: [1.58, 1.62, -0.23], orbit: '26deg 72deg 3.6m' }
    },
    flows: [
      { id: 'r-adm', cls: 'fl-hot', lbl: 'admissió regulada', fases: [0, 2], from: 'regulador', to: 'distribucio', dx1: -10, dy1: 0, dx2: 10, dy2: -4, ctrlDy: -16, lblDy: -10 },
      { id: 'r-cil', cls: 'fl-hot', lbl: 'empenta alternativa', fases: [0, 2], from: 'distribucio', to: 'piston', dx1: 0, dy1: 8, dx2: 0, dy2: -8, ctrlDx: -14, ctrlDy: 0, lblDx: -22, lblDy: 0 },
      { id: 'r-esc', cls: 'fl-cold', lbl: 'escapament', fases: [1, 3], from: 'piston', to: 'distribucio', dx1: 8, dy1: -8, dx2: 8, dy2: 6, ctrlDx: 18, ctrlDy: -4, lblDx: 24, lblDy: 0 },
      { id: 'r-pot', cls: 'fl-eq', lbl: 'gir continu', fases: [0, 1, 2, 3], from: 'biela', to: 'volant', dx1: 8, dy1: 0, dx2: -10, dy2: 8, ctrlDy: -18, lblDy: -10 }
    ],
    fases: [
      {
        curt: 'Admissió dreta (anada)',
        titol: 'El vapor empeny el pistó endavant',
        desc: 'La vàlvula en D obre el pas posterior: el vapor viu entra darrere del pistó i l’empeny cap a la manovella mentre la cara oposada desguassa.',
        pMin: 0.00,
        pJump: 0.14,
        chips: [['Cambra esq.: vapor viu', 'oberta'], ['Cambra dr.: escapament', 'tancada'], ['Manovella: empeny', 'oberta']]
      },
      {
        curt: 'Punt mort i basculació',
        titol: 'El volant supera el punt mort davanter',
        desc: 'La inèrcia del volant fa creuar la manovella mentre l’excèntrica desplaça la vàlvula en D per invertir els conductes.',
        pMin: 0.25,
        pJump: 0.32,
        chips: [['Volant: venç punt mort', 'oberta'], ['Excèntrica: inverteix pas', 'oberta']]
      },
      {
        curt: 'Admissió esquerra (tornada)',
        titol: 'El vapor empeny en sentit contrari',
        desc: 'Ara el vapor viu entra per la lumbrera anterior i torna el pistó enrere, lliurant un segon cop motriu en la mateixa volta.',
        pMin: 0.50,
        pJump: 0.64,
        chips: [['Cambra dr.: vapor viu', 'oberta'], ['Cambra esq.: escapament', 'tancada'], ['Doble efecte: actiu', 'oberta']]
      },
      {
        curt: 'Control del regulador',
        titol: 'Estabilització amb el regulador de boles',
        desc: 'Si la càrrega de la corretja baixa i el volant s’embala, les boles s’obren i estrangulen l’entrada de vapor automàticament.',
        pMin: 0.78,
        pJump: 0.88,
        chips: [['Regulador: dosifica cabal', 'oberta'], ['Corretja: ritme constant', 'oberta']]
      }
    ]
  },

  rocket: {
    titol: 'La locomotora The Rocket',
    subtitol: '1829 · George i Robert Stephenson · Caldera multitubular de 25 tubs de coure, fogar rodejat d’aigua, cilindres inclinats i tir forçat amb vapor d’escapament.',
    badge: 'MODEL 3D',
    eyebrow: '1829 · Proves de Rainhill · Transport ferroviari',
    backHref: 'tren.html#rocket',
    backLabel: 'Tornar al capítol del ferrocarril',
    glb: 'assets/models/rocket.glb',
    poster: 'assets/blender/out/rocket-muntada.png',
    cameraOrbit: '20deg 76deg 8.0m',
    cameraTarget: '-0.35m 1.25m 0m',
    fov: '35deg',
    detallImg: 'assets/blender/out/rocket-detall.png',
    detallAlt: 'Detall de la caldera multitubular seccionada amb els tubs de coure, el fogar i la biela motriu',
    detallL: '2–6 · Caldera multitubular, caixa de distribució i cilindre',
    detallR: 'acosta al detall ↗',
    detallOrbit: '14deg 75deg 3.5m',
    detallTarget: '-0.15m 1.22m 0.12m',
    ideaTitol: 'Molts tubs calents + xuclada d’escapament',
    ideaHtml: 'En lloc d’un sol tub gruixut, els fums passen per <strong>25 tubs de coure submergits</strong> que multipliquen l’escalfor. A més, el vapor usat s’injecta dins la xemeneia (<strong>tub d’escapament</strong>) i fa un tir molt fort com més ràpid corre el tren.',
    flowBtnLabel: 'Fums calents, vapor i força',
    legendHot: 'Gasos del fogar i vapor a pressió',
    legendCold: 'Aigua i vapor d’escapament',
    fonamentHtml: 'Reconstrucció didàctica de 1829 basada en la locomotora original conservada al <a href="https://collection.sciencemuseumgroup.org.uk/objects/co205793/stephensons-rocket-steam-locomotive" target="_blank" rel="noopener">Science Museum de Londres</a>.',
    hotspots: {
      tender: { num: 1, titol: 'Tènder de coc i aigua', text: 'Vagó annex amb un bocoi d’aigua seccionat connectat per mànega a la caldera i coc sense fum per alimentar el fogar.', pos3d: [-2.62, 1.12, 0.18], orbit: '16deg 76deg 3.1m' },
      fogar: { num: 2, titol: 'Fogar amb camisa d’aigua', text: 'Cremador de coc de coure completament envoltat d’aigua, amb graella i virotillos per aprofitar tota la calor sense cremar les parets.', pos3d: [-1.08, 1.05, 0.1], orbit: '6deg 78deg 2.2m' },
      caldera: { num: 3, titol: 'Caldera cilíndrica seccionada', text: 'Conté l’aigua bullint a la meitat inferior i acumula el vapor a pressió a la cambra superior amb indicador de nivell i manòmetre.', pos3d: [0.08, 1.24, 0.15], orbit: '4deg 76deg 2.6m' },
      tubs: { num: 4, titol: 'Feix de tubs de coure', text: 'Condueixen els gasos roents del fogar fins a la caixa de fums, transmetent calor a l’aigua circumdant de forma molt ràpida.', pos3d: [0.18, 1.04, 0.05], orbit: '4deg 78deg 2.1m' },
      vapor: { num: 5, titol: 'Cúpula de vapor sec', text: 'Recull el vapor més sec de la part alta per portar-lo pel regulador cap als cilindres sense arrossegar gotes d’aigua.', pos3d: [-0.14, 1.78, 0.08], orbit: '10deg 72deg 2.2m' },
      cilindre: { num: 6, titol: 'Cilindre inclinat i vàlvula corredora', text: 'Empenta directa sense balancins feixucs: la caixa de distribució seccionada reparteix el vapor a un i altre costat del pistó.', pos3d: [-0.5, 1.48, 0.58], orbit: '8deg 75deg 2.0m' },
      biela: { num: 7, titol: 'Biela i creuera', text: 'Transmeten la cursa del pistó directament al botó de manovella de la gran roda motriu.', pos3d: [0.28, 1.12, 0.6], orbit: '8deg 78deg 2.2m' },
      roda: { num: 8, titol: 'Gran roda motriu davantera', text: 'Dues rodes de fusta amb cercles de ferro acoblades als cilindres que arrosseguen tot el comboi sobre els rails.', pos3d: [0.86, 0.829, 0.58], orbit: '14deg 78deg 2.6m' },
      escapament: { num: 9, titol: 'Tub d’escapament (blastpipe)', text: 'Descarrega el vapor usat dels dos cilindres sota la xemeneia per crear buit i atiar el foc com més de pressa va la locomotora.', pos3d: [1.1, 1.48, 0.12], orbit: '12deg 76deg 2.3m' },
      xemeneia: { num: 10, titol: 'Xemeneia frontal alta', text: 'Expulsa els fums i el vapor blanc creat pel tir forçat sense envair la visió del maquinista.', pos3d: [1.15, 2.65, 0.14], orbit: '18deg 74deg 3.2m' }
    },
    flows: [
      { id: 'rk-fum', cls: 'fl-hot', lbl: 'gasos pels tubs', fases: [0], from: 'fogar', to: 'tubs', dx1: 8, dy1: 0, dx2: -8, dy2: 0, ctrlDy: 8, lblDy: 14 },
      { id: 'rk-vap', cls: 'fl-hot', lbl: 'vapor als cilindres', fases: [1], from: 'vapor', to: 'cilindre', dx1: -6, dy1: 4, dx2: 6, dy2: -4, ctrlDy: -12, lblDy: -10 },
      { id: 'rk-rod', cls: 'fl-eq', lbl: 'tracció directa', fases: [2], from: 'biela', to: 'roda', dx1: 6, dy1: 4, dx2: -6, dy2: -4, ctrlDy: 10, lblDy: 12 },
      { id: 'rk-tir', cls: 'fl-cold', lbl: 'tir forçat', fases: [3], from: 'escapament', to: 'xemeneia', dx1: 4, dy1: -4, dx2: -4, dy2: 14, ctrlDx: 10, ctrlDy: -10, lblDx: 16, lblDy: 0 }
    ],
    fases: [
      {
        curt: 'Calor multitubular',
        titol: 'Els gasos travessen els 25 tubs de coure',
        desc: 'La calor del coc crema envoltat d’aigua i recorre desenes de tubs submergits, produint vapor molt de pressa.',
        pMin: 0.00,
        pJump: 0.12,
        chips: [['Fogar: 25 tubs actius', 'oberta'], ['Ebullició ràpida', 'oberta']]
      },
      {
        curt: 'Admissió als cilindres',
        titol: 'Vapor a pressió cap als cilindres inclinats',
        desc: 'El vapor sec captat a la cúpula baixa pels tubs fins als dos cilindres inclinats laterals.',
        pMin: 0.25,
        pJump: 0.35,
        chips: [['Vapor: entra a pressió', 'oberta'], ['Cilindres: 35°', '']]
      },
      {
        curt: 'Cop sobre la roda motriu',
        titol: 'Biela i manovella mouen les rodes',
        desc: 'El pistó acciona directament la roda davantera sobre el rail, superant pendents fins a 48 km/h a Rainhill.',
        pMin: 0.50,
        pJump: 0.62,
        chips: [['Biela: tracció directa', 'oberta'], ['Rodes: adherència al rail', 'oberta']]
      },
      {
        curt: 'Tir forçat d’escapament',
        titol: 'El vapor usat atia el foc',
        desc: 'En sortir a pressió per sota la xemeneia, el vapor xucla aire fresc a través del fogar i aviva encara més la caldera.',
        pMin: 0.75,
        pJump: 0.88,
        chips: [['Blastpipe: tir forçat', 'oberta'], ['Autoalimentació del foc', 'oberta']]
      }
    ]
  },

  western: {
    titol: 'El vapor transatlàntic SS Great Western',
    subtitol: '1838 · Isambard Kingdom Brunel · Casc de fusta reforçada, quatre calderes de carbó, màquina de balancí lateral (side-lever), grans rodes de pales i aparell mixt amb veles.',
    badge: 'MODEL 3D',
    eyebrow: '1838 · Travessa Bristol–Nova York en 15 dies',
    backHref: 'vaixell.html#western',
    backLabel: 'Tornar al capítol dels vaixells',
    glb: 'assets/models/western.glb',
    poster: 'assets/blender/out/western-muntada.png',
    cameraOrbit: '18deg 76deg 10.6m',
    cameraTarget: '0m 1.38m 0m',
    fov: '35deg',
    detallImg: 'assets/blender/out/western-detall.png',
    detallAlt: 'Detall de la sala de màquines seccionada amb el doble fogar, els tubs de retorn, la vàlvula lliscant i el balancí lateral (side-lever)',
    detallL: '2–6 · Caldera seccionada, side-lever i roda de pales',
    detallR: 'acosta al detall ↗',
    detallOrbit: '8deg 76deg 4.2m',
    detallTarget: '0.28m 0.96m 0.05m',
    ideaTitol: 'Més mida = molt més carbó i menys fregament',
    ideaHtml: 'Brunel va demostrar que el volum del casc creix al <strong>cub</strong> mentre la resistència de l’aigua creix al <strong>quadrat</strong>: un vaixell gran pot carregar tot el carbó necessari per creuar l’Atlàntic en 15 dies sense aturar-se.',
    flowBtnLabel: 'Circuit de carbó, vapor i empenta',
    legendHot: 'Combustió i vapor',
    legendCold: 'Empenta naval i velam auxiliar',
    fonamentHtml: 'Reconstrucció basada en els plànols de casc i sala de màquines Maudslay de l’<a href="https://www.ssgreatbritain.org/" target="_blank" rel="noopener">SS Great Western (1838)</a>.',
    hotspots: {
      cabines: { num: 1, titol: 'Cabines i saló de passatgers', text: 'Allotjament a popa per a 128 passatgers de primera classe amb lliteres, taula de caoba, ulls de bou i claraboia.', pos3d: [-2.72, 0.85, 0.05], orbit: '10deg 76deg 2.8m' },
      carbonera: { num: 2, titol: 'Carboneres i fogoner amb pala', text: 'Enormes bodegues centrals (800 t de carbó) amb el fogoner carregant directament els dos fogars de la caldera.', pos3d: [-1.72, 0.65, 0.08], orbit: '8deg 76deg 2.4m' },
      calderes: { num: 3, titol: 'Caldera marina retornada seccionada', text: 'Doble fogar de brases, sis tubs de retorn de coure submergits dins l’aigua, indicador de nivell, manòmetre i cúpula de vapor.', pos3d: [-0.58, 0.96, 0.1], orbit: '4deg 78deg 2.3m' },
      xemeneia: { num: 4, titol: 'Xemeneia de ferro amb vents', text: 'Evacua els gasos que retornen pels tubs de coure per sobre dels pals de popa i les veles.', pos3d: [-0.62, 2.75, -0.08], orbit: '14deg 74deg 3.6m' },
      maquina: { num: 5, titol: 'Màquina side-lever de Maudslay', text: 'Cilindre vertical seccionat, caixa de vàlvula corredora, condensador, bomba d’aire, balancí baix, biela i bastidor gòtic.', pos3d: [1.12, 0.9, 0.12], orbit: '6deg 76deg 2.3m' },
      roda: { num: 6, titol: 'Rodes de pales laterals', text: 'Dues rodes de gairebé 9 m (vista completa al costat de babord i arc de secció al frontal) que empenyen contra l’onatge.', pos3d: [0.58, 2.1, -0.98], orbit: '22deg 74deg 4.6m' },
      veles: { num: 7, titol: 'Quatre pals amb velam mixt', text: 'Amb vent favorable es despleguen les veles per estalviar carbó i estabilitzar el balanceig lateral.', pos3d: [1.48, 2.85, -0.16], orbit: '18deg 74deg 4.8m' },
      carrega: { num: 8, titol: 'Bodega de càrrega i proa reforçada', text: 'Bocois amb cèrcols de ferro, caixes amb llistons, bales de cotó, escala d’escotilla i molinet d’àncora.', pos3d: [2.25, 0.72, 0.04], orbit: '14deg 76deg 2.8m' }
    },
    flows: [
      { id: 'gw-car', cls: 'fl-hot', lbl: 'carbó cap a calderes', fases: [0], from: 'carbonera', to: 'calderes', dx1: 6, dy1: 0, dx2: -6, dy2: 0, ctrlDy: -10, lblDy: -8 },
      { id: 'gw-vap', cls: 'fl-hot', lbl: 'vapor a baixa pressió', fases: [1], from: 'calderes', to: 'maquina', dx1: 8, dy1: 0, dx2: -8, dy2: 0, ctrlDy: -12, lblDy: -10 },
      { id: 'gw-pal', cls: 'fl-cold', lbl: 'gir a les pales', fases: [2], from: 'maquina', to: 'roda', dx1: -4, dy1: -8, dx2: 6, dy2: 6, ctrlDy: -14, lblDy: -10 },
      { id: 'gw-vel', cls: 'fl-cold', lbl: 'ajuda del vent', fases: [3], from: 'veles', to: 'roda', dx1: -6, dy1: 12, dx2: 6, dy2: -8, ctrlDx: 14, ctrlDy: 0, lblDx: 22, lblDy: 0 }
    ],
    fases: [
      {
        curt: 'Alimentació de carbó',
        titol: 'Els fogoners carreguen les calderes',
        desc: 'Des de la carbonera central entra carbó contínuament; a mesura que es consumeix, es manté l’equilibri del vaixell.',
        pMin: 0.00,
        pJump: 0.14,
        chips: [['Autonomia: 800 t carbó', 'oberta'], ['Estabilitat: central', 'oberta']]
      },
      {
        curt: 'Balancí baix (side-lever)',
        titol: 'Màquina marina de centre de gravetat baix',
        desc: 'El pistó vertical acciona un balancí inferior lateral que evita que el vaixell bolqui enmig dels temporals.',
        pMin: 0.25,
        pJump: 0.38,
        chips: [['Balancí: a la sentina', 'oberta'], ['Cilindre vertical actiu', 'oberta']]
      },
      {
        curt: 'Propulsió per pales',
        titol: 'Les rodes de pales avancen 15 dies sense parar',
        desc: 'La manovella superior fa girar les dues grans rodes laterals que tallen l’aigua de forma constant.',
        pMin: 0.50,
        pJump: 0.65,
        chips: [['Velocitat: ~8,5 nusos', 'oberta'], ['Rodes: pales immergides', 'oberta']]
      },
      {
        curt: 'Navegació mixta',
        titol: 'El velam complementa el vapor',
        desc: 'Les quatre pals mantenen l’estabilitat i redueixen la despesa de carbó quan els vents atlàntics bufen a favor.',
        pMin: 0.75,
        pJump: 0.88,
        chips: [['Velam: suport i rumb', 'oberta'], ['Travessa: 15 dies', 'oberta']]
      }
    ]
  },

  helix: {
    titol: 'El duel de l’hèlix vs la roda de pales',
    subtitol: '1845 · HMS Rattler (hèlix) contra HMS Alecto (pales) · Prova d’estira-i-arronsa a mar obert organitzada per l’Almirallat britànic.',
    badge: 'MODEL 3D',
    eyebrow: '1845 · Revolució en la propulsió naval',
    backHref: 'vaixell.html#helix',
    backLabel: 'Tornar al capítol dels vaixells',
    glb: 'assets/models/helix.glb',
    poster: 'assets/blender/out/helix-muntada.png',
    cameraOrbit: '10deg 74deg 7.8m',
    cameraTarget: '0.1m 1.0m 0m',
    fov: '35deg',
    detallImg: 'assets/blender/out/helix-detall.png',
    detallAlt: 'Detall submergit de l’arbre i l’hèlix de bronze de l’HMS Rattler amb els anells d’empenta sota l’aigua',
    detallL: '1–3 · Reductora i hèlix submergida de bronze',
    detallR: 'acosta al detall ↗',
    detallOrbit: '18deg 78deg 3.4m',
    detallTarget: '-1.15m 0.68m 0.1m',
    ideaTitol: 'Sempre submergida i sense ocupar els costats',
    ideaHtml: 'Mentre les rodes de pales sortien fora de l’aigua amb les ones i eren molt vulnerables als canons, l’<strong>hèlix de bronze</strong> treballa sempre submergida a popa i converteix més potència en empenta neta.',
    flowBtnLabel: 'Comparació de l’empenta',
    legendHot: 'Empenta guanyadora (hèlix)',
    legendCold: 'Empenta de pales i cable de tracció',
    fonamentHtml: 'Reconstrucció del duel històric d’abril de 1845 entre l’<em>HMS Rattler</em> (hèlix de Smith) i l’<em>HMS Alecto</em> (rodes de pales), tots dos amb màquina de 200 CV.',
    hotspots: {
      motor: { num: 1, titol: 'Màquina del Rattler i engranatge multiplicador', text: 'Una roda dentada multiplica les revolucions perquè l’arbre inferior giri molt més de pressa que una roda de pales.', pos3d: [-2.15, 1.05, 0.0], orbit: '10deg 74deg 2.6m' },
      arbre: { num: 2, titol: 'Arbre submergit amb bocina estanca', text: 'Eix d’acer que travessa la quilla sota la línia de flotació sense deixar entrar l’aigua dins el casc.', pos3d: [-1.55, 0.6, 0.0], orbit: '12deg 78deg 2.2m' },
      rattler: { num: 3, titol: 'Hèlix de bronze submergida (HMS Rattler)', text: 'Quatre pales helicoïdals que cargolen l’aigua cap enrere (anells d’empenta) amb màxim aprofitament hidrodinàmic.', pos3d: [-0.64, 0.68, 0.0], orbit: '18deg 78deg 2.1m' },
      cable: { num: 4, titol: 'Cable d’estira-i-arronsa', text: 'Amarrats popa amb popa, tots dos vaixells posen les màquines a màxima potència en direccions oposades.', pos3d: [0.0, 1.56, 0.0], orbit: '10deg 74deg 3.2m' },
      alecto: { num: 5, titol: 'Rodes de pales (HMS Alecto)', text: 'Pateixen relliscament superficial i cavitació quan l’onatge deixa mitja pala a l’aire.', pos3d: [1.95, 1.32, 0.6], orbit: '14deg 75deg 3.4m' }
    },
    flows: [
      { id: 'hx-trans', cls: 'fl-hot', lbl: 'engranatge multiplicador', fases: [0, 1], from: 'motor', to: 'rattler', dx1: 4, dy1: 8, dx2: -8, dy2: -4, ctrlDy: 12, lblDy: 14 },
      { id: 'hx-emp', cls: 'fl-hot', lbl: 'empenta submergida (+2,8 nusos)', fases: [1, 2], from: 'rattler', to: 'cable', dx1: 6, dy1: -8, dx2: -10, dy2: 8, ctrlDy: -16, lblDy: -8 },
      { id: 'hx-alec', cls: 'fl-cold', lbl: 'arrossegat cap enrere', fases: [2], from: 'cable', to: 'alecto', dx1: 8, dy1: 0, dx2: -14, dy2: -6, ctrlDy: -14, lblDy: -8 }
    ],
    fases: [
      {
        curt: 'Multiplicació de gir',
        titol: 'Potència igual (200 CV) en dos sistemes',
        desc: 'Tots dos vaixells generen la mateixa potència de vapor; el Rattler la transmet cap avall amb engranatges fins a l’arbre submergit.',
        pMin: 0.00,
        pJump: 0.14,
        chips: [['Potència: 200 CV cadascú', 'oberta'], ['Rattler: hèlix submergida', 'oberta']]
      },
      {
        curt: 'Duel en tensió',
        titol: 'El cable entra en màxima tensió',
        desc: 'Les pales de l’Alecto aixequen molta escuma però rellisquen en l’aigua superficial; l’hèlix mossega aigua densa i profunda.',
        pMin: 0.34,
        pJump: 0.48,
        chips: [['Alecto: patina amb l’escuma', 'tancada'], ['Hèlix: 100 % immersió', 'oberta']]
      },
      {
        curt: 'Victòria de l’hèlix',
        titol: 'El Rattler arrossega l’Alecto a 2,8 nusos',
        desc: 'L’hèlix imposa la seva superioritat i convenç l’Almirallat i els grans paquebots oceànics d’abandonar les pales.',
        pMin: 0.68,
        pJump: 0.85,
        chips: [['Arrossegament: 2,8 nusos', 'oberta'], ['Nova era naval: hèlix', 'oberta']]
      }
    ]
  },

  sembradora: {
    titol: 'La sembradora mecànica de Jethro Tull',
    subtitol: 'c. 1701 · Jethro Tull · Tremuja compartida, engranatge dosador giratori, tres tubs caiguda lliure, relles obresolcs i rasclet posterior en fileres.',
    badge: 'MODEL 3D',
    eyebrow: 'c. 1701 · Revolució agrícola · Sembra en fileres',
    backHref: 'camp.html#sembradora',
    backLabel: 'Tornar al capítol del camp',
    glb: 'assets/models/sembradora.glb',
    poster: 'assets/blender/out/sembradora-muntada.png',
    cameraOrbit: '24deg 70deg 4.6m',
    cameraTarget: '0m 0.68m 0m',
    fov: '35deg',
    detallImg: 'assets/blender/out/sembradora-detall.png',
    detallAlt: 'Detall de l’engranatge dosador de llautó, els tambors amb osques i els tres tubs per on cauen les llavors al solc',
    detallL: '2–4 · Engranatge, tambors dosadors i tubs',
    detallR: 'acosta al detall ↗',
    detallOrbit: '26deg 72deg 2.15m',
    detallTarget: '0.08m 0.72m 0.25m',
    ideaTitol: 'No llençar llavor a voleu: plantar en fileres exactes',
    ideaHtml: 'En comptes d’escampar el blat a mà (on els ocells se’n menjaven una gran part i creixia en males herbes), la màquina <strong>obre el solc, dosifica el gra un per un i el tapa</strong> en fileres paral·leles.',
    flowBtnLabel: 'Camí del gra i moviment',
    legendHot: 'Caiguda del gra i dosatge',
    legendCold: 'Obertura del solc i coberta',
    fonamentHtml: 'Reconstrucció de la sembradora de tres fileres basada en els gravats i tractats de <em>The Horse-Hoeing Husbandry</em> (Jethro Tull, 1731).',
    hotspots: {
      tremuja: { num: 1, titol: 'Tremuja de fusta amb blat', text: 'Dipòsit superior en forma d’embut que alimenta contínuament els tres compartiments dosadors sense embussos.', pos3d: [0.08, 1.34, 0.25] },
      dosador: { num: 2, titol: 'Engranatges i tambors dosadors', text: 'Rodes acanalades mogudes per l’eix de les rodes que recullen una dosi regular de llavor a cada gir.', pos3d: [0.08, 0.92, 0.45] },
      roda: { num: 3, titol: 'Rodes de fusta ferrades', text: 'Suporten tot el bastidor i transmeten el gir al mecanisme dosador: si l’arrossega el cavall, sembra sola; si s’atura, para.', pos3d: [0.05, 0.92, 0.8] },
      tub: { num: 4, titol: 'Tubs de caiguda fins al solc', text: 'Tres conductes verticals que protegeixen la llavor del vent i la dipositen just al fons de cada solc.', pos3d: [0.06, 0.48, 0.42] },
      rella: { num: 5, titol: 'Relles obresolcs', text: 'Tres puntes de ferro anteriors que tracen solcs paral·lels de profunditat uniforme davant de cada tub.', pos3d: [0.38, 0.2, 0.42] },
      rasclet: { num: 6, titol: 'Rasclet posterior col·lector', text: 'Unes pues posteriors arrosseguen terra fina sobre els tres solcs per enterrar el gra a resguard dels ocells.', pos3d: [-0.96, 0.3, 0.35] },
      bastidor: { num: 7, titol: 'Bastidor i llances de tir', text: 'Estructura de roure lleugera però rígida amb dues vares davanteres per enganxar-hi el cavall de tir.', pos3d: [0.72, 0.74, 0.64] },
      esteves: { num: 8, titol: 'Esteves de guia', text: 'Permeten al pagès mantenir les fileres ben rectes i aixecar les relles en girar al capdavall del camp.', pos3d: [-1.52, 1.08, 0.42] }
    },
    flows: [
      { id: 'sm-rot', cls: 'fl-hot', lbl: 'gir roda → dosador', fases: [0, 1], from: 'roda', to: 'dosador', dx1: -6, dy1: -8, dx2: 6, dy2: 4, ctrlDy: -14, lblDy: -10 },
      { id: 'sm-gra', cls: 'fl-hot', lbl: 'dosatge 3 fileres', fases: [1, 2], from: 'tremuja', to: 'tub', dx1: 0, dy1: 8, dx2: 0, dy2: -8, ctrlDx: 10, ctrlDy: 0, lblDx: 20, lblDy: 0 },
      { id: 'sm-solc', cls: 'fl-cold', lbl: 'obre solc', fases: [0, 2], from: 'rella', to: 'tub', dx1: -8, dy1: 0, dx2: 8, dy2: 4, ctrlDy: 10, lblDy: 12 },
      { id: 'sm-tap', cls: 'fl-cold', lbl: 'tapa el gra', fases: [3], from: 'tub', to: 'rasclet', dx1: -8, dy1: 4, dx2: 8, dy2: 0, ctrlDy: 12, lblDy: 12 }
    ],
    fases: [
      {
        curt: 'Obertura de tres solcs',
        titol: 'Les relles obren tres línies paral·leles',
        desc: 'En avançar el cavall, les tres puntes metàl·liques davanteres excaven tres solcs iguals i nets de males herbes.',
        pMin: 0.00,
        pJump: 0.15,
        chips: [['Relles: 3 solcs alhora', 'oberta'], ['Profunditat: uniforme', 'oberta']]
      },
      {
        curt: 'Dosatge sincronitzat',
        titol: 'L’engranatge fa girar els tambors amb osques',
        desc: 'La roda transmet gir proporcional: com més de pressa camina l’animal, més ràpid dosifica el blat sense malbaratar-ne.',
        pMin: 0.25,
        pJump: 0.40,
        chips: [['Estalvi: ~50 % de llavor', 'oberta'], ['Sincronia: roda → tambors', 'oberta']]
      },
      {
        curt: 'Caiguda protegida',
        titol: 'Les llavors cauen dins del solc pel tub',
        desc: 'Cap gra es perd pel vent: tots arriben a la profunditat ideal dins la terra humida.',
        pMin: 0.50,
        pJump: 0.65,
        chips: [['Tubs: caiguda precisa', 'oberta'], ['Germinació: molt alta', 'oberta']]
      },
      {
        curt: 'Coberta en fileres',
        titol: 'El rasclet tapa i deixa espai per escardar',
        desc: 'El rasclet posterior cobreix el blat i les fileres deixen passadissos nets per treure males herbes sense trepitjar el cultiu.',
        pMin: 0.75,
        pJump: 0.88,
        chips: [['Rasclet: protegeix d’ocells', 'oberta'], ['Fileres: fàcil de desherbar', 'oberta']]
      }
    ]
  },

  arada: {
    titol: 'L’arada de Rotherham',
    subtitol: '1730 · Joseph Foljambe i Walter Blith · Bastidor triangular lleuger de fusta, ganivet vertical, rella plana i orelló helicoïdal folrat de ferro.',
    badge: 'MODEL 3D',
    eyebrow: '1730 · Revolució agrícola · Llaurat ràpid amb 2 cavalls',
    backHref: 'camp.html#arada',
    backLabel: 'Tornar al capítol del camp',
    glb: 'assets/models/arada.glb',
    poster: 'assets/blender/out/arada-muntada.png',
    cameraOrbit: '22deg 70deg 4.2m',
    cameraTarget: '0m 0.58m 0m',
    fov: '35deg',
    detallImg: 'assets/blender/out/arada-detall.png',
    detallAlt: 'Detall del ganivet vertical, la rella triangular i la corba metàl·lica de l’orelló capgirant una gleva de terra',
    detallL: '1–3 · Ganivet, rella i orelló corbat de ferro',
    detallR: 'acosta al detall ↗',
    detallOrbit: '24deg 70deg 2.05m',
    detallTarget: '0.18m 0.36m 0.14m',
    ideaTitol: 'Corba helicoïdal i metall en lloc de fusta pesant',
    ideaHtml: 'Les arades medievals necessitaven 4 o 8 bous pel gran pes i fregament de la fusta. El bastidor triangular i l’<strong>orelló corbat de ferro</strong> tallen i capgiren la terra de cop amb <strong>només 2 cavalls i 1 pagès</strong>.',
    flowBtnLabel: 'Tall vertical, tall horitzontal i tomb',
    legendHot: 'Força de tir i tall d’acer',
    legendCold: 'Gleva tallada i bolcada',
    fonamentHtml: 'Reconstrucció basada en la patent de Joseph Foljambe (1730, Rotherham) i exemplars de museu agrari del segle XVIII.',
    hotspots: {
      cama: { num: 1, titol: 'Cama i bastidor triangular lleuger', text: 'Dues bigues planes sense rodes davanteres que alleugereixen el conjunt a menys de la meitat del pes tradicional.', pos3d: [0.45, 0.8, 0.06] },
      ganivet: { num: 2, titol: 'Ganivet vertical (coulter)', text: 'Fulla d’acer inclinada que fa el primer tall vertical separant la banda de terra del sòl sense llaurar.', pos3d: [0.64, 0.55, 0.06] },
      rella: { num: 3, titol: 'Rella triangular afuada', text: 'Talla la gleva horitzontalment per sota de les arrels de la gespa i les males herbes.', pos3d: [0.44, 0.22, 0.14] },
      orello: { num: 4, titol: 'Orelló helicoïdal folrat de ferro', text: 'La peça clau: eleva progressivament la tira de terra i la capgira 135° fent un mínim fregament.', pos3d: [-0.08, 0.36, 0.26] },
      esteves: { num: 5, titol: 'Dues esteves de control', text: 'Un sol pagès pot dirigir l’arada i controlar-ne la profunditat sense necessitat d’un ajudant per guiar els animals.', pos3d: [-1.45, 1.08, 0.22] }
    },
    flows: [
      { id: 'ar-vert', cls: 'fl-hot', lbl: 'tall vertical', fases: [0], from: 'cama', to: 'ganivet', dx1: 6, dy1: 8, dx2: 0, dy2: -8, ctrlDy: 0, lblDx: 18, lblDy: 0 },
      { id: 'ar-hor', cls: 'fl-hot', lbl: 'tall inferior', fases: [1], from: 'ganivet', to: 'rella', dx1: -6, dy1: 10, dx2: 6, dy2: -6, ctrlDy: 4, lblDx: 18, lblDy: 4 },
      { id: 'ar-tom', cls: 'fl-cold', lbl: 'capgira la gleva (135°)', fases: [2, 3], from: 'rella', to: 'orello', dx1: -8, dy1: 0, dx2: 8, dy2: 0, ctrlDy: -16, lblDy: -10 }
    ],
    fases: [
      {
        curt: 'Tall vertical del ganivet',
        titol: 'El ganivet marca l’amplada del solc',
        desc: 'La fulla vertical talla arrels i herbes en línia recta abans que arribi la rella, deixant un marge net.',
        pMin: 0.00,
        pJump: 0.15,
        chips: [['Ganivet: tall net vertical', 'oberta'], ['Tracció: només 2 cavalls', 'oberta']]
      },
      {
        curt: 'Tall horitzontal de la rella',
        titol: 'La rella aixeca la gleva per sota',
        desc: 'La punta triangular s’enfonsa sota la terra i deixa la gleva completament desenganxada per l’orelló.',
        pMin: 0.25,
        pJump: 0.40,
        chips: [['Rella: talla les arrels', 'oberta'], ['Fregament mínim', 'oberta']]
      },
      {
        curt: 'Gir suau per l’orelló',
        titol: 'La corba de ferro tomba i aireja el sòl',
        desc: 'La forma helicoïdal gira la terra cap al costat fent que les males herbes quedin enterrades a sota.',
        pMin: 0.50,
        pJump: 0.68,
        chips: [['Orelló: superfície polida', 'oberta'], ['Solc: airejat i net', 'oberta']]
      },
      {
        curt: 'Doble superfície llaurada',
        titol: 'Rendiment doble per jornada',
        desc: 'Un pagès amb una parella de cavalls passa de llaurar mitja hectàrea a prop d’una hectàrea sencera cada dia.',
        pMin: 0.75,
        pJump: 0.90,
        chips: [['1 sol pagès · 2 cavalls', 'oberta'], ['Productivitat: ×2', 'oberta']]
      }
    ]
  },

  altforn: {
    titol: 'L’alt forn de coc',
    subtitol: '1709 · Abraham Darby · Substitució del carbó vegetal per coc mineral, injecció d’aire forçat per toveres i producció contínua de ferro colat (lingots).',
    badge: 'MODEL 3D',
    eyebrow: '1709 · Coalbrookdale · Siderúrgia a gran escala',
    backHref: 'metalls.html#altforn',
    backLabel: 'Tornar al capítol dels metalls',
    glb: 'assets/models/altforn.glb',
    poster: 'assets/blender/out/altforn-muntada.png',
    cameraOrbit: '10deg 74deg 7.8m',
    cameraTarget: '0m 1.55m 0m',
    fov: '35deg',
    detallImg: 'assets/blender/out/altforn-detall.png',
    detallAlt: 'Detall de les capes interiors de l’alt forn seccionat, la tovera d’aire a pressió, l’escòria i la colada de ferro colat cap al llit de sorra',
    detallL: '4–6 · Tovera d’aire, gresol i llit de lingots',
    detallR: 'acosta al detall ↗',
    detallOrbit: '12deg 74deg 3.5m',
    detallTarget: '0m 0.68m 0.15m',
    ideaTitol: 'El coc no s’aixafa i permet forns gegants',
    ideaHtml: 'El carbó de fusta feia esfondrar la càrrega als forns alts i havia desforestat Anglaterra. El <strong>coc</strong> (carbó de pedra purificat) suporta el pes de torres de pedra de més de 15 metres i funda ferro de manera contínua.',
    flowBtnLabel: 'Descens de càrrega i buf d’aire',
    legendHot: 'Ferro fos i gasos calents',
    legendCold: 'Aire fred forçat de la bufadora',
    fonamentHtml: 'Reconstrucció de l’alt forn de coc del segle XVIII inspirada en el forn conservat de <a href="https://www.ironbridge.org.uk/" target="_blank" rel="noopener">Coalbrookdale (Ironbridge)</a>.',
    hotspots: {
      carrega: { num: 1, titol: 'Pont de càrrega i vagoneta', text: 'Des d’un talús lateral s’aboquen capes alternes de mineral de ferro (vermell), coc (negre) i pedra calcària (blanca).', pos3d: [0.85, 2.95, -0.05], orbit: '14deg 72deg 3.2m' },
      cuba: { num: 2, titol: 'Cuba refractària amb capes', text: 'A mesura que la càrrega baixa cap a l’interior, els gasos ascendents escalfen i redueixen químicament l’òxid de ferro.', pos3d: [0.0, 2.05, -0.02], orbit: '6deg 76deg 2.8m' },
      bufadora: { num: 3, titol: 'Cilindre bufador de ferro colat', text: 'Un gran pistó mogut per roda hidràulica o màquina de vapor envia un corrent d’aire potent i continu.', pos3d: [-2.25, 1.15, 0.1], orbit: '14deg 74deg 2.8m' },
      toveres: { num: 4, titol: 'Tovera d’injecció d’aire', text: 'Broquet cònic que concentra el buf d’aire fins a superar els 1.500 °C just a la zona de fusió del ventre.', pos3d: [-0.55, 0.92, -0.05], orbit: '6deg 76deg 2.2m' },
      gresol: { num: 5, titol: 'Gresol: ferro líquid i escòria', text: 'El ferro fos pesant s’acumula al fons i les impureses (combinades amb la calcària) floten a sobre en forma d’escòria.', pos3d: [0.0, 0.56, 0.1], orbit: '8deg 76deg 2.2m' },
      llit: { num: 6, titol: 'Colada al llit de sorra (lingots)', text: 'S’obre la piquera i el ferro colat roent corre pels canals de sorra omplint motlles de lingots («truges i garrins»).', pos3d: [0.0, 0.38, 0.82], orbit: '14deg 64deg 2.8m' }
    },
    flows: [
      { id: 'af-desc', cls: 'fl-hot', lbl: 'capes baixen escalfant-se', fases: [0], from: 'carrega', to: 'cuba', dx1: -10, dy1: 4, dx2: 10, dy2: -8, ctrlDy: -8, lblDy: -10 },
      { id: 'af-aire', cls: 'fl-cold', lbl: 'aire forçat (>1.500 °C)', fases: [1], from: 'bufadora', to: 'toveres', dx1: 8, dy1: 0, dx2: -8, dy2: 2, ctrlDy: 8, lblDy: 14 },
      { id: 'af-fosa', cls: 'fl-hot', lbl: 'ferro fos → lingots', fases: [2, 3], from: 'gresol', to: 'llit', dx1: 0, dy1: 8, dx2: 0, dy2: -8, ctrlDx: 14, ctrlDy: 0, lblDx: 26, lblDy: 0 }
    ],
    fases: [
      {
        curt: 'Càrrega per capes',
        titol: 'Mineral de ferro + coc + calcària pel cim',
        desc: 'La vagoneta aboca capes alternes que formen columnes poroses perquè el foc i l’aire pugin sense ofegar-se.',
        pMin: 0.00,
        pJump: 0.12,
        chips: [['Coc: suport i calor', 'oberta'], ['Calcària: atrapa impureses', 'oberta']]
      },
      {
        curt: 'Buf d’aire a les toveres',
        titol: 'La bufadora eleva la temperatura a 1.500 °C',
        desc: 'El pistó injecta oxigen al cor del forn per fondre el metall i separar el carboni sobrant cap a l’escòria.',
        pMin: 0.25,
        pJump: 0.40,
        chips: [['Bufadora: aire a pressió', 'oberta'], ['Zona de fusió: >1.500 °C', 'oberta']]
      },
      {
        curt: 'Separació al gresol',
        titol: 'L’escòria flota sobre el ferro colat',
        desc: 'Com que pesa menys, l’escòria sura formant una capa protectora damunt del bany metàl·lic brillant.',
        pMin: 0.50,
        pJump: 0.65,
        chips: [['Fons: ferro colat (4 % C)', 'oberta'], ['Sobre: escòria líquida', 'tancada']]
      },
      {
        curt: 'Colada i lingots',
        titol: 'Ompliment del llit de sorra en lingots',
        desc: 'El ferro s’aboca en canals i solidifica en barres per construir ponts, canonades, màquines o tornar a refinar.',
        pMin: 0.75,
        pJump: 0.88,
        chips: [['Producció contínua', 'oberta'], ['Producte: ferro colat', 'oberta']]
      }
    ]
  },

  pudelat: {
    titol: 'El forn de pudelat i laminador',
    subtitol: '1784 · Henry Cort · Forn de reverber on les flames no toquen el metall, remenada manual per cremar el carboni i laminador de corrons acanalats.',
    badge: 'MODEL 3D',
    eyebrow: '1784 · Refinació del ferro dolç en barra',
    backHref: 'metalls.html#pudelat',
    backLabel: 'Tornar al capítol dels metalls',
    glb: 'assets/models/pudelat.glb',
    poster: 'assets/blender/out/pudelat-muntada.png',
    cameraOrbit: '8deg 75deg 8.2m',
    cameraTarget: '-0.1m 1.38m 0m',
    fov: '35deg',
    detallImg: 'assets/blender/out/pudelat-detall.png',
    detallAlt: 'Detall del laminador de corrons d’acer acanalats estirant la barra roent de ferro pudelat',
    detallL: '6 · Corrons acanalats del laminador de Cort',
    detallR: 'acosta al detall ↗',
    detallOrbit: '36deg 72deg 3.1m',
    detallTarget: '1.55m 1.12m 0m',
    ideaTitol: 'Refinar amb carbó sense contaminar de sofre el ferro',
    ideaHtml: 'El ferro colat tenia massa carboni (4 %) i era fràgil. Cort el va fondre en una cambra separada només amb l’<strong>escalfor reflectida de les flames</strong> perquè no toqués el sofre del carbó, remenant-lo fins tornar-lo ferro dolç mal·leable.',
    flowBtnLabel: 'Flames reverberants i laminat',
    legendHot: 'Flama reflectida i barra roent',
    legendCold: 'Remenada oxidant i sortida de fums',
    fonamentHtml: 'Reconstrucció basada en les patents de Henry Cort (1783–1784) per al forn de reverber i els corrons laminadors acanalats.',
    hotspots: {
      fogar: { num: 1, titol: 'Fogar de hulla separat', text: 'Crema hulla corrent amb tir intens; un mur refractori baix impedeix que la cendra o el carbó toquin el ferro.', pos3d: [-2.16, 0.92, 0.05] },
      forn: { num: 2, titol: 'Volta de reverber corba', text: 'El sostre inclinat reflecteix la radiació i les flames directament cap avall sobre la sola de ferro.', pos3d: [-1.35, 1.56, 0.05] },
      sola: { num: 3, titol: 'Sola de fusió del ferro colat', text: 'Conté el bany de ferro colat fos; a mesura que perd carboni, el punt de fusió puja i es formen grumolls sòlids.', pos3d: [-1.03, 0.94, 0.1] },
      pudelador: { num: 4, titol: 'Barra llarga del pudelador', text: 'L’operari remena contínuament el bany («puddling») fins agrupar boles pastoses de ferro pur («loupes»).', pos3d: [-0.98, 1.12, 0.75] },
      xemeneia: { num: 5, titol: 'Xemeneia de tir alt', text: 'Crea una forta aspiració que fa passar les flames damunt del bany metàl·lic cap a la sortida.', pos3d: [-0.24, 2.65, -0.1] },
      laminador: { num: 6, titol: 'Laminador de corrons acanalats', text: 'Substitueix el martell lent: comprimeix i expulsa l’escòria en pocs segons estirant barres i rails perfectes (15× més ràpid).', pos3d: [1.65, 1.15, 0.18] }
    },
    flows: [
      { id: 'pd-rev', cls: 'fl-hot', lbl: 'flama reflectida sense contacte', fases: [0], from: 'fogar', to: 'forn', dx1: 6, dy1: -8, dx2: -8, dy2: 6, ctrlDy: -12, lblDy: -10 },
      { id: 'pd-cal', cls: 'fl-hot', lbl: 'descarburació sobre la sola', fases: [1], from: 'forn', to: 'sola', dx1: 4, dy1: 8, dx2: -4, dy2: -8, ctrlDx: 14, ctrlDy: 0, lblDx: 24, lblDy: 0 },
      { id: 'pd-rem', cls: 'fl-cold', lbl: 'remena i agrupa boles', fases: [2], from: 'pudelador', to: 'sola', dx1: 0, dy1: -8, dx2: 0, dy2: 6, ctrlDx: -14, ctrlDy: 0, lblDx: -20, lblDy: 0 },
      { id: 'pd-lam', cls: 'fl-hot', lbl: 'esprem i estira en barra', fases: [3], from: 'sola', to: 'laminador', dx1: 12, dy1: 0, dx2: -12, dy2: 0, ctrlDy: -14, lblDy: -10 }
    ],
    fases: [
      {
        curt: 'Flama de reverber',
        titol: 'El foc crema separat del metall',
        desc: 'La hulla crema al fogar esquerre i la volta corba desvia les flames per damunt del mur sense contaminar el ferro amb sofre.',
        pMin: 0.00,
        pJump: 0.14,
        chips: [['Sense contacte carbó-ferro', 'oberta'], ['Volta: reflexió tèrmica', 'oberta']]
      },
      {
        curt: 'Pudelat oxidant',
        titol: 'El pudelador remena i crema el carboni',
        desc: 'En remenar el bany líquid amb la barra, l’oxigen crema el carboni sobrant i el metall comença a quallar en boles.',
        pMin: 0.25,
        pJump: 0.38,
        chips: [['Carboni baixa de 4 % a <0,2 %', 'oberta'], ['Es formen boles pastoses', 'oberta']]
      },
      {
        curt: 'Extracció roent',
        titol: 'La bola surt llesta per esprémer l’escòria',
        desc: 'S’extreu la massa roent de ferro forjable barrejada encara amb escòria fosa cap a la premsa de corrons.',
        pMin: 0.50,
        pJump: 0.62,
        chips: [['Ferro dolç mal·leable', 'oberta'], ['Xemeneia: tir constant', 'oberta']]
      },
      {
        curt: 'Laminat en barres',
        titol: 'Corrons acanalats: 15 vegades més ràpid que el martell',
        desc: 'Els dos corrons d’acer giren en sentits contraris i converteixen la bola en una barra o rail llarg i homogeni.',
        pMin: 0.75,
        pJump: 0.90,
        chips: [['Ritme: 15× més ràpid', 'oberta'], ['Bigues i rails industrials', 'oberta']]
      }
    ]
  },

  bessemer: {
    titol: 'El convertidor Bessemer (acer en minuts)',
    subtitol: '1856 · Henry Bessemer · Pera metàl·lica basculant folrada de maó refractari on s’injecta aire fred pel fons per cremar el carboni sense combustible extra.',
    badge: 'MODEL 3D',
    eyebrow: '1856 · Segona fase siderúrgica · Acer massiu i barat',
    backHref: 'metalls.html#bessemer',
    backLabel: 'Tornar al capítol dels metalls',
    glb: 'assets/models/bessemer.glb',
    poster: 'assets/blender/out/bessemer-muntada.png',
    cameraOrbit: '8deg 75deg 5.6m',
    cameraTarget: '-0.1m 1.55m 0m',
    fov: '35deg',
    detallImg: 'assets/blender/out/bessemer-detall.png',
    detallAlt: 'Detall de la secció del convertidor Bessemer amb el maó refractari, les cinc toveres de llautó i els dolls d’aire bufant el ferro fos',
    detallL: '1–2 · Bany refractari i toveres d’aire al fons',
    detallR: 'acosta al detall ↗',
    detallOrbit: '8deg 76deg 2.65m',
    detallTarget: '0m 1.25m 0.1m',
    ideaTitol: 'El propi silici i carboni fan de combustible',
    ideaHtml: 'Convertir ferro colat en acer costava dies i tones de carbó. Bessemer va descobrir que bufant <strong>aire fred directament pel fons</strong> dins el ferro fos, el silici i el carboni s’oxiden tan de pressa que escalfen el bany i fan <strong>acer en 20 minuts</strong>.',
    flowBtnLabel: 'Buf d’aire i basculament',
    legendHot: 'Reacció exotèrmica i acer fos',
    legendCold: 'Aire comprimit per l’eix i toveres',
    fonamentHtml: 'Reconstrucció basada en el convertidor basculant patentat per Sir Henry Bessemer (1856) i la instal·lació de Sheffield.',
    hotspots: {
      convertidor: { num: 1, titol: 'Pera basculant amb maó refractari', text: 'Carcassa d’acer en forma de pera amb folre gruixut de maó refractari que conté el bany de ferro roent.', pos3d: [0.0, 1.85, 0.35], orbit: '8deg 75deg 3.0m' },
      toveres: { num: 2, titol: 'Fons perforat amb toveres de llautó', text: 'Injecta dolls d’aire a alta pressió des de baix perquè travessin tota la massa líquida en bombolles.', pos3d: [0.0, 0.92, 0.1], orbit: '6deg 76deg 2.2m' },
      eix: { num: 3, titol: 'Eix buit (munyó) i cremallera', text: 'Permet fer bascular la pera per carregar o colar sense aturar el pas de l’aire pel conducte intern.', pos3d: [1.18, 1.98, 0.15], orbit: '22deg 74deg 2.6m' },
      cullera: { num: 4, titol: 'Cullera receptora d’acer fos', text: 'Recull l’acer líquid acabat quan el convertidor bascula al final dels 20 minuts de bufada.', pos3d: [-1.68, 0.77, 0.4], orbit: '18deg 70deg 2.6m' }
    },
    flows: [
      { id: 'bs-aire', cls: 'fl-cold', lbl: 'aire pel munyó buit', fases: [0, 1], from: 'eix', to: 'toveres', dx1: -4, dy1: 8, dx2: 8, dy2: 0, ctrlDx: 12, ctrlDy: 12, lblDx: 18, lblDy: 10 },
      { id: 'bs-flama', cls: 'fl-hot', lbl: 'oxidació (sense carbó extra)', fases: [1, 2], from: 'toveres', to: 'convertidor', dx1: 0, dy1: -8, dx2: 0, dy2: 8, ctrlDx: -14, ctrlDy: 0, lblDx: -24, lblDy: 0 },
      { id: 'bs-col', cls: 'fl-hot', lbl: 'bascula i cola l’acer', fases: [3], from: 'convertidor', to: 'cullera', dx1: -10, dy1: 0, dx2: 8, dy2: -8, ctrlDy: -16, lblDy: -10 }
    ],
    fases: [
      {
        curt: 'Càrrega horitzontal',
        titol: 'S’aboca el ferro colat fos dins la pera inclinada',
        desc: 'Inclinant el convertidor s’omple de ferro líquid procedent de l’alt forn abans d’obrir les toveres.',
        pMin: 0.00,
        pJump: 0.12,
        chips: [['Ferro colat fos carregat', 'oberta'], ['Eix: gir sobre munyons', 'oberta']]
      },
      {
        curt: 'Bufada vertical d’aire',
        titol: 'Les toveres disparen aire a pressió pel fons',
        desc: 'En posar-lo dret, l’aire travessa el metall: crema el silici i el carboni fent pujar la temperatura sense afegir carbó.',
        pMin: 0.25,
        pJump: 0.40,
        chips: [['Aire comprimit: actiu', 'oberta'], ['Sense combustible extern', 'oberta']]
      },
      {
        curt: 'Flama blanca i dosatge',
        titol: '20 minuts després: acer de composició exacta',
        desc: 'Quan la flama de la boca baixa, tot el carboni s’ha cremat; s’hi afegeix una dosi petita i exacta de manganès i carboni.',
        pMin: 0.50,
        pJump: 0.65,
        chips: [['Durada: ~20 minuts', 'oberta'], ['Acer tenaç i elàstic', 'oberta']]
      },
      {
        curt: 'Basculament a la cullera',
        titol: 'Colada massiva per a rails, ponts i vaixells',
        desc: 'La pera bascula cap a l’esquerra i omple la cullera d’acer fos, multiplicant la producció per deu i abaixant-ne el preu.',
        pMin: 0.75,
        pJump: 0.90,
        chips: [['Preu de l’acer: cau -80 %', 'oberta'], ['Rails i grans estructures', 'oberta']]
      }
    ]
  },

  hidraulica: {
    titol: 'La fàbrica hidràulica de tres plantes',
    subtitol: '1771 · Richard Arkwright (Cromford) · Roda hidràulica exterior, arbre vertical mestre, eixos de sostre i corretges movent tres pisos de cardes, filadores i telers.',
    badge: 'MODEL 3D',
    eyebrow: '1771 · Naixement del sistema fabril',
    backHref: 'fabrica.html#hidraulica',
    backLabel: 'Tornar al capítol de la fàbrica',
    glb: 'assets/models/hidraulica.glb',
    poster: 'assets/blender/out/hidraulica-muntada.png',
    cameraOrbit: '8deg 75deg 9.4m',
    cameraTarget: '0m 1.75m 0m',
    fov: '35deg',
    detallImg: 'assets/blender/out/hidraulica-detall.png',
    detallAlt: 'Detall del canal amb aigua caient sobre la roda hidràulica i els engranatges cònics que mouen l’arbre vertical dels tres pisos',
    detallL: '1–3 · Roda hidràulica, arbre mestre i politges',
    detallR: 'acosta al detall ↗',
    detallOrbit: '12deg 76deg 4.6m',
    detallTarget: '-1.35m 1.55m 0m',
    ideaTitol: 'Tota la nau moguda per un riu i un sol eix vertical',
    ideaHtml: 'Les màquines eren massa pesants per tenir-les a casa. Arkwright les reuneix totes en un <strong>edifici de tres pisos vora el riu</strong>: la roda mou un arbre vertical, els eixos del sostre reparteixen el gir i totes les màquines marquen un mateix ritme horari.',
    flowBtnLabel: 'Flux de força d’aigua i producció',
    legendHot: 'Transmissió mecànica de força',
    legendCold: 'Aigua motriu i flux de cotó',
    fonamentHtml: 'Reconstrucció esquemàtica en secció inspirada en el conjunt fabril de <a href="https://www.cromfordmills.org.uk/" target="_blank" rel="noopener">Cromford Mill (1771)</a>.',
    hotspots: {
      motor: { num: 1, titol: 'Roda hidràulica de catúfols', text: 'El canal elevat aboca l’aigua des de dalt omplint els catúfols de fusta i aprofitant tot el pes del salt d’aigua.', pos3d: [-2.15, 1.45, 0.1] },
      arbre: { num: 2, titol: 'Arbre mestre vertical', text: 'Columnna d’acer amb engranatges cònics que puja la força mecànica des de la roda fins a totes tres plantes.', pos3d: [-0.72, 2.05, 0.0] },
      eixos: { num: 3, titol: 'Eixos horitzontals del sostre', text: 'Recorren tota la longitud de cada pis carregats de politges de fosa.', pos3d: [0.85, 2.36, 0.0] },
      corretges: { num: 4, titol: 'Corretges planes de cuir', text: 'Baixen des de cada politja del sostre per accionar individualment cardes, filadores i telers.', pos3d: [1.15, 1.98, -0.05] },
      cardes: { num: 5, titol: 'Planta baixa: cardes de cotó', text: 'Tambors giratoris que desenreden i paral·lelitzen les fibres en metxa abans de filar-les.', pos3d: [1.15, 0.65, 0.0] },
      filadores: { num: 6, titol: 'Primera planta: filadores', text: 'Bancs de filatura amb múltiples fusos movent-se en sincronia amb les corretges superiors.', pos3d: [1.15, 1.72, 0.0] },
      telers: { num: 7, titol: 'Segona planta: telers mecànics', text: 'Teixeixen les peces de cotó tenyit aprofitant el mateix embarrat general.', pos3d: [1.15, 2.82, 0.0] },
      coto: { num: 8, titol: 'Bales de cotó i teixit acabat', text: 'El cotó en brut entra per baix i surt amunt convertit en rotllos de roba llesta per vendre.', pos3d: [2.55, 0.55, 0.15] }
    },
    flows: [
      { id: 'fh-mot', cls: 'fl-cold', lbl: 'força de l’aigua → arbre', fases: [0], from: 'motor', to: 'arbre', dx1: 8, dy1: -4, dx2: -8, dy2: 4, ctrlDy: -12, lblDy: -10 },
      { id: 'fh-eix', cls: 'fl-hot', lbl: 'reparteix pels 3 pisos', fases: [1], from: 'arbre', to: 'eixos', dx1: 8, dy1: 0, dx2: -8, dy2: 0, ctrlDy: -10, lblDy: -8 },
      { id: 'fh-cor', cls: 'fl-hot', lbl: 'corretges cap a màquines', fases: [2], from: 'eixos', to: 'filadores', dx1: 4, dy1: 6, dx2: 0, dy2: -8, ctrlDx: 14, ctrlDy: 0, lblDx: 24, lblDy: 0 },
      { id: 'fh-pro', cls: 'fl-cold', lbl: 'cotó → fil → tela', fases: [3], from: 'cardes', to: 'telers', dx1: 12, dy1: 0, dx2: 12, dy2: 0, ctrlDx: 22, ctrlDy: 0, lblDx: 30, lblDy: 0 }
    ],
    fases: [
      {
        curt: 'Energia hidràulica',
        titol: 'El riu posa en marxa tota la fàbrica',
        desc: 'L’aigua cau sobre la roda exterior i fa girar l’arbre mestre. Sense aigua o en temps de sequera, la fàbrica queda aturada.',
        pMin: 0.00,
        pJump: 0.14,
        chips: [['Localització: obligada vora riu', 'tancada'], ['Energia renovable', 'oberta']]
      },
      {
        curt: 'Arbre i eixos de sostre',
        titol: 'Els engranatges cònics pugen la força',
        desc: 'Un sol eix vertical transmet moviment simultani als embarrats horitzontals de totes tres plantes.',
        pMin: 0.25,
        pJump: 0.38,
        chips: [['3 plantes acoblades', 'oberta'], ['Pèrdues per fregament baixes', 'oberta']]
      },
      {
        curt: 'Corretges i ritme comú',
        titol: 'Totes les màquines treballen a la mateixa cadència',
        desc: 'Les corretges baixen fins a cada banc: l’obrer ja no marca el ritme amb la mà, sinó que s’adapta a la màquina.',
        pMin: 0.50,
        pJump: 0.65,
        chips: [['Disciplina horària rígida', 'oberta'], ['Divisió per fases', 'oberta']]
      },
      {
        curt: 'Producció vertical',
        titol: 'Cardar a baix, filar al mig, teixir a dalt',
        desc: 'El procés s’ordena per pisos: les bales pesants entren a planta baixa i els rotllos de teixit acaben a dalt.',
        pMin: 0.75,
        pJump: 0.88,
        chips: [['Flux continu en 3 pisos', 'oberta'], ['Preu tèxtil molt més baix', 'oberta']]
      }
    ]
  },

  vaporera: {
    titol: 'La fàbrica urbana moguda per vapor',
    subtitol: '1785+ · Fàbrica de carbó i vapor · Caldera i xemeneia de maó, màquina de vapor horitzontal amb volant i la mateixa transmissió d’arbre i corretges dins la ciutat.',
    badge: 'MODEL 3D',
    eyebrow: '1785+ · Del riu a la ciutat carbonífera',
    backHref: 'fabrica.html#vaporera',
    backLabel: 'Tornar al capítol de la fàbrica',
    glb: 'assets/models/vaporera.glb',
    poster: 'assets/blender/out/vaporera-muntada.png',
    cameraOrbit: '8deg 75deg 9.6m',
    cameraTarget: '-0.15m 1.75m 0m',
    fov: '35deg',
    detallImg: 'assets/blender/out/vaporera-detall.png',
    detallAlt: 'Detall de la caldera, el cilindre de vapor horitzontal, el volant d’inèrcia i l’acoblament a l’arbre vertical de la fàbrica',
    detallL: '1–3 · Màquina de vapor acoblada a l’arbre vertical',
    detallR: 'acosta al detall ↗',
    detallOrbit: '12deg 76deg 4.6m',
    detallTarget: '-1.35m 1.55m 0m',
    ideaTitol: 'Trencar la dependència dels rius i treballar sense aturades',
    ideaHtml: 'Amb la <strong>caldera i màquina de vapor</strong>, la fàbrica ja no necessita salts d’aigua ni s’atura amb les sequeres o glaçades. Es trasllada a les <strong>ciutats prop dels ports, canals i mines de carbó</strong>, multiplicant l’escala industrial.',
    flowBtnLabel: 'Caldera, vapor i transmissió urbana',
    legendHot: 'Foc, vapor i transmissió mecànica',
    legendCold: 'Producció fabril en 3 plantes',
    fonamentHtml: 'Reconstrucció comparativa d’una fàbrica tèxtil de vapor de Manchester o Terrassa del segle XIX (vapors textils urbans).',
    hotspots: {
      caldera: { num: 1, titol: 'Fogar de carbó i caldera de vapor', text: 'Crema carbó mineral de manera ininterrompuda sense dependre del cabal ni del clima.', pos3d: [-2.95, 1.05, 0.0] },
      xemeneia: { num: 2, titol: 'Xemeneia alta de maó', text: 'Garanteix un tir intens per al foc i eleva els fums per sobre les teulades del barri obrer.', pos3d: [-3.5, 3.25, -0.2] },
      motor: { num: 3, titol: 'Màquina de vapor horitzontal i volant', text: 'El cilindre i el gran volant donen gir regular tot l’any i s’acoblen directe a l’arbre mestre.', pos3d: [-1.72, 1.56, 0.0] },
      arbre: { num: 4, titol: 'Arbre vertical mestre', text: 'Recull la potència del motor de vapor i la reparteix per tot l’edifici com a la fàbrica hidràulica.', pos3d: [-0.72, 2.05, 0.0] },
      eixos: { num: 5, titol: 'Embarrats del sostre', text: 'Fan girar desenes de politges simultàniament amb velocitat estabilitzada pel volant d’inèrcia.', pos3d: [0.85, 2.36, 0.0] },
      corretges: { num: 6, titol: 'Corretges de transmissió', text: 'Connecten l’embarrat amb cada màquina mitjançant politges fixes o boges per acoblar-les i aturar-les.', pos3d: [1.15, 1.98, -0.05] },
      cardes: { num: 7, titol: 'Planta baixa: cardes', text: 'Preparen la metxa de cotó de manera contínua durant jornades de dotze o catorze hores.', pos3d: [1.15, 0.65, 0.0] },
      filadores: { num: 8, titol: 'Planta mitjana: filadores', text: 'Centenars de fusos treballant a la ciutat prop de mà d’obra i canals de transport.', pos3d: [1.15, 1.72, 0.0] },
      telers: { num: 9, titol: 'Planta alta: telers mecànics', text: 'El vapor permet moure telers pesants a ritme constant tant d’hivern com d’estiu.', pos3d: [1.15, 2.82, 0.0] },
      coto: { num: 10, titol: 'Matèria primera i teixit acabat', text: 'Proximitat immediata a estacions de ferrocarril i ports per importar cotó i exportar teles arreu.', pos3d: [2.55, 0.55, 0.15] }
    },
    flows: [
      { id: 'fv-vap', cls: 'fl-hot', lbl: 'vapor → cilindre → volant', fases: [0], from: 'caldera', to: 'motor', dx1: 6, dy1: -8, dx2: -8, dy2: 6, ctrlDy: -12, lblDy: -10 },
      { id: 'fv-arb', cls: 'fl-hot', lbl: 'força constant 24 h', fases: [1], from: 'motor', to: 'arbre', dx1: 8, dy1: 0, dx2: -8, dy2: 0, ctrlDy: -10, lblDy: -8 },
      { id: 'fv-cor', cls: 'fl-hot', lbl: 'embarrat i corretges', fases: [2], from: 'eixos', to: 'filadores', dx1: 4, dy1: 6, dx2: 0, dy2: -8, ctrlDx: 14, ctrlDy: 0, lblDx: 24, lblDy: 0 },
      { id: 'fv-pro', cls: 'fl-cold', lbl: 'producció urbana contínua', fases: [3], from: 'cardes', to: 'telers', dx1: 12, dy1: 0, dx2: 12, dy2: 0, ctrlDx: 22, ctrlDy: 0, lblDx: 30, lblDy: 0 }
    ],
    fases: [
      {
        curt: 'Caldera de carbó',
        titol: 'Energia independent de rius i clima',
        desc: 'Mentre arribi carbó mineral, la caldera produeix vapor tant a l’estiu sec com a les glaçades d’hivern.',
        pMin: 0.00,
        pJump: 0.14,
        chips: [['Ubicació lliure a ciutat', 'oberta'], ['Sense aturades per sequera', 'oberta']]
      },
      {
        curt: 'Transmissió pel volant',
        titol: 'Del cilindre horitzontal a tota la nau',
        desc: 'El volant regula el gir i els engranatges cònics porten la mateixa potència a tots tres pisos.',
        pMin: 0.25,
        pJump: 0.38,
        chips: [['Potència regular i escalable', 'oberta'], ['Arbre mestre vertical', 'oberta']]
      },
      {
        curt: 'Treball a gran escala',
        titol: 'Concentració obrera als barris industrials',
        desc: 'Desenes de màquines dins un sol edifici multipliquen el volum produït i transformen el paisatge urbà amb les xemeneies.',
        pMin: 0.50,
        pJump: 0.65,
        chips: [['Fàbriques urbanes i barris obrers', 'oberta'], ['Ritme continu de dia i nit', 'oberta']]
      },
      {
        curt: 'Connexió port-ferrocarril',
        titol: 'El vapor mou la fàbrica i també el transport',
        desc: 'Les bales arriben en tren o vaixell i les teles acaben carregades ràpidament cap als mercats globals.',
        pMin: 0.75,
        pJump: 0.88,
        chips: [['Producció + transport integrats', 'oberta'], ['Indústria moderna consolidada', 'oberta']]
      }
    ]
  }
};

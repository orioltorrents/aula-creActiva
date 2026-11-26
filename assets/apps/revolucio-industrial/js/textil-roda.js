// SPDX-License-Identifier: AGPL-3.0-or-later
RI.RODA_ESCENA = {
  id:'roda', nom:'La roda de filar', any:'abans de la mecanització', qui:'Roda manual de fus', durada:16,
  model:'Roda manual de fus · cicle esquemàtic alentit',
  pregunta:'Com es transforma el cotó cardat en un fil?',
  intro:'Una mà mou la roda i l’altra controla la fibra. El fus <b>torça</b> el cotó estirat; després s’hi <b>enrotlla</b> el fil. Es treballa un sol fil cada vegada.',
  innovacio:{abans:'El fus es fa girar directament amb la mà',ara:'La roda transmet el gir al fus'},
  fases:[
    {fins:.15,nom:'Preparar la fibra',text:'La mà subjecta una metxa de cotó cardat prop de la punta del fus.',focus:['fibra']},
    {fins:.57,nom:'Estirar i donar torsió',text:'La mà s’allunya del fus i deixa lliscar les fibres. La roda acciona el fus: la torsió uneix les fibres i forma el fil.',focus:['fibra','fus']},
    {fins:.72,nom:'Preparar la recollida',text:'S’acaba de donar torsió i es desfà una mica el fil de la punta. La mà el situa de costat per poder enrotllar-lo.',focus:['fus']},
    {fins:1,nom:'Enrotllar al fus',text:'La mà s’acosta mentre el fus recull el fil ja fet. El petit con de fil creix. Després es prepara un altre tram.',focus:['fus','fibra']}
  ],
  parts:{
    bastidor:{nom:'Banc i suports',text:'Mantenen els eixos de la roda i del fus paral·lels i subjecten la màquina.'},
    roda:{nom:'Roda manual',text:'La persona la fa girar amb una mà. La roda gran acciona la petita politja del fus.'},
    corretja:{nom:'Corretja',text:'Transmet el moviment de la roda al fus. La politja petita fa més voltes que la roda gran.'},
    fus:{nom:'Fus i con de fil',text:'El fus gira per donar torsió al fil. En una fase separada, el fil es col·loca de costat i s’enrotlla formant un con.'},
    fibra:{nom:'Mà, fibra i fil',text:'Els dits regulen l’estiratge. Les fibres llisquen unes respecte de les altres; la torsió les manté unides.'}
  },
  clau:'La roda facilita el gir del fus, però la persona encara regula cada tram i treballa un sol fil.',
  batx:{titol:'El punt de partida de la mecanització',text:'Aquesta roda manual de fus és del tipus anomenat great wheel, utilitzat per a llana i també cotó. Estirar i tòrcer precedeix l’enrotllament. La Jenny multiplica els fusos; els corrons mecanitzen l’estiratge. No s’ha de confondre amb la roda de Saxònia de pedal i aleta, habitual en altres fibres.',font:'https://collection.sciencemuseumgroup.org.uk/objects/co44851/great-wheel',fontNom:'Science Museum Group · roda manual de fus'}
};

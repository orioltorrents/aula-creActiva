// SPDX-License-Identifier: AGPL-3.0-or-later
/* Teler mecànic: principi horitzontal de les millores de Cartwright,
   1787–1790. La data de 1785 identifica la primera patent, no aquest model. */
(function(){
  'use strict';
  const TAU=Math.PI*2;
  const clamp=q=>Math.max(0,Math.min(1,q));
  const ease=q=>{q=clamp(q);return q*q*(3-2*q);};
  const seg=(p,a,b)=>ease((p-a)/(b-a));
  const mix=(a,b,q)=>a+(b-a)*q;
  function state(p){
    p=clamp(p);const half=p<.5?0:1,q=p===1?1:p*2-half,sign=half===0?1:-1;
    const angle=TAU*2*p+Math.PI;
    const crank=[430,-297+35*Math.cos(angle),100+35*Math.sin(angle)];
    const y=crank[1]+Math.sqrt(180*180-(100-crank[2])**2);
    const x=mix(-325*sign,325*sign,seg(q,.30,.60));
    const shed=mix(-sign,sign,seg(q,0,.20));
    const centre=310-40*(40-y)/195,halfGap=45*Math.abs(shed)*(1-(40-y)/195);
    const kick=12*(seg(q,.30,.34)-seg(q,.34,.40));
    const wefts=[];
    if(p>=.15)wefts.push({y:p>=.5?-155:y,amount:p>=.5?1:clamp((x+270)/540),reverse:false});
    if(p>=.65)wefts.push({y:p>=.999?-152:y,amount:clamp((270-x)/540),reverse:true});
    const step=q<.30?0:q<.60?1:2;
    return {x,y,shed,boatY:y,boatZ:centre,upperZ:centre+halfGap,lowerZ:centre-halfGap,
      angle,camAngle:-TAU*p,crank,rodEnd:[430,y,100],half,q,step,
      pickerLeft:half===0?kick:0,pickerRight:half===1?kick:0,
      weaving:q>=.30&&q<.60,rows:Number(p>=.5)+Number(p>=.999),wefts,
      action:step===0?'Les lleves canvien els lliços i obren la calada':step===1?'La transmissió impulsa la llançadora':'La biela mou el batà i atapeeix la trama'};
  }
  RI.TEXTIL_ESTATS.cartwright=state;
  function camRadius(beta,sign){
    const phase=((beta-Math.PI/2)/TAU%1+1)%1;
    return 40+11*sign*state(phase).shed;
  }
  RI.CARTWRIGHT_GEOMETRIA={state,camRadius};
  RI.CARTWRIGHT_ESCENA={
    id:'cartwright',nom:'Teler mecànic',any:'1785 · patent',qui:'Edmund Cartwright',durada:18,
    pregunta:'I si la màquina coordina les tres accions de teixir?',
    intro:'Amb Kay, la persona encara mou el teler. Cartwright aplica <b>energia motriu</b> a la calada, la llançadora i la batuda. Un eix i les transmissions coordinen tot el cicle.',
    model:'Principi del teler mecànic horitzontal · millores de 1787–1790',
    innovacio:{abans:'La persona coordina mans i peus',ara:'Un mecanisme coordina el cicle de teixit'},
    fases:[
      {fins:.15,nom:'Obrir la calada',text:'L’eix gira. Les lleves actuen sobre els lliços i separen els dos grups de fils.',focus:['eix','llicos']},
      {fins:.30,nom:'Impulsar la llançadora',text:'La transmissió activa l’impulsor lateral. La llançadora travessa la calada i deixa una passada de trama.',focus:['llancadora','transmissio']},
      {fins:.50,nom:'Atapeir la trama',text:'La biela transforma el gir en moviment del batà. La pinta porta el fil nou contra la tela.',focus:['pinta','eix']},
      {fins:1,nom:'Repetir a l’altre costat',text:'S’inverteixen els lliços i la llançadora torna. El mecanisme repeteix la seqüència; la persona vigila, reposa el fil i resol les incidències.',focus:['llancadora','tela']}
    ],
    parts:{
      transmissio:{nom:'Transmissió motriu',text:'La corretja i els engranatges porten energia exterior al teler. El model no pressuposa que tots els primers telers funcionessin amb vapor.'},
      eix:{nom:'Eix i lleves',text:'L’eix sincronitza el mecanisme. Les lleves converteixen el gir en moviments alternatius que accionen els lliços.'},
      llicos:{nom:'Lliços',text:'Separar els fils de l’ordit obre la calada per a la llançadora.'},
      llancadora:{nom:'Llançadora i impulsors',text:'La barqueta porta el fil de trama. Els impulsors la llancen mecànicament d’una caixa a l’altra.'},
      pinta:{nom:'Pinta, batà i biela',text:'La biela mou el batà; la pinta atapeeix cada passada de trama.'},
      ordit:{nom:'Ordit',text:'Els fils llargs, tensats, que s’entrecreuen amb la trama.'},
      tela:{nom:'Tela',text:'La successió de passades entrecreuades forma el teixit.'},
      bastidor:{nom:'Bastidor',text:'Subjecta i alinea els elements del teler.'}
    },
    clau:'La innovació és coordinar mecànicament el cicle de teixit. La seva difusió va necessitar dècades de millores.',
    batx:{titol:'1785 és la primera patent',text:'El primer prototip tenia l’ordit vertical. Aquí es representa el principi horitzontal de les millores de 1787–1790, amb dimensions i transmissions simplificades. Els primers telers eren poc fiables i l’expansió va ser gradual. Mecanitzar no eliminava la necessitat de treballadors ni millorava automàticament les seves condicions.',font:'https://www.fadedpage.com/books/20180140/html.php',fontNom:'J. M. Strickland (1843) · descripció i gravat de 1790'},
    real:{img:'img/real-cartwright-1790.jpg',titol:'Part del teler de Cartwright de 1790',museu:'Gravat publicat a la memòria de J. M. Strickland (1843)',lic:'Obra de domini públic · digitalització de Faded Page'}
  };
})();

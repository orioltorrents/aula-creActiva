// SPDX-License-Identifier: AGPL-3.0-or-later
// Reconstruccions il·lustrades amb ChatGPT. Les fotografies històriques són a cada capítol.
RI.ILLUSTRACIONS = {
  roda: 'img/illustration-roda-fus.webp',
  newcomen: 'img/illustration-newcomen.webp',
  watt: 'img/illustration-watt.webp',
  rotativa: 'img/illustration-rotativa.webp',
  llancadora: 'img/illustration-llancadora.webp',
  jenny: 'img/illustration-jenny.webp',
  water: 'img/illustration-water.webp',
  mula: 'img/illustration-mula.webp',
  cartwright: 'img/illustration-cartwright.webp',
  rocket: 'img/illustration-rocket.webp',
  sembradora: 'img/illustration-sembradora.webp',
  arada: 'img/illustration-arada.webp',
  bessemer: 'img/illustration-bessemer.webp',
  western: 'img/illustration-western.webp',
};

// Posicions sobre la làmina completa, en percentatge. Màxim cinc conjunts.
RI.LAMINA_PARTS = {
  roda:[['roda',73,31],['fus',19,54],['fibra',40,64,'Cotó cardat'],['corretja',44,24],['bastidor',42,70]],
  llancadora:[['ordit',22,34,"Plegador d’ordit"],['llicos',52,28],['pinta',54,46],['llancadora',59,52],['tela',58,65]],
  jenny:[['metxes',48,12,'Guia de metxa'],['pinca',48,23],['fusos',41,54],['roda',80,60],['corda',48,68]],
  water:[['metxa',47,12],['corrons',45,32],['aleta',44,63],['aigua',81,32,'Transmissió'],['aleta',47,80,'Banc de fusos']],
  mula:[['fileta',22,13],['corrons',23,29],['carro',56,75],['fus',53,54],['roda',83,46]],
  cartwright:[['transmissio',89,60],['eix',48,83,'Eix i lleves'],['llicos',50,27],['pinta',51,47],['tela',48,62]],
  newcomen:[['balanci',50,12],['piston',24,40],['cilindre',26,48],['caldera',26,65],['bombamina',81,68]],
  watt:[['balanci',48,12],['piston',30,43],['cilindre',31,55],['condensador',45,71],['caldera',13,63]],
  rotativa:[['balanci',43,13],['cilindre',19,61],['biela',69,38],['volant',85,54],['regulador',55,42]],
  rocket:[['caldera',33,54],['cilindre',40,58],['biela',30,70],['roda',25,75],['fogar',54,65]],
  sembradora:[['tremuja',48,28],['dosador',48,48],['roda',23,63],['tub',53,64],['rella',53,80]],
  arada:[['cama',54,59],['ganivet',46,66],['rella',51,77],['orello',64,68]],
  bessemer:[['convertidor',44,35],['eix',67,47],['toveres',50,83],['eix',79,43,'Engranatge de basculació']],
  western:[['roda',41,78],['veles',56,28],['xemeneia',42,51],['cabines',62,64]]
};
RI.EXPLOTADES = {};

// Coordenades i funcions de les peces principals de les làmines més obertes.
// Format: identificador, x %, y %, nom breu opcional, funció breu.
Object.assign(RI.EXPLOTADES, {
  roda:{img:'img/exploded-roda-fus.webp',parts:[
    ['roda',75,32,null,'Fa girar el fus.'],['fus',20,43,null,'Torceix i recull el fil.'],['fibra',39,68,'Cotó cardat','És la fibra que es transforma en fil.'],['corretja',49,24,null,'Porta el gir de la roda al fus.'],['bastidor',49,75,null,'Sosté la roda i el fus.']]},
  llancadora:{img:'img/exploded-llancadora.webp',parts:[
    ['ordit',13,45,'Plegador d’ordit','Subministra els fils longitudinals.'],['llicos',52,16,null,'Obren el pas per a la llançadora.'],['pinta',66,60,null,'Acosta cada fil de trama a la tela.'],['llancadora',93,60,null,'Porta el fil de trama d’un costat a l’altre.'],['tela',76,87,'Plegador de tela','Recull el teixit acabat.']]},
  jenny:{img:'img/exploded-jenny.webp',parts:[
    ['metxes',51,8,'Guia de metxa','Condueix la fibra cap als fusos.'],['pinca',51,19,null,'Subjecta i estira les metxes.'],['fusos',36,81,null,'Torcen i enrotllen vuit fils alhora.'],['roda',85,62,null,'Mou els fusos amb la mà.'],['corda',47,48,null,'Transmet el gir als fusos.']]},
  water:{img:'img/exploded-water.webp',parts:[
    ['metxa',50,15,null,'Alimenta els quatre fils.'],['corrons',21,48,null,'Estiren i aprimen la metxa.'],['aleta',25,84,'Banc de fusos','Torceix i enrotlla quatre fils alhora.'],['aigua',85,50,'Transmissió','Reparteix el moviment a la màquina.']]},
  mula:{img:'img/exploded-mula.webp',parts:[
    ['fileta',25,15,null,'Guarda les metxes que s’han de filar.'],['corrons',43,35,null,'Estiren la fibra abans de torçar-la.'],['carro',59,80,null,'Avança i retrocedeix sobre rails.'],['fus',59,55,null,'Torceix i recull els fils.'],['roda',85,55,null,'Acciona el mecanisme.']]},
  cartwright:{img:'img/exploded-cartwright.webp',parts:[
    ['transmissio',91,55,null,'Porta la força al teler.'],['eix',50,88,'Eix i lleves','Coordinen els moviments del teler.'],['llicos',52,15,null,'Obren el pas entre els fils d’ordit.'],['pinta',55,60,null,'Prem la trama contra la tela.'],['tela',62,75,null,'Recull el teixit.']]},
  newcomen:{img:'img/exploded-newcomen.webp',parts:[
    ['balanci',48,10,null,'Transmet el vaivé a la bomba.'],['piston',25,30,null,'Baixa quan es crea el buit.'],['cilindre',25,49,null,'El vapor s’hi condensa.'],['caldera',11,75,null,'Produeix el vapor.'],['bombamina',83,70,null,'Extreu l’aigua de la mina.']]},
  watt:{img:'img/exploded-watt.webp',parts:[
    ['balanci',49,10,null,'Transmet el vaivé a la bomba.'],['piston',31,32,null,'Es mou dins del cilindre.'],['cilindre',31,52,null,'Es manté calent per estalviar combustible.'],['condensador',46,70,null,'Refreda el vapor fora del cilindre.'],['caldera',12,75,null,'Produeix el vapor.']]},
  rotativa:{img:'img/exploded-rotativa.webp',parts:[
    ['balanci',43,10,null,'Rep el vaivé del pistó.'],['cilindre',20,60,null,'El vapor hi empeny el pistó.'],['biela',64,56,null,'Converteix el vaivé en gir.'],['volant',84,56,null,'Manté el gir regular.'],['regulador',57,34,null,'Modera la velocitat.']]},
  rocket:{img:'img/exploded-rocket.webp',parts:[
    ['caldera',34,49,null,'Escalfa l’aigua i produeix vapor.'],['cilindre',48,52,null,'El vapor hi empeny el pistó.'],['biela',43,62,null,'Porta l’empenta a la roda.'],['roda',21,76,null,'Impulsa la locomotora.'],['fogar',58,52,null,'Hi crema el combustible.']]},
  sembradora:{img:'img/exploded-sembradora.webp',parts:[
    ['tremuja',48,23,null,'Conté les llavors.'],['dosador',48,60,null,'Deixa caure les llavors a intervals.'],['roda',17,60,null,'Fa girar el dosador en avançar.'],['tub',55,78,null,'Condueix la llavor al solc.'],['rella',55,91,null,'Obre el solc a la terra.']]},
  arada:{img:'img/exploded-arada.webp',parts:[
    ['cama',52,55,null,'Sosté les peces de treball.'],['ganivet',46,75,null,'Talla la terra verticalment.'],['rella',52,86,null,'Talla la terra per sota.'],['orello',80,75,null,'Gira el pa de terra.']]},
  bessemer:{img:'img/exploded-bessemer.webp',parts:[
    ['convertidor',48,34,null,'Conté el ferro líquid mentre s’hi bufa aire.'],['toveres',50,82,null,'Introdueixen aire per la base.'],['eix',83,45,'Engranatge de basculació','Inclina el recipient per abocar-lo.']]},
  western:{img:'img/exploded-western.webp',parts:[
    ['maquina',52,52,'Calderes i màquina','Produeixen vapor i fan girar les pales.'],['roda',46,85,null,'Les pales empenyen l’aigua.'],['veles',76,28,null,'Ajuden a navegar amb el vent.']]}
});
for (const data of Object.values(RI.EXPLOTADES)) data.img += '?v=20261114-explotades2';

RI.laminaHTML = function(e,mode){
  const mounted=mode==='muntada', data=mounted?e.laminaMuntada:e.explotada;
  if(!data)return '';
  const safe=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const items=(data.parts||[]).filter(p=>e.parts&&e.parts[p[0]]);
  const name=p=>p[3]||e.parts[p[0]].nom;
  const func=p=>!mounted&&p[4]?`<small>${safe(p[4])}</small>`:'';
  return `<div class="lamina-plate ${mounted?'lamina-real':'lamina-exp'}" id="${mounted?'lamina-real':'lamina-exp'}" aria-label="${mounted?'Màquina muntada':'Vista explotada'}">
    <ol class="lamina-clau">${items.map((p,i)=>`<li><button type="button" data-tria="${p[0]}"><i>${i+1}</i><span><strong>${safe(name(p))}</strong>${func(p)}</span></button></li>`).join('')}</ol>
    <div class="lamina-camp"><div class="lamina-zoom"><img src="${safe(data.img)}" alt="${safe(e.nom)} · ${mounted?'màquina muntada':'vista explotada amb els conjunts principals separats'}" loading="eager"><svg class="exp-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet">${items.map((p,i)=>`<g class="plate-mark" data-part="${p[0]}" tabindex="0" role="button" aria-label="${safe(name(p))}"><circle cx="${p[1]*12}" cy="${p[2]*8}" r="15"/><text x="${p[1]*12}" y="${p[2]*8+5}">${i+1}</text></g>`).join('')}</svg></div></div>
  </div>`;
};

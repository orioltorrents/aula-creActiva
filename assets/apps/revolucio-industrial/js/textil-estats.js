// SPDX-License-Identifier: AGPL-3.0-or-later
/* Estats físics del cicle didàctic. El mateix estat governa geometria i missatge.
   Velocitats i quantitats de fil esquemàtiques; no són mesures de productivitat. */
(function(){
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const seg=(p,a,b)=>ease((p-a)/(b-a));
  const mix=(a,b,q)=>a+(b-a)*q;
  const TAU=Math.PI*2;
  function roda(p){
    const draw=seg(p,.15,.57),wind=seg(p,.72,.97);
    let angle=p<.15?0:p<.57?seg(p,.15,.57)*TAU*1.8:p<.65?TAU*(1.8+.3*seg(p,.57,.65)):p<.72?TAU*(2.1-.08*seg(p,.65,.72)):TAU*(2.02+.8*wind);
    const hand=p<.65?mix(-200,-430,draw):mix(-430,-25,wind);
    const handX=p<.65?-275:mix(-275,-445,seg(p,.65,.72));
    return {draw,wind,angle,spindleAngle:angle*155/18,hand,handX,guide:seg(p,.65,.72),copRadius:8+11*wind,atTip:p<.68,output:wind>.98?1:0,
      action:p<.15?'La mà prepara el cotó cardat':p<.57?'Els dits estiren; el fus dona torsió':p<.72?'El fil canvia de posició per recollir-lo':'El fil ja fet s’enrotlla al fus'};
  }
  function llancadora(p){
    const shed=p<.12?mix(-1,1,seg(p,0,.12)):p<.57?1:p<.65?mix(1,-1,seg(p,.57,.65)):-1;
    const x=p<.18?-325:p<.38?mix(-325,325,seg(p,.18,.38)):p<.67?325:p<.85?mix(325,-325,seg(p,.67,.85)):-325;
    const beat1=seg(p,.40,.50),beat2=seg(p,.86,.95);
    const beat=p<.40?0:p<.50?beat1:p<.57?1-seg(p,.50,.57):p<.86?0:p<.95?beat2:1-seg(p,.95,1);
    const y=-82-beat*70;
    const centre=310+(270-310)*(122/195);
    const halfGap=45*Math.abs(shed)*(1-122/195);
    return {shed,x,y,boatY:-82,boatZ:centre,upperZ:centre+halfGap,lowerZ:centre-halfGap,
      weaving:p>=.18&&p<.38||p>=.67&&p<.85,rows:Number(p>=.5)+Number(p>=.95),beat1,beat2,
      pull:p>=.16&&p<.23||p>=.65&&p<.72,
      action:p<.18?'Els lliços obren un pas entre els fils':p<.40?'El taco impulsa la llançadora: queda una trama nova':p<.57?'La pinta porta la trama fins a la tela':p<.86?'S’intercanvien els fils i torna la llançadora':'Una altra passada queda incorporada a la tela'};
  }
  function jenny(p){
    const draw=seg(p,.16,.52),wind=seg(p,.70,.94);
    const travel=p<.16?mix(82,105,seg(p,0,.16)):p<.70?mix(105,265,draw):mix(265,82,wind);
    const angle=p<.16?0:p<.52?TAU*2*draw:p<.64?TAU*(2+.6*seg(p,.52,.64)):p<.70?TAU*(2.6-.08*seg(p,.64,.70)):TAU*(2.52+1.3*wind);
    return {draw,wind,travel,closed:p>=.16&&p<.96,angle,driveAngle:angle*105/25,spindleAngle:angle*105/25*11/5,guideZ:306-54*seg(p,.64,.70),copRadius:7+10*wind,showAll:p>=.7,output:wind>.98?8:0,
      action:p<.16?'La pinça oberta deixa entrar metxa':p<.52?'La pinça tancada s’allunya: vuit metxes s’estiren':p<.70?'Els vuit fusos acaben de donar torsió':'El retorn recull els vuit fils alhora'};
  }
  function water(p){
    const speeds=[1,1.6,3.2],distance=p*TAU*2;
    return {speeds,pairs:speeds.map(v=>[-distance*v,distance*v]),distance,flyerAngle:p*TAU*3.2,bobbinAngle:p*TAU*3.6,
      fill:clamp(p),output:4,
      action:p<.23?'La metxa gruixuda entra entre dos corrons':p<.50?'Les parelles següents l’arrosseguen més de pressa':p<.76?'L’aleta torça el fil i la bobina el recull':'L’energia exterior manté tots els caps en moviment'};
  }
  function mula(p){
    const fed=seg(p,0,.38),last=seg(p,.38,.55),wind=seg(p,.67,.95);
    const travel=p<.38?mix(-90,-300,fed):p<.55?mix(-300,-360,last):p<.67?-360:mix(-360,-90,wind);
    let angle=p<.55?TAU*3*seg(p,0,.55):p<.62?TAU*(3-.08*seg(p,.55,.62)):TAU*(2.92+1.5*wind);
    return {fed,last,wind,travel,rollerAngle:fed*TAU*1.4,rollersRunning:p<.38,spindleAngle:angle,
      wheelAngle:-(travel+90)/28,copRadius:7+10*wind,guideZ:p<.55?203:mix(203,133,seg(p,.55,.67)),output:wind>.98?6:0,
      action:p<.38?'Els corrons alimenten i el carro s’allunya':p<.55?'Corrons aturats: es completa l’estiratge i la torsió':p<.67?'La guia baixa per preparar l’enrotllament':'El carro torna i el fil s’enrotlla als fusos'};
  }
  window.RI.TEXTIL_ESTATS={roda,llancadora,jenny,water,mula};
})();

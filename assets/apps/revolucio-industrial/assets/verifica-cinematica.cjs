// SPDX-License-Identifier: AGPL-3.0-or-later
// Run: node assets/verifica-cinematica.cjs
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={RI:{}};context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../js/textil-estats.js'),'utf8'),context);
const states=context.window.RI.TEXTIL_ESTATS;
let samples=0;
for(let i=0;i<=1000;i++){
  const p=i/1000,l=states.llancadora(p),w=states.water(p),m=states.mula(p);
  if(l.weaving){
    assert(l.boatZ+5<l.upperZ && l.boatZ-5>l.lowerZ,'shuttle collides with warp');
    assert.equal(l.y,l.boatY,'reed beats while shuttle is crossing');
  }
  if(l.upperZ-l.lowerZ<12)assert(Math.abs(l.x)-28>273,'parked shuttle must clear the closing warp');
  for(const [upper,lower] of w.pairs){assert(Math.abs(upper+lower)<1e-10);assert(upper<=0&&lower>=0,'both nip surfaces must feed towards the output');}
  assert(w.speeds[0]<w.speeds[1]&&w.speeds[1]<w.speeds[2]);
  assert.notEqual(w.flyerAngle || 1,w.bobbinAngle || 2,'bobbin and flyer need differential speed');
  if(p>=.38)assert.equal(m.rollerAngle,states.mula(.38).rollerAngle,'stopped rollers rotate');
  assert(Math.abs(m.wheelAngle+(m.travel+90)/28)<1e-10,'carriage wheels slip');
  for(const id of ['roda','jenny','mula']){
    const s=states[id](p);
    if(s.wind===0)assert.equal(s.copRadius,states[id](0).copRadius,'cop grows before winding');
    if(i){
      const prev=states[id](p-.001);
      const a=s.spindleAngle,b=prev.spindleAngle;
      assert(Math.abs(a-b)<.6,`${id}: angular discontinuity`);
      if(id==='jenny')assert(Math.abs(s.guideZ-prev.guideZ)<1.5,'thread guide jumps at winding');
      if(id==='roda')assert(Math.abs(s.guide-prev.guide)<.023,'thread jumps from tip to cop');
    }
  }
  samples++;
}
assert.equal(states.roda(1).output,1);assert.equal(states.jenny(1).output,8);
assert.equal(states.mula(1).output,6);assert.equal(states.llancadora(1).rows,2);
context.RI.svg=(s)=>s;context.RI.fletxa=()=>'';
context.document={querySelector:()=>null};
for(const file of ['materials.js','textil-cartwright.js','textil-dibuix.js'])vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../js/'+file),'utf8'),context);
let geometrySamples=0;
for(const id of ['roda','llancadora','jenny','water','mula','cartwright']){
  const markup=context.RI.TEXTIL_DIBUIX.svg(id);
  assert(typeof markup==='string' && markup.includes('data-part='),`${id}: cal SVG tècnic amb peces`);
  assert(!markup.includes('NaN') && !markup.includes('undefined'),`${id}: SVG inicial sense NaN ni undefined`);
  assert(Array.isArray(context.RI.TEXTIL_DIBUIX.ETIQUETES[id]) && context.RI.TEXTIL_DIBUIX.ETIQUETES[id].length>=5,`${id}: calen etiquetes`);
  const anim=context.RI.TEXTIL_DIBUIX.anima(id);
  const els={};
  const el=(k)=>els[k]||(els[k]={style:{},attrs:{},setAttribute(a,v){this.attrs[a]=v;},getAttribute(a){return this.attrs[a]||'';},innerHTML:''});
  for(let i=0;i<=20;i++){
    anim({p:i/20,t:i,k:1,el,capes:{},svg:{},sel:null,vista:'mov',explota:0});
    for(const [k,node] of Object.entries(els)){
      assert(!String(node.innerHTML).includes('NaN') && !String(node.innerHTML).includes('undefined'),`${id}#${k}: innerHTML net a p=${i/20}`);
      for(const v of Object.values(node.attrs))assert(!String(v).includes('NaN') && !String(v).includes('undefined'),`${id}#${k}: attr net a p=${i/20}`);
    }
    geometrySamples++;
  }
}
for(let i=0;i<=1000;i++){
  const s=states.cartwright(i/1000);
  assert(Math.abs(Math.hypot(...s.crank.map((v,j)=>v-s.rodEnd[j]))-180)<1e-8,'beater connecting rod changes length');
  assert(s.y>=-152-1e-8&&s.y<=-82+1e-8);
  assert(Math.abs(s.camAngle+(s.angle-Math.PI)/2)<1e-8,'cam gear ratio must be 2:1');
  for(const sign of [-1,1]){
    const r=context.RI.CARTWRIGHT_GEOMETRIA.camRadius(Math.PI/2-s.camAngle,sign);
    assert(Math.abs(r-(40+11*sign*s.shed))<1e-8,'cam profile must meet its follower');
  }
  if(s.weaving){
    for(const dy of [-4,4]){
      const centre=310-40*(40-s.boatY-dy)/195,gap=45*Math.abs(s.shed)*(1-(40-s.boatY-dy)/195);
      assert(s.boatZ+7<centre+gap&&s.boatZ-1>centre-gap,'moving shuttle bobbin collides with warp');
    }
  }else if(Math.abs(s.shed)<.5)assert(Math.abs(s.x)-28>273,'shuttle must park clear of closing shed');
}
assert.equal(states.cartwright(1).rows,2);
assert.equal(states.cartwright(.9999).rows,2,'slider endpoint must display both completed picks');
const powered=context.RI.TEXTIL_DIBUIX.svg('cartwright');
assert(!powered.includes('data-part="cordill"'),'power loom must not retain the manual hand cord');
console.log(JSON.stringify({samples,poweredLoomSamples:1001,geometrySamples,checks:'shed, timing, nip direction, stopped rollers, winding, guides, SVG 2D parts, NaN-free frames, crank rod, cam contact, gearing'}));

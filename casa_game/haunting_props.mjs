import {objectClue} from './playtest_pass.mjs';
/** Lightweight, recognizable encounter objects. No colliders or extra point lights. */
export function createHauntingProp(T,slot,run){
 const g=new T.Group();g.name=slot.label;g.userData.hauntingProp=true;
 const brass=new T.MeshStandardMaterial({color:0xb99556,metalness:.72,roughness:.36}),dark=new T.MeshStandardMaterial({color:0x211e2a,roughness:.7}),glow=new T.MeshStandardMaterial({color:slot.color,emissive:slot.color,emissiveIntensity:.8,roughness:.4}),ivory=new T.MeshStandardMaterial({color:0xe5d7b5,roughness:.8});
 const add=(geo,mat,x=0,y=0,z=0,parent=g)=>{const mesh=new T.Mesh(geo,mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const box=(mat,x,y,z,w,h,d,parent=g)=>add(new T.BoxGeometry(w,h,d),mat,x,y,z,parent);
 const ring=add(new T.TorusGeometry(.31,.012,5,32),glow,0,.035);ring.rotation.x=-Math.PI/2;
 if(slot.visual==='threshold'){
  for(const side of [-1,1])box(brass,side*.32,.48,0,.045,.9,.05);box(brass,0,.96,0,.69,.045,.05);const door=box(glow,0,.49,0,.55,.85,.02);door.material=glow.clone();door.material.transparent=true;door.material.opacity=.2;
 }else if(slot.visual==='clock'){
  box(dark,0,.53,0,.40,1.02,.25);add(new T.CylinderGeometry(.25,.25,.13,24),brass,0,1.03).rotation.x=Math.PI/2;add(new T.CircleGeometry(.22,24),ivory,0,1.03,.075);const hand=box(dark,0,1.10,.09,.018,.16,.015);hand.rotation.z=slot.index*.9;g.userData.clockHand=hand;box(brass,0,.35,.15,.02,.34,.02);add(new T.SphereGeometry(.07,8,6),brass,0,.22,.16);
 }else if(slot.visual==='bell'){
  box(dark,0,.2,0,.43,.4,.43);const bell=add(new T.CylinderGeometry(.10,.23,.30,18,1,true),brass,0,.78);add(new T.TorusGeometry(.23,.025,6,24),glow,0,.63).rotation.x=Math.PI/2;box(brass,0,.53,0,.04,.45,.04);g.userData.bell=bell;
 }else if(slot.visual==='plant'){
  add(new T.CylinderGeometry(.18,.13,.27,12),dark,0,.16);box(brass,0,.45,0,.025,.52,.025);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5,m=add(new T.SphereGeometry(.1,10,6),glow,Math.cos(a)*.16,.53+Math.sin(i)*.07,Math.sin(a)*.16);m.scale.set(.6,.35,1.7);m.rotation.y=-a;}
  add(new T.OctahedronGeometry(.13,1),ivory,0,.83);g.userData.bloom=true;
 }else if(slot.visual==='mask'){
  box(dark,0,.35,0,.31,.7,.31);const mask=add(new T.SphereGeometry(.19,16,10),ivory,0,.91);mask.scale.set(.8,1.22,.43);for(const side of [-1,1])add(new T.SphereGeometry(.036,8,6),dark,side*.06,.95,.07);box(brass,0,.73,0,.035,.14,.04);
 }else if(slot.visual==='cabinet'){
  box(dark,0,.53,0,.6,1,.32);for(const side of [-1,1])box(brass,side*.28,.53,.18,.025,1,.025);box(brass,0,1.05,0,.65,.06,.38);box(brass,0,.20,.18,.50,.025,.025);if(!run.state.loot.includes(slot.index))add(new T.IcosahedronGeometry(.13,1),glow,0,.65,.23);const door=box(brass,run.state.loot.includes(slot.index)?-.36:0,.65,.21,.46,.68,.035);door.rotation.y=run.state.loot.includes(slot.index)?-1.2:0;g.userData.cabinetOpen=run.state.loot.includes(slot.index);
 }else if(slot.visual==='guest'||slot.visual==='broker'){
  add(new T.ConeGeometry(.22,.73,16),glow,0,.53);add(new T.SphereGeometry(.13,14,10),ivory,0,1.03);for(const side of [-1,1])add(new T.SphereGeometry(.025,8,6),dark,side*.045,1.05,.12);const lantern=box(brass,.30,.49,.07,.16,.23,.16);box(glow,.30,.49,.16,.11,.15,.02);g.userData.guest=slot.visual==='guest';
 }else if(run.type==='vigil'&&slot.index===3){
  const eye=add(new T.SphereGeometry(.36,20,12),ivory,0,1.05);eye.scale.set(1,.65,.5);add(new T.SphereGeometry(.13,16,10),glow,0,1.05,.18);add(new T.SphereGeometry(.06,12,8),dark,0,1.05,.29);box(brass,0,.47,0,.045,.52,.045);g.userData.eye=eye;
 }else{
  box(dark,0,.3,0,.44,.6,.44);const seal=add(new T.TorusGeometry(.20,.027,6,32),brass,0,.82,.03);seal.rotation.z=Math.PI/4;add(new T.OctahedronGeometry(.13),glow,0,.82,.03);box(brass,0,.52,0,.035,.24,.035);
 }
 // Readable clues are represented in geometry as well as words.
 if(run.type==='garden'&&slot.index<3){
  const need=run.appetite(slot.index),clue=new T.Group();clue.name='Plant appetite: '+need;g.add(clue);
  if(need==='light'){const sun=add(new T.SphereGeometry(.085,12,8),glow,.29,.8,.12,clue);for(let i=0;i<8;i++){const a=i*Math.PI/4,ray=box(ivory,.29+Math.cos(a)*.13,.8+Math.sin(a)*.13,.12,.018,.065,.018,clue);ray.rotation.z=a-Math.PI/2;}}
  if(need==='water'){for(let i=0;i<3;i++){const drop=add(new T.SphereGeometry(.04,10,8),ivory,.25+i*.06,.92-i*.09,.14,clue);drop.scale.y=1.6;}}
  if(need==='quiet'){for(const side of [-1,1]){const ear=add(new T.TorusGeometry(.07,.018,5,16,Math.PI*1.7),ivory,side*.25,.83,.08,clue);ear.rotation.z=side*.4;}box(brass,0,.83,.12,.2,.018,.018,clue);}
  g.userData.appetite=need;
 }
 if(run.type==='masquerade'&&slot.index<3){
  const falseGuest=slot.index===run.suspect;g.userData.contradiction=falseGuest;
  if(slot.index===0){for(let i=0;i<7;i++){const a=i*.9,leaf=add(falseGuest?new T.PlaneGeometry(.10,.15):new T.SphereGeometry(.065,8,6),falseGuest?ivory:glow,Math.sin(a)*.2,.8+i*.045,Math.cos(a)*.12);if(!falseGuest)leaf.scale.set(.5,1.2,.6);leaf.rotation.z=a;}}
  if(slot.index===1&&!falseGuest){const shadow=add(new T.CircleGeometry(.23,20),dark,.18,.045,.08);shadow.rotation.x=-Math.PI/2;shadow.scale.y=1.5;shadow.name='The musician casts a shadow';}
  if(slot.index===2&&falseGuest){for(let i=0;i<12;i++){const drop=add(new T.SphereGeometry(.018,6,4),glow,Math.sin(i*2)*.2,.2+(i%6)*.10,.18);drop.scale.y=2;}const puddle=add(new T.CircleGeometry(.25,18),glow,0,.045,0);puddle.rotation.x=-Math.PI/2;puddle.name='Rain from the traveler’s coat';}
 }
 // A small object plaque stays on the plinth; the nearby interaction HUD supplies the readable name.
 const canvas=globalThis.document?.createElement('canvas'),ctx=canvas?.getContext('2d');
 if(ctx){canvas.width=512;canvas.height=96;ctx.fillStyle='#11131be8';ctx.fillRect(0,0,512,96);ctx.strokeStyle='#ad9569';ctx.lineWidth=3;ctx.strokeRect(2,2,508,92);ctx.fillStyle='#f4e7cb';ctx.textAlign='center';ctx.font='22px Georgia';ctx.fillText(objectClue(run,slot).slice(0,45),256,58);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;add(new T.PlaneGeometry(.36,.067),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide}),0,.15,.245);}
 g.userData.tick=time=>{if(slot.index<3&&run.type==='garden'){const open=run.state.bloomed.includes(slot.index);glow.emissiveIntensity=open?1:.35;}if(g.userData.bell)g.userData.bell.rotation.z=Math.sin(time*.0018+slot.index)*.07;if(g.userData.clockHand&&!run.state.solved.includes(slot.index)&&!run.state.pinned.includes(slot.index))g.userData.clockHand.rotation.z=-(run.state.elapsed*.6+slot.index*.9);if(g.userData.eye){const open=!run.watch().watching;g.userData.eye.scale.y=open?.09:.65;}ring.material.emissiveIntensity=.6;};
 return g;
}

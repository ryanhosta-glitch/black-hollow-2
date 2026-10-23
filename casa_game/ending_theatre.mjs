import {disposeGroup} from './resources.mjs';
/** One bounded, nonblocking performance. Every piece is visual-only and owns its resources. */
export function createEndingTheatre(T,run,position,{reducedMotion=false}={}){
 const root=new T.Group();root.name='Ending performance · '+run.ending.id;root.position.fromArray(position);const pieces=[];
 const pale=new T.MeshBasicMaterial({color:0xd8e7df,transparent:true,opacity:.85,depthWrite:false,depthTest:false}),gold=new T.MeshBasicMaterial({color:0xf4ce83,transparent:true,opacity:.9,depthWrite:false,depthTest:false}),ink=new T.MeshBasicMaterial({color:0x322d51,transparent:true,opacity:.85,depthWrite:false,depthTest:false});
 const add=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);root.add(m);pieces.push(m);return m;};
 const ring=()=>{const m=add(new T.TorusGeometry(.65,.035,7,48),gold,0,.10,0);m.rotation.x=-Math.PI/2;return m;};
 const orb=(r,x,y,z,mat=pale)=>add(new T.SphereGeometry(r,16,12),mat,x,y,z);
 const ghost=(x,y,z)=>{const g=new T.Group();root.add(g);const head=new T.Mesh(new T.SphereGeometry(.13,12,8),pale),body=new T.Mesh(new T.ConeGeometry(.23,.65,16),pale);head.position.y=.83;body.position.y=.38;g.add(head,body);g.position.set(x,y,z);pieces.push(g);return g;};
 const id=run.ending.id;
 if(run.type==='garden'){const moon=orb(.24,0,1.05,0,gold);moon.name=id==='sky'?'A new moon rises':'The impossible seed';for(let i=0;i<6;i++){const leaf=orb(.12,Math.cos(i)*.5,.35,Math.sin(i)*.5);leaf.scale.set(.5,1.5,.4);}ring();}
 else if(run.type==='choir'){for(let i=0;i<5;i++){const note=orb(.07,(i-2)*.23,.8+Math.sin(i)*.15,0,gold);note.name='Answering note';add(new T.BoxGeometry(.018,.3,.018),pale,(i-2)*.23,.95+Math.sin(i)*.15,0);}ring();}
 else if(run.type==='escort'){ghost(0,.15,0);if(id==='home'){for(const side of [-1,1])add(new T.BoxGeometry(.07,1.5,.07),gold,side*.5,.75,-.3);add(new T.BoxGeometry(1.07,.07,.07),gold,0,1.5,-.3);}else for(let i=0;i<6;i++)orb(.045,(i%2?-.15:.15),.08,i*.25,gold);ring();}
 else if(run.type==='loop'){const face=add(new T.RingGeometry(.34,.40,40),gold,0,1.1,0);face.name='The last minute';add(new T.BoxGeometry(.025,.28,.025),pale,0,1.22,0);add(new T.BoxGeometry(.23,.025,.025),pale,.10,1.1,0);if(id==='tomorrow')orb(.23,0,.45,-.25,gold);else ring();}
 else if(run.type==='masquerade'){for(const x of [-.55,0,.55]){add(new T.BoxGeometry(.30,.04,.30),gold,x,.35,0);add(new T.BoxGeometry(.30,.5,.035),ink,x,.6,-.15);}if(id==='invite')ghost(.55,.4,0);else{const invitation=add(new T.PlaneGeometry(.35,.24),pale,.5,.95,0);invitation.name='The departing invitation';}ring();}
 else if(run.type==='bargain'){for(let i=0;i<8;i++){const page=add(new T.PlaneGeometry(.13,.18),id==='free'?gold:pale,Math.sin(i)*.3,.4+i*.1,Math.cos(i)*.12);page.name=id==='free'?'Burning contract':'Fair terms';}if(id==='free')ghost(0,0,-.2);ring();}
 else if(run.type==='heist'){for(const side of [-1,1]){const door=add(new T.BoxGeometry(.4,1,.05),ink,side*.42,.6,0);door.rotation.y=side*.9;}if(id==='name')ghost(0,.1,.1);else for(let i=0;i<run.state.loot.length;i++)add(new T.IcosahedronGeometry(.12,1),gold,(i-1)*.3,.8,.15);ring();}
 else{const eye=orb(.32,0,1.05,0);eye.scale.set(1,.6,.5);orb(.1,0,1.05,.16,ink);if(id==='release')ghost(0,0,-.35);else add(new T.TorusGeometry(.32,.045,8,24),gold,0,1.4,0).rotation.x=Math.PI/2;ring();}
 root.traverse(o=>{if(o.isMesh)o.renderOrder=600;});
 let age=0;const starts=pieces.map(m=>m.position.clone());
 return {root,get age(){return age;},tick(dt){age+=Math.max(0,Math.min(.1,dt));const t=reducedMotion?1:Math.min(1,age/4);pieces.forEach((m,i)=>{const p=starts[i];m.position.copy(p);if(reducedMotion)return;if(run.type==='garden'&&i===0){m.position.y+=id==='sky'?t*1.1:-t*.55;m.scale.setScalar(id==='seed'?1-t*.7:1);}else if(run.type==='choir'){m.position.y+=id==='silence'?-t*.30:Math.sin(age*2+i)*.06;if(id==='silence')m.scale.setScalar(1-t*.7);}else if(run.type==='escort'&&id==='road'&&i===0)m.position.z+=t*.8;else if(run.type==='bargain'&&id==='free'&&i<8)m.position.y+=t*.7;else if(run.type==='masquerade'&&id==='banish'&&m.name==='The departing invitation')m.position.y+=t*.7;});},dispose(){disposeGroup(root);root.removeFromParent();}};
}
export function createCollectorPresence(T){
 const root=new T.Group();root.name='The Collector approaching';const mat=new T.MeshBasicMaterial({color:0x827794,transparent:true,opacity:.2,depthWrite:false});const body=new T.Mesh(new T.ConeGeometry(.34,1.45,16),mat);body.position.y=.75;root.add(body);const head=new T.Mesh(new T.SphereGeometry(.18,12,10),mat);head.position.y=1.65;root.add(head);for(const side of [-1,1]){const eye=new T.Mesh(new T.SphereGeometry(.025,8,6),new T.MeshBasicMaterial({color:0xf4c28b}));eye.position.set(side*.065,1.68,.15);root.add(eye);}return {root,update(alarm,time,{reducedMotion=false}={}){mat.opacity=.18+Math.min(1,alarm/100)*.6;root.scale.setScalar(.8+alarm/250);body.rotation.z=reducedMotion?0:Math.sin(time*.0018)*.025;},dispose(){disposeGroup(root);}};
}

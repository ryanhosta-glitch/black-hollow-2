import {createMidwayGhost} from './midway_ghost.mjs';
import {createPhantomCarriage} from './midway_carriage.mjs';
import {disposeGroup} from './resources.mjs';
/** A pocket platform, deliberately separate from student geometry, like the existing lift cabin. */
export function createMidwayStation(T,{vehicle,attraction,reducedMotion=false}={}){
 const root=new T.Group();root.name='Midway spectral boarding platform';
 const wood=new T.MeshStandardMaterial({color:0x292332,roughness:.9}),gold=new T.MeshStandardMaterial({color:0xb49a64,metalness:.45,roughness:.65}),glow=new T.MeshBasicMaterial({color:0xd8c08a}),parts=new Map();
 function box(mat,p,s){if(!parts.has(mat))parts.set(mat,[]);parts.get(mat).push({p,s});}
 box(wood,[0,-.10,0],[7.3,.2,7.5]);box(wood,[0,1.75,-3.35],[7.3,3.5,.12]);for(let i=0;i<19;i++)box(gold,[-3.4+i*.38,.004,0],[.008,.008,7.3]);for(const x of [-3.4,3.4]){box(wood,[x,1.5,-2.8],[.16,3,.16]);box(gold,[x,2.9,-2.8],[.25,.12,.25]);}
 box(wood,[0,3.20,-2.8],[7,.25,.18]);box(gold,[0,3.42,-2.8],[.15,.25,.15]);for(const x of [-3.45,3.45])for(const z of [-2.7,-1.2,.3,1.8])box(gold,[x,.6,z],[.045,1.2,.045]);for(const x of [-3.45,3.45])box(gold,[x,.85,-.45],[.035,.04,5]);
 for(const x of [-.54,.54]){box(gold,[x,.45,.56],[.045,.9,.045]);box(glow,[x,.95,.56],[.08,.08,.08]);}
 for(const x of [1.05,2.55])for(const z of [.35,1.35,2.35])box(gold,[x,.45,z],[.035,.9,.035]);for(const x of [1.05,2.55])box(gold,[x,.72,1.35],[.025,.025,2]);
 // A separate dispatch bay shows ghost guests boarding without occupying the rider's seat.
 const next=createPhantomCarriage(T,vehicle);next.root.name='Ghost guests next-dispatch carriage';next.root.position.set(1.8,0,-.9);root.add(next.root);
 for(const x of [-2.85,2.85]){box(glow,[x,2.03,-2.68],[.13,.22,.13]);box(gold,[x,1.84,-2.68],[.22,.05,.22]);}
 const stamp=new T.Object3D();for(const [mat,list]of parts){const mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),mat,list.length);list.forEach((v,i)=>{stamp.position.fromArray(v.p);stamp.scale.fromArray(v.s);stamp.updateMatrix();mesh.setMatrixAt(i,stamp.matrix);});root.add(mesh);}
 const gate=new T.Group();gate.name='Carriage loading gate';gate.position.set(-.48,0,.56);root.add(gate);const bar=new T.Mesh(new T.BoxGeometry(.96,.035,.035),gold);bar.position.set(.48,.70,0);gate.add(bar);
 const guests=[];for(let i=0;i<3;i++){const g=createMidwayGhost(T,{kind:i,color:[0xbcdccc,0xd2c2e6,0xbdd3eb][i],detail:'crowd',reducedMotion:true});g.name=i?'Ghost guest waiting in line':'Ghost guest boarding and unloading';g.scale.setScalar(.55);g.position.set(1.8,0,.55+i*.85);root.add(g);guests.push(g);}
 const usher=createMidwayGhost(T,{kind:4,color:0xd6c8a5,detail:'crowd',reducedMotion:true});usher.name='Midway station usher';usher.scale.setScalar(.67);usher.position.set(-1.55,0,-1.6);root.add(usher);const cap=new T.Mesh(new T.CylinderGeometry(.17,.21,.12,10),wood);cap.position.set(0,1.94,0);usher.add(cap);
 const cv=document.createElement('canvas');cv.width=1024;cv.height=256;const ctx=cv.getContext('2d'),texture=new T.CanvasTexture(cv);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;
 const sign=new T.Mesh(new T.PlaneGeometry(5.8,1.0),new T.MeshBasicMaterial({map:texture}));sign.position.set(0,2.53,-2.72);sign.name='Attraction loading and unloading marquee';root.add(sign);
 let phase='waiting',elapsed=0,disposed=false,lastLabel='';
 function label(){const state=phase==='unloading'?'UNLOADING · REMAIN SEATED':phase==='ready-exit'?'EXIT THIS WAY · THANK YOU FOR RIDING':phase==='waiting'?'NOW BOARDING · LIVING & OTHERWISE':'DISPATCH · KEEP HANDS INSIDE';if(state===lastLabel)return;lastLabel=state;ctx.fillStyle='#151d2a';ctx.fillRect(0,0,1024,256);ctx.strokeStyle='#bca16b';ctx.lineWidth=5;ctx.strokeRect(9,9,1006,238);ctx.textAlign='center';ctx.fillStyle='#f4dcaa';ctx.font='bold 42px Georgia';ctx.fillText(String(attraction.name).slice(0,55),512,76,970);ctx.font='27px Georgia';ctx.fillText(state,512,140,970);ctx.font='24px Georgia';ctx.fillText('THE HAUNTED MIDWAY · PHANTOM CARRIAGES',512,199,970);texture.needsUpdate=true;}
 function start(nextPhase){if(disposed)return;phase=nextPhase;elapsed=0;label();}
 function tick(dt){if(disposed)return;elapsed+=Math.max(0,Math.min(.05,Number.isFinite(dt)?dt:0));const t=Math.min(1,elapsed/2.6),lead=guests[0];
  if(phase==='loading'){lead.rotation.y=Math.PI;lead.position.set(1.8,.35*t,.55-1.45*t);lead.scale.setScalar(.55-.22*t);gate.rotation.y=reducedMotion?0:-(1-t)*Math.PI/2;}
  else if(phase==='unloading'||phase==='ready-exit'){const leaveSeat=Math.min(1,t/.38),aisle=Math.max(0,(t-.38)/.62);lead.rotation.y=0;lead.position.set(1.8-1.1*leaveSeat,.35*(1-leaveSeat),-.9+4.1*aisle);lead.scale.setScalar(.33+.22*leaveSeat);gate.rotation.y=reducedMotion?0:-t*Math.PI/2;if(elapsed>=3.3&&phase==='unloading'){phase='ready-exit';label();}}
  else if(phase==='waiting'){lead.rotation.y=0;lead.position.set(1.8,0,.55);lead.scale.setScalar(.55);gate.rotation.y=-Math.PI/2;}
  // Reduced motion leaves the waiting cast still; boarding/exit is an essential slow transfer only.
  for(let i=1;i<guests.length;i++)guests[i].position.y=reducedMotion?0:Math.sin(elapsed*1.1+i)*.018;
 }
 label();return {root,start,tick,get phase(){return phase;},get elapsed(){return elapsed;},get ready(){return phase==='ready-exit';},get inventory(){return {ghosts:4,queueGuests:3,carriages:1,textureBytes:1024*256*4,lights:0};},dispose(){if(disposed)return;disposed=true;disposeGroup(root);}};
}

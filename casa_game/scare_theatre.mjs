import {planScareLocations} from './scare_plan.mjs';
import {createScareDirector} from './scare_director.mjs';
import {floorY} from './session.mjs';
import {disposeGroup} from './resources.mjs';
const aftermath={reflection:'The glass is empty again. You are still alone. Probably.',window:'The face is gone. Nothing waits beyond the window.',ceiling:'The scraping retreats into the ceiling.', 'wall-shadow':'The shadow leaves no owner behind.'};
export function createScareTheatre(T,house,floor,{seed=1,seen={},quiet,options={},reducedMotion=false,onEvent=()=>{}}={}){
 const root=new T.Group();root.name='Room scare performances — no collision';let actor=null,performance=null,elapsed=0,mat=null;
 const plan=planScareLocations(house.rooms,house.decoration,f=>floorY(house,f)),compiled=house.decoration.scarePlan,allowed=new Map(plan.sites.map(s=>[s.id,s]));
 const sites=(compiled?.version===1&&Array.isArray(compiled.sites)?compiled.sites:plan.sites).filter(s=>{const safe=allowed.get(s?.id);return safe&&safe.floor===floor&&s.kind===safe.kind&&Array.isArray(s.positionMeters)&&s.positionMeters.length===3&&s.positionMeters.every((v,i)=>Number.isFinite(v)&&Math.abs(v-safe.positionMeters[i])<.05);}).map(s=>allowed.get(s.id));
 function clear(){for(const child of [...root.children])disposeGroup(child);root.clear();actor=null;performance=null;mat=null;}
 function reveal(event){clear();performance=event;elapsed=0;const site=event.site;actor=new T.Group();actor.name='Scare '+site.kind;actor.position.fromArray(site.positionMeters);actor.rotation.y=Math.atan2(site.normal[0],site.normal[2]);root.add(actor);
  mat=new T.MeshBasicMaterial({color:site.kind==='wall-shadow'?0x090611:0xc8dce1,transparent:true,opacity:0,depthWrite:false});
  const mesh=(geometry,x,y,z)=>{const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);actor.add(m);return m;};
  const small=site.kind==='reflection'||site.kind==='window';
  const head=mesh(new T.SphereGeometry(small?.12:.17,14,10),0,small?.19:.43,.03);head.scale.set(.82,1.2,.45);
  if(site.kind!=='window'){const body=mesh(new T.ConeGeometry(small?.19:.32,small?.58:1.1,16,5,true),0,small?-.17:-.20,0);body.geometry.rotateZ(Math.PI);for(const side of [-1,1]){const arm=mesh(new T.CapsuleGeometry(.035,small?.22:.46,3,8),side*(small?.19:.30),small?-.08:.02,.02);arm.rotation.z=side*.28;}}
  if(site.kind==='window'){const dark=new T.MeshBasicMaterial({color:0x070810});for(const side of [-1,1]){const eye=new T.Mesh(new T.SphereGeometry(.024,8,6),dark);eye.position.set(side*.045,.21,.09);actor.add(eye);for(let i=0;i<3;i++)mesh(new T.CapsuleGeometry(.014,.13,2,5),side*(.20+i*.025),-.08+i*.025,.025);}}
  if(site.kind==='ceiling'){const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0,.6,0),new T.Vector3(0,1.3,0)]),new T.LineBasicMaterial({color:0xa8a09a,transparent:true,opacity:.3}));actor.add(line);}
 }
 const director=createScareDirector({sites,seed,seen,quiet,options,onEvent:event=>{
  if(event.phase==='impact')reveal(event);if(['cancel','aftermath'].includes(event.phase))clear();
  onEvent({...event,text:event.phase==='aftermath'&&!event.misdirection?aftermath[event.site.kind]:event.phase==='misdirection'?'Only the old house settling. This time.':null});
 }});
 return {root,sites,director,cancel(){director.cancel();clear();},tick(time,position,roomId,context={}){
  director.tick(time,position,roomId,{...context,reducedMotion});
  if(!actor||!performance)return;elapsed=Math.max(0,director.active?.elapsed-performance.buildupMs||0);const t=Math.min(1,elapsed/performance.durationMs),fade=Math.min(1,t/.10,(1-t)/.25);mat.opacity=Math.max(0,fade)*(performance.site.kind==='wall-shadow'?.65:.78);
  if(performance.site.kind==='ceiling')actor.position.y=performance.site.positionMeters[1]-Math.sin(t*Math.PI)*Math.min(.8,performance.site.roomHeight-2.3);
  if(performance.site.kind==='wall-shadow'){const side=(t-.5)*.65,n=performance.site.normal;actor.position.x=performance.site.positionMeters[0]+n[2]*side;actor.position.z=performance.site.positionMeters[2]-n[0]*side;actor.scale.set(1+t*.25,1+t*.15,.08);}
 },dispose(){director.cancel();clear();root.removeFromParent();}};
}

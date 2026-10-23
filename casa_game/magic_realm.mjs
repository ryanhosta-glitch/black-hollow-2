import {createSpellPerformance,SPELLS} from './magic_spells.mjs';
import {planWitchMarks,WITCH_MARKS} from './grimoire.mjs';
import {roomContains,blockedByFurniture} from './session.mjs';
import {disposeGroup} from './resources.mjs';

function createMark(T,site,known){
 const root=new T.Group();root.name='Witch mark · '+WITCH_MARKS[site.mark].name;root.position.fromArray(site.position);
 const material=new T.LineBasicMaterial({color:known?0xc8a66c:0x92ded3,transparent:true,opacity:known?.35:.78,depthWrite:false});
 const circles=[];for(const r of [.32,.39]){const p=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;p.push(new T.Vector3(Math.cos(a)*r,.08,Math.sin(a)*r));}const line=new T.Line(new T.BufferGeometry().setFromPoints(p),material);root.add(line);circles.push(line);}
 const glyph=[];const n=site.mark+3;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+2)/n*Math.PI*2;glyph.push(new T.Vector3(Math.cos(a)*.24,.10,Math.sin(a)*.24),new T.Vector3(Math.cos(b)*.24,.10,Math.sin(b)*.24));}
 root.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(glyph),material));
 const crystal=new T.Mesh(new T.OctahedronGeometry(.09,0),new T.MeshBasicMaterial({color:0xe2eedb,transparent:true,opacity:.8,depthWrite:false}));crystal.position.y=.55;root.add(crystal);
 return {root,material,crystal,site,known};
}
function createThread(T,start,end){
 const root=new T.Group();root.name='The moth’s golden thread';const a=new T.Vector3(...start).add(new T.Vector3(0,1.1,0)),b=new T.Vector3(...end).add(new T.Vector3(0,1.0,0));
 const curve=new T.CatmullRomCurve3([a,a.clone().lerp(b,.3).add(new T.Vector3(0,.5,0)),a.clone().lerp(b,.7).add(new T.Vector3(0,.25,0)),b]);
 const material=new T.MeshBasicMaterial({color:0xffd18b,transparent:true,opacity:.6,depthWrite:false});const mesh=new T.Mesh(new T.TubeGeometry(curve,48,.009,5,false),material);root.add(mesh);
 const pearl=new T.Mesh(new T.SphereGeometry(.055,10,8),new T.MeshBasicMaterial({color:0xffedbb}));root.add(pearl);
 return {root,curve,pearl,material};
}

/** Scene-local magic: at most two casts, one golden thread and one optional room mark. */
export function createMagicRealm(T,{grimoire,reducedMotion=false}={}){
 const root=new T.Group();root.name='The living grimoire';let roomKey='',roomSite=null,mark=null,revealed=0,cooldown=0,clock=0,mode='street',effects=[],thread=null,castRoom=null,castHouse=null,enchantment=0,footprints=[],lastFoot=null;
 const foot=new T.InstancedMesh(new T.OctahedronGeometry(.045,0),new T.MeshBasicMaterial({color:0xd5c49d,transparent:true,opacity:.42,depthWrite:false}),24),dummy=new T.Object3D();foot.name='The stars you leave behind';foot.count=0;root.add(foot);
 function clear(){roomKey='';for(const e of effects)e.dispose();effects=[];if(thread)disposeGroup(thread.root);thread=null;if(mark)disposeGroup(mark.root);mark=null;roomSite=null;revealed=0;enchantment=0;footprints=[];lastFoot=null;foot.count=0;}
 function configure(kind,house,room,session){
  const key=kind+':'+(house?.manifest.id||'street')+':'+(room?.id||'');if(key===roomKey)return;clear();roomKey=key;mode=kind;castRoom=room;castHouse=house;
  if(kind==='house')roomSite=planWitchMarks(house,session?.slots||[]).find(s=>s.roomId===room.id)||null;
  if(roomSite){mark=createMark(T,roomSite,grimoire.has(roomSite.id));mark.root.visible=mark.known;root.add(mark.root);}
 }
 function addEffect(kind,p,power=grimoire.marks.length,duration=12){while(effects.length>=2)effects.shift().dispose();const e=createSpellPerformance(T,kind,p,{seed:Math.floor(clock*1000)+17,reducedMotion,power,duration});effects.push(e);root.add(e.root);return e;}
 return {root,configure,get active(){return effects.length>0;},get site(){return roomSite;},get casts(){return effects;},get cooldown(){return cooldown;},get revealed(){return revealed;},
  cast(kind,p,yaw=0){if(!SPELLS[kind]||!['street','house','hall','grounds','floor13'].includes(mode)||cooldown>0||!Array.isArray(p)||p.length!==3||!p.every(Number.isFinite))return {ok:false,text:cooldown>0?'Let the last spell settle.':'Find a little room for magic.'};cooldown=3.5;enchantment=18;
   const near=kind==='witchlight'&&roomSite&&!grimoire.has(roomSite.id)&&Math.hypot(roomSite.position[0]-p[0],roomSite.position[2]-p[2])<6;
   let target=near?roomSite.position:[p[0]-Math.sin(yaw)*1.25,p[1],p[2]-Math.cos(yaw)*1.25];if(!near&&castRoom?.boundsFeet&&!['street','grounds'].includes(mode)){const safe=roomContains(castRoom,target,.9)&&(!castHouse||mode!=='house'||!blockedByFurniture(castHouse,castRoom.floor,target[0],target[2],target[1],.8));if(!safe)target=[...p];}addEffect(kind,target);
   if(near){revealed=24;mark.root.visible=true;if(thread)disposeGroup(thread.root);thread=createThread(T,p,target);root.add(thread.root);}
   return {ok:true,text:near?'Witchlight answers. Follow the golden thread; touch the awakened witch mark.':SPELLS[kind].line,revealed:!!near};
  },nearest(p,roomId){return roomSite&&roomSite.roomId===roomId&&revealed>0&&!grimoire.has(roomSite.id)&&Math.abs(p[1]-roomSite.position[1])<.35&&Math.hypot(p[0]-roomSite.position[0],p[2]-roomSite.position[2])<1.15?roomSite:null;},
  discover(site){if(!roomSite||site?.id!==roomSite.id||revealed<=0||!grimoire.discover(site))return false;mark.known=true;mark.material.color.set(0xe4c180);addEffect('starweave',site.position,grimoire.marks.length,5);revealed=0;return true;},
  answer(kind,p){if(!p?.every(Number.isFinite))return;addEffect(kind==='garden'?'wildbloom':kind==='choir'||kind==='loop'?'starweave':'witchlight',p,grimoire.marks.length,3.5);},
  tick(dt,p){dt=Math.max(0,Math.min(.1,Number.isFinite(dt)?dt:0));clock+=dt;enchantment=Math.max(0,enchantment-dt);if(!reducedMotion&&enchantment>0&&p?.every(Number.isFinite)&&(!lastFoot||Math.hypot(p[0]-lastFoot[0],p[2]-lastFoot[2])>.5)){footprints.push({p:[...p],at:clock});footprints=footprints.slice(-24);lastFoot=[...p];}footprints=footprints.filter(f=>clock-f.at<6);foot.count=footprints.length;for(const [i,f]of footprints.entries()){dummy.position.set(f.p[0],f.p[1]+.045,f.p[2]);const fade=Math.max(.001,1-(clock-f.at)/6);dummy.rotation.set(0,i*.9,0);dummy.scale.set(fade,fade*.3,fade);dummy.updateMatrix();foot.setMatrixAt(i,dummy.matrix);}foot.instanceMatrix.needsUpdate=true;cooldown=Math.max(0,cooldown-dt);revealed=Math.max(0,revealed-dt);
   for(const e of effects)e.tick(dt);const expired=effects.filter(e=>e.expired);for(const e of expired)e.dispose();effects=effects.filter(e=>!e.expired);
   if(mark){mark.root.visible=mark.known||revealed>0;mark.material.opacity=mark.known?.38:.65;if(!reducedMotion){mark.crystal.position.y=.55+Math.sin(clock*1.6)*.06;mark.crystal.rotation.y=clock*.4;}}
   if(thread){if(revealed<=0){disposeGroup(thread.root);thread=null;}else{thread.material.opacity=.25+Math.min(1,revealed/3)*.35;thread.pearl.position.copy(thread.curve.getPoint(reducedMotion?1:(clock*.3)%1));}}
  },clear,dispose(){clear();disposeGroup(root);}};
}

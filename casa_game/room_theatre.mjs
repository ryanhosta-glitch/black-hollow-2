import {wallMount} from './wall_mount.mjs';
import {roomIdentity} from './room_content.mjs';
import {floorY,seedNumber} from './session.mjs';
/** Optional wall performances. Never a quest actor, floor obstacle or navigation surface. */
export function createRoomTheatre(T,house,floor,{reducedMotion=false}={}){
 const root=new T.Group();root.name='The house remembers';const actors=[];
 const gold=new T.MeshStandardMaterial({color:0xa07c42,metalness:.7,roughness:.4}),wood=new T.MeshStandardMaterial({color:0x20141c,roughness:.72});
 function box(parent,mat,x,y,z,w,h,d){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);parent.add(m);return m;}
 for(const room of house.rooms.filter(r=>r.floor===floor&&!r.forgeStair&&!r.id.startsWith('signature-')).slice(0,64)){
  const theme=roomIdentity(room);if(theme==='circulation')continue;
  const b=room.boundsFeet,h=+b.h*.3048;if(h<2.5)continue;
  const ornaments=house.decoration.roomContents?.find(c=>c.roomId===room.id)?.ornaments||[];
  const occupied=ornaments.filter(o=>o.wall).map(o=>({wall:o.wall,center:o.wall==='left'||o.wall==='right'?o.positionMeters[2]- +b.y*.3048:o.positionMeters[0]- +b.x*.3048,width:o.width}));
  for(const a of house.decoration.artwork||[]){if(a.roomId!==room.id)continue;const wall=a.normal[0]>0?'left':a.normal[0]<0?'right':a.normal[2]>0?'top':'bottom';occupied.push({wall,center:(wall==='left'||wall==='right'?a.positionMeters[2]- +b.y*.3048:a.positionMeters[0]- +b.x*.3048),width:a.sizeMeters[0]+.15});}
  // Use a different wall from the default portrait mount and stay above furniture.
  const mount=wallMount(room,{width:1.5,height:1.15,y:h-.78,inset:.08,preferred:['right','left','bottom','top'],occupied});if(!mount)continue;
  const g=new T.Group();g.position.fromArray(mount.position);g.position.y+=floorY(house,floor);g.rotation.y=mount.rotationY;g.userData.roomId=room.id;root.add(g);
  const seed=seedNumber(room.id),clock=['library','dining','nursery'].includes(theme);
  box(g,wood,0,0,0,1.03,1.13,.08);for(const x of [-.50,.50])box(g,gold,x,0,.055,.065,1.16,.06);for(const y of [-.55,.55])box(g,gold,0,y,.055,1.06,.065,.06);
  let actor;
  if(clock){
   g.name='The stopped clock — '+room.name;
   const face=new T.Mesh(new T.CircleGeometry(.43,32),new T.MeshStandardMaterial({color:0xd0c2a0,roughness:.9}));face.position.z=.06;g.add(face);
   for(let i=0;i<12;i++){const a=i*Math.PI/6;const mark=box(g,wood,Math.sin(a)*.36,Math.cos(a)*.36,.075,.018,.07,.012);mark.rotation.z=-a;}
   const hand=box(g,wood,0,.14,.09,.018,.31,.018),pivot=new T.Group();hand.position.y=.14;g.remove(hand);pivot.add(hand);g.add(pivot);pivot.rotation.z=-.6;box(g,wood,.10,0,.10,.22,.025,.018);
   actor={roomId:room.id,kind:'clock',pivot,base:-.6,seed};
  }else{
   g.name='The mourning glass — '+room.name;
   const mirror=new T.MeshStandardMaterial({color:theme==='laboratory'?0x446b67:0x415065,metalness:.82,roughness:.24});box(g,mirror,0,0,.055,.89,.99,.015);
   // An intentional spectral image, not a scene reflection or a second quest ghost.
   const silhouette=new T.Group();silhouette.position.z=.075;g.add(silhouette);
   const mat=new T.MeshBasicMaterial({color:0xc5dfeb,transparent:true,opacity:0,depthWrite:false});
   const head=new T.Mesh(new T.SphereGeometry(.085,10,8),mat);head.position.y=.19;silhouette.add(head);
   const body=new T.Mesh(new T.ConeGeometry(.17,.53,12),mat);body.position.y=-.13;silhouette.add(body);
   actor={roomId:room.id,kind:'reflection',silhouette,mat,seed};
  }
  // Velvet mourning swags for private rooms; kept wholly against the solid wall.
  if(['bedroom','parlor','ballroom','gallery'].includes(theme)){
   const cloth=new T.MeshStandardMaterial({color:theme==='bedroom'?0x570d28:0x203d37,roughness:1,side:T.DoubleSide});
   for(const side of [-1,1]){const geo=new T.PlaneGeometry(.22,1.25,8,12),a=geo.attributes.position;for(let i=0;i<a.count;i++)a.setZ(i,.13+Math.cos(a.getX(i)*90)*.025);geo.computeVertexNormals();const m=new T.Mesh(geo,cloth);m.position.set(side*.63,-.05,0);g.add(m);}
  }
  actors.push(actor);
 }
 // Batch static frame geometry across rooms; moving clock hands stay independent.
 root.updateMatrixWorld(true);const batches=new Map(),remove=[];
 root.traverse(o=>{if(!o.isMesh||o.geometry.type!=='BoxGeometry'||actors.some(a=>a.pivot===o.parent))return;const p=o.geometry.parameters,m=o.matrixWorld.clone().multiply(new T.Matrix4().makeScale(p.width,p.height,p.depth));if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(m);remove.push(o);});
 for(const o of remove){o.removeFromParent();o.geometry.dispose();}const unit=new T.BoxGeometry(1,1,1);for(const[material,matrices]of batches){const mesh=new T.InstancedMesh(unit,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.name='Batched mourning frames';root.add(mesh);}
 let eventRoom='',kind='',until=0;
 return {root,event(e,time){eventRoom=e.roomId;kind=e.kind;until=time+4200;},tick(time,roomId){const t=reducedMotion?0:time*.001;for(const a of actors){const active=a.roomId===roomId,audition=active&&time<until&&a.roomId===eventRoom;
   if(a.kind==='reflection'){const phase=(time*.001+a.seed%51)%67,passing=active&&phase>43&&phase<47,show=audition&&kind==='reflection'||passing;const fade=audition?Math.min(1,Math.max(0,(until-time)/900)):Math.max(0,Math.sin((phase-43)/4*Math.PI));a.mat.opacity=show?.28*fade:0;a.silhouette.position.x=reducedMotion?0:Math.sin(t*.8)*.15;}
   else a.pivot.rotation.z=a.base+(audition&&kind==='clock'&&!reducedMotion?Math.sin(t*3)*.3:0);
  }},get actorCount(){return actors.length;}};
}

import {GOTHIC_LIMITS} from './room_atmosphere_profiles.mjs';
import {stableRoomHash} from './room_profiles.mjs';
/** One Game-owned pool, positioned only when changing rooms. No scheduler or saved state. */
export function createRoomDust(T,house,floor,contents,{quality='cinematic',reducedMotion=false,effectsEnabled=true}={}){
 const capacity=reducedMotion||!effectsEnabled?0:GOTHIC_LIMITS.dust[quality]??0,geometry=new T.BufferGeometry(),coords=new Float32Array(capacity*3);geometry.setAttribute('position',new T.BufferAttribute(coords,3));geometry.setDrawRange(0,0);
 const root=new T.Points(geometry,new T.PointsMaterial({color:0xc5b89b,size:.012,transparent:true,opacity:.16,depthWrite:false}));root.name='Localized room dust pool';root.visible=false;let active='',baseY=0;
 return {root,capacity,tick(time,roomId){
  if(!capacity){root.visible=false;return;}
  if(roomId!==active){active=roomId;root.visible=false;const room=house.rooms.find(r=>r.id===roomId&&r.floor===floor),content=contents.find(c=>c.roomId===roomId),p=content?.atmosphere;
   if(!room||p?.effects===false||p?.enabled===false)return;
   const light=(house.decoration.lights||[]).find(l=>l.roomId===roomId&&['task','stained','moon','practical'].includes(l.role));if(!light)return;
   const b=room.boundsFeet,x=+b.x*.3048,z=+b.y*.3048,w=+b.l*.3048,d=+b.w*.3048,h=+b.h*.3048,y=house.manifest.floors[floor]?.elevationMeters||0;
   if(Math.min(w,d)<1||h<2)return;
   const px=Math.max(x+.4,Math.min(x+w-.4,light.positionMeters[0])),pz=Math.max(z+.4,Math.min(z+d-.4,light.positionMeters[2]));baseY=y+Math.min(1.55,h-.5);root.position.set(px,baseY,pz);
   let seed=stableRoomHash(roomId);const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296),count=Math.min(capacity,p?.condition==='decaying'?64:p?.condition==='preserved'?12:40);
   for(let i=0;i<capacity;i++){coords[i*3]=(rand()-.5)*.55;coords[i*3+1]=(rand()-.5)*.60;coords[i*3+2]=(rand()-.5)*.55;}geometry.attributes.position.needsUpdate=true;geometry.setDrawRange(0,count);geometry.computeBoundingSphere();root.visible=true;
  }
  if(root.visible)root.position.y=baseY+Math.sin(time*.00035)*.015;
 },get activeRoom(){return active;}};
}

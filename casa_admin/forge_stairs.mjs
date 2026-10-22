// Dedicated two-story straight flights. Geometry is authored in feet; the contract is meters.
import {MAT} from './forge_glb.mjs';
const FT=.3048;
const isStair=r=>!!r.embeddedStair||/stair/i.test([r.type,r.roomType,r.name].join(' '));
export function planStraightStairs(rooms,elevations,stops){
 const routes=[],claimed=new Set(),partners=new Map();
 for(const r of rooms){delete r.source.forgeStair;r.source.forgeStairTraversalEnabled=false;}
 for(const r of rooms.filter(isStair)){
  if(claimed.has(r.id))continue;
  const candidates=rooms.filter(q=>q.floor===r.floor+1&&isStair(q)&&(r.stairLink?q.stairLink===r.stairLink:!q.stairLink));
  const upper=candidates.find(q=>['x','y','l','w'].every(k=>Math.abs(+q[k]- +r[k])<.025));
  let reason='STAIR_PAIR_NOT_ALIGNED';
  if(!candidates.length)reason='STAIR_PAIR_MISSING';
  if(upper){
   const minX=+r.x*FT,maxX=(+r.x+ +r.l)*FT,minZ=+r.y*FT,maxZ=(+r.y+ +r.w)*FT,lowerY=elevations[r.floor],upperY=elevations[upper.floor],rise=upperY-lowerY,landing=1.3,runStart=minZ+landing,runEnd=maxZ-landing,run=runEnd-runStart,count=Math.ceil(rise/.19);
   const lowOpen=(o)=>o.type==='window'||(o.wall==='top'||['left','right'].includes(o.wall)&&Number(o.pos??.5)*(maxZ-minZ)+(Number(o.clearWidthMeters)||1.08)/2+.12<=landing);
   const highOpen=(o)=>o.type==='window'||(o.wall==='bottom'||['left','right'].includes(o.wall)&&Number(o.pos??.5)*(maxZ-minZ)-(Number(o.clearWidthMeters)||1.08)/2-.12>=maxZ-minZ-landing);
   const secret=stops.some(s=>[r.floor,upper.floor].includes(s.floor)&&s.requiresUnlock);
   if(r.embeddedStair||upper.embeddedStair||r.stairDirection!=='z+'||upper.stairDirection!=='z+'||/spiral|switchback/i.test([r.name,upper.name,r.stairType,upper.stairType].join(' ')))reason='STAIR_CONFIGURATION_UNSUPPORTED';
   else if(secret)reason='STAIR_LOCKED_DESTINATION';
   else if(candidates.length!==1||rooms.some(q=>isStair(q)&&q.floor===upper.floor+1&&q.stairLink&&q.stairLink===upper.stairLink)||partners.has(r.floor)&&partners.get(r.floor)!==upper.floor||partners.has(upper.floor)&&partners.get(upper.floor)!==r.floor)reason='STAIR_CHAIN_UNSUPPORTED';
   else if(rise<=0||rise>6||maxX-minX<1.4||count>40||run/count<.25)reason='STAIR_RUN_TOO_SHORT';
   else if(Math.abs(+r.h*FT-rise)>.03||+upper.h*FT<2.1)reason='STAIR_HEADROOM_UNSAFE';
   else if(rooms.some(q=>![r.id,upper.id].includes(q.id)&&[r.floor,upper.floor].includes(q.floor)&&Math.min(+q.x+ +q.l,+r.x+ +r.l)-Math.max(+q.x,+r.x)>.025&&Math.min(+q.y+ +q.w,+r.y+ +r.w)-Math.max(+q.y,+r.y)>.025))reason='STAIR_VOLUME_OVERLAP';
   else if(!(r.openings||[]).every(lowOpen)||!(upper.openings||[]).every(highOpen))reason='STAIR_LANDING_BLOCKED';
   else if((r.furniture||[]).length||(upper.furniture||[]).length||['decor','artwork','photos'].some(k=>(r[k]||[]).length||(upper[k]||[]).length))reason='STAIR_AUTHORED_OBJECTS_REQUIRE_REVIEW';
   else {
    const route={version:1,id:'straight:'+r.id,roomId:r.id,upperRoomId:upper.id,lowerFloor:r.floor,upperFloor:upper.floor,kind:'straight',direction:'z+',minX,maxX,minZ,maxZ,lowerY,upperY,runStart,runEnd,landingMeters:landing,treadCount:count,riserMeters:rise/count,treadMeters:run/count,headroomMeters:+upper.h*FT,physicalTraversalEnabled:true,fallback:'elevator',status:'STRAIGHT_STATIC_VALIDATED',physicsCertified:false};
    routes.push(route);claimed.add(upper.id);partners.set(r.floor,upper.floor);partners.set(upper.floor,r.floor);
    for(const q of [r,upper]){q.source.forgeStairTraversalEnabled=true;q.source.forgeStair={...route};q.source.stairAccessFallback='elevator';}continue;
   }
  }
  r.source.forgeStairTraversalEnabled=false;delete r.source.forgeStair;r.source.stairAccessFallback='elevator';routes.push({roomId:r.id,upperRoomId:upper?.id||null,physicalTraversalEnabled:false,fallback:'elevator',status:reason,physicsCertified:false});
 }
 return routes;
}
export function straightStairParts(room,floor){
 const s=room.forgeStair;if(!s?.physicalTraversalEnabled)return [];
 const out=[],add=(c,size,mat=MAT.wood,rot=0)=>out.push({c:c.map(v=>v/FT),s:size.map(v=>v/FT),mat,rot,rotAxis:'x'}),x=(s.minX+s.maxX)/2,width=s.maxX-s.minX-.18;
 if(floor===s.upperFloor){add([x,s.upperY-.036,(s.runEnd+s.maxZ)/2],[width,.072,s.maxZ-s.runEnd],MAT.floor);return out;}
 for(let i=0;i<s.treadCount;i++){const top=s.lowerY+(i+1)*s.riserMeters,z=s.runStart+(i+.5)*s.treadMeters;add([x,(s.lowerY+top)/2,z],[width,top-s.lowerY,s.treadMeters]);add([x,top-.012,z-s.treadMeters/2+.018],[width,.024,.036],MAT.trim);}
 const length=Math.hypot(s.runEnd-s.runStart,s.upperY-s.lowerY),angle=-Math.atan2(s.upperY-s.lowerY,s.runEnd-s.runStart);
 for(const side of [-1,1]){const px=side<0?s.minX+.07:s.maxX-.07;
  add([px,(s.lowerY+s.upperY)/2+1.02,(s.runStart+s.runEnd)/2],[.09,.10,length],MAT.wood,angle);
  for(let i=0;i<=s.treadCount;i+=2){const y=s.lowerY+i*s.riserMeters,z=s.runStart+i*s.treadMeters;add([px,y+.5,z],[.055,1,.055],MAT.metal);}
 }
 return out;
}

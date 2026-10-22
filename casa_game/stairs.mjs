// Pure runtime consumer of compiled straight flights. No blueprint reconstruction.
const validatedRoutes=new WeakMap();
export function stairRoutes(house){if(!house)return [];const source=house.access?.stairRoutes,cached=validatedRoutes.get(house);if(cached&&cached.source===source)return cached.routes;const routes=(source||[]).filter(s=>{
 if(s.version!==1||!s.physicalTraversalEnabled||s.kind!=='straight'||s.direction!=='z+'||![s.minX,s.maxX,s.minZ,s.maxZ,s.lowerY,s.upperY,s.runStart,s.runEnd,s.treadCount,s.riserMeters,s.treadMeters,s.headroomMeters].every(Number.isFinite))return false;
 const lower=house.rooms.find(r=>r.id===s.roomId),upper=house.rooms.find(r=>r.id===s.upperRoomId),b=lower?.boundsFeet,u=upper?.boundsFeet,near=(a,b)=>Math.abs(a-b)<.001;
 return lower&&upper&&lower.floor===s.lowerFloor&&upper.floor===s.upperFloor&&s.upperFloor===s.lowerFloor+1&&b&&u&&['x','y','l','w'].every(k=>near(+b[k],+u[k]))&&near(+b.x*.3048,s.minX)&&near((+b.x+ +b.l)*.3048,s.maxX)&&near(+b.y*.3048,s.minZ)&&near((+b.y+ +b.w)*.3048,s.maxZ)&&near(house.manifest.floors[s.lowerFloor]?.elevationMeters,s.lowerY)&&near(house.manifest.floors[s.upperFloor]?.elevationMeters,s.upperY)&&s.maxX-s.minX>=1.4&&s.upperY>s.lowerY&&s.runStart-s.minZ>=1.29&&s.maxZ-s.runEnd>=1.29&&s.runEnd>s.runStart&&Number.isInteger(s.treadCount)&&s.treadCount>0&&s.treadCount<=40&&s.riserMeters>0&&s.riserMeters<=.191&&s.treadMeters>=.25&&s.headroomMeters>=2.1&&near(s.treadCount*s.riserMeters,s.upperY-s.lowerY)&&near(s.treadCount*s.treadMeters,s.runEnd-s.runStart);
 });validatedRoutes.set(house,{source,routes});return routes;}

export function stairHeight(s,z){if(z<=s.runStart)return s.lowerY;if(z>=s.runEnd)return s.upperY;return Math.min(s.upperY,s.lowerY+Math.ceil((z-s.runStart)/s.treadMeters-1e-7)*s.riserMeters);}
export function sampleHouseSurface(house,room,x,z,previousY,{unlocked=false}={}){
 const routes=stairRoutes(house),s=routes.find(s=>[s.lowerFloor,s.upperFloor].includes(room.floor)&&x>=s.minX-.25&&x<=s.maxX+.25&&z>=s.minZ-.25&&z<=s.maxZ+.25);
 if(!s)return house.manifest.floors[room.floor].elevationMeters;
 if(house.access.stops.some(stop=>[s.lowerFloor,s.upperFloor].includes(stop.floor)&&stop.requiresUnlock)&&!unlocked)return null;
 const onFlight=z>s.runStart+.001&&z<s.runEnd-.001;
 if(onFlight&&(x<s.minX+.27||x>s.maxX-.27))return null;
 const y=stairHeight(s,z);return Math.abs(y-previousY)>.205?null:y;
}
export function stairRoomAt(house,room,x,y,z){
 const s=stairRoutes(house).find(s=>[s.roomId,s.upperRoomId].includes(room.id)&&x>=s.minX&&x<=s.maxX&&z>=s.minZ&&z<=s.maxZ);
 return s?house.rooms.find(r=>r.id===(y>=s.upperY-.001?s.upperRoomId:s.roomId))||room:room;
}
export function stairResidentFloors(house,floor,position=null,range=2){const s=stairRoutes(house).find(s=>[s.lowerFloor,s.upperFloor].includes(floor));if(!s)return [floor];if(position&&Math.hypot(Math.max(s.minX-position[0],0,position[0]-s.maxX),Math.max(s.minZ-position[2],0,position[2]-s.maxZ))>range)return [floor];return [s.lowerFloor,s.upperFloor];}

import {roomContains,floorY,blockedByFurniture} from './session.mjs';
export const HAUNTING_SITE_FAMILIES=Object.freeze(['vigil','choir','escort','loop','masquerade','bargain','heist','garden']);
export const HALL_HAUNTING_POINTS=[[0,0,-7],[0,0,-1],[8,0,-4],[-8,0,-4]];
/** Validate the same compiled contract at export and at runtime. */
export function validateHauntingSites(house,contract){
 const issues=[],sites=contract?.sites;if(!Array.isArray(contract?.families)||contract.families.length!==8||!HAUNTING_SITE_FAMILIES.every(t=>contract.families.includes(t)))issues.push({severity:'BLOCK_GAME_READY',code:'HAUNTING_FAMILIES_INCOMPLETE'});if(contract?.version!==1||!Array.isArray(sites)||sites.length!==4)return [{severity:'BLOCK_GAME_READY',code:'HAUNTING_SITE_COUNT',message:'Four encounter sites are required.'}];
 for(const [i,s]of sites.entries()){
  const p=s.approachMeters,r=house.rooms.find(r=>r.id===s.roomId),finite=Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);let safe=false;
  if(finite&&s.scene==='hall')safe=s.roomId==='signature-main-hall'&&s.floor===-1&&HALL_HAUNTING_POINTS.some(q=>q.every((v,k)=>Math.abs(v-p[k])<.001));
  if(finite&&s.scene==='house'&&r&&s.floor===r.floor&&!r.forgeStair&&!house.access.stairRoutes?.some(a=>[a.roomId,a.upperRoomId].includes(r.id)))safe=roomContains(r,p,.4)&&Math.abs(p[1]-floorY(house,r.floor))<.1&&!blockedByFurniture(house,r.floor,p[0],p[2],p[1],.4)&&!house.access.stops.some(a=>(a.floor===r.floor&&a.requiresUnlock)||(a.roomId===r.id&&Math.hypot(a.approachMeters[0]-p[0],a.approachMeters[2]-p[2])<.9));
  const q=s.displayMeters;if(q){const finiteDisplay=Array.isArray(q)&&q.length===3&&q.every(Number.isFinite);let displaySafe=finiteDisplay&&finite&&Math.abs(q[1]-p[1])<.01&&Math.hypot(q[0]-p[0],q[2]-p[2])<=.85;if(displaySafe&&s.scene==='house')displaySafe=!!r&&roomContains(r,q,.4)&&!blockedByFurniture(house,r.floor,q[0],q[2],q[1],.4)&&!house.access.stops.some(a=>a.roomId===r.id&&Math.hypot(q[0]-a.approachMeters[0],q[2]-a.approachMeters[2])<.9);if(displaySafe&&s.scene==='hall')displaySafe=HALL_HAUNTING_POINTS.some(a=>a.every((v,k)=>Math.abs(v-p[k])<.001)&&Math.abs(q[0]-(a[0]===0?0:a[0]-Math.sign(a[0])*.65))<.001&&Math.abs(q[2]-(a[2]+(a[0]===0?.65:0)))<.001);if(!displaySafe)safe=false;}
  if(!safe)issues.push({severity:'BLOCK_GAME_READY',code:'HAUNTING_SITE_UNSAFE',roomId:s.roomId,index:i,message:'An encounter site crosses furniture, a stair, a locked floor or an elevator threshold.'});
  if(finite&&sites.slice(0,i).some(a=>a.scene===s.scene&&a.roomId===s.roomId&&Array.isArray(a.approachMeters)&&a.approachMeters.length===3&&a.approachMeters.every(Number.isFinite)&&Math.hypot(...a.approachMeters.map((v,k)=>v-p[k]))<1.5))issues.push({severity:'BLOCK_GAME_READY',code:'HAUNTING_SITES_OVERLAP',roomId:s.roomId,index:i});
 }
 return issues;
}

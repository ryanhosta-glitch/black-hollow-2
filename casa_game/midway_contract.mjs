/** Pass-one mode contract; the player selector is enabled only with a tested ride runtime. */
export const MIDWAY_EXPERIENCE=Object.freeze({id:'midway',label:'The Haunted Midway',routeEdition:'haunted-midway-route-1',runtimeReady:false});
const pending=new WeakMap();
/** Optional sidecars are candidates, not proof that a carriage can be driven in the Game. */
export async function readMidwayCandidate(house){
 if(!house?.manifest?.midwayPlan)return null;
 if(!pending.has(house))pending.set(house,(async()=>{
  try{if((house.entries?.get(house.manifest.midwayPlan)?.size||0)>2*1024*1024)return null;const plan=await house.json(house.manifest.midwayPlan);if(plan?.version!==1||plan.edition!==MIDWAY_EXPERIENCE.routeEdition||plan.houseId!==house.manifest.id||plan.runtimeReady!==false||!plan.validation?.valid||!Array.isArray(plan.legs)||plan.legs.length>1800||!Array.isArray(plan.coverage?.visited)||plan.coverage.visited.length>64)return null;
   const ids=new Set(house.rooms.map(r=>r.id));if(plan.coverage.visited.some(id=>!ids.has(id))||!['STATIC_ROUTE_VALIDATED','STATIC_CONTAINED_VALIDATED'].includes(plan.status))return null;let count=0;for(const leg of plan.legs){if(!['room','portal','transfer','scene','turn'].includes(leg.kind)||!ids.has(leg.roomId)||!Array.isArray(leg.points)||!leg.points.length)return null;count+=leg.points.length;if(count>24000||leg.points.some(p=>!Array.isArray(p)||p.length!==3||!p.every(Number.isFinite)))return null;}return structuredClone(plan);
  }catch{return null;}
 })());
 const plan=await pending.get(house);return plan?structuredClone(plan):null;
}

import {buildMidwayPlan,validateMidwayPlan} from './forge_midway.mjs';
import {floorElevationsFeet} from './forge_readiness_audit.mjs';
/** Derive clearance inputs from the package's actual normalized navigation, not a possibly stale blueprint. */
export function midwaySourceFromArchive(house){
 if(!house?.rooms?.length||house.rooms.length>512||!Array.isArray(house.manifest?.floors)||!house.manifest.floors.length||house.manifest.floors.length>64)throw Error('Invalid archive navigation');
 const source={id:house.manifest.id,name:house.manifest.name,gameEntry:structuredClone(house.manifest.entry),floors:house.manifest.floors.map((f,floor)=>({name:f.name,rooms:house.rooms.filter(r=>r.floor===floor).map(r=>({...structuredClone(r.boundsFeet),id:r.id,name:r.name,type:r.type,roomType:r.roomType,roomTheme:r.roomTheme,flooring:r.flooring,openings:structuredClone(r.openings||[]),forgeStair:structuredClone(r.forgeStair)}))}))};
 const elevations=floorElevationsFeet(source.floors);for(const [i,f]of house.manifest.floors.entries()){if(!house.entries?.has(f.model)||!Number.isFinite(f.elevationMeters)||Math.abs(elevations[i]*.3048-f.elevationMeters)>.002)throw Error('Unsupported floor geometry/elevation contract');}
 if(!house.entries.has(house.access?.cabin?.model))throw Error('Missing elevator model');return source;
}
export function buildMidwayForArchive(house){const source=midwaySourceFromArchive(house),plan=buildMidwayPlan(source,house.access,house.decoration,{houseId:house.manifest.id});if(plan.validation.valid&&!validateMidwayPlan(plan,{source,access:house.access,decoration:house.decoration}).valid)throw Error('Independent archive route replay failed');return plan;}

import {ROOM_MATERIALS as M} from './room_materials.mjs';
import {resolveRoomProfile,stableRoomHash} from './room_profiles.mjs';
const freeze=o=>{for(const v of Object.values(o))if(v&&typeof v==='object')freeze(v);return Object.freeze(o);};
export const ATMOSPHERE_CONDITIONS=freeze({preserved:{wear:0,dust:12,webs:0},abandoned:{wear:1,dust:40,webs:1},decaying:{wear:2,dust:64,webs:2}});
export const ATMOSPHERE_FAMILIES=freeze({
 formal:{textiles:true,glass:true,botanicals:true,condition:'preserved'},private:{textiles:true,glass:true,botanicals:false,condition:'abandoned'},
 scholarly:{textiles:false,glass:true,botanicals:true,condition:'abandoned'},botanical:{textiles:false,glass:true,botanicals:true,condition:'decaying'},
 funerary:{textiles:false,glass:false,botanicals:true,condition:'decaying'},circulation:{textiles:false,glass:false,botanicals:false,condition:'abandoned'}
});
export const ATMOSPHERE_IDENTITIES=freeze({library:{textiles:true},laboratory:{waterStaining:true},nursery:{effects:false},ballroom:{condition:'abandoned'},crypt:{waterStaining:true},conservatory:{waterStaining:true}});
export const GOTHIC_LIMITS=freeze({maxTemplateTriangles:1200,maxTemplateMaterials:8,maxRoomTriangles:2200,maxRoomGroups:40,dust:{cinematic:64,performance:0},pulseAmplitude:.025,minPulseSeconds:10});
/** Additive, authored policy. No inference rewrites finishes, room identity or geometry. */
export function resolveRoomAtmosphere(room={}){
 const p=resolveRoomProfile(room),raw=(room.forgeDecoration||room.source?.forgeDecoration)?.atmosphere,own=raw&&typeof raw==='object'?raw:{},base={...ATMOSPHERE_FAMILIES[p.family],...ATMOSPHERE_IDENTITIES[p.identity]},condition=Object.hasOwn(ATMOSPHERE_CONDITIONS,own.condition)?own.condition:base.condition,enabled=raw!==false&&own.enabled!==false;
 const switches=(room.forgeDecoration||room.source?.forgeDecoration)?.components||{},on=id=>switches[id]!==false&&switches[id]?.enabled!==false;
 const result={edition:'gothic-atmosphere-1',identity:p.identity,family:p.family,condition,variant:stableRoomHash(room.id??room.source?.id??p.identity)%3,enabled};
 for(const key of ['textiles','glass','botanicals'])result[key]=enabled&&(typeof own[key]==='boolean'?own[key]:base[key]);
 result.fabric=['claret','emerald','blue','ivory'].includes(own.fabric)?own.fabric:({ballroom:'claret',bedroom:'blue',nursery:'ivory',gallery:'blue',parlor:'claret'}[p.identity]||'emerald');
 result.textiles&&=on('gothic-textiles');result.glass&&=on('leaded-window');result.botanicals&&=on('gothic-botanicals');
 result.aging=enabled&&own.aging!==false&&on('surface-aging');result.effects=enabled&&(typeof own.effects==='boolean'?own.effects:base.effects!==false&&condition!=='preserved');
 result.waterStaining=result.aging&&condition==='decaying'&&(typeof own.waterStaining==='boolean'?own.waterStaining:!!base.waterStaining);
 result.botanicalState=['maintained','dried','overgrown'].includes(own.botanicalState)?own.botanicalState:condition==='decaying'?(p.family==='funerary'?'dried':'overgrown'):condition==='abandoned'?'dried':'maintained';
 result.wear=result.aging?ATMOSPHERE_CONDITIONS[condition].wear:0;result.webs=result.aging?ATMOSPHERE_CONDITIONS[condition].webs:0;
 return result;
}

/** Only generated detail materials; authored structural finishes are excluded by callers. */
export function atmosphereMaterial(mat,policy){if(!policy.aging||!policy.wear)return mat;if([M.upholstery,M.emeraldVelvet,M.blueVelvet].includes(mat))return policy.wear===1?(mat===M.blueVelvet?M.fadedBlue:M.fadedVelvet):M.wornVelvet;if([M.metal,M.bronze,M.gilt].includes(mat))return M.patina;if(mat===M.wood)return M.agedMahogany;if(policy.wear===2&&[M.stone,M.crypt].includes(mat))return M.agedStone;return mat;}

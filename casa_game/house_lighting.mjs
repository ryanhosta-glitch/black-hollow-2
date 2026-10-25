import {stableRoomHash} from './room_profiles.mjs';
export {lightingQualityForDevice} from './lighting_profiles.mjs';
import {lightingQuality} from './lighting_profiles.mjs';
/** A bounded three-light composition for the room currently occupied. */
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
export function lightRole(light){return light.role||(/:chandelier$|:ceiling-light$/.test(light.id||'')?'key':/^artisan:/.test(light.id||'')?'practical':'fill');}
export function calibratedLight(light){
 if(light.photometricEdition==='house-light-2')return {...light,intensity:Math.min(32,Math.max(0,Number(light.intensity)||0)),rangeMeters:Math.min(16,Math.max(2,Number(light.rangeMeters)||8))};
 if(light.photometricEdition==='house-light-1')return {...light,intensity:Math.min(28,Math.max(0,Number(light.intensity)||0)),rangeMeters:Math.min(16,Math.max(4,Number(light.rangeMeters)||8))};
 const role=lightRole(light),gain=role==='key'?12:role==='practical'?14:5;
 return {...light,role,intensity:Math.min(28,Math.max(role==='key'?9:role==='practical'?5:1.5,(Number(light.intensity)||1)*gain)),rangeMeters:Math.min(16,Math.max(4,Number(light.rangeMeters)||8)),photometricEdition:'house-light-1'};
}
export function selectHouseLights(house,{roomId,floor,position,quality='cinematic'}){
 const candidates=(house?.decoration?.lights||[]).filter(l=>l.floor===floor&&Array.isArray(l.positionMeters)&&l.positionMeters.every(Number.isFinite)),local=candidates.filter(l=>String(l.roomId)===String(roomId));
 // A lit neighboring room must never steal all of the active room's light slots.
 const pool=(local.length?local:candidates).map(calibratedLight).sort((a,b)=>distance(position,a.positionMeters)-distance(position,b.positionMeters)),selected=[];
 const nearbyFire=pool.find(l=>lightRole(l)==='hearth'&&distance(position,l.positionMeters)<3.5);
 const task=pool.find(l=>lightRole(l)==='task'&&distance(position,l.positionMeters)<3),portrait=pool.some(l=>lightRole(l)==='portrait');
 const windowRole=pool.some(l=>lightRole(l)==='stained'&&distance(position,l.positionMeters)<4)?'stained':'moon',botanical=pool.some(l=>l.roomLighting?.identity==='conservatory');
 for(const role of ['key',task?'task':nearbyFire?'hearth':portrait?'portrait':botanical?windowRole:'practical',windowRole,windowRole==='moon'?'stained':'moon']){const light=pool.find(l=>lightRole(l)===role&&!selected.includes(l));if(light)selected.push(light);}
 for(const light of pool)if(selected.length<3&&!selected.includes(light))selected.push(light);
 const policy=house?.decoration?.roomContents?.find(c=>String(c.roomId)===String(roomId))?.atmosphere;return selected.slice(0,lightingQuality(quality).lights).map(l=>quality==='cinematic'&&policy?.effects&&['key','practical','hearth'].includes(lightRole(l))?{...l,gothicPulse:{amplitude:.025,periodSeconds:12,phase:stableRoomHash(l.id)%23}}:l);
}
export function footstepSurface(room,mode='house'){
 if(mode==='grounds')return 'soil';if(mode==='street')return 'stone';
 const text=[room?.flooring,room?.roomTheme,room?.name].join(' ').toLowerCase();return /stone|marble|checker|tile|crypt|laboratory|conservatory/.test(text)?'stone':'wood';
}

/** Configure the existing pool and ambient floor. No additional renderer or point-light allocation. */
export function applyHouseLightQuality({ambient,moon,lights},specs,{quality='cinematic',shadows=true}={}){
 const limits=lightingQuality(quality),profile=specs.find(s=>s.roomLighting)?.roomLighting;
 if(profile&&ambient){ambient.intensity=Math.min(.9,Math.max(.55,profile.ambient*limits.ambientGain));ambient.color.set(profile.sky);ambient.groundColor.set(profile.ground);if(moon)moon.intensity=.08;}
 for(let i=0;i<lights.length;i++){lights[i].visible=i<limits.lights;const cast=shadows&&limits.shadowMaps>0&&i===0&&!!specs[0]&&(specs[0].role==='key'||!specs[0].roomLighting);if(lights[i].castShadow!==cast){lights[i].castShadow=cast;lights[i].shadow.needsUpdate=true;if(!cast&&lights[i].shadow.map){lights[i].shadow.dispose();lights[i].shadow.map=null;lights[i].shadow.mapPass=null;}}if(i>=limits.lights)lights[i].intensity=0;}
 return {quality,activeLightLimit:limits.lights,shadowMapLimit:shadows?limits.shadowMaps:0,identity:profile?.identity||null};
}

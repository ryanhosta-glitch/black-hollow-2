/** A bounded three-light composition for the room currently occupied. */
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
export function lightRole(light){return light.role||(/:chandelier$|:ceiling-light$/.test(light.id||'')?'key':/^artisan:/.test(light.id||'')?'practical':'fill');}
export function calibratedLight(light){
 if(light.photometricEdition==='house-light-1')return {...light,intensity:Math.min(28,Math.max(0,Number(light.intensity)||0)),rangeMeters:Math.min(16,Math.max(4,Number(light.rangeMeters)||8))};
 const role=lightRole(light),gain=role==='key'?12:role==='practical'?14:5;
 return {...light,role,intensity:Math.min(28,Math.max(role==='key'?9:role==='practical'?5:1.5,(Number(light.intensity)||1)*gain)),rangeMeters:Math.min(16,Math.max(4,Number(light.rangeMeters)||8)),photometricEdition:'house-light-1'};
}
export function selectHouseLights(house,{roomId,floor,position}){
 const candidates=(house?.decoration?.lights||[]).filter(l=>l.floor===floor&&Array.isArray(l.positionMeters)&&l.positionMeters.every(Number.isFinite)),local=candidates.filter(l=>String(l.roomId)===String(roomId));
 // A lit neighboring room must never steal all of the active room's light slots.
 const pool=(local.length?local:candidates).map(calibratedLight).sort((a,b)=>distance(position,a.positionMeters)-distance(position,b.positionMeters)),selected=[];
 const nearbyFire=pool.find(l=>lightRole(l)==='hearth'&&distance(position,l.positionMeters)<3.5);
 for(const role of ['key',nearbyFire?'hearth':'practical','moon']){const light=pool.find(l=>lightRole(l)===role&&!selected.includes(l));if(light)selected.push(light);}
 for(const light of pool)if(selected.length<3&&!selected.includes(light))selected.push(light);
 return selected.slice(0,3);
}
export function footstepSurface(room,mode='house'){
 if(mode==='grounds')return 'soil';if(mode==='street')return 'stone';
 const text=[room?.flooring,room?.roomTheme,room?.name].join(' ').toLowerCase();return /stone|marble|checker|tile|crypt|laboratory|conservatory/.test(text)?'stone':'wood';
}

const FT=.3048;
export const MIN_HINGED_DOOR_SPACING_METERS=1.25;
/** Mutates only the derived Forge rooms. Shared apertures stay reciprocal and
 * elevator/entry contracts remain intact. Re-run after generated doors exist. */
export function repairDoorSwings(rooms,{entry=null,changes=[]}={}){
 const shared=new Map();for(const r of rooms)for(const o of r.openings||[])if(o.shared){if(!shared.has(o.shared))shared.set(o.shared,[]);shared.get(o.shared).push({r,o});}
 for(const r of rooms)for(const wall of ['top','bottom','left','right']){
  const span=Number(['left','right'].includes(wall)?r.w:r.l)*FT;
  // Recompute after every change: a removed middle door must not hide a new
  // conflicting pair, and conversion can change a partner in a previous room.
  while(true){
   const doors=(r.openings||[]).filter(o=>o.wall===wall&&o.type==='door'&&!o.forgeElevator).sort((a,b)=>a.pos-b.pos);
   const index=doors.findIndex((o,i)=>i>0&&(o.pos-doors[i-1].pos)*span<MIN_HINGED_DOOR_SPACING_METERS);if(index<0)break;
   const pair=[doors[index-1],doors[index]],isEntry=o=>r.id===entry?.roomId&&o.id===entry.openingId;
   const selected=pair.filter(o=>o.shared&&!isEntry(o)).sort((a,b)=>Number(!!b.forgeGenerated)-Number(!!a.forgeGenerated))[0];
   if(selected){const ends=shared.get(selected.shared)||[];for(const {o}of ends)if(o.type==='door')o.type='arch';changes.push({code:'REPLACE_COLLIDING_DOOR_SWING',roomId:r.id,shared:selected.shared,rooms:ends.map(e=>e.r.id),openings:ends.map(e=>e.o.id),reason:'Final doorway swing clearance'});}
   else {const remove=pair.find(o=>!isEntry(o)&&!o.forgeEntry);if(!remove)throw Error('Cannot preserve both main entrances while repairing door swing clearance.');r.openings=r.openings.filter(o=>o!==remove);changes.push({code:'REMOVE_REDUNDANT_DOOR',roomId:r.id,openingId:remove.id,reason:'Final doorway swing clearance'});}
  }
 }
 return changes;
}

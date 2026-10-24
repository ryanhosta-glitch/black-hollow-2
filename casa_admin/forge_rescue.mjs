// Repair a derived blueprint. The original stays byte-for-byte in source.haunt.
const FT=.3048,opposite={top:'bottom',bottom:'top',left:'right',right:'left'};
const intersects=(a,b)=>Math.min(a.x+a.l,b.x+b.l)-Math.max(a.x,b.x)>.025&&Math.min(a.y+a.w,b.y+b.w)-Math.max(a.y,b.y)>.025;
function edge(a,b,wall){const vertical=['left','right'].includes(wall),line=wall==='left'?a.x:wall==='right'?a.x+a.l:wall==='top'?a.y:a.y+a.w,other=wall==='left'?b.x+b.l:wall==='right'?b.x:wall==='top'?b.y+b.w:b.y,lo=Math.max(vertical?a.y:a.x,vertical?b.y:b.x),hi=Math.min(vertical?a.y+a.w:a.x+a.l,vertical?b.y+b.w:b.x+b.l);return Math.abs(line-other)<.08&&hi-lo>.86/FT?{lo,hi,vertical}:null;}
export function rescueBlueprint(source){
 if(!source||!Array.isArray(source.floors)||!source.floors.length)throw Error('This file has no floor plans to repair.');
 const blueprint=structuredClone(source),changes=[],unresolved=[],ids=new Set(),rooms=[];
 if(blueprint.floors.reduce((n,f)=>n+(f.rooms?.length||0),0)>512)throw Error('Blueprint exceeds the 512-room repair budget.');
 blueprint.floors=blueprint.floors.filter((f,floor)=>{if(!Array.isArray(f.rooms))throw Error('Floor '+(floor+1)+' has no room plans.');if(f.rooms.length)return true;changes.push({code:'REMOVE_EMPTY_FLOOR',floor});return false;});
 if(!blueprint.floors.length)throw Error('This file contains no rooms to repair.');
 for(const [floor,f]of blueprint.floors.entries()){
  const settled=[];
  for(const [index,r]of f.rooms.entries()){
   if(!r||typeof r!=='object')throw Error('Unrecognizable room record on floor '+(floor+1));
   const originalId=r.id;r.id=String(r.id||`forge-room-${floor}-${index}`);if(ids.has(r.id)){let n=2;while(ids.has(r.id+'-'+n))n++;r.id+='-'+n;}ids.add(r.id);if(r.id!==originalId)changes.push({code:'REPAIR_ROOM_ID',roomId:r.id,from:originalId??null});
   const before=Object.fromEntries(['x','y','l','w','h'].map(k=>[k,r[k]??null]));
   for(const k of ['x','y'])r[k]=Number.isFinite(Number(r[k]))?Number(r[k]):0;
   for(const k of ['l','w'])r[k]=Math.max(4.5,Number.isFinite(Number(r[k]))&&Number(r[k])>0?Number(r[k]):12);
   r.h=Math.max(2.6/FT,Number.isFinite(Number(r.h))&&Number(r.h)>0?Number(r.h):10);
   if(['x','y','l','w','h'].some(k=>Math.abs(r[k])>10000))throw Error('Room '+r.id+' exceeds the supported geometry bounds.');
   if(JSON.stringify(before)!==JSON.stringify(Object.fromEntries(['x','y','l','w','h'].map(k=>[k,r[k]]))))changes.push({code:'REPAIR_ROOM_DIMENSIONS',roomId:r.id,from:before,to:Object.fromEntries(['x','y','l','w','h'].map(k=>[k,r[k]]))});
   if(settled.some(q=>intersects(r,q))){const origin={x:r.x,y:r.y},candidates=settled.flatMap(q=>[{x:q.x+q.l,y:r.y},{x:q.x-r.l,y:r.y},{x:r.x,y:q.y+q.w},{x:r.x,y:q.y-r.w}]);candidates.push({x:Math.max(...settled.map(q=>q.x+q.l)),y:r.y});const next=candidates.filter(p=>!settled.some(q=>intersects({...r,...p},q))).sort((a,b)=>Math.hypot(a.x-r.x,a.y-r.y)-Math.hypot(b.x-r.x,b.y-r.y))[0];Object.assign(r,next);changes.push({code:'SEPARATE_OVERLAPPING_ROOM',roomId:r.id,from:origin,to:next});}
   settled.push(r);rooms.push({r,floor});
   const openingIds=new Set();r.openings=(Array.isArray(r.openings)?r.openings:[]).filter(o=>{const ok=o&&Object.hasOwn(opposite,o.wall)&&['door','open','arch','window'].includes(o.type);if(!ok)changes.push({code:'REPLACE_UNSUPPORTED_OPENING',roomId:r.id});return ok;}).map((o,i)=>{
    if(!o.id||openingIds.has(o.id))o.id=`forge-opening-${r.id}-${i}`;openingIds.add(o.id);
    const old=JSON.stringify(o),span=(['left','right'].includes(o.wall)?r.w:r.l)*FT;
    o.pos=Number.isFinite(Number(o.pos))?Math.max(.05,Math.min(.95,Number(o.pos))):.5;
    if(o.type!=='open'){const width=Math.max(.7,Math.min(Number(o.clearWidthMeters)||Number(o.width||3.54)*FT,span-.16,o.type==='door'?( ['left','right'].includes(o.wall)?r.l:r.w)*FT-.2:Infinity));o.clearWidthMeters=width;o.width=width/FT;o.pos=Math.max((width/2+.08)/span,Math.min(1-(width/2+.08)/span,o.pos));}
    if(JSON.stringify(o)!==old)changes.push({code:'REPAIR_OPENING_CLEARANCE',roomId:r.id,openingId:o.id});return o;
   });
   if(r.furniture!==undefined){const authored=r.furniture;r.furniture=(Array.isArray(authored)?authored:[]).filter(o=>o&&typeof o==='object');if(!Array.isArray(authored)||r.furniture.length!==authored.length)changes.push({code:'REPLACE_UNSAFE_FURNITURE',roomId:r.id,reason:'unrecognized furniture records'});}
   // Invalid structural shafts become the supported pocket-elevator system.
   if(r.elevatorShaftId){changes.push({code:'REPLACE_AUTHORED_SHAFT',roomId:r.id,shaftId:r.elevatorShaftId});delete r.elevatorShaftId;}
  }
 }
 const byId=new Map(rooms.map(x=>[x.r.id,x]));
 for(const {r,floor}of rooms)r.openPlanWith=(Array.isArray(r.openPlanWith)?r.openPlanWith:[]).filter(id=>{const q=byId.get(id),ok=q&&q.floor===floor&&Object.keys(opposite).some(w=>edge(r,q.r,w));if(!ok)changes.push({code:'REPLACE_INVALID_OPEN_PLAN',roomId:r.id,neighbor:id});return ok;});
 const pairs=new Map();for(const item of rooms)for(const o of item.r.openings)if(o.shared){if(!pairs.has(o.shared))pairs.set(o.shared,[]);pairs.get(o.shared).push({...item,o});}
 for(const [shared,ends]of pairs){const [a,b]=ends,e=ends.length===2&&a.floor===b.floor&&opposite[a.o.wall]===b.o.wall&&a.o.type!=='window'&&b.o.type!=='window'&&edge(a.r,b.r,a.o.wall);
  if(!e){for(const item of ends){if(item.o.type==='window'){delete item.o.shared;delete item.o.forgeRemovedPartition;}else item.r.openings=item.r.openings.filter(o=>o!==item.o);}changes.push({code:'REPLACE_BROKEN_DOOR_PAIR',shared,rooms:ends.map(x=>x.r.id)});continue;}
  const width=Math.min(a.o.clearWidthMeters||1.08,b.o.clearWidthMeters||1.08,(e.hi-e.lo)*FT-.16),center=Math.max(e.lo+(width/2+.08)/FT,Math.min(e.hi-(width/2+.08)/FT,(e.vertical?a.r.y:a.r.x)+(e.vertical?a.r.w:a.r.l)*a.o.pos));
  for(const item of ends){const span=e.vertical?item.r.w:item.r.l;item.o.pos=(center-(e.vertical?item.r.y:item.r.x))/span;item.o.clearWidthMeters=width;item.o.width=width/FT;item.o.type=a.o.type==='open'||b.o.type==='open'?'open':a.o.type==='arch'&&b.o.type==='arch'?'arch':'door';}
  changes.push({code:'ALIGN_PAIRED_DOOR',shared,rooms:ends.map(x=>x.r.id)});
 }
 // Close hinged doors can overlap even when the aperture graph is connected.
 for(const {r}of rooms)for(const wall of Object.keys(opposite)){
  const span=(['left','right'].includes(wall)?r.w:r.l)*FT,doors=r.openings.filter(o=>o.wall===wall&&o.type==='door').sort((a,b)=>a.pos-b.pos);
  for(let i=1;i<doors.length;i++){const a=doors[i-1],b=doors[i];if(a.type!=='door'||b.type!=='door'||(b.pos-a.pos)*span>=1.25)continue;
   const sharedDoor=[a,b].find(o=>o.shared);
   if(sharedDoor){for(const item of pairs.get(sharedDoor.shared)||[])if(item.o.type==='door')item.o.type='arch';changes.push({code:'REPLACE_COLLIDING_DOOR_SWING',roomId:r.id,shared:sharedDoor.shared});}
   else {const remove=blueprint.gameEntry?.openingId===b.id?a:b;r.openings=r.openings.filter(o=>o!==remove);changes.push({code:'REMOVE_REDUNDANT_DOOR',roomId:r.id,openingId:remove.id});}
  }
 }
 // Legacy anchors are re-selected from checked routes after decoration. Keep originals in source.haunt.
 if(blueprint.gameplay?.anchors){delete blueprint.gameplay.anchors;changes.push({code:'REBUILD_GAMEPLAY_ANCHORS'});}
 return {blueprint,changes,unresolved,status:'AUTO_REPAIRED'};
}

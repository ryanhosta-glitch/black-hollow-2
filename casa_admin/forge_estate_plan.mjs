// A street shows the entrance building; the full estate remains on its grounds.
// Keep touching main-floor rooms together, including rooms without authored doors.
export function planEstateFrontage(floors,entry){
 const main=floors.findIndex(f=>f.rooms.some(r=>r.id===entry.roomId)),list=floors[main].rooms;
 const near=(a,b)=>Math.min(+a.x+ +a.l,+b.x+ +b.l)-Math.max(+a.x,+b.x)>=-.08&&Math.min(+a.y+ +a.w,+b.y+ +b.w)-Math.max(+a.y,+b.y)>=-.08;
 const selected=new Set([entry.roomId]);let changed=true;
 while(changed){changed=false;for(const r of list)if(!selected.has(r.id)&&list.some(q=>selected.has(q.id)&&near(r,q))){selected.add(r.id);changed=true;}}
 const footprint=list.filter(r=>selected.has(r.id));
 const frontage=floors.map((f,i)=>({...f,rooms:i===main?footprint:f.rooms.filter(r=>footprint.some(q=>near(r,q)))}));
 return {floors:frontage,report:{version:1,policy:'entrance-building-with-full-estate-on-grounds',entryRoomId:entry.roomId,streetRoomIds:frontage.flatMap(f=>f.rooms.map(r=>r.id)),estateRoomIds:floors.flatMap(f=>f.rooms.map(r=>r.id)),detachedMainFloorRoomIds:list.filter(r=>!selected.has(r.id)).map(r=>r.id)}};
}

import {floorY} from './session.mjs';
import {wallMount} from './wall_mount.mjs';
/** Reserve the whole leg span and upward escape, including packaged and runtime portraits. */
export function spiderMountsForHouse(house,floor,portraits=[],contents=house.decoration.roomContents||[]){
 return house.rooms.filter(r=>r.floor===floor&&!r.forgeStair).map(room=>{
  const b=room.boundsFeet,x=+b.x*.3048,z=+b.y*.3048,h=+b.h*.3048,base=floorY(house,floor);
  const occupied=[];
  for(const a of [...(house.decoration.artwork||[]),...contents.flatMap(c=>(c.ornaments||[]).filter(o=>o.wall).map(o=>({...o,roomId:c.roomId}))),...portraits]){
   if(a.roomId!==room.id)continue;const p=a.positionMeters||a.position||a.anchor;if(!p)continue;
   const n=a.normal,wall=a.wall||(n?.[0]>.5?'left':n?.[0]<-.5?'right':n?.[2]>.5?'top':n?.[2]<-.5?'bottom':null);if(!wall)continue;
   occupied.push({wall,center:wall==='left'||wall==='right'?p[2]-z:p[0]-x,width:(a.sizeMeters?.[0]||a.width||.8)+.18});
  }
  const mount=wallMount(room,{width:.86,height:1.25,y:Math.min(1.65,h-.8),inset:.065,occupied});
  return mount?{position:[mount.position[0],base+mount.position[1]-.16,mount.position[2]],normal:mount.normal,roomId:room.id}:null;
 }).filter(Boolean);
}

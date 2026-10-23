import {wallMount} from './wall_mount.mjs';
const FT=.3048;
/** Visual-only opportunities. Never changes geometry, collision, doors or authored furniture. */
export function planScareLocations(rooms,decoration={},elevation=()=>0){
 const sites=[];
 for(const room of rooms.slice(0,96)){
  const b=room.boundsFeet||room.bounds||room,x=+b.x*FT,z=+b.y*FT,w=+b.l*FT,d=+b.w*FT,h=+b.h*FT,y=elevation(room.floor);
  if(![x,z,w,d,h,y].every(Number.isFinite)||room.forgeStair||room.elevatorShaftId||/stair|elevator/i.test([room.type,room.roomType,room.name].join(' '))||String(room.id).startsWith('signature-')||Math.min(w,d)<2.6||h<2.6)continue;
  const ornaments=decoration.roomContents?.find(c=>String(c.roomId)===String(room.id))?.ornaments||[];
  const add=(kind,position,normal=[0,0,1],extra={})=>{if(!position?.every(Number.isFinite))return;sites.push({id:`scare:${room.id}:${kind}`,roomId:room.id,floor:room.floor,kind,positionMeters:position,normal,roomHeight:h,groundY:y,visualOnly:true,blocksRoute:false,...extra});};
  const mirror=ornaments.find(o=>/mirror/.test(o.type)&&o.normal&&o.width>=.6);
  if(mirror)add('reflection',mirror.positionMeters.map((n,i)=>n+mirror.normal[i]*.12),mirror.normal);
  const window=(room.openings||[]).find(o=>o.type==='window'&&['top','bottom','left','right'].includes(o.wall)&&Number(o.pos??.5)>=.1&&Number(o.pos??.5)<=.9&&Number(o.clearWidthMeters??1.65)>=.55);
  if(window){const p=Math.max(0,Math.min(1,Number(window.pos??.5))),vertical=['left','right'].includes(window.wall),normal=window.wall==='left'?[1,0,0]:window.wall==='right'?[-1,0,0]:window.wall==='top'?[0,0,1]:[0,0,-1];add('window',[vertical?(window.wall==='left'?x:x+w):x+w*p,y+Math.min(1.8,h-.8),vertical?z+d*p:(window.wall==='top'?z:z+d)].map((n,i)=>n+normal[i]*.13),normal);}
  const mount=wallMount({...room,boundsFeet:b},{width:1.25,height:1.5,y:1.3,inset:.18,preferred:['bottom','right','left','top']});
  if(mount)add('wall-shadow',mount.position.map((n,i)=>n+(i===1?y:0)),mount.normal);
  if(h>=3.15){const mount=wallMount({...room,boundsFeet:b},{width:.8,height:1.2,y:h-.75,inset:.45});if(mount)add('ceiling',mount.position.map((n,i)=>n+(i===1?y:0)),mount.normal);}
 }
 return {version:1,units:'meters',visualOnly:true,maxResidentActors:1,sites};
}

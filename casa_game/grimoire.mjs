import {seedNumber,roomContains,floorY,blockedByFurniture} from './session.mjs';
import {SPELLS} from './magic_spells.mjs';
export const WITCH_MARKS=[
 {name:'The Moth',line:'Small lights are still lights. Follow the one that stays.'},
 {name:'The Briar',line:'What protects a rose need not imprison it.'},
 {name:'The Cup',line:'An empty place can be an invitation.'},
 {name:'The Key',line:'Some doors open when you stop pushing.'},
 {name:'The Moon',line:'You do not have to be full to give light.'},
 {name:'The Thread',line:'What was torn may become a new pattern.'},
 {name:'The Bell',line:'A voice is a way of finding one another.'},
 {name:'The Seed',line:'A thing buried is not always a thing finished.'}
];
const KEY='bh-grimoire:v1';
export function createGrimoire({storage=globalThis.localStorage}={}){
 let raw;try{raw=JSON.parse(storage?.getItem(KEY)||'null');}catch{}
 const data={version:1,equipped:SPELLS[raw?.equipped]?raw.equipped:'witchlight',discoveries:raw?.version===1&&Array.isArray(raw.discoveries)?raw.discoveries.filter(d=>d&&typeof d.id==='string'&&d.id.length<240&&Number.isInteger(d.mark)&&d.mark>=0&&d.mark<8&&typeof d.house==='string').slice(-2048):[]};data.marks=[...new Set([...(raw?.version===1&&Array.isArray(raw.marks)?raw.marks.filter(n=>Number.isInteger(n)&&n>=0&&n<8):[]),...data.discoveries.map(d=>d.mark)])];let persisted=true;
 function save(){try{storage?.setItem(KEY,JSON.stringify(data));persisted=!!storage;}catch{persisted=false;}return persisted;}
 return {data,get persisted(){return persisted;},get marks(){return [...data.marks];},equip(kind){if(!SPELLS[kind])return false;data.equipped=kind;save();return true;},has(id){return data.discoveries.some(d=>d.id===id);},discover(site){if(!site||typeof site.id!=='string'||!Number.isInteger(site.mark)||site.mark<0||site.mark>=8||this.has(site.id))return false;data.discoveries.push({id:site.id,mark:site.mark,house:String(site.house).slice(0,120)});if(!data.marks.includes(site.mark))data.marks.push(site.mark);data.discoveries=data.discoveries.slice(-2048);save();return true;}};
}
/** One optional mark per suitable room, away from authored furniture, quests and lift boarding. */
export function planWitchMarks(house,slots=[]){
 if(!house?.manifest||!house.playability?.rooms)return [];
 const result=[],stairIds=new Set((house.access?.stairRoutes||[]).flatMap(s=>[s.roomId,s.upperRoomId]));
 for(const room of house.rooms.slice(0,96)){
  if(room.forgeStair||room.elevatorShaftId||stairIds.has(room.id)||/stair|elevator/i.test(room.name||''))continue;
  const certified=house.playability.rooms.find(r=>r.roomId===room.id&&r.reachable);if(!certified)continue;
  const y=floorY(house,room.floor),b=room.boundsFeet,base=certified.standingPointMeters;
  if(!b||!base)continue;
  const candidates=[[...base],...[-1,1,-2,2].flatMap(dx=>[-1,1,-2,2].map(dz=>[base[0]+dx,y,base[2]+dz]))];
  const clearPath=p=>Array.from({length:12},(_,i)=>{const u=i/11,x=base[0]+(p[0]-base[0])*u,z=base[2]+(p[2]-base[2])*u;return !blockedByFurniture(house,room.floor,x,z,y,.25);}).every(Boolean);
  const p=candidates.find(p=>clearPath(p)&&roomContains(room,p,.65)&&Math.abs(p[1]-y)<.1&&!blockedByFurniture(house,room.floor,p[0],p[2],p[1],.45)&&!(house.access.stops||[]).some(s=>s.roomId===room.id&&Math.hypot(s.approachMeters[0]-p[0],s.approachMeters[2]-p[2])<1.2)&&!slots.some(s=>s.roomId===room.id&&Math.hypot(s.approachMeters[0]-p[0],s.approachMeters[2]-p[2])<1.4));
  if(p){const id=String(house.manifest.id)+':witch:'+room.id;result.push({id,roomId:room.id,floor:room.floor,position:[...p],house:house.manifest.name,mark:seedNumber(id)%8});}
 }
 return result;
}

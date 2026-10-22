import {openingShape} from './forge_architecture.mjs';
import {floorY,roomContains} from '../casa_game/session.mjs';
export function inspectPlacement(house){
 const warnings=[],rooms=new Map(house.rooms.map(r=>[r.id,r]));
 for(const item of house.decoration.furniture||[]){const room=rooms.get(item.roomId),p=item.positionMeters;if(!room||!roomContains(room,p,.05))warnings.push({code:'FURNITURE_OUTSIDE_ROOM',objectId:item.id});else if(Math.abs(p[1]-floorY(house,room.floor))>.05)warnings.push({code:'FLOATING_FURNITURE',objectId:item.id});}
 for(const stop of house.access.stops){const room=rooms.get(stop.roomId);if(!room||!roomContains(room,stop.approachMeters,.05)||Math.abs(stop.approachMeters[1]-floorY(house,room.floor))>.05)warnings.push({code:'ELEVATOR_ALIGNMENT',objectId:stop.id});}
 for(const route of house.access.stairRoutes||[])if(!route.physicalTraversalEnabled)warnings.push({code:'STAIR_USES_ELEVATOR',objectId:route.roomId,detail:route.status});
 for(const item of house.decoration.artwork||[]){const room=rooms.get(item.roomId),p=item.positionMeters;if(!room||!Array.isArray(p)||p.length!==3||!p.every(Number.isFinite)||p[1]-(item.sizeMeters?.[1]||.8)/2<floorY(house,room.floor)+.15||p[1]+(item.sizeMeters?.[1]||.8)/2>floorY(house,room.floor)+Number(room.boundsFeet.h)*.3048-.15)warnings.push({code:'PORTRAIT_HEIGHT',objectId:item.id});else{const b=room.boundsFeet,distance=Math.min(Math.abs(p[0]-b.x*.3048),Math.abs(p[0]-(+b.x+ +b.l)*.3048),Math.abs(p[2]-b.y*.3048),Math.abs(p[2]-(+b.y+ +b.w)*.3048));if(!roomContains(room,p,-.4))warnings.push({code:'PORTRAIT_OUTSIDE_ROOM',objectId:item.id});
 if(distance>.4)warnings.push({code:'FLOATING_PORTRAIT',objectId:item.id});
 for(const op of room.openings||[]){
  const vertical=['left','right'].includes(op.wall),wall=(vertical?+b.x:+b.y)+(op.wall==='right'?+b.l:op.wall==='bottom'?+b.w:0);
  if(!['door','arch','open','window'].includes(op.type)||Math.abs(p[vertical?0:2]-wall*.3048)>.4)continue;
  const span=Number(vertical?b.w:b.l),shape=openingShape(op,span,+b.h),along=p[vertical?2:0]/.3048-Number(vertical?b.y:b.x),half=Number(item.sizeMeters?.[0]||.8)/.3048/2,low=(p[1]-floorY(house,room.floor)-Number(item.sizeMeters?.[1]||.8)/2)/.3048,high=low+Number(item.sizeMeters?.[1]||.8)/.3048;
  if(along+half>shape.center-shape.width/2&&along-half<shape.center+shape.width/2&&high>shape.low&&low<shape.high)warnings.push({code:'PORTRAIT_BLOCKS_OPENING',objectId:item.id,detail:op.id});
 }}}
 return warnings;
}
export function inspectMaterials(group){
 const materials=new Set(),textures=new Set();let meshes=0,triangles=0;
 group.traverse(o=>{if(!o.isMesh)return;meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position?.count||0)/3*(o.isInstancedMesh?o.count:1);for(const m of [].concat(o.material)){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});
 const undecoded=[...textures].filter(t=>!(t.image?.width>0&&t.image?.height>0));
 return {entries:[...materials].map(m=>({name:m.name||'(unnamed)',texture:m.map?`${m.map.image?.width||0}×${m.map.image?.height||0}`:'solid color',roughness:m.roughness,metalness:m.metalness})),meshes,materials:materials.size,textures:textures.size,undecoded:undecoded.length,triangles:Math.round(triangles),textureBytes:[...textures].reduce((n,t)=>n+(t.image?.width||0)*(t.image?.height||0)*4*4/3,0)};
}

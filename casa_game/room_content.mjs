import {stableRoomHash as hash} from './room_profiles.mjs';
import {legacyVignette} from './room_legacy_vignettes.mjs';
import {dressRoom} from './room_opulence.mjs';
import {wallMount} from './wall_mount.mjs';
import {ROOM_PROFILES,roomIdentity,furnishingTarget,resolveRoomProfile} from './room_profiles.mjs';
import {createRoomComponentSession} from './room_components.mjs';
export {ROOM_PROFILES,roomIdentity,furnishingTarget} from './room_profiles.mjs';
const FT=.3048;

export function planRoomContents(rooms,decoration,{elevation=f=>0,detail,...limits}={}){
 const usage={primitives:0,triangles:0,geometryBytes:0};return rooms.map(room=>{const id=room.id,b=room.boundsFeet||room,x=+b.x*FT,z=+b.y*FT,w=+b.l*FT,d=+b.w*FT,h=+b.h*FT,y=elevation(room.floor),identity=roomIdentity(room),profile=resolveRoomProfile(room,{detail}),seed=hash(id),primitives=[],ornaments=[],occupied=[],notes=[];
 const components=createRoomComponentSession(room,{profile,limits,roomCount:rooms.length,usage,primitives,occupied}),add=components.emit;
 components.track(ornaments);
 for(const a of decoration.artwork.filter(a=>a.roomId===id)){const wall=a.normal[0]>0?'left':a.normal[0]<0?'right':a.normal[2]>0?'top':'bottom';occupied.push({wall,center:(wall==='left'||wall==='right'?a.positionMeters[2]-z:a.positionMeters[0]-x),width:a.sizeMeters[0]+.14});}
 if(!['circulation','laboratory','conservatory','crypt'].includes(identity)&&w>2.2&&d>2.2&&seed%3!==0){components.run('woven-rug',()=>{const rw=Math.min(3.2,w*.42),rd=Math.min(2.4,d*.40);if(add([x+w/2,y+.009,z+d/2],[rw,.012,rd],6)){for(const side of [-1,1]){add([x+w/2+side*(rw/2-.045),y+.017,z+d/2],[.035,.006,rd-.04],8);add([x+w/2,y+.017,z+d/2+side*(rd/2-.045)],[rw-.04,.006,.035],8);}ornaments.push({id:'ornament:'+id+':rug',type:'woven-rug',positionMeters:[x+w/2,y+.009,z+d/2],width:rw,height:.012});}},{surface:'floor-center-base'});}
 for(const [i,o]of(room.openings||[]).filter(o=>o.type==='window').slice(0,3).entries()){components.run('window-valance',()=>{const vertical=o.wall==='left'||o.wall==='right',span=vertical?d:w,at=Math.max(0,Math.min(1,Number(o.pos??.5)))*span,width=Math.min(Number(o.clearWidthMeters||1.4),span-.3),py=Math.min(h-.25,2.55);if(width<=.3||py<2)return;const px=vertical?(o.wall==='left'?x+.07:x+w-.07):x+at,pz=vertical?z+at:(o.wall==='top'?z+.07:z+d-.07);add([px,y+py,pz],vertical?[.04,.15,width]:[width,.15,.04],6);ornaments.push({id:'ornament:'+id+':valance:'+i,type:'window-valance',positionMeters:[px,y+py,pz],width,height:.15});},{key:i,surface:'window-valance:'+i});}
 const furniture=decoration.furniture.filter(f=>String(f.roomId)===String(id));
 const vignette=legacyVignette(room,{identity,y,furniture,occupied,add,components,profile});ornaments.push(...vignette.ornaments);
 const luxury=dressRoom(room,{identity,y,furniture,occupied,add,components,profile});ornaments.push(...luxury.ornaments);
 // Low/narrow rooms get flush overhead trim, never furniture forced into their route.
 if(!ornaments.length&&w>.4&&d>.4&&h>1.9){components.run('ceiling-fallback',()=>{const size=Math.min(.5,w*.4,d*.4),before=primitives.length;add([x+w/2,y+h-.035,z+d/2],[size,.025,size],8);add([x+w/2,y+h-.052,z+d/2],[size*.65,.016,size*.65],3);if(primitives.length>before)ornaments.push({id:'ornament:'+id+':ceiling',type:'ceiling-medallion',positionMeters:[x+w/2,y+h-.035,z+d/2],width:size,height:.03});},{surface:'ceiling-center'});}

 if(components.omitted.some(o=>o.reason.startsWith('BUDGET')))notes.push('ROOM_CONTENT_BUDGET_REACHED');return {componentReport:components.report(),edition:luxury.edition,variant:luxury.variant,lighting:luxury.lights,storyArrangements:vignette.arrangements||[],storyDensity:vignette.density,roomId:id,floor:room.floor,identity,label:profile.label,targetFurniture:furnishingTarget(room),furnitureIds:furniture.map(f=>f.id),ornaments,primitives,story:{title:vignette.story?.title||profile.scene,text:vignette.story?.text||(!furniture.length&&identity!=='circulation'?'A carefully preserved wall display occupies this small room. Its worn details suggest someone returned to tend it, even after the rest of the house fell silent.':profile.text)},reaction:{kind:profile.reaction,positionMeters:vignette.ornaments[0]?.positionMeters||ornaments[0]?.positionMeters||null},discovery:null,notes};
 });
}
export function bindRoomDiscoveries(contents,playability){for(const c of contents){const r=playability?.rooms?.find(r=>r.roomId===c.roomId),candidates=(playability?.routes||[]).filter(r=>r.roomId===c.roomId).flatMap(r=>r.waypointsMeters||[]);if(r?.reachable&&r.standingPointMeters){candidates.push(r.standingPointMeters);const target=c.reaction.positionMeters||r.standingPointMeters;const p=candidates.sort((a,b)=>Math.hypot(a[0]-target[0],a[2]-target[2])-Math.hypot(b[0]-target[0],b[2]-target[2]))[0];c.discovery={id:'room:'+c.roomId,approachMeters:[...p],optional:true,requiredForQuest:false};}else c.notes.push('ROOM_DISCOVERY_NO_VALIDATED_APPROACH');}return contents;}

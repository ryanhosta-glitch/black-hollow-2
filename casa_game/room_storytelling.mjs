import {STORY_OBJECTS,storyObjectParts} from './room_story_objects.mjs';
import {furnitureSurface} from './furniture_surfaces.mjs';
import {architecturalShapes} from './component_shapes.mjs';
import {resolveRoomProfile,stableRoomHash} from './room_profiles.mjs';
import {wallMount} from './wall_mount.mjs';
import {ROOM_MATERIALS as M} from './room_materials.mjs';
export const STORY_COMPOSITIONS=Object.freeze({
 library:{supports:['writing_desk','console','side_table'],primary:['brass-globe','open-atlas','letter-quill'],secondary:['observation-book','pocket-watch']},
 laboratory:{supports:['laboratory_bench','writing_desk','console'],primary:['microscope','specimen-bottles','observation-book'],secondary:['specimen-bottles','letter-quill']},
 bedroom:{supports:['writing_desk','console','side_table','bed'],primary:['jewel-letter','pocket-watch'],secondary:['open-luggage','folded-garment']},
 nursery:{supports:['bed','console','side_table'],primary:['toy-theatre','picture-book'],secondary:['wooden-toys','abandoned-glove']},
 dining:{supports:['banquet_ensemble','supper_table','dining_table','console'],primary:['serving-dish','tea-service','place-card'],secondary:['calling-card','abandoned-glove']},
 conservatory:{supports:['writing_desk','console','side_table'],primary:['botanical-bell','specimen-book','seed-packets'],secondary:['garden-snips','seed-packets']},
 crypt:{supports:['sarcophagus','console','side_table'],primary:['memorial-urn','offering','unfinished-plaque'],secondary:['unfinished-plaque','letter-quill']},
 gallery:{supports:['console','writing_desk','side_table'],primary:['miniature-portrait','empty-frame','miniature-chair'],secondary:['observation-book','pocket-watch']},
 ballroom:{supports:['console','writing_desk','side_table'],primary:['gramophone','dance-card','abandoned-glove'],secondary:['dance-card','pocket-watch']},
 parlor:{supports:['writing_desk','console','side_table'],primary:['tea-service','calling-card','letter-quill'],secondary:['pocket-watch','abandoned-glove']},
 circulation:{supports:[],primary:[],secondary:[]}
});
for(const config of Object.values(STORY_COMPOSITIONS)){for(const v of Object.values(config))Object.freeze(v);Object.freeze(config);}
const FT=.3048,MIN_SCALE=.72;

/** One curated composition per claimed surface. All offsets remain furniture-local until emission. */
export function composeStoryRoom(room,{identity,y=0,furniture=[],occupied=[],add,components=null,story=null,profile=resolveRoomProfile(room)}){
 const b=room.boundsFeet||room,x=+b.x*FT,z=+b.y*FT,w=+b.l*FT,d=+b.w*FT,h=+b.h*FT,config=STORY_COMPOSITIONS[identity],ornaments=[],arrangements=[],omissions=[];
 components?.track(ornaments,arrangements,occupied);
 const policy=room.forgeDecoration||room.source?.forgeDecoration||{},disabled=policy.storytelling===false||policy.storytelling?.enabled===false||policy.components?.['story-vignette']===false||policy.components?.['story-vignette']?.enabled===false;
 if(disabled)return {ornaments,arrangements,story:null,density:{edition:'environmental-story-1',area:w*d,arrangements:0,objects:0,omissions:[{reason:'AUTHORED_STORY_POLICY'}]}};
 const run=(id,key,fn,surface)=>components?components.run(id,fn,{key,surface}):fn();
 const seed=stableRoomHash(String(room.id)),stair=room.forgeStair||room.embeddedStair||room.stairs?.length||/stair|elevator/i.test([room.name,room.type].join(' '));
 const supports=furniture.map(f=>({item:f,surface:furnitureSurface(f)})).filter(v=>v.surface&&config.supports.includes(v.item.type)).sort((a,b)=>Number(b.item.authored)-Number(a.item.authored)||config.supports.indexOf(a.item.type)-config.supports.indexOf(b.item.type)||String(a.item.id).localeCompare(String(b.item.id)));
 for(const f of furniture)if(config.supports.includes(f.type)&&!furnitureSurface(f))omissions.push({supportId:f.id,reason:'AUTHORED_SURFACE_PROTECTED'});
 function arrangement(surface,types,key,compact=false,wall=null){
  const long=surface.depth>surface.width*1.8,availableW=(long?surface.depth:surface.width)-.025,availableD=(long?surface.width:surface.depth)-.025,chosen=types.slice(0,compact?2:4).map((type,index)=>({type,index,model:storyObjectParts(type,{compact,variant:(seed+index)%3})}));
  if(!chosen.length)return false;
  const dimensions=()=>({width:chosen.reduce((n,o)=>n+o.model.bounds.max[0]-o.model.bounds.min[0],0)+.026*(chosen.length-1),depth:Math.max(...chosen.map(o=>o.model.bounds.max[2]-o.model.bounds.min[2]))});
  let size=dimensions(),scale=Math.min(1,availableW/size.width,availableD/size.depth);
  while(chosen.length>1&&(scale<MIN_SCALE||chosen.reduce((n,o)=>n+o.model.triangles,0)>(compact?1000:2400))){const removed=chosen.pop();omissions.push({key,object:removed.type,reason:'LEGIBILITY_OR_DENSITY_LIMIT'});size=dimensions();scale=Math.min(1,availableW/size.width,availableD/size.depth);}
  if(scale<MIN_SCALE){omissions.push({key,reason:'NO_LEGIBLE_SUPPORT_REGION'});return false;}
  const a=surface.rotationY+(long?Math.PI/2:0),cs=Math.cos(a),sn=Math.sin(a),fa=surface.rotationY,fx=Math.cos(fa),fz=Math.sin(fa),origin=[surface.positionMeters[0]+surface.u*fx+surface.v*fz,surface.positionMeters[1]+surface.top,surface.positionMeters[2]-surface.u*fz+surface.v*fx],world=(p,u)=>[origin[0]+(p[0]+u)*scale*cs+p[2]*scale*sn,origin[1]+p[1]*scale,origin[2]-(p[0]+u)*scale*sn+p[2]*scale*cs],g=architecturalShapes(add),objects=[];
  let cursor=-size.width/2;
  for(const object of chosen){const bw=object.model.bounds.max[0]-object.model.bounds.min[0],at=cursor+bw/2;cursor+=bw+.026;const points=[];
   for(const part of object.model.parts)for(const t of part.triangles){const triangle=t.map(p=>world(p,at));points.push(...triangle);g.triangle(...triangle,part.mat);}
   const bounds={min:[0,1,2].map(k=>Math.min(...points.map(p=>p[k]))),max:[0,1,2].map(k=>Math.max(...points.map(p=>p[k])))};
   const local=points.map(p=>{const dx=p[0]-surface.positionMeters[0],dz=p[2]-surface.positionMeters[2];return[dx*fx-dz*fz,dx*fz+dz*fx];}),supportBounds={minX:Math.min(...local.map(p=>p[0])),maxX:Math.max(...local.map(p=>p[0])),minZ:Math.min(...local.map(p=>p[1])),maxZ:Math.max(...local.map(p=>p[1]))};
   objects.push({supportBounds,id:`story:${room.id}:${key}:${object.index}`,component:object.type,family:STORY_OBJECTS[object.type].family,label:STORY_OBJECTS[object.type].label,bounds,positionMeters:world([0,0,0],at),scale,interactive:false,questBinding:null,requiredForQuest:false});
  }
  if(!g.flush())return false;
  const record={id:`story:${room.id}:${key}`,identity,supportId:surface.id,supportKind:surface.kind,surface:{...surface},positionMeters:origin,rotationY:a,compact,objects,...(wall?{wall}:{})};arrangements.push(record);
  ornaments.push({id:key==='primary'?'legacy:'+room.id:'story:'+room.id+':'+key,type:key==='primary'?'victorian-story-vignette':'curated-story-accessories',positionMeters:origin,width:size.width*scale,height:Math.max(...objects.map(o=>o.bounds.max[1]-origin[1])),storyTitle:story?.[0]||profile.scene,...(wall?{wall}:{})});
  return true;
 }
 function wallCase(){
  if(stair||identity==='circulation'||h<2.91)return false;
  const mount=wallMount(room,{width:.94,height:.58,y:Math.min(2.48,h-.17-.29),inset:.025,occupied});if(!mount||mount.position[1]-.29<2.18)return false;
  const a=mount.rotationY,co=Math.cos(a),si=Math.sin(a),point=(u,v,t)=>[mount.position[0]+u*co+t*si,y+mount.position[1]+v,mount.position[2]-u*si+t*co],g=architecturalShapes(add);
  // Closed board and frame are the actual support; no unsupported objects in empty air.
  for(const sign of [-1,1])g.box(point(sign*.445,0,.025),Math.abs(si)>.5?[.04,.58,.04]:[.04,.58,.04],M.wood);
  const board=(v,width,height,depth)=>g.box(point(0,v,.17),Math.abs(si)>.5?[depth,height,width]:[width,height,depth],M.wood);
  board(-.27,.94,.04,.30);board(.27,.94,.04,.30);if(!g.flush())return false;
  const surface={id:'wall-case:'+room.id,kind:'wall-case',positionMeters:[mount.position[0],y,mount.position[2]],rotationY:a,u:0,v:.17,top:mount.position[1]-.25,width:.80,depth:.24};
  if(!arrangement(surface,config.primary,'primary',profile.detailLevel===0,mount.wall))return false;
  occupied.push({wall:mount.wall,center:mount.wall==='left'||mount.wall==='right'?mount.position[2]-z:mount.position[0]-x,width:1.04});return true;
 }
 function wallTrace(){
  if(h<1.5||Math.min(w,d)<.45)return false;
  const width=Math.min(.68,Math.max(.25,Math.min(w,d)-.32)),height=.36,mount=wallMount(room,{width,height,y:Math.min(1.67,h-.20-height/2),inset:.025,occupied});if(!mount)return false;
  const a=mount.rotationY,c=Math.cos(a),s=Math.sin(a),point=(u,v,t)=>[mount.position[0]+u*c+t*s,y+mount.position[1]+v,mount.position[2]-u*s+t*c],g=architecturalShapes(add);
  const plaque=(u,v,t,sw,sh,sd,mat)=>g.box(point(u,v,t),Math.abs(s)>.5?[sd,sh,sw]:[sw,sh,sd],mat);
  plaque(0,0,.006,width,height,.012,M.wood);plaque(-width*.14,0,.014,width*.46,height*.76,.004,M.ivory);
  for(let k=0;k<3;k++)plaque(-width*.14,(k-1)*.05,.018,width*(k===2?.18:.32),.006,.002,M.ebony);
  // Deliberate missing hooks/marks, not collectible keys or required objectives.
  for(let k=0;k<2;k++)plaque(width*.22,(k-.5)*.10,.02,.055,.025,.006,M.metal);
  if(!g.flush())return false;
  const p=point(0,0,.02);ornaments.push({id:'story:'+room.id+':trace',type:'story-wall-trace',wall:mount.wall,positionMeters:p,width,height,storyTitle:story?.[0]||profile.scene});arrangements.push({id:'story:'+room.id+':trace',identity,supportId:'wall:'+mount.wall,supportKind:'flush-wall',positionMeters:p,rotationY:a,objects:[{id:'story:'+room.id+':marks',component:'wall-trace',family:'writing',label:'A deliberately incomplete framed record',positionMeters:p,interactive:false,questBinding:null,requiredForQuest:false}]});occupied.push({wall:mount.wall,center:mount.wall==='left'||mount.wall==='right'?mount.position[2]-z:mount.position[0]-x,width:width+.10});return true;
 }
 let primary=false;
 if(!stair&&supports.length){const support=supports[0].surface;primary=!!run('story-vignette','primary',()=>arrangement(support,config.primary,'primary',profile.detailLevel===0),'support:'+support.id);
  if(!primary){primary=!!run('story-vignette','primary-compact',()=>arrangement(support,config.primary,'primary',true),'support:'+support.id);if(primary)omissions.push({reason:'STORY_COMPOSITION_SIMPLIFIED'});}
 }
 if(!primary&&identity!=='circulation')primary=!!run('story-vignette','wall-case',wallCase,'story-case:'+room.id);
 if(!primary)run('story-wall-trace','trace',wallTrace,'story-trace:'+room.id);
 if(primary&&w*d>=22&&profile.detailLevel>=1){let secondary=supports.find(v=>v.surface.id!==arrangements[0]?.supportId);if(identity==='bedroom')secondary=supports.find(v=>v.item.type==='bed'&&v.surface.id!==arrangements[0]?.supportId)||secondary;
  if(secondary)run('story-accessories','secondary',()=>arrangement(secondary.surface,config.secondary,'secondary',true),'support:'+secondary.surface.id);
 }
 const count=arrangements.reduce((n,a)=>n+a.objects.length,0),text=story?{title:story[0],text:(arrangements[0]?.supportKind==='flush-wall'?'A framed record preserves the memory of this room. ':'')+story[1]+' This is an optional house memory; follow your field journal for the haunting.'}:{title:profile.scene,text:profile.text};
 return {ornaments,arrangements,story:ornaments.length?text:null,density:{edition:'environmental-story-1',area:w*d,arrangements:arrangements.length,objects:count,objectsPerSquareMeter:count/(w*d),omissions:[...omissions,...(components?.omitted||[]).filter(o=>['story-vignette','story-accessories','story-wall-trace'].includes(o.component))]}};
}

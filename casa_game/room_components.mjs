import {resolveRoomProfile,stableRoomHash} from './room_profiles.mjs';
import {ROOM_MATERIALS} from './room_materials.mjs';

/** Registry entries select existing generators, never a second copy of their models. */
const entries=[
 ['wall-display','wall-decoration','planRoomContents',0],['ceiling-fallback','architecture','planRoomContents',0],
 ['woven-rug','accessory','planRoomContents',0],['window-valance','wall-decoration','planRoomContents',0],
 ['support-objects','accessory','planRoomContents',0],['story-vignette','accessory','legacyVignette',0],
 ['artisan-fixtures','lighting','artisanDetails',0],['wall-mirror','wall-decoration','artisanDetails',1],
 ['floor-rosette','architecture','artisanDetails',2],['ceiling-chandelier','lighting','dressRoom',1],
 ['wall-panel','wall-decoration','dressRoom',1],['surface-tableau','accessory','dressRoom',1],
 ['corner-web','accessory','dressRoom',1],['plaster-ceiling','architecture','referenceRoomDetails',2],
 ['leaded-window','wall-decoration','referenceRoomDetails',2],['mansion-envelope','architecture','mansionEnvelope',0]
];
export const ROOM_COMPONENTS=Object.freeze(Object.fromEntries(entries.map(([id,category,generator,minDetail])=>[id,Object.freeze({id,category,generator,minDetail})])));
export const ROOM_CONTENT_LIMITS=Object.freeze({maxPrimitives:14000,maxRoomPrimitives:420,maxTriangles:200000,maxRoomTriangles:10000,maxGeometryBytes:24*1024*1024});
const materialIds=new Set(Object.values(ROOM_MATERIALS));
export const primitiveCost=p=>({primitives:1,triangles:p.triangles?.length??12,geometryBytes:(p.triangles?.length??12)*108});
const cap=(value,fallback)=>Number.isFinite(value)?Math.max(0,Math.min(fallback,Math.floor(value))):fallback;
export function componentEnabled(profile,room,id){
 const component=ROOM_COMPONENTS[id],value=(room.forgeDecoration||room.source?.forgeDecoration)?.components?.[id];
 return !!component&&profile.detailLevel>=component.minDetail&&value!==false&&value?.enabled!==false;
}

/** Atomic, measured component emission. Failed components leave no geometry, lights or surface claims. */
export function createRoomComponentSession(room,{profile=resolveRoomProfile(room),limits={},roomCount=1,usage={primitives:0,triangles:0,geometryBytes:0},primitives=[],occupied=[]}={}){
 const maxPrimitives=cap(limits.maxPrimitives,ROOM_CONTENT_LIMITS.maxPrimitives),maxTriangles=cap(limits.maxTriangles,ROOM_CONTENT_LIMITS.maxTriangles),maxGeometryBytes=cap(limits.maxGeometryBytes,ROOM_CONTENT_LIMITS.maxGeometryBytes);
 const budget={primitives:Math.min(cap(limits.maxRoomPrimitives,ROOM_CONTENT_LIMITS.maxRoomPrimitives),Math.floor(maxPrimitives/Math.max(1,roomCount))),triangles:Math.min(cap(limits.maxRoomTriangles,ROOM_CONTENT_LIMITS.maxRoomTriangles),Math.floor(maxTriangles/Math.max(1,roomCount))),geometryBytes:Math.floor(maxGeometryBytes/Math.max(1,roomCount))};
 const used={primitives:0,triangles:0,geometryBytes:0},omitted=[],emitted=[],claims=new Set(),completed=new Set(),arrays=new Set([primitives,occupied]),stack=[];
 const omit=(component,key,reason)=>{const item={component,key:String(key),reason};if(!omitted.some(o=>o.component===component&&o.key===item.key&&o.reason===reason))omitted.push(item);};
 for(const id of Object.keys((room.forgeDecoration||room.source?.forgeDecoration)?.components||{}))if(!ROOM_COMPONENTS[id])omit(id,'configuration','UNKNOWN_COMPONENT');
 const api={profile,budget,used,omitted,emitted,primitives,track:(...items)=>items.forEach(item=>arrays.add(item)),
  claim:surface=>{if(claims.has(surface))return false;claims.add(surface);return true;},
  emit(c,s,mat=8,rot=0,shape={}){
   const current=stack.at(-1),p={...shape,c,s,mat,rot,rotAxis:shape.rotAxis||'y'},cost=primitiveCost(p);
   let reason=null;
   if(!materialIds.has(mat))reason='INVALID_MATERIAL';
   else if(!Array.isArray(c)||c.length!==3||!c.every(Number.isFinite)||!Array.isArray(s)||s.length!==3||!s.every(n=>Number.isFinite(n)&&n>0)||!Number.isFinite(rot)||shape.triangles?.some(t=>t.length!==3||t.some(v=>v.length!==3||!v.every(Number.isFinite))))reason='INVALID_GEOMETRY';
   else for(const key of Object.keys(used))if(used[key]+cost[key]>budget[key]||usage[key]+cost[key]>({primitives:maxPrimitives,triangles:maxTriangles,geometryBytes:maxGeometryBytes})[key]){reason='BUDGET_'+key.toUpperCase();break;}
   if(reason){if(current)current.failure=reason;else omit('unscoped','emit',reason);return false;}
   primitives.push(p);for(const key of Object.keys(used)){used[key]+=cost[key];usage[key]+=cost[key];}return true;
  },
  run(id,build,{key='room',surface=null}={}){
   const token=id+':'+key;
   if(!componentEnabled(profile,room,id)){omit(id,key,ROOM_COMPONENTS[id]?'DETAIL_POLICY':'UNKNOWN_COMPONENT');return null;}
   if(completed.has(token)||(surface&&claims.has(surface))){omit(id,key,'SURFACE_ALREADY_DECORATED');return null;}
   if(Object.keys(used).some(k=>used[k]>=budget[k])){omit(id,key,'BUDGET_EXHAUSTED');return null;}
   const savedUsed={...used},savedArrays=new Map([...arrays].map(a=>[a,a.length])),savedClaims=new Set(claims),savedCompleted=new Set(completed),savedEmitted=emitted.length,current={failure:null};
   if(surface)claims.add(surface);stack.push(current);let result,error;
   try{result=build();}catch(e){current.failure='GENERATOR_ERROR';error=e;}finally{stack.pop();}
   if(current.failure){
    for(const [a,length]of savedArrays)a.length=length;
    for(const k of Object.keys(used)){usage[k]-=used[k]-savedUsed[k];used[k]=savedUsed[k];}
    claims.clear();for(const value of savedClaims)claims.add(value);completed.clear();for(const value of savedCompleted)completed.add(value);emitted.length=savedEmitted;
    omit(id,key,current.failure);if(error)throw error;return null;
   }
   if(used.primitives===savedUsed.primitives){for(const [a,length]of savedArrays)a.length=length;claims.clear();for(const value of savedClaims)claims.add(value);omit(id,key,'NO_SAFE_PLACEMENT');return null;}
   completed.add(token);emitted.push({component:id,key:String(key),...(surface?{surface}:{}),variant:stableRoomHash(String(room.id)+':'+token)%7,primitives:used.primitives-savedUsed.primitives,triangles:used.triangles-savedUsed.triangles});return result;
  },
  report:()=>({version:1,family:profile.family,identity:profile.identity,detail:profile.detail,variant:profile.variant,budget:{...budget},used:{...used},emitted:[...emitted],omitted:[...omitted],geometryByteEstimate:'unindexed-vertices-and-32-bit-indices; excludes shared textures'})
 };
 return api;
}

/** Direct generator callers retain their historical API; Forge supplies a measured session. */
export const withRoomComponent=(session,id,build,options)=>session?session.run(id,build,options):build();

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from 'three';
import {LIGHTING_PROFILES,LIGHTING_QUALITY,lightingQualityForDevice} from '../casa_game/lighting_profiles.mjs';
import {selectHouseLights,calibratedLight,applyHouseLightQuality} from '../casa_game/house_lighting.mjs';
import {roomLighting} from '../casa_game/room_lighting.mjs';
import {createRoomComponentSession} from '../casa_game/room_components.mjs';
import {planDecoration,decorationBoxes} from '../casa_admin/forge_decoration_plan.mjs';
import {createAtmosphere} from '../casa_game/atmosphere.mjs';
import {ROOM_PROFILES} from '../casa_game/room_profiles.mjs';
import {MAT,PALETTE,glb} from '../casa_admin/forge_glb.mjs';
import {compileFixture} from './helpers/compile-forge.mjs';
const room=(id='parlor',h=12)=>({id,name:id,type:'room',roomTheme:id,x:0,y:0,l:28,w:26,h,openings:[{id:'entry',wall:'top',type:'door',pos:.5},{wall:'bottom',type:'window',pos:.5}]}),source=r=>({name:'Lighting study',gameEntry:{roomId:r.id,openingId:'entry'},floors:[{name:'Main',kind:'main',rooms:[r]}]});
const build=r=>{const parts=[],session=createRoomComponentSession(r,{primitives:parts});const result=roomLighting(r,{y:0,add:session.emit,components:session});return {...result,parts,session};};

test('all eleven identities resolve deterministic distinct lighting compositions without duplicate ceiling sources',()=>{
 assert.deepEqual(new Set(Object.keys(LIGHTING_PROFILES)),new Set(Object.keys(ROOM_PROFILES)));
 for(const id of Object.keys(ROOM_PROFILES)){const s=source(room(id)),copy=structuredClone(s),a=planDecoration(s,{repair:true}),b=planDecoration(s,{repair:true});assert.deepEqual(a,b);assert.deepEqual(s,copy);assert.equal(a.lights.filter(l=>l.role==='key').length,1,id);assert.equal(new Set(a.lights.map(l=>l.id)).size,a.lights.length);assert.ok(a.lights.every(l=>l.photometricEdition==='house-light-2'));assert.ok(a.lights.some(l=>l.role==='moon'));assert.ok(a.roomContents[0].ornaments.some(o=>o.type===LIGHTING_PROFILES[id].fixture));}
 assert.notEqual(LIGHTING_PROFILES.laboratory.color,LIGHTING_PROFILES.parlor.color);assert.ok(LIGHTING_PROFILES.crypt.intensity<LIGHTING_PROFILES.ballroom.intensity);
});

test('all emitted fixture vertices are finite, material-valid and ceilings preserve headroom even in low rooms',()=>{
 for(const height of [8.4,9,12])for(const id of Object.keys(ROOM_PROFILES)){
  const r={...room(id,height),forgeDecoration:{components:{'artisan-fixtures':false,'task-lamp':false}}},{parts,session}=build(r);
  assert.ok(session.used.triangles<=10000);assert.ok(parts.length<=8);for(const p of parts){assert.ok(PALETTE[p.mat]);for(const v of p.triangles.flat()){assert.ok(v.every(Number.isFinite));assert.ok(v[1]>=2.18-.001,id+' headroom');assert.ok(v[1]<=height*.3048+.001,id+' ceiling');assert.ok(v[0]>=0&&v[0]<=28*.3048);assert.ok(v[2]>=0&&v[2]<=26*.3048);}}
 }
});

test('low ceilings, stair rooms and geometry limits omit housings without omitting navigable light',()=>{
 for(const r of [{...room(),h:7.5},{...room(),forgeStair:{}},{...room(),embeddedStair:{}},{...room(),stairs:[{}]},{...room(),name:'Stair landing'},{...room(),name:'Elevator landing'},{...room(),forgeDecoration:{components:{'ceiling-chandelier':false}}}]){const a=build(r);assert.ok(!a.ornaments.some(o=>o.type.includes('chandelier')));assert.ok(a.lights.some(l=>l.role==='key'&&l.sourceOnly));}
 const r=room(),session=createRoomComponentSession(r,{limits:{maxPrimitives:0}}),a=roomLighting(r,{add:session.emit,components:session});assert.equal(a.ornaments.length,0);assert.ok(a.lights.every(l=>l.sourceOnly));assert.ok(session.omitted.some(o=>o.reason.startsWith('BUDGET')));
 const p={furniture:[],roomContents:[],grounds:[],paths:[],artwork:[],lights:a.lights};assert.equal(decorationBoxes(p).length,0);
});

test('wall fixtures avoid authored openings and occupied portraits, and task lamps remain over real desks',()=>{
 for(const h of [8.6,9,12]){const a=build(room('library',h));assert.ok(a.ornaments.some(o=>o.wall),'safe low ceiling retains wall fixtures');for(const o of a.ornaments.filter(o=>o.wall))assert.ok(o.positionMeters[1]-o.height/2>=2.05);}
 const r=room('library'),occupied=[{wall:'right',center:13*.3048,width:3}];const parts=[],session=createRoomComponentSession(r,{primitives:parts,occupied}),d=planDecoration(source(r)),a=roomLighting(r,{y:0,occupied,furniture:d.furniture.map(f=>f.type==='writing_desk'?{...f,id:'chandelier'}:f),add:session.emit,components:session});
 for(const o of a.ornaments.filter(o=>o.wall)){assert.ok(o.positionMeters[1]-.23>=2.05);if(o.wall==='right')assert.ok(Math.abs(o.positionMeters[2]-13*.3048)>(3+.34)/2);}
 assert.equal(new Set(a.lights.map(l=>l.id)).size,a.lights.length);const task=a.lights.find(l=>l.role==='task');assert.ok(task);const desk=d.furniture.find(f=>f.type==='writing_desk'),[x,y,z]=task.positionMeters,dx=x-desk.positionMeters[0],dz=z-desk.positionMeters[2],angle=desk.rotationY;assert.ok(Math.abs(dx*Math.cos(angle)-dz*Math.sin(angle))<=.76);assert.ok(Math.abs(dx*Math.sin(angle)+dz*Math.cos(angle))<=.37);assert.ok(y>desk.positionMeters[1]+.785&&y<desk.positionMeters[1]+1.2);
});

test('dining chandelier follows its main arrangement without changing authored furnishing placement',()=>{
 const d=planDecoration(source(room('dining'))),table=d.furniture.find(f=>['banquet_ensemble','supper_table','dining_table'].includes(f.type)),key=d.lights.find(l=>l.role==='key');assert.ok(table);assert.equal(key.positionMeters[0],table.positionMeters[0]);assert.equal(key.positionMeters[2],table.positionMeters[2]);
});

test('selection is bounded and room-local, prioritizes task, portrait, filtered window and hearth contributions',()=>{
 for(const id of Object.keys(ROOM_PROFILES)){const d=planDecoration(source(room(id))),c=d.lights.find(l=>l.role==='key'),house={decoration:d};for(const [quality,n]of [['performance',2],['cinematic',3]]){const s=selectHouseLights(house,{roomId:id,floor:0,position:c.positionMeters,quality});assert.ok(s.length<=n);assert.ok(s.every(l=>l.roomId===id));assert.ok(s.some(l=>l.role==='key'));}}
 for(const [id,role]of [['library','task'],['gallery','portrait'],['parlor','hearth'],['conservatory','stained']]){const d=planDecoration(source(room(id))),candidate=d.lights.find(l=>l.role===role);assert.ok(candidate,id);const s=selectHouseLights({decoration:d},{roomId:id,floor:0,position:candidate.positionMeters});assert.ok(s.some(l=>l.role===role),id+' '+role);}
});

test('legacy photometry remains idempotent and new candela values are never amplified twice',()=>{
 for(const edition of [undefined,'house-light-1','house-light-2']){const input={id:'x:chandelier',intensity:12,rangeMeters:2.6,...(edition?{photometricEdition:edition}:{}),role:'key'},a=calibratedLight(input);assert.deepEqual(calibratedLight(a),a);assert.ok(a.intensity<=32);if(edition==='house-light-2')assert.equal(a.rangeMeters,2.6);}
});

test('quality presets cap active shader lights, dispose shadow maps on downgrade and preserve an ambient visibility floor',()=>{
 assert.equal(lightingQualityForDevice(), 'cinematic');for(const settings of [{softwareGPU:true},{width:640},{deviceMemory:4},{hardwareConcurrency:4}])assert.equal(lightingQualityForDevice(settings),'performance');
 const lights=Array.from({length:3},()=>new T.PointLight()),ambient=new T.HemisphereLight(),moon=new T.DirectionalLight(),specs=[{role:'key',roomLighting:LIGHTING_PROFILES.crypt}];let disposed=false;lights[0].shadow.map={dispose(){disposed=true;}};lights[0].castShadow=true;
 const report=applyHouseLightQuality({lights,ambient,moon},specs,{quality:'performance'});assert.equal(report.activeLightLimit,2);assert.equal(lights.filter(l=>l.visible).length,2);assert.ok(lights.every(l=>!l.castShadow));assert.ok(disposed);assert.equal(lights[0].shadow.map,null);assert.ok(ambient.intensity>=.55);
 applyHouseLightQuality({lights,ambient,moon},specs,{quality:'cinematic'});assert.equal(lights.filter(l=>l.visible).length,3);assert.equal(lights.filter(l=>l.castShadow).length,1);assert.ok(LIGHTING_QUALITY.cinematic.shadowMaps===1);
});

test('actual atmosphere retains a fixed pool across room changes and lighting stays steady with reduced motion',()=>{
 const scene=new T.Scene(),a=createAtmosphere(T,{scene,audio:{},reducedMotion:true,quality:'performance'}),refs=[...a.lighting.lights];assert.ok(refs[0].isSpotLight);assert.equal(refs[0].angle,1.35);
 for(const id of ['parlor','crypt','nursery']){const d=planDecoration(source(room(id))),position=[4,1.6,4],specs=selectHouseLights({decoration:d},{roomId:id,floor:0,position,quality:'performance'});a.configure({kind:'house',lightSpecs:specs,fireplaces:[[1,0,1]]});a.tick(0,.016,position);const flames=[];a.root.traverse(o=>{if(o.material?.emissiveIntensity>0)flames.push(o.material);});const glow=flames.map(m=>m.emissiveIntensity);assert.deepEqual(a.lighting.lights,refs);assert.equal(refs.filter(l=>l.visible).length,2);assert.equal(refs[0].target.position.y,refs[0].position.y-1);const intensity=refs.map(l=>l.intensity);for(let k=0;k<30;k++)a.tick(k*16,.016,position);assert.deepEqual(refs.map(l=>l.intensity),intensity);assert.deepEqual(flames.map(m=>m.emissiveIntensity),glow);assert.ok(a.lighting.ambient.intensity>=.55);}
 a.dispose();assert.ok(refs.every(l=>!l.parent));
});

test('fixture emitter materials append indices and retain modest exported emissive energy',()=>{
 assert.equal(MAT.gilt,36);assert.equal(MAT.warmEmitter,37);assert.equal(MAT.coolEmitter,38);const {parts}=build(room('laboratory')),bytes=glb(parts),doc=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+new DataView(bytes.buffer).getUint32(12,true))));assert.ok(doc.materials[MAT.coolEmitter].emissiveFactor.some(v=>v>0));assert.ok(doc.materials[MAT.warmEmitter].emissiveFactor.every(v=>v<=.7));assert.ok(doc.meshes[0].primitives.every(p=>doc.materials[p.material]));
});

test('combined two-story CASA carries all eleven lighting treatments with the existing loading contract',async()=>{
 const fixture=JSON.parse(await readFile(new URL('./fixtures/forge-luxury.json',import.meta.url))),{house}=await compileFixture(fixture),plan=await house.json(house.manifest.lightingPlan);assert.equal(plan.edition,'house-light-2');assert.equal(plan.baked,false);assert.equal(plan.limits.performance.activeLights,2);assert.ok(house.playability.staticRoutesVerified);for(const id of Object.keys(ROOM_PROFILES))assert.ok(plan.lights.some(l=>l.roomId===id&&l.role==='key'));const budget=await house.json(house.manifest.packageBudget);assert.ok(budget.components.withinLimits);
});

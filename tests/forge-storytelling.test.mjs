import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from 'three';
import {STORY_OBJECTS,STORY_OBJECT_LIMITS,storyObjectParts} from '../casa_game/room_story_objects.mjs';
import {STORY_COMPOSITIONS,composeStoryRoom} from '../casa_game/room_storytelling.mjs';
import {FURNITURE_SURFACES,furnitureSurface} from '../casa_game/furniture_surfaces.mjs';
import {ROOM_PROFILES} from '../casa_game/room_profiles.mjs';
import {ROOM_CONTENT_LIMITS,createRoomComponentSession} from '../casa_game/room_components.mjs';
import {planRoomContents,bindRoomDiscoveries} from '../casa_game/room_content.mjs';
import {roomFurnitureParts} from '../casa_admin/forge_room_furniture.mjs';
import {FORGE_COMPONENT_REGISTRY} from '../casa_admin/forge_components.mjs';
import {PALETTE} from '../casa_admin/forge_glb.mjs';
import {planDecoration} from '../casa_admin/forge_decoration_plan.mjs';
import {compileFixture} from './helpers/compile-forge.mjs';
const room=(id='library',size=28,h=12)=>({id,name:id,type:'room',roomTheme:id,x:0,y:0,l:size,w:size,h,openings:[{id:'entry',type:'door',wall:'top',pos:.5},{wall:'bottom',type:'window',pos:.5}]}),source=r=>({name:'Story QA',gameEntry:{roomId:r.id,openingId:'entry'},floors:[{name:'Main',kind:'main',rooms:[r]}]});
const overlap=(a,b)=>a.minX<b.maxX-1e-6&&a.maxX>b.minX+1e-6&&a.minZ<b.maxZ-1e-6&&a.maxZ>b.minZ+1e-6;

test('shared story library covers every requested family with bounded, grounded, finite material batches',()=>{
 const families=new Set();for(const [type,spec]of Object.entries(STORY_OBJECTS))for(const compact of [false,true])for(const variant of [0,1,2]){const p=storyObjectParts(type,{compact,variant});families.add(spec.family);assert.ok(p.triangles<=STORY_OBJECT_LIMITS.maxTriangles,type);assert.ok(p.parts.length<=9);assert.ok(Math.abs(p.bounds.min[1])<1e-10);assert.ok(p.bounds.max[1]>=.003-1e-9);for(const part of p.parts){assert.ok(PALETTE[part.mat]);assert.ok(part.triangles.flat().every(v=>v.every(Number.isFinite)));}assert.equal(typeof FORGE_COMPONENT_REGISTRY['story-object:'+type].generate,'function');}
 for(const family of ['writing','scientific','porcelain','pictures','heirlooms','nursery','memorial','botanical','music','personal'])assert.ok(families.has(family));
});

test('surface descriptors contact actual current furniture triangles rather than approximate catalog heights',()=>{
 for(const [type,s] of Object.entries(FURNITURE_SURFACES)){const parts=roomFurnitureParts({type,positionMeters:[0,0,0]}),material=new T.MeshBasicMaterial({side:T.DoubleSide}),mesh=new T.Group();for(const p of parts){const geometry=p.triangles?new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(p.triangles.flat(2),3)):new T.BoxGeometry(...p.s),part=new T.Mesh(geometry,material);if(!p.triangles){part.position.fromArray(p.c);part.rotation[p.rotAxis||'y']=p.rot||0;}mesh.add(part);}mesh.updateMatrixWorld(true);
  for(const u of [-.45,0,.45])for(const v of [-.45,0,.45]){const ray=new T.Raycaster(new T.Vector3(s.u+u*s.width,s.top+.001,s.v+v*s.depth),new T.Vector3(0,-1,0),0,.04),hit=ray.intersectObject(mesh,true)[0];assert.ok(hit,type+' supported point');assert.ok(Math.abs(hit.point.y-s.top)<1e-5,type+' real surface height '+hit.point.y+' / '+s.top);}
  mesh.traverse(o=>o.geometry?.dispose());material.dispose();
 }
});

test('all eleven room identities receive deterministic, narrative-specific, optional physical compositions',()=>{
 for(const identity of Object.keys(ROOM_PROFILES)){const input=source(room(identity)),copy=structuredClone(input),a=planDecoration(input,{repair:true}),b=planDecoration(input,{repair:true}),c=a.roomContents[0];assert.deepEqual(a,b);assert.deepEqual(input,copy);assert.ok(c.storyArrangements.length>=1,identity);assert.ok(c.storyDensity.objects>0);assert.ok(c.storyArrangements.length<=2);assert.ok(c.storyDensity.objects<=8);assert.equal(c.reaction.kind,ROOM_PROFILES[identity].reaction);assert.ok(c.storyArrangements.every(a=>a.identity===identity));for(const o of c.storyArrangements.flatMap(a=>a.objects)){assert.equal(o.interactive,false);assert.equal(o.questBinding,null);assert.equal(o.requiredForQuest,false);}}
 assert.ok(STORY_COMPOSITIONS.library.primary.includes('brass-globe'));assert.ok(STORY_COMPOSITIONS.ballroom.primary.includes('gramophone'));assert.ok(STORY_COMPOSITIONS.nursery.primary.includes('toy-theatre'));
});

test('real support contact, rotation, footprint containment and non-overlap hold for every narrative and support type',()=>{
 for(const [identity,config] of Object.entries(STORY_COMPOSITIONS).filter(([id])=>id!=='circulation'))for(const type of config.supports)for(const angle of [0,.7,Math.PI/2,Math.PI]){
  const r=room(identity,40),f={id:'authored',type,authored:true,positionMeters:[5,1,5],rotationY:angle},parts=[],session=createRoomComponentSession(r,{primitives:parts}),result=composeStoryRoom(r,{identity,y:1,furniture:[f],occupied:[],add:session.emit,components:session}),arr=result.arrangements.find(a=>a.supportId===f.id);assert.ok(arr,identity+' '+type);
  const surface=furnitureSurface(f);for(const o of arr.objects){assert.ok(Math.abs(o.bounds.min[1]-(f.positionMeters[1]+surface.top))<1e-8,identity+' grounded');assert.ok(o.supportBounds.minX>=surface.u-surface.width/2-1e-8);assert.ok(o.supportBounds.maxX<=surface.u+surface.width/2+1e-8);assert.ok(o.supportBounds.minZ>=surface.v-surface.depth/2-1e-8);assert.ok(o.supportBounds.maxZ<=surface.v+surface.depth/2+1e-8);}
  for(let i=0;i<arr.objects.length;i++)for(let j=i+1;j<arr.objects.length;j++)assert.ok(!overlap(arr.objects[i].supportBounds,arr.objects[j].supportBounds),'objects have deliberate spacing');
 }
});

test('room-size density stays curated, surfaces have one owner, and existing light/discovery support corners remain free',()=>{
 const small=planDecoration(source(room('library',12))),large=planDecoration(source(room('library',38)));assert.ok(small.roomContents[0].storyDensity.arrangements<=large.roomContents[0].storyDensity.arrangements);
 for(const id of Object.keys(ROOM_PROFILES)){const d=planDecoration(source(room(id,38))),c=d.roomContents[0],claims=c.componentReport.emitted.filter(e=>e.surface?.startsWith('support:'));assert.equal(new Set(claims.map(e=>e.surface)).size,claims.length);for(const arr of c.storyArrangements.filter(a=>a.supportKind==='writing_desk'))assert.ok(arr.objects.every(o=>o.supportBounds.maxX<=.25+1e-8),'task lamp corner is reserved');assert.ok(!c.ornaments.some(o=>o.type==='inhabited-tableau'));}
});

test('empty, narrow, low and removed-partition rooms receive wall-supported clues without blocked walking space',()=>{
 for(const id of Object.keys(ROOM_PROFILES))for(const [l,w,h]of [[28,24,12],[4,18,9],[8,8,7.5]]){const r={...room(id),l,w,h,floor:0},c=planRoomContents([r],{furniture:[],artwork:[]})[0];assert.ok(c.storyArrangements.length,`${id} ${l}/${w}/${h}`);for(const a of c.storyArrangements){assert.ok(['wall-case','flush-wall'].includes(a.supportKind));if(a.supportKind==='wall-case')assert.ok(a.surface.positionMeters[1]+a.surface.top>=2.18);else assert.ok(c.ornaments.some(o=>o.type==='story-wall-trace'));}assert.ok(c.componentReport.used.triangles<=10000);}
 const r={...room('circulation'),l:6,w:18,openings:[{type:'open',wall:'right',pos:.5,clearWidthMeters:18*.3048,forgeRemovedPartition:true}]},c=planRoomContents([{...r,floor:0}],{furniture:[],artwork:[]})[0];assert.ok(c.storyArrangements.every(a=>a.supportKind==='flush-wall'));assert.ok(!c.ornaments.some(o=>o.type==='story-wall-trace'&&o.wall==='right'));
});

test('tiny budgets retain a compact hero before small accessories, roll back failures and report omissions',()=>{
 const r=room(),f={id:'desk',type:'writing_desk',positionMeters:[4,0,4]},primitives=[],session=createRoomComponentSession(r,{primitives,limits:{maxTriangles:600}}),a=composeStoryRoom(r,{identity:'library',furniture:[f],occupied:[],add:session.emit,components:session});assert.ok(a.arrangements.some(a=>a.compact));assert.ok(a.arrangements[0].objects.some(o=>o.component==='brass-globe'));assert.ok(session.used.triangles<=600);assert.ok(a.density.omissions.some(o=>o.reason.startsWith('BUDGET')));assert.equal(a.arrangements.length,1);
 const zero=createRoomComponentSession(r,{limits:{maxPrimitives:0}}),none=composeStoryRoom(r,{identity:'library',furniture:[f],occupied:[],add:zero.emit,components:zero});assert.equal(none.arrangements.length,0);assert.equal(none.ornaments.length,0);assert.equal(zero.primitives.length,0);
});

test('authored surface protection and room/component opt-outs are honored without editing student records',()=>{
 const r=room('parlor'),f={id:'private-desk',type:'writing_desk',authored:true,positionMeters:[3,0,3],source:{allowAccessories:false}},before=structuredClone(f),p=[],session=createRoomComponentSession(r,{primitives:p}),a=composeStoryRoom(r,{identity:'parlor',furniture:[f],occupied:[],add:session.emit,components:session});assert.deepEqual(f,before);assert.ok(!a.arrangements.some(a=>a.supportId===f.id));assert.ok(a.density.omissions.some(o=>o.reason==='AUTHORED_SURFACE_PROTECTED'));
 for(const policy of [{storytelling:false},{components:{'story-vignette':false}}]){const r={...room(),forgeDecoration:policy},c=planDecoration(source(r)).roomContents[0];assert.equal(c.storyArrangements.length,0);const nested={...room(),source:{forgeDecoration:policy}},parts=[],session=createRoomComponentSession(nested,{primitives:parts}),result=composeStoryRoom(nested,{identity:'library',furniture:[],occupied:[],add:session.emit,components:session});assert.equal(result.arrangements.length,0);assert.equal(parts.length,0);}
});

test('support-free story cases and flush records avoid portraits, windows and every removed wall',()=>{
 const r={...room(),floor:0,openings:[{type:'open',wall:'right',pos:.5,clearWidthMeters:26*.3048},{type:'window',wall:'bottom',pos:.5}]},occupied=[{wall:'left',center:14*.3048,width:10}],parts=[],session=createRoomComponentSession(r,{primitives:parts,occupied}),a=composeStoryRoom(r,{identity:'library',furniture:[],occupied,add:session.emit,components:session});assert.ok(a.arrangements.length);assert.ok(a.ornaments.every(o=>!['right','left'].includes(o.wall)));for(const p of parts)assert.ok(p.triangles.flat().every(v=>v[0]>=-.06&&v[0]<=28*.3048+.06&&v[2]>=-.06&&v[2]<=28*.3048+.06));
});

test('shared object templates are immutable across repeated placements and cache eviction',()=>{
 const a=storyObjectParts('brass-globe'),value=a.parts[0].triangles[0][0][0];a.parts[0].triangles[0][0][0]=999;a.parts[0].s[0]=999;for(const id of Object.keys(STORY_OBJECTS))for(const variant of [0,1,2])storyObjectParts(id,{variant});const b=storyObjectParts('brass-globe');assert.equal(b.parts[0].triangles[0][0][0],value);assert.notEqual(b.parts[0].s[0],999);
});

test('showcase archive preserves existing optional discovery IDs, encounters, quest flags and reproducibility',async()=>{
 const fixture=JSON.parse(await readFile(new URL('./fixtures/forge-luxury.json',import.meta.url))),{house,bytes}=await compileFixture(fixture),again=await compileFixture(fixture);assert.deepEqual(bytes,again.bytes);const report=await house.json('qa/environmental_storytelling.json');assert.equal(report.newRequiredObjectives,0);assert.equal(report.rooms.length,11);assert.ok(house.playability.staticRoutesVerified);
 for(const c of house.decoration.roomContents){assert.equal(c.discovery.id,'room:'+c.roomId);assert.equal(c.discovery.optional,true);assert.equal(c.discovery.requiredForQuest,false);assert.ok(c.storyArrangements.length);assert.ok(c.storyArrangements.flatMap(a=>a.objects).every(o=>o.questBinding===null&&o.requiredForQuest===false));assert.ok(c.componentReport.used.triangles<=ROOM_CONTENT_LIMITS.maxRoomTriangles);}
 const budget=await house.json(house.manifest.packageBudget);assert.ok(budget.components.withinLimits);
});

test('irregular L-shaped layouts and heavily authored furnishings keep collision reservations and validated discoveries',async()=>{
 const a={...room('library',18),openings:[{id:'entry',wall:'top',type:'door',pos:.5},{wall:'right',type:'open',pos:.5,clearWidthMeters:18*.3048}],furniture:Array.from({length:7},(_,k)=>({id:'authored-'+k,type:k%2?'writing_desk':'bookcase',x:.13+(k%3)*.31,y:.18+Math.floor(k/3)*.29,rotation:k%2?90:0}))},b={...room('parlor',18),x:18},c={...room('conservatory',18),x:18,y:18},src={name:'Irregular story rooms',gameEntry:{roomId:a.id,openingId:'entry'},floors:[{name:'Main',kind:'main',rooms:[a,b,c]}]},snapshot=structuredClone(src),{house}=await compileFixture(src);assert.deepEqual(src,snapshot);assert.ok(house.playability.staticRoutesVerified);for(const content of house.decoration.roomContents){assert.ok(content.discovery.optional);assert.ok(content.storyDensity.objects<=8);}
});

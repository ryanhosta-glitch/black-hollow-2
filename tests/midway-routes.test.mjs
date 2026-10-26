import test from 'node:test';
import assert from 'node:assert/strict';
import {buildMidwayPlan,validateMidwayPlan,MIDWAY_VEHICLES} from '../casa_admin/forge_midway.mjs';
import {buildMidwayForArchive,midwaySourceFromArchive} from '../casa_admin/forge_midway_archive.mjs';
import {readMidwayCandidate,MIDWAY_EXPERIENCE} from '../casa_game/midway_contract.mjs';
import {compileFixture} from './helpers/compile-forge.mjs';
const room=(id,x=0,y=0,l=18,w=18)=>({id,name:id,roomTheme:id==='a'?'library':'parlor',x,y,l,w,h:10,openings:[]});
function fixture(){const a=room('a'),b=room('b',18),c=room('c',36);a.openings=[{id:'entry',type:'door',wall:'top',pos:.5},{type:'door',wall:'right',pos:.5,shared:'ab',clearWidthMeters:1.08}];b.openings=[{type:'door',wall:'left',pos:.5,shared:'ab',clearWidthMeters:1.08},{type:'arch',wall:'right',pos:.5,shared:'bc',clearWidthMeters:1.08}];c.openings=[{type:'arch',wall:'left',pos:.5,shared:'bc',clearWidthMeters:1.08}];return {name:'The Student Mansion',gameEntry:{roomId:'a',openingId:'entry'},floors:[{rooms:[a,b,c]}]};}
const empty={colliders:[]},access={type:'impossible-pocket-elevator',cabin:{model:'cabin.glb',widthMeters:2.4,depthMeters:2.4,heightMeters:2.8},stops:[],stairRoutes:[]};

test('ride graph follows real apertures, rounds clear corners, covers rooms and returns to its valid station',()=>{
 const source=fixture(),saved=structuredClone(source),plan=buildMidwayPlan(source,access,empty,{houseId:'student-42'});assert.equal(plan.validation.valid,true,JSON.stringify(plan));assert.deepEqual(source,saved);assert.equal(plan.vehicle.id,'phantom-carriage');assert.deepEqual(plan.coverage.visited,['a','b','c']);assert.equal(plan.graph.edges.filter(e=>e.kind==='door').length,2);assert.ok(plan.legs.some(l=>l.maneuver==='turnaround-loop'));assert.ok(plan.legs.some(l=>l.drive==='reverse'));assert.deepEqual(plan.boarding,plan.exit);assert.equal(plan.runtimeReady,false);assert.equal(plan.validation.physicsCertified,false);assert.equal(plan.validation.renderedRideVerified,false);assert.ok(plan.attraction.estimatedSeconds>10);assert.equal(source.floors[0].rooms.find(r=>r.id===plan.attraction.signatureRoomId).roomTheme,plan.attraction.signatureIdentity);assert.deepEqual(plan,buildMidwayPlan(source,access,empty,{houseId:'student-42'}));
});

test('walls, windows, mismatched portals and narrow doors never become ride connections',()=>{
 for(const mutate of [s=>s.floors[0].rooms[0].openings[1].type='window',s=>s.floors[0].rooms[0].openings[1].locked=true,s=>s.floors[0].rooms[1].openings[0].shared='wrong',s=>s.floors[0].rooms[1].openings[0].pos=.8,s=>s.floors[0].rooms[0].openings[1].clearWidthMeters=.4]){const s=fixture();mutate(s);const p=buildMidwayPlan(s,access,empty);assert.ok(p.validation.valid);assert.deepEqual(p.coverage.visited,['a']);assert.equal(p.status,'STATIC_CONTAINED_VALIDATED');assert.equal(p.graph.edges.some(e=>e.from==='a'||e.to==='a'),false);}
});

test('collision validation rejects tampered paths, aperture bypasses, discontinuities and forged profiles',()=>{
 const s=fixture(),p=buildMidwayPlan(s,access,empty),input={source:s,access,decoration:empty};assert.ok(validateMidwayPlan(p,input).valid);
 for(const mutate of [p=>p.legs.find(l=>l.kind==='room').points.splice(1,0,[-30,0,0]),p=>p.legs.find(l=>l.kind==='portal').shared='not-a-door',p=>p.legs[0].points[0][0]+=1,p=>p.vehicle.radius=.01,p=>p.exit.positionMeters[2]+=1,p=>p.legs[0].kind='teleport']){const bad=structuredClone(p);mutate(bad);assert.equal(validateMidwayPlan(bad,input).valid,false);}
 const collider={floor:0,minY:0,maxY:2,bounds:{minX:1,maxX:4,minZ:1,maxZ:4}},blocked={colliders:[collider]},obstructed=structuredClone(p);obstructed.legs.find(l=>l.kind==='room').points.splice(1,0,[2,0,2]);assert.equal(validateMidwayPlan(obstructed,{...input,decoration:blocked}).valid,false);
});

test('blocked approaches are excluded while tight dead ends use a stationary maneuver within the capsule',()=>{
 const s=fixture(),r=s.floors[0].rooms[2];r.l=3;r.w=3;r.y=7.5;r.openings[0].pos=.5;const p=buildMidwayPlan(s,access,empty);assert.ok(p.validation.valid,JSON.stringify(p));assert.ok(p.legs.some(l=>l.kind==='turn'&&l.roomId==='c'&&l.maneuver==='controlled-reverse'));assert.ok(!p.legs.some(l=>l.maneuver==='turnaround-loop'&&l.roomId==='c'));
 const blocked={colliders:[{floor:0,minY:0,maxY:2,bounds:{minX:5.1,maxX:5.9,minZ:2,maxZ:3.5}}]},b=buildMidwayPlan(fixture(),access,blocked);assert.ok(b.validation.valid);assert.deepEqual(b.coverage.visited,['a']);
});

test('multi-floor links use actual public lift stops and cannot interpolate through floors or unlock secrets',()=>{
 const s=fixture();s.floors[0].rooms=s.floors[0].rooms.slice(0,1);s.floors[0].rooms[0].openings=s.floors[0].rooms[0].openings.slice(0,1);s.floors.push({rooms:[room('upper')]},{rooms:[room('locked')]});const a=structuredClone(access);a.stops=[{id:'low',roomId:'a',floor:0,wall:'top',approachMeters:[2.7,0,.42]},{id:'high',roomId:'upper',floor:1,wall:'top',approachMeters:[2.7,3.048,.42]},{id:'secret',roomId:'locked',floor:2,wall:'top',approachMeters:[2.7,6.096,.42],requiresUnlock:'floor13'}];const p=buildMidwayPlan(s,a,empty);assert.ok(p.validation.valid,JSON.stringify(p));assert.deepEqual(new Set(p.coverage.visited),new Set(['a','upper']));assert.ok(p.coverage.excluded.includes('locked'));const t=p.legs.find(l=>l.kind==='transfer');assert.ok(t);assert.equal(t.interpolate,false);assert.equal(t.requiresFullOcclusion,true);const bad=structuredClone(p);bad.legs.find(l=>l.kind==='transfer').interpolate=true;assert.equal(validateMidwayPlan(bad,{source:s,access:a,decoration:empty}).valid,false);a.cabin.widthMeters=.2;const contained=buildMidwayPlan(s,a,empty);assert.deepEqual(contained.coverage.visited,['a']);
});

test('malformed sources and invalid collider data fail closed without mutating authored input',()=>{
 for(const source of [null,{}, {floors:[]}, {floors:[{rooms:[room('same'),room('same')]}]}, {floors:[{rooms:[{...room('bad'),l:NaN}]}]}, {floors:[{rooms:[room('a'),room('b')]}]}]){assert.equal(buildMidwayPlan(source,access,empty).status,'UNAVAILABLE');}
 const s=fixture();assert.equal(buildMidwayPlan(s,access,{colliders:[{bounds:{}}]}).status,'UNAVAILABLE');assert.equal(validateMidwayPlan(null,{source:s,access,decoration:empty}).valid,false);assert.ok(Object.isFrozen(MIDWAY_VEHICLES.carriage));
});

test('actual Forge archive contains an optional, deterministic route sidecar without altering the source',async()=>{
 const s=fixture(),snapshot=structuredClone(s),a=await compileFixture(s),b=await compileFixture(s);assert.deepEqual(s,snapshot);assert.deepEqual(a.bytes,b.bytes);assert.equal(a.house.manifest.casa.specVersion,'1.0');assert.equal(a.house.manifest.midwayPlan,'midway/plan.json');const p=await a.house.json(a.house.manifest.midwayPlan);assert.ok(p.validation.valid);assert.equal(p.runtimeReady,false);assert.ok(a.house.entries.has('qa/midway.json'));assert.deepEqual(await a.house.json(a.house.manifest.casa.source),s);const read=await readMidwayCandidate(a.house);assert.ok(read);read.legs.length=0;assert.ok((await readMidwayCandidate(a.house)).legs.length);assert.equal(await readMidwayCandidate({manifest:{}}),null);assert.equal(MIDWAY_EXPERIENCE.runtimeReady,true);assert.equal(await readMidwayCandidate({...a.house,json:async()=>({...p,legs:[{kind:'teleport',roomId:p.boarding.roomId,points:[p.boarding.positionMeters]}]})}),null);const legacy=buildMidwayForArchive(a.house);assert.ok(legacy.validation.valid);assert.equal(legacy.coverage.visited.length,p.coverage.visited.length);const wrong={...a.house,manifest:structuredClone(a.house.manifest)};wrong.manifest.floors[0].elevationMeters+=1;assert.throws(()=>midwaySourceFromArchive(wrong),/elevation/);
});

test('ride wall padding applies symmetrically and default walking clearance remains unchanged',async()=>{
 const {createClearanceWorld}=await import('../casa_admin/forge_playability.mjs'),s=fixture(),normal=createClearanceWorld(s,empty),ride=createClearanceWorld(s,empty,{radius:.24,height:1.75,wallPadding:.1}),extent=18*.3048;
 for(const p of [[.31,0,2],[extent-.31,0,2],[2,0,.31],[2,0,extent-.31]]){assert.ok(normal.canStand('a',p));assert.equal(ride.canStand('a',p),false);}
});

test('a constrained house chooses the safe spectral profile when it covers more actual rooms',()=>{
 const s=fixture();for(const r of s.floors[0].rooms)for(const o of r.openings)if(o.shared==='ab')o.clearWidthMeters=.6;const p=buildMidwayPlan(s,access,empty);assert.ok(p.validation.valid);assert.equal(p.vehicle.id,'spectral-carriage');assert.equal(p.coverage.visited.length,3);assert.ok(p.diagnostics.some(d=>d.code==='SPECTRAL_PROFILE_FOR_ACCESSIBLE_COVERAGE'));
});

test('continuous ride clearance cannot step over a thin collider or cut across its corner',async()=>{
 const {createClearanceWorld}=await import('../casa_admin/forge_playability.mjs'),s=fixture(),colliders=[{floor:0,minY:0,maxY:2,bounds:{minX:2.021,maxX:2.022,minZ:2.021,maxZ:2.022}}],world=createClearanceWorld(s,{colliders},{radius:.34,height:1.85,continuousCollision:true});assert.equal(world.segment('a',[1,0,2.0215],[3,0,2.0215]),false);assert.equal(world.canStand('a',[1.70,0,1.70]),false);assert.ok(world.segment('a',[1,0,1],[1.5,0,1]));
});

test('oversized inventories and tampered route point counts fail closed instead of bypassing budgets',()=>{
 const s=fixture(),p=buildMidwayPlan(s,access,empty),bad=structuredClone(p);bad.legs[0].points=Array.from({length:24001},()=>[...bad.boarding.positionMeters]);assert.equal(validateMidwayPlan(bad,{source:s,access,decoration:empty}).valid,false);assert.equal(buildMidwayPlan({floors:[{rooms:Array.from({length:513},(_,i)=>room('r'+i))}]},access,empty).status,'UNAVAILABLE');
});

import test from 'node:test';import assert from 'node:assert/strict';
import {rescueBlueprint} from '../casa_admin/forge_rescue.mjs';
import {compileFixture} from './helpers/compile-forge.mjs';
import {repairHouse} from './fixtures/repair-houses.mjs';
import {prepareCasa} from '../casa_admin/batch.mjs';
import {createClearanceWorld} from '../casa_admin/forge_playability.mjs';
for(let i=0;i<8;i++)test('damaged student blueprint '+i+' is repaired, rechecked, importable and publishable',async()=>{
 const source=repairHouse(i),before=JSON.stringify(source),{bytes,house}=await compileFixture(source),repaired=await house.json('repaired.haunt'),report=await house.json(house.manifest.studentReport),log=await house.json('qa/repairs.json');
 assert.equal(JSON.stringify(source),before);assert.deepEqual(await house.json('source.haunt'),source);assert.equal(report.publicationBlocked,false,JSON.stringify(report.blockers));assert.equal(house.playability.staticRoutesVerified,true,JSON.stringify(house.playability.issues));assert.ok(log.changes.length>0);assert.equal(log.unresolved.length,0);assert.ok(house.playability.rooms.every(r=>r.reachable));assert.equal(house.access.stops.length>0,true);assert.ok(house.access.stops.every(s=>house.playability.arrivalTests.find(t=>t.stopId===s.id)?.passed));assert.equal((await house.json('qa/reachability.json')).unreachable.length,0);
 const world=createClearanceWorld(repaired,house.decoration);for(const route of house.playability.routes)for(const p of route.waypointsMeters)assert.equal(world.canStand(route.roomId,p),true);
 for(const family of house.hauntingSites.families)assert.ok(family);assert.equal(house.hauntingSites.sites.length,4);assert.ok((await prepareCasa(new File([bytes],'repaired.casa'))).house.id);
});
test('rescue is deterministic and retains a clear distinction for unreadable or over-budget files',()=>{const s=repairHouse(2);assert.deepEqual(rescueBlueprint(s),rescueBlueprint(s));assert.throws(()=>rescueBlueprint({floors:[]}),/no floor/);assert.throws(()=>rescueBlueprint({floors:[{rooms:[]}]}),/no rooms/);assert.throws(()=>rescueBlueprint({floors:[{rooms:Array.from({length:513},()=>({}))}]}),/budget/);});

test('new connecting doors receive a final swing repair before publication',async()=>{
 const {adjacentDoorFixture}=await import('./fixtures/adjacent-doors.mjs'),source=adjacentDoorFixture(),{bytes,house}=await compileFixture(source),repaired=await house.json('repaired.haunt'),report=await house.json(house.manifest.studentReport),log=await house.json('qa/repairs.json');
 assert.equal(report.publicationBlocked,false,JSON.stringify(report.blockers));assert.equal(house.playability.staticRoutesVerified,true);assert.ok(house.playability.rooms.every(r=>r.reachable));assert.ok(!(await house.json('qa/building_envelope.json')).issues.some(i=>i.code==='ADJACENT_DOOR_SWING_OVERLAP'));
 const repair=log.changes.find(c=>c.code==='REPLACE_COLLIDING_DOOR_SWING'&&c.reason==='Final doorway swing clearance');assert.ok(repair);const ends=repaired.floors.flatMap(f=>f.rooms.flatMap(r=>r.openings.filter(o=>o.shared===repair.shared)));assert.equal(ends.length,2);assert.ok(ends.every(o=>o.type==='arch'));assert.ok((await house.json('navigation/collision.json')).doors.some(d=>d.sharedId===repair.shared&&d.kind==='arch'&&!d.physicalLeafCollisionRequired));assert.equal(repaired.gameEntry.openingId,'front');assert.ok(house.access.stops.every(s=>repaired.floors.flatMap(f=>f.rooms).find(r=>r.id===s.roomId).openings.some(o=>o.id===s.openingId&&o.forgeElevator===s.id)));
 assert.deepEqual(await house.json('source.haunt'),source);await prepareCasa(new File([bytes],'door-repaired.casa'));
});

test('consecutive crowded doors are recomputed and protected entry/elevator portals survive',async()=>{
 const {repairDoorSwings}=await import('../casa_admin/forge_door_clearance.mjs');
 const room={id:'crowded',l:12,w:12,openings:[.2,.3,.4].map((pos,i)=>({id:'d'+i,wall:'top',type:'door',pos}))};room.openings.push({id:'lift',wall:'top',type:'door',pos:.25,forgeElevator:'lift-stop'});const changes=[];repairDoorSwings([room],{entry:{roomId:'crowded',openingId:'d1'},changes});assert.deepEqual(room.openings.map(o=>o.id).sort(),['d1','lift']);assert.equal(changes.length,2);
});

import test from 'node:test';import assert from 'node:assert/strict';
import {planHouseAccess} from '../casa_admin/forge_access_plan.mjs';
import {straightStairParts} from '../casa_admin/forge_stairs.mjs';
import {sampleHouseSurface,stairHeight,stairRoomAt,stairResidentFloors,stairRoutes} from '../casa_game/stairs.mjs';
import {straightStairFixture} from './fixtures/straight-stairs.mjs';
import {compileFixture} from './helpers/compile-forge.mjs';
const plan=source=>planHouseAccess(source);
const route=p=>p.elevator.stairRoutes.find(s=>s.physicalTraversalEnabled);
test('explicit straight pairs compile using actual floor elevations without mutating source',()=>{
 for(const h of [8,10,12]){const source=straightStairFixture(h),before=JSON.stringify(source),p=plan(source),s=route(p);assert.ok(s,JSON.stringify(p.elevator.stairRoutes));assert.equal(s.upperY,h*.3048);assert.ok(s.riserMeters<=.19&&s.treadMeters>=.25);assert.equal(JSON.stringify(source),before);assert.equal(p.elevator.stairRoutes.length,1);const parts=straightStairParts(p.blueprint.floors[0].rooms[1],0);assert.ok(parts.length>s.treadCount);assert.ok(parts.every(p=>p.c.every(Number.isFinite)&&p.s.every(n=>n>0)));}
});
test('misalignment, headroom, blocked landings, unsupported stairs and locks fail closed',()=>{
 const cases=[['STAIR_VOLUME_OVERLAP',s=>s.floors[1].rooms.push({id:'overlap',name:'Overlapping ceiling',x:1,y:1,l:3,w:3,h:10,openings:[]})],['STAIR_PAIR_NOT_ALIGNED',s=>s.floors[1].rooms[1].x=1],['STAIR_HEADROOM_UNSAFE',s=>s.floors[0].rooms[0].h=12],['STAIR_LANDING_BLOCKED',s=>s.floors[0].rooms[1].openings[0].pos=.5],['STAIR_CONFIGURATION_UNSUPPORTED',s=>s.floors[0].rooms[1].embeddedStair={type:'spiral'}],['STAIR_LOCKED_DESTINATION',s=>s.floors[1].number=13],['STAIR_RUN_TOO_SHORT',s=>{for(const f of s.floors)f.rooms[1].w=10;for(const f of s.floors)f.rooms[1].openings=[];}]];
 for(const [reason,change]of cases){const s=straightStairFixture();change(s);const p=plan(s);assert.equal(route(p),undefined,reason);assert.ok(p.elevator.stairRoutes.some(r=>r.status===reason),JSON.stringify(p.elevator.stairRoutes));assert.ok(p.elevator.stairRoutes.every(r=>r.fallback==='elevator'));assert.ok(p.blueprint.floors.every(f=>f.rooms.every(r=>!r.forgeStair)));}
});
test('stair surface supports ascent/descent, blocks side climbs and oversized vertical changes',async()=>{
 const {house}=await compileFixture(straightStairFixture()),s=stairRoutes(house)[0];assert.ok(s);const lower=house.rooms.find(r=>r.id===s.roomId),x=(s.minX+s.maxX)/2;
 let previous=s.lowerY,room=lower;
 for(let z=s.minZ+.3;z<s.maxZ-.2;z+=.04){const y=sampleHouseSurface(house,room,x,z,previous);assert.notEqual(y,null);assert.ok(y>=previous&&y-previous<.191);room=stairRoomAt(house,room,x,y,z);previous=y;}
 assert.equal(room.id,s.upperRoomId);assert.equal(previous,s.upperY);
 for(let z=s.maxZ-.3;z>s.minZ+.2;z-=.04){const y=sampleHouseSurface(house,room,x,z,previous);assert.notEqual(y,null);assert.ok(y<=previous&&previous-y<.191);room=stairRoomAt(house,room,x,y,z);previous=y;}
 assert.equal(room.id,s.roomId);assert.equal(previous,s.lowerY);
 const mid=(s.runStart+s.runEnd)/2;assert.equal(sampleHouseSurface(house,lower,s.minX+.1,mid,stairHeight(s,mid)),null);assert.equal(sampleHouseSurface(house,lower,x,mid,0),null);
 assert.deepEqual(stairResidentFloors(house,0),[0,1]);assert.ok(!house.gameplay.slots.some(a=>[s.roomId,s.upperRoomId].includes(a.roomId)));
 assert.ok(house.playability.stairTests.every(t=>t.passed));
 house.access.stops.push({floor:1,requiresUnlock:'floor13'});assert.equal(sampleHouseSurface(house,lower,x,s.minZ+.3,0),null,'lock cannot be bypassed by a forged route');
});

test('fresh GLBs have supported treads, an open shaft, upper landing and overhead clearance',async()=>{
 const THREE=await import('three'),{house}=await compileFixture(straightStairFixture()),s=stairRoutes(house)[0];
 async function model(floor){const bytes=await house.read(house.manifest.floors[floor].model),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),jsonLength=view.getUint32(12,true),doc=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+jsonLength))),bin=28+jsonLength,group=new THREE.Group();
  const values=id=>{const a=doc.accessors[id],v=doc.bufferViews[a.bufferView];return new (a.componentType===5126?Float32Array:Uint32Array)(bytes.buffer,bytes.byteOffset+bin+(v.byteOffset||0)+(a.byteOffset||0),a.count*(a.type==='VEC3'?3:1));};
  for(const p of doc.meshes[0].primitives){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(values(p.attributes.POSITION),3));g.setIndex(new THREE.BufferAttribute(values(p.indices),1));group.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})));}group.updateMatrixWorld(true);return group;}
 const low=await model(0),high=await model(1),x=(s.minX+s.maxX)/2,hits=(g,y,z,dy,far)=>new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,dy,0),0,far).intersectObject(g,true);
 for(let i=0;i<s.treadCount;i++){const z=s.runStart+(i+.5)*s.treadMeters,y=stairHeight(s,z),hit=hits(low,y+.1,z,-1,.3)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-y)<1e-5,'visible tread agrees with compiled foot surface');assert.equal(hits(low,y+.2,z,1,1.8).length,0,'lower ceiling does not seal the flight');}
 assert.equal(hits(high,s.upperY+.2,(s.runStart+s.runEnd)/2,-1,.5).length,0,'upper slab does not cover shaft');
 assert.ok(hits(high,s.upperY+.2,(s.runEnd+s.maxZ)/2,-1,.5).some(h=>Math.abs(h.point.y-s.upperY)<1e-5),'upper landing supports feet');
 assert.ok(hits(high,s.upperY+1.8,(s.runEnd+s.maxZ)/2,1,2).length,'ceiling retained over upper room');
 for(const root of [low,high])root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});

test('streamer pins a pair only while requested and disposes the evicted floor',async()=>{
 const THREE=await import('three'),{createFloorStreamer}=await import('../casa_game/resources.mjs'),disposed=[];
 const house={manifest:{floors:[{model:'zero',elevationMeters:0},{model:'one',elevationMeters:3}]},decoration:{furniture:[]}};
 const assets={async glb(name){const group=new THREE.Group(),mesh=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial());mesh.geometry.addEventListener('dispose',()=>disposed.push(name));group.add(mesh);return group;}};
 const stream=createFloorStreamer(house,assets,THREE);stream.retain([0,1]);const groups=await Promise.all([stream.get(0),stream.get(1)]);assert.equal(stream.residentFloors,2);stream.retain([1]);assert.equal(stream.residentFloors,1);assert.deepEqual(disposed,['zero']);assert.equal(await stream.get(1),groups[1]);stream.clear();assert.deepEqual(disposed,['zero','one']);
});

test('malformed or mismatched runtime stair contracts remain disabled',async()=>{
 assert.deepEqual(stairRoutes({rooms:[],access:{}}),[]);
 const {house}=await compileFixture(straightStairFixture()),s=house.access.stairRoutes[0];
 for(const patch of [{treadCount:Infinity},{upperFloor:9},{upperY:s.upperY+1},{maxX:200},{treadMeters:.1},{roomId:'missing'},{runStart:s.minZ}]){house.access.stairRoutes=[{...s,...patch}];assert.equal(stairRoutes(house).length,0,JSON.stringify(patch));}
});

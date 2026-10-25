import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOM_FAMILIES,ROOM_PROFILES,resolveRoomProfile,roomIdentity} from '../casa_game/room_profiles.mjs';
import {ROOM_COMPONENTS,ROOM_CONTENT_LIMITS,createRoomComponentSession,primitiveCost} from '../casa_game/room_components.mjs';
import {FORGE_COMPONENT_REGISTRY,furnitureGeometry} from '../casa_admin/forge_components.mjs';
import {ROOM_FURNITURE,roomFurnitureParts} from '../casa_admin/forge_room_furniture.mjs';
import {planDecoration,decorationBoxes,portableDecorationPlan} from '../casa_admin/forge_decoration_plan.mjs';
import {planRoomContents} from '../casa_game/room_content.mjs';
import {planRoomThemes} from '../casa_admin/forge_room_themes.mjs';
import {MAT,PALETTE} from '../casa_admin/forge_glb.mjs';
import {roomFinish} from '../casa_admin/forge_finishes.mjs';
import {mansionEnvelope} from '../casa_admin/forge_envelope_finish.mjs';
import {auditRoomComponentBudget} from '../casa_admin/forge_package_budget.mjs';
import {compileFixture} from './helpers/compile-forge.mjs';

const room=(identity='parlor',id='stable-room')=>({id,name:identity,roomTheme:identity,x:0,y:0,l:30,w:26,h:12,openings:[{id:'entry',type:'door',wall:'top',pos:.5},{id:'glass',type:'window',wall:'left',pos:.5}]});
const source=r=>({name:'Shared Components',gameEntry:{roomId:r.id,openingId:'entry'},floors:[{name:'Main',kind:'main',rooms:[r]}]});
const box=(session,mat=8)=>session.emit([1,2,3],[.1,.2,.3],mat);

test('all eleven identities inherit exactly one family and share registered furniture and materials',()=>{
 assert.equal(Object.keys(ROOM_PROFILES).length,11);
 assert.equal(Object.keys(ROOM_FAMILIES).length,6);
 assert.deepEqual(new Set(Object.values(FORGE_COMPONENT_REGISTRY).map(c=>c.category)),new Set(['architecture','wall-decoration','accessory','lighting','furniture','material']));
 for(const [identity,profile]of Object.entries(ROOM_PROFILES)){
  assert.equal(roomIdentity(room(identity)),identity);
  assert.ok(ROOM_FAMILIES[profile.family].members.includes(identity));
  assert.equal(Object.values(ROOM_FAMILIES).filter(f=>f.members.includes(identity)).length,1);
  for(const type of profile.furniture)assert.ok(FORGE_COMPONENT_REGISTRY['furniture:'+type],type);
  for(const field of ['floor','wall','ceiling','panel','trim'])assert.ok(PALETTE[roomFinish(room(identity))[field]]);
 }
 assert.ok(Object.isFrozen(ROOM_PROFILES.library.furniture));
});

test('identity overrides specialize inherited family defaults without changing siblings',()=>{
 assert.equal(ROOM_FAMILIES.formal.wallDrapery,true);
 assert.equal(resolveRoomProfile(room('dining')).wallDrapery,false);
 assert.equal(resolveRoomProfile(room('parlor')).wallDrapery,true);
 assert.equal(resolveRoomProfile(room('laboratory')).ironFixtures,true);
 assert.equal(resolveRoomProfile(room('library')).ironFixtures,false);
 assert.equal(resolveRoomProfile(room('laboratory')).finishTheme,'laboratory');
 assert.equal(resolveRoomProfile(room('nursery')).finishTheme,'bedroom');
 assert.equal(roomIdentity({...room('bedroom'),forgeStair:{}}),'circulation');
});

test('furniture registry delegates to existing geometry instead of copying or layering models',()=>{
 for(const type of Object.keys(ROOM_FURNITURE)){
  const item={type,positionMeters:[3,2,4],rotationY:Math.PI/2};
  assert.equal(FORGE_COMPONENT_REGISTRY['furniture:'+type].generate,roomFurnitureParts);
  assert.deepEqual(furnitureGeometry(item),roomFurnitureParts(item));
 }
 assert.equal(FORGE_COMPONENT_REGISTRY['material-treatment'].generate,roomFinish);
 assert.equal(FORGE_COMPONENT_REGISTRY['mansion-envelope'].generate,mansionEnvelope);
});

test('stable identities produce identical content, including when room order changes',()=>{
 const rooms=['library','nursery','crypt','parlor'].map((id,i)=>({...room(id,id),x:i*40,floor:0})),empty={furniture:[],artwork:[]};
 const a=planRoomContents(rooms,empty),b=planRoomContents(structuredClone(rooms),empty),c=planRoomContents([...rooms].reverse(),empty);
 assert.deepEqual(a,b);
 for(const content of a)assert.deepEqual(content,c.find(c=>c.roomId===content.roomId));
 assert.notEqual(resolveRoomProfile(room('parlor','a')).variant,resolveRoomProfile(room('parlor','b')).variant);
});

test('explicit identities, authored furniture, finishes and blueprint geometry stay authoritative',()=>{
 const r={...room('library'),name:'A student named this room',flooring:'checker',finishes:{wall:'navyDamask',trim:MAT.ivory},furniture:[{id:'student-desk',type:'writing_desk',x:.15,y:.2}]},s=source(r),before=structuredClone(s);
 const themes=planRoomThemes(s),plan=planDecoration(themes.blueprint),desk=plan.furniture.find(f=>f.id==='student-desk');
 assert.deepEqual(s,before);
 assert.equal(themes.report.assignments[0].reason,'authored-theme');
 assert.equal(themes.report.assignments[0].family,'scholarly');
 assert.equal(plan.roomContents[0].identity,'library');
 assert.equal(desk.authored,true);assert.deepEqual(desk.source,r.furniture[0]);
 assert.ok(!plan.changes.some(c=>c.code.startsWith('REPLACE')));
 assert.equal(roomFinish(r).wall,MAT.navyDamask);assert.equal(roomFinish(r).floor,MAT.checker);assert.equal(roomFinish(r).trim,MAT.ivory);
 const unsupported=source({...r,finishes:{wall:'private-student-image.png'}}),snapshot=structuredClone(unsupported),reported=planDecoration(unsupported);
 assert.deepEqual(unsupported,snapshot);
 assert.ok(reported.issues.some(i=>i.code==='AUTHORED_FINISH_UNSUPPORTED'&&i.sourcePreserved));
});

test('detail levels and per-room component overrides select existing generators deterministically',()=>{
 const s=source(room()),essential=planDecoration(s,{detail:'essential'}),standard=planDecoration(s,{detail:'standard'}),luxury=planDecoration(s);
 assert.ok(essential.roomContents[0].primitives.length<standard.roomContents[0].primitives.length);
 assert.ok(standard.roomContents[0].primitives.length<luxury.roomContents[0].primitives.length);
 const authored=source({...room(),forgeDecoration:{detail:'essential',components:{'wall-display':false,'window-valance':{enabled:false},'not-a-component':true}}}),snapshot=structuredClone(authored),c=planDecoration(authored).roomContents[0];
 assert.deepEqual(authored,snapshot);assert.equal(c.componentReport.detail,'essential');
 assert.ok(!c.componentReport.emitted.some(e=>['wall-display','window-valance','plaster-ceiling'].includes(e.component)));
 assert.ok(c.componentReport.omitted.some(e=>e.component==='not-a-component'&&e.reason==='UNKNOWN_COMPONENT'));
 assert.ok(!c.lighting.some(l=>l.id.endsWith(':chandelier')));
});

test('budget failures roll back a complete fixture, occupied mount, surface claim and light metadata',()=>{
 const primitives=[],occupied=[],lights=[],usage={primitives:0,triangles:0,geometryBytes:0},session=createRoomComponentSession(room(),{primitives,occupied,usage,limits:{maxRoomPrimitives:1}});
 session.track(lights);
 const build=()=>{box(session);occupied.push({wall:'top',center:1,width:.4});lights.push({id:'never-built'});box(session);};
 assert.equal(session.run('artisan-fixtures',build,{surface:'test-wall'}),null);
 assert.deepEqual(primitives,[]);assert.deepEqual(occupied,[]);assert.deepEqual(lights,[]);assert.equal(usage.primitives,0);
 assert.ok(session.omitted.some(o=>o.reason==='BUDGET_PRIMITIVES'));
 session.run('wall-display',()=>box(session),{surface:'test-wall'});
 assert.equal(primitives.length,1);assert.equal(session.emitted.length,1);
});

test('custom triangle and geometry-memory budgets cannot be bypassed by large single primitives',()=>{
 const triangles=Array.from({length:30},()=>[[0,0,0],[.1,0,0],[0,.1,0]]);
 for(const limits of [{maxTriangles:20},{maxGeometryBytes:100}]){
  const session=createRoomComponentSession(room(),{limits});
  session.run('plaster-ceiling',()=>session.emit([0,0,0],[1,1,1],8,0,{triangles}));
  assert.equal(session.primitives.length,0);assert.equal(session.used.geometryBytes,0);
  assert.ok(session.omitted.some(o=>o.reason.startsWith('BUDGET')));
 }
});

test('invalid material/geometry references are rejected atomically and reported',()=>{
 for(const emit of [s=>box(s,PALETTE.length),s=>s.emit([NaN,0,0],[1,1,1]),s=>s.emit([0,0,0],[-1,1,1])]){
  const session=createRoomComponentSession(room());
  session.run('wall-display',()=>{box(session);emit(session);});
  assert.equal(session.primitives.length,0);assert.ok(session.omitted.some(o=>o.reason.startsWith('INVALID_')));
 }
});

test('one component owns each tabletop; repeated component tokens cannot decorate twice',()=>{
 const r=room('library'),plan=planDecoration(source(r)),report=plan.roomContents[0].componentReport;
 const supports=report.emitted.filter(c=>c.surface?.startsWith('support:'));
 assert.equal(new Set(supports.map(c=>c.surface)).size,supports.length);
 assert.ok(report.emitted.some(o=>o.component==='story-vignette'));
 const session=createRoomComponentSession(r);
 session.run('wall-display',()=>box(session));session.run('wall-display',()=>box(session));
 assert.equal(session.primitives.length,1);assert.equal(session.emitted.length,1);
 const noFixture=plan.lights.filter(l=>l.id.endsWith(':ceiling-light'));
 assert.ok(noFixture.every(l=>l.fixtureGeometryCompiled),'no generic housing over an existing chandelier');
 const empty={...plan,furniture:[],roomContents:[],grounds:[],paths:[],artwork:[],lights:noFixture};
 assert.equal(decorationBoxes(empty).length,0);
});

test('wall details do not reuse portrait or aperture spans; stairs retain clear routes',()=>{
 for(const theme of Object.keys(ROOM_PROFILES)){
  const r=room(theme),plan=planDecoration(source(r)),c=plan.roomContents[0],mounted=c.ornaments.filter(o=>o.wall);
  for(const o of mounted){const vertical=['left','right'].includes(o.wall),at=o.positionMeters[vertical?2:0],span=r[vertical?'w':'l']*.3048;
   for(const opening of r.openings.filter(p=>p.wall===o.wall))assert.ok(Math.abs(at-opening.pos*span)>(o.width+(opening.type==='window'?1.65:1.08))/2-.01,theme+' '+o.type);
  }
  const ids=c.componentReport.emitted.map(c=>c.component+':'+c.key);assert.equal(new Set(ids).size,ids.length);
  for(const p of c.primitives)assert.ok(PALETTE[p.mat],theme+' material');
 }
 const staircase={...room('library'),forgeStair:{},l:6,w:12};
 const plan=planDecoration(source(staircase));assert.equal(plan.furniture.length,0);assert.equal(plan.roomContents[0].identity,'circulation');
});

test('large houses retain fair bounded content allocations and observable omission reports',()=>{
 const rooms=Array.from({length:100},(_,i)=>({...room('parlor','room-'+i),x:i*40,floor:0})),contents=planRoomContents(rooms,{furniture:[],artwork:[]});
 const reports=contents.map(c=>({roomId:c.roomId,...c.componentReport})),audit=auditRoomComponentBudget(reports);
 assert.ok(audit.withinLimits);assert.ok(audit.totals.primitives<=ROOM_CONTENT_LIMITS.maxPrimitives);
 assert.ok(audit.totals.triangles<=ROOM_CONTENT_LIMITS.maxTriangles);assert.ok(audit.totals.geometryBytes<=ROOM_CONTENT_LIMITS.maxGeometryBytes);
 assert.ok(contents.every(c=>c.primitives.length>0));assert.ok(audit.omissions.some(o=>o.reason.startsWith('BUDGET')));
 for(const c of contents){const triangles=c.primitives.reduce((n,p)=>n+primitiveCost(p).triangles,0);assert.equal(triangles,c.componentReport.used.triangles);}
});

test('envelope details use the registry budgets and preserve source geometry',()=>{
 const r=room(),before=structuredClone(r),reports=[],parts=mansionEnvelope({rooms:[r]},0,[0],{maxRoomPrimitives:1,onReport:r=>reports.push(r)});
 assert.deepEqual(r,before);assert.equal(parts.length,0);assert.equal(reports.length,1);
 assert.ok(reports[0].omitted.some(o=>o.component==='mansion-envelope'&&o.reason.startsWith('BUDGET')));
 assert.equal(reports[0].used.primitives,0);
});

test('new CASA exports retain the Game contract, embed geometry once and expose additive QA',async()=>{
 const s=source(room('library')),before=structuredClone(s),{house}=await compileFixture(s);
 assert.deepEqual(s,before);assert.equal(house.manifest.version,'1.0-qa');assert.equal(house.manifest.forgeRevision,'whole-house-1');
 assert.ok(house.playability.staticRoutesVerified);assert.ok(house.access.stops.length);assert.equal(house.gameplay.unbound.length,house.gameplay.slots.length);assert.equal(house.gameplay.gameplayCertified,false);
 const plan=await house.json(house.manifest.decorationPlan),c=plan.roomContents[0],budget=await house.json(house.manifest.packageBudget);
 assert.deepEqual(c.primitives,[]);assert.ok(c.primitiveCount>0);assert.equal(c.componentReport.family,'scholarly');
 assert.ok(budget.components.withinLimits);assert.ok(budget.components.totals.primitives>0);assert.equal(budget.components.rooms,1);assert.ok(budget.components.scopes>=2);
 assert.ok(plan.authoredSourcePreserved);assert.equal(house.manifest.casa.specVersion,'1.0');
 const oldPlan={roomContents:[{roomId:'old',primitives:[]}]};assert.equal(portableDecorationPlan(oldPlan).roomContents[0].roomId,'old');
});

import {createRoomDressing} from '../casa_game/room_dressing.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from 'three';
import {ROOM_PROFILES} from '../casa_game/room_profiles.mjs';
import {resolveRoomAtmosphere,ATMOSPHERE_CONDITIONS,GOTHIC_LIMITS,atmosphereMaterial} from '../casa_game/room_atmosphere_profiles.mjs';
import {GOTHIC_COMPONENTS,gothicComponentParts} from '../casa_game/gothic_components.mjs';
import {createGothicRoom,gothicWindowFrame} from '../casa_game/room_gothic_details.mjs';
import {createRoomComponentSession} from '../casa_game/room_components.mjs';
import {ROOM_MATERIALS as M} from '../casa_game/room_materials.mjs';
import {PALETTE} from '../casa_admin/forge_glb.mjs';
import {planDecoration} from '../casa_admin/forge_decoration_plan.mjs';
import {architecturalTreatment} from '../casa_admin/forge_finishes.mjs';
import {ROOM_FURNITURE,roomFurnitureParts} from '../casa_admin/forge_room_furniture.mjs';
import {FORGE_COMPONENT_REGISTRY} from '../casa_admin/forge_components.mjs';
import {createRoomDust} from '../casa_game/room_dust.mjs';
import {createPracticalLights} from '../casa_game/practical_lights.mjs';
import {createHauntedInteriors} from '../casa_game/haunted_interiors.mjs';
import {createVelvetDetails} from '../casa_game/velvet_details.mjs';
import {selectHouseLights} from '../casa_game/house_lighting.mjs';
import {finishSurfaces} from '../casa_game/surface_finish.mjs';
import {compileFixture} from './helpers/compile-forge.mjs';
const room=(identity='parlor',condition='preserved',extra={})=>({id:identity,name:identity,roomTheme:identity,x:0,y:0,l:28,w:26,h:12,openings:[{id:'entry',type:'door',wall:'top',pos:.5},{type:'window',wall:'bottom',pos:.5}],forgeDecoration:{atmosphere:{condition}},...extra}),source=r=>({name:'Atmosphere QA',gameEntry:{roomId:r.id,openingId:'entry'},floors:[{name:'Main',rooms:[r]}]});
const shapes=(r,furniture=[])=>{const primitives=[],occupied=[],components=createRoomComponentSession(r,{primitives,occupied}),gothic=createGothicRoom(r,{add:components.emit,components,occupied,furniture}),ornaments=[];return {gothic,primitives,components,ornaments};};

test('all eleven identities inherit family atmosphere, honor authored policies and resolve deterministic condition variants',()=>{
 for(const id of Object.keys(ROOM_PROFILES))for(const condition of Object.keys(ATMOSPHERE_CONDITIONS)){const r=room(id,condition),before=structuredClone(r),a=resolveRoomAtmosphere(r);assert.deepEqual(a,resolveRoomAtmosphere(r));assert.deepEqual(r,before);assert.equal(a.family,ROOM_PROFILES[id].family);assert.equal(a.condition,condition);assert.equal(a.wear,ATMOSPHERE_CONDITIONS[condition].wear);}
 assert.equal(resolveRoomAtmosphere(room('laboratory')).textiles,false);assert.equal(resolveRoomAtmosphere(room('crypt')).glass,false);assert.equal(resolveRoomAtmosphere(room('nursery','abandoned')).effects,false);
 const nested={...room(),forgeDecoration:undefined,source:{forgeDecoration:{atmosphere:{condition:'decaying',effects:false,botanicalState:'maintained'}}}};assert.equal(resolveRoomAtmosphere(nested).effects,false);assert.equal(resolveRoomAtmosphere(nested).botanicalState,'maintained');assert.equal(resolveRoomAtmosphere(room('parlor','unknown')).condition,'preserved');
});

test('every shared Gothic model is deterministic, material-valid and bounded across condition and detail variants',()=>{
 for(const type of Object.keys(GOTHIC_COMPONENTS))for(const condition of Object.keys(ATMOSPHERE_CONDITIONS))for(const compact of [false,true]){const options={condition,compact,width:.8,height:.65,state:condition==='preserved'?'maintained':condition==='abandoned'?'dried':'overgrown'},a=gothicComponentParts(type,options);assert.deepEqual(a,gothicComponentParts(type,options));assert.ok(a.length<=GOTHIC_LIMITS.maxTemplateMaterials);assert.ok(a.reduce((n,p)=>n+p.triangles.length,0)<=1200);for(const p of a){assert.ok(PALETTE[p.mat]);assert.ok(p.triangles.flat().every(v=>v.every(Number.isFinite)));}assert.equal(typeof FORGE_COMPONENT_REGISTRY['gothic:'+type].generate,'function');}
 assert.throws(()=>gothicComponentParts('unknown'));assert.throws(()=>gothicComponentParts('velvet-curtain',{width:NaN}));assert.equal(M.gilt,36);assert.equal(M.bronze,39);assert.equal(PALETTE.length,Object.keys(M).length);
});

test('layered textiles fit all four actual window orientations and stay in the wall clearance band',()=>{
 for(const wall of ['top','right','bottom','left']){const r=room('parlor','abandoned',{openings:[{type:'window',wall,pos:.5}]}),a=shapes(r);a.gothic.windowTextiles(a.ornaments);assert.ok(a.gothic.report().components.some(c=>c.type==='velvet-curtain'));const f=gothicWindowFrame(r,r.openings[0]);for(const p of a.primitives)for(const v of p.triangles.flat()){const dx=v[0]-f.position[0],dz=v[2]-f.position[2],s=Math.sin(f.rotationY),c=Math.cos(f.rotationY),u=dx*c-dz*s,t=dx*s+dz*c;assert.ok(Math.abs(u)<=f.width/2+.01);assert.ok(t>=-.001&&t<=.0601,'no drapery enters movement clearance');assert.ok(v[1]>=f.low-.01&&v[1]<r.h*.3048);}}
 const wide=room('parlor','preserved',{openings:[{type:'window',wall:'bottom',pos:.5,clearWidthMeters:6}]}),big=shapes(wide);big.gothic.windowTextiles(big.ornaments);assert.equal(big.gothic.windowGlass(wide.openings[0],0,big.ornaments),false);assert.equal(big.primitives.length,0);assert.ok(big.gothic.report().omitted.some(o=>o.reason==='OVERSIZE_WINDOW_DETAIL'));
 const r=room('parlor','decaying',{h:8}),a=shapes(r);a.gothic.windowTextiles(a.ornaments);assert.equal(a.primitives.length,0);
});

test('authored window treatments and materials win over generated glass and curtains',()=>{
 for(const extra of [{glass:'student-glass'},{glazing:'clear'},{material:'authored'},{windowStyle:'plain'}]){const r=room('gallery','decaying',{openings:[{type:'window',wall:'bottom',pos:.5,...extra}]}),a=shapes(r);assert.equal(a.gothic.windowGlass(r.openings[0],0,a.ornaments),false);assert.equal(a.primitives.length,0);}
 const r=room('bedroom','abandoned',{openings:[{type:'window',wall:'bottom',pos:.5,drapery:false}]}),a=shapes(r);a.gothic.windowTextiles(a.ornaments);assert.equal(a.primitives.length,0);
});

test('canopies follow rotated bed footprints, preserve story surfaces and never enter floor routes',()=>{
 for(const angle of [0,.7,Math.PI/2]){const r=room('bedroom'),f={id:'bed',type:'bed',positionMeters:[4,0,4],rotationY:angle},a=shapes(r,[f]);a.gothic.finish(a.ornaments,[]);assert.ok(a.gothic.report().components.some(c=>c.type==='bed-canopy'));for(const p of a.primitives)for(const v of p.triangles.flat()){const dx=v[0]-4,dz=v[2]-4,u=dx*Math.cos(angle)-dz*Math.sin(angle),z=dx*Math.sin(angle)+dz*Math.cos(angle);assert.ok(Math.abs(u)<.825&&Math.abs(z)<1.05);assert.ok(v[1]>2&&v[1]<2.36);}}
 for(const protectedSource of [{canopy:false},{allowAccessories:false}]){const r=room('bedroom'),f={id:'bed',type:'bed',source:protectedSource,positionMeters:[4,0,4]},a=shapes(r,[f]);a.gothic.finish(a.ornaments,[]);assert.ok(!a.gothic.report().components.some(c=>c.type==='bed-canopy'));}
});

test('shared living, dried and overgrown fronds retain the existing urn and stand collision envelopes',()=>{
 const variants=[];for(const type of ['fern_urn','plant_stand'])for(const botanicalState of ['maintained','dried','overgrown']){const item={id:'plant',type,botanicalState,positionMeters:[0,0,0]},before=structuredClone(item),parts=roomFurnitureParts(item),spec=ROOM_FURNITURE[type];assert.deepEqual(item,before);for(const p of parts){assert.ok(Math.abs(p.c[0])+p.s[0]/2<=spec.footprint[0]/2+.01);assert.ok(Math.abs(p.c[2])+p.s[2]/2<=spec.footprint[1]/2+.01);assert.ok(p.c[1]+p.s[1]/2<=spec.height+.01);}variants.push(parts.filter(p=>p.triangles).map(p=>p.mat));}assert.notDeepEqual(variants[0],variants[1]);assert.notDeepEqual(variants[1],variants[2]);
});

test('aging varies generated finishes while explicit panel, trim and ceiling materials remain authoritative',()=>{
 for(const condition of Object.keys(ATMOSPHERE_CONDITIONS)){const r=room('crypt',condition,{finishes:{panel:'stone',trim:'silver',ceiling:'wood'}}),snapshot=structuredClone(r),t=architecturalTreatment(r);assert.equal(t.relief,M.stone);assert.equal(t.accent,M.silver);assert.equal(t.cofferMaterial,M.wood);assert.deepEqual(r,snapshot);}
 assert.equal(atmosphereMaterial(M.stone,resolveRoomAtmosphere(room('crypt','decaying'))),M.agedStone);assert.equal(atmosphereMaterial(M.metal,resolveRoomAtmosphere(room('gallery','abandoned'))),M.patina);assert.equal(atmosphereMaterial(M.metal,resolveRoomAtmosphere(room('gallery','preserved'))),M.metal);
});

test('small rooms, low ceilings, stairs, removed walls and exhausted budgets omit detail safely with reports',()=>{
 for(const extra of [{l:4,w:12,h:8},{forgeStair:{}},{embeddedStair:{}},{name:'Elevator landing'},{h:7.5}]){const r=room('conservatory','decaying',extra),a=shapes(r);a.gothic.windowTextiles(a.ornaments);a.gothic.finish(a.ornaments,[]);assert.ok(!a.gothic.report().components.some(c=>['velvet-curtain','trailing-ivy','bed-canopy'].includes(c.type)));}
 const r=room(),primitives=[],components=createRoomComponentSession(r,{primitives,limits:{maxTriangles:10}}),g=createGothicRoom(r,{add:components.emit,components}),ornaments=[];g.windowTextiles(ornaments);assert.equal(primitives.length,0);assert.equal(g.report().components.length,0);assert.equal(ornaments.length,0);assert.ok(g.report().omitted.some(o=>o.reason.startsWith('BUDGET')));
 for(const id of Object.keys(ROOM_PROFILES)){const d=planDecoration(source(room(id,'decaying'))),c=d.roomContents[0];assert.ok(c.atmosphereReport.triangles<=2200);assert.ok(c.atmosphereReport.groups<=40);assert.ok(c.componentReport.used.triangles<=10000);}
});

test('effects and static layers disable independently without changing furniture, collision, stories or quest objectives',()=>{
 const on=source(room('parlor','abandoned')),off=structuredClone(on);off.floors[0].rooms[0].forgeDecoration.atmosphere.effects=false;const a=planDecoration(on),b=planDecoration(off);for(const key of ['furniture','colliders','reserved','artwork','changes'])assert.deepEqual(a[key],b[key]);assert.deepEqual(a.roomContents[0].story,b.roomContents[0].story);assert.deepEqual(a.roomContents[0].primitives,b.roomContents[0].primitives);
 for(const key of ['gothic-textiles','window-valance']){const r=room('parlor');r.forgeDecoration.components={[key]:false};const c=planDecoration(source(r)).roomContents[0];assert.ok(!c.atmosphereReport.components.some(d=>d.type==='velvet-curtain'));if(key==='gothic-textiles')assert.ok(!c.atmosphereReport.components.some(d=>d.type==='upholstered-panel'));}const disabled=room();disabled.forgeDecoration.atmosphere=false;const d=planDecoration(source(disabled));assert.equal(d.roomContents[0].atmosphereReport.components.length,0);assert.ok(d.roomContents[0].ornaments.length);assert.ok(d.furniture.length);
});

test('one localized dust pool obeys room policies, both quality tiers, reduced motion and actual room bounds',()=>{
 const src=source(room('parlor','decaying')),d=planDecoration(src),house={rooms:src.floors[0].rooms.map(r=>({...r,boundsFeet:r,floor:0})),decoration:d,manifest:{floors:[{elevationMeters:0}]}};
 for(const options of [{quality:'performance'},{reducedMotion:true},{effectsEnabled:false}]){const p=createRoomDust(T,house,0,d.roomContents,options);p.tick(1000,'parlor');assert.equal(p.capacity,0);assert.equal(p.root.visible,false);p.root.geometry.dispose();p.root.material.dispose();}
 const p=createRoomDust(T,house,0,d.roomContents);p.tick(1000,'parlor');assert.equal(p.capacity,64);assert.equal(p.root.geometry.drawRange.count,64);const positions=p.root.geometry.attributes.position,version=positions.version;for(let k=0;k<positions.count;k++){const x=positions.getX(k)+p.root.position.x,z=positions.getZ(k)+p.root.position.z;assert.ok(x>0&&x<28*.3048&&z>0&&z<26*.3048);}p.tick(20000,'parlor');assert.equal(positions.version,version,'no per-frame vertex uploads');p.tick(21000,'missing');assert.equal(p.root.visible,false);p.root.geometry.dispose();p.root.material.dispose();
});

test('gentle light modulation is capped, slow, room-local and disabled on weaker quality or reduced motion',()=>{
 const d=planDecoration(source(room('parlor','abandoned'))),house={decoration:d},position=[4,1.6,4],cin=selectHouseLights(house,{roomId:'parlor',floor:0,position}),perf=selectHouseLights(house,{roomId:'parlor',floor:0,position,quality:'performance'});assert.ok(cin.some(s=>s.gothicPulse));assert.ok(perf.every(s=>!s.gothicPulse));const light=new T.PointLight(),rig=createPracticalLights([light]),spec={id:'candle',positionMeters:[0,2,0],intensity:10,gothicPulse:{amplitude:10,periodSeconds:.1}};rig.set([spec],{immediate:true});let last=10;for(let i=0;i<1200;i++){rig.tick(.02,{time:i*20});assert.ok(light.intensity>=9.75&&light.intensity<=10.25);assert.ok(Math.abs(last-light.intensity)<.01);last=light.intensity;}rig.set([spec],{immediate:true});for(let k=0;k<50;k++)rig.tick(.02,{time:k*20,motion:false});assert.equal(light.intensity,10);
});

test('clear display glass keeps neutral, inexpensive transparency without a reflection camera or transmission shader',async()=>{
 const material=new T.MeshStandardMaterial({name:'clear display glass',transparent:true,opacity:.16}),root=new T.Group();root.add(new T.Mesh(new T.BoxGeometry(1,1,1),material));await finishSurfaces(T,root);assert.equal(material.emissiveIntensity,0);assert.equal(material.depthWrite,false);assert.equal(material.opacity,.16);assert.equal(material.transmission,undefined);root.children[0].geometry.dispose();material.dispose();const fallback=createRoomDressing(T,[{primitives:[{c:[0,0,0],s:[1,1,.001],mat:M.displayGlass,triangles:[[[0,0,0],[1,0,0],[0,1,0]]]}]}]);assert.equal(fallback.root.children[0].material.transparent,true);assert.equal(fallback.root.children[0].material.opacity,.16);fallback.root.children[0].geometry.dispose();fallback.root.children[0].material.dispose();
});

test('real multi-story exports remain reproducible, contain all materials and preserve optional gameplay contracts',async()=>{
 const fixture=JSON.parse(await readFile(new URL('./fixtures/forge-atmosphere.json',import.meta.url))),before=structuredClone(fixture),a=await compileFixture(fixture),b=await compileFixture(fixture);assert.deepEqual(a.bytes,b.bytes);assert.deepEqual(fixture,before);const report=await a.house.json('qa/gothic_atmosphere.json');assert.equal(report.rooms.length,11);assert.equal(report.optional,true);assert.ok(a.house.playability.staticRoutesVerified);assert.ok((await a.house.json(a.house.manifest.packageBudget)).components.withinLimits);
 for(const c of a.house.decoration.roomContents){if(c.atmosphere.textiles)assert.ok(c.atmosphereReport.components.some(d=>d.type==='velvet-curtain'),c.roomId+' physical exterior drapery');assert.equal(c.discovery.optional,true);assert.equal(c.discovery.requiredForQuest,false);assert.equal(c.discovery.id,'room:'+c.roomId);}
 const velvet=createVelvetDetails(T,a.house,1);assert.ok(!velvet.children.some(c=>c.name==='Hand-draped canopy'));const h=createHauntedInteriors(T,{reducedMotion:true,quality:'performance'});h.configure(a.house,1,17,[]);assert.equal(h.dustPool.capacity,0);h.tick(1000,[1,4,1],'bedroom');h.event({kind:'reflection',roomId:'bedroom'});h.tick(9000,[1,4,1],'bedroom');const count=h.root.children.length;h.configure(a.house,1,17,[]);assert.equal(h.root.children.length,count);h.dispose();assert.equal(h.root.children.length,0);
});

test('fern pinnae retain both face orientations and a fixed single-material clearance-safe template',()=>{
 for(const compact of [true,false])for(const state of ['maintained','dried','overgrown']){const parts=gothicComponentParts('fern-fronds',{height:.45,compact,state}),triangles=parts.flatMap(p=>p.triangles);assert.equal(parts.length,1);assert.ok(triangles.length<=1200);const faces=new Set(triangles.map(t=>JSON.stringify(t)));for(const t of triangles)assert.ok(faces.has(JSON.stringify([t[2],t[1],t[0]]))||faces.has(JSON.stringify([t[0],t[2],t[1]]))||faces.has(JSON.stringify([t[1],t[0],t[2]])),'each leaf/stem face has an opposite-facing counterpart');}
});

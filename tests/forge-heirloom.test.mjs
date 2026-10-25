import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {heirloomFurnitureParts,heirloomInventory,HEIRLOOM_ASSET_LIMITS} from '../casa_admin/forge_heirloom_furniture.mjs';
import {HEIRLOOM_TYPES,heirloomStyle,heirloomStyleKey} from '../casa_admin/forge_heirloom_style.mjs';
import {ROOM_FURNITURE,roomFurnitureParts} from '../casa_admin/forge_room_furniture.mjs';
import {FURNITURE_CATALOG} from '../casa_admin/victorian_furniture_library.js';
import {FORGE_COMPONENT_REGISTRY} from '../casa_admin/forge_components.mjs';
import {ROOM_PROFILES} from '../casa_game/room_profiles.mjs';
import {ROOM_MATERIALS as M} from '../casa_game/room_materials.mjs';
import {PALETTE} from '../casa_admin/forge_glb.mjs';
import {planDecoration,decorationBoxes} from '../casa_admin/forge_decoration_plan.mjs';
import {compileFixture} from './helpers/compile-forge.mjs';
const overlap=(a,b)=>a.minX<b.maxX&&a.maxX>b.minX&&a.minZ<b.maxZ&&a.maxZ>b.minZ;
const r=(identity,size=26)=>({id:identity,name:identity,type:'room',roomTheme:identity,x:0,y:0,l:size,w:size,h:12,openings:[{id:'entry',type:'door',wall:'top',pos:.5},{id:'window',type:'window',wall:'left',pos:.5}]});
const source=room=>({name:'Heirloom QA',gameEntry:{roomId:room.id,openingId:'entry'},floors:[{name:'Main',kind:'main',rooms:[room]}]});

test('all reusable heirlooms fit existing rotated colliders, stand on the floor and have supported finite materials',()=>{
 for(const type of HEIRLOOM_TYPES)for(const identity of ['ballroom','nursery','library'])for(const angle of [0,Math.PI/2,.73]){
  const spec=ROOM_FURNITURE[type]||FURNITURE_CATALOG[type],item={type,positionMeters:[3,2,5],rotationY:angle,furnitureStyle:heirloomStyle(r(identity))},parts=heirloomFurnitureParts(item),vertices=parts.flatMap(p=>p.triangles.flat());
  assert.ok(parts.length<=HEIRLOOM_ASSET_LIMITS.materials,type);assert.ok(vertices.length/3<=6000,type);assert.ok(vertices.length>300,type);
  let floor=Infinity;
  for(const p of parts){assert.ok(PALETTE[p.mat],type);for(const v of p.triangles.flat()){assert.ok(v.every(Number.isFinite),type);const dx=v[0]-3,dz=v[2]-5,x=dx*Math.cos(angle)-dz*Math.sin(angle),z=dx*Math.sin(angle)+dz*Math.cos(angle);assert.ok(Math.abs(x)<=spec.footprint[0]/2+.002,type+' width '+x);assert.ok(Math.abs(z)<=spec.footprint[1]/2+.002,type+' depth '+z);assert.ok(v[1]>=2-.001&&v[1]<=2+spec.height+.001,type+' height '+v[1]);floor=Math.min(floor,v[1]);}}
  assert.ok(Math.abs(floor-2)<.001,type+' floating base');
 }
});

test('room-specific styles and composition remain distinct across all eleven profiles at three room sizes',()=>{
 const ensembles=new Map();
 for(const size of [11,19,32])for(const identity of Object.keys(ROOM_PROFILES)){
  const s=source(r(identity,size)),before=structuredClone(s),a=planDecoration(s,{repair:true}),b=planDecoration(s,{repair:true});assert.deepEqual(a,b);assert.deepEqual(s,before);
  for(const f of a.furniture){const c=a.colliders.find(c=>c.objectId===f.id);assert.ok(c);assert.ok(!a.reserved.filter(z=>z.floor===f.floor).some(z=>overlap(z.bounds,c.bounds)),identity+' route');const spec=ROOM_FURNITURE[f.type]||FURNITURE_CATALOG[f.type];assert.ok(c.maxY-c.minY===spec.height);}
  for(const art of a.artwork){const [x,,z]=art.interaction.anchorMeters;assert.ok(!a.colliders.some(c=>c.floor===art.floor&&x>c.bounds.minX&&x<c.bounds.maxX&&z>c.bounds.minZ&&z<c.bounds.maxZ));}
  if(size===32)ensembles.set(identity,a.furniture.map(f=>f.type+':'+heirloomStyleKey(f.furnitureStyle||heirloomStyle(r(identity)))));
 }
 for(const a of ['parlor','library','ballroom','bedroom'])for(const b of ['parlor','library','ballroom','bedroom'])if(a!==b)assert.notDeepEqual(ensembles.get(a),ensembles.get(b));
});

test('authored furniture style overrides win without mutating type, identity, source or coordinates',()=>{
 const room=r('library',32),authored={id:'my-heirloom',type:'writing_desk',x:.15,y:.18,furnitureStyle:{wood:'painted',upholstery:'emerald',condition:'preserved',ornament:'luxury',pattern:2}};room.furniture=[authored];const s=source(room),before=structuredClone(s),d=planDecoration(s),f=d.furniture.find(f=>f.id===authored.id);assert.ok(f);assert.deepEqual(s,before);assert.deepEqual(f.source,authored);assert.deepEqual(f.furnitureStyle,authored.furnitureStyle);assert.equal(f.positionMeters[0],32*.3048*.15);assert.equal(f.type,'writing_desk');assert.ok(!d.changes.some(c=>/REPLACE|RELOCATE/.test(c.code)));
 room.furniture[0].furnitureStyle.wood='rosewood';const unsupported=planDecoration(source(room));assert.ok(unsupported.issues.some(i=>i.code==='AUTHORED_FURNITURE_STYLE_UNSUPPORTED'&&i.sourcePreserved));assert.equal(unsupported.furniture.find(f=>f.id===authored.id).source.furnitureStyle.wood,'rosewood');
});

test('styles reuse stable model paths and cached local geometry without sharing mutable world coordinates',()=>{
 const item={type:'writing_desk',positionMeters:[0,0,0],furnitureStyle:heirloomStyle(r('library'))},a=heirloomFurnitureParts(item),b=heirloomFurnitureParts({...item,positionMeters:[10,3,8]});const savedSize=a[0].s[0];a[0].s[0]=999;a[0].triangles[0][0][0]=999;const c=heirloomFurnitureParts(item);assert.notEqual(c[0].triangles[0][0][0],999);assert.equal(c[0].s[0],savedSize);assert.ok(Math.abs((b[0].triangles[0][0][0]-10)-c[0].triangles[0][0][0])<1e-8);
 const d=planDecoration(source(r('library',40))),desks=d.furniture.filter(f=>f.type==='writing_desk');assert.ok(desks.length>1);assert.equal(new Set(desks.map(f=>f.model)).size,1);assert.ok(desks.every(f=>!f.builtIn));assert.equal(typeof FORGE_COMPONENT_REGISTRY['furniture:writing_desk'].generate,'function');assert.equal(FORGE_COMPONENT_REGISTRY['furniture:writing_desk'].generator,'heirloomFurnitureParts');assert.ok(FORGE_COMPONENT_REGISTRY['furniture:writing_desk'].modelPattern.includes('{style}'));
});

test('upholstery has volume, tuft valleys, buttons, textile variants and supported arms',()=>{
 for(const identity of ['parlor','library','gallery']){const style=heirloomStyle(r(identity)),parts=heirloomFurnitureParts({type:'gothic_armchair',positionMeters:[0,0,0],furnitureStyle:style}),m={claret:M.upholstery,leather:M.leather,blue:M.blueVelvet}[style.upholstery],fabric=parts.filter(p=>p.mat===m).flatMap(p=>p.triangles.flat());assert.ok(fabric.length>200);assert.ok(new Set(fabric.map(p=>p[2].toFixed(4))).size>6);assert.ok(parts.some(p=>[M.gilt,M.metal].includes(p.mat)));assert.ok(parts.flatMap(p=>p.triangles.flat()).some(v=>v[0]>.38&&v[0]<.46&&v[1]>.47&&v[1]<.50&&v[2]>.21&&v[2]<.27),'front arm support meets the seat frame');}
});

test('detail levels reduce carving and report their omissions without changing placement envelopes',()=>{
 const rich=heirloomFurnitureParts({type:'gothic_armchair',positionMeters:[0,0,0],furnitureStyle:heirloomStyle(r('parlor'))}),room={...r('parlor'),forgeDecoration:{detail:'essential'}},d=planDecoration(source(room)),inventory=heirloomInventory(d),chair=d.furniture.find(f=>f.type==='gothic_armchair');assert.ok(chair);assert.ok(heirloomFurnitureParts(chair).reduce((n,p)=>n+p.triangles.length,0)<rich.reduce((n,p)=>n+p.triangles.length,0));assert.ok(inventory.omissions.some(o=>o.reason==='DETAIL_POLICY'));assert.ok(inventory.assets.every(a=>a.triangles<=6000));
});

test('Pass 2 material indices remain stable and furniture additions are append-only',()=>{assert.equal(M.marble,30);assert.equal(M.sageDamask,29);assert.equal(M.wood,5);for(const key of ['paintedWood','emeraldVelvet','blueVelvet','furnitureOak','agedMahogany','gilt'])assert.ok(M[key]>30&&PALETTE[M[key]]);});

test('eleven-room two-story export embeds shared styled models, validates Game loading and reports actual asset costs',async()=>{
 const src=JSON.parse(await readFile(new URL('./fixtures/forge-luxury.json',import.meta.url))),{house}=await compileFixture(src);assert.ok(house.playability.staticRoutesVerified);const inventory=await house.json('qa/heirloom_furniture.json');assert.ok(inventory.assets.length>6);const budget=await house.json(house.manifest.packageBudget);assert.ok(!budget.components.byComponent['carved-shelving-surrounds'],'styled bookcases own their carving without a second envelope overlay');assert.ok(inventory.sharedModels.length>2);for(const asset of inventory.sharedModels){assert.ok(asset.bytes>0&&asset.triangles<6000);assert.ok(house.entries.has(asset.model));}for(const f of house.decoration.furniture.filter(f=>!f.builtIn))assert.ok(house.entries.has(f.model));assert.ok(decorationBoxes(planDecoration(src)).every(p=>PALETTE[p.mat]));
});


test('rounded upholstery cap normals face outward to prevent dark seams after smoothing',()=>{
 const parts=heirloomFurnitureParts({type:'bed',positionMeters:[0,0,0],furnitureStyle:heirloomStyle(r('bedroom'))});let tested=0;
 for(const part of parts.filter(p=>p.mat===M.linen))for(const [a,b,c] of part.triangles){
  const top=[.59,.73].some(y=>[a,b,c].every(v=>Math.abs(v[1]-y)<1e-7)),bottom=[a,b,c].every(v=>Math.abs(v[1]-.39)<1e-7);if(!top&&!bottom)continue;
  const ny=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]);assert.ok(top?ny>0:ny<0);tested++;
 }
 assert.ok(tested>=30);
});


test('dining back upholstery faces the table and clears the carved backing field',()=>{
 const parts=heirloomFurnitureParts({type:'banquet_ensemble',positionMeters:[0,0,0],furnitureStyle:heirloomStyle(r('dining'))}),front=parts.filter(p=>p.mat===M.emeraldVelvet).flatMap(p=>p.triangles.flat()).filter(v=>v[0]>1&&v[1]>.8);
 assert.ok(front.length>50);assert.ok(front.every(v=>v[0]>=1.10&&v[0]<1.235));
});


test('Game floor streaming preserves new claret headboards while retaining the legacy curtain filter',async()=>{
 const T=await import('three'),{createFloorStreamer}=await import('../casa_game/resources.mjs');
 for(const styled of [false,true]){
  const house={manifest:{geometrySpace:'world',floors:[{model:'floor',elevationMeters:0}],decorationGeometry:'decor'},decoration:{furniture:[{type:'bed',floor:0,builtIn:true,positionMeters:[0,0,0],...(styled?{furnitureStyle:{upholstery:'claret'}}:{})}]}},assets={async glb(path){const root=new T.Group();if(path==='decor'){const geometry=new T.PlaneGeometry(1,1);geometry.translate(0,1.5,0);const material=new T.MeshStandardMaterial();material.name='burgundy velvet';root.add(new T.Mesh(geometry,material));}return root;}},stream=createFloorStreamer(house,assets,T),floor=await stream.get(0);let vertices=0;floor.traverse(o=>{if(o.isMesh)vertices+=o.geometry.attributes.position.count;});assert.equal(vertices,styled?6:0);stream.clear();
 }
});

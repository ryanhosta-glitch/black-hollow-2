import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {mansionEnvelope} from '../casa_admin/forge_envelope_finish.mjs';
import {luxuryWall} from '../casa_admin/forge_architectural_luxury.mjs';
import {architecturalShapes,architecturalPartMeters} from '../casa_admin/forge_architectural_shapes.mjs';
import {architecturalTreatment,roomFinish} from '../casa_admin/forge_finishes.mjs';
import {architecturalDetails,openingShape} from '../casa_admin/forge_architecture.mjs';
import {FORGE_COMPONENT_REGISTRY} from '../casa_admin/forge_components.mjs';
import {planDecoration} from '../casa_admin/forge_decoration_plan.mjs';
import {roomFurnitureParts,ROOM_FURNITURE} from '../casa_admin/forge_room_furniture.mjs';
import {ROOM_PROFILES,usesArchitecturalLuxury} from '../casa_game/room_profiles.mjs';
import {createRoomComponentSession,primitiveCost} from '../casa_game/room_components.mjs';
import {MAT,PALETTE} from '../casa_admin/forge_glb.mjs';
import {compileFixture} from './helpers/compile-forge.mjs';
const FT=.3048;
const room=(identity='parlor')=>({id:identity,name:identity,roomTheme:identity,type:'room',x:0,y:0,l:28,w:26,h:12,openings:[{id:'entry',type:'door',wall:'top',pos:.5},{id:'window',type:'window',wall:'left',pos:.5}]});
const source=r=>({name:'Luxury Test',gameEntry:{roomId:r.id,openingId:'entry'},floors:[{name:'Main',kind:'main',rooms:[r]}]});
function build(r,options={}){const reports=[];const parts=mansionEnvelope({rooms:[r]},0,[0],{...options,onReport:r=>reports.push(r)});return {parts,report:reports[0]};}
const vertices=p=>p.triangles?.flat()||[[p.c[0]-p.s[0]/2,p.c[1]-p.s[1]/2,p.c[2]-p.s[2]/2],[p.c[0]+p.s[0]/2,p.c[1]+p.s[1]/2,p.c[2]+p.s[2]/2]];
function triangleBounds(p){return p.triangles?.map(t=>({lo:[0,1,2].map(k=>Math.min(...t.map(v=>v[k]))),hi:[0,1,2].map(k=>Math.max(...t.map(v=>v[k])))}))||[{lo:p.c.map((v,k)=>v-p.s[k]/2),hi:p.c.map((v,k)=>v+p.s[k]/2)}];}

test('shared profiled architecture upgrades all eleven identities with distinct family treatments',()=>{
 for(const identity of Object.keys(ROOM_PROFILES)){
  const r=room(identity),before=structuredClone(r),{parts,report}=build(r);
  assert.deepEqual(r,before);assert.ok(parts.length>0,identity);
  const ids=new Set(report.emitted.map(c=>c.component));
  for(const id of ['profiled-cornices','raised-wainscoting','period-floor-inlays'])assert.ok(ids.has(id),identity+' '+id);
  assert.ok(report.used.primitives<=420);assert.ok(report.used.triangles<=10000);
  for(const p of parts){assert.ok(PALETTE[p.mat]);assert.ok(vertices(p).every(v=>v.every(Number.isFinite)));}
 }
 assert.equal(architecturalTreatment(room('crypt')).mode,'stone');
 assert.equal(architecturalTreatment(room('library')).mode,'mahogany');
 assert.equal(architecturalTreatment(room('laboratory')).mode,'ceramic');
 assert.equal(architecturalTreatment(room('conservatory')).mode,'iron');
 assert.equal(architecturalTreatment(room('nursery')).restrained,true);
});

test('profiled moldings and raised panels contain dimensional bevels, not only flat colour changes',()=>{
 const parts=[],shapes=architecturalShapes((c,s,mat,rot,shape)=>{parts.push({c,s,mat,...shape});return true;});
 shapes.sweep((at,y,depth)=>[at,y,depth],0,8,[[0,0],[.2,0],[.3,.2],[.3,.5],[0,.5]],MAT.plaster);
 shapes.panel((at,y,depth)=>[at,y,depth],4,2,3,2,MAT.wood,.23);shapes.flush();
 assert.equal(parts.length,2);assert.ok(parts.every(p=>p.triangles.length>12));
 assert.ok(new Set(parts[1].triangles.flat(2).filter(Number.isFinite)).size>12);
 assert.ok(new Set(parts[1].triangles.flat().map(v=>v[2].toFixed(3))).size>=3);
});

test('all new architectural components are routed through the Pass 1 registry',()=>{
 for(const id of ['profiled-cornices','raised-wainscoting','carved-pilasters','pediment-surrounds','coffered-ceilings','carved-medallions','period-floor-inlays','carved-shelving-surrounds']){
  const c=FORGE_COMPONENT_REGISTRY[id];assert.equal(c.category,'architecture');assert.equal(c.generator,'architecturalLuxury');assert.equal(typeof c.generate,'function');
 }
 const r={...room(),forgeDecoration:{components:{'carved-pilasters':false,'carved-medallions':false}}},{report}=build(r);
 assert.ok(!report.emitted.some(c=>['carved-pilasters','carved-medallions'].includes(c.component)));
 assert.ok(report.omitted.some(o=>o.component==='carved-medallions'&&o.reason==='DETAIL_POLICY'));
});

test('actual triangles preserve every door, window and full-height removed partition aperture',()=>{
 for(const side of ['top','bottom','left','right'])for(const type of ['door','window','open']){
  const r={...room(),openings:[{id:'test',wall:side,type,pos:.5,clearWidthMeters:type==='open'?4:undefined}]},vertical=side==='left'||side==='right',span=vertical?r.w:r.l,at=vertical?2:0,normal=vertical?0:2,wall=side==='left'||side==='top'?0:span===r.w?r.l:r.w,shape=openingShape(r.openings[0],span,r.h);
  const {parts}=build(r);
  for(const p of parts)for(const t of triangleBounds(p)){
   if(t.lo[normal]>wall+.36||t.hi[normal]<wall-.36)continue;
   const crosses=t.lo[at]<shape.center+shape.width/2-.005&&t.hi[at]>shape.center-shape.width/2+.005&&t.lo[1]<shape.high-.005&&t.hi[1]>shape.low+.05;
   assert.ok(!crosses,`${side}/${type}: ${JSON.stringify(t)}`);
  }
 }
});

test('full-wall removed partitions never receive wall trim and crowded corner doors omit pediments',()=>{
 const r={...room(),openings:[{type:'open',wall:'top',pos:.5,clearWidthMeters:28*FT}]},wall=luxuryWall(r,'top');assert.deepEqual(wall.runs(1.7,3.4),[]);
 const near={...room(),openings:[{id:'corner',type:'door',wall:'top',pos:.035}]},{report}=build(near);
 assert.ok(!report.emitted.some(c=>c.component==='pediment-surrounds'));
 assert.ok(report.omitted.some(c=>c.component==='pediment-surrounds'&&c.reason==='NO_SAFE_PLACEMENT'));
});

test('full-height carving avoids occupied portrait and wall-decoration rectangles',()=>{
 const r=room(),art={roomId:r.id,normal:[0,0,1],positionMeters:[.19,1.8,0],sizeMeters:[.6,1.2]},wall=luxuryWall(r,'top',0,{artwork:[art]});
 assert.equal(wall.clear(.38,6,.56,10),false);
 const d=planDecoration(source(r)),{report}=build(r,{decoration:d});
 assert.ok(report.emitted.some(c=>c.component==='raised-wainscoting'));
 assert.ok(d.artwork.length>0);
});

test('ceiling relief preserves headroom, stair voids and restrained room identities',()=>{
 for(const h of [7.2,8,8.9]){
  const {report}=build({...room(),h});assert.ok(!report.emitted.some(c=>['carved-medallions','coffered-ceilings'].includes(c.component)));
 }
 for(const identity of ['laboratory','conservatory','circulation'])assert.ok(!build(room(identity)).report.emitted.some(c=>c.component==='carved-medallions'));
 for(const flags of [{forgeStair:{physicalTraversalEnabled:true}},{embeddedStair:{}},{stairs:[]}]){
  const r={...room(),...flags};assert.equal(usesArchitecturalLuxury(r),false);assert.ok(!build(r).report.emitted.some(c=>c.component==='coffered-ceilings'));
 }
 for(const r of [room('ballroom'),room('nursery')]){
  // See emitted ceiling parts through a session with all other components disabled.
  const only={...r,forgeDecoration:{components:Object.fromEntries(['profiled-cornices','raised-wainscoting','carved-pilasters','pediment-surrounds','period-floor-inlays'].map(k=>[k,false]))}};
  const parts=build(only).parts.filter(p=>p.triangles);
  for(const p of parts)for(const v of vertices(p))if(v[1]>r.h-1)assert.ok(v[1]*FT>2.1);
 }
});

test('authored finish choices remain authoritative and carpet never receives parquet inlays',()=>{
 const r={...room(),flooring:'checker',finishes:{panel:'stone',trim:'silver',ceiling:'wood'}},before=structuredClone(r),t=architecturalTreatment(r);
 assert.equal(t.relief,MAT.stone);assert.equal(t.accent,MAT.silver);assert.equal(t.cofferMaterial,MAT.wood);assert.equal(roomFinish(r).floor,MAT.checker);build(r);assert.deepEqual(r,before);
 const carpet=build({...r,flooring:'carpet'});assert.ok(!carpet.report.emitted.some(c=>c.component==='period-floor-inlays'));
 const disabled={...room(),forgeDecoration:{architecture:false}};assert.equal(usesArchitecturalLuxury(disabled),false);assert.ok(!build(disabled).report.emitted.some(c=>c.component==='profiled-cornices'));
});

test('ornament budgets omit complete components and keep strict triangle/memory accounting',()=>{
 const r=room(),{parts,report}=build(r,{maxRoomTriangles:12,maxGeometryBytes:100});assert.equal(parts.length,0);assert.equal(report.used.geometryBytes,0);
 assert.ok(report.omitted.some(c=>c.reason.startsWith('BUDGET')));
 const ordinary=build(r);assert.equal(ordinary.parts.reduce((n,p)=>n+primitiveCost(p).triangles,0),ordinary.report.used.triangles);
 assert.ok(ordinary.parts.length<200,'profiled wall relief is material-batched');
});

test('marble and mahogany fireplace carving fits the original rotated collision volumes',()=>{
 for(const type of ['marble_fireplace','mahogany_fireplace'])for(const angle of [0,Math.PI/2,.7]){
  const spec=ROOM_FURNITURE[type],item={type,positionMeters:[4,3,5],rotationY:angle},parts=roomFurnitureParts(item),triangles=parts.reduce((n,p)=>n+(p.triangles?.length||12),0);
  assert.ok(triangles>350);assert.ok(parts.length<=5);
  for(const p of parts)for(const v of vertices(p)){
   const dx=v[0]-4,dz=v[2]-5,x=dx*Math.cos(angle)-dz*Math.sin(angle),z=dx*Math.sin(angle)+dz*Math.cos(angle);
   assert.ok(Math.abs(x)<=spec.footprint[0]/2+.001);assert.ok(Math.abs(z)<=spec.footprint[1]/2+.001);assert.ok(v[1]>=3-.001&&v[1]<=3+spec.height+.001);
  }
  assert.ok(parts.some(p=>p.mat===(type==='mahogany_fireplace'?MAT.wood:MAT.marble)));
 }
});

test('explicit fireplace finishes and new mahogany records retain authored furniture and hearth bindings',()=>{
 for(const [type,finish]of [['marble_fireplace','marble'],['marble_fireplace','mahogany'],['mahogany_fireplace','mahogany']]){
  const r={...room(),furniture:[{id:'authored-hearth',type,finishTreatment:finish,x:.18,y:.12}]},s=source(r),before=structuredClone(s),d=planDecoration(s),f=d.furniture.find(f=>f.id==='authored-hearth');
  assert.equal(f.type,type);assert.equal(f.finishTreatment,finish);assert.equal(f.authored,true);assert.deepEqual(f.source,r.furniture[0]);assert.ok(d.fireplaces.some(h=>h.roomId===r.id));assert.deepEqual(s,before);
 }
});

test('library shelving relief remains inside the existing padded clearance reservation',()=>{
 const r=room('library'),d=planDecoration(source(r)),only={...r,forgeDecoration:{components:Object.fromEntries(['profiled-cornices','raised-wainscoting','carved-pilasters','pediment-surrounds','coffered-ceilings','carved-medallions','period-floor-inlays','mansion-envelope'].map(k=>[k,false]))}},books=d.furniture.filter(f=>f.type==='bookcase');
 assert.ok(books.length);
 for(const f of books){
  const session=createRoomComponentSession(only);FORGE_COMPONENT_REGISTRY['carved-shelving-surrounds'].generate(only,0,session,{decoration:{furniture:[f]}});
  assert.ok(session.emitted.some(c=>c.component==='carved-shelving-surrounds'&&c.key===f.id));assert.ok(session.primitives.length>0);
  const spec=FORGE_COMPONENT_REGISTRY['furniture:bookcase'].specification,a=f.rotationY||0;
  for(const part of session.primitives)for(const point of vertices(part)){
   const v=point.map(n=>n*FT),dx=v[0]-f.positionMeters[0],dz=v[2]-f.positionMeters[2],x=dx*Math.cos(a)-dz*Math.sin(a),z=dx*Math.sin(a)+dz*Math.cos(a);
   assert.ok(Math.abs(x)<=(spec.footprint[0]+.18)/2+.001);assert.ok(Math.abs(z)<=(spec.footprint[1]+.18)/2+.001);
   assert.ok(v[1]>=f.positionMeters[1]-.001&&v[1]<=f.positionMeters[1]+spec.height+.001);
  }
 }
});

test('profiled triangle vertices use the same feet-to-meters conversion as structural boxes',()=>{
 const part={c:[10,11,12],s:[1,2,3],mat:MAT.wood,triangles:[[[10,11,12],[11,11,12],[10,12,12]]]},converted=architecturalPartMeters(part);
 assert.deepEqual(converted.c,[10,11,12].map(v=>v*FT));assert.deepEqual(converted.triangles[0][1],[11,11,12].map(v=>v*FT));assert.deepEqual(part.c,[10,11,12]);
});

test('combined two-story mansion exports all identities, bounded models and unchanged loading/navigation contracts',async()=>{
 const study=JSON.parse(await readFile(new URL('./fixtures/forge-luxury.json',import.meta.url),'utf8')),before=structuredClone(study),{house}=await compileFixture(study);
 assert.deepEqual(study,before);assert.equal(house.manifest.floors.length,2);assert.equal(house.rooms.length,11);assert.equal(house.playability.staticRoutesVerified,true);
 assert.equal(house.manifest.casa.specVersion,'1.0');assert.equal(house.manifest.version,'1.0-qa');assert.equal(house.manifest.forgeRevision,'whole-house-1');
 const budget=await house.json(house.manifest.packageBudget);assert.ok(budget.withinPlanningBudget,JSON.stringify(budget.issues));assert.ok(budget.components.withinLimits);
 for(const id of ['profiled-cornices','raised-wainscoting','pediment-surrounds'])assert.ok(!budget.components.omissions.some(o=>o.component===id&&o.reason.startsWith('BUDGET')));
 assert.ok(house.decoration.furniture.some(f=>f.id==='library-hearth'&&f.finishTreatment==='mahogany'));
 for(const model of budget.models){assert.ok(model.triangles<=450000);assert.ok(model.draws<=160);}
});


test('the marble treatment appends a palette slot and embeds its shared tile only when used',async()=>{
 const {glb}=await import('../casa_admin/forge_glb.mjs');
 assert.equal(MAT.sageDamask,29);assert.equal(MAT.marble,30);assert.equal(PALETTE[MAT.marble].rough,.62);
 const document=bytes=>JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+new DataView(bytes.buffer,bytes.byteOffset).getUint32(12,true))));
 const wood=document(glb([{c:[0,0,0],s:[1,1,1],mat:MAT.wood}]));assert.ok(!wood.images.some(i=>i.name==='Carrara fireplace marble'));
 const marble=document(glb(roomFurnitureParts({type:'marble_fireplace',positionMeters:[0,0,0]})));assert.ok(marble.images.some(i=>i.name==='Carrara fireplace marble'&&i.mimeType==='image/png'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {planDecoration,decorationBoxes} from '../casa_admin/forge_decoration_plan.mjs';
import {ROOM_PROFILES,planRoomContents} from '../casa_game/room_content.mjs';
import {ROOM_FURNITURE,roomFurnitureParts} from '../casa_admin/forge_room_furniture.mjs';
import {forgeInput} from '../casa_admin/batch.mjs';
import {compileFixture} from './helpers/compile-forge.mjs';
const room=(theme,i=0)=>({id:'r'+i,name:theme,roomTheme:theme,x:i*35,y:0,l:30,w:26,h:12,openings:[{id:'front',type:'door',wall:'top',pos:.5},{type:'window',wall:'left',pos:.5}]});
const source=r=>({name:'Mansion Detail',floors:[{name:'Main',rooms:[r]}]});
test('every room identity has portable detail, high fixtures and clear furnishing routes',()=>{
 for(const [i,theme]of Object.keys(ROOM_PROFILES).entries()){
  const r=room(theme,i),s=source(r),before=JSON.stringify(s),plan=planDecoration(s),c=plan.roomContents[0];
  assert.equal(c.edition,'whole-house-1');assert.ok(c.ornaments.some(o=>/chandelier|lantern|crown/.test(o.type)),theme);
  assert.ok(c.primitives.reduce((n,p)=>n+(p.triangles?.length||12),0)>500,theme);assert.ok(c.primitives.length<=420);assert.equal(JSON.stringify(s),before);
  for(const f of plan.furniture){const b=plan.colliders.find(c=>c.objectId===f.id).bounds;for(const a of plan.reserved.map(r=>r.bounds))assert.ok(!(a.minX<b.maxX&&a.maxX>b.minX&&a.minZ<b.maxZ&&a.maxZ>b.minZ),theme);}
  for(const p of decorationBoxes(plan)){assert.ok(p.c.every(Number.isFinite));assert.ok(p.s.every(n=>Number.isFinite(n)&&n>0));}
  for(const o of c.ornaments.filter(o=>o.type==='carved-wall-panel'||o.type==='velvet-and-gilt-overdoor'))assert.ok(o.positionMeters[1]-o.height/2>=2);
 }
});
test('all new heirlooms use the same geometry for their clearance footprint',()=>{
 for(const type of ['grandfather_clock','curio_cabinet','marble_fireplace','fern_urn']){const spec=ROOM_FURNITURE[type],parts=roomFurnitureParts({type,positionMeters:[0,0,0]});assert.ok(parts.reduce((n,p)=>n+(p.triangles?.length||12),0)>=240,type);for(const p of parts){assert.ok(Math.abs(p.c[0])+p.s[0]/2<=spec.footprint[0]/2+.01,type);assert.ok(Math.abs(p.c[2])+p.s[2]/2<=spec.footprint[1]/2+.01,type);assert.ok(p.c[1]+p.s[1]/2<=spec.height+.01,type);}}
});
test('large houses share a bounded dressing budget instead of starving the last rooms',()=>{
 const rooms=Array.from({length:100},(_,i)=>({...room('library',i),floor:0})),contents=planRoomContents(rooms,{furniture:[],artwork:[]});
 assert.ok(contents.reduce((n,c)=>n+c.primitives.length,0)<=14000);assert.ok(contents.at(-1).primitives.length>0);assert.deepEqual(contents,planRoomContents(rooms,{furniture:[],artwork:[]}));
});
test('low ceilings and circulation never receive hanging geometry in walking headroom',()=>{
 for(const h of [6.5,7.5,8,9]){const plan=planDecoration(source({...room('circulation'),l:5,h}));assert.equal(plan.furniture.length,0);for(const p of plan.roomContents[0].primitives)if(p.c[0]>0.6&&p.c[0]<.9)assert.ok(p.c[1]-p.s[1]/2>=1.85||p.s[1]<.03);}
});
test('CASA rebuild preserves published identity, chosen finishes and embedded source',async()=>{
 const {bytes,house}=await compileFixture(source(room('library')),{identity:{id:'house-published',name:'The Original',creator:'Ryan',desc:'A waiting room',exteriorStyle:'siding-plum',exteriorTrim:'gold',exteriorRoof:'moss'}});
 const row={source:new File([bytes],'published.casa'),edits:{name:'The Renamed'}},input=await forgeInput(row);
 assert.equal(input.edits.houseId,'house-published');assert.equal(input.edits.name,'The Renamed');assert.equal(input.edits.architect,'Ryan');assert.equal(input.edits.style,'siding-plum');assert.equal(input.edits.trim,'gold');assert.equal(input.edits.roof,'moss');assert.equal(JSON.parse(await input.source.text()).name,'Mansion Detail');
 assert.equal(house.manifest.forgeRevision,'whole-house-1');assert.ok(house.playability.staticRoutesVerified);assert.ok(house.decoration.lights.some(l=>l.id.endsWith(':chandelier')));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {planRoomThemes} from '../casa_admin/forge_room_themes.mjs';
import {planExterior,EXTERIOR_STYLES} from '../casa_admin/forge_exterior_style.mjs';
import {publicationFindings} from '../casa_admin/forge_build_report.mjs';
import {roomFinish} from '../casa_admin/forge_finishes.mjs';
import {glb,MAT} from '../casa_admin/forge_glb.mjs';
import {compileFixture} from './helpers/compile-forge.mjs';
const room=(id,x=0)=>({id,name:'Room '+id,type:'room',x,y:0,l:24,w:22,h:10,openings:[]});
const source=()=>({name:'Student rescue',floors:[{name:'Main',rooms:[room('a'),room('b',24),room('c',80)]},{name:'Upper',rooms:[room('d')]}]});
const documentOf=bytes=>JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+new DataView(bytes.buffer,bytes.byteOffset).getUint32(12,true))));
test('generic rooms get stable varied themes, authored rooms and narrow passages retain purpose',()=>{
 const s=source();s.floors[0].rooms.push({...room('lib',110),name:'Library'},{...room('narrow',140),l:4});const before=structuredClone(s),a=planRoomThemes(s),b=planRoomThemes(s);
 assert.deepEqual(s,before);assert.deepEqual(a,b);assert.ok(new Set(a.report.assignments.slice(0,3).map(r=>r.identity)).size>1);assert.equal(a.blueprint.floors[0].rooms[3].roomTheme,'library');assert.equal(a.blueprint.floors[0].rooms[4].roomTheme,'circulation');
 for(const r of a.blueprint.floors[0].rooms){const f=roomFinish(r);assert.ok(Number.isInteger(f.wall));if(r.roomTheme==='laboratory')assert.equal(f.wall,MAT.laboratory);}
});
test('all 14 exterior options embed the intended surface texture in actual GLBs',()=>{
 for(const [key,style]of Object.entries(EXTERIOR_STYLES)){const exterior=planExterior(source(),{style:key,trim:'white',roof:'moss'}),doc=documentOf(glb([{c:[0,0,0],s:[3,3,.1],mat:MAT.siding}],{exterior})),wall=doc.materials[MAT.siding];assert.equal(wall.name,style.label);assert.deepEqual(wall.pbrMetallicRoughness.baseColorFactor,style.color);assert.ok(wall.pbrMetallicRoughness.baseColorTexture);const texture=doc.textures[wall.pbrMetallicRoughness.baseColorTexture.index];assert.match(doc.images[texture.source].name,style.kind==='brick'?/brick/:style.kind==='stucco'?/stucco/:/clap|sid/i);}
 const authored={...source(),exterior:{style:'brick-buff',trim:'charcoal',roof:'burgundy'}};assert.equal(planExterior(authored).style,'brick-buff');assert.equal(planExterior(authored).trim,'charcoal');assert.deepEqual(planExterior(source()),planExterior(source()));assert.throws(()=>planExterior(source(),{style:'invalid'}),/Unknown/);
});
test('real incomplete student house compiles with connected doors, elevator rescues, themes and readable report',async()=>{
 const s=source(),{house}=await compileFixture(s,{identity:{exteriorStyle:'stucco-rose',exteriorTrim:'white',exteriorRoof:'charcoal'}}),report=await house.json(house.manifest.studentReport),themes=await house.json(house.manifest.roomThemes),exterior=await house.json(house.manifest.exteriorFinishes);
 assert.deepEqual(await house.json('source.haunt'),s);assert.equal(exterior.style,'stucco-rose');assert.equal(themes.assignments.length,4);assert.ok(report.repairs.some(r=>r.code==='ADD_MAIN_ENTRY'));assert.ok(report.repairs.some(r=>r.code==='ADD_CONNECTING_DOOR'));assert.equal(house.playability.staticRoutesVerified,true);assert.ok(house.access.stops.some(s=>s.componentRoomIds.includes('c')));assert.equal(report.renderedVerified,false);assert.equal(report.publicationBlocked,false,JSON.stringify(report.blockers));
 for(const content of house.decoration.roomContents){assert.equal(content.identity,themes.assignments.find(r=>r.roomId===content.roomId).identity);assert.ok(content.ornaments.length>0);assert.ok(content.discovery);}
 for(const file of ['geometry/floor_00.glb','exterior/street_preview.glb']){const doc=documentOf(await house.read(file));assert.equal(doc.materials[MAT.siding].name,'Dusty rose stucco');}
});
test('publication report blocks unresolved source problems and clearly identifies old packages',()=>{assert.equal(publicationFindings({publicationBlocked:true,summary:'Needs repairs',exterior:{label:'Brick'},repairs:[],stairs:[],themes:[],blockers:[{location:'a',message:'Overlapping rooms'}],roomFindings:[],pending:[]}).blocked,true);assert.match(publicationFindings(null).message,/recompile/);});

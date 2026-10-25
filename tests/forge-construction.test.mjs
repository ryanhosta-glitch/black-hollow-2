import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {compileFixture} from './helpers/compile-forge.mjs';
import {glb,MAT} from '../casa_admin/forge_glb.mjs';
import {architecturalDetails,exposedRuns} from '../casa_admin/forge_architecture.mjs';
import {wallMount} from '../casa_game/wall_mount.mjs';
import {planDecoration} from '../casa_admin/forge_decoration_plan.mjs';
import {openCasa} from '../casa_game/archive.mjs';
const room={id:'a',name:'Parlor',type:'room',x:0,y:0,l:20,w:16,h:10,openings:[{id:'entry',wall:'top',type:'door',pos:.5}]};
function doc(bytes){const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);return JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+view.getUint32(12,true))));}
function array(bytes,g,index){const a=g.accessors[index],v=g.bufferViews[a.bufferView],base=28+new DataView(bytes.buffer,bytes.byteOffset).getUint32(12,true);return new (a.componentType===5125?Uint32Array:Float32Array)(bytes.buffer,bytes.byteOffset+base+v.byteOffset+(a.byteOffset||0),a.count*({VEC3:3,VEC2:2,SCALAR:1}[a.type]));}
test('architectural triangles face outward and match declared normals, including rotated roof panels',()=>{
 const bytes=glb([{c:[0,0,0],s:[2,2,2],mat:0},{c:[3,2,1],s:[3,.2,4],mat:4,rot:.65}]),g=doc(bytes),p=array(bytes,g,0),n=array(bytes,g,1);
 for(const primitive of g.meshes[0].primitives){const ids=array(bytes,g,primitive.indices);for(let i=0;i<ids.length;i+=3){const [a,b,c]=[ids[i],ids[i+1],ids[i+2]].map(id=>Array.from(p.subarray(id*3,id*3+3))),u=b.map((v,j)=>v-a[j]),v=c.map((v,j)=>v-a[j]),cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];assert.ok(cross.reduce((sum,val,j)=>sum+val*n[ids[i]*3+j],0)>0);}}
 assert.ok(g.meshes[0].primitives.every(p=>p.attributes.TEXCOORD_0===2));assert.equal(g.images.length,2);assert.ok(g.images.every(i=>i.mimeType==='image/png'&&!i.uri));
 for(const m of g.materials.filter((m,i)=>i<=30&&m.pbrMetallicRoughness.baseColorTexture))assert.equal(m.pbrMetallicRoughness.baseColorFactor[0],1);
});
test('partially shared walls receive siding only on exposed runs; window and door apertures stay empty',()=>{
 const neighbor={...room,id:'b',x:20,y:4,w:8,openings:[]};assert.deepEqual(exposedRuns(room,'right',[room,neighbor]),[[0,4],[12,16]]);
 const floor={rooms:[room,neighbor]},parts=architecturalDetails(floor,0,[floor],[0]);
 const siding=parts.filter(p=>p.mat===MAT.siding);assert.ok(siding.length>0);
 assert.ok(!siding.some(p=>Math.abs(p.c[2]+.16)<.01&&Math.abs(p.c[0]-10)<p.s[0]/2&&p.c[1]-p.s[1]/2<7.9));
 assert.ok(!siding.some(p=>Math.abs(p.c[0]-20.16)<.01&&p.c[2]>4&&p.c[2]<12));
 const windowRoom={...room,openings:[{type:'window',wall:'top',pos:.5}]};assert.ok(architecturalDetails({rooms:[windowRoom]},0,[],[0]).some(p=>p.mat===MAT.glass));
});
test('wall props use solid wall spans or are omitted; invalid authored furniture is not exported',()=>{
 const tiny={...room,l:4,w:4,openings:['top','bottom','left','right'].map(wall=>({wall,type:'open',pos:.5,clearWidthMeters:2}))};assert.equal(wallMount(tiny),null);
 const mount=wallMount(room);assert.ok(mount);if(mount.wall==='top')assert.ok(Math.abs(mount.position[0]-3.048)>1);
 const decorated=planDecoration({floors:[{rooms:[{...room,furniture:[{id:'blocked',type:'table',x:.5,y:.1}]}]}]});assert.ok(decorated.issues.some(i=>i.code==='AUTHORED_FURNITURE_CLEARANCE'));assert.ok(!decorated.furniture.some(f=>f.id==='blocked'));
});
// Drive the actual embedded compiler, including its asset fetches, ZIP writer and admin handoff.
test('fresh Blueprint → actual Forge → Game archive includes embedded architectural materials and preserved elevator contracts',async()=>{
 const {house}=await compileFixture({name:'Victorian Regression',gameEntry:{roomId:'a',openingId:'entry'},floors:[{name:'Ground Floor',rooms:[room]}]});
 assert.equal(house.manifest.geometrySpace,'world');assert.equal(house.manifest.casa.geometryLevel,'victorian-textured-architecture-4.3');assert.ok(house.access.hiddenDestination);assert.ok(house.access.stops.length);assert.ok(house.playability.staticRoutesVerified);
 for(const path of [house.manifest.floors[0].model,house.manifest.casa.streetPreview,house.manifest.roof]){const g=doc(await house.read(path));assert.ok(g.images.length);assert.ok(g.meshes[0].primitives.some(p=>g.accessors[p.indices].count>0));}
 for(const [path,entry]of house.entries)assert.ok((await house.read(path)).length===entry.size);
});
test('all three shipped Blueprint fixtures recompile without overwriting their published CASA archives',async()=>{
 for(const file of ['one-room','moonveil','split-lantern']){
  const existing=await openCasa(new Uint8Array(await readFile(new URL('../casa_game/samples/'+file+'.casa',import.meta.url)))),source=await existing.json(existing.manifest.casa?.source||'source.haunt');
  const {house}=await compileFixture(source);assert.equal(house.rooms.length,existing.rooms.length);assert.ok(house.playability.staticRoutesVerified);assert.ok(house.manifest.floors.every(f=>house.entries.has(f.model)));
 }
});
test('fresh architectural GLB loads through the real Game resource loader with visible floors, walls, ceilings and an open doorway',async()=>{
 const THREE=await import('three'),{GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js'),{createPackageAssets,disposeGroup}=await import('../casa_game/resources.mjs');
 class Image {constructor(){this.width=this.height=128;this.events=new Map();}addEventListener(k,fn){this.events.set(k,fn);}removeEventListener(k){this.events.delete(k);}set src(_){queueMicrotask(()=>this.events.get('load')?.());}}
 // Node has no PNG decoder. Stub only image decoding; geometry, materials, GLTF parsing,
 // package reads and raycasts are real. The embedded PNG signatures are checked below.
 const previousDocument=globalThis.document,previousSelf=globalThis.self;globalThis.document={createElementNS:()=>new Image()};globalThis.self=globalThis;
 let assets,root;
 try{
  const {house}=await compileFixture({name:'Visible Architecture',floors:[{rooms:[room]}]});assets=createPackageAssets(house,{THREE,GLTFLoader});root=await assets.glb(house.manifest.floors[0].model);root.updateMatrixWorld(true);
  const hits=(origin,direction,far)=>new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction),0,far).intersectObject(root,true);
  assert.ok(hits([3.048,1,2],[0,-1,0],1.2).length,'floor exists below player');
  assert.ok(hits([.5,1,2],[-1,0,0],.7).length,'wall exists beside player');
  assert.ok(hits([3.048,1,2],[0,1,0],2.2).length,'ceiling exists above player');
  assert.equal(hits([3.048,1,.4],[0,0,-1],.65).length,0,'doorway is clear');
  let mapped=0;root.traverse(o=>{if(o.isMesh)for(const m of [].concat(o.material))if(m.map)mapped++;});assert.ok(mapped>=3,'architectural material textures load');
  const bytes=await house.read(house.manifest.floors[0].model),g=doc(bytes),bin=28+new DataView(bytes.buffer,bytes.byteOffset).getUint32(12,true);
  for(const image of g.images){const start=bin+g.bufferViews[image.bufferView].byteOffset;assert.deepEqual([...bytes.subarray(start,start+8)],[137,80,78,71,13,10,26,10]);}
 }finally{if(root)disposeGroup(root);assets?.close();globalThis.document=previousDocument;globalThis.self=previousSelf;}
});

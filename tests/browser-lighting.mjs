// Same source, renderer, cameras and lighting for the Pass 3 / Pass 4 comparison.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
const current=fileURLToPath(new URL('../',import.meta.url)),root=process.env.FORGE_LIGHTING_ROOT||current;
const edition=process.env.FORGE_LIGHTING_EDITION||'after',out=process.env.FORGE_LIGHTING_OUTPUT||path.join(current,'tests/artifacts/lighting',edition);
await mkdir(out,{recursive:true});
const source=JSON.parse(await readFile(new URL('./fixtures/forge-luxury.json',import.meta.url),'utf8'));
const {compileFixture}=await import(pathToFileURL(path.join(root,'tests/helpers/compile-forge.mjs')).href);
const {bytes,house}=await compileFixture(source);
await writeFile(path.join(out,'study.casa'),bytes);
const server=http.createServer(async(req,res)=>{try{
 const url=decodeURIComponent(req.url.split('?')[0]);
 if(url==='/favicon.ico'){res.writeHead(204);res.end();return;}
 if(url==='/__study.casa'){res.end(bytes);return;}
 if(url==='/__viewer.html'){res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html><head><style>body{margin:0;background:#161219}canvas{display:block}</style><script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script></head><body><script type="module">
 import * as THREE from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
 import {createAtmosphere} from '/casa_game/atmosphere.mjs';import {selectHouseLights} from '/casa_game/house_lighting.mjs';import {openCasa} from '/casa_game/archive.mjs';import {createPackageAssets,createFloorStreamer} from '/casa_game/resources.mjs';
 const house=await openCasa(await(await fetch('/__study.casa')).arrayBuffer()),assets=createPackageAssets(house,{THREE,GLTFLoader}),stream=createFloorStreamer(house,assets,THREE),scene=new THREE.Scene();
 scene.background=new THREE.Color('#101621');scene.fog=new THREE.FogExp2(0x101621,.0015);const camera=new THREE.PerspectiveCamera(74,1200/800,.02,100),renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(1200,800);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;document.body.append(renderer.domElement);
 let atmosphere,atmosphereQuality=null,quality='cinematic';renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 let group;window.__lighting={house,async view(identity,detail='room',preset='cinematic'){quality=preset;if(!atmosphere||atmosphereQuality!==quality){atmosphere?.dispose();atmosphere=createAtmosphere(THREE,{scene,audio:{},reducedMotion:true,quality});atmosphereQuality=quality;}renderer.shadowMap.enabled=quality==='cinematic';if(quality==='performance')scene.environment=null;
  const room=house.rooms.find(r=>r.id===identity),b=room.boundsFeet,y=house.manifest.floors[room.floor].elevationMeters,x=b.x*.3048,z=b.y*.3048,w=b.l*.3048,d=b.w*.3048,h=b.h*.3048;
  if(group)scene.remove(group);group=await stream.get(room.floor);scene.add(group);camera.fov=detail==='room'?78:58;
  const framing={room:[[x+w*.12,y+1.62,z+d*.84],[x+w*.55,y+1.75,z+d*.24]],panels:[[x+w*.5,y+1.35,z+d*.59],[x+w*.9,y+1.20,z+d*.65]],ceiling:[[x+w*.25,y+1.65,z+d*.75],[x+w*.50,y+h-.12,z+d*.37]],door:[[x+w*.34,y+1.58,z+d*.36],[x+w*.5,y+2.13,z+.03]]};
  let [position,target]=framing[detail]||framing.room;
 if(detail==='corner'){position=[x+w*.32,y+1.62,z+d*.35];target=[x+w*.04,y+1.3,z+d*.04];}
 if(detail==='window'){position=[x+w*.55,y+1.62,z+d*.56];target=[x+w*.5,y+1.8,z+d];}
 if(detail==='task'){const f=house.decoration.furniture.find(f=>f.roomId===identity&&['writing_desk','laboratory_bench'].includes(f.type));if(f){const a=f.rotationY||0,c=Math.cos(a),s=Math.sin(a);position=[Math.max(x+.18,Math.min(x+w-.18,f.positionMeters[0]+1.0*c+1.35*s)),y+1.62,Math.max(z+.18,Math.min(z+d-.18,f.positionMeters[2]-1.0*s+1.35*c))];target=f.positionMeters.map((v,k)=>k===1?v+1:v);}}
  if(detail==='fireplace'){const f=house.decoration.furniture.find(f=>f.roomId===identity&&f.type.includes('fireplace'));if(!f)throw Error('Missing study fireplace');const [fx,fy,fz]=f.positionMeters,a=f.rotationY||0;position=[fx+Math.sin(a)*2.3,fy+1.02,fz+Math.cos(a)*2.3];target=[fx,fy+.8,fz];}
  camera.position.set(...position);camera.lookAt(...target);const specs=selectHouseLights(house,{roomId:room.id,floor:room.floor,position,quality});atmosphere.configure({kind:'house',seed:1,lightSpecs:specs,fireplaces:(house.decoration.fireplaces||[]).filter(f=>f.roomId===room.id).map(f=>f.positionMeters)});camera.updateProjectionMatrix();const compileStart=performance.now();await renderer.compileAsync(scene,camera);const compileMs=performance.now()-compileStart,renderStart=performance.now();renderer.render(scene,camera);
  const gl=renderer.getContext();gl.finish();const firstFrameMs=performance.now()-renderStart;let undecoded=0;group.traverse(o=>{for(const m of [].concat(o.material||[]))if(m.map&&!m.map.image?.width)undecoded++;});
  const draws=renderer.info.render.calls,triangles=renderer.info.render.triangles;const pixels=new Uint8Array(1200*800*4);gl.readPixels(0,0,1200,800,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let floorLuma=0,n=0,dark=0,bright=0;for(let py=0;py<800;py+=4)for(let px=0;px<1200;px+=4){const i=(py*1200+px)*4,l=.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2];if(l<12)dark++;if(l>248)bright++;if(py<160&&px>240&&px<960){floorLuma+=l;n++;}}const times=[];for(let k=0;k<6;k++){const start=performance.now();renderer.render(scene,camera);gl.finish();times.push(performance.now()-start);}times.sort((a,b)=>a-b);const active=[];scene.traverse(o=>{if((o.isPointLight||o.isSpotLight)&&o.visible)active.push({intensity:o.intensity,shadow:o.castShadow,type:o.isSpotLight?'spot':'point',shadowPixels:o.shadow?.map?o.shadow.map.width*o.shadow.map.height:0});});return{identity,detail,quality,draws,triangles,undecoded,compileMs,firstFrameMs,gpuGeometries:renderer.info.memory.geometries,gpuTextures:renderer.info.memory.textures,shaderPrograms:renderer.info.programs.length,selected:specs.map(s=>({id:s.id,role:s.role,color:s.color})),activeLights:active.length,activePoints:active.filter(l=>l.type==='point').length,activeSpots:active.filter(l=>l.type==='spot').length,shadowLights:active.filter(l=>l.shadow).length,shadowPixels:active.reduce((n,l)=>n+l.shadowPixels,0),floorLuma:floorLuma/n,darkFraction:dark/(300*200),brightFraction:bright/(300*200),medianFrameMs:times[3],maxFrameMs:times.at(-1)};
 },close(){atmosphere?.dispose();stream.clear();assets.close();renderer.dispose();renderer.forceContextLoss()}};
 </script></body></html>`);return;}
 const file=path.join(root,url);if(path.relative(root,file).startsWith('..'))throw Error('outside root');res.setHeader('Content-Type',/\.(mjs|js)$/.test(file)?'text/javascript':file.endsWith('.png')?'image/png':file.endsWith('.webp')?'image/webp':'application/octet-stream');res.end(await readFile(file));
 }catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;const errors=[],views=[];
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1200,height:800}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(`http://127.0.0.1:${server.address().port}/__viewer.html`);await page.waitForFunction(()=>window.__lighting,null,{timeout:120000});
 const captures=source.floors.flatMap(f=>f.rooms.map(r=>[r.id,'room'])).concat([['ballroom','ceiling'],['library','corner'],['library','task'],['conservatory','window'],['parlor','fireplace']]);
 for(const quality of ['cinematic','performance'])for(const [identity,detail]of captures){const stats=await page.evaluate(([r,d,q])=>window.__lighting.view(r,d,q),[identity,detail,quality]);assert.equal(stats.undecoded,0);assert.ok(stats.draws>0&&stats.draws<180,JSON.stringify(stats));if(edition==='after'){assert.ok(stats.activeLights<=(quality==='performance'?2:3));assert.ok(quality==='cinematic'||stats.shadowLights===0);if(detail==='room'){assert.ok(stats.floorLuma>=12&&stats.floorLuma<=235,JSON.stringify(stats));}assert.ok(stats.brightFraction<.15,JSON.stringify(stats));}views.push(stats);await page.locator('canvas').screenshot({path:path.join(out,quality+'-'+identity+'-'+detail+'.png'),timeout:120000});console.log(edition,quality,identity,detail,stats.draws,stats.floorLuma.toFixed(1));}
 assert.equal(house.playability.staticRoutesVerified,true);assert.deepEqual(errors,[]);
 const budget=await house.json(house.manifest.packageBudget),report={edition,browser:await browser.version(),webgl:true,compiledBytes:bytes.length,views,budget,errors};
 await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));await page.evaluate(()=>window.__lighting.close());
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}

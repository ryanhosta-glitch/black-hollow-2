// Same source, renderer, cameras and lighting for the Pass 1 / Pass 2 comparison.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright-core';
const current=fileURLToPath(new URL('../',import.meta.url)),root=process.env.FORGE_LUXURY_ROOT||current;
const edition=process.env.FORGE_LUXURY_EDITION||'after',out=process.env.FORGE_LUXURY_OUTPUT||path.join(current,'tests/artifacts/luxury',edition);
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
 import {createReflectionVault} from '/casa_game/surface_finish.mjs';import {openCasa} from '/casa_game/archive.mjs';import {createPackageAssets,createFloorStreamer} from '/casa_game/resources.mjs';
 const house=await openCasa(await(await fetch('/__study.casa')).arrayBuffer()),assets=createPackageAssets(house,{THREE,GLTFLoader}),stream=createFloorStreamer(house,assets,THREE),scene=new THREE.Scene();
 scene.background=new THREE.Color('#211d22');scene.environment=createReflectionVault(THREE);scene.environmentIntensity=.3;const camera=new THREE.PerspectiveCamera(74,1200/800,.02,100),renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(1200,800);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;document.body.append(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xd8e6ef,0x5a4040,2.2));const key=new THREE.DirectionalLight(0xffe4bd,2.2);key.position.set(2,5,1);scene.add(key);const fill=new THREE.DirectionalLight(0xbacfe8,1);fill.position.set(-2,3,-3);scene.add(fill);
 let group;window.__luxury={house,async view(identity,detail='room'){
  const room=house.rooms.find(r=>r.id===identity),b=room.boundsFeet,y=house.manifest.floors[room.floor].elevationMeters,x=b.x*.3048,z=b.y*.3048,w=b.l*.3048,d=b.w*.3048,h=b.h*.3048;
  if(group)scene.remove(group);group=await stream.get(room.floor);scene.add(group);camera.fov=detail==='room'?78:58;
  const framing={room:[[x+w*.12,y+1.62,z+d*.84],[x+w*.55,y+1.75,z+d*.24]],panels:[[x+w*.5,y+1.35,z+d*.59],[x+w*.9,y+1.20,z+d*.65]],ceiling:[[x+w*.25,y+1.65,z+d*.75],[x+w*.50,y+h-.12,z+d*.37]],door:[[x+w*.34,y+1.58,z+d*.36],[x+w*.5,y+2.13,z+.03]]};
  let [position,target]=framing[detail]||framing.room;
  if(detail==='fireplace'){const f=house.decoration.furniture.find(f=>f.roomId===identity&&f.type.includes('fireplace'));if(!f)throw Error('Missing study fireplace');const [fx,fy,fz]=f.positionMeters,a=f.rotationY||0;position=[fx+Math.sin(a)*2.3,fy+1.02,fz+Math.cos(a)*2.3];target=[fx,fy+.8,fz];}
  camera.position.set(...position);camera.lookAt(...target);camera.updateProjectionMatrix();await renderer.compileAsync(scene,camera);renderer.render(scene,camera);
  const gl=renderer.getContext();gl.finish();let undecoded=0;group.traverse(o=>{for(const m of [].concat(o.material||[]))if(m.map&&!m.map.image?.width)undecoded++;});
  return{identity,detail,draws:renderer.info.render.calls,triangles:renderer.info.render.triangles,undecoded};
 },close(){stream.clear();assets.close();renderer.dispose();renderer.forceContextLoss()}};
 </script></body></html>`);return;}
 const file=path.join(root,url);if(path.relative(root,file).startsWith('..'))throw Error('outside root');res.setHeader('Content-Type',/\.(mjs|js)$/.test(file)?'text/javascript':file.endsWith('.png')?'image/png':file.endsWith('.webp')?'image/webp':'application/octet-stream');res.end(await readFile(file));
 }catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;const errors=[],views=[];
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1200,height:800}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(`http://127.0.0.1:${server.address().port}/__viewer.html`);await page.waitForFunction(()=>window.__luxury,null,{timeout:120000});
 const captures=source.floors.flatMap(f=>f.rooms.map(r=>[r.id,'room'])).concat([['parlor','panels'],['ballroom','ceiling'],['parlor','fireplace'],['library','fireplace'],['dining','door']]);
 for(const [identity,detail]of captures){const stats=await page.evaluate(([r,d])=>window.__luxury.view(r,d),[identity,detail]);assert.equal(stats.undecoded,0);assert.ok(stats.draws>0&&stats.draws<160,JSON.stringify(stats));views.push(stats);await page.locator('canvas').screenshot({path:path.join(out,identity+'-'+detail+'.png'),timeout:120000});console.log(edition,identity,detail,stats.draws,stats.triangles);}
 assert.equal(house.playability.staticRoutesVerified,true);assert.deepEqual(errors,[]);
 const budget=await house.json(house.manifest.packageBudget),report={edition,browser:await browser.version(),webgl:true,compiledBytes:bytes.length,views,budget,errors};
 await writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));await page.evaluate(()=>window.__luxury.close());
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}

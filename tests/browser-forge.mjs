// Optional real Chromium/WebGL regression: npm run test:browser.
// CHROMIUM_PATH can select an existing browser; CHROMIUM_ARGS is a JSON array.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import http from 'node:http';import path from 'node:path';
import {chromium as pw} from 'playwright-core';
const root=fileURLToPath(new URL('../',import.meta.url)),output=process.env.FORGE_BROWSER_OUTPUT||path.join(root,'tests/artifacts');await mkdir(output,{recursive:true});let freshBytes;
const source={name:'Victorian Visual Estate',gameEntry:{roomId:'library',openingId:'entry'},floors:[{name:'Ground floor',rooms:['Library','Laboratory','Bedroom','Ballroom','Crypt','Conservatory'].map((name,i)=>({id:name.toLowerCase(),name,type:'room',x:(i%3)*22,y:Math.floor(i/3)*20,l:22,w:20,h:12,roofType:i===3?'mansard':'gable',dormers:i===2?2:0,openings:[{id:i===0?'entry':'win'+i,type:i===0?'door':'window',wall:'top',pos:.5}]}))},{name:'Upper tower',rooms:[{id:'upper',name:'Upper Bedroom',type:'room',x:0,y:0,l:14,w:14,h:10,roofType:'tower',openings:[{id:'wup',wall:'top',type:'window',pos:.5}]}]}]};
const server=http.createServer(async(req,res)=>{try{
 const url=decodeURIComponent(req.url.split('?')[0]);if(url==='/__fresh.casa'){res.end(freshBytes);return;}
 const file=path.join(root,url),relative=path.relative(root,file);if(relative.startsWith('..')){res.writeHead(403);res.end();return;}
 let body=await readFile(file);
 // Test-only access to the actual application. No hooks are written to production modules.
 if(url==='/casa_game/main.mjs')body=Buffer.from(body.toString()+`
window.__forgeBrowser={loadHouse:(d,o)=>loadHouse(d,{classic:true,...o}),houseScene,signatureScene,nearestAction,get house(){return house},get session(){return session},get walker(){return walker},get mode(){return mode},get busy(){return busy},get dialog(){return dialog},get camera(){return camera},get markers(){return markers},get atmosphere(){return atmosphere},pose};`);
 res.setHeader('Content-Type',file.endsWith('.mjs')||file.endsWith('.js')?'text/javascript':file.endsWith('.html')?'text/html':file.endsWith('.webp')?'image/webp':'application/octet-stream');res.end(body);
}catch{res.writeHead(404);res.end('missing');}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const args=process.env.CHROMIUM_ARGS?JSON.parse(process.env.CHROMIUM_ARGS):['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
const browser=await pw.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args,headless:true});
let page;const errors=[];
try{page=await browser.newPage({viewport:{width:1280,height:1000}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**',async route=>{const relative=route.request().url().split('three@0.170.0/')[1];await route.fulfill({body:await readFile(path.join(root,'node_modules/three',relative)),contentType:'text/javascript'});});
 await page.goto(base+'/casa_admin/compiler.html');
 await page.locator('#haunt:not([disabled])').waitFor();await page.locator('#haunt').setInputFiles({name:'visual.haunt',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(source))});
 await page.waitForFunction(()=>!document.getElementById('build').disabled);
 const downloadPromise=page.waitForEvent('download');await page.locator('#build').click();const download=await downloadPromise;await download.saveAs(path.join(output,'visual.casa'));freshBytes=await readFile(path.join(output,'visual.casa'));
 await page.waitForFunction(()=>!document.getElementById('preview').disabled);await page.locator('#preview').click();await page.waitForFunction(()=>document.querySelector('#previewCanvas canvas'));await page.waitForFunction(()=>document.querySelector('#previewCanvas select')?.disabled===false);
 const canvas=page.locator('#previewCanvas canvas'),selectors=page.locator('#previewCanvas select');await page.locator('#previewCanvas').scrollIntoViewIfNeeded();
 assert.equal(await canvas.getAttribute('data-undecoded'),'0');await page.locator('#previewCanvas').screenshot({path:path.join(output,'exterior.png')});
 await selectors.first().selectOption('0');await page.waitForFunction(()=>!document.querySelector('#previewCanvas select').disabled);assert.equal(await canvas.getAttribute('data-undecoded'),'0');
 await page.locator('#previewCanvas').screenshot({path:path.join(output,'interior-cutaway.png')});
 await selectors.nth(1).selectOption('library');await page.getByText('Cutaway',{exact:true}).locator('input').uncheck();await page.locator('#previewCanvas').screenshot({path:path.join(output,'library.png')});
 await page.getByText('Scare locations',{exact:true}).locator('input').check();assert.ok(Number(await canvas.getAttribute('data-scare-sites'))>0);await page.locator('#previewCanvas').screenshot({path:path.join(output,'scare-location-guides.png')});await page.getByText('Scare locations',{exact:true}).locator('input').uncheck();
 const inspection=await canvas.screenshot();await page.getByText('Haunted lighting',{exact:true}).locator('input').check();assert.equal(await canvas.getAttribute('data-lighting'),'haunted');assert.notDeepEqual(await canvas.screenshot(),inspection);await page.locator('#previewCanvas').screenshot({path:path.join(output,'library-haunted-lighting.png')});await page.getByText('Haunted lighting',{exact:true}).locator('input').uncheck();assert.equal(await canvas.getAttribute('data-lighting'),'inspection');
 await page.getByText('Collision guides',{exact:true}).locator('input').check();await page.locator('#previewCanvas').screenshot({path:path.join(output,'collision-guides.png')});
 await selectors.first().selectOption('assembly');await page.waitForFunction(()=>!document.querySelector('#previewCanvas select').disabled);await page.locator('#previewCanvas label').filter({hasText:/Roof/}).locator('input').uncheck();
 await selectors.first().selectOption('1');await page.waitForFunction(()=>!document.querySelector('#previewCanvas select').disabled);assert.equal(await canvas.getAttribute('data-undecoded'),'0');
 const previewSummary=await page.locator('#previewCanvas output').textContent();
 const sharedWallMaterials=await page.evaluate(async()=>{
  const THREE=await import('three'),{GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js'),{openCasa}=await import('/casa_game/archive.mjs'),{createPackageAssets,createFloorStreamer,disposeGroup}=await import('/casa_game/resources.mjs'),house=await openCasa(await (await fetch('/__fresh.casa')).arrayBuffer()),assets=createPackageAssets(house,{THREE,GLTFLoader}),model=await assets.glb(house.manifest.floors[0].model),wall=22*.3048;
  const sample=(x,y,dx)=>new THREE.Raycaster(new THREE.Vector3(x,y,1.2),new THREE.Vector3(dx,0,0),0,.6).intersectObject(model,true)[0]?.object.material.name;
  const stream=createFloorStreamer(house,assets,THREE),floor=await stream.get(0),decoration=floor.children.at(-1),bounds=new THREE.Box3().setFromObject(decoration),b=house.decoration.bounds;
  if(bounds.min.x<b.minX-.061||bounds.max.x>b.maxX+.061||bounds.min.z<b.minZ-.061||bounds.max.z>b.maxZ+.061)throw Error('Indoor decoration leaks exterior path triangles');
  stream.clear();
  const result=[sample(wall-.5,1.6,1),sample(wall+.5,1.6,-1),sample(wall-.5,.5,1),sample(wall+.5,.5,-1)];disposeGroup(model);assets.close();return result;
 });
 assert.deepEqual(sharedWallMaterials,['library emerald damask','laboratory glazed ivory tile','worn mahogany veneer','laboratory glazed ivory tile']);

 await page.goto(base+'/casa_game.html');await page.waitForFunction(()=>!document.getElementById('startStreet').disabled);await page.locator('#startStreet').click();await page.waitForFunction(()=>window.__forgeBrowser?.mode==='street'&&!window.__forgeBrowser.busy&&window.__forgeBrowser.walker?.active);
 await page.evaluate(async()=>{await window.__forgeBrowser.loadHouse({id:'browser-fresh',name:'Victorian Visual Estate',package:'/__fresh.casa'});});if(await page.locator('#closeModal').isVisible())await page.locator('#closeModal').click();
 assert.equal(await page.evaluate(()=>window.__forgeBrowser.mode),'hall');
 await page.evaluate(()=>{window.__forgeBrowser.walker.setCameraMode('first');window.__forgeBrowser.walker.setPosition(0,0,-9,Math.PI);});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:path.join(output,'creepy-gallery.png')});
 await page.evaluate(()=>window.__forgeBrowser.walker.setPosition(0,5.25,10.3,Math.PI));
 await page.waitForFunction(()=>window.__forgeBrowser.markers.children.find(g=>g.name==='Automatic elevator entrance')?.userData.open===1);
 await page.screenshot({path:path.join(output,'automatic-elevator.png')});

 // Walk the physical Hall staircase, using real animation frames and the real camera.
 await page.evaluate(()=>window.__forgeBrowser.walker.setPosition(4.5,0,3.5,Math.PI));await page.keyboard.down('w');
 try{await page.waitForFunction(()=>window.__forgeBrowser.pose().position[1]>5.249,{},{timeout:60000});}catch(error){console.log('HALL FAILURE',await page.evaluate(()=>({pose:window.__forgeBrowser.pose(),active:window.__forgeBrowser.walker.active,busy:window.__forgeBrowser.busy,dialog:window.__forgeBrowser.dialog,modal:document.getElementById('modal').hidden})),errors);await page.screenshot({path:path.join(output,'hall-failure.png')});throw error;}finally{await page.keyboard.up('w');}
 const stairHeight=await page.evaluate(()=>window.__forgeBrowser.pose().position[1]);assert.ok(Math.abs(stairHeight-5.25)<.002);
 await page.screenshot({path:path.join(output,'hall-stairs.png')});
 await page.evaluate(()=>window.__forgeBrowser.walker.setPosition(4.5,5.25,11.65,Math.PI/2));await page.keyboard.down('w');try{await page.waitForFunction(()=>Math.abs(window.__forgeBrowser.pose().position[0])<.35,{},{timeout:60000});}finally{await page.keyboard.up('w');}
 await page.evaluate(()=>window.__forgeBrowser.walker.setPosition(...window.__forgeBrowser.walker.position,Math.PI));await page.keyboard.down('w');try{await page.waitForFunction(()=>window.__forgeBrowser.mode==='cabin',{},{timeout:30000});}finally{await page.keyboard.up('w');}if(await page.locator('#closeModal').isVisible())await page.locator('#closeModal').click();
 await page.evaluate(async()=>{await window.__forgeBrowser.signatureScene('hall',[0,0,11],Math.PI);window.__forgeBrowser.walker.setCameraMode('first');});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:path.join(output,'hall-rear-door-and-banister.png')});

 for(const floor of [0,1])await page.evaluate(async floor=>{const g=window.__forgeBrowser,r=g.house.rooms.find(r=>r.floor===floor),s=g.house.access.stops.find(s=>s.floor===floor);await g.houseScene(r,s.approachMeters);},floor);
 await page.screenshot({path:path.join(output,'game-upper-floor.png')});
 assert.deepEqual(errors,[]);const report={sharedWallMaterials,browser:await browser.version(),webgl:true,errors,previewSummary,compiledBytes:freshBytes.length,physicalHallStairHeight:stairHeight,checked:['UI blueprint compilation and CASA download','PNG and WebP texture decoding','exterior roofs and interior floor views','room inspection and cutaway toggle','collision guides and floor visibility controls','fresh CASA loaded in actual Game','physical Hall stair ascent','fresh lower and upper house floors']};await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}catch(error){await writeFile(path.join(output,'forge-failure.json'),JSON.stringify({error:String(error),errors,state:await page?.evaluate(()=>({pose:window.__forgeBrowser?.pose(),active:window.__forgeBrowser?.walker?.active,mode:window.__forgeBrowser?.mode,busy:window.__forgeBrowser?.busy,dialog:window.__forgeBrowser?.dialog,modalHidden:document.getElementById('modal')?.hidden,modalTitle:document.getElementById('modalTitle')?.textContent,toast:document.getElementById('toast')?.textContent})).catch(()=>null)},null,2));await page?.screenshot({path:path.join(output,'forge-failure.png')}).catch(()=>{});throw error;}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}

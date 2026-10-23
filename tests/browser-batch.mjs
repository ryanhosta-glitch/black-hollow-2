import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';
const root=fileURLToPath(new URL('../',import.meta.url));
const server=http.createServer(async(req,res)=>{try{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(path.relative(root,file).startsWith('..'))throw Error();res.setHeader('Content-Type',/\.(mjs|js)$/.test(file)?'text/javascript':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});const context=await browser.newContext();const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/casa_admin.html`);await page.waitForFunction(()=>document.querySelector('#compiler').contentWindow.blackHollowCompile);
 const source=i=>({name:'Batch Mansion '+i,floors:[{name:'Main',rooms:[{id:'entry',x:0,y:0,l:24,w:24,h:11,openings:[]}]}]});
 await page.locator('#batchFiles').setInputFiles([...Array.from({length:34},(_,i)=>({name:`student-${i}.haunt`,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(source(i)))})),{name:'broken.haunt',mimeType:'application/json',buffer:Buffer.from('{broken')}]);
 await page.waitForFunction(()=>document.querySelector('#batchRows').children.length===35);
 await page.locator('#batchBuild').click();await page.waitForFunction(()=>document.querySelector('#batchSummary').textContent.includes('34 prepared · 1 need attention'),{},{timeout:180000});
 assert.match(await page.locator('#batchRows').textContent(),/broken.haunt — failed/);
 assert.equal(await page.locator('#batchPublish').isEnabled(),true);
 await page.reload();await page.waitForFunction(()=>document.querySelector('#batchSummary').textContent.includes('34 prepared · 1 need attention'));
 await page.locator('#batchTest').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('34 houses added'),{},{timeout:90000});
 const total=await page.evaluate(async()=>{const {createCatalog}=await import('./casa_game/catalog.mjs');const catalog=createCatalog();await catalog.init();return catalog.list().filter(h=>h.name.startsWith('Batch Mansion')).length;});assert.equal(total,34);
 await page.locator('#batchPublish').click();assert.match(await page.locator('#batchConfirmationText').textContent(),/34 prepared mansions/);
 assert.deepEqual(errors,[]);console.log('PASS: 34 real Forge exports, invalid-file isolation, persisted queue after reload, all 34 imported into Game catalog and batch publication review.');
}finally{await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}

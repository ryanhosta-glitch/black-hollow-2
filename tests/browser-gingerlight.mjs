import {chromium} from 'playwright-core';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL,fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:process.env.GINGER_CHROMIUM_PATH||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.route(/^https?:/,r=>{requests.push(r.request().url());return r.abort();});
try{
 await page.goto(pathToFileURL(fileURLToPath(new URL('../north_pole/gingerlight_studio_standalone.html',import.meta.url))).href);
 await page.waitForFunction(()=>!document.getElementById('save').disabled);
 for(const style of ['winter','sugarplum','peppermint']){await page.selectOption('#style',style);await page.click('#bake');await page.waitForFunction(()=>!document.getElementById('bake').disabled);assert.equal(await page.locator('#error').innerText(),'');}
 await page.check('#anchors');
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('#save')]);const path=await download.path(),bytes=await readFile(path),pkg=JSON.parse(bytes);
 assert.equal(pkg.format,'gingerlight-exterior');assert.ok(pkg.anchors.length>20);assert.ok(pkg.report.decorativeSweets>100);
 await page.setInputFiles('#houseFile',{name:'roundtrip.ginger',mimeType:'application/json',buffer:bytes});await page.waitForFunction(()=>!document.getElementById('houseFile').disabled);assert.equal(await page.locator('#error').innerText(),'');
 const fixture=JSON.parse(await readFile(new URL('fixtures/test-houses/moonveil.json',import.meta.url),'utf8')),moonveil=Buffer.from(JSON.stringify(fixture.source));await page.setInputFiles('#houseFile',{name:'moonveil.haunt',mimeType:'application/json',buffer:moonveil});await page.waitForFunction(()=>!document.getElementById('houseFile').disabled);assert.equal(await page.locator('#error').innerText(),'');
 const [real]=await Promise.all([page.waitForEvent('download'),page.click('#save')]);const realPackage=JSON.parse(await readFile(await real.path()));assert.ok(realPackage.report.rooms>0);
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 const evidence={status:'PASS',networkRequests:requests.length,browserErrors:errors.length,roundtripAttachments:pkg.anchors.length,realHouse:realPackage.name,realHouseRooms:realPackage.report.rooms};
 await mkdir(new URL('artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('artifacts/gingerlight-browser.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence));
}finally{await browser.close();}

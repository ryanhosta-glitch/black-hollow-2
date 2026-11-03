import {chromium} from 'playwright-core';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.GINGER_CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const html=await readFile(process.env.GINGER_FIRST_SHOW_FILE||'north_pole/student_preview.html','utf8');
await mkdir('tests/artifacts',{recursive:true});
async function circle(page,target,file){
 await page.evaluate(id=>{document.querySelectorAll('.fraction-guide-ring').forEach(e=>e.remove());const el=document.querySelector(id),r=el?.getBoundingClientRect();if(!r)throw Error('Missing screenshot target '+id);const ring=document.createElement('div');ring.className='fraction-guide-ring';Object.assign(ring.style,{position:'fixed',left:r.left-6+'px',top:r.top-6+'px',width:r.width+12+'px',height:r.height+12+'px',border:'4px solid #ffeb43',borderRadius:'14px',pointerEvents:'none',zIndex:'99999',boxShadow:'0 0 0 3px #0009'});document.body.append(ring);},target);
 await page.screenshot({path:file});await page.evaluate(()=>document.querySelectorAll('.fraction-guide-ring').forEach(e=>e.remove()));
}
try{
 for(const [width,height]of [[1280,720],[1366,768]]){
 const page=await browser.newPage({viewport:{width,height},acceptDownloads:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(60000);page.on('dialog',d=>d.accept());
 await page.route('**/*',route=>route.request().url()==='http://localhost/studio'?route.fulfill({contentType:'text/html',body:html}):route.abort());
 await page.goto('http://localhost/studio');await page.waitForFunction(()=>!document.getElementById('firstBegin').disabled);
 await circle(page,'#firstBegin',`tests/artifacts/fraction-1-start-${width}.png`);
 await page.click('#firstBegin');await page.waitForFunction(()=>document.querySelectorAll('#firstGroups button').length>4);
 await page.click('#fractionDetails > summary');
 await page.waitForFunction(()=>document.querySelectorAll('#fractionFixture option').length===3);
 await circle(page,'#fractionFixture',`tests/artifacts/fraction-2-select-arch-${width}.png`);
 assert.match(await page.locator('#fractionFixture option').first().innerText(),/Arch 1.*24 pixels/i);
 await page.selectOption('#fractionParts','8');await page.fill('#fractionPrediction','3');await page.click('#fractionCheck');assert.match(await page.locator('#fractionFeedback').innerText(),/Correct/);
 await circle(page,'#fractionParts',`tests/artifacts/fraction-3-divide-${width}.png`);
 const part=page.locator('#fractionSections button');assert.equal(await part.count(),8);
 await part.nth(0).click();await part.nth(1).click();await page.click('[data-paint="#ef4444"]');
 await part.nth(2).click();await part.nth(3).click();await part.nth(4).click();await page.click('[data-paint="#22c55e"]');
 assert.match(await page.locator('#fractionMath').innerText(),/2\/8 red \+ 3\/8 green = 5\/8 lit/);
 await circle(page,'#fractionSections',`tests/artifacts/fraction-4-add-colors-${width}.png`);
 await page.click('#fractionApply');assert.match(await page.locator('#fractionFeedback').innerText(),/Programmed/);
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('#firstSave')]);const saved=await readFile(await download.path());const data=JSON.parse(saved);
 const arch=data.fixtures.find(f=>f.name.startsWith('Arch 1'));const cue=data.cues.find(c=>c.fixtureId===arch.id&&c.effect==='fraction-pixels');assert.ok(cue);assert.equal(cue.pixelColors.filter(c=>c==='#ef4444').length,6);assert.equal(cue.pixelColors.filter(c=>c==='#22c55e').length,9);
 await circle(page,'#firstSave',`tests/artifacts/fraction-5-save-${width}.png`);
 await page.setInputFiles('#projectFile',{name:'fraction-show.lightshow',mimeType:'application/json',buffer:saved});
 await page.waitForFunction(()=>document.getElementById('notice').textContent.includes('Project reopened'));await page.click('#fractionDetails > summary');await page.click('#fractionDetails > summary');
 await page.selectOption('#fractionParts','8');await page.fill('#fractionPrediction','3');await page.click('#fractionCheck');
 assert.match(await page.locator('#fractionMath').innerText(),/5\/8 lit/);
 assert.deepEqual(errors,[]);await page.close();
 }
}finally{await browser.close();}
console.log('Fraction missions: first-show real RGB cue, download/reopen, and annotated screenshots passed.');

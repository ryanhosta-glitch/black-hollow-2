import {chromium} from 'playwright-core';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.GINGER_CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
const html=await readFile(new URL('../north_pole/gingerlight_student_standalone.html',import.meta.url),'utf8');
await page.route('**/*',r=>r.request().url()==='http://localhost/gingerlight'?r.fulfill({contentType:'text/html',body:html}):r.abort());
try{
 console.log('creative: open');await page.goto('http://localhost/gingerlight');await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Demo ready'));
 await page.fill('#pixelSpacing','1');await page.click('#autoPlace');assert.equal(await page.locator('#fixtureList button').count(),1);
 await page.selectOption('#quickEffect','rainbow');await page.click('#quickApply');assert.equal(await page.locator('#cueList button').count(),1);
 await page.click('#undoEdit');assert.equal(await page.locator('#cueList button').count(),0);await page.click('#redoEdit');assert.equal(await page.locator('#cueList button').count(),1);
 await page.selectOption('#operatorMode','professional');await page.click('[data-workspace=console]');assert.ok(await page.locator('#faders input[type=range]').count()>0);
 await page.click('[data-workspace=patch]');assert.equal(await page.locator('.dmx-cell').count(),512);
 await page.selectOption('#operatorMode','student');await page.click('#blackout');assert.equal(await page.locator('#blackout').getAttribute('aria-pressed'),'true');await page.click('#blackout');
 await page.click('#saveBrowser');await page.waitForFunction(()=>document.querySelector('#recoveryStatus').textContent.includes('Recovery saved'));
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('#saveProject')]);const saved=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(saved.version,3);assert.equal(saved.cues[0].effect,'rainbow');assert.equal(saved.cues[0].math,undefined);
 await page.reload();await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Demo ready'));await page.click('#recoverProject');await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Recovered house'));assert.equal(await page.locator('#cueList button').count(),1);
 await page.selectOption('#operatorMode','professional');await page.click('[data-workspace=sequence]');await page.locator('#cueList button').first().click();await page.click('#duplicateCue');assert.equal(await page.locator('#cueList button').count(),2);
 console.log('creative: remap');await page.setInputFiles('#houseFile',{name:'revision.ginger',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved.house))});await page.waitForFunction(()=>!document.querySelector('#houseRevision').hidden);
 for(const select of await page.locator('#remapRows select').all())await select.selectOption({index:1});await page.click('#applyRevision');await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('House revised'));assert.equal(await page.locator('#cueList button').count(),2);
 await page.click('[data-workspace=sequence]');await page.locator('#cueList button').first().click();await page.locator('#scrub').evaluate(e=>{e.value='5';e.dispatchEvent(new Event('input'));});await page.click('#splitCue');assert.equal(await page.locator('#cueList button').count(),3);
 console.log('creative: drag/drop');await page.locator('#effectShelf summary').click();await page.locator('#effectPalette button').filter({hasText:/^wave$/}).dragTo(page.locator('#timeline [data-cue-id]').last(),{targetPosition:{x:10,y:10},force:true});assert.equal(await page.locator('#cueList button').count(),4);
 console.log('creative: music');await page.click('#demo');await page.waitForFunction(()=>document.querySelectorAll('#cueList button').length===0);
 const sourceSong=JSON.parse(await readFile(new URL('../north_pole/music/Silent_Night_Snowfall_Jazz_6-8.song.json',import.meta.url)));
 await page.locator('summary').filter({hasText:'Import music and assign MIDI tracks'}).click();await page.setInputFiles('#midiFile',{name:'bells.mid',mimeType:'audio/midi',buffer:Buffer.from(sourceSong.midiBase64,'base64')});await page.setInputFiles('#audioFile',{name:'bells.mp3',mimeType:'audio/mpeg',buffer:Buffer.from(sourceSong.audio.data,'base64')});await page.click('#importMusic');await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('MIDI tempo'));
 assert.ok(await page.locator('#midiTrack option').count()>1);await page.fill('#pixelSpacing','1');await page.click('#autoPlace');await page.selectOption('#midiTrack',{index:1});await page.click('#mapMidi');await page.waitForFunction(()=>document.querySelectorAll('#cueList button').length>0);
 assert.equal(await page.locator('#error').innerText(),'');assert.deepEqual(errors,[]);
 await page.setViewportSize({width:1280,height:800});await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);await page.setViewportSize({width:1440,height:1100});

 await mkdir('tests/artifacts',{recursive:true});await page.screenshot({path:'tests/artifacts/gingerlight-creative.png',fullPage:true});
 console.log('PASS: auto patch, creative effect, undo/redo, shared professional console, patch map, blackout, project download, IndexedDB recovery, duplicate, house remap, cue split, effect drag/drop, MIDI+MP3 import, track mapping, school-laptop layout.');
}finally{await browser.close();}

import {partitionPixels,paintSections,DARK,countLit,validateFractionColors} from './fraction_arch.mjs';
import {firstShowSections} from './first_show_engine.mjs';
export function createFractionDesigner({host,getProject,onApply,onPause,onSeek,onSongSelect,onFixtureSelect,onError}){
 const panel=document.createElement('section');panel.id='fractionDesigner';panel.className='fraction-designer';
 panel.innerHTML=`<details id="fractionDetails"><summary>✦ Fraction Light Designer · program parts of a real arch</summary>
 <div class="fraction-body"><p>Fractions tell the computer which actual pixels to light. First predict the size of each equal section, then program it.</p>
 <label for="fractionFixture">1 · Choose an addressable arch</label><select id="fractionFixture"></select>
 <label for="fractionSong">2 · Choose a song part</label><select id="fractionSong"></select>
 <label for="fractionParts">3 · Divide the arch</label><select id="fractionParts"><option value="2">Halves (1/2)</option><option value="4">Fourths (1/4)</option><option value="8" selected>Eighths (1/8)</option></select>
 <label for="fractionPrediction">How many individual bulbs are in one section?</label><div class="fraction-row"><input id="fractionPrediction" type="number" min="1" max="170" step="1" placeholder="My prediction"><button id="fractionCheck">Check and divide</button></div>
 <p id="fractionFeedback" role="status" aria-live="polite">Choose an arch and predict first.</p>
 <div id="fractionEditor" hidden><p><strong>4 · Select one or more numbered sections</strong></p><div id="fractionBulbs" role="group" aria-label="Actual pixel strip"></div><div id="fractionSections" role="group" aria-label="Equal parts of your arch"></div>
 <div class="fraction-row fraction-colors"><button data-paint="#ef4444">Color red</button><button data-paint="#22c55e">Color green</button><button data-paint="#ffffff">Color white</button><button data-paint="#000000">Turn off</button></div>
 <p id="fractionMath" aria-live="polite"></p><p id="fractionCounts"></p>
 <div class="fraction-row"><button id="fractionCopy">Copy the previous song part</button><button id="fractionReset">Start this part with all lights off</button></div>
 <button id="fractionApply" class="primary">5 · Program these real lights</button><p class="note">Press Program after changing colors. The saved project keeps the exact colors of every pixel. Select Play this part below to hear the result.</p></div></div></details>`;
 host.append(panel);const $=id=>panel.querySelector('#'+id);let fixtureId='',sectionId='',parts=8,checked=false,colors=[],selected=new Set(),stamp='';
 const archFixtures=()=>{const p=getProject();return p.fixtures.filter(f=>f.profileId==='rgb-pixels'&&!f.matrix&&(p.props||[]).some(m=>m.type==='arch'&&f.anchorId==='prop:'+m.id+':arch'));};
 const currentFixture=()=>getProject().fixtures.find(f=>f.id===fixtureId);
 const currentSection=()=>firstShowSections(getProject()).find(s=>s.id===sectionId);
 function existingColors(f,s){const c=getProject().cues.find(c=>c.fixtureId===f.id&&c.startTick===s.startTick&&c.endTick===s.endTick);return c?.effect==='fraction-pixels'&&validateFractionColors(c.pixelColors,f.nodes)?c.pixelColors.slice():Array(f.nodes).fill(DARK);}
 function message(s){$('fractionFeedback').textContent=s;}
 function update(){const f=currentFixture(),s=currentSection();if(!f||!s)return;$('fractionBulbs').replaceChildren();for(const [i,c] of colors.entries()){const light=document.createElement('span');light.title='Pixel '+(i+1);light.style.background=c;light.className='fraction-bulb';$('fractionBulbs').append(light);}
 $('fractionSections').replaceChildren();const ranges=partitionPixels(f.nodes,parts);for(const [i,r]of ranges.entries()){const b=document.createElement('button');b.type='button';b.className='fraction-part';b.setAttribute('aria-pressed',String(selected.has(i)));b.textContent=(i+1)+'/'+parts;b.title='Pixels '+(r.start+1)+'–'+r.end;b.onclick=()=>{selected.has(i)?selected.delete(i):selected.add(i);update();};$('fractionSections').append(b);}
 const lit=countLit(colors),groups={};for(const c of colors)groups[c]=(groups[c]||0)+1;const colored=Object.entries(groups).filter(([c])=>c!==DARK).map(([c,n])=>(n/(f.nodes/parts))+'/'+parts+' '+(c==='#ef4444'?'red':c==='#22c55e'?'green':c==='#ffffff'?'white':'colored'));
 $('fractionMath').textContent=colored.length?colored.join(' + ')+' = '+(lit/(f.nodes/parts))+'/'+parts+' lit':'0/'+parts+' lit';
 $('fractionCounts').textContent=lit+' pixels ON · '+(f.nodes-lit)+' pixels OFF · '+parts+' equal sections of '+(f.nodes/parts)+' pixels each.';
 }
 function sync(force=false){const p=getProject(),fs=archFixtures(),ss=firstShowSections(p);const signature=JSON.stringify([fs.map(f=>[f.id,f.nodes]),ss.map(s=>s.id)]);if(!force&&signature===stamp)return;stamp=signature;
 const previousFixture=fixtureId,previousSection=sectionId;
 $('fractionFixture').replaceChildren();for(const f of fs){const o=document.createElement('option');o.value=f.id;o.textContent=f.name+' — '+f.nodes+' pixels';$('fractionFixture').append(o);}
 $('fractionSong').replaceChildren();for(const s of ss){const o=document.createElement('option');o.value=s.id;o.textContent=s.name;$('fractionSong').append(o);}
 fixtureId=fs.some(f=>f.id===previousFixture)?previousFixture:fs[0]?.id||'';sectionId=ss.some(s=>s.id===previousSection)?previousSection:ss[0]?.id||'';
 $('fractionFixture').value=fixtureId;$('fractionSong').value=sectionId;reload();
 if(!fs.length)message('No pixel arch is ready. Start a new First Show on the model house to get three 24-pixel arches.');}
 function reload(){const f=currentFixture(),s=currentSection();checked=false;selected.clear();$('fractionEditor').hidden=true;$('fractionPrediction').value='';if(!f||!s)return;colors=existingColors(f,s);message('Predict the number of bulbs in each part and click Check and divide.');}
 $('fractionFixture').onchange=()=>{fixtureId=$('fractionFixture').value;onFixtureSelect?.(currentFixture());reload();};
 $('fractionSong').onchange=()=>{sectionId=$('fractionSong').value;onPause();onSeek(currentSection().startTick);onSongSelect?.(currentSection());reload();};
 $('fractionParts').onchange=()=>{parts=Number($('fractionParts').value);reload();};
 $('fractionCheck').onclick=()=>{try{const f=currentFixture();if(!f)throw Error('Start the First Show to create a 24-pixel arch first.');const ranges=partitionPixels(f.nodes,parts);if(Number($('fractionPrediction').value)!==ranges[0].count)throw Error('Try again: '+f.nodes+' lights ÷ '+parts+' equal parts.');checked=true;$('fractionEditor').hidden=false;message('Correct! Each section contains '+ranges[0].count+' actual pixels. Select numbered sections to color.');update();}catch(e){message(e.message);}};
 for(const b of panel.querySelectorAll('[data-paint]'))b.onclick=()=>{if(!checked||!selected.size){message('Select one or more numbered sections first.');return;}colors=paintSections(colors,parts,[...selected],b.dataset.paint);selected.clear();update();message('Color changed in your design. Click Program these real lights to apply it.');};
 $('fractionReset').onclick=()=>{colors=Array(currentFixture().nodes).fill(DARK);selected.clear();update();};
 $('fractionCopy').onclick=()=>{const ss=firstShowSections(getProject()),i=ss.findIndex(s=>s.id===sectionId);if(i<1){message('Opening has no previous song part to copy.');return;}const f=currentFixture();colors=existingColors(f,ss[i-1]);selected.clear();update();message('Copied previous fraction design. Choose changes for this song part.');};
 $('fractionApply').onclick=()=>{try{if(!checked)throw Error('Check your partition first.');onPause();onSongSelect?.(currentSection());onApply(currentFixture(),currentSection(),colors.slice());message('Programmed! This is now a real pixel cue. Click Play this part or Save my show.');}catch(e){message(e.message);onError(e);}};
 panel.querySelector('#fractionDetails').addEventListener('toggle',()=>{if($('fractionDetails').open){sync(true);if(currentFixture())onFixtureSelect?.(currentFixture());}});
 sync(true);return {refresh(){sync();},open(){panel.querySelector('#fractionDetails').open=true;sync(true);}};
}

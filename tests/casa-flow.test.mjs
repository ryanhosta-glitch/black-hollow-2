import {createStreetMemory,streetLedger,houseMemory,STREET_FATES} from '../casa_game/street_memory.mjs';
import {collectHallLights,nearbyHallLights} from '../casa_game/hall_performance.mjs';
import {createHauntingSession} from '../casa_game/haunting_run.mjs';
import {createNightChronicle,RELICS} from '../casa_game/night_chronicle.mjs';
import {createHauntingProp} from '../casa_game/haunting_props.mjs';
import {streetEntrance} from '../casa_game/street_entrance.mjs';
import {createTrickOrTreat,halloweenTime} from '../casa_game/trick_or_treat.mjs';
import {createHalloweenStreet} from '../casa_game/halloween_street.mjs';
import {createHallOrgan} from '../casa_game/hall_organ.mjs';
import {createEncounterGate} from '../casa_game/automatic_encounters.mjs';
import {wallMount} from '../casa_game/wall_mount.mjs';
import {sampleHouseSurface,stairRoomAt,stairResidentFloors} from '../casa_game/stairs.mjs';
import {compileFixture} from './helpers/compile-forge.mjs';
import {openCasa} from '../casa_game/archive.mjs';
import {createGamepadInput,controllerActions} from '../casa_game/gamepad.mjs';
import {createInvestigation} from '../casa_game/investigation.mjs';
import {createEncounterDirector,spiritProfiles} from '../casa_game/encounters.mjs';
import {createHauntedInteriors} from '../casa_game/haunted_interiors.mjs';
import {portraitCatalog} from '../casa_game/portrait_catalog.mjs';
// Executes the actual application module with a simulated DOM/renderer and real Three.js scene graphs.
// This verifies UI/scene/state integration, not WebGL appearance or audible output.
import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';import {pathToFileURL,fileURLToPath} from 'node:url';
import {createWraithMotion} from '../casa_game/wraith_motion.mjs';
import {createLiftEntrance,decorateGallery} from '../casa_game/presentation.mjs';
import {createFabricGhost} from '../casa_game/fabric_ghost.mjs';
import {createNavigation2ForgeViewer} from '../casa_game/forge_navigation2_viewer.js';import {SIGNATURE_ROOMS,signatureSurface,signatureBlocked} from '../casa_game/signature_navigation.mjs';import {createCatalog} from '../casa_game/catalog.mjs';import {createPackageAssets,createFloorStreamer,createExterior,createGroundsDecoration,disposeGroup} from '../casa_game/resources.mjs';import {createSession,createElevator,blockedByFurniture,roomContains,floorY,random,seedNumber} from '../casa_game/session.mjs';import {createStreet} from '../casa_game/street.mjs';import {createAudio} from '../casa_game/audio.mjs';import {createAtmosphere} from '../casa_game/atmosphere.mjs';
const RealThree=await import(pathToFileURL(process.argv[2]).href),{GLTFLoader:RealLoader}=await import(pathToFileURL(process.argv[3]).href),nodes=new Map();
class Image{constructor(){this.height=this.width=1;this.events=new Map();}addEventListener(k,v){this.events.set(k,v);}removeEventListener(k){this.events.delete(k);}set src(_){queueMicrotask(()=>{this.onload?.();this.events.get('load')?.();});}}
class Element extends EventTarget{constructor(id=''){super();this._text='';this.id=id;this.style={};this.dataset={};this.children=[];this.hidden=false;this.value='';this.classList={add(){},remove(){},toggle(){}};}get textContent(){return this._text+this.children.map(c=>c.textContent||'').join(' · ');}set textContent(v){this._text=v;this.children=[];}querySelector(id){return element(id.replace('#',''));}querySelectorAll(){return [];}append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items;}focus(){}blur(){}matches(){return false;}remove(){}click(){return this.onclick?.();}getContext(){return new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});}}
function element(id){if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id);}
const document=new EventTarget();Object.assign(document,{getElementById:element,createElement:()=>new Element(),createElementNS:()=>new Image(),body:new Element(),hidden:false,activeElement:null});const window=new EventTarget();window.speechSynthesis={cancel(){},speak(){}};const local=new Map(),storage={getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)};class Audio extends EventTarget{constructor(){super();this.volume=0;}play(){return Promise.resolve();}pause(){}}
let frameCount=0;class Renderer{constructor({canvas}){this.domElement=canvas;}setPixelRatio(){}setSize(){}render(){frameCount++;}dispose(){}}
class Loader extends RealLoader{constructor(manager){super(manager);this.manager.addHandler(/\.webp$/,{load(_url,onLoad){const t=new RealThree.Texture();queueMicrotask(()=>onLoad(t));return t;}});}}
const THREE={...RealThree,WebGLRenderer:Renderer};Object.assign(globalThis,{document,window,Image,self:globalThis,Audio,localStorage:storage,requestAnimationFrame(){}});
const freshPackages=new Map();let freshCatalog;
if(process.argv.includes('--fresh-forge')){
 freshCatalog=JSON.parse(await readFile(new URL('../casa_game/street.json',import.meta.url),'utf8'));
 for(const name of ['one-room','moonveil','split-lantern']){const url=new URL('../casa_game/samples/'+name+'.casa',import.meta.url),existing=await openCasa(new Uint8Array(await readFile(url))),blueprint=await existing.json(existing.manifest.casa?.source||'source.haunt'),fresh=await compileFixture(blueprint,{identity:{id:existing.manifest.id,name:existing.manifest.name,creator:existing.manifest.casa?.creator||'',desc:existing.manifest.casa?.description||''}});freshPackages.set(url.href,fresh.bytes);const row=freshCatalog.houses.find(h=>h.id===existing.manifest.id);row.fingerprint=fresh.house.fingerprint;}
 console.log('Testing the actual Game with three freshly recompiled Forge exports.');
}
const fakeFetch=async url=>{try{if(freshCatalog&&String(url).endsWith('/street.json'))return Response.json(freshCatalog);return new Response(freshPackages.get(String(url))||await readFile(fileURLToPath(String(url))));}catch{return new Response('missing',{status:404});}};globalThis.fetch=fakeFetch;
const context=vm.createContext({createStreetMemory,streetLedger,houseMemory,STREET_FATES,collectHallLights,nearbyHallLights,createHauntingSession,createNightChronicle,RELICS,createHauntingProp,streetEntrance,createTrickOrTreat,halloweenTime,createHalloweenStreet,createHallOrgan,createEncounterGate,wallMount,createLiftEntrance,decorateGallery,sampleHouseSurface,stairRoomAt,stairResidentFloors,THREE,GLTFLoader:Loader,createGamepadInput,controllerActions,createInvestigation,createEncounterDirector,spiritProfiles,createHauntedInteriors,portraitCatalog,createFabricGhost,createWraithMotion,createNavigation2ForgeViewer,SIGNATURE_ROOMS,signatureSurface,signatureBlocked,createCatalog,createPackageAssets,createFloorStreamer,createExterior,createGroundsDecoration,disposeGroup,createSession,createElevator,blockedByFurniture,roomContains,floorY,random,seedNumber,createStreet,createAudio,__createAtmosphere:createAtmosphere,document,window,localStorage:storage,matchMedia:()=>({matches:true}),innerWidth:960,innerHeight:540,devicePixelRatio:1,performance:globalThis.performance,requestAnimationFrame(){},speechSynthesis:window.speechSynthesis,SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},URL,Response,Blob,DecompressionStream,fetch:fakeFetch,console,crypto,Image,Audio,__mainURL:new URL('../casa_game/main.mjs',import.meta.url).href});
let source=await readFile(new URL('../casa_game/main.mjs',import.meta.url),'utf8');source=source.replace(/^import .*;$/gm,'').replaceAll('import.meta.url','__mainURL').replace("await import('./atmosphere.mjs')",'({createAtmosphere:__createAtmosphere})');source+='\nglobalThis.game={night,openNinthDoor,chooseStreetFate,get streetMemory(){return streetMemory},changePlayMode,updateTrickOrTreat,get trickRound(){return trickRound},get halloween(){return halloween},tick,pose,nearestAction,awakenHouse:loadHouse,loadHouse:(d,o)=>loadHouse(d,{classic:true,...o}),showHauntingAction,hauntingJournal,houseScene,signatureScene,streetScene,board,get street(){return street},get house(){return house},get session(){return session},get investigation(){return investigation},get walker(){return walker},get mode(){return mode},get dialog(){return dialog},get busy(){return busy},get floors(){return floors},get elevator(){return elevator},get echoes(){return echoes},get actors(){return markerActors},groundsScene,updateAutomaticEncounters,get autoGate(){return autoGate},finishNarration};';await vm.runInContext('(async()=>{'+source+'})()',context);const game=context.game;
async function settle(){const deadline=performance.now()+5000;while(game.busy&&performance.now()<deadline)await new Promise(setImmediate);assert.equal(game.busy,false,'transition finishes');}
function close(){element('closeModal').click();}
assert.equal(element('startStreet').disabled,false);await element('startStreet').click();assert.equal(game.mode,'street');assert.equal(game.walker?.active,true,element('loadStatus').textContent);
let liftClock=performance.now()+3000,walkClock=liftClock;
async function finishClosing(){liftClock=Math.max(liftClock,walkClock);for(let i=0;i<40&&!game.dialog;i++){game.tick(liftClock+=50);await settle();}walkClock=liftClock;assert.equal(game.dialog,true,'buttons appear after doors close');}
async function openLift(){const candidates=[game.house.access.hub,...game.house.access.stops,game.house.access.hiddenDestination],stop=candidates.find(s=>game.elevator.canBoard(s.id,game.pose()));assert.ok(stop);assert.equal(game.nearestAction(),null,'no elevator interaction prompt');await game.board(stop);assert.equal(game.dialog,false,'panel waits for closing doors');await finishClosing();}
// A porch asks Yes/No; declining never loads a house or immediately reopens.
const porch=game.street.lots[0];game.walker.setPosition(...porch.door);game.tick(500);assert.ok(game.nearestAction().label.includes('Do you dare to enter “'+porch.house.name+'”?'));assert.equal(element('interact').textContent,'Yes');assert.equal(element('declineEntry').hidden,false);element('declineEntry').click();assert.equal(game.mode,'street');assert.equal(game.house,null);assert.equal(game.nearestAction(),null);game.walker.setPosition(0,0,13);game.tick(700);game.walker.setPosition(...porch.door);assert.ok(game.nearestAction().confirmation);await game.nearestAction().run();assert.equal(game.mode,'house');assert.equal(game.session.phoenix,true);close();await game.streetScene();
await game.loadHouse({id:'test-moonveil',package:'./samples/moonveil.casa'});assert.equal(game.mode,'hall');assert.equal(game.dialog,false);assert.equal(game.walker?.active,true,element('loadStatus').textContent);assert.equal(game.walker.yaw,Math.PI,'initial view faces the Hall stairs');
game.tick(1000);element('pauseButton').click();game.tick(1040);const frozenFrames=frameCount;game.tick(1080);game.tick(1120);assert.equal(frameCount,frozenFrames,'paused scenes render once and then idle');close();game.tick(1160);assert.ok(frameCount>frozenFrames);
game.walker.setPosition(0,0,14.1,Math.PI);const entryAction=game.nearestAction();await entryAction.run();await settle();assert.equal(game.mode,'house');assert.equal(game.walker.currentRoomId,game.house.manifest.entry.roomId,'Hall entry reaches authored house entry');assert.equal(game.walker.position[1],3.048);await game.signatureScene('hall',[0,0,-13.5]);
assert.equal(game.nearestAction().label,'Go outside');await game.nearestAction().run();await settle();assert.equal(game.mode,'grounds');await game.nearestAction().run();await settle();assert.equal(game.mode,'hall');
game.walker.setPosition(0,5.25,14,1.1);const before=game.pose();await openLift();assert.equal(game.mode,'cabin');assert.equal(game.dialog,true);assert.ok(element('choices').children.every(b=>!b.textContent.startsWith('13 ·')));close();await settle();assert.equal(game.mode,'hall');assert.deepEqual([...game.walker.position],before.position);await openLift();const floorButton=element('choices').children.find(b=>b.textContent.includes(game.session.primary.roomName));assert.ok(floorButton);await floorButton.click();await settle();assert.equal(game.mode,'house');assert.equal(game.floors.residentFloors,1);
async function doQuestAction(){const slot=game.session.activeSlots()[0],room=game.house.rooms.find(r=>r.id===slot.roomId);if(slot.scene==='hall')await game.signatureScene('hall',slot.approachMeters,1.2);else if(slot.scene==='grounds'){await game.groundsScene();game.walker.setPosition(...slot.approachMeters,1.2);}else await game.houseScene(room,slot.approachMeters,1.2);const p=game.pose();const action=game.nearestAction();assert.ok(action);await action.run();if(game.dialog&&element('modalTitle').textContent.startsWith('Examine the')){const answer=game.investigation.puzzle(slot).answer;await element('choices').children.find(b=>b.textContent===answer).click();}if(game.dialog){close();assert.equal(game.walker?.active,true,element('loadStatus').textContent);assert.ok(Math.abs(game.walker.yaw-1.2)<1e-8,'dialogue preserves facing direction');assert.deepEqual([...game.walker.position],p.position);}await settle();}
await doQuestAction();assert.equal(game.session.state.stage,'founder');
// Escape is owned by the game, not the legacy viewer's exit action.
function escape(){const event=new Event('keydown');Object.defineProperty(event,'code',{value:'Escape'});window.dispatchEvent(event);}
const paused=game.pose();escape();assert.equal(game.dialog,true);assert.equal(game.walker.active,false);escape();assert.equal(game.dialog,false);assert.equal(game.walker?.active,true,element('loadStatus').textContent);assert.deepEqual([...game.walker.position],paused.position);
for(let i=0;i<6;i++)await doQuestAction();assert.equal(game.session.state.stage,'floor13');assert.equal(game.session.floor13Unlocked,true);
const stop=game.house.access.stops.find(s=>s.id===game.session.primary.id),room=game.house.rooms.find(r=>r.id===stop.roomId);await game.houseScene(room,stop.approachMeters);await openLift();const thirteen=element('choices').children.find(b=>b.textContent.startsWith('13 ·'));assert.ok(thirteen);await thirteen.click();await settle();assert.equal(game.mode,'floor13');assert.equal(game.echoes.length,13);
for(const echo of game.echoes){game.walker.setPosition(...echo.position);const action=game.nearestAction();assert.ok(action?.label.startsWith('Recover a memory'));await action.run();}assert.equal(game.session.state.stage,'return');
await game.signatureScene('hall',[0,5.25,14],0);await openLift();const back=element('choices').children.find(b=>b.textContent.includes(stop.roomName));await back.click();await settle();await doQuestAction();assert.equal(game.session.mapUnlocked,true);element('mapButton').click();assert.equal(element('mapCanvas').hidden,false);close();
const key='bh-casa:v1:'+game.house.fingerprint;await doQuestAction();await settle();assert.equal(game.mode,'street');assert.equal(game.house,null);assert.equal(JSON.parse(local.get(key)).stage,'complete');

await game.loadHouse({id:'test-one-room',package:'./samples/one-room.casa'});close();for(let i=0;i<3;i++)await doQuestAction();assert.equal(game.session.state.stage,'collect');assert.equal(new Set(game.session.slots.filter(s=>['porcelain-doll','spellbook','crystal-ball'].includes(s.role)).map(s=>s.scene)).size,3,'one-room keepsakes span room, Hall and grounds');await game.streetScene();
console.log('PASS: actual app startup, street, Hall orientation, strict cabin menu, floor streaming, dialogue/escape resume, full quest, 13 spatial echoes, map reward, saved completion and return to street. No WebGL renderer was used.');

// Exercise the real stairs continuously. Earlier flow tests teleported to the
// cabin and therefore could not prove that players could reach its panel.
await game.loadHouse({id:'walk-hall',package:'./samples/moonveil.casa'});close();
walkClock=Math.max(liftClock,performance.now())+10000;
function keyEvent(type,code){const event=new Event(type,{cancelable:true});Object.defineProperty(event,'code',{value:code});(type==='keydown'?window:document).dispatchEvent(event);}
async function walkUntil(check,limit=200){keyEvent('keydown','KeyW');try{for(let i=0;i<limit&&!check();i++){walkClock+=34;game.tick(walkClock);}assert.ok(check(),'physical walking reaches target; '+JSON.stringify(game.pose()));}finally{keyEvent('keyup','KeyW');}await settle();}
for(const side of [-1,1]){
 await game.signatureScene('hall',[side*4.5,0,3.5],Math.PI);
 await walkUntil(()=>game.walker.position[2]>11.6);
 assert.ok(Math.abs(game.walker.position[1]-5.25)<.01,'stairs physically reach upper landing');
 const p=game.walker.position;game.walker.setPosition(...p,side>0?Math.PI/2:-Math.PI/2);
 await walkUntil(()=>Math.abs(game.walker.position[0])<.4);game.walker.setPosition(...game.walker.position,Math.PI);await walkUntil(()=>game.mode==='cabin'||game.busy);
 assert.equal(game.mode,'cabin');await finishClosing();assert.ok(element('choices').children.some(b=>b.textContent.includes('Main Floor')),'panel opens on physical cabin entry');
 close();await settle();assert.equal(game.mode,'hall');game.tick(walkClock+=34);assert.equal(game.mode,'hall','arrival does not immediately board again');
}
await game.streetScene();console.log('PASS: authored main-house doorway and both physical Hall stair routes automatically open cabin destinations.');

// Complete a third, disconnected-room export through the same production UI.
await game.loadHouse({id:'test-split-lantern',package:'./samples/split-lantern.casa'});close();
for(let i=0;i<8&&game.session.state.stage!=='floor13';i++)await doQuestAction();assert.equal(game.session.state.stage,'floor13');
const thirdStop=game.house.access.stops[0];await game.houseScene(game.house.rooms.find(r=>r.id===thirdStop.roomId),thirdStop.approachMeters);await openLift();await element('choices').children.find(b=>b.textContent.startsWith('13 ·')).click();await settle();
for(const echo of game.echoes){game.walker.setPosition(...echo.position);await game.nearestAction().run();}
await doQuestAction();assert.equal(game.session.mapUnlocked,true);await doQuestAction();await settle();assert.equal(game.mode,'street');
console.log('PASS: third CASA complete investigation including evidence puzzles, disconnected-room access, memories and return.');
// Every new house starts in the shared Hall and its marked physical threshold
// must load that CASA's own authored entry, without using the elevator.
for(const packageName of ['moonveil','one-room','split-lantern']){
 await game.loadHouse({id:'door-'+packageName,package:'./samples/'+packageName+'.casa'},{fresh:true});close();assert.equal(game.mode,'hall');
 game.walker.setPosition(0,0,13.5,Math.PI);
 await walkUntil(()=>game.mode==='house'||game.busy,100);
 assert.equal(game.mode,'house',packageName+' Hall doorway opens into its CASA');
 assert.equal(game.walker.currentRoomId,game.house.manifest.entry.roomId);
 assert.equal(game.floors.residentFloors,1);assert.ok(game.walker.position.every(Number.isFinite));
 await game.streetScene();
}
console.log('PASS: physical starting-Hall door enters each of the three CASA interiors, independent of elevator boarding.');

await game.loadHouse({id:'automatic-estate',package:'./samples/one-room.casa'},{fresh:true});close();const first=game.session.activeSlots()[0];await game.houseScene(game.house.rooms.find(r=>r.id===first.roomId),first.approachMeters);let reactionClock=performance.now()+100000;for(let i=0;i<30;i++){game.tick(reactionClock+=50);await Promise.resolve();}assert.equal(game.session.state.stage,'founder','ghost speaks automatically without an Interact click');assert.equal(game.dialog,false);assert.equal(element('narration').hidden,false);assert.equal(game.walker.active,true);assert.ok(game.session.state.encounters['quest:ghost:first-ghost']);game.finishNarration();const founder=game.session.activeSlots()[0];assert.equal(founder.scene,'hall');await game.signatureScene('hall',founder.approachMeters);game.autoGate.reset();for(let i=0;i<30;i++){game.tick(reactionClock+=50);await Promise.resolve();}assert.equal(game.session.state.stage,'seer','Hall portrait speaks automatically');assert.equal(element('narration').hidden,false);game.finishNarration();assert.equal(game.session.activeSlots()[0].scene,'grounds');const checkpoint=game.session.snapshot(game.pose());assert.ok(checkpoint.encounters['quest:founder:game:founder']);await game.streetScene();console.log('PASS: automatic ghost and Hall portrait encounters, scene distribution and persisted discovery keys.');

await game.changePlayMode('halloween');assert.equal(game.mode,'street');assert.equal(game.session,null);assert.equal(game.trickRound.state.remaining,600);assert.equal(game.halloween.pumpkins.length,game.street.lots.length);{const deadline=performance.now()+10000;while(!game.street.lots[0].entryReady&&performance.now()<deadline){game.tick(reactionClock+=50);await new Promise(setImmediate);}assert.ok(game.street.lots[0].entryReady,'compiled street entrance loads');}game.walker.setPosition(...game.street.lots[0].door);assert.equal(game.nearestAction(),null);await game.loadHouse(game.street.lots[0].house);assert.equal(game.mode,'street','Halloween cannot enter a mansion');game.updateTrickOrTreat(.1,.05);assert.ok(game.trickRound.state.pending);game.updateTrickOrTreat(3.6,.05);assert.equal(game.trickRound.state.visits,1);game.updateTrickOrTreat(1,.05);assert.equal(game.trickRound.state.visits,1,'standing still cannot farm candy');const beforePause=game.trickRound.state.remaining;element('pauseButton').click();game.tick(reactionClock+=20000);assert.equal(game.trickRound.state.remaining,beforePause);close();game.updateTrickOrTreat(600,.05);assert.equal(game.trickRound.state.status,'finished');assert.match(element('modalTitle').textContent,/Halloween bell/);close();await game.changePlayMode('story');assert.equal(game.trickRound,null);assert.equal(game.halloween,null);console.log('PASS: Halloween mode, exterior-only visits, bucket, paused timer, round summary and return to Investigation.');

await game.loadHouse({id:'migration-source',package:'./samples/one-room.casa'},{fresh:true});close();const migrationSeed=game.session.state.seed,migrated=game.session.snapshot(game.pose()),previousHash='a'.repeat(64),currentHash=game.house.fingerprint;await game.streetScene();local.delete('bh-casa:v1:'+currentHash);local.set('bh-casa:v1:'+previousHash,JSON.stringify(migrated));await game.loadHouse({id:'migration-target',package:'./samples/one-room.casa',previousFingerprints:[previousHash]});close();assert.equal(game.session.state.seed,migrationSeed,'explicit same-house migration retains investigation');await game.streetScene();console.log('PASS: published sample migration resumes an explicitly mapped previous fingerprint.');

// The new public entry point uses the actual house, not the classic hall/errand sequence.
let phoenixClock=10000000;
async function pulsePhoenix(seconds){for(let i=0;i<Math.ceil(seconds*20);i++){game.tick(phoenixClock+=50);await settle();}}
async function standAtHaunt(slot){game.finishNarration();if(game.dialog)close();if(slot.scene==='hall')await game.signatureScene('hall',slot.approachMeters,0);else await game.houseScene(game.house.rooms.find(r=>r.id===slot.roomId),slot.approachMeters,0);await settle();}
async function chooseHaunt(index,id){const slot=index===4?game.session.exit:game.session.stations[index];await standAtHaunt(slot);const expected=game.session.inspect(slot,game.pose()).choices.find(c=>c.id===id);assert.ok(expected,'choice offered: '+id);game.showHauntingAction(slot);assert.equal(game.dialog,true);const button=element('choices').children.find(b=>b.textContent===expected.label);assert.ok(button,'visible choice: '+expected.label);await button.click();await settle();game.finishNarration();}
const phoenixEndings={vigil:'release',choir:'sing',escort:'home',loop:'tomorrow',masquerade:'invite',bargain:'free',heist:'name',garden:'sky'};
const descriptor={id:'phoenix-ui',package:'./samples/one-room.casa'};
await game.awakenHouse(descriptor,{fresh:true});if(game.dialog)close();assert.equal(game.mode,'house');assert.equal(game.session.phoenix,true);
const phoenixPack=game.house,phoenixKey='bh-phoenix:v2:'+phoenixPack.fingerprint;
for(const type of Object.keys(phoenixEndings)){
 const prepared=createHauntingSession(phoenixPack,{type,seed:472,runId:'ui:'+type});prepared.state.encounters['phoenix:intro']=true;await game.streetScene();local.set(phoenixKey,JSON.stringify(prepared.snapshot()));await game.awakenHouse(descriptor);if(game.dialog)close();assert.equal(game.session.type,type);assert.equal(game.walker.cameraMode,'first');await standAtHaunt(game.session.stations[0]);assert.equal(game.walker.cameraMode,'first','scene transitions retain the player’s camera choice');
 const run=game.session;
 if(type==='vigil'){for(let i=0;i<3;i++){while(run.watch().watching)await pulsePhoenix(.1);await chooseHaunt(i,'hold');await pulsePhoenix(2.8);assert.ok(run.state.solved.includes(i));}}
 if(type==='choir'){await chooseHaunt(3,'read');for(const i of run.order)await chooseHaunt(i,'sound');for(const i of [...run.order].reverse())await chooseHaunt(i,'sound');}
 if(type==='escort'){await chooseHaunt(0,'wake');await pulsePhoenix(.1);for(let i=1;i<3;i++){await standAtHaunt(run.stations[i]);await pulsePhoenix(.2);assert.equal(run.state.companion.scene,run.stations[i].scene);await chooseHaunt(i,'shelter');}}
 if(type==='loop'){await chooseHaunt(3,'read');for(const i of run.order)await chooseHaunt(i,'stop');}
 if(type==='masquerade'){await chooseHaunt(3,'read');for(let i=0;i<3;i++)await chooseHaunt(i,'examine');await chooseHaunt(3,'accuse:'+run.suspect);}
 if(type==='bargain'){await chooseHaunt(1,'read');await chooseHaunt(2,'read');await chooseHaunt(3,'burn');}
 if(type==='heist')await chooseHaunt(2,'take');
 if(type==='garden'){for(let i=0;i<3;i++){const need=run.appetite(i);if(need!=='quiet'&&!run.state.resources[need])await chooseHaunt(3,'refill');await chooseHaunt(i,need);if(need==='quiet')await pulsePhoenix(4.2);}}
 assert.ok(run.ready,type+' has a real UI turning point');await chooseHaunt(4,phoenixEndings[type]);assert.equal(run.state.stage,'complete');assert.equal(game.dialog,true,'ending has a reviewable summary');assert.ok(element('modalTitle').textContent.length);assert.equal(JSON.parse(local.get(phoenixKey)).stage,'complete');close();game.hauntingJournal();assert.match(element('modalText').textContent,/THE STREET REMEMBERS/);close();
 console.log('PASS: Phoenix '+type+' real scene objects, modal choices, world holds, ending, journal and save.');
}
await game.streetScene();assert.equal(element('nightPanel').hidden,true);

game.walker.setPosition(...game.streetMemory.approach);assert.match(game.nearestAction().label,/Ninth Door/);await game.nearestAction().run();assert.equal(element('choices').children.length,2,'eight actual haunting UI endings awaken both street choices');await element('choices').children.find(b=>b.textContent==='Let Black Hallow see morning').click();assert.equal(game.night.data.streetFate,'dawn');close();await game.streetScene();assert.equal(game.streetMemory.witness.fate,'dawn');assert.equal(game.night.resolveStreet('night'),false);console.log('PASS: all eight actual endings awaken the Ninth Door, physical interaction chooses morning, and the street remembers on return.');

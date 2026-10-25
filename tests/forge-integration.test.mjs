import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from 'three';
import {compileFixture} from './helpers/compile-forge.mjs';
import {planDecoration} from '../casa_admin/forge_decoration_plan.mjs';
import {ROOM_PROFILES} from '../casa_game/room_profiles.mjs';
import {createHauntedInteriors} from '../casa_game/haunted_interiors.mjs';
const room=extra=>({id:'parlor',name:'Parlor',roomTheme:'parlor',x:0,y:0,l:28,w:26,h:12,openings:[{id:'entry',type:'door',wall:'top',pos:.5},{type:'window',wall:'bottom',pos:.5}],...extra});
const source=r=>({name:'Final integration',gameEntry:{roomId:r.id,openingId:'entry'},floors:[{name:'Main',kind:'main',rooms:[r]}]});

test('explicit false window choices survive the combined glass, textile and material planners',()=>{
 for(const property of ['curtains','drapery','decoration']){const r=room(),window=r.openings[1];window[property]=false;const src=source(r),snapshot=structuredClone(src),c=planDecoration(src).roomContents[0];assert.deepEqual(src,snapshot);assert.ok(!c.atmosphereReport.components.some(c=>['velvet-curtain','layered-valance'].includes(c.type)),property);}
 for(const property of ['glass','glazing','decoration']){const r=room();r.openings[1][property]=false;const c=planDecoration(source(r)).roomContents[0];assert.ok(!c.ornaments.some(o=>o.type==='jewel-leaded-glass'),property);assert.ok(c.ornaments.length,'core room appearance remains');}
});

test('very wide authored conservatory glazing compiles without oversized aging templates or source changes',async()=>{
 const r=room({id:'conservatory',name:'Conservatory',roomTheme:'conservatory',l:60,w:30,h:14,forgeDecoration:{atmosphere:{condition:'decaying'}}});r.openings[1].clearWidthMeters=12;const src=source(r),snapshot=structuredClone(src),{house}=await compileFixture(src);assert.deepEqual(src,snapshot);assert.ok(house.playability.staticRoutesVerified);const c=house.decoration.roomContents[0];assert.ok(c.atmosphereReport.components.some(d=>d.type==='water-trace'));assert.ok(c.atmosphereReport.omitted.some(o=>o.reason==='OVERSIZE_WINDOW_DETAIL'));assert.equal((await house.json(house.manifest.repairedSource)).floors[0].rooms[0].openings.find(o=>o.type==='window').clearWidthMeters,12);
});

test('all six passes coexist in one reproducible eleven-identity archive with optional gameplay contracts',async()=>{
 const src=JSON.parse(await readFile(new URL('./fixtures/forge-atmosphere.json',import.meta.url))),snapshot=structuredClone(src),a=await compileFixture(src),b=await compileFixture(src);assert.deepEqual(a.bytes,b.bytes);assert.deepEqual(src,snapshot);assert.ok(a.house.playability.staticRoutesVerified);const budget=await a.house.json(a.house.manifest.packageBudget);assert.ok(budget.withinPlanningBudget);assert.ok(budget.components.withinLimits);
 for(const id of ['raised-wainscoting','coffered-ceilings','ceiling-chandelier','story-vignette','gothic-textiles'])assert.ok(budget.components.byComponent[id]?.triangles>0,id+' integrated geometry');
 assert.ok(budget.models.some(m=>m.path.includes('furniture/')&&m.triangles>500),'heirloom catalog geometry exported');assert.deepEqual(new Set(a.house.decoration.roomContents.map(c=>c.identity)),new Set(Object.keys(ROOM_PROFILES)));
 for(const c of a.house.decoration.roomContents){assert.equal(c.discovery.id,'room:'+c.roomId);assert.equal(c.discovery.optional,true);assert.equal(c.discovery.requiredForQuest,false);assert.ok(c.storyArrangements.length);assert.equal(c.atmosphere.edition,'gothic-atmosphere-1');assert.equal(a.house.decoration.lights.filter(l=>l.roomId===c.roomId&&l.role==='key').length,1);const owners=c.componentReport.emitted.filter(e=>e.surface?.startsWith('support:'));assert.equal(new Set(owners.map(e=>e.surface)).size,owners.length);}
 assert.equal((await a.house.json('qa/environmental_storytelling.json')).newRequiredObjectives,0);assert.equal((await a.house.json('qa/gothic_atmosphere.json')).rooms.length,11);
});

test('the integrated Game haunting layer does not reconstruct compiled canopy or generic webs and can be reentered',async()=>{
 const src=source(room({roomTheme:'bedroom',name:'Bedchamber'})),{house}=await compileFixture(src),h=createHauntedInteriors(T,{quality:'performance',reducedMotion:true});h.configure(house,0,17,[]);assert.ok(h.roomContents[0].storyArrangements.length);assert.equal(h.dustPool.capacity,0);assert.ok(!h.root.getObjectByName('Hand-draped canopy'));assert.ok(!h.root.children.some(c=>c.isLineSegments),'compiled per-room aging owns webs');const count=h.root.children.length;h.tick(1000,[3,0,3],house.rooms[0].id);h.configure(house,0,17,[]);assert.equal(h.root.children.length,count);h.dispose();assert.equal(h.root.children.length,0);
});

test('all eleven explicit student identities, protected furnishings, finishes and openings retain priority together',async()=>{
 const src=JSON.parse(await readFile(new URL('./fixtures/forge-atmosphere.json',import.meta.url)));
 for(const floor of src.floors)for(const r of floor.rooms){r.name='Student space '+r.id;r.flooring='checker';r.finishes={panel:'stone',trim:'ivory',ceiling:'wood'};r.furniture=[{id:'student-'+r.id,type:'writing_desk',x:.15,y:.2,rotation:0,allowAccessories:false,furnitureStyle:{wood:'ebony',upholstery:'ivory',condition:'preserved'}}];}
 const snapshot=structuredClone(src),{house}=await compileFixture(src);assert.deepEqual(src,snapshot);assert.ok(house.playability.staticRoutesVerified);
 for(const r of src.floors.flatMap(f=>f.rooms)){const f=house.decoration.furniture.find(f=>f.id==='student-'+r.id),c=house.decoration.roomContents.find(c=>c.roomId===r.id);assert.ok(f?.authored,r.id);assert.deepEqual(f.source,r.furniture[0]);assert.equal(f.furnitureStyle.wood,'ebony');assert.equal(f.furnitureStyle.upholstery,'ivory');assert.equal(c.identity,r.roomTheme);assert.ok(c.storyArrangements.every(a=>a.supportId!==f.id));}
 const repairs=await house.json(house.manifest.repairLog);assert.ok(!repairs.changes.some(c=>/REPLACE|RELOCATE/.test(c.code)&&String(c.objectId).startsWith('student-')));
});

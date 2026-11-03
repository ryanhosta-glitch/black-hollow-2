import test from 'node:test';
import assert from 'node:assert/strict';
import {partitionPixels,paintSections,countLit,DARK,fractionTotals} from '../north_pole/fraction_arch.mjs';
import {programFractionPixels,firstShowSections} from '../north_pole/first_show_engine.mjs';
import {evaluate,fixtureColors} from '../north_pole/sequencer.mjs';

const fixture={id:'arch-1',name:'Arch 1',anchorId:'prop:arch:arch',profileId:'rgb-pixels',nodes:24,universe:1,address:1};
const section={id:'0',startTick:0,endTick:3840,name:'Opening'};
const baseline={id:'cue',fixtureId:'arch-1',startTick:0,endTick:3840,effect:'steady',color:'#ff0000',brightness:1,authoredWith:'creative'};
const project=()=>({version:3,fixtures:[structuredClone(fixture)],cues:[structuredClone(baseline)]});

test('24 pixels divide exactly into halves, fourths and eighths',()=>{
 for(const [den,expected]of [[2,12],[4,6],[8,3]]){const ranges=partitionPixels(24,den);assert.equal(ranges.length,den);assert.ok(ranges.every(r=>r.count===expected));assert.equal(ranges.at(-1).end,24);}
});
test('25 pixels cannot pretend to form eight equal bulb groups',()=>assert.throws(()=>partitionPixels(25,8),/cannot form/));
test('day 2: two red eighths + three green eighths light exactly 15 pixels',()=>{
 let pixels=Array(24).fill(DARK);
 pixels=paintSections(pixels,8,[0,1],'#ef4444');
 pixels=paintSections(pixels,8,[2,3,4],'#22c55e');
 assert.equal(pixels.filter(c=>c==='#ef4444').length,6);
 assert.equal(pixels.filter(c=>c==='#22c55e').length,9);
 assert.deepEqual(fractionTotals(pixels,8),{lit:5,parts:8,litPixels:15,offPixels:9});
});
test('day 3: one half white plus one fourth red equals eighteen real pixels',()=>{
 let pixels=Array(24).fill(DARK);
 pixels=paintSections(pixels,4,[0,1],'#ffffff');
 pixels=paintSections(pixels,4,[2],'#ef4444');
 assert.equal(countLit(pixels),18);
});
test('day 4: 7 eighths minus 2 eighths plus one eighth',()=>{
 let pixels=paintSections(Array(24).fill(DARK),8,[0,1,2,3,4,5,6],'#ef4444');
 assert.equal(countLit(pixels),21);
 pixels=paintSections(pixels,8,[5,6],DARK);
 assert.equal(countLit(pixels),15);
 pixels=paintSections(pixels,8,[7],'#22c55e');
 assert.equal(countLit(pixels),18);
});
test('programming writes a real replayable per-node cue without touching other cues',()=>{
 let colors=paintSections(Array(24).fill(DARK),8,[0,1],'#ef4444');
 colors=paintSections(colors,8,[2,3,4],'#22c55e');
 const p=project();const next=programFractionPixels(p,fixture,section,colors);
 assert.equal(next[0].effect,'fraction-pixels');
 assert.equal(next[0].pixelColors.length,24);
 assert.equal(p.cues[0].effect,'steady');
 p.cues=next;
 const state=evaluate(p,500),actual=fixtureColors(fixture,state.universes);
 assert.deepEqual(actual[0],[239/255,68/255,68/255]);
 assert.deepEqual(actual[6],[34/255,197/255,94/255]);
 assert.deepEqual(actual[20],[0,0,0]);
});
test('a math cue is protected from destructive simple editing',()=>{
 const p=project();p.cues[0].math={prediction:'',explanation:''};
 assert.throws(()=>programFractionPixels(p,fixture,section,Array(24).fill(DARK)),/detailed programming/);
});
test('an overlapping patch must be reviewed in the full studio',()=>{
 const p=project();p.fixtures.push({...fixture,id:'other',address:2});
 assert.throws(()=>programFractionPixels(p,fixture,section,Array(24).fill(DARK)),/shares DMX channels/);
});

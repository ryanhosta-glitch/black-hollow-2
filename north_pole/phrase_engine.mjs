import {musicMap,footprint,profile} from './sequencer.mjs';
import {creativeCue} from './creative_engine.mjs';
export function phraseFromMeasures(song,first,last,name='My musical phrase') {
 const map=musicMap(song),a=map.bars[first-1],b=map.bars[last-1];
 if(!Number.isInteger(first)||!Number.isInteger(last)||!a||!b||last<first)throw Error('Choose a start and ending measure in this song.');
 const arrivalTick=b.tick+Math.floor((b.endTick-b.tick-1)/b.beatTicks)*b.beatTicks;
 return {id:crypto.randomUUID(),name:String(name).trim().slice(0,80)||'My musical phrase',firstMeasure:first,lastMeasure:last,startTick:a.tick,endTick:b.endTick,arrivalTick};
}
export function validatePhrases(phrases,song) {
 if(phrases===undefined)return;
 if(!Array.isArray(phrases)||phrases.length>100||new Set(phrases.map(p=>p.id)).size!==phrases.length)throw Error('Use up to 100 uniquely named phrase markers.');
 for(const p of phrases){const expected=phraseFromMeasures(song,p.firstMeasure,p.lastMeasure,p.name);if(typeof p.id!=='string'||!p.id||typeof p.name!=='string'||p.name.length>80||p.startTick!==expected.startTick||p.endTick!==expected.endTick||p.arrivalTick!==expected.arrivalTick)throw Error('A saved musical phrase does not match this song.');}
}
export function orderedIndependentFixtures(fixtures) {
 const seen=new Set();return fixtures.filter(f=>{const key=`${f.universe}:${f.address}:${footprint(f)}:${f.profileId}`;if(seen.has(key))return false;seen.add(key);return true;});
}
export function programPhrase(project,phrase,fixtures,{kind='rainbow',color='#ff3355',brightness=.75,cycles=1,tail=3,direction=1}={}) {
 if(!['rainbow','arrival','comet'].includes(kind)||!Number.isFinite(cycles)||cycles<.1||cycles>20||!Number.isInteger(tail)||tail<1||tail>32||![1,-1].includes(direction))throw Error('Choose a supported phrase effect and valid settings.');
 if(!/^#[a-f\d]{6}$/i.test(color)||!Number.isFinite(brightness)||brightness<0||brightness>1)throw Error('Choose a color and brightness between zero and full.');
 validatePhrases([phrase],project.song);let ordered=orderedIndependentFixtures(fixtures);if(!ordered.length)throw Error('Select at least one patched light.');if(direction===-1&&kind!=='rainbow')ordered=ordered.slice().reverse();
 const counts=ordered.map(f=>profile(f.profileId).pixel?f.nodes:profile(f.profileId).zones||1),total=counts.reduce((sum,n)=>sum+n,0);let offset=0;
 if(kind!=='rainbow'&&phrase.arrivalTick<=phrase.startTick)throw Error('Choose a longer phrase so the final beat occurs after the starting beat.');
 const cues=ordered.map((fixture,i)=>{const cue=creativeCue({fixtureId:fixture.id,startTick:phrase.startTick,endTick:phrase.endTick,effect:kind==='rainbow'?'rainbow':'routed-chase',color,brightness,parameters:{speed:cycles,direction,phase:kind==='rainbow'?offset/total:0}});cue.phraseId=phrase.id;if(kind!=='rainbow')cue.route={offset,count:counts[i],total,arrivalTick:phrase.arrivalTick,tail:kind==='comet'?tail:1,reverse:direction===-1};else cue.spatialPhase={offset,total};offset+=counts[i];return cue;});
 return {cues,fixtureIds:ordered.map(f=>f.id),nodes:total,mirroredRepresentations:fixtures.length-ordered.length};
}
export function routedGain(route,tick,startTick,node) {
 const head=Math.min(route.total-1,Math.floor(Math.max(0,(tick-startTick)/(route.arrivalTick-startTick))*(route.total-1)+1e-9));
 const distance=head-(route.offset+(route.reverse?route.count-1-node:node));return distance>=0&&distance<route.tail?1-distance/route.tail:0;
}

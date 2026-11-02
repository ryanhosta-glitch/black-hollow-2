import {footprint} from './sequencer.mjs';
export function recordConsoleLook(project,{fixtureId,values,startTick,endTick,fadeInTicks=0,name='Console look',updateId=null}){
 const f=project.fixtures.find(f=>f.id===fixtureId);if(!f)throw Error('Select a patched fixture.');
 if(!Array.isArray(values)||values.length!==footprint(f)||values.some(v=>!Number.isInteger(v)||v<0||v>255))throw Error('Capture one valid byte for every channel.');
 const existing=updateId?project.cues.find(c=>c.id===updateId):null;
 if(updateId&&(!existing||existing.fixtureId!==fixtureId||existing.authoredWith!=='console'))throw Error('Select a recorded console cue for this fixture. Math and effect cues stay unchanged.');
 if(existing){startTick=existing.startTick;endTick=existing.endTick;}
 if(!Number.isInteger(startTick)||!Number.isInteger(endTick)||startTick<0||endTick<=startTick||endTick>project.song.endTick||!Number.isInteger(fadeInTicks)||fadeInTicks<0||fadeInTicks>endTick-startTick)throw Error('Choose valid timing and a fade that fits inside the cue.');
 if(project.cues.some(c=>c.fixtureId===fixtureId&&c.id!==updateId&&c.startTick<endTick&&c.endTick>startTick))throw Error('This fixture already has a cue here. Select a console cue and Update, or choose an empty part.');
 if(!existing&&project.cues.length>=2000)throw Error('Studio limit: 2,000 cues.');
 const cue={id:existing?.id||crypto.randomUUID(),fixtureId,startTick,endTick,effect:'channels',color:'#ffffff',brightness:1,channelValues:values.slice(),authoredWith:'console',fadeInTicks,name:String(name).trim().slice(0,80)||'Console look'};
 return {cue,cues:existing?project.cues.map(c=>c.id===existing.id?cue:c):[...project.cues,cue]};
}

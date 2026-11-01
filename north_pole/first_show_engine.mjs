import {autoPatch,estimateNodes} from './creative_engine.mjs';
import {buildStarterShow} from './show_starter.mjs';
import {newDisplayModel,displayPaths,projectPaths} from './display_models.mjs';
import {musicMap,footprint} from './sequencer.mjs';
export function prepareFirstShow(project){
 if(project.cues.length)throw Error('Open your existing show below. Your programming will stay unchanged.');
 const next=structuredClone(project);
 if(!next.fixtures.length){
 const paths=projectPaths(next),selected=[];
 for(const [kind,limit]of [['roof',3],['window',4],['door',1]])selected.push(...paths.filter(p=>p.kind.includes(kind)).slice(0,limit));
 if(!selected.length)selected.push(...paths.slice(0,8));
 for(const p of selected)next.fixtures.push(autoPatch(next.fixtures,{id:crypto.randomUUID(),name:p.name||p.kind,anchorId:p.id,profileId:'rgb-pixels',nodes:Math.min(100,estimateNodes(p,.2))}));
 const b=next.house.yardBounds;
 if(b){const center=(b.minX+b.maxX)/2,models=[...[-1,0,1].map((v,i)=>newDisplayModel('arch',next.house,{name:'Arch '+(i+1),x:center+v*3,z:b.minZ-2,nodes:24})),newDisplayModel('strand-tree',next.house,{name:'Light tree',x:b.maxX+2,z:b.minZ,height:3,width:2,strands:8,nodes:24})];
 next.props=[...(next.props||[]),...models];for(const model of models)for(const p of displayPaths(model))next.fixtures.push(autoPatch(next.fixtures,{id:crypto.randomUUID(),name:p.name,anchorId:p.id,profileId:'rgb-pixels',nodes:model.nodes}));}
 }
 const show=buildStarterShow(next);next.version=3;next.fixtures=show.fixtures;next.cues=show.cues;return next;
}
export function firstShowGroups(project){const paths=projectPaths(project);const groups=new Map();for(const f of project.fixtures){const p=paths.find(p=>p.id===f.anchorId),model=project.props?.find(m=>m.id===p?.propId);const key=model?'model:'+model.id:p?.kind.includes('roof')?'roof':p?.kind.includes('window')?'windows':p?.kind.includes('door')?'door':'fixture:'+f.id;const name=model?.name||({roof:'Roof lights',windows:'Windows',door:'Door lights'}[key])||f.name;if(!groups.has(key))groups.set(key,{id:key,name,fixtures:[]});groups.get(key).fixtures.push(f);}return [...groups.values()];}
export function firstShowSections(project){const ticks=[...new Set(project.cues.flatMap(c=>[c.startTick,c.endTick]))].sort((a,b)=>a-b);if(ticks.length<2)return [];if(ticks.length>65)return [];const names=['Opening','Getting brighter','Dancing lights','Color surprise','Here we go','Big moment','One more sparkle','Finale'];return ticks.slice(0,-1).map((start,i)=>({id:String(start),startTick:start,endTick:ticks[i+1],name: ticks.length===9?names[i]:i===0?'Opening':i===ticks.length-2?'Finale':'Part '+(i+1)}));}
const safeEffects=new Set(['steady','wave','marquee','snowfall','rainbow','comet','sparkle','pulse','chase']);
export function editFirstShow(project,group,section,change){
 if(!group||!section)throw Error('Choose some lights and a song part first.');
 if(change.color!==undefined&&!/^#[a-f\d]{6}$/i.test(change.color))throw Error('Choose a valid color.');
 if(change.effect!==undefined&&!safeEffects.has(change.effect))throw Error('Choose an available effect.');
 const members=new Set(group.fixtures.map(f=>f.id));
 for(const f of group.fixtures)if(project.fixtures.some(other=>!members.has(other.id)&&other.universe===f.universe&&other.address<f.address+footprint(f)&&f.address<other.address+footprint(other)))throw Error('These lights share channels with another group. Use the full studio to review their shared patch.');
 const affected=project.cues.filter(c=>members.has(c.fixtureId)&&c.startTick<section.endTick&&c.endTick>section.startTick);
 if(!affected.length)throw Error('There is no look in this part. Use the full studio to add one.');
 for(const f of group.fixtures){const cues=affected.filter(c=>c.fixtureId===f.id);if(cues.length!==1||cues[0].startTick!==section.startTick||cues[0].endTick!==section.endTick||cues[0].math||cues[0].route||cues[0].spatialPhase||cues[0].effect==='channels'||cues[0].effect==='pixel-screen')throw Error('This part has detailed programming. It is safe in the full studio; simple editing will not change it.');}
 const ids=new Set(affected.map(c=>c.id));return project.cues.map(c=>ids.has(c.id)?{...structuredClone(c),...change}:c);
}
export function auditionTick(section){return Math.floor((section.startTick+section.endTick)/2);}

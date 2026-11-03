import {starterPaths} from './starter_rig.mjs';
import {orderedRoute} from './group_routes.mjs';
import {autoPatch,estimateNodes} from './creative_engine.mjs';
import {buildStarterShow} from './show_starter.mjs';
import {newDisplayModel,displayPaths,projectPaths} from './display_models.mjs';
import {musicMap,footprint} from './sequencer.mjs';
import {validateFractionColors} from './fraction_arch.mjs';
export function prepareFirstShow(project){
 if(project.cues.length)throw Error('Open your existing show below. Your programming will stay unchanged.');
 const next=structuredClone(project);
 if(!next.fixtures.length){
 const selected=starterPaths(next.house),counts={};
 for(const p of selected){const type=p.kind.includes('roof')?'Roof segment':p.kind.includes('window')?'Window':p.kind.includes('door')?'Door':'Lights',index=counts[type]=(counts[type]||0)+1;next.fixtures.push(autoPatch(next.fixtures,{id:crypto.randomUUID(),name:(p.name||type).slice(0,72)+' '+index,anchorId:p.id,profileId:'rgb-pixels',nodes:Math.min(100,estimateNodes(p,.2))}));}
 const b=next.house.yardBounds;
 if(b){const center=(b.minX+b.maxX)/2,models=next.props?.length?next.props:[...[-1,0,1].map((v,i)=>newDisplayModel('arch',next.house,{name:'Arch '+(i+1),x:center+v*3,z:b.minZ-2,nodes:24})),newDisplayModel('strand-tree',next.house,{name:'Light tree',x:b.maxX+2,z:b.minZ,height:3,width:2,strands:8,nodes:24})];
 next.props=models;for(const model of models)for(const p of displayPaths(model)){if(next.fixtures.length>=200)throw Error('This yard needs more than 200 fixtures. Reduce its models or use the full studio.');next.fixtures.push(autoPatch(next.fixtures,{id:crypto.randomUUID(),name:p.name,anchorId:p.id,profileId:'rgb-pixels',nodes:model.nodes}));}}
 }
 const show=buildStarterShow(next);next.version=Math.max(next.version,3);next.fixtures=show.fixtures;next.cues=show.cues;return next;
}
export function firstShowGroups(project){const paths=projectPaths(project);const groups=new Map();for(const f of project.fixtures){const p=paths.find(p=>p.id===f.anchorId),model=project.props?.find(m=>m.id===p?.propId);const key=f.matrix?'screen:'+f.matrix.screenId:model?'model:'+model.id:p?.kind.includes('roof')?'roof':p?.kind.includes('window')?'windows':p?.kind.includes('door')?'door':'fixture:'+f.id;const name=(f.matrix?project.pixelScreens?.find(s=>s.id===f.matrix.screenId)?.name||'Pixel screen':null)||model?.name||({roof:'Roof lights',windows:'Windows',door:'Door lights'}[key])||f.name;if(!groups.has(key))groups.set(key,{id:key,name,fixtures:[]});groups.get(key).fixtures.push(f);}return [...groups.values()];}
export function firstShowSections(project){const ticks=[...new Set(project.cues.flatMap(c=>[c.startTick,c.endTick]))].sort((a,b)=>a-b);if(ticks.length<2)return [];if(ticks.length>65)return [];const names=['Opening','Getting brighter','Dancing lights','Color surprise','Here we go','Big moment','One more sparkle','Finale'];return ticks.slice(0,-1).map((start,i)=>({id:String(start),startTick:start,endTick:ticks[i+1],name: ticks.length===9?names[i]:i===0?'Opening':i===ticks.length-2?'Finale':'Part '+(i+1)}));}
const safeEffects=new Set(['steady','wave','marquee','snowfall','rainbow','comet','sparkle','pulse','chase']);
export function editFirstShow(project,group,section,change){
 if(!group||!section)throw Error('Choose some lights and a song part first.');
 if(change.color!==undefined&&!/^#[a-f\d]{6}$/i.test(change.color))throw Error('Choose a valid color.');
 if(change.brightness!==undefined&&(!Number.isFinite(change.brightness)||change.brightness<0||change.brightness>1))throw Error('Brightness must be between zero and full.');
 if(change.arrivalTick!==undefined&&(!Number.isInteger(change.arrivalTick)||change.arrivalTick<=section.startTick||change.arrivalTick>=section.endTick))throw Error('Choose an arrival time inside this song part.');
 if(change.fadeInTicks!==undefined&&(!Number.isInteger(change.fadeInTicks)||change.fadeInTicks<0||change.fadeInTicks>section.endTick-section.startTick))throw Error('The fade must fit inside this song part.');
 if(change.effect!==undefined&&!safeEffects.has(change.effect))throw Error('Choose an available effect.');
 const members=new Set(group.fixtures.map(f=>f.id));
 for(const f of group.fixtures)if(project.fixtures.some(other=>other.id!==f.id&&other.universe===f.universe&&other.address<f.address+footprint(f)&&f.address<other.address+footprint(other)))throw Error('These lights share channels with another group. Use the full studio to review their shared patch.');
 const affected=project.cues.filter(c=>members.has(c.fixtureId)&&c.startTick<section.endTick&&c.endTick>section.startTick);
 if(!affected.length)throw Error('There is no look in this part. Use the full studio to add one.');
 for(const f of group.fixtures){const cues=affected.filter(c=>c.fixtureId===f.id);if(cues.length!==1||cues[0].startTick!==section.startTick||cues[0].endTick!==section.endTick||cues[0].math||(cues[0].route&&!cues[0].simpleRoute)||cues[0].spatialPhase||cues[0].effect==='channels'||cues[0].effect==='pixel-screen'||cues[0].effect==='fraction-pixels')throw Error('This part has detailed programming. It is safe in the full studio; simple editing will not change it.');}
 if(change.effect==='chase'&&section.endTick-section.startTick<2)throw Error('Choose a longer part for a traveling chase.');
 const bar=musicMap(project.song).bars.find(b=>section.endTick-1>=b.tick&&section.endTick-1<b.endTick);let arrival=bar?bar.tick+Math.floor((section.endTick-bar.tick-1)/bar.beatTicks)*bar.beatTicks:section.startTick;
 if(arrival<=section.startTick)arrival=section.startTick+Math.max(1,Math.floor((section.endTick-section.startTick)*.8));arrival=Math.min(section.endTick-1,arrival);
 const ids=new Set(affected.map(c=>c.id));let routes=change.effect==='chase'?orderedRoute(project,group.fixtures,{reverse:change.reverse===true,fixtureOrder:change.fixtureOrder||null}):null;
 if(change.reverseCurrent){if(!affected.every(c=>c.simpleRoute&&c.route))throw Error('Choose Chase before reversing its route.');const ordered=affected.slice().sort((a,b)=>b.route.offset-a.route.offset),total=ordered.reduce((sum,c)=>sum+c.route.count,0);let offset=0;routes=ordered.map(c=>{const result={fixtureId:c.fixtureId,offset,count:c.route.count,total,reverse:!c.route.reverse};offset+=c.route.count;return result;});}
 return project.cues.map(c=>{if(!ids.has(c.id))return c;const next={...structuredClone(c)};for(const key of ['color','effect','brightness','fadeInTicks'])if(change[key]!==undefined)next[key]=change[key];
  if(change.color!==undefined&&change.effect===undefined&&['rainbow','snowfall','firelight','candle'].includes(c.effect))next.effect='steady';
  if(change.effect!==undefined&&change.effect!=='chase'){delete next.route;delete next.simpleRoute;delete next.routeDirection;}
  if(routes){const route=routes.find(r=>r.fixtureId===c.fixtureId);next.effect='routed-chase';next.simpleRoute=true;next.routeDirection=change.reverseCurrent?-(c.routeDirection||1):change.reverse?-1:1;next.route={offset:route.offset,count:route.count,total:route.total,reverse:route.reverse,arrivalTick:change.arrivalTick??(c.simpleRoute?c.route.arrivalTick:arrival),tail:1};}
  return next;});
}
export function auditionTick(section){return Math.floor((section.startTick+section.endTick)/2);}

export function copyFirstLook(project,source,target,section){
 const cues=project.cues.filter(c=>source.fixtures.some(f=>f.id===c.fixtureId)&&c.startTick===section.startTick&&c.endTick===section.endTick);
 if(!cues.length||cues.some(c=>c.math||c.effect==='channels'||c.effect==='pixel-screen'||c.spatialPhase||(c.route&&!c.simpleRoute)))throw Error('Use the full studio to copy this detailed look.');
 const first=cues[0];if(cues.some(c=>c.color!==first.color||c.brightness!==first.brightness||c.effect!==first.effect))throw Error('This group has mixed looks. Give it one look before copying.');
 const copied=editFirstShow(project,target,section,{color:first.color,effect:first.effect==='routed-chase'?'chase':first.effect,reverse:first.routeDirection===-1,arrivalTick:first.route?.arrivalTick,brightness:first.brightness,fadeInTicks:first.fadeInTicks||0});return copied.map(c=>target.fixtures.some(f=>f.id===c.fixtureId)&&c.startTick===section.startTick&&c.endTick===section.endTick?{...c,parameters:{...c.parameters,speed:first.parameters?.speed??2,direction:first.parameters?.direction??1}}:c);
}

export function requiredProjectVersion(cues){return cues.some(c=>c.fadeInTicks!==undefined||c.simpleRoute!==undefined||c.authoredWith==='console')?4:3;}

export function programFractionPixels(project,fixture,section,colors){
 if(!fixture||fixture.profileId!=='rgb-pixels'||!validateFractionColors(colors,fixture.nodes))throw Error('Choose a real addressable RGB arch and valid pixels.');
 if(!project.fixtures.some(f=>f.id===fixture.id))throw Error('This arch is not in your project.');
 if(!section||!Number.isInteger(section.startTick)||!Number.isInteger(section.endTick))throw Error('Choose a valid song part.');
 if(project.fixtures.some(f=>f.id!==fixture.id&&f.universe===fixture.universe&&f.address<fixture.address+footprint(fixture)&&fixture.address<f.address+footprint(f)))throw Error('This arch shares DMX channels. Use the full studio to correct its patch.');
 const overlap=project.cues.filter(c=>c.fixtureId===fixture.id&&c.startTick<section.endTick&&c.endTick>section.startTick);
 if(overlap.length!==1||overlap[0].startTick!==section.startTick||overlap[0].endTick!==section.endTick)throw Error('This song part has detailed timing. Use a new starter show rather than overwrite it.');
 const original=overlap[0];
 if(original.math||original.route&&!original.simpleRoute||original.spatialPhase||original.effect==='channels'||original.effect==='pixel-screen')throw Error('This is detailed programming. The fraction editor will not overwrite it.');
 const cue={id:original.id,fixtureId:fixture.id,startTick:section.startTick,endTick:section.endTick,effect:'fraction-pixels',color:'#ffffff',brightness:1,authoredWith:'creative',pixelColors:colors.slice()};
 const cues=project.cues.map(c=>c.id===original.id?cue:c);
 return cues;
}

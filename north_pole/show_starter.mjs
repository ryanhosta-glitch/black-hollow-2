// Real, editable cues: the starter uses the same byte-producing engine as lessons.
import {musicMap} from './sequencer.mjs';
import {autoPatch,estimateNodes,creativeCue} from './creative_engine.mjs';
import {projectPaths} from './display_models.mjs';
export const SHOW_STYLES={
 peppermint:{name:'Peppermint Parade',colors:['#ff244a','#fff0c2','#22dba0'],effects:['steady','marquee','wave','rainbow']},
 snow:{name:'Snowfall Symphony',colors:['#b9e7ff','#647dff','#fff7dc'],effects:['steady','snowfall','wave','rainbow']},
 aurora:{name:'Northern Lights',colors:['#40ffd1','#b45cff','#4caaff'],effects:['wave','rainbow','comet','rainbow']}
};
export function buildStarterShow(project,style='peppermint'){
 const recipe=SHOW_STYLES[style];if(!recipe)throw Error('Choose a show style.');
 if(!project.house)throw Error('Choose a model or your own house first.');
 if(project.cues.length)throw Error('Your show already has programming. Download it first, or use Undo to return to an empty show. The starter will not replace your work.');
 const fixtures=structuredClone(project.fixtures);
 if(!fixtures.length){for(const path of projectPaths(project).slice(0,32)){fixtures.push(autoPatch(fixtures,{id:crypto.randomUUID(),name:path.name||path.kind,anchorId:path.id,profileId:'rgb-pixels',nodes:Math.min(170,estimateNodes(path,.18))}));}}
 if(!fixtures.length)throw Error('This house needs an attachment path before adding lights.');
 const map=musicMap(project.song),cues=[];
 // Scale to the whole arrangement, using measure boundaries rather than seconds.
 const sections=Math.min(8,map.bars.length);if(!sections)throw Error('This song needs at least one measure.');
 for(let section=0;section<sections;section++){
  const first=Math.floor(section*map.bars.length/sections),last=Math.floor((section+1)*map.bars.length/sections)-1;
  const finale=section===sections-1;
  for(const [i,f]of fixtures.entries()){
   // Matrix rows retain their saved artwork; do not scramble it into a strand effect.
   const matrix=f.matrix&&project.pixelScreens?.some(s=>s.id===f.matrix.screenId);
   const effect=matrix?'pixel-screen':finale?'rainbow':recipe.effects[section%recipe.effects.length];
   cues.push(creativeCue({fixtureId:f.id,startTick:map.bars[first].tick,endTick:map.bars[last].endTick,effect,color:recipe.colors[(i+section)%recipe.colors.length],brightness:finale?.95:.72,parameters:{speed:Math.min(20,Math.max(1,(last-first+1)/2)),phase:i/fixtures.length,direction:section%2?-1:1}}));
  }
 }
 if(cues.length>2000)throw Error('This starter needs fewer than 2,000 cues.');
 return {fixtures,cues,sections,name:recipe.name};
}

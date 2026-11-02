import {samplePath} from './placement.mjs';
import {projectPaths} from './display_models.mjs';
import {profile} from './fixture_channels.mjs';
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
export function orderedRoute(project,fixtures,{reverse=false,fixtureOrder=null}={}){
 const paths=new Map(projectPaths(project).map(p=>[p.id,p]));
 const pending=fixtures.map(f=>{const p=paths.get(f.anchorId);if(!p?.pointsMeters?.length)throw Error('This light needs a physical path.');const mode=profile(f.profileId);return {fixture:f,points:samplePath(p,mode.pixel?f.nodes:mode.zones||1)};});
 if(fixtureOrder&&(!Array.isArray(fixtureOrder)||fixtureOrder.length!==pending.length||new Set(fixtureOrder).size!==pending.length||fixtureOrder.some(id=>!pending.some(p=>p.fixture.id===id))))throw Error('A travel route must include each selected fixture once.');
 const endpoints=pending.flatMap(p=>[p.points[0],p.points.at(-1)]).sort((a,b)=>a[0]-b[0]||a[2]-b[2]||a[1]-b[1]);let at=fixtureOrder?pending.find(p=>p.fixture.id===fixtureOrder[0]).points[0]:endpoints[0],ordered=[];
 while(pending.length){const choices=pending.flatMap((p,index)=>fixtureOrder&&p.fixture.id!==fixtureOrder[ordered.length]?[]:[{index,reverse:false,start:p.points[0],end:p.points.at(-1)},{index,reverse:true,start:p.points.at(-1),end:p.points[0]}]).sort((a,b)=>distance(at,a.start)-distance(at,b.start)||pending[a.index].fixture.id.localeCompare(pending[b.index].fixture.id)||Number(a.reverse)-Number(b.reverse));
  const choice=choices[0],p=pending.splice(choice.index,1)[0];ordered.push({...p,reverse:choice.reverse,gap:distance(at,choice.start)});at=choice.end;}
 if(reverse)ordered=ordered.reverse().map(p=>({...p,reverse:!p.reverse}));
 let offset=0;const total=ordered.reduce((sum,p)=>sum+(profile(p.fixture.profileId).pixel?p.fixture.nodes:profile(p.fixture.profileId).zones||1),0);
 return ordered.map(p=>{const count=profile(p.fixture.profileId).pixel?p.fixture.nodes:profile(p.fixture.profileId).zones||1,result={fixtureId:p.fixture.id,name:p.fixture.name,offset,count,total,reverse:p.reverse,gap:p.gap};offset+=count;return result;});
}

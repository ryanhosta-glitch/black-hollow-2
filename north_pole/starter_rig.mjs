import {pathLength} from './creative_engine.mjs';
const center=a=>[0,1,2].map(i=>a.pointsMeters.reduce((sum,p)=>sum+p[i],0)/a.pointsMeters.length);
const height=a=>Math.max(...a.pointsMeters.map(p=>p[1]));
function spread(candidates,count){
 const left=candidates.slice().sort((a,b)=>height(b)-height(a)||pathLength(b)-pathLength(a)||a.id.localeCompare(b.id)),chosen=[];
 while(left.length&&chosen.length<count){if(!chosen.length){chosen.push(left.shift());continue;}
  let best=0,score=-1;for(let i=0;i<left.length;i++){const p=center(left[i]),distance=Math.min(...chosen.map(a=>{const q=center(a);return Math.hypot(p[0]-q[0],p[1]-q[1],(p[2]-q[2])*.4);}));if(distance>score){score=distance;best=i;}}chosen.push(left.splice(best,1)[0]);
 }return chosen;
}
export function starterPaths(house){
 const paths=house.anchors||[],roof=paths.filter(a=>a.kind.includes('roof')),z=roof.flatMap(a=>a.pointsMeters.map(p=>p[2])),mid=z.length?(Math.min(...z)+Math.max(...z))/2:0;
 const outlines=roof.filter(a=>a.kind==='roof-edge'&&center(a)[2]<=mid+.001),eaves=roof.filter(a=>a.kind!=='roof-edge'&&(a.normal?.[2]||0)<-.2);
 let selected=[...spread(outlines,4),...spread(eaves,4)];
 if(selected.length<8)selected.push(...spread(roof.filter(a=>!selected.some(p=>p.id===a.id)&&center(a)[2]<=mid+.001),8-selected.length));
 for(const [kind,count]of [['window',4],['door',1]]){const all=paths.filter(a=>a.kind.includes(kind)),front=all.filter(a=>(a.normal?.[2]||0)<-.2);selected.push(...spread(front.length?front:all,count));}
 if(!selected.length)selected=paths.slice(0,8);return selected;
}

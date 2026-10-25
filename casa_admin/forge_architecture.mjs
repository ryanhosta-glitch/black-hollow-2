import {usesArchitecturalLuxury} from '../casa_game/room_profiles.mjs';
import {roofOrnaments} from './forge_roof_ornaments.mjs';
import {unionRoofSurfaces,uncoveredRectangles} from './forge_roof_union.mjs';
// Architectural dimensions are feet until the compiler's single feet→meters conversion.
import {MAT} from './forge_glb.mjs';
export function openingShape(op,span,height){
 const open=op.type==='open',door=op.type!=='window',requested=Number(op.clearWidthMeters??(door?1.08:1.65));
 const width=Math.max(0,Math.min(requested/.3048,open?span:span-2*.08/.3048));
 const center=Math.max(0,Math.min(1,Number(op.pos??.5)))*span;
 const low=door?0:Math.min(.95/.3048,height*.34),high=open?height:door?Math.min(2.45/.3048,height-.12/.3048):Math.min(height-.15,low+1.55/.3048);
 return {width,center,low,high};
}
export function exposedRuns(room,side,rooms){
 const vertical=side==='left'||side==='right',start=Number(vertical?room.y:room.x),span=Number(vertical?room.w:room.l),wall=Number(vertical?room.x:room.y)+(side==='right'?Number(room.l):side==='bottom'?Number(room.w):0);
 const covered=[];
 for(const q of rooms){if(q===room)continue;const edge=Number(vertical?q.x:q.y)+(side==='left'?Number(q.l):side==='top'?Number(q.w):0);if(Math.abs(edge-wall)>.04)continue;const a=Math.max(0,Number(vertical?q.y:q.x)-start),b=Math.min(span,Number(vertical?q.y:q.x)+Number(vertical?q.w:q.l)-start);if(b>a)covered.push([a,b]);}
 covered.sort((a,b)=>a[0]-b[0]);const runs=[];let cursor=0;for(const [a,b]of covered){if(a>cursor+.01)runs.push([cursor,a]);cursor=Math.max(cursor,b);}if(cursor<span-.01)runs.push([cursor,span]);return runs;
}
export function architecturalDetails(floor,fi,allFloors,levels){
 const boxes=[],add=(c,s,mat,rot=0,rotAxis='z')=>{if(c.every(Number.isFinite)&&s.every(v=>Number.isFinite(v)&&v>.009))boxes.push({c,s,mat,rot,rotAxis});};
 for(const r of floor.rooms){
  const x=+r.x,z=+r.y,l=+r.l,w=+r.w,h=+r.h,b=levels[fi]||0;
  for(const side of ['top','bottom','left','right']){
   const vertical=side==='left'||side==='right',span=vertical?w:l,wall=vertical?(side==='left'?x:x+l):(side==='top'?z:z+w),out=side==='top'||side==='left'?-1:1;
   const put=(at,y,length,height,depth,offset,mat)=>add(vertical?[wall+offset,b+y,z+at]:[x+at,b+y,wall+offset],vertical?[depth,height,length]:[length,height,depth],mat);
   const openings=(r.openings||[]).filter(o=>o.wall===side).map(o=>({...openingShape(o,span,h),type:o.type}));
   const runs=exposedRuns(r,side,floor.rooms);
   for(const [a,c]of runs){
    // Split siding at both horizontal and vertical aperture edges, including partially shared walls.
    const cuts=[...new Set([a,c,...openings.flatMap(o=>[Math.max(a,Math.min(c,o.center-o.width/2)),Math.max(a,Math.min(c,o.center+o.width/2))])])].sort((a,b)=>a-b);
    for(let i=1;i<cuts.length;i++){
     const lo=cuts[i-1],hi=cuts[i],mid=(lo+hi)/2;if(hi-lo<.01)continue;
     const holes=openings.filter(o=>Math.abs(mid-o.center)<o.width/2+.001),ys=[...new Set([0,h,...holes.flatMap(o=>[o.low,o.high])])].sort((a,b)=>a-b);
     for(let j=1;j<ys.length;j++){const low=ys[j-1],high=ys[j];if(holes.some(o=>(low+high)/2>o.low&&(low+high)/2<o.high))continue;put(mid,(low+high)/2,hi-lo,high-low,.075,out*.24,MAT.siding);}
    }
    put((a+c)/2,-.23,c-a,.40,.38,0,MAT.stone);
    // Continuous eaves remain above door heads; lower skirt is split by apertures.
    put((a+c)/2,h-.06,c-a,.16,.44,0,MAT.trim);
    for(const at of [a+.04,c-.04])put(at,h/2,.12,h,.15,out*.21,MAT.trim);
   }
   for(const o of openings){
    if(o.type==='open')continue;
    // Jambs stay outside the authored clear aperture, transoms stay above it.
    const low=o.type==='window'?o.low:0,high=o.high;
    for(const sign of [-1,1]){const at=o.center+sign*(o.width/2+.085);if(at<0||at>span)continue;put(at,(low+high)/2,.14,high-low,.38,0,MAT.trim);}
    put(o.center,high+.10,o.width+.32,.16,.40,0,MAT.trim);
    if(o.type==='window'){
     put(o.center,low-.06,o.width+.38,.16,.48,0,MAT.trim);
     put(o.center,(low+high)/2,o.width,high-low,.025,0,MAT.glass);
     put(o.center,(low+high)/2,.065,high-low,.10,0,MAT.wood);
     put(o.center,(low+high)/2,o.width,.065,.10,0,MAT.wood);
    }
   }
  }
  const shaft=r.forgeStairTraversalEnabled&&/stair/i.test([r.name,r.type,r.roomType].join(' '));
  if(!shaft&&!usesArchitecturalLuxury(r)&&Math.min(l,w)>6){
   // Shallow plaster coffers stay against the ceiling and above walking headroom.
   for(const t of [.25,.5,.75]){
    add([x+l*t,b+h-.055,z+w/2],[.09,.10,Math.max(.1,w-.5)],MAT.trim);
    add([x+l/2,b+h-.055,z+w*t],[Math.max(.1,l-.5),.10,.09],MAT.trim);
   }
  }
 }
 return boxes;
}

// Closed convex roof solids: gables have triangular end walls; hips and mansards
// share the same indexed writer rather than intersecting disconnected roof boards.
export function buildRoofs(floors,levels,sourceRoof={}){
 let top=floors.length-1;while(top>=0&&!floors[top].rooms.length)top--;if(top<0)return [];
 const boxes=[],volumes=[];
 const solid=(x,z,l,w,y,rise,insetX,insetZ,mat)=>{
  const a=l/2,e=w/2,d=rise/2,ax=Math.max(0,a-insetX),ez=Math.max(0,e-insetZ);
  volumes.push({c:[x+l/2,y+d,z+w/2],s:[l,rise,w],mat,vertices:[[-a,-d,-e],[a,-d,-e],[ax,d,-ez],[-ax,d,-ez],[-a,-d,e],[a,-d,e],[ax,d,ez],[-ax,d,ez]]});
 };
 for(const [fi,floor]of floors.entries())for(const r of floor.rooms){
  const base=levels[fi]||0,above=floors.slice(fi+1).flatMap(f=>f.rooms),uncovered=uncoveredRectangles(r,above);
  if(!uncovered.length)continue;
  const area=uncovered.reduce((a,p)=>a+p.l*p.w,0);
  if(area<Number(r.l)*Number(r.w)-.001){for(const p of uncovered)boxes.push({c:[p.x+p.l/2,base+Number(r.h)+.20,p.z+p.w/2],s:[p.l,.24,p.w],mat:MAT.roof});continue;}
  const x=+r.x-.35,z=+r.y-.35,l=+r.l+.7,w=+r.w+.7,y=base+Number(r.h)+.20,roof=r.roof||floor.roof||sourceRoof||{},kind=String(r.roofType||floor.roofType||roof.type||'gable').toLowerCase(),rise=Math.max(.5,Math.min(14,Number(r.roofRise??floor.roofRise??roof.rise??Math.min(l*.65,8))));
  if(kind==='flat'||kind==='none')boxes.push({c:[x+l/2,y+.10,z+w/2],s:[l,.2,w],mat:MAT.roof});
  else if(kind==='mansard'){
   const inset=Math.min(l,w)*.18,lower=rise*.72;solid(x,z,l,w,y,lower,inset,inset,MAT.roof);
   solid(x+inset,z+inset,l-2*inset,w-2*inset,y+lower,rise-lower,(l-2*inset)/2,Math.min((w-2*inset)/2,(l-2*inset)/2),MAT.roof);
  }else solid(x,z,l,w,y,rise,l/2,kind==='hip'||kind==='hipped'||kind==='tower'?Math.min(w/2,l/2):0,MAT.roof);
  boxes.push(...roofOrnaments(r,base,rise,kind));
  // Eave fascia and a raised ridge crown give silhouette detail without room obstructions.
  for(const zz of [z,z+w])boxes.push({c:[x+l/2,y-.03,zz],s:[l,.17,.16],mat:MAT.trim});
  for(const xx of [x,x+l])boxes.push({c:[xx,y-.03,z+w/2],s:[.16,.17,w],mat:MAT.trim});
  if(!['flat','none'].includes(kind))boxes.push({c:[x+l/2,y+rise+.04,z+w/2],s:[.16,.14,Math.max(.18,kind==='gable'?w:w-Math.min(w,l))],mat:MAT.metal});
  if(Math.min(l,w)>10){const cx=x+l*.18,cz=z+w*.22,chimneyTop=y+rise+.8;boxes.push({c:[cx,(y+chimneyTop)/2,cz],s:[1.15,chimneyTop-y,1.4],mat:MAT.stone},{c:[cx,chimneyTop,cz],s:[1.4,.18,1.65],mat:MAT.trim});for(const dx of [-.25,.25])boxes.push({c:[cx+dx,chimneyTop+.35,cz],s:[.3,.6,.45],mat:MAT.wood});}
 }
 return [...unionRoofSurfaces(volumes),...boxes];
}

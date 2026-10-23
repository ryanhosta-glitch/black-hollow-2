import {MAT} from './forge_glb.mjs';
import {openingShape,exposedRuns} from './forge_architecture.mjs';
import {roomFinish} from './forge_finishes.mjs';
/** Fine architectural layers use feet, like the floor compiler. No new floor obstacles. */
export function mansionEnvelope(floor,fi,levels){
 const parts=[],base=levels[fi]||0,add=(c,s,mat)=>{if(c.every(Number.isFinite)&&s.every(v=>Number.isFinite(v)&&v>.006))parts.push({c,s,mat});};
 for(const r of floor.rooms){const x=+r.x,z=+r.y,l=+r.l,w=+r.w,h=+r.h,finish=roomFinish(r);
  for(const side of ['top','bottom','left','right']){
   const vertical=side==='left'||side==='right',span=vertical?w:l,wall=vertical?(side==='left'?x:x+l):(side==='top'?z:z+w),inside=side==='left'||side==='top'?1:-1;
   const put=(at,yy,width,height,depth,offset,mat)=>add(vertical?[wall+inside*offset,base+yy,z+at]:[x+at,base+yy,wall+inside*offset],vertical?[depth,height,width]:[width,height,depth],mat);
   const holes=(r.openings||[]).filter(o=>o.wall===side).map(o=>({...openingShape(o,span,h),type:o.type}));
   // Aperture edges split every layer. Trim never bridges a door or removed partition.
   const cuts=[...new Set([.14,span-.14,...holes.flatMap(o=>[Math.max(.14,o.center-o.width/2-.16),Math.min(span-.14,o.center+o.width/2+.16)])])].filter(v=>v>=.14&&v<=span-.14).sort((a,b)=>a-b);
   for(let j=1;j<cuts.length;j++){const a=cuts[j-1],b=cuts[j],mid=(a+b)/2,len=b-a;if(len<.3||holes.some(o=>Math.abs(mid-o.center)<o.width/2+.15))continue;
    // Built-up base molding, bead rail, and a graduated three-stage crown.
    for(const [yy,hh,depth,offset,mat]of [[.10,.16,.12,.08,finish.panel],[.24,.05,.16,.10,finish.trim],[Math.min(3.1,h*.34),.035,.15,.11,MAT.metal],[h-.28,.10,.18,.11,finish.panel],[h-.17,.07,.23,.14,finish.trim],[h-.08,.06,.30,.17,MAT.plaster]])put(mid,yy,len,hh,depth,offset,mat);
    if(len>1.4){const bays=Math.max(1,Math.floor(len/2.7)),bw=len/bays,ph=Math.min(2.3,h*.24),cy=Math.min(1.65,h*.18);for(let k=0;k<bays;k++){const at=a+(k+.5)*bw,pw=Math.max(.4,bw-.42);for(const sign of [-1,1]){put(at+sign*pw/2,cy,.035,ph,.025,.17,finish.trim);put(at,cy+sign*ph/2,pw,.035,.025,.17,finish.trim);}}}
   }
   // Facade details occur only on genuinely exposed exterior wall runs.
   const runs=exposedRuns(r,side,floor.rooms),outside=(at,yy,width,height,depth,offset,mat)=>{if(holes.some(o=>at+width/2>o.center-o.width/2&&at-width/2<o.center+o.width/2&&yy+height/2>o.low&&yy-height/2<o.high))return;put(at,yy,width,height,depth,-offset,mat);};
   for(const [a,b]of runs){const len=b-a;if(len<.7)continue;outside((a+b)/2,h-.24,len,.18,.23,.27,finish.trim);
    for(const at of [a+.13,b-.13]){const courses=Math.min(20,Math.floor(h/.8));for(let k=0;k<courses;k++)outside(at,(k+.5)*h/courses,.26+(k%2)*.13,h/courses-.09,.10,.31,MAT.stone);}
    for(const o of holes.filter(o=>o.type==='window'&&o.center-o.width/2>a&&o.center+o.width/2<b)){const high=Math.min(h-.28,o.high+.17);outside(o.center,high,o.width+.48,.12,.25,.28,finish.trim);outside(o.center,Math.min(h-.18,high+.10),.19,.20,.16,.33,MAT.stone);for(const sign of [-1,1])outside(o.center+sign*(o.width/2-.13),o.low-.20,.13,.30,.28,.26,finish.trim);}
   }
  }
  // Flush floor inlay borders are under 3 mm high and leave all walking space intact.
  if(!r.forgeStair&&l>7&&w>7)for(const inset of [.30,.42]){add([x+l/2,base+.006,z+inset],[l-inset*2,.008,.025],MAT.metal);add([x+l/2,base+.006,z+w-inset],[l-inset*2,.008,.025],MAT.metal);add([x+inset,base+.006,z+w/2],[.025,.008,w-inset*2],MAT.metal);add([x+l-inset,base+.006,z+w/2],[.025,.008,w-inset*2],MAT.metal);}
 }
 return parts;
}

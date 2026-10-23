import {MAT} from './forge_glb.mjs';
import {openingShape} from './forge_architecture.mjs';
// Exterior accessories have explicit collision bounds. The central entry lane stays clear.
export function exteriorDetails(source,levels){
 const parts=[],colliders=[],warnings=[];
 for(const [fi,f]of source.floors.entries())for(const r of f.rooms){
  const opening=(r.openings||[]).find(o=>o.id===source.gameEntry?.openingId&&r.id===source.gameEntry?.roomId&&!o.shared&&o.type==='door');
  if(!opening)continue;
  const vertical=['left','right'].includes(opening.wall),span=Number(vertical?r.w:r.l),shape=openingShape(opening,span,+r.h),width=Math.min(9,shape.center*2-.5,(span-shape.center)*2-.5),depth=5,base=levels[fi]||0;
  if(width<shape.width+1.5){warnings.push({code:'PORCH_JAMB_CLEARANCE',roomId:r.id});continue;}
  const out=['top','left'].includes(opening.wall)?-1:1,wall=vertical?(opening.wall==='left'?+r.x:+r.x+ +r.l):(opening.wall==='top'?+r.y:+r.y+ +r.w),along=(vertical?+r.y:+r.x)+shape.center,top=Math.min(9,+r.h-.5);
  const pos=(a,o,y)=>vertical?[wall+out*o,base+y,along+a]:[along+a,base+y,wall+out*o];
  const add=(a,o,y,l,h,d,mat)=>{const part={c:pos(a,o,y),s:vertical?[d,h,l]:[l,h,d],mat};parts.push(part);return part;};
  add(0,depth/2,-.15,width,.25,depth,MAT.stone);
  for(const sign of [-1,1]){const post=add(sign*(width/2-.22),depth-.3,top/2,.24,top,.24,MAT.trim),p=post.c,s=post.s;colliders.push({objectId:'porch:'+r.id+':'+sign,roomId:null,floor:null,bounds:{minX:(p[0]-s[0]/2)*.3048,maxX:(p[0]+s[0]/2)*.3048,minZ:(p[2]-s[2]/2)*.3048,maxZ:(p[2]+s[2]/2)*.3048},minY:base*.3048,maxY:(base+top)*.3048});add(sign*(width/2-.22),depth-.3,top-.25,.5,.16,.5,MAT.trim);}
  add(0,depth/2,top,width+.5,.22,depth+.6,MAT.roof);
  add(0,depth-.1,top-.22,width,.18,.18,MAT.trim);
  // A peaked entrance pediment and finial give the porch a recognizable silhouette.
  const ridge=top+Math.min(2,width*.22),half=width/2+.3;
  const triangle=[pos(-half,depth+.31,top+.08),pos(half,depth+.31,top+.08),pos(0,depth+.31,ridge)];
  parts.push({c:[0,0,0],s:[1,1,1],mat:MAT.wood,triangles:[triangle,[triangle[2],triangle[1],triangle[0]]]});
  add(0,depth+.32,ridge+.30,.09,.65,.09,MAT.metal);
  for(const sign of [-1,1]){
   // Lanterns remain within the already blocked porch posts.
   const a=sign*(width/2-.22),o=depth-.3;
   add(a,o,top-.95,.34,.50,.34,MAT.metal);add(a,o,top-.95,.26,.38,.26,MAT.glass);add(a,o,top-.64,.42,.10,.42,MAT.trim);
   for(let k=0;k<5;k++)add(sign*(width/2-.3-k*.12),depth-.1,top-.32-k*.11,.10,.13,.13,MAT.trim);
  }
  // A pierced frieze above headroom provides Victorian detail without closing the entry.
  const count=Math.min(16,Math.floor(width/.5));for(let i=0;i<count;i++)add(-width/2+.3+i*(width-.6)/Math.max(1,count-1),depth-.1,top-.55,.06,.5,.06,MAT.trim);
 }
 return {parts,colliders,warnings};
}

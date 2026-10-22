// Boundary surfaces of unions of convex roof volumes. Units remain blueprint feet.
const EPS=1e-6;
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),sub=(a,b)=>a.map((v,i)=>v-b[i]);
function normal(poly){for(let i=1;i<poly.length-1;i++){const u=sub(poly[i],poly[0]),v=sub(poly[i+1],poly[0]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n);if(len>EPS)return n.map(v=>v/len);}return null;}
function split(poly,n,d){const inside=[],outside=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=dot(n,a)-d,db=dot(n,b)-d;if(da<=EPS)inside.push(a);if(da>=-EPS)outside.push(a);if(da>EPS&&db<-EPS||da<-EPS&&db>EPS){const t=da/(da-db),p=a.map((v,j)=>v+(b[j]-v)*t);inside.push(p);outside.push(p);}}return {inside,outside};}
export function solidFaces(box){const [a,d,e]=box.s.map(v=>v/2),v=(box.vertices||[[-a,-d,-e],[a,-d,-e],[a,d,-e],[-a,d,-e],[-a,-d,e],[a,-d,e],[a,d,e],[-a,d,e]]).map(q=>q.map((t,i)=>t+box.c[i]));return [[0,3,2,1],[5,6,7,4],[4,7,3,0],[1,2,6,5],[3,7,6,2],[4,0,1,5]].map(ids=>ids.map(i=>v[i])).filter(poly=>normal(poly));}
export function unionRoofSurfaces(solids){
 const volumes=solids.map(s=>{const faces=solidFaces(s),points=faces.flat();return {s,faces,planes:faces.map(p=>{const n=normal(p);return {n,d:dot(n,p[0])};}),min:[0,1,2].map(i=>Math.min(...points.map(p=>p[i]))),max:[0,1,2].map(i=>Math.max(...points.map(p=>p[i])))};});
 const result=[];
 for(let i=0;i<volumes.length;i++){
  const a=volumes[i];let polygons=a.faces;
  for(let j=0;j<volumes.length&&polygons.length;j++){
   if(i===j)continue;const b=volumes[j];if(a.min.some((v,k)=>v>b.max[k]+EPS||a.max[k]<b.min[k]-EPS))continue;
   const next=[];
   for(const poly of polygons){let remainder=poly;const exterior=[];
    for(const {n,d}of b.planes){if(remainder.length<3)break;const distances=remainder.map(p=>dot(n,p)-d);if(distances.every(v=>Math.abs(v)<EPS)){if(j>i&&dot(normal(remainder),n)>.99){exterior.push(remainder);remainder=[];break;}continue;}
     const parts=split(remainder,n,d);if(parts.outside.length>=3&&normal(parts.outside))exterior.push(parts.outside);remainder=parts.inside;
    }
    next.push(...exterior);
   }
   polygons=next;
  }
  const triangles=polygons.flatMap(p=>Array.from({length:p.length-2},(_,k)=>[p[0],p[k+1],p[k+2]]));if(triangles.length)result.push({c:[0,0,0],s:[1,1,1],mat:a.s.mat,triangles});
 }
 return result;
}
export function uncoveredRectangles(room,above){
 let pieces=[{x:+room.x,z:+room.y,l:+room.l,w:+room.w}];
 for(const r of above){const next=[];for(const p of pieces){const x=Math.max(p.x,+r.x),z=Math.max(p.z,+r.y),xx=Math.min(p.x+p.l,+r.x+ +r.l),zz=Math.min(p.z+p.w,+r.y+ +r.w);if(x>=xx-EPS||z>=zz-EPS){next.push(p);continue;}for(const q of [{x:p.x,z:p.z,l:x-p.x,w:p.w},{x:xx,z:p.z,l:p.x+p.l-xx,w:p.w},{x,z:p.z,l:xx-x,w:z-p.z},{x,z:zz,l:xx-x,w:p.z+p.w-zz}])if(q.l>EPS&&q.w>EPS)next.push(q);}pieces=next;}
 return pieces;
}

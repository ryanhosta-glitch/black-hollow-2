/** Low-poly, material-batched carving. Coordinates retain the caller's unit system. */
export function architecturalShapes(emit){
 const groups=new Map();
 const triangle=(a,b,c,mat)=>{if(!groups.has(mat))groups.set(mat,[]);groups.get(mat).push([a,b,c]);};
 const quad=(a,b,c,d,mat)=>{triangle(a,b,c,mat);triangle(a,c,d,mat);};
 function box(c,s,mat){
  const [x,y,z]=c,[w,h,d]=s.map(v=>v/2),v=[[-w,-h,-d],[w,-h,-d],[w,h,-d],[-w,h,-d],[-w,-h,d],[w,-h,d],[w,h,d],[-w,h,d]].map(p=>[p[0]+x,p[1]+y,p[2]+z]);
  for(const [a,b,c,d]of [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]])quad(v[a],v[b],v[c],v[d],mat);
 }
 // Closed constant-section extrusions: one mesh, not one object per molding bead.
 function sweep(point,start,end,profile,mat){
  const front=profile.map(([depth,y])=>point(start,y,depth)),back=profile.map(([depth,y])=>point(end,y,depth));
  for(let i=0;i<profile.length;i++){const j=(i+1)%profile.length;quad(front[i],back[i],back[j],front[j],mat);}
  for(let i=1;i<profile.length-1;i++){triangle(front[0],front[i+1],front[i],mat);triangle(back[0],back[i],back[i+1],mat);}
 }
 // Concentric, chamfered raised field. Closed bevel rings give real light-catching edges.
 function panel(point,at,y,width,height,mat,depth=.22){
  const rectangle=(inset,t)=>[[-width/2+inset,-height/2+inset],[width/2-inset,-height/2+inset],[width/2-inset,height/2-inset],[-width/2+inset,height/2-inset]].map(([u,v])=>point(at+u,y+v,t));
  const rings=[[0,depth-.05],[.055,depth+.005],[.12,depth-.025],[.19,depth+.025]].filter(([inset])=>Math.min(width,height)>inset*2+.04).map(([i,d])=>rectangle(i,d));
  for(let k=1;k<rings.length;k++)for(let i=0;i<4;i++)quad(rings[k-1][i],rings[k-1][(i+1)%4],rings[k][(i+1)%4],rings[k][i],mat);
  const center=rings.at(-1);quad(...center,mat);
 }
 function rosette(point,at,y,r,mat,petals=6){
  // Broad folded acanthus/palmette leaves: four facets each, not tiny bead objects.
  for(let k=0;k<petals;k++){
   const step=Math.PI*2/petals,a=(k+.5)*step,p=(rr,angle,depth)=>point(at+Math.cos(angle)*rr,y+Math.sin(angle)*rr,depth);
   const base=p(r*.16,a,.025),left=p(r*.62,a-step*.24,.04),tip=p(r,a,.045),right=p(r*.62,a+step*.24,.04),ridge=p(r*.65,a,.10);
   triangle(base,left,ridge,mat);triangle(left,tip,ridge,mat);triangle(tip,right,ridge,mat);triangle(right,base,ridge,mat);
  }
 }
 function flush(){let count=0;for(const [mat,triangles]of groups){const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const tri of triangles)for(const v of tri)for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],v[i]);hi[i]=Math.max(hi[i],v[i]);}if(emit(lo.map((v,i)=>(v+hi[i])/2),lo.map((v,i)=>Math.max(.001,hi[i]-v)),mat,0,{triangles}))count++;}groups.clear();return count;}
 return {box,sweep,panel,rosette,triangle,quad,flush};
}
export function architecturalPartMeters(part){const scale=v=>v.map(n=>n*.3048);return {...part,c:scale(part.c),s:scale(part.s),...(part.vertices?{vertices:part.vertices.map(scale)}:{}),...(part.triangles?{triangles:part.triangles.map(t=>t.map(scale))}:{})};}

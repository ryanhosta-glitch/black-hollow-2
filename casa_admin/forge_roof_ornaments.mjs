import {MAT} from './forge_glb.mjs';
// Dormers and roof lantern towers are exterior ornaments, not additional walkable rooms.
export function roofOrnaments(r,base,rise,kind){
 const out=[],box=(c,s,mat)=>out.push({c,s,mat}),x=+r.x,z=+r.y,l=+r.l,w=+r.w,y=base+ +r.h+.2;
 const count=Math.max(0,Math.min(4,Math.floor(Number(r.dormers??r.roof?.dormers??0))));
 if(kind==='gable'&&Math.min(l,w)>10)for(let i=0;i<count;i++){
  const cx=x+l*.75,cz=z+w*(i+1)/(count+1),bottom=y+rise*.40,height=Math.max(1.5,rise*.36),width=2.6,depth=2.8;
  box([cx,bottom+height/2,cz],[depth,height,width],MAT.siding);
  box([cx+depth/2+.015,bottom+height*.52,cz],[.03,height*.65,width*.65],MAT.glass);
  for(const sign of [-1,1])box([cx+depth/2+.045,bottom+height*.52,cz+sign*width*.36],[.08,height*.8,.09],MAT.trim);
  box([cx+depth/2+.045,bottom+height*.52,cz],[.08,height*.7,.07],MAT.trim);
  const a=(depth+.3)/2,e=(width+.35)/2,d=.45;out.push({c:[cx,bottom+height+d,cz],s:[a*2,d*2,e*2],mat:MAT.roof,vertices:[[-a,-d,-e],[a,-d,-e],[a,d,0],[-a,d,0],[-a,-d,e],[a,-d,e],[a,d,0],[-a,d,0]]});
  box([cx+depth/2+.045,bottom+height*.88,cz],[.08,.10,width*.8],MAT.trim);
 }
 if(kind==='tower'){
  const cx=x+l/2,cz=z+w/2,radius=Math.min(l,w)*.27,low=y+rise*.35,high=low+Math.max(3,rise*.5),apex=high+radius*1.5,n=8,ring=Array.from({length:n},(_,i)=>[cx+radius*Math.cos(i*2*Math.PI/n),low,cz+radius*Math.sin(i*2*Math.PI/n)]),sides=[],roof=[];
  for(let i=0;i<n;i++){const a=ring[i],b=ring[(i+1)%n],aa=[a[0],high,a[2]],bb=[b[0],high,b[2]];sides.push([a,aa,bb],[a,bb,b]);roof.push([aa,[cx,apex,cz],bb]);}
  out.push({c:[0,0,0],s:[1,1,1],mat:MAT.siding,triangles:sides},{c:[0,0,0],s:[1,1,1],mat:MAT.roof,triangles:roof});
  for(let i=0;i<n;i++){const a=i*2*Math.PI/n;box([cx+radius*Math.cos(a),high,cz+radius*Math.sin(a)],[.13,.18,.13],MAT.trim);}
 }
 return out;
}

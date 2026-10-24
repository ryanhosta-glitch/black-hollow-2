// Resolve personal space in world metres. Scripted participants keep their place;
// everyone else yields in small steps instead of teleporting or forming one stack.
export function separateResidents(residents,{dt=0,minDistance=1.5,pinned=new Set(),canStand=()=>true}={}){
 if(!Number.isFinite(dt)||dt<=0)return;
 for(let pass=0;pass<4;pass++)for(let i=0;i<residents.length;i++)for(let j=i+1;j<residents.length;j++){
  const a=residents[i],b=residents[j],p=a.route.state.position,q=b.route.state.position;
  let dx=p[0]-q[0],dz=p[2]-q[2],d=Math.hypot(dx,dz);if(d>=minDistance)continue;
  if(d<1e-5){const angle=(i*3+j)*2.399;dx=Math.cos(angle);dz=Math.sin(angle);d=1;}else{dx/=d;dz/=d;}
  const freeA=!pinned.has(a.id),freeB=!pinned.has(b.id),count=Number(freeA)+Number(freeB);if(!count)continue;
  const step=Math.min((minDistance-Math.hypot(p[0]-q[0],p[2]-q[2]))/count,Math.min(dt,.1)*1.8/4);
  for(const [r,sign,free]of [[a,1,freeA],[b,-1,freeB]]){if(!free)continue;const v=r.route.state.position,x=v[0]+dx*step*sign,z=v[2]+dz*step*sign;if(canStand(x,z,.35)){v[0]=x;v[2]=z;}}
 }
}

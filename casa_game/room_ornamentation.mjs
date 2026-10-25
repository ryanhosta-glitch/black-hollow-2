import {stableRoomHash as hash} from './room_profiles.mjs';
import {resolveRoomProfile} from './room_profiles.mjs';
import {withRoomComponent} from './room_components.mjs';
import {wallMount} from './wall_mount.mjs';
const FT=.3048;

/** Wall fixtures occupy solid spans; surface inlays have no raised collision profile. */
export function artisanDetails(room,{identity,y,occupied,furniture,add,components=null,profile=resolveRoomProfile(room)}){
 const b=room.boundsFeet||room,x=+b.x*FT,z=+b.y*FT,w=+b.l*FT,d=+b.w*FT,h=+b.h*FT,seed=hash(room.id),ornaments=[],lights=[];
 components?.track(ornaments,lights);
 function mounted(width,height,py,preferred,draw,type){
  const mount=wallMount(room,{width,height,y:py,inset:.035,occupied,preferred});if(!mount)return null;
  const [mx,my,mz]=mount.position,a=mount.rotationY,cs=Math.cos(a),sn=Math.sin(a),world=([u,v,t])=>[mx+u*cs+t*sn,y+my+v,mz-u*sn+t*cs];let count=0;
  const emit=(c,s,mat=8,rot=0,shape={})=>{const ok=add(c,s,mat,rot,shape);if(ok)count++;return ok;};
  const box=(u,v,t,sw,sh,sd,mat=8)=>emit(world([u,v,t]),[sw,sh,sd],mat,a);
  function line(points,r=.012,mat=8){const triangles=[];for(let i=1;i<points.length;i++){const p=points[i-1],q=points[i],dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy);if(len<1e-6)continue;const nx=-dy/len*r,ny=dx/len*r,A=[p[0]+nx,p[1]+ny,p[2]],B=[q[0]+nx,q[1]+ny,q[2]],C=[q[0]-nx,q[1]-ny,q[2]],D=[p[0]-nx,p[1]-ny,p[2]];triangles.push([A,C,B].map(world),[A,D,C].map(world));}if(!triangles.length)return;const flat=points,c=[0,1,2].map(k=>(Math.min(...flat.map(p=>p[k]))+Math.max(...flat.map(p=>p[k])))/2),s=[0,1,2].map(k=>Math.max(.002,Math.max(...flat.map(p=>p[k]))-Math.min(...flat.map(p=>p[k]))+r*2));emit(world(c),s,mat,0,{triangles});}
  const ellipse=(u,v,rx,ry,t=.06,mat=8)=>line(Array.from({length:25},(_,k)=>[u+Math.cos(k/24*Math.PI*2)*rx,v+Math.sin(k/24*Math.PI*2)*ry,t]),.012,mat);
  draw({box,line,ellipse,world,width,height});if(!count)return null;
  const p=[mx,y+my,mz],vertical=mount.wall==='left'||mount.wall==='right';occupied.push({wall:mount.wall,center:vertical?mz-z:mx-x,width:width+.10});ornaments.push({id:`artisan:${room.id}:${ornaments.length}`,type,wall:mount.wall,positionMeters:p,normal:mount.normal,width,height});return {mount,p};
 }
 // Fixtures remain above eye and walking headroom; low rooms get no hanging substitute.

 if(!['laboratory','conservatory','circulation'].includes(identity)&&h>2.5&&w>2.5&&d>2.5){withRoomComponent(components,'wall-mirror',()=>{
  const bat=seed%2===0||identity==='crypt',width=.88,height=1.12,py=Math.min(1.83,h-.78);
  mounted(width,height,py,['left','bottom','right','top'],({box,line,ellipse})=>{
   const mat=bat?19:18;box(0,-.025,.045,.60,.79,.025,41);
   for(const side of [-1,1]){box(side*.33,-.02,.07,.055,.88,.05,mat);box(0,side*.45,.07,.69,.045,.05,mat);ellipse(side*.34,side*.38,.073,.10,.09,mat);ellipse(side*.34,0,.052,.075,.085,mat);}
   if(bat){line([[-.30,.47,.08],[-.25,.55,.08],[-.12,.48,.08],[0,.50,.08],[.12,.48,.08],[.25,.55,.08],[.30,.47,.08]],.024,19);for(const side of [-1,1]){line([[0,.47,.095],[side*.17,.54,.095],[side*.29,.46,.095],[side*.12,.43,.095],[0,.47,.095]],.018,19);ellipse(side*.27,-.49,.07,.06,.085,19);}}
   else {line([[-.31,.36,.09],[-.23,.45,.09],[0,.55,.09],[.23,.45,.09],[.31,.36,.09]],.018,18);for(const side of [-1,1])ellipse(side*.11,.43,.055,.09,.10,18);ellipse(0,-.48,.13,.055,.10,18);}
  },bat?'bat-wing-mourning-mirror':'silver-gothic-mirror');
 });}
 // Flush inlaid rosettes match the supplied medallions; never a raised floor obstacle.
 if(!room.forgeStair&&w>2.4&&d>2.4&&identity!=='circulation'){withRoomComponent(components,'floor-rosette',()=>{
  const cx=x+w/2,cz=z+d/2,r=Math.min(1.05,w*.24,d*.24),cy=y+.023,stone=['crypt','laboratory','conservatory'].includes(identity),carpet=!stone&&seed%3!==0,mat=stone||carpet?17:8,triangles=[];
  const band=(radius,thickness,petals=0)=>{for(let i=0;i<64;i++){const a=i/64*Math.PI*2,b=(i+1)/64*Math.PI*2,ra=radius*(1+(petals?.16*Math.cos(a*petals):0)),rb=radius*(1+(petals?.16*Math.cos(b*petals):0)),p=(angle,rr)=>[cx+Math.cos(angle)*rr,cy,cz+Math.sin(angle)*rr],A=p(a,ra),B=p(b,rb),C=p(b,rb-thickness),D=p(a,ra-thickness);triangles.push([A,B,C],[A,C,D]);}};
  band(r,.018);band(r*.91,.009);band(r*.66,.025,6+seed%3);band(r*.30,.016,4);band(r*.11,.025);
  if(add([cx,cy,cz],[r*2,.002,r*2],mat,0,{triangles}))ornaments.push({id:`artisan:${room.id}:inlay`,type:stone?'stone-rosette-inlay':carpet?'woven-rosette-medallion':'brass-and-walnut-medallion',positionMeters:[cx,cy,cz],width:r*2,height:.002,variant:seed%3});
 },{surface:'floor-center-inlay'});}
 return {ornaments,lights};
}

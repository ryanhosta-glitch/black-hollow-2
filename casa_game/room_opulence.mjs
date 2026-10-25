import {resolveRoomAtmosphere} from './room_atmosphere_profiles.mjs';
import {roomLighting} from './room_lighting.mjs';
import {stableRoomHash as hash} from './room_profiles.mjs';
import {resolveRoomProfile} from './room_profiles.mjs';
import {withRoomComponent} from './room_components.mjs';
import {artisanDetails} from './room_ornamentation.mjs';
import {referenceRoomDetails} from './room_reference_details.mjs';
import {wallMount} from './wall_mount.mjs';
const FT=.3048;

/** Portable, bounded set dressing. Floor furniture remains owned by the clearance planner. */
export function dressRoom(room,{identity,y=0,furniture=[],occupied=[],add:emit,components=null,profile=resolveRoomProfile(room),gothic=null}){
 const b=room.boundsFeet||room,x=+b.x*FT,z=+b.y*FT,w=+b.l*FT,d=+b.w*FT,h=+b.h*FT,seed=hash(room.id),ornaments=[],lights=[];
 const privateRoom=profile.wallDrapery,trim=profile.stone?7:8;
 components?.track(ornaments,lights);
 let written=0,checkpoint=0;const add=(...args)=>{const ok=emit(...args);if(ok)written++;return ok;};
 const group=(type,p,width,height,wall)=>{if(written===checkpoint)return;checkpoint=written;ornaments.push({id:`opulence:${room.id}:${ornaments.length}`,type,positionMeters:p,width,height,...(wall?{wall}:{})});};
 const artisan=artisanDetails(room,{identity,y,occupied,furniture,add,components,profile});ornaments.push(...artisan.ornaments);lights.push(...artisan.lights);
 // Layered ceiling rose, radial brass arms, candle cups and hanging prisms.
 // The lowest part always stays above 2.18 m, even in low student rooms.

 const lighting=roomLighting(room,{y,furniture,occupied,add,components,profile});ornaments.push(...lighting.ornaments);lights.push(...lighting.lights);
 // Solid wall spans only: no dressing across doors, windows or removed walls.
 const sides=['top','right','bottom','left'];
 for(let i=0;i<(identity==='circulation'?1:4);i++){withRoomComponent(components,'wall-panel',()=>{
  const width=Math.min(1.15,Math.min(w,d)-.5),height=Math.min(.85,h-2.05),py=h-.24-height/2;if(width<.4||height<.35)return;
  const mount=wallMount(room,{width,height,y:py,inset:.055,occupied,preferred:sides.map((_,j)=>sides[(seed+i+j)%4])});if(!mount)return;
  const [mx,my,mz]=mount.position,a=mount.rotationY,cs=Math.cos(a),sn=Math.sin(a),box=(u,v,t,sw,sh,sd,mat=trim)=>add([mx+u*cs+t*sn,y+my+v,mz-u*sn+t*cs],[sw,sh,sd],mat,a);
  for(const sign of [-1,1]){box(sign*width/2,0,.01,.035,height,.025);box(0,sign*height/2,.01,width,.035,.025);box(sign*(width/2-.06),0,.015,.012,height-.12,.025);}
  let upholstered=false;if(gothic?.policy.textiles){upholstered=gothic.wallPanel([mx,y+my-height/2+.06,mz],a,width-.12,height-.12);}
  else if(privateRoom&&!gothic){for(let k=0;k<7;k++){const u=(k-3)*width/7,v=height*.25-Math.sin(k/6*Math.PI)*.19;box(u,v,.045,width/6,.08,.04,6);}for(const side of [-1,1]){box(side*width*.43,-.08,.045,.095,height*.7,.05,6);box(side*width*.43,-.05,.08,.12,.025,.035,8);}}
  else if(identity==='conservatory'){for(let k=0;k<5;k++){box((k-2)*width*.17,-.14,.045,.055,.33,.045,5);box((k-2)*width*.17,.07,.06,.13,.16,.035,16);}}
  else {for(const side of [-1,1]){box(side*width*.30,-.08,.06,.075,.22,.07,3);box(side*width*.30,-.21,.05,.15,.035,.12,trim);}box(0,.12,.03,.13,.13,.035,trim);}
  const p=[mx,y+my,mz];group(upholstered?'upholstered-wall-panel':privateRoom&&!gothic?'velvet-and-gilt-overdoor':'carved-wall-panel',p,width,height,mount.wall);
  occupied.push({wall:mount.wall,center:mount.wall==='left'||mount.wall==='right'?mz-z:mx-x,width:width+.10});
 },{key:i});}
 // Corner cobwebs live entirely above headroom; fine radial strands and arcs.
 if(h>2.7&&identity!=='conservatory')for(const side of [-1,1].slice(0,resolveRoomAtmosphere(room).webs)){withRoomComponent(components,'corner-web',()=>{
  const px=side<0?x+.09:x+w-.09,pz=z+.09,cy=y+h-.20;
  for(let k=1;k<=4;k++){const len=.10+k*.07;add([px-side*len*.35,cy-k*.065,pz+.025],[len,.008,.008],3,side*Math.PI/4);}
  group('high-corner-web',[px,cy,pz],.4,.4);
 },{key:side});}
 ornaments.push(...referenceRoomDetails(room,{identity,y,add,components,profile,gothic}));
 return {ornaments,lights,edition:'whole-house-1',variant:seed%7};
}

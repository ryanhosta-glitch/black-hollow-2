import {stableRoomHash as hash} from './room_profiles.mjs';
import {resolveRoomProfile} from './room_profiles.mjs';
import {withRoomComponent} from './room_components.mjs';
import {artisanDetails} from './room_ornamentation.mjs';
import {referenceRoomDetails} from './room_reference_details.mjs';
import {wallMount} from './wall_mount.mjs';
const FT=.3048;

/** Portable, bounded set dressing. Floor furniture remains owned by the clearance planner. */
export function dressRoom(room,{identity,y=0,furniture=[],occupied=[],add:emit,components=null,profile=resolveRoomProfile(room)}){
 const b=room.boundsFeet||room,x=+b.x*FT,z=+b.y*FT,w=+b.l*FT,d=+b.w*FT,h=+b.h*FT,seed=hash(room.id),ornaments=[],lights=[];
 const cx=x+w/2,cz=z+d/2,privateRoom=profile.wallDrapery,stone=profile.stone,metal=profile.metal,trim=stone?7:8;
 components?.track(ornaments,lights);
 let written=0,checkpoint=0;const add=(...args)=>{const ok=emit(...args);if(ok)written++;return ok;};
 const group=(type,p,width,height,wall)=>{if(written===checkpoint)return;checkpoint=written;ornaments.push({id:`opulence:${room.id}:${ornaments.length}`,type,positionMeters:p,width,height,...(wall?{wall}:{})});};
 const artisan=artisanDetails(room,{identity,y,occupied,furniture,add,components,profile});ornaments.push(...artisan.ornaments);lights.push(...artisan.lights);
 // Layered ceiling rose, radial brass arms, candle cups and hanging prisms.
 // The lowest part always stays above 2.18 m, even in low student rooms.
 if(w>1.25&&d>1.25&&h>2.55&&!room.forgeStair){withRoomComponent(components,'ceiling-chandelier',()=>{
  const radius=Math.min(.65,w*.16,d*.16),drop=Math.min(.80,h-2.3),base=y+h-drop;
  for(const [size,dy,mat]of [[radius*2,.025,trim],[radius*1.55,.055,3],[radius*.95,.08,trim]])add([cx,y+h-dy,cz],[size,.025,size],mat,Math.PI/4);
  add([cx,y+h-drop/2,cz],[.045,drop,.045],trim);
  for(let k=0;k<6;k++){const angle=k*Math.PI/3,px=cx+Math.sin(angle)*radius,pz=cz+Math.cos(angle)*radius;
   add([cx+Math.sin(angle)*radius/2,base+.12,cz+Math.cos(angle)*radius/2],[.035,.035,radius],trim,angle);
   add([px,base+.14,pz],[.12,.045,.12],trim);add([px,base+.25,pz],[.045,.19,.045],3);add([px,base+.36,pz],[.035,.045,.035],8,Math.PI/4);
   if(!stone){add([px,base+.025,pz],[.04,.15,.04],9,Math.PI/4);add([px,base-.06,pz],[.065,.055,.065],9,Math.PI/4);}
  }
  group(stone?'votive-crown':metal?'botanical-lantern':'crystal-chandelier',[cx,base+.25,cz],radius*2,drop);
  lights.push({id:`opulence:${room.id}:chandelier`,roomId:String(room.id),floor:room.floor,positionMeters:[cx,base+.28,cz],color:stone?'#9bc5cc':metal?'#c4dfc3':'#ffd6a0',intensity:1.1,rangeMeters:Math.max(w,d),static:true,castShadow:false,fixtureGeometryCompiled:true,gameEffects:[]});
 },{surface:'ceiling-center'});}
 // Solid wall spans only: no dressing across doors, windows or removed walls.
 const sides=['top','right','bottom','left'];
 for(let i=0;i<(identity==='circulation'?1:4);i++){withRoomComponent(components,'wall-panel',()=>{
  const width=Math.min(1.15,Math.min(w,d)-.5),height=Math.min(.85,h-2.05),py=h-.24-height/2;if(width<.4||height<.35)return;
  const mount=wallMount(room,{width,height,y:py,inset:.055,occupied,preferred:sides.map((_,j)=>sides[(seed+i+j)%4])});if(!mount)return;
  const [mx,my,mz]=mount.position,a=mount.rotationY,cs=Math.cos(a),sn=Math.sin(a),box=(u,v,t,sw,sh,sd,mat=trim)=>add([mx+u*cs+t*sn,y+my+v,mz-u*sn+t*cs],[sw,sh,sd],mat,a);
  for(const sign of [-1,1]){box(sign*width/2,0,.01,.035,height,.025);box(0,sign*height/2,.01,width,.035,.025);box(sign*(width/2-.06),0,.015,.012,height-.12,.025);}
  if(privateRoom){for(let k=0;k<7;k++){const u=(k-3)*width/7,v=height*.25-Math.sin(k/6*Math.PI)*.19;box(u,v,.045,width/6,.08,.04,6);}for(const side of [-1,1]){box(side*width*.43,-.08,.045,.095,height*.7,.05,6);box(side*width*.43,-.05,.08,.12,.025,.035,8);}}
  else if(identity==='conservatory'){for(let k=0;k<5;k++){box((k-2)*width*.17,-.14,.045,.055,.33,.045,5);box((k-2)*width*.17,.07,.06,.13,.16,.035,16);}}
  else {for(const side of [-1,1]){box(side*width*.30,-.08,.06,.075,.22,.07,3);box(side*width*.30,-.21,.05,.15,.035,.12,trim);}box(0,.12,.03,.13,.13,.035,trim);}
  const p=[mx,y+my,mz];group(privateRoom?'velvet-and-gilt-overdoor':'carved-wall-panel',p,width,height,mount.wall);
  occupied.push({wall:mount.wall,center:mount.wall==='left'||mount.wall==='right'?mz-z:mx-x,width:width+.10});
 },{key:i});}
 // Dress each useful surface in its own local coordinates, including rotated desks.
 const tops={writing_desk:.83,dining_table:.79,laboratory_bench:.90,console:.88,sarcophagus:.89};
 for(const f of furniture){if(!(f.type in tops))continue;withRoomComponent(components,'surface-tableau',()=>{const [sx,sy,sz]=f.positionMeters,a=f.rotationY||0,cs=Math.cos(a),sn=Math.sin(a),top=sy+tops[f.type],box=(u,v,t,sw,sh,sd,mat=8)=>add([sx+u*cs+t*sn,top+v,sz-u*sn+t*cs],[sw,sh,sd],mat,a);
  if(identity==='laboratory'){box(-.34,.025,0,.24,.04,.20,7);box(-.34,.23,0,.025,.42,.025,8);box(-.26,.40,0,.18,.025,.025,8);for(let k=0;k<3;k++){box(.06+k*.12,.12,0,.065,.23,.065,9);box(.06+k*.12,.25,0,.045,.03,.045,8);}}
  else if(identity==='crypt'){for(let k=0;k<5;k++)box((k-2)*.09,.025,0,.06,.035,.09,k%2?3:16);}
  else {for(let k=0;k<3;k++){box(-.22,.025+k*.035,0,.26,.028,.19,k%2?5:6);box(-.22,.027+k*.035,.098,.22,.012,.012,8);}box(.18,.025,0,.12,.025,.12,8);box(.18,.095,0,.045,.13,.045,3);box(.18,.18,0,.025,.035,.025,8);if(identity==='dining'){box(0,.025,.13,.13,.025,.10,3);box(0,.08,.13,.075,.09,.065,3);}}
  group('inhabited-tableau',[sx,top,sz],.8,.45);
 },{key:f.id,surface:'support:'+f.id});}
 // Corner cobwebs live entirely above headroom; fine radial strands and arcs.
 if(h>2.7&&identity!=='conservatory')for(const side of [-1,1]){withRoomComponent(components,'corner-web',()=>{
  const px=side<0?x+.09:x+w-.09,pz=z+.09,cy=y+h-.20;
  for(let k=1;k<=4;k++){const len=.10+k*.07;add([px-side*len*.35,cy-k*.065,pz+.025],[len,.008,.008],3,side*Math.PI/4);}
  group('high-corner-web',[px,cy,pz],.4,.4);
 },{key:side});}
 ornaments.push(...referenceRoomDetails(room,{identity,y,add,components,profile}));
 return {ornaments,lights,edition:'whole-house-1',variant:seed%7};
}

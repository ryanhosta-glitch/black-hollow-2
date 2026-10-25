import {usesArchitecturalLuxury} from './room_profiles.mjs';
import {withRoomComponent} from './room_components.mjs';
const FT=.3048;
/** Plaster scrollwork and leaded glass fitted to actual room/window dimensions. */
export function referenceRoomDetails(room,{identity,y,add,components=null}){
 const b=room.boundsFeet||room,x=+b.x*FT,z=+b.y*FT,w=+b.l*FT,d=+b.w*FT,h=+b.h*FT,ornaments=[];
 components?.track(ornaments);
 function ring(cx,cy,cz,rx,rz,tube=.014,mat=21){const triangles=[],steps=28,sides=4;
  const p=(i,j)=>{const a=i/steps*Math.PI*2,t=j/sides*Math.PI*2;return[cx+Math.cos(a)*(rx+Math.cos(t)*tube),cy+Math.sin(t)*tube,cz+Math.sin(a)*(rz+Math.cos(t)*tube)];};
  for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const a=p(i,j),b=p(i+1,j),c=p(i+1,j+1),d=p(i,j+1);triangles.push([a,b,c],[a,c,d]);}
  return add([cx,cy,cz],[(rx+tube)*2,tube*2,(rz+tube)*2],mat,0,{triangles});
 }
 const ornate=['dining','ballroom','gallery','parlor','bedroom'].includes(identity);
 if(!usesArchitecturalLuxury(room)&&ornate&&w>3&&d>3&&h>2.65&&!room.forgeStair){withRoomComponent(components,'plaster-ceiling',()=>{
  const cy=y+h-.08,cx=x+w/2,cz=z+d/2,rx=Math.min(w*.32,1.6),rz=Math.min(d*.32,1.6);let drawn=false;
  drawn=ring(cx,cy,cz,rx,rz)||drawn;ring(cx,cy-.012,cz,rx+.045,rz+.045,.009,8);
  for(let k=0;k<8;k++){const a=k*Math.PI/4,px=cx+Math.cos(a)*rx*.78,pz=cz+Math.sin(a)*rz*.78;ring(px,cy-.022,pz,.16,.23,.012,21);ring(px,cy-.025,pz,.08,.13,.009,21);}
  if(drawn)ornaments.push({id:`plaster:${room.id}`,type:'ornate-plaster-ceiling',positionMeters:[cx,cy,cz],width:rx*2,height:.12});
 },{surface:'ceiling-plaster'});}
 for(const [i,o]of(room.openings||[]).filter(o=>o.type==='window').entries()){withRoomComponent(components,'leaded-window',()=>{
  if(['laboratory','crypt','circulation'].includes(identity))return;
  const vertical=o.wall==='left'||o.wall==='right',span=vertical?d:w,at=Math.max(0,Math.min(1,Number(o.pos??.5)))*span;
  const width=Math.min(Number(o.clearWidthMeters||1.65),span-.2),low=Math.min(.95,h*.34),high=Math.min(h-.15,low+1.55),height=high-low;
  if(width<.55||height<.5||at-width/2<.08||at+width/2>span-.08)return;
  const px=vertical?(o.wall==='left'?x+.018:x+w-.018):x+at,pz=vertical?z+at:(o.wall==='top'?z+.018:z+d-.018),cy=y+(low+high)/2;
  const world=(u,v)=>vertical?[px,cy+v,pz+u]:[px+u,cy+v,pz];
  let drawn=false;const cols=4,rows=5;
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const left=-width/2+col*width/cols+.013,right=-width/2+(col+1)*width/cols-.013,bottom=-height/2+row*height/rows+.013,top=-height/2+(row+1)*height/rows-.013,u=(left+right)/2,v=(bottom+top)/2;
   const triangle=[[world(u,top),world(right,v),world(u,bottom)],[world(u,top),world(u,bottom),world(left,v)]],mat=(row===2&&col===1)?23:(row+col)%3===0?24:22;
   drawn=add(world(u,v),vertical?[.006,top-bottom,right-left]:[right-left,top-bottom,.006],mat,0,{triangles:triangle})||drawn;
  }
  // Dark lead borders and diamond outlines remain within the authored opening.
  for(let col=0;col<=cols;col++)add(world(-width/2+col*width/cols,0),vertical?[.012,height,.012]:[.012,height,.012],19);
  for(let row=0;row<=rows;row++)add(world(0,-height/2+row*height/rows),vertical?[.012,.012,width]:[width,.012,.012],19);
  if(drawn)ornaments.push({id:`leaded:${room.id}:${i}`,type:'jewel-leaded-glass',positionMeters:[px,cy,pz],width,height});
 },{key:i,surface:'window-glass:'+i});}
 return ornaments;
}

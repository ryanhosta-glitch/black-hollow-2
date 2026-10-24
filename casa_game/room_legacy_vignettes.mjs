import {wallMount} from './wall_mount.mjs';
const STORIES={
 library:['The Brass Atlas','A brass globe stands over a half-open atlas. Someone circled a place that appears on no map, then wrote: Leave a light in the window.'],
 laboratory:['The Green Experiment','Three stoppered vessels surround a green specimen. The last notebook entry reads: It responds to kindness before it responds to light.'],
 conservatory:['The Glass Garden','A tiny fern has outgrown its specimen bell. A pressed flower beside it carries a date from next spring.'],
 bedroom:['The Unsent Letter','A jewel box stands open beside a folded letter. The ribbon has been untied and retied so often that its edges have become soft.'],
 nursery:['The Little Theatre','A toy theatre waits with its curtains open. On the little stage, a painted figure is still waiting for its cue.'],
 dining:['The Supper Kept Warm','A silver service waits beside an untouched cup. Every place has a name. The final card reads: Whoever needs a place.'],
 ballroom:['The Last Record','The brass horn of a music machine points toward the empty floor. Its record is labelled: One more dance before the carriage comes.'],
 gallery:['The Absent Sitter','An oval miniature rests beneath a larger frame. Its sitter is gone, but the small brass chair beside it has been carefully polished.'],
 crypt:['The Patient Memorial','Black candles surround a small urn. Someone has replaced the dried flowers with a fresh green sprig.'],
 parlor:['The Calling Card','An engraved tray holds a cup and a calling card. The visitor’s name has faded; the words You are welcome have not.']
};
/** A bounded, portable vignette: supported tabletop objects or a high wall cabinet. */
export function legacyVignette(room,{identity,y,furniture,occupied,add}){
 const story=STORIES[identity];if(!story||room.forgeStair)return {ornaments:[],story:null};
 const tops={writing_desk:.83,dining_table:.79,laboratory_bench:.90,console:.88,supper_table:.79},support=furniture.find(f=>tops[f.type]);let origin,angle=0,mount=null;
 if(support){origin=[support.positionMeters[0],support.positionMeters[1]+tops[support.type]+.025,support.positionMeters[2]];angle=support.rotationY||0;}
 else{const b=room.boundsFeet||room,h=+b.h*.3048;if(h<2.8)return {ornaments:[],story:null};mount=wallMount(room,{width:.95,height:.65,y:Math.min(2.5,h-.5),inset:.07,occupied});if(!mount)return {ornaments:[],story:null};origin=[mount.position[0],y+mount.position[1]-.27,mount.position[2]];angle=mount.rotationY;}
 const cs=Math.cos(angle),sn=Math.sin(angle),world=p=>[origin[0]+p[0]*cs+p[2]*sn,origin[1]+p[1],origin[2]-p[0]*sn+p[2]*cs];let count=0;
 const emit=(c,s,mat=8,rot=0,shape={})=>{const result=add(world(c),s,mat,angle+rot,shape);if(result)count++;return result;};
 const box=(p,s,mat=8,rot=0)=>emit(p,s,mat,rot);
 function ring(center,radius,tube=.012,mat=8,axis='y'){
  const triangles=[],steps=24,sides=4,p=(i,j)=>{const a=i/steps*Math.PI*2,b=j/sides*Math.PI*2,R=radius+Math.cos(b)*tube;return world(axis==='y'?[center[0]+Math.cos(a)*R,center[1]+Math.sin(b)*tube,center[2]+Math.sin(a)*R]:[center[0]+Math.cos(a)*R,center[1]+Math.sin(a)*R,center[2]+Math.sin(b)*tube]);};
  for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const a=p(i,j),b=p(i+1,j),c=p(i+1,j+1),d=p(i,j+1);triangles.push([a,b,c],[a,c,d]);}
  const ok=add(world(center),[radius*2+tube*2,radius*2+tube*2,radius*2+tube*2],mat,0,{triangles});if(ok)count++;
 }
 if(mount){box([0,-.025,.09],[.94,.055,.27],5);for(const side of [-1,1])box([side*.46,.27,.01],[.055,.60,.05],8);box([0,.56,.01],[.96,.055,.05],8);occupied.push({wall:mount.wall,center:mount.wall==='left'||mount.wall==='right'?mount.position[2]-+(room.boundsFeet||room).y*.3048:mount.position[0]-+(room.boundsFeet||room).x*.3048,width:1.05});}
 // The central object stays inside the support; small papers and fittings make it legible.
 box([0,.025,.05],[.52,.045,.30],5);box([-.19,.06,.06],[.15,.025,.19],17,.12);
 if(identity==='library'){
  box([.08,.13,.07],[.035,.18,.035],8);ring([.08,.31,.07],.16,.014,8,'z');ring([.08,.31,.07],.13,.009,18);ring([.08,.31,.07],.10,.009,8,'z');
  for(let i=0;i<3;i++)box([-.16,.075+i*.035,.08],[.18,.03,.22],i%2?6:23,.07*i);
 }else if(['laboratory','conservatory'].includes(identity)){
  for(let i=-1;i<=1;i++){box([i*.16,.15,.06],[.075,.20,.075],i===0?16:22);box([i*.16,.27,.06],[.035,.06,.035],8);box([i*.16,.31,.06],[.06,.025,.06],5);}
  if(identity==='conservatory'){for(let i=0;i<6;i++)box([Math.sin(i)*.08,.21+i*.02,.06+Math.cos(i)*.06],[.025,.13,.035],16,i*.5);ring([0,.10,.06],.12,.009,18);for(let k=0;k<4;k++){const a=k*Math.PI/2;for(let j=0;j<8;j++){const t=j/8*Math.PI/2,u=(j+1)/8*Math.PI/2,A=[Math.cos(a)*.13*Math.cos(t),.10+.38*Math.sin(t),.06+Math.sin(a)*.13*Math.cos(t)],B=[Math.cos(a)*.13*Math.cos(u),.10+.38*Math.sin(u),.06+Math.sin(a)*.13*Math.cos(u)];const triangles=[[world([A[0]-.004,A[1],A[2]]),world([A[0]+.004,A[1],A[2]]),world(B)]];if(add(world(A),[.02,.10,.02],18,0,{triangles}))count++;}}}
 }else if(identity==='ballroom'){
  ring([0,.075,.06],.17,.015,19);ring([0,.075,.06],.08,.009,8);box([.18,.12,.06],[.018,.08,.018],8);box([.11,.16,.06],[.16,.018,.018],8);const triangles=[],n=24;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,A=world([.19,.19,.06]),B=world([.02+Math.cos(a)*.14,.42+Math.sin(a)*.14,.06]),C=world([.02+Math.cos(b)*.14,.42+Math.sin(b)*.14,.06]);triangles.push([A,B,C],[C,B,A]);}if(add(world([.07,.3,.06]),[.36,.40,.30],8,0,{triangles}))count++;
 }else if(identity==='nursery'){
  for(const side of [-1,1]){box([side*.21,.23,.09],[.035,.32,.06],8);box([side*.16,.24,.10],[.075,.25,.035],6);}box([0,.40,.09],[.46,.055,.07],8);box([0,.11,.09],[.40,.04,.20],5);box([0,.21,.09],[.15,.13,.055],17);
 }else if(identity==='crypt'){
  for(const side of [-1,1]){box([side*.17,.14,.06],[.05,.19,.05],19);box([side*.17,.25,.06],[.025,.035,.025],8);}box([0,.16,.06],[.12,.18,.12],7);box([0,.27,.06],[.16,.035,.16],8);box([0,.32,.06],[.025,.09,.025],16);
 }else if(['dining','parlor'].includes(identity)){
  ring([0,.06,.06],.23,.013,18);for(const side of [-1,1]){box([side*.14,.11,.06],[.09,.10,.09],17);ring([side*.20,.12,.06],.035,.008,8,'z');}box([0,.14,.06],[.11,.16,.11],18);box([0,.24,.06],[.13,.025,.13],8);
 }else{
  box([.08,.11,.06],[.22,.10,.17],6);box([.08,.18,.015],[.23,.025,.18],8,.10);ring([-.15,.20,.06],.095,.012,8,'z');box([-.15,.20,.066],[.12,.13,.012],identity==='gallery'?19:17);box([-.15,.10,.06],[.025,.10,.025],8);
 }
 return {ornaments:count?[{id:'legacy:'+room.id,type:'victorian-story-vignette',wall:mount?.wall,positionMeters:origin,width:.96,height:.65,storyTitle:story[0]}]:[],story:count?{title:story[0],text:story[1]+' This is an optional house memory; follow your field journal for the haunting.'}:null};
}

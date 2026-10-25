import {architecturalShapes} from './component_shapes.mjs';
import {ROOM_MATERIALS as M} from './room_materials.mjs';
import {GOTHIC_LIMITS} from './room_atmosphere_profiles.mjs';
export const GOTHIC_COMPONENTS=Object.freeze(Object.fromEntries([
 ['velvet-curtain','textile'],['layered-valance','textile'],['bed-canopy','textile'],['upholstered-panel','textile'],['table-cover','textile'],
 ['leaded-rosette','glass'],['fern-fronds','botanical'],['trailing-ivy','botanical'],['specimen-case','botanical'],['funeral-spray','botanical'],['water-trace','aging'],['settled-dust','aging']
].map(([id,family])=>[id,Object.freeze({id,family,generator:'gothicComponentParts'})])));
/** Shared local, material-batched geometry. No external models, maps or runtime deformation. */
export function gothicComponentParts(type,{width=1,height=1,condition='preserved',state='maintained',variant=0,compact=false,fabric='emerald'}={}){
 if(!GOTHIC_COMPONENTS[type])throw Error('Unknown Gothic component '+type);
 if(![width,height].every(v=>Number.isFinite(v)&&v>0&&v<=4))throw Error('Invalid Gothic dimensions');
 const parts=[],g=architecturalShapes((c,s,mat,rot,shape)=>{parts.push({c,s,mat,...shape});return true;}),cloth=condition==='preserved'?({claret:M.upholstery,emerald:M.emeraldVelvet,blue:M.blueVelvet,ivory:M.linen}[fabric]||M.emeraldVelvet):condition==='abandoned'?(fabric==='blue'?M.fadedBlue:fabric==='ivory'?M.fadedLinen:M.fadedVelvet):M.wornVelvet,metal=condition==='preserved'?M.gilt:M.patina,wood=condition==='preserved'?M.wood:M.agedMahogany,leaf=state==='maintained'?M.fernLeaf:state==='dried'?M.driedLeaf:M.ivyLeaf;
 const box=(x,y,z,w,h,d,mat)=>g.box([x,y,z],[w,h,d],mat);
 function clothPanel(x,y,z,w,h,folds=8,swag=0){const rows=2,cols=compact?12:20,p=(i,j)=>{const u=i/cols,v=j/rows;return[x+(u-.5)*w,y+(v-.5)*h-swag*Math.sin(u*Math.PI),z+.012*Math.cos(u*Math.PI*folds*2)*(1+.25*Math.sin(v*Math.PI))];};for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)g.quad(p(i,j),p(i+1,j),p(i+1,j+1),p(i,j+1),cloth);}
 function frond(angle,length=.5,origin=[0,0,0]){const cs=Math.cos(angle),sn=Math.sin(angle),p=(r,y,side=0)=>[origin[0]+cs*r-sn*side,origin[1]+y,origin[2]+sn*r+cs*side];
  let prev=origin;for(let k=1;k<=5;k++){const t=k/5,r=length*t*.60,y=length*(Math.sin(t*Math.PI*.8)*.66+.20),now=p(r,y);g.quad(prev,[prev[0]+.003,prev[1],prev[2]],now,[now[0]-.003,now[1],now[2]],leaf);for(const sign of [-1,1]){const broad=length*.12*Math.sin(t*Math.PI*.85),mid=p(r-length*.035,y+.018,sign*broad*.65),tip=p(r+length*.10,y-.018,sign*broad);g.triangle(p(r-length*.07,y-.025),mid,tip,leaf);g.triangle(p(r-length*.07,y-.025),tip,p(r+length*.035,y-.012),leaf);}prev=now;}
 }
 if(type==='velvet-curtain'){
  for(const sign of [-1,1]){clothPanel(sign*width*.395,height/2,0,width*.20,height,5);clothPanel(sign*width*.30,height/2,-.021,width*.10,height*.97,3);box(sign*width*.395,height*.45,.016,width*.22,.025,.012,metal);for(let k=0;k<3;k++)box(sign*width*.395+(k-1)*.012,height*.40,.019,.006,.09,.006,metal);}
 }
 if(type==='layered-valance'||type==='bed-canopy'){
  clothPanel(0,height/2,0,width,height*.64,9,height*.22);box(0,height*.89,-.008,width+.025,.035,.045,wood);for(const s of [-1,1]){clothPanel(s*width*.44,height*.23,.008,width*.12,height*.45,3);box(s*width*.44,height*.04,.012,.018,.06,.018,metal);}
 }
 if(type==='upholstered-panel'){clothPanel(0,height/2,0,width,height,8);for(let row=0;row<3;row++)for(let col=0;col<5;col++)box((col-2)*width*.18,(row+.5)*height/3,.022,.012,.012,.008,metal);}
 if(type==='table-cover'){const cols=12,p=(i,z)=>[(i/cols-.5)*width,.0015+.0006*Math.cos(i/cols*Math.PI*12),z];for(let i=0;i<cols;i++)g.quad(p(i,-height/2),p(i,height/2),p(i+1,height/2),p(i+1,-height/2),cloth);for(const s of [-1,1])box(s*width*.46,.002,0,.008,.001,height,metal);}
 if(type==='leaded-rosette'){
  const cols=compact?3:4,rows=4,mat=(i,j)=>i===1&&j===1?M.rubyGlass:(i+j+variant)%3?M.leadedGlass:M.amberGlass;
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x=(i+.5)*width/cols-width/2,y=(j+.5)*height/rows,rx=width/cols/2-.009,ry=height/rows/2-.009;g.quad([x,y+ry,0],[x+rx,y,0],[x,y-ry,0],[x-rx,y,0],mat(i,j));}
  for(let i=0;i<=cols;i++)box(-width/2+i*width/cols,height/2,.005,.009,height,.009,M.ebony);
  for(let j=0;j<=rows;j++)box(0,j*height/rows,.005,width,.009,.009,M.ebony);
  g.rosette((u,v,t)=>[u,height/2+v,.012+t*.15],0,0,Math.min(width,height)*.13,metal,6);
 }
 if(type==='fern-fronds')for(let k=0;k<(compact?5:8);k++)frond(k*Math.PI*2/(compact?5:8)+variant*.15,height,[-.01,0,0]);
 if(type==='trailing-ivy'){
  for(let k=0;k<9;k++){const yy=height*(1-k/8),xx=Math.sin(k*.8+variant)*width*.23;box(xx,yy,.008,.008,height/8+.025,.008,leaf);for(const s of [-1,1])g.rosette((u,v,t)=>[xx+s*width*.17+u,yy+v,.014+t*.12],0,0,Math.min(.08,width*.14),leaf,3);}
 }
 if(type==='specimen-case'||type==='funeral-spray'){
  if(type==='specimen-case'){box(0,.015,0,width,.03,.16,wood);box(0,height/2,-.055,width,height,.025,wood);for(const s of [-1,1])box(s*width*.48,height/2,.025,.025,height,.18,metal);box(0,height/2,.092,width*.90,height*.92,.003,M.displayGlass);}
  for(let k=0;k<3;k++){
   const x=(k-1)*width*.28;box(x,height*.29,0,.007,height*.58,.007,leaf);for(let j=0;j<3;j++)g.rosette((u,v,t)=>[x+u,height*(.48+j*.12)+v,.02+t*.12],0,0,height*.075,type==='funeral-spray'?M.ivory:leaf,5);
  }
 }
 if(type==='settled-dust')g.triangle([-width/2,0,-width/2],[0,0,width/2],[width/2,0,-width/2],M.dust);
 if(type==='water-trace'){for(let k=0;k<5;k++){const x=(k-2)*width/6,high=height*(.65+((k+variant)%3)*.13);g.quad([x-.015,0,0],[x+.025,0,0],[x+.008,high,0],[x-.006,high,0],M.waterMark);}}
 g.flush();const triangles=parts.reduce((n,p)=>n+p.triangles.length,0);
 if(triangles>GOTHIC_LIMITS.maxTemplateTriangles||parts.length>GOTHIC_LIMITS.maxTemplateMaterials)throw Error('Gothic template budget exceeded '+type);
 return parts;
}

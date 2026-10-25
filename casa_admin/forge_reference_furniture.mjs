import {heirloomFurnitureParts} from './forge_heirloom_furniture.mjs';
// Sculpted portable furniture. Curved surfaces are baked into CASA, not remote assets.
export const REFERENCE_FURNITURE={gothic_armchair:{footprint:[.94,.94],height:1.72},tufted_settee:{footprint:[1.9,.88],height:1.30},supper_table:{footprint:[2.1,1.2],height:1.42},banquet_ensemble:{footprint:[2.7,3.45],height:1.65},coffin_cabinet:{footprint:[1.0,.52],height:2.18},gothic_headboard:{footprint:[1.65,.26],height:1.82}};
export function referenceFurnitureParts(item){
 const upgraded=heirloomFurnitureParts(item);if(upgraded)return upgraded;
 const parts=[],[px,py,pz]=item.positionMeters,a=item.rotationY||0,cs=Math.cos(a),sn=Math.sin(a),world=([x,y,z])=>[px+x*cs+z*sn,py+y,pz-x*sn+z*cs];
 const box=(x,y,z,w,h,d,mat=5)=>parts.push({c:world([x,y,z]),s:[w,h,d],mat,rot:a,rotAxis:'y'});
 function mesh(triangles,mat,smooth=false){const points=triangles.flat(),min=[0,1,2].map(i=>Math.min(...points.map(p=>p[i]))),max=[0,1,2].map(i=>Math.max(...points.map(p=>p[i])));parts.push({c:world(min.map((v,i)=>(v+max[i])/2)),s:min.map((v,i)=>Math.max(.001,max[i]-v)),mat,smooth,triangles:triangles.map(t=>t.map(world))});}
 function lathe(x,y,z,profile,mat=8,n=12){const t=[];for(let k=0;k<n;k++)for(let j=1;j<profile.length;j++){const p=(i,q)=>[x+Math.cos(i/n*Math.PI*2)*profile[q][0],y+profile[q][1],z+Math.sin(i/n*Math.PI*2)*profile[q][0]],v=[p(k,j-1),p(k+1,j-1),p(k+1,j),p(k,j)];t.push([v[0],v[2],v[1]],[v[0],v[3],v[2]]);}mesh(t,mat);}
 function rail(x1,y1,x2,y2,z,width,depth,mat=8){const length=Math.hypot(x2-x1,y2-y1),ang=Math.atan2(y2-y1,x2-x1),v=[[-length/2,-width/2],[length/2,-width/2],[length/2,width/2],[-length/2,width/2]],points=v.map(([x,y])=>[(x1+x2)/2+x*Math.cos(ang)-y*Math.sin(ang),(y1+y2)/2+x*Math.sin(ang)+y*Math.cos(ang)]),t=[];for(let i=0;i<4;i++){const j=(i+1)%4,A=[...points[i],z-depth/2],B=[...points[j],z-depth/2],C=[...points[j],z+depth/2],D=[...points[i],z+depth/2];t.push([A,B,C],[A,C,D]);}mesh(t,mat);}
 function goblet(x,y,z){lathe(x,y,z,[[0,0],[.045,0],[.045,.012],[.012,.025],[.009,.08],[.035,.10],[.045,.15],[.04,.17],[.032,.17],[.035,.145],[.027,.11],[0,.10]],18,10);}
 function candle(x,y,z,height=.19){lathe(x,y,z,[[0,0],[.06,0],[.055,.025],[.015,.045],[.015,.09],[.04,.10],[.04,.12],[0,.12]],18);lathe(x,y+.12,z,[[0,0],[.022,0],[.022,height],[0,height]],17);lathe(x,y+.12+height,z,[[0,0],[.012,.018],[0,.055]],8,8);}
 function bead(x,y,z,r=.03,mat=8){lathe(x,y-r,z,[[0,0],[r*.8,r*.3],[r,r],[r*.8,r*1.7],[0,r*2]],mat,10);}
 function scroll(cx,cy,z,r=.10,mat=19,phase=0){let prev=null;for(let k=0;k<=18;k++){const a=phase+k/18*Math.PI*2.2,rr=r*(1-k/24),p=[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr];if(prev)rail(...prev,...p,z,.018,.028,mat);prev=p;}}

 if(item.type==='coffin_cabinet'){
  const profile=[[-.28,.05],[.28,.05],[.46,1.55],[.31,2.12],[-.31,2.12],[-.46,1.55]],tri=[];
  for(let i=1;i<profile.length-1;i++)tri.push([[...profile[0],-.19],[...profile[i],-.19],[...profile[i+1],-.19]]);mesh(tri,19);
  for(let i=0;i<profile.length;i++){const j=(i+1)%profile.length;rail(...profile[i],...profile[j],0,.055,.43,19);rail(...profile[i],...profile[j],.225,.015,.025,18);}
  for(const sy of [.39,.80,1.21,1.62]){const sw=sy>1.5?.76:.54+sy*.12;box(0,sy,0,sw,.035,.39,19);box(0,sy,.205,sw,.018,.018,18);for(let k=-1;k<=1;k++)goblet(k*.17,sy+.025,.02);}
  // A skull keepsake on the central shelf; sockets are inset dark patches.
  lathe(0,.835,.04,[[0,0],[.055,0],[.09,.035],[.10,.12],[.065,.18],[0,.20]],17,14);box(0,.855,.113,.10,.045,.06,17);
  for(const side of [-1,1]){box(side*.037,.935,.132,.035,.032,.018,19);for(let k=0;k<3;k++)box(side*(.008+k*.013),.864,.145,.009,.022,.012,17);}
  box(0,.906,.143,.017,.024,.012,19);
 }



 return parts;
}

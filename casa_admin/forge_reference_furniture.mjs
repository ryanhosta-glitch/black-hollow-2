// Sculpted portable furniture. Curved surfaces are baked into CASA, not remote assets.
export const REFERENCE_FURNITURE={gothic_armchair:{footprint:[.94,.94],height:1.72},tufted_settee:{footprint:[1.9,.88],height:1.30},supper_table:{footprint:[2.1,1.2],height:1.42},banquet_ensemble:{footprint:[2.7,3.45],height:1.65},coffin_cabinet:{footprint:[1.0,.52],height:2.18},gothic_headboard:{footprint:[1.65,.26],height:1.82}};
export function referenceFurnitureParts(item){
 const parts=[],[px,py,pz]=item.positionMeters,a=item.rotationY||0,cs=Math.cos(a),sn=Math.sin(a),world=([x,y,z])=>[px+x*cs+z*sn,py+y,pz-x*sn+z*cs];
 const box=(x,y,z,w,h,d,mat=5)=>parts.push({c:world([x,y,z]),s:[w,h,d],mat,rot:a,rotAxis:'y'});
 function mesh(triangles,mat){const points=triangles.flat(),min=[0,1,2].map(i=>Math.min(...points.map(p=>p[i]))),max=[0,1,2].map(i=>Math.max(...points.map(p=>p[i])));parts.push({c:world(min.map((v,i)=>(v+max[i])/2)),s:min.map((v,i)=>Math.max(.001,max[i]-v)),mat,triangles:triangles.map(t=>t.map(world))});}
 function lathe(x,y,z,profile,mat=8,n=12){const t=[];for(let k=0;k<n;k++)for(let j=1;j<profile.length;j++){const p=(i,q)=>[x+Math.cos(i/n*Math.PI*2)*profile[q][0],y+profile[q][1],z+Math.sin(i/n*Math.PI*2)*profile[q][0]],v=[p(k,j-1),p(k+1,j-1),p(k+1,j),p(k,j)];t.push([v[0],v[2],v[1]],[v[0],v[3],v[2]]);}mesh(t,mat);}
 function rail(x1,y1,x2,y2,z,width,depth,mat=8){const length=Math.hypot(x2-x1,y2-y1),ang=Math.atan2(y2-y1,x2-x1),v=[[-length/2,-width/2],[length/2,-width/2],[length/2,width/2],[-length/2,width/2]],points=v.map(([x,y])=>[(x1+x2)/2+x*Math.cos(ang)-y*Math.sin(ang),(y1+y2)/2+x*Math.sin(ang)+y*Math.cos(ang)]),t=[];for(let i=0;i<4;i++){const j=(i+1)%4,A=[...points[i],z-depth/2],B=[...points[j],z-depth/2],C=[...points[j],z+depth/2],D=[...points[i],z+depth/2];t.push([A,B,C],[A,C,D]);}mesh(t,mat);}
 function goblet(x,y,z){lathe(x,y,z,[[0,0],[.045,0],[.045,.012],[.012,.025],[.009,.08],[.035,.10],[.045,.15],[.04,.17],[.032,.17],[.035,.145],[.027,.11],[0,.10]],18,10);}
 function candle(x,y,z,height=.19){lathe(x,y,z,[[0,0],[.06,0],[.055,.025],[.015,.045],[.015,.09],[.04,.10],[.04,.12],[0,.12]],18);lathe(x,y+.12,z,[[0,0],[.022,0],[.022,height],[0,height]],17);lathe(x,y+.12+height,z,[[0,0],[.012,.018],[0,.055]],8,8);}
 function bead(x,y,z,r=.03,mat=8){lathe(x,y-r,z,[[0,0],[r*.8,r*.3],[r,r],[r*.8,r*1.7],[0,r*2]],mat,10);}
 function scroll(cx,cy,z,r=.10,mat=19,phase=0){let prev=null;for(let k=0;k<=18;k++){const a=phase+k/18*Math.PI*2.2,rr=r*(1-k/24),p=[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr];if(prev)rail(...prev,...p,z,.018,.028,mat);prev=p;}}
 if(['gothic_armchair','tufted_settee'].includes(item.type)){
  const sofa=item.type==='tufted_settee',width=sofa?1.76:.78,half=width/2,back=sofa?1.15:1.52;
  box(0,.42,0,width,.14,.70,19);box(0,.51,.015,width-.10,.13,.61,25);box(0,.65,-.30,width-.11,.20,.065,19);
  for(const side of [-1,1])for(const end of [-1,1]){const lx=side*(half-.08),lz=end*.27;lathe(lx,0,lz,[[0,0],[.065,0],[.07,.04],[.045,.10],[.035,.17],[.065,.22],[.035,.30],[.05,.40],[0,.40]],19);bead(lx,.06,lz,.055,19);}
  box(0,(back+.55)/2,-.34,width-.10,back-.55,.075,19);box(0,(back+.59)/2,-.285,width-.20,back-.59,.04,25);
  // Raised upholstery lobes and small recessed-looking brass buttons.
  const cols=sofa?9:4,rows=sofa?3:5;for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const xx=(col-(cols-1)/2)*(width-.28)/cols,yy=.67+row*(back-.73)/Math.max(1,rows-1);lathe(xx,yy-.065,-.245,[[0,0],[.055,.015],[.065,.065],[.055,.115],[0,.13]],25,10);bead(xx,yy,-.205,.011,8);}
  // Curving carved crest: pointed Gothic arch on chairs, scalloped sofa crest.
  for(const side of [-1,1]){box(side*(half-.035),(.55+back)/2,-.32,.055,back-.45,.075,19);bead(side*(half-.035),back+.045,-.32,.052,19);for(let k=0;k<6;k++){const u1=k/6,u2=(k+1)/6,x1=side*(half-.04)*(1-u1),x2=side*(half-.04)*(1-u2),y1=back+(sofa?.10*Math.sin(u1*Math.PI):.13*u1),y2=back+(sofa?.10*Math.sin(u2*Math.PI):.13*u2);rail(x1,y1,x2,y2,-.32,.055,.08,19);}scroll(side*half*.7,back+.035,-.26,.055,19,side);}
  if(!sofa){rail(-.24,1.32,0,1.58,-.235,.035,.04,8);rail(0,1.58,.24,1.32,-.235,.035,.04,8);bead(0,1.61,-.25,.055,19);}
  for(const side of [-1,1]){box(side*(half-.025),.69,.01,.09,.11,.66,19);lathe(side*(half-.025),.52,.24,[[0,0],[.045,0],[.035,.15],[.06,.22],[0,.22]],19);scroll(side*(half-.03),.75,.27,.065,19,side);}
 }
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
 if(item.type==='banquet_ensemble'){
  box(0,.76,0,1.45,.10,2.65);box(0,.815,0,1.40,.025,2.60,19);
  // Ivory runner and place settings, reflected in polished silver goblets.
  box(0,.833,0,.35,.012,2.54,20);for(let i=0;i<17;i++)box(0,.842,(i-8)*.145,.31,.004,.008,18);
  for(const end of [-1,1]){lathe(0,0,end*.88,[[0,0],[.28,0],[.29,.07],[.12,.12],[.10,.26],[.17,.36],[.10,.48],[.12,.67],[.23,.70],[0,.70]],5);}
  const chair=(x,z,sign)=>{box(x,.47,z,.47,.09,.45);box(x,.53,z,.42,.06,.39,6);for(const u of [-1,1])for(const v of [-1,1])lathe(x+u*.19,0,z+v*.17,[[0,0],[.035,0],[.025,.13],[.04,.20],[.024,.31],[.03,.44],[0,.44]],5,8);
   for(const u of [-1,1]){box(x+sign*.20,1.0,z+u*.20,.045,1.0,.045);lathe(x+sign*.20,1.53,z+u*.20,[[0,0],[.045,.025],[0,.07]],8,8);}box(x+sign*.20,1.10,z,.045,.53,.37,6);for(const v of [-1,1])box(x+sign*.23,1.10,z+v*.15,.025,.48,.018,8);};
  for(const side of [-1,1])for(const t of [-.86,0,.86]){chair(side*1.06,t,side);lathe(side*.48,.838,t,[[0,0],[.15,0],[.15,.014],[.11,.028],[0,.028]],17,16);goblet(side*.45,.84,t-.25);box(side*.64,.849,t,.015,.012,.22,18);}
  for(const k of [-1,0,1])candle(k*.17,.85,0,k===0?.36:.22);
  box(0,1.02,0,.40,.025,.04,18);
 }
 if(item.type==='supper_table'){
  box(0,.76,0,1.0,.08,.88);box(0,.81,0,.95,.018,.84,19);box(0,.825,0,.24,.012,.80,20);
  for(const u of [-1,1])for(const v of [-1,1])lathe(u*.39,0,v*.33,[[0,0],[.035,0],[.025,.25],[.045,.34],[.025,.50],[.035,.72],[0,.72]],5,8);
  for(const side of [-1,1]){const sx=side*.79;box(sx,.46,0,.43,.08,.46);box(sx,.515,0,.39,.035,.41,6);for(const u of [-1,1])for(const v of [-1,1])box(sx+u*.16,.23,v*.17,.035,.46,.035);for(const v of [-1,1])box(sx+side*.18,.96,v*.19,.04,.88,.04);box(sx+side*.18,1.06,0,.045,.43,.33,6);box(sx+side*.18,1.32,0,.065,.07,.43,8);
   lathe(side*.29,.84,0,[[0,0],[.13,0],[.13,.012],[.09,.024],[0,.024]],17,14);goblet(side*.29,.84,-.25);}
  candle(0,.84,0,.20);
 }
 if(item.type==='gothic_headboard'){
  box(0,.87,0,1.62,1.42,.13);box(0,.94,.08,1.43,1.16,.025,5);
  for(const side of [-1,1]){box(side*.78,.88,.07,.055,1.55,.055,8);lathe(side*.74,1.62,0,[[0,0],[.06,.03],[.07,.08],[.02,.13],[0,.16]],8);}
  for(let i=0;i<12;i++){const x1=-.73+i/12*1.46,x2=-.73+(i+1)/12*1.46,y1=1.52+.23*Math.cos(x1/.73*Math.PI/2),y2=1.52+.23*Math.cos(x2/.73*Math.PI/2);rail(x1,y1,x2,y2,.07,.06,.08,5);rail(x1,y1-.08,x2,y2-.08,.12,.015,.025,8);}
 }
 return parts;
}

import {architecturalShapes} from './forge_architectural_shapes.mjs';
import {HEIRLOOM_TYPES,HEIRLOOM_FINISHES,HEIRLOOM_UPHOLSTERY,heirloomStyle,heirloomStyleKey} from './forge_heirloom_style.mjs';
import {ROOM_MATERIALS as M} from '../casa_game/room_materials.mjs';
import {fireplaceSurroundParts} from './forge_fireplace_surround.mjs';
// Cache bounded local templates, never world coordinates or room-specific records.
const templates=new Map(),MAX_CACHE=32;
export const HEIRLOOM_ASSET_LIMITS=Object.freeze({triangles:6000,materials:8,cacheEntries:MAX_CACHE});
export function heirloomFurnitureParts(item){
 if(!HEIRLOOM_TYPES.includes(item.type))return null;
 const style=item.furnitureStyle||heirloomStyle(),key=item.type+':'+heirloomStyleKey(style)+':'+(item.finishTreatment||'marble');
 let local=templates.get(key);if(!local){local=build(item.type,style,item.finishTreatment);if(templates.size>=MAX_CACHE)templates.delete(templates.keys().next().value);templates.set(key,local);}
 const [x,y,z]=item.positionMeters||[0,0,0],a=item.rotationY||0,c=Math.cos(a),s=Math.sin(a),world=p=>[x+p[0]*c+p[2]*s,y+p[1],z-p[0]*s+p[2]*c];
 return local.map(p=>({...p,c:world(p.c),s:[...p.s],triangles:p.triangles.map(t=>t.map(world))}));
}
function build(type,style,finishTreatment){
 const out=[],g=architecturalShapes((c,s,mat,rot,shape)=>{out.push({c,s,mat,...shape});return true;}),wood=style.condition==='aged'&&style.wood==='mahogany'?M.agedMahogany:HEIRLOOM_FINISHES[style.wood]??M.wood,fabric=HEIRLOOM_UPHOLSTERY[style.upholstery]??M.upholstery,gold=style.condition==='aged'?M.metal:M.gilt,detail=style.ornament!=='essential',luxury=style.ornament==='luxury';
 const box=(x,y,z,w,h,d,m=wood)=>g.box([x,y,z],[w,h,d],m);
 function lathe(x,y,z,profile,m=wood,n=8){
  for(let i=0;i<n;i++)for(let j=1;j<profile.length;j++){
   const p=(k,q)=>[x+Math.cos(k/n*Math.PI*2)*profile[q][0],y+profile[q][1],z+Math.sin(k/n*Math.PI*2)*profile[q][0]];
   g.quad(p(i,j-1),p(i,j),p(i+1,j),p(i+1,j-1),m);
  }
 }
 const orb=(x,y,z,r,m=gold)=>lathe(x,y-r,z,[[0,0],[r*.8,r*.4],[r,r],[r*.8,r*1.6],[0,r*2]],m);
 function rail(a,b,r=.018,m=gold,n=6){
  const axis=b.map((v,i)=>v-a[i]),len=Math.hypot(...axis),u=axis.map(v=>v/len),v=Math.abs(u[1])<.9?[0,1,0]:[1,0,0],cross=(p,q)=>[p[1]*q[2]-p[2]*q[1],p[2]*q[0]-p[0]*q[2],p[0]*q[1]-p[1]*q[0]],w0=cross(u,v),wl=Math.hypot(...w0),w=w0.map(t=>t/wl),t=cross(u,w),point=(p,k)=>p.map((v,i)=>v+r*(Math.cos(k/n*Math.PI*2)*w[i]+Math.sin(k/n*Math.PI*2)*t[i]));
  for(let k=0;k<n;k++)g.quad(point(a,k),point(b,k),point(b,k+1),point(a,k+1),m);
 }
 function curve(points,r,m=wood){for(let k=1;k<points.length;k++)rail(points[k-1],points[k],r,m);}
 function leg(x,z,h=.40,r=.045){lathe(x,0,z,[[0,0],[r*.82,0],[r,.035],[r*.58,h*.3],[r*.85,h*.42],[r*.60,h*.66],[r,h*.9],[r,h],[0,h]],wood);if(detail)lathe(x,h*.39,z,[[r*.86,0],[r*.9,.015],[r*.86,.03]],gold);}
 function panel(x,y,z,w,h){g.panel((u,v,t)=>[u,v,z+t],x,y,w,h,wood,.012);}
 function carving(x,y,z,r=.06){if(detail)g.rosette((u,v,t)=>[u,v,z+t*.12],x,y,r,gold,luxury?8:4+style.pattern);}
 function cushion(cx,cy,cz,w,h,d,m=fabric){
  // Rounded loaf silhouette in horizontal rings, closed top and bottom.
  const rings=[[0,.78],[.12,.97],[.48,1],[.88,.97],[1,.78]],n=12,point=(j,k)=>{const a=k/n*Math.PI*2,[v,scale]=rings[j],co=Math.cos(a),si=Math.sin(a);return[cx+Math.sign(co)*Math.abs(co)**.38*w*.5*scale,cy+(v-.5)*h,cz+Math.sign(si)*Math.abs(si)**.38*d*.5*scale];};
  for(let j=1;j<rings.length;j++)for(let k=0;k<n;k++)g.quad(point(j-1,k),point(j,k),point(j,k+1),point(j-1,k+1),m);
  for(let k=1;k<n-1;k++){g.triangle(point(0,0),point(0,k),point(0,k+1),m);g.triangle(point(4,0),point(4,k+1),point(4,k),m);}
 }
 function paddedBack(x,y,z,w,h){
  box(x,y,z-.035,w+.04,h+.04,.07);const cols=Math.max(2,Math.round(w/.23)),rows=Math.max(2,Math.round(h/.22)),nx=cols*4,ny=rows*4;
  const p=(i,j)=>{const u=i/nx,v=j/ny,bulge=.038*Math.sin(u*cols*Math.PI)**2*Math.sin(v*rows*Math.PI)**2;return[x+(u-.5)*w,y+(v-.5)*h,z+.022+bulge];};
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)g.quad(p(i,j),p(i+1,j),p(i+1,j+1),p(i,j+1),fabric);
  if(detail){for(let j=1;j<rows;j++)for(let i=1;i<cols;i++)orb(x+(i/cols-.5)*w,y+(j/rows-.5)*h,z+.026,.007,gold);for(const sign of [-1,1]){rail([x-w/2,y+sign*h/2,z+.03],[x+w/2,y+sign*h/2,z+.03],.007,gold);rail([x+sign*w/2,y-h/2,z+.03],[x+sign*w/2,y+h/2,z+.03],.007,gold);}}
 }
 function seat(cx,cz,width,depth,backHeight,angle=0){
  // Seat is authored in a local frame; dining assemblies rotate through a temporary group.
  g.flush();const prior=out.splice(0);
  for(const u of [-1,1])for(const v of [-1,1])leg(u*(width/2-.07),v*(depth/2-.08),.41,.038);
  box(0,.43,0,width,.10,depth);cushion(0,.52,.025,width-.13,.16,depth-.09);
  paddedBack(0,(backHeight+.64)/2,-depth/2+.06,width-.16,backHeight-.64);
  const crown=[];for(let k=0;k<=8;k++){const u=k/8;crown.push([(u-.5)*(width-.07),backHeight+.04+(type.includes('gothic')?.13:.065)*Math.sin(Math.PI*u),-depth/2+.015]);}curve(crown,.035);carving(0,backHeight+.05,-depth/2+.055,.045);
  for(const side of [-1,1]){leg(side*(width/2-.055),-depth/2+.045,backHeight,.025);if(!type.includes('dining')){lathe(side*(width/2-.02),.44,.24,[[0,0],[.03,0],[.03,.04],[.022,.12],[.035,.20],[.025,.28],[0,.28]],wood);curve([[side*(width/2-.03),.57,.30],[side*(width/2-.02),.72,.25],[side*(width/2-.02),.78,.09],[side*(width/2-.02),.77,-.15],[side*(width/2-.03),.68,-.27]],.035);cushion(side*(width/2-.03),.78,.03,.09,.075,.49);}}
  g.flush();const co=Math.cos(angle),si=Math.sin(angle),transform=p=>[cx+p[0]*co+p[2]*si,p[1],cz-p[0]*si+p[2]*co];for(const part of out){part.c=transform(part.c);part.triangles=part.triangles.map(t=>t.map(transform));}out.unshift(...prior);
 }
 if(['gothic_armchair','armchair','tufted_settee','settee'].includes(type)){
  const sofa=type.includes('settee'),width=sofa?(type==='settee'?1.78:1.84):(type==='armchair'?.80:.88),depth=sofa?.77:type==='armchair'?.77:.84,back=sofa?(type==='settee'?1.05:1.16):type==='armchair'?1.05:1.50;
  seat(0,0,width,depth,back);
  // Distinct split cushions and a carved serpentine apron.
  if(sofa){curve([[-width*.42,.38,.36],[-width*.25,.33,.38],[0,.36,.38],[width*.25,.33,.38],[width*.42,.38,.36]],.025);if(detail)rail([0,.47,.36],[0,.57,.36],.006,gold);}
 }
 if(type==='writing_desk'||type==='console'||type==='side_table'||type==='dining_table'){
  const desk=type==='writing_desk',console=type==='console'||type==='side_table',small=type==='side_table',w=small?.48:console?.83:desk?1.50:2.10,d=small?.48:console?.36:desk?.72:1.01,top=small?.59:console?.85:desk?.74:.72;
  for(const u of [-1,1])for(const v of [-1,1])leg(u*(w/2-.07),v*(d/2-.055),top-.03,console?.028:.045);
  box(0,top-.09,0,w-.10,.16,d-.10);cushion(0,top+.005,0,w,.07,d,wood);
  if(desk)box(0,top+.042,0,w*.69,.006,d*.65,M.leather);
  const drawers=console?2:3;for(let k=0;k<drawers;k++){const x=(k-(drawers-1)/2)*(w-.16)/drawers;panel(x,top-.10,d/2-.037,(w-.23)/drawers,.13);if(detail){rail([x-.045,top-.09,d/2-.007],[x+.045,top-.09,d/2-.007],.009);orb(x-.046,top-.08,d/2-.016,.012);orb(x+.046,top-.08,d/2-.016,.012);}}
  if(detail){for(const side of [-1,1])rail([-w/2+.06,top+.04,side*(d/2-.035)],[w/2-.06,top+.04,side*(d/2-.035)],.006);carving(0,top-.11,d/2-.02,.045);}
 }
 if(['bookcase','wardrobe','curio_cabinet'].includes(type)){
  const book=type==='bookcase',curio=type==='curio_cabinet',w=curio?.94:book?1.50:1.47,d=curio?.46:book?.44:.64,h=curio?1.88:book?2.33:2.16;
  for(const side of [-1,1]){box(side*(w/2-.045),h/2,0,.09,h-.16,d-.06);leg(side*(w/2-.08),d/2-.08,.18,.036);leg(side*(w/2-.08),-d/2+.08,.18,.036);}
  box(0,h/2,-d/2+.025,w-.13,h-.17,.05);box(0,.13,0,w,.12,d);box(0,h-.055,0,w,.10,d);box(0,h-.13,0,w-.04,.04,d-.01,gold);
  if(book||curio){for(let j=0;j<(book?5:4);j++){const sy=.27+j*(h-.48)/(book?5:4);box(0,sy,0,w-.12,.035,d-.08);if(detail)box(0,sy+.02,d/2-.047,w-.15,.009,.008,gold);
    for(let k=0;k<(book?8:3);k++){const x=(k-(book?7:2)/2)*(book?(w-.29)/8:.24);if(book){const bh=.17+((j+k+style.pattern)%4)*.025;box(x,sy+.025+bh/2,0,.085,bh,d*.60,[M.leather,M.linen,M.upholstery][(k+j)%3]);if(detail)box(x,sy+bh*.70,d*.31,.06,.012,.006,gold);}else{lathe(x,sy+.025,0,[[0,0],[.045,0],[.045,.03],[.025,.07],[.052,.12],[.04,.20],[0,.22]],j%2?M.ivory:M.silver);}}
   }
   if(curio){box(0,1.04,d/2-.03,w-.14,1.50,.012,M.glass);box(0,1.02,d/2-.016,.025,1.50,.018);}
  }else{for(const side of [-1,1]){panel(side*w*.235,1.13,d/2-.028,w*.43,1.73);orb(side*.035,1.12,d/2-.004,.014);}}
  for(const side of [-1,1]){rail([side*(w/2-.09),.23,d/2-.01],[side*(w/2-.09),h-.21,d/2-.01],.012);carving(side*(w/2-.09),h-.25,d/2-.016,.04);}
  carving(0,h-.055,d/2-.02,.043);
 }
 if(type==='bed'||type==='gothic_headboard'){
  if(type==='bed'){
   for(const side of [-1,1])for(const end of [-1,1]){lathe(side*.77,0,end*.98,[[0,0],[.035,0],[.04,.10],[.028,.30],[.037,.70],[.027,1.1],[.035,1.45],[.028,2.18],[.045,2.23],[0,2.30]],wood);orb(side*.77,2.30,end*.98,.035);}
   box(0,.31,0,1.60,.18,2.03);cushion(0,.49,0,1.48,.20,1.93,M.linen);cushion(0,.605,.30,1.47,.055,1.25,fabric);
   for(const side of [-1,1])cushion(side*.37,.65,-.65,.65,.16,.39,M.linen);
   for(const side of [-1,1]){box(side*.77,2.21,0,.055,.07,1.96);box(0,2.21,side*.98,1.57,.07,.055);}
   if(detail)for(let k=-3;k<=3;k++)box(k*.19,.635,.87,.009,.008,.025,gold);
  }
  const z=type==='bed'?-.96:0;panel(0,.98,z,1.48,1.20);paddedBack(0,1.03,z+.035,1.30,.71);
  const crest=[];for(let k=0;k<=10;k++){const x=(k/10-.5)*1.55;crest.push([x,1.56+.18*Math.cos(x/.775*Math.PI/2),z+.03]);}curve(crest,.035);carving(0,1.66,z+.06,.067);
  if(type==='gothic_headboard')for(const side of [-1,1])leg(side*.78,0,1.63,.033);
 }
 if(type==='grandfather_clock'){
  box(0,.09,0,.64,.18,.46);box(0,.97,-.035,.44,1.68,.31);box(0,1.79,0,.60,.54,.40);box(0,2.08,0,.66,.11,.44);
  for(const side of [-1,1])leg(side*.27,.14,1.56,.026);
  box(0,1.04,.13,.30,1.12,.012,M.glass);rail([0,1.46,.16],[0,.68,.16],.011);orb(0,.69,.17,.075);
  box(0,1.80,.213,.40,.40,.012,M.ivory);
  for(let k=0;k<12;k++){const a=k*Math.PI/6;orb(Math.sin(a)*.16,1.80+Math.cos(a)*.16,.226,.009,wood);}
  rail([0,1.80,.23],[.10,1.84,.23],.008,wood);rail([0,1.80,.235],[0,1.93,.235],.006,wood);carving(0,2.075,.23,.045);
 }
 if(['banquet_ensemble','supper_table'].includes(type)){
  const banquet=type==='banquet_ensemble',w=banquet?1.40:.98,d=banquet?2.57:.85;
  box(0,.76,0,w,.09,d);box(0,.812,0,.28,.012,d-.07,M.linen);
  for(const sign of [-1,1])lathe(0,0,sign*d*.30,[[0,0],[.22,0],[.23,.06],[.08,.16],[.08,.53],[.16,.69],[0,.69]],wood);
  // Dining chairs face the table; all seat pull-out space remains inside the ensemble collider.
  for(const side of [-1,1])for(const t of banquet?[-.91,0,.91]:[0]){
   // A compact chair uses the shared upholstered back/turned leg vocabulary.
   const x=side*(banquet?1.08:.78),cz=t;for(const u of [-1,1])for(const v of [-1,1])leg(x+u*.17,cz+v*.17,.44,.024);
   box(x,.46,cz,.43,.07,.42);cushion(x,.52,cz,.39,.065,.38);
   const plane=(at,y,depth)=>[x+side*(.30-depth),y,cz+at];g.panel(plane,0,1.02,.39,.57,wood,.12);g.panel(plane,0,1.04,.31,.41,fabric,.21);
   for(const u of [-1,1])rail([x+side*.18,.49,cz+u*.19],[x+side*.18,1.34,cz+u*.19],.022,wood);
   lathe(side*w*.30,.805,t,[[0,0],[.12,0],[.12,.012],[.09,.025],[0,.025]],M.ivory,10);
  }
 }
 if(['marble_fireplace','mahogany_fireplace'].includes(type)){
  // Keep Pass 2 mantel and material identity, then add an inset folding fire screen.
  const parts=fireplaceSurroundParts({type,finishTreatment,positionMeters:[0,0,0]});
  // Convert existing solid parts into this material batch without changing their form.
  for(const p of parts)if(p.triangles)for(const t of p.triangles)g.triangle(...t,p.mat);else g.box(p.c,p.s,p.mat);
  for(let k=-3;k<=3;k++)rail([k*.12,.08,.215],[k*.12,.52-Math.abs(k)*.035,.215],.008,M.metal);
  curve([[-.39,.12,.215],[-.36,.42,.215],[0,.55,.215],[.36,.42,.215],[.39,.12,.215]],.011,M.metal);
 }
 g.flush();for(const part of out)if([fabric,M.linen].includes(part.mat))part.smooth=true;const triangles=out.reduce((n,p)=>n+p.triangles.length,0);
 if(triangles>HEIRLOOM_ASSET_LIMITS.triangles||out.length>HEIRLOOM_ASSET_LIMITS.materials)throw Error('Heirloom template budget exceeded: '+type+' '+triangles);
 return out;
}

/** Observable costs include built-in batches as well as shared catalog models. */
export function heirloomInventory(plan){
 const assets=new Map();
 for(const item of plan.furniture||[]){if(!HEIRLOOM_TYPES.includes(item.type))continue;const key=item.type+':'+heirloomStyleKey(item.furnitureStyle||heirloomStyle())+':'+(item.finishTreatment||'marble');
  let asset=assets.get(key);if(!asset){const parts=heirloomFurnitureParts({...item,positionMeters:[0,0,0],rotationY:0});asset={key,type:item.type,style:item.furnitureStyle,model:item.model,builtIn:item.builtIn,instances:0,triangles:parts.reduce((n,p)=>n+p.triangles.length,0),materialGroups:parts.length};assets.set(key,asset);}asset.instances++;
 }
 return {version:1,limits:HEIRLOOM_ASSET_LIMITS,assets:[...assets.values()],templateReuse:true,existingPlacementAndCollision:true,omissions:[...assets.values()].filter(a=>a.style?.ornament==='essential').map(a=>({key:a.key,reason:'DETAIL_POLICY',details:['buttons','gilded-piping','carved-rosettes']}))};
}

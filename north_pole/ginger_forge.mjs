import {glb,MAT,PALETTE} from '../casa_admin/forge_glb.mjs';
import {exposedRuns,openingShape,buildRoofs} from '../casa_admin/forge_architecture.mjs';
import {floorElevationsFeet} from '../casa_admin/forge_readiness_audit.mjs';
import {sha256} from '../casa_game/archive.mjs';
import {exteriorDetails} from '../casa_admin/forge_exterior_details.mjs';

export const GINGER_VERSION=1;
export const STYLES={peppermint:{name:'Peppermint Palace',cookie:[.43,.19,.075,1],candy:[MAT.rubyGlass,MAT.fernLeaf,MAT.warmEmitter,MAT.plumDamask]},winter:{name:'Royal Icing',cookie:[.37,.19,.09,1],candy:[MAT.gilt,MAT.fernLeaf,MAT.rubyGlass]},sugarplum:{name:'Sugarplum Jubilee',cookie:[.27,.105,.065,1],candy:[MAT.plumDamask,MAT.coolEmitter,MAT.rubyGlass,MAT.gilt]}};
const K=.3048,lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function validate(source){
 if(!source||!Array.isArray(source.floors)||!source.floors.length||source.floors.length>16)throw Error('Choose a haunt with 1–16 floors.');
 const ids=new Set();let count=0;
 for(const f of source.floors){if(!Array.isArray(f.rooms))throw Error('Floor is missing rooms.');for(const r of f.rooms){if(++count>160||!r.id||ids.has(r.id))throw Error('House needs unique room IDs and at most 160 rooms.');ids.add(r.id);if(!['x','y','l','w','h'].every(k=>Number.isFinite(+r[k])&&Math.abs(+r[k])<=1000)||['l','w','h'].some(k=>+r[k]<=0))throw Error('Invalid dimensions in '+r.id);for(const o of r.openings||[]){if(!['top','bottom','left','right'].includes(o.wall)||!Number.isFinite(+(o.pos??.5))||+(o.pos??.5)<0||+(o.pos??.5)>1)throw Error('Invalid opening in '+r.id);}}}
 if(!count)throw Error('House contains no rooms.');
}
/** Exterior geometry only. Blueprint dimensions are feet; handoff is meters. */
export function planGinger(source,{style='peppermint',density=1}={}){
 validate(source);if(!STYLES[style])throw Error('Unknown confectionery style.');if(![.6,1,1.4].includes(density))throw Error('Unknown decoration density.');
 const parts=[],anchors=[],levels=floorElevationsFeet(source.floors),seen=new Set();let decorations=0;
 const add=(c,s,mat)=>{if(parts.length>=24000)throw Error('This house exceeds the exterior detail budget; choose a lower density.');if(c.every(Number.isFinite)&&s.every(n=>Number.isFinite(n)&&n>.0001))parts.push({c,s,mat});};
 const pipe=(a,b,r,mat=MAT.trim)=>{const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d);if(len<.001)return;let u=Math.abs(d[1]/len)<.9?[0,1,0]:[1,0,0];const n=d.map(v=>v/len),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];u=cross(n,u);u=u.map(v=>v/Math.hypot(...u));const v=cross(n,u),rings=[a,b].map(p=>Array.from({length:6},(_,j)=>p.map((x,i)=>x+r*(u[i]*Math.cos(j*Math.PI/3)+v[i]*Math.sin(j*Math.PI/3))))),triangles=[];for(let i=0;i<6;i++){const j=(i+1)%6;triangles.push([rings[0][i],rings[1][i],rings[1][j]],[rings[0][i],rings[1][j],rings[0][j]],[a,rings[0][j],rings[0][i]],[b,rings[1][i],rings[1][j]]);}if(parts.length>=24000)throw Error('Exterior detail budget exceeded.');parts.push({c:[0,0,0],s:[1,1,1],mat,triangles,smooth:true});};
 const sweet=(p,r,mat)=>{const triangles=[],rows=4,cols=7,pt=(i,j)=>[p[0]+r*Math.sin(i*Math.PI/rows)*Math.cos(j*2*Math.PI/cols),p[1]+r*Math.cos(i*Math.PI/rows),p[2]+r*Math.sin(i*Math.PI/rows)*Math.sin(j*2*Math.PI/cols)];for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){if(i)triangles.push([pt(i,j),pt(i+1,j),pt(i,j+1)]);if(i<rows-1)triangles.push([pt(i,j+1),pt(i+1,j),pt(i+1,j+1)]);}parts.push({c:[0,0,0],s:[1,1,1],mat,triangles,smooth:true});decorations++;};
 const anchor=(id,kind,points,normal,extra={})=>{if(seen.has(id))throw Error('Duplicate attachment ID');seen.add(id);anchors.push({id,kind,pointsMeters:points.map(p=>p.map(v=>v*K)),normal,...extra});};
 const candy=STYLES[style].candy;
 for(const [fi,f]of source.floors.entries())for(const r of f.rooms){const base=levels[fi],h=+r.h;
  for(const side of ['top','bottom','left','right']){const vertical=['left','right'].includes(side),span=+(vertical?r.w:r.l),wall=+(vertical?r.x:r.y)+(['right','bottom'].includes(side)?+(vertical?r.l:r.w):0),out=['top','left'].includes(side)?-1:1;
   const pos=(a,y,offset=.04)=>vertical?[wall+out*offset,base+y,+r.y+a]:[+r.x+a,base+y,wall+out*offset],normal=vertical?[out,0,0]:[0,0,out];
   const block=(a,y,w,height,depth,mat,off=0)=>add(pos(a,y,off),vertical?[depth,height,w]:[w,height,depth],mat);
   const holes=(r.openings||[]).filter(o=>o.wall===side).map((o,i)=>({...openingShape(o,span,h),type:o.type,id:o.id||'opening-'+i}));
   for(const [ri,[lo,hi]]of exposedRuns(r,side,f.rooms).entries()){
    const cuts=[...new Set([lo,hi,...holes.flatMap(o=>[Math.max(lo,Math.min(hi,o.center-o.width/2)),Math.max(lo,Math.min(hi,o.center+o.width/2))])])].sort((a,b)=>a-b);
    for(let i=1;i<cuts.length;i++){const a=cuts[i-1],b=cuts[i],mid=(a+b)/2,active=holes.filter(o=>Math.abs(mid-o.center)<o.width/2),ys=[...new Set([0,h,...active.flatMap(o=>[o.low,o.high])])].sort((a,b)=>a-b);for(let j=1;j<ys.length;j++)if(!active.some(o=>(ys[j]+ys[j-1])/2>o.low&&(ys[j]+ys[j-1])/2<o.high))block(mid,(ys[j]+ys[j-1])/2,b-a,ys[j]-ys[j-1],.24,MAT.siding);}
    pipe(pos(lo,h),pos(hi,h),.18);pipe(pos(lo,.15),pos(hi,.15),.14);
    anchor('f'+fi+':'+r.id+':'+side+':eave:'+ri,'roofline',[pos(lo,h,.20),pos(hi,h,.20)],normal);
    const n=Math.min(50,Math.ceil((hi-lo)*density*1.3));for(let j=0;j<=n;j++){const a=lo+(hi-lo)*j/Math.max(1,n),drop=.25+.50*(.5+.5*Math.sin(j*2.399+fi));pipe(pos(a,h-.03,.14),pos(a,h-drop,.14),.075);if(j%2===0)sweet(pos(a,h+.25,.12),.23,candy[(j+fi)%candy.length]);}
    for(const a of [lo+.1,hi-.1]){pipe(pos(a,.2),pos(a,h),.09);for(let j=0;j<Math.min(18,h*1.5);j++)sweet(pos(a,.5+j*.65,.14),.095,j%2?MAT.rubyGlass:MAT.trim);}
    // Victorian icing swags are dimensional and stay against the wall.
    const swags=Math.max(1,Math.round((hi-lo)/3));for(let j=0;j<swags;j++){const start=lo+(hi-lo)*j/swags,end=lo+(hi-lo)*(j+1)/swags;for(let k=0;k<7;k++)pipe(pos(start+(end-start)*k/7,h-.7-.28*Math.sin(k/7*Math.PI),.19),pos(start+(end-start)*(k+1)/7,h-.7-.28*Math.sin((k+1)/7*Math.PI),.19),.04);}
   }
   for(const o of holes){if(!['window','door'].includes(o.type)||!exposedRuns(r,side,f.rooms).some(([a,b])=>o.center-o.width/2>=a-.01&&o.center+o.width/2<=b+.01))continue;
    const a=o.center-o.width/2,b=o.center+o.width/2,low=o.low,high=o.high,outline=[pos(a,low,.25),pos(a,high,.25),pos(b,high,.25),pos(b,low,.25),pos(a,low,.25)];
    anchor('f'+fi+':'+r.id+':'+side+':'+o.id,o.type==='window'?'window':'door',outline,normal);
    for(let j=1;j<outline.length;j++)pipe(outline[j-1],outline[j],.14);
    block(o.center,(low+high)/2,o.width,high-low,.04,o.type==='window'?MAT.glass:MAT.wood);
    if(o.type==='window'){block(o.center,(low+high)/2,.065,high-low,.08,MAT.trim,.09);block(o.center,(low+high)/2,o.width,.065,.08,MAT.trim,.09);}
    // Wreaths frame glass; openings and attachment outlines remain usable.
    const cy=o.type==='door'?high*.70:(low+high)*.5,rr=Math.min(o.width*.25,.85);for(let j=0;j<14;j++){const t=j/14*Math.PI*2;sweet(pos(o.center+Math.cos(t)*rr,cy+Math.sin(t)*rr,.34),rr*.28,MAT.fernLeaf);if(j%3===0)sweet(pos(o.center+Math.cos(t)*rr,cy+Math.sin(t)*rr,.46),rr*.12,MAT.rubyGlass);}for(const sign of [-1,1])block(o.center+sign*.15,cy+rr+.03,.25,.17,.12,MAT.rubyGlass,.42);
    // Piped fanlight and scroll flourishes sit above the rectangular clear opening.
    if(high+.9<h){for(let j=0;j<12;j++){const t=j/12*Math.PI,u=(j+1)/12*Math.PI;pipe(pos(o.center+Math.cos(t)*(o.width/2+.2),high+Math.sin(t)*.8,.24),pos(o.center+Math.cos(u)*(o.width/2+.2),high+Math.sin(u)*.8,.24),.06);}for(const sign of [-1,1])for(let j=0;j<16;j++){const t=j/16*Math.PI*3,u=(j+1)/16*Math.PI*3;pipe(pos(o.center+sign*(o.width/2+.45+Math.cos(t)*.22),high-.5+Math.sin(t)*.3,.24),pos(o.center+sign*(o.width/2+.45+Math.cos(u)*.22),high-.5+Math.sin(u)*.3,.24),.04);}}
   }
  }
 }
 const roofs=buildRoofs(source.floors,levels,source.roof);parts.push(...roofs);
 const porch=exteriorDetails(source,levels);parts.push(...porch.parts);
 for(const post of porch.parts.filter(p=>p.mat===MAT.trim&&p.s[1]>4)){for(let j=0;j<16;j++){const y=post.c[1]-post.s[1]/2+j*post.s[1]/16;pipe([post.c[0]-.14,y,post.c[2]-.14],[post.c[0]+.14,y+.22,post.c[2]-.14],.08,MAT.rubyGlass);}}
 // A peppermint rosette on each visible gable gives every wing its own signature.
 for(const [fi,f]of source.floors.entries())for(const r of f.rooms){if(source.floors.slice(fi+1).some(f=>f.rooms.some(q=>+q.x<+r.x+ +r.l&&+q.x+ +q.l>+r.x&&+q.y<+r.y+ +r.w&&+q.y+ +q.w>+r.y)))continue;if(['hip','hipped','tower','mansard','flat','none'].includes(r.roofType||f.roofType||source.roof?.type))continue;const rise=Math.max(.5,Math.min(14,Number(r.roofRise??f.roofRise??source.roof?.rise??Math.min((+r.l+.7)*.65,8)))),radius=Math.min(1.1,+r.l*.10),y=levels[fi]+ +r.h+.2+rise*.45;for(const side of [-1,1]){const z=+r.y+(side>0?+r.w+.38:-.38),center=[+r.x+ +r.l/2,y,z];for(let j=0;j<16;j++){const a=j/16*Math.PI*2,b=(j+1)/16*Math.PI*2;parts.push({c:[0,0,0],s:[1,1,1],mat:j%2?MAT.trim:MAT.rubyGlass,triangles:[[center,[center[0]+Math.cos(a)*radius,y+Math.sin(a)*radius,z],[center[0]+Math.cos(b)*radius,y+Math.sin(b)*radius,z]]]});pipe([center[0]+Math.cos(a)*radius,y+Math.sin(a)*radius,z],[center[0]+Math.cos(b)*radius,y+Math.sin(b)*radius,z],.065);}}}
 // Follow actual boundary edges of the union roof; skip coplanar triangulation diagonals.
 const edges=new Map();for(const p of roofs.filter(p=>p.mat===MAT.roof&&p.triangles))for(const tri of p.triangles){const a=tri[0],b=tri[1],c=tri[2],u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n);if(!len)continue;for(let j=0;j<3;j++){const a=tri[j],b=tri[(j+1)%3],key=[a,b].map(p=>p.map(n=>n.toFixed(4)).join(',')).sort().join('|');if(!edges.has(key))edges.set(key,{a,b,normals:[]});edges.get(key).normals.push(n.map(x=>x/len));}}
 let edge=0;for(const e of edges.values()){if(e.normals.length>1&&e.normals.every(n=>Math.abs(n.reduce((s,v,i)=>s+v*e.normals[0][i],0))>.999))continue;const a=e.a.map((v,i)=>v+(i===1?.09:0)),b=e.b.map((v,i)=>v+(i===1?.09:0));pipe(a,b,.12);anchor('roof-edge:'+edge++,'roof-edge',[a,b],[0,1,0]);const n=Math.min(32,Math.floor(Math.hypot(...b.map((v,i)=>v-a[i]))*density/.9));for(let j=1;j<n;j++)sweet(lerp(a,b,j/n),.16,candy[j%candy.length]);}
 const rooms=source.floors.flatMap(f=>f.rooms),minX=Math.min(...rooms.map(r=>+r.x)),maxX=Math.max(...rooms.map(r=>+r.x+ +r.l)),minZ=Math.min(...rooms.map(r=>+r.y)),maxZ=Math.max(...rooms.map(r=>+r.y+ +r.w));
 add([(minX+maxX)/2,-.33,(minZ+maxZ)/2],[maxX-minX+10,.35,maxZ-minZ+10],MAT.trim);
 // Confectionery gateposts and snowy topiary frame a clear central approach.
 const entryRoom=rooms.find(r=>r.id===source.gameEntry?.roomId)||rooms[0],entryOp=(entryRoom.openings||[]).find(o=>o.id===source.gameEntry?.openingId)||{wall:'top',pos:.5},side=entryOp.wall,vertical=['left','right'].includes(side),out=['top','left'].includes(side)?-1:1,along=+(vertical?entryRoom.y:entryRoom.x)+ +(vertical?entryRoom.w:entryRoom.l)*(entryOp.pos??.5),wall=+(vertical?entryRoom.x:entryRoom.y)+(['bottom','right'].includes(side)?+(vertical?entryRoom.l:entryRoom.w):0),yard=(a,y,d)=>vertical?[wall+out*d,y,along+a]:[along+a,y,wall+out*d];
 for(const sign of [-1,1]){const p=yard(sign*4,0,3.2);pipe(p,[p[0],3.2,p[2]],.23);for(let j=0;j<10;j++)sweet([p[0],.2+j*.32,p[2]],.26,j%2?MAT.rubyGlass:MAT.trim);sweet([p[0],3.5,p[2]],.45,MAT.rubyGlass);for(let tier=0;tier<4;tier++){const center=yard(sign*6,.55+tier*.65,1.5),radius=1.1-tier*.21;for(let j=0;j<10;j++){const a=j/10*Math.PI*2;sweet([center[0]+Math.cos(a)*radius,center[1],center[2]+Math.sin(a)*radius],radius*.4,MAT.fernLeaf);}sweet([center[0],center[1]+.25,center[2]],radius*.45,MAT.trim);}}
 const yardBounds={minX:(minX-5)*K,maxX:(maxX+5)*K,minZ:(minZ-5)*K,maxZ:(maxZ+5)*K};
 const paletteOverrides=Object.fromEntries(PALETTE.map((m,i)=>[i,{...m,textureMaterial:-1}]));
 paletteOverrides[MAT.wood]={n:'dark chocolate joinery',c:[.14,.045,.018,1],rough:.7,textureMaterial:-1};
 paletteOverrides[MAT.stone]={n:'biscuit masonry',c:[.52,.29,.13,1],rough:.95,textureMaterial:-1};
 Object.assign(paletteOverrides,{[MAT.siding]:{n:'baked gingerbread',c:STYLES[style].cookie,rough:.96,textureMaterial:-1},[MAT.roof]:{n:'cocoa biscuit roof',c:[.22,.085,.035,1],rough:.93,textureMaterial:-1},[MAT.trim]:{n:'piped royal icing',c:[1,.95,.83,1],rough:.65,textureMaterial:-1},[MAT.glass]:{n:'amber sugar glass',c:[1,.60,.16,.72],rough:.18,emit:[.8,.28,.035],textureMaterial:-1},[MAT.rubyGlass]:{n:'cherry candy',c:[.8,.025,.055,1],rough:.24,textureMaterial:-1},[MAT.fernLeaf]:{n:'emerald sugar holly',c:[.025,.25,.08,1],rough:.42,textureMaterial:-1},[MAT.plumDamask]:{n:'sugarplum candy',c:[.57,.12,.5,1],rough:.25,textureMaterial:-1}});
 const scalePart=p=>({...p,c:p.c.map(v=>v*K),s:p.s.map(v=>v*K),...(p.vertices?{vertices:p.vertices.map(p=>p.map(v=>v*K))}:{}),...(p.triangles?{triangles:p.triangles.map(t=>t.map(p=>p.map(v=>v*K)))}:{})});
 return {parts:parts.map(scalePart),paletteOverrides,anchors,yardBounds,report:{rooms:rooms.length,attachmentPoints:anchors.length,decorativeSweets:decorations,parts:parts.length,interiorIncluded:false,style:STYLES[style].name}};
}
const b64=bytes=>{let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(s);};
export async function compileGinger(source,{houseId,style='peppermint',density=1}={}){
 const original=JSON.stringify(source,null,2)+'\n',sourceHash=await sha256(new TextEncoder().encode(original)),plan=planGinger(source,{style,density}),model=glb(plan.parts,{paletteOverrides:plan.paletteOverrides});
 if(model.length>32*1024*1024)throw Error('Exterior exceeds 32 MiB. Reduce detail density.');
 const exteriorHash=await sha256(model),pkg={format:'gingerlight-exterior',version:GINGER_VERSION,houseId:houseId||'house-'+sourceHash.slice(0,14),name:String(source.name||'Gingerbread Estate').slice(0,110),sourceHash,exteriorHash,units:'meters',style,density,model:{encoding:'base64',mimeType:'model/gltf-binary',data:b64(model)},anchors:plan.anchors,yardBounds:plan.yardBounds,report:plan.report};
 pkg.packageHash=await sha256(new TextEncoder().encode(JSON.stringify(pkg)));
 return pkg;
}
export async function openGinger(input){
 const p=typeof input==='string'?JSON.parse(input):input;if(p?.format!=='gingerlight-exterior'||p.version!==GINGER_VERSION||p.units!=='meters'||!p.houseId||!p.model||p.model.encoding!=='base64'||typeof p.model.data!=='string'||p.model.data.length>45*1024*1024||!Array.isArray(p.anchors)||p.anchors.length>20000)throw Error('Unsupported ginger exterior package.');
 const {packageHash,...body}=p;if(typeof packageHash!=='string'||await sha256(new TextEncoder().encode(JSON.stringify(body)))!==packageHash)throw Error('Package changed or is incomplete. Export it again.');
 for(const a of p.anchors)if(!a.id||!Array.isArray(a.pointsMeters)||a.pointsMeters.some(pt=>!Array.isArray(pt)||pt.length!==3||!pt.every(Number.isFinite)))throw Error('Invalid light attachment coordinates.');
 const bytes=Uint8Array.from(atob(p.model.data),c=>c.charCodeAt(0));if(await sha256(bytes)!==p.exteriorHash)throw Error('Exterior checksum mismatch.');
 const view=new DataView(bytes.buffer);if(bytes.length<20||view.getUint32(0,true)!==0x46546c67||view.getUint32(8,true)!==bytes.length)throw Error('Invalid exterior GLB.');
 const doc=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+view.getUint32(12,true))));if([...(doc.images||[]),...(doc.buffers||[])].some(r=>r.uri))throw Error('Exterior must contain all its assets.');
 return {package:p,bytes};
}

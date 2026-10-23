import {TEXTURES} from './forge_textures.mjs';
const enc=new TextEncoder();
export const MAT={floor:0,wall:1,ceiling:2,trim:3,roof:4,wood:5,upholstery:6,stone:7,metal:8,glass:9,siding:10,library:11,laboratory:12,bedroom:13,parquet:14,crypt:15,conservatory:16,ivory:17,silver:18,ebony:19,linen:20,plaster:21,leadedGlass:22,rubyGlass:23,amberGlass:24,leather:25,checker:26,navyDamask:27,plumDamask:28,sageDamask:29};
export const PALETTE=[
{n:'aged oak floor',c:[1,1,1,1],rough:.82},{n:'weathered Victorian plaster',c:[.72,.50,.31,1],rough:.92},
{n:'soot-dark ceiling',c:[1,1,1,1],rough:.95},{n:'painted ogee trim',c:[.65,.58,.49,1],rough:.75},
{n:'aged slate roof',c:[1,1,1,1],rough:.91},{n:'dark mahogany',c:[1,1,1,1],rough:.66},
{n:'burgundy velvet',c:[.30,.08,.15,1],rough:.99,textureMaterial:1},{n:'limestone foundation',c:[.34,.35,.37,1],rough:.95},
{n:'oxidized brass',c:[.43,.32,.13,1],rough:.43,metal:.67},{n:'smoky window glass',c:[.15,.24,.28,.38],rough:.17,metal:.06},{n:'painted Victorian clapboard',c:[1,1,1,1],rough:.88},
{n:'library emerald damask',c:[.20,.52,.34,1],rough:.86,textureMaterial:1},
{n:'laboratory glazed ivory tile',c:[1,1,1,1],rough:.38},
{n:'bedroom claret damask',c:[.60,.24,.38,1],rough:.9,textureMaterial:1},
{n:'ballroom parquet',c:[1,1,1,1],rough:.48},
{n:'crypt cut limestone',c:[1,1,1,1],rough:.98},
{n:'conservatory encaustic tile',c:[1,1,1,1],rough:.48},
{n:'aged ivory porcelain',c:[.83,.79,.68,1],rough:.52},
{n:'tarnished silver',c:[.63,.67,.71,1],rough:.24,metal:.85},
{n:'polished ebony',c:[.025,.022,.027,1],rough:.30},
{n:'heirloom linen',c:[.73,.65,.56,1],rough:.97},
{n:'ivory plaster relief',c:[.81,.76,.64,1],rough:.82},
{n:'pearl leaded glass',c:[.58,.67,.68,.56],rough:.26},
{n:'ruby leaded glass',c:[.51,.07,.13,.72],rough:.28},
{n:'amber leaded glass',c:[.72,.47,.13,.62],rough:.25},
{n:'tufted black leather',c:[.035,.025,.040,1],rough:.42},
{n:'aged marble checker',c:[1,1,1,1],rough:.42},
{n:'midnight blue damask',c:[.28,.40,.59,1],rough:.85,textureMaterial:1},
{n:'mulberry damask',c:[.53,.25,.43,1],rough:.86,textureMaterial:1},
{n:'sage damask',c:[.40,.55,.39,1],rough:.86,textureMaterial:1}];
export function glb(boxes,{exterior=null}={}){const palette=PALETTE.map(m=>({...m}));if(exterior){palette[MAT.siding]={n:exterior.label,c:exterior.color,textureMaterial:exterior.textureMaterial,rough:.93};palette[MAT.trim].c=exterior.trimColor;palette[MAT.roof].c=exterior.roofColor;}const positions=[],normals=[],uvs=[],vertexMap=new Map(),ranges=palette.map(()=>[]);const faces=[[0,1,2,3,[0,0,-1]],[5,4,7,6,[0,0,1]],[4,0,3,7,[-1,0,0]],[1,5,6,2,[1,0,0]],[3,2,6,7,[0,1,0]],[4,5,1,0,[0,-1,0]]];
for(const b of boxes){
 const [x,y,z]=b.c,[a,d,e]=b.s.map(v=>v/2),verts=b.vertices||[[-a,-d,-e],[a,-d,-e],[a,d,-e],[-a,d,-e],[-a,-d,e],[a,-d,e],[a,d,e],[-a,d,e]];
 const axis=b.rotAxis||'z',ang=Number(b.rot)||0,co=Math.cos(ang),si=Math.sin(ang);
 const rotate=q=>{const [vx,vy,vz]=q;if(axis==='z')return[vx*co-vy*si,vx*si+vy*co,vz];if(axis==='x')return[vx,vy*co-vz*si,vy*si+vz*co];return[vx*co+vz*si,vy,-vx*si+vz*co]};
 const v=verts.map(q=>{const t=rotate(q);return[t[0]+x,t[1]+y,t[2]+z]});
 const triangles=b.triangles||faces.flatMap(([i,j,k,l])=>[[v[i],v[k],v[j]],[v[i],v[l],v[k]]]);
 const smooth=new Map(),pointKey=p=>p.map(v=>v.toFixed(6)).join(',');
 if(b.smooth)for(const [p,q,r]of triangles){const u=q.map((v,i)=>v-p[i]),v=r.map((n,i)=>n-p[i]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];for(const point of [p,q,r]){const key=pointKey(point),sum=smooth.get(key)||[0,0,0];for(let k=0;k<3;k++)sum[k]+=normal[k];smooth.set(key,sum);}}
 if(b.smooth)for(const [key,n]of smooth){const size=Math.hypot(...n);if(size>1e-12)smooth.set(key,n.map(v=>v/size));else smooth.delete(key);}
 for(const points of triangles){
  const [p,q,r]=points,u=q.map((t,i)=>t-p[i]),w=r.map((t,i)=>t-p[i]),cross=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],length=Math.hypot(...cross);
  if(length<1e-10)continue;const nn=cross.map(t=>t/length),first=positions.length/3;
  for(const q of points){const normal=b.smooth?(smooth.get(pointKey(q))||nn):nn;const scale=b.mat===0?1.5:1,uv=[(Math.abs(nn[0])>.7?q[2]:q[0])*scale,(Math.abs(nn[1])>.7?q[2]:q[1])*scale],key=[...q,...normal,...uv].map(v=>v.toFixed(6)).join(',' );let id=vertexMap.get(key);if(id===undefined){id=positions.length/3;vertexMap.set(key,id);positions.push(...q);normals.push(...normal);uvs.push(...uv);}ranges[b.mat??0].push(id);}

 }
}
const pad4=n=>(n+3)&~3,p=new Float32Array(positions),n=new Float32Array(normals),idx=new Uint32Array(ranges.flat()),pb=new Uint8Array(p.buffer),nb=new Uint8Array(n.buffer),ib=new Uint8Array(idx.buffer),on=pad4(pb.length),oi=pad4(on+nb.length),uv=new Float32Array(uvs),ou=pad4(oi+ib.length),usedTextures=TEXTURES.filter(t=>palette.some((m,i)=>ranges[i].length&&(m.textureMaterial??i)===t.material)),images=usedTextures.map(t=>Uint8Array.from(atob(t.png),c=>c.charCodeAt(0))),imageOffsets=[],imageEnd=images.reduce((end,img)=>{imageOffsets.push(end);return pad4(end+img.length)},pad4(ou+uv.byteLength)),bin=new Uint8Array(imageEnd);bin.set(pb);bin.set(nb,on);bin.set(ib,oi);bin.set(new Uint8Array(uv.buffer),ou);images.forEach((img,i)=>bin.set(img,imageOffsets[i]));const views=[{buffer:0,byteOffset:0,byteLength:pb.length,target:34962},{buffer:0,byteOffset:on,byteLength:nb.length,target:34962},{buffer:0,byteOffset:oi,byteLength:ib.length,target:34963},{buffer:0,byteOffset:ou,byteLength:uv.byteLength,target:34962},...images.map((img,i)=>({buffer:0,byteOffset:imageOffsets[i],byteLength:img.length}))];const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(let j=0;j<positions.length;j+=3)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],positions[j+k]);hi[k]=Math.max(hi[k],positions[j+k])}const access=[{bufferView:0,componentType:5126,count:p.length/3,type:'VEC3',min:p.length?lo:[0,0,0],max:p.length?hi:[0,0,0]},{bufferView:1,componentType:5126,count:n.length/3,type:'VEC3'},{bufferView:3,componentType:5126,count:uv.length/2,type:'VEC2'}];let cursor=0;const prim=[];for(let k=0;k<ranges.length;k++){const c=ranges[k].length;if(!c)continue;access.push({bufferView:2,byteOffset:cursor*4,componentType:5125,count:c,type:'SCALAR'});prim.push({attributes:{POSITION:0,NORMAL:1,TEXCOORD_0:2},indices:access.length-1,material:k});cursor+=c}const doc={asset:{version:'2.0',generator:'Black Hollow Forge 4.3 textured architecture'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:prim}],images:usedTextures.map((t,i)=>({name:t.name,bufferView:4+i,mimeType:'image/png'})),samplers:[{wrapS:10497,wrapT:10497,magFilter:9729,minFilter:9987}],textures:usedTextures.map((t,i)=>({source:i,sampler:0})),materials:palette.map((m,i)=>({name:m.n,pbrMetallicRoughness:{baseColorFactor:m.c,...(usedTextures.some(t=>t.material===(m.textureMaterial??i))?{baseColorTexture:{index:usedTextures.findIndex(t=>t.material===(m.textureMaterial??i))}}:{}),metallicFactor:m.metal||0,roughnessFactor:m.rough},doubleSided:true,alphaMode:m.c[3]<1?'BLEND':'OPAQUE'})),buffers:[{byteLength:bin.length}],bufferViews:views,accessors:access};let j=enc.encode(JSON.stringify(doc)),jpad=pad4(j.length),out=new Uint8Array(12+8+jpad+8+bin.length),dv=new DataView(out.buffer);dv.setUint32(0,0x46546c67,true);dv.setUint32(4,2,true);dv.setUint32(8,out.length,true);dv.setUint32(12,jpad,true);dv.setUint32(16,0x4e4f534a,true);out.fill(32,20,20+jpad);out.set(j,20);let o=20+jpad;dv.setUint32(o,bin.length,true);dv.setUint32(o+4,0x004e4942,true);out.set(bin,o+8);return out;}

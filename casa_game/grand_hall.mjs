import {finishMap,finishSurfaces,assetMap} from './surface_finish.mjs';
import {createNocturneAtmosphere} from './nocturne_atmosphere.mjs';
/** Architectural finish for legacy CASA halls. All additions clear the existing stair routes. */
export function dressGrandHall(T,root){
 if(root.userData.grandHall)return root.userData.grandHall;
 root.traverse(o=>{if(!o.isMesh)return;if(o.isInstancedMesh){const mat=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();o.geometry.computeBoundingBox();for(let i=0;i<o.count;i++){o.getMatrixAt(i,mat);mat.decompose(p,q,s);if(p.y<.15&&p.y+o.geometry.boundingBox.max.y*s.y<.18&&p.y>-.05){mat.makeScale(0,0,0);o.setMatrixAt(i,mat);}}o.instanceMatrix.needsUpdate=true;}for(const m of Array.isArray(o.material)?o.material:[o.material]){if(/warm-limestone|ivory-marble/.test(m.name)){m.color.set(0x593d28);m.roughness=.48;m.map=finishMap(T,'wood');m.bumpMap=m.map;m.bumpScale=.012;}if(/carved-walnut/.test(m.name)){m.map=finishMap(T,'wood');m.bumpMap=m.map;m.bumpScale=.012;}}});
 const g=new T.Group();g.name='Black Hollow — The Gilded Nocturne';root.add(g);root.userData.grandHall=g;
 const wood=new T.MeshStandardMaterial({color:0x392117,roughness:.38}),ebony=new T.MeshStandardMaterial({color:0x171411,roughness:.48}),gold=new T.MeshStandardMaterial({color:0xb89150,metalness:.72,roughness:.32}),plaster=new T.MeshStandardMaterial({color:0x72654b,roughness:.92}),crystal=new T.MeshStandardMaterial({color:0xe5dbbd,metalness:.25,roughness:.12}),flame=new T.MeshBasicMaterial({color:0xffdf9a});
 wood.map=finishMap(T,'wood');wood.bumpMap=wood.map;wood.bumpScale=.014;
 const batches=new Map(),matrix=new T.Object3D();
 function part(kind,mat,p,s,rz=0){const key=kind+':'+mat.uuid;if(!batches.has(key))batches.set(key,{kind,mat,items:[]});batches.get(key).items.push({p,s,rz});}
 const box=(mat,x,y,z,w,h,d,rz=0)=>part('box',mat,[x,y,z],[w,h,d],rz);
 function rod(mat,a,b,r=.035){const dir=new T.Vector3().fromArray(b).sub(new T.Vector3().fromArray(a)),o=new T.Object3D();o.position.fromArray(a).addScaledVector(dir,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.clone().normalize());o.scale.set(r,dir.length(),r);o.updateMatrix();const key='rod:'+mat.uuid;if(!batches.has(key))batches.set(key,{kind:'rod',mat,items:[]});batches.get(key).items.push({matrix:o.matrix.clone()});}
 // Layered panel bays, cornices and engaged columns produce real relief in grazing light.
 for(const side of [-1,1]){
  for(const y of [.16,2.3,5.3,9.4,13.5])box(wood,side*11.68,y,0,.32,.18,30);
  for(let z=-13;z<=13;z+=3.25){
   box(ebony,side*11.63,6.9,z,.42,13.7,.42);
   for(const y of [.35,2.4,5.35,9.5,13.5])box(gold,side*11.51,y,z,.48,.14,.58);
   for(const offset of [-1.37,1.37])box(gold,side*11.48,3.8,z+offset,.05,2.6,.045);
   for(const y of [2.5,5.1])box(gold,side*11.48,y,z,.05,.045,2.74);
   // Upper Romanesque arcade, below the ceiling, outside the walkable volume.
   for(let i=0;i<24;i++){const a=i/24*Math.PI,b=(i+1)/24*Math.PI;rod(wood,[side*11.48,10.15+1.4*Math.sin(a),z+1.4*Math.cos(a)],[side*11.48,10.15+1.4*Math.sin(b),z+1.4*Math.cos(b)],.10);}
  }
 }
 // Recessed end-wall bays and layered overdoors: actual relief in the stair vista.
 for(const x of [-10,-7,-4,0,4,7,10]){
  const w=x===0?3.7:2.55;
  for(const xx of [x-w/2,x+w/2]){box(wood,xx,8.9,15.15,.22,10.7,.34);box(gold,xx,8.9,14.94,.045,10.5,.04);}
  for(const y of [2.6,5.25,10.2,13.7,14.1]){box(wood,x,y,15.12,w+.3,.17,.4);box(gold,x,y+.09,14.9,w+.32,.032,.035);}
  if(x!==0)for(let i=0;i<24;i++){const a=i/24*Math.PI,b=(i+1)/24*Math.PI;rod(gold,[x+Math.cos(a)*w*.43,10.4+Math.sin(a)*1.65,14.97],[x+Math.cos(b)*w*.43,10.4+Math.sin(b)*1.65,14.97],.038);}
 }
 // Coffered ceiling and dentil courses make the volume read at human scale.
 for(const z of [-12,-8,-4,0,4,8,12])for(const side of [-1,1]){box(wood,side*6,14.78,z,11.6,.16,.14);for(let x=1;x<12;x+=.48)box(gold,side*x,14.65,z,.12,.13,.16);}
 for(const x of [-8,-4,0,4,8])box(wood,x,14.77,0,.13,.17,30);
 // Carved stair-side volutes stay outside the two certified walking flights.
 for(const side of [-1,1]){
  for(let k=0;k<34;k++){const t=k/33,z=4+t*7,y=t*5.25+.5,x=side*6.28;part('sphere',wood,[x,y,z],[.075,.24,.075]);part('sphere',gold,[x,y+.29,z],[.055,.045,.055]);}
  for(const z of [-11,-4,3]){const x=side*11.25;box(wood,x,1.1,z,.48,2.2,.48);for(const yy of [.12,1.9,2.15])box(gold,x,yy,z,.56,.08,.56);}
 }
 // Transverse rib vaults draw the eye toward the stair landing.
 for(const z of [-10,-3,4,11])for(const side of [-1,1])for(let i=0;i<28;i++){
  const point=t=>[side*11.65*(1-t),9.5+4.8*Math.sin(t*Math.PI/2),z];rod(wood,point(i/28),point((i+1)/28),.13);
 }
 box(gold,0,14.24,.5,.12,.12,29);
 // Fine-grained deterministic parquet, generated locally, with no texture download.
 const canvas=globalThis.document?.createElement('canvas');
 if(canvas){canvas.width=canvas.height=512;const c=canvas.getContext('2d');let seed=41;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);c.fillStyle='#25160e';c.fillRect(0,0,512,512);for(let row=0;row<16;row++)for(let col=-1;col<4;col++){const x=col*160+(row%2)*80,y=row*32,v=Math.floor(rnd()*24);c.fillStyle=`rgb(${65+v},${36+v*.6},${20+v*.4})`;c.fillRect(x+1,y+1,158,30);for(let k=0;k<12;k++){c.strokeStyle=`rgba(15,8,4,${.06+rnd()*.14})`;c.beginPath();c.moveTo(x,y+k*2.5);c.bezierCurveTo(x+45,y+k*2.5+rnd()*4,x+110,y+k*2.5-3,x+159,y+k*2.5);c.stroke();}}const map=assetMap(T,'nocturne-parquet');map.repeat.set(3,4);const floor=new T.Mesh(new T.PlaneGeometry(23.3,30.3),new T.MeshStandardMaterial({map,roughness:.37}));floor.rotation.x=-Math.PI/2;floor.position.y=.021;g.add(floor);}
 // Inlaid border and a restrained burgundy approach runner keep the entrance legible.
 for(const side of [-1,1]){box(gold,side*10.95,.024,0,.045,.008,29.5);box(ebony,side*10.8,.023,0,.12,.008,29.5);}
 const carpet=new T.MeshStandardMaterial({color:0x4c1822,roughness:1});carpet.map=finishMap(T,'rug');box(carpet,0,.055,-4.5,3.5,.018,17);for(const side of [-1,1])box(gold,side*1.65,.068,-4.5,.035,.006,17);
 // A three-tier chandelier: curved arms, candle cups, faceted drops and crystal swags.
 rod(gold,[0,14.2,-1],[0,9.4,-1],.065);
 for(const [y,r,n]of [[11.5,1.45,10],[10.5,2.25,16],[9.6,1.1,8]]){
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,x=Math.cos(a)*r,z=-1+Math.sin(a)*r;
   rod(gold,[Math.cos(a)*r,y,-1+Math.sin(a)*r],[Math.cos(b)*r,y,-1+Math.sin(b)*r],.045);
   rod(gold,[0,y-.4,-1],[x*.65,y-.5,-1+(z+1)*.65],.045);rod(gold,[x*.65,y-.5,-1+(z+1)*.65],[x,y+.15,z],.045);
   part('sphere',gold,[x,y+.16,z],[.13,.07,.13]);box(plaster,x,y+.39,z,.075,.4,.075);part('sphere',flame,[x,y+.66,z],[.055,.13,.055]);
   for(let j=0;j<9;j++){const t=j/8,ang=a+(b-a)*t;part('sphere',crystal,[Math.cos(ang)*r,y-.15-.32*Math.sin(t*Math.PI),-1+Math.sin(ang)*r],[.035,.05,.035]);}
   rod(gold,[x,y,z],[x,y-.6,z],.012);part('drop',crystal,[x,y-.77,z],[.095,.23,.095]);
  }
 }
 part('drop',crystal,[0,8.9,-1],[.24,.45,.24]);
 for(const [position,intensity,distance,color]of [[[0,8,-6],320,32,0xffd6a0],[[0,4,-10],75,24,0xc2cce5],[[0,7,10],240,28,0xffcb85]]){const light=new T.PointLight(color,intensity,distance,2);light.position.fromArray(position);g.add(light);}
 for(const {kind,mat,items}of batches.values()){const geometry=kind==='box'?new T.BoxGeometry(1,1,1):kind==='rod'?new T.CylinderGeometry(1,1,1,8):kind==='drop'?new T.OctahedronGeometry(1):new T.SphereGeometry(1,8,6),mesh=new T.InstancedMesh(geometry,mat,items.length);items.forEach((v,i)=>{if(v.matrix)mesh.setMatrixAt(i,v.matrix);else{matrix.position.fromArray(v.p);matrix.scale.fromArray(v.s);matrix.rotation.set(0,0,v.rz);matrix.updateMatrix();mesh.setMatrixAt(i,matrix.matrix);}});mesh.name='Nocturne '+kind;mesh.receiveShadow=true;g.add(mesh);}
 finishSurfaces(T,g);
 const atmosphere=createNocturneAtmosphere(T,{reducedMotion:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false});g.add(atmosphere);g.userData.tick=atmosphere.userData.tick;
 return g;
}

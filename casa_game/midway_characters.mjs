/** Original, reusable theatrical cast. No imported likenesses, textures, skeletons or render loops. */
export const MIDWAY_CAST=Object.freeze({maestro:Object.freeze({name:'Elias Quill',coat:0x39587b,hat:true}),countess:Object.freeze({name:'Cora Nightingale',coat:0x526a8b,skirt:true}),medium:Object.freeze({name:'Mara Thorne',coat:0x556b80,skirt:true,veil:true}),porter:Object.freeze({name:'Silas Bellweather',coat:0x3c6973,bag:true}),usher:Object.freeze({name:'The Lantern Usher',coat:0x52627c,hat:true})});
export function createMidwayCharacter(T,{role='porter',color=0xa8dce9,seated=false}={}){
 const spec=MIDWAY_CAST[role]||MIDWAY_CAST.porter,root=new T.Group();root.name=spec.name+' · spectral '+role;
 const skin=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.28,transparent:true,opacity:.74,depthWrite:false,roughness:.9}),cloth=new T.MeshStandardMaterial({color:spec.coat,emissive:0x527d9a,emissiveIntensity:.35,transparent:true,opacity:.75,depthWrite:false,roughness:1}),trim=new T.MeshStandardMaterial({color:0xc5d3b0,emissive:0x7298ad,emissiveIntensity:.25,transparent:true,opacity:.8,depthWrite:false,roughness:.8}),ink=new T.MeshBasicMaterial({color:0x172b3e,transparent:true,opacity:.9,depthWrite:false});
 const sphere=new T.SphereGeometry(1,12,8),box=new T.BoxGeometry(1,1,1),cylinder=new T.CylinderGeometry(1,1,1,12),parts=new Map(),stamp=new T.Object3D();
 function put(geo,mat,p,s,r=[0,0,0]){const key=geo.uuid+mat.uuid;if(!parts.has(key))parts.set(key,{geo,mat,items:[]});parts.get(key).items.push({p,s,r});}
 put(sphere,skin,[0,1.61,0],[.145,.19,.13]);put(sphere,skin,[0,1.60,.132],[.045,.05,.045]);
 for(const x of [-.057,.057])put(sphere,ink,[x,1.66,.123],[.018,.026,.012]);put(box,ink,[0,1.53,.124],[.058,.012,.014]);
 put(sphere,cloth,[0,1.15,0],[.23,.34,.15]);put(box,trim,[0,1.36,.145],[.13,.13,.025],[0,0,Math.PI/4]);
 for(const x of [-.032,.032])put(box,ink,[x,1.42,.16],[.07,.035,.02],[0,0,x>0?.3:-.3]);
 if(spec.skirt){const points=[[.30,.02],[.32,.09],[.27,.32],[.19,.68],[.16,.86]].map(([r,y])=>new T.Vector2(r,y));put(new T.LatheGeometry(points,16),cloth,[0,0,0],[1,1,1]);}
 else if(seated){for(const x of [-.10,.10]){put(box,cloth,[x,.78,.16],[.13,.14,.36]);put(box,cloth,[x,.50,.30],[.11,.45,.12]);put(sphere,ink,[x,.25,.36],[.09,.065,.16]);}}
 else{for(const x of [-.10,.10]){put(cylinder,cloth,[x,.43,0],[.075,.75,.075]);put(sphere,ink,[x,.07,.07],[.09,.065,.16]);}for(const x of [-.14,.14])put(box,cloth,[x,.76,-.10],[.18,.35,.10],[.12,0,x>0?-.08:.08]);}
 if(spec.hat){put(cylinder,cloth,[0,1.82,0],[.225,.035,.20]);put(cylinder,cloth,[0,1.94,0],[.145,.23,.135]);put(cylinder,trim,[0,1.84,0],[.15,.025,.14]);}
 else{put(sphere,cloth,[0,1.76,-.02],[.155,.11,.14]);if(spec.veil)put(new T.ConeGeometry(.23,.5,12,1,true),cloth,[0,1.51,-.045],[1,1,1],[0,Math.PI,0]);else put(cylinder,trim,[0,1.79,0],[.18,.025,.16]);}
 if(spec.bag){put(box,cloth,[-.31,.61,0],[.19,.30,.14]);put(box,trim,[-.31,.78,0],[.09,.025,.045]);put(box,trim,[-.31,.61,.079],[.027,.065,.018]);}
 for(const {geo,mat,items}of parts.values()){const mesh=new T.InstancedMesh(geo,mat,items.length);items.forEach((v,i)=>{stamp.position.fromArray(v.p);stamp.scale.fromArray(v.s);stamp.rotation.fromArray(v.r);stamp.updateMatrix();mesh.setMatrixAt(i,stamp.matrix);});root.add(mesh);}
 const arms=[];for(const side of [-1,1]){const pivot=new T.Group();pivot.position.set(side*.20,1.35,0);root.add(pivot);const sleeve=new T.Mesh(new T.CylinderGeometry(.065,.085,.38,10),cloth);sleeve.position.y=-.17;pivot.add(sleeve);const hand=new T.Mesh(new T.SphereGeometry(.065,10,6),skin);hand.position.y=-.38;pivot.add(hand);arms.push(pivot);}
 const bases=new Map([[skin,.74],[cloth,.75],[trim,.8],[ink,.9]]);
 root.userData.midwayCharacter={role,name:spec.name,setFade(value){for(const [m,opacity]of bases)m.opacity=opacity*Math.max(0,Math.min(1,value));},pose(time=0,gesture='greet',{reducedMotion=false}={}){const t=reducedMotion?0:time;for(const [i,a]of arms.entries()){const side=i?1:-1;a.rotation.set(gesture==='play'?-1.15:gesture==='dance'?-.7:gesture==='summon'?-.95:-.14,0,side*(gesture==='dance'?.35:gesture==='summon'?.5:.12));if(!reducedMotion&&gesture!=='greet')a.rotation.x+=Math.sin(t*(gesture==='play'?5:1.2)+i)*.08;}}};
 root.userData.midwayCharacter.pose();return root;
}

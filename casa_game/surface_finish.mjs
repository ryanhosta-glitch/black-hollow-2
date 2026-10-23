/** Deterministic, local material relief; geometry and source-house dimensions stay authoritative. */
export function finishSurfaces(T,root){
 const seen=new Set();root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m?.isMeshStandardMaterial||seen.has(m)||m.userData.referenceFinish)continue;seen.add(m);m.userData.referenceFinish=true;const name=m.name||'';if(/bedroom claret damask/.test(name)&&globalThis.document){const map=new T.TextureLoader().load(new URL('./assets/materials/nocturne-damask.webp',import.meta.url).href);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(.5,.5);m.map=map;m.color.set(0xffffff);}if(m.map){m.map.anisotropy=4;if(!m.bumpMap){m.bumpMap=m.map;m.bumpScale=/slate|stone|brick|limestone/i.test(name)?.028:.009;}}m.envMapIntensity=/brass|gold|metal|iron/i.test(name)?.7:.22;if(/glass/i.test(name)){m.emissive.set(0xc67b36);m.emissiveIntensity=.7;}if(/painted ogee trim/i.test(name)){m.color.set(0x70502c);m.metalness=.35;m.roughness=.48;}m.needsUpdate=true;}});return root;
}
/** Small repeating surface maps. Canvas generation is seeded and needs no external service. */
export function finishMap(T,kind='wood'){
 if(!globalThis.document?.createElement)return null;const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');let seed=713;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 x.fillStyle=kind==='rug'?'#47131e':kind==='stone'?'#343b42':'#4a2a18';x.fillRect(0,0,512,512);
 if(kind==='rug'){for(let b=9;b<65;b+=7){x.strokeStyle=b%2?'#b58b4d':'#251d1b';x.lineWidth=3;x.strokeRect(b,b,512-b*2,512-b*2);}for(let y=76;y<450;y+=45)for(let xx=76;xx<450;xx+=45){x.save();x.translate(xx,y);x.rotate(Math.PI/4);x.strokeStyle='#b58b4d';x.lineWidth=2;x.strokeRect(-10,-10,20,20);x.restore();}x.strokeStyle='#a57943';for(let r=24;r<116;r+=12){x.beginPath();x.ellipse(256,256,r,r*1.3,0,0,Math.PI*2);x.stroke();}}
 else for(let i=0;i<2700;i++){const y=rnd()*512,xx=rnd()*512;x.strokeStyle=`rgba(${kind==='stone'?'175,182,190':'186,126,65'},${rnd()*.12})`;x.beginPath();x.moveTo(xx,y);x.bezierCurveTo(xx+12,y+2,xx+32,y-2,xx+70,y+.6);x.stroke();}
 const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;return map;
}

export function assetMap(T,name){const map=new T.TextureLoader().load(new URL('./assets/materials/'+name+'.webp',import.meta.url).href);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;return map;}
export function createReflectionVault(T){
 if(!globalThis.document?.createElement)return null;const faces=Array.from({length:6},(_,i)=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle=i===2?'#434851':i===3?'#21170f':'#282c36';x.fillRect(0,0,64,64);if(i!==2&&i!==3){x.fillStyle='#71849b';x.fillRect(15,9,10,32);x.fillStyle='#ac8053';x.fillRect(46,28,4,14);}return c;});const map=new T.CubeTexture(faces);map.colorSpace=T.SRGBColorSpace;map.needsUpdate=true;return map;
}

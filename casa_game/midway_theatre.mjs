import {createMidwaySignatureShows} from './midway_signature_shows.mjs';
import {createMidwayGhost} from './midway_ghost.mjs';
import {disposeGroup} from './resources.mjs';
const colors={books:0xd1b98a,music:0xe6d4ad,ribbon:0xb894ce,bottles:0x88cbd1,leaves:0x8cc1a4,memorial:0xcec7de,frames:0xc9ab65,plates:0xe9dcc5,toys:0xdcae84,letters:0xe5d0a0,lanterns:0xa9d4e8};
/** One reusable spectral cast; never moves compiled student furniture. No lights/textures. */
export function createMidwayTheatre(T,{reducedMotion=false,quality='performance'}={}){
 const root=new T.Group();root.name='Midway theatrical scene pool';root.visible=false;
 const ghost=createMidwayGhost(T,{detail:'crowd',color:0xbad7e4,reducedMotion:true});ghost.name='Midway returning guest';ghost.scale.setScalar(.66);root.add(ghost);
 const glow=new T.MeshStandardMaterial({color:0xd5cdb1,emissive:0x567d91,emissiveIntensity:.35,transparent:true,opacity:0,depthWrite:false,roughness:.85});
 const geometries={box:new T.BoxGeometry(1,1,1),bottle:new T.CylinderGeometry(.45,.65,1,8),leaf:new T.OctahedronGeometry(.5,0),ring:new T.TorusGeometry(.5,.055,4,12),lantern:new T.SphereGeometry(.5,8,6)};
 const pools=Object.fromEntries(Object.entries(geometries).map(([key,geometry])=>{const mesh=new T.InstancedMesh(geometry,glow,6);mesh.name='Spectral '+key+' pool';mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.visible=false;root.add(mesh);return [key,mesh];}));
 const accents=new T.MeshStandardMaterial({color:0xb9a375,emissive:0x393128,emissiveIntensity:.18,transparent:true,opacity:0,roughness:.8});
 const details=new T.InstancedMesh(new T.BoxGeometry(1,1,1),accents,12);details.name='Spectral book covers and bottle necks';root.add(details);
 const hat=new T.Group();hat.name='Room-role costume';root.add(hat);const brim=new T.Mesh(new T.BoxGeometry(.31,.025,.24),accents);brim.position.y=1.32;hat.add(brim);const crown=new T.Mesh(new T.BoxGeometry(.20,.12,.17),accents);crown.position.y=1.39;hat.add(crown);
 const shows=createMidwaySignatureShows(T,{reducedMotion});root.add(shows.root);
 const stamp=new T.Object3D();let disposed=false;
 function render(snapshot){if(disposed)return;root.visible=!!snapshot?.stage;if(!root.visible)return;const s=snapshot;for(const child of root.children)if(child!==shows.root)child.visible=!s.show;if(s.show){root.position.set(0,0,0);root.rotation.set(0,0,0);shows.render(s);return;}shows.clear();const p=s.progress,fade=Math.max(0,Math.min(1,p/.22,(1-p)/.28)),reveal=s.phase!=='anticipation',time=reducedMotion?0:s.elapsed;
  root.position.fromArray(s.stage);const dx=s.anchor[0]-s.stage[0],dz=s.anchor[2]-s.stage[2];root.rotation.y=Math.atan2(dx,dz);
  const gm=ghost.children[0].material;gm.opacity=.72*fade;ghost.children[1].visible=fade>.25;accents.opacity=.8*fade;hat.visible=['library','ballroom','conservatory','crypt'].includes(s.identity)||s.finale;ghost.position.set(0,reducedMotion?0:Math.sin(time*1.3)*.025,0);ghost.rotation.set(s.finale&&!reducedMotion&&p>.5?Math.sin((p-.5)*Math.PI)*.14:0,s.identity==='ballroom'&&!reducedMotion?Math.sin(time*.7)*.55:0,0);
  hat.rotation.copy(ghost.rotation);
  glow.color.setHex(colors[s.motif]||colors.lanterns);glow.opacity=(reveal?.85:.3)*fade;
  const type=s.motif==='bottles'?'bottle':s.motif==='leaves'?'leaf':['memorial','frames','plates'].includes(s.motif)?'ring':s.motif==='lanterns'?'lantern':'box';
  for(const [key,mesh]of Object.entries(pools))mesh.visible=key===type;
  const mesh=pools[type],count=quality==='cinematic'?6:4;mesh.count=count;details.visible=['books','bottles','music','letters'].includes(s.motif);details.count=count;
  for(let i=0;i<count;i++){const a=i/count*Math.PI*2+(s.motif==='music'?time*.55:0),x=Math.cos(a)*.25,y=.73+Math.sin(a)*.14+(reducedMotion?0:Math.sin(time*1.4+i)*.06),z=.13+Math.sin(a)*.12;
   stamp.position.set(x,y,z);stamp.rotation.set(s.motif==='books'?-.25:0,a*.3+(reducedMotion?0:Math.sin(time+i)*.12),s.motif==='ribbon'?(reducedMotion?.2:Math.sin(time+i)*.4):0);
   stamp.scale.set(...(type==='bottle'?[.09,.22,.09]:type==='ring'?[.15,.15,.045]:type==='leaf'?[.15,.29,.035]:type==='lantern'?[.10,.14,.10]:s.motif==='ribbon'?[.045,.22,.025]:s.motif==='toys'?[.10,.12,.10]:[.13,.018,.18]));
   stamp.updateMatrix();mesh.setMatrixAt(i,stamp.matrix);
   if(details.visible){if(type==='bottle'){stamp.position.y+=.14;stamp.scale.set(.035,.075,.035);}else{stamp.position.y+=.012;stamp.scale.set(.11,.008,.15);}stamp.updateMatrix();details.setMatrixAt(i,stamp.matrix);}
  }
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();if(details.visible){details.instanceMatrix.needsUpdate=true;details.computeBoundingSphere();}
 }
 return {root,render,clear(){root.visible=false;shows.clear();},dispose(){if(disposed)return;disposed=true;shows.dispose();disposeGroup(root);},get inventory(){return {ghosts:1,propCapacity:6,meshPools:5,costumeMeshes:2,detailCapacity:6,signatureShows:shows.inventory,newLights:0,newTextures:0};}};
}

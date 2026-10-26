import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {openGinger} from './ginger_forge.mjs';
import {fixtureColors,profile} from './sequencer.mjs';
export function createViewer(viewport){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;viewport.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(42,1,.05,1500),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;
 const sky=new T.HemisphereLight(0xb6d8ff,0x35202b,.7),sun=new T.DirectionalLight(0xffd4ad,1.1);sun.position.set(-20,30,-25);scene.add(sky,sun);
 let model,pkg,groups=[],highlight,night=true,ticket=0;
 function dispose(root){if(!root)return;root.traverse(o=>{o.geometry?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])m.dispose();});root.removeFromParent();}
 function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(viewport);resize();
 function fit(){if(!model)return;const box=new T.Box3().setFromObject(model),c=box.getCenter(new T.Vector3()),s=box.getSize(new T.Vector3()),d=Math.max(s.y,s.x/camera.aspect,s.z)*1.65;controls.target.copy(c);camera.position.copy(c).add(new T.Vector3(d*.66,d*.4,-d*.92));controls.update();}
 async function house(p){const own=++ticket,{bytes}=await openGinger(p),manager=new T.LoadingManager();manager.setURLModifier(url=>{if(!url.startsWith('blob:')&&!url.startsWith('data:'))throw Error('External model resource blocked.');return url;});const next=(await new GLTFLoader(manager).parseAsync(bytes.buffer,'')).scene;if(own!==ticket){dispose(next);return;}dispose(model);model=next;pkg=p;scene.add(model);fit();}
 function sample(path,n){const points=path.pointsMeters.map(p=>new T.Vector3(...p)),lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths.at(-1)+points[i].distanceTo(points[i-1]));const closed=points[0].distanceTo(points.at(-1))<.001;
  return Array.from({length:n},(_,i)=>{const d=lengths.at(-1)*(n===1?.5:i/(closed?n:n-1));let k=1;while(k<lengths.length-1&&lengths[k]<d)k++;const a=points[k-1],b=points[k]||a,v=a.clone().lerp(b,(d-lengths[k-1])/Math.max(.000001,lengths[k]-lengths[k-1]));return v.add(new T.Vector3(...(path.normal||[0,0,-1])).multiplyScalar(.08));});}
 function fixtures(list){for(const g of groups)dispose(g.mesh);groups=[];for(const f of list){const a=pkg?.anchors.find(a=>a.id===f.anchorId);if(!a)continue;const p=profile(f.profileId),n=p.pixel?f.nodes:(p.zones||1),positions=sample(a,n),mesh=new T.InstancedMesh(new T.SphereGeometry(p.pixel?.065:.16,8,6),new T.MeshBasicMaterial({color:0xffffff}),n),matrix=new T.Matrix4();positions.forEach((v,i)=>{matrix.makeTranslation(v.x,v.y,v.z);mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new T.Color(.05,.05,.05));});scene.add(mesh);groups.push({f,mesh});}}
 function select(id){dispose(highlight);highlight=null;const a=pkg?.anchors.find(a=>a.id===id);if(!a)return;const points=sample(a,80);highlight=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0xffb4ce,depthTest:false,transparent:true,opacity:.65}));highlight.renderOrder=4;scene.add(highlight);}
 function frame(universes,test=false){for(const {f,mesh}of groups){const colors=fixtureColors(f,universes);for(let i=0;i<mesh.count;i++){const c=test?[1,.75,.4]:colors[i];mesh.setColorAt(i,new T.Color(...c.map(x=>.025+x*.975)));}mesh.instanceColor.needsUpdate=true;}controls.update();renderer.render(scene,camera);}
 return {house,fixtures,select,fit,frame,night(){night=!night;sky.intensity=night?.7:2.3;sun.intensity=night?1.1:3.2;}};
}

import {samplePath} from './placement.mjs';
import {createEmitterMesh,setEmitterColor,configurePreviewRenderer} from './preview_materials.mjs';
import {pixelRadiance,shutterState} from './fixture_output.mjs';
import {displayPaths} from './display_models.mjs';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {openGinger} from './ginger_forge.mjs';
import {winterScene,finishConfectionery} from './winter_scene.mjs';
import {fixtureColors,profile} from './sequencer.mjs';
export function createViewer(viewport,{presentation=false}={}){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));configurePreviewRenderer(renderer,{presentation});renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;viewport.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(42,1,.05,1500),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;
 const sky=new T.HemisphereLight(0xb6d8ff,0x35202b,.7),sun=new T.DirectionalLight(0xffd4ad,1.1);sun.position.set(-20,30,-25);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-.0004;sun.shadow.normalBias=.035;scene.add(sky,sun);const winter=winterScene(scene,renderer,camera);const washes=[];
 let model,pkg,groups=[],propAnchors=[],supports=[],highlight,night=true,ticket=0,lastRender=0,houseBrightness=1,tourBounds=null,selectedCount=0;const originalMaterials=new WeakMap();let fixtureSignature='';const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const accuracy=document.createElement('span');accuracy.className='preview-accuracy';accuracy.style.cssText='position:absolute;left:12px;top:52px;z-index:2;max-width:80%;padding:5px 8px;background:#09202bd9;font:10px system-ui;color:#c3d8ce;pointer-events:auto';viewport.append(accuracy);
 function setHouseBrightness(value){
  if(!Number.isFinite(value))return houseBrightness;houseBrightness=Math.max(0,Math.min(1,value));
  // Dim ambient scenery illumination, not surface reflectance. Programmed washes
  // must remain visible on a dimmed house rather than being attenuated twice.
  winter.setSceneryBrightness(houseBrightness);sky.intensity=(night?.7:2.3)*(.01+.99*houseBrightness);sun.intensity=(night?1.1:3.2)*houseBrightness;
  model?.traverse(o=>{for(const m of [].concat(o.material||[])){if(!m.color)continue;if(!originalMaterials.has(m))originalMaterials.set(m,{color:m.color.clone(),emissiveIntensity:m.emissiveIntensity??1});const base=originalMaterials.get(m);m.color.copy(base.color);if(m.emissive)m.emissiveIntensity=base.emissiveIntensity*houseBrightness;}});return houseBrightness;
 }
 function dispose(root){if(!root)return;root.traverse(o=>{o.geometry?.dispose();for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])m.dispose();});root.removeFromParent();}
 function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();winter.resize(w,h);}new ResizeObserver(resize).observe(viewport);resize();
 function fit(){if(!model)return;const box=new T.Box3().setFromObject(model);for(const g of groups)for(const point of g.positions)box.expandByPoint(point);tourBounds=box.clone();const c=box.getCenter(new T.Vector3()),s=box.getSize(new T.Vector3()),d=Math.max(s.y,s.x/camera.aspect,s.z)*1.85;camera.far=Math.max(1500,d*12);camera.updateProjectionMatrix();controls.maxDistance=d*4;controls.target.copy(c);camera.position.copy(c).add(new T.Vector3(d*.38,d*.23,-d*.96));controls.update();}
 async function house(p){const own=++ticket,{bytes}=await openGinger(p),manager=new T.LoadingManager();manager.setURLModifier(url=>{if(!url.startsWith('blob:')&&!url.startsWith('data:'))throw Error('External model resource blocked.');return url;});const next=(await new GLTFLoader(manager).parseAsync(bytes.buffer,'')).scene;if(own!==ticket){dispose(next);return;}dispose(model);model=next;pkg=p;finishConfectionery(model);setHouseBrightness(houseBrightness);scene.add(model);fixtureSignature='';const box=new T.Box3().setFromObject(model),center=box.getCenter(new T.Vector3()),span=Math.max(box.max.x-box.min.x,box.max.z-box.min.z,10);sun.position.copy(center).add(new T.Vector3(-span,span*2,-span));sun.target.position.copy(center);scene.add(sun.target);Object.assign(sun.shadow.camera,{left:-span,right:span,top:span,bottom:-span,far:span*7,near:.1});sun.shadow.camera.updateProjectionMatrix();winter.environment(p,box);fit();}
 function sample(path,n){return samplePath(path,n).map(p=>new T.Vector3(...p));}
 function matrixPositions(anchor,matrix){const points=anchor.pointsMeters.map(p=>new T.Vector3(...p));let normal=new T.Vector3(...(anchor.normal||[0,0,-1]));if(Math.abs(normal.y)>.7)normal.set(0,0,-1);normal.y=0;normal.normalize();if(normal.lengthSq()<.5)normal.set(0,0,-1);const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),normal).normalize(),origin=points[0],xs=points.map(p=>p.clone().sub(origin).dot(right)),ys=points.map(p=>p.y),low=Math.min(...xs),high=Math.max(...xs),width=Math.max(.5,high-low),top=Math.max(...ys),height=Math.max(...ys)-Math.min(...ys)>.1?Math.max(...ys)-Math.min(...ys):width;return Array.from({length:16},(_,column)=>origin.clone().addScaledVector(right,(high+low)/2-width/2+(column+.5)*width/16).setY(top-(matrix.row+.5)*height/16).addScaledVector(normal,.12));}
 function fixtures(list,props=[]){
  const signature=JSON.stringify([list,props]);if(signature===fixtureSignature)return;fixtureSignature=signature;
  const washCount=Math.min(12,list.filter(f=>profile(f.profileId).wash).length);while(washes.length<washCount){const light=new T.SpotLight(0xffffff,0,12,.9,.8,2);scene.add(light,light.target);washes.push(light);}while(washes.length>washCount){const light=washes.pop();light.removeFromParent();light.target.removeFromParent();}
  for(const support of supports)dispose(support);supports=[];propAnchors=props.flatMap(displayPaths);
  for(const a of propAnchors){const support=new T.Line(new T.BufferGeometry().setFromPoints(a.pointsMeters.map(p=>new T.Vector3(...p))),new T.LineBasicMaterial({color:0x33444b}));scene.add(support);supports.push(support);}
  for(const g of groups){dispose(g.mesh);dispose(g.halo);dispose(g.proxy);dispose(g.spill);}groups=[];
  const spillRay=new T.Raycaster(),spillCount=Math.max(1,Math.min(6,Math.floor(96/Math.max(1,list.length))));
  for(const f of list){
   const a=[...(pkg?.anchors||[]),...propAnchors].find(a=>a.id===f.anchorId);if(!a)continue;
   const p=profile(f.profileId),n=p.pixel?f.nodes:(p.zones||1),positions=f.matrix?matrixPositions(a,f.matrix):sample(a,n),normal=new T.Vector3(...(a.normal||[0,0,-1]));
   const mesh=createEmitterMesh(positions,p.pixel),matrix=new T.Matrix4();
   const halo=new T.Points(new T.BufferGeometry().setFromPoints(positions),new T.PointsMaterial({map:winter.haloTexture,color:0xffffff,vertexColors:true,size:p.pixel?.26:.7,transparent:true,opacity:.6,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));
   halo.geometry.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(n*3),3));
   const proxy=new T.Line(new T.BufferGeometry().setFromPoints(positions),new T.LineBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
   proxy.material.visible=false;const patches=[];
   if(model&&normal.lengthSq()>.5&&!a.propId){
    for(let i=0;i<Math.min(spillCount,n);i++){
     const node=Math.min(n-1,Math.floor((i+.5)*n/Math.min(spillCount,n))),origin=positions[node].clone().addScaledVector(normal,.15);
     spillRay.set(origin,normal.clone().negate().normalize());spillRay.far=.8;
     const hit=spillRay.intersectObject(model,true)[0];if(!hit?.face)continue;
     const faceNormal=hit.face.normal.clone().applyNormalMatrix(new T.Matrix3().getNormalMatrix(hit.object.matrixWorld));
     patches.push({node,start:Math.floor(i*n/Math.min(spillCount,n)),end:Math.floor((i+1)*n/Math.min(spillCount,n)),point:hit.point.clone().addScaledVector(faceNormal,.012),normal:faceNormal});
    }
   }
   let spill=null;if(patches.length){
    spill=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:winter.haloTexture,transparent:true,opacity:p.wash?.25:.17,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}),patches.length);
    const rotation=new T.Quaternion(),scale=new T.Vector3(p.wash?2.4:.65,p.wash?2.4:.65,1);
    patches.forEach((patch,i)=>{rotation.setFromUnitVectors(new T.Vector3(0,0,1),patch.normal);matrix.compose(patch.point,rotation,scale);spill.setMatrixAt(i,matrix);spill.setColorAt(i,new T.Color(0,0,0));});scene.add(spill);
   }
   scene.add(mesh,halo,proxy);groups.push({f,mesh,halo,proxy,spill,patches,positions,normal});
  }
 }
 function selectFixtures(ids,routes=[]){
  dispose(highlight);highlight=new T.Group();const selected=groups.filter(g=>ids.includes(g.f.id));selectedCount=selected.length;
  for(const g of selected){const line=new T.Line(new T.BufferGeometry().setFromPoints(g.positions),new T.LineDashedMaterial({color:0x82dcff,dashSize:.16,gapSize:.12,depthTest:false,transparent:true,opacity:.65}));line.computeLineDistances();line.renderOrder=4;highlight.add(line);
   const route=routes.find(r=>r.fixtureId===g.f.id);if(route&&g.positions.length>1){const start=g.positions[route.reverse?g.positions.length-1:0],end=g.positions[route.reverse?Math.max(0,g.positions.length-2):1],direction=end.clone().sub(start);if(direction.lengthSq()>.00001){const arrow=new T.ArrowHelper(direction.normalize(),start,.55,0x8dffcf,.18,.12);arrow.line.material.depthTest=false;arrow.cone.material.depthTest=false;arrow.renderOrder=5;highlight.add(arrow);}}
  }scene.add(highlight);
 }
 function select(id){selectFixtures(groups.filter(g=>g.f.anchorId===id||g.f.id===id).map(g=>g.f.id));}
 function frame(universes,test=false,seconds=0){
  const now=performance.now();if(document.hidden||now-lastRender<1000/30)return;lastRender=now;
  if(!viewport.clientWidth||!viewport.clientHeight)return;
  let wash=0,shutter=false;for(const light of washes)light.intensity=0;
  for(const {f,mesh,halo,spill,patches,positions,normal}of groups){
   const gate=shutterState(f,universes,seconds,{reducedMotion});shutter ||= gate.active;
   const colors=fixtureColors(f,universes).map(color=>color.map(v=>v*gate.gain));
   for(let i=0;i<mesh.count;i++){const c=pixelRadiance(test?[1,.75,.4]:colors[i]);setEmitterColor(mesh,i,c);halo.geometry.attributes.color.setXYZ(i,...c.map(x=>x*.35));}
   mesh.instanceColor.needsUpdate=true;halo.geometry.attributes.color.needsUpdate=true;
   if(spill){for(let i=0;i<patches.length;i++){const patch=patches[i],c=test?[1,.75,.4]:[0,1,2].map(k=>colors.slice(patch.start,patch.end).reduce((sum,color)=>sum+color[k],0)/Math.max(1,patch.end-patch.start));spill.setColorAt(i,new T.Color(...pixelRadiance(c)));}spill.instanceColor.needsUpdate=true;}
   if(profile(f.profileId).wash&&wash<washes.length){const c=test?[1,.75,.4]:colors[0],light=washes[wash++],at=positions[0];light.position.copy(at).addScaledVector(normal,1.6);light.target.position.copy(at).addScaledVector(normal,-.12);const peak=Math.max(...c);light.color.setRGB(...c.map(v=>peak?v/peak:0));light.intensity=peak*30;}
  }
  const message=shutter?(reducedMotion?'Shutter active · pulse animation paused for reduced motion.':'Strobe preview · slow illustration.'):selectedCount?'Lighting simulation · dashed lines mark selection':'Lighting simulation';
  if(accuracy.textContent!==message)accuracy.textContent=message;accuracy.title=shutter?'The manufacturer does not specify a calibrated frequency. The preview uses slow illustrative pulses.':'Color and timing follow computed DMX. Wall glow is simplified, not a calibrated photometric prediction.';
  controls.update();winter.render();
 }
 function setTour(progress){if(!model)return;const box=tourBounds||new T.Box3().setFromObject(model);const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3()),distance=Math.max(size.y,size.x/camera.aspect,size.z)*1.65,angle=(progress-.5)*.85;controls.enabled=false;controls.target.copy(center).add(new T.Vector3(0,size.y*.04,0));camera.position.copy(center).add(new T.Vector3(Math.sin(angle)*distance,distance*(.19+.055*Math.sin(progress*Math.PI)),-Math.cos(angle)*distance));camera.lookAt(controls.target);controls.update();}
 const api={house,selectFixtures,setTour,releaseTour(){controls.enabled=true;},setHouseBrightness,fixtures,select,fit,frame,glow:()=>winter.toggleGlow(),snow:()=>winter.toggleSnow(),get glowEnabled(){return winter.glow;},get snowEnabled(){return winter.snowing;},night(){night=!night;sky.intensity=night?.7:2.3;sun.intensity=night?1.1:3.2;winter.setNight(night);setHouseBrightness(houseBrightness);}};
 const raycaster=new T.Raycaster(),pointer=new T.Vector2();let down;renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.params.Line.threshold=.22;raycaster.setFromCamera(pointer,camera);const wall=model?raycaster.intersectObject(model,true)[0]:null,hits=raycaster.intersectObjects(groups.flatMap(g=>[g.mesh,g.proxy])).filter(hit=>!wall||hit.distance<=wall.distance+.12);if(hits[0])api.onSelect?.(groups.find(g=>g.mesh===hits[0].object||g.proxy===hits[0].object).f.id);});return api;
}

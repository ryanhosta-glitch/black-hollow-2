import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {floorY} from '../casa_game/session.mjs';
import {openCasa} from '../casa_game/archive.mjs';
import {createPackageAssets,createFloorStreamer,createExterior,disposeGroup} from '../casa_game/resources.mjs';
// Inspect the actual archive through the Game's resource loader, never a separate approximation.
export async function createForgePreview(container,blob){
 const house=await openCasa(await blob.arrayBuffer()),assets=createPackageAssets(house,{THREE,GLTFLoader}),stream=createFloorStreamer(house,assets,THREE);
 const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#171722');scene.add(new THREE.HemisphereLight(0xffeedb,0x49455c,3));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(12,25,10);scene.add(key);
 const camera=new THREE.PerspectiveCamera(50,1,.03,2000),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;
 const toolbar=document.createElement('div'),select=document.createElement('select'),home=document.createElement('button'),status=document.createElement('span'),cutaway=document.createElement('input'),cutawayLabel=document.createElement('label');cutaway.type='checkbox';cutawayLabel.textContent='Cutaway view ';cutawayLabel.append(cutaway);home.textContent='Fit view';home.type='button';select.setAttribute('aria-label','Preview exterior or floor');
 for(const [value,text]of [['outside','Complete exterior'],...house.manifest.floors.map((f,i)=>[String(i),f.name])]){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}toolbar.append(select,home,cutawayLabel,status);container.replaceChildren(toolbar,renderer.domElement);renderer.domElement.style.width='100%';renderer.domElement.style.height='420px';
 let current=null,exterior=null,closed=false,request=0;
 const draw=()=>{if(!closed)renderer.render(scene,camera);};
 function clip(){renderer.clippingPlanes=cutaway.checked&&select.value!=='outside'?[new THREE.Plane(new THREE.Vector3(0,-1,0),floorY(house,Number(select.value))+1.9)]:[];draw();}cutaway.onchange=clip;
 function fit(){if(!current)return;const bounds=new THREE.Box3().setFromObject(current),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()),radius=Math.max(size.x,size.y,size.z,1);controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(radius*.9,radius*.75,radius));camera.far=Math.max(500,radius*10);camera.updateProjectionMatrix();controls.update();draw();}
 async function show(){const id=++request;select.disabled=true;status.textContent=' Loading compiled models…';try{const model=select.value==='outside'?(exterior??=await createExterior(house,assets,THREE)):await stream.get(Number(select.value));if(closed||id!==request)return;if(current)scene.remove(current);current=model;scene.add(model);cutaway.checked=select.value!=='outside';clip();status.textContent=select.value==='outside'?' Drag to orbit · scroll to zoom':' Cutaway reveals the interior. Uncheck it to inspect full ceilings and walls.';fit();}catch(e){if(!closed)status.textContent=' Preview failed: '+e.message;}finally{if(!closed)select.disabled=false;}}
 const resize=new ResizeObserver(()=>{if(closed)return;const width=Math.max(container.clientWidth,1);renderer.setSize(width,420,false);camera.aspect=width/420;camera.updateProjectionMatrix();draw();});resize.observe(container);controls.addEventListener('change',draw);home.onclick=fit;select.onchange=show;await show();
 return {close(){closed=true;request++;resize.disconnect();controls.dispose();stream.clear();if(exterior)disposeGroup(exterior);assets.close();renderer.dispose();container.replaceChildren();}};
}

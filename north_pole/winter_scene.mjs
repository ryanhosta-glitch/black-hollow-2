import * as T from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

// Rendering treatment only: imported package geometry, attachment coordinates and hashes stay intact.
export function finishConfectionery(root){
 root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;for(const m of [].concat(o.material||[])){
  if(/sugar glass/.test(m.name)){m.emissiveIntensity=1.15;m.roughness=.24;}
  if(/candy|holly/.test(m.name)){m.roughness=.28;m.metalness=.05;}
  if(/royal icing/.test(m.name)){m.color.set('#fff3dd');m.roughness=.82;}
  if(!/gingerbread|biscuit|chocolate/.test(m.name))continue;
  const roof=/roof/.test(m.name),stone=/masonry/.test(m.name);m.roughness=.94;m.metalness=0;
  m.onBeforeCompile=s=>{
   s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vCookiePosition; varying vec3 vCookieNormal;').replace('#include <begin_vertex>','#include <begin_vertex>\nvCookiePosition=position;vCookieNormal=normal;');
   s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>
    varying vec3 vCookiePosition; varying vec3 vCookieNormal;
    float cookieNoise(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   `).replace('#include <color_fragment>',`#include <color_fragment>
    vec3 an=abs(normalize(vCookieNormal));
    vec2 p=an.y>.65?vCookiePosition.xz:(an.z>an.x?vCookiePosition.xy:vCookiePosition.zy);
    float crumb=cookieNoise(floor(p*160.));
    float grain=.86+.17*crumb+.06*cookieNoise(floor(p*21.));
    ${roof?`if(an.y>.18){vec2 tile=p*vec2(3.8,4.4);float row=floor(tile.y);vec2 cell=fract(tile+vec2(mod(row,2.)*.5,0.));float scallop=abs(length((cell-vec2(.5,.12))*vec2(1.,.8))-.5);float seam=1.-smoothstep(.025,.065,scallop);grain*=1.-.35*seam;float dust=smoothstep(.82,.99,cell.y)*.67+seam*.28;diffuseColor.rgb=mix(diffuseColor.rgb*grain,vec3(.72,.81,.88),clamp(dust,0.,.72));}else{diffuseColor.rgb*=grain;}`:`float row=floor(p.y/${stone?'.22':'.34'});vec2 cell=fract(vec2(p.x/${stone?'.54':'.8'}+mod(row,2.)*.5,p.y/${stone?'.22':'.34'}));float edge=min(min(cell.x,1.-cell.x),min(cell.y,1.-cell.y));float seam=1.-smoothstep(.012,.034,edge);diffuseColor.rgb*=grain*(1.-.25*seam);diffuseColor.rgb+=vec3(.035,.018,.004)*smoothstep(.5,.95,crumb);`}
   `);
  };m.customProgramCacheKey=()=>`confectionery-finish-v2-${roof}-${stone}`;m.needsUpdate=true;
 }});
}
function dispose(root){if(!root)return;const geos=new Set(),mats=new Set();root.traverse(o=>{if(o.geometry)geos.add(o.geometry);for(const m of [].concat(o.material||[]))mats.add(m);});root.removeFromParent();for(const x of [...geos,...mats])x.dispose();}
export function winterScene(scene,renderer,camera){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,composer=new EffectComposer(renderer);composer.setPixelRatio(1);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new T.Vector2(1,1),.65,.45,1.1);composer.addPass(bloom);composer.addPass(new OutputPass());
 let stage=null,snow=null,night=true,glow=innerWidth>700,snowing=!reduced,lastTime=0,elapsed=0,fogDensity=.012;
 const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=64;const ctx=haloCanvas.getContext('2d'),radial=ctx.createRadialGradient(32,32,1,32,32,31);radial.addColorStop(0,'rgba(255,255,255,1)');radial.addColorStop(.15,'rgba(255,255,255,.6)');radial.addColorStop(.45,'rgba(255,255,255,.13)');radial.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=radial;ctx.fillRect(0,0,64,64);const haloTexture=new T.CanvasTexture(haloCanvas);haloTexture.colorSpace=T.SRGBColorSpace;
 function environment(pkg,box){
  dispose(stage);stage=new T.Group();stage.name='Winter garden · scenery';scene.add(stage);
  const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3()),r=Math.max(size.x,size.z,8),groundY=box.min.y-.025;fogDensity=.12/r;
  const snowMat=new T.MeshStandardMaterial({color:0xdce9f0,roughness:1}),pine=new T.MeshStandardMaterial({color:0x123e3d,roughness:1}),metal=new T.MeshStandardMaterial({color:0x10212a,metalness:.6,roughness:.42}),gold=new T.MeshStandardMaterial({color:0xa27b42,metalness:.7,roughness:.28});
  const add=(geometry,material,x,y,z)=>{const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.receiveShadow=true;stage.add(o);return o;};
  snowMat.userData.snow=true;const groundMat=snowMat.clone();groundMat.userData.snow=true;groundMat.transparent=true;groundMat.depthWrite=false;groundMat.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vSnowGround;').replace('#include <begin_vertex>','#include <begin_vertex>\nvSnowGround=position.xy;');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vSnowGround;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=1.-smoothstep('+r*1.5+','+r*3.4+',length(vSnowGround));');};const ground=add(new T.CircleGeometry(r*3.5,80),groundMat,center.x,groundY,center.z);ground.rotation.x=-Math.PI/2;
  // Rounded drifts break the hard rectangular export-base silhouette without altering the property.
  for(let i=0;i<14;i++){const angle=i/14*Math.PI*2,dist=r*(1.1+(i%3)*.12),o=add(new T.SphereGeometry(1,16,8),snowMat,center.x+Math.cos(angle)*dist,groundY-.18,center.z+Math.sin(angle)*dist);o.scale.set(r*.28,.35,r*.20);}
  // Instanced evergreen tiers: scenery remains outside the house footprint and its attachment paths.
  const conifers=new T.InstancedMesh(new T.ConeGeometry(1,1,9),pine,36),caps=new T.InstancedMesh(new T.ConeGeometry(1,1,9),snowMat,36),dummy=new T.Object3D();conifers.castShadow=true;conifers.receiveShadow=true;caps.receiveShadow=true;
  for(let i=0;i<12;i++){const angle=(i/12)*Math.PI*2,dist=r*(.93+(i%3)*.08),height=3.3+(i%4)*.65,x=center.x+Math.cos(angle)*dist,z=center.z+Math.sin(angle)*dist;for(let tier=0;tier<3;tier++){const index=i*3+tier,rr=(1-tier*.21)*height*.34,y=groundY+.5+tier*height*.23;dummy.position.set(x,y,z);dummy.scale.set(rr,height*.58,rr);dummy.updateMatrix();conifers.setMatrixAt(index,dummy.matrix);dummy.position.y+=height*.13;dummy.scale.set(rr*.82,height*.39,rr*.82);dummy.updateMatrix();caps.setMatrixAt(index,dummy.matrix);}}
  stage.add(conifers,caps);
  // Victorian lanterns are fixed scenery, independent of students' DMX fixtures.
  for(const sign of [-1,1]){const x=center.x+sign*size.x*.43,z=box.min.z+.45,y=groundY;add(new T.CylinderGeometry(.07,.11,2.6,8),metal,x,y+1.3,z).castShadow=true;add(new T.CylinderGeometry(.25,.34,.16,8),metal,x,y+.08,z);add(new T.BoxGeometry(.32,.46,.32),new T.MeshStandardMaterial({color:0xffd499,emissive:0xffb64b,emissiveIntensity:2.2,roughness:.4}),x,y+2.7,z);const cap=add(new T.ConeGeometry(.32,.30,4),metal,x,y+3.06,z);cap.rotation.y=Math.PI/4;add(new T.SphereGeometry(.08,8,6),gold,x,y+3.25,z);for(const dx of [-.19,.19])for(const dz of [-.19,.19])add(new T.BoxGeometry(.035,.6,.035),metal,x+dx,y+2.7,z+dz);const lamp=new T.PointLight(0xffc175,12,5,2);lamp.position.set(x,y+2.7,z);stage.add(lamp);const halo=new T.Sprite(new T.SpriteMaterial({map:haloTexture,color:0xffb86f,transparent:true,opacity:.65,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));halo.position.copy(lamp.position);halo.scale.set(1.6,1.6,1);stage.add(halo);}
  // A quiet star field and a frosted moon frame the estate rather than filling the editor with props.
  let seed=837;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};const stars=[];for(let i=0;i<240;i++){const angle=rand()*Math.PI*2,elev=.2+rand()*1.15;stars.push(center.x+Math.cos(angle)*r*3,groundY+Math.sin(elev)*r*3,center.z+Math.sin(angle)*r*3);}
  const starPoints=new T.Points(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(stars,3)),new T.PointsMaterial({color:0xc9deff,size:.065,sizeAttenuation:true,transparent:true,opacity:.65,depthWrite:false}));starPoints.name='stars';stage.add(starPoints);
  const moon=add(new T.SphereGeometry(r*.05,24,16),new T.MeshBasicMaterial({color:0xdce6ff}),center.x-size.x*.78,box.max.y+size.y*.4,box.max.z+size.z*.8);moon.name='moon';
  const count=650,positions=[],speeds=[];for(let i=0;i<count;i++){positions.push((rand()-.5)*r*4,rand()*r*2,(rand()-.5)*r*4);speeds.push(.35+rand()*.55);}
  const snowMatPoints=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},height:{value:r*2}},vertexShader:`attribute float fallSpeed;uniform float time;uniform float height;void main(){vec3 p=position;p.y=mod(p.y-time*fallSpeed+height*100.,height);p.x+=sin(time*.25+position.y)*.15;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(65./-mv.z,1.,3.5);}`,fragmentShader:`void main(){float d=length(gl_PointCoord-.5);float a=(1.-smoothstep(.12,.5,d))*.65;gl_FragColor=vec4(.83,.91,1.,a);}`});
  snow=new T.Points(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(positions,3)).setAttribute('fallSpeed',new T.Float32BufferAttribute(speeds,1)),snowMatPoints);snow.position.set(center.x,groundY,center.z);snow.frustumCulled=false;stage.add(snow);applyNight();
 }
 function applyNight(){scene.background=new T.Color(night?0x091427:0xbcd0df);scene.fog=new T.FogExp2(night?0x142337:0xc8dbe5,night?fogDensity:fogDensity*.67);if(stage)stage.traverse(o=>{for(const m of [].concat(o.material||[]))if(m.userData.snow)m.color.setHex(night?0x829bb7:0xdce9f0);});if(stage)for(const o of stage.children){if(o.name==='stars'||o.name==='moon'||o.isPointLight||o.isSprite)o.visible=night;}if(snow)snow.visible=snowing;}
 return {environment,haloTexture,resize(w,h){composer.setSize(w,h);},render(){const now=performance.now()/1000;elapsed+=Math.min(.05,Math.max(0,now-lastTime));lastTime=now;if(snow&&snowing)snow.material.uniforms.time.value=elapsed;if(glow)composer.render();else renderer.render(scene,camera);},toggleGlow(){glow=!glow;return glow;},toggleSnow(){snowing=!snowing&&!reduced;if(snow)snow.visible=snowing;return snowing;},setNight(value){night=value;applyNight();},get glow(){return glow;},get snowing(){return snowing;}};
}

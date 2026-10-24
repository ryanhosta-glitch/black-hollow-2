// A town-wide allocation keeps the spectacle rare: roughly one yard in four,
// with a different silhouette for every selected yard in a classroom-sized town.
export const INFLATABLE_DESIGNS=['monster-mouth','disco-spider','cauldron-witch','ghost-hound','pumpkin-ufo','haunted-carousel','moon-cat','candy-dragon','kraken-pumpkin','pipe-organ','bat-castle','ghost-train'];
function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function planYardDisplays(lots,{halloween=false}={}){
 const ranked=[...lots].sort((a,b)=>hash(a.house.id)-hash(b.house.id)||String(a.house.id).localeCompare(String(b.house.id)));
 const count=halloween?Math.round(lots.length*.25):0;
 return {inflatables:ranked.slice(0,count).map((lot,i)=>({id:lot.house.id,design:INFLATABLE_DESIGNS[i%INFLATABLE_DESIGNS.length],edition:Math.floor(i/INFLATABLE_DESIGNS.length),lot})),laserId:halloween?ranked[count%Math.max(1,ranked.length)]?.house.id:null,ranked};
}
export function createInflatable(T,design,{edition=0}={}){
 const root=new T.Group();root.name='Inflatable · '+design;root.userData.design=design;
 const sphere=new T.SphereGeometry(1,20,14),tube=new T.CylinderGeometry(1,1,1,16),cube=new T.BoxGeometry(1,1,1),up=new T.Vector3(0,1,0),materials=new Map();
 function nylon(color){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.43,metalness:.03,emissive:color,emissiveIntensity:.16}));return materials.get(color);}
 const green=nylon(0x77c936),purple=nylon(0x7739bd),black=nylon(0x232035),white=nylon(0xf2ecdb),orange=nylon(0xe77d24),gold=nylon(0xf3cf63),pink=nylon(0xda438c),teal=nylon(0x36afa0),red=nylon(0x9d344f);
 function mesh(geo,mat,p,scale=[1,1,1],parent=root){const o=new T.Mesh(geo,mat);o.position.fromArray(p);o.scale.fromArray(scale);parent.add(o);return o;}
 const puff=(p,size,mat,parent=root)=>mesh(sphere,mat,p,size,parent);
 function limb(a,b,r,mat,parent=root){const from=new T.Vector3(...a),to=new T.Vector3(...b),d=to.clone().sub(from);const o=mesh(tube,mat,from.clone().add(to).multiplyScalar(.5).toArray(),[r,d.length(),r],parent);o.quaternion.setFromUnitVectors(up,d.normalize());puff(a,[r,r,r],mat,parent);puff(b,[r,r,r],mat,parent);return o;}
 function eyes(x,y,z,size=.14,parent=root){for(const side of [-1,1]){puff([x+side*size*1.7,y,z],[size,size*1.25,size*.30],white,parent);puff([x+side*size*1.7,y,z+size*.3],[size*.48,size*.72,size*.18],black,parent);}}
 function grin(p,width=.4,parent=root){const o=mesh(new T.TorusGeometry(width,.055,8,24,Math.PI),black,p,[1,.7,1],parent);o.rotation.z=Math.PI;}
 function pumpkin(p,r=.6,parent=root){const g=new T.Group();g.position.fromArray(p);parent.add(g);puff([0,0,0],[r,r*.82,r*.80],orange,g);for(let i=0;i<7;i++){const seam=mesh(new T.TorusGeometry(r*.85,.009,4,28),gold,[0,0,0],[1,.84,.80],g);seam.rotation.y=i*Math.PI/7;}eyes(0,r*.15,r*.77,r*.11,g);grin([0,-r*.13,r*.78],r*.30,g);limb([0,r*.7,0],[.04,r*1.12,0],r*.10,green,g);return g;}
 function ghost(p,scale=1,parent=root){const g=new T.Group();g.position.fromArray(p);g.scale.setScalar(scale);parent.add(g);puff([0,.85,0],[.42,.82,.30],white,g);puff([0,1.5,0],[.36,.36,.29],white,g);for(const side of [-1,1]){limb([side*.24,1.17,0],[side*.75,1.45,.03],.14,white,g);puff([side*.115,1.55,.28],[.064,.10,.025],black,g);}puff([0,1.25,.30],[.11,.15,.03],black,g);return g;}
 function witchHat(p,scale=1,parent=root){const g=new T.Group();g.position.fromArray(p);g.scale.setScalar(scale);parent.add(g);puff([0,0,0],[.55,.08,.38],purple,g);const tip=mesh(new T.ConeGeometry(.35,.85,20),purple,[-.06,.40,0]);g.add(tip);tip.rotation.z=.17;mesh(tube,green,[0,.13,0],[.30,.14,.30],g);return g;}
 switch(design){
 case 'monster-mouth':
  for(const side of [-1,1]){limb([side*.95,.28,0],[side*1.02,2.45,0],.36,green);puff([side*1.02,1.2,.24],[.16,.20,.15],teal);limb([side*1.26,1.6,-.02],[side*1.50,1.6,-.02],.13,black);for(let i=0;i<3;i++)puff([side*.71,.5+i*.34,.12],[.12,.13,.15],gold);}
  puff([0,2.7,0],[1.40,.57,.43],green);puff([0,3.14,-.02],[1.40,.14,.43],black);eyes(0,2.83,.43,.22);puff([0,2.62,.48],[.15,.17,.14],green);for(let i=0;i<4;i++)puff([-.49+i*.33,2.28,.15],[.12,.16,.17],gold);break;
 case 'disco-spider':
  puff([0,1.15,-.12],[.76,.76,.60],purple);puff([0,.75,.37],[.52,.38,.28],black);eyes(0,.84,.62,.12);for(let i=0;i<8;i++){const side=i<4?-1:1,j=i%4;limb([side*.40,1,-.35+j*.19],[side*(1.1+j*.08),.87,-.50+j*.30],.09,purple);limb([side*(1.1+j*.08),.87,-.50+j*.30],[side*(1.30+j*.07),.10,-.50+j*.30],.075,black);}for(let i=0;i<25;i++){const a=i*2.399,y=.8+(i%5)*.22;puff([Math.cos(a)*.62,y,.41+Math.sin(a)*.1],[.045,.045,.025],[pink,teal,gold][i%3]);}break;
 case 'cauldron-witch':{
  puff([0,.48,.1],[.68,.48,.50],teal);mesh(new T.TorusGeometry(.54,.09,8,32),black,[0,.87,.1],[1,1,.8]).rotation.x=Math.PI/2;for(let i=0;i<7;i++)puff([Math.sin(i*2)*.4,.9+(i%2)*.08,.1+Math.cos(i*2)*.25],[.12,.10,.10],green);
  puff([-.25,1.51,-.22],[.42,.64,.28],purple);puff([-.25,2.17,-.20],[.31,.38,.27],green);eyes(-.25,2.22,.07,.085);witchHat([-.25,2.5,-.20],.8);limb([-.54,1.8,-.2],[-.9,2.20,.05],.12,purple);limb([-.9,2.20,.05],[-1.12,2.42,.05],.11,green);limb([.04,1.8,-.2],[.7,1.2,.05],.12,purple);limb([.7,1.6,.05],[.33,.89,.1],.035,gold);break;}
 case 'ghost-hound':
  puff([0,.62,0],[.64,.59,.46],white);puff([0,1.30,.18],[.47,.44,.34],gold);for(const side of [-1,1]){puff([side*.43,1.13,.21],[.17,.42,.18],orange);puff([side*.38,.17,.30],[.22,.15,.21],black);}puff([0,1.14,.48],[.24,.17,.19],gold);puff([0,1.23,.64],[.10,.07,.04],black);eyes(0,1.42,.48,.08);witchHat([0,1.65,.12],.8);pumpkin([.75,.38,.24],.33);break;
 case 'pumpkin-ufo':
  puff([0,1.06,0],[1.4,.23,.58],teal);puff([0,1.25,-.02],[.65,.37,.43],purple);pumpkin([0,1.60,.02],.47);for(let i=0;i<9;i++)puff([-1.12+i*.28,1.04,.45],[.07,.07,.04],[green,pink,gold][i%3]);for(const side of [-1,1])limb([side*.7,.9,0],[side*.9,.1,.12],.07,black);ghost([.77,.1,.2],.42);break;
 case 'haunted-carousel':
  mesh(tube,purple,[0,.14,0],[1.10,.20,.64]);limb([0,.25,0],[0,2.4,0],.075,gold);puff([0,2.30,0],[1.25,.30,.65],purple);for(const side of [-1,1]){limb([side*.65,.25,0],[side*.65,2.25,0],.035,gold);ghost([side*.65,.4,.04],.65);}pumpkin([0,2.73,0],.29);break;
 case 'moon-cat':
  puff([0,.8,0],[.59,.77,.42],purple);puff([0,1.69,.05],[.52,.48,.38],purple);for(const side of [-1,1])mesh(new T.ConeGeometry(.2,.46,12),purple,[side*.31,2.10,.03]);eyes(0,1.78,.41,.13);puff([0,1.56,.46],[.06,.05,.03],pink);limb([.45,.4,-.1],[1.04,1.17,-.10],.12,purple);pumpkin([-.75,.4,.05],.4);break;
 case 'candy-dragon':
  puff([0,.8,0],[.57,.77,.42],teal);puff([0,1.78,.16],[.46,.43,.36],teal);puff([0,1.6,.46],[.39,.20,.21],green);eyes(0,1.89,.48,.11);for(const side of [-1,1]){puff([side*.78,1.2,-.1],[.48,.60,.09],purple);limb([side*.29,.36,0],[side*.55,.18,.23],.18,teal);}pumpkin([0,.45,.43],.35);break;
 case 'kraken-pumpkin':pumpkin([0,1.11,0],.72);for(let i=0;i<6;i++){const side=i<3?-1:1;limb([side*.3,.65,0],[side*(.7+(i%3)*.3),.3,(i%3-1)*.25],.13,teal);limb([side*(.7+(i%3)*.3),.3,(i%3-1)*.25],[side*(.9+(i%3)*.3),.6,(i%3-1)*.25],.10,teal);}break;
 case 'pipe-organ':
  for(let i=0;i<7;i++)limb([-.9+i*.3,.2,-.18],[-.9+i*.3,2.5-Math.abs(i-3)*.23,-.18],.11,purple);mesh(cube,teal,[0,.65,.12],[2,.7,.5]);ghost([0,.7,.35],.76);break;
 case 'bat-castle':
  for(const side of [-1,1]){limb([side*.8,.2,0],[side*.8,1.8,0],.3,purple);mesh(new T.ConeGeometry(.44,.65,12),black,[side*.8,2.1,0]);}puff([0,1.12,0],[.9,.8,.35],purple);eyes(0,1.32,.33,.14);break;
 default:mesh(cube,purple,[0,.49,0],[2.5,.65,.7]);for(const side of [-1,1])for(const x of [-.8,.8])puff([x,.24,side*.32],[.23,.23,.08],black);ghost([-.65,.7,0],.60);pumpkin([.6,1,0],.44);
 }
 // Visible sewn edge, blower box, stakes and guy ropes sell an inflatable, not a solid statue.
 const seamMat=new T.LineBasicMaterial({color:0xf6e4b0,transparent:true,opacity:.55}),seam=[];
 for(let i=0;i<40;i++){const a=i/40*Math.PI*2,b=(i+1)/40*Math.PI*2;seam.push(Math.cos(a)*1.25,.06,Math.sin(a)*.48,Math.cos(b)*1.25,.06,Math.sin(b)*.48);}
 root.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(seam,3)),seamMat));mesh(cube,black,[.95,.12,-.47],[.25,.22,.23]);
 const cords=[];for(const side of [-1,1]){cords.push(side*.85,1,-.28,side*1.42,.03,-.60);mesh(cube,gold,[side*1.42,.035,-.60],[.06,.07,.10]);}root.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(cords,3)),new T.LineBasicMaterial({color:0x887a62})));
 // Repeated nylon forms share instanced draws, even on detailed multi-limbed designs.
 const batches=new Map();for(const child of [...root.children]){if(!child.isMesh)continue;const key=child.geometry.uuid+child.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(child);}for(const parts of batches.values()){if(parts.length<3)continue;const batch=new T.InstancedMesh(parts[0].geometry,parts[0].material,parts.length);for(const [i,part]of parts.entries()){part.updateMatrix();batch.setMatrixAt(i,part.matrix);part.removeFromParent();}root.add(batch);}
 root.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(root);root.scale.x=Math.min(1,3.35/(bounds.max.x-bounds.min.x));root.scale.z=Math.min(1,.68/Math.max(Math.abs(bounds.min.z),Math.abs(bounds.max.z)));root.userData.baseScale=root.scale.clone();root.userData.edition=edition;return root;
}
function pose(lot,x,z){const local=lot.localLot||lot,p=[local.side*x,0,local.z+z];return lot.lane?lot.lane.toWorld(p):p;}
function facing(lot){return (lot.side>0?-Math.PI/2:Math.PI/2)+(lot.lane?.angle||0);}
function flagTexture(T,index){if(typeof document==='undefined')return null;const cv=document.createElement('canvas');cv.width=192;cv.height=256;const c=cv.getContext('2d');c.fillStyle=['#3b164b','#192b29','#b44a19','#201d38'][index%4];c.fillRect(0,0,192,256);c.strokeStyle='#dab47b';c.lineWidth=7;c.strokeRect(9,9,174,238);c.fillStyle=['#f4d797','#ef9855','#161523','#a9dea3'][index%4];c.beginPath();if(index%2){c.arc(96,105,48,0,Math.PI*2);c.fill();c.fillStyle='#192b29';c.beginPath();c.arc(116,89,42,0,Math.PI*2);c.fill();}else{c.moveTo(24,81);c.lineTo(70,102);c.lineTo(85,73);c.lineTo(96,89);c.lineTo(107,73);c.lineTo(122,102);c.lineTo(168,81);c.lineTo(141,132);c.lineTo(112,123);c.lineTo(96,145);c.lineTo(80,123);c.lineTo(51,132);c.closePath();c.fill();}c.font='bold 27px Georgia';c.textAlign='center';c.fillStyle='#f4d797';c.fillText(['BOO!','MOONLIT','WELCOME','SPELLBOUND'][index%4],96,207);const map=new T.CanvasTexture(cv);map.colorSpace=T.SRGBColorSpace;return map;}
// The selected house keeps its original materials; the show adds moving light on its real surfaces.
export function installHouseLaser(T,house,{origin=[0,0,0],normal=[0,0,1],reducedMotion=false}={}){
 const time={value:0},originUniform={value:new T.Vector3(...origin)},normalUniform={value:new T.Vector3(...normal)},rightUniform={value:new T.Vector3(normal[2],0,-normal[0])},originals=[],clones=new Map();
 house.traverse(o=>{if(!o.isMesh)return;const old=o.material;function clone(m){if(!m?.isMeshStandardMaterial&&!m?.isMeshPhysicalMaterial)return m;if(clones.has(m))return clones.get(m);const n=m.clone(),before=m.onBeforeCompile;n.onBeforeCompile=function(shader,renderer){before?.call(this,shader,renderer);Object.assign(shader.uniforms,{uYardTime:time,uYardOrigin:originUniform,uYardNormal:normalUniform,uYardRight:rightUniform});shader.vertexShader='varying vec3 vYardWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
vec4 yardWorld=vec4(transformed,1.0);
#ifdef USE_INSTANCING
yardWorld=instanceMatrix*yardWorld;
#endif
vYardWorld=(modelMatrix*yardWorld).xyz;`);shader.fragmentShader='varying vec3 vYardWorld; uniform float uYardTime; uniform vec3 uYardOrigin; uniform vec3 uYardNormal; uniform vec3 uYardRight;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
vec3 yardRelative=vYardWorld-uYardOrigin;
vec2 yardUV=vec2(dot(yardRelative,uYardRight),yardRelative.y);
float yardAngle=uYardTime*.12;mat2 yardSpin=mat2(cos(yardAngle),-sin(yardAngle),sin(yardAngle),cos(yardAngle));
vec2 yardGrid=yardSpin*(yardUV-vec2(0.,2.2))*3.3+vec2(uYardTime*.10,0.);
float yardDot=1.-smoothstep(.035,.11,length(fract(yardGrid)-.5));
float yardSwirl=.42+.58*smoothstep(-.2,.6,sin(length(yardUV-vec2(0.,2.2))*2.2-uYardTime*.5));
float yardDepth=dot(yardRelative,uYardNormal);
float yardMask=step(.25,yardRelative.y)*step(yardRelative.y,11.)*step(-14.,yardDepth)*step(yardDepth,1.);
vec3 yardColor=mix(vec3(.28,1.,.07),vec3(.75,.08,1.),.5+.5*sin(yardUV.y+uYardTime*.24));
totalEmissiveRadiance+=yardColor*yardDot*yardSwirl*yardMask*1.7;`);};n.customProgramCacheKey=()=> 'black-hollow-yard-laser-1';clones.set(m,n);return n;}
 o.material=Array.isArray(old)?old.map(clone):clone(old);originals.push({o,old});});
 return {time,update(seconds){time.value=reducedMotion?0:seconds;},dispose(){for(const {o,old}of originals)o.material=old;for(const m of clones.values())m.dispose();clones.clear();},materials:clones};
}
export function createYardDisplays(T,lots,{halloween=false,reducedMotion=false}={}){
 const root=new T.Group();root.name='Black Hollow Halloween yard festival';const plan=planYardDisplays(lots,{halloween}),inflatables=[],flags=[],bounds=[],animated=[],lasers=new Map(),bulbSpecs=[],wires=[],maps=Array.from({length:4},(_,i)=>flagTexture(T,i)),poleMat=new T.MeshStandardMaterial({color:0x423547,metalness:.55,roughness:.5}),sphere=new T.SphereGeometry(1,10,7),dummy=new T.Object3D();
 function addAt(group,lot,x,z){group.position.fromArray(pose(lot,x,z));group.rotation.y=facing(lot);root.add(group);return group;}
 for(const [i,lot]of lots.entries()){
  // Warm amber garlands survive in story mode; Halloween adds orange, violet and green.
  if(halloween||i%2===0){const g=addAt(new T.Group(),lot,7.0,0);g.name='Porch lantern garland';for(const x of [-2.55,2.55]){const pole=new T.Mesh(new T.CylinderGeometry(.025,.035,2.65,8),poleMat);pole.position.set(x,1.32,0);g.add(pole);}g.updateMatrixWorld(true);for(let j=0;j<19;j++){const x=-2.55+j/18*5.1,y=2.65-Math.sin(j/18*Math.PI)*.42,p=new T.Vector3(x,y,0).applyMatrix4(g.matrixWorld);bulbSpecs.push({p,color:halloween?[0xff822e,0xa45fff,0xa6eb5c][j%3]:0xf2be6e});if(j){const previous=new T.Vector3(x-5.1/18,2.65-Math.sin((j-1)/18*Math.PI)*.42,0).applyMatrix4(g.matrixWorld);wires.push(...previous.toArray(),...p.toArray());}}}
  if(halloween||i%4===0){for(let k=0;k<(halloween?2:1);k++){const g=addAt(new T.Group(),lot,7.05,k?5.8:-5.8);g.name='Halloween garden flag';const pole=new T.Mesh(new T.CylinderGeometry(.025,.035,2.7,8),poleMat);pole.position.y=1.35;g.add(pole);const mat=new T.MeshStandardMaterial({color:maps[i%4]?0xffffff:0x793d84,map:maps[i%4],side:T.DoubleSide,roughness:.9}),flag=new T.Mesh(new T.PlaneGeometry(.73,1.05,7,8),mat);flag.position.set(.39,1.98,0);g.add(flag);flags.push({g,flag,phase:i*1.73+k});}}
 }
 for(const [i,spec]of plan.inflatables.entries()){const model=createInflatable(T,spec.design,{edition:spec.edition});addAt(model,spec.lot,7.75,5.5);model.userData.houseId=spec.id;inflatables.push(model);animated.push({g:model,phase:i*1.9,kind:'inflatable'});root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(model);bounds.push({minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z,houseId:spec.id});}
 const bulbMaterial=new T.MeshBasicMaterial({color:0xffffff}),bulbs=new T.InstancedMesh(sphere,bulbMaterial,bulbSpecs.length);bulbs.name='Halloween lantern lights';for(const [i,s]of bulbSpecs.entries()){dummy.position.copy(s.p);dummy.scale.set(.06,.09,.06);dummy.updateMatrix();bulbs.setMatrixAt(i,dummy.matrix);bulbs.setColorAt(i,new T.Color(s.color));}root.add(bulbs);const garlandWire=new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(wires,3)),new T.LineBasicMaterial({color:0x282532}));garlandWire.name='Overhead garland wire';garlandWire.raycast=()=>{};root.add(garlandWire);
 const extraYards=[];
 if(halloween){
  // Alternating yards get their own small story instead of repeating the big props.
  for(const [i,lot]of plan.ranked.entries()){if(i%5!==2||plan.inflatables.some(s=>s.id===lot.house.id))continue;const g=addAt(new T.Group(),lot,7.55,-5.2);g.name=i%2?'Dancing tombstone trio':'The watching hedge';for(let j=0;j<3;j++){const item=new T.Group();item.position.x=(j-1)*.72;g.add(item);if(i%2){const stone=new T.Mesh(new T.CapsuleGeometry(.24,.43,4,10),new T.MeshStandardMaterial({color:0x767480,roughness:.94}));stone.position.y=.44;item.add(stone);const cross=new T.Mesh(new T.BoxGeometry(.20,.035,.025),new T.MeshBasicMaterial({color:0xc3ad82}));cross.position.set(0,.55,.245);item.add(cross);animated.push({g:item,phase:i+j*1.4,kind:'stone'});}else{const bush=new T.Mesh(sphere,new T.MeshStandardMaterial({color:0x27352b,roughness:1}));bush.scale.set(.42,.40,.35);bush.position.y=.38;item.add(bush);for(const side of [-1,1]){const eye=new T.Mesh(sphere,new T.MeshBasicMaterial({color:0xf6ca60}));eye.position.set(side*.10,.43,.335);eye.scale.set(.045,.07,.025);item.add(eye);}}}extraYards.push(g);}
  // Three ghost kites and a slowly orbiting lantern constellation over the village square.
  for(let i=0;i<3;i++){const g=new T.Group();g.name='Ghost kite';g.position.set(-4+i*3.7,6+i*.5,9);root.add(g);const cloth=new T.Mesh(new T.ConeGeometry(.38,1.05,18,1,true),new T.MeshStandardMaterial({color:0xe7e0ed,side:T.DoubleSide,roughness:.9}));cloth.rotation.z=Math.PI;g.add(cloth);for(const side of [-1,1]){const eye=new T.Mesh(sphere,new T.MeshBasicMaterial({color:0x20172b}));eye.position.set(side*.09,.18,.22);eye.scale.set(.038,.07,.02);g.add(eye);}const string=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0,-.45,0),new T.Vector3(.4,-2.5,0),new T.Vector3(.2,-4.6,0)]),new T.LineBasicMaterial({color:0x998cac,transparent:true,opacity:.4}));g.add(string);animated.push({g,phase:i*2,kind:'kite',base:g.position.clone()});}
  const orbit=new T.Group();orbit.name='Will-o’-the-wisp lantern constellation';orbit.position.set(0,4.6,5);root.add(orbit);for(let i=0;i<9;i++){const a=i/9*Math.PI*2,l=new T.Mesh(new T.OctahedronGeometry(.13),new T.MeshBasicMaterial({color:[0xffb754,0xc290ff,0x8fd6bd][i%3]}));l.position.set(Math.cos(a)*3.3,Math.sin(a*3)*.4,Math.sin(a)*3.3);orbit.add(l);}animated.push({g:orbit,kind:'orbit',phase:0});
  const lot=lots.find(l=>l.house.id===plan.laserId);if(lot){const projector=addAt(new T.Group(),lot,7.3,-4.3);projector.name='Moonbeam house laser projector';const body=new T.Mesh(new T.BoxGeometry(.38,.20,.32),poleMat);body.position.y=.42;body.rotation.x=-.3;projector.add(body);const lens=new T.Mesh(new T.CylinderGeometry(.065,.065,.045,12),new T.MeshBasicMaterial({color:0x8dff72}));lens.rotation.x=Math.PI/2;lens.position.set(0,.45,-.19);projector.add(lens);for(const side of [-1,1]){const leg=new T.Mesh(new T.CylinderGeometry(.018,.025,.45,8),poleMat);leg.position.set(side*.13,.21,0);leg.rotation.z=side*.4;projector.add(leg);}extraYards.push(projector);}
 }
 let disposed=false;
 return {root,plan,inflatables,flags,bulbs,extraYards,bounds,lasers,bindHouse(id,house,entrance){if(id!==plan.laserId||!entrance||disposed)return;this.unbindHouse(id);lasers.set(id,installHouseLaser(T,house,{origin:entrance.position,normal:[Math.sin(entrance.rotationY),0,Math.cos(entrance.rotationY)],reducedMotion}));},unbindHouse(id){lasers.get(id)?.dispose();lasers.delete(id);},blocked(x,z,r=.22){return bounds.some(b=>x>b.minX-r&&x<b.maxX+r&&z>b.minZ-r&&z<b.maxZ+r);},tick(time,player=[0,0,0]){if(disposed)return;for(const a of animated){if(a.kind==='inflatable'){a.g.scale.copy(a.g.userData.baseScale);if(!reducedMotion){a.g.scale.y*=1+Math.sin(time*.0013+a.phase)*.018;a.g.rotation.z=Math.sin(time*.0007+a.phase)*.022;}}else if(!reducedMotion){if(a.kind==='stone')a.g.rotation.z=Math.sin(time*.0012+a.phase)*.10;if(a.kind==='kite'){a.g.position.copy(a.base);a.g.position.x+=Math.sin(time*.0005+a.phase)*.45;a.g.rotation.z=Math.sin(time*.0008+a.phase)*.12;}if(a.kind==='orbit')a.g.rotation.y=time*.000075;}}
 for(const f of flags){const p=f.flag.geometry.attributes.position;if(!reducedMotion)for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,Math.sin(time*.0018+f.phase+x*4)*.055*(x+.365)/.73);}p.needsUpdate=!reducedMotion;}
 for(const show of lasers.values())show.update(time/1000);
 },dispose(){if(disposed)return;disposed=true;for(const show of lasers.values())show.dispose();lasers.clear();for(const map of maps)map?.dispose();}};
}

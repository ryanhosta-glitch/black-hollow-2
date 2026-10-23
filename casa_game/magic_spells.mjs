import {disposeGroup} from './resources.mjs';

export const SPELLS = {
 witchlight: {name:'Witchlight',line:'A lantern for things the house has forgotten.',instruction:'Cast near an etched witch mark to wake it. Follow the golden moth.',color:0xffd18b},
 wildbloom: {name:'Wildbloom',line:'Even the dark is allowed to grow something beautiful.',instruction:'An impossible moonflower garden unfurls around you.',color:0xf39dc9},
 starweave: {name:'Starweave',line:'Borrow a little sky. Give it a shape.',instruction:'Stitch a living constellation into the air.',color:0x9fdbed}
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function glowPoints(T,color,count,seed){
 const positions=new Float32Array(count*3),phases=new Float32Array(count);let n=seed>>>0;
 const rand=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
 for(let i=0;i<count;i++){const a=rand()*Math.PI*2,r=.25+rand()*1.15;positions.set([Math.cos(a)*r,rand()*1.65+.15,Math.sin(a)*r],i*3);phases[i]=rand()*6.28;}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('phase',new T.BufferAttribute(phases,1));
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{tint:{value:new T.Color(color)},time:{value:0},alpha:{value:1},motion:{value:1}},vertexShader:`attribute float phase;uniform float time;uniform float motion;varying float light;void main(){vec3 p=position;float t=time*.45+phase;p.x+=sin(t)*.16*motion;p.y+=sin(t*.8)*.12*motion;p.z+=cos(t)*.16*motion;vec4 v=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*v;gl_PointSize=clamp(24./max(.25,-v.z),2.,22.);light=.65+.25*sin(phase);}`,fragmentShader:`uniform vec3 tint;uniform float alpha;varying float light;void main(){float d=length(gl_PointCoord-.5)*2.;float a=pow(max(0.,1.-d),2.);gl_FragColor=vec4(tint,a*alpha*light);}`});
 return new T.Points(geometry,material);
}
function petalGeometry(T){const s=new T.Shape();s.moveTo(0,0);s.bezierCurveTo(-.18,.16,-.14,.45,0,.55);s.bezierCurveTo(.14,.45,.18,.16,0,0);return new T.ShapeGeometry(s,10);}
function starGeometry(T){const s=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?.045:.13;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?s.lineTo(x,y):s.moveTo(x,y);}s.closePath();return new T.ShapeGeometry(s);}

/** A single cast uses a bounded scene graph, no lights, no collision, and no external assets. */
export function createSpellPerformance(T,kind,position,{seed=1,reducedMotion=false,power=0,duration=12}={}){
 kind=SPELLS[kind]?kind:'witchlight';const root=new T.Group();root.name=SPELLS[kind].name+' · living spell';root.position.fromArray(position);
 const gold=new T.MeshBasicMaterial({color:0xffd18b,transparent:true,opacity:.85,side:T.DoubleSide,depthWrite:false});
 const color=new T.MeshBasicMaterial({color:SPELLS[kind].color,transparent:true,opacity:.9,side:T.DoubleSide,depthWrite:false});
 const green=new T.MeshBasicMaterial({color:0x70cba1,transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false});
 const white=new T.MeshBasicMaterial({color:0xf0e9ce,transparent:true,opacity:.9,side:T.DoubleSide,depthWrite:false});
 const materials=[gold,color,green,white],animated=[];let age=0,disposed=false;
 const add=(geometry,material,x=0,y=0,z=0)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);root.add(m);return m;};
 const circle=(radius,y,material=gold)=>{const m=add(new T.TorusGeometry(radius,.009,5,72),material,0,y,0);m.rotation.x=-Math.PI/2;return m;};
 const points=glowPoints(T,SPELLS[kind].color,kind==='wildbloom'?48:80,seed);points.material.uniforms.motion.value=reducedMotion?0:1;root.add(points);
 circle(.72,.035);circle(.84,.04,color);
 if(kind==='witchlight'){
  for(let j=0;j<3;j++){const path=[];for(let i=0;i<=64;i++){const u=i/64,a=u*Math.PI*3+j*Math.PI*2/3;path.push(new T.Vector3(Math.cos(a)*(.65-u*.35),.12+u*1.9,Math.sin(a)*(.65-u*.35)));}const ribbon=add(new T.TubeGeometry(new T.CatmullRomCurve3(path),80,.009,5,false),j===0?gold:color);animated.push({object:ribbon,spin:(j%2?1:-1)*.12});}
  const glass=add(new T.IcosahedronGeometry(.12,1),white,0,1.6,0);animated.push({object:glass,bob:.07});
  const moth=new T.Group();moth.name='The golden familiar';moth.position.set(0,1.65,0);root.add(moth);const wing=petalGeometry(T),wings=[];
  for(const side of [-1,1]){const mesh=new T.Mesh(wing,gold);mesh.scale.set(side*.7,.6,1);mesh.rotation.z=-side*.9;moth.add(mesh);wings.push(mesh);}animated.push({object:moth,bob:.08,wings});
 }else if(kind==='wildbloom'){
  const flowers=4+Math.min(4,Math.floor(power/2)),petals=new T.InstancedMesh(petalGeometry(T),color,flowers*8),leaves=new T.InstancedMesh(petalGeometry(T),green,flowers*2),stems=new T.InstancedMesh(new T.CylinderGeometry(.012,.018,1,6),green,flowers),hearts=new T.InstancedMesh(new T.SphereGeometry(.065,10,8),white,flowers),dummy=new T.Object3D();root.add(petals,leaves,stems,hearts);
  for(let i=0;i<flowers;i++){const a=i*Math.PI*2/flowers,r=.55+(i%2)*.25,x=Math.cos(a)*r,z=Math.sin(a)*r,h=.45+(i%3)*.17;dummy.position.set(x,h/2,z);dummy.rotation.set(0,0,0);dummy.scale.set(1,h,1);dummy.updateMatrix();stems.setMatrixAt(i,dummy.matrix);dummy.position.set(x,h,z);dummy.scale.set(1,1,1);dummy.updateMatrix();hearts.setMatrixAt(i,dummy.matrix);
   for(let j=0;j<8;j++){dummy.position.set(x,h,z);const angle=j*Math.PI/4+a;dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(Math.cos(angle),.28,Math.sin(angle)).normalize());dummy.scale.set(.65,.65,1);dummy.updateMatrix();petals.setMatrixAt(i*8+j,dummy.matrix);}
   for(let j=0;j<2;j++){dummy.position.set(x,h*.45,z);const angle=(j?Math.PI:0)+a;dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(Math.cos(angle),.7,Math.sin(angle)).normalize());dummy.scale.set(.45,.55,1);dummy.updateMatrix();leaves.setMatrixAt(i*2+j,dummy.matrix);}
  }
  for(const mesh of [petals,leaves,stems,hearts]){mesh.instanceMatrix.needsUpdate=true;animated.push({object:mesh,grow:true});}
 }else{
  const anchors=[];for(let i=0;i<9;i++){const a=i*Math.PI*2/9;anchors.push(new T.Vector3(Math.cos(a)*.85,.75+(i%3)*.32,Math.sin(a)*.85));}
  const positions=[];for(let i=0;i<9;i++){positions.push(...anchors[i].toArray(),...anchors[(i+4)%9].toArray());}
  const thread=new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(positions,3)),new T.LineBasicMaterial({color:0xbde8f3,transparent:true,opacity:.75,depthWrite:false}));root.add(thread);materials.push(thread.material);animated.push({object:thread,spin:.08});
  const stars=new T.InstancedMesh(starGeometry(T),white,9),dummy=new T.Object3D();anchors.forEach((p,i)=>{dummy.position.copy(p);dummy.rotation.set(0,i*.7,0);dummy.updateMatrix();stars.setMatrixAt(i,dummy.matrix);});stars.instanceMatrix.needsUpdate=true;root.add(stars);animated.push({object:stars,spin:.08});circle(.58,.6,color).rotation.x=.35;circle(.64,.6,gold).rotation.z=.9;
 }
 const originalOpacity=materials.map(m=>m.opacity);
 return {root,kind,get age(){return age;},get expired(){return age>=duration;},tick(dt){if(disposed)return;age+=clamp(Number.isFinite(dt)?dt:0,0,.1);const grow=reducedMotion?1:Math.min(1,age/1.8),fade=Math.min(1,age/.35,Math.max(0,(duration-age)/1.5));materials.forEach((m,i)=>m.opacity=originalOpacity[i]*(reducedMotion?Math.min(1,Math.max(0,(duration-age)/1.5)):fade));points.material.uniforms.time.value=reducedMotion?0:age;points.material.uniforms.alpha.value=fade;for(const a of animated){if(a.grow)a.object.scale.y=Math.max(.02,grow);if(reducedMotion)continue;if(a.spin)a.object.rotation.y=age*a.spin;if(a.bob)a.object.position.y=1.65+Math.sin(age*.9)*a.bob;if(a.wings)for(let i=0;i<2;i++)a.wings[i].rotation.y=Math.sin(age*5)*(i?-1:1)*.35;}},dispose(){if(disposed)return;disposed=true;disposeGroup(root);}};
}

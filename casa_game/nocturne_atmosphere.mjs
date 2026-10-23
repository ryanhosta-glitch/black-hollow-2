/** Wall mounted detail leaves stair and quest routes clear. */
export function createNocturneAtmosphere(T,{reducedMotion=false}={}){
 const root=new T.Group();root.name='Nocturne velvet and moonlight';
 const gold=new T.MeshStandardMaterial({color:0xb08a4a,metalness:.7,roughness:.38}),velvet=new T.MeshStandardMaterial({color:0x480e23,roughness:1,side:T.DoubleSide}),glass=new T.MeshStandardMaterial({color:0x536985,emissive:0x334d78,emissiveIntensity:.65,roughness:.3});const curtains=[],lights=[];
 function add(geo,mat,x,y,z,parent=root){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
 for(const side of [-1,1])for(const z of [-8,0,8]){
  const bay=new T.Group();bay.position.set(side*11.38,6.8,z);bay.rotation.y=-side*Math.PI/2;root.add(bay);
  const shape=new T.Shape();shape.moveTo(-1,-1.8);shape.lineTo(1,-1.8);shape.lineTo(1,.65);shape.quadraticCurveTo(.9,1.55,0,2.25);shape.quadraticCurveTo(-.9,1.55,-1,.65);shape.closePath();add(new T.ShapeGeometry(shape,24),glass,0,0,0,bay);
  bay.add(new T.Line(new T.BufferGeometry().setFromPoints(shape.getPoints(48).map(p=>new T.Vector3(p.x,p.y,.06))),new T.LineBasicMaterial({color:0xc29a58})));
  for(const x of [-.5,0,.5])add(new T.BoxGeometry(.045,2.7,.05),gold,x,-.45,.08,bay);add(new T.BoxGeometry(2,.06,.05),gold,0,-.7,.08,bay);add(new T.BoxGeometry(3.2,.15,.15),gold,0,2.4,.15,bay);
  for(const s of [-1,1]){const geo=new T.PlaneGeometry(.76,4.75,14,24),a=geo.attributes.position;for(let i=0;i<a.count;i++)a.setZ(i,.12+Math.cos(a.getX(i)*38)*.095);geo.computeVertexNormals();const cloth=add(geo,velvet,s*1.32,-.03,.18,bay);curtains.push({cloth,base:new Float32Array(a.array),phase:z+s});add(new T.TorusGeometry(.24,.035,6,16),gold,s*1.32,-.65,.25,bay).scale.y=.45;}
  const light=new T.PointLight(0xffbe75,8,7,2);light.position.set(0,-.7,.65);bay.add(light);lights.push(light);
 }
 const web=[];for(const side of [-1,1])for(const z of [-14,14]){const o=new T.Vector3(side*11.3,13.3,z),ends=[];for(let i=0;i<9;i++){const a=i/8*Math.PI/2;ends.push(new T.Vector3(o.x-side*Math.cos(a)*2.6,o.y-Math.sin(a)*2.1,z));web.push(...o.toArray(),...ends[i].toArray());}for(let r=1;r<=6;r++)for(let i=0;i<8;i++){const a=o.clone().lerp(ends[i],r/6),b=o.clone().lerp(ends[i+1],r/6),mid=a.clone().lerp(b,.5);mid.y-=.055;web.push(...a.toArray(),...mid.toArray(),...mid.toArray(),...b.toArray());}}
 root.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(web,3)),new T.LineBasicMaterial({color:0xc9c6bc,transparent:true,opacity:.23,depthWrite:false})));
 const p=new Float32Array(720);let seed=193;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let i=0;i<240;i++){p[i*3]=(rnd()-.5)*22;p[i*3+1]=1+rnd()*12;p[i*3+2]=(rnd()-.5)*28;}const dust=new T.Points(new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(p,3)),new T.PointsMaterial({color:0xd8c8aa,size:.025,transparent:true,opacity:.32,depthWrite:false}));dust.name='Dust in candlelight';root.add(dust);
 root.userData.tick=time=>{const t=reducedMotion?0:time*.001;for(const{cloth,base,phase}of curtains){const a=cloth.geometry.attributes.position;for(let i=0;i<a.count;i++)a.setZ(i,base[i*3+2]+Math.sin(t*.65+base[i*3]*4+phase)*.035*(2.375-base[i*3+1])/4.75);a.needsUpdate=true;}for(let i=0;i<lights.length;i++)lights[i].intensity=8*(1+(reducedMotion?0:.035*Math.sin(t*2.1+i)));dust.position.y=reducedMotion?0:Math.sin(t*.13)*.12;};return root;
}

/** All moving shapes remain inside the route's yaw-invariant circular envelope. */
export function createPhantomCarriage(T,vehicle){
 const root=new T.Group();root.name='Victorian phantom carriage';const mats={wood:new T.MeshStandardMaterial({color:0x302126,roughness:.75}),brass:new T.MeshStandardMaterial({color:0xb29a62,metalness:.55,roughness:.58}),velvet:new T.MeshStandardMaterial({color:0x27324b,roughness:.98}),iron:new T.MeshStandardMaterial({color:0x131923,roughness:.8})},boxes=new Map(),put=(x,y,z,w,h,d,mat)=>{if(!boxes.has(mat))boxes.set(mat,[]);boxes.get(mat).push({p:[x,y,z],s:[w,h,d]});};
 put(0,.35,0,.42,.12,.42,mats.wood);put(0,.44,0,.40,.09,.38,mats.velvet);put(0,.72,.18,.40,.48,.055,mats.wood);put(0,.72,.142,.35,.39,.025,mats.velvet);
 for(const x of [-.21,.21]){put(x,.60,0,.025,.05,.42,mats.brass);for(const z of [-.19,.19]){put(x,1.04,z,.018,1.35,.018,mats.brass);put(x,.18,z,.04,.24,.04,mats.iron);}}
 put(0,.65,-.205,.43,.025,.025,mats.brass);put(0,1.72,0,.45,.035,.45,mats.wood);for(const z of [-.20,.20])put(0,1.745,z,.43,.025,.018,mats.brass);
 const temp=new T.Object3D();for(const [material,parts]of boxes){const mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),material,parts.length);parts.forEach((p,i)=>{temp.position.fromArray(p.p);temp.scale.fromArray(p.s);temp.rotation.set(0,0,0);temp.updateMatrix();mesh.setMatrixAt(i,temp.matrix);});root.add(mesh);}
 const wheels=new T.InstancedMesh(new T.CylinderGeometry(.055,.055,.028,12),mats.brass,4);let i=0;for(const x of [-.23,.23])for(const z of [-.135,.135]){temp.position.set(x,.19,z);temp.rotation.set(0,0,Math.PI/2);temp.scale.set(1,1,1);temp.updateMatrix();wheels.setMatrixAt(i++,temp.matrix);}root.add(wheels);root.scale.set(vehicle.radius/.34,vehicle.height/1.85,vehicle.radius/.34);
 return {root,eyeHeight:1.22*vehicle.height/1.85};
}

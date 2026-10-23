/** Organic silhouettes at Forge-planned tree anchors, with the same ground collision plan. */
export function createGardenTrees(T,trees){
 const g=new T.Group();g.name='Old cemetery trees';const matrices=[],o=new T.Object3D(),up=new T.Vector3(0,1,0);let seed=813;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 function branch(a,b,r){const d=new T.Vector3().fromArray(b).sub(new T.Vector3().fromArray(a));o.position.fromArray(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(up,d.clone().normalize());o.scale.set(r,d.length(),r);o.updateMatrix();matrices.push(o.matrix.clone());}
 for(const tree of trees){const [x,y,z]=tree.positionMeters;let a=[x,y,z];for(let k=0;k<5;k++){const b=[x+Math.sin(k*.7)*.18,y+(k+1)*.65,z+k*.07];branch(a,b,.19-k*.025);a=b;}
  for(let k=0;k<9;k++){const angle=k*2.399+tree.rotationY,height=1.8+k*.18,length=.8+rnd()*.8,a=[x,y+height,z],b=[x+Math.cos(angle)*length,y+height+.5+rnd()*.4,z+Math.sin(angle)*length];branch(a,b,.055);for(let j=0;j<3;j++){const tip=[b[0]+Math.cos(angle+(j-1)*.65)*.6,b[1]+.35+j*.13,b[2]+Math.sin(angle+(j-1)*.65)*.6];branch(b,tip,.021);branch(tip,[tip[0]+Math.cos(angle+.7)*.25,tip[1]+.25,tip[2]+Math.sin(angle+.7)*.25],.008);}}
 }
 if(matrices.length){const geo=new T.CylinderGeometry(.5,1,1,7),mat=new T.MeshStandardMaterial({color:0x322c25,roughness:.95}),mesh=new T.InstancedMesh(geo,mat,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}return g;
}

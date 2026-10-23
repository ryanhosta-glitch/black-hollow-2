/** Decorative boxes become a few draws; interactive actors never enter this group. */
export function batchHallBoxes(T,group){
 group.updateWorldMatrix(true,true);const inverse=group.matrixWorld.clone().invert(),batches=new Map(),remove=[];
 group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.geometry?.type!=='BoxGeometry'||Array.isArray(o.material))return;const p=o.geometry.parameters,m=inverse.clone().multiply(o.matrixWorld).multiply(new T.Matrix4().makeScale(p.width,p.height,p.depth));if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(m);remove.push(o);});
 for(const o of remove){o.removeFromParent();o.geometry.dispose();}
 const geometry=new T.BoxGeometry(1,1,1);for(const[material,matrices]of batches){const mesh=new T.InstancedMesh(geometry,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.name='Batched gallery architecture';group.add(mesh);}
 return {original:remove.length,batches:batches.size};
}
/** Keep decorative emitters as light-source metadata. Atmosphere owns three actual shader lights. */
export function collectHallLights(T,group){
 group.updateWorldMatrix(true,true);const specs=[];group.traverse(o=>{if(!o.isPointLight)return;const position=o.getWorldPosition(new T.Vector3()).toArray();specs.push({position,color:o.color.getHex(),intensity:o.intensity,distance:o.distance||24});o.layers.set(31);});group.userData.hallLightSpecs=specs;return specs;
}
export function nearbyHallLights(specs,position){return [...specs].sort((a,b)=>b.intensity/(4+b.position.reduce((s,v,i)=>s+(v-position[i])**2,0))-a.intensity/(4+a.position.reduce((s,v,i)=>s+(v-position[i])**2,0))).slice(0,3);}

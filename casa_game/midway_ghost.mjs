import {createFabricGhost} from './fabric_ghost.mjs';
/** Reuses Trick or Treat's continuous cloth mesh; a small friendly mask reads from the rider's seat. */
export function createMidwayGhost(T,options={}){
 const ghost=createFabricGhost(T,{...options,detail:'crowd',reducedMotion:true});
 const eyes=new T.InstancedMesh(new T.SphereGeometry(1,8,6),new T.MeshBasicMaterial({color:0x152533}),2),stamp=new T.Object3D();
 for(const [i,x]of[-.082,.082].entries()){stamp.position.set(x,1.75,.18);stamp.scale.set(.026,.048,.018);stamp.updateMatrix();eyes.setMatrixAt(i,stamp.matrix);}eyes.name='Friendly spectral eye mask';ghost.add(eyes);return ghost;
}

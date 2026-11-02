import * as T from 'three';
import {pixelRadiance} from './fixture_output.mjs';
export function createEmitterMesh(positions,pixel=true){
 const mesh=new T.InstancedMesh(new T.SphereGeometry(pixel?.045:.12,8,6),new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}),positions.length),matrix=new T.Matrix4();
 positions.forEach((v,i)=>{matrix.makeTranslation(v.x,v.y,v.z);mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new T.Color(0,0,0));});return mesh;
}
export function setEmitterColor(mesh,index,color){mesh.setColorAt(index,new T.Color(...pixelRadiance(color)));mesh.instanceColor.needsUpdate=true;}

export function configurePreviewRenderer(renderer,{presentation=false}={}){renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=presentation?T.ACESFilmicToneMapping:T.NoToneMapping;renderer.toneMappingExposure=presentation?1.05:1;}

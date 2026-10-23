/** A scare must occupy the visible view and have an unobstructed path from the camera. */
export function scareSiteVisible(T,site,camera,occluders=[]){
 camera.updateMatrixWorld();
 const target=new T.Vector3(...site.positionMeters);target.y+=site.kind==='window'||site.kind==='reflection'?.19:.35;
 const screen=target.clone().project(camera);if(screen.z<-1||screen.z>1||Math.abs(screen.x)>.82||Math.abs(screen.y)>.82)return false;
 const start=camera.getWorldPosition(new T.Vector3()),direction=target.clone().sub(start),distance=direction.length();
 if(distance<.25)return false;
 const ray=new T.Raycaster(start,direction.normalize(),.05,Math.max(.05,distance-.12));
 return !ray.intersectObjects(occluders,true).some(hit=>hit.object.visible&&(!hit.object.material?.transparent||hit.object.material.opacity>.6));
}

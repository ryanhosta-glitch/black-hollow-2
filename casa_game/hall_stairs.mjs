/** Same bow for rendered treads, rails, and navigation. Endpoints retain the original landings. */
export function hallStairBow(z){const t=Math.max(0,Math.min(1,(z-4)/7));return 1.1*Math.sin(Math.PI*t);}
export function hallStairCenter(side,z){return side*(4.5+hallStairBow(z));}
export function curveCompiledHallStairs(T,root){
 if(root.userData.curvedStairs)return;root.userData.curvedStairs=true;
 const matrix=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();
 root.traverse(o=>{if(!o.isInstancedMesh)return;let changed=false;for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);matrix.decompose(p,q,s);
  if(p.y<.06||p.y>6.5||p.z<3.99||p.z>11.01||Math.abs(p.x)<2.5||Math.abs(p.x)>6.5)continue;
  // The four diagonal straight handrails need segmented curved replacements.
  if(s.y>8&&s.x<.1&&s.z<.1){matrix.makeScale(0,0,0);}else{p.x+=Math.sign(p.x)*hallStairBow(p.z);matrix.compose(p,q,s);}o.setMatrixAt(i,matrix);changed=true;
 }if(changed){o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere();o.computeBoundingBox();}});
}

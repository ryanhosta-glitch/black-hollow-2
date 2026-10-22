// Animate the recovered wraith's existing skin, keeping its authored bind pose.
// Bone rotations are additive to a posed rest state; the mesh is never rebuilt.
export function createWraithMotion(THREE,model,{reducedMotion=false,seed=0}={}){
 const bones=new Map();model.traverse(o=>{if(o.isBone)bones.set(o.name,o);});
 const originals=new Map([...bones].map(([name,b])=>[name,b.quaternion.clone()]));
 const vector=new THREE.Vector3(),start=new THREE.Vector3(),end=new THREE.Vector3(),parentQ=new THREE.Quaternion(),worldQ=new THREE.Quaternion(),turn=new THREE.Quaternion(),delta=new THREE.Quaternion(),angles=new THREE.Euler();
 function aim(name,childName,target){
  const bone=bones.get(name),child=bones.get(childName);if(!bone||!child)return;
  model.updateWorldMatrix(true,true);bone.getWorldPosition(start);child.getWorldPosition(end);
  const direction=end.sub(start).normalize();vector.set(...target).transformDirection(model.matrixWorld);
  turn.setFromUnitVectors(direction,vector);bone.getWorldQuaternion(worldQ);bone.parent.getWorldQuaternion(parentQ);
  bone.quaternion.copy(parentQ.invert().multiply(turn).multiply(worldQ)).normalize();
 }
 // Relax the T-pose into a suspended, forward-reaching silhouette. Left/right
 // signs follow this asset's actual bone names (left is positive model X).
 for(const [side,sign]of [['l',1],['r',-1]]){
  aim('upperarm_'+side,'lowerarm_'+side,[sign*.32,-.83,.45]);
  aim('lowerarm_'+side,'hand_'+side,[sign*.20,-.30,.93]);
  aim('thigh_'+side,'calf_'+side,[sign*.035,-.99,.12]);
  aim('calf_'+side,'foot_'+side,[sign*.02,-.94,-.34]);
 }
 const posed=new Map([...bones].map(([name,b])=>[name,b.quaternion.clone()]));
 const phase=(seed%97)/97*Math.PI*2;
 function rotate(name,x=0,y=0,z=0){const bone=bones.get(name),base=posed.get(name);if(!bone)return;angles.set(x,y,z);delta.setFromEuler(angles);bone.quaternion.copy(base).multiply(delta).normalize();}
 let disposed=false;
 function update(milliseconds){
  if(disposed||reducedMotion)return;
  const t=milliseconds/1000,p=t*.82+phase;
  rotate('pelvis',Math.sin(p)*.025,Math.sin(p*.5)*.035,Math.cos(p)*.025);
  for(let i=1;i<=3;i++)rotate('spine_0'+i,Math.sin(p-.4*i)*.025,Math.sin(p*.5-.3*i)*.025,Math.cos(p-.5*i)*.025);
  rotate('neck_01',Math.sin(p*.7)*.025,Math.sin(p*.5)*.035,Math.cos(p*.6)*.025);
  rotate('Head',Math.sin(p*.7-.5)*.055,Math.sin(p*.5-.6)*.09,Math.cos(p*.6-.5)*.045);
  for(const [side,sign]of [['l',1],['r',-1]]){
   const wave=p+(sign===1?0:1.25);
   rotate('clavicle_'+side,Math.sin(wave)*.035,Math.cos(wave)*.025,sign*Math.sin(wave)*.045);
   rotate('upperarm_'+side,Math.sin(wave)*.12,Math.sin(wave*.5)*.08,sign*Math.cos(wave)*.08);
   rotate('lowerarm_'+side,Math.sin(wave-.7)*.18,0,sign*Math.cos(wave-.5)*.06);
   rotate('hand_'+side,Math.sin(wave-1.1)*.12,Math.cos(wave-1)*.07,Math.sin(wave-.9)*.10);
   for(const [i,finger]of ['index','middle','ring','pinky','thumb'].entries())for(let joint=1;joint<=3;joint++){
    rotate(finger+'_0'+joint+'_'+side,0,sign*(.12+Math.sin(wave-i*.23-joint*.25)*.075),0);
   }
   rotate('thigh_'+side,Math.sin(wave*.7)*.095,Math.sin(wave*.5)*.035,sign*Math.cos(wave*.7)*.035);
   rotate('calf_'+side,Math.sin(wave*.7-.6)*.10,0,0);
   rotate('foot_'+side,Math.sin(wave*.7-1.2)*.09,0,sign*Math.cos(wave*.5)*.035);
  }
 }
 update(0);model.updateWorldMatrix(true,true);
 return {update,jointCount:bones.size,dispose(){if(disposed)return;disposed=true;for(const[name,bone]of bones)bone.quaternion.copy(originals.get(name));bones.clear();posed.clear();originals.clear();}};
}

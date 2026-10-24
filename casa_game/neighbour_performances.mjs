// Metres in the resident scene's local coordinates; performance time pauses with the game.
export function createFetchPerformance({dog,player,direction=[1,0]}={}){
 const origin=[...dog],hand=[player[0],1.05,player[2]],length=Math.hypot(...direction)||1,axis=direction.map(v=>v/length);
 if(axis[0]*(origin[0]-player[0])+axis[1]*(origin[2]-player[2])<0){axis[0]*=-1;axis[1]*=-1;}
 const target=[origin[0]+axis[0]*3.1,.16,origin[2]+axis[1]*3.1];
 const dx=player[0]-origin[0],dz=player[2]-origin[2],d=Math.hypot(dx,dz)||1;
 const returned=[player[0]-dx/d*.85,origin[1],player[2]-dz/d*.85];
 const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*Math.max(0,Math.min(1,t)));
 return {origin,target,hand,returned,frame(age,{reducedMotion=false}={}){
  const phase=age<.9?'throw':age<2.8?'chase':age<3.3?'pickup':age<5.8?'carry':age<6.5?'drop':'complete';
  let position=age<.45?origin:age<2.8?lerp(origin,[target[0],origin[1],target[2]],(age-.45)/2.35):age<3.3?[target[0],origin[1],target[2]]:lerp([target[0],origin[1],target[2]],returned,(age-3.3)/2.5);
  const from=age<3.3?origin:target,aim=age<3.3?target:returned,yaw=Math.atan2(aim[0]-from[0],aim[2]-from[2]);
  let bone=age<.9?lerp(hand,target,age/.9):target;
  if(age<.9)bone[1]+=Math.sin(Math.min(1,age/.9)*Math.PI)*1.0;
  if(age>=5.8)bone=[returned[0],.15,returned[2]+.35];
  if(reducedMotion){position=origin;bone=[origin[0],age<5.8?.72:.15,origin[2]+.55];}
  return {phase,position,yaw,walking:!reducedMotion&&(age>.45&&age<2.8||age>3.3&&age<5.8),carried:phase==='carry'||phase==='pickup'&&age>=3.05,bone,complete:phase==='complete'};
 }};
}

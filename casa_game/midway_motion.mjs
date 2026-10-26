const point=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite),distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const yawTo=(a,b)=>Math.atan2(-(b[0]-a[0]),-(b[2]-a[2]));
const angle=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
/** A single bounded clock. Transfer endpoints never become an interpolated segment. */
export function createMidwayMotion(plan,{onScene=()=>{},onTransfer=()=>{},onComplete=()=>{},onRoom=()=>{}}={}){
 if(!plan?.validation?.valid||!point(plan.boarding?.positionMeters)||!plan.legs?.length)throw Error('A validated ride plan is required');
 let state='boarding',index=0,segment=0,travelled=0,elapsed=0,speed=0,multiplier=1,position=[...plan.boarding.positionMeters],roomId=plan.boarding.roomId,yaw=0,entered=false,suspended=false,manual=false;
 const fail=message=>{state='failed';speed=0;throw Error(message);};
 function enter(){const leg=plan.legs[index];entered=true;elapsed=0;segment=0;travelled=0;if(!leg){state='unloading';speed=0;onComplete();return;}if(roomId!==leg.roomId||distance(position,leg.points[0])>.003)return fail('Ride continuity changed');if(leg.kind==='scene')onScene(leg);if(leg.kind==='transfer'){state='transfer';speed=0;onTransfer(leg);}}
 function advance(){index++;entered=false;segment=0;travelled=0;elapsed=0;}
 return {
  board(){if(state!=='boarding')return false;state='running';return true;},
  pause(){manual=true;speed=0;},resume(){manual=false;},setSuspended(value){suspended=!!value;speed=0;},
  setSpeed(value){if(!Number.isFinite(value)||value<.35||value>1.25)throw Error('Ride speed must be between 0.35 and 1.25');multiplier=value;},
  completeTransfer({fullyOccluded=false}={}){if(state!=='transfer'||!fullyOccluded)throw Error('Floor transfer requires a fully occluded carriage');const leg=plan.legs[index];if(leg.interpolate!==false||!leg.requiresFullOcclusion)throw Error('Unsafe floor transfer');position=[...leg.points[1]];roomId=leg.toRoomId;advance();const next=plan.legs[index],toward=next?.points?.find(p=>distance(p,position)>1e-6);if(toward&&['room','portal'].includes(next.kind))yaw=yawTo(position,toward)+(next.drive==='reverse'?Math.PI:0);state='running';onRoom(roomId);},
  tick(delta){if(!Number.isFinite(delta)||delta<0)throw Error('Invalid ride time');if(state!=='running'||suspended||manual)return;const dt=Math.min(.05,delta);if(!entered)enter();if(state!=='running')return;const leg=plan.legs[index];if(!leg)return;
   if(['scene','turn'].includes(leg.kind)){speed=0;elapsed+=dt;if(elapsed>=leg.durationSeconds)advance();return;}
   if(!['room','portal'].includes(leg.kind))return fail('Unsupported carriage movement');
   // Every chord of the validated polyline is followed exactly. No post-load spline overshoot.
   while(segment<leg.points.length-1&&distance(leg.points[segment],leg.points[segment+1])<1e-7)segment++;
   if(segment>=leg.points.length-1){if(leg.toRoomId&&roomId!==leg.toRoomId){roomId=leg.toRoomId;onRoom(roomId);}advance();return;}
   const a=leg.points[segment],b=leg.points[segment+1],length=distance(a,b),targetYaw=yawTo(a,b)+(leg.drive==='reverse'?Math.PI:0),difference=angle(yaw,targetYaw);
   // Stop before an abrupt corner rather than steering a body off the checked path.
   if(travelled===0&&Math.abs(difference)>.32){speed=0;yaw+=Math.sign(difference)*Math.min(Math.abs(difference),dt*.9);return;}
   yaw+=Math.sign(difference)*Math.min(Math.abs(difference),dt*.9);
   const stop=leg.stopPointIndices?.includes(segment+1)||segment===leg.points.length-2,remaining=length-travelled,top=(plan.vehicle.speed||.6)*multiplier,target=Math.min(top,stop?Math.sqrt(Math.max(0,2*.45*remaining)):top);speed+=Math.sign(target-speed)*Math.min(Math.abs(target-speed),dt*.45);
   const step=Math.min(remaining,Math.max(.004,speed)*dt);travelled+=step;const t=Math.min(1,travelled/length);position=a.map((v,i)=>v+(b[i]-v)*t);
   if(t>=1-1e-8){position=[...b];segment++;travelled=0;if(stop)speed=0;}
  },
  dispose(){state='disposed';speed=0;},
  get state(){return state;},get paused(){return manual||suspended;},get pose(){return {position:[...position],roomId,yaw,speed,index,state,paused:manual||suspended};},get leg(){return plan.legs[index];},get progress(){return Math.min(1,index/plan.legs.length);}
 };
}

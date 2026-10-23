import {seedNumber} from './session.mjs';
export const SCARE_LEVELS={gentle:{cooldown:85000,chance:0,scale:.45},spooky:{cooldown:55000,chance:.40,scale:.75},intense:{cooldown:35000,chance:.65,scale:1}};
/** Gameplay time only; no timers, damage, camera takeover, flashing, or movement locks. */
export function createScareDirector({sites=[],seed=1,seen={},quiet={nextAt:0},options={},onEvent=()=>{}}={}){
 let previousTime=null,room=null,dwell=0,travel=0,previousPosition=null,active=null,warmup=0;
 function cancel(time=previousTime||0){if(active){onEvent({phase:'cancel',...active});active=null;quiet.nextAt=Math.max(quiet.nextAt,time+12000);}dwell=0;travel=0;}
 return {get active(){return active;},cancel,tick(time,position,roomId,{yaw=0,enabled=true,reducedMotion=false,canSeeSite=()=>true}={}){
  const dt=previousTime===null?0:Math.max(0,Math.min(100,time-previousTime));previousTime=time;
  const level=SCARE_LEVELS[options.level]||SCARE_LEVELS.spooky;
  if(!enabled||!Array.isArray(position)||!position.every(Number.isFinite)){cancel(time);previousPosition=null;return;}
  warmup+=dt;
  if(roomId!==room){cancel(time);room=roomId;previousPosition=null;}
  if(previousPosition)travel+=Math.min(.25,Math.hypot(position[0]-previousPosition[0],position[2]-previousPosition[2]));previousPosition=[...position];dwell+=dt;
  if(active&&!active.misdirection&&(reducedMotion||options.level==='gentle')){cancel(time);return;}
  if(active&&!active.struck&&!canSeeSite(active.site)){delete seen[active.site.id];cancel(time);return;}
  if(active){active.elapsed+=dt;const cue=active.buildupMs;if(!active.struck&&active.elapsed>=cue){active.struck=true;onEvent({phase:active.misdirection?'misdirection':'impact',...active,intensity:level.scale,reducedMotion});}if(active.elapsed>=cue+active.durationMs){onEvent({phase:'aftermath',...active});active=null;}return;}
  if(warmup<15000||dwell<6500||travel<.65||time<quiet.nextAt)return;
  const eligible=sites.filter(s=>s.roomId===roomId&&!seen[s.id]&&Math.abs(position[1]-s.groundY)<.45&&Math.hypot(s.positionMeters[0]-position[0],s.positionMeters[2]-position[2])>=1.25&&Math.hypot(s.positionMeters[0]-position[0],s.positionMeters[2]-position[2])<7);
  const visible=eligible.filter(s=>{const dx=s.positionMeters[0]-position[0],dz=s.positionMeters[2]-position[2],len=Math.hypot(dx,dz);return (-Math.sin(yaw)*dx-Math.cos(yaw)*dz)/len>.25;});
  const clearView=visible.filter(canSeeSite);if(!clearView.length)return;const site=clearView.slice().sort((a,b)=>seedNumber(seed+':'+a.id)-seedNumber(seed+':'+b.id))[0],roll=seedNumber(seed+':'+site.id+':reveal')/4294967296;
  const misdirection=reducedMotion||options.level==='gentle'||roll>=level.chance;seen[site.id]=misdirection?'heard':'seen';quiet.nextAt=time+level.cooldown;travel=0;
  active={site,misdirection,elapsed:0,struck:false,buildupMs:1800+seedNumber(site.id+seed)%1900,durationMs:site.kind==='ceiling'?2400:1600};onEvent({phase:'buildup',...active,intensity:level.scale,reducedMotion});
 }};
}

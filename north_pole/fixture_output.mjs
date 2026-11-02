import {profile} from './fixture_channels.mjs';
const emitters=new Set(['red','green','blue','white','amber','uv']);
// Profile-aware output: scale the master dimmer OR emitter channels, never both.
// Unpatched and discrete-function addresses remain untouched, including blackout.
export function applyOutputMaster(universes,fixtures,{master=1,blackout=false}={}){
 if(!Number.isFinite(master))throw Error('Master intensity must be a finite number.');
 const gain=blackout?0:Math.max(0,Math.min(1,master)),out=new Map([...universes].map(([u,b])=>[u,new Uint8Array(b)])),addresses=new Map();
 for(const f of fixtures){const p=profile(f.profileId);if(!p)throw Error('Unknown fixture profile.');const roles=p.channels,hasDimmer=roles.includes('dimmer'),count=p.pixel?f.nodes:1;
  for(let node=0;node<count;node++)for(let i=0;i<roles.length;i++){const role=roles[i];if(hasDimmer?role!=='dimmer':!emitters.has(role))continue;const set=addresses.get(f.universe)||new Set();set.add(f.address-1+node*roles.length+i);addresses.set(f.universe,set);}}
 for(const [u,set]of addresses){const bytes=out.get(u);if(bytes)for(const i of set)bytes[i]=Math.round(bytes[i]*gain);}return out;
}
export function shutterState(f,universes,seconds,{reducedMotion=false}={}){
 const p=profile(f.profileId),index=p.channels.indexOf('strobe');if(index<0)return {gain:1,active:false,approximate:false};
 const value=(universes.get(f.universe)||[])[f.address-1+index]||0;
 const range=p.ranges?.strobe?.find(r=>value>=r.min&&value<=r.max);const active=Boolean(range&&/strobe active/i.test(range.label));
 if(!active)return {gain:1,active:false,approximate:false};
 // Manufacturer chart gives a slow-to-fast range but no calibrated frequency.
 // This deterministic 1–8 Hz envelope is illustrative, not fixture photometry.
 const hz=1+7*(value-range.min)/Math.max(1,range.max-range.min),phase=((seconds*hz)%1+1)%1;
 return {gain:reducedMotion?1:(phase<.5?1:0),active:true,approximate:true,reducedMotion};
}
export function pixelRadiance(color){return color.map(v=>Math.max(0,Math.min(1,v)));}

export function fixtureTestLook(universes,fixtures){
 const out=new Map([...universes].map(([u,b])=>[u,new Uint8Array(b)]));
 for(const f of fixtures){const p=profile(f.profileId);if(!out.has(f.universe))out.set(f.universe,new Uint8Array(512));const bytes=out.get(f.universe),count=p.pixel?f.nodes:1;
  for(let node=0;node<count;node++)for(let i=0;i<p.channels.length;i++){const role=p.channels[i],level={dimmer:255,red:255,green:191,blue:102,white:0,amber:0,uv:0,strobe:0}[role];if(level!==undefined)bytes[f.address-1+node*p.channels.length+i]=level;}
 }return out;
}

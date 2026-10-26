const cache=new WeakMap();
/** A disposable worker keeps legacy archive conversion off the rendering thread. */
export function prepareMidwayRide(house,{timeout=20000}={}){
 if(cache.has(house))return cache.get(house).then(value=>structuredClone(value));
 const pending=new Promise((resolve,reject)=>{let worker,timer,done=false;const finish=(error,plan)=>{if(done)return;done=true;clearTimeout(timer);worker?.terminate();if(error){cache.delete(house);reject(error);}else resolve(plan);};
  try{worker=new Worker(new URL('./midway_worker.mjs',import.meta.url),{type:'module'});worker.onmessage=event=>event.data.error?finish(Error(event.data.error)):event.data.plan?.validation?.valid?finish(null,event.data.plan):finish(Error('This mansion has no safe carriage route.'));worker.onerror=()=>finish(Error('The attraction planner could not start.'));timer=setTimeout(()=>finish(Error('This mansion needs a smaller route before it can open.')),timeout);worker.postMessage({manifest:house.manifest,rooms:house.rooms,access:house.access,decoration:house.decoration,entries:house.entries});}catch(error){finish(error);}
 });cache.set(house,pending);pending.catch(()=>{if(cache.get(house)===pending)cache.delete(house);});return pending.then(value=>structuredClone(value));
}

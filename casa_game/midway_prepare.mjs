const cache=new WeakMap();
const aborted=()=>new DOMException('Attraction inspection cancelled.','AbortError');
/** Shared, disposable worker. Cancellation removes a subscriber; the last one terminates pending work. */
export function prepareMidwayRide(house,{timeout=20000,signal}={}){
 if(signal?.aborted)return Promise.reject(aborted());
 let entry=cache.get(house);
 if(!entry){
  let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});
  entry={promise,waiters:new Set(),done:false,finish:null};cache.set(house,entry);
  let worker,timer;
  entry.finish=(error,plan)=>{if(entry.done)return;entry.done=true;clearTimeout(timer);worker?.terminate();if(error){if(cache.get(house)===entry)cache.delete(house);reject(error);}else resolve(plan);};
  // Subscribers attach before construction, including synchronous Worker failures.
  queueMicrotask(()=>{if(entry.done)return;try{worker=new Worker(new URL('./midway_worker.mjs',import.meta.url),{type:'module'});worker.onmessage=e=>e.data.error?entry.finish(Error(e.data.error)):e.data.plan?.validation?.valid?entry.finish(null,e.data.plan):entry.finish(Error('This mansion has no safe carriage route.'));worker.onerror=()=>entry.finish(Error('The attraction planner could not start.'));timer=setTimeout(()=>entry.finish(Error('This mansion needs a smaller route before it can open.')),timeout);worker.postMessage({manifest:house.manifest,rooms:house.rooms,access:house.access,decoration:house.decoration,entries:house.entries});}catch(error){entry.finish(error);}});
 }
 const token={};entry.waiters.add(token);
 return new Promise((resolve,reject)=>{
  let settled=false;
  function release(){entry.waiters.delete(token);signal?.removeEventListener('abort',cancel);}
  function cancel(){if(settled)return;settled=true;release();reject(aborted());if(!entry.done&&!entry.waiters.size)entry.finish(aborted());}
  signal?.addEventListener('abort',cancel,{once:true});
  entry.promise.then(plan=>{if(settled)return;settled=true;release();resolve(structuredClone(plan));},error=>{if(settled)return;settled=true;release();reject(error);});
 });
}

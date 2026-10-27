import {stableRoomHash} from './room_profiles.mjs';
export const MIDWAY_PARK_LIMITS=Object.freeze({records:512,queuedChecks:4,concurrentChecks:1,profileCache:128,refreshSeconds:.3,visibleRange:58,cinematicSigns:8,performanceSigns:4,cinematicGuests:5,performanceGuests:3});
const text=(value,max)=>String(value??'').replace(/[\u0000-\u001f]/g,' ').slice(0,max);
export function midwayProfile(plan,id){
 const p=plan?.attraction;
 if(!plan?.validation?.valid||plan.houseId!==id||!p||typeof p.name!=='string'||!p.name.trim()||!Array.isArray(plan.coverage?.visited)||!plan.coverage.visited.length)throw Error('This mansion has no validated carriage route.');
 return {name:text(p.name,140),description:text(p.description,260),seed:Number.isFinite(p.seed)?p.seed:stableRoomHash(id),palette:/^#[\da-f]{6}$/i.test(p.palette)?p.palette:'#bfa56a',intensity:Number.isFinite(p.intensity)?Math.max(1,Math.min(5,Math.round(p.intensity))):2,estimatedSeconds:Number.isFinite(p.estimatedSeconds)&&p.estimatedSeconds>0&&p.estimatedSeconds<86400?p.estimatedSeconds:null,signatureIdentity:text(p.signatureIdentity,32),visitedRooms:plan.coverage.visited.length,excludedRooms:plan.coverage.excluded?.length||0};
}
export function midwayDuration(profile){return profile?.estimatedSeconds?`About ${Math.max(1,Math.ceil(profile.estimatedSeconds/60))} min · provisional`:'Duration awaits route inspection';}
export function parkCacheKey(descriptor){return descriptor?.fingerprint?String(descriptor.id)+':'+String(descriptor.fingerprint):null;}
/** Compact session-only metadata. A ready record never authorizes actual carriage movement. */
export function createMidwayParkState(descriptors,{inspect=async()=>{throw Error('Attraction inspection unavailable.');},cache=new Map(),onChange=()=>{}}={}){
 const records=new Map(),diagnostics=[],jobs=new Map(),queue=[];let active=null,disposed=false;
 for(const h of Array.isArray(descriptors)?descriptors:[]){
  if(!h||typeof h.id!=='string'||!h.id||h.id.length>180||typeof h.name!=='string'){diagnostics.push({code:'INVALID_CATALOG_ENTRY'});continue;}
  if(records.has(h.id)){diagnostics.push({code:'DUPLICATE_CATALOG_ID',id:h.id});continue;}
  if(records.size>=MIDWAY_PARK_LIMITS.records){diagnostics.push({code:'CATALOG_PRESENTATION_BUDGET'});break;}
  const cached=cache.get(parkCacheKey(h));
  records.set(h.id,{id:h.id,houseName:text(h.name,140),architect:text(h.architect||'Student architect',100),number:text(h.houseNumber,12),descriptor:h,status:cached?'ready':'unchecked',profile:cached?structuredClone(cached):null,error:null,previewUnavailable:false,revision:0});
 }
 function snapshot(id){const r=records.get(id);if(!r)return null;const {descriptor,...publicRecord}=r;return structuredClone(publicRecord);}
 function changed(r){r.revision++;if(!disposed)onChange(snapshot(r.id));}
 async function pump(){if(disposed||active||!queue.length)return;const job=queue.shift(),r=records.get(job.id);active=job;r.status='checking';r.error=null;changed(r);
  try{const plan=await inspect(r.descriptor,{signal:job.controller.signal});if(disposed||job.controller.signal.aborted)return;const profile=midwayProfile(plan,r.id);r.profile=profile;r.status='ready';r.previewUnavailable=false;const key=parkCacheKey(r.descriptor);if(key){cache.delete(key);cache.set(key,structuredClone(profile));while(cache.size>MIDWAY_PARK_LIMITS.profileCache)cache.delete(cache.keys().next().value);}}
  catch(error){if(!disposed&&!job.controller.signal.aborted){r.status='unavailable';r.profile=null;r.error=text(error?.message||'The attraction could not be inspected.',240);}}
  finally{jobs.delete(job.id);active=null;if(!disposed)changed(r);job.resolve(disposed?null:snapshot(r.id));if(!disposed)void pump();}
 }
 return {list:()=>[...records.keys()].map(snapshot),get:snapshot,diagnostics,
  check(id,{retry=false}={}){if(disposed||!records.has(id))return Promise.resolve(null);const r=records.get(id);if(jobs.has(id))return jobs.get(id).promise;if(r.status==='ready'&&!retry||r.status==='unavailable'&&!retry)return Promise.resolve(snapshot(id));if(queue.length>=MIDWAY_PARK_LIMITS.queuedChecks)return Promise.resolve(null);
   const controller=new AbortController();let resolve;const promise=new Promise(r=>resolve=r);const job={id,controller,promise,resolve};jobs.set(id,job);queue.push(job);void pump();return promise;
  },
  fail(id,error){const r=records.get(id);if(!r||disposed)return;const job=jobs.get(id);if(job){job.controller.abort();const at=queue.indexOf(job);if(at>=0){queue.splice(at,1);jobs.delete(id);}}r.status='unavailable';r.previewUnavailable=true;r.profile=null;r.error=text(error?.message||error||'The mansion entrance could not load.',240);const key=parkCacheKey(r.descriptor);if(key)cache.delete(key);changed(r);if(job&&job!==active)job.resolve(snapshot(id));},
  dispose(){if(disposed)return;disposed=true;if(active){active.controller.abort();active.resolve(null);}for(const job of queue.splice(0)){jobs.delete(job.id);job.controller.abort();job.resolve(null);}records.clear();},
  get report(){return {records:records.size,queued:queue.length,activeChecks:!disposed&&active?1:0,ready:[...records.values()].filter(r=>r.status==='ready').length,unavailable:[...records.values()].filter(r=>r.status==='unavailable').length,diagnostics:structuredClone(diagnostics)};}
 };
}

import {numberHouses} from '../casa_game/addresses.mjs';
export const MAX_PUBLISH_BYTES=95*1024*1024;
/** One deterministic catalog for review and commit; validate everything before uploading blobs. */
export function planPublication(review,items){
 if(!review?.head||!Array.isArray(review.catalog?.houses)||!items?.length)throw Error('Connect and prepare houses before publishing.');
 const ids=new Set(),changes=[];
 for(const {house,bytes,file} of items){
  if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,109}$/.test(house?.id))throw Error('Invalid permanent house ID');
  if(ids.has(house.id))throw Error('Duplicate house ID: '+house.id+'. Assign different IDs, or keep only one replacement.');ids.add(house.id);
  const size=bytes?.length??file?.size;if(!Number.isSafeInteger(size)||size<1||size>MAX_PUBLISH_BYTES)throw Error('Each CASA must be between 1 byte and 95 MiB.');
  if(!String(house.name||'').trim())throw Error('Every mansion needs a name.');
  const old=review.catalog.houses.find(h=>h.id===house.id);
  changes.push({id:house.id,name:house.name,action:old?'UPDATE':'ADD',previousName:old?.name,bytes:size,house:{...house,houseNumber:house.houseNumber||old?.houseNumber||'',package:'./houses/'+house.id+'.casa'}});
 }
 const houses=numberHouses([...review.catalog.houses.filter(h=>!ids.has(h.id)),...changes.map(c=>c.house)]);
 for(const c of changes)c.house=houses.find(h=>h.id===c.id);
 return {head:review.head,houses,changes,added:changes.filter(c=>c.action==='ADD').length,updated:changes.filter(c=>c.action==='UPDATE').length};
}
export function publicationSummary(plan){return plan.added+' new · '+plan.updated+' updates\n\n'+plan.changes.map(c=>c.action+' · '+c.name+' · mailbox '+c.house.houseNumber+(c.action==='UPDATE'?' · replaces '+c.previousName:'')).join('\n');}

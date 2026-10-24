import {houseNumber} from './addresses.mjs';
import {inspectCasaFile} from './import_package.mjs';
import {openCasa} from './archive.mjs';
export function createCatalog(){
 let dbPromise;
 const temporary=new Map(),descriptors=new Map(),published=new Map(),opened=new Map(),generations=new Map();
 function database(){
  dbPromise??=new Promise((resolve,reject)=>{
   if(!globalThis.indexedDB)return reject(Error('Local house storage unavailable'));
   const request=indexedDB.open('black-hollow-casa-street',1);
   request.onupgradeneeded=()=>{for(const store of ['houses','files'])if(!request.result.objectStoreNames.contains(store))request.result.createObjectStore(store,{keyPath:'id'});};
   request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  });
  return dbPromise;
 }
 async function records(){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('houses','readonly'),r=tx.objectStore('houses').getAll();tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
 // Descriptor and bytes change atomically, so an interrupted write cannot pair
 // a new label with old geometry or leave an orphaned local override.
 async function storeLocal(id,house,file){
  const db=await database();return new Promise((resolve,reject)=>{
   const tx=db.transaction(['houses','files'],'readwrite');
   if(file){tx.objectStore('houses').put(house);tx.objectStore('files').put({id,bytes:file});}
   else{tx.objectStore('houses').delete(id);tx.objectStore('files').delete(id);}
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
 }
 async function storedBytes(id){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readonly'),r=tx.objectStore('files').get(id);tx.oncomplete=()=>resolve(r.result?.bytes);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
 function invalidate(id){generations.set(id,(generations.get(id)||0)+1);opened.get(id)?.clearCache();opened.delete(id);}
 async function open(descriptor){
  const h=descriptors.get(descriptor.id)||descriptor,generation=generations.get(h.id)||0;
  if(opened.has(h.id))return opened.get(h.id);
  let bytes=temporary.get(h.id);
  if(!bytes&&h.local)bytes=await storedBytes(h.id);
  if(bytes?.arrayBuffer)bytes=new Uint8Array(await bytes.arrayBuffer());
  if(!bytes&&!h.local){const response=await fetch(new URL(h.package,import.meta.url),{cache:'no-store'});if(!response.ok)throw Error('House package unavailable (HTTP '+response.status+')');bytes=new Uint8Array(await response.arrayBuffer());}
  if(!bytes)throw Error('This local house must be selected again');
  const house=await openCasa(bytes);
  // An import/removal may complete while a street preview is loading.
  if((generations.get(h.id)||0)!==generation){house.clearCache();const current=descriptors.get(h.id);if(!current)throw Error('This local house was removed');return open(current);}
  if(h.fingerprint&&h.fingerprint!==house.fingerprint)throw Error('This house update is still deploying. Refresh the game and try again.');
  opened.set(h.id,house);while(opened.size>2){const id=opened.keys().next().value;opened.get(id).clearCache();opened.delete(id);}return house;
 }
 return {
  async init(){
   const response=await fetch(new URL('./street.json',import.meta.url),{cache:'no-store'});if(!response.ok)throw Error('Street catalog unavailable');
   const sessionCopies=[...descriptors.values()].filter(h=>h.sessionOnly);
   descriptors.clear();published.clear();
   for(const h of(await response.json()).houses){published.set(h.id,h);descriptors.set(h.id,h);}
   try{for(const h of await records())descriptors.set(h.id,h);}catch{}
   for(const h of sessionCopies)descriptors.set(h.id,h);
   for(const id of opened.keys())invalidate(id);
   return [...descriptors.values()];
  },
  list:()=>[...descriptors.values()].map(h=>({...h,publishedVersion:published.get(h.id)||null})),
  async removeLocal(id){
   const h=descriptors.get(id);if(!h?.local)throw Error('This house is already using its published version');
   if(!h.sessionOnly)await storeLocal(id,null,null);
   temporary.delete(id);invalidate(id);
   if(published.has(id))descriptors.set(id,published.get(id));else descriptors.delete(id);
  },
  async import(file,{onProgress=()=>{},houseNumber:assignedNumber}={}){
   const house=await inspectCasaFile(file,{onProgress});
   const h={id:house.manifest.id||house.fingerprint,name:String(house.manifest.name||file.name).slice(0,110),houseNumber:houseNumber(assignedNumber??house.manifest.casa?.houseNumber),description:'A newly arrived house. Its story is waiting.',local:true,fingerprint:house.fingerprint,geometryLevel:house.manifest.casa?.geometryLevel||'Legacy CASA',architect:String(house.manifest.casa?.creator||'Unknown architect').slice(0,110)};
   temporary.set(h.id,file);onProgress({phase:'Saving on this device',bytes:file.size,total:file.size});
   try{await storeLocal(h.id,h,file);temporary.delete(h.id);}catch{h.sessionOnly=true;}
   invalidate(h.id);descriptors.set(h.id,h);return h;
  },open,
  forgetDecoded(){for(const h of opened.values())h.clearCache();opened.clear();}
 };
}

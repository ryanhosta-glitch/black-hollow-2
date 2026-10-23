import {openCasa} from '../casa_game/archive.mjs';
import {inspectCasaFile} from '../casa_game/import_package.mjs';
import {publicationFindings} from './forge_build_report.mjs';
export async function prepareCasa(file){
 await inspectCasaFile(file);
 const casa=await openCasa(new Uint8Array(await file.arrayBuffer()));
 const identity=casa.entries.has('casa_identity.json')?await casa.json('casa_identity.json'):{};
 const report=casa.manifest.studentReport?await casa.json(casa.manifest.studentReport):null;
 const findings=publicationFindings(report);
 if(findings.blocked)throw Error(findings.message);
 return {file,house:{id:casa.manifest.id,name:String(casa.manifest.name),fingerprint:casa.fingerprint,geometryLevel:casa.manifest.casa?.geometryLevel,forgeRevision:casa.manifest.forgeRevision||null,architect:String(identity.architect||'Unknown architect'),description:String(identity.description||'A new mystery on Haunted Hollow Street.')},report:findings.message};
}
export function batchStorage(){
 const db=new Promise((resolve,reject)=>{const r=indexedDB.open('black-hollow-forge-batches',1);r.onupgradeneeded=()=>r.result.createObjectStore('queue',{keyPath:'key'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 async function transaction(mode,action){const d=await db;return new Promise((resolve,reject)=>{const tx=d.transaction('queue',mode),r=action(tx.objectStore('queue'));tx.oncomplete=()=>resolve(r?.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
 return {list:()=>transaction('readonly',s=>s.getAll()),put:row=>transaction('readwrite',s=>s.put(row)),remove:key=>transaction('readwrite',s=>s.delete(key)),clear:()=>transaction('readwrite',s=>s.clear())};
}

/** Rebuild compiled uploads from their authored source, retaining published identity/finishes. */
export async function forgeInput(row){
 let source=row.source,edits={...row.edits};
 if(/\.casa$/i.test(source.name)){
  const archive=await openCasa(new Uint8Array(await source.arrayBuffer()));
  if(!archive.entries.has('source.haunt'))throw Error('This CASA has no embedded blueprint. Upload its original .haunt to rebuild.');
  const identity=archive.entries.has('casa_identity.json')?await archive.json('casa_identity.json'):{},finish=archive.entries.has('exterior/finishes.json')?await archive.json('exterior/finishes.json'):{};
  source=new File([await archive.read('source.haunt')],'source.haunt',{type:'application/json'});
  edits={name:archive.manifest.name,architect:identity.architect||'',description:identity.description||'',style:finish.style||'auto',trim:finish.trim||'auto',roof:finish.roof||'auto',...edits,houseId:archive.manifest.id};
 }
 if(row.house?.id)edits.houseId=row.house.id;
 return {source,edits};
}

import {openCasa} from './archive.mjs';
export const MAX_CASA_BYTES=128*1024*1024;
export function validateCasaFile(file){if(!/\.casa$/i.test(file.name))throw Error('Choose a .casa package here. A .haunt or .json blueprint belongs in Forge.');if(file.size>MAX_CASA_BYTES)throw Error('Package exceeds 128 MB compressed. Reduce assets in Forge and export again.');if(file.size<22)throw Error('The CASA archive is empty or truncated.');}
export async function inspectCasaFile(file,{onProgress=()=>{},useWorker=true}={}){
 validateCasaFile(file);onProgress({phase:'Reading package',bytes:file.size,total:file.size});
 if(useWorker&&typeof Worker!=='undefined')return new Promise((resolve,reject)=>{const worker=new Worker(new URL('./import_worker.mjs',import.meta.url),{type:'module'});const finish=()=>worker.terminate();worker.onmessage=({data})=>{if(data.progress)onProgress(data.progress);else if(data.error){finish();reject(Error(data.error));}else{finish();resolve(data.summary);}};worker.onerror=()=>{finish();reject(Error('Package validation could not run. Reload the game and try again.'));};worker.postMessage({file});});
 const bytes=new Uint8Array(await file.arrayBuffer());onProgress({phase:'Validating archive and compiled navigation',bytes:bytes.length,total:file.size});const house=await openCasa(bytes);const summary={manifest:house.manifest,fingerprint:house.fingerprint};house.clearCache();return summary;
}

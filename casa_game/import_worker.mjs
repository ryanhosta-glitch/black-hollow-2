import {inspectCasaFile} from './import_package.mjs';
self.onmessage=async({data:{file}})=>{try{const summary=await inspectCasaFile(file,{useWorker:false,onProgress:progress=>self.postMessage({progress})});self.postMessage({summary});}catch(error){self.postMessage({error:error.message||'CASA validation failed'});}};

// The file validator owns per-package limits; a class-sized selection has no old 24-house cap.
export async function importCasaBatch(files,{catalog,onProgress=()=>{}}){
 const results=[];
 for(const file of files){
  onProgress({phase:'Checking '+file.name,file});
  try{const house=await catalog.import(file,{onProgress:p=>onProgress({...p,file})});results.push({file,house,ok:true});}
  catch(error){results.push({file,error:error.message,ok:false});}
 }
 const added=results.filter(r=>r.ok).length,failed=results.length-added,temporary=results.filter(r=>r.ok&&r.house.sessionOnly).length;
 return {results,added,failed,temporary,message:`${added} houses added · ${failed} failed`+(temporary?` · ${temporary} available only until this tab closes`:'')};
}

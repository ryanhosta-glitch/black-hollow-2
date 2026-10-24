import {numberHouses} from '../casa_game/addresses.mjs';
export const REPOSITORY='ryanhosta-glitch/black-hollow-2';
export const MAX_PUBLISH_BYTES=95*1024*1024;
export function casaPath(path){return /^casa_game\/(samples|houses)\/[a-zA-Z0-9_-]+\.casa$/.test(path);}
export function createPublisher({token,fetcher=fetch}){
 async function api(path,body,method=body?'POST':'GET'){const r=await fetcher('https://api.github.com/repos/'+REPOSITORY+'/'+path,{method,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:'Bearer '+token(),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok){const e=await r.json().catch(()=>({}));throw Error('GitHub '+r.status+': '+(e.message||'Request failed'));}return r.json();}
 async function snapshot(){const ref=await api('git/ref/heads/main'),commit=await api('git/commits/'+ref.object.sha),tree=await api('git/trees/'+commit.tree.sha+'?recursive=1');if(tree.truncated)throw Error('Repository listing incomplete; refusing to publish.');const catalog=await api('contents/casa_game/street.json?ref='+ref.object.sha);return {head:ref.object.sha,tree:commit.tree.sha,files:tree.tree.filter(x=>casaPath(x.path)),catalog:JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(catalog.content.replace(/\s/g,'')),c=>c.charCodeAt(0))))};}
 async function blob(bytes){let text='';for(let i=0;i<bytes.length;i+=16384)text+=String.fromCharCode(...bytes.subarray(i,i+16384));return (await api('git/blobs',{encoding:'base64',content:btoa(text)})).sha;}
 async function change({review,house,bytes,removePath}){if(!review?.head)throw Error('Refresh the street before reviewing a change.');if(removePath&&!casaPath(removePath))throw Error('Unsafe removal path');const rows=review.catalog.houses.map(x=>({...x})),edits=[];let name='';if(bytes){if(bytes.length>MAX_PUBLISH_BYTES)throw Error('Permanent GitHub publishing supports CASA files up to 95 MiB.');if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,109}$/.test(house.id))throw Error('Invalid permanent house ID');const target='casa_game/houses/'+house.id+'.casa';const existing=rows.find(x=>x.id===house.id);if(existing){const old='casa_game/'+existing.package.replace(/^\.\//,'');if(!casaPath(old))throw Error('Unsafe existing package path');if(old!==target)edits.push({path:old,sha:null,mode:'100644',type:'blob'});rows.splice(rows.indexOf(existing),1);}edits.push({path:target,sha:await blob(bytes),mode:'100644',type:'blob'});rows.push({...house,package:'./houses/'+house.id+'.casa'});name='Publish '+house.name;}else{if(!review.files.some(x=>x.path===removePath))throw Error('House no longer exists');edits.push({path:removePath,sha:null,mode:'100644',type:'blob'});for(let i=rows.length-1;i>=0;i--)if('casa_game/'+rows[i].package.replace(/^\.\//,'')===removePath)rows.splice(i,1);name='Remove '+removePath.split('/').pop();}
 const current=await api('git/ref/heads/main');if(current.object.sha!==review.head)throw Error('The repository changed. Refresh and review again.');
 const catalogSha=await blob(new TextEncoder().encode(JSON.stringify({version:1,houses:numberHouses(rows)},null,2)+'\n'));edits.push({path:'casa_game/street.json',sha:catalogSha,mode:'100644',type:'blob'});const tree=await api('git/trees',{base_tree:review.tree,tree:edits}),commit=await api('git/commits',{message:name,tree:tree.sha,parents:[review.head]});await api('git/refs/heads/main',{sha:commit.sha,force:false},'PATCH');return commit.sha;
 }
 async function changeBatch({review,items,onProgress=()=>{}}){
  if(!review?.head||!items?.length)throw Error('Connect and prepare houses before publishing.');
  const ids=new Set();
  for(const {house,bytes,file} of items){
   if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,109}$/.test(house?.id))throw Error('Invalid permanent house ID');
   if(ids.has(house.id))throw Error('Duplicate house ID: '+house.id);
   ids.add(house.id);
   if(!(bytes?.length||file?.size)||(bytes?.length||file?.size)>MAX_PUBLISH_BYTES)throw Error('Each CASA must be between 1 byte and 95 MiB.');
  }
  const check=async()=>{if((await api('git/ref/heads/main')).object.sha!==review.head)throw Error('The repository changed. Refresh and publish again; prepared houses are retained.');};
  await check();
  const rows=review.catalog.houses.filter(h=>!ids.has(h.id)),edits=[];
  let completed=0;
  for(const item of items){
   const {house}=item,bytes=item.bytes||new Uint8Array(await item.file.arrayBuffer());
   const target='casa_game/houses/'+house.id+'.casa',existing=review.catalog.houses.find(h=>h.id===house.id);
   if(existing){const old='casa_game/'+existing.package.replace(/^\.\//,'');if(!casaPath(old))throw Error('Unsafe existing package path');if(old!==target)edits.push({path:old,sha:null,mode:'100644',type:'blob'});}
   edits.push({path:target,sha:await blob(bytes),mode:'100644',type:'blob'});
   rows.push({...house,package:'./houses/'+house.id+'.casa'});
   onProgress(++completed,items.length,house.name);
  }
  await check();
  edits.push({path:'casa_game/street.json',sha:await blob(new TextEncoder().encode(JSON.stringify({version:1,houses:numberHouses(rows)},null,2)+'\n')),mode:'100644',type:'blob'});
  const tree=await api('git/trees',{base_tree:review.tree,tree:edits}),commit=await api('git/commits',{message:'Publish '+items.length+' Forged mansions',tree:tree.sha,parents:[review.head]});
  await api('git/refs/heads/main',{sha:commit.sha,force:false},'PATCH');return commit.sha;
 }
 return {snapshot,change,changeBatch};
}

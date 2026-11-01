import {createHash,timingSafeEqual} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {newSaveCode,normalizeCode} from './codes.mjs';
import {openProject,verifySong} from '../sequencer.mjs';
import {openGinger} from '../ginger_forge.mjs';
const digest=text=>createHash('sha256').update(text).digest('hex');
const equal=(a,b)=>typeof a==='string'&&a.length<=200&&timingSafeEqual(Buffer.from(digest(a)),Buffer.from(digest(b)));
class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
export function createSaveService({database=':memory:',classKey,allowedOrigins=[],maxProjectBytes=80*1024*1024,maxRecords=300,maxStoredBytes=2*1024*1024*1024,createLimit=300,now=()=>Date.now()}={}){
 if(typeof classKey!=='string'||(classKey.length<12||classKey.length>200))throw Error('Set a class access key with 12–200 characters before starting the save service.');
 const db=new DatabaseSync(database);db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS saves (code_hash TEXT PRIMARY KEY, revision INTEGER NOT NULL, payload TEXT NOT NULL, bytes INTEGER NOT NULL, saved_at TEXT NOT NULL);');
 let createWindow=now(),created=0;
 const headers=origin=>({'Content-Type':'application/json','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff',...(origin?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})});
 async function body(request){if(Number(request.headers.get('content-length'))>maxProjectBytes)throw new HttpError(413,'Project exceeds the online save limit. Download it instead.');if(!request.body)throw new HttpError(400,'Project data is missing.');const reader=request.body.getReader(),chunks=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>maxProjectBytes){await reader.cancel();throw new HttpError(413,'Project exceeds the online save limit. Download it instead.');}chunks.push(value);}try{return JSON.parse(Buffer.concat(chunks.map(c=>Buffer.from(c))).toString('utf8'));}catch{throw new HttpError(400,'Invalid project JSON.');}}
 async function verified(show){try{await openProject(show);await verifySong(show.song);await openGinger(show.house);}catch{throw new HttpError(422,'The project could not be validated. Download your work and check its house, song and cues.');}return JSON.stringify(show);}
 function capacity(newBytes,oldBytes=0){const row=db.prepare('SELECT COUNT(*) AS count, COALESCE(SUM(bytes),0) AS bytes FROM saves').get();if((!oldBytes&&row.count>=maxRecords)||row.bytes-oldBytes+newBytes>maxStoredBytes)throw new HttpError(507,'Classroom save storage is full. Download your project and ask your teacher.');}
 async function handle(request){let origin=null;try{
  const url=new URL(request.url),sentOrigin=request.headers.get('origin');if(sentOrigin){if(sentOrigin!==url.origin&&!allowedOrigins.includes(sentOrigin))throw new HttpError(403,'This studio origin is not allowed by the classroom save service.');origin=sentOrigin;}
  const path=url.pathname.replace(/\/$/,'');if(!['/api/gingerlight/saves','/api/gingerlight/health'].includes(path))throw new HttpError(404,'Save endpoint not found.');
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers(origin),'Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type,If-Match,X-Class-Key','Access-Control-Max-Age':'600'}});
  if(path.endsWith('/health')){if(request.method!=='GET')throw new HttpError(405,'Method not allowed.');return Response.json({service:'gingerlight-save-service',version:1,available:true,maxProjectBytes},{headers:headers(origin)});}
  if(request.method==='POST'){
   if(!equal(request.headers.get('x-class-key'),classKey))throw new HttpError(403,'Enter your teacher’s class access key to create a save.');
   if(now()-createWindow>=3600000){createWindow=now();created=0;}if(created>=createLimit)throw new HttpError(429,'Too many new saves this hour. Use an existing code or download your project.');
   const payload=await verified(await body(request)),bytes=Buffer.byteLength(payload),code=newSaveCode(),savedAt=new Date(now()).toISOString();capacity(bytes);
   db.prepare('INSERT INTO saves (code_hash,revision,payload,bytes,saved_at) VALUES (?,1,?,?,?)').run(digest(code),payload,bytes,savedAt);created++;
   return Response.json({code,revision:1,savedAt},{status:201,headers:headers(origin)});
  }
  let code;try{code=normalizeCode(request.headers.get('authorization')?.replace(/^Bearer /i,''));}catch{throw new HttpError(401,'Enter your complete secret save code.');}
  const hash=digest(code),record=db.prepare('SELECT revision,payload,bytes,saved_at FROM saves WHERE code_hash=?').get(hash);if(!record)throw new HttpError(404,'No saved work was found for that code. Check every group of letters and numbers.');
  if(request.method==='GET')return Response.json({project:JSON.parse(record.payload),revision:record.revision,savedAt:record.saved_at},{headers:headers(origin)});
  const revision=Number(request.headers.get('if-match'));if(!Number.isSafeInteger(revision)||revision<1)throw new HttpError(428,'Load the latest saved work before updating or deleting it.');if(revision!==record.revision)throw new HttpError(409,'This work was saved from another tab or computer. Download your local copy, then reopen the latest saved version.');
  if(request.method==='PUT'){
   const payload=await verified(await body(request)),bytes=Buffer.byteLength(payload),savedAt=new Date(now()).toISOString();capacity(bytes,record.bytes);
   const result=db.prepare('UPDATE saves SET payload=?,bytes=?,revision=revision+1,saved_at=? WHERE code_hash=? AND revision=?').run(payload,bytes,savedAt,hash,revision);if(result.changes!==1)throw new HttpError(409,'Another save arrived first. Reopen the latest saved version.');
   return Response.json({revision:revision+1,savedAt},{headers:headers(origin)});
  }
  if(request.method==='DELETE'){const result=db.prepare('DELETE FROM saves WHERE code_hash=? AND revision=?').run(hash,revision);if(result.changes!==1)throw new HttpError(409,'Another save arrived first. Reopen it before deleting.');return Response.json({deleted:true},{headers:headers(origin)});}
  throw new HttpError(405,'Method not allowed.');
 }catch(error){return Response.json({error:error.status?error.message:'The save service could not complete this request. Download your project and try again later.'},{status:error.status||500,headers:headers(origin)});}}
 return {handle,close:()=>db.close()};
}

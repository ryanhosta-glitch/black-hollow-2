// Keep permanent Moonveil on the current Forge in both tests and deployment.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';import {fileURLToPath} from 'node:url';
import {openCasa} from '../casa_game/archive.mjs';
import {compileFixture} from '../tests/helpers/compile-forge.mjs';
export async function rebuildReferenceMansion(){
 const path=new URL('../casa_game/samples/moonveil.casa',import.meta.url),old=await openCasa(new Uint8Array(await readFile(path))),source=await old.json('source.haunt'),identity=await old.json('casa_identity.json'),finish=old.manifest.exteriorFinishes?await old.json(old.manifest.exteriorFinishes):{};
 const fresh=await compileFixture(source,{identity:{id:old.manifest.id,name:old.manifest.name,creator:identity.architect||old.manifest.casa?.creator||'',desc:identity.description||'',houseNumber:identity.houseNumber||'6426',exteriorStyle:finish.style||'auto',exteriorTrim:finish.trim||'auto',exteriorRoof:finish.roof||'auto'}});
 if(!fresh.house.playability.staticRoutesVerified)throw Error('Moonveil reference mansion failed Forge route checks.');
 await writeFile(path,fresh.bytes);
 const versionsPath=new URL('../casa_game/house_versions.json',import.meta.url);let versions={version:1,previousFingerprints:{}};try{versions=JSON.parse(await readFile(versionsPath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}versions.previousFingerprints??={};if(old.fingerprint!==fresh.house.fingerprint){versions.previousFingerprints[old.manifest.id]=[...new Set([old.fingerprint,...(versions.previousFingerprints[old.manifest.id]||[])])].slice(0,8);await writeFile(versionsPath,JSON.stringify(versions,null,2)+'\n');}
 console.log('Moonveil reference mansion rebuilt with the current Forge.');return fresh.house;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await rebuildReferenceMansion();

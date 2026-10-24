// Tests use stable example mansions even when the owner removes those examples
// from the public street. Generated copies/catalog edits exist only in the test
// workspace; this helper is never part of the Pages deployment workflow.
import {readFile,writeFile,access,mkdir} from 'node:fs/promises';
import {compileFixture} from '../tests/helpers/compile-forge.mjs';
import {openCasa} from '../casa_game/archive.mjs';
import {numberHouses} from '../casa_game/addresses.mjs';
const root=new URL('../',import.meta.url),catalogPath=new URL('casa_game/street.json',root),catalog=JSON.parse(await readFile(catalogPath,'utf8'));let changed=false;
await mkdir(new URL('casa_game/samples/',root),{recursive:true});
for(const name of ['one-room','moonveil','split-lantern']){
 const fixture=JSON.parse(await readFile(new URL('tests/fixtures/test-houses/'+name+'.json',root),'utf8')),path=new URL('casa_game/samples/'+name+'.casa',root);
 let missing=false;try{await access(path);}catch{missing=true;}
 if(missing){const {bytes}=await compileFixture(fixture.source,{identity:fixture.identity});await writeFile(path,bytes);console.log('Prepared test-only house: '+name);}
 const house=await openCasa(new Uint8Array(await readFile(path))),existing=catalog.houses.find(h=>h.id===fixture.identity.id);
 if(!existing){catalog.houses.push({...fixture.catalog,id:house.manifest.id,houseNumber:'',fingerprint:house.fingerprint,package:'./samples/'+name+'.casa'});changed=true;}
 else if(existing.package==='./samples/'+name+'.casa'&&existing.fingerprint!==house.fingerprint){existing.previousFingerprints=[...new Set([...(existing.previousFingerprints||[]),existing.fingerprint].filter(Boolean))];existing.fingerprint=house.fingerprint;changed=true;}
}
if(changed){catalog.houses=numberHouses(catalog.houses);await writeFile(catalogPath,JSON.stringify(catalog,null,2)+'\n');console.log('Prepared test-only catalog entries; public repository catalog is unchanged.');}

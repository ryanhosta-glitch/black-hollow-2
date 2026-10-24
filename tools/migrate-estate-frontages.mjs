// Explicit reforge of published houses, retaining permanent identity and save aliases.
import {readFile,writeFile} from 'node:fs/promises';
import {openCasa} from '../casa_game/archive.mjs';
import {compileFixture} from '../tests/helpers/compile-forge.mjs';
const root=new URL('../casa_game/',import.meta.url),catalogPath=new URL('street.json',root),catalog=JSON.parse(await readFile(catalogPath,'utf8')),prepared=[];
for(const h of catalog.houses){const path=new URL(h.package,root),old=await openCasa(await readFile(path)),identity=await old.json('casa_identity.json');
 const {bytes,house}=await compileFixture(await old.json('source.haunt'),{identity:{id:h.id,name:h.name,creator:identity.architect||'',desc:identity.description||'',houseNumber:h.houseNumber||identity.houseNumber||''}});
 if(house.manifest.id!==h.id||!house.playability.staticRoutesVerified)throw Error('Unsafe migration: '+h.name);
 const report=await house.json('qa/estate_frontage.json'),access=await house.json('navigation/access_plan.json');
 if(new Set(access.stops.flatMap(s=>s.componentRoomIds)).size!==house.rooms.length)throw Error('Missing estate connection: '+h.name);
 prepared.push({path,bytes});h.previousFingerprints=[...new Set([old.fingerprint,...(h.previousFingerprints||[])])].filter(f=>f!==house.fingerprint).slice(0,8);h.fingerprint=house.fingerprint;
 console.log(h.name+': '+report.streetRoomIds.length+'/'+report.estateRoomIds.length+' frontage rooms; '+access.stops.length+' elevator stops; routes PASS');
}
for(const p of prepared)await writeFile(p.path,p.bytes);
await writeFile(catalogPath,JSON.stringify(catalog,null,2)+'\n');

const versionsPath=new URL('house_versions.json',root),versions=JSON.parse(await readFile(versionsPath,'utf8'));for(const h of catalog.houses)versions.previousFingerprints[h.id]=h.previousFingerprints;await writeFile(versionsPath,JSON.stringify(versions,null,2)+'\n');

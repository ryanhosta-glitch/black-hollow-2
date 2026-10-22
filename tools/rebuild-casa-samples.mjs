// Explicit migration: run after reviewing Forge changes, never during Pages deployment.
// Uses the same embedded browser compiler, with DOM/download adapters only.
import {readFile,writeFile} from 'node:fs/promises';
import {inflateRawSync} from 'node:zlib';
import {openCasa} from '../casa_game/archive.mjs';
import {compileFixture} from '../tests/helpers/compile-forge.mjs';
for(const name of ['moonveil','one-room','split-lantern']){
 const path=new URL('../casa_game/samples/'+name+'.casa',import.meta.url);
 const old=await openCasa(await readFile(path),{inflateRaw:async b=>new Uint8Array(inflateRawSync(b))});
 const identity=await old.json('casa_identity.json');
 const {bytes,house}=await compileFixture(await old.json('source.haunt'),{identity:{id:old.manifest.id,name:old.manifest.name,creator:identity.architect||old.manifest.casa?.creator||'',desc:identity.description||old.manifest.casa?.description||''}});
 if(house.manifest.id!==old.manifest.id||!house.playability.staticRoutesVerified)throw Error('Migration changed identity or blocked routes: '+name);
 const model=await house.read(house.manifest.floors[0].model),doc=JSON.parse(new TextDecoder().decode(model.subarray(20,20+new DataView(model.buffer,model.byteOffset).getUint32(12,true))));
 if(!doc.images?.length)throw Error('Missing architectural textures: '+name);
 await writeFile(path,bytes);console.log(name+': '+house.manifest.casa.geometryLevel+' · '+(bytes.length/1048576).toFixed(2)+' MiB · '+house.fingerprint.slice(0,12));
}

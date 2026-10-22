import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {createCatalog} from '../casa_game/catalog.mjs';import {openCasa} from '../casa_game/archive.mjs';import {compileFixture} from './helpers/compile-forge.mjs';
test('replacing a local CASA invalidates decoded geometry and removing it restores the published house',async()=>{
 const originalFetch=globalThis.fetch,bytes=await readFile(new URL('../casa_game/samples/one-room.casa',import.meta.url)),old=await openCasa(bytes);
 const src=await old.json('source.haunt');src.name='Replacement mansion';
 const {bytes:replacement,house}=await compileFixture(src,{identity:{id:old.manifest.id}});
 const descriptor={id:old.manifest.id,name:old.manifest.name,package:'./samples/one-room.casa',fingerprint:old.fingerprint};
 globalThis.fetch=async url=>String(url).endsWith('street.json')?Response.json({houses:[descriptor]}):new Response(bytes);
 try{const c=createCatalog();await c.init();assert.equal((await c.open(descriptor)).fingerprint,old.fingerprint);
 const h=await c.import(new File([replacement],'replacement.casa'));assert.equal(h.sessionOnly,true);
 assert.equal((await c.open(h)).fingerprint,house.fingerprint,'new local geometry replaces the decoded published copy');assert.ok(c.list()[0].publishedVersion);
 const back=await c.import(new File([bytes],'original.casa'));assert.equal((await c.open(back)).fingerprint,old.fingerprint,'a second import invalidates the first local copy');
 await c.removeLocal(h.id);assert.equal(c.list()[0].local,undefined);assert.equal((await c.open(c.list()[0])).fingerprint,old.fingerprint);
 }finally{globalThis.fetch=originalFetch;}
});
test('shipped mansion architecture is textured and catalog fingerprints match its packages',async()=>{
 const catalog=JSON.parse(await readFile(new URL('../casa_game/street.json',import.meta.url),'utf8'));
 for(const h of catalog.houses){const house=await openCasa(await readFile(new URL('../casa_game/'+h.package,import.meta.url)));assert.equal(house.fingerprint,h.fingerprint);assert.equal(house.manifest.casa.geometryLevel,'victorian-textured-architecture-4.3');
 for(const model of [...house.manifest.floors.map(f=>f.model),house.manifest.roof,house.manifest.casa.streetPreview]){const b=await house.read(model),doc=JSON.parse(new TextDecoder().decode(b.subarray(20,20+new DataView(b.buffer,b.byteOffset).getUint32(12,true))));assert.ok(doc.images?.length,model);assert.ok(doc.meshes.every(m=>m.primitives.every(p=>p.attributes.TEXCOORD_0!==undefined)),model);}
 }
});

import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {openCasa} from '../../casa_game/archive.mjs';
export async function compileFixture(blueprint){
 const html=await readFile(new URL('../../casa_admin/compiler.html',import.meta.url),'utf8'),source=html.split('<script type="module">')[1].replace(/<\/script>[\s\S]*$/,''),nodes=new Map(),context={console,TextEncoder,Uint8Array,Uint32Array,Float32Array,DataView,Blob,URL,crypto,atob,setTimeout:()=>{},location:{origin:'https://test.invalid'},document:{getElementById(id){if(!nodes.has(id))nodes.set(id,{value:'',disabled:false,addEventListener(type,fn){this[type]=fn;}});return nodes.get(id);},createElement:()=>({click(){}})}};
 for(const match of source.matchAll(/^import \{([^}]+)\} from '([^']+)';$/gm)){const module=await import(new URL('../../casa_admin/'+match[2],import.meta.url));for(const name of match[1].split(',').map(x=>x.trim()))context[name]=module[name];}
 context.fetch=async path=>{try{return new Response(await readFile(new URL('../../casa_admin/'+path,import.meta.url)));}catch{return new Response('missing',{status:404});}};
 let output;context.window={};context.parent={postMessage(message){output=message.blob;}};vm.createContext(context);vm.runInContext(source.replace(/^import .*;$/gm,''),context);
 nodes.get('haunt').files=[{name:'regression.haunt',size:100,text:async()=>JSON.stringify(blueprint)}];await nodes.get('haunt').change();assert.notEqual(nodes.get('status').textContent,'Blueprint rejected.',nodes.get('audit').textContent);await nodes.get('build').onclick();assert.ok(output,nodes.get('status').textContent);const bytes=new Uint8Array(await output.arrayBuffer()),house=await openCasa(bytes).catch(e=>{throw new Error(blueprint.name+': '+e.message)});return {bytes,house};
}

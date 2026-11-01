import {compileGinger,openGinger} from './ginger_forge.mjs';
import {openCasa} from '../casa_game/archive.mjs';
// The student route uses the same compiler and identity rules as teacher Forge.
export async function prepareHouseFile(file,options={}){
 if(!file)throw Error('Choose a model house, .haunt, .casa or .ginger file.');
 const casa=/\.casa$/i.test(file.name);if(file.size>(casa?128:48)*1024*1024)throw Error(casa?'CASA exceeds 128 MiB.':'House file exceeds 48 MiB.');
 let source,houseId;
 if(casa){const pkg=await openCasa(new Uint8Array(await file.arrayBuffer()));source=await pkg.json(pkg.entries.has('repaired.haunt')?'repaired.haunt':'source.haunt');houseId=pkg.manifest.id;}
 else{try{source=JSON.parse((await file.text()).replace(/^\ufeff/,''));}catch{throw Error('This house file is not valid JSON. Open an unedited export from Black Hollow.');}}
 if(source?.format==='gingerlight-exterior'){await openGinger(source);return source;}
 return compileGinger(source,{...options,houseId});
}

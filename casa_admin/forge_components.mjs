import {HEIRLOOM_TYPES} from './forge_heirloom_style.mjs';
import {heirloomFurnitureParts} from './forge_heirloom_furniture.mjs';
import {architecturalLuxury} from './forge_architectural_luxury.mjs';
import {ROOM_COMPONENTS} from '../casa_game/room_components.mjs';
import {ROOM_MATERIALS} from '../casa_game/room_materials.mjs';
import {ROOM_FURNITURE,roomFurnitureParts} from './forge_room_furniture.mjs';
import {FURNITURE_CATALOG} from './victorian_furniture_library.js';
import {roomFinish} from './forge_finishes.mjs';
import {mansionEnvelope} from './forge_envelope_finish.mjs';

/** Forge adapters reuse existing geometry/catalog models; no model payloads are copied. */
export const FORGE_COMPONENT_REGISTRY=Object.freeze({
 ...Object.fromEntries(Object.entries(ROOM_COMPONENTS).map(([id,component])=>[id,component.generator==='architecturalLuxury'?Object.freeze({...component,generate:architecturalLuxury}):component])),
 ...Object.fromEntries(Object.keys({...FURNITURE_CATALOG,...ROOM_FURNITURE}).map(type=>['furniture:'+type,Object.freeze({
  id:'furniture:'+type,category:'furniture',type,builtIn:!!ROOM_FURNITURE[type],
  specification:ROOM_FURNITURE[type]||FURNITURE_CATALOG[type],
  generator:ROOM_FURNITURE[type]?'roomFurnitureParts':HEIRLOOM_TYPES.includes(type)?'heirloomFurnitureParts':'furniture-catalog-model',
  ...(ROOM_FURNITURE[type]?{generate:roomFurnitureParts}:HEIRLOOM_TYPES.includes(type)?{generate:heirloomFurnitureParts,modelPattern:'geometry/furniture/{type}-{style}.glb'}:{model:'geometry/furniture/'+type+'.glb'})
 })])),
 'material-treatment':Object.freeze({id:'material-treatment',category:'material',generator:'roomFinish',generate:roomFinish,materials:ROOM_MATERIALS}),
 'mansion-envelope':Object.freeze({...ROOM_COMPONENTS['mansion-envelope'],generate:mansionEnvelope})
});
export function furnitureComponents(profile){return profile.furniture.map(type=>FORGE_COMPONENT_REGISTRY['furniture:'+type]);}
export function furnitureGeometry(item){const component=FORGE_COMPONENT_REGISTRY['furniture:'+item.type];return component?.builtIn?component.generate(item):[];}

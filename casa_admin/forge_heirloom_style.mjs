import {resolveRoomProfile,stableRoomHash} from '../casa_game/room_profiles.mjs';
import {ROOM_MATERIALS as M} from '../casa_game/room_materials.mjs';
export const HEIRLOOM_TYPES=Object.freeze(['tufted_settee','settee','gothic_armchair','armchair','writing_desk','bookcase','wardrobe','curio_cabinet','dining_table','banquet_ensemble','supper_table','bed','gothic_headboard','side_table','console','grandfather_clock','marble_fireplace','mahogany_fireplace']);
export const HEIRLOOM_FINISHES=Object.freeze({mahogany:M.wood,ebony:M.ebony,oak:M.furnitureOak,painted:M.paintedWood,aged:M.agedMahogany});
export const HEIRLOOM_UPHOLSTERY=Object.freeze({claret:M.upholstery,emerald:M.emeraldVelvet,blue:M.blueVelvet,ivory:M.linen,leather:M.leather});
export function heirloomStyle(room={},authored=null){
 const p=resolveRoomProfile(room),v=stableRoomHash(String(room.id??room.name??'room'))%3;
 const defaults={ballroom:['ebony','claret','preserved'],parlor:['mahogany','claret','preserved'],library:['mahogany','leather','aged'],dining:['mahogany','emerald','preserved'],gallery:['ebony','blue','preserved'],bedroom:['oak','blue','preserved'],nursery:['painted','ivory','preserved'],crypt:['aged','ivory','aged'],laboratory:['oak','leather','aged'],conservatory:['painted','emerald','aged'],circulation:['oak','claret','aged']}[p.identity];
 const supplied=authored?.furnitureStyle||{},[wood,upholstery,condition]=defaults;
 return {wood:Object.hasOwn(HEIRLOOM_FINISHES,supplied.wood)?supplied.wood:wood,upholstery:Object.hasOwn(HEIRLOOM_UPHOLSTERY,supplied.upholstery)?supplied.upholstery:upholstery,condition:['aged','preserved'].includes(supplied.condition)?supplied.condition:condition,ornament:['essential','standard','luxury'].includes(supplied.ornament)?supplied.ornament:p.detail,pattern:Number.isInteger(supplied.pattern)?Math.abs(supplied.pattern)%3:v};
}
export function heirloomStyleKey(style){return ['wood','upholstery','condition','ornament','pattern'].map(k=>style[k]).join('-');}

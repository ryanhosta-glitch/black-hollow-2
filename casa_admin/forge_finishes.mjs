import {stableHash} from './forge_exterior_style.mjs';
import {MAT} from './forge_glb.mjs';
import {roomIdentity} from '../casa_game/room_content.mjs';
export function roomFinish(room){
 const name=[room.roomType,room.type,room.name].filter(Boolean).join(' ').toLowerCase();
 const identity=roomIdentity(room);
 const theme=room.roomTheme?({nursery:'bedroom',dining:'ballroom',gallery:'parlor',circulation:'parlor'}[identity]||identity):/crypt|dungeon|basement/.test(name)?'crypt':/laboratory|lab\b/.test(name)?'laboratory':/conservatory|glasshouse|greenhouse/.test(name)?'conservatory':/ballroom|music|dining/.test(name)?'ballroom':/bed|nursery/.test(name)?'bedroom':/library|study|observatory/.test(name)?'library':'parlor';
 const styles={crypt:{floor:MAT.crypt,wall:MAT.crypt,ceiling:MAT.stone,panel:MAT.stone,trim:MAT.stone},laboratory:{floor:MAT.conservatory,wall:MAT.laboratory,ceiling:MAT.ceiling,panel:MAT.laboratory,trim:MAT.metal},conservatory:{floor:MAT.conservatory,wall:MAT.library,ceiling:MAT.ceiling,panel:MAT.wood,trim:MAT.metal},ballroom:{floor:MAT.parquet,wall:MAT.wall,ceiling:MAT.plaster,panel:MAT.wood,trim:MAT.trim},bedroom:{floor:MAT.floor,wall:MAT.bedroom,ceiling:MAT.plaster,panel:MAT.wood,trim:MAT.trim},library:{floor:MAT.floor,wall:MAT.library,ceiling:MAT.wood,panel:MAT.wood,trim:MAT.trim},parlor:{floor:MAT.floor,wall:MAT.wall,ceiling:MAT.plaster,panel:MAT.wood,trim:MAT.trim}};
 const finish={theme,...styles[theme]},variant=stableHash(String(room.id||room.name||''))%3;if(['parlor','gallery','circulation'].includes(identity))finish.wall=[MAT.wall,MAT.navyDamask,MAT.plumDamask][variant];if(identity==='conservatory')finish.wall=MAT.sageDamask;const authored=String(room.flooring||'').toLowerCase();if(/checker/.test(authored))finish.floor=MAT.checker;else if(/stone|marble/.test(authored))finish.floor=MAT.crypt;else if(/parquet/.test(authored))finish.floor=MAT.parquet;else if(/wood|oak|hardwood/.test(authored))finish.floor=MAT.floor;return {...finish,variant};
}

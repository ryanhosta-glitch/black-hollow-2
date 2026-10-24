import {stableHash} from './forge_exterior_style.mjs';
import {MAT} from './forge_glb.mjs';
import {resolveRoomProfile} from '../casa_game/room_profiles.mjs';
export function roomFinish(room){
 const profile=resolveRoomProfile(room),identity=profile.identity;
 const theme=profile.finishTheme;
 const styles={crypt:{floor:MAT.crypt,wall:MAT.crypt,ceiling:MAT.stone,panel:MAT.stone,trim:MAT.stone},laboratory:{floor:MAT.conservatory,wall:MAT.laboratory,ceiling:MAT.ceiling,panel:MAT.laboratory,trim:MAT.metal},conservatory:{floor:MAT.conservatory,wall:MAT.library,ceiling:MAT.ceiling,panel:MAT.wood,trim:MAT.metal},ballroom:{floor:MAT.parquet,wall:MAT.wall,ceiling:MAT.plaster,panel:MAT.wood,trim:MAT.trim},bedroom:{floor:MAT.floor,wall:MAT.bedroom,ceiling:MAT.plaster,panel:MAT.wood,trim:MAT.trim},library:{floor:MAT.floor,wall:MAT.library,ceiling:MAT.wood,panel:MAT.wood,trim:MAT.trim},parlor:{floor:MAT.floor,wall:MAT.wall,ceiling:MAT.plaster,panel:MAT.wood,trim:MAT.trim}};
 const finish={theme,...styles[theme]},variant=stableHash(String(room.id||room.name||''))%3;if(['parlor','gallery','circulation'].includes(identity))finish.wall=[MAT.wall,MAT.navyDamask,MAT.plumDamask][variant];if(identity==='conservatory')finish.wall=MAT.sageDamask;const authored=String(room.flooring||'').toLowerCase();if(/checker/.test(authored))finish.floor=MAT.checker;else if(/stone|marble/.test(authored))finish.floor=MAT.crypt;else if(/parquet/.test(authored))finish.floor=MAT.parquet;else if(/wood|oak|hardwood/.test(authored))finish.floor=MAT.floor;for(const key of ['floor','wall','ceiling','panel','trim']){const value=room.finishes?.[key];if(Number.isInteger(value)&&Object.values(MAT).includes(value))finish[key]=value;else if(typeof value==='string'&&Object.hasOwn(MAT,value))finish[key]=MAT[value];}return {...finish,variant};
}

export function authoredFinishIssues(room){
 return Object.entries(room.finishes||{}).filter(([key,value])=>!['floor','wall','ceiling','panel','trim'].includes(key)||!(Number.isInteger(value)&&Object.values(MAT).includes(value))&&!(typeof value==='string'&&Object.hasOwn(MAT,value))).map(([field,value])=>({severity:'ADVISORY',code:'AUTHORED_FINISH_UNSUPPORTED',roomId:room.id,field,value,sourcePreserved:true}));
}

import {resolveRoomAtmosphere,atmosphereMaterial} from '../casa_game/room_atmosphere_profiles.mjs';
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

/** Dimensional finish treatments: the palette remains shared and authored overrides win. */
export function architecturalTreatment(room){
 const profile=resolveRoomProfile(room),finish=roomFinish(room),id=profile.identity;
 const mode=id==='crypt'?'stone':id==='laboratory'?'ceramic':id==='conservatory'?'iron':id==='library'?'mahogany':id==='nursery'?'restrained':id==='circulation'?'passage':id==='bedroom'?'plaster':'carved';
 const restrained=['restrained','passage','ceramic','iron'].includes(mode),formal=['ballroom','dining','gallery'].includes(id);
 const authored=room.finishes||{};
 const treatment={identity:id,mode,restrained,formal,finish,
  field:finish.panel,relief:authored.panel!=null?finish.panel:mode==='stone'?MAT.stone:mode==='ceramic'?MAT.laboratory:mode==='iron'?MAT.metal:mode==='plaster'||mode==='restrained'?MAT.plaster:MAT.wood,
  crown:authored.ceiling!=null?finish.ceiling:['stone','ceramic','iron','mahogany'].includes(mode)?finish.panel:MAT.plaster,
  accent:authored.trim!=null?finish.trim:mode==='stone'?MAT.stone:mode==='ceramic'||mode==='iron'?MAT.metal:id==='nursery'?MAT.trim:MAT.metal,
  panelHeight:Math.min(+room.h*.35,id==='dining'?4.2:id==='gallery'?3.8:mode==='restrained'?2.8:3.35),
  bayWidth:id==='dining'?4.4:id==='library'?3.3:4.0,
  projection:restrained?.22:.32,
  ceiling:!['passage','ceramic','iron'].includes(mode),
  cofferMaterial:authored.ceiling!=null?finish.ceiling:mode==='mahogany'?MAT.wood:mode==='stone'?MAT.stone:MAT.plaster
 };
 const policy=resolveRoomAtmosphere(room);for(const [field,authorField] of Object.entries({field:'panel',relief:'panel',accent:'trim',crown:'ceiling',cofferMaterial:'ceiling'}))if(authored[authorField]==null)treatment[field]=atmosphereMaterial(treatment[field],policy);return treatment;
}

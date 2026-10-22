import {MAT} from './forge_glb.mjs';
export function roomFinish(room){
 const name=[room.roomType,room.type,room.name].filter(Boolean).join(' ').toLowerCase();
 const theme=/crypt|dungeon|basement/.test(name)?'crypt':/laboratory|lab\b/.test(name)?'laboratory':/conservatory|glasshouse|greenhouse/.test(name)?'conservatory':/ballroom|music|dining/.test(name)?'ballroom':/bed|nursery/.test(name)?'bedroom':/library|study|observatory/.test(name)?'library':'parlor';
 const styles={crypt:{floor:MAT.crypt,wall:MAT.crypt,ceiling:MAT.stone,panel:MAT.stone,trim:MAT.stone},laboratory:{floor:MAT.conservatory,wall:MAT.laboratory,ceiling:MAT.ceiling,panel:MAT.laboratory,trim:MAT.metal},conservatory:{floor:MAT.conservatory,wall:MAT.library,ceiling:MAT.ceiling,panel:MAT.wood,trim:MAT.metal},ballroom:{floor:MAT.parquet,wall:MAT.wall,ceiling:MAT.ceiling,panel:MAT.wood,trim:MAT.trim},bedroom:{floor:MAT.floor,wall:MAT.bedroom,ceiling:MAT.ceiling,panel:MAT.wood,trim:MAT.trim},library:{floor:MAT.floor,wall:MAT.library,ceiling:MAT.wood,panel:MAT.wood,trim:MAT.trim},parlor:{floor:MAT.floor,wall:MAT.wall,ceiling:MAT.ceiling,panel:MAT.wood,trim:MAT.trim}};
 return {theme,...styles[theme]};
}

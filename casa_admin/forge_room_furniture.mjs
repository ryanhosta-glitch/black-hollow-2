import {heirloomFurnitureParts} from './forge_heirloom_furniture.mjs';
import {REFERENCE_FURNITURE,referenceFurnitureParts} from './forge_reference_furniture.mjs';
// Small built-in ensembles share the compiler's material palette and collision plan.
export const ROOM_FURNITURE={side_table:{footprint:[.50,.50],height:.65},bed:{footprint:[1.65,2.1],height:2.35},laboratory_bench:{footprint:[1.5,.72],height:1.25},plant_stand:{footprint:[.64,.64],height:1.25},sarcophagus:{footprint:[.85,1.85],height:.98},console:{footprint:[.86,.38],height:.92}};
export function roomFurnitureParts(item){const upgraded=heirloomFurnitureParts(item);if(upgraded)return upgraded;const out=[],[x,y,z]=item.positionMeters,angle=item.rotationY||0,cs=Math.cos(angle),sn=Math.sin(angle),box=(a,b,c,w,h,d,mat=5)=>out.push({c:[x+a*cs+c*sn,y+b,z-a*sn+c*cs],s:[w,h,d],mat,rot:angle,rotAxis:'y'});

 if(item.type==='laboratory_bench'){box(0,.86,0,1.48,.08,.70,7);box(0,.41,-.25,1.40,.80,.11);for(const side of [-1,1])box(side*.65,.42,0,.09,.84,.60);for(let i=0;i<3;i++){box((i-1)*.4,.70,.31,.32,.18,.025,5);box((i-1)*.4,.70,.34,.09,.025,.025,8);}box(0,1.08,-.30,1.3,.30,.04,5);}
 if(item.type==='plant_stand'){box(0,.42,0,.12,.84,.12);box(0,.035,0,.55,.07,.55,7);box(0,.83,0,.57,.06,.57);box(0,.94,0,.30,.18,.30,7);for(let k=0;k<5;k++)box((k-2)*.055,1.12+Math.abs(k-2)*.015,0,.03,.21,.14,16);}
 if(item.type==='sarcophagus'){box(0,.12,0,.84,.24,1.84,7);box(0,.48,0,.70,.48,1.68,15);box(0,.80,0,.84,.16,1.84,7);box(0,.89,0,.12,.025,.68,8);box(0,.89,-.10,.40,.025,.12,8);}

 return out.concat(heirloomParts(item),referenceFurnitureParts(item));}

Object.assign(ROOM_FURNITURE,REFERENCE_FURNITURE,{
 grandfather_clock:{footprint:[.70,.54],height:2.15},curio_cabinet:{footprint:[.95,.50],height:1.9},
 marble_fireplace:{footprint:[1.55,.48],height:1.45},mahogany_fireplace:{footprint:[1.55,.48],height:1.45},fern_urn:{footprint:[.72,.72],height:1.38}
});
export function heirloomParts(item){
 const upgraded=heirloomFurnitureParts(item);if(upgraded)return upgraded;
 const out=[],[x,y,z]=item.positionMeters,a=item.rotationY||0,cs=Math.cos(a),sn=Math.sin(a),box=(u,v,t,w,h,d,mat=5)=>out.push({c:[x+u*cs+t*sn,y+v,z-u*sn+t*cs],s:[w,h,d],mat,rot:a,rotAxis:'y'});
 if(item.type==='fern_urn'){
  box(0,.07,0,.45,.14,.45,7);box(0,.33,0,.20,.42,.20,7);box(0,.57,0,.42,.12,.42,8);box(0,.71,0,.37,.20,.37,7);
  for(let k=0;k<8;k++){const t=k*Math.PI/4;box(Math.sin(t)*.13,.94,Math.cos(t)*.13,.06,.36,.09,16);for(let j=0;j<3;j++)box(Math.sin(t)*(.16+j*.045),1.02+j*.07,Math.cos(t)*(.16+j*.045),.12,.055,.14,16);}
 }
 return out;
}

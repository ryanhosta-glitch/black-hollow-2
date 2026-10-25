import {fireplaceSurroundParts} from './forge_fireplace_surround.mjs';
import {REFERENCE_FURNITURE,referenceFurnitureParts} from './forge_reference_furniture.mjs';
// Small built-in ensembles share the compiler's material palette and collision plan.
export const ROOM_FURNITURE={bed:{footprint:[1.65,2.1],height:2.35},laboratory_bench:{footprint:[1.5,.72],height:1.25},plant_stand:{footprint:[.64,.64],height:1.25},sarcophagus:{footprint:[.85,1.85],height:.98},console:{footprint:[.86,.38],height:.92}};
export function roomFurnitureParts(item){const out=[],[x,y,z]=item.positionMeters,angle=item.rotationY||0,cs=Math.cos(angle),sn=Math.sin(angle),box=(a,b,c,w,h,d,mat=5)=>out.push({c:[x+a*cs+c*sn,y+b,z-a*sn+c*cs],s:[w,h,d],mat,rot:angle,rotAxis:'y'});
 if(item.type==='bed'){for(const side of [-1,1])for(const end of [-1,1]){box(side*.77,1.18,end*.98,.075,2.30,.075,5);box(side*.77,2.30,end*.98,.11,.10,.13,8);}box(0,2.25,0,1.64,.12,2.08,5);box(0,2.18,0,1.52,.035,1.96,6);for(const side of [-1,1]){box(side*.75,1.67,-.72,.055,1.05,.46,6);box(side*.75,1.67,.77,.055,1.05,.36,6);box(side*.75,2.12,0,.065,.20,2.02,6);}for(const end of [-1,1]){box(0,2.12,end*.98,1.55,.20,.055,6);box(0,2.24,end*1.01,1.62,.035,.025,8);}box(0,.30,0,1.63,.18,2.07);box(0,.46,0,1.5,.16,1.94,3);box(0,.55,.28,1.48,.025,1.30,6);box(0,.80,-.98,1.63,.60,.09);for(const side of [-1,1]){box(side*.77,.64,-.98,.08,.93,.10,8);box(side*.77,.22,.93,.08,.44,.08);}for(const side of [-1,1])box(side*.37,.59,-.68,.58,.13,.35,3);}
 if(item.type==='laboratory_bench'){box(0,.86,0,1.48,.08,.70,7);box(0,.41,-.25,1.40,.80,.11);for(const side of [-1,1])box(side*.65,.42,0,.09,.84,.60);for(let i=0;i<3;i++){box((i-1)*.4,.70,.31,.32,.18,.025,5);box((i-1)*.4,.70,.34,.09,.025,.025,8);}box(0,1.08,-.30,1.3,.30,.04,5);}
 if(item.type==='plant_stand'){box(0,.42,0,.12,.84,.12);box(0,.035,0,.55,.07,.55,7);box(0,.83,0,.57,.06,.57);box(0,.94,0,.30,.18,.30,7);for(let k=0;k<5;k++)box((k-2)*.055,1.12+Math.abs(k-2)*.015,0,.03,.21,.14,16);}
 if(item.type==='sarcophagus'){box(0,.12,0,.84,.24,1.84,7);box(0,.48,0,.70,.48,1.68,15);box(0,.80,0,.84,.16,1.84,7);box(0,.89,0,.12,.025,.68,8);box(0,.89,-.10,.40,.025,.12,8);}
 if(item.type==='console'){box(0,.83,0,.84,.08,.36);box(0,.70,0,.74,.18,.27);for(const side of [-1,1]){box(side*.34,.37,0,.06,.74,.26);box(side*.20,.72,.15,.045,.035,.025,8);}box(0,.06,0,.75,.07,.28);}
 return out.concat(heirloomParts(item),referenceFurnitureParts(item),...(item.type==='bed'?[referenceFurnitureParts({...item,type:'gothic_headboard',positionMeters:[x-.90*sn,y,z-.90*cs]})]:[]));}

Object.assign(ROOM_FURNITURE,REFERENCE_FURNITURE,{
 grandfather_clock:{footprint:[.70,.54],height:2.15},curio_cabinet:{footprint:[.95,.50],height:1.9},
 marble_fireplace:{footprint:[1.55,.48],height:1.45},mahogany_fireplace:{footprint:[1.55,.48],height:1.45},fern_urn:{footprint:[.72,.72],height:1.38}
});
export function heirloomParts(item){
 const out=[],[x,y,z]=item.positionMeters,a=item.rotationY||0,cs=Math.cos(a),sn=Math.sin(a),box=(u,v,t,w,h,d,mat=5)=>out.push({c:[x+u*cs+t*sn,y+v,z-u*sn+t*cs],s:[w,h,d],mat,rot:a,rotAxis:'y'});
 if(item.type==='grandfather_clock'){
  box(0,.09,0,.64,.18,.42);box(0,.91,0,.48,1.55,.33);box(0,1.78,0,.62,.58,.40);box(0,2.09,0,.67,.12,.44,8);box(0,1.80,.211,.43,.43,.025,3);
  for(let i=0;i<12;i++){const t=i*Math.PI/6;box(Math.sin(t)*.16,1.80+Math.cos(t)*.16,.23,.018,.035,.012,5);}box(.07,1.81,.244,.14,.016,.015,5);box(0,1.87,.244,.018,.15,.015,5);
  box(0,.96,.174,.30,1.07,.018,9);box(0,1.03,.19,.018,.72,.018,8);box(0,.69,.20,.15,.15,.025,8);for(const side of [-1,1])box(side*.21,.98,.20,.035,1.24,.045,8);
 }
 if(item.type==='curio_cabinet'){
  box(0,.12,0,.94,.16,.42);box(0,1.02,-.17,.88,1.68,.06);box(0,1.85,0,.95,.10,.42,8);
  for(const side of [-1,1]){box(side*.43,1,0,.065,1.72,.38);box(side*.44,.07,0,.065,.14,.32);}
  for(let shelf=0;shelf<4;shelf++){const sy=.34+shelf*.36;box(0,sy,0,.83,.035,.34);for(let j=0;j<3;j++){box((j-1)*.23,sy+.12,0,.10,.22,.10,shelf%2?9:3);box((j-1)*.23,sy+.24,0,.06,.025,.06,8);}}
  box(0,1.06,.185,.81,1.47,.015,9);box(0,1.06,.20,.025,1.50,.025,8);for(const sign of [-1,1])box(sign*.045,1.03,.23,.025,.08,.025,8);
 }
 if(['marble_fireplace','mahogany_fireplace'].includes(item.type)){out.push(...fireplaceSurroundParts(item));}
 if(item.type==='fern_urn'){
  box(0,.07,0,.45,.14,.45,7);box(0,.33,0,.20,.42,.20,7);box(0,.57,0,.42,.12,.42,8);box(0,.71,0,.37,.20,.37,7);
  for(let k=0;k<8;k++){const t=k*Math.PI/4;box(Math.sin(t)*.13,.94,Math.cos(t)*.13,.06,.36,.09,16);for(let j=0;j<3;j++)box(Math.sin(t)*(.16+j*.045),1.02+j*.07,Math.cos(t)*(.16+j*.045),.12,.055,.14,16);}
 }
 return out;
}

// Small built-in ensembles share the compiler's material palette and collision plan.
export const ROOM_FURNITURE={bed:{footprint:[1.65,2.1],height:1.12},laboratory_bench:{footprint:[1.5,.72],height:1.25},plant_stand:{footprint:[.64,.64],height:1.25},sarcophagus:{footprint:[.85,1.85],height:.98},console:{footprint:[.86,.38],height:.92}};
export function roomFurnitureParts(item){const out=[],[x,y,z]=item.positionMeters,angle=item.rotationY||0,cs=Math.cos(angle),sn=Math.sin(angle),box=(a,b,c,w,h,d,mat=5)=>out.push({c:[x+a*cs+c*sn,y+b,z-a*sn+c*cs],s:[w,h,d],mat,rot:angle,rotAxis:'y'});
 if(item.type==='bed'){box(0,.30,0,1.63,.18,2.07);box(0,.46,0,1.5,.16,1.94,3);box(0,.55,.28,1.48,.025,1.30,6);box(0,.80,-.98,1.63,.60,.09);for(const side of [-1,1]){box(side*.77,.64,-.98,.08,.93,.10,8);box(side*.77,.22,.93,.08,.44,.08);}for(const side of [-1,1])box(side*.37,.59,-.68,.58,.13,.35,3);}
 if(item.type==='laboratory_bench'){box(0,.86,0,1.48,.08,.70,7);box(0,.41,-.25,1.40,.80,.11);for(const side of [-1,1])box(side*.65,.42,0,.09,.84,.60);for(let i=0;i<3;i++){box((i-1)*.4,.70,.31,.32,.18,.025,5);box((i-1)*.4,.70,.34,.09,.025,.025,8);}box(0,1.08,-.30,1.3,.30,.04,5);}
 if(item.type==='plant_stand'){box(0,.42,0,.12,.84,.12);box(0,.035,0,.55,.07,.55,7);box(0,.83,0,.57,.06,.57);box(0,.94,0,.30,.18,.30,7);for(let k=0;k<5;k++)box((k-2)*.055,1.12+Math.abs(k-2)*.015,0,.03,.21,.14,16);}
 if(item.type==='sarcophagus'){box(0,.12,0,.84,.24,1.84,7);box(0,.48,0,.70,.48,1.68,15);box(0,.80,0,.84,.16,1.84,7);box(0,.89,0,.12,.025,.68,8);box(0,.89,-.10,.40,.025,.12,8);}
 if(item.type==='console'){box(0,.83,0,.84,.08,.36);box(0,.70,0,.74,.18,.27);for(const side of [-1,1]){box(side*.34,.37,0,.06,.74,.26);box(side*.20,.72,.15,.045,.035,.025,8);}box(0,.06,0,.75,.07,.28);}
 return out;}

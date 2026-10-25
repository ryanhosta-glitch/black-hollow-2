/** Real safe, flat regions of current heirloom models, in furniture-local metres.
 * Rounded edges, pillows, existing dining plates and task-lamp corners are excluded.
 */
export const FURNITURE_SURFACES=Object.freeze({
 writing_desk:{top:.785,width:.73,depth:.38,u:-.115,v:0},
 laboratory_bench:{top:.90,width:.86,depth:.43,u:-.14,v:.035},
 console:{top:.89,width:.62,depth:.25,u:0,v:0},
 side_table:{top:.63,width:.35,depth:.35,u:0,v:0},
 dining_table:{top:.76,width:1.57,depth:.73,u:0,v:0},
 banquet_ensemble:{top:.818,width:.27,depth:2.36,u:0,v:0},
 supper_table:{top:.818,width:.27,depth:.74,u:0,v:0},
 bed:{top:.6325,width:1.06,depth:.85,u:0,v:.30},
 sarcophagus:{top:.88,width:.55,depth:.42,u:0,v:.64}
});
for(const surface of Object.values(FURNITURE_SURFACES))Object.freeze(surface);
export function furnitureSurface(item){
 const spec=FURNITURE_SURFACES[item.type];if(!spec||item.source?.allowAccessories===false||item.source?.surfaceObjects?.length||item.source?.accessories?.length)return null;
 return {id:String(item.id),kind:item.type,positionMeters:[...item.positionMeters],rotationY:item.rotationY||0,...spec};
}

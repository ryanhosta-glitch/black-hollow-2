const point=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
export function parkFootprint(position,width,depth,yaw=0){
 const corners=[];for(const x of [-width/2,width/2])for(const z of [-depth/2,depth/2])corners.push([position[0]+x*Math.cos(yaw)+z*Math.sin(yaw),0,position[2]-x*Math.sin(yaw)+z*Math.cos(yaw)]);
 return {minX:Math.min(...corners.map(p=>p[0])),maxX:Math.max(...corners.map(p=>p[0])),minZ:Math.min(...corners.map(p=>p[2])),maxZ:Math.max(...corners.map(p=>p[2]))};
}
export function footprintFree(bounds,canStand){if(!bounds||!Object.values(bounds).every(Number.isFinite))return false;for(const x of [bounds.minX,(bounds.minX+bounds.maxX)/2,bounds.maxX])for(const z of [bounds.minZ,(bounds.minZ+bounds.maxZ)/2,bounds.maxZ])if(!canStand(x,z,.18))return false;return true;}
/** Verge-only placements: sidewalks end at local |x|=6.3; authored previews start at |x|>=8.8. */
export function planMidwayVerge(lot,{canStand=()=>false}={}){
 if(!lot?.lane?.toWorld||!lot.localLot||![-1,1].includes(lot.side)||!Number.isFinite(lot.localLot.z))return null;
 const side=lot.side,z=lot.localLot.z,yaw=-side*Math.PI/2+lot.lane.angle;
 for(const offset of [4.5,-4.5,6.4,-6.4]){
  const position=lot.lane.toWorld([side*7.15,0,z+offset]),bounds=parkFootprint(position,1.95,.28,yaw);
  if(point(lot.door)&&Math.hypot(position[0]-lot.door[0],position[2]-lot.door[2])<3)continue;
  if(!footprintFree(bounds,canStand))continue;
  const direction=Math.sign(offset),queuePosition=lot.lane.toWorld([side*7.8,0,z+offset+direction*2.1]),queueBounds=parkFootprint(queuePosition,.72,1.75,lot.lane.angle);
  return {position,yaw,bounds,queue:Math.abs(offset)<5&&footprintFree(queueBounds,canStand)?{position:queuePosition,yaw:lot.lane.angle,bounds:queueBounds}:null};
 }
 return null;
}
export function parkPointBlocked(blockers,x,z,r=.22){return blockers.some(b=>x>b.minX-r&&x<b.maxX+r&&z>b.minZ-r&&z<b.maxZ+r);}

// Align each compiled authored entrance with its street-facing front path.
function localEntrance(THREE,house,model,lot){
 const r=house.rooms.find(r=>r.id===house.manifest.entry?.roomId),o=r?.openings?.find(o=>o.id===house.manifest.entry?.openingId);if(!r||!o||o.shared||o.type!=='door')return null;
 const b=r.boundsFeet,k=.3048,vertical=['left','right'].includes(o.wall),span=(vertical?b.w:b.l)*k,along=span*(Number.isFinite(Number(o.pos))?Number(o.pos):.5),y=house.manifest.floors[r.floor]?.elevationMeters??0;
 const p=new THREE.Vector3((b.x+(o.wall==='right'?b.l:0))*k,y,(b.y+(o.wall==='bottom'?b.w:0))*k);if(vertical)p.z=b.y*k+along;else p.x=b.x*k+along;
 const normal={top:[0,0,-1],bottom:[0,0,1],left:[-1,0,0],right:[1,0,0]}[o.wall];if(!normal)return null;
 const bounds=new THREE.Box3().setFromObject(model),angle=Math.atan2(-lot.side,0)-Math.atan2(normal[0],normal[2]);
 const offsets=[];for(const x of [bounds.min.x,bounds.max.x])for(const z of [bounds.min.z,bounds.max.z])offsets.push(new THREE.Vector3(x-p.x,0,z-p.z).applyAxisAngle(new THREE.Vector3(0,1,0),angle));
 const front=Math.min(...offsets.map(v=>v.x*lot.side)),back=Math.max(...offsets.map(v=>v.x*lot.side)),lateral=Math.max(...offsets.map(v=>Math.abs(v.z)));
 const scale=Math.min(1.3,14/Math.max(.01,back-front),7.5/Math.max(.01,lateral)),setback=Math.max(10.8,8.8-front*scale),entry=new THREE.Vector3(lot.side*setback,.10,lot.z),rotated=p.clone().multiplyScalar(scale).applyAxisAngle(new THREE.Vector3(0,1,0),angle);

 return {sourcePosition:p.toArray(),sourceNormal:normal,position:entry.toArray(),rotationY:Math.atan2(-lot.side,0),modelRotationY:angle,scale,translation:entry.clone().sub(rotated).toArray(),width:(o.clearWidthMeters||Number(o.width)*k||1.08)*scale,height:Math.min(2.4,(Number(o.height)*k||2.4))*scale,openingId:o.id};
}

export function streetEntrance(THREE,house,model,lot){const e=localEntrance(THREE,house,model,lot.localLot||lot);if(!e||!lot.lane)return e;return {...e,localEntrance:e,position:lot.lane.toWorld(e.position),translation:lot.lane.toWorld(e.translation),rotationY:e.rotationY+lot.lane.angle,modelRotationY:e.modelRotationY+lot.lane.angle};}

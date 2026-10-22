// Align each compiled authored entrance with its street-facing front path.
export function streetEntrance(THREE,house,model,lot){
 const r=house.rooms.find(r=>r.id===house.manifest.entry?.roomId),o=r?.openings?.find(o=>o.id===house.manifest.entry?.openingId);if(!r||!o||o.shared||o.type!=='door')return null;
 const b=r.boundsFeet,k=.3048,vertical=['left','right'].includes(o.wall),span=(vertical?b.w:b.l)*k,along=span*(Number.isFinite(Number(o.pos))?Number(o.pos):.5),y=house.manifest.floors[r.floor]?.elevationMeters??0;
 const p=new THREE.Vector3((b.x+(o.wall==='right'?b.l:0))*k,y,(b.y+(o.wall==='bottom'?b.w:0))*k);if(vertical)p.z=b.y*k+along;else p.x=b.x*k+along;
 const normal={top:[0,0,-1],bottom:[0,0,1],left:[-1,0,0],right:[1,0,0]}[o.wall];if(!normal)return null;
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),scale=Math.min(14/Math.max(size.x,size.z),1.3),angle=Math.atan2(-lot.side,0)-Math.atan2(normal[0],normal[2]),rotated=p.clone().multiplyScalar(scale).applyAxisAngle(new THREE.Vector3(0,1,0),angle),entry=new THREE.Vector3(lot.side*10.8,.10,lot.z);
 return {sourcePosition:p.toArray(),sourceNormal:normal,position:entry.toArray(),rotationY:Math.atan2(-lot.side,0),modelRotationY:angle,scale,translation:entry.clone().sub(rotated).toArray(),width:(o.clearWidthMeters||Number(o.width)*k||1.08)*scale,height:Math.min(2.4,(Number(o.height)*k||2.4))*scale,openingId:o.id};
}

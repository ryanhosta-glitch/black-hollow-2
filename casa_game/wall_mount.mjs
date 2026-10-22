// Shared by Forge and the haunting layer. A wall prop needs a solid, aperture-free span.
const FT=.3048;
export function wallMount(room,{width=.8,height=.9,y=1.6,inset=.22,preferred=['top','bottom','left','right']}={}){
 const b=room.boundsFeet||room.bounds||room,x=Number(b.x)*FT,z=Number(b.y)*FT,w=Number(b.l)*FT,d=Number(b.w)*FT,h=Number(b.h)*FT;
 if(![x,z,w,d,h,width,height,y].every(Number.isFinite)||width<=0||height<=0||y-height/2<.15||y+height/2>h-.15)return null;
 for(const side of preferred){
  const vertical=side==='left'||side==='right',span=vertical?d:w,margin=width/2+.16;
  if(span<2*margin)continue;
  const gaps=(room.openings||[]).filter(o=>o.wall===side).map(o=>{const center=Math.max(0,Math.min(1,Number(o.pos??.5)))*span,openingWidth=Math.min(span,Number(o.clearWidthMeters??(o.type==='window'?1.65:1.08)));return [center-openingWidth/2-margin,center+openingWidth/2+margin];}).sort((a,b)=>a[0]-b[0]);
  let cursor=margin;const slots=[];for(const [lo,hi]of gaps){if(lo>cursor)slots.push([cursor,Math.min(lo,span-margin)]);cursor=Math.max(cursor,hi);}if(cursor<span-margin)slots.push([cursor,span-margin]);
  const slot=slots.filter(([a,b])=>b>a).sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]))[0];if(!slot)continue;const at=(slot[0]+slot[1])/2;
  const normal=side==='top'?[0,0,1]:side==='bottom'?[0,0,-1]:side==='left'?[1,0,0]:[-1,0,0];
  return {wall:side,position:[vertical?(side==='left'?x:x+w):x+at,y,vertical?z+at:(side==='top'?z:z+d)].map((v,i)=>v+normal[i]*inset),normal,rotationY:{top:0,bottom:Math.PI,left:Math.PI/2,right:-Math.PI/2}[side]};
 }
 return null;
}

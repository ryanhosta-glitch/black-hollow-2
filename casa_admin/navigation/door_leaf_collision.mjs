// Circle against an oriented door: caller transforms the center to leaf-local space.
// Keep the same footprint while closed, moving, or fully open.
export function circleTouchesRectangle(x,z,minX,maxX,minZ,maxZ,radius){
 const cx=Math.max(minX,Math.min(maxX,x));
 const cz=Math.max(minZ,Math.min(maxZ,z));
 return (x-cx)**2+(z-cz)**2 < radius**2;
}

// Conservative continuous sweep against a rectangle expanded by the rider radius.
// Slab intersection cannot skip a thin collider between sampled points.
export function segmentTouchesRectangle(a,b,minX,maxX,minZ,maxZ,radius){
 let enter=0,leave=1;for(const [axis,low,high]of [[0,minX-radius,maxX+radius],[2,minZ-radius,maxZ+radius]]){const d=b[axis]-a[axis];if(Math.abs(d)<1e-12){if(a[axis]<low||a[axis]>high)return false;continue;}const t0=(low-a[axis])/d,t1=(high-a[axis])/d;enter=Math.max(enter,Math.min(t0,t1));leave=Math.min(leave,Math.max(t0,t1));if(enter>leave)return false;}return true;
}

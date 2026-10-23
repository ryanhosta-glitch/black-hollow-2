export function drawingPixelRatio(width,height,deviceRatio=1){
 const area=Math.max(1,width)*Math.max(1,height);
 return Math.min(deviceRatio||1,1.5,Math.sqrt(1280*720/area));
}

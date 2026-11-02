// Shared physical node positions for both rendering and route planning.
export function samplePath(path,count){
 if(!Number.isInteger(count)||count<1)throw Error('A fixture needs at least one node.');
 const points=path.pointsMeters,lengths=[0],distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 if(!Array.isArray(points)||points.length<2)throw Error('A lighting path needs two points.');
 for(let i=1;i<points.length;i++)lengths.push(lengths.at(-1)+distance(points[i],points[i-1]));
 const closed=distance(points[0],points.at(-1))<.001,normal=path.normal||[0,0,-1];
 return Array.from({length:count},(_,i)=>{const d=lengths.at(-1)*(count===1?.5:i/(closed?count:count-1));let k=1;while(k<lengths.length-1&&lengths[k]<d)k++;const a=points[k-1],b=points[k],fraction=(d-lengths[k-1])/Math.max(.000001,lengths[k]-lengths[k-1]);return a.map((v,j)=>v+(b[j]-v)*fraction+normal[j]*.08);});
}

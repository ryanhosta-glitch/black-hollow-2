// A continuous draped surface: rounded hood, sloping shoulders, folded skirt,
// and an uneven floating hem. No primitive head/body seam.
export function createFabricGhost(THREE,{kind=0,color=0xc4dce9,reducedMotion=false}={}){
 const group=new THREE.Group(),rings=24,segments=40,positions=[],indices=[],phase=kind*1.71;
 function point(v,a,time=0){
  const cap=v<.19,capT=Math.min(1,v/.19),radius=cap?.24*Math.sin(capT*Math.PI/2):.24+.27*Math.pow((v-.19)/.81,1.35);
  const skirt=Math.max(0,(v-.2)/.8),fold=Math.sin(a*8+v*2.4+phase)*(.012+.047*skirt)+Math.sin(a*3+phase)*.024*skirt;
  const sway=reducedMotion?0:Math.sin(time*1.1+v*3+phase)*.065*skirt;
  const r=radius+fold,hem=Math.pow(v,5)*(.09*Math.sin(a*5+phase)+.035*Math.sin(a*9+time*1.5));
  return [Math.cos(a)*r+sway,1.98-v*1.65+hem,Math.sin(a)*r*.82+Math.sin(time*.8+v*4)*.035*skirt];
 }
 for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++)positions.push(...point(j/rings,i/segments*Math.PI*2));
 for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,b,a+1,b+1);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({color,roughness:.96,metalness:0,transparent:true,opacity:.76,side:THREE.DoubleSide,depthWrite:false,emissive:color,emissiveIntensity:.07});
 const cloth=new THREE.Mesh(geometry,material);cloth.name='flowing spectral fabric';group.add(cloth);
 let last=-Infinity;
 group.userData.animateFabric=time=>{if(reducedMotion||time-last<80)return;last=time;const attr=geometry.attributes.position;for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++)attr.setXYZ(j*(segments+1)+i,...point(j/rings,i/segments*Math.PI*2,time/1000));attr.needsUpdate=true;geometry.computeVertexNormals();};
 return group;
}

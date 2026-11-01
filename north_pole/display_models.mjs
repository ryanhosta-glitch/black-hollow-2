// Yard models are project data, not edits to the checksummed house package.
export function validateDisplayModel(p){
 const number=(x,min,max)=>Number.isFinite(x)&&x>=min&&x<=max;
 if(!p||typeof p.id!=='string'||!p.id||p.id.length>100||typeof p.name!=='string'||p.name.length>60||!['arch','strand-tree'].includes(p.type)||!number(p.x,-500,500)||!number(p.y,-20,100)||!number(p.z,-500,500)||!number(p.width,.3,20)||!number(p.height,.3,20)||!number(p.rotation,-360,360)||!Number.isInteger(p.nodes)||p.nodes<2||p.nodes>170||!Number.isInteger(p.strands)||p.strands<2||p.strands>32)throw Error('Invalid yard model dimensions or pixel count.');
 return p;
}
export function displayPaths(p){
 validateDisplayModel(p);const angle=p.rotation*Math.PI/180;
 const world=(x,y,z)=>[p.x+x*Math.cos(angle)-z*Math.sin(angle),p.y+y,p.z+x*Math.sin(angle)+z*Math.cos(angle)];
 const path=(suffix,points)=>({id:`prop:${p.id}:${suffix}`,kind:p.type,propId:p.id,name:p.name+(p.type==='strand-tree'?' · strand '+(Number(suffix)+1):''),pointsMeters:points,normal:[0,0,0],suggestedNodes:p.nodes});
 if(p.type==='arch')return [path('arch',Array.from({length:65},(_,i)=>{const t=i/64*Math.PI;return world(-Math.cos(t)*p.width/2,Math.sin(t)*p.height,0);}))];
 // Each strand starts at the shared top and ends on the base ring.
 return Array.from({length:p.strands},(_,i)=>{const a=i/p.strands*Math.PI*2;return path(String(i),[world(0,p.height,0),world(Math.cos(a)*p.width/2,0,Math.sin(a)*p.width/2)]);});
}
export function projectPaths(project){return [...(project.house?.anchors||[]),...(project.props||[]).flatMap(displayPaths)];}
export function newDisplayModel(type,house,overrides={}){const b=house?.yardBounds||{minX:-6,maxX:6,minZ:-6,maxZ:6};return validateDisplayModel({id:crypto.randomUUID(),name:type==='arch'?'Light arch':'Strand tree',type,x:(b.minX+b.maxX)/2,y:.1,z:b.minZ-1.5,width:type==='arch'?2.4:2,height:type==='arch'?1.5:3,rotation:0,nodes:24,strands:8,...overrides});}
export function rideShowInfo(project){return {houseRole:project.houseRole==='training'?'training':'student',houseId:project.house?.houseId,houseName:project.house?.name,fixtureCount:project.fixtures.length,displayModelCount:project.props?.length||0};}

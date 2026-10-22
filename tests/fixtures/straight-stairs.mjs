export function straightStairFixture(height=10){
 const room=(id,name)=>({id,name,x:-20,y:0,l:20,w:28,h:height,openings:[]});
 const lower=room('foyer','Lower Foyer'),upper=room('gallery','Upper Gallery');
 lower.openings=[{id:'entry',wall:'top',type:'door',pos:.5},{id:'lower-link',shared:'lower-stair',wall:'right',type:'arch',pos:.07}];
 upper.openings=[{id:'upper-link',shared:'upper-stair',wall:'right',type:'arch',pos:.93}];
 const flight=(id,pos,shared)=>({id,name:'Straight Staircase',type:'staircase',stairLink:'east-flight',stairDirection:'z+',x:0,y:0,l:8,w:28,h:height,openings:[{id:id+'-entry',wall:'left',type:'arch',pos,shared}]});
 return {name:'Straight Stair Validation',gameEntry:{roomId:lower.id,openingId:'entry'},floors:[{name:'Ground',rooms:[lower,flight('stairs-low',.07,'lower-stair')]},{name:'Upper',rooms:[upper,flight('stairs-high',.93,'upper-stair')]}]};
}

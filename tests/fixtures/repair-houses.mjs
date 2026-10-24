import {adjacentDoorFixture} from './adjacent-doors.mjs';
const room=(id,x=0)=>({id,x,y:0,l:12,w:12,h:10,openings:[]});
export function repairHouse(index=0){
 const a=room('entry'),b=room('side',12),s={name:'Repair House '+index,floors:[{name:'Main',rooms:[a,b]}]};
 switch(index%9){
 case 0:a.openings=['top','bottom','left','right'].flatMap(wall=>[.15,.5,.85].map((pos,i)=>({id:wall+i,wall,pos,type:'window',width:4})));b.x=40;break;
 case 1:a.openings=[{id:'broken',type:'door',wall:'right',shared:'orphan',pos:1.5}];break;
 case 2:b.x=4;b.y=3;a.openPlanWith=['missing',b.id];break;
 case 3:a.l=1;a.w=2;a.h=3;b.id=a.id;s.floors.push({name:'Empty floor',rooms:[]});break;
 case 4:a.furniture=[{id:'blocked-table',type:'table',x:.5,y:.5,rotation:45},{id:'unknown',type:'dragon',x:.5,y:.5}];a.decor=[{type:'skull'}];a.photos=[{id:'family'}];break;
 case 5:a.elevatorShaftId='bad-shaft';b.elevatorShaftId='bad-shaft';s.gameplay={anchors:[{id:'ghost',role:'seer',roomId:'missing',approachMeters:[999,0,999]}]};break;
 case 6:a.openings=[{id:'left-pair',type:'door',wall:'right',shared:'mismatch',pos:.1}];b.openings=[{id:'right-pair',type:'door',wall:'left',shared:'mismatch',pos:.9}];s.floors.push({name:'Upper',rooms:[{...room('upper',40),embeddedStair:{type:'spiral'}}]});break;
 case 7:b.y=9.9;a.openings=[{id:'a-b',wall:'right',type:'door',shared:'short-jamb',pos:.9}];b.openings=[{id:'b-a',wall:'left',type:'door',shared:'short-jamb',pos:.1}];a.furniture=[null];break;
 case 8:return {...adjacentDoorFixture(),name:s.name};
 }
 return s;
}

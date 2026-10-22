import {disposeGroup} from './resources.mjs';
export function createNight(THREE,{scene,reducedMotion=false}){
 const root=new THREE.Group();root.name='Moon clouds bats and mist';scene.add(root);
 const moon=new THREE.Mesh(new THREE.SphereGeometry(2.8,24,16),new THREE.MeshBasicMaterial({color:0xd4d9c0}));moon.position.set(-35,43,-65);root.add(moon);
 const clouds=[],mist=[],bats=[];
 const cloudMaterial=new THREE.MeshBasicMaterial({color:0x384453,transparent:true,opacity:.17,depthWrite:false});
 for(let i=0;i<9;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),cloudMaterial);m.scale.set(10+i%3*4,1.3,3.5);m.position.set(-48+i*12,39+i%3,-65-i%2*8);root.add(m);clouds.push(m);}
 const mistMat=new THREE.MeshBasicMaterial({color:0x9babb8,transparent:true,opacity:.045,depthWrite:false});
 for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(1,10,6),mistMat);m.scale.set(5,.13,2.5);root.add(m);mist.push(m);}
 const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(.28,.12);shape.lineTo(.48,.04);shape.lineTo(.40,-.04);shape.lineTo(.26,-.015);shape.lineTo(.14,-.08);shape.lineTo(0,-.04);shape.closePath();
 const wingGeo=new THREE.ShapeGeometry(shape),batMat=new THREE.MeshBasicMaterial({color:0x090d14,side:THREE.DoubleSide});
 for(let i=0;i<7;i++){const g=new THREE.Group(),wings=[];for(const side of [-1,1]){const pivot=new THREE.Group(),wing=new THREE.Mesh(wingGeo,batMat);wing.scale.x=side;pivot.add(wing);g.add(pivot);wings.push(pivot);}root.add(g);bats.push({g,wings,phase:i*2.1});}
 return {root,configure(kind){root.visible=['street','grounds'].includes(kind);},tick(time,position){if(!root.visible)return;const t=reducedMotion?0:time/1000;const baseY=position[1]||0;moon.position.y=baseY+43;moon.position.x=position[0]-35;moon.position.z=position[2]-65;for(let i=0;i<clouds.length;i++){clouds[i].position.y=baseY+39+i%3;clouds[i].position.x=position[0]-48+i*12+Math.sin(t*.009+i)*9;clouds[i].position.z=position[2]-65-i%2*8;}for(let i=0;i<mist.length;i++)mist[i].position.set(position[0]+Math.sin(t*.04+i*2)*15,baseY+.18,position[2]+Math.cos(t*.025+i)*18);for(const b of bats){const a=t*.25+b.phase;b.g.position.set(position[0]+Math.cos(a)*14,baseY+8+Math.sin(a*.7)*2,position[2]-16+Math.sin(a)*10);b.g.rotation.y=-a;for(let i=0;i<2;i++)b.wings[i].rotation.z=reducedMotion?0:Math.sin(t*9+b.phase)*(i?1:-1)*.65;}},dispose(){disposeGroup(root);}};
}

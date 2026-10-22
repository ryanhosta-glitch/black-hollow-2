import {random} from './session.mjs';
// Small repeatable game-owned textures; architectural meshes remain CASA-owned.
export function surfaceTexture(THREE,kind='road',seed=1){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d'),rng=random(seed);
 c.fillStyle=kind==='fabric'?'#b2aaa1':kind==='road'?'#33383e':kind==='wood'?'#49392f':kind==='soil'?'#26362b':'#74736d';c.fillRect(0,0,256,256);
 for(let i=0;i<2600;i++){const v=Math.floor(40+rng()*100);c.fillStyle=`rgba(${v},${v},${v},${.08+rng()*.23})`;c.fillRect(rng()*256,rng()*256,1+rng()*3,1+rng()*2);}
 c.strokeStyle=kind==='wood'?'#251c1a':'#262b29';c.lineWidth=kind==='stone'?2:1;
 if(kind==='stone'){for(let i=0;i<=256;i+=64){c.beginPath();c.moveTo(i,0);c.lineTo(i,256);c.moveTo(0,i);c.lineTo(256,i);c.stroke();}}
 for(let k=0;k<10;k++){let x=rng()*256,y=rng()*256;c.beginPath();c.moveTo(x,y);for(let n=0;n<9;n++){x+=(rng()-.5)*20;y+=kind==='wood'?18:(rng()-.2)*14;c.lineTo(x,y);}c.stroke();}
 if(kind==='fabric'){c.fillStyle='rgba(30,25,30,.07)';for(let i=0;i<256;i+=3){c.fillRect(i,0,1,256);c.fillRect(0,i,256,1);}}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(kind==='road'?4:2,kind==='road'?22:4);texture.anisotropy=2;return texture;
}
export function twoSidedSign(THREE,material,width,height){const group=new THREE.Group();for(const side of [1,-1]){const face=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);face.position.z=side*.016;face.rotation.y=side<0?Math.PI:0;group.add(face);}group.userData.readableBothSides=true;return group;}

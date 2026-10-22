// Cathedral-inspired organ facade: open pipes, speaking mouths, gilded towers.
export function decorateOrganCase(THREE,console){
 const silver=new THREE.MeshStandardMaterial({color:0xc5c7ca,metalness:.6,roughness:.3,emissive:0x253047,emissiveIntensity:.18}),gold=new THREE.MeshStandardMaterial({color:0xc19b53,metalness:.55,roughness:.30,emissive:0x503310,emissiveIntensity:.12}),wood=new THREE.MeshStandardMaterial({color:0x492a21,roughness:.55}),shadow=new THREE.MeshStandardMaterial({color:0x100e16,roughness:.9}),parts=new Map();
 const add=(geo,mat,p,scale=[1,1,1],rotation=[0,0,0])=>{const m=new THREE.Mesh(geo,mat);m.position.set(...p);m.scale.set(...scale);m.rotation.set(...rotation);console.add(m);return m;};
 const batch=(kind,mat,p,s,rotation=[0,0,0])=>{const key=kind+mat.uuid;if(!parts.has(key))parts.set(key,{kind,mat,list:[]});parts.get(key).list.push({p,s,rotation});};
 for(let i=0;i<31;i++){const x=(i-15)*.097,tower=Math.abs(x)>1.04,h=tower?2.4+(1-Math.abs(Math.abs(x)-1.30)/.30)*.85:1.15+1.45*(1-Math.abs(x)/1.04),bottom=2.13,r=tower?.064:.046;
 batch('pipe',silver,[x,bottom+h/2,-.34],[r,h,r]);
 // Dark open crowns and little golden lips make these read as organ pipes.
 batch('disc',shadow,[x,bottom+h+.003,-.34],[r*.79,1,r*.79],[-Math.PI/2,0,0]);
 batch('ring',gold,[x,bottom+h,-.34],[r,r,r],[Math.PI/2,0,0]);
 batch('box',shadow,[x,bottom+.38,-.34+r+.002],[r*1.35,.11,.015]);batch('box',gold,[x,bottom+.45,-.34+r+.016],[r*1.5,.025,.025]);
 batch('ring',gold,[x,bottom+.20,-.34],[r*1.06,r*1.06,r*1.06],[Math.PI/2,0,0]);
 }
 for(const side of [-1,1]){
 for(const x of [side*1.03,side*1.68]){batch('box',wood,[x,3.7,-.42],[.13,3.38,.42]);batch('box',gold,[x,3.72,-.17],[.023,3.40,.025]);batch('box',gold,[x,5.36,-.42],[.23,.11,.54]);add(new THREE.ConeGeometry(.15,.48,8),gold,[x,5.64,-.42]);}
 batch('box',wood,[side*1.35,5.30,-.42],[.78,.16,.54]);batch('box',gold,[side*1.35,5.43,-.42],[.86,.05,.61]);
 // Gilded tracery over each tower, independent of the pipe mouths.
 for(let k=0;k<5;k++){const x=side*(1.10+k*.12);batch('box',gold,[x,4.95,-.15],[.018,.5,.018]);}
 }
 const arch=new THREE.Shape();arch.moveTo(-1.06,4.53);arch.quadraticCurveTo(-.60,4.65,0,5.25);arch.quadraticCurveTo(.6,4.65,1.06,4.53);arch.lineTo(1.06,4.67);arch.quadraticCurveTo(.6,4.80,0,5.43);arch.quadraticCurveTo(-.6,4.8,-1.06,4.67);arch.closePath();add(new THREE.ExtrudeGeometry(arch,{depth:.15,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:1,steps:1}),wood,[0,0,-.43]);
 add(new THREE.TorusGeometry(.19,.026,6,32),gold,[0,4.92,-.23]);for(let i=0;i<8;i++){const a=i*Math.PI/4;batch('box',gold,[Math.cos(a)*.19,4.92+Math.sin(a)*.19,-.21],[.025,.22,.025],[0,0,a]);}
 // Rich panels and inlaid borders around the console and pedalboard.
 for(const x of [-1.05,-.35,.35,1.05]){batch('box',wood,[x,.57,.335],[.62,.64,.055]);for(const side of [-1,1])batch('box',gold,[x+side*.29,.57,.372],[.015,.65,.018]);for(const y of [.25,.89])batch('box',gold,[x,y,.372],[.60,.018,.018]);}
 for(const y of [.14,.96,1.36,2.03])batch('box',gold,[0,y,.47],[3.12,.025,.025]);
 for(const side of [-1,1])for(let i=0;i<8;i++){const x=side*(1.29+(i%2)*.13),y=1.40+Math.floor(i/2)*.15;add(new THREE.CylinderGeometry(.035,.040,.06,10),gold,[x,y,.35],[1,1,1],[Math.PI/2,0,0]);add(new THREE.CircleGeometry(.024,10),shadow,[x,y,.384]);}
 // Music rack, candle sconces and a real engraved score, with no extra lights.
 batch('box',wood,[0,1.78,-.02],[1.12,.60,.08],[-.18,0,0]);
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=512;c.height=320;const ctx=c.getContext('2d');ctx.fillStyle='#d3c19b';ctx.fillRect(0,0,512,320);ctx.fillStyle='#49352c';ctx.font='24px Georgia';ctx.textAlign='center';ctx.fillText('NOCTURNE OF THE HOLLOW',256,38);ctx.strokeStyle='#57453a';for(let staff=0;staff<3;staff++){for(let line=0;line<5;line++){ctx.beginPath();ctx.moveTo(20,75+staff*75+line*9);ctx.lineTo(492,75+staff*75+line*9);ctx.stroke();}for(let n=0;n<12;n++){const x=32+n*38,y=84+staff*75+((n*3+staff)%5)*9;ctx.beginPath();ctx.ellipse(x,y,5,3,-.3,0,Math.PI*2);ctx.fill();ctx.fillRect(x+4,y-24,1,24);}}const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;add(new THREE.PlaneGeometry(1.03,.57),new THREE.MeshStandardMaterial({map:texture,roughness:.9}),[0,1.80,.04],[1,1,1],[-.18,0,0]);}
 for(const x of [-1.15,1.15]){batch('box',gold,[x,1.68,.15],[.06,.35,.06]);batch('box',gold,[x,1.87,.15],[.22,.04,.22]);batch('box',new THREE.MeshStandardMaterial({color:0xd6c7a0}),[x,2.03,.15],[.07,.30,.07]);const flame=add(new THREE.SphereGeometry(.05,8,8),new THREE.MeshBasicMaterial({color:0xffce72}),[x,2.22,.15],[.6,1.8,.6]);flame.name='Organ candle flame';}
 for(const {kind,mat,list}of parts.values()){const geo=kind==='pipe'?new THREE.CylinderGeometry(1,1,1,16,1,true):kind==='disc'?new THREE.CircleGeometry(1,16):kind==='ring'?new THREE.TorusGeometry(1,.10,5,16):new THREE.BoxGeometry(1,1,1),mesh=new THREE.InstancedMesh(geo,mat,list.length),d=new THREE.Object3D();for(const [i,p]of list.entries()){d.position.set(...p.p);d.scale.set(...p.s);d.rotation.set(...p.rotation);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);}mesh.name=kind==='pipe'?'Speaking silver organ pipes':'Gilded organ casework';console.add(mesh);}
}

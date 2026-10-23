import {finishMap,finishSurfaces} from './surface_finish.mjs';
/** Drapery follows the compiled bed footprint. Nothing here adds a walkable solid. */
export function createVelvetDetails(T,house,floor){
 const root=new T.Group();root.name='Velvet, gilt and candlelight';
 const cloth=new T.MeshStandardMaterial({color:0xffffff,roughness:.92,side:T.DoubleSide}),gold=new T.MeshStandardMaterial({color:0xa87a38,metalness:.65,roughness:.34}),wood=new T.MeshStandardMaterial({color:0x311b14,roughness:.45}),wax=new T.MeshStandardMaterial({color:0xd4ba87,roughness:.8}),flame=new T.MeshBasicMaterial({color:0xffdda0});wood.map=finishMap(T,'wood');cloth.map=finishMap(T,'damask');
 function add(g,geo,mat,x,y,z){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;}
 function cushion(){const geo=new T.SphereGeometry(1,18,12),p=geo.attributes.position;for(let i=0;i<p.count;i++)for(const axis of ['X','Y','Z']){const v=p['get'+axis](i);p['set'+axis](i,Math.sign(v)*Math.pow(Math.abs(v),.45));}geo.computeVertexNormals();return geo;}
 function curtain(g,x,z,w,h){const geo=new T.PlaneGeometry(w,h,24,24),p=geo.attributes.position;for(let i=0;i<p.count;i++){const yy=p.getY(i),xx=p.getX(i);p.setZ(i,Math.sin(xx*43)*.045+.035*Math.sin(yy*4));p.setX(i,xx*(.8+.18*Math.cos(yy/h*Math.PI)));}geo.computeVertexNormals();return add(g,geo,cloth,x,2.2-h/2,z);}
 for(const item of (house.decoration.furniture||[]).filter(i=>i.floor===floor&&i.type==='bed').slice(0,8)){
  const g=new T.Group();g.name='Hand-draped canopy';g.position.fromArray(item.positionMeters);g.rotation.y=item.rotationY||0;root.add(g);
  for(const side of [-1,1])for(const end of [-1,1]){
   const post=add(g,new T.CylinderGeometry(.035,.065,2.3,12),wood,side*.77,1.15,end*.98);for(const y of [.20,.8,1.9,2.24])add(g,new T.TorusGeometry(.067,.012,6,16),gold,side*.77,y,end*.98).rotation.x=Math.PI/2;add(g,new T.SphereGeometry(.09,12,8),gold,side*.77,2.38,end*.98);
   const c=curtain(g,side*.64,end*.98,.34,1.75);c.rotation.y=side*.12;
  }
  for(const end of [-1,1]){const geo=new T.PlaneGeometry(1.55,.4,32,6),p=geo.attributes.position;for(let i=0;i<p.count;i++){const xx=p.getX(i);p.setY(i,p.getY(i)-.17*Math.cos(xx/1.55*Math.PI));p.setZ(i,Math.cos(xx*40)*.035);}geo.computeVertexNormals();add(g,geo,cloth,0,2.12,end*1.025);for(let i=0;i<24;i++)add(g,new T.SphereGeometry(.015,6,4),gold,-.74+i/23*1.48,1.92-.17*Math.cos((-.74+i/23*1.48)/1.55*Math.PI),end*1.04);}
  // Tufted headboard and quilt relief sit on the existing furniture.
  for(let row=0;row<3;row++)for(let col=0;col<7;col++)add(g,new T.SphereGeometry(.09,10,6),cloth,(col-3)*.20,.85+row*.17,-.79).scale.set(1,1,.32);
  for(const side of [-1,1]){const c=curtain(g,side*.78,0,2,.30);c.rotation.y=Math.PI/2;add(g,new T.SphereGeometry(.30,24,16),wax,side*.37,.67,-.68).scale.set(1,.24,.53);}
  const quilt=new T.PlaneGeometry(1.44,1.36,24,30),p=quilt.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,.012*Math.sin(p.getX(i)*45)+.009*Math.cos(p.getY(i)*38));quilt.computeVertexNormals();const q=add(g,quilt,cloth,0,.584,.28);q.rotation.x=-Math.PI/2;
 }
 // Plump layered cushions and a bolster share the bed's collision footprint.
 for(const item of (house.decoration.furniture||[]).filter(i=>i.floor===floor&&i.type==='bed').slice(0,8)){const g=new T.Group();g.position.fromArray(item.positionMeters);g.rotation.y=item.rotationY||0;root.add(g);for(const side of [-1,1]){const p=add(g,cushion(),cloth,side*.35,.77,-.57);p.scale.set(.32,.20,.12);p.rotation.x=-.2;const q=add(g,cushion(),wax,side*.35,.72,-.32);q.scale.set(.27,.13,.10);}const bolster=add(g,new T.CylinderGeometry(.075,.075,1.15,14),cloth,0,.69,-.08);bolster.rotation.z=Math.PI/2;}
 // Per-room suspended fixtures use no additional dynamic light or collision solid.
 for(const room of house.rooms.filter(r=>r.floor===floor&&!r.forgeStair&&!r.id.startsWith('signature-')).slice(0,16)){
  if(house.decoration.roomContents?.some(c=>c.roomId===room.id&&c.edition&&house.decoration.contentGeometryCompiled))continue;
  const b=room.boundsFeet,h=+b.h*.3048;if(h<2.6||+b.l*.3048<2.5||+b.w*.3048<2.5)continue;
  const y=house.manifest.floors[floor]?.elevationMeters||0,g=new T.Group();g.position.set((+b.x+ +b.l/2)*.3048,y+h-.40,(+b.y+ +b.w/2)*.3048);root.add(g);
  add(g,new T.CylinderGeometry(.015,.015,.7,6),gold,0,.36,0);add(g,new T.TorusGeometry(.32,.022,6,32),gold,0,0,0).rotation.x=Math.PI/2;
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2,x=Math.cos(a)*.32,z=Math.sin(a)*.32;add(g,new T.CylinderGeometry(.023,.026,.16,8),wax,x,.10,z);add(g,new T.SphereGeometry(.025,8,6),flame,x,.20,z).scale.y=2.2;add(g,new T.OctahedronGeometry(.025),gold,x,-.09,z).scale.y=1.5;}
 }
 // Batch repeated finials, tufting and turned posts; folded cloth stays unique.
 root.updateMatrixWorld(true);const batches=new Map();root.traverse(o=>{if(!o.isMesh||!['SphereGeometry','CylinderGeometry','TorusGeometry'].includes(o.geometry.type))return;const key=o.geometry.type+JSON.stringify(o.geometry.parameters)+o.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);});
 for(const meshes of batches.values()){if(meshes.length<2)continue;const geo=meshes[0].geometry,material=meshes[0].material,batch=new T.InstancedMesh(geo,material,meshes.length);for(const [i,m]of meshes.entries()){batch.setMatrixAt(i,m.matrixWorld);m.removeFromParent();if(i)m.geometry.dispose();}batch.name='Batched carved and upholstered details';root.add(batch);}
 finishSurfaces(T,root);return root;
}

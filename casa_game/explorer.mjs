import {surfaceTexture} from './surfaces.mjs';
export function createExplorer(THREE){
 const avatar=new THREE.Group();avatar.name='Black Hollow Victorian explorer';
 const materials={coat:new THREE.MeshStandardMaterial({color:0x344454,roughness:.92}),vest:new THREE.MeshStandardMaterial({color:0x70505c,roughness:.85}),skin:new THREE.MeshStandardMaterial({color:0xc6a68c,roughness:.85}),hat:new THREE.MeshStandardMaterial({color:0x242128,roughness:.9}),shirt:new THREE.MeshStandardMaterial({color:0xb9b5a4}),boots:new THREE.MeshStandardMaterial({color:0x282027,roughness:.48}),gold:new THREE.MeshStandardMaterial({color:0xb1935b,metalness:.55,roughness:.55}),hair:new THREE.MeshStandardMaterial({color:0x302628})};
 const fabric=surfaceTexture(THREE,'fabric',77);materials.coat.map=fabric;materials.vest.map=fabric;materials.hat.map=fabric;
 function ellipsoid(parent,size,p,mat){const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),mat);m.scale.set(...size);m.position.set(...p);parent.add(m);return m;}
 function lathe(parent,points,mat,p=[0,0,0]){const m=new THREE.Mesh(new THREE.LatheGeometry(points.map(a=>new THREE.Vector2(...a)),24),mat);m.position.set(...p);parent.add(m);return m;}
 const torso=new THREE.Group();avatar.add(torso);
 ellipsoid(torso,[.32,.51,.21],[0,1.42,0],materials.coat);
 lathe(torso,[[.35,.72],[.36,.77],[.29,1.15],[.29,1.49],[.32,1.61],[.27,1.72]],materials.coat);
 ellipsoid(torso,[.24,.34,.052],[0,1.37,-.205],materials.vest);
 ellipsoid(torso,[.12,.16,.045],[0,1.69,-.185],materials.shirt);
 ellipsoid(torso,[.07,.16,.04],[0,1.65,-.235],materials.vest);
 for(const side of [-1,1]){const lapel=ellipsoid(torso,[.06,.25,.035],[side*.17,1.57,-.19],materials.coat);lapel.rotation.z=-side*.3;}
 for(let i=0;i<4;i++)ellipsoid(torso,[.018,.018,.012],[.035,1.19+i*.1,-.262],materials.gold);
 ellipsoid(torso,[.11,.14,.10],[0,1.82,0],materials.skin);
 const head=new THREE.Group();head.position.y=2.02;torso.add(head);
 ellipsoid(head,[.205,.267,.20],[0,0,0],materials.skin);ellipsoid(head,[.16,.15,.17],[0,-.13,-.025],materials.skin);
 ellipsoid(head,[.047,.073,.055],[0,-.015,-.204],materials.skin);
 for(const side of [-1,1]){ellipsoid(head,[.045,.076,.035],[side*.203,0,0],materials.skin);ellipsoid(head,[.038,.014,.013],[side*.079,.048,-.186],materials.hair);ellipsoid(head,[.027,.017,.013],[side*.075,.012,-.190],materials.shirt);ellipsoid(head,[.010,.012,.007],[side*.075,.012,-.202],materials.hair);}
 ellipsoid(head,[.208,.13,.202],[0,.17,.015],materials.hair);
 const hat=new THREE.Group();hat.name='fitted top hat attached to head';hat.position.y=.215;head.add(hat);
 const brim=lathe(hat,[[0,0],[.23,0],[.34,.012],[.35,.025],[.31,.04],[.22,.035],[0,.035]],materials.hat);brim.scale.z=.87;
 lathe(hat,[[.225,.025],[.215,.05],[.198,.32],[.205,.39],[0,.39]],materials.hat);
 lathe(hat,[[.225,.04],[.22,.1]],materials.vest);
 const legs=[],arms=[],knees=[];
 for(const side of [-1,1]){const leg=new THREE.Group();leg.position.set(side*.145,.84,0);avatar.add(leg);ellipsoid(leg,[.125,.24,.135],[0,-.19,0],materials.coat);const knee=new THREE.Group();knee.position.y=-.39;leg.add(knee);ellipsoid(knee,[.105,.19,.115],[0,-.16,0],materials.coat);ellipsoid(knee,[.12,.10,.205],[0,-.35,-.07],materials.boots);legs.push(leg);knees.push(knee);
 const arm=new THREE.Group();arm.position.set(side*.30,1.64,0);torso.add(arm);ellipsoid(arm,[.115,.22,.12],[side*.035,-.17,0],materials.coat);ellipsoid(arm,[.09,.21,.09],[side*.05,-.48,-.025],materials.coat);ellipsoid(arm,[.075,.10,.07],[side*.05,-.69,-.025],materials.skin);arms.push(arm);}
 avatar.scale.setScalar(.68);avatar.visible=false;
 return {avatar,torso,legs,arms,animate(stride,moving,time=0){for(let i=0;i<2;i++)knees[i].rotation.x=moving?Math.max(0,Math.sin(stride+i*Math.PI))*.45:0;torso.scale.y=1+Math.sin(time*.0018)*.003;}};
}

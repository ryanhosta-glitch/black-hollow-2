import {LIGHTING_PROFILES} from './lighting_profiles.mjs';
import {resolveRoomProfile} from './room_profiles.mjs';
import {wallMount} from './wall_mount.mjs';
import {withRoomComponent} from './room_components.mjs';
import {architecturalShapes} from './component_shapes.mjs';
import {ROOM_MATERIALS as M} from './room_materials.mjs';
const FT=.3048;
/** Decorative emitters are geometry only. At most one source is recorded per complete fixture. */
export function roomLighting(room,{y=0,furniture=[],occupied=[],add,components=null,profile=resolveRoomProfile(room)}){
 const b=room.boundsFeet||room,x=+b.x*FT,z=+b.y*FT,w=+b.l*FT,d=+b.w*FT,h=+b.h*FT,p=LIGHTING_PROFILES[profile.identity],ornaments=[],lights=[];
 components?.track(ornaments,lights);const stair=room.forgeStair||room.embeddedStair||room.stairs||/stair|elevator/i.test([room.name,room.type,room.roomType].join(' '));
 const source=(id,position,role,color,intensity,range,extra={})=>lights.push({id,roomId:String(room.id),floor:room.floor,positionMeters:position,role,lightType:role==='key'?'spot':'point',color,intensity,rangeMeters:range,static:true,castShadow:role==='key',shadowQuality:role==='key'?'cinematic':'none',fixtureGeometryCompiled:true,photometricEdition:'house-light-2',roomLighting:p,gameEffects:[],...extra});
 function build(id,key,position,type,draw,light,surface){
  withRoomComponent(components,id,()=>{const shapes=architecturalShapes(add);draw(shapes);const count=shapes.flush();if(!count)return;
   ornaments.push({id:`lighting:${room.id}:${id}:${key}`,type,positionMeters:position,width:.5,height:.5});source(id==='artisan-fixtures'?`artisan:${room.id}:light:${key.slice(7)}`:id==='task-lamp'?`lighting:${room.id}:task:${key}`:`lighting:${room.id}:${key}`,position,...light);
  },{key,surface});
 }
 const lathe=(g,point,profile,mat,n=10)=>{for(let k=0;k<n;k++)for(let j=1;j<profile.length;j++){const v=(i,q)=>point(Math.cos(i/n*Math.PI*2)*profile[q][0],profile[q][1],Math.sin(i/n*Math.PI*2)*profile[q][0]);g.quad(v(k,j-1),v(k,j),v(k+1,j),v(k+1,j-1),mat);}};
 if(!stair&&h>2.55&&Math.min(w,d)>1.3){
  const table=profile.identity==='dining'&&furniture.find(f=>['banquet_ensemble','supper_table','dining_table'].includes(f.type)),cx=table?.positionMeters?.[0]??x+w/2,cz=table?.positionMeters?.[2]??z+d/2;
  const radius=Math.max(.14,Math.min(profile.identity==='ballroom'?.58:.40,(cx-x)*.5,(x+w-cx)*.5,(cz-z)*.5,(z+d-cz)*.5)),drop=Math.min(.70,h-2.42),base=y+h-drop,scale=Math.min(1,(drop-.03)/.45),point=(a,b,c)=>[cx+a,base+b*scale,cz+c],metal=['crypt','conservatory'].includes(profile.identity)?M.ebony:profile.identity==='gallery'?M.bronze:M.metal;
  build('ceiling-chandelier','chandelier',[cx,base+.08*scale,cz],p.fixture,g=>{
   g.box([cx,y+h-drop/2,cz],[.032,drop,.032],metal);
   lathe(g,point,[[0,-.05],[radius*.24,-.05],[radius*.29,.01],[radius*.16,.08],[0,.08]],metal);
   const lantern=['botanical-lantern','gaslight-lantern','votive-crown'].includes(p.fixture),arms=profile.identity==='ballroom'?8:profile.identity==='nursery'?4:6;
   for(let k=0;k<arms;k++){const a=k*Math.PI*2/arms,co=Math.cos(a),sn=Math.sin(a),world=(u,v,t)=>point(u*co+t*sn,v,-u*sn+t*co);
    g.sweep(world,.01,radius,[[.018,-.04],[.038,-.04],[.038,.015],[.018,.015]],metal);
    lathe(g,(u,v,t)=>world(radius+u,v,t),[[0,0],[.065,0],[.065,.035],[.025,.055],[.024,.14],[0,.14]],metal,8);
    const flame=world(radius,.19,0);g.box(flame,[.025,.075*scale,.025],profile.identity==='laboratory'?M.coolEmitter:M.warmEmitter);
    if(p.fixture==='gaslight-chandelier')lathe(g,(u,v,t)=>world(radius+u,v,t),[[.06,.05],[.09,.14],[.06,.26],[0,.27]],M.leadedGlass,8);
    if(p.fixture==='crystal-chandelier')lathe(g,(u,v,t)=>world(radius*.80+u,v,t),[[0,-.02],[.026,-.06],[.038,-.12],[0,-.20]],M.leadedGlass,6);
    if(lantern){g.box(world(radius,.17,0),[.018,.35*scale,.018],metal);}
   }
   if(lantern){lathe(g,point,[[radius,-.02],[radius,.015],[radius*.8,.05]],metal);lathe(g,point,[[radius,.32],[radius*.65,.40],[0,.45]],metal);}
  },['key',p.color,p.intensity,Math.min(12,Math.max(w,d)*1.25)],'ceiling-center');
 }
 // The source-only ceiling fill survives low ceilings and optional fixture budget omissions.
 if(!lights.some(l=>l.role==='key'))source(`${room.id}:ceiling-light`,[x+w/2,y+Math.max(.3,h-.25),z+d/2],'key',p.color,Math.min(10,p.intensity),Math.min(10,Math.max(w,d)),{fixtureGeometryCompiled:false,sourceOnly:true,fallback:'NO_SAFE_FIXTURE'});
 if(h>=2.62&&!stair)for(let k=0;k<(profile.identity==='circulation'?1:2);k++){
  const height=Math.min(.46,h-2.22),scale=height/.46,py=Math.min(h-.17-height/2,2.50),mount=wallMount(room,{width:.34,height,y:py,occupied,inset:.025,preferred:k?['left','bottom','right','top']:['right','top','left','bottom']});if(!mount)continue;
  const [mx,my,mz]=mount.position,cs=Math.cos(mount.rotationY),sn=Math.sin(mount.rotationY),world=(u,v,t)=>[mx+u*cs+t*sn,y+my+v*scale,mz-u*sn+t*cs],iron=profile.identity==='crypt',gas=['library','laboratory','circulation','conservatory'].includes(profile.identity),type=iron?'chained-iron-votive':gas?'pierced-bronze-lantern':'candle-wall-sconce';
  const before=ornaments.length;
  build('artisan-fixtures','sconce-'+k,world(0,.02,.20),type,g=>{
   g.box(world(0,0,.015),[.11,.40*scale,.035],iron?M.stone:gas?M.bronze:M.metal);
   lathe(g,(u,v,t)=>world(u,v,t+.17),[[0,-.20],[.10,-.20],[.10,-.17],[.035,-.14],[.035,.10],[0,.10]],iron?M.ebony:gas?M.bronze:M.metal,8);
   if(gas){lathe(g,(u,v,t)=>world(u,v,t+.17),[[.08,-.12],[.10,0],[.065,.16],[0,.18]],M.leadedGlass,8);}
   g.box(world(0,.04,.17),[.028,.12*scale,.028],M.warmEmitter);
   if(iron)for(const sign of [-1,1])g.box(world(sign*.09,.02,.17),[.015,.35*scale,.015],M.ebony);
  },['practical','#ffd0a0',profile.identity==='crypt'?4:7,3.8]);
  if(ornaments.length>before){occupied.push({wall:mount.wall,center:mount.wall==='left'||mount.wall==='right'?mz-z:mx-x,width:.44});Object.assign(ornaments.at(-1),{wall:mount.wall,normal:mount.normal,width:.34,height});}
 }
 if(p.task&&!stair)for(const f of furniture.filter(f=>['writing_desk','laboratory_bench'].includes(f.type)).slice(0,1)){
  const [fx,fy,fz]=f.positionMeters,a=f.rotationY||0,co=Math.cos(a),sn=Math.sin(a),top=f.type==='writing_desk'?.785:.90,world=(u,v,t)=>[fx+u*co+t*sn,fy+top+v,fz-u*sn+t*co];
  build('task-lamp',f.id,world(.44,.29,-.14),'laboratory-task-lamp',g=>{
   lathe(g,(u,v,t)=>world(.44+u,v,-.14+t),[[0,0],[.075,0],[.075,.025],[.02,.04],[.015,.30],[0,.30]],M.metal,8);
   lathe(g,(u,v,t)=>world(.44+u,v,-.14+t),[[.12,.23],[.12,.25],[.055,.34],[0,.34]],M.emeraldVelvet,10);
   g.box(world(.44,.24,-.14),[.07,.012,.07],M.warmEmitter);
  },['task','#ffd2a0',9,2.6]);
 }
 return {ornaments,lights};
}

/** Window and hearth contributions reuse real openings/furniture, never inferred extra fixtures. */
export function architecturalLightSources(room,{y=0,content={},furniture=[],artwork=[]}={}){
 const b=room.boundsFeet||room,x=+b.x*FT,z=+b.y*FT,w=+b.l*FT,d=+b.w*FT,h=+b.h*FT,p=LIGHTING_PROFILES[resolveRoomProfile(room).identity],lights=[];
 const put=(id,position,role,color,intensity,range,extra={})=>lights.push({id,roomId:String(room.id),floor:room.floor,positionMeters:position,role,lightType:role==='key'?'spot':'point',color,intensity,rangeMeters:range,static:true,castShadow:role==='key',shadowQuality:role==='key'?'cinematic':'none',fixtureGeometryCompiled:true,photometricEdition:'house-light-2',roomLighting:p,gameEffects:[],...extra});
 for(const [i,o]of(room.openings||[]).filter(o=>o.type==='window').slice(0,3).entries()){
  const vertical=o.wall==='left'||o.wall==='right',span=vertical?d:w,at=Math.max(0,Math.min(1,Number(o.pos??.5)))*span,normal=o.wall==='left'?[1,0,0]:o.wall==='right'?[-1,0,0]:o.wall==='top'?[0,0,1]:[0,0,-1],position=[vertical?(o.wall==='left'?x:x+w):x+at,y+Math.min(h-.20,1.8),vertical?z+at:o.wall==='top'?z:z+d].map((v,k)=>v+normal[k]*.32);
  put(`lighting:${room.id}:moon:${i}`,position,'moon','#a8c6ed',p.moon,5.5,{normal,windowIndex:i});
  if(i===0&&content.ornaments?.some(o=>o.type==='jewel-leaded-glass'))put(`lighting:${room.id}:stained`,position.map((v,k)=>v+normal[k]*.35),'stained','#d8aa83',4,3.5,{normal,windowIndex:i});
 }
 if(p.identity==='gallery')for(const a of artwork.slice(0,1))put(`lighting:${room.id}:portrait`,a.positionMeters.map((v,k)=>v+(a.normal[k]||0)*.45),'portrait','#ffe0b9',8,2.8,{targetMeters:a.positionMeters});
 return lights;
}

import {gothicComponentParts} from './gothic_components.mjs';
import {resolveRoomAtmosphere,GOTHIC_LIMITS} from './room_atmosphere_profiles.mjs';
import {furnitureSurface} from './furniture_surfaces.mjs';
import {wallMount} from './wall_mount.mjs';
const FT=.3048;
export function gothicWindowFrame(room,o,y=0){
 const b=room.boundsFeet||room,x=+b.x*FT,z=+b.y*FT,w=+b.l*FT,d=+b.w*FT,h=+b.h*FT,vertical=o.wall==='left'||o.wall==='right',span=vertical?d:w,at=Math.max(0,Math.min(1,Number(o.pos??.5)))*span,width=Math.min(Number(o.clearWidthMeters||1.65),span-.2),low=Math.min(.95,h*.34),high=Math.min(h-.15,low+1.55);
 if(![x,z,w,d,h,span,at,width,low,high].every(Number.isFinite)||width<.55||high-low<.5||at-width/2<.08||at+width/2>span-.08)return null;
 return {width,height:high-low,low,high,wall:o.wall,position:[vertical?(o.wall==='left'?x:x+w):x+at,y+low,vertical?z+at:(o.wall==='top'?z:z+d)],rotationY:{top:0,bottom:Math.PI,left:Math.PI/2,right:-Math.PI/2}[o.wall]};
}
export function createGothicRoom(room,{y=0,add,components,occupied=[],furniture=[]}){
 const policy=resolveRoomAtmosphere(room),b=room.boundsFeet||room,h=+b.h*FT,records=[],omitted=[],stair=room.forgeStair||room.embeddedStair||room.stairs?.length||/stair|elevator/i.test([room.name,room.type].join(' '));
 components?.track(records);const skip=(key,reason)=>{omitted.push({key,reason});return false;};
 function model(type,position,rotationY=0,options={},key=type){
  const parts=gothicComponentParts(type,{condition:policy.aging?policy.condition:'preserved',state:policy.botanicalState,variant:policy.variant,fabric:policy.fabric,...options}),triangles=parts.reduce((n,p)=>n+p.triangles.length,0),used=records.reduce((n,r)=>n+r.triangles,0);
  if(used+triangles>GOTHIC_LIMITS.maxRoomTriangles||records.reduce((n,r)=>n+r.groups,0)+parts.length>GOTHIC_LIMITS.maxRoomGroups)return skip(key,'GOTHIC_ROOM_BUDGET');
  const c=Math.cos(rotationY),s=Math.sin(rotationY),world=p=>[position[0]+p[0]*c+p[2]*s,position[1]+p[1],position[2]-p[0]*s+p[2]*c];let ok=true;
  for(const p of parts){const ts=p.triangles.map(t=>t.map(world)),points=ts.flat(),lo=[0,1,2].map(k=>Math.min(...points.map(v=>v[k]))),hi=[0,1,2].map(k=>Math.max(...points.map(v=>v[k])));if(!add(lo.map((v,k)=>(v+hi[k])/2),lo.map((v,k)=>Math.max(.001,hi[k]-v)),p.mat,0,{triangles:ts}))ok=false;}
  if(ok)records.push({type,key,positionMeters:position,rotationY,triangles,groups:parts.length});return ok;
 }
 const run=(id,key,build,surface)=>components?components.run(id,build,{key,surface}):build();
 function windowTextiles(ornaments){
  const flag=(room.forgeDecoration||room.source?.forgeDecoration)?.components?.['window-valance'];if(!policy.textiles||stair||flag===false||flag?.enabled===false)return;
  components?.track(ornaments);
  for(const [i,o]of(room.openings||[]).filter(o=>o.type==='window').slice(0,2).entries())run('gothic-textiles','window-'+i,()=>{
   if(o.drapery===false||o.drapery||o.curtains||o.decoration)return skip('window-'+i,'AUTHORED_WINDOW_TREATMENT');
   const f=gothicWindowFrame(room,o,y);if(f?.width>4)return skip('window-'+i,'OVERSIZE_WINDOW_DETAIL');if(!f||h<2.7)return skip('window-'+i,'NO_SAFE_WINDOW_TEXTILE');
   const n=[Math.sin(f.rotationY),0,Math.cos(f.rotationY)],p=f.position.map((v,k)=>v+n[k]*.037),height=f.height-.04;
   const drawn=model('velvet-curtain',p,f.rotationY,{width:f.width-.04,height},'window-'+i);
   if(!drawn)return false;const top=[p[0],y+Math.min(f.high-.18,h-.40),p[2]];model('layered-valance',top,f.rotationY,{width:f.width-.02,height:.27},'valance-'+i);
   if(drawn)ornaments.push({id:`gothic:${room.id}:window:${i}`,type:'layered-velvet-window',positionMeters:p,width:f.width,height:f.height,windowWall:o.wall});return drawn;
  },'window-valance:'+i);
 }
 function wallPanel(position,rotationY,width,height){if(records.filter(r=>r.type==='upholstered-panel').length>=2)return skip('wall-panel','CURATED_PANEL_DENSITY');return policy.textiles&&model('upholstered-panel',position,rotationY,{width,height},'wall-panel:'+records.length);}
 function windowGlass(o,i,ornaments){
  if(!policy.glass||o.glass||o.glazing||o.material||o.finishes||o.windowStyle)return skip('glass-'+i,'AUTHORED_OR_DISABLED_GLASS');const f=gothicWindowFrame(room,o,y);if(f?.width>4)return skip('glass-'+i,'OVERSIZE_WINDOW_DETAIL');if(!f)return false;
  const n=[Math.sin(f.rotationY),0,Math.cos(f.rotationY)],p=f.position.map((v,k)=>v+n[k]*.018),drawn=model('leaded-rosette',p,f.rotationY,{width:f.width,height:f.height,compact:policy.identity==='laboratory'},'glass-'+i);
  if(drawn)ornaments.push({id:`leaded:${room.id}:${i}`,type:'jewel-leaded-glass',positionMeters:[p[0],p[1]+f.height/2,p[2]],width:f.width,height:f.height});return drawn;
 }
 function finish(ornaments,storyArrangements=[]){
  components?.track(ornaments);
  if(policy.textiles&&!stair&&h>2.7)for(const f of furniture.filter(f=>f.type==='bed'&&f.source?.allowAccessories!==false&&f.source?.canopy!==false&&!f.source?.canopy).slice(0,2))run('gothic-textiles','bed-'+f.id,()=>{
   const preview=gothicComponentParts('bed-canopy',{width:1.53,height:.25}),cost=preview.reduce((n,p)=>n+p.triangles.length,0)*2;if(records.reduce((n,r)=>n+r.triangles,0)+cost>GOTHIC_LIMITS.maxRoomTriangles||records.reduce((n,r)=>n+r.groups,0)+preview.length*2>GOTHIC_LIMITS.maxRoomGroups)return skip('bed-'+f.id,'GOTHIC_ROOM_BUDGET');const a=f.rotationY||0,c=Math.cos(a),s=Math.sin(a),at=(u,t)=>[f.positionMeters[0]+u*c+t*s,f.positionMeters[1]+2.08,f.positionMeters[2]-u*s+t*c];let drawn=false;
   for(const sign of [-1,1])drawn=model('bed-canopy',at(0,sign*.96),a,{width:1.53,height:.25},'bed-'+f.id+'-'+sign)||drawn;
   if(drawn)ornaments.push({id:'gothic:'+f.id,type:'compiled-bed-canopy',positionMeters:at(0,0),width:1.6,height:.25});return drawn;
  },'bed-canopy:'+f.id);
  // Existing story claims take precedence. Cover only an otherwise unoccupied support.
  const used=new Set(storyArrangements.map(a=>a.supportId));
  if(policy.textiles)for(const f of furniture.filter(f=>['console','dining_table','side_table'].includes(f.type)&&!f.authored&&!used.has(String(f.id))).slice(0,1))run('gothic-textiles','cover-'+f.id,()=>{
   const t=furnitureSurface(f);if(!t)return false;return model('table-cover',[f.positionMeters[0],f.positionMeters[1]+t.top+.0003,f.positionMeters[2]],f.rotationY||0,{width:t.width*.64,height:t.depth*.80},'cover-'+f.id);
  },'support:'+f.id);
  if(policy.botanicals&&!stair&&h>3.05)run('gothic-botanicals','wall-botanical',()=>{
   const height=.65,width=.52,mount=wallMount(room,{width,height,y:h-.52,inset:.080,occupied});if(!mount||mount.position[1]-height/2<2.18)return skip('wall-botanical','NO_SAFE_BOTANICAL_SPAN');
   const p=[mount.position[0],y+mount.position[1]-height/2,mount.position[2]],type=policy.identity==='crypt'?'funeral-spray':policy.botanicalState==='overgrown'?'trailing-ivy':'specimen-case';
   if(!model(type,p,mount.rotationY,{width,height},'wall-botanical'))return false;
   ornaments.push({id:`gothic:${room.id}:botanical`,type,wall:mount.wall,positionMeters:[p[0],p[1]+height/2,p[2]],width,height});const b=room.boundsFeet||room;occupied.push({wall:mount.wall,center:mount.wall==='left'||mount.wall==='right'?p[2]-+b.y*FT:p[0]-+b.x*FT,width:width+.1});return true;
  },'botanical-wall:'+room.id);
  if(policy.waterStaining&&!stair&&!room.finishes&&!room.source?.finishes)for(const [i,o]of(room.openings||[]).filter(o=>o.type==='window').slice(0,1).entries())run('surface-aging','water-'+i,()=>{
   const f=gothicWindowFrame(room,o,y);if(!f)return false;const n=[Math.sin(f.rotationY),0,Math.cos(f.rotationY)],height=Math.min(.42,f.low-.15),p=f.position.map((v,k)=>v+n[k]*.006);p[1]-=height+.025;return model('water-trace',p,f.rotationY,{width:f.width*.45,height},'water-'+i);
  },'water-under-window:'+i);
  if(policy.wear>0)for(const f of furniture.filter(f=>!f.authored&&['console','side_table','writing_desk'].includes(f.type)&&!used.has(String(f.id))).slice(0,1))run('surface-aging','dust-'+f.id,()=>{
   const t=furnitureSurface(f);if(!t)return false;const a=f.rotationY||0,u=t.u+t.width*.32,v=t.v+t.depth*.25,c=Math.cos(a),s=Math.sin(a),p=[f.positionMeters[0]+u*c+v*s,f.positionMeters[1]+t.top+.0005,f.positionMeters[2]-u*s+v*c],size=.045;
   return model('settled-dust',p,a,{width:size*2},'dust-'+f.id);
  },'support-aging:'+f.id);
 }
 return {policy,windowTextiles,wallPanel,windowGlass,finish,report:()=>({edition:policy.edition,policy,components:[...records],triangles:records.reduce((n,r)=>n+r.triangles,0),groups:records.reduce((n,r)=>n+r.groups,0),limits:GOTHIC_LIMITS,omitted:[...omitted,...(components?.omitted||[]).filter(o=>['gothic-textiles','gothic-botanicals','surface-aging'].includes(o.component))]})};
}

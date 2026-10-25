import {architecturalShapes} from './forge_architectural_shapes.mjs';
import {architecturalTreatment} from './forge_finishes.mjs';
import {openingShape} from './forge_architecture.mjs';
import {MAT} from './forge_glb.mjs';
const FT=.3048;
const intersects=(a,b)=>a[0]<b[1]-.002&&a[1]>b[0]+.002;

/** Shared wall frames and aperture tests, in the compiler's existing feet coordinates. */
export function luxuryWall(room,side,base=0,decoration={}){
 const vertical=side==='left'||side==='right',span=+(vertical?room.w:room.l),x=+room.x,z=+room.y,wall=vertical?(side==='left'?x:x+ +room.l):(side==='top'?z:z+ +room.w),inward=side==='top'||side==='left'?1:-1;
 const point=(at,y,depth)=>vertical?[wall+inward*depth,base+y,z+at]:[x+at,base+y,wall+inward*depth];
 const holes=(room.openings||[]).filter(o=>o.wall===side).map(o=>({...openingShape(o,span,+room.h),type:o.type,id:o.id}));
 const artwork=(decoration.artwork||[]).filter(a=>a.roomId===String(room.id)&&((side==='left'&&a.normal[0]>0)||(side==='right'&&a.normal[0]<0)||(side==='top'&&a.normal[2]>0)||(side==='bottom'&&a.normal[2]<0))).map(a=>({center:a.positionMeters[vertical?2:0]/FT-(vertical?z:x),width:a.sizeMeters[0]/FT,low:a.positionMeters[1]/FT-base-a.sizeMeters[1]/FT/2,high:a.positionMeters[1]/FT-base+a.sizeMeters[1]/FT/2}));
 const props=(decoration.roomContents||[]).filter(c=>c.roomId===room.id).flatMap(c=>c.ornaments||[]).filter(o=>o.wall===side).map(o=>({center:o.positionMeters[vertical?2:0]/FT-(vertical?z:x),width:o.width/FT,low:o.positionMeters[1]/FT-base-o.height/FT/2,high:o.positionMeters[1]/FT-base+o.height/FT/2}));
 const clear=(at,y,width,height,margin=.06)=>at-width/2>=.10&&at+width/2<=span-.10&&y-height/2>=.015&&y+height/2<=+room.h-.015&&!holes.some(o=>intersects([at-width/2-margin,at+width/2+margin],[o.center-o.width/2,o.center+o.width/2])&&intersects([y-height/2-margin,y+height/2+margin],[o.low,o.high]))&&![...artwork,...props].some(o=>intersects([at-width/2-.08,at+width/2+.08],[o.center-o.width/2,o.center+o.width/2])&&intersects([y-height/2,y+height/2],[o.low,o.high]));
 const runs=(y,height)=>{const blocked=[...holes,...artwork,...props].filter(o=>intersects([y-height/2-.06,y+height/2+.06],[o.low,o.high])).map(o=>[Math.max(.12,o.center-o.width/2-.18),Math.min(span-.12,o.center+o.width/2+.18)]).sort((a,b)=>a[0]-b[0]);let cursor=.12;const out=[];for(const [a,b]of blocked){if(a>cursor+.15)out.push([cursor,a]);cursor=Math.max(cursor,b);}if(cursor<span-.27)out.push([cursor,span-.12]);return out;};
 return {vertical,span,point,holes,clear,runs};
}

export function architecturalLuxury(room,base,components,{decoration={}}={}){
 const treatment=architecturalTreatment(room),{finish,relief,accent}=treatment,h=+room.h,x=+room.x,z=+room.y,l=+room.l,w=+room.w;
 const walls=['top','bottom','left','right'].map(side=>({side,...luxuryWall(room,side,base,decoration)}));
 const build=(id,key,draw,surface)=>components.run(id,()=>{const shapes=architecturalShapes(components.emit);draw(shapes);shapes.flush();},{key,surface});
 for(const wall of walls){const {side,point,clear,runs}=wall;
  build('profiled-cornices',side,shapes=>{
   const height=Math.min(.68,h*.07),bottom=h-height-.025,projection=treatment.projection;
   // Scotia/cavetto steps and a projecting cyma edge, closed and chamfered.
   const profile=[[.125,bottom],[.18,bottom],[.18,bottom+.09],[projection-.035,bottom+.18],[projection,bottom+.33],[projection,h-.08],[.125,h-.08]];
   for(const [a,b]of runs(bottom+height/2,height)){shapes.sweep(point,a,b,profile,treatment.crown);if(clear((a+b)/2,bottom+.13,b-a,.025))shapes.sweep(point,a,b,[[.185,bottom+.12],[.205,bottom+.12],[.205,bottom+.145],[.185,bottom+.145]],accent);}
  },'crown:'+side);
  build('raised-wainscoting',side,shapes=>{
   const top=treatment.panelHeight,cy=top/2+.08;
   for(const [a,b]of runs(cy,top)){
    const width=b-a;
    // Plinth and torus/dado cap are true depth profiles, not wallpaper stripes.
    shapes.sweep(point,a,b,[[.12,.04],[.24,.04],[.24,.18],[.20,.28],[.16,.30],[.12,.30]],finish.panel);
    shapes.sweep(point,a,b,[[.125,top-.12],[.25,top-.12],[.27,top-.04],[.25,top+.06],[.16,top+.13],[.125,top+.13]],relief);
    const requested=Math.max(1,Math.ceil(width/treatment.bayWidth)),bays=Math.min(12,requested),bw=width/bays;
    if(requested>bays)components.skip('raised-wainscoting','DENSITY_CAPPED',side);
    for(let i=0;i<bays;i++){const at=a+(i+.5)*bw,pw=Math.min(6,bw-.24),ph=top-.68;if(pw<.6||!clear(at,cy,pw,ph))continue;
     shapes.panel(point,at,cy,pw,ph,relief,treatment.restrained?.17:.23);
     if(!treatment.restrained&&pw>1.1){shapes.sweep(point,at-pw/2+.12,at+pw/2-.12,[[.24,cy+ph/2-.14],[.26,cy+ph/2-.14],[.26,cy+ph/2-.115],[.24,cy+ph/2-.115]],accent);}
    }
   }
  },'panels:'+side);
  build('carved-pilasters',side,shapes=>{
   if(treatment.restrained)return;
   const low=.40,top=h-.82,height=top-low,cy=(top+low)/2;
   if(height<6.3)return;
   // Broad, shallow fluted strips at solid bay ends; reserve portrait and prop spans.
   for(const [a,b]of runs(cy,height))for(const at of b-a>8?[a+.38,b-.38]:[]){
    if(!clear(at,cy,.56,height+.12))continue;
    shapes.panel(point,at,cy,.46,height,relief,.205);
    for(const sign of [-1,1])shapes.sweep(point,at+sign*.11-.018,at+sign*.11+.018,[[.24,low+.2],[.26,low+.2],[.26,top-.35],[.24,top-.35]],accent);
    shapes.sweep(point,at-.30,at+.30,[[.14,top-.20],[.31,top-.20],[.32,top-.10],[.24,top+.02],[.14,top+.02]],relief);
    shapes.rosette((u,v,t)=>point(u,v,.25+t*.5),at,top-.09,.12,accent,4);
    // Triangular carved corbel tucked under the capital, above headroom.
    if(top-.65>2.1/FT)shapes.sweep(point,at-.12,at+.12,[[.16,top-.65],[.29,top-.22],[.16,top-.22]],relief);
   }
  },'pilasters:'+side);
  for(const [index,door]of wall.holes.entries())if(door.type==='door'||door.type==='arch')build('pediment-surrounds',side+':'+index,shapes=>{
   const width=door.width+.72,at=door.center,high=door.high;
   if(at-width/2<.10||at+width/2>wall.span-.10||high+.34>h-.015)return;
   const pointBox=(u,y,width,height,depth,offset,mat)=>{if(clear(u,y,width,height)){const c=point(u,y,offset);shapes.box(c,wall.vertical?[depth,height,width]:[width,height,depth],mat);}};
   // Jambs lie outside the preserved clear aperture; headers never lower its headroom.
   for(const sign of [-1,1]){const u=at+sign*(door.width/2+.22);pointBox(u,high/2,.26,high-.18,.20,.22,relief);pointBox(u,.20,.38,.30,.24,.24,finish.panel);pointBox(u,high-.16,.36,.25,.25,.24,relief);}
   const header=high+.22;
   if(clear(at,header,width,.24)){shapes.sweep(point,at-width/2,at+width/2,[[.14,high+.08],[.30,high+.08],[.34,high+.22],[.28,high+.34],[.14,high+.34]],relief);}
   if(!treatment.restrained&&high+.94<h-.78&&clear(at,high+.66,width,.54)){
    const half=width/2,baseY=high+.42,apex=high+.94;
    // Low-relief triangular pediment with a carved center palmette.
    shapes.triangle(point(at-half,baseY,.20),point(at+half,baseY,.20),point(at,apex,.20),relief);
    shapes.triangle(point(at-half+.12,baseY+.04,.23),point(at+half-.12,baseY+.04,.23),point(at,apex-.09,.23),finish.panel);
    shapes.rosette((u,v,t)=>point(u,v,.24+t),at,high+.62,.16,accent,6);
   }
  },'surround:'+side+':'+index);
 }
 // Carving on existing library bookcase stiles/cornices; no second shelf model.
 if(treatment.identity==='library')for(const item of (decoration.furniture||[]).filter(f=>f.roomId===String(room.id)&&f.type==='bookcase'))build('carved-shelving-surrounds',item.id,shapes=>{
  const [mx,my,mz]=item.positionMeters.map(v=>v/FT),a=item.rotationY||0,cs=Math.cos(a),sn=Math.sin(a),point=(u,v,t)=>[mx+(u*cs+t*sn)/FT,my+v/FT,mz+(-u*sn+t*cs)/FT];
  for(const side of [-1,1]){
   shapes.sweep(point,side*.70-.022,side*.70+.022,[[.246,.30],[.258,.30],[.258,2.13],[.246,2.13]],relief);
   // Recessed flutes and small capitals remain inside the existing padded collider.
   shapes.sweep(point,side*.70-.032,side*.70+.032,[[.25,2.11],[.28,2.11],[.28,2.17],[.25,2.17]],accent);
  }
  shapes.sweep(point,-.72,.72,[[.285,2.215],[.305,2.23],[.308,2.27],[.300,2.315],[.285,2.33]],relief);
  shapes.rosette((u,v,t)=>point(u,v,.303+t*.08),0,2.27,.045,accent,6);
 },'shelving:'+item.id);
 const ceilingAllowed=h*.3048>=2.75&&Math.min(l,w)>8&&!room.forgeStair;
 if(!ceilingAllowed){components.skip('coffered-ceilings','HEADROOM_OR_STAIR_CLEARANCE');components.skip('carved-medallions','HEADROOM_OR_STAIR_CLEARANCE');}
 else{
  build('coffered-ceilings','room',shapes=>{
   if(!treatment.ceiling)return;
   const cy=base+h-.12,columns=treatment.formal?2:1,rows=treatment.formal?2:1,inset=.92;
   // Coffers are raised perimeter frames, preserving the structural ceiling plane.
   for(let i=0;i<columns;i++)for(let j=0;j<rows;j++){
    const a=x+inset+(l-2*inset)*i/columns,b=x+inset+(l-2*inset)*(i+1)/columns,c=z+inset+(w-2*inset)*j/rows,d=z+inset+(w-2*inset)*(j+1)/rows;
    const pz=(at,y,depth)=>[at,cy-y,c+depth],px=(at,y,depth)=>[a+depth,cy-y,at],profile=[[0,0],[.20,0],[.20,.12],[.12,.20],[0,.20]];
    shapes.sweep(pz,a,b,profile,treatment.cofferMaterial);if(j===rows-1)shapes.sweep((at,y,dep)=>[at,cy-y,d-dep],a,b,profile,treatment.cofferMaterial);
    shapes.sweep(px,c,d,profile,treatment.cofferMaterial);if(i===columns-1)shapes.sweep((at,y,dep)=>[b-dep,cy-y,at],c,d,profile,treatment.cofferMaterial);
    if(!treatment.restrained){for(const [cx,cz]of [[a+.28,c+.28],[b-.28,d-.28]])shapes.rosette((u,v,t)=>[u,cy-.08-t,v],cx,cz,.16,accent,4);}
   }
  },'ceiling-coffers');
  build('carved-medallions','room',shapes=>{
   if(!treatment.ceiling)return;
   const cx=x+l/2,cz=z+w/2,cy=base+h-.34,r=treatment.restrained?.62:treatment.formal?1.20:.96,segments=24;
   for(let k=0;k<segments;k++){
    const a=k/segments*Math.PI*2,b=(k+1)/segments*Math.PI*2;
    const p=(angle,radius,drop)=>[cx+Math.cos(angle)*radius,cy-drop,cz+Math.sin(angle)*radius];
    for(const [outer,inner,drop]of [[r,r-.10,.02],[r-.10,r-.20,.09],[r*.64,r*.50,.13]])shapes.quad(p(a,outer,drop),p(b,outer,drop),p(b,inner,drop+.025),p(a,inner,drop+.025),treatment.cofferMaterial);
   }
   shapes.rosette((u,v,t)=>[u,cy-.13-t,v],cx,cz,r*.73,accent,treatment.restrained?6:10);
  },'ceiling-medallion');
 }
 build('period-floor-inlays','room',shapes=>{
  if(room.forgeStair||Math.min(l,w)<8)return;
  const authored=String(room.flooring||'').toLowerCase();if(/carpet|rug/.test(authored))return;
  const wood=[MAT.floor,MAT.parquet].includes(finish.floor),mat=wood?MAT.wood:MAT.stone,cy=base+.008;
  for(const wall of walls)for(const [a,b]of wall.runs(.008,.012)){
   // Two flush perimeter borders stop at every floor-level aperture.
   for(const inset of [.40,.62]){const mid=(a+b)/2;if(!wall.clear(mid,.025,b-a,.012,0))continue;const c=wall.point(mid,.008,inset);shapes.box(c,wall.vertical?[.045,.008,b-a]:[b-a,.008,.045],mat);}
   const count=Math.min(4,Math.floor((b-a)/5));if(treatment.restrained)continue;
   for(let i=0;i<count;i++){const u=a+(i+.5)*(b-a)/count,p=wall.point(u,.014,.51),n=wall.vertical?[.07,0,0]:[0,0,.07],t=wall.vertical?[0,0,.16]:[.16,0,0];shapes.quad([p[0]+t[0],cy,p[2]+t[2]],[p[0]+n[0],cy,p[2]+n[2]],[p[0]-t[0],cy,p[2]-t[2]],[p[0]-n[0],cy,p[2]-n[2]],accent);}
  }
 },'perimeter-inlays');
}

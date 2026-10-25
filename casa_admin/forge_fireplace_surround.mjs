import {architecturalShapes} from './forge_architectural_shapes.mjs';
import {MAT} from './forge_glb.mjs';

/** Carved stone/wood mantels stay inside the existing 1.55 × .48 × 1.45 m collider. */
export function fireplaceSurroundParts(item){
 const parts=[],[px,py,pz]=item.positionMeters,a=item.rotationY||0,cs=Math.cos(a),sn=Math.sin(a),wood=item.type==='mahogany_fireplace'||item.finishTreatment==='mahogany',body=wood?MAT.wood:MAT.marble,accent=wood?MAT.metal:MAT.ivory;
 const world=([x,y,z])=>[px+x*cs+z*sn,py+y,pz-x*sn+z*cs],local=[];
 const shapes=architecturalShapes((c,s,mat,rot,shape)=>{local.push({c,s,mat,...shape});return true;});
 shapes.box([0,.04,0],[1.54,.08,.47],MAT.stone);
 shapes.box([0,.53,-.17],[1.36,.98,.10],MAT.ebony);
 // Sculpted half-columns and stepped capitals, with broad shallow fluting.
 for(const side of [-1,1]){
  const cx=side*.57,n=12,profile=[[.105,.13],[.105,.23],[.080,.28],[.085,1.03],[.12,1.08],[.12,1.17]];
  for(let k=0;k<n;k++)for(let i=1;i<profile.length;i++){
   const p=(j,v)=>[cx+Math.cos(j/n*Math.PI*2)*profile[v][0],profile[v][1],.075+Math.sin(j/n*Math.PI*2)*profile[v][0]];
   shapes.quad(p(k,i-1),p(k+1,i-1),p(k+1,i),p(k,i),body);
  }
  for(const sign of [-1,1])shapes.box([cx+sign*.043,.64,.167],[.012,.67,.018],accent);
  shapes.box([cx,.17,.03],[.27,.10,.38],body);
  shapes.box([cx,1.12,.03],[.28,.10,.39],accent);
 }
 const point=(x,y,z)=>[x,y,z];
 shapes.sweep(point,-.77,.77,[[-.23,1.21],[.23,1.21],[.23,1.26],[.19,1.32],[-.19,1.32],[-.23,1.28]],body);
 shapes.box([0,1.34,0],[1.52,.035,.45],accent);
 shapes.panel(point,0,1.13,.86,.18,body,.175);
 shapes.rosette((u,v,t)=>[u,v,.19+t*.35],0,1.13,.07,accent,6);
 // Raised hearth rail remains within the old firebox footprint and height.
 for(let k=0;k<7;k++)shapes.box([(k-3)*.10,.29,.21],[.018,.36,.025],MAT.metal);
 for(const side of [-1,1]){shapes.box([side*.54,1.38,0],[.11,.05,.11],accent);shapes.box([side*.54,1.425,0],[.045,.04,.045],MAT.ivory);}
 shapes.flush();
 for(const part of local){const triangles=part.triangles.map(t=>t.map(world)),lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const t of triangles)for(const v of t)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],v[k]);hi[k]=Math.max(hi[k],v[k]);}parts.push({...part,c:lo.map((v,k)=>(v+hi[k])/2),s:lo.map((v,k)=>Math.max(.001,hi[k]-v)),triangles});}
 return parts;
}

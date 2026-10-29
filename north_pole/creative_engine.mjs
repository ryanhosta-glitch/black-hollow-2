// Pure helpers shared by both operator interfaces. No hardware transport.
import {footprint,patchReport} from './sequencer.mjs';
export {EFFECTS,effectSample} from './effects.mjs';
export function autoPatch(fixtures,candidate){
 const n=footprint(candidate);if(!Number.isInteger(n)||n<1||n>512)throw Error('This light needs too many channels. Split it into shorter sections.');
 if(patchReport(fixtures).errors.length)throw Error('Fix the existing patch before adding another light.');
 for(let universe=1;universe<=63999;universe++)for(let address=1;address<=513-n;address++){
  if(fixtures.every(f=>f.universe!==universe||address+n<=f.address||address>=f.address+footprint(f)))return {...candidate,universe,address};
 }throw Error('No free DMX space remains.');
}
export function pathLength(anchor){const p=anchor?.pointsMeters;if(!Array.isArray(p)||p.length<2)throw Error('This attachment needs at least two points.');if(p.some(point=>!Array.isArray(point)||point.length!==3||point.some(v=>!Number.isFinite(v))))throw Error('Invalid attachment geometry.');let length=0;for(let i=1;i<p.length;i++){if(p[i].length!==3||p[i].some(v=>!Number.isFinite(v)))throw Error('Invalid attachment geometry.');length+=Math.hypot(...p[i].map((v,k)=>v-p[i-1][k]));}return length;}
export function estimateNodes(anchor,spacing=.15){if(!Number.isFinite(spacing)||spacing<.02||spacing>5)throw Error('Choose spacing between 0.02 and 5 meters.');const length=pathLength(anchor),points=anchor.pointsMeters,closed=Math.hypot(...points[0].map((v,i)=>v-points.at(-1)[i]))<.001;return length===0?1:Math.max(1,Math.ceil(length/spacing)+(closed?0:1));}
export function remapReport(fixtures,oldHouse,newHouse){
 // Exact IDs only: roof compiler order is not a reliable geometric match.
 return fixtures.map(f=>{const old=oldHouse.anchors.find(a=>a.id===f.anchorId),next=newHouse.anchors.find(a=>a.id===f.anchorId);return {fixtureId:f.id,anchorId:f.anchorId,status:!next?'missing':old?.kind!==next.kind?'review':'matched',oldLength:old?pathLength(old):null,newLength:next?pathLength(next):null};});
}
export function creativeCue({fixtureId,startTick,endTick,effect='steady',color='#ff3355',brightness=.75,parameters={speed:2,direction:1,phase:0}}){return {id:crypto.randomUUID(),fixtureId,startTick,endTick,effect,color,brightness,parameters,authoredWith:'creative'};}
export function outputFrame(universes,{master=1,blackout=false}={}){return new Map([...universes].map(([u,bytes])=>[u,Uint8Array.from(bytes,v=>blackout?0:Math.round(v*Math.max(0,Math.min(1,master))))]));}

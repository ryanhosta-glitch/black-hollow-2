/** Three resident lights, with a brief dark handover instead of sliding a beam through walls. */
export function createPracticalLights(lights){
 const identity=s=>s?String(s.id||JSON.stringify(s.positionMeters||s.position)):'off';
 const slots=lights.map(light=>({light,current:'off',target:null}));
 function apply(slot,spec){const light=slot.light,p=spec.positionMeters||spec.position;if(light.position.toArray().some((n,i)=>Math.abs(n-p[i])>.05))light.shadow.needsUpdate=true;light.position.fromArray(p);if(light.isSpotLight){light.target.position.fromArray(spec.targetMeters||[p[0],p[1]-1,p[2]]);light.target.updateMatrixWorld();}light.color.set(spec.color??0xffc08a);light.distance=Math.min(32,Math.max(0,Number(spec.rangeMeters??spec.distance??8)||0));slot.current=identity(spec);}
 const intensity=s=>s?Math.min(500,Math.max(0,Number(s.intensity??4)||0)):0;
 return {set(specs,{immediate=false}={}){
  const remaining=specs.slice(0,slots.length).filter(s=>(s.positionMeters||s.position)?.length===3&&(s.positionMeters||s.position).every(Number.isFinite));
  // Keep a fixture in its resident slot when proximity changes the ranking.
  const targets=new Map();for(const slot of slots){const i=remaining.findIndex(s=>identity(s)===slot.current);if(i>=0)targets.set(slot,remaining.splice(i,1)[0]);}
  for(const slot of slots){slot.target=targets.get(slot)||remaining.shift()||null;if(immediate){if(slot.target)apply(slot,slot.target);else slot.current='off';slot.light.intensity=intensity(slot.target);}}
 },tick(dt){const alpha=1-Math.exp(-Math.max(0,Math.min(.1,dt))*14);for(const slot of slots){const switching=identity(slot.target)!==slot.current;const goal=switching?0:intensity(slot.target);slot.light.intensity+=(goal-slot.light.intensity)*alpha;if(switching&&slot.light.intensity<.03){slot.light.intensity=0;if(slot.target)apply(slot,slot.target);else slot.current='off';}}}};
}

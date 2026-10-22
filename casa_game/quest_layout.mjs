// Estate scenes provide useful space even when a student's mansion has one room.
export function estateQuestLayout(house,slots,seed=1){
 const result=slots.map(s=>({...s,scene:'house',approachMeters:[...s.approachMeters]}));
 let state=seed>>>0;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);const safe=(house.playability?.rooms||[]).filter(r=>r.reachable&&r.standingPointMeters&&!house.access.stops.some(s=>s.floor===r.floor&&s.requiresUnlock)&&!house.rooms.find(q=>q.id===r.roomId)?.forgeStair);for(let i=safe.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[safe[i],safe[j]]=[safe[j],safe[i]];}const used=new Set();for(const role of ['porcelain-doll','spellbook','crystal-ball']){const s=result.find(s=>s.role===role);if(s.authored){used.add(s.roomId);continue;}const r=safe.find(r=>!used.has(r.roomId))||safe.find(r=>r.roomId===s.roomId);if(r){s.roomId=r.roomId;s.floor=r.floor;s.approachMeters=[...r.standingPointMeters];used.add(r.roomId);}}
 const set=(role,scene,roomId,point,extra={})=>{const s=result.find(s=>s.role===role);if(s.authored)return;Object.assign(s,{scene,roomId,floor:scene==='hall'?-1:scene==='grounds'?-5:s.floor,approachMeters:point,...extra});};
 set('founder','hall','signature-main-hall',[-10.4,0,5],{displayMeters:[-11.65,0,5],rotationY:Math.PI/2});
 set('exit','hall','signature-main-hall',[0,0,-14]);
 const b=house.decoration?.bounds,y=house.decoration?.groundY;
 if(b&&Number.isFinite(y)){
  const clear=p=>!(house.decoration.colliders||[]).some(c=>c.floor===null&&p[0]>c.bounds.minX-.5&&p[0]<c.bounds.maxX+.5&&p[2]>c.bounds.minZ-.5&&p[2]<c.bounds.maxZ+.5);
  const candidates=[-3,3,-5,5,0].map(dx=>[(b.minX+b.maxX)/2+dx,y,b.minZ-3.8]).filter(p=>p[0]>b.minX-8&&p[0]<b.maxX+8&&clear(p));
  if(candidates.length)set('seer','grounds','cemetery',candidates[0]);
  if(house.rooms.length===1&&candidates.length>1)set('crystal-ball','grounds','cemetery',candidates[1]);
 }
 // Never shuffle a collectible out of its validated scene after assigning it.
 if(house.rooms.length<=2)set('spellbook','hall','signature-main-hall',[10.4,0,-4],{displayMeters:[11.5,0,-4],rotationY:-Math.PI/2});
 return result;
}

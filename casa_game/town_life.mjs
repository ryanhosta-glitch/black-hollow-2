export const CLOCK_SITE={id:'clock',name:'The Crooked Hat Clock',position:[8,0,8],approach:[8,0,11.2]};
export function createTownClock(){
 const state={seconds:0,rung:0};return {state,tick(time){state.seconds=Math.max(0,Number.isFinite(time)?time/1000:0);},choices:()=>[{id:'ring',label:'Ring the town bell'},{id:'guide',label:'Find an unfinished stall'},{id:'recall',label:'Call the neighbours home'}],clue(){const total=11*3600+59*60+40+state.seconds,h=Math.floor(total/3600)%12||12,m=Math.floor(total/60)%60,s=Math.floor(total)%60;return 'THE TOWN CLOCK · '+h+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+' · Ring the bell, find a stall, or gather your neighbours.';},act(choice,completed=[]){if(choice==='ring'){state.rung++;return {ok:true,bell:true,text:'The bell rolls down all four streets. Even the pumpkins listen.'};}if(choice==='guide'){const id=['potions','brooms','choir'].find(id=>!completed.includes(id));return {ok:true,guide:id,text:id?'Follow the light to '+({potions:'Nettle’s potion stall',brooms:'Bramble’s broom rack',choir:'the Pumpkin Parlour'}[id])+'.':'Your three village stamps are complete. The haunted houses still have stories to tell.'};}if(choice==='recall')return {ok:true,recall:true,bell:true,text:'The witches and their pets are heading back to the Midnight Promenade. They will follow the streets home.'};return {ok:false,text:'Choose one of the clock’s three calls.'};}};
}
/** A bounded, reversible route along the road centres. The visitor never scores
 * against the player's round. Only Madame Wick steps out toward the porch. */
export function createNeighbourRoute(lots=[]){
 const home=[0,0,17],state={position:[...home],yaw:Math.PI,walking:false,visiting:false,returning:false,visits:0,target:null,visitAge:0};let index=0,hold=20,queue=[],history=[[...home]],serial=0;
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
 function plan(){const lot=lots[index++%Math.max(1,lots.length)];if(!lot)return;const lane=lot.lane;if(!lane)return;const z=lot.localLot?.z??lane.toLocal([lot.x,0,lot.z])[2];state.target=lot;const junctions=[[[0,0,6],[4,0,4],[4,0,-4],[0,0,-8]],[[0,0,6],[-4,0,4],[-6,0,0]],[[0,0,6]],[[0,0,6],[4,0,4],[6,0,0]]];queue=junctions[lane.index].map(p=>({p}));const gate=lane.toWorld([0,0,-18]);queue.push({p:gate},{p:lane.toWorld([0,0,z]),visit:true});history=[[...state.position]];
 }
 function recall(){if(state.returning)return false;state.returning=true;state.visiting=false;state.target=null;hold=0;queue=history.slice().reverse().map(p=>({p:[...p]}));if(!queue.length||distance(queue.at(-1).p,home)>.1)queue.push({p:home});return true;}
 return {state,recall,tick(dt,player,paused=false){if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,1);state.walking=false;if(paused||player&&distance(player,state.position)<2)return;
  if(hold>0){hold=Math.max(0,hold-dt);if(state.visiting){state.visitAge+=dt;if(hold===0){state.visiting=false;state.visits++;recall();}}return;}
  if(!queue.length){if(state.returning){state.returning=false;hold=20;history=[[...home]];}else plan();return;}
  const next=queue[0],d=distance(state.position,next.p),step=.95*dt;if(d<=step){state.position=[...next.p];history.push([...next.p]);queue.shift();if(next.visit){state.visiting=true;state.visitAge=0;hold=8;const door=state.target.door;state.yaw=Math.atan2(door[0]-state.position[0],door[2]-state.position[2]);}return;}
  state.yaw=Math.atan2(next.p[0]-state.position[0],next.p[2]-state.position[2]);state.position[0]+=(next.p[0]-state.position[0])/d*step;state.position[2]+=(next.p[2]-state.position[2])/d*step;state.walking=true;
 }};
}

export const NEIGHBORHOOD_FEATURES=['families','spatial-sound','household-personalities','porch-performances','weather-and-flashlight','lived-in-windows','evolving-night','shared-discoveries','ghost-bubbles','candy-chutes','pumpkin-bowling','costume-mirror','pumpkin-cannon','ghost-courier','marshmallow-firepit','porch-radio','crossing-cats','glowing-hopscotch','bat-stamp-hunt','wind-chimes'];
export function neighborhoodSeed(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function householdProfile(id){const seed=neighborhoodSeed(id),kind=['generous','joker','bowl','rocker','scarecrow','chute'][seed%6];return {id,kind,seed,amount:kind==='generous'?2:1,joke:['Why did the ghost take the elevator? To lift its spirits!','What do ghosts put on toast? Boo-berry jam!','Why did the skeleton stay home? It had no body to go with.'][seed%3]};}
export function createNeighborhoodLife(lots=[]){
 const profiles=new Map(lots.map(l=>[l.house.id,householdProfile(l.house.id)])),state={seconds:0,remaining:600,phase:'early',stamps:[],actions:{},event:null,serial:0},paid=new Set(),anchorId=lots.find(l=>profiles.get(l.house.id)?.kind==='generous')?.house.id||lots[0]?.house.id;
 return {state,profiles,setRemaining(remaining){if(Number.isFinite(remaining)){state.remaining=Math.max(0,remaining);state.phase=remaining<=90?'late':remaining<=330?'busy':'early';}},isOpen(id){const p=profiles.get(id);return id===anchorId||!(state.phase==='late'&&p&&p.seed%4===0&&p.kind!=='generous');},tick(dt){if(Number.isFinite(dt)&&dt>0)state.seconds+=Math.min(dt,1);},act(site,choice){
  if(!site||!site.choices?.some(c=>c.id===choice))return {ok:false};const kind=site.kind;
  if(kind==='stamp'&&state.stamps.includes(site.id))return {ok:false,text:'This bat stamp is already in your collection.'};
  let amount=0,text='';
  if(kind==='bowl'){if(choice==='leave')return {ok:true,text:'You leave the sweets for the next visitor.'};if(choice==='two')text='A tiny ghost hand rises from the bowl: “One each, please!”';else if(paid.has(site.id))text='You already took your sweet. Leave some for the next visitor.';else{paid.add(site.id);amount=1;text='One sweet, just as the sign asks. The ghost hand gives you a thumbs-up.';}}
  if(kind==='bowling')text='The pumpkin rolls down the lane and scatters the ghost pins!';
  if(kind==='mirror')text='Your reflection turns into a very fashionable little ghost. Strike a pose!';
  if(kind==='radio')text=['The porch radio plays a little monster march.','A crooked waltz crackles out of the radio.','The radio switches to a pumpkin polka.'][(state.actions[site.id]||0)%3];
  if(kind==='firepit')text='You hold the marshmallow over the embers. Watch it turn golden.';
  if(kind==='stamp'){state.stamps.push(site.id);text='Bat stamp found! '+state.stamps.length+' collected this round.';}
  state.actions[site.id]=(state.actions[site.id]||0)+1;state.event={id:site.id,kind,choice,at:state.seconds,serial:++state.serial};return {ok:true,kind,amount,text};
 }};
}

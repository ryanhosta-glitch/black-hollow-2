export const FAIR_SITES=[
 {id:'potions',name:'Nettle’s Little Disasters',position:[-8,0,-7],approach:[-8,0,-4.7]},
 {id:'brooms',name:'Bramble’s Broom Parking',position:[8,0,-7],approach:[8,0,-4.7]},
 {id:'choir',name:'The Pumpkin Parlour',position:[-8,0,8],approach:[-8,0,10.3]}
];
export function createVillagePassport({storage=globalThis.localStorage}={}){
 const key='bh-village-passport:v1';let raw;try{raw=JSON.parse(storage?.getItem(key)||'null');}catch{}
 const badges=raw?.version===1&&Array.isArray(raw.badges)?FAIR_SITES.map(s=>s.id).filter(id=>raw.badges.includes(id)):[];let persisted=true;
 return {badges,get persisted(){return persisted;},stamp(id){if(!FAIR_SITES.some(s=>s.id===id)||badges.includes(id))return false;badges.push(id);try{storage?.setItem(key,JSON.stringify({version:1,badges}));persisted=!!storage;}catch{persisted=false;}return true;}};
}
export function createFairGame(){
 const state={ingredients:[],parked:false,notes:[],completed:[],event:null,serial:0};const tune=['rose','moss','plum'];
 const choices=id=>id==='potions'?[{id:'mint',label:'Add moonmint'},{id:'dew',label:'Add bottled dew'},{id:'stir',label:'Stir the cauldron'}]:id==='brooms'?[{id:'violet',label:'Park Violet'},{id:'bramble',label:'Park Bramble'},{id:'bell',label:'Ring the recall bell'}]:id==='choir'?[{id:'rose',label:'Tap Rose'},{id:'moss',label:'Tap Moss'},{id:'plum',label:'Tap Plum'}]:[];
 const clue=id=>id==='potions'?'NETTLE’S RECIPE: moonmint → bottled dew → stir. In the pot: '+(state.ingredients.join(' + ')||'nothing, yet')+'.':id==='brooms'?'BROOM SCHOOL: Park Violet, then ring the bell. Bramble has other plans.':id==='choir'?'THE CHOIR’S TUNE: Rose → Moss → Plum. Played: '+(state.notes.join(' → ')||'your turn')+'.':'';
 function act(id,choice){if(!choices(id).some(c=>c.id===choice))return {ok:false,text:'That stall has no such trick.'};let success=false,text='',kind='',note;
  if(id==='potions'){
   if(choice==='stir'){success=state.ingredients.length===2&&state.ingredients[0]==='mint'&&state.ingredients[1]==='dew';text=success?'A moonflower rises from the pot. Nettle applauds. “Excellent. It only sneezed once.”':'The brew sneezes a violet cloud. Nettle hands you a clean spoon. Try the recipe again.';kind=success?'bloom':'sneeze';state.ingredients=[];}
   else{if(state.ingredients.length>=2)state.ingredients=[];state.ingredients.push(choice);kind='bubble';text=choice==='mint'?'Moonmint unfurls in the cauldron.':'Bottled dew rings against the moonmint.';}
  }else if(id==='brooms'){
   if(choice==='violet'){state.parked=true;kind='park';text='Violet settles into her parking space. Now ring the bell.';}
   if(choice==='bramble'){kind='escape';text='Bramble leaves the rack, circles your head, and pretends nothing happened.';}
   if(choice==='bell'){success=state.parked;kind=success?'bow':'recall';text=success?'Violet bows. Bramble is deeply offended that good manners have won.':'The brooms snap upright. Violet is still waiting to be parked.';state.parked=false;}
  }else{note=['rose','moss','plum'].indexOf(choice);state.notes.push(choice);if(choice!==tune[state.notes.length-1]){state.notes=[];kind='wrong-note';text='“Delightfully wrong,” says Plum. Rose starts the tune again.';}else if(state.notes.length===3){success=true;kind='song';text='The pumpkins finish your tune in three-part harmony. Even the clock tower sways.';state.notes=[];}else{kind='note';text=choice[0].toUpperCase()+choice.slice(1)+' answers. Keep the tune going.';}}
  if(success&&!state.completed.includes(id))state.completed.push(id);state.event={site:id,kind,serial:++state.serial};return {ok:true,success,text,kind,note};
 }
 return {state,choices,clue,act,near(p){return FAIR_SITES.find(s=>Array.isArray(p)&&Math.abs(p[1])<.4&&Math.hypot(p[0]-s.approach[0],p[2]-s.approach[2])<1.6)||null;}};
}

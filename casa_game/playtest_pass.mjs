/** Plain-language actions shared by the HUD and first-visit lesson. */
export const FIRST_MOVES={
 vigil:'Find a brass handprint. Touch it, then stand still for three seconds.',
 choir:'Find the torn score. Read its three bell names, then play them in order.',
 escort:'Find the little ghost. Offer your light, then walk together.',
 loop:'Find the clockmaker’s note. Read it to start the clock challenge.',
 masquerade:'Find the seating ledger. Compare its clues with the three guests.',
 bargain:'Find the first receipt. Read both receipts before making a deal.',
 heist:'Open any cabinet. One prize is enough to escape. More prizes mean more danger.',
 garden:'Find a hungry plant. Its leaves show whether it needs light, water, or quiet.'
};
export function directChoices(run,slot,pose){
 if(!run?.phoenix||slot?.index===4||run.state.stage==='complete')return [];
 const choices=run.inspect(slot,pose).choices||[];
 // Accusations and contracts are deliberate decisions, never a default button press.
 if(run.type==='bargain'&&[0,3].includes(slot.index)||run.type==='masquerade'&&slot.index===3)return [];
 return choices;
}
export function actionLabel(run,slot,choice){
 const verbs={hold:'Touch & hold still',sound:'Ring',wake:'Offer your light',shelter:'Shelter the ghost',stop:'Stop',examine:'Examine',read:'Read',take:'Open',hide:'Hide · stand still',refill:'Refill supplies',light:'Give light',water:'Pour water',quiet:'Stay quiet',remember:'Recover a favor'};
 return (verbs[choice.id]||choice.label)+(['sound','stop','take','read','examine'].includes(choice.id)?' · '+slot.label:'');
}
export function objectClue(run,slot){
 if(run.type==='garden'&&slot.index<3)return {light:'☀ SUN VEINS · needs light',water:'◆ SILVER DROPS · needs water',quiet:'◡ FOLDED EARS · needs quiet'}[run.appetite(slot.index)];
 if(run.type==='heist')return slot.index===3?'HIDING PLACE · stand still to lower alarm':slot.index===2?'CAPTIVE NAME · +45 alarm · highest risk':'PRIZE · +22 alarm · you can leave with one';
 if(run.type==='vigil'&&slot.index<3)return run.watch().watching?'WAIT · the eye is open':'TOUCH · then stand still';
 if(run.type==='escort'&&slot.index===0)return 'A LOST GHOST · offer your light';
 return slot.label;
}
export const RELIC_SYMBOLS={lantern:'♜',key:'⚿',compass:'✥',bell:'♧'};

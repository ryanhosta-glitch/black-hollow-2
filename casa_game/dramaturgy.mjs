export const HOUSE_VOICES={
 vigil:{opening:'The wallpaper has stopped pretending those are flowers. They are eyes.',aside:'The house would appreciate a little less running. It has just had the floors frightened.',turn:'A watchman can be a prisoner, too.'},
 choir:{opening:'Something under the floor is trying to remember a song. It has mistaken you for the next verse.',aside:'Please mind the high notes. The chandelier takes criticism personally.',turn:'You were never playing to an empty room.'},
 escort:{opening:'A little lantern moves in the dark. For once, the thing behind you is the one afraid.',aside:'Your guest is small. Your shadow is enormous. Try to be the reassuring one.',turn:'Sometimes rescue means making room.'},
 loop:{opening:'A clock strikes the same minute twice. Somewhere upstairs, someone is still waiting for tomorrow.',aside:'The house has misplaced Tuesday. If you find it, do not wind it.',turn:'The hour you feared was also a beginning.'},
 masquerade:{opening:'Four places are set. Three guests are waiting. Someone has dressed as someone who belongs.',aside:'The soup is invisible. The manners are considerably worse.',turn:'An invitation can be more powerful than an accusation.'},
 bargain:{opening:'A shop has opened where the corridor used to be. The proprietor says the first tomorrow is free.',aside:'Read the small print. It has been known to read back.',turn:'The person behind the counter is in the same trap.'},
 heist:{opening:'The Collector has stepped out. The cabinets know exactly how long you have.',aside:'You may admire the collection. The collection may admire you back.',turn:'The best thing to steal is something that should never have been owned.'},
 garden:{opening:'Moonlight drips from the glass. Three plants turn toward you with excellent posture and terrible appetites.',aside:'The fern has requested a snack and legal representation.',turn:'You have been growing a way out of the dark.'}
};
export function scoreState(session,{mode='street',paused=false}={}){if(!session?.phoenix||mode!=='house')return {family:null,paused:true};const s=session.state;let pressure=session.type==='heist'?s.alarm/100:session.type==='escort'?(100-s.light)/100:session.type==='loop'?1-s.remaining/(s.gentle?240:120):s.dread/100;if(session.type==='vigil'&&session.watch().watching)pressure=Math.max(pressure,.72);return {family:session.type,phase:s.stage==='complete'?'ending':s.reveal?'reveal':'explore',pressure:Math.max(0,Math.min(1,pressure)),paused};}
export function lanternGuide(session,pose){if(!session?.phoenix)return null;const s=session.state;let target=null,instruction='';
 if(s.stage==='complete'){target=session.exit;instruction='Your ending is written. Return to the threshold, or stay and explore.';}
 else if(session.ready){target=session.exit;instruction=session.type==='heist'?'The threshold is open. Escape now, or risk another cabinet.':'Return to the threshold. The ending is your choice.';}
 else if(session.hold){instruction='Stay here and stand still until the work finishes.';}
 else if(session.type==='choir'){target=s.read.includes(3)?null:session.stations[3];instruction=target?'Read the torn score first.':'Play the phrase you read. Revisit the score whenever you need it.';}
 else if(session.type==='loop'){target=s.read.includes(3)?null:session.stations[3];instruction=target?'Read the clockmaker’s engravings.':'Stop the clocks in the engraved order. Your journal keeps it.';}
 else if(session.type==='masquerade'){target=!s.read.includes(3)?session.stations[3]:session.stations.find((_,i)=>i<3&&!s.read.includes(i))||session.stations[3];instruction=s.read.length<4?'Read the ledger and compare all three guests.':'Return to the ledger. Name the guest whose detail does not fit.';}
 else if(session.type==='bargain'){target=!s.read.includes(1)?session.stations[1]:!s.read.includes(2)?session.stations[2]:null;instruction=target?'Read both receipts before agreeing to anything.':'Choose your terms: a fair payment, or the witnessed furnace.';}
 else if(session.type==='heist'){target=s.loot.length?session.exit:session.stations[0];instruction=s.loot.length?'You can leave with a prize—or risk another cabinet.':'Choose a cabinet. The velvet screen is a hiding place.';}
 else if(session.type==='escort'){target=session.stations[s.escortStarted?s.escortIndex:0];instruction=s.escortStarted?'Walk toward the next haven. Wait nearby if the light fades.':'Offer the lost guest your light.';}
 else if(session.type==='garden'){target=session.stations.find((_,i)=>i<3&&!s.bloomed.includes(i));instruction='Read the next plant’s leaves, then choose what it needs.';}
 else{target=session.stations.find((_,i)=>i<3&&!s.solved.includes(i));instruction=session.watch().watching?'Stand still while the house watches.':'Find an unsealed ward. Place your hand, then stand still.';}
 const sameRoom=target&&target.scene===pose?.scene&&target.roomId===pose?.roomId;
 return {targetId:target?.id||null,sameRoom:!!sameRoom,instruction,location:target?(sameRoom?'Here: ':target.scene==='hall'?'Grand Main Hall · ':'Find: ')+target.label+' · '+target.place:'Your next move is in the clues you have read.'};
}

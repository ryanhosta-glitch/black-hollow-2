// Original motifs and sparse chamber-synth arrangements; no borrowed themes or recordings.
export const SCORE_THEMES={
 vigil:{root:50,notes:[0,7,1,8,3,10,5,1],bpm:68,wave:'triangle'},
 choir:{root:60,notes:[0,4,9,7,2,11,5,0],bpm:72,wave:'sine'},
 escort:{root:55,notes:[0,2,7,9,4,7,2,0],bpm:76,wave:'sine'},
 loop:{root:57,notes:[0,3,8,2,7,1,5,3],bpm:84,wave:'triangle'},
 masquerade:{root:53,notes:[0,7,3,9,2,8,5,0],bpm:90,wave:'triangle'},
 bargain:{root:51,notes:[0,6,3,10,1,8,5,2],bpm:66,wave:'triangle'},
 heist:{root:48,notes:[0,3,7,2,8,5,1,7],bpm:96,wave:'triangle'},
 garden:{root:58,notes:[0,5,9,2,7,12,4,9],bpm:70,wave:'sine'}
};
export const midiFrequency=midi=>440*Math.pow(2,(midi-69)/12);
export function scoreBeat({family,phase='explore',pressure=0,beat=0}){
 const t=SCORE_THEMES[family];if(!t)return [];
 const b=((beat%16)+16)%16,p=Math.max(0,Math.min(1,pressure||0)),notes=[];
 const add=(midi,duration,velocity,pan=0)=>notes.push({midi,duration,velocity,wave:t.wave,pan});
 // Leave the second half of each phrase largely empty. The house gets to answer.
 if(phase==='reveal'){if(b<8&&b%2===0)add(t.root+12+t.notes[7-b],1.6,.022);if(b===0)add(t.root-12,3,.018);}
 else if(phase==='ending'){if(b===0){add(t.root,2.8,.02,-.15);add(t.root+7,2.8,.013,.15);}if([2,5,7].includes(b))add(t.root+12+[0,2,7,4][[0,2,5,7].indexOf(b)],2,.022);}
 else{if([0,2,5,7].includes(b)||p>.65&&[9,11,13].includes(b)){const pitch=t.notes[(b+Math.floor(beat/16))%8];add(t.root+pitch+(p>.7?12:0),family==='heist'?.24:1.2,.014+p*.009,b%2?.2:-.2);}if(b===0||p>.65&&b===8)add(t.root-12,2.4,.014);}
 return notes;
}
export function createScoreClock(){let family=null,phase=null,elapsed=0,beat=0;return {advance(dt,state){if(!SCORE_THEMES[state?.family]){family=null;phase=null;elapsed=0;beat=0;return [];}if(family!==state.family||phase!==state.phase){family=state.family;phase=state.phase;elapsed=0;beat=0;}if(state.paused){elapsed=0;return [];}elapsed+=Math.max(0,Math.min(.25,Number(dt)||0));if(elapsed<60/SCORE_THEMES[family].bpm&&beat>0)return [];elapsed=0;return scoreBeat({...state,beat:beat++});},reset(){family=null;phase=null;elapsed=0;beat=0;}};}

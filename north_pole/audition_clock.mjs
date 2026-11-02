import {musicMap} from './sequencer.mjs';
// Only UI time changes. Project objects and saved cue times remain untouched.
export function auditionAt(song,section,elapsedSeconds){
 const map=musicMap(song),start=map.tickToSeconds(section.startTick),end=map.tickToSeconds(section.endTick),duration=end-start;
 if(duration<=0)return section.startTick;
 return map.secondsToTick(start+((elapsedSeconds%duration)+duration)%duration);
}

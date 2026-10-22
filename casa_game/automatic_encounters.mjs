// Persist discovery keys; suppress repeats and overlapping performances.
export function createEncounterGate(seen={},quietMs=6500){
 let last=-Infinity,pending=null;
 return {seen,get pending(){return pending;},begin(action,time,{visible=true}={}){if(!action?.automatic||!action.key||!visible||pending||seen[action.key]||!action.instant&&time-last<quietMs)return false;pending={action,start:time};last=time;return true;},finish(){if(!pending)return null;const a=pending.action;seen[a.key]=true;pending=null;return a;},cancel(){pending=null;},reset(){pending=null;last=-Infinity;}};
}

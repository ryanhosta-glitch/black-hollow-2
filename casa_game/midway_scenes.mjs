import {roomIdentity,stableRoomHash} from './room_profiles.mjs';
import {circleTouchesRectangle,segmentTouchesRectangle} from './navigation/door_leaf_collision.mjs';
const FT=.3048;
const freeze=x=>{for(const v of Object.values(x))if(v&&typeof v==='object')freeze(v);return Object.freeze(x);};
// Templates are performances, not quests or extra encounter actors. Add new catalog entries here.
export const MIDWAY_SCENES=freeze({
 library:{motif:'books',objects:['bookcase','writing_desk'],hook:'draft',titles:['The Unfinished Catalogue','The Letter That Writes Back'],anticipation:'The pages turn to a name that should not be here.',reveal:'The librarian offers you the final volume.',resolution:'Your name fades from the catalogue.'},
 ballroom:{motif:'music',objects:['grandfather_clock','tufted_settee'],hook:'clock',titles:['The Thirteenth Waltz','One Last Dance'],anticipation:'A dance card opens at the final name.',reveal:'A vanished guest bows as the music rises.',resolution:'The dancer leaves a place for you next time.'},
 bedroom:{motif:'ribbon',objects:['bed','wardrobe'],hook:'draft',titles:['The Sleeper’s Invitation','The Guest Expected Home'],anticipation:'A ribbon lifts from an unseen invitation.',reveal:'The missing guest returns to keep watch.',resolution:'The ribbon settles. The guest can rest.'},
 laboratory:{motif:'bottles',objects:['laboratory_bench','writing_desk'],hook:'glow',titles:['The Midnight Experiment','The Final Observation'],anticipation:'The experiment begins without its experimenter.',reveal:'The scientist returns with a spectral formula.',resolution:'The bottles dim; the final observation remains unwritten.'},
 conservatory:{motif:'leaves',objects:['fern_urn','plant_stand'],hook:'draft',titles:['The Patient Garden','The Glasshouse Gardener'],anticipation:'Pale leaves turn toward your carriage.',reveal:'The gardener emerges from the remembered garden.',resolution:'The leaves fold around a secret seed.'},
 crypt:{motif:'memorial',objects:['sarcophagus','coffin_cabinet'],hook:'glow',titles:['The Last Procession','Expected Home'],anticipation:'A memorial wreath opens for one last visitor.',reveal:'The keeper raises an offering to the forgotten.',resolution:'The procession leaves your place unfilled.'},
 gallery:{motif:'frames',objects:['console','coffin_cabinet'],hook:'portrait',titles:['The Absent Sitter','The Watching Collection'],anticipation:'An empty frame waits for its missing sitter.',reveal:'The sitter steps out of a remembered portrait.',resolution:'The frame is empty again. The eyes are not.'},
 dining:{motif:'plates',objects:['banquet_ensemble','supper_table','dining_table'],hook:'reflection',titles:['The Supper That Never Ends','The Untouched Setting'],anticipation:'An untouched place setting rises for a late guest.',reveal:'The host arrives to announce the final course.',resolution:'The plates lower. Supper will wait another night.'},
 nursery:{motif:'toys',objects:['bed','wardrobe'],hook:'clock',titles:['The Lost Lullaby','The Toymaker’s Promise'],anticipation:'A wooden toy turns to face its absent owner.',reveal:'A gentle keeper returns with the missing keepsake.',resolution:'The toy is still. Its owner is remembered.'},
 parlor:{motif:'letters',objects:['tufted_settee','console','writing_desk'],hook:'draft',titles:['The Uninvited Guest','The Visiting Card'],anticipation:'A visiting card drifts toward the empty chair.',reveal:'The guest who never left offers a silent greeting.',resolution:'The invitation folds itself away.'},
 circulation:{motif:'lanterns',objects:[],hook:'draft',titles:['The Next Door','The Lantern Bearer'],anticipation:'A distant lantern holds its breath.',reveal:'A lost usher points the way onward.',resolution:'The passage remembers where it leads.'}
});
const valid=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite);
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
/** A performance occupies a checked free patch only while the validated carriage is stopped. */
export function sceneStage(house,room,anchor,{radius=.43,heading=0}={}){
 const b=room?.boundsFeet;if(!b||!valid(anchor)||room.forgeStair)return null;
 const [x,z,w,d,h]=[b.x,b.y,b.l,b.w,b.h].map(v=>Number(v)*FT);
 const floor=house.manifest?.floors?.[room.floor]?.elevationMeters;
 if(![x,z,w,d,h,floor].every(Number.isFinite)||h<2.15||Math.abs(anchor[1]-floor)>.05)return null;
 const colliders=(house.decoration?.colliders||[]).filter(c=>c.floor===room.floor);
 const clear=p=>p[0]-radius>x+.13&&p[0]+radius<x+w-.13&&p[2]-radius>z+.13&&p[2]+radius<z+d-.13&&!colliders.some(c=>{
  if(!c.bounds||![c.minY,c.maxY,...Object.values(c.bounds)].every(Number.isFinite))return true;
  return c.minY<floor+1.9&&c.maxY>floor+.05&&circleTouchesRectangle(p[0],p[2],c.bounds.minX,c.bounds.maxX,c.bounds.minZ,c.bounds.maxZ,radius+.08);
 });
 for(const angle of [0,.48,-.48,.9,-.9])for(const r of [1.55,1.25,1.9]){
  const p=[anchor[0]-Math.sin(heading+angle)*r,floor,anchor[2]-Math.cos(heading+angle)*r];
  if(clear(p)&&!colliders.some(c=>c.minY<floor+1.5&&c.maxY>floor+.95&&segmentTouchesRectangle(anchor,p,c.bounds.minX,c.bounds.maxX,c.bounds.minZ,c.bounds.maxZ,.08)))return p;
 }
 return null;
}
export function planMidwayScenes(house,plan){
 if(!Array.isArray(house?.rooms)||!Array.isArray(plan?.legs)||plan.legs.length>1800)throw Error('Invalid Midway scene inputs');
 const rooms=new Map(house.rooms.map(r=>[r.id,r])),scenes=[],omitted=[];let heading=0;
 for(const [index,leg]of plan.legs.entries()){
  if(['room','portal'].includes(leg.kind)&&leg.points?.length>1){const p=leg.points.at(-1),a=[...leg.points].reverse().find(a=>distance(a,p)>.001);if(a)heading=Math.atan2(-(p[0]-a[0]),-(p[2]-a[2]))+(leg.drive==='reverse'?Math.PI:0);}
  if(leg.kind!=='scene')continue;
  const room=rooms.get(leg.roomId),finale=leg.identity==='finale',identity=room&&roomIdentity(room),template=MIDWAY_SCENES[identity];
  if(!room||!template||!valid(leg.points?.[0])||!Number.isFinite(leg.durationSeconds)||leg.durationSeconds<2||leg.durationSeconds>15){omitted.push({index,roomId:leg.roomId,reason:'invalid-scene-contract'});continue;}
  const content=house.decoration?.roomContents?.find(c=>c.roomId===room.id),disabled=content?.atmosphere?.effects===false;
  const stage=!disabled&&sceneStage(house,room,leg.points[0],{heading});
  const furnishings=(house.decoration?.furniture||[]).filter(f=>f.roomId===room.id&&template.objects.includes(f.type));
  const hash=stableRoomHash(`${plan.attraction?.seed||0}:${house.manifest?.id}:${room.id}`),variant=furnishings.length?hash%template.titles.length:0;
  const signature=!finale&&room.id===plan.attraction?.signatureRoomId;
  const spec={index,roomId:room.id,identity,finale,signature,variant,title:finale?'The Last Guest Takes a Bow':template.titles[variant],motif:finale?'lanterns':template.motif,hook:finale?'glow':template.hook,stage:stage||null,anchor:[...leg.points[0]],duration:leg.durationSeconds,compiledStoryTitle:typeof content?.story?.title==='string'?content.story.title.slice(0,180):null,supportedObjectIds:furnishings.map(f=>f.id).filter(Boolean),requiredForQuest:false,anticipation:finale?'One last lantern answers the carriage.':template.anticipation,reveal:finale?'The last guest bows. You are free to return to the living.':template.reveal,resolution:finale?'The usher is waiting at the unloading platform.':template.resolution};
  if(!stage)omitted.push({index,roomId:room.id,reason:disabled?'authored-effects-disabled':'no-clear-visible-stage'});
  scenes.push(spec);
 }
 return {edition:'midway-scene-director-1',scenes,omitted,budget:{maxActiveScenes:1,maxGhosts:1,maxProps:6,dynamicLights:0}};
}
/** Uses only the ride clock. No timers, RAF, save mutations or required objectives. */
export function createMidwaySceneDirector(schedule,{onPhase=()=>{},onClear=()=>{}}={}){
 let active=null,elapsed=0,phase='',enabled=true,disposed=false;const seen=new Set();
 function clear(){if(active)onClear(active);active=null;phase='';elapsed=0;}
 function emit(next){phase=next;onPhase({...active,phase:next,elapsed});}
 return {start(index){clear();if(disposed||!enabled||seen.has(index))return false;const spec=schedule.scenes.find(s=>s.index===index);if(!spec)return false;seen.add(index);active=spec;emit('anticipation');return true;},
 tick(delta){if(disposed||!active||!enabled)return;if(!Number.isFinite(delta)||delta<0)throw Error('Invalid scene time');elapsed+=Math.min(.05,delta);const progress=elapsed/active.duration;if(progress>=1){clear();return;}if(progress>=.72&&phase!=='resolution')emit('resolution');else if(progress>=.23&&progress<.72&&phase==='anticipation')emit('reveal');},
 setEnabled(value){enabled=!!value;if(!enabled)clear();},cancel:clear,dispose(){clear();disposed=true;seen.clear();},get snapshot(){return active?{...active,phase,elapsed,progress:elapsed/active.duration}:null;},get enabled(){return enabled;}};
}

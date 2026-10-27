import {MIDWAY_SHOW_BOUNDS} from './midway_signature_shows.mjs';
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
 for(const angle of [0,.48,-.48,.9,-.9])for(const r of [Math.max(1.55,radius+.52),Math.max(1.25,radius+.52),Math.max(1.9,radius+.7)]){
  const p=[anchor[0]-Math.sin(heading+angle)*r,floor,anchor[2]-Math.cos(heading+angle)*r];
  if(clear(p)&&!colliders.some(c=>c.minY<floor+1.5&&c.maxY>floor+.95&&segmentTouchesRectangle(anchor,p,c.bounds.minX,c.bounds.maxX,c.bounds.minZ,c.bounds.maxZ,.08)))return p;
 }
 return null;
}

/** Use an existing compiled picture only: no new wall frame, opening or authored surface replacement. */
export function portraitStage(house,room,anchor,{heading=0}={}){
 if(!room||room.forgeStair||!valid(anchor))return null;const b=room.boundsFeet;if(!b)return null;
 const x=Number(b.x)*FT,z=Number(b.y)*FT,w=Number(b.l)*FT,d=Number(b.w)*FT;
 for(const art of (house.decoration?.artwork||[]).filter(a=>a.roomId===room.id)){
  const p=art.positionMeters,n=art.normal,size=art.sizeMeters;if(!valid(p)||!valid(n)||!Array.isArray(size)||size.length<2||!size.slice(0,2).every(v=>Number.isFinite(v)&&v>.25)||!Number.isFinite(x+z+w+d))continue;
  const axis=Math.abs(n[0])>.99&&Math.abs(n[2])<.01?'x':Math.abs(n[2])>.99&&Math.abs(n[0])<.01?'z':null;if(!axis||Math.abs(n[1])>.01)continue;
  const wall=axis==='x'?(n[0]>0?'left':'right'):(n[2]>0?'top':'bottom'),boundary=axis==='x'?(n[0]>0?x:x+w):(n[2]>0?z:z+d);
  if(Math.abs(p[axis==='x'?0:2]-boundary)>.45)continue;
  const at=axis==='x'?p[2]-z:p[0]-x,span=axis==='x'?d:w,width=Math.min(1,size[0]*.78),height=Math.min(.8,size[1]*.78);
  if(at-width/2<.15||at+width/2>span-.15||p[1]-height/2<anchor[1]+.7||p[1]+height/2>anchor[1]+Number(b.h)*FT-.12)continue;
  if((room.openings||[]).some(o=>{if(o.wall!==wall)return false;const middle=Number(o.pos??.5)*span,ow=Number(o.clearWidthMeters)||Number(o.width)*FT||(o.type==='window'?1.65:1.08);return at+width/2>middle-ow/2-.15&&at-width/2<middle+ow/2+.15;}))continue;
  const dx=anchor[0]-p[0],dz=anchor[2]-p[2],dist=Math.hypot(dx,dz),angle=Math.atan2(-dx,-dz)+Math.PI;
  if(dist<.85||dist>4||dx*n[0]+dz*n[2]<.3||Math.abs(Math.atan2(Math.sin(angle-heading),Math.cos(angle-heading)))>.9)continue;
  if((house.decoration?.colliders||[]).some(c=>c.floor===room.floor&&(!c.bounds||![c.minY,c.maxY,...Object.values(c.bounds)].every(Number.isFinite)||c.minY<Math.max(p[1],anchor[1]+1.22)&&c.maxY>Math.min(p[1],anchor[1]+1.22)&&segmentTouchesRectangle(anchor,p,c.bounds.minX,c.bounds.maxX,c.bounds.minZ,c.bounds.maxZ,.06))))continue;
  return {position:p.map((v,i)=>v+n[i]*.035),mountYaw:Math.atan2(n[0],n[2]),mountWidth:width,mountHeight:height,artworkId:art.id||null};
 }
 return null;
}
function desiredShow(room,identity,finale,furniture){if(finale)return 'farewell';if(furniture.some(f=>f.roomId===room.id&&/piano|organ/.test(f.type||'')))return null;if(/music|piano|organ/i.test(room.name||''))return 'pianist';return ({ballroom:'waltz',parlor:'pianist',gallery:'seance',crypt:'seance'})[identity]||null;}

export function planMidwayScenes(house,plan){
 if(!Array.isArray(house?.rooms)||!Array.isArray(plan?.legs)||plan.legs.length>1800)throw Error('Invalid Midway scene inputs');
 const rooms=new Map(house.rooms.map(r=>[r.id,r])),scenes=[],omitted=[],upgradesOmitted=[];let heading=0;
 for(const [index,leg]of plan.legs.entries()){
  if(['room','portal'].includes(leg.kind)&&leg.points?.length>1){const p=leg.points.at(-1),a=[...leg.points].reverse().find(a=>distance(a,p)>.001);if(a)heading=Math.atan2(-(p[0]-a[0]),-(p[2]-a[2]))+(leg.drive==='reverse'?Math.PI:0);}
  if(leg.kind!=='scene')continue;
  const room=rooms.get(leg.roomId),finale=leg.identity==='finale',identity=room&&roomIdentity(room),template=MIDWAY_SCENES[identity];
  if(!room||!template||!valid(leg.points?.[0])||!Number.isFinite(leg.durationSeconds)||leg.durationSeconds<2||leg.durationSeconds>15){omitted.push({index,roomId:leg.roomId,reason:'invalid-scene-contract'});continue;}
  const content=house.decoration?.roomContents?.find(c=>c.roomId===room.id),disabled=content?.atmosphere?.effects===false;
  const wanted=desiredShow(room,identity,finale,house.decoration?.furniture||[]);let show=wanted,stageKind='floor',stageRadius=MIDWAY_SHOW_BOUNDS[show]?.radius||.43,mount=null;
  let stage=!disabled&&sceneStage(house,room,leg.points[0],{heading,radius:stageRadius});
  if(!stage&&wanted&&stageRadius>.43&&!disabled){upgradesOmitted.push({index,roomId:room.id,show:wanted,reason:'signature-footprint-unavailable'});show=null;stageRadius=.43;stage=sceneStage(house,room,leg.points[0],{heading});}
  if(!stage&&!disabled){mount=portraitStage(house,room,leg.points[0],{heading});if(mount){stage=mount.position;show='portrait';stageKind='wall';stageRadius=null;}}
  const showText=show==='waltz'?{title:'The Thirteenth Waltz',anticipation:'Two places remain on the last dance card.',reveal:'The vanished couple returns for their final waltz.',resolution:'They bow to the partner who remembered them.'}:show==='pianist'?{title:'The Pianist Who Stayed',anticipation:'The piano opens to an unfinished nocturne.',reveal:'Elias Quill returns to play the missing phrase.',resolution:'The keys settle. The last note follows your carriage.'}:show==='seance'?{title:'The Unfinished Séance',anticipation:'A pale face gathers inside the spirit glass.',reveal:'Mara Thorne calls the forgotten guest into view.',resolution:'The spirit fades. Your place at the table stays empty.'}:show==='portrait'?{title:'The Portrait Answers',anticipation:'The painted sitter remembers another face.',reveal:'An unfamiliar spirit appears inside the existing portrait.',resolution:'The borrowed face retreats into the picture.'}:null;
  const furnishings=(house.decoration?.furniture||[]).filter(f=>f.roomId===room.id&&template.objects.includes(f.type));
  const hash=stableRoomHash(`${plan.attraction?.seed||0}:${house.manifest?.id}:${room.id}`),variant=furnishings.length?hash%template.titles.length:0;
  const signature=!finale&&room.id===plan.attraction?.signatureRoomId;
  const spec={index,roomId:room.id,identity,finale,signature,variant,title:finale?'The Last Guest Takes a Bow':showText?.title||template.titles[variant],motif:finale?'lanterns':template.motif,hook:finale?'glow':template.hook,show:stage?show:null,stageKind,stageRadius,stageHeight:1.9,...(mount?{mountYaw:mount.mountYaw,mountWidth:mount.mountWidth,mountHeight:mount.mountHeight,artworkId:mount.artworkId}:{}),stage:stage||null,anchor:[...leg.points[0]],duration:leg.durationSeconds,compiledStoryTitle:typeof content?.story?.title==='string'?content.story.title.slice(0,180):null,supportedObjectIds:furnishings.map(f=>f.id).filter(Boolean),requiredForQuest:false,anticipation:finale?'One last lantern answers the carriage.':showText?.anticipation||template.anticipation,reveal:finale?'The last guest bows. You are free to return to the living.':showText?.reveal||template.reveal,resolution:finale?'The usher is waiting at the unloading platform.':showText?.resolution||template.resolution};
  if(!stage)omitted.push({index,roomId:room.id,reason:disabled?'authored-effects-disabled':'no-clear-visible-stage'});
  scenes.push(spec);
 }
 return {edition:'midway-scene-director-2',scenes,omitted,upgradesOmitted,budget:{maxActiveScenes:1,maxGhosts:2,maxProps:6,maxSignatureCharacters:2,maxPianoKeys:32,dynamicLights:0}};
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

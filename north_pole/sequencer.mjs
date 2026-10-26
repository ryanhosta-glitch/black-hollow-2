// Pure musical-time, patch and playback engine. No browser or wall-clock dependencies.
export const PPQ=960;
export function fraction(text){
 const s=String(text).trim();let n,d;
 if(/^\d+(?:\.\d{1,6})?$/.test(s)){d=10**(s.split('.')[1]?.length||0);n=Math.round(Number(s)*d);}
 else if(/^\d+\s*\/\s*\d+$/.test(s)){[n,d]=s.split('/').map(Number);}
 else throw Error('Use a positive number or fraction, such as 3/4.');
 if(!d||!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||n/d>100000)throw Error('Fraction is outside the supported range.');
 return {n,d,value:n/d,text:s};
}
const finite=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
const integer=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
export function validateSong(s){
 if(s?.format!=='gingerlight-song'||s.version!==1||!integer(s.ppq,24,10000)||!integer(s.endTick,1,100000000)||typeof s.id!=='string'||!/^[a-f0-9]{64}$/.test(s.id)||typeof s.title!=='string'||s.title.length>200)throw Error('Invalid song package.');
 if(!Array.isArray(s.tempos)||!s.tempos.length||s.tempos.length>10000||s.tempos[0].tick!==0||!Array.isArray(s.meters)||!s.meters.length||s.meters[0].tick!==0||s.meters.length>1000)throw Error('Song needs a complete tempo and meter map.');
 for(const [map,test]of [[s.tempos,e=>integer(e.usPerQuarter,100000,6000000)],[s.meters,e=>[3,4,6].includes(e.numerator)&&[4,8].includes(e.denominator)&&((e.numerator===6&&e.denominator===8)||(e.numerator!==6&&e.denominator===4))]]){
  let prev=-1;for(const e of map){if(!integer(e.tick,0,s.endTick)||e.tick<=prev||!test(e))throw Error('Unsupported or unordered music map.');prev=e.tick;}
 }
 if(!Array.isArray(s.notes)||s.notes.length>200000||s.notes.some(n=>!Array.isArray(n)||n.length!==5||!integer(n[0],0,s.endTick)||!integer(n[1],n[0],s.endTick)||!integer(n[2],0,127)||!integer(n[3],0,15)||!integer(n[4],1,127)))throw Error('Invalid note map.');
 if(s.audio?.mimeType!=='audio/mpeg'||typeof s.audio.data!=='string'||s.audio.data.length>32*1024*1024||!/^[A-Za-z0-9+/]*={0,2}$/.test(s.audio.data))throw Error('Invalid embedded audio.');
 return s;
}
export function musicMap(song){
 validateSong(song);const tempos=[];let seconds=0,prev=0,us=song.tempos[0].usPerQuarter;
 for(const t of song.tempos){seconds+=(t.tick-prev)*us/(song.ppq*1e6);tempos.push({...t,seconds});prev=t.tick;us=t.usPerQuarter;}
 const bars=[];let tick=0,mi=0;
 while(tick<song.endTick){
  if(bars.length>=10000)throw Error('Song has too many measures.');
  while(mi+1<song.meters.length&&song.meters[mi+1].tick<=tick)mi++;
  const m=song.meters[mi],beatTicks=song.ppq*(m.denominator===8?1.5:1),beats=m.numerator===6?2:m.numerator;
  const end=tick+beatTicks*beats;
  if(song.meters[mi+1]&&song.meters[mi+1].tick<end)throw Error('Meter changes must occur on measure boundaries.');
  bars.push({index:bars.length,tick,endTick:Math.min(end,song.endTick),beatTicks,beats,numerator:m.numerator,denominator:m.denominator});tick=end;
 }
 function tickToSeconds(t){t=Math.max(0,Math.min(song.endTick,t));let p=tempos[0];for(const e of tempos){if(e.tick>t)break;p=e;}return p.seconds+(t-p.tick)*p.usPerQuarter/(song.ppq*1e6);}
 function secondsToTick(s){let p=tempos[0];for(const e of tempos){if(e.seconds>s)break;p=e;}return Math.max(0,Math.min(song.endTick,p.tick+(s-p.seconds)*song.ppq*1e6/p.usPerQuarter));}
 return {bars,tempos,tickToSeconds,secondsToTick,duration:tickToSeconds(song.endTick)};
}
export function cueTiming(map,measure,beat,offset,duration,unit){
 if(!['measure','beat'].includes(unit))throw Error('Name the duration unit.');
 const bar=map.bars[measure-1];if(!bar||!integer(beat,1,bar.beats))throw Error('Choose a measure and beat in this song.');
 const f=fraction(offset),d=fraction(duration);if(f.value>=1||d.value<=0)throw Error('Offset must be less than one beat; duration must be positive.');
 const start=Math.round(bar.tick+(beat-1+f.value)*bar.beatTicks),end=Math.round(start+d.value*(unit==='measure'?bar.beats:1)*bar.beatTicks);
 if(end<=start)throw Error('Duration is shorter than one MIDI tick.');
 if(end>map.bars.at(-1).endTick)throw Error('Cue extends beyond the song.');
 if(map.bars.some(b=>b.tick>start&&b.tick<end&&(b.beatTicks!==bar.beatTicks||(unit==='measure'&&b.beats!==bar.beats))))throw Error('Split the cue at a meter change so its beat unit stays clear.');
 return {startTick:start,endTick:end};
}
export const PROFILES=[
 {id:'rgb-pixels',name:'RGB pixels · 3 channels per node',channels:['red','green','blue'],pixel:true,source:'HolidayCoro AlphaPix controller mapping'},
 {id:'q-ip-4',name:'SlimPAR Pro Q IP · 4CH RGBA',channels:['red','green','blue','amber']},
 {id:'q-ip-5',name:'SlimPAR Pro Q IP · 5CH dimmer + RGBA',channels:['dimmer','red','green','blue','amber']},
 {id:'colorband-4',name:'COLORband PiX ILS · 12CH / 4 RGB zones',channels:Array.from({length:4},()=>['red','green','blue']).flat(),zones:4},
 {id:'dmx4-1',name:'DMX-4 · 1CH / all outputs together',channels:['dimmer']}
];
export const profile=id=>PROFILES.find(p=>p.id===id);
export function footprint(f){const p=profile(f.profileId);if(!p)throw Error('Unsupported fixture mode.');return p.channels.length*(p.pixel?f.nodes:1);}
export function patchReport(fixtures){
 const errors=[],mirrors=[];
 for(const f of fixtures){
  if(!profile(f.profileId)||!integer(f.nodes,1,170)||!integer(f.universe,1,63999)||!integer(f.address,1,512)||f.address+footprint(f)-1>512)errors.push(`${f.name}: patch must fit within one 512-channel universe.`);
 }
 if(errors.length)return {errors,mirrors};
 for(let i=0;i<fixtures.length;i++)for(let j=i+1;j<fixtures.length;j++){
  const a=fixtures[i],b=fixtures[j];if(a.universe!==b.universe)continue;
  if(a.address>b.address+footprint(b)-1||b.address>a.address+footprint(a)-1)continue;
  if(a.address===b.address&&a.profileId===b.profileId&&footprint(a)===footprint(b))mirrors.push([a.id,b.id]);
  else errors.push(`${a.name} and ${b.name}: partial or incompatible channel overlap. Move a start address or universe.`);
 }
 return {errors,mirrors};
}
export function validateProject(p){
 if(p?.format!=='gingerlight-project'||p.version!==1||!p.house||p.house.format!=='gingerlight-exterior')throw Error('Not a Gingerlight project.');
 validateSong(p.song);const map=musicMap(p.song);
 if(!Array.isArray(p.fixtures)||p.fixtures.length>200||!Array.isArray(p.cues)||p.cues.length>2000)throw Error('Project exceeds studio limits.');
 const ids=new Set(),anchors=new Set(p.house.anchors?.map(a=>a.id));
 for(const f of p.fixtures){
  if(typeof f.id!=='string'||ids.has(f.id)||typeof f.name!=='string'||f.name.length>80||!anchors.has(f.anchorId)||!profile(f.profileId)||!integer(f.nodes,1,170))throw Error('Invalid fixture or attachment path.');ids.add(f.id);
 }
 const report=patchReport(p.fixtures);if(report.errors.length)throw Error(report.errors[0]);
 const cues=new Set();
 for(const c of p.cues){
  if(typeof c.id!=='string'||cues.has(c.id)||!ids.has(c.fixtureId)||!integer(c.startTick,0,p.song.endTick)||!integer(c.endTick,c.startTick+1,p.song.endTick)||!['steady','fade','chase'].includes(c.effect)||!/^#[a-f\d]{6}$/i.test(c.color)||!finite(c.brightness,0,1))throw Error('Invalid lighting cue.');cues.add(c.id);
  if(!c.math||typeof c.math.prediction!=='string'||typeof c.math.explanation!=='string'||c.math.prediction.length>2000||c.math.explanation.length>4000)throw Error('Cue needs its saved math evidence.');
  const timing=cueTiming(map,c.math.measure,c.math.beat,c.math.offset,c.math.duration,c.math.unit);
  if(Math.abs(fraction(c.math.studentBeats).value-fraction(c.math.duration).value*(c.math.unit==='measure'?map.bars[c.math.measure-1].beats:1))>1e-9||c.math.studentDmx!==Math.round(c.brightness*255))throw Error('Student calculations do not match the applied cue.');
  if(timing.startTick!==c.startTick||timing.endTick!==c.endTick||Math.abs(fraction(c.math.brightness).value-c.brightness)>1e-9)throw Error('Saved math and cue timing disagree.');
 }
 return p;
}
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);}
export function evaluate(project,tick){
 const universes=new Map(),conflicts=[];const writers=new Map();
 for(const f of project.fixtures)if(!universes.has(f.universe))universes.set(f.universe,new Uint8Array(512));
 for(const c of project.cues.filter(c=>tick>=c.startTick&&tick<c.endTick).sort((a,b)=>a.startTick-b.startTick)){
  const f=project.fixtures.find(f=>f.id===c.fixtureId);if(!f)continue;const p=profile(f.profileId),u=universes.get(f.universe),progress=(tick-c.startTick)/(c.endTick-c.startTick),color=rgb(c.color),gain=c.brightness*(c.effect==='fade'?progress:1),groups=p.pixel?f.nodes:(p.zones||1);
  for(let i=0;i<footprint(f);i++){
   const group=p.pixel||p.zones?Math.floor(i/3):0,role=p.channels[i%p.channels.length],chase=c.effect!=='chase'||group===Math.min(groups-1,Math.floor(progress*groups)),g=gain*(chase?1:0);
   let v=role==='dimmer'?g:role==='amber'?0:(color[['red','green','blue'].indexOf(role)]||0)*g;
   // With a master dimmer, color channels stay full-scale and the master carries intensity.
   if(p.channels.includes('dimmer')&&role!=='dimmer')v=role==='amber'?0:(color[['red','green','blue'].indexOf(role)]||0);
   const addr=f.address-1+i,key=f.universe+':'+addr,byte=Math.round(v*255);
   if(writers.has(key)&&u[addr]!==byte)conflicts.push(key);writers.set(key,c.id);u[addr]=byte;
  }
 }
 return {universes,conflicts:[...new Set(conflicts)]};
}
export function fixtureColors(f,universes){
 const p=profile(f.profileId),u=universes.get(f.universe)||new Uint8Array(512),groups=p.pixel?f.nodes:(p.zones||1),out=[];
 for(let g=0;g<groups;g++){
  const start=f.address-1+(p.pixel||p.zones?g*3:0),channels=p.pixel||p.zones?['red','green','blue']:p.channels;
  const read=role=>{const i=channels.indexOf(role);return i<0?0:u[start+i]/255;},master=channels.includes('dimmer')?read('dimmer'):1;
  out.push(channels.length===1?[master,master*.8,master*.5]:[Math.min(1,read('red')+read('amber')),Math.min(1,read('green')+read('amber')*.45),read('blue')].map(v=>v*master));
 }
 return out;
}
export async function sha256(data){const b=typeof data==='string'?new TextEncoder().encode(data):data;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),v=>v.toString(16).padStart(2,'0')).join('');}
export async function sealProject(p){validateProject(p);const clean=structuredClone(p);delete clean.checksum;clean.checksum=await sha256(JSON.stringify(clean));return clean;}
export async function openProject(p){const clean=structuredClone(p),hash=clean.checksum;delete clean.checksum;if(await sha256(JSON.stringify(clean))!==hash)throw Error('Project checksum failed. Reopen an unedited download.');validateProject(p);return p;}
export async function verifySong(s){validateSong(s);const clean=structuredClone(s);delete clean.checksum;if(await sha256(JSON.stringify(clean))!==s.checksum)throw Error('Song tempo, meter or note map changed.');const bytes=x=>Uint8Array.from(atob(x),c=>c.charCodeAt(0));if(await sha256(bytes(s.audio.data))!==s.audioSha256||await sha256(bytes(s.midiBase64))!==s.midiSha256||await sha256(s.midiSha256+s.audioSha256)!==s.id)throw Error('Song audio or MIDI identity changed.');return s;}

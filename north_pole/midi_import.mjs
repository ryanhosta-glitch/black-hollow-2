import {sha256,verifySong,musicMap} from './sequencer.mjs';
// Standard MIDI files 0/1, PPQ timing. Unsupported timebases fail explicitly.
export function parseMidi(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let pos=0;
 const need=n=>{if(pos+n>bytes.length)throw Error('MIDI file ended unexpectedly.');};
 const u8=()=>{need(1);return bytes[pos++];},u16=()=>{need(2);const n=view.getUint16(pos);pos+=2;return n;},u32=()=>{need(4);const n=view.getUint32(pos);pos+=4;return n;};
 const text=n=>{need(n);const s=new TextDecoder().decode(bytes.subarray(pos,pos+n));pos+=n;return s;};
 const variable=()=>{let v=0;for(let i=0;i<4;i++){const b=u8();v=v*128+(b&127);if(!(b&128))return v;}throw Error('Invalid MIDI variable-length value.');};
 if(bytes.length>8*1024*1024)throw Error('MIDI exceeds 8 MiB.');
 if(text(4)!=='MThd')throw Error('Choose a Standard MIDI file.');const header=u32();if(header<6)throw Error('Invalid MIDI header.');const format=u16(),count=u16(),ppq=u16();if(![0,1].includes(format)||count<1||count>256||(format===0&&count!==1)||ppq<24||ppq>10000)throw Error('Use MIDI format 0 or 1 with PPQ timing (24–10,000). SMPTE timing is not supported.');need(header-6);pos+=header-6;
 const tempoEvents=[],meterEvents=[],notes=[],tracks=[];let endTick=0,events=0;
 for(let track=0;track<count;track++){
  if(text(4)!=='MTrk')throw Error('Missing MIDI track.');const length=u32(),end=pos+length;need(length);let tick=0,running=0,name='Track '+(track+1);const held=new Map(),trackNotes=[];
  while(pos<end){if(++events>500000)throw Error('MIDI has too many events.');tick+=variable();if(tick>100000000)throw Error('MIDI is too long.');let status=u8();if(status<128){if(!running)throw Error('Invalid MIDI running status.');pos--;status=running;}
   if(status===255){running=0;const type=u8(),n=variable();need(n);const at=pos;
    if(type===3)name=new TextDecoder().decode(bytes.subarray(pos,pos+n)).slice(0,100);
    if(type===81){if(n!==3)throw Error('Invalid MIDI tempo.');tempoEvents.push({tick,usPerQuarter:bytes[pos]*65536+bytes[pos+1]*256+bytes[pos+2]});}
    if(type===88){if(n<4)throw Error('Invalid MIDI meter.');meterEvents.push({tick,numerator:bytes[pos],denominator:2**bytes[pos+1]});}
    pos=at+n;if(type===47)break;
   }else if(status===240||status===247){running=0;const n=variable();need(n);pos+=n;}
   else if(status>=128&&status<240){running=status;const kind=status>>4,channel=status&15,a=u8(),b=[12,13].includes(kind)?0:u8();if(a>127||b>127)throw Error('Invalid MIDI data byte.');const key=channel+':'+a;
    if(kind===9&&b>0){if(!held.has(key))held.set(key,[]);held.get(key).push([tick,a,channel,b]);}
    else if(kind===8||(kind===9&&b===0)){const q=held.get(key),on=q?.shift();if(on&&tick>on[0]){const note=[on[0],tick,a,channel,on[3]];notes.push(note);trackNotes.push(notes.length-1);}}
   }else throw Error('Unsupported MIDI system event.');
   if(pos>end)throw Error('MIDI event extends beyond its track.');
  }
  for(const q of held.values())for(const on of q)if(tick>on[0]){notes.push([on[0],tick,on[1],on[2],on[3]]);trackNotes.push(notes.length-1);}
  if(pos>end)throw Error('Invalid MIDI track length.');pos=end;endTick=Math.max(endTick,tick);tracks.push({index:track,name,noteIndices:trackNotes});
 }
 const normalize=(list,first)=>{const m=new Map([[0,first]]);for(const e of list)m.set(e.tick,e);return [...m.values()].sort((a,b)=>a.tick-b.tick);};
 return {ppq,endTick,notes,tracks,tempos:normalize(tempoEvents,{tick:0,usPerQuarter:500000}),meters:normalize(meterEvents,{tick:0,numerator:4,denominator:4})};
}
export async function importMusic(midi,audio,title){
 const map=parseMidi(midi),base64=bytes=>{let out='';for(let i=0;i<bytes.length;i+=16384)out+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(out);};
 if(audio.length>20*1024*1024)throw Error('Audio exceeds 20 MiB.');
 const midiSha256=await sha256(midi),audioSha256=await sha256(audio),song={format:'gingerlight-song',version:1,...map,id:await sha256(midiSha256+audioSha256),title:title.slice(0,200),status:'draft',credit:'Locally imported MIDI and MP3. Check arrangement, offset, and audio alignment.',audio:{mimeType:'audio/mpeg',data:base64(audio)},midiBase64:base64(midi),midiSha256,audioSha256};
 musicMap(song);song.checksum=await sha256(JSON.stringify(song));return verifySong(song);
}

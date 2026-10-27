/** Ride-owned media: welcome once, then a looping bed, without wall-clock timers. */
export function createMidwaySoundtrack({makeAudio=url=>new Audio(url)}={}){
 const welcome=makeAudio(new URL('./assets/good-evening.ogg',import.meta.url));
 const beds=['residents-past','room-47'].map(id=>makeAudio(new URL(`./assets/${id}.ogg`,import.meta.url)));
 welcome.preload='auto';welcome.volume=.85;
 for(const bed of beds){bed.preload='none';bed.loop=true;bed.volume=0;}
 let active=false,paused=false,next=0,bed=null,playing=true;
 const play=a=>{if(a.paused&&!a.ended)a.play()?.catch(()=>{});};
 function stop(){active=false;for(const a of [welcome,...beds]){a.pause();a.currentTime=0;}}
 return {
  get active(){return active;},
  start(){stop();active=true;paused=false;bed=beds[next++%beds.length];this.sync(playing);},
  setPaused(value){paused=!!value;},
  sync(audible){playing=audible;if(!active)return;
   if(!audible||paused){welcome.pause();bed.pause();return;}
   if(!welcome.ended)play(welcome);
   if(welcome.currentTime>=2||welcome.ended){bed.volume=welcome.ended?.32:.10;play(bed);}
  },
  stop,
  dispose(){stop();for(const a of [welcome,...beds]){a.src='';a.load?.();}}
 };
}

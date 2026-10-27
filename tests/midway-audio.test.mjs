import test from 'node:test';
import assert from 'node:assert/strict';
import {createMidwaySoundtrack} from '../casa_game/midway_audio.mjs';
test('welcome leads by two seconds, beds alternate and loop, mute/pause/exit release playback',()=>{
 const media=[];const sound=createMidwaySoundtrack({makeAudio(url){const a={src:String(url),paused:true,ended:false,currentTime:0,play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;}};media.push(a);return a;}});
 const [voice,first,second]=media;
 sound.start();assert.equal(voice.paused,false);assert.equal(first.paused,true);
 voice.currentTime=1.99;sound.sync(true);assert.equal(first.paused,true);
 voice.currentTime=2;sound.sync(true);assert.equal(first.paused,false);assert.equal(first.volume,.10);assert.equal(first.loop,true);assert.equal(second.paused,true);
 sound.sync(false);assert.ok(media.every(a=>a.paused));sound.sync(true);assert.equal(first.paused,false);
 sound.setPaused(true);sound.sync(true);assert.ok(media.every(a=>a.paused));sound.setPaused(false);sound.sync(true);
 voice.ended=true;sound.sync(true);assert.equal(first.volume,.32);
 sound.stop();assert.ok(media.every(a=>a.paused&&a.currentTime===0));assert.equal(sound.active,false);
 voice.ended=false;sound.start();voice.currentTime=2;sound.sync(true);assert.equal(first.paused,true);assert.equal(second.paused,false);
 sound.dispose();assert.ok(media.every(a=>a.paused&&a.src===''));
});

import {resolveRoomProfile} from '../casa_game/room_profiles.mjs';
import {roomIdentity,ROOM_PROFILES} from '../casa_game/room_content.mjs';
import {stableHash} from './forge_exterior_style.mjs';
/** Assign only generic rooms; architectural and authored identities take priority. */
export function planRoomThemes(source){
 const blueprint=structuredClone(source),assignments=[],choices=['library','bedroom','parlor','dining','gallery','laboratory','conservatory','nursery','ballroom'];
 for(const [floor,f]of blueprint.floors.entries())for(const r of f.rooms){
  const text=[r.roomType,r.type,r.name].filter(Boolean).join(' '),explicit=ROOM_PROFILES[r.roomTheme],recognized=/crypt|tomb|mausoleum|basement|dungeon|labor|experiment|alchemy|conserv|greenhouse|glasshouse|garden|nursery|playroom|bed|chamber|libr|study|atlas|observatory|dining|kitchen|banquet|ballroom|music|gallery|hall|foyer|entry|stair|corridor|passage|elevator|parlor|living|lounge/i.test(text);
  let identity=roomIdentity(r),reason=explicit?'authored-theme':recognized?'authored-identity':'assigned-generic-room';
  if(!explicit&&!recognized){const min=Math.min(+r.l,+r.w)*.3048,area=+r.l*+r.w*.3048**2;identity=min<1.6?'circulation':choices[stableHash(String(r.id))%choices.length];if(identity==='ballroom'&&area<30)identity='library';}
  r.roomTheme=identity;const profile=resolveRoomProfile(r);assignments.push({roomId:r.id,name:r.name||r.id,floor,identity,family:profile.family,detail:profile.detail,variant:profile.variant,label:ROOM_PROFILES[identity].label,reason});
 }
 return {blueprint,report:{version:1,sourceUnchanged:true,assignments}};
}

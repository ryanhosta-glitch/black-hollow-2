/** Shared identity and inheritance policy. Pure data: safe in Forge and Game. */
const FT=.3048;
const freeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
export const ROOM_FAMILIES=freeze({
 formal:{members:['ballroom','dining','gallery','parlor'],finishTheme:'parlor',wallDrapery:true,stone:false,metal:false,ironFixtures:false,detail:'luxury'},
 private:{members:['bedroom','nursery'],finishTheme:'bedroom',wallDrapery:true,stone:false,metal:false,ironFixtures:false,detail:'luxury'},
 scholarly:{members:['library','laboratory'],finishTheme:'library',wallDrapery:false,stone:false,metal:false,ironFixtures:false,detail:'luxury'},
 botanical:{members:['conservatory'],finishTheme:'conservatory',wallDrapery:false,stone:false,metal:true,ironFixtures:false,detail:'luxury'},
 funerary:{members:['crypt'],finishTheme:'crypt',wallDrapery:false,stone:true,metal:false,ironFixtures:true,detail:'luxury'},
 circulation:{members:['circulation'],finishTheme:'parlor',wallDrapery:false,stone:false,metal:false,ironFixtures:true,detail:'luxury'}
});
const identityOverrides={ballroom:{finishTheme:'ballroom'},dining:{finishTheme:'ballroom',wallDrapery:false},laboratory:{finishTheme:'laboratory',metal:true,ironFixtures:true}};
const identities={
 library:{label:'Library',furniture:['bookcase','writing_desk','grandfather_clock','gothic_armchair','curio_cabinet'],scene:'An unfinished letter',text:'An open book marks the place where its reader stopped. A letter beneath it ends halfway through a sentence.',ornament:'books',reaction:'clock'},
 laboratory:{label:'Laboratory',furniture:['laboratory_bench','curio_cabinet','writing_desk','bookcase'],scene:'The interrupted experiment',text:'Three bottles stand beside a stained notebook. The final observation was never written down.',ornament:'bottles',reaction:'glow'},
 bedroom:{label:'Bedchamber',furniture:['bed','wardrobe','marble_fireplace','writing_desk','gothic_armchair','console'],scene:'A guest expected home',text:'The pillow is straightened and a folded ribbon waits beside it. Someone kept this room ready long after its guest disappeared.',ornament:'keepsakes',reaction:'draft'},
 nursery:{label:'Nursery',furniture:['bed','wardrobe','gothic_armchair'],scene:'The quiet nursery',text:'A tiny wooden house sits beside an empty picture frame. Its door has been carefully left open.',ornament:'toys',reaction:'clock'},
 dining:{label:'Dining room',furniture:['banquet_ensemble','supper_table','curio_cabinet','dining_table','console','grandfather_clock'],scene:'The place left at supper',text:'One setting is untouched. Beside it, a folded invitation has been turned face down.',ornament:'plates',reaction:'reflection'},
 conservatory:{label:'Conservatory',furniture:['fern_urn','plant_stand','writing_desk','gothic_armchair'],scene:'The patient garden',text:'A plant has grown around the handle of a watering can. Numbered seed packets remain in careful order.',ornament:'plants',reaction:'draft'},
 crypt:{label:'Crypt',furniture:['sarcophagus','coffin_cabinet','console'],scene:'The unfinished inscription',text:'Flowers have been laid below an unfinished inscription. Its last line reads: expected home.',ornament:'memorial',reaction:'glow'},
 gallery:{label:'Gallery',furniture:['tufted_settee','coffin_cabinet','console','fern_urn','bookcase'],scene:'The absent sitter',text:'An empty frame bears the same dust-free outline as the portraits beside it. Someone removed its picture recently.',ornament:'frames',reaction:'portrait'},
 ballroom:{label:'Ballroom',furniture:['tufted_settee','grandfather_clock','console','fern_urn','marble_fireplace'],scene:'The last dance',text:'A dance card remains open at the final name. A ribbon still marks a place for a partner who never arrived.',ornament:'music',reaction:'clock'},
 circulation:{label:'Passage',furniture:[],scene:'Marks along the passage',text:'Small marks in the paneling continue toward the next doorway. They look deliberate rather than accidental.',ornament:'wayfinding',reaction:'draft'},
 parlor:{label:'Parlor',furniture:['tufted_settee','marble_fireplace','gothic_armchair','writing_desk','curio_cabinet'],scene:'The interrupted visit',text:'A calling card rests beside a cold cup. The visitor seems to have stepped away in the middle of a conversation.',ornament:'keepsakes',reaction:'reflection'}
};
export function roomIdentity(room={}){const s=[room.roomType,room.type,room.name,room.source?.roomType,room.source?.name].filter(Boolean).join(' ').toLowerCase();if(room.forgeStair||/stair|corridor|passage|elevator/.test(s))return 'circulation';if(identities[room.roomTheme||room.source?.roomTheme])return room.roomTheme||room.source.roomTheme;for(const [pattern,key]of [[/crypt|tomb|mausoleum|basement|dungeon/,'crypt'],[/labor|experiment|alchemy/,'laboratory'],[/conserv|greenhouse|glasshouse|garden/,'conservatory'],[/nursery|playroom/,'nursery'],[/bed|chamber/,'bedroom'],[/libr|study|atlas|observatory/,'library'],[/dining|kitchen|banquet/,'dining'],[/ballroom|music/,'ballroom'],[/gallery|hall|foyer|entry/,'gallery'],[/parlor|living|lounge/,'parlor']])if(pattern.test(s))return key;return 'parlor';}
export function furnishingTarget(room){const b=room.boundsFeet||room,area=+b.l*+b.w*FT*FT,min=Math.min(+b.l,+b.w)*FT;if(roomIdentity(room)==='circulation'||min<2.1||area<7)return 0;return Math.min(12,Math.max(2,Math.ceil(area/9)));}

export const ROOM_PROFILES=freeze(Object.fromEntries(Object.entries(identities).map(([identity,profile])=>{
 const [family,defaults]=Object.entries(ROOM_FAMILIES).find(([,value])=>value.members.includes(identity));
 const {members,...inherited}=defaults;
 return [identity,{...inherited,...profile,...identityOverrides[identity],identity,family}];
})));
export const stableRoomHash=s=>[...String(s)].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,17);
export const DETAIL_LEVELS=freeze({essential:0,standard:1,luxury:2});
export function resolveRoomProfile(room={},options={}){
 const identity=roomIdentity(room),base=ROOM_PROFILES[identity],authored=room.forgeDecoration||room.source?.forgeDecoration||{};
 const candidate=authored.detail??options.detail??base.detail;
 const detail=Object.hasOwn(DETAIL_LEVELS,candidate)?candidate:base.detail;
 return {...base,detail,detailLevel:DETAIL_LEVELS[detail],variant:stableRoomHash(room.id??room.source?.id??room.name??identity)%7};
}

/** One owner for optional architectural surfaces; structural geometry is never replaced. */
export function usesArchitecturalLuxury(room={}){
 const options=room.forgeDecoration||room.source?.forgeDecoration||{},setting=options.components?.['mansion-envelope'];
 return resolveRoomProfile(room).detailLevel>=1&&options.architecture!==false&&setting!==false&&setting?.enabled!==false&&
  !room.forgeStair&&!room.embeddedStair&&!room.stairs&&!/stair|elevator/i.test([room.name,room.type,room.roomType].join(' '));
}

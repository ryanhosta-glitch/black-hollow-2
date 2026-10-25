import {composeStoryRoom} from './room_storytelling.mjs';
const STORIES={
 library:['The Brass Atlas','A brass globe stands over a half-open atlas. Someone circled a place that appears on no map, then wrote: Leave a light in the window.'],
 laboratory:['The Green Experiment','Three stoppered vessels surround a green specimen. The last notebook entry reads: It responds to kindness before it responds to light.'],
 conservatory:['The Glass Garden','A tiny fern has outgrown its specimen bell. A pressed flower beside it carries a date from next spring.'],
 bedroom:['The Unsent Letter','A jewel box stands open beside a folded letter. The ribbon has been untied and retied so often that its edges have become soft.'],
 nursery:['The Little Theatre','A toy theatre waits with its curtains open. On the little stage, a painted figure is still waiting for its cue.'],
 dining:['The Supper Kept Warm','A silver service waits beside an untouched cup. Every place has a name. The final card reads: Whoever needs a place.'],
 ballroom:['The Last Record','The brass horn of a music machine points toward the empty floor. Its record is labelled: One more dance before the carriage comes.'],
 gallery:['The Absent Sitter','An oval miniature rests beneath a larger frame. Its sitter is gone, but the small brass chair beside it has been carefully polished.'],
 crypt:['The Patient Memorial','Black candles surround a small urn. Someone has replaced the dried flowers with a fresh green sprig.'],
 parlor:['The Calling Card','An engraved tray holds a cup and a calling card. The visitor’s name has faded; the words You are welcome have not.']
};
/** Legacy narrative API retained; shared compositions own the physical arrangement. */
export function legacyVignette(room,options){return composeStoryRoom(room,{...options,story:STORIES[options.identity]||null});}

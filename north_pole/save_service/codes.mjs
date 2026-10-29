const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function newSaveCode(){const bytes=crypto.getRandomValues(new Uint8Array(20));return [...bytes].map(b=>ALPHABET[b&31]).join('').match(/.{5}/g).join('-');}
export function normalizeCode(input){if(typeof input!=='string')throw Error('Enter the code printed on your save card.');const clean=input.toUpperCase().replace(/[\s-]/g,'');if(clean.length!==20||[...clean].some(c=>!ALPHABET.includes(c)))throw Error('Use the complete four-part save code.');return clean.match(/.{5}/g).join('-');}

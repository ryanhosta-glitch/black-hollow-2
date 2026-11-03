// Exact, integer-only classroom partitioning for individually addressable pixels.
export const DARK='#000000';
export function partitionPixels(count, parts){
 if(!Number.isInteger(count)||count<1||count>170)throw Error('Select a valid pixel fixture.');
 if(!Number.isInteger(parts)||parts<1||parts>count)throw Error('Choose a valid number of sections.');
 if(count%parts)throw Error(count+' pixels cannot form '+parts+' equal groups of whole lights. Choose another partition.');
 const size=count/parts;return Array.from({length:parts},(_,i)=>({start:i*size,end:(i+1)*size,count:size}));
}
export function countLit(colors){return colors.filter(color=>color!==DARK).length;}
export function fractionTotals(colors,parts){
 const ranges=partitionPixels(colors.length,parts), lit=ranges.filter(({start,end})=>colors.slice(start,end).every(c=>c!==DARK)).length;
 return {lit,parts,litPixels:countLit(colors),offPixels:colors.length-countLit(colors)};
}
export function paintSections(colors,parts,sections,color){
 if(!/^#[a-f0-9]{6}$/i.test(color))throw Error('Choose a valid lighting color.');
 const ranges=partitionPixels(colors.length,parts),next=colors.slice();
 for(const section of sections){if(!Number.isInteger(section)||section<0||section>=parts)throw Error('Select a valid section.');const {start,end}=ranges[section];next.fill(color,start,end);}
 return next;
}
export function validateFractionColors(colors,nodes){
 return Array.isArray(colors)&&colors.length===nodes&&colors.every(c=>typeof c==='string'&&/^#[a-f0-9]{6}$/i.test(c));
}

/** Shared, immutable Forge/Game photometric policy. Intensities are Three.js candela. */
const rows={
 ballroom:['crystal-chandelier','#ffdbac',28,.64,'#c2cada',false],
 library:['gaslight-chandelier','#ffd19a',12,.58,'#bbc7d6',true],
 parlor:['brass-chandelier','#ffd0a0',18,.64,'#c6bed0',false],
 bedroom:['gaslight-chandelier','#ffceab',11,.61,'#bcc9dc',false],
 dining:['brass-chandelier','#ffdaad',25,.62,'#c6c8d4',false],
 nursery:['brass-chandelier','#ffe0b8',9,.61,'#c8bdd1',false],
 laboratory:['iron-chandelier','#c0ddf3',16,.64,'#bad0df',true],
 conservatory:['botanical-lantern','#d1e1bf',12,.62,'#b9d2df',false],
 crypt:['votive-crown','#a7cadd',8,.58,'#b9c8dc',false],
 gallery:['bronze-chandelier','#ffe0b5',19,.62,'#c5c5d8',false],
 circulation:['gaslight-lantern','#ffd5aa',10,.63,'#bcc8d6',false]
};
const groundColors={ballroom:'#8d7463',parlor:'#786357',dining:'#84705c',gallery:'#756963',bedroom:'#69594f',nursery:'#786354',library:'#685548',crypt:'#4b535e',laboratory:'#64717b',conservatory:'#5b6d63',circulation:'#65584f'};
export const LIGHTING_PROFILES=Object.freeze(Object.fromEntries(Object.entries(rows).map(([identity,[fixture,color,intensity,ambient,sky,task]])=>[identity,Object.freeze({identity,fixture,color,intensity,task,ambient,sky,ground:groundColors[identity],moon:identity==='conservatory'?9:identity==='crypt'?4:6,photometricEdition:'house-light-2'})])));
export const LIGHTING_QUALITY=Object.freeze({performance:Object.freeze({lights:2,shadowMaps:0,ambientGain:1.12}),cinematic:Object.freeze({lights:3,shadowMaps:1,ambientGain:1})});
export function lightingQuality(value){return LIGHTING_QUALITY[value]||LIGHTING_QUALITY.cinematic;}
export function lightingQualityForDevice({softwareGPU=false,width=1024,deviceMemory=8,hardwareConcurrency=8}={}){
 return softwareGPU||width<700||deviceMemory<=4||hardwareConcurrency<=4?'performance':'cinematic';
}

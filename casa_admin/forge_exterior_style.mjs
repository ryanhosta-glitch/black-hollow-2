/** Stable house-wide finishes, shared by interior envelope and street GLBs. */
export const EXTERIOR_STYLES=Object.freeze({
 'siding-ivory':{label:'Ivory siding',kind:'siding',color:[.94,.88,.72,1],textureMaterial:10},
 'siding-charcoal':{label:'Charcoal siding',kind:'siding',color:[.34,.36,.40,1],textureMaterial:10},
 'siding-sage':{label:'Sage siding',kind:'siding',color:[.62,.78,.57,1],textureMaterial:10},
 'siding-blue':{label:'Dusty blue siding',kind:'siding',color:[.50,.66,.86,1],textureMaterial:10},
 'siding-burgundy':{label:'Burgundy siding',kind:'siding',color:[.68,.32,.38,1],textureMaterial:10},
 'siding-plum':{label:'Muted plum siding',kind:'siding',color:[.64,.43,.67,1],textureMaterial:10},
 'brick-red':{label:'Red brick',kind:'brick',color:[.73,.31,.21,1],textureMaterial:17},
 'brick-brown':{label:'Brown brick',kind:'brick',color:[.49,.33,.23,1],textureMaterial:17},
 'brick-soot':{label:'Soot-dark brick',kind:'brick',color:[.30,.29,.29,1],textureMaterial:17},
 'brick-buff':{label:'Buff brick',kind:'brick',color:[.86,.72,.49,1],textureMaterial:17},
 'stucco-cream':{label:'Cream stucco',kind:'stucco',color:[.92,.85,.68,1],textureMaterial:18},
 'stucco-gray':{label:'Warm gray stucco',kind:'stucco',color:[.63,.61,.57,1],textureMaterial:18},
 'stucco-ochre':{label:'Ochre stucco',kind:'stucco',color:[.83,.61,.28,1],textureMaterial:18},
 'stucco-rose':{label:'Dusty rose stucco',kind:'stucco',color:[.84,.56,.55,1],textureMaterial:18}
});
export const TRIM_STYLES={bone:[.79,.73,.62,1],white:[.96,.94,.88,1],wood:[.25,.15,.09,1],charcoal:[.15,.16,.18,1],gold:[.64,.49,.24,1]};
export const ROOF_STYLES={slate:[1,1,1,1],charcoal:[.55,.57,.61,1],moss:[.68,.83,.67,1],burgundy:[.87,.55,.60,1]};
export const stableHash=s=>[...String(s)].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,17);
export function planExterior(source,{style='auto',trim='auto',roof='auto',seed=''}={}){
 const authored=source.exterior||{},keys=Object.keys(EXTERIOR_STYLES),key=style!=='auto'?style:EXTERIOR_STYLES[authored.style]?authored.style:keys[stableHash(seed||source.id||source.name||JSON.stringify(source.floors))%keys.length];
 if(!EXTERIOR_STYLES[key])throw Error('Unknown exterior finish: '+key);
 const trimKey=trim!=='auto'?trim:TRIM_STYLES[authored.trim]?authored.trim:'bone',roofKey=roof!=='auto'?roof:ROOF_STYLES[authored.roof]?authored.roof:'slate';
 if(!TRIM_STYLES[trimKey]||!ROOF_STYLES[roofKey])throw Error('Unknown trim or roof finish');
 return {version:1,style:key,...EXTERIOR_STYLES[key],trim:trimKey,trimColor:TRIM_STYLES[trimKey],roof:roofKey,roofColor:ROOF_STYLES[roofKey],selection:style!=='auto'?'teacher':EXTERIOR_STYLES[authored.style]?'authored':'deterministic',sourceUnchanged:true};
}

// Effects evaluate only from cue time and node index, so seeks are reproducible.
export const EFFECTS=['steady','fade','chase','rainbow','twinkle','sparkle','meteor','comet','wave','pulse','alternating','snowfall','firelight','candle','marquee','sweep','crescendo'];
const noise=(node,step)=>{const n=Math.sin(node*127.1+step*311.7)*43758.5453;return n-Math.floor(n);};
const hue=h=>[0,2/3,1/3].map(o=>Math.max(0,Math.min(1,Math.abs(((h+o)%1)*6-3)-1)));
export function effectSample(c,progress,node,count){
 const speed=c.parameters?.speed??2,direction=c.parameters?.direction??1,phase=c.parameters?.phase??0,t=progress*speed+phase,x=(count<=1?0:node/(count-1))*direction;
 let gain=1,color=null;
 switch(c.effect){
 case 'rainbow':color=hue(((x+t)%1+1)%1);break;
 case 'pulse':gain=(1-Math.cos(t*Math.PI*2))/2;break;
 case 'wave':gain=(1+Math.sin((x-t)*Math.PI*2))/2;break;
 case 'twinkle':case 'sparkle':gain=noise(node,Math.floor(t*12))>(c.effect==='sparkle'?.8:.45)?1:.08;break;
 case 'meteor':case 'comet':{const head=((t%1)+1)%1,d=head-(direction===1?node/Math.max(1,count-1):1-node/Math.max(1,count-1));gain=d>=0?Math.max(0,1-d*5):0;break;}
 case 'alternating':case 'marquee':gain=(node+Math.floor(t*6))%(c.effect==='marquee'?3:2)===0?1:0;break;
 case 'snowfall':gain=noise(node,Math.floor(t*8))>.65?1:.12;color=[.65,.8,1];break;
 case 'firelight':case 'candle':gain=.35+.65*noise(node,Math.floor(t*15));color=[1,.25,.02];break;
 case 'sweep':gain=node/Math.max(1,count-1)<=progress?1:0;break;
 case 'crescendo':gain=progress;break;
 }
 return {gain,color};
}

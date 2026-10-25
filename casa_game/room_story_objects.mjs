import {gothicComponentParts} from './gothic_components.mjs';
import {architecturalShapes} from './component_shapes.mjs';
import {ROOM_MATERIALS as M} from './room_materials.mjs';
const definitions={
 'open-atlas':['writing','A half-open atlas'], 'letter-quill':['writing','An unfinished letter and quill'], 'brass-globe':['scholarly','A brass celestial globe'],
 'specimen-bottles':['scientific','Stoppered, labeled specimens'], 'microscope':['scientific','A brass observation instrument'], 'observation-book':['writing','Handwritten observations'],
 'tea-service':['porcelain','An interrupted silver tea service'], 'place-card':['porcelain','An untouched final place card'], 'serving-dish':['porcelain','A covered silver dish'],
 'miniature-portrait':['pictures','An oval painted miniature'], 'empty-frame':['pictures','A frame without its painting'], 'miniature-chair':['pictures','A carefully polished brass chair'],
 'pocket-watch':['heirlooms','A stopped pocket watch'], 'memorial-urn':['memorial','An urn with a fresh green sprig'], 'offering':['memorial','Flowers and unlit mourning candles'], 'unfinished-plaque':['memorial','An incomplete inscription'],
 'toy-theatre':['nursery','A theatre waiting for its missing player'], 'picture-book':['nursery','An abandoned picture book'], 'wooden-toys':['nursery','Wooden toys and one empty place'],
 'botanical-bell':['botanical','A fern under a specimen bell'], 'seed-packets':['botanical','Numbered seed packets'], 'garden-snips':['botanical','Gardening shears'], 'specimen-book':['botanical','A book of pressed specimens'],
 'gramophone':['music','A record waiting for one last dance'], 'dance-card':['music','An unfinished dance card and ribbon'], 'abandoned-glove':['personal','A glove without its partner'],
 'jewel-letter':['personal','An open jewel box and unsent letter'], 'folded-garment':['personal','Folded clothing left behind'], 'open-luggage':['personal','Unattended luggage'], 'calling-card':['writing','A faded visiting card']
};
export const STORY_OBJECTS=Object.freeze(Object.fromEntries(Object.entries(definitions).map(([id,[family,label]])=>[id,Object.freeze({id,family,label,generator:'storyObjectParts'})])));
export const STORY_OBJECT_LIMITS=Object.freeze({maxTriangles:1600,maxMaterials:9,cacheEntries:32});
const cache=new Map();
export function storyObjectParts(type,{compact=false,variant=0}={}){
 if(!STORY_OBJECTS[type])throw Error('Unknown story object '+type);
 const key=type+':'+compact+':'+Math.abs(variant%3);let result=cache.get(key);
 if(!result){result=build(type,compact,Math.abs(variant%3));if(cache.size>=32)cache.delete(cache.keys().next().value);cache.set(key,result);}
 return {bounds:{min:[...result.bounds.min],max:[...result.bounds.max]},triangles:result.triangles,parts:result.parts.map(p=>({...p,c:[...p.c],s:[...p.s],triangles:p.triangles.map(t=>t.map(v=>[...v]))}))};
}
function build(type,compact,variant){
 const parts=[],g=architecturalShapes((c,s,mat,rot,shape)=>{parts.push({c,s,mat,...shape});return true;}),n=compact?6:10;
 const box=(x,y,z,w,h,d,m=M.wood)=>g.box([x,y,z],[w,h,d],m);
 function lathe(x,y,z,profile,m=M.metal,segments=n){for(let i=0;i<segments;i++)for(let j=1;j<profile.length;j++){const p=(k,q)=>[x+Math.cos(k/segments*Math.PI*2)*profile[q][0],y+profile[q][1],z+Math.sin(k/segments*Math.PI*2)*profile[q][0]];g.quad(p(i,j-1),p(i,j),p(i+1,j),p(i+1,j-1),m);}}
 function rod(a,b,r=.004,m=M.metal){const u=b.map((v,i)=>v-a[i]),len=Math.hypot(...u);if(!len)return;for(let k=0;k<3;k++)u[k]/=len;const ref=Math.abs(u[1])<.9?[0,1,0]:[1,0,0],cross=(p,q)=>[p[1]*q[2]-p[2]*q[1],p[2]*q[0]-p[0]*q[2],p[0]*q[1]-p[1]*q[0]],v0=cross(u,ref),vl=Math.hypot(...v0),v=v0.map(x=>x/vl),w=cross(u,v),p=(c,k)=>c.map((x,i)=>x+r*(Math.cos(k/6*Math.PI*2)*v[i]+Math.sin(k/6*Math.PI*2)*w[i]));for(let k=0;k<6;k++)g.quad(p(a,k),p(b,k),p(b,k+1),p(a,k+1),m);}
 function ring(c,rx,ry,axis='y',m=M.metal,tube=.005){const steps=compact?10:16,sides=4,p=(i,j)=>{const a=i/steps*Math.PI*2,b=j/sides*Math.PI*2;return axis==='y'?[c[0]+Math.cos(a)*(rx+Math.cos(b)*tube),c[1]+Math.sin(b)*tube,c[2]+Math.sin(a)*(ry+Math.cos(b)*tube)]:[c[0]+Math.cos(a)*(rx+Math.cos(b)*tube),c[1]+Math.sin(a)*(ry+Math.cos(b)*tube),c[2]+Math.sin(b)*tube];};for(let i=0;i<steps;i++)for(let j=0;j<sides;j++)g.quad(p(i,j),p(i+1,j),p(i+1,j+1),p(i,j+1),m);}
 function paper(x,y,z,w=.18,d=.13,lines=true){box(x,y+.0015,z,w,.003,d,M.ivory);if(lines&&!compact)for(let k=0;k<3;k++)box(x-.015,y+.0035,z+(k-1)*d*.21,w*(.50+((k+variant)%3)*.08),.001,d*.018,M.ebony);}
 function book(x=0,y=0,z=0,open=true,botanical=false){
  if(!open){box(x,y+.023,z,.18,.046,.22,M.upholstery);box(x,y+.024,z+.004,.165,.032,.216,M.linen);return;}
  box(x,y+.003,z,.30,.006,.22,M.wood);box(x,y+.009,z,.012,.006,.21,M.ivory);for(const sign of [-1,1]){const a=[x,y+.012,z-.104],b=[x+sign*.145,y+.033,z-.104],c=[x+sign*.145,y+.033,z+.104],d=[x,y+.012,z+.104];g.quad(a,b,c,d,M.ivory);if(!compact)for(let k=0;k<3;k++)rod([x+sign*.025,y+.018,z+(k-1)*.047],[x+sign*.118,y+.031,z+(k-1)*.047],.001,M.ebony);}
  if(botanical){rod([x+.07,y+.031,z-.07],[x+.07,y+.031,z+.07],.002,M.conservatory);for(const sign of [-1,1])g.triangle([x+.07,y+.034,z],[x+.07+sign*.055,y+.04,z+.03],[x+.07+sign*.03,y+.035,z-.04],M.conservatory);}
 }
 function flower(x,y,z){lathe(x,y,z,[[0,0],[.035,0],[.025,.06],[.045,.13],[.03,.16]],M.ivory);for(let k=0;k<3;k++){const a=k*Math.PI*2/3,xx=x+Math.cos(a)*.045,zz=z+Math.sin(a)*.04;rod([x,y+.12,z],[xx,y+.25+k*.02,zz],.003,M.conservatory);g.rosette((u,v,t)=>[xx+u,y+.26+k*.02+t*.1,zz+v],0,0,.035,k===1?M.upholstery:M.ivory,5);}}
 function bottle(x=0,z=0,content=M.conservatory){lathe(x,0,z,[[0,0],[.038,0],[.042,.025],[.042,.17],[.019,.21],[.019,.25],[0,.25]],M.leadedGlass);lathe(x,.008,z,[[0,0],[.027,0],[.027,.12],[0,.12]],content,6);box(x,.258,z,.044,.025,.044,M.wood);box(x,.117,z+.044,.055,.045,.003,M.linen);if(!compact){box(x,.12,z+.046,.033,.003,.001,M.ebony);box(x-.01,.108,z+.046,.015,.003,.001,M.ebony);}}
 function cup(x,y,z){lathe(x,y,z,[[0,0],[.046,0],[.046,.008],[.028,.013],[.023,.02],[.032,.075],[.027,.075],[.019,.026],[0,.021]],M.ivory);ring([x+.034,y+.048,z],.022,.025,'z',M.silver,.003);}
 if(['open-atlas','observation-book','picture-book','specimen-book'].includes(type)){book(0,0,0,true,type==='specimen-book');if(type==='picture-book')g.rosette((u,v,t)=>[u,.035+t*.1,v],.075,0,.038,M.upholstery,5);}
 if(['letter-quill','calling-card','place-card','dance-card','seed-packets'].includes(type)){
  paper(0,0,0,type==='calling-card'?.14:.19,.13);if(type==='letter-quill'){rod([-.06,.007,-.04],[.07,.014,.045],.003,M.ebony);g.triangle([.04,.013,.025],[.10,.035,.02],[.08,.022,.08],M.linen);lathe(-.065,.003,.025,[[0,0],[.018,0],[.018,.035],[.01,.045],[0,.045]],M.ebony,6);}
  if(type==='seed-packets'){paper(.045,.004,.03,.11,.09,false);g.rosette((u,v,t)=>[u,.009+t*.02,v],.045,.03,.016,M.conservatory,4);}
  if(type==='dance-card'){box(.045,.006,.01,.035,.003,.12,M.upholstery);ring([.045,.01,-.03],.027,.02,'y',M.upholstery,.003);}
  if(type==='place-card'){g.quad([-.075,.004,.025],[.075,.004,.025],[.075,.065,-.015],[-.075,.065,-.015],M.ivory);if(!compact)box(0,.042,-.001,.095,.003,.003,M.ebony);}
 }
 if(type==='brass-globe'){lathe(0,0,0,[[0,0],[.07,0],[.07,.012],[.022,.025],[.016,.11],[.04,.12],[0,.12]],M.metal);lathe(0,0,0,[[0,.14],[.06,.15],[.095,.19],[.105,.245],[.095,.30],[.06,.34],[0,.35]],M.metal);ring([0,.245,0],.12,.12,'z');ring([0,.245,0],.105,.105,'y');ring([0,.245,0],.06,.10,'z',M.silver,.004);rod([0,.11,0],[0,.37,0],.004);}
 if(type==='specimen-bottles'){bottle(-.065,0);bottle(.065,.012,M.rubyGlass);}
 if(type==='microscope'){box(0,.009,0,.17,.018,.14,M.ebony);rod([-.045,.02,-.04],[-.045,.25,-.04],.009);rod([-.045,.24,-.04],[.045,.28,.02],.018);lathe(.045,.25,.02,[[.022,0],[.022,.045],[.028,.05]],M.metal,8);box(.005,.10,.02,.12,.013,.08,M.metal);rod([-.045,.02,-.04],[.005,.094,.02],.006);box(.005,.11,.02,.06,.004,.04,M.ivory);}
 if(type==='tea-service'){
  lathe(0,0,0,[[0,0],[.105,0],[.115,.012],[.105,.018],[0,.018]],M.silver,12);cup(-.10,.018,.015);cup(.10,.018,.015);lathe(0,.018,-.03,[[0,0],[.04,0],[.055,.055],[.03,.105],[.045,.11],[0,.116]],M.silver);rod([.035,.08,-.03],[.075,.11,-.03],.012,M.silver);ring([-.05,.085,-.03],.028,.036,'z',M.silver,.004);rod([0,.021,.035],[0,.021,.075],.002,M.silver);lathe(0,.018,.078,[[0,0],[.014,0],[.014,.003],[0,.003]],M.silver,8);}
 if(type==='serving-dish'){lathe(0,0,0,[[0,0],[.09,0],[.10,.015],[.09,.025],[.075,.07],[.02,.10],[0,.10]],M.silver);ring([0,.115,0],.018,.018,'z',M.metal,.004);}
 if(['miniature-portrait','empty-frame'].includes(type)){
  box(0,.008,0,.16,.016,.12);rod([0,.015,-.05],[0,.22,.02],.008);ring([0,.20,.025],.09,.12,'z',M.metal,.009);if(type==='miniature-portrait'){box(0,.19,.024,.13,.18,.008,M.ebony);lathe(0,.19,.036,[[0,0],[.029,0],[.035,.037],[.023,.06],[0,.06]],M.ivory,8);box(0,.165,.037,.07,.035,.009,M.ivory);}else{box(0,.20,.015,.14,.19,.008,M.wood);for(const s of [-1,1])box(s*.033,.10,.029,.027,.008,.003,M.ivory);}}
 if(type==='miniature-chair'){for(const x of [-1,1])for(const z of [-1,1])rod([x*.036,0,z*.032],[x*.036,.08,z*.032],.004);box(0,.08,0,.09,.012,.08,M.metal);for(const x of [-1,1])rod([x*.036,.08,-.032],[x*.036,.19,-.032],.004);ring([0,.15,-.032],.035,.035,'z',M.metal,.004);}
 if(type==='pocket-watch'){lathe(0,0,0,[[0,0],[.047,0],[.047,.014],[0,.014]],M.metal);lathe(0,.015,0,[[0,0],[.039,0],[.039,.003],[0,.003]],M.ivory);box(0,.019,-.012,.003,.002,.03,M.ebony);box(.01,.019,0,.022,.002,.003,M.ebony);ring([.057,.012,0],.025,.035,'y',M.metal,.003);}
 if(type==='memorial-urn'){lathe(0,0,0,[[0,0],[.06,0],[.06,.02],[.035,.05],[.065,.13],[.045,.19],[.05,.21],[0,.21]],M.stone);rod([0,.19,0],[.02,.34,.01],.003,M.conservatory);for(const s of [-1,1])g.triangle([.01,.27,0],[s*.065,.30,.01],[.01,.31,.015],M.conservatory);}
 if(type==='offering'){flower(-.04,0,0);lathe(.075,0,.025,[[0,0],[.023,0],[.023,.15],[0,.15]],M.ebony,6);box(.075,.157,.025,.013,.018,.013,M.ivory);}
 if(type==='unfinished-plaque'){box(0,.009,0,.21,.018,.14,M.stone);for(let k=0;k<3;k++)box(k===2?-.035:0,.019,(k-1)*.037,k===2?.07:.15,.001,.005,M.ebony);}
 if(type==='toy-theatre'){
  box(0,.018,0,.39,.036,.20);box(0,.18,-.08,.38,.28,.025);for(const s of [-1,1]){box(s*.17,.18,.07,.025,.30,.025,M.metal);for(let k=0;k<3;k++)box(s*(.13-k*.016),.195,.065,.025,.27,.018,M.upholstery);}box(0,.34,.03,.40,.035,.15,M.metal);box(-.065,.071,.01,.07,.07,.05,M.ivory);lathe(-.065,.105,.01,[[0,0],[.025,.015],[.025,.04],[0,.05]],M.ivory,6);box(.07,.057,.02,.075,.005,.06,M.ebony);
 }
 if(type==='wooden-toys'){for(const [k,z]of [[0,0],[1,-.02]]){box((k-.5)*.09,.035,z,.065,.07,.065,M.wood);g.rosette((u,v,t)=>[u,.072+t*.05,z+v],(k-.5)*.09,0,.018,M.metal,4);}box(.10,.002,.04,.065,.004,.065,M.ebony);}
 if(type==='botanical-bell'){lathe(0,0,0,[[0,0],[.105,0],[.105,.014],[0,.014]],M.wood);lathe(0,.015,0,[[.10,0],[.10,.20],[.08,.28],[.025,.33],[0,.34]],M.displayGlass);for(const p of gothicComponentParts('fern-fronds',{height:.24,compact:true}))for(const t of p.triangles)g.triangle(...t.map(v=>[v[0]*.5,v[1]+.015,v[2]*.5]),p.mat);}
 if(type==='garden-snips'){for(const s of [-1,1]){ring([s*.035,.006,-.035],.026,.034,'y',M.metal,.003);g.triangle([s*.025,.007,-.01],[s*.05,.007,.085],[0,.007,.025],M.silver);}lathe(0,0,.012,[[0,0],[.008,0],[.008,.015],[0,.015]],M.metal,6);}
 if(type==='gramophone'){
  box(0,.03,0,.25,.06,.21);lathe(-.025,.06,.015,[[0,0],[.075,0],[.075,.009],[0,.009]],M.ebony,12);lathe(-.025,.07,.015,[[0,0],[.021,0],[.021,.002],[0,.002]],M.ivory,8);rod([.08,.065,-.055],[.08,.22,.035],.012);const c=[0,.34,.07],neck=[.08,.22,.035];for(let k=0;k<(compact?10:16);k++){const a=k/(compact?10:16)*Math.PI*2,b=(k+1)/(compact?10:16)*Math.PI*2;g.triangle(neck,[c[0]+Math.cos(a)*.14,c[1]+Math.sin(a)*.14,c[2]],[c[0]+Math.cos(b)*.14,c[1]+Math.sin(b)*.14,c[2]],M.metal);}ring(c,.14,.14,'z',M.metal,.006);rod([.125,.035,0],[.155,.035,.03],.006);}
 if(type==='jewel-letter'){paper(-.075,0,.025,.14,.13);box(.055,.035,-.01,.14,.07,.12);box(.055,.11,-.068,.145,.085,.012,M.metal);box(.055,.074,-.005,.12,.012,.095,M.upholstery);ring([.05,.085,0],.02,.022,'y',M.metal,.004);}
 if(['folded-garment','abandoned-glove'].includes(type)){box(0,.014,0,.21,.028,.15,M.linen);if(type==='folded-garment'){box(0,.031,-.045,.09,.008,.045,M.ivory);for(const s of [-1,1])box(s*.09,.018,.01,.07,.02,.10,M.linen);}else for(let k=0;k<4;k++)box((k-1.5)*.025,.014,.095,.019,.025,.07,M.linen);}
 if(type==='open-luggage'){box(0,.075,0,.41,.15,.26);box(0,.23,-.125,.41,.17,.015);box(0,.23,-.114,.36,.13,.008,M.linen);box(0,.153,0,.35,.012,.20,M.linen);for(const s of [-1,1])box(s*.12,.08,.134,.026,.045,.008,M.metal);ring([0,.085,.14],.045,.02,'z',M.metal,.005);paper(.05,.162,.015,.12,.09);}
 g.flush();const points=parts.flatMap(p=>p.triangles.flat()),lo=[0,1,2].map(k=>Math.min(...points.map(p=>p[k]))),hi=[0,1,2].map(k=>Math.max(...points.map(p=>p[k]))),offset=[(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2],triangles=parts.reduce((n,p)=>n+p.triangles.length,0);
 if(triangles>STORY_OBJECT_LIMITS.maxTriangles||parts.length>STORY_OBJECT_LIMITS.maxMaterials)throw Error('Story template budget exceeded: '+type+' '+triangles);
 for(const p of parts){p.c=p.c.map((v,k)=>v-offset[k]);p.triangles=p.triangles.map(t=>t.map(v=>v.map((n,k)=>n-offset[k])));}
 return {parts,triangles,bounds:{min:lo.map((v,k)=>v-offset[k]),max:hi.map((v,k)=>v-offset[k])}};
}

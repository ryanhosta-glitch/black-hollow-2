const actions=['forward','backward','left','right','interact','back','camera','pause','map'];
export const controllerActions=actions;
const axis=(i,sign)=>({axis:i,sign}),button=i=>({button:i});
function defaults(standard){return {forward:[axis(1,-1),button(12)],backward:[axis(1,1),button(13)],left:[axis(0,-1),button(14)],right:[axis(0,1),button(15)],interact:[button(0)],back:[button(1)],camera:[button(standard?2:4)],pause:[button(standard?9:3)],map:[button(standard?3:2)]};}
export function bindingValue(binding,pad){if(binding.button!=null)return Math.max(0,Math.min(1,pad.buttons?.[binding.button]?.value??(pad.buttons?.[binding.button]?.pressed?1:0)));const v=pad.axes?.[binding.axis];if(!Number.isFinite(v)||Math.abs(v)>1.01)return 0;if(binding.value!=null)return Math.abs(v-binding.value)<.1?1:0;return Math.max(0,v*binding.sign);}
export function createGamepadInput({getPads=()=>navigator.getGamepads?.()||[],storage=globalThis.localStorage,onMove=()=>{},onAction=()=>{},onStatus=()=>{},onCapture=()=>{}}={}){
 let id='',mapping=null,previous={},enabled=true,capture=null,baseline=null,lastRepeat=0,status='';
 const key=value=>'bh-controller:v1:'+value;
 function report(text){if(text!==status){status=text;onStatus(text);}}
 function reset(){onMove({forward:0,turn:0});previous={};}
 function save(){try{storage?.setItem(key(id),JSON.stringify(mapping));}catch{}}
 return {get status(){return status;},get connected(){return !!id;},get enabled(){return enabled;},get mapping(){return mapping;},setEnabled(value){enabled=!!value;reset();},remap(action){if(!actions.includes(action)||!id)return false;capture=action;return true;},cancelCapture(){capture=null;},resetMapping(){if(!id)return;mapping=null;try{storage?.removeItem(key(id));}catch{}id='';reset();},poll(time,{focused=true,menu=false}={}){
  let pad;try{pad=[...getPads()].find(p=>p&&p.connected!==false);}catch{report('Controller access unavailable in this browser.');reset();return;}
  if(!pad){if(id)reset();id='';mapping=null;baseline=null;report('Connect a USB controller, focus this page, and press a button.');return;}
  if(pad.id!==id){id=pad.id;mapping=defaults(pad.mapping==='standard');try{const saved=JSON.parse(storage?.getItem(key(id)));if(saved&&actions.every(a=>Array.isArray(saved[a])&&saved[a].every(b=>b&&((Number.isInteger(b.button)&&b.button>=0&&b.button<128)||(Number.isInteger(b.axis)&&b.axis>=0&&b.axis<32&&(b.sign===1||b.sign===-1||Number.isFinite(b.value)))))))mapping=saved;}catch{}previous={};baseline=pad.axes?.slice()||[];report('Detected: '+id.slice(0,100)+(pad.mapping==='standard'?' · standard layout':' · generic layout; remap if needed'));}
  if(!enabled||!focused){reset();baseline=pad.axes?.slice()||[];return;}
  const values=Object.fromEntries(actions.map(a=>[a,Math.max(0,...mapping[a].map(b=>bindingValue(b,pad)))]));
  if(capture){let learned=null;for(let i=0;i<(pad.buttons?.length||0);i++)if(pad.buttons[i].pressed&&!previous['button:'+i]){learned=button(i);break;}if(!learned)for(let i=0;i<(pad.axes?.length||0);i++){const v=pad.axes[i],old=baseline?.[i]??0;if(Math.abs(v-old)>.5&&Math.abs(v)<=1.01){learned=Math.abs(old)>1.01?{axis:i,value:v}:axis(i,v<0?-1:1);break;}}if(learned){const action=capture;mapping[action]=[learned];capture=null;save();reset();onCapture(action,learned);}onMove({forward:0,turn:0});}
  else {const clean=v=>v<.25?0:(v-.25)/.75;onMove(menu?{forward:0,turn:0}:{forward:clean(values.forward)-clean(values.backward),turn:clean(values.right)-clean(values.left)});for(const action of actions){const pressed=values[action]>.5,rising=pressed&&!previous[action];if(rising&&(!['forward','backward','left','right'].includes(action)||menu)){if(menu&&['forward','backward','left','right'].includes(action))lastRepeat=time;onAction(action);}else if(menu&&pressed&&['forward','backward','left','right'].includes(action)&&time-lastRepeat>280){lastRepeat=time;onAction(action);}previous[action]=pressed;}}
  for(let i=0;i<(pad.buttons?.length||0);i++)previous['button:'+i]=!!pad.buttons[i].pressed;baseline=pad.axes?.slice()||[];
 },release:reset};
}

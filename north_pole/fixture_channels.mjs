const qSource='https://www.chauvetdj.com/wp-content/uploads/2021/12/SlimPAR_Pro-Q-IP_UM_Rev2.pdf';
export const H6_SOURCE='https://www.chauvetdj.com/wp-content/uploads/2016/01/SlimPAR_H6_USB_UM_Rev1_WO-1.pdf';
export const PROFILES=[
 {id:'rgb-pixels',name:'RGB pixels · 3 channels per node',channels:['red','green','blue'],pixel:true,source:'https://www.holidaycoro.com/AlphaPix-4-V3-RGB-Pixel-Controller-p/722-v3.htm'},
 {id:'q-ip-4',name:'SlimPAR Pro Q IP · 4CH RGBA',channels:['red','green','blue','amber'],source:qSource,wash:true},
 {id:'q-ip-5',name:'SlimPAR Pro Q IP · 5CH dimmer + RGBA',channels:['dimmer','red','green','blue','amber'],source:qSource,wash:true},
 {id:'colorband-4',name:'COLORband PiX ILS · 12CH / 4 RGB zones',channels:Array.from({length:4},()=>['red','green','blue']).flat(),zones:4,source:'https://www.chauvetdj.com/wp-content/uploads/2022/10/COLORband_PiX_ILS_UM_Rev1.pdf'},
 {id:'dmx4-1',name:'DMX-4 · 1CH / all outputs together',channels:['dimmer'],source:'https://www.chauvetdj.com/wp-content/uploads/2015/12/DMX-4_UM_Rev3_WO-1.pdf'},
 {id:'h6-usb-8',name:'SlimPAR H6 USB · 8CH RGBAW+UV',channels:['dimmer','red','green','blue','amber','white','uv','strobe'],source:H6_SOURCE,wash:true,ranges:{strobe:[{min:0,max:10,label:'No strobe / shutter open'},{min:11,max:255,label:'Strobe active · slow → fast'}]},notes:'Verified against manufacturer 8-CH chart, page 12. UV uses a violet display approximation. The manual does not specify a calibrated strobe frequency.'}
];
export const profile=id=>PROFILES.find(p=>p.id===id);
export function channelInfo(f,i){const p=profile(f.profileId),role=p.channels[i%p.channels.length],prefix=p.pixel?'Node '+(Math.floor(i/3)+1)+' · ':p.zones?'Zone '+(Math.floor(i/3)+1)+' · ':'';return {offset:i+1,address:f.address+i,role,label:prefix+({dimmer:'Master dimmer',red:'Red',green:'Green',blue:'Blue',amber:'Amber',white:'White',uv:'UV',strobe:'Strobe'}[role]||role),ranges:p.ranges?.[role]||[{min:0,max:255,label:'0–100% output'}]};}
export function levelDescription(info,value){return info.ranges.find(r=>value>=r.min&&value<=r.max)?.label||'Unmapped value';}

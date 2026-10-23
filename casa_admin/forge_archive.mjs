import {crc32} from '../casa_game/archive.mjs';
const encoder=new TextEncoder();
/** Standard ZIP32 with optional native DEFLATE, lossless and readable by existing CASA consumers. */
export async function packCasa(entries,{compress=typeof CompressionStream==='function'}={}){
 const local=[],central=[];let position=0;
 for(const [name,raw]of entries){const nameBytes=encoder.encode(name),data=raw instanceof Uint8Array?raw:new Uint8Array(raw),crc=crc32(data);let payload=data,method=0;
  if(compress&&data.length>=384&&!/\.(webp|png|ogg|mp3)$/i.test(name)){
   // Native 'deflate' produces a zlib wrapper. ZIP stores the exact raw DEFLATE payload.
   const zlib=new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());
   if(zlib.length>6&&zlib.length-6<data.length){payload=zlib.subarray(2,zlib.length-4);method=8;}
  }
  if(data.length>0xffffffff||position>0xffffffff||entries.length>65535||nameBytes.length>65535)throw Error('CASA exceeds ZIP32 limits');
  const header=new Uint8Array(30+nameBytes.length),h=new DataView(header.buffer);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,method,true);h.setUint32(14,crc,true);h.setUint32(18,payload.length,true);h.setUint32(22,data.length,true);h.setUint16(26,nameBytes.length,true);header.set(nameBytes,30);local.push(header,payload);
  const record=new Uint8Array(46+nameBytes.length),c=new DataView(record.buffer);c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,method,true);c.setUint32(16,crc,true);c.setUint32(20,payload.length,true);c.setUint32(24,data.length,true);c.setUint16(28,nameBytes.length,true);c.setUint32(42,position,true);record.set(nameBytes,46);central.push(record);position+=header.length+payload.length;
 }
 const size=central.reduce((n,c)=>n+c.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,entries.length,true);e.setUint16(10,entries.length,true);e.setUint32(12,size,true);e.setUint32(16,position,true);
 return new Blob([...local,...central,end],{type:'application/octet-stream'});
}

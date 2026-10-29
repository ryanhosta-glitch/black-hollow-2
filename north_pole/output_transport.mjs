// Frame boundary for a future authenticated Black Hollow gateway adapter.
// This module never sends a network request. Art-Net and sACN are UDP protocols;
// a browser needs a gateway that owns protocol and physical-device transport.
export function createOutputRouter(simulation){
 let adapter=null,liveEnabled=false;
 return {
  get liveEnabled(){return liveEnabled;},
  attachGateway(next){if(!next||typeof next.sendFrame!=='function'||typeof next.blackout!=='function')throw Error('A gateway adapter must provide sendFrame and blackout.');if(liveEnabled)throw Error('Disable live output before replacing its gateway.');adapter=next;},
  async enableLive(){if(!adapter)throw Error('No compatible gateway is connected. Simulation remains available.');await adapter.connect?.();liveEnabled=true;},
  async disableLive(){const wasEnabled=liveEnabled;liveEnabled=false;if(wasEnabled)await adapter.blackout();},
  async frame(universes,metadata={}){const snapshot=new Map([...universes].map(([id,bytes])=>{if(!Number.isInteger(id)||id<1||id>63999||!(bytes instanceof Uint8Array)||bytes.length!==512)throw Error('Output requires valid 512-byte universe frames.');return [id,bytes.slice()];}));simulation(snapshot,metadata);if(liveEnabled)try{await adapter.sendFrame(new Map([...snapshot].map(([id,bytes])=>[id,bytes.slice()])),metadata);}catch(error){liveEnabled=false;try{await adapter.blackout();}catch{}throw error;}}
 };
}

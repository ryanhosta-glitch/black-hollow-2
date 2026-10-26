import {buildMidwayForArchive} from '../casa_admin/forge_midway_archive.mjs';
self.onmessage=event=>{try{const plan=buildMidwayForArchive(event.data);self.postMessage({plan});}catch(error){self.postMessage({error:String(error.message)});}};

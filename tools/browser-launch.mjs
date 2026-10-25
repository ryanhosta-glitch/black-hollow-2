// Optional test-only executable override for hosts that already provide Chromium.
// Every launch option, context and assertion remains owned by the existing suite.
import {chromium} from 'playwright-core';
if(process.env.CHROMIUM_PATH){
 const launch=chromium.launch.bind(chromium);
 chromium.launch=options=>launch({...options,executablePath:options?.executablePath||process.env.CHROMIUM_PATH});
}

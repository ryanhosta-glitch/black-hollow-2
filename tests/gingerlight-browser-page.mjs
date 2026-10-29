import {readFile} from 'node:fs/promises';
import {pathToFileURL,fileURLToPath} from 'node:url';
// Some managed Chromium policies block file://. Fulfill only the bundle's
// local HTTP entry; all other requests remain blocked by each test's route.
export async function openStandalone(page,url){
 if(!process.env.GINGER_TEST_HTTP){const response=await page.goto(pathToFileURL(fileURLToPath(url)).href);if(await page.locator('#firstAdvanced').count())await page.click('#firstAdvanced');return response;}
 const entry='http://localhost/'+url.pathname.split('/').at(-1),html=await readFile(url,'utf8');
 await page.route(entry,r=>r.fulfill({contentType:'text/html',body:html}));const response=await page.goto(entry);if(await page.locator('#firstAdvanced').count())await page.click('#firstAdvanced');return response;
}

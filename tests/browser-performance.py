"""Real-browser regression check. Requires Playwright and a Chromium browser."""
import asyncio
import os
from pathlib import Path
import shutil
import threading
import urllib.request
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
# Expose existing module state only in the test response, never in shipped HTML.
HARNESS = """
const batchOriginal=batchStaticScenery;
window.__batchChecks=[];
batchStaticScenery=function(){
 world.updateWorldMatrix(true,true);
 const triangleCount=()=>{let count=0;world.traverse(o=>{if(o.isMesh)count+=(o.geometry?.index?.count||o.geometry?.attributes?.position?.count||0)/3});return count};
 const bounds=()=>{const box=new THREE.Box3();world.traverse(o=>{if(o.isMesh&&(o.userData.bhStaticScenery||o.userData.bhStaticBatch))box.union(new THREE.Box3().setFromObject(o,true))});return box};
 const before=triangleCount(),beforeBounds=bounds(),doors=doorActors.map(d=>[d.pivot,d.pivot.parent]);
 const colliders=JSON.stringify(estate.floors.map(f=>f.rooms.map(r=>bhSceneryBoxes(r))));
 const result=batchOriginal();const afterBounds=bounds();
 window.__batchChecks.push({geometry:triangleCount()===before,
  bounds:beforeBounds.min.distanceTo(afterBounds.min)<.001&&beforeBounds.max.distanceTo(afterBounds.max)<.001,
  doors:doors.every(([pivot,parent])=>pivot.parent===parent),
  collision:colliders===JSON.stringify(estate.floors.map(f=>f.rooms.map(r=>bhSceneryBoxes(r)))),
  savings:staticBatchStats.drawCallsSaved});
 return result;
};
window.__performanceTest={
 stop:()=>{playing=false},
 spawn:()=>{const light=createGamePointLight(0xffffff,5,10,2);light.position.set(player.x,zBase(player.fi)+3.4,player.z);scene.add(light);lightSelectionTime=-Infinity;budgetNearbyLights(performance.now());const selected=selectedLightSources.includes(light);light.removeFromParent();lightSelectionTime=-Infinity;budgetNearbyLights(performance.now());return selected},
 select:(x,z)=>{player.x=x;player.z=z;lightSelectionTime=-Infinity;budgetNearbyLights(performance.now())},
 render:()=>{renderer.render(scene,camera);return{programs:renderer.info.programs.length,slots:lightSlots.length,
   visible:lightSlots.every(l=>l.visible),sources:allPointLights.every(l=>l.layers.mask===0)}},
 transmitting:()=>{let n=0;scene.traverse(o=>{for(const m of [].concat(o.material||[]))if(m.transmission>0)n++});return n}
};
"""

async def run(base):
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),
            args=['--no-sandbox', '--enable-unsafe-swiftshader'])
        page = await browser.new_page(viewport={'width': 960, 'height': 540})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        async def document(route):
            html = (ROOT / 'index.html').read_text()
            marker = '</script><style id="doorwayLivingStyle">'
            assert html.count(marker) == 1
            await route.fulfill(content_type='text/html', body=html.replace(marker, HARNESS + marker))

        async def verified_cdn(route):
            # Optional cloud proxy compatibility; TLS certificate verification stays enabled.
            with urllib.request.urlopen(route.request.url, timeout=60) as response:
                body = response.read()
            await route.fulfill(content_type='application/javascript', body=body)

        await page.route(base, document)
        if os.environ.get('BH_TEST_PROXY_CDN') == '1':
            await page.route('https://cdn.jsdelivr.net/**', verified_cdn)
        await page.goto(base, wait_until='networkidle', timeout=60000)
        await page.locator('#quality').evaluate('(el)=>{el.value="high"}')
        for preset in ['sample', 'stairTest', 'elevatorTest']:
            await page.locator('#' + preset).evaluate('(button)=>button.click()')
            await page.wait_for_function('!document.getElementById("gameLoading")', timeout=120000)
            assert await page.locator('#overlay').evaluate('(el)=>el.classList.contains("hidden")')
            assert not await page.locator('#error').text_content()
            await page.evaluate('window.__performanceTest.stop()')
            batch = await page.evaluate('window.__batchChecks.at(-1)')
            assert batch['geometry'] and batch['bounds'] and batch['doors'] and batch['collision'] and batch['savings'] > 0, batch
            print('House ready; batching preserved geometry, bounds, doors and collision:', preset, batch, flush=True)
        for quality, expected in [('low', 4), ('high', 8), ('low', 4)]:
            await page.locator('#quality').evaluate('(el,value)=>{el.value=value;el.dispatchEvent(new Event("change"))}', quality)
            await page.wait_for_function('!document.getElementById("gameLoading")', timeout=120000)
            programs = []
            for position in [(0, 0), (20, 20), (500, 500), (0, 0)]:
                await page.evaluate('([x,z])=>window.__performanceTest.select(x,z)', list(position))
                result = await page.evaluate('window.__performanceTest.render()')
                assert result['slots'] == expected and result['visible'] and result['sources'], result
                programs.append(result['programs'])
            assert len(set(programs)) == 1, programs
            assert await page.evaluate('window.__performanceTest.spawn()')
            assert (await page.evaluate('window.__performanceTest.render()'))['programs'] == programs[-1]
            if quality == 'low':
                assert await page.evaluate('window.__performanceTest.transmitting()') == 0
            print('Stable shader count and light slots:', quality, programs, flush=True)
        assert not errors, errors
        await browser.close()

if __name__ == '__main__':
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT.parent))
    server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        asyncio.run(run(f'http://127.0.0.1:{server.server_port}/{ROOT.name}/'))
    finally:
        server.shutdown()

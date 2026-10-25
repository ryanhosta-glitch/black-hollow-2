# Chrome/Mac performance acceptance

This procedure measures actual gameplay on the target device. Cloud SwiftShader screenshots and synchronous scene timings do not establish that the game is playable on a Mac. No target-device measurements have yet been collected.

## Prepare without publishing

Use an isolated local copy of the development branch, run `npm ci`, and serve it with `python3 -m http.server 8000`. Open the local `casa_game.html` in Chrome. Use a separate browser profile for testing saves. Keep original student files unchanged; do not use Publish or rebuild the published street. Generated showcase archives are test inputs only.

Record the commit, macOS and Chrome versions, Mac model/chip/RAM, display resolution, browser viewport, power source, battery/energy mode, and `chrome://gpu` renderer/acceleration status. Close unrelated heavy applications. Keep the same settings for before/after runs. Warm up each house for 30 seconds; run each route three times, allowing the device to cool if it throttles.

## Repeatable gameplay routes

1. Load the same original CASA archive in both versions. Time house selection through first responsive player movement. Walk through a doorway, climb stairs, use the elevator, trigger a discovery and return to the street. A preserved archive should still load without recompilation.
2. In separate disposable copies, compile the same eleven-room `tests/fixtures/forge-atmosphere.json` with the original Forge (`4c47d7b`) and the upgraded Forge. Import these synthetic archives locally. Spend 60 seconds per representative scene: ballroom center/ceiling, library desk/corner, conservatory window/plant, bedroom bed/door. Follow the same walking/looking sequence for each version.
3. Exercise an encounter, Floor 13 and a save/reload. Check doors, headroom, texture completion, readable discovery objects and navigation in the dark rooms. Repeat with macOS Reduce Motion enabled.

Use Chrome DevTools **Performance** to record each route, with the same recording options for both versions. Record frame durations, long tasks and input stalls from the actual game trace. Capture Chrome Task Manager's tab CPU/memory after warm-up and after ten minutes; note that these are not exact GPU-memory measurements. Do not substitute a parent-page RAF counter for game-render FPS. The game's existing frame gate targets 30 Hz, so a 60-FPS requirement would be inappropriate.

The Game currently selects its lighting tier automatically at initialization based on viewport/device information; there is no new user-facing tier toggle in this change. Record the actual selected conditions. A narrow viewport can exercise its automatic Performance path, but changes resolution too, so do not describe that comparison as an isolated quality-only measurement. The separate scene harness below can hold resolution constant across both qualities.

## Optional native scene comparison

The existing Node/Playwright scene harness now accepts `FORGE_REVIEW_GPU=native`; its default remains SwiftShader. Point `CHROMIUM_PATH` to a locally installed compatible Chrome/Chromium executable and run:

```sh
FORGE_REVIEW_GPU=native FORGE_REVIEW_EDITION=integrated \
  CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  npm run test:browser:certification
```

Inspect `gpu` in every output view: requesting native rendering does not prove acceleration was obtained. `FORGE_REVIEW_BENCHMARK=0` skips timing for a visual-only study; it does not skip visual/budget assertions. The harness measures isolated scenes at both qualities using forced GPU readback, not full-game performance. Use gameplay traces above for acceptance. Never compare a software-rendered baseline with a native-rendered upgraded run.

## Record and decide

| Run / commit | Scene / tier / viewport | Load-to-control seconds | Median / p95 frame ms | Stalls >100 ms | CPU / tab memory | Ten-minute drift | Visual / interaction defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Baseline | | | | | | | |
| Upgraded | | | | | | | |

Acceptance remains pending until a reviewer supplies these measurements. Confirm responsive input, no browser “wait” warning, usable navigation and stable memory; investigate sustained regression against the matched baseline. Agree on any device-specific timing tolerance before declaring certification. Retain traces and screenshots with the device information. No merge or deployment is implied by completing this procedure.

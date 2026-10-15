# Black Hollow 2 v8.5.19 — Code Audit and QA

## Audit observations directly from v8.5.18

- The 7 embedded v8.5.12 portrait canvases (512×672 each) were painted again on every `updateAnimatedPortraits` call regardless of the player's room.
- The v8.5.18 `animateDrapes` routine recomputed vertex normals on every game frame while the room was active.
- The v8.5.17 curtain/web/door actor arrays had no world-build reset and could retain old 3D object references across mansion loads.
- The original Performance point-light budget compared local `.position` coordinates rather than world-space positions and did not budget Cinematic lights.
- The v8.5.15 living-fire loop allocated new `THREE.Color` objects and palette objects every frame.
- The v8.5.18 animated-glass system scanned every registered pane even if the player was in another room.
- The v8.5.17 ornate crown animation contained a multiplication-by-zero operation.
- On reloading a `.haunt`, the old scene was cleared without a unified geometry/material disposal pass.
- The Storm Portrait was JPEG data under a WebP MIME declaration. Its image bytes were left untouched.

## Verified

- `node --check` passed on the complete ~5 MB ES module.
- Focused VM tests passed: local-vs-world-position light selection, Performance (7) and Cinematic (15) light caps, out-of-range lights, portrait room selection and 175 ms refresh throttling, scene resource disposal exactly once, shared texture non-disposal, room-scoped updates.
- Existing guided-ember route tests passed: doorway route, blocked route, locked lift, same-room clue, exterior suppression.
- Existing guided-ember particle simulation tests passed: ordinary sparks, phantom guiding flight, cleanup after room transition.
- v8.5.18 physically-based material mock tests still passed, including color, normal, and roughness textures, glass, and hardware.
- Checked presence of the prior story, Veilwalk, Floor 13, imported-house validation and music feature markers.
- Verified that the post-module HTML/UI markup is unchanged.

## What is NOT yet verified

- No rendered WebGL playthrough was performed in this environment, so no measured FPS or memory savings are claimed.
- An especially large or unusually complex imported `.haunt` should be playtested on Android and desktop, particularly transitions between floors and `Cinematic` graphics mode.
- The new light budgets may change the balance of visible lighting in extremely large rooms. This is intentional but should be visually checked.
- The old-scene disposal routine deliberately preserves shared textures; its primary gain is reducing abandoned geometry and material programs, not eliminating all retained caches.

## Suggested manual smoke test

Start each preset house, walk near a chandelier, open the Founder/Seer/Storm encounters, look at several animated windows, use the guiding ember test button, change to Cinematic mode, reload another house, and repeat. Confirm that the FPS counter, sound and routes remain stable.

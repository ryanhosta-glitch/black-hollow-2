# Black Hollow 2 — v8.5.19: Under the Hood

A **performance, memory, and code-maintenance release** based on v8.5.18. This is not a visual redesign.

## Optimizations and fixes

1. **Animated portrait image uploads.** Previously the seven new WebP portrait textures could be redrawn and re-uploaded every game frame, whether the player could see them or not. Each texture now tracks which rooms use it and redraws only when the player is in a relevant room, at a limit of roughly 6 updates/second (Performance) or 10 updates/second (Cinematic). The family's quest photo is handled separately so its story moment remains animated.
2. **Lighting selection.** The previous Performance selector compared local object coordinates, causing nested chandelier lights to be treated as though they were near the origin. The new selector uses each light's actual world position and floor elevation. Performance uses up to 7 nearby point lights; Cinematic up to 15. Distant lights do not need to run through the renderer.
3. **Fire animation allocations.** Reuses cached fire palettes and `THREE.Color` objects rather than creating new color objects for every flame emitter every frame. Warm, blue, white, and green flame modes remain intact.
4. **Window actor lifecycle.** Clears previous mansion curtain, spider-web, and ornamental-door registries on new house generation. That prevents the next mansion from continuing to animate inaccessible old-house details.
5. **Fabric animation.** Throttles detailed cloth vertex and normal updates to about 14 times per second. The existing lighter-weight curtain sway and supernatural tieback behavior continue to run.
6. **Glass.** Animated reflective glints are tracked by room and do not update for distant windows.
7. **Spiders.** Web-building spiders are tracked by room and only animate in the current room. Web geometry and progress remain intact.
8. **Dead code.** Removed a per-frame ornate-door-crown update that mathematically moved doors by zero.
9. **Resource cleanup.** Before replacing an existing mansion, releases orphaned Three.js geometries and material GPU programs from the previous scene. Shared asset textures are deliberately preserved because the game reuses them across rooms and houses.
10. **Asset correctness.** Corrected the Storm Portrait's embedded image MIME type from WebP to JPEG to match its actual bytes, without recompressing or changing the artwork.

## What was not deleted

- The built-in Ranger Wraith 3D model, story portrait images, soundtrack, sound effects, and all special quest systems are still in use.
- The layered feature modules have been preserved rather than recklessly consolidated. A full module rewrite would require genuine rendered browser tests and extensive `.haunt` compatibility verification.
- File size therefore stays nearly the same; the performance gains target **work done at runtime**, not HTML text size.

## Developer check

Open the browser's developer console and enter `window.__BlackHollow8519Tests()` to see the optimizer's configuration and scene-rebuild cleanup counters.

## Files

- `Black_Hollow_2_v8_5_19_PERFORMANCE_CODE_POLISH.html` — standalone game (requires internet access to load Three.js from CDN)
- `Black_Hollow_2_v8_5_19_GITHUB_PAGES.zip` — `index.html`, README, and QA report for GitHub Pages

# Victorian Forge development — 2026-10-22

Development branch: `development/victorian-forge`. This work does not update main, deploy Pages, publish a house, or replace any existing CASA archive.

## Repository inspection

- `casa_admin/compiler.html` is the active compiler embedded by `casa_admin.html`; its original architecture was a compact QA box writer.
- `casa_admin/forge_*` supplies access planning, decoration, playability, artwork, gameplay slots and package budgets. These contracts remain in use.
- `casa_game/resources.mjs` loads the precompiled GLBs and packaged textures. The Game does not rebuild blueprints.
- `index.html` contains the older high-detail real-time mansion builder (`addRoom`, `buildWorld`, material styles and room decoration). It is a separate legacy game, not a drop-in archive compiler. Its gameplay and geometry pipeline were left intact.
- Compiler history includes the imported access/clearance snapshot, doorway-aware paneling (`f1b7511`), portrait offsets (`e5c8e6c`) and QA documentation (`d32c8cc`). No additional standalone historical high-detail Forge compiler was found in this repository's available history.

## Implemented passes

1. **Geometry and portable materials.** Extracted the GLB writer, corrected triangle winding versus normals, added UVs and embedded deterministic PNG tiles for oak, damask wallpaper, plaster, slate, mahogany and clapboard. Normals are computed from the actual triangles, supporting convex roof solids. Texture resources travel within each GLB.
2. **Architecture and placement.** Added aperture-aware siding on exposed perimeter runs, including partially shared walls; window glazing, mullions, sills and jambs; taller wainscoting; ceiling coffers; closed gable, hip and mansard roof solids; eaves, ridges and chimney details. Removed older trim that could cross windows. Invalid authored furniture is reported and omitted rather than exported into a doorway. Generated portrait interaction points must clear furnishings. The Game's extra haunting portraits, tableaux and curtains now use solid wall spans rather than fixed wall coordinates.
3. **Inspection and regression pipeline.** Added a 3D preview in the existing Administrator compiler. It opens the generated archive through the actual Game validator/resource loader, supports exterior/floor selection, orbit/zoom, Fit view and floor cutaways. Added pinned development dependencies, `npm test` and a branch/PR CI workflow.

The pipeline retains stable house IDs, source and repaired blueprints, SHA-256 inventories, Administrator staging, publication controls and existing game-owned encounters, elevator, Floor 13 and save contracts. Static QA findings remain visible; exports are not falsely marked gameplay-certified.

## Verification

`npm ci --ignore-scripts && npm test` passes:

- 33 Node test cases: archive validation and safety, publisher atomicity/stale-head protection, quest/session behavior, controller input, large imports, rendering budgets and six new construction regressions.
- Navigation scene harness: continuous doorway traversal, wall blocking, turning and camera state.
- Real Three.js/GLTFLoader scene harness: model loading, floor residency, artwork, complete exterior and resource disposal.
- Actual application flow harness against both shipped packages and **three freshly recompiled exports**: entrance, Hall stairs, elevator destinations, encounters, keepsakes, Floor 13, 13 memories, map reward, saved completion and return to street.
- Fresh architectural GLB raycasts prove a floor below, a wall beside, a ceiling above and an unobstructed door aperture. Loaded materials retain texture maps; embedded images have PNG headers.
- All three shipped blueprint fixtures recompile in memory and pass Game archive/playability validation. No sample or published archive is changed.

The new tests found and fixed furniture-blocked portrait interaction anchors in Moonveil's upper rooms.

**Verification limit:** No WebGL browser is installed in the execution environment; its browser download failed. The scene harnesses use real Three.js graphs and GLTF parsing with a simulated renderer/image decoder. They establish data/scene/game-flow integration, not screenshot quality or real PNG decoding/GPU rendering. The new preview has not been visually certified. Browser performance and final artistic appearance still need rendered playtesting.

## Remaining work

- Complex intersecting roof unions, lower-wing roof treatment under partial upper stories, dormers, towers and porch assemblies.
- Per-room finish themes and authored texture/material selection beyond the initial Victorian palette.
- Arbitrary Blueprint stair physics and shaft/landing safety. Existing elevator bypass behavior is preserved; authored stairs are not newly certified as walkable. The shared Hall's tested physical stairs still work.
- Furniture rotation/support for currently unsupported authored records, mesh-level collision and roof watertightness certification across compound footprints.
- Real-browser verification of preview interactions, appearance, texture decoding and GPU/memory budgets.
- Existing houses require deliberate recompilation and a separate publication action to receive the new architecture. This branch does not silently migrate them.

## Review and try

Check out this branch, run `npm ci --ignore-scripts`, `npm test`, then serve the repository over HTTP (for example `python -m http.server 8000`). Open `casa_admin.html`, expand Forge, build a blueprint and use Open 3D inspection. The compiled CASA is staged in Administrator step 2; inspect, download and playtest before any publication. Pages currently deploys main only.

# Pass 2 — production architecture and real rendering

This section supersedes the Pass 1 browser limitation above. Development continues on the same branch; published house archives and main remain unchanged.

## Added

- Roof generation now visits every story. Uncovered lower wings receive roofs, and partially covered wings receive roof caps around upper-story footprints. Convex roof boundary clipping removes buried faces where gable/hip/mansard volumes intersect. A regression checks a closed overlapping-volume union against its exact surface area.
- Authored `roofType: "tower"` adds an octagonal exterior roof lantern and conical cap. `dormers: 1..4` (or `roof.dormers`) adds gabled dormer ornaments to suitable gable roofs. These are exterior details, not new walkable rooms.
- The main exterior entrance receives a covered porch when jamb clearance permits. The posts have exported collision bounds, and the central entrance lane remains clear. Tight entries omit the porch with an advisory rather than blocking the door.
- Libraries, laboratories, bedrooms, ballrooms, crypts and conservatories use distinct wall/floor/panel/ceiling palettes. Four additional procedural tiles cover glazed ceramic, parquet, masonry and encaustic floors. Shared walls now have separate inward finish skins and panel offsets, so a neighboring room cannot overwrite its wallpaper or wainscot.
- Preview controls include eye-level room inspection, material names/roughness/texture diagnostics, undecoded-texture counts, draw calls and estimated texture memory, per-floor/roof visibility, and colored collision guides. Placement warnings include floating furniture/portraits, elevator alignment and stair bypass status.
- `qa/vertical_geometry.json` records measured elevator alignment, stair pair alignment, rise, headroom, tread count and straight-run feasibility. This is evidence, not a new physical stair certification.
- GLB vertices are welded by position/normal/UV, reducing a box from 36 to 24 vertices. Only referenced embedded texture tiles are included. Indoor floor streaming excludes cemetery meshes, correcting both an appearance defect and unnecessary indoor geometry.

## Verified

- `npm test`: 41 Node cases plus existing navigation, scene-loading and complete application-flow suites, against both shipped and freshly compiled fixtures.
- `npm run test:browser`: actual Chromium 153 with WebGL via software rendering. The browser uploads a multi-story, six-theme blueprint into the real compiler, downloads the CASA, inspects roofs/floors/rooms, toggles cutaway/collision/visibility controls, verifies PNG/WebP decoding, then loads that same CASA in the actual Game.
- Keyboard walking reaches the physical shared Hall stair landing at exactly 5.25 m. The real Game renders fresh lower and upper house floors. Existing full-quest tests continue to cover elevators, ghost encounters, Floor 13 and map rewards.
- Browser raycasts verify both sides of a library/laboratory shared wall at wallpaper and panel heights, confirming each room's own material is foremost.
- Browser runs report zero page/console errors and zero undecoded textures. Screenshots are inspected after generation. This verifies the exercised fixtures on a software renderer, not arbitrary blueprints, all devices or hardware GPU performance.

Run browser checks with `npx playwright-core install chromium` followed by `npm run test:browser`, or point `CHROMIUM_PATH` to an existing browser. Optional `CHROMIUM_ARGS` accepts a JSON argument array. Screenshots, the temporary CASA and a JSON report go to ignored `tests/artifacts/`. CI runs the browser suite and uploads its evidence separately from Pages publishing.

## Still unfinished

Arbitrary Blueprint stairs remain on the existing elevator bypass. Continuous traversal across streamed house floors, stair landings/railings and capsule/camera clearance still require implementation; this pass does not silently enable unsafe stair meshes. The tested Hall stairs are preserved. Roof clipping and ornaments still need broader coverage of unusual footprints, near-degenerate intersections, varying ceiling heights and large estates. Towers/dormers are exterior ornaments. New textures and porch detail are a first production palette, not historical reconstruction or exhaustive authored-style support. Hardware GPU/mobile performance is unverified. No old CASA receives new geometry until explicitly recompiled and published.

## Pass 2 diagnostic follow-up

The inspection preview now includes exterior porch-post collision bounds in street and assembly views. Portrait diagnostics additionally identify opening overlap and positions outside the room, and reject malformed position vectors. Regression coverage includes a portrait over an entrance, a valid solid-wall mount, an out-of-room mount and an invalid vector. This does not alter published packages or enable arbitrary authored stair traversal.

Rendered screenshot review also exposed long exterior walkway triangles leaking into the indoor cutaway. Indoor decoration filtering now requires every triangle vertex to fit the floor and horizontal bounds, rather than accepting its centroid alone. The browser regression checks the loaded indoor decoration bounding box; the corrected cutaway screenshot has no exterior spikes. Final validation: 42 Node cases, navigation/scene/full quest suites and Chromium WebGL fixture checks. Software rendering remains the browser verification limit.

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

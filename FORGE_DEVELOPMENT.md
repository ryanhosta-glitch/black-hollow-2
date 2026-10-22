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

# Pass 3 — supported straight stairs and continuous floor transitions

This pass supersedes the blanket authored-stair bypass limitation for the bounded contract below. Packages remain QA exports, with `physicsCertified: false`; supported geometry is not a claim that all Blueprint stairs are safe.

## Supported contract

Dedicated, aligned staircase rooms on consecutive floors, with matching `stairLink` when supplied and explicit `stairDirection: "z+"` on both rooms. Embedded, spiral, switchback and other directions retain elevator access. The pair must have identical bounds, no authored furnishings/decor requiring clearance review, at least 1.4 m width, 1.3 m landings at both ends, risers no taller than 0.19 m, treads at least 0.25 m and upper headroom of at least 2.1 m. The lower room's height must reach the actual upper floor elevation. Non-window portals must meet their corresponding lower/upper landing; a generated elevator opening on the flight also disables traversal. Adjacent-floor chains sharing different floor partners and locked Floor 13 destinations are not enabled.

The repaired source records the generated `forgeStair` contract; the untouched original remains in `source.haunt`. `navigation/access_plan.json` and `navigation/stairs.json` record enabled routes or explicit fallback reasons. All existing elevators remain available.

## Implementation

- Forge builds solid treads/risers, nosings, railings, a supported upper landing, an open lower ceiling and an upper-floor shaft opening. The upper room's ceiling remains intact. Exported GLB raycasts verify tread heights, shaft clearance, landing support and overhead enclosure.
- The Game consumes compiled surface heights and limits each move to one riser. The rail lane blocks side entry; floor-height checks prevent walking through a side portal midway up a flight. Room/floor handoffs preserve world position, heading and held movement keys.
- A nearby flight preloads both floors before climbing. The resident cache stays at two floors near the shaft, drops to one away from it, and reloads the neighbor on return. Shared signature scenes release cached house floors. Normal houses retain their one-floor behavior.
- Camera occlusion now uses actual house meshes. Midflight saves validate against the compiled supported surface; quest locks are checked on restoration and traversal. Generated decorations, haunting tableaux and quest slots are excluded from the active stair shaft.
- Preview displays static traversal status, fallback reasons, riser/tread/headroom measurements, green landing/route guides and cyan upper-landing headroom. Room inspection positions the camera on the appropriate landing. Guide resources are disposed on replacement.

## Validation and limits

Node cases cover 8/10/12-foot rises, misaligned pairs, insufficient run, unsafe headroom, blocked landings, unsupported embedded stairs, Floor 13 locks, malformed runtime contracts, surface ascent/descent, side entry, streamed resource eviction and fresh exported GLB geometry. Existing application-flow suites still exercise shipped packages and three fresh exports, elevators, ghosts, Floor 13, map rewards and street return.

The Chromium regression uploads the stair fixture through the actual compiler, inspects the preview and loads the downloaded CASA in the actual Game. It uses keyboard ascent/descent of the 3.048 m authored flight, checks frame-by-frame position and camera bounds, walks through the landing arch, checks neighboring-floor eviction/reload and restores a midflight save. Evidence goes to the ignored CI artifact directory. Rendering uses software WebGL; hardware/mobile performance and exhaustive authored layouts remain unverified. Other directions, embedded stairs, spiral/switchback stairs and more complex shared stair chains remain future work. No existing CASA or catalog is rewritten.

Final local validation for Pass 3: `npm test` passes 48 Node cases plus navigation, scene-loading and full-quest harnesses against shipped and freshly compiled packages. Browser checks exercise the existing Victorian fixture, physical Hall stairs, and the new authored-stair fixture. Browser harnesses explicitly wait for street startup before opening a house, preventing a test-only race with the initial scene transition.

# Mansion pipeline release

The three bundled samples have been explicitly rebuilt with Forge 4.3, preserving their mansion IDs, names and source blueprints. `npm run rebuild:houses` repeats that migration and refreshes catalog fingerprints; deployment still only catalogs existing CASA files. Stored CASA geometry never upgrades merely because Forge changes.

The House Office reports the compiler geometry version and package fingerprint. The Game identifies local/published copies, lists local overrides and lets users restore the published version or remove a local-only house. Local descriptor/bytes writes and removals are atomic; replacement invalidates decoded packages, including a preview already in flight. Published catalog/package fetches bypass stale HTTP cache, and fingerprint mismatches fail explicitly. The root legacy game links to the CASA game without deleting the legacy application. The initial mansion dialogue identifies the shared Grand Hall.

`tests/browser-pipeline.mjs` exercises the real embedded compiler, administrator handoff, preview, persistent browser-local import, keyboard entrance through the Hall doorway, publisher review/confirmation against an intercepted in-memory GitHub API, local override removal, and a clean browser context loading the identical published bytes with decoded textures. The publisher portion is a mock, not evidence of live GitHub publication. Screenshots and JSON evidence are saved alongside the other browser suites. CI runs Forge, stairs and pipeline independently; one failure cannot prevent the other suites from running. Failure reports retain browser errors, dialog and movement state. Hall traversal allows 60 seconds for software renderers while retaining the full measured-height assertion.

Browser testing also found an upload-startup race: an iframe's file input could be used before its module installed the change listener. Forge now enables upload only after initialization. All packages remain QA exports; unsupported stair configurations keep explicit elevator fallbacks. These changes do not claim support for arbitrary rotated furniture, authored decoration, spiral stairs or every device.

GitHub runner validation passed the Forge and complete publication-pipeline browser suites and all core/quest tests. The authored-stair suite reached the penultimate riser with both floors resident and no browser errors, then exhausted its 45-second allowance. That points to slow software rendering rather than proving a blocked flight. Stair ascent/descent now allow 120 seconds, doorway travel 60 seconds; the same exact height, continuous movement, camera clearance, resource eviction and save-restoration assertions remain. Failure artifacts now include the last timestamped movement samples and resident floors, so a persistent obstruction can be distinguished from low frame throughput.

# Wraith skeletal motion

The recovered wraith skin now uses its 65-joint rig. A posed resting stance lowers the T-pose arms and bends the elbows and knees. Additive quaternion motion independently drives pelvis, spine, head, shoulders, elbows, wrists, fingers, thighs, calves and feet. Motions use game time, so dialogs pause them with the game; reduced motion keeps the posed silhouette still. No new binary model or external animation dependency is needed. Marker disposal restores the authored pose and releases animation references.

CPU scene checks verify joint motion, actual skinned vertex deformation, relaxed arm height, finite transforms, exact authored-pose restoration and reduced motion. The actual House Office browser pipeline waits for the recovered rig and verifies changing head, elbow, wrist and calf quaternions in the running Game. Chromium 153 software WebGL passes with zero page errors; screenshots and the pipeline report record the result. This is a first procedural spectral idle/reach, not a claim of authored cinematic animation clips or cloth simulation.

Release verification: rerun all three browser suites against the current PR head before merging; a green result from an earlier commit does not certify a later one.

## Reactive estate gameplay

The Game opts into an estate layout over the CASA's validated interior anchors. The Founder uses a wall portrait in the Grand Hall; the Seer uses a framed outdoor stand when usable grounds exist. One-room houses put the doll inside, spellbook in the Hall and crystal ball outside. Multi-room collectible rooms vary deterministically by mystery seed. Explicit authored anchors remain authoritative. No new interior positions are guessed; candidates come from the compiled playability report. Forge also selects spaced route points for new non-authored interior anchors. Existing packages gain the runtime changes without recompilation.

Automatic encounters use persisted discovery keys, one pending performance, a quiet interval, same-scene/height checks and interior visibility rays. Moving away or changing scenes cancels the performance. Ghosts approach in a bounded local arc; portraits shake/backlight before dialogue. Character dialogue uses dismissible subtitles over the live scene, leaving walking enabled. The Founder and Seer remain visible between quest stages. Reduced motion uses a short static introduction. Puzzle answers and revisits stay explicit; closing an unanswered puzzle leaves it available. Saves retain completed evidence and Floor 13 gating.

Large newly compiled rooms can receive up to seven safely placed furnishings instead of the old fixed three, still respecting reserved routes and existing placement checks.

Runtime dressing adds frames to supplemental portraits and wall-mounted books/candles, without adding floor obstacles. Wall spiders have eight two-segment legs and reveal evidence scraps; rats expose clue hints on approach. Owls watch from outdoor perches. One indoor bat has a brief periodic flight contained in a room. Ambient ghosts follow supplied route waypoints and stop to attend to nearby visitors. Wildlife clues are supplementary and never gate completion.

Speech still uses device-provided browser voices, now with per-character selection and slower delivery over the existing whisper sound bed. This is not recorded voice acting or processed/reverberated speech. Voice quality remains device-dependent. Recorded dialogue is a separate asset pass.

Validation adds estate-layout/save tests, encounter scheduling/visibility tests, wall-spider anatomy, owl and indoor bat scene tests, and a Chromium reactions suite exercising automatic ghost → Hall Founder → outdoor Seer progression. Screenshots are test evidence, not art assets.

## Furnished rooms and the Hall organ

Forge now assigns room identities, places proportional furniture around reserved routes, and packages wall ornamentation and a small environmental story for each room. Bedrooms, libraries, laboratories, dining rooms, conservatories, crypts, galleries and circulation spaces use different content. Tiny rooms use wall displays instead of obstructing the floor. Tall generated furniture avoids window approaches. Existing authored placements retain priority.

`qa/room_completeness.json` and the visible compiler/preview report show actual and target furniture, ornamentation, reachable optional discoveries, reactions and unresolved gaps. These are static preparation checks, not rendered, physics or gameplay certification. Missing space or budget remains visible as a review item. New furniture requires recompiling the HAUNT into CASA; older packages receive runtime ornamentation and room discoveries without silently rewriting their archive.

The Main Hall contains a pipe organ and an articulated wraith organist. Approaching triggers a turn, a flight around the Hall, and departure through the upper elevator; the doors open for that exit. Departure is remembered in the investigation save. Reduced motion uses a fade. Both keyboard manuals respond to the frequency spectrum of the actual playing music and settle when it stops. This is audio-reactive synchronization, not a note-perfect MIDI transcription. No unrelated animation clock pretends to represent the music.

Validation: `npm test` includes 64 core tests and actual-app quest regressions against shipped and freshly compiled packages. `tests/browser-rooms.mjs` renders eight room identities and a tiny room and checks the real Forge report. `tests/browser-organ.mjs` checks the loaded wraith, actual music analysis, departure persistence and continuing keys. Screenshots are collected under `tests/artifacts/` by the browser suites.

## Halloween street mode and furnished sample migration

The three published CASA sample houses are explicitly rebuilt with the current Forge, preserving house IDs, source blueprints and authored entry points. Their catalog fingerprints now match the furnished archives. An explicit same-house fingerprint ledger lets existing published investigations resume; local imports are not remapped. Pages only catalogs these prepared archives, never compiles on deployment.

Choose **Trick or Treat** on the landing page or **Game modes** during play. Each round lasts 600 active seconds; pause, menus and hidden tabs stop its clock. Every visit independently rolls a 10% trick chance. Treats add one candy; tricks remove two, bounded at zero. Tricks continue the round. Step more than 2.7 m away from a doorstep before revisiting, so standing still cannot farm candy. The round ends with candy, visit, trick and best-streak totals, plus replay or Investigation choices. The mode blocks mansion entry and does not write investigation progress.

The Halloween street has jack-o'-lanterns at every mailbox, a double-sided HAPPY HALLOWEEN banner, colored pennants, a wraith answering each front door, a carried candy bucket, flying candy and bounded ghost trick-or-treater routes. The existing voice toggle controls “Trick or treat!” speech; device speech voices remain platform-dependent. Reduced motion keeps candy movement restrained. Outcomes resolve on the same elapsed timeline as the candy animation.

The Hall organ now has open silver pipes with speaking mouths and gilded lips, Gothic towers, tracery, inlay, stops, candles and an engraved score. Its articulated 65-joint wraith plays with limbs and fingers, then leaves using the existing one-time encounter. Other quest apparitions remain faceless cloth. Browser validation now requires the loaded articulated organist and audible-track spectrum.

Validation adds four deterministic Halloween tests, actual-app mode/clock/entry/replay checks, and a real WebGL Halloween browser suite. Pipeline ZIP fixtures include the new optional room-completeness report. `npm test` runs 68 core cases and complete quests against both published samples and fresh Forge exports.

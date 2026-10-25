# Forge Pass 4 — cinematic Victorian lighting

Continues Heirloom Furniture commit `bfb29a281f7f0c6dbbb52b9e82a4a92a7a6583b3` on `dev/forge-shared-components-pass1`. No deployment or publication is included. Original mansion archives remain untouched.

[Open the before-and-after lighting study](evidence/forge-lighting/index.html). It uses the same eleven-room, two-story source mansion and cameras for Pass 3 and Pass 4. Both cinematic and performance presets include eleven eye-level room views, a chandelier ceiling, a subdued library corner, a desk-lamp view, a window-facing conservatory and a fireplace. The study loads actual CASA GLBs and uses the Game's atmosphere, light selection, calibration and material finishing. It has no inspection lights masking the results.

## One lighting system

`lighting_profiles.mjs` defines immutable room treatments and device policy. `room_lighting.mjs` generates the shared fixture geometry through existing room component sessions and their atomic geometry/memory budgets. The pure low-poly shape writer now lives in the shared Game foundation and is re-exported through its existing Forge path, preserving existing imports without copying models. The existing decoration planner adds real window, stained-glass, portrait and hearth contributions. The existing `lighting/static_plan.json` carries these records; the Game selects a bounded composition through `house_lighting.mjs` and reuses its practical-light rig. Forge's haunted preview uses the same selection and treatment policy.

Fixture geometry and light sources are separate. Eight chandelier candles are baked into material batches, not eight Three lights. Emitters have restrained glTF emissive factors, and crystal/glass uses the existing transparent materials. Old duplicate generic ceiling records and the previous chandelier/sconce generators were replaced; there is one key source per room. Low ceilings, stairs, disabled components and budget omissions receive a source-only fallback rather than an unbudgeted generic fixture.

The primary slot is now a broad downward spotlight with a soft edge. It preserves ceiling plaster detail that the earlier omnidirectional point could wash out. The other two slots are point lights selected for useful accents. Room-specific hemisphere ground colors approximate warm wood/plaster bounce or cool stone fill, keeping ceiling details readable without allocating another light. No bloom, screen-space reflections, volumetric shafts or additional per-candle lighting passes were added.

## Shared fixture and contribution inventory

| Component | Use |
| --- | --- |
| Crystal chandelier | Eight arms, candle cups, emissive candles and faceted hanging prisms for the ballroom |
| Brass chandelier | Shared radial assembly in dining rooms, parlors and restrained private-room variants |
| Bronze chandelier | Oxidized bronze material and formal gallery treatment |
| Candle wall sconce | Mounted brass backplate, turned cup and warm emitter |
| Gaslight fixture | Hanging glass globes or bronze/glass wall lanterns |
| Botanical lantern | Open iron cage with a restrained green-warm source |
| Laboratory task lamp | Turned brass stem, green shade and warm localized source; also reused for library desks |
| Stone/iron votive | Stone wall plate and iron enclosure, with a cool crown above the crypt |
| Fireplace contribution | Existing authored mantel/fire anchors supply a warm local accent; flame geometry stays in the existing atmosphere |
| Stained-glass contribution | Warm filtered wash attached to an existing compiled leaded window |
| Window moonlight | Cool source inset from an actual window, with room-specific intensity |

The `ceiling-chandelier`, `artisan-fixtures` and new `task-lamp` registry components own geometry. Atomic component rollback also removes their light metadata and wall reservations when generation fails. Existing architectural/furniture generators remain authoritative.

## Room treatments

| Profile | Composition |
| --- | --- |
| Ballroom | Warm crystal chandelier, elegant lower-room highlights and readable plaster detail |
| Library | Subdued gaslight, darker corners, warm desk light when nearby, optional hearth |
| Parlor | Warm brass chandelier/sconces, fireplace accent and soft cached shadows |
| Bedchamber | Subdued gaslight and restrained private warmth |
| Dining room | Chandelier centered above the main dining ensemble rather than the room's geometric center |
| Nursery | Gentle warm key, soft ambient floor and darker corners |
| Laboratory | Cold overhead light with a warmer focused task lamp |
| Conservatory | Iron botanical lantern and prioritized filtered window/moon contribution |
| Crypt | Dim iron/stone votives and cool stone illumination |
| Gallery | Bronze chandelier plus portrait-oriented local illumination |
| Passage | Restrained lanterns and a downward key to keep the route readable |

Only selected contributions become live lights. Near a desk, task illumination takes priority; near a fireplace, the hearth can replace a wall practical. Galleries prioritize portraits, conservatories prioritize windows, and a nearby stained window can replace the ordinary moon contribution. A neighboring room cannot displace an active room's local sources. Stable room/source identifiers and geometry-based placement keep results deterministic.

## Quality, accessibility and compatibility

| Budget | Cinematic | Performance |
| --- | ---: | ---: |
| Active practical lights | At most 3: one spot and two points | At most 2: one spot and one point |
| Shadow maps | At most one cached 512×512 spotlight map | None |
| Ambient visibility floor | At least 0.55 | Same floor with modest fill boost |
| Flame meshes per hearth | 4 | 2 |

The three resident light objects are reused. Unused performance slots are hidden from shader light counts; quality downgrades and atmosphere disposal release shadow textures. Shadows update when the light/room changes, not every stationary frame. A point shadow previously required six views in a 2048×1024 atlas at the same 512 face resolution; the new spotlight uses one 512×512 view. The map pixel allocation drops by eight times, before considering implementation-dependent depth buffers.

Startup automatically chooses performance for software rendering, viewports below 700 pixels, reported memory at or below 4 GB, or at most four logical CPUs. Otherwise it uses cinematic. Existing resolution caps remain. Tests explicitly exercise both quality levels; this pass does not add a player-facing quality picker.

Exported practical source intensities do not flicker. Existing scare/weather effects retain their own controls. Existing transitions fade lights before moving their positions; the ambient floor remains during handover. Reduced motion now freezes flame emissive variation as well as flame scale. Reduced-motion exterior storms retain their existing suppression.

No CASA manifest schema/version or loading contract changed. New `house-light-2` photometric records are already calibrated candela and are not amplified again. Legacy `house-light-1` and earlier light records retain their calibration path. The lighting plan adds an edition, explicit quality limits and fixture/source separation metadata. Palette entries 0–36 remain unchanged; entries 37–39 append warm emitter, cool emitter and aged bronze materials. Standard glTF emissive factors require no new extension or remote asset.

Existing authored furniture, finishes, room geometry and openings are retained. Task lamps fit their supporting desks/benches, chandeliers terminate above 2.18 m walking headroom, and mounted fixtures use existing aperture/portrait exclusions. Dedicated and embedded stair spaces receive no hanging fixtures.

## Validation and measurements

The comparison renders were captured sequentially with a fixed 1200×800 buffer, 1.3 exposure, identical cameras and Chromium software WebGL. Performance disables shadows and the reflection environment in both editions; the previous implementation still uses three point slots. Startup in the actual Game can additionally reduce software-rendering resolution; the study holds resolution fixed to isolate the lighting comparison.

| Two-story study | Pass 3 | Pass 4 |
| --- | ---: | ---: |
| Compressed CASA bytes | 5,366,708 | 5,379,740 |
| Expanded export inventory bytes | 21,086,663 | 21,213,132 |
| Tracked component primitives | 2,954 | 2,441 |
| Tracked component triangles | 64,554 | 67,570 |
| Estimated tracked geometry bytes | 6,971,832 | 7,297,560 |
| Decoration GLB bytes | 8,894,916 | 8,948,216 |
| Decoration GLB triangles | 122,974 | 124,048 |
| Decoration GLB material draws | 23 | 26 |

The compressed package grows 0.24% (13,032 bytes). Expanded inventory grows 0.60%. Emitter/bronze material groups add three decoration draws. Shared batching lowers primitive-object counts while the modeled glass/metal profiles modestly increase triangles. All existing component geometry/memory limits remain in force; the study has no budget-exhaustion omissions.

| Preset, median across eleven room views | Pass 3 | Pass 4 |
| --- | ---: | ---: |
| cinematic: active light slots | 3.00 | 3.00 |
| cinematic: allocated shadow-map pixels | 2,097,152.00 | 262,144.00 |
| cinematic: warm frame upper median (ms) | 0.70 | 0.80 |
| cinematic: room-change first frame median (ms) | 3.30 | 4.10 |
| performance: active light slots | 3.00 | 2.00 |
| performance: allocated shadow-map pixels | 0.00 | 0.00 |
| performance: warm frame upper median (ms) | 0.50 | 0.60 |
| performance: room-change first frame median (ms) | 1.20 | 1.90 |

Each view records six warm render submissions followed by `gl.finish`; the per-view reported median is the upper median of those six samples. These sub-millisecond submission timings are not a hardware FPS benchmark. The small observed increases (about 0.1 ms in room medians) do not establish a meaningful slowdown or speedup. The reduced light/shadow budgets are directly verified; no frame-rate improvement is claimed for a particular Mac.

Pass 3's first cinematic view measured 58.1 ms shader warm-up plus 315.6 ms initial rendering. Pass 4's first cinematic view measured 143.8 ms shader warm-up plus 288.1 ms initial rendering. First-use costs are noisy and distinct from cached stationary frames. Shader warm-up increased in this run; initial shadow rendering decreased. Raw per-view timings, shader/texture counts and selected source IDs are retained in the JSON reports.

| Identity | Cinematic draws / triangles | Performance draws / triangles | After floor-region luma, cinematic / performance |
| --- | ---: | ---: | ---: |
| ballroom | 57 / 98,478 | 57 / 98,478 | 61.6 / 56.0 |
| parlor | 73 / 100,132 | 69 / 100,084 | 60.8 / 49.6 |
| library | 61 / 98,896 | 59 / 98,872 | 45.6 / 34.0 |
| dining | 80 / 108,142 | 80 / 108,142 | 111.2 / 107.9 |
| gallery | 75 / 108,128 | 75 / 108,128 | 59.3 / 52.9 |
| conservatory | 66 / 104,096 | 66 / 104,096 | 112.4 / 96.4 |
| bedroom | 46 / 56,114 | 46 / 56,114 | 37.9 / 31.7 |
| nursery | 40 / 53,292 | 40 / 53,292 | 38.4 / 32.3 |
| crypt | 31 / 46,966 | 31 / 46,966 | 44.1 / 33.5 |
| laboratory | 73 / 62,764 | 73 / 62,764 | 121.4 / 109.2 |
| circulation | 53 / 58,586 | 53 / 58,586 | 46.5 / 37.1 |

The visibility check samples the bottom 20% and central 60% of the framebuffer in room views. Its mean 8-bit screen luma must remain between 12 and 235; all after views passed. This is a readable-navigation-region diagnostic, not a physical lux measurement or a claim that every dark corner is illuminated. All detail and room captures also pass a bright-pixel fraction limit; texture decoding and browser errors are checked separately.

In the chandelier ceiling close-up, pixels above luma 248 fall from 4.825% to 0.010%. The ceiling molding remains visible rather than being washed out by an upward key.

### Regression evidence

- **302/302 core tests passed**, zero failures or skips, followed by passing navigation, real Three/GLTF loading, and actual Game-flow harnesses against shipped fixtures and three freshly recompiled houses. Fixture preparation ran only in `/tmp/forge-lighting-validation`.
- **43 focused lighting/foundation/runtime tests passed**, including eleven new lighting tests. They cover all room profiles, deterministic generation, one key source, material validity, low-ceiling vertex/headroom bounds, wall aperture/portrait exclusions, task support, dining alignment, source priorities, legacy calibration, device presets, shadow disposal, fixed-slot reuse, steady reduced-motion fire, and the complete two-story archive.
- The existing Forge WebGL browser regression passed compilation/download, PNG/WebP decoding, haunted/inspection preview, cutaway controls, material raycasts, actual Game loading, physical Hall stairs and both floors.
- The existing actual-Game reference browser regression passed Hall, bedchamber, library, dining, cabinet, seating, bronze lantern, facade and grounds views with bounded draws and no shader errors.
- The lighting study produced **64 captures**, covering all eleven identities and five detail views in two presets for both editions. There were zero browser errors or undecoded room textures.
- All **23 original CASA files remain byte-for-byte unchanged**. A read-only Pass 3/Pass 4 comparison also verifies unchanged furniture, artwork, collision rectangles and reserved navigation areas for their source blueprints.

The actual-Game browser check found a mounting regression in 9-foot rooms: a fixed-height wall fixture exceeded the existing ceiling margin and was omitted. The corrected mounting calculation includes half the fixture height and a safety margin; shorter rooms scale the fixture vertically while retaining headroom. Explicit 8.6-, 9- and 12-foot cases now pass. Dedicated/embedded/named stairs and elevator landings receive no hanging fixtures. The tall comparison mansion is byte-identical before/after this low-ceiling correction, so its comparison evidence remains valid.

[Full regression log](evidence/forge-lighting/full-regression.txt), [focused checks](evidence/forge-lighting/focused-regression.txt), [Forge browser results](evidence/forge-lighting/forge-browser.json), [Game browser results](evidence/forge-lighting/game-reference-browser.json), [component inventory](evidence/forge-lighting/component-inventory.json) and [authored-placement compatibility](evidence/forge-lighting/placement-compatibility.json) accompany the rendered images and raw metrics.

Reproduce focused checks with `npm run test:forge-lighting`; render both presets with `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser:lighting`. Baseline capture uses an immutable Pass 3 snapshot via `FORGE_LIGHTING_ROOT` and `FORGE_LIGHTING_EDITION=before`. Run captures sequentially when comparing timings. Full `npm test` prepares/rebuilds fixtures, so use a disposable checkout when preserving original archives. The existing CI browser matrix includes the lighting suite; deployment workflows are unchanged.

## Assessment and limits

Room function now determines lighting composition rather than applying the same fixture and light mix everywhere. Visible emitters, crystal/glass/bronze variants, dining alignment, portrait accents and task pools add useful detail. A restrained ambient floor preserves navigation through the deliberately subdued private and funerary rooms.

This is an efficient stylized approximation, not global illumination. Point accents have limited ranges but do not all cast shadows; some light leakage through partitions can remain. Stained glass provides a colored local wash, not refracted caustics or a physically projected pane pattern. Static shadow caching does not promise continuously moving shadows from every haunting actor. Existing special scenes and scare/weather effects keep their own controls.

Runtime presets reduce live lighting, shadows, flames and, in the actual software-rendered Game, resolution; they do not replace baked fixture meshes with runtime LODs. Existing export detail/component controls still govern static geometry. Real Mac/browser hardware frame rates remain unmeasured. The published timing samples describe this software-WebGL harness only, including the observed first-use shader cost.

Existing archives continue loading without migration, and retain legacy intensity calibration. The updated primary light is directional even for older packages, so compatibility does not mean pixel-identical legacy lighting. Recompiling a blueprint is required to obtain the new fixture geometry, emissive materials and room-specific photometric records; no student archive was automatically rewritten.

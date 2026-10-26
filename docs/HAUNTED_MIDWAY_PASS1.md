# The Haunted Midway — Pass 1: architecture and route generation

Historical Pass 1 snapshot. [Pass 2](HAUNTED_MIDWAY_PASS2.md) now adds the playable carriage and haunted-elevator runtime; static archive QA flags remain separate from runtime capability.

**Implemented milestone: the route-generation foundation. The playable Midway mode is not enabled.** This is a coherent first pass of the requested five-pass mission, not a completed theme-park release. Vehicles, seated cameras, boarding controls, the theatrical director and park transformation remain subsequent implementation work. No placeholder mode button was added.

Branch: `dev/haunted-midway`, based on the reviewed Forge development head `90bb4ff6726689b1d7fbed3e9e990e965e77fe51`. The final commit is provided in the delivery message. Existing Forge hardware/visual acceptance requirements remain open; this pass does not authorize merging or deployment.

## Repository investigation

| System | Existing implementation and reuse |
| --- | --- |
| Experiences | `casa_game/main.mjs` uses `playMode='story'` for the house mysteries/Explore experience and `'halloween'` for Trick or Treat. Landing cards, mode selection, timers and mode switching live in `casa_game.html` and `main.mjs`. These remain unchanged. |
| Blueprint → Forge | The House Office embeds `casa_admin/compiler.html`. `.haunt`/JSON is repaired as a derived blueprint, normalized, themed and furnished; original `source.haunt` remains separately archived. The compiler packages world-space GLBs, navigation, colliders, access plans, materials and QA. |
| Game loading | `import_package.mjs` accepts `.casa`, not raw blueprints. `archive.mjs` validates ZIP paths, CRC/SHA inventory and required navigation/asset contracts. `catalog.mjs` loads published `street.json`, local IndexedDB overrides and a bounded opened-house cache. No backend is needed. |
| Architecture/interiors | Existing envelope/finish generators, shared components, eleven room profiles, furniture catalogs and decoration colliders remain authoritative. Ride generation does not rebuild a mansion or move furniture. |
| Movement and access | `forge_playability.mjs` provides room grids, component reachability, doorway approaches and collider checks. The Navigation 2 viewer handles walking and hinged leaves. `stairs.mjs` consumes validated straight flights; the Game has an explicit pocket-elevator contract and Game-owned Floor 13. |
| Camera | The existing walker owns cinematic/explorer/first-person views. A seated ride controller must be added as an explicit owner and return control on unload; it is not installed in this pass. |
| Audio/haunting | `audio.mjs` already bounds score voices, pauses/cancels audio and exposes cues/scares. `haunted_interiors.mjs`, `room_theatre.mjs`, `scare_theatre.mjs`, encounter gates and haunting sessions own effects, reactions and quest/save state. The later ride director should reuse these hooks without creating new required objectives. |
| Performance | Floor streaming, asset disposal, exterior preview residency, shared geometry and two lighting quality tiers are already available. This pass introduces no Game animation loop, light or audio source. |
| Tests/deployment | `npm test` prepares sample houses, then runs core and navigation/scene/gameplay suites. Browser suites cover the Office→Forge→Game pipeline and existing experiences. CI runs core and 31 browser suites on PRs. Pages deploys on `main` pushes/manual dispatch and rebuilds the reference sample. No workflow was modified or invoked. |

## Working implementation

`casa_admin/forge_midway.mjs` builds a graph from actual normalized rooms, matched shared apertures and public elevator stops. It reuses the existing Forge clearance grid instead of introducing a competing walking renderer. A stable traversal visits the accessible graph and returns along proven edges to the boarding station.

Two explicit vehicle envelopes are evaluated: a carriage capsule with 0.34-m radius/1.85-m height and a narrower spectral capsule with 0.24-m radius/1.75-m height. Both reserve a **0.15-m wall inset** for architectural projections. The candidate covering more rooms wins; equal coverage prefers the normal carriage. These are geometric contracts for the next vehicle pass, not rendered vehicle models.

The existing clearance world now supports optional wall padding and continuous conservative collider sweeps. Default walking settings retain their previous behavior. Ride checks use rectangles expanded by the vehicle radius, which conservatively reject corner grazes and cannot skip a thin obstacle between sampled positions. Aperture crossings additionally verify real opposite wall faces, matching centers, actual generated opening dimensions, headroom and furniture clearance. Locked/secret openings are excluded. Regular hinged doors carry an explicit **hold-open-before-motion** requirement for the future runtime; a static graph does not certify a moving door leaf.

Room paths receive small quadratic corner rounds only when their sampled chord segments pass clearance checks. Unsafe rounding retains the original corner and records its `stopPointIndices` for a controlled stop before turning. The future controller must follow this checked geometry; applying an unchecked Catmull–Rom curve would invalidate the proof.

Dead ends receive a 0.66-m-radius turnaround loop only when its whole swept path fits. Otherwise the plan records a stationary `controlled-reverse` pause, followed by reverse traversal of checked paths. No floor is cut to install a physical turntable. The route always returns to its original safe station for unloading.

Multi-story traversal uses actual public stops from the existing pocket-elevator contract. Transfer legs require full occlusion and explicitly prohibit interpolating a vehicle between their endpoints. They are **not a track through a floor or an unimplemented physical stair lift**. Physical stair flights are inventoried but excluded as ride tracks; the existing elevator is the documented alternative. Secret/locked floors and Game-owned Floor 13 are not unlocked by this planner.

An independent validator replays every leg, checks continuity, clearance, movement policy, allowed transfers, station/exit agreement and reported coverage. It rejects forged profiles, unknown legs, discontinuities and malformed geometry. Static validation is always distinguished from runtime and triangle-mesh certification.

### Data contracts

New Forge exports append:

- Optional manifest field `midwayPlan: "midway/plan.json"`.
- `midway/plan.json`: versioned profile, graph, station/exit, checked legs, optional room scene anchors, deterministic attraction identity and diagnostics.
- `qa/midway.json`: route status, coverage, validation and omissions.

These are **additive archive-schema extensions**; CASA spec remains `1.0` and manifest version remains `1.0-qa`. Existing loaders ignore the optional field. No original archive is rewritten. New compilations naturally receive a new inventory fingerprint, as with any recompile.

The status distinguishes `STATIC_ROUTE_VALIDATED`, `STATIC_CONTAINED_VALIDATED` and `UNAVAILABLE`. Every output keeps `runtimeReady:false`, `physicsCertified:false` and `renderedRideVerified:false`. A successful compiler report therefore does not enable an attraction or claim a playable ride. Unsafe or unsupported houses receive diagnostics without blocking normal house gameplay solely because Midway conversion failed.

`casa_game/midway_contract.mjs` reserves the experience ID and provides a lazy, bounded optional-plan reader. It returns detached static candidates, never driver authorization. Legacy archives return no embedded candidate. Existing Game startup does not import or execute it.

`casa_admin/forge_midway_archive.mjs` supports legacy conversion from the **compiled navigation and actual floor elevations**, rather than trusting an embedded blueprint to match the rendered package. Missing geometry or incompatible elevations fail closed. The standalone sidecar tool binds each plan to the original archive fingerprint and writes derived JSON separately. It does not recompile, overwrite or publish the archive.

### Budgets and deterministic identity

Limits remain explicit: 512 input rooms, 64 visited rooms, 1,800 legs, 24,000 checked points, 1,600 m of physical route, existing 180,000-cell/18,000-per-room grid limits and a 2-MiB candidate-reader ceiling. Large/unreachable areas are reported; an over-budget traversal can fall back to a validated contained station experience. There is no unrestricted path expansion or runtime route-search loop.

Attraction metadata uses a stable house-ID seed and actual covered room identities. It includes a title, preserved student house name, description, palette, provisional intensity/duration, signature room and finale identifier. Scene anchors are optional metadata, not implemented effects or new quest goals. The theatrical catalog and final attraction presentation still need Pass 3/4.

## Validation evidence

- **11 focused route tests pass:** real apertures, wall/window/locked-door rejection, dead ends, safe reversing, loops, furniture and thin-collider avoidance, continuous clearance, multi-floor occluded transfers, locked-floor protection, deterministic output, malformed input, budget enforcement, archive integration and detached candidate reads.
- **345 core tests pass**, with zero failures/skips, plus the complete existing navigation/scene/gameplay flow sequence. This includes fresh Forge exports, all endings, quest/encounter progression, Floor 13 and saves. Full tests ran in a disposable copy because their fixture preparation rewrites samples.
- **Three legacy performance tests pass.** [Log](evidence/midway-pass1/legacy-performance.log).
- Actual Chromium/WebGL browser regressions pass for **Office→Forge→Game**, **Trick or Treat/mode switching**, and **straight stairs/navigation**. The pipeline test now verifies that the browser compiler emits a valid Midway static plan while the normal Game still loads the result and renders its textures/ghosts. Publisher API calls in that test are mocked; no real publication occurred.
- A sweep of **23 original CASA archives covers 443/443 authored room records** in independently replayed static plans: 19 normal carriage profiles and four spectral profiles. Across those plans: 60 turnaround loops, 170 controlled-reverse pauses and 110 explicit transfer legs. This excludes Game-owned special rooms and does not certify runtime ride motion.
- [Original integrity proof](evidence/midway-pass1/original-integrity.json) confirms all 25 protected original files, including 23 archives and the street catalog, retain their SHA-256 hashes. The tool also checks archive bytes before/after and verifies that planning leaves normalized navigation/access/decoration unchanged.

Evidence: [focused tests](evidence/midway-pass1/route-tests.log), [full regressions](evidence/midway-pass1/full-regression.log), [published-archive sweep](evidence/midway-pass1/published-routes.json), [browser pipeline](evidence/midway-pass1/pipeline-report.json), [stairs](evidence/midway-pass1/stairs-report.json), [Halloween](evidence/midway-pass1/halloween-browser.json).

The [Office preview](evidence/midway-pass1/pipeline-office-preview.png) and [normal Game interior](evidence/midway-pass1/pipeline-local-interior.png) are actual browser captures. They prove existing pipeline rendering, **not a playable Midway ride**. The [floor 0](evidence/midway-pass1/floor-0.svg) and [floor 1](evidence/midway-pass1/floor-1.svg) diagrams plot actual generated route/collider data for the synthetic two-story eleven-identity fixture; they are analytical overlays, not ride screenshots.

## Cost and practical limitations

The eleven-room showcase archive grows from **5,872,987 to 5,879,224 bytes** (+6,237 bytes, about 0.11%). Its uncompressed route JSON is 68,390 bytes. SHA-256 comparison confirms **every GLB model remains byte-identical**. No new rendered triangles, draw groups, textures, lights, animation loops or audio voices are added to the existing Game. No ride FPS claim can be made before the ride runtime exists.

Separate pretty-printed sidecars for all 23 archives total about 3.59 MB; the largest is 475,550 bytes. The largest plan checks 3,750 points, well below the cap. One local sweep measured roughly 19–1,179 ms per archive for generation plus independent replay, under concurrent validation workload. This is a coarse compiler CPU observation, not a repeatable browser/device benchmark.

Provisional full-coverage duration estimates range from 87 to **1,453 seconds**. The largest houses would produce impractically long rides without curation. A later director should offer a shorter signature tour or tune pacing, while preserving an optional full-house route. Current graph traversal deliberately favors coverage and safety over show pacing.

Declared collider/room contracts cannot prove exact clearance against arbitrary unsupported mesh content. Hinged-leaf control, vehicle mesh bounds, seated camera occlusion, visibility, loading transitions, comfort and actual floor-change presentation all require runtime/browser validation in the next pass. Physical rides on stair treads are not implemented. Irregular authored layouts are supported through the Forge's normalized room/portal representation; arbitrary unsupported polygons or mismatched archive elevation contracts are not silently guessed.

## Reproduce without touching production

```sh
npm run test:midway
npm run midway:sidecars -- --out /tmp/new-midway-plans \
  casa_game/houses/*.casa casa_game/samples/moonveil.casa
```

Use a new output directory; sidecar writes use exclusive creation to prevent accidental replacement. Do not copy these files into the published street or rewrite input archives. Run `npm test` and browser suites in a disposable copy, with `CHROMIUM_PATH` pointing to the installed Chromium when needed.

## Concrete continuation

**Pass 2 — vehicle/camera and a playable vertical slice:** add a bounded carriage controller consuming these typed legs. Honor corner stops and reverse drive. Open and verify ordinary door leaves before movement; preserve locks. Use an actually occluded, awaited elevator/floor-streaming handover. Build the carriage and all its animated poses within the declared capsule, provide boarding/pause/abort/unloading and a seated reduced-motion-safe camera. Integrate a genuine third mode into the existing selector only once its street→house→ride→exit browser test works. Reuse the global tick and dispose all owned resources on mode changes. Keep Midway progression separate from existing quest/save namespaces.

**Pass 3 — directed scenes:** bind optional room anchors to a small working catalog using existing scare/audio/room-theatre hooks. Add timed stops, reveals, focused look targets and a real finale; restore temporary prop transforms on cleanup. Extend the catalog gradually rather than claiming 100 unimplemented effects.

**Pass 4 — park presentation:** use the existing street lots, entrance transforms and two-preview residency. Batch marquees/lanterns/queues, bound visible attendants and use emissive materials instead of per-candle point lights. Bind identity by house ID/fingerprint so new published houses participate through the same adapter without manual programming.

**Pass 5 — ride certification:** test real carriage sweeps/door leaves, floor handovers, malformed packages, cancel/reentry/mode switching and all existing experiences. Capture seated eye-level rides and measure actual target-device frame pacing/memory. The earlier Chrome/Mac acceptance gap remains open.

No merge, deployment, real publisher call, original student edit or production archive regeneration is part of this milestone.

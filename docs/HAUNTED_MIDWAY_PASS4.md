# Haunted Midway — Pass 4: the neighborhood becomes a park

This pass continues `dev/haunted-midway` from `c079517` with a functioning street-level park and attraction guide. The existing station, ghost boarding/unloading, room performances, validated routes and haunted elevators remain the ride system. The third option stays **The Haunted Midway · Beta**. No production deployment or main merge is part of this work.

## The guest experience

Selecting Midway now adds a broad Gothic entrance, illuminated-looking branding, a Victorian ticket booth with a ghost clerk, attraction marquees and small spectral queues to the original neighborhood. The park retains its four streets, student buildings, authored entrances, gardens and existing village activities. Plum-colored fog and the existing musical-saw track provide a consistent mood through the existing atmosphere and audio managers. Decorative lanterns and signs use emissive/basic materials; they do not allocate lights.

The entrance is a real overhead structure with collision-safe supports, rather than a gate that blocks the road. Its opening leaves the road and pavements free. The ticket clerk opens the working attraction guide; tickets are complimentary and never become an inventory item, payment requirement or quest objective. The ghost queues are decorative. Living guests still board at each mansion's original porch, where the existing spectral platform handles dispatch. A completed ride returns through the existing unloading choreography to a checked neighborhood position.

Pooled marquees show the checked attraction identity, mansion name, student architect, house number, route status, intensity and a provisional duration. The guide also shows the atmospheric description, accessible/excluded room counts and the street address. Marking a mansion adds its address and approximate distance to the HUD without teleporting the player or inventing a route through buildings. The guide paginates seven attractions per page and remains scrollable on a narrow phone viewport.

## Honest availability and automatic participation

Every catalog house is a potential attraction without mansion-specific programming. Existing catalog refresh/import behavior supplies new entries. The presentation registry bounds and sanitizes metadata, rejects malformed/duplicate entries for presentation, and leaves the original descriptors untouched. It does not rewrite the published catalog.

Statuses distinguish **unchecked**, **checking**, **ready** and **unavailable**. Inspections run automatically near aligned, loaded entrances or explicitly from a guide card. Only one park inspection runs at a time, with at most four more queued. Requests for the same house coalesce. The existing worker derives and validates the actual route; a static archive flag, a marquee or a cached profile never authorizes carriage movement. Boarding still validates through the existing runtime preparation path.

Successful profiles are cached only for the session, keyed by house identifier and fingerprint, with a 128-entry cap. A changed fingerprint does not inherit an old ready label. The cache contains compact presentation metadata, not models or full route graphs. Failure cards explain the problem and offer a working retry. Inspector progress has a visible modal, and completion does not steal focus from another guide card or a different mode.

Malformed previews are marked unavailable and are no longer retried on every street refresh in Midway. An explicit retry or a new visit can check them again. A preview failure also cancels a pending inspection and cannot be overwritten by a late success. This avoids a repeated network/parse/toast loop around broken catalog entries.

`prepareMidwayRide` now supports subscriber cancellation. Cancelling the last pending subscriber terminates the worker and permits a later retry. Cancelling a park subscriber does not cancel a concurrent boarding subscriber. On mode changes, the park aborts inspections, removes its owned scenery and camera proxies, disposes geometry/materials/textures, and releases canvas backing stores. No second rendering or audio loop is created.

## Components, placement and budgets

- `midway_park_state.mjs`: catalog registry, bounded inspection queue, compact profile cache, availability and error state.
- `midway_park_layout.mjs`: checked verge footprints, doorway distance, queue-space fallback and blocker queries.
- `midway_park.mjs`: entrance, booth, pooled signs, shared texture atlases, capped ghost guests, spatial refresh and disposal.
- `midway_prepare.mjs`: the existing worker preparation system, extended with safe shared cancellation.
- `main.mjs` and `audio.mjs`: mode-specific integration with navigation, existing guide/modal controls, HUD, previews, music and atmosphere.

The actors reuse the Midway wrapper around **Trick or Treat's continuous fabric ghost**. Cloth geometry stays static; normal motion adds a tiny root bob. Reduced motion freezes the waiting cast. The ticket clerk is a separate, fixed member of the bounded cast. Ghost loading/unloading continues to use the already implemented station sequence.

| Budget | Performance | Cinematic dressing |
| --- | ---: | ---: |
| Pooled marquees | 4 | 8 |
| Visible decorative queue patches | 2 | 4 |
| Pooled guest ghosts | 3 | 5 |
| Fixed ticket clerk | At most 1 | At most 1 |
| Texture storage, RGBA without mipmaps | 3 MiB | 5 MiB |
| Unique geometry/index/instance array bytes | 53,484 | 80,508 |
| New dynamic lights / reflection passes / render loops | 0 / 0 / 0 | 0 / 0 / 0 |

The metadata registry caps at 512 entries. Signs are selected within 58 meters and refreshed at most about 3.3 times per second during ordinary movement; large position changes refresh immediately. Text atlases are redrawn only when bindings/status change, not every frame. Camera proxy geometry is reused until its footprint changes. Queue transforms use the same bounded spatial refresh. The three new park modules total **20,692 bytes** of source. [Component accounting](evidence/midway-pass4/component-costs.json).

Signs occupy the verge outside the existing pavement, safely ahead of the compiled mansion preview frontage. Placement checks sample footprints against existing blockers and keep away from porch approaches. Raised panels clear the neighborhood picket fences; queue patches avoid the planted borders. The park contributes its own blockers and camera proxies to the existing navigation system. It does not remove original fences, move student openings or cut new paths through houses.

If a sign cannot fit, the physical marquee is omitted while its guide entry remains. If a queue cannot fit, the sign can remain without a queue. Occupied entrance verges use an overhead banner without supports; the booth is omitted if no checked position fits. Reports expose clearance omissions, distance/budget culling, visible counts, atlas writes and inspection counts. These are conservative checks against the existing street/navigation contract, not certification of arbitrary unsupported custom mesh intersections.

## Verification and evidence

**365 core tests passed**, with zero failures/skips, plus all existing navigation, scene and gameplay flows, including quests, ghost encounters, endings, Floor 13 and saves. Full test preparation ran in a disposable checkout because it regenerates sample archives. [Full regression log](evidence/midway-pass4/full-regression.log).

**31 focused Midway tests passed**. Seven new park tests cover invalid/duplicate/large/empty registries, serial and coalesced inspections, queue limits, fingerprint changes, failures/retries, cancellation and late results, four street rotations, protected walking/door approaches, quality caps, distance culling, reduced motion, stable geometry/textures, disposal and clearance fallbacks. An additional movement/preparation test covers shared-worker cancellation. [Focused log](evidence/midway-pass4/focused-tests.log).

The new **actual Game/WebGL park browser test** verifies the gate, ticket interaction, serial real-worker inspections, student credit, duration labels, pagination, malformed-house closure and retry UI, prevention of automatic failed-preview retry loops, HUD wayfinding, clear porch access, boarding/unloading, safe return, stable attraction identity, mobile guide layout and removal when switching to Trick or Treat and Haunted Houses. It then renders the supported Cinematic dressing tier and verifies its larger but bounded pools. [Park browser report](evidence/midway-pass4/browser-park.json).

The browser uses Chromium 154 / SwiftShader. Screenshots are actual WebGL renders from controlled eye-level views, using the existing first-person option for street inspection. Ride travel is accelerated by the test harness; this is disclosed and is not an FPS measurement. Cinematic dressing is requested in software rendering while hardware shadows remain disabled. The test includes deliberately malformed mansion fixtures; any error notice visible in its screenshots belongs to those negative cases.

Nine existing browser suites passed again: Midway ride, Midway scenes, release entry, Trick or Treat, runtime cleanup, pipeline, scares, atmosphere and Phoenix gameplay. Together with the new park suite, **ten browser suites passed**. Results are recorded in [browser results](evidence/midway-pass4/browser-regressions.json). The park suite is added to the existing browser runner and GitHub regression matrix, which now contains 34 suites. The full 34-suite hosted matrix has not been claimed as a completed local run.

All **25 protected original files** retain their SHA-256 values, including the original student CASA archives, reference sample and street catalog. [Integrity proof](evidence/midway-pass4/original-integrity.json). No archive schema, compiled mansion asset, student blueprint or original publication was changed. The production Pages workflow is unchanged.

## Visual and rendering assessment

- [Gothic entrance](evidence/midway-pass4/gothic-entrance.webp) and [same view with park hidden](evidence/midway-pass4/same-view-park-disabled.webp)
- [Ticket clerk](evidence/midway-pass4/ticket-clerk.webp)
- [Student attraction marquee and ghost queue](evidence/midway-pass4/student-attraction-marquee.webp)
- [Unavailable attraction guide](evidence/midway-pass4/closed-attraction-guide.webp)
- [Park-to-station handoff](evidence/midway-pass4/park-to-boarding-station.webp) and [unloading](evidence/midway-pass4/unloading-return.webp)
- [Phone-width guide](evidence/midway-pass4/mobile-attraction-guide.webp)
- [Cinematic dressing](evidence/midway-pass4/cinematic-dressing-tier.webp)

In the same paused entrance view, the park renders **205 calls / 109,140 triangles**, versus **184 calls / 105,348 triangles** with its owned layer hidden: **21 additional draw calls and 3,792 rendered triangles**. The richer dressing snapshot measures **208 calls / 110,404 triangles**. Other complete-scene views depend heavily on the original neighborhood geometry; the phone guide's background view reached **359 calls / 184,690 triangles**. The boarding station remains **27 calls / 5,826 triangles**, and unloading **24 calls / 4,706 triangles**. These snapshots are not native-device FPS benchmarks. Double-sided transparent ghosts can incur more rendered triangles than the unique geometry inventory suggests.

Texture estimates exclude driver overhead and canvas CPU backing stores, which can add comparable memory. Buffer accounting excludes JavaScript objects and existing street/mansion assets. No new external model or texture download is introduced. Mansion archive-size change: **zero bytes**.

## Beta readiness and next steps

This is ready for an **isolated Beta playtest**, not a production launch certification. Remaining limitations include native Mac/phone FPS, thermal and sustained memory testing; comfort testing of long rides; and review of additional published mansions from the seated camera. The previous scene coverage limit remains: 207 of 466 original-corpus scene stops had a clear physical stage, with narration retained elsewhere. This pass does not relax those checks or imply new apparition coverage.

The street still renders its existing baseline village/garden systems. Bounded Midway scenery does not solve every pre-existing neighborhood rendering cost. A larger authored character/art collection and deeper audio direction remain future improvements. Requests beyond the 512-entry presentation cap are reported; this pass does not redesign the core town for an unlimited catalog. Empty registries and occupied-layout fallbacks are unit-checked, while the full park browser walkthrough uses a mixed eight-entry catalog.

The isolated preview builder automatically includes the new modules and continues to copy original archives byte-for-byte. A refreshed standalone package is part of the handoff, and the development-branch workflow can produce a downloadable artifact. Neither an artifact nor a pushed branch is a hosted preview URL. Do not invoke the production Pages workflow to obtain a preview.

Next priorities are an independent preview host, real Mac/phone acceptance, hosted regression results, and a pacing pass that offers shorter directed visits while preserving the existing full routes. No merge, deployment or student republication is authorized by this report.

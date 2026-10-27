# Haunted Midway — Pass 3: theatrical scenes and spectral station

This pass adds a working room-scene director and theme park loading/unloading to the playable carriage ride. The third mode remains **The Haunted Midway · Beta**. It continues the previously pushed `626a2d2` preview foundation. No production deployment, main merge, archive rebuild, or student publication is part of this pass.

## A proper dispatch and return

Every converted house now has a separate spectral boarding platform. This is a Game-owned pocket space, like the existing haunted elevator cabin, rather than a new structure inserted into a student's rooms. It contains a named attraction marquee, platform, brass queue rails, loading gate, lantern fittings, a uniformed ghost usher, and three waiting ghost guests. The cloth characters reuse **Trick or Treat's `createFabricGhost`**, with a small friendly eye mask added by a Midway wrapper. Trick or Treat's original characters and crowd logic remain unchanged.

A second, clearly separate dispatch carriage lets a ghost visibly board while the living rider's seat remains available. Clicking Board starts a slow loading sequence, closes the gate, and fades to the seated mansion view before validated movement begins. The seated ride camera is never interpolated through the station wall or through student geometry. On completion, a fully occluded return reveals the unloading platform; a ghost leaves the neighboring carriage through a separate aisle clear of the waiting queue and rider carriage, the gate opens, and only then does the normal Step off action become available. The return-to-Midway button remains available for early exits. A loading pause freezes both the dispatch clock and the guest choreography.

The station uses one existing light-pool composition. Its decorative lanterns do not allocate lights. Reduced motion removes waiting-guest bobbing; the slow essential boarding/unloading transfer remains. There is no camera shake or roll. These are atmospheric spectral guests, not imported high-detail rigged character models.

## Reusable scene direction

`midway_scenes.mjs` contains pure catalog, staging, and timing logic. Eleven room identities have curated anticipation, reveal and resolution scripts. Matching compiled furnishings identify supported objects and influence stable variant selection; compiled story titles are recorded alongside those bindings. Selection uses the attraction seed, actual mansion identifier, room identifier and room identity. It never edits the source room or claims that a generated theatrical copy is an authored interactive object.

| Identity | Reusable visual motif | Existing reaction hook |
| --- | --- | --- |
| Library | Floating books with covers/pages, spectral librarian | Draft |
| Ballroom | Orbiting dance cards and a turning formal guest | Clock |
| Bedchamber | Ribbon constellation and returning guest | Draft |
| Laboratory | Rising bottles with necks and experimental apparition | Glow |
| Conservatory | Pale botanical leaves and gardener | Draft |
| Crypt | Memorial wreaths and procession keeper | Glow |
| Gallery | Framed spectral rings and absent sitter | Portrait |
| Dining room | Suspended place-setting rings and host | Reflection |
| Nursery | Wooden keepsake forms and gentle keeper | Clock |
| Parlor | Visiting letters and uninvited guest | Draft |
| Passage | Restrained lanterns and lost usher | Draft |

These are eleven shared performances with deterministic script variants, not 100 implemented unique effects or separate fully animated furniture models. A new catalog entry can reuse the same bounded renderer. The signature room receives its labeled signature performance; the finale has a lantern arrangement, bow, release message and physical return to the unloading station. Neither creates a required objective, encounter binding or save entry.

The director uses the existing ride clock, not timers or another animation loop. It processes one active performance at a time, fires each phase once, and cancels at transfers, completion, effect disablement and disposal. The renderer recycles one ghost and material/mesh pools. Performance uses four prop elements; Cinematic permits six. Existing haunting/theatre hooks and the existing audio manager supply reactions and a spatially panned whisper. New cancellation methods reset those temporary reactions; `audio.effect` now optionally returns a cancellation function while preserving existing callers. It does not stop the music bus or create a second audio manager.

The player's drag look takes priority. An optional automatic look bias is limited to 0.3 radians, moves at at most 0.3 radians/second, and is suppressed after manual look, when effects are off, and with reduced motion. Existing light intensities can dip gently by at most ten percent during a performance; reduced motion retains the base intensities. No flashing, blackout, dynamic reflection, shadow-pass addition or extra scene light is used.

## Safety and omissions

A physical performance requires a finite, visible patch in the actual room, clear of the declared colliders and within its ceiling/bounds. The patch has a 0.43-meter radius, with additional clearance padding, and a 1.9-meter height limit. Sightlines are checked against declared furniture colliders. Stair rooms and low rooms decline staging. Authored `atmosphere.effects:false` also wins. Automated vertex-level checks cover all visible performer/prop geometry at multiple phases, including the six-prop quality level.

Performers appear only during the existing validated stationary scene stops and disappear before carriage motion resumes. The checked track, door openings, floor transitions and authored furniture remain unchanged. Props are intentionally supernatural suspended copies; the system does not pretend that they rest on nonexistent supporting tables or animate student furnishings as new required interactions.

A read-only audit of **23 original CASA archives / 443 rooms** found **466 scene stops**, including finales. **207 physical stages** pass the current conservative placement checks; **259 are omitted** because no clear visible patch was found. Physical signature and room-finale stages are available in **14 of 23** source houses. Other stops retain narration and the existing room appearance; the universal platform still provides a visual unloading payoff. This is a significant coverage limitation, not certification that every room now has a visible new apparition. [Per-house omissions](evidence/midway-pass3/archive-scenes.json).

The geometric checks use normalized bounds and declared colliders, not arbitrary exported triangle meshes. They do not establish safety for unsupported custom geometry. Refining camera stops or using existing wall-mounted effects in tight rooms is a useful next expansion; collision rules must not be relaxed to inflate coverage.

## Verification

- **357 core tests passed**, zero failures/skips, plus all existing navigation, scene and gameplay flows, including quest endings, ghost encounters, Floor 13, save behavior and fresh-Forge loading. The full run used a disposable checkout because test preparation regenerates sample houses. [Full log](evidence/midway-pass3/full-regression.log).
- **23 focused Midway tests passed**: existing route/vehicle cases plus seven new scene/station cases covering deterministic eleven-room selection, authored preservation, constrained/malformed room omission, collider/sightline clearance, phase ordering/cancellation, pool disposal, reduced motion, guest loading/unloading and actual mesh bounds. [Focused log](evidence/midway-pass3/focused-tests.log).
- The production Game browser ride test passes with the new station, seated movement, elevator floor/wing handoffs, pause, guide, mobile look, safe exit, unchanged quest save and existing mode restoration. [Ride report](evidence/midway-pass3/browser-ride.json).
- A new actual-WebGL browser suite builds a six-identity, two-story mansion, uses the real selector/porch/worker/runtime, captures each visible reveal and finale, tests paused loading, cue cancellation, ghost boarding/unloading and early loading exit. [Scene report](evidence/midway-pass3/browser-scenes.json).
- Six existing browser regressions passed again: release entry, Trick or Treat, runtime cleanup, pipeline, scares and atmosphere. Results are recorded individually in [browser results](evidence/midway-pass3/browser-regressions.json). The new suite is registered alongside the other 32 browser suites. Pushes to `dev/haunted-midway` now request the full regression workflow as well as the separate artifact-only preview build. Local evidence does not claim the entire 33-suite browser matrix was run.
- **All 25 protected original files remain byte-identical**, including the original CASA archives and street catalog. [SHA-256 verification](evidence/midway-pass3/original-integrity.json). No archive schema or package-content change was required.

Browser evidence uses Chromium 154 with software SwiftShader. Both browser ride harnesses advance the actual runtime clock to avoid waiting for full-length rides. These are real browser-rendered images, not mockups, but accelerated traversal is not an FPS or comfort measurement. The six-room scene test uses normal motion; the original ride suite and unit cases also cover reduced motion. Performance-tier WebGL is verified; Cinematic's six-prop geometry is unit-checked, not target-hardware certified.

## Evidence and measured cost

- [Queue and usher](evidence/midway-pass3/ghost-queue.webp)
- [Ghost boarding](evidence/midway-pass3/ghost-boarding.webp)
- [Library performance](evidence/midway-pass3/scene-library.webp) and [same view with cues disabled](evidence/midway-pass3/scene-library-disabled.webp)
- [Ballroom](evidence/midway-pass3/scene-ballroom.webp), [bedchamber](evidence/midway-pass3/scene-bedroom.webp), [laboratory](evidence/midway-pass3/scene-laboratory.webp), [conservatory](evidence/midway-pass3/scene-conservatory.webp), [crypt](evidence/midway-pass3/scene-crypt.webp)
- [Finale](evidence/midway-pass3/finale.webp), [ghost stepping out](evidence/midway-pass3/ghost-disembarking.webp), and [unloading gate open](evidence/midway-pass3/ghost-unloading.webp)

The inspected six-room snapshots show **41–70 draw calls and 29,966–53,136 triangles** for active room performances, including the mansion and existing haunting layer. The queue/boarding view measures **27 calls / 5,826 triangles**; the unloading view **24 calls / 4,706 triangles**. The separate original ride fixture still measures **9 calls / 510 triangles** in the lift cabin. These are different scenes and must not be presented as a before/after hardware benchmark. In the same paused library view, cues enabled measure **49 calls / 40,441 triangles**, versus **42 calls / 39,201 triangles** with cues disabled: **7 calls and 1,240 triangles** for that scene and its temporary reaction. This is a rendering-cost comparison, not a frame-rate measurement.

[Component accounting](evidence/midway-pass3/component-costs.json) measures approximately **59,580 bytes of station geometry buffers** and **23,064 bytes of theatre geometry buffers**, excluding instance matrices, JS objects, renderer overhead and existing assets. The station's one 1024×256 RGBA marquee texture has no mipmaps, approximately **1 MiB** before driver overhead. The theatre adds no textures. Four new source modules total approximately **19.6 KB** uncompressed. All pools are resident for one ride, while only the current performer/motif is drawn. New dynamic lights, reflection passes and render loops: **zero**. Original mansion archive size change: **zero bytes**.

Native Mac/mobile FPS, GPU memory, thermal behavior and a sustained hosted-play comfort assessment remain unmeasured. Existing large-route pacing limitations remain; the station adds about four seconds to loading and about four to unloading. The universal street still needs the fuller park entrance, attraction marquees, ticket booths and neighborhood presentation planned for Pass 4.

## Review handoff

Run `npm run test:midway` and, with a browser installed, `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser:midway-scenes`. Run archive-generating full tests only in a disposable copy. The isolated preview artifact builder includes the new modules automatically; it is not a hosted preview URL. Do not invoke the production Pages workflow to obtain a test preview.

This pass is a functioning addition to the Beta, not completion or merge certification of the whole Haunted Midway mission. Next priorities are coverage-safe room cues, fuller street-level theme park presentation, shorter directed routes and sustained target-device verification.

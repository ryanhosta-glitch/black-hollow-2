# Haunted Midway — Pass 2: carriage and haunted elevators

**A playable carriage vertical slice is implemented on `dev/haunted-midway`.** A player can select the third experience, approach a mansion porch, board, ride between public floors in a haunted elevator, return to the boarding station and unload onto a checked street position. This continues route foundation commit `be17cad3ff4367721c8ea23a166fc297ada1edc2`.

This is not the completed five-pass theme-park mission. A larger theatrical catalog, park entrance/marquees/queues, pacing refinement and final hardware certification remain later passes. Haunted stair travel is not enabled: a walking stair contract does not establish carriage clearance or a comfortable hovering trajectory.

## Implemented behavior

- The existing landing cards and in-game mode menu include **The Haunted Midway**. Existing house mysteries and Trick or Treat remain available.
- Any normal catalog mansion can be converted on demand. A disposable module worker derives and independently validates a plan from its compiled navigation, public access stops and declared colliders. It does not rebuild the mansion or execute its blueprint. The worker has a 20-second timeout, is terminated after success/failure, and failed requests can be retried. A weak cache avoids repeating conversion for an already opened package.
- A shared Victorian phantom carriage uses wood, brass, velvet, canopy struts and wheels. Its five material-batched meshes contain **408 triangles** before culling. Both normal and spectral variants are tested against their entire circular footprint at several yaw angles. Vehicle meshes stay upright; camera roll/banking is intentionally absent to protect clearance and comfort.
- The rider sees a seated camera inside the carriage. Turning is bounded, acceleration/deceleration is controlled, speed is adjustable, and drag look stays within a limited range. Reduced-motion preferences suppress existing environmental movement and the lift indicator animation. Touch look does not pan the page.
- The controller follows the checked polyline exactly. It does not refit an unchecked curve. Abrupt corners require a stop before changing heading; tight dead ends back out along the validated path. Scene anchors stop the carriage and request a few existing room-theatre/audio cues. They do not create quest objectives or advance the regular haunting session.
- Pause/resume, a short guide, scene-cue control, master sound control and return-to-Midway are available during a ride. Loading controls remain disabled until the initial carriage scene is ready. The carriage pauses when the window loses focus. Returning or aborting disposes owned geometry, textures, listeners and UI, then restores walking on a tested pavement/road point near that mansion.
- Existing quest sessions are not created, advanced or checkpointed during a ride. The ordinary story save namespaces remain untouched. Game-owned Floor 13 and locked/secret destinations remain excluded from the attraction route.

## The haunted elevator handover

Floor changes use the existing Game-owned pocket-elevator cabin model, with inexpensive brass framing, emissive fittings, a destination plaque and a gentle indicator. The fittings add no point lights or reflection passes. The plaque updates once per transfer rather than uploading a texture every frame.

1. Stop at the checked public lift anchor and fade to full occlusion.
2. Show the seated carriage inside the closed cabin; reveal the cabin view.
3. Release the old floor and load the destination through the existing floor streamer while the doors remain closed. The cabin holds for a minimum theatrical interval and waits longer if loading requires it.
4. Fade to full occlusion again. Only then align the carriage with its checked exit path and commit the route's new room/floor position atomically.
5. Reveal the destination floor and resume the checked route.

There is no interpolated trajectory through walls or floor slabs. At most one mansion floor is resident for this ride path, alongside the small reusable cabin and carriage. Pausing freezes movement and handover timing. Abort and failed-load handling leave the guest able to return to the Midway instead of continuing into an unavailable floor.

Regular walker's door leaves are not activated in the ride view, keeping the normal checked apertures open. This pass does not animate hinge swings. Explicit locked/secret connections remain excluded by the planner. Arbitrary custom solid meshes outside the declared Forge navigation/collider contract are not certified by these analytical checks.

## Integration and ownership

`midway_motion.mjs` is a pure, bounded movement/state controller. `midway_prepare.mjs`/`midway_worker.mjs` perform off-thread planning. `midway_carriage.mjs` and `midway_lift.mjs` provide reusable presentation. `midway_ride.mjs` owns the seated view, controls and timed transfer scene.

`main.mjs` delegates the existing render tick while a ride is active. It releases walking/quest control and returns ownership after unload. There is **no second rendering loop**, new backend, new dependency or per-candle light allocation. The existing atmosphere light pool, audio manager, floor streamer, archive loader and haunting layer remain the integration points. HUD and keyboard/gamepad routing have explicit ride handling; old controls return on exit.

Archive `runtimeReady:false` remains a static-compiler QA fact. The code's runtime capability is now enabled separately after browser verification. The Game does not trust a sidecar flag to authorize movement: the worker regenerates/revalidates against the loaded package. No archive schema change or student-house recompile is required for this pass.

The main entry-script cache version is updated. Static file paths remain compatible with the existing Pages deployment layout. Only the regression workflow gains the new browser suite; the Pages deployment workflow is unchanged and was not invoked.

## Validation

- **350 core tests pass**, with zero failures/skips, plus all existing navigation/scene/gameplay flows, including fresh Forge archives, encounters, quest endings, Floor 13 and saves. [Full run](evidence/midway-pass2/full-regression.log).
- Five movement/vehicle/worker tests cover boarding, bounded movement, pause/suspension, atomic occluded transfers and arrival headings, unloading, full mesh footprint bounds, speed/time limits, worker termination/cache isolation and retry/timeout behavior. [Focused run](evidence/midway-pass2/motion-tests.log). Existing eleven route tests remain in core.
- The **actual Game browser test** selects Midway, approaches a real porch, boards, moves, pauses/resumes, opens the guide, toggles sound, enters the haunted cabin, preserves the haunting layer across a same-floor wing transfer, arrives on the upper floor, uses mobile layout/look, returns to the original station and unloads. It verifies a safe street exit, unchanged quest save, disposal and mode switching. A second boarding aborts during a transfer and verifies cleanup. [Report](evidence/midway-pass2/browser-ride.json), [log](evidence/midway-pass2/browser-ride.log).
- Four existing browser suites pass again: release entry, Office→Forge→Game pipeline, Trick or Treat and runtime/audio cleanup. [Results](evidence/midway-pass2/browser-regressions.json). These five fresh browser suites are not a claim that the full 32-suite matrix was rerun locally in this pass; the new suite is registered in that matrix for review CI.
- All **25 protected originals, including 23 CASA archives and the street catalog**, retain their prior SHA-256 values. [Integrity proof](evidence/midway-pass2/original-integrity.json). Full tests ran in a disposable copy because test preparation regenerates sample houses.

The browser ride uses the actual production renderer and runtime, with an accelerated test clock for long waits/travel. Its pictures are real WebGL output, not generated mockups. That acceleration is disclosed in the report and is not an FPS measurement. Tests run on software SwiftShader Chromium, not the user's Mac.

## Visual evidence and cost

Actual seated views: [carriage](evidence/midway-pass2/seated-carriage.webp), [haunted elevator](evidence/midway-pass2/haunted-elevator.webp), [upper floor](evidence/midway-pass2/upper-floor.webp), [same-floor wing](evidence/midway-pass2/same-floor-wing.webp), [mobile view](evidence/midway-pass2/mobile-carriage.webp), [returned station](evidence/midway-pass2/station-return.webp).

Measured snapshot costs in the synthetic two-floor test range from **9 to 42 draw calls** and **510 to 24,144 rendered triangles**, including the visible mansion/haunting geometry. They are scene-dependent, not a maximum for all published houses. The lift plaque uses a 512×128 RGBA texture without generated mipmaps, approximately 256 KiB before driver overhead. Its materials and emissive lamps use the existing light pool; no true reflection render is added.

No new mansion GLB is generated or modified. The ride reuses the prepared package. The previous 23-house/443-room sweep is static route evidence; only the representative two-floor ride has received this complete seated browser walkthrough. Exact GPU memory, native Mac FPS, thermal behavior and broad device comfort remain unmeasured. The [Mac acceptance procedure](FORGE_MAC_ACCEPTANCE.md) still applies; record Midway gameplay separately from Explore because their camera views differ.

## Remaining work

- Inspect adjacent-floor sightlines around open stairwells; the current elevator ride streams one mansion floor at a time.
- Validate hovering stair transitions against actual flight/headroom/vehicle geometry before offering a stair alternative. Current multi-floor rides use haunted elevators.
- Pass 3: expand the few reused room cues into a reusable theatrical catalog, directed look targets, better signature scenes and a visual finale. Current finale is a returned-station narrative/audio payoff.
- Pass 4: add park entrance, attraction marquees, queues, ticket booths and bounded attendants. The street currently retains its existing appearance and uses attraction boarding prompts.
- Refine very long full-house routes into paced shorter shows. The largest source plans can still represent long visits, and extra stop/turn time increases those estimates.
- Run the complete hosted browser matrix, additional published-house seated walkthroughs, loading-failure scenarios and actual device performance/comfort testing before integration approval.

Serve the checkout over HTTP, open `casa_game.html`, choose **The Haunted Midway**, approach a porch and board. `npm run test:midway` and `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser:midway` reproduce the focused automated checks. No merge, deployment or student publication was performed.

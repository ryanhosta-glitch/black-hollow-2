# Light behavior and console integrity

Baseline: merged main 4bdc1725d374233fadac51ddbc4ded2f7a0a6cee.
This isolated workspace preserves the original workspace's unfinished work.

Passes: profile-aware output and rendering; independent effect audition;
property-preserving edits; intensity, entry fades, copying and ordered chases;
group selection, picking and light spill; deterministic and visual verification.

Playback remains a nontracking section model: no silent carryover after a cue.
Entry fades blend from a contiguous predecessor's final snapshot, or darkness.
This is not complete theatrical tracking or multiple-playback HTP/LTP arbitration.
Hardware remains disabled. Spill and undocumented shutter rates are illustrative.

## Implemented

- Profile-aware master and fixture blackout preserve shutter and unpatched values;
  intensity is applied once to a master dimmer, or to emitter channels without one.
- Diagnostic test lights now produce actual channel bytes before master processing.
- Pixel cores no longer receive the 2.8× brightness boost. Programming view uses
  an untonemapped linear-light pipeline with sRGB display conversion; Nightflight
  retains cinematic tone mapping. Neither is a manufacturer photometric model.
- Ambient scenery dimming preserves material reflectance, so washes remain useful.
- Dynamic direct-light pool (up to twelve wash lights) and bounded projected surface
  spill. Surface projections and undocumented shutter pulse rates are illustrative.
- Entire selected groups are outlined; route arrows show per-strand travel. Wider
  picking follows strands and rejects hits hidden behind architecture.
- Independent, musical-time effect audition runs while audio is stopped, without
  changing saved cue timing. Reopening a project clears transient audition state.
- Color edits preserve motion. Self-colored effects explicitly switch to Glow when
  the student chooses a single color. Brightness, snapshot entry fades, scoped look
  copies, physical-route ordering, manual reorder, and reversal are available.
- Console Record/Update stores exact profile bytes without fabricated math. Manual
  values remain until Release or GO. GO explicitly releases and starts the timeline
  at the next cue; this is not a tracking/holding theatre cue stack.

## Saved files

Existing formats 1–3 remain readable. New entry fades, managed group routes and
console recordings require format 4. Older editors reject that version rather than
silently dropping playback semantics. Existing math evidence remains unchanged.
Pixel and phrase editors preserve the newer project version. New optional fields:
`fadeInTicks`, `simpleRoute`, `routeDirection`, and `authoredWith: console` recordings
with `name` and exact `channelValues`. No new package dependencies.

## Verification and limitations

Twelve local lighting test files pass. Local Chromium cannot launch under the
sandbox's socket restrictions. The GitHub student gate runs the actual preview at
both laptop sizes, plus a real WebGL/postprocessing color-and-intensity bench,
student edits/audition/copy/fade/routes/reopen, and professional Record/Update/GO.
Screenshots require review before release. No deployment is claimed by this file.

Remaining: full theatrical tracking, multiple playback HTP/LTP mixing, calibrated
photometry, moving-head beam/gobo modeling, and fresh uncoached student observation.
The optional classroom save server remains unhosted; the packaged launcher and
local-data ignore rule are included. Hardware remains disabled by default.

Starter placement now distributes roof outlines and front eaves across the actual facade, rather than taking the first compiler paths (which included a back eave and a tiny side fragment). Windows receive a similar front-facing spread. Existing fixtures and custom model placement are retained.

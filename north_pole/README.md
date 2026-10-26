# The Confectionery — Christmas Forge foundation

First working export milestone for North Pole. Existing Black Hollow entry points, published houses and save data are retained.

## Run

Install dependencies using `npm ci --ignore-scripts`, run `npm run test:gingerlight`, then `npm run build:gingerlight`.

Serve the repository and open `north_pole/forge.html`, or open the generated `north_pole/gingerlight_studio_standalone.html` directly. The source page uses the same Three.js CDN as Black Hollow. The standalone release embeds its code, renderer and assets and requires no network access. The Pages workflow builds and publishes both.

Load `.haunt`, `.casa`, or an exported `.ginger`. CASA import uses the repaired blueprint when present and retains its permanent property ID. Direct haunt identity uses the same pretty-JSON-plus-newline hash as the existing Forge. Importing a `.ginger` previews it; changing its baked treatment requires the original haunt/CASA.

## What this pass builds

Exposed, opening-aware cookie walls; existing roof construction; gingerbread porch geometry; dimensional royal icing, drips, swags and scrollwork; gable peppermint rosettes; roof-edge candies; wreaths, bows, candy posts and snowy topiary. Three palettes and three density levels. Interior floors, furnishings, elevators and quest data are excluded. Procedural cookie grain is generated locally by the viewer.

The `.ginger` JSON contains a self-contained GLB, meter-based attachment polylines, ground bounds, permanent identity, source and exterior hashes, and a checksum covering the complete package. Checksums detect accidental edits; they are not signatures proving authorship. Original source data is not overwritten.

Window/door outlines and exposed wall eaves have source-based feature IDs. Roof-union edge IDs depend on the compiled geometry order; all attachment coordinates are bound to the exact exterior hash. Rebuilding a house produces a new exterior version. Future light-show import must reject incompatible versions rather than guessing a remap.

## Limits

The teacher Forge prepares the exterior. The student sequencing milestone described below adds music, patching and cues; the sleigh game and full math assessment remain future work. Google Sites embedding and school hardware remain acceptance checks. Geometry follows the supplied room and roof layouts; the reference images are art-direction goals, not a claim of photographic fidelity. Free-form authored tower shapes and custom roof objects are limited by the existing Forge roof conventions. Very large or highly detailed houses may exceed the 32 MiB model export budget.

Permanent decorations stay against the building; roof/window paths can be overlaid in pink. The yard provides a visual stage, but future equipment placement still needs clearance checks. No animation or preset choreography substitutes for students' future lighting work.

## Verification

`tests/ginger-forge.test.mjs` covers source preservation, shared-wall exclusion, finite geometry, stable attachments, package roundtrip, identity parity, corruption rejection and opt-in palette behavior. `tests/browser-gingerlight.mjs` tests the generated standalone file with HTTP/HTTPS traffic blocked, including style changes, download and reopen. Run the browser test after installing Chromium with the repository's Playwright dependency.

## Student sequencing milestone

Open `student.html` when serving source, or distribute the generated **`gingerlight_student_standalone.html`**. The build now produces both teacher Forge and student editor HTML files. The student file includes three exact MIDI-derived song packages and their MP3 previews: approved Silent Night (latest clear-melody edition), Nutcracker March draft, and Saratoga Shores Christmas draft. Silent Night's original approved MIDI/audio bytes are retained; its ending tempo changes are mapped exactly. The other arrangements are labeled drafts until teacher review. Additional teacher `.song.json` packages can be loaded locally and are included in the next project download.

Students load `.ginger`, choose an attachment path, place a fixture, and manually assign universe/start address. Active modes: logical RGB pixels (3 channels per independent node), SlimPAR Pro Q IP 4CH/5CH, COLORband PiX ILS 12CH/four zones, and DMX-4 1CH. `fixture_library.json` retains the broader researched definitions and manufacturer references; advanced modes without complete control decoders are not offered in the editor. These are simulation profiles, not a hardware certification. Dimmer-pack props have fixed warm-white color. Pixel controller color order must match the documented logical RGB mapping.

Partial/incompatible overlaps are rejected. Exact same mode/footprint/universe/start is intentional mirroring. Playback writes universe/channel bytes first and both physical representations read the same bytes. Conflicting active cue writes are reported; latest start wins, with project order resolving equal starts. The universe namespace belongs to one house; combining real rigs requires a global patch. RGB runs must fit one universe; split a longer run into fixtures with explicit patches.

The timeline shows exact MIDI note activity, measures, beats and subdivisions. It supports 4/4, 3/4 and compound-duple 6/8, with tempo changes and boundary-aligned meter changes. In 6/8 a beat means one dotted quarter, divided into three eighth notes. Click-to-seek snaps to selected subdivisions; playback and scrubbing evaluate from the audio element's absolute current time. The audio decay continues after the last measure with cues dark, then looping restarts. Source music duration and audio-tail duration are intentionally distinct.

Cues support steady, fade-in and a single chase through independent nodes/zones. Students enter a fraction, identify a beat/measure whole, predict, calculate the duration in beats and the rounded 0–255 brightness, then explain before applying. The checker does not accept incorrect calculations. Saved cue evidence includes predictions, failed attempts and revisions; it does not grade the quality of reasoning. This is one math workflow, not complete coverage of the planned curriculum. Time is stored as integer MIDI ticks; the original fraction text is retained.

**Download project** produces a checksummed `.lightshow` containing the exact decorated house and hashes, embedded song/MIDI/audio/maps, fixture patches, cues and math evidence. Reopening validates project/song checksums, house package and attachment references before replacing the current show. Checksums detect accidental corruption, not authorship. No student names/accounts or server storage are required. The patch can also be downloaded separately. Keep the downloaded project each session; browser storage is not the save mechanism.

Current limits: 200 fixtures, 170 RGB nodes per fixture, 2,000 cues. Fixtures attach to supplied house paths; free yard props, spatial clearance, moving-head controls, full wash/projection rendering, teacher class collection and the musical sleigh-street runtime are later milestones. Bulbs currently use instanced emissive-color geometry, not physical light simulation. This pass does not merge or deploy the branch. Google Sites iframe download/audio permissions and actual school-device performance still need a school check.

Verification: `tests/ginger-sequencer.test.mjs` covers musical units, tempo/meter transitions, approved asset integrity, patch boundaries/mirroring, seek-independent playback, fades/chases/conflicts and project corruption. `tests/browser-gingerlight-student.mjs` blocks HTTP/HTTPS while exercising playback, failed/correct math, mirrors/overlaps, download, fresh-page reopen, corruption rejection and a narrow layout.

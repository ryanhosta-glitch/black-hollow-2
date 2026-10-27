# Haunted Midway — Pass 5: signature shows and an original ghost cast

Continues `dev/haunted-midway` from `8b7ccb1`. This is a working, procedural WebGL show pass inspired by the supplied reference photographs. The third mode remains **The Haunted Midway · Beta**. No merge, deployment, student archive rebuild or production-data update is included.

## Implemented experience

- **The Thirteenth Waltz:** two original Victorian guests face one another, gesture and turn together during a checked ballroom stop.
- **The Pianist Who Stayed:** Elias Quill plays a compact spectral grand piano, with 20 white and 12 black keys, a raised lid, bench, legs and a short generated musical phrase. Parlors and named music rooms can receive this show. An existing piano/organ furnishing suppresses this generated instrument.
- **The Unfinished Séance:** Mara Thorne presides over a pedestal table, candles and translucent orb containing a separate spirit face. Available in galleries and crypts.
- **The Last Guest Takes a Bow:** a recognizable gentleman returns for the existing finale, then the original platform handles unloading.
- **The Portrait Answers:** when a floor stage cannot fit, a spirit face can appear briefly inside an existing compiled picture. No frame or artwork is replaced or added.

The reusable cast includes Elias Quill (maestro), Cora Nightingale (ballroom guest), Mara Thorne (veiled medium), Silas Bellweather (porter with luggage), and the Lantern Usher. Station guests, the usher, ticket clerk and bounded park crowd now use these original silhouettes. Ghost loading/unloading remains functional and uses the existing next-dispatch carriage, gates and accessible aisle. Trick or Treat's own characters and renderer remain unchanged.

These are modest procedural models, with simple faces and stylized clothing. They are not detailed scanned actors or replicas of the photographed attraction characters. Future art can replace the factory while retaining the current planner and choreography.

## Integration and safety

`midway_characters.mjs` supplies the reusable cast. `midway_signature_shows.mjs` owns one reusable pool with four resident characters and at most two visible characters. Only the selected show renders. Shared geometry and instanced static pieces reduce duplication; key and arm movement use the existing ride clock. There is no additional RAF, event scheduler, audio manager, light manager, quest or save format.

`midway_scenes.mjs` selects shows deterministically from the existing room identity and furniture metadata. The existing theatre dispatches the selected show; the existing director owns anticipation, reveal, resolution and cleanup. Music uses the Game's existing controlled audio bus, with scoped cancellation on pause, hidden-tab suspension, effects disable, exit and disposal. Resuming a paused scene resumes its visual clock without restarting the short musical phrase. Existing whisper panning remains; the generated musical notes are not a new spatial-audio system.

The planner checks each show's complete radial footprint against room boundaries, furniture colliders and rider sightlines. Large shows fall back to the original small performance when necessary. Portrait fallback additionally checks the existing picture's dimensions, wall normal, openings, viewing direction, height and collider sightline. Floor-stage and wall-stage checks are separate. All visible mesh vertices are tested against their declared envelope across representative animation poses. The farewell bow has floor clearance.

Authored or inherited atmosphere settings that disable effects still take priority. In particular, preserved room profiles can disable effects by default; selecting a parlor identity does not guarantee a pianist. Reduced motion holds actors, keys, orb and camera choreography still while preserving the show. Scene cues can be disabled immediately. Stairs, elevator transfers, route validation, discoveries, quest progression, Floor 13 and saves retain their existing systems.

No CASA schema or loading-contract changes. Generated performances exist only during Midway runtime and do not modify original blueprints, room identities, geometry, furnishings or published packages. The integrity report verifies all 25 protected files unchanged, including 23 CASA archives and catalog data.

## Existing-house audit

Read-only planning against all 23 original archives (443 rooms) produces 466 scene stops:

| Visible treatment | Stops |
| --- | ---: |
| Ballroom waltz | 2 |
| Pianist | 2 |
| Séance | 29 |
| Farewell bow | 14 |
| Existing-picture apparition | 31 |
| Original small performance | 160 |
| Narration only, no safe/enabled stage | 228 |

Total staged stops: **238**, compared with **207** before this pass. No house loses previously staged stops. The report records 104 rejected large-show upgrades; those retain a smaller, portrait or narration fallback. This audit validates planning, not visual certification of every original mansion. The conservative staging limits deliberately prevent large shows from appearing in many existing rooms.

## Rendering cost

The two new modules total 11,301 source bytes. No archive bytes are added. The resident show pool uses **125,142 bytes** of geometry and instance arrays, excluding renderer/material overhead. Automated limits cap it at 128 KiB, with at most 24 active mesh draws and 3,300 active triangles.

| Active show | Mesh draws | Triangles |
| --- | ---: | ---: |
| Waltz | 23 | 3,280 |
| Pianist | 18 | 2,301 |
| Séance | 20 | 2,536 |
| Farewell | 12 | 1,768 |
| Portrait | 3 | 284 |

New lights, textures, reflection passes and render loops: **zero**. The original small-show pool remains resident for fallback. Signature geometry does not accumulate per room or per stop.

The richer crowd costs more than the prior cloth guest: **11–12 draws and 1,476–1,876 triangles per character**, versus 2 draws and 640 triangles previously. Existing caps remain three station guests plus one usher, and three/five park guests plus one clerk by quality tier. This is a material draw-call increase despite the small geometry footprint. Further material/limb batching and distance-based crowd simplification are worthwhile before expanding the cast or crowd sizes.

Browser evidence uses Chromium with software WebGL. Accelerated ride-clock tests establish playable behavior and actual rendering, not real-device FPS. Native Mac, phone GPU performance, GPU texture memory and comparable hardware FPS are not measured here. Do not interpret software-renderer test durations as shipping frame rates.

## Verification and evidence

Results and actual player-eye screenshots are recorded in [the evidence directory](evidence/midway-pass5/). The original [ballroom screenshot](evidence/midway-pass3/scene-ballroom.webp) provides a prior-pass visual reference. The new browser fixture explicitly enables effects in its show rooms; it does not override disabled settings in existing student houses.

The full regression command ran in `/tmp/midway-signatures-regression` because `npm test` regenerates fixtures. Root student packages were neither rebuilt nor copied back. The final focused tests exercise subsequent cleanup changes and additional portrait/budget assertions.

Final browser results and source revision are recorded alongside the evidence. The new signature browser suite is registered in both the local browser runner and the 35-suite GitHub matrix. Only the locally recorded suites are claimed as run; remote CI status is not certified.

## Remaining limitations and next work

- Detailed skeletal animation, cloth simulation, moving piano lids and high-detail facial art are future work. Current choreography is deliberately simple and bounded.
- Portrait fallback has automated mounting, geometry and planner coverage; it is not certified visually across every existing picture asset.
- Large tableaux require free floor space. Many existing houses will retain smaller scenes or narration.
- The ride retains occluded supernatural elevator transfers; physical carriage travel over stair treads is not implemented.
- No new full-length soundtrack or recorded character dialogue. Generated notes accompany the existing music and sound systems.
- Before production promotion: review player-eye screenshots, test on an actual Mac and phone, assess crowd draw costs, and complete/inspect remote CI. Further cinematic polish should prioritize side-angle staging, character art and sound balance over adding more simultaneous effects.

Measured whole-frame WebGL counters in this run were 50 draws / 50,236 triangles for the pianist, 84 / 57,429 for the ballroom, and 59 / 51,380 for the gallery séance. These include the resident house and carriage, not just the show. The comparable boarding-platform capture increased from 27 draws / 5,826 triangles in Pass 3 to 53 / 7,510 with the new cast. The park entrance capture increased from 205 draws in Pass 4 to 231 in this run; camera/visibility variation prevents treating that as a precise isolated component benchmark.

Verified locally: full `npm test` (370 core tests plus navigation, scene and gameplay flows); final `test:midway` (37 tests, including two additional tests added after the full run); audio lifecycle suite (9 tests); actual WebGL signature-show, six-room scene, park, and ride/mode/save suites. The park suite exercises Performance and Cinematic decoration tiers and reduced-motion guests; software shadows remain disabled. Additional browser regression logs are retained with the evidence. No full 35-suite local browser-matrix run or remote CI result is claimed.

Player-eye evidence: [ballroom](evidence/midway-pass5/scene-ballroom.png), [pianist](evidence/midway-pass5/scene-parlor.png), [séance](evidence/midway-pass5/scene-gallery.png), [ghost queue](evidence/midway-pass5/ghost-queue.png), [boarding](evidence/midway-pass5/ghost-boarding.png), [disembarking](evidence/midway-pass5/ghost-disembarking.png), [finale](evidence/midway-pass5/finale.png).

The final Trick or Treat browser regression passed (doorstep visits, ghosts, candy, timer, penalty and Investigation return), as did runtime/audio cleanup (mute, hidden tab and pagehide). All 23 archived mansion routes remain valid in the read-only audit. Merge/deployment recommendation: retain Beta development status pending hardware playtesting and independent review; this pass is not a production certification.

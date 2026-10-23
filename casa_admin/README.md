# House Office · Mansion Foundry

Open `casa_admin.html`. Select or drop all student `.haunt` files together, then choose **Forge queued houses / retry failures**. The existing Forge compiles each blueprint sequentially; the queue retains source files, prepared CASA archives and per-house reports in this browser's IndexedDB. An interrupted build returns to the queue after reload. A failed blueprint does not stop the others. Remove an individual queue entry to replace a troublesome source without clearing the prepared houses.

Prepared packages can be downloaded, added to the local Game test street, or published together. Permanent publication requires a short-lived fine-grained token scoped to `ryanhosta-glitch/black-hollow-2` with Contents read/write. Enter it only in House Office's password field. It is not saved with the queue or sent anywhere except GitHub's API. Disconnect clears it.

Batch publication uploads the prepared packages and catalog in a single non-forced Git commit. Concurrent repository changes require a fresh snapshot; prepared files remain available. Matching permanent house IDs update a mansion. Failed houses stay out of publication. Confirmations describe the concrete public change. Removed public houses remain recoverable in Git history; browser-local overrides are managed separately in the Game.

## Forge and review

Forge 4.3 with the student-readiness planner builds textured room finishes, complete multi-floor street exteriors, closed roofs with convex intersecting surfaces, lower-wing roofs, porches, decorative architecture, framed pictures and furniture. It plans stable room themes, exterior finishes and repaired access, while preserving the source blueprint in the archive.

The embedded single-house compiler remains available for custom names, permanent IDs and finish overrides. Its 3D inspection loads the exact exported models through the Game's resource loader. Floor visibility, room inspection, material diagnostics and collision guides help review the result. Static package checks do not claim a rendered walkthrough or certify arbitrary mesh physics.

Supported physical stairs require aligned dedicated straight staircase rooms, matching `stairLink`, `stairDirection: "z+"`, sufficient run and clear landings. Unsupported stair forms retain the explicit elevator fallback. Reports distinguish supported routes, automatic repairs and remaining blockers. A blocked package cannot be permanently published by House Office.

Limits are per file: 32 MiB source blueprint, 128 MiB local CASA import and 95 MiB permanent publication. The Game also accepts class-sized batches of prepared CASA files. Browser storage limits are separate from package limits; keep downloaded backups of important prepared work.

## Validation

`npm test` exercises compilation, package integrity, access, atomic publication, stale-head protection, active gameplay and classic saved investigations. `npm run test:browser` adds real Chromium/WebGL tests for Forge previews, stairs, complete hauntings, the town, both Ninth Door finales, 34-file batch/direct imports, and audio lifecycle. CI retains browser evidence. Tests do not rewrite the published CASA archives.

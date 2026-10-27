# Haunted Midway Beta release

Release candidate: `dev/haunted-midway`, signature-show implementation `75e236def9a4d8490ee2c5105edd6126e09a816e` plus release preparation. Midway stays the third selectable option and retains its Beta label. Haunted Houses and Trick or Treat remain available.

## Release and rollback

The recorded pre-Beta production source revision is **`642fdb7db2856f9ff89013ec17427c4b3cefea8e`** (Publish 4 Forged mansions). The immutable rollback tag is `rollback/pre-midway-beta-2026-10-27`.

Pages publishes only after the **CASA Forge regressions** workflow succeeds on `main`. A successful development-branch run cannot deploy. A superseded main revision cannot deploy. The release copies committed site files and verifies archive/catalog hashes in both source and packaged output. It does not invoke the reference-mansion rebuild or rewrite the student catalog.

For a full rollback without rewriting Git history:

1. Open **Actions → Deploy GitHub Pages → Run workflow** on `main`.
2. Check **Restore the recorded production revision from before Midway Beta**.
3. Run it, wait for deployment success, then check the site and `release-build.json`. Its commit must be `642fdb7db2856f9ff89013ec17427c4b3cefea8e`.

This deploys the recorded source snapshot, including its original two-mode UI. It preserves the development branch and student packages; local browser saves are not cleared. The source snapshot is a rollback point, not a byte-for-byte backup of the previously generated Pages artifact: the old deployment workflow rebuilt the reference mansion at publish time.

After rollback, do not merge further main changes until the failure is understood: a new successful main regression run normally publishes again. Restoring the Beta uses a normal manual deployment with the rollback box unchecked, which requires a successful full main regression run for the current SHA.

## Student pilot

Begin with a small group on actual school devices. Choose **The Haunted Midway · Beta**, approach a mansion porch, board, complete a ride including a haunted elevator where present, and unload. Check pause/resume, scene-cue disable, sound, returning to the street, and switching to both existing modes. Keep the current game available if a ride cannot convert: the park should mark it unavailable, not authorize an unsafe route.

Stop the pilot for repeated browser unresponsiveness, blocked unloading, wall clipping, missing house loads, broken existing modes or altered save behavior. Use the recorded rollback if the release affects ordinary play. Small rooms intentionally use small effects or narration; not every room supports a large show.

Native Mac and phone GPU performance has not been certified in the cloud environment. The richer cast increases draws despite bounded geometry. The previous development reports contain actual WebGL screenshots, component costs and regression results; they do not establish student-device frame rates.

The final release record in `docs/evidence/midway-release/` distinguishes GitHub checks, local verification, remote branch state and live-site verification. A successful push is not proof of a successful Pages deployment.

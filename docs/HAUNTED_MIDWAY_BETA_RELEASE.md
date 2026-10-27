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

## Integration findings

The initial comparison found that development preceded the 27-house production catalog and Christmas Forge work. The candidate now merges production `642fdb7`, preserving its archive/catalog bytes exactly and retaining all Christmas source, builds and tests. The regression matrix combines all 38 browser suites. The new release inventory covers 30 production files; older evidence inventories remain historical records.

The first integrated local core run had 371/372 passing tests. Its failure was the legacy cleanup assertion that rejected the word `archive` anywhere in the deployment YAML, including the new preservation checks. The corrected test checks the actual publication source allowlist and required entry points, keeping retired root engine directories excluded. No runtime assertion or gameplay behavior was weakened. The initial failure log is retained.

After the cleanup-test correction: **372/372 core tests passed**, the full navigation/scene/gameplay flow suites passed, **37/37 Midway tests passed**, and **18/18 Christmas Forge tests passed**. Both Christmas standalone builds succeeded. The read-only current-production audit covers 27 archives / 468 rooms / 495 scene stops; its per-house route validity and scene omissions are retained in the evidence. A locally exercised copy of the actual release-gate shell passed five cases (successful main, superseded main, uncertified manual rejection, certified manual and recorded rollback); GitHub API counts were mocked for that local gate test. The actual packaging shell preserved all 30 protected production files and both standalone Christmas outputs.

The locally served **actual production package and 27-house catalog** also passed a complete published Moonveil reference-mansion ride: 12 rooms, haunted-elevator transfers, unloading, return to the neighborhood and both existing-mode switches, with no browser errors. This test used the real Game/worker/assets, a test-only instrumentation hook, an accelerated ride clock, reduced motion and software WebGL. The matching local Three.js copy substituted for the CDN. It is evidence of the packaged application, not of native student-device FPS or a successful live-site smoke test.

The cloud network proxy rejects the live `github.io` host with HTTP 403 before the site responds. GitHub Actions pages remain readable, so remote workflow/deployment status can be verified independently. A live student-device check remains necessary after publishing. Do not describe the cloud's blocked live check as a district blocking issue.

The integrated development run `40489800295` encountered a Git transport failure in the reference browser job during `actions/checkout` (`early EOF`, `fetch-pack: invalid index-pack output`), before tests ran. The preceding run's mobile polish failure passed on local reproduction with the same integrated source; it remains recorded rather than waived. The release branch is now included in regressions with browser concurrency capped at eight to reduce simultaneous large checkouts. All 38 browser suites and their assertions remain enabled. The checkout action’s automatic retry subsequently recovered, and the full integrated development run concluded SUCCESS on `6f7e5aec6517626099e6c37f82f2c89385876d67`, including all 38 browser suites. The promoted release retains byte-identical application and test sources; subsequent changes cover release documentation/evidence and CI concurrency only. Production publication still requires a fresh successful full run on main.

## Slow-device cooldown fix found by final certification

Main certification `40491343555` correctly blocked deployment because the mobile polish test timed out waiting for spell readiness. An isolated diagnostic run exposed the live UI still showing “Witchlight · 1s” after the 30-second wait. This was an existing clock coupling: the 3.5-second cooldown consumed the physics/animation delta capped at 0.05 seconds per rendered frame. On slow software rendering it could last tens of wall-clock seconds.

The fix gives the magic realm the Game's existing active-time delta for cooldown only. Visual effects and movement retain their bounded deltas. The existing pause, dialog, busy and hidden-tab guards remain in charge; there is no additional timer or loop. Default callers retain their prior timing contract. Browser cache versions are updated for the changed module and entry point. The original browser assertions remain unchanged; diagnostic annotations now expose failures even when full logs require sign-in.

The corrected full local run passes **373 core tests**, plus all existing navigation, loading, gameplay, quest endings and save migration flows. The magic suite passes ten tests, including a low-frame-rate regression that verifies readiness expires without large visual steps. The mobile polish browser test passes locally. These gameplay changes supersede the earlier statement that the first promoted source was identical to `6f7e5ae`; the cooldown fix must pass a new full main regression run before Pages publishes.

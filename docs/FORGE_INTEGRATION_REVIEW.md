# Forge final integration review

Subsequent work: [ceiling and botanical visual follow-up](FORGE_VISUAL_FOLLOWUP.md) addresses the art findings below and adds a [Chrome/Mac acceptance procedure](FORGE_MAC_ACCEPTANCE.md). This document preserves the original certification snapshot and timing evidence; consult the follow-up for current validation and costs.

**Recommendation: NOT READY TO MERGE.** All six implementations are present and the automated regressions pass after the fixes below. Visual luxury acceptance and representative device performance remain outstanding. Prepare an unmerged review PR; do not deploy.

## Revision and scope

Reviewed on 2026-10-25 on the actual branch `dev/forge-shared-components-pass1`. The initial working tree was clean. The full pre-review history was inspected and is preserved in [the history inventory](evidence/forge-integration/pre-review-history.txt). The pre-six-pass baseline is `4c47d7b2b5bd5e99d91b4ed6cc6ac81768a287e7`, also the observed remote `main`. The six-pass source head was `80bc9ba9783a159d100d190e6238acc7a0a1ddab`; the final review commit is recorded by Git and the delivery message, avoiding a self-referential commit hash in this document.

| Pass | Committed implementation | Status and integration finding |
| --- | --- | --- |
| 1: Shared foundation | `659b3760592bbce15899a00005d8f48393e6c6e1` | Shared registry, seven families, eleven identities, stable variation, surface ownership and budgets integrated. |
| 2: Architectural luxury | `47d32987e5662b9eefd87402c39207aba796b625` | Layered trim, panels, coffers, surrounds and floor treatments integrated. Ceiling relief is visually too subdued in some combined treatments; art acceptance remains open. |
| 3: Heirloom furniture | `bfb29a281f7f0c6dbbb52b9e82a4a92a7a6583b3` | Shared styled furniture templates, upholstery and hardware integrated with original placement/collision catalog. |
| 4: Cinematic lighting | `c030c099b81544e0a4af378eb67bcbcf21979fe9` | Shared fixture geometry and bounded runtime light pool integrated; two quality levels rendered. Directional key light can leave ceiling relief unlit. |
| 5: Environmental storytelling | `07a2a10ea25b22742b2e7b6e7dd09ccfe030b7fb` | Curated supported-surface arrangements and optional discoveries integrated; no required objectives added. |
| 6: Gothic atmosphere | `80bc9ba9783a159d100d190e6238acc7a0a1ddab` | Per-room textile/glass/botanical/aging treatments and existing haunting hooks integrated. Two boundary/authorship defects corrected during this review. |

Implementation inventories and earlier evidence remain in the six pass reports. No completed feature was removed to make this review pass. The existing finish/envelope, furniture planner, shared component ownership, light pool and Game-owned reaction systems remain the integration points. New-export canopy and cobweb ownership avoids duplicate Game dressing; legacy archive fallback remains supported.

## Corrections made during integration

- `casa_game/room_gothic_details.mjs`: explicit window choices including `curtains:false`, `glass:false` and zero-valued policies now suppress generated treatments. Previously truthiness checks could override an explicit student choice.
- The same module caps decorative water-stain width at the supported template limit. A 12-metre authored conservatory window previously threw `Invalid Gothic dimensions`; it now compiles without changing its width. Oversized glass/textile details remain explicitly omitted with budget/policy reporting.
- Five new integration tests exercise combined eleven-profile output, byte-deterministic archives, optional discovery contracts, surface ownership, runtime dressing cleanup, wide windows and explicit student furnishing/finish choices. They are included in `test:core`.
- The browser runner honors `CHROMIUM_PATH` even in older suites that did not pass it to Playwright. Bundled Chromium installation was denied by the network policy; the preinstalled system Chromium was used without weakening TLS or artifact verification.
- Existing stale browser tests were corrected: townlife uses the current named route controller; polish approaches the moving dog and selects its named action; audio lifecycle tests correctly insert their private instrumentation into the current return object; batch routes the Three dependency locally. Existing behavior assertions remain. [Blob comparison](evidence/forge-integration/preexisting-test-drift.json) confirms the stale tests and relevant runtime files were unchanged between the baseline and six-pass head.

## Automated regression results

Tests ran in disposable `/tmp` copies because `npm test` regenerates sample houses. The real checkout's student data was protected throughout.

| Validation | Final result | Evidence |
| --- | --- | --- |
| `npm test` | 331 core tests plus all navigation/scene/gameplay flows passed; then the fifth integration test was added | [Full run](evidence/forge-integration/full-final.log) |
| `npm run test:core` after the final test addition | **332 passed, zero failed/skipped/cancelled** | [Final core run](evidence/forge-integration/core-final.log) |
| `npm run test:forge-integration` | **5 passed** | [Integration run](evidence/forge-integration/integration-final.log) |
| Existing legacy tests | **3 passed** | [Legacy run](evidence/forge-integration/legacy-regression.log) |
| Complete existing browser suite inventory | **31 of 31 passed** | [Results](evidence/forge-integration/browser-results.json), [individual logs](evidence/forge-integration/browser-logs/) |
| New matched WebGL comparison harness | Both editions completed; 28 views each; zero page/console errors; zero undecoded texture images | [Baseline](evidence/forge-integration/baseline/report.json), [integrated](evidence/forge-integration/integrated/report.json) |

Browser coverage includes atmosphere, storytelling, lighting, heirloom, luxury, playpack, household, nocturne, release-entry, townlife, polish, afterlife, village, magic, playtest-pass, scares, phoenix, forge, stairs, pipeline, reactions, rooms, organ, halloween, town/elevator, student-readiness, batch, street-memory, runtime-cleanup, directors-pass and reference.

Navigation and scene flows exercise original and freshly compiled archives, stairs and elevator approaches, collision, room/furniture completeness, encounters, quests, Floor 13, endings and save behavior. Browser batch/pipeline publication APIs are mocked; these checks did not publish real houses. Lighting tests exercise task/hearth/window sources, light/shadow budgets and multiple qualities. Atmosphere tests additionally exercise the live Game haunting effects and reduced-motion behavior.

Initial failures are retained in [initial-failures](evidence/forge-integration/initial-failures/): missing bundled Chromium, stale route/audio instrumentation, moving-dog action selection and missing batch dependency routing. They were investigated and rerun, not excluded. No required suite remains failing. Browser installation denial is retained in [browser-install.log](evidence/forge-integration/browser-install.log). The first timing experiment was interrupted to replace CPU submission timing with forced GPU completion; only completed final JSON reports are used for the metrics below.

## Visual review and acceptance gaps

[Interactive comparison viewer](evidence/forge-integration/index.html) contains **56 fresh browser captures**: eleven room identities at each of two qualities for each edition, plus six cinematic close-ups per edition. The same two-story `tests/fixtures/forge-atmosphere.json` blueprint was compiled independently by the original and upgraded production compilers. Views use actual Game archive loading, GLTF materials, floor streaming, lighting and haunted-interior modules, at 1.62-metre eye height. The comparison harness is isolated from gameplay UI; separate browser suites exercise the actual application. WebP files are size-reduced, unretouched copies of PNG captures.

All eleven cinematic room views were visually inspected, along with the six close-ups. Contact sheets: [ballroom/parlor/library/dining](evidence/forge-integration/room-contact-0.png), [gallery/conservatory/bedroom/nursery](evidence/forge-integration/room-contact-1.png), [crypt/laboratory/passage](evidence/forge-integration/room-contact-2.png). Both quality levels were captured and programmatically checked; an exhaustive manual walkthrough of every possible camera/quality was not performed.

| Identity | Observed result |
| --- | --- |
| Ballroom | Detailed chandelier, layered wall/door trim and compositions visible. Ceiling coffer relief/medallion reads too thin and dark for the intended grand luxury. |
| Parlor | Warm room, textile and leaded-window detail legible. Fireplace illumination covered by the dedicated lighting browser study. |
| Library | Desk, hardware, open book and unfinished writing form a clear supported tableau. Some upper areas are intentionally dark; desk surface remains readable. |
| Dining room | Carved wood panels, clock and furniture ensemble read distinctly. Primary chandelier follows the table and can sit above the wide room-view camera's field of view. |
| Gallery | Seating and portrait pool are distinct; upper ceiling ornament has the same subdued contrast as the ballroom. |
| Conservatory | Cool filtered lighting and botanical records are visible. Botanical silhouette is coarse and dark close up; not a fully convincing lush greenhouse. |
| Bedroom | Upholstered headboard, pillows, canopy and personal keepsakes visible. Original oversized dark canopy appearance is reduced. |
| Nursery | Private warm styling and restrained fabric remain distinct; still shares the bed silhouette with the bedroom. |
| Crypt | Cool stone and memorial compositions retained; upper areas are subdued. |
| Laboratory | Scientific tabletop objects and cold room treatment visible; lower-cost silhouettes remain angular. |
| Passage | Sparse clearance-safe composition and directional illumination; no clutter added to the route. |

No obvious floating main furniture, blocked door or missing texture was observed in the inspected views. This is sample-based evidence, not proof against every authored layout. Planner, clearance, irregular/small-room and stair tests supplement the screenshots. No broad lighting/geometry rewrite was made during certification merely to make attractive screenshots: the ceiling interaction is explicitly an unresolved art-quality issue, and no feature was silently disabled. Dedicated current-run fireplace evidence is included in `evidence/forge-integration/additional/`; earlier architecture/furniture studies retain additional surround and angle evidence.

## Performance and package comparison

The same eleven-room source was compiled with each version. [Full inventory](evidence/forge-integration/compile-comparison.json) and [view metrics](evidence/forge-integration/metrics.json) distinguish export inventory from live scene cost.

| Metric | Original | Integrated |
| --- | ---: | ---: |
| Compressed CASA bytes | 5,576,352 | 5,803,542 (+4.1%) |
| Exported GLB model variants | 13 | 20 |
| Inventory triangles, all exported models | 552,548 | 491,935 (-11.0%) |
| Inventory primitive groups | 158 | 209 |
| Floor 00 triangles / primitive groups | 30,000 / 14 | 21,302 / 16 |
| Floor 01 triangles / primitive groups | 25,344 / 14 | 15,722 / 17 |
| Decoration triangles / primitive groups | 148,320 / 17 | 132,393 / 39 |
| Decoration GLB bytes | 11,293,104 | 9,896,600 |
| Cinematic shadow-map pixels in measured views | 2,097,152 | 262,144 |
| Performance shadow-map pixels | 0 | 0 |

Inventory totals include alternative exterior representations and special Hall/Floor 13 models; they are not a single room's triangle count. Additional material groups increase potential draws even while triangles fall. Actual per-view draw/triangle/residency values are included in both reports; integrated draw counts range from 40–112 in cinematic and 44–112 in performance. Integrated captures stay below the harness's 180-draw ceiling, three cinematic practical lights/one shadow light, and two performance practical lights/no shadows. Texture images all decoded successfully. No real-time mirror rendering was introduced.

Timing uses Chromium 154 on **SwiftShader software WebGL**, 1200×800, pixel ratio 1. Twelve synchronous frames after three warm-up frames force completion with a one-pixel GPU readback. A separate 16-frame RAF measurement uses the Game's 30-Hz gate. These are isolated scene benchmarks; they exclude full gameplay/audio/UI work and are **not actual Mac gameplay FPS**. Readback overhead and software rendering make these absolute rates unsuitable as hardware acceptance thresholds.

| Room | Cinematic median render ms, original → integrated | Performance median render ms, original → integrated | Cinematic capped scene FPS, original → integrated | Performance capped scene FPS, original → integrated |
| --- | ---: | ---: | ---: | ---: |
| Ballroom | 1985.7 → 2053.0 | 920.0 → 837.2 | 0.24 → 0.22 | 0.55 → 0.56 |
| Library | 1713.5 → 1778.4 | 796.6 → 758.1 | 0.29 → 0.28 | 0.64 → 0.60 |
| Conservatory | 2404.0 → 2349.2 | 1158.5 → 986.2 | 0.20 → 0.21 | 0.42 → 0.45 |
| Bedroom | 2435.4 → 1865.7 | 1340.3 → 957.5 | 0.19 → 0.25 | 0.37 → 0.50 |

Ballroom/library cinematic medians regress approximately 3–4%; other median timings improve. RAF and synchronous results differ and this single software run cannot establish statistical significance. No major geometry explosion appeared. No further speculative optimization was applied after passing the measured budgets.

Decoded RGBA8 texture memory plus estimated mipmaps is approximately **9.21 → 10.38 MiB** for the first-floor cinematic benchmark rooms, and **10.19 → 8.44 MiB** for the bedroom. Performance equivalents are 9.08 → 10.25 and 10.06 → 8.31 MiB. These estimates exclude PMREM, driver compression, framebuffer/depth allocations and texture sharing beyond the measured scene. Renderer geometry/texture counts and vertex/index buffer bytes are recorded per view. **Exact GPU memory, representative Mac/native GPU frame rates, thermal behavior, sustained full-game FPS and cross-browser hardware performance were not obtainable in this cloud environment.** Native device acceptance remains required, especially given the user's previous unplayable Chrome/Mac experience.

## Student protection and compatibility

[Final integrity audit](evidence/forge-integration/integrity-final.json) and [protected SHA-256 inventory](evidence/forge-integration/protected-originals.json) verify 25 original files, including 23 CASA archives and `casa_game/street.json`, remain byte-identical to the pre-six-pass baseline. Both old and current Game loaders open all 23 archives with unchanged fingerprints. Embedded original `source.haunt` and repaired sources remain byte-identical. Planner inspection did not mutate either source.

The repaired archive inputs contain 443 rooms, 443 explicit identities/finishes and 867 non-generated openings. These records have **no supported authored furnishing placements** in the planner output, so this corpus alone cannot establish furnishing-preservation coverage. The new synthetic eleven-profile test supplies explicit styled student desks, protected accessories, identities, finishes and openings and verifies preservation without relocation/replacement.

Existing corpus warnings are not concealed: both planners report **265 unsupported authored furniture records and 310 authored furniture clearance issues**, plus four porch jamb warnings in repaired sources (579 total). Original sources have the same 575 furniture issues before/after. There is **no increase** in unsupported replacement/warning counts. This does not certify those pre-existing authored objects as renderable. Existing rescue/repair behavior remains explicit, and new embellishment does not expand its replacement policy.

Manifest version `1.0-qa`, CASA spec `1.0`, required GLTF extensions and the loading contract are unchanged. Optional QA/decoration metadata and appended materials do not require an archive schema migration. Original material slots remain stable; generated references and asset closure are regression tested. Existing archives keep their original visuals until explicitly recompiled. An explicit empty `stairs:[]` conservatively suppresses some architectural luxury under the existing safety policy, as required by the existing tests; this limitation was not silently changed.

No production/student data was overwritten or published. No archive generated for this review is committed. The existing Pages workflow triggers on a push to `main`, not this development branch or PR. **A later merge to main will trigger deployment and regenerate the Moonveil reference sample under that existing workflow.** Independent review must account for this; the workflow was not changed or invoked by this review.

## Review preparation and remaining gates

All six pass reports and component inventories remain in the PR. Final-review changes include the production boundary/authorship fix, five integration tests, browser portability/test-drift fixes, matched comparison harness, this report and its evidence. [Tracked file inventory](evidence/forge-integration/tracked-files-before-review.txt) records changes through the working production/test files; [Final file inventory](evidence/forge-integration/files-changed.txt) includes the new review files; GitHub's Files changed view remains authoritative for the final commit.

At report preparation, read-only Git access works but `gh api` returns `Forbidden`: the active environment's network allowlist excludes `api.github.com`. A network-only draft adding that host was saved through the cloud onboarding tool while preserving the known allowlist. Saving a draft does not apply it to the active runtime. Branch push and PR creation are attempted after committing the concrete review; their verified outcome and exact SHA are provided in the delivery message. No remotely available branch/PR is claimed here in advance.

Before merging:

1. Resolve or explicitly accept the subdued ceiling relief and coarse/dark botanical art results, using the matched evidence rather than compiler success.
2. Run sustained actual gameplay on a representative Chrome/Mac and a lower-powered student device at both supported qualities. Record device/GPU, resolution, frame pacing, memory and navigation visibility; establish acceptance against the original Forge.
3. Complete independent source/visual review, verify remote PR/commit and run any required hosted checks. Coordinate the existing main-triggered deployment before approving a merge.

The implementation is functionally integrated with passing automated coverage. It is **not fully visually or hardware-performance certified**. This review does not authorize a merge, deployment or student-house republication.

## Reproducing the review

Use Node 22 or newer, `npm ci`, and an available Chromium executable. Run `npm test` in a disposable copy to protect tracked sample archives; then run `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser` there. The three legacy performance tests run with `node --test tests/performance.test.cjs`.

For the matched study, save the baseline to a separate disposable directory with `git archive 4c47d7b2b5bd5e99d91b4ed6cc6ac81768a287e7`, make dependencies available there, then run the current `tests/browser-forge-certification.mjs` twice. Set `FORGE_REVIEW_ROOT` to each tree, `FORGE_REVIEW_EDITION=baseline` or `integrated`, `FORGE_REVIEW_OUTPUT` to distinct writable output directories, and `CHROMIUM_PATH` to the browser. Default output is ignored `tests/artifacts/certification/`. This harness creates a synthetic review archive, never a student archive. Software readback timing takes substantially longer than the ordinary suites.

## Verified GitHub handoff outcome

The development branch was successfully pushed and independently verified with `git ls-remote`. The implementation/review commit `78d30da058d15ef33b36f2c37aa1f58b3dfae576` is remotely available. Remote `main` remains `4c47d7b2b5bd5e99d91b4ed6cc6ac81768a287e7`. A documentation-only follow-up records this handoff; the final branch-tip SHA is supplied in the delivery message and can be verified with `git ls-remote`.

**No PR was created.** Both normal and approved-access `gh pr create --draft` attempts returned `Post "https://api.github.com/graphql": Forbidden`. The active proxy/network restriction remains in effect. The saved environment network draft adding `api.github.com` has not been applied; no new token was requested or exposed. No automatic approval rejection occurred: the approved command ran and the API request itself was denied.

After applying the network setting through environment settings, or from an authenticated local checkout with GitHub API access, run:

```sh
gh pr create --repo ryanhosta-glitch/black-hollow-2 \
  --base main --head dev/forge-shared-components-pass1 \
  --title "Forge passes 1–6: integration audit and review evidence" \
  --body-file docs/FORGE_INTEGRATION_PR.md --draft
```

Alternatively open the [GitHub PR creation form](https://github.com/ryanhosta-glitch/black-hollow-2/compare/main...dev/forge-shared-components-pass1?expand=1) and use the committed PR description. **This is a creation form, not an existing pull-request URL.** Verify that the base is `main` and the head is the development branch. Do not merge or deploy. Final certification remains **NOT READY TO MERGE** for the stated visual and hardware-performance gates, independent of this API blocker.

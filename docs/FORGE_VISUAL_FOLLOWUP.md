# Forge visual follow-up: ceiling relief and botanicals

This follow-up addresses the two visual findings from the final integration review on `dev/forge-shared-components-pass1`. The reviewed starting revision is `76a650048beb144dce35644639cac0202105002c`. **Recommendation remains NOT READY TO MERGE pending representative device gameplay measurements and independent visual approval.** No merge, deployment or student-house publication is performed.

## Changes

Ceiling coffers use a wider, stepped 10-cm relief instead of the previous roughly 6-cm profile. Formal medallions grow from about 37 to 56 cm radius; other unrestrained medallions also grow modestly. Existing room-family, authored finish, headroom, stair and component-ownership rules still apply. All dimensions remain within the existing safe ceiling zone. No separate renderer or new material is added.

In Cinematic mode, standing near a compiled chandelier can use a small indirect ceiling fill in a spare slot of the **existing three-light pool**. It uses 2.5 candela, a four-metre range and no shadow map. It yields to nearby task lights, hearths, portrait lighting and windows, and is not generated for source-only fallbacks or legacy photometry. The original source plan is never mutated. Performance mode retains its original two-light selection and no ceiling fill. The effect approximates candle uplight; it is not true bounced illumination or baked global illumination. Position-based light handover continues through the existing practical-light controller.

Fern fronds now have curved stems and folded pairs of pinnae, with explicitly opposite-facing facets. Previously some leaves disappeared when viewed from the reverse side. A full fern template uses 672 triangles, below the unchanged 1,200-template limit; compact variants remain smaller. The template stays in one material group and inside the original furnishing footprint. Living/overgrown greens have a modestly brighter albedo; dried-state materials remain distinct. There are no alpha layers, new textures, reflections, dynamic plant deformation or additional plant draw groups. The result remains deliberately low-poly rather than a photorealistic greenhouse asset.

## Matched visual evidence

[Comparison viewer](evidence/forge-visual-followup/index.html) contains 56 new actual WebGL captures: all eleven room identities in Cinematic and Performance, plus six detail views per edition. Both editions compile the same two-story fixture and use the same Game loader, materials, streamer and atmosphere modules. Both ceiling close-ups use a closer chandelier-facing camera than the earlier integration study; no before/after camera mismatch is introduced. Eye height remains 1.62 metres.

The ceiling medallion and molding depth are now visibly legible under the chandelier, with warm illumination rather than a nearly black relief. In the matched ceiling image, mean luma over the fixed upper region rises from 67.9 to 139.1 on the 0–255 scale; this is image evidence, not a general navigation brightness target. The conservatory plant has a fuller, more readable silhouette. All eleven cinematic room overviews and the ceiling/botanical close-ups were inspected for gross visual regressions. Doorways and furniture placement remain unchanged in these views. Independent art approval is still required, particularly for the intentionally subdued library and conservatory corners.

The new run is visual-only (`FORGE_REVIEW_BENCHMARK=0`). It retains texture decoding, archive navigation, draw-count and light/shadow assertions while explicitly omitting frame timing. It does not replace the prior timing experiment with a claim of improved FPS. [Before report](evidence/forge-visual-followup/before/report.json), [after report](evidence/forge-visual-followup/after/report.json), [metrics](evidence/forge-visual-followup/metrics.json).

## Geometry and rendering costs

| Metric, same eleven-room archive | Reviewed branch | Follow-up |
| --- | ---: | ---: |
| Compressed CASA bytes | 5,803,542 | 5,872,987 (+1.2%) |
| All-model inventory triangles | 491,935 | 496,513 (+0.9%) |
| All-model primitive groups | 209 | 209 |
| Room-component primitives | 1,754 | 1,754 |
| Decoration triangles | 132,393 | 135,627 |
| Decoration primitive groups | 39 | 39 |
| Decoration GLB bytes | 9,896,600 | 10,214,168 |
| Component-budget omissions | 44 | 44 |

All 44 omissions are the same `NO_SAFE_PLACEMENT` records in both editions; no new omission or budget relaxation was introduced. Component and package reports remain within their original limits. Inventory totals include alternate models, not one loaded room. Live draw counts remain at or below 112 across the matched views, within the unchanged 180-draw assertion. The existing three/two-light caps and one/zero-shadow caps hold for both qualities. No new texture allocation is required by the leaf color changes or ceiling fill. Exact GPU memory and current native-device FPS remain unmeasured.

## Validation

- **334 core tests passed**, with zero failures or skips, plus the complete navigation/scene/gameplay flow sequence, including fresh Forge exports, quests, encounters, Floor 13 and saves. [Full log](evidence/forge-visual-followup/full-regression.log).
- **Three legacy performance tests passed.** [Log](evidence/forge-visual-followup/legacy-performance.log).
- **26 focused lighting/atmosphere tests passed.** New tests verify opposite face orientations, bounded templates, the Cinematic-only fill, fallback/legacy behavior, no input mutation and task/hearth/portrait/window priorities. [Focused log](evidence/forge-visual-followup/focused-tests.log).
- **All five targeted browser suites passed:** lighting, atmosphere, architectural luxury, room completeness and compiler/local-playtest pipeline. Status is recorded in [browser-results.json](evidence/forge-visual-followup/browser-results.json) and its corresponding logs. The previous full 31-suite certification remains attached to its original revision; it is not claimed as a fresh full browser rerun for this follow-up.
- Both matched WebGL studies completed with zero page/console errors and no undecoded textures. No assertions were removed to obtain passing results.
- [Repeated integrity audit](evidence/forge-visual-followup/integrity.json) confirms all 23 original CASA archives, their embedded original/repaired blueprints, fingerprints and the street catalog remain unchanged. Original corpus authored-furniture and clearance warning counts remain unchanged. Full tests and ordinary browser suites ran in a disposable copy to prevent fixture preparation from touching originals.

## Next step on the target Mac

[Chrome/Mac acceptance procedure](FORGE_MAC_ACCEPTANCE.md) provides repeatable full-game routes, three-run sampling, trace and memory collection, baseline comparison and a results table. The scene harness also supports `FORGE_REVIEW_GPU=native` for local hardware experiments; the actual renderer is recorded in output. This option has not been exercised on Mac hardware here. The normal software default is unchanged.

The existing Game automatically selects a lighting tier at initialization; this pass does not add a new player-facing toggle or assume one exists. A native scene run can compare both qualities at fixed resolution, but full-game Chrome traces are still necessary for acceptance. The cloud environment cannot certify the user's computer remotely.

The prior GitHub API access blocker is separate from these visual fixes. The prepared PR body remains in `docs/FORGE_INTEGRATION_PR.md`; the development branch can be pushed through the existing native Git route. A later merge to `main` would trigger the existing deployment workflow, so it remains outside this work's authorized completion step.

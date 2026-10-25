# Gothic atmosphere and material detail — Pass 6

Pass 6 adds room-specific Victorian textiles, glass, botanical details and aging through the existing Forge component sessions and material-batched geometry. It replaces overlapping runtime decoration for new exports and extends the existing Game haunting and practical-light hooks. No competing renderer, event director, quest objective or save format is introduced.

The [comparison viewer](evidence/forge-atmosphere/index.html) includes all 11 profiles, three condition variants, eye-level detail views and both lighting qualities. The [component inventory](evidence/forge-atmosphere/component-inventory.json) records template costs and appended materials. The baseline is Pass 5 commit `07a2a10ea25b22742b2e7b6e7dd09ccfe030b7fb`.

## Shared systems

| System | Implementation and ownership |
| --- | --- |
| Textiles | Folded velvet curtains, inner lining, swag valances, restrained tassels, paired bed-canopy hangings, upholstered wall panels, and supported fabric table covers. These replace the old window-valance strip and the corresponding generated wall textile detail. |
| Glass | Shared diamond/rosette leaded patterns fitted to real openings; neutral clear glazing for display cabinets, botanical cases and the specimen bell; aged mirror silver in existing ornate frames. Existing scientific specimen bottles retain their supported tinted glass and labeled contents. |
| Botanicals | Shared faceted fronds replace rectangular leaves in existing fern urns and plant stands, and also furnish the specimen bell. Wall-mounted specimen cases, trailing ivy and funeral sprays share the same library. No additional floor pots are forced into walking routes. |
| Aging | Preserved, abandoned and decaying treatments vary generated velvet, mahogany, brass and stone. Small supported dust deposits, condition-dependent high cobwebs and mineral traces below appropriate windows add localized disuse. Explicit structural finishes remain authoritative. |
| Supernatural detail | One room-local dust pool and a gentle modulation of already selected practical lights. Existing room-theatre reflection/clock effects and reaction hooks obey the exported room policy. No new encounter scheduler or persisted state. |

`gothic_components.mjs` exposes 12 shared template types through `gothic:<type>` registry entries: `velvet-curtain`, `layered-valance`, `bed-canopy`, `upholstered-panel`, `table-cover`, `leaded-rosette`, `fern-fronds`, `trailing-ivy`, `specimen-case`, `funeral-spray`, `water-trace`, and `settled-dust`. The library uses the existing architectural shape writer, not independent Three.js objects per fold or leaf. The 30 Pass 5 story components remain available; the specimen bell now reuses the frond generator.

The previous Game bed overlay added another canopy, posts, cushions and quilt over compiled furniture. New exports identify their atmosphere edition, so `createVelvetDetails` skips that overlay and its unused material/texture allocations. The Game also skips its old universal web/vine dressing for those rooms. Legacy archives retain their existing fallback path.

## Family inheritance and authored controls

`resolveRoomAtmosphere` inherits the existing profile family and then applies identity and authored overrides. It never reclassifies a room or edits its source.

| Profile | Default condition | Treatment |
| --- | --- | --- |
| Ballroom | Abandoned | Faded claret fabrics, softened brass, curated botanical case |
| Parlor | Preserved | Rich claret drapery, polished accents, maintained specimens |
| Library | Abandoned | Faded scholarly textiles, worn mahogany, dried botanical records |
| Dining room | Preserved | Formal green textiles, supported table cover when free, restrained case |
| Gallery | Preserved | Blue upholstery, leaded glass, framed mirror and curated specimens |
| Bedroom | Abandoned | Faded blue fabrics, paired bed hangings, localized disuse |
| Nursery | Abandoned | Faded linen and restrained canopy; optional supernatural cosmetics off by default |
| Laboratory | Abandoned | Sparse leaded glazing, scientific displays, no ballroom curtains |
| Conservatory | Decaying | Overgrown foliage, glazed specimens and appropriate window mineral traces |
| Crypt | Decaying | Aged stone, dried funeral spray, high cobwebs and appropriate window traces; no default velvet or jewel glass |
| Passage | Abandoned | Restrained existing finishes and high aging detail; no new projecting textile or botanical ensemble |

For example, an authored room may include:

```json
{
  "forgeDecoration": {
    "atmosphere": {
      "condition": "abandoned",
      "fabric": "blue",
      "botanicalState": "maintained",
      "effects": false,
      "waterStaining": false
    }
  }
}
```

Supported conditions are `preserved`, `abandoned`, and `decaying`; botanical states are independently `maintained`, `dried`, and `overgrown`. Fabric choices are `claret`, `emerald`, `blue`, and `ivory`. Invalid condition values fall back to the family/identity default. `textiles`, `glass`, `botanicals`, and `aging` can be disabled separately. `atmosphere:false` or `{enabled:false}` suppresses the new optional layer. `effects:false` leaves static appearance intact and disables the new cosmetic movement/modulation; it does not disable gameplay encounters or the ghost investigation.

Existing component switches remain effective. Explicit window glazing/material/style choices suppress generated jewel glass; authored drapery and curtain choices suppress automatic drapery, including `drapery:false`. Authored bed canopy choices suppress the generated canopy. Occupied or protected authored support surfaces retain Pass 5 protection. A cloth cover uses only a free, generated support and claims that support through the existing session.

Generated architectural relief can age, but an authored panel, trim or ceiling finish wins for its respective surface. Portable generated details conservatively avoid material remapping when the room supplies explicit finishes. Authored furniture identity, style, position and collision footprint remain unchanged. Generated urns/stands add only a botanical-state appearance tag; this is included in the preservation audit's declared differences.

## Geometry and navigation

Curtains and lining occupy the side portions of actual windows, leaving a central opening. Below headroom their geometry remains within a 60 mm wall band. Valances remain above walking headroom. Oversized windows above 4 m receive an observable detail omission rather than a failed compile or a change to their authored opening.

Bed hangings follow the actual bed rotation and remain inside its existing footprint, above the bedding and Pass 5 story objects. Both canopy ends are budgeted together. Potted fronds remain inside the existing urn/stand collider dimensions and meet their real supporting pot tops. Tests verify all three foliage states against those catalog envelopes.

Wall botanical cases and ivy use the existing aperture/portrait mounting exclusions and remain above 2.18 m. Their backboards are inset safely inside the room, rather than through the wall. Mineral traces occur below an actual window sill, only for opted-in/appropriate decaying rooms, and avoid rooms with authored finishes. No new floor collider or walking obstruction is added.

Two upholstered panels per room keep fabric accents curated; remaining existing wall-panel frames retain their carved treatment. Story arrangements retain first claim to table surfaces. The shared geometry writer batches emitted triangles by material; there is no object, animation or dynamic light per leaf, fold, candle or tassel.

## Quality and budgets

| Limit | Cinematic | Performance / reduced motion |
| --- | --- | --- |
| Room-local dust pool | At most 64 vertices, one draw when enabled and illuminated | Zero particle vertices and no visible particle draw |
| Practical modulation | At most ±2.5%, cycle at least 10 seconds; generated plan uses 12 seconds | Disabled |
| Existing practical light pool | At most 3 lights, one cached 512×512 spot shadow | At most 2 lights, no shadow map |
| New reflection cameras / dynamic lights | 0 | 0 |

The dust pool changes its vertex data only on room entry, anchors to a local compiled practical/window light, stays inside the room and moves vertically by just 15 mm. It does not follow the player through every room. Condition and effect settings determine whether it is visible. Reduced motion allocates no dust vertices and keeps the practical modulation steady. Existing fireplace material fluctuation now runs much more slowly; its reduced-motion behavior remains constant.

Each shared Gothic template is capped at 1,200 triangles and eight material groups. The new optional layer is capped at 2,200 triangles and 40 groups per room, inside the unchanged overall room/house component budgets. The room cap includes folded fabric, glass patterns, botanical displays and dust/stain geometry. Existing architecture and furniture have their own shared budgets. Atomic component rollback also removes the corresponding Gothic records. Omission reports distinguish curated density, unsafe placement, wide windows, authored/policy exclusions and budget rejection.

Static compiled detail is the same on both runtime quality levels; particle, lighting and shadow work degrades through the existing Game quality policy. Authors can additionally reduce export detail or disable individual static layers. This pass does not claim runtime mesh LOD or new GPU instancing for these templates.

## Archive compatibility

No CASA manifest/spec version, mandatory file, extension or loading contract changes. `atmosphere` and `atmosphereReport` are additive room-content fields. The optional `qa/gothic_atmosphere.json` records version 1, edition `gothic-atmosphere-1`, policies, component counts, costs and omissions. Existing material indices 0–39 remain stable; indices 40–52 append ordinary glTF metallic/roughness materials. Existing embedded texture sources are reused. New glazing uses alpha blending, with no transmission or refraction shader. Mirrors use a static environment/color approximation, not a reflected scene render.

Older archives remain readable, and their legacy uncompiled dressing path understands the new fallback material colors/transparency. Existing ghost encounters, reactions, optional discovery identifiers, required quest flags, Floor 13 and save handling retain their contracts. Original student archives are neither rewritten nor migrated.

## Validation and measured results

The showcase fixture is `tests/fixtures/forge-atmosphere.json`: all 11 identities on two stories, with windows on real exterior wall spans. The earlier architectural fixture had some shared-wall windows repaired into connecting doors; it remains unchanged. Both comparison editions compile the same new fixture. Static cameras stay at 1.62 m and are identical between editions and condition variants.

The evidence contains **91 screenshots**: 17 cinematic views per edition (11 room overviews and six detail views), across the Pass 5 baseline, Pass 6 family defaults, and the three explicit conditions; plus three Performance room views each before and after. Captures use the actual Game archive loader, floor streamer, material finishing, atmosphere and haunting layer in Chromium WebGL. Practical fluctuations are frozen for consistent comparisons; a separate actual WebGL probe tests live modulation, dust, reduced motion and effects-off behavior. Images are quality-88 WebP encodings of the raw PNG captures, with no retouching.

| Measurement, default showcase | Pass 5 | Pass 6 |
| --- | ---: | ---: |
| Compressed CASA bytes | 5,578,868 | 5,803,542 |
| Measured component primitives | 2,142 | 1,754 |
| Component triangle accounting | 69,917 | 78,193 |
| Estimated component geometry bytes | 7,551,036 | 8,444,844 |
| Decoration GLB bytes | 9,028,372 | 9,896,600 |
| Decoration GLB actual triangles | 124,405 | 132,393 |
| Decoration GLB material groups | 26 | 39 |

The default archive grows **4.03%**. Its Gothic layer comprises **56 component placements / 13,467 triangles**, with every room below the 2,200-triangle local cap. Material reuse and removal of repetitive dressing reduce component primitive count. The decoration GLB grows because the new details are baked into it; the Game separately saves substantial runtime canopy geometry. Component estimates and expanded GLB triangles describe different scopes and are not interchangeable GPU-memory measurements.

| Identity | Default condition | Gothic placements | Gothic triangles | Room-view draws, before → after | Visible triangles, before → after |
| --- | --- | ---: | ---: | ---: | ---: |
| ballroom | abandoned | 6 | 1,664 | 74 → 83 | 101,367 → 103,468 |
| parlor | preserved | 6 | 1,664 | 81 → 85 | 102,745 → 104,846 |
| library | abandoned | 6 | 1,664 | 68 → 74 | 101,509 → 103,610 |
| dining | preserved | 7 | 1,712 | 107 → 112 | 112,299 → 116,920 |
| gallery | preserved | 6 | 1,664 | 96 → 98 | 111,737 → 116,358 |
| conservatory | decaying | 3 | 510 | 80 → 85 | 107,145 → 112,840 |
| bedroom | abandoned | 9 | 1,989 | 77 → 63 | 93,706 → 62,039 |
| nursery | abandoned | 7 | 1,940 | 64 → 56 | 83,678 → 58,443 |
| crypt | decaying | 3 | 227 | 38 → 45 | 49,872 → 50,649 |
| laboratory | abandoned | 3 | 433 | 120 → 105 | 106,078 → 69,181 |
| circulation | abandoned | 0 | 0 | 84 → 75 | 91,118 → 63,199 |

Room-view draw changes range from −15 to +9. The default cinematic room views peak at 112 calls, compared with 120 before. Bedroom visible triangles fall from 93,706 to 62,039, primarily by removing the overlapping Game bed layer. These are scene-dependent structural measurements, not a promise of higher frame rate in every room. Raw reports include shader, texture, geometry, light and shadow counters plus diagnostic first-frame/compiler timings. Cloud SwiftShader timings do not establish performance on a student's Mac.

| Explicit condition across all 11 rooms | Compressed bytes | Gothic placements | Gothic triangles |
| --- | ---: | ---: | ---: |
| preserved | 5,793,450 | 51 | 13,396 |
| abandoned | 5,819,719 | 55 | 13,400 |
| decaying | 5,801,801 | 58 | 13,766 |

All condition exports pass package/component planning budgets. Each reports 14 curated panel-density omissions (two extra upholstery attempts in each of seven textile identities) and two glass policy exclusions (crypt and passage). There are **no budget-rejected Gothic placements in these showcase variants**. Narrow/low/stair rooms, exhausted budgets, authored exclusions and oversized windows are exercised by tests instead. See the [omission summary](evidence/forge-atmosphere/omission-summary.json).

The raw WebGL `dustCount` field records the pool geometry's stored draw range. A hidden room pool can retain that range; it is not an active-particle measurement. Actual renderer draw calls exclude hidden pools. The separate effect probe records visibility explicitly and verifies one visible dust draw only in its enabled cinematic case.

Validation evidence:

- **327 core tests passed**, followed by the existing navigation, Three.js scene, shipped-house gameplay and fresh-Forge gameplay regressions. These cover discoveries, encounters, both physical Hall stair routes, elevators, Floor 13, all eight endings, persistence and return to street. See [full regression log](evidence/forge-atmosphere/full-regression.log).
- **82 focused tests passed**, including 13 new atmosphere tests and the earlier storytelling, lighting, architectural, component, furniture and completeness regressions. A final run of the 13 atmosphere tests also verifies wide-window omission and authored/component opt-outs. See [focused log](evidence/forge-atmosphere/focused-regression.log) and [final policy checks](evidence/forge-atmosphere/policy-regression.log).
- **91 browser capture checks passed**, with decoded textures, bounded draws, valid Game loading, verified routes and no browser/shader errors. All captured view counts also remain below the 180-call guard. New component tests cover every material/condition/detail variant, actual pot/furniture bounds, four window orientations, rotated beds, thin wall projections, headroom, budget rollback, narrow/low/stair rooms and independent static/effect switches.
- **Live WebGL effect checks passed** for cinematic, Performance, reduced motion and disabled room effects. They verify the same resident light objects, bounded slow modulation, dust allocation/visibility, actual particle rendering, and the existing quality shadow limits. See [effect results](evidence/forge-atmosphere/effects-webgl.json).
- **Forge browser regression passed**: UI compile/download, embedded PNG/WebP decoding, previews, collision/floor controls, fresh CASA loading in the actual Game, physical stair ascent and both house floors. See [Forge report](evidence/forge-atmosphere/forge-webgl.json).
- **Actual Game WebGL reference regression passed** across its nine scene views, with bounded draws and no shader errors. See [Game report](evidence/forge-atmosphere/game-webgl.json).
- **23 embedded archive sources / 443 rooms** preserve furniture identity/placement/style, artwork, colliders, reservations and repair/issue decisions in a read-only Pass 5/Pass 6 planner comparison. The declared generated botanical-state tag is the only furniture-record addition. See [authored-content audit](evidence/forge-atmosphere/authored-preservation.json).
- **All 23 original CASA hashes remain unchanged**. Full tests ran in a disposable checkout. The final source export is byte-identical to the captured default archive; see [capture check](evidence/forge-atmosphere/capture-export-check.json).

Two existing expectations were updated for intentional behavior: the scene test now checks required haunting modules and zero reduced-motion dust instead of expecting more than eight runtime children; the Forge material probe now expects worn mahogany for the default abandoned library panel. Their first runs exposed those obsolete expectations; the final full and browser runs pass. No navigation or quest assertion was removed.

Reproduce focused checks with `npm run test:forge-atmosphere`. Run full `npm test` in a disposable checkout, because its existing preparation script rebuilds sample archives. `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser:atmosphere` captures family defaults and then runs the live-effect probe. Use `FORGE_ATMOSPHERE_CONDITION=preserved|abandoned|decaying` for condition studies; `FORGE_ATMOSPHERE_ROOT` and `FORGE_ATMOSPHERE_EDITION=before` select an immutable baseline. The GitHub browser regression matrix captures the default edition and uploads artifacts without deployment.

## Known limits and next expansion

Textiles are static folded meshes rather than cloth simulation. Leaves are deliberately broad faceted geometry; there is no leaf alpha texture, wind solver or extra per-frame vertex upload. Aging combines bounded material variants with local geometric marks; it is not a full baked dirt/occlusion system. Glass remains an approximation and can show the export format's ordinary transparency sorting limitations. Mirror effects are intentional spectral imagery in the existing theatre, not true reflections. Older already-published archives retain their embedded appearance until separately rebuilt by their owners.

The next expansion should prioritize:

1. **Per-floor native decoration batches and streaming measurements.** Avoid loading and slicing a whole-house decoration GLB for each resident floor. Measure compile/load memory and frame times on representative student Macs before increasing ornament counts.
2. **Authored atmosphere controls and surface attachment metadata.** Expose condition, layer switches and budget omissions in the Forge preview; formalize support/window attachment metadata for custom furniture and unusual openings.
3. **An art pass using small shared atlases or baked masks.** Improve fabric weave, localized grime, readable labels and botanical silhouettes without adding reflection cameras, broad postprocessing or more live lights.

These are recommendations, not uncommitted features or required archive migrations. This pass is committed locally on the existing development branch without publication or deployment.

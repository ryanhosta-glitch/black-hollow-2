# Forge Pass 2 — Victorian architectural luxury

Implemented on `dev/forge-shared-components-pass1`, continuing foundation commit `659b3760592bbce15899a00005d8f48393e6c6e1`. No deployment or publication is part of this pass.

[Open the rendered comparison](evidence/forge-luxury/index.html). It contains eleven room views and five close-ups for each version, with identical source, camera, lighting, and Game archive loading. Original captures are 1200×800 PNG; committed evidence uses WebP compression without retouching. Raw metrics accompany both editions.

## Architecture and shared components

The existing finish/envelope exporter owns the new decoration. Eight registry components provide profiled cornices, raised wainscoting, carved pilasters, pediment surrounds, coffered ceilings, carved medallions, period floor inlays, and carved shelving surrounds. Existing furniture generation supplies upgraded marble and mahogany fireplace surrounds. There is no additional gameplay renderer.

`forge_architectural_shapes.mjs` groups triangles by material and provides closed profile sweeps, beveled panels, and folded-leaf reliefs. Cornices have multiple depth steps; wainscoting has projecting plinths, dado caps and beveled fields; pilasters have flutes, capitals and corbels. Doorways gain jambs, shaped lintels and relief pediments. Coffers frame the ceiling in depth, with a carved central medallion. Fireplaces have curved half-columns, capitals, mantel profiles and a central relief. Borders and inlays remain flush with walking surfaces.

| Identity | Treatment |
| --- | --- |
| Ballroom | Symmetrical coffers, medallion, gilded accents and grand cornices |
| Parlor | Carved wood panels and fireplace surrounds; generated hearths favor mahogany |
| Library | Heavy mahogany treatment and carving on existing bookcase stiles and cornices |
| Dining | Taller panel divisions, formal coffers and carved doorway details |
| Gallery | Formal panels and pilasters with reserved artwork spans |
| Bedchamber | Plaster relief and refined wood trim |
| Nursery | Restrained panels and plaster details, preserving nursery furnishings |
| Crypt | Stone moldings, reliefs and mineral inlays |
| Laboratory | Ceramic/metal architectural variants; no grand ceiling ornament |
| Conservatory | Metal/wood architectural variants; no grand ceiling ornament |
| Passage | Shallow restrained trim; no coffers, medallion or full pilasters |

All eleven identities inherit the Pass 1 room-family configuration and stable identifier variation. Standard/luxury detail enables the new architectural owner; essential detail retains the simpler path. Existing registry component switches and `forgeDecoration.architecture: false` support omission. Authored finishes still override treatment defaults.

## Clearances, ownership and authored content

Decoration planning now precedes envelope generation so trim respects mounted art and props. Solid wall runs split around doors, windows and removed partitions. Surrounds remain outside apertures; low or corner openings omit unsafe details. Stair/elevator spaces retain their structural treatment, and ceiling relief requires at least 2.75 m room height. Floor inlays project approximately 2.4 mm; authored carpet/rug finishes skip them. Wall relief is shallow, approximately 0.10 m maximum. Library carving stays inside existing padded furniture collision bounds; fireplace carving stays within its original 1.55×0.48×1.45 m footprint. Existing furnishing/navigation placement remains authoritative.

The previous optional panel rails, ceiling crossbars, portable plaster ring and small chandelier rose are suppressed when the new architecture owns those surfaces. Hanging fixtures and glass details remain. This prevents exporting two competing decorations on one surface. Custom triangle coordinates, bounds and dimensions now share the same feet-to-meters conversion.

Authored furniture positions, existing marble fireplaces, supported finish choices and structural room geometry are retained. The new `mahogany_fireplace` type and optional `finishTreatment` distinguish new mahogany choices without changing authored marble by default. Unsupported authored finishes continue to produce the existing advisory and preserve their source data.

## Compatibility

No CASA manifest schema/version or Game loading contract changed. Existing archives require no migration. The exporter emits standard GLB triangles and the existing material groups. A deterministic 128×128 Carrara marble tile is appended at palette index 30; indices 0–29 are unchanged. Only models referencing marble embed that tile. This is an additive material, not a new archive format. Optional QA `budget.components.byComponent` reports emitted component totals. Existing archives without this diagnostic remain valid.

All 23 original CASA files were checked against pre-pass SHA-256 hashes and remain byte-for-byte unchanged. Test fixture rebuilding occurred only in a disposable checkout, never in student or shipped archives in this development checkout.

## Measured costs and omissions

The study fixture combines all eleven identities on two stories. Before is the exact Pass 1 source snapshot; after is this pass. Figures are specific to this fixture.

| Measure | Pass 1 | Pass 2 |
| --- | ---: | ---: |
| Compressed CASA bytes | 5,511,751 | 4,729,304 |
| Export inventory bytes | 26,760,069 | 20,120,703 |
| Tracked component triangles | 88,484 | 64,730 |
| Estimated tracked geometry bytes | 9,556,272 | 6,990,840 |
| Lower-floor GLB triangles / draws | 29,460 / 14 | 19,522 / 14 |
| Upper-floor GLB triangles / draws | 24,948 / 14 | 14,552 / 14 |
| Decoration GLB triangles / draws | 146,404 / 17 | 127,318 / 17 |

The archive is 14.2% smaller. Consolidated material batches and removal of overlapping decoration offset the new relief geometry. Measured room-view draw calls range from 29 to 82 after the change. These counts include the loaded floor, not an isolated room. A batch can span both sides of an aperture, so collision tests inspect actual triangles rather than its enclosing bounding box.

Existing limits remain: 14,000 house primitives, 420 room primitives, 200,000 house component triangles, 10,000 room component triangles and 24 MiB estimated component geometry. The combined fixture stays within limits. Extremely long spans cap panel density at twelve bays and report `DENSITY_CAPPED`; component sessions retain atomic rollback and budget omission reports. Estimates do not represent complete GPU residency; the package inventory also records other geometry and embedded textures.

The after report records 63 `NO_SAFE_PLACEMENT` and 17 `SURFACE_ALREADY_DECORATED` component attempts. These include intentional family exclusions, interrupted wall spans and previously claimed furniture surfaces; they are not 80 lost rooms or budget overflows. No details were omitted because of budget exhaustion in this sample. Explicit small-budget tests verify omission and reporting when limits are reached.

## Regression evidence

- Full `npm test` in `/tmp/forge-luxury-validation`: **280/280 core tests passed**, zero failures/skips, followed by passing navigation, real Three/GLTF scene, archive and original/fresh gameplay-flow harnesses.
- Fifteen new luxury tests cover all identities, dimensional geometry, four-wall aperture clearance, removed partitions, artwork reservations, stairs/headroom, authored finishes and opt-outs, budget omissions, fireplace/bookcase collision bounds, triangle unit conversion, the two-story archive, and selective marble embedding.
- Real Chromium Forge browser suite passed compiler preview, textures, shared-wall material raycasts, actual Game loading, physical Hall stairs and both house floors.
- Real Chromium stairs suite passed keyboard ascent/descent, continuous arch exit/return, floor eviction/reload and midpoint save/resume (170 sampled frames).
- Real Chromium luxury suite rendered all eleven identities and five detail views, with zero browser errors or undecoded textures. Both before and after use the same environment map and inspection lights.

Reproduce focused checks with `npm run test:forge-luxury`. For browser evidence use `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser:luxury`. To reproduce all tests without changing original CASA files, run the full suite in a disposable copy: the repository's normal preparation scripts rebuild sample archives. Baseline captures additionally require an immutable Pass 1 tree supplied through `FORGE_LUXURY_ROOT` and `FORGE_LUXURY_EDITION=before`.

## Assessment and limits

The upgrade adds actual molded profiles, beveled fields and carved forms shared across more than six identities. It is stylized Victorian architecture, rather than museum-grade carved sculpture. The comparison exposed duplicated coffer edges and a medallion hidden by the central frame; both were corrected before final capture.

Safety takes precedence where openings, artwork, stair spaces or headroom prevent detail. The comparative mansion exercises two-story export and navigation validation; continuous physical stair gameplay is additionally covered by the dedicated browser fixture. Screenshot views use inspection lighting rather than every possible haunting lighting state. Chromium software WebGL validates rendering but does not establish hardware frame rates on a particular Mac. Existing runtime reflection effects and unrelated gameplay object counts were not changed by this architectural pass.

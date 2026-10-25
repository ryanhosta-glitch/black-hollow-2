# Black Hollow Forge — shared component foundation, Pass 1

Development branch: `dev/forge-shared-components-pass1`, based on `4c47d7b`.
No deployment, publication, street/catalog update, archive migration, or student-house rebuild is part of this change.

## Architecture

- `casa_game/room_profiles.mjs` owns the eleven existing identity records and six immutable family configurations. `room_content.mjs` re-exports its existing identity/profile APIs for old callers. Matching of explicit room themes and the structural stair/circulation safety rule is preserved.
- `casa_game/room_components.mjs` registers sixteen shared detail components, their category, existing generator and minimum detail level. It owns selection, exclusive surface claims, deterministic component variants, validation, atomic emission and omission reporting. Generator callbacks remain in the existing content/opulence/ornamentation/reference modules; there is no second set of geometry templates.
- `casa_admin/forge_components.mjs` adds executable Forge adapters for the existing built-in furniture generators, catalog GLB references, material treatment and envelope generator. `planDecoration` selects furniture and emits built-in geometry through these adapters, retaining the same footprint catalog and placement checks.
- `casa_game/room_materials.mjs` centralizes the existing thirty GLB palette indices. `forge_glb.mjs` still exports `MAT`; its numeric values, palette ordering and model-writing contract are unchanged. Material indices are validated before optional detail is committed.

## Family inheritance

| Family | Existing identities | Inherited policy and identity exceptions |
| --- | --- | --- |
| Formal | ballroom, dining, gallery, parlor | Draped wall treatment and parlor finishes; ballroom/dining select ballroom finishes, and dining retains its undraped wall treatment. |
| Private | bedroom, nursery | Draped wall treatment, bedchamber finishes and bronze fixtures; furniture, stories and tabletop objects retain each identity's original selection. |
| Scholarly | library, laboratory | Library finishes and undraped wall treatment; laboratory overrides these with its tile finish, metal ceiling treatment and iron fixtures. |
| Botanical | conservatory | Conservatory finishes, botanical ceiling treatment, bronze fixtures. |
| Funerary | crypt | Stone finishes, votive ceiling treatment and iron fixtures. |
| Circulation | circulation (Passage) | Compact wall decoration and iron fixtures; no floor furniture. Structural stairs keep their previous explicit exclusions. |

All eleven identities retain their original furniture priorities, story/reaction records and labels. Family defaults are resolved first, then identity exceptions. Default detail is `luxury`, preserving the existing visual intent. The three named levels are `essential`, `standard` and `luxury`; detail policy controls optional ornamentation, not room geometry, navigation or furniture-clearance rules.

Example, on a source room:

```js
room.forgeDecoration = {
  detail: 'standard',
  components: {
    'wall-mirror': false,
    'window-valance': { enabled: false }
  }
};
```

Programmatic planners also accept `planDecoration(source, { detail: 'essential' })` and `planRoomContents(rooms, decoration, { detail: 'standard' })`. A room's explicit setting takes precedence. Detail levels cannot be exceeded by setting a component flag to true; unknown component names are reported. The Forge does not insert these options into existing student blueprints.

Variation uses the existing stable room-ID hash rather than randomness or processing order. Reports additionally identify each component instance's deterministic variant. Geometry generators retain their established seeded choices.

## Placement, authored content and duplicate prevention

- Room/furniture dimensions, source blueprints, explicit room identities, doorway sweeps, portal routes, arrival areas, windows, stair exclusions and collision footprints remain authoritative. Generated furniture continues through the existing placement and repair policies; this pass does not add an unsupported-content replacement policy.
- All wall generators share the same occupied-span list and existing `wallMount` aperture exclusions, including reservations for compiled portraits.
- One successful component owns a given tabletop. The story vignette gets first choice; base accessories and opulent table dressing cannot decorate that same support again. Other clear supports can still receive their own tableau.
- Component instance keys prevent repeat emission. Rugs and flush rosettes use distinct base/inlay layers intentionally. Window valances and leaded-glass details similarly occupy separate header/glazing layers.
- A compiled central chandelier now marks the existing ceiling light anchor as owning compiled geometry. The generic lamp-housing builder therefore does not place another housing over it. Existing light-anchor IDs and the Game's bounded light selection are retained.
- Existing authored floor categories are preserved. Explicit `finishes.floor/wall/ceiling/panel/trim` values can select an existing palette name or index; invalid/unsupported references produce `AUTHORED_FINISH_UNSUPPORTED` while the original source record is retained. External custom textures are not newly supported or silently substituted into the palette.

## Geometry and memory budgets

Existing optional room-content caps remain ceilings: 14,000 primitives per house and 420 per room. New conservative caps are 200,000 triangles per house, 10,000 per room and 24 MiB of estimated geometry storage. Callers can lower these via `maxPrimitives`, `maxRoomPrimitives`, `maxTriangles`, `maxRoomTriangles` and `maxGeometryBytes`; raising them cannot exceed the hard limits. Each room receives a fair share, so earlier rooms cannot consume later rooms' allocations.

Explicit triangle primitives count their actual triangles, rather than counting a large curved surface as one cheap box. Geometry storage estimates reserve 108 bytes per triangle for unindexed position/normal/UV data plus 32-bit indices, conservatively covering the existing GLB representation. Shared textures remain counted by the existing package inventory, not repeatedly charged to every component.

Each component emits atomically. If a limit or material/geometry validation fails, its geometry, light/ornament metadata, occupied mounts and surface claims roll back together. Its omission reason is retained. A failed large component does not prevent a smaller later component from using the remaining allocation. Envelope accessories use the same measured mechanism, with their existing feet-based generator coordinates and their own per-floor allocation; structural walls, apertures, floors and navigation remain outside this optional-detail transaction.

New reports:

- `roomContents[].componentReport`: family, identity, detail, variation, per-room limits/usage, emitted component instances and omitted reasons.
- Existing `qa/package_budget.json` gains optional `components` totals, distinct room/scope counts, within-limit status and omissions from room contents and floor-envelope detail.
- Existing room-theme assignment reports gain optional `family`, `detail` and `variant` fields.

These detail estimates complement the existing complete GLB/package audit, which continues to count actual exported models, textures, triangles, instances and draw estimates. They are not FPS or device-memory measurements.

## CASA and Game compatibility

No required archive schema, manifest version, GLB extension, palette index, entry path, navigation record, gameplay role or loading-contract change is introduced. New data consists of optional diagnostic fields inside existing JSON entries. Portable decoration plans still strip primitive arrays after embedding geometry in GLBs. Older archives need no migration, and newer archives load through the existing Game validator/loader.

The current `1.0-qa` / CASA `1.0` versions and `whole-house-1` edition/revision are retained because the Game uses these existing contracts. Gameplay bindings remain explicitly Game-owned and are not falsely marked certified by Forge. Fresh recompilation naturally produces a new archive fingerprint; this task does not recompile, refingerprint or replace published student packages.

## Validation and measured implications

- `npm run test:forge-components`: 39 passing tests, including fourteen new foundation regressions and the existing opulence, completeness, artisan and whole-house checks.
- Full `npm test` in an isolated disposable validation copy: 265 core tests, navigation, real Three.js/GLTF scene loading and complete application-flow checks against existing packages and three fresh Forge exports. All eight Phoenix endings and the Ninth Door remain covered. Test-only sample preparation never runs against the working checkout's archives.
- Read-only baseline comparison against all 23 checked-in CASA archives: no increase in unsupported authored-furniture/decor replacement findings. Aggregate planned room-detail primitives changed from 56,224 to 53,240 (about 5.3% fewer); triangles from 1,384,880 to 1,204,044 (about 13.1% fewer). These are planning comparisons, not rebuilt student archives or runtime FPS claims.
- Strict tests cover all eleven identities, inheritance, stable generation under room reordering, source immutability, authored finishes/furniture, shared generator delegation, detail overrides, triangle/byte accounting, fair house allocations, atomic rollback, material validity, aperture clearance, tabletop ownership and fresh CASA loading/QA.

Real rendered browser evidence and any limitations are recorded below after the final validation run. No test here certifies arbitrary authored stair physics or every possible student layout.

### Rendered browser verification

The existing `tests/browser-forge.mjs` suite passed in Chromium 154.0.8037.57 with software WebGL. It compiled a seven-room/two-floor blueprint through the real Forge UI, downloaded its CASA, decoded embedded PNG/WebP textures, verified distinct shared-wall materials, exercised room/floor/cutaway/collision/haunted-lighting controls, loaded that same fresh CASA into the actual Game, climbed the physical shared Hall stair to 5.25 m and rendered both house floors. The run recorded no page/console errors and no undecoded textures. The library inspection screenshot was reviewed. These checks exercise representative layouts, not every student blueprint or hardware GPU performance.

Final evidence remains local to the disposable validation workspace: `tests/artifacts/report.json` and screenshots there are test outputs, not committed game assets or published houses.

# Forge Pass 3 — heirloom furniture and upholstery

Continues Architectural Luxury commit `47d32987e5662b9eefd87402c39207aba796b625` on `dev/forge-shared-components-pass1`. No deployment, publication, sample rebuild in the development checkout, or student-archive migration is included.

[Open the comparison viewer](evidence/forge-heirloom/index.html). It includes all eleven room identities in a two-story mansion, five detail views, and front/angled/rear studies of nine existing furniture types. A tenth study shows the new side table. Before and after use identical source, cameras and inspection lights. Asset studies are framed from a 1.62 m eye height; the camera turns around each complete model rather than hiding its back. Original PNGs were compressed to WebP without retouching.

## Component inventory

All new geometry flows through the existing furniture catalog, built-in geometry adapter, shared component registry and decoration planner. `forge_heirloom_furniture.mjs` supplies shared turned legs, profiled surfaces, curved rails, folded reliefs, rounded cushions, tufted backs, piping, drawer handles and material batches. `forge_heirloom_style.mjs` supplies deterministic room and authored style resolution. Old built-in/reference entry points delegate to these shared templates; superseded model blocks were removed rather than exported twice.

| Component | Implemented detail |
| --- | --- |
| `tufted_settee`, `settee` | Serpentine crest/apron, carved arms, rounded seat volume, tuft valleys, buttons, piping and turned legs |
| `gothic_armchair`, `armchair` | Pointed/scalloped crests, padded arms, tufted back, turned posts and feet |
| `writing_desk` | Leather writing inset, profiled top, carved apron, paneled drawers, brass pulls and turned legs |
| `bookcase` | Mahogany/oak/ebony variants, cornice, carved stiles, shelf-edge gilding, varied book spines and gilt bands |
| `wardrobe` | Raised doors, drawer/door hardware, carved crest/stiles and turned feet |
| `curio_cabinet` | Glazed frontage, shelves, curated porcelain/silver vessels, cornice and carved stiles |
| `dining_table` | Profiled top, apron, brass accents and turned legs |
| `banquet_ensemble`, `supper_table` | Shared pedestal vocabulary, upholstered chairs facing the table, runner and place settings inside the existing ensemble reservation |
| `bed`, `gothic_headboard` | Four turned posts and finials, open canopy frame, curved crest, tufted headboard, rounded mattress and pillows, contrasting coverlet |
| `marble_fireplace`, `mahogany_fireplace` | Reuse Pass 2 carved mantels and append an inset decorative screen |
| `console` | Profiled top, carved apron, drawers/pulls, four turned legs; supports occasional-room arrangements |
| `side_table` | New compact 0.50×0.50 m, 0.65 m high variant using the shared table generator; supported for authored placement without adding it automatically |
| `grandfather_clock` | Turned side columns, framed dial with markers/hands, glazed pendulum opening, carved cornice and brass details |

Specialist laboratory benches, plant stands, urns, sarcophagi and coffin cabinets retain their existing generators. Eighteen heirloom type identifiers use the shared upgrade, including alternate seat/table and fireplace variants.

## Room styling and composition

Existing room-family furniture lists and candidate placement order remain authoritative. The upgrade changes appearance without increasing furniture counts. A parlor still receives its seating/hearth/desk ensemble, a library its bookcases/writing furniture, a ballroom its settees/clocks/consoles, and a bedchamber its bed/wardrobe ensemble.

| Identity | Default finish and upholstery |
| --- | --- |
| Ballroom | Preserved ebony, claret upholstery, gilded details |
| Parlor | Preserved mahogany and claret upholstery |
| Library | Aged mahogany veneer, black leather, tarnished brass |
| Dining | Preserved mahogany and emerald upholstery |
| Gallery | Preserved ebony and midnight blue upholstery |
| Bedchamber | Oak, midnight blue upholstery and ivory bedding |
| Nursery | Painted wood, ivory upholstery/bedding and restrained palette |
| Conservatory | Painted wood, emerald upholstery and aged metal |
| Laboratory | Oak, leather and aged metal |
| Crypt | Worn mahogany and ivory accents |
| Passage | Oak, claret and aged metal where furniture already fits |

Stable room identifiers select a small carving pattern variation. Authored furniture may override `furnitureStyle` fields: `wood` (`mahogany`, `ebony`, `oak`, `painted`, `aged`), `upholstery` (`claret`, `emerald`, `blue`, `ivory`, `leather`), `condition` (`aged`, `preserved`), `ornament` (`essential`, `standard`, `luxury`) and integer `pattern`. Unsupported fields/values produce `AUTHORED_FURNITURE_STYLE_UNSUPPORTED`; their original source records remain preserved. Explicit marble/mahogany fireplace choices keep their existing finish contract.

## Placement, collision and compatibility

No existing furniture footprint or height was enlarged. Real triangle vertices were tested at three rotations against the unchanged specifications, including floor contact. Portal routes, door sweeps, window exclusions, stair reservations, arrival areas and discovery approach anchors continue to use the existing planner. The new side table passes that same planner. Nothing bypasses clearance checks to make a room look fuller.

A read-only comparison against Pass 2 verifies identical furniture IDs/types/positions/rotations, collision rectangles, reserved areas and replacement findings for **23 existing archive source blueprints plus 33 profile/room-size cases**. See [placement compatibility data](evidence/forge-heirloom/placement-compatibility.json). All 23 original CASA files also remain byte-for-byte unchanged; their pre-pass SHA-256 inventory is included with the evidence.

No CASA manifest schema/version or Game loading contract changed. Existing archives load their original GLBs and need no migration. The Game retains its legacy bed-curtain filter for old archives; styled bed headboards are exempt so authored claret upholstery remains visible. New bookcases own their carved stiles/cornices, suppressing the former envelope overlay to avoid detached or duplicate trim. New archives use existing `builtIn`, `model`, placement and rotation fields. Optional `furnitureStyle` and `qa/heirloom_furniture.json` are additive diagnostics/configuration. Palette indices 0–30 retain their Pass 2 values; indices 31–36 append painted wood, emerald/blue upholstery, oak, aged mahogany and preserved gilding. Existing embedded grain maps are reused; no new remote texture/model dependency or runtime shader was introduced.

## Reuse, limits and measured cost

Built-in furnishings remain material-batched in the existing decoration GLB, avoiding one draw per knob, leg or cushion. Catalog furniture uses one local GLB per type/style key, referenced by repeated placements. The Game's existing template cloning shares geometry/material resources. Local generator templates use a bounded 32-entry cache; returned coordinates and bounds are copied, so callers cannot mutate cached templates.

Each template enforces at most **6,000 generated triangles and eight material groups**. The inventory reports conservative generated triangle totals, including zero-area lathe pole triangles that the GLB writer discards; export inventory and rendered counts are lower. Essential detail omits buttons, gilded piping and carved rosettes and reports `DETAIL_POLICY`. No templates exceeded limits and no budget omissions occurred in the combined luxury study. Existing room-content/envelope budgets continue to apply separately; the package inventory remains the source for full exported cost.

The added finish variety has a measurable storage cost. Rendering reductions are strongest for previously expensive seating; beds, bookcases and display pieces become more detailed and can increase work in their rooms. These measurements are not a claim of improved frame rate on every computer.

| Combined two-story mansion | Pass 2 | Pass 3 |
| --- | ---: | ---: |
| Compressed CASA bytes | 4,729,304 | 5,366,708 |
| Export inventory bytes | 20,120,703 | 21,086,663 |
| Unique catalog furniture GLBs | 3 | 10 |
| Catalog furniture GLB bytes | 264,220 | 1,481,040 |
| Decoration GLB triangles | 127,318 | 122,974 |
| Decoration GLB material draws | 17 | 23 |

Compressed archive size rises 13.5%; expanded inventory rises 4.8%. Catalog variants account for most of the extra storage. They intentionally retain distinct finishes rather than silently sharing the wrong room style. Portable textures remain embedded per unique GLB; this pass does not implement cross-asset texture deduplication. Repeated instances of one model share its geometry and materials.

| Player room view | Pass 2 draws / triangles | Pass 3 draws / triangles |
| --- | ---: | ---: |
| ballroom | 53 / 109,722 | 54 / 98,314 |
| parlor | 59 / 111,134 | 55 / 99,416 |
| library | 56 / 109,864 | 51 / 98,456 |
| dining | 77 / 113,508 | 77 / 107,978 |
| gallery | 82 / 114,598 | 73 / 107,964 |
| conservatory | 69 / 112,758 | 64 / 103,932 |
| bedroom | 45 / 50,860 | 46 / 56,630 |
| nursery | 38 / 49,260 | 40 / 53,808 |
| crypt | 29 / 46,330 | 32 / 46,704 |
| laboratory | 76 / 54,972 | 70 / 62,534 |
| circulation | 53 / 51,616 | 51 / 58,478 |

Counts include the visible loaded floor, not only the named room. Isolated model studies below include one neutral ground-plane draw and two triangles.

| Model study | Pass 2 draws / triangles | Pass 3 draws / triangles |
| --- | ---: | ---: |
| tufted_settee | 3 / 5,846 | 4 / 2,466 |
| gothic_armchair | 4 / 4,098 | 4 / 2,342 |
| writing_desk | 5 / 1,066 | 4 / 1,104 |
| bookcase | 9 / 878 | 6 / 1,850 |
| wardrobe | 5 / 674 | 3 / 918 |
| bed | 5 / 746 | 5 / 2,608 |
| curio_cabinet | 6 / 554 | 7 / 1,862 |
| grandfather_clock | 6 / 302 | 6 / 1,066 |
| banquet_ensemble | 8 / 5,726 | 6 / 5,130 |
| side_table | New asset | 3 / 982 |

[Machine-readable component inventory](evidence/forge-heirloom/component-inventory.json) includes specifications, generated/exported triangles, material draws and representative GLB bytes for all eighteen types.

## Validation and visual findings

- **291/291 core tests passed**, with zero failures/skips, followed by passing navigation, actual Three/GLTF scene loading and Game flow suites against shipped archives and three fresh Forge exports. Full preparation/rebuilding ran only in `/tmp/forge-heirloom-validation`.
- Eleven new heirloom tests cover all upgraded types, three rotations, floor contact, material/geometry limits, eleven profiles at three room sizes, authored styles, deterministic placement/model reuse, cache isolation, dimensional upholstery, essential-detail omissions, append-only materials, the combined two-story archive and upholstery cap winding.
- The focused heirloom/foundation/luxury/completeness/opulence suite passed **51 tests**. Existing reference tests now inspect actual triangle detail instead of requiring many separate primitive objects; original collision assertions remain.
- Chromium Forge browser regression passed actual UI compilation/download, texture decoding, preview/cutaway controls, material raycasts, Game loading, physical Hall stair ascent and both floors.
- The existing actual-Game reference browser suite also passed Hall, bedchamber, dining, cabinet, seating, lantern, library, facade and grounds views with bounded draws and no shader errors; [results](evidence/forge-heirloom/game-reference-browser.json).
- Chromium heirloom study produced **43 before and 46 after captures**, zero browser errors and zero undecoded room textures. All eleven room identities are present. Existing models have three inspection angles; the new side table has three after-only views.
- Inspection caught overly tall crests and inward-facing cushion caps. Crest dimensions were reduced to existing specifications; cap winding and smooth upholstery normals were corrected. Dining-chair back cushions were moved clear of the carved backing field and oriented toward the table after angled views exposed clipping and an outward-facing pad. Focused normal-direction and back-panel clearance tests prevent the shading and clipping defects from returning.

[Full regression output](evidence/forge-heirloom/full-regression.txt), [focused output](evidence/forge-heirloom/focused-regression.txt), [Forge browser results](evidence/forge-heirloom/forge-browser.json) and before/after JSON reports are committed with the images.

Reproduce focused checks with `npm run test:forge-heirloom`; capture after views with `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser:heirloom`. Baseline comparisons use a Pass 2 source snapshot via `FORGE_HEIRLOOM_ROOT` and `FORGE_HEIRLOOM_EDITION=before`. Full `npm test` prepares sample houses, so run it in a disposable copy to preserve original CASA files. The browser suite is registered in the existing Forge test workflow; deployment workflows remain untouched.

## Assessment and limitations

Furniture has more recognizable structural silhouettes and upholstery volume, with room-specific finishes and ensembles. Curved carving is stylized and deliberately low polygon; this pass does not claim photorealistic fabric simulation, bespoke sculpted acanthus, cloth physics or animated furniture. Glazed cabinets use the existing transparent material; aged appearance comes from veneer/material treatment and tarnished metal, not additional per-pixel wear shaders.

The open canopy replaces heavy blanket-like side panels, preserving player visibility. Mantels retain Pass 2 geometry and explicit finishes; their upgrade is the decorative screen. Specialist crypt, laboratory and botanical props retain established identities rather than receiving generic salon models. The new side table is available to authored blueprints but is not automatically inserted into existing ensembles.

Screenshots use controlled inspection lighting and software WebGL, not measured Mac hardware frame rates. Some smaller furnishings gain geometry and six additional shared material groups appear in the combined decoration model. The overall tradeoff is documented above; strict per-template caps, unchanged placement counts, batching and existing package reporting bound the work without promising that every room becomes cheaper to render.

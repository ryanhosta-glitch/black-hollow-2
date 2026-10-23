# The Gilded Nocturne

The supplied mansion exterior, haunted bedchamber and double-stair hall are the visual target. This pass improves the real playable scenes. It does not claim photographic parity with those references.

The hall uses a Versailles parquet surface above the previous tile geometry, dark wood on the original shell and stair surfaces, relief panels on the end wall, coffer and dentil detail, and carved rail accents. The existing stair walking surfaces, elevator and door portals remain authoritative. Low floor decorations from the legacy hall are hidden to prevent intersections with the replacement floor finish.

Imported Forge materials receive restrained bump relief from their existing maps. Claret bedchamber walls receive a new damask texture; bed canopies receive folded curtains, valances, tufting and quilt relief within their compiled footprints. Ceiling fixtures are decorative and add no dynamic lights. There is one shadow-casting point light in interiors and a shared pool of three lights (static shadow maps update only on scene/light changes), with intensity/range sufficient for the large hall. A small procedural reflection environment gives metal a readable surface. Small screens and software WebGL renderers omit point shadows; the reference capture explicitly exercises the shadow path. Indoor fog is reduced; outside uses a continuous procedural cloud vault. Decorative cemetery trees are replaced at the same Forge-planned anchors by a single tapered-branch instance batch; ground colliders are unchanged.

## Assets

`casa_game/assets/materials/nocturne-damask.webp` and `nocturne-parquet.webp` were created with the built-in image generation tool and optimized to 1024px WebP for this project. They are material maps, not rendered-room backdrops.

Damask prompt: “Seamless square albedo material texture for real-time 3D Gothic mansion wallpaper; detailed antique Victorian damask, deep crimson wine textile, muted antique gold botanical acanthus and fleur-de-lis weaving, orthographic material scan, even diffuse illumination, fine silk threads, subtle age wear; texture only, no room, objects, text, border or vignette.”

Parquet prompt: “Seamless square PBR albedo texture; orthographic top-down scan of antique French Versailles parquet flooring, medium dark walnut and oak, interlocking diagonal strips in square panels, realistic wood grain, subtle age wear and dark joints; flat evenly lit surface only, no baked reflections, perspective, objects, text or border.”

## Verification

`tests/browser-reference.mjs` renders hall, bedchamber and grounds views from the actual application using real WebGL, rejects shader/page errors, checks a bounded number of draw calls and the batched planned trees, and saves screenshots and render counts as CI artifacts. These camera compositions are test-only. Scene tests validate the grounds in world coordinates, including instances. Existing navigation, fresh Forge compilation, bulk import, story and mobile suites remain required.

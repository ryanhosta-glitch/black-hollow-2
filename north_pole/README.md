# The Confectionery — Christmas Forge foundation

First working export milestone for North Pole. Existing Black Hollow entry points, published houses and save data are retained.

## Run

Install dependencies using `npm ci --ignore-scripts`, run `npm run test:gingerlight`, then `npm run build:gingerlight`.

Serve the repository and open `north_pole/forge.html`, or open the generated `north_pole/gingerlight_studio_standalone.html` directly. The source page uses the same Three.js CDN as Black Hollow. The standalone release embeds its code, renderer and assets and requires no network access. The Pages workflow builds and publishes both.

Load `.haunt`, `.casa`, or an exported `.ginger`. CASA import uses the repaired blueprint when present and retains its permanent property ID. Direct haunt identity uses the same pretty-JSON-plus-newline hash as the existing Forge. Importing a `.ginger` previews it; changing its baked treatment requires the original haunt/CASA.

## What this pass builds

Exposed, opening-aware cookie walls; existing roof construction; gingerbread porch geometry; dimensional royal icing, drips, swags and scrollwork; gable peppermint rosettes; roof-edge candies; wreaths, bows, candy posts and snowy topiary. Three palettes and three density levels. Interior floors, furnishings, elevators and quest data are excluded. Procedural cookie grain is generated locally by the viewer.

The `.ginger` JSON contains a self-contained GLB, meter-based attachment polylines, ground bounds, permanent identity, source and exterior hashes, and a checksum covering the complete package. Checksums detect accidental edits; they are not signatures proving authorship. Original source data is not overwritten.

Window/door outlines and exposed wall eaves have source-based feature IDs. Roof-union edge IDs depend on the compiled geometry order; all attachment coordinates are bound to the exact exterior hash. Rebuilding a house produces a new exterior version. Future light-show import must reject incompatible versions rather than guessing a remap.

## Limits

This is the exterior preparation and preview milestone, not the completed student lighting editor or sleigh game. No DMX, songs, timeline, math assessment or live North Pole street is implemented in this pass. Google Sites embedding and school hardware remain acceptance checks. Geometry follows the supplied room and roof layouts; the reference images are art-direction goals, not a claim of photographic fidelity. Free-form authored tower shapes and custom roof objects are limited by the existing Forge roof conventions. Very large or highly detailed houses may exceed the 32 MiB model export budget.

Permanent decorations stay against the building; roof/window paths can be overlaid in pink. The yard provides a visual stage, but future equipment placement still needs clearance checks. No animation or preset choreography substitutes for students' future lighting work.

## Verification

`tests/ginger-forge.test.mjs` covers source preservation, shared-wall exclusion, finite geometry, stable attachments, package roundtrip, identity parity, corruption rejection and opt-in palette behavior. `tests/browser-gingerlight.mjs` tests the generated standalone file with HTTP/HTTPS traffic blocked, including style changes, download and reopen. Run the browser test after installing Chromium with the repository's Playwright dependency.

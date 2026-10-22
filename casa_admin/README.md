# House Office

Open `casa_admin.html` on the game's GitHub Pages site. Compile a `.haunt` in the embedded Forge, or select a `.casa`; review the findings, download a backup and test in the game. Connect a short-lived fine-grained GitHub token scoped to this repository with Contents read/write. Review and confirm publication or removal. Tokens remain in the password field in tab memory, never in storage, URLs, files or logs. Disconnect clears the field.

The page writes CASA and catalog in one non-forced commit to main. Concurrent changes require a fresh review. Git history retains removed houses; deployment status is linked. GitHub branch protections may require repository-specific approval; the page surfaces API errors and does not bypass protections. Browser-local test imports are separate from permanent houses and remain on that browser after publication/removal.

Limits: 32 MiB source blueprint, 128 MiB local CASA import, 95 MiB permanent publishing (below GitHub's 100 MB blob limit). Static compilation is not runtime certification. Review displays package findings and requires a playtest acknowledgement. No token is needed to compile or test.

Compiler and dependencies are vendored from Black Hollow Forge's clearance/access compiler snapshot (head 5675b772f98f516dcfb372624806bc50a30da38b); this does not change the game runtime or original index.html. The Administrator now embeds Forge 4.2. Architectural GLBs have outward winding, UV coordinates, embedded PNG finish textures, opening-aware siding and window frames, wainscoting and ceiling coffers. Roof GLBs contain closed gable, hip or mansard solids, fascia and chimney details. The street model includes all authored floors and the roof. Intersecting roof unions, porches and arbitrary authored stair physics are still unfinished. See FORGE_DEVELOPMENT.md for verification and limits.

Verification: publisher tests cover atomic publication/removal, allowed paths, size limits, and stale-head rejection. Compiler was exercised with a disconnected-room blueprint and the resulting CASA accepted by the game archive validator. Existing navigation, scene and full quest tests pass. Cloud browser WebGL is unavailable; rendered playtesting remains required.

Build a CASA, then select **Open 3D inspection** inside Forge. Inspect the complete exterior or select a floor. Floor views default to a cutaway; disable it to inspect full walls and ceilings. The preview uses the Game archive validator and resource loader. It does not publish anything. Browser WebGL is required, using the same Three.js CDN dependency as the Game.

Run `npm ci --ignore-scripts && npm test`. The suite recompiles the three shipped blueprint fixtures in memory and plays through the actual Game against both existing and fresh packages. Published CASA files are never rewritten by these tests.

Pass 2 (Forge 4.3) adds room-specific finishes, lower-wing roofs and convex roof union surfaces, optional dormers/tower lanterns, entry porches with post colliders, and richer inspection controls. Use Floor visibility to hide stories or the roof; select a floor and room for eye-level views. Collision guides show blue wall bounds, amber furnishing bounds and purple elevator boarding areas. Material diagnostics list texture dimensions, roughness and metalness. Stair warnings remain explicit: arbitrary authored stairs still use the elevator bypass. `qa/vertical_geometry.json` records measured alignment and run/headroom evidence.

Actual rendering is now covered by `npm run test:browser` (requires a Playwright Chromium install or `CHROMIUM_PATH`). Screenshots and its report are captured by CI as `forge-browser-evidence`; they do not publish or replace houses.

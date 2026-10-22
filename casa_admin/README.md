# House Office

Open `casa_admin.html` on the game's GitHub Pages site. Compile a `.haunt` in the embedded Forge, or select a `.casa`; review the findings, download a backup and test in the game. Connect a short-lived fine-grained GitHub token scoped to this repository with Contents read/write. Review and confirm publication or removal. Tokens remain in the password field in tab memory, never in storage, URLs, files or logs. Disconnect clears the field.

The page writes CASA and catalog in one non-forced commit to main. Concurrent changes require a fresh review. Git history retains removed houses; deployment status is linked. GitHub branch protections may require repository-specific approval; the page surfaces API errors and does not bypass protections. Browser-local test imports are separate from permanent houses and remain on that browser after publication/removal.

Limits: 32 MiB source blueprint, 128 MiB local CASA import, 95 MiB permanent publishing (below GitHub's 100 MB blob limit). Static compilation is not runtime certification. Review displays package findings and requires a playtest acknowledgement. No token is needed to compile or test.

Compiler and dependencies are vendored from Black Hollow Forge's clearance/access compiler snapshot (head 5675b772f98f516dcfb372624806bc50a30da38b); this does not change the game runtime or original index.html. The admin compiler exports all floors plus roof into the street preview and shares the game's portrait assets. Its geometry remains QA architecture, not a finished artistic façade. Compiler version changes should be deliberate and retested.

Verification: publisher tests cover atomic publication/removal, allowed paths, size limits, and stale-head rejection. Compiler was exercised with a disconnected-room blueprint and the resulting CASA accepted by the game archive validator. Existing navigation, scene and full quest tests pass. Cloud browser WebGL is unavailable; rendered playtesting remains required.

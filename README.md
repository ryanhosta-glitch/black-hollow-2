# Black Hollow · The Unwritten Night

The production game is [casa_game.html](casa_game.html). The root [index.html](index.html) redirects there, preserving bookmark parameters and fragments. The [House Office](casa_admin.html) compiles and publishes student mansions.

The Blueprint authors `.haunt` files. The Forge compiles their architecture, finishes, furnishings, navigation and reports into `.casa` archives. The Game loads those prepared mansions; it does not rebuild blueprints during play. Eight haunting families, choice-dependent endings, relics and the town's Ninth Door connect the individual mansions.

## Run and test

Use `npm ci --ignore-scripts`, then `npm test` for the maintained runtime, Forge, publication, navigation and scene checks. Serve the repository with `python3 -m http.server 8000 --bind 127.0.0.1` and open the root URL. Three.js 0.170.0 loads from its CDN; use an HTTP server and a WebGL2-capable browser.

For real browser checks, install Chromium with `npx playwright-core install chromium`, then run `npm run test:browser`. GitHub Actions runs each browser suite separately and retains its evidence. The game targets a bounded drawing buffer and 30 Hz rendering; hardware frame rates still need testing on players' devices.

## Publish

A successful full CASA Forge regression run on `main` triggers GitHub Pages through `.github/workflows/pages.yml`. The workflow copies the committed house archives and catalog unchanged, builds the portable Christmas Forge tools, and publishes the Game and House Office. It does not rebuild mansions or rewrite the catalog. See [Midway Beta release and rollback](docs/HAUNTED_MIDWAY_BETA_RELEASE.md) for the recorded rollback procedure.

Upload all student blueprints together in House Office's Mansion Foundry. Preparation is sequential, resumable on the same browser, and reports failed houses individually. Prepared mansions publish with one catalog change and one non-forced Git commit. A repository-scoped Contents read/write token is needed only for permanent publication. Local Game imports also accept class-sized selections and never upload files.

See [the Game guide](CASA_GAME_README.md), [House Office guide](casa_admin/README.md), [haunting rules](docs/phoenix/README.md) and [town consequences](docs/living-street/README.md).

## Historical engine

The pre-CASA v8 engine is retained in `archive/black-hollow-v8.html` for reference. It and its old root assets are not deployed. `npm run test:legacy` runs its historical source checks separately. The explicit option to resume an existing original investigation save in the current Game remains supported; it is independent of that retired standalone engine.

# Isolated Haunted Midway Beta preview

The Beta remains the third game option. This package is a complete static test copy, with a visible Beta notice. It does not replace the production GitHub Pages site. The Midway includes the park, ghost boarding/unloading, signature shows and haunted-elevator transfers; hardware playtesting and further cinematic polish remain.

The `Build isolated Midway Beta preview` workflow runs on `dev/haunted-midway` pushes. It tests the route/vehicle system and uploads `haunted-midway-beta` as a downloadable Actions artifact. It has read-only repository permissions and no Pages/deployment steps. The production Pages workflow is separately gated on successful main regressions; a development preview cannot publish it. This artifact is **not a hosted URL**.

To host the preview without changing production:

1. Open the repository Actions tab, select the latest successful **Build isolated Midway Beta preview** run, and download **haunted-midway-beta**.
2. Extract the ZIP. The site root must contain `index.html`, `casa_game/`, and `casa_admin/`.
3. Sign in to Netlify and use its manual deploy / Netlify Drop to upload that extracted folder as a **new site**. Do not select an existing production site or custom domain. Another independent static host is also suitable.
4. Open the new preview URL and choose **The Haunted Midway · Beta**. Board from a mansion porch. Test a full ride, haunted elevator, pause, return, and both existing modes.

Use a separate hostname so browser-local saves and settings are isolated from production. Do not manually run the existing GitHub Pages workflow for this preview: that workflow targets the live site and rebuilds the reference mansion/catalog. The preview copies existing catalog/archive bytes without modifying them and does not include the administrator HTML entry page; administrative modules remain because the ride worker depends on them. The package contains the repository's existing published houses and should be shared as a test copy, not used to replace original submissions.

Local build:

```sh
node tools/build-midway-preview.mjs /tmp/haunted-midway-beta
python3 -m http.server 8080 --directory /tmp/haunted-midway-beta
```

Visit `http://localhost:8080`; opening HTML via `file://` does not support the required workers/modules. Three.js still requires CDN access, as in the existing game. Build outputs must be new directories outside the checkout. SHA-256 verification protects the current production archives/catalog, recorded in `docs/evidence/midway-release/protected-originals.json`, before and after packaging. The preview also includes the current Christmas Forge files; run `npm run build:gingerlight` before packaging to include its downloadable standalone tools. `preview-build.json` identifies the source commit.

GitHub API access is blocked in the current Codex environment. A live independent site cannot be created/configured here; uploading this prepared artifact to a new host is the remaining deployment step. Nothing should be described as hosted until the resulting URL is verified.

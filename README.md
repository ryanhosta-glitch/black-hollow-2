# Black Hollow 2 — The Cartographer's Secret

A static Three.js/WebGL2 game, ready to host on GitHub Pages. No build or package installation is required.

## GitHub Pages

1. Commit and push `index.html`, `assets/`, and `.github/workflows/pages.yml` to `main`.
2. In the repository's **Settings → Pages → Build and deployment**, select **GitHub Actions**.
3. Run **Deploy GitHub Pages** from the Actions tab, or push to `main`.

The workflow publishes only the game and its assets. Relative asset URLs support GitHub Pages project subdirectories and custom domains.

## Local development

From the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open the served site in a WebGL2-capable browser. Use an HTTP server rather than opening the HTML directly. Internet access is required for Three.js 0.180.0 from `cdn.jsdelivr.net`.

## Hosting optimization

Portraits and elevator audio are stored as binary files in `assets/` instead of base64 strings in the HTML. Content-based filenames allow browsers to reuse cached assets and change automatically when asset contents change. Keep the asset directory alongside `index.html` when uploading or downloading the game; the HTML is no longer a standalone file.

The embedded Ranger Wraith model remains in the HTML to preserve its existing loader behavior. This change reduces HTML transfer and base64 overhead; it does not claim improved rendering FPS.

For release details and manual gameplay checks, see `BLACK_HOLLOW_2_v8_5_19_README.md` and `BLACK_HOLLOW_2_v8_5_19_QA_REPORT.md`.

## Runtime performance

Performance mode limits the 3D drawing buffer to at most 1280×720 pixels; Cinematic mode uses at most 1920×1080. The UI remains at the window's native size. Active gameplay retains its 30 FPS target. Story dialogs draw the frozen scene once instead of continuously rendering it; resizing or returning to the tab refreshes that frame. Music selection runs at 10 Hz, and hidden tabs skip music-selection and nearby-choice updates. These changes reduce avoidable work; the detailed scene still has a substantial draw-call cost during exploration.

Run the rendering regression checks with `node --test tests/performance.test.cjs`.

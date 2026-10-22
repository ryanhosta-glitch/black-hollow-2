# Black Hollow — CASA Edition

A separate game entry point: **casa_game.html**. The original index.html remains untouched.

The new runtime reads prepared CASA archives. It never imports the original game script, reads source.haunt, repairs a blueprint, or generates house walls/roofs/furnishings. The game owns the street, characters, atmosphere, interactions and story. Forge owns the house assets and contracts.

## Play

Serve this directory over HTTPS or localhost:

```
python3 -m http.server 8000
```

Open `http://localhost:8000/casa_game.html`. Internet access is needed for Three.js on its first load. No build or npm install is needed to play. WebGL and a modern browser supporting native ZIP Deflate/Gzip decompression are required.

Walk Haunted Hollow Street. Read a mailbox, then approach its porch and interact to enter. Use the entrance behind the Hall spawn to enter the main house, or climb either staircase and walk inside the upper elevator cabin. Its destination panel opens automatically once inside; returning does not immediately board again. Explore the house and approach its apparition.

W/S walk, A/D turn, drag to look, V changes camera, E interacts, M opens your discoveries/map, Escape pauses. Visible buttons also support interactions and touch movement. Pause and dialogue preserve player position and direction. Sound/voices can be disabled independently. Reduced-motion settings disable lightning.

## The four parts of the game

1. **The living house:** spiders and rats react and scurry; hanging fixtures use a fixed pool of three nearby point lights; the shared Hall hearth burns; prepared house fireplace anchors can also receive flames. Street/grounds have rain and restrained single lightning flashes, separated by 32–77 seconds. Original organ tracks crossfade for entrance, exploration and encounters; pickups, the lift and completion have organ cues. Thunder/elevator effects have independent audio paths and do not stop the soundtrack. Paused scenes render once and then idle.
2. **The dead:** the original Ranger Wraith is recovered as a separate compressed asset. Three additional procedural spirit forms can haunt the house/grounds. Founder and Seer portraits reuse the original artwork and speak through optional browser speech synthesis. Compiled decorative portraits whisper history. Grave inscriptions connect the cemetery to the current case. These are fictional generated histories, not biographies.
3. **The investigation:** six seeded story cases, varied keepsake assignments and ghost appearances, persistent progress, and a complete ghost → Founder → Seer → three keepsakes → Founder → Floor 13 → thirteen distinct narrative echoes and memory journal → Founder/map reward → street loop. New investigations get new seeds; reopening resumes the saved mystery rather than silently changing it. One-room houses stage objects sequentially at a safe interaction point instead of stacking them. The default prepared Floor 13 space is the Conservatory, with thirteen memories; this release does not invent thirteen architectural rooms.
4. **The street:** mailbox names/descriptions come from CASA metadata. Only the two nearest house previews load. Published houses are cataloged from CASA files; players can also add local houses that persist in IndexedDB on their device when available. Local imports are never uploaded. Old packages missing the elevator/navigation contract must be recompiled in the current Forge.

## Publish houses for everyone

Put compiled `.casa` files in `casa_game/houses/` and run:

```
node tools/build-casa-street.mjs
```

The Pages workflow runs this automatically. It reads package metadata and writes street.json; it does not convert blueprints. Permanent house IDs must be unique. The repository includes prepared Moonveil and one-room demonstration packages. Their source architecture comes from the Forge's test fixtures; demo identity IDs are distinct.

Deployment copies casa_game.html and casa_game/ alongside the existing original game and assets. After publishing, the new entry is `/black-hollow-2/casa_game.html`.

## Loading and performance

CASA ZIP directories are validated with size limits, path isolation, CRC and available SHA-256 inventory checks. Stored and Deflate entries are supported. Metadata and requested models are decoded lazily. External GLB asset references are rejected; images resolve inside the same package. The source blueprint is archival only.

One house floor is resident in the floor streamer. Signature Hall/Conservatory pocket scenes are independent reusable assets; returning to the street releases the house scene resources. Models use the Forge's meter coordinates directly; navigation contracts in feet are converted explicitly. Texture dependencies remain in the archive. Furniture instances use shared templates on the active floor. Artwork is filtered to its floor; precompiled decoration triangles are filtered without rebuilding architecture. Street solids and lamps are instanced. Signature camera checks use simple proxies instead of raycasting every botanical ornament. The drawing buffer is capped near 1280×720 with a 30 FPS target. These are budgets and design choices, not measured player-device FPS claims.

Floor models are still the Forge's render chunks. Very large single-floor models need smaller Forge chunks for finer streaming. Complete street previews are used directly. For older exports that copied only the basement into their preview, the runtime composes the already compiled floor models and roof as an exterior fallback. This separate outdoor representation contains no added interior props and is released on house entry; at most two street exteriors are loaded. The cemetery filters interior fixtures from the shared decoration mesh and adds a visible terrain surface. Forge should export a dedicated full exterior mesh for large estates. Unverified authored stairs remain sealed and use the compiled elevator fallback. No new free-form stair solver is introduced.

## Validation and limitations

Passed:

- Stored/compressed archive loading, corruption/hash/path/duplicate failures and current-format compatibility.
- Complete quest progression, one-room support, replay/save restoration, location/height/scene checks, concealed Floor 13 and map reward.
- One-floor cache residency, deduplicated/cancelled loads and resource disposal.
- Actual application code executed with a simulated DOM/renderer and real Three.js geometry: street → Hall → cabin → house → complete quest → 13 spatial echoes → map → saved completion → street. Also checks cabin cancellation, Escape, direction preservation, one-room staging and paused rendering.
- Real GLTFLoader parses the compiled floors, filtered artwork and signature metadata, plus the recovered original ghost. Image decoding in CPU tests is stubbed; this is not visual validation.
- Physical-door/navigation regressions and existing original-game performance regressions.

Run:

```
node --test tests/casa-game.test.mjs tests/performance.test.cjs
node tests/casa-navigation.test.mjs /path/to/three.module.mjs
node tests/casa-scenes.test.mjs /path/to/three.module.mjs /path/to/GLTFLoader.mjs
node tests/casa-flow.test.mjs /path/to/three.module.mjs /path/to/GLTFLoader.mjs
```

This is a complete playtest build of the new runtime, not a claim of fully certified geometry or device performance. The Work browser has previously failed to create a WebGL context; a rendered playthrough, sound/voice checks and phone testing remain required. Legacy optional minigames and every old decorative effect have not been copied wholesale. They can be added as CASA-driven game modules without bringing back the old house generator.

Playtest fixes: wandering spirits use continuous folded fabric with a rounded hood and flowing hem; reduced motion keeps the cloth still. The game HUD hides the shared inspector labels and director switch. Tests now walk both Hall stairs continuously into the cabin, and exercise the authored main-house entrance. Rendered WebGL and audible checks remain unverified in this environment.


## The Haunting Update — seven completed implementation passes

1. **Street:** generated pavement/stone/soil textures, wet patches and drain grates, instanced tall branching trees, garden fences, mailbox numbers, correctly oriented front/rear sign faces, moon, clouds, low mist and seven animated bats. Static collision remains independent of surface cracks. Only two nearby exterior models load.
2. **Living house:** rats gain heads, noses and moving legs; spiders articulate their legs; hearths gain logs and ash with restrained crackle. Surface-specific footsteps, filtered wind/interior ambience, spatial encounter effects and organ cues remain independent of thunder. Three point lights remain the fixed pool.
3. **Dead:** folded cloth wandering spirits with different proportions and motives; fourteen existing optimized portraits with contextual conversations and saved visit counts; graves connect to the active story. Encounter sequences persist and enforce quiet intervals.
4. **Investigation:** testimony, history, signal interpretation and keepsake examination puzzles have seeded choice order, safe retries and progressive hints. One-room staged play and the complete Founder/Seer/keepsakes/Floor 13/map/return loop remain intact. The Hint button identifies the current objective room. The new Split Lantern CASA tests disconnected-room elevator access and is a third playable sample.
5. **Explorer:** rounded anatomy, facial features, tailored coat/waistcoat/collar/cravat, cloth texture, buttons, hands and boots. A fitted lathed top hat belongs to the head hierarchy. Knees, speed-adjusted stride, arm motion and idle breathing preserve the original collision controller and camera modes.
6. **Haunted interiors:** three-second exposure settling, muffled ambience, wall-hugging drapes, overhead webs, dust, themed wall tableaux and conservatory vines. Portrait movement, spectral mirror silhouettes, pendulums and very slight existing-chair rocking respond to bounded events. Cosmetic additions do not add obstacles or alter authored architecture. Reduced motion suppresses cloth, bat, cloud, mist and reaction movement.
7. **Large CASA imports:** up to 128 MiB compressed, with existing 256 MiB expanded / 64 MiB per-entry / 4,096-entry archive caps. Browser workers validate imports away from the main UI; phases and package size are reported. Files are retained as Blobs and decoded on entry. Add houses is available during play, with accurate session-only storage notices. The old 5 MB guard found in Forge applies to its **haunt blueprint** input, not this game's CASA importer. Import CASA here; do not pass it to the blueprint compiler.

### Validation and practical limits

Nineteen Node unit/performance tests pass, including valid 6 MiB and 20 MiB imports, oversized/corrupt failures, session-only storage, all puzzle families, save replay and encounter pacing. Navigation regression, real Three/GLTF scene tests, and production application code with a simulated renderer pass. Integration tests walk both Hall stairs, enter the compiled main-house entrance, complete Moonveil and Split Lantern investigations, and check compact one-room staging. Scene tests verify sign face orientation, hat hierarchy, character bounds, stable effect counts and reduced motion.

The current cloud browser cannot create a WebGL context. Rendered appearance, audible mixing and actual device frame rate are **not verified**. These are original procedural game assets and effects, not imported Luigi's Mansion content, full cloth physics, real-time mirror reflections or production facial animation. Very large architecture chunks still depend on Forge's export quality and should be optimized there.

The shared starting Hall now has a brass-framed, labeled MAIN HOUSE doorway at its ground-floor entrance. Walk up to its threshold to enter the selected CASA directly, or use the nearby entrance menu. The destination is the CASA’s validated authored entry; older packages fall back to a prepared accessible arrival. Entry orientation follows the authored door wall. A return-to-Hall interaction is available at the house entry when it does not overlap a higher-priority quest or elevator interaction. Physical threshold entry is tested for all three samples, independently of the elevator.


## Optional USB controller

Click **Controller setup** on the landing screen (or **Controller** while playing). Plug in the controller, focus the game tab, and press a controller button so the browser can expose it. Standard pads use D-pad/left stick for walking and turning, the first face button for interact/confirm, the second for back, Start for pause, and other face buttons for camera/map. Generic USB/Nintendo-style layouts can differ: use **Remap** for each action and press its desired button or direction. Bindings are saved per device on this browser. Unassigned optional actions remain available by keyboard/touch. The menu supports directional selection, confirm and back.

Controller input is optional. Keyboard/touch remain active; analog input has a dead zone, menu navigation has bounded repeat, actions fire once per press, and movement releases on blur/disconnection/disable. The browser must expose the device through Gamepad API over HTTPS. Exact Mac/controller compatibility depends on the device, OS and browser; this code does not install drivers or promise that every USB replica will be recognized. Hardware testing with the user's controller has not been performed. Five simulated-controller tests cover standard/generic maps, remapping persistence, menus, focus/disconnection and unsupported API behavior.

Porch invitations now ask “Do you dare to enter ‘House Name’?” with Yes/No controls. Yes (or E / controller confirm) enters; No (or N / controller back) keeps the player outside and dismisses the invitation until they leave and return to the porch. Other interactions retain their existing controls.

Street gate fix: replace the old solid 2.7 m × 2.1 m gate placeholder with paired narrow posts and open iron leaves along the sides of the entry path. A real Three.js ray test checks that no panel crosses either porch approach; posts retain collision. These sample CASAs contain QA wall/trim/roof geometry rather than a finished dedicated exterior façade. Their supplied previews copy floor 0; the compiled-geometry fallback displays the complete building but does not manufacture missing architectural detail.

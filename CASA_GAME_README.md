# Black Hollow · current Game

Open the site's root URL or `casa_game.html`. Choose **The Unwritten Night** for eight different haunting systems or **Trick or Treat** for the timed outdoor game. Entering a mansion begins in its authored rooms. Existing original investigation saves can be explicitly resumed from the field journal; they are never silently substituted for a new haunting.

## Houses and progress

The Game accepts compiled `.casa` archives, not `.haunt` blueprints. Use House Office's Forge to prepare blueprints. Published houses are available to everyone; Game imports are local to this browser/device and do not upload files. The file validator limits each CASA to 128 MiB. Class-sized selections import sequentially, report failures individually, and retain valid houses even if another file fails. Browser storage can fail; session-only copies are identified in the result.

The House versions controls explain which local copies override a published mansion. Remove the local override to restore the public version. The Game validates archive paths, hashes where available, CRCs, navigation and access contracts before loading. An obsolete package missing a required contract must be recompiled in Forge.

Hauntings can be left and resumed. Finishing one allows another to be awakened in the same house. Relics affect later hauntings. Eight different families awaken the Ninth Door at the crossroads; both endings count, including compatible earlier saved endings. The street and field journal remember progress locally. There is no cross-device account sync.

## Movement and accessibility

W/S walk, A/D turn, drag to look, V changes camera, E interacts, M opens the map/field journal, Escape pauses. Touch controls and optional remappable USB controllers are supported. Each house keeps its architecture, collision, doors, stairs and physical elevators. Enter a cabin before selecting a destination. Unsupported authored stairs have explicit elevator fallbacks.

Sound and voices are separate controls. Muting sound cancels recorded effects and scheduled generated cues; a hidden tab silences them and pauses play. Reduced motion disables lightning, freezes the Ninth Door's procedural sky and opens its door without animation. Gentle pace provides longer loops and lower pressure.

## Rendering and deployment

Only nearby street house previews load. House floors stream within a bounded window; aligned supported stairs may retain two floors during crossing. The reusable Hall and Conservatory are independent scenes. The drawing buffer stays near 1280×720, including after resizing. Decorative lights share a bounded nearby light pool; these are budgets rather than guaranteed device frame rates.

GitHub Pages catalogs prepared `.casa` files from `casa_game/samples` and `casa_game/houses`. The Game never converts a source blueprint during play. Compilation and publication happen in [House Office](casa_admin.html). The retired standalone v8 engine is archived in the repository and excluded from deployment.

Run `npm test` and `npm run test:browser`. The browser matrix checks actual WebGL rendering, both current and classic-save flows, physical stairs/elevators, town consequences, audio lifecycle, root routing and 34-house imports. Historical v8 source checks run separately with `npm run test:legacy`.

# The street remembers

An optional town-wide story connects The Unwritten Night's eight haunting families. Each completed ending wakes one family seal on a physical Ninth Door at the crossroads. Both endings count; replaying a completed mansion can supply another family. No student needs eight separate blueprints, and no mansion or existing mode is locked behind the finale.

The field journal and street map list the eight seals and current house memories. Mailboxes explain the latest remembered ending. Shared instanced lanterns, rings, and leaf-like traces mark completed houses; alternate choices change the traces' brightness and composition. New records use stable mansion IDs, so renaming a house does not lose its memory. Older records fall back to the original house name.

After all eight seals awaken, the physical door offers two persistent town endings: let the street see morning, or keep an open, welcoming night. Opening the door reveals a procedural sky. Fog and background colors preserve the chosen atmosphere on return; houses and new hauntings stay playable. These are scenery and story consequences, not a new traversable district.

Existing v1 chronicles migrate their family seals from saved history. Seals persist separately from the bounded 128-entry ending journal. A street fate can only be selected once and only after all eight families have been witnessed. Storage failure retains a usable session and reports that the choice cannot be saved. Progress is local to the browser/device.

Reduced motion opens the door immediately and freezes the procedural sky. The addition uses no new lights, no fetched textures, and shares geometry/materials across house aftermath traces. It does not modify Forge geometry, public house archives, navigation routes, or the batch publication pipeline.

Validation: `npm test` includes 116 core tests plus real-scene integration of eight haunting endings into the physical door and saved street fate, with shipped and freshly compiled CASA packages. `node tests/browser-street-memory.mjs` checks locked/unlocked UI, both finales, real WebGL rendering, reduced motion and reload persistence; screenshots are produced in CI artifacts.

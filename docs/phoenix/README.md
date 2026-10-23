# Black Hollow: The Unwritten Night

The default game now begins inside the authored house. The repeated ghost → Founder → Seer → three keepsakes → thirteen memories progression is replaced by eight different rule systems. Original investigation saves use their existing key and can be resumed from the field journal; the new game has separate versioned saves. Trick or Treat remains available.

| Haunting | What the player does | Actual turning point |
| --- | --- | --- |
| The House That Watches | Move during dreaming windows; remain still to seal three wards | Give the watching light a keeper, or carry it away |
| The Choir Beneath the Floor | Learn a spatial note sequence and sound the physical bells | The answering phrase reverses the sequence; choose a reply or silence |
| The Last Small Light | Guide a companion following the player's breadcrumbs; wait to restore its light; reach havens | Give the guest a home or open the road |
| The Minute That Won’t Die | Stop clocks in an engraved order before time folds | The last stopped clock survives each fold; preserve the minute or allow tomorrow |
| A Supper for Four Shadows | Compare three physical observations against a seating ledger; identify the contradiction | Invite or dismiss the uninvited guest |
| The Shop of Borrowed Tomorrows | Read receipts, manage favors and debts, negotiate or burn a witnessed contract | Sign a fair release or free the broker |
| The Collector Is Coming Home | Choose which cabinets to rob; hide to lower a rising alarm; decide when to extract | Keep your prizes or return them to free a captive name |
| The Greenhouse That Eats the Moon | Read plants' needs, supply water/light/quiet and refill at a cistern | The last appetite changes with the moon; release a new sky or keep a seed |

## Variation and progression

The street scheduler uses every family before repeating, avoids the previous three families, and remains balanced across a 33-house visit sequence. New hauntings combine a family, seed, safe object placements, a pressure temperament and choice-dependent endings. This is a finite authored system, not a claim of unlimited procedurally written stories.

A saved haunting retains its seed and rules. “Awaken a different haunting” at a completed threshold creates a new run. Leaving an unfinished house preserves it. Each ending awards one persistent relic; a run cannot award twice. One relic can be equipped for future houses: shorter watch windows, slower Collector alarm, an available map, or a once-per-run recovery bell. The journal records the last 128 endings and keeps the last eight visible.

## Playability and accessibility

Encounters use verified room standing points and checked route points. Stair rooms, locked floors, furniture collision and elevator boarding zones are excluded. Small houses borrow ground-level hall anchors rather than placing objects inside walls. The house's original architecture, room travel and physical elevators remain in use. Floor 13 is optional after completion.

Live status uses words, numerals and a meter; color and audio are supplementary. Quiet holds take place in the world; moving cancels them. Pause, hidden-tab and cabin time do not advance the rule engines. Gentle pace lengthens loops and reduces pressure. Missteps permit recovery rather than losing the entire investigation. The companion follows recorded player positions; scene transitions carry it through the same portal. Light failure rekindles it rather than leaving an unreachable guest.

## Validation

- `npm test`: original core/scene checks plus 25 new gameplay tests, both endings of eight families across three shipped CASA layouts, and actual-app UI playthroughs of all eight families with published and freshly compiled houses.
- `node tests/browser-phoenix.mjs`: real WebGL startup, physical props, rule HUD, eight UI endings, timed holds, journal, saved completion and mobile overflow check; screenshots and resource counts in `tests/artifacts`.
- The browser escort check includes a keyboard walk between hall havens and waits for the companion to follow. Portal/elevator arrival carries the companion through the same transition; floor traversal continues along the player’s recorded breadcrumbs. Engine checks also cover distance-gated shelter, fading and recovery.
- GPU resource counts and software WebGL output do not establish hardware frame rate or subjective horror quality. In-person playtesting still matters, especially on student Chromebooks.

The original browser suites for classic quest behavior explicitly request `classic:true`; geometry, room, stair and new Phoenix checks also exercise the new default entry point. No renderer appearance is inferred from the simulated-DOM flow suite.

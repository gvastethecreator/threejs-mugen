# T290: Model FightScreen announcement phases

- Type: task
- Status: resolved at bounded phase-clock scope
- Date: 2026-07-18
- Entry: 564
- Depends on: T289

## Question

How can the runtime expose source-shaped Round/Fight announcement ownership
without pretending that AIR/FNT asset completion or skip flags are implemented?

## Answer

Own a resettable `RuntimeRoundAnnouncementWorld` inside `RuntimeRoundSystem`.
It starts hidden, pauses while intro or shutter is active, starts the Round
track once the gate opens, delays Fight by `callfight.time`, and exposes exact
sound-edge candidates from the imported `*.sndtime` values. Snapshot completion
stays explicitly `asset-owned` because the source waits for animation end.

No `SkipRoundDisplay`/`SkipFightDisplay` mutation, FNT/AIR drawing, or audio
playback belongs in this ticket.

## Evidence boundary

- Pinned Ikemen source `.scratch/external/Ikemen-GO/src/fightscreen.go:3434-3467`
  blocks announcement work during shutter.
- Pinned Ikemen source `.scratch/external/Ikemen-GO/src/fightscreen.go:3490-3632`
  owns Round/Fight phase timers, sound edges, and completion checks.
- The transport contract is delivered by T289 in `9b6e32d9`.

## Next

T291 may consume the snapshot in the existing HUD as a visible fallback.
Asset-backed FightScreen display, audio routing, explicit global skip flags,
dialogue, motif/localcoord, and full parity remain separate.

# T313: Connect FightScreen outcome timing

- Type: task
- Status: resolved at bounded outcome timing and sound-edge scope
- Date: 2026-07-20
- Depends on: T312

## Question

How should imported `ko.time`, `dko.time`, `to.time`, `win.time`, and their
sound times reach the terminal FightScreen path without taking ownership of
the full round-outro state machine?

## Answer

The runtime now carries a typed `RuntimeRoundOutcome/v0` snapshot inside
`postRound`. It records the selected family, display start frame, sound frame,
one-shot sound edge, and the imported `dko.showdraw` decision.

The imported `fight.def` timing adapter preserves source defaults:

- Double KO and Time Over timing fall back to the KO timing when omitted.
- The winner display uses `win.time` and `win.sndtime` for the bounded Draw
  family route.
- Display-level sounds use the `fs` archive and follow the same fallback as
  the selected display asset.

The renderer keeps terminal assets hidden until `displayStartFrame`, then
reuses the T312 display path. `MugenAudioSystem` consumes the snapshot sound
edge once and keeps the existing archive and dedup rules.

## Evidence

- Focused Runtime, audio, FightScreen, and PlayableMatchRuntime tests: 4 files
  / 316 tests passed.
- The focused runtime test covers KO timing, KO sound edge, Draw timing, and
  `showDraw` transport.
- The focused renderer test covers the pending-to-active display boundary.
- `pnpm typecheck`: passed after the feature changes.
- Full tests, build, trace, smoke, and capture review are recorded in the
  global checkpoint after this ticket.

## Claim ceiling

Allowed: source timing reaches a typed terminal snapshot, terminal display
presentation waits for its bounded start frame, and selected `fs` sound data
plays once at its source timing edge.

Blocked: exact MUGEN legacy delay, full `handleRoundOutro` phase order,
separate KO and winner display phases, winner-specific `win`/AI assets,
complete `dko.showdraw` winner routing, skip flags, dialogue/motif ownership,
direct imported screenpack browser proof, and full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/fightscreen.go` and
  `.scratch/external/Ikemen-GO/src/common.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

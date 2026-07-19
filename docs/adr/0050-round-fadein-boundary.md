# ADR 0050: Bounded FightScreen Round-Start Fade-In

## Status

Accepted for bounded runtime and presentation evidence. 2026-07-18.

## Context

ADR 0049 carried imported FightScreen fade-out assets and sound through the
terminal round snapshot. IKEMEN initializes the fade-in at the round boundary,
steps it independently of actors, and gives the animation duration precedence
over color fade time when an AIR action is present.

## Decision

- Parse non-negative `fadein.anim` and `fadein.snd`, plus imported time and
  color, from `[Round]` timing.
- Resolve the referenced FightFX AIR action after package loading and derive a
  bounded pre-round duration from color or animation length.
- Publish optional `RuntimePreRound/v0` with additive `RuntimeRoundFade/v0`
  metadata and explicit `direction: "in"`.
- Reset the pre-round frame on runtime reset and `startNextRound`.
- Prefer resolved AIR/SFF presentation and retain a reverse-opacity color
  fallback with renderer diagnostics when the asset is unavailable.
- Route global fade-in sound through the prefixed FightFX archive with
  per-round/direction deduplication.

## Consequences

Imported packages can present a bounded round-start fade without coupling the
round core to Three.js or actor-owned audio. The pre-round state remains
optional, so source-less/demo rounds preserve their existing snapshot shape.
Missing assets remain visible through a deterministic fallback and diagnostic.

## Rejected scope

Exact intro/shutter/frame-start ordering, timer/input gating, motif/localcoord,
dialogue, skip and `RoundNoSkip`, Common1/ZSS, Teams/Turns, rollback/netplay,
score changes, and full MUGEN/IKEMEN parity remain separate gates.

## Evidence

- Implementation: `src/mugen/loader/MugenSystemAssetsLoader.ts`,
  `src/mugen/runtime/RuntimeRoundSystem.ts`,
  `src/game/render/ThreeMugenRenderer.ts`, and
  `src/game/audio/MugenAudioSystem.ts`.
- Commit: `c688f04d`.
- Sources: [pinned IKEMEN FightScreen source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go),
  [pinned round-state step](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3114-L3268),
  and local `.scratch/external/Ikemen-GO/src/rect.go`.
- Grouped checkpoint: 233 test files / 2479 tests, TypeScript 7, build,
  633/633 traces, boundaries, CSS budget, and 64-path browser smoke passed
  with zero console/page errors.

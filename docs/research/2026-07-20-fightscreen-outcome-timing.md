# Research: FightScreen outcome timing

Date: 2026-07-20

## Question

Which timing facts from IKEMEN's round outro can the current runtime carry
without claiming the complete `handleRoundOutro` implementation?

## Findings

- `readFightScreenRound` reads KO timing and sound timing first, then defaults
  Double KO and Time Over timing to the KO values before reading their
  overrides.
- `handleRoundOutro` calls the KO screen timer with `elapsed >= time + delay`
  and the sound edge at `elapsed == sndtime + delay`.
- The source applies a ten-frame legacy MUGEN delay to the KO screen. IKEMEN
  skips that branch. The current slice transports the configured source time
  and leaves the compatibility-specific delay open.
- The source uses `win.time` and `win.sndtime` for the Draw winner display as
  well as winner result text. The current terminal family route uses those
  fields for its bounded Draw start and sound edge.
- `dko.showdraw` controls whether the source enters the Draw winner display
  after a Double KO. The current snapshot carries this boolean for the next
  phase slice while the existing renderer keeps one selected terminal family.
- Source `AnimTextSnd` sound references belong to the FightScreen archive. The
  port maps selected outcome sounds to the existing `fs` archive and applies
  the same one-shot key used by Round/Fight announcement sounds.

## Port decision

- Add `RuntimeRoundOutcome/v0` under `postRound` with family, display start,
  sound time, sound edge, and `showDraw`.
- Derive the family from the existing terminal round state and winner, while
  allowing the runtime snapshot to be the source of the selected kind.
- Keep the renderer pending until the imported display start frame.
- Use `win.time`/`win.sndtime` for the current Draw family route and preserve
  source display fallback for missing Double KO, Time Over, or Draw assets.
- Keep complete winner phases, legacy delay, and `dko.showdraw` transition
  choreography as separate slices.

## Uncertainty and next boundary

The timing transport is source-backed and tested with synthetic snapshots and
runtime integration. The route still compresses the source KO and winner
phases into one terminal family selection. The next boundary is a separate
winner display contract with explicit phase transitions and source skip
ownership, backed by direct imported screenpack assets.

## Evidence

- Focused Runtime, audio, FightScreen, and PlayableMatchRuntime tests pass:
  4 files / 316 tests.
- TypeScript 7 typecheck passes for the changed runtime, audio, and renderer
  paths.
- Full tests, build, trace, smoke, and capture review are recorded in the
  global checkpoint after T313.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/fightscreen.go` and
  `.scratch/external/Ikemen-GO/src/common.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

# T316 - FightScreen result runtime context

Status: resolved at bounded runtime-selection scope
Date: 2026-07-20

## Source evidence

Ikemen-GO chooses the winner result from the active team and simulation slot.
It checks whether the winning and losing teams contain player-controlled
actors, selects `ai.win` when a player loses to an AI opponent, selects
`ai.lose` when a player wins against an AI opponent, and otherwise selects the
default `win` family. AI result text is drawn on the human side. The source
also uses the same `win.sndtime` window for the selected result sound.

Pinned source:

- `src/fightscreen.go`, revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`
- `FightScreenRound.update` winner announcement branch
- `src/system.go`, `winType` ownership remains a later boundary

## Delivered

- Added `RuntimeRoundWinnerDisplaySelection/v0` to the winner-display
  snapshot.
- Carried result family, active side, and bounded simulation variant through
  `RuntimeRoundSystem`.
- Added optional participant context for player-controlled state and variant
  selection while keeping existing callers compatible.
- Carried per-family, per-variant, per-side `fs` sound matrices through
  `RuntimeRoundOutcomeTiming`.
- Mapped FightScreen result asset sounds into runtime timing and used the
  selected sound edge in the existing audio path.
- Updated renderer selection to consume the runtime family and side.
- Added runtime, renderer, and timing regression tests.

## Verification

- Focused Runtime, renderer, loader, audio, and PlayableMatchRuntime suites:
  5 files / 322 tests passed.
- `pnpm typecheck` passed with the repository TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

The context is optional so legacy and synthetic callers retain the default
`win` route. `PlayableMatchRuntime` publishes p1/p2 side order but does not yet
derive AI level, team member counts, or exact source `numSimul` state. This
ticket does not close `winType`, perfect, clutch, team result arrays, source
release order, or direct imported screenpack browser proof.

## Next boundary

Model source win-type families (`p1.n`, `p1.s`, `p1.h`, perfect, clutch, and
the p2 counterparts) as a separate display contract, then connect the result
type to the runtime only when its source state is available.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`

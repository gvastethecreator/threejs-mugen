# T314: Model FightScreen winner display phase

- Type: task
- Status: resolved at bounded winner and drawgame phase scope
- Date: 2026-07-20
- Depends on: T313

## Question

How should the imported runtime separate the terminal KO/Time Over display
from the later winner or Draw display?

## Answer

The display contract now exposes a bounded `win` asset beside the existing
`draw` asset. `RuntimeRoundOutcome/v0` carries an optional
`RuntimeRoundWinnerDisplay/v0` child with its kind, phase, start frame, sound
frame, sound edge, and selected `fs` sound.

The runtime starts the winner phase after the imported `over.waittime` plus
`win.time` boundary. It selects:

- `win` for a named KO or Time Over winner
- `draw` for Time Over Draw
- `draw` for Double KO only when `dko.showdraw` is true
- no winner phase for Double KO when `dko.showdraw` is false

The renderer presents the terminal family while the winner phase is pending,
then switches to the winner asset when available. Audio follows the active
winner sound edge and keeps the existing one-shot archive key.

## Evidence

- Focused Runtime and FightScreen tests: 2 files / 30 tests passed after the
  phase additions.
- Earlier T314 focal Runtime, audio, FightScreen, loader, and
  PlayableMatchRuntime run: 5 files / 320 tests passed.
- `pnpm typecheck`: passed after the phase additions.
- Full tests, build, trace, smoke, and capture review are recorded in the
  global checkpoint after this ticket.

## Claim ceiling

Allowed: typed winner/draw phase transport, `dko.showdraw` gating, bounded
`win`/`draw` asset loading, phase-aware renderer selection, and one-shot
winner sound routing.

Blocked: source `p1/p2`, `win2`/`win3`/`win4`, AI win/lose, perfect and other
win-type assets, exact source `sys.intro` ordering, skip flags, full result
selection, direct imported screenpack browser proof, and full MUGEN/IKEMEN
parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/fightscreen.go` and
  `.scratch/external/Ikemen-GO/src/common.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

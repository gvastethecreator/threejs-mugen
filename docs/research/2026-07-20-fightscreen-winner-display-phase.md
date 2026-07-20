# Research: FightScreen winner display phase

Date: 2026-07-20

## Question

What source boundary separates the KO/Time Over screen from `drawgame` and
winner result text?

## Findings

- IKEMEN reads `win.time` and `win.sndtime` separately from KO, Double KO,
  and Time Over timing.
- `handleRoundOutro` keeps the KO display and winner display timers separate.
  Winner processing starts after the `over.waittime` condition, then advances
  the Draw or result `AnimTextSnd` with the Win timing.
- A Time Over Draw enters `drawgame`. A Double KO enters `drawgame` only when
  `dko.showdraw` is true.
- Named winner results use the source `win`/`ai.win`/`ai.lose` result arrays,
  with p1/p2 and suffix variants. Perfect and other win types run through a
  separate `winType` table.
- The current runtime already exposes the terminal round state, winner, and
  post-round frame. That supports a bounded phase snapshot while keeping full
  source result selection open.

## Port decision

- Add a generic `win` display asset as the first result-display contract.
- Add `RuntimeRoundWinnerDisplay/v0` under `postRound.outcome`.
- Start that phase at `over.waittime + win.time` in the current frame model.
- Select `draw` for Time Over Draw and Double KO with `showDraw`; select `win`
  for named winners.
- Keep the terminal display active until the winner asset becomes active or
  until the existing terminal asset completes. Preserve source-specific result
  arrays as a separate loader and selection lane.
- Route winner and Draw sounds through the existing `fs` archive and dedup
  key.

## Uncertainty and next boundary

The phase split follows the pinned source structure, while the exact `sys.intro`
counter and result-team selection remain outside this slice. The next useful
boundary is typed p1/p2 result arrays with AI win/lose precedence, followed by
direct screenpack browser evidence.

## Evidence

- Focused Runtime and FightScreen tests pass: 2 files / 30 tests after the
  phase additions.
- Earlier T314 focal Runtime, audio, FightScreen, loader, and
  PlayableMatchRuntime run passes: 5 files / 320 tests.
- TypeScript 7 typecheck passes for the changed phase path.
- Full tests, build, trace, smoke, and capture review are recorded in the
  global checkpoint after T314.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933/src/common.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/fightscreen.go` and
  `.scratch/external/Ikemen-GO/src/common.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

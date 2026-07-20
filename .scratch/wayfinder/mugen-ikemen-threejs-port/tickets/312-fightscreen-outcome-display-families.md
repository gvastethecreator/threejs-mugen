# T312: Present FightScreen outcome display families

- Type: task
- Status: resolved at bounded outcome-selection and display-contract scope
- Date: 2026-07-20
- Depends on: T311

## Question

Which source-defined FightScreen display families should the imported asset
contract expose after the Round/Fight announcement path?

## Answer

The system asset model now carries `ko`, `dko`, `to`, and `draw` display
definitions. The loader also records their source timing fields, plus the
bounded `win.time` and `win.sndtime` values, without claiming that the runtime
owns the complete outro sequence.

The renderer keeps a visible Round/Fight announcement as the first selection.
After that phase closes, it derives one terminal family from the existing
round snapshot:

- `ko` for a KO with a named winner
- `double-ko` for a KO whose winner is `Draw`
- `time-over` for a time-over with a named winner
- `draw` for a time-over whose winner is `Draw`

The selected terminal asset reuses the shared AIR, FSText, top, background,
transform, clipping, and animation-completion paths from T311. A `dko` asset
falls back to `ko`, and a `draw` asset falls back to `to`, so incomplete
screenpack definitions remain diagnosable and renderable within the bounded
route.

## Evidence

- Focused loader and FightScreen renderer tests: 2 files / 12 tests passed.
- The focused renderer test covers KO rendering and all four terminal-family
  selection results.
- `pnpm typecheck`: passed after the feature changes.
- Full tests, build, smoke, and capture review are recorded in the global
  checkpoint after this ticket.

## Claim ceiling

Allowed: typed loading and bounded presentation of KO, Double KO, Time Over,
and Draw display definitions from the existing terminal round snapshot;
shared transforms, windows, layer entries, FNT text, and AIR assets continue
to use the T311 renderer path.

Blocked: exact `handleRoundOutro` delay and phase order, `dko.showdraw`
ownership, `win` and winner-specific display assets, dialogue/motif routing,
source-complete timing consumption, direct imported screenpack browser proof,
and full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/fightscreen.go`,
  `.scratch/external/Ikemen-GO/src/common.go`, and
  `.scratch/external/Ikemen-GO/src/system.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

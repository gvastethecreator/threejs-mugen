# T296: Carry FightScreen AnimTextSnd completion

- Type: task
- Status: resolved at source-derived completion scope
- Date: 2026-07-18
- Depends on: T295

## Question

How should FightScreen Round/Fight visibility stop when IKEMEN's `AnimTextSnd.End`
reports the selected animation, text/sound asset, and `round.default` boundary
as complete?

## Answer

Model the source End boundary as a renderer frame threshold. A non-negative
`displaytime` wins over AIR duration; otherwise finite AIR uses its authored
positive frame durations, and a terminal `-1` frame is treated as the source
terminal sentinel rather than a one-frame loop. Round completion combines the
selected numbered/single/final asset with `round.default`, matching the source
`End` conjunction. The derived threshold is carried in
`RuntimeRoundAnnouncementTiming/v0`, exposed on each track snapshot, used to
hide completed phases, and reported by the Three.js renderer diagnostics.

## Evidence

- Focused gate: 6 files, 329 tests passed.
- TypeScript 7 typecheck passed.
- Broad checkpoint before this slice: 235 files / 2502 tests, 633/633 trace
  artifacts, build, boundaries, CSS budget, and browser smoke diagnostics with
  zero console/page errors.
- Pinned source inspection: `AnimTextSnd.End` in `common.go` and the Round/Fight
  conjunctions in `fightscreen.go`.

## Claim ceiling

This proves source-derived End thresholds and phase/diagnostic visibility for
the bounded AIR path. It does not prove FNT loading/rasterization, exact
post-Action frame selection for every negative-duration edge, top/background
layers, palette effects, motif inheritance, dialogue, pause/rollback
persistence, or full MUGEN/IKEMEN visual parity.

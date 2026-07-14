# Progress Report: Exact Red-life Round Reset

## Delivered

Entry 516 adds the first explicit multi-round transition to the playable
runtime. A completed round can now start a numbered next round through the
runtime API, UI toolbar, or command palette. The transition clears root
red-life, restores life, carries bounded power/guard/dizzy resources, preserves
variables and match tick continuity, and keeps `reset()` as the full-match
restart path.

The required imported trace writes red-life before a lethal HitDef, observes
the bounded post-KO timeline, starts round 2, and proves the zero red-life
result without producing an incomplete tick schedule.

## Evidence

- Resource/reset and round/trace focal suites: 592 tests passed.
- Playable runtime and trace preset focal suites: 778 tests passed.
- TypeScript 7, build, boundaries, CSS budget, and `git diff --check`: passed.
- Trace corpus: 598/598 artifacts passed, 564 required and 34 optional.
- Browser smoke: passed on desktop/mobile runtime and Studio.
- Diagnostics: `.scratch/qa/qa-smoke-round-redlife/diagnostics.json`.

## Claim Ceiling

The project now has a verified red-life reset boundary, not full tournament
round parity. Match-over adjudication, official state 5900 choreography,
screenpack/motif timing, complete variable/map/remap persistence,
rollback/netplay, and full MUGEN/IKEMEN parity remain open.

## Next

Close round outcome/match-over ownership and exact state-transition sequencing
as separate evidence gates before adding further HUD or Studio claims.

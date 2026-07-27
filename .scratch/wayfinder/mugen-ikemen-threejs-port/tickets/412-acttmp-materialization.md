# T412 IKEMEN `acttmp` materialization

Type: task

Status: resolved bounded in `ce6e2b81`

Blocked by: None

## Question

Can the local runtime carry the source `actionPrepare`/`actionRun` `acttmp`
signal through root fighter advance and pause bridges?

## Answer

Yes, for the shared root path. `CharacterRuntimeState` now has typed
`actTmp` state. The advance world seeds it before mutation and finishes it
after mutation. Live pause state and actor hitpause state select the same
source adjustments for active and paused roots. The local `-3` edge records the
source arithmetic when both signals are active.

## In scope

- Typed `actTmp` state and a named system.
- Source-shaped prepare and finish arithmetic.
- Active root and paused root advance integration.
- Focused ordering and pause/hitpause tests.
- Research, roadmap, and backlog updates.

## Out of scope

- The normal match branch that bypasses fighter advance during global hitpause.
- Helper action timing and action state snapshots.
- `stchtmp`, camera movement, state-change persistence, and exact scheduler
  order.
- MUGEN branch, teams/clashes, global checkpoint, scores, and full parity.

## Evidence

- Commit: `ce6e2b81`.
- Focused closure: 4 files / 328 tests passed.
- `node --check scripts/qa_traces.cjs` passed.
- `git diff --check` passed.
- Broad typecheck remains blocked only by the pre-existing unused `advanced` at
  `src/mugen/da32/ClauseAdjudicationSample.ts:149`.

## Source

Pinned Ikemen-GO commit:
`4aa0ba38f851c52549ba182310e9e53361cd472a`.
See [the research note](../../../../docs/research/2026-07-27-ikemen-acttmp-materialization.md)
for official source links and the claim ceiling.

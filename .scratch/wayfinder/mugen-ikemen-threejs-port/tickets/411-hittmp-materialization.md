# T411 IKEMEN `hittmp` materialization

Type: task

Status: resolved bounded in `9d58730c`

Blocked by: None

## Question

Can the local runtime materialize IKEMEN `hittmp` before extending the larger
`acttmp`, `stchtmp`, and pause lifecycle?

## Answer

Yes, for the bounded root and admission slice. `CharacterRuntimeState` now has
typed `hitTmp` values `-1|0|1|2`. Normal roots synchronize `0`, `1`, and `2`
after fighter advance. ReversalDef marks the reversed actor with `-1` when the
prior value is idle. HitFlag, direct air-juggle, and Projectile air-juggle
consumers read the explicit value with a compatibility fallback for older
fixtures.

## In scope

- Typed `hitTmp` state and a named synchronization system.
- Root fighter advance integration before post-fighter combat.
- HitFlag consumption with explicit-field precedence.
- IKEMEN direct and Projectile `hittmp < 2` air-juggle admission.
- ReversalDef `-1` marking.
- Focused tests, research, roadmap, and backlog updates.

## Out of scope

- Exact `acttmp` pause and hitpause lifecycle.
- `stchtmp`, state-entry reset rules, and source scheduler parity.
- Full ReversalDef lifecycle beyond the accepted marker.
- Custom-state and active Helper synchronization.
- MUGEN branch, teams/clashes, target-list transfer, global checkpoint,
  scores, and full parity.

## Evidence

- Commit: `9d58730c`.
- Focused closure: 7 files / 105 tests passed.
- `node --check scripts/qa_traces.cjs` passed.
- `git diff --check` passed.
- Broad typecheck remains blocked only by the pre-existing unused `advanced` at
  `src/mugen/da32/ClauseAdjudicationSample.ts:149`.

## Source

Pinned Ikemen-GO commit:
`4aa0ba38f851c52549ba182310e9e53361cd472a`.
See [the research note](../../../../docs/research/2026-07-27-ikemen-hittmp-materialization.md)
for official source links and the claim ceiling.

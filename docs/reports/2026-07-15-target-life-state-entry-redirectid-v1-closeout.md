# TargetLifeAdd state-entry RedirectID v1 closeout

Date: 2026-07-15

## Status

Implemented and verified as a bounded root-only IKEMEN compatibility slice.
Runtime commit: `d4ef5c3a`.

## Delivered behavior

Imported State -1 setup now admits `TargetLifeAdd` as a target side effect.
When `RedirectID` resolves to a live root PlayerID, the destination's
remembered target receives the typed life mutation while the caller retains its
own target memory and authored expression context. Missing RedirectID remains
local; invalid or unavailable destinations fail closed before mutation.

The route is profile-gated to `ikemen-go` and limited to live root fighters.
Both `absolute` and `kill` are preserved in the typed operation contract.

## Evidence

- Targeted focal: 3 selected tests passed.
- Affected runtime suites: 4 files, 867/867 tests passed.
- TypeScript 7 check: `pnpm typecheck` passed.
- Trace runner syntax: `node --check scripts/qa_traces.cjs` passed.
- Diff hygiene: `git diff --check` passed.
- Full trace QA: `pnpm qa:trace` passed 613/613 artifacts.
- Required/optional split: 579 required, 34 optional, 0 skipped.
- Required artifact: `synthetic-imported-target-life-state-entry-redirect`.
- Required checksum: `2e4c8c1b`; final checksum: `27ae97de`.

The golden trace proves both target links, one `TargetLifeAdd` controller and
operation, PlayerID 56 destination ownership, target id 77, and final p1/p2
life values `1000/980`. No score movement or browser smoke is claimed.

## Audit

The change was reviewed across state-program classification, State -1 setup
scheduling, root PlayerID resolution, target-world dispatch, typed life fields,
telemetry, the required trace registry, and focused tests. No unrelated
worktree changes were staged in the runtime commit.

## Next boundary

Select the next independent `Target*` family boundary. Active-state life,
helper/projectile ownership, neutral identity, team/simul aggregation,
persistent timing, rollback/netplay, presentation, score movement, and full
parity remain open.

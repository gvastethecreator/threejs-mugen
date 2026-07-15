# TargetPowerAdd state-entry RedirectID v1 closeout

Date: 2026-07-15

## Status

Implemented and verified as a bounded root-only IKEMEN compatibility slice.
Runtime commit: `84af42f0`.

## Delivered behavior

Imported State -1 setup now admits `TargetPowerAdd` as a target side effect.
When `RedirectID` resolves to a live root PlayerID, the destination's
remembered target receives the power mutation while the caller retains the
authored value and RedirectID expression context. Missing RedirectID remains
local; invalid or unavailable destinations fail closed before mutation.

The route is profile-gated to `ikemen-go` and limited to live root fighters.

## Evidence

- Targeted focal: 6 selected tests passed.
- Affected runtime suites: 3 files, 814/814 tests passed.
- TypeScript 7 check: `pnpm typecheck` passed.
- Trace runner syntax: `node --check scripts/qa_traces.cjs` passed.
- Diff hygiene: `git diff --check` passed.
- Full trace QA: `pnpm qa:trace` passed 611/611 artifacts.
- Required/optional split: 577 required, 34 optional, 0 skipped.
- Required artifact: `synthetic-imported-target-power-state-entry-redirect`.
- Required checksum: `e531fcdc`.

The golden trace proves both target links, one `TargetPowerAdd` controller and
operation, PlayerID 56 destination ownership, target id 77, and final p1/p2
power values 35/110. No score movement or browser smoke is claimed.

## Audit

The change was reviewed across state-program classification, State -1 setup
scheduling, root PlayerID resolution, target-world dispatch, telemetry, the
required trace registry, and focused tests. No unrelated worktree changes were
staged in the runtime commit.

## Next boundary

Select the next independent Target* family boundary. Helper/projectile
ownership, neutral identity, team/simul aggregation, persistent timing,
rollback/netplay, presentation, score movement, and full parity remain open.
